import { runInContext } from "node:vm";
import type { Context } from "node:vm";
import { CURRENT_PCB_COMMON_GRAPH_CLASSES } from "../../src/current-pcb-common-graph.ts";
import { pcbStringObservationFixture } from "./current-pcb-string-observation-fixture.ts";

/** Synthetic own-data graph, not execution of the vendor asset. The class
 * identities stand in for the separately source-admitted original V8 bindings.
 */
export function pcbCommonFixture(change = ""): Context {
  const context = pcbStringObservationFixture();
  runInContext(`
const aliases=${JSON.stringify(CURRENT_PCB_COMMON_GRAPH_CLASSES)};
for(const name of [...aliases,"At","ogt","ai","Yme","Nfe","vfe","nr","pl","ha","Epe","nb","H8","Am","z8","GSe"]){
const C=class{};Object.defineProperty(C.prototype,"getInstance",{get(){getterReads++;throw new Error("NO_GETTER");}});scope.object[name]=C;}
const make=(name,fields)=>Object.assign(new scope.object[name](),fields);
const manager=(name,fields)=>{const o=make(name,fields);scope.object[name].manager=o;return o;};
const point=make("S",{x:-0,y:0});Object.assign(x.env,{_origin:point,_unit:"mil",_altGridSize:{GridX:{number:5,unit:"mil"},GridY:{number:5,unit:"mil"}},_gridType:"grid",_multiType:"none",_multiRatio:5,_forceValue:.5});
scope.object.At.ins=make("At",{_stepX:.5,_stepY:.5,_snapX:.5,_snapY:.5,param:make("ogt",{_stepX:.5,_stepY:.5,_snapX:.5,_snapY:.5})});
const black=make("ee",{r:0,g:0,b:0,alpha:1});
const layer=make("WA",{_temporaryActiveColor:undefined,layerId:3,type:"TOP_SILK",hashed:3,name:"Top Silkscreen Layer",status:make("Ff",{state:3}),_activeColor:black,deactiveColor:black});
manager("Ke",{map:new Map([[3,layer]]),_last:undefined,_deactiveAlpha:.5,activeLayer:3,_layerPhys:new Map([[3,make("HA",{_layerId:3,_thickness:null,_permittivity:null,_lossTangent:null,_material:null,_isKeepIsland:true,zIndex:1})]]),helpLayerMask:{}});
manager("zi",{map:new Map([[13,make("Ll",{type:13,_visible:true,_pick:true})]]),_last:undefined});
scope.object.ai.model=make("ai",{_param:{success:false,on:false,row:1,column:1,onlyOutline:true,description:"",useCustomSize:null,outputUnit:"mm"}});
scope.object.Me=make("Yme",{_topBoardColor:"#FFFFFF",_topSilkscreenColor:"#000000",_bottomBoardColor:"#FFFFFF",_bottomSilkscreenColor:"#000000",_prevTrackWidth:null,_adsorb:true,_removeLoop:true});
scope.object.ce=make("Nfe",{pcbConfig:make("vfe",{_startTrackWidth:"rule",_startViaSize:"rule",_rotateWhole:"single",_trackFollow:"moveKeep",realTimeUpdateUnusedLayers:true,unusedPadRange:3})});
scope.object.nr.instance=make("nr",{_mode:"WIRING_MODE_SURROUND",_type:"WIRING_CORNER_LINE45"});
scope.object.pl.instance=make("pl",{minimumTrackCorners:1,pushViaOptimization:"OPTIMIZA_OPEN",pathOptimization:0,currentPathOptimization:"OPTIMIZA_WEAK",removeCircuitsContainingVias:true,removeAntenna:true});
scope.object.ha.instance=make("ha",{wiringRouterParams:scope.object.pl.instance});scope.object.rt=make("Epe",{defaultVia:{innerRadius:0,radius:0}});
const rules=manager("te",{map:new Map(),_last:undefined,betweenNetRule:make("Wre",{_name:"",rule:[],cacheRuleMap:[]}),ruleTemplateName:"",defaultRuleMap:new Map(),max:null});
scope.object._Fe={UNIT_NAME:"mm"};
for(const name of ["nets","netClass","netDifferentials","regionSelectors","equalLengthGroups","padsPairGroups","cacheNetModel"])rules[name]=new Map();
const families=[["safeSpacings","xI"],["otherSpacings","Ky"],["creepageSpacings","nC"],["trackPhysics","cR"],["netLengthPhysics","tR"],["netLengthTolerancePhysics","rR"],["differentialPhysics","i2"],["blindViaPhysics","Jx"],["radiusPhysics","aR"],["innerPlanes","eR"],["copperPlanes","Qx"],["solderExpansions","lR"],["pasteExpansions","sR"],["autoRouters","hR"]];
for(const [name,kind] of families)rules[name]=new Map([["default",make(kind,{_name:"default",_isDefault:true,value:1})]]);
rules.safeSpacings.get("default").tables=new Map([[1,make("fj",{status:1,_data:[0,1,2]})]]);
rules.trackPhysics.get("default").tables=new Map([[1,make("E8",{_minValue:.5,_defaultValue:1,_maxValue:10})]]);
rules.defaultRuleMap.set("safe",rules.safeSpacings.get("default"));
manager("nb",{map:new Map(),_last:undefined});scope.object.H8.mgr=make("H8",{map:new Map(),_last:undefined,uuidMap:{}});
scope.object.Am.ins=make("Am",{texts:new Set()});scope.object.z8.ins=make("z8",{footprints:new Map()});scope.object.id=make("GSe",{map:new Map(),_last:undefined});
${change}
`, context, { timeout: 1000 });
  return context;
}
