/* oxlint-disable import/max-dependencies -- The deleted closed-history projection joins the existing complete SQL reader and separate immutable startup/cache/sync/cold algorithms; none supplies native ownership or a continuation. */
/** Closed deleted-history projection for one future readonly native birth.
 * Source/SQL data cannot issue its owner, cache mutation or negative GET. */
import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { NativeSqlInventory, SqlCell } from "./sqlite-inventory-core.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { decodeCurrentFootprintSourceHistory } from "./symbol-sql-comparator.ts";
import { captureCurrentFootprintSavedFlowCacheInput, deriveCurrentFootprintSavedFlowCacheData } from "./current-footprint-saved-flow-cache-data.ts";
import type { CurrentFootprintSavedFlowCacheData, CurrentFootprintSavedFlowCacheInput } from "./current-footprint-saved-flow-cache-data.ts";
import { deriveCurrentFootprintInverseStartupData } from "./current-footprint-inverse-startup-data.ts";
import type { CurrentFootprintInverseStartupData } from "./current-footprint-inverse-startup-data.ts";
import { deriveCurrentFootprintInverseInitialSyncData } from "./current-footprint-inverse-initial-sync-data.ts";
import type { CurrentFootprintInverseInitialSyncData } from "./current-footprint-inverse-initial-sync-data.ts";
import { deriveCurrentFootprintInverseInitialCacheData } from "./current-footprint-inverse-initial-cache-data.ts";
import type { CurrentFootprintInverseInitialCacheData } from "./current-footprint-inverse-initial-cache-data.ts";
import { deriveCurrentFootprintInverseColdLoadData } from "./current-footprint-inverse-cold-load-data.ts";
import type { CurrentFootprintInverseColdLoadData } from "./current-footprint-inverse-cold-load-data.ts";

const sourceSchema = z.strictObject({
  projectUuid: z.string().regex(/^[a-f0-9]{64}$(?![\s\S])/u),
  branchUuid: z.string().regex(/^[a-f0-9]{32}$(?![\s\S])/u),
  targetUuid: z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$(?![\s\S])/u),
  maximumTicket: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
});
type Source = Readonly<z.infer<typeof sourceSchema>>;
type Scalar = string | number | null;
const fields = ["id", "uuid", "parent", "key", "is_lock", "num", "snapshot_num", "created_at", "updated_at", "lock_time"] as const;
export interface CurrentFootprintInverseNativeDeleteColdData {
  readonly profile: "private.current-footprint-inverse-native-delete-cold-data.v1";
  readonly source: Source;
  readonly input: CurrentFootprintSavedFlowCacheInput;
  readonly cache: CurrentFootprintSavedFlowCacheData;
  readonly startup: CurrentFootprintInverseStartupData;
  readonly initialCache: CurrentFootprintInverseInitialCacheData;
  readonly initialSync: CurrentFootprintInverseInitialSyncData;
  readonly coldLoad: CurrentFootprintInverseColdLoadData;
  readonly afterLogicalSha256: string;
  readonly visibleRosterSha256: string;
  readonly targetSemanticSha256: string;
  readonly sourceLogicalTombstoneVerified: true;
  readonly cacheReplayExcluded: false;
  readonly nativeNegativeGetReserved: false;
  readonly coldAbsenceVerified: false;
  readonly executionAuthorized: false;
}
function need(value: boolean, reason: string): asserts value {
  if (!value) { throw new Error(`INVERSE_NATIVE_DELETE_COLD_DATA_${reason}`); }
}
function scalar(cell: SqlCell | undefined): Scalar {
  need(cell !== undefined, "CELL");
  if (cell.kind === "null") { return null; }
  if (cell.kind === "integer") {
    const number = Number(cell.decimal); need(Number.isSafeInteger(number) && String(number) === cell.decimal, "INTEGER"); return number;
  }
  need(cell.kind === "text", "TEXT"); const bytes = Buffer.from(cell.hex, "hex"); const text = bytes.toString("utf8");
  need(Buffer.from(text).equals(bytes), "utf8"); return text;
}
/** Pure data only, from a complete finished reader. All old parser limits and
 * issued forward/copy/startup maps remain unchanged and disjoint. */
