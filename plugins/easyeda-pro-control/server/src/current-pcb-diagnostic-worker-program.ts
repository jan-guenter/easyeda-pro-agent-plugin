/** One fixed project-worker diagnostic, not a compiler/Save preflight.
 * WORKER b849bd12 exports PROJECT=TP at2177102. TP is Lg extends Gd;
 * Gd@2011459 owns the upload/task state, Lg@2103244 adds publication state,
 * and ja@273992 owns uniqueIds. No vendor method or design value is read.
 *
 * Runtime.evaluate must use this exact expression, uniqueContextId,
 * throwOnSideEffect:true, silent:true, returnByValue:true, awaitPromise:false,
 * includeCommandLineAPI:false, userGesture:false, timeout:1000,
 * generatePreview:false and allowUnsafeEvalBlockedByCSP:false.
 * CDP's effect check rejects effects it cannot rule out. It does not establish
 * trustworthy intrinsics, native ownership, latent timer state or completion.
 * https://github.com/ChromeDevTools/devtools-protocol/blob/master/pdl/js_protocol.pdl
 * https://github.com/v8/v8/blob/14.6.172/src/debug/debug-evaluate.cc
 */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { z } from "zod";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const SET_FIELDS = ["task1", "task2", "task3", "cachePromise", "publishTask", "rollbackPromise",
  "syncPendingNodeUuids", "confirmedEmptyNodeUuids", "warnedEmptyNodeUuids"] as const;
const MAP_FIELDS = ["bufferUploadData", "bufferUploadCache", "selectWatch", "historyErrorNodes"] as const;
const WATCH_GROUPS = ["watcherAddSet", "watcherDeleteSet", "watcherUpdateSet"] as const;
const WATCH_KINDS = ["footprint", "symbol", "device", "board", "sch", "sheet", "pcb", "panel", "simulation"] as const;
const FLAG_FIELDS = ["isReady", "isTemporary", "isHistoryBack", "_isV2Format", "isOpening", "isEstablished",
  "isApplyShot", "isUploadingCloud", "pendingSyncCloud", "isBatchUpload", "debugOpen"] as const;
const TIMER_FIELDS = ["projectTimer", "publishTimer", "orderTimer"] as const;
const OPTIONAL_FLAGS = ["isSyncing", "notSyncCloud"] as const;
const MAX_COUNT = 65_536;
export const CURRENT_PCB_DIAGNOSTIC_WORKER_RESULT_BYTES = 16_384;

/** Cardinalities do not enumerate task values, upload data, history or geometry.
 * Map/Set size uses only the explicitly selected intrinsic getter on an exact
 * native prototype. Own overrides, subclass instances and accessors refuse.
 * No ordinary VM execution can prove the absence of proxy traps. The required
 * inspector effect check is separate and must never be disabled on refusal.
 */
export const CURRENT_PCB_DIAGNOSTIC_WORKER_EXPRESSION = `(()=>{
"use strict";
const bad=()=>{throw new Error("PCB_DIAGNOSTIC_WORKER_STATE");};
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const object=o=>{if(o===null||typeof o!=="object"||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const count=n=>{if(!Number.isSafeInteger(n)||n<0||n>${MAX_COUNT})bad();return n;};
const id=(v,re)=>{if(typeof v!=="string"||v.length>128||!re.test(v))bad();return v;};
const prototype=(o,name)=>{const p=Object.getPrototypeOf(object(o));if(p===null)bad();const c=own(p,"constructor");if(typeof c!=="function"||own(c,"name")!==name||own(c,"prototype")!==p)bad();return p;};
const project=object(own(globalThis,"PROJECT")),lp=prototype(project,"Lg"),gp=prototype(lp,"Gd");
if(Object.getPrototypeOf(gp)!==Object.prototype)bad();
const consistency=object(own(project,"consistencyManager"));prototype(consistency,"ja");
const size=(value,kind)=>{object(value);const p=kind==="set"?Set.prototype:Map.prototype;if(Object.getPrototypeOf(value)!==p||Reflect.ownKeys(value).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,"size");if(!d||typeof d.get!=="function"||d.set!==undefined)bad();return count(Reflect.apply(d.get,value,[]));};
const keys=value=>{plain(value);const names=Reflect.ownKeys(value);if(names.some(k=>typeof k!=="string"))bad();return count(names.length);};
const identity={projectUuid:id(own(project,"uuid"),/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/),branchUuid:id(own(project,"_branchUuid"),/^[a-f0-9]{32}$/),windowTabId:id(own(globalThis,"_TAB_ID_"),/^[A-Za-z0-9_-]{1,128}$/)};
const flags={},optionalFlags={},setSizes={},mapSizes={},watcherMapSizes={},timers={};
for(const key of ${JSON.stringify(FLAG_FIELDS)}){const value=own(project,key);if(typeof value!=="boolean")bad();flags[key]=value;}
for(const key of ${JSON.stringify(OPTIONAL_FLAGS)}){const d=Object.getOwnPropertyDescriptor(project,key);if(!d){optionalFlags[key]="absent";continue;}const value=own(project,key);if(value!==undefined&&typeof value!=="boolean")bad();optionalFlags[key]=value===undefined?"undefined":value?"true":"false";}
for(const key of ${JSON.stringify(SET_FIELDS)})setSizes[key]=size(own(project,key),"set");
for(const key of ${JSON.stringify(MAP_FIELDS)})mapSizes[key]=size(own(project,key),"map");
for(const group of ${JSON.stringify(WATCH_GROUPS)}){const holder=plain(own(project,group)),names=Reflect.ownKeys(holder),expected=${JSON.stringify(WATCH_KINDS)};if(names.length!==expected.length||names.some(k=>!expected.includes(k)))bad();const result={};for(const key of expected)result[key]=size(own(holder,key),"map");watcherMapSizes[group]=result;}
for(const key of ${JSON.stringify(TIMER_FIELDS)}){const value=own(project,key);if(value!==null&&value!==undefined&&(typeof value!=="number"||!Number.isSafeInteger(value)||value<0))bad();timers[key]=value===null?"null":value===undefined?"undefined":"present";}
const dictionaryOwnKeyCounts={uniqueIds:keys(own(consistency,"uniqueIds")),orderCache:keys(own(project,"orderCache"))};
if(own(globalThis,"PROJECT")!==project||own(project,"consistencyManager")!==consistency)bad();
return JSON.stringify({schema:"easyeda-pro-control.pcb-diagnostic-worker-state.v1",identity,flags,optionalFlags,setSizes,mapSizes,watcherMapSizes,timers,dictionaryOwnKeyCounts});
})()`;

