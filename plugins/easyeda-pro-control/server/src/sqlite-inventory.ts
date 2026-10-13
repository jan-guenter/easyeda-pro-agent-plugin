/** Internal synthetic foundation. Does not authorize EasyEDA or source-file access. */
import { spawn } from "node:child_process";
import { constants } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { isAbsolute } from "node:path";
import { performance } from "node:perf_hooks";
import { openVerifiedMachineNode } from "./machine-profile.ts";
import type { MachineProfile, VerifiedMachineNode } from "./machine-profile.ts";
import { SQLITE_INVENTORY_PROGRAM } from "./sqlite-inventory-program.ts";
import { canonicalJson, record, sha256Json } from "./sqlite-inventory-json.ts";
import { MAX_ENCODED_BYTES, MAX_FILE_BYTES, freezeDeep, identity, noSidecars } from "./sqlite-inventory-core.ts";
import type { NativeSqlInventory as ExactSqlInventory, SqlCell, SqlRow, SqlScanInput, SqlSchemaProfile, SqlTable } from "./sqlite-inventory-core.ts";

export type { SqlCell, SqlRow, SqlSchemaProfile, SqlTable } from "./sqlite-inventory-core.ts";
export type NativeSqlInventory = ExactSqlInventory & Readonly<{ schemaProfileId: string }>;
const MAX_STDERR_BYTES = 16_384;
const TOTAL_DEADLINE_MS = 10_000;
const HASH = /^[a-f0-9]{64}$/u;
const inventories = new WeakSet<NativeSqlInventory>();
const completions = new WeakMap<ExactSqlInventory, ReaderCompletion>();
export interface ReaderCompletion {
  readonly observedChildClose: true;
  readonly exitCode: number | null;
  readonly exitSignal: NodeJS.Signals | null;
  readonly elapsedMs: number;
}
export class SqlReaderFailureError extends Error {
  public override name = "SqlReaderFailureError";
  public readonly completion: ReaderCompletion;
  public constructor(message: string, completion: ReaderCompletion) { super(message); this.completion = completion; }
}
function requireValue(condition: boolean, message: string): asserts condition {
  if (!condition) { throw new Error(message); }
}
function validCell(value: unknown): value is SqlCell {
  if (!record(value)) { return false; }
  if (value["kind"] === "null") { return Object.keys(value).length === 1; }
  if (Object.keys(value).length !== 2) { return false; }
  if (value["kind"] === "integer") { return typeof value["decimal"] === "string" && /^(?:0|-?[1-9][0-9]{0,18})$/u.test(value["decimal"]); }
  if (value["kind"] === "real") { return typeof value["ieee754le"] === "string" && /^[a-f0-9]{16}$/u.test(value["ieee754le"]); }
  return (value["kind"] === "text" || value["kind"] === "blob") && typeof value["hex"] === "string" && /^(?:[a-f0-9]{2})*$/u.test(value["hex"]);
}
function validRow(value: unknown): value is SqlRow {
  return record(value) && Object.keys(value).length === 2 && (value["rowid"] === null || validCell(value["rowid"])) &&
    Array.isArray(value["cells"]) && value["cells"].every(validCell);
}
function validTable(value: unknown): value is SqlTable {
  return record(value) && Object.keys(value).length === 6 && typeof value["name"] === "string" &&
    Array.isArray(value["columns"]) && value["columns"].every(record) && typeof value["withoutRowid"] === "boolean" &&
    typeof value["strict"] === "boolean" && Array.isArray(value["rows"]) && value["rows"].every(validRow) &&
    typeof value["sha256"] === "string" && HASH.test(value["sha256"]);
}
function validInventory(value: unknown): value is ExactSqlInventory {
  return record(value) && Object.keys(value).length === 7 && value["profile"] === "easyeda-pro-control.exact-sqlite-inventory.v2" &&
    typeof value["checkpointSha256"] === "string" && HASH.test(value["checkpointSha256"]) &&
    typeof value["schemaSha256"] === "string" && HASH.test(value["schemaSha256"]) &&
    typeof value["logicalSha256"] === "string" && HASH.test(value["logicalSha256"]) &&
    record(value["properties"]) && Object.values(value["properties"]).every((entry) => typeof entry === "string" || typeof entry === "number") &&
    Array.isArray(value["schema"]) && value["schema"].every((entry: unknown) => record(entry) && Object.keys(entry).length === 4 &&
      typeof entry["type"] === "string" && typeof entry["name"] === "string" && typeof entry["table"] === "string" &&
      (entry["sql"] === null || typeof entry["sql"] === "string")) &&
    Array.isArray(value["tables"]) && value["tables"].every(validTable);
}
function parseCompletedOutput(output: string, expectedSha256: string): ExactSqlInventory {
  const lines = output.split("\n");
  requireValue(lines.length === 3 && lines[0] === '{"phase":"scan-start"}' && lines[2] === "", "Reader protocol shape refused.");
  const result: unknown = JSON.parse(lines[1] ?? "");
  requireValue(record(result) && Object.keys(result).length === 1 && validInventory(result["inventory"]), "Reader inventory shape refused.");
  const value = result["inventory"];
  requireValue(value.checkpointSha256 === expectedSha256 && value.schemaSha256 === sha256Json(value.schema) &&
    value.logicalSha256 === sha256Json({ schema: value.schema, properties: value.properties, tables: value.tables }), "Reader inventory digest refused.");
  for (const table of value.tables) {
    const { sha256, ...body } = table;
    requireValue(sha256Json(body) === sha256, "Reader table digest refused.");
  }
  return freezeDeep(value);
}
function runReader(file: FileHandle, node: VerifiedMachineNode, input: SqlScanInput, scanDeadlineMs: number): Promise<Readonly<{
  inventory: ExactSqlInventory; completion: ReaderCompletion;
}>> {
  const started = performance.now();
  const request = JSON.stringify(input);
  requireValue(Buffer.byteLength(request) <= 8192, "Reader input exceeded its bound.");
  const { promise, resolve, reject } = Promise.withResolvers<Readonly<{ inventory: ExactSqlInventory; completion: ReaderCompletion }>>();
    // The executable and database are retained descriptors. Nothing is inherited
    // From execArgv or ambient NODE_OPTIONS; only this fixed source is evaluated.
    // ESM eval needs a live cwd even with only absolute inputs and builtin imports.
    // An official plugin upgrade can remove the facade's inherited package cwd.
    const child = spawn(node.descriptorPath, ["--max-old-space-size=192", "--input-type=module", "--eval", SQLITE_INVENTORY_PROGRAM], {
      cwd: "/", env: { NODE_NO_WARNINGS: "1" }, stdio: ["pipe", "pipe", "pipe", file.fd],
    });
    let refusal: string | undefined;
    let size = 0;
    let stderrSize = 0;
    const chunks: Buffer[] = [];
    let prefix = "";
    let scanStarted = false;
    let scanTimer: ReturnType<typeof setTimeout> | undefined;
    const stop = (message: string): void => {
      refusal ??= message;
      // Only our owned, read-only child is signalled, never any application.
      child.kill("SIGKILL");
    };
    const totalTimer = setTimeout(() => { stop("SQL reader total deadline exceeded."); }, TOTAL_DEADLINE_MS);
    child.on("error", () => { refusal ??= "SQL reader process failed."; });
    child.stdin?.on("error", () => { stop("SQL reader input pipe failed."); });
    child.stdout?.on("error", () => { stop("SQL reader output pipe failed."); });
    child.stderr?.on("error", () => { stop("SQL reader stderr pipe failed."); });
    child.stdout?.on("data", (raw: unknown) => {
      if (!Buffer.isBuffer(raw)) { stop("SQL reader output was not bytes."); return; }
      size += raw.length;
      if (size > MAX_ENCODED_BYTES + 1024) { stop("SQL reader output bound exceeded."); return; }
      chunks.push(raw);
      if (!scanStarted) {
        prefix += raw.toString("utf8");
        if (prefix.includes("\n")) {
          if (prefix.slice(0, prefix.indexOf("\n")) === '{"phase":"scan-start"}') {
            scanStarted = true;
            scanTimer = setTimeout(() => { stop("SQL reader scan deadline exceeded."); }, scanDeadlineMs);
          }
          prefix = "";
        }
      }
    });
    child.stderr?.on("data", (raw: unknown) => {
      if (!Buffer.isBuffer(raw)) { stop("SQL reader stderr was not bytes."); return; }
      stderrSize += raw.length;
      if (stderrSize > MAX_STDERR_BYTES) { stop("SQL reader stderr bound exceeded."); }
    });
    // Neither the timer nor an error resolves this Promise. Only close proves
    // That the owned child has exited and its stdio has been closed.
    child.once("close", (exitCode, exitSignal) => {
      clearTimeout(totalTimer); clearTimeout(scanTimer);
      const completion = freezeDeep<ReaderCompletion>({ observedChildClose: true, exitCode, exitSignal, elapsedMs: performance.now() - started });
      if (refusal !== undefined) { reject(new SqlReaderFailureError(refusal, completion)); return; }
      const output = Buffer.concat(chunks).toString("utf8");
      if (exitCode !== 0) {
        let message = "Isolated SQLite reader failed.";
        try {
          const last = output.trimEnd().split("\n").at(-1);
          const parsed: unknown = JSON.parse(last ?? "");
          if (record(parsed) && Object.keys(parsed).length === 1 && typeof parsed["refusal"] === "string" && parsed["refusal"].length <= 256) { message = parsed["refusal"]; }
        } catch {
          // Preserve the bounded fixed diagnostic for malformed output.
        }
        reject(new SqlReaderFailureError(message, completion)); return;
      }
      try { resolve({ inventory: parseCompletedOutput(output, input.expectedSha256), completion }); }
      catch { reject(new SqlReaderFailureError("Reader completion protocol refused.", completion)); }
    });
    if (!child.stdin || !child.stdout || !child.stderr) { stop("SQL reader pipe setup failed."); }
    child.stdin?.end(request);
  return promise;
}
export function readerCompletion(inventory: ExactSqlInventory): ReaderCompletion {
  const completion = completions.get(inventory);
  requireValue(completion !== undefined, "Reader completion requires its original inventory.");
  return completion;
}
export async function readExactSqlInventory(input: Readonly<{
  checkpointPath: string; expectedSha256: string; runtime: MachineProfile["runtime"]; scanDeadlineMs?: number;
}>): Promise<ExactSqlInventory> {
  const { checkpointPath: path, expectedSha256 } = input;
  const scanDeadlineMs = input.scanDeadlineMs ?? TOTAL_DEADLINE_MS;
  requireValue(process.platform === "linux" && isAbsolute(path) && path.endsWith(".eprj2") && HASH.test(expectedSha256), "Invalid immutable checkpoint input.");
  requireValue(Number.isSafeInteger(scanDeadlineMs) && scanDeadlineMs >= 1 && scanDeadlineMs <= TOTAL_DEADLINE_MS, "SQL scan deadline bound refused.");
  requireValue(await realpath(path) === path, "Checkpoint path includes a symbolic link.");
  await noSidecars(path);
  // oxlint-disable-next-line no-bitwise -- Both flags are required for descriptor-safe read-only admission.
  const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  let node: VerifiedMachineNode | undefined;
  try {
    const before = await file.stat({ bigint: true });
    requireValue(before.isFile() && before.nlink === 1n && before.size > 0n && before.size <= MAX_FILE_BYTES, "Checkpoint file refused.");
    // Reuse installation-specific executable admission. No ambient PATH,
    // Startup options, caller program, or separate runtime worker file.
    node = await openVerifiedMachineNode(input.runtime);
    const result = await runReader(file, node, { checkpointPath: path, expectedSha256, identity: identity(before) }, scanDeadlineMs);
    await node.assertCurrent();
    const after = await file.stat({ bigint: true });
    const named = await lstat(path, { bigint: true });
    requireValue(canonicalJson(identity(before)) === canonicalJson(identity(after)) && canonicalJson(identity(after)) === canonicalJson(identity(named)) &&
      named.isFile() && await realpath(path) === path, "Checkpoint identity changed during SQL inventory.");
    await noSidecars(path);
    completions.set(result.inventory, result.completion);
    return result.inventory;
  } finally {
    const closed = await Promise.allSettled([file.close(), ...(node ? [node.close()] : [])]);
    requireValue(closed.every((value) => value.status === "fulfilled"), "SQL reader descriptor cleanup failed.");
  }
}
export async function readNativeSqlInventory(input: Readonly<{
  checkpointPath: string; expectedSha256: string; runtime: MachineProfile["runtime"]; schemaProfile: SqlSchemaProfile; scanDeadlineMs?: number;
}>): Promise<NativeSqlInventory> {
  const schemaProfile = structuredClone(input.schemaProfile);
  requireValue(/^[a-z0-9][a-z0-9.-]{0,127}$/u.test(schemaProfile.id) && schemaProfile.entries.length > 0, "Invalid SQL schema profile.");
  const exact = await readExactSqlInventory(input);
  requireValue(canonicalJson(exact.schema) === canonicalJson(schemaProfile.entries), "SQL schema differs from fixed profile.");
  const inventory = freezeDeep({ ...exact, schemaProfileId: schemaProfile.id });
  inventories.add(inventory);
  completions.set(inventory, readerCompletion(exact));
  return inventory;
}

