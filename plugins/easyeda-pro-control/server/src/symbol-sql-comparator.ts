/** Internal nonauthorizing effect proof. No dispatch, file reader or lifecycle authority. */
import { canonicalJson, isRecord, sha256Json, sha256Text } from "./core.ts";
import { yieldProofEventLoop } from "./cooperative-proof.ts";
import { decodeNativeHistoryChunk, materializeNativeHistoryCooperatively } from "./native-history.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { prepareProjectSymbolMetadata } from "./project-symbol-metadata.ts";
import type { ProjectSymbolMetadataPlan } from "./project-symbol-metadata.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { SqlCell, SqlRow, SqlTable, readExactSqlInventory } from "./sqlite-inventory.ts";
import { nativeProjectSymbolSqlSchema } from "./native-project-sql-schema.ts";
import { indexHistoryChunkUuids } from "./symbol-history-chunk-index.ts";

type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
type Values = Readonly<Record<string, string | bigint | null>>;
const UUID = /^[a-f0-9]{32}$/u;
const PROJECT_UUID = /^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u;
const UUID_V4 = /^[a-f0-9]{12}4[a-f0-9]{3}[89ab][a-f0-9]{15}$/u;
const MAX_PLAINTEXT_BYTES = 8_388_608;
export interface SymbolSqlWitness {
  readonly projectUuid: string;
  readonly branchUuid: string;
  readonly actorUuid: string;
  readonly client: string;
  readonly preDispatchMaxTicket: number;
  readonly serverClockMinMs: number;
  readonly serverClockMaxMs: number;
  readonly serverLocalOffsetMinutes: number;
  readonly agedHead?: Readonly<{ createdAtLiteral: string; nativeParsedLocalMs: number; nativeTimezoneOffsetMinutes: number }>;
}
export interface SymbolNewHeadSqlPlan {
  readonly profile: "easyeda-pro-control.symbol-new-head-sql-plan.v1";
  readonly beforeSqlSha256: string;
  readonly targetUuid: string;
  readonly expectedTicket: number;
  readonly executionAuthorized: false;
  readonly headEligibility: "locked" | "aged-unlocked";
}
/** Supplied comparison bounds, not an issued actor or clock provenance proof.
 * APP/SQLite times never inherit or union the separate document-clock bounds.
 */
export interface CurrentSymbolSqlWitness {
  readonly projectUuid: string;
  readonly branchUuid: string;
  readonly backendActorUuid: string;
  readonly client: string;
  readonly preDispatchMaxTicket: number;
  readonly documentClockMinMs: number;
  readonly documentClockMaxMs: number;
  readonly backendClockMinMs: number;
  readonly backendClockMaxMs: number;
  readonly backendLocalOffsetMinutes: number;
  readonly agedHead?: SymbolSqlWitness["agedHead"];
}
export interface CurrentSymbolNewHeadSqlPlan {
  readonly profile: "easyeda-pro-control.current-symbol-new-head-sql-plan.v1";
  readonly beforeSqlSha256: string;
  readonly targetUuid: string;
  readonly expectedTicket: number;
  readonly expectedDocumentEditVersion: "3.2.206";
  readonly headEligibility: "locked" | "aged-unlocked";
  readonly producerBindingVerified: false;
  readonly executionAuthorized: false;
}
interface Prepared {
  readonly before: Inventory;
  readonly witness: SymbolSqlWitness;
  readonly symbol: ProjectSymbolMetadataPlan;
  readonly historyTable: SqlTable;
  readonly historyData: SqlTable;
  readonly oldHead: string;
  readonly nextHistoryId: bigint;
  readonly nextChunkId: bigint;
  readonly username: string;
  readonly nickname: string;
  readonly branchRow: SqlRow;
  readonly projectRow: SqlRow;
  readonly structureRows: readonly SqlRow[];
  readonly sequenceRow: SqlRow;
  readonly headEligibility: "locked" | "aged-unlocked";
}
export interface DecodedSymbolSqlRawHistory {
  readonly history: NativeHistorySnapshot; readonly maximumTicket: number;
  readonly chunks: readonly string[];
  readonly links: readonly Readonly<{ historyUuid: string; historyRowId: string; chunkUuid: string; chunkRowId: string;
    ordinal: number; ciphertextBase64Sha256: string; plaintextSha256: string; plaintextBytes: number }>[];
}
const plans = new WeakMap<object, Prepared>();
const currentPlans = new WeakMap<object, Readonly<{ prepared: Prepared; documentClockMinMs: number; documentClockMaxMs: number }>>();
function need(condition: boolean, message: string): asserts condition { if (!condition) { throw new Error(message); } }
/** Read only the metadata plan retained by this original SQL preparation.
 * No decoding, caller-supplied metadata or restored authority is admitted.
 */
