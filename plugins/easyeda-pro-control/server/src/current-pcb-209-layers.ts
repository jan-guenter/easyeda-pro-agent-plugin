/** Fixed 209 layer metadata, after the original disposable PCB opening.
 * No complete-startup, saved-state or writer authority follows this observation. */
import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { currentPcbLayersResultSchema, validateCurrentPcbLayersResult } from "./current-pcb-layers.ts";
import { buildCurrentProjectUrlGuard } from "./current-project-url.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_209_LAYERS_NATIVE_BYTES = 65_536;
export const CURRENT_PCB_209_LAYERS_RESULT_BYTES = 131_072;
const nativeSchema = currentPcbLayersResultSchema.omit({ method: true, kind: true }).extend({
  kind: z.literal("pcb209-original-layer-observation"),
}).strict();

/** Runs only in the retained, source-qualified UI context. Capture the exact
 * child receiver before the first await, then reprove it around every read. */
export const CURRENT_PCB_209_LAYERS_FUNCTION = `async function(sealed,phase){
"use strict";
let timer,clear,expired=false;
try{
const root=globalThis,apply=Reflect.apply,bad=()=>{throw new Error("PCB209_LAYERS_REFUSED");};
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const object=o=>o!==null&&typeof o==="object"&&!Array.isArray(o);
const plain=o=>{if(!object(o)||Object.getPrototypeOf(o)!==Object.prototype)bad();return o;};
const absent=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(d&&(!Object.hasOwn(d,"value")||d.value!==undefined))bad();};
const fn=(o,k)=>{const f=own(o,k);if(typeof f!=="function")bad();return f;};
plain(sealed);if(phase!=="observe"||Reflect.ownKeys(sealed).length!==5)bad();
for(const k of ["rawWindowsPath","projectUuid","documentUuid","expectedSourceSha256","branchUuid"])if(typeof own(sealed,k)!=="string")bad();
const match=(s,re)=>{const m=re.exec(s);return m!==null&&m[0]===s;};
if(!match(sealed.projectUuid,/^[a-f0-9]{64}$/)||!match(sealed.branchUuid,/^[a-f0-9]{32}$/)||!match(sealed.documentUuid,/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/)||!match(sealed.expectedSourceSha256,/^[a-f0-9]{64}$/))bad();
const target={projectUuid:sealed.projectUuid,branchUuid:sealed.branchUuid,documentUuid:sealed.documentUuid,tabId:sealed.documentUuid+"@"+sealed.projectUuid};
${buildCurrentProjectUrlGuard()}
const location=root.location,href=location?.href,document=root.document,ui=own(root,"UI"),host=own(root,"gVars"),mode=own(root,"PRO_EDITOR_MODE");
const project=plain(own(host,"currentProject")),tabs=own(ui,"tabBar");
if(typeof tabs!=="function"||Object.getPrototypeOf(tabs)!==Function.prototype)bad();
const active=fn(tabs,"getActiveTab"),getTab=fn(tabs,"getTabById"),select=document?.querySelectorAll;
if(typeof select!=="function")bad();
const tab=plain(apply(getTab,tabs,[target.tabId])),data=plain(own(tab,"data"));
const found=apply(select,document,['[id="frame_'+target.tabId+'"]']);if(found.length!==1)bad();
const frame=found[0],child=frame?.contentWindow,childDocument=child?.document,parent=frame?.parentElement;
const native=own(child,"MSG_BUS_PCB"),channel=own(native,"messageBus"),childObject=own(child,"Object"),childArray=own(child,"Array");
const childObjectPrototype=own(childObject,"prototype"),childArrayPrototype=own(childArray,"prototype");
const attr=frame?.getAttribute,has=frame?.hasAttribute,classes=frame?.classList,contains=classes?.contains,parentAttr=parent?.getAttribute;
if(typeof attr!=="function"||typeof has!=="function"||typeof contains!=="function"||typeof parentAttr!=="function")bad();
const chain=[channel];let rpc,rpcOwner;
for(let i=0;i<3;i++){const node=chain[i];if(!object(node))bad();const d=Object.getOwnPropertyDescriptor(node,"rpcCall");if(d){if(!Object.hasOwn(d,"value")||typeof d.value!=="function")bad();rpc=d.value;rpcOwner=node;break;}chain.push(Object.getPrototypeOf(node));}
if(typeof rpc!=="function")bad();
const set=fn(root,"setTimeout");clear=fn(root,"clearTimeout");
const check=()=>{
if(expired||root.window!==root||root.top!==root||root.location!==location||root.document!==document||document?.defaultView!==root||document?.nodeType!==9||document?.URL!==href||location?.href!==href||location?.origin!=="https://client")bad();
parseProjectUrl(href,target.projectUuid,target.tabId);
if(own(root,"PRO_EDITOR_MODE")!==mode||!["CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM","CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM"].includes(mode))bad();
if(own(root,"UI")!==ui||own(root,"gVars")!==host||own(ui,"gVars")!==host||own(host,"currentProject")!==project||own(ui,"tabBar")!==tabs)bad();
if(own(project,"projectId")!==target.projectUuid||own(project,"branchUuid")!==target.branchUuid||own(project,"isV2Format")!==false||own(host,"isHistoryMode")!==false)bad();
if(fn(tabs,"getActiveTab")!==active||fn(tabs,"getTabById")!==getTab||apply(active,tabs,[])!==target.tabId||apply(getTab,tabs,[target.tabId])!==tab||own(tab,"data")!==data)bad();
if(own(tab,"tabId")!==target.tabId||own(data,"doctype")!==3||own(data,"pid")!==target.projectUuid)bad();absent(tab,"parentLibraryUuid");
if(document.querySelectorAll!==select)bad();const current=apply(select,document,['[id="frame_'+target.tabId+'"]']);if(current.length!==1||current[0]!==frame)bad();
if(frame.tagName!=="IFRAME"||frame.id!=="frame_"+target.tabId||frame.ownerDocument!==document||frame.isConnected!==true||frame.parentElement!==parent||frame.classList!==classes||classes.contains!==contains||frame.getAttribute!==attr||frame.hasAttribute!==has||parent.getAttribute!==parentAttr||!apply(contains,classes,["editframe"])||apply(parentAttr,parent,["uuid"])!==target.tabId)bad();
for(const [k,v] of [["c_dbid",target.tabId],["c_doctype","3"],["src","editor?entry=pcb"],["pcb-canvas","true"]])if(apply(attr,frame,[k])!==v)bad();
for(const k of ["blankIframe","fromFile","jsonCacheReady"])if(apply(has,frame,[k]))bad();
if(frame.contentWindow!==child||child.document!==childDocument||childDocument?.defaultView!==child||childDocument?.nodeType!==9||child.frameElement!==frame||child.parent!==root||child.top!==root||child.location?.href!=="https://client/editor?entry=pcb"||own(child,"MSG_BUS_PCB")!==native||own(native,"messageBus")!==channel)bad();
if(own(child,"Object")!==childObject||own(childObject,"prototype")!==childObjectPrototype||own(child,"Array")!==childArray||own(childArray,"prototype")!==childArrayPrototype)bad();
for(let i=0;i<chain.length;i++){const node=chain[i];if(i>0&&Object.getPrototypeOf(chain[i-1])!==node)bad();if(node===rpcOwner){if(own(node,"rpcCall")!==rpc)bad();}else if(Object.hasOwn(node,"rpcCall"))bad();}
if(fn(root,"setTimeout")!==set||fn(root,"clearTimeout")!==clear)bad();
};
const childPlain=o=>{if(!object(o))bad();const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==childObjectPrototype)bad();return o;};
const exact=(o,keys)=>{childPlain(o);const actual=Reflect.ownKeys(o);if(actual.length!==keys.length||actual.some(k=>!keys.includes(k)))bad();};
const text=(v,n,empty=false)=>{if(typeof v!=="string"||v.length>n||(!empty&&v.length===0)||!v.isWellFormed())bad();return v;};
const num=(v,min=-Number.MAX_VALUE,max=Number.MAX_VALUE)=>{if(typeof v!=="number"||!Number.isFinite(v)||Object.is(v,-0)||v<min||v>max)bad();return v;};
const bool=v=>{if(typeof v!=="boolean")bad();return v;};
const projectRows=raw=>{
if(!Array.isArray(raw)||![Array.prototype,childArrayPrototype].includes(Object.getPrototypeOf(raw)))bad();
const n=own(raw,"length");if(n<1||n>512||Reflect.ownKeys(raw).length!==n+1)bad();const ids=new Set(),rows=[];
for(let i=0;i<n;i++){const row=own(raw,String(i));exact(row,["layerId","type","name","order","activeColor","activeColorAlpha","deactiveColor","deactiveColorAlpha","visible","locked","active","layerStatus"]);
const id=num(own(row,"layerId"),1,65535),status=num(own(row,"layerStatus"),0,2);if(!Number.isInteger(id)||!Number.isInteger(status)||ids.has(id))bad();ids.add(id);
rows.push({layerId:id,type:text(own(row,"type"),128),name:text(own(row,"name"),1024,true),order:num(own(row,"order")),activeColor:text(own(row,"activeColor"),128),activeColorAlpha:num(own(row,"activeColorAlpha"),0,1),deactiveColor:text(own(row,"deactiveColor"),128),deactiveColorAlpha:num(own(row,"deactiveColorAlpha"),0,1),visible:bool(own(row,"visible")),locked:bool(own(row,"locked")),active:bool(own(row,"active")),layerStatus:status});}
return rows;};
const call=async topic=>{check();const reply=await apply(rpc,channel,[topic,undefined,0]);check();childPlain(reply);return own(reply,"message");};
const identity=async()=>{const value=await call("getTabIdAndDocType");check();exact(value,["tabId","docType"]);if(own(value,"tabId")!==target.tabId||own(value,"docType")!==3)bad();};
const read=async()=>{await identity();check();const raw=await call("pcb/extensionAPI/pcblayer-getAllLayers");check();const rows=projectRows(raw);await identity();check();return rows;};
const run=async()=>{const first=await read(),json=JSON.stringify(first);if(new TextEncoder().encode(json).byteLength>${CURRENT_PCB_209_LAYERS_NATIVE_BYTES})bad();
const second=await read();check();if(JSON.stringify(second)!==json)bad();const result=JSON.stringify({ok:true,kind:"pcb209-original-layer-observation",target,nativeLayers:first,samples:2,implementationKind:"native-task-equivalent",cadAuthority:false,persistenceVerified:false,physicalStackVerified:false});
if(new TextEncoder().encode(result).byteLength>${CURRENT_PCB_209_LAYERS_NATIVE_BYTES})bad();return result;};
check();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;reject(new Error("PCB209_LAYERS_REFUSED"));},10000]);});return await Promise.race([run(),timeout]);
}catch{throw new Error("PCB209_LAYERS_REFUSED");}finally{if(timer!==undefined&&typeof clear==="function"){try{Reflect.apply(clear,globalThis,[timer]);}catch{throw new Error("PCB209_LAYERS_REFUSED");}}}
}`;

