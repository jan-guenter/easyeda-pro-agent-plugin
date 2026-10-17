/** Private compiler only. Original SQL plans bind expected bytes, not a native
 * owner, actor producer, dispatch grant or completed persistence lifecycle.
 * No runtime registration calls this compiler.
 */
import { z } from "zod";
import { assertUpstreamReplySettled, canonicalJson, extractToolPayload } from "./core.ts";
import { EXACT_READ_ENVELOPE_SCHEMA, decodeExactReadEnvelope } from "./exact-readers.ts";
import { currentSymbolCopyProgramSource } from "./current-symbol-copy-plan.ts";
import { reserveCurrentSymbolCopySavedReadCapacity } from "./current-symbol-copy-capacity.ts";
import type { CurrentSymbolCopyPlan } from "./current-symbol-copy-plan.ts";
import { buildCurrentProjectOnlySymbolGuard } from "./current-project-only-symbol-guard.ts";
import { buildCurrentSymbolStartupGuard } from "./current-symbol-startup-guard.ts";
import { CURRENT_SYMBOL_WRITE_MAX_BYTES, CURRENT_SYMBOL_WRITE_TIMEOUT_MS, CURRENT_SYMBOL_WRITE_TIME_CEILING,
  currentSymbolWriteProgramInputSchema } from "./current-symbol-write-program.ts";
import { SYMBOL_DUAL_ACTOR_CAPTURE_SOURCE } from "./symbol-dual-actor.ts";

export const CURRENT_SYMBOL_COPY_PROGRAM_MAX_BYTES = 262_144;
export const CURRENT_SYMBOL_COPY_MAX_BYTES = CURRENT_SYMBOL_WRITE_MAX_BYTES;
export const CURRENT_SYMBOL_COPY_TIMEOUT_MS = CURRENT_SYMBOL_WRITE_TIMEOUT_MS;
const base = currentSymbolWriteProgramInputSchema.shape;
const integer = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).refine(value => !Object.is(value, -0));
const time = integer.max(CURRENT_SYMBOL_WRITE_TIME_CEILING);
const offset = base.rendererTimezoneOffsetMinutes;
const nativeId = z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u);
const client = z.string().regex(/^[a-f0-9]{16}$/u);
const observationSchema = z.object({ profile: z.literal("private.saved-symbol-content-observation.v1"), targetUuid: nativeId,
  maximumTicket: integer, workerClient: client, content: z.string().min(1).max(CURRENT_SYMBOL_COPY_PROGRAM_MAX_BYTES) }).strict();
export const currentSymbolCopyProgramInputSchema = z.object({ target: base.target, expectedBefore: base.expectedBefore,
  expectedActor: base.expectedActor, expectedWorker: z.object({ client, maxTicket: integer.max(Number.MAX_SAFE_INTEGER - 3) }).strict(),
  backendWindow: base.backendWindow, documentWindow: base.documentWindow, rendererTimezoneOffsetMinutes: offset,
  startup: base.startup, sourceObservation: observationSchema,
}).strict().refine(value => value.expectedBefore.ticket <= value.expectedWorker.maxTicket &&
  Math.max(value.backendWindow.minimumMs, value.documentWindow.minimumMs) <= Math.min(value.backendWindow.maximumMs, value.documentWindow.maximumMs));
export type CurrentSymbolCopyProgramInput = z.infer<typeof currentSymbolCopyProgramInputSchema>;

const metadataSchema = base.expectedBefore.extend({ uuid: nativeId, docType: z.union([z.literal(2), z.literal(20), z.literal(18), z.literal(19),
  z.literal(21), z.literal(22), z.literal(17), z.literal(25), z.literal(31)]) }).strict();
