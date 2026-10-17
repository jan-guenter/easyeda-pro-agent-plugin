/** Fixed observer for one original plan's newly copied closed symbol.
 * Its original owner must bind the native return and post-close metadata.
 * No navigation, Save, creation or ownership is issued by this compiler.
 */
import { z } from "zod";
import { assertUpstreamReplySettled, canonicalJson, extractToolPayload } from "./core.ts";
import { assertCurrentSymbolCopyDestination, currentSymbolCopySourceRows } from "./current-symbol-copy-plan.ts";
import type { CurrentSymbolCopyPlan } from "./current-symbol-copy-plan.ts";
import { buildCurrentProjectOnlySymbolGuard } from "./current-project-only-symbol-guard.ts";
import { currentSymbolStartupExpectationSchema } from "./current-symbol-startup.ts";
import { buildCurrentSymbolStartupGuard } from "./current-symbol-startup-guard.ts";
import { CURRENT_SAVED_SYMBOL_CONTENT_LIMIT, CURRENT_SAVED_SYMBOL_ENVELOPE_LIMIT, CURRENT_SAVED_SYMBOL_READ_TIMEOUT_MS, currentSavedSymbolReadRequestSchema } from "./current-symbol-saved-read-program.ts";
import { EXACT_READ_ENVELOPE_SCHEMA, decodeExactReadEnvelope } from "./exact-readers.ts";
import { ACTOR_NAME_MAX_CODE_UNITS, SYMBOL_DUAL_ACTOR_CAPTURE_SOURCE } from "./symbol-dual-actor.ts";
import { exact } from "./symbol-clock-controls.ts";

const actorSchema = z.object({ uuid: z.string().regex(/^[a-f0-9]{32}$/u), username: z.string().min(1).max(ACTOR_NAME_MAX_CODE_UNITS),
  nickname: z.string().max(ACTOR_NAME_MAX_CODE_UNITS) }).strict();
const targetSchema = currentSavedSymbolReadRequestSchema.shape.target.extend({ symbolUuid: z.string().regex(/^[a-f0-9]{16}$/u) }).strict();
const versionSchema = z.string().regex(/^[1-9][0-9]{0,15}$/u).refine((value) => Number.isSafeInteger(Number(value)) && Number(value) <= 8_640_000_000_000_000);
const beforeSchema = currentSavedSymbolReadRequestSchema.shape.expectedBefore.extend({ source: z.literal(""), version: versionSchema }).strict();
export const currentSymbolCopySavedReadRequestSchema = z.object({ target: targetSchema, expectedBefore: beforeSchema, expectedActor: actorSchema,
  maximumTicket: z.number().int().positive().max(Number.MAX_SAFE_INTEGER - 1).refine((value) => !Object.is(value, -0)),
  startup: currentSymbolStartupExpectationSchema,
}).strict().refine((value) => value.expectedBefore.ticket + 1 === value.maximumTicket);
export type CurrentSymbolCopySavedReadRequest = z.infer<typeof currentSymbolCopySavedReadRequestSchema>;
const observationSchema = z.object({ profile: z.literal("private.saved-symbol-content-observation.v1"),
  projectUuid: targetSchema.shape.projectUuid, targetUuid: targetSchema.shape.symbolUuid,
  maximumTicket: currentSymbolCopySavedReadRequestSchema.shape.maximumTicket,
  workerClient: z.string().regex(/^[a-f0-9]{16}$/u), content: z.string().min(1).max(CURRENT_SAVED_SYMBOL_CONTENT_LIMIT),
  executionAuthorized: z.literal(false), producerBindingVerified: z.literal(false), completionProved: z.literal(false),
}).strict();
const resultSchema = z.object({ profile: z.literal("private.current-symbol-copy-saved-read-observation.v1"),
  target: targetSchema, expectedBefore: beforeSchema, expectedActor: actorSchema, observation: observationSchema,
  samples: z.literal(2), noEditorTabsObserved: z.literal(true), mutationDispatched: z.literal(false), explicitSaveDispatched: z.literal(false), executionAuthorized: z.literal(false),
}).strict();
export type CurrentSymbolCopySavedReadObservation = z.infer<typeof resultSchema>;

