/** Five fixed loaded-view families for the original 209 disposable PCB owner.
 * Reuses pure DTO validators and polygon grammar, never 206 runtime admission. */
import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { CURRENT_PCB_GEOMETRY_MAX_BYTES, CURRENT_PCB_GEOMETRY_MAX_NUMBER, CURRENT_PCB_GEOMETRY_MAX_ROWS,
  currentPcbGeometryResultSchema, validateCurrentPcbGeometryResult } from "./current-pcb-geometry.ts";
import { buildCurrentProjectUrlGuard } from "./current-project-url.ts";
import { CURRENT_PCB_PAD_POLYGON_PROGRAM } from "./current-pcb-pad-polygon.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_209_EXTENDED_PRIMITIVES_NATIVE_BYTES = CURRENT_PCB_GEOMETRY_MAX_BYTES;
export const CURRENT_PCB_209_EXTENDED_PRIMITIVES_RESULT_BYTES = CURRENT_PCB_GEOMETRY_MAX_BYTES;
export const CURRENT_PCB_209_EXTENDED_PRIMITIVE_FAMILIES = Object.freeze(["Component", "Pad", "Attribute", "Dimension", "Image"] as const);
const targetSchema = z.object({ projectUuid: z.string(), branchUuid: z.string(), documentUuid: z.string(), tabId: z.string() }).strict();
const metadataStateSchema = z.enum(["absent", "undefined", "present"]);
const metadataStatesSchema = z.array(z.object({ primitiveId: z.string().min(1).max(256).refine(value => value.length <= 256),
  states: z.object({ designator: metadataStateSchema, name: metadataStateSchema, manufacturer: metadataStateSchema,
    manufacturerPart: metadataStateSchema, supplier: metadataStateSchema, supplierPart: metadataStateSchema }).strict() }).strict()).max(CURRENT_PCB_GEOMETRY_MAX_ROWS);
const packetSchema = z.object({ ok: z.literal(true), kind: z.literal("pcb209-original-extended-primitives-observation"), target: targetSchema,
  observations: z.array(currentPcbGeometryResultSchema).length(CURRENT_PCB_209_EXTENDED_PRIMITIVE_FAMILIES.length), componentMetadataStates: metadataStatesSchema }).strict();

/** Complete source-qualified UI/PCB assets are a prerequisite owned by the
 * lifecycle, not established by this generated function or its decoded JSON. */
