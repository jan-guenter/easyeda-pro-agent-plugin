/** Dormant fixed read of pending producers in the original PCB Save scope.
 * The caller must retain the source/location-admitted scope and callback.
 * This leaf grants no native transport, model completeness or writer authority.
 */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { z } from "zod";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION } from "./current-pcb-diagnostic-model-program.ts";
import { currentPcbPendingFailure, currentPcbPendingFailureDetail, currentPcbPendingFailureSchema } from "./current-pcb-observation-failure.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_DIAGNOSTIC_PENDING_RESULT_BYTES = 8192;
const MAX_COUNT = 65_536;
const GUARDS = `
"use strict";
let stage="callback",reason="unexpected";
const bad=(r="guard")=>{reason=r;throw new Error("PCB_DIAGNOSTIC_PENDING_STATE");};
const object=o=>{if(o===null||typeof o!=="object"||Array.isArray(o))bad("object");return o;};
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad("own");const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad("own");return d.value;};
const optional=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return {marker:"absent",value:undefined};const v=own(o,k);if(v===undefined)return {marker:"undefined",value:v};if(v===null)return {marker:"null",value:v};return {marker:"present",value:v};};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad("count");return n;};
const count=n=>{extent(n);if(n>${MAX_COUNT})bad();return n;};
const flag=v=>{if(typeof v!=="boolean")bad("flag");return v;};
const id=v=>{if(typeof v!=="string"||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/.test(v))bad("id");return v;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const keyCount=o=>{plain(o);const keys=Reflect.ownKeys(o);if(keys.some(k=>typeof k!=="string"))bad();return count(keys.length);};
const arrayCount=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,"length"));};
const collection=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad("collection");const d=Object.getOwnPropertyDescriptor(p,"size");if(!d||typeof d.get!=="function"||d.set!==undefined)bad("collection");return count(Reflect.apply(d.get,o,[]));};
`;

/** Runtime.callFunctionOn, on the retained original Save-handler scope zero.
 * Sole argument: original callback remote handle. Require throwOnSideEffect,
 * silent and returnByValue true; awaitPromise, preview and userGesture false.
 * No source, selectors, remote handles or optional flags come from the caller.
 */
