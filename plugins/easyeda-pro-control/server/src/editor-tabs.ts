import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { EXACT_READ_ENVELOPE_SCHEMA, decodeExactReadEnvelope } from "./exact-readers.ts";

const field = z.object({ kind: z.enum(["undefined", "null", "string", "number", "boolean", "object", "array", "other"]),
  value: z.union([z.string().max(512), z.number(), z.boolean()]).optional() }).strict();
const context = z.object({ projectUuid: field, projectUuidAlias: field, documentUuid: field, documentUuidAlias: field,
  documentType: field, tabId: field, parentProjectUuid: field, parentLibraryUuid: field }).strict();
const tab = z.object({ object: field, tabId: field, documentType: field, isAbleDelete: field, parentProjectUuid: field,
  parentLibraryUuid: field, data: field, dataDoctype: field, dataPid: field, dataOwner: field }).strict();
const tabNodeSchema = z.object({ index: z.number().int().nonnegative().max(127), parentIndex: z.number().int().nonnegative().max(127).nullable(),
    depth: z.number().int().nonnegative().max(16), object: field, id: field, children: field, childCount: z.number().int().nonnegative().max(128).nullable(),
    tabs: field, tabCount: z.number().int().nonnegative().max(256).nullable(), items: z.array(tab).max(256) }).strict();
export const editorTabsSnapshotSchema = z.object({ schema: z.literal("easyeda-pro-control.editor-tabs.v1"), contextBefore: context, contextAfter: context,
  nodes: z.array(tabNodeSchema).min(1).max(128) }).strict();
export type EditorTabsSnapshot = z.infer<typeof editorTabsSnapshotSchema>;

/** Mutation precondition, stricter than the diagnostic projection below.
 * Enumerate every bounded tree node and tab before accepting target absence.
 */
export function buildEditorTargetAbsentExpression(input: { targetUuid: string; projectUuid: string; ownerUuid: string; active: { uuid: string; documentType: number; tabId: string } }): string {
  const identity = z.string().min(1).max(256).regex(/^[a-z0-9_-]+$/iu);
  const active = z.object({ uuid: identity, documentType: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    // oxlint-disable-next-line eslint/no-control-regex -- Native tab identities must not contain control characters.
    tabId: z.string().min(1).max(512).regex(/^[^\u0000-\u001F]+$/u) }).strict();
  const scope = z.object({ targetUuid: identity, projectUuid: identity, ownerUuid: identity, active }).strict().parse(input);
  if (scope.active.uuid === scope.targetUuid || scope.active.tabId.split("@")[0] !== scope.active.uuid) { throw new Error("Closed-target proof requires one exact different active tab."); }
  return `(async()=>{
const scope=${JSON.stringify(scope)},editor=eda.dmt_EditorControl;
if(typeof editor?.getSplitScreenTree!=='function')throw new Error('EDITOR_TABS_API_MISSING');
const tree=await editor.getSplitScreenTree(),pending=[{value:tree,depth:0}],seen=new Set(),tabIds=new Set();let tabCount=0,activeCount=0;
while(pending.length){const item=pending.pop(),node=item.value;
if(!node||typeof node!=='object'||Array.isArray(node)||seen.has(node)||item.depth>16||seen.size>=128)throw new Error('EDITOR_TABS_TREE_BOUND');
seen.add(node);
if(node.children!==undefined){
if(!Array.isArray(node.children)||node.children.length===0||node.children.length>128||node.tabs!==undefined||pending.length+node.children.length+seen.size>128)throw new Error('EDITOR_TABS_TREE_SHAPE');
for(const child of node.children)pending.push({value:child,depth:item.depth+1});
}else{
if(!Array.isArray(node.tabs)||node.tabs.length>256)throw new Error('EDITOR_TABS_TREE_SHAPE');
if(node.tabs.length===0)throw new Error('EDITOR_TABS_INCOMPLETE');
for(const tab of node.tabs){tabCount+=1;
if(tabCount>256||!tab||typeof tab!=='object'||Array.isArray(tab)||typeof tab.tabId!=='string'||!tab.tabId||tab.tabId.length>512||/[\\x00-\\x1f]/.test(tab.tabId))throw new Error('EDITOR_TABS_TAB_SHAPE');
if(tabIds.has(tab.tabId))throw new Error('EDITOR_TABS_TAB_SHAPE');tabIds.add(tab.tabId);
const data=tab.data;
if(data!==undefined&&(!data||typeof data!=='object'||Array.isArray(data)))throw new Error('EDITOR_TABS_TAB_SHAPE');
if(tab.documentType!==undefined&&data?.doctype!==undefined&&tab.documentType!==data.doctype)throw new Error('EDITOR_TABS_TAB_SHAPE');
const type=tab.documentType??data?.doctype,id=tab.tabId.split('@')[0];
const start=tab.tabId==='tab_page1'&&type===-1&&tab.isAbleDelete===false&&tab.parentProjectUuid===undefined&&tab.parentLibraryUuid===undefined&&data?.pid===undefined&&data?.owner===undefined;
const owned=[1,2,3,4].includes(type)&&id&&
(tab.parentProjectUuid===undefined||tab.parentProjectUuid===scope.projectUuid)&&(data?.pid===undefined||data.pid===scope.projectUuid)&&
([2,4].includes(type)?tab.tabId===id+'@'+scope.projectUuid&&(tab.parentLibraryUuid===scope.ownerUuid||data?.owner===scope.ownerUuid)&&(tab.parentLibraryUuid===undefined||tab.parentLibraryUuid===scope.ownerUuid)&&(data?.owner===undefined||data.owner===scope.ownerUuid):
(tab.parentProjectUuid===scope.projectUuid||data?.pid===scope.projectUuid)&&tab.parentLibraryUuid===undefined&&(data?.owner===undefined||data.owner===scope.ownerUuid));
if(!start&&!owned)throw new Error('EDITOR_TABS_OWNER_UNPROVEN');
if(id===scope.targetUuid)throw new Error('EDITOR_TARGET_ALREADY_OPEN');
if(tab.tabId===scope.active.tabId||id===scope.active.uuid){
if(!owned||id!==scope.active.uuid||type!==scope.active.documentType||tab.tabId!==scope.active.tabId)throw new Error('EDITOR_TABS_ACTIVE_UNPROVEN');
activeCount+=1;}
}}
}if(activeCount!==1)throw new Error('EDITOR_TABS_ACTIVE_UNPROVEN');return {targetClosed:true};})()`;
}

