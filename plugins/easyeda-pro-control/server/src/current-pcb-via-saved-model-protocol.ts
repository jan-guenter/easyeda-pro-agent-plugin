/** Fixed saved-reader model calls. This codec carries no original owner or
 * completed-loading authority and accepts no alternate source program. */
import { canonicalJson } from "./core.ts";
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import { diagnosticPcbOpeningParams, diagnosticPrimitives209Params } from "./current-pcb-diagnostic-protocol.ts";

export type CurrentPcbViaSavedModelPhase = "preflight" | "open-document" | "observe" | "primitives";
export const CURRENT_PCB_VIA_SAVED_MODEL_REQUESTS = Object.freeze({ pcbOpening: 10, pcbSource: 13, primitives: 10, total: 33 });
export function currentPcbViaSavedModelNativeFrame(chunk: Buffer, sessionId: string, uniqueContextId: string,
  target: CurrentDisposableOpenSealedTarget, phase: CurrentPcbViaSavedModelPhase): Readonly<Record<string, string | number>> {
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { throw new Error("SAVED_MODEL_FRAME"); }
  const decoded = new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1));
  const value: unknown = JSON.parse(decoded);
  if (value === null || typeof value !== "object" || !("id" in value) || typeof value.id !== "number" || !Number.isSafeInteger(value.id) || value.id < 1) { throw new Error("SAVED_MODEL_FRAME"); }
  const params = phase === "primitives" ? diagnosticPrimitives209Params(uniqueContextId, target) : diagnosticPcbOpeningParams(uniqueContextId, target, phase);
  const expected = { id: value.id, method: "Runtime.callFunctionOn", params, sessionId };
  if (canonicalJson(value) !== canonicalJson(expected) || chunk.toString("utf8") !== `${JSON.stringify(expected)}\0`) { throw new Error("SAVED_MODEL_FRAME"); }
  return Object.freeze({ action: "saved-readback-model", requestId: value.id, modelPhase: phase });
}