export const CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION = `function(originalCallback){${GUARDS}
try{
if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback)bad();
stage="scope";
const scope=object(own(this,"object")),retained=[];
const klass=n=>{const c=own(scope,n);if(typeof c!=="function")bad();return c;};
const instance=(o,c)=>{object(o);if(Object.getPrototypeOf(o)!==own(c,"prototype"))bad("instance");return o;};
const keep=(o,k)=>{const v=optional(o,k);retained.push([o,k,v.marker,v.value]);return v;};
stage="environment";const envClass=klass("x"),env=instance(keep(envClass,"env").value,envClass),compiler=own(env,"_compiler");
if(own(env,"_doctype")!==3||compiler===null||typeof compiler!=="object")bad();
const documentUuid=id(own(env,"_id"));
const upload=n=>{const c=klass(n),v=keep(c,"proxy");if(v.marker!=="present")return {marker:v.marker,count:null};
const owner=instance(v.value,c),data=keep(owner,"data").value;return {marker:"present",count:collection(data,Set.prototype)};};
stage="copper-uploads";const copperUploads=upload("qI");stage="plane-uploads";const planeUploads=upload("e5");
stage="board-upload";const boardClass=klass("pE"),boardOwner=keep(boardClass,"proxy");
const boardUpload={marker:boardOwner.marker,flag:boardOwner.marker==="present"?flag(own(instance(boardOwner.value,boardClass),"flag")):null};
stage="commands";const commands=instance(keep(scope,"Xe").value,klass("kde")),undo=keep(commands,"undoCommand").value,redo=keep(commands,"redoCommand").value;
const undoCount=arrayCount(undo),redoCount=arrayCount(redo);if(undoCount>50||redoCount>50)bad();
const active=keep(commands,"stack");if(active.marker!=="null"&&active.marker!=="present")bad();
let activeStack=null;
if(active.marker==="present"){
stage="active-stack";
const stack=instance(active.value,klass("De"));
activeStack={commandCount:arrayCount(keep(stack,"_commands").value),waitingUploadCount:arrayCount(keep(stack,"waitingUploadStack").value),
idMapCount:collection(keep(stack,"idMap").value,Map.prototype),refreshService:flag(own(stack,"refreshService")),
needCheckFilterCommand:flag(own(stack,"needCheckFilterCommand")),partitionNeedAskBeforeDelete:flag(own(stack,"_partitionNeedAskBeforeDelete")),
createPartitionFile:flag(own(stack,"createPartitionFile")),sendCopperOrderChange:flag(own(stack,"sendCopperOrderChange"))};
}
stage="teardrops";const tears=instance(keep(scope,"Zec").value,klass("Sfe"));
const teardrops={isMove:flag(own(tears,"isMove")),suspend:flag(own(tears,"suspend")),
modifyCount:collection(keep(tears,"modify").value,Set.prototype),taskCount:collection(keep(tears,"task").value,Set.prototype),
modifyTearsCount:collection(keep(tears,"modifyTears").value,Set.prototype),timer:keep(tears,"timeoutId").marker};
stage="dynamic-copper";const copperClass=klass("FP"),copper=instance(keep(copperClass,"manager").value,copperClass),worker=keep(copper,"workerName"),copperBus=keep(copper,"_bus");
const workerId=worker.marker==="present"?extent(worker.value):null;
stage="worker-registry";const workerClass=klass("Of"),registry=keep(workerClass,"manager");
let workers=null,association=workerId===null?"no-worker-id":"registry-unavailable";
if(registry.marker==="present"){
const manager=instance(registry.value,workerClass),map=keep(manager,"map").value,bridges=keep(manager,"busMap").value;
workers={workerCount:collection(map,Map.prototype),bridgeCount:keyCount(bridges),
ratlineWorkerCount:collection(keep(manager,"ratlineWorker").value,Map.prototype),
threadBusCount:collection(keep(manager,"workerBus").value,Map.prototype),
stateCount:keyCount(keep(manager,"_workerStateMap").value),nextWorkerId:extent(own(manager,"id")),nextThreadId:extent(own(manager,"i"))};
if(workerId!==null){
stage="worker-association";
const registered=Reflect.apply(own(Map.prototype,"get"),map,[workerId]),bridge=optional(bridges,String(workerId));
if(registered===undefined)association="missing-worker";
else if(bridge.marker!=="present")association="missing-bridge";
else if(bridge.value!==copperBus.value)association="bridge-mismatch";
else{
object(registered);const selected=object(bridge.value),prototype=Object.getPrototypeOf(selected),constructor=own(prototype,"constructor");
if(typeof constructor!=="function"||own(constructor,"name")!=="Cet"||own(constructor,"prototype")!==prototype)bad();
const sourceBus=own(own(globalThis,"MSG_BUS_PCB"),"messageBus");
if(own(selected,"worker")!==registered)association="worker-mismatch";
else if(own(selected,"bus")!==sourceBus)association="bus-mismatch";
else association="matched";
}
}
}
stage="reproof";if(own(env,"_compiler")!==compiler||own(env,"_id")!==documentUuid||own(env,"_doctype")!==3)bad();
for(const r of retained){const v=optional(r[0],r[1]);if(v.marker!==r[2]||v.value!==r[3])bad();}
if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback)bad();
stage="serialize";return JSON.stringify({schema:"easyeda-pro-control.pcb-diagnostic-pending-state.v1",documentUuid,copperUploads,planeUploads,boardUpload,
commands:{undoCount,redoCount,activeStack},teardrops,workerRegistry:{marker:registry.marker,workers},
dynamicCopper:{workerMarker:worker.marker,workerId,busMarker:copperBus.marker,association}});
}catch{return JSON.stringify({schema:"easyeda-pro-control.pcb-diagnostic-pending-failure.v1",stage,reason});}
}`;

export const CURRENT_PCB_DIAGNOSTIC_PENDING_PROGRAM_SHA256 =
  createHash("sha256").update(CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION).digest("hex");
const extentSchema = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).refine(value => !Object.is(value, -0));
const countSchema = extentSchema.max(MAX_COUNT);
const markerSchema = z.enum(["absent", "undefined", "null", "present"]);
const uploadSchema = z.object({ marker: markerSchema, count: countSchema.nullable() }).strict()
  .refine(value => (value.marker === "present") === (value.count !== null));
