/** Complete logical SQL comparison for the narrow token-selected String Save
 * transcript. Supplied clocks and matching rows grant no runtime authority. */
import { types } from "node:util";
import { z } from "zod";
import { yieldProofEventLoop } from "./cooperative-proof.ts";
import { canonicalJson, isRecord } from "./core.ts";
import { compareCurrentPcbStringHistory, requireOriginalCurrentPcbStringHistory } from "./current-pcb-string-history.ts";
import type { CurrentPcbStringHistoryProjection } from "./current-pcb-string-history.ts";
import { currentPcbStoredHeaderSchema } from "./current-pcb-stored-header.ts";
import { decodeNativeHistoryChunk, isNativeDocumentDeleted, parseNativeRecords } from "./native-history.ts";
import { nativeProjectSymbolSqlSchema } from "./native-project-sql-schema.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { SqlCell, SqlRow, SqlTable, readExactSqlInventory } from "./sqlite-inventory.ts";
// Reuse the document-neutral complete raw-history decoder, not a symbol owner.
import { decodeCurrentSymbolPreEditHistory } from "./symbol-sql-comparator.ts";

type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
type Values = Readonly<Record<string, string | bigint | null>>;
const uuid = z.string().regex(/^[a-f0-9]{32}$/u);
const time = z.number().int().nonnegative().max(253_402_214_400_000).refine(value => !Object.is(value, -0));
const offset = z.number().int().min(-840).max(840).refine(value => !Object.is(value, -0));
const witnessSchema = z.object({ projectUuid: z.string().regex(/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u), branchUuid: uuid,
  backendClockMinMs: time, backendClockMaxMs: time, backendLocalOffsetMinutes: offset,
  agedHead: z.object({ createdAtLiteral: z.string(), nativeParsedLocalMs: time, nativeTimezoneOffsetMinutes: offset }).strict().optional(),
}).strict().refine(value => value.backendClockMaxMs >= value.backendClockMinMs &&
  value.backendClockMaxMs - value.backendClockMinMs <= 60_000);
export type CurrentPcbStringSqlWitness = z.infer<typeof witnessSchema>;
const LIMITS = Object.freeze({ executionAuthorized: false, originalSaveVerified: false, completePublicationIntervalVerified: false,
  producerBindingVerified: false, actorProvenanceVerified: false, clockProvenanceVerified: false,
  uploadCountVerified: false, queueCompletionVerified: false, generationClosureVerified: false,
  persistentUploadReplayExcluded: false, reopened: false } as const);
