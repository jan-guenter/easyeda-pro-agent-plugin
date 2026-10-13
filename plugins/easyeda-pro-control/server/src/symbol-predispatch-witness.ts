/** Internal fixed read-only observation compiler. No executor, route or authority. */
import { SYMBOL_DUAL_ACTOR_CAPTURE_SOURCE, validateActorProjection } from "./symbol-dual-actor.ts";

export const SYMBOL_WITNESS_PROFILE = "easyeda-pro-control.symbol-predispatch-observation.v2";
export const SYMBOL_WITNESS_TIMEOUT_MS = 10_000;
export interface SymbolPredispatchWitnessScope {
  readonly projectUuid: string;
  readonly branchUuid: string;
  readonly ownerUuid: string;
  readonly targetUuid: string;
  readonly activeUuid: string;
  readonly createdAtLiteral: string;
}

function fields(input: unknown, names: readonly string[]): Record<string, unknown> {
  const prototype: unknown = input !== null && typeof input === "object" ? Object.getPrototypeOf(input) : undefined;
  if (input === null || typeof input !== "object" || Array.isArray(input) ||
      (prototype !== Object.prototype && prototype !== null) || Reflect.ownKeys(input).length !== names.length) {
    throw new Error("SYMBOL_WITNESS_INPUT");
  }
  const result: Record<string, unknown> = {};
  for (const name of names) {
    const descriptor = Object.getOwnPropertyDescriptor(input, name);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { throw new Error("SYMBOL_WITNESS_INPUT"); }
    result[name] = descriptor.value as unknown;
  }
  return result;
}
function scope(input: unknown): SymbolPredispatchWitnessScope {
  const value = fields(input, ["projectUuid", "branchUuid", "ownerUuid", "targetUuid", "activeUuid", "createdAtLiteral"]);
  const activeUuid = value["activeUuid"], ownerUuid = value["ownerUuid"], targetUuid = value["targetUuid"];
  const branchUuid = value["branchUuid"], createdAtLiteral = value["createdAtLiteral"], projectUuid = value["projectUuid"];
  if (typeof projectUuid !== "string" || !/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u.test(projectUuid) ||
      typeof branchUuid !== "string" || !/^[a-f0-9]{32}$/u.test(branchUuid) ||
      typeof ownerUuid !== "string" || !/^[a-f0-9]{32}$/u.test(ownerUuid) ||
      typeof targetUuid !== "string" || !/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u.test(targetUuid) ||
      typeof activeUuid !== "string" || !/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u.test(activeUuid) || activeUuid === targetUuid ||
      typeof createdAtLiteral !== "string" || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/u.test(createdAtLiteral)) {
    throw new Error("SYMBOL_WITNESS_INPUT");
  }
  return { projectUuid, branchUuid, ownerUuid, targetUuid, activeUuid, createdAtLiteral };
}

