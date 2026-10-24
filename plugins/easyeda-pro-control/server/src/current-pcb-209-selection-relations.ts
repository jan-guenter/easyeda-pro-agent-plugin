/** Nine loaded-view families, ordered selection and requested child-pad lists.
 * This fixed 209 program reuses pure DTO grammar, never legacy admission. */
import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { CURRENT_PCB_GEOMETRY_MAX_BYTES, CURRENT_PCB_GEOMETRY_MAX_NUMBER, CURRENT_PCB_GEOMETRY_MAX_ROWS,
  currentPcbGeometryResultSchema, validateCurrentPcbGeometryResult } from "./current-pcb-geometry.ts";
import { buildCurrentProjectUrlGuard } from "./current-project-url.ts";
import { CURRENT_PCB_PAD_POLYGON_PROGRAM } from "./current-pcb-pad-polygon.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_209_SELECTION_RELATIONS_NATIVE_BYTES = CURRENT_PCB_GEOMETRY_MAX_BYTES;
export const CURRENT_PCB_209_SELECTION_RELATIONS_RESULT_BYTES = CURRENT_PCB_GEOMETRY_MAX_BYTES;
export const CURRENT_PCB_209_SELECTION_RELATIONS_FAMILIES = Object.freeze(["Line", "Arc", "Via", "Component", "Pad", "String", "Attribute", "Dimension", "Image"] as const);
const nativeText = (max: number): z.ZodString => z.string().max(max).check(context => {
  if (context.value.length > max || !context.value.isWellFormed()) {
    context.issues.push({ code: "custom", message: "Invalid bounded UTF-16 string.", input: context.value });
  }
});
const idSchema = nativeText(256).min(1);
export const currentPcb209SelectionRelationsComponentIdsSchema = z.array(idSchema).max(16)
  .refine(ids => new Set(ids).size === ids.length, "Duplicate component IDs.");
const idsSchema = z.array(idSchema).max(CURRENT_PCB_GEOMETRY_MAX_ROWS);
const targetSchema = z.object({ projectUuid: z.string(), branchUuid: z.string(), documentUuid: z.string(), tabId: z.string() }).strict();
const metadataStateSchema = z.enum(["absent", "undefined", "present"]);
const metadataStatesSchema = z.array(z.object({ primitiveId: idSchema,
  states: z.object({ designator: metadataStateSchema, name: metadataStateSchema, manufacturer: metadataStateSchema,
    manufacturerPart: metadataStateSchema, supplier: metadataStateSchema, supplierPart: metadataStateSchema }).strict() }).strict()).max(CURRENT_PCB_GEOMETRY_MAX_ROWS);
const childScalarSchema = z.object({ primitiveId: idSchema, padNumber: nativeText(1024), net: nativeText(1024).nullable(),
  layer: z.union([z.literal(1), z.literal(2), z.literal(12)]), primitiveLock: z.boolean(), metallization: z.boolean(),
  padType: z.union([z.literal(0), z.literal(1), z.literal(2)]) }).strict();
const childGroupSchema = z.object({ parentPrimitiveId: idSchema, ids: idsSchema,
  scalarRows: z.array(childScalarSchema).max(CURRENT_PCB_GEOMETRY_MAX_ROWS) }).strict();
export const currentPcb209SelectionRelationsPacketSchema = z.object({ ok: z.literal(true), kind: z.literal("pcb209-original-selection-relations-observation"),
  target: targetSchema, observations: z.array(currentPcbGeometryResultSchema).length(CURRENT_PCB_209_SELECTION_RELATIONS_FAMILIES.length),
  componentMetadataStates: metadataStatesSchema, selectedPrimitiveIds: idsSchema, requestedComponentIds: currentPcb209SelectionRelationsComponentIdsSchema,
  componentPadGroups: z.array(childGroupSchema).max(16) }).strict();

/** The original owner qualifies complete UI/PCB sources and retains its receiver.
 * IDs are bounded data; neither the phase nor arguments admit arbitrary topics. */
