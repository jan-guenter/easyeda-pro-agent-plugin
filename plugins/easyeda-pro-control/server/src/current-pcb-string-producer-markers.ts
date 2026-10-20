/** Raw producer markers, not empty-baseline or completion evidence. The fixed
 * leaf uses the original source-qualified Save-handler scope; it never constructs
 * a lazy manager or invokes a callback. PCB217199c8: ON@6438262, w4@3917595,
 * U5@5436598, Yde@7963918 and mpe@8149271. No runtime route is registered here.
 */
import { createHash } from "node:crypto";
import { z } from "zod";
import { CURRENT_PCB_CONSTRUCTOR_ASSOCIATION_PROGRAMS } from "./current-pcb-constructor-scope.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION } from "./current-pcb-diagnostic-model-program.ts";
import { CURRENT_PCB_STRING_OBSERVATION_GUARDS, currentPcbStringCountSchema, currentPcbStringMarkerSchema,
  decodeCurrentPcbStringObservation } from "./current-pcb-string-observation-core.ts";
import type { CURRENT_PCB_STRING_OBSERVATION_LIMITS } from "./current-pcb-string-observation-core.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const LIMITS = Object.freeze({
  managerAbsenceImpliesEmpty: false, emptyBaselineVerified: false, callbackOwnerVerified: false,
  producerCompletionVerified: false, continuousObservation: false,
} as const);

/** One dormant callFunctionOn with the retained original callback and admitted
 * precreate constructor tuple, throwOnSideEffect:true and returnByValue:true. Exact class instances,
 * own data descriptors, selected key rosters and cardinalities are rechecked.
 * Collection values/keys never leave the leaf. Counts are not full inventories;
 * callback equality is not lexical receiver or lifecycle evidence.
 */
