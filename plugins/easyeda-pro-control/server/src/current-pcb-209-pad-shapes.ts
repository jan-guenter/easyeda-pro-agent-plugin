/** Native Pad style groups for the original 209 disposable PCB owner.
 * Existing Pad projections and historical v1 decoders remain unchanged. */
import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { CURRENT_PCB_GEOMETRY_MAX_BYTES, CURRENT_PCB_GEOMETRY_MAX_NUMBER, CURRENT_PCB_GEOMETRY_MAX_ROWS,
  currentPcbGeometryResultSchema, validateCurrentPcbGeometryResult } from "./current-pcb-geometry.ts";
import { CURRENT_PCB_PAD_POLYGON_PROGRAM } from "./current-pcb-pad-polygon.ts";
import { buildCurrentProjectUrlGuard } from "./current-project-url.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_209_PAD_SHAPES_NATIVE_BYTES = CURRENT_PCB_GEOMETRY_MAX_BYTES;
export const CURRENT_PCB_209_PAD_SHAPES_RESULT_BYTES = CURRENT_PCB_GEOMETRY_MAX_BYTES;
const targetSchema = z.object({ projectUuid: z.string(), branchUuid: z.string(), documentUuid: z.string(), tabId: z.string() }).strict();
const dimensionSchema = z.number().min(0).max(CURRENT_PCB_GEOMETRY_MAX_NUMBER)
  .refine(value => !Object.is(value, -0), "Signed zero is not supported by this JSON observation.");
const shapeSchema = z.discriminatedUnion("shape", [
  z.object({ shape: z.literal("ELLIPSE"), width: dimensionSchema, height: dimensionSchema }).strict(),
  z.object({ shape: z.literal("OVAL"), width: dimensionSchema, height: dimensionSchema }).strict(),
  z.object({ shape: z.literal("RECT"), width: dimensionSchema, height: dimensionSchema,
    cornerRatioPercent: dimensionSchema.refine(value => value <= 100, "Corner ratio exceeds 100 percent.") }).strict(),
]);
const groupSchema = z.object({ nativeStartLayer: z.union([z.literal(1), z.literal(2)]),
  nativeEndLayer: z.union([z.literal(1), z.literal(2)]), shape: shapeSchema }).strict();
const groupsSchema = z.array(groupSchema).max(3).refine(groups => groups.length === 0 || groups.length === 3 &&
  groups[0]?.nativeStartLayer === 1 && groups[0].nativeEndLayer === 1 &&
  groups[1]?.nativeStartLayer === 1 && groups[1].nativeEndLayer === 2 &&
  groups[2]?.nativeStartLayer === 2 && groups[2].nativeEndLayer === 2,
"Native special shapes must be absent or ordered top, inner and bottom style groups.");
const specialShapeGroupsSchema = z.array(z.object({ primitiveId: z.string().min(1).max(256).refine(value => value.length <= 256 && value.isWellFormed()),
  groups: groupsSchema }).strict()).max(CURRENT_PCB_GEOMETRY_MAX_ROWS);
const packetSchema = z.object({ ok: z.literal(true), kind: z.literal("pcb209-original-pad-shapes-observation"), target: targetSchema,
  observation: currentPcbGeometryResultSchema, specialShapeGroups: specialShapeGroupsSchema }).strict();

