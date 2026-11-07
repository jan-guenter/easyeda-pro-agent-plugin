/** Descriptor-only original Save-frame joins. These fixed programs invoke no
 * application method, timer, resolver, RPC, compressor, serializer or Save. */
import { CURRENT_PCB_VIA_SAVE_METHOD_SOURCE } from "./current-pcb-via-save-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_PROJECT_CANVAS_ACCESSOR_REPROOF, CURRENT_PROJECT_CANVAS_FORMAT_GUARD, CURRENT_PROJECT_CANVAS_PENDING_CAPTURE } from "./current-project-canvas-pending-programs.ts";

export const CURRENT_PCB_VIA_SAVE_GROUP = "easyeda-pro-control-pcb-via-save-v1";
/** Shared readonly descriptor reproof. Embedding this text issues no origin. */
export const CURRENT_PCB_VIA_SAVE_RETAINED_GUARDS = String.raw`"use strict";const bad=()=>{throw new Error("PCB_VIA_SAVE_RELATION");},seen=[],parents=[],accessors=[];
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();seen.push([o,k,d]);return d.value;};
const array=(o,n)=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();for(let i=0;i<n;i++)own(o,String(i));};
const text=(v,max)=>{if(typeof v!=="string"||v.length<1||v.length>max||!v.isWellFormed()||/[\u0000-\u001F\u007F]/.test(v))bad();return v;};
const integer=(v,min,max)=>{if(typeof v!=="number"||!Number.isSafeInteger(v)||Object.is(v,-0)||v<min||v>max)bad();return v;};
const method=(o,k)=>{for(let n=0;n<4;n++){if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(d){if(!Object.hasOwn(d,"value")||typeof d.value!=="function")bad();seen.push([o,k,d]);return d.value;}const p=Object.getPrototypeOf(o);parents.push([o,p]);o=p;}bad();};
${CURRENT_PROJECT_CANVAS_FORMAT_GUARD}
${CURRENT_PROJECT_CANVAS_PENDING_CAPTURE}
const verify=()=>{for(const[o,k,d]of seen){const v=Object.getOwnPropertyDescriptor(o,k);if(!v||!Object.hasOwn(v,"value")||!Object.is(v.value,d.value)||v.writable!==d.writable||v.enumerable!==d.enumerable||v.configurable!==d.configurable)bad();}for(const[o,p]of parents)if(Object.getPrototypeOf(o)!==p)bad();${CURRENT_PROJECT_CANVAS_ACCESSOR_REPROOF}reprovePendingMissing();};
const selected=(project,arg,r,documentUuid,projectUuid)=>{projectFormat(project);if(own(globalThis,"PROJECT")!==project||own(project,"consistencyManager")!==r||own(project,"uuid")!==projectUuid||own(project,"isReady")!==true||own(project,"isHistoryBack")!==false||own(arg,"uuid")!==documentUuid||own(arg,"path")!==projectUuid)bad();const docs=own(arg,"docIds");array(docs,3);if(own(docs,"0")!==documentUuid||own(docs,"1")!=="BLOB"||own(docs,"2")!=="FONT")bad();return{docs,uniqueId:text(own(arg,"uniqueId"),128),client:text(own(arg,"client"),128)};};
const retained=(original,stage)=>{array(original,13);const project=own(original,"0"),arg=own(original,"1"),r=own(original,"2"),snapshot=own(original,"12");if(own(snapshot,"owner")!==original)bad();const s=selected(project,arg,r,own(snapshot,"documentUuid"),own(snapshot,"projectUuid"));if(own(original,"3")!==own(project,"wsBus")||own(original,"4")!==method(project,"saveCanvas")||own(original,"5")!==method(own(original,"3"),"rpcCall")||own(original,"6")!==method(r,"asyncCompressFull")||own(original,"7")!==method(r,"getMaxTicket")||own(original,"8")!==method(r,"setMaxTicket")||own(original,"9")!==own(project,"user")||own(original,"10")!==s.docs||own(original,"11")!==own(project,"pcb")||s.uniqueId!==own(snapshot,"uniqueId")||s.client!==own(snapshot,"client"))bad();reprovePending(own(snapshot,"pending"),r,arg,stage);return{project,arg,r,snapshot};};`;
const guards = CURRENT_PCB_VIA_SAVE_RETAINED_GUARDS;
const pendingStage = (length: number): "entry" | "allocated" | "compressed" => {
  if (length === 4) { return "entry"; } if (length === 5) { return "allocated"; } return "compressed";
};
const continuation = (length: number, tail: string): string => `function(original,previous){${guards}\narray(this,${String(length)});const old=retained(original,${JSON.stringify(pendingStage(length))});if(own(this,"0")!==old.project||own(this,"1")!==old.arg||own(this,"2")!==old.r)bad();if(${String(length)}===4){if(previous!==original)bad();}else{array(previous,${String(length - 1)});for(let i=0;i<${String(length - 1)};i++)if(own(this,String(i))!==own(previous,String(i)))bad();if(own(this,"4")!==own(own(old.snapshot,"pending"),"maximumTicket")+1)bad();}${tail}verify();return this;}`;
export const CURRENT_PCB_VIA_SAVE_CALLS = freezeDeep({
  entry: `function(documentUuid,projectUuid){${guards}
array(this,3);if(!/^[a-f0-9]{32}$/.test(documentUuid)||!/^[a-f0-9]{64}$/.test(projectUuid))bad();const project=own(this,"0"),arg=own(this,"1"),r=own(this,"2"),s=selected(project,arg,r,documentUuid,projectUuid),bus=own(project,"wsBus"),save=method(project,"saveCanvas");
if(Function.prototype.toString.call(save)!==${JSON.stringify(CURRENT_PCB_VIA_SAVE_METHOD_SOURCE)})bad();const pending=capturePending(r,arg,documentUuid,"PCB","VIA"),snapshot={documentUuid,projectUuid,uniqueId:s.uniqueId,client:s.client,pending,owner:null},result=[project,arg,r,bus,save,method(bus,"rpcCall"),method(r,"asyncCompressFull"),method(r,"getMaxTicket"),method(r,"setMaxTicket"),own(project,"user"),s.docs,own(project,"pcb"),snapshot];snapshot.owner=result;retained(result,"entry");verify();return result;}`,
  clock: continuation(4, 'integer(own(this,"3"),1,8640000000000000);'),
  compress: continuation(5, 'integer(own(this,"3"),1,8640000000000000);integer(own(this,"4"),1,9007199254740990);'),
  body: continuation(6, 'integer(own(this,"3"),1,8640000000000000);integer(own(this,"4"),1,9007199254740990);const body=own(this,"5");if(typeof body!=="string"||body.length<1||body.length>16384||!body.isWellFormed())bad();'),
  value: `function(original){${guards}
array(this,6);const old=retained(original,"compressed");if(own(this,"0")!==old.project||own(this,"1")!==old.arg||own(this,"2")!==old.r)bad();const clock=integer(own(this,"3"),1,8640000000000000),headTicket=integer(own(this,"4"),1,9007199254740990),body=own(this,"5");if(typeof body!=="string"||body.length<1||body.length>16384||!body.isWellFormed())bad();const pending=own(old.snapshot,"pending"),user=own(original,"9")||own(pending,"priorUser"),userUndefined=!user,userJson=userUndefined?null:pendingUserJson(user);if(headTicket!==own(pending,"maximumTicket")+1)bad();verify();return{schema:"private.current-pcb-via-save-body-value.v2",documentUuid:own(old.snapshot,"documentUuid"),projectUuid:own(old.snapshot,"projectUuid"),uniqueId:own(old.snapshot,"uniqueId"),client:own(old.snapshot,"client"),clock,headTicket,body,userUndefined,userJson,pending:pendingValue(pending)};}`,
  result: continuation(7, 'integer(own(this,"3"),1,8640000000000000);integer(own(this,"4"),1,9007199254740990);const result=own(this,"6");if(result===null||typeof result!=="object"||own(result,"success")!==true||own(old.project,"isApplyShot")!==true)bad();'),
});
