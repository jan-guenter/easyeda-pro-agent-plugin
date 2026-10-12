import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { libraryOperationSchema } from "./library-operations.ts";
import { libraryProjectRecordsHash } from "./library-persistence-proof.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "./native-history.ts";
import { DEVICE_NATIVE_HOST_GUARD } from "./device-runtime-guard.ts";
import { buildActorBoundEditorTargetAbsentExpression, buildEditorTargetAbsentExpression } from "./editor-tabs.ts";
import { NATIVE_PROJECT_PLACEHOLDER_PREDICATE } from "./native-editor-tab-guards.ts";
import { METADATA_NATIVE_DIAGNOSTIC_CATCH, SYMBOL_ACTOR_NATIVE_DIAGNOSTIC_CATCH } from "./metadata-native-diagnostics.ts";
import type { ExpectedContext } from "./engine.ts";
// oxlint-disable-next-line import/max-dependencies -- Reuse the reviewed actor capture and validator instead of duplicating identity guards in this writer.
import { SYMBOL_DUAL_ACTOR_CAPTURE_SOURCE, validateActorProjection } from "./symbol-dual-actor.ts";
import type { ActorProjection } from "./symbol-dual-actor.ts";
import { SYMBOL_WORKER_FINAL_READ_SOURCE, SYMBOL_WORKER_GUARD_SOURCE, SYMBOL_WORKER_NATIVE_DIAGNOSTIC_CATCH, validateWorkerExpectation } from "./symbol-worker-guard.ts";
import type { SymbolWorkerExpectation } from "./symbol-worker-guard.ts";

/** Fixed project-local adapter. Connected and reopened validation are separate
 * from this compiler and its complete-project effect comparison.
 */
export const PROJECT_SYMBOL_METADATA_PROFILE = "easyeda-pro-control.project-symbol-metadata.v1";
const boundedId = z.string().min(1).max(256);
const planSchema = z.object({
  profile: z.literal(PROJECT_SYMBOL_METADATA_PROFILE),
  projectUuid: boundedId,
  branchUuid: boundedId,
  ownerUuid: boundedId,
  targetUuid: boundedId,
  beforeProjectSha256: z.string().regex(/^[a-f0-9]{64}$/u),
  beforeTitle: z.string().min(1).max(512),
  beforeDescription: z.string().max(65_536),
  beforeTags: z.array(z.string().max(512)).max(256),
  beforeSource: z.string().max(4096),
  peerTitles: z.array(z.string().min(1).max(512)).max(4096),
  desiredTitle: z.string().min(1).max(512),
  desiredDescription: z.string().max(65_536),
  headerEditVersion: z.string().min(1).max(128).nullable(),
}).strict().refine((plan) => Buffer.byteLength(`${JSON.stringify(plan)}\n`, "utf8") <= 2_097_152,
  "Symbol preparation exceeds the retained recovery artifact byte limit.");
export type ProjectSymbolMetadataPlan = z.infer<typeof planSchema>;
const symbolMetaSchema = z.object({ title: z.string().min(1).max(512), description: z.string().max(65_536), docType: z.literal(2),
  tags: z.array(z.string().max(512)).max(256), source: z.string().max(4096) }).strict();
const symbolHeaderSchema = z.object({ uuid: boundedId, docType: z.literal("SYMBOL"), client: z.string().regex(/^[a-f0-9]{16}$/u),
  updateTime: z.number().int().nonnegative(), version: z.string().min(1), editVersion: z.string().min(1).max(128).optional(),
  user: z.record(z.string(), z.unknown()).optional() }).strict();

export function projectSymbolMetadataOperation(input: unknown): Extract<ReturnType<typeof libraryOperationSchema.parse>, { action: "library.symbol.modify" }> {
  const operation = libraryOperationSchema.parse(input);
  if (operation.action !== "library.symbol.modify" || !("uuid" in operation.target)) {
    throw new Error("Symbol metadata editing requires one exact existing symbol identity.");
  }
  if (operation.patch.classification !== undefined || operation.patch.description === null) {
    throw new Error("Symbol metadata editing accepts name and non-null description only; native classification/null behavior is not an exact patch.");
  }
  return operation;
}

