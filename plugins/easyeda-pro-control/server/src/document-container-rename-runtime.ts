import { z } from "zod";
import type { ExpectedContext } from "./engine.ts";
import { assertDocumentContainerRenameContext, documentContainerRenamePlanSchema } from "./document-container-rename.ts";
import type { DocumentContainerRenamePlan } from "./document-container-rename.ts";
import { DEVICE_NATIVE_HOST_GUARD } from "./device-runtime-guard.ts";
import { NATIVE_PROJECT_PLACEHOLDER_PREDICATE } from "./native-editor-tab-guards.ts";
import { DOCUMENT_RENAME_NATIVE_GUARD_CODES } from "./metadata-native-diagnostics.ts";
import { DOCUMENT_CONTAINER_RENAME_DOM_GUARD } from "./document-container-rename-dom.ts";

/** Separate from page rename: these serializers write fixed, different META
 * shapes. Only one other PCB may be loaded, including in hidden split panes.
 */
function program(input: DocumentContainerRenamePlan, context: ExpectedContext, mode: "write" | "readback", expectedTitle?: "before" | "after"): string {
  const plan = documentContainerRenamePlanSchema.parse(input);
  assertDocumentContainerRenameContext(plan, context);
  const active = { uuid: plan.activeUuid, documentType: 3, tabId: plan.activeTabId };
  return `(async()=>{let stage='host';try{
const PLAN=${JSON.stringify(plan)},ACTIVE=${JSON.stringify(active)};
${DEVICE_NATIVE_HOST_GUARD}
${NATIVE_PROJECT_PLACEHOLDER_PREDICATE}
const localUI=globalThis.UI,outerUI=globalThis.top?.UI;
if(localUI!=null&&outerUI!=null&&localUI!==outerUI)throw new Error('UI_AMBIGUOUS');
const ui=localUI??outerUI,tabs=ui?.tabBar,permission=ui?.concurrentDesign,editorTop=globalThis.EDITOR_TOP??globalThis;
const projectApi=eda.dmt_Project,selectApi=eda.dmt_SelectControl,editorApi=eda.dmt_EditorControl;
if(typeof tabs?.getFilterTabs!=='function'||typeof tabs.getActiveTab!=='function'||typeof tabs.hasTabUnSaved!=='function'||typeof tabs.isTabUnSaved!=='function')throw new Error('TAB_STATE_MISSING');
${DOCUMENT_CONTAINER_RENAME_DOM_GUARD}
const clean=()=>{
const lh=globalThis.gVars,oh=globalThis.top?.gVars,lu=globalThis.UI,ou=globalThis.top?.UI;
if((lh!=null&&oh!=null&&lh!==oh)||(lu!=null&&ou!=null&&lu!==ou)||(lh??oh)!==host||(lu??ou)!==ui||(globalThis.EDITOR_TOP??globalThis)!==editorTop||editorTop.gVars!==host||host.messageBus!==bus||ui.tabBar!==tabs||ui.concurrentDesign!==permission||eda.dmt_Project!==projectApi||eda.dmt_SelectControl!==selectApi||eda.dmt_EditorControl!==editorApi)throw new Error('CONTEXT');
if(PLAN.siblingTitles.some(value=>value.toLocaleLowerCase()===PLAN.desiredTitle.toLocaleLowerCase()))throw new Error('LOCALE_DUPLICATE_TITLE');
const lv=globalThis.PRO_EDITOR_VERSION,ov=globalThis.top?.PRO_EDITOR_VERSION;
if(lv!==undefined&&ov!==undefined&&lv!==ov)throw new Error('EDITOR_VERSION_AMBIGUOUS');
if((lv??ov)!==(PLAN.headerEditVersion===null?undefined:PLAN.headerEditVersion))throw new Error('EDITOR_VERSION_DRIFT');
if(host.currentProject?.projectId!==PLAN.projectUuid)throw new Error('PROJECT_DRIFT');
if(host.currentProject.branchUuid!==PLAN.branchUuid)throw new Error('BRANCH_DRIFT');
if(host.currentProject.isV2Format!==false)throw new Error('PROJECT_FORMAT_UNSUPPORTED');
if(host.isHistoryMode!==false)throw new Error('HISTORY_MODE');
if(tabs.getActiveTab()!==ACTIVE.tabId)throw new Error('ACTIVE_TAB_DRIFT');
if(tabs.hasTabUnSaved()!==false)throw new Error('DIRTY_TABS');
if(tabs.isTabUnSaved(ACTIVE.tabId)!==false)throw new Error('DIRTY_ACTIVE_TAB');
if(permission?.isConcurrentStrictMode!==false)throw new Error('CONCURRENT_MODE');
if(typeof permission.getIframeDisableStatusPanelPcb!=='function')throw new Error('PERMISSION_API_MISSING');
if(permission.getIframeDisableStatusPanelPcb(ACTIVE.tabId)?.disable!==false)throw new Error('READ_ONLY');
const all=tabs.getFilterTabs([]);if(!Array.isArray(all)||all.length<1||all.length>3)throw new Error('TAB_SCOPE');
let count=0,start=0,placeholder=0;
for(const tab of all){if(tab?.tabId==='tab_page1'){if(++start!==1||tab.isAbleDelete!==false||tab.data?.doctype!==-1||tab.data?.pid!==undefined||tab.data?.owner!==undefined)throw new Error('START_TAB');continue;}
if(tab?.tabId==='0'){if(++placeholder!==1||!isNativeProjectPlaceholder(tab)||tabs.isTabUnSaved(tab.tabId)!==false)throw new Error('PROJECT_PLACEHOLDER');continue;}
if(++count!==1||tab?.tabId!==ACTIVE.tabId||tab.data?.doctype!==3||tab.data?.pid!==PLAN.projectUuid||(Object.hasOwn(tab,'isUnSaved')?tab.isUnSaved!==false:tab.isUnSaved!==undefined)||tab.parentLibraryUuid!==undefined||(tab.data.owner!==undefined&&tab.data.owner!==PLAN.ownerUuid))throw new Error('TAB_SCOPE');}
if(count!==1)throw new Error('TAB_SCOPE');frames();};
const context=async()=>{clean();const p=await projectApi.getCurrentProjectInfo();clean();const d=await selectApi.getCurrentDocumentInfo();clean();
if((p?.uuid??p?.projectUuid)!==PLAN.projectUuid||(p.uuid!==undefined&&p.projectUuid!==undefined&&p.uuid!==p.projectUuid)||(d?.uuid??d?.documentUuid)!==ACTIVE.uuid||(d.uuid!==undefined&&d.documentUuid!==undefined&&d.uuid!==d.documentUuid)||d.documentType!==3||d.tabId!==ACTIVE.tabId||d.parentProjectUuid!==PLAN.projectUuid||d.parentLibraryUuid!==undefined)throw new Error('CONTEXT');};
const closed=async()=>{
clean();if(typeof editorApi.getSplitScreenTree!=='function')throw new Error('EDITOR_TABS_API_MISSING');
const tree=await editorApi.getSplitScreenTree();clean();const pending=[{value:tree,depth:0}],seen=new Set(),ids=new Set();let count=0,start=0;
while(pending.length){const item=pending.pop(),node=item.value;
if(!node||typeof node!=='object'||Array.isArray(node)||seen.has(node)||item.depth>16||seen.size>=128)throw new Error('EDITOR_TABS_TREE_BOUND');seen.add(node);
if(node.children!==undefined){if(!Array.isArray(node.children)||node.children.length===0||node.children.length>128||node.tabs!==undefined||pending.length+node.children.length+seen.size>128)throw new Error('EDITOR_TABS_TREE_SHAPE');for(const child of node.children)pending.push({value:child,depth:item.depth+1});}
else{if(!Array.isArray(node.tabs)||node.tabs.length===0||node.tabs.length>2)throw new Error('EDITOR_TABS_INCOMPLETE');
for(const tab of node.tabs){if(!tab||typeof tab!=='object'||Array.isArray(tab)||typeof tab.tabId!=='string'||ids.has(tab.tabId))throw new Error('EDITOR_TABS_TAB_SHAPE');ids.add(tab.tabId);
const data=tab.data;if(data!==undefined&&(!data||typeof data!=='object'||Array.isArray(data)))throw new Error('EDITOR_TABS_TAB_SHAPE');
if(tab.documentType!==undefined&&data?.doctype!==undefined&&tab.documentType!==data.doctype)throw new Error('EDITOR_TABS_TAB_SHAPE');const type=tab.documentType??data?.doctype,id=tab.tabId.split('@')[0];
if(id===PLAN.targetUuid||PLAN.childUuids.includes(id))throw new Error('EDITOR_TARGET_ALREADY_OPEN');
if(tab.tabId==='tab_page1'&&type===-1&&tab.isAbleDelete===false&&tab.parentProjectUuid===undefined&&tab.parentLibraryUuid===undefined&&data?.pid===undefined&&data?.owner===undefined){if(++start!==1)throw new Error('EDITOR_TABS_TAB_SHAPE');continue;}
if(++count!==1||tab.tabId!==ACTIVE.tabId||id!==ACTIVE.uuid||type!==3||tab.parentLibraryUuid!==undefined||(tab.parentProjectUuid!==undefined&&tab.parentProjectUuid!==PLAN.projectUuid)||(data?.pid!==undefined&&data.pid!==PLAN.projectUuid)||(tab.parentProjectUuid!==PLAN.projectUuid&&data?.pid!==PLAN.projectUuid)||(data?.owner!==undefined&&data.owner!==PLAN.ownerUuid))throw new Error('EDITOR_TABS_OWNER_UNPROVEN');
}}}if(count!==1)throw new Error('EDITOR_TABS_ACTIVE_UNPROVEN');};
const valid=(value,expected)=>value?.uuid===PLAN.targetUuid&&value.project_uuid===PLAN.projectUuid&&value.source===''&&value.board===PLAN.boardUuid&&
(PLAN.kind==='pcb'?value.docType===3&&value.parent_uuid===''&&value.display_title===expected:value.display_name===expected);
const read=async(expected)=>{const value=(await bus.rpcCall('/PrjDB/'+PLAN.kind+'/getData',[PLAN.targetUuid,PLAN.projectUuid])).message;await context();if(!valid(value,expected))throw new Error('DOCUMENT_METADATA');
const owner=(await bus.rpcCall('/PrjDB/project/getData',[PLAN.projectUuid])).message;await context();if(owner?.uuid!==PLAN.projectUuid||owner.owner?.uuid!==PLAN.ownerUuid||owner.currentBranch!==PLAN.branchUuid||owner.isV2Format!==false||owner.archive||owner.store||owner.cbb_project)throw new Error('PROJECT_METADATA');};
${mode === "write" ? `await context();stage='before-read';await read(PLAN.beforeTitle);stage='closed-target';await closed();await context();clean();stage='rename';
const input=PLAN.kind==='pcb'?{uuid:PLAN.targetUuid,title:PLAN.desiredTitle}:{uuid:PLAN.targetUuid,name:PLAN.desiredTitle};
const result=(await bus.rpcCall('/PrjDB/'+PLAN.kind+'/updateData',[input,PLAN.projectUuid])).message;
if(result?.success!==true||!valid(result.result,PLAN.desiredTitle))throw new Error('ACK_INVALID');
// Retain this acknowledgment before any post-write observation can fail.
const json=JSON.stringify({kind:'project-document-rename',targetId:PLAN.targetUuid,createdId:null});` : `await context();stage='after-read';await read(PLAN.${expectedTitle === "before" ? "beforeTitle" : "desiredTitle"});stage='closed-target';await closed();await context();clean();
const json=JSON.stringify({kind:'project-document-rename-readback',targetId:PLAN.targetUuid,metadataVerified:true,targetClosed:true,childrenClosed:true});`}
return{schema:'easyeda-pro-control.exact-json.v1',utf8Bytes:new TextEncoder().encode(json).byteLength,json};
}catch(error){let code='EXCEPTION';try{const d=error!==null&&(typeof error==='object'||typeof error==='function')?Object.getOwnPropertyDescriptor(error,'message'):undefined;const m=d&&Object.hasOwn(d,'value')?d.value:undefined;if(typeof m==='string'&&${JSON.stringify(DOCUMENT_RENAME_NATIVE_GUARD_CODES)}.includes(m))code=m;}catch(_){};throw new Error('Closed document rename refused at '+stage+':'+code);}})()`;
}
export function buildDocumentContainerRenameExpression(input: DocumentContainerRenamePlan, context: ExpectedContext): string { return program(input, context, "write"); }
export function buildDocumentContainerRenameReadbackExpression(input: DocumentContainerRenamePlan, context: ExpectedContext, expectedTitle: "before" | "after" = "after"): string { return program(input, context, "readback", expectedTitle); }
export function validateDocumentContainerRenameReadback(value: unknown, input: DocumentContainerRenamePlan): Record<string, unknown> {
  const plan = documentContainerRenamePlanSchema.parse(input);
  return z.object({ kind: z.literal("project-document-rename-readback"), targetId: z.literal(plan.targetUuid), metadataVerified: z.literal(true), targetClosed: z.literal(true), childrenClosed: z.literal(true) }).strict().parse(value);
}
