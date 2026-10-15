/** Historical closed-copy selection only. No opening, freshness or writer authority. */
import { canonicalJson } from "./core.ts";
import { yieldProofEventLoop } from "./cooperative-proof.ts";
import { nativeProjectSymbolSqlSchema } from "./native-project-sql-schema.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { SqlCell, SqlRow, SqlTable, readExactSqlInventory } from "./sqlite-inventory.ts";
import { indexHistoryChunkUuids } from "./symbol-history-chunk-index.ts";

type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
export interface CurrentStartupSqlInput {
  readonly inventory: Inventory;
  readonly sourceSha256: string;
  readonly checkpointSha256: string;
  readonly history: NativeHistorySnapshot;
  readonly target: Readonly<{ projectUuid: string; branchUuid: string; ownerUuid: string }>;
}
export type CurrentStartupSqlResult = Readonly<{ supported: false; reason: "unsupported-sql-schema" }> | Readonly<{
  supported: true; databaseVersion: string; projectUuid: string; branchUuid: string; ownerUuid: string;
  headHistoryUuid: string; historyRows: number; chunks: number;
  sourceSha256: string; checkpointSha256: string; sqlLogicalSha256: string;
}>;
const UUID = /^[a-f0-9]{32}$/u;
const HASH = /^[a-f0-9]{64}$/u;
const MAX_HISTORY = 4096;
function need(condition: boolean, message: string): asserts condition { if (!condition) { throw new Error(message); } }
function text(value: SqlCell, maximum = 128): string {
  need(value.kind === "text" && value.hex.length <= maximum * 2, "Startup SQL requires bounded TEXT.");
  const bytes = Buffer.from(value.hex, "hex"), decoded = bytes.toString("utf8");
  need(Buffer.from(decoded).equals(bytes), "Startup SQL TEXT is not exact UTF8."); return decoded;
}
function integer(value: SqlCell): bigint {
  need(value.kind === "integer", "Startup SQL requires INTEGER."); return BigInt(value.decimal);
}
function table(inventory: Inventory, name: string): SqlTable {
  const matches = inventory.tables.filter((entry) => entry.name === name);
  need(matches.length === 1 && matches[0] !== undefined, "Startup SQL table is not unique."); return matches[0];
}
function cell(owner: SqlTable, row: SqlRow, name: string): SqlCell {
  const index = owner.columns.findIndex((column) => column["name"] === name), value = row.cells[index];
  need(index !== -1 && value !== undefined, "Startup SQL column is missing."); return value;
}
function unique(owner: SqlTable, name: string, expected: string): SqlRow {
  const rows = owner.rows.filter((entry) => text(cell(owner, entry, name)) === expected);
  need(rows.length === 1 && rows[0] !== undefined, "Startup SQL identity is not unique."); return rows[0];
}
function rowId(owner: SqlTable, row: SqlRow): bigint {
  const id = integer(cell(owner, row, "id"));
  need(id > 0n && row.rowid?.kind === "integer" && row.rowid.decimal === id.toString(), "Startup SQL ID/rowid differs."); return id;
}

/** The owning copy stage supplies the actual decoded checkpoint history and
 * binds both hashes to its retained receipt. This selector never reconstructs
 * that ownership from JSON, reads a path, or promotes the facts to authority.
 */