const stackSchema = z.object({
  commandCount: countSchema, waitingUploadCount: countSchema, idMapCount: countSchema,
  refreshService: z.boolean(), needCheckFilterCommand: z.boolean(), partitionNeedAskBeforeDelete: z.boolean(),
  createPartitionFile: z.boolean(), sendCopperOrderChange: z.boolean(),
}).strict();
const workersSchema = z.object({
  workerCount: countSchema, bridgeCount: countSchema, ratlineWorkerCount: countSchema, threadBusCount: countSchema,
  stateCount: countSchema, nextWorkerId: extentSchema, nextThreadId: extentSchema,
}).strict();
const schema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-diagnostic-pending-state.v1"),
  documentUuid: z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u),
  copperUploads: uploadSchema, planeUploads: uploadSchema,
  boardUpload: z.object({ marker: markerSchema, flag: z.boolean().nullable() }).strict()
    .refine(value => (value.marker === "present") === (value.flag !== null)),
  commands: z.object({ undoCount: countSchema.max(50), redoCount: countSchema.max(50), activeStack: stackSchema.nullable() }).strict(),
  teardrops: z.object({
    isMove: z.boolean(), suspend: z.boolean(), modifyCount: countSchema, taskCount: countSchema,
    modifyTearsCount: countSchema, timer: markerSchema,
  }).strict(),
  workerRegistry: z.object({ marker: markerSchema, workers: workersSchema.nullable() }).strict()
    .refine(value => (value.marker === "present") === (value.workers !== null)),
  dynamicCopper: z.object({
    workerMarker: markerSchema, workerId: extentSchema.nullable(), busMarker: markerSchema,
    association: z.enum(["no-worker-id", "registry-unavailable", "missing-worker", "missing-bridge",
      "bridge-mismatch", "worker-mismatch", "bus-mismatch", "matched"]),
  }).strict().refine(value => (value.workerMarker === "present") === (value.workerId !== null) &&
    (value.association === "no-worker-id") === (value.workerId === null)),
}).strict().refine(value => {
  const { association, busMarker, workerId } = value.dynamicCopper;
  const workers = value.workerRegistry.workers;
  if (workerId === null) { return true; }
  if (workers === null) { return association === "registry-unavailable"; }
  if (association === "registry-unavailable") { return false; }
  if (association === "missing-worker") { return true; }
  if (workers.workerCount === 0) { return false; }
  if (association === "missing-bridge") { return true; }
  if (workers.bridgeCount === 0) { return false; }
  if (association === "matched" || association === "worker-mismatch" || association === "bus-mismatch") {
    return busMarker === "present";
  }
  return true;
});
const LIMITS = Object.freeze({
  completePendingProducerInventoryVerified: false, producerCompletionVerified: false,
  projectWorkerAssociationVerified: false, workerLivenessVerified: false, queueCompletionVerified: false,
  saveAuthorized: false, executionAuthorized: false, continuousObservation: false, nativeIntrinsicsVerified: false,
} as const);
export type CurrentPcbDiagnosticPendingState = Readonly<z.infer<typeof schema>> & typeof LIMITS;

function refuse(): never { throw currentPcbPendingFailure("decode", "reply"); }
function record(value: unknown, names: readonly string[]): Readonly<Record<string, unknown>> {
  if (value === null || typeof value !== "object" || types.isProxy(value) || Array.isArray(value)) { return refuse(); }
  const prototype: unknown = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) { return refuse(); }
  const keys = Reflect.ownKeys(value);
  if (keys.length !== names.length || keys.some(key => typeof key !== "string" || !names.includes(key))) { return refuse(); }
  const result: Record<string, unknown> = {};
  for (const name of names) {
    const descriptor = Object.getOwnPropertyDescriptor(value, name);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { return refuse(); }
    result[name] = descriptor.value as unknown;
  }
  return result;
}

/** Decoder only. A supplied snapshot cannot establish original-owner authority. */
export function decodeCurrentPcbDiagnosticPendingReply(input: unknown): CurrentPcbDiagnosticPendingState {
  const reply = record(input, ["result"]), result = record(reply["result"], ["type", "value"]);
  const raw = result["value"];
  if (result["type"] !== "string" || typeof raw !== "string" || !raw.isWellFormed() ||
      Buffer.byteLength(raw, "utf8") > CURRENT_PCB_DIAGNOSTIC_PENDING_RESULT_BYTES) { return refuse(); }
  try {
    const decoded = decodeCurrentPcbDiagnosticJson(Buffer.from(raw, "utf8")), failure = currentPcbPendingFailureSchema.safeParse(decoded);
    if (failure.success) { throw currentPcbPendingFailure(failure.data.stage, failure.data.reason); }
    const state = schema.parse(decoded);
    return freezeDeep({ ...state, ...LIMITS });
  } catch (caughtError) {
    if (currentPcbPendingFailureDetail(caughtError) !== null) { throw caughtError; }
    return refuse();
  }
}
