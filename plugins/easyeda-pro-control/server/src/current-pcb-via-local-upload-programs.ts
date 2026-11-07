/** Original Save body -> local put -> buffered timer scheduling. These fixed
 * proofs invoke no app/Cache/Response/timer/resolver or serialization method. */
import { CURRENT_GENERATED_INITIAL_CACHE_PROGRAMS as CACHE } from "./current-generated-initial-cache-programs.ts";

const guards = String.raw`"use strict";const bad=()=>{throw Error("VIA_LOCAL_ORIGINAL");},seen=[];
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();seen.push([o,k,d]);return d.value;};
const array=(o,n)=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();for(let i=0;i<n;i++)own(o,String(i));};
const verify=()=>{for(const[o,k,d]of seen){const q=Object.getOwnPropertyDescriptor(o,k);if(!q||!Object.hasOwn(q,"value")||!Object.is(q.value,d.value)||q.writable!==d.writable||q.enumerable!==d.enumerable||q.configurable!==d.configurable)bad();}};
const body=b=>{array(b,6);const p=own(b,"0");if(own(globalThis,"PROJECT")!==p||own(p,"consistencyManager")!==own(b,"2")||typeof own(b,"5")!=="string")bad();return p;};
const local=(a,b)=>{array(a,4);const p=body(b),t=own(a,"1");array(t,1);if(own(a,"0")!==p||own(t,"0")!==own(b,"5")||own(a,"2")!==false||own(a,"3")!==undefined)bad();return p;};
const buffer=(a,p,b,key)=>{array(a,9);const l=own(a,"0");if(Object.getPrototypeOf(l)!==Object.prototype||Reflect.ownKeys(l).length!==2||own(l,"dataStr")!==own(b,"5")||own(l,"dataUrl")!==key||own(a,"4")!==p||typeof own(a,"5")!=="function"||own(a,"6")!==500||typeof own(a,"7")!=="function"||typeof own(a,"8")!=="function")bad();};`;
export const CURRENT_PCB_VIA_LOCAL_UPLOAD_PROGRAMS = Object.freeze({
  localIngress: `function(originalBody){${guards}local(this,originalBody);verify();return true;}`,
  headEntry: `function(key,text){return Reflect.apply((${CACHE.document}),this,[key,text]);}`,
  headPromise: CACHE.promise,
  headSuccess: CACHE.success,
  bufferIngress: `function(originalLocal,originalBody,cache){${guards}const p=local(originalLocal,originalBody);array(cache,10);const key=own(cache,"6");if(own(cache,"7")!==own(originalBody,"5")||own(cache,"2")!==own(p,"localCache"))bad();buffer(this,p,originalBody,key);if(own(this,"1")!==null||own(this,"2")!==null||own(this,"3")!==null)bad();verify();return true;}`,
  bufferScheduled: `function(originalIngress,originalBody,cache){${guards}const p=body(originalBody);array(cache,10);buffer(this,p,originalBody,own(cache,"6"));array(originalIngress,9);for(const i of [0,4,5,6,7,8])if(own(this,String(i))!==own(originalIngress,String(i)))bad();if(!Number.isSafeInteger(own(this,"1"))||own(this,"1")<1||own(this,"2")===null||typeof own(this,"2")!=="object"||Object.getPrototypeOf(own(this,"2"))!==Promise.prototype||typeof own(this,"3")!=="function")bad();verify();return true;}`,
  localReturned: `function(originalLocal,originalBody,scheduled){${guards}local(originalLocal,originalBody);array(this,5);for(let i=0;i<4;i++)if(own(this,String(i))!==own(originalLocal,String(i)))bad();array(scheduled,9);if(own(this,"4")!==own(originalBody,"5")||own(scheduled,"4")!==own(this,"0"))bad();verify();return true;}`,
});
