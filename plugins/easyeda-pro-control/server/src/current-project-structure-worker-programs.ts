/** Fixed readonly programs for the separately pinned209 Nd/QA chain. These
 * programs have no registered native vocabulary or writer grant. No callback,
 * resolver, promise method, timer or project serializer is invoked. */
const GUARDS = `"use strict";
const bad=()=>{throw new Error("PROJECT_STRUCTURE_WORKER_READ");};
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const promise=p=>{if(p===null||typeof p!=="object"||Object.getPrototypeOf(p)!==Promise.prototype)bad();return p;};
const scope=o=>own(o,"object");`;
export const CURRENT_PROJECT_STRUCTURE_WORKER_CALLS = Object.freeze({
  retain: 'function(){"use strict";return this;}',
  /** Initial cold-project scope only. Nd keeps its latest arguments and QA
   * keeps its timer/resolver after completion, so later empty task2 snapshots
   * cannot pass this initial producer check. Nothing is invoked or cleared. */
  pristine: `function(upload,structure,debounce,parameters,uploadCallback,debounceCallback,structureCallback){${GUARDS}if(own(globalThis,"PROJECT")!==this)bad();const u=scope(upload),s=scope(structure),d=scope(debounce),p=scope(parameters);for(const [v,callback]of [[u,uploadCallback],[s,debounceCallback]])if(own(v,"e")!==callback||own(v,"t")!==null||own(v,"s")!==null||own(v,"r")!==undefined)bad();if(own(p,"e")!==structureCallback||own(p,"t")!==300||own(p,"s")!==false||own(d,"r")!==undefined||own(d,"i")!==null)bad();if(Reflect.apply(Object.getOwnPropertyDescriptor(Set.prototype,"size").get,own(this,"task2"),[])!==0)bad();return true;}`,
  serial: `function(callback){${GUARDS}const s=scope(this);if(own(s,"e")!==callback||own(s,"s")!==null)bad();return [promise(own(s,"t")),own(s,"r")];}`,
  debounce: `function(parameters,callback){${GUARDS}const p=scope(parameters),s=scope(this);if(own(p,"e")!==callback||own(p,"t")!==300||own(p,"s")!==false)bad();const timer=own(s,"r"),resolver=own(s,"i");if(!Number.isSafeInteger(timer)||timer<1||typeof resolver!=="function")bad();return [timer,resolver];}`,
  callbackKind: `function(upload,debounce){${GUARDS}const e=own(this,"e");return e===upload?"upload":e===debounce?"structure":"other";}`,
  packet: `function(project,task){${GUARDS}if(own(globalThis,"PROJECT")!==project||Object.getPrototypeOf(task)!==Promise.prototype||!Set.prototype.has.call(own(project,"task2"),task))bad();if(own(this,"uuid")!==own(project,"uuid")||own(this,"branch_uuid")!==own(project,"_branchUuid"))bad();const ticket=own(this,"ticket");if(!Number.isSafeInteger(ticket)||ticket<0||Object.is(ticket,-0))bad();return [own(this,"datas"),own(project,"task2")];}`,
  taskSet: `function(){${GUARDS}return own(this,"task2");}`,
  data: `function(){${GUARDS}return own(this,"datas");}`,
  taskRemoved: `function(task,taskSet){${GUARDS}if(own(globalThis,"PROJECT")!==this||own(this,"task2")!==taskSet||Set.prototype.has.call(taskSet,task))bad();return true;}`,
  same: 'function(other){"use strict";return this===other;}',
  /** Clone own data only before JSON serialization. The original packet and
   * datas objects remain separately retained; this text is comparison data. */
  packetText: `function(){${GUARDS}
if(Object.getOwnPropertyDescriptor(Object.prototype,"toJSON")!==undefined||Object.getOwnPropertyDescriptor(Array.prototype,"toJSON")!==undefined)bad();
let nodes=0;const seen=[];const clone=(v,depth)=>{if(++nodes>65536||depth>32)bad();if(v===null||typeof v==="boolean")return v;if(typeof v==="string"){if(!v.isWellFormed()||v.length>2097152)bad();return v;}if(typeof v==="number"){if(!Number.isFinite(v)||Object.is(v,-0))bad();return v;}if(typeof v!=="object"||seen.includes(v))bad();seen.push(v);const a=Array.isArray(v),p=Object.getPrototypeOf(v);if(a?p!==Array.prototype:p!==Object.prototype&&p!==null)bad();const keys=Reflect.ownKeys(v);if(keys.length>16384||keys.some(k=>typeof k!=="string"))bad();const out=a?[]:Object.create(null);for(const k of keys){if(a&&k==="length")continue;if(a&&k!==String(out.length))bad();out[k]=clone(own(v,k),depth+1);}seen.pop();return out;};
const keys=Reflect.ownKeys(this);if(keys.length!==4||!["uuid","branch_uuid","ticket","datas"].every(k=>keys.includes(k)))bad();const packet=clone(this,0),structureText=JSON.stringify(packet.datas);if(structureText.length>2097152)bad();return {projectUuid:packet.uuid,branchUuid:packet.branch_uuid,ticket:packet.ticket,structureText};}`,
  success: `function(){${GUARDS}return own(this,"success")===true;}`,
});