export async function selectCurrentStartupSql(input: CurrentStartupSqlInput): Promise<CurrentStartupSqlResult> {
  const { inventory, history, sourceSha256, checkpointSha256 } = input;
  const { projectUuid, branchUuid, ownerUuid } = input.target;
  const completion = readerCompletion(inventory);
  need(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null,
    "Startup SQL requires its original completed inventory.");
  need(typeof sourceSha256 === "string" && HASH.test(sourceSha256) && typeof checkpointSha256 === "string" && HASH.test(checkpointSha256) &&
    typeof projectUuid === "string" && /^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u.test(projectUuid) &&
    typeof branchUuid === "string" && UUID.test(branchUuid) && typeof ownerUuid === "string" && UUID.test(ownerUuid) &&
    inventory.checkpointSha256 === sourceSha256 && history.checkpointSha256 === checkpointSha256 &&
    history.profile === "easyeda.native-history.linear-gcm-gzip.v1" && history.projectUuid === projectUuid &&
    history.branchUuid === branchUuid && history.projectOwnerUuid === ownerUuid && typeof history.headHistoryUuid === "string" && UUID.test(history.headHistoryUuid),
  "Startup SQL source, checkpoint or history identity differs.");
  const { headHistoryUuid, historyRowCount, chunkCount } = history;
  need(Number.isSafeInteger(historyRowCount) && historyRowCount > 0 && historyRowCount <= MAX_HISTORY &&
    Number.isSafeInteger(chunkCount) && chunkCount > 0 && chunkCount <= MAX_HISTORY,
  "Startup SQL decoded history counts are outside the bound.");
  if (canonicalJson(inventory.schema) !== canonicalJson(nativeProjectSymbolSqlSchema(branchUuid).entries)) {
    return Object.freeze({ supported: false, reason: "unsupported-sql-schema" });
  }
  // oxlint-disable-next-line unicorn/text-encoding-identifier-case -- SQLite reports this exact PRAGMA spelling.
  need(inventory.properties["encoding"] === "UTF-8", "Startup SQL requires UTF8 encoding.");
  const branches = table(inventory, "branches"), projects = table(inventory, "projects");
  need(projects.rows.length === 1, "Startup SQL requires exactly one project.");
  const branch = unique(branches, "uuid", branchUuid), project = unique(projects, "uuid", projectUuid);
  need(text(cell(projects, project, "branch_uuid")) === branchUuid && text(cell(projects, project, "owner_uuid")) === ownerUuid &&
    text(cell(branches, branch, "project_uuid")) === projectUuid && text(cell(branches, branch, "history_uuid")) === headHistoryUuid &&
    integer(cell(branches, branch, "delete_status")) === 0n && integer(cell(branches, branch, "node")) === 0n,
  "Startup SQL project, default branch, owner or head differs.");
  const parent = cell(branches, branch, "parent_uuid");
  if (parent.kind !== "null") {
    const parentUuid = text(parent);
    need(UUID.test(parentUuid) && parentUuid !== branchUuid, "Startup SQL branch parent differs.");
    const start = unique(branches, "uuid", parentUuid);
    need(text(cell(branches, start, "name")) === "start" && text(cell(branches, start, "project_uuid")) === projectUuid &&
      integer(cell(branches, start, "node")) === 1n && integer(cell(branches, start, "delete_status")) === 0n &&
      cell(branches, start, "parent_uuid").kind === "null" && cell(branches, start, "history_uuid").kind === "null",
    "Startup SQL permits only the terminal empty start-node parent.");
  }
  const versions = table(inventory, "db_versions");
  const version = unique(versions, "key", "sqlite");
  // APP1319960 selects db_versions['sqlite']; this is not PRAGMA schema_version.
  // Report the literal. Only the owning premises checker compares 25.10.31.1.
  const databaseVersion = text(cell(versions, version, "value"));
  need(databaseVersion.length > 0, "Startup SQL database version is empty.");
  const histories = table(inventory, `project_history_${branchUuid}`), indexed = new Map<string, SqlRow>();
  need(histories.rows.length === historyRowCount, "Startup SQL complete history row count differs.");
  for (const [index, row] of histories.rows.entries()) {
    const uuid = text(cell(histories, row, "uuid"));
    need(UUID.test(uuid) && !indexed.has(uuid), "Startup SQL history UUID is invalid or duplicated.");
    rowId(histories, row); indexed.set(uuid, row);
    if (index % 128 === 0) { await yieldProofEventLoop(); }
  }
  const seen = new Set<string>(), selected: SqlRow[] = []; let next: string | null = headHistoryUuid;
  while (next !== null) {
    need(UUID.test(next) && !seen.has(next) && selected.length < MAX_HISTORY, "Startup SQL history chain is cyclic or outside the bound.");
    const row = indexed.get(next); need(row !== undefined, "Startup SQL history parent is missing.");
    need(cell(histories, row, "snapshot").kind === "null" && integer(cell(histories, row, "snapshot_num")) === 0n,
      "Startup SQL history snapshots are unsupported.");
    const previous = selected.at(-1);
    need(previous === undefined || rowId(histories, row) < rowId(histories, previous), "Startup SQL native history ID order differs.");
    seen.add(next); selected.push(row);
    const prior = cell(histories, row, "parent"); next = prior.kind === "null" ? null : text(prior);
  }
  // The native ID range must be exactly this complete linked chain. This also
  // Rejects unlinked/future rows instead of silently ignoring their content.
  need(selected.length === histories.rows.length, "Startup SQL linked history differs from the complete native ID range.");
  const data = table(inventory, "history_data");
  const chunkIndex = await indexHistoryChunkUuids(data);
  let chunks = 0;
  for (const row of selected.toReversed()) {
    const historyUuid = text(cell(histories, row, "uuid")), num = integer(cell(histories, row, "num"));
    need(num >= 0n && num <= 1024n && chunks + Number(num) + 1 <= MAX_HISTORY, "Startup SQL history chunk count is outside the bound.");
    for (let ordinal = 0; ordinal <= Number(num); ordinal += 1) {
      const chunk = chunkIndex.get(ordinal === 0 ? historyUuid : `${historyUuid}-${ordinal}`);
      need(chunk !== undefined && chunk !== null && text(cell(data, chunk, "history_uuid")) === historyUuid,
        "Startup SQL history chunk selection is missing, duplicated or foreign.");
      rowId(data, chunk); chunks += 1;
      if (chunks % 128 === 0) { await yieldProofEventLoop(); }
    }
  }
  need(chunks === chunkCount, "Startup SQL decoded history chunk count differs.");
  return Object.freeze({ supported: true, databaseVersion, projectUuid, branchUuid, ownerUuid, headHistoryUuid,
    historyRows: selected.length, chunks, sourceSha256, checkpointSha256, sqlLogicalSha256: inventory.logicalSha256 });
}
