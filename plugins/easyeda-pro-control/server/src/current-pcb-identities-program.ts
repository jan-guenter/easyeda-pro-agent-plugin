import { CURRENT_PCB_IDENTITIES_MAX_BYTES, CURRENT_PCB_IDENTITIES_MAX_IDS, CURRENT_PCB_IDENTITIES_MAX_ID_LENGTH,
  CURRENT_PCB_IDENTITIES_MAX_SELECTED_IDS, currentPcbIdentityFamilies, parseCurrentPcbIdentitiesRequest } from "./current-pcb-identities.ts";
import { EXACT_READ_ENVELOPE_SCHEMA } from "./exact-readers.ts";

/** Current API021d155b / UI3823ed6e / PCB217199c8 only. Keep the same
 * captured ordinary frame and native receiver contract as current layer reads.
 * No public current-tab routing, model export or SDK object projection is used.
 */
export function buildCurrentPcbIdentitiesProgram(input: unknown): string {
  const request = parseCurrentPcbIdentitiesRequest(input);
  const nativeTopics = { selected: "pcb/extensionAPI/selectcontrol-getAllSelectedPrimitiveIds", Line: "pcb/extensionAPI/track-getAll",
    Arc: "pcb/extensionAPI/arc-getAll", Via: "pcb/extensionAPI/via-getAll" } as const;
  const reads = currentPcbIdentityFamilies(request).map((family) => ({ family, topic: nativeTopics[family] }));
  return `let timer,clear;
try{
const root=globalThis,apply=Reflect.apply,target=${JSON.stringify(request.target)},reads=${JSON.stringify(reads)};let expired=false;
const bad=()=>{throw new Error('CURRENT_PCB_IDENTITIES_READ_FAILED');};
const own=(owner,key)=>{if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad();const d=Object.getOwnPropertyDescriptor(owner,key);if(!d||!Object.hasOwn(d,'value'))bad();return d.value;};
const absent=(owner,key)=>{const d=Object.getOwnPropertyDescriptor(owner,key);if(d&&(!Object.hasOwn(d,'value')||d.value!==undefined))bad();};
const fn=(owner,key)=>{const value=own(owner,key);if(typeof value!=='function')bad();return value;};
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const topPlain=value=>{if(!object(value)||Object.getPrototypeOf(value)!==Object.prototype)bad();return value;};
const location=root.location,href=location?.href,document=root.document,ui=own(root,'UI'),host=own(root,'gVars'),mode=own(root,'PRO_EDITOR_MODE');
const project=topPlain(own(host,'currentProject')),tabs=own(ui,'tabBar'),edaOwner=eda;
if(typeof tabs!=='function'||Object.getPrototypeOf(tabs)!==Function.prototype)bad();
const active=fn(tabs,'getActiveTab'),getTab=fn(tabs,'getTabById'),select=document?.querySelectorAll;
if(typeof select!=='function')bad();
const tab=topPlain(apply(getTab,tabs,[target.tabId])),data=topPlain(own(tab,'data'));
const matches=apply(select,document,['[id="frame_'+target.tabId+'"]']);if(matches.length!==1)bad();
const frame=matches[0],child=frame?.contentWindow,childDocument=child?.document,parent=frame?.parentElement;
const native=own(child,'MSG_BUS_PCB'),channel=own(native,'messageBus'),childObject=own(child,'Object'),childArray=own(child,'Array');
const childObjectPrototype=own(childObject,'prototype'),childArrayPrototype=own(childArray,'prototype');
const getAttribute=frame?.getAttribute,hasAttribute=frame?.hasAttribute,classes=frame?.classList,contains=classes?.contains,parentAttribute=parent?.getAttribute;
if(typeof getAttribute!=='function'||typeof hasAttribute!=='function'||typeof contains!=='function'||typeof parentAttribute!=='function')bad();
const chain=[channel];let rpc,rpcOwner;
for(let i=0;i<3;i++){const node=chain[i];if(!object(node))bad();const d=Object.getOwnPropertyDescriptor(node,'rpcCall');if(d){if(!Object.hasOwn(d,'value')||typeof d.value!=='function')bad();rpc=d.value;rpcOwner=node;break;}chain.push(Object.getPrototypeOf(node));}
if(typeof rpc!=='function')bad();
const set=own(root,'setTimeout');clear=own(root,'clearTimeout');if(typeof set!=='function'||typeof clear!=='function')bad();
const check=()=>{
 if(expired||root.window!==root||root.top!==root||root.location!==location||root.document!==document||document?.defaultView!==root||document?.nodeType!==9||document?.URL!==href||location?.href!==href||location?.origin!=='https://client')bad();
 if(typeof href!=='string'||!/^https:\\/\\/client\\/editor\\?cll=(?:trace|debug|info|warn|error)#?$/.test(href))bad();
 if(own(root,'PRO_EDITOR_MODE')!==mode||(mode!=='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'&&mode!=='CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'))bad();
 if(own(root,'UI')!==ui||own(root,'gVars')!==host||own(ui,'gVars')!==host||own(host,'currentProject')!==project||own(ui,'tabBar')!==tabs||eda!==edaOwner||own(edaOwner,'extensionUuid')!=='7e06d286b1ac846ef7eab9c7f2a9ee40')bad();
 if(own(project,'projectId')!==target.projectUuid||own(project,'branchUuid')!==target.branchUuid||own(project,'isV2Format')!==false||own(host,'isHistoryMode')!==false)bad();
 if(fn(tabs,'getActiveTab')!==active||fn(tabs,'getTabById')!==getTab||apply(active,tabs,[])!==target.tabId||apply(getTab,tabs,[target.tabId])!==tab||own(tab,'data')!==data)bad();
 if(own(tab,'tabId')!==target.tabId||own(data,'doctype')!==3||own(data,'pid')!==target.projectUuid)bad();absent(tab,'parentLibraryUuid');
 if(document.querySelectorAll!==select)bad();const found=apply(select,document,['[id="frame_'+target.tabId+'"]']);if(found.length!==1||found[0]!==frame)bad();
 if(frame.tagName!=='IFRAME'||frame.id!=='frame_'+target.tabId||frame.ownerDocument!==document||frame.isConnected!==true||frame.parentElement!==parent||frame.classList!==classes||classes.contains!==contains||frame.getAttribute!==getAttribute||frame.hasAttribute!==hasAttribute||parent.getAttribute!==parentAttribute||!apply(contains,classes,['editframe'])||apply(parentAttribute,parent,['uuid'])!==target.tabId)bad();
 for(const [key,value] of [['c_dbid',target.tabId],['c_doctype','3'],['src','editor?entry=pcb'],['pcb-canvas','true']])if(apply(getAttribute,frame,[key])!==value)bad();
 for(const key of ['blankIframe','fromFile','jsonCacheReady'])if(apply(hasAttribute,frame,[key]))bad();
 if(frame.contentWindow!==child||child.document!==childDocument||childDocument?.defaultView!==child||childDocument?.nodeType!==9||child.frameElement!==frame||child.parent!==root||child.top!==root||own(child,'MSG_BUS_PCB')!==native||own(native,'messageBus')!==channel)bad();
 if(own(child,'Object')!==childObject||own(childObject,'prototype')!==childObjectPrototype||own(child,'Array')!==childArray||own(childArray,'prototype')!==childArrayPrototype)bad();
 for(let i=0;i<chain.length;i++){const node=chain[i];if(i>0&&Object.getPrototypeOf(chain[i-1])!==node)bad();if(node===rpcOwner){if(own(node,'rpcCall')!==rpc)bad();}else if(Object.hasOwn(node,'rpcCall'))bad();}
 if(own(root,'setTimeout')!==set||own(root,'clearTimeout')!==clear)bad();
};
const plain=value=>{if(!object(value))bad();const p=Object.getPrototypeOf(value);if(p!==Object.prototype&&p!==childObjectPrototype)bad();return value;};
const exact=(value,keys)=>{plain(value);const actual=Reflect.ownKeys(value);if(actual.length!==keys.length||!actual.every(key=>keys.includes(key)))bad();};
const text=value=>{if(typeof value!=='string'||value.length===0||value.length>${CURRENT_PCB_IDENTITIES_MAX_ID_LENGTH})bad();return value;};
const copyIds=(value,selected)=>{
 const p=Object.getPrototypeOf(value??{});if(!Array.isArray(value)||(p!==Array.prototype&&p!==childArrayPrototype))bad();
 const n=own(value,'length'),max=selected?${CURRENT_PCB_IDENTITIES_MAX_SELECTED_IDS}:${CURRENT_PCB_IDENTITIES_MAX_IDS};
 if(!Number.isInteger(n)||n<0||n>max||Reflect.ownKeys(value).length!==n+1)bad();
 const ids=[],seen=new Set();
 for(let i=0;i<n;i++){const entry=own(value,String(i)),id=text(selected?entry:own(plain(entry),'globalIndex'));if(seen.has(id))bad();seen.add(id);ids.push(id);}
 return ids;
};
const call=async(topic,arg)=>{check();const reply=await apply(rpc,channel,[topic,arg,0]);check();plain(reply);return own(reply,'message');};
const identity=async()=>{const value=await call('getTabIdAndDocType',undefined);check();exact(value,['tabId','docType']);if(own(value,'tabId')!==target.tabId||own(value,'docType')!==3)bad();};
const read=async()=>{
 await identity();check();const observations=[],seen=new Set();
 for(const entry of reads){const selected=entry.family==='selected',raw=await call(entry.topic,selected?undefined:{});check();const ids=copyIds(raw,selected);check();for(const id of ids){if(seen.has(id))bad();seen.add(id);}observations.push({family:entry.family,ids});}
 await identity();check();return observations;
};
const run=async()=>{
 const first=await read(),firstJson=JSON.stringify(first);if(new TextEncoder().encode(firstJson).byteLength>${CURRENT_PCB_IDENTITIES_MAX_BYTES})bad();
 const second=await read();if(JSON.stringify(second)!==firstJson)bad();check();
 const json=JSON.stringify({ok:true,kind:'current-pcb-identity-observation',method:${JSON.stringify(request.method)},target,observations:first,samples:2,implementationKind:'native-task-equivalent',cadAuthority:false,persistenceVerified:false,sourceMembershipVerified:false});
 const utf8Bytes=new TextEncoder().encode(json).byteLength,envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};
 if(utf8Bytes>${CURRENT_PCB_IDENTITIES_MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${CURRENT_PCB_IDENTITIES_MAX_BYTES})bad();return envelope;
};
check();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;reject(new Error('CURRENT_PCB_IDENTITIES_READ_FAILED'));},10000]);});
return await Promise.race([run(),timeout]);
}catch{throw new Error('CURRENT_PCB_IDENTITIES_READ_FAILED');}
finally{if(timer!==undefined&&typeof clear==='function'){try{Reflect.apply(clear,globalThis,[timer]);}catch{throw new Error('CURRENT_PCB_IDENTITIES_READ_FAILED');}}}`;
}
