import { z } from "zod";
import { assertUpstreamReplySettled, canonicalJson, extractToolPayload } from "./core.ts";
import { EXACT_READ_ENVELOPE_SCHEMA, decodeExactReadEnvelope } from "./exact-readers.ts";
import { CURRENT_SYMBOL_METADATA_MAX_BYTES, currentSymbolMetadataResultSchema } from "./current-symbol-metadata.ts";
import { CURRENT_SYMBOL_RUNTIME_OBSERVATION_SOURCE, currentSymbolRuntimeObservationSchema } from "./current-symbol-runtime-observation.ts";
import { buildCurrentProjectOnlySymbolGuard } from "./current-project-only-symbol-guard.ts";

export const CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_TIMEOUT_MS = 10_000;
export const CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_MAX_BYTES = CURRENT_SYMBOL_METADATA_MAX_BYTES;
const targetSchema = z.object({ projectUuid: z.string().regex(/^[a-f0-9]{64}$/u), branchUuid: z.string().regex(/^[a-f0-9]{32}$/u),
  symbolUuid: z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u), ownerUuid: z.string().regex(/^[a-f0-9]{32}$/u) }).strict();
const beforeSchema = currentSymbolMetadataResultSchema.shape.value.omit({ uuid: true, projectUuid: true, ownerUuid: true });
export const currentProjectOnlySymbolPreflightRequestSchema = z.object({ target: targetSchema, expectedBefore: beforeSchema }).strict();
export type CurrentProjectOnlySymbolPreflightRequest = z.infer<typeof currentProjectOnlySymbolPreflightRequestSchema>;
const ticketSchema = beforeSchema.shape.ticket;
export const currentProjectOnlySymbolPreflightResultSchema = z.object({
  ok: z.literal(true), kind: z.literal("current-project-only-symbol-preflight"), target: targetSchema, expectedBefore: beforeSchema,
  samples: z.literal(2), currentTabId: z.enum(["tab_page1", "0"]), noEditorTabsObserved: z.literal(true), hiddenEditorsAbsentObserved: z.literal(true),
  dirtyTabsAbsentObserved: z.literal(true), cachedProjectReadOnlyAbsentObserved: z.literal(true), concurrentStrictModeAbsentObserved: z.literal(true),
  clientTicketObservation: z.object({ client: z.string().regex(/^[a-f0-9]{16}$/u), maxTicket: ticketSchema, samples: z.literal(4) }).strict(),
  runtimeObservation: currentSymbolRuntimeObservationSchema, expectedBeforeMatched: z.literal(true), permissionVerified: z.literal(false),
  backendActorVerified: z.literal(false), backendClockVerified: z.literal(false), startupQualified: z.literal(false),
  workerIdentityVerified: z.literal(false), sourceMembershipVerified: z.literal(false), persistenceVerified: z.literal(false),
  writerAuthority: z.literal(false), executionAuthorized: z.literal(false), mutationDispatched: z.literal(false), explicitSaveDispatched: z.literal(false),
}).strict().refine((value) => value.expectedBefore.ticket <= value.clientTicketObservation.maxTicket);
export type CurrentProjectOnlySymbolPreflightResult = z.infer<typeof currentProjectOnlySymbolPreflightResultSchema>;

const limitations = [
  "Requires the exact loaded local project/branch with only the native Start Page and optional hidden blank placeholder. Every editor tab, hidden/editor/export iframe, pending restoration and URL document command is refused. Bounded complete registry/DOM samples are observations, not continuous exclusion or a lock.",
  "Supplied expectedBefore values are exact name/description/raw tags/source/version/ticket comparisons, not source provenance or permission. A future owner must derive them from its original plan. Native source/version getter fallbacks remain lossy with respect to stored absence or falsy fields.",
  "Two matching symbol/project samples and four agreeing client/maxTicket and dual-UI actor/clock samples retain their receivers across awaits. They do not issue a worker lease, authenticate the backend actor, qualify its clock, or prove startup or durable effects.",
  "Cached project read-only, concurrent strict mode and dirty-tab checks may refuse. Library permission remains unverified. No canAddLib denial dialog, public cloud getter, network request, navigation, drawing read, mutation, explicit Save or APP evaluator is dispatched.",
  "At most 128 containers, 255 tree nodes, 256 registry tabs and 393216 UTF-8 envelope bytes. The ten-second inner deadline prevents later reads but cannot cancel an already dispatched native request. Missing or uncertain replies require retained-owner review, not automatic retry. Offline discovery and tests are not connected validation.",
] as const;

export function queryCurrentProjectOnlySymbolPreflight(input: unknown = {}): Record<string, unknown> {
  const query = z.object({ includeSchemas: z.boolean().default(false) }).strict().parse(input);
  return { offline: true, invocationEnabledByDiscovery: false, total: 1, entries: [{
    tool: "easyeda_control_project_symbol", effect: "current-project-only-symbol-preflight", liveValidation: "not-recorded",
    invocationEnabledByDiscovery: false, limitations: [...limitations],
    ...(query.includeSchemas ? { inputSchema: z.toJSONSchema(currentProjectOnlySymbolPreflightRequestSchema),
      resultSchema: z.toJSONSchema(currentProjectOnlySymbolPreflightResultSchema) } : {}),
  }] };
}

