/** Separate current3.2.209 footprint copy-v2 complete SQL relation. Supplied
 * source/native result and clock witnesses confer no dispatch, actor provenance,
 * producer completion, generation closure or reopened lifecycle authority. */
import { types } from "node:util";
import { z } from "zod";
import { canonicalJson, isRecord, sha256Text } from "./core.ts";
import { yieldProofEventLoop } from "./cooperative-proof.ts";
import { assertCurrentFootprintCopyV2Inventory, currentFootprintCopyV2Rows } from "./current-footprint-copy-v2-plan.ts";
import type { CurrentFootprintCopyV2Plan } from "./current-footprint-copy-v2-plan.ts";
import { verifyCurrentFootprintCopyV2Append, verifyCurrentFootprintCopyV2Records } from "./current-footprint-copy-v2-append.ts";
import { decodeNativeHistoryChunk } from "./native-history.ts";
import { nativeProjectSymbolSqlSchema } from "./native-project-sql-schema.ts";
import { MAX_ENCODED_BYTES } from "./sqlite-inventory-core.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { SqlCell, SqlRow, SqlTable, readExactSqlInventory } from "./sqlite-inventory.ts";
// oxlint-disable-next-line import/max-dependencies -- The additional Node builtin rejects Proxy inputs before executing traps; retain the separate original-reader, source, append and SQL guards.
import { decodeCurrentFootprintSourceHistory } from "./symbol-sql-comparator.ts";

type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
type Values = Readonly<Record<string, string | bigint | null>>;
const UUID = /^[a-f0-9]{32}$/u, UUID_V4 = /^[a-f0-9]{12}4[a-f0-9]{3}[89ab][a-f0-9]{15}$/u;
const integerSchema = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).refine((value) => !Object.is(value, -0));
const timeSchema = integerSchema.max(8_640_000_000_000_000);
const offsetSchema = z.number().int().min(-840).max(840).refine((value) => !Object.is(value, -0));
const witnessSchema = z.object({ projectUuid: z.string().refine(value => /^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u.exec(value)?.[0] === value), branchUuid: z.string().length(32).regex(UUID),
  backendActorUuid: z.string().length(32).regex(UUID), client: z.string().length(16).regex(/^[a-f0-9]{16}$/u), preDispatchMaxTicket: integerSchema.max(Number.MAX_SAFE_INTEGER - 3),
  documentClockMinMs: timeSchema, documentClockMaxMs: timeSchema, backendClockMinMs: timeSchema, backendClockMaxMs: timeSchema,
  backendLocalOffsetMinutes: offsetSchema, agedHead: z.object({ createdAtLiteral: z.string().length(19).regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/u),
    nativeParsedLocalMs: timeSchema, nativeTimezoneOffsetMinutes: offsetSchema }).strict().optional(),
}).strict().refine((value) => value.documentClockMaxMs >= value.documentClockMinMs && value.documentClockMaxMs - value.documentClockMinMs <= 60_000 &&
  value.backendClockMaxMs >= value.backendClockMinMs && value.backendClockMaxMs - value.backendClockMinMs <= 60_000);

export type CurrentFootprintCopyV2SqlWitness = z.infer<typeof witnessSchema>;

