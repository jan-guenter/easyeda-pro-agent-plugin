/** Complete readonly native Fetch metadata sampling. Both original intrinsic
 * tuples must already be fully qualified in the same genuine new UI realm.
 * The actual saved opener retains custody and excludes selected writers. */
import { types } from "node:util";
import { z } from "zod";
import { CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_CALLS as CACHE, CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_PROFILES } from "./current-native-cache-response-intrinsics.ts";
import { CURRENT_NATIVE_REQUEST_METADATA_MAX_FUNCTIONS, CURRENT_NATIVE_REQUEST_METADATA_INTRINSIC_CALLS as REQUEST } from "./current-native-request-metadata-intrinsics.ts";
import type { CurrentNativeRequestMetadataCatalogue } from "./current-native-request-metadata-intrinsics.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PCB_VIA_SAVED_CACHE_LIMITS as LIMITS } from "./current-pcb-via-saved-cache-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const nativeProperties = CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_PROFILES.length + CURRENT_NATIVE_REQUEST_METADATA_MAX_FUNCTIONS;
const helperSources = 4 + 1 + 2 + 1 + 4;
export const CURRENT_PCB_VIA_SAVED_CACHE_METADATA_REQUESTS = Object.freeze({ captures: 4, referenceArrays: 4, catalogue: 1, nativeProperties,
  reproofs: 2, bind: 1, observations: 4, helperSources, helperEvents: helperSources, normal: 4 + 4 + 1 + nativeProperties + 2 + 1 + 4 + helperSources, cleanup: 1, total: 4 + 4 + 1 + nativeProperties + 2 + 1 + 4 + helperSources + 1 });
