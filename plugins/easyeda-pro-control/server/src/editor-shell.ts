import { z } from "zod";
import { EXACT_READ_ENVELOPE_SCHEMA } from "./exact-readers.ts";

export const EDITOR_SHELL_API_VERSION = "0.3.50.ab46409c";
export const EDITOR_SHELL_API_SHA256 = "021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76";
export const EDITOR_SHELL_UI_VERSION = "3.2.196.26ed3d6c";
export const EDITOR_SHELL_UI_SHA256 = "3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a";
export const EDITOR_SHELL_MAX_BYTES = 8192;
const MAX_CONTAINERS = 128;
const MAX_TABS = 256;
const MAX_TREE_NODES = 255;

export const editorShellRequestSchema = z.object({ action: z.literal("observe-editor-shell") }).strict();
export type EditorShellRequest = z.infer<typeof editorShellRequestSchema>;
export function parseEditorShellRequest(input: unknown): EditorShellRequest { return editorShellRequestSchema.parse(input); }

/** Counts of registered shell entries, not visibility, open-project or CAD proof. */
export const editorShellResultSchema = z.object({
  ok: z.literal(true), kind: z.literal("editor-shell-observation"), action: z.literal("observe-editor-shell"),
  containerCount: z.number().int().min(1).max(MAX_CONTAINERS),
  tabCount: z.number().int().min(0).max(MAX_TABS),
  startPagePresent: z.boolean(), startPageActive: z.boolean(), activeTabPresent: z.boolean(),
  placeholderTabCount: z.number().int().min(0).max(1), otherTabCount: z.number().int().min(0).max(MAX_TABS),
  visibilityVerified: z.literal(false), restorationCompletionVerified: z.literal(false),
  projectClosureVerified: z.literal(false), startupQualified: z.literal(false),
  cadAuthority: z.literal(false), persistenceVerified: z.literal(false),
}).strict().refine((value) => value.tabCount === Number(value.startPagePresent) + value.placeholderTabCount + value.otherTabCount &&
  (!value.startPageActive || value.startPagePresent && value.activeTabPresent) && (!value.activeTabPresent || value.tabCount > 0) &&
  (!value.activeTabPresent || value.startPageActive || value.placeholderTabCount + value.otherTabCount > 0));

const limitations = [
  "Registered editor-shell counts only. Other tabs are not classified as designs; no titles, paths, account identifiers, document identifiers or tab payloads are returned.",
  "Start Page presence and active identity do not prove native window visibility, completed restoration, project closure, safe startup, CAD authority or persistence.",
  "Two identical bounded samples retain frame, UI, tab-manager, container/tree/array and tab-object owners. A matching observation is not an atomic guard for a later action.",
  "The fixed native getters read current tab identity and container references only. No public deep-clone getter, project manager, RPC, navigation, settings, files, Save or callbacks are invoked in the editor.",
  "Bounds are 128 containers, 256 tabs, 255 tree nodes, depth 16 and 8192 output UTF-8 bytes. Missing, inconsistent, changed or oversized state refuses without truncation.",
] as const;

export const editorShellQuerySchema = z.object({ includeSchemas: z.boolean().default(false) }).strict();
export function queryEditorShell(input: unknown = {}): Record<string, unknown> {
  const query = editorShellQuerySchema.parse(input);
  return { offline: true, invocationEnabledByDiscovery: false, total: 1, entries: [{
    action: "observe-editor-shell", effect: "registered-editor-shell-read", invocationEnabledByDiscovery: false,
    ...(query.includeSchemas ? { inputSchema: z.toJSONSchema(editorShellRequestSchema), resultSchema: z.toJSONSchema(editorShellResultSchema) } : {}),
    limitations: [...limitations], provenance: { apiVersion: EDITOR_SHELL_API_VERSION, apiSha256: EDITOR_SHELL_API_SHA256,
      uiVersion: EDITOR_SHELL_UI_VERSION, uiSha256: EDITOR_SHELL_UI_SHA256, implementationKind: "fixed-native-shell-observer", liveValidation: "not-recorded" },
  }] };
}

