/** Fixed current209 UI-only actions. Full UI/PCB source admission and original
 * disposable lifecycle ownership belong to the mounted native owner. */
import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { buildCurrentProjectUrlGuard } from "./current-project-url.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_209_VISUAL_OPERATION_BYTES = 12_000;
export const CURRENT_PCB_209_VISUAL_RESULT_BYTES = 128 * 1024;
export const CURRENT_PCB_209_VISUAL_SELECTION_BYTES = 48 * 1024;
const id = z.string().min(1).max(256).refine(value => value.isWellFormed(), "Invalid UTF-16 ID.");
export const currentPcb209VisualIdsSchema = z.array(id).max(256)
  .refine(ids => new Set(ids).size === ids.length, "Duplicate selection IDs.")
  .refine(ids => Buffer.byteLength(canonicalJson(ids)) <= CURRENT_PCB_209_VISUAL_SELECTION_BYTES, "Complete selected-ID list exceeds its output reservation.");
const coordinate = z.number().min(-1e12).max(1e12).refine(value => !Object.is(value, -0), "Negative zero is unsupported.");
export const currentPcb209VisualOperationSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("fit-all") }).strict(),
  z.object({ kind: z.literal("fit-selected"), expectedSelection: currentPcb209VisualIdsSchema.min(1) }).strict(),
  z.object({ kind: z.literal("zoom-to"), xMil: coordinate, yMil: coordinate,
    scaleRatio: z.number().min(0.00001).max(1_000_000) }).strict(),
  z.object({ kind: z.literal("navigate-coordinates"), xMil: coordinate, yMil: coordinate,
    acceptTransientOverlayEffects: z.literal(true) }).strict(),
  z.object({ kind: z.literal("navigate-region"), leftMil: coordinate, rightMil: coordinate,
    topMil: coordinate, bottomMil: coordinate, acceptTransientOverlayEffects: z.literal(true) }).strict()
    .refine(value => value.leftMil < value.rightMil && value.bottomMil < value.topMil, "Navigation region must have positive width and height."),
]).refine(value => Buffer.byteLength(canonicalJson(value)) <= CURRENT_PCB_209_VISUAL_OPERATION_BYTES,
  "Complete visual operation exceeds its native envelope reservation.");
export type CurrentPcb209VisualOperation = z.infer<typeof currentPcb209VisualOperationSchema>;
const targetSchema = z.object({ projectUuid: z.string(), branchUuid: z.string(), documentUuid: z.string(), tabId: z.string() }).strict();
const nativeBoundsSchema = z.object({ minX: coordinate, maxX: coordinate, minY: coordinate, maxY: coordinate }).strict()
  .refine(value => value.minX < value.maxX && value.minY < value.maxY &&
    Object.values(value).every(item => Math.abs(item * 10) <= 1e12), "Invalid camera bounds.");
const stageSchema = z.enum(["preflight", "viewport-dispatched", "viewport-acknowledged"]);
const packetSchema = z.object({ ok: z.boolean(), kind: z.literal("pcb209-original-visual-action"), target: targetSchema,
  operation: currentPcb209VisualOperationSchema, stage: stageSchema, previousSelection: currentPcb209VisualIdsSchema.nullable(),
  observedSelection: currentPcb209VisualIdsSchema.nullable(), viewportAttempted: z.boolean(), viewportAcknowledged: z.boolean(),
  nativeBounds: nativeBoundsSchema.nullable() }).strict();

/** Fixed camera and explicitly accepted transient navigation operations.
 * Selection and clearing remain excluded because their installed handlers
 * flush design services and may delete empty views. */