function data(value: unknown, depth = 0): unknown {
  if (depth > 5) { throw new Error("CURRENT_SYMBOL_COPY_SAVED_INPUT"); }
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") { return value; }
  if (typeof value !== "object") { throw new TypeError("CURRENT_SYMBOL_COPY_SAVED_INPUT"); }
  if (Array.isArray(value)) {
    if (Object.getPrototypeOf(value) !== Array.prototype || value.length > 128 || Reflect.ownKeys(value).length !== value.length + 1) { throw new Error("CURRENT_SYMBOL_COPY_SAVED_INPUT"); }
    return Array.from({ length: value.length }, (_, index) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
      if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { throw new Error("CURRENT_SYMBOL_COPY_SAVED_INPUT"); }
      return data(descriptor.value as unknown, depth + 1);
    });
  }
  if ((Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) || Reflect.ownKeys(value).length > 16) { throw new Error("CURRENT_SYMBOL_COPY_SAVED_INPUT"); }
  const copy: Record<string, unknown> = {};
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (typeof key !== "string" || descriptor === undefined || !Object.hasOwn(descriptor, "value")) { throw new Error("CURRENT_SYMBOL_COPY_SAVED_INPUT"); }
    Object.defineProperty(copy, key, { value: data(descriptor.value as unknown, depth + 1), enumerable: true });
  }
  return copy;
}
function request(original: CurrentSymbolCopyPlan, input: unknown): CurrentSymbolCopySavedReadRequest {
  const selected = currentSymbolCopySavedReadRequestSchema.parse(data(input));
  assertCurrentSymbolCopyDestination(original, selected.target.symbolUuid);
  const expected = selected.expectedBefore; const desired = original.destinationMetadata;
  if (selected.target.projectUuid !== original.source.projectUuid || selected.target.branchUuid !== original.source.branchUuid || selected.target.ownerUuid !== original.ownerUuid ||
    expected.name !== desired.title || expected.description !== desired.description || expected.tagsJson !== JSON.stringify(desired.tags) || expected.source !== desired.source ||
    expected.ticket !== original.metadataTicket || selected.maximumTicket !== original.canvasHeaderTicket ||
    original.exportedHeaderTicket !== selected.maximumTicket + 1 || Buffer.byteLength(JSON.stringify(selected)) > 262_144) {
    throw new Error("CURRENT_SYMBOL_COPY_SAVED_INPUT");
  }
  return selected;
}

/** The M+1 symbol atom ticket and M+2 worker maximum are fixed by the original
 * creation plan. This cannot admit the metadata reader's unsupported gap via
 * a caller flag. The remaining M+3 slot is reserved for getStr's outer header.
 */
export function buildCurrentSymbolCopySavedReadProgram(original: CurrentSymbolCopyPlan, input: unknown): string {
  return program(request(original, input));
}

/** Compile only a size placeholder, never accept it as a native destination.
 * The compiler scaffolding counts toward the future readback's code bound.
 */
export function reserveCurrentSymbolCopySavedProgramCapacity(original: CurrentSymbolCopyPlan, expectedActor: CurrentSymbolCopySavedReadRequest["expectedActor"],
  startup: CurrentSymbolCopySavedReadRequest["startup"]): number {
  currentSymbolCopySourceRows(original);
  const wanted = original.destinationMetadata;
  const selected = currentSymbolCopySavedReadRequestSchema.parse(data({
    target: { projectUuid: original.source.projectUuid, branchUuid: original.source.branchUuid, ownerUuid: original.ownerUuid, symbolUuid: "0".repeat(16) },
    expectedBefore: { name: wanted.title, description: wanted.description, tagsJson: JSON.stringify(wanted.tags), source: "",
      version: "8640000000000000", ticket: original.metadataTicket },
    maximumTicket: original.canvasHeaderTicket, expectedActor, startup,
  }));
  if (Buffer.byteLength(JSON.stringify(selected)) > 262_144) { throw new Error("CURRENT_SYMBOL_COPY_SAVED_REQUEST_CAPACITY"); }
  return Buffer.byteLength(program(selected));
}

