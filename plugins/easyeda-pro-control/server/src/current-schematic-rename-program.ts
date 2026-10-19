/** Fixed SCH compiler consumed by the original one-attempt writer lifecycle.
 * Original data identity alone grants no dispatch. The coordinator supplies
 * retained ownership, clock evidence and durable intent; connected validation
 * remains separate from synthetic compiler and lifecycle tests. */
/* oxlint-disable import/max-dependencies -- Compose original SCH data, retained native holders and document-neutral project/panel guards without PCB authority. */
import { z } from "zod";
import { assertUpstreamReplySettled, canonicalJson, extractToolPayload } from "./core.ts";
import { assertOriginalCurrentSchematicChildRoster } from "./current-schematic-child-roster.ts";
import type { CurrentSchematicChildRoster } from "./current-schematic-child-roster.ts";
import { copyCurrentSchematicChildTransport } from "./current-schematic-child-roster-contract.ts";
import type { CurrentSchematicNativeMetadata } from "./current-schematic-native-metadata.ts";
import { originalCurrentSchematicRenameSqlPreparation } from "./current-schematic-rename-sql.ts";
import type { CurrentSchematicRenameSqlPreparation } from "./current-schematic-rename-sql.ts";
import type { readExactSqlInventory } from "./sqlite-inventory.ts";
import { buildCurrentPcbRenamePanelGuard } from "./current-pcb-rename-panel-guard.ts";
import { currentSchematicRenamePeerSchema, currentSchematicRenamePreflightRequestSchema } from "./current-schematic-rename-preflight.ts";
import { buildCurrentSchematicChildGuard } from "./current-schematic-child-guard.ts";
import { buildCurrentProjectOnlySymbolGuard } from "./current-project-only-symbol-guard.ts";
import { buildCurrentSymbolStartupGuard } from "./current-symbol-startup-guard.ts";

import { ACTOR_NAME_MAX_CODE_UNITS, SYMBOL_DUAL_ACTOR_CAPTURE_SOURCE } from "./symbol-dual-actor.ts";
import { EXACT_READ_ENVELOPE_SCHEMA, decodeExactReadEnvelope } from "./exact-readers.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_RENAME_PROGRAM_MAX_BYTES = 1_048_576;
export const CURRENT_SCHEMATIC_RENAME_REPLY_MAX_BYTES = 131_072;
export const CURRENT_SCHEMATIC_RENAME_TIMEOUT_MS = 15_000;
const integer = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).refine(value => !Object.is(value, -0));
const time = integer.max(8_640_000_000_000_000);
const offset = z.number().int().min(-840).max(840).refine(value => !Object.is(value, -0));
const actor = z.object({ uuid: z.string().regex(/^[a-f0-9]{32}$/u), username: z.string().min(1).max(ACTOR_NAME_MAX_CODE_UNITS), nickname: z.string().max(ACTOR_NAME_MAX_CODE_UNITS) }).strict();
export const currentSchematicRenameProgramInputSchema = z.object({ expectedActor: actor,
  rendererTimezoneOffsetMinutes: offset }).strict();
export type CurrentSchematicRenameProgramInput = z.infer<typeof currentSchematicRenameProgramInputSchema>;
type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
const peer = currentSchematicRenamePeerSchema;
const limitations = { permissionVerified: false, startupQualified: false, postRenameStartupQualified: false, peerDesignInvarianceVerified: false,
  backendActorVerified: false, backendClockVerified: false, workerIdentityVerified: false, producerBindingVerified: false, schematicSubscriberCompletionVerified: false,
  crossInvocationReceiverContinuityVerified: false, atomicCompareAndSwap: false, persistenceVerified: false, reopened: false,
  executionAuthorized: false, explicitSaveDispatched: false } as const;