function symbol(history: NativeHistorySnapshot, uuid: string): NativeDocumentSnapshot {
  const entries = history.documents.filter((entry) => entry.uuid === uuid);
  const result = entries[0];
  if (entries.length !== 1 || result?.docType !== "SYMBOL" || isNativeDocumentDeleted(result)) {
    throw new Error("Symbol target must be one active SYMBOL in the complete project checkpoint.");
  }
  return result;
}
function metadata(document: NativeDocumentSnapshot): Record<string, unknown> {
  const entries = document.records.filter((entry) => entry.id === "META" || entry.type === "META");
  const result = entries[0];
  if (entries.length !== 1 || result?.id !== "META" || result.type !== "META") { throw new Error("Symbol requires one exact META record."); }
  return result.body;
}
function projectIdentity(history: NativeHistorySnapshot, plan: ProjectSymbolMetadataPlan): void {
  if (history.projectUuid !== plan.projectUuid || history.projectOwnerUuid !== plan.ownerUuid || history.branchUuid !== plan.branchUuid) {
    throw new Error("Symbol project, branch or owner differs from its prepared plan.");
  }
}
function normalizedTitle(value: string): string { return value.trim().toLowerCase(); }

export function prepareProjectSymbolMetadata(input: unknown, history: NativeHistorySnapshot): ProjectSymbolMetadataPlan {
  const operation = projectSymbolMetadataOperation(input);
  if (!("uuid" in operation.target) || operation.libraryUuid !== history.projectUuid || history.projectOwnerUuid === undefined || history.projectOwnerUuid.length === 0) {
    throw new Error("Symbol metadata editing requires an exact current-project symbol and owner.");
  }
  const target = symbol(history, operation.target.uuid);
  const before = metadata(target);
  if (before["docType"] !== 2 || typeof before["title"] !== "string" || typeof before["description"] !== "string") {
    throw new Error("Symbol metadata editing requires ordinary META.docType 2 with stored title and description.");
  }
  // The cN.metaData serializer emits only these five fields. The fixed writer
  // Retains source/custom_tags from its existing project-local native object.
  const meta = symbolMetaSchema.parse(before);
  const header = symbolHeaderSchema.parse(target.metadata);
  if (header.uuid !== target.uuid) { throw new Error("Symbol DOCHEAD identity differs from its checkpoint member."); }
  const desiredTitle = operation.patch.name ?? before["title"];
  if (normalizedTitle(desiredTitle).length === 0) { throw new Error("Symbol metadata requires a nonblank display title."); }
  const peerTitles: string[] = [];
  for (const document of history.documents) {
    if (document.docType === "SYMBOL" && document.uuid !== target.uuid && !isNativeDocumentDeleted(document)) {
      const title = metadata(document)["title"];
      if (typeof title !== "string") { throw new TypeError("Peer symbol title is missing from duplicate-name proof."); }
      peerTitles.push(title);
      if (normalizedTitle(title) === normalizedTitle(desiredTitle)) { throw new Error("A project symbol with that normalized name already exists."); }
    }
  }
  return planSchema.parse({ profile: PROJECT_SYMBOL_METADATA_PROFILE, projectUuid: history.projectUuid, branchUuid: history.branchUuid,
    ownerUuid: history.projectOwnerUuid, targetUuid: target.uuid, beforeProjectSha256: libraryProjectRecordsHash(history),
    beforeTitle: before["title"], beforeDescription: before["description"], desiredTitle, desiredDescription: operation.patch.description ?? before["description"],
    beforeTags: meta.tags, beforeSource: meta.source, peerTitles, headerEditVersion: header.editVersion ?? null });
}

/** The public modifier chooses project versus cloud routing after an awaited
 * metadata read. Bind its project-qualified worker metadata writer instead.
 * No caller-selectable method path or cloud/library routing exists here.
 * Keep the native canAddLib check and independently refuse readonly/history
 * contexts; canAddLib alone permits import/paste/document/library capability.
 */
export function buildProjectSymbolMetadataExpression(input: ProjectSymbolMetadataPlan, context: ExpectedContext): string {
  return compileProjectSymbolMetadataExpression(input, context);
}

/** Internal fixed compiler only. Expected actor data does not establish its
 * producer or grant dispatch; the closed-session coordinator must own both.
 */
