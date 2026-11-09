/** Fixed native-task frame view over the unchanged public send parser.
 * V8 may display the original empty-own-name BC arrow with its inferred
 * WR.bc.onmessage name. Its exact source PC and original host event still bind. */
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import { currentFootprintInverseGetSendPause as original } from "./current-footprint-inverse-get-send-replies.ts";
import type { CurrentFootprintInverseGetSendHeld } from "./current-footprint-inverse-get-send-replies.ts";
import type { CURRENT_FOOTPRINT_INVERSE_GET_SEND_POINTS as POINTS } from "./current-footprint-inverse-get-send-source.ts";

/** Normalize only that fixed inferred display name after descriptor-safe
 * capture. The legacy parser still enforces both exact original PCs, scripts,
 * two-frame boundary, point and packet shape. This view grants no provenance;
 * Core/controller must first require their actual original event identity. */
export function currentFootprintInverseNativeGetTaskForwardPause(input: unknown, sessionId: string, scripts: Readonly<{ ui: string; manager: string }>, points: ReadonlyMap<string, keyof typeof POINTS>): Readonly<CurrentFootprintInverseGetSendHeld> {
  const raw = capture(input); if (raw !== null && typeof raw === "object" && "params" in raw && raw.params !== null && typeof raw.params === "object" && "callFrames" in raw.params && Array.isArray(raw.params.callFrames)) { const frames: readonly unknown[] = raw.params.callFrames; const top: unknown = frames[0]; const caller: unknown = frames[1]; if (top !== null && typeof top === "object" && "functionName" in top && top.functionName === "onMessage" && caller !== null && typeof caller === "object" && "functionName" in caller && caller.functionName === "WR.bc.onmessage") { return original({ ...raw, params: { ...raw.params, callFrames: [top, { ...caller, functionName: "" }, ...frames.slice(2)] } }, sessionId, scripts, points); } } return original(raw, sessionId, scripts, points);
}