const limitationSchema = z.object({ permissionVerified: z.literal(false), startupQualified: z.literal(false), postRenameStartupQualified: z.literal(false),
  peerDesignInvarianceVerified: z.literal(false), backendActorVerified: z.literal(false), backendClockVerified: z.literal(false), workerIdentityVerified: z.literal(false),
  producerBindingVerified: z.literal(false), schematicSubscriberCompletionVerified: z.literal(false), crossInvocationReceiverContinuityVerified: z.literal(false), atomicCompareAndSwap: z.literal(false),
  persistenceVerified: z.literal(false), reopened: z.literal(false), executionAuthorized: z.literal(false), explicitSaveDispatched: z.literal(false) });
const sampleSchema = z.object({ rendererBeforeMs: time, serverTimeMs: time, rendererAfterMs: time,
  rendererBeforeIso: z.string().max(32), rendererAfterIso: z.string().max(32), rendererTimezoneOffsetMinutes: offset,
  notifyTabId: z.string().regex(/^[a-f0-9]{16}$/u) }).strict().refine(value => value.rendererBeforeMs <= value.serverTimeMs && value.serverTimeMs <= value.rendererAfterMs &&
  value.rendererAfterMs - value.rendererBeforeMs <= 10_000 && new Date(value.rendererBeforeMs).toISOString() === value.rendererBeforeIso &&
  new Date(value.rendererAfterMs).toISOString() === value.rendererAfterIso);
const common = limitationSchema.extend({ target: currentSchematicRenamePreflightRequestSchema.shape.target, preparationSha256: z.string().regex(/^[a-f0-9]{64}$/u),
  client: z.string().regex(/^[a-f0-9]{16}$/u), beforeMaxTicket: integer, mutationDispatched: z.literal(true) });
const resultSchema = common.extend({ kind: z.literal("current-schematic-rename"), before: peer, after: peer, acknowledged: peer,
  nativeReturnAcknowledged: z.literal(true), actor, afterMaxTicket: integer, documentBefore: sampleSchema, documentAfter: sampleSchema,
  peerMetadataMatched: z.literal(true), childMetadataMatched: z.literal(true), peerCount: integer.min(1).max(4096) }).strict();
const stoppedSchema = common.extend({ kind: z.literal("current-schematic-rename-stopped"), acknowledged: peer.nullable(), nativeReturnAcknowledged: z.boolean(),
  failureStage: z.enum(["MUTATION", "ACK", "POST_MUTATION", "CLOCK_AFTER", "AFTER", "TIMEOUT", "CLEANUP", "TIMEOUT_CLEANUP"]),
  readbackComplete: z.literal(false) }).strict().refine(value => value.nativeReturnAcknowledged === (value.acknowledged !== null));