export function buildActorBoundProjectSymbolMetadataExpression(input: ProjectSymbolMetadataPlan, context: ExpectedContext, expectedActor: unknown): string {
  return compileProjectSymbolMetadataExpression(input, context, validateActorProjection(expectedActor));
}

/** Internal fixed variant. Caller-supplied expectations are data, not authority. */
export function buildWorkerBoundProjectSymbolMetadataExpression(input: ProjectSymbolMetadataPlan, context: ExpectedContext, expectedActor: unknown, expectedWorker: unknown): string {
  const actor = validateActorProjection(expectedActor);
  const plan = planSchema.parse(input);
  if (![plan.branchUuid, plan.ownerUuid, plan.targetUuid].every((value) => /^[a-f0-9]{32}$/u.test(value))) { throw new Error("SYMBOL_WORKER_INPUT"); }
  const active = { uuid: context.document.uuid ?? context.document.documentUuid ?? "", documentType: context.document.documentType, tabId: context.document.tabId ?? "" };
  const worker = validateWorkerExpectation(expectedWorker, plan.projectUuid, active, plan.targetUuid);
  return compileProjectSymbolMetadataExpression(plan, context, actor, worker);
}

function compileProjectSymbolMetadataExpression(input: ProjectSymbolMetadataPlan, context: ExpectedContext, actor?: ActorProjection, worker?: SymbolWorkerExpectation): string {
  const plan = planSchema.parse(input);
  if ((context.project.uuid ?? context.project.projectUuid) !== plan.projectUuid ||
      (context.project.uuid !== undefined && context.project.projectUuid !== undefined && context.project.uuid !== context.project.projectUuid) ||
      (context.document.uuid !== undefined && context.document.documentUuid !== undefined && context.document.uuid !== context.document.documentUuid)) {
    throw new Error("Symbol closed-target context differs from its exact project/document identity.");
  }
  const active = { uuid: context.document.uuid ?? context.document.documentUuid ?? "", documentType: context.document.documentType, tabId: context.document.tabId ?? "" };
  const ownership = { parentProjectUuid: context.document["parentProjectUuid"], parentLibraryUuid: context.document["parentLibraryUuid"] };
  if ((ownership.parentProjectUuid !== undefined && ownership.parentProjectUuid !== plan.projectUuid) ||
      (ownership.parentLibraryUuid !== undefined && (![2, 4].includes(active.documentType) || ownership.parentLibraryUuid !== plan.ownerUuid))) {
    throw new Error("Symbol closed-target context has contradictory active-document ownership.");
  }
  const targetClosed = (actor === undefined ? buildEditorTargetAbsentExpression : buildActorBoundEditorTargetAbsentExpression)({ targetUuid: plan.targetUuid, projectUuid: plan.projectUuid, ownerUuid: plan.ownerUuid, active });
  const actorSetup = actor === undefined ? "" : `
const expectedActor=${JSON.stringify(actor)},actorRoot=globalThis;
const bad=()=>{throw new Error('ACTOR_DRIFT');};
const own=(owner,key)=>{
 if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad();
 const field=Object.getOwnPropertyDescriptor(owner,key);if(!field||!Object.hasOwn(field,'value'))bad();return field.value;
};
if(actorRoot.top!==actorRoot||actorRoot.window!==actorRoot||own(actorRoot,'gVars')!==host)bad();
const actorLocation=actorRoot.location,actorHref=actorLocation?.href,actorDocument=actorRoot.document,actorMode=own(actorRoot,'PRO_EDITOR_MODE');
if(typeof actorHref!=='string'||!new RegExp(${JSON.stringify(String.raw`^https://client/editor\?cll=(?:trace|debug|info|warn|error)#?$`)}).test(actorHref)||actorLocation.origin!=='https://client'||!actorDocument||actorDocument.defaultView!==actorRoot||actorDocument.nodeType!==9||actorDocument.URL!==actorHref)bad();
if(actorMode!=='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'&&actorMode!=='CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM')bad();
${SYMBOL_DUAL_ACTOR_CAPTURE_SOURCE}
if(!actorEqual(startupActorProjection,expectedActor)||!actorEqual(cachedActorProjection,expectedActor))bad();
const actorGuard=()=>{
 if(actorRoot.top!==actorRoot||actorRoot.window!==actorRoot||own(actorRoot,'gVars')!==host||actorRoot.location!==actorLocation||actorLocation.href!==actorHref||actorLocation.origin!=='https://client'||actorRoot.document!==actorDocument||actorDocument.defaultView!==actorRoot||actorDocument.nodeType!==9||actorDocument.URL!==actorHref||own(actorRoot,'PRO_EDITOR_MODE')!==actorMode)bad();
 checkDualActor();
};
const actorAwait=async(call)=>{${worker === undefined ? "actorGuard()" : "workerGuard()"};try{return await call();}finally{${worker === undefined ? "actorGuard()" : "workerGuard()"};}};
actorGuard();
`;
  const actorCall = (call: string): string => actor === undefined ? call : `actorAwait(()=>${call})`;
  const busCall = (topic: string, args: string): string => `${worker === undefined ? "bus.rpcCall" : "workerRpc"}('${topic}',${args})`;
  let finalGuard = actor === undefined ? "" : "actorGuard();\n";
  let diagnostic = actor === undefined ? METADATA_NATIVE_DIAGNOSTIC_CATCH : SYMBOL_ACTOR_NATIVE_DIAGNOSTIC_CATCH;
  if (worker !== undefined) { finalGuard = "workerGuard();\n"; diagnostic = SYMBOL_WORKER_NATIVE_DIAGNOSTIC_CATCH; }
  return `(async()=>{let stage='host';try{
const PLAN=${JSON.stringify(plan)},ACTIVE=${JSON.stringify(active)},OWNERSHIP=${JSON.stringify(ownership)};
${DEVICE_NATIVE_HOST_GUARD}
${NATIVE_PROJECT_PLACEHOLDER_PREDICATE}${actorSetup}
const localUI=globalThis.UI,outerUI=globalThis.top?.UI;
if(localUI!=null&&outerUI!=null&&localUI!==outerUI)throw new Error('UI_AMBIGUOUS');
const ui=localUI??outerUI,permission=ui?.concurrentDesign,tabs=ui?.tabBar;
if(typeof tabs?.getFilterTabs!=='function'||typeof tabs.getActiveTab!=='function'||typeof tabs.hasTabUnSaved!=='function'||typeof tabs.isTabUnSaved!=='function')throw new Error('TAB_STATE_MISSING');
${worker === undefined ? "" : `const WORKER=${JSON.stringify(worker)};${SYMBOL_WORKER_GUARD_SOURCE}`}const assertWritable=()=>{
if(PLAN.peerTitles.some(value=>value.toLocaleLowerCase()===PLAN.desiredTitle.toLocaleLowerCase()))throw new Error('LOCALE_DUPLICATE_TITLE');
const localVersion=globalThis.PRO_EDITOR_VERSION,outerVersion=globalThis.top?.PRO_EDITOR_VERSION;
if(localVersion!==undefined&&outerVersion!==undefined&&localVersion!==outerVersion)throw new Error('EDITOR_VERSION_AMBIGUOUS');
if((localVersion??outerVersion)!==(PLAN.headerEditVersion===null?undefined:PLAN.headerEditVersion))throw new Error('EDITOR_VERSION_DRIFT');
if(host.currentProject?.projectId!==PLAN.projectUuid)throw new Error('PROJECT_DRIFT');
if(host.currentProject.branchUuid!==PLAN.branchUuid)throw new Error('BRANCH_DRIFT');
if(host.currentProject.isV2Format!==false)throw new Error('PROJECT_FORMAT_UNSUPPORTED');
if(host.isHistoryMode!==false)throw new Error('HISTORY_MODE');
if(permission?.isConcurrentStrictMode!==false)throw new Error('CONCURRENT_MODE');
if(typeof permission.getIframeDisableStatusPanelPcb!=='function')throw new Error('PERMISSION_API_MISSING');
if(permission.getIframeDisableStatusPanelPcb(ACTIVE.tabId)?.disable!==false)throw new Error('READ_ONLY');
if(tabs.getActiveTab()!==ACTIVE.tabId)throw new Error('ACTIVE_TAB_DRIFT');
if(tabs.hasTabUnSaved()!==false)throw new Error('DIRTY_TABS');
const all=tabs.getFilterTabs([]),seen=new Set();let activeCount=0,startCount=0,placeholderCount=0;
if(!Array.isArray(all)||all.length<1||all.length>257)throw new Error('TAB_SCOPE');
for(const tab of all){
if(!tab||typeof tab!=='object'||Array.isArray(tab)||typeof tab.tabId!=='string'||!tab.tabId||tab.tabId.length>512||/[\\x00-\\x1f]/.test(tab.tabId)||seen.has(tab.tabId)||!tab.data||typeof tab.data!=='object'||Array.isArray(tab.data))throw new Error('TAB_SCOPE');seen.add(tab.tabId);
if(tab.tabId==='tab_page1'){if(++startCount!==1||tab.isAbleDelete!==false||tab.data?.doctype!==-1||tab.data?.pid!==undefined||tab.data?.owner!==undefined||tab.parentProjectUuid!==undefined||tab.parentLibraryUuid!==undefined)throw new Error('START_TAB');continue;}
if(tab.tabId==='0'){if(++placeholderCount!==1||!isNativeProjectPlaceholder(tab)||tabs.isTabUnSaved(tab.tabId)!==false)throw new Error('PROJECT_PLACEHOLDER');continue;}
const type=tab.data?.doctype,id=tab.tabId.split('@')[0],library=[2,4].includes(type);
if(![1,2,3,4].includes(type)||!id||id===PLAN.targetUuid||tab.tabId!==id+'@'+PLAN.projectUuid||(library?tab.data?.pid!==undefined&&tab.data.pid!==PLAN.projectUuid:tab.data?.pid!==PLAN.projectUuid)||
(tab.parentProjectUuid!==undefined&&tab.parentProjectUuid!==PLAN.projectUuid)||(tab.documentType!==undefined&&tab.documentType!==type)||
(library?tab.data.owner!==PLAN.ownerUuid||(tab.parentLibraryUuid!==undefined&&tab.parentLibraryUuid!==PLAN.ownerUuid):tab.parentLibraryUuid!==undefined||(tab.data.owner!==undefined&&tab.data.owner!==PLAN.ownerUuid))||
(Object.hasOwn(tab,'isUnSaved')?tab.isUnSaved!==false:tab.isUnSaved!==undefined)||tabs.isTabUnSaved(tab.tabId)!==false)throw new Error('TAB_SCOPE');
if(tab.tabId===ACTIVE.tabId){if(id!==ACTIVE.uuid||type!==ACTIVE.documentType)throw new Error('ACTIVE_TAB');activeCount+=1;}
}if(all.length-placeholderCount>256)throw new Error('TAB_SCOPE');if(activeCount!==1)throw new Error('ACTIVE_TAB');
};
const assertContext=async()=>{
const project=await ${actorCall("eda.dmt_Project.getCurrentProjectInfo()")};
const document=await ${actorCall("eda.dmt_SelectControl.getCurrentDocumentInfo()")};
if((project?.uuid??project?.projectUuid)!==PLAN.projectUuid||(project.uuid!==undefined&&project.projectUuid!==undefined&&project.uuid!==project.projectUuid)||host.currentProject?.projectId!==PLAN.projectUuid)throw new Error('PROJECT_DRIFT');
if((document?.uuid??document?.documentUuid)!==ACTIVE.uuid||(document.uuid!==undefined&&document.documentUuid!==undefined&&document.uuid!==document.documentUuid)||document.documentType!==ACTIVE.documentType||document.tabId!==ACTIVE.tabId)throw new Error('ACTIVE_DOCUMENT_DRIFT');
if((document.parentProjectUuid!==undefined&&document.parentProjectUuid!==PLAN.projectUuid)||(document.parentLibraryUuid!==undefined&&(![2,4].includes(ACTIVE.documentType)||document.parentLibraryUuid!==PLAN.ownerUuid))||(OWNERSHIP.parentProjectUuid!==undefined&&document.parentProjectUuid!==OWNERSHIP.parentProjectUuid)||(OWNERSHIP.parentLibraryUuid!==undefined&&document.parentLibraryUuid!==OWNERSHIP.parentLibraryUuid))throw new Error('ACTIVE_DOCUMENT_OWNER_DRIFT');
assertWritable();
};
await ${actorCall("assertContext()")};
stage='permission';
const permissionResult=(await ${actorCall(busCall("canAddLib", "[PLAN.projectUuid]"))}).message;
await ${actorCall("assertContext()")};
if(permissionResult?.hasPermission!==true)throw new Error('PROJECT_PERMISSION');
const projectState=(await ${actorCall(busCall("/PrjDB/project/getData", "[PLAN.projectUuid]"))}).message;
await ${actorCall("assertContext()")};
if(projectState?.uuid!==PLAN.projectUuid||projectState.owner?.uuid!==PLAN.ownerUuid||projectState.currentBranch!==PLAN.branchUuid||projectState.isV2Format!==false||projectState.archive||projectState.store||projectState.cbb_project)throw new Error('PROJECT_METADATA');
stage='before-read';
const before=(await ${actorCall(busCall("/PrjDB/symbol/getData", "[PLAN.targetUuid,PLAN.projectUuid]"))}).message;
await ${actorCall("assertContext()")};
if(before?.uuid!==PLAN.targetUuid||before?.project_uuid!==PLAN.projectUuid||before?.owner?.uuid!==PLAN.ownerUuid||before?.docType!==2||before?.display_title!==PLAN.beforeTitle||before?.description!==PLAN.beforeDescription||before?.source!==PLAN.beforeSource||before?.custom_tags!==JSON.stringify(PLAN.beforeTags))throw new Error('SYMBOL_METADATA_DRIFT');
stage='target-closed';
await ${targetClosed};
await ${actorCall("assertContext()")};
assertWritable();
${worker === undefined ? "" : SYMBOL_WORKER_FINAL_READ_SOURCE}stage='modify';
const result=(await ${actorCall(busCall("/PrjDB/symbol/updateData", "[{uuid:PLAN.targetUuid,title:PLAN.desiredTitle,description:PLAN.desiredDescription},PLAN.projectUuid]"))}).message;
if(result?.uuid!==PLAN.targetUuid||result.project_uuid!==PLAN.projectUuid||result.owner?.uuid!==PLAN.ownerUuid||result.docType!==2||result.display_title!==PLAN.desiredTitle||result.description!==PLAN.desiredDescription||result.source!==PLAN.beforeSource||result.custom_tags!==JSON.stringify(PLAN.beforeTags))throw new Error('ACK_INVALID');
stage='after-read';
await ${actorCall("assertContext()")};
const after=(await ${actorCall(busCall("/PrjDB/symbol/getData", "[PLAN.targetUuid,PLAN.projectUuid]"))}).message;
await ${actorCall("assertContext()")};
if(after?.uuid!==PLAN.targetUuid||after?.project_uuid!==PLAN.projectUuid||after?.owner?.uuid!==PLAN.ownerUuid||after?.docType!==2||after?.display_title!==PLAN.desiredTitle||after?.description!==PLAN.desiredDescription||after?.source!==PLAN.beforeSource||after?.custom_tags!==JSON.stringify(PLAN.beforeTags))throw new Error('SYMBOL_METADATA_DRIFT');
${finalGuard}const payload={kind:'project-symbol-metadata',targetId:PLAN.targetUuid,createdId:null};
const json=JSON.stringify(payload);return {schema:'easyeda-pro-control.exact-json.v1',utf8Bytes:new TextEncoder().encode(json).byteLength,json};
}catch(error){${diagnostic}throw new Error('Symbol metadata operation refused at '+stage+':'+code);}})()`;
}

function recordProjection(document: NativeDocumentSnapshot): unknown {
  return { uuid: document.uuid, docType: document.docType, metadata: document.metadata,
    records: document.records.map(({ id, type, body }) => ({ id, type, body })) };
}
function verifyHeader(before: Record<string, unknown>, after: Record<string, unknown>): void {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const changed = [...keys].filter((key) => canonicalJson({ value: before[key] }) !== canonicalJson({ value: after[key] }) || Object.hasOwn(before, key) !== Object.hasOwn(after, key));
  const time = after["updateTime"];
  // The vi constructor captures undefined user before subscribe initializes login.
  // The gg.updateString serializer omits user; no actor insertion/replacement passes.
  if (changed.some((key) => !["client", "updateTime", "version", "user"].includes(key)) || Object.hasOwn(after, "user") || typeof after["client"] !== "string" || !/^[a-f0-9]{16}$/u.test(after["client"]) || typeof time !== "number" || !Number.isSafeInteger(time) || time < 0 || after["version"] !== String(time) || (typeof before["updateTime"] === "number" && time < before["updateTime"])) {
    throw new Error("Symbol header changed outside the reviewed metadata edit fields.");
  }
}

export function verifyProjectSymbolMetadataEffect(input: ProjectSymbolMetadataPlan, before: NativeHistorySnapshot, after: NativeHistorySnapshot): Record<string, unknown> {
  const plan = planSchema.parse(input);
  projectIdentity(before, plan); projectIdentity(after, plan);
  if (libraryProjectRecordsHash(before) !== plan.beforeProjectSha256) { throw new Error("Symbol baseline differs from the prepared complete-project checkpoint."); }
  const expectedPlan = prepareProjectSymbolMetadata({ id: "verify-symbol-metadata", action: "library.symbol.modify", libraryUuid: plan.projectUuid,
    target: { uuid: plan.targetUuid }, patch: { name: plan.desiredTitle, description: plan.desiredDescription } }, before);
  if (canonicalJson(plan) !== canonicalJson(expectedPlan)) { throw new Error("Symbol plan differs from its original checkpoint preparation."); }
  const changed = symbol(after, plan.targetUuid), old = symbol(before, plan.targetUuid);
  const oldMeta = metadata(old);
  if (oldMeta["title"] !== plan.beforeTitle || oldMeta["description"] !== plan.beforeDescription || oldMeta["docType"] !== 2) { throw new Error("Symbol plan differs from checkpoint metadata."); }
  const peers = (history: NativeHistorySnapshot): unknown[] => history.documents.filter((document) => document.uuid !== plan.targetUuid).map((document) => recordProjection(document));
  if (canonicalJson(peers(before)) !== canonicalJson(peers(after))) { throw new Error("Symbol metadata edit changed unrelated project records."); }
  verifyHeader(old.metadata, changed.metadata);
  const expected = { ...old, metadata: changed.metadata, records: old.records.map((record) => record.id === "META" && record.type === "META" ?
    Object.assign(structuredClone(record), { body: { ...record.body, title: plan.desiredTitle, description: plan.desiredDescription } }) : record) };
  if (canonicalJson(recordProjection(expected)) !== canonicalJson(recordProjection(changed))) { throw new Error("Symbol metadata edit changed geometry, bindings or unrequested metadata."); }
  return { profile: PROJECT_SYMBOL_METADATA_PROFILE, targetId: plan.targetUuid, beforeProjectSha256: plan.beforeProjectSha256,
    afterProjectSha256: libraryProjectRecordsHash(after), documentCount: after.documents.length,
    effectVerified: true, persistenceEvidence: "supplied-history-comparison", reopened: false, adapterKind: "native-task-equivalent",
    currentGenerationLiveValidated: false, saveInvoked: false, editorTitleRefreshVerified: false,
    headerBookkeeping: "generated-client-updateTime-version;existing-user-omitted;other-fields-exact",
    headerUserRemoved: Object.hasOwn(old.metadata, "user"), inverseScope: "requested-title-and-description-only;generated-header-and-removed-user-not-restored" };
}

/** Build data for a new transaction only after proving the complete forward
 * effect. This does not dispatch, restore a checkpoint or reuse a journal.
 * Generated header fields and an omitted DOCHEAD user are not invertible here.
 */
export function projectSymbolMetadataInverse(input: ProjectSymbolMetadataPlan, before: NativeHistorySnapshot,
  after: NativeHistorySnapshot, operationId: string): ReturnType<typeof projectSymbolMetadataOperation> {
  const plan = planSchema.parse(input);
  verifyProjectSymbolMetadataEffect(plan, before, after);
  return projectSymbolMetadataOperation({ id: operationId, action: "library.symbol.modify", libraryUuid: plan.projectUuid,
    target: { uuid: plan.targetUuid }, patch: { name: plan.beforeTitle, description: plan.beforeDescription } });
}
