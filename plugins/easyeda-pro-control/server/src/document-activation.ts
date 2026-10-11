import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import type { ExpectedContext } from "./engine.ts";
import { libraryOperationSchema } from "./library-operations.ts";
import { libraryProjectRecordsHash } from "./library-persistence-proof.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { DEVICE_NATIVE_HOST_GUARD } from "./device-runtime-guard.ts";
import { PCB_NAVIGATION_PREFERENCE_GUARD } from "./pcb-navigation-preferences.ts";

export const DOCUMENT_ACTIVATION_PROFILE = "easyeda-pro-control.document-activation.v1";
const identity = z.string().min(1).max(256).regex(/^[a-z0-9_-]+$/iu);
const documentType = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);
const member = z.object({ uuid: identity, documentType }).strict();
const contextSchema = member.extend({ tabId: z.string().min(1).max(512) }).strict();
const planSchema = z.object({ profile: z.literal(DOCUMENT_ACTIVATION_PROFILE), projectUuid: identity,
  projectOwnerUuid: identity, branchUuid: identity, projectPath: z.string().min(1).max(4096),
  before: contextSchema, target: contextSchema, members: z.array(member).min(1).max(8192),
  projectRecordsSha256: z.string().regex(/^[a-f0-9]{64}$/u) }).strict();
export type DocumentActivationPlan = z.infer<typeof planSchema>;

/** Only a sealed checkpoint can supply document membership and native owner.
 * Tab identifiers are selectors, never authority for opening another project.
 */
export function prepareDocumentActivation(operationInput: unknown, history: NativeHistorySnapshot, context: ExpectedContext): DocumentActivationPlan {
  const operation = libraryOperationSchema.parse(operationInput);
  if (operation.action !== "document.activate") { throw new Error("Document activation requires its exact typed operation."); }
  const members = history.documents.filter((entry) => !isNativeDocumentDeleted(entry) && ["SCH_PAGE", "SYMBOL", "PCB", "FOOTPRINT"].includes(entry.docType))
    .map((entry) => member.parse({ uuid: entry.uuid, documentType: { SCH_PAGE: 1, SYMBOL: 2, PCB: 3, FOOTPRINT: 4 }[entry.docType] }));
  const targetId = operation.tabId.split("@")[0];
  const targets = members.filter((entry) => entry.uuid === targetId);
  const beforeUuid = context.document.uuid ?? context.document.documentUuid;
  if (targets.length !== 1 || targets[0] === undefined || new Set(members.map((entry) => entry.uuid)).size !== members.length ||
      (context.project.uuid ?? context.project.projectUuid) !== history.projectUuid ||
      (context.project.uuid !== undefined && context.project.projectUuid !== undefined && context.project.uuid !== context.project.projectUuid) ||
      (context.document.uuid !== undefined && context.document.documentUuid !== undefined && context.document.uuid !== context.document.documentUuid) ||
      !members.some((entry) => entry.uuid === beforeUuid && entry.documentType === context.document.documentType)) {
    throw new Error("Activation target and current editor must belong to the exact checkpoint project.");
  }
  const plan = planSchema.parse({ profile: DOCUMENT_ACTIVATION_PROFILE, projectUuid: history.projectUuid,
    projectOwnerUuid: history.projectOwnerUuid, branchUuid: history.branchUuid, projectPath: context.project.path,
    before: { uuid: beforeUuid, documentType: context.document.documentType, tabId: context.document.tabId },
    target: { ...targets[0], tabId: operation.tabId }, members, projectRecordsSha256: libraryProjectRecordsHash(history) });
  for (const scope of [plan.before, plan.target]) {
    if (scope.tabId !== scope.uuid && scope.tabId !== `${scope.uuid}@${plan.projectUuid}` ||
        ([2, 4].includes(scope.documentType) && scope.tabId !== `${scope.uuid}@${plan.projectUuid}`)) {
      throw new Error("Activation tab does not encode the exact current-project document.");
    }
  }
  if (plan.before.tabId === plan.target.tabId) { throw new Error("The exact target tab is already active; inspect context without another native activation."); }
  if (Buffer.byteLength(JSON.stringify(plan)) > 1_048_576) { throw new Error("Activation inventory exceeds its fixed transport bound."); }
  return plan;
}

