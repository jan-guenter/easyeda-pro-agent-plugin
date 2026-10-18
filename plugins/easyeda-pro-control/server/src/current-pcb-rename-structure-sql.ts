/** Pure complete-SQL relation for ONE lower-ticket PCB structure upload only.
 * This is not the complete rename effect: history/branch/project bookkeeping,
 * producer/queue completion, clock provenance and saved reopening are separate.
 * No runtime coordinator imports or enables this prerequisite.
 */
import { z } from "zod";
import { yieldProofEventLoop } from "./cooperative-proof.ts";
import { verifyCurrentPcbRenameStructure } from "./current-pcb-rename-structure.ts";
import type { CurrentPcbRenameStructureProjection } from "./current-pcb-rename-structure.ts";
import { nativeProjectSymbolSqlSchema } from "./native-project-sql-schema.ts";
import { MAX_ENCODED_BYTES } from "./sqlite-inventory-core.ts";
import { canonicalJson, record, sha256Json } from "./sqlite-inventory-json.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { SqlCell, SqlRow, SqlTable, readExactSqlInventory } from "./sqlite-inventory.ts";

type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
const requestSchema = z.object({ projectUuid: z.string().regex(/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u),
  branchUuid: z.string().regex(/^[a-f0-9]{32}$/u), ticket: z.number().int().positive().max(Number.MAX_SAFE_INTEGER) }).strict();
const LIMITATIONS = Object.freeze({ executionAuthorized: false, wholeRenameVerified: false, completeHistoryVerified: false,
  producerBindingVerified: false, queueCompletionVerified: false, clockProvenanceVerified: false, reopened: false } as const);
export interface CurrentPcbRenameStructureSqlPlan {
  readonly profile: "private.current-pcb-rename-structure-sql-plan.v1";
  readonly beforeSqlSha256: string;
  readonly expectedSqlSha256: string;
  readonly targetUuid: string;
  readonly ticket: number;
  readonly updatedStructureRows: number;
  readonly executionAuthorized: false;
  readonly wholeRenameVerified: false;
}
export interface CurrentPcbRenameStructureSqlComparison {
  readonly profile: "private.current-pcb-rename-structure-full-sql-effect.v1";
  readonly exactStructureUploadLogicalSqlEffect: true;
  readonly beforeSqlSha256: string;
  readonly afterSqlSha256: string;
  readonly updatedStructureRows: number;
  readonly preservedTables: number;
  readonly executionAuthorized: false;
  readonly wholeRenameVerified: false;
  readonly completeHistoryVerified: false;
  readonly producerBindingVerified: false;
  readonly queueCompletionVerified: false;
  readonly clockProvenanceVerified: false;
  readonly reopened: false;
}
interface Prepared {
  readonly before: Inventory;
  readonly expectedTables: readonly SqlTable[];
  readonly branchUuid: string;
}
const plans = new WeakMap<CurrentPcbRenameStructureSqlPlan, Prepared>();
function need(condition: boolean, message: string): asserts condition {
  if (!condition) { throw new Error(`Current PCB structure SQL: ${message}`); }
}
function fields(value: unknown, names: readonly string[]): Record<string, unknown> {
  need(value !== null && typeof value === "object" && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null), "plain input required");
  const keys = Reflect.ownKeys(value);
  need(keys.length === names.length && keys.every((key) => typeof key === "string" && names.includes(key)), "input keys differ");
  const result: Record<string, unknown> = {};
  for (const key of names) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value"), "input accessors refused");
    Object.defineProperty(result, key, { value: descriptor.value as unknown, enumerable: true });
  }
  return result;
}
function text(value: SqlCell | undefined): string {
  need(value?.kind === "text", "expected SQL TEXT");
  const bytes = Buffer.from(value.hex, "hex"), result = bytes.toString("utf8");
  need(Buffer.from(result).equals(bytes), "SQL text is not exact UTF8"); return result;
}
function integer(value: SqlCell | null | undefined): bigint {
  need(value?.kind === "integer", "expected SQL INTEGER"); return BigInt(value.decimal);
}
function table(inventory: Inventory, name: string): SqlTable {
  const matches = inventory.tables.filter((entry) => entry.name === name);
  need(matches.length === 1 && matches[0] !== undefined, "required table is not unique"); return matches[0];
}
function field(owner: SqlTable, row: SqlRow, name: string): SqlCell {
  const index = owner.columns.findIndex((column) => column["name"] === name), value = row.cells[index];
  need(index !== -1 && value !== undefined, "required column missing"); return value;
}
function unique(owner: SqlTable, name: string, value: string): SqlRow {
  const matches = owner.rows.filter((row) => text(field(owner, row, name)) === value);
  need(matches.length === 1 && matches[0] !== undefined, "required row identity is not unique"); return matches[0];
}
function supported(inventory: Inventory, branchUuid: string): void {
  const completion = readerCompletion(inventory);
  need(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null, "original completed SQL reader required");
  // The existing schema function describes the installed project's entire native
  // SQL schema. Its historical symbol name does not import a symbol effect model.
  need(canonicalJson(inventory.schema) === canonicalJson(nativeProjectSymbolSqlSchema(branchUuid).entries), "native schema differs");
  // oxlint-disable-next-line unicorn/text-encoding-identifier-case -- This is SQLite's exact PRAGMA encoding value.
  need(inventory.properties["encoding"] === "UTF-8", "native SQL encoding differs");
}
function sameCell(left: SqlCell | null, right: SqlCell | null | undefined): boolean {
  if (left === null) { return right === null; }
  if (right === null || right === undefined || left.kind !== right.kind) { return false; }
  if (left.kind === "null") { return true; }
  if (left.kind === "integer") { return right.kind === "integer" && left.decimal === right.decimal; }
  if (left.kind === "real") { return right.kind === "real" && left.ieee754le === right.ieee754le; }
  return (right.kind === "text" || right.kind === "blob") && left.hex === right.hex;
}
function originalProjection(projection: CurrentPcbRenameStructureProjection): void {
  need(projection !== null && typeof projection === "object", "original structure projection required");
  const descriptor = Object.getOwnPropertyDescriptor(projection, "afterStructureText");
  need(descriptor !== undefined && Object.hasOwn(descriptor, "value"), "structure projection accessor refused");
  verifyCurrentPcbRenameStructure(projection, descriptor.value);
}

