/** Original result and final-yw frame facts only. These data decoders cannot
 * issue worker completion, reference acceptance or deletion permission. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_REFERENCE_RESULT_FINAL_POINT as FINAL } from "./current-footprint-inverse-reference-result-protocol.ts";
import type { CURRENT_FOOTPRINT_INVERSE_REFERENCE_RESULT_REPLY_POINTS as REPLY } from "./current-footprint-inverse-reference-result-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_REFERENCE_UI_ORDER as ORDER } from "./current-footprint-inverse-reference-ui-programs.ts";
import type { CurrentFootprintInverseReferenceUiKind as Kind } from "./current-footprint-inverse-reference-ui-programs.ts";
import { currentFootprintInverseReferenceUiPause } from "./current-footprint-inverse-reference-ui-replies.ts";
import { currentFootprintInverseGetResultPause } from "./current-footprint-inverse-get-result-replies.ts";
import { qualifyCurrentFootprintInversePublicDeleteSource } from "./current-footprint-inverse-public-delete-source.ts";
import { qualifyCurrentFootprintSourceFunctionMetadata } from "./current-footprint-source-function-metadata.ts";

export type CurrentFootprintInverseReferenceResultPointRole = keyof typeof REPLY | "nextRpc" | "finalYw";
export interface CurrentFootprintInverseReferenceResultHeld { readonly role: CurrentFootprintInverseReferenceResultPointRole | "onMessage"; readonly frame: string; readonly caller: string | null; readonly push: string | null; readonly yw: string | null; readonly kind: "native" | "local" | null }
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const remote = z.looseObject({ type: z.string(), objectId: handle.optional() });
const frame = z.strictObject({ callFrameId: handle, functionName: z.string(), functionLocation: location, location, url: z.string(), scopeChain: z.array(z.unknown()).max(16), this: remote, returnValue: remote.optional(), canBeRestarted: z.boolean().optional() });
const pause = z.strictObject({ method: z.literal("Debugger.paused"), sessionId: handle, params: z.strictObject({ callFrames: z.array(frame).min(1).max(64), reason: z.enum(["other", "debugCommand"]), hitBreakpoints: z.tuple([handle]), asyncStackTrace: z.unknown().optional(), asyncStackTraceId: z.unknown().optional() }) });
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_REFERENCE_RESULT_REPLY"); } }
/** Join the current query to registered result points, the exact final yw stop or its next RPC, refusing earlier row-stage roles. */
export function currentFootprintInverseReferenceResultPause(input: unknown, sessionId: string, scripts: Readonly<{ ui: string; manager: string }>, profile: "ui" | "manager", points: ReadonlyMap<string, CurrentFootprintInverseReferenceResultPointRole>, onMessagePoint: string | null, kind: Kind): CurrentFootprintInverseReferenceResultHeld {
  const raw = pause.parse(capture(input)); need(raw.sessionId === sessionId); const id = raw.params.hitBreakpoints[0]; const role = points.get(id);
  if (role === "nextRpc") { const next = ORDER[ORDER.indexOf(kind) + 1]; need(next !== undefined); const held = currentFootprintInverseReferenceUiPause(input, sessionId, scripts, profile, id, next); return Object.freeze({ role, frame: held.frame, caller: held.caller, yw: held.yw, push: null, kind: null }); }
  if (role === "finalYw") { need(kind === "device-all" && raw.params.callFrames.length === 1); const top = raw.params.callFrames[0]; need(top !== undefined && top.functionName === FINAL.name && top.functionLocation.scriptId === scripts.ui && top.functionLocation.lineNumber === FINAL.functionLine && top.functionLocation.columnNumber === FINAL.functionColumn && top.location.scriptId === scripts.ui && top.location.lineNumber === FINAL.lineNumber && top.location.columnNumber === FINAL.columnNumber); return Object.freeze({ role, frame: top.callFrameId, caller: null, push: null, yw: top.callFrameId, kind: null }); }
  if (onMessagePoint !== null && id === onMessagePoint) { need(kind !== "schematic"); }
  need(role !== undefined || onMessagePoint !== null && id === onMessagePoint);
  const shared = new Map<string, keyof typeof REPLY>(); for (const [point, selected] of points) { if (selected !== "nextRpc" && selected !== "finalYw") { shared.set(point, selected); } }
  const held = currentFootprintInverseGetResultPause(input, sessionId, scripts, shared, onMessagePoint ?? "unissued_reference_on_message"); need(held.role !== "f2Raw" && held.role !== "m8Row"); return Object.freeze({ ...held, role: held.role, yw: null });
}
export const CURRENT_FOOTPRINT_INVERSE_REFERENCE_FINAL_L_SOURCE = Object.freeze({ start: 15_337_605, end: 15_338_483, bytes: 878, sha256: "1ded83822e1da7e13b6a1fd72b6b8ba7f171b3c47d1d1eab60a707a62c33b9bc", name: "l", arity: 4, kind: "function", async: false, strict: false, parent: null, lineNumber: 1933, columnNumber: 28_709 } as const);
/** Require complete pinned UI source and the exact final empty-check span before accepting its function metadata. */
export function qualifyCurrentFootprintInverseReferenceFinalL(input: unknown, metadata: unknown, scriptId: string, uiSource: string): string {
  qualifyCurrentFootprintInversePublicDeleteSource("ui", uiSource); const expected = CURRENT_FOOTPRINT_INVERSE_REFERENCE_FINAL_L_SOURCE; const actual = uiSource.slice(expected.start, expected.end); need(typeof input === "string" && input === actual && Buffer.byteLength(actual) === expected.bytes && createHash("sha256").update(actual).digest("hex") === expected.sha256); return qualifyCurrentFootprintSourceFunctionMetadata(metadata, expected, scriptId);
}
const scope = z.strictObject({ name: z.string(), value: z.strictObject({ type: z.literal("object"), subtype: z.literal("internal#scope"), className: z.literal("Object"), description: z.string(), objectId: handle }), writable: z.literal(true), enumerable: z.literal(true), configurable: z.literal(true), isOwn: z.literal(true) });
/** Decode the bounded yw-closure-to-Global scope order and return its first handle, refusing unsupported shapes and indices. */
export function currentFootprintInverseReferenceFinalLScope(input: unknown): string { const packet = z.strictObject({ result: z.array(scope).min(2).max(4) }).parse(capture(input)); const fields = packet.result; need(fields[0]?.value.description === "Closure (yw)" && fields.at(-1)?.value.description === "Global"); for (const [index, field] of fields.entries()) { need(field.name === String(index)); if (index > 0 && index < fields.length - 1) { need(field.value.description === "Closure" || index === fields.length - 2 && field.value.description === "Script"); } } const first = fields[0]; need(first !== undefined); return first.value.objectId; }
