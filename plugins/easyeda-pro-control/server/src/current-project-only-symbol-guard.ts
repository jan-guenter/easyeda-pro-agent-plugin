import { buildCurrentProjectUrlGuard } from "./current-project-url.ts";

/** Fixed loaded-project counterpart to current-start-page. The native Start and
 * hidden blank registry rows are not editor documents. UI3823ed6e creates five
 * static body children; any editor marker, export iframe or blank editor pool
 * refuses. Requires root/apply/own/method/methodCheck/bad/target/expired.
 * This observes cached read-only state, never library permission or a lock.
 */
export function buildCurrentProjectOnlySymbolGuard(): string {
  return [buildCurrentProjectUrlGuard(), String.raw`
const projectOnly=(()=>{
 const ui=own(root,'UI'),host=own(root,'gVars'),tabs=own(ui,'tabBar'),project=own(host,'currentProject'),permission=own(ui,'concurrentDesign');
 const containerIds=own(tabs,'containerIds'),containerTree=own(tabs,'containerTree');
 const pending=own(host,'sessionStorageTabs'),setConstructor=own(root,'Set'),setPrototype=own(setConstructor,'prototype');
 const size=Object.getOwnPropertyDescriptor(setPrototype,'size')?.get;
 const location=root.location,href=location?.href,document=root.document,mode=own(root,'PRO_EDITOR_MODE'),navigator=root.navigator,serviceWorker=navigator?.serviceWorker;
 const select=document?.querySelectorAll,version=own(root,'PRO_EDITOR_VERSION');
 if(version!=='3.2.206'||typeof tabs!=='function'||Object.getPrototypeOf(tabs)!==Function.prototype||typeof size!=='function'||typeof select!=='function'||!serviceWorker||serviceWorker.controller!==null)bad();
 const parsedUrl=parseProjectUrl(href,target.projectUuid);if(parsedUrl.tabIds.length!==0)bad();
 const active=method(tabs,'getActiveTab'),container=method(tabs,'getContainerInfo'),dirty=method(tabs,'hasTabUnSaved'),tabDirty=method(tabs,'isTabUnSaved');
 const permissionPrototype=Object.getPrototypeOf(permission),concurrentDescriptor=Object.getOwnPropertyDescriptor(permissionPrototype,'isConcurrentStrictMode');
 if(Object.hasOwn(permission,'isConcurrentStrictMode')||!concurrentDescriptor||typeof concurrentDescriptor.get!=='function'||typeof concurrentDescriptor.set!=='function')bad();
 const concurrentGet=concurrentDescriptor.get,concurrentSet=concurrentDescriptor.set;
 // UI15176271: in nonconcurrent mode this reads cached project/tab read-only
 // state and returns disable:false. No canAddLib RPC or denial dialog.
 const disabled=method(permission,'getIframeDisableStatusPanelPcb');
 const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
 const plain=value=>{if(!object(value)||Object.getPrototypeOf(value)!==Object.prototype)bad();return value;};
 const text=(value,max,empty=false)=>{if(typeof value!=='string'||value.length>max||(!empty&&value.length===0)||/[\u0000-\u001f\u007f]/.test(value))bad();return value;};
 const dense=(value,max)=>{if(!Array.isArray(value)||Object.getPrototypeOf(value)!==Array.prototype)bad();const n=own(value,'length');if(!Number.isInteger(n)||n<0||n>max||Reflect.ownKeys(value).length!==n+1)bad();for(let i=0;i<n;i++)own(value,String(i));return n;};
 const base=()=>{
  if(expired||root.window!==root||root.top!==root||root.location!==location||root.document!==document||document?.defaultView!==root||document?.nodeType!==9||document?.URL!==href||location?.href!==href||location?.origin!=='https://client')bad();
  const url=parseProjectUrl(href,target.projectUuid);if(url.tabIds.length!==0||own(root,'PRO_EDITOR_MODE')!==mode||(mode!=='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'&&mode!=='CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM')||own(root,'PRO_EDITOR_VERSION')!==version)bad();
  if(own(root,'UI')!==ui||own(root,'gVars')!==host||own(ui,'gVars')!==host||own(ui,'tabBar')!==tabs||own(host,'currentProject')!==project||own(ui,'concurrentDesign')!==permission||own(host,'sessionStorageTabs')!==pending)bad();
  if(own(tabs,'containerIds')!==containerIds||own(tabs,'containerTree')!==containerTree||document.querySelectorAll!==select)bad();
  if(own(root,'Set')!==setConstructor||own(setConstructor,'prototype')!==setPrototype||Object.getPrototypeOf(pending)!==setPrototype||Object.getOwnPropertyDescriptor(setPrototype,'size')?.get!==size||apply(size,pending,[])!==0||Reflect.ownKeys(pending).length!==0)bad();
  if(own(host,'urlCmd')!==null||own(host,'isHistoryMode')!==false||own(tabs,'isOpenProjectDoc')!==true||own(tabs,'isOpenOtherDoc')!==true)bad();
  plain(project);if(own(project,'projectId')!==target.projectUuid||own(project,'branchUuid')!==target.branchUuid||own(project,'isV2Format')!==false)bad();
  if(root.navigator!==navigator||navigator.serviceWorker!==serviceWorker||serviceWorker.controller!==null||own(permission,'_isConcurrentStrictMode')!==false)bad();
  const currentConcurrent=Object.getOwnPropertyDescriptor(permissionPrototype,'isConcurrentStrictMode');
  if(Object.getPrototypeOf(permission)!==permissionPrototype||Object.hasOwn(permission,'isConcurrentStrictMode')||currentConcurrent?.get!==concurrentGet||currentConcurrent?.set!==concurrentSet||apply(concurrentGet,permission,[])!==false)bad();
  for(const binding of [active,container,dirty,tabDirty,disabled])methodCheck(binding);
 };
 const sample=()=>{
  base();const owners=[containerIds],names=[],registered=new Set(),n=dense(containerIds,128);if(n===0)bad();
  for(let i=0;i<n;i++){const id=text(own(containerIds,String(i)),256);if(registered.has(id))bad();registered.add(id);names.push(id);}
  const nodes=[{node:containerTree,depth:0}],seen=new Set(),treeIds=new Set(),leaves=new Set(),treeProjection=[];
  if(own(tabs,'belongContainer')!=='editor-window-main'||own(containerTree,'id')!=='editor-window-main')bad();
  while(nodes.length){const item=nodes.pop(),node=plain(item.node);if(item.depth>16||seen.has(node)||seen.size>=255)bad();seen.add(node);owners.push(node);const id=text(own(node,'id'),256),children=own(node,'children',true);if(treeIds.has(id))bad();treeIds.add(id);treeProjection.push([id,item.depth]);
   if(children===undefined){if(!registered.has(id)||leaves.has(id))bad();leaves.add(id);}else{const count=dense(children,128);if(count===0||nodes.length+seen.size+count>255)bad();owners.push(children);for(let i=count-1;i>=0;i--)nodes.push({node:own(children,String(i)),depth:item.depth+1});}}
  if(leaves.size!==registered.size)bad();const current=own(tabs,'currentTabId');if((current!=='tab_page1'&&current!=='0')||apply(active.fn,tabs,[])!==current)bad();base();
  const allIds=new Set(),projection=[];let count=0,start=0,blank=0,currentCount=0;
  for(const id of names){const info=plain(apply(container.fn,tabs,[id]));base();owners.push(info);if(own(info,'id')!==id||own(info,'belong')!=='editor-window-main')bad();const list=own(info,'tabs'),length=dense(list,256),localActive=text(own(info,'activeTabId'),512,true),localIds=new Set(),rows=[];owners.push(list);if(count+length>256)bad();count+=length;
   for(let i=0;i<length;i++){const tab=plain(own(list,String(i))),tabId=text(own(tab,'tabId'),512),data=plain(own(tab,'data'));owners.push(tab,data);if(allIds.has(tabId))bad();allIds.add(tabId);localIds.add(tabId);const isStart=tabId==='tab_page1',type=own(data,'doctype');if(!isStart&&tabId!=='0')bad();
    if(type!==(isStart?-1:0)||own(tab,'isAbleDelete')!==false||own(tab,'group')!=='start_blank'||own(tab,'draggable')!==isStart)bad();const hidden=own(tab,'isDisplayNone');if(typeof hidden!=='boolean'||(!isStart&&hidden!==true))bad();const declared=own(tab,'documentType',true);if(declared!==undefined&&declared!==type)bad();
    for(const key of ['pid','owner'])if(own(data,key,true)!==undefined)bad();for(const key of ['parentProjectUuid','parentLibraryUuid'])if(own(tab,key,true)!==undefined)bad();
    for(const entry of [tab,data])for(const key of ['isUnSaved','isReadOnlyMode']){const value=own(entry,key,true);if(value!==undefined&&value!==false)bad();}
    if(apply(tabDirty.fn,tabs,[tabId])!==false)bad();base();
    if(isStart)start++;else blank++;if(tabId===current){currentCount++;if(localActive!==current)bad();}rows.push([tabId,type,hidden]);}
   if(localActive!==''&&!localIds.has(localActive))bad();projection.push([id,localActive,rows]);}
  if(start!==1||blank>1||count!==start+blank||currentCount!==1||apply(dirty.fn,tabs,[])!==false)bad();base();
  const permissionResult=plain(apply(disabled.fn,permission,[current]));if(own(permissionResult,'disable')!==false)bad();base();
  const bodies=apply(select,document,['[id="tabbar_bodies"]']);if(bodies.length!==1)bad();const bodyRoot=bodies[0],children=bodyRoot?.children;
  if(bodyRoot.tagName!=='DIV'||bodyRoot.ownerDocument!==document||bodyRoot.isConnected!==true||children?.length!==5)bad();owners.push(bodyRoot,children);
  const staticIds=new Set(['commandWin','exitSmartSizeTool','exitPadShapeTool','project-blank-page','assembly-variant-page']),bodyIds=new Set();
  for(const body of children){const getAttribute=body?.getAttribute;if(body.tagName!=='DIV'||body.ownerDocument!==document||body.isConnected!==true||body.parentElement!==bodyRoot||typeof getAttribute!=='function'||!staticIds.has(body.id)||bodyIds.has(body.id))bad();bodyIds.add(body.id);owners.push(body,getAttribute);if(apply(getAttribute,body,['uuid'])!==null)bad();}
  if(bodyIds.size!==5)bad();
  for(const selector of ['.editframe,[c_doctype],[c_dbid],[id^="frame_"],iframe[src*="entry="],[blankIframe],[pcb-canvas]','iframe','.blankIframeDiv'])if(apply(select,document,[selector]).length!==0)bad();
  base();return{owners,current,identity:JSON.stringify([names,treeProjection,projection,current])};
 };
 const initial=sample();
 const check=()=>{const value=sample();if(value.identity!==initial.identity||value.owners.length!==initial.owners.length||value.owners.some((owner,index)=>owner!==initial.owners[index]))bad();};
 return{host,ui,check,currentTabId:initial.current};
})();
`].join("\n");
}
