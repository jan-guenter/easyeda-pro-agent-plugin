import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import { libraryOperationSchema } from "./library-operations.ts";
import { libraryProjectRecordsHash } from "./library-persistence-proof.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "./native-history.ts";
import type { ExpectedContext } from "./engine.ts";
import { DEVICE_NATIVE_HOST_GUARD } from "./device-runtime-guard.ts";
import { NATIVE_PROJECT_PLACEHOLDER_PREDICATE } from "./native-editor-tab-guards.ts";

export const DOCUMENT_PAGE_CREATE_PROFILE = "easyeda-pro-control.closed-empty-page-create.v1";
const identifier = z.string().regex(/^[a-zA-Z0-9_-]{1,128}$/u);
const generatedId = z.string().regex(/^[a-f0-9]{16}$/u);
const title = z.string().min(1).max(512).refine((value) => value.trim() === value && !/\p{Cc}/u.test(value));
const pageMeta = z.object({ title, schematic: identifier, source: z.literal(""), zIndex: z.number().nullable() }).strict();
const sibling = z.object({ uuid: identifier, title, zIndex: z.number().nullable() }).strict();
const planSchema = z.object({ profile: z.literal(DOCUMENT_PAGE_CREATE_PROFILE), projectUuid: identifier, ownerUuid: identifier,
  branchUuid: identifier, parentUuid: identifier, parentTitle: title, activeUuid: identifier,
  activeTabId: z.string().min(1).max(512), activeDocumentType: z.union([z.literal(1), z.literal(3)]),
  headerEditVersion: z.string().min(1).max(128).nullable(), desiredTitle: title, desiredZIndex: z.number(),
  siblings: z.array(sibling).max(1024), baselineDocumentIds: z.array(identifier).min(1).max(100_000),
  beforeProjectSha256: z.string().regex(/^[a-f0-9]{64}$/u),
}).strict().refine((value) => Buffer.byteLength(`${JSON.stringify(value)}\n`, "utf8") <= 2_097_152,
  "Page creation plan exceeds its immutable recovery artifact bound.");
export type DocumentPageCreatePlan = z.infer<typeof planSchema>;
const ordinarySymbolTypes = new Set([2, 18, 19, 20, 21, 22, 25, 31]);

export function documentPageCreateOperation(input: unknown): Extract<ReturnType<typeof libraryOperationSchema.parse>, { action: "document.page.create" }> {
  const operation = libraryOperationSchema.parse(input);
  if (operation.action !== "document.page.create" || !("uuid" in operation.schematic)) { throw new Error("Page creation requires one exact existing schematic identity."); }
  return operation;
}
function metadata(document: NativeDocumentSnapshot): Record<string, unknown> {
  const matches = document.records.filter((record) => record.id === "META" || record.type === "META");
  if (matches.length !== 1 || matches[0]?.id !== "META" || matches[0].type !== "META") { throw new Error("Page creation requires exactly one META record."); }
  return matches[0].body;
}
function projection(document: NativeDocumentSnapshot): unknown {
  return { uuid: document.uuid, docType: document.docType, metadata: document.metadata, records: document.records.map(({ id, type, body }) => ({ id, type, body })) };
}
function validateHistory(history: NativeHistorySnapshot): void {
  const ids = new Set<string>();
  if (history.profile !== "easyeda.native-history.linear-gcm-gzip.v1" || history.documents.length === 0) { throw new Error("Page creation checkpoint is incomplete."); }
  for (const document of history.documents) {
    if (ids.has(document.uuid) || document.metadata["uuid"] !== document.uuid || document.metadata["docType"] !== document.docType || document.semanticSha256 !== sha256Json(projection(document))) {
      throw new Error("Page creation checkpoint document integrity failed.");
    }
    ids.add(document.uuid);
    const symbolType = document.docType === "SYMBOL" ? metadata(document)["docType"] : undefined;
    if (!isNativeDocumentDeleted(document) && (document.docType === "INSTANCE" || (document.docType === "SYMBOL" && (typeof symbolType !== "number" || !ordinarySymbolTypes.has(symbolType))))) {
      throw new Error("Page creation excludes hierarchical instances, CBB counterparts and unknown symbol types.");
    }
  }
  if (history.semanticSha256 !== sha256Json(history.documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 })))) {
    throw new Error("Page creation complete checkpoint integrity failed.");
  }
}
function exactDocument(history: NativeHistorySnapshot, uuid: string, type: string): NativeDocumentSnapshot {
  const document = history.documents.find((entry) => entry.uuid === uuid);
  if (document?.docType !== type || isNativeDocumentDeleted(document)) { throw new Error("Page creation parent or active editor is not an ordinary checkpoint member."); }
  return document;
}
export function assertDocumentPageCreateContext(plan: DocumentPageCreatePlan, context: ExpectedContext): void {
  if ((context.project.uuid ?? context.project.projectUuid) !== plan.projectUuid ||
    (context.project.uuid !== undefined && context.project.projectUuid !== undefined && context.project.uuid !== context.project.projectUuid) ||
    (context.document.uuid ?? context.document.documentUuid) !== plan.activeUuid ||
    (context.document.uuid !== undefined && context.document.documentUuid !== undefined && context.document.uuid !== context.document.documentUuid) ||
    context.document.documentType !== plan.activeDocumentType || context.document.tabId !== plan.activeTabId ||
    plan.activeTabId !== `${plan.activeUuid}@${plan.projectUuid}` ||
    context.document["parentProjectUuid"] !== plan.projectUuid || context.document["parentLibraryUuid"] !== undefined) {
    throw new Error("Page creation context differs from its checkpoint-bound active editor.");
  }
}
function pageNameCounter(value: string): number {
  const suffix = /^P[\s_]*(\d+)$/iu.exec(value)?.[1];
  if (suffix === undefined) { return 0; }
  const number = Number(suffix);
  if (!Number.isSafeInteger(number) || number >= Number.MAX_SAFE_INTEGER) { throw new Error("Native page-name counter is outside the exact integer range."); }
  return number;
}