export const CURRENT_PCB_209_VISUAL_FUNCTION = `async function(sealed,phase,operation){
"use strict";
let clear,timer,expired=false;
const root=globalThis,apply=Reflect.apply,bad=()=>{throw new Error("PCB209_VISUAL_ACTION_REFUSED");};
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const object=o=>o!==null&&typeof o==="object"&&!Array.isArray(o);
const plain=o=>{if(!object(o)||Object.getPrototypeOf(o)!==Object.prototype)bad();return o;};
const absent=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(d&&(!Object.hasOwn(d,"value")||d.value!==undefined))bad();};
const fn=(o,k)=>{const f=own(o,k);if(typeof f!=="function")bad();return f;};
plain(sealed);if(phase!=="visual"||Reflect.ownKeys(sealed).length!==5)bad();
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
const exact=(o,keys)=>{plain(o);const actual=Reflect.ownKeys(o);if(actual.length!==keys.length||actual.some(k=>!keys.includes(k)))bad();};
const text=v=>{if(typeof v!=="string"||!v.length||v.length>256||!v.isWellFormed())bad();return v;};
const array=(v,max=256)=>{if(!Array.isArray(v)||![Array.prototype,childArrayPrototype].includes(Object.getPrototypeOf(v)))bad();const n=own(v,"length");if(n>max||Reflect.ownKeys(v).length!==n+1)bad();return n;};
const ids=raw=>{const result=[],seen=new Set();for(let i=0,n=array(raw);i<n;i++){const id=text(own(raw,String(i)));if(seen.has(id))bad();seen.add(id);result.push(id);}if(new TextEncoder().encode(JSON.stringify(result)).byteLength>${CURRENT_PCB_209_VISUAL_SELECTION_BYTES})bad();return result;};
const number=v=>{if(typeof v!=="number"||!Number.isFinite(v)||Object.is(v,-0)||Math.abs(v)>1e12||JSON.stringify(v).length>32)bad();return v;};
const kind=own(operation,"kind");let expected=[];
if(kind==="fit-selected"){exact(operation,["kind","expectedSelection"]);expected=ids(own(operation,"expectedSelection"));if(!expected.length)bad();}
else if(kind==="fit-all")exact(operation,["kind"]);
else if(kind==="zoom-to"){exact(operation,["kind","xMil","yMil","scaleRatio"]);number(own(operation,"xMil"));number(own(operation,"yMil"));const ratio=number(own(operation,"scaleRatio"));if(ratio<0.00001||ratio>1e6)bad();}
else if(kind==="navigate-coordinates"){exact(operation,["kind","xMil","yMil","acceptTransientOverlayEffects"]);number(own(operation,"xMil"));number(own(operation,"yMil"));if(own(operation,"acceptTransientOverlayEffects")!==true)bad();}
else if(kind==="navigate-region"){exact(operation,["kind","leftMil","rightMil","topMil","bottomMil","acceptTransientOverlayEffects"]);for(const key of ["leftMil","rightMil","topMil","bottomMil"])number(own(operation,key));if(own(operation,"acceptTransientOverlayEffects")!==true||operation.leftMil>=operation.rightMil||operation.bottomMil>=operation.topMil)bad();}
else bad();
const encodedOperation=JSON.stringify(operation);if(new TextEncoder().encode(encodedOperation).byteLength>${CURRENT_PCB_209_VISUAL_OPERATION_BYTES})bad();
const state={ok:false,kind:"pcb209-original-visual-action",target,operation,stage:"preflight",previousSelection:null,observedSelection:null,
viewportAttempted:false,viewportAcknowledged:false,nativeBounds:null};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const childPlain=o=>{if(!object(o)||![Object.prototype,childObjectPrototype].includes(Object.getPrototypeOf(o)))bad();return o;};
const call=async(topic,arg)=>{check();const response=await apply(rpc,channel,[topic,arg,0]);check();return own(childPlain(response),"message");};
const identity=async()=>{const value=childPlain(await call("getTabIdAndDocType",undefined));if(Reflect.ownKeys(value).length!==2||own(value,"tabId")!==target.tabId||own(value,"docType")!==3)bad();};
const selected=async()=>ids(await call("pcb/extensionAPI/selectcontrol-getAllSelectedPrimitiveIds",undefined));
const result=()=>{const json=JSON.stringify(state);if(new TextEncoder().encode(json).byteLength>${CURRENT_PCB_209_VISUAL_RESULT_BYTES})bad();return json;};
const run=async()=>{
check();
await identity();state.previousSelection=await selected();if(kind==="fit-selected"&&!same(state.previousSelection,expected))bad();await identity();if(!same(state.previousSelection,await selected()))bad();check();
// Reserve complete success/failure packet before the camera dispatch. Four
// finite JSON numbers are each bounded to32 characters, including sign/exponent.
const reservation={...state,ok:false,stage:"viewport-acknowledged",observedSelection:state.previousSelection,viewportAttempted:false,viewportAcknowledged:false,nativeBounds:{minX:0,maxX:0,minY:0,maxY:0}};
if(new TextEncoder().encode(JSON.stringify(reservation)).byteLength+4*32>${CURRENT_PCB_209_VISUAL_RESULT_BYTES})bad();
state.viewportAttempted=true;state.stage="viewport-dispatched";
let box;
if(kind==="fit-all")box=await call("adaptAllAndGetBBox","");
else if(kind==="fit-selected")box=await call("adaptSelectAndGetBbox","");
else if(kind==="zoom-to")box=await call("pcbZoomTo",{x:number(own(operation,"xMil"))*.1,y:number(own(operation,"yMil"))*.1,scaleRatio:number(own(operation,"scaleRatio"))});
else if(kind==="navigate-coordinates"){if(await call("pcb/extensionAPI/document-navigateToCoordinates",{x:operation.xMil,y:operation.yMil})!==true)bad();}
else if(kind==="navigate-region"){if(await call("pcb/extensionAPI/document-navigateToRegion",{left:operation.leftMil,right:operation.rightMil,top:operation.topMil,bottom:operation.bottomMil})!==true)bad();}
if(kind==="navigate-coordinates"||kind==="navigate-region"){
// PCB a8405930@10303941/10304400 acknowledges after scheduling its own
// requestAnimationFrame/75ms/3s overlays. That boolean is not a camera box,
// rendering completion or timer settlement; the original process stays owned.
state.viewportAcknowledged=true;state.stage="viewport-acknowledged";
}else{
// Native unsafe messageBus returns the original at/cI bounding-box instance,
// not a cloned plain object. Read exactly its four own numeric data fields.
if(!object(box))bad();const keys=Reflect.ownKeys(box);if(keys.length!==4||keys.some(k=>!["minX","maxX","minY","maxY"].includes(k)))bad();
const bounds={minX:number(own(box,"minX")),maxX:number(own(box,"maxX")),minY:number(own(box,"minY")),maxY:number(own(box,"maxY"))};
if(bounds.minX>=bounds.maxX||bounds.minY>=bounds.maxY)bad();for(const value of Object.values(bounds))number(value*10);
state.nativeBounds=bounds;state.viewportAcknowledged=true;state.stage="viewport-acknowledged";
}
state.observedSelection=await selected();if(!same(state.previousSelection,state.observedSelection))bad();await identity();check();state.ok=true;return result();
};
try{
check();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;reject(new Error("PCB209_VISUAL_ACTION_REFUSED"));},3000]);});
return await Promise.race([run(),timeout]);
}catch{return result();}finally{if(timer!==undefined&&typeof clear==="function")apply(clear,root,[timer]);}
}`;