export function metadataPlanForOriginalSymbolSqlPlan(input: unknown): Readonly<ProjectSymbolMetadataPlan> {
  need(input !== null && typeof input === "object", "SQL metadata requires its original prepared plan.");
  const prepared = plans.get(input);
  need(prepared !== undefined, "SQL metadata requires its original prepared plan.");
  const result = structuredClone(prepared.symbol);
  Object.freeze(result.beforeTags); Object.freeze(result.peerTitles);
  return Object.freeze(result);
}
/** Current plans have their own registry. Never admit a legacy or copied plan. */
export function metadataPlanForOriginalCurrentSymbolSqlPlan(input: unknown): Readonly<ProjectSymbolMetadataPlan> {
  need(input !== null && typeof input === "object", "Current SQL metadata requires its original prepared plan.");
  const current = currentPlans.get(input);
  need(current !== undefined, "Current SQL metadata requires its original prepared plan.");
  const result = structuredClone(current.prepared.symbol);
  Object.freeze(result.beforeTags); Object.freeze(result.peerTitles);
  return Object.freeze(result);
}
function text(value: SqlCell | undefined): string {
  need(value?.kind === "text", "Expected SQL TEXT.");
  const bytes = Buffer.from(value.hex, "hex"); const result = bytes.toString("utf8");
  need(Buffer.from(result).equals(bytes), "SQL identity text is not exact UTF8."); return result;
}
function integer(value: SqlCell | undefined): bigint {
  need(value?.kind === "integer", "Expected SQL INTEGER."); return BigInt(value.decimal);
}
function table(inventory: Inventory, name: string): SqlTable {
  const entries = inventory.tables.filter((value) => value.name === name);
  need(entries.length === 1 && entries[0] !== undefined, "Required SQL table is not unique."); return entries[0];
}
function field(owner: SqlTable, row: SqlRow, name: string): SqlCell {
  const index = owner.columns.findIndex((column) => column["name"] === name);
  const value = row.cells[index]; need(index !== -1 && value !== undefined, "Required SQL column missing."); return value;
}
function unique(owner: SqlTable, name: string, value: string): SqlRow {
  const rows = owner.rows.filter((row) => text(field(owner, row, name)) === value);
  need(rows.length === 1 && rows[0] !== undefined, "Required SQL identity is not unique."); return rows[0];
}
function sqlCell(value: string | bigint | null): SqlCell {
  if (value === null) { return { kind: "null" }; }
  return typeof value === "bigint" ? { kind: "integer", decimal: value.toString() } : { kind: "text", hex: Buffer.from(value).toString("hex") };
}
function patch(owner: SqlTable, row: SqlRow, values: Values): SqlRow {
  need(Object.keys(values).every((key) => owner.columns.some((column) => column["name"] === key)), "Projection names an unknown column.");
  return { ...row, cells: row.cells.map((cell, index) => {
    const name = owner.columns[index]?.["name"];
    need(typeof name === "string", "SQL column name missing.");
    return Object.hasOwn(values, name) ? sqlCell(values[name] ?? null) : cell;
  }) };
}
function inserted(owner: SqlTable, id: bigint, values: Values): SqlRow {
  need(owner.columns.length === Object.keys(values).length, "Projection must supply every inserted SQL column.");
  return patch(owner, { rowid: sqlCell(id), cells: owner.columns.map(() => ({ kind: "null" })) }, values);
}
function nextRowid(owner: SqlTable): bigint {
  let maximum = 0n;
  for (const row of owner.rows) {
    const id = integer(field(owner, row, "id"));
    need(id > 0n && canonicalJson(row.rowid) === canonicalJson(sqlCell(id)), "History ID/rowid is outside the narrow positive profile.");
    if (id > maximum) { maximum = id; }
  }
  need(maximum < BigInt(Number.MAX_SAFE_INTEGER), "History ID allocation edge refused."); return maximum + 1n;
}
function supported(inventory: Inventory, branchUuid: string): void {
  need(readerCompletion(inventory).exitCode === 0, "SQL inventory is not an original completed reader result.");
  need(canonicalJson(inventory.schema) === canonicalJson(nativeProjectSymbolSqlSchema(branchUuid).entries), "SQL schema differs from the fixed native-source profile.");
  // oxlint-disable-next-line unicorn/text-encoding-identifier-case -- SQLite PRAGMA encoding emits this exact spelling.
  need(inventory.properties["encoding"] === "UTF-8", "First native-source profile requires UTF8 SQL text.");
}
function ticketFromRaw(plaintext: string): number {
  let maximum = 0;
  for (const record of plaintext.split("|\n")) {
    const end = record.indexOf("||"); need(end > 0, "Raw history record framing refused.");
    const header: unknown = JSON.parse(record.slice(0, end)); need(isRecord(header), "Raw history header refused.");
    if (header["ticket"] !== undefined) {
      need(typeof header["ticket"] === "number" && Number.isSafeInteger(header["ticket"]) && header["ticket"] >= 0, "Raw history ticket refused.");
      maximum = Math.max(maximum, header["ticket"]);
    }
  }
  return maximum;
}
async function selectedHistory(before: Inventory, witness: Pick<SymbolSqlWitness, "projectUuid" | "branchUuid">,
  project: SqlRow, branch: SqlRow): Promise<DecodedSymbolSqlRawHistory> {
  const histories = table(before, `project_history_${witness.branchUuid}`);
  const data = table(before, "history_data");
  const head = text(field(table(before, "branches"), branch, "history_uuid"));
  let next: string | null = head;
  const seen = new Set<string>(); const rows: SqlRow[] = [];
  while (next !== null) {
    need(UUID.test(next) && !seen.has(next) && rows.length < 64, "Selected history chain is cyclic or out of bounds.");
    seen.add(next); const row = unique(histories, "uuid", next); rows.push(row);
    need(field(histories, row, "snapshot").kind === "null" && integer(field(histories, row, "snapshot_num")) === 0n, "History snapshots are not admitted.");
    const parent = field(histories, row, "parent"); next = parent.kind === "null" ? null : text(parent);
  }
  const headRow = rows[0]; need(headRow !== undefined, "Selected history is empty.");
  const headId = integer(field(histories, headRow, "id"));
  const selectedRows = histories.rows.filter((row) => integer(field(histories, row, "id")) <= headId);
  need(selectedRows.length === histories.rows.length, "Future history rows would enter native selection after the new head.");
  need(selectedRows.length === rows.length && selectedRows.every((row) => rows.includes(row)),
    "Native ID-range history differs from the admitted complete linear chain.");
  for (let index = 1; index < rows.length; index += 1) {
    const current = rows[index]; const previous = rows[index - 1];
    need(current !== undefined && previous !== undefined && integer(field(histories, current, "id")) < integer(field(histories, previous, "id")),
      "Native ID order differs from the admitted linear chain.");
  }
  const chunkIndex = await indexHistoryChunkUuids(data);
  const chunks: string[] = [], links: DecodedSymbolSqlRawHistory["links"][number][] = []; let bytes = 0; let maximumTicket = 0;
  for (const row of rows.toReversed()) {
    const historyUuid = text(field(histories, row, "uuid")); const keyHex = text(field(histories, row, "key"));
    const num = integer(field(histories, row, "num")); need(num >= 0n && num <= 1024n, "History chunk count refused.");
    for (let index = 0; index <= Number(num); index += 1) {
      const chunk = chunkIndex.get(index === 0 ? historyUuid : `${historyUuid}-${index}`);
      need(chunk !== undefined && chunk !== null, "Required SQL identity is not unique.");
      need(text(field(data, chunk, "history_uuid")) === historyUuid, "History chunk parent mismatch.");
      const encoded = text(field(data, chunk, "dataStr"));
      const decoded = await decodeNativeHistoryChunk({ historyUuid, keyHex, dataBase64: encoded });
      bytes += Buffer.byteLength(decoded); need(bytes <= MAX_PLAINTEXT_BYTES && chunks.length < 4096, "Complete selected history exceeds its proof bound.");
      maximumTicket = Math.max(maximumTicket, ticketFromRaw(decoded)); chunks.push(decoded);
      const chunkRowId = integer(field(data, chunk, "id")).toString(), historyRowId = integer(field(histories, row, "id")).toString();
      const chunkUuid = text(field(data, chunk, "uuid"));
      links.push(Object.freeze({ historyUuid, historyRowId, chunkUuid, chunkRowId, ordinal: index,
        ciphertextBase64Sha256: sha256Text(encoded), plaintextSha256: sha256Text(decoded), plaintextBytes: Buffer.byteLength(decoded) }));
    }
  }
  const documents = await materializeNativeHistoryCooperatively(chunks, before.checkpointSha256);
  const owner = text(field(table(before, "projects"), project, "owner_uuid"));
  return { maximumTicket, chunks: Object.freeze(chunks), links: Object.freeze(links), history: { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: witness.projectUuid, projectOwnerUuid: owner,
    branchUuid: witness.branchUuid, headHistoryUuid: head, checkpointSha256: before.checkpointSha256, historyRowCount: rows.length,
    chunkCount: chunks.length, plaintextBytes: bytes, documents,
    semanticSha256: sha256Json(documents.map((document) => ({ uuid: document.uuid, docType: document.docType, semanticSha256: document.semanticSha256 }))) } };
}
/** Read the complete pre-edit chain from an original completed SQL inventory.
 * This data-only decoder issues no clock, transaction plan or writer authority.
 * The caller must bind the inventory to its original retained baseline.
 */
