/** Fixed cold-producer suffix for the genuine forward-execution birth. The
 * structure observer keeps its separate action, limits and legacy grammar. */
// oxlint-disable-next-line import/no-cycle -- The existing fixed codec uses the unchanged startup fallback only when invoked later; no initializer calls across the codec cycle.
import { currentProjectStructureWorkerWire } from "./current-project-structure-worker-wire.ts";
import { CURRENT_FOOTPRINT_FORWARD_NATIVE_LIMITS as LIMITS } from "./current-footprint-forward-native-limits.ts";
// oxlint-disable-next-line import/no-cycle -- Build-time codebook production invokes the fixed encoder only after initialization; the native source is never a runtime input.
import { currentProjectStructureWorkerNativeSource } from "./current-project-structure-worker-native.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { z } from "zod";

export const CURRENT_FOOTPRINT_FORWARD_COLD_PHASES: readonly string[] = Object.freeze([
  "call-cold-project", "call-cold-stream", "call-cold-cooperation", "call-pristine",
  "site-detached-entry", "site-detached-returned", "site-detached-headEntry", "site-detached-headPromise",
  "site-detached-headSuccess", "site-detached-cacheRetry", "site-detached-historyRetry",
  "call-detached-admit", "call-detached-matches", "call-head-admit", "call-head-matches", "call-head-retain", "call-head-barrier",
  "detached-frame", "head-frame", "detached-release",
]);
export function currentFootprintForwardColdWire(input: unknown, id: number): ReturnType<typeof currentProjectStructureWorkerWire> | null {
  if (!Number.isSafeInteger(id) || id < 1 || id > LIMITS.requestLimit) { throw new Error("FORWARD_COLD_WIRE_ID"); }
  let original: ReturnType<typeof currentProjectStructureWorkerWire>;
  try { original = currentProjectStructureWorkerWire(input, 1); } catch { return null; }
  if (original.request["action"] !== "structure-worker-send" || !CURRENT_FOOTPRINT_FORWARD_COLD_PHASES.includes(String(original.request["phase"]))) { return null; }
  return Object.freeze({ command: Object.freeze({ ...original.command, id }),
    request: Object.freeze({ ...original.request, action: "footprint-forward-cold-send", requestId: id }) });
}
/** Native templates are reconstructed from the same finite codebook. The
 * original v2 owner independently restricts the reachable phases above. */
export function currentFootprintForwardColdNativeSource(): string {
  return currentProjectStructureWorkerNativeSource().replaceAll("EasyedaProjectStructureWorkerProtocol", "EasyedaFootprintForwardColdProtocol");
}
const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
/* oxlint-disable unicorn/max-nested-calls -- Keep each closed fixed inspector shape together rather than widening any nested parameter schema. */
const tailSchema = z.discriminatedUnion("method", [
  z.object({ sessionId: handle.max(128), method: z.literal("Runtime.getProperties"), params: z.object({
    objectId: handle, ownProperties: z.literal(true), generatePreview: z.literal(false) }).strict() }).strict(),
  z.object({ sessionId: handle.max(128), method: z.literal("Debugger.removeBreakpoint"), params: z.object({ breakpointId: handle }).strict() }).strict(),
  z.object({ sessionId: handle.max(128), method: z.literal("Debugger.resume"), params: z.object({}).strict() }).strict(),
]);
/* oxlint-enable unicorn/max-nested-calls */
export function currentFootprintForwardColdTailWire(input: unknown, id: number): ReturnType<typeof currentProjectStructureWorkerWire> {
  const fixed = currentFootprintForwardColdWire(input, id); if (fixed !== null) { return fixed; }
  const command = tailSchema.parse(captureCurrentPcbStringClockReply(input).value);
  const request: Record<string, string | number> = { action: "footprint-forward-cold-send", requestId: id,
    sessionId: command.sessionId, method: command.method };
  if (command.method === "Runtime.getProperties") { request["phase"] = "tail-properties"; request["objectId"] = command.params.objectId; }
  else if (command.method === "Debugger.removeBreakpoint") { request["phase"] = "tail-remove"; request["breakpointId"] = command.params.breakpointId; }
  else { request["phase"] = "tail-resume"; }
  return Object.freeze({ command: Object.freeze({ ...command, id }), request: Object.freeze(request) });
}
