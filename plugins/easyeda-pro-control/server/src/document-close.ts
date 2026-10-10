import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import type { ExpectedContext } from "./engine.ts";
import { DEVICE_NATIVE_HOST_GUARD } from "./device-runtime-guard.ts";
import { libraryOperationSchema } from "./library-operations.ts";
import { libraryProjectRecordsHash } from "./library-persistence-proof.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { NATIVE_PROJECT_PLACEHOLDER_PREDICATE } from "./native-editor-tab-guards.ts";

export const DOCUMENT_CLOSE_PROFILE = "easyeda-pro-control.inactive-clean-document-close.v1";
const identity = z.string().regex(/^[a-zA-Z0-9_-]{1,128}$/u);
const scopeSchema = z.object({ uuid: identity, documentType: z.union([z.literal(2), z.literal(3), z.literal(4)]), tabId: z.string().min(1).max(512) }).strict();
const planSchema = z.object({ profile: z.literal(DOCUMENT_CLOSE_PROFILE), projectUuid: identity, ownerUuid: identity, branchUuid: identity,
  projectPath: z.string().min(1).max(4096), active: scopeSchema, target: scopeSchema,
  projectRecordsSha256: z.string().regex(/^[a-f0-9]{64}$/u) }).strict();
export type DocumentClosePlan = z.infer<typeof planSchema>;

function validatePlan(input: unknown): DocumentClosePlan {
  const plan = planSchema.parse(input);
  if (plan.active.documentType === 2 || plan.active.uuid === plan.target.uuid ||
    [plan.active, plan.target].some((scope) => scope.tabId !== `${scope.uuid}@${plan.projectUuid}`)) {
    throw new Error("Clean close requires an inactive exact project tab and a separate PCB or footprint editor.");
  }
  return plan;
}
function validateHistory(history: NativeHistorySnapshot): void {
  if (history.profile !== "easyeda.native-history.linear-gcm-gzip.v1" || history.documents.length === 0) { throw new Error("Clean close checkpoint is incomplete."); }
  const ids = new Set<string>();
  for (const entry of history.documents) {
    if (ids.has(entry.uuid) || entry.metadata["uuid"] !== entry.uuid || entry.metadata["docType"] !== entry.docType ||
      entry.semanticSha256 !== sha256Json({ uuid: entry.uuid, docType: entry.docType, metadata: entry.metadata,
        records: entry.records.map(({ id, type, body }) => ({ id, type, body })) })) { throw new Error("Clean close checkpoint document integrity failed."); }
    ids.add(entry.uuid);
  }
  if (history.semanticSha256 !== sha256Json(history.documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 })))) {
    throw new Error("Clean close complete checkpoint integrity failed.");
  }
}

/** The public close discards unsaved state. Only a separate, loaded clean tab
 * is admitted. Page close is excluded: pinned clearOnePage can save INSTANCE
 * attributes even when the ordinary tab dirty flag is false.
 */
export function prepareDocumentClose(input: unknown, history: NativeHistorySnapshot, context: ExpectedContext): DocumentClosePlan {
  const operation = libraryOperationSchema.parse(input);
  if (operation.action !== "document.close") { throw new Error("Clean close requires its exact typed operation."); }
  validateHistory(history);
  const member = (uuid: string | undefined): z.infer<typeof scopeSchema> => {
    const matches = history.documents.filter((entry) => entry.uuid === uuid && !isNativeDocumentDeleted(entry));
    const entry = matches[0];
    if (matches.length !== 1 || entry === undefined || !["SYMBOL", "PCB", "FOOTPRINT"].includes(entry.docType)) { throw new Error("Clean close target or active document is not a supported exact checkpoint member."); }
    if (entry.docType === "SYMBOL") {
      const meta = entry.records.filter((record) => record.id === "META" || record.type === "META");
      if (meta.length !== 1 || meta[0]?.id !== "META" || meta[0].type !== "META" || meta[0].body["docType"] !== 2) {
        throw new Error("Clean close supports ordinary type-2 symbols only, not CBB or derived symbol families.");
      }
    }
    return scopeSchema.parse({ uuid, documentType: { SYMBOL: 2, PCB: 3, FOOTPRINT: 4 }[entry.docType], tabId: `${uuid}@${history.projectUuid}` });
  };
  const active = member(context.document.uuid ?? context.document.documentUuid), target = member(operation.tabId.split("@")[0]);
  const plan = validatePlan({ profile: DOCUMENT_CLOSE_PROFILE, projectUuid: history.projectUuid, ownerUuid: history.projectOwnerUuid,
    branchUuid: history.branchUuid, projectPath: context.project.path, active, target, projectRecordsSha256: libraryProjectRecordsHash(history) });
  if (operation.tabId !== target.tabId) { throw new Error("Clean close tab must encode the complete project owner."); }
  assertDocumentCloseContext(plan, context);
  return plan;
}

