/** Fixed read-only projections. No callback, timer, resolver, Promise method,
 * serializer method or SQL service is invoked by these programs. */
import { CURRENT_PROJECT_STRUCTURE_WORKER_CALLS } from "./current-project-structure-worker-programs.ts";

const GUARD = `"use strict";const bad=()=>{throw new Error("PROJECT_SAVE_STRUCTURE_READ");};const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};`;
export const CURRENT_PROJECT_SAVE_STRUCTURE_CALLS = Object.freeze({
  ...CURRENT_PROJECT_STRUCTURE_WORKER_CALLS,
  bootstrap: `function(){${GUARD}if(!Array.isArray(this)||Object.getPrototypeOf(this)!==Array.prototype||own(this,"length")!==2||Reflect.ownKeys(this).length!==3)bad();const p=own(this,"0"),bus=own(this,"1");if(own(globalThis,"PROJECT")!==p||own(p,"wsBus")!==bus||Reflect.apply(Object.getOwnPropertyDescriptor(Set.prototype,"size").get,own(p,"task2"),[])!==0)bad();const u=own(p,"uploadStructure"),s=own(p,"structure");if(typeof u!=="function"||typeof s!=="function"||u===s)bad();return[p,u,s];}`,
  callback: `function(){${GUARD}const e=own(own(this,"object"),"e");if(typeof e!=="function")bad();return e;}`,
  taskExclusive: `function(task,taskSet){${GUARD}if(own(globalThis,"PROJECT")!==this||own(this,"task2")!==taskSet||Reflect.apply(Object.getOwnPropertyDescriptor(Set.prototype,"size").get,taskSet,[])!==1||!Set.prototype.has.call(taskSet,task))bad();return true;}`,
  taskRemoved: `function(task,taskSet){${GUARD}if(own(globalThis,"PROJECT")!==this||own(this,"task2")!==taskSet||Set.prototype.has.call(taskSet,task)||Reflect.apply(Object.getOwnPropertyDescriptor(Set.prototype,"size").get,taskSet,[])!==0)bad();return true;}`,
});
