import { CURRENT_SYMBOL_METADATA_MAX_BYTES, parseCurrentSymbolMetadataRequest } from "./current-symbol-metadata.ts";
import { buildCurrentProjectUrlGuard } from "./current-project-url.ts";
import { EXACT_READ_ENVELOPE_SCHEMA } from "./exact-readers.ts";
import { CURRENT_SYMBOL_CLOSED_TARGET_DOM } from "./current-symbol-closed-target-dom.ts";

/** Fixed project-qualified loaded metadata reads. MGR 005584e0 routes
 * symbol.getData without its optional canvas flag; WORKER b849bd12 reads its
 * existing symbol map. No public cloud-routing wrapper is dispatched.
 */
export function buildCurrentSymbolMetadataProgram(input: unknown): string {
  return compileCurrentSymbolMetadataProgram(input, false);
}

/** Internal owner-only witness compiler, never a public reader option or writer. */
export function buildCurrentClosedSymbolMetadataProgram(input: unknown): string {
  return compileCurrentSymbolMetadataProgram(input, true);
}

function compileCurrentSymbolMetadataProgram(input: unknown, closedTarget: boolean): string {
  const request = parseCurrentSymbolMetadataRequest(input);
  return `let timer,clear;
try{
const root=globalThis,apply=Reflect.apply,target=${JSON.stringify(request.target)},symbolUuid=${JSON.stringify(request.arguments.symbolUuid)};let expired=false;
const bad=()=>{throw new Error('CURRENT_SYMBOL_METADATA_READ_FAILED');};
${buildCurrentProjectUrlGuard()}
const own=(owner,key,optional=false)=>{if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad();const d=Object.getOwnPropertyDescriptor(owner,key);if(!d){if(optional&&!(key in owner))return undefined;bad();}if(!Object.hasOwn(d,'value'))bad();return d.value;};
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const plain=value=>{if(!object(value)||Object.getPrototypeOf(value)!==Object.prototype)bad();return value;};
const text=(value,max,empty=false)=>{if(typeof value!=='string'||value.length>max||(!empty&&value.length===0))bad();return value;};
const dense=(value,max)=>{if(!Array.isArray(value)||Object.getPrototypeOf(value)!==Array.prototype)bad();const n=own(value,'length');if(!Number.isInteger(n)||n<0||n>max||Reflect.ownKeys(value).length!==n+1)bad();for(let i=0;i<n;i++)own(value,String(i));return n;};
const method=(owner,key)=>{const chain=[];let node=owner;for(let i=0;i<4;i++){if(node===null||(typeof node!=='object'&&typeof node!=='function'))bad();chain.push(node);const d=Object.getOwnPropertyDescriptor(node,key);if(d){if(!Object.hasOwn(d,'value')||typeof d.value!=='function')bad();return{owner,key,chain,fn:d.value};}node=Object.getPrototypeOf(node);}bad();};
const methodCheck=binding=>{for(let i=0;i<binding.chain.length;i++){const node=binding.chain[i];if(i>0&&Object.getPrototypeOf(binding.chain[i-1])!==node)bad();if(i===binding.chain.length-1){if(own(node,binding.key)!==binding.fn)bad();}else if(Object.hasOwn(node,binding.key))bad();}};
const location=root.location,href=location?.href,document=root.document,ui=own(root,'UI'),host=own(root,'gVars'),tabs=own(ui,'tabBar'),mode=own(root,'PRO_EDITOR_MODE'),edaOwner=eda;
const project=plain(own(host,'currentProject')),bus=own(host,'messageBus'),rpc=method(bus,'rpcCall');
if(typeof tabs!=='function'||Object.getPrototypeOf(tabs)!==Function.prototype)bad();
const active=method(tabs,'getActiveTab'),container=method(tabs,'getContainerInfo'),getTab=method(tabs,'getTabById');
const tab=plain(apply(getTab.fn,tabs,[target.tabId])),data=plain(own(tab,'data')),select=document?.querySelectorAll;
if(typeof select!=='function')bad();const matches=apply(select,document,['[id="frame_'+target.tabId+'"]']);if(matches.length!==1)bad();
const frame=matches[0],child=frame?.contentWindow,childDocument=child?.document,parent=frame?.parentElement;
const native=own(child,'MSG_BUS_PCB'),channel=own(native,'messageBus'),identityCall=method(channel,'rpcCall'),childObject=own(child,'Object'),childPrototype=own(childObject,'prototype');
const getAttribute=frame?.getAttribute,hasAttribute=frame?.hasAttribute,classes=frame?.classList,contains=classes?.contains,parentAttribute=parent?.getAttribute;
if(typeof getAttribute!=='function'||typeof hasAttribute!=='function'||typeof contains!=='function'||typeof parentAttribute!=='function')bad();
const set=own(root,'setTimeout');clear=own(root,'clearTimeout');if(typeof set!=='function'||typeof clear!=='function')bad();
const check=()=>{
 if(expired||root.window!==root||root.top!==root||root.location!==location||root.document!==document||document?.defaultView!==root||document?.nodeType!==9||document?.URL!==href||location?.href!==href||location?.origin!=='https://client')bad();
 parseProjectUrl(href,target.projectUuid,target.tabId);
 if(own(root,'PRO_EDITOR_MODE')!==mode||(mode!=='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'&&mode!=='CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'))bad();
 if(own(root,'UI')!==ui||own(root,'gVars')!==host||own(ui,'gVars')!==host||own(ui,'tabBar')!==tabs||own(host,'currentProject')!==project||own(host,'messageBus')!==bus||eda!==edaOwner||own(edaOwner,'extensionUuid')!=='7e06d286b1ac846ef7eab9c7f2a9ee40')bad();
 if(own(project,'projectId')!==target.projectUuid||own(project,'branchUuid')!==target.branchUuid||own(project,'isV2Format')!==false||own(host,'isHistoryMode')!==false)bad();
 for(const binding of [active,container,getTab,rpc,identityCall])methodCheck(binding);
 if(apply(active.fn,tabs,[])!==target.tabId||apply(getTab.fn,tabs,[target.tabId])!==tab||own(tab,'data')!==data||own(tab,'tabId')!==target.tabId||own(data,'doctype')!==3||own(data,'pid')!==target.projectUuid||own(tab,'parentLibraryUuid',true)!==undefined)bad();
 if(document.querySelectorAll!==select)bad();const found=apply(select,document,['[id="frame_'+target.tabId+'"]']);if(found.length!==1||found[0]!==frame)bad();
 if(frame.tagName!=='IFRAME'||frame.id!=='frame_'+target.tabId||frame.ownerDocument!==document||frame.isConnected!==true||frame.parentElement!==parent||frame.classList!==classes||classes.contains!==contains||frame.getAttribute!==getAttribute||frame.hasAttribute!==hasAttribute||parent.getAttribute!==parentAttribute||!apply(contains,classes,['editframe'])||apply(parentAttribute,parent,['uuid'])!==target.tabId)bad();
 for(const [key,value] of [['c_dbid',target.tabId],['c_doctype','3'],['src','editor?entry=pcb'],['pcb-canvas','true']])if(apply(getAttribute,frame,[key])!==value)bad();for(const key of ['blankIframe','fromFile','jsonCacheReady'])if(apply(hasAttribute,frame,[key]))bad();
 if(frame.contentWindow!==child||child.document!==childDocument||childDocument?.defaultView!==child||childDocument?.nodeType!==9||child.frameElement!==frame||child.parent!==root||child.top!==root||own(child,'MSG_BUS_PCB')!==native||own(native,'messageBus')!==channel||own(child,'Object')!==childObject||own(childObject,'prototype')!==childPrototype)bad();
 if(own(root,'setTimeout')!==set||own(root,'clearTimeout')!==clear)bad();
};
${closedTarget ? CURRENT_SYMBOL_CLOSED_TARGET_DOM : ""}
// Enumerate the complete current tab registry, not the public split-tree mapper.
// Absence here deliberately makes no assertion about hidden/export editors.
const registry=()=>{
 check();const owners=[],ids=own(tabs,'containerIds'),n=dense(ids,128);if(n===0)bad();owners.push(ids);const names=[],registered=new Set();
 for(let i=0;i<n;i++){const id=text(own(ids,String(i)),256);if(registered.has(id))bad();registered.add(id);names.push(id);}
 const tree=own(tabs,'containerTree'),pending=[{node:tree,depth:0}],seen=new Set(),treeIds=new Set(),leaves=new Set(),treeProjection=[];
 if(own(tabs,'belongContainer')!=='editor-window-main'||own(tree,'id')!=='editor-window-main')bad();
 while(pending.length){const item=pending.pop(),node=plain(item.node);if(item.depth>16||seen.has(node)||seen.size>=255)bad();seen.add(node);owners.push(node);const id=text(own(node,'id'),256),children=own(node,'children',true);if(treeIds.has(id))bad();treeIds.add(id);treeProjection.push([id,item.depth]);
  if(children===undefined){if(!registered.has(id)||leaves.has(id))bad();leaves.add(id);}else{const count=dense(children,128);if(count===0||pending.length+seen.size+count>255)bad();owners.push(children);for(let i=count-1;i>=0;i--)pending.push({node:own(children,String(i)),depth:item.depth+1});}}
 if(leaves.size!==registered.size||own(tabs,'currentTabId')!==target.tabId)bad();
 const allIds=new Set(),projection=[];let count=0,start=0,placeholder=0,currentCount=0;
 for(const id of names){const info=plain(apply(container.fn,tabs,[id]));check();owners.push(info);if(own(info,'id')!==id||own(info,'belong')!=='editor-window-main')bad();const list=own(info,'tabs'),length=dense(list,256);if(count+length>256)bad();count+=length;owners.push(list);const localActive=text(own(info,'activeTabId'),512,true),localIds=new Set(),rows=[];
  for(let i=0;i<length;i++){const member=plain(own(list,String(i))),id2=text(own(member,'tabId'),512),entry=plain(own(member,'data'));owners.push(member,entry);if(allIds.has(id2))bad();allIds.add(id2);localIds.add(id2);const type=own(entry,'doctype');
   if(id2==='tab_page1'||id2==='0'){const isStart=id2==='tab_page1';if(type!==(isStart?-1:0)||own(member,'isAbleDelete')!==false||own(member,'group')!=='start_blank'||own(member,'draggable')!==isStart)bad();const hidden=own(member,'isDisplayNone');if(typeof hidden!=='boolean'||(!isStart&&hidden!==true))bad();const declared=own(member,'documentType',true);if(declared!==undefined&&declared!==type)bad();for(const key of ['pid','owner'])if(own(entry,key,true)!==undefined)bad();for(const key of ['parentProjectUuid','parentLibraryUuid'])if(own(member,key,true)!==undefined)bad();if(isStart)start++;else placeholder++;
   }else{if(![1,3,26].includes(type)||own(entry,'pid')!==target.projectUuid||own(member,'parentLibraryUuid',true)!==undefined)bad();const parts=/^([a-f0-9]{16}|[a-f0-9]{32})@([a-f0-9]{64})$/.exec(id2);if(!parts||parts[2]!==target.projectUuid||parts[1]===symbolUuid)bad();const parentProject=own(member,'parentProjectUuid',true),declared=own(member,'documentType',true);if((parentProject!==undefined&&parentProject!==target.projectUuid)||(declared!==undefined&&declared!==type))bad();}
   if(id2===target.tabId){currentCount++;if(localActive!==target.tabId||member!==tab||entry!==data||type!==3)bad();}rows.push([id2,type]);}
  if(localActive!==''&&!localIds.has(localActive))bad();projection.push([id,localActive,rows]);}
 if(start>1||placeholder>1||currentCount!==1)bad();const url=parseProjectUrl(href,target.projectUuid,target.tabId);if(url.tabIds.some(id=>!allIds.has(id)))bad();check();return{owners,seal:JSON.stringify([names,treeProjection,projection])};
};
const initial=registry();const same=()=>{const now=registry();if(now.seal!==initial.seal||now.owners.length!==initial.owners.length||now.owners.some((owner,i)=>owner!==initial.owners[i]))bad();${closedTarget ? "closedTargetDom();" : ""}};
const childPlain=value=>{if(!object(value))bad();const p=Object.getPrototypeOf(value);if(p!==Object.prototype&&p!==childPrototype)bad();return value;};
const identity=async()=>{same();const reply=await apply(identityCall.fn,channel,['getTabIdAndDocType',undefined,0]);same();const value=childPlain(own(childPlain(reply),'message')),keys=Reflect.ownKeys(value);if(keys.length!==2||!keys.includes('tabId')||!keys.includes('docType')||own(value,'tabId')!==target.tabId||own(value,'docType')!==3)bad();};
const call=async(topic,args)=>{same();const reply=await apply(rpc.fn,bus,[topic,args,0]);same();return plain(own(plain(reply),'message'));};
const projectMetadata=async()=>{const value=await call('/PrjDB/project/getData',[target.projectUuid]);if(own(value,'uuid')!==target.projectUuid||own(value,'currentBranch')!==target.branchUuid||own(value,'isV2Format')!==false)bad();const ownerUuid=own(plain(own(value,'owner')),'uuid');if(typeof ownerUuid!=='string'||!/^[a-f0-9]{32}$/.test(ownerUuid))bad();return ownerUuid;};
const sample=async()=>{
 await identity();same();const ownerUuid=await projectMetadata();same();
 // No third argument: the manager's optional canvas flag remains undefined.
 const value=await call('/PrjDB/symbol/getData',[symbolUuid,target.projectUuid]);same();
 if(own(value,'uuid')!==symbolUuid||own(value,'project_uuid')!==target.projectUuid||own(value,'path')!==target.projectUuid||own(value,'docType')!==2||own(plain(own(value,'owner')),'uuid')!==ownerUuid)bad();
 const ticket=own(value,'ticket');if(typeof ticket!=='number'||!Number.isSafeInteger(ticket)||ticket<0||Object.is(ticket,-0))bad();
 const tagsJson=text(own(value,'custom_tags'),131072,true),tags=JSON.parse(tagsJson);for(let i=0,n=dense(tags,256);i<n;i++)text(own(tags,String(i)),512,true);
 const result={uuid:symbolUuid,projectUuid:target.projectUuid,ownerUuid,name:text(own(value,'display_title'),512,true),description:text(own(value,'description'),65536,true),tagsJson,source:text(own(value,'source'),4096,true),version:text(own(value,'version'),128,true),ticket};
 if(await projectMetadata()!==ownerUuid)bad();same();await identity();same();return result;
};
const run=async()=>{const first=await sample(),seal=JSON.stringify(first);if(new TextEncoder().encode(seal).byteLength>${CURRENT_SYMBOL_METADATA_MAX_BYTES})bad();const second=await sample();same();if(JSON.stringify(second)!==seal)bad();
 const result={ok:true,kind:${JSON.stringify(closedTarget ? "current-closed-symbol-metadata-witness" : "current-symbol-metadata-observation")},method:${JSON.stringify(request.method)},target,value:first,samples:2,implementationKind:'native-task-equivalent',targetClosedInRegistry:true,hiddenEditorsVerified:${String(closedTarget)},workerIdentityVerified:false,cadAuthority:false,persistenceVerified:false,sourceMembershipVerified:false};
 const json=JSON.stringify(result),utf8Bytes=new TextEncoder().encode(json).byteLength,envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};if(utf8Bytes>${CURRENT_SYMBOL_METADATA_MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${CURRENT_SYMBOL_METADATA_MAX_BYTES})bad();return envelope;};
same();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;reject(new Error('CURRENT_SYMBOL_METADATA_READ_FAILED'));},10000]);});return await Promise.race([run(),timeout]);
}catch{throw new Error('CURRENT_SYMBOL_METADATA_READ_FAILED');}
finally{if(timer!==undefined&&typeof clear==='function'){try{Reflect.apply(clear,globalThis,[timer]);}catch{throw new Error('CURRENT_SYMBOL_METADATA_READ_FAILED');}}}`;
}