export function decodeCurrentPcb209VisualReply(raw: unknown, targetInput: unknown, operationInput: unknown): Readonly<Record<string, unknown>> {
  const target = currentDisposableOpenSealedTargetSchema.parse(targetInput);
  const operation = currentPcb209VisualOperationSchema.parse(operationInput);
  const navigation = operation.kind === "navigate-coordinates" || operation.kind === "navigate-region";
  const reply = z.object({ result: z.object({ type: z.literal("string"), value: z.string() }).strict() }).strict().parse(raw);
  if (Buffer.byteLength(reply.result.value) > CURRENT_PCB_209_VISUAL_RESULT_BYTES) { throw new Error("PCB209_VISUAL_RESULT_BOUND"); }
  const packet = packetSchema.parse(decodeCurrentPcbDiagnosticJson(Buffer.from(reply.result.value)));
  const expectedTarget = { projectUuid: target.projectUuid, branchUuid: target.branchUuid, documentUuid: target.documentUuid,
    tabId: `${target.documentUuid}@${target.projectUuid}` };
  if (canonicalJson(packet.target) !== canonicalJson(expectedTarget) || canonicalJson(packet.operation) !== canonicalJson(operation)) {
    throw new Error("PCB209_VISUAL_RESULT_TARGET");
  }
  if (packet.viewportAcknowledged !== (packet.stage === "viewport-acknowledged") ||
      packet.viewportAttempted !== (packet.stage !== "preflight") ||
      (navigation ? packet.nativeBounds !== null : (packet.nativeBounds !== null) !== packet.viewportAcknowledged) ||
      (packet.observedSelection !== null && !packet.viewportAcknowledged)) { throw new Error("PCB209_VISUAL_EFFECT_ORDER"); }
  if (packet.ok && (packet.stage !== "viewport-acknowledged" || !packet.viewportAcknowledged || (!navigation && packet.nativeBounds === null) ||
      packet.previousSelection === null || canonicalJson(packet.previousSelection) !== canonicalJson(packet.observedSelection) ||
      (operation.kind === "fit-selected" && canonicalJson(packet.previousSelection) !== canonicalJson(operation.expectedSelection)))) {
    throw new Error("PCB209_VISUAL_VIEWPORT_RESULT");
  }
  const bounds = packet.nativeBounds;
  return freezeDeep({ schema: "easyeda-pro-control.pcb209-visual-action.v1", ...packet,
    mutationMayHaveOccurred: packet.viewportAttempted,
    boundsMil: bounds === null ? null : { left: bounds.minX * 10, right: bounds.maxX * 10, bottom: bounds.minY * 10, top: bounds.maxY * 10 },
    resultSha256: sha256Json(packet), implementationKind: "native-task-equivalent",
    cameraBoundsScope: navigation ? "not-observed-native-navigation-boolean-acknowledgment" : "single-source-returned-camera-getBBox2",
    cameraStateDoubleSampled: false, transientOverlayCompletionVerified: false, automaticInverseAvailable: false,
    cadAuthority: false, startupCompletionVerified: false, completeLiveBaselineVerified: false, sourceMembershipVerified: false,
    connectivityVerified: false, persistenceVerified: false, executionAuthorized: false, saveAuthorized: false,
    limitations: ["Camera UI effects and native render notifications are requested. Navigation also requires explicit acceptance of native transient overlays. No source edit or Save is requested, and file invariance is not established by this response.",
      "Selection mutation is excluded. Installed selection handlers can flush connectivity, DRC and uploads, and delete empty views. Fit-selected compares the complete ordered selected-ID list with the request before dispatch and again afterward.",
      "Fit/zoom viewport bounds come from the original native handler once. Navigation returns only the exact native true acknowledgment, with no camera bounds. Camera state is not independently double-sampled and render completion is not observed. Fit-selected includes component attribute bounding boxes.",
      "navigate-coordinates and navigate-region pass data-origin mil values unchanged to their fixed native handlers. Both center the viewport without requesting a scale change. They may cancel an existing navigation overlay and schedule an animation frame, a 75ms timer and a 3s crossline or rectangle overlay. Their acknowledgment does not prove callback execution, timer settlement, overlay absence or visual arrival. Keep the original disposable owner through actual process/Job exit and release. No screenshot, schematic or3D routing is included."] });
}

/** Independently reconstruct historical/publication data from its complete
 * fixed packet. This validates bytes and scope, never recreates a live owner. */
export function requireCurrentPcb209VisualResult(input: unknown, target: unknown, operation: unknown): void {
  const data = z.record(z.string(), z.unknown()).parse(input);
  if (Buffer.byteLength(canonicalJson(data)) > CURRENT_PCB_209_VISUAL_RESULT_BYTES) { throw new Error("PCB209_VISUAL_PROJECTED_RESULT_BOUND"); }
  const packet = Object.fromEntries(packetSchema.keyof().options.map(key => [key, data[key]]));
  const decoded = decodeCurrentPcb209VisualReply({ result: { type: "string", value: JSON.stringify(packet) } }, target, operation);
  if (canonicalJson(decoded) !== canonicalJson(data)) { throw new Error("PCB209_VISUAL_PROJECTED_RESULT"); }
}