export interface CurrentFootprintCopyV2SqlPlan {
  readonly profile: "private.current-footprint-copy-v2-sql-plan.v1";
  readonly beforeSqlSha256: string;
  readonly sourceUuid: string;
  readonly expectedTicket: number;
  readonly metadataTicket: number;
  readonly expectedStructureRequests: 0;
  readonly headEligibility: "locked" | "aged-unlocked";
  readonly maximumPlaintextBytes: number;
  readonly maximumSavedRawSourceBytes: number;
  readonly maximumSavedCacheSourceBytes: number;
  readonly positiveDocumentClockWindow: true;
  readonly maximumCiphertextBase64Bytes: number;
  readonly maximumEncodedSqlBytes: number;
  readonly executionAuthorized: false;
  readonly producerBindingVerified: false;
}
interface Prepared {
  readonly before: Inventory; readonly copy: CurrentFootprintCopyV2Plan; readonly witness: z.infer<typeof witnessSchema>;
  readonly project: SqlRow; readonly branch: SqlRow;
  readonly history: SqlTable; readonly data: SqlTable;
  readonly oldHead: string; readonly historyId: bigint; readonly chunkId: bigint;
  readonly dataSequence: SqlRow;
  readonly username: string; readonly nickname: string;
}
const plans = new WeakMap<object, Prepared>();
export interface CurrentFootprintCopyV2SqlSource {
  readonly copyPlan: CurrentFootprintCopyV2Plan;
  readonly append: ReturnType<typeof verifyCurrentFootprintCopyV2Append>;
  /** Actual decoded closed-history pair. These values alone carry no native
   * clock provenance; an original execution collector must bind them. */
  readonly documentClocks: readonly [number, number];
}
const completedEffects = new WeakMap<object, Readonly<{ plan: CurrentFootprintCopyV2SqlPlan; after: Inventory; source: CurrentFootprintCopyV2SqlSource }>>();
function need(condition: boolean, message: string): asserts condition { if (!condition) { throw new Error(`Current footprint copy-v2 SQL: ${message}`); } }
function dataFields(value: unknown, names?: readonly string[]): Record<string, unknown> {
  need(!types.isProxy(value) && isRecord(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null), "plain input required");
  const keys = Reflect.ownKeys(value); need(keys.length <= 12 && keys.every((key) => typeof key === "string" && (names === undefined || names.includes(key))), "input keys differ");
  if (names !== undefined) { need(keys.length === names.length, "input keys are missing"); }
  const copy: Record<string, unknown> = {};
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    need(typeof key === "string" && descriptor !== undefined && Object.hasOwn(descriptor, "value"), "input accessors refused");
    Object.defineProperty(copy, key, { value: descriptor.value as unknown, enumerable: true });
  }
  return copy;
}
function captureWitness(value: unknown): z.infer<typeof witnessSchema> {
  const fields = dataFields(value);
  const strings = new Set(["projectUuid", "branchUuid", "backendActorUuid", "client"]);
  const numbers = new Set(["preDispatchMaxTicket", "documentClockMinMs", "documentClockMaxMs", "backendClockMinMs",
    "backendClockMaxMs", "backendLocalOffsetMinutes"]);
  // Invalid object scalars must never reach Zod's error formatter, which
  // Inspects their prototypes and could execute a nested Proxy's traps.
  need(Object.entries(fields).every(([name, scalar]) => name === "agedHead" ||
    (strings.has(name) ? typeof scalar === "string" : numbers.has(name) && typeof scalar === "number")),
  "primitive witness fields required");
  const aged = fields["agedHead"] === undefined ? undefined : dataFields(fields["agedHead"]);
  need(aged === undefined || Object.entries(aged).every(([name, scalar]) => name === "createdAtLiteral" ? typeof scalar === "string" :
    ["nativeParsedLocalMs", "nativeTimezoneOffsetMinutes"].includes(name) && typeof scalar === "number"), "primitive aged-head fields required");
  const result = witnessSchema.parse({ ...fields, ...(aged === undefined ? {} : { agedHead: aged }) });
  if (result.agedHead !== undefined) { Object.freeze(result.agedHead); }
  return Object.freeze(result);
}
function text(value: SqlCell | undefined): string {
  need(value?.kind === "text", "expected SQL TEXT");
  const bytes = Buffer.from(value.hex, "hex"), result = bytes.toString("utf8");
  need(Buffer.from(result).equals(bytes), "SQL TEXT is not exact UTF8"); return result;
}
function integer(value: SqlCell | undefined): bigint { need(value?.kind === "integer", "expected SQL INTEGER"); return BigInt(value.decimal); }
function table(inventory: Inventory, name: string): SqlTable {
  const matches = inventory.tables.filter((entry) => entry.name === name);
  need(matches.length === 1 && matches[0] !== undefined, "required table is not unique"); return matches[0];
}
function field(owner: SqlTable, row: SqlRow, name: string): SqlCell {
  const index = owner.columns.findIndex((column) => column["name"] === name), value = row.cells[index];
  need(index !== -1 && value !== undefined, "required column is missing"); return value;
}
function unique(owner: SqlTable, name: string, expected: string): SqlRow {
  const matches = owner.rows.filter((row) => text(field(owner, row, name)) === expected);
  need(matches.length === 1 && matches[0] !== undefined, "required identity is not unique"); return matches[0];
}
function cell(value: string | bigint | null): SqlCell {
  if (value === null) { return { kind: "null" }; }
  return typeof value === "bigint" ? { kind: "integer", decimal: value.toString() } : { kind: "text", hex: Buffer.from(value).toString("hex") };
}
function patch(owner: SqlTable, row: SqlRow, values: Values): SqlRow {
  need(Object.keys(values).every((name) => owner.columns.some((column) => column["name"] === name)), "unknown projected column");
  return { ...row, cells: row.cells.map((original, index) => {
    const name = owner.columns[index]?.["name"]; need(typeof name === "string", "column name missing");
    return Object.hasOwn(values, name) ? cell(values[name] ?? null) : original;
  }) };
}
function insert(owner: SqlTable, id: bigint, values: Values): SqlRow {
  need(owner.columns.length === Object.keys(values).length, "insert must supply every column");
  return patch(owner, { rowid: cell(id), cells: owner.columns.map(() => ({ kind: "null" })) }, values);
}
function maximumId(owner: SqlTable): bigint {
  let maximum = 0n;
  for (const row of owner.rows) {
    const id = integer(field(owner, row, "id"));
    need(id > 0n && row.rowid !== null && integer(row.rowid) === id, "positive ID/rowid association differs");
    if (id > maximum) { maximum = id; }
  }
  need(maximum < BigInt(Number.MAX_SAFE_INTEGER), "allocation capacity exhausted"); return maximum;
}
function sequenceAllocation(before: Inventory, owner: SqlTable): Readonly<{ row: SqlRow; id: bigint }> {
  const sequence = table(before, "sqlite_sequence"); const row = unique(sequence, "name", owner.name); const value = integer(field(sequence, row, "seq"));
  need(value >= maximumId(owner) && value < BigInt(Number.MAX_SAFE_INTEGER), "AUTOINCREMENT capacity exhausted");
  return { row, id: value + 1n };
}
function supported(inventory: Inventory, branchUuid: string): void {
  const completion = readerCompletion(inventory);
  need(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null, "original completed SQL reader required");
  // Current APP52f51ce4 base/migrations and dynamic Or schema were independently
  // Rebuilt in synthetic SQLite; all84 entries equal this fixed schema profile.
  need(canonicalJson(inventory.schema) === canonicalJson(nativeProjectSymbolSqlSchema(branchUuid).entries), "fixed native schema differs");
  // oxlint-disable-next-line unicorn/text-encoding-identifier-case -- SQLite reports this exact PRAGMA spelling.
  need(inventory.properties["encoding"] === "UTF-8", "SQL UTF8 encoding required");
}
function wallMs(value: string): number {
  need(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/u.test(value), "SQL timestamp syntax differs");
  const result = Date.parse(`${value.replace(" ", "T")}Z`);
  need(Number.isFinite(result) && new Date(result).toISOString().slice(0, 19).replace("T", " ") === value, "SQL timestamp calendar differs"); return result;
}
function headEligibility(head: SqlRow, owner: SqlTable, witness: z.infer<typeof witnessSchema>): CurrentFootprintCopyV2SqlPlan["headEligibility"] {
  const locked = integer(field(owner, head, "is_lock")); need(locked === 0n || locked === 1n, "history lock refused");
  if (locked === 1n) { need(witness.agedHead === undefined, "locked head cannot consume age witness"); return "locked"; }
  const age = witness.agedHead;
  need(age !== undefined && age.createdAtLiteral === text(field(owner, head, "created_at")) &&
    age.nativeTimezoneOffsetMinutes === -witness.backendLocalOffsetMinutes &&
    Math.abs(age.nativeParsedLocalMs - wallMs(age.createdAtLiteral)) <= 840 * 60_000, "independently bound native head age required");
  const adjusted = age.nativeParsedLocalMs - age.nativeTimezoneOffsetMinutes * 60_000;
  need(Number.isSafeInteger(adjusted) && witness.backendClockMinMs - adjusted >= 61_000, "head is not aged throughout the selection window");
  return "aged-unlocked";
}
function branchParent(before: Inventory, branch: SqlRow, witness: z.infer<typeof witnessSchema>): void {
  const branches = table(before, "branches"), parent = field(branches, branch, "parent_uuid");
  if (parent.kind === "null") { return; }
  const uuid = text(parent); need(UUID.test(uuid) && uuid !== witness.branchUuid, "branch parent identity refused");
  const start = unique(branches, "uuid", uuid);
  need(text(field(branches, start, "name")) === "start" && integer(field(branches, start, "node")) === 1n &&
    integer(field(branches, start, "delete_status")) === 0n && text(field(branches, start, "project_uuid")) === witness.projectUuid &&
    field(branches, start, "parent_uuid").kind === "null" && field(branches, start, "history_uuid").kind === "null", "branch parent is not the terminal empty start node");
}
function actor(before: Inventory, uuid: string): Readonly<{ username: string; nickname: string }> {
  const users = table(before, "users"); need(users.rows.length <= 4096, "project user bound exceeded");
  const matches = users.rows.filter((row) => text(field(users, row, "uuid")) === uuid); need(matches.length <= 1, "project actor is ambiguous");
  const row = matches[0]; const username = row === undefined ? "" : text(field(users, row, "username")); const nickname = row === undefined ? "" : text(field(users, row, "nickname"));
  need(username.length <= 1024 && nickname.length <= 1024, "project actor name bound exceeded");
  return { username, nickname };
}
function editRow(prepared: Pick<Prepared, "witness" | "username" | "nickname">, time: number): string {
  return `{"type":"EDIT_HEAD"}||${JSON.stringify({ uuid: prepared.witness.backendActorUuid, username: prepared.username, nickname: prepared.nickname, updateTime: time })}`;
}
function headerRow(witness: z.infer<typeof witnessSchema>, targetUuid: string, ticket: number, time: number): string {
  return `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({ docType: "FOOTPRINT", client: witness.client, uuid: targetUuid,
    updateTime: time, version: String(time), editVersion: "3.2.209" })}`;
}
function sqlBudget(prepared: Prepared, plaintextBytes: number): Readonly<{ maximumCiphertextBase64Bytes: number; maximumEncodedSqlBytes: number }> {
  const fixed = plaintextBytes + Math.floor(plaintextBytes / 8) + Math.floor(plaintextBytes / 256) + Math.floor(plaintextBytes / 512) + 4;
  const stored = plaintextBytes + Math.floor(plaintextBytes / 32) + Math.floor(plaintextBytes / 128) + Math.floor(plaintextBytes / 2048) + 7;
  // Pinned APP gzipSync(level:1), Chromium-zlib's conservative deflateBound,
  // Eighteen gzip wrapper bytes and sixteen AES-GCM authentication bytes.
  const maximumCiphertextBase64Bytes = 4 * Math.ceil((Math.max(fixed, stored) + 34) / 3);
  need(maximumCiphertextBase64Bytes <= 2_097_152, "new history SQL cell capacity exceeded");
  const { before } = prepared; const uuid = "0".repeat(32); const time = "2000-01-01 00:00:00"; const large = BigInt(Number.MAX_SAFE_INTEGER);
  const additions = [insert(prepared.history, large, { id: large, uuid, parent: uuid, snapshot: null, key: uuid, is_lock: 0n,
    num: 0n, created_at: time, updated_at: time, lock_time: "1970-01-01 08:00:00", snapshot_num: 0n }),
  insert(prepared.data, large, { id: large, uuid, history_uuid: uuid, dataStr: "A".repeat(maximumCiphertextBase64Bytes), created_at: time, updated_at: time })];
  let growth = additions.reduce((sum, row) => sum + Buffer.byteLength(JSON.stringify(row)) + 1, 0);
  // Entire replacement cells are added without subtracting their prior bytes.
  for (const value of [time, prepared.witness.backendActorUuid, uuid, large]) {
    growth += Buffer.byteLength(JSON.stringify(cell(value)));
  }
  const rows = before.tables.reduce((sum, owner) => sum + owner.rows.length, 0) + additions.length;
  const cells = before.tables.reduce((sum, owner) => sum + owner.rows.length * (owner.columns.length + (owner.withoutRowid ? 0 : 1)), 0) +
    additions.reduce((sum, row) => sum + row.cells.length + 1, 0);
  const maximumEncodedSqlBytes = Buffer.byteLength(JSON.stringify(before)) + growth;
  need(rows <= 100_000 && cells <= 250_000 && maximumEncodedSqlBytes <= MAX_ENCODED_BYTES, "complete SQL reader capacity exceeded");
  return Object.freeze({ maximumCiphertextBase64Bytes, maximumEncodedSqlBytes });
}