/** Match the pinned schematic PD/H_e defaults without using its template/open
 * path: P plus the largest /^P[\s_]*(\d+)$/i suffix plus one, and max(1,zIndex)+1.
 * The worker receives those explicit values; no title or source is caller data.
 */
export function prepareDocumentPageCreate(input: unknown, history: NativeHistorySnapshot, context: ExpectedContext): DocumentPageCreatePlan {
  const operation = documentPageCreateOperation(input);
  validateHistory(history);
  if (!("uuid" in operation.schematic)) { throw new Error("Page creation schematic identity is missing."); }
  const parent = exactDocument(history, operation.schematic.uuid, "SCH"), parentMeta = metadata(parent);
  const parentTitle = title.parse(parentMeta["title"]);
  if (parentMeta["source"] !== "" || Object.hasOwn(parentMeta, "blockSymbolUuid")) { throw new Error("Page creation excludes inherited and reuse-block schematics."); }
  const activeType = z.union([z.literal(1), z.literal(3)]).parse(context.document.documentType);
  const active = exactDocument(history, context.document.uuid ?? context.document.documentUuid ?? "", activeType === 1 ? "SCH_PAGE" : "PCB");
  if (activeType === 1 && (metadata(active)["schematic"] !== parent.uuid || (context.schematic?.uuid !== undefined && context.schematic.uuid !== parent.uuid))) {
    throw new Error("An active schematic editor must be an ordinary sibling of the new page.");
  }
  const siblings: z.infer<typeof sibling>[] = [];
  let maximumSuffix = 0, maximumZIndex = 1;
  for (const document of history.documents) {
    if (document.docType === "SCH_PAGE" && !isNativeDocumentDeleted(document)) {
      const value = pageMeta.parse(metadata(document));
      if (value.schematic === parent.uuid) {
        siblings.push({ uuid: document.uuid, title: value.title, zIndex: value.zIndex });
        maximumSuffix = Math.max(maximumSuffix, pageNameCounter(value.title));
        maximumZIndex = Math.max(maximumZIndex, value.zIndex ?? 0);
      }
    }
  }
  const desiredZIndex = maximumZIndex + 1;
  if (!Number.isFinite(desiredZIndex) || desiredZIndex <= maximumZIndex) { throw new Error("Native page-order counter cannot advance exactly."); }
  const plan = planSchema.parse({ profile: DOCUMENT_PAGE_CREATE_PROFILE, projectUuid: history.projectUuid, ownerUuid: history.projectOwnerUuid,
    branchUuid: history.branchUuid, parentUuid: parent.uuid, parentTitle, activeUuid: active.uuid, activeTabId: context.document.tabId,
    activeDocumentType: activeType, headerEditVersion: Object.hasOwn(active.metadata, "editVersion") ? active.metadata["editVersion"] : null,
    desiredTitle: `P${String(maximumSuffix + 1)}`, desiredZIndex, siblings,
    baselineDocumentIds: history.documents.map((document) => document.uuid), beforeProjectSha256: libraryProjectRecordsHash(history) });
  assertDocumentPageCreateContext(plan, context);
  return plan;
}

/** One project-qualified worker add, not public createSchematicPage: that path
 * also initializes drawing frames and opens a tab after asynchronous work.
 * A worker-created META-only page is valid input to its getCanvasData/getStr and
 * the normal schematic manager. Opening it is a separate, unvalidated action.
 * The caller must retain intent BEFORE dispatch and never retry this expression.
 */
