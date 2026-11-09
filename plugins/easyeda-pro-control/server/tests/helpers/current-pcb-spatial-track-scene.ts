import { CURRENT_PCB_209_SPATIAL_TRACK_EXTRA_PLANS, CURRENT_PCB_209_SPATIAL_TRACK_EXTRA_RELATIONS } from "../../src/current-pcb-209-spatial-track-source-profile.ts";

// These instrumented native methods test guard ordering and complete scene
// Custody. They do not establish vendor geometry or connected execution.
export const spatialTrackScene = `
for(const key of ["xr","qr","mt","bR","lEe","bC","oie"])scope[key]=class{};
for(const [key,relation]of Object.entries(${JSON.stringify(CURRENT_PCB_209_SPATIAL_TRACK_EXTRA_RELATIONS)})){
if(relation.parent!==null){Object.setPrototypeOf(scope[key].prototype,scope[relation.parent].prototype);Object.setPrototypeOf(scope[key],scope[relation.parent]);}}
for(const plan of ${JSON.stringify(CURRENT_PCB_209_SPATIAL_TRACK_EXTRA_PLANS)}){
if(plan.target!=="prototype")continue;const owner=scope[plan.role].prototype;
if(plan.getter||!Object.hasOwn(owner,plan.property))Object.defineProperty(owner,plan.property,plan.getter?{get:function(){},configurable:true}:{value:function(){},writable:true,configurable:true});}
for(const [key,relation]of Object.entries(${JSON.stringify(CURRENT_PCB_209_SPATIAL_TRACK_EXTRA_RELATIONS)}))
for(const name of relation.prototypeKeys)if(!Object.hasOwn(scope[key].prototype,name))Object.defineProperty(scope[key].prototype,name,{value:function(){},writable:true,configurable:true});
scope.yh=new scope.lEe;zi.manager.map.set(4,new wl(4));
ye._layerMap[1]={model:{status:{state:6}}};ye._layerMap[2]={model:{status:{state:6}}};
const shape=Object.assign(new scope.bC,{minX:-1,maxX:1,minY:-1,maxY:1,left_lower_x:-2,right_lower_x:2,left_upper_x:-2,right_upper_x:2});
const start=Object.assign(new scope.E,{x:-.5,y:0}),end=Object.assign(new scope.E,{x:.5,y:0});
const com=Object.assign(new scope.oie,{layerId:1,width:1,locked:false,net:"GND"});
const trackBase=Object.assign(new scope.bR,{_start:start,_end:end});
const trackModel=Object.assign(new scope.qr,{_dataState:0,_globalIndex:"track-one",modelType:"Track",com,_baseModel:trackBase,_bbox:new at(-1,1,-1,1)});
const trackView=Object.assign(new scope.xr,{model:trackModel,_dataState:1,_bbox:shape});trackModel._stateWatcher=trackView;
const trackRoot=Object.assign(new iy,{parent:null,childs:[trackView],_octagon:shape});
const trackTree=Object.assign(new V0,{items:new Set([trackView]),changeList:new Set,deadList:new Set,root:trackRoot});
Ht.map.set("Track",new Map([[1,trackTree]]));Fe.items=[trackView,view];
Hr.pointSelect=function(x,y){metrics.hits++;D0.code=1;touchScratch([x,x,y,y]);hook.run();return [trackView]};
Hr.getSelectInside=function(box){metrics.hits++;D0.code=1;touchScratch([box.minX,box.maxX,box.minY,box.maxY]);hook.run();return new Set([trackView,view])};
Hr.getSelectContect=Hr.getSelectInside;
`;

