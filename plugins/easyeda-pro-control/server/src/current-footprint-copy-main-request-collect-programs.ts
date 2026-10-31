/** Fixed joins between the real driver invocation and its later context. These
 * selectors allocate only private arrays and never invoke an application API. */
import { freezeDeep } from "./sqlite-inventory-core.ts";

const helpers = String.raw`"use strict";const bad=()=>{throw new Error("FOOTPRINT_MAIN_REQUEST_INVOCATION");},seen=[];
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();seen.push([o,k,d]);return d.value;};
const array=(o,n)=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();for(let i=0;i<n;i++)own(o,String(i));};
const original=o=>{array(o,13);const s=own(o,"0");array(s,9);for(const[a,b]of[[0,3],[1,1],[2,2],[3,7],[4,8],[5,9],[6,10],[7,11],[8,12]])if(own(s,String(a))!==own(o,String(b)))bad();if(Object.getPrototypeOf(own(o,"1"))!==own(o,"4")||own(own(o,"1"),"cb")!==own(o,"6")||own(own(o,"4"),"interceptHttpProtocol")!==own(o,"5"))bad();};
const verify=()=>{for(const[o,k,d]of seen){const v=Object.getOwnPropertyDescriptor(o,k);if(!v||!Object.hasOwn(v,"value")||!Object.is(d.value,v.value)||d.enumerable!==v.enumerable||d.configurable!==v.configurable||d.writable!==v.writable)bad();}};`;
export const CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_INVOCATION_EXPRESSIONS = Object.freeze({
  driver: "[this,r,i]", driverCaller: "[this,s,a]",
} as const);
export const CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_INVOCATION_PROGRAMS = freezeDeep({
  invocation: `function(construction,caller){${helpers}\narray(this,3);array(caller,3);original(construction);const router=own(this,"0"),req=own(this,"1"),res=own(this,"2");if(own(caller,"0")!==own(construction,"1")||own(caller,"1")!==req||own(caller,"2")!==res)bad();verify();return[this,caller,construction,router,req,res];}`,
  contextJoin: `function(context){${helpers}\narray(this,6);array(context,6);const top=own(this,"0"),caller=own(this,"1"),construction=own(this,"2");array(top,3);array(caller,3);original(construction);if(own(context,"1")!==construction||own(context,"2")!==own(this,"3")||own(context,"3")!==own(this,"4")||own(context,"4")!==own(this,"5")||own(top,"0")!==own(this,"3")||own(top,"1")!==own(this,"4")||own(top,"2")!==own(this,"5")||own(caller,"0")!==own(construction,"1")||own(caller,"1")!==own(this,"4")||own(caller,"2")!==own(this,"5"))bad();verify();return true;}`,
});
