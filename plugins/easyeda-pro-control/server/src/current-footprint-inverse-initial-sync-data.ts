/** Inert complete saved-head bounds. Native Main/worker custody is issued by
 * their original owner only, never by these source-derived values. */
import { z } from "zod";
import { canonicalJson, sha256Text } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { deriveCurrentFootprintInverseInitialCacheData } from "./current-footprint-inverse-initial-cache-data.ts";
import type { CurrentFootprintInverseInitialCacheData } from "./current-footprint-inverse-initial-cache-data.ts";
import { captureCurrentFootprintSavedFlowCacheInput } from "./current-footprint-saved-flow-cache-data.ts";
import { deriveCurrentFootprintInverseMainHistoryBaseline } from "./current-footprint-inverse-main-history-baseline.ts";
import type { CurrentFootprintInverseMainHistoryBaseline } from "./current-footprint-inverse-main-history-baseline.ts";

export interface CurrentFootprintInverseInitialSyncData {
  readonly schema: "private.current-footprint-inverse-initial-sync-data.v1";
  readonly cache: CurrentFootprintInverseInitialCacheData; readonly baseline: CurrentFootprintInverseMainHistoryBaseline;
  readonly headIndex: Readonly<{ url: string; body: string }>; readonly headCount: number; readonly baselineObjects: number;
  readonly completeSavedInputSha256: string; readonly suppliedObservationsOnly: true; readonly nativeSyncCompletionVerified: false;
}
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_INVERSE_INITIAL_SYNC_DATA"); } }
export function deriveCurrentFootprintInverseInitialSyncData(rawInput: unknown, flow: unknown): CurrentFootprintInverseInitialSyncData {
  const input = captureCurrentFootprintSavedFlowCacheInput(rawInput); const baseline = deriveCurrentFootprintInverseMainHistoryBaseline(input), cache = deriveCurrentFootprintInverseInitialCacheData(flow);
  need(input.projectUuid === cache.projectUuid && input.branchUuid === cache.branchUuid);
  const head = cache.jobs.find(row => row.kind === "head"); need(head !== undefined);
  const parsed: unknown = JSON.parse(head.body); const captured = captureCurrentPcbStringClockReply(parsed).value;
  const rows = z.array(z.record(z.string(), z.unknown())).min(1).max(8).parse(captured); need(rows.length === input.heads.length);
  for (const [index, row] of rows.entries()) { need(row["uuid"] === input.heads[index]?.uuid); }
  const queue: unknown[] = [captured]; let objects = 0;
  while (queue.length > 0) { const item = queue.pop(); if (item !== null && typeof item === "object") { objects += 1; need(objects <= cache.headLimits.nodes); const entries = Array.isArray(item) ? z.array(z.unknown()).parse(item) : Object.values(z.record(z.string(), z.unknown()).parse(item)); queue.push(...entries); } }
  return Object.freeze({ schema: "private.current-footprint-inverse-initial-sync-data.v1", cache, baseline, headIndex: Object.freeze({ url: head.key, body: head.body }), headCount: rows.length, baselineObjects: objects,
    completeSavedInputSha256: sha256Text(canonicalJson(input)), suppliedObservationsOnly: true, nativeSyncCompletionVerified: false });
}
