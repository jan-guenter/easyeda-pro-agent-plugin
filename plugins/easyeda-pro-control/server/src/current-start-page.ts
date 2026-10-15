import { buildCurrentProjectUrlGuard } from "./current-project-url.ts";

/** Fixed current UI3823ed6e Start Page guard. The caller supplies root, apply,
 * own, method, methodCheck, bad and target.projectUuid. The returned closure
 * retains owners; it is neither launch provenance nor a startup barrier.
 */
export function buildCurrentStartPageGuard(): string {
  return [buildCurrentProjectUrlGuard(), String.raw`
const currentStartPage=(()=>{
 const ui=own(root,'UI'),host=own(root,'gVars'),tabs=own(ui,'tabBar'),project=own(host,'currentProject');
 const containerIds=own(tabs,'containerIds'),containerTree=own(tabs,'containerTree');
 const pending=own(host,'sessionStorageTabs'),setConstructor=own(root,'Set'),setPrototype=own(setConstructor,'prototype');
 const size=Object.getOwnPropertyDescriptor(setPrototype,'size')?.get;
 const location=root.location,href=location?.href,document=root.document,mode=own(root,'PRO_EDITOR_MODE');
 const version=own(root,'PRO_EDITOR_VERSION');
 if(version!=='3.2.206'||typeof tabs!=='function'||Object.getPrototypeOf(tabs)!==Function.prototype||typeof size!=='function')bad();
 if(!parseProjectUrl(href,target.projectUuid).empty)bad();
 const active=method(tabs,'getActiveTab'),container=method(tabs,'getContainerInfo');
 const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
 const plain=value=>{if(!object(value)||Object.getPrototypeOf(value)!==Object.prototype)bad();return value;};
 const text=(value,max,empty=false)=>{if(typeof value!=='string'||value.length>max||(!empty&&value.length===0)||/[\u0000-\u001F\u007F]/.test(value))bad();return value;};
 const dense=(value,max)=>{if(!Array.isArray(value)||Object.getPrototypeOf(value)!==Array.prototype)bad();const n=own(value,'length');if(!Number.isInteger(n)||n<0||n>max||Reflect.ownKeys(value).length!==n+1)bad();for(let i=0;i<n;i++)own(value,String(i));return n;};
 const base=()=>{
  if(root.window!==root||root.top!==root||root.location!==location||root.document!==document||document?.defaultView!==root||document?.nodeType!==9||document?.URL!==href||location?.href!==href||location?.origin!=='https://client')bad();
  if(!parseProjectUrl(href,target.projectUuid).empty||own(root,'PRO_EDITOR_MODE')!==mode||(mode!=='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'&&mode!=='CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM')||own(root,'PRO_EDITOR_VERSION')!==version)bad();
  if(own(root,'UI')!==ui||own(root,'gVars')!==host||own(ui,'gVars')!==host||own(ui,'tabBar')!==tabs||own(host,'currentProject')!==project||own(host,'sessionStorageTabs')!==pending)bad();
  if(own(tabs,'containerIds')!==containerIds||own(tabs,'containerTree')!==containerTree||own(tabs,'currentTabId')!=='tab_page1')bad();
  if(own(root,'Set')!==setConstructor||own(setConstructor,'prototype')!==setPrototype||Object.getPrototypeOf(pending)!==setPrototype||Object.getOwnPropertyDescriptor(setPrototype,'size')?.get!==size||apply(size,pending,[])!==0||Reflect.ownKeys(pending).length!==0)bad();
  if(own(host,'urlCmd')!==null||own(host,'isHistoryMode')!==false||own(tabs,'isOpenProjectDoc')!==true||own(tabs,'isOpenOtherDoc')!==true)bad();
  plain(project);if(own(project,'projectId',true)!==undefined)bad();const branch=own(project,'branchUuid',true);if(branch!==undefined&&branch!=='')bad();
  methodCheck(active);methodCheck(container);
 };
 const sample=()=>{
  base();const owners=[],ids=containerIds,n=dense(ids,128);if(n===0)bad();owners.push(ids);const names=[],registry=new Set();
  for(let i=0;i<n;i++){const id=text(own(ids,String(i)),256);if(registry.has(id))bad();registry.add(id);names.push(id);}
  const tree=containerTree,pendingNodes=[{node:tree,depth:0}],seen=new Set(),treeIds=new Set(),leaves=new Set(),treeProjection=[];
  if(own(tabs,'belongContainer')!=='editor-window-main'||own(tree,'id')!=='editor-window-main')bad();
  while(pendingNodes.length){const item=pendingNodes.pop(),node=plain(item.node);if(item.depth>16||seen.has(node)||seen.size>=255)bad();seen.add(node);owners.push(node);const id=text(own(node,'id'),256),children=own(node,'children',true);if(treeIds.has(id))bad();treeIds.add(id);treeProjection.push([id,item.depth]);
   if(children===undefined){if(!registry.has(id)||leaves.has(id))bad();leaves.add(id);}else{const count=dense(children,128);if(count===0||pendingNodes.length+seen.size+count>255)bad();owners.push(children);for(let i=count-1;i>=0;i--)pendingNodes.push({node:own(children,String(i)),depth:item.depth+1});}}
  if(leaves.size!==registry.size||apply(active.fn,tabs,[])!=='tab_page1')bad();base();
  const allIds=new Set(),projection=[];let count=0,start=0,placeholder=0;
  for(const id of names){const info=plain(apply(container.fn,tabs,[id]));base();owners.push(info);if(own(info,'id')!==id||own(info,'belong')!=='editor-window-main')bad();const list=own(info,'tabs'),length=dense(list,256);if(count+length>256)bad();count+=length;owners.push(list);const localActive=text(own(info,'activeTabId'),512,true),localIds=new Set(),rows=[];
   for(let i=0;i<length;i++){const tab=plain(own(list,String(i))),tabId=text(own(tab,'tabId'),512),data=plain(own(tab,'data'));owners.push(tab,data);if(allIds.has(tabId))bad();allIds.add(tabId);localIds.add(tabId);const isStart=tabId==='tab_page1',type=own(data,'doctype');
    if(!isStart&&tabId!=='0')bad();if(type!==(isStart?-1:0)||own(tab,'isAbleDelete')!==false||own(tab,'group')!=='start_blank'||own(tab,'draggable')!==isStart)bad();const hidden=own(tab,'isDisplayNone');if(typeof hidden!=='boolean'||(!isStart&&hidden!==true))bad();const declared=own(tab,'documentType',true);if(declared!==undefined&&declared!==type)bad();
    for(const key of ['pid','owner'])if(own(data,key,true)!==undefined)bad();for(const key of ['parentProjectUuid','parentLibraryUuid'])if(own(tab,key,true)!==undefined)bad();
    if(isStart){start++;if(localActive!=='tab_page1')bad();}else placeholder++;rows.push([tabId,type,hidden]);}
   if(localActive!==''&&!localIds.has(localActive))bad();projection.push([id,localActive,rows]);}
  if(start!==1||placeholder>1||count!==start+placeholder)bad();base();
  return{owners,identity:JSON.stringify([names,treeProjection,projection,own(project,'branchUuid',true)??null])};
 };
 const initial=sample();
 const check=()=>{const current=sample();if(current.identity!==initial.identity||current.owners.length!==initial.owners.length||current.owners.some((owner,index)=>owner!==initial.owners[index]))bad();};
 return{host,check};
})();
`].join("\n");
}
