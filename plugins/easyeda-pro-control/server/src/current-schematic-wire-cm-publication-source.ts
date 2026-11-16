/** Exact ordinary CM publication method selected inside the qualified
 * schematic publisher blueprint. Data prove no original event ownership. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_WIRE_PENDING_BATCH_SOURCE,qualifyCurrentSchematicWirePendingBatchSource } from "./current-schematic-wire-pending-batch-source.ts";
import { compareCurrentSchematicWireFunctionMetadata } from "./current-schematic-wire-completion-source.ts";
import type { CurrentSchematicWireCompletionFunction } from "./current-schematic-wire-completion-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_WIRE_CM_PUBLICATION_SOURCE = freezeDeep([
  {
    "variant": 0,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
    "start": 426_941,
    "end": 427_034,
    "bytes": 93,
    "sha256": "195e27b7da2e0b58cfd7c1e063f54f580d8077a6d1c7a14e5b44dd6cdfec2214",
    "name": "publishChange",
    "arity": 13,
    "constructible": false,
    "className": "Function",
    "parentType": "function",
    "parentClassName": "Function",
    "parentDescription": "function () { [native code] }",
    "lineNumber": 8,
    "columnNumber": 3709
  },
  {
    "variant": 1,
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch.js",
    "start": 1_450_353,
    "end": 1_450_446,
    "bytes": 93,
    "sha256": "195e27b7da2e0b58cfd7c1e063f54f580d8077a6d1c7a14e5b44dd6cdfec2214",
    "name": "publishChange",
    "arity": 13,
    "constructible": false,
    "className": "Function",
    "parentType": "function",
    "parentClassName": "Function",
    "parentDescription": "function () { [native code] }",
    "lineNumber": 534,
    "columnNumber": 3709
  }
] as const);
/** Whole original source precedes exact complete method bytes. */
export function qualifyCurrentSchematicWireCmPublicationSource(source: string): 0 | 1 { const variant = qualifyCurrentSchematicWirePendingBatchSource(source); const row = CURRENT_SCHEMATIC_WIRE_CM_PUBLICATION_SOURCE[variant]; const text = source.slice(row.start, row.end); if (Buffer.byteLength(text) !== row.bytes || createHash("sha256").update(text).digest("hex") !== row.sha256) { throw new Error("SCHEMATIC_WIRE_CM_PUBLICATION_SOURCE"); } return variant; }
/** Actual metadata retain the original script and PC; JSON cannot issue an owner. */
export function decodeCurrentSchematicWireCmPublicationFunction(input: unknown, actual: unknown, variant: 0 | 1, scriptId: string): CurrentSchematicWireCompletionFunction { if ((variant !== 0 && variant !== 1) || Object.is(variant, -0)) { throw new Error("SCHEMATIC_WIRE_CM_PUBLICATION_VARIANT"); } return compareCurrentSchematicWireFunctionMetadata(input, actual, CURRENT_SCHEMATIC_WIRE_CM_PUBLICATION_SOURCE[variant], scriptId); }

export const CURRENT_SCHEMATIC_WIRE_CM_PUBLICATION_PUBLISHER_CALL_POINTS = freezeDeep([{ lineNumber: 30, columnNumber: 23_869 }, { lineNumber: 556, columnNumber: 23_869 }] as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const site = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const callFrame = z.object({ callFrameId: handle, functionLocation: site.optional(), location: site, returnValue: z.unknown().optional() });
const pause = z.object({ reason: z.literal("other"), callFrames: z.array(callFrame).min(4).max(64), hitBreakpoints: z.array(handle).length(1) });
/** Compare one held native event's fixed CM function and sole direct publisher
 * callsite. Parsing supplies data only; Core retains original event custody. */
export function decodeCurrentSchematicWireCmPublicationPause(input: unknown, variant: 0 | 1, scriptId: string, breakpointId: string): Readonly<{ frame: string; publisherFrame: string; originalEventJoined: false }> {
  if ((variant !== 0 && variant !== 1) || Object.is(variant, -0)) { throw new Error("SCHEMATIC_WIRE_CM_PUBLICATION_VARIANT"); } handle.parse(scriptId); handle.parse(breakpointId);
  const raw = pause.parse(capture(input).value); const top = raw.callFrames[0]; const caller = raw.callFrames[3]; const cm = CURRENT_SCHEMATIC_WIRE_CM_PUBLICATION_SOURCE[variant]; const publisher = CURRENT_SCHEMATIC_WIRE_PENDING_BATCH_SOURCE[variant].roles.localChange; const point = CURRENT_SCHEMATIC_WIRE_CM_PUBLICATION_PUBLISHER_CALL_POINTS[variant];
  if (top === undefined || caller === undefined || raw.hitBreakpoints[0] !== breakpointId || top.location.scriptId !== scriptId || top.functionLocation?.scriptId !== scriptId || top.functionLocation.lineNumber !== cm.lineNumber || top.functionLocation.columnNumber !== cm.columnNumber || top.returnValue !== undefined || caller.functionLocation?.scriptId !== scriptId || caller.functionLocation.lineNumber !== publisher.lineNumber || caller.functionLocation.columnNumber !== publisher.columnNumber || caller.location.scriptId !== scriptId || caller.location.lineNumber !== point.lineNumber || caller.location.columnNumber !== point.columnNumber) { throw new Error("SCHEMATIC_WIRE_CM_PUBLICATION_PAUSE"); }
  return Object.freeze({ frame: top.callFrameId, publisherFrame: caller.callFrameId, originalEventJoined: false });
}
