/** Native serialized vector paths and opaque Picture references for the original
 * 209 disposable PCB owner. Existing Image v1 projections remain unchanged. */
import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { CURRENT_PCB_GEOMETRY_MAX_BYTES, CURRENT_PCB_GEOMETRY_MAX_NUMBER, CURRENT_PCB_GEOMETRY_MAX_ROWS,
  currentPcbGeometryResultSchema, validateCurrentPcbGeometryResult } from "./current-pcb-geometry.ts";
import { buildCurrentProjectUrlGuard } from "./current-project-url.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_209_IMAGE_SHAPES_NATIVE_BYTES = CURRENT_PCB_GEOMETRY_MAX_BYTES;
export const CURRENT_PCB_209_IMAGE_SHAPES_RESULT_BYTES = CURRENT_PCB_GEOMETRY_MAX_BYTES;
export const CURRENT_PCB_209_IMAGE_PATH_MAX_CHARACTERS = 65_536;
export const CURRENT_PCB_209_IMAGE_PATH_MAX_TOKENS = 8192;

/** Accept only the pinned wE serializer's M/L/A grammar. Preserve original
 * bytes, implicit repetitions and negative-zero text; never execute SVG/XML. */
export function validCurrentPcb209ImagePath(value: string): boolean {
  if (value.length > CURRENT_PCB_209_IMAGE_PATH_MAX_CHARACTERS || !value.isWellFormed() || /[^ MAL0-9eE+.-]/u.test(value)) { return false; }
  const trimmed = value.trim();
  if (trimmed.length === 0) { return true; }
  const tokens = trimmed.split(/ +/u);
  if (tokens.length > CURRENT_PCB_209_IMAGE_PATH_MAX_TOKENS || tokens[0] !== "M") { return false; }
  const numberPattern = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/u;
  let command = "", offset = 0;
  while (offset < tokens.length) {
    const token = tokens[offset];
    if (token === "M" || token === "L" || token === "A") { command = token; offset += 1; }
    else if (command !== "L" && command !== "A") { return false; }
    const count = command === "A" ? 7 : 2;
    if (offset + count > tokens.length) { return false; }
    const numbers: number[] = [];
    for (let index = 0; index < count; index += 1) {
      const text = tokens[offset + index];
      if (text === undefined || !numberPattern.test(text)) { return false; }
      const number = Number(text);
      if (!Number.isFinite(number) || Math.abs(number) > CURRENT_PCB_GEOMETRY_MAX_NUMBER) { return false; }
      numbers.push(number);
    }
    if (command === "A" && (numbers[0] === undefined || numbers[0] < 0 || numbers[1] === undefined || numbers[1] < 0 ||
      numbers[2] !== 0 || ![0, 1].includes(numbers[3] ?? -1) || ![0, 1].includes(numbers[4] ?? -1))) { return false; }
    offset += count;
    // Native M is always followed by an explicit L/A/M, never implicit moves.
    if (command === "M") { if (tokens[offset] !== "L" && tokens[offset] !== "A") { return false; } command = ""; }
  }
  return command !== "";
}

const idSchema = z.string().min(1).max(256).refine(value => value.length <= 256 && value.isWellFormed());
const stringSchema = z.string().max(1024).refine(value => value.length <= 1024 && value.isWellFormed());
const colorSchema = z.string().min(1).max(128).refine(value => value.length <= 128 && value.isWellFormed()).nullable();
const imageShapeSchema = z.discriminatedUnion("imageType", [
  z.object({ primitiveId: idSchema, imageType: z.literal("Image"),
    pathString: z.string().max(CURRENT_PCB_209_IMAGE_PATH_MAX_CHARACTERS).refine(validCurrentPcb209ImagePath, "Unsupported native Image path."),
    silkColor: colorSchema }).strict(),
  z.object({ primitiveId: idSchema, imageType: z.literal("Picture"), assetReference: stringSchema }).strict(),
]);
const targetSchema = z.object({ projectUuid: z.string(), branchUuid: z.string(), documentUuid: z.string(), tabId: z.string() }).strict();
export const currentPcb209ImageShapesPacketSchema = z.object({ ok: z.literal(true), kind: z.literal("pcb209-original-image-shapes-observation"),
  target: targetSchema, observation: currentPcbGeometryResultSchema,
  imageShapes: z.array(imageShapeSchema).max(CURRENT_PCB_GEOMETRY_MAX_ROWS) }).strict();