export function assertDocumentCloseContext(input: DocumentClosePlan, context: ExpectedContext): void {
  const document = context.document, plan = validatePlan(input), project = context.project;
  if ((project.uuid ?? project.projectUuid) !== plan.projectUuid || project.path !== plan.projectPath ||
    (project.uuid !== undefined && project.projectUuid !== undefined && project.uuid !== project.projectUuid) ||
    (document.uuid ?? document.documentUuid) !== plan.active.uuid || document.documentType !== plan.active.documentType || document.tabId !== plan.active.tabId ||
    (document.uuid !== undefined && document.documentUuid !== undefined && document.uuid !== document.documentUuid) ||
    (plan.active.documentType === 4 ? document["parentLibraryUuid"] !== plan.ownerUuid ||
      (document["parentProjectUuid"] !== undefined && document["parentProjectUuid"] !== plan.projectUuid) :
      document["parentProjectUuid"] !== plan.projectUuid || document["parentLibraryUuid"] !== undefined)) {
    throw new Error("Clean close changed or contradicted the exact active context.");
  }
}
export function verifyDocumentCloseProject(input: DocumentClosePlan, before: NativeHistorySnapshot, after: NativeHistorySnapshot): void {
  const plan = validatePlan(input);
  for (const history of [before, after]) {
    validateHistory(history);
    if (history.projectUuid !== plan.projectUuid || history.projectOwnerUuid !== plan.ownerUuid || history.branchUuid !== plan.branchUuid ||
      libraryProjectRecordsHash(history) !== plan.projectRecordsSha256) { throw new Error("Clean close changed the complete durable project, owner or branch."); }
  }
}
export function verifyRetainedDocumentClose(operation: unknown, before: NativeHistorySnapshot, context: ExpectedContext, prepared: unknown, journalPlan: unknown): DocumentClosePlan {
  const expected = prepareDocumentClose(operation, before, context);
  if (canonicalJson(expected) !== canonicalJson(prepared) || canonicalJson(expected) !== canonicalJson(journalPlan)) {
    throw new Error("Retained clean-close plan differs from its original operation and checkpoint.");
  }
  return expected;
}
const resultSchema = z.object({ kind: z.literal("document-close"), profile: z.literal(DOCUMENT_CLOSE_PROFILE), planSha256: z.string(), tabId: z.string(),
  acknowledgment: z.literal(true), closeCalls: z.literal(1), terminalNotifications: z.literal(1), coherentObservations: z.literal(2),
  activeContextUnchanged: z.literal(true), targetOpenNow: z.literal(false), targetFrameRemoved: z.literal(true),
  saveInvoked: z.literal(false), openInvoked: z.literal(false), activationInvoked: z.literal(false) }).strict();
const reconcileSchema = z.object({ kind: z.literal("document-close-reconciliation"), profile: z.literal(DOCUMENT_CLOSE_PROFILE), planSha256: z.string(), tabId: z.string(),
  targetOpenNow: z.boolean(), coherentObservations: z.literal(2), activeContextUnchanged: z.literal(true),
  closeInvoked: z.literal(false), saveInvoked: z.literal(false), openInvoked: z.literal(false), activationInvoked: z.literal(false) }).strict();
