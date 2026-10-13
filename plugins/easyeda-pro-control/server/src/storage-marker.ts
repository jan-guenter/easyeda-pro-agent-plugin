/** Internal fixed marker leaf. No transport, journal ownership or completion authority.
 * The coordinator must prove fresh owned startup, SW/target-queue absence and
 * consume its one-shot mutation intent BEFORE executing the create expression.
 */
export const STORAGE_MARKER_DESCRIPTOR = "easyeda-pro-control.storage-marker-descriptor.v1";
export const STORAGE_MARKER_RESULT = "easyeda-pro-control.storage-marker-observation.v1";
export const STORAGE_MARKER_TIMEOUT_MS = 10_000;

export interface StorageMarkerDescriptor {
  readonly profile: typeof STORAGE_MARKER_DESCRIPTOR;
  readonly namespaceNonce: string;
  readonly keyNonce: string;
  readonly bodyNonce: string;
}

function fields(input: unknown, names: readonly string[], error: string): Record<string, unknown> {
  const prototype: unknown = input !== null && typeof input === "object" ? Object.getPrototypeOf(input) : undefined;
  if (input === null || typeof input !== "object" || Array.isArray(input) ||
    (prototype !== Object.prototype && prototype !== null) || Reflect.ownKeys(input).length !== names.length) {
    throw new Error(error);
  }
  const result: Record<string, unknown> = {};
  for (const name of names) {
    const descriptor = Object.getOwnPropertyDescriptor(input, name);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { throw new Error(error); }
    result[name] = descriptor.value as unknown;
  }
  return result;
}

/** Shape validation cannot prove randomness, journal ownership or permission. */
export function parseStorageMarkerDescriptor(input: unknown): StorageMarkerDescriptor {
  const value = fields(input, ["profile", "namespaceNonce", "keyNonce", "bodyNonce"], "STORAGE_MARKER_INPUT");
  const bodyNonce = value["bodyNonce"], keyNonce = value["keyNonce"], namespaceNonce = value["namespaceNonce"];
  if (value["profile"] !== STORAGE_MARKER_DESCRIPTOR || typeof namespaceNonce !== "string" ||
    typeof keyNonce !== "string" || typeof bodyNonce !== "string" ||
    !/^[a-f0-9]{64}$/u.test(namespaceNonce) || !/^[a-f0-9]{64}$/u.test(keyNonce) || !/^[a-f0-9]{64}$/u.test(bodyNonce)) {
    throw new Error("STORAGE_MARKER_INPUT");
  }
  return Object.freeze({ profile: STORAGE_MARKER_DESCRIPTOR, namespaceNonce, keyNonce, bodyNonce });
}