export function documentActivationContext(planInput: DocumentActivationPlan): ExpectedContext {
  const plan = planSchema.parse(planInput);
  return { project: { uuid: plan.projectUuid, path: plan.projectPath },
    document: { ...plan.target, ...([2, 4].includes(plan.target.documentType) ? { parentLibraryUuid: plan.projectOwnerUuid } : { parentProjectUuid: plan.projectUuid }) } };
}

/** Classify one complete independent context observation. Do not turn a failed
 * target probe into permission to ignore an intervening third document.
 */
export function classifyDocumentActivationContext(planInput: DocumentActivationPlan, observed: ExpectedContext): boolean {
  const plan = planSchema.parse(planInput);
  const document = observed.document, project = observed.project;
  const projectUuid = project.uuid ?? project.projectUuid, uuid = document.uuid ?? document.documentUuid;
  if (projectUuid !== plan.projectUuid || project.path !== plan.projectPath ||
      (project.uuid !== undefined && project.projectUuid !== undefined && project.uuid !== project.projectUuid) ||
      (document.uuid !== undefined && document.documentUuid !== undefined && document.uuid !== document.documentUuid)) {
    throw new Error("Activation recovery observed a conflicting project or document identity.");
  }
  const targetActive = uuid === plan.target.uuid && document.documentType === plan.target.documentType && document.tabId === plan.target.tabId;
  const originalActive = uuid === plan.before.uuid && document.documentType === plan.before.documentType && document.tabId === plan.before.tabId;
  if ((!targetActive && !originalActive) || ([2, 4].includes(document.documentType) ?
    document["parentLibraryUuid"] !== plan.projectOwnerUuid || (document["parentProjectUuid"] !== undefined && document["parentProjectUuid"] !== plan.projectUuid) :
    document["parentProjectUuid"] !== plan.projectUuid || document["parentLibraryUuid"] !== undefined)) {
    throw new Error("Activation recovery observed a third document or conflicting owner.");
  }
  return targetActive;
}

export function verifyDocumentActivationProject(planInput: DocumentActivationPlan, before: NativeHistorySnapshot, after: NativeHistorySnapshot): void {
  const plan = planSchema.parse(planInput);
  if (before.projectUuid !== plan.projectUuid || before.projectOwnerUuid !== plan.projectOwnerUuid || before.branchUuid !== plan.branchUuid ||
      after.projectUuid !== plan.projectUuid || after.projectOwnerUuid !== plan.projectOwnerUuid || after.branchUuid !== plan.branchUuid ||
      libraryProjectRecordsHash(before) !== plan.projectRecordsSha256 || libraryProjectRecordsHash(after) !== plan.projectRecordsSha256) {
    throw new Error("Document activation changed the complete durable project, branch or owner.");
  }
}

export function validateDocumentActivationResult(input: unknown, planInput: DocumentActivationPlan): Record<string, unknown> {
  const plan = planSchema.parse(planInput);
  const result = z.object({ kind: z.literal("document-activate"), profile: z.literal(DOCUMENT_ACTIVATION_PROFILE),
    planSha256: z.string(), tabId: z.string(), acknowledgment: z.boolean(), coherentObservations: z.literal(2),
    tabsUnchanged: z.literal(true), saveInvoked: z.literal(false), closeInvoked: z.literal(false), openInvoked: z.literal(false) }).strict().parse(input);
  if (result.planSha256 !== sha256Json(plan) || result.tabId !== plan.target.tabId) { throw new Error("Document activation return differs from its retained exact plan."); }
  return result;
}

export function verifyRetainedDocumentActivation(operation: unknown, before: NativeHistorySnapshot, context: ExpectedContext, prepared: unknown, journalPlan: unknown): DocumentActivationPlan {
  const expected = prepareDocumentActivation(operation, before, context);
  if (canonicalJson(expected) !== canonicalJson(prepared) || canonicalJson(expected) !== canonicalJson(journalPlan)) {
    throw new Error("Retained activation plan differs from its original operation and checkpoint.");
  }
  return expected;
}

/** One supported activation, no open/close/save and no retry. The pinned UI's
 * boolean is retained as evidence, not treated as proof of selected context.
 */
