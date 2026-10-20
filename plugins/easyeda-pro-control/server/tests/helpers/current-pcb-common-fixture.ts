import { runInContext } from "node:vm";
import type { Context } from "node:vm";
import { CURRENT_PCB_COMMON_GRAPH_CLASSES } from "../../src/current-pcb-common-graph.ts";
import { pcbStringObservationFixture } from "./current-pcb-string-observation-fixture.ts";

/** Complete synthetic rule/filter/disabled-panel state for pure body relations.
 * Shared with stored-history joins so each native family has one setup roster. */
export const PCB_COMMON_RULE_ENCODING_SETUP = `
const owner=scope.object.te.manager,rule=n=>owner[n].get("default"),dim=()=>make("E8",{_minValue:.5,_defaultValue:1,_maxValue:10});
Object.assign(rule("safeSpacings"),{referenceLayer:1,_status:0,tables:new Map([[1,make("fj",{status:1,_data:Array.from({length:156},(_,i)=>i/10)})]])});
Object.assign(rule("otherSpacings"),{_device2Device:.2,_thru2SMD:-1,_hole2Hole:-1});
Object.assign(rule("creepageSpacings"),{_creepageDistance:-1,_ignoreLayer:true});
Object.assign(rule("trackPhysics"),{layerStatus:1,tables:new Map([[2,dim()],[1,dim()]])});
Object.assign(rule("netLengthPhysics"),{_netLengthMin:1.234567,_netLengthMax:12});
Object.assign(rule("netLengthTolerancePhysics"),{_netLengthTolerance:.125,_targetNet:"retained"});
Object.assign(rule("differentialPhysics"),{layerStatus:new Map([[0,1],[1,0]]),strokeWidthTables:new Map([[1,dim()]]),diffPairSpacingTables:new Map([[1,dim()]]),_differentialPairLenTolerMax:.5});
Object.assign(rule("blindViaPhysics"),{blindVias:[make("Yre",{_name:"blind",_startLayer:1,_endLayer:15,_viaSizeRule:"radius",_used:false})]});
Object.assign(rule("radiusPhysics"),{_minRadius:.5,_defaultRadius:1,_maxRadius:10,_minInner:.25,_defaultInner:.5,_maxInner:5});
const pad=()=>make("O8",{_type:1,_connectMode:0,_lineClearance:.5,_lineWidth:1,_lineAngle:Math.PI/4});
Object.assign(rule("innerPlanes"),{layerStatus:1,multiLayerPadModel:new Map([[1,pad()]])});
Object.assign(rule("copperPlanes"),{layerStatus:new Map([[0,1],[1,0],[2,1]]),singleLayerPadModel:new Map([[1,pad()]]),multiLayerPadModel:new Map([[2,pad()]]),trackConnectModel:new Map([[1,make("KCe",{_trackConnect:1})]])});
for(const name of["pasteExpansions","solderExpansions"])Object.assign(rule(name),{_padTopExpansion:.1,_padBottomExpansion:.2,_testPointTopExpansion:-100,_testPointBottomExpansion:-100,_viaTopExpansion:.3,_viaBottomExpansion:.4});
Object.assign(rule("autoRouters"),{_routingCorner:2,_isKeep:true,_viaQuatity:1,_routingEffectPriority:0,_routingNetPriority:99,layers:[1,2,12],ignoreNets:["GND"]});
Object.assign(scope.object.ai.model._param,{rowSpacing:.125,columnSpacing:.25,stampHoleDiameter:.55,stampHoleSpacing:.85,stampHolePerGroup:8,stampRow:false,stampColumn:true,stampPerColumn:"0x10",stampPerRow:1,borderHeight:6,borderAtTopBottom:true,borderAtLeftRight:false,createPositionHole:false,createMark:true,positionHoleDiameter:2,markDiameter:1,markExpansion:.5});
scope.object.zi.manager.map.set(21,make("Ll",{type:21,_visible:false,_pick:true}));
`;

/** Synthetic own-data graph, not execution of the vendor asset. The class
 * identities stand in for the separately source-admitted original V8 bindings.
 */
export function pcbCommonFixture(change = ""): Context {
  const context = pcbStringObservationFixture();
  runInContext(`
const aliases=${JSON.stringify(CURRENT_PCB_COMMON_GRAPH_CLASSES)};
for(const name of [...aliases,"At","ogt","ai","Yme","Nfe","vfe","nr","pl","ha","Epe","nb","H8","Am","z8","GSe"]){
const C=class{};Object.defineProperty(C,"name",{value:name});Object.defineProperty(C.prototype,"getInstance",{get(){getterReads++;throw new Error("NO_GETTER");}});scope.object[name]=C;}
globalThis.producerConstructors=[scope.object.Yme,scope.object.Nfe,scope.object.Epe,scope.object.GSe];
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