export async function deriveCurrentFootprintInverseNativeDeleteColdData(inventory: NativeSqlInventory,
  candidate: unknown): Promise<CurrentFootprintInverseNativeDeleteColdData> {
  const source = sourceSchema.parse(captureCurrentPcbStringClockReply(candidate).value);
  const completion = readerCompletion(inventory);
  const decoded = await decodeCurrentFootprintSourceHistory(inventory, { projectUuid: source.projectUuid, branchUuid: source.branchUuid });
  const target = decoded.history.documents.find(document => document.uuid === source.targetUuid);
  need(target !== undefined && target.docType === "FOOTPRINT" && isNativeDocumentDeleted(target) && decoded.maximumTicket === source.maximumTicket, "RETAINED_TOMBSTONE");
  const matches = inventory.tables.filter(table => table.name === `project_history_${source.branchUuid}`);
  const table = matches[0]; need(matches.length === 1 && table !== undefined, "HEAD_TABLE");
  const columns = table.columns.map(column => { need(typeof column["name"] === "string", "COLUMN"); return column["name"]; });
  need(new Set(columns).size === columns.length, "COLUMN_ROSTER");
  const heads = table.rows.map(row => {
    need(row.cells.length === columns.length, "ROW");
    const values = Object.fromEntries(columns.map((name, index) => [name, scalar(row.cells[index])]));
    return Object.fromEntries(fields.map(name => { const value = values[name]; need(value !== undefined, "HEAD_FIELD"); return [name, value]; }));
  }).toSorted((left, right) => Number(right["id"]) - Number(left["id"]));
  need(decoded.links.length === decoded.chunks.length, "COMPLETE_CHUNKS");
  const chunks = decoded.chunks.map((plaintext, index) => {
    const link = decoded.links[index]; need(link !== undefined, "CHUNK_LINK");
    return { historyUuid: link.historyUuid, ordinal: link.ordinal, plaintext, plaintextSha256: link.plaintextSha256 };
  });
  const input = captureCurrentFootprintSavedFlowCacheInput({ projectUuid: source.projectUuid, branchUuid: source.branchUuid,
    headHistoryUuid: decoded.history.headHistoryUuid, heads, chunks });
  const cache = deriveCurrentFootprintSavedFlowCacheData(input);
  const startup = deriveCurrentFootprintInverseStartupData(input);
  const initialCache = deriveCurrentFootprintInverseInitialCacheData(cache);
  const initialSync = deriveCurrentFootprintInverseInitialSyncData(input, cache);
  const coldLoad = deriveCurrentFootprintInverseColdLoadData(input, cache, inventory);
  need(readerCompletion(inventory) === completion && startup.completeDecodedChunksSha256 === coldLoad.completeDecodedChunksSha256, "COMPLETE_READER");
  const visible = decoded.history.documents.filter(document => !isNativeDocumentDeleted(document));
  const data: CurrentFootprintInverseNativeDeleteColdData = freezeDeep({
    profile: "private.current-footprint-inverse-native-delete-cold-data.v1", source, input, cache, startup, initialCache, initialSync, coldLoad,
    afterLogicalSha256: inventory.logicalSha256,
    visibleRosterSha256: sha256Json(visible.map(document => ({ uuid: document.uuid, docType: document.docType, semanticSha256: document.semanticSha256 }))),
    targetSemanticSha256: target.semanticSha256, sourceLogicalTombstoneVerified: true,
    cacheReplayExcluded: false, nativeNegativeGetReserved: false, coldAbsenceVerified: false, executionAuthorized: false,
  });
  need(canonicalJson(data).length <= 1_048_576, "COMPLETE_DATA_BOUND"); return data;
}
