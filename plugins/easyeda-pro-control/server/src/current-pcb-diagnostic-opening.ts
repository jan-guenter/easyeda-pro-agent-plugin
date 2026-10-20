/** Fixed project-only navigation under a retained diagnostic owner.
 * UI3823ed6e@17230827 binds the documented SDK service to Fs({uuid}); it is
 * not a direct manager/worker shortcut. Host checkpoint/source admission,
 * source-qualified original UI context, durable intent and one-shot transition
 * are mandatory before dispatch. This leaf does not supply those authorities.
 */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { z } from "zod";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { buildCurrentProjectUrlGuard } from "./current-project-url.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_DIAGNOSTIC_OPENING_RESULT_BYTES = 49_152;
export const CURRENT_PCB_DIAGNOSTIC_OPENING_PHASES = ["preflight", "open-project"] as const;
export type CurrentPcbDiagnosticOpeningPhase = typeof CURRENT_PCB_DIAGNOSTIC_OPENING_PHASES[number];
const phaseSchema = z.enum(CURRENT_PCB_DIAGNOSTIC_OPENING_PHASES);
const stages = ["setup", "registration-before", "subscribe", "dispatch", "acknowledgement",
  "prefix", "registration-after", "observe", "output", "cleanup"] as const;
const codes = ["GUARD", "FIELD", "OBJECT", "ARRAY", "TEXT", "METHOD", "BINDING", "URL", "PROJECT",
  "BRANCH", "FORMAT", "HISTORY", "TAB", "REGISTRY", "OWNERS", "PREFIX", "TITLE", "ACK", "TIMEOUT", "EXCEPTION", "CLEANUP"] as const;

/** Immutable function text. Only the two validated by-value arguments vary.
 * Runtime.callFunctionOn: uniqueContextId, returnByValue:true, awaitPromise:true,
 * silent:true, generatePreview:false, userGesture:false, throwOnSideEffect:false.
 * No objectId, arbitrary function, context override or additional call options.
 * Internal deadlines stop this observer, not vendor work already dispatched.
 */
