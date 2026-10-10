import { z } from "zod";
import { normalizeEasyedaProjectPath, sha256Json } from "./core.ts";
import type { ExpectedContext } from "./engine.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { DEVICE_NATIVE_HOST_GUARD } from "./device-runtime-guard.ts";
import { buildNativeDocumentOpenFunction } from "./native-document-lifecycle.ts";

const identifier = z.string().regex(/^[a-zA-Z0-9_-]{1,128}$/u);
const scopeSchema = z.object({
  projectUuid: z.string().regex(/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u),
  projectPath: z.string().min(1).max(4096), schematicUuid: identifier,
  activePageUuid: identifier, activeTabId: z.string().min(1).max(512),
  pageUuids: z.array(identifier).min(1).max(16),
}).strict();
export type SchematicLayoutPageLoadScope = z.infer<typeof scopeSchema>;

/** Only a verified retained checkpoint and journal context may supply this scope. */
export function deriveSchematicLayoutPageLoadScope(context: ExpectedContext, history: NativeHistorySnapshot): SchematicLayoutPageLoadScope {
  const projectUuid = context.project.uuid ?? context.project.projectUuid;
  const activePageUuid = context.document.uuid ?? context.document.documentUuid;
  if (context.document.documentType !== 1 || projectUuid !== history.projectUuid ||
      (context.project.uuid !== undefined && context.project.projectUuid !== undefined && context.project.uuid !== context.project.projectUuid) ||
      (context.document.uuid !== undefined && context.document.documentUuid !== undefined && context.document.uuid !== context.document.documentUuid) ||
      history.profile !== "easyeda.native-history.linear-gcm-gzip.v1" || !/^[a-f0-9]{64}$/u.test(history.checkpointSha256) ||
      sha256Json(history.documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) !== history.semanticSha256) {
    throw new Error("Schematic page loading requires an exact checkpoint and active sheet.");
  }
  const known = new Set<string>();
  for (const document of history.documents) {
    if (known.has(document.uuid) || document.metadata["uuid"] !== document.uuid || document.metadata["docType"] !== document.docType ||
        sha256Json({ uuid: document.uuid, docType: document.docType, metadata: document.metadata,
          records: document.records.map(({ id, type, body }) => ({ id, type, body })) }) !== document.semanticSha256) {
      throw new Error("Schematic page loading checkpoint document integrity failed.");
    }
    known.add(document.uuid);
  }
  const documents = history.documents.filter((document) => !isNativeDocumentDeleted(document));
  const active = documents.find((document) => document.uuid === activePageUuid && document.docType === "SCH_PAGE");
  const meta = active?.records.filter((record) => record.id === "META" && record.type === "META");
  const schematicUuid = meta?.length === 1 ? meta[0]?.body["schematic"] : undefined;
  if (typeof schematicUuid !== "string" || !documents.some((document) => document.uuid === schematicUuid && document.docType === "SCH") ||
      (context.schematic?.uuid !== undefined && context.schematic.uuid !== schematicUuid) ||
      (context.schematic?.documentUuid !== undefined && context.schematic.documentUuid !== schematicUuid)) {
    throw new Error("Schematic page loading container is not checkpoint-bound.");
  }
  const pageUuids = documents.filter((document) => document.docType === "SCH_PAGE" &&
    document.records.some((record) => record.id === "META" && record.type === "META" && record.body["schematic"] === schematicUuid)).map((document) => document.uuid).toSorted();
  const scope = scopeSchema.parse({ projectUuid, projectPath: normalizeEasyedaProjectPath(context.project.path), schematicUuid,
    activePageUuid, activeTabId: context.document.tabId, pageUuids });
  if (scope.activeTabId !== `${scope.activePageUuid}@${scope.projectUuid}` || !scope.pageUuids.includes(scope.activePageUuid)) {
    throw new Error("Schematic page loading rejects aliased or foreign active tabs.");
  }
  return scope;
}

/** One public open/activate at most, then one return activation. The common
 * lifecycle proves the real tab/frame readiness; no Save, Close or source setter.
 * SCH docMemoryManager get/getSchDocs: pinned sch.js 6416740..6418250.
 * Complete topology and unchanged-source/database proofs remain caller-owned.
 */