/** Model APP app.js SHA52f51ce4... UTF-16 offsets2607932–2608820.
 * queryOne selects an unspecified branch row; EVERY matching row must therefore
 * have a lower ticket. BB then updates all branch matches without project/ticket
 * filtering. Identical baseline structure text and exact project association are
 * required for all of them. Equal-ticket INSERT and missing rows are not modeled.
 * The supplied ticket is a comparison value, never a native history witness.
 */
export async function prepareCurrentPcbRenameStructureSql(input: Readonly<{ before: Inventory;
  projection: CurrentPcbRenameStructureProjection; projectUuid: string; branchUuid: string; ticket: number }>): Promise<CurrentPcbRenameStructureSqlPlan> {
  const captured = fields(input, ["before", "projection", "projectUuid", "branchUuid", "ticket"]);
  const before = input.before, projection = input.projection;
  need(captured["before"] === before && captured["projection"] === projection, "input identity changed");
  const request = requestSchema.parse({ projectUuid: captured["projectUuid"], branchUuid: captured["branchUuid"], ticket: captured["ticket"] });
  supported(before, request.branchUuid); originalProjection(projection);
  const completion = readerCompletion(before);
  const branches = table(before, "branches"), projects = table(before, "projects");
  const branch = unique(branches, "uuid", request.branchUuid), project = unique(projects, "uuid", request.projectUuid);
  need(text(field(projects, project, "branch_uuid")) === request.branchUuid && text(field(branches, branch, "project_uuid")) === request.projectUuid &&
    integer(field(branches, branch, "node")) === 0n && integer(field(branches, branch, "delete_status")) === 0n, "selected project/branch association differs");
  const tree: unknown = JSON.parse(projection.beforeStructureText);
  need(record(tree) && record(tree["owner"]) && tree["owner"]["uuid"] === text(field(projects, project, "owner_uuid")), "structure owner differs");
  const identities = new Set<string>(), structures = table(before, "project_structures");
  const selected = new Set<SqlRow>();
  for (const row of structures.rows) {
    const id = integer(field(structures, row, "id"));
    need(id > 0n && id <= BigInt(Number.MAX_SAFE_INTEGER) && integer(row.rowid) === id && !identities.has(id.toString()), "structure row identity differs");
    identities.add(id.toString());
    if (text(field(structures, row, "branch_uuid")) === request.branchUuid) {
      const priorTicket = integer(field(structures, row, "ticket"));
      need(text(field(structures, row, "project_uuid")) === request.projectUuid, "matching branch crosses project identity");
      need(priorTicket >= 0n && priorTicket < BigInt(request.ticket), "every matching branch row must have a lower ticket");
      need(text(field(structures, row, "structure")) === projection.beforeStructureText, "matching branch structure bytes differ");
      selected.add(row);
    }
    await yieldProofEventLoop();
  }
  need(selected.size > 0, "baseline structure rows missing");
  const rows = structures.rows.map((row) => selected.has(row) ? { rowid: row.rowid, cells: row.cells.map((cell, index): SqlCell => {
    const name = structures.columns[index]?.["name"];
    if (name === "ticket") { return { kind: "integer", decimal: String(request.ticket) }; }
    if (name === "structure") { return { kind: "text", hex: Buffer.from(projection.afterStructureText).toString("hex") }; }
    return cell;
  }) } : row).toSorted((left, right) => {
    const a = canonicalJson(left), b = canonicalJson(right); return a < b ? -1 : Number(a > b);
  });
  const body = { name: structures.name, columns: structures.columns, withoutRowid: structures.withoutRowid, strict: structures.strict, rows };
  const replacement: SqlTable = { ...body, sha256: sha256Json(body) };
  const expectedTables = before.tables.map((entry) => entry === structures ? replacement : entry);
  const expectedSqlSha256 = sha256Json({ schema: before.schema, properties: before.properties, tables: expectedTables });
  need(Buffer.byteLength(JSON.stringify({ ...before, tables: expectedTables, logicalSha256: expectedSqlSha256 })) <= MAX_ENCODED_BYTES,
    "projected complete SQL reader byte capacity exceeded");
  supported(before, request.branchUuid); need(readerCompletion(before) === completion, "original SQL reader changed");
  const plan: CurrentPcbRenameStructureSqlPlan = Object.freeze({ profile: "private.current-pcb-rename-structure-sql-plan.v1",
    beforeSqlSha256: before.logicalSha256, expectedSqlSha256, targetUuid: projection.targetUuid, ticket: request.ticket,
    updatedStructureRows: selected.size, executionAuthorized: false, wholeRenameVerified: false });
  plans.set(plan, { before, expectedTables, branchUuid: request.branchUuid }); return plan;
}

