/** Pure inverse SQL relation for the exact newly created copy. Original reader
 * and comparison identities are required; this issues no native delete permit. */
/* oxlint-disable import/max-dependencies -- The inverse joins original forward-copy evidence, complete SQL/history and the independently pinned native tombstone encoding. */
import { types } from "node:util";
import { z } from "zod";
import { canonicalJson, isRecord, sha256Text } from "./core.ts";
import { compareCompleteClosedSql } from "./closed-sql-equality.ts";
import { yieldProofEventLoop } from "./cooperative-proof.ts";
import { completedCurrentFootprintCopyV2SqlSource } from "./current-footprint-copy-v2-sql.ts";
import type { CurrentFootprintCopyV2SqlPlan, CurrentFootprintCopyV2SqlSource } from "./current-footprint-copy-v2-sql.ts";
import { prepareCurrentFootprintDeletePlan } from "./current-footprint-delete-plan.ts";
import { decodeNativeHistoryChunk, isNativeDocumentDeleted } from "./native-history.ts";
import { nativeProjectSymbolSqlSchema } from "./native-project-sql-schema.ts";
import { MAX_ENCODED_BYTES } from "./sqlite-inventory-core.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { SqlCell, SqlRow, SqlTable, readExactSqlInventory } from "./sqlite-inventory.ts";
import { decodeCurrentFootprintSourceHistory } from "./symbol-sql-comparator.ts";

type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
type Values = Readonly<Record<string, string | bigint | null>>;
const UUID = /^[a-f0-9]{32}$/u, UUID_V4 = /^[a-f0-9]{12}4[a-f0-9]{3}[89ab][a-f0-9]{15}$/u;
const integerSchema = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).refine((value) => !Object.is(value, -0));
const timeSchema = integerSchema.max(8_640_000_000_000_000);
const offsetSchema = z.number().int().min(-840).max(840).refine((value) => !Object.is(value, -0));
const witnessSchema = z.object({ projectUuid: z.string().refine(value => /^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u.exec(value)?.[0] === value), branchUuid: z.string().length(32).regex(UUID),
  backendActorUuid: z.string().length(32).regex(UUID), client: z.string().length(16).regex(/^[a-f0-9]{16}$/u), preDispatchMaxTicket: integerSchema.max(Number.MAX_SAFE_INTEGER - 1),
  documentClockMinMs: timeSchema, documentClockMaxMs: timeSchema, backendClockMinMs: timeSchema, backendClockMaxMs: timeSchema,
  backendLocalOffsetMinutes: offsetSchema, managerUserAbsent: z.literal(true), agedHead: z.object({ createdAtLiteral: z.string().length(19).regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/u),
    nativeParsedLocalMs: timeSchema, nativeTimezoneOffsetMinutes: offsetSchema }).strict().optional(),
}).strict().refine((value) => value.documentClockMinMs > 0 && value.documentClockMaxMs >= value.documentClockMinMs && value.documentClockMaxMs - value.documentClockMinMs <= 60_000 &&
  value.backendClockMaxMs >= value.backendClockMinMs && value.backendClockMaxMs - value.backendClockMinMs <= 60_000);