/** Eight fixed RPCs. Observation coherence is not atomic producer ownership. */
export function buildSymbolWitnessReadExpression(input: unknown): string {
  const target = scope(input);
  return `(async()=>{
const target=${JSON.stringify(target)};
let stage='HOST',expired=false,timer;
const bad=()=>{throw new Error('SYMBOL_WITNESS_READ_REFUSED:'+stage);};
const object=value=>value!==null&&(typeof value==='object'||typeof value==='function')&&!Array.isArray(value);
const own=(owner,key,optional=false)=>{
 if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad();const d=Object.getOwnPropertyDescriptor(owner,key);
 if(!d){if(optional&&!(key in owner))return undefined;bad();}
 if(!Object.hasOwn(d,'value'))bad();return d.value;
};
const method=(owner,key)=>{
 let current=owner;
 for(let depth=0;depth<4&&object(current);depth++){
  const d=Object.getOwnPropertyDescriptor(current,key);
  if(d){if(!Object.hasOwn(d,'value')||typeof d.value!=='function')bad();return d.value;}
  current=Object.getPrototypeOf(current);
 }
 bad();
};
const apply=Reflect.apply,root=globalThis;
const deadlineSet=root.setTimeout,deadlineClear=root.clearTimeout;
if(typeof deadlineSet!=='function'||typeof deadlineClear!=='function')bad();
const run=async()=>{
 if(root.top!==root||root.window!==root)bad();
 const ui=own(root,'UI'),host=own(root,'gVars'),tabs=own(ui,'tabBar');
 if(own(ui,'gVars')!==host)bad();
 const project=own(host,'currentProject'),pendingTabs=own(host,'sessionStorageTabs');
${SYMBOL_DUAL_ACTOR_CAPTURE_SOURCE}
 const bus=own(host,'messageBus'),concurrent=own(host,'concurrentBus');
 const busPrototype=Object.getPrototypeOf(bus),concurrentPrototype=Object.getPrototypeOf(concurrent);
 const rpc=method(bus,'rpcCall'),clockRpc=method(concurrent,'rpcCall');
 const active=own(tabs,'getActiveTab'),all=own(tabs,'getFilterTabs'),dirty=own(tabs,'hasTabUnSaved'),tabDirty=own(tabs,'isTabUnSaved');
 const permission=own(ui,'concurrentDesign'),permissionPrototype=Object.getPrototypeOf(permission),disable=method(permission,'getIframeDisableStatusPanelPcb');
 const activeTabId=target.activeUuid+'@'+target.projectUuid;
 if(typeof active!=='function'||typeof all!=='function'||typeof dirty!=='function'||typeof tabDirty!=='function')bad();
 const location=root.location,href=location?.href,mode=own(root,'PRO_EDITOR_MODE'),document=root.document;
 if(typeof href!=='string'||!new RegExp(${JSON.stringify(String.raw`^https://client/editor\?cll=(?:trace|debug|info|warn|error)#?$`)}).test(href)||location.origin!=='https://client')bad();
 if(!object(document)||document.defaultView!==root||document.nodeType!==9||document.URL!==href)bad();
 if(mode!=='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'&&mode!=='CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM')bad();
 const nativeDate=own(root,'Date'),datePrototype=own(nativeDate,'prototype');
 const now=own(nativeDate,'now'),getTime=own(datePrototype,'getTime'),getOffset=own(datePrototype,'getTimezoneOffset');
 if(typeof nativeDate!=='function'||typeof now!=='function'||typeof getTime!=='function'||typeof getOffset!=='function')bad();
 const parsed=apply(getTime,new nativeDate(target.createdAtLiteral),[]);
 const offset=apply(getOffset,new nativeDate(),[]);
 if(!Number.isSafeInteger(parsed)||!Number.isInteger(offset)||Math.abs(offset)>840)bad();
 const setSize=Object.getOwnPropertyDescriptor(Set.prototype,'size')?.get;
 if(typeof setSize!=='function')bad();
 let retainedPeer,retainedPeerData;
 const check=()=>{
  if(expired){stage='TIMEOUT';bad();}
  if(root.top!==root||root.window!==root||root.location!==location||location.href!==href||location.origin!=='https://client'||root.document!==document||document.defaultView!==root||document.nodeType!==9||document.URL!==href||own(root,'PRO_EDITOR_MODE')!==mode)bad();
  if(own(root,'UI')!==ui||own(root,'gVars')!==host||own(ui,'gVars')!==host||own(ui,'tabBar')!==tabs||own(host,'currentProject')!==project||own(host,'sessionStorageTabs')!==pendingTabs)bad();
  if(own(project,'projectId')!==target.projectUuid||own(project,'branchUuid')!==target.branchUuid||own(project,'isV2Format')!==false)bad();
  checkDualActor();
  if(own(host,'messageBus')!==bus||own(host,'concurrentBus')!==concurrent||Object.getPrototypeOf(bus)!==busPrototype||Object.getPrototypeOf(concurrent)!==concurrentPrototype||method(bus,'rpcCall')!==rpc||method(concurrent,'rpcCall')!==clockRpc)bad();
  if(root.setTimeout!==deadlineSet||root.clearTimeout!==deadlineClear||own(root,'Date')!==nativeDate||own(nativeDate,'prototype')!==datePrototype||own(nativeDate,'now')!==now||own(datePrototype,'getTime')!==getTime||own(datePrototype,'getTimezoneOffset')!==getOffset||apply(getOffset,new nativeDate(),[])!==offset||apply(getTime,new nativeDate(target.createdAtLiteral),[])!==parsed)bad();
  if(own(host,'urlCmd')!==null||own(host,'isHistoryMode')!==false||own(tabs,'isOpenProjectDoc')!==true||own(tabs,'isOpenOtherDoc')!==true||apply(setSize,pendingTabs,[])!==0||Reflect.ownKeys(pendingTabs).length!==0)bad();
  if(own(tabs,'getActiveTab')!==active||own(tabs,'getFilterTabs')!==all||own(tabs,'hasTabUnSaved')!==dirty||own(tabs,'isTabUnSaved')!==tabDirty||apply(active,tabs,[])!==activeTabId||apply(dirty,tabs,[])!==false)bad();
  if(own(ui,'concurrentDesign')!==permission||Object.getPrototypeOf(permission)!==permissionPrototype||own(permission,'_isConcurrentStrictMode')!==false||method(permission,'getIframeDisableStatusPanelPcb')!==disable||own(apply(disable,permission,[activeTabId]),'disable')!==false)bad();
  const list=apply(all,tabs,[[]]);
  if(!Array.isArray(list)||own(list,'length')<1||list.length>3||Reflect.ownKeys(list).length!==list.length+1)bad();
  let peers=0,starts=0,placeholders=0;
  for(let index=0;index<list.length;index++){
   const tab=own(list,String(index)),data=own(tab,'data'),id=own(tab,'tabId'),type=own(data,'doctype'),declared=own(tab,'documentType',true);
   if(id==='tab_page1'||id==='0'){
    if(own(tab,'isAbleDelete')!==false)bad();
    for(const key of ['parentProjectUuid','parentLibraryUuid'])if(own(tab,key,true)!==undefined)bad();
    for(const key of ['pid','owner'])if(own(data,key,true)!==undefined)bad();
    if(id==='tab_page1'){if(++starts!==1||type!==-1||(declared!==undefined&&declared!==-1))bad();}
    else if(++placeholders!==1||type!==0||(declared!==undefined&&declared!==0)||own(tab,'isDisplayNone')!==true||own(tab,'draggable')!==false||own(tab,'group')!=='start_blank'||apply(tabDirty,tabs,[id])!==false||(own(tab,'isUnSaved',true)!==undefined&&own(tab,'isUnSaved')!==false))bad();
    continue;
   }
   if(++peers!==1||id!==activeTabId||type!==3||(declared!==undefined&&declared!==3)||own(data,'pid')!==target.projectUuid||apply(tabDirty,tabs,[id])!==false)bad();
   const parent=own(tab,'parentProjectUuid',true),owner=own(data,'owner',true),unsaved=own(tab,'isUnSaved',true);
   if((parent!==undefined&&parent!==target.projectUuid)||(owner!==undefined&&owner!==target.ownerUuid)||own(tab,'parentLibraryUuid',true)!==undefined||(unsaved!==undefined&&unsaved!==false))bad();
   if(retainedPeer===undefined){retainedPeer=tab;retainedPeerData=data;}else if(retainedPeer!==tab||retainedPeerData!==data)bad();
  }
  if(peers!==1)bad();
 };
 const read=async(topic,label)=>{
  stage=label;check();const result=await apply(rpc,bus,[topic,[target.projectUuid]]);check();return own(result,'message');
 };
 const projectCheck=async()=>{
  const value=await read('/PrjDB/project/getData','PROJECT');
  if(own(value,'uuid')!==target.projectUuid||own(value,'currentBranch')!==target.branchUuid||own(value,'isV2Format')!==false||own(own(value,'owner'),'uuid')!==target.ownerUuid)bad();
 };
 const clock=async()=>{
  stage='WORKER_CLOCK';check();const value=await apply(clockRpc,concurrent,['/pro-mgr/serverTime/now']);check();
  if(!Number.isSafeInteger(value)||value<0)bad();return value;
 };
 stage='READ_BEGIN';check();const rendererClockBeforeMs=apply(now,nativeDate,[]);
 await projectCheck();
 const client=await read('/PrjDB/project/getClient','CLIENT');
 if(typeof client!=='string'||!/^[a-f0-9]{16}$/.test(client))bad();
 const ticket=await read('/PrjDB/project/getMaxTicket','TICKET');
 if(!Number.isSafeInteger(ticket)||ticket<0||ticket>=Number.MAX_SAFE_INTEGER)bad();
 const workerTimeBeforeMs=await clock();
 await projectCheck();
 if(await read('/PrjDB/project/getClient','CLIENT')!==client)bad();
 if(await read('/PrjDB/project/getMaxTicket','TICKET')!==ticket)bad();
 const workerTimeAfterMs=await clock();
 stage='RESULT';check();const rendererClockAfterMs=apply(now,nativeDate,[]);
 for(const value of [rendererClockBeforeMs,rendererClockAfterMs])if(!Number.isSafeInteger(value)||value<0)bad();
 if(workerTimeAfterMs<workerTimeBeforeMs||workerTimeAfterMs-workerTimeBeforeMs>${SYMBOL_WITNESS_TIMEOUT_MS}||rendererClockAfterMs<rendererClockBeforeMs||rendererClockAfterMs-rendererClockBeforeMs>${SYMBOL_WITNESS_TIMEOUT_MS})bad();
 return{profile:${JSON.stringify(SYMBOL_WITNESS_PROFILE)},...target,workerClient:client,workerMaxTicket:ticket,workerTimeBeforeMs,workerTimeAfterMs,cachedActorUuid:actorUuid,startupActor:startupActorProjection,cachedActor:cachedActorProjection,rendererParsedCreatedAtMs:parsed,rendererTimezoneOffsetMinutes:offset,rendererClockBeforeMs,rendererClockAfterMs,scope:'point-in-time-read-only-observation',appActorVerified:false,appClockVerified:false,workerFreshOfflineClockVerified:false,producerBindingVerified:false,executionAuthorized:false};
};
try{
 const timeout=new Promise((resolve,reject)=>{timer=apply(deadlineSet,root,[()=>{expired=true;stage='TIMEOUT';reject(new Error('SYMBOL_WITNESS_READ_REFUSED:TIMEOUT'));},${SYMBOL_WITNESS_TIMEOUT_MS}]);});
 return await Promise.race([run(),timeout]);
}catch{throw new Error('SYMBOL_WITNESS_READ_REFUSED:'+stage);}
finally{if(timer!==undefined)apply(deadlineClear,root,[timer]);}
})()`;
}

/** Shape checks only: this function cannot convert observations into authority. */
export function validateSymbolWitnessReadResult(input: unknown, expected: unknown): Readonly<Record<string, unknown>> {
  const target = scope(expected);
  const value = fields(input, ["profile", "projectUuid", "branchUuid", "ownerUuid", "targetUuid", "activeUuid", "createdAtLiteral", "workerClient", "workerMaxTicket",
    "workerTimeBeforeMs", "workerTimeAfterMs", "cachedActorUuid", "startupActor", "cachedActor", "rendererParsedCreatedAtMs", "rendererTimezoneOffsetMinutes",
    "rendererClockBeforeMs", "rendererClockAfterMs", "scope", "appActorVerified", "appClockVerified",
    "workerFreshOfflineClockVerified", "producerBindingVerified", "executionAuthorized"]);
  if (value["profile"] !== SYMBOL_WITNESS_PROFILE || value["scope"] !== "point-in-time-read-only-observation" ||
      Object.entries(target).some(([key, entry]) => value[key] !== entry)) { throw new Error("SYMBOL_WITNESS_RESULT"); }
  for (const field of ["workerClient", "cachedActorUuid"] as const) {
    if (typeof value[field] !== "string" || !(field === "workerClient" ? /^[a-f0-9]{16}$/u : /^[a-f0-9]{32}$/u).test(value[field])) {
      throw new Error("SYMBOL_WITNESS_RESULT");
    }
  }
  for (const field of ["workerMaxTicket", "workerTimeBeforeMs", "workerTimeAfterMs", "rendererClockBeforeMs", "rendererClockAfterMs"] as const) {
    if (typeof value[field] !== "number" || !Number.isSafeInteger(value[field]) || value[field] < 0) { throw new Error("SYMBOL_WITNESS_RESULT"); }
  }
  const offset = value["rendererTimezoneOffsetMinutes"], parsed = value["rendererParsedCreatedAtMs"], ticket = value["workerMaxTicket"];
  if (typeof ticket !== "number" || ticket >= Number.MAX_SAFE_INTEGER || typeof parsed !== "number" || !Number.isSafeInteger(parsed) ||
      typeof offset !== "number" || !Number.isInteger(offset) || Math.abs(offset) > 840) { throw new Error("SYMBOL_WITNESS_RESULT"); }
  for (const [begin, end] of [["workerTimeBeforeMs", "workerTimeAfterMs"], ["rendererClockBeforeMs", "rendererClockAfterMs"]] as const) {
    const a = value[begin], b = value[end];
    if (typeof a !== "number" || typeof b !== "number" || b < a || b - a > SYMBOL_WITNESS_TIMEOUT_MS) { throw new Error("SYMBOL_WITNESS_RESULT"); }
  }
  for (const field of ["appActorVerified", "appClockVerified", "workerFreshOfflineClockVerified", "producerBindingVerified", "executionAuthorized"]) {
    if (value[field] !== false) { throw new Error("SYMBOL_WITNESS_RESULT"); }
  }
  const cachedActor = validateActorProjection(value["cachedActor"]), startupActor = validateActorProjection(value["startupActor"]);
  if (startupActor.uuid !== value["cachedActorUuid"] || cachedActor.uuid !== startupActor.uuid || cachedActor.username !== startupActor.username ||
      cachedActor.nickname !== (startupActor.nickname || "")) { throw new Error("SYMBOL_WITNESS_RESULT"); }
  return Object.freeze({ ...value, startupActor, cachedActor });
}