export interface CurrentPcbStringSqlPlan extends Readonly<typeof LIMITS> {
  readonly profile: "private.current-pcb-string-sql-plan.v1";
  readonly beforeSqlSha256: string; readonly targetUuid: string; readonly primitiveId: string;
  readonly publicationTicket: number; readonly headTicket: number;
  readonly originalDocumentCount: number; readonly originalHistoryRows: number; readonly originalHistoryChunks: number;
  readonly updatedStructureRows: number; readonly headEligibility: "locked" | "aged-unlocked";
}
interface Prepared {
  readonly before: Inventory; readonly history: CurrentPcbStringHistoryProjection; readonly witness: CurrentPcbStringSqlWitness;
  readonly project: SqlRow; readonly branch: SqlRow; readonly oldHead: string;
  readonly historyTable: SqlTable; readonly dataTable: SqlTable; readonly structures: readonly SqlRow[];
  readonly nextHistoryId: bigint; readonly nextChunkId: bigint; readonly sequence: SqlRow; readonly structureText: string;
}
const plans = new WeakMap<CurrentPcbStringSqlPlan, Prepared>();
function need(value: boolean, message: string): asserts value {
  if (!value) { throw new Error(`Current PCB String SQL: ${message}.`); }
}
function own(value: unknown, names?: readonly string[]): Record<string, unknown> {
  need(value !== null && typeof value === "object" && !types.isProxy(value), "plain data required");
  const prototype: unknown = Object.getPrototypeOf(value);
  need(prototype === Object.prototype || prototype === null, "plain data required");
  const keys = Reflect.ownKeys(value);
  need(keys.length <= 8 && keys.every(key => typeof key === "string" && (names === undefined || names.includes(key))) &&
    (names === undefined || keys.length === names.length), "input fields differ");
  return Object.fromEntries(keys.map(key => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    need(typeof key === "string" && descriptor !== undefined && Object.hasOwn(descriptor, "value") &&
      descriptor.enumerable === true, "own data fields required"); return [key, descriptor.value as unknown];
  }));
}
function text(value: SqlCell | undefined): string {
  need(value?.kind === "text", "SQL TEXT required");
  const bytes = Buffer.from(value.hex, "hex"), result = bytes.toString("utf8");
  need(Buffer.from(result).equals(bytes), "exact SQL UTF8 required"); return result;
}
function integer(value: SqlCell | null | undefined): bigint {
  need(value?.kind === "integer", "SQL INTEGER required"); return BigInt(value.decimal);
}
function table(inventory: Inventory, name: string): SqlTable {
  const rows = inventory.tables.filter(entry => entry.name === name);
  need(rows.length === 1 && rows[0] !== undefined, "unique SQL table required"); return rows[0];
}
function field(owner: SqlTable, row: SqlRow, name: string): SqlCell {
  const index = owner.columns.findIndex(column => column["name"] === name), result = row.cells[index];
  need(index !== -1 && result !== undefined, "SQL column missing"); return result;
}
function unique(owner: SqlTable, name: string, value: string): SqlRow {
  const rows = owner.rows.filter(row => text(field(owner, row, name)) === value);
  need(rows.length === 1 && rows[0] !== undefined, "unique SQL row required"); return rows[0];
}
function cell(value: string | bigint | null): SqlCell {
  if (value === null) { return { kind: "null" }; }
  return typeof value === "bigint" ? { kind: "integer", decimal: String(value) } : { kind: "text", hex: Buffer.from(value).toString("hex") };
}
function patch(owner: SqlTable, row: SqlRow, values: Values): SqlRow {
  need(Object.keys(values).every(key => owner.columns.some(column => column["name"] === key)), "unknown SQL patch column");
  return { ...row, cells: row.cells.map((value, index) => {
    const name = owner.columns[index]?.["name"]; need(typeof name === "string", "SQL column name missing");
    return Object.hasOwn(values, name) ? cell(values[name] ?? null) : value;
  }) };
}
function insert(owner: SqlTable, id: bigint, values: Values): SqlRow {
  need(owner.columns.length === Object.keys(values).length, "complete SQL insertion required");
  return patch(owner, { rowid: cell(id), cells: owner.columns.map(() => ({ kind: "null" })) }, values);
}
function maximumId(owner: SqlTable): bigint {
  let maximum = 0n;
  for (const row of owner.rows) {
    const id = integer(field(owner, row, "id"));
    need(id > 0n && integer(row.rowid) === id, "SQL ID and rowid differ"); if (id > maximum) { maximum = id; }
  }
  need(maximum < BigInt(Number.MAX_SAFE_INTEGER), "SQL allocation capacity exhausted"); return maximum;
}
function supported(inventory: Inventory, branch: string): void {
  const completion = readerCompletion(inventory);
  need(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null, "original completed SQL reader required");
  need(canonicalJson(inventory.schema) === canonicalJson(nativeProjectSymbolSqlSchema(branch).entries), "native SQL schema differs");
  // oxlint-disable-next-line unicorn/text-encoding-identifier-case -- Exact SQLite PRAGMA value.
  need(inventory.properties["encoding"] === "UTF-8", "native SQL encoding differs");
}
function wallTime(value: string): number {
  need(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/u.test(value), "SQL timestamp syntax differs");
  const result = Date.parse(`${value.replace(" ", "T")}Z`);
  need(Number.isFinite(result) && new Date(result).toISOString().slice(0, 19).replace("T", " ") === value, "SQL timestamp calendar differs");
  return result;
}
function headEligibility(owner: SqlTable, row: SqlRow, witness: CurrentPcbStringSqlWitness): CurrentPcbStringSqlPlan["headEligibility"] {
  const locked = integer(field(owner, row, "is_lock")); need(locked === 0n || locked === 1n, "history lock differs");
  if (locked === 1n) { need(witness.agedHead === undefined, "locked head must not consume age witness"); return "locked"; }
  const age = witness.agedHead;
  need(age !== undefined && age.createdAtLiteral === text(field(owner, row, "created_at")) &&
    age.nativeTimezoneOffsetMinutes === -witness.backendLocalOffsetMinutes &&
    Math.abs(age.nativeParsedLocalMs - wallTime(age.createdAtLiteral)) <= 840 * 60_000, "independent head age required");
  const adjusted = age.nativeParsedLocalMs - age.nativeTimezoneOffsetMinutes * 60_000;
  need(Number.isSafeInteger(adjusted) && witness.backendClockMinMs - adjusted >= 61_000, "head is not aged throughout upload window");
  return "aged-unlocked";
}
function actorBinding(before: Inventory, history: CurrentPcbStringHistoryProjection): string {
  const actor: unknown = JSON.parse(history.backendActorText); need(isRecord(actor) && typeof actor["uuid"] === "string", "backend actor missing");
  const users = table(before, "users");
  need(users.rows.length <= 4096, "project users exceed bound");
  const rows = users.rows.filter(row => text(field(users, row, "uuid")) === actor["uuid"]);
  need(rows.length <= 1, "project actor ambiguous");
  const row = rows[0];
  need(actor["username"] === (row === undefined ? "" : text(field(users, row, "username"))) &&
    actor["nickname"] === (row === undefined ? "" : text(field(users, row, "nickname"))), "backend actor differs from original SQL names");
  return actor["uuid"];
}
function structureAfter(beforeText: string, history: CurrentPcbStringHistoryProjection, header: z.infer<typeof currentPcbStoredHeaderSchema>,
  meta: Readonly<Record<string, unknown>>, owner: string): string {
  need(Buffer.byteLength(beforeText) <= 2_097_152, "structure exceeds bound");
  const value: unknown = JSON.parse(beforeText);
  need(isRecord(value) && JSON.stringify(value) === beforeText && Object.keys(value).join(",") ===
    "boards,schematics,sheets,pcbs,panels,blockSymbols,owner", "complete native structure framing differs");
  for (const key of ["boards", "schematics", "sheets", "pcbs", "panels", "blockSymbols"]) { need(isRecord(value[key]), "structure collection missing"); }
  need(isRecord(value["owner"]) && value["owner"]["uuid"] === owner && isRecord(value["pcbs"]), "structure owner differs");
  const target = value["pcbs"][history.targetUuid];
  need(isRecord(target) && target["uuid"] === history.targetUuid && target["title"] === meta["title"] &&
    target["board"] === meta["board"] && target["parent_uuid"] === "" && target["source"] === "" &&
    target["version"] === header.version && target["updateTime"] === header.updateTime &&
    (target["docType"] === undefined || target["docType"] === 3) &&
    Object.keys(target).every(key => ["uuid", "title", "board", "zIndex", "docType", "parent_uuid", "source", "version", "updateTime"].includes(key)),
  "target structure and stored baseline differ");
  // No title/META update. All peer and unknown peer fields remain byte-exact
  // After JSON framing admission; only the target's native clock fields change.
  target["version"] = String(history.saveTime); target["updateTime"] = history.saveTime;
  return JSON.stringify(value);
}

