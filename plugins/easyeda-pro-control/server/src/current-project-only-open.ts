import { z } from "zod";
import { assertUpstreamReplySettled, extractToolPayload } from "./core.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import { buildCurrentStartPageGuard } from "./current-start-page.ts";
import { EXACT_READ_ENVELOPE_SCHEMA, decodeExactReadEnvelope } from "./exact-readers.ts";

// The upstream executor accepts at most 60 seconds. The inner deadline expires
// First, but neither deadline cancels a native call already in progress.
export const CURRENT_PROJECT_ONLY_OPEN_TIMEOUT_MS = 60_000;
export const CURRENT_PROJECT_ONLY_OPEN_MAX_BYTES = 16_384;
export const currentProjectOnlyOpenResultSchema = z.object({
  ok: z.literal(true), kind: z.literal("current-project-only-open"),
  projectUuid: z.string().regex(/^[a-f0-9]{64}$/u), branchUuid: z.string().regex(/^[a-f0-9]{32}$/u),
  projectPathMatched: z.literal(true), projectPresent: z.literal(true), publicResult: z.literal(true),
  navigationDispatched: z.literal(true), inactiveUploadCachesObserved: z.literal(true),
  loadProjectCompletedObserved: z.literal(true), prefixEventProducerVerified: z.literal(false),
  noEditorTabsObserved: z.literal(true), restoreSetEmptyObserved: z.literal(true), urlCommandAbsentObserved: z.literal(true),
  currentTabId: z.enum(["tab_page1", "0"]), documentNavigationDispatched: z.literal(false), explicitSaveDispatched: z.literal(false),
  restorationCompletionVerified: z.literal(false), runtimeExamStateVerified: z.literal(false), startupQualified: z.literal(false),
  openingEffectsVerified: z.literal(false), persistenceVerified: z.literal(false), writerAuthority: z.literal(false), executionAuthorized: z.literal(false),
}).strict();
export type CurrentProjectOnlyOpenResult = z.infer<typeof currentProjectOnlyOpenResultSchema>;

function fields(input: unknown, names: readonly string[]): Record<string, unknown> {
  if (input === null || typeof input !== "object" || Array.isArray(input) ||
    (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null) || Reflect.ownKeys(input).length !== names.length) {
    throw new Error("CURRENT_PROJECT_ONLY_OPEN_SHAPE");
  }
  const value: Record<string, unknown> = {};
  for (const name of names) {
    const descriptor = Object.getOwnPropertyDescriptor(input, name);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { throw new Error("CURRENT_PROJECT_ONLY_OPEN_SHAPE"); }
    value[name] = descriptor.value as unknown;
  }
  return value;
}
function target(input: unknown): z.infer<typeof currentDisposableOpenSealedTargetSchema> {
  return currentDisposableOpenSealedTargetSchema.parse(fields(input, ["rawWindowsPath", "projectUuid", "documentUuid", "expectedSourceSha256", "branchUuid"]));
}

/** One ordinary public project open, never an explicit document open or Save.
 * The coordinator must own the one-shot journal, source/session continuity and
 * historical premises. Fresh inactive-target/cache observations are sequential,
 * not a lock. Native background restoration and automatic writes remain possible;
 * the final Start/hidden-blank sample is not their completion barrier.
 */
