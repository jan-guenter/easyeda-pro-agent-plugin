/** Exact before-head selection. No age, source freshness or write authority. */
import { setImmediate as yieldImmediate } from "node:timers/promises";
import { canonicalJson } from "./core.ts";
import { nativeProjectSymbolSqlSchema } from "./native-project-sql-schema.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { NativeSqlInventory, SqlCell, SqlRow, SqlTable } from "./sqlite-inventory-core.ts";
import { validateClockControlScope } from "./symbol-clock-controls.ts";

function need(condition: boolean): asserts condition {
  if (!condition) { throw new Error("Current aged SQL before-head refused."); }
}
function table(inventory: NativeSqlInventory, name: string): SqlTable {
  const matches = inventory.tables.filter((entry) => entry.name === name), selected = matches[0];
  need(matches.length === 1 && selected !== undefined); return selected;
}
function cell(owner: SqlTable, selected: SqlRow, name: string): SqlCell {
  const indices = owner.columns.flatMap((column, index) => column["name"] === name ? [index] : []);
  const index = indices[0];
  need(indices.length === 1 && index !== undefined);
  const value = selected.cells[index]; need(value !== undefined); return value;
}
function text(value: SqlCell): string {
  need(value.kind === "text" && value.hex.length <= 512);
  const bytes = Buffer.from(value.hex, "hex"), result = bytes.toString("utf8");
  need(bytes.toString("hex") === value.hex && Buffer.from(result).equals(bytes)); return result;
}
async function row(owner: SqlTable, uuid: string): Promise<SqlRow> {
  let selected: SqlRow | undefined;
  for (let index = 0; index < owner.rows.length; index += 1) {
    if (index % 128 === 0) { await yieldImmediate(); }
    const candidate = owner.rows[index]; need(candidate !== undefined);
    if (text(cell(owner, candidate, "uuid")) === uuid) { need(selected === undefined); selected = candidate; }
  }
  need(selected !== undefined); return selected;
}
export async function selectCurrentUnlockedSqlHead(inventory: NativeSqlInventory,
  target: Readonly<{ projectUuid: string; branchUuid: string; ownerUuid: string }>): Promise<Readonly<{ historyUuid: string; createdAtLiteral: string }>> {
  const completion = readerCompletion(inventory);
  need(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null &&
    canonicalJson(inventory.schema) === canonicalJson(nativeProjectSymbolSqlSchema(target.branchUuid).entries));
  const branches = table(inventory, "branches"), projects = table(inventory, "projects");
  const branch = await row(branches, target.branchUuid), project = await row(projects, target.projectUuid);
  need(projects.rows.length === 1 && text(cell(projects, project, "branch_uuid")) === target.branchUuid &&
    text(cell(projects, project, "owner_uuid")) === target.ownerUuid && text(cell(branches, branch, "project_uuid")) === target.projectUuid);
  const historyUuid = text(cell(branches, branch, "history_uuid")); need(/^[a-f0-9]{32}$/u.test(historyUuid));
  const history = table(inventory, `project_history_${target.branchUuid}`), selected = await row(history, historyUuid);
  const locked = cell(history, selected, "is_lock");
  // Locked heads need no age witness. This issuer must never lock or rewrite one.
  need(locked.kind === "integer" && locked.decimal === "0");
  const createdAtLiteral = text(cell(history, selected, "created_at"));
  validateClockControlScope({ createdAtLiteral, referenceUtcMs: 0 });
  return Object.freeze({ historyUuid, createdAtLiteral });
}