export const CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION = String.raw`async function(target,phase){
"use strict";
let stage="setup",code="EXCEPTION",dispatchAttempted=false,publicResult=null,prefixObserved=false,expired=false,timer,clear,cleanup,observation=null,outcome;
const bad=(value="GUARD")=>{code=value;throw new Error("PCB_DIAGNOSTIC_OPENING");};
try{
const root=globalThis,apply=Reflect.apply;
const own=(owner,key,optional=false)=>{if(owner===null||(typeof owner!=="object"&&typeof owner!=="function"))bad("FIELD");const d=Object.getOwnPropertyDescriptor(owner,key);if(!d){if(optional&&!(key in owner))return undefined;bad("FIELD");}if(!Object.hasOwn(d,"value"))bad("FIELD");return d.value;};
const plain=value=>{if(value===null||typeof value!=="object"||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)bad("OBJECT");return value;};
const text=(value,max,empty=false)=>{if(typeof value!=="string"||value.length>max||(!empty&&value.length===0)||/[\u0000-\u001F\u007F]/.test(value))bad("TEXT");return value;};
const matches=(value,re)=>{const m=typeof value==="string"?re.exec(value):null;return m!==null&&m[0]===value;};
plain(target);const targetKeys=["rawWindowsPath","projectUuid","branchUuid","documentUuid","expectedSourceSha256"];
if(Reflect.ownKeys(target).length!==targetKeys.length||targetKeys.some(key=>!Object.hasOwn(target,key)))bad();
for(const key of targetKeys)text(own(target,key),4096);
if(!matches(target.projectUuid,/^[a-f0-9]{64}$/)||!matches(target.branchUuid,/^[a-f0-9]{32}$/)||!matches(target.documentUuid,/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/)||!matches(target.expectedSourceSha256,/^[a-f0-9]{64}$/)||!matches(target.rawWindowsPath,/^[A-Za-z]:\\[^\u0000-\u001F\u007F<>:"|?*/]+\.eprj2$/)||(phase!=="preflight"&&phase!=="open-project"))bad();
const dense=(value,max)=>{if(!Array.isArray(value)||Object.getPrototypeOf(value)!==Array.prototype)bad("ARRAY");const n=own(value,"length");if(!Number.isInteger(n)||n<0||n>max||Reflect.ownKeys(value).length!==n+1)bad("ARRAY");for(let i=0;i<n;i++)own(value,String(i));return n;};
const method=(owner,key)=>{const chain=[];let node=owner;for(let i=0;i<4;i++){if(node===null||(typeof node!=="object"&&typeof node!=="function"))bad("METHOD");chain.push(node);const d=Object.getOwnPropertyDescriptor(node,key);if(d){if(!Object.hasOwn(d,"value")||typeof d.value!=="function")bad("METHOD");return{owner,key,chain,fn:d.value};}node=Object.getPrototypeOf(node);}bad("METHOD");};
const methodCheck=binding=>{for(let i=0;i<binding.chain.length;i++){const node=binding.chain[i];if(i>0&&Object.getPrototypeOf(binding.chain[i-1])!==node)bad("BINDING");if(i===binding.chain.length-1){if(own(node,binding.key)!==binding.fn)bad("BINDING");}else if(Object.hasOwn(node,binding.key))bad("BINDING");}};
${buildCurrentProjectUrlGuard()}
const location=root.location,document=root.document,initialHref=location?.href,initialUrl=parseProjectUrl(initialHref,target.projectUuid);
if(!initialUrl.empty)bad("URL");
let retainedHref=initialHref,prefixCheck;
const ui=own(root,"UI"),host=own(root,"gVars"),tabs=own(ui,"tabBar"),mode=own(root,"PRO_EDITOR_MODE"),windowTabId=own(root,"_TAB_ID_");
if(typeof tabs!=="function"||Object.getPrototypeOf(tabs)!==Function.prototype||!matches(windowTabId,/^[A-Za-z0-9_-]{1,128}$/))bad();
const client=plain(own(host,"client")),initialTitle=text(document?.title,512),query=method(document,"querySelector"),meta=apply(query.fn,document,['meta[name="editorMainVersion"]']);
if(meta?.ownerDocument!==document||meta?.nodeType!==1||meta?.localName!=="meta")bad("TITLE");
const attribute=method(meta,"getAttribute"),version=text(apply(attribute.fn,meta,["content"]),64),versionSuffix=" - V"+version;
if(!matches(version,/^\d+(?:\.\d+){1,7}$/)||initialTitle.includes(" | ")||!initialTitle.endsWith(versionSuffix)||initialTitle.length<=versionSuffix.length)bad("TITLE");
const projectName=text(target.rawWindowsPath.slice(target.rawWindowsPath.lastIndexOf("\\")+1,target.rawWindowsPath.indexOf(".eprj2")),256),expectedOpenedTitle=text(projectName+" | "+initialTitle,512);
const active=method(tabs,"getActiveTab"),container=method(tabs,"getContainerInfo"),getTab=method(tabs,"getTabById");
const bus=own(host,"messageBus"),registryCall=method(bus,"rpcCall"),subscribe=method(bus,"subscribe");
const apiBus=own(host,"extensionApiMessageBus2"),openCall=method(apiBus,"rpcCall");
const set=own(root,"setTimeout");clear=own(root,"clearTimeout");if(typeof set!=="function"||typeof clear!=="function")bad();
const check=()=>{
 if(expired)bad("TIMEOUT");
 if(root.window!==root||root.top!==root||root.location!==location||root.document!==document||document?.defaultView!==root||document?.nodeType!==9||document?.URL!==retainedHref||location?.href!==retainedHref||location?.origin!=="https://client")bad("URL");
 if(parseProjectUrl(retainedHref,target.projectUuid).base!==initialUrl.base)bad("URL");
 if(own(root,"PRO_EDITOR_MODE")!==mode||(mode!=="CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM"&&mode!=="CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM"))bad();
 if(own(root,"UI")!==ui||own(root,"gVars")!==host||own(ui,"gVars")!==host||own(ui,"tabBar")!==tabs||own(host,"client")!==client||own(host,"messageBus")!==bus||own(host,"extensionApiMessageBus2")!==apiBus||own(root,"_MSG_BUS2_EXTAPI_")!==apiBus||own(root,"_TAB_ID_")!==windowTabId||own(root,"setTimeout")!==set||own(root,"clearTimeout")!==clear)bad("BINDING");
 for(const binding of [active,container,getTab,registryCall,subscribe,openCall,query,attribute])methodCheck(binding);
 if(apply(query.fn,document,['meta[name="editorMainVersion"]'])!==meta||meta.ownerDocument!==document||apply(attribute.fn,meta,["content"])!==version)bad("TITLE");
 if(prefixCheck!==undefined)prefixCheck();
};
const sample=()=>{
 check();const owners=[],project=plain(own(host,"currentProject"));owners.push(project);const pid=own(project,"projectId",true),branch=own(project,"branchUuid",true),projectPresent=pid===target.projectUuid;
 if(pid!==undefined&&!projectPresent)bad("PROJECT");
 if(projectPresent){if(branch!==target.branchUuid)bad("BRANCH");if(own(project,"isV2Format")!==false)bad("FORMAT");}else if(branch!==undefined&&branch!=="")bad("BRANCH");
 const documentTitle=text(document.title,512),clientName=own(client,"currentProjectName",true);
 if(projectPresent?(documentTitle!==expectedOpenedTitle||clientName!==projectName):(documentTitle!==initialTitle||clientName!==undefined&&clientName!==""))bad("TITLE");
 if(own(host,"isHistoryMode")!==false)bad("HISTORY");
 const ids=own(tabs,"containerIds"),n=dense(ids,128);if(n===0)bad("TAB");owners.push(ids);const names=[],registry=new Set();
 for(let i=0;i<n;i++){const id=text(own(ids,String(i)),256);if(registry.has(id))bad("TAB");registry.add(id);names.push(id);}
 const tree=own(tabs,"containerTree"),pending=[{node:tree,depth:0}],seen=new Set(),treeIds=new Set(),leaves=new Set(),treeProjection=[];
 if(own(tabs,"belongContainer")!=="editor-window-main"||own(tree,"id")!=="editor-window-main")bad("TAB");
 while(pending.length){const item=pending.pop(),node=plain(item.node);if(item.depth>16||seen.has(node)||seen.size>=255)bad("TAB");seen.add(node);owners.push(node);const id=text(own(node,"id"),256),children=own(node,"children",true);if(treeIds.has(id))bad("TAB");treeIds.add(id);treeProjection.push([id,item.depth]);
  if(children===undefined){if(!registry.has(id)||leaves.has(id))bad("TAB");leaves.add(id);}else{const count=dense(children,128);if(count===0||pending.length+seen.size+count>255)bad("TAB");owners.push(children);for(let i=count-1;i>=0;i--)pending.push({node:own(children,String(i)),depth:item.depth+1});}}
 if(leaves.size!==registry.size)bad("TAB");const current=text(own(tabs,"currentTabId"),512,true);if(apply(active.fn,tabs,[])!==current)bad("TAB");
 const allIds=new Set(),projection=[],ordinaryIds=[];let count=0,start=0,placeholder=0,currentCount=0;
 for(const id of names){const info=plain(apply(container.fn,tabs,[id]));check();owners.push(info);if(own(info,"id")!==id||own(info,"belong")!=="editor-window-main")bad("TAB");const list=own(info,"tabs"),length=dense(list,256);if(count+length>256)bad("TAB");count+=length;owners.push(list);const localActive=text(own(info,"activeTabId"),512,true),localIds=new Set(),rows=[];
  for(let i=0;i<length;i++){const tab=plain(own(list,String(i))),id2=text(own(tab,"tabId"),512),data=plain(own(tab,"data"));owners.push(tab,data);if(allIds.has(id2))bad("TAB");allIds.add(id2);localIds.add(id2);const type=own(data,"doctype");
   if(id2==="tab_page1"||id2==="0"){const isStart=id2==="tab_page1";if(type!==(isStart?-1:0)||own(tab,"isAbleDelete")!==false||own(tab,"group")!=="start_blank"||own(tab,"draggable")!==isStart)bad("TAB");const hidden=own(tab,"isDisplayNone");if(typeof hidden!=="boolean"||(!isStart&&hidden!==true))bad("TAB");const declared=own(tab,"documentType",true);if(declared!==undefined&&declared!==type)bad("TAB");for(const key of ["pid","owner"])if(own(data,key,true)!==undefined)bad("TAB");for(const key of ["parentProjectUuid","parentLibraryUuid"])if(own(tab,key,true)!==undefined)bad("TAB");if(isStart)start++;else placeholder++;
   }else{if(!projectPresent||own(data,"pid")!==target.projectUuid||own(tab,"parentLibraryUuid",true)!==undefined||![1,3,26].includes(type))bad("TAB");const parts=/^([a-f0-9]{16}|[a-f0-9]{32})@([a-f0-9]{64})$/.exec(id2);if(!parts||parts[0]!==id2||parts[2]!==target.projectUuid)bad("TAB");const parentProject=own(tab,"parentProjectUuid",true);if(parentProject!==undefined&&parentProject!==target.projectUuid)bad("TAB");ordinaryIds.push(id2);}
   if(apply(getTab.fn,tabs,[id2])!==tab)bad("TAB");
   if(id2===current){currentCount++;if(localActive!==current)bad("TAB");}rows.push([id2,type]);}
  if(localActive!==""&&!localIds.has(localActive))bad("TAB");projection.push([id,localActive,rows]);}
 if(start>1||placeholder>1||(current===""?currentCount!==0:currentCount!==1))bad("TAB");
 if(!projectPresent&&(start!==1||current!=="tab_page1"||count!==start+placeholder))bad("TAB");
 const url=parseProjectUrl(retainedHref,target.projectUuid,current);
 if(!url.empty&&!projectPresent||url.tabIds.some(id=>!allIds.has(id)))bad("URL");check();
 return{owners,identity:JSON.stringify([names,treeProjection,projection,current,pid??null,branch??null,documentTitle,clientName??null]),public:{projectPresent,branchUuid:projectPresent?branch:null,windowTabId,containerCount:n,tabIds:ordinaryIds,activeTabId:current,initialTitle,expectedOpenedTitle,documentTitle}};
};
const same=(a,b)=>{if(a.identity!==b.identity||a.owners.length!==b.owners.length||a.owners.some((owner,i)=>owner!==b.owners[i]))bad("OWNERS");};
const registration=async()=>{const before=sample();const reply=await apply(registryCall.fn,bus,["/pro-mgr/api/client/getProjectPaths",{},0]);check();same(before,sample());plain(reply);const message=plain(own(reply,"message"));if(own(message,"success")!==true)bad("REGISTRY");const result=plain(own(message,"result")),keys=Reflect.ownKeys(result);if(keys.length>4096||keys.some(key=>!matches(key,/^[a-f0-9]{64}$/)))bad("REGISTRY");const selected=plain(own(result,target.projectUuid));if(text(own(selected,"path"),4096)!==target.rawWindowsPath||own(selected,"isCbb")!==false)bad("REGISTRY");return before;};
const run=async()=>{
 stage="registration-before";const initial=await registration();check();if(initial.public.projectPresent)bad("PROJECT");
 if(phase==="open-project"){
  stage="subscribe";let delivered=0,eventFailed=false,eventProject,settle;const event=new Promise(resolve=>{settle=resolve;});
  const advanceUrl=()=>{if(!dispatchAttempted)bad("PREFIX");retainedHref=location?.href;check();};
  const receive=(...args)=>{delivered++;try{if(!dispatchAttempted||delivered!==1||args.length!==3||args[0]!==null||args[1]!==undefined||args[2]!==undefined)bad("PREFIX");advanceUrl();const observed=sample();if(!observed.public.projectPresent)bad("PROJECT");eventProject=own(host,"currentProject");prefixObserved=true;}catch{eventFailed=true;}settle();};
  const task=apply(subscribe.fn,bus,["loadProjectCompleted",receive]),cancel=method(task,"cancel");
  const listener=()=>{methodCheck(cancel);if(own(task,"callback")!==receive||own(task,"isRunning")!==true)bad("PREFIX");};
  cleanup=()=>{listener();apply(cancel.fn,task,[]);if(own(task,"callback")!==null||own(task,"isRunning")!==false)bad("CLEANUP");};
  prefixCheck=()=>{listener();if(eventFailed||delivered>1)bad("PREFIX");};
  listener();same(initial,sample());check();if(delivered!==0||eventFailed)bad("PREFIX");
  stage="dispatch";dispatchAttempted=true;const result=await apply(openCall.fn,apiBus,["extensionApi.DMT_Project.openProject",target.projectUuid]);
  stage="acknowledgement";advanceUrl();listener();if(typeof result!=="boolean")bad("ACK");publicResult=result;if(!result)bad("ACK");
  stage="prefix";await event;check();listener();if(delivered!==1||eventFailed||!prefixObserved)bad("PREFIX");if(own(host,"currentProject")!==eventProject)bad("OWNERS");
 }
 stage="registration-after";const after=await registration();check();stage="observe";const final=sample();same(after,final);await Promise.resolve();check();same(final,sample());
 if(final.public.projectPresent!==(phase==="open-project"))bad("PROJECT");
 observation=final.public;stage="output";return{ok:true,status:phase==="preflight"?"ready":"opened-prefix-observed",failure:null};
};
check();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;code="TIMEOUT";reject(new Error("PCB_DIAGNOSTIC_OPENING"));},phase==="preflight"?10000:45000]);});
outcome=await Promise.race([run(),timeout]);
}catch{outcome={ok:false,status:"refused",failure:{stage,code}};}
finally{
 try{if(cleanup!==undefined)cleanup();}catch{outcome={ok:false,status:"refused",failure:{stage:"cleanup",code:"CLEANUP"}};}
 if(timer!==undefined&&typeof clear==="function"){try{Reflect.apply(clear,globalThis,[timer]);}catch{outcome={ok:false,status:"refused",failure:{stage:"cleanup",code:"CLEANUP"}};}}
}
return JSON.stringify({schema:"easyeda-pro-control.pcb-diagnostic-opening.v1",phase,projectUuid:target.projectUuid,branchUuid:target.branchUuid,documentUuid:target.documentUuid,...outcome,dispatchAttempted,publicResult,prefixObserved,nativeWorkMayRemain:dispatchAttempted,observation});
}`;

