/** Fixed Wire projections of the original idle action and watched monitors.
 * Shared action syntax is specialized only at its one model receiver; the
 * historical Text programs remain byte-exact. No application function runs. */
import { GENERATED_SCHEMATIC_DISPLAY_ACTION_PREFLIGHT_FUNCTION as IDLE, GENERATED_SCHEMATIC_DISPLAY_ACTION_PREFLIGHT_SAME_FUNCTION as SAME } from "./generated-schematic-display-action-program.ts";

function wire(source: string): string {
  const from = 'text=own(own(state,"before"),"text")';
  if (source.split(from).length !== 2 || source.split('own(text,"shapeManager")').length !== 2) { throw new Error("SCH209_WIRE_IDLE_SOURCE_ANCHOR"); }
  return source.replace(from, 'text=own(own(state,"before"),"line")');
}
const guard = `"use strict";const bad=()=>{throw new Error("SCH209_WIRE_INTENT");},own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;},dense=(a,n)=>{if(!Array.isArray(a)||Object.getPrototypeOf(a)!==Array.prototype||own(a,"length")!==n||Reflect.ownKeys(a).length!==n+1)bad();for(let i=0;i<n;i++)own(a,String(i));},json=v=>JSON.stringify(v,(_k,x)=>x&&typeof x==="object"&&!Array.isArray(x)?Object.fromEntries(Object.keys(x).sort().map(k=>[k,x[k]])):x);
const selected=(h,t,o)=>{dense(h,2);const b=own(h,"0"),s=own(h,"1");if(own(s,"owner")!==h||own(s,"identity")!==json({target:JSON.parse(t),operation:JSON.parse(o)})||own(s,"failed")!==false||own(s,"modifyAttempted")!==false||own(s,"saveAttempted")!==false||own(s,"modifyAcknowledged")!==false||own(own(s,"before"),"line")!==own(b,"line"))bad();return b;};
const monitors=b=>{const shapes=own(b,"shapes"),roots=[own(shapes,"modifyMonitor"),own(shapes,"bboxMonitor"),own(shapes,"attrWatcher")];if(own(own(b,"line"),"shapeManager")!==shapes||own(shapes,"docManager")!==own(b,"page")||new Set(roots).size!==3)bad();for(const root of roots)if(own(root,"shapeManager")!==shapes)bad();const functions=roots.map(root=>own(root,"onModelAttributeChange"));if(functions.some(fn=>typeof fn!=="function")||new Set(functions).size!==3)bad();return[...roots,...functions];};`;
export const CURRENT_SCHEMATIC_WIRE_INTENT_CALLS = Object.freeze({
  idle: `function(holder,t,o,noop){${guard}selected(holder,t,o);const values=Reflect.apply(${wire(IDLE)},holder,[JSON.parse(t),JSON.parse(o)]);if(values[17]!==noop)bad();return values;}`,
  idleSame: `function(holder,t,o,noop){${guard}selected(holder,t,o);if(own(this,"17")!==noop)bad();return Reflect.apply(${wire(SAME)},this,[holder,JSON.parse(t),JSON.parse(o)]);}`,
  monitors: `function(holder,t,o){${guard}return monitors(selected(holder,t,o));}`,
  monitorsSame: `function(holder,t,o){${guard}dense(this,6);const values=monitors(selected(holder,t,o));for(let i=0;i<6;i++)if(own(this,String(i))!==values[i])bad();return true;}`,
  scope: `function(holder,t,o){${guard}selected(holder,t,o);if(Reflect.ownKeys(this).length!==2)bad();const name=own(this,"description"),object=own(this,"object");if(!(name==="Block"||name==="Closure"||/^Closure \\([A-Za-z_$][\\w$]*\\)$/.test(name)))bad();const d=Object.getOwnPropertyDescriptor(object,"this");if(!d)return[false,undefined];if(!Object.hasOwn(d,"value"))bad();return[true,d.value];}`,
  closure0: `function(holder,t,o,receiver){${guard}if(receiver!==monitors(selected(holder,t,o))[0])bad();return true;}`,
  closure1: `function(holder,t,o,receiver){${guard}if(receiver!==monitors(selected(holder,t,o))[1])bad();return true;}`,
  closure2: `function(holder,t,o,receiver){${guard}if(receiver!==monitors(selected(holder,t,o))[2])bad();return true;}`,
});
