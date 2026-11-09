/** Fixed readonly projections for the original Wire function scopes. A known
 * finite builtin is the only Script/Global binding this separate grammar reads. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_WIRE_LEXICAL_GROUP = "easyeda-pro-control-schematic-wire-lexical-v1";
/** Three original scope lists, at most24 fixed scope projections/property
 * reads, original join/array, two function metadata and four final checks. */
export const CURRENT_SCHEMATIC_WIRE_LEXICAL_REQUESTS = Object.freeze({ normal: 58, cleanup: 1, total: 59 });
const guard = `"use strict";const bad=()=>{throw new Error("SCH209_WIRE_LEXICAL_PROJECTION");};
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const json=v=>JSON.stringify(v,(_key,value)=>value&&typeof value==="object"&&!Array.isArray(value)?Object.fromEntries(Object.keys(value).sort().map(key=>[key,value[key]])):value);
const dense=(o,n)=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();for(let i=0;i<n;i++)own(o,String(i));};
const selected=(holder,targetJson,operationJson)=>{dense(holder,2);const b=own(holder,"0"),state=own(holder,"1"),target=JSON.parse(targetJson),operation=JSON.parse(operationJson);if(own(state,"owner")!==holder||own(state,"identity")!==json({target,operation})||own(state,"failed")!==false||own(state,"modifyAttempted")!==false||own(state,"saveAttempted")!==false)bad();return b;};
const scope=(wrapper,names,finite)=>{if(Reflect.ownKeys(wrapper).length!==2)bad();const description=own(wrapper,"description"),object=own(wrapper,"object");if(typeof description!=="string"||object===null||(typeof object!=="object"&&typeof object!=="function")||!(description==="Block"||description==="Closure"||/^Closure \\([A-Za-z_$][\\w$]*\\)$/.test(description)||finite&&(description==="Script"||description==="Global")))bad();
const values=[];for(const name of names){const descriptor=Object.getOwnPropertyDescriptor(object,name);if(descriptor){if(!Object.hasOwn(descriptor,"value"))bad();values.push(true,descriptor.value);}else values.push(false,undefined);}return values;};
const point=(holder,pointCtor,normal,floats,ints)=>{const b=own(holder,"0");if(own(own(b,"vectorCtor"),"fn")!==pointCtor||own(pointCtor,"prototype")!==own(b,"pointPrototype")||typeof normal!=="function"||Object.getPrototypeOf(floats)!==Float64Array.prototype||Object.getPrototypeOf(ints)!==Int32Array.prototype)bad();
const proto=Object.getPrototypeOf(Float64Array.prototype),view=(value,key)=>{const descriptor=Object.getOwnPropertyDescriptor(proto,key);if(!descriptor||typeof descriptor.get!=="function"||Function.prototype.toString.call(descriptor.get)!=="function get "+key+"() { [native code] }")bad();return Reflect.apply(descriptor.get,value,[]);};
const memory=view(floats,"buffer");if(memory!==view(ints,"buffer")||Object.getPrototypeOf(memory)!==ArrayBuffer.prototype||view(floats,"byteOffset")!==0||view(ints,"byteOffset")!==0||view(floats,"byteLength")!==16||view(ints,"byteLength")!==16||view(floats,"length")!==2||view(ints,"length")!==4)bad();
const bytes=Object.getOwnPropertyDescriptor(ArrayBuffer.prototype,"byteLength");if(!bytes||typeof bytes.get!=="function"||Function.prototype.toString.call(bytes.get)!=="function get byteLength() { [native code] }"||Reflect.apply(bytes.get,memory,[])!==16)bad();
const normalMethod=own(normal,"normal"),finite=own(globalThis,"isFinite");if(typeof normalMethod!=="function"||typeof finite!=="function"||Function.prototype.toString.call(finite)!=="function isFinite() { [native code] }")bad();return[normalMethod,finite];};`;
const scopes = (names: readonly string[], finite: boolean): string => `function(holder,targetJson,operationJson){${guard}selected(holder,targetJson,operationJson);return scope(this,${JSON.stringify(names)},${String(finite)});}`;
export const CURRENT_SCHEMATIC_WIRE_LEXICAL_CALLS = Object.freeze({
  point0: scopes(["Ea", "_he", "ok"], false), point1: scopes(["Ma", "Rce", "Yk"], false), defaults: scopes(["qt", "Cr"], false), finite: scopes(["isFinite"], true),
  point: `function(holder,targetJson,operationJson,pointCtor,normal,floats,ints){${guard}selected(holder,targetJson,operationJson);return point(holder,pointCtor,normal,floats,ints);}`,
  same: `function(holder,targetJson,operationJson,pointCtor,normal,floats,ints,normalMethod,finite){${guard}selected(holder,targetJson,operationJson);const current=point(holder,pointCtor,normal,floats,ints);if(current[0]!==normalMethod||current[1]!==finite)bad();return true;}`,
  defaultJoin: `function(holder,targetJson,operationJson,options,noop){${guard}selected(holder,targetJson,operationJson);if(options===null||typeof options!=="object"||Object.getPrototypeOf(options)!==Object.prototype||!Object.isFrozen(options)||Reflect.ownKeys(options).length!==0||typeof noop!=="function"||Function.prototype.toString.call(noop)!=="function Cr(...i){}")bad();return true;}`,
  finiteJoin: `function(holder,targetJson,operationJson,finite){${guard}selected(holder,targetJson,operationJson);if(finite!==own(globalThis,"isFinite")||typeof finite!=="function"||Function.prototype.toString.call(finite)!=="function isFinite() { [native code] }")bad();return true;}`,
});
const roles = ["point0", "point1", "defaults", "finite", "point", "same", "defaultJoin", "finiteJoin"] as const;
export type CurrentSchematicWireLexicalRole = typeof roles[number];
export const CURRENT_SCHEMATIC_WIRE_LEXICAL_EXTRA_ARGUMENTS = Object.freeze({ point0: 0, point1: 0, defaults: 0, finite: 0, point: 4, same: 6, defaultJoin: 2, finiteJoin: 1 });
export const CURRENT_SCHEMATIC_WIRE_LEXICAL_FLAGS = Object.freeze({ objectGroup: CURRENT_SCHEMATIC_WIRE_LEXICAL_GROUP, silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const text = z.string().min(1).max(16_384).refine(value => value.isWellFormed() && Buffer.byteLength(value) <= 16_384);
const object = z.strictObject({ objectId: handle }); const data = z.strictObject({ value: text });
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_WIRE_LEXICAL_GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const calls = roles.map(role => {
  const args = z.tuple([object, data, data], object).refine(value => value.length === CURRENT_SCHEMATIC_WIRE_LEXICAL_EXTRA_ARGUMENTS[role] + 3);
  const params = z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(CURRENT_SCHEMATIC_WIRE_LEXICAL_CALLS[role]), arguments: args, returnByValue: z.literal(role === "same" || role === "defaultJoin" || role === "finiteJoin") });
  return z.strictObject({ phase: z.literal("wire-lexical-call"), role: z.literal(role), method: z.literal("Runtime.callFunctionOn"), params });
});
const propertyParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const releaseParams = z.strictObject({ objectGroup: z.literal(CURRENT_SCHEMATIC_WIRE_LEXICAL_GROUP) });
const commands = z.union([...calls,
  z.strictObject({ phase: z.literal("wire-lexical-properties"), method: z.literal("Runtime.getProperties"), params: propertyParams }),
  z.strictObject({ phase: z.literal("wire-lexical-release"), method: z.literal("Runtime.releaseObjectGroup"), params: releaseParams }),
]);
export type CurrentSchematicWireLexicalCommand = z.infer<typeof commands>;
export function validateCurrentSchematicWireLexicalCommand(input: unknown): CurrentSchematicWireLexicalCommand { return freezeDeep(commands.parse(captureCurrentPcbStringClockReply(input).value)); }
export function requireCurrentSchematicWireLexicalArguments(command: CurrentSchematicWireLexicalCommand, holder: string, target: string, operation: string, variant: 0 | 1): void {
  if (command.phase === "wire-lexical-call" && (canonicalJson(command.params.arguments.slice(0, 3)) !== canonicalJson([{ objectId: holder }, { value: target }, { value: operation }]) ||
    command.role === "point0" && variant !== 0 || command.role === "point1" && variant !== 1 || !["point0", "point1", "defaults", "finite"].includes(command.role) && command.params.objectId !== holder)) { throw new Error("SCHEMATIC_WIRE_LEXICAL_ORIGINAL_ARGUMENTS"); }
}
export function currentSchematicWireLexicalCases(): readonly CurrentSchematicWireLexicalCommand[] {
  return freezeDeep([
    ...roles.map(role => validateCurrentSchematicWireLexicalCommand({ phase: "wire-lexical-call", role, method: "Runtime.callFunctionOn", params: { ...CURRENT_SCHEMATIC_WIRE_LEXICAL_FLAGS, objectId: "original_holder", functionDeclaration: CURRENT_SCHEMATIC_WIRE_LEXICAL_CALLS[role],
      arguments: [{ objectId: "original_holder" }, { value: "{}" }, { value: "{}" }, ...Array.from({ length: CURRENT_SCHEMATIC_WIRE_LEXICAL_EXTRA_ARGUMENTS[role] }, () => ({ objectId: "original_ref" }))], returnByValue: role === "same" || role === "defaultJoin" || role === "finiteJoin" } })),
    validateCurrentSchematicWireLexicalCommand({ phase: "wire-lexical-properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }),
    validateCurrentSchematicWireLexicalCommand({ phase: "wire-lexical-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: CURRENT_SCHEMATIC_WIRE_LEXICAL_GROUP } }),
  ]);
}
export function currentSchematicWireLexicalTemplate(input: unknown): Readonly<{ phase: string; method: string; fields: Readonly<Record<string, "handle">>; values: Readonly<Record<string, string>>; template: string }> {
  const command = validateCurrentSchematicWireLexicalCommand(input), fields: Record<string, "handle"> = {}, values: Record<string, string> = {};
  const field = (name: string, value: string): string => { fields[name] = "handle"; values[name] = value; return `__schematic_wirelexical_${name}__`; };
  const params: Record<string, unknown> = { ...command.params }; let phase: string = command.phase;
  if (command.phase === "wire-lexical-call") {
    phase += `-${command.role}`; params["objectId"] = ["point0", "point1", "defaults", "finite"].includes(command.role) ? field("objectId", command.params.objectId) : "__schematic_wirelexical_boundHolder__";
    params["arguments"] = [{ objectId: "__schematic_wirelexical_boundHolder__" }, { value: "__schematic_wirelexical_boundTarget__" }, { value: "__schematic_wirelexical_boundOperation__" }, ...command.params.arguments.slice(3).map((argument, index) => {
      if (!("objectId" in argument)) { throw new Error("SCHEMATIC_WIRE_LEXICAL_HANDLE_ARGUMENT"); } return { objectId: field(`arg${String(index)}`, argument.objectId) };
    })];
  } else if (command.phase === "wire-lexical-properties") { params["objectId"] = field("objectId", command.params.objectId); }
  return freezeDeep({ phase, method: command.method, fields, values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentSchematicWireLexicalWire(input: unknown, requestId: number): Readonly<{ command: CurrentSchematicWireLexicalCommand; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(requestId) || requestId < 1 || requestId > 2_147_483_647) { throw new Error("SCHEMATIC_WIRE_LEXICAL_ID"); }
  const command = validateCurrentSchematicWireLexicalCommand(input); const fixed = currentSchematicWireLexicalTemplate(command);
  return freezeDeep({ command, request: { action: "schematic-wire-edit-lexical", requestId, phase: fixed.phase, method: fixed.method, ...fixed.values } });
}
