import { z } from "zod";
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { qualifyManagedFixtureArchive } from "./managed-fixture-archive.ts";
import { readManagedLibraryZip } from "./managed-library-files-zip.ts";
import { MANAGED_FIXTURE_LINE_BODY, MANAGED_FIXTURE_VIA_BODY } from "./managed-fixture-generator.ts";
import { decodeNativeHistoryChunk } from "./native-history.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "./native-history.ts";
import { nativeProjectSymbolSqlSchema } from "./native-project-sql-schema.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { NativeSqlInventory, SqlCell, SqlTable } from "./sqlite-inventory-core.ts";

type Value = string | number | null;
type Row = Readonly<Record<string, Value>>;
/** Public vendor defaults derived from pinned TT+c2/u2/l2/f2/L2/dT, not
 * credentials or rows copied from a user's profile/project database. */
export const MANAGED_FIXTURE_INITIAL_BASE_SQL_ROWS = Object.freeze({
  db_versions: Object.freeze({ rowid: 1, fields: Object.freeze({ key: "sqlite", value: "25.10.31.1" }) }),
  users: Object.freeze({ rowid: 1, fields: Object.freeze({ uuid: "0819f05c4eef4c71ace90d822a990e87", username: "LCSC", nickname: "LCSC", password: "LCSC", preference: null, avatar: "", team: 0 }) }),
});
const qualifications = new WeakMap<object, Readonly<{ text: string; inventory: NativeSqlInventory }>>();
const uuid = z.string().regex(/^[a-f0-9]{32}$/u);
const sourceRowSchema = z.object({ header: z.object({ type: z.string(), id: z.string().optional(), ticket: z.number().int().nonnegative().optional() }).strict(), body: z.record(z.string(), z.unknown()) });
export interface QualifiedGeneratedFixtureTarget {
  readonly schema: "easyeda-pro-control.qualified-generated-fixture-target.v1";
  readonly target: Readonly<{ rawWindowsPath: string; projectUuid: string; branchUuid: string; documentUuid: string; expectedSourceSha256: string }>;
  readonly archiveSha256: string;
  readonly qualificationSha256: string;
  readonly inventoryLogicalSha256: string;
  readonly sourceSha256: string;
  readonly nativeLocalOffsetMinutes: number;
  readonly sourceCreatedEpochMs: number;
  readonly sourceModifiedEpochMs: number;
  readonly completeInitialSqlRowsQualified: true;
  readonly exactInitialNativePayloadQualified: true;
  readonly untickedDocHeadQualified: true;
  readonly writerClockAuthority: false;
  readonly registrationVerified: false;
  readonly designExecutionAuthorized: false;
}
function need(value: boolean, reason: string): asserts value { if (!value) { throw new Error(`Generated fixture initial SQL refused: ${reason}.`); } }
function cell(value: SqlCell | undefined): Value {
  need(value !== undefined, "missing SQL cell");
  if (value.kind === "null") { return null; }
  if (value.kind === "integer") { const number = Number(value.decimal); need(Number.isSafeInteger(number) && String(number) === value.decimal, "noncanonical or large integer"); return number; }
  need(value.kind === "text", "unexpected blob/real cell"); const bytes = Buffer.from(value.hex, "hex"), text = bytes.toString("utf8");
  need(Buffer.from(text, "utf8").equals(bytes), "non-UTF8 text"); return text;
}
function rows(table: SqlTable): readonly { rowid: Value; fields: Row }[] {
  const columns = table.columns.map((column) => { need(typeof column["name"] === "string", "column name"); return column["name"]; });
  need(new Set(columns).size === columns.length, "duplicate columns");
  return table.rows.map((row) => { need(row.cells.length === columns.length && row.rowid !== null, "row/column coverage");
    return { rowid: cell(row.rowid), fields: Object.fromEntries(columns.map((name, index) => [name, cell(row.cells[index])])) }; });
}
function exact(actual: Row, expected: Row, name: string): void { need(canonicalJson(actual) === canonicalJson(expected), `${name} complete row`); }
function string(value: Value | undefined, name: string): string { need(typeof value === "string", name); return value; }
function sqlTime(value: Value | undefined): number {
  const text = string(value, "SQL datetime"); need(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/u.test(text), "SQL datetime syntax");
  const ms = Date.parse(`${text.replace(" ", "T")}Z`);
  need(Number.isFinite(ms) && new Date(ms).toISOString().slice(0, 19).replace("T", " ") === text, "SQL datetime calendar"); return ms;
}
function defaultTimes(row: Row, minimum: number, maximum: number): Readonly<{ created_at: string; updated_at: string }> {
  const created = sqlTime(row["created_at"]), updated = sqlTime(row["updated_at"]);
  need(created === updated && created >= minimum && created <= maximum, "UTC default creation/update bookkeeping");
  return { created_at: string(row["created_at"], "created_at"), updated_at: string(row["updated_at"], "updated_at") };
}