export const CURRENT_PCB_209_EXTENDED_PRIMITIVES_FUNCTION = `async function(sealed,phase){
"use strict";
let timer,clear,expired=false;
try{
const root=globalThis,apply=Reflect.apply,bad=()=>{throw new Error("PCB209_EXTENDED_PRIMITIVES_REFUSED");};
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
// PCB a8405930@7408336 clones raw attrsMap. Keep absent/undefined/present
// separately; values are only projected for the six explicitly supported keys.
const componentMetadata=(row,id,statesList)=>{
const attrs=childPlain(own(row,"attrsMap")),result={},states={};
for(const [key,field] of [["Designator","designator"],["Name","name"],["Manufacturer","manufacturer"],["Manufacturer Part","manufacturerPart"],["Supplier","supplier"],["Supplier Part","supplierPart"]]){
const d=Object.getOwnPropertyDescriptor(attrs,key);if(!d){if(key in attrs)bad();states[field]="absent";continue;}
if(!Object.hasOwn(d,"value"))bad();if(d.value===undefined){states[field]="undefined";continue;}
result[field]=text(d.value,1024);states[field]="present";
}statesList.push({primitiveId:id,states});return result;
};
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
const rows=(raw,family,seen,metadataStates)=>{
const n=length(raw),result=[];
for(let i=0;i<n;i++){
const row=childPlain(own(raw,String(i))),id=text(own(row,"globalIndex"),256);if(id.length===0||seen.has(id))bad();seen.add(id);
const base={primitiveId:id,primitiveType:family,primitiveLock:bool(own(row,"locked"))};
if(family==="Component"){
const p=point(own(row,"position")),l=layer(own(row,"layerId"));if(l!==1&&l!==2)bad();
result.push({...base,layer:l,x:p.x,y:p.y,rotation:num(own(row,"rotation")),...componentMetadata(row,id,metadataStates)});continue;
}
if(family==="Pad"){
const p=point(own(row,"center")),l=layer(own(row,"layerId")),padType=integer(own(row,"padTypeAspect"));if(![1,2,12].includes(l)||![0,1,2].includes(padType))bad();
result.push({...base,net:text(own(row,"net"),1024,true),layer:l,padNumber:text(own(row,"num"),1024),x:p.x,y:p.y,rotation:num(own(row,"rotation")),
metallization:bool(own(row,"plated")),padType,hole:hole(row),defaultCopperShape:defaultCopperShape(row),maskExpansion:maskExpansion(row),thermal:thermal(row)});continue;
}
if(family==="Attribute"){
const p=point(own(row,"position")),alignMode=integer(own(row,"origin"));if(alignMode<1||alignMode>9)bad();
const silkColor=text(own(row,"silkColor"),128,true);if(silkColor==="")bad();
result.push({...base,layer:layer(own(row,"layerId")),x:num(p.x*10),y:num(p.y*10),value:text(own(row,"value"),65536),
fontFamily:text(own(row,"fontFamily"),1024),fontSize:num(num(own(row,"fontSize"))*10),lineWidth:num(num(own(row,"strokeWidth"))*10),
alignMode,rotation:num(num(own(row,"rotation"))*180/Math.PI),reverse:bool(own(row,"reverse")),expansion:num(num(own(row,"reverseExpansion"))*10),
mirror:bool(own(row,"mirror")),key:text(own(row,"key"),1024),keyVisible:bool(own(row,"showKey")),valueVisible:bool(own(row,"showValue")),
positionIsNull:bool(own(row,"positionIsNull")),silkColor});continue;
}
if(family==="Dimension"){
const dimensionType=text(own(row,"dimensionType"),32);if(!["Length Dimension","Radius Dimension","Protractor Dimension"].includes(dimensionType))bad();
const coordinates=own(row,"coordinateSet"),count=length(coordinates);if(count!==(dimensionType==="Length Dimension"?8:6))bad();
const coordinateSet=[];for(let j=0;j<count;j++)coordinateSet.push(num(own(coordinates,String(j))));
const canvasUnit=text(own(row,"unit"),4),lineWidth=num(own(row,"width")),precision=integer(own(row,"precision"));
if(!["mm","cm","inch","mil"].includes(canvasUnit)||lineWidth<0||precision<0||precision>4)bad();
result.push({...base,layer:layer(own(row,"layerId")),dimensionType,coordinateSet,canvasUnit,lineWidth,precision});continue;
}
if(family!=="Image")bad();
const imageType=text(own(row,"imageType"),7),p=point(own(row,"start")),width=num(own(row,"width")),height=num(own(row,"height"));
if(!["Image","Picture"].includes(imageType)||width<0||height<0)bad();
result.push({...base,imageType,layer:layer(own(row,"layerId")),x:p.x,y:p.y,width,height,rotation:num(own(row,"rotation")),horizonMirror:bool(own(row,"mirror"))});
}return result;
};
// Both handlers use the exact same gr.getAllItem() manager order. Each group
// contains Le.attributes in Object.values(this.attrs) order, including empty
// groups. This association is not a reciprocal parent/model ownership proof.
const attributeGroups=(raw,components,seen)=>{
const n=length(raw);if(n!==components.length)bad();const groups=[],attributeParentGroups=[],result=[];
let total=0;
for(let i=0;i<n;i++){
const group=own(raw,String(i));exact(group,["attrs","parentPrimitiveId"]);
const parentPrimitiveId=text(own(group,"parentPrimitiveId"),256),attrs=own(group,"attrs"),count=length(attrs);
if(parentPrimitiveId!==components[i].primitiveId||total+count>256)bad();total+=count;groups.push({parentPrimitiveId,attrs});
}
for(const group of groups){const children=rows(group.attrs,"Attribute",seen,[]),ids=[];
for(const child of children){ids.push(child.primitiveId);result.push({...child,parentPrimitiveId:group.parentPrimitiveId});}
attributeParentGroups.push({parentPrimitiveId:group.parentPrimitiveId,ids});
}return{rows:result,attributeParentGroups,relationshipEvidence:"native-component-attribute-groups",reciprocalParentVerified:false};
};
const topics=[["Component","component"],["Pad","pad"],["Attribute","attribute"],["Dimension","dimension"],["Image","image"]];
const call=async(topic,arg)=>{check();const reply=await apply(rpc,channel,[topic,arg,0]);check();childPlain(reply);return own(reply,"message");};
const identity=async()=>{const value=await call("getTabIdAndDocType",undefined);check();exact(value,["tabId","docType"]);if(own(value,"tabId")!==target.tabId||own(value,"docType")!==3)bad();};
const bounded=value=>{const json=JSON.stringify(value);if(new TextEncoder().encode(json).byteLength>${CURRENT_PCB_209_EXTENDED_PRIMITIVES_NATIVE_BYTES})bad();return json;};
const read=async()=>{
await identity();check();const observations=[],seen=new Set(),componentMetadataStates=[];let components;
for(const [family,topic] of topics){
const raw=await call("pcb/extensionAPI/"+topic+"-getAll",{});check();
const projected=family==="Attribute"?attributeGroups(raw,components,seen):{rows:rows(raw,family,seen,componentMetadataStates)};
if(family==="Component")components=projected.rows;
observations.push({ok:true,kind:"current-pcb-geometry-observation",method:"eda.pcb_Primitive"+family+".getAll",target,...projected,
samples:2,implementationKind:"native-task-equivalent",cadAuthority:false,persistenceVerified:false,sourceMembershipVerified:false});
bounded({observations,componentMetadataStates});
}
await identity();check();return{observations,componentMetadataStates};
};
const run=async()=>{const first=await read(),json=bounded(first),second=await read();check();if(bounded(second)!==json)bad();
return bounded({ok:true,kind:"pcb209-original-extended-primitives-observation",target,...first});};
check();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;reject(new Error("PCB209_EXTENDED_PRIMITIVES_REFUSED"));},10000]);});return await Promise.race([run(),timeout]);
}catch{throw new Error("PCB209_EXTENDED_PRIMITIVES_REFUSED");}finally{if(timer!==undefined&&typeof clear==="function"){try{Reflect.apply(clear,globalThis,[timer]);}catch{throw new Error("PCB209_EXTENDED_PRIMITIVES_REFUSED");}}}
}`;

