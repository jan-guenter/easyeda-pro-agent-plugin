/** Private exact initial branch-GET candidate from complete qualified SQL.
 * The retained import-local offset is data normalization, never a current
 * clock or writer authority. An actual differing response must refuse. */
import { types } from "node:util";
import { canonicalJson } from "./core.ts";
import { requireOriginalCurrentGeneratedInitialFlowCachePlan } from "./current-generated-initial-flow-cache-plan.ts";
import type { CurrentGeneratedInitialFlowCachePlan, CurrentGeneratedInitialFlowCachePrepared } from "./current-generated-initial-flow-cache-plan.ts";
import { assertOriginalGeneratedFixtureTarget, originalGeneratedFixtureInventory } from "./managed-fixture-initial-sql.ts";
import type { QualifiedGeneratedFixtureTarget } from "./managed-fixture-initial-sql.ts";
import { assertOriginalGeneratedSchematicFixtureTarget, originalGeneratedSchematicFixtureInventory } from "./managed-schematic-fixture-initial-sql.ts";
import type { QualifiedGeneratedSchematicFixtureTarget } from "./managed-schematic-fixture-initial-sql.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import type { NativeSqlInventory, SqlCell, SqlTable } from "./sqlite-inventory-core.ts";
import { CURRENT_GENERATED_INITIAL_BRANCH_API_FIELDS as FIELDS } from "./current-generated-initial-branch-source.ts";

type Scalar = string | number | boolean | null;
type Row = Readonly<Record<string, string | number | null>>;
type Qualification = QualifiedGeneratedFixtureTarget | QualifiedGeneratedSchematicFixtureTarget;
export interface CurrentGeneratedInitialBranchDataPlan { readonly profile: "private.current-generated-initial-branch-data-plan.v1" }
export interface CurrentGeneratedInitialBranchData {
  readonly projectUuid: string; readonly branchUuid: string; readonly historyUuid: string; readonly body: string;
  readonly importLocalOffsetMinutes: number; readonly nativeCurrentTimezoneVerified: false; readonly writerClockAuthority: false; readonly continuationAuthorized: false;
}
interface Original { readonly prepared: CurrentGeneratedInitialFlowCachePrepared; readonly initial: CurrentGeneratedInitialFlowCachePlan; readonly inventory: NativeSqlInventory; readonly data: CurrentGeneratedInitialBranchData; readonly text: string }
const issued = new WeakMap<CurrentGeneratedInitialBranchDataPlan, Original>();
const preparedPlans = new WeakMap<CurrentGeneratedInitialFlowCachePrepared, CurrentGeneratedInitialBranchDataPlan>();
function need(value: boolean): asserts value { if (!value) { throw new Error("GENERATED_INITIAL_BRANCH_PLAN"); } }
function inventoryFor(qualification: Qualification): NativeSqlInventory {
  if (qualification.schema === "easyeda-pro-control.qualified-generated-fixture-target.v1") { assertOriginalGeneratedFixtureTarget(qualification); return originalGeneratedFixtureInventory(qualification); }
  assertOriginalGeneratedSchematicFixtureTarget(qualification); return originalGeneratedSchematicFixtureInventory(qualification);
}
function scalar(input: SqlCell | undefined): string | number | null {
  need(input !== undefined); if (input.kind === "null") { return null; } if (input.kind === "integer") { const number = Number(input.decimal); need(Number.isSafeInteger(number) && String(number) === input.decimal); return number; }
  need(input.kind === "text"); const bytes = Buffer.from(input.hex, "hex"), decodedText = bytes.toString("utf8"); need(Buffer.from(decodedText).equals(bytes)); return decodedText;
}
function rows(table: SqlTable | undefined): readonly Row[] {
  need(table !== undefined); const names = table.columns.map(column => { need(typeof column["name"] === "string"); return column["name"]; }); need(new Set(names).size === names.length);
  return table.rows.map(row => { need(row.cells.length === names.length); return Object.fromEntries(names.map((name, index) => [name, scalar(row.cells[index])])); });
}
function sole(value: readonly Row[]): Row { const row = value[0]; need(value.length === 1 && row !== undefined); return row; }
function one(value: readonly Row[], uuid: string | number | null | undefined): Row | undefined { need(typeof uuid === "string" || uuid === null); const found = value.filter(row => row["uuid"] === uuid); need(found.length <= 1); return found[0]; }
function text(value: string | number | null | undefined): string { need(typeof value === "string"); return value; }
/** MC's one exact import-offset candidate. Native timezone drift is not
 * accepted from a candidate: the later complete actual response must match. */
