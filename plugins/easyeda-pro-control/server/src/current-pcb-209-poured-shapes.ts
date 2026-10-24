/** Existing loaded Poured fills for the original 209 disposable PCB owner.
 * Preserve native serialized contours; this does not rebuild or qualify copper. */
import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { CURRENT_PCB_GEOMETRY_MAX_BYTES, CURRENT_PCB_GEOMETRY_MAX_NUMBER, CURRENT_PCB_GEOMETRY_MAX_ROWS } from "./current-pcb-geometry.ts";
import { buildCurrentProjectUrlGuard } from "./current-project-url.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_209_POURED_SHAPES_NATIVE_BYTES = CURRENT_PCB_GEOMETRY_MAX_BYTES;
export const CURRENT_PCB_209_POURED_SHAPES_RESULT_BYTES = CURRENT_PCB_GEOMETRY_MAX_BYTES;
export const CURRENT_PCB_209_POURED_PATH_MAX_TOKENS = 8192;
export const CURRENT_PCB_209_POURED_MAX_CONTOURS = 256;
export const CURRENT_PCB_209_POURED_TOTAL_TOKENS = 32_768;
export type CurrentPcb209PouredPathToken = number | "L" | "ARC" | "C" | "CIRCLE";

/** Pinned df output grammar. C retains variable-degree control points, not
 * a forced cubic. No SDK polygon decoder, tessellation or closure repair. */
export function validCurrentPcb209PouredPath(path: readonly CurrentPcb209PouredPathToken[]): boolean {
  if (path[0] === "CIRCLE") { return path.length === 4 && path.slice(1).every(value => typeof value === "number") && typeof path[3] === "number" && path[3] >= 0; }
  if (typeof path[0] !== "number" || typeof path[1] !== "number") { return false; }
  let offset = 2;
  while (offset < path.length) {
    const command = path[offset];
    if (command !== "L" && command !== "ARC" && command !== "C") { return false; }
    offset += 1;
    const start = offset;
    while (typeof path[offset] === "number") { offset += 1; }
    const count = offset - start;
    if (command === "ARC" ? count !== 3 : count < 2 || count % 2 !== 0) { return false; }
  }
  return offset > 2;
}

const numberSchema = z.number().min(-CURRENT_PCB_GEOMETRY_MAX_NUMBER).max(CURRENT_PCB_GEOMETRY_MAX_NUMBER)
  .refine(value => !Object.is(value, -0), "Signed zero is not supported by this JSON observation.");
const dimensionSchema = numberSchema.refine(value => value >= 0, "Native dimension is negative.");
const idSchema = z.string().min(1).max(256).refine(value => value.length <= 256 && value.isWellFormed());
const textSchema = z.string().max(1024).refine(value => value.length <= 1024 && value.isWellFormed());
const targetSchema = z.object({ projectUuid: z.string(), branchUuid: z.string(), documentUuid: z.string(), tabId: z.string() }).strict();
const pathSchema = z.array(z.union([numberSchema, z.enum(["L", "ARC", "C", "CIRCLE"])]))
  .max(CURRENT_PCB_209_POURED_PATH_MAX_TOKENS).refine(validCurrentPcb209PouredPath, "Unsupported native Poured path.");
export const currentPcb209PouredRowSchema = z.object({ primitiveType: z.literal("Poured"), primitiveId: idSchema, pourPrimitiveId: idSchema,
  partition: textSchema, layerId: z.number().int().min(0).max(65_535).refine(value => !Object.is(value, -0)), net: textSchema.nullable(),
  style: z.enum(["solid", "90grid", "45grid", "none"]), gridLineWidth: dimensionSchema, clearance: dimensionSchema,
  optimization: z.boolean().nullable(), optimizationState: z.enum(["present", "undefined", "absent", "null"]),
  optimizationWidth: dimensionSchema, copperPath: z.array(pathSchema).max(CURRENT_PCB_209_POURED_MAX_CONTOURS) }).strict()
  .refine(row => row.optimizationState === "present" ? typeof row.optimization === "boolean" : row.optimization === null,
    "Optimization value and state disagree.");
