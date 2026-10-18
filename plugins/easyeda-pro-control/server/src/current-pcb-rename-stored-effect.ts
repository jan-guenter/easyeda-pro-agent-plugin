/** Bind native-generated times to the original frozen PCB intent, then compare
 * every SQL row. This data relation does not issue closure or writer authority.
 */
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { bindCurrentPcbRenameTimes, inventoryForOriginalCurrentPcbRenamePreparation } from "./current-pcb-rename-preparation.ts";
import type { CurrentPcbRenamePreparation } from "./current-pcb-rename-preparation.ts";
import { verifyCurrentPcbRenameSql } from "./current-pcb-rename-sql.ts";
import { parseNativeRecords } from "./native-history.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { readExactSqlInventory } from "./sqlite-inventory.ts";
import { decodeCurrentSymbolPreEditHistory } from "./symbol-sql-comparator.ts";

type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
type Decoded = Awaited<ReturnType<typeof decodeCurrentSymbolPreEditHistory>>;
const LIMITATIONS = Object.freeze({ originalDispatchVerified: false, producerBindingVerified: false, actorProvenanceVerified: false,
  clockProvenanceVerified: false, queueCompletionVerified: false, generationClosureVerified: false,
  persistentUploadReplayExcluded: false, reopened: false, executionAuthorized: false } as const);
export interface CurrentPcbRenameStoredEffect extends Readonly<typeof LIMITATIONS> {
  readonly profile: "private.current-pcb-rename-stored-effect.v1";
  readonly preparationSha256: string;
  readonly beforeSqlSha256: string;
  readonly afterSqlSha256: string;
  readonly targetUuid: string;
  readonly documentTime: number;
  readonly backendTime: number;
  readonly appendedChunkSha256: string;
  readonly wholeRenameSqlEffectVerified: true;
  readonly comparison: Readonly<Record<string, unknown>>;
}
interface Original {
  readonly preparation: CurrentPcbRenamePreparation; readonly before: Inventory; readonly after: Inventory;
  readonly afterCompletion: ReturnType<typeof readerCompletion>;
  readonly decoded: Decoded; readonly resultText: string;
}
const completed = new WeakMap<CurrentPcbRenameStoredEffect, Original>();
function need(condition: boolean, message: string): asserts condition {
  if (!condition) { throw new Error(`Current PCB stored effect: ${message}`); }
}
function time(value: unknown): number {
  need(typeof value === "number" && Number.isSafeInteger(value) && value >= 0 && value <= 8_640_000_000_000_000 && !Object.is(value, -0),
    "native timestamp is invalid"); return value;
}

/** Only timestamps are learned after the write. Intended title, target, actor,
 * client, complete baseline and clock windows all come from the preparation.
 * expectedDocumentTime must also match the separately retained native reply;
 * this function cannot establish that reply's provenance on its own.
 */
export async function verifyCurrentPcbRenameStoredEffect(preparation: CurrentPcbRenamePreparation, after: Inventory,
  expectedDocumentTime: number): Promise<CurrentPcbRenameStoredEffect> {
  const before = inventoryForOriginalCurrentPcbRenamePreparation(preparation), beforeCompletion = readerCompletion(before);
  const afterCompletion = readerCompletion(after);
  time(expectedDocumentTime);
  const current = (): void => {
    need(inventoryForOriginalCurrentPcbRenamePreparation(preparation) === before && readerCompletion(before) === beforeCompletion &&
      readerCompletion(after) === afterCompletion && afterCompletion.observedChildClose && afterCompletion.exitCode === 0 && afterCompletion.exitSignal === null,
    "original completed reader changed");
  };
  current();
  // The decoder is document-neutral despite its historical symbol name.
  const decoded = await decodeCurrentSymbolPreEditHistory(after, { projectUuid: preparation.target.projectUuid, branchUuid: preparation.target.branchUuid }); current();
  const { baseline } = preparation;
  need(decoded.history.projectOwnerUuid === preparation.target.ownerUuid && decoded.history.documents.length === baseline.documentCount &&
    decoded.history.historyRowCount === baseline.historyRows + 1 && decoded.chunks.length === baseline.chunks + 1 &&
    decoded.links.length === baseline.chunks + 1 && decoded.maximumTicket === baseline.maximumTicket + 1 &&
    sha256Json(decoded.links.slice(0, -1)) === baseline.rawHistorySha256,
  "complete history is not the original chain plus one chunk");
  const chunk = decoded.chunks.at(-1), link = decoded.links.at(-1);
  need(chunk !== undefined && link !== undefined && link.ordinal === 0 && link.historyUuid === decoded.history.headHistoryUuid &&
    link.chunkUuid === link.historyUuid && link.plaintextSha256 === sha256Text(chunk) &&
    Buffer.byteLength(chunk) <= preparation.capacity.maximumPlaintextBytes, "new native chunk is missing or exceeds reserved capacity");
  const lines = chunk.split("|\n"); need(lines.length === 3, "native title change must append exactly three records");
  const records = lines.map(line => { const values = parseNativeRecords(line); const record = values[0];
    need(values.length === 1 && record !== undefined, "native record framing differs"); return record; });
  const edit = records[0], header = records[1], meta = records[2];
  need(edit?.header["type"] === "EDIT_HEAD" && header?.header["type"] === "DOCHEAD" && meta?.header["type"] === "META" &&
    header.body?.["docType"] === "PCB" && header.body["uuid"] === preparation.target.pcbUuid,
  "native appended record identities differ");
  const backendTime = time(edit.body?.["updateTime"]), documentTime = time(header.body["updateTime"]);
  need(documentTime === expectedDocumentTime, "saved document timestamp differs from the retained native reply");
  const bound = await bindCurrentPcbRenameTimes(preparation, { documentTime, backendTime }); current();
  const comparison = await verifyCurrentPcbRenameSql(bound.sql, after); current();
  const result: CurrentPcbRenameStoredEffect = Object.freeze({ profile: "private.current-pcb-rename-stored-effect.v1",
    preparationSha256: preparation.preparationSha256, beforeSqlSha256: before.logicalSha256, afterSqlSha256: after.logicalSha256,
    targetUuid: preparation.target.pcbUuid, documentTime, backendTime, appendedChunkSha256: sha256Text(chunk),
    wholeRenameSqlEffectVerified: true, comparison, ...LIMITATIONS });
  completed.set(result, { preparation, before, after, afterCompletion, decoded: freezeDeep(decoded), resultText: canonicalJson(result) }); return result;
}

/** Successful original comparison only. JSON, a different completed reader or
 * an equivalent re-read cannot stand in for this saved-source relation.
 */
export function completedCurrentPcbRenameStoredSource(effect: CurrentPcbRenameStoredEffect, preparation: CurrentPcbRenamePreparation,
  after: Inventory): Readonly<{ history: Decoded["history"]; maximumTicket: number; comparison: CurrentPcbRenameStoredEffect }> {
  const original = completed.get(effect);
  need(original !== undefined && original.preparation === preparation && original.after === after &&
    inventoryForOriginalCurrentPcbRenamePreparation(preparation) === original.before && readerCompletion(after) === original.afterCompletion &&
    canonicalJson(effect) === original.resultText, "original successful stored comparison is required");
  return Object.freeze({ history: original.decoded.history, maximumTicket: original.decoded.maximumTicket, comparison: effect });
}