export type CurrentFootprintDeleteSqlWitness = z.infer<typeof witnessSchema>;
export interface CurrentFootprintDeleteSqlPlan {
  readonly profile: "private.current-footprint-delete-sql-plan.v1";
  readonly beforeSqlSha256: string; readonly originalCopySqlSha256: string;
  readonly targetUuid: string; readonly expectedTicket: number;
  readonly headEligibility: "locked" | "aged-unlocked";
  readonly maximumPlaintextBytes: number; readonly maximumCiphertextBase64Bytes: number; readonly maximumEncodedSqlBytes: number;
  readonly expectedStructureRequests: 0; readonly onlyOriginalCreatedCopySelected: true;
  readonly documentClockCalls: 1; readonly explicitSaveAttempts: 0;
  readonly executionAuthorized: false; readonly producerBindingVerified: false; readonly dependencyEligibilityVerified: false;
}
interface Prepared {
  readonly before: Inventory; readonly copyAfter: Inventory; readonly copySqlPlan: CurrentFootprintCopyV2SqlPlan;
  readonly copyEffect: unknown; readonly copySource: CurrentFootprintCopyV2SqlSource;
  readonly witness: CurrentFootprintDeleteSqlWitness; readonly targetUuid: string;
  readonly project: SqlRow; readonly branch: SqlRow; readonly history: SqlTable; readonly data: SqlTable;
  readonly oldHead: string; readonly historyId: bigint; readonly chunkId: bigint; readonly dataSequence: SqlRow;
  readonly username: string; readonly nickname: string;
}
export interface CurrentFootprintDeleteSqlSource {
  readonly projectUuid: string; readonly branchUuid: string; readonly targetUuid: string;
  readonly before: Inventory; readonly after: Inventory; readonly documentClock: number;
  readonly workerUpload: string; readonly appendPlaintextSha256: string;
}
const plans = new WeakMap<CurrentFootprintDeleteSqlPlan, Prepared>();
const completedEffects = new WeakMap<object, Readonly<{ plan: CurrentFootprintDeleteSqlPlan; after: Inventory; source: CurrentFootprintDeleteSqlSource }>>();
function need(condition: boolean, message: string): asserts condition { if (!condition) { throw new Error(`Current footprint delete SQL: ${message}`); } }
function requireOriginalDeleteInputs(prepared: Prepared): void {
  need(completedCurrentFootprintCopyV2SqlSource(prepared.copySqlPlan, prepared.copyEffect, prepared.copyAfter) === prepared.copySource,
    "original completed copy relation changed");
  supported(prepared.before, prepared.witness.branchUuid);
}
function workerUpload(prepared: Prepared, clock: number): string {
  return prepareCurrentFootprintDeletePlan({ targetUuid: prepared.targetUuid, client: prepared.witness.client,
    maximumTicketBeforeClock: prepared.witness.preDispatchMaxTicket, maximumTicketAfterClock: prepared.witness.preDispatchMaxTicket,
    documentClock: clock, managerUserAbsent: true, editorVersion: "3.2.209" }).workerUpload;
}
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
  need(Object.entries(fields).every(([name, scalar]) => {
    if (name === "agedHead") { return true; }
    if (name === "managerUserAbsent") { return scalar === true; }
    return strings.has(name) ? typeof scalar === "string" : numbers.has(name) && typeof scalar === "number";
  }),
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
function headEligibility(head: SqlRow, owner: SqlTable, witness: z.infer<typeof witnessSchema>): CurrentFootprintDeleteSqlPlan["headEligibility"] {
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

/** The inverse baseline must equal the original fully verified copy effect.
 * A supplied target UUID or matching digest cannot choose another document.
 * Fresh unlocked heads are refused; this append-only model requires the
 * existing locked/aged selection proof, never a SQL repair or forced lock. */
export async function prepareCurrentFootprintDeleteSqlPlan(input: Readonly<{
  copySqlPlan: CurrentFootprintCopyV2SqlPlan; copyEffect: unknown; copyAfter: Inventory; before: Inventory;
  witness: CurrentFootprintDeleteSqlWitness;
}>): Promise<CurrentFootprintDeleteSqlPlan> {
  const captured = dataFields(input, ["copySqlPlan", "copyEffect", "copyAfter", "before", "witness"]);
  const { before, copyAfter, copyEffect, copySqlPlan } = input;
  need(captured["before"] === before && captured["copyAfter"] === copyAfter && captured["copyEffect"] === copyEffect && captured["copySqlPlan"] === copySqlPlan,
    "original input identity changed");
  const witness = captureWitness(captured["witness"]);
  const copySource = completedCurrentFootprintCopyV2SqlSource(copySqlPlan, copyEffect, copyAfter);
  const targetUuid = copySource.append.targetUuid;
  const identity = copySource.copyPlan.source;
  need(witness.projectUuid === identity.projectUuid && witness.branchUuid === identity.branchUuid &&
    witness.documentClockMinMs >= copySource.documentClocks[1], "inverse identity or document clock differs");
  supported(before, witness.branchUuid); await compareCompleteClosedSql(copyAfter, before);
  const completion = readerCompletion(before), decoded = await decodeCurrentFootprintSourceHistory(before, { projectUuid: witness.projectUuid, branchUuid: witness.branchUuid });
  const target = decoded.history.documents.find(document => document.uuid === targetUuid);
  need(target !== undefined && target.docType === "FOOTPRINT" && !isNativeDocumentDeleted(target) &&
    target.records.every(record => record.id !== "DELETE_DOC") && decoded.maximumTicket === witness.preDispatchMaxTicket,
    "original live copied target or maximum ticket differs");
  const projects = table(before, "projects"); need(projects.rows.length === 1, "singleton native project required");
  const branches = table(before, "branches");
  const project = unique(projects, "uuid", witness.projectUuid);
  const branch = unique(branches, "uuid", witness.branchUuid);
  branchParent(before, branch, witness);
  const history = table(before, `project_history_${witness.branchUuid}`), oldHead = text(field(branches, branch, "history_uuid"));
  const eligibility = headEligibility(unique(history, "uuid", oldHead), history, witness);
  const data = table(before, "history_data");
  const allocation = sequenceAllocation(before, data);
  const prepared: Prepared = { before, copyAfter, copySqlPlan, copyEffect, copySource, witness, targetUuid, project, branch, history, data, oldHead,
    historyId: maximumId(history) + 1n, chunkId: allocation.id, dataSequence: allocation.row, ...actor(before, witness.backendActorUuid) };
  const maximumPlaintextBytes = Buffer.byteLength(`${editRow(prepared, witness.backendClockMaxMs)}|\n${workerUpload(prepared, witness.documentClockMaxMs)}`);
  const capacity = sqlBudget(prepared, maximumPlaintextBytes);
  need(decoded.history.plaintextBytes + maximumPlaintextBytes <= 8_388_608, "complete raw-history capacity exceeded");
  requireOriginalDeleteInputs(prepared); need(readerCompletion(before) === completion, "original reader changed during preparation");
  const plan: CurrentFootprintDeleteSqlPlan = Object.freeze({ profile: "private.current-footprint-delete-sql-plan.v1",
    beforeSqlSha256: before.logicalSha256, originalCopySqlSha256: copyAfter.logicalSha256, targetUuid,
    expectedTicket: witness.preDispatchMaxTicket + 1, headEligibility: eligibility, maximumPlaintextBytes, ...capacity,
    expectedStructureRequests: 0, onlyOriginalCreatedCopySelected: true, documentClockCalls: 1, explicitSaveAttempts: 0,
    executionAuthorized: false, producerBindingVerified: false, dependencyEligibilityVerified: false });
  plans.set(plan, prepared); return plan;
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

/** Native deleteData reports success even when uploadLocal returns false.
 * Only this complete, independently read SQL relation proves the modeled effect. */
export async function verifyCurrentFootprintDeleteSqlEffect(plan: CurrentFootprintDeleteSqlPlan, after: Inventory): Promise<Readonly<Record<string, unknown>>> {
  const prepared = plans.get(plan); need(prepared !== undefined, "original prepared plan required"); requireOriginalDeleteInputs(prepared);
  const { before, witness, history, data } = prepared;
  supported(after, witness.branchUuid); const completion = readerCompletion(after);
  need(canonicalJson(before.properties) === canonicalJson(after.properties), "persisted SQL properties changed");
  const afterHistory = table(after, history.name);
  const afterData = table(after, "history_data");
  const head = newRow(afterHistory, prepared.historyId);
  const chunk = newRow(afterData, prepared.chunkId);
  const headUuid = text(field(afterHistory, head, "uuid")), key = text(field(afterHistory, head, "key"));
  need(UUID_V4.test(headUuid) && UUID.test(key) && !history.rows.some(row => text(field(history, row, "uuid")) === headUuid) &&
    !data.rows.some(row => text(field(data, row, "uuid")).split("-")[0] === headUuid || text(field(data, row, "history_uuid")) === headUuid), "history UUID/key invalid or colliding");
  const encoded = text(field(afterData, chunk, "dataStr")); need(encoded.length <= plan.maximumCiphertextBase64Bytes, "history encoding exceeds reserved capacity");
  const plaintext = await decodeNativeHistoryChunk({ historyUuid: headUuid, keyHex: key, dataBase64: encoded });
  const lines = plaintext.split("|\n");
  need(Buffer.byteLength(plaintext) <= plan.maximumPlaintextBytes && lines.length === 3, "exact bounded three-record delete append required");
  const edit = generatedTime(rowTime(lines[0]), witness.backendClockMinMs, witness.backendClockMaxMs);
  const clock = generatedTime(rowTime(lines[1]), witness.documentClockMinMs, witness.documentClockMaxMs);
  const upload = workerUpload(prepared, clock);
  need(plaintext === `${editRow(prepared, edit)}|\n${upload}`, "exact actor/client/single-clock tombstone differs");
  const headTime = sqlTime(text(field(afterHistory, head, "created_at")), witness);
  const chunkTime = sqlTime(text(field(afterData, chunk, "created_at")), witness);
  const projects = table(before, "projects");
  const branches = table(before, "branches");
  const sequence = table(before, "sqlite_sequence");
  const afterProjects = table(after, "projects"), projectAfter = unique(afterProjects, "uuid", witness.projectUuid);
  const projectTime = sqlTime(text(field(afterProjects, projectAfter, "updated_at")), witness, true);
  const expected = new Map<string, readonly SqlRow[]>([[history.name, [...history.rows, insert(history, prepared.historyId,
    { id: prepared.historyId, uuid: headUuid, parent: prepared.oldHead, snapshot: null, key, is_lock: 0n, num: 0n,
      created_at: headTime, updated_at: headTime, lock_time: "1970-01-01 08:00:00", snapshot_num: 0n })]],
  ["history_data", [...data.rows, insert(data, prepared.chunkId, { id: prepared.chunkId, uuid: headUuid, history_uuid: headUuid, dataStr: encoded, created_at: chunkTime, updated_at: chunkTime })]],
  ["projects", [patch(projects, prepared.project, { updated_at: projectTime, modifier_uuid: witness.backendActorUuid })]],
  ["branches", branches.rows.map(row => row === prepared.branch ? patch(branches, row, { history_uuid: headUuid }) : row)],
  ["sqlite_sequence", sequence.rows.map(row => row === prepared.dataSequence ? patch(sequence, row, { seq: prepared.chunkId }) : row)]]);
  need(before.tables.length === after.tables.length, "SQL table inventory changed");
  for (const prior of before.tables) {
    const observed = table(after, prior.name);
    need(!prior.withoutRowid && !observed.withoutRowid && prior.strict === observed.strict && canonicalJson(prior.columns) === canonicalJson(observed.columns), `SQL descriptor differs in ${prior.name}`);
    await exactRows(expected.get(prior.name) ?? prior.rows, observed.rows, prior.name); await yieldProofEventLoop();
  }
  const identity = { projectUuid: witness.projectUuid, branchUuid: witness.branchUuid };
  const prior = await decodeCurrentFootprintSourceHistory(before, identity);
  const next = await decodeCurrentFootprintSourceHistory(after, identity);
  need(next.history.documents.length === prior.history.documents.length && next.history.historyRowCount === prior.history.historyRowCount + 1 &&
    next.chunks.length === prior.chunks.length + 1 && canonicalJson(next.chunks.slice(0, -1)) === canonicalJson(prior.chunks) &&
    canonicalJson(next.links.slice(0, -1)) === canonicalJson(prior.links) && next.chunks.at(-1) === plaintext && next.maximumTicket === plan.expectedTicket,
    "complete original history/append relationship differs");
  const targets = new Map(next.history.documents.map(document => [document.uuid, document]));
  for (const document of prior.history.documents) {
    const observed = targets.get(document.uuid); need(observed !== undefined, "document disappeared from retained history");
    if (document.uuid === plan.targetUuid) {
      const headBody: unknown = JSON.parse(upload.slice(upload.indexOf("||") + 2, upload.indexOf("|\n")));
      need(isNativeDocumentDeleted(observed) && canonicalJson(observed.metadata) === canonicalJson(headBody) &&
        canonicalJson(observed.records.filter(record => record.id !== "DELETE_DOC")) === canonicalJson(document.records), "target tombstone or preserved records differ");
    } else { need(observed.semanticSha256 === document.semanticSha256, "peer document changed"); }
  }
  requireOriginalDeleteInputs(prepared); need(readerCompletion(after) === completion, "original complete reader changed");
  const effect = Object.freeze({ profile: "private.current-footprint-delete-full-sql-effect.v1", targetUuid: plan.targetUuid,
    beforeSqlSha256: before.logicalSha256, afterSqlSha256: after.logicalSha256, expectedTicket: plan.expectedTicket,
    exactLogicalSqlEffect: true, structureRowsUnchanged: true, allPeerDocumentsUnchanged: true, targetHistoricalRecordsRetained: true,
    plaintextSha256: sha256Text(plaintext), workerUploadSha256: sha256Text(upload), newHistoryUuid: headUuid,
    newHistoryId: prepared.historyId.toString(), newChunkId: prepared.chunkId.toString(),
    executionAuthorized: false, producerBindingVerified: false, dependencyEligibilityVerified: false, nativeClockProvenanceVerified: false,
    completionProved: false, generationClosureVerified: false, savedAbsenceVerified: false, reopened: false });
  const source = Object.freeze({ projectUuid: witness.projectUuid, branchUuid: witness.branchUuid, targetUuid: plan.targetUuid,
    before, after, documentClock: clock, workerUpload: upload, appendPlaintextSha256: sha256Text(plaintext) });
  completedEffects.set(effect, Object.freeze({ plan, after, source })); return effect;
}
/** Historical successful relation only; no copied effect or reader is adopted. */
export function completedCurrentFootprintDeleteSqlSource(plan: CurrentFootprintDeleteSqlPlan, effect: unknown, after: Inventory): CurrentFootprintDeleteSqlSource {
  need(effect !== null && typeof effect === "object", "original successful delete effect required");
  const completed = completedEffects.get(effect), prepared = plans.get(plan);
  need(completed !== undefined && prepared !== undefined && completed.plan === plan && completed.after === after, "original successful effect/reader relation required");
  requireOriginalDeleteInputs(prepared); supported(after, prepared.witness.branchUuid); return completed.source;
}
