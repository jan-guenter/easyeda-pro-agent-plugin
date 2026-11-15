/** One source-qualified readonly native branch GET. Only the invocation
 * calls an app method; observations and serialization invoke no getters. */
import { CURRENT_PCB_VIA_POST_HISTORY_SYNC_CALLEES } from "./current-pcb-via-post-history-sync-source.ts";
import { CURRENT_GENERATED_INITIAL_BRANCH_API_FIELDS as FIELDS } from "./current-generated-initial-branch-source.ts";

const profile = CURRENT_PCB_VIA_POST_HISTORY_SYNC_CALLEES.find(row => row.name === "getLastHistoryUuid");
if (profile === undefined || profile.arity !== 1 || !profile.async || profile.bytes !== 95) { throw new Error("FORWARD_BRANCH_QUERY_METHOD_SOURCE"); }
export const CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_QUERY_CALLEE = profile;
const helpers = String.raw`"use strict";const bad=()=>{throw new Error("FORWARD_BRANCH_QUERY_ORIGINAL");},seen=[],parents=[];
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();seen.push([o,k,d]);return d.value;};
const proto=o=>{const p=Object.getPrototypeOf(o);parents.push([o,p]);return p;};
const array=(o,n)=>{if(!Array.isArray(o)||proto(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();for(let j=0;j<n;j++)own(o,String(j));};
const verify=()=>{for(const[o,p]of parents)if(Object.getPrototypeOf(o)!==p)bad();for(const[o,k,d]of seen){const q=Object.getOwnPropertyDescriptor(o,k);if(!q||!Object.hasOwn(q,"value")||q.value!==d.value||q.writable!==d.writable||q.enumerable!==d.enumerable||q.configurable!==d.configurable)bad();}};
`;
export const CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_QUERY_CAPTURE = `function(branch){${helpers}
const p=this;if(own(globalThis,"PROJECT")!==p||own(p,"_branchUuid")!==branch||typeof branch!=="string"||!/^[a-f0-9]{32}$/.test(branch))bad();
const lg=proto(p),gd=proto(lg);if(proto(gd)!==Object.prototype)bad();
for(const[o,name]of [[lg,"Lg"],[gd,"Gd"]]){const c=own(o,"constructor");if(typeof c!=="function"||own(c,"name")!==name||own(c,"prototype")!==o)bad();}
for(const o of[p,lg])if(Object.getOwnPropertyDescriptor(o,"getLastHistoryUuid"))bad();const descriptor=Object.getOwnPropertyDescriptor(gd,"getLastHistoryUuid");
if(!descriptor||!Object.hasOwn(descriptor,"value")||descriptor.writable!==true||descriptor.enumerable!==false||descriptor.configurable!==true)bad();
const method=own(gd,"getLastHistoryUuid");if(typeof method!=="function"||own(method,"name")!=="getLastHistoryUuid"||own(method,"length")!==1||Function.prototype.toString.call(method)!==${JSON.stringify(profile.source)})bad();
for(const[o,k]of [[Object,"getOwnPropertyDescriptor"],[Object,"getPrototypeOf"],[Object,"hasOwn"],[Reflect,"ownKeys"],[Reflect,"apply"],[Function.prototype,"toString"],[Array,"isArray"],[JSON,"stringify"]])own(o,k);
const guard=()=>{if(own(globalThis,"PROJECT")!==p||own(p,"_branchUuid")!==branch||Object.getOwnPropertyDescriptor(p,"getLastHistoryUuid")||Object.getOwnPropertyDescriptor(lg,"getLastHistoryUuid"))bad();verify();return true;};guard();return[p,method,guard];}`;
export const CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_QUERY_INVOKE = `async function(branch){${helpers}
array(this,3);const p=own(this,"0"),method=own(this,"1"),guard=own(this,"2");
if(typeof guard!=="function"||typeof method!=="function"||Reflect.apply(guard,undefined,[])!==true||own(globalThis,"PROJECT")!==p||own(p,"_branchUuid")!==branch)bad();
const original=Reflect.apply(method,p,[branch]);if(Object.getPrototypeOf(original)!==Promise.prototype)bad();const reply=await original;
if(Reflect.apply(guard,undefined,[])!==true||Object.getPrototypeOf(reply)!==Object.prototype||Reflect.ownKeys(reply).length!==2||own(reply,"success")!==true)bad();
const row=own(reply,"result"),fields=${JSON.stringify(FIELDS)};if(Object.getPrototypeOf(row)!==Object.prototype||Reflect.ownKeys(row).length!==fields.length)bad();
const result=Object.create(null);for(let j=0;j<fields.length;j++){const key=fields[j];if(Reflect.ownKeys(row)[j]!==key)bad();const value=own(row,key);if(value!==null&&!["string","number","boolean"].includes(typeof value)||typeof value==="number"&&!Number.isFinite(value)||typeof value==="string"&&!value.isWellFormed())bad();result[key]=value;}
if(own(row,"uuid")!==branch||own(row,"project_uuid")!==own(p,"uuid"))bad();const body=JSON.stringify(result);if(body.length>4096)bad();verify();if(Reflect.apply(guard,undefined,[])!==true)bad();return body;}`;
