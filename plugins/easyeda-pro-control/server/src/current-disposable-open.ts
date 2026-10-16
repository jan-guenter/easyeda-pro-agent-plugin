import { z } from "zod";
import { buildCurrentProjectUrlGuard } from "./current-project-url.ts";
import { sha256Text } from "./core.ts";
import { EXACT_READ_ENVELOPE_SCHEMA } from "./exact-readers.ts";
import { currentSymbolMetadataPreparationRequestSchema } from "./current-symbol-metadata-preparation.ts";
import { CURRENT_MAIN_REFERENCE_HELPER_IDENTITY, CURRENT_MAIN_REFERENCE_RUNTIME_PINS, CURRENT_MAIN_REFERENCE_RUNTIME_PROFILE_SHA256,
  CURRENT_MAIN_REFERENCE_VERSIONS } from "./current-main-reference-helper-identity.ts";

export const CURRENT_DISPOSABLE_OPEN_MAX_BYTES = 16_384;
// The pinned upstream easyeda_execute schema caps timeoutMs at 60 seconds.
// Native observation expires first; neither deadline proves work cancelled.
export const CURRENT_DISPOSABLE_OPEN_NAVIGATION_TIMEOUT_MS = 60_000;
const hex64 = z.string().regex(/^[a-f0-9]{64}$/u);
const hex32 = z.string().regex(/^[a-f0-9]{32}$/u);
const documentId = z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u);
const operationId = z.string().min(8).max(96).regex(/^[a-z0-9][a-z0-9-]{7,95}$/u);
// oxlint-disable-next-line no-control-regex -- Control characters must be rejected at the Windows path authority boundary.
const windowsPath = z.string().min(12).max(4096).regex(/^[A-Za-z]:\\[^\u0000-\u001F\u007F<>:"|?*/]+\.eprj2$/u)
  .refine((value) => value.slice(3).split("\\").every((part) => part.length > 0 && part.trim() === part
    && part !== "." && part !== ".." && !/[. ]$/u.test(part) && !/~[0-9]/u.test(part)
    && !/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/iu.test(part)), "Use a canonical absolute Windows project path.");
const targetFields = { rawWindowsPath: windowsPath, projectUuid: hex64, documentUuid: documentId, expectedSourceSha256: hex64 };
export const currentDisposableOpenTargetSchema = z.object(targetFields).strict()
  .refine((value) => sha256Text(value.rawWindowsPath) === value.projectUuid, "Project identity must hash the exact raw Windows path.");
export type CurrentDisposableOpenTarget = z.infer<typeof currentDisposableOpenTargetSchema>;
export const currentDisposableOpenSealedTargetSchema = z.object({ ...targetFields, branchUuid: hex32 }).strict()
  .refine((value) => sha256Text(value.rawWindowsPath) === value.projectUuid, "Project identity must hash the exact raw Windows path.");
export type CurrentDisposableOpenSealedTarget = z.infer<typeof currentDisposableOpenSealedTargetSchema>;
export const currentDisposableOpenRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("open"), operationId, ...targetFields, confirmDisposableProject: z.literal(true), acceptNormalOpenEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("observe"), operationId }).strict(),
  z.object({ action: z.literal("inspect"), operationId }).strict(),
  z.object({ action: z.literal("retire-after-termination"), operationId, confirmRetire: z.literal(true), acceptUnknownFileEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("baseline-begin"), operationId, openingOperationId: operationId,
    preparation: currentSymbolMetadataPreparationRequestSchema.omit({ observationProjection: true }),
    confirmNormalClose: z.literal(true), confirmDisposableProject: z.literal(true), acceptNormalOpenEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("baseline-observe-termination"), operationId }).strict(),
  z.object({ action: z.literal("baseline-prepare-clock"), operationId, acceptScratchProcessEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("baseline-relaunch"), operationId, acceptNormalOpenEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("baseline-admit"), operationId }).strict(),
  z.object({ action: z.literal("baseline-observe-caches"), operationId }).strict(),
  z.object({ action: z.literal("baseline-open-project"), operationId, acceptNormalOpenEffects: z.literal(true),
    acceptUnqualifiedSchematicStartupEffects: z.literal(true).optional() }).strict(),
  z.object({ action: z.literal("baseline-observe-clock"), operationId }).strict(),
  z.object({ action: z.literal("baseline-finish-close"), operationId, confirmNormalClose: z.literal(true), acceptUnknownFileEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("baseline-observe-finish"), operationId }).strict(),
  z.object({ action: z.literal("baseline-inspect"), operationId }).strict(),
]).refine((value) => value.action !== "open" || sha256Text(value.rawWindowsPath) === value.projectUuid, "Project identity must hash the exact raw Windows path.")
  .refine((value) => value.action !== "baseline-begin" || value.operationId !== value.openingOperationId, "The baseline needs a distinct operation ID.");
