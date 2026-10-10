import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import { libraryOperationSchema } from "./library-operations.ts";
import { libraryProjectRecordsHash } from "./library-persistence-proof.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "./native-history.ts";
import type { ExpectedContext } from "./engine.ts";
import { DEVICE_NATIVE_HOST_GUARD } from "./device-runtime-guard.ts";
import { buildEditorTargetAbsentExpression } from "./editor-tabs.ts";

export const DOCUMENT_PAGE_RENAME_PROFILE = "easyeda-pro-control.closed-page-rename.v1";
const identifier = z.string().regex(/^[a-zA-Z0-9_-]{1,128}$/u);
const title = z.string().min(1).max(512).refine((value) => value.trim() === value && !/\p{Cc}/u.test(value));
const planSchema = z.object({ profile: z.literal(DOCUMENT_PAGE_RENAME_PROFILE), projectUuid: identifier,
  ownerUuid: identifier, branchUuid: identifier, targetUuid: identifier, parentUuid: identifier,
  activeUuid: identifier, activeTabId: z.string().min(1).max(512),
  beforeTitle: title, desiredTitle: title, parentTitle: title,
  headerEditVersion: z.string().min(1).max(128).nullable(),
  siblingTitles: z.array(title).max(1024),
  zIndex: z.number().nullable(),
  beforeProjectSha256: z.string().regex(/^[a-f0-9]{64}$/u),
}).strict();
export type DocumentPageRenamePlan = z.infer<typeof planSchema>;
const pageMetaSchema = z.object({ title, schematic: identifier, source: z.literal(""), zIndex: z.number().nullable() }).strict();
// ELIB_SymbolType in the pinned 0.2.53 declarations. Only 17 is a CBB symbol;
// Flags, drawing frames and other ordinary library shapes are unchanged peers.
const unchangedSymbolTypes = new Set([2, 18, 19, 20, 21, 22, 25, 31]);

export function documentPageRenameOperation(input: unknown): Extract<ReturnType<typeof libraryOperationSchema.parse>, { action: "document.page.rename" }> {
  const operation = libraryOperationSchema.parse(input);
  if (operation.action !== "document.page.rename" || !("uuid" in operation.target)) { throw new Error("Page rename requires one exact existing page identity."); }
  title.parse(operation.name);
  return operation;
}
function metadata(document: NativeDocumentSnapshot): Record<string, unknown> {
  const entries = document.records.filter((record) => record.id === "META" || record.type === "META");
  if (entries.length !== 1 || entries[0]?.id !== "META" || entries[0].type !== "META") { throw new Error("Page rename requires exactly one META record."); }
  return entries[0].body;
}
function exactDocument(history: NativeHistorySnapshot, uuid: string, type: string): NativeDocumentSnapshot {
  const matches = history.documents.filter((document) => document.uuid === uuid);
  if (matches.length !== 1 || matches[0]?.docType !== type || isNativeDocumentDeleted(matches[0])) { throw new Error("Page rename target or parent is not an exact active checkpoint member."); }
  return matches[0];
}
function validateHistory(history: NativeHistorySnapshot): void {
  const known = new Set<string>();
  if (history.profile !== "easyeda.native-history.linear-gcm-gzip.v1" || history.documents.length === 0) { throw new Error("Page rename checkpoint is incomplete."); }
  for (const document of history.documents) {
    if (known.has(document.uuid) || document.metadata["uuid"] !== document.uuid || document.metadata["docType"] !== document.docType ||
      document.semanticSha256 !== sha256Json({ uuid: document.uuid, docType: document.docType, metadata: document.metadata,
        records: document.records.map(({ id, type, body }) => ({ id, type, body })) })) { throw new Error("Page rename checkpoint document integrity failed."); }
    known.add(document.uuid);
    const symbolType = document.docType === "SYMBOL" ? metadata(document)["docType"] : undefined;
    if (!isNativeDocumentDeleted(document) && (document.docType === "INSTANCE" || (document.docType === "SYMBOL" && (typeof symbolType !== "number" || !unchangedSymbolTypes.has(symbolType))))) {
      throw new Error("Page rename currently excludes hierarchical instances, CBB counterparts and unknown symbol types.");
    }
  }
  if (history.semanticSha256 !== sha256Json(history.documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 })))) {
    throw new Error("Page rename complete checkpoint integrity failed.");
  }
}