function validateResultIdentity(result: { planSha256: string; tabId: string }, plan: DocumentClosePlan): void {
  if (result.planSha256 !== sha256Json(plan) || result.tabId !== plan.target.tabId) { throw new Error("Clean-close observation differs from its exact retained plan."); }
}
export function validateDocumentCloseResult(input: unknown, planInput: DocumentClosePlan): z.infer<typeof resultSchema> {
  const plan = validatePlan(planInput), result = resultSchema.parse(input); validateResultIdentity(result, plan); return result;
}
export function validateDocumentCloseReconciliation(input: unknown, planInput: DocumentClosePlan): z.infer<typeof reconcileSchema> {
  const plan = validatePlan(planInput), result = reconcileSchema.parse(input); validateResultIdentity(result, plan); return result;
}

const stages = ["host", "before-state", "dispatch-state", "close", "terminal-removal", "after-state", "reconciliation"] as const;
export function documentCloseFailureCategory(message: unknown): string | null {
  for (const stage of stages) { if (message === `Clean document close refused at ${stage}`) { return `native-document-close:${stage}`; } }
  return null;
}

/** Shared fixed observer. UI.tabBar is the pinned synchronous dirty/ownership
 * reader. No await separates the final native recheck from the one close call.
 * Exactly two project tabs avoid implicit active-tab or split-layout changes.
 */
