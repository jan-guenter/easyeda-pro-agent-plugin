/** Historical SQL selection only: no copy token or authority is reconstructed. */
import { setImmediate as yieldImmediate } from 'node:timers/promises';
import { canonicalJson, isRecord } from './core.ts';
import { nativeProjectSymbolSqlSchema } from './native-project-sql-schema.ts';
import { readerCompletion } from './sqlite-inventory.ts';
import type { NativeSqlInventory, SqlCell, SqlRow, SqlTable } from './sqlite-inventory-core.ts';
import type { ClosedJournal, PhaseEvent } from './closed-symbol-journal.ts';

function need(value: boolean): asserts value { if (!value) { throw new Error('Recorded unlocked reference baseline refused.'); } }
function cell(owner: SqlTable, selected: SqlRow, name: string): SqlCell {
  const index = owner.columns.findIndex(column => column['name'] === name), result = selected.cells[index];
  need(index !== -1 && result !== undefined); return result;
}
function text(value: SqlCell): string {
  need(value.kind === 'text' && value.hex.length <= 128);
  const bytes = Buffer.from(value.hex, 'hex'), valueText = bytes.toString('utf8'); need(Buffer.from(valueText).equals(bytes)); return valueText;
}
function table(inventory: NativeSqlInventory, name: string): SqlTable {
  const matches = inventory.tables.filter(entry => entry.name === name); need(matches.length === 1 && matches[0] !== undefined); return matches[0];
}
async function row(tableValue: SqlTable, name: string, value: string): Promise<SqlRow> {
  const expected = Buffer.from(value).toString('hex'); let result: SqlRow | undefined;
  for (let index = 0; index < tableValue.rows.length; index += 1) {
    if (index % 128 === 0) { await yieldImmediate(); }
    const entry = tableValue.rows[index]; need(entry !== undefined);
    const identity = cell(tableValue, entry, name); need(identity.kind === 'text' && identity.hex.length <= 128);
    if (identity.hex === expected) { need(result === undefined); result = entry; }
  }
  need(result !== undefined); return result;
}
export async function recordedUnlockedBaseline(journal: ClosedJournal, event: PhaseEvent, inventory: NativeSqlInventory): Promise<Readonly<{historyUuid: string; createdAtLiteral: string}>> {
  need(readerCompletion(inventory).exitCode === 0 && event.sequence === 10 && event.step === 'baseline-copy' && event.kind === 'result' && isRecord(event.data));
  const copy = event.data['copyReceipt']; need(isRecord(copy) && copy['source'] === journal.plan.projectPath && copy['sha256'] === inventory.checkpointSha256);
  need(canonicalJson(event.data['sqlDigests']) === canonicalJson({ checkpointSha256: inventory.checkpointSha256, schemaSha256: inventory.schemaSha256, logicalSha256: inventory.logicalSha256 }) &&
    canonicalJson(inventory.schema) === canonicalJson(nativeProjectSymbolSqlSchema(journal.plan.branchUuid).entries));
  const projects = table(inventory, 'projects'); const branches = table(inventory, 'branches');
  const project = await row(projects, 'uuid', journal.plan.projectUuid); const branch = await row(branches, 'uuid', journal.plan.branchUuid);
  need(projects.rows.length === 1 && text(cell(projects, project, 'branch_uuid')) === journal.plan.branchUuid &&
    text(cell(projects, project, 'owner_uuid')) === journal.plan.ownerUuid && text(cell(branches, branch, 'project_uuid')) === journal.plan.projectUuid);
  const historyUuid = text(cell(branches, branch, 'history_uuid')); need(/^[a-f0-9]{32}$/u.test(historyUuid));
  const history = table(inventory, `project_history_${journal.plan.branchUuid}`), selected = await row(history, 'uuid', historyUuid);
  const lock = cell(history, selected, 'is_lock'); need(lock.kind === 'integer' && lock.decimal === '0');
  const literal = text(cell(history, selected, 'created_at')); need(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/u.test(literal));
  return Object.freeze({ historyUuid, createdAtLiteral: literal });
}