function projectedDate(value: string | number | null | undefined, offset: number): string {
  const literal = text(value); need(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/u.test(literal));
  const epoch = Date.parse(`${literal.replace(" ", "T")}Z`); need(Number.isFinite(epoch) && new Date(epoch).toISOString().slice(0, 19).replace("T", " ") === literal);
  return new Date(epoch + offset * 60_000).toISOString().slice(0, 19).replace("T", " ");
}
function deriveInitialBranchData(qualification: Qualification, expectedHistory: string): Readonly<{ inventory: NativeSqlInventory; data: CurrentGeneratedInitialBranchData }> {
  const inventory = inventoryFor(qualification); readerCompletion(inventory); const tables = new Map(inventory.tables.map(table => [table.name, table])); need(tables.size === inventory.tables.length);
  const branches = rows(tables.get("branches")); const users = rows(tables.get("users")); const project = sole(rows(tables.get("projects"))); const selected = one(branches, qualification.target.branchUuid); need(selected !== undefined && branches.length === 2);
  const parent = one(branches, selected["parent_uuid"]); const creator = one(users, selected["creator_uuid"]); const modifier = one(users, selected["modifier_uuid"]);
  const history = sole(rows(tables.get(`project_history_${qualification.target.branchUuid}`)));
  const observedOffset = qualification.nativeLocalOffsetMinutes; need(Number.isInteger(observedOffset) && Math.abs(observedOffset) <= 840); const offset = observedOffset === 0 ? 0 : observedOffset;
  need(selected["uuid"] === qualification.target.branchUuid && selected["project_uuid"] === qualification.target.projectUuid && selected["history_uuid"] === expectedHistory && history["uuid"] === expectedHistory && history["id"] === 1 && selected["node"] === 0 && selected["delete_status"] === 0);
  const parentName = parent?.["name"]; need(parentName === undefined || parentName === null || typeof parentName === "string");
  const row: Record<string, Scalar> = {
    uuid: text(selected["uuid"]), delete_status: selected["delete_status"], name: text(selected["name"]), project_uuid: text(selected["project_uuid"]), branch_uuid: text(project["branch_uuid"]),
    history_uuid: expectedHistory, description: text(selected["description"]), node: Boolean(selected["node"]), created_at: projectedDate(selected["created_at"], offset), updated_at: projectedDate(selected["updated_at"], offset),
    parent_uuid: selected["parent_uuid"] ?? null, parent_name: parentName === "" ? null : parentName ?? null, creator_nickname: creator?.["nickname"] ?? null, creator_uuid: creator?.["uuid"] ?? null, modifier_nickname: modifier?.["nickname"] ?? null,
    default: selected["uuid"] === project["branch_uuid"], project_histories_id: history["id"],
  };
  need(canonicalJson(Object.keys(row)) === canonicalJson(FIELDS)); const body = JSON.stringify(row); need(Buffer.byteLength(body) <= 4096);
  const data = freezeDeep({ projectUuid: qualification.target.projectUuid, branchUuid: qualification.target.branchUuid, historyUuid: expectedHistory, body, importLocalOffsetMinutes: offset, nativeCurrentTimezoneVerified: false as const, writerClockAuthority: false as const, continuationAuthorized: false as const });
  readerCompletion(inventory); need(inventoryFor(qualification) === inventory); return Object.freeze({ inventory, data });
}
export function prepareCurrentGeneratedInitialBranchDataPlan(prepared: CurrentGeneratedInitialFlowCachePrepared, initial: CurrentGeneratedInitialFlowCachePlan): CurrentGeneratedInitialBranchDataPlan {
  const original = requireOriginalCurrentGeneratedInitialFlowCachePlan(initial, prepared); const previous = preparedPlans.get(prepared);
  if (previous !== undefined) { requireOriginalCurrentGeneratedInitialBranchDataPlan(previous, prepared, initial); return previous; }
  const result = deriveInitialBranchData(prepared.qualification, original.historyUuid); need(result.data.projectUuid === original.projectUuid && result.data.branchUuid === original.branchUuid);
  const plan: CurrentGeneratedInitialBranchDataPlan = Object.freeze({ profile: "private.current-generated-initial-branch-data-plan.v1" }); issued.set(plan, Object.freeze({ prepared, initial, inventory: result.inventory, data: result.data, text: canonicalJson(result.data) })); preparedPlans.set(prepared, plan); return plan;
}
export function requireOriginalCurrentGeneratedInitialBranchDataPlan(plan: CurrentGeneratedInitialBranchDataPlan, prepared: CurrentGeneratedInitialFlowCachePrepared, initial: CurrentGeneratedInitialFlowCachePlan): CurrentGeneratedInitialBranchData {
  need(plan !== null && typeof plan === "object" && !types.isProxy(plan)); requireOriginalCurrentGeneratedInitialFlowCachePlan(initial, prepared); const original = issued.get(plan);
  need(original !== undefined && original.prepared === prepared && original.initial === initial && inventoryFor(prepared.qualification) === original.inventory && original.text === canonicalJson(original.data)); readerCompletion(original.inventory); return original.data;
}
