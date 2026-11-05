import { CURRENT_SCHEMATIC_PAGE_READ_MAX_BYTES, currentSchematicPageReadRequestSchema } from "./current-schematic-page-read.ts";
import { buildSchematicTextReadExpression } from "./schematic-text-read.ts";
import { buildSchematicNetGroupReadExpression } from "./schematic-netgroup-read.ts";
import { buildSchematicPrimitiveReadExpression } from "./schematic-primitive-read.ts";
import { buildCurrentProjectUrlGuard } from "./current-project-url.ts";
import { EXACT_READ_ENVELOPE_SCHEMA } from "./exact-readers.ts";

function selectedExpression(): string {
  const expression = buildSchematicPrimitiveReadExpression({ method: "eda.sch_Primitive.getPrimitivesByPrimitiveId", arguments: { ids: ["__sch209_selected__"] } });
  const marker = 'const selected=["__sch209_selected__"],singular=false;';
  const parts = expression.split(marker);
  if (parts.length !== 2) { throw new Error("SCH209_PAGE_SELECTED_TEMPLATE_CHANGED"); }
  return parts.join("const selected=selectedIds,singular=false;");
}

/** Fixed parent-realm program. SCH pages live in the UI realm, unlike PCB
 * child iframes. Every compiler retains its independent complete DTO guards. */
