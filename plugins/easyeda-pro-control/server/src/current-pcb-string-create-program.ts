/** Dormant source generator, intentionally unregistered and unexecuted. A
 * synthetic VM is the only admitted consumer. The future owner/lifecycle must
 * qualify empty-root eligibility, child effects, queues, SQL and reopen first. */
import { buildCurrentProjectUrlGuard } from "./current-project-url.ts";
import { CURRENT_PCB_STRING_CREATE_RESULT_MAX_BYTES, requireOriginalCurrentPcbStringCreateObservationPlan } from "./current-pcb-string-create-observation.ts";
import type { CurrentPcbStringCreateObservationPlan } from "./current-pcb-string-create-observation.ts";

/** At most one create per invocation, not replay protection across invocations.
 * Pinned PCB217199c8: string-create@10393687, string-getAll@10397039,
 * getTabIdAndDocType@10807394, yr.toJSON@7384285. No Save or source exporter. */
export function buildDormantCurrentPcbStringCreateProgram(input: CurrentPcbStringCreateObservationPlan): string {
  const plan = requireOriginalCurrentPcbStringCreateObservationPlan(input);
  return `let timer,clear,stage='setup',dispatchAttempts=0,acknowledgedPrimitiveId=null,matchingBeforeSamples=0,matchingAfterSamples=0,readback=null,deadlineExpired=false,completed=false,expired=false;
try{
const root=globalThis,apply=Reflect.apply,target=${JSON.stringify(plan.target)},args=${JSON.stringify(plan.candidateArguments)},expected=${JSON.stringify(plan.expectedExposedScalars)};
const bad=()=>{throw new Error('DORMANT_CURRENT_PCB_STRING_CREATE_FAILED');};
${buildCurrentProjectUrlGuard()}
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
 parseProjectUrl(href,target.projectUuid,target.tabId);
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
const unwrap=reply=>own(plain(reply),'message');
const id=value=>{if(typeof value!=='string'||value.length!==16||!/^[a-f0-9]{16}$/.test(value))bad();return value;};
const call=async(topic,arg)=>{check();const reply=await apply(rpc,channel,[topic,arg,0]);check();return unwrap(reply);};
const identity=async()=>{const value=await call('getTabIdAndDocType',undefined);check();exact(value,['tabId','docType']);if(own(value,'tabId')!==target.tabId||own(value,'docType')!==3)bad();};
const copyRows=(raw,after)=>{
 if(!Array.isArray(raw))bad();const p=Object.getPrototypeOf(raw);if(p!==Array.prototype&&p!==childArrayPrototype)bad();
 const n=own(raw,'length');if(n!==(after?1:0)||Reflect.ownKeys(raw).length!==n+1)bad();if(!after)return null;
 const row=plain(own(raw,'0')),globalIndex=id(own(row,'globalIndex'));if(globalIndex!==acknowledgedPrimitiveId)bad();const projected={globalIndex};
 for(const key of Object.keys(expected)){
  if(key==='position'){
   const point=own(row,key);if(!object(point))bad();const keys=Reflect.ownKeys(point);if(!keys.includes('x')||!keys.includes('y')||keys.some(k=>k!=='x'&&k!=='y'&&k!=='_hashed'))bad();
   const x=own(point,'x'),y=own(point,'y');if(!Object.is(x,expected.position.x)||!Object.is(y,expected.position.y))bad();projected.position={x,y};
  }else{const value=own(row,key);if(!Object.is(value,expected[key]))bad();projected[key]=value;}
 }
 return projected;
};
// Unfiltered parentless String enumeration only, not complete renderer/source ownership.
// Raw font/formula caches and hidden type/zIndex/group/partition are not observed.
const sample=async(after)=>{await identity();check();const rows=copyRows(await call('pcb/extensionAPI/string-getAll',{}),after);check();await identity();check();return rows;};
const run=async()=>{
 stage='before-first';await sample(false);check();matchingBeforeSamples=1;
 stage='before-second';await sample(false);check();matchingBeforeSamples=2;
 stage='create';check();if(dispatchAttempts!==0)bad();dispatchAttempts=1;
 // Preserve the bounded native acknowledgment before the post-await context guard.
 // An acknowledged ID is not proof the command survived filtering or persisted.
 const reply=await apply(rpc,channel,['pcb/extensionAPI/string-create',args,0]);
 const acknowledgment=unwrap(reply);exact(acknowledgment,['primitiveId']);acknowledgedPrimitiveId=id(own(acknowledgment,'primitiveId'));check();
 stage='after-first';const first=await sample(true);check();readback=first;matchingAfterSamples=1;
 stage='after-second';const second=await sample(true);check();if(JSON.stringify(second)!==JSON.stringify(readback))bad();matchingAfterSamples=2;stage='final-check';
};
check();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;deadlineExpired=true;reject(new Error('DORMANT_CURRENT_PCB_STRING_CREATE_FAILED'));},10000]);});
await Promise.race([run(),timeout]);check();completed=true;
}catch{}finally{
 expired=true;
 if(timer!==undefined&&typeof clear==='function'){try{Reflect.apply(clear,globalThis,[timer]);}catch{stage='cleanup';completed=false;}}
}
if(completed)stage='complete';
const output=JSON.stringify({profile:'private.current-pcb-string-create-dormant-result.v1',planSha256:${JSON.stringify(plan.planSha256)},completed,stage,dispatchAttempts,acknowledgedPrimitiveId,matchingBeforeSamples,matchingAfterSamples,readback,deadlineExpired});
if(output.length>${CURRENT_PCB_STRING_CREATE_RESULT_MAX_BYTES})throw new Error('DORMANT_CURRENT_PCB_STRING_CREATE_RESULT_BOUND');return output;`;
}
