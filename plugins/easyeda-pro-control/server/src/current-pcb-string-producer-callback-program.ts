/** Dormant selection and raw buffered-environment observations. Requires fresh
 * source/location-qualified wrapper and callback scopes from the original
 * worker, throwOnSideEffect:true, awaitPromise:false and retained object groups.
 * This does not expose the four arrows' hidden lexical receivers. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { CURRENT_PCB_STRING_OBSERVATION_GUARDS, decodeCurrentPcbStringObservation } from "./current-pcb-string-observation-core.ts";

const GUARDS = `${CURRENT_PCB_STRING_OBSERVATION_GUARDS}
const fn=v=>{if(typeof v!=="function")bad();return v;};
const scope=o=>object(own(o,"object"));
const project=object(own(globalThis,"PROJECT"));named(project,"Lg");
const lp=Object.getPrototypeOf(project);named(lp,"Gd");
if(Object.getPrototypeOf(Object.getPrototypeOf(lp))!==Object.prototype)bad();
`;
const serialSelector = (field: "uploadStructure" | "bufferedPendDataStream"): string =>
  `function(originalWrapper){${GUARDS}
if(own(project,${JSON.stringify(field)})!==originalWrapper)bad();
const selected=fn(own(scope(this),"e"));verify();return selected;}`;
export const CURRENT_PCB_STRING_UPLOAD_STRUCTURE_CALLBACK_SELECTOR = serialSelector("uploadStructure");
export const CURRENT_PCB_STRING_COOPERATION_CALLBACK_SELECTOR = serialSelector("bufferedPendDataStream");

/** `this` is fresh QA parameter scope; serialScope is fresh original Nd scope. */
export const CURRENT_PCB_STRING_STRUCTURE_CALLBACK_SELECTOR = `function(originalWrapper,serialScope,originalDebounce){${GUARDS}
if(own(project,"structure")!==originalWrapper||own(scope(serialScope),"e")!==originalDebounce)bad();
const s=scope(this);if(own(s,"t")!==300||own(s,"s")!==false)bad();
const selected=fn(own(s,"e"));verify();return selected;}`;

const uploadSelector = (field: "t" | "o" | "c"): string => `function(originalWrapper){${GUARDS}
if(own(project,"bufferedUploadCloud")!==originalWrapper)bad();
const s=scope(this);if(own(s,"a")!==project||own(s,"s")!==500)bad();
const selected=fn(own(s,${JSON.stringify(field)}));verify();return selected;}`;
export const CURRENT_PCB_STRING_UPLOAD_CALLBACK_SELECTOR = uploadSelector("t");
export const CURRENT_PCB_STRING_BUFFER_CALLBACK_SELECTOR = uploadSelector("o");
export const CURRENT_PCB_STRING_DRAIN_CALLBACK_SELECTOR = uploadSelector("c");

/** `this`, bufferScope and drainScope are three freshly acquired scope wrappers.
 * Different V8 scope-wrapper object IDs do not mean different lexical contexts;
 * compare the captured native function/object identities and snapshot scalars.
 * Matching snapshots cannot prove atomicity, callback completion or upload success.
 * In particular `c` clears timer/promise/resolver before awaiting upload. */
export const CURRENT_PCB_STRING_BUFFERED_CALLBACK_ENVIRONMENT = `function(originalWrapper,bufferScope,drainScope,originalUpload,originalBuffer,originalDrain){${GUARDS}
if(own(project,"bufferedUploadCloud")!==originalWrapper)bad();
fn(originalUpload);fn(originalBuffer);fn(originalDrain);
const environments=[scope(this),scope(bufferScope),scope(drainScope)];
const first=environments[0];
for(const s of environments){
if(own(s,"a")!==project||own(s,"t")!==originalUpload||own(s,"o")!==originalBuffer||own(s,"c")!==originalDrain||own(s,"s")!==500)bad();
for(const key of ["r","i","n"]){if(!Object.is(own(s,key),own(first,key)))bad();}}
const timer=own(first,"r"),promise=own(first,"i"),resolver=own(first,"n");
if(timer!==null&&(typeof timer!=="number"||!Number.isSafeInteger(timer)||Object.is(timer,-0)||timer<1))bad();
if(promise!==null&&(object(promise),Object.getPrototypeOf(promise)!==Promise.prototype))bad();
if(resolver!==null)fn(resolver);
const state={schema:"easyeda-pro-control.pcb-string-buffered-callback-environment.v1",
identity:{projectUuid:id(own(project,"uuid"),/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/),
branchUuid:id(own(project,"_branchUuid"),/^[a-f0-9]{32}$/),windowTabId:id(own(globalThis,"_TAB_ID_"),/^[A-Za-z0-9_-]{1,128}$/)},
retainedProjectReferenceMatched:true,callbackReferencesMatched:true,scalarSnapshotsMatched:true,
timer:timer===null?"null":"present",promise:promise===null?"null":"present",resolver:resolver===null?"null":"present",
uploadLexicalReceiverVerified:false,atomicSample:false};verify();return JSON.stringify(state);}`;

export const CURRENT_PCB_STRING_PRODUCER_CALLBACK_PROGRAM_HASHES = Object.freeze(Object.fromEntries(Object.entries({
  uploadStructureSelector: CURRENT_PCB_STRING_UPLOAD_STRUCTURE_CALLBACK_SELECTOR,
  structureSelector: CURRENT_PCB_STRING_STRUCTURE_CALLBACK_SELECTOR,
  cooperationSelector: CURRENT_PCB_STRING_COOPERATION_CALLBACK_SELECTOR,
  uploadSelector: CURRENT_PCB_STRING_UPLOAD_CALLBACK_SELECTOR,
  bufferSelector: CURRENT_PCB_STRING_BUFFER_CALLBACK_SELECTOR,
  drainSelector: CURRENT_PCB_STRING_DRAIN_CALLBACK_SELECTOR,
  bufferedEnvironment: CURRENT_PCB_STRING_BUFFERED_CALLBACK_ENVIRONMENT,
}).map(([name, source]) => [name, createHash("sha256").update(source).digest("hex")])));

const environmentSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-string-buffered-callback-environment.v1"),
  identity: z.object({ projectUuid: z.string().regex(/^(?:[a-f\d]{32}|[a-f\d]{64})$/u),
    branchUuid: z.string().regex(/^[a-f\d]{32}$/u), windowTabId: z.string().regex(/^[A-Za-z\d_-]{1,128}$/u) }).strict(),
  retainedProjectReferenceMatched: z.literal(true), callbackReferencesMatched: z.literal(true),
  scalarSnapshotsMatched: z.literal(true), timer: z.enum(["null", "present"]),
  promise: z.enum(["null", "present"]), resolver: z.enum(["null", "present"]),
  uploadLexicalReceiverVerified: z.literal(false), atomicSample: z.literal(false) }).strict();
export function decodeCurrentPcbStringBufferedCallbackEnvironment(input: unknown):
ReturnType<typeof decodeCurrentPcbStringObservation<typeof environmentSchema>> {
  return decodeCurrentPcbStringObservation(input, environmentSchema);
}
