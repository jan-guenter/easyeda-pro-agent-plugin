/** Fixed, descriptor-only reads for the source-admitted PCB Save closure.
 * The original callback is inspected, never called. The scope object must come
 * from its retained V8 [[Scopes]], not a caller-created object or global alias.
 * See docs/current-pcb-model-observation-2026-10-20.md for the pinned source path.
 */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { z } from "zod";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const MAX_COUNT = 65_536;
const MAX_PARTICIPANTS = 128;
export const CURRENT_PCB_DIAGNOSTIC_MODEL_RESULT_BYTES = 65_536;
const GUARDS = `
"use strict";
const bad=()=>{throw new Error("PCB_DIAGNOSTIC_MODEL_STATE");};
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const object=o=>{if(o===null||typeof o!=="object"||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>${MAX_COUNT})bad();return n;};
const flag=v=>{if(typeof v!=="boolean")bad();return v;};
const id=v=>{if(typeof v!=="string"||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!=="string"||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return "absent";const v=own(o,k);return v===undefined?"undefined":v===null?"null":"present";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!=="string"))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,"length"));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,"size");if(!d||typeof d.get!=="function"||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};
`;

/** Runtime.evaluate: original admitted uniqueContextId, returnByValue:false,
 * throwOnSideEffect:true, silent:true, awaitPromise:false, timeout:1000,
 * generatePreview:false, includeCommandLineAPI:false, userGesture:false,
 * allowUnsafeEvalBlockedByCSP:false. No arbitrary expression is accepted.
 */
export const CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION = `(()=>{${GUARDS}
const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,"constructor");if(typeof c!=="function"||own(c,"name")!==name||own(c,"prototype")!==p)bad();return o;};
const bridge=named(own(globalThis,"MSG_BUS_PCB"),"HJ"),bus=named(own(bridge,"messageBus"),"Oet"),subscribed=plain(own(bus,"subscribed")),tasks=own(subscribed,"pcb/saveCompiler");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,"0"),"Z1e"),callback=own(task,"callback");
if(own(task,"isRunning")!==true||typeof callback!=="function")bad();
return callback;
})()`;

/** Runtime.callFunctionOn on scope zero of the original rpcService wrapper:
 * returnByValue:false, throwOnSideEffect:true, silent:true, awaitPromise:false,
 * generatePreview:false, userGesture:false; no arguments or executionContextId.
 * CDP callFunctionOn has no timeout parameter. The retained transport deadline
 * still applies; do not copy Runtime.evaluate's timeout into its request.
 */
export const CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION = `function(){${GUARDS}
const handler=own(object(own(this,"object")),"t");
if(typeof handler!=="function")bad();
return handler;
}`;

/** Same callFunctionOn contract, returnByValue:true, on scope zero of the
 * source/location-admitted Save handler. All class references are original
 * bindings from that scope, not names resolved in globalThis.
 * Its sole argument is the runner-retained original callback remote handle;
 * the fixed registry selection must still equal it before reading any owner.
 * No getters, vendor methods, paths, titles, primitive values or queue payloads.
 * Map iteration selects the intrinsic and bounds the already checked size.
 */