const parentGroupSchema = z.object({ pourPrimitiveId: idSchema, primitiveIds: z.array(idSchema).min(1).max(CURRENT_PCB_GEOMETRY_MAX_ROWS) }).strict();
export const currentPcb209PouredShapesPacketSchema = z.object({ ok: z.literal(true), kind: z.literal("pcb209-original-poured-shapes-observation"),
  target: targetSchema, observation: z.object({ ok: z.literal(true), kind: z.literal("current-pcb-poured-source-observation"),
    method: z.literal("eda.pcb_PrimitivePoured.getAll"), target: targetSchema,
    rows: z.array(currentPcb209PouredRowSchema).max(CURRENT_PCB_GEOMETRY_MAX_ROWS), samples: z.literal(2),
    implementationKind: z.literal("native-task-equivalent"), cadAuthority: z.literal(false), persistenceVerified: z.literal(false),
    sourceMembershipVerified: z.literal(false), copperRebuildPerformed: z.literal(false) }).strict(),
  parentGroups: z.array(parentGroupSchema).max(CURRENT_PCB_GEOMETRY_MAX_ROWS) }).strict();

/** The lifecycle must qualify the original UI/PCB assets and retain the owner. */
export const CURRENT_PCB_209_POURED_SHAPES_FUNCTION = `async function(sealed,phase){
"use strict";
let timer,clear,expired=false;
try{
const root=globalThis,apply=Reflect.apply,bad=()=>{throw new Error("PCB209_POURED_SHAPES_REFUSED");};
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
const length=(v,max)=>{if(!Array.isArray(v)||![Array.prototype,childArrayPrototype].includes(Object.getPrototypeOf(v)))bad();const n=own(v,"length");if(n<0||n>max||Reflect.ownKeys(v).length!==n+1)bad();return n;};
const path=value=>{
const n=length(value,${CURRENT_PCB_209_POURED_PATH_MAX_TOKENS}),out=[];
for(let i=0;i<n;i++){const token=own(value,String(i));if(typeof token==="number")out.push(num(token));else if(["L","ARC","C","CIRCLE"].includes(token))out.push(token);else bad();}
if(out[0]==="CIRCLE"){if(n!==4||!out.slice(1).every(v=>typeof v==="number")||out[3]<0)bad();return out;}
if(typeof out[0]!=="number"||typeof out[1]!=="number")bad();let offset=2;
while(offset<n){const command=out[offset];if(!["L","ARC","C"].includes(command))bad();offset++;const start=offset;while(typeof out[offset]==="number")offset++;const count=offset-start;
if(command==="ARC"?count!==3:count<2||count%2!==0)bad();}if(offset===2)bad();return out;
};
const rows=value=>{
const n=length(value,${CURRENT_PCB_GEOMETRY_MAX_ROWS}),out=[],ids=new Set(),groups=new Map();let tokens=0;
for(let i=0;i<n;i++){
const row=own(value,String(i));childPlain(row);const keys=Reflect.ownKeys(row),required=["globalIndex","partition","layerId","net","style","gridLineWidth","clearance","copperPath","optimizationWidth","pourPrimitiveId"];
if(keys.some(k=>!required.includes(k)&&k!=="optimization")||required.some(k=>!keys.includes(k)))bad();
const id=text(own(row,"globalIndex"),256),parentId=text(own(row,"pourPrimitiveId"),256);if(!id||!parentId||ids.has(id))bad();ids.add(id);
const style=own(row,"style");if(!["solid","90grid","45grid","none"].includes(style))bad();
const widths=["gridLineWidth","clearance","optimizationWidth"].map(k=>{const v=num(own(row,k));if(v<0)bad();return v;});
let optimization=null,optimizationState="absent";const opt=Object.getOwnPropertyDescriptor(row,"optimization");
if(opt){if(!Object.hasOwn(opt,"value"))bad();if(opt.value===undefined)optimizationState="undefined";else if(opt.value===null)optimizationState="null";else{optimization=bool(opt.value);optimizationState="present";}}
const contours=own(row,"copperPath"),count=length(contours,${CURRENT_PCB_209_POURED_MAX_CONTOURS}),copperPath=[];
for(let j=0;j<count;j++){const contour=path(own(contours,String(j)));tokens+=contour.length;if(tokens>${CURRENT_PCB_209_POURED_TOTAL_TOKENS})bad();copperPath.push(contour);}
out.push({primitiveType:"Poured",primitiveId:id,pourPrimitiveId:parentId,partition:text(own(row,"partition"),1024),layerId:layer(own(row,"layerId")),
net:text(own(row,"net"),1024,true),style,gridLineWidth:widths[0],clearance:widths[1],optimization,optimizationState,optimizationWidth:widths[2],copperPath});
let group=groups.get(parentId);if(group===undefined){group={pourPrimitiveId:parentId,primitiveIds:[]};groups.set(parentId,group);}group.primitiveIds.push(id);
}return{rows:out,parentGroups:Array.from(groups.values())};
};
const bounded=value=>{const json=JSON.stringify(value);if(typeof json!=="string"||json.length>${CURRENT_PCB_209_POURED_SHAPES_NATIVE_BYTES}||new TextEncoder().encode(json).byteLength>${CURRENT_PCB_209_POURED_SHAPES_NATIVE_BYTES})bad();return json;};
const call=async(topic,arg)=>{check();const reply=await apply(rpc,channel,[topic,arg,0]);check();childPlain(reply);return own(reply,"message");};
const identity=async()=>{const row=await call("getTabIdAndDocType",undefined);exact(row,["tabId","docType"]);if(own(row,"tabId")!==target.tabId||own(row,"docType")!==3)bad();};
const read=async()=>{
await identity();check();const raw=await call("pcb/extensionAPI/poured-getAll",{});check();const projected=rows(raw);
const observation={ok:true,kind:"current-pcb-poured-source-observation",method:"eda.pcb_PrimitivePoured.getAll",target,rows:projected.rows,
samples:2,implementationKind:"native-task-equivalent",cadAuthority:false,persistenceVerified:false,sourceMembershipVerified:false,copperRebuildPerformed:false};
const result={observation,parentGroups:projected.parentGroups};bounded(result);await identity();check();return result;
};
const run=async()=>{const first=await read(),json=bounded(first),second=await read();check();if(bounded(second)!==json)bad();
return bounded({ok:true,kind:"pcb209-original-poured-shapes-observation",target,...first});};
check();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;reject(new Error("PCB209_POURED_SHAPES_REFUSED"));},10000]);});return await Promise.race([run(),timeout]);
}catch{throw new Error("PCB209_POURED_SHAPES_REFUSED");}finally{if(timer!==undefined&&typeof clear==="function"){try{Reflect.apply(clear,globalThis,[timer]);}catch{throw new Error("PCB209_POURED_SHAPES_REFUSED");}}}
}`;

