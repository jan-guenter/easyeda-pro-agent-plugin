/** Restricted original Via hit path. The enclosing original owner must first
 * admit the complete installed source and original application function graph.
 * Standard ECMAScript renderer intrinsics are trusted, as in the fixed readers.
 * This private synchronous kernel has no public SDK or selection dispatch.
 */
import { CURRENT_PCB_209_SPATIAL_ARC_BINDING_COLLECTOR, CURRENT_PCB_209_SPATIAL_ARC_FUNCTION_COLLECTOR, CURRENT_PCB_209_SPATIAL_BINDING_COLLECTOR, CURRENT_PCB_209_SPATIAL_CALLBACK_EXPRESSION,
  CURRENT_PCB_209_SPATIAL_FUNCTION_COLLECTOR, CURRENT_PCB_209_SPATIAL_TRACK_BINDING_COLLECTOR,
  CURRENT_PCB_209_SPATIAL_TRACK_FUNCTION_COLLECTOR } from "./current-pcb-209-spatial-capture-program.ts";
import { CURRENT_PCB_209_SPATIAL_TRACK_GUARDS } from "./current-pcb-209-spatial-track-kernel.ts";
import { CURRENT_PCB_209_SPATIAL_ARC_GUARDS } from "./current-pcb-209-spatial-arc-kernel.ts";
import { CURRENT_PCB_209_SPATIAL_MAX_BYTES, CURRENT_PCB_209_SPATIAL_MAX_COORDINATE,
  CURRENT_PCB_209_SPATIAL_MAX_HITS } from "./current-pcb-209-spatial-read.ts";
import { CURRENT_PCB_209_SPATIAL_FAMILY_ORDER } from "./current-pcb-209-spatial-source-profile.ts";

