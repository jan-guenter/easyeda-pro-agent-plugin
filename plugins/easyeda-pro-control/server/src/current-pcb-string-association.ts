/** Source-admitted, dormant String channel/empty-upload observations.
 * PCB217199c8: Dte@3131133, A8e@3138434/initProject@3141415,
 * mCe@3133961, sCe@2754327, Dm@4309947.
 * WORKERb849bd12: wa@1711077, Lg@2103244, bootstrap@2176876.
 * Source names and matching channel names are not original lifecycle ownership.
 */
import { createHash } from "node:crypto";
import { z } from "zod";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION } from "./current-pcb-diagnostic-model-program.ts";
import { CURRENT_PCB_STRING_OBSERVATION_GUARDS, currentPcbStringCountSchema,
  currentPcbStringMarkerSchema, decodeCurrentPcbStringObservation } from "./current-pcb-string-observation-core.ts";
import type { CURRENT_PCB_STRING_OBSERVATION_LIMITS } from "./current-pcb-string-observation-core.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const EMPTY_MAPS = ["bufferUploadData", "bufferUploadCache"] as const;
const EMPTY_SETS = ["task1", "task2", "task3", "cachePromise", "publishTask", "rollbackPromise",
  "syncPendingNodeUuids", "confirmedEmptyNodeUuids", "warnedEmptyNodeUuids"] as const;
const projectId = z.string().regex(/^(?:[a-f\d]{32}|[a-f\d]{64})$/u);
const documentId = z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u);
const token = z.string().regex(/^[a-f\d]{16}$/u);
const windowId = z.string().regex(/^[A-Za-z\d_-]{1,128}$/u);
const empty = z.array(z.never()).length(0);
const channelName = z.string().max(203).regex(/^\/[A-Za-z\d_-]{1,128}\/project\/(?:[a-f\d]{32}|[a-f\d]{64})$/u);
const busUuid = z.uuid();

/** The only native getter is BroadcastChannel.prototype.name. The actual
 * receiver must use that exact prototype, without an own override. The getter
 * executes only under CDP throwOnSideEffect; do not fall back on plain eval.
 * Native intrinsic provenance and message delivery remain separate evidence. */
const CHANNEL = `
const channel=(bus,name,klassName)=>{
named(bus,klassName);if(own(globalThis,name)!==bus)bad();
const bc=object(own(bus,"bc")),constructor=own(globalThis,"BroadcastChannel"),prototype=own(constructor,"prototype");
if(Object.getPrototypeOf(bc)!==prototype||Object.hasOwn(bc,"name"))bad();
const d=Object.getOwnPropertyDescriptor(prototype,"name");if(!d||typeof d.get!=="function"||d.set!==undefined)bad();
if(Reflect.apply(d.get,bc,[])!==name)bad();
const uuid=id(own(bus,"uuid"),/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/);
return {name,uuid};
};
`;

/** Same original Save-handler scope and callback argument as the maintained
 * model reader. One extra callFunctionOn, fixed side-effect-check contract.
 * All compiler registry keys are listed, all values exact Maps, and the sole
 * allowed entry is the original main compiler under its unique ID.
 */