export function buildDocumentPageCreateExpression(input: DocumentPageCreatePlan, context: ExpectedContext): string {
  const plan = planSchema.parse(input);
  assertDocumentPageCreateContext(plan, context);
  return `(async()=>{let stage='host';try{
const PLAN=${JSON.stringify(plan)};
${DEVICE_NATIVE_HOST_GUARD}
${NATIVE_PROJECT_PLACEHOLDER_PREDICATE}
const localUI=globalThis.UI,outerUI=globalThis.top?.UI;
if(localUI!=null&&outerUI!=null&&localUI!==outerUI)throw new Error('UI_AMBIGUOUS');
const ui=localUI??outerUI,tabs=ui?.tabBar,permission=ui?.concurrentDesign;
if(typeof tabs?.getFilterTabs!=='function'||typeof tabs.getActiveTab!=='function'||typeof tabs.hasTabUnSaved!=='function'||typeof tabs.isTabUnSaved!=='function')throw new Error('TAB_STATE_MISSING');
const clean=()=>{
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
if(++count!==1||tab.tabId!==PLAN.activeTabId||tab.data.doctype!==PLAN.activeDocumentType||(tab.documentType!==undefined&&tab.documentType!==PLAN.activeDocumentType)||tab.data.pid!==PLAN.projectUuid||(tab.parentProjectUuid!==undefined&&tab.parentProjectUuid!==PLAN.projectUuid)||(Object.hasOwn(tab,'isUnSaved')?tab.isUnSaved!==false:tab.isUnSaved!==undefined)||tab.parentLibraryUuid!==undefined||(tab.data.owner!==undefined&&tab.data.owner!==PLAN.ownerUuid))throw new Error('TAB_SCOPE');}
if(count!==1)throw new Error('TAB_SCOPE');};
const context=async()=>{const project=await eda.dmt_Project.getCurrentProjectInfo();clean();const document=await eda.dmt_SelectControl.getCurrentDocumentInfo();
if((project?.uuid??project?.projectUuid)!==PLAN.projectUuid||(project.uuid!==undefined&&project.projectUuid!==undefined&&project.uuid!==project.projectUuid)||
(document?.uuid??document?.documentUuid)!==PLAN.activeUuid||(document.uuid!==undefined&&document.documentUuid!==undefined&&document.uuid!==document.documentUuid)||document.documentType!==PLAN.activeDocumentType||document.tabId!==PLAN.activeTabId||document.parentProjectUuid!==PLAN.projectUuid||document.parentLibraryUuid!==undefined)throw new Error('CONTEXT');clean();};
const read=async(created)=>{
const parent=(await bus.rpcCall('/PrjDB/schematic/getData',[PLAN.parentUuid,PLAN.projectUuid])).message;await context();
if(parent?.uuid!==PLAN.parentUuid||parent.project_uuid!==PLAN.projectUuid||parent.display_name!==PLAN.parentTitle||parent.source!=='')throw new Error('PARENT_METADATA');
const owner=(await bus.rpcCall('/PrjDB/project/getData',[PLAN.projectUuid])).message;await context();
if(owner?.uuid!==PLAN.projectUuid||owner.owner?.uuid!==PLAN.ownerUuid||owner.currentBranch!==PLAN.branchUuid||owner.isV2Format!==false||owner.archive||owner.store||owner.cbb_project)throw new Error('PROJECT_METADATA');
const pages=(await bus.rpcCall('/PrjDB/sheet/getAllKVDatas',[PLAN.parentUuid,PLAN.projectUuid])).message;await context();
const expected=created?[...PLAN.siblings,{uuid:created,title:PLAN.desiredTitle,zIndex:PLAN.desiredZIndex}]:PLAN.siblings;
if(!pages||typeof pages!=='object'||Array.isArray(pages)||Object.keys(pages).length!==expected.length)throw new Error('SIBLING_MEMBERSHIP');
const found=new Set();for(const [key,page] of Object.entries(pages)){const value=expected.find(item=>item.uuid===page?.uuid);
if(!value||key!==page.uuid||found.has(page.uuid)||page.project_uuid!==PLAN.projectUuid||page.schematic_uuid!==PLAN.parentUuid||page.docType!==1||page.source!==''||page.display_title!==value.title||page.zIndex!==value.zIndex)throw new Error('SIBLING_METADATA');found.add(page.uuid);}
if(PLAN.siblings.some(value=>value.title.toLocaleLowerCase()===PLAN.desiredTitle.toLocaleLowerCase()))throw new Error('DUPLICATE_TITLE');};
await context();stage='before-read';await read(null);
stage='permission';const allowed=(await bus.rpcCall('ui/hasDocCreatePermission',{projectId:PLAN.projectUuid,showMsg:false})).message;await context();
if(allowed!==true)throw new Error('PROJECT_PERMISSION');
await read(null);await context();clean();stage='create';
const created=(await bus.rpcCall('/PrjDB/sheet/addData',[{schematic_uuid:PLAN.parentUuid,title:PLAN.desiredTitle,zIndex:PLAN.desiredZIndex},PLAN.projectUuid])).message;
if(!created||typeof created.uuid!=='string'||!/^[a-f0-9]{16}$/.test(created.uuid)||PLAN.baselineDocumentIds.includes(created.uuid)||created.project_uuid!==PLAN.projectUuid||created.schematic_uuid!==PLAN.parentUuid||created.docType!==1||created.display_title!==PLAN.desiredTitle||created.source!==''||created.zIndex!==PLAN.desiredZIndex)throw new Error('ACK_INVALID');
stage='after-read';await context();await read(created.uuid);await context();clean();
const json=JSON.stringify({kind:'project-page-create',targetId:created.uuid,createdId:created.uuid});
return{schema:'easyeda-pro-control.exact-json.v1',utf8Bytes:new TextEncoder().encode(json).byteLength,json};
}catch(_){throw new Error('Closed empty page creation refused at '+stage);}})()`;
}

