/** Fixed private observer compiler. No dispatch or original SQL ownership is supplied here. */
import { DEVICE_NATIVE_HOST_GUARD } from "./device-runtime-guard.ts";
import { buildActorBoundEditorTargetAbsentExpression } from "./editor-tabs.ts";
import type { ExpectedContext } from "./engine.ts";
import { NATIVE_PROJECT_PLACEHOLDER_PREDICATE } from "./native-editor-tab-guards.ts";
import { SYMBOL_DUAL_ACTOR_CAPTURE_SOURCE, validateActorProjection } from "./symbol-dual-actor.ts";
import { SYMBOL_WORKER_GUARD_SOURCE, SYMBOL_WORKER_NATIVE_GUARD_CODES } from "./symbol-worker-guard.ts";

export interface SavedSymbolReadPlan { readonly projectUuid: string; readonly branchUuid: string; readonly ownerUuid: string; readonly targetUuid: string;
  readonly headerEditVersion: string | null; readonly maximumTicket: number; readonly notBeforeMs: number; readonly notAfterMs: number }
const CODES = [...SYMBOL_WORKER_NATIVE_GUARD_CODES, "SAVED_SYMBOL_CONTEXT", "SAVED_SYMBOL_VERSION", "SAVED_SYMBOL_OUTPUT", "SAVED_SYMBOL_CLIENT", "SAVED_SYMBOL_TICKET"];
function need(value: boolean): asserts value { if (!value) { throw new Error("SAVED_SYMBOL_INPUT"); } }
function snapshot(input: SavedSymbolReadPlan): SavedSymbolReadPlan {
  const keys = ["projectUuid", "branchUuid", "ownerUuid", "targetUuid", "headerEditVersion", "maximumTicket", "notBeforeMs", "notAfterMs"];
  need(input !== null && typeof input === "object" && Reflect.ownKeys(input).length === keys.length);
  const values: Record<string, unknown> = {};
  for (const key of keys) { const value = Object.getOwnPropertyDescriptor(input, key); need(value !== undefined && Object.hasOwn(value, "value")); values[key] = value.value as unknown; }
  const branchUuid = values["branchUuid"], ownerUuid = values["ownerUuid"], projectUuid = values["projectUuid"], targetUuid = values["targetUuid"];
  const headerEditVersion = values["headerEditVersion"], maximumTicket = values["maximumTicket"], notAfterMs = values["notAfterMs"], notBeforeMs = values["notBeforeMs"];
  need(typeof projectUuid === "string" && /^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u.test(projectUuid));
  need(typeof branchUuid === "string" && /^[a-f0-9]{32}$/u.test(branchUuid) && typeof ownerUuid === "string" && /^[a-f0-9]{32}$/u.test(ownerUuid) && typeof targetUuid === "string" && /^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u.test(targetUuid));
  need(headerEditVersion === null || (typeof headerEditVersion === "string" && headerEditVersion.length > 0 && headerEditVersion.length <= 128));
  need(typeof maximumTicket === "number" && Number.isSafeInteger(maximumTicket) && maximumTicket >= 0 && maximumTicket < Number.MAX_SAFE_INTEGER);
  need(typeof notBeforeMs === "number" && Number.isSafeInteger(notBeforeMs) && notBeforeMs >= 0 && typeof notAfterMs === "number" && Number.isSafeInteger(notAfterMs) && notAfterMs >= notBeforeMs && notAfterMs - notBeforeMs <= 60_000);
  return { projectUuid, branchUuid, ownerUuid, targetUuid, headerEditVersion, maximumTicket, notBeforeMs, notAfterMs };
}
export function buildSavedSymbolContentExpression(input: SavedSymbolReadPlan, context: ExpectedContext, actorInput: unknown): string {
  return compileSavedSymbolContentExpression(input, context, actorInput, 8_388_608);
}
/** Fixed small-content profile for the contained saved-read stage. */
export function buildClosedSymbolSavedContentExpression(input: SavedSymbolReadPlan, context: ExpectedContext, actorInput: unknown): string {
  return compileSavedSymbolContentExpression(input, context, actorInput, 65_536);
}
function compileSavedSymbolContentExpression(input: SavedSymbolReadPlan, context: ExpectedContext, actorInput: unknown, maximumBytes: 8_388_608 | 65_536): string {
  const expectedActor = validateActorProjection(actorInput), plan = snapshot(input);
  const active = { uuid: context.document.uuid ?? context.document.documentUuid ?? "", documentType: context.document.documentType, tabId: context.document.tabId ?? "" };
  need((context.project.uuid ?? context.project.projectUuid) === plan.projectUuid && active.documentType === 3 && /^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u.test(active.uuid) && active.uuid !== plan.targetUuid && active.tabId === `${active.uuid}@${plan.projectUuid}`);
  need((context.project.uuid === undefined || context.project.projectUuid === undefined || context.project.uuid === context.project.projectUuid) &&
    (context.document.uuid === undefined || context.document.documentUuid === undefined || context.document.uuid === context.document.documentUuid) &&
    (context.document["parentProjectUuid"] === undefined || context.document["parentProjectUuid"] === plan.projectUuid) && context.document["parentLibraryUuid"] === undefined);
  const targetClosed = buildActorBoundEditorTargetAbsentExpression({ projectUuid: plan.projectUuid, ownerUuid: plan.ownerUuid, targetUuid: plan.targetUuid, active });
  return `(async()=>{let stage='scope';try{
const PLAN=${JSON.stringify(plan)},ACTIVE=${JSON.stringify(active)},WORKER={notBeforeMs:PLAN.notBeforeMs,notAfterMs:PLAN.notAfterMs};
${DEVICE_NATIVE_HOST_GUARD}
${NATIVE_PROJECT_PLACEHOLDER_PREDICATE}
const expectedActor=${JSON.stringify(expectedActor)},actorRoot=globalThis;
const bad=()=>{throw new Error('ACTOR_DRIFT');};
const own=(owner,key)=>{if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad();const d=Object.getOwnPropertyDescriptor(owner,key);if(!d||!Object.hasOwn(d,'value'))bad();return d.value;};
if(actorRoot.top!==actorRoot||actorRoot.window!==actorRoot||own(actorRoot,'gVars')!==host)bad();
const actorLocation=actorRoot.location,actorHref=actorLocation?.href,actorDocument=actorRoot.document,actorMode=own(actorRoot,'PRO_EDITOR_MODE');
if(typeof actorHref!=='string'||!new RegExp(${JSON.stringify(String.raw`^https://client/editor\?cll=(?:trace|debug|info|warn|error)#?$`)}).test(actorHref)||actorLocation.origin!=='https://client'||!actorDocument||actorDocument.defaultView!==actorRoot||actorDocument.nodeType!==9||actorDocument.URL!==actorHref)bad();
if(actorMode!=='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'&&actorMode!=='CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM')bad();
${SYMBOL_DUAL_ACTOR_CAPTURE_SOURCE}
if(!actorEqual(startupActorProjection,expectedActor)||!actorEqual(cachedActorProjection,expectedActor))bad();
const actorGuard=()=>{if(actorRoot.top!==actorRoot||actorRoot.window!==actorRoot||own(actorRoot,'gVars')!==host||actorRoot.location!==actorLocation||actorLocation.href!==actorHref||actorLocation.origin!=='https://client'||actorRoot.document!==actorDocument||actorDocument.defaultView!==actorRoot||actorDocument.nodeType!==9||actorDocument.URL!==actorHref||own(actorRoot,'PRO_EDITOR_MODE')!==actorMode)bad();checkDualActor();};
const ui=own(globalThis,'UI');if(own(ui,'gVars')!==host)bad();const permission=own(ui,'concurrentDesign'),tabs=own(ui,'tabBar');
${SYMBOL_WORKER_GUARD_SOURCE}
const guard=()=>{workerGuard();if(workerOwn(globalThis,'PRO_EDITOR_VERSION',true)!==(PLAN.headerEditVersion===null?undefined:PLAN.headerEditVersion))throw new Error('SAVED_SYMBOL_VERSION');};
const actorAwait=async(invoke)=>{guard();try{return await invoke();}finally{guard();}};
const contextGuard=async()=>{
const project=await actorAwait(()=>eda.dmt_Project.getCurrentProjectInfo());
const document=await actorAwait(()=>eda.dmt_SelectControl.getCurrentDocumentInfo());
if((project?.uuid??project?.projectUuid)!==PLAN.projectUuid||(project.uuid!==undefined&&project.projectUuid!==undefined&&project.uuid!==project.projectUuid)||
(document?.uuid??document?.documentUuid)!==ACTIVE.uuid||(document.uuid!==undefined&&document.documentUuid!==undefined&&document.uuid!==document.documentUuid)||document.documentType!==3||document.tabId!==ACTIVE.tabId||
(document.parentProjectUuid!==undefined&&document.parentProjectUuid!==PLAN.projectUuid)||document.parentLibraryUuid!==undefined)throw new Error('SAVED_SYMBOL_CONTEXT');
};
guard();await contextGuard();stage='target-closed';await ${targetClosed};guard();
stage='project';const detail=workerOwn(await actorAwait(()=>workerRpc('/PrjDB/project/getData',[PLAN.projectUuid])),'message');
if(detail?.uuid!==PLAN.projectUuid||detail.owner?.uuid!==PLAN.ownerUuid||detail.currentBranch!==PLAN.branchUuid||detail.isV2Format!==false)throw new Error('SAVED_SYMBOL_CONTEXT');
stage='client-before';const client=workerOwn(await actorAwait(()=>workerRpc('/PrjDB/project/getClient',[PLAN.projectUuid])),'message');
if(typeof client!=='string'||!/^[a-f0-9]{16}$/.test(client))throw new Error('SAVED_SYMBOL_CLIENT');
stage='ticket-before';const before=workerOwn(await actorAwait(()=>workerRpc('/PrjDB/project/getMaxTicket',[PLAN.projectUuid])),'message');
if(before!==PLAN.maximumTicket)throw new Error('SAVED_SYMBOL_TICKET');
stage='content';const content=workerOwn(await actorAwait(()=>workerRpc('/PrjDB/symbol/getStr',[PLAN.targetUuid,PLAN.projectUuid])),'message');
if(typeof content!=='string'||content.length===0||content.length>${maximumBytes}||new TextEncoder().encode(content).length>${maximumBytes})throw new Error('SAVED_SYMBOL_OUTPUT');
stage='client-after';if(workerOwn(await actorAwait(()=>workerRpc('/PrjDB/project/getClient',[PLAN.projectUuid])),'message')!==client)throw new Error('SAVED_SYMBOL_CLIENT');
stage='ticket-after';if(workerOwn(await actorAwait(()=>workerRpc('/PrjDB/project/getMaxTicket',[PLAN.projectUuid])),'message')!==PLAN.maximumTicket)throw new Error('SAVED_SYMBOL_TICKET');
await contextGuard();stage='target-closed-after';await ${targetClosed};guard();
return{profile:'private.saved-symbol-content-observation.v1',projectUuid:PLAN.projectUuid,targetUuid:PLAN.targetUuid,workerClient:client,maximumTicket:PLAN.maximumTicket,content,executionAuthorized:false,producerBindingVerified:false,completionProved:false};
}catch(error){let code='EXCEPTION';try{const d=error!==null&&(typeof error==='object'||typeof error==='function')?Object.getOwnPropertyDescriptor(error,'message'):undefined;if(d&&Object.hasOwn(d,'value')&&${JSON.stringify(CODES)}.includes(d.value))code=d.value;}catch(_){}throw new Error('Saved symbol read refused: '+stage+':'+code);}})()`;
}