/** Verify every row, field, storage class, schema and persisted property.
 * A legitimate rename's additional history effects must fail this isolated
 * relation. It is not a substitute for a future combined rename comparator.
 */
export async function verifyCurrentPcbRenameStructureSql(plan: CurrentPcbRenameStructureSqlPlan, after: Inventory): Promise<CurrentPcbRenameStructureSqlComparison> {
  const prepared = plans.get(plan); need(prepared !== undefined, "original prepared structure SQL plan required");
  const { before, expectedTables, branchUuid } = prepared;
  supported(before, branchUuid); supported(after, branchUuid);
  const afterCompletion = readerCompletion(after), beforeCompletion = readerCompletion(before);
  need(before.profile === after.profile && before.schemaSha256 === after.schemaSha256 &&
    canonicalJson(before.properties) === canonicalJson(after.properties), "SQL properties or schema changed");
  need(expectedTables.length === after.tables.length, "SQL table inventory changed");
  let cells = 0, encodedBytes = 0;
  for (const [tableIndex, expected] of expectedTables.entries()) {
    const observed = after.tables[tableIndex];
    need(observed !== undefined && expected.name === observed.name && expected.strict === observed.strict && expected.withoutRowid === observed.withoutRowid &&
      canonicalJson(expected.columns) === canonicalJson(observed.columns), "complete SQL table descriptor differs");
    need(expected.rows.length === observed.rows.length, `row count differs in ${expected.name}`);
    for (const [rowIndex, row] of expected.rows.entries()) {
      const actual = observed.rows[rowIndex];
      need(actual !== undefined && sameCell(row.rowid, actual.rowid) && row.cells.length === actual.cells.length, `row identity differs in ${expected.name}`);
      for (const [index, cell] of row.cells.entries()) {
        need(sameCell(cell, actual.cells[index]), `complete SQL delta differs in ${expected.name}`);
        cells += 1; encodedBytes += cell.kind === "text" || cell.kind === "blob" ? cell.hex.length : 32;
        if (cells >= 128 || encodedBytes >= 65_536) { cells = 0; encodedBytes = 0; await yieldProofEventLoop(); }
      }
    }
    need(expected.sha256 === observed.sha256, `complete SQL digest differs in ${expected.name}`);
    await yieldProofEventLoop();
  }
  need(after.logicalSha256 === plan.expectedSqlSha256 && readerCompletion(before) === beforeCompletion && readerCompletion(after) === afterCompletion,
    "complete SQL projection or original reader changed");
  return Object.freeze({ profile: "private.current-pcb-rename-structure-full-sql-effect.v1", exactStructureUploadLogicalSqlEffect: true,
    beforeSqlSha256: before.logicalSha256, afterSqlSha256: after.logicalSha256, updatedStructureRows: plan.updatedStructureRows,
    preservedTables: before.tables.length - 1, ...LIMITATIONS });
}
