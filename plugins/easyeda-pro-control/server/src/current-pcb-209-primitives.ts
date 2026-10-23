/** Four fixed loaded-view families for the original 209 disposable PCB owner.
 * Pure 206 DTO validators are reused, never its runtime admission or programs. */
import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { CURRENT_PCB_GEOMETRY_MAX_BYTES, CURRENT_PCB_GEOMETRY_MAX_NUMBER, CURRENT_PCB_GEOMETRY_MAX_ROWS,
  currentPcbGeometryResultSchema, validateCurrentPcbGeometryResult } from "./current-pcb-geometry.ts";
import { buildCurrentProjectUrlGuard } from "./current-project-url.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_209_PRIMITIVES_NATIVE_BYTES = CURRENT_PCB_GEOMETRY_MAX_BYTES;
export const CURRENT_PCB_209_PRIMITIVES_RESULT_BYTES = CURRENT_PCB_GEOMETRY_MAX_BYTES;
export const CURRENT_PCB_209_PRIMITIVE_FAMILIES = Object.freeze(["Line", "Arc", "Via", "String"] as const);
const targetSchema = z.object({ projectUuid: z.string(), branchUuid: z.string(), documentUuid: z.string(), tabId: z.string() }).strict();
const packetSchema = z.object({ ok: z.literal(true), kind: z.literal("pcb209-original-primitives-observation"), target: targetSchema,
  observations: z.array(currentPcbGeometryResultSchema).length(CURRENT_PCB_209_PRIMITIVE_FAMILIES.length) }).strict();

/** Complete source-qualified UI/PCB assets are a prerequisite owned by the
 * lifecycle, not established by this generated function or its decoded JSON. */
