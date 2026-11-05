/** Exact dropped async cache-maintenance function in the pinned209 worker.
 * Its normal return follows every original put/delete await. Other producers
 * and head-index cache writes remain separate frontier obligations. */
export const CURRENT_FOOTPRINT_DETACHED_CACHE_GROUP = "easyeda-footprint-detached-cache-v1";
export const CURRENT_FOOTPRINT_DETACHED_CACHE_EXPRESSION = "[this,l,t,f]";
export const CURRENT_FOOTPRINT_DETACHED_CACHE_SOURCE = Object.freeze({
  start: 2_024_218, end: 2_024_533, bytes: 315,
  sha256: "ad456d32d1566392b497d007ec7241c49ee7944d7dfeb54334cd0366cf14d1e0",
  callerStart: 2_023_529, callerEnd: 2_024_637,
  callerSha256: "965b45aee16e0c16b53780dbe79b3f48d3692c6f2826756483a5272ae0db520a",
});
export const CURRENT_FOOTPRINT_DETACHED_CACHE_SITES = Object.freeze({
  entry: Object.freeze({ lineNumber: 110, columnNumber: 10_024 }),
  returned: Object.freeze({ lineNumber: 110, columnNumber: 10_322 }),
});
const arm = 2, callsPerEntry = 2, entries = 8, framePerReturn = 1, resumesPerEntry = 2;
export const CURRENT_FOOTPRINT_DETACHED_CACHE_REQUESTS = Object.freeze({
  entries, arm, normal: arm + entries * (callsPerEntry + framePerReturn + entries + resumesPerEntry), cleanup: 4,
});
const guards = String.raw`"use strict";const bad=()=>{throw new Error("FOOTPRINT_DETACHED_CACHE");};
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const tuple=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype||own(o,"length")!==4||Reflect.ownKeys(o).length!==5)bad();};
const valid=(v,p)=>{tuple(v);if(own(v,"0")!==p||own(globalThis,"PROJECT")!==p)bad();const batch=own(v,"1"),pending=own(v,"2"),response=own(v,"3");if(batch===null||Object.getPrototypeOf(batch)!==Object.prototype||Reflect.ownKeys(batch).length!==2||pending===null||Object.getPrototypeOf(pending)!==Map.prototype||Reflect.ownKeys(pending).length!==0)bad();for(const key of ["url","data"]){const a=own(batch,key);if(!Array.isArray(a)||Object.getPrototypeOf(a)!==Array.prototype||!Number.isSafeInteger(own(a,"length"))||a.length<1||a.length>65536||Reflect.ownKeys(a).length!==a.length+1)bad();}if(own(batch,"url").length!==own(batch,"data").length||own(response,"success")!==true||typeof own(response,"result")!=="string")bad();};`;
export const CURRENT_FOOTPRINT_DETACHED_CACHE_CALLS = Object.freeze({
  admit: `function(project){${guards}valid(this,project);return true;}`,
  matches: `function(project,original){${guards}valid(this,project);valid(original,project);for(let i=0;i<4;i++)if(own(this,String(i))!==own(original,String(i)))return false;return true;}`,
});
