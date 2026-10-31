/** Original completed footprint SQL head selection. This historical reference
 * contains no native Date observation, age witness or execution authority. */
import { canonicalJson, sha256Json } from "./core.ts";
import { yieldProofEventLoop } from "./cooperative-proof.ts";
import { assertCurrentFootprintSourcePlanInventory } from "./current-footprint-source-plan.ts";
import type { CurrentFootprintSourcePlan } from "./current-footprint-source-plan.ts";
import { nativeProjectSymbolSqlSchema } from "./native-project-sql-schema.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { NativeSqlInventory, SqlCell, SqlRow, SqlTable } from "./sqlite-inventory-core.ts";
import { validateClockControlScope } from "./symbol-clock-controls.ts";

export interface CurrentFootprintCopyHeadReference {
  readonly profile: "private.current-footprint-copy-head-reference.v1";
  readonly projectUuid: string;
  readonly branchUuid: string;
  readonly ownerUuid: string;
  readonly historyUuid: string;
  readonly createdAtLiteral: string;
  readonly lockState: "locked" | "unlocked";
  readonly beforeCheckpointSha256: string;
  readonly beforeSqlSha256: string;
  readonly sourcePlanSha256: string;
  readonly originalCompletedReaderRetained: true;
  readonly nativeAgeRequired: boolean;
  readonly nativeDateProvenanceVerified: false;
  readonly ageVerified: false;
  readonly executionAuthorized: false;
}
interface Retained {
  readonly before: NativeSqlInventory;
  readonly sourcePlan: CurrentFootprintSourcePlan;
  readonly completion: ReturnType<typeof readerCompletion>;
  readonly sourcePlanText: string;
  readonly referenceText: string;
}
const issued = new WeakMap<CurrentFootprintCopyHeadReference, Retained>();
/** Emit a fixed refusal code without exposing SQL contents or owner fields. */
function need(value: boolean, detail: string): asserts value {
  if (!value) { throw new Error(`FOOTPRINT_COPY_HEAD_REFERENCE_${detail}`); }
}
/** Recheck the exact completed reader and source-plan pair after cooperative
 * yields. Matching hashes alone cannot replace either original object. */
function same(before: NativeSqlInventory, sourcePlan: CurrentFootprintSourcePlan,
  completion: ReturnType<typeof readerCompletion>, sourcePlanText: string): void {
  assertCurrentFootprintSourcePlanInventory(sourcePlan, before);
  need(readerCompletion(before) === completion && completion.observedChildClose && completion.exitCode === 0 &&
    completion.exitSignal === null && canonicalJson(sourcePlan) === sourcePlanText &&
    before.checkpointSha256 === sourcePlan.beforeCheckpointSha256 && before.logicalSha256 === sourcePlan.beforeSqlSha256,
  "ORIGINAL_COMPLETED_READER");
}
/** Require one complete named table; never select the first duplicate. */
function table(before: NativeSqlInventory, name: string): SqlTable {
  const selected = before.tables.filter(value => value.name === name);
  need(selected.length === 1 && selected[0] !== undefined, "UNIQUE_TABLE"); return selected[0];
}
/** Resolve one unambiguous column and require its cell in the selected row. */
function field(owner: SqlTable, selected: SqlRow, name: string): SqlCell {
  const indices = owner.columns.flatMap((column, index) => column["name"] === name ? [index] : []);
  const index = indices[0]; need(indices.length === 1 && index !== undefined, "UNIQUE_COLUMN");
  const value = selected.cells[index]; need(value !== undefined, "PRESENT_CELL"); return value;
}
/** Decode at most256 exact UTF-8 bytes from a SQL TEXT cell, refusing malformed
 * hex or lossy decoding before comparing identifiers. */
function text(value: SqlCell): string {
  need(value.kind === "text" && value.hex.length <= 512, "BOUNDED_TEXT");
  const bytes = Buffer.from(value.hex, "hex"), result = bytes.toString("utf8");
  need(bytes.toString("hex") === value.hex && Buffer.from(result).equals(bytes), "EXACT_UTF8"); return result;
}
/** Find one UUID across the complete table and yield every128 rows. Each yield
 * rechecks original reader custody before the scan can continue. */