export type CurrentDisposableOpenRequest = z.infer<typeof currentDisposableOpenRequestSchema>;
export function parseCurrentDisposableOpenRequest(input: unknown): CurrentDisposableOpenRequest { return currentDisposableOpenRequestSchema.parse(input); }
export function parseCurrentDisposableOpenTarget(input: unknown): CurrentDisposableOpenTarget { return currentDisposableOpenTargetSchema.parse(input); }
export const currentDisposableOpenQuerySchema = z.object({ includeSchemas: z.boolean().default(false) }).strict();

const phases = ["preflight", "open-project", "open-document", "observe"] as const;
export type CurrentDisposableOpenPhase = typeof phases[number];
export const currentDisposableOpenResultSchema = z.object({
  ok: z.literal(true), kind: z.literal("current-disposable-open"), phase: z.enum(phases),
  projectUuid: hex64, documentUuid: documentId, projectPathMatched: z.literal(true), branchUuid: hex32.nullable(),
  projectPresent: z.boolean(), documentPresent: z.boolean(), activeTarget: z.boolean(), nativeIdentityVerified: z.boolean(),
  dispatchAttempted: z.boolean(), publicResult: z.union([z.boolean(), z.string().min(81).max(97), z.null()]),
  restorationCompletionVerified: z.literal(false), persistenceVerified: z.literal(false), writerAuthority: z.literal(false),
}).strict();
export type CurrentDisposableOpenResult = z.infer<typeof currentDisposableOpenResultSchema>;

