/** Fixed descriptor route from the original UI bus to an initialized manager
 * project. The native BroadcastChannel name accessor is read under
 * throwOnSideEffect; no vendor callback, getter, initializer or RPC runs. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_SOURCE as SOURCE, assertCurrentFootprintCopyManagerRouteFunction } from "./current-footprint-copy-manager-route-source.ts";
import type { CurrentFootprintCopyManagerRouteFunction as Role } from "./current-footprint-copy-manager-route-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const helpers = String.raw`"use strict";const bad=()=>{throw new Error("FOOTPRINT_COPY_MANAGER_ROUTE_BINDING");},seen=[];
const descriptor=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);seen.push([o,k,d]);return d;};
const own=(o,k)=>{const d=descriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const array=(o,n)=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();for(let i=0;i<n;i++)own(o,String(i));};
const same=(o,a)=>{array(o,a.length);for(let i=0;i<a.length;i++)if(own(o,String(i))!==a[i])bad();};
const method=(o,k,n)=>{for(let i=0;i<n;i++){if(descriptor(o,k)!==undefined)bad();o=Object.getPrototypeOf(o);}const f=own(o,k);if(typeof f!=="function")bad();return f;};
const verify=()=>{for(const[o,k,d]of seen){const v=Object.getOwnPropertyDescriptor(o,k);if(d===undefined?v!==undefined:!v||Reflect.ownKeys(d).length!==Reflect.ownKeys(v).length||Reflect.ownKeys(d).some(k=>!Object.is(d[k],v[k])))bad();}};
const channelName=(bc,expected)=>{const constructor=own(globalThis,"BroadcastChannel"),prototype=own(constructor,"prototype"),entry=descriptor(prototype,"name");if(Object.getPrototypeOf(bc)!==prototype||descriptor(bc,"name")!==undefined||!entry||Object.hasOwn(entry,"value")||typeof entry.get!=="function"||entry.set!==undefined||entry.enumerable!==true||entry.configurable!==true)bad();const getter=entry.get;if(own(getter,"name")!=="get name"||own(getter,"length")!==0||Function.prototype.toString.call(getter)!=="function get name() { [native code] }"||Reflect.apply(getter,bc,[])!==expected)bad();return getter;};
const initial=(route,path,branch,tab)=>{array(route,17);const notification=own(route,"14");array(notification,7);const root=own(notification,"1"),host=own(notification,"2"),project=own(notification,"3"),bus=own(route,"12");
if(own(root,"gVars")!==host||own(host,"currentProject")!==project||own(project,"projectId")!==path||own(project,"branchUuid")!==branch||own(root,"_TAB_ID_")!==tab||own(root,"_MSG_BUS_")!==bus||own(host,"messageBus")!==bus)bad();
const subscribed=own(bus,"subscribed"),queue=own(subscribed,"/PrjDB/footprint/getStr");array(queue,1);const task=own(queue,"0"),wrapper=own(task,"callback");if(own(task,"isRunning")!==true||typeof wrapper!=="function")bad();return[wrapper,bus,queue,task,route];};
const registry=(scope,first,path,branch,tab)=>{array(first,5);same(first,initial(own(first,"4"),path,branch,tab));const bindings=own(scope,"object"),K=own(bindings,"K"),so=own(bindings,"so"),Hn=own(bindings,"Hn"),V0=own(bindings,"V0"),J=own(bindings,"J"),Ee=own(bindings,"Ee");if(typeof K!=="function"||typeof so!=="function"||typeof Hn!=="function"||typeof V0!=="function"||own(Ee,"messageBus")!==own(first,"1"))bad();
const instance=own(so,"tool"),prototype=own(so,"prototype"),map=own(instance,"map");if(Object.getPrototypeOf(instance)!==prototype||own(prototype,"constructor")!==so||Object.getPrototypeOf(map)!==Map.prototype||descriptor(map,"get")!==undefined)bad();const getInstance=own(so,"getInstance"),get=method(instance,"get",2),mapGet=own(Map.prototype,"get");if(typeof getInstance!=="function"||typeof mapGet!=="function")bad();return[K,getInstance,get,Hn,mapGet,so,instance,map,V0,J,Ee,first];};
const project=(scope,original,first,path,branch,tab)=>{const reg=registry(scope,first,path,branch,tab);same(original,reg);const mapGet=reg[4];if(Function.prototype.toString.call(mapGet)!=="function get() { [native code] }")bad();const selected=Reflect.apply(mapGet,reg[7],[path]);
const managerCurrent=own(reg[10],"currentProject");if(own(managerCurrent,"projectId")!==path||own(managerCurrent,"branchUuid")!==branch||own(own(selected,"_projectDetail"),"currentBranch")!==branch)bad();
if(own(selected,"uuid")!==path||own(selected,"isReady")!==true||own(selected,"_isOpening")!==false||own(selected,"_isClosing")!==false||own(selected,"mainBus")!==own(first,"1"))bad();const footprint=own(selected,"footprint"),footprintProto=own(reg[8],"prototype");if(Object.getPrototypeOf(footprint)!==footprintProto||own(footprintProto,"constructor")!==reg[8]||own(footprint,"project")!==selected)bad();
const workerBus=own(selected,"workerBus"),worker=own(selected,"worker"),bc=own(workerBus,"bc"),channel="/"+tab+"/project/"+path,notification=own(own(first,"4"),"14"),root=own(notification,"1");const uuid=own(workerBus,"uuid");if(own(root,channel)!==workerBus||typeof uuid!=="string"||!/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/.test(uuid)||own(own(reg[9],"footprint"),"getStr")!=="/mgr/projectWorker/footprint/getStr")bad();
const getStr=method(footprint,"getStr",1),rpcCall=method(workerBus,"rpcCall",3),nameGetter=channelName(bc,channel);verify();if(Reflect.apply(nameGetter,bc,[])!==channel)bad();return[getStr,rpcCall,selected,footprint,workerBus,worker,bc,original,first,footprintProto,nameGetter];};`;
const recheck = (key: "e" | "t"): string => `function(wrapperScope,serviceScope,first,service,handler,reg,original,path,branch,tab){${helpers}\nif(own(own(wrapperScope,"object"),"${key}")!==service||own(own(serviceScope,"object"),"t")!==handler)bad();same(original,project(this,reg,first,path,branch,tab));verify();return true;}`;
export const CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_CALLS = freezeDeep({
  initial: { program: `function(path,branch,tab){${helpers}\nconst result=initial(this,path,branch,tab);verify();return result;}`, arguments: 3, returnByValue: false },
  serviceUi: { program: `function(){${helpers}\nconst service=own(own(this,"object"),"e");if(typeof service!=="function")bad();verify();return service;}`, arguments: 0, returnByValue: false },
  serviceManager: { program: `function(){${helpers}\nconst service=own(own(this,"object"),"t");if(typeof service!=="function")bad();verify();return service;}`, arguments: 0, returnByValue: false },
  handler: { program: `function(){${helpers}\nconst handler=own(own(this,"object"),"t");if(typeof handler!=="function")bad();verify();return handler;}`, arguments: 0, returnByValue: false },
  registry: { program: `function(first,path,branch,tab){${helpers}\nconst result=registry(this,first,path,branch,tab);verify();return result;}`, arguments: 4, returnByValue: false },
  project: { program: `function(reg,first,path,branch,tab){${helpers}\nconst result=project(this,reg,first,path,branch,tab);verify();return result;}`, arguments: 5, returnByValue: false },
  recheckUi: { program: recheck("e"), arguments: 10, returnByValue: true },
  recheckManager: { program: recheck("t"), arguments: 10, returnByValue: true },
});
const token = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const text = z.string().max(8192).refine(value => value.isWellFormed() && !value.includes("\0"));
const point = z.object({ scriptId: token, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const remote = z.object({ type: z.enum(["object", "function", "string", "number"]), subtype: text.optional(), className: text.optional(),
  description: text.optional(), objectId: token.optional(), value: z.union([z.null(), text, z.number(), point]).optional() }).strict();
const property = z.object({ name: text, value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) }).strict();
const internal = z.object({ name: text, value: remote }).strict();
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_COPY_MANAGER_ROUTE_METADATA"); } }
function data(input: unknown): unknown { return captureCurrentPcbStringClockReply(input).value; }
export function decodeCurrentFootprintCopyManagerRouteFunction(input: unknown, role: Role, expectedScriptId?: string): Readonly<{ scriptId: string; scopesId: string }> {
  const expected = SOURCE.functions[role];
  const count = expected.prototype ? 3 : 2;
  const reply = z.object({ result: z.array(property).length(count), internalProperties: z.array(internal).length(3) }).strict().parse(data(input));
  const fields = new Map(reply.result.map(item => [item.name, item])); need(fields.size === count);
  for (const name of ["name", "length"] as const) {
    const item = fields.get(name); need(item !== undefined && !item.writable && !item.enumerable && item.configurable && item.value.value === (name === "name" ? expected.name : expected.arity) &&
      !Object.is(item.value.value, -0) && item.value.type === (name === "name" ? "string" : "number") && item.value.objectId === undefined);
  }
  if (expected.prototype) { const item = fields.get("prototype"); need(item !== undefined && item.writable && !item.enumerable && !item.configurable && item.value.type === "object" && item.value.objectId !== undefined && item.value.value === undefined); }
  const entries = new Map(reply.internalProperties.map(item => [item.name, item.value])); need(entries.size === 3);
  const location = entries.get("[[FunctionLocation]]"), position = point.parse(location?.value);
  const parent = entries.get("[[Prototype]]"), scopes = entries.get("[[Scopes]]");
  need(location?.type === "object" && location.subtype === "internal#location" && location.objectId === undefined &&
    (expectedScriptId === undefined || position.scriptId === expectedScriptId) && position.lineNumber === expected.lineNumber && position.columnNumber === expected.columnNumber &&
    parent?.type === (expected.async ? "object" : "function") && parent.className === (expected.async ? "AsyncFunction" : "Function") && parent.objectId !== undefined && parent.value === undefined &&
    scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.objectId !== undefined && scopes.value === undefined && /^Scopes\[[1-8]\]$/u.test(scopes.description ?? ""));
  return Object.freeze({ scriptId: position.scriptId, scopesId: scopes.objectId });
}
export function decodeCurrentFootprintCopyManagerRouteScope(input: unknown, kind: "rpc" | "service" | "handler"): string {
  const reply = z.object({ result: z.array(property).min(2).max(8) }).strict().parse(data(input));
  const ids = new Set<string>();
  for (const [index, item] of reply.result.entries()) {
    need(item.name === String(index) && item.writable && item.enumerable && item.configurable && item.value.type === "object" &&
      item.value.subtype === "internal#scope" && item.value.className === "Object" && item.value.objectId !== undefined && item.value.value === undefined && !ids.has(item.value.objectId)); ids.add(item.value.objectId);
  }
  const first = reply.result[0]; need(first?.value.description === ({ rpc: "Closure (rpcService)", service: "Closure (V)", handler: "Closure" }[kind]) && reply.result.at(-1)?.value.description === "Global" && first.value.objectId !== undefined);
  return first.value.objectId;
}
export function decodeCurrentFootprintCopyManagerRouteCallable(input: unknown, role: Role): string {
  const profile = SOURCE.functions[role];
  const reply = z.object({ result: z.object({ type: z.literal("function"), className: z.literal(profile.async ? "AsyncFunction" : "Function"), description: text, objectId: token }).strict() }).strict().parse(data(input));
  assertCurrentFootprintCopyManagerRouteFunction(role, reply.result.description); return reply.result.objectId;
}
export function decodeCurrentFootprintCopyManagerRouteArray(input: unknown, kind: "initial" | "registry" | "project"): Readonly<{ ids: readonly string[]; wrapperRole: "rpcUi" | "rpcManager" | null }> {
  const count = { initial: 5, registry: 12, project: 11 }[kind];
  const reply = z.object({ result: z.array(property).length(count + 1), internalProperties: z.array(internal).length(1) }).strict().parse(data(input));
  const fields = new Map(reply.result.map(item => [item.name, item])); need(fields.size === count + 1);
  const length = fields.get("length"), parent = reply.internalProperties[0];
  need(length?.value.type === "number" && length.value.value === count && length.value.objectId === undefined && length.writable && !length.enumerable && !length.configurable &&
    parent?.name === "[[Prototype]]" && parent.value.type === "object" && parent.value.subtype === "array" && parent.value.className === "Array" && parent.value.description === "Array(0)" && parent.value.objectId !== undefined && parent.value.value === undefined);
  const roleGroups: Record<typeof kind, readonly Role[]> = { initial: [], registry: ["registryLookup", "registryInstance", "registryGet", "channelProducer"], project: ["footprintGetStr", "workerRpcCall"] };
  const roles = roleGroups[kind];
  let wrapperRole: "rpcUi" | "rpcManager" | null = null; const ids: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const item = fields.get(String(i)); need(item !== undefined && item.writable && item.enumerable && item.configurable && item.value.objectId !== undefined && item.value.value === undefined && item.value.subtype !== "proxy");
    const value = item.value; let role = roles[i];
    if (kind === "initial" && i === 0) {
      try { assertCurrentFootprintCopyManagerRouteFunction("rpcUi", value.description); wrapperRole = "rpcUi"; }
      catch { assertCurrentFootprintCopyManagerRouteFunction("rpcManager", value.description); wrapperRole = "rpcManager"; }
      role = wrapperRole;
    }
    if (role !== undefined) { const profile = SOURCE.functions[role]; need(value.type === "function" && value.className === (profile.async ? "AsyncFunction" : "Function") && value.subtype === undefined); assertCurrentFootprintCopyManagerRouteFunction(role, value.description); }
    else if (kind === "registry" && i === 4) { need(value.type === "function" && value.className === "Function" && value.description === "function get() { [native code] }" && value.subtype === undefined); }
    else if (kind === "project" && i === 10) { need(value.type === "function" && value.className === "Function" && value.description === "function get name() { [native code] }" && value.subtype === undefined); }
    else { need(value.type === (kind === "registry" && (i === 5 || i === 8) ? "function" : "object")); }
    if (kind === "project" && (i === 5 || i === 6)) { need(value.className === (i === 5 ? "Worker" : "BroadcastChannel") && value.subtype === undefined); }
    ids.push(item.value.objectId);
  }
  return Object.freeze({ ids: Object.freeze(ids), wrapperRole });
}
function decodeNative(input: unknown, name: "get" | "get name", arity: 0 | 1): void {
  const reply = z.object({ result: z.array(property).length(2), internalProperties: z.array(internal).length(2) }).strict().parse(data(input));
  const fields = new Map(reply.result.map(item => [item.name, item])); need(fields.size === 2);
  for (const field of ["name", "length"] as const) { const item = fields.get(field); need(item !== undefined && !item.writable && !item.enumerable && item.configurable && item.value.type === (field === "name" ? "string" : "number") && item.value.value === (field === "name" ? name : arity) && !Object.is(item.value.value, -0) && item.value.objectId === undefined && item.value.subtype === undefined && item.value.className === undefined); }
  const entries = new Map(reply.internalProperties.map(item => [item.name, item.value])), parent = entries.get("[[Prototype]]"), scopes = entries.get("[[Scopes]]");
  need(entries.size === 2 && parent?.type === "function" && parent.className === "Function" && parent.objectId !== undefined && parent.value === undefined && scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.description === "Scopes[0]" && scopes.objectId !== undefined && scopes.value === undefined);
}
export function decodeCurrentFootprintCopyManagerRouteNativeGet(input: unknown): void { decodeNative(input, "get", 1); }
/** Browser-native getters have no script location or lexical environment. The
 * fixed selector retains the same getter, receiver and prototype separately. */
export function decodeCurrentFootprintCopyManagerRouteNativeName(input: unknown): void { decodeNative(input, "get name", 0); }