/** Conditional APP52f51ce4 bB new-head transaction + xB bookkeeping and
 * lower-ticket BB structure UPDATE. Extra backend calls, a young-head append,
 * equal-ticket structure INSERT, assets and other documents are not modeled.
 * The caller must not infer one upload from create: this plan admits only the
 * explicit one-upload transcript represented by its original history input. */
export async function prepareCurrentPcbStringSql(input: Readonly<{ before: Inventory;
  history: CurrentPcbStringHistoryProjection; witness: CurrentPcbStringSqlWitness }>): Promise<CurrentPcbStringSqlPlan> {
  const raw = own(input, ["before", "history", "witness"]);
  const before = input.before, history = requireOriginalCurrentPcbStringHistory(input.history);
  need(raw["before"] === before && raw["history"] === history, "input identity changed");
  const witnessRaw = own(raw["witness"]);
  const witness = witnessSchema.parse({ ...witnessRaw,
    ...(witnessRaw["agedHead"] === undefined ? {} : { agedHead: own(witnessRaw["agedHead"]) }) });
  supported(before, witness.branchUuid); const completion = readerCompletion(before);
  need(history.backendTime >= witness.backendClockMinMs && history.backendTime <= witness.backendClockMaxMs, "backend clock differs");
  actorBinding(before, history);
  const decoded = await decodeCurrentSymbolPreEditHistory(before, { projectUuid: witness.projectUuid, branchUuid: witness.branchUuid });
  need(decoded.maximumTicket + 1 === history.publicationTicket, "complete original maximum ticket differs");
  need(decoded.history.historyRowCount < 64 && decoded.history.chunkCount < 4096 &&
    decoded.history.plaintextBytes + Buffer.byteLength(history.chunkText) <= 8_388_608, "post-upload history capacity exceeded");
  const targets = decoded.history.documents.filter(document => document.uuid === history.targetUuid);
  const target = targets[0];
  need(targets.length === 1 && target !== undefined && target.docType === "PCB" && !isNativeDocumentDeleted(target), "active PCB target required");
  const header = currentPcbStoredHeaderSchema.parse(target.metadata);
  const metadata = target.records.filter(record => record.type === "META" || record.id === "META");
  need(metadata.length === 1 && metadata[0]?.type === "META" && metadata[0].id === "META", "unique target META required");
  const meta = metadata[0].body;
  need(isRecord(meta) && meta["parent"] === "" && meta["source"] === "", "ordinary root PCB required");
  need(!target.records.some(record => record.type === "STRING" || record.id === history.primitiveId), "first-String baseline already contains String or ID");
  // Raw histories retain deleted records. Reject prior reuse of the generated
  // ID anywhere, and validate every target DOCHEAD, not only its final materialization.
  let scannedBytes = 0, scannedRows = 0;
  for (const chunk of decoded.chunks) {
    for (const line of chunk.split("|\n")) {
      const records = parseNativeRecords(line);
      const record = records[0];
      need(records.length === 1 && record !== undefined, "raw history framing differs");
      need(record.header["id"] !== history.primitiveId, "native ID appeared in original history");
      if (record.header["type"] === "DOCHEAD" && record.body?.["uuid"] === history.targetUuid) {
        need(currentPcbStoredHeaderSchema.parse(record.body).updateTime < history.saveTime, "Save clock does not exceed every old header");
      }
      scannedBytes += Buffer.byteLength(line); scannedRows += 1;
      if (scannedRows >= 128 || scannedBytes >= 65_536) { scannedBytes = 0; scannedRows = 0; await yieldProofEventLoop(); }
    }
    await yieldProofEventLoop();
  }
  const branches = table(before, "branches"), projects = table(before, "projects");
  need(projects.rows.length === 1, "all-project bookkeeping requires one project row");
  const branch = unique(branches, "uuid", witness.branchUuid), project = unique(projects, "uuid", witness.projectUuid);
  need(text(field(projects, project, "branch_uuid")) === witness.branchUuid &&
    text(field(branches, branch, "project_uuid")) === witness.projectUuid && integer(field(branches, branch, "node")) === 0n &&
    integer(field(branches, branch, "delete_status")) === 0n, "project/branch relation differs");
  const parent = field(branches, branch, "parent_uuid");
  if (parent.kind !== "null") {
    const start = unique(branches, "uuid", text(parent));
    need(start !== branch && text(field(branches, start, "name")) === "start" && integer(field(branches, start, "node")) === 1n &&
      integer(field(branches, start, "delete_status")) === 0n && text(field(branches, start, "project_uuid")) === witness.projectUuid &&
      field(branches, start, "parent_uuid").kind === "null" && field(branches, start, "history_uuid").kind === "null", "terminal start parent required");
  }
  const dataTable = table(before, "history_data"), historyTable = table(before, `project_history_${witness.branchUuid}`);
  const oldHead = text(field(branches, branch, "history_uuid"));
  const eligibility = headEligibility(historyTable, unique(historyTable, "uuid", oldHead), witness);
  const sequenceTable = table(before, "sqlite_sequence");
  const sequence = unique(sequenceTable, "name", "history_data");
  const sequenceValue = integer(field(sequenceTable, sequence, "seq"));
  need(sequenceValue >= maximumId(dataTable) && sequenceValue < BigInt(Number.MAX_SAFE_INTEGER), "chunk allocation capacity exhausted");
  const structureTable = table(before, "project_structures");
  const structures = structureTable.rows.filter(row => text(field(structureTable, row, "branch_uuid")) === witness.branchUuid);
  const firstStructure = structures[0];
  need(firstStructure !== undefined, "baseline structure rows missing");
  const originalStructure = text(field(structureTable, firstStructure, "structure"));
  const structureText = structureAfter(originalStructure, history, header, meta, text(field(projects, project, "owner_uuid")));
  for (const row of structures) {
    need(text(field(structureTable, row, "project_uuid")) === witness.projectUuid &&
      integer(field(structureTable, row, "ticket")) >= 0n && integer(field(structureTable, row, "ticket")) < BigInt(history.headTicket) &&
      text(field(structureTable, row, "structure")) === originalStructure, "all selected structures need identical bytes and lower tickets");
  }
  const plan: CurrentPcbStringSqlPlan = Object.freeze({ profile: "private.current-pcb-string-sql-plan.v1",
    beforeSqlSha256: before.logicalSha256, targetUuid: history.targetUuid, primitiveId: history.primitiveId,
    publicationTicket: history.publicationTicket, headTicket: history.headTicket, originalDocumentCount: decoded.history.documents.length,
    originalHistoryRows: decoded.history.historyRowCount, originalHistoryChunks: decoded.history.chunkCount,
    updatedStructureRows: structures.length, headEligibility: eligibility, ...LIMITS });
  need(readerCompletion(before) === completion, "original completed reader changed");
  plans.set(plan, { before, history, witness, project, branch, oldHead, historyTable, dataTable, structures,
    nextHistoryId: maximumId(historyTable) + 1n, nextChunkId: sequenceValue + 1n, sequence, structureText });
  return plan;
}
function allocated(owner: SqlTable, id: bigint): SqlRow {
  const rows = owner.rows.filter(row => integer(field(owner, row, "id")) === id);
  need(rows.length === 1 && rows[0] !== undefined, "new SQL allocation missing"); return rows[0];
}
function boundedTime(value: string, witness: CurrentPcbStringSqlWitness, local = false): string {
  const parsed = wallTime(value) - (local ? witness.backendLocalOffsetMinutes * 60_000 : 0);
  need(parsed >= Math.floor(witness.backendClockMinMs / 1000) * 1000 &&
    parsed <= Math.floor(witness.backendClockMaxMs / 1000) * 1000, "SQL time outside supplied upload window"); return value;
}
async function exactRows(expected: readonly SqlRow[], observed: readonly SqlRow[], name: string): Promise<void> {
  need(expected.length === observed.length, `row count differs in ${name}`);
  const rows = new Map<string, SqlRow>();
  for (const row of expected) {
    const id = integer(row.rowid).toString(); need(!rows.has(id), "duplicate original rowid"); rows.set(id, row);
  }
  let bytes = 0, cells = 0;
  for (const row of observed) {
    const id = integer(row.rowid).toString(), wanted = rows.get(id);
    need(wanted !== undefined && wanted.cells.length === row.cells.length, `row identity differs in ${name}`);
    for (const [index, value] of wanted.cells.entries()) {
      const serialized = canonicalJson(value);
      need(serialized === canonicalJson(row.cells[index]), `complete SQL delta differs in ${name}`);
      cells += 1; bytes += serialized.length;
      if (cells >= 128 || bytes >= 65_536) { cells = 0; bytes = 0; await yieldProofEventLoop(); }
    }
    rows.delete(id);
  }
  need(rows.size === 0, `row multiplicity differs in ${name}`);
}
/** Compare every table/cell and exact authenticated plaintext. This proves a
 * supplied closed-data relation, not actual closure, upload count or reopening. */
