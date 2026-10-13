/** Fixed original-baseline selection. No dispatch, age qualification or authority grant. */
import { setImmediate as yieldImmediate } from "node:timers/promises";
import { assertIssuedClosedFileCopy } from "./closed-file-copy.ts";
import type { ClosedFileCopyReceipt } from "./closed-file-copy.ts";
import type { ClosedJournal, PhaseEvent } from "./closed-symbol-journal.ts";
import { canonicalJson, isRecord } from "./core.ts";
import { nativeProjectSymbolSqlSchema } from "./native-project-sql-schema.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { NativeSqlInventory, SqlCell, SqlRow, SqlTable } from "./sqlite-inventory-core.ts";

export type HeadEligibility = "locked" | "aged-unlocked";
type Selection = Readonly<{ headEligibility: HeadEligibility; historyUuid: string; createdAtLiteral: string }>;
type Plan = Pick<ClosedJournal["plan"], "branchUuid" | "projectUuid" | "ownerUuid">;
function need(value: boolean, message: string): asserts value { if (!value) { throw new Error(message); } }

/** Data-only cell grammar. The coordinator cannot use this in place of original-copy admission. */
export function parseHeadLock(value: unknown): HeadEligibility {
  need(isRecord(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null) &&
    Reflect.ownKeys(value).length === 2, "Automatic head lock requires an exact SQL integer cell.");
  const decimal = Object.getOwnPropertyDescriptor(value, "decimal"), kind = Object.getOwnPropertyDescriptor(value, "kind");
  need(kind !== undefined && Object.hasOwn(kind, "value") && kind.value === "integer" && decimal !== undefined && Object.hasOwn(decimal, "value"),
    "Automatic head lock requires own integer data fields.");
  need(decimal.value === "0" || decimal.value === "1", "Automatic head lock supports only exact integers 0 and 1.");
  return decimal.value === "1" ? "locked" : "aged-unlocked";
}
function table(inventory: NativeSqlInventory, name: string): SqlTable {
  const matches = inventory.tables.filter((entry) => entry.name === name);
  need(matches.length === 1 && matches[0] !== undefined, "Automatic baseline table is not unique."); return matches[0];
}
function cell(owner: SqlTable, selected: SqlRow, name: string): SqlCell {
  const index = owner.columns.findIndex((column) => column["name"] === name), result = selected.cells[index];
  need(index !== -1 && result !== undefined, "Automatic baseline column missing."); return result;
}
function text(value: SqlCell): string {
  need(value.kind === "text" && value.hex.length <= 128 && /^(?:[a-f0-9]{2})*$/u.test(value.hex), "Automatic baseline identity is not bounded SQL text.");
  const bytes = Buffer.from(value.hex, "hex"), result = bytes.toString("utf8");
  need(Buffer.from(result).equals(bytes), "Automatic baseline identity has malformed UTF8."); return result;
}
async function row(owner: SqlTable, column: string, value: string): Promise<SqlRow> {
  let selected: SqlRow | undefined;
  const expected = Buffer.from(value).toString("hex");
  for (let index = 0; index < owner.rows.length; index += 1) {
    if (index % 128 === 0) { await yieldImmediate(); }
    const entry = owner.rows[index]; need(entry !== undefined, "Automatic baseline row missing.");
    const identity = cell(owner, entry, column);
    need(identity.kind === "text" && identity.hex.length <= 128, "Automatic baseline identity is not bounded SQL text.");
    if (identity.hex === expected) { need(selected === undefined, "Automatic baseline row is not unique."); selected = entry; }
  }
  need(selected !== undefined, "Automatic baseline row is not unique."); return selected;
}

/** Data-only parser for tests and original-wrapper composition. It grants no original identity. */
export async function selectBaselineHeadData(plan: Plan, inventory: NativeSqlInventory): Promise<Selection> {
  need(canonicalJson(inventory.schema) === canonicalJson(nativeProjectSymbolSqlSchema(plan.branchUuid).entries), "Automatic baseline SQL schema is unsupported.");
  const branches = table(inventory, "branches"), projects = table(inventory, "projects");
  const branch = await row(branches, "uuid", plan.branchUuid), project = await row(projects, "uuid", plan.projectUuid);
  need(projects.rows.length === 1 && text(cell(projects, project, "branch_uuid")) === plan.branchUuid &&
    text(cell(projects, project, "owner_uuid")) === plan.ownerUuid && text(cell(branches, branch, "project_uuid")) === plan.projectUuid,
    "Automatic baseline project/branch/owner differs.");
  const historyUuid = text(cell(branches, branch, "history_uuid"));
  need(/^[a-f0-9]{32}$/u.test(historyUuid), "Automatic baseline history identity refused.");
  const history = table(inventory, `project_history_${plan.branchUuid}`), selected = await row(history, "uuid", historyUuid);
  const headEligibility = parseHeadLock(cell(history, selected, "is_lock"));
  const createdAtLiteral = text(cell(history, selected, "created_at"));
  need(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/u.test(createdAtLiteral), "Automatic baseline date literal refused.");
  return Object.freeze({ headEligibility, historyUuid, createdAtLiteral });
}

/** Only this original-bound function is called by the automatic coordinator. */
export async function selectOriginalBaselineHead(journal: ClosedJournal, events: readonly PhaseEvent[], copy: ClosedFileCopyReceipt,
  inventory: NativeSqlInventory): Promise<Selection> {
  const before = canonicalJson({ journal, events });
  function original(): void {
    assertIssuedClosedFileCopy(copy);
    const completion = readerCompletion(inventory), last = events.at(-1);
    need(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null &&
      inventory.checkpointSha256 === copy.sha256 && copy.source === journal.plan.projectPath,
      "Automatic selection requires its original completed baseline copy and SQL reader.");
    need(journal.sequence === 10 && journal.state === "closed-session-recording" && journal.artifacts.length === 10 &&
      !journal.hardStop && !journal.orphanedCallPossible && !journal.saved && !journal.reopened && !journal.mutationMayHaveOccurred &&
      events.length === 10 && last?.sequence === 10 && last.step === "baseline-copy" && last.kind === "result" &&
      last.generationOrdinal === 0 && last.generation?.ordinal === 0 && last.operationId === journal.operationId &&
      last.closedPlanSha256 === journal.closedPlanSha256 && last.markerSha256 === journal.markerSha256,
      "Automatic selection requires the exact completed phase-10 baseline.");
    need(isRecord(last.data) && canonicalJson(last.data["copyReceipt"]) === canonicalJson(copy) &&
      canonicalJson(last.data["sqlDigests"]) === canonicalJson({ checkpointSha256: inventory.checkpointSha256,
        schemaSha256: inventory.schemaSha256, logicalSha256: inventory.logicalSha256 }), "Automatic baseline differs from its exact journal result.");
    need(canonicalJson({ journal, events }) === before, "Automatic selection baseline input changed.");
  }
  original();
  const result = await selectBaselineHeadData(journal.plan, inventory);
  original();
  return result;
}