export function validateCurrentProjectOnlySymbolPreflightArguments(input: unknown): Record<string, unknown> {
  try { return { valid: true, request: request(input), executionAuthorized: false }; }
  catch (error) {
    return { valid: false, executionAuthorized: false, issues: error instanceof z.ZodError
      ? error.issues.slice(0, 16).map((issue) => ({ path: issue.path.map(String).join("."), message: issue.message.slice(0, 512) }))
      : [{ path: "", message: "Expected exact own-data target and expectedBefore fields." }] };
  }
}

function fields(input: unknown, names: readonly string[]): Record<string, unknown> {
  if (input === null || typeof input !== "object" || Array.isArray(input) ||
    (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null) || Reflect.ownKeys(input).length !== names.length) {
    throw new Error("CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_SHAPE");
  }
  const value: Record<string, unknown> = {};
  for (const name of names) {
    const descriptor = Object.getOwnPropertyDescriptor(input, name);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { throw new Error("CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_SHAPE"); }
    value[name] = descriptor.value as unknown;
  }
  return value;
}
function request(input: unknown): CurrentProjectOnlySymbolPreflightRequest {
  const value = fields(input, ["target", "expectedBefore"]);
  return currentProjectOnlySymbolPreflightRequestSchema.parse({
    target: fields(value["target"], ["projectUuid", "branchUuid", "symbolUuid", "ownerUuid"]),
    expectedBefore: fields(value["expectedBefore"], ["name", "description", "tagsJson", "source", "version", "ticket"]),
  });
}

/** Fixed observation compiler, with no writer or lifecycle authority. Expected values
 * are comparisons only until an original lifecycle owner supplies them. Reuse
 * verifyCurrentProjectOnlySymbolPreflightImplementation before/after dispatch.
 * Native getters retain fallback semantics for source/version. No drawing
 * source, public cloud wrapper, canAddLib, APP evaluation or mutation is called.
 */
