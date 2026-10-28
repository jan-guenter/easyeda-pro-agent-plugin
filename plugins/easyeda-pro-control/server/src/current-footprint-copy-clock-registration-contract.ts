/** Fixed descriptor-only selectors for the initialized original ws-service
 * registration. No RPC, callback, Date.now, initializer or cache method runs. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_SOURCE as SOURCE, assertCurrentFootprintCopyClockRegistrationFunction } from "./current-footprint-copy-clock-registration-source.ts";
import type { CurrentFootprintCopyClockRegistrationFunction as Role } from "./current-footprint-copy-clock-registration-source.ts";

const helpers = String.raw`"use strict";const bad=()=>{throw new Error("FOOTPRINT_COPY_CLOCK_REGISTRATION_BINDING");},seen=[];
const descriptor=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);seen.push([o,k,d]);return d;};
const own=(o,k)=>{const d=descriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const absent=(o,k)=>{if(descriptor(o,k)!==undefined||k in o)bad();};
const array=(o,n)=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();for(let i=0;i<n;i++)own(o,String(i));};
const verify=()=>{for(const[o,k,d]of seen){const v=Object.getOwnPropertyDescriptor(o,k);if(d===undefined?v!==undefined:!v||Reflect.ownKeys(d).length!==Reflect.ownKeys(v).length||Reflect.ownKeys(d).some(k=>!Object.is(d[k],v[k])))bad();}};
const native=(f,name,arity,text)=>{if(typeof f!=="function"||own(f,"name")!==name||own(f,"length")!==arity||Function.prototype.toString.call(f)!==text)bad();};
const nameGetter=(root,bc,tab)=>{const constructor=own(root,"BroadcastChannel"),prototype=own(constructor,"prototype"),entry=descriptor(prototype,"name");if(Object.getPrototypeOf(bc)!==prototype||descriptor(bc,"name")!==undefined||!entry||Object.hasOwn(entry,"value")||typeof entry.get!=="function"||entry.set!==undefined||entry.enumerable!==true||entry.configurable!==true)bad();const getter=entry.get;native(getter,"get name",0,"function get name() { [native code] }");if(Reflect.apply(getter,bc,[])!=="/"+tab+"/notify")bad();return getter;};
const initial=(route,path,branch,tab)=>{array(route,17);const notification=own(route,"14");array(notification,7);const root=own(notification,"1"),host=own(notification,"2"),project=own(notification,"3"),bus=own(notification,"4");
if(own(root,"gVars")!==host||own(host,"currentProject")!==project||own(project,"projectId")!==path||own(project,"branchUuid")!==branch||own(root,"_TAB_ID_")!==tab||own(host,"concurrentBus")!==bus||own(root,"/"+tab+"/notify")!==bus)bad();
const topic="/pro-mgr/serverTime/now",pulled=own(bus,"pulled"),pushed=own(bus,"pushed"),subscribed=own(bus,"subscribed"),queue=own(pulled,topic);array(queue,1);absent(pushed,topic);absent(subscribed,topic);
const task=own(queue,"0"),wrapper=own(task,"callback"),bc=own(bus,"bc"),getter=nameGetter(root,bc,tab);if(own(task,"isRunning")!==true||own(task,"unsafe")!==true||typeof wrapper!=="function")bad();return[root,host,project,bus,wrapper,queue,task,bc,getter,route];};
const registration=(original,path,branch,tab)=>{array(original,10);const fresh=initial(own(original,"9"),path,branch,tab);for(const i of[0,1,2,3,4,7,8,9])if(own(original,String(i))!==fresh[i])bad();return fresh;};
const bindings=(scope,wrapperScope,first,callback,path,branch,tab)=>{const current=registration(first,path,branch,tab),lexical=own(scope,"object"),rpc=own(wrapperScope,"object");if(own(rpc,"t")!==callback||own(rpc,"e")!=="/pro-mgr/serverTime/now"||own(rpc,"i")!==current[4]||own(lexical,"Ji")!==current[3])bad();
const offset=own(lexical,"Jd");if(typeof offset!=="number"||!Number.isSafeInteger(offset)||Object.is(offset,-0))bad();const date=own(current[0],"Date"),now=own(date,"now");native(date,"Date",7,"function Date() { [native code] }");native(now,"now",0,"function now() { [native code] }");return{values:[callback,current[3],date,now],offset};};`;
export const CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_CALLS = freezeDeep({
  initial: { program: `function(path,branch,tab){${helpers}\nconst result=initial(this,path,branch,tab);verify();return result;}`, arguments: 3, returnByValue: false },
  callback: { program: `function(){${helpers}\nconst callback=own(own(this,"object"),"t");if(typeof callback!=="function")bad();verify();return callback;}`, arguments: 0, returnByValue: false },
  bindings: { program: `function(wrapperScope,first,callback,path,branch,tab){${helpers}\nconst result=bindings(this,wrapperScope,first,callback,path,branch,tab);verify();return result.values;}`, arguments: 6, returnByValue: false },
  sample: { program: `function(wrapperScope,first,callback,original,path,branch,tab){${helpers}\narray(original,4);const result=bindings(this,wrapperScope,first,callback,path,branch,tab);for(let i=0;i<4;i++)if(own(original,String(i))!==result.values[i])bad();verify();return result.offset;}`, arguments: 7, returnByValue: true },
});
export const CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_GROUP = "easyeda-pro-control-footprint-copy-clock-registration-v1";
export const CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_FLAGS = Object.freeze({ objectGroup: CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_GROUP,
  silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u), object = z.object({ objectId: handle }).strict();
const branch = z.object({ value: z.string().regex(/^[a-f\d]{32}$/u) }).strict(), path = z.object({ value: z.string().regex(/^[a-f\d]{64}$/u) }).strict(), tab = z.object({ value: z.string().regex(/^[A-Za-z\d_-]{1,128}$/u) }).strict();
const flags = { objectGroup: z.literal(CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const call = (phase: keyof typeof CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_CALLS, args: z.ZodType): z.ZodType => z.object({ phase: z.literal(phase), method: z.literal("Runtime.callFunctionOn"), sessionId: handle.max(128),
  params: z.object({ ...flags, objectId: handle, functionDeclaration: z.literal(CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_CALLS[phase].program), arguments: args, returnByValue: z.literal(CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_CALLS[phase].returnByValue) }).strict() }).strict();
/* oxlint-disable unicorn/max-nested-calls -- Fixed programs and exact positional argument rosters stay visible together. */
const commandSchema = z.union([
  call("initial", z.tuple([path, branch, tab])), call("callback", z.tuple([])),
  call("bindings", z.tuple([object, object, object, path, branch, tab])), call("sample", z.tuple([object, object, object, object, path, branch, tab])),
  z.object({ phase: z.literal("properties"), method: z.literal("Runtime.getProperties"), sessionId: handle.max(128), params: z.object({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }).strict() }).strict(),
  z.object({ phase: z.literal("source"), method: z.literal("Debugger.getScriptSource"), sessionId: handle.max(128), params: z.object({ scriptId: handle }).strict() }).strict(),
  z.object({ phase: z.literal("release"), method: z.literal("Runtime.releaseObjectGroup"), sessionId: handle.max(128), params: z.object({ objectGroup: z.literal(CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_GROUP) }).strict() }).strict(),
]);
/* oxlint-enable unicorn/max-nested-calls */
type Flags = typeof CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_FLAGS;
export type CurrentFootprintCopyClockRegistrationCommand = Readonly<{ sessionId: string }> & (
  | Readonly<{ phase: keyof typeof CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_CALLS; method: "Runtime.callFunctionOn"; params: Flags & Readonly<{ objectId: string; functionDeclaration: string; arguments: readonly Readonly<{ value: string } | { objectId: string }>[]; returnByValue: boolean }> }>
  | Readonly<{ phase: "properties"; method: "Runtime.getProperties"; params: Readonly<{ objectId: string; ownProperties: true; accessorPropertiesOnly: false; generatePreview: false }> }>
  | Readonly<{ phase: "source"; method: "Debugger.getScriptSource"; params: Readonly<{ scriptId: string }> }>
  | Readonly<{ phase: "release"; method: "Runtime.releaseObjectGroup"; params: Readonly<{ objectGroup: typeof CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_GROUP }> }>
);
export function validateCurrentFootprintCopyClockRegistrationCommand(input: unknown): CurrentFootprintCopyClockRegistrationCommand {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The strict union checks every program, positional argument, method and bound field before freezing.
  return freezeDeep(commandSchema.parse(captureCurrentPcbStringClockReply(input).value)) as CurrentFootprintCopyClockRegistrationCommand;
}
const point = z.object({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict(), text = z.string().max(8192);
const remote = z.object({ type: z.enum(["object", "function", "string", "number"]), subtype: text.optional(), className: text.optional(), description: text.optional(), objectId: handle.optional(), value: z.union([z.null(), text, z.number(), point]).optional() }).strict();
const internal = z.object({ name: text, value: remote }).strict(), property = z.object({ name: text, value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) }).strict();
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_COPY_CLOCK_REGISTRATION_METADATA"); } }
function data(input: unknown): unknown { return captureCurrentPcbStringClockReply(input).value; }
export function decodeCurrentFootprintCopyClockRegistrationFunction(input: unknown, role: Role, expectedScriptId?: string): Readonly<{ scriptId: string; scopesId: string }> {
  const expected = SOURCE.functions[role], reply = z.object({ result: z.array(property).length(2), internalProperties: z.array(internal).length(3) }).strict().parse(data(input));
  const fields = new Map(reply.result.map(item => [item.name, item])); need(fields.size === 2);
  for (const key of ["name", "length"] as const) { const field = fields.get(key); need(field !== undefined && !field.writable && !field.enumerable && field.configurable && field.value.type === (key === "name" ? "string" : "number") && field.value.value === (key === "name" ? expected.name : expected.arity) && field.value.objectId === undefined && !Object.is(field.value.value, -0)); }
  const entries = new Map(reply.internalProperties.map(item => [item.name, item.value])), location = entries.get("[[FunctionLocation]]"), parent = entries.get("[[Prototype]]"), position = point.parse(location?.value), scopes = entries.get("[[Scopes]]");
  need(entries.size === 3 && location?.type === "object" && location.subtype === "internal#location" && location.objectId === undefined && (expectedScriptId === undefined || position.scriptId === expectedScriptId) && position.lineNumber === expected.lineNumber && position.columnNumber === expected.columnNumber && parent?.type === "function" && parent.className === "Function" && parent.objectId !== undefined && parent.value === undefined && scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.objectId !== undefined && scopes.value === undefined && /^Scopes\[[1-8]\]$/u.test(scopes.description ?? ""));
  return Object.freeze({ scriptId: position.scriptId, scopesId: scopes.objectId });
}
export function decodeCurrentFootprintCopyClockRegistrationScope(input: unknown, role: Role): string {
  const ids = new Set<string>(), reply = z.object({ result: z.array(property).min(2).max(8) }).strict().parse(data(input));
  for (const [index, item] of reply.result.entries()) { need(item.name === String(index) && item.writable && item.enumerable && item.configurable && item.value.type === "object" && item.value.subtype === "internal#scope" && item.value.className === "Object" && item.value.objectId !== undefined && item.value.value === undefined && !ids.has(item.value.objectId)); ids.add(item.value.objectId); }
  const first = reply.result[0]; need(first?.value.description === (role === "wrapper" ? "Closure (rpcService)" : "Closure") && reply.result.at(-1)?.value.description === "Global" && first.value.objectId !== undefined); return first.value.objectId;
}
export function decodeCurrentFootprintCopyClockRegistrationArray(input: unknown, phase: "initial" | "bindings"): readonly string[] {
  const count = phase === "initial" ? 10 : 4, reply = z.object({ result: z.array(property).length(count + 1), internalProperties: z.array(internal).length(1) }).strict().parse(data(input));
  const fields = new Map(reply.result.map(item => [item.name, item])); need(fields.size === count + 1); const length = fields.get("length"), parent = reply.internalProperties[0];
  need(length?.value.type === "number" && length.value.value === count && length.value.objectId === undefined && length.writable && !length.enumerable && !length.configurable && parent?.name === "[[Prototype]]" && parent.value.type === "object" && parent.value.subtype === "array" && parent.value.className === "Array" && parent.value.objectId !== undefined && parent.value.value === undefined);
  return Object.freeze(Array.from({ length: count }, (_, index) => {
    const field = fields.get(String(index)); need(field !== undefined && field.writable && field.enumerable && field.configurable && field.value.objectId !== undefined && field.value.value === undefined && field.value.subtype !== "proxy");
    let role: Role | null = null;
    if (phase === "initial" && index === 4) { role = "wrapper"; }
    else if (phase === "bindings" && index === 0) { role = "callback"; }
    if (role !== null) { need(field.value.type === "function" && field.value.className === "Function" && field.value.subtype === undefined); assertCurrentFootprintCopyClockRegistrationFunction(role, field.value.description); }
    else if (phase === "initial" && index === 8 || phase === "bindings" && (index === 2 || index === 3)) { need(field.value.type === "function" && field.value.className === "Function" && field.value.subtype === undefined); }
    else { need(field.value.type === "object"); }
    if (phase === "initial" && index === 7) { need(field.value.className === "BroadcastChannel" && field.value.subtype === undefined); }
    return field.value.objectId;
  }));
}
export function decodeCurrentFootprintCopyClockRegistrationNative(input: unknown, role: "now" | "name"): void {
  const reply = z.object({ result: z.array(property).length(2), internalProperties: z.array(internal).length(2) }).strict().parse(data(input));
  const fields = new Map(reply.result.map(item => [item.name, item])); need(fields.size === 2); const name = role === "now" ? "now" : "get name";
  for (const key of ["name", "length"] as const) { const field = fields.get(key); need(field !== undefined && !field.writable && !field.enumerable && field.configurable && field.value.type === (key === "name" ? "string" : "number") && field.value.value === (key === "name" ? name : 0) && field.value.objectId === undefined && !Object.is(field.value.value, -0)); }
  const entries = new Map(reply.internalProperties.map(item => [item.name, item.value])), parent = entries.get("[[Prototype]]"), scopes = entries.get("[[Scopes]]");
  need(entries.size === 2 && parent?.type === "function" && parent.className === "Function" && parent.objectId !== undefined && parent.value === undefined && scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.description === "Scopes[0]" && scopes.objectId !== undefined && scopes.value === undefined);
}