export const CURRENT_PCB_STRING_PRODUCER_MARKERS_FUNCTION = `function(originalCallback,constructors){
${CURRENT_PCB_STRING_OBSERVATION_GUARDS}
if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback)bad();
const prototypes=[],keySamples=[],absentFields=[];
const prototype=o=>{const p=Object.getPrototypeOf(o);prototypes.push([o,p]);return p;};
const scope=object(own(this,"object")),klass=n=>{const c=own(scope,n);if(typeof c!=="function")bad();return c;};
${CURRENT_PCB_CONSTRUCTOR_ASSOCIATION_PROGRAMS.precreate}
const instance=(o,c)=>{object(o);if(prototype(o)!==own(c,"prototype"))bad();return o;};
const rawMarker=(o,k)=>{const m=marker(o,k);if(m==="absent"){absentFields.push([o,k]);let p=o,n=0;while(p!==null){if(++n>10)bad();p=prototype(p);}}return m;};
const finite=v=>{if(typeof v!=="number"||!Number.isFinite(v)||Object.is(v,-0))bad();return v;};
const token=v=>{finite(v);if(!Number.isSafeInteger(v)||v<0)bad();return v;};
const dataKeys=o=>{const k=Reflect.ownKeys(o);if(k.length>65537)bad();for(const key of k){if(typeof key!=="string")bad();const d=Object.getOwnPropertyDescriptor(o,key);if(!d||!Object.hasOwn(d,"value"))bad();}keySamples.push([o,k]);return k;};
const objectCount=o=>{plain(o);prototype(o);return count(dataKeys(o).length);};
const arrayCount=o=>{if(!Array.isArray(o)||prototype(o)!==Array.prototype)bad();const n=count(own(o,"length")),k=dataKeys(o);if(k.length!==n+1||k[n]!=="length")bad();for(let i=0;i<n;i++)if(k[i]!==String(i))bad();return n;};
const mapCount=o=>size(o,Map.prototype),setCount=o=>size(o,Set.prototype);
const ec=klass("x"),env=instance(own(ec,"env"),ec),documentUuid=id(own(env,"_id"),/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/);
if(own(env,"_doctype")!==3)bad();
const copperClass=klass("FP"),copperOwner=own(copperClass,"manager");
let dynamicCopper={manager:"null",state:null};
if(copperOwner!==null){
 const copper=instance(copperOwner,copperClass),workerNameMarker=rawMarker(copper,"workerName");
 const state={openPcb:flag(own(copper,"openPcb")),workerNameMarker,
 workerId:workerNameMarker==="present"?token(own(copper,"workerName")):null,
 timerMarker:rawMarker(copper,"time"),busMarker:rawMarker(copper,"_bus")};
 dynamicCopper={manager:"present",state};
}
const modelClass=klass("MI"),modelOwner=own(modelClass,"manager");
let ratlineModel={manager:"null",state:null};
if(modelOwner!==null){
 const models=instance(modelOwner,modelClass);
 ratlineModel={manager:"present",state:{netCount:mapCount(own(models,"map")),idCount:mapCount(own(models,"idMap")),
 lastRatlineMarker:rawMarker(models,"_lastRatline"),lastMarker:rawMarker(models,"_last")}};
}
const views=constructorInstance(own(scope,"jo"),"mpe");
const ratlineView={netCount:mapCount(own(views,"map")),idCount:mapCount(own(views,"idMap")),
 highlightNetCount:setCount(own(views,"highLightNets")),clickHighlightCount:setCount(own(views,"clickHighlightRatlines")),
 hoverHighlightCount:setCount(own(views,"hoverHighlightRatlines"))};
const network=constructorInstance(own(scope,"ze"),"Yde"),updates=plain(own(network,"updateNets"));
if(objectCount(updates)!==3)bad();
const viewGroupsMarker=rawMarker(network,"_viewGroupIds");
const net={netCount:mapCount(own(network,"map")),noneNetCount:mapCount(own(network,"noneNetMap")),
 lengthCount:mapCount(own(network,"netLength")),modifyCount:mapCount(own(network,"netModify")),
 rubbishCount:setCount(own(network,"rubbish")),optionCount:arrayCount(own(network,"netOptions")),
 addCount:arrayCount(own(updates,"addNet")),deleteCount:arrayCount(own(updates,"deleteNet")),
 updateLengthCount:objectCount(own(updates,"updateNetLength")),grayCount:objectCount(own(network,"ratlineVisibleBeforeGray")),
 viewGroupsMarker,viewGroupCount:viewGroupsMarker==="present"?arrayCount(own(network,"_viewGroupIds")):null};
const debounce=instance(own(network,"debounce"),klass("U5")),func=own(debounce,"func"),frame=own(debounce,"animationFrameId");
if(func!==null&&typeof func!=="function")bad();
const leftMarker=rawMarker(network,"updateLeftTree"),left=leftMarker==="present"?own(network,"updateLeftTree"):null;
if(leftMarker==="present"&&typeof left!=="function")bad();
const notification={funcMarker:func===null?"null":"function",frameMarker:frame===null?"null":"token",
 frameId:frame===null?null:token(frame),lastTime:finite(own(debounce,"lastTime")),delay:finite(own(debounce,"delay")),
 updateLeftTreeMarker:leftMarker==="present"?"function":leftMarker,
 sameCallbackReference:typeof func==="function"&&typeof left==="function"?func===left:null};
const clusters={networkCount:mapCount(own(klass("Xh"),"map")),
wireClusterCount:mapCount(own(constructorInstance(own(scope,"h_"),"HSe"),"map")),
jumpWireCount:mapCount(own(constructorInstance(own(scope,"aE"),"USe"),"map")),
 useWireClusterCache:flag(own(klass("h0"),"useWireClusterCache")),emptyNetChange:flag(own(klass("h0"),"emptyNetChange"))};
verifyConstructorAssociations();verify();
for(const item of retained)if(item.length===3&&!Object.is(Object.getOwnPropertyDescriptor(item[0],item[1]).value,item[2]))bad();
for(const item of prototypes)if(Object.getPrototypeOf(item[0])!==item[1])bad();
for(const item of absentFields){let p=item[0],n=0;while(p!==null){if(++n>10||Object.hasOwn(p,item[1]))bad();p=Object.getPrototypeOf(p);}}
for(const item of keySamples){const k=Reflect.ownKeys(item[0]);if(k.length!==item[1].length)bad();for(let i=0;i<k.length;i++){if(k[i]!==item[1][i])bad();const d=Object.getOwnPropertyDescriptor(item[0],k[i]);if(!d||!Object.hasOwn(d,"value"))bad();}}
if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback)bad();
return JSON.stringify({schema:"easyeda-pro-control.pcb-string-producer-markers.v1",documentUuid,dynamicCopper,ratlineModel,ratlineView,net,notification,clusters});
}`;

