/** Fixed own-data snapshots over original held calls. Only qualified native
 * Response.ok and bounded DataView byte reads are invoked. No application,
 * fetch, cache, resolver, timer, model mutation or serializer is called. */
import { CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_CALLS as CACHE } from "./current-native-cache-response-intrinsics.ts";
import { CURRENT_NATIVE_FETCH_BYTES_CALLS as BYTES } from "./current-native-fetch-bytes-intrinsics.ts";
import { CURRENT_PCB_VIA_SAVED_LOAD_SITES as SITES } from "./current-pcb-via-saved-load-source.ts";
import type { CurrentPcbViaSavedLoadRole } from "./current-pcb-via-saved-load-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_VIA_SAVED_LOAD_GROUP = "codex-pcb-via-saved-load209";
const guards = String.raw`"use strict";const bad=()=>{throw new Error("SAVED_LOAD_OWN_DATA");},seen=[];
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();seen.push([o,k,d]);return d.value;};
const array=(o,n)=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();for(let i=0;i<n;i++)own(o,String(i));};
const verify=()=>{for(const[o,k,d]of seen){const a=Object.getOwnPropertyDescriptor(o,k);if(!a||!Object.hasOwn(a,"value")||!Object.is(a.value,d.value)||a.writable!==d.writable||a.enumerable!==d.enumerable||a.configurable!==d.configurable)bad();}};
let cells=0;const copy=(value,depth=0)=>{if(++cells>8192||depth>8)bad();if(value===null||typeof value==="boolean")return value;if(typeof value==="string"){if(value.length>16384)bad();return value;}if(typeof value==="number"&&Number.isFinite(value)&&!Object.is(value,-0))return value;
if(!value||typeof value!=="object")bad();if(Array.isArray(value)){const n=own(value,"length");if(!Number.isSafeInteger(n)||n<0||n>64||Object.getPrototypeOf(value)!==Array.prototype)bad();const keys=Reflect.ownKeys(value);if(keys.length>n+1||keys.some(k=>typeof k!=="string"||k!=="length"&&(!/^(?:0|[1-9]\d*)$/.test(k)||Number(k)>=n)))bad();const out=[];for(let i=0;i<n;i++){const d=Object.getOwnPropertyDescriptor(value,String(i));out.push(d===undefined?{schema:"private.saved-load-hole.v1"}:copy(own(value,String(i)),depth+1));}return out;}if(Object.getPrototypeOf(value)!==Object.prototype&&Object.getPrototypeOf(value)!==null)bad();const keys=Reflect.ownKeys(value);if(keys.length>32||keys.some(k=>typeof k!=="string"))bad();const out=Object.create(null);for(const k of keys)out[k]=copy(own(value,k),depth+1);return out;};
const check=(cache,bytes,project)=>{if(Reflect.apply(${CACHE.reprove.program},cache,[])!==true||Reflect.apply(${BYTES.reprove.program},bytes,[])!==true||own(cache,"0")!==globalThis||own(bytes,"0")!==globalThis||own(globalThis,"PROJECT")!==project||own(project,"_isV2Format")!==false||own(project,"debugOpen")!==false)bad();};
const projectValue=(project,cache,withCaches)=>{const branch=Object.getOwnPropertyDescriptor(project,"_branchUuid");if(branch!==undefined&&!Object.hasOwn(branch,"value")||branch===undefined&&"_branchUuid" in project)bad();const value={uuid:own(project,"uuid"),branchUuid:branch===undefined?null:own(project,"_branchUuid"),isOpening:own(project,"isOpening"),isReady:own(project,"isReady")};if(withCaches){const a=own(project,"cache"),b=own(project,"localCache");value.cacheName=own(a,"cacheName");value.localCacheName=own(b,"cacheName");if(Object.getPrototypeOf(own(a,"cache"))!==own(cache,"4")||Object.getPrototypeOf(own(b,"cache"))!==own(cache,"4"))bad();}return value;};
const fetchValue=(frame,bytes)=>{if(own(frame,String(own(frame,"length")-1))!==own(bytes,"3"))bad();const h=own(frame,"0"),url=own(frame,"1"),snapshot=own(frame,"2"),flow=own(frame,"3"),debug=own(frame,"4");if(snapshot!==true||debug!==false&&debug!==undefined||typeof url!=="string"||url.length>8192||!flow||Object.getPrototypeOf(flow)!==Object.prototype||typeof own(flow,"update")!=="function"||typeof own(flow,"end")!=="function")bad();return{history:copy(h),url,snapshot,debugUndefined:debug===undefined};};
const response=(frame,cache)=>{const value=own(frame,"5");if(Object.getPrototypeOf(value)!==own(cache,"6")||Object.hasOwn(value,"arrayBuffer")||Object.hasOwn(value,"ok")||Reflect.apply(own(cache,"23"),value,[])!==true)bad();return value;};
const byteValue=(frame,bytes)=>{const buffer=own(frame,"6"),View=own(bytes,"1"),view=new View(buffer),n=Reflect.apply(own(bytes,"6"),view,[]);if(!Number.isSafeInteger(n)||n<1||n>8192)bad();const out=[];for(let i=0;i<n;i++)out.push(Reflect.apply(own(bytes,"5"),view,[i]));return out;};`;
function program(role: CurrentPcbViaSavedLoadRole): string {
  const site = SITES[role]; let body: string;
  switch (role) {
    case "branch": { body = 'if(own(this,"0")!==project)bad();const value={project:projectValue(project,cache,false),branchUuid:own(this,"1"),historyUuid:own(this,"2")};'; break; }
    case "cold": { body = 'if(own(this,"0")!==project)bad();const index=own(this,"1");array(index,0);const value={project:projectValue(project,cache,true),emptyLocalIndex:true};'; break; }
    case "histories": case "parsed": { body = 'if(own(this,"0")!==project)bad();const value={project:projectValue(project,cache,true),historyUuid:own(this,"1"),histories:copy(own(this,"2"))};'; break; }
    case "ready": { body = 'if(own(this,"0")!==project)bad();const value={project:projectValue(project,cache,true),histories:copy(own(project,"historyIndex"))};'; break; }
    case "fetchEntry": { body = 'const value=fetchValue(this,bytes);'; break; }
    case "response": { body = 'response(this,cache);const value=fetchValue(this,bytes);'; break; }
    case "bytes": { body = 'response(this,cache);const value={...fetchValue(this,bytes),bytes:byteValue(this,bytes)};'; break; }
    case "plaintext": { body = 'response(this,cache);const plain=own(this,"7");if(typeof plain!=="string"||plain.length>16384)bad();const value={...fetchValue(this,bytes),bytes:byteValue(this,bytes),plaintext:plain};'; break; }
    case "warm": case "pending": case "fallback": case "failed": { body = 'bad();const value=null;'; break; }
    default: { throw new Error("SAVED_LOAD_PROGRAM_ROLE"); }
  }
  return `function(cache,bytes,project){${guards}array(this,${String(site.length)});check(cache,bytes,project);${body}verify();return value;}`;
}
export const CURRENT_PCB_VIA_SAVED_LOAD_CALLS: Readonly<Record<CurrentPcbViaSavedLoadRole, string>> = freezeDeep({
  branch: program("branch"),
  cold: program("cold"),
  histories: program("histories"),
  fetchEntry: program("fetchEntry"),
  response: program("response"),
  bytes: program("bytes"),
  plaintext: program("plaintext"),
  parsed: program("parsed"),
  ready: program("ready"),
  warm: program("warm"),
  pending: program("pending"),
  fallback: program("fallback"),
  failed: program("failed"),
});

export const CURRENT_PCB_VIA_SAVED_LOAD_FLOW_CALL = `function(){${guards}array(this,6);const flow=own(this,"3"),update=own(flow,"update"),end=own(flow,"end");if(typeof update!=="function"||typeof end!=="function")bad();verify();return[update,end];}`;
