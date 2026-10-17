/** Private current-version compiler. Supplied comparisons are not dispatch
 * authority. The disposable lifecycle owns its only registered route and must journal once,
 * qualify startup/source effects and verify the complete closed lifecycle.
 */
import { z } from "zod";
import { assertUpstreamReplySettled, canonicalJson, extractToolPayload } from "./core.ts";
import { EXACT_READ_ENVELOPE_SCHEMA, decodeExactReadEnvelope } from "./exact-readers.ts";
import { currentProjectOnlySymbolPreflightRequestSchema } from "./current-project-only-symbol-preflight.ts";
import { buildCurrentProjectOnlySymbolGuard } from "./current-project-only-symbol-guard.ts";
import { currentSymbolStartupExpectationSchema } from "./current-symbol-startup.ts";
import { buildCurrentSymbolStartupGuard } from "./current-symbol-startup-guard.ts";
import { ACTOR_NAME_MAX_CODE_UNITS, SYMBOL_DUAL_ACTOR_CAPTURE_SOURCE } from "./symbol-dual-actor.ts";

export const CURRENT_SYMBOL_WRITE_TIMEOUT_MS = 15_000;
export const CURRENT_SYMBOL_WRITE_MAX_BYTES = 393_216;
const integer = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).refine((value) => !Object.is(value, -0));
const time = integer.max(8_640_000_000_000_000 - 60_000);
const offset = z.number().int().min(-840).max(840).refine((value) => !Object.is(value, -0));
const actorSchema = z.object({ uuid: z.string().regex(/^[a-f0-9]{32}$/u), username: z.string().min(1).max(ACTOR_NAME_MAX_CODE_UNITS),
  nickname: z.string().max(ACTOR_NAME_MAX_CODE_UNITS) }).strict();
const windowSchema = z.object({ minimumMs: time, maximumMs: time }).strict()
  .refine((value) => value.maximumMs - value.minimumMs === 60_000);
const beforeSchema = currentProjectOnlySymbolPreflightRequestSchema.shape.expectedBefore;
export const currentSymbolWriteProgramInputSchema = currentProjectOnlySymbolPreflightRequestSchema.extend({
  desired: z.object({ name: z.string().min(1).max(512).refine((value) => value.trim().length > 0), description: z.string().max(65_536) }).strict(),
  peerNames: z.array(z.string().min(1).max(512)).max(4096),
  expectedActor: actorSchema,
  expectedWorker: z.object({ client: z.string().regex(/^[a-f0-9]{16}$/u), maxTicket: integer.max(Number.MAX_SAFE_INTEGER - 1) }).strict(),
  backendWindow: windowSchema, documentWindow: windowSchema, rendererTimezoneOffsetMinutes: offset,
  startup: currentSymbolStartupExpectationSchema,
}).strict().refine((value) => value.expectedBefore.ticket <= value.expectedWorker.maxTicket &&
  (value.desired.name !== value.expectedBefore.name || value.desired.description !== value.expectedBefore.description) &&
  value.peerNames.every((name) => name.trim().toLowerCase() !== value.desired.name.trim().toLowerCase()) &&
  Math.max(value.backendWindow.minimumMs, value.documentWindow.minimumMs) <= Math.min(value.backendWindow.maximumMs, value.documentWindow.maximumMs))
  .refine((value) => !value.startup.templates.some((template) => template.uuid === value.target.symbolUuid),
    "Current symbol metadata writes require a symbol not referenced by active schematic pages.");
export type CurrentSymbolWriteProgramInput = z.infer<typeof currentSymbolWriteProgramInputSchema>;

const sampleSchema = z.object({ rendererBeforeMs: time, serverTimeMs: time, rendererAfterMs: time,
  rendererBeforeIso: z.string().max(32), rendererAfterIso: z.string().max(32), rendererTimezoneOffsetMinutes: offset,
  notifyTabId: z.string().regex(/^[a-f0-9]{16}$/u) }).strict().refine((value) =>
  value.rendererBeforeMs <= value.serverTimeMs && value.serverTimeMs <= value.rendererAfterMs &&
  value.rendererAfterMs - value.rendererBeforeMs <= 10_000 &&
  new Date(value.rendererBeforeMs).toISOString() === value.rendererBeforeIso && new Date(value.rendererAfterMs).toISOString() === value.rendererAfterIso);