/** The original immutable native return must supply the created identity.
 * A unique checkpoint addition alone does not attribute another actor's work
 * to this call. Missing acknowledgment remains unresolved and is never retried.
 */
export function verifyDocumentPageCreateEffect(input: DocumentPageCreatePlan, before: NativeHistorySnapshot, after: NativeHistorySnapshot, returnedId: unknown): Record<string, unknown> {
  const plan = planSchema.parse(input);
  const originalId = generatedId.parse(returnedId);
  const expected = prepareDocumentPageCreate({ id: "verify-page-create", action: "document.page.create", schematic: { uuid: plan.parentUuid } }, before,
    { project: { uuid: plan.projectUuid, path: "/unused-proof-context" }, document: { uuid: plan.activeUuid, documentType: plan.activeDocumentType,
      tabId: plan.activeTabId, parentProjectUuid: plan.projectUuid } });
  if (canonicalJson(plan) !== canonicalJson(expected)) { throw new Error("Page creation plan differs from the complete original checkpoint."); }
  validateHistory(after);
  if (after.projectUuid !== plan.projectUuid || after.projectOwnerUuid !== plan.ownerUuid || after.branchUuid !== plan.branchUuid) { throw new Error("Page creation project, branch or owner changed."); }
  const baselineIds = new Set(plan.baselineDocumentIds);
  const additions = after.documents.filter((entry) => !baselineIds.has(entry.uuid));
  const created = additions[0];
  if (additions.length !== 1 || created?.docType !== "SCH_PAGE" || isNativeDocumentDeleted(created)) { throw new Error("Page creation requires exactly one new ordinary page."); }
  generatedId.parse(created.uuid);
  if (originalId !== created.uuid) { throw new Error("Page creation identity differs from its retained native return."); }
  if (canonicalJson(before.documents.map((entry) => projection(entry))) !== canonicalJson(after.documents.filter((entry) => baselineIds.has(entry.uuid)).map((entry) => projection(entry)))) {
    throw new Error("Page creation changed pre-existing documents, hierarchy or membership.");
  }
  const header = z.object({ uuid: z.literal(created.uuid), docType: z.literal("SCH_PAGE"), client: generatedId,
    updateTime: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER), version: z.string(), editVersion: z.string().optional() }).strict().parse(created.metadata);
  if (header.version !== String(header.updateTime) || (header.editVersion ?? null) !== plan.headerEditVersion ||
    created.records.length !== 1 || canonicalJson(metadata(created)) !== canonicalJson({ title: plan.desiredTitle, schematic: plan.parentUuid, source: "", zIndex: plan.desiredZIndex })) {
    throw new Error("Page creation changed unreviewed defaults, header, drawing or source records.");
  }
  return { profile: DOCUMENT_PAGE_CREATE_PROFILE, targetId: created.uuid, createdId: created.uuid, parentUuid: plan.parentUuid,
    beforeProjectSha256: plan.beforeProjectSha256, afterProjectSha256: libraryProjectRecordsHash(after), documentCount: after.documents.length,
    identityEvidence: "retained-native-return",
    effectVerified: true, reopened: false, currentGenerationLiveValidated: false, saveInvoked: false,
    adapterKind: "native-task-equivalent", emptyPage: true, drawingFrameInitialized: false, editorOpened: false, automaticInverseAvailable: false };
}
