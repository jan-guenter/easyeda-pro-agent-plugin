/** Private wire projection of one exact original ledger reservation. Selectors
 * supply no CDP identifiers, and the native encoder sees only retained values. */
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PCB_VIA_SAVED_READBACK_PROFILE as PROFILE } from "./current-pcb-via-saved-readback-profile.ts";
import { canonicalJson } from "./core.ts";
import { currentPcbViaSavedCacheNativeRequest } from "./current-pcb-via-saved-cache-protocol.ts";
import type { CurrentPcbViaSavedCachePlan } from "./current-pcb-via-saved-cache-ledger.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function currentPcbViaSavedCacheWire(plan: CurrentPcbViaSavedCachePlan, id: number, sessionId: string): Readonly<{
  id: number; method: CurrentPcbViaSavedCachePlan["method"]; params: CurrentPcbViaSavedCachePlan["params"]; sessionId: string; savedReadbackCache: true;
}> {
  if (!Number.isSafeInteger(id) || id < 1 || id > PROFILE.renderer.activeReadOnly || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SAVED_READBACK_CACHE_WIRE"); }
  return freezeDeep({ id, method: plan.method, params: plan.params, sessionId, savedReadbackCache: true });
}
export function currentPcbViaSavedCacheNativeFrame(chunk: Buffer, plan: CurrentPcbViaSavedCachePlan, sessionId: string): Readonly<Record<string, unknown>> {
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { throw new Error("SAVED_READBACK_CACHE_WIRE"); }
  const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1)));
  const value = captureCurrentPcbStringClockReply(raw).value;
  if (value === null || typeof value !== "object" || !("id" in value) || typeof value.id !== "number" || canonicalJson(value) !== canonicalJson(currentPcbViaSavedCacheWire(plan, value.id, sessionId)) || chunk.toString("utf8") !== `${JSON.stringify(currentPcbViaSavedCacheWire(plan, value.id, sessionId))}\0`) { throw new Error("SAVED_READBACK_CACHE_WIRE"); }
  return freezeDeep({ action: "saved-readback-cache", requestId: value.id, sessionId, ...currentPcbViaSavedCacheNativeRequest(plan.command), ...Object.fromEntries(Object.entries(plan.params).filter(([name]) => name !== "requestHeaders")) });
}

/** Same cold readonly bootstrap parent reservation, moved before any cache
 * Open(name) can run. Every future worker is held before its first script. */
export const CURRENT_PCB_VIA_SAVED_READBACK_PARENT_PARAMS = Object.freeze({ autoAttach: true, waitForDebuggerOnStart: true, flatten: true,
  filter: Object.freeze([Object.freeze({ type: "worker", exclude: false }), Object.freeze({ exclude: true })]) } as const);
export function currentPcbViaSavedReadbackParentWire(id: number, sessionId: string): Readonly<{ id: number; method: "Target.setAutoAttach";
  params: typeof CURRENT_PCB_VIA_SAVED_READBACK_PARENT_PARAMS; sessionId: string; savedReadbackParent: "arm" }> {
  if (!Number.isSafeInteger(id) || id < 1 || id > PROFILE.renderer.activeReadOnly || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SAVED_READBACK_PARENT_WIRE"); }
  return Object.freeze({ id, method: "Target.setAutoAttach", params: CURRENT_PCB_VIA_SAVED_READBACK_PARENT_PARAMS, sessionId, savedReadbackParent: "arm" });
}
export function currentPcbViaSavedReadbackParentNativeFrame(chunk: Buffer, sessionId: string): Readonly<Record<string, unknown>> {
  if (chunk.length > 1024 || chunk.at(-1) !== 0) { throw new Error("SAVED_READBACK_PARENT_WIRE"); }
  const value: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1)));
  if (value === null || typeof value !== "object" || !("id" in value) || typeof value.id !== "number" || chunk.toString("utf8") !== `${JSON.stringify(currentPcbViaSavedReadbackParentWire(value.id, sessionId))}\0`) { throw new Error("SAVED_READBACK_PARENT_WIRE"); }
  return Object.freeze({ action: "saved-readback-parent", requestId: value.id, sessionId });
}