async function row(owner: SqlTable, uuid: string, current: () => void): Promise<SqlRow> {
  let selected: SqlRow | undefined;
  for (const [index, candidate] of owner.rows.entries()) {
    if (index % 128 === 0) { await yieldProofEventLoop(); current(); }
    if (text(field(owner, candidate, "uuid")) === uuid) { need(selected === undefined, "UNIQUE_ROW"); selected = candidate; }
  }
  need(selected !== undefined, "PRESENT_ROW"); return selected;
}

/** Derive the actual selected branch head from the original footprint source
 * reader. Caller scalars, another equal reader and copied source plans cannot
 * select the head. An unlocked literal must be calendar-valid before a future
 * native age collector may receive it; no clock is sampled by this function. */
export async function prepareCurrentFootprintCopyHeadReference(before: NativeSqlInventory,
  sourcePlan: CurrentFootprintSourcePlan): Promise<CurrentFootprintCopyHeadReference> {
  assertCurrentFootprintSourcePlanInventory(sourcePlan, before);
  const completion = readerCompletion(before), sourcePlanText = canonicalJson(sourcePlan);
  const current = (): void => { same(before, sourcePlan, completion, sourcePlanText); };
  current();
  const { projectUuid, branchUuid } = sourcePlan.source;
  need(canonicalJson(before.schema) === canonicalJson(nativeProjectSymbolSqlSchema(branchUuid).entries), "EXACT_SCHEMA");
  const branches = table(before, "branches"), projects = table(before, "projects");
  const project = await row(projects, projectUuid, current); current();
  const branch = await row(branches, branchUuid, current); current();
  need(projects.rows.length === 1 && text(field(projects, project, "branch_uuid")) === branchUuid &&
    text(field(branches, branch, "project_uuid")) === projectUuid, "PROJECT_BRANCH_RELATION");
  const ownerUuid = text(field(projects, project, "owner_uuid"));
  const historyUuid = text(field(branches, branch, "history_uuid"));
  need(ownerUuid.length === 32 && historyUuid.length === 32 && /^[a-f0-9]{32}$/u.test(ownerUuid) &&
    /^[a-f0-9]{32}$/u.test(historyUuid), "EXACT_UUID");
  const history = table(before, `project_history_${branchUuid}`);
  const head = await row(history, historyUuid, current); current();
  const locked = field(history, head, "is_lock");
  need(locked.kind === "integer" && (locked.decimal === "0" || locked.decimal === "1"), "LOCK_STATE");
  const createdAtLiteral = text(field(history, head, "created_at")), nativeAgeRequired = locked.decimal === "0";
  if (nativeAgeRequired) {
    need(createdAtLiteral.length === 19, "EXACT_CREATED_AT_LITERAL");
    validateClockControlScope({ createdAtLiteral, referenceUtcMs: 0 });
  }
  current();
  const reference: CurrentFootprintCopyHeadReference = Object.freeze({
    profile: "private.current-footprint-copy-head-reference.v1", projectUuid, branchUuid, ownerUuid, historyUuid, createdAtLiteral,
    lockState: nativeAgeRequired ? "unlocked" : "locked", beforeCheckpointSha256: before.checkpointSha256,
    beforeSqlSha256: before.logicalSha256, sourcePlanSha256: sha256Json(sourcePlan), originalCompletedReaderRetained: true,
    nativeAgeRequired, nativeDateProvenanceVerified: false, ageVerified: false, executionAuthorized: false,
  });
  issued.set(reference, Object.freeze({ before, sourcePlan, completion, sourcePlanText, referenceText: canonicalJson(reference) }));
  return reference;
}

/** Retain original SQL/source identities across later preparation awaits.
 * Retrieval proves historical selection only and cannot issue an age witness. */
export function requireCurrentFootprintCopyHeadReference(reference: CurrentFootprintCopyHeadReference,
  before: NativeSqlInventory, sourcePlan: CurrentFootprintSourcePlan): CurrentFootprintCopyHeadReference {
  const retained = issued.get(reference);
  need(retained !== undefined && retained.before === before && retained.sourcePlan === sourcePlan, "ORIGINAL_REFERENCE");
  same(before, sourcePlan, retained.completion, retained.sourcePlanText);
  need(canonicalJson(reference) === retained.referenceText, "REFERENCE_UNCHANGED"); return reference;
}
