/** Fixed PCB N0 collector. No project, mutation, Save or queue-flush RPC.
 * This observes one scalar bracket and settled PCB holders, not source/actor
 * provenance. The original writer must retain dispatch and Windows brackets.
 */
import { z } from "zod";
import { assertUpstreamReplySettled, canonicalJson, extractToolPayload } from "./core.ts";
import type { CurrentPcbRenameDocumentClockSample } from "./current-pcb-rename-clock.ts";
import { buildCurrentPcbRenamePanelGuard } from "./current-pcb-rename-panel-guard.ts";
import { currentPcbRenamePreflightRequestSchema } from "./current-pcb-rename-preflight.ts";
import { currentPcbRenameProgramInputSchema } from "./current-pcb-rename-program.ts";
import { buildCurrentPcbRenameStartupGuard } from "./current-pcb-rename-startup-guard.ts";
import { buildCurrentProjectOnlySymbolGuard } from "./current-project-only-symbol-guard.ts";
import { EXACT_READ_ENVELOPE_SCHEMA, decodeExactReadEnvelope } from "./exact-readers.ts";
import { SYMBOL_DUAL_ACTOR_CAPTURE_SOURCE } from "./symbol-dual-actor.ts";

export const currentPcbRenameWriterClockRequestSchema = z.object({ target: currentPcbRenamePreflightRequestSchema.shape.target,
  expectedActor: currentPcbRenameProgramInputSchema.shape.expectedActor }).strict();
const integer = z.number().int().min(0).max(8_640_000_000_000_000).refine(value => !Object.is(value, -0));
const sample = z.object({ rendererBeforeMs: integer, serverTimeMs: integer, rendererAfterMs: integer,
  rendererBeforeIso: z.string().max(32), rendererAfterIso: z.string().max(32),
  rendererTimezoneOffsetMinutes: z.number().int().min(-840).max(840).refine(value => !Object.is(value, -0)),
  notifyTabId: z.string().regex(/^[a-f0-9]{16}$/u) }).strict().refine(value =>
  value.rendererBeforeMs <= value.serverTimeMs && value.serverTimeMs <= value.rendererAfterMs &&
  value.rendererAfterMs - value.rendererBeforeMs <= 10_000 && new Date(value.rendererBeforeMs).toISOString() === value.rendererBeforeIso &&
  new Date(value.rendererAfterMs).toISOString() === value.rendererAfterIso);
const resultSchema = z.object({ profile: z.literal("private.current-pcb-rename-writer-document-clock.v1"),
  target: currentPcbRenameWriterClockRequestSchema.shape.target, actor: currentPcbRenameWriterClockRequestSchema.shape.expectedActor,
  sample, mutationDispatched: z.literal(false), explicitSaveDispatched: z.literal(false) }).strict();
