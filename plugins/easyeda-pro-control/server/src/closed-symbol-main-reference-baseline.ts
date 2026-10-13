import { setImmediate as yieldImmediate } from "node:timers/promises";
import { assertIssuedClosedFileCopy } from "./closed-file-copy.ts";
import type { ClosedFileCopyReceipt } from "./closed-file-copy.ts";
import type { ClosedJournal, PhaseEvent } from "./closed-symbol-journal.ts";
import { canonicalJson, isRecord } from "./core.ts";
import { nativeProjectSymbolSqlSchema } from "./native-project-sql-schema.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { NativeSqlInventory as ExactSqlInventory, SqlCell, SqlRow, SqlTable } from "./sqlite-inventory-core.ts";

function need(value: boolean, message: string): asserts value { if (!value) { throw new Error(message); } }
function table(inventory: ExactSqlInventory, name: string): SqlTable {
  const matches = inventory.tables.filter((entry) => entry.name === name);
  need(matches.length === 1 && matches[0] !== undefined, "Witness baseline table is not unique."); return matches[0];
}
function cell(owner: SqlTable, selected: SqlRow, name: string): SqlCell {
  const index = owner.columns.findIndex((column) => column["name"] === name), result = selected.cells[index];
  need(index !== -1 && result !== undefined, "Witness baseline column missing."); return result;
}
function text(value: SqlCell): string {
  need(value.kind === "text" && value.hex.length <= 128, "Witness baseline identity is not bounded SQL text.");
  const bytes = Buffer.from(value.hex, "hex"), result = bytes.toString("utf8");
  need(Buffer.from(result).equals(bytes), "Witness baseline identity has malformed UTF8."); return result;
}
async function row(owner: SqlTable, column: string, value: string): Promise<SqlRow> {
  let selected: SqlRow | undefined;
  const expected = Buffer.from(value).toString("hex");
  for (let index = 0; index < owner.rows.length; index += 1) {
    if (index % 128 === 0) { await yieldImmediate(); }
    const entry = owner.rows[index]; need(entry !== undefined, "Witness baseline row missing.");
    const identity = cell(owner, entry, column);
    need(identity.kind === "text" && identity.hex.length <= 128, "Witness baseline identity is not bounded SQL text.");
    if (identity.hex === expected) { need(selected === undefined, "Witness baseline row is not unique."); selected = entry; }
  }
  need(selected !== undefined, "Witness baseline row is not unique."); return selected;
}

/** Original closed bytes and completed reader only. This selects data, not actor
 * or clock authority, and does not substitute for the full comparator. */
export async function mainReferenceBaseline(journal: ClosedJournal, events: readonly PhaseEvent[], copy: ClosedFileCopyReceipt,
  inventory: ExactSqlInventory): Promise<Readonly<{ createdAtLiteral: string; historyUuid: string; copyReceiptSha256: string; logicalSha256: string }>> {
  assertIssuedClosedFileCopy(copy);
  need(readerCompletion(inventory).exitCode === 0 && inventory.checkpointSha256 === copy.sha256 && copy.source === journal.plan.projectPath,
    "Witness needs its original completed baseline copy and SQL reader.");
  const baseline = events.find((event) => event.step === "baseline-copy" && event.kind === "result");
  need(isRecord(baseline?.data) && canonicalJson(baseline.data["copyReceipt"]) === canonicalJson(copy) &&
    canonicalJson(baseline.data["sqlDigests"]) === canonicalJson({ checkpointSha256: inventory.checkpointSha256,
      schemaSha256: inventory.schemaSha256, logicalSha256: inventory.logicalSha256 }), "Witness baseline differs from its exact journal result.");
  need(canonicalJson(inventory.schema) === canonicalJson(nativeProjectSymbolSqlSchema(journal.plan.branchUuid).entries),
    "Witness baseline SQL schema is unsupported.");
  const branches = table(inventory, "branches"), projects = table(inventory, "projects");
  const branch = await row(branches, "uuid", journal.plan.branchUuid), project = await row(projects, "uuid", journal.plan.projectUuid);
  need(projects.rows.length === 1 && text(cell(projects, project, "branch_uuid")) === journal.plan.branchUuid &&
    text(cell(projects, project, "owner_uuid")) === journal.plan.ownerUuid && text(cell(branches, branch, "project_uuid")) === journal.plan.projectUuid,
    "Witness baseline project/branch/owner differs.");
  const head = text(cell(branches, branch, "history_uuid"));
  need(/^[a-f0-9]{32}$/u.test(head), "Witness baseline history identity refused.");
  const history = table(inventory, `project_history_${journal.plan.branchUuid}`), selected = await row(history, "uuid", head);
  const lock = cell(history, selected, "is_lock");
  need(lock.kind === "integer" && lock.decimal === "0",
    "Main reference selects only the original unlocked native history head; never rewrite or lock a head for qualification.");
  const createdAtLiteral = text(cell(history, selected, "created_at"));
  need(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/u.test(createdAtLiteral), "Witness baseline date literal refused.");
  return Object.freeze({ createdAtLiteral, historyUuid: head, copyReceiptSha256: copy.receiptSha256, logicalSha256: inventory.logicalSha256 });
}