/** Reserve both fresh-replay getter encodings before any future owner could
 * Dispatch. UUID/client are fixed-width hex; nonzero positive integer times
 * And tickets have their largest JSON encodings at the supplied upper bounds.
 * Supplied clock bounds still establish no native clock provenance.
 */
function savedSourceBudget(prepared: Prepared): Readonly<{ maximumSavedRawSourceBytes: number;
  maximumSavedCacheSourceBytes: number; positiveDocumentClockWindow: true }> {
  const { copy, witness } = prepared;
  need(witness.documentClockMinMs > 0, "positive document clock window required before copy");
  const client = "0".repeat(16), targetUuid = "0".repeat(16), time = witness.documentClockMaxMs;
  const metadata = `${JSON.stringify({ type: "META", ticket: copy.metadataTicket, id: "META" })}||${JSON.stringify(copy.destinationMetadata)}`;
  const canvas = currentFootprintCopyV2Rows(copy).filter(raw => {
    const split = raw.indexOf("||"); const header: unknown = JSON.parse(raw.slice(0, split));
    need(isRecord(header), "saved source atom header differs"); return header["type"] !== "META";
  });
  need(canvas.length === copy.canvasRecords, "saved source canvas count differs");
  const size = (user: object): number => {
    const head = (ticket: number): string => `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({
      docType: "FOOTPRINT", client, uuid: targetUuid, updateTime: time, version: String(time), editVersion: "3.2.209", user })}`;
    return Buffer.byteLength([head(copy.canvasHeaderTicket + 1), metadata, head(copy.canvasHeaderTicket), ...canvas].join("|\n"));
  };
  const maximumSavedRawSourceBytes = size({ uuid: witness.backendActorUuid, username: prepared.username, nickname: prepared.nickname });
  const maximumSavedCacheSourceBytes = size({ uuid: targetUuid });
  need(maximumSavedRawSourceBytes <= 2_097_152 && maximumSavedCacheSourceBytes <= 2_097_152,
    "saved getter byte capacity exceeded before copy");
  return Object.freeze({ maximumSavedRawSourceBytes, maximumSavedCacheSourceBytes, positiveDocumentClockWindow: true });
}

