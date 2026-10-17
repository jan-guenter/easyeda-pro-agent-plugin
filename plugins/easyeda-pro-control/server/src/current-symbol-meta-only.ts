/** Data-only pre-dispatch eligibility. No owner, clock or writer is issued. */
import { canonicalJson } from "./core.ts";
import { yieldProofEventLoop } from "./cooperative-proof.ts";
import { parseNativeRecords } from "./native-history.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { prepareCurrentSingleCanvasSegmentWriteBudget, prepareCurrentSymbolWriteBudget } from "./current-symbol-write-budget.ts";
import type { CurrentSymbolStartupExpectation } from "./current-symbol-startup.ts";
import { prepareCurrentDocumentCacheSavedSymbolProjection, prepareCurrentSingleCanvasSegmentSavedSymbolProjection } from "./saved-symbol-projection.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { readExactSqlInventory } from "./sqlite-inventory.ts";
import { decodeCurrentSymbolPreEditHistory } from "./symbol-sql-comparator.ts";

type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
interface Target {
  readonly projectUuid: string; readonly branchUuid: string; readonly ownerUuid: string; readonly symbolUuid: string;
}
interface BaselineBinding {
  readonly copy: Readonly<{ source: string; sha256: string }>;
  readonly checkpoint: Readonly<{ source: string; sourceSha256: string; checkpointSha256: string }>;
}
export interface CurrentSymbolCanvasClockPrerequisite {
  readonly maximumTargetHeaderTime: number;
  readonly remainingWrites: 1 | 2;
}
export interface CurrentDisposableSymbolBaselineEligibility {
  readonly evidence: Readonly<Record<string, unknown>>;
  readonly canvasClock?: CurrentSymbolCanvasClockPrerequisite;
}
function need(condition: boolean): asserts condition {
  if (!condition) { throw new Error("Current symbol metadata requires its complete original META-only baseline."); }
}
const METADATA_ATOMS = new Set(["META", "META_PLACEHOLDER", "DELETE_DOC", "META_CREATE", "META_MODIFY"]);

/** A later metadata tombstone can replace a canvas atom's type in the native
 * final map. Check every original occurrence, not just the selected atom type.
 */
async function hasCanvasOccurrences(chunks: readonly string[], targetUuid: string): Promise<boolean> {
  let canvas = false, steps = 0;
  for (const chunk of chunks) {
    let current: unknown;
    const records = chunk.split("|\n"); if (records.at(-1) === "") { records.pop(); }
    for (const raw of records) {
      const record = parseNativeRecords(raw)[0]; need(record !== undefined);
      const type = record.header["type"];
      if (type === "DOCHEAD") { current = record.body?.["uuid"]; }
      else if (type !== "EDIT_HEAD" && current === targetUuid && (typeof type !== "string" || !METADATA_ATOMS.has(type))) {
        canvas = true;
      }
      steps += 1; if (steps % 128 === 0) { await yieldProofEventLoop(); }
    }
  }
  return canvas;
}

/** The materialized records omit tombstones. Reuse the cache projector's bounds
 * and exact rules, then independently reject every historical canvas occurrence.
 */
export async function assertCurrentSymbolMetaOnlyBaseline(inventory: Inventory, binding: BaselineBinding, target: Target,
  expected: NativeHistorySnapshot, desired: Parameters<typeof prepareCurrentSymbolWriteBudget>[2],
  startup: CurrentSymbolStartupExpectation, restoration?: Parameters<typeof prepareCurrentSymbolWriteBudget>[2]): Promise<Readonly<Record<string, unknown>>> {
  const result = await assertBaseline(inventory, binding, target, expected, desired, startup, restoration, false);
  return result.evidence;
}

/** Data only. Only the original disposable generation may select this entrypoint.
 * Ordinary startup keeps the fixed META-only entrypoint above, without fallback.
 */
export function assertCurrentDisposableSymbolBaseline(inventory: Inventory, binding: BaselineBinding, target: Target,
  expected: NativeHistorySnapshot, desired: Parameters<typeof prepareCurrentSymbolWriteBudget>[2],
  startup: CurrentSymbolStartupExpectation, restoration?: Parameters<typeof prepareCurrentSymbolWriteBudget>[2]): Promise<CurrentDisposableSymbolBaselineEligibility> {
  return assertBaseline(inventory, binding, target, expected, desired, startup, restoration, true);
}