type Metadata = z.infer<typeof metadataSchema>;
const sampleSchema = z.object({ rendererBeforeMs: time, serverTimeMs: time, rendererAfterMs: time,
  rendererBeforeIso: z.string().max(32), rendererAfterIso: z.string().max(32), rendererTimezoneOffsetMinutes: offset, notifyTabId: client,
}).strict().refine(value => value.rendererBeforeMs <= value.serverTimeMs && value.serverTimeMs <= value.rendererAfterMs &&
  value.rendererAfterMs - value.rendererBeforeMs <= 10_000 && new Date(value.rendererBeforeMs).toISOString() === value.rendererBeforeIso &&
  new Date(value.rendererAfterMs).toISOString() === value.rendererAfterIso);
const createdSchema = metadataSchema.extend({ uuid: client, docType: z.literal(2), updateTime: time }).strict();
const resultSchema = z.object({ kind: z.literal("current-symbol-copy"), target: base.target, createdUuid: client,
  sourceBefore: base.expectedBefore, sourceAfter: base.expectedBefore, created: createdSchema,
  actor: base.expectedActor, client, beforeMaxTicket: integer, afterMaxTicket: integer, documentBefore: sampleSchema, documentAfter: sampleSchema,
  sourceContentMatched: z.literal(true), peerMetadataMatched: z.literal(true), mutationDispatched: z.literal(true), explicitSaveDispatched: z.literal(false),
  postCopyStartupQualified: z.literal(false), peerDesignInvarianceVerified: z.literal(false), backendActorVerified: z.literal(false),
  workerIdentityVerified: z.literal(false), crossInvocationReceiverContinuityVerified: z.literal(false), atomicCompareAndSwap: z.literal(false),
  persistenceVerified: z.literal(false), reopened: z.literal(false), producerBindingVerified: z.literal(false), executionAuthorized: z.literal(false),
}).strict();
export type CurrentSymbolCopyProgramResult = z.infer<typeof resultSchema>;
const stoppedSchema = z.object({ kind: z.literal("current-symbol-copy-stopped"), target: base.target, createdUuid: client,
  acknowledged: createdSchema.nullable(), nativeReturnAcknowledged: z.boolean(), destinationCollision: z.boolean(),
  failureStage: z.enum(["ACK", "POST_MUTATION", "CLOCK_AFTER", "AFTER", "TIMEOUT", "CLEANUP", "TIMEOUT_CLEANUP"]),
  client, beforeMaxTicket: integer, mutationDispatched: z.literal(true), readbackComplete: z.literal(false), explicitSaveDispatched: z.literal(false),
  postCopyStartupQualified: z.literal(false), peerDesignInvarianceVerified: z.literal(false), backendActorVerified: z.literal(false),
  workerIdentityVerified: z.literal(false), crossInvocationReceiverContinuityVerified: z.literal(false), atomicCompareAndSwap: z.literal(false),
  persistenceVerified: z.literal(false), reopened: z.literal(false), producerBindingVerified: z.literal(false), executionAuthorized: z.literal(false),
}).strict().refine(value => value.nativeReturnAcknowledged === (value.acknowledged !== null) &&
  (value.acknowledged === null || !value.destinationCollision) &&
  (value.acknowledged !== null || ["ACK", "CLEANUP", "TIMEOUT_CLEANUP"].includes(value.failureStage)));
export type CurrentSymbolCopyStoppedResult = z.infer<typeof stoppedSchema>;
interface Selected extends CurrentSymbolCopyProgramInput {
  readonly sourceContent: string; readonly sourceContentAfterCopy: string; readonly activeSymbols: readonly Metadata[];
  readonly occupiedStrings: readonly string[]; readonly destination: Omit<Metadata, "uuid" | "version" | "docType"> & { readonly docType: 2 };
}

