/** Instrumented synthetic hits, separate from installed-source geometry. */
import { CURRENT_PCB_209_SPATIAL_PAD_EXTRA_PLANS, CURRENT_PCB_209_SPATIAL_PAD_EXTRA_RELATIONS } from "../../src/current-pcb-209-spatial-pad-source-profile.ts";

export const spatialPadScene = `
for(const key of["Mi","et","tE","tC"])scope[key]=class{};
for(const[key,relation]of Object.entries(${JSON.stringify(CURRENT_PCB_209_SPATIAL_PAD_EXTRA_RELATIONS)}))if(relation.parent!==null){Object.setPrototypeOf(scope[key].prototype,scope[relation.parent].prototype);Object.setPrototypeOf(scope[key],scope[relation.parent]);}
for(const plan of ${JSON.stringify(CURRENT_PCB_209_SPATIAL_PAD_EXTRA_PLANS)})if(plan.target==="prototype")Object.defineProperty(scope[plan.role].prototype,plan.property,plan.getter?{get:function(){},configurable:true}:{value:function(){},writable:true,configurable:true});
for(const[key,relation]of Object.entries(${JSON.stringify(CURRENT_PCB_209_SPATIAL_PAD_EXTRA_RELATIONS)}))for(const name of relation.prototypeKeys)if(!Object.hasOwn(scope[key].prototype,name))Object.defineProperty(scope[key].prototype,name,{value:function(){},writable:true,configurable:true});
ye._layerMap[1]={model:{status:{state:6}}};ye._layerMap[2]={model:{status:{state:6}}};
const center=Object.assign(new scope.E,{x:5,y:0}),circle=Object.assign(new scope.tC,{type:"ELLIPSE",width:2,height:2,ratio:0,pl:null});
const padBounds=new at(4,6,-1,1),padModel=Object.assign(new scope.tE,{modelType:"Pad",_dataState:0,_globalIndex:"standalone-pad",_layerId:1,_locked:false,_padType:0,_top:circle,_rotation:0,_center:center,_bbox:padBounds});
const padView=Object.assign(new scope.Mi,{model:padModel,_dataState:1,_bbox:padBounds});padModel._stateWatcher=padView;
const padTree=Object.assign(new Nd,{items:new Set([padView]),changeList:new Set,deadList:new Set,root:Object.assign(new BI,{parent:null,childs:[padView],_bbox:padBounds})});
Ht.map=new Map([["Pad",new Map([[1,padTree]])]]);Sr.items=[padView];
Hr.pointSelect=function(x,y){metrics.hits++;D0.code=1;touchScratch([x,x,y,y]);hook.run();return x===5?[padView]:[]};
`;