export const CURRENT_PCB_STRING_RENDERER_ASSOCIATION_FUNCTION = `function(originalCallback){
${CURRENT_PCB_STRING_OBSERVATION_GUARDS}
${CHANNEL}
if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback)bad();
const scope=object(own(this,"object")),klass=n=>{const c=own(scope,n);if(typeof c!=="function")bad();return c;};
const instance=(o,c)=>{object(o);if(Object.getPrototypeOf(o)!==own(c,"prototype"))bad();return o;};
const ec=klass("x"),env=instance(own(ec,"env"),ec),compiler=instance(own(env,"_compiler"),klass("Zu"));
const base=instance(own(compiler,"base"),klass("A8e")),consistency=instance(own(base,"consistencyManager"),klass("sCe"));
const documentUuid=id(own(env,"_id"),/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/),projectUuid=id(own(base,"path"),/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/);
const windowTabId=id(own(base,"windowId"),/^[A-Za-z0-9_-]{1,128}$/),tabId=documentUuid+"@"+projectUuid;
const uniqueId=id(own(consistency,"unique"),/^[a-f0-9]{16}$/),client=id(own(consistency,"client"),/^[A-Za-z0-9_-]{1,128}$/);
if(own(env,"_doctype")!==3||own(env,"_tabId")!==tabId||own(compiler,"uuid")!==documentUuid||own(base,"uuid")!==documentUuid||
own(compiler,"consistencyManager")!==consistency||own(base,"_headType")!=="PCB"||client!==windowTabId)bad();
const compilerChannel=instance(own(env,"compilerChannel"),klass("mCe"));
if(own(base,"channel")!==compilerChannel)bad();
const registry=plain(own(compilerChannel,"compiler")),registryNames=keys(registry);
if(registryNames.length>6||!registryNames.includes("PCB")||registryNames.some(n=>!["SYMBOL","FOOTPRINT","DEVICE","SCH_PAGE","PCB","PANEL"].includes(n)))bad();
const compilerRegistry={};for(const kind of registryNames){const map=own(registry,kind),n=size(map,Map.prototype);
if(kind==="PCB"){if(n!==1||Reflect.apply(own(Map.prototype,"get"),map,[uniqueId])!==base)bad();compilerRegistry[kind]=[uniqueId];}
else{if(n!==0)bad();compilerRegistry[kind]=[];}}
const mc=klass("wi"),manager=instance(own(mc,"manager"),mc),alternate=marker(mc,"otherDecodingProjectId");
if(alternate==="present")bad();
const footprints={holderKeys:emptyMap(own(manager,"map")),otherProjectManagerKeys:emptyObject(own(mc,"otherProjectManagerMap")),otherDecodingProjectId:alternate};
const bus=channel(own(base,"dataBus"),"/"+windowTabId+"/project/"+projectUuid,"J");
const compilerState={isProject:flag(own(base,"isProject")),isInit:flag(own(base,"isInit")),canSave:flag(own(base,"canSave")),
isInitIng:flag(own(base,"isInitIng")),isDestroy:flag(own(base,"isDestroy"))};
const channelState={locker:count(own(compilerChannel,"_locker")),lockerTicket:count(own(compilerChannel,"_lockerTicket")),
temporaryUnlock:marker(compilerChannel,"_temporaryUnlock"),temporaryUnlockValue:null,isPull:flag(own(compilerChannel,"isPull"))};
if(channelState.temporaryUnlock==="present")channelState.temporaryUnlockValue=count(own(compilerChannel,"_temporaryUnlock"));
verify();if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback)bad();
return JSON.stringify({schema:"easyeda-pro-control.pcb-string-renderer-association.v1",
identity:{projectUuid,documentUuid,windowTabId,tabId,uniqueId,client},bus,compilerState,compilerRegistry,channelState,footprints});
}`;

/** One evaluate on the admitted project worker uniqueContextId, with the same
 * effect-check contract as the maintained worker reader. Only empty upload
 * membership is supported. No task/payload value is traversed or emitted. */
function workerProgram(phase: "empty" | "after-create" | "after-save"): string {
  const membershipFields = {
    empty: "uniqueIdsKeys:membership.uniqueIdsKeys",
    "after-create": "uniqueId:membership.uniqueId,documentUuid:membership.documentUuid,primitiveId:membership.primitiveId",
    "after-save": "uniqueId:membership.uniqueId,documentKeys:membership.documentKeys",
  }[phase];
  const membership = phase === "empty" ? 'const membership={uniqueIdsKeys:emptyObject(own(consistency,"uniqueIds"))};' : `
const tokens=plain(own(consistency,"uniqueIds")),tokenKeys=keys(tokens);if(tokenKeys.length!==1)bad();
const uniqueId=id(tokenKeys[0],/^[a-f0-9]{16}$/),documents=plain(own(tokens,uniqueId)),documentKeys=keys(documents);
${phase === "after-create" ? `
if(documentKeys.length!==1)bad();const documentUuid=id(documentKeys[0],/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/);
const ids=own(documents,documentUuid);if(size(ids,Set.prototype)!==1)bad();
const iterator=Reflect.apply(own(Set.prototype,"values"),ids,[]),next=own(Object.getPrototypeOf(iterator),"next");
const first=Reflect.apply(next,iterator,[]);if(own(first,"done")!==false)bad();
const primitiveId=id(own(first,"value"),/^[a-f0-9]{16}$/);
if(own(Reflect.apply(next,iterator,[]),"done")!==true)bad();
const membership={uniqueId,documentUuid,primitiveId};
` : 'if(documentKeys.length!==0)bad();const membership={uniqueId,documentKeys:[]};'}
`;
  return `(()=>{
${CURRENT_PCB_STRING_OBSERVATION_GUARDS}
${CHANNEL}
const project=named(own(globalThis,"PROJECT"),"Lg"),gp=Object.getPrototypeOf(Object.getPrototypeOf(project));
if(own(own(gp,"constructor"),"name")!=="Gd"||Object.getPrototypeOf(gp)!==Object.prototype)bad();
const consistency=named(own(project,"consistencyManager"),"ja");
const projectUuid=id(own(project,"uuid"),/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/),
branchUuid=id(own(project,"_branchUuid"),/^[a-f0-9]{32}$/),windowTabId=id(own(globalThis,"_TAB_ID_"),/^[A-Za-z0-9_-]{1,128}$/);
const bus=channel(own(project,"workerBus"),"/"+windowTabId+"/project/"+projectUuid,"JP");
const uploadMaps={},taskSets={};
for(const key of ${JSON.stringify(EMPTY_MAPS)})uploadMaps[key]=emptyMap(own(project,key));
for(const key of ${JSON.stringify(EMPTY_SETS)})taskSets[key]=emptySet(own(project,key));
${membership}
verify();
return JSON.stringify({schema:"easyeda-pro-control.pcb-string-worker-${phase === "empty" ? "association" : phase}.v1",identity:{projectUuid,branchUuid,windowTabId},
bus,uploadMaps,taskSets,${membershipFields}});
})()`;
}
export const CURRENT_PCB_STRING_WORKER_ASSOCIATION_EXPRESSION = workerProgram("empty");
/** These separate fixed phase programs never reinterpret nonempty membership as
 * empty. ja.remoteChange@296338 creates token/doc/ID membership; token-selected
 * compress@287014 deletes the doc key but preserves the token dictionary. They
 * still require empty observed task/upload collections, not queue completion. */