function need(condition: boolean, message = "INPUT"): asserts condition { if (!condition) { throw new Error(`CURRENT_SYMBOL_COPY_${message}`); } }
function plainData(input: unknown, depth = 0): unknown {
  need(depth <= 5);
  if (input === null || typeof input === "string" || typeof input === "number" || typeof input === "boolean") { return input; }
  need(typeof input === "object");
  if (Array.isArray(input)) {
    need(Object.getPrototypeOf(input) === Array.prototype && input.length <= 4096 && Reflect.ownKeys(input).length === input.length + 1);
    const result: unknown[] = [];
    for (let index = 0; index < input.length; index += 1) {
      const descriptor = Object.getOwnPropertyDescriptor(input, String(index));
      need(descriptor !== undefined && Object.hasOwn(descriptor, "value")); result.push(plainData(descriptor.value as unknown, depth + 1));
    }
    return result;
  }
  need(Object.getPrototypeOf(input) === Object.prototype || Object.getPrototypeOf(input) === null);
  const keys = Reflect.ownKeys(input), result: Record<string, unknown> = {}; need(keys.length <= 32);
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    need(typeof key === "string" && descriptor !== undefined && Object.hasOwn(descriptor, "value"));
    Object.defineProperty(result, key, { value: plainData(descriptor.value as unknown, depth + 1), enumerable: true });
  }
  return result;
}
function request(original: CurrentSymbolCopyPlan, input: unknown): Selected {
  const selected = currentSymbolCopyProgramInputSchema.parse(plainData(input));
  need(Buffer.byteLength(JSON.stringify(selected)) <= CURRENT_SYMBOL_COPY_PROGRAM_MAX_BYTES);
  const source = currentSymbolCopyProgramSource(original, selected.sourceObservation);
  reserveCurrentSymbolCopySavedReadCapacity(original, selected.expectedActor, selected.startup);
  need(selected.target.projectUuid === original.source.projectUuid && selected.target.branchUuid === original.source.branchUuid &&
    selected.target.symbolUuid === original.source.symbolUuid && selected.target.ownerUuid === original.ownerUuid && selected.expectedWorker.maxTicket === original.maximumTicket &&
    selected.sourceObservation.workerClient === selected.expectedWorker.client, "PLAN");
  const activeSymbols = source.activeSymbols.map(entry => metadataSchema.parse({ uuid: entry.uuid, docType: entry.metadata["docType"],
    name: entry.metadata["title"], description: entry.metadata["description"], tagsJson: JSON.stringify(entry.metadata["tags"]),
    source: entry.metadata["source"], version: entry.header["version"], ticket: entry.maximumAtomTicket }));
  const sourceMetadata = activeSymbols.find(entry => entry.uuid === original.source.symbolUuid);
  need(sourceMetadata !== undefined, "PLAN");
  const { uuid: _uuid, docType: _type, ...before } = sourceMetadata;
  need(canonicalJson(before) === canonicalJson(selected.expectedBefore), "PLAN");
  const destination = { name: original.destinationMetadata.title, description: original.destinationMetadata.description,
    tagsJson: JSON.stringify(original.destinationMetadata.tags), source: "", ticket: original.metadataTicket, docType: 2 as const };
  const result = { ...selected, sourceContent: source.sourceContent, sourceContentAfterCopy: source.sourceContentAfterCopy,
    activeSymbols, occupiedStrings: source.occupiedStrings, destination };
  assertResultFits(result); return result;
}
function expectedCreated(selected: Selected, createdUuid: string, updateTime: number): CurrentSymbolCopyProgramResult["created"] {
  return { uuid: createdUuid, ...selected.destination, version: String(updateTime), updateTime };
}
function assertResultFits(selected: Selected): void {
  const maximumTime = 8_640_000_000_000_000;
  const sample = { rendererBeforeMs: maximumTime, serverTimeMs: maximumTime, rendererAfterMs: maximumTime,
    rendererBeforeIso: "0".repeat(32), rendererAfterIso: "0".repeat(32), rendererTimezoneOffsetMinutes: selected.rendererTimezoneOffsetMinutes,
    notifyTabId: "f".repeat(16) };
  const value: CurrentSymbolCopyProgramResult = { kind: "current-symbol-copy", target: selected.target, createdUuid: "f".repeat(16),
    sourceBefore: selected.expectedBefore, sourceAfter: selected.expectedBefore, created: expectedCreated(selected, "f".repeat(16), maximumTime),
    actor: selected.expectedActor, client: selected.expectedWorker.client, beforeMaxTicket: selected.expectedWorker.maxTicket,
    afterMaxTicket: selected.expectedWorker.maxTicket + 2, documentBefore: sample, documentAfter: sample,
    sourceContentMatched: true, peerMetadataMatched: true, mutationDispatched: true, explicitSaveDispatched: false,
    postCopyStartupQualified: false, peerDesignInvarianceVerified: false, backendActorVerified: false, workerIdentityVerified: false,
    crossInvocationReceiverContinuityVerified: false, atomicCompareAndSwap: false, persistenceVerified: false, reopened: false,
    producerBindingVerified: false, executionAuthorized: false };
  const stopped: CurrentSymbolCopyStoppedResult = { kind: "current-symbol-copy-stopped", target: selected.target, createdUuid: "f".repeat(16),
    acknowledged: value.created, nativeReturnAcknowledged: true, destinationCollision: false, failureStage: "TIMEOUT_CLEANUP",
    client: selected.expectedWorker.client, beforeMaxTicket: selected.expectedWorker.maxTicket, mutationDispatched: true, readbackComplete: false,
    explicitSaveDispatched: false, postCopyStartupQualified: false, peerDesignInvarianceVerified: false, backendActorVerified: false,
    workerIdentityVerified: false, crossInvocationReceiverContinuityVerified: false, atomicCompareAndSwap: false, persistenceVerified: false,
    reopened: false, producerBindingVerified: false, executionAuthorized: false };
  for (const output of [value, stopped]) {
    const json = JSON.stringify(output), utf8Bytes = Buffer.byteLength(json);
    need(utf8Bytes <= CURRENT_SYMBOL_COPY_MAX_BYTES && Buffer.byteLength(JSON.stringify({ schema: EXACT_READ_ENVELOPE_SCHEMA, utf8Bytes, json })) <= CURRENT_SYMBOL_COPY_MAX_BYTES,
      "OUTPUT_BUDGET");
  }
}

