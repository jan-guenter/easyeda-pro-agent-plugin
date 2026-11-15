/** Actual native branch API data compared with the complete original SQL
 * preimage. Observed date normalization is data, never a writer clock. */
import { z } from "zod";
import { canonicalJson, sha256Text } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_GENERATED_INITIAL_BRANCH_API_FIELDS as FIELDS } from "./current-generated-initial-branch-source.ts";
import type { NativeSqlInventory, SqlCell, SqlTable } from "./sqlite-inventory-core.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export interface CurrentFootprintForwardWriterBranchData {
 readonly projectUuid: string; readonly branchUuid: string; readonly historyUuid: string;
 readonly body: string; readonly sha256: string; readonly observedLocalOffsetMinutes: number; readonly writerClockAuthority: false;
}
type Scalar = string | number | null;
function need(value: boolean): asserts value { if (!value) { throw new Error("FORWARD_WRITER_BRANCH_DATA"); } }
function scalar(cell: SqlCell | undefined): Scalar {
 need(cell !== undefined); if (cell.kind === "null") { return null; }
 if (cell.kind === "integer") { const value = Number(cell.decimal); need(Number.isSafeInteger(value) && String(value) === cell.decimal); return value; }
 need(cell.kind === "text"); const bytes = Buffer.from(cell.hex, "hex"), value = bytes.toString("utf8"); need(Buffer.from(value).equals(bytes)); return value;
}
function rows(table: SqlTable | undefined): readonly Readonly<Record<string, Scalar>>[] {
 need(table !== undefined); const names = table.columns.map(column => { need(typeof column["name"] === "string"); return column["name"]; }); need(new Set(names).size === names.length);
 return table.rows.map(row => { need(row.cells.length === names.length); return Object.fromEntries(names.map((name,index) => [name,scalar(row.cells[index])])); });
}
function date(value: unknown): number { need(typeof value === "string" && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/u.test(value)); const epoch = Date.parse(`${value.replace(" ","T")}Z`); need(Number.isFinite(epoch) && new Date(epoch).toISOString().slice(0,19).replace("T"," ") === value); return epoch; }
/** This pure comparison accepts no owner and grants no continuation. Only the
 * separate original Main issuer may retain its result as a native receipt. */
export function compareCurrentFootprintForwardWriterBranchData(before: NativeSqlInventory, projectUuid: string, branchUuid: string, body: string): CurrentFootprintForwardWriterBranchData {
 need(body.isWellFormed() && Buffer.byteLength(body) <= 4096 && /^[a-f\d]{64}$/u.test(projectUuid) && /^[a-f\d]{32}$/u.test(branchUuid));
 const parsed: unknown = JSON.parse(body); const actual = z.record(z.string(),z.union([z.string().max(1024),z.number().int(),z.boolean(),z.null()])).parse(captureCurrentPcbStringClockReply(parsed).value);
 need(JSON.stringify(actual) === body && canonicalJson(Object.keys(actual)) === canonicalJson(FIELDS));
 const tables = new Map(before.tables.map(table => [table.name,table])); need(tables.size === before.tables.length);
 const branches = rows(tables.get("branches")), projects = rows(tables.get("projects")), users = rows(tables.get("users")); need(projects.length === 1);
 const selected = branches.filter(row => row["uuid"] === branchUuid); need(selected.length === 1); const branch = selected[0], project = projects[0]; need(branch !== undefined && project !== undefined && branch["project_uuid"] === projectUuid && branch["node"] === 0 && branch["delete_status"] === 0);
 const heads = rows(tables.get(`project_history_${branchUuid}`)); need(heads.length === 1); const head = heads[0]; need(head !== undefined && branch["history_uuid"] === head["uuid"] && typeof head["uuid"] === "string");
 const one = (list: readonly Readonly<Record<string,Scalar>>[],uuid: Scalar | undefined): Readonly<Record<string,Scalar>> | undefined => { const found = list.filter(row => row["uuid"] === uuid); need(found.length <= 1); return found[0]; };
 const creator = one(users,branch["creator_uuid"]), modifier = one(users,branch["modifier_uuid"]), parent = one(branches,branch["parent_uuid"]);
 const parentName = parent?.["name"]; need(parentName === undefined || parentName === null || typeof parentName === "string");
 const observedLocalOffsetMinutes = (date(actual["created_at"]) - date(branch["created_at"])) / 60_000;
 need(Number.isInteger(observedLocalOffsetMinutes) && Math.abs(observedLocalOffsetMinutes) <= 840 && date(actual["updated_at"]) - date(branch["updated_at"]) === observedLocalOffsetMinutes * 60_000);
 const expected = { uuid: branchUuid, delete_status: branch["delete_status"], name: branch["name"], project_uuid: projectUuid, branch_uuid: project["branch_uuid"], history_uuid: head["uuid"], description: branch["description"], node: false,
 created_at: actual["created_at"], updated_at: actual["updated_at"], parent_uuid: branch["parent_uuid"] ?? null, parent_name: parentName === "" ? null : parentName ?? null, creator_nickname: creator?.["nickname"] ?? null, creator_uuid: creator?.["uuid"] ?? null, modifier_nickname: modifier?.["nickname"] ?? null,
 default: branchUuid === project["branch_uuid"], project_histories_id: head["id"] };
 need(canonicalJson(actual) === canonicalJson(expected));
 return freezeDeep({ projectUuid,branchUuid,historyUuid:head["uuid"],body,sha256:sha256Text(body),observedLocalOffsetMinutes: observedLocalOffsetMinutes === 0 ? 0 : observedLocalOffsetMinutes,writerClockAuthority:false });
}