/** Only a complete retained checkpoint supplies membership and stored titles.
 * Missing or future META fields refuse before the native serializer can drop them.
 */
export function prepareDocumentPageRename(input: unknown, history: NativeHistorySnapshot, context: ExpectedContext): DocumentPageRenamePlan {
  const operation = documentPageRenameOperation(input);
  validateHistory(history);
  if (!("uuid" in operation.target)) { throw new Error("Page rename target identity is missing."); }
  const target = exactDocument(history, operation.target.uuid, "SCH_PAGE");
  // The pinned sheet handler serializes these DOCHEAD keys only. Its user is
  // Captured before the project manager subscribes/login initializes, so it
  // Deterministically omits user; never admit an arbitrary replacement actor.
  const headerKeys = new Set(["uuid", "docType", "client", "updateTime", "version", "user", "editVersion"]);
  if (Object.keys(target.metadata).some((key) => !headerKeys.has(key))) { throw new Error("Page rename would drop unreviewed DOCHEAD fields."); }
  const headerEditVersion = Object.hasOwn(target.metadata, "editVersion") ? z.string().min(1).max(128).parse(target.metadata["editVersion"]) : null;
  const before = pageMetaSchema.parse(metadata(target));
  const parent = exactDocument(history, before.schematic, "SCH"), parentMeta = metadata(parent);
  const parentTitle = title.parse(parentMeta["title"]);
  const activeUuid = context.document.uuid ?? context.document.documentUuid ?? "";
  const active = exactDocument(history, activeUuid, "SCH_PAGE");
  if (active.uuid === target.uuid || metadata(active)["schematic"] !== before.schematic || context.document.documentType !== 1 ||
    context.document.tabId !== `${active.uuid}@${history.projectUuid}` || context.document["parentProjectUuid"] !== history.projectUuid ||
    (context.schematic?.uuid !== undefined && context.schematic.uuid !== before.schematic)) { throw new Error("Page rename requires another checkpoint-bound sibling page as the sole active editor."); }
  if (parentMeta["source"] !== "" || Object.hasOwn(parentMeta, "blockSymbolUuid")) { throw new Error("Page rename excludes inherited and reuse-block parent schematics."); }
  if (operation.name === before.title) { throw new Error("Page rename refuses an unchanged title."); }
  const normalized = operation.name.toLowerCase();
  const siblingTitles: string[] = [];
  for (const document of history.documents) {
    if (document.docType === "SCH_PAGE" && document.uuid !== target.uuid && !isNativeDocumentDeleted(document)) {
      const peer = metadata(document);
      if (typeof peer["schematic"] !== "string" || typeof peer["title"] !== "string") { throw new TypeError("Peer page metadata is incomplete."); }
      if (peer["schematic"] === before.schematic) {
        siblingTitles.push(title.parse(peer["title"]));
        if (peer["title"].toLowerCase() === normalized) { throw new Error("A sibling page already has that normalized title."); }
      }
    }
  }
  return planSchema.parse({ profile: DOCUMENT_PAGE_RENAME_PROFILE, projectUuid: history.projectUuid, ownerUuid: history.projectOwnerUuid,
    branchUuid: history.branchUuid, targetUuid: target.uuid, parentUuid: before.schematic, beforeTitle: before.title,
    activeUuid: active.uuid, activeTabId: context.document.tabId,
    desiredTitle: operation.name, parentTitle, headerEditVersion, siblingTitles, zIndex: before.zIndex, beforeProjectSha256: libraryProjectRecordsHash(history) });
}

