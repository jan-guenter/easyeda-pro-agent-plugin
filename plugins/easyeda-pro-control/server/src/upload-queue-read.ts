/** Internal fixed-expression reader. Not connected to an MCP route or executor.
 * This leaf observes two queues. Its caller must separately prove the clean
 * owned launch, old whole-Job exit, profile identity and complete SQL effect.
 */
export const UPLOAD_QUEUE_PROFILE = "easyeda-pro-control.inactive-upload-queues.v1";
export const UPLOAD_QUEUE_TIMEOUT_MS = 10_000;

export interface QueueScope {
  readonly projectUuid: string;
  readonly branchUuid: string;
}

function fields(input: unknown, names: readonly string[]): Record<string, unknown> {
  const prototype: unknown = typeof input === "object" && input !== null ? Object.getPrototypeOf(input) : undefined;
  if (input === null || typeof input !== "object" || Array.isArray(input) ||
    (prototype !== Object.prototype && prototype !== null) ||
    Reflect.ownKeys(input).length !== names.length) {
    throw new Error("UPLOAD_QUEUE_INPUT");
  }
  const result: Record<string, unknown> = {};
  for (const name of names) {
    const descriptor = Object.getOwnPropertyDescriptor(input, name);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { throw new Error("UPLOAD_QUEUE_INPUT"); }
    result[name] = descriptor.value as unknown;
  }
  return result;
}

function scope(input: unknown): QueueScope {
  const value = fields(input, ["projectUuid", "branchUuid"]);
  const branchUuid = value["branchUuid"], projectUuid = value["projectUuid"];
  // Existing page adapters use this bounded native-selector grammar. It excludes
  // Every URL delimiter and percent encoding; neither input is a filesystem path.
  if (typeof projectUuid !== "string" || typeof branchUuid !== "string" ||
    !/^[A-Za-z0-9_-]{1,128}$/u.test(projectUuid) || !/^[A-Za-z0-9_-]{1,128}$/u.test(branchUuid)) {
    throw new Error("UPLOAD_QUEUE_INPUT");
  }
  return { projectUuid, branchUuid };
}

/** Returns a compiler-owned expression, never caller-supplied JavaScript.
 * Exactly three inactive-target RPCs and two CacheStorage.match calls on success.
 * No open, keys, body read, network fallback, Save, navigation or retry.
 */
