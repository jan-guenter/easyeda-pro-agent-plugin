/** Fixed diagnostic document opening. This leaf does not own dispatch intent,
 * checkpoints, process handles, frame transitions or source admission. */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { z } from "zod";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { buildCurrentProjectUrlGuard } from "./current-project-url.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_RESULT_BYTES = 16_384;
export const CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_PHASES = ["preflight", "open-document", "observe"] as const;
export type CurrentPcbDiagnosticPcbOpeningPhase = typeof CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_PHASES[number];
const phaseSchema = z.enum(CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_PHASES);
const stages = ["setup", "registration-before", "dispatch", "acknowledgement", "registration-after", "frame", "output", "cleanup"] as const;
const codes = ["EXCEPTION", "GUARD", "FIELD", "METHOD", "BINDING", "URL", "PROJECT", "TAB", "REGISTRY", "FRAME", "ACK", "TIMEOUT", "CLEANUP"] as const;

/** Original admitted UI uniqueContextId; by-value sealed target/phase only.
 * callFunctionOn: returnByValue/awaitPromise/silent true; userGesture,
 * generatePreview/throwOnSideEffect false. Only open-document navigates.
 * The separate observe phase never retries navigation or creates an iframe. */
export const CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION = `async function(target,phase){
"use strict";
let stage="setup",code="EXCEPTION",dispatchAttempted=false,publicResult=null,frameObserved=false,windowTabId=null,timer,clear,expired=false,outcome;
const bad=(value="GUARD")=>{code=value;throw new Error("PCB_DIAGNOSTIC_PCB_OPENING");};
try{
const root=globalThis,apply=Reflect.apply;
const own=(o,k,optional=false)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad("FIELD");const d=Object.getOwnPropertyDescriptor(o,k);if(!d){if(optional&&!(k in o))return undefined;bad("FIELD");}if(!Object.hasOwn(d,"value"))bad("FIELD");return d.value;};
const plain=o=>{if(o===null||typeof o!=="object"||Array.isArray(o)||Object.getPrototypeOf(o)!==Object.prototype)bad();return o;};
const text=(v,n)=>{if(typeof v!=="string"||v.length>n||!v.isWellFormed()||/[\\u0000-\\u001F\\u007F]/.test(v))bad();return v;};
const matches=(v,re)=>{const m=typeof v==="string"?re.exec(v):null;return m!==null&&m[0]===v;};
plain(target);const targetKeys=["rawWindowsPath","projectUuid","branchUuid","documentUuid","expectedSourceSha256"];
if(Reflect.ownKeys(target).length!==5||targetKeys.some(k=>!Object.hasOwn(target,k)))bad();
for(const k of targetKeys)text(own(target,k),4096);
if(!matches(target.projectUuid,/^[a-f0-9]{64}$/)||!matches(target.branchUuid,/^[a-f0-9]{32}$/)||!matches(target.documentUuid,/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/)||!matches(target.expectedSourceSha256,/^[a-f0-9]{64}$/)||!matches(target.rawWindowsPath,/^[A-Za-z]:\\\\[^\\u0000-\\u001F\\u007F<>:"|?*/]+\\.eprj2$/)||!["preflight","open-document","observe"].includes(phase))bad();
const tabId=target.documentUuid+"@"+target.projectUuid;
const dense=(a,max)=>{if(!Array.isArray(a)||Object.getPrototypeOf(a)!==Array.prototype)bad();const n=own(a,"length");if(!Number.isSafeInteger(n)||n<0||n>max||Reflect.ownKeys(a).length!==n+1)bad();for(let i=0;i<n;i++)own(a,String(i));return n;};
const method=(o,k)=>{const chain=[];let p=o;for(let i=0;i<4;i++){if(p===null||(typeof p!=="object"&&typeof p!=="function"))bad("METHOD");chain.push(p);const d=Object.getOwnPropertyDescriptor(p,k);if(d){if(!Object.hasOwn(d,"value")||typeof d.value!=="function")bad("METHOD");return {owner:o,key:k,chain,fn:d.value};}p=Object.getPrototypeOf(p);}bad("METHOD");};
const methodCheck=b=>{for(let i=0;i<b.chain.length;i++){const p=b.chain[i];if(i>0&&Object.getPrototypeOf(b.chain[i-1])!==p)bad("BINDING");if(i===b.chain.length-1){if(own(p,b.key)!==b.fn)bad("BINDING");}else if(Object.hasOwn(p,b.key))bad("BINDING");}};
${buildCurrentProjectUrlGuard()}
const location=root.location,document=root.document,initialHref=location?.href,initialUrl=parseProjectUrl(initialHref,target.projectUuid);
if(initialUrl.empty)bad("URL");let retainedHref=initialHref;
const ui=own(root,"UI"),host=own(root,"gVars"),tabs=own(ui,"tabBar"),project=plain(own(host,"currentProject")),mode=own(root,"PRO_EDITOR_MODE");
windowTabId=own(root,"_TAB_ID_");if(!matches(windowTabId,/^[A-Za-z0-9_-]{1,128}$/)||typeof tabs!=="function")bad();
const active=method(tabs,"getActiveTab"),container=method(tabs,"getContainerInfo"),getTab=method(tabs,"getTabById");
const bus=own(host,"messageBus"),registry=method(bus,"rpcCall"),apiBus=own(host,"extensionApiMessageBus2"),open=method(apiBus,"rpcCall");
const select=document?.querySelectorAll,set=own(root,"setTimeout");clear=own(root,"clearTimeout");
if(typeof select!=="function"||typeof set!=="function"||typeof clear!=="function")bad();
const check=()=>{
if(expired)bad("TIMEOUT");
if(root.window!==root||root.top!==root||root.document!==document||root.location!==location||document?.defaultView!==root||document?.nodeType!==9||document?.URL!==retainedHref||location?.href!==retainedHref||location?.origin!=="https://client"||document.querySelectorAll!==select)bad("URL");
const url=parseProjectUrl(retainedHref,target.projectUuid);if(url.empty||url.base!==initialUrl.base||url.tabIds.some(id=>id!==tabId)||url.activeTabId!==null&&url.activeTabId!==tabId)bad("URL");
if(own(root,"PRO_EDITOR_MODE")!==mode||!["CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM","CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM"].includes(mode))bad();
if(own(root,"gVars")!==host||own(root,"UI")!==ui||own(ui,"gVars")!==host||own(ui,"tabBar")!==tabs||own(host,"currentProject")!==project||own(host,"messageBus")!==bus||own(host,"extensionApiMessageBus2")!==apiBus||own(root,"_MSG_BUS2_EXTAPI_")!==apiBus||own(root,"_TAB_ID_")!==windowTabId||own(root,"setTimeout")!==set||own(root,"clearTimeout")!==clear)bad("BINDING");
if(own(project,"projectId")!==target.projectUuid||own(project,"branchUuid")!==target.branchUuid||own(project,"isV2Format")!==false||own(host,"isHistoryMode")!==false)bad("PROJECT");
for(const b of [active,container,getTab,registry,open])methodCheck(b);
};
const sample=required=>{
check();const ids=own(tabs,"containerIds"),tree=plain(own(tabs,"containerTree"));
if(dense(ids,1)!==1||own(ids,"0")!=="editor-window-main"||own(tree,"id")!=="editor-window-main"||own(tree,"children",true)!==undefined||own(tabs,"belongContainer")!=="editor-window-main")bad("TAB");
const info=plain(apply(container.fn,tabs,["editor-window-main"])),list=own(info,"tabs"),n=dense(list,3),current=own(tabs,"currentTabId");
if(n<1||own(info,"id")!=="editor-window-main"||own(info,"belong")!=="editor-window-main"||own(info,"activeTabId")!==current||apply(active.fn,tabs,[])!==current)bad("TAB");
const owners=[ids,tree,info,list],rows=[],seen=new Set();let found=false;
for(let i=0;i<n;i++){const tab=plain(own(list,String(i))),id=text(own(tab,"tabId"),128),data=plain(own(tab,"data"));if(seen.has(id)||apply(getTab.fn,tabs,[id])!==tab)bad("TAB");seen.add(id);owners.push(tab,data);
const type=own(data,"doctype");if(id==="tab_page1"||id==="0"){const start=id==="tab_page1";if(type!==(start?-1:0)||own(tab,"isAbleDelete")!==false||own(tab,"group")!=="start_blank"||own(tab,"draggable")!==start||typeof own(tab,"isDisplayNone")!=="boolean"||!start&&own(tab,"isDisplayNone")!==true)bad("TAB");
const declared=own(tab,"documentType",true);if(declared!==undefined&&declared!==type)bad("TAB");for(const k of ["pid","owner"])if(own(data,k,true)!==undefined)bad("TAB");for(const k of ["parentProjectUuid","parentLibraryUuid"])if(own(tab,k,true)!==undefined)bad("TAB");
}else{if(id!==tabId||type!==3||own(data,"pid")!==target.projectUuid||own(tab,"parentLibraryUuid",true)!==undefined)bad("TAB");const parent=own(tab,"parentProjectUuid",true);if(parent!==undefined&&parent!==target.projectUuid)bad("TAB");found=true;}rows.push([id,type]);}
if(!seen.has(current)||found!==required||required&&current!==tabId)bad("TAB");
const url=parseProjectUrl(retainedHref,target.projectUuid,current);if(url.tabIds.some(id=>!seen.has(id)))bad("URL");
const allFrames=apply(select,document,["iframe"]);if(allFrames.length!==(required?1:0))bad("FRAME");
return {owners,identity:JSON.stringify([rows,current]),frame:required?allFrames[0]:null};
};
const same=(a,b)=>{if(a.identity!==b.identity||a.frame!==b.frame||a.owners.length!==b.owners.length||a.owners.some((o,i)=>o!==b.owners[i]))bad("BINDING");};
const registration=async required=>{const before=sample(required),reply=await apply(registry.fn,bus,["/pro-mgr/api/client/getProjectPaths",{},0]);check();same(before,sample(required));plain(reply);const message=plain(own(reply,"message"));if(own(message,"success")!==true)bad("REGISTRY");const entries=plain(own(message,"result")),keys=Reflect.ownKeys(entries);if(keys.length>4096||keys.some(k=>!matches(k,/^[a-f0-9]{64}$/)))bad("REGISTRY");const entry=plain(own(entries,target.projectUuid));if(own(entry,"path")!==target.rawWindowsPath||own(entry,"isCbb")!==false)bad("REGISTRY");return before;};
const observe=async()=>{
const before=sample(true),frame=before.frame,child=frame?.contentWindow,childDocument=child?.document,parent=frame?.parentElement,classes=frame?.classList;
const attribute=frame?.getAttribute,has=frame?.hasAttribute,contains=classes?.contains,parentAttribute=parent?.getAttribute;
if(typeof attribute!=="function"||typeof has!=="function"||typeof contains!=="function"||typeof parentAttribute!=="function")bad("FRAME");
const native=own(child,"MSG_BUS_PCB"),channel=own(native,"messageBus"),identity=method(channel,"rpcCall"),childObject=own(child,"Object"),childPrototype=own(childObject,"prototype");
const frameCheck=()=>{check();same(before,sample(true));methodCheck(identity);
if(frame.tagName!=="IFRAME"||frame.id!=="frame_"+tabId||frame.ownerDocument!==document||frame.isConnected!==true||frame.parentElement!==parent||frame.classList!==classes||classes.contains!==contains||frame.getAttribute!==attribute||frame.hasAttribute!==has||parent.getAttribute!==parentAttribute||!apply(contains,classes,["editframe"])||apply(parentAttribute,parent,["uuid"])!==tabId)bad("FRAME");
for(const [k,v] of [["c_dbid",tabId],["c_doctype","3"],["src","editor?entry=pcb"],["pcb-canvas","true"]])if(apply(attribute,frame,[k])!==v)bad("FRAME");for(const k of ["blankIframe","fromFile","jsonCacheReady"])if(apply(has,frame,[k]))bad("FRAME");
if(frame.contentWindow!==child||child.document!==childDocument||childDocument?.defaultView!==child||childDocument?.nodeType!==9||child.frameElement!==frame||child.parent!==root||child.top!==root||child.location?.href!=="https://client/editor?entry=pcb"||own(child,"MSG_BUS_PCB")!==native||own(native,"messageBus")!==channel||own(child,"Object")!==childObject||own(childObject,"prototype")!==childPrototype)bad("FRAME");
};
const childPlain=v=>{if(v===null||typeof v!=="object"||Array.isArray(v))bad("FRAME");const p=Object.getPrototypeOf(v);if(p!==Object.prototype&&p!==childPrototype)bad("FRAME");return v;};
for(let i=0;i<2;i++){frameCheck();const reply=childPlain(await apply(identity.fn,channel,["getTabIdAndDocType",undefined,0]));frameCheck();const value=childPlain(own(reply,"message"));if(Reflect.ownKeys(value).length!==2||own(value,"tabId")!==tabId||own(value,"docType")!==3)bad("FRAME");}
frameObserved=true;
};
const run=async()=>{
stage="registration-before";const initial=await registration(phase==="observe");check();
if(phase==="open-document"){same(initial,sample(false));stage="dispatch";dispatchAttempted=true;publicResult=await apply(open.fn,apiBus,["extensionApi.DMT_EditorControl.openDocument",{documentUuid:target.documentUuid,splitScreenId:undefined}]);stage="acknowledgement";retainedHref=location?.href;check();if(publicResult===undefined)publicResult=null;if(publicResult!==tabId)bad("ACK");}
stage="registration-after";await registration(phase!=="preflight");
if(phase==="observe"){stage="frame";await observe();check();}
stage="output";return {ok:true,status:phase==="preflight"?"ready":phase==="open-document"?"opened":"frame-observed",failure:null};
};
check();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;code="TIMEOUT";reject(new Error("PCB_DIAGNOSTIC_PCB_OPENING"));},phase==="open-document"?45000:10000]);});
outcome=await Promise.race([run(),timeout]);
}catch{outcome={ok:false,status:"refused",failure:{stage,code}};}
finally{if(timer!==undefined&&typeof clear==="function"){try{Reflect.apply(clear,globalThis,[timer]);}catch{outcome={ok:false,status:"refused",failure:{stage:"cleanup",code:"CLEANUP"}};}}}
if(publicResult!==target.documentUuid+"@"+target.projectUuid)publicResult=null;
if(typeof windowTabId!=="string"||!/^[A-Za-z0-9_-]{1,128}$/.test(windowTabId))windowTabId=null;
return JSON.stringify({schema:"easyeda-pro-control.pcb-diagnostic-pcb-opening.v1",phase,projectUuid:target.projectUuid,branchUuid:target.branchUuid,documentUuid:target.documentUuid,tabId:target.documentUuid+"@"+target.projectUuid,...outcome,dispatchAttempted,publicResult,nativeWorkMayRemain:dispatchAttempted,frameObserved,windowTabId});
}`;
export const CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION_SHA256 = createHash("sha256")
  .update(CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION).digest("hex");