export type CurrentSchematicRenameProgramResult = z.infer<typeof resultSchema>;
export type CurrentSchematicRenameStoppedResult = z.infer<typeof stoppedSchema>;
interface Selected extends CurrentSchematicRenameProgramInput {
  readonly target: CurrentSchematicNativeMetadata["request"]["target"];
  readonly startup: CurrentSchematicChildRoster["startupInput"];
  readonly childKv: CurrentSchematicChildRoster["childKv"];
  readonly targetAst: CurrentSchematicChildRoster["targetAst"];
  readonly desiredTitle: string;
  readonly before: z.infer<typeof peer>;
  readonly peers: CurrentSchematicNativeMetadata["peers"];
  readonly preparationSha256: string;
  readonly client: string;
  readonly maximumTicket: number;
  readonly documentWindow: Readonly<{ minimumMs: number; maximumMs: number }>;
  readonly backendWindow: Readonly<{ minimumMs: number; maximumMs: number }>;
}
function need(condition: boolean, stage = "INPUT"): asserts condition { if (!condition) { throw new Error(`CURRENT_SCHEMATIC_RENAME_${stage}`); } }
function plainData(value: unknown): unknown { return copyCurrentSchematicChildTransport(value); }
function expectedAfter(selected: Selected, stamp: number): z.infer<typeof peer> {
  return { ...selected.before, name: selected.desiredTitle.toLowerCase(), displayName: selected.desiredTitle,
    version: String(stamp), ticket: selected.maximumTicket + 1, updateTime: stamp };
}
function request(preparation: CurrentSchematicRenameSqlPreparation, beforeSql: Inventory, metadata: CurrentSchematicNativeMetadata,
  roster: CurrentSchematicChildRoster, input: unknown): Selected {
  const original = originalCurrentSchematicRenameSqlPreparation(preparation, beforeSql, metadata);
  assertOriginalCurrentSchematicChildRoster(roster, beforeSql, metadata);
  const extra = currentSchematicRenameProgramInputSchema.parse(plainData(input));
  // UI names remain exact across every native await. APP supplies separate
  // Historical project-user names for EDIT_HEAD under this same request UUID.
  need(extra.expectedActor.uuid === original.backendActor.uuid, "ACTOR");
  const before = metadata.peers.find(value => value.uuid === metadata.request.target.schematicUuid); need(before !== undefined, "BINDING");
  need(metadata.maximumTicket < Number.MAX_SAFE_INTEGER, "BINDING");
  const documentWindow = { minimumMs: original.witness.documentClockMinMs, maximumMs: original.witness.documentClockMaxMs };
  const backendWindow = { minimumMs: original.witness.backendClockMinMs, maximumMs: original.witness.backendClockMaxMs };
  need(documentWindow.minimumMs > metadata.baseline.maximumTargetHeaderTime &&
    documentWindow.minimumMs > metadata.baseline.maximumTargetNativeTime &&
    Math.max(documentWindow.minimumMs, backendWindow.minimumMs) <= Math.min(documentWindow.maximumMs, backendWindow.maximumMs), "CLOCK_WINDOWS");
  need(extra.rendererTimezoneOffsetMinutes === -original.witness.backendLocalOffsetMinutes, "CLOCK_OFFSET");
  const selected = { ...extra, target: metadata.request.target, desiredTitle: metadata.request.desiredTitle, before, peers: metadata.peers,
    preparationSha256: preparation.preparationSha256, client: original.witness.client, maximumTicket: metadata.maximumTicket, documentWindow, backendWindow,
    startup: roster.startupInput, childKv: roster.childKv, targetAst: roster.targetAst };
  const sample = { rendererBeforeMs: 8_640_000_000_000_000, serverTimeMs: 8_640_000_000_000_000, rendererAfterMs: 8_640_000_000_000_000,
    rendererBeforeIso: "0".repeat(32), rendererAfterIso: "0".repeat(32), rendererTimezoneOffsetMinutes: extra.rendererTimezoneOffsetMinutes, notifyTabId: "f".repeat(16) };
  const after = expectedAfter(selected, sample.serverTimeMs), result = { kind: "current-schematic-rename", target: selected.target, preparationSha256: selected.preparationSha256,
    before, after, acknowledged: after, nativeReturnAcknowledged: true, actor: extra.expectedActor, client: selected.client,
    beforeMaxTicket: selected.maximumTicket, afterMaxTicket: selected.maximumTicket + 1, documentBefore: sample, documentAfter: sample,
    peerMetadataMatched: true, childMetadataMatched: true, peerCount: selected.peers.length, mutationDispatched: true, ...limitations };
  const json = JSON.stringify(result), utf8Bytes = Buffer.byteLength(json);
  need(utf8Bytes <= CURRENT_SCHEMATIC_RENAME_REPLY_MAX_BYTES && Buffer.byteLength(JSON.stringify({ schema: EXACT_READ_ENVELOPE_SCHEMA, utf8Bytes, json })) <= CURRENT_SCHEMATIC_RENAME_REPLY_MAX_BYTES, "OUTPUT_BUDGET");
  return selected;
}

/** One fixed project-qualified title patch. The coordinator still needs original
 * SCHEMATIC producer, backend actor/clock and one-shot journal authority before use.
 */