function observer(plan: DocumentClosePlan): string {
  return `const PLAN=${JSON.stringify(plan)},planSha256=${JSON.stringify(sha256Json(plan))};
${DEVICE_NATIVE_HOST_GUARD}
const localUI=globalThis.UI,outerUI=globalThis.top?.UI;if(localUI!=null&&outerUI!=null&&localUI!==outerUI)throw new Error('AMBIGUOUS_UI');
const tabs=(localUI??outerUI)?.tabBar,timers=globalThis.window?.top,project=eda.dmt_Project,select=eda.dmt_SelectControl;
if(typeof tabs?.getFilterTabs!=='function'||typeof tabs.getActiveTab!=='function'||typeof tabs.hasTabUnSaved!=='function'||typeof tabs.isTabUnSaved!=='function'||typeof tabs.getTabContainer!=='function'||typeof timers?.document?.getElementById!=='function'||typeof timers.setTimeout!=='function'||typeof timers.clearTimeout!=='function'||typeof project?.getCurrentProjectInfo!=='function'||typeof select?.getCurrentDocumentInfo!=='function')throw new Error('APIS');
const fail=()=>{throw new Error('STATE');},record=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
${NATIVE_PROJECT_PLACEHOLDER_PREDICATE}
const identity=(value,key,alias)=>{if(!record(value))fail();if(value[key]!==undefined&&value[alias]!==undefined&&value[key]!==value[alias])fail();return value[key]??value[alias];};
let activeFrame,targetFrame,targetDoc,containerId,startPresent,placeholderPresent;
const frame=scope=>{const value=timers.document.getElementById('frame_'+scope.tabId);
if(!value||value.isConnected!==true||value.tagName!==(scope.documentType===2?'DIV':'IFRAME')||value.getAttribute('c_dbid')!==scope.tabId||value.getAttribute('c_doctype')!==String(scope.documentType))fail();return value;};
const symbolManager=()=>{const local=globalThis.SCH,outer=globalThis.top?.SCH;if(local!=null&&outer!=null&&local!==outer)fail();
const manager=(local??outer)?.docMemoryManager;if(typeof manager?.get!=='function')fail();return manager;};
const inspectSymbol=present=>{if(PLAN.target.documentType!==2)return;
const doc=symbolManager().get(PLAN.target.uuid);
if(!present){if(doc!==null||targetDoc&&targetDoc.canvas!==null)fail();return;}
if(!doc||doc.uuid!==PLAN.target.uuid||doc.tabId!==PLAN.target.tabId||doc.docType!==2||doc.path!==PLAN.projectUuid||doc.project_uuid!==PLAN.projectUuid||doc.projectMgr?.uuid!==PLAN.projectUuid||doc.schematicUuid!==undefined||typeof doc.isSymbolDoc!=='function'||doc.isSymbolDoc()!==true||!doc.canvas)fail();
if(targetDoc!==undefined&&doc!==targetDoc)fail();targetDoc=doc;};
const state=expected=>{
if(host.currentProject?.projectId!==PLAN.projectUuid||host.currentProject.branchUuid!==PLAN.branchUuid||host.currentProject.isV2Format!==false||host.isHistoryMode!==false||tabs.getActiveTab()!==PLAN.active.tabId||tabs.hasTabUnSaved()!==false||tabs.isTabUnSaved(PLAN.active.tabId)!==false)fail();
const ids=tabs.containerIds;if(!Array.isArray(ids)||ids.length!==1||typeof ids[0]!=='string'||!ids[0]||ids[0].length>256)fail();
if(containerId!==undefined&&containerId!==ids[0])fail();containerId=ids[0];
const tree=tabs.containerTree;if(!record(tree)||tree.id!==containerId||tree.children!==undefined)fail();
const all=tabs.getFilterTabs([]);if(!Array.isArray(all)||all.length<1||all.length>4)fail();
let active=0,target=0,start=0,placeholder=0;const seen=new Set();
for(const tab of all){if(!record(tab)||typeof tab.tabId!=='string'||seen.has(tab.tabId))fail();seen.add(tab.tabId);
if(tab.tabId==='0'){if(++placeholder!==1||!isNativeProjectPlaceholder(tab)||tabs.isTabUnSaved('0')!==false)fail();continue;}
if(tab.tabId==='tab_page1'){if(++start!==1||tab.isAbleDelete!==false||!record(tab.data)||tab.data.doctype!==-1||tab.data.pid!==undefined||tab.data.owner!==undefined||tab.parentProjectUuid!==undefined||tab.parentLibraryUuid!==undefined)fail();continue;}
const scope=tab.tabId===PLAN.active.tabId?PLAN.active:tab.tabId===PLAN.target.tabId?PLAN.target:null;if(!scope)fail();
if(scope===PLAN.active)active++;else target++;
const data=tab.data;if(!record(data)||data.doctype!==scope.documentType||(tab.documentType!==undefined&&tab.documentType!==scope.documentType)||(Object.hasOwn(tab,'isUnSaved')?tab.isUnSaved!==false:tab.isUnSaved!==undefined)||tabs.isTabUnSaved(tab.tabId)!==false||tabs.getTabContainer(tab.tabId)!==containerId||data.isReadOnlyMode===true||data['data-model-sheet-uuid']!==undefined)fail();
if(scope.documentType===3){if(data.pid!==PLAN.projectUuid||tab.parentLibraryUuid!==undefined||(data.owner!==undefined&&data.owner!==PLAN.ownerUuid))fail();}
else if(data.owner!==PLAN.ownerUuid||(data.pid!==undefined&&data.pid!==PLAN.projectUuid)||(tab.parentLibraryUuid!==undefined&&tab.parentLibraryUuid!==PLAN.ownerUuid))fail();
if(tab.parentProjectUuid!==undefined&&tab.parentProjectUuid!==PLAN.projectUuid)fail();}
if(active!==1||target>1||(expected!==undefined&&(target===1)!==expected))fail();
if(startPresent!==undefined&&startPresent!==(start===1))fail();startPresent=start===1;
if(placeholderPresent!==undefined&&placeholderPresent!==(placeholder===1))fail();placeholderPresent=placeholder===1;
const currentActive=frame(PLAN.active);if(activeFrame!==undefined&&activeFrame!==currentActive)fail();activeFrame=currentActive;
const present=target===1;
if(present){const currentTarget=frame(PLAN.target);if(targetFrame!==undefined&&targetFrame!==currentTarget)fail();targetFrame=currentTarget;}
else if(timers.document.getElementById('frame_'+PLAN.target.tabId)!==null||targetFrame&&targetFrame.isConnected!==false)fail();
inspectSymbol(present);return present;};
const context=async()=>{const p=await project.getCurrentProjectInfo();if(identity(p,'uuid','projectUuid')!==PLAN.projectUuid)fail();
const d=await select.getCurrentDocumentInfo();if(identity(d,'uuid','documentUuid')!==PLAN.active.uuid||d.documentType!==PLAN.active.documentType||d.tabId!==PLAN.active.tabId)fail();
if(PLAN.active.documentType===4?d.parentLibraryUuid!==PLAN.ownerUuid||(d.parentProjectUuid!==undefined&&d.parentProjectUuid!==PLAN.projectUuid):d.parentProjectUuid!==PLAN.projectUuid||d.parentLibraryUuid!==undefined)fail();};
let deadline,pollTimer,rejectDeadline;const expired=new Promise((resolve,reject)=>{rejectDeadline=reject;});expired.catch(()=>{});
const bounded=value=>Promise.race([value,expired]),pause=()=>bounded(new Promise(resolve=>{pollTimer=timers.setTimeout(()=>{pollTimer=undefined;resolve();},50);}));
const startDeadline=()=>{deadline=timers.setTimeout(()=>rejectDeadline(new Error('DEADLINE')),15000);};
const clear=()=>{if(deadline!==undefined)timers.clearTimeout(deadline);if(pollTimer!==undefined)timers.clearTimeout(pollTimer);};
const observe=async(expected)=>{await bounded(context());const present=state(expected);const opened=(await bounded(bus.rpcCall('isOpenTab',[PLAN.target.tabId])))?.message;
if(opened!==present)fail();await bounded(context());if(state(expected)!==present)fail();return present;};
const envelope=payload=>{const json=JSON.stringify(payload);return{schema:'easyeda-pro-control.exact-json.v1',utf8Bytes:new TextEncoder().encode(json).byteLength,json};};`;
}