export async function decodeCurrentSymbolPreEditHistory(before: Inventory,
  identity: Readonly<Pick<SymbolSqlWitness, "projectUuid" | "branchUuid">>): Promise<DecodedSymbolSqlRawHistory> {
  const witness = structuredClone(identity);
  need(Object.keys(witness).length === 2 && typeof witness.projectUuid === "string" && PROJECT_UUID.test(witness.projectUuid) &&
    typeof witness.branchUuid === "string" && UUID.test(witness.branchUuid), "Current pre-edit history identity refused.");
  supported(before, witness.branchUuid);
  const completion = readerCompletion(before);
  need(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null,
    "Current pre-edit history requires an original completed SQL reader.");
  const branches = table(before, "branches"), projects = table(before, "projects");
  need(projects.rows.length === 1, "Current pre-edit history requires exactly one project row.");
  const branch = unique(branches, "uuid", witness.branchUuid), project = unique(projects, "uuid", witness.projectUuid);
  need(text(field(projects, project, "branch_uuid")) === witness.branchUuid && text(field(branches, branch, "project_uuid")) === witness.projectUuid &&
    integer(field(branches, branch, "delete_status")) === 0n && integer(field(branches, branch, "node")) === 0n,
    "Current pre-edit project/default-branch association differs.");
  const decoded = await selectedHistory(before, witness, project, branch);
  supported(before, witness.branchUuid);
  need(readerCompletion(before) === completion, "Current pre-edit SQL reader changed during decoding.");
  return decoded;
}
/** Pure decode only. The owning SQL stage separately binds this inventory to
 * its original successful edit effect and historical issued copy. */