/** Fixed closed native clone, no Save, navigation, public copy, caller title or
 * callback. The future owner must journal before dispatch and retain the native
 * return. Clone intentionally changes symbol-cache membership; post-write reads
 * retain project/actor/RPC/Date guards, not the old startup membership claim.
 */
export function buildCurrentSymbolCopyProgram(original: CurrentSymbolCopyPlan, input: unknown): string {
  const selected = request(original, input);
  const program = `const result=await(async()=>{
const selected=${JSON.stringify(selected)},target=selected.target,root=globalThis,apply=Reflect.apply;
let expired=false,timer,clear,stage='HOST',guard=null,startupStage='project-only-context',dispatched=false,returnedUuid=null,acknowledged=null;
const refusal=()=>new Error('CURRENT_SYMBOL_COPY_REFUSED:'+stage+(guard===null||stage==='TIMEOUT'?'':':'+guard+(guard==='STARTUP'?':'+startupStage:'')));
const bad=()=>{throw refusal();};
const stopped=failureStage=>({kind:'current-symbol-copy-stopped',target,createdUuid:returnedUuid,acknowledged,nativeReturnAcknowledged:acknowledged!==null,destinationCollision:selected.occupiedStrings.some(value=>value.includes(returnedUuid)),failureStage,client:selected.expectedWorker.client,beforeMaxTicket:selected.expectedWorker.maxTicket,mutationDispatched:true,readbackComplete:false,explicitSaveDispatched:false,postCopyStartupQualified:false,peerDesignInvarianceVerified:false,backendActorVerified:false,workerIdentityVerified:false,crossInvocationReceiverContinuityVerified:false,atomicCompareAndSwap:false,persistenceVerified:false,reopened:false,producerBindingVerified:false,executionAuthorized:false});
const own=(owner,key,optional=false)=>{if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad();const d=Object.getOwnPropertyDescriptor(owner,key);if(!d){if(optional&&!(key in owner))return undefined;bad();}if(!Object.hasOwn(d,'value'))bad();return d.value;};
const plain=value=>{if(value===null||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)bad();return value;};
const method=(owner,key)=>{const chain=[];let node=owner;for(let i=0;i<4;i++){if(node===null||(typeof node!=='object'&&typeof node!=='function'))bad();chain.push(node);const d=Object.getOwnPropertyDescriptor(node,key);if(d){if(!Object.hasOwn(d,'value')||typeof d.value!=='function')bad();return{owner,key,chain,fn:d.value};}node=Object.getPrototypeOf(node);}bad();};
const methodCheck=binding=>{for(let i=0;i<binding.chain.length;i++){const node=binding.chain[i];if(i>0&&Object.getPrototypeOf(binding.chain[i-1])!==node)bad();if(i===binding.chain.length-1){if(own(node,binding.key)!==binding.fn)bad();}else if(Object.hasOwn(node,binding.key))bad();}};
const integer=value=>{if(typeof value!=='number'||!Number.isSafeInteger(value)||value<0||Object.is(value,-0))bad();return value;};
try{
 const set=own(root,'setTimeout');clear=own(root,'clearTimeout');if(typeof set!=='function'||typeof clear!=='function')bad();
 ${buildCurrentProjectOnlySymbolGuard()}
 const startupExpected=selected.startup;
 ${buildCurrentSymbolStartupGuard(true)}
 const host=projectOnly.host,bus=own(host,'messageBus'),rpc=method(bus,'rpcCall'),edaOwner=eda;
 ${SYMBOL_DUAL_ACTOR_CAPTURE_SOURCE}
 if(!actorEqual(cachedActorProjection,selected.expectedActor)||!actorEqual(startupActorProjection,selected.expectedActor))bad();
 const notifyTab=own(root,'_TAB_ID_');if(typeof notifyTab!=='string'||!/^[a-f0-9]{16}$/.test(notifyTab))bad();
 const notifyKey='/'+notifyTab+'/notify',concurrent=own(host,'concurrentBus'),clockRpc=method(concurrent,'rpcCall');
 const nativeDate=own(root,'Date'),dateNow=own(nativeDate,'now'),datePrototype=own(nativeDate,'prototype'),iso=own(datePrototype,'toISOString'),zone=own(datePrototype,'getTimezoneOffset');
 if(typeof nativeDate!=='function'||typeof dateNow!=='function'||typeof iso!=='function'||typeof zone!=='function')bad();
 const same=()=>{
  guard='PROJECT';projectOnly.check();if(!dispatched){guard='STARTUP';startup.check();}guard='ACTOR';checkDualActor();guard='RPC';methodCheck(rpc);methodCheck(clockRpc);
  guard='HOST';if(expired||own(host,'messageBus')!==bus||own(host,'concurrentBus')!==concurrent||own(root,notifyKey)!==concurrent||own(root,'_TAB_ID_')!==notifyTab||eda!==edaOwner||own(edaOwner,'extensionUuid')!=='7e06d286b1ac846ef7eab9c7f2a9ee40')bad();
  guard='DATE';if(own(root,'setTimeout')!==set||own(root,'clearTimeout')!==clear||own(root,'Date')!==nativeDate||own(nativeDate,'now')!==dateNow||own(nativeDate,'prototype')!==datePrototype||own(datePrototype,'toISOString')!==iso||own(datePrototype,'getTimezoneOffset')!==zone)bad();guard=null;
 };
 let lastNow;
 const now=()=>{same();const value=integer(apply(dateNow,nativeDate,[]));if(value>8640000000000000||(lastNow!==undefined&&value<lastNow))bad();lastNow=value;const date=new nativeDate(value);if(apply(zone,date,[])!==selected.rendererTimezoneOffsetMinutes)bad();same();return{value,iso:apply(iso,date,[])};};
 const deadline=()=>{same();const stamp=integer(apply(dateNow,nativeDate,[]));if((lastNow!==undefined&&stamp<lastNow)||stamp<selected.backendWindow.minimumMs||stamp>selected.backendWindow.maximumMs||stamp<selected.documentWindow.minimumMs||stamp>selected.documentWindow.maximumMs||apply(zone,new nativeDate(stamp),[])!==selected.rendererTimezoneOffsetMinutes)bad();lastNow=stamp;};
 const call=async(topic,args)=>{same();const reply=await apply(rpc.fn,bus,[topic,args,0]);same();return own(plain(reply),'message');};
 const clock=async()=>{const before=now(),serverTimeMs=await apply(clockRpc.fn,concurrent,['/pro-mgr/serverTime/now']);same();integer(serverTimeMs);const after=now();if(before.value>serverTimeMs||serverTimeMs>after.value||after.value-before.value>10000||serverTimeMs<selected.documentWindow.minimumMs||serverTimeMs>selected.documentWindow.maximumMs)bad();return{rendererBeforeMs:before.value,serverTimeMs,rendererAfterMs:after.value,rendererBeforeIso:before.iso,rendererAfterIso:after.iso,rendererTimezoneOffsetMinutes:selected.rendererTimezoneOffsetMinutes,notifyTabId:notifyTab};};
 const project=async()=>{const value=plain(await call('/PrjDB/project/getData',[target.projectUuid]));if(own(value,'uuid')!==target.projectUuid||own(value,'currentBranch')!==target.branchUuid||own(value,'isV2Format')!==false||own(plain(own(value,'owner')),'uuid')!==target.ownerUuid)bad();for(const key of ['archive','store','cbb_project']){const flag=own(value,key,true);if(flag!==undefined&&flag!==false&&flag!==null&&flag!==0)bad();}};
 const worker=async(expectedTicket)=>{const observedClient=await call('/PrjDB/project/getClient',[target.projectUuid]),ticket=await call('/PrjDB/project/getMaxTicket',[target.projectUuid]);if(observedClient!==selected.expectedWorker.client||integer(ticket)!==expectedTicket)bad();};
 const metadata=(raw,expected)=>{const value=plain(raw);if(own(value,'uuid')!==expected.uuid||own(value,'project_uuid')!==target.projectUuid||own(value,'path')!==target.projectUuid||own(plain(own(value,'owner')),'uuid')!==target.ownerUuid||own(value,'docType')!==expected.docType)bad();
  const result={name:own(value,'display_title'),description:own(value,'description'),tagsJson:own(value,'custom_tags'),source:own(value,'source'),version:own(value,'version'),ticket:integer(own(value,'ticket'))};
  if(own(value,'title')!==expected.name.toLocaleLowerCase())bad();for(const key of ['name','description','tagsJson','source','version','ticket'])if(result[key]!==expected[key])bad();return result;};
 const roster=async(created)=>{const values=plain(await call('/PrjDB/symbol/getAllKVDatas',[target.projectUuid])),keys=Reflect.ownKeys(values),expected=created?[...selected.activeSymbols,created]:selected.activeSymbols;if(keys.length!==expected.length||keys.some(key=>typeof key!=='string'||!expected.some(item=>item.uuid===key)))bad();for(const item of expected)metadata(own(values,item.uuid),item);};
 const source=async(after)=>{const value=await call('/PrjDB/symbol/getStr',[target.symbolUuid,target.projectUuid]);if(typeof value!=='string'||value!==(after?selected.sourceContentAfterCopy:selected.sourceContent))bad();};
 const original=selected.activeSymbols.find(item=>item.uuid===target.symbolUuid);
 const run=async()=>{
  stage='DEADLINE';deadline();stage='PERMISSION';const permission=plain(await call('canAddLib',[target.projectUuid]));if(own(permission,'hasPermission')!==true)bad();
  stage='BEFORE';await project();await worker(selected.expectedWorker.maxTicket);await roster();const sourceBefore=metadata(await call('/PrjDB/symbol/getData',[target.symbolUuid,target.projectUuid]),original);await source(false);
  stage='CLOCK_BEFORE';const documentBefore=await clock();
  stage='FINAL_BEFORE';await project();await roster();metadata(await call('/PrjDB/symbol/getData',[target.symbolUuid,target.projectUuid]),original);await source(false);await worker(selected.expectedWorker.maxTicket);
  stage='DEADLINE';deadline();const payload={source:target.symbolUuid,renameKey:true,keepSource:false};
  stage='MUTATION';dispatched=true;const raw=await apply(rpc.fn,bus,['/PrjDB/symbol/cloneData',[payload,target.projectUuid],0]);
  if(expired)bad();
  stage='ACK';const native=plain(own(plain(raw),'message')),createdUuid=own(native,'uuid');
  if(typeof createdUuid!=='string'||!/^[a-f0-9]{16}$/.test(createdUuid))bad();returnedUuid=createdUuid;
  if(selected.occupiedStrings.some(value=>value.includes(createdUuid)))bad();
  const stamp=integer(own(native,'updateTime'));if(stamp<selected.documentWindow.minimumMs||stamp>selected.documentWindow.maximumMs)bad();
  const expected={uuid:createdUuid,...selected.destination,version:String(stamp)},ack=Object.freeze({uuid:createdUuid,docType:2,...metadata(native,expected),updateTime:stamp});
  acknowledged=ack;
  stage='POST_MUTATION';same();stage='CLOCK_AFTER';const documentAfter=await clock();
  if(documentAfter.rendererBeforeMs<documentBefore.rendererAfterMs||stamp<documentBefore.serverTimeMs||stamp>documentAfter.serverTimeMs)bad();
  stage='AFTER';await project();await roster(expected);const sourceAfter=metadata(await call('/PrjDB/symbol/getData',[target.symbolUuid,target.projectUuid]),original);await source(true);
  const nativeAfter=plain(await call('/PrjDB/symbol/getData',[createdUuid,target.projectUuid]));metadata(nativeAfter,expected);if(own(nativeAfter,'updateTime')!==stamp)bad();await worker(selected.expectedWorker.maxTicket+2);same();
  return{kind:'current-symbol-copy',target,createdUuid,sourceBefore,sourceAfter,created:ack,actor:cachedActorProjection,client:selected.expectedWorker.client,beforeMaxTicket:selected.expectedWorker.maxTicket,afterMaxTicket:selected.expectedWorker.maxTicket+2,documentBefore,documentAfter,
   sourceContentMatched:true,peerMetadataMatched:true,mutationDispatched:true,explicitSaveDispatched:false,postCopyStartupQualified:false,peerDesignInvarianceVerified:false,backendActorVerified:false,workerIdentityVerified:false,crossInvocationReceiverContinuityVerified:false,atomicCompareAndSwap:false,persistenceVerified:false,reopened:false,producerBindingVerified:false,executionAuthorized:false};
 };
 same();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;stage='TIMEOUT';reject(new Error('CURRENT_SYMBOL_COPY_REFUSED:TIMEOUT'));},${CURRENT_SYMBOL_COPY_TIMEOUT_MS}]);});return await Promise.race([run(),timeout]);
}catch{if(returnedUuid!==null)return stopped(stage);throw refusal();}finally{if(timer!==undefined){try{apply(clear,root,[timer]);}catch{if(returnedUuid!==null)return stopped(expired?'TIMEOUT_CLEANUP':'CLEANUP');throw new Error('CURRENT_SYMBOL_COPY_REFUSED:'+(expired?'TIMEOUT_CLEANUP':'CLEANUP'));}}}
})();
const json=JSON.stringify(result),utf8Bytes=new TextEncoder().encode(json).byteLength,envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};
if(utf8Bytes>${CURRENT_SYMBOL_COPY_MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${CURRENT_SYMBOL_COPY_MAX_BYTES})throw new Error('CURRENT_SYMBOL_COPY_ENVELOPE');return envelope;`;
  need(Buffer.byteLength(program) <= CURRENT_SYMBOL_COPY_PROGRAM_MAX_BYTES, "PROGRAM_BUDGET"); return program;
}