/** Qualify a new initial baseline, not a user-project delta. Every table, row,
 * column, raw encrypted history payload and original archive record is covered.
 * Dynamic IDs must be native UUIDs linked exactly across their source-defined
 * rows. File birth/mtime bound SQLite UTC defaults and the unique local So
 * formatter offset. This timestamp evidence grants no writer clock authority.
 */
export async function qualifyGeneratedFixtureInitialSql(inputValue: Readonly<{
  archive: Buffer; inventory: NativeSqlInventory; rawWindowsPath: string;
  sourceCreatedEpochMs: number; sourceModifiedEpochMs: number;
}>): Promise<Readonly<{ qualification: QualifiedGeneratedFixtureTarget; history: NativeHistorySnapshot }>> {
  const input = Object.freeze({ archive: Buffer.from(inputValue.archive), inventory: inputValue.inventory, rawWindowsPath: inputValue.rawWindowsPath,
    sourceCreatedEpochMs: inputValue.sourceCreatedEpochMs, sourceModifiedEpochMs: inputValue.sourceModifiedEpochMs });
  readerCompletion(input.inventory);
  const original = qualifyManagedFixtureArchive(input.archive), projectUuid = sha256Text(input.rawWindowsPath);
  need(input.rawWindowsPath.endsWith(`\\${original.expectedDestinationBasename}`) && /^Codex_(?:via_only|line_and_via)_[a-f0-9]{16}$/u.test(original.manifest.title), "original generated filename");
  const source = readManagedLibraryZip(input.archive).get(original.source.member); need(source !== undefined, "original source member");
  const entries = source.toString("utf8").slice(0, -2).split("|\n").map((text) => { const boundary = text.indexOf("||");
    return sourceRowSchema.parse({ header: JSON.parse(text.slice(0, boundary)) as unknown, body: JSON.parse(text.slice(boundary + 2)) as unknown }); });
  const head = entries[0], meta = entries[1]; need(head !== undefined && meta !== undefined, "generated header/META");
  const line = original.manifest.title.startsWith("Codex_line_and_via_");
  need(canonicalJson(entries.map((entry) => entry.header.type)) === canonicalJson(line ? ["DOCHEAD", "META", "VIA", "LINE"] : ["DOCHEAD", "META", "VIA"]), "generated family roster");
  need(head.header.ticket === undefined && Object.keys(head.header).length === 1 && meta.header.id === "META" && meta.header.ticket === 1, "exact initial unticked header and META clock");
  need(canonicalJson(meta.body) === canonicalJson({ title: "PCB1", parent: "", source: "", board: "", zIndex: null }) &&
    canonicalJson(entries[2]?.body) === canonicalJson(MANAGED_FIXTURE_VIA_BODY) && (!line || canonicalJson(entries[3]?.body) === canonicalJson(MANAGED_FIXTURE_LINE_BODY)), "exact fixed geometry and META");
  const documentUuid = uuid.parse(head.body["uuid"]); const client = z.string().regex(/^[a-f0-9]{16}$/u).parse(head.body["client"]);
  need(head.body["docType"] === "PCB" && head.body["editVersion"] === "3.2.209" && typeof head.body["updateTime"] === "number" && head.body["version"] === String(head.body["updateTime"]), "original source header");
  const minimum = Math.floor(input.sourceCreatedEpochMs / 1000) * 1000; const maximum = Math.ceil(input.sourceModifiedEpochMs / 1000) * 1000;
  need(Number.isSafeInteger(minimum) && Number.isSafeInteger(maximum) && minimum > 0 && maximum >= minimum && maximum - minimum < 59_000, "bounded fresh native file clock interval");
  const tableMap = new Map(input.inventory.tables.map((table) => [table.name, table]));
  need(tableMap.size === input.inventory.tables.length, "complete unique table roster");
  const get = (name: string, count: number): readonly { rowid: Value; fields: Row }[] => {
    const table = tableMap.get(name); need(table !== undefined && table.rows.length === count, `${name} row count`); return rows(table);
  };
  const one = (name: string): Row => { const value = get(name, 1)[0]; need(value !== undefined && value.rowid === 1, `${name} initial rowid`); return value.fields; };
  const project = one("projects"); const actor = uuid.parse(project["owner_uuid"]), branchUuid = uuid.parse(project["branch_uuid"]);
  need(canonicalJson(input.inventory.schema) === canonicalJson(nativeProjectSymbolSqlSchema(branchUuid).entries), "complete fixed native SQL schema");
  const historyName = `project_history_${branchUuid}`, historyRow = one(historyName), historyUuid = uuid.parse(historyRow["uuid"]), key = uuid.parse(historyRow["key"]);
  const historyData = one("history_data"); const data = string(historyData["dataStr"], "encrypted history data");
  const plaintext = await decodeNativeHistoryChunk({ historyUuid, keyHex: key, dataBase64: data });
  const boundary = plaintext.indexOf("|\n"); need(boundary > 0, "native modification prefix");
  const prefix = plaintext.slice(0, boundary), prefixBoundary = prefix.indexOf("||");
  need(prefix.slice(0, prefixBoundary) === '{"type":"EDIT_HEAD"}', "exact native EDIT_HEAD");
  const modify = z.object({ uuid: z.literal(actor), username: z.string(), nickname: z.string(), updateTime: z.number().int().positive() }).strict().parse(JSON.parse(prefix.slice(prefixBoundary + 2)) as unknown);
  const vendorActor = actor === "0819f05c4eef4c71ace90d822a990e87"; const username = vendorActor ? "LCSC" : "";
  need(modify.username === username && modify.nickname === username && modify.updateTime >= minimum && modify.updateTime <= maximum, "native fresh-file actor prefix");
  need(plaintext === `{"type":"EDIT_HEAD"}||${JSON.stringify({ uuid: actor, username, nickname: username, updateTime: modify.updateTime })}|\n${source.toString("utf8")}`, "complete native plaintext including exact supplied headers/body");
  const updatedLocal = sqlTime(project["updated_at"]);
  // Solve the native So(local Date) relation directly. This is a bounded row
  // Normalization, not a timezone scan, current clock or writer age authority.
  const offsetMinimum = Math.ceil((updatedLocal - maximum) / 60_000); const offsetMaximum = Math.floor((updatedLocal - Math.max(minimum, Math.floor(modify.updateTime / 1000) * 1000)) / 60_000);
  need(offsetMinimum === offsetMaximum && offsetMinimum >= -840 && offsetMinimum <= 840, "unique source-consistent native local datetime offset");
  const projectCreated = sqlTime(project["created_at"]); need(projectCreated >= minimum && projectCreated <= maximum, "project UTC creation default");
  exact(project, { uuid: projectUuid, archive: 0, name: original.manifest.title, content: "", cbb_project: 0, thumb: "", ticket: 1, g_ticket: 1,
    owner_uuid: actor, creator_uuid: actor, created_at: string(project["created_at"], "created_at"), updated_at: string(project["updated_at"], "updated_at"), modifier_uuid: actor,
    boards: "{}", block_symbol_attrs_groups: "{}", pcb_count: 0, branch_uuid: branchUuid, default_sheet: "" }, "projects");
  const members = one("project_members"); exact(members, { role: 1, project_uuid: projectUuid, user_uuid: actor, ...defaultTimes(members, minimum, maximum) }, "project_members");
  const branches = get("branches", 2); const selected = branches.find((entry) => entry.fields["uuid"] === branchUuid), start = branches.find((entry) => entry.fields["node"] === 1);
  need(start !== undefined && selected !== undefined && start.rowid === 1 && selected.rowid === 2, "fresh start/selected branch rowids");
  const startUuid = uuid.parse(start.fields["uuid"]); need(startUuid !== branchUuid, "distinct native branch UUIDs");
  exact(start.fields, { id: 1, uuid: startUuid, project_uuid: projectUuid, name: "start", history_uuid: null, creator_uuid: actor, description: "", parent_uuid: null,
    modifier_uuid: actor, node: 1, delete_status: 0, ...defaultTimes(start.fields, minimum, maximum) }, "start branch");
  exact(selected.fields, { id: 2, uuid: branchUuid, project_uuid: projectUuid, name: "main", history_uuid: historyUuid, creator_uuid: actor, description: "", parent_uuid: startUuid,
    modifier_uuid: actor, node: 0, delete_status: 0, ...defaultTimes(selected.fields, minimum, maximum) }, "selected branch");
  exact(historyRow, { id: 1, uuid: historyUuid, parent: null, snapshot: null, key, is_lock: 0, num: 0,
    ...defaultTimes(historyRow, minimum, maximum), lock_time: "1970-01-01 08:00:00", snapshot_num: 0 }, "project history");
  exact(historyData, { id: 1, uuid: historyUuid, history_uuid: historyUuid, dataStr: data, ...defaultTimes(historyData, minimum, maximum) }, "history data");
  const directory = input.rawWindowsPath.slice(0, input.rawWindowsPath.lastIndexOf("\\"));
  const structure = { boards: {}, schematics: {}, sheets: {}, pcbs: { [documentUuid]: { uuid: documentUuid, title: "PCB1", board: "", zIndex: null,
    parent_uuid: "", source: "", version: head.body["version"], updateTime: head.body["updateTime"] } }, panels: {}, blockSymbols: {}, owner: { uuid: `${directory}/`, username: "", nickname: "" } };
  exact(one("project_structures"), { id: 1, ticket: 1, project_uuid: projectUuid, branch_uuid: branchUuid, structure: JSON.stringify(structure) }, "initial structure");
  exact(one("db_versions"), MANAGED_FIXTURE_INITIAL_BASE_SQL_ROWS.db_versions.fields, "fixed database version");
  exact(one("users"), MANAGED_FIXTURE_INITIAL_BASE_SQL_ROWS.users.fields, "fixed vendor user");
  const sequence = get("sqlite_sequence", 3);
  for (const [index, name, count] of [[1, "branches", 2], [2, "history_data", 1], [3, "project_structures", 1]] as const) {
    const entry = sequence.find((value) => value.rowid === index); need(entry !== undefined, "initial sequence rowid"); exact(entry.fields, { name, seq: count }, "initial sequence");
  }
  const nonempty = new Set(["projects", "project_members", "branches", historyName, "history_data", "project_structures", "db_versions", "users", "sqlite_sequence"]);
  for (const table of input.inventory.tables) { if (!nonempty.has(table.name)) { need(table.rows.length === 0, `${table.name} exact empty baseline`); } }
  const records = entries.slice(1).map((entry, index) => {
    need(entry.header.id !== undefined && entry.header.ticket === index + 1, "exact META/primitive IDs/tickets");
    return { id: entry.header.id, type: entry.header.type, ticket: entry.header.ticket, client, body: entry.body };
  }).toSorted((left, right) => left.id.localeCompare(right.id));
  const document: NativeDocumentSnapshot = { uuid: documentUuid, docType: "PCB", metadata: head.body, records,
    semanticSha256: sha256Json({ uuid: documentUuid, docType: "PCB", metadata: head.body, records: records.map(({ id, type, body }) => ({ id, type, body })) }) };
  const history: NativeHistorySnapshot = { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid, projectOwnerUuid: actor, branchUuid,
    headHistoryUuid: historyUuid, checkpointSha256: input.inventory.checkpointSha256, historyRowCount: 1, chunkCount: 1, plaintextBytes: Buffer.byteLength(plaintext), documents: [document],
    semanticSha256: sha256Json([{ uuid: documentUuid, docType: "PCB", semanticSha256: document.semanticSha256 }]) };
  const target = Object.freeze({ rawWindowsPath: input.rawWindowsPath, projectUuid, branchUuid, documentUuid, expectedSourceSha256: input.inventory.checkpointSha256 });
  const qualification: QualifiedGeneratedFixtureTarget = Object.freeze({ schema: "easyeda-pro-control.qualified-generated-fixture-target.v1", target,
    archiveSha256: original.archiveSha256, qualificationSha256: original.qualificationSha256, inventoryLogicalSha256: input.inventory.logicalSha256,
    sourceSha256: sha256Text(plaintext), nativeLocalOffsetMinutes: offsetMinimum, sourceCreatedEpochMs: input.sourceCreatedEpochMs,
    sourceModifiedEpochMs: input.sourceModifiedEpochMs, completeInitialSqlRowsQualified: true, exactInitialNativePayloadQualified: true,
    untickedDocHeadQualified: true, writerClockAuthority: false, registrationVerified: false, designExecutionAuthorized: false });
  readerCompletion(input.inventory);
  qualifications.set(qualification, { text: canonicalJson(qualification), inventory: input.inventory }); return Object.freeze({ qualification, history });
}
export function assertOriginalGeneratedFixtureTarget(value: QualifiedGeneratedFixtureTarget): void {
  need(qualifications.get(value)?.text === canonicalJson(value), "original issued generated target required");
}
/** Actual immutable completed reader object, retained by the qualification.
 * It supplies the source side of the one-field VACUUM projection; JSON copies
 * and caller-created inventory reports cannot serve as either side.
 */
export function originalGeneratedFixtureInventory(value: QualifiedGeneratedFixtureTarget): NativeSqlInventory {
  assertOriginalGeneratedFixtureTarget(value); const original = qualifications.get(value);
  need(original !== undefined, "original initial inventory"); readerCompletion(original.inventory); return original.inventory;
}
