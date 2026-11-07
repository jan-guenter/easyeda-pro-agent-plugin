/** Fixed before-qe joins. The existing instance checker is embedded unchanged;
 * neither it nor this wrapper constructs Ke or calls an app method. */
import { CURRENT_FOOTPRINT_INVERSE_DELETE_ENCODER_PROGRAMS as ENCODER } from "./current-footprint-inverse-delete-encoder-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const helpers=String.raw`"use strict";const bad=()=>{throw new Error("FOOTPRINT_INVERSE_DELETE_ENTRY_BINDING");};
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const dense=(o,n)=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();for(let i=0;i<n;i++)own(o,String(i));};`;
export { CURRENT_FOOTPRINT_INVERSE_DELETE_ENCODER_ENTRY_EXPRESSION as CURRENT_FOOTPRINT_INVERSE_DELETE_ENTRY_EXPRESSION, CURRENT_FOOTPRINT_INVERSE_DELETE_ENCODER_ENTRY_SITE as CURRENT_FOOTPRINT_INVERSE_DELETE_ENTRY_SITE } from "./current-footprint-inverse-delete-encoder-programs.ts";
export const CURRENT_FOOTPRINT_INVERSE_DELETE_ENTRY_PROGRAMS=freezeDeep({
 capture:`function(original,originalEncoder,originalClock){${helpers}dense(originalClock,9);if(own(originalClock,"0")!==original)bad();const clockGuard=own(originalClock,"8");if(typeof clockGuard!=="function"||clockGuard()!==true)bad();const instance=Reflect.apply((${ENCODER.instance}),this,[original,originalEncoder]);dense(instance,5);const instanceGuard=own(instance,"4");if(typeof instanceGuard!=="function"||instanceGuard()!==true||clockGuard()!==true)bad();return[instance,originalClock,()=>{if(own(instance,"4")!==instanceGuard||own(originalClock,"8")!==clockGuard||instanceGuard()!==true||clockGuard()!==true)bad();return true;}];}`,
 reprove:`function(){${helpers}dense(this,3);const instance=own(this,"0"),clock=own(this,"1"),guard=own(this,"2");dense(instance,5);dense(clock,9);if(own(instance,"0")!==own(clock,"0")||typeof guard!=="function"||guard()!==true)bad();return true;}`,
}as const);
