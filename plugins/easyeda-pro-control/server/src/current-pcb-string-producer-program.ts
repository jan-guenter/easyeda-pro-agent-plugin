/** Dormant fixed observers for PCB217199c8 eL and WORKERb849bd12
 * Nd/QA/ZA/bufferedStream. These strings have no registered native dispatcher.
 * A future owner must retain source-qualified function/scopes and use
 * throwOnSideEffect:true, awaitPromise:false, silent:true, no user gesture.
 * No callback, promise method, timer, serializer or getter is invoked. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION } from "./current-pcb-diagnostic-model-program.ts";
import { CURRENT_PCB_STRING_OBSERVATION_GUARDS, currentPcbStringCountSchema,
  decodeCurrentPcbStringObservation } from "./current-pcb-string-observation-core.ts";

const GUARDS = `${CURRENT_PCB_STRING_OBSERVATION_GUARDS}
const fn=v=>{if(typeof v!=="function")bad();return v;};
const scope=o=>object(own(o,"object"));
const nullable=v=>v===null?"null":(object(v),"present");
const timer=v=>{if(v===null)return "null";if(v===undefined)return "undefined";if(typeof v!=="number"||!Number.isSafeInteger(v)||Object.is(v,-0)||v<1)bad();return "present";};
const promise=v=>{if(v===null)return "null";object(v);if(Object.getPrototypeOf(v)!==Promise.prototype)bad();return "present";};
const resolver=v=>v===null?"null":(fn(v),"present");
`;
const PROJECT = `const project=object(own(globalThis,"PROJECT"));named(project,"Lg");
const lp=Object.getPrototypeOf(project);named(lp,"Gd");
if(Object.getPrototypeOf(Object.getPrototypeOf(lp))!==Object.prototype)bad();
const identity={projectUuid:id(own(project,"uuid"),/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/),
branchUuid:id(own(project,"_branchUuid"),/^[a-f0-9]{32}$/),windowTabId:id(own(globalThis,"_TAB_ID_"),/^[A-Za-z0-9_-]{1,128}$/)};
`;

/** Original Save-handler scope only, with its original callback retained. */
export const CURRENT_PCB_STRING_MOVE_SELECTOR = `function(originalCallback){${GUARDS}
if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback)bad();
const original=fn(own(scope(this),"eL"));verify();return original;}`;

const selector = (field: "uploadStructure" | "structure" | "bufferedPendDataStream" | "bufferedUploadCloud"): string =>
  `(()=>{${GUARDS}${PROJECT}const original=fn(own(project,${JSON.stringify(field)}));verify();return original;})()`;
export const CURRENT_PCB_STRING_UPLOAD_STRUCTURE_SELECTOR = selector("uploadStructure");
export const CURRENT_PCB_STRING_STRUCTURE_SELECTOR = selector("structure");
export const CURRENT_PCB_STRING_COOPERATION_SELECTOR = selector("bufferedPendDataStream");
export const CURRENT_PCB_STRING_UPLOAD_SELECTOR = selector("bufferedUploadCloud");

/** This is the original structure Nd scope. Returned e still needs independent
 * exact QA function bytes/location/scope qualification before it can be read. */
export const CURRENT_PCB_STRING_DEBOUNCE_SELECTOR = `function(originalStructure){${GUARDS}${PROJECT}
if(own(project,"structure")!==originalStructure)bad();const original=fn(own(scope(this),"e"));verify();return original;}`;

/** No selections are copied. The dense array count retains hidden stale
 * selections after eL's timer completes, since the source does not reset t. */
export const CURRENT_PCB_STRING_MOVE_STATE = `function(originalMove,handlerScope,originalCallback){${GUARDS}
if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback||own(scope(handlerScope),"eL")!==originalMove)bad();
const ec=fn(own(scope(handlerScope),"x")),env=object(own(ec,"env"));
if(Object.getPrototypeOf(env)!==own(ec,"prototype")||own(env,"_doctype")!==3)bad();
const s=scope(this),state={schema:"easyeda-pro-control.pcb-string-move-closure.v1",
documentUuid:id(own(env,"_id"),/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/),
timer:timer(own(s,"o")),selectionCount:arraySize(own(s,"t")),builder:nullable(own(s,"e")),command:nullable(own(s,"r"))};
verify();return JSON.stringify(state);}`;

const serial = (field: "uploadStructure" | "structure"): string => `function(originalFunction){${GUARDS}${PROJECT}
if(own(project,${JSON.stringify(field)})!==originalFunction)bad();const s=scope(this),last=own(s,"r");fn(own(s,"e"));
const state={schema:"easyeda-pro-control.pcb-string-serial-closure.v1",identity,kind:${JSON.stringify(field)},
inFlight:promise(own(s,"t")),queued:promise(own(s,"s")),lastArguments:last===undefined?null:arraySize(last)};
verify();return JSON.stringify(state);}`;
export const CURRENT_PCB_STRING_UPLOAD_STRUCTURE_STATE = serial("uploadStructure");
export const CURRENT_PCB_STRING_STRUCTURE_STATE = serial("structure");

/** QA's default parameters create two leading scopes. Block holds r/i;
 * Closure (QA) holds e/t/s. Require both and the original serial-scope e. */