export async function decodeRawHistoryForOriginalSymbolSqlPlan(input: unknown, after: Inventory): Promise<DecodedSymbolSqlRawHistory> {
  need(input !== null && typeof input === "object", "Raw SQL history requires its original prepared plan.");
  const prepared = plans.get(input); need(prepared !== undefined, "Raw SQL history requires its original prepared plan.");
  need(readerCompletion(after).exitCode === 0, "Raw SQL history requires its original completed reader.");
  const project = unique(table(after, "projects"), "uuid", prepared.witness.projectUuid);
  const branch = unique(table(after, "branches"), "uuid", prepared.witness.branchUuid);
  const decoded = await selectedHistory(after, prepared.witness, project, branch);
  need(decoded.maximumTicket === prepared.witness.preDispatchMaxTicket + 1, "Raw SQL history maximum differs from the original expected edit.");
  return decoded;
}
/** Data decoding only. The current lifecycle owner separately requires its
 * successful complete comparison and original post-edit inventory identity.
 */
export async function decodeRawHistoryForOriginalCurrentSymbolSqlPlan(input: unknown, after: Inventory): Promise<DecodedSymbolSqlRawHistory> {
  need(input !== null && typeof input === "object", "Current raw SQL history requires its original prepared plan.");
  const current = currentPlans.get(input);
  need(current !== undefined, "Current raw SQL history requires its original prepared plan.");
  const { prepared } = current;
  supported(after, prepared.witness.branchUuid);
  const project = unique(table(after, "projects"), "uuid", prepared.witness.projectUuid);
  const branch = unique(table(after, "branches"), "uuid", prepared.witness.branchUuid);
  const decoded = await selectedHistory(after, prepared.witness, project, branch);
  need(decoded.maximumTicket === prepared.witness.preDispatchMaxTicket + 1,
    "Current raw SQL history maximum differs from the original expected edit.");
  need(readerCompletion(after).exitCode === 0, "Current raw SQL history inventory changed during decoding.");
  return decoded;
}
export async function prepareSymbolNewHeadSqlPlan(input: Readonly<{ before: Inventory; operation: unknown; witness: SymbolSqlWitness }>): Promise<SymbolNewHeadSqlPlan> {
  const prepared = await prepareSymbolSqlState(input);
  const plan: SymbolNewHeadSqlPlan = Object.freeze({ profile: "easyeda-pro-control.symbol-new-head-sql-plan.v1", beforeSqlSha256: prepared.before.logicalSha256,
    targetUuid: prepared.symbol.targetUuid, expectedTicket: prepared.witness.preDispatchMaxTicket + 1, executionAuthorized: false, headEligibility: prepared.headEligibility });
  plans.set(plan, prepared);
  return plan;
}
/** Current 3.2.206 pure effect profile. Original inventory/plan identity is
 * retained; no native dispatch, producer provenance or lifecycle is established.
 */
