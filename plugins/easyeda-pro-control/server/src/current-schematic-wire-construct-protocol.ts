/** Fixed native Reflect.construct comparison. No constructor invocation,
 * callback continuation or caller JavaScript enters this readonly vocabulary. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_WIRE_CONSTRUCT_FLAGS = Object.freeze({ objectGroup: "easyeda-pro-control-schematic-wire-construct-v1", silent: true, generatePreview: false, throwOnSideEffect: true } as const);
export const CURRENT_SCHEMATIC_WIRE_CONSTRUCT_FRAME = "[Reflect]";
export const CURRENT_SCHEMATIC_WIRE_CONSTRUCT_SAME = String.raw`function(native,reflect,construct){"use strict";const get=native[0],proto=native[2],has=native[4],keys=native[5],isArray=native[7],bad=()=>{throw "SCH209_WIRE_CONSTRUCT";},own=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value"))bad();return d.value;};if(!isArray(this)||proto(this)!==native[16]||own(this,"length")!==1||keys(this).length!==2||own(this,0)!==reflect||proto(reflect)!==native[15])bad();const d=get(reflect,"construct");if(!d||!has(d,"value")||d.value!==construct||!d.writable||d.enumerable||!d.configurable)bad();return true;}`;
export const CURRENT_SCHEMATIC_WIRE_CONSTRUCT_REQUESTS = Object.freeze({ initial: 5, recheck: 3, normal: 8, helperSourcesMaximum: 2, cleanup: 1, totalMaximum: 11 } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), object = z.strictObject({ objectId: handle });
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_WIRE_CONSTRUCT_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const frameParams = z.strictObject({ ...flags, callFrameId: handle, expression: z.literal(CURRENT_SCHEMATIC_WIRE_CONSTRUCT_FRAME), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) });
const propertyParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const callParams = z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(CURRENT_SCHEMATIC_WIRE_CONSTRUCT_SAME), arguments: z.array(object).length(3), returnByValue: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) });
const releaseParams = z.strictObject({ objectGroup: flags.objectGroup });
const schema = z.union([
  z.strictObject({ phase: z.literal("wire-construct-frame"), method: z.literal("Debugger.evaluateOnCallFrame"), params: frameParams }),
  z.strictObject({ phase: z.literal("wire-construct-properties"), method: z.literal("Runtime.getProperties"), params: propertyParams }),
  z.strictObject({ phase: z.literal("wire-construct-same"), method: z.literal("Runtime.callFunctionOn"), params: callParams }),
  z.strictObject({ phase: z.literal("wire-construct-release"), method: z.literal("Runtime.releaseObjectGroup"), params: releaseParams }),
]);
export type CurrentSchematicWireConstructCommand = z.infer<typeof schema>;
/** Preserve one fixed row and reject all unknown fields and methods. */
export function validateCurrentSchematicWireConstructCommand(input: unknown): CurrentSchematicWireConstructCommand { return freezeDeep(schema.parse(capture(input).value)); }
/** Enumerate the entire closed native codebook with inert selector handles. */
export function currentSchematicWireConstructCases(): readonly CurrentSchematicWireConstructCommand[] {
  return freezeDeep([
    { phase: "wire-construct-frame", method: "Debugger.evaluateOnCallFrame", params: { ...CURRENT_SCHEMATIC_WIRE_CONSTRUCT_FLAGS, callFrameId: "original_frame", expression: CURRENT_SCHEMATIC_WIRE_CONSTRUCT_FRAME, returnByValue: false, includeCommandLineAPI: false } },
    { phase: "wire-construct-properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    { phase: "wire-construct-same", method: "Runtime.callFunctionOn", params: { ...CURRENT_SCHEMATIC_WIRE_CONSTRUCT_FLAGS, objectId: "original_ref", functionDeclaration: CURRENT_SCHEMATIC_WIRE_CONSTRUCT_SAME, arguments: Array.from({ length: 3 }, () => ({ objectId: "original_ref" })), returnByValue: true, awaitPromise: false, userGesture: false } },
    { phase: "wire-construct-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: CURRENT_SCHEMATIC_WIRE_CONSTRUCT_FLAGS.objectGroup } },
  ].map(row => validateCurrentSchematicWireConstructCommand(row)));
}
/** Substitute original handles only; the generated program remains fixed. */
export function currentSchematicWireConstructTemplate(input: unknown): Readonly<{ phase: string; method: string; fields: Readonly<Record<string, "handle">>; values: Readonly<Record<string, string>>; template: string }> {
  const command = validateCurrentSchematicWireConstructCommand(input), fields: Record<string, "handle"> = {}, values: Record<string, string> = {};
  const field = (name: string, value: string): string => { fields[name] = "handle"; values[name] = value; return `__schematic_wireconstruct_${name}__`; };
  const params: Record<string, unknown> = { ...command.params };
  if (command.method === "Debugger.evaluateOnCallFrame") { params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if (command.method === "Runtime.getProperties" || command.method === "Runtime.callFunctionOn") {
    params["objectId"] = field("objectId", command.params.objectId);
    if (command.method === "Runtime.callFunctionOn") { params["arguments"] = command.params.arguments.map((arg, index) => ({ objectId: field(`arg${String(index)}`, arg.objectId) })); }
  }
  return freezeDeep({ phase: command.phase, method: command.method, fields, values, template: JSON.stringify({ method: command.method, params }) });
}