/** The public setter passes a mutable left-tree row index across awaits. Use
 * its fixed project-qualified sheet.updateData metadata writer instead. It
 * uploads one META edit without Save; UI caption refresh is not promised.
 * Closed target and one other clean editor exclude asynchronous canvas/title
 * propagation and every unrelated dirty or foreign tab before dispatch.
 */
export function buildDocumentPageRenameExpression(input: DocumentPageRenamePlan, context: ExpectedContext): string {
  const plan = planSchema.parse(input);
  if ((context.project.uuid ?? context.project.projectUuid) !== plan.projectUuid ||
    (context.project.uuid !== undefined && context.project.projectUuid !== undefined && context.project.uuid !== context.project.projectUuid) ||
    (context.document.uuid !== undefined && context.document.documentUuid !== undefined && context.document.uuid !== context.document.documentUuid)) {
    throw new Error("Page rename context aliases contradict its checkpoint identity.");
  }
  const active = { uuid: context.document.uuid ?? context.document.documentUuid ?? "", documentType: context.document.documentType, tabId: context.document.tabId ?? "" };
  if (active.uuid !== plan.activeUuid || active.tabId !== plan.activeTabId || active.documentType !== 1 || context.document["parentProjectUuid"] !== plan.projectUuid || context.document["parentLibraryUuid"] !== undefined) {
    throw new Error("Closed-page rename requires another owned schematic page as the sole clean editor.");
  }
  const closed = buildEditorTargetAbsentExpression({ targetUuid: plan.targetUuid, projectUuid: plan.projectUuid, ownerUuid: plan.ownerUuid, active });
  return `(async()=>{let stage='host';try{
const PLAN=${JSON.stringify(plan)},ACTIVE=${JSON.stringify(active)};
${DEVICE_NATIVE_HOST_GUARD}
const localUI=globalThis.UI,outerUI=globalThis.top?.UI;
if(localUI!=null&&outerUI!=null&&localUI!==outerUI)throw new Error('UI_AMBIGUOUS');
const ui=localUI??outerUI,tabs=ui?.tabBar,permission=ui?.concurrentDesign;
if(typeof tabs?.getFilterTabs!=='function'||typeof tabs.getActiveTab!=='function'||typeof tabs.hasTabUnSaved!=='function'||typeof tabs.isTabUnSaved!=='function')throw new Error('TAB_STATE_MISSING');
const clean=()=>{
if(PLAN.siblingTitles.some(value=>value.toLocaleLowerCase()===PLAN.desiredTitle.toLocaleLowerCase()))throw new Error('LOCALE_DUPLICATE_TITLE');
const localVersion=globalThis.PRO_EDITOR_VERSION,outerVersion=globalThis.top?.PRO_EDITOR_VERSION;
if(localVersion!==undefined&&outerVersion!==undefined&&localVersion!==outerVersion)throw new Error('EDITOR_VERSION_AMBIGUOUS');
if((localVersion??outerVersion)!==(PLAN.headerEditVersion===null?undefined:PLAN.headerEditVersion))throw new Error('EDITOR_VERSION_DRIFT');
if(host.currentProject?.projectId!==PLAN.projectUuid||host.currentProject.branchUuid!==PLAN.branchUuid||host.currentProject.isV2Format!==false||host.isHistoryMode!==false||tabs.getActiveTab()!==ACTIVE.tabId||tabs.hasTabUnSaved()!==false||tabs.isTabUnSaved(ACTIVE.tabId)!==false)throw new Error('CONTEXT_OR_DIRTY');
if(permission?.isConcurrentStrictMode!==false||typeof permission.getIframeDisableStatusPanelPcb!=='function'||permission.getIframeDisableStatusPanelPcb(ACTIVE.tabId)?.disable!==false)throw new Error('PROJECT_NOT_WRITABLE');
const all=tabs.getFilterTabs([]);if(!Array.isArray(all)||all.length<1||all.length>2)throw new Error('TAB_SCOPE');
let count=0,start=0;
for(const tab of all){if(tab?.tabId==='tab_page1'){if(++start!==1||tab.isAbleDelete!==false||tab.data?.doctype!==-1||tab.data?.pid!==undefined||tab.data?.owner!==undefined)throw new Error('START_TAB');continue;}
if(++count!==1||tab?.tabId!==ACTIVE.tabId||tab.data?.doctype!==1||tab.data?.pid!==PLAN.projectUuid||(Object.hasOwn(tab,'isUnSaved')?tab.isUnSaved!==false:tab.isUnSaved!==undefined)||tab.parentLibraryUuid!==undefined||(tab.data.owner!==undefined&&tab.data.owner!==PLAN.ownerUuid))throw new Error('TAB_SCOPE');}
if(count!==1)throw new Error('TAB_SCOPE');};
const context=async()=>{const project=await eda.dmt_Project.getCurrentProjectInfo();const document=await eda.dmt_SelectControl.getCurrentDocumentInfo();
if((project?.uuid??project?.projectUuid)!==PLAN.projectUuid||(project.uuid!==undefined&&project.projectUuid!==undefined&&project.uuid!==project.projectUuid)||
(document?.uuid??document?.documentUuid)!==ACTIVE.uuid||(document.uuid!==undefined&&document.documentUuid!==undefined&&document.uuid!==document.documentUuid)||document.documentType!==1||document.tabId!==ACTIVE.tabId||document.parentProjectUuid!==PLAN.projectUuid||document.parentLibraryUuid!==undefined)throw new Error('CONTEXT');clean();};
const read=async(expected)=>{const value=(await bus.rpcCall('/PrjDB/sheet/getData',[PLAN.targetUuid,PLAN.projectUuid])).message;await context();
if(value?.uuid!==PLAN.targetUuid||value.project_uuid!==PLAN.projectUuid||value.schematic_uuid!==PLAN.parentUuid||value.docType!==1||value.display_title!==expected||value.source!==''||value.zIndex!==PLAN.zIndex)throw new Error('PAGE_METADATA');
const parent=(await bus.rpcCall('/PrjDB/schematic/getData',[PLAN.parentUuid,PLAN.projectUuid])).message;await context();
if(parent?.uuid!==PLAN.parentUuid||parent.project_uuid!==PLAN.projectUuid||parent.display_name!==PLAN.parentTitle||parent.source!=='')throw new Error('PARENT_METADATA');
const owner=(await bus.rpcCall('/PrjDB/project/getData',[PLAN.projectUuid])).message;await context();
if(owner?.uuid!==PLAN.projectUuid||owner.owner?.uuid!==PLAN.ownerUuid||owner.currentBranch!==PLAN.branchUuid||owner.isV2Format!==false||owner.archive||owner.store||owner.cbb_project)throw new Error('PROJECT_METADATA');};
await context();stage='before-read';await read(PLAN.beforeTitle);
stage='closed-target';await ${closed};
await context();
clean();
stage='rename';
const result=(await bus.rpcCall('/PrjDB/sheet/updateData',[{uuid:PLAN.targetUuid,title:PLAN.desiredTitle},PLAN.projectUuid])).message;
if(result?.success!==true||result.result?.uuid!==PLAN.targetUuid||result.result.project_uuid!==PLAN.projectUuid||result.result.schematic_uuid!==PLAN.parentUuid||result.result.display_title!==PLAN.desiredTitle)throw new Error('ACK_INVALID');
stage='after-read';await read(PLAN.desiredTitle);await ${closed};await context();
const json=JSON.stringify({kind:'project-page-rename',targetId:PLAN.targetUuid,createdId:null});
return{schema:'easyeda-pro-control.exact-json.v1',utf8Bytes:new TextEncoder().encode(json).byteLength,json};
}catch(_){throw new Error('Closed page rename refused at '+stage);}})()`;
}