/** Freeze all allocation/clock/effect bounds before dispatch. A copied reader
 * or copy-plan descriptor cannot be substituted by matching its public hash.
 */
export async function prepareCurrentFootprintCopyV2SqlPlan(input: Readonly<{ before: Inventory; copyPlan: CurrentFootprintCopyV2Plan;
  witness: CurrentFootprintCopyV2SqlWitness }>): Promise<CurrentFootprintCopyV2SqlPlan> {
  const fields = dataFields(input, ["before", "copyPlan", "witness"]);
  // Capture rejects proxies/accessors before these typed data-property reads.
  // No await or caller code runs between the descriptor and reference checks.
  const before = input.before, copy = input.copyPlan;
  need(fields["before"] === before && fields["copyPlan"] === copy, "input identity changed during capture");
  const witness = captureWitness(fields["witness"]);
  assertCurrentFootprintCopyV2Inventory(copy, before); supported(before, witness.branchUuid);
  const completion = readerCompletion(before);
  need(witness.projectUuid === copy.source.projectUuid && witness.branchUuid === copy.source.branchUuid &&
    witness.client === copy.client && witness.preDispatchMaxTicket === copy.maximumTicket,
    "witness differs from the original source plan");
  const projects = table(before, "projects"); need(projects.rows.length === 1, "singleton native project required"); const branches = table(before, "branches"); const project = unique(projects, "uuid", witness.projectUuid); const branch = unique(branches, "uuid", witness.branchUuid);
  branchParent(before, branch, witness);
  const history = table(before, `project_history_${witness.branchUuid}`), oldHead = text(field(branches, branch, "history_uuid"));
  const eligibility = headEligibility(unique(history, "uuid", oldHead), history, witness); const data = table(before, "history_data");
  const dataAllocation = sequenceAllocation(before, data);
  // Current WORKER uploadStructure excludes FOOTPRINT. Preserve every structure
  // Row/cell and its AUTOINCREMENT state, including duplicates and stale trees.
  const prepared: Prepared = { before, copy, witness, project, branch, history, data, oldHead,
    historyId: maximumId(history) + 1n, chunkId: dataAllocation.id,
    dataSequence: dataAllocation.row, ...actor(before, witness.backendActorUuid) };
  const maximumRaw = [editRow(prepared, witness.backendClockMaxMs), headerRow(witness, "0".repeat(16), copy.metadataTicket, witness.documentClockMaxMs),
    `${JSON.stringify({ type: "META", ticket: copy.metadataTicket, id: "META" })}||${JSON.stringify(copy.destinationMetadata)}`,
    headerRow(witness, "0".repeat(16), copy.canvasHeaderTicket, witness.documentClockMaxMs), ...currentFootprintCopyV2Rows(copy)].join("|\n");
  const savedCapacity = savedSourceBudget(prepared);
  const maximumPlaintextBytes = Buffer.byteLength(maximumRaw); const capacity = sqlBudget(prepared, maximumPlaintextBytes);
  const decoded = await decodeCurrentFootprintSourceHistory(before, { projectUuid: witness.projectUuid, branchUuid: witness.branchUuid });
  need(decoded.maximumTicket === copy.maximumTicket && decoded.history.plaintextBytes + maximumPlaintextBytes <= 8_388_608, "complete raw-history capacity exceeded");
  assertCurrentFootprintCopyV2Inventory(copy, before); need(readerCompletion(before) === completion, "original reader changed during preparation");
  const plan: CurrentFootprintCopyV2SqlPlan = Object.freeze({ profile: "private.current-footprint-copy-v2-sql-plan.v1", beforeSqlSha256: before.logicalSha256,
    sourceUuid: copy.source.footprintUuid, expectedTicket: copy.canvasHeaderTicket, metadataTicket: copy.metadataTicket, expectedStructureRequests: 0,
    headEligibility: eligibility, maximumPlaintextBytes, ...savedCapacity, ...capacity, executionAuthorized: false, producerBindingVerified: false });
  plans.set(plan, prepared); return plan;
}