function expression(input: unknown, create: boolean): string {
  const marker = parseStorageMarkerDescriptor(input);
  // Separate passive readers remain prerequisites. This leaf retains the same
  // Source-native Start Page shape and controller absence through its own awaits.
  return `(async()=>{
const marker=${JSON.stringify(marker)};
const cacheName='easyeda-pro-agent.storage-continuity.v1.'+marker.namespaceNonce;
const key='https://client/.easyeda-pro-agent/storage-continuity/v1/'+marker.keyNonce;
const root=globalThis,apply=Reflect.apply;
let stage='HOST',expired=false,timer,clear,cleanup=()=>{};
const bad=()=>{throw new Error('STORAGE_MARKER_REFUSED:'+stage);};
const object=value=>value!==null&&(typeof value==='object'||typeof value==='function')&&!Array.isArray(value);
const descriptor=(owner,name)=>{if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad();const d=Object.getOwnPropertyDescriptor(owner,name);if(!d)bad();return d;};
const data=(owner,name,optional=false)=>{
 if(optional&&object(owner)&&!Object.hasOwn(owner,name)&&!(name in owner))return undefined;
 const d=descriptor(owner,name);if(!Object.hasOwn(d,'value'))bad();return d.value;
};
const getter=(owner,name)=>{const d=descriptor(owner,name);if(typeof d.get!=='function'||d.set!==undefined)bad();return d.get;};
const fn=(owner,name)=>{const value=data(owner,name);if(typeof value!=='function')bad();return value;};
const noShadow=(owner,names)=>{for(const name of names)if(Object.hasOwn(owner,name))bad();};
const interfaces=[];
const face=(name)=>{const constructor=root[name],prototype=constructor?.prototype;if(typeof constructor!=='function'||!object(prototype))bad();const value={name,constructor,prototype,methods:[],getters:[]};interfaces.push(value);return value;};
const method=(face,name)=>{const value=fn(face.prototype,name);face.methods.push([name,value]);return value;};
const access=(face,name)=>{const value=getter(face.prototype,name);face.getters.push([name,value]);return value;};
try{
 const set=root.setTimeout;clear=root.clearTimeout;if(typeof set!=='function'||typeof clear!=='function')bad();
 const location=root.location,href=location?.href,document=root.document;
 const mode=data(root,'PRO_EDITOR_MODE');
 if(typeof href!=='string'||!new RegExp(${JSON.stringify(String.raw`^https://client/editor\?cll=(?:trace|debug|info|warn|error)#?$`)}).test(href)||location.origin!=='https://client')bad();
 if(mode!=='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'&&mode!=='CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM')bad();
 const ui=data(root,'UI'),host=data(root,'gVars'),tabs=data(ui,'tabBar');
 const project=data(host,'currentProject'),ownerData=data(project,'ownerData'),pendingTabs=data(host,'sessionStorageTabs');
 const active=fn(tabs,'getActiveTab'),all=fn(tabs,'getFilterTabs');
 const setSize=getter(Set.prototype,'size');
 const navFace=face('Navigator'),swFace=face('ServiceWorkerContainer');
 const getContainer=access(navFace,'serviceWorker'),getController=access(swFace,'controller');
 const navigator=root.navigator;
 if(Object.getPrototypeOf(navigator)!==navFace.prototype)bad();noShadow(navigator,['serviceWorker']);
 const container=apply(getContainer,navigator,[]);
 if(!object(container)||Object.getPrototypeOf(container)!==swFace.prototype)bad();noShadow(container,['controller']);
 const storageFace=face('CacheStorage'),storage=root.caches,match=method(storageFace,'match');
 if(!object(storage)||Object.getPrototypeOf(storage)!==storageFace.prototype)bad();noShadow(storage,['match']);
 const responseFace=face('Response'),headerFace=face('Headers'),streamFace=face('ReadableStream'),readerFace=face('ReadableStreamDefaultReader');
 const responseGetters={};for(const name of ['status','statusText','type','url','redirected','bodyUsed','headers','body'])responseGetters[name]=access(responseFace,name);
 const eachHeader=method(headerFace,'forEach'),getReader=method(streamFace,'getReader'),streamLocked=access(streamFace,'locked');
 const read=method(readerFace,'read'),cancel=method(readerFace,'cancel'),release=method(readerFace,'releaseLock');
 const bytesFace=face('Uint8Array'),typedPrototype=Object.getPrototypeOf(bytesFace.prototype),byteLength=getter(typedPrototype,'byteLength');
 let extraCheck=()=>{};
 const check=()=>{
  if(expired){stage='TIMEOUT';bad();}
  if(root.top!==root||root.window!==root||root.location!==location||location.href!==href||location.origin!=='https://client'||root.document!==document||!object(document)||document.nodeType!==9||document.defaultView!==root||document.URL!==href||data(root,'PRO_EDITOR_MODE')!==mode)bad();
  if(data(root,'UI')!==ui||data(root,'gVars')!==host||data(ui,'gVars')!==host||data(ui,'tabBar')!==tabs||data(host,'currentProject')!==project||data(host,'sessionStorageTabs')!==pendingTabs||data(project,'ownerData')!==ownerData)bad();
  if(Object.getPrototypeOf(project)!==Object.prototype||Reflect.ownKeys(project).length!==12||!object(ownerData)||Object.getPrototypeOf(ownerData)!==Object.prototype||Reflect.ownKeys(ownerData).length!==2)bad();
  for(const name of ['projectId','title','isCBB','isPublic','isPublish','settings','branchNum','isV2Format'])if(data(project,name)!==undefined)bad();
  for(const name of ['owner','projectManagerName','branchUuid'])if(data(project,name)!=='')bad();
  for(const name of ['nickname','uuid'])if(data(ownerData,name)!=='')bad();
  if(data(host,'urlCmd')!==null||data(host,'isHistoryMode')!==false||data(tabs,'isOpenProjectDoc')!==true||data(tabs,'isOpenOtherDoc')!==true||apply(setSize,pendingTabs,[])!==0||Reflect.ownKeys(pendingTabs).length!==0)bad();
  if(fn(tabs,'getActiveTab')!==active||fn(tabs,'getFilterTabs')!==all||apply(active,tabs,[])!=='tab_page1')bad();
  const list=apply(all,tabs,[[]]);if(!Array.isArray(list)||data(list,'length')!==1||Reflect.ownKeys(list).length!==2)bad();
  const tab=data(list,'0'),tabData=data(tab,'data');if(data(tab,'tabId')!=='tab_page1'||data(tab,'isAbleDelete')!==false||data(tabData,'doctype')!==-1)bad();
  for(const name of ['parentProjectUuid','parentLibraryUuid'])if(data(tab,name,true)!==undefined)bad();
  for(const name of ['pid','owner'])if(data(tabData,name,true)!==undefined)bad();
  const declared=data(tab,'documentType',true);if(declared!==undefined&&declared!==-1)bad();
  for(const face of interfaces){if(root[face.name]!==face.constructor||face.constructor.prototype!==face.prototype)bad();for(const [name,value]of face.methods)if(fn(face.prototype,name)!==value)bad();for(const [name,value]of face.getters)if(getter(face.prototype,name)!==value)bad();}
  if(root.navigator!==navigator||Object.getPrototypeOf(navigator)!==navFace.prototype||apply(getContainer,navigator,[])!==container||Object.getPrototypeOf(container)!==swFace.prototype||apply(getController,container,[])!==null)bad();noShadow(navigator,['serviceWorker']);noShadow(container,['controller']);
  if(root.caches!==storage||Object.getPrototypeOf(storage)!==storageFace.prototype||root.setTimeout!==set||root.clearTimeout!==clear||Object.getPrototypeOf(bytesFace.prototype)!==typedPrototype||getter(typedPrototype,'byteLength')!==byteLength||getter(Set.prototype,'size')!==setSize)bad();noShadow(storage,['match']);extraCheck();
 };
 const observe=async()=>{
  stage='MATCH';check();const response=await apply(match,storage,[key,{cacheName,ignoreSearch:false,ignoreMethod:false,ignoreVary:false}]);check();
  if(!object(response)||Object.getPrototypeOf(response)!==responseFace.prototype)bad();noShadow(response,Object.keys(responseGetters));
  const field=name=>apply(responseGetters[name],response,[]);
  const metadata=consumed=>{if(field('status')!==200||field('statusText')!==''||field('type')!=='default'||field('url')!==''||field('redirected')!==false||field('bodyUsed')!==consumed)bad();};metadata(false);
  const headers=field('headers');if(!object(headers)||Object.getPrototypeOf(headers)!==headerFace.prototype)bad();noShadow(headers,['forEach']);
  const headersExact=()=>{let content=false,tag=false,count=0;apply(eachHeader,headers,[(value,name)=>{count++;if(count>2)bad();if(name==='content-type'&&value==='application/octet-stream'&&!content)content=true;else if(name==='x-easyeda-pro-agent-marker'&&value==='1'&&!tag)tag=true;else bad();}]);if(count!==2||!content||!tag)bad();};headersExact();
  const stream=field('body');if(!object(stream)||Object.getPrototypeOf(stream)!==streamFace.prototype)bad();noShadow(stream,['getReader','locked']);if(apply(streamLocked,stream,[])!==false)bad();
  const reader=apply(getReader,stream,[]);if(!object(reader)||Object.getPrototypeOf(reader)!==readerFace.prototype)bad();noShadow(reader,['read','cancel','releaseLock']);
  let done=false,total=0,cleanupPending=true;
  const finish=()=>{
   if(!cleanupPending)return;cleanupPending=false;
   if(!done){try{const pending=apply(cancel,reader,[]);Promise.resolve(pending).catch(()=>{});}catch{}}
   try{apply(release,reader,[]);}catch{}
  };cleanup=finish;
  try{
   for(let iteration=0;iteration<128;iteration++){
    stage='BODY';check();const part=await apply(read,reader,[]);check();
    if(Object.getPrototypeOf(response)!==responseFace.prototype||field('headers')!==headers||field('body')!==stream||Object.getPrototypeOf(headers)!==headerFace.prototype||Object.getPrototypeOf(stream)!==streamFace.prototype||Object.getPrototypeOf(reader)!==readerFace.prototype)bad();
    noShadow(response,Object.keys(responseGetters));noShadow(headers,['forEach']);noShadow(stream,['getReader','locked']);noShadow(reader,['read','cancel','releaseLock']);
    metadata(true);headersExact();
    if(!object(part)||Object.getPrototypeOf(part)!==Object.prototype||Reflect.ownKeys(part).length!==2)bad();const ended=data(part,'done'),chunk=data(part,'value');
    if(ended===true){if(chunk!==undefined||total!==64)bad();done=true;return;}
    if(ended!==false||!object(chunk)||Object.getPrototypeOf(chunk)!==bytesFace.prototype)bad();
    const size=apply(byteLength,chunk,[]);if(size>64-total)bad();
    for(let index=0;index<size;index++)if(chunk[index]!==marker.bodyNonce.charCodeAt(total+index))bad();total+=size;
   }
   bad();
  }finally{finish();}
 };
 ${create ? `const cacheFace=face('Cache'),requestFace=face('Request'),has=method(storageFace,'has'),open=method(storageFace,'open'),put=method(cacheFace,'put'),keys=method(cacheFace,'keys');
 const requestUrl=access(requestFace,'url'),requestMethod=access(requestFace,'method');
 let cache;
 extraCheck=()=>{noShadow(storage,['has','open']);if(cache!==undefined){if(!object(cache)||Object.getPrototypeOf(cache)!==cacheFace.prototype)bad();noShadow(cache,['put','keys']);}};
 const ownKeys=async expected=>{
  stage='OWN_KEYS';check();const list=await apply(keys,cache,[]);check();
  if(!Array.isArray(list)||Object.getPrototypeOf(list)!==Array.prototype||data(list,'length')!==expected||Reflect.ownKeys(list).length!==expected+1)bad();
  if(expected===1){const request=data(list,'0');if(!object(request)||Object.getPrototypeOf(request)!==requestFace.prototype)bad();noShadow(request,['url','method']);if(apply(requestUrl,request,[])!==key||apply(requestMethod,request,[])!=='GET')bad();}
 };
 const run=async()=>{
  stage='HAS';check();const present=await apply(has,storage,[cacheName]);check();if(present!==false)bad();
  stage='OPEN';check();cache=await apply(open,storage,[cacheName]);check();await ownKeys(0);
  stage='PUT';check();const request=new requestFace.constructor(key,{method:'GET'}),response=new responseFace.constructor(marker.bodyNonce,{status:200,statusText:'',headers:{'content-type':'application/octet-stream','x-easyeda-pro-agent-marker':'1'}});
  check();const result=await apply(put,cache,[request,response]);check();if(result!==undefined)bad();
  await observe();await ownKeys(1);stage='RESULT';check();return resultValue;
 };` : `const run=async()=>{check();await observe();stage='RESULT';check();return resultValue;};`}
 const resultValue={profile:${JSON.stringify(STORAGE_MARKER_RESULT)},namespaceNonce:marker.namespaceNonce,keyNonce:marker.keyNonce,bodyNonce:marker.bodyNonce,origin:'https://client',mode:${JSON.stringify(create ? "created-and-readback" : "observed-present")},scope:'point-in-time-plugin-owned-marker'};
 const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;stage='TIMEOUT';cleanup();reject(new Error('STORAGE_MARKER_REFUSED:TIMEOUT'));},${STORAGE_MARKER_TIMEOUT_MS}]);});
 return await Promise.race([run(),timeout]);
}catch{throw new Error('STORAGE_MARKER_REFUSED:'+stage);}
finally{cleanup();if(timer!==undefined&&typeof clear==='function')apply(clear,root,[timer]);}
})()`;
}

/** Mutates one disjoint namespace. Caller must journal its one allowed dispatch. */
export function buildStorageMarkerCreateExpression(input: unknown): string { return expression(input, true); }

/** Noncreating read. Missing/mismatched markers never cause a write or fallback. */
export function buildStorageMarkerReadExpression(input: unknown): string { return expression(input, false); }

/** Data only. A result cannot establish generation, lifecycle or journal authority. */
export function validateStorageMarkerResult(input: unknown, descriptor: unknown, mode: "created-and-readback" | "observed-present"): Readonly<Record<string, unknown>> {
  const marker = parseStorageMarkerDescriptor(descriptor);
  if (mode !== "created-and-readback" && mode !== "observed-present") { throw new Error("STORAGE_MARKER_RESULT"); }
  const expected = { profile: STORAGE_MARKER_RESULT, namespaceNonce: marker.namespaceNonce, keyNonce: marker.keyNonce, bodyNonce: marker.bodyNonce, origin: "https://client", mode, scope: "point-in-time-plugin-owned-marker" };
  const value = fields(input, Object.keys(expected), "STORAGE_MARKER_RESULT");
  for (const [name, item] of Object.entries(expected)) { if (value[name] !== item) { throw new Error("STORAGE_MARKER_RESULT"); } }
  return Object.freeze(value);
}
