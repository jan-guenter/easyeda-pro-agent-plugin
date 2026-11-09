/** Distinct Wire metadata vocabulary. Only original holder data and fixed
 * descriptor projections enter CDP; no constructor, setter or action runs. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_WIRE_ACCESSOR_GROUP = "easyeda-pro-control-schematic-wire-accessor-v1";
export const CURRENT_SCHEMATIC_WIRE_ACCESSOR_REQUESTS = Object.freeze({ normal: 8, cleanup: 1, total: 9 });
export const CURRENT_SCHEMATIC_WIRE_ACCESSOR_ROLES = ["pointsGet", "pointsSet", "setLines", "pointConstructor"] as const;
const guard = `"use strict";const bad=()=>{throw new Error("SCH209_WIRE_ACCESSOR_PROJECTION");};
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const json=v=>JSON.stringify(v,(_key,value)=>value&&typeof value==="object"&&!Array.isArray(value)?Object.fromEntries(Object.keys(value).sort().map(key=>[key,value[key]])):value);
const dense=(o,n)=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();for(let i=0;i<n;i++)own(o,String(i));};
const selected=(holder,target,operation)=>{dense(holder,2);const b=own(holder,"0"),state=own(holder,"1");if(own(state,"owner")!==holder||own(state,"identity")!==json({target,operation})||own(state,"failed")!==false||own(state,"modifyAttempted")!==false||own(state,"saveAttempted")!==false)bad();
const line=own(b,"line"),group=own(b,"group"),index=own(b,"index"),points=own(b,"pointBinding"),setLines=own(b,"setLines"),vector=own(b,"vectorCtor");
if(!(index instanceof Map)||index.get(operation.lineId)!==line||index.get(operation.wireId)!==group||own(points,"object")!==line||own(points,"key")!=="points"||own(setLines,"object")!==group||own(setLines,"key")!=="setLines"||own(vector,"key")!=="constructor"||own(own(vector,"fn"),"prototype")!==own(b,"pointPrototype"))bad();
const descriptor=Object.getOwnPropertyDescriptor(own(points,"owner"),"points"),method=Object.getOwnPropertyDescriptor(own(setLines,"owner"),"setLines");if(!descriptor||Object.hasOwn(descriptor,"value")||descriptor.get!==own(points,"get")||descriptor.set!==own(points,"set")||!method||!Object.hasOwn(method,"value")||method.value!==own(setLines,"fn"))bad();
const values=[own(points,"get"),own(points,"set"),own(setLines,"fn"),own(vector,"fn")];if(values.some(value=>typeof value!=="function")||new Set(values).size!==4)bad();return values;};`;
export const CURRENT_SCHEMATIC_WIRE_ACCESSOR_CALLS = Object.freeze({
  callees: `function(targetJson,operationJson){${guard}return selected(this,JSON.parse(targetJson),JSON.parse(operationJson));}`,
  same: `function(holder,targetJson,operationJson){${guard}dense(this,4);const current=selected(holder,JSON.parse(targetJson),JSON.parse(operationJson));for(let i=0;i<4;i++)if(own(this,String(i))!==current[i])bad();return true;}`,
});
export const CURRENT_SCHEMATIC_WIRE_ACCESSOR_FLAGS = Object.freeze({ objectGroup: CURRENT_SCHEMATIC_WIRE_ACCESSOR_GROUP,
  silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const data = z.string().min(1).max(16_384).refine(value => value.isWellFormed() && Buffer.byteLength(value) <= 16_384);
const value = z.strictObject({ value: data }); const object = z.strictObject({ objectId: handle });
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_WIRE_ACCESSOR_GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const calleeParams = z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(CURRENT_SCHEMATIC_WIRE_ACCESSOR_CALLS.callees), arguments: z.tuple([value, value]), returnByValue: z.literal(false) });
const sameParams = z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(CURRENT_SCHEMATIC_WIRE_ACCESSOR_CALLS.same), arguments: z.tuple([object, value, value]), returnByValue: z.literal(true) });
const propertyParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const sourceParams = z.strictObject({ scriptId: handle }); const releaseParams = z.strictObject({ objectGroup: z.literal(CURRENT_SCHEMATIC_WIRE_ACCESSOR_GROUP) });
const commands = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("wire-accessor-callees"), method: z.literal("Runtime.callFunctionOn"), params: calleeParams }),
  z.strictObject({ phase: z.literal("wire-accessor-same"), method: z.literal("Runtime.callFunctionOn"), params: sameParams }),
  z.strictObject({ phase: z.literal("wire-accessor-properties"), method: z.literal("Runtime.getProperties"), params: propertyParams }),
  z.strictObject({ phase: z.literal("wire-accessor-source"), method: z.literal("Debugger.getScriptSource"), params: sourceParams }),
  z.strictObject({ phase: z.literal("wire-accessor-release"), method: z.literal("Runtime.releaseObjectGroup"), params: releaseParams }),
]);
export type CurrentSchematicWireAccessorCommand = z.infer<typeof commands>;
export function validateCurrentSchematicWireAccessorCommand(input: unknown): CurrentSchematicWireAccessorCommand {
  return freezeDeep(commands.parse(captureCurrentPcbStringClockReply(input).value));
}
export function currentSchematicWireAccessorCases(): readonly CurrentSchematicWireAccessorCommand[] {
  return freezeDeep([
    { phase: "wire-accessor-callees", method: "Runtime.callFunctionOn", params: { ...CURRENT_SCHEMATIC_WIRE_ACCESSOR_FLAGS, objectId: "original_holder", functionDeclaration: CURRENT_SCHEMATIC_WIRE_ACCESSOR_CALLS.callees, arguments: [{ value: "{}" }, { value: "{}" }], returnByValue: false } },
    { phase: "wire-accessor-same", method: "Runtime.callFunctionOn", params: { ...CURRENT_SCHEMATIC_WIRE_ACCESSOR_FLAGS, objectId: "original_array", functionDeclaration: CURRENT_SCHEMATIC_WIRE_ACCESSOR_CALLS.same, arguments: [{ objectId: "original_holder" }, { value: "{}" }, { value: "{}" }], returnByValue: true } },
    { phase: "wire-accessor-properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    { phase: "wire-accessor-source", method: "Debugger.getScriptSource", params: { scriptId: "original_ref" } },
    { phase: "wire-accessor-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: CURRENT_SCHEMATIC_WIRE_ACCESSOR_GROUP } },
  ].map(command => validateCurrentSchematicWireAccessorCommand(command)));
}
/** Native substitutes the original holder and checkpoint-bound data itself.
 * No operation JSON, receiver or function program enters the external fields. */