/** Public acknowledgment does not await $b. Its terminal SubTabbarMapRemove
 * follows awaited pcb/closePcbPage, tab/frame removal and getTabInfo cleanup.
 * No Save, activation, reopen, repeated close or rollback is performed.
 */
export function buildDocumentCloseExpression(input: DocumentClosePlan): string {
  const plan = validatePlan(input);
  return `(async()=>{let stage='host',dispatched=false;try{
${observer(plan)}
const editor=eda.dmt_EditorControl;if(typeof editor?.closeDocument!=='function'||typeof bus.subscribe!=='function')fail();
let subscription,eventCount=0,resolveClose;const completion=new Promise(resolve=>{resolveClose=resolve;});
try{startDeadline();stage='before-state';await observe(true);await pause();await observe(true);
if(PLAN.target.documentType===2&&(await bounded(bus.rpcCall('getModelTabId',PLAN.target.tabId)))?.message!==PLAN.target.tabId)fail();
subscription=bus.subscribe('sch/SubTabbarMapRemove',value=>{if(dispatched&&value===PLAN.target.uuid){eventCount++;resolveClose();}});
if(typeof subscription?.cancel!=='function')fail();
stage='dispatch-state';await bounded(context());state(true);
stage='close';dispatched=true;const acknowledgment=await bounded(editor.closeDocument(PLAN.target.tabId));if(acknowledgment!==true)fail();
stage='terminal-removal';await bounded(completion);if(eventCount!==1)fail();
stage='after-state';await observe(false);await pause();await observe(false);if(eventCount!==1)fail();
return envelope({kind:'document-close',profile:PLAN.profile,planSha256,tabId:PLAN.target.tabId,acknowledgment,closeCalls:1,terminalNotifications:1,coherentObservations:2,activeContextUnchanged:true,targetOpenNow:false,targetFrameRemoved:true,saveInvoked:false,openInvoked:false,activationInvoked:false});
}finally{clear();if(typeof subscription?.cancel==='function')subscription.cancel();}
}catch(_){if(dispatched)throw new Error('NATIVE_LIFECYCLE_CLOSE_UNSETTLED');throw new Error('Clean document close refused at '+stage);}})()`;
}

/** Read-only recovery observes either the original still-loaded target or its
 * absence. Both outcomes consume the original attempt; neither permits replay.
 * Caller must rederive the retained plan and prove active source/full database.
 */
export function buildDocumentCloseReconciliationExpression(input: DocumentClosePlan): string {
  const plan = validatePlan(input);
  return `(async()=>{let stage='host';try{
${observer(plan)}
try{startDeadline();stage='reconciliation';const present=await observe(undefined);await pause();if(await observe(present)!==present)fail();
return envelope({kind:'document-close-reconciliation',profile:PLAN.profile,planSha256,tabId:PLAN.target.tabId,targetOpenNow:present,coherentObservations:2,activeContextUnchanged:true,closeInvoked:false,saveInvoked:false,openInvoked:false,activationInvoked:false});
}finally{clear();}
}catch(_){throw new Error('Clean document close refused at '+stage);}})()`;
}
