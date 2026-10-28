/** Original worker route selectors. No notifier, timer, HTTP client, lazy
 * singleton getter or Cache method runs. Native backend ownership is separate. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { CURRENT_FOOTPRINT_COPY_DESTINATION_PROFILES as PROFILES } from "./current-footprint-copy-destination-profiles.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const helpers = String.raw`"use strict";const bad=()=>{throw new Error("FOOTPRINT_COPY_DESTINATION");},seen=[],parents=[];
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();seen.push([o,k,d]);return d.value;};
const absent=(o,k)=>{if(Object.getOwnPropertyDescriptor(o,k)!==undefined)bad();seen.push([o,k,undefined]);};
const proto=o=>{const p=Object.getPrototypeOf(o);parents.push([o,p]);return p;};
const array=(o,n)=>{if(!Array.isArray(o)||proto(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();};
const fun=(o,k)=>{const f=own(o,k);if(typeof f!=="function")bad();return f;};
const method=(c,k)=>{const p=own(c,"prototype"),f=fun(p,k),d=Object.getOwnPropertyDescriptor(p,k);if(!d||d.writable!==true||d.enumerable!==false||d.configurable!==true)bad();return f;};
const chain=(o,names)=>{const out=[];let p=proto(o);for(const name of names){const c=fun(bindings,name);if(p!==own(c,"prototype")||own(p,"constructor")!==c)bad();out.push(p);p=proto(p);}if(p!==Object.prototype)bad();return out;};
const resolved=(o,levels,k,index)=>{absent(o,k);for(let i=0;i<index;i++)absent(levels[i],k);return own(levels[index],k);};
const bindings=own(this,"object");array(dependencies,69);array(callbacks,14);
if(own(globalThis,"PROJECT")!==project||own(project,"workerBus")!==bus||own(project,"footprint")!==manager||own(project,"consistencyManager")!==consistency||own(manager,"projectManager")!==project)bad();
const projectLevels=chain(project,["Lg","Gd"]);
if(own(bindings,"jr")!==false||own(bindings,"ln")!==true)bad();
const path=own(project,"uuid"),branch=own(project,"_branchUuid"),client=own(consistency,"client"),ticket=own(consistency,"maxTicket");
if(typeof path!=="string"||!/^[a-f\d]{64}$/.test(path)||typeof branch!=="string"||!/^[a-f\d]{32}$/.test(branch)||typeof client!=="string"||!/^[a-f\d]{16}$/.test(client)||!Number.isSafeInteger(ticket)||ticket<0||Object.is(ticket,-0))bad();
for(const key of ["isTemporary","isHistoryBack","_isV2Format","isUploadingCloud","isBatchUpload","pendingSyncCloud"])if(own(project,key)!==false)bad();
if(own(project,"isReady")!==true)bad();
for(const[key,index]of [["onHeadChange",39],["uploadCloud",35],["batchUploadCloud",36],["publishUploadPending",37]])if(resolved(project,projectLevels,key,key==="onHeadChange"?0:1)!==own(dependencies,String(index)))bad();
const cache=own(project,"cache"),localCache=own(project,"localCache");
if(cache!==own(dependencies,"61")||localCache!==own(dependencies,"62")||localCache!==own(callbacks,"12")||cache!==own(callbacks,"13"))bad();
for(const[key,index,set]of [["task1",6,true],["task2",7,true],["task3",8,true],["cachePromise",9,true],["bufferUploadData",10,false],["bufferUploadCache",11,false]]){const value=own(project,key),p=set?Set.prototype:Map.prototype,d=Object.getOwnPropertyDescriptor(p,"size");if(value!==own(callbacks,String(index))||proto(value)!==p||Reflect.ownKeys(value).length!==0||!d||typeof d.get!=="function"||Object.hasOwn(d,"value")||Reflect.apply(d.get,value,[])!==0)bad();}
const api=fun(bindings,"Re");if(api!==fun(bindings,"mc"))bad();const instance=own(api,"tool");if(instance===null||proto(instance)!==own(api,"prototype")||own(own(api,"prototype"),"constructor")!==api)bad();
const history=own(instance,"projectHistory"),branchApi=own(instance,"branch"),historyLevels=chain(history,["_d","rs"]),branchLevels=chain(branchApi,["bd","rs"]);
if(own(history,"parent")!==instance||own(branchApi,"parent")!==instance)bad();
const enums=own(bindings,"ae"),historyUrls=own(enums,"PROJECT_HISTORY"),branchUrls=own(enums,"BRANCH");
if(own(historyUrls,"SET")!=="/api/v4/projects/{project_uuid}/branches/{branch_uuid}/histories"||own(historyUrls,"GET")!=="/api/v4/projects/{project_uuid}/branches/{branch_uuid}/histories/{history_uuid}"||own(branchUrls,"GET")!=="/api/v4/projects/{project_uuid}/branches/{branch_uuid}")bad();
const selected=[];`;
const selection = PROFILES.map(profile => {
  if (profile.kind !== "method") { return `selected.push(fun(bindings,${JSON.stringify(profile.key)}));`; }
  const [owner, key] = profile.key.split(".");
  if (owner === "mc") { return `selected.push(fun(api,${JSON.stringify(key)}));`; }
  let relation: string;
  if (owner === "Lg" || owner === "Gd") { relation = `resolved(project,projectLevels,${JSON.stringify(key)},${owner === "Lg" ? "0" : "1"})`; }
  else if (owner === "_d") { relation = `resolved(history,historyLevels,${JSON.stringify(key)},0)`; }
  else if (owner === "bd") { relation = `resolved(branchApi,branchLevels,${JSON.stringify(key)},0)`; }
  else {
    relation = `resolved(history,historyLevels,${JSON.stringify(key)},1)`;
  }
  return `{const value=method(fun(bindings,${JSON.stringify(owner)}),${JSON.stringify(key)});if(value!==${relation}${owner === "rs" ? `||value!==resolved(branchApi,branchLevels,${JSON.stringify(key)},1)` : ""})bad();selected.push(value);}`;
}).join("\n");
const tail = String.raw`
selected.push(api,instance,history,branchApi,cache,localCache,historyUrls,branchUrls,client,ticket,path,branch);
const verify=()=>{for(const[o,p]of parents)if(Object.getPrototypeOf(o)!==p)bad();for(const[o,k,d]of seen){const n=Object.getOwnPropertyDescriptor(o,k);if(d===undefined?n!==undefined:!n||!Object.hasOwn(n,"value")||!Object.is(n.value,d.value)||n.writable!==d.writable||n.enumerable!==d.enumerable||n.configurable!==d.configurable)bad();}};`;
const body = `${helpers}\n${selection}\n${tail}`;
export const CURRENT_FOOTPRINT_COPY_DESTINATION_CALLS = freezeDeep({
  capture: { program: `function(project,bus,manager,consistency,dependencies,callbacks){${body}\nverify();return selected;}`, arguments: 6, returnByValue: false },
  recheck: { program: `function(project,bus,manager,consistency,dependencies,callbacks,original){${body}\narray(original,40);for(let i=0;i<40;i++)if(own(original,String(i))!==selected[i])bad();verify();return true;}`, arguments: 7, returnByValue: true },
});

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), text = z.string().max(16_384);
const point = z.object({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const value = z.object({ type: z.enum(["function", "object", "string", "number"]), subtype: text.optional(), className: text.optional(),
  objectId: handle.optional(), description: text.optional(), value: z.union([text, z.number(), point]).optional() }).strict();
const property = z.object({ name: text, value, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) }).strict();
const internal = z.object({ name: text, value }).strict();
function need(condition: boolean): asserts condition { if (!condition) { throw new Error("FOOTPRINT_COPY_DESTINATION_METADATA"); } }
export function decodeCurrentFootprintCopyDestinationArray(raw: unknown): Readonly<{
  functions: readonly string[]; client: string; maximumTicket: number; projectUuid: string; branchUuid: string;
}> {
  const reply = z.object({ result: z.array(property).length(41), internalProperties: z.array(internal).length(1) }).strict()
    .parse(captureCurrentPcbStringClockReply(raw).value);
  const fields = new Map(reply.result.map(item => [item.name, item])); need(fields.size === 41);
  const length = fields.get("length"); need(length?.value.value === 40 && length.value.type === "number" && length.writable && !length.configurable && !length.enumerable);
  const ids: string[] = [];
  for (let index = 0; index < 40; index += 1) {
    const item = fields.get(String(index)); need(item !== undefined && item.writable && item.configurable && item.enumerable);
    if (index < 28) {
      const profile = PROFILES[index]; need(profile !== undefined && item.value.type === "function" && item.value.className === (profile.async ? "AsyncFunction" : "Function") &&
        item.value.objectId !== undefined && item.value.subtype === undefined && item.value.value === undefined && item.value.description !== undefined &&
        Buffer.byteLength(item.value.description) === profile.bytes && createHash("sha256").update(item.value.description).digest("hex") === profile.sha256);
      ids.push(item.value.objectId);
    } else if (index < 36) { need(item.value.objectId !== undefined && item.value.value === undefined && item.value.subtype === undefined && item.value.type === (index === 28 ? "function" : "object")); }
  }
  need(new Set(ids).size === 28);
  const parent = reply.internalProperties[0]; need(parent?.name === "[[Prototype]]" && parent.value.type === "object" && parent.value.subtype === "array" && parent.value.className === "Array" && parent.value.objectId !== undefined);
  const scalar = (index: number): unknown => {
    const item = fields.get(String(index))?.value; need(item !== undefined && item.objectId === undefined && item.subtype === undefined && item.className === undefined);
    need(item.type === (index === 37 ? "number" : "string"));
    return item.value;
  };
  return Object.freeze({ functions: Object.freeze(ids), client: z.string().regex(/^[a-f\d]{16}$/u).parse(scalar(36)),
    maximumTicket: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER - 1).refine(n => !Object.is(n, -0)).parse(scalar(37)),
    projectUuid: z.string().regex(/^[a-f\d]{64}$/u).parse(scalar(38)), branchUuid: z.string().regex(/^[a-f\d]{32}$/u).parse(scalar(39)) });
}
export function decodeCurrentFootprintCopyDestinationFunction(raw: unknown, scriptId: string, index: number): void {
  const profile = PROFILES[index]; need(profile !== undefined); handle.parse(scriptId);
  const prototype = profile.kind === "function" && !profile.async;
  const reply = z.object({ result: z.array(property).length(prototype ? 3 : 2), internalProperties: z.array(internal).length(3) }).strict()
    .parse(captureCurrentPcbStringClockReply(raw).value);
  const fields = new Map(reply.result.map(item => [item.name, item])); need(fields.size === reply.result.length);
  for (const [key, expected] of [["name", profile.name], ["length", profile.arity]] as const) {
    const item = fields.get(key); need(item !== undefined && !item.writable && !item.enumerable && item.configurable && item.value.value === expected &&
      item.value.objectId === undefined && item.value.type === (typeof expected === "string" ? "string" : "number"));
  }
  if (prototype) { const entry = fields.get("prototype"); need(entry !== undefined && entry.writable && !entry.configurable && !entry.enumerable && entry.value.type === "object" && entry.value.objectId !== undefined); }
  const internals = new Map(reply.internalProperties.map(item => [item.name, item.value]));
  const location = internals.get("[[FunctionLocation]]"), parent = internals.get("[[Prototype]]"), position = location?.value, scopes = internals.get("[[Scopes]]");
  need(internals.size === 3 && location?.type === "object" && location.subtype === "internal#location" && position !== undefined && typeof position === "object" &&
    position.scriptId === scriptId && position.lineNumber === profile.lineNumber && position.columnNumber === profile.columnNumber &&
    parent?.type === (profile.async ? "object" : "function") && parent.objectId !== undefined && scopes?.subtype === "internal#scopeList" && scopes.objectId !== undefined);
}