/** Private identity relation for pre-dispatch envelope reservation. Matching
 * JSON or hashes cannot adopt a separately prepared copy or checkpoint. */
export function assertCurrentFootprintCopyV2SqlInputs(plan: CurrentFootprintCopyV2SqlPlan,
  copyPlan: CurrentFootprintCopyV2Plan, before: Inventory): void {
  const original = plans.get(plan);
  need(original !== undefined && original.copy === copyPlan && original.before === before,
    "original SQL plan, copy plan and checkpoint required");
  assertCurrentFootprintCopyV2Inventory(copyPlan, before);
}
function newRow(owner: SqlTable, id: bigint): SqlRow {
  const matches = owner.rows.filter((row) => integer(field(owner, row, "id")) === id);
  need(matches.length === 1 && matches[0] !== undefined, "exact newly allocated row missing"); return matches[0];
}
function generatedTime(value: unknown, minimum: number, maximum: number): number {
  need(typeof value === "number" && Number.isSafeInteger(value) && !Object.is(value, -0) && value >= minimum && value <= maximum, "generated timestamp outside supplied bounds"); return value;
}
function sqlTime(value: string, witness: z.infer<typeof witnessSchema>, local = false): string {
  const utc = wallMs(value) - (local ? witness.backendLocalOffsetMinutes * 60_000 : 0);
  need(utc >= Math.floor(witness.backendClockMinMs / 1000) * 1000 && utc <= Math.floor(witness.backendClockMaxMs / 1000) * 1000,
    "generated SQL timestamp outside supplied bounds"); return value;
}
function rowTime(line: string | undefined): unknown {
  need(line !== undefined && line.indexOf("||") > 0, "raw timestamp record missing");
  const body: unknown = JSON.parse(line.slice(line.indexOf("||") + 2)); need(isRecord(body), "raw timestamp body refused"); return body["updateTime"];
}
async function exactRows(expected: readonly SqlRow[], observed: readonly SqlRow[], name: string): Promise<void> {
  need(expected.length === observed.length, `row count differs in ${name}`);
  const pending = new Map<string, SqlRow>(); let cells = 0;
  for (const row of expected) {
    need(row.rowid?.kind === "integer" && !pending.has(row.rowid.decimal), "unique integer rowids required"); pending.set(row.rowid.decimal, row);
    cells += 1; if (cells >= 128) { cells = 0; await yieldProofEventLoop(); }
  }
  for (const row of observed) {
    need(row.rowid?.kind === "integer", "observed integer rowid required");
    const wanted = pending.get(row.rowid.decimal); need(wanted !== undefined && wanted.cells.length === row.cells.length, `row identity differs in ${name}`);
    for (let index = 0; index < wanted.cells.length; index += 1) {
      need(canonicalJson(wanted.cells[index]) === canonicalJson(row.cells[index]), `full cell effect differs in ${name}`);
      cells += 1; if (cells >= 128) { cells = 0; await yieldProofEventLoop(); }
    }
    pending.delete(row.rowid.decimal);
  }
  need(pending.size === 0, `row multiplicity differs in ${name}`);
}

