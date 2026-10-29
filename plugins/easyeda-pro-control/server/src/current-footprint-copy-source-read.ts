/** Dormant fixed209 async GET_STR observer. The original owner must supply the
 * retained Tg/PROJECT/bus/consistency objects and journal before dispatch.
 * GET_STR can populate native caches. This is not a side-effect-free CDP read,
 * copy writer, completion witness or authority to reopen a project.
 */
import { z } from "zod";
import { types } from "node:util";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS = Object.freeze({
  contentBytes: 2_097_152, nativeTimeoutMs: 8000, hostTimeoutMs: 10_000,
  sourceCalls: 2, stateCalls: 4,
});
const identity = z.object({
  projectUuid: z.string().refine(value => /^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u.exec(value)?.[0] === value),
  branchUuid: z.string().refine(value => /^[a-f0-9]{32}$/u.exec(value)?.[0] === value),
  windowTabId: z.string().refine(value => /^[A-Za-z0-9_-]{1,128}$/u.exec(value)?.[0] === value),
}).strict();
const maximumTicket = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER - 3).refine(value => !Object.is(value, -0));
export const currentFootprintCopySourceReadRequestSchema = z.object({ identity,
  footprintUuid: z.string().refine(value => /^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u.exec(value)?.[0] === value),
  client: z.string().refine(value => /^[a-f0-9]{16}$/u.exec(value)?.[0] === value), maximumTicket,
}).strict();
export type CurrentFootprintCopySourceReadRequest = Readonly<z.infer<typeof currentFootprintCopySourceReadRequestSchema>>;
const sourceReply = z.object({ result: z.object({ type: z.literal("string"), value: z.string()
  .min(1).max(CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.contentBytes * 2 + 4096) }).strict() }).strict();
const sourceObservation = currentFootprintCopySourceReadRequestSchema.extend({
  schema: z.literal("easyeda-pro-control.current-footprint-copy-source-read.v1"),
  capturedUser: z.literal("own-undefined"),
  content: z.string().min(1).max(CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.contentBytes)
    .refine(value => value.isWellFormed() && Buffer.byteLength(value) <= CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.contentBytes),
  route: z.enum(["native-get-str", "native-cache-equivalent"]), sourceGetterDispatched: z.boolean(),
  cacheRead: z.object({ keys: z.number().int().min(0).max(64), bytes: z.number().int().min(0).max(8_388_608),
    atoms: z.number().int().min(0).max(4096) }).strict().optional(), cacheWrites: z.literal(0).optional(), networkRequests: z.literal(0).optional(),
  cacheEffectsPossible: z.boolean(), executionAuthorized: z.literal(false), persistenceVerified: z.literal(false),
}).strict().refine(value => value.sourceGetterDispatched === (value.route === "native-get-str") &&
  value.cacheEffectsPossible === (value.route === "native-get-str") && (value.route === "native-cache-equivalent" ?
    value.cacheRead !== undefined && value.cacheWrites === 0 && value.networkRequests === 0 :
    value.cacheRead === undefined && value.cacheWrites === undefined && value.networkRequests === undefined), "Source route and effects differ.");
export type CurrentFootprintCopySourceReadSample = Readonly<z.infer<typeof sourceObservation>>;

function envelopeOwn(value: unknown, keys: readonly string[], key: string): unknown {
  if (value === null || typeof value !== "object" || types.isProxy(value) || Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null ||
    Reflect.ownKeys(value).length !== keys.length || Reflect.ownKeys(value).some(item => typeof item !== "string" || !keys.includes(item))) {
    throw new Error("CURRENT_FOOTPRINT_COPY_SOURCE_READ_CAPTURE");
  }
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  if (descriptor === undefined || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true) {
    throw new Error("CURRENT_FOOTPRINT_COPY_SOURCE_READ_CAPTURE");
  }
  return descriptor.value as unknown;
}

/** Only the exact CDP string-result envelope gets the larger source bound.
 * No general clock/construction reply budget changes. Capture precedes native
 * owner reproof so a malformed JSON string remains retained diagnostic data.
 */
export function captureCurrentFootprintCopySourceReadReply(input: unknown): Readonly<{ result: Readonly<{ type: "string"; value: string }> }> {
  const result = envelopeOwn(input, ["result"], "result");
  const kind = envelopeOwn(result, ["type", "value"], "type"), value = envelopeOwn(result, ["type", "value"], "value");
  if (kind !== "string" || typeof value !== "string" || !value.isWellFormed() ||
    Buffer.byteLength(value) > CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.contentBytes * 2 + 4096) {
    throw new Error("CURRENT_FOOTPRINT_COPY_SOURCE_READ_CAPTURE");
  }
  return Object.freeze({ result: Object.freeze({ type: "string", value }) });
}