const helpers = String.raw`"use strict";const bad=()=>{throw new Error("PCB_VIA_SAVED_CACHE_METADATA");};
const own=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const array=(o,n)=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();};
const apply=(f,receiver,args)=>Reflect.apply(f,receiver,args);
const cacheReprove=${CACHE.reprove.program},requestReprove=${REQUEST.reprove.program};
const reprove=state=>{array(state,4);const c=own(state,"0"),r=own(state,"1");if(own(c,"0")!==globalThis||own(r,"0")!==globalThis||apply(cacheReprove,c,[])!==true||apply(requestReprove,r,[])!==true)bad();
for(const key of Reflect.ownKeys(own(c,"6"))){const d=Object.getOwnPropertyDescriptor(own(c,"6"),key);if(d&&!Object.hasOwn(d,"value")&&!["url","redirected","type","status","statusText","ok","headers","body","bodyUsed"].includes(key))bad();}
const uuid=own(state,"2"),storage=own(state,"3");if(typeof uuid!=="string"||!/^[a-f0-9]{64}$/.test(uuid)||apply(own(c,"27"),globalThis,[])!==storage||Object.getPrototypeOf(storage)!==own(c,"5"))bad();return[c,r,uuid,storage];};
const text=(value,max)=>{if(typeof value!=="string"||value.length>max)bad();return value;};
const headers=(r,value)=>{const keys=own(r,"7"),length=own(keys,"length"),pairs=[];let bytes=0;
apply(own(r,String(10+length)),value,[(v,k)=>{text(k,256);text(v,8192);bytes+=k.length+v.length;if(pairs.length>=16||bytes>8192)bad();pairs.push([k,v]);}]);
if(Object.getPrototypeOf(value)!==own(r,"5"))bad();const cookies=apply(own(r,String(11+length)),value,[]),n=own(cookies,"length");array(cookies,n);if(n>16)bad();for(let i=0;i<n;i++){bytes+=text(own(cookies,String(i)),8192).length;if(bytes>8192)bad();}return{pairs,setCookie:cookies};};
const request=(r,value)=>{const keys=own(r,"7"),length=own(keys,"length"),result={};
for(let i=0;i<length;i++){const key=own(keys,String(i)),v=apply(own(r,String(8+i)),value,[]);if(key==="headers")result[key]=headers(r,v);else if(key==="signal"){const aborted=apply(own(r,String(8+length)),v,[]),reason=apply(own(r,String(9+length)),v,[]);if(Object.getPrototypeOf(v)!==own(r,"6")||aborted!==false||reason!==undefined)bad();result[key]={aborted,reasonUndefined:true};}else if(key==="body"){if(v!==null)bad();result[key]=null;}else if(typeof v==="string")result[key]=text(v,8192);else if(typeof v==="boolean")result[key]=v;else bad();}
if(Object.getPrototypeOf(value)!==own(r,"4")||result.method!=="GET"||result.bodyUsed!==false)bad();return result;};
const response=(c,r,value)=>{const type=apply(own(c,"20"),value,[]);if(type!=="default"||Object.getPrototypeOf(value)!==own(c,"6"))bad();const url=apply(own(c,"18"),value,[]),redirected=apply(own(c,"19"),value,[]),status=apply(own(c,"21"),value,[]),statusText=apply(own(c,"22"),value,[]),ok=apply(own(c,"23"),value,[]),body=apply(own(c,"25"),value,[]),bodyUsed=apply(own(c,"26"),value,[]);
if(url!==""||redirected!==false||status!==200||statusText!==""||ok!==true||bodyUsed!==false||(body!==null&&typeof body!=="object"))bad();return{url,redirected,type,status,statusText,ok,headers:headers(r,apply(own(c,"24"),value,[])),bodyPresent:body!==null,bodyUsed};};`;
export const CURRENT_PCB_VIA_SAVED_CACHE_METADATA_CALLS = freezeDeep({
  bind: { program: `function(originalRequest,projectUuid){${helpers}if(own(this,"0")!==globalThis||own(originalRequest,"0")!==globalThis||apply(cacheReprove,this,[])!==true||apply(requestReprove,originalRequest,[])!==true)bad();const state=[this,originalRequest,projectUuid,apply(own(this,"27"),globalThis,[])];reprove(state);return state;}`, arguments: 2, returnByValue: false, awaitPromise: false, throwOnSideEffect: false },
  observe: { program: `async function(ordinal){${helpers}if(ordinal!==0&&ordinal!==1)bad();let[c,r,uuid,storage]=reprove(this);const name=ordinal===0?"project_"+uuid+"_v6":"localProject_"+uuid+"_v1";
const names=await apply(own(c,"13"),storage,[]);[c,r,uuid,storage]=reprove(this);const n=own(names,"length");array(names,n);if(n>128)bad();let found=false;for(let i=0;i<n;i++){const value=text(own(names,String(i)),256);if(value===name)found=true;}
const existed=await apply(own(c,"14"),storage,[name]);[c,r,uuid,storage]=reprove(this);if(typeof existed!=="boolean"||existed!==found)bad();const entries=[];
if(existed){const cache=await apply(own(c,"12"),storage,[name]);[c,r,uuid,storage]=reprove(this);if(Object.getPrototypeOf(cache)!==own(c,"4"))bad();const requests=await apply(own(c,"11"),cache,[]);[c,r,uuid,storage]=reprove(this);const count=own(requests,"length");array(requests,count);if(count>8)bad();
for(let i=0;i<count;i++){const value=own(requests,String(i)),key=request(r,value),matched=await apply(own(c,"9"),cache,[value]);[c,r,uuid,storage]=reprove(this);if(matched===undefined)bad();entries.push({request:key,response:response(c,r,matched)});}}
reprove(this);return{schema:"private.pcb-via-saved-cache-metadata.v1",ordinal,existed,requestGetterNames:own(r,"7"),entries,completeNativeFetchMetadataCaptured:true,executionAuthorized:false};}`, arguments: 1, returnByValue: true, awaitPromise: true, throwOnSideEffect: false },
});

export const CURRENT_PCB_VIA_SAVED_CACHE_METADATA_HELPERS = freezeDeep({
  "cache-constructors": { ...CACHE.constructors, awaitPromise: false, emissions: 1 }, "cache-members": { ...CACHE.members, awaitPromise: false, emissions: 1 }, "cache-reprove": { ...CACHE.reprove, awaitPromise: false, emissions: 1 },
  "request-constructors": { ...REQUEST.constructors, awaitPromise: false, emissions: 1 }, "request-members": { ...REQUEST.members, awaitPromise: false, emissions: 1 }, "request-catalogue": { ...REQUEST.catalogue, awaitPromise: false, emissions: 1 }, "request-reprove": { ...REQUEST.reprove, awaitPromise: false, emissions: 1 },
  bind: { ...CURRENT_PCB_VIA_SAVED_CACHE_METADATA_CALLS.bind, emissions: 1 }, observe: { ...CURRENT_PCB_VIA_SAVED_CACHE_METADATA_CALLS.observe, emissions: 4 },
});
export type CurrentPcbViaSavedCacheMetadataHelper = keyof typeof CURRENT_PCB_VIA_SAVED_CACHE_METADATA_HELPERS;
/** Bound to the exact original helper scriptParsed event by its owner. This
 * specialized source read does not weaken the shared16KiB reply-string bound. */