export const CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_FUNCTION = `function(originalCallback){${GUARDS}
if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback)bad();
const scope=object(own(this,"object"));
const klass=n=>{const c=own(scope,n);if(typeof c!=="function")bad();return c;};
const instance=(o,c)=>{object(o);if(Object.getPrototypeOf(o)!==own(c,"prototype"))bad();return o;};
const envClass=klass("x"),managerClass=klass("wi"),copperClass=klass("FP");
const env=instance(own(envClass,"env"),envClass),manager=instance(own(managerClass,"manager"),managerClass);
if(own(env,"_doctype")!==3||own(env,"_compiler")===null)bad();
const alternate=marker(managerClass,"otherDecodingProjectId");if(alternate==="present")bad();
const channel=instance(own(env,"compilerChannel"),klass("mCe"));
const compiler=(value,kind)=>{
instance(value,klass(kind==="main"?"Zu":"XS"));
const base=instance(own(value,"base"),klass("A8e")),consistency=instance(own(base,"consistencyManager"),klass("sCe"));
if(own(value,"uuid")!==own(base,"uuid")||own(value,"consistencyManager")!==consistency||own(base,"channel")!==channel||own(base,"_headType")!==(kind==="main"?"PCB":"FOOTPRINT"))bad();
const uniqueId=id(own(consistency,"unique")),registry=plain(own(channel,"compiler")),registryMap=nativeMap(own(registry,kind==="main"?"PCB":"FOOTPRINT"));
mapSize(registryMap);
if(Reflect.apply(own(Map.prototype,"get"),registryMap,[uniqueId])!==base)bad();
const result={uuid:kind==="main"?id(own(base,"uuid")):customId(own(base,"uuid")),uniqueId,headType:kind==="main"?"PCB":"FOOTPRINT",isProject:flag(own(base,"isProject")),isInit:flag(own(base,"isInit")),canSave:flag(own(base,"canSave")),isInitIng:flag(own(base,"isInitIng")),pendCacheLength:extent(own(base,"pendCacheLength")),pendingDocumentKeyCount:keys(own(base,"pendCache")),cacheKeyCount:keys(own(base,"cache")),deleteCacheCount:mapSize(own(base,"deleteCache")),subscriptionCount:arrayLength(own(base,"sub")),pendTimer:marker(base,"pendTimer"),pendPromise:marker(base,"pendPromise"),maxTicket:extent(own(consistency,"maxTicket")),pendingChange:flag(own(consistency,"isPendChange")),localChange:flag(own(consistency,"isLocalChange"))};
return result;
};
const mainOwner=own(env,"_compiler"),main=compiler(mainOwner,"main");if(main.uuid!==id(own(env,"_id")))bad();
const map=nativeMap(own(manager,"map")),loadedFootprintCount=mapSize(map);if(loadedFootprintCount>${MAX_PARTICIPANTS})bad();
const custom=[],seen=new Set(),iterator=Reflect.apply(own(Map.prototype,"entries"),map,[]),iteratorPrototype=Object.getPrototypeOf(iterator),next=own(iteratorPrototype,"next");
if(typeof next!=="function")bad();
for(let index=0;index<loadedFootprintCount;index++){
const entry=Reflect.apply(next,iterator,[]);if(own(entry,"done")!==false)bad();
const pair=own(entry,"value");if(arrayLength(pair)!==2)bad();
const footprint=object(own(pair,"1")),prototype=Object.getPrototypeOf(footprint);
if(prototype!==own(klass("Al"),"prototype")&&prototype!==own(klass("aC"),"prototype"))bad();
if(prototype===own(klass("Al"),"prototype")){
const uuid=customId(own(footprint,"_uuid"));if(own(pair,"0")!==uuid||seen.has(uuid))bad();seen.add(uuid);
const state=compiler(own(footprint,"instance"),"custom-footprint");if(state.uuid!==uuid)bad();custom.push(state);
}
}
if(own(Reflect.apply(next,iterator,[]),"done")!==true)bad();
const copper=instance(own(copperClass,"manager"),copperClass),workerMarker=marker(copper,"workerName");
let workerName=null;if(workerMarker==="present")workerName=extent(own(copper,"workerName"));
const dynamicCopper={openPcb:flag(own(copper,"openPcb")),workerNameMarker:workerMarker,workerName,timer:marker(copper,"time"),bus:marker(copper,"_bus")};
if(own(envClass,"env")!==env||own(managerClass,"manager")!==manager||own(copperClass,"manager")!==copper||own(env,"_compiler")!==mainOwner||own(manager,"map")!==map||own(env,"compilerChannel")!==channel)bad();
return JSON.stringify({schema:"easyeda-pro-control.pcb-diagnostic-model-state.v1",main,loadedFootprintCount,customFootprints:custom,dynamicCopper});
}`;

export const CURRENT_PCB_DIAGNOSTIC_MODEL_PROGRAM_HASHES = Object.freeze({
  callback: createHash("sha256").update(CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION).digest("hex"),
  handler: createHash("sha256").update(CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION).digest("hex"),
  state: createHash("sha256").update(CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_FUNCTION).digest("hex"),
});