export const CURRENT_PCB_209_PRIMITIVES_FUNCTION = `async function(sealed,phase){
"use strict";
let timer,clear,expired=false;
try{
const root=globalThis,apply=Reflect.apply,bad=()=>{throw new Error("PCB209_PRIMITIVES_REFUSED");};
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
const num=v=>{if(typeof v!=="number"||!Number.isFinite(v)||Object.is(v,-0)||Math.abs(v)>${CURRENT_PCB_GEOMETRY_MAX_NUMBER})bad();return v;};
const integer=v=>{num(v);if(!Number.isInteger(v))bad();return v;};
const layer=v=>{integer(v);if(v<0||v>65535)bad();return v;};
const bool=v=>{if(typeof v!=="boolean")bad();return v;};
const text=(v,max,nullable=false)=>{if(v===null&&nullable)return v;if(typeof v!=="string"||v.length>max||!v.isWellFormed())bad();return v;};
const point=v=>{if(!object(v))bad();const keys=Reflect.ownKeys(v);if(!keys.includes("x")||!keys.includes("y")||keys.some(k=>k!=="x"&&k!=="y"&&k!=="_hashed"))bad();return{x:num(own(v,"x")),y:num(own(v,"y"))};};
const length=v=>{if(!Array.isArray(v)||![Array.prototype,childArrayPrototype].includes(Object.getPrototypeOf(v)))bad();const n=own(v,"length");if(n<0||n>${CURRENT_PCB_GEOMETRY_MAX_ROWS}||Reflect.ownKeys(v).length!==n+1)bad();return n;};
const rows=(raw,family,seen)=>{
const n=length(raw),result=[];
for(let i=0;i<n;i++){
const row=childPlain(own(raw,String(i))),id=text(own(row,"globalIndex"),256);if(id.length===0||seen.has(id))bad();seen.add(id);
const base={primitiveId:id,primitiveType:family,primitiveLock:bool(own(row,"locked"))};
// PCB6b67774e@10401031 filters parentless String views. yr.toJSON@7394676
// reads existing font caches; its color.toString()||null is not raw model color.
if(family==="String"){
const p=point(own(row,"position")),alignMode=integer(own(row,"origin"));if(alignMode<1||alignMode>9)bad();
const silkColor=text(own(row,"silkColor"),128,true);if(silkColor==="")bad();
result.push({...base,layer:layer(own(row,"layerId")),x:num(p.x*10),y:num(p.y*10),text:text(own(row,"value"),65536),
fontFamily:text(own(row,"fontFamily"),1024),fontSize:num(num(own(row,"fontSize"))*10),lineWidth:num(num(own(row,"strokeWidth"))*10),
alignMode,rotation:num(num(own(row,"rotation"))*180/Math.PI),reverse:bool(own(row,"reverse")),expansion:num(num(own(row,"reverseExpansion"))*10),
mirror:bool(own(row,"mirror")),key:text(own(row,"key"),1024),showKey:bool(own(row,"showKey")),showValue:bool(own(row,"showValue")),positionIsNull:bool(own(row,"positionIsNull")),silkColor});continue;
}
base.net=text(own(row,"net"),1024,true);
// Native Via callback already scales center and radii to mil. Keep its
// precision; API1ca9efb5@1356367 rounds radii before multiplying by two.
if(family==="Via"){
const p=point(own(row,"center")),viaType=integer(own(row,"type"));if(![0,1,2].includes(viaType))bad();
result.push({...base,x:p.x,y:p.y,holeDiameter:num(num(own(row,"holeRadius"))*2),diameter:num(num(own(row,"radius"))*2),viaType,
designRuleBlindViaName:text(own(row,"name"),1024,true),startLayer:layer(own(row,"startLayer")),endLayer:layer(own(row,"endLayer")),
maskExpansionMode:integer(own(row,"expansion")),topMaskExpansion:num(num(own(row,"topExpansion"))*10),bottomMaskExpansion:num(num(own(row,"bottomExpansion"))*10)});continue;
}
// Native track/arc callbacks return mil endpoints/width and degree arcAngle.
// Arc center/radius/sweep remain omitted; endpoints are not full geometry.
const track={...base,layer:layer(own(row,"layerId")),startX:num(own(row,"startX")),startY:num(own(row,"startY")),endX:num(own(row,"endX")),endY:num(own(row,"endY")),lineWidth:num(own(row,"width"))};
if(family==="Arc"){const interactiveMode=integer(own(row,"arcType"));if(![1,2].includes(interactiveMode))bad();result.push({...track,arcAngle:num(own(row,"arcAngle")),interactiveMode});}else result.push(track);
}return result;
};
const topics=[["Line","track"],["Arc","arc"],["Via","via"],["String","string"]];
const call=async(topic,arg)=>{check();const reply=await apply(rpc,channel,[topic,arg,0]);check();childPlain(reply);return own(reply,"message");};
const identity=async()=>{const value=await call("getTabIdAndDocType",undefined);check();exact(value,["tabId","docType"]);if(own(value,"tabId")!==target.tabId||own(value,"docType")!==3)bad();};
const bounded=value=>{const json=JSON.stringify(value);if(new TextEncoder().encode(json).byteLength>${CURRENT_PCB_209_PRIMITIVES_NATIVE_BYTES})bad();return json;};
const read=async()=>{await identity();check();const observations=[],seen=new Set();for(const [family,topic] of topics){const raw=await call("pcb/extensionAPI/"+topic+"-getAll",{});check();
observations.push({ok:true,kind:"current-pcb-geometry-observation",method:"eda.pcb_Primitive"+family+".getAll",target,rows:rows(raw,family,seen),samples:2,implementationKind:"native-task-equivalent",cadAuthority:false,persistenceVerified:false,sourceMembershipVerified:false});bounded(observations);}
await identity();check();return observations;};
const run=async()=>{const first=await read(),json=bounded(first),second=await read();check();if(bounded(second)!==json)bad();return bounded({ok:true,kind:"pcb209-original-primitives-observation",target,observations:first});};
check();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;reject(new Error("PCB209_PRIMITIVES_REFUSED"));},10000]);});return await Promise.race([run(),timeout]);
}catch{throw new Error("PCB209_PRIMITIVES_REFUSED");}finally{if(timer!==undefined&&typeof clear==="function"){try{Reflect.apply(clear,globalThis,[timer]);}catch{throw new Error("PCB209_PRIMITIVES_REFUSED");}}}
}`;