function program(selected: CurrentSymbolCopySavedReadRequest): string {
  const code = `const result=await(async()=>{
const selected=${JSON.stringify(selected)},target=selected.target,root=globalThis,apply=Reflect.apply;
let expired=false,timer,clear;
const bad=()=>{throw new Error('CURRENT_SYMBOL_COPY_SAVED_READ_REFUSED');};
const own=(owner,key,optional=false)=>{if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad();const d=Object.getOwnPropertyDescriptor(owner,key);if(!d){if(optional&&!(key in owner))return undefined;bad();}if(!Object.hasOwn(d,'value'))bad();return d.value;};
const plain=value=>{if(value===null||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)bad();return value;};
const method=(owner,key)=>{const chain=[];let node=owner;for(let i=0;i<4;i++){if(node===null||(typeof node!=='object'&&typeof node!=='function'))bad();chain.push(node);const d=Object.getOwnPropertyDescriptor(node,key);if(d){if(!Object.hasOwn(d,'value')||typeof d.value!=='function')bad();return{owner,key,chain,fn:d.value};}node=Object.getPrototypeOf(node);}bad();};
const methodCheck=binding=>{for(let i=0;i<binding.chain.length;i++){const node=binding.chain[i];if(i>0&&Object.getPrototypeOf(binding.chain[i-1])!==node)bad();if(i===binding.chain.length-1){if(own(node,binding.key)!==binding.fn)bad();}else if(Object.hasOwn(node,binding.key))bad();}};
try{
 const set=own(root,'setTimeout');clear=own(root,'clearTimeout');if(typeof set!=='function'||typeof clear!=='function')bad();
 ${buildCurrentProjectOnlySymbolGuard()}
 const startupExpected=selected.startup;
 ${buildCurrentSymbolStartupGuard()}
 const host=projectOnly.host,bus=own(host,'messageBus'),rpc=method(bus,'rpcCall'),edaOwner=eda;
 ${SYMBOL_DUAL_ACTOR_CAPTURE_SOURCE}
 if(!actorEqual(cachedActorProjection,selected.expectedActor)||!actorEqual(startupActorProjection,selected.expectedActor))bad();
 const same=()=>{projectOnly.check();startup.check();checkDualActor();methodCheck(rpc);if(expired||own(host,'messageBus')!==bus||eda!==edaOwner||own(edaOwner,'extensionUuid')!=='7e06d286b1ac846ef7eab9c7f2a9ee40'||own(root,'setTimeout')!==set||own(root,'clearTimeout')!==clear)bad();};
 const call=async(topic,args)=>{same();const raw=await apply(rpc.fn,bus,[topic,args,0]);same();return own(plain(raw),'message');};
 let client;
 const worker=async()=>{const next=await call('/PrjDB/project/getClient',[target.projectUuid]);if(typeof next!=='string'||!/^[a-f0-9]{16}$/.test(next)||(client!==undefined&&client!==next))bad();client=next;
  if(await call('/PrjDB/project/getMaxTicket',[target.projectUuid])!==selected.maximumTicket)bad();};
 const project=async()=>{const value=plain(await call('/PrjDB/project/getData',[target.projectUuid]));
  if(own(value,'uuid')!==target.projectUuid||own(value,'currentBranch')!==target.branchUuid||own(value,'isV2Format')!==false||own(plain(own(value,'owner')),'uuid')!==target.ownerUuid)bad();
  for(const key of ['archive','store','cbb_project']){const flag=own(value,key,true);if(flag!==undefined&&flag!==false&&flag!==null&&flag!==0)bad();}};
 const metadata=async()=>{const value=plain(await call('/PrjDB/symbol/getData',[target.symbolUuid,target.projectUuid]));
  if(own(value,'uuid')!==target.symbolUuid||own(value,'project_uuid')!==target.projectUuid||own(value,'path')!==target.projectUuid||own(value,'docType')!==2||own(plain(own(value,'owner')),'uuid')!==target.ownerUuid)bad();
  const expected=selected.expectedBefore;
  for(const [key,wanted] of [['display_title',expected.name],['description',expected.description],['custom_tags',expected.tagsJson],['source',expected.source],['version',expected.version],['ticket',expected.ticket]])if(own(value,key)!==wanted)bad();};
 const sample=async()=>{await project();await worker();await metadata();const content=await call('/PrjDB/symbol/getStr',[target.symbolUuid,target.projectUuid]);
  if(typeof content!=='string'||content.length===0||content.length>${CURRENT_SAVED_SYMBOL_CONTENT_LIMIT}||new TextEncoder().encode(content).byteLength>${CURRENT_SAVED_SYMBOL_CONTENT_LIMIT})bad();
  await metadata();await worker();await project();same();return content;};
 const run=async()=>{const first=await sample(),second=await sample();same();if(first!==second)bad();return{profile:'private.current-symbol-copy-saved-read-observation.v1',target,expectedBefore:selected.expectedBefore,expectedActor:selected.expectedActor,
  observation:{profile:'private.saved-symbol-content-observation.v1',projectUuid:target.projectUuid,targetUuid:target.symbolUuid,maximumTicket:selected.maximumTicket,workerClient:client,content:first,executionAuthorized:false,producerBindingVerified:false,completionProved:false},
  samples:2,noEditorTabsObserved:true,mutationDispatched:false,explicitSaveDispatched:false,executionAuthorized:false};};
 same();const deadline=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;reject(new Error('CURRENT_SYMBOL_COPY_SAVED_READ_REFUSED'));},${CURRENT_SAVED_SYMBOL_READ_TIMEOUT_MS}]);});return await Promise.race([run(),deadline]);
}catch{throw new Error('CURRENT_SYMBOL_COPY_SAVED_READ_REFUSED');}finally{if(timer!==undefined){try{apply(clear,root,[timer]);}catch{throw new Error('CURRENT_SYMBOL_COPY_SAVED_READ_REFUSED');}}}
})();
const json=JSON.stringify(result),utf8Bytes=new TextEncoder().encode(json).byteLength;
const envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};
if(utf8Bytes>${CURRENT_SAVED_SYMBOL_ENVELOPE_LIMIT}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${CURRENT_SAVED_SYMBOL_ENVELOPE_LIMIT})throw new Error('CURRENT_SYMBOL_COPY_SAVED_ENVELOPE');
return envelope;`;
  if (Buffer.byteLength(code) > 262_144) { throw new Error("CURRENT_SYMBOL_COPY_SAVED_PROGRAM_CAPACITY"); }
  return code;
}