export const CURRENT_PCB_STRING_WORKER_AFTER_CREATE_EXPRESSION = workerProgram("after-create");
export const CURRENT_PCB_STRING_WORKER_AFTER_SAVE_EXPRESSION = workerProgram("after-save");

const busSchema = z.object({ name: channelName, uuid: busUuid }).strict();
const rendererSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-string-renderer-association.v1"),
  identity: z.object({ projectUuid: projectId, documentUuid: documentId, windowTabId: windowId,
    tabId: z.string().max(97), uniqueId: token, client: windowId }).strict(),
  bus: busSchema,
  compilerState: z.object({ isProject: z.boolean(), isInit: z.boolean(), canSave: z.boolean(),
    isInitIng: z.boolean(), isDestroy: z.boolean() }).strict(),
  compilerRegistry: z.partialRecord(z.enum(["SYMBOL", "FOOTPRINT", "DEVICE", "SCH_PAGE", "PCB", "PANEL"]), z.array(token).max(1)),
  channelState: z.object({ locker: currentPcbStringCountSchema, lockerTicket: currentPcbStringCountSchema,
    temporaryUnlock: currentPcbStringMarkerSchema, temporaryUnlockValue: currentPcbStringCountSchema.nullable(),
    isPull: z.boolean() }).strict(),
  footprints: z.object({ holderKeys: empty, otherProjectManagerKeys: empty,
    otherDecodingProjectId: z.enum(["absent", "undefined", "null"]) }).strict(),
}).strict().refine(value => value.identity.tabId === `${value.identity.documentUuid}@${value.identity.projectUuid}` &&
  value.identity.client === value.identity.windowTabId &&
  value.bus.name === `/${value.identity.windowTabId}/project/${value.identity.projectUuid}` &&
  value.compilerRegistry.PCB?.length === 1 && value.compilerRegistry.PCB[0] === value.identity.uniqueId &&
  Object.entries(value.compilerRegistry).every(([key, ids]) => key === "PCB" || ids.length === 0) &&
  (value.channelState.temporaryUnlock === "present") === (value.channelState.temporaryUnlockValue !== null));
const workerFields = {
  identity: z.object({ projectUuid: projectId, branchUuid: z.string().regex(/^[a-f\d]{32}$/u), windowTabId: windowId }).strict(),
  bus: busSchema, uploadMaps: z.record(z.enum(EMPTY_MAPS), empty), taskSets: z.record(z.enum(EMPTY_SETS), empty),
};
function workerChannel(value: z.infer<typeof workerFields.identity> & { channelName: string }): boolean {
  return value.channelName === `/${value.windowTabId}/project/${value.projectUuid}`;
}
const workerSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-string-worker-association.v1"),
  ...workerFields, uniqueIdsKeys: empty,
}).strict().refine(value => workerChannel({ ...value.identity, channelName: value.bus.name }));
const workerAfterCreateSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-string-worker-after-create.v1"),
  ...workerFields, uniqueId: token, documentUuid: documentId, primitiveId: token,
}).strict().refine(value => workerChannel({ ...value.identity, channelName: value.bus.name }));
const workerAfterSaveSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-string-worker-after-save.v1"),
  ...workerFields, uniqueId: token, documentKeys: empty,
}).strict().refine(value => workerChannel({ ...value.identity, channelName: value.bus.name }));