const extentSchema = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).refine(value => !Object.is(value, -0));
const countSchema = extentSchema.max(MAX_COUNT);
const idSchema = z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32}|[a-f\d]{64})$/u);
const customIdSchema = z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})_[a-f\d]{16}$/u);
const markerSchema = z.enum(["absent", "undefined", "null", "present"]);
const compilerSchema = z.object({
  uuid: z.union([idSchema, customIdSchema]), uniqueId: idSchema, headType: z.enum(["PCB", "FOOTPRINT"]), isProject: z.boolean(),
  isInit: z.boolean(), canSave: z.boolean(), isInitIng: z.boolean(), pendCacheLength: extentSchema,
  pendingDocumentKeyCount: countSchema, cacheKeyCount: countSchema, deleteCacheCount: countSchema,
  subscriptionCount: countSchema, pendTimer: markerSchema, pendPromise: markerSchema, maxTicket: extentSchema,
  pendingChange: z.boolean(), localChange: z.boolean(),
}).strict();
const stateSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-diagnostic-model-state.v1"),
  main: compilerSchema.refine(value => value.headType === "PCB" && idSchema.safeParse(value.uuid).success),
  loadedFootprintCount: countSchema.max(MAX_PARTICIPANTS),
  customFootprints: z.array(compilerSchema.refine(value => value.headType === "FOOTPRINT" && customIdSchema.safeParse(value.uuid).success)).max(MAX_PARTICIPANTS),
  dynamicCopper: z.object({ openPcb: z.boolean(), workerNameMarker: markerSchema, workerName: extentSchema.nullable(),
    timer: markerSchema, bus: markerSchema }).strict(),
}).strict().refine(value => value.customFootprints.length <= value.loadedFootprintCount &&
  new Set(value.customFootprints.map(item => item.uuid)).size === value.customFootprints.length &&
  new Set([value.main.uniqueId, ...value.customFootprints.map(item => item.uniqueId)]).size === value.customFootprints.length + 1 &&
  (value.dynamicCopper.workerNameMarker === "present") === (value.dynamicCopper.workerName !== null));
const LIMITS = Object.freeze({ completeModelMembershipVerified: false, completePendingProducerInventoryVerified: false,
  projectWorkerAssociationVerified: false, queueCompletionVerified: false, saveAuthorized: false,
  executionAuthorized: false, continuousObservation: false, nativeIntrinsicsVerified: false } as const);
export type CurrentPcbDiagnosticModelState = Readonly<z.infer<typeof stateSchema>> & typeof LIMITS;

function refuse(): never { throw new Error("PCB_DIAGNOSTIC_MODEL_REPLY"); }
function record(value: unknown, names: readonly string[]): Readonly<Record<string, unknown>> {
  if (value === null || typeof value !== "object" || types.isProxy(value) || Array.isArray(value)) { return refuse(); }
  const prototype: unknown = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) { return refuse(); }
  const keys = Reflect.ownKeys(value);
  if (keys.length !== names.length || keys.some(key => typeof key !== "string" || !names.includes(key))) { return refuse(); }
  const copy: Record<string, unknown> = {};
  for (const name of names) {
    const descriptor = Object.getOwnPropertyDescriptor(value, name);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { return refuse(); }
    copy[name] = descriptor.value as unknown;
  }
  return copy;
}
/** Shape validation only: original source/session/reference ownership remains
 * the retained diagnostic owner's obligation. Supplied JSON grants no authority.
 */
export function decodeCurrentPcbDiagnosticModelReply(input: unknown): CurrentPcbDiagnosticModelState {
  const reply = record(input, ["result"]), result = record(reply["result"], ["type", "value"]);
  const raw = result["value"];
  if (result["type"] !== "string" || typeof raw !== "string" || !raw.isWellFormed() ||
      Buffer.byteLength(raw, "utf8") > CURRENT_PCB_DIAGNOSTIC_MODEL_RESULT_BYTES) { return refuse(); }
  try {
    const state = stateSchema.parse(decodeCurrentPcbDiagnosticJson(Buffer.from(raw, "utf8")));
    return freezeDeep({ ...state, ...LIMITS });
  } catch { return refuse(); }
}