export const CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION_SHA256 =
  createHash("sha256").update(CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION, "utf8").digest("hex");

function openingTarget(input: unknown): CurrentDisposableOpenSealedTarget {
  const target = currentDisposableOpenSealedTargetSchema.parse(input);
  if (!target.rawWindowsPath.isWellFormed()) { throw new Error("PCB_DIAGNOSTIC_OPENING_TARGET"); }
  return target;
}
/** Validation only. The returned data is not a checkpoint or dispatch token. */
export function currentPcbDiagnosticOpeningArguments(target: unknown, phase: CurrentPcbDiagnosticOpeningPhase): readonly Readonly<{ value: unknown }>[] {
  return freezeDeep([{ value: openingTarget(target) }, { value: phaseSchema.parse(phase) }]);
}

const opaque = z.string().regex(/^[A-Za-z\d_-]{1,128}$/u);
const tab = z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})@[a-f\d]{64}$/u);
// oxlint-disable-next-line no-control-regex -- Reject control bytes in the exact observed title; they must never form an admitted target identity.
const title = z.string().min(1).max(512).refine(value => value.isWellFormed() && !/[\u0000-\u001F\u007F]/u.test(value));
const observationSchema = z.object({
  projectPresent: z.boolean(), branchUuid: z.string().regex(/^[a-f\d]{32}$/u).nullable(), windowTabId: opaque,
  containerCount: z.number().int().min(1).max(128), tabIds: z.array(tab).max(256),
  activeTabId: z.union([tab, z.literal(""), z.literal("0"), z.literal("tab_page1")]),
  initialTitle: title, expectedOpenedTitle: title, documentTitle: title,
}).strict();
const resultSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-diagnostic-opening.v1"), phase: phaseSchema,
  projectUuid: z.string().regex(/^[a-f\d]{64}$/u), branchUuid: z.string().regex(/^[a-f\d]{32}$/u),
  documentUuid: z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u),
  ok: z.boolean(), status: z.enum(["ready", "opened-prefix-observed", "refused"]),
  failure: z.object({ stage: z.enum(stages), code: z.enum(codes) }).strict().nullable(),
  dispatchAttempted: z.boolean(), publicResult: z.boolean().nullable(), prefixObserved: z.boolean(),
  nativeWorkMayRemain: z.boolean(), observation: observationSchema.nullable(),
}).strict();
const LIMITS = Object.freeze({ startupQualified: false, restorationCompletionVerified: false, persistenceVerified: false,
  compilerOwnerVerified: false, queueCompletionVerified: false, executionAuthorized: false, nativeIntrinsicsVerified: false } as const);
