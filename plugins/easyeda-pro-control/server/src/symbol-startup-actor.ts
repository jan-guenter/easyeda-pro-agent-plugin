/** Internal fixed StartPage data observer. No transport, mutation or ownership. */
import { SYMBOL_DUAL_ACTOR_CAPTURE_SOURCE, validateActorProjection } from "./symbol-dual-actor.ts";

export const STARTUP_ACTOR_PROFILE = "easyeda-pro-control.symbol-startup-actor-observation.v1";

export function buildStartupActorReadExpression(): string {
  return `(()=>{
const root=globalThis,apply=Reflect.apply;
const bad=()=>{throw new Error('STARTUP_ACTOR_READ_REFUSED');};
const object=value=>value!==null&&(typeof value==='object'||typeof value==='function')&&!Array.isArray(value);
const own=(owner,key,optional=false)=>{
 if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad();const d=Object.getOwnPropertyDescriptor(owner,key);
 if(!d){if(optional&&!(key in owner))return undefined;bad();}
 if(!Object.hasOwn(d,'value'))bad();return d.value;
};
try{
 if(root.top!==root||root.window!==root)bad();
 const ui=own(root,'UI'),host=own(root,'gVars'),tabs=own(ui,'tabBar');
 if(own(ui,'gVars')!==host)bad();
 const project=own(host,'currentProject'),ownerData=own(project,'ownerData'),pendingTabs=own(host,'sessionStorageTabs');
 const active=own(tabs,'getActiveTab'),all=own(tabs,'getFilterTabs'),dirty=own(tabs,'hasTabUnSaved'),tabDirty=own(tabs,'isTabUnSaved');
 if(typeof active!=='function'||typeof all!=='function'||typeof dirty!=='function'||typeof tabDirty!=='function')bad();
 const location=root.location,href=location?.href,mode=own(root,'PRO_EDITOR_MODE'),document=root.document;
 if(typeof href!=='string'||!new RegExp(${JSON.stringify(String.raw`^https://client/editor\?cll=(?:trace|debug|info|warn|error)#?$`)}).test(href)||location.origin!=='https://client')bad();
 if(!object(document)||document.defaultView!==root||document.nodeType!==9||document.URL!==href)bad();
 if(mode!=='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'&&mode!=='CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM')bad();
 ${SYMBOL_DUAL_ACTOR_CAPTURE_SOURCE}
 const setSize=Object.getOwnPropertyDescriptor(Set.prototype,'size')?.get;
 if(typeof setSize!=='function')bad();
 let retainedTab,retainedData;
 const frame=()=>{
  if(root.top!==root||root.window!==root||root.location!==location||location.href!==href||location.origin!=='https://client'||root.document!==document||document.defaultView!==root||document.nodeType!==9||document.URL!==href||own(root,'PRO_EDITOR_MODE')!==mode)bad();
  if(own(root,'UI')!==ui||own(root,'gVars')!==host||own(ui,'gVars')!==host||own(ui,'tabBar')!==tabs||own(host,'currentProject')!==project||own(host,'sessionStorageTabs')!==pendingTabs)bad();
  checkDualActor();
 };
 const state=()=>{
  frame();
  if(!object(project)||Object.getPrototypeOf(project)!==Object.prototype||Reflect.ownKeys(project).length!==12||own(project,'ownerData')!==ownerData||!object(ownerData)||Object.getPrototypeOf(ownerData)!==Object.prototype||Reflect.ownKeys(ownerData).length!==2)bad();
  for(const key of ['projectId','title','isCBB','isPublic','isPublish','settings','branchNum','isV2Format'])if(own(project,key)!==undefined)bad();
  for(const key of ['owner','projectManagerName','branchUuid'])if(own(project,key)!=='')bad();
  for(const key of ['nickname','uuid'])if(own(ownerData,key)!=='')bad();
  if(own(host,'urlCmd')!==null||own(host,'isHistoryMode')!==false||own(tabs,'isOpenProjectDoc')!==true||own(tabs,'isOpenOtherDoc')!==true||apply(setSize,pendingTabs,[])!==0||Reflect.ownKeys(pendingTabs).length!==0)bad();
  if(own(tabs,'getActiveTab')!==active||own(tabs,'getFilterTabs')!==all||own(tabs,'hasTabUnSaved')!==dirty||own(tabs,'isTabUnSaved')!==tabDirty)bad();
 };
 const check=()=>{
  state();
  if(apply(active,tabs,[])!=='tab_page1'||apply(dirty,tabs,[])!==false||apply(tabDirty,tabs,['tab_page1'])!==false)bad();
  const list=apply(all,tabs,[[]]);
  if(!Array.isArray(list)||own(list,'length')!==1||Reflect.ownKeys(list).length!==2)bad();
  const tab=own(list,'0'),data=own(tab,'data');
  if(own(tab,'tabId')!=='tab_page1'||own(tab,'isAbleDelete')!==false||own(data,'doctype')!==-1)bad();
  for(const key of ['parentProjectUuid','parentLibraryUuid'])if(own(tab,key,true)!==undefined)bad();
  for(const key of ['pid','owner'])if(own(data,key,true)!==undefined)bad();
  const declared=own(tab,'documentType',true);if(declared!==undefined&&declared!==-1)bad();
  if(retainedTab===undefined){retainedTab=tab;retainedData=data;}else if(retainedTab!==tab||retainedData!==data)bad();
  state();
 };
 check();check();
 return{profile:${JSON.stringify(STARTUP_ACTOR_PROFILE)},origin:'https://client',scope:'point-in-time-start-page',startupActor:startupActorProjection,cachedActor:cachedActorProjection,appActorVerified:false,appClockVerified:false,workerFreshOfflineClockVerified:false,producerBindingVerified:false,executionAuthorized:false};
}catch{throw new Error('STARTUP_ACTOR_READ_REFUSED');}
})()`;
}

export function validateStartupActorReadResult(input: unknown): Readonly<Record<string, unknown>> {
  const expected = { profile: STARTUP_ACTOR_PROFILE, origin: "https://client", scope: "point-in-time-start-page", appActorVerified: false,
    appClockVerified: false, workerFreshOfflineClockVerified: false, producerBindingVerified: false, executionAuthorized: false };
  if (input === null || typeof input !== "object" || Array.isArray(input) ||
      (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null) || Reflect.ownKeys(input).length !== 10) {
    throw new Error("STARTUP_ACTOR_RESULT");
  }
  for (const [key, value] of Object.entries(expected)) {
    const field = Object.getOwnPropertyDescriptor(input, key);
    if (field === undefined || !Object.hasOwn(field, "value") || field.value !== value) { throw new Error("STARTUP_ACTOR_RESULT"); }
  }
  const read = (key: string): unknown => {
    const field = Object.getOwnPropertyDescriptor(input, key);
    if (field === undefined || !Object.hasOwn(field, "value")) { throw new Error("STARTUP_ACTOR_RESULT"); }
    return field.value as unknown;
  };
  const cachedActor = validateActorProjection(read("cachedActor")), startupActor = validateActorProjection(read("startupActor"));
  if (cachedActor.uuid !== startupActor.uuid || cachedActor.username !== startupActor.username ||
      cachedActor.nickname !== (startupActor.nickname || "")) { throw new Error("STARTUP_ACTOR_RESULT"); }
  return Object.freeze({ ...expected, startupActor, cachedActor });
}