/** Fixed async callFunctionOn body. Receiver is the retained Tg; the first
 * three arguments, fifth constructor array and sixth method array are retained remote objects,
 * never caller-selected IDs. The fourth is the strict data request. Native integration must use
 * awaitPromise:true, returnByValue:true and throwOnSideEffect:false in its own
 * purpose-bound request family. The synchronous construction family must not
 * be relaxed to admit this function. The method array must originate from the
 * original owner's source-qualified captures, in order: Tg.getStr, Pi's
 * maxTicket getter, Vc.getMaxTicket, Lg.getCanvasByConsistency and Lg.compress.
 * These five bindings do not qualify the transitive cache/compressor call graph;
 * that remains a native coordinator obligation before any route is enabled.
 * Only the timer pair may be inherited through at most three prototype links,
 * as on worker globals. Retain every absent shadow, link and final data
 * descriptor for the same across-await reproof; never invoke a timer getter.
 */
export const CURRENT_FOOTPRINT_COPY_SOURCE_READ_FUNCTION = `async function(project,bus,consistency,selected,constructors,methods){
"use strict";
const bad=()=>{throw new Error("CURRENT_FOOTPRINT_COPY_SOURCE_READ_REFUSED");};
const descriptors=[],prototypes=[];
const object=o=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();return o;};
const descriptor=(o,k)=>{object(o);const d=Object.getOwnPropertyDescriptor(o,k);descriptors.push([o,k,d]);return d;};
const own=(o,k)=>{const d=descriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const absent=(o,k)=>{if(descriptor(o,k)!==undefined)bad();};
const proto=o=>{object(o);const p=Object.getPrototypeOf(o);prototypes.push([o,p]);return p;};
const plain=o=>{object(o);if(proto(o)!==Object.prototype)bad();return o;};
const exact=(o,keys)=>{plain(o);const actual=Reflect.ownKeys(o);if(actual.length!==keys.length||actual.some(k=>typeof k!=="string"||!keys.includes(k)))bad();};
const named=(p,name)=>{const c=own(p,"constructor");if(typeof c!=="function"||own(c,"name")!==name||own(c,"prototype")!==p)bad();return c;};
const chain=(o,names,expected)=>{const out=[];let p=proto(o);for(let index=0;index<names.length;index++){const c=named(p,names[index]);if(expected&&c!==expected[index])bad();out.push(p);p=proto(p);}if(p!==Object.prototype)bad();return out;};
const method=(o,parents,k,index)=>{absent(o,k);for(let i=0;i<index;i++)absent(parents[i],k);const fn=own(parents[index],k);if(typeof fn!=="function")bad();return fn;};
const text=(v,re)=>{if(typeof v!=="string"||re.exec(v)?.[0]!==v)bad();return v;};
exact(selected,["identity","footprintUuid","client","maximumTicket"]);
const target=plain(own(selected,"identity"));exact(target,["projectUuid","branchUuid","windowTabId"]);
const projectUuid=text(own(target,"projectUuid"),/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/),branchUuid=text(own(target,"branchUuid"),/^[a-f0-9]{32}$/),windowTabId=text(own(target,"windowTabId"),/^[A-Za-z0-9_-]{1,128}$/);
const footprintUuid=text(own(selected,"footprintUuid"),/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/),client=text(own(selected,"client"),/^[a-f0-9]{16}$/),maximumTicket=own(selected,"maximumTicket");
if(!Number.isSafeInteger(maximumTicket)||Object.is(maximumTicket,-0)||maximumTicket<0||maximumTicket>Number.MAX_SAFE_INTEGER-3)bad();
if(own(globalThis,"PROJECT")!==project||own(globalThis,"_TAB_ID_")!==windowTabId||own(project,"uuid")!==projectUuid||own(project,"_branchUuid")!==branchUuid||own(project,"workerBus")!==bus||own(project,"footprint")!==this||own(project,"consistencyManager")!==consistency||own(this,"projectManager")!==project||own(this,"client")!==client||own(this,"user")!==undefined||own(consistency,"client")!==client||own(consistency,"maxTicket")!==maximumTicket)bad();
if(!Array.isArray(constructors)||proto(constructors)!==Array.prototype||own(constructors,"length")!==11||Reflect.ownKeys(constructors).length!==12)bad();
const constructorValues=[];for(let index=0;index<11;index++){const c=own(constructors,String(index));if(typeof c!=="function")bad();constructorValues.push(c);}
if(!Array.isArray(methods)||proto(methods)!==Array.prototype||own(methods,"length")!==5||Reflect.ownKeys(methods).length!==6)bad();
const methodValues=[];for(let index=0;index<5;index++){const fn=own(methods,String(index));if(typeof fn!=="function")bad();methodValues.push(fn);}
const footprintChain=chain(this,["Tg","ar","Pi"],constructorValues.slice(0,3)),consistencyChain=chain(consistency,["ja","Vc","zy"],constructorValues.slice(3,6)),projectChain=chain(project,["Lg","Gd"],constructorValues.slice(6,8));
chain(bus,["JP","KP","Mb"],constructorValues.slice(8,11));
const getStr=method(this,footprintChain,"getStr",0);
if(getStr!==methodValues[0]||method(consistency,consistencyChain,"getMaxTicket",1)!==methodValues[2]||method(project,projectChain,"getCanvasByConsistency",0)!==methodValues[3]||method(project,projectChain,"compress",0)!==methodValues[4])bad();
absent(this,"maxTicket");absent(footprintChain[0],"maxTicket");absent(footprintChain[1],"maxTicket");
const ticketGetter=descriptor(footprintChain[2],"maxTicket");if(!ticketGetter||typeof ticketGetter.get!=="function"||ticketGetter.get!==methodValues[1]||ticketGetter.set!==undefined||Object.hasOwn(ticketGetter,"value"))bad();
const data=plain(own(this,"data")),metadata=plain(own(data,footprintUuid));
for(const key of ["isDelete","ticket","creator","createTime","modifier","updateTime","version","title","description","tags","source"]){const d=descriptor(metadata,key);if(d===undefined){if(key in metadata)bad();}else if(!Object.hasOwn(d,"value"))bad();}
const deleted=Object.getOwnPropertyDescriptor(metadata,"isDelete");if(deleted&&deleted.value!==undefined&&deleted.value!==false)bad();
const timerFunctions=()=>{let owner=globalThis;for(let depth=0;depth<4;depth++){
 const set=descriptor(owner,"setTimeout"),clear=descriptor(owner,"clearTimeout");
 if(set!==undefined||clear!==undefined){if(!set||!clear||!Object.hasOwn(set,"value")||!Object.hasOwn(clear,"value")||typeof set.value!=="function"||typeof clear.value!=="function")bad();return[set.value,clear.value];}
 owner=proto(owner);if(owner===null||owner===Object.prototype)bad();
}bad();};
const [set,clear]=timerFunctions();
let expired=false,timer;
const check=()=>{if(expired)bad();for(const [o,p]of prototypes)if(Object.getPrototypeOf(o)!==p)bad();for(const [o,k,d]of descriptors){const n=Object.getOwnPropertyDescriptor(o,k);if(d===undefined?n!==undefined:!n||d.enumerable!==n.enumerable||d.configurable!==n.configurable||d.writable!==n.writable||d.get!==n.get||d.set!==n.set||!Object.is(d.value,n.value)||Object.hasOwn(d,"value")!==Object.hasOwn(n,"value"))bad();}};
try{
 check();const deadline=new Promise((resolve,reject)=>{timer=Reflect.apply(set,globalThis,[()=>{expired=true;reject(new Error("CURRENT_FOOTPRINT_COPY_SOURCE_READ_DEADLINE"));},${CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.nativeTimeoutMs}]);});
 const read=async()=>{check();const raw=await Reflect.apply(getStr,this,[footprintUuid]);check();exact(raw,["success","result"]);if(own(raw,"success")!==true)bad();const content=own(raw,"result");if(typeof content!=="string"||content.length===0||content.length>${CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.contentBytes}||!content.isWellFormed()||new TextEncoder().encode(content).byteLength>${CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.contentBytes})bad();check();const encoded=JSON.stringify({schema:"easyeda-pro-control.current-footprint-copy-source-read.v1",identity:{projectUuid,branchUuid,windowTabId},footprintUuid,client,maximumTicket,capturedUser:"own-undefined",content,route:"native-get-str",sourceGetterDispatched:true,cacheEffectsPossible:true,executionAuthorized:false,persistenceVerified:false});if(new TextEncoder().encode(encoded).byteLength>${CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.contentBytes * 2 + 4096})bad();return encoded;};
 return await Promise.race([read(),deadline]);
}finally{if(timer!==undefined)Reflect.apply(clear,globalThis,[timer]);}
}`;

export function decodeCurrentFootprintCopySourceRead(raw: unknown): CurrentFootprintCopySourceReadSample {
  const value = sourceReply.parse(captureCurrentFootprintCopySourceReadReply(raw)).result.value;
  if (!value.isWellFormed() || Buffer.byteLength(value) > CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.contentBytes * 2 + 4096) {
    throw new Error("CURRENT_FOOTPRINT_COPY_SOURCE_READ_ENVELOPE");
  }
  return freezeDeep(sourceObservation.parse(JSON.parse(value)));
}