export function decodeCurrentPcb209PouredShapesReply(raw: unknown, targetInput: unknown): Readonly<Record<string, unknown>> {
  const target = currentDisposableOpenSealedTargetSchema.parse(targetInput);
  const reply = z.object({ result: z.object({ type: z.literal("string"), value: z.string() }).strict() }).strict().parse(raw);
  if (Buffer.byteLength(reply.result.value) > CURRENT_PCB_209_POURED_SHAPES_NATIVE_BYTES) { throw new Error("PCB209_POURED_SHAPES_BOUND"); }
  const native = currentPcb209PouredShapesPacketSchema.parse(decodeCurrentPcbDiagnosticJson(Buffer.from(reply.result.value)));
  const expected = { projectUuid: target.projectUuid, branchUuid: target.branchUuid, documentUuid: target.documentUuid,
    tabId: `${target.documentUuid}@${target.projectUuid}` };
  if (canonicalJson(native.target) !== canonicalJson(expected) || canonicalJson(native.observation.target) !== canonicalJson(expected)) {
    throw new Error("PCB209_POURED_SHAPES_TARGET");
  }
  const groups = new Map<string, { pourPrimitiveId: string; primitiveIds: string[] }>(), ids = new Set<string>();
  let tokens = 0;
  for (const row of native.observation.rows) {
    if (ids.has(row.primitiveId)) { throw new Error("PCB209_POURED_SHAPES_DUPLICATE"); }
    ids.add(row.primitiveId);
    for (const path of row.copperPath) { tokens += path.length; }
    let group = groups.get(row.pourPrimitiveId);
    if (group === undefined) { group = { pourPrimitiveId: row.pourPrimitiveId, primitiveIds: [] }; groups.set(row.pourPrimitiveId, group); }
    group.primitiveIds.push(row.primitiveId);
  }
  if (tokens > CURRENT_PCB_209_POURED_TOTAL_TOKENS) { throw new Error("PCB209_POURED_SHAPES_TOKENS"); }
  if (canonicalJson([...groups.values()]) !== canonicalJson(native.parentGroups)) { throw new Error("PCB209_POURED_SHAPES_ASSOCIATION"); }
  const primitiveIds = [...ids];
  const result = { schema: "easyeda-pro-control.pcb209-poured-shapes-observation.v1", target: expected,
    families: [{ family: "Poured", method: "eda.pcb_PrimitivePoured.getAll", primitiveIds, rows: native.observation.rows, observedRowCount: primitiveIds.length }],
    parentGroups: native.parentGroups, parentGroupScope: "observed-native-fill-parent-identifiers", primitiveIdScope: "native-fill-globalIndex-not-public-parent-id",
    projectionSha256: sha256Json({ observation: native.observation, parentGroups: native.parentGroups }),
    samples: 2, matchingSamples: true, units: { linear: "native-distance-10mil-per-unit", pathCoordinates: "native-distance-10mil-per-unit", pathSweep: "degrees" },
    implementationKind: "native-task-equivalent", originalReceiverRechecked: true, membershipScope: "existing-stateWatcher-Poured-views",
    startupCompletionVerified: false, completeLiveBaselineVerified: false, sourceMembershipVerified: false, reciprocalParentVerified: false,
    copperRebuildPerformed: false, copperFreshnessVerified: false, connectivityVerified: false, fabricationGeometryVerified: false,
    persistenceVerified: false, executionAuthorized: false, saveAuthorized: false,
    limitations: [
      "Two complete ordered native fill projections must match. Models without existing stateWatcher views are absent. Native fill IDs differ from the public API's parent-group primitive IDs; the ordered parent groups are observed associations only, not reciprocal ownership or saved membership.",
      "All serialized contours are retained in native units of ten mil per unit. ARC sweep tokens are degrees; C retains variable-degree control points. Coordinates and width/clearance values are not converted to mil. Path tokens are never passed to a polygon constructor or rebuilt into copper.",
      "The pinned df serializer omits tiny or unsupported segments and may split a counterclockwise full circle. CIRCLE retains only rx and ARC retains endpoints/sweep, so arbitrary elliptical geometry cannot be reconstructed. Contour order does not prove hole topology, winding, closure or a complete physical boundary.",
      "Style preserves solid, 90grid, 45grid and none without the public wrapper's fill/line-width projection. Optimization distinguishes present boolean, null, undefined and absent fields; missing values are not coerced to false. Partition is the native inherited string projection.",
      "No copper rebuild, freshness, connectivity, rendered or fabrication geometry, edit, explicit Save or writer baseline is proved. Reads are sequential, not atomic. Native enumeration/serialization precedes bounds and is not cancelled by the ten-second deadline. Local RPC bookkeeping and possible identity-environment initialization remain incidental."
    ] };
  if (Buffer.byteLength(canonicalJson(result)) > CURRENT_PCB_209_POURED_SHAPES_RESULT_BYTES) { throw new Error("PCB209_POURED_SHAPES_RESULT_BOUND"); }
  return freezeDeep(result);
}