export function currentPcbDiagnosticPcbOpeningArguments(input: unknown, phase: CurrentPcbDiagnosticPcbOpeningPhase): readonly Readonly<{ value: unknown }>[] {
  const target = currentDisposableOpenSealedTargetSchema.parse(input);
  if (!target.rawWindowsPath.isWellFormed()) { throw new Error("PCB_DIAGNOSTIC_PCB_OPENING_TARGET"); }
  return freezeDeep([{ value: target }, { value: phaseSchema.parse(phase) }]);
}
const id = z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u);
const tab = z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})@[a-f\d]{64}$/u);
const resultSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-pcb-opening.v1"), phase: phaseSchema,
  projectUuid: z.string().regex(/^[a-f\d]{64}$/u), branchUuid: z.string().regex(/^[a-f\d]{32}$/u), documentUuid: id, tabId: tab,
  ok: z.boolean(), status: z.enum(["ready", "opened", "frame-observed", "refused"]),
  failure: z.object({ stage: z.enum(stages), code: z.enum(codes) }).strict().nullable(),
  dispatchAttempted: z.boolean(), publicResult: z.string().max(128).nullable(), nativeWorkMayRemain: z.boolean(),
  frameObserved: z.boolean(), windowTabId: z.string().regex(/^[A-Za-z\d_-]{1,128}$/u).nullable() }).strict();
