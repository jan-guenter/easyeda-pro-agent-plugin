/** Fixed readonly namespace observation before the original project script
 * runs. Native metadata qualification and fresh worker custody belong to the
 * future readback birth; these programs and their replies issue no authority. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_GENERATED_PROJECT_REOPEN_CACHE_GROUP = "easyeda-generated-reopen-cache-v1";
export const CURRENT_GENERATED_PROJECT_REOPEN_CACHE_REQUESTS = Object.freeze({ capture: 1, capturedReferences: 1, nativeMetadata: 3,
  bind: 1, boundReferences: 1, absent: 1, normal: 8, release: 1, total: 9 });
export const CURRENT_GENERATED_PROJECT_REOPEN_CACHE_NATIVE_PROFILES = freezeDeep([
  { index: 1, name: "CacheStorage", arity: 0, constructor: true },
  { index: 4, name: "get caches", arity: 0, constructor: false },
  { index: 5, name: "keys", arity: 0, constructor: false },
] as const);
const helpers = String.raw`"use strict";const bad=()=>{throw new Error("GENERATED_REOPEN_CACHE");};
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const array=(o,n)=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();};
const absent=()=>{if(Object.getOwnPropertyDescriptor(globalThis,"PROJECT")!==undefined)bad();};
const objects=()=>{absent();const ctor=own(globalThis,"CacheStorage"),p=own(ctor,"prototype");if(typeof ctor!=="function"||own(p,"constructor")!==ctor||Object.getPrototypeOf(p)!==Object.prototype)bad();
const d=Object.getOwnPropertyDescriptor(p,"keys");if(!d||!Object.hasOwn(d,"value")||typeof d.value!=="function"||d.writable!==true||d.configurable!==true||d.enumerable!==true)bad();
let owner=globalThis,getter=null;for(let i=0;i<6&&owner!==null;i++){const a=Object.getOwnPropertyDescriptor(owner,"caches");if(a!==undefined){if(Object.hasOwn(a,"value")||typeof a.get!=="function"||a.set!==undefined||a.enumerable!==true||a.configurable!==true)bad();getter=a.get;break;}owner=Object.getPrototypeOf(owner);}if(getter===null)bad();
return[globalThis,ctor,p,owner,getter,d.value,Array.prototype];};
const bound=(original,n)=>{array(original,n);const values=objects();for(let i=0;i<7;i++)if(own(original,String(i))!==values[i])bad();if(n===8){const storage=own(original,"7");if(Object.getPrototypeOf(storage)!==values[2]||Reflect.ownKeys(storage).length!==0||Reflect.apply(values[4],globalThis,[])!==storage)bad();}return values;};`;
export const CURRENT_GENERATED_PROJECT_REOPEN_CACHE_CALLS = freezeDeep({
  capture: { program: `function(){${helpers}return objects();}`, arguments: 0, returnByValue: false, awaitPromise: false },
  /** Only after the three actual function references have passed original
   * native metadata/scope qualification; a caller's name/description is not it. */
  bind: { program: `function(){${helpers}const values=bound(this,7),storage=Reflect.apply(values[4],globalThis,[]);if(Object.getPrototypeOf(storage)!==values[2]||Reflect.ownKeys(storage).length!==0)bad();bound(this,7);return[...values,storage];}`, arguments: 0, returnByValue: false, awaitPromise: false },
  absent: { program: `async function(projectUuid){${helpers}
if(typeof projectUuid!=="string"||!/^[a-f0-9]{64}$/.test(projectUuid))bad();const values=bound(this,8),storage=own(this,"7");
const names=await Reflect.apply(values[5],storage,[]);bound(this,8);
if(!Array.isArray(names)||Object.getPrototypeOf(names)!==values[6])bad();const length=own(names,"length");if(!Number.isInteger(length)||length<0||length>4096||Reflect.ownKeys(names).length!==length+1)bad();
let total=0;for(let i=0;i<length;i++){const name=own(names,String(i));if(typeof name!=="string"||name.length>8192||(total+=name.length)>4194304||name==="project_"+projectUuid+"_v6"||name==="localProject_"+projectUuid+"_v1")bad();}
bound(this,8);return{schema:"private.generated-project-reopen-cache-absence.v1",cacheNamesExamined:length,projectNamespaceAbsent:true,pendingNamespaceAbsent:true,cacheMethodsMutated:false,projectScriptStarted:false,executionAuthorized:false};}`, arguments: 1, returnByValue: true, awaitPromise: true },
});

const observationSchema = z.strictObject({ schema: z.literal("private.generated-project-reopen-cache-absence.v1"),
  cacheNamesExamined: z.number().int().min(0).max(4096).refine(value => !Object.is(value, -0)),
  projectNamespaceAbsent: z.literal(true), pendingNamespaceAbsent: z.literal(true), cacheMethodsMutated: z.literal(false),
  projectScriptStarted: z.literal(false), executionAuthorized: z.literal(false) });
export type CurrentGeneratedProjectReopenCacheAbsence = Readonly<z.infer<typeof observationSchema>>;
/** A strict captured reply is still data only. It is not a fresh owner token,
 * a continuous exclusion guarantee or an observed native loading completion. */
export function decodeCurrentGeneratedProjectReopenCacheAbsence(input: unknown): CurrentGeneratedProjectReopenCacheAbsence {
  return Object.freeze(observationSchema.parse(captureCurrentPcbStringClockReply(input).value));
}
