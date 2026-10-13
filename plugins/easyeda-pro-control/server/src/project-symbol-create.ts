import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import { libraryOperationSchema } from "./library-operations.ts";
import { libraryProjectRecordsHash } from "./library-persistence-proof.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "./native-history.ts";
import type { ExpectedContext } from "./engine.ts";
import { DEVICE_NATIVE_HOST_GUARD } from "./device-runtime-guard.ts";
import { NATIVE_PROJECT_PLACEHOLDER_PREDICATE } from "./native-editor-tab-guards.ts";

export const PROJECT_SYMBOL_CREATE_PROFILE = "easyeda-pro-control.closed-empty-project-symbol-create.v1";
const identifier = z.string().regex(/^[a-zA-Z0-9_-]{1,128}$/u);
const generatedId = z.string().regex(/^[a-f0-9]{16}$/u);
const title = z.string().min(1).max(512).refine((value) => value.trim() === value && !/\p{Cc}/u.test(value));
const description = z.string().max(65_536);
const symbolMetadata = z.object({ title, description, docType: z.number().int(),
  tags: z.array(z.string().max(512)).max(256), source: z.string().max(4096) }).strict();
const peer = symbolMetadata.extend({ uuid: identifier }).strict();
const planSchema = z.object({ profile: z.literal(PROJECT_SYMBOL_CREATE_PROFILE), projectUuid: identifier, ownerUuid: identifier,
  branchUuid: identifier, activeUuid: identifier, activeTabId: z.string().min(1).max(512), activeDocumentType: z.literal(3),
  headerEditVersion: z.string().min(1).max(128).nullable(), name: title, description,
  symbols: z.array(peer).max(4096), baselineDocumentIds: z.array(identifier).min(1).max(100_000),
  beforeProjectSha256: z.string().regex(/^[a-f0-9]{64}$/u),
}).strict().refine((value) => Buffer.byteLength(`${JSON.stringify(value)}\n`, "utf8") <= 2_097_152,
  "Symbol creation plan exceeds its immutable recovery artifact bound.");
export type ProjectSymbolCreatePlan = z.infer<typeof planSchema>;
const ordinarySymbolTypes = new Set([2, 18, 19, 20, 21, 22, 25, 31]);