export function currentSchematicWireAccessorTemplate(input: unknown): Readonly<{ phase: string; method: string; fields: Readonly<Record<string, "handle">>; values: Readonly<Record<string, string>>; template: string }> {
  const command = validateCurrentSchematicWireAccessorCommand(input), fields: Record<string, "handle"> = {}, values: Record<string, string> = {};
  const field = (name: string, raw: string): string => { fields[name] = "handle"; values[name] = raw; return `__schematic_wireaccessor_${name}__`; };
  const params: Record<string, unknown> = { ...command.params };
  if (command.phase === "wire-accessor-callees") { params["objectId"] = "__schematic_wireaccessor_boundHolder__"; params["arguments"] = [{ value: "__schematic_wireaccessor_boundTarget__" }, { value: "__schematic_wireaccessor_boundOperation__" }]; }
  else if (command.phase === "wire-accessor-same") { params["objectId"] = field("objectId", command.params.objectId); params["arguments"] = [{ objectId: "__schematic_wireaccessor_boundHolder__" }, { value: "__schematic_wireaccessor_boundTarget__" }, { value: "__schematic_wireaccessor_boundOperation__" }]; }
  else if (command.phase === "wire-accessor-properties") { params["objectId"] = field("objectId", command.params.objectId); }
  else if (command.phase === "wire-accessor-source") { params["scriptId"] = field("scriptId", command.params.scriptId); }
  return freezeDeep({ phase: command.phase, method: command.method, fields, values, template: JSON.stringify({ method: command.method, params }) });
}
/** Pair a validated fixed accessor command with a positive native request ID.
 * Only template-declared handle values enter the external request. */
export function currentSchematicWireAccessorWire(input: unknown, requestId: number): Readonly<{ command: CurrentSchematicWireAccessorCommand; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(requestId) || requestId < 1 || requestId > 2_147_483_647) { throw new Error("SCHEMATIC_WIRE_ACCESSOR_ID"); }
  const command = validateCurrentSchematicWireAccessorCommand(input), fixed = currentSchematicWireAccessorTemplate(command);
  return freezeDeep({ command, request: { action: "schematic-wire-edit-accessor", requestId, phase: fixed.phase, method: fixed.method, ...fixed.values } });
}
/** Refuse substitution of the original holder and checkpoint JSON in either
 * function-call phase; property/source/release commands carry no such arguments. */
export function requireCurrentSchematicWireAccessorBoundArguments(command: CurrentSchematicWireAccessorCommand, holder: string, target: string, operation: string): void {
  if (command.phase === "wire-accessor-callees" && (command.params.objectId !== holder || canonicalJson(command.params.arguments) !== canonicalJson([{ value: target }, { value: operation }])) ||
    command.phase === "wire-accessor-same" && canonicalJson(command.params.arguments) !== canonicalJson([{ objectId: holder }, { value: target }, { value: operation }])) { throw new Error("SCHEMATIC_WIRE_ACCESSOR_ORIGINAL_ARGUMENTS"); }
}