export function validateEditorShellArguments(input: unknown): Record<string, unknown> {
  const result = editorShellRequestSchema.safeParse(input);
  return result.success ? { valid: true, request: result.data, executionAuthorized: false } : {
    valid: false, executionAuthorized: false,
    issues: result.error.issues.slice(0, 16).map((issue) => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}

/** The current UI exports a class with static data/methods as UI.tabBar.
 * Deliberately do not traverse tab titles, raw data or project state.
 */
export function buildEditorShellProgram(input: unknown): string {
  parseEditorShellRequest(input);
  return `try{
const root=globalThis,apply=Reflect.apply;
const bad=()=>{throw new Error('EDITOR_SHELL_READ_FAILED');};
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const own=(owner,key,optional=false)=>{
 if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad();
 const d=Object.getOwnPropertyDescriptor(owner,key);
 if(!d){if(optional&&!(key in owner))return undefined;bad();}
 if(!Object.hasOwn(d,'value'))bad();return d.value;
};
const plain=value=>{if(!object(value)||Object.getPrototypeOf(value)!==Object.prototype)bad();return value;};
const string=(value,max,empty=false)=>{if(typeof value!=='string'||(!empty&&value.length===0)||value.length>max||/[\\u0000-\\u001F\\u007F]/.test(value))bad();return value;};
const dense=(value,max)=>{if(!Array.isArray(value)||Object.getPrototypeOf(value)!==Array.prototype)bad();const n=own(value,'length');if(!Number.isInteger(n)||n<0||n>max||Reflect.ownKeys(value).length!==n+1)bad();for(let i=0;i<n;i++)own(value,String(i));return n;};
const fn=(owner,key)=>{const value=own(owner,key);if(typeof value!=='function')bad();return value;};
const location=root.location,href=location?.href,document=root.document;
const mode=own(root,'PRO_EDITOR_MODE'),ui=own(root,'UI'),host=own(root,'gVars'),tabs=own(ui,'tabBar');
if(typeof tabs!=='function'||Object.getPrototypeOf(tabs)!==Function.prototype)bad();
const active=fn(tabs,'getActiveTab'),container=fn(tabs,'getContainerInfo');
const edaOwner=eda,bridgeUuid='7e06d286b1ac846ef7eab9c7f2a9ee40';
const check=()=>{
 if(root.top!==root||root.window!==root||root.location!==location||root.document!==document||document?.defaultView!==root||document?.nodeType!==9||document?.URL!==href||location?.href!==href||location?.origin!=='https://client')bad();
 if(typeof href!=='string'||!/^https:\\/\\/client\\/editor\\?cll=(?:trace|debug|info|warn|error)#?$/.test(href))bad();
 if(own(root,'PRO_EDITOR_MODE')!==mode||(mode!=='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'&&mode!=='CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'))bad();
 if(own(root,'UI')!==ui||own(root,'gVars')!==host||own(ui,'gVars')!==host||own(ui,'tabBar')!==tabs||Object.getPrototypeOf(tabs)!==Function.prototype||fn(tabs,'getActiveTab')!==active||fn(tabs,'getContainerInfo')!==container||eda!==edaOwner||own(edaOwner,'extensionUuid')!==bridgeUuid)bad();
};
const sample=()=>{
 check();const owners=[],ids=own(tabs,'containerIds'),n=dense(ids,${MAX_CONTAINERS});if(n===0)bad();owners.push(ids);
 const names=[],registry=new Set();for(let i=0;i<n;i++){const id=string(own(ids,String(i)),256);if(registry.has(id))bad();registry.add(id);names.push(id);}
 const tree=own(tabs,'containerTree'),pending=[{node:tree,depth:0}],seen=new Set(),treeIds=new Set(),leaves=new Set(),treeProjection=[];
 if(own(tabs,'belongContainer')!=='editor-window-main'||own(tree,'id')!=='editor-window-main')bad();
 while(pending.length){const item=pending.pop(),node=plain(item.node);if(item.depth>16||seen.has(node)||seen.size>=${MAX_TREE_NODES})bad();seen.add(node);owners.push(node);
  const id=string(own(node,'id'),256),children=own(node,'children',true);if(treeIds.has(id))bad();treeIds.add(id);treeProjection.push([id,item.depth]);
  if(children===undefined){if(!registry.has(id)||leaves.has(id))bad();leaves.add(id);}else{const count=dense(children,${MAX_CONTAINERS});if(count===0||pending.length+seen.size+count>${MAX_TREE_NODES})bad();owners.push(children);for(let i=count-1;i>=0;i--)pending.push({node:own(children,String(i)),depth:item.depth+1});}
 }
 if(leaves.size!==registry.size)bad();
 const current=string(own(tabs,'currentTabId'),512,true);if(apply(active,tabs,[])!==current)bad();check();
 const tabIds=new Set(),containerProjection=[];let start=0,placeholder=0,other=0,total=0,currentCount=0;
 for(const id of names){check();const info=plain(apply(container,tabs,[id]));check();owners.push(info);
  if(own(info,'id')!==id||own(info,'belong')!=='editor-window-main')bad();
  const list=own(info,'tabs'),count=dense(list,${MAX_TABS});if(total+count>${MAX_TABS})bad();total+=count;owners.push(list);
  const localActive=string(own(info,'activeTabId'),512,true),localIds=new Set(),projection=[];
  for(let i=0;i<count;i++){const tab=plain(own(list,String(i))),tabId=string(own(tab,'tabId'),512);owners.push(tab);if(tabIds.has(tabId))bad();tabIds.add(tabId);localIds.add(tabId);
   let kind='other';if(tabId==='tab_page1'||tabId==='0'){
    const data=plain(own(tab,'data'));owners.push(data);const startTab=tabId==='tab_page1';
    if(own(data,'doctype')!==(startTab?-1:0)||own(tab,'isAbleDelete')!==false||own(tab,'group')!=='start_blank'||own(tab,'draggable')!==startTab)bad();
    const hidden=own(tab,'isDisplayNone');if(typeof hidden!=='boolean'||(!startTab&&hidden!==true))bad();
    const declared=own(tab,'documentType',true);if(declared!==undefined&&declared!==(startTab?-1:0))bad();
    for(const key of ['pid','owner'])if(own(data,key,true)!==undefined)bad();
    for(const key of ['parentProjectUuid','parentLibraryUuid'])if(own(tab,key,true)!==undefined)bad();
    if(startTab){start++;kind='start';}else{placeholder++;kind='placeholder';}
   }else other++;
   if(tabId===current){currentCount++;if(localActive!==current)bad();}
   projection.push([tabId,kind]);
  }
  if(localActive!==''&&!localIds.has(localActive))bad();containerProjection.push([id,localActive,projection]);
 }
 if(start>1||placeholder>1||(current===''?currentCount!==0:currentCount!==1))bad();check();
 return {owners,identity:JSON.stringify([names,treeProjection,containerProjection,current]),value:{ok:true,kind:'editor-shell-observation',action:'observe-editor-shell',containerCount:n,tabCount:total,startPagePresent:start===1,startPageActive:current==='tab_page1',activeTabPresent:currentCount===1,placeholderTabCount:placeholder,otherTabCount:other,visibilityVerified:false,restorationCompletionVerified:false,projectClosureVerified:false,startupQualified:false,cadAuthority:false,persistenceVerified:false}};
};
const first=sample();await Promise.resolve();check();const second=sample();
if(first.identity!==second.identity||first.owners.length!==second.owners.length||first.owners.some((owner,index)=>owner!==second.owners[index])||JSON.stringify(first.value)!==JSON.stringify(second.value))bad();check();
const json=JSON.stringify(first.value),utf8Bytes=new TextEncoder().encode(json).byteLength,envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};
if(utf8Bytes>${EDITOR_SHELL_MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${EDITOR_SHELL_MAX_BYTES})bad();return envelope;
}catch{throw new Error('EDITOR_SHELL_READ_FAILED');}`;
}

export function validateEditorShellResult(input: unknown, raw: unknown): Record<string, unknown> {
  parseEditorShellRequest(input);
  const payload = editorShellResultSchema.parse(raw);
  if (Buffer.byteLength(JSON.stringify(payload), "utf8") > EDITOR_SHELL_MAX_BYTES) { throw new Error("Editor-shell result exceeds its byte bound."); }
  return { ...payload, effect: "registered-editor-shell-read", authority: "shell-observation-only;not-cad-persistence-or-startup-authorization",
    apiVersion: EDITOR_SHELL_API_VERSION, apiSha256: EDITOR_SHELL_API_SHA256,
    uiVersion: EDITOR_SHELL_UI_VERSION, uiSha256: EDITOR_SHELL_UI_SHA256, limitations: [...limitations] };
}