export function buildUploadQueueReadExpression(input: unknown): string {
  const target = scope(input);
  return `(async()=>{
const target=${JSON.stringify(target)};
let stage='HOST',expired=false,timer;
const bad=()=>{throw new Error('UPLOAD_QUEUE_READ_REFUSED:'+stage);};
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
 const ownerData=own(project,'ownerData');
 const bus=own(host,'messageBus'),busPrototype=Object.getPrototypeOf(bus),rpc=method(bus,'rpcCall');
 const active=own(tabs,'getActiveTab'),all=own(tabs,'getFilterTabs');
 if(typeof active!=='function'||typeof all!=='function')bad();
 const location=root.location,href=location?.href,mode=own(root,'PRO_EDITOR_MODE');
 if(typeof href!=='string'||!new RegExp(${JSON.stringify(String.raw`^https://client/editor\?cll=(?:trace|debug|info|warn|error)#?$`)}).test(href)||location.origin!=='https://client')bad();
 const document=root.document;
 if(!object(document)||document.defaultView!==root||document.nodeType!==9||document.URL!==href)bad();
 if(mode!=='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'&&mode!=='CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM')bad();
 const navigator=root.navigator,serviceWorker=navigator?.serviceWorker;
 if(!serviceWorker||serviceWorker.controller!==null)bad();
 const storage=root.caches,constructor=root.CacheStorage,prototype=constructor?.prototype;
 if(typeof constructor!=='function'||!object(storage)||Object.getPrototypeOf(storage)!==prototype)bad();
 const match=own(prototype,'match');if(typeof match!=='function')bad();
 const setSize=Object.getOwnPropertyDescriptor(Set.prototype,'size')?.get;
 if(typeof setSize!=='function')bad();
 const initialProject=()=>{
  if(!object(project)||Object.getPrototypeOf(project)!==Object.prototype||Reflect.ownKeys(project).length!==12||own(project,'ownerData')!==ownerData||!object(ownerData)||Object.getPrototypeOf(ownerData)!==Object.prototype||Reflect.ownKeys(ownerData).length!==2)bad();
  for(const key of ['projectId','title','isCBB','isPublic','isPublish','settings','branchNum','isV2Format'])if(own(project,key)!==undefined)bad();
  for(const key of ['owner','projectManagerName','branchUuid'])if(own(project,key)!=='')bad();
  for(const key of ['nickname','uuid'])if(own(ownerData,key)!=='')bad();
 };
 const check=()=>{
  if(expired){stage='TIMEOUT';bad();}
  if(root.top!==root||root.window!==root||root.location!==location||location.href!==href||location.origin!=='https://client'||own(root,'PRO_EDITOR_MODE')!==mode||root.navigator!==navigator||navigator.serviceWorker!==serviceWorker||serviceWorker.controller!==null)bad();
  if(root.document!==document||document.defaultView!==root||document.nodeType!==9||document.URL!==href)bad();
  if(own(root,'UI')!==ui||own(root,'gVars')!==host||own(ui,'gVars')!==host||own(ui,'tabBar')!==tabs||own(host,'currentProject')!==project||own(host,'sessionStorageTabs')!==pendingTabs||own(host,'messageBus')!==bus||Object.getPrototypeOf(bus)!==busPrototype||method(bus,'rpcCall')!==rpc)bad();
  if(root.caches!==storage||root.CacheStorage!==constructor||constructor.prototype!==prototype||Object.getPrototypeOf(storage)!==prototype||own(prototype,'match')!==match||root.setTimeout!==deadlineSet||root.clearTimeout!==deadlineClear)bad();
  initialProject();
  if(own(host,'urlCmd')!==null||own(host,'isHistoryMode')!==false||own(tabs,'isOpenProjectDoc')!==true||own(tabs,'isOpenOtherDoc')!==true||apply(setSize,pendingTabs,[])!==0||Reflect.ownKeys(pendingTabs).length!==0)bad();
  if(own(tabs,'getActiveTab')!==active||own(tabs,'getFilterTabs')!==all||apply(active,tabs,[])!=='tab_page1')bad();
  const list=apply(all,tabs,[[]]);
  if(!Array.isArray(list)||own(list,'length')!==1||Reflect.ownKeys(list).length!==2)bad();
  const tab=own(list,'0'),data=own(tab,'data');
  if(own(tab,'tabId')!=='tab_page1'||own(tab,'isAbleDelete')!==false||own(data,'doctype')!==-1)bad();
  for(const key of ['parentProjectUuid','parentLibraryUuid'])if(own(tab,key,true)!==undefined)bad();
  for(const key of ['pid','owner'])if(own(data,key,true)!==undefined)bad();
  const declared=own(tab,'documentType',true);if(declared!==undefined&&declared!==-1)bad();
 };
 const absent=async()=>{
  stage='TARGET_INACTIVE';check();
  const reply=await apply(rpc,bus,['/pro-mgr/hasProject',[target.projectUuid]]);
  check();if(own(reply,'message')!==false)bad();
 };
 const names=['project_'+target.projectUuid+'_v6','localProject_'+target.projectUuid+'_v1'];
 const url='https://client/upload/'+target.branchUuid;
 for(let index=0;index<2;index++){
  await absent();stage=index===0?'PROJECT_CACHE':'LOCAL_CACHE';check();
  const result=await apply(match,storage,[url,{cacheName:names[index],ignoreSearch:true,ignoreMethod:false,ignoreVary:true}]);
  check();if(result!==undefined)bad();
 }
 await absent();stage='RESULT';check();
 return{profile:${JSON.stringify(UPLOAD_QUEUE_PROFILE)},projectUuid:target.projectUuid,branchUuid:target.branchUuid,origin:'https://client',projectV6UploadAbsent:true,localProjectV1UploadAbsent:true,scope:'point-in-time-inactive-target'};
};
try{
 const timeout=new Promise((resolve,reject)=>{timer=apply(deadlineSet,root,[()=>{expired=true;stage='TIMEOUT';reject(new Error('UPLOAD_QUEUE_READ_REFUSED:TIMEOUT'));},${UPLOAD_QUEUE_TIMEOUT_MS}]);});
 return await Promise.race([run(),timeout]);
}catch{throw new Error('UPLOAD_QUEUE_READ_REFUSED:'+stage);}
finally{if(timer!==undefined)apply(deadlineClear,root,[timer]);}
})()`;
}

/** Data validation only. Success is not a branded completion/recovery grant. */
export function validateUploadQueueReadResult(input: unknown, expected: unknown): Readonly<Record<string, unknown>> {
  const target = scope(expected);
  const value = fields(input, ["profile", "projectUuid", "branchUuid", "origin", "projectV6UploadAbsent", "localProjectV1UploadAbsent", "scope"]);
  if (value["profile"] !== UPLOAD_QUEUE_PROFILE || value["projectUuid"] !== target.projectUuid ||
    value["branchUuid"] !== target.branchUuid || value["origin"] !== "https://client" ||
    value["projectV6UploadAbsent"] !== true || value["localProjectV1UploadAbsent"] !== true ||
    value["scope"] !== "point-in-time-inactive-target") { throw new Error("UPLOAD_QUEUE_RESULT"); }
  return Object.freeze(value);
}