const LIMITS = Object.freeze({ frameSourceVerified: false, restorationCompletionVerified: false, startupQualified: false,
  persistenceVerified: false, queueCompletionVerified: false, executionAuthorized: false, nativeIntrinsicsVerified: false } as const);
export type CurrentPcbDiagnosticPcbOpeningResult = Readonly<z.infer<typeof resultSchema>> & typeof LIMITS;
function refuse(): never { throw new Error("PCB_DIAGNOSTIC_PCB_OPENING_REPLY"); }
function ownRecord(input: unknown, fields: readonly string[]): Readonly<Record<string, unknown>> {
  if (input === null || typeof input !== "object" || types.isProxy(input) || Array.isArray(input)) { return refuse(); }
  const keys = Reflect.ownKeys(input), prototype: unknown = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null || keys.length !== fields.length ||
      keys.some(key => typeof key !== "string" || !fields.includes(key))) { return refuse(); }
  const copy: Record<string, unknown> = {};
  for (const key of fields) {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { return refuse(); }
    copy[key] = descriptor.value as unknown;
  }
  return copy;
}
export function decodeCurrentPcbDiagnosticPcbOpeningReply(input: unknown, target: CurrentDisposableOpenSealedTarget,
  phase: CurrentPcbDiagnosticPcbOpeningPhase): CurrentPcbDiagnosticPcbOpeningResult {
  const reply = ownRecord(input, ["result"]), result = ownRecord(reply["result"], ["type", "value"]);
  const raw = result["value"]; currentPcbDiagnosticPcbOpeningArguments(target, phase);
  if (result["type"] !== "string" || typeof raw !== "string" || !raw.isWellFormed() ||
      Buffer.byteLength(raw) > CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_RESULT_BYTES) { return refuse(); }
  try {
    const observed = resultSchema.parse(decodeCurrentPcbDiagnosticJson(Buffer.from(raw)));
    if (observed.phase !== phase || observed.projectUuid !== target.projectUuid || observed.branchUuid !== target.branchUuid ||
        observed.documentUuid !== target.documentUuid || observed.tabId !== `${target.documentUuid}@${target.projectUuid}` ||
        observed.ok !== (observed.failure === null) || observed.nativeWorkMayRemain !== observed.dispatchAttempted ||
        observed.dispatchAttempted && phase !== "open-document" || observed.frameObserved && phase !== "observe" ||
        observed.publicResult !== null && observed.publicResult !== observed.tabId ||
        !observed.dispatchAttempted && observed.publicResult !== null ||
        !observed.ok && observed.status !== "refused") { return refuse(); }
    if (observed.ok && (observed.windowTabId === null ||
        phase === "preflight" && observed.status !== "ready" ||
        phase === "open-document" && (observed.status !== "opened" || !observed.dispatchAttempted || observed.publicResult !== observed.tabId) ||
        phase === "observe" && (observed.status !== "frame-observed" || !observed.frameObserved))) { return refuse(); }
    return freezeDeep({ ...observed, ...LIMITS });
  } catch { return refuse(); }
}