/** Full original owner/source qualification belongs to the lifecycle. */
export const CURRENT_PCB_209_IMAGE_SHAPES_FUNCTION = `async function(sealed,phase){
"use strict";
let timer,clear,expired=false;
try{
const root=globalThis,apply=Reflect.apply,bad=()=>{throw new Error("PCB209_IMAGE_SHAPES_REFUSED");};
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
// PCB a8405930@6160126 wE encPt emits only M/L/A. Beziers are sampled into
// lines before this projection. Coordinates stay in serialized native SVG space.
const pathString=value=>{
text(value,${CURRENT_PCB_209_IMAGE_PATH_MAX_CHARACTERS});if(/[^ MAL0-9eE+.-]/u.test(value))bad();
const trimmed=value.trim();if(trimmed.length===0)return value;const tokens=trimmed.split(/ +/u);
if(tokens.length>${CURRENT_PCB_209_IMAGE_PATH_MAX_TOKENS}||tokens[0]!=='M')bad();let offset=0,command='';
const numberPattern=/^-?(?:0|[1-9]\\d*)(?:\\.\\d+)?(?:[eE][+-]?\\d+)?$/u;
while(offset<tokens.length){const token=tokens[offset];if(token==='M'||token==='L'||token==='A'){command=token;offset++;}else if(command!=='L'&&command!=='A')bad();
const count=command==='A'?7:2;if(offset+count>tokens.length)bad();const numbers=[];
for(let i=0;i<count;i++){const t=tokens[offset+i];if(typeof t!=='string'||!numberPattern.test(t))bad();const n=Number(t);if(!Number.isFinite(n)||Math.abs(n)>${CURRENT_PCB_GEOMETRY_MAX_NUMBER})bad();numbers.push(n);}
if(command==='A'&&(numbers[0]<0||numbers[1]<0||numbers[2]!==0||![0,1].includes(numbers[3])||![0,1].includes(numbers[4])))bad();
offset+=count;if(command==='M'){if(tokens[offset]!=='L'&&tokens[offset]!=='A')bad();command='';}}if(command==='')bad();return value;
};
const rows=raw=>{
const n=length(raw),result=[],imageShapes=[],seen=new Set();let pictureSeen=false;
for(let i=0;i<n;i++){
const row=childPlain(own(raw,String(i))),id=text(own(row,'globalIndex'),256);if(id.length===0||seen.has(id))bad();seen.add(id);
const imageType=text(own(row,'imageType'),7),p=point(own(row,'start')),width=num(own(row,'width')),height=num(own(row,'height'));
if(!['Image','Picture'].includes(imageType)||width<0||height<0)bad();
result.push({primitiveId:id,primitiveType:'Image',primitiveLock:bool(own(row,'locked')),imageType,layer:layer(own(row,'layerId')),
x:p.x,y:p.y,width,height,rotation:num(own(row,'rotation')),horizonMirror:bool(own(row,'mirror'))});
if(imageType==='Image'){
if(pictureSeen)bad();const silkColor=text(own(row,'silkColor'),128,true);if(silkColor==='')bad();
imageShapes.push({primitiveId:id,imageType,pathString:pathString(own(row,'pathString')),silkColor});
}else{pictureSeen=true;if(own(row,'pathString')!=='')bad();imageShapes.push({primitiveId:id,imageType,assetReference:text(own(row,'hashId'),1024)});}
}return{rows:result,imageShapes};
};
const call=async(topic,arg)=>{check();const reply=await apply(rpc,channel,[topic,arg,0]);check();childPlain(reply);return own(reply,'message');};
const identity=async()=>{const value=await call('getTabIdAndDocType',undefined);check();exact(value,['tabId','docType']);if(own(value,'tabId')!==target.tabId||own(value,'docType')!==3)bad();};
const bounded=value=>{const json=JSON.stringify(value);if(new TextEncoder().encode(json).byteLength>${CURRENT_PCB_209_IMAGE_SHAPES_NATIVE_BYTES})bad();return json;};
const read=async()=>{await identity();check();const raw=await call('pcb/extensionAPI/image-getAll',{});check();const projected=rows(raw);
const observation={ok:true,kind:'current-pcb-geometry-observation',method:'eda.pcb_PrimitiveImage.getAll',target,rows:projected.rows,samples:2,
implementationKind:'native-task-equivalent',cadAuthority:false,persistenceVerified:false,sourceMembershipVerified:false};
const sample={observation,imageShapes:projected.imageShapes};bounded(sample);await identity();check();return sample;};
const run=async()=>{const first=await read(),json=bounded(first),second=await read();check();if(bounded(second)!==json)bad();return bounded({ok:true,kind:'pcb209-original-image-shapes-observation',target,...first});};
check();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;reject(new Error('PCB209_IMAGE_SHAPES_REFUSED'));},10000]);});return await Promise.race([run(),timeout]);
}catch{throw new Error('PCB209_IMAGE_SHAPES_REFUSED');}finally{if(timer!==undefined&&typeof clear==='function'){try{Reflect.apply(clear,globalThis,[timer]);}catch{throw new Error('PCB209_IMAGE_SHAPES_REFUSED');}}}
}`;

