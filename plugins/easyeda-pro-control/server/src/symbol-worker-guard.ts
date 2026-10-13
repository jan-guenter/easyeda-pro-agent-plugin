/** Fixed compiler input and lexical guard. Data alone grants no dispatch authority. */
import { SYMBOL_ACTOR_NATIVE_GUARD_CODES } from "./metadata-native-diagnostics.ts";

export interface SymbolWorkerExpectation {
  readonly projectUuid: string; readonly client: string; readonly maxTicket: number;
  readonly notBeforeMs: number; readonly notAfterMs: number;
}
function fail(): never { throw new Error("SYMBOL_WORKER_INPUT"); }
export function validateWorkerExpectation(input: unknown, projectUuid: string, active: { uuid: string; documentType: number; tabId: string }, targetUuid: string): SymbolWorkerExpectation {
  if (input === null || typeof input !== "object" || Array.isArray(input) ||
      (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null)) { fail(); }
  const fields = ["projectUuid", "client", "maxTicket", "notBeforeMs", "notAfterMs"];
  if (Reflect.ownKeys(input).length !== fields.length) { fail(); }
  const values: Record<string, unknown> = {};
  for (const key of fields) {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { fail(); }
    values[key] = descriptor.value as unknown;
  }
  const client = values["client"], maxTicket = values["maxTicket"], notAfterMs = values["notAfterMs"], notBeforeMs = values["notBeforeMs"];
  if (values["projectUuid"] !== projectUuid || !/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u.test(projectUuid) ||
      typeof client !== "string" || !/^[a-f0-9]{16}$/u.test(client) ||
      typeof maxTicket !== "number" || !Number.isSafeInteger(maxTicket) || maxTicket < 0 || maxTicket >= Number.MAX_SAFE_INTEGER ||
      typeof notBeforeMs !== "number" || !Number.isSafeInteger(notBeforeMs) || notBeforeMs < 0 ||
      typeof notAfterMs !== "number" || !Number.isSafeInteger(notAfterMs) || notAfterMs < notBeforeMs || notAfterMs - notBeforeMs > 60_000 ||
      active.documentType !== 3 || !/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u.test(active.uuid) || active.uuid === targetUuid || active.tabId !== `${active.uuid}@${projectUuid}`) {
    fail();
  }
  return Object.freeze({ projectUuid, client, maxTicket, notBeforeMs, notAfterMs });
}
export const SYMBOL_WORKER_NATIVE_GUARD_CODES = [...SYMBOL_ACTOR_NATIVE_GUARD_CODES,
  "WORKER_SCOPE_DRIFT", "WORKER_RECEIVER_DRIFT", "WORKER_DATE_DRIFT", "WORKER_WINDOW", "WORKER_CLIENT_DRIFT", "WORKER_TICKET_DRIFT"] as const;
export const SYMBOL_WORKER_NATIVE_DIAGNOSTIC_CATCH = `let code='EXCEPTION';try{
const descriptor=error!==null&&(typeof error==='object'||typeof error==='function')?Object.getOwnPropertyDescriptor(error,'message'):undefined;
const message=descriptor&&Object.hasOwn(descriptor,'value')?descriptor.value:undefined;
if(typeof message==='string'&&${JSON.stringify(SYMBOL_WORKER_NATIVE_GUARD_CODES)}.includes(message))code=message;
}catch(_){};`;