export function buildCurrentProjectOnlyOpenProgram(input: unknown): string {
  const selected = target(input);
  const projected = { rawWindowsPath: selected.rawWindowsPath, projectUuid: selected.projectUuid, branchUuid: selected.branchUuid };
  return `const observation=await(async()=>{
const target=${JSON.stringify(projected)},root=globalThis,apply=Reflect.apply;
let stage='HOST',expired=false,timer,clear,cleanup;
const bad=()=>{throw new Error('CURRENT_PROJECT_ONLY_OPEN_FAILED:'+stage);};
const own=(owner,key,optional=false)=>{if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad();const d=Object.getOwnPropertyDescriptor(owner,key);if(!d){if(optional&&!(key in owner))return undefined;bad();}if(!Object.hasOwn(d,'value'))bad();return d.value;};
const plain=value=>{if(value===null||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)bad();return value;};
const text=(value,max,empty=false)=>{if(typeof value!=='string'||value.length>max||(!empty&&value.length===0)||/[\\u0000-\\u001F\\u007F]/.test(value))bad();return value;};
const dense=(value,max)=>{if(!Array.isArray(value)||Object.getPrototypeOf(value)!==Array.prototype)bad();const n=own(value,'length');if(!Number.isInteger(n)||n<0||n>max||Reflect.ownKeys(value).length!==n+1)bad();for(let i=0;i<n;i++)own(value,String(i));return n;};
const method=(owner,key)=>{const chain=[];let node=owner;for(let i=0;i<4;i++){if(node===null||(typeof node!=='object'&&typeof node!=='function'))bad();chain.push(node);const d=Object.getOwnPropertyDescriptor(node,key);if(d){if(!Object.hasOwn(d,'value')||typeof d.value!=='function')bad();return{owner,key,chain,fn:d.value};}node=Object.getPrototypeOf(node);}bad();};
const methodCheck=binding=>{for(let i=0;i<binding.chain.length;i++){const node=binding.chain[i];if(i>0&&Object.getPrototypeOf(binding.chain[i-1])!==node)bad();if(i===binding.chain.length-1){if(own(node,binding.key)!==binding.fn)bad();}else if(Object.hasOwn(node,binding.key))bad();}};
try{
 const set=own(root,'setTimeout');clear=own(root,'clearTimeout');if(typeof set!=='function'||typeof clear!=='function')bad();
 ${buildCurrentStartPageGuard()}
 const ui=own(root,'UI'),host=currentStartPage.host,tabs=own(ui,'tabBar'),bus=own(host,'messageBus'),rpc=method(bus,'rpcCall'),subscribe=method(bus,'subscribe');
 const edaOwner=eda,projectApi=own(edaOwner,'dmt_Project'),openProject=method(projectApi,'openProject');
 const location=root.location,document=root.document,initialUrl=parseProjectUrl(location.href,target.projectUuid),mode=own(root,'PRO_EDITOR_MODE');
 const containerIds=own(tabs,'containerIds'),containerTree=own(tabs,'containerTree'),active=method(tabs,'getActiveTab'),container=method(tabs,'getContainerInfo');
 const pending=own(host,'sessionStorageTabs'),setConstructor=own(root,'Set'),setPrototype=own(setConstructor,'prototype'),size=Object.getOwnPropertyDescriptor(setPrototype,'size')?.get;
 const navigator=root.navigator,serviceWorker=navigator?.serviceWorker,storage=root.caches,constructor=root.CacheStorage,prototype=constructor?.prototype;
 if(typeof constructor!=='function'||storage===null||typeof storage!=='object'||Object.getPrototypeOf(storage)!==prototype||typeof size!=='function')bad();
 const match=own(prototype,'match');if(typeof match!=='function'||!serviceWorker||serviceWorker.controller!==null)bad();
 const base=()=>{
  if(expired){stage='TIMEOUT';bad();}
  if(root.window!==root||root.top!==root||root.location!==location||root.document!==document||document?.defaultView!==root||document?.nodeType!==9||document?.URL!==location?.href||location?.origin!=='https://client')bad();
  const url=parseProjectUrl(location.href,target.projectUuid);if(url.base!==initialUrl.base||url.tabIds.length!==0)bad();
  if(own(root,'UI')!==ui||own(root,'gVars')!==host||own(ui,'gVars')!==host||own(ui,'tabBar')!==tabs||own(host,'messageBus')!==bus||eda!==edaOwner||own(edaOwner,'extensionUuid')!=='7e06d286b1ac846ef7eab9c7f2a9ee40'||own(edaOwner,'dmt_Project')!==projectApi)bad();
  if(own(root,'PRO_EDITOR_MODE')!==mode||own(root,'PRO_EDITOR_VERSION')!=='3.2.206'||own(tabs,'containerIds')!==containerIds||own(tabs,'containerTree')!==containerTree)bad();
  if(own(host,'sessionStorageTabs')!==pending||own(root,'Set')!==setConstructor||own(setConstructor,'prototype')!==setPrototype||Object.getPrototypeOf(pending)!==setPrototype||Object.getOwnPropertyDescriptor(setPrototype,'size')?.get!==size||apply(size,pending,[])!==0||Reflect.ownKeys(pending).length!==0)bad();
  if(own(host,'urlCmd')!==null||own(host,'isHistoryMode')!==false||own(tabs,'isOpenProjectDoc')!==true||own(tabs,'isOpenOtherDoc')!==true)bad();
  if(root.navigator!==navigator||navigator.serviceWorker!==serviceWorker||serviceWorker.controller!==null||root.caches!==storage||root.CacheStorage!==constructor||constructor.prototype!==prototype||Object.getPrototypeOf(storage)!==prototype||Object.hasOwn(storage,'match')||own(prototype,'match')!==match)bad();
  if(own(root,'setTimeout')!==set||own(root,'clearTimeout')!==clear)bad();for(const binding of [rpc,subscribe,openProject,active,container])methodCheck(binding);
 };
 const pre=()=>{base();currentStartPage.check();base();};
 // A separate post-open projection permits only native Start/hidden blank
 // transitions. Unlike the pre-open guard it does not require an empty project.
 const sample=()=>{
  base();const owners=[containerIds],names=[],registry=new Set(),n=dense(containerIds,128);if(n===0)bad();
  for(let i=0;i<n;i++){const id=text(own(containerIds,String(i)),256);if(registry.has(id))bad();registry.add(id);names.push(id);}
  const nodes=[{node:containerTree,depth:0}],seen=new Set(),treeIds=new Set(),leaves=new Set(),treeProjection=[];
  if(own(tabs,'belongContainer')!=='editor-window-main'||own(containerTree,'id')!=='editor-window-main')bad();
  while(nodes.length){const item=nodes.pop(),node=plain(item.node);if(item.depth>16||seen.has(node)||seen.size>=255)bad();seen.add(node);owners.push(node);const id=text(own(node,'id'),256),children=own(node,'children',true);if(treeIds.has(id))bad();treeIds.add(id);treeProjection.push([id,item.depth]);
   if(children===undefined){if(!registry.has(id)||leaves.has(id))bad();leaves.add(id);}else{const length=dense(children,128);if(length===0||nodes.length+seen.size+length>255)bad();owners.push(children);for(let i=length-1;i>=0;i--)nodes.push({node:own(children,String(i)),depth:item.depth+1});}}
  if(leaves.size!==registry.size)bad();const current=own(tabs,'currentTabId');if(current!=='tab_page1'&&current!=='0'||apply(active.fn,tabs,[])!==current)bad();base();
  const allIds=new Set(),projection=[];let count=0,start=0,blank=0,currentCount=0;
  for(const id of names){const info=plain(apply(container.fn,tabs,[id]));base();owners.push(info);if(own(info,'id')!==id||own(info,'belong')!=='editor-window-main')bad();const list=own(info,'tabs'),length=dense(list,256),localActive=text(own(info,'activeTabId'),512,true),localIds=new Set(),rows=[];owners.push(list);if(count+length>256)bad();count+=length;
   for(let i=0;i<length;i++){const tab=plain(own(list,String(i))),tabId=text(own(tab,'tabId'),512),data=plain(own(tab,'data'));owners.push(tab,data);if(allIds.has(tabId))bad();allIds.add(tabId);localIds.add(tabId);const isStart=tabId==='tab_page1',type=own(data,'doctype');if(!isStart&&tabId!=='0')bad();
    if(type!==(isStart?-1:0)||own(tab,'isAbleDelete')!==false||own(tab,'group')!=='start_blank'||own(tab,'draggable')!==isStart)bad();const hidden=own(tab,'isDisplayNone');if(typeof hidden!=='boolean'||(!isStart&&hidden!==true))bad();const declared=own(tab,'documentType',true);if(declared!==undefined&&declared!==type)bad();
    for(const key of ['pid','owner'])if(own(data,key,true)!==undefined)bad();for(const key of ['parentProjectUuid','parentLibraryUuid'])if(own(tab,key,true)!==undefined)bad();
    if(isStart)start++;else blank++;if(tabId===current){currentCount++;if(localActive!==current)bad();}rows.push([tabId,type,hidden]);}
   if(localActive!==''&&!localIds.has(localActive))bad();projection.push([id,localActive,rows]);}
  if(start!==1||blank>1||count!==start+blank||currentCount!==1)bad();base();
  return{owners,current,identity:JSON.stringify([names,treeProjection,projection,current])};
 };
 pre();const initial=sample();
 const registered=async()=>{stage='REGISTRY';pre();const reply=await apply(rpc.fn,bus,['/pro-mgr/api/client/getProjectPaths',{},0]);pre();plain(reply);const message=plain(own(reply,'message'));if(own(message,'success')!==true)bad();const result=plain(own(message,'result')),keys=Reflect.ownKeys(result);if(keys.length>4096||keys.some(key=>typeof key!=='string'||!/^[a-f0-9]{64}$/.test(key)))bad();const selected=plain(own(result,target.projectUuid));if(text(own(selected,'path'),4096)!==target.rawWindowsPath||own(selected,'isCbb')!==false)bad();};
 const absent=async()=>{stage='TARGET_INACTIVE';pre();const reply=await apply(rpc.fn,bus,['/pro-mgr/hasProject',[target.projectUuid]]);pre();if(own(reply,'message')!==false)bad();};
 const run=async()=>{
  await registered();pre();
  const names=['project_'+target.projectUuid+'_v6','localProject_'+target.projectUuid+'_v1'];
  for(let index=0;index<2;index++){await absent();stage=index===0?'PROJECT_CACHE':'LOCAL_CACHE';pre();const result=await apply(match,storage,['https://client/upload/'+target.branchUuid,{cacheName:names[index],ignoreSearch:true,ignoreMethod:false,ignoreVary:true}]);pre();if(result!==undefined)bad();}
  await absent();stage='SUBSCRIBE';pre();
  let delivered=0,eventFailed=false,eventProject,dispatched=false,settle;
  const event=new Promise(resolve=>{settle=resolve;});
  // This source-reviewed local event has no target/producer payload. Correlate
  // Only the retained root and current project at delivery, not its producer.
  const receive=(...args)=>{delivered++;try{if(!dispatched||delivered!==1||args.length!==3||args[0]!==null||args[1]!==undefined||args[2]!==undefined)bad();base();
   eventProject=plain(own(host,'currentProject'));if(own(eventProject,'projectId')!==target.projectUuid||own(eventProject,'branchUuid')!==target.branchUuid||own(eventProject,'isV2Format')!==false)bad();
   const observed=sample();if(initial.owners.some(owner=>!observed.owners.includes(owner)))bad();
  }catch{eventFailed=true;}settle();};
  const task=apply(subscribe.fn,bus,['loadProjectCompleted',receive]),cancel=method(task,'cancel');
  const listener=()=>{methodCheck(cancel);if(own(task,'callback')!==receive||own(task,'isRunning')!==true)bad();};
  cleanup=()=>{listener();apply(cancel.fn,task,[]);if(own(task,'callback')!==null||own(task,'isRunning')!==false)bad();};
  listener();stage='OPEN_PROJECT';pre();if(delivered!==0||eventFailed)bad();dispatched=true;
  // No await or user-supplied callback separates this final guard and dispatch.
  const publicResult=await apply(openProject.fn,projectApi,[target.projectUuid]);stage='POST_OPEN';base();listener();if(publicResult!==true)bad();
  stage='PREFIX_EVENT';await event;base();listener();if(delivered!==1||eventFailed)bad();stage='POST_OPEN';
  const project=plain(own(host,'currentProject'));if(own(project,'projectId')!==target.projectUuid||own(project,'branchUuid')!==target.branchUuid||own(project,'isV2Format')!==false)bad();
  if(project!==eventProject)bad();
  const after=sample(),href=location.href;if(initial.owners.some(owner=>!after.owners.includes(owner)))bad();
  const final=sample();if(own(host,'currentProject')!==project||own(project,'projectId')!==target.projectUuid||own(project,'branchUuid')!==target.branchUuid||own(project,'isV2Format')!==false||location.href!==href||after.identity!==final.identity||after.owners.length!==final.owners.length||after.owners.some((owner,index)=>owner!==final.owners[index]))bad();
  listener();return{ok:true,kind:'current-project-only-open',projectUuid:target.projectUuid,branchUuid:target.branchUuid,projectPathMatched:true,projectPresent:true,publicResult:true,navigationDispatched:true,inactiveUploadCachesObserved:true,loadProjectCompletedObserved:true,prefixEventProducerVerified:false,noEditorTabsObserved:true,restoreSetEmptyObserved:true,urlCommandAbsentObserved:true,currentTabId:final.current,documentNavigationDispatched:false,explicitSaveDispatched:false,restorationCompletionVerified:false,runtimeExamStateVerified:false,startupQualified:false,openingEffectsVerified:false,persistenceVerified:false,writerAuthority:false,executionAuthorized:false};
 };
 const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;stage='TIMEOUT';reject(new Error('CURRENT_PROJECT_ONLY_OPEN_FAILED:TIMEOUT'));},${CURRENT_PROJECT_ONLY_OPEN_TIMEOUT_MS - 10_000}]);});
 return await Promise.race([run(),timeout]);
}catch{throw new Error('CURRENT_PROJECT_ONLY_OPEN_FAILED:'+stage);}
finally{let failed=false;try{if(cleanup!==undefined)cleanup();}catch{failed=true;}if(timer!==undefined){try{apply(clear,root,[timer]);}catch{failed=true;}}if(failed)throw new Error('CURRENT_PROJECT_ONLY_OPEN_FAILED:CLEANUP');}
})();
const json=JSON.stringify(observation),utf8Bytes=new TextEncoder().encode(json).byteLength;
const envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};
if(utf8Bytes>${CURRENT_PROJECT_ONLY_OPEN_MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${CURRENT_PROJECT_ONLY_OPEN_MAX_BYTES})throw new Error('CURRENT_PROJECT_ONLY_OPEN_ENVELOPE');
return envelope;`;
}