async function assertBaseline(inventory: Inventory, binding: BaselineBinding, target: Target,
  expected: NativeHistorySnapshot, desired: Parameters<typeof prepareCurrentSymbolWriteBudget>[2],
  startup: CurrentSymbolStartupExpectation, restoration: Parameters<typeof prepareCurrentSymbolWriteBudget>[2] | undefined,
  disposableCanvas: boolean): Promise<CurrentDisposableSymbolBaselineEligibility> {
  const bindingText = canonicalJson({ copy: binding.copy, checkpoint: binding.checkpoint });
  const completion = readerCompletion(inventory), expectedText = canonicalJson(expected), selected = Object.freeze({ ...target });
  const checkpointSha256 = binding.checkpoint.checkpointSha256, rawCopySha256 = binding.copy.sha256;
  need(/^[a-f0-9]{64}$/u.test(rawCopySha256) && /^[a-f0-9]{64}$/u.test(checkpointSha256) &&
    binding.copy.source.length > 0 && binding.copy.source === binding.checkpoint.source &&
    rawCopySha256 === binding.checkpoint.sourceSha256 && inventory.checkpointSha256 === rawCopySha256 &&
    expected.checkpointSha256 === checkpointSha256);
  need(Object.keys(selected).length === 4 && /^[a-f0-9]{32}$/u.test(selected.ownerUuid) &&
    /^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u.test(selected.symbolUuid));
  const decoded = await decodeCurrentSymbolPreEditHistory(inventory, { projectUuid: selected.projectUuid, branchUuid: selected.branchUuid });
  const history = decoded.history;
  // SQL comes from the raw closed copy; startup history comes from its separate
  // VACUUM checkpoint. Materializer lineage hashes bind their own file, while
  // Semantic hashes retain the complete document metadata and live records.
  need(history.checkpointSha256 === rawCopySha256 && history.semanticSha256 === expected.semanticSha256 &&
    history.projectUuid === expected.projectUuid && history.branchUuid === expected.branchUuid &&
    history.projectOwnerUuid === expected.projectOwnerUuid && history.projectOwnerUuid === selected.ownerUuid &&
    history.headHistoryUuid === expected.headHistoryUuid && history.historyRowCount === expected.historyRowCount &&
    history.chunkCount === expected.chunkCount && history.plaintextBytes === expected.plaintextBytes);
  const hasCanvas = await hasCanvasOccurrences(decoded.chunks, selected.symbolUuid);
  if (hasCanvas && !disposableCanvas) {
    throw new Error("Current symbol metadata refuses every historical target canvas atom, including tombstones.");
  }
  const input = { chunks: decoded.chunks, targetUuid: selected.symbolUuid, maximumTicket: decoded.maximumTicket, currentEditVersion: "3.2.206" };
  const projection = hasCanvas ? await prepareCurrentSingleCanvasSegmentSavedSymbolProjection(input)
    : await prepareCurrentDocumentCacheSavedSymbolProjection(input);
  const writeBudget = hasCanvas ? await prepareCurrentSingleCanvasSegmentWriteBudget(decoded, selected.symbolUuid, desired, inventory, startup, restoration)
    : await prepareCurrentSymbolWriteBudget(decoded, selected.symbolUuid, desired, inventory, startup, restoration);
  need(readerCompletion(inventory) === completion && canonicalJson(expected) === expectedText &&
    canonicalJson({ copy: binding.copy, checkpoint: binding.checkpoint }) === bindingText);
  const canvasClock = projection.profile === "private.current-single-canvas-segment-saved-symbol-getstr-projection.v1"
    ? Object.freeze({ maximumTargetHeaderTime: projection.maximumTargetHeaderTime, remainingWrites: restoration === undefined ? 1 as const : 2 as const }) : undefined;
  need(hasCanvas ? canvasClock !== undefined && projection.canvasRecords > 0 : projection.canvasRecords === 0);
  const evidence = Object.freeze({ profile: hasCanvas ? "private.current-disposable-single-canvas-segment-baseline.v1" : "private.current-symbol-meta-only-baseline.v1", targetUuid: selected.symbolUuid,
    beforeSqlSha256: inventory.logicalSha256, rawCopySha256, checkpointSha256, historySemanticSha256: history.semanticSha256,
    rawHistorySha256: projection.rawHistorySha256, rawHistoryBytes: projection.rawHistoryBytes,
    canvasRecords: projection.canvasRecords, metadataBookkeepingOnly: !hasCanvas, writeBudget, cacheBranchObserved: false, executionAuthorized: false,
    ...(canvasClock === undefined ? {} : { permittedPurpose: "disposable-validation", canvasClock }) });
  return Object.freeze({ evidence, ...(canvasClock === undefined ? {} : { canvasClock }) });
}