export function buildCurrentProjectOnlySymbolPreflightProgram(input: unknown): string {
  const selected = request(input);
  return `const observation=await(async()=>{
const target=${JSON.stringify(selected.target)},expectedBefore=${JSON.stringify(selected.expectedBefore)},root=globalThis,apply=Reflect.apply;
let expired=false,timer,clear,stage='HOST';
const bad=()=>{throw new Error('CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_REFUSED:'+stage);};
const own=(owner,key,optional=false)=>{if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad();const d=Object.getOwnPropertyDescriptor(owner,key);if(!d){if(optional&&!(key in owner))return undefined;bad();}if(!Object.hasOwn(d,'value'))bad();return d.value;};
const plain=value=>{if(value===null||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)bad();return value;};
const text=(value,max)=>{if(typeof value!=='string'||value.length>max)bad();return value;};
const method=(owner,key)=>{const chain=[];let node=owner;for(let i=0;i<4;i++){if(node===null||(typeof node!=='object'&&typeof node!=='function'))bad();chain.push(node);const d=Object.getOwnPropertyDescriptor(node,key);if(d){if(!Object.hasOwn(d,'value')||typeof d.value!=='function')bad();return{owner,key,chain,fn:d.value};}node=Object.getPrototypeOf(node);}bad();};
const methodCheck=binding=>{for(let i=0;i<binding.chain.length;i++){const node=binding.chain[i];if(i>0&&Object.getPrototypeOf(binding.chain[i-1])!==node)bad();if(i===binding.chain.length-1){if(own(node,binding.key)!==binding.fn)bad();}else if(Object.hasOwn(node,binding.key))bad();}};
try{
 const set=own(root,'setTimeout');clear=own(root,'clearTimeout');if(typeof set!=='function'||typeof clear!=='function')bad();
 ${buildCurrentProjectOnlySymbolGuard()}
 const host=projectOnly.host,bus=own(host,'messageBus'),rpc=method(bus,'rpcCall'),edaOwner=eda;
 ${CURRENT_SYMBOL_RUNTIME_OBSERVATION_SOURCE}
 const same=()=>{projectOnly.check();checkRuntimeObservation();methodCheck(rpc);if(expired||own(host,'messageBus')!==bus||eda!==edaOwner||own(edaOwner,'extensionUuid')!=='7e06d286b1ac846ef7eab9c7f2a9ee40'||own(root,'setTimeout')!==set||own(root,'clearTimeout')!==clear)bad();};
 const call=async(topic,args)=>{same();const raw=await apply(rpc.fn,bus,[topic,args,0]);same();return own(plain(raw),'message');};
 let retainedClientTicket;
 const clientTicketSample=async()=>{
  stage='CLIENT_TICKET';const client=await call('/PrjDB/project/getClient',[target.projectUuid]);same();if(typeof client!=='string'||!/^[a-f0-9]{16}$/.test(client))bad();
  const maxTicket=await call('/PrjDB/project/getMaxTicket',[target.projectUuid]);same();clockInteger(maxTicket);
  if(retainedClientTicket&&(retainedClientTicket.client!==client||retainedClientTicket.maxTicket!==maxTicket))bad();retainedClientTicket={client,maxTicket};
 };
 const projectMetadata=async()=>{
  stage='PROJECT';const value=plain(await call('/PrjDB/project/getData',[target.projectUuid]));same();
  if(own(value,'uuid')!==target.projectUuid||own(value,'currentBranch')!==target.branchUuid||own(value,'isV2Format')!==false||own(plain(own(value,'owner')),'uuid')!==target.ownerUuid)bad();
  for(const key of ['archive','store','cbb_project']){const flag=own(value,key,true);if(flag!==undefined&&flag!==false&&flag!==null&&flag!==0)bad();}
 };
 const sample=async()=>{
  stage='CLOCK';await sampleRuntimeClock();await clientTicketSample();await projectMetadata();same();
  stage='SYMBOL';const value=plain(await call('/PrjDB/symbol/getData',[target.symbolUuid,target.projectUuid]));same();
  if(own(value,'uuid')!==target.symbolUuid||own(value,'project_uuid')!==target.projectUuid||own(value,'path')!==target.projectUuid||own(value,'docType')!==2||own(plain(own(value,'owner')),'uuid')!==target.ownerUuid)bad();
  const ticket=clockInteger(own(value,'ticket'));
  const before={name:text(own(value,'display_title'),512),description:text(own(value,'description'),65536),tagsJson:text(own(value,'custom_tags'),131072),source:text(own(value,'source'),4096),version:text(own(value,'version'),128),ticket};
  if(JSON.stringify(before)!==JSON.stringify(expectedBefore))bad();
  await projectMetadata();await clientTicketSample();stage='CLOCK';await sampleRuntimeClock();same();if(ticket>retainedClientTicket.maxTicket)bad();
  return before;
 };
 const run=async()=>{
  const first=await sample(),second=await sample();same();if(JSON.stringify(first)!==JSON.stringify(second))bad();
  return{ok:true,kind:'current-project-only-symbol-preflight',target,expectedBefore:first,samples:2,currentTabId:projectOnly.currentTabId,
   noEditorTabsObserved:true,hiddenEditorsAbsentObserved:true,dirtyTabsAbsentObserved:true,cachedProjectReadOnlyAbsentObserved:true,concurrentStrictModeAbsentObserved:true,
   clientTicketObservation:{...retainedClientTicket,samples:4},runtimeObservation:runtimeObservation(),expectedBeforeMatched:true,permissionVerified:false,
   backendActorVerified:false,backendClockVerified:false,startupQualified:false,workerIdentityVerified:false,sourceMembershipVerified:false,persistenceVerified:false,
   writerAuthority:false,executionAuthorized:false,mutationDispatched:false,explicitSaveDispatched:false};
 };
 same();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;stage='TIMEOUT';reject(new Error('CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_REFUSED:TIMEOUT'));},${CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_TIMEOUT_MS}]);});
 return await Promise.race([run(),timeout]);
}catch{throw new Error('CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_REFUSED:'+stage);}
finally{if(timer!==undefined){try{apply(clear,root,[timer]);}catch{throw new Error('CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_REFUSED:CLEANUP');}}}
})();
const json=JSON.stringify(observation),utf8Bytes=new TextEncoder().encode(json).byteLength;
const envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};
if(utf8Bytes>${CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_MAX_BYTES})throw new Error('CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_ENVELOPE');
return envelope;`;
}

/** Strict bounded comparison only. Neither supplied JSON nor a successful
 * result proves source membership, installed producers, startup or permission.
 */
export function decodeCurrentProjectOnlySymbolPreflightReply(raw: unknown, expected: unknown): CurrentProjectOnlySymbolPreflightResult {
  const selected = request(expected);
  assertUpstreamReplySettled(raw);
  const envelope = fields(extractToolPayload(raw), ["schema", "utf8Bytes", "json"]);
  if (envelope["schema"] !== EXACT_READ_ENVELOPE_SCHEMA || typeof envelope["json"] !== "string" ||
    envelope["json"].length === 0 || envelope["json"].length > CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_MAX_BYTES ||
    !Number.isSafeInteger(envelope["utf8Bytes"]) || Buffer.byteLength(envelope["json"], "utf8") > CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_MAX_BYTES ||
    Buffer.byteLength(JSON.stringify(envelope), "utf8") > CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_MAX_BYTES) { throw new Error("CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_ENVELOPE"); }
  const result = currentProjectOnlySymbolPreflightResultSchema.parse(decodeExactReadEnvelope(envelope));
  if (canonicalJson(result.target) !== canonicalJson(selected.target) || canonicalJson(result.expectedBefore) !== canonicalJson(selected.expectedBefore)) {
    throw new Error("CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_TARGET");
  }
  return Object.freeze(result);
}