const resultSchema = z.object({ kind: z.literal("current-symbol-metadata-write"), target: currentProjectOnlySymbolPreflightRequestSchema.shape.target,
  before: beforeSchema, after: beforeSchema.extend({ updateTime: time }).strict(),
  actor: actorSchema, client: z.string().regex(/^[a-f0-9]{16}$/u), beforeMaxTicket: integer, afterMaxTicket: integer,
  documentBefore: sampleSchema, documentAfter: sampleSchema,
  mutationDispatched: z.literal(true), explicitSaveDispatched: z.literal(false),
  backendActorVerified: z.literal(false), workerIdentityVerified: z.literal(false),
  crossInvocationReceiverContinuityVerified: z.literal(false), atomicCompareAndSwap: z.literal(false),
  persistenceVerified: z.literal(false), reopened: z.literal(false), executionAuthorized: z.literal(false),
}).strict();
export type CurrentSymbolWriteProgramResult = z.infer<typeof resultSchema>;

/** Avoid invoking input getters before validation or embedding unbounded data. */
function plainData(input: unknown, depth = 0): unknown {
  if (depth > 5) { throw new Error("CURRENT_SYMBOL_WRITE_INPUT"); }
  if (input === null || typeof input === "string" || typeof input === "number" || typeof input === "boolean") { return input; }
  if (typeof input !== "object") { throw new TypeError("CURRENT_SYMBOL_WRITE_INPUT"); }
  if (Array.isArray(input)) {
    if (Object.getPrototypeOf(input) !== Array.prototype || input.length > 4096 || Reflect.ownKeys(input).length !== input.length + 1) {
      throw new Error("CURRENT_SYMBOL_WRITE_INPUT");
    }
    const result: unknown[] = [];
    for (let index = 0; index < input.length; index += 1) {
      const property = Object.getOwnPropertyDescriptor(input, String(index));
      if (property === undefined || !Object.hasOwn(property, "value")) { throw new Error("CURRENT_SYMBOL_WRITE_INPUT"); }
      result.push(plainData(property.value as unknown, depth + 1));
    }
    return result;
  }
  if (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null) { throw new Error("CURRENT_SYMBOL_WRITE_INPUT"); }
  const keys = Reflect.ownKeys(input), result: Record<string, unknown> = {};
  if (keys.length > 32) { throw new Error("CURRENT_SYMBOL_WRITE_INPUT"); }
  for (const key of keys) {
    const property = Object.getOwnPropertyDescriptor(input, key);
    if (typeof key !== "string" || property === undefined || !Object.hasOwn(property, "value")) { throw new Error("CURRENT_SYMBOL_WRITE_INPUT"); }
    Object.defineProperty(result, key, { value: plainData(property.value as unknown, depth + 1), enumerable: true });
  }
  return result;
}
function request(input: unknown): CurrentSymbolWriteProgramInput {
  const value = currentSymbolWriteProgramInputSchema.parse(plainData(input));
  if (Buffer.byteLength(JSON.stringify(value), "utf8") > 2_097_152) { throw new Error("CURRENT_SYMBOL_WRITE_INPUT"); }
  assertResultFits(value);
  return value;
}

/** Refuse deterministic output overflow before generating any executable code.
 * Known strings are serialized exactly, including multibyte and escaped data.
 * Unknown timestamps/ISO/notify fields use their maximum encoded lengths; the
 * outer envelope escapes the whole inner JSON a second time.
 */
