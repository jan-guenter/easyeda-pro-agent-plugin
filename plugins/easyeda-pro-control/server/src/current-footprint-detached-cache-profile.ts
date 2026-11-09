/** Exact dropped async cache-maintenance function in the pinned209 worker.
 * Its normal return follows every original put/delete await. Other producers
 * and head-index cache writes remain separate frontier obligations. */
export const CURRENT_FOOTPRINT_DETACHED_CACHE_GROUP = "easyeda-footprint-detached-cache-v1";
export const CURRENT_FOOTPRINT_DETACHED_CACHE_EXPRESSION = "[this,l,t,f]";
export const CURRENT_FOOTPRINT_HEAD_CACHE_EXPRESSION = "[this,t,s]";
// Primitive string reads only. Match both the normalized and relative index
// Suffix; the admission program separately binds the exact original branch.
const headSuffix = "index/v1/";
export const CURRENT_FOOTPRINT_HEAD_CACHE_CONDITION = `typeof t==="string"&&t.length>=41&&${Array.from(headSuffix, (character, index) => `t[t.length-${String(41 - index)}]===${JSON.stringify(character)}`).join("&&")}`;
export const CURRENT_FOOTPRINT_DETACHED_CACHE_SOURCE = Object.freeze({
  start: 2_024_218, end: 2_024_533, bytes: 315,
  sha256: "ad456d32d1566392b497d007ec7241c49ee7944d7dfeb54334cd0366cf14d1e0",
  callerStart: 2_023_529, callerEnd: 2_024_637,
  callerSha256: "965b45aee16e0c16b53780dbe79b3f48d3692c6f2826756483a5272ae0db520a",
});
export const CURRENT_FOOTPRINT_DETACHED_CACHE_SITES = Object.freeze({
  entry: Object.freeze({ lineNumber: 110, columnNumber: 10_024 }),
  returned: Object.freeze({ lineNumber: 110, columnNumber: 10_322 }),
  headEntry: Object.freeze({ lineNumber: 106, columnNumber: 55_920 }),
  headPromise: Object.freeze({ lineNumber: 106, columnNumber: 56_424 }),
  headSuccess: Object.freeze({ lineNumber: 106, columnNumber: 56_166 }),
  cacheRetry: Object.freeze({ lineNumber: 106, columnNumber: 56_176 }),
  historyRetry: Object.freeze({ lineNumber: 110, columnNumber: 9462 }),
});
const arm = 7, callsPerEntry = 2, entries = 8, framePerReturn = 1, headEntries = 2, resumesPerEntry = 2;
export const CURRENT_FOOTPRINT_DETACHED_CACHE_REQUESTS = Object.freeze({
  entries, headEntries, arm, normal: arm + entries * (callsPerEntry + framePerReturn + entries + resumesPerEntry) +
    headEntries * (3 + 5 + 4 + 1) + 2, cleanup: arm + 2,
});
const guards = String.raw`"use strict";const bad=()=>{throw new Error("FOOTPRINT_DETACHED_CACHE");};
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const tuple=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype||own(o,"length")!==4||Reflect.ownKeys(o).length!==5)bad();};
const valid=(v,p)=>{tuple(v);if(own(v,"0")!==p||own(globalThis,"PROJECT")!==p)bad();const batch=own(v,"1"),pending=own(v,"2"),response=own(v,"3");if(batch===null||Object.getPrototypeOf(batch)!==Object.prototype||Reflect.ownKeys(batch).length!==2||pending===null||Object.getPrototypeOf(pending)!==Map.prototype||Reflect.ownKeys(pending).length!==0)bad();for(const key of ["url","data"]){const a=own(batch,key);if(!Array.isArray(a)||Object.getPrototypeOf(a)!==Array.prototype||!Number.isSafeInteger(own(a,"length"))||a.length<1||a.length>65536||Reflect.ownKeys(a).length!==a.length+1)bad();}if(own(batch,"url").length!==own(batch,"data").length||own(response,"success")!==true||typeof own(response,"result")!=="string")bad();};`;
export const CURRENT_FOOTPRINT_DETACHED_CACHE_CALLS = Object.freeze({
  admit: `function(project){${guards}valid(this,project);return true;}`,
  matches: `function(project,original){${guards}valid(this,project);valid(original,project);for(let i=0;i<4;i++)if(own(this,String(i))!==own(original,String(i)))return false;return true;}`,
});
const headGuards = String.raw`"use strict";const bad=()=>{throw new Error("FOOTPRINT_HEAD_CACHE");};
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const valid=v=>{if(!Array.isArray(v)||Object.getPrototypeOf(v)!==Array.prototype||own(v,"length")!==3||Reflect.ownKeys(v).length!==4||own(globalThis,"PROJECT")!==project)bad();const wrapper=own(v,"0"),key=own(v,"1"),response=own(v,"2");if(wrapper!==own(project,"cache")||own(wrapper,"cacheName")!=="project_"+own(project,"uuid")+"_v6"||response===null||typeof response!=="object"||typeof key!=="string")bad();const branch=own(project,"_branchUuid");if(typeof branch!=="string"||branch.length!==32)bad();const suffix="index/v1/"+branch;if(key.length<suffix.length)bad();for(let i=0;i<suffix.length;i++)if(key[key.length-suffix.length+i]!==suffix[i])bad();};`;
export const CURRENT_FOOTPRINT_HEAD_CACHE_CALLS = Object.freeze({
  admit: `function(project){${headGuards}valid(this);return true;}`,
  matches: `function(project,original){${headGuards}valid(this);valid(original);return own(this,"0")===own(original,"0")&&own(this,"2")===own(original,"2");}`,
  retain: 'function(){"use strict";if(Object.getPrototypeOf(this)!==Promise.prototype)throw new Error("FOOTPRINT_HEAD_CACHE_PROMISE");return this;}',
  barrier: 'function(){"use strict";const d=Object.getOwnPropertyDescriptor(globalThis,"PROJECT");if(!d||!Object.hasOwn(d,"value")||d.value!==this)throw new Error("FOOTPRINT_HEAD_CACHE_BARRIER");return true;}',
});