export const CURRENT_PCB_209_SELECTION_RELATIONS_FUNCTION = `async function(sealed,phase,componentIds){
"use strict";
let timer,clear,expired=false;
try{
const root=globalThis,apply=Reflect.apply,bad=()=>{throw new Error("PCB209_SELECTION_RELATIONS_REFUSED");};
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
const copyIds=raw=>{const ids=[],seen=new Set();for(let i=0,n=length(raw);i<n;i++){const id=text(own(raw,String(i)),256);if(id.length===0||seen.has(id))bad();seen.add(id);ids.push(id);}return ids;};
const requestedComponentIds=copyIds(componentIds);if(requestedComponentIds.length>16)bad();
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
const basicRows=(raw,family,seen)=>{
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
// Selection IDs are complete native order, unlike the raw selected serializer.
// PCB a8405930@10410445 only reads the existing selection manager here.
const topics=[["Line","track"],["Arc","arc"],["Via","via"],["Component","component"],["Pad","pad"],["String","string"],["Attribute","attribute"],["Dimension","dimension"],["Image","image"]];
const call=async(topic,arg)=>{check();const reply=await apply(rpc,channel,[topic,arg,0]);check();childPlain(reply);return own(reply,"message");};
const identity=async()=>{const value=await call("getTabIdAndDocType",undefined);check();exact(value,["tabId","docType"]);if(own(value,"tabId")!==target.tabId||own(value,"docType")!==3)bad();};
const bounded=value=>{const json=JSON.stringify(value);if(new TextEncoder().encode(json).byteLength>${CURRENT_PCB_209_SELECTION_RELATIONS_NATIVE_BYTES})bad();return json;};
const selectedIds=async()=>copyIds(await call("pcb/extensionAPI/selectcontrol-getAllSelectedPrimitiveIds",undefined));
// PCB a8405930@10340883 supplies ordered full child IDs and these scalars.
// Child geometry has different units/rounding; global pad-getAll supplies it.
const childGroup=(raw,parentPrimitiveId,padById,assigned)=>{
const ids=[],scalarRows=[];for(let i=0,n=length(raw);i<n;i++){
const row=childPlain(own(raw,String(i))),id=text(own(row,"globalIndex"),256),pad=padById.get(id);
if(id.length===0||pad===undefined||assigned.has(id)||assigned.size>=256)bad();assigned.add(id);
const scalar={primitiveId:id,padNumber:text(own(row,"num"),1024),net:text(own(row,"net"),1024,true),
layer:layer(own(row,"layerId")),primitiveLock:bool(own(row,"locked")),metallization:bool(own(row,"plated")),padType:integer(own(row,"padTypeAspect"))};
for(const key of Object.keys(scalar))if(scalar[key]!==pad[key])bad();ids.push(id);scalarRows.push(scalar);
}return{parentPrimitiveId,ids,scalarRows};
};
const read=async()=>{
await identity();const selectedPrimitiveIds=await selectedIds();check();
const observations=[],seen=new Set(),componentMetadataStates=[],byId=new Map();let components,pads;
for(const [family,topic] of topics){
const raw=await call("pcb/extensionAPI/"+topic+"-getAll",{});check();
const projected=family==="Attribute"?attributeGroups(raw,components,seen):{rows:["Line","Arc","Via","String"].includes(family)?basicRows(raw,family,seen):rows(raw,family,seen,componentMetadataStates)};
if(family==="Component")components=projected.rows;if(family==="Pad")pads=projected.rows;
for(const row of projected.rows)byId.set(row.primitiveId,row);
observations.push({ok:true,kind:"current-pcb-geometry-observation",method:"eda.pcb_Primitive"+family+".getAll",target,...projected,
samples:2,implementationKind:"native-task-equivalent",cadAuthority:false,persistenceVerified:false,sourceMembershipVerified:false});
bounded({observations,componentMetadataStates,selectedPrimitiveIds});
}
for(const id of selectedPrimitiveIds)if(!byId.has(id))bad();
const componentSet=new Set(components.map(row=>row.primitiveId)),padById=new Map(pads.map(row=>[row.primitiveId,row])),assigned=new Set(),componentPadGroups=[];
for(const id of requestedComponentIds){if(!componentSet.has(id))bad();const raw=await call("pcb/extensionAPI/component-getAllPinsByPrimitiveId",id);check();
componentPadGroups.push(childGroup(raw,id,padById,assigned));bounded({observations,componentMetadataStates,selectedPrimitiveIds,requestedComponentIds,componentPadGroups});}
const after=await selectedIds();if(JSON.stringify(after)!==JSON.stringify(selectedPrimitiveIds))bad();await identity();check();
return{observations,componentMetadataStates,selectedPrimitiveIds,requestedComponentIds,componentPadGroups};
};
const run=async()=>{const first=await read(),json=bounded(first),second=await read();check();if(bounded(second)!==json)bad();
return bounded({ok:true,kind:"pcb209-original-selection-relations-observation",target,...first});};
check();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;reject(new Error("PCB209_SELECTION_RELATIONS_REFUSED"));},10000]);});return await Promise.race([run(),timeout]);
}catch{throw new Error("PCB209_SELECTION_RELATIONS_REFUSED");}finally{if(timer!==undefined&&typeof clear==="function"){try{Reflect.apply(clear,globalThis,[timer]);}catch{throw new Error("PCB209_SELECTION_RELATIONS_REFUSED");}}}
}`;