function assertResultFits(selected: CurrentSymbolWriteProgramInput): void {
  const maximumTime = 8_640_000_000_000_000;
  const sample = { rendererBeforeMs: maximumTime, serverTimeMs: maximumTime, rendererAfterMs: maximumTime,
    rendererBeforeIso: "0".repeat(32), rendererAfterIso: "0".repeat(32), rendererTimezoneOffsetMinutes: selected.rendererTimezoneOffsetMinutes,
    notifyTabId: "f".repeat(16) };
  const projected: CurrentSymbolWriteProgramResult = {
    kind: "current-symbol-metadata-write", target: selected.target, before: selected.expectedBefore,
    after: { ...selected.expectedBefore, ...selected.desired, version: String(maximumTime), ticket: selected.expectedWorker.maxTicket + 1, updateTime: maximumTime },
    actor: selected.expectedActor, client: selected.expectedWorker.client,
    beforeMaxTicket: selected.expectedWorker.maxTicket, afterMaxTicket: selected.expectedWorker.maxTicket + 1,
    documentBefore: sample, documentAfter: sample, mutationDispatched: true, explicitSaveDispatched: false,
    backendActorVerified: false, workerIdentityVerified: false, crossInvocationReceiverContinuityVerified: false,
    atomicCompareAndSwap: false, persistenceVerified: false, reopened: false, executionAuthorized: false,
  };
  const json = JSON.stringify(projected), utf8Bytes = Buffer.byteLength(json, "utf8");
  if (utf8Bytes > CURRENT_SYMBOL_WRITE_MAX_BYTES || Buffer.byteLength(JSON.stringify({ schema: EXACT_READ_ENVELOPE_SCHEMA, utf8Bytes, json }), "utf8") > CURRENT_SYMBOL_WRITE_MAX_BYTES) {
    throw new Error("CURRENT_SYMBOL_WRITE_OUTPUT_BUDGET");
  }
}

/** Fixed project-qualified update, never a public modifier or Save. The two
 * windows are inputs frozen by the original coordinator, not learned here.
 * Local receiver retention covers this invocation only. Earlier N0 is a time
 * anchor, not evidence that the same receiver survived another invocation.
 */
