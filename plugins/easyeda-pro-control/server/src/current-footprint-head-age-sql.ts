/** Original completed closed-SQL head selection for a read-only native birth.
 * This reference selects a historical row; it is never an age or writer grant. */
import { canonicalJson } from "./core.ts";
import { yieldProofEventLoop } from "./cooperative-proof.ts";
import { nativeProjectSymbolSqlSchema } from "./native-project-sql-schema.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { NativeSqlInventory, SqlCell, SqlRow, SqlTable } from "./sqlite-inventory-core.ts";
import { validateClockControlScope } from "./symbol-clock-controls.ts";

export interface CurrentFootprintHeadAgeSqlHead {
  readonly profile: "private.current-footprint-head-age-sql.v1";
  readonly projectUuid: string; readonly branchUuid: string; readonly ownerUuid: string;
  readonly historyUuid: string; readonly createdAtLiteral: string;
  readonly checkpointSha256: string; readonly logicalSha256: string;
  readonly lockState: "unlocked"; readonly ageVerified: false; readonly executionAuthorized: false;
}
interface Retained { readonly inventory: NativeSqlInventory; readonly completion: ReturnType<typeof readerCompletion>; readonly text: string }
const originals = new WeakMap<CurrentFootprintHeadAgeSqlHead, Retained>();
/** Refuse a malformed relation without exposing private SQL values. */
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_HEAD_AGE_SQL"); } }
/** Select exactly one complete named table, refusing duplicate definitions. */
function table(inventory: NativeSqlInventory, name: string): SqlTable {
  const values = inventory.tables.filter(item => item.name === name); const value = values[0]; need(values.length === 1 && value !== undefined); return value;
}
/** Resolve an exact unambiguous column and require the corresponding cell. */
function field(owner: SqlTable, selected: SqlRow, name: string): SqlCell {
  const indices = owner.columns.flatMap((item, index) => item["name"] === name ? [index] : []); const index = indices[0];
  need(indices.length === 1 && index !== undefined); const result = selected.cells[index]; need(result !== undefined); return result;
}
/** Decode bounded SQL TEXT hex without accepting malformed UTF-8 or lossy IDs. */
function text(cell: SqlCell): string {
  need(cell.kind === "text" && cell.hex.length <= 512); const bytes = Buffer.from(cell.hex, "hex"), value = bytes.toString("utf8");
  need(bytes.toString("hex") === cell.hex && Buffer.from(value).equals(bytes)); return value;
}
/** Find one exact UUID across the complete table. Cooperative yields reprove
 * original reader custody before scanning resumes; duplicate UUIDs refuse. */
async function row(owner: SqlTable, uuid: string, current: () => void): Promise<SqlRow> {
  let selected: SqlRow | undefined;
  for (const [index, candidate] of owner.rows.entries()) {
    if (index % 128 === 0) { await yieldProofEventLoop(); current(); }
    if (text(field(owner, candidate, "uuid")) === uuid) { need(selected === undefined); selected = candidate; }
  }
  need(selected !== undefined); return selected;
}
/** Derive the one unlocked default-branch head from a genuine completed reader.
 * The target must already be a sealed checkpoint member. Locked heads need no
 * age observation and refuse before this diagnostic allocates an application. */
export async function prepareCurrentFootprintHeadAgeSqlHead(inventory: NativeSqlInventory,
  target: Readonly<{ projectUuid: string; branchUuid: string }>): Promise<CurrentFootprintHeadAgeSqlHead> {
  const completion = readerCompletion(inventory); const checkpoint = inventory.checkpointSha256; const logical = inventory.logicalSha256;
  const current = (): void => {
    need(readerCompletion(inventory) === completion && completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null &&
      inventory.checkpointSha256 === checkpoint && inventory.logicalSha256 === logical);
  };
  current(); need(canonicalJson(inventory.schema) === canonicalJson(nativeProjectSymbolSqlSchema(target.branchUuid).entries));
  const projects = table(inventory, "projects"); const branches = table(inventory, "branches");
  const project = await row(projects, target.projectUuid, current); current(); const branch = await row(branches, target.branchUuid, current); current();
  need(projects.rows.length === 1 && text(field(projects, project, "branch_uuid")) === target.branchUuid && text(field(branches, branch, "project_uuid")) === target.projectUuid);
  const ownerUuid = text(field(projects, project, "owner_uuid")); const historyUuid = text(field(branches, branch, "history_uuid"));
  need([ownerUuid, historyUuid].every(value => value.length === 32 && /^[a-f\d]{32}$/u.test(value)));
  const history = table(inventory, `project_history_${target.branchUuid}`); const head = await row(history, historyUuid, current); current();
  const lock = field(history, head, "is_lock"); need(lock.kind === "integer" && lock.decimal === "0");
  const createdAtLiteral = text(field(history, head, "created_at")); need(createdAtLiteral.length === 19);
  validateClockControlScope({ createdAtLiteral, referenceUtcMs: 0 }); current();
  const result: CurrentFootprintHeadAgeSqlHead = Object.freeze({ profile: "private.current-footprint-head-age-sql.v1", projectUuid: target.projectUuid, branchUuid: target.branchUuid,
    ownerUuid, historyUuid, createdAtLiteral, checkpointSha256: checkpoint, logicalSha256: logical, lockState: "unlocked", ageVerified: false, executionAuthorized: false });
  originals.set(result, { inventory, completion, text: canonicalJson(result) }); return result;
}
/** Recheck the original completed reader and exact issued head after every
 * native await. Equal JSON or another equal reader cannot recreate custody. */
export function requireCurrentFootprintHeadAgeSqlHead(head: CurrentFootprintHeadAgeSqlHead, inventory: NativeSqlInventory): void {
  const entry = originals.get(head);
  need(entry !== undefined && entry.inventory === inventory && readerCompletion(inventory) === entry.completion &&
    entry.completion.observedChildClose && entry.completion.exitCode === 0 && entry.completion.exitSignal === null &&
    canonicalJson(head) === entry.text && head.checkpointSha256 === inventory.checkpointSha256 && head.logicalSha256 === inventory.logicalSha256);
}
