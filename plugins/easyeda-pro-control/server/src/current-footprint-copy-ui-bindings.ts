/** Fixed native selectors. The construction owner supplies original UI
 * handles and must qualify every returned function before following its scope.
 * Nothing calls rpcService, a responder, a vendor getter or an initializer. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_FOOTPRINT_COPY_UI_SOURCE, assertCurrentFootprintCopyUiFunction } from "./current-footprint-copy-ui-source.ts";
import type { CurrentFootprintCopyUiFunction } from "./current-footprint-copy-ui-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const helpers = String.raw`"use strict";
const bad=(guard="SHAPE")=>{throw new Error("FOOTPRINT_COPY_UI_BINDING:"+guard);},seen=[];
const descriptor=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);seen.push([o,k,d]);return d;};
const own=(o,k)=>{const d=descriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const absent=(o,k)=>{if(descriptor(o,k)!==undefined||k in o)bad();};
const getter=(o,k)=>{const d=descriptor(o,k);if(!d||Object.hasOwn(d,"value")||typeof d.get!=="function"||d.set!==undefined)bad();return d.get;};
const array=(o,n)=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();for(let i=0;i<n;i++)own(o,String(i));};
const verify=()=>{for(const [o,k,d]of seen){const n=Object.getOwnPropertyDescriptor(o,k);if(d===undefined?n!==undefined:!n||Reflect.ownKeys(n).length!==Reflect.ownKeys(d).length||Reflect.ownKeys(d).some(k=>!Object.is(n[k],d[k])))bad();}};
const context=(root,host,project,path,branch,tab)=>{if(typeof path!=="string"||!/^[a-f0-9]{64}$/.test(path)||typeof branch!=="string"||!/^[a-f0-9]{32}$/.test(branch)||typeof tab!=="string"||tab.length<1||tab.length>128||!/^[A-Za-z0-9_-]+$/.test(tab))bad();if(own(root,"gVars")!==host||own(host,"currentProject")!==project||own(project,"projectId")!==path||own(project,"branchUuid")!==branch||own(root,"_TAB_ID_")!==tab)bad();const top=descriptor(root,"EDITOR_TOP");if(top===undefined){if("EDITOR_TOP" in root)bad();}else if(!Object.hasOwn(top,"value")||(top.value!==undefined&&top.value!==null&&top.value!==root))bad();};
const notification=(root,host,project,path,branch,tab)=>{context(root,host,project,path,branch,tab);const bus=own(host,"concurrentBus");if(own(root,"/"+tab+"/notify")!==bus)bad();const pulled=own(bus,"pulled"),pushed=own(bus,"pushed"),queue=own(pulled,"/pro-ui/libSource/getProLibSource");array(queue,1);absent(pushed,"/pro-ui/libSource/getProLibSource");const task=own(queue,"0"),wrapper=own(task,"callback");if(own(task,"isRunning")!==true||own(task,"unsafe")!==true||typeof wrapper!=="function")bad();return[wrapper,root,host,project,bus,queue,task];};
const scopeObject=(o,name)=>{if(Object.getPrototypeOf(o)!==Object.prototype||Reflect.ownKeys(o).length!==2||own(o,"description")!==name)bad();const value=own(o,"object");if(value===null||typeof value!=="object")bad();return value;};
const retainedNotification=(original,path,branch,tab)=>{array(original,7);const fresh=notification(own(original,"1"),own(original,"2"),own(original,"3"),path,branch,tab);for(let i=0;i<7;i++)if(own(original,String(i))!==fresh[i])bad();return fresh;};
const same=(original,fresh)=>{array(original,fresh.length);for(let i=0;i<fresh.length;i++)if(own(original,String(i))!==fresh[i])bad("RETAINED_RELATION");};
const registryCapture=(notificationBundle,path,branch,tab)=>{const n=retainedNotification(notificationBundle,path,branch,tab),registry=own(n[1],"extendLibManager"),prototype=Object.getPrototypeOf(registry),constructor=own(prototype,"constructor"),map=own(registry,"_map");
if(typeof constructor!=="function"||own(constructor,"prototype")!==prototype)bad("PRELOAD_REGISTRY_PROTOTYPE");
if(Object.getPrototypeOf(map)!==Map.prototype)bad("MAP_PROTOTYPE");if(descriptor(registry,"hasLib")!==undefined||descriptor(map,"has")!==undefined)bad("REGISTRY_SHADOW");
const has=own(prototype,"hasLib"),instance=own(constructor,"getInstance"),context=getter(constructor,"context");if(typeof has!=="function"||typeof instance!=="function")bad("PRELOAD_REGISTRY_FUNCTION");return[constructor,has,instance,context,prototype,registry,map,notificationBundle];};`;
const route = String.raw`
const n=retainedNotification(notificationBundle,path,branch,tab),root=n[1],host=n[2];
const scope=scopeObject(this,"Closure"),router=own(scope,"ZI"),holder=own(scope,"Lo"),registryClass=own(scope,"h4"),contextProducer=own(scope,"Po"),enums=own(scope,"$e"),footprint=own(enums,"FOOTPRINT");
if(typeof router!=="function"||typeof registryClass!=="function"||typeof contextProducer!=="function"||own(footprint,"GET_STR")!=="/PrjDB/footprint/getStr")bad();
const registry=own(root,"extendLibManager"),prototype=own(registryClass,"prototype"),map=own(registry,"_map"),bus=own(holder,"bus");
if(Object.getPrototypeOf(registry)===prototype)bad("PRELOAD_REGISTRY_REQUIRED");
registryCapture(notificationBundle,path,branch,tab);
if(own(prototype,"constructor")!==registryClass)bad("REGISTRY_CONSTRUCTOR");
if(Object.getPrototypeOf(map)!==Map.prototype)bad("MAP_PROTOTYPE");
if(descriptor(registry,"hasLib")!==undefined||descriptor(map,"has")!==undefined)bad();if(bus===undefined||bus===null||own(root,"_MSG_BUS_")!==bus||own(host,"messageBus")!==bus)bad();
const functions=[own(router,"getProLibSource"),own(router,"getProjectLibByWorker"),own(registryClass,"getInstance"),own(prototype,"hasLib"),getter(registryClass,"context"),getter(holder,"messageBus"),contextProducer];
if(functions.some(value=>typeof value!=="function"))bad();
const mapHas=own(Map.prototype,"has");if(typeof mapHas!=="function")bad();
const selected=[...functions,router,registryClass,registry,map,holder,bus,footprint,notificationBundle,prototype,mapHas];`;

const membership = String.raw`
array(original,17);for(let i=0;i<17;i++)if(own(original,String(i))!==selected[i])bad();
same(registryOriginal,registryCapture(notificationBundle,path,branch,tab));
if(Function.prototype.toString.call(mapHas)!=="function has() { [native code] }")bad("MAP_HAS_NATIVE");
verify();if(Reflect.apply(mapHas,map,[path])!==false)bad("EXTENSION_ENTRY_PRESENT");verify();return true;`;

export const CURRENT_FOOTPRINT_COPY_UI_FUNCTION_ORDER = Object.freeze([
  "sourceRouter", "projectSource", "registryInstance", "registryHas", "registryContext", "messageBus", "contextProducer",
] as const);

/** Each entry is exactly one synchronous callFunctionOn request. Native arrays
 * remain with their original owner; JSON decoders cannot recreate them. The
 * fixed leaf has no mounted request budget and grants no extra owner capacity. */
