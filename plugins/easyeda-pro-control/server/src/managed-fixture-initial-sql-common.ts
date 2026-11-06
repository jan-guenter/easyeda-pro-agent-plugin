import { z } from "zod";
import { canonicalJson, sha256Text } from "./core.ts";
import { decodeNativeHistoryChunk } from "./native-history.ts";
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
const uuid = z.string().regex(/^[a-f0-9]{32}$/u);
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

export interface GeneratedFixtureInitialSqlInput {
  readonly archive: Buffer; readonly inventory: NativeSqlInventory; readonly rawWindowsPath: string;
  readonly sourceCreatedEpochMs: number; readonly sourceModifiedEpochMs: number;
}
/** Complete initial native storage checks shared by separately fixed PCB and
 * schematic source profiles. This comparison issues no target or native owner;
 * each caller must qualify its exact source and structure before invoking it.
 */
export async function qualifyGeneratedInitialSqlRows(inputValue: GeneratedFixtureInitialSqlInput,
  expectedValue: Readonly<{ source: Buffer; title: string; structureJson: string }>): Promise<Readonly<{
    projectUuid: string; actor: string; branchUuid: string; historyUuid: string; plaintext: string; nativeLocalOffsetMinutes: number;
  }>> {
  const input = Object.freeze({ inventory: inputValue.inventory, rawWindowsPath: inputValue.rawWindowsPath,
    sourceCreatedEpochMs: inputValue.sourceCreatedEpochMs, sourceModifiedEpochMs: inputValue.sourceModifiedEpochMs });
  const expected = Object.freeze({ title: expectedValue.title, structureJson: expectedValue.structureJson });
  const source = Buffer.from(expectedValue.source); const projectUuid = sha256Text(input.rawWindowsPath); readerCompletion(input.inventory);
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
  exact(project, { uuid: projectUuid, archive: 0, name: expected.title, content: "", cbb_project: 0, thumb: "", ticket: 1, g_ticket: 1,
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
  exact(one("project_structures"), { id: 1, ticket: 1, project_uuid: projectUuid, branch_uuid: branchUuid, structure: expected.structureJson }, "initial structure");
  exact(one("db_versions"), MANAGED_FIXTURE_INITIAL_BASE_SQL_ROWS.db_versions.fields, "fixed database version");
  exact(one("users"), MANAGED_FIXTURE_INITIAL_BASE_SQL_ROWS.users.fields, "fixed vendor user");
  const sequence = get("sqlite_sequence", 3);
  for (const [index, name, count] of [[1, "branches", 2], [2, "history_data", 1], [3, "project_structures", 1]] as const) {
    const entry = sequence.find((value) => value.rowid === index); need(entry !== undefined, "initial sequence rowid"); exact(entry.fields, { name, seq: count }, "initial sequence");
  }
  const nonempty = new Set(["projects", "project_members", "branches", historyName, "history_data", "project_structures", "db_versions", "users", "sqlite_sequence"]);
  for (const table of input.inventory.tables) { if (!nonempty.has(table.name)) { need(table.rows.length === 0, `${table.name} exact empty baseline`); } }
  readerCompletion(input.inventory);
  return Object.freeze({ projectUuid, actor, branchUuid, historyUuid, plaintext, nativeLocalOffsetMinutes: offsetMinimum });
}
