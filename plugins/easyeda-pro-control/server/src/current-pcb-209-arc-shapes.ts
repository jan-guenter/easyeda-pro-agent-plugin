/** Native Arc centers, radii and directed endpoint angles for the original 209 owner.
 * Existing Arc projections and historical v1 decoders remain unchanged. */
import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { CURRENT_PCB_GEOMETRY_MAX_BYTES, CURRENT_PCB_GEOMETRY_MAX_NUMBER, CURRENT_PCB_GEOMETRY_MAX_ROWS,
  currentPcbGeometryResultSchema, validateCurrentPcbGeometryResult } from "./current-pcb-geometry.ts";
import { buildCurrentProjectUrlGuard } from "./current-project-url.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_209_ARC_SHAPES_NATIVE_BYTES = CURRENT_PCB_GEOMETRY_MAX_BYTES;
export const CURRENT_PCB_209_ARC_SHAPES_RESULT_BYTES = CURRENT_PCB_GEOMETRY_MAX_BYTES;
const targetSchema = z.object({ projectUuid: z.string(), branchUuid: z.string(), documentUuid: z.string(), tabId: z.string() }).strict();
const numberSchema = z.number().min(-CURRENT_PCB_GEOMETRY_MAX_NUMBER).max(CURRENT_PCB_GEOMETRY_MAX_NUMBER)
  .refine(value => !Object.is(value, -0), "Signed zero is not supported by this JSON observation.");
const angleSchema = numberSchema.refine(value => value >= 0 && value <= Math.PI * 2, "Expected native normalized radians.");
const radiusSchema = numberSchema.refine(value => value >= 0);
const sweepSchema = z.union([z.literal(0), z.literal(1)]);
const arcShapesSchema = z.array(z.object({ primitiveId: z.string().min(1).max(256).refine(value => value.length <= 256 && value.isWellFormed()),
  centerX: numberSchema, centerY: numberSchema, radius: radiusSchema,
  startAngleRadians: angleSchema, endAngleRadians: angleSchema, sweep: sweepSchema }).strict()).max(CURRENT_PCB_GEOMETRY_MAX_ROWS);
const packetSchema = z.object({ ok: z.literal(true), kind: z.literal("pcb209-original-arc-shapes-observation"), target: targetSchema,
  observation: currentPcbGeometryResultSchema, arcShapes: arcShapesSchema }).strict();