export const CURRENT_FOOTPRINT_COPY_UI_CALLS = freezeDeep({
  /** Bootstrap in the already owned parent context. Root/host/project handles
   * are selected here, never reconstructed from a caller-supplied object ID. */
  initial: { program: `function(path,branch,tab){${helpers}\nconst host=own(this,"gVars"),project=own(host,"currentProject"),selected=notification(this,host,project,path,branch,tab);verify();return selected;}`, arguments: 3, returnByValue: false },
  notification: { program: `function(host,project,path,branch,tab){${helpers}\nconst selected=notification(this,host,project,path,branch,tab);verify();return selected;}`, arguments: 5, returnByValue: false },
  notificationRecheck: { program: `function(original,path,branch,tab){${helpers}\nretainedNotification(original,path,branch,tab);verify();return true;}`, arguments: 4, returnByValue: true },
  responder: { program: `function(wrapper){${helpers}\nconst scope=scopeObject(this,"Closure (rpcService)");if(own(scope,"i")!==wrapper||own(scope,"t")!=="/pro-ui/libSource/getProLibSource")bad();const responder=own(scope,"e");if(typeof responder!=="function")bad();verify();return responder;}`, arguments: 1, returnByValue: false },
  responderRecheck: { program: `function(wrapper,responder){${helpers}\nconst scope=scopeObject(this,"Closure (rpcService)");if(own(scope,"i")!==wrapper||own(scope,"t")!=="/pro-ui/libSource/getProLibSource"||own(scope,"e")!==responder)bad();verify();return true;}`, arguments: 2, returnByValue: true },
  registry: { program: `function(notificationBundle,path,branch,tab){${helpers}\nconst selected=registryCapture(notificationBundle,path,branch,tab);verify();return selected;}`, arguments: 4, returnByValue: false },
  registryContextProducer: { program: `function(notificationBundle,registryOriginal,blockScope,path,branch,tab){${helpers}\nconst fresh=registryCapture(notificationBundle,path,branch,tab);same(registryOriginal,fresh);const block=scopeObject(blockScope,"Block");if(Reflect.ownKeys(block).length!==1||own(block,"sl")!==fresh[0])bad("PRELOAD_CLASS_SCOPE");const ws=own(scopeObject(this,"Closure"),"ws");if(typeof ws!=="function")bad("PRELOAD_CONTEXT_PRODUCER");verify();return ws;}`, arguments: 6, returnByValue: false },
  registryRecheck: { program: `function(notificationBundle,registryOriginal,contextProducer,blockScope,path,branch,tab){${helpers}\nconst fresh=registryCapture(notificationBundle,path,branch,tab);same(registryOriginal,fresh);const block=scopeObject(blockScope,"Block");if(Reflect.ownKeys(block).length!==1||own(block,"sl")!==fresh[0])bad("PRELOAD_CLASS_SCOPE");if(own(scopeObject(this,"Closure"),"ws")!==contextProducer)bad("PRELOAD_CONTEXT_PRODUCER");verify();return true;}`, arguments: 7, returnByValue: true },
  route: { program: `function(notificationBundle,path,branch,tab){${helpers}${route}\nverify();return selected;}`, arguments: 4, returnByValue: false },
  /** After complete native has metadata qualification only. Repeating this
   * fixed read at the final recheck proves current absence, not historical absence. */
  membership: { program: `function(notificationBundle,path,branch,tab,original,registryOriginal){${helpers}${route}${membership}}`, arguments: 6, returnByValue: true },
  routeRecheck: { program: `function(notificationBundle,path,branch,tab,original,registryOriginal){${helpers}${route}${membership}}`, arguments: 6, returnByValue: true },
});

