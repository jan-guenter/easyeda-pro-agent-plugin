/** Fixed current209 public SDK calls on the original pro-api root. No bridge,
 * new EDA constructor, extension identity or caller-supplied source is used. */
import { CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION as OPENING } from "./current-pcb-diagnostic-pcb-opening.ts";
import { requireOriginalCurrentPcbViaWritePlan } from "./current-pcb-via-write-plan.ts";
import type { CurrentPcbViaWritePlan } from "./current-pcb-via-write-plan.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_VIA_WRITE_GROUP = "easyeda-pro-control-pcb-via-write-v1";
export const CURRENT_PCB_VIA_WRITE_STAGES = ["capture", "preflight", "create", "observe", "save"] as const;
export type CurrentPcbViaWriteStage = typeof CURRENT_PCB_VIA_WRITE_STAGES[number];
export const CURRENT_PCB_VIA_WRITE_SDK_SOURCE = freezeDeep({
  relativePath: "pro-api/0.3.59.1ca9efb5/api.js", bytes: 1_980_754,
  sha256: "e7c31b0de9dcbe4806e6b3cf8879b31c9e44425361bb8e67c3e8480ae359c8b1",
  originalRootAssignmentUtf16: 1_915_898, originalRoot: "_EXTAPI_ROOT_", originalRootInstance: "Pe=new Iy(\"eda\")",
  // Current209: argument eight is mask expansion, argument nine is lock.
  viaArguments: ["net", "x", "y", "holeDiameter", "diameter", "viaType", "designRuleBlindViaName", "solderMaskExpansion", "primitiveLock"],
} as const);
const createSource = String.raw`async create(t,i,n,r,s,a,o,l,u){if(l&&(typeof l!="object"||Array.isArray(l)))throw new Error("\u9519\u8BEF\uFF1A\u65E0\u6CD5\u521B\u5EFA\u8FC7\u5B54\u56FE\u5143\uFF0CsolderMaskExpansion\u4F20\u5165\u7684\u53C2\u6570\u7ED3\u6784\u4E0D\u6B63\u786E\u3002");try{return await new qi(t,i,n,r,s,a,o,l,u).create()}catch{throw new Error("\u9519\u8BEF\uFF1A\u65E0\u6CD5\u521B\u5EFA\u8FC7\u5B54\u56FE\u5143\uFF0C\u53EF\u80FD\u662F\u4F20\u5165\u7684\u53C2\u6570\u4E0D\u6B63\u786E\u3002")}}`;
const saveSource = 'async save(){return await T.extensionApiMessageBus2.rpcCall("extensionApi.PCB_Document.save")}';
export const CURRENT_PCB_VIA_WRITE_SDK_METHODS = Object.freeze({ create: createSource, save: saveSource });

/** Capture returns an original remote array in this private object group.
 * Every later stage uses that array as receiver. Sticky attempt state is set
 * before any await and belongs only to this array, outside the CAD model.
 * Native ownership, effect acceptance and Save eligibility remain in the owner. */