export function buildSchematicLayoutPageLoadCode(value: SchematicLayoutPageLoadScope, pageUuid: string): string {
  const scope = scopeSchema.parse(value);
  if (scope.projectPath !== normalizeEasyedaProjectPath(scope.projectPath) || scope.activeTabId !== `${scope.activePageUuid}@${scope.projectUuid}` ||
      new Set(scope.pageUuids).size !== scope.pageUuids.length || !scope.pageUuids.includes(scope.activePageUuid) || !scope.pageUuids.includes(pageUuid)) {
    throw new Error("Schematic page loading target is outside the declared checkpoint scope.");
  }
  const open = buildNativeDocumentOpenFunction({ projectUuid: scope.projectUuid, documentUuid: pageUuid, documentType: 1 });
  return `return await (async()=>{
${DEVICE_NATIVE_HOST_GUARD}
const scope=${JSON.stringify(scope)},pageUuid=${JSON.stringify(pageUuid)},targetTab=pageUuid+'@'+scope.projectUuid;
const ui=globalThis.window?.top,sch=globalThis.SCH,manager=sch?.docMemoryManager;
const fail=()=>{throw new Error('SCH_LAYOUT_PAGE_LOAD_SCOPE');};
if(!ui||typeof ui.setTimeout!=='function'||typeof ui.clearTimeout!=='function'||typeof ui.document?.getElementById!=='function'||typeof manager?.get!=='function'||typeof manager.getSchDocs!=='function'||typeof manager.getActiveDoc!=='function')fail();
const sorted=value=>JSON.stringify([...value].sort());
const owners=async()=>{
 const project=await eda.dmt_Project.getCurrentProjectInfo();
 if(project?.uuid!==scope.projectUuid||host.currentProject?.projectId!==scope.projectUuid||sch.gVars?.currentProject?.projectId!==scope.projectUuid)fail();
 const declared=await eda.dmt_Schematic.getCurrentSchematicInfo();
 if(declared?.uuid!==scope.schematicUuid||declared.parentProjectUuid!==scope.projectUuid||!Array.isArray(declared.page)||declared.page.length!==scope.pageUuids.length)fail();
 const ids=declared.page.map(page=>{if(page?.parentSchematicUuid!==scope.schematicUuid||typeof page.uuid!=='string'||(page.parentProjectUuid!==undefined&&page.parentProjectUuid!==scope.projectUuid))fail();return page.uuid;});
 if(new Set(ids).size!==ids.length||sorted(ids)!==sorted(scope.pageUuids))fail();
 const docs=manager.getSchDocs();if(!Array.isArray(docs)||docs.length>2048)fail();
 for(const doc of docs){if(doc.project_uuid!==scope.projectUuid||doc.schematicUuid!==scope.schematicUuid||!scope.pageUuids.includes(doc.uuid)||doc.tabId!==doc.uuid+'@'+scope.projectUuid||doc.isSchSheetDoc()!==true||manager.get(doc.uuid)!==doc)fail();}
};
const frameReady=async(id)=>{
 const tab=id+'@'+scope.projectUuid,doc=manager.get(id),frame=ui.document.getElementById('frame_'+tab);
 if(!doc||!frame)return false;
 if(doc.uuid!==id||doc.tabId!==tab||doc.project_uuid!==scope.projectUuid||doc.schematicUuid!==scope.schematicUuid||doc.isSchSheetDoc()!==true||(await bus.rpcCall('getModelTabId',tab))?.message!==tab)fail();
 return frame.isConnected===true&&frame.tagName==='DIV'&&frame.getAttribute('c_dbid')===tab&&frame.getAttribute('c_doctype')==='1'&&(await bus.rpcCall('isOpenTab',[tab]))?.message===true;
};
const activeMatches=async(id)=>{
 await owners();const current=await eda.dmt_SelectControl.getCurrentDocumentInfo(),native=manager.getActiveDoc();
 if(current!=null&&((current.parentProjectUuid!==undefined&&current.parentProjectUuid!==scope.projectUuid)||(current.documentType!==1)||(current.uuid!==scope.activePageUuid&&current.uuid!==pageUuid)))fail();
 return current?.uuid===id&&current.documentType===1&&current.tabId===id+'@'+scope.projectUuid&&native===manager.get(id)&&await frameReady(id);
};
await owners();if(!await activeMatches(scope.activePageUuid))fail();
if(pageUuid!==scope.activePageUuid){
 const present=(await bus.rpcCall('isOpenTab',[targetTab]))?.message;
 if(present===false){if(manager.get(pageUuid)!==undefined&&manager.get(pageUuid)!==null)fail();await (${open})(targetTab);}
 else if(present!==true||!await frameReady(pageUuid))fail();
}
let deadline,pollTimer,rejectDeadline;
const expired=new Promise((resolve,reject)=>{rejectDeadline=reject;});expired.catch(()=>{});
const bounded=promise=>Promise.race([promise,expired]);
const pause=()=>new Promise(resolve=>{pollTimer=ui.setTimeout(()=>{pollTimer=undefined;resolve();},50);});
try{
 deadline=ui.setTimeout(()=>rejectDeadline(new Error('NATIVE_LIFECYCLE_OPEN_TIMEOUT')),15000);
 await bounded(owners());if(!await bounded(frameReady(pageUuid)))fail();
 if(!await bounded(activeMatches(scope.activePageUuid))){const result=await bounded(eda.dmt_EditorControl.activateDocument(scope.activeTabId));if(typeof result!=='boolean')fail();}
 let stable=0;
 for(let attempt=0;attempt<300;attempt++){
  if(await bounded(activeMatches(scope.activePageUuid))&&await bounded(frameReady(pageUuid))){stable++;if(stable===2)return {ok:true,profile:'easyeda-pro-control.schematic-layout-page-load.v1',pageUuid,activePageUuid:scope.activePageUuid,activeTabId:scope.activeTabId,loaded:true,returned:true,saved:false};}else stable=0;
  await bounded(pause());
 }
 throw new Error('NATIVE_LIFECYCLE_OPEN_TIMEOUT');
}finally{if(deadline!==undefined)ui.clearTimeout(deadline);if(pollTimer!==undefined)ui.clearTimeout(pollTimer);}
})();`;
}