export const SYMBOL_WORKER_GUARD_SOURCE = `
const workerFail=code=>{throw new Error(code);};
const workerOwn=(owner,key,optional=false)=>{
 if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))workerFail('WORKER_SCOPE_DRIFT');
 const d=Object.getOwnPropertyDescriptor(owner,key);
 if(!d){if(optional&&!(key in owner))return undefined;workerFail('WORKER_SCOPE_DRIFT');}
 if(!Object.hasOwn(d,'value'))workerFail('WORKER_SCOPE_DRIFT');return d.value;
};
const workerMethod=(owner,key)=>{
 let current=owner;for(let depth=0;depth<4&&current!==null;depth++){
  const d=Object.getOwnPropertyDescriptor(current,key);
  if(d){if(!Object.hasOwn(d,'value')||typeof d.value!=='function')workerFail('WORKER_RECEIVER_DRIFT');return d.value;}
  current=Object.getPrototypeOf(current);
 }workerFail('WORKER_RECEIVER_DRIFT');
};
const workerApply=Reflect.apply,workerBusPrototype=Object.getPrototypeOf(bus),workerRpcMethod=workerMethod(bus,'rpcCall');
const workerProject=workerOwn(host,'currentProject'),workerPending=workerOwn(host,'sessionStorageTabs');
const workerTabsPrototype=Object.getPrototypeOf(tabs),workerPermissionPrototype=Object.getPrototypeOf(permission);
const workerActive=workerOwn(tabs,'getActiveTab'),workerAll=workerOwn(tabs,'getFilterTabs'),workerDirty=workerOwn(tabs,'hasTabUnSaved'),workerTabDirty=workerOwn(tabs,'isTabUnSaved');
const workerDisable=workerMethod(permission,'getIframeDisableStatusPanelPcb');
const workerDate=workerOwn(globalThis,'Date'),workerDatePrototype=workerOwn(workerDate,'prototype'),workerNow=workerOwn(workerDate,'now');
if(typeof workerDate!=='function'||typeof workerNow!=='function')workerFail('WORKER_DATE_DRIFT');
const workerSetSize=Object.getOwnPropertyDescriptor(Set.prototype,'size')?.get;
if(typeof workerSetSize!=='function')workerFail('WORKER_SCOPE_DRIFT');
const workerSdk=eda,workerSdkProject=workerOwn(workerSdk,'dmt_Project'),workerSdkDocument=workerOwn(workerSdk,'dmt_SelectControl'),workerSdkEditor=workerOwn(workerSdk,'dmt_EditorControl');
const workerSdkPrototype=Object.getPrototypeOf(workerSdk),workerProjectPrototype=Object.getPrototypeOf(workerSdkProject),workerDocumentPrototype=Object.getPrototypeOf(workerSdkDocument),workerEditorPrototype=Object.getPrototypeOf(workerSdkEditor);
const workerProjectGet=workerMethod(workerSdkProject,'getCurrentProjectInfo'),workerDocumentGet=workerMethod(workerSdkDocument,'getCurrentDocumentInfo'),workerTreeGet=workerMethod(workerSdkEditor,'getSplitScreenTree');
let workerPeer,workerPeerData,workerLastNow;
const workerDateState=()=>{
 if(Reflect.apply!==workerApply||workerOwn(globalThis,'Date')!==workerDate||workerOwn(workerDate,'prototype')!==workerDatePrototype||workerOwn(workerDate,'now')!==workerNow)workerFail('WORKER_DATE_DRIFT');
};
const workerState=()=>{
 if(workerOwn(globalThis,'UI')!==ui||workerOwn(ui,'gVars')!==host||workerOwn(ui,'tabBar')!==tabs||workerOwn(host,'currentProject')!==workerProject||workerOwn(host,'sessionStorageTabs')!==workerPending)workerFail('WORKER_SCOPE_DRIFT');
 if(workerOwn(workerProject,'projectId')!==PLAN.projectUuid||workerOwn(workerProject,'branchUuid')!==PLAN.branchUuid||workerOwn(workerProject,'isV2Format')!==false||workerOwn(host,'urlCmd')!==null||workerOwn(host,'isHistoryMode')!==false)workerFail('WORKER_SCOPE_DRIFT');
 if(workerOwn(host,'messageBus')!==bus||Object.getPrototypeOf(bus)!==workerBusPrototype||workerMethod(bus,'rpcCall')!==workerRpcMethod)workerFail('WORKER_RECEIVER_DRIFT');
 if(Object.getPrototypeOf(tabs)!==workerTabsPrototype||workerOwn(tabs,'getActiveTab')!==workerActive||workerOwn(tabs,'getFilterTabs')!==workerAll||workerOwn(tabs,'hasTabUnSaved')!==workerDirty||workerOwn(tabs,'isTabUnSaved')!==workerTabDirty)workerFail('WORKER_RECEIVER_DRIFT');
 if(workerOwn(ui,'concurrentDesign')!==permission||Object.getPrototypeOf(permission)!==workerPermissionPrototype||workerMethod(permission,'getIframeDisableStatusPanelPcb')!==workerDisable)workerFail('WORKER_RECEIVER_DRIFT');
 if(workerOwn(permission,'_isConcurrentStrictMode')!==false||workerOwn(tabs,'isOpenProjectDoc')!==true||workerOwn(tabs,'isOpenOtherDoc')!==true||workerApply(workerSetSize,workerPending,[])!==0||Reflect.ownKeys(workerPending).length!==0)workerFail('WORKER_SCOPE_DRIFT');
 if(eda!==workerSdk||Object.getPrototypeOf(workerSdk)!==workerSdkPrototype||workerOwn(workerSdk,'dmt_Project')!==workerSdkProject||Object.getPrototypeOf(workerSdkProject)!==workerProjectPrototype||workerOwn(workerSdk,'dmt_SelectControl')!==workerSdkDocument||Object.getPrototypeOf(workerSdkDocument)!==workerDocumentPrototype||workerOwn(workerSdk,'dmt_EditorControl')!==workerSdkEditor||Object.getPrototypeOf(workerSdkEditor)!==workerEditorPrototype||workerMethod(workerSdkProject,'getCurrentProjectInfo')!==workerProjectGet||workerMethod(workerSdkDocument,'getCurrentDocumentInfo')!==workerDocumentGet||workerMethod(workerSdkEditor,'getSplitScreenTree')!==workerTreeGet)workerFail('WORKER_RECEIVER_DRIFT');
 if(workerPeer!==undefined){
  if(workerOwn(workerPeer,'tabId')!==ACTIVE.tabId||workerOwn(workerPeer,'data')!==workerPeerData||workerOwn(workerPeerData,'doctype')!==3||workerOwn(workerPeerData,'pid')!==PLAN.projectUuid)workerFail('WORKER_SCOPE_DRIFT');
  const declared=workerOwn(workerPeer,'documentType',true),parent=workerOwn(workerPeer,'parentProjectUuid',true),owner=workerOwn(workerPeerData,'owner',true),unsaved=workerOwn(workerPeer,'isUnSaved',true);
  if((declared!==undefined&&declared!==3)||(parent!==undefined&&parent!==PLAN.projectUuid)||(owner!==undefined&&owner!==PLAN.ownerUuid)||workerOwn(workerPeer,'parentLibraryUuid',true)!==undefined||(unsaved!==undefined&&unsaved!==false))workerFail('WORKER_SCOPE_DRIFT');
 }
 workerDateState();
};
const workerGuard=()=>{
 actorGuard();workerState();
 if(workerApply(workerActive,tabs,[])!==ACTIVE.tabId||workerApply(workerDirty,tabs,[])!==false||workerOwn(workerApply(workerDisable,permission,[ACTIVE.tabId]),'disable')!==false)workerFail('WORKER_SCOPE_DRIFT');
 const list=workerApply(workerAll,tabs,[[]]);
 if(!Array.isArray(list)||list.length<1||list.length>3||Reflect.ownKeys(list).length!==list.length+1)workerFail('WORKER_SCOPE_DRIFT');
 let peers=0,starts=0,placeholders=0;
 for(let index=0;index<list.length;index++){
  const tab=workerOwn(list,String(index)),data=workerOwn(tab,'data'),id=workerOwn(tab,'tabId'),type=workerOwn(data,'doctype');
  if(id==='tab_page1'||id==='0'){
   if(workerOwn(tab,'isAbleDelete')!==false)workerFail('WORKER_SCOPE_DRIFT');
   for(const key of ['parentProjectUuid','parentLibraryUuid'])if(workerOwn(tab,key,true)!==undefined)workerFail('WORKER_SCOPE_DRIFT');
   for(const key of ['pid','owner'])if(workerOwn(data,key,true)!==undefined)workerFail('WORKER_SCOPE_DRIFT');
   if(id==='tab_page1'){if(++starts!==1||type!==-1)workerFail('WORKER_SCOPE_DRIFT');}
   else if(++placeholders!==1||!isNativeProjectPlaceholder(tab)||workerApply(workerTabDirty,tabs,[id])!==false)workerFail('WORKER_SCOPE_DRIFT');
   continue;
  }
  if(++peers!==1||id!==ACTIVE.tabId||type!==3||workerOwn(data,'pid')!==PLAN.projectUuid||workerApply(workerTabDirty,tabs,[id])!==false)workerFail('WORKER_SCOPE_DRIFT');
  const declared=workerOwn(tab,'documentType',true),parent=workerOwn(tab,'parentProjectUuid',true),owner=workerOwn(data,'owner',true),unsaved=workerOwn(tab,'isUnSaved',true);
  if((declared!==undefined&&declared!==3)||(parent!==undefined&&parent!==PLAN.projectUuid)||(owner!==undefined&&owner!==PLAN.ownerUuid)||workerOwn(tab,'parentLibraryUuid',true)!==undefined||(unsaved!==undefined&&unsaved!==false))workerFail('WORKER_SCOPE_DRIFT');
  if(workerPeer===undefined){workerPeer=tab;workerPeerData=data;}else if(workerPeer!==tab||workerPeerData!==data)workerFail('WORKER_SCOPE_DRIFT');
 }
 if(peers!==1)workerFail('WORKER_SCOPE_DRIFT');
 actorGuard();workerState();
 const time=workerApply(workerNow,workerDate,[]);actorGuard();workerState();
 if(!Number.isSafeInteger(time)||time<WORKER.notBeforeMs||time>WORKER.notAfterMs||(workerLastNow!==undefined&&time<workerLastNow))workerFail('WORKER_WINDOW');
 workerLastNow=time;
};
const workerRpc=(topic,args)=>workerApply(workerRpcMethod,bus,[topic,args]);
workerGuard();
`;

export const SYMBOL_WORKER_FINAL_READ_SOURCE = `
stage='worker-client';
const workerClient=workerOwn(await actorAwait(()=>workerRpc('/PrjDB/project/getClient',[PLAN.projectUuid])),'message');
if(workerClient!==WORKER.client)throw new Error('WORKER_CLIENT_DRIFT');
stage='worker-ticket';
const workerTicket=workerOwn(await actorAwait(()=>workerRpc('/PrjDB/project/getMaxTicket',[PLAN.projectUuid])),'message');
if(workerTicket!==WORKER.maxTicket)throw new Error('WORKER_TICKET_DRIFT');
workerGuard();
`;
