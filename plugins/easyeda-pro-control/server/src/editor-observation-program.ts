import { EXACT_READ_ENVELOPE_SCHEMA } from "./exact-readers.ts";

const MAX_CONTAINERS = 128;
const MAX_TABS = 256;
const MAX_TREE_NODES = 255;
const EDITOR_OBSERVATION_MAX_BYTES = 8192;

const contextProjection = `
 const observedIdentity=(record,key,empty)=>{const descriptor=Object.getOwnPropertyDescriptor(record,key);if(!descriptor){if(key in record)bad();return {state:'absent'};}if(!Object.hasOwn(descriptor,'value'))bad();const value=descriptor.value;if(value===undefined)return {state:'undefined'};if(value===''&&empty)return {state:'empty'};if(typeof value!=='string'||!/^[a-f0-9]{32}$/.test(value))bad();return {state:'value',value};};
 const projectOwner=plain(own(host,'currentProject'));owners.push(projectOwner);
 const project=observedIdentity(projectOwner,'projectId',false),branch=observedIdentity(projectOwner,'branchUuid',true);
 if(branch.state==='value'&&project.state!=='value')bad();
 let activeContext={state:'none'},contextIdentity=[];
 if(current==='tab_page1')activeContext={state:'start-page'};else if(current==='0')activeContext={state:'placeholder'};else if(current!==''){
  const data=plain(own(currentTab,'data'));owners.push(data);const documentType=own(data,'doctype');
  if(!Number.isSafeInteger(documentType)||documentType<1||documentType>32)bad();contextIdentity.push(documentType);
  if(documentType!==1&&documentType!==3)activeContext={state:'unsupported',reason:'document-type'};
  else{
   const match=/^([a-f0-9]{16}|[a-f0-9]{32})@([a-f0-9]{32})$/.exec(current);
   if(!match)activeContext={state:'unsupported',reason:'tab-identity'};
   else{const pid=own(data,'pid');if(typeof pid!=='string'||!/^[a-f0-9]{32}$/.test(pid)||pid!==match[2]||project.state!=='value'||project.value!==pid)bad();contextIdentity.push(pid);
    activeContext={state:'document',documentType,documentUuid:match[1],projectUuid:pid,tabId:match[1]+'@'+pid};
   }
  }
 }
 check();
 const contextValue={ok:true,kind:'editor-context-observation',action:'observe-editor-context',active:activeContext,project,branch,visibilityVerified:false,inputFocusVerified:false,restorationCompletionVerified:false,projectClosureVerified:false,startupQualified:false,cadAuthority:false,persistenceVerified:false};
`;

/** Fixed native shell traversal shared by two compiled metadata projections.
 * Mode is selected by maintained callers, never by a public tool argument.
 */
export function buildEditorObservationProgram(mode: "shell" | "context"): string {
  const context = mode === "context";
  const error = context ? "EDITOR_CONTEXT_READ_FAILED" : "EDITOR_SHELL_READ_FAILED";
  return `try{
const root=globalThis,apply=Reflect.apply;
const bad=()=>{throw new Error(${JSON.stringify(error)});};
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
 const tabIds=new Set(),containerProjection=[];let start=0,placeholder=0,other=0,total=0,currentCount=0,currentTab=null;
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
   if(tabId===current){currentCount++;currentTab=tab;if(localActive!==current)bad();}
   projection.push([tabId,kind]);
  }
  if(localActive!==''&&!localIds.has(localActive))bad();containerProjection.push([id,localActive,projection]);
 }
 if(start>1||placeholder>1||(current===''?currentCount!==0:currentCount!==1))bad();check();
${context ? contextProjection : ""}
 return {owners,identity:JSON.stringify([names,treeProjection,containerProjection,current${context ? ",contextIdentity" : ""}]),value:${context ? "contextValue" : "{ok:true,kind:'editor-shell-observation',action:'observe-editor-shell',containerCount:n,tabCount:total,startPagePresent:start===1,startPageActive:current==='tab_page1',activeTabPresent:currentCount===1,placeholderTabCount:placeholder,otherTabCount:other,visibilityVerified:false,restorationCompletionVerified:false,projectClosureVerified:false,startupQualified:false,cadAuthority:false,persistenceVerified:false}"}};
};
const first=sample();await Promise.resolve();check();const second=sample();
if(first.identity!==second.identity||first.owners.length!==second.owners.length||first.owners.some((owner,index)=>owner!==second.owners[index])||JSON.stringify(first.value)!==JSON.stringify(second.value))bad();check();
const json=JSON.stringify(first.value),utf8Bytes=new TextEncoder().encode(json).byteLength,envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};
if(utf8Bytes>${EDITOR_OBSERVATION_MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${EDITOR_OBSERVATION_MAX_BYTES})bad();return envelope;
}catch{throw new Error(${JSON.stringify(error)});}`;
}