export type CurrentPcbStringRendererAssociation = Readonly<z.infer<typeof rendererSchema>> & typeof CURRENT_PCB_STRING_OBSERVATION_LIMITS;
export type CurrentPcbStringWorkerAssociation = Readonly<z.infer<typeof workerSchema>> & typeof CURRENT_PCB_STRING_OBSERVATION_LIMITS;
export type CurrentPcbStringWorkerAfterCreate = Readonly<z.infer<typeof workerAfterCreateSchema>> & typeof CURRENT_PCB_STRING_OBSERVATION_LIMITS;
export type CurrentPcbStringWorkerAfterSave = Readonly<z.infer<typeof workerAfterSaveSchema>> & typeof CURRENT_PCB_STRING_OBSERVATION_LIMITS;

export function decodeCurrentPcbStringRendererAssociation(input: unknown): CurrentPcbStringRendererAssociation {
  return decodeCurrentPcbStringObservation(input, rendererSchema);
}
export function decodeCurrentPcbStringWorkerAssociation(input: unknown): CurrentPcbStringWorkerAssociation {
  return decodeCurrentPcbStringObservation(input, workerSchema);
}
export function decodeCurrentPcbStringWorkerAfterCreate(input: unknown): CurrentPcbStringWorkerAfterCreate {
  return decodeCurrentPcbStringObservation(input, workerAfterCreateSchema);
}
export function decodeCurrentPcbStringWorkerAfterSave(input: unknown): CurrentPcbStringWorkerAfterSave {
  return decodeCurrentPcbStringObservation(input, workerAfterSaveSchema);
}

/** Re-decodes the supplied raw replies. Equal names describe a channel relation,
 * not native worker ownership, exclusive recipients, delivery or completion. */
export interface CurrentPcbStringChannelAssociation {
  readonly profile: "private.current-pcb-string-channel-association.v1";
  readonly suppliedChannelRelationMatches: true;
  readonly identity: CurrentPcbStringRendererAssociation["identity"] & Readonly<{ branchUuid: string }>;
  readonly channelName: string;
  readonly originalOwnerVerified: false;
  readonly projectWorkerAssociationVerified: false;
  readonly publicationDelivered: false;
  readonly queueCompletionVerified: false;
  readonly saveAuthorized: false;
  readonly executionAuthorized: false;
}

export function compareCurrentPcbStringChannelAssociation(renderer: unknown, worker: unknown): CurrentPcbStringChannelAssociation {
  const r = decodeCurrentPcbStringRendererAssociation(renderer), w = decodeCurrentPcbStringWorkerAssociation(worker);
  if (r.identity.projectUuid !== w.identity.projectUuid || r.identity.windowTabId !== w.identity.windowTabId ||
      r.bus.name !== w.bus.name || r.bus.uuid === w.bus.uuid) { throw new Error("PCB_STRING_CHANNEL_ASSOCIATION"); }
  return freezeDeep({ profile: "private.current-pcb-string-channel-association.v1", suppliedChannelRelationMatches: true,
    identity: { ...r.identity, branchUuid: w.identity.branchUuid }, channelName: r.bus.name,
    originalOwnerVerified: false, projectWorkerAssociationVerified: false, publicationDelivered: false,
    queueCompletionVerified: false, saveAuthorized: false, executionAuthorized: false } as const);
}

export const CURRENT_PCB_STRING_ASSOCIATION_HASHES = Object.freeze({
  renderer: createHash("sha256").update(CURRENT_PCB_STRING_RENDERER_ASSOCIATION_FUNCTION).digest("hex"),
  worker: createHash("sha256").update(CURRENT_PCB_STRING_WORKER_ASSOCIATION_EXPRESSION).digest("hex"),
  workerAfterCreate: createHash("sha256").update(CURRENT_PCB_STRING_WORKER_AFTER_CREATE_EXPRESSION).digest("hex"),
  workerAfterSave: createHash("sha256").update(CURRENT_PCB_STRING_WORKER_AFTER_SAVE_EXPRESSION).digest("hex"),
});