function projection(document: NativeDocumentSnapshot): unknown {
  return { uuid: document.uuid, docType: document.docType, metadata: document.metadata, records: document.records.map(({ id, type, body }) => ({ id, type, body })) };
}
export function verifyDocumentPageRenameEffect(input: DocumentPageRenamePlan, before: NativeHistorySnapshot, after: NativeHistorySnapshot): Record<string, unknown> {
  const plan = planSchema.parse(input);
  const expectedPlan = prepareDocumentPageRename({ id: "verify-page-rename", action: "document.page.rename", target: { uuid: plan.targetUuid }, name: plan.desiredTitle }, before,
    { project: { uuid: plan.projectUuid, path: "/unused-proof-context" }, document: { uuid: plan.activeUuid, tabId: plan.activeTabId, documentType: 1, parentProjectUuid: plan.projectUuid } });
  if (canonicalJson(plan) !== canonicalJson(expectedPlan)) { throw new Error("Page rename plan differs from its complete original checkpoint."); }
  validateHistory(after);
  if (after.projectUuid !== plan.projectUuid || after.branchUuid !== plan.branchUuid || after.projectOwnerUuid !== plan.ownerUuid) { throw new Error("Page rename project, branch or owner changed."); }
  const current = exactDocument(after, plan.targetUuid, "SCH_PAGE"), old = exactDocument(before, plan.targetUuid, "SCH_PAGE");
  const peers = (history: NativeHistorySnapshot): unknown[] => history.documents.filter((document) => document.uuid !== plan.targetUuid).map((document) => projection(document));
  if (canonicalJson(peers(before)) !== canonicalJson(peers(after))) { throw new Error("Page rename changed peer records or membership."); }
  const changedKeys = [...new Set([...Object.keys(old.metadata), ...Object.keys(current.metadata)])].filter((key) =>
    Object.hasOwn(old.metadata, key) !== Object.hasOwn(current.metadata, key) || canonicalJson({ value: old.metadata[key] }) !== canonicalJson({ value: current.metadata[key] }));
  const time = current.metadata["updateTime"];
  if (changedKeys.some((key) => !["client", "updateTime", "version", "user"].includes(key)) || Object.hasOwn(current.metadata, "user") || typeof time !== "number" || !Number.isSafeInteger(time) || time < 0 ||
    (typeof old.metadata["updateTime"] === "number" && time < old.metadata["updateTime"]) || current.metadata["version"] !== String(time) ||
    typeof current.metadata["client"] !== "string" || !/^[a-f0-9]{16}$/u.test(current.metadata["client"])) { throw new Error("Page rename changed unreviewed header fields."); }
  const expected = { ...old, metadata: current.metadata, records: old.records.map((record) => record.id === "META" ? Object.assign(structuredClone(record), { body: { ...record.body, title: plan.desiredTitle } }) : record) };
  if (canonicalJson(projection(expected)) !== canonicalJson(projection(current))) { throw new Error("Page rename changed geometry, parent or unrequested metadata."); }
  return { profile: DOCUMENT_PAGE_RENAME_PROFILE, targetId: plan.targetUuid, parentUuid: plan.parentUuid,
    beforeProjectSha256: plan.beforeProjectSha256, afterProjectSha256: libraryProjectRecordsHash(after), documentCount: after.documents.length,
    effectVerified: true, reopened: false, currentGenerationLiveValidated: false, saveInvoked: false,
    adapterKind: "native-task-equivalent", editorTitleRefreshVerified: false };
}

/** Data for a separate transaction, never a redispatch of the original journal. */
export function documentPageRenameInverse(input: DocumentPageRenamePlan, before: NativeHistorySnapshot, after: NativeHistorySnapshot, operationId: string): ReturnType<typeof documentPageRenameOperation> {
  const plan = planSchema.parse(input);
  verifyDocumentPageRenameEffect(plan, before, after);
  return documentPageRenameOperation({ id: operationId, action: "document.page.rename", target: { uuid: plan.targetUuid }, name: plan.beforeTitle });
}