const token = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const text = z.string().max(4096).refine(value => value.isWellFormed() && !value.includes("\0"));
const point = z.object({ scriptId: token, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const remote = z.object({ type: z.enum(["object", "function", "string", "number"]), subtype: text.optional(), className: text.optional(),
  description: text.optional(), objectId: token.optional(), value: z.union([z.null(), text, z.number(), point]).optional() }).strict();
const property = z.object({ name: text, value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) }).strict();
const internal = z.object({ name: text, value: remote }).strict();
function fail(): never { throw new Error("FOOTPRINT_COPY_UI_METADATA"); }
function data(input: unknown): unknown { return captureCurrentPcbStringClockReply(input).value; }

/** Report a retained CDP exception before a success-shape decoder obscures it.
 * Malformed exception evidence still refuses. Only a fixed guard name and
 * numeric source position enter the message; vendor text stays in raw replies. */
export function rejectCurrentFootprintCopyUiException(input: unknown, phase: string): void {
  const reply = data(input);
  if (reply === null || typeof reply !== "object" || !Object.hasOwn(reply, "exceptionDetails")) { return; }
  const details: unknown = Reflect.get(reply, "exceptionDetails");
  let guard = "UNCLASSIFIED", position = "";
  if (details !== null && typeof details === "object") {
    const column: unknown = Reflect.get(details, "columnNumber"), line: unknown = Reflect.get(details, "lineNumber");
    if (typeof line === "number" && Number.isSafeInteger(line) && line >= 0 &&
        typeof column === "number" && Number.isSafeInteger(column) && column >= 0) { position = `:${String(line)}:${String(column)}`; }
    const exception: unknown = Reflect.get(details, "exception");
    if (exception !== null && typeof exception === "object") {
      const description: unknown = Reflect.get(exception, "description");
      if (typeof description === "string") { guard = /FOOTPRINT_COPY_UI_BINDING:([A-Z_]{1,64})\b/u.exec(description)?.[1] ?? guard; }
    }
  }
  throw new Error(`FOOTPRINT_COPY_UI_CDP_EXCEPTION:${phase}:${guard}${position}`);
}

export function decodeCurrentFootprintCopyUiResponder(input: unknown): string {
  try {
    const reply = z.object({ result: z.object({ type: z.literal("function"), className: z.literal("AsyncFunction"),
      description: text, objectId: token }).strict() }).strict().parse(data(input));
    assertCurrentFootprintCopyUiFunction("responder", reply.result.description); return reply.result.objectId;
  } catch { return fail(); }
}

/** Complete GetProperties of one native array. Only function handles escape
 * this decoder. The caller retains the original native array for rechecks. */
export function decodeCurrentFootprintCopyUiArray(input: unknown, kind: "notification" | "route"): readonly string[] {
  try {
    if (kind !== "notification" && kind !== "route") { return fail(); }
    const count = kind === "notification" ? 7 : 17;
    const reply = z.object({ result: z.array(property).length(count + 1), internalProperties: z.array(internal).length(1) }).strict().parse(data(input));
    const fields = new Map(reply.result.map(item => [item.name, item]));
    if (fields.size !== count + 1) { return fail(); }
    const length = fields.get("length"), parent = reply.internalProperties[0];
    if (length?.value.type !== "number" || length.value.value !== count || length.value.objectId !== undefined ||
        !length.writable || length.enumerable || length.configurable || parent?.name !== "[[Prototype]]" ||
        parent.value.type !== "object" || parent.value.subtype !== "array" || parent.value.className !== "Array" ||
        parent.value.description !== "Array(0)" || parent.value.objectId === undefined || parent.value.value !== undefined) { return fail(); }
    const roles: readonly CurrentFootprintCopyUiFunction[] = kind === "notification" ? ["wrapper"] : CURRENT_FOOTPRINT_COPY_UI_FUNCTION_ORDER;
    const ids: string[] = [];
    for (let index = 0; index < count; index += 1) {
      const item = fields.get(String(index)), role = roles[index], value = item?.value;
      if (item === undefined || !item.writable || !item.enumerable || !item.configurable || value?.objectId === undefined || value.value !== undefined) { return fail(); }
      if (role === undefined) {
        if (value.type !== (kind === "route" && (index === 7 || index === 8 || index === 16) ? "function" : "object")) { return fail(); }
        if (kind === "route" && index === 16 && (value.className !== "Function" || value.subtype !== undefined ||
            value.description !== "function has() { [native code] }")) { return fail(); }
        if (kind === "route" && index === 16) { ids.push(value.objectId); }
      } else {
        const profile = CURRENT_FOOTPRINT_COPY_UI_SOURCE.functions[role];
        if (value.type !== "function" || value.className !== (profile.async ? "AsyncFunction" : "Function") || value.subtype !== undefined) { return fail(); }
        assertCurrentFootprintCopyUiFunction(role, value.description); ids.push(value.objectId);
      }
    }
    if (new Set(ids).size !== roles.length + (kind === "route" ? 1 : 0)) { return fail(); } return Object.freeze(ids);
  } catch { return fail(); }
}

/** Complete native Map.has metadata must precede the first membership call.
 * User functions, bound functions and proxies expose different descriptions
 * or internal properties. The native function has an empty Scopes[0] list. Retain this original handle in the route array. */
export function decodeCurrentFootprintCopyUiNativeHas(input: unknown): void {
  try {
    const reply = z.object({ result: z.array(property).length(2), internalProperties: z.array(internal).length(2) }).strict().parse(data(input));
    const fields = new Map(reply.result.map(item => [item.name, item])); if (fields.size !== 2) { return fail(); }
    for (const name of ["name", "length"] as const) {
      const item = fields.get(name);
      if (item === undefined || item.writable || item.enumerable || !item.configurable || item.value.type !== (name === "name" ? "string" : "number") ||
          item.value.value !== (name === "name" ? "has" : 1) || item.value.objectId !== undefined || item.value.subtype !== undefined || item.value.className !== undefined) { return fail(); }
    }
    const entries = new Map(reply.internalProperties.map(item => [item.name, item.value]));
    const parent = entries.get("[[Prototype]]"), scopes = entries.get("[[Scopes]]");
    if (entries.size !== 2 || parent?.type !== "function" || parent.className !== "Function" || parent.objectId === undefined || parent.value !== undefined ||
        scopes?.type !== "object" || scopes.subtype !== "internal#scopeList" || scopes.className !== "Array" || scopes.description !== "Scopes[0]" ||
        scopes.objectId === undefined || scopes.value !== undefined) { return fail(); }
  } catch { return fail(); }
}

/** Shape/location admission only. The owner must already have admitted the
 * complete original UI script and reprove context through every awaited hop. */
export function decodeCurrentFootprintCopyUiFunction(input: unknown, role: CurrentFootprintCopyUiFunction, scriptId: string): string {
  try {
    token.parse(scriptId); if (!Object.hasOwn(CURRENT_FOOTPRINT_COPY_UI_SOURCE.functions, role)) { return fail(); }
    const count = role === "contextProducer" ? 3 : 2, expected = CURRENT_FOOTPRINT_COPY_UI_SOURCE.functions[role];
    const reply = z.object({ result: z.array(property).length(count), internalProperties: z.array(internal).length(3) }).strict().parse(data(input));
    const fields = new Map(reply.result.map(item => [item.name, item])); if (fields.size !== count) { return fail(); }
    for (const name of ["name", "length"] as const) {
      const item = fields.get(name), value = name === "name" ? expected.name : expected.arity;
      if (item === undefined || item.writable || item.enumerable || !item.configurable || item.value.value !== value ||
          Object.is(item.value.value, -0) || item.value.type !== (name === "name" ? "string" : "number") || item.value.objectId !== undefined) { return fail(); }
    }
    if (role === "contextProducer") {
      const item = fields.get("prototype");
      if (item === undefined || !item.writable || item.enumerable || item.configurable || item.value.type !== "object" ||
          item.value.objectId === undefined || item.value.value !== undefined) { return fail(); }
    }
    const entries = new Map(reply.internalProperties.map(item => [item.name, item.value]));
    const location = entries.get("[[FunctionLocation]]"), position = location?.value, prototype = entries.get("[[Prototype]]"), scopes = entries.get("[[Scopes]]");
    if (entries.size !== 3 || location?.type !== "object" || location.subtype !== "internal#location" || location.objectId !== undefined ||
        position === null || typeof position !== "object" || position.scriptId !== scriptId || position.lineNumber !== expected.lineNumber || position.columnNumber !== expected.columnNumber ||
        prototype?.type !== (expected.async ? "object" : "function") || prototype.className !== (expected.async ? "AsyncFunction" : "Function") ||
        prototype.objectId === undefined || prototype.value !== undefined || scopes?.type !== "object" || scopes.subtype !== "internal#scopeList" ||
        scopes.className !== "Array" || scopes.objectId === undefined || scopes.value !== undefined || !/^Scopes\[[1-8]\]$/u.test(scopes.description ?? "")) { return fail(); }
    return scopes.objectId;
  } catch { return fail(); }
}

/** The source callback and its rpcService wrapper each expose one leading
 * closure. Refuse missing/reordered/aliased lists; never enumerate Global. */
export function decodeCurrentFootprintCopyUiScope(input: unknown, kind: "wrapper" | "responder"): string {
  try {
    if (kind !== "wrapper" && kind !== "responder") { return fail(); }
    const ids = new Set<string>(), reply = z.object({ result: z.array(property).min(2).max(8) }).strict().parse(data(input));
    for (const [index, item] of reply.result.entries()) {
      if (item.name !== String(index) || !item.writable || !item.enumerable || !item.configurable || item.value.type !== "object" ||
          item.value.subtype !== "internal#scope" || item.value.className !== "Object" || item.value.objectId === undefined ||
          item.value.value !== undefined || ids.has(item.value.objectId)) { return fail(); }
      ids.add(item.value.objectId);
    }
    if (reply.result[0]?.value.description !== (kind === "wrapper" ? "Closure (rpcService)" : "Closure") ||
        reply.result.at(-1)?.value.description !== "Global") { return fail(); }
    return reply.result[0].value.objectId ?? fail();
  } catch { return fail(); }
}

export const CURRENT_FOOTPRINT_COPY_UI_LIMITS = Object.freeze({
  /** The original UI descriptor work21 plus preload qualification10 and
   * preload final recheck4. Four UI scope refresh requests account for the
   * runner total39; original parent/frame bracketing is separately reserved. */
  minimumDescriptorRequests: 35, initializedRegistryRequired: true, initializedMessageBusRequired: true,
  routeCaptureProvesExtensionAbsence: false, nativeHasQualificationRequired: true, matchingExtensionEntryAllowed: false, nativeNotificationDispatched: false,
  transitiveClosuresBound: false, projectWorkerTargetBound: false, executionAuthorized: false,
} as const);