export const CURRENT_PCB_DIAGNOSTIC_WORKER_EXPRESSION_SHA256 =
  createHash("sha256").update(CURRENT_PCB_DIAGNOSTIC_WORKER_EXPRESSION, "utf8").digest("hex");
const countSchema = z.number().int().min(0).max(MAX_COUNT).refine(value => !Object.is(value, -0));
const watcherKindsSchema = z.record(z.enum(WATCH_KINDS), countSchema);
const stateSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-diagnostic-worker-state.v1"),
  identity: z.object({ projectUuid: z.string().regex(/^(?:[a-f\d]{32}|[a-f\d]{64})$/u),
    branchUuid: z.string().regex(/^[a-f\d]{32}$/u), windowTabId: z.string().regex(/^[A-Za-z\d_-]{1,128}$/u) }).strict(),
  flags: z.record(z.enum(FLAG_FIELDS), z.boolean()),
  optionalFlags: z.record(z.enum(OPTIONAL_FLAGS), z.enum(["absent", "undefined", "true", "false"])),
  setSizes: z.record(z.enum(SET_FIELDS), countSchema),
  mapSizes: z.record(z.enum(MAP_FIELDS), countSchema),
  watcherMapSizes: z.record(z.enum(WATCH_GROUPS), watcherKindsSchema),
  timers: z.record(z.enum(TIMER_FIELDS), z.enum(["null", "undefined", "present"])),
  dictionaryOwnKeyCounts: z.object({ uniqueIds: countSchema, orderCache: countSchema }).strict(),
}).strict();
const LIMITS = Object.freeze({ completeQueueMembershipVerified: false, latentCallbacksObserved: false,
  projectWorkerAssociationVerified: false, compilerOwnerVerified: false, queueCompletionVerified: false,
  executionAuthorized: false, continuousObservation: false, nativeIntrinsicsVerified: false } as const);
export type CurrentPcbDiagnosticWorkerState = Readonly<z.infer<typeof stateSchema>> & typeof LIMITS;

function refuse(): never { throw new Error("PCB_DIAGNOSTIC_WORKER_REPLY"); }
function ownRecord(value: unknown, expected: readonly string[]): Readonly<Record<string, unknown>> {
  if (value === null || typeof value !== "object" || types.isProxy(value) || Array.isArray(value)) { return refuse(); }
  const prototype: unknown = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) { return refuse(); }
  const keys = Reflect.ownKeys(value);
  if (keys.length !== expected.length || keys.some(key => typeof key !== "string" || !expected.includes(key))) { return refuse(); }
  const copy: Record<string, unknown> = {};
  for (const key of expected) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { return refuse(); }
    copy[key] = descriptor.value as unknown;
  }
  return copy;
}

/** Consumes only the by-value string returned by the fixed program. A matching
 * supplied reply is no evidence that the program ran or owns a native worker.
 * Exceptions, remote object handles, previews and unknown result fields refuse.
 */
export function decodeCurrentPcbDiagnosticWorkerReply(input: unknown): CurrentPcbDiagnosticWorkerState {
  const reply = ownRecord(input, ["result"]), result = ownRecord(reply["result"], ["type", "value"]);
  const raw = result["value"];
  if (result["type"] !== "string" || typeof raw !== "string" || !raw.isWellFormed() ||
      Buffer.byteLength(raw, "utf8") > CURRENT_PCB_DIAGNOSTIC_WORKER_RESULT_BYTES) { return refuse(); }
  try {
    const state = stateSchema.parse(decodeCurrentPcbDiagnosticJson(Buffer.from(raw, "utf8")));
    return freezeDeep({ ...state, ...LIMITS });
  } catch { return refuse(); }
}