export function decodeCurrentPcb209ExtendedPrimitivesReply(raw: unknown, targetInput: unknown): Readonly<Record<string, unknown>> {
  const target = currentDisposableOpenSealedTargetSchema.parse(targetInput);
  const reply = z.object({ result: z.object({ type: z.literal("string"), value: z.string() }).strict() }).strict().parse(raw);
  if (Buffer.byteLength(reply.result.value) > CURRENT_PCB_209_EXTENDED_PRIMITIVES_NATIVE_BYTES) { throw new Error("PCB209_EXTENDED_PRIMITIVES_BOUND"); }
  const native = packetSchema.parse(decodeCurrentPcbDiagnosticJson(Buffer.from(reply.result.value)));
  const expected = { projectUuid: target.projectUuid, branchUuid: target.branchUuid, documentUuid: target.documentUuid,
    tabId: `${target.documentUuid}@${target.projectUuid}` };
  if (canonicalJson(native.target) !== canonicalJson(expected)) { throw new Error("PCB209_EXTENDED_PRIMITIVES_TARGET"); }
  const seen = new Set<string>();
  const families = native.observations.map((observation, index) => {
    const family = CURRENT_PCB_209_EXTENDED_PRIMITIVE_FAMILIES[index];
    if (family === undefined || observation.method !== `eda.pcb_Primitive${family}.getAll`) { throw new Error("PCB209_EXTENDED_PRIMITIVES_FAMILY"); }
    const validated = validateCurrentPcbGeometryResult({ method: observation.method, arguments: {}, target: expected }, observation);
    const primitiveIds = observation.rows.map(row => {
      if (seen.has(row.primitiveId)) { throw new Error("PCB209_EXTENDED_PRIMITIVES_DUPLICATE"); }
      seen.add(row.primitiveId); return row.primitiveId;
    });
    return { family, method: observation.method, primitiveIds, rows: validated["value"], observedRowCount: observation.rows.length,
      ...("attributeParentGroups" in observation ? { attributeParentGroups: observation.attributeParentGroups,
        relationshipEvidence: "native-component-attribute-groups", reciprocalParentVerified: false } : {}) };
  });
  const attributes = native.observations[2], components = native.observations[0];
  if (components?.method !== "eda.pcb_PrimitiveComponent.getAll" || attributes?.method !== "eda.pcb_PrimitiveAttribute.getAll" ||
    canonicalJson(components.rows.map(row => row.primitiveId)) !== canonicalJson(attributes.attributeParentGroups.map(group => group.parentPrimitiveId)) ||
    canonicalJson(components.rows.map(row => row.primitiveId)) !== canonicalJson(native.componentMetadataStates.map(row => row.primitiveId))) {
    throw new Error("PCB209_EXTENDED_PRIMITIVES_COMPONENT_ASSOCIATION");
  }
  for (const [index, metadata] of native.componentMetadataStates.entries()) {
    const component = components.rows[index];
    if (component?.primitiveType !== "Component") { throw new Error("PCB209_EXTENDED_PRIMITIVES_COMPONENT_ASSOCIATION"); }
    for (const [field, state] of Object.entries(metadata.states)) {
      if (Object.hasOwn(component, field) !== (state === "present")) { throw new Error("PCB209_EXTENDED_PRIMITIVES_METADATA_STATE"); }
    }
  }
  const result = { schema: "easyeda-pro-control.pcb209-extended-primitives-observation.v1", target: expected, families,
    componentMetadataStates: native.componentMetadataStates,
    projectionSha256: sha256Json({ observations: native.observations, componentMetadataStates: native.componentMetadataStates }),
    samples: 2, matchingSamples: true, units: { linear: "mil", rotation: "degrees", thermalAngle: "degrees", dimensionCanvasUnit: "observed-document-setting" },
    implementationKind: "native-task-equivalent", originalReceiverRechecked: true,
    membershipScope: "existing-stateWatcher-views;Attribute-only-loaded-component-groups",
    startupCompletionVerified: false, completeLiveBaselineVerified: false, sourceMembershipVerified: false, reciprocalParentVerified: false,
    connectivityVerified: false, persistenceVerified: false, executionAuthorized: false, saveAuthorized: false,
    limitations: [
      "Two complete ordered projections of five instantiated-view families must match. Models without stateWatcher are excluded. Component and Attribute groups share the observed component roster, not reciprocal ownership or complete stored child membership.",
      "Component includes placement, lock and six raw metadata strings with separate absent/undefined/present states. Empty strings remain empty; null or other unsupported values refuse. Other metadata, library/device/3D enrichment, pads and source ownership are omitted.",
      "Pad includes native placement, number/net, hole, default copper shape, mask expansion and thermal configuration. ROUND/SLOT holes and ELLIPSE/OVAL/RECT/POLYGON default shapes are supported; NGON and unknown shapes refuse. Null holes omit hole-only values. Special layer stacks, pad/component ownership and resolved poured connectivity are unverified.",
      "Native default shape and polygon serialization can round or omit tiny/unsupported segments before observation. RECT cornerRatioPercent is a percentage; polygon coordinates are native-pad-style and retain ordering, not a reconstructed or transformed copper outline.",
      "Attribute retains ordered parent groups, including empty groups, and current value/style/display scalars. Name can already be formula-expanded; formulaName, font objects and rendered outlines are omitted. Serialized null color can represent an empty native color string.",
      "Dimension contains eight Length or six Radius/Protractor coordinates in mil, line width and precision. canvasUnit is the document setting placed in the returned DTO, not proof of each model's annotation unit. Rendered measurement, text/font/color and parent state are omitted.",
      "Image contains vector Image then Picture placement/type, dimensions, rotation and mirror only. Native template/path serialization precedes bounds and can allocate temporary geometry. Asset bytes, paths, Picture hash, silk color, rendered bounds and availability are omitted.",
      "No filters, requested-ID lookup, selection, child-pad association, source export, edit or Save. Reads are sequential, not atomic. Vendor enumeration/serialization precede bounds and are not cancelled by the deadline. Local RPC bookkeeping, identity initialization and possible empty pad-length singleton allocation remain incidental."
    ] };
  if (Buffer.byteLength(canonicalJson(result)) > CURRENT_PCB_209_EXTENDED_PRIMITIVES_RESULT_BYTES) { throw new Error("PCB209_EXTENDED_PRIMITIVES_RESULT_BOUND"); }
  return freezeDeep(result);
}

