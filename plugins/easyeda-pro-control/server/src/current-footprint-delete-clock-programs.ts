/** Fixed inverse entry/post-await relations. These call no application method,
 * clock, RPC task, serializer, getter, upload or delete operation. */
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_CALLS as RPC } from "./current-footprint-copy-clock-rpc-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_DELETE_CLOCK_GROUP = "easyeda-footprint-delete-clock-v1";
const helpers = String.raw`"use strict";const seen=[],bad=()=>{throw new Error("FOOTPRINT_DELETE_CLOCK_RELATION");};
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();seen.push([o,k,d]);return d.value;};
const array=(o,n)=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();for(let i=0;i<n;i++)own(o,String(i));};
const integer=(v,positive=false)=>{if(typeof v!=="number"||!Number.isSafeInteger(v)||Object.is(v,-0)||v<(positive?1:0)||v>=Number.MAX_SAFE_INTEGER)bad();return v;};
const text=(v,re)=>{if(typeof v!=="string"||re.exec(v)?.[0]!==v)bad();return v;};
const version=()=>{const d=Object.getOwnPropertyDescriptor(globalThis,"PRO_EDITOR_VERSION");if(d===undefined)return[false,undefined];if(!Object.hasOwn(d,"value")||d.value!==undefined&&(typeof d.value!=="string"||d.value.length<1||d.value.length>64||!d.value.isWellFormed()))bad();seen.push([globalThis,"PRO_EDITOR_VERSION",d]);return[true,d.value];};
const expected=e=>{if(e===null||typeof e!=="object"||Object.getPrototypeOf(e)!==Object.prototype||Reflect.ownKeys(e).length!==5)bad();return{projectUuid:text(own(e,"projectUuid"),/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/),branchUuid:text(own(e,"branchUuid"),/^[a-f0-9]{32}$/),targetUuid:text(own(e,"targetUuid"),/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/),client:text(own(e,"client"),/^[a-f0-9]{16}$/),maximumTicket:integer(own(e,"maximumTicket"))};};
const selected=(w,e)=>{array(w,16);const project=own(w,"0"),manager=own(w,"2"),clock=own(w,"3"),consistency=own(project,"consistencyManager");if(own(globalThis,"PROJECT")!==project||own(project,"footprint")!==manager||own(manager,"projectManager")!==project||own(manager,"user")!==undefined||own(project,"uuid")!==e.projectUuid||own(project,"_branchUuid")!==e.branchUuid||own(manager,"client")!==e.client||own(consistency,"client")!==e.client||own(consistency,"maxTicket")!==e.maximumTicket||typeof clock!=="function")bad();return{project,manager,clock,consistency};};
const verify=()=>{for(const[o,k,d]of seen){const n=Object.getOwnPropertyDescriptor(o,k);if(!n||!Object.hasOwn(n,"value")||!Object.is(n.value,d.value)||n.writable!==d.writable||n.enumerable!==d.enumerable||n.configurable!==d.configurable)bad();}};`;
export const CURRENT_FOOTPRINT_DELETE_CLOCK_CALLS = freezeDeep({
  worker: RPC.worker, ui: RPC.ui, push: RPC.push, dispatch: RPC.dispatch, result: RPC.result, reply: RPC.reply,
  entry: { arguments: 3, program: `function(original,caller,expectedInput){${helpers}
array(this,3);array(caller,2);const e=expected(expectedInput),s=selected(original,e),edit=version();if(own(caller,"0")!==s.manager||own(caller,"1")!==e.targetUuid||own(this,"0")!==s.manager||own(this,"1")!==e.targetUuid||own(this,"2")!==s.clock)bad();verify();return[original,s.manager,e.targetUuid,s.clock,Object.freeze(e),s.consistency,edit[0],edit[1]];}` },
  producer: { arguments: 3, program: `function(entry,push,expectedValue){${helpers}
array(this,4);array(entry,8);array(push,9);if(expectedValue===null||typeof expectedValue!=="object"||Object.getPrototypeOf(expectedValue)!==Object.prototype||Reflect.ownKeys(expectedValue).length!==1)bad();
const e=expected(own(entry,"4")),w=own(entry,"0"),s=selected(w,e),value=integer(own(this,"2"),true),edit=version();if(own(entry,"1")!==s.manager||own(entry,"2")!==e.targetUuid||own(entry,"3")!==s.clock||own(entry,"5")!==s.consistency||own(entry,"6")!==edit[0]||own(entry,"7")!==edit[1]||own(this,"0")!==s.manager||own(this,"1")!==e.targetUuid||own(this,"3")!==s.clock||value!==own(expectedValue,"value")||value>8640000000000000||own(push,"0")!==w||own(push,"1")!==own(w,"1"))bad();
const pending=own(push,"5");if(own(pending,"unsafe")!==true||own(pending,"isRunning")!==false||own(pending,"callback")!==null)bad();verify();return[entry,push,e.targetUuid,value];}` },
} as const);