export function buildDocumentActivationExpression(planInput: DocumentActivationPlan): string {
  const plan = planSchema.parse(planInput);
  return `(async()=>{
const plan=${JSON.stringify(plan)},planSha256=${JSON.stringify(sha256Json(plan))};let stage='api',preferenceFailure;
const fail=()=>{throw new Error('ACTIVATION_REFUSED');};
try{
const project=eda.dmt_Project,select=eda.dmt_SelectControl,editor=eda.dmt_EditorControl;
const timers=globalThis.window?.top;
if(typeof project?.getCurrentProjectInfo!=='function'||typeof select?.getCurrentDocumentInfo!=='function'||typeof editor?.getSplitScreenTree!=='function'||typeof editor?.activateDocument!=='function'||typeof timers?.setTimeout!=='function'||typeof timers?.clearTimeout!=='function'||typeof timers?.document?.getElementById!=='function')fail();
${DEVICE_NATIVE_HOST_GUARD}
const loadedFrames=new Map();
${PCB_NAVIGATION_PREFERENCE_GUARD}
// The pinned UI reads this exact local-storage key before its preference write.
// Never enable the setting or substitute truthiness for the stored Boolean.
const preferencesSafe=()=>{if(![3,4].includes(plan.target.documentType))return;
preferenceFailure=pcbNavigationPreferenceIssue();if(preferenceFailure!==undefined)fail();};
const frameFor=scope=>{const frame=timers.document.getElementById('frame_'+scope.tabId);
if(host.currentProject?.projectId!==plan.projectUuid||!frame||frame.isConnected!==true||frame.tagName!==(scope.documentType<=2?'DIV':'IFRAME')||frame.getAttribute('c_dbid')!==scope.tabId||frame.getAttribute('c_doctype')!==String(scope.documentType))fail();
return frame;};
const framesMatch=()=>{preferencesSafe();for(const scope of [plan.before,plan.target])if(frameFor(scope)!==loadedFrames.get(scope.tabId))fail();};
const id=(value,key,alias)=>{if(!value||typeof value!=='object'||Array.isArray(value))fail();const a=value[key],b=value[alias];if(a!==undefined&&b!==undefined&&a!==b)fail();const result=a??b;if(typeof result!=='string'||!result)fail();return result;};
const projectIdentity=async()=>{const value=await project.getCurrentProjectInfo();if(id(value,'uuid','projectUuid')!==plan.projectUuid)fail();};
const inspect=async(expected,allowMissing=false)=>{
await projectIdentity();const value=await select.getCurrentDocumentInfo();await projectIdentity();
if((value===undefined||value===null)&&allowMissing)return false;
const uuid=id(value,'uuid','documentUuid'),matches=scope=>uuid===scope.uuid&&value.documentType===scope.documentType&&value.tabId===scope.tabId;
const waiting=allowMissing&&!matches(expected)&&matches(plan.before),scope=waiting?plan.before:expected;
if(!matches(scope))fail();
if([2,4].includes(scope.documentType)?value.parentLibraryUuid!==plan.projectOwnerUuid||value.parentProjectUuid!==undefined&&value.parentProjectUuid!==plan.projectUuid:
value.parentProjectUuid!==plan.projectUuid||value.parentLibraryUuid!==undefined)fail();return !waiting;
};
const tree=async()=>{
const root=await editor.getSplitScreenTree(),pending=[{node:root,depth:0}],seen=new Set(),tabs=[],ids=new Set();
while(pending.length){const item=pending.pop(),node=item.node;
if(!node||typeof node!=='object'||Array.isArray(node)||seen.has(node)||item.depth>16||seen.size>=128)fail();seen.add(node);
if(node.children!==undefined){if(!Array.isArray(node.children)||!node.children.length||node.children.length>128||node.tabs!==undefined||pending.length+node.children.length+seen.size>128)fail();for(const child of node.children)pending.push({node:child,depth:item.depth+1});}
else{if(!Array.isArray(node.tabs)||!node.tabs.length||node.tabs.length>256)fail();for(const tab of node.tabs){
if(tabs.length>=256||!tab||typeof tab!=='object'||Array.isArray(tab)||typeof tab.tabId!=='string'||!tab.tabId||ids.has(tab.tabId))fail();ids.add(tab.tabId);
const data=tab.data;if(data!==undefined&&(!data||typeof data!=='object'||Array.isArray(data)))fail();
if(tab.documentType!==undefined&&data?.doctype!==undefined&&tab.documentType!==data.doctype)fail();
const type=tab.documentType??data?.doctype,uuid=tab.tabId.split('@')[0];
const start=tab.tabId==='tab_page1'&&type===-1&&tab.isAbleDelete===false&&tab.parentProjectUuid===undefined&&tab.parentLibraryUuid===undefined&&data?.pid===undefined&&data?.owner===undefined;
const owned=plan.members.some(m=>m.uuid===uuid&&m.documentType===type)&&(tab.tabId===uuid||tab.tabId===uuid+'@'+plan.projectUuid)&&
(tab.parentProjectUuid===undefined||tab.parentProjectUuid===plan.projectUuid)&&(data?.pid===undefined||data.pid===plan.projectUuid)&&
([2,4].includes(type)?tab.tabId===uuid+'@'+plan.projectUuid&&(tab.parentLibraryUuid===plan.projectOwnerUuid||data?.owner===plan.projectOwnerUuid)&&(tab.parentLibraryUuid===undefined||tab.parentLibraryUuid===plan.projectOwnerUuid)&&(data?.owner===undefined||data.owner===plan.projectOwnerUuid):
(tab.parentProjectUuid===plan.projectUuid||data?.pid===plan.projectUuid)&&tab.parentLibraryUuid===undefined&&(data?.owner===undefined||data.owner===plan.projectOwnerUuid));
if(!start&&!owned)fail();tabs.push({tabId:tab.tabId,uuid,documentType:type});
}}}
for(const target of [plan.before,plan.target])if(!tabs.some(t=>t.tabId===target.tabId&&t.uuid===target.uuid&&t.documentType===target.documentType))fail();
return JSON.stringify(tabs.sort((a,b)=>a.tabId<b.tabId?-1:a.tabId>b.tabId?1:0));
};
stage='before-context';await inspect(plan.before);
stage='before-tabs';const beforeTabs=await tree();
stage='loaded-frames';for(const scope of [plan.before,plan.target]){
if(scope.documentType<=2&&(await bus.rpcCall('getModelTabId',scope.tabId))?.message!==scope.tabId)fail();
loadedFrames.set(scope.tabId,frameFor(scope));}
stage='preferences';preferencesSafe();
stage='dispatch-context';await inspect(plan.before);
framesMatch();
stage='activate';const acknowledgment=await editor.activateDocument(plan.target.tabId);
if(typeof acknowledgment!=='boolean')fail();
stage='target-readiness';let deadline,pollTimer,rejectDeadline;
const expired=new Promise((resolve,reject)=>{rejectDeadline=reject;});expired.catch(()=>{});
try{deadline=timers.setTimeout(()=>rejectDeadline(new Error('ACTIVATION_DEADLINE')),15000);
let coherent=0;
for(let attempt=0;attempt<300;attempt++){
const matches=await Promise.race([inspect(plan.target,true),expired]);
framesMatch();
if(matches){const observed=await Promise.race([tree(),expired]);if(observed!==beforeTabs)fail();if(!await Promise.race([inspect(plan.target),expired]))fail();coherent+=1;}else coherent=0;
if(coherent===2)break;
await Promise.race([new Promise(resolve=>{pollTimer=timers.setTimeout(()=>{pollTimer=undefined;resolve();},50);}),expired]);
}if(coherent!==2)fail();
}finally{if(deadline!==undefined)timers.clearTimeout(deadline);if(pollTimer!==undefined)timers.clearTimeout(pollTimer);}
framesMatch();
const payload={kind:'document-activate',profile:plan.profile,planSha256,tabId:plan.target.tabId,acknowledgment,coherentObservations:2,tabsUnchanged:true,saveInvoked:false,closeInvoked:false,openInvoked:false};
const json=JSON.stringify(payload);return{schema:'easyeda-pro-control.exact-json.v1',utf8Bytes:new TextEncoder().encode(json).byteLength,json};
}catch{throw new Error('Document activation refused: '+stage+(preferenceFailure===undefined?'':':'+preferenceFailure));}
})()`;
}