export const CURRENT_PCB_VIA_WRITE_FUNCTION = `async function(target,stage,operation){
"use strict";
const root=globalThis,apply=Reflect.apply,bad=()=>{throw new Error("PCB209_VIA_WRITE_REFUSED");};
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const plain=o=>{if(o===null||typeof o!=="object"||Object.getPrototypeOf(o)!==Object.prototype)bad();return o;};
const text=(v,max)=>{if(typeof v!=="string"||v.length>max||!v.isWellFormed()||/[\\u0000-\\u001F\\u007F]/.test(v))bad();return v;};
const keys=(o,names)=>{plain(o);const actual=Reflect.ownKeys(o);if(actual.length!==names.length||actual.some(k=>!names.includes(k)))bad();for(const k of names)own(o,k);};
const num=(v,min,max)=>{if(typeof v!=="number"||!Number.isFinite(v)||Object.is(v,-0)||v<min||v>max)bad();return v;};
if(!${JSON.stringify(CURRENT_PCB_VIA_WRITE_STAGES)}.includes(stage))bad();
keys(operation,["operationId","via"]);const operationId=text(own(operation,"operationId"),96),v=own(operation,"via");
if(!/^pcb209-via-write-[a-z0-9][a-z0-9-]*$/.test(operationId))bad();
keys(v,["netName","xMil","yMil","holeDiameterMil","diameterMil","viaType","designRuleBlindViaName","solderMaskExpansion","primitiveLock"]);
num(own(v,"xMil"),-1000000,1000000);num(own(v,"yMil"),-1000000,1000000);
if(num(own(v,"holeDiameterMil"),.1,100000)>=num(own(v,"diameterMil"),.1,100000)||own(v,"netName")!==""||own(v,"viaType")!==0||own(v,"designRuleBlindViaName")!==""||own(v,"primitiveLock")!==false)bad();
const mask=own(v,"solderMaskExpansion");keys(mask,["topSolderMask","bottomSolderMask"]);if(own(mask,"topSolderMask")!==0||own(mask,"bottomSolderMask")!==0)bad();
const sdk=own(root,"_EXTAPI_ROOT_"),via=own(sdk,"pcb_PrimitiveVia"),doc=own(sdk,"pcb_Document"),viaProto=Object.getPrototypeOf(via),docProto=Object.getPrototypeOf(doc);
const create=own(viaProto,"create"),save=own(docProto,"save"),functionText=Function.prototype.toString;
if(typeof create!=="function"||typeof save!=="function"||apply(functionText,create,[])!==${JSON.stringify(createSource)}||apply(functionText,save,[])!==${JSON.stringify(saveSource)}||Object.hasOwn(via,"create")||Object.hasOwn(doc,"save"))bad();
const identity=JSON.stringify({target,operation}),opening=${OPENING};
let tuple=this,state;
if(stage==="capture"){
state={identity,owner:null,createAttempted:false,createAcknowledged:false,primitiveId:null,saveAttempted:false,saveAcknowledged:false,failed:false};
tuple=[sdk,via,viaProto,create,doc,docProto,save,state];
state.owner=tuple;
}else{
if(!Array.isArray(tuple)||Object.getPrototypeOf(tuple)!==Array.prototype||own(tuple,"length")!==8||Reflect.ownKeys(tuple).length!==9)bad();
state=plain(own(tuple,"7"));keys(state,["identity","owner","createAttempted","createAcknowledged","primitiveId","saveAttempted","saveAcknowledged","failed"]);
if(own(state,"owner")!==tuple||own(state,"identity")!==identity||own(state,"failed")!==false)bad();
}
const current=()=>{if(own(root,"_EXTAPI_ROOT_")!==sdk||own(sdk,"pcb_PrimitiveVia")!==via||own(sdk,"pcb_Document")!==doc||Object.getPrototypeOf(via)!==viaProto||Object.getPrototypeOf(doc)!==docProto||own(viaProto,"create")!==create||own(docProto,"save")!==save||Function.prototype.toString!==functionText)bad();
for(const [index,value]of [sdk,via,viaProto,create,doc,docProto,save,state].entries())if(own(tuple,String(index))!==value)bad();
if(own(state,"identity")!==identity||own(state,"failed")!==false)bad();};
const targetCurrent=async()=>{current();const observed=JSON.parse(await apply(opening,root,[target,"observe"]));current();if(observed.ok!==true||observed.frameObserved!==true||observed.phase!=="observe"||observed.projectUuid!==target.projectUuid||observed.branchUuid!==target.branchUuid||observed.documentUuid!==target.documentUuid)bad();};
let dispatched=false,acknowledged=false,primitiveId=state.primitiveId;
try{
if(stage==="create"){if(state.createAttempted||state.saveAttempted)bad();state.createAttempted=true;}
if(stage==="save"){if(!state.createAcknowledged||state.saveAttempted||typeof state.primitiveId!=="string")bad();state.saveAttempted=true;}
await targetCurrent();
if(stage==="capture")return tuple;
if(stage==="create"){
dispatched=true;const original=apply(create,via,[v.netName,v.xMil,v.yMil,v.holeDiameterMil,v.diameterMil,0,"",{topSolderMask:0,bottomSolderMask:0},false]);
if(Object.getPrototypeOf(original)!==Promise.prototype)bad();const created=await original;current();
primitiveId=text(own(created,"primitiveId"),256);if(primitiveId.length===0)bad();
for(const [key,expected]of [["net",v.netName],["x",v.xMil],["y",v.yMil],["holeDiameter",v.holeDiameterMil],["diameter",v.diameterMil],["viaType",0],["designRuleBlindViaName",""],["primitiveLock",false]])if(own(created,key)!==expected)bad();
const actualMask=own(created,"solderMaskExpansion");keys(actualMask,["topSolderMask","bottomSolderMask"]);if(actualMask.topSolderMask!==0||actualMask.bottomSolderMask!==0)bad();
state.primitiveId=primitiveId;state.createAcknowledged=true;acknowledged=true;
}else if(stage==="save"){
dispatched=true;const original=apply(save,doc,[]);if(Object.getPrototypeOf(original)!==Promise.prototype)bad();
if(await original!==true)bad();current();state.saveAcknowledged=true;acknowledged=true;
}else if(stage==="preflight"&&(state.createAttempted||state.saveAttempted))bad();
await targetCurrent();
return {schema:"easyeda-pro-control.pcb209-via-write-stage.v1",stage,ok:true,dispatchAttempted:dispatched,originalPromiseAcknowledged:acknowledged,primitiveId:state.primitiveId,createAttempted:state.createAttempted,createAcknowledged:state.createAcknowledged,saveAttempted:state.saveAttempted,saveAcknowledged:state.saveAcknowledged,inverseAvailable:false,persistenceVerified:false};
}catch{state.failed=true;return {schema:"easyeda-pro-control.pcb209-via-write-stage.v1",stage,ok:false,dispatchAttempted:dispatched,originalPromiseAcknowledged:acknowledged,primitiveId,createAttempted:state.createAttempted,createAcknowledged:state.createAcknowledged,saveAttempted:state.saveAttempted,saveAcknowledged:state.saveAcknowledged,inverseAvailable:false,persistenceVerified:false};}
}`;

/** Data only for the fixed native encoder. Original source/context/binding
 * handles are selected by the actual native owner, not the operation request. */
export function currentPcbViaWriteProgramArguments(plan: CurrentPcbViaWritePlan): Readonly<{
  target: CurrentPcbViaWritePlan["target"]; operation: Readonly<{ operationId: string; via: CurrentPcbViaWritePlan["via"] }>;
}> {
  requireOriginalCurrentPcbViaWritePlan(plan);
  return freezeDeep({ target: plan.target, operation: { operationId: plan.operationId, via: plan.via } });
}
