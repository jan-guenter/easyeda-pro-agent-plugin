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