export function decodeCurrentSymbolCopyReply(raw: unknown, original: CurrentSymbolCopyPlan, input: unknown): CurrentSymbolCopyProgramResult {
  const selected = request(original, input); assertUpstreamReplySettled(raw);
  const envelope = plainData(extractToolPayload(raw)); need(Buffer.byteLength(JSON.stringify(envelope)) <= CURRENT_SYMBOL_COPY_MAX_BYTES, "ENVELOPE");
  const value = resultSchema.parse(decodeExactReadEnvelope(envelope));
  need(canonicalJson(value.target) === canonicalJson(selected.target) && canonicalJson(value.sourceBefore) === canonicalJson(selected.expectedBefore) &&
    canonicalJson(value.sourceAfter) === canonicalJson(selected.expectedBefore) && canonicalJson(value.actor) === canonicalJson(selected.expectedActor) &&
    canonicalJson(value.created) === canonicalJson(expectedCreated(selected, value.createdUuid, value.created.updateTime)) &&
    !selected.occupiedStrings.some(entry => entry.includes(value.createdUuid)) && value.client === selected.expectedWorker.client &&
    value.beforeMaxTicket === selected.expectedWorker.maxTicket && value.afterMaxTicket === selected.expectedWorker.maxTicket + 2 &&
    value.documentBefore.notifyTabId === value.documentAfter.notifyTabId && value.documentBefore.rendererAfterMs <= value.documentAfter.rendererBeforeMs &&
    value.created.updateTime >= value.documentBefore.serverTimeMs && value.created.updateTime <= value.documentAfter.serverTimeMs &&
    [value.documentBefore, value.documentAfter].every(sample => sample.rendererTimezoneOffsetMinutes === selected.rendererTimezoneOffsetMinutes &&
      sample.serverTimeMs >= selected.documentWindow.minimumMs && sample.serverTimeMs <= selected.documentWindow.maximumMs), "RESULT");
  return Object.freeze(value);
}

