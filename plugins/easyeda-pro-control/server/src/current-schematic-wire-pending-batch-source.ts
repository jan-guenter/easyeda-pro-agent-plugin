/** Immutable original publisher source data are shared with the Text source
 * catalogue only. No Text owner, packet, callback registry or schema is reused. */
import { CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_CALLEE_SOURCE as CURRENT_SCHEMATIC_WIRE_PENDING_BATCH_SOURCE, qualifyCurrentSchematicRelevancePublicationCalleeSource } from "./current-schematic-relevance-publication-callee-source.ts";
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export { CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_CALLEE_SOURCE as CURRENT_SCHEMATIC_WIRE_PENDING_BATCH_SOURCE } from "./current-schematic-relevance-publication-callee-source.ts";
export const CURRENT_SCHEMATIC_WIRE_PENDING_BATCH_POINTS = freezeDeep([
  { variant: 0, publisherReturned: { lineNumber: 30, columnNumber: 23_631 }, timerReturned: { lineNumber: 30, columnNumber: 23_370 } },
  { variant: 1, publisherReturned: { lineNumber: 556, columnNumber: 23_631 }, timerReturned: { lineNumber: 556, columnNumber: 23_370 } },
] as const);
/** Source qualification is data only; the original owner must additionally
 * qualify its actual dataBus method and match held native event allocations. */
export function qualifyCurrentSchematicWirePendingBatchSource(source: string): 0 | 1 { return qualifyCurrentSchematicRelevancePublicationCalleeSource(source); }

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const site = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const heldFrame = z.object({ callFrameId: handle, functionLocation: site.optional(), location: site, returnValue: z.unknown().optional() });
const pause = z.object({ reason: z.literal("other"), callFrames: z.array(heldFrame).min(3).max(64), hitBreakpoints: z.array(handle).length(1) });
export interface CurrentSchematicWirePendingBatchDataBusSite { readonly scriptId: string; readonly lineNumber: number; readonly columnNumber: number }
export const CURRENT_SCHEMATIC_WIRE_PENDING_BATCH_CALL_POINTS = freezeDeep([
  { publisher: { lineNumber: 30, columnNumber: 23_432 }, timer: { lineNumber: 30, columnNumber: 23_326 } },
  { publisher: { lineNumber: 556, columnNumber: 23_432 }, timer: { lineNumber: 556, columnNumber: 23_326 } },
] as const);
/** DataBus's actual function site comes from its separately qualified original
 * binding. Compare the exact producer and timer callsites without issuing an
 * event owner or inferring delivery from the publisher's return. */
export function decodeCurrentSchematicWirePendingBatchPayloadPause(input: unknown, variant: 0 | 1, scriptId: string, breakpointId: string, dataBusSite: CurrentSchematicWirePendingBatchDataBusSite): Readonly<{ frame: string; timerFrame: string; originalEventJoined: false }> {
  if ((variant !== 0 && variant !== 1) || Object.is(variant, -0)) { throw new Error("SCHEMATIC_WIRE_PENDING_BATCH_VARIANT"); }
  const expected = site.parse(dataBusSite); handle.parse(scriptId); handle.parse(breakpointId); const raw = pause.parse(capture(input).value); const top = raw.callFrames[0]; const caller = raw.callFrames[1]; const timer = raw.callFrames[2]; const rows = CURRENT_SCHEMATIC_WIRE_PENDING_BATCH_SOURCE[variant].roles; const points = CURRENT_SCHEMATIC_WIRE_PENDING_BATCH_CALL_POINTS[variant];
  if (top === undefined || caller === undefined || timer === undefined || raw.hitBreakpoints[0] !== breakpointId || top.functionLocation?.scriptId !== expected.scriptId || top.functionLocation.lineNumber !== expected.lineNumber || top.functionLocation.columnNumber !== expected.columnNumber || top.returnValue !== undefined || caller.functionLocation?.scriptId !== scriptId || caller.functionLocation.lineNumber !== rows.publishPendData.lineNumber || caller.functionLocation.columnNumber !== rows.publishPendData.columnNumber || caller.location.scriptId !== scriptId || caller.location.lineNumber !== points.publisher.lineNumber || caller.location.columnNumber !== points.publisher.columnNumber || timer.functionLocation?.scriptId !== scriptId || timer.functionLocation.lineNumber !== rows.timerCallback.lineNumber || timer.functionLocation.columnNumber !== rows.timerCallback.columnNumber || timer.location.scriptId !== scriptId || timer.location.lineNumber !== points.timer.lineNumber || timer.location.columnNumber !== points.timer.columnNumber) { throw new Error("SCHEMATIC_WIRE_PENDING_BATCH_PAYLOAD_PAUSE"); }
  return Object.freeze({ frame: top.callFrameId, timerFrame: timer.callFrameId, originalEventJoined: false });
}