export function buildCurrentSymbolWriteProgram(input: unknown): string {
  const selected = request(input);
  return `const result=await(async()=>{
const selected=${JSON.stringify(selected)},target=selected.target,root=globalThis,apply=Reflect.apply;
let expired=false,timer,clear,stage='HOST',guard=null,startupStage='project-only-context';
const refusal=()=>new Error('CURRENT_SYMBOL_WRITE_REFUSED:'+stage+(guard===null||stage==='TIMEOUT'?'':':'+guard+(guard==='STARTUP'?':'+startupStage:'')));
const bad=()=>{throw refusal();};
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
 const nativeDate=own(root,'Date'),dateNow=own(nativeDate,'now'),datePrototype=own(nativeDate,'prototype');
 const iso=own(datePrototype,'toISOString'),zone=own(datePrototype,'getTimezoneOffset');
 if(typeof nativeDate!=='function'||typeof dateNow!=='function'||typeof iso!=='function'||typeof zone!=='function')bad();
 const same=()=>{
  guard='PROJECT';projectOnly.check();guard='STARTUP';startup.check();guard='ACTOR';checkDualActor();guard='RPC';methodCheck(rpc);methodCheck(clockRpc);
  guard='HOST';
  if(expired||own(host,'messageBus')!==bus||own(host,'concurrentBus')!==concurrent||own(root,notifyKey)!==concurrent||own(root,'_TAB_ID_')!==notifyTab||eda!==edaOwner||own(edaOwner,'extensionUuid')!=='7e06d286b1ac846ef7eab9c7f2a9ee40')bad();
  guard='DATE';if(own(root,'setTimeout')!==set||own(root,'clearTimeout')!==clear||own(root,'Date')!==nativeDate||own(nativeDate,'now')!==dateNow||own(nativeDate,'prototype')!==datePrototype||own(datePrototype,'toISOString')!==iso||own(datePrototype,'getTimezoneOffset')!==zone)bad();
  guard=null;
 };
 let lastNow;
 const now=()=>{same();const value=integer(apply(dateNow,nativeDate,[]));if(value>8640000000000000||(lastNow!==undefined&&value<lastNow))bad();lastNow=value;const date=new nativeDate(value);if(apply(zone,date,[])!==selected.rendererTimezoneOffsetMinutes)bad();same();return{value,iso:apply(iso,date,[])};};
 const deadline=()=>{same();const stamp=integer(apply(dateNow,nativeDate,[]));if((lastNow!==undefined&&stamp<lastNow)||stamp<selected.backendWindow.minimumMs||stamp>selected.backendWindow.maximumMs||stamp<selected.documentWindow.minimumMs||stamp>selected.documentWindow.maximumMs||apply(zone,new nativeDate(stamp),[])!==selected.rendererTimezoneOffsetMinutes)bad();lastNow=stamp;};
 const call=async(topic,args)=>{same();const reply=await apply(rpc.fn,bus,[topic,args,0]);same();return own(plain(reply),'message');};
 const clock=async()=>{
  const before=now(),serverTimeMs=await apply(clockRpc.fn,concurrent,['/pro-mgr/serverTime/now']);same();integer(serverTimeMs);const after=now();
  if(before.value>serverTimeMs||serverTimeMs>after.value||after.value-before.value>10000||serverTimeMs<selected.documentWindow.minimumMs||serverTimeMs>selected.documentWindow.maximumMs)bad();
  return{rendererBeforeMs:before.value,serverTimeMs,rendererAfterMs:after.value,rendererBeforeIso:before.iso,rendererAfterIso:after.iso,rendererTimezoneOffsetMinutes:selected.rendererTimezoneOffsetMinutes,notifyTabId:notifyTab};
 };
 const project=async()=>{const value=plain(await call('/PrjDB/project/getData',[target.projectUuid]));
  if(own(value,'uuid')!==target.projectUuid||own(value,'currentBranch')!==target.branchUuid||own(value,'isV2Format')!==false||own(plain(own(value,'owner')),'uuid')!==target.ownerUuid)bad();
  for(const key of ['archive','store','cbb_project']){const flag=own(value,key,true);if(flag!==undefined&&flag!==false&&flag!==null&&flag!==0)bad();}
 };
 const worker=async(expectedTicket)=>{const client=await call('/PrjDB/project/getClient',[target.projectUuid]),ticket=await call('/PrjDB/project/getMaxTicket',[target.projectUuid]);
  if(client!==selected.expectedWorker.client||integer(ticket)!==expectedTicket)bad();
 };
 const metadata=(raw,after)=>{const value=plain(raw);
  if(own(value,'uuid')!==target.symbolUuid||own(value,'project_uuid')!==target.projectUuid||own(value,'path')!==target.projectUuid||own(value,'docType')!==2||own(plain(own(value,'owner')),'uuid')!==target.ownerUuid)bad();
  const expected=selected.expectedBefore,name=own(value,'display_title'),description=own(value,'description'),tagsJson=own(value,'custom_tags'),source=own(value,'source'),version=own(value,'version'),ticket=integer(own(value,'ticket'));
  if(name!==(after?selected.desired.name:expected.name)||description!==(after?selected.desired.description:expected.description)||tagsJson!==expected.tagsJson||source!==expected.source||(!after&&version!==expected.version)||ticket!==(after?selected.expectedWorker.maxTicket+1:expected.ticket))bad();
  const result={name,description,tagsJson,source,version,ticket};
  if(after){const stamp=integer(own(value,'updateTime'));if(stamp<selected.documentWindow.minimumMs||stamp>selected.documentWindow.maximumMs||version!==String(stamp))bad();result.updateTime=stamp;}
  return result;
 };
 const run=async()=>{
  stage='DEADLINE';deadline();
  if(selected.peerNames.some(name=>name.trim().toLocaleLowerCase()===selected.desired.name.trim().toLocaleLowerCase()))bad();
  stage='PERMISSION';const permission=plain(await call('canAddLib',[target.projectUuid]));if(own(permission,'hasPermission')!==true)bad();
  stage='BEFORE';await project();await worker(selected.expectedWorker.maxTicket);const before=metadata(await call('/PrjDB/symbol/getData',[target.symbolUuid,target.projectUuid]),false);
  stage='CLOCK_BEFORE';const documentBefore=await clock();
  stage='FINAL_BEFORE';await project();metadata(await call('/PrjDB/symbol/getData',[target.symbolUuid,target.projectUuid]),false);await worker(selected.expectedWorker.maxTicket);
  const patch={uuid:target.symbolUuid,title:selected.desired.name,description:selected.desired.description};
  stage='DEADLINE';deadline();
  // No await, public modifier, Save, retry, source change or classification patch between this deadline and the sole mutation.
  stage='MUTATION';const raw=await apply(rpc.fn,bus,['/PrjDB/symbol/updateData',[patch,target.projectUuid],0]);
  stage='POST_MUTATION';same();
  stage='ACK';const ack=metadata(own(plain(raw),'message'),true);
  stage='CLOCK_AFTER';const documentAfter=await clock();
  if(documentAfter.rendererBeforeMs<documentBefore.rendererAfterMs||ack.updateTime<documentBefore.serverTimeMs||ack.updateTime>documentAfter.serverTimeMs)bad();
  stage='AFTER';await project();const after=metadata(await call('/PrjDB/symbol/getData',[target.symbolUuid,target.projectUuid]),true);await worker(selected.expectedWorker.maxTicket+1);same();
  if(JSON.stringify(after)!==JSON.stringify(ack))bad();
  return{kind:'current-symbol-metadata-write',target,before,after,actor:cachedActorProjection,client:selected.expectedWorker.client,beforeMaxTicket:selected.expectedWorker.maxTicket,afterMaxTicket:selected.expectedWorker.maxTicket+1,documentBefore,documentAfter,
   mutationDispatched:true,explicitSaveDispatched:false,backendActorVerified:false,workerIdentityVerified:false,crossInvocationReceiverContinuityVerified:false,atomicCompareAndSwap:false,persistenceVerified:false,reopened:false,executionAuthorized:false};
 };
 same();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;stage='TIMEOUT';reject(new Error('CURRENT_SYMBOL_WRITE_REFUSED:TIMEOUT'));},${CURRENT_SYMBOL_WRITE_TIMEOUT_MS}]);});
 return await Promise.race([run(),timeout]);
}catch{throw refusal();}
finally{if(timer!==undefined){try{apply(clear,root,[timer]);}catch{throw new Error('CURRENT_SYMBOL_WRITE_REFUSED:'+(expired?'TIMEOUT_CLEANUP':'CLEANUP'));}}}
})();
const json=JSON.stringify(result),utf8Bytes=new TextEncoder().encode(json).byteLength;
const envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};
if(utf8Bytes>${CURRENT_SYMBOL_WRITE_MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${CURRENT_SYMBOL_WRITE_MAX_BYTES})throw new Error('CURRENT_SYMBOL_WRITE_ENVELOPE');
return envelope;`;
}