export function buildCurrentSchematicPageReadProgram(input: unknown): string {
  const request = currentSchematicPageReadRequestSchema.parse(input), selected = request.operation.method === "eda.sch_SelectControl.getSelectedPrimitives";
  let expression: string;
  if (selected) { expression = selectedExpression(); }
  else if (request.operation.method.includes("PrimitiveText")) { expression = buildSchematicTextReadExpression(request.operation); }
  else { expression = buildSchematicNetGroupReadExpression(request.operation); }
  return `"use strict";
const bad=()=>{throw new Error("SCH209_PAGE_READ_REFUSED");};
const target=${JSON.stringify(request.target)},root=globalThis,apply=Reflect.apply;
const EXPECTED_DOCUMENT_TYPE=1,EXPECTED_DOCUMENT_UUID=target.documentUuid,EXPECTED_PROJECT_UUID=target.projectUuid,EXPECTED_TAB_ID=target.tabId;
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
${buildCurrentProjectUrlGuard()}
const ui=root.UI,sch=root.SCH,host=root.gVars,metadata=host?.currentProject,tabs=ui?.tabBar,manager=sch?.docMemoryManager;
const active=manager?.getActiveDoc,activeTab=tabs?.getActiveTab,getTab=tabs?.getTabById;
if(typeof active!=="function"||typeof activeTab!=="function"||typeof getTab!=="function")bad();
const page=apply(active,manager,[]),project=page?.projectMgr,consistency=page?.consistencyImpl,handler=consistency?.decodeAndRealTimeSyncHandler;
const sourceReader=handler?.getSourceCodeIdMap,selection=project?.selectMgr,selectedReader=selection?.getTarget;
const tab=apply(getTab,tabs,[target.tabId]),data=tab?.data,href=root.location?.href,document=root.document;
if(typeof sourceReader!=="function"||!page||!project||!tab||!data)bad();
const check=()=>{
if(root.window!==root||root.top!==root||root.document!==document||document?.defaultView!==root||document?.nodeType!==9||document?.URL!==href||root.location?.href!==href||root.location?.origin!=="https://client")bad();
if(parseProjectUrl(href,target.projectUuid,target.tabId).empty)bad();
if(root.UI!==ui||root.SCH!==sch||root.gVars!==host||ui.gVars!==host||host.currentProject!==metadata||metadata.projectId!==target.projectUuid||metadata.branchUuid!==target.branchUuid||metadata.isV2Format!==false||host.isHistoryMode!==false)bad();
if(ui.tabBar!==tabs||tabs.getActiveTab!==activeTab||tabs.getTabById!==getTab||apply(activeTab,tabs,[])!==target.tabId||apply(getTab,tabs,[target.tabId])!==tab||tab.data!==data||tab.tabId!==target.tabId||data.doctype!==1||data.pid!==target.projectUuid||tab.parentLibraryUuid!==undefined)bad();
if(sch.docMemoryManager!==manager||manager.getActiveDoc!==active||apply(active,manager,[])!==page||page.uuid!==target.documentUuid||page.project_uuid!==target.projectUuid||page.tabId!==target.tabId||page.docType!==1||page.schematicUuid!==target.schematicUuid||page.isSchSheetDoc?.()!==true||page.isBlockSymbolInstancePage!==false||page.source!=="")bad();
if(page.projectMgr!==project||project.uuid!==target.projectUuid||page.consistencyImpl!==consistency||consistency.decodeAndRealTimeSyncHandler!==handler||consistency.handler!==handler||handler.getSourceCodeIdMap!==sourceReader||handler.docManager!==page||handler.consistencyImpl!==consistency||consistency.state!=="initialized"||page.shapeManager?.actionRunner?.running!==false)bad();
if(${JSON.stringify(selected)}&&(project.selectMgr!==selection||typeof selectedReader!=="function"||selection.getTarget!==selectedReader))bad();
};
const source=()=>{check();const value=apply(sourceReader,handler,[]);check();if(!(value instanceof Map)||value.size>20000)bad();const copy=[];for(const [id,marker] of value){if(typeof id!=="string"||!id||id.length>256||marker!==1)bad();copy.push([id,marker]);}return JSON.stringify(copy);};
const selectedCapture=()=>{check();const raw=apply(selectedReader,selection,[target.tabId]);check();if(!Array.isArray(raw)||raw.length>256||Reflect.ownKeys(raw).length!==raw.length+1)bad();const seen=new Set(),result=[],rawSeen=new Set();for(let i=0;i<raw.length;i++){const id=own(raw,String(i));if(typeof id!=="string"||!id||id.length>256||rawSeen.has(id))bad();rawSeen.add(id);const model=page.idManager.idMap.get(id);if(!model)bad();let resolved=id;if((model.modelType==="Wire"||model.modelType==="Bus")&&model.tagName==="NetGroupLine"){const parent=model.parent;if(!parent||parent.modelType!=="NetGroup"||parent.parent!==page.shapeManager.root)bad();resolved=parent.id;}if(!seen.has(resolved)){seen.add(resolved);result.push(resolved);}}return{raw:[...raw],ids:result};};
check();const beforeSource=source(),beforeSelection=${selected ? "selectedCapture()" : "null"},selectedIds=beforeSelection?.ids??[];
const read=()=>${expression};
const first=read();check();if(source()!==beforeSource)bad();const second=read();check();if(source()!==beforeSource||JSON.stringify(first)!==JSON.stringify(second))bad();
${selected ? 'const afterSelection=selectedCapture();if(JSON.stringify(beforeSelection)!==JSON.stringify(afterSelection))bad();' : ""}
const plainData=value=>{const pending=[value];let nodes=0;while(pending.length){if(++nodes>100000)bad();const current=pending.pop();if(typeof current==="number"&&(!Number.isFinite(current)||Object.is(current,-0)))bad();if(typeof current==="string"&&!current.isWellFormed())bad();if(current!==null&&typeof current==="object"){for(const item of Object.values(current))pending.push(item);}}};
plainData(first);check();
const json=JSON.stringify({schema:"easyeda-pro-control.current-schematic-page-read.v1",target,method:${JSON.stringify(request.operation.method)},value:first,samples:2,sourceIdsUnchanged:true,originalPageRechecked:true,implementationKind:"native-task-equivalent",completeSourceVerified:false,connectivityVerified:false,persistenceVerified:false,executionAuthorized:false,saveAuthorized:false});
const utf8Bytes=new TextEncoder().encode(json).byteLength,envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};
if(utf8Bytes>${CURRENT_SCHEMATIC_PAGE_READ_MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${CURRENT_SCHEMATIC_PAGE_READ_MAX_BYTES})bad();return envelope;`;
}