/** The lifecycle must separately qualify the original UI/PCB assets and owner. */
export const CURRENT_PCB_209_PAD_SHAPES_FUNCTION = `async function(sealed,phase){
"use strict";
let timer,clear,expired=false;
try{
const root=globalThis,apply=Reflect.apply,bad=()=>{throw new Error("PCB209_PAD_SHAPES_REFUSED");};
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
const hole=row=>{
const tuple=own(row,"holeAspect");if(tuple===null)return null;
const n=length(tuple),shape=own(tuple,"0");if((shape==="ROUND"&&n!==2)||(shape==="SLOT"&&n!==3)||!["ROUND","SLOT"].includes(shape))bad();
const diameter=num(own(tuple,"1")),offset=point(own(row,"holeOffset"));if(diameter<0)bad();
const result={shape,diameter,offsetX:offset.x,offsetY:offset.y,rotation:num(own(row,"holeRotation"))};
if(shape==="SLOT"){const value=num(own(tuple,"2"));if(value<0)bad();result.length=value;}return result;
};
${CURRENT_PCB_PAD_POLYGON_PROGRAM}
// PCB a8405930@10301575 selects the default native pad style. The shared
// polygon fragment is pure grammar validation, not legacy runtime admission.
const defaultCopperShape=row=>{
const tuple=own(row,"defaultPadShapeAspect"),n=length(tuple),shape=own(tuple,"0");
if(shape==="POLYGON"){if(n!==2)bad();return{shape,pathSource:padPolygonPath(own(tuple,"1")),coordinateSpace:"native-pad-style"};}
if((shape==="RECT"&&n!==4)||((shape==="ELLIPSE"||shape==="OVAL")&&n!==3)||!["RECT","ELLIPSE","OVAL"].includes(shape))bad();
const result={shape,width:num(own(tuple,"1")),height:num(own(tuple,"2"))};if(shape==="RECT")result.cornerRatioPercent=num(own(tuple,"3"));return result;
};
const maskExpansion=row=>{
const mode=integer(own(row,"expansionType"));if(mode!==1&&mode!==2)bad();
return{mode,topSolder:num(own(row,"topSolderExpansion")),bottomSolder:num(own(row,"bottomSolderExpansion")),paste:num(own(row,"pasteExpansion"))};
};
const thermal=row=>{
const rule=own(row,"padRule");if(rule===null)return null;if(!object(rule))bad();
const mode=integer(own(rule,"connectMode"));if(mode===1||mode===2)return{mode};if(mode!==0)bad();
return{mode,clearance:num(num(own(rule,"lineClearance"))*10),spokeWidth:num(num(own(rule,"lineWidth"))*10),angle:num(num(own(rule,"lineAngle"))/Math.PI*180)};
};
// PCB a8405930@10302253 returns either [] or these three native style groups.
// The selectors are retained verbatim; they are not expanded physical layers.
const specialGroups=row=>{
const raw=own(row,"specialPadShapeAspect"),n=length(raw);if(n!==0&&n!==3)bad();const result=[],selectors=[[1,1],[1,2],[2,2]];
for(let i=0;i<n;i++){
const tuple=own(raw,String(i));if(length(tuple)!==3)bad();
const nativeStartLayer=integer(own(tuple,"0")),nativeEndLayer=integer(own(tuple,"1"));
if(nativeStartLayer!==selectors[i][0]||nativeEndLayer!==selectors[i][1])bad();
const value=own(tuple,"2"),count=length(value),shape=own(value,"0");
if((shape==="RECT"&&count!==4)||((shape==="ELLIPSE"||shape==="OVAL")&&count!==3)||!["RECT","ELLIPSE","OVAL"].includes(shape))bad();
const width=num(own(value,"1")),height=num(own(value,"2"));if(width<0||height<0)bad();const projected={shape,width,height};
if(shape==="RECT"){const ratio=num(own(value,"3"));if(ratio<0||ratio>100)bad();projected.cornerRatioPercent=ratio;}
result.push({nativeStartLayer,nativeEndLayer,shape:projected});
}return result;
};
const rows=raw=>{
const n=length(raw),result=[],specialShapeGroups=[],seen=new Set();
for(let i=0;i<n;i++){
const row=childPlain(own(raw,String(i))),id=text(own(row,"globalIndex"),256);if(id.length===0||seen.has(id))bad();seen.add(id);
const p=point(own(row,"center")),l=layer(own(row,"layerId")),padType=integer(own(row,"padTypeAspect"));if(![1,2,12].includes(l)||![0,1,2].includes(padType))bad();
result.push({primitiveId:id,primitiveType:"Pad",primitiveLock:bool(own(row,"locked")),net:text(own(row,"net"),1024,true),layer:l,
padNumber:text(own(row,"num"),1024),x:p.x,y:p.y,rotation:num(own(row,"rotation")),metallization:bool(own(row,"plated")),
padType,hole:hole(row),defaultCopperShape:defaultCopperShape(row),maskExpansion:maskExpansion(row),thermal:thermal(row)});
specialShapeGroups.push({primitiveId:id,groups:specialGroups(row)});
}return{rows:result,specialShapeGroups};
};
const call=async(topic,arg)=>{check();const reply=await apply(rpc,channel,[topic,arg,0]);check();childPlain(reply);return own(reply,"message");};
const identity=async()=>{const value=await call("getTabIdAndDocType",undefined);check();exact(value,["tabId","docType"]);if(own(value,"tabId")!==target.tabId||own(value,"docType")!==3)bad();};
const bounded=value=>{const json=JSON.stringify(value);if(new TextEncoder().encode(json).byteLength>${CURRENT_PCB_209_PAD_SHAPES_NATIVE_BYTES})bad();return json;};
const read=async()=>{
await identity();check();const raw=await call("pcb/extensionAPI/pad-getAll",{});check();const projected=rows(raw);
const observation={ok:true,kind:"current-pcb-geometry-observation",method:"eda.pcb_PrimitivePad.getAll",target,rows:projected.rows,
samples:2,implementationKind:"native-task-equivalent",cadAuthority:false,persistenceVerified:false,sourceMembershipVerified:false};
const result={observation,specialShapeGroups:projected.specialShapeGroups};bounded(result);await identity();check();return result;
};
const run=async()=>{const first=await read(),json=bounded(first),second=await read();check();if(bounded(second)!==json)bad();
return bounded({ok:true,kind:"pcb209-original-pad-shapes-observation",target,...first});};
check();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;reject(new Error("PCB209_PAD_SHAPES_REFUSED"));},10000]);});return await Promise.race([run(),timeout]);
}catch{throw new Error("PCB209_PAD_SHAPES_REFUSED");}finally{if(timer!==undefined&&typeof clear==="function"){try{Reflect.apply(clear,globalThis,[timer]);}catch{throw new Error("PCB209_PAD_SHAPES_REFUSED");}}}
}`;