export function projectSymbolCreateOperation(input: unknown): Extract<ReturnType<typeof libraryOperationSchema.parse>, { action: "library.symbol.create" }> {
  const operation = libraryOperationSchema.parse(input);
  if (operation.action !== "library.symbol.create" || operation.symbolType !== 2 || (operation.classification?.length ?? 0) !== 0) {
    throw new Error("Symbol creation admits only one empty ordinary project symbol without classification.");
  }
  title.parse(operation.name);
  return operation;
}
function metadata(document: NativeDocumentSnapshot): Record<string, unknown> {
  const matches = document.records.filter((record) => record.id === "META" || record.type === "META");
  if (matches.length !== 1 || matches[0]?.id !== "META" || matches[0].type !== "META") { throw new Error("Symbol creation requires exactly one META record."); }
  return matches[0].body;
}
function projection(document: NativeDocumentSnapshot): unknown {
  return { uuid: document.uuid, docType: document.docType, metadata: document.metadata, records: document.records.map(({ id, type, body }) => ({ id, type, body })) };
}
function validateHistory(history: NativeHistorySnapshot): void {
  const ids = new Set<string>();
  if (history.profile !== "easyeda.native-history.linear-gcm-gzip.v1" || history.documents.length === 0) { throw new Error("Symbol creation checkpoint is incomplete."); }
  for (const document of history.documents) {
    identifier.parse(document.uuid);
    if (ids.has(document.uuid) || document.metadata["uuid"] !== document.uuid || document.metadata["docType"] !== document.docType || document.semanticSha256 !== sha256Json(projection(document))) {
      throw new Error("Symbol creation checkpoint document integrity failed.");
    }
    ids.add(document.uuid);
    const symbolType = document.docType === "SYMBOL" ? metadata(document)["docType"] : undefined;
    if (!isNativeDocumentDeleted(document) && (document.docType === "INSTANCE" || (document.docType === "SYMBOL" && (typeof symbolType !== "number" || !ordinarySymbolTypes.has(symbolType))))) {
      throw new Error("Symbol creation excludes hierarchical instances, CBB counterparts and unknown symbol types.");
    }
  }
  if (history.semanticSha256 !== sha256Json(history.documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 })))) {
    throw new Error("Symbol creation complete checkpoint integrity failed.");
  }
}
export function assertProjectSymbolCreateContext(plan: ProjectSymbolCreatePlan, context: ExpectedContext): void {
  if ((context.project.uuid ?? context.project.projectUuid) !== plan.projectUuid ||
    (context.project.uuid !== undefined && context.project.projectUuid !== undefined && context.project.uuid !== context.project.projectUuid) ||
    (context.document.uuid ?? context.document.documentUuid) !== plan.activeUuid ||
    (context.document.uuid !== undefined && context.document.documentUuid !== undefined && context.document.uuid !== context.document.documentUuid) ||
    context.document.documentType !== 3 || context.document.tabId !== plan.activeTabId || plan.activeTabId !== `${plan.activeUuid}@${plan.projectUuid}` ||
    context.document["parentProjectUuid"] !== plan.projectUuid || context.document["parentLibraryUuid"] !== undefined) {
    throw new Error("Symbol creation context differs from its checkpoint-bound active PCB.");
  }
}
export function prepareProjectSymbolCreate(input: unknown, history: NativeHistorySnapshot, context: ExpectedContext): ProjectSymbolCreatePlan {
  const operation = projectSymbolCreateOperation(input);
  validateHistory(history);
  if (operation.libraryUuid !== history.projectUuid) { throw new Error("Symbol creation requires the exact current-project collection."); }
  const active = history.documents.find((entry) => entry.uuid === (context.document.uuid ?? context.document.documentUuid));
  if (active?.docType !== "PCB" || isNativeDocumentDeleted(active) || metadata(active)["source"] !== "") {
    throw new Error("Symbol creation requires an ordinary non-inherited checkpoint-member PCB.");
  }
  const symbols = history.documents.filter((entry) => entry.docType === "SYMBOL" && !isNativeDocumentDeleted(entry))
    .map((entry) => peer.parse({ uuid: entry.uuid, ...symbolMetadata.parse(metadata(entry)) }));
  if (symbols.some((entry) => entry.title.toLowerCase() === operation.name.toLowerCase())) { throw new Error("A project symbol with that normalized name already exists."); }
  const plan = planSchema.parse({ profile: PROJECT_SYMBOL_CREATE_PROFILE, projectUuid: history.projectUuid, ownerUuid: history.projectOwnerUuid,
    branchUuid: history.branchUuid, activeUuid: active.uuid, activeTabId: context.document.tabId, activeDocumentType: 3,
    headerEditVersion: Object.hasOwn(active.metadata, "editVersion") ? active.metadata["editVersion"] : null,
    name: operation.name, description: operation.description ?? "", symbols,
    baselineDocumentIds: history.documents.map((entry) => entry.uuid), beforeProjectSha256: libraryProjectRecordsHash(history) });
  assertProjectSymbolCreateContext(plan, context);
  return plan;
}

/** Pinned gg.create calls buildString, getProLibSource, canvasString and uploadLocal.
 * Explicit local origin plus the empty source identity resolves to getStr("")
 * and no source. Ii("", "") emits DOCHEAD only. Unlike addData, createData does
 * not reject the ordinary empty source. No template, library-worker/cloud read,
 * editor opening, PART initialization or Save is part of this narrow adapter.
 * The pinned canAddLib permission guard can show a native denial dialog, so
 * refused preflight is not claimed to be observational-only.
 */
