/** Fixed descriptor-only Ke scope and already-created instance relations.
 * None constructs Ke, invokes an encoder/clock or grants a delete dispatch. */
import { CURRENT_FOOTPRINT_DELETE_CLOCK_SITES } from "./current-footprint-delete-clock-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_ENCODER_CLASSES as CLASSES, CURRENT_FOOTPRINT_INVERSE_DELETE_ENCODER_FIELDS as FIELDS } from "./current-footprint-inverse-delete-encoder-source.ts";

const helpers=String.raw`"use strict";const seen=[],parents=[],bad=()=>{throw new Error("FOOTPRINT_INVERSE_DELETE_ENCODER_BINDING");};
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();seen.push([o,k,d]);return d.value;};
const proto=o=>{const p=Object.getPrototypeOf(o);parents.push([o,p]);return p;};
const dense=(o,n)=>{if(!Array.isArray(o)||proto(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();for(let i=0;i<n;i++)own(o,String(i));};
const created=(o,k)=>{const value=own(o,k),d=seen[seen.length-1][2];if(!d.writable||!d.enumerable||!d.configurable)bad();return value;};
const verify=()=>{for(const[o,p]of parents)if(Object.getPrototypeOf(o)!==p)bad();for(const[o,k,d]of seen){const n=Object.getOwnPropertyDescriptor(o,k);if(!n||!Object.hasOwn(n,"value")||!Object.is(n.value,d.value)||n.writable!==d.writable||n.enumerable!==d.enumerable||n.configurable!==d.configurable)bad();}};
const ready=b=>{dense(b,4);const functions=own(b,"0"),state=own(b,"1"),guard=own(b,"2");dense(functions,28);dense(state,9);if(typeof guard!=="function"||guard()!==true||own(globalThis,"PROJECT")!==own(state,"0"))bad();return{functions,state};};`;
const names=CLASSES.map(row=>row.name);
const scope=`const b=ready(original),bindings=own(this,"object"),classes=Object.create(null);classes.Ke=own(b.functions,"11");
${FIELDS.map(row=>`classes[${JSON.stringify(row.constructor)}]=own(bindings,${JSON.stringify(row.constructor)});`).join("\n")}
classes.of=proto(classes.rl);classes.th=proto(classes.JR);classes.Fo=proto(classes.rN);
${CLASSES.map(row=>`{const c=classes[${JSON.stringify(row.name)}],parent=${row.parent===null?"Function.prototype":`classes[${JSON.stringify(row.parent)}]`};if(typeof c!=="function"||own(c,"name")!==${JSON.stringify(row.name)}||proto(c)!==parent||own(own(c,"prototype"),"constructor")!==c||proto(own(c,"prototype"))!==${row.parent===null?"Object.prototype":"own(parent,\"prototype\")"})bad();}`).join("\n")}
if(classes.rl!==own(b.functions,"12")||classes.of!==own(b.functions,"13"))bad();
const selected=[${names.map(name=>`classes[${JSON.stringify(name)}]`).join(",")}];if(new Set(selected).size!==18)bad();`;
const encoder=String.raw`dense(originalEncoder,19);const guard=own(originalEncoder,"18");if(typeof guard!=="function"||guard()!==true)bad();const classes=Object.create(null);`+names.map((name,index)=>`classes[${JSON.stringify(name)}]=own(originalEncoder,${JSON.stringify(String(index))});`).join("\n");
const entry=`const b=ready(original);${encoder}
dense(this,5);const manager=own(b.state,"2"),uuid=own(b.state,"7"),value=own(this,"2"),rows=own(this,"3");dense(rows,0);if(own(this,"0")!==manager||own(this,"1")!==uuid||own(this,"4")!==own(b.functions,"23")||proto(value)!==own(classes.Ke,"prototype"))bad();
const fields=${JSON.stringify(FIELDS.map(row=>row.field))};if(Reflect.ownKeys(value).length!==fields.length||Reflect.ownKeys(value).some((name,index)=>name!==fields[index]))bad();
${FIELDS.map(row=>`{const f=created(value,${JSON.stringify(row.field)});if(proto(f)!==own(classes[${JSON.stringify(row.constructor)}],"prototype")||Reflect.ownKeys(f).length!==1||Reflect.ownKeys(f)[0]!=="doctype"||created(f,"doctype")!==${JSON.stringify(row.docType)})bad();}`).join("\n")}
verify();return Object.freeze([original,originalEncoder,value,rows,()=>{verify();return true;}]);`;
export const CURRENT_FOOTPRINT_INVERSE_DELETE_ENCODER_PROGRAMS=freezeDeep({
 capture:`function(original){${helpers}${scope}verify();const guard=()=>{verify();return true;};return Object.freeze([...selected,guard]);}`,
 reprove:`function(original,originalEncoder){${helpers}${scope}dense(originalEncoder,19);for(let i=0;i<18;i++)if(own(originalEncoder,String(i))!==selected[i])bad();const guard=own(originalEncoder,"18");if(typeof guard!=="function"||guard()!==true)bad();verify();return true;}`,
 instance:`function(original,originalEncoder){${helpers}${entry}}`,
} as const);
/** N is still in its initializer TDZ at the entry point. The source-bound
 * before-clock frame deliberately captures r/i and omits n. */
export const CURRENT_FOOTPRINT_INVERSE_DELETE_ENCODER_ENTRY_EXPRESSION="[this,s,r,i,qe]";

export const CURRENT_FOOTPRINT_INVERSE_DELETE_ENCODER_ENTRY_SITE=Object.freeze({...CURRENT_FOOTPRINT_DELETE_CLOCK_SITES.entry,expression:CURRENT_FOOTPRINT_INVERSE_DELETE_ENCODER_ENTRY_EXPRESSION});