export function decodeCurrentSymbolCopySavedReadReply(raw: unknown, original: CurrentSymbolCopyPlan, input: unknown): CurrentSymbolCopySavedReadObservation {
  const selected = request(original, input); assertUpstreamReplySettled(raw);
  const envelope = exact(extractToolPayload(raw), ["schema", "utf8Bytes", "json"]);
  if (envelope["schema"] !== EXACT_READ_ENVELOPE_SCHEMA || typeof envelope["json"] !== "string" || envelope["json"].length === 0 ||
    envelope["json"].length > CURRENT_SAVED_SYMBOL_ENVELOPE_LIMIT || Buffer.byteLength(JSON.stringify(envelope)) > CURRENT_SAVED_SYMBOL_ENVELOPE_LIMIT) {
    throw new Error("CURRENT_SYMBOL_COPY_SAVED_ENVELOPE");
  }
  const result = resultSchema.parse(decodeExactReadEnvelope(envelope));
  if (canonicalJson(result.target) !== canonicalJson(selected.target) || canonicalJson(result.expectedBefore) !== canonicalJson(selected.expectedBefore) ||
    canonicalJson(result.expectedActor) !== canonicalJson(selected.expectedActor) || result.observation.projectUuid !== selected.target.projectUuid ||
    result.observation.targetUuid !== selected.target.symbolUuid || result.observation.maximumTicket !== selected.maximumTicket ||
    Buffer.byteLength(result.observation.content) > CURRENT_SAVED_SYMBOL_CONTENT_LIMIT || Buffer.from(result.observation.content).toString("utf8") !== result.observation.content) {
    throw new Error("CURRENT_SYMBOL_COPY_SAVED_RESULT");
  }
  return Object.freeze(result);
}