function compareRows(left: SqlRow, right: SqlRow): number {
  const a = canonicalJson(left); const b = canonicalJson(right);
  if (a < b) { return -1; } if (a > b) { return 1; } return 0;
}
function integerCell(value: bigint): SqlCell { return { kind: "integer", decimal: value.toString() }; }
function textCell(value: SqlCell | undefined): string {
  requireValue(value?.kind === "text", "Expected SQL TEXT.");
  const bytes = Buffer.from(value.hex, "hex");
  const text = bytes.toString("utf8");
  requireValue(Buffer.from(text, "utf8").equals(bytes), "Structure identity is not valid UTF8.");
  return text;
}
function integer(value: SqlCell | undefined): bigint {
  requireValue(value?.kind === "integer" && /^(?:0|-?[1-9][0-9]*)$/u.test(value.decimal), "Expected canonical SQL INTEGER.");
  return BigInt(value.decimal);
}
export function verifyOrdinarySymbolStructureTicketSlice(input: Readonly<{
  before: NativeSqlInventory; after: NativeSqlInventory; projectUuid: string; branchUuid: string;
  preDispatchMaxTicket: bigint; expectedStructureUtf8Hex: string;
}>): Readonly<Record<string, unknown>> {
  const { before, after } = input;
  requireValue(inventories.has(before) && inventories.has(after), "SQL inventories require fresh immutable checkpoint readers.");
  requireValue(before.schemaProfileId === after.schemaProfileId && before.schemaSha256 === after.schemaSha256, "SQL schema changed.");
  requireValue(canonicalJson(before.properties) === canonicalJson(after.properties), "Persisted SQL properties changed.");
  requireValue(input.preDispatchMaxTicket >= 0n && input.preDispatchMaxTicket < BigInt(Number.MAX_SAFE_INTEGER), "Native ticket bound refused.");
  const expectedTicket = input.preDispatchMaxTicket + 1n;
  const beforeTable = before.tables.find((table) => table.name === "project_structures");
  const afterTable = after.tables.find((table) => table.name === "project_structures");
  requireValue(beforeTable !== undefined && afterTable !== undefined, "Structure table missing.");
  const names = beforeTable.columns.map((column) => column["name"]);
  requireValue(canonicalJson(names) === canonicalJson(["id", "ticket", "project_uuid", "branch_uuid", "structure"]), "Unexpected structure columns.");
  const branchRows = beforeTable.rows.filter((row) => textCell(row.cells[3]) === input.branchUuid);
  requireValue(branchRows.length === 1, "Structure baseline requires exactly one branch row.");
  const target = branchRows[0]; requireValue(target !== undefined, "Structure row missing.");
  requireValue(textCell(target.cells[2]) === input.projectUuid && integer(target.cells[1]) < expectedTicket,
    "Structure project or prior ticket invalid.");
  requireValue(target.cells[4]?.kind === "text" && target.cells[4].hex === input.expectedStructureUtf8Hex,
    "Structure bytes lack the independently prepared baseline.");
  const rows = beforeTable.rows.map((row) => row === target ? { ...row,
    cells: row.cells.map((value, index) => index === 1 ? integerCell(expectedTicket) : value) } : row);
  rows.sort(compareRows);
  const expected = { ...beforeTable, rows };
  requireValue(canonicalJson({ ...expected, sha256: null }) === canonicalJson({ ...afterTable, sha256: null }), "Structure delta differs from exact one-row ticket update.");
  requireValue(before.tables.length === after.tables.length && before.tables.every((table) =>
    table.name === "project_structures" || table.sha256 === after.tables.find((other) => other.name === table.name)?.sha256),
  "Non-structure SQL changed; real rename history/bookkeeping proof is not implemented in this slice.");
  return freezeDeep({ profile: "private-ordinary-symbol-structure-ticket-slice.v1", exactSqlSlice: true,
    beforeSha256: before.logicalSha256, afterSha256: after.logicalSha256, expectedTicket: expectedTicket.toString(),
    executionAuthorized: false, producerOwnershipVerified: false, completeRenameVerified: false,
    limitation: "Synthetic-only structure slice; producer binding and native history/bookkeeping companion required." });
}