const limitations = [
  "One explicitly selected, already registered local disposable .eprj2 project and existing type-3 PCB only. The raw Windows registry path hashes to the project identity; the host separately binds the file checkpoint and PCB membership.",
  "Ordinary opening can migrate the selected file, replay cached work, change project/shared metadata, restore selected-project tabs, start background work and automatically Save. The registry query also performs ordinary application bookkeeping. No unchanged-storage or zero-write claim is made.",
  "The project and document public calls each require a durable one-shot dispatch reservation. Timeout, failure or lost response consumes that stage; observe never retries it. Retirement requires separately proved retained-owner termination and session closure, not process absence or PID adoption.",
  "Complete bounded registry observations require an initially empty editor, then target-only project tabs and the sealed branch. Public methods route through global state: samples are not an atomic lock against an intervening switch away and back.",
  "Final retained-frame/native identity is not rendering, restoration completion, persistence or writer authority. Ordinary open/observe actions request no explicit Save, close, discard, restoration, settings change or CAD edit; baseline actions separately request normal application closure.",
  "At most 128 containers, 255 tree nodes, 256 tabs and 4096 registered project keys are admitted. The vendor enumerates its registry before these bounds and may log private errors; outward errors remain fixed. Source/offline tests are not live validation.",
  "baseline-* actions validate a retained disposable opening lifecycle only. Begin consumes its original opening owner, prepares one closed symbol, requests normal application close and captures a complete closed baseline after original termination. Relaunch/admission/cache/project-only opening remain separate one-shot stages. Continuations cannot supply paths, source hashes, code, runtime overrides or replacement owners.",
  "Project-only reopening requires a supported historical closed baseline, a fresh raw-source hash, exact registered path and fresh inactive upload-cache observations. It opens no editor document. A project-open return is not full startup completion, persistence, backend actor/clock qualification or writer authority; writers remain disabled. Finish requests normal close without Save/Discard and observes the original new generation's termination. Unknown disposable file effects are retained, not accepted as an intended edit.",
  "Only baseline-open-project accepts optional acceptUnqualifiedSchematicStartupEffects:true for disposable observation-only opening when active schematic pages are the sole historical blocker. Schematic initialization may rewrite documents or queue persistence. The active-page blocker and historicalSubsetSatisfied:false remain recorded; every other historical prerequisite remains mandatory. Omitting this acceptance keeps the strict no-active-page gate. Acceptance never grants startup, opening-effect, persistence or writer authority.",
  "After original termination, baseline-observe-finish attempts one final closed raw SQL/native-history snapshot before releasing its retained captures. Snapshot status is separate from retirement and does not classify startup effects. An explicitly recorded snapshot failure can finish retirement from the same retained proof without another close, probe or copy; other stopped states cannot use that exception. Older journals report snapshot evidence as not-recorded.",
  "Keep the same facade alive throughout baseline validation. Inspection remains local after owner loss; continuing from journal JSON, replaying an ambiguous stage or reconstructing handles is forbidden. Pre-admission launch failures and unsupported stopped states remain review-only.",
  "Optional baseline-prepare-clock runs once after the closed baseline and before relaunch, using a source-qualified disjoint scratch process for the exact unlocked history-head date literal. It retains separate evidence and requires acceptScratchProcessEffects:true. baseline-observe-clock then compares fixed renderer Date controls in the original project-only generation. Neither action arms a mutation, changes timestamp windows, qualifies startup or enables a writer; ambiguous attempts cannot be repeated.",
] as const;

export function queryCurrentDisposableOpen(input: unknown = {}): Record<string, unknown> {
  const query = currentDisposableOpenQuerySchema.parse(input);
  return { offline: true, invocationEnabledByDiscovery: false, total: 1,
    clockPreparation: {
      helper: { ...CURRENT_MAIN_REFERENCE_HELPER_IDENTITY, file: "Easyeda.CurrentMainReference.dll" },
      runtimeProfileSha256: CURRENT_MAIN_REFERENCE_RUNTIME_PROFILE_SHA256,
      runtimeVersions: { ...CURRENT_MAIN_REFERENCE_VERSIONS }, runtimePins: { ...CURRENT_MAIN_REFERENCE_RUNTIME_PINS },
      connectedValidation: false, writerAuthority: false,
      limitation: "Fixed packaged expectations only, not an observation of the installed runtime. Compare the complete runtime inventory before reserving the one-shot scratch stage; discovery grants no execution authority.",
    }, entries: [{
    action: "open", effect: "ordinary-disposable-project-navigation", methods: ["eda.dmt_Project.openProject", "eda.dmt_EditorControl.openDocument"],
    actions: ["open", "observe", "inspect", "retire-after-termination", "baseline-begin", "baseline-observe-termination", "baseline-prepare-clock", "baseline-relaunch",
      "baseline-admit", "baseline-observe-caches", "baseline-open-project", "baseline-observe-clock", "baseline-finish-close", "baseline-observe-finish", "baseline-inspect"], limitations: [...limitations],
    ...(query.includeSchemas ? { inputSchema: z.toJSONSchema(currentDisposableOpenRequestSchema) } : {}),
  }] };
}