export function decodeCurrentPcb209PadShapesReply(raw: unknown, targetInput: unknown): Readonly<Record<string, unknown>> {
  const target = currentDisposableOpenSealedTargetSchema.parse(targetInput);
  const reply = z.object({ result: z.object({ type: z.literal("string"), value: z.string() }).strict() }).strict().parse(raw);
  if (Buffer.byteLength(reply.result.value) > CURRENT_PCB_209_PAD_SHAPES_NATIVE_BYTES) { throw new Error("PCB209_PAD_SHAPES_BOUND"); }
  const native = packetSchema.parse(decodeCurrentPcbDiagnosticJson(Buffer.from(reply.result.value)));
  const expected = { projectUuid: target.projectUuid, branchUuid: target.branchUuid, documentUuid: target.documentUuid,
    tabId: `${target.documentUuid}@${target.projectUuid}` };
  if (canonicalJson(native.target) !== canonicalJson(expected)) { throw new Error("PCB209_PAD_SHAPES_TARGET"); }
  if (native.observation.method !== "eda.pcb_PrimitivePad.getAll") { throw new Error("PCB209_PAD_SHAPES_FAMILY"); }
  const validated = validateCurrentPcbGeometryResult({ method: "eda.pcb_PrimitivePad.getAll", arguments: {}, target: expected }, native.observation);
  for (const row of native.observation.rows) {
    if (row.primitiveType !== "Pad" || !row.primitiveId.isWellFormed() || !row.padNumber.isWellFormed() ||
      row.net !== null && !row.net.isWellFormed()) { throw new Error("PCB209_PAD_SHAPES_TEXT"); }
  }
  const primitiveIds = native.observation.rows.map(row => row.primitiveId);
  if (canonicalJson(primitiveIds) !== canonicalJson(native.specialShapeGroups.map(row => row.primitiveId))) { throw new Error("PCB209_PAD_SHAPES_ASSOCIATION"); }
  const result = { schema: "easyeda-pro-control.pcb209-pad-shapes-observation.v1", target: expected,
    families: [{ family: "Pad", method: "eda.pcb_PrimitivePad.getAll", primitiveIds, rows: validated["value"], observedRowCount: primitiveIds.length }],
    specialShapeGroups: native.specialShapeGroups,
    specialShapeScope: "native-top-inner-bottom-style-groups", physicalLayerExpansionVerified: false,
    projectionSha256: sha256Json({ observation: native.observation, specialShapeGroups: native.specialShapeGroups }),
    samples: 2, matchingSamples: true, units: { linear: "mil", rotation: "degrees", thermalAngle: "degrees", cornerRatio: "percent" },
    implementationKind: "native-task-equivalent", originalReceiverRechecked: true, membershipScope: "existing-stateWatcher-Pad-views",
    startupCompletionVerified: false, completeLiveBaselineVerified: false, sourceMembershipVerified: false, reciprocalParentVerified: false,
    connectivityVerified: false, persistenceVerified: false, executionAuthorized: false, saveAuthorized: false,
    limitations: [
      "Two complete ordered Pad projections must match, including every special style group. Models without stateWatcher are excluded. This is not complete board or source membership, reciprocal component ownership or SDK instances.",
      "Special groups retain the native ordered selectors [1,1], [1,2] and [2,2] for top, inner and bottom styles. They are not expanded physical copper layers or proof of unused inner-layer configuration. Empty groups mean only that the native serializer emitted none; uniform or absent physical-layer configuration is not proved.",
      "Special ELLIPSE/OVAL/RECT dimensions are already rounded to 0.1 mil by the native serializer. RECT cornerRatioPercent is a percentage. NGON and POLYGON special groups refuse because their native geometry is incomplete or unproved. Default POLYGON paths remain native-pad-style coordinates and are not transformed outlines.",
      "Default Pad placement, net/number, hole, shape, mask and thermal fields retain the existing projection contract. NGON default shapes and inner-only Pad layers remain unsupported. Native default and polygon serialization can round or omit small segments before observation.",
      "No physical stackup, geometry rendering, source export, edit, Save or writer baseline is proved. Reads are sequential, not atomic. Native enumeration precedes bounds and its work is not cancelled by the ten-second deadline. Local RPC bookkeeping and possible identity-environment initialization remain incidental."
    ] };
  if (Buffer.byteLength(canonicalJson(result)) > CURRENT_PCB_209_PAD_SHAPES_RESULT_BYTES) { throw new Error("PCB209_PAD_SHAPES_RESULT_BOUND"); }
  return freezeDeep(result);
}