export function buildProjectSymbolCreateExpression(input: ProjectSymbolCreatePlan, context: ExpectedContext): string {
  const plan = planSchema.parse(input);
  assertProjectSymbolCreateContext(plan, context);
  return `(async()=>{let stage='host';try{
const PLAN=${JSON.stringify(plan)};
${DEVICE_NATIVE_HOST_GUARD}
${NATIVE_PROJECT_PLACEHOLDER_PREDICATE}
const localUI=globalThis.UI,outerUI=globalThis.top?.UI;
if(localUI!=null&&outerUI!=null&&localUI!==outerUI)throw new Error('UI_AMBIGUOUS');
const ui=localUI??outerUI,tabs=ui?.tabBar,permission=ui?.concurrentDesign,editorTop=globalThis.EDITOR_TOP??globalThis;
const extensionManager=editorTop.extendLibManager;
if(typeof tabs?.getFilterTabs!=='function'||typeof tabs.getActiveTab!=='function'||typeof tabs.hasTabUnSaved!=='function'||typeof tabs.isTabUnSaved!=='function')throw new Error('TAB_STATE_MISSING');
const clean=()=>{
const currentLocalHost=globalThis.gVars,currentOuterHost=globalThis.top?.gVars,currentLocalUI=globalThis.UI,currentOuterUI=globalThis.top?.UI;
if((currentLocalHost!=null&&currentOuterHost!=null&&currentLocalHost!==currentOuterHost)||(currentLocalUI!=null&&currentOuterUI!=null&&currentLocalUI!==currentOuterUI)||(currentLocalHost??currentOuterHost)!==host||(currentLocalUI??currentOuterUI)!==ui||(globalThis.EDITOR_TOP??globalThis)!==editorTop||editorTop.gVars!==host||host.messageBus!==bus||ui.tabBar!==tabs||ui.concurrentDesign!==permission)throw new Error('HOST_REPLACED');
if(!extensionManager||editorTop.extendLibManager!==extensionManager||host.extendLibStore?.manager!==extensionManager||typeof extensionManager.hasLib!=='function'||extensionManager.hasLib(PLAN.projectUuid)!==false)throw new Error('EXTENSION_LIBRARY_COLLISION');
const localVersion=globalThis.PRO_EDITOR_VERSION,outerVersion=globalThis.top?.PRO_EDITOR_VERSION;
if(localVersion!==undefined&&outerVersion!==undefined&&localVersion!==outerVersion)throw new Error('EDITOR_VERSION_AMBIGUOUS');
if((localVersion??outerVersion)!==(PLAN.headerEditVersion===null?undefined:PLAN.headerEditVersion))throw new Error('EDITOR_VERSION_DRIFT');
if(host.currentProject?.projectId!==PLAN.projectUuid||host.currentProject.branchUuid!==PLAN.branchUuid||host.currentProject.isV2Format!==false||host.isHistoryMode!==false||tabs.getActiveTab()!==PLAN.activeTabId||tabs.hasTabUnSaved()!==false||tabs.isTabUnSaved(PLAN.activeTabId)!==false)throw new Error('CONTEXT_OR_DIRTY');
if(permission?.isConcurrentStrictMode!==false||typeof permission.getIframeDisableStatusPanelPcb!=='function'||permission.getIframeDisableStatusPanelPcb(PLAN.activeTabId)?.disable!==false)throw new Error('PROJECT_NOT_WRITABLE');
const all=tabs.getFilterTabs([]);if(!Array.isArray(all)||all.length<1||all.length>3)throw new Error('TAB_SCOPE');
let count=0,start=0,placeholder=0;
for(const tab of all){if(!tab||typeof tab!=='object'||Array.isArray(tab)||!tab.data||typeof tab.data!=='object'||Array.isArray(tab.data))throw new Error('TAB_SCOPE');
if(tab.tabId==='0'){if(++placeholder!==1||!isNativeProjectPlaceholder(tab)||tabs.isTabUnSaved('0')!==false)throw new Error('TAB_SCOPE');continue;}
if(tab.tabId==='tab_page1'){if(++start!==1||tab.isAbleDelete!==false||tab.data.doctype!==-1||tab.data.pid!==undefined||tab.data.owner!==undefined||tab.parentProjectUuid!==undefined||tab.parentLibraryUuid!==undefined)throw new Error('START_TAB');continue;}
if(++count!==1||tab.tabId!==PLAN.activeTabId||tab.data.doctype!==3||(tab.documentType!==undefined&&tab.documentType!==3)||tab.data.pid!==PLAN.projectUuid||(tab.parentProjectUuid!==undefined&&tab.parentProjectUuid!==PLAN.projectUuid)||(Object.hasOwn(tab,'isUnSaved')?tab.isUnSaved!==false:tab.isUnSaved!==undefined)||tab.parentLibraryUuid!==undefined||(tab.data.owner!==undefined&&tab.data.owner!==PLAN.ownerUuid))throw new Error('TAB_SCOPE');}
if(count!==1||PLAN.symbols.some(value=>value.title.toLocaleLowerCase()===PLAN.name.toLocaleLowerCase()))throw new Error('TAB_OR_NAME_SCOPE');};
const context=async()=>{const project=await eda.dmt_Project.getCurrentProjectInfo();clean();const document=await eda.dmt_SelectControl.getCurrentDocumentInfo();
if((project?.uuid??project?.projectUuid)!==PLAN.projectUuid||(project.uuid!==undefined&&project.projectUuid!==undefined&&project.uuid!==project.projectUuid)||
(document?.uuid??document?.documentUuid)!==PLAN.activeUuid||(document.uuid!==undefined&&document.documentUuid!==undefined&&document.uuid!==document.documentUuid)||document.documentType!==3||document.tabId!==PLAN.activeTabId||document.parentProjectUuid!==PLAN.projectUuid||document.parentLibraryUuid!==undefined)throw new Error('CONTEXT');clean();};
const exact=(value,expected)=>value?.uuid===expected.uuid&&value.project_uuid===PLAN.projectUuid&&value.path===PLAN.projectUuid&&value.owner?.uuid===PLAN.ownerUuid&&value.docType===expected.docType&&value.display_title===expected.title&&value.description===expected.description&&value.source===expected.source&&value.custom_tags===JSON.stringify(expected.tags);
const read=async()=>{
const project=(await bus.rpcCall('/PrjDB/project/getData',[PLAN.projectUuid])).message;await context();
if(project?.uuid!==PLAN.projectUuid||project.owner?.uuid!==PLAN.ownerUuid||project.currentBranch!==PLAN.branchUuid||project.isV2Format!==false||project.archive||project.store||project.cbb_project)throw new Error('PROJECT_METADATA');
const symbols=(await bus.rpcCall('/PrjDB/symbol/getAllKVDatas',[PLAN.projectUuid])).message;await context();
const expected=PLAN.symbols;
if(!symbols||typeof symbols!=='object'||Array.isArray(symbols)||Object.keys(symbols).length!==expected.length)throw new Error('SYMBOL_MEMBERSHIP');
const found=new Set();for(const [key,symbol]of Object.entries(symbols)){const value=expected.find(item=>item.uuid===symbol?.uuid);
if(!value||key!==symbol.uuid||found.has(symbol.uuid)||!exact(symbol,value))throw new Error('SYMBOL_METADATA');found.add(symbol.uuid);}
const empty=(await bus.rpcCall('/PrjDB/symbol/getStr',['',PLAN.projectUuid])).message;await context();
if(empty!==undefined)throw new Error('EMPTY_SOURCE_IDENTITY');};
await context();stage='before-read';await read();
stage='permission';const allowed=(await bus.rpcCall('canAddLib',[PLAN.projectUuid])).message;await context();
if(allowed?.hasPermission!==true)throw new Error('PROJECT_PERMISSION');
await read();await context();clean();stage='create';
const response=(await bus.rpcCall('/PrjDB/symbol/createData',[{uuid:'',isProject:true,path:PLAN.projectUuid,docType:2,title:PLAN.name,display_title:PLAN.name,description:PLAN.description,custom_tags:'[]',source:''},PLAN.projectUuid])).message;
const created=response?.result;
if(response?.success!==true||!created||typeof created.uuid!=='string'||!/^[a-f0-9]{16}$/.test(created.uuid)||PLAN.baselineDocumentIds.includes(created.uuid)||!exact(created,{uuid:created.uuid,title:PLAN.name,description:PLAN.description,docType:2,tags:[],source:''}))throw new Error('ACK_INVALID');
// Return the validated native identity immediately. The facade seals it before
// Awaiting post-write context, source or complete-checkpoint verification.
const json=JSON.stringify({kind:'project-symbol-create',targetId:created.uuid,createdId:created.uuid});
return{schema:'easyeda-pro-control.exact-json.v1',utf8Bytes:new TextEncoder().encode(json).byteLength,json};
}catch(_){throw new Error('Closed empty symbol creation refused at '+stage);}})()`;
}