export function validateCurrentDisposableOpenArguments(input: unknown): Record<string, unknown> {
  const result = currentDisposableOpenRequestSchema.safeParse(input);
  return result.success ? { valid: true, request: result.data, executionAuthorized: false } : {
    valid: false, executionAuthorized: false,
    issues: result.error.issues.slice(0, 16).map((issue) => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}

/** Only maintained stages can select a program. No caller topic, selector,
 * split-screen target, flags or source code crosses this boundary. The host
 * must reserve each navigation stage durably before executing it.
 */
export function buildCurrentDisposableOpenProgram(targetInput: unknown, phaseInput: CurrentDisposableOpenPhase): string {
  const target = currentDisposableOpenSealedTargetSchema.parse(targetInput);
  const phase = z.enum(phases).parse(phaseInput);
  const navigation = phase === "open-project" || phase === "open-document";
  return `let timer,clear,timedOut=false,stage='setup',failureCode='EXCEPTION',timeoutStage='setup',failureMessage;
try{
const root=globalThis,apply=Reflect.apply,target=${JSON.stringify(target)},phase=${JSON.stringify(phase)},tabId=target.documentUuid+'@'+target.projectUuid;let expired=false;
const bad=(code='GUARD')=>{failureCode=code;throw new Error('CURRENT_DISPOSABLE_OPEN_FAILED');};
${buildCurrentProjectUrlGuard()}
const own=(owner,key,optional=false)=>{if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad('FIELD');const d=Object.getOwnPropertyDescriptor(owner,key);if(!d){if(optional&&!(key in owner))return undefined;bad('FIELD');}if(!Object.hasOwn(d,'value'))bad('FIELD');return d.value;};
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const plain=value=>{if(!object(value)||Object.getPrototypeOf(value)!==Object.prototype)bad('OBJECT');return value;};
const text=(value,max,empty=false)=>{if(typeof value!=='string'||value.length>max||(!empty&&value.length===0)||/[\u0000-\u001F\u007F]/.test(value))bad('TEXT');return value;};
const dense=(value,max)=>{if(!Array.isArray(value)||Object.getPrototypeOf(value)!==Array.prototype)bad('ARRAY');const n=own(value,'length');if(!Number.isInteger(n)||n<0||n>max||Reflect.ownKeys(value).length!==n+1)bad('ARRAY');for(let i=0;i<n;i++)own(value,String(i));return n;};
const method=(owner,key)=>{const chain=[];let node=owner;for(let i=0;i<4;i++){if(node===null||(typeof node!=='object'&&typeof node!=='function'))bad('METHOD');chain.push(node);const d=Object.getOwnPropertyDescriptor(node,key);if(d){if(!Object.hasOwn(d,'value')||typeof d.value!=='function')bad('METHOD');return {owner,key,chain,fn:d.value};}node=Object.getPrototypeOf(node);}bad('METHOD');};
const methodCheck=binding=>{for(let i=0;i<binding.chain.length;i++){const node=binding.chain[i];if(i>0&&Object.getPrototypeOf(binding.chain[i-1])!==node)bad('BINDING');if(i===binding.chain.length-1){if(own(node,binding.key)!==binding.fn)bad('BINDING');}else if(Object.hasOwn(node,binding.key))bad('BINDING');}};
const location=root.location,href=location?.href,document=root.document,ui=own(root,'UI'),host=own(root,'gVars'),tabs=own(ui,'tabBar'),mode=own(root,'PRO_EDITOR_MODE'),edaOwner=eda;
const initialUrl=parseProjectUrl(href,target.projectUuid);let retainedHref=href;
if((phase==='preflight'||phase==='open-project')&&!initialUrl.empty)bad('URL');
if(typeof tabs!=='function'||Object.getPrototypeOf(tabs)!==Function.prototype)bad();
const active=method(tabs,'getActiveTab'),container=method(tabs,'getContainerInfo'),getTab=method(tabs,'getTabById');
const bus=own(host,'messageBus'),registryCall=method(bus,'rpcCall');
const projectApi=own(edaOwner,'dmt_Project'),documentApi=own(edaOwner,'dmt_EditorControl'),openProject=method(projectApi,'openProject'),openDocument=method(documentApi,'openDocument');
const set=own(root,'setTimeout');clear=own(root,'clearTimeout');if(typeof set!=='function'||typeof clear!=='function')bad();
const check=()=>{
 if(expired||root.window!==root||root.top!==root||root.location!==location||root.document!==document||document?.defaultView!==root||document?.nodeType!==9||document?.URL!==retainedHref||location?.href!==retainedHref||location?.origin!=='https://client')bad('URL');
 if(parseProjectUrl(retainedHref,target.projectUuid).base!==initialUrl.base)bad('URL');
 if(own(root,'PRO_EDITOR_MODE')!==mode||(mode!=='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'&&mode!=='CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'))bad();
 if(own(root,'UI')!==ui||own(root,'gVars')!==host||own(ui,'gVars')!==host||own(ui,'tabBar')!==tabs||own(host,'messageBus')!==bus||eda!==edaOwner||own(edaOwner,'extensionUuid')!=='7e06d286b1ac846ef7eab9c7f2a9ee40')bad();
 if(own(edaOwner,'dmt_Project')!==projectApi||own(edaOwner,'dmt_EditorControl')!==documentApi||own(root,'setTimeout')!==set||own(root,'clearTimeout')!==clear)bad();
 for(const binding of [active,container,getTab,registryCall,openProject,openDocument])methodCheck(binding);
};
const sample=()=>{
 check();const owners=[],project=plain(own(host,'currentProject'));owners.push(project);const pid=own(project,'projectId',true),branch=own(project,'branchUuid',true);
 const projectPresent=pid===target.projectUuid;if(pid!==undefined&&!projectPresent)bad();
 if(projectPresent){if(branch!==target.branchUuid||own(project,'isV2Format')!==false)bad();}else if(branch!==undefined&&branch!=='')bad();
 if(own(host,'isHistoryMode')!==false)bad();
 const ids=own(tabs,'containerIds'),n=dense(ids,128);if(n===0)bad();owners.push(ids);const names=[],registry=new Set();
 for(let i=0;i<n;i++){const id=text(own(ids,String(i)),256);if(registry.has(id))bad();registry.add(id);names.push(id);}
 const tree=own(tabs,'containerTree'),pending=[{node:tree,depth:0}],seen=new Set(),treeIds=new Set(),leaves=new Set(),treeProjection=[];
 if(own(tabs,'belongContainer')!=='editor-window-main'||own(tree,'id')!=='editor-window-main')bad();
 while(pending.length){const item=pending.pop(),node=plain(item.node);if(item.depth>16||seen.has(node)||seen.size>=255)bad();seen.add(node);owners.push(node);const id=text(own(node,'id'),256),children=own(node,'children',true);if(treeIds.has(id))bad();treeIds.add(id);treeProjection.push([id,item.depth]);
  if(children===undefined){if(!registry.has(id)||leaves.has(id))bad();leaves.add(id);}else{const count=dense(children,128);if(count===0||pending.length+seen.size+count>255)bad();owners.push(children);for(let i=count-1;i>=0;i--)pending.push({node:own(children,String(i)),depth:item.depth+1});}}
 if(leaves.size!==registry.size)bad();const current=text(own(tabs,'currentTabId'),512,true);if(apply(active.fn,tabs,[])!==current)bad();
 const allIds=new Set(),projection=[];let count=0,start=0,placeholder=0,currentCount=0,documentPresent=false,targetTab=null,targetData=null;
 for(const id of names){const info=plain(apply(container.fn,tabs,[id]));check();owners.push(info);if(own(info,'id')!==id||own(info,'belong')!=='editor-window-main')bad();const list=own(info,'tabs'),length=dense(list,256);if(count+length>256)bad();count+=length;owners.push(list);const localActive=text(own(info,'activeTabId'),512,true),localIds=new Set(),rows=[];
  for(let i=0;i<length;i++){const tab=plain(own(list,String(i))),id2=text(own(tab,'tabId'),512),data=plain(own(tab,'data'));owners.push(tab,data);if(allIds.has(id2))bad();allIds.add(id2);localIds.add(id2);const type=own(data,'doctype');
   if(id2==='tab_page1'||id2==='0'){const isStart=id2==='tab_page1';if(type!==(isStart?-1:0)||own(tab,'isAbleDelete')!==false||own(tab,'group')!=='start_blank'||own(tab,'draggable')!==isStart)bad();const hidden=own(tab,'isDisplayNone');if(typeof hidden!=='boolean'||(!isStart&&hidden!==true))bad();const declared=own(tab,'documentType',true);if(declared!==undefined&&declared!==type)bad();for(const key of ['pid','owner'])if(own(data,key,true)!==undefined)bad();for(const key of ['parentProjectUuid','parentLibraryUuid'])if(own(tab,key,true)!==undefined)bad();if(isStart)start++;else placeholder++;
   }else{if(!projectPresent||![1,3,26].includes(type)||own(data,'pid')!==target.projectUuid||own(tab,'parentLibraryUuid',true)!==undefined)bad();const parts=/^([a-f0-9]{16}|[a-f0-9]{32})@([a-f0-9]{64})$/.exec(id2);if(!parts||parts[2]!==target.projectUuid)bad();const parentProject=own(tab,'parentProjectUuid',true);if(parentProject!==undefined&&parentProject!==target.projectUuid)bad();if(id2===tabId){if(type!==3)bad();documentPresent=true;targetTab=tab;targetData=data;}}
   if(id2===current){currentCount++;if(localActive!==current)bad();}rows.push([id2,type]);}
  if(localActive!==''&&!localIds.has(localActive))bad();projection.push([id,localActive,rows]);}
 if(start>1||placeholder>1||(current===''?currentCount!==0:currentCount!==1))bad();
 if(!projectPresent&&(start!==1||current!=='tab_page1'||count!==start+placeholder))bad();
 if(documentPresent&&apply(getTab.fn,tabs,[tabId])!==targetTab)bad();check();
 const url=parseProjectUrl(retainedHref,target.projectUuid,current);
 if(!url.empty&&!projectPresent||url.tabIds.some(id=>!allIds.has(id)))bad('URL');
 return {owners,identity:JSON.stringify([names,treeProjection,projection,current,pid??null,branch??null]),projectPresent,branchUuid:projectPresent?branch:null,documentPresent,activeTarget:documentPresent&&current===tabId,targetTab,targetData};
};
const same=(a,b)=>{if(a.identity!==b.identity||a.owners.length!==b.owners.length||a.owners.some((owner,i)=>owner!==b.owners[i]))bad();};
const registration=async()=>{const before=sample();const reply=await apply(registryCall.fn,bus,['/pro-mgr/api/client/getProjectPaths',{},0]);check();same(before,sample());plain(reply);const message=plain(own(reply,'message'));if(own(message,'success')!==true)bad();const result=plain(own(message,'result')),keys=Reflect.ownKeys(result);if(keys.length>4096||keys.some(key=>typeof key!=='string'||!/^[a-f0-9]{64}$/.test(key)))bad();const selected=plain(own(result,target.projectUuid));if(text(own(selected,'path'),4096)!==target.rawWindowsPath||own(selected,'isCbb')!==false)bad();return before;};
const observe=async()=>{
 const before=sample();if(!before.documentPresent){await Promise.resolve();check();same(before,sample());return {...before,nativeIdentityVerified:false};}
 const select=document?.querySelectorAll;if(typeof select!=='function')bad();const matches=apply(select,document,['[id="frame_'+tabId+'"]']);if(matches.length>1)bad();if(matches.length===0){await Promise.resolve();same(before,sample());return {...before,nativeIdentityVerified:false};}
 const frame=matches[0],child=frame?.contentWindow,childDocument=child?.document,parent=frame?.parentElement;
 const getAttribute=frame?.getAttribute,hasAttribute=frame?.hasAttribute,classes=frame?.classList,contains=classes?.contains,parentAttribute=parent?.getAttribute;
 if(typeof getAttribute!=='function'||typeof hasAttribute!=='function'||typeof contains!=='function'||typeof parentAttribute!=='function')bad();
 const native=own(child,'MSG_BUS_PCB',true);if(native===undefined){await Promise.resolve();same(before,sample());return {...before,nativeIdentityVerified:false};}
 const channel=own(native,'messageBus'),identityCall=method(channel,'rpcCall'),childObject=own(child,'Object'),childPrototype=own(childObject,'prototype');
 const frameCheck=()=>{check();same(before,sample());methodCheck(identityCall);if(document.querySelectorAll!==select)bad();const found=apply(select,document,['[id="frame_'+tabId+'"]']);if(found.length!==1||found[0]!==frame)bad();
  if(frame.tagName!=='IFRAME'||frame.id!=='frame_'+tabId||frame.ownerDocument!==document||frame.isConnected!==true||frame.parentElement!==parent||frame.classList!==classes||classes.contains!==contains||frame.getAttribute!==getAttribute||frame.hasAttribute!==hasAttribute||parent.getAttribute!==parentAttribute||!apply(contains,classes,['editframe'])||apply(parentAttribute,parent,['uuid'])!==tabId)bad();
  for(const [key,value] of [['c_dbid',tabId],['c_doctype','3'],['src','editor?entry=pcb'],['pcb-canvas','true']])if(apply(getAttribute,frame,[key])!==value)bad();for(const key of ['blankIframe','fromFile','jsonCacheReady'])if(apply(hasAttribute,frame,[key]))bad();
  if(frame.contentWindow!==child||child.document!==childDocument||childDocument?.defaultView!==child||childDocument?.nodeType!==9||child.frameElement!==frame||child.parent!==root||child.top!==root||own(child,'MSG_BUS_PCB')!==native||own(native,'messageBus')!==channel||own(child,'Object')!==childObject||own(childObject,'prototype')!==childPrototype)bad();};
 const childPlain=value=>{if(!object(value))bad();const prototype=Object.getPrototypeOf(value);if(prototype!==Object.prototype&&prototype!==childPrototype)bad();return value;};
 const read=async()=>{frameCheck();const reply=await apply(identityCall.fn,channel,['getTabIdAndDocType',undefined,0]);frameCheck();childPlain(reply);const value=childPlain(own(reply,'message')),keys=Reflect.ownKeys(value);if(keys.length!==2||!keys.includes('tabId')||!keys.includes('docType'))bad();const id=own(value,'tabId'),type=own(value,'docType');if(id===''&&type===0)return false;if(id!==tabId||type!==3)bad();return true;};
 const first=await read();frameCheck();const second=await read();frameCheck();if(first!==second)bad();return {...before,nativeIdentityVerified:first};
};
const run=async()=>{
 stage='before-registration';const initial=await registration();check();let publicResult=null,dispatchAttempted=false;
 stage='pre-dispatch';
 if(phase==='preflight'||phase==='open-project'){if(initial.projectPresent)bad();}else if(phase==='open-document'&&!initial.projectPresent)bad();
 // Only the owned public navigation may advance the retained URL. All subsequent observations freeze it again.
 if(phase==='open-project'){same(initial,sample());check();dispatchAttempted=true;stage='open-project';publicResult=await apply(openProject.fn,projectApi,[target.projectUuid]);stage='project-acknowledgement';retainedHref=location?.href;check();if(typeof publicResult!=='boolean')bad('ACK');}
 else if(phase==='open-document'){same(initial,sample());check();dispatchAttempted=true;stage='open-document';publicResult=await apply(openDocument.fn,documentApi,[target.documentUuid]);stage='document-acknowledgement';retainedHref=location?.href;check();if(publicResult===undefined)publicResult=null;else if(publicResult!==tabId)bad('ACK');}
 stage='after-registration';const after=await registration();check();stage='native-observation';const final=await observe();check();same(after,final);if(phase==='preflight'&&final.projectPresent)bad();
 stage='output';
 const json=JSON.stringify({ok:true,kind:'current-disposable-open',phase,projectUuid:target.projectUuid,documentUuid:target.documentUuid,projectPathMatched:true,branchUuid:final.branchUuid,projectPresent:final.projectPresent,documentPresent:final.documentPresent,activeTarget:final.activeTarget,nativeIdentityVerified:final.nativeIdentityVerified,dispatchAttempted,publicResult,restorationCompletionVerified:false,persistenceVerified:false,writerAuthority:false});
 const utf8Bytes=new TextEncoder().encode(json).byteLength,envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};if(utf8Bytes>${CURRENT_DISPOSABLE_OPEN_MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${CURRENT_DISPOSABLE_OPEN_MAX_BYTES})bad('OUTPUT');return envelope;
};
check();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;timedOut=true;timeoutStage=stage;reject(new Error('CURRENT_DISPOSABLE_OPEN_FAILED'));},${navigation ? CURRENT_DISPOSABLE_OPEN_NAVIGATION_TIMEOUT_MS - 10_000 : 10_000}]);});return await Promise.race([run(),timeout]);
}catch{failureMessage='CURRENT_DISPOSABLE_OPEN_FAILED:'+(timedOut?timeoutStage:stage)+':'+(timedOut?'TIMEOUT':failureCode);throw new Error(failureMessage);}
finally{if(timer!==undefined&&typeof clear==='function'){try{Reflect.apply(clear,globalThis,[timer]);}catch{throw new Error(failureMessage??'CURRENT_DISPOSABLE_OPEN_FAILED:cleanup:EXCEPTION');}}}`;
}

export function validateCurrentDisposableOpenResult(targetInput: unknown, phaseInput: CurrentDisposableOpenPhase, raw: unknown): CurrentDisposableOpenResult {
  const target = currentDisposableOpenSealedTargetSchema.parse(targetInput);
  const phase = z.enum(phases).parse(phaseInput);
  const result = currentDisposableOpenResultSchema.parse(raw);
  const expectedTab = `${target.documentUuid}@${target.projectUuid}`;
  const navigation = phase === "open-project" || phase === "open-document";
  if (result.phase !== phase || result.projectUuid !== target.projectUuid || result.documentUuid !== target.documentUuid
    || result.dispatchAttempted !== navigation || result.branchUuid !== (result.projectPresent ? target.branchUuid : null)
    || result.documentPresent && !result.projectPresent || result.activeTarget && !result.documentPresent
    || result.nativeIdentityVerified && !result.documentPresent || phase === "preflight" && result.projectPresent) {
    throw new Error("Disposable opening result contradicts its exact target and phase.");
  }
  let validAcknowledgement = result.publicResult === null;
  if (phase === "open-project") { validAcknowledgement = typeof result.publicResult === "boolean"; }
  if (phase === "open-document") { validAcknowledgement = result.publicResult === null || result.publicResult === expectedTab; }
  if (!validAcknowledgement) {
    throw new Error("Disposable opening result has an invalid public method acknowledgement.");
  }
  if (Buffer.byteLength(JSON.stringify(result), "utf8") > CURRENT_DISPOSABLE_OPEN_MAX_BYTES) { throw new Error("Disposable opening result exceeds its byte bound."); }
  return result;
}