export async function verifyCurrentPcbStringSql(plan: CurrentPcbStringSqlPlan, after: Inventory): Promise<Readonly<Record<string, unknown>>> {
  const prepared = plans.get(plan); need(prepared !== undefined, "original String SQL plan required");
  const { before, history, witness, historyTable, dataTable } = prepared;
  supported(before, witness.branchUuid); supported(after, witness.branchUuid);
  const afterCompletion = readerCompletion(after), beforeCompletion = readerCompletion(before);
  need(canonicalJson(before.properties) === canonicalJson(after.properties), "SQL properties changed");
  const afterData = table(after, dataTable.name), afterHistory = table(after, historyTable.name);
  const chunk = allocated(afterData, prepared.nextChunkId), head = allocated(afterHistory, prepared.nextHistoryId);
  const headUuid = text(field(afterHistory, head, "uuid")), key = text(field(afterHistory, head, "key"));
  need(/^[a-f0-9]{12}4[a-f0-9]{3}[89ab][a-f0-9]{15}$/u.test(headUuid) && /^[a-f0-9]{32}$/u.test(key) &&
    !historyTable.rows.some(row => text(field(historyTable, row, "uuid")) === headUuid) &&
    !dataTable.rows.some(row => text(field(dataTable, row, "uuid")).split("-")[0] === headUuid ||
      text(field(dataTable, row, "history_uuid")) === headUuid), "new history identity or key differs");
  const encoded = text(field(afterData, chunk, "dataStr"));
  need(encoded.length <= 65_536, "single-upload ciphertext exceeds bound");
  compareCurrentPcbStringHistory(history, await decodeNativeHistoryChunk({ historyUuid: headUuid, keyHex: key, dataBase64: encoded }));
  const chunkTime = boundedTime(text(field(afterData, chunk, "created_at")), witness);
  const headTime = boundedTime(text(field(afterHistory, head, "created_at")), witness);
  const branches = table(before, "branches"), projects = table(before, "projects"), structures = table(before, "project_structures");
  const afterProjects = table(after, "projects"), sequences = table(before, "sqlite_sequence");
  const projectAfter = unique(afterProjects, "uuid", witness.projectUuid);
  const projectTime = boundedTime(text(field(afterProjects, projectAfter, "updated_at")), witness, true);
  const expected = new Map<string, readonly SqlRow[]>([
    [historyTable.name, [...historyTable.rows, insert(historyTable, prepared.nextHistoryId, { id: prepared.nextHistoryId,
      uuid: headUuid, parent: prepared.oldHead, snapshot: null, key, is_lock: 0n, num: 0n,
      created_at: headTime, updated_at: headTime, lock_time: "1970-01-01 08:00:00", snapshot_num: 0n })]],
    ["history_data", [...dataTable.rows, insert(dataTable, prepared.nextChunkId, { id: prepared.nextChunkId, uuid: headUuid,
      history_uuid: headUuid, dataStr: encoded, created_at: chunkTime, updated_at: chunkTime })]],
    ["projects", [patch(projects, prepared.project, { updated_at: projectTime, modifier_uuid: actorBinding(before, history) })]],
    ["branches", branches.rows.map(row => row === prepared.branch ? patch(branches, row, { history_uuid: headUuid }) : row)],
    ["project_structures", structures.rows.map(row => prepared.structures.includes(row) ? patch(structures, row,
      { ticket: BigInt(history.headTicket), structure: prepared.structureText }) : row)],
    ["sqlite_sequence", sequences.rows.map(row => row === prepared.sequence ? patch(sequences, row, { seq: prepared.nextChunkId }) : row)],
  ]);
  need(before.tables.length === after.tables.length, "SQL table roster changed");
  for (const prior of before.tables) {
    const observed = table(after, prior.name);
    need(!prior.withoutRowid && !observed.withoutRowid && prior.strict === observed.strict &&
      canonicalJson(prior.columns) === canonicalJson(observed.columns), "SQL table descriptor differs");
    await exactRows(expected.get(prior.name) ?? prior.rows, observed.rows, prior.name); await yieldProofEventLoop();
  }
  need(readerCompletion(before) === beforeCompletion && readerCompletion(after) === afterCompletion, "original SQL inputs changed");
  return Object.freeze({ profile: "private.current-pcb-string-full-sql-effect.v1", exactLogicalSqlEffect: true,
    supportedSingleUploadSqlEffectVerified: true, beforeSqlSha256: before.logicalSha256, afterSqlSha256: after.logicalSha256,
    originalHistoryRowsPreserved: plan.originalHistoryRows, originalHistoryChunksPreserved: plan.originalHistoryChunks,
    originalDocumentCount: plan.originalDocumentCount, updatedStructureRows: plan.updatedStructureRows,
    publicationTicket: history.publicationTicket, headTicket: history.headTicket, ...LIMITS });
}