/** The lifecycle must separately qualify the original UI/PCB assets and owner. */
export const CURRENT_PCB_209_ARC_SHAPES_FUNCTION = `async function(sealed,phase){
"use strict";
let timer,clear,expired=false;
try{
const root=globalThis,apply=Reflect.apply,bad=()=>{throw new Error("PCB209_ARC_SHAPES_REFUSED");};
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
// PCB a8405930 arc-getAll keeps center/radius in native 10mil units, while
// endpoints and width are already mil. Native endpoint angles are radians.
const rows=raw=>{
const n=length(raw),result=[],arcShapes=[],seen=new Set();
for(let i=0;i<n;i++){
const row=childPlain(own(raw,String(i))),id=text(own(row,"globalIndex"),256);if(id.length===0||seen.has(id))bad();seen.add(id);
const p=point(own(row,"center")),radius=num(own(row,"radius")),startAngleRadians=num(own(row,"startAngle")),endAngleRadians=num(own(row,"endAngle")),sweep=integer(own(row,"sweep"));
if(radius<0||startAngleRadians<0||startAngleRadians>Math.PI*2||endAngleRadians<0||endAngleRadians>Math.PI*2||![0,1].includes(sweep))bad();
const interactiveMode=integer(own(row,"arcType"));if(![1,2].includes(interactiveMode))bad();
const projected={primitiveId:id,primitiveType:"Arc",primitiveLock:bool(own(row,"locked")),net:text(own(row,"net"),1024,true),layer:layer(own(row,"layerId")),
startX:num(own(row,"startX")),startY:num(own(row,"startY")),endX:num(own(row,"endX")),endY:num(own(row,"endY")),lineWidth:num(own(row,"width")),arcAngle:num(own(row,"arcAngle")),interactiveMode};
// Match the captured callback's arithmetic before the unit conversion changes
// evaluation order. The public angle is modulo a revolution, not a circle flag.
const turn=Math.PI*2,angle=sweep===1?(endAngleRadians+turn-startAngleRadians)%turn:-(startAngleRadians+turn-endAngleRadians)%turn;
if(projected.startX!==(p.x+Math.cos(startAngleRadians)*radius)*10||projected.startY!==(p.y+Math.sin(startAngleRadians)*radius)*10||
projected.endX!==(p.x+Math.cos(endAngleRadians)*radius)*10||projected.endY!==(p.y+Math.sin(endAngleRadians)*radius)*10||projected.arcAngle!==angle*180/Math.PI)bad();
result.push(projected);arcShapes.push({primitiveId:id,centerX:num(p.x*10),centerY:num(p.y*10),radius:num(radius*10),startAngleRadians,endAngleRadians,sweep});
}return{rows:result,arcShapes};
};
const call=async(topic,arg)=>{check();const reply=await apply(rpc,channel,[topic,arg,0]);check();childPlain(reply);return own(reply,"message");};
const identity=async()=>{const value=await call("getTabIdAndDocType",undefined);check();exact(value,["tabId","docType"]);if(own(value,"tabId")!==target.tabId||own(value,"docType")!==3)bad();};
const bounded=value=>{const json=JSON.stringify(value);if(new TextEncoder().encode(json).byteLength>${CURRENT_PCB_209_ARC_SHAPES_NATIVE_BYTES})bad();return json;};
const read=async()=>{
await identity();check();const raw=await call("pcb/extensionAPI/arc-getAll",{});check();const projected=rows(raw);
const observation={ok:true,kind:"current-pcb-geometry-observation",method:"eda.pcb_PrimitiveArc.getAll",target,rows:projected.rows,
samples:2,implementationKind:"native-task-equivalent",cadAuthority:false,persistenceVerified:false,sourceMembershipVerified:false};
const result={observation,arcShapes:projected.arcShapes};bounded(result);await identity();check();return result;
};
const run=async()=>{const first=await read(),json=bounded(first),second=await read();check();if(bounded(second)!==json)bad();
return bounded({ok:true,kind:"pcb209-original-arc-shapes-observation",target,...first});};
check();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;reject(new Error("PCB209_ARC_SHAPES_REFUSED"));},10000]);});return await Promise.race([run(),timeout]);
}catch{throw new Error("PCB209_ARC_SHAPES_REFUSED");}finally{if(timer!==undefined&&typeof clear==="function"){try{Reflect.apply(clear,globalThis,[timer]);}catch{throw new Error("PCB209_ARC_SHAPES_REFUSED");}}}
}`;