const number = z.number().refine(value => !Object.is(value, -0));
const token = number.refine(value => Number.isSafeInteger(value) && value >= 0);
const absentOwner = z.object({ manager: z.literal("null"), state: z.null() }).strict();
const copperState = z.object({ openPcb: z.boolean(), workerNameMarker: currentPcbStringMarkerSchema,
  workerId: token.nullable(), timerMarker: currentPcbStringMarkerSchema, busMarker: currentPcbStringMarkerSchema,
}).strict().refine(value => (value.workerNameMarker === "present") === (value.workerId !== null));
const copper = z.discriminatedUnion("manager", [absentOwner, z.object({
  manager: z.literal("present"), state: copperState,
}).strict()]);
const model = z.discriminatedUnion("manager", [absentOwner, z.object({
  manager: z.literal("present"),
  state: z.object({ netCount: currentPcbStringCountSchema, idCount: currentPcbStringCountSchema,
    lastRatlineMarker: currentPcbStringMarkerSchema, lastMarker: currentPcbStringMarkerSchema }).strict(),
}).strict()]);
const notification = z.object({
  funcMarker: z.enum(["null", "function"]), frameMarker: z.enum(["null", "token"]), frameId: token.nullable(),
  lastTime: number, delay: number, updateLeftTreeMarker: z.enum(["absent", "undefined", "null", "function"]),
  sameCallbackReference: z.boolean().nullable(),
}).strict().refine(value => (value.frameMarker === "token") === (value.frameId !== null) &&
  (value.funcMarker === "function" && value.updateLeftTreeMarker === "function") === (value.sameCallbackReference !== null));
const schema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-string-producer-markers.v1"),
  documentUuid: z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u),
  dynamicCopper: copper, ratlineModel: model,
  ratlineView: z.object({ netCount: currentPcbStringCountSchema, idCount: currentPcbStringCountSchema,
    highlightNetCount: currentPcbStringCountSchema, clickHighlightCount: currentPcbStringCountSchema,
    hoverHighlightCount: currentPcbStringCountSchema }).strict(),
  net: z.object({ netCount: currentPcbStringCountSchema, noneNetCount: currentPcbStringCountSchema,
    lengthCount: currentPcbStringCountSchema, modifyCount: currentPcbStringCountSchema,
    rubbishCount: currentPcbStringCountSchema, optionCount: currentPcbStringCountSchema,
    addCount: currentPcbStringCountSchema, deleteCount: currentPcbStringCountSchema,
    updateLengthCount: currentPcbStringCountSchema, grayCount: currentPcbStringCountSchema,
    viewGroupsMarker: currentPcbStringMarkerSchema, viewGroupCount: currentPcbStringCountSchema.nullable(),
  }).strict().refine(value => (value.viewGroupsMarker === "present") === (value.viewGroupCount !== null)),
  notification,
  clusters: z.object({ networkCount: currentPcbStringCountSchema, wireClusterCount: currentPcbStringCountSchema,
    jumpWireCount: currentPcbStringCountSchema, useWireClusterCache: z.boolean(), emptyNetChange: z.boolean() }).strict(),
}).strict();

export type CurrentPcbStringProducerMarkers = Readonly<z.infer<typeof schema>> &
typeof CURRENT_PCB_STRING_OBSERVATION_LIMITS & typeof LIMITS;

export function decodeCurrentPcbStringProducerMarkers(input: unknown): CurrentPcbStringProducerMarkers {
  return freezeDeep({ ...decodeCurrentPcbStringObservation(input, schema), ...LIMITS });
}

export const CURRENT_PCB_STRING_PRODUCER_MARKERS_SHA256 =
  createHash("sha256").update(CURRENT_PCB_STRING_PRODUCER_MARKERS_FUNCTION).digest("hex");