export const CURRENT_PCB_STRING_DEBOUNCE_STATE = `function(parameters,serialScope,originalStructure,originalDebounce){${GUARDS}${PROJECT}
if(own(project,"structure")!==originalStructure||own(scope(serialScope),"e")!==originalDebounce)bad();
const s=scope(this),p=scope(parameters);fn(own(p,"e"));
if(own(p,"t")!==300||own(p,"s")!==false)bad();
const state={schema:"easyeda-pro-control.pcb-string-debounce-closure.v1",identity,
timer:timer(own(s,"r")),resolver:resolver(own(s,"i")),delay:300,leading:false};
verify();return JSON.stringify(state);}`;

export const CURRENT_PCB_STRING_COOPERATION_STATE = `function(originalFunction){${GUARDS}${PROJECT}
if(own(project,"bufferedPendDataStream")!==originalFunction)bad();const s=scope(this);fn(own(s,"e"));
if(own(s,"t")!==10)bad();const state={schema:"easyeda-pro-control.pcb-string-cooperation-closure.v1",identity,
batchCount:arraySize(own(s,"s")),outerTimer:timer(own(s,"r")),innerTimer:timer(own(s,"i")),delay:10};
verify();return JSON.stringify(state);}`;

export const CURRENT_PCB_STRING_UPLOAD_STATE = `function(originalFunction){${GUARDS}${PROJECT}
if(own(project,"bufferedUploadCloud")!==originalFunction)bad();const s=scope(this);
if(own(s,"a")!==project||own(s,"s")!==500)bad();fn(own(s,"t"));fn(own(s,"o"));fn(own(s,"c"));
const state={schema:"easyeda-pro-control.pcb-string-upload-closure.v1",identity,
timer:timer(own(s,"r")),promise:promise(own(s,"i")),resolver:resolver(own(s,"n")),delay:500};
verify();return JSON.stringify(state);}`;

export const CURRENT_PCB_STRING_PRODUCER_PROGRAM_HASHES = Object.freeze(Object.fromEntries(Object.entries({
  moveSelector: CURRENT_PCB_STRING_MOVE_SELECTOR, uploadStructureSelector: CURRENT_PCB_STRING_UPLOAD_STRUCTURE_SELECTOR,
  structureSelector: CURRENT_PCB_STRING_STRUCTURE_SELECTOR, cooperationSelector: CURRENT_PCB_STRING_COOPERATION_SELECTOR,
  uploadSelector: CURRENT_PCB_STRING_UPLOAD_SELECTOR, debounceSelector: CURRENT_PCB_STRING_DEBOUNCE_SELECTOR,
  move: CURRENT_PCB_STRING_MOVE_STATE, uploadStructure: CURRENT_PCB_STRING_UPLOAD_STRUCTURE_STATE,
  structure: CURRENT_PCB_STRING_STRUCTURE_STATE, debounce: CURRENT_PCB_STRING_DEBOUNCE_STATE,
  cooperation: CURRENT_PCB_STRING_COOPERATION_STATE, upload: CURRENT_PCB_STRING_UPLOAD_STATE,
}).map(([name, source]) => [name, createHash("sha256").update(source).digest("hex")])));
const identity = z.object({ projectUuid: z.string().regex(/^(?:[a-f\d]{32}|[a-f\d]{64})$/u),
  branchUuid: z.string().regex(/^[a-f\d]{32}$/u), windowTabId: z.string().regex(/^[A-Za-z\d_-]{1,128}$/u) }).strict();
const marker = z.enum(["null", "present"]);
const moveSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-string-move-closure.v1"),
  documentUuid: z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u),
  timer: marker, selectionCount: currentPcbStringCountSchema, builder: marker, command: marker }).strict();
const serialSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-string-serial-closure.v1"), identity,
  kind: z.enum(["uploadStructure", "structure"]), inFlight: marker, queued: marker,
  lastArguments: currentPcbStringCountSchema.nullable() }).strict();
const debounceSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-string-debounce-closure.v1"), identity,
  timer: z.enum(["undefined", "present"]), resolver: marker, delay: z.literal(300), leading: z.literal(false) }).strict();
const cooperationSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-string-cooperation-closure.v1"), identity,
  batchCount: currentPcbStringCountSchema, outerTimer: marker, innerTimer: marker, delay: z.literal(10) }).strict();
const uploadSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-string-upload-closure.v1"), identity,
  timer: marker, promise: marker, resolver: marker, delay: z.literal(500) }).strict();

export function decodeCurrentPcbStringMoveClosure(input: unknown): ReturnType<typeof decodeCurrentPcbStringObservation<typeof moveSchema>> {
  return decodeCurrentPcbStringObservation(input, moveSchema);
}
export function decodeCurrentPcbStringSerialClosure(input: unknown): ReturnType<typeof decodeCurrentPcbStringObservation<typeof serialSchema>> {
  return decodeCurrentPcbStringObservation(input, serialSchema);
}
export function decodeCurrentPcbStringDebounceClosure(input: unknown): ReturnType<typeof decodeCurrentPcbStringObservation<typeof debounceSchema>> {
  return decodeCurrentPcbStringObservation(input, debounceSchema);
}
export function decodeCurrentPcbStringCooperationClosure(input: unknown): ReturnType<typeof decodeCurrentPcbStringObservation<typeof cooperationSchema>> {
  return decodeCurrentPcbStringObservation(input, cooperationSchema);
}
export function decodeCurrentPcbStringUploadClosure(input: unknown): ReturnType<typeof decodeCurrentPcbStringObservation<typeof uploadSchema>> {
  return decodeCurrentPcbStringObservation(input, uploadSchema);
}