/** Diagnostic projection only. No title, design source, callback or caller API
 * enters this fixed read. Node/field kinds preserve missing versus null data.
 */
export function buildEditorTabsReadCode(projectUuid: string): string {
  if (!/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u.test(projectUuid)) { throw new Error("Editor-tab inspection needs one exact project UUID."); }
  return `return await (async()=>{
const expectedProject=${JSON.stringify(projectUuid)};
const project=eda.dmt_Project,select=eda.dmt_SelectControl,editor=eda.dmt_EditorControl;
if(typeof project?.getCurrentProjectInfo!=='function'||typeof select?.getCurrentDocumentInfo!=='function'||typeof editor?.getSplitScreenTree!=='function')throw new Error('EDITOR_TABS_API_MISSING');
const field=value=>{const kind=value===undefined?'undefined':value===null?'null':Array.isArray(value)?'array':['string','number','boolean','object'].includes(typeof value)?typeof value:'other';
if(kind==='string'&&(value.length>512||/[\\x00-\\x1f]/.test(value))||kind==='number'&&!Number.isFinite(value))throw new Error('EDITOR_TABS_FIELD_BOUND');
return ['string','number','boolean'].includes(kind)?{kind,value}:{kind};};
const capture=async()=>{const p=await project.getCurrentProjectInfo(),d=await select.getCurrentDocumentInfo();
if(p?.uuid!==undefined&&p.uuid!==expectedProject||p?.projectUuid!==undefined&&p.projectUuid!==expectedProject)throw new Error('EDITOR_TABS_PROJECT_DRIFT');
return{projectUuid:field(p?.uuid),projectUuidAlias:field(p?.projectUuid),documentUuid:field(d?.uuid),documentUuidAlias:field(d?.documentUuid),documentType:field(d?.documentType),tabId:field(d?.tabId),parentProjectUuid:field(d?.parentProjectUuid),parentLibraryUuid:field(d?.parentLibraryUuid)};};
const contextBefore=await capture(),tree=await editor.getSplitScreenTree();
const pending=[{value:tree,parentIndex:null,depth:0}],seen=new Set(),nodes=[];let tabCount=0;
while(pending.length){const item=pending.shift(),node=item.value,index=nodes.length;
if(index>=128||item.depth>16||node&&typeof node==='object'&&seen.has(node))throw new Error('EDITOR_TABS_TREE_BOUND');
if(node&&typeof node==='object')seen.add(node);
const children=node?.children,tabs=node?.tabs,items=[];
if(Array.isArray(tabs)){tabCount+=tabs.length;if(tabCount>256)throw new Error('EDITOR_TABS_TREE_BOUND');
for(const t of tabs){const data=t?.data;items.push({object:field(t),tabId:field(t?.tabId),documentType:field(t?.documentType),isAbleDelete:field(t?.isAbleDelete),parentProjectUuid:field(t?.parentProjectUuid),parentLibraryUuid:field(t?.parentLibraryUuid),data:field(data),dataDoctype:field(data?.doctype),dataPid:field(data?.pid),dataOwner:field(data?.owner)});}}
nodes.push({index,parentIndex:item.parentIndex,depth:item.depth,object:field(node),id:field(node?.id),children:field(children),childCount:Array.isArray(children)?children.length:null,tabs:field(tabs),tabCount:Array.isArray(tabs)?tabs.length:null,items});
if(Array.isArray(children)){if(children.length>128||pending.length+children.length+nodes.length>128)throw new Error('EDITOR_TABS_TREE_BOUND');for(const child of children)pending.push({value:child,parentIndex:index,depth:item.depth+1});}}
const contextAfter=await capture();if(JSON.stringify(contextBefore)!==JSON.stringify(contextAfter))throw new Error('EDITOR_TABS_CONTEXT_DRIFT');
const json=JSON.stringify({schema:'easyeda-pro-control.editor-tabs.v1',contextBefore,contextAfter,nodes}),utf8Bytes=new TextEncoder().encode(json).length;
if(utf8Bytes>131072)throw new Error('EDITOR_TABS_OUTPUT_BOUND');
return{schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};})()`;
}

export function parseEditorTabsRead(value: unknown): EditorTabsSnapshot {
  const result = editorTabsSnapshotSchema.parse(decodeExactReadEnvelope(value));
  if (canonicalJson(result.contextBefore) !== canonicalJson(result.contextAfter) || result.nodes.reduce((count, node) => count + node.items.length, 0) > 256) {
    throw new Error("Editor-tab inspection changed context or exceeded its bound.");
  }
  return result;
}