/** The owner must supply its retained native return, never a discovered title.
 * This pure comparator cannot establish where that supplied UUID came from.
 */
export async function verifyCurrentFootprintCopyV2SqlEffect(plan: CurrentFootprintCopyV2SqlPlan, after: Inventory,
  result: Readonly<{ returnedUuid: string }>): Promise<Readonly<Record<string, unknown>>> {
  const prepared = plans.get(plan); need(prepared !== undefined, "original prepared plan required");
  const suppliedUuid = dataFields(result, ["returnedUuid"])["returnedUuid"];
  need(typeof suppliedUuid === "string", "primitive returned UUID required");
  const returnedUuid = z.string().length(16).regex(/^[a-f0-9]{16}$/u).parse(suppliedUuid);
  const { before, copy, witness, history, data } = prepared;
  assertCurrentFootprintCopyV2Inventory(copy, before); supported(after, witness.branchUuid); const completion = readerCompletion(after);
  need(canonicalJson(before.properties) === canonicalJson(after.properties), "persisted SQL properties changed");
  const afterHistory = table(after, history.name); const afterData = table(after, "history_data"); const head = newRow(afterHistory, prepared.historyId); const chunk = newRow(afterData, prepared.chunkId);
  const headUuid = text(field(afterHistory, head, "uuid")), key = text(field(afterHistory, head, "key"));
  need(UUID_V4.test(headUuid) && UUID.test(key) && !history.rows.some((row) => text(field(history, row, "uuid")) === headUuid) &&
    !data.rows.some((row) => text(field(data, row, "uuid")).split("-")[0] === headUuid || text(field(data, row, "history_uuid")) === headUuid), "history UUID/key invalid or colliding");
  const encoded = text(field(afterData, chunk, "dataStr")); need(encoded.length <= plan.maximumCiphertextBase64Bytes, "history encoding exceeds reserved capacity");
  const plaintext = await decodeNativeHistoryChunk({ historyUuid: headUuid, keyHex: key, dataBase64: encoded }); const lines = plaintext.split("|\n");
  need(Buffer.byteLength(plaintext) <= plan.maximumPlaintextBytes, "history plaintext exceeds reserved capacity");
  const edit = generatedTime(rowTime(lines[0]), witness.backendClockMinMs, witness.backendClockMaxMs);
  const first = generatedTime(rowTime(lines[1]), witness.documentClockMinMs, witness.documentClockMaxMs);
  const second = generatedTime(rowTime(lines[3]), first, witness.documentClockMaxMs);
  need(lines[0] === editRow(prepared, edit) && lines[1] === headerRow(witness, returnedUuid, copy.metadataTicket, first) &&
    lines[3] === headerRow(witness, returnedUuid, copy.canvasHeaderTicket, second), "exact actor/client/clock headers differ");
  const append = verifyCurrentFootprintCopyV2Append(copy, returnedUuid, plaintext);
  await verifyCurrentFootprintCopyV2Records(copy, after, returnedUuid);
  const headTime = sqlTime(text(field(afterHistory, head, "created_at")), witness); const chunkTime = sqlTime(text(field(afterData, chunk, "created_at")), witness);
  const projects = table(before, "projects"); const branches = table(before, "branches"); const sequence = table(before, "sqlite_sequence");
  const afterProjects = table(after, "projects"); const projectAfter = unique(afterProjects, "uuid", witness.projectUuid);
  const projectTime = sqlTime(text(field(afterProjects, projectAfter, "updated_at")), witness, true);
  const expected = new Map<string, readonly SqlRow[]>([[history.name, [...history.rows, insert(history, prepared.historyId,
    { id: prepared.historyId, uuid: headUuid, parent: prepared.oldHead, snapshot: null, key, is_lock: 0n, num: 0n,
      created_at: headTime, updated_at: headTime, lock_time: "1970-01-01 08:00:00", snapshot_num: 0n })]],
  ["history_data", [...data.rows, insert(data, prepared.chunkId, { id: prepared.chunkId, uuid: headUuid, history_uuid: headUuid, dataStr: encoded, created_at: chunkTime, updated_at: chunkTime })]],
  ["projects", [patch(projects, prepared.project, { updated_at: projectTime, modifier_uuid: witness.backendActorUuid })]],
  ["branches", branches.rows.map((row) => row === prepared.branch ? patch(branches, row, { history_uuid: headUuid }) : row)],
  ["sqlite_sequence", sequence.rows.map((row) => row === prepared.dataSequence ? patch(sequence, row, { seq: prepared.chunkId }) : row)]]);
  need(before.tables.length === after.tables.length, "SQL table inventory changed");
  for (const prior of before.tables) {
    const observed = table(after, prior.name);
    need(!prior.withoutRowid && !observed.withoutRowid && prior.strict === observed.strict && canonicalJson(prior.columns) === canonicalJson(observed.columns), `SQL descriptor differs in ${prior.name}`);
    await exactRows(expected.get(prior.name) ?? prior.rows, observed.rows, prior.name); await yieldProofEventLoop();
  }
  need(plans.get(plan) === prepared && readerCompletion(after) === completion, "original proof inputs changed"); assertCurrentFootprintCopyV2Inventory(copy, before);
  const effect = Object.freeze({ profile: "private.current-footprint-copy-v2-full-sql-effect.v1", exactLogicalSqlEffect: true, headEligibility: plan.headEligibility,
    beforeSqlSha256: before.logicalSha256, afterSqlSha256: after.logicalSha256, returnedUuid, append,
    expectedPlaintextSha256: sha256Text(plaintext), generatedCiphertextSha256: sha256Text(encoded), newHistoryUuid: headUuid,
    newHistoryId: prepared.historyId.toString(), newChunkId: prepared.chunkId.toString(),
    expectedTicket: plan.expectedTicket, expectedStructureRequests: 0, executionAuthorized: false, producerBindingVerified: false,
    structureRowsUnchanged: true, completionProved: false, generationClosureVerified: false, persistentUploadReplayExcluded: false, reopened: false });
  const source = Object.freeze({ copyPlan: copy, append, documentClocks: Object.freeze([first, second] as const) });
  completedEffects.set(effect, Object.freeze({ plan, after, source }));
  return effect;
}

/** Retain the exact successful relation, not a JSON-reconstructed claim. This
 * Supplies original pure inputs only; it issues no lifecycle or write owner.
 */
export function completedCurrentFootprintCopyV2SqlSource(plan: CurrentFootprintCopyV2SqlPlan, originalEffect: unknown, exactAfter: Inventory): CurrentFootprintCopyV2SqlSource {
  need(originalEffect !== null && typeof originalEffect === "object", "original successful SQL effect required");
  const completed = completedEffects.get(originalEffect), prepared = plans.get(plan);
  need(completed !== undefined && prepared !== undefined && completed.plan === plan && completed.after === exactAfter &&
    completed.source.copyPlan === prepared.copy, "original successful SQL effect/reader relation required");
  supported(exactAfter, prepared.witness.branchUuid); assertCurrentFootprintCopyV2Inventory(prepared.copy, prepared.before);
  return completed.source;
}
