/** Fixed inverse-only wire over actual correlated private ledger reservations.
 * No cache ID, request URL or native handle is accepted as command input. */
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { CurrentPcbViaSavedCachePlan } from "./current-pcb-via-saved-cache-ledger.ts";
import type { CurrentPcbViaSavedCacheMetadataPlan } from "./current-pcb-via-saved-cache-metadata-ledger.ts";
import { currentPcbViaSavedCacheNativeRequest } from "./current-pcb-via-saved-cache-protocol.ts";
import { currentPcbViaSavedCacheMetadataNativeRequest } from "./current-pcb-via-saved-cache-metadata-protocol.ts";
import { CURRENT_PCB_VIA_SAVED_CACHE_METADATA_REQUESTS as METADATA } from "./current-pcb-via-saved-cache-metadata-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_CACHE_REQUESTS = Object.freeze({ cacheNormal: 1 + 1 + 2 + 4 + 2 * 8, cacheCleanup: 1,
  metadataNormal: METADATA.normal, metadataCleanup: METADATA.cleanup, guard: 9 + 1, total: 25 + METADATA.total + 10 });
export function currentFootprintInverseCacheWire(plan: CurrentPcbViaSavedCachePlan, id: number, sessionId: string): Readonly<{
  id: number; method: CurrentPcbViaSavedCachePlan["method"]; params: CurrentPcbViaSavedCachePlan["params"]; sessionId: string; inverseCache: true;
}> {
  if (!Number.isSafeInteger(id) || id < 1 || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId) || plan.command.phase === "saved-cache-delete" ||
    "step" in plan.command && !["initial", "before", "after-backup"].includes(plan.command.step)) { throw new Error("FOOTPRINT_INVERSE_CACHE_READ_ONLY_WIRE"); }
  return freezeDeep({ id, method: plan.method, params: plan.params, sessionId, inverseCache: true });
}
export function currentFootprintInverseCacheMetadataWire(plan: CurrentPcbViaSavedCacheMetadataPlan, id: number, sessionId: string): Readonly<{
  id: number; method: CurrentPcbViaSavedCacheMetadataPlan["method"]; params: CurrentPcbViaSavedCacheMetadataPlan["params"]; sessionId: string; inverseCacheMetadata: true;
}> {
  if (!Number.isSafeInteger(id) || id < 1 || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("FOOTPRINT_INVERSE_CACHE_METADATA_WIRE"); }
  return freezeDeep({ id, method: plan.method, params: plan.params, sessionId, inverseCacheMetadata: true });
}
function requestId(chunk: Buffer): number {
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { throw new Error("FOOTPRINT_INVERSE_CACHE_FRAME"); }
  const text = new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1));
  const raw: unknown = JSON.parse(text); const captured = captureCurrentPcbStringClockReply(raw).value;
  if (captured === null || typeof captured !== "object" || !("id" in captured) || typeof captured.id !== "number" || !Number.isSafeInteger(captured.id) || captured.id < 1) { throw new Error("FOOTPRINT_INVERSE_CACHE_FRAME"); }
  return captured.id;
}
function exact(chunk: Buffer, value: unknown): void { if (chunk.toString("utf8") !== `${JSON.stringify(value)}\0`) { throw new Error("FOOTPRINT_INVERSE_CACHE_FRAME"); } }
export function currentFootprintInverseCacheNativeFrame(chunk: Buffer, plan: CurrentPcbViaSavedCachePlan, sessionId: string): Readonly<Record<string, unknown>> {
  const id = requestId(chunk); exact(chunk, currentFootprintInverseCacheWire(plan, id, sessionId));
  return freezeDeep({ action: "footprint-inverse-cache", requestId: id, sessionId, ...currentPcbViaSavedCacheNativeRequest(plan.command),
    ...Object.fromEntries(Object.entries(plan.params).filter(([name]) => name !== "requestHeaders")) });
}
export function currentFootprintInverseCacheMetadataNativeFrame(chunk: Buffer, plan: CurrentPcbViaSavedCacheMetadataPlan, sessionId: string): Readonly<Record<string, unknown>> {
  const id = requestId(chunk); exact(chunk, currentFootprintInverseCacheMetadataWire(plan, id, sessionId)); const fields: Record<string, unknown> = {};
  for (const name of ["objectId", "uniqueContextId", "scriptId"]) { if (Object.hasOwn(plan.params, name)) { fields[name] = plan.params[name]; } }
  if (plan.helper === "bind") {
    const args = captureCurrentPcbStringClockReply(plan.params["arguments"]).value;
    if (!Array.isArray(args) || args.length !== 2) { throw new Error("FOOTPRINT_INVERSE_CACHE_METADATA_FRAME"); }
    const first: unknown = args[0], second: unknown = args[1];
    if (first === null || typeof first !== "object" || !("objectId" in first) || second === null || typeof second !== "object" || !("value" in second)) { throw new Error("FOOTPRINT_INVERSE_CACHE_METADATA_FRAME"); }
    fields["requestMembersObjectId"] = first.objectId; fields["projectUuid"] = second.value;
  }
  return freezeDeep({ action: "footprint-inverse-cache-metadata", requestId: id, sessionId, ...currentPcbViaSavedCacheMetadataNativeRequest(plan.command), ...fields });
}
