/** Paused worker job data join only. Expected replyTopic must later come from
 * the genuine forwarded-job token; no clock, manager or task method runs. */
import { CURRENT_FOOTPRINT_INVERSE_DELETE_RPC_PROGRAMS as RPC } from "./current-footprint-inverse-delete-rpc-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const helpers=String.raw`"use strict";const bad=()=>{throw new Error("FOOTPRINT_INVERSE_DELETE_JOB_BINDING");};const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};const dense=(o,n)=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();for(let i=0;i<n;i++)own(o,String(i));};`;
export const CURRENT_FOOTPRINT_INVERSE_DELETE_JOB_EXPRESSION="[this,r,e,t,s,i,n]";
export const CURRENT_FOOTPRINT_INVERSE_DELETE_JOB_PROGRAMS=freezeDeep({
 capture:`function(prelude,link,bound,instance,expected){${helpers}dense(instance,5);dense(prelude,7);const original=own(prelude,"0"),instanceGuard=own(instance,"4");if(own(instance,"0")!==original||typeof instanceGuard!=="function"||instanceGuard()!==true)bad();const packet=Reflect.apply((${RPC.packet}),this,[prelude,link,bound,expected]);dense(packet,6);const packetGuard=own(packet,"5");if(typeof packetGuard!=="function"||packetGuard()!==true||instanceGuard()!==true)bad();return[packet,instance,()=>{if(own(packet,"5")!==packetGuard||own(instance,"4")!==instanceGuard||packetGuard()!==true||instanceGuard()!==true)bad();return true;}];}`,
 reprove:`function(){${helpers}dense(this,3);const packet=own(this,"0"),instance=own(this,"1"),guard=own(this,"2");dense(packet,6);dense(instance,5);if(typeof guard!=="function"||guard()!==true)bad();return true;}`,
}as const);