/** Retained return identity is diagnostic evidence, not an accepted destination,
 * retry permission or persistence proof. The original native UUID survives even
 * when its ACK is invalid; it is never recovered through a roster/name lookup.
 */
export function decodeCurrentSymbolCopyStoppedReply(raw: unknown, original: CurrentSymbolCopyPlan, input: unknown): CurrentSymbolCopyStoppedResult {
  const selected = request(original, input); assertUpstreamReplySettled(raw);
  const envelope = plainData(extractToolPayload(raw)); need(Buffer.byteLength(JSON.stringify(envelope)) <= CURRENT_SYMBOL_COPY_MAX_BYTES, "ENVELOPE");
  const value = stoppedSchema.parse(decodeExactReadEnvelope(envelope));
  need(canonicalJson(value.target) === canonicalJson(selected.target) && value.client === selected.expectedWorker.client &&
    value.beforeMaxTicket === selected.expectedWorker.maxTicket &&
    value.destinationCollision === selected.occupiedStrings.some(entry => entry.includes(value.createdUuid)) &&
    (value.acknowledged === null || (canonicalJson(value.acknowledged) === canonicalJson(expectedCreated(selected, value.createdUuid, value.acknowledged.updateTime)) &&
      value.acknowledged.updateTime >= selected.documentWindow.minimumMs && value.acknowledged.updateTime <= selected.documentWindow.maximumMs)), "STOPPED_RESULT");
  if (value.acknowledged !== null) { Object.freeze(value.acknowledged); }
  Object.freeze(value.target); return Object.freeze(value);
}