export function decodeCurrentPcb209ArcShapesReply(raw: unknown, targetInput: unknown): Readonly<Record<string, unknown>> {
  const target = currentDisposableOpenSealedTargetSchema.parse(targetInput);
  const reply = z.object({ result: z.object({ type: z.literal("string"), value: z.string() }).strict() }).strict().parse(raw);
  if (Buffer.byteLength(reply.result.value) > CURRENT_PCB_209_ARC_SHAPES_NATIVE_BYTES) { throw new Error("PCB209_ARC_SHAPES_BOUND"); }
  const native = packetSchema.parse(decodeCurrentPcbDiagnosticJson(Buffer.from(reply.result.value)));
  const expected = { projectUuid: target.projectUuid, branchUuid: target.branchUuid, documentUuid: target.documentUuid,
    tabId: `${target.documentUuid}@${target.projectUuid}` };
  if (canonicalJson(native.target) !== canonicalJson(expected)) { throw new Error("PCB209_ARC_SHAPES_TARGET"); }
  if (native.observation.method !== "eda.pcb_PrimitiveArc.getAll") { throw new Error("PCB209_ARC_SHAPES_FAMILY"); }
  const validated = validateCurrentPcbGeometryResult({ method: "eda.pcb_PrimitiveArc.getAll", arguments: {}, target: expected }, native.observation);
  const primitiveIds = native.observation.rows.map(row => row.primitiveId);
  if (canonicalJson(primitiveIds) !== canonicalJson(native.arcShapes.map(row => row.primitiveId))) { throw new Error("PCB209_ARC_SHAPES_ASSOCIATION"); }
  for (const [index, row] of native.observation.rows.entries()) {
    const shape = native.arcShapes[index];
    if (row.primitiveType !== "Arc" || !row.primitiveId.isWellFormed() || row.net !== null && !row.net.isWellFormed() || shape === undefined) {
      throw new Error("PCB209_ARC_SHAPES_TEXT");
    }
    const turn = Math.PI * 2;
    const angle = shape.sweep === 1 ? (shape.endAngleRadians + turn - shape.startAngleRadians) % turn :
      -(shape.startAngleRadians + turn - shape.endAngleRadians) % turn;
    // Scaling the captured native center/radius changes floating arithmetic order.
    // This bound covers that projection error only.
    // It is not a geometric clearance or an authorisation to change a design.
    const tolerance = Number.EPSILON * 16 * Math.max(1, Math.abs(shape.centerX), Math.abs(shape.centerY), shape.radius,
      Math.abs(row.startX), Math.abs(row.startY), Math.abs(row.endX), Math.abs(row.endY));
    if (row.arcAngle !== angle * 180 / Math.PI ||
      Math.abs(row.startX - (shape.centerX + Math.cos(shape.startAngleRadians) * shape.radius)) > tolerance ||
      Math.abs(row.startY - (shape.centerY + Math.sin(shape.startAngleRadians) * shape.radius)) > tolerance ||
      Math.abs(row.endX - (shape.centerX + Math.cos(shape.endAngleRadians) * shape.radius)) > tolerance ||
      Math.abs(row.endY - (shape.centerY + Math.sin(shape.endAngleRadians) * shape.radius)) > tolerance) {
      throw new Error("PCB209_ARC_SHAPES_GEOMETRY");
    }
  }
  const result = { schema: "easyeda-pro-control.pcb209-arc-shapes-observation.v1", target: expected,
    families: [{ family: "Arc", method: "eda.pcb_PrimitiveArc.getAll", primitiveIds, rows: validated["value"], observedRowCount: primitiveIds.length }],
    arcShapes: native.arcShapes, arcShapeScope: "native-center-radius-directed-endpoint-angles", fullCircleInterpretationVerified: false,
    projectionSha256: sha256Json({ observation: native.observation, arcShapes: native.arcShapes }), samples: 2, matchingSamples: true,
    units: { linear: "mil", arcAngle: "degrees", endpointAngles: "radians", sweep: "native-enum-0-CW-1-CCW" },
    implementationKind: "native-task-equivalent", originalReceiverRechecked: true, membershipScope: "existing-stateWatcher-Arc-views",
    startupCompletionVerified: false, completeLiveBaselineVerified: false, sourceMembershipVerified: false,
    connectivityVerified: false, persistenceVerified: false, executionAuthorized: false, saveAuthorized: false,
    limitations: [
      "Two complete ordered Arc projections must match. The native collection enumerates loaded stateWatcher views; it does not prove complete board/source membership, connectivity, SDK instances or saved contents.",
      "Center coordinates and radius are multiplied by ten from native distance units to mil. Endpoints and lineWidth are already mil. Native start/end angles retain inclusive zero-to-two-pi radians; sweep retains 0=CW and 1=CCW. No public-wrapper precision rounding is applied.",
      "The native arcAngle getter uses signed modulo one revolution, while other native geometry paths treat coincident angles differently. Equal endpoints or arcAngle zero are not a verified full-circle/rendering interpretation. Signed-zero numeric observations refuse rather than being silently normalized by JSON.",
      "Native endpoints and degree angle must match the captured center/radius/angles before projection. Independent decoded endpoint checks allow only the bounded floating arithmetic error from scaling center/radius to mil; no geometry is repaired or inferred.",
      "No adjacency or entire-track traversal, rendered geometry, source export, edit, Save or writer baseline is supplied. Samples are sequential, not atomic. Native allocation precedes bounds and the ten-second deadline does not cancel its work. Local RPC bookkeeping and possible identity-environment initialization remain incidental."
    ] };
  if (Buffer.byteLength(canonicalJson(result)) > CURRENT_PCB_209_ARC_SHAPES_RESULT_BYTES) { throw new Error("PCB209_ARC_SHAPES_RESULT_BOUND"); }
  return freezeDeep(result);
}