export function decodeCurrentPcb209LayersReply(raw: unknown, targetInput: unknown): Readonly<Record<string, unknown>> {
  const target = currentDisposableOpenSealedTargetSchema.parse(targetInput);
  const reply = z.object({ result: z.object({ type: z.literal("string"), value: z.string() }).strict() }).strict().parse(raw);
  if (Buffer.byteLength(reply.result.value) > CURRENT_PCB_209_LAYERS_NATIVE_BYTES) { throw new Error("PCB209_LAYERS_BOUND"); }
  const native = nativeSchema.parse(decodeCurrentPcbDiagnosticJson(Buffer.from(reply.result.value)));
  const expected = { projectUuid: target.projectUuid, branchUuid: target.branchUuid, documentUuid: target.documentUuid,
    tabId: `${target.documentUuid}@${target.projectUuid}` };
  if (canonicalJson(native.target) !== canonicalJson(expected)) { throw new Error("PCB209_LAYERS_TARGET"); }
  const project = (method: "eda.pcb_Layer.getAllLayers" | "eda.pcb_Layer.getTheNumberOfCopperLayers"): unknown =>
    validateCurrentPcbLayersResult({ method, arguments: {}, target: expected }, { ...native, kind: "current-pcb-layer-observation", method })["value"];
  const result = { schema: "easyeda-pro-control.pcb209-layer-observation.v1", target: expected,
    nativeLayers: native.nativeLayers, layers: project("eda.pcb_Layer.getAllLayers"), copperLayerCount: project("eda.pcb_Layer.getTheNumberOfCopperLayers"),
    nativeLayerProjectionSha256: sha256Json(native.nativeLayers), observedLayerCount: native.nativeLayers.length,
    matchingSamples: true, samples: 2, implementationKind: "native-task-equivalent", originalReceiverRechecked: true,
    startupCompletionVerified: false, completeLiveBaselineVerified: false, physicalStackVerified: false,
    persistenceVerified: false, executionAuthorized: false, saveAuthorized: false };
  if (Buffer.byteLength(canonicalJson(result)) > CURRENT_PCB_209_LAYERS_RESULT_BYTES) { throw new Error("PCB209_LAYERS_RESULT_BOUND"); }
  return freezeDeep(result);
}