export function decodeCurrentPcb209PrimitivesReply(raw: unknown, targetInput: unknown): Readonly<Record<string, unknown>> {
  const target = currentDisposableOpenSealedTargetSchema.parse(targetInput);
  const reply = z.object({ result: z.object({ type: z.literal("string"), value: z.string() }).strict() }).strict().parse(raw);
  if (Buffer.byteLength(reply.result.value) > CURRENT_PCB_209_PRIMITIVES_NATIVE_BYTES) { throw new Error("PCB209_PRIMITIVES_BOUND"); }
  const native = packetSchema.parse(decodeCurrentPcbDiagnosticJson(Buffer.from(reply.result.value)));
  const expected = { projectUuid: target.projectUuid, branchUuid: target.branchUuid, documentUuid: target.documentUuid,
    tabId: `${target.documentUuid}@${target.projectUuid}` };
  if (canonicalJson(native.target) !== canonicalJson(expected)) { throw new Error("PCB209_PRIMITIVES_TARGET"); }
  const seen = new Set<string>();
  const families = native.observations.map((observation, index) => {
    const family = CURRENT_PCB_209_PRIMITIVE_FAMILIES[index];
    if (family === undefined || observation.method !== `eda.pcb_Primitive${family}.getAll`) { throw new Error("PCB209_PRIMITIVES_FAMILY"); }
    const validated = validateCurrentPcbGeometryResult({ method: observation.method, arguments: {}, target: expected }, observation);
    const primitiveIds = observation.rows.map(row => {
      if (seen.has(row.primitiveId)) { throw new Error("PCB209_PRIMITIVES_DUPLICATE"); }
      seen.add(row.primitiveId); return row.primitiveId;
    });
    return { family, method: observation.method, primitiveIds, rows: validated["value"], observedRowCount: observation.rows.length };
  });
  const result = { schema: "easyeda-pro-control.pcb209-primitives-observation.v1", target: expected, families,
    projectionSha256: sha256Json(native.observations), samples: 2, matchingSamples: true,
    units: { linear: "mil", arcAngle: "degrees", rotation: "degrees" }, implementationKind: "native-task-equivalent",
    originalReceiverRechecked: true, membershipScope: "existing-stateWatcher-views;String-excludes-parented-views",
    startupCompletionVerified: false, completeLiveBaselineVerified: false, sourceMembershipVerified: false,
    connectivityVerified: false, persistenceVerified: false, executionAuthorized: false, saveAuthorized: false,
    limitations: ["Only the complete ordered projected values of four instantiated-view families are compared twice. Models without stateWatcher, parented String views and all other PCB families are excluded. This is not complete canvas or stored membership.",
      "No filters, requested-ID lookup, selected objects, source export, geometry editing or Save. Native enumeration and serialization run before bounds and are not cancelled by them. Observations are sequential, not atomic.",
      "Raw display nets preserve empty string versus null; missing/undefined projected values refuse. Arc center/radius/sweep and Via unused-layer/is-suture state are omitted. Arc and Via retain native precision instead of public-wrapper rounding.",
      "String includes current text, font/style, display flags and serialized silkColor. Existing font-cache serialization is not glyph/render verification; null color can represent an empty native string. Parent, partition/group, zIndex and full raw model state are not projected."] };
  if (Buffer.byteLength(canonicalJson(result)) > CURRENT_PCB_209_PRIMITIVES_RESULT_BYTES) { throw new Error("PCB209_PRIMITIVES_RESULT_BOUND"); }
  return freezeDeep(result);
}