export function qualifyCurrentPcbViaSavedCacheMetadataHelper(input: unknown, role: CurrentPcbViaSavedCacheMetadataHelper): void {
  if (!Object.hasOwn(CURRENT_PCB_VIA_SAVED_CACHE_METADATA_HELPERS, role) || input === null || typeof input !== "object" || types.isProxy(input) || Array.isArray(input)) { throw new Error("SAVED_CACHE_METADATA_HELPER_SOURCE"); }
  const expected = `(${CURRENT_PCB_VIA_SAVED_CACHE_METADATA_HELPERS[role].program})`, keys = Reflect.ownKeys(input), prototype: unknown = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null || keys.length !== 1 || keys[0] !== "scriptSource") { throw new Error("SAVED_CACHE_METADATA_HELPER_SOURCE"); }
  const field = Object.getOwnPropertyDescriptor(input, "scriptSource");
  if (field === undefined || !Object.hasOwn(field, "value") || field.enumerable !== true || typeof field.value !== "string" || field.value !== expected) { throw new Error("SAVED_CACHE_METADATA_HELPER_SOURCE"); }
}

const pair = z.tuple([z.string().max(256), z.string().max(8192)]);
const headersSchema = z.strictObject({ pairs: z.array(pair).max(LIMITS.headersPerEntry), setCookie: z.array(z.string().max(8192)).length(0) });
const requestSchema = z.strictObject({ url: z.string().min(1).max(8192), method: z.literal("GET"), headers: headersSchema,
  destination: z.literal(""), referrer: z.union([z.literal(""), z.literal("about:client")]), referrerPolicy: z.literal(""), mode: z.literal("cors"), credentials: z.literal("same-origin"),
  cache: z.literal("default"), redirect: z.literal("follow"), integrity: z.literal(""), keepalive: z.literal(false), signal: z.strictObject({ aborted: z.literal(false), reasonUndefined: z.literal(true) }), body: z.null(), bodyUsed: z.literal(false),
  duplex: z.literal("half").optional(), isHistoryNavigation: z.literal(false).optional(), isReloadNavigation: z.literal(false).optional(), targetAddressSpace: z.literal("unknown").optional(), priority: z.literal("auto").optional() });
const responseSchema = z.strictObject({ url: z.literal(""), redirected: z.literal(false), type: z.literal("default"), status: z.literal(200), statusText: z.literal(""), ok: z.literal(true), headers: headersSchema, bodyPresent: z.boolean(), bodyUsed: z.literal(false) });
const schema = z.strictObject({ schema: z.literal("private.pcb-via-saved-cache-metadata.v1"), ordinal: z.union([z.literal(0), z.literal(1)]), existed: z.boolean(),
  requestGetterNames: z.array(z.string().max(64)).min(15).max(20), entries: z.array(z.strictObject({ request: requestSchema, response: responseSchema })).max(LIMITS.entriesPerNamespaceMaximum),
  completeNativeFetchMetadataCaptured: z.literal(true), executionAuthorized: z.literal(false) });
export type CurrentPcbViaSavedCacheMetadata = Readonly<z.infer<typeof schema>>;
/** Only a strict data projection. Original function qualification and actual
 * request/reply custody remain mandatory in the new native owner. */
export function decodeCurrentPcbViaSavedCacheMetadata(input: unknown, catalogue: CurrentNativeRequestMetadataCatalogue): CurrentPcbViaSavedCacheMetadata {
  const expected = catalogue.slice(3, -4).map(item => item.name.slice(4)), value = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (value.requestGetterNames.length !== expected.length || value.requestGetterNames.some((name, index) => name !== expected[index]) || !value.existed && value.entries.length > 0) { throw new Error("PCB_VIA_SAVED_CACHE_METADATA_DATA"); }
  const seen = new Set<string>();
  for (const entry of value.entries) {
    const contentType = entry.response.headers.pairs[0];
    if (Object.keys(entry.request).length !== expected.length || expected.some(name => !Object.hasOwn(entry.request, name)) || entry.request.headers.pairs.length > 0 ||
      entry.response.headers.pairs.length !== 1 || contentType === undefined || contentType[0].toLowerCase() !== "content-type" || !["application/json", "text/plain;charset=UTF-8"].includes(contentType[1]) || seen.has(entry.request.url)) { throw new Error("PCB_VIA_SAVED_CACHE_METADATA_DATA"); }
    seen.add(entry.request.url);
  }
  return freezeDeep(value);
}
