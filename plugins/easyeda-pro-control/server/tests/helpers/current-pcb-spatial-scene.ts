import { CURRENT_PCB_209_SPATIAL_CLASS_RELATIONS, CURRENT_PCB_209_SPATIAL_FAMILY_ORDER,
  CURRENT_PCB_209_SPATIAL_FUNCTION_PLANS } from "../../src/current-pcb-209-spatial-source-profile.ts";

// A synthetic original-context scene exercises the guard and result kernel.
// Its instrumented hit methods do not establish vendor geometry equivalence.
export const spatialScene = `
class YJ{}class Net{}class rye{}
const callback=function(){};
const task=Object.assign(new rye,{isRunning:true,callback});
globalThis.MSG_BUS_PCB=Object.assign(new YJ,{messageBus:Object.assign(new Net,{subscribed:{"pcb/extensionAPI/document-getPrimitiveAtPoint":[task]}})});
class LH{filter(value){return new Set(value)}filterElement(value){return value}}
class Qg{}class Ve{}class It{}class ki{}class qs{}class n3{}class D0{}
class iV{}class vD{}class Nd{}class V0{}class BI{}class iy{}class sy{}class GN{}class Ud{}class g0{}class V_e{}
class at{constructor(minX,maxX,minY,maxY){Object.assign(this,{minX,maxX,minY,maxY})}}
class mx{constructor(){this.scale=1}}
class wl{constructor(type,pick=true){Object.assign(this,{type,_pick:pick,_visible:true})}}
class zi{}class Ke{}class x{}
const camera=new mx,qt=new LH,Me={_smartMode:false};
zi.manager=Object.assign(new zi,{map:new Map([0,1,6,7,8,12,21,35,36,37].map(k=>[k,new wl(k,![7,8,12,35].includes(k))]))});
Ke.manager=Object.assign(new Ke,{activeLayer:1});
x.env=Object.assign(new x,{_doctype:3,partitionId:"",_envFlag:null,_isPreview:false,_id:"0123456789abcdef"});
const ye={modelManager:Ke.manager,grayIndex:0,_layerMap:{12:{model:{status:{state:6}}}}};
const box=new at(-1,1,-1,1);
const model=Object.assign(new Qg,{_dataState:0,_globalIndex:"via-one",_type:0,modelType:"Via",_center:{x:0,y:0},
_viaBaseInfo:{startLayer:1,endLayer:2,radius:1,holeRadius:.5},_viaExpansion:{topExpansion:0,bottomExpansion:0},
_unusedInnerLayers:[],_bbox:box,_net:"GND",_locked:false});
const view=Object.assign(new Ve,{model,_dataState:1,_bbox:box});model._stateWatcher=view;
const tree=Object.assign(new Nd,{items:new Set([view]),changeList:new Set,deadList:new Set,
root:Object.assign(new BI,{parent:null,childs:[view],_bbox:box})});
const Ht=Object.assign(new iV,{map:new Map([["Via",new Map([[12,tree]])]]),otherMap:new Map,ratlineMap:new Map});
const Fe={items:[view]},Sr={_model:3,control:null,lockedLayers:new Set},metrics={hits:0,getters:0},hook={run:()=>{}};
class Hr{static pointSelect(x,y){metrics.hits++;D0.code=1;touchScratch([x,x,y,y]);hook.run();return [view]}
static filterPartiton(value){return value}static getSelectInside(box){metrics.hits++;D0.code=1;touchScratch([box.minX,box.maxX,box.minY,box.maxY]);hook.run();return new Set([view])}
static getSelectContect(box){metrics.hits++;D0.code=1;touchScratch([box.minX,box.maxX,box.minY,box.maxY]);hook.run();return new Set([view])}}
const scope={Hr,qt,LH,Fi:()=>camera,a4:camera,Me,Ht,zi,Ve,Qg,It,ki,qs,n3,D0,iV,vD,Nd,V0,BI,iy,sy,GN,Ud,g0,V_e,
G_e:new V_e,at,Ll:value=>value,YP:value=>Array.from(value),x,ye,Fe,Sr,mx,wl,Ke};
`;
export const qualifiedSpatialScene = `
const plans=${JSON.stringify(CURRENT_PCB_209_SPATIAL_FUNCTION_PLANS)};
Object.assign(scope,${JSON.stringify(CURRENT_PCB_209_SPATIAL_FAMILY_ORDER)});
for(const plan of plans)if(!Object.hasOwn(scope,plan.role))scope[plan.role]=class{};
for(const [key,relation]of Object.entries(${JSON.stringify(CURRENT_PCB_209_SPATIAL_CLASS_RELATIONS)})){
if(relation.parent!==null){Object.setPrototypeOf(scope[key].prototype,scope[relation.parent].prototype);Object.setPrototypeOf(scope[key],scope[relation.parent]);}}
scope.St=new scope.StClass;Object.setPrototypeOf(Me,scope.qme.prototype);Object.setPrototypeOf(ye,scope.Ude.prototype);
scope.Jdt=Object.assign(new scope.Zdt,{fac:Object.assign(new scope.xe,{minX:Infinity,maxX:-Infinity,minY:Infinity,maxY:-Infinity}),length:0,box:null,pt:null,i:0});
scope.vMe.instance=Object.assign(new scope.vMe,{boxCache:new Array(4)});Ht.func=()=>new vD;
for(const plan of plans){if(!["static","prototype"].includes(plan.target))continue;const owner=plan.target==="static"?scope[plan.role]:scope[plan.role].prototype;
if(!Object.hasOwn(owner,plan.property))Object.defineProperty(owner,plan.property,plan.getter?{get:function(){},configurable:true}:{value:function(){},writable:true,configurable:true});}
for(const [key,relation]of Object.entries(${JSON.stringify(CURRENT_PCB_209_SPATIAL_CLASS_RELATIONS)}))
for(const name of relation.prototypeKeys)if(!Object.hasOwn(scope[key].prototype,name))Object.defineProperty(scope[key].prototype,name,{value:function(){},writable:true,configurable:true});
function touchScratch(bounds){const [l,r,b,t]=bounds;scope.vMe.instance.boxCache.splice(0,4,l,l,b,t);
const box=new at(l,l,b,t);Object.assign(scope.Jdt.fac,{minX:l,maxX:r,minY:b,maxY:t});Object.assign(scope.Jdt,{length:4,i:4,box,pt:Object.assign(new scope.M,{__bbox:box})});}
`;