export type CurrentPcbDiagnosticOpeningResult = Readonly<z.infer<typeof resultSchema>> & typeof LIMITS;
function refuse(): never { throw new Error("PCB_DIAGNOSTIC_OPENING_REPLY"); }
function ownRecord(input: unknown, keys: readonly string[]): Record<string, unknown> {
  if (input === null || typeof input !== "object" || types.isProxy(input) || Array.isArray(input)) { return refuse(); }
  const prototype: unknown = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null) { return refuse(); }
  const actual = Reflect.ownKeys(input);
  if (actual.length !== keys.length || actual.some(key => typeof key !== "string" || !keys.includes(key))) { return refuse(); }
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { return refuse(); }
    result[key] = descriptor.value as unknown;
  }
  return result;
}

/** Only the fixed function's by-value string is admitted. A caller-created
 * matching result cannot establish source, owner, checkpoint or live execution.
 */
export function decodeCurrentPcbDiagnosticOpeningReply(input: unknown, targetInput: unknown,
  phaseInput: CurrentPcbDiagnosticOpeningPhase): CurrentPcbDiagnosticOpeningResult {
  const target = openingTarget(targetInput);
  const phase = phaseSchema.parse(phaseInput), reply = ownRecord(input, ["result"]);
  const value = ownRecord(reply["result"], ["type", "value"]);
  const raw = value["value"];
  if (value["type"] !== "string" || typeof raw !== "string" || !raw.isWellFormed() ||
      Buffer.byteLength(raw, "utf8") > CURRENT_PCB_DIAGNOSTIC_OPENING_RESULT_BYTES) { return refuse(); }
  try {
    const result = resultSchema.parse(decodeCurrentPcbDiagnosticJson(Buffer.from(raw, "utf8")));
    if (result.phase !== phase || result.projectUuid !== target.projectUuid || result.branchUuid !== target.branchUuid ||
        result.documentUuid !== target.documentUuid || result.nativeWorkMayRemain !== result.dispatchAttempted ||
        (result.publicResult !== null || result.prefixObserved) && !result.dispatchAttempted ||
        phase === "preflight" && result.dispatchAttempted || result.ok !== (result.failure === null) ||
        result.ok !== (result.status !== "refused")) { return refuse(); }
    const observed = result.observation;
    const projectName = target.rawWindowsPath.slice(target.rawWindowsPath.lastIndexOf("\\") + 1,
      target.rawWindowsPath.indexOf(".eprj2"));
    if (observed !== null && (new Set(observed.tabIds).size !== observed.tabIds.length ||
        observed.tabIds.some(id => !id.endsWith(`@${target.projectUuid}`)) ||
        observed.branchUuid !== (observed.projectPresent ? target.branchUuid : null) ||
        !observed.projectPresent && (observed.tabIds.length > 0 || observed.activeTabId !== "tab_page1") ||
        observed.activeTabId.includes("@") && !observed.tabIds.includes(observed.activeTabId) ||
        projectName.length === 0 || projectName.length > 256 || observed.initialTitle.includes(" | ") ||
        !/^.+ - V\d+(?:\.\d+){1,7}$/u.test(observed.initialTitle) ||
        observed.expectedOpenedTitle !== `${projectName} | ${observed.initialTitle}` ||
        observed.documentTitle !== (observed.projectPresent ? observed.expectedOpenedTitle : observed.initialTitle))) { return refuse(); }
    if (result.ok && (observed === null || observed.projectPresent !== (phase === "open-project") ||
        phase === "preflight" && (result.status !== "ready" || result.publicResult !== null || result.prefixObserved) ||
        phase === "open-project" && (result.status !== "opened-prefix-observed" || !result.dispatchAttempted ||
          result.publicResult !== true || !result.prefixObserved))) { return refuse(); }
    return freezeDeep({ ...result, ...LIMITS });
  } catch { return refuse(); }
}