export function decodeCurrentPcb209SelectionRelationsReply(raw: unknown, targetInput: unknown, componentIdsInput: unknown): Readonly<Record<string, unknown>> {
  const target = currentDisposableOpenSealedTargetSchema.parse(targetInput);
  const componentIds = currentPcb209SelectionRelationsComponentIdsSchema.parse(componentIdsInput);
  const reply = z.object({ result: z.object({ type: z.literal("string"), value: z.string() }).strict() }).strict().parse(raw);
  if (Buffer.byteLength(reply.result.value) > CURRENT_PCB_209_SELECTION_RELATIONS_NATIVE_BYTES) { throw new Error("PCB209_SELECTION_RELATIONS_BOUND"); }
  const native = currentPcb209SelectionRelationsPacketSchema.parse(decodeCurrentPcbDiagnosticJson(Buffer.from(reply.result.value)));
  const expected = { projectUuid: target.projectUuid, branchUuid: target.branchUuid, documentUuid: target.documentUuid,
    tabId: `${target.documentUuid}@${target.projectUuid}` };
  if (canonicalJson(native.target) !== canonicalJson(expected)) { throw new Error("PCB209_SELECTION_RELATIONS_TARGET"); }
  if (canonicalJson(native.requestedComponentIds) !== canonicalJson(componentIds)) { throw new Error("PCB209_SELECTION_RELATIONS_REQUEST"); }
  const byId = new Map<string, z.infer<typeof currentPcbGeometryResultSchema>["rows"][number]>();
  const families = native.observations.map((observation, index) => {
    const family = CURRENT_PCB_209_SELECTION_RELATIONS_FAMILIES[index];
    if (family === undefined || observation.method !== `eda.pcb_Primitive${family}.getAll`) { throw new Error("PCB209_SELECTION_RELATIONS_FAMILY"); }
    validateCurrentPcbGeometryResult({ method: observation.method, arguments: {}, target: expected }, observation);
    const primitiveIds = observation.rows.map(row => {
      if (byId.has(row.primitiveId)) { throw new Error("PCB209_SELECTION_RELATIONS_DUPLICATE"); }
      byId.set(row.primitiveId, row); return row.primitiveId;
    });
    return { family, method: observation.method, primitiveIds, rows: observation.rows, observedRowCount: observation.rows.length,
      ...("attributeParentGroups" in observation ? { attributeParentGroups: observation.attributeParentGroups,
        relationshipEvidence: "native-component-attribute-groups", reciprocalParentVerified: false } : {}) };
  });
  const attributes = native.observations[6], components = native.observations[3];
  if (components?.method !== "eda.pcb_PrimitiveComponent.getAll" || attributes?.method !== "eda.pcb_PrimitiveAttribute.getAll" ||
    canonicalJson(components.rows.map(row => row.primitiveId)) !== canonicalJson(attributes.attributeParentGroups.map(group => group.parentPrimitiveId)) ||
    canonicalJson(components.rows.map(row => row.primitiveId)) !== canonicalJson(native.componentMetadataStates.map(row => row.primitiveId))) {
    throw new Error("PCB209_SELECTION_RELATIONS_COMPONENT_ASSOCIATION");
  }
  for (const [index, metadata] of native.componentMetadataStates.entries()) {
    const component = components.rows[index];
    if (component?.primitiveType !== "Component") { throw new Error("PCB209_SELECTION_RELATIONS_COMPONENT_ASSOCIATION"); }
    for (const [field, state] of Object.entries(metadata.states)) {
      if (Object.hasOwn(component, field) !== (state === "present")) { throw new Error("PCB209_SELECTION_RELATIONS_METADATA_STATE"); }
    }
  }
  if (new Set(native.selectedPrimitiveIds).size !== native.selectedPrimitiveIds.length) { throw new Error("PCB209_SELECTION_RELATIONS_SELECTED_DUPLICATE"); }
  const selectedRows = native.selectedPrimitiveIds.map(id => {
    const row = byId.get(id); if (row === undefined) { throw new Error("PCB209_SELECTION_RELATIONS_SELECTED_MISSING"); } return row;
  });
  if (canonicalJson(native.componentPadGroups.map(group => group.parentPrimitiveId)) !== canonicalJson(componentIds)) {
    throw new Error("PCB209_SELECTION_RELATIONS_GROUP_ORDER");
  }
  const assigned = new Set<string>();
  for (const group of native.componentPadGroups) {
    if (byId.get(group.parentPrimitiveId)?.primitiveType !== "Component" ||
      canonicalJson(group.ids) !== canonicalJson(group.scalarRows.map(row => row.primitiveId))) { throw new Error("PCB209_SELECTION_RELATIONS_CHILD_SEQUENCE"); }
    for (const scalar of group.scalarRows) {
      const pad = byId.get(scalar.primitiveId);
      if (assigned.has(scalar.primitiveId) || assigned.size >= CURRENT_PCB_GEOMETRY_MAX_ROWS || pad?.primitiveType !== "Pad") {
        throw new Error("PCB209_SELECTION_RELATIONS_CHILD_MEMBERSHIP");
      }
      assigned.add(scalar.primitiveId);
      const expectedScalar = { primitiveId: pad.primitiveId, padNumber: pad.padNumber, net: pad.net, layer: pad.layer,
        primitiveLock: pad.primitiveLock, metallization: pad.metallization, padType: pad.padType };
      if (canonicalJson(scalar) !== canonicalJson(expectedScalar)) { throw new Error("PCB209_SELECTION_RELATIONS_CHILD_SCALAR"); }
    }
  }
  const result = { schema: "easyeda-pro-control.pcb209-selection-relations-observation.v1", target: expected, families,
    componentMetadataStates: native.componentMetadataStates, selectedPrimitiveIds: native.selectedPrimitiveIds, selectedRows,
    requestedComponentIds: native.requestedComponentIds, componentPadGroups: native.componentPadGroups,
    projectionSha256: sha256Json(native), samples: 2, matchingSamples: true,
    units: { linear: "mil", arcAngle: "degrees", rotation: "degrees", thermalAngle: "degrees", dimensionCanvasUnit: "observed-document-setting" },
    implementationKind: "native-task-equivalent", originalReceiverRechecked: true,
    selectionEvidence: "native-ordered-selection-and-complete-family-projections",
    relationshipEvidence: "native-component-child-list-and-global-pad-membership",
    membershipScope: "existing-stateWatcher-views;String-excludes-parented-views;Attribute-only-loaded-component-groups",
    startupCompletionVerified: false, completeLiveBaselineVerified: false, sourceMembershipVerified: false, reciprocalParentVerified: false,
    symbolPinMappingVerified: false, connectivityVerified: false, persistenceVerified: false, executionAuthorized: false, saveAuthorized: false,
    limitations: [
      "Two sequential complete nine-family projections, selection brackets and requested child-pad lists must match. Existing stateWatcher views only; no atomic lock, complete canvas, stored membership or writer baseline.",
      "Selection preserves every native selected ID in order and resolves it against the supported families or refuses. Unsupported selected families and parented String views are never silently dropped. Selection is not changed; the raw selected serializer and public object mapper are not called.",
      "Requested component child lists retain complete IDs and order, including empty groups; null refuses. IDs and number/net/layer/lock/metallization/type must agree with global Pad DTOs. Duplicate assignment across requested parents refuses, without proving exclusivity across unrequested parents or reciprocal model ownership.",
      "Child-handler geometry uses different units and rounding and is not projected. Global Pad DTOs provide geometry; supported holes/default copper shapes/masks/thermal fields retain prior limitations. This does not establish symbol pin mapping, physical layer stacks, poured connectivity or manufacturability.",
      "Existing projection omissions remain: Arc center/radius/sweep; Via unused-layer and suture state; Component library/device/3D enrichment; String/Attribute rendered glyphs and formula sources; Dimension rendered measurement; Image/Picture templates, paths, hashes and assets. Native serialization can round or omit geometry before projection.",
      "Raw net null/empty, metadata absent/undefined/present and ordered Attribute parent groups remain distinct. Native collection serialization reads existing caches and may initialize bookkeeping; it runs before facade bounds and is not cancelled by the deadline. No source export, edit or Save."
    ] };
  if (Buffer.byteLength(canonicalJson(result)) > CURRENT_PCB_209_SELECTION_RELATIONS_RESULT_BYTES) { throw new Error("PCB209_SELECTION_RELATIONS_RESULT_BOUND"); }
  return freezeDeep(result);
}