export async function prepareCurrentSymbolNewHeadSqlPlan(input: Readonly<{ before: Inventory; operation: unknown; witness: CurrentSymbolSqlWitness }>): Promise<CurrentSymbolNewHeadSqlPlan> {
  const current = structuredClone(input.witness);
  need(typeof current.projectUuid === "string" && typeof current.branchUuid === "string" && typeof current.backendActorUuid === "string" &&
    typeof current.client === "string", "Current native identity witness refused.");
  for (const [minimum, maximum] of [[current.documentClockMinMs, current.documentClockMaxMs], [current.backendClockMinMs, current.backendClockMaxMs]]) {
    need(typeof minimum === "number" && typeof maximum === "number" && Number.isSafeInteger(minimum) && Number.isSafeInteger(maximum) &&
      !Object.is(minimum, -0) && !Object.is(maximum, -0) && minimum >= 0 && maximum >= minimum && maximum - minimum <= 60_000,
    "Current native clock bounds refused.");
  }
  need(!Object.is(current.preDispatchMaxTicket, -0), "Current native ticket witness refused.");
  const witness: SymbolSqlWitness = { projectUuid: current.projectUuid, branchUuid: current.branchUuid, actorUuid: current.backendActorUuid,
    client: current.client, preDispatchMaxTicket: current.preDispatchMaxTicket, serverClockMinMs: current.backendClockMinMs,
    serverClockMaxMs: current.backendClockMaxMs, serverLocalOffsetMinutes: current.backendLocalOffsetMinutes,
    ...(current.agedHead === undefined ? {} : { agedHead: current.agedHead }) };
  const prepared = await prepareSymbolSqlState({ before: input.before, operation: input.operation, witness });
  const plan: CurrentSymbolNewHeadSqlPlan = Object.freeze({ profile: "easyeda-pro-control.current-symbol-new-head-sql-plan.v1",
    beforeSqlSha256: prepared.before.logicalSha256, targetUuid: prepared.symbol.targetUuid, expectedTicket: witness.preDispatchMaxTicket + 1,
    expectedDocumentEditVersion: "3.2.206", headEligibility: prepared.headEligibility, producerBindingVerified: false, executionAuthorized: false });
  currentPlans.set(plan, { prepared, documentClockMinMs: current.documentClockMinMs, documentClockMaxMs: current.documentClockMaxMs });
  return plan;
}
async function prepareSymbolSqlState(input: Readonly<{ before: Inventory; operation: unknown; witness: SymbolSqlWitness }>): Promise<Prepared> {
  const before = input.before; const witness = structuredClone(input.witness); const operation = structuredClone(input.operation);
  need(PROJECT_UUID.test(witness.projectUuid) && UUID.test(witness.branchUuid) && UUID.test(witness.actorUuid) && /^[a-f0-9]{16}$/u.test(witness.client), "Native identity witness refused.");
  need(Number.isSafeInteger(witness.preDispatchMaxTicket) && witness.preDispatchMaxTicket >= 0 && witness.preDispatchMaxTicket < Number.MAX_SAFE_INTEGER,
    "Native ticket witness refused.");
  need(Number.isSafeInteger(witness.serverClockMinMs) && Number.isSafeInteger(witness.serverClockMaxMs) && witness.serverClockMinMs >= 0 &&
    witness.serverClockMaxMs >= witness.serverClockMinMs && witness.serverClockMaxMs - witness.serverClockMinMs <= 60_000 &&
    Number.isSafeInteger(witness.serverLocalOffsetMinutes) && Math.abs(witness.serverLocalOffsetMinutes) <= 840, "Native clock witness refused.");
  supported(before, witness.branchUuid);
  const projects = table(before, "projects"); const branches = table(before, "branches");
  need(projects.rows.length === 1, "All-project bookkeeping requires exactly one project row.");
  const projectRow = unique(projects, "uuid", witness.projectUuid); const branchRow = unique(branches, "uuid", witness.branchUuid);
  need(text(field(projects, projectRow, "branch_uuid")) === witness.branchUuid && text(field(branches, branchRow, "project_uuid")) === witness.projectUuid,
    "Selected project/branch association differs.");
  need(integer(field(branches, branchRow, "delete_status")) === 0n && integer(field(branches, branchRow, "node")) === 0n,
    "First source profile requires an active root, non-node branch.");
  const branchParent = field(branches, branchRow, "parent_uuid");
  if (branchParent.kind !== "null") {
    const parentUuid = text(branchParent); need(UUID.test(parentUuid) && parentUuid !== witness.branchUuid, "Branch parent identity refused.");
    const start = unique(branches, "uuid", parentUuid);
    need(text(field(branches, start, "name")) === "start" && integer(field(branches, start, "node")) === 1n &&
      integer(field(branches, start, "delete_status")) === 0n && text(field(branches, start, "project_uuid")) === witness.projectUuid &&
      field(branches, start, "parent_uuid").kind === "null" && field(branches, start, "history_uuid").kind === "null",
    "Only the native terminal empty start node may precede the selected branch.");
  }
  const historyTable = table(before, `project_history_${witness.branchUuid}`); const oldHead = text(field(branches, branchRow, "history_uuid"));
  const head = unique(historyTable, "uuid", oldHead);
  const locked = integer(field(historyTable, head, "is_lock"));
  need(locked === 0n || locked === 1n, "History lock state is outside its native profile.");
  if (locked === 1n) { need(witness.agedHead === undefined, "Locked-head admission does not consume an age witness."); }
  else {
    const age = witness.agedHead;
    need(age !== undefined && age.createdAtLiteral === text(field(historyTable, head, "created_at")) &&
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/u.test(age.createdAtLiteral) && Number.isSafeInteger(age.nativeParsedLocalMs) &&
      Number.isSafeInteger(age.nativeTimezoneOffsetMinutes) && age.nativeTimezoneOffsetMinutes === -witness.serverLocalOffsetMinutes,
    "Unlocked history requires an independently bound native Date/zone witness.");
    need(Math.abs(age.nativeParsedLocalMs - sqlWallMs(age.createdAtLiteral)) <= 840 * 60_000, "Native local-date parse exceeds the bounded timezone profile.");
    // APP q2 subtracts the current timezone offset from native Date(created_at).
    // Do not replace native local-date parsing with an assumed UTC parse.
    const adjusted = age.nativeParsedLocalMs - age.nativeTimezoneOffsetMinutes * 60_000;
    need(Number.isSafeInteger(adjusted) && witness.serverClockMinMs - adjusted >= 61_000,
      "History is not older than the native 60-second rounded window at every possible selection time.");
  }
  const historyData = table(before, "history_data"); const sequence = table(before, "sqlite_sequence");
  const sequenceRow = unique(sequence, "name", "history_data"); const sequenceId = integer(field(sequence, sequenceRow, "seq"));
  const minimumChunkId = nextRowid(historyData);
  need(sequenceId >= minimumChunkId - 1n && sequenceId < BigInt(Number.MAX_SAFE_INTEGER), "History-data AUTOINCREMENT baseline refused.");
  const structure = table(before, "project_structures");
  const structureRows = structure.rows.filter((row) => text(field(structure, row, "branch_uuid")) === witness.branchUuid);
  const firstStructure = structureRows[0]; need(firstStructure !== undefined, "Structure branch rows are missing.");
  const structureText = text(field(structure, firstStructure, "structure"));
  // Pinned APP2608636 selects one branch row to choose UPDATE versus INSERT.
  // APP2609198 then updates every matching branch row, without a ticket filter.
  // Equal native requests can leave duplicates. Admit only an unambiguous lower
  // Ticket choice and identical tree bytes; preserve every row and its identity.
  for (const row of structureRows) {
    need(text(field(structure, row, "project_uuid")) === witness.projectUuid && integer(field(structure, row, "ticket")) <= BigInt(witness.preDispatchMaxTicket),
      "Structure project or prior ticket refused.");
    need(text(field(structure, row, "structure")) === structureText, "Structure branch rows contain different tree bytes.");
  }
  const baseline = await selectedHistory(before, witness, projectRow, branchRow);
  need(baseline.maximumTicket === witness.preDispatchMaxTicket, "Native ticket witness differs from complete selected raw history.");
  const symbol = prepareProjectSymbolMetadata(operation, baseline.history);
  const users = table(before, "users"); const actor = users.rows.filter((row) => text(field(users, row, "uuid")) === witness.actorUuid);
  need(actor.length <= 1, "Actor is ambiguous.");
  const username = actor[0] ? text(field(users, actor[0], "username")) : "";
  const nickname = actor[0] ? text(field(users, actor[0], "nickname")) : "";
  return { before, witness, symbol, historyTable, historyData, oldHead, nextHistoryId: nextRowid(historyTable), nextChunkId: sequenceId + 1n,
    username, nickname, branchRow, projectRow, structureRows, sequenceRow, headEligibility: locked === 1n ? "locked" : "aged-unlocked" };
}
function newRow(owner: SqlTable, expectedId: bigint): SqlRow {
  const rows = owner.rows.filter((row) => integer(field(owner, row, "id")) === expectedId);
  need(rows.length === 1 && rows[0] !== undefined, "Expected exact newly allocated row is missing."); return rows[0];
}
function generatedMs(value: unknown, witness: Pick<SymbolSqlWitness, "serverClockMinMs" | "serverClockMaxMs">): number {
  need(typeof value === "number" && Number.isSafeInteger(value) && value >= witness.serverClockMinMs && value <= witness.serverClockMaxMs,
    "Generated native timestamp is outside its independent clock witness."); return value;
}
function sqlWallMs(value: string): number {
  need(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/u.test(value), "Generated SQL timestamp syntax refused.");
  const wall = Date.parse(`${value.replace(" ", "T")}Z`);
  need(Number.isFinite(wall) && new Date(wall).toISOString().slice(0, 19).replace("T", " ") === value, "Generated SQL timestamp is not a calendar value.");
  return wall;
}
function generatedSqlTime(value: string, witness: SymbolSqlWitness, local: boolean): string {
  const wall = sqlWallMs(value);
  const utc = wall - (local ? witness.serverLocalOffsetMinutes * 60_000 : 0);
  need(utc >= Math.floor(witness.serverClockMinMs / 1000) * 1000 && utc <= Math.floor(witness.serverClockMaxMs / 1000) * 1000,
    "Generated SQL timestamp is outside its independent clock witness."); return value;
}
function bodyAt(plaintext: string, index: number): Record<string, unknown> {
  const parts = plaintext.split("|\n"); need(parts.length === 3, "Expected exactly one EDIT_HEAD, DOCHEAD and META.");
  const line = parts[index]; need(line !== undefined, "Expected native record missing.");
  const separator = line.indexOf("||"); need(separator > 0, "Native record framing refused.");
  const value: unknown = JSON.parse(line.slice(separator + 2)); need(isRecord(value), "Native record body refused."); return value;
}
function sameCell(left: SqlCell, right: SqlCell | undefined): boolean {
  if (left.kind !== right?.kind) { return false; }
  if (left.kind === "null") { return true; }
  if (left.kind === "integer") { return right.kind === "integer" && left.decimal === right.decimal; }
  if (left.kind === "real") { return right.kind === "real" && left.ieee754le === right.ieee754le; }
  return (right.kind === "text" || right.kind === "blob") && left.hex === right.hex;
}
async function exactRows(expected: readonly SqlRow[], observed: readonly SqlRow[], name: string): Promise<void> {
  need(expected.length === observed.length, `Full SQL row count differs in relation ${name}.`);
  const pending = new Map<string, SqlRow>(); let cells = 0;
  for (const row of expected) {
    need(row.rowid?.kind === "integer" && !pending.has(row.rowid.decimal), "Source profile requires unique integer rowids.");
    pending.set(row.rowid.decimal, row); cells += 1;
    if (cells >= 128) { cells = 0; await yieldProofEventLoop(); }
  }
  for (const row of observed) {
    need(row.rowid?.kind === "integer", "Observed source profile requires integer rowids.");
    const wanted = pending.get(row.rowid.decimal);
    need(wanted !== undefined && wanted.cells.length === row.cells.length, `Full SQL row identity differs in relation ${name}.`);
    for (let index = 0; index < wanted.cells.length; index += 1) {
      const cell = wanted.cells[index];
      need(cell !== undefined && sameCell(cell, row.cells[index]), `Full SQL delta differs in relation ${name}.`);
      cells += 1;
      if (cells >= 128) { cells = 0; await yieldProofEventLoop(); }
    }
    pending.delete(row.rowid.decimal);
  }
  need(pending.size === 0, `Full SQL row multiplicity differs in relation ${name}.`);
}
export async function verifySymbolNewHeadSqlEffect(plan: SymbolNewHeadSqlPlan, after: Inventory): Promise<Readonly<Record<string, unknown>>> {
  const prepared = plans.get(plan); need(prepared !== undefined, "SQL comparison requires its original prepared plan.");
  const proof = await verifySymbolSqlEffect(plan, after, prepared, { resultProfile: "easyeda-pro-control.symbol-new-head-full-sql-effect.v1",
    documentClock: prepared.witness, documentEditVersion: prepared.symbol.headerEditVersion });
  return proof;
}
export async function verifyCurrentSymbolNewHeadSqlEffect(plan: CurrentSymbolNewHeadSqlPlan, after: Inventory): Promise<Readonly<Record<string, unknown>>> {
  const current = currentPlans.get(plan); need(current !== undefined, "Current SQL comparison requires its original prepared plan.");
  const proof = await verifySymbolSqlEffect(plan, after, current.prepared, { resultProfile: "easyeda-pro-control.current-symbol-new-head-full-sql-effect.v1",
    documentClock: { serverClockMinMs: current.documentClockMinMs, serverClockMaxMs: current.documentClockMaxMs }, documentEditVersion: "3.2.206" });
  return proof;
}
async function verifySymbolSqlEffect(plan: Pick<SymbolNewHeadSqlPlan, "expectedTicket" | "headEligibility">, after: Inventory, prepared: Prepared,
  profile: Readonly<{ resultProfile: string; documentClock: Pick<SymbolSqlWitness, "serverClockMinMs" | "serverClockMaxMs">; documentEditVersion: string | null }>): Promise<Readonly<Record<string, unknown>>> {
  const { before, witness, symbol, historyTable, historyData } = prepared;
  supported(after, witness.branchUuid);
  need(canonicalJson(before.properties) === canonicalJson(after.properties), "Persisted SQL properties changed.");
  const afterHistory = table(after, historyTable.name); const afterData = table(after, "history_data");
  const head = newRow(afterHistory, prepared.nextHistoryId); const chunk = newRow(afterData, prepared.nextChunkId);
  const headUuid = text(field(afterHistory, head, "uuid")); const key = text(field(afterHistory, head, "key"));
  need(UUID_V4.test(headUuid) && UUID.test(key) && !historyTable.rows.some((row) => text(field(historyTable, row, "uuid")) === headUuid) &&
    !historyData.rows.some((row) => text(field(historyData, row, "uuid")).split("-")[0] === headUuid || text(field(historyData, row, "history_uuid")) === headUuid),
  "Generated history UUID/key is invalid or collides with baseline history.");
  const encoded = text(field(afterData, chunk, "dataStr"));
  const plaintext = await decodeNativeHistoryChunk({ historyUuid: headUuid, keyHex: key, dataBase64: encoded });
  const editTime = generatedMs(bodyAt(plaintext, 0)["updateTime"], witness);
  const documentTime = generatedMs(bodyAt(plaintext, 1)["updateTime"], profile.documentClock);
  const header = { docType: "SYMBOL", client: witness.client, uuid: symbol.targetUuid, updateTime: documentTime, version: String(documentTime),
    ...(profile.documentEditVersion === null ? {} : { editVersion: profile.documentEditVersion }) };
  const metadata = { title: symbol.desiredTitle, description: symbol.desiredDescription, tags: symbol.beforeTags, docType: 2, source: symbol.beforeSource };
  const expectedPlaintext = `${JSON.stringify({ type: "EDIT_HEAD" })}||${JSON.stringify({ uuid: witness.actorUuid, username: prepared.username, nickname: prepared.nickname, updateTime: editTime })}|\n` +
    `${JSON.stringify({ type: "DOCHEAD", ticket: plan.expectedTicket })}||${JSON.stringify(header)}|\n` +
    `${JSON.stringify({ type: "META", ticket: plan.expectedTicket, id: "META" })}||${JSON.stringify(metadata)}`;
  need(plaintext === expectedPlaintext, "New authenticated history differs from exact intended raw records.");
  const headTime = generatedSqlTime(text(field(afterHistory, head, "created_at")), witness, false);
  const chunkTime = generatedSqlTime(text(field(afterData, chunk, "created_at")), witness, false);
  const projects = table(before, "projects"); const branches = table(before, "branches"); const structures = table(before, "project_structures");
  const afterProjects = table(after, "projects");
  const afterProject = unique(afterProjects, "uuid", witness.projectUuid);
  const projectTime = generatedSqlTime(text(field(afterProjects, afterProject, "updated_at")), witness, true);
  const sequence = table(before, "sqlite_sequence");
  const expected = new Map<string, readonly SqlRow[]>([[historyTable.name, [...historyTable.rows, inserted(historyTable, prepared.nextHistoryId, { id: prepared.nextHistoryId, uuid: headUuid,
    parent: prepared.oldHead, snapshot: null, key, is_lock: 0n, num: 0n, created_at: headTime, updated_at: headTime,
    lock_time: "1970-01-01 08:00:00", snapshot_num: 0n })]],
    ["history_data", [...historyData.rows, inserted(historyData, prepared.nextChunkId, { id: prepared.nextChunkId, uuid: headUuid,
      history_uuid: headUuid, dataStr: encoded, created_at: chunkTime, updated_at: chunkTime })]],
    ["projects", [patch(projects, prepared.projectRow, { updated_at: projectTime, modifier_uuid: witness.actorUuid })]],
    ["branches", branches.rows.map((row) => row === prepared.branchRow ? patch(branches, row, { history_uuid: headUuid }) : row)],
    ["project_structures", structures.rows.map((row) => prepared.structureRows.includes(row) ? patch(structures, row, { ticket: BigInt(plan.expectedTicket) }) : row)],
    ["sqlite_sequence", sequence.rows.map((row) => row === prepared.sequenceRow ? patch(sequence, row, { seq: prepared.nextChunkId }) : row)]]);
  need(before.tables.length === after.tables.length, "SQL table inventory changed.");
  for (const prior of before.tables) {
    const observed = table(after, prior.name);
    need(!prior.withoutRowid && !observed.withoutRowid && prior.strict === observed.strict &&
      canonicalJson(prior.columns) === canonicalJson(observed.columns), `Full SQL descriptor differs in relation ${prior.name}.`);
    await exactRows(expected.get(prior.name) ?? prior.rows, observed.rows, prior.name);
    await yieldProofEventLoop();
  }
  return Object.freeze({ profile: profile.resultProfile, exactLogicalSqlEffect: true, headEligibility: plan.headEligibility,
    beforeSqlSha256: before.logicalSha256, afterSqlSha256: after.logicalSha256, expectedPlaintextSha256: sha256Json(expectedPlaintext),
    newHistoryUuid: headUuid, newHistoryId: prepared.nextHistoryId.toString(), newChunkId: prepared.nextChunkId.toString(),
    generatedCiphertextSha256: sha256Json(encoded), expectedTicket: plan.expectedTicket, executionAuthorized: false,
    producerBindingVerified: false, generationClosureVerified: false, persistentUploadReplayExcluded: false, reopened: false });
}