/** Bounded data validation, not an issuer of session, startup or writer authority. */
export function decodeCurrentProjectOnlyOpenReply(raw: unknown, expected: unknown): CurrentProjectOnlyOpenResult {
  const selected = target(expected);
  assertUpstreamReplySettled(raw);
  const envelope = fields(extractToolPayload(raw), ["schema", "utf8Bytes", "json"]);
  if (envelope["schema"] !== EXACT_READ_ENVELOPE_SCHEMA || typeof envelope["json"] !== "string" ||
    envelope["json"].length === 0 || envelope["json"].length > CURRENT_PROJECT_ONLY_OPEN_MAX_BYTES ||
    !Number.isSafeInteger(envelope["utf8Bytes"]) || Buffer.byteLength(envelope["json"], "utf8") > CURRENT_PROJECT_ONLY_OPEN_MAX_BYTES ||
    Buffer.byteLength(JSON.stringify(envelope), "utf8") > CURRENT_PROJECT_ONLY_OPEN_MAX_BYTES) { throw new Error("CURRENT_PROJECT_ONLY_OPEN_ENVELOPE"); }
  const result = currentProjectOnlyOpenResultSchema.parse(decodeExactReadEnvelope(envelope));
  if (result.projectUuid !== selected.projectUuid || result.branchUuid !== selected.branchUuid) { throw new Error("CURRENT_PROJECT_ONLY_OPEN_TARGET"); }
  return Object.freeze(result);
}