export function verifyProjectSymbolCreateEffect(input: ProjectSymbolCreatePlan, before: NativeHistorySnapshot, after: NativeHistorySnapshot, returnedId: unknown): Record<string, unknown> {
  const plan = planSchema.parse(input);
  const originalId = generatedId.parse(returnedId);
  const expected = prepareProjectSymbolCreate({ id: "verify-symbol-create", action: "library.symbol.create", libraryUuid: plan.projectUuid,
    name: plan.name, description: plan.description, symbolType: 2 }, before,
  { project: { uuid: plan.projectUuid, path: "/unused-proof-context" }, document: { uuid: plan.activeUuid, documentType: 3, tabId: plan.activeTabId, parentProjectUuid: plan.projectUuid } });
  if (canonicalJson(plan) !== canonicalJson(expected)) { throw new Error("Symbol creation plan differs from the complete original checkpoint."); }
  validateHistory(after);
  if (after.projectUuid !== plan.projectUuid || after.projectOwnerUuid !== plan.ownerUuid || after.branchUuid !== plan.branchUuid) { throw new Error("Symbol creation project, branch or owner changed."); }
  const baselineIds = new Set(plan.baselineDocumentIds);
  const additions = after.documents.filter((entry) => !baselineIds.has(entry.uuid));
  const created = additions[0];
  if (additions.length !== 1 || created?.uuid !== originalId || created.docType !== "SYMBOL" || isNativeDocumentDeleted(created)) {
    throw new Error("Symbol creation requires exactly one ordinary symbol with its retained native identity.");
  }
  if (canonicalJson(before.documents.map((entry) => projection(entry))) !== canonicalJson(after.documents.filter((entry) => baselineIds.has(entry.uuid)).map((entry) => projection(entry)))) {
    throw new Error("Symbol creation changed pre-existing documents, geometry or membership.");
  }
  const header = z.object({ uuid: z.literal(originalId), docType: z.literal("SYMBOL"), client: generatedId,
    updateTime: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER), version: z.string(), editVersion: z.string().optional() }).strict().parse(created.metadata);
  /* Pinned gg.create emits two DOCHEADs. With no input version, the second
   * canvasString header derives version from its own UI server-time value, not
   * the first header or this facade's clock. This proves final metadata, not raw chronology. */
  if (header.version !== String(header.updateTime) || (header.editVersion ?? null) !== plan.headerEditVersion || created.records.length !== 1 ||
    canonicalJson(metadata(created)) !== canonicalJson({ title: plan.name, description: plan.description, docType: 2, tags: [], source: "" })) {
    throw new Error("Symbol creation changed unreviewed defaults, header, source or canvas records.");
  }
  return { profile: PROJECT_SYMBOL_CREATE_PROFILE, targetId: originalId, createdId: originalId, beforeProjectSha256: plan.beforeProjectSha256,
    afterProjectSha256: libraryProjectRecordsHash(after), documentCount: after.documents.length, identityEvidence: "retained-native-return",
    effectVerified: true, reopened: false, currentGenerationLiveValidated: false, saveInvoked: false, adapterKind: "native-task-equivalent",
    emptySymbol: true, canvasInitialized: false, editorOpened: false, automaticInverseAvailable: false,
    preflightObservationalOnly: false, permissionRefusalMayOpenDialog: true };
}