export function buildCurrentSchematicRenameProgram(preparation: CurrentSchematicRenameSqlPreparation, beforeSql: Inventory, metadata: CurrentSchematicNativeMetadata, roster: CurrentSchematicChildRoster, input: unknown): string {
  const selected = request(preparation, beforeSql, metadata, roster, input);
  const program = `const result=await(async()=>{
const selected=${JSON.stringify(selected)},target=selected.target,root=globalThis,apply=Reflect.apply;
let expired=false,timer,clear,stage='HOST',startupStage='project-only-context',dispatched=false,acknowledged=null;
const bad=()=>{throw new Error('CURRENT_SCHEMATIC_RENAME_REFUSED:'+stage);};
const stopped=failureStage=>({kind:'current-schematic-rename-stopped',target,preparationSha256:selected.preparationSha256,acknowledged,nativeReturnAcknowledged:acknowledged!==null,failureStage,client:selected.client,beforeMaxTicket:selected.maximumTicket,mutationDispatched:true,readbackComplete:false,...${JSON.stringify(limitations)}});
const own=(owner,key,optional=false)=>{if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad();const d=Object.getOwnPropertyDescriptor(owner,key);if(!d){if(optional&&!(key in owner))return undefined;bad();}if(!Object.hasOwn(d,'value'))bad();return d.value;};
const plain=value=>{if(value===null||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)bad();return value;};
const text=(value,max)=>{if(typeof value!=='string'||value.length>max)bad();return value;};
const integer=(value,max=Number.MAX_SAFE_INTEGER)=>{if(typeof value!=='number'||!Number.isSafeInteger(value)||value<0||value>max||Object.is(value,-0))bad();return value;};
const identifier=value=>{if(typeof value!=='string'||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/.test(value))bad();return value;};
const method=(owner,key)=>{const chain=[];let node=owner;for(let i=0;i<4;i++){if(node===null||(typeof node!=='object'&&typeof node!=='function'))bad();chain.push(node);const d=Object.getOwnPropertyDescriptor(node,key);if(d){if(!Object.hasOwn(d,'value')||typeof d.value!=='function')bad();return{owner,key,chain,fn:d.value};}node=Object.getPrototypeOf(node);}bad();};
const methodCheck=binding=>{for(let i=0;i<binding.chain.length;i++){const node=binding.chain[i];if(i>0&&Object.getPrototypeOf(binding.chain[i-1])!==node)bad();if(i===binding.chain.length-1){if(own(node,binding.key)!==binding.fn)bad();}else if(Object.hasOwn(node,binding.key))bad();}};
try{
 const set=own(root,'setTimeout');clear=own(root,'clearTimeout');if(typeof set!=='function'||typeof clear!=='function')bad();
 ${buildCurrentProjectOnlySymbolGuard()}
 const startupExpected=selected.startup;
 stage='STARTUP';
 ${buildCurrentSymbolStartupGuard(true)}
 stage='CHILD_HOLDERS';
 ${buildCurrentSchematicChildGuard()}
 stage='AUXILIARY_PANEL';
 ${buildCurrentPcbRenamePanelGuard()}
 const host=projectOnly.host,bus=own(host,'messageBus'),rpc=method(bus,'rpcCall'),edaOwner=eda;
 stage='ACTOR';
 ${SYMBOL_DUAL_ACTOR_CAPTURE_SOURCE}
 if(!actorEqual(cachedActorProjection,selected.expectedActor)||!actorEqual(startupActorProjection,selected.expectedActor))bad();
 stage='CLOCK_OWNER';const notifyTab=own(root,'_TAB_ID_');if(typeof notifyTab!=='string'||!/^[a-f0-9]{16}$/.test(notifyTab))bad();
 const notifyKey='/'+notifyTab+'/notify',concurrent=own(host,'concurrentBus'),clockRpc=method(concurrent,'rpcCall');
 const nativeDate=own(root,'Date'),dateNow=own(nativeDate,'now'),datePrototype=own(nativeDate,'prototype'),iso=own(datePrototype,'toISOString'),zone=own(datePrototype,'getTimezoneOffset');
 if(typeof nativeDate!=='function'||typeof dateNow!=='function'||typeof iso!=='function'||typeof zone!=='function')bad();
 const canonical=value=>Array.isArray(value)?value.map(canonical):value!==null&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value;
 const same=()=>{projectOnly.check();pcbRenamePanels.check();if(!dispatched){startup.check();schematicChildren.check();if(JSON.stringify(canonical(schematicChildren.read().ast.schematic))!==JSON.stringify(canonical(selected.targetAst)))bad();}checkDualActor();methodCheck(rpc);methodCheck(clockRpc);
  if(expired||own(host,'messageBus')!==bus||own(host,'concurrentBus')!==concurrent||own(root,notifyKey)!==concurrent||own(root,'_TAB_ID_')!==notifyTab||eda!==edaOwner||own(edaOwner,'extensionUuid')!=='7e06d286b1ac846ef7eab9c7f2a9ee40'||own(root,'setTimeout')!==set||own(root,'clearTimeout')!==clear||own(root,'Date')!==nativeDate||own(nativeDate,'now')!==dateNow||own(nativeDate,'prototype')!==datePrototype||own(datePrototype,'toISOString')!==iso||own(datePrototype,'getTimezoneOffset')!==zone)bad();};
 let lastNow;
 const now=()=>{same();const value=integer(apply(dateNow,nativeDate,[]),8640000000000000);if(lastNow!==undefined&&value<lastNow)bad();lastNow=value;const date=new nativeDate(value);if(apply(zone,date,[])!==selected.rendererTimezoneOffsetMinutes)bad();same();return{value,iso:apply(iso,date,[])};};
 const deadline=()=>{const stamp=now().value;if(stamp<selected.backendWindow.minimumMs||stamp>selected.backendWindow.maximumMs||stamp<selected.documentWindow.minimumMs||stamp>selected.documentWindow.maximumMs)bad();};
 const call=async(topic,args)=>{same();const raw=await apply(rpc.fn,bus,[topic,args,0]);same();return own(plain(raw),'message');};
 const clock=async()=>{const before=now(),serverTimeMs=await apply(clockRpc.fn,concurrent,['/pro-mgr/serverTime/now']);same();integer(serverTimeMs);const after=now();if(before.value>serverTimeMs||serverTimeMs>after.value||after.value-before.value>10000||serverTimeMs<selected.documentWindow.minimumMs||serverTimeMs>selected.documentWindow.maximumMs)bad();return{rendererBeforeMs:before.value,serverTimeMs,rendererAfterMs:after.value,rendererBeforeIso:before.iso,rendererAfterIso:after.iso,rendererTimezoneOffsetMinutes:selected.rendererTimezoneOffsetMinutes,notifyTabId:notifyTab};};
 const project=async()=>{const value=plain(await call('/PrjDB/project/getData',[target.projectUuid]));if(own(value,'uuid')!==target.projectUuid||own(value,'currentBranch')!==target.branchUuid||own(value,'isV2Format')!==false||own(plain(own(value,'owner')),'uuid')!==target.ownerUuid)bad();for(const key of ['archive','store','cbb_project']){const flag=own(value,key,true);if(flag!==undefined&&flag!==false&&flag!==null&&flag!==0)bad();}};
 const worker=async(expected)=>{const client=await call('/PrjDB/project/getClient',[target.projectUuid]),ticket=await call('/PrjDB/project/getMaxTicket',[target.projectUuid]);if(client!==selected.client||integer(ticket)!==expected)bad();};
 const metadata=raw=>{const value=plain(raw),uuid=identifier(own(value,'uuid'));if(own(value,'project_uuid')!==target.projectUuid)bad();
  return{uuid,name:text(own(value,'name'),512),displayName:text(own(value,'display_name'),512),source:text(own(value,'source'),4096),version:text(own(value,'version'),128),boardUuid:text(own(value,'board'),128),ticket:integer(own(value,'ticket')),updateTime:integer(own(value,'updateTime'),8640000000000000)};};
 const equal=(left,right)=>{if(JSON.stringify(left)!==JSON.stringify(right))bad();};
 const roster=async(after)=>{const map=plain(await call('/PrjDB/schematic/getAllKVDatas',[target.projectUuid])),keys=Reflect.ownKeys(map);if(keys.length!==selected.peers.length||keys.some(key=>typeof key!=='string'||!selected.peers.some(peer=>peer.uuid===key)))bad();for(const peer of selected.peers)equal(metadata(own(map,peer.uuid)),after&&peer.uuid===target.schematicUuid?after:peer);};
 const targetRead=async(expected)=>{const value=metadata(await call('/PrjDB/schematic/getData',[target.schematicUuid,target.projectUuid]));equal(value,expected);return value;};
 const available=async()=>{if(await call('/PrjDB/schematic/getIdByName',[selected.desiredTitle,target.projectUuid])!=='')bad();};
 const children=async()=>{const map=plain(await call('/PrjDB/sheet/getAllKVDatas',[undefined,target.projectUuid])),keys=Reflect.ownKeys(map),expected=Object.keys(selected.childKv);if(keys.length!==expected.length||keys.some(key=>typeof key!=='string'||!expected.includes(key)))bad();
  for(const uuid of expected){const value=plain(own(map,uuid)),entry=selected.childKv[uuid];for(const key of Object.keys(entry))if(!Object.is(own(value,key),entry[key]))bad();}};
 const run=async()=>{
  stage='DEADLINE';deadline();stage='BEFORE';await project();await worker(selected.maximumTicket);await roster();const before=await targetRead(selected.before);await available();await children();
  stage='CLOCK_BEFORE';const documentBefore=await clock();stage='FINAL_BEFORE';await project();await roster();await targetRead(selected.before);await available();await children();await worker(selected.maximumTicket);
  stage='DEADLINE';deadline();const patch={uuid:target.schematicUuid,display_name:selected.desiredTitle};
  stage='MUTATION';dispatched=true;const raw=await apply(rpc.fn,bus,['/PrjDB/schematic/updateData',[patch,target.projectUuid],0]);
  if(expired)bad();stage='ACK';const native=plain(own(plain(raw),'message'));if(own(native,'success')!==true)bad();acknowledged=Object.freeze(metadata(own(native,'result')));
  stage='POST_MUTATION';same();const stamp=acknowledged.updateTime,expected={...selected.before,name:selected.desiredTitle.toLowerCase(),displayName:selected.desiredTitle,version:String(stamp),ticket:selected.maximumTicket+1,updateTime:stamp};
  equal(acknowledged,expected);if(stamp<selected.documentWindow.minimumMs||stamp>selected.documentWindow.maximumMs)bad();
  stage='CLOCK_AFTER';const documentAfter=await clock();if(documentAfter.rendererBeforeMs<documentBefore.rendererAfterMs||stamp<documentBefore.serverTimeMs||stamp>documentAfter.serverTimeMs)bad();
  stage='AFTER';await project();await roster(expected);const after=await targetRead(expected);await worker(selected.maximumTicket+1);await children();same();
  return{kind:'current-schematic-rename',target,preparationSha256:selected.preparationSha256,before,after,acknowledged,nativeReturnAcknowledged:true,actor:cachedActorProjection,client:selected.client,beforeMaxTicket:selected.maximumTicket,afterMaxTicket:selected.maximumTicket+1,documentBefore,documentAfter,peerMetadataMatched:true,childMetadataMatched:true,peerCount:selected.peers.length,mutationDispatched:true,...${JSON.stringify(limitations)}};
 };
 same();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;stage='TIMEOUT';reject(new Error('CURRENT_SCHEMATIC_RENAME_REFUSED:TIMEOUT'));},${CURRENT_SCHEMATIC_RENAME_TIMEOUT_MS}]);});return await Promise.race([run(),timeout]);
}catch{if(dispatched)return stopped(expired?'TIMEOUT':stage);bad();}finally{if(timer!==undefined){try{apply(clear,root,[timer]);}catch{if(dispatched)return stopped(expired?'TIMEOUT_CLEANUP':'CLEANUP');throw new Error('CURRENT_SCHEMATIC_RENAME_REFUSED:CLEANUP');}}}
})();
const json=JSON.stringify(result),utf8Bytes=new TextEncoder().encode(json).byteLength,envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};
if(utf8Bytes>${CURRENT_SCHEMATIC_RENAME_REPLY_MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${CURRENT_SCHEMATIC_RENAME_REPLY_MAX_BYTES})throw new Error('CURRENT_SCHEMATIC_RENAME_ENVELOPE');return envelope;`;
  need(Buffer.byteLength(program) <= CURRENT_SCHEMATIC_RENAME_PROGRAM_MAX_BYTES, "PROGRAM_BUDGET"); return program;
}
function envelope(raw: unknown): unknown {
  assertUpstreamReplySettled(raw); const copied = plainData(extractToolPayload(raw));
  need(Buffer.byteLength(JSON.stringify(copied)) <= CURRENT_SCHEMATIC_RENAME_REPLY_MAX_BYTES, "ENVELOPE"); return decodeExactReadEnvelope(copied);
}
function commonMatch(selected: Selected, value: z.infer<typeof common>): void {
  need(canonicalJson(value.target) === canonicalJson(selected.target) && value.preparationSha256 === selected.preparationSha256 &&
    value.client === selected.client && value.beforeMaxTicket === selected.maximumTicket, "RESULT");
}
export function decodeCurrentSchematicRenameReply(raw: unknown, preparation: CurrentSchematicRenameSqlPreparation, beforeSql: Inventory, metadata: CurrentSchematicNativeMetadata,
  roster: CurrentSchematicChildRoster, input: unknown): CurrentSchematicRenameProgramResult {
  return validateCurrentSchematicRenameResult(envelope(raw), preparation, beforeSql, metadata, roster, input);
}
/** The same bounded data predicates, without inventing a native reply origin. */
export function validateCurrentSchematicRenameResult(raw: unknown, preparation: CurrentSchematicRenameSqlPreparation, beforeSql: Inventory, metadata: CurrentSchematicNativeMetadata,
  roster: CurrentSchematicChildRoster, input: unknown): CurrentSchematicRenameProgramResult {
  const selected = request(preparation, beforeSql, metadata, roster, input), value = resultSchema.parse(plainData(raw)); commonMatch(selected, value);
  need(Buffer.byteLength(JSON.stringify(value)) <= CURRENT_SCHEMATIC_RENAME_REPLY_MAX_BYTES, "RESULT_BUDGET");
  need(canonicalJson(value.before) === canonicalJson(selected.before) && canonicalJson(value.after) === canonicalJson(expectedAfter(selected, value.after.updateTime)) &&
    canonicalJson(value.acknowledged) === canonicalJson(value.after) && canonicalJson(value.actor) === canonicalJson(selected.expectedActor) &&
    value.afterMaxTicket === selected.maximumTicket + 1 && value.peerCount === selected.peers.length && value.documentBefore.notifyTabId === value.documentAfter.notifyTabId &&
    value.documentBefore.rendererAfterMs <= value.documentAfter.rendererBeforeMs && value.after.updateTime >= value.documentBefore.serverTimeMs &&
    value.after.updateTime <= value.documentAfter.serverTimeMs && [value.documentBefore, value.documentAfter].every(sample =>
      sample.rendererTimezoneOffsetMinutes === selected.rendererTimezoneOffsetMinutes && sample.serverTimeMs >= selected.documentWindow.minimumMs &&
      sample.serverTimeMs <= selected.documentWindow.maximumMs), "RESULT"); return freezeDeep(value);
}
/** A stopped reply proves neither the intended effect nor retry permission.
 * A structurally valid but incorrect acknowledgment is retained unchanged.
 */
export function decodeCurrentSchematicRenameStoppedReply(raw: unknown, preparation: CurrentSchematicRenameSqlPreparation, beforeSql: Inventory, metadata: CurrentSchematicNativeMetadata,
  roster: CurrentSchematicChildRoster, input: unknown): CurrentSchematicRenameStoppedResult {
  const selected = request(preparation, beforeSql, metadata, roster, input), value = stoppedSchema.parse(envelope(raw)); commonMatch(selected, value); return freezeDeep(value);
}