/** Select only a module-owned fixed program at build/import time. */
function readFunction(track: boolean, arc = false): string {
  let bindings = CURRENT_PCB_209_SPATIAL_BINDING_COLLECTOR, functions = CURRENT_PCB_209_SPATIAL_FUNCTION_COLLECTOR,
    groups = 1, variant = "via";
  if (track) { bindings = CURRENT_PCB_209_SPATIAL_TRACK_BINDING_COLLECTOR; functions = CURRENT_PCB_209_SPATIAL_TRACK_FUNCTION_COLLECTOR; groups = 2; variant = "line-via"; }
  if (arc) { bindings = CURRENT_PCB_209_SPATIAL_ARC_BINDING_COLLECTOR; functions = CURRENT_PCB_209_SPATIAL_ARC_FUNCTION_COLLECTOR; groups = 3; variant = "arc-line-via"; }
  return `function(query){
"use strict";
const bad=()=>{throw new Error("PCB209_SPATIAL_READ_REFUSED");};
const apply=Reflect.apply,objects=[],objectSet=new Set,collections=[];
const object=o=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();return o;};
const own=(o,k)=>{object(o);const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
${bindings}
${functions}
const absent=(o,k)=>{let p=o;for(let i=0;i<8;i++){if(p===null)return;const d=Object.getOwnPropertyDescriptor(p,k);if(d){if(p!==o||!Object.hasOwn(d,"value")||d.value!==undefined)bad();return;}p=Object.getPrototypeOf(p);}bad();};
const num=v=>{if(typeof v!=="number"||!Number.isFinite(v)||Object.is(v,-0)||Math.abs(v)>${CURRENT_PCB_209_SPATIAL_MAX_COORDINATE})bad();return v;};
const uint=v=>{if(!Number.isSafeInteger(v)||Object.is(v,-0)||v<0||v>2147483647)bad();return v;};
const bool=v=>{if(typeof v!=="boolean")bad();return v;};
const id=v=>{if(typeof v!=="string"||v.length===0||v.length>256||!v.isWellFormed()||v.includes("\\0"))bad();return v;};
const record=(o,keys)=>{object(o);if(Object.getPrototypeOf(o)!==Object.prototype)bad();const k=Reflect.ownKeys(o);if(k.length!==keys.length||k.some(n=>!keys.includes(n)))bad();for(const key of keys)own(o,key);};
const retain=o=>{object(o);if(objectSet.has(o))return o;if(objects.length>=4096)bad();objectSet.add(o);
const keys=Reflect.ownKeys(o);if(keys.length>512||keys.some(k=>typeof k!=="string"))bad();const descriptors=[];
for(const key of keys){const d=Object.getOwnPropertyDescriptor(o,key);if(!d)bad();descriptors.push([key,d]);}
objects.push([o,Object.getPrototypeOf(o),descriptors]);return o;};
const noShadow=o=>{const keys=Reflect.ownKeys(o);let p=Object.getPrototypeOf(o),depth=0;while(p!==null){if(++depth>16)bad();for(const key of keys){const d=Object.getOwnPropertyDescriptor(p,key);if(d&&(typeof d.value==="function"||d.get!==undefined||d.set!==undefined))bad();}p=Object.getPrototypeOf(p);}return o;};
const retainData=o=>{retain(noShadow(o));for(const key of Reflect.ownKeys(o)){const d=Object.getOwnPropertyDescriptor(o,key);if(!d||!Object.hasOwn(d,"value"))bad();if(typeof d.value==="number"&&!Number.isFinite(d.value))bad();if(typeof d.value==="string"&&(d.value.length>4096||!d.value.isWellFormed()))bad();}return o;};
const list=(a,max=${CURRENT_PCB_209_SPATIAL_MAX_HITS})=>{if(!Array.isArray(a)||Object.getPrototypeOf(a)!==Array.prototype)bad();const n=own(a,"length");if(!Number.isSafeInteger(n)||n<0||n>max||Reflect.ownKeys(a).length!==n+1)bad();retain(a);for(let i=0;i<n;i++)own(a,String(i));return n;};
const size=(o,p,max)=>{if(Object.getPrototypeOf(object(o))!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,"size");if(!d||typeof d.get!=="function"||d.set!==undefined)bad();const n=apply(d.get,o,[]);if(!Number.isSafeInteger(n)||n<0||n>max)bad();collections.push([o,p,d.get,n]);return n;};
const entries=(o,max)=>{const n=size(o,Map.prototype,max),result=[],it=apply(own(Map.prototype,"entries"),o,[]),next=own(Object.getPrototypeOf(it),"next");
for(let i=0;i<n;i++){const step=apply(next,it,[]);if(own(step,"done")!==false)bad();const row=own(step,"value");if(!Array.isArray(row)||row.length!==2)bad();result.push([row[0],row[1]]);}if(own(apply(next,it,[]),"done")!==true)bad();collections.push([o,null,null,result]);return result;};
const values=(o,max)=>{const n=size(o,Set.prototype,max),result=[],it=apply(own(Set.prototype,"values"),o,[]),next=own(Object.getPrototypeOf(it),"next");
for(let i=0;i<n;i++){const step=apply(next,it,[]);if(own(step,"done")!==false)bad();result.push(own(step,"value"));}if(own(apply(next,it,[]),"done")!==true)bad();collections.push([o,null,null,result,true]);return result;};
const recheck=()=>{for(const [o,p,ds]of objects){if(Object.getPrototypeOf(o)!==p)bad();const keys=Reflect.ownKeys(o);if(keys.length!==ds.length)bad();for(let i=0;i<ds.length;i++){const [k,old]=ds[i],d=Object.getOwnPropertyDescriptor(o,k);if(keys[i]!==k||!d||d.enumerable!==old.enumerable||d.configurable!==old.configurable||d.writable!==old.writable||d.value!==old.value||d.get!==old.get||d.set!==old.set)bad();}}
for(const [o,p,get,n,set]of collections){if(p){if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0||apply(get,o,[])!==n)bad();}else{const it=apply(own(set?Set.prototype:Map.prototype,set?"values":"entries"),o,[]),next=own(Object.getPrototypeOf(it),"next");for(const old of n){const step=apply(next,it,[]);if(own(step,"done")!==false)bad();const v=own(step,"value");if(set?v!==old:!Array.isArray(v)||v[0]!==old[0]||v[1]!==old[1])bad();}if(own(apply(next,it,[]),"done")!==true)bad();}}};
object(query);const kind=own(query,"kind");
if(kind==="point"){record(query,["kind","xMil","yMil"]);num(own(query,"xMil"));num(own(query,"yMil"));}
else if(kind==="region"){record(query,["kind","mode","leftMil","rightMil","bottomMil","topMil"]);if(!["inside","intersects"].includes(own(query,"mode")))bad();for(const k of ["leftMil","rightMil","bottomMil","topMil"])num(own(query,k));if(query.leftMil>=query.rightMil||query.bottomMil>=query.topMil)bad();}else bad();
retain(query);
record(this,["scope","originalCallback","bindings","functions"]);retain(this);const scope=own(this,"scope"),bindings=retain(own(this,"bindings")),callback=own(this,"originalCallback"),functions=own(this,"functions");
if((${CURRENT_PCB_209_SPATIAL_CALLBACK_EXPRESSION})!==callback)bad();
const bindingsCurrent=()=>{const current=collectBindings(scope),expected=Reflect.ownKeys(bindings),keys=Reflect.ownKeys(current);if(keys.length!==expected.length||keys.some((key,i)=>key!==expected[i]||own(current,key)!==own(bindings,key)))bad();
const currentFunctions=collectFunctions(current);if(!Object.isFrozen(functions)||list(functions,${arc ? 265 : 256})!==currentFunctions.length)bad();for(let i=0;i<currentFunctions.length;i++)if(own(functions,String(i))!==currentFunctions[i])bad();};
bindingsCurrent();
const get=k=>own(bindings,k),klass=k=>{const c=get(k);if(typeof c!=="function")bad();return c;};
for(const [key,expected]of Object.entries(${JSON.stringify(CURRENT_PCB_209_SPATIAL_FAMILY_ORDER)})){const value=get(key);if(list(value,32)!==expected.length||expected.some((v,i)=>own(value,String(i))!==v))bad();}
const instance=(o,k)=>{if(Object.getPrototypeOf(object(o))!==own(klass(k),"prototype"))bad();return retain(noShadow(o));};
// Class/static and prototype descriptors are retained across both native calls.
// The outer runner separately qualifies these original functions against source.
for(const key of Reflect.ownKeys(bindings)){const value=own(bindings,key);if(typeof value==="function"){if(key!=="D0")retain(value);const d=Object.getOwnPropertyDescriptor(value,"prototype");if(d&&Object.hasOwn(d,"value")){let p=d.value;for(let i=0;p!==null&&p!==Object.prototype&&i<8;i++,p=Object.getPrototypeOf(p))retain(p);}}}
const Hr=klass("Hr"),qt=instance(get("qt"),"LH"),D0=klass("D0"),oldCode=Object.getOwnPropertyDescriptor(D0,"code");
if(oldCode&&(!Object.hasOwn(oldCode,"value")||!Number.isInteger(oldCode.value)||oldCode.value<0||oldCode.value>2147483647))bad();
const staticD0=Reflect.ownKeys(D0).filter(k=>k!=="code").map(k=>[k,Object.getOwnPropertyDescriptor(D0,k)]);
const Me=retainData(get("Me"));if(own(Me,"_smartMode")!==false)bad();absent(qt,"dialog");
instance(get("G_e"),"V_e");instance(get("St"),"StClass");
const valid=Object.getOwnPropertyDescriptor(Hr,"validType");if(valid&&(!Object.hasOwn(valid,"value")||(valid.value!==null&&valid.value!==undefined)))bad();
const camera=instance(get("a4"),"mx"),scale=num(own(camera,"scale"));if(scale<=0||typeof get("Fi")!=="function")bad();
const env=instance(own(klass("x"),"env"),"x");if(own(env,"_doctype")!==3||own(env,"partitionId")!==""||own(env,"_envFlag")!==null)bad();
const documentUuid=own(env,"_id");if(typeof documentUuid!=="string"||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/.test(documentUuid))bad();
const filterManager=instance(own(klass("zi"),"manager"),"zi"),filters=entries(own(filterManager,"map"),64);const filterMap=new Map;
for(const [key,value]of filters){if(!Number.isInteger(key)||key<0||key>63)bad();instance(value,"wl");if(own(value,"type")!==key)bad();filterMap.set(key,{pick:bool(own(value,"_pick")),visible:bool(own(value,"_visible"))});}
for(const key of [0,1,${track ? "4," : ""}6,7,8,12,21,35,36,37])if(!filterMap.has(key))bad();
for(const key of [7,8,12,35])if(filterMap.get(key).pick)bad();
const layerManager=instance(own(klass("Ke"),"manager"),"Ke"),layers=retainData(get("ye"));
if(own(layers,"modelManager")!==layerManager||own(layers,"grayIndex")!==0)bad();uint(own(layerManager,"activeLayer"));
const layerMap=retainData(own(layers,"_layerMap"));if(Object.getPrototypeOf(layerMap)!==Object.prototype)bad();
for(const key of Reflect.ownKeys(layerMap)){const value=retainData(own(layerMap,key)),model=retainData(own(value,"model"));retainData(own(model,"status"));}
if(!Object.hasOwn(layerMap,"12"))bad();
// Ll/pe build local rectangle geometry through these two shared math workers.
// Their exact source-derived scratch writes do not enter a CAD model, index,
// selection manager, event bus, worker, timer, parser or persistence service.
const cache=instance(own(klass("vMe"),"instance"),"vMe"),boxCache=own(cache,"boxCache");
if(!Array.isArray(boxCache)||Object.getPrototypeOf(boxCache)!==Array.prototype||own(boxCache,"length")!==4)bad();
const boxCacheLength=Object.getOwnPropertyDescriptor(boxCache,"length");
for(const key of Reflect.ownKeys(boxCache)){if(key!=="length"&&!["0","1","2","3"].includes(key))bad();const d=Object.getOwnPropertyDescriptor(boxCache,key);if(!d||!Object.hasOwn(d,"value")||key!=="length"&&typeof d.value!=="number")bad();}
const calculator=get("Jdt"),factory=own(calculator,"fac");
if(Object.getPrototypeOf(calculator)!==own(klass("Zdt"),"prototype")||Object.getPrototypeOf(factory)!==own(klass("xe"),"prototype"))bad();
const scratchShape=(o,keys)=>{const actual=Reflect.ownKeys(o);if(actual.length!==keys.length||actual.some(k=>!keys.includes(k)))bad();return keys.map(k=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return[k,d];});};
const calculatorShape=scratchShape(calculator,["fac","length","box","pt","i"]),factoryShape=scratchShape(factory,["minX","maxX","minY","maxY"]);
const spatial=instance(get("Ht"),"iV");
if(size(own(spatial,"otherMap"),Map.prototype,0)!==0||size(own(spatial,"ratlineMap"),Map.prototype,0)!==0)bad();
const groups=entries(own(spatial,"map"),${groups}),scene=[],ids=new Set,treeNodes=new Set;
let regionBounds=null;if(kind==="region"){
const cx=(query.leftMil+query.rightMil)/2,cy=(query.topMil+query.bottomMil)/2,hx=Math.abs(query.leftMil-query.rightMil)/2,hy=Math.abs(query.topMil-query.bottomMil)/2;
regionBounds=new (klass("at"))(cx/10-hx/10,cx/10+hx/10,cy/10-hy/10,cy/10+hy/10);}
const expectedBounds=kind==="point"?[query.xMil/10,query.xMil/10,query.yMil/10,query.yMil/10]:[own(regionBounds,"minX"),own(regionBounds,"maxX"),own(regionBounds,"minY"),own(regionBounds,"maxY")];
const scratchFlags=(o,shape)=>{const keys=Reflect.ownKeys(o);if(keys.length!==shape.length)bad();for(const [key,old]of shape){const d=Object.getOwnPropertyDescriptor(o,key);if(!d||!Object.hasOwn(d,"value")||d.writable!==old.writable||d.enumerable!==old.enumerable||d.configurable!==old.configurable)bad();}};
const mathScratch=()=>{scratchFlags(calculator,calculatorShape);scratchFlags(factory,factoryShape);if(own(calculator,"fac")!==factory||own(calculator,"length")!==4||own(calculator,"i")!==4)bad();
if(Object.getPrototypeOf(calculator)!==own(klass("Zdt"),"prototype")||Object.getPrototypeOf(factory)!==own(klass("xe"),"prototype"))bad();
const [l,r,b,t]=expectedBounds;if(own(factory,"minX")!==l||own(factory,"maxX")!==r||own(factory,"minY")!==b||own(factory,"maxY")!==t)bad();
const line=own(calculator,"pt"),box=own(calculator,"box");if(Object.getPrototypeOf(line)!==own(klass("M"),"prototype")||Object.getPrototypeOf(box)!==own(klass("at"),"prototype")||own(line,"__bbox")!==box)bad();
if(own(box,"minX")!==l||own(box,"maxX")!==l||own(box,"minY")!==b||own(box,"maxY")!==t)bad();
const length=Object.getOwnPropertyDescriptor(boxCache,"length");if(Object.getPrototypeOf(boxCache)!==Array.prototype||!length||length.value!==4||length.writable!==boxCacheLength.writable||length.enumerable!==boxCacheLength.enumerable||length.configurable!==boxCacheLength.configurable||Reflect.ownKeys(boxCache).length!==5)bad();
for(let i=0;i<4;i++)if(own(boxCache,String(i))!==[l,l,b,t][i])bad();};
const bbox=o=>{instance(o,"at");const a=num(own(o,"minX")),b=num(own(o,"maxX")),c=num(own(o,"minY")),d=num(own(o,"maxY"));if(a>b||c>d)bad();return [a,b,c,d];};
const via=value=>{instance(value,"Ve");const model=instance(own(value,"model"),"Qg");retainData(model);
if(own(model,"_stateWatcher")!==value||own(model,"modelType")!=="Via"||(uint(own(model,"_dataState"))&6)!==0||own(model,"_type")!==0||own(model,"_locked")!==false)bad();
if((uint(own(value,"_dataState"))&4)!==0)bad();const parent=Object.getOwnPropertyDescriptor(value,"_parent");if(parent&&(!Object.hasOwn(parent,"value")||(parent.value!==undefined&&parent.value!==null)))bad();
const modelParent=Object.getOwnPropertyDescriptor(model,"_parent");if(modelParent&&(!Object.hasOwn(modelParent,"value")||(modelParent.value!==undefined&&modelParent.value!==null)))bad();
const partition=Object.getOwnPropertyDescriptor(model,"_partition");if(partition&&(!Object.hasOwn(partition,"value")||(partition.value!==undefined&&partition.value!=="")))bad();
const primitiveId=id(own(model,"_globalIndex"));if(ids.has(primitiveId)||scene.length>=${CURRENT_PCB_209_SPATIAL_MAX_HITS})bad();ids.add(primitiveId);
const center=retainData(own(model,"_center"));num(own(center,"x"));num(own(center,"y"));
const base=retainData(own(model,"_viaBaseInfo")),expansion=retainData(own(model,"_viaExpansion"));
if(own(base,"startLayer")!==1||own(base,"endLayer")!==2||num(own(base,"radius"))<=0||num(own(base,"holeRadius"))<0)bad();
num(own(expansion,"topExpansion"));num(own(expansion,"bottomExpansion"));
if(list(own(model,"_unusedInnerLayers"))!==0)bad();
const box=own(model,"_bbox");if(own(value,"_bbox")!==box)bad();const [a,b,c,d]=bbox(box);
if(regionBounds){const [l,r,bottom,top]=bbox(regionBounds),inside=a>=l&&b<=r&&c>=bottom&&d<=top,outside=b<l||a>r||d<bottom||c>top;if(!inside&&!outside)bad();}
scene.push({value,model,primitiveId,family:"Via"});};
${track ? CURRENT_PCB_209_SPATIAL_TRACK_GUARDS : ""}
${arc ? CURRENT_PCB_209_SPATIAL_ARC_GUARDS : ""}
for(const [family,layerGroups]of groups){${track ? 'if(family==="Track"){for(const [layer,tree]of entries(layerGroups,2)){if(![1,2].includes(layer)||!Object.hasOwn(layerMap,String(layer)))bad();trackTree(tree,layer);}continue;}' : ""}if(family!=="Via"${arc ? '&&family!=="ArcTrack"' : ""})bad();for(const [layer,tree]of entries(layerGroups,${arc ? 'family==="ArcTrack"?2:1' : 1})){if(${arc ? 'family==="ArcTrack"?(![1,2].includes(layer)||!Object.hasOwn(layerMap,String(layer))):' : ""}layer!==12)bad();instance(tree,"Nd");
if(size(own(tree,"changeList"),Set.prototype,0)!==0||size(own(tree,"deadList"),Set.prototype,0)!==0)bad();
const items=values(own(tree,"items"),${CURRENT_PCB_209_SPATIAL_MAX_HITS});for(const item of items)${arc ? 'family==="ArcTrack"?arc(item,layer):' : ""}via(item);
const seenLeaves=new Set,walk=(node,parent,depth)=>{if(depth>16||treeNodes.has(node)||treeNodes.size>=1024)bad();treeNodes.add(node);instance(node,"BI");if(own(node,"parent")!==parent)bad();
const children=own(node,"childs"),n=list(children);if(n===0){if(parent!==null||items.length!==0||own(node,"_bbox")!==null)bad();return;}
bbox(own(node,"_bbox"));for(let i=0;i<n;i++){const child=own(children,String(i));if(Object.getPrototypeOf(child)===own(klass("BI"),"prototype"))walk(child,node,depth+1);else{if(!items.includes(child)||seenLeaves.has(child))bad();seenLeaves.add(child);}}};
walk(own(tree,"root"),null,0);if(seenLeaves.size!==items.length)bad();}}
const selectionOwner=retainData(get("Sr")),selected=own(selectionOwner,"items"),selectedPrimitiveIds=[];
for(let i=0,n=list(selected);i<n;i++){const selectedValue=own(selected,String(i)),entry=scene.find(row=>row.value===selectedValue);if(!entry||selectedPrimitiveIds.includes(entry.primitiveId))bad();selectedPrimitiveIds.push(entry.primitiveId);}
const assertCurrent=()=>{recheck();bindingsCurrent();if((${CURRENT_PCB_209_SPATIAL_CALLBACK_EXPRESSION})!==callback)bad();
const code=Object.getOwnPropertyDescriptor(D0,"code");if(oldCode&&!code)bad();if(code&&(!Object.hasOwn(code,"value")||!Number.isInteger(code.value)||(![1,2,4].includes(code.value)&&code.value!==oldCode?.value)||code.writable!==(oldCode?.writable??true)||code.enumerable!==(oldCode?.enumerable??true)||code.configurable!==(oldCode?.configurable??true)))bad();
const keys=Reflect.ownKeys(D0).filter(k=>k!=="code");if(keys.length!==staticD0.length)bad();for(let i=0;i<keys.length;i++){const [k,old]=staticD0[i],d=Object.getOwnPropertyDescriptor(D0,k);if(keys[i]!==k||!d||d.value!==old.value||d.get!==old.get||d.set!==old.set||d.writable!==old.writable||d.enumerable!==old.enumerable||d.configurable!==old.configurable)bad();}};
const project=result=>{const n=list(result),rows=[],seen=new Set;for(let i=0;i<n;i++){const value=own(result,String(i)),entry=scene.find(row=>row.value===value);if(!entry||seen.has(entry.primitiveId))bad();seen.add(entry.primitiveId);rows.push({primitiveId:entry.primitiveId,family:entry.family});}if(kind==="point"&&rows.length>1)bad();return rows;};
const read=()=>{assertCurrent();let result;
if(kind==="point"){result=apply(own(Hr,"pointSelect"),Hr,[query.xMil/10,query.yMil/10]);result=Array.from(apply(own(Object.getPrototypeOf(qt),"filter"),qt,[result]));result=apply(own(Hr,"filterPartiton"),Hr,[result]);}
else{const rectangle=apply(get("Ll"),undefined,[regionBounds]),method=query.mode==="inside"?"getSelectInside":"getSelectContect";
const raw=apply(own(Hr,method),Hr,[rectangle,{boxChoose:true,isBBox:true}]),filtered=apply(own(Object.getPrototypeOf(qt),"filterElement"),qt,[raw,{boxChoose:true}]);
result=query.mode==="inside"?Array.from(filtered):apply(get("YP"),undefined,[filtered]);}
const rows=project(result);mathScratch();assertCurrent();return rows;};
const first=read(),second=read();if(JSON.stringify(first)!==JSON.stringify(second))bad();assertCurrent();
const result=JSON.stringify({schema:"easyeda-pro-control.pcb209-spatial-${variant}-read.v1",documentUuid,query,identities:first,sceneViaCount:${track ? 'scene.filter(row=>row.family==="Via").length,sceneLineCount:scene.filter(row=>row.family==="Line").length' : "scene.length"}${arc ? ',sceneArcCount:scene.filter(row=>row.family==="Arc").length' : ""},selectedPrimitiveIds,samples:2,nativeOrderingPreserved:true,retainedSceneDescriptorsUnchanged:true,selectionUnchanged:true,allowedExistingStateEffect:"D0.code;vMe.boxCache;Jdt-local-bbox-scratch;BLe.JJ",scope:"standalone-${variant}-ready-bbox-scene-no-region-border-crossings",nativeFunctionGraphVerified:false,nativeIntrinsicsVerified:false,sourceMembershipVerified:false,persistenceVerified:false});
if(new TextEncoder().encode(result).byteLength>${CURRENT_PCB_209_SPATIAL_MAX_BYTES})bad();return result;
}`; }
export const CURRENT_PCB_209_SPATIAL_READ_FUNCTION = readFunction(false);
export const CURRENT_PCB_209_SPATIAL_TRACK_READ_FUNCTION = readFunction(true);
export const CURRENT_PCB_209_SPATIAL_ARC_READ_FUNCTION = readFunction(true, true);