function fields(input: unknown, names: readonly string[]): Record<string, unknown> {
  if (input === null || typeof input !== "object" || Array.isArray(input) || Object.getPrototypeOf(input) !== Object.prototype || Reflect.ownKeys(input).length !== names.length) {
    throw new Error("CURRENT_PCB_RENAME_WRITER_CLOCK_INPUT");
  }
  const result: Record<string, unknown> = {};
  for (const name of names) { const descriptor = Object.getOwnPropertyDescriptor(input, name);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { throw new Error("CURRENT_PCB_RENAME_WRITER_CLOCK_INPUT"); }
    result[name] = descriptor.value as unknown;
  }
  return result;
}
function request(input: unknown): z.infer<typeof currentPcbRenameWriterClockRequestSchema> {
  const selected = fields(input, ["target", "expectedActor"]);
  return currentPcbRenameWriterClockRequestSchema.parse({ target: fields(selected["target"], ["projectUuid", "branchUuid", "pcbUuid", "ownerUuid"]),
    expectedActor: fields(selected["expectedActor"], ["uuid", "username", "nickname"]) });
}
export function buildCurrentPcbRenameWriterClockProgram(input: unknown): string {
  const selected = request(input);
  return `const result=await(async()=>{
const selected=${JSON.stringify(selected)},target=selected.target,root=globalThis,apply=Reflect.apply;
let expired=false,timer,clear;
const bad=()=>{throw new Error('CURRENT_PCB_RENAME_WRITER_CLOCK_REFUSED');};
const own=(owner,key,optional=false)=>{if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad();const d=Object.getOwnPropertyDescriptor(owner,key);if(!d){if(optional&&!(key in owner))return undefined;bad();}if(!Object.hasOwn(d,'value'))bad();return d.value;};
const plain=value=>{if(value===null||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)bad();return value;};
const method=(owner,key)=>{const chain=[];let node=owner;for(let i=0;i<4;i++){if(node===null||(typeof node!=='object'&&typeof node!=='function'))bad();chain.push(node);const d=Object.getOwnPropertyDescriptor(node,key);if(d){if(!Object.hasOwn(d,'value')||typeof d.value!=='function')bad();return{owner,key,chain,fn:d.value};}node=Object.getPrototypeOf(node);}bad();};
const methodCheck=binding=>{for(let i=0;i<binding.chain.length;i++){const node=binding.chain[i];if(i>0&&Object.getPrototypeOf(binding.chain[i-1])!==node)bad();if(i===binding.chain.length-1){if(own(node,binding.key)!==binding.fn)bad();}else if(Object.hasOwn(node,binding.key))bad();}};
try{
const set=own(root,'setTimeout');clear=own(root,'clearTimeout');if(typeof set!=='function'||typeof clear!=='function')bad();
${buildCurrentProjectOnlySymbolGuard()}
${buildCurrentPcbRenameStartupGuard()}
${buildCurrentPcbRenamePanelGuard()}
const host=projectOnly.host,edaOwner=eda;
${SYMBOL_DUAL_ACTOR_CAPTURE_SOURCE}
if(!actorEqual(cachedActorProjection,selected.expectedActor)||!actorEqual(startupActorProjection,selected.expectedActor))bad();
const tab=own(root,'_TAB_ID_'),bus=own(host,'concurrentBus'),rpc=method(bus,'rpcCall');if(typeof tab!=='string'||!/^[a-f0-9]{16}$/.test(tab))bad();
const nativeDate=own(root,'Date'),now=own(nativeDate,'now'),prototype=own(nativeDate,'prototype'),iso=own(prototype,'toISOString'),zone=own(prototype,'getTimezoneOffset');
if([nativeDate,now,iso,zone].some(value=>typeof value!=='function'))bad();
const same=()=>{projectOnly.check();pcbRenameStartup.check();pcbRenamePanels.check();checkDualActor();methodCheck(rpc);if(expired||eda!==edaOwner||own(edaOwner,'extensionUuid')!=='7e06d286b1ac846ef7eab9c7f2a9ee40'||own(root,'_TAB_ID_')!==tab||own(host,'concurrentBus')!==bus||own(root,'/'+tab+'/notify')!==bus||own(root,'Date')!==nativeDate||own(nativeDate,'now')!==now||own(nativeDate,'prototype')!==prototype||own(prototype,'toISOString')!==iso||own(prototype,'getTimezoneOffset')!==zone||own(root,'setTimeout')!==set||own(root,'clearTimeout')!==clear)bad();};
const stamp=()=>{same();const ms=apply(now,nativeDate,[]);if(!Number.isSafeInteger(ms)||ms<0||ms>8640000000000000||Object.is(ms,-0))bad();const date=new nativeDate(ms),offset=apply(zone,date,[]);if(!Number.isSafeInteger(offset)||Math.abs(offset)>840||Object.is(offset,-0))bad();return{ms,iso:apply(iso,date,[]),offset};};
const run=async()=>{const first=stamp(),serverTimeMs=await apply(rpc.fn,bus,['/pro-mgr/serverTime/now']);same();const last=stamp();
if(!Number.isSafeInteger(serverTimeMs)||Object.is(serverTimeMs,-0)||serverTimeMs<first.ms||serverTimeMs>last.ms||last.ms-first.ms>10000||first.offset!==last.offset)bad();same();
return{profile:'private.current-pcb-rename-writer-document-clock.v1',target,actor:cachedActorProjection,sample:{rendererBeforeMs:first.ms,serverTimeMs,rendererAfterMs:last.ms,rendererBeforeIso:first.iso,rendererAfterIso:last.iso,rendererTimezoneOffsetMinutes:first.offset,notifyTabId:tab},mutationDispatched:false,explicitSaveDispatched:false};};
same();const deadline=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;reject(new Error('CURRENT_PCB_RENAME_WRITER_CLOCK_REFUSED'));},10000]);});return await Promise.race([run(),deadline]);
}catch{throw new Error('CURRENT_PCB_RENAME_WRITER_CLOCK_REFUSED');}finally{if(timer!==undefined)apply(clear,root,[timer]);}
})();
const json=JSON.stringify(result),utf8Bytes=new TextEncoder().encode(json).byteLength;if(utf8Bytes>8192)throw new Error('CURRENT_PCB_RENAME_WRITER_CLOCK_ENVELOPE');
return{schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};`;
}
export function decodeCurrentPcbRenameWriterClockReply(raw: unknown, input: unknown): CurrentPcbRenameDocumentClockSample {
  const selected = request(input);
  assertUpstreamReplySettled(raw);
  const envelope = extractToolPayload(raw);
  if (Buffer.byteLength(JSON.stringify(envelope), "utf8") > 16_384) { throw new Error("CURRENT_PCB_RENAME_WRITER_CLOCK_ENVELOPE"); }
  const result = resultSchema.parse(decodeExactReadEnvelope(envelope));
  if (canonicalJson(result.target) !== canonicalJson(selected.target) || canonicalJson(result.actor) !== canonicalJson(selected.expectedActor)) {
    throw new Error("CURRENT_PCB_RENAME_WRITER_CLOCK_TARGET");
  }
  return Object.freeze(result.sample);
}
