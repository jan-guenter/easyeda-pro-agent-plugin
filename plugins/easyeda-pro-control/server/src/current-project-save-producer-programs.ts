/** Fixed original receiver joins. These programs invoke no application method,
 * resolver, timer, cache operation, RPC, serializer or producer continuation. */
import { CURRENT_PROJECT_SAVE_PRODUCER_SITES as SITES } from "./current-project-save-producer-source.ts";
import type { CurrentProjectSaveProducerRole } from "./current-project-save-producer-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const guards = String.raw`"use strict";const bad=()=>{throw new Error("PROJECT_SAVE_PRODUCER_RECEIVER");},seen=[];
const own=(value,key)=>{if(value===null||(typeof value!=="object"&&typeof value!=="function"))bad();const d=Object.getOwnPropertyDescriptor(value,key);if(!d||!Object.hasOwn(d,"value"))bad();seen.push([value,key,d]);return d.value;};
const array=(value,length)=>{if(!Array.isArray(value)||Object.getPrototypeOf(value)!==Array.prototype||own(value,"length")!==length||Reflect.ownKeys(value).length!==length+1)bad();for(let index=0;index<length;index++)own(value,String(index));};
const verify=()=>{for(const[value,key,d]of seen){const next=Object.getOwnPropertyDescriptor(value,key);if(!next||!Object.hasOwn(next,"value")||!Object.is(next.value,d.value)||next.writable!==d.writable||next.enumerable!==d.enumerable||next.configurable!==d.configurable)bad();}};
const selected=(project,wrapper,callback)=>{if(own(globalThis,"PROJECT")!==project||own(project,"bufferedUploadCloud")!==wrapper||typeof wrapper!=="function"||typeof callback!=="function")bad();};`;
function join(role: CurrentProjectSaveProducerRole): string {
  if (role === "bufferIngress" || role === "bufferScheduled") { return 'if(own(this,"4")!==project||own(this,"5")!==callback||own(this,"6")!==500)bad();'; }
  if (role === "bufferDrain" || role === "bufferDone") { return 'if(own(this,"0")!==project||own(this,"1")!==callback||own(this,"2")!==500)bad();'; }
  if (role === "headEntry" || role === "headPromise" || role === "headSuccess" || role === "cacheFailed") { return 'const c=own(this,"0");if(c!==own(project,"cache")&&c!==own(project,"localCache"))bad();'; }
  return 'if(own(this,"0")!==project)bad();';
}
const calls = Object.fromEntries(
  Object.entries(SITES).map(([name, site]) => {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Entries enumerate this fixed own-data source roster, whose keys define the role type.
    const role = name as CurrentProjectSaveProducerRole;
    return [role, `function(project,wrapper,callback){${guards}array(this,${String(site.length)});selected(project,wrapper,callback);${join(role)}verify();return this;}`];
  })
);
// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Each entry is constructed once from the exact complete fixed role roster above.
export const CURRENT_PROJECT_SAVE_PRODUCER_RECEIVER_CALLS = freezeDeep(calls) as Readonly<Record<CurrentProjectSaveProducerRole, string>>;