export function decodeCurrentPcb209ImageShapesReply(raw: unknown, targetInput: unknown): Readonly<Record<string, unknown>> {
  const target = currentDisposableOpenSealedTargetSchema.parse(targetInput);
  const reply = z.object({ result: z.object({ type: z.literal("string"), value: z.string() }).strict() }).strict().parse(raw);
  if (Buffer.byteLength(reply.result.value) > CURRENT_PCB_209_IMAGE_SHAPES_NATIVE_BYTES) { throw new Error("PCB209_IMAGE_SHAPES_BOUND"); }
  const native = currentPcb209ImageShapesPacketSchema.parse(decodeCurrentPcbDiagnosticJson(Buffer.from(reply.result.value)));
  const expected = { projectUuid: target.projectUuid, branchUuid: target.branchUuid, documentUuid: target.documentUuid,
    tabId: `${target.documentUuid}@${target.projectUuid}` };
  if (canonicalJson(native.target) !== canonicalJson(expected)) { throw new Error("PCB209_IMAGE_SHAPES_TARGET"); }
  if (native.observation.method !== "eda.pcb_PrimitiveImage.getAll") { throw new Error("PCB209_IMAGE_SHAPES_FAMILY"); }
  const validated = validateCurrentPcbGeometryResult({ method: native.observation.method, arguments: {}, target: expected }, native.observation);
  if (native.imageShapes.length !== native.observation.rows.length) { throw new Error("PCB209_IMAGE_SHAPES_IDS"); }
  let pictureSeen = false;
  for (const [index, entry] of native.imageShapes.entries()) {
    const row = native.observation.rows[index];
    if (row?.primitiveType !== "Image" || row.primitiveId !== entry.primitiveId || row.imageType !== entry.imageType ||
      pictureSeen && entry.imageType === "Image") { throw new Error("PCB209_IMAGE_SHAPES_IDS"); }
    if (entry.imageType === "Picture") { pictureSeen = true; }
  }
  const primitiveIds = native.observation.rows.map(row => row.primitiveId);
  const result = { schema: "easyeda-pro-control.pcb209-image-shapes-observation.v1", target: expected,
    families: [{ family: "Image", method: native.observation.method, primitiveIds, rows: validated["value"], observedRowCount: primitiveIds.length }],
    imageShapes: native.imageShapes, imageShapeScope: "native-image-path-and-picture-reference",
    projectionSha256: sha256Json({ observation: native.observation, imageShapes: native.imageShapes }), samples: 2, matchingSamples: true,
    units: { placementLinear: "mil", rotation: "degrees", vectorPathLinear: "native-distance;10-mil-per-unit", vectorPathYAxis: "inverted-board-y" },
    implementationKind: "native-task-equivalent", originalReceiverRechecked: true, membershipScope: "existing-stateWatcher-views",
    startupCompletionVerified: false, completeLiveBaselineVerified: false, sourceMembershipVerified: false,
    renderedGeometryVerified: false, assetContentVerified: false, connectivityVerified: false, persistenceVerified: false,
    executionAuthorized: false, saveAuthorized: false,
    limitations: [
      "Two ordered projected Image/Picture collections must match. Only existing stateWatcher views are enumerated; an empty result is not complete board or stored membership.",
      "Vector pathString is the pinned native M/L/A serialization after template, placement, scale, effective mirror and rotation transforms. It remains in native-distance SVG coordinates, ten mil per unit with board Y negated. Its source string, order, implicit repeats and negative-zero text are preserved; no second transform is applied.",
      "Native serialization rounds most values to five decimals, samples Bezier curves into lines at native tolerance0.1, can join disconnected segments with L and emits no explicit close. This is the serialized path, not exact source curves, topology, closure, fill, rendered bounds or manufacturing geometry.",
      "Image silkColor preserves the serializer string/null without CSS validation; null can represent an empty native color. Template source, partition/group and complete model fields are omitted.",
      "Picture assetReference is the opaque native hashId string, including empty if emitted. It is not a verified digest, URI, filename or binaryData. No asset cache lookup, file read, network request, decompression, image decode or content/availability proof occurs. Picture pathString must be empty.",
      "The bounds are256 images,65536 path characters,8192 path tokens and393216 aggregate native/final bytes. Vendor enumeration and template/path serialization precede bounds and can allocate geometry. The ten-second deadline does not cancel already dispatched work. Samples are sequential, not atomic, and grant no editing or Save authority.",
    ] };
  if (Buffer.byteLength(canonicalJson(result)) > CURRENT_PCB_209_IMAGE_SHAPES_RESULT_BYTES) { throw new Error("PCB209_IMAGE_SHAPES_RESULT_BOUND"); }
  return freezeDeep(result);
}