export function decodeCurrentSymbolWriteReply(raw: unknown, input: unknown): CurrentSymbolWriteProgramResult {
  const selected = request(input);
  assertUpstreamReplySettled(raw);
  const envelope = plainData(extractToolPayload(raw));
  if (Buffer.byteLength(JSON.stringify(envelope), "utf8") > CURRENT_SYMBOL_WRITE_MAX_BYTES) { throw new Error("CURRENT_SYMBOL_WRITE_ENVELOPE"); }
  const value = resultSchema.parse(decodeExactReadEnvelope(envelope));
  const expectedAfter = { ...selected.expectedBefore, ...selected.desired, version: String(value.after.updateTime), ticket: selected.expectedWorker.maxTicket + 1,
    updateTime: value.after.updateTime };
  if (canonicalJson(value.target) !== canonicalJson(selected.target) || canonicalJson(value.before) !== canonicalJson(selected.expectedBefore) ||
    canonicalJson(value.actor) !== canonicalJson(selected.expectedActor) || canonicalJson(value.after) !== canonicalJson(expectedAfter) ||
    value.client !== selected.expectedWorker.client || value.beforeMaxTicket !== selected.expectedWorker.maxTicket || value.afterMaxTicket !== selected.expectedWorker.maxTicket + 1 ||
    value.documentBefore.notifyTabId !== value.documentAfter.notifyTabId || value.documentBefore.rendererAfterMs > value.documentAfter.rendererBeforeMs ||
    value.after.updateTime < value.documentBefore.serverTimeMs || value.after.updateTime > value.documentAfter.serverTimeMs ||
    [value.documentBefore, value.documentAfter].some((sample) => sample.rendererTimezoneOffsetMinutes !== selected.rendererTimezoneOffsetMinutes ||
      sample.serverTimeMs < selected.documentWindow.minimumMs || sample.serverTimeMs > selected.documentWindow.maximumMs)) {
    throw new Error("CURRENT_SYMBOL_WRITE_RESULT");
  }
  return Object.freeze(value);
}
