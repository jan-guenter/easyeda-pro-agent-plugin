import assert from "node:assert/strict";
import { test } from "node:test";
import { runInContext } from "node:vm";
import { encodeCurrentPcbCommonPreference, encodeCurrentPcbCommonPresentation } from "../src/current-pcb-common-encoding.ts";
import { CURRENT_PCB_COMMON_PREFERENCE_FUNCTION, CURRENT_PCB_COMMON_PRESENTATION_FUNCTION, CURRENT_PCB_COMMON_RULES_FUNCTION } from "../src/current-pcb-common-state.ts";
import { pcbCommonFixture } from "./helpers/current-pcb-common-fixture.ts";
import { callPcbStringObservation, pcbStringReply } from "./helpers/current-pcb-string-observation-fixture.ts";

const SETUP = `scope.object.Ke.manager.map.set(4,make("WA",{layerId:4,type:"BOTTOM_SILK",name:"Bottom",status:make("Ff",{state:0}),_activeColor:black,deactiveColor:black}));
scope.object.Me._prevTrackWidth=1.234567;
Object.assign(scope.object.te.manager.radiusPhysics.get("default"),{_defaultInner:1.234567,_defaultRadius:2.345678});`;
function samples(change = ""): { presentation: ReturnType<typeof pcbStringReply>; preference: ReturnType<typeof pcbStringReply>; rules: ReturnType<typeof pcbStringReply>; context: ReturnType<typeof pcbCommonFixture> } {
  const context = pcbCommonFixture(SETUP + change);
  const sample = (source: string): ReturnType<typeof pcbStringReply> => pcbStringReply(callPcbStringObservation(context, source));
  return { presentation: sample(CURRENT_PCB_COMMON_PRESENTATION_FUNCTION), preference: sample(CURRENT_PCB_COMMON_PREFERENCE_FUNCTION),
    rules: sample(CURRENT_PCB_COMMON_RULES_FUNCTION), context };
}

void test("presentation encodes ordered native common bodies without calling getters", () => {
  const source = samples(); const result = encodeCurrentPcbCommonPresentation(source.presentation);
  assert.deepEqual(result.rows.map(row => [row.dataType, row.id]), [["CANVAS", "CANVAS"], ["LAYER", '["LAYER",3]'],
    ["LAYER", '["LAYER",4]'], ["LAYER_PHYS", '["LAYER_PHYS",3]'], ["ACTIVE_LAYER", "ACTIVE_LAYER"],
    ["SILK_OPTS", '["SILK_OPTS",3]'], ["SILK_OPTS", '["SILK_OPTS",4]']]);
  assert.equal(result.rows[0]?.bodyText, '{"originX":0,"originY":0,"unit":"mil","gridXSize":5,"gridYSize":5,"snapXSize":5,"snapYSize":5,"altSnapXSize":5,"altSnapYSize":5,"gridType":"GRID","multiGridType":"NONE","multiGridRatio":5,"highlightValue":0.5}');
  assert.equal(result.rows[1]?.bodyText, '{"layerId":3,"layerType":"TOP_SILK","layerName":"Top Silkscreen Layer","use":true,"show":true,"locked":false,"activeColor":"#000000","activateTransparency":1,"inactiveColor":"#000000","inactiveTransparency":0.5}');
  assert.equal(result.rows[3]?.bodyText, '{"material":null,"thickness":0,"permittivity":null,"lossTangent":null,"isKeepIsland":true,"zIndex":1}');
  assert.equal(runInContext("getterReads+vendorCalls", source.context) as unknown, 0);
  assert.equal(result.completeLiveBaselineVerified, false); assert.equal(result.nativeNoMutationVerified, false);
  assert.equal(result.executionAuthorized, false); assert.equal(Object.isFrozen(result.rows), true);
});

void test("canvas reproduces || fallback, precision, alternate units and native rounding ties", () => {
  const source = samples(`Object.assign(scope.object.x.env._origin,{x:-.000005,y:.000005});
Object.assign(scope.object.At.ins,{_stepX:1.23456789,_snapY:2.34567891});
Object.assign(scope.object.At.ins.param,{_stepX:0,_snapY:-0});
scope.object.x.env._altGridSize.GridX={number:.12345678,unit:"mm"};scope.object.x.env._forceValue=.25;
scope.object.x.env._gridType="unexpected";`);
  assert.equal(encodeCurrentPcbCommonPresentation(source.presentation).rows[0]?.bodyText,
    '{"originX":0,"originY":0.0001,"unit":"mil","gridXSize":12.345679,"gridYSize":5,"snapXSize":5,"snapYSize":23.456789,"altSnapXSize":0.123457,"altSnapYSize":5,"gridType":"NONE","multiGridType":"NONE","multiGridRatio":5,"highlightValue":0.3}');
});

void test("layer projection preserves malformed colors, skips only disabled CUSTOM and stable-sorts stack", () => {
  const source = samples(`const layerManager=scope.object.Ke.manager,top=layerManager.map.get(3);
top._activeColor=make("ee",{r:1/1020,g:1,b:-1,alpha:.75});top._temporaryActiveColor=make("ee",{r:1,g:1,b:1,alpha:0});
layerManager.map.set(101,make("WA",{layerId:101,type:"CUSTOM",name:"Hidden",status:make("Ff",{state:0}),_activeColor:black,deactiveColor:black}));
layerManager.map.set(102,make("WA",{layerId:102,type:"CUSTOM",name:"Visible",status:make("Ff",{state:7}),_activeColor:black,deactiveColor:black}));
layerManager._layerPhys.set(4,make("HA",{_layerId:4,_thickness:.123456,_permittivity:4.1,_lossTangent:.02,_material:"FR4",_isKeepIsland:false,zIndex:0}));
layerManager._layerPhys.set(5,make("HA",{_layerId:5,_thickness:.2,_permittivity:null,_lossTangent:null,_material:null,_isKeepIsland:true,zIndex:0}));
scope.object.Me._topSilkscreenColor="#aBcDeF";`);
  const result = encodeCurrentPcbCommonPresentation(source.presentation);
  assert.deepEqual(result.rows.filter(row => row.dataType === "LAYER").map(row => row.id), ['["LAYER",3]', '["LAYER",4]', '["LAYER",102]']);
  assert.match(result.rows[1]?.bodyText ?? "", /"activeColor":"#0\.ff-f","activateTransparency":0\.75/u);
  assert.deepEqual(result.rows.filter(row => row.dataType === "LAYER_PHYS").map(row => row.id), ['["LAYER_PHYS",4]', '["LAYER_PHYS",5]', '["LAYER_PHYS",3]']);
  assert.match(result.rows.find(row => row.id === '["LAYER_PHYS",4]')?.bodyText ?? "", /"thickness":1\.235/u);
  assert.match(result.rows.find(row => row.id === '["SILK_OPTS",3]')?.bodyText ?? "", /#aBcDeF/u);
});

void test("raw excluded state remains bound independently of identical encoded bodies", () => {
  const first = encodeCurrentPcbCommonPresentation(samples().presentation);
  const second = encodeCurrentPcbCommonPresentation(samples('scope.object.Ke.manager.map.get(3)._temporaryActiveColor=null;scope.object.Ke.manager.extra={hidden:42};').presentation);
  assert.equal(first.bodySequenceSha256, second.bodySequenceSha256); assert.notEqual(first.rawGraphSha256, second.rawGraphSha256);
  for (const change of ['scope.object.Ke.manager.map.delete(4);', 'scope.object.Ke.manager.activeLayer=999;',
    'scope.object.Ke.manager.map.get(3).layerId=9;', 'scope.object.Ke.manager.map.get(3).status.state=16;',
    'scope.object.x.env._origin.x=1e308;', 'scope.object.Ke.manager._layerPhys.get(3)._thickness=undefined;']) {
    assert.throws(() => encodeCurrentPcbCommonPresentation(samples(change).presentation), /PCB_COMMON_ENCODING/u, change);
  }
});

void test("preference produces exact field order, fallback radii and raw enum mappings", () => {
  const source = samples(); const result = encodeCurrentPcbCommonPreference(source.preference, source.rules);
  assert.equal(result.rows[0]?.bodyText, '{"startTrackWidthFollowLast":false,"lastTrackWidth":12.3457,"startViaSizeFollowLast":false,"lastViaInnerDiameter":24.6913,"lastViaDiameter":46.9136,"snap":true,"routingMode":"SURROUND","routingCorner":"L45","removeLoop":true,"rotatingObject":true,"trackFollow":true,"stretchTrackMinCorner":1,"realTimeUpdateUnusedLayers":true,"unusedPadRange":"VIA","pushVia":"OPTIMIZA_OPEN","pathOptimization4BePushed":"SINGLE","currentPathOptimization4BePushed":"OPTIMIZA_WEAK","removeCircuitsContainingVias":true,"removeAntenna":true}');
  assert.equal(runInContext("getterReads+vendorCalls", source.context) as unknown, 0);
  assert.equal(result.saveAuthorized, false); assert.equal(result.nativeNoMutationVerified, false);
});

void test("preference models JSON omission/null/negative-zero and native parseInt without evaluating supplied code", () => {
  const source = samples(`scope.object.ce.pcbConfig._layerPhyPerferenceConfig=[undefined,null,-0,[1,"raw"]];
scope.object.nr.instance._type="unknown";scope.object.nr.instance._mode="WIRING_MODE_SURROUND_AND_PUSHAWAY";
scope.object.pl.instance.minimumTrackCorners="0x10";scope.object.pl.instance.pushViaOptimization="unknown";`);
  const encoded = encodeCurrentPcbCommonPreference(source.preference, source.rules).rows[0]?.bodyText ?? "";
  assert.ok(!encoded.includes('"routingCorner"'));
  assert.match(encoded, /"routingMode":"SURROUND&PUSH"/u);
  assert.match(encoded, /"stretchTrackMinCorner":16,"preferenceConfig":\[null,null,0,\[1,"raw"\]\]/u);
  assert.match(encoded, /"pushVia":null/u);
  const absent = samples(), present = samples('scope.object.ce.pcbConfig._layerPhyPerferenceConfig=undefined;');
  const first = encodeCurrentPcbCommonPreference(absent.preference, absent.rules), second = encodeCurrentPcbCommonPreference(present.preference, present.rules);
  assert.equal(first.bodySequenceSha256, second.bodySequenceSha256); assert.notEqual(first.rawGraphSha256, second.rawGraphSha256);
  const object = samples('scope.object.ce.pcbConfig._layerPhyPerferenceConfig={a:1,b:undefined,"2":false};Object.defineProperty(scope.object.ce.pcbConfig._layerPhyPerferenceConfig,"hidden",{value:99,enumerable:false});');
  assert.match(encodeCurrentPcbCommonPreference(object.preference, object.rules).rows[0]?.bodyText ?? "", /"preferenceConfig":\{"2":false,"a":1\}/u);
});

void test("preference refuses lazy width/rule repair and missing fallback even with initialized overrides", () => {
  for (const change of ['scope.object.Me._prevTrackWidth=null;', 'scope.object.Me._prevTrackWidth=undefined;',
    'scope.object.te.manager.radiusPhysics.clear();Object.assign(scope.object.rt.defaultVia,{innerRadius:1,radius:2});',
    'scope.object.te.manager.safeSpacings=scope.object.te.manager.radiusPhysics;',
    'scope.object.te.manager.radiusPhysics.get("default")._isDefault=false;',
    'scope.object.pl.instance.minimumTrackCorners="oops";',
    'scope.object.ce.pcbConfig._layerPhyPerferenceConfig={};scope.object.ce.pcbConfig._layerPhyPerferenceConfig.self=scope.object.ce.pcbConfig._layerPhyPerferenceConfig;',
    'scope.object.ce.pcbConfig._layerPhyPerferenceConfig=new Map();',
    'scope.object.ce.pcbConfig._layerPhyPerferenceConfig={toJSON:undefined};']) {
    const source = samples(change);
    assert.throws(() => encodeCurrentPcbCommonPreference(source.preference, source.rules), /PCB_COMMON_ENCODING/u, change);
  }
  const source = samples('scope.object.te.manager.radiusPhysics.get("default")._isDefault=false;Object.assign(scope.object.rt.defaultVia,{innerRadius:1,radius:2});');
  assert.match(encodeCurrentPcbCommonPreference(source.preference, source.rules).rows[0]?.bodyText ?? "", /"lastViaInnerDiameter":20,"lastViaDiameter":40/u);
});

void test("first insertion-order default wins, expanded aliases stay bounded and documents must match", () => {
  const source = samples('scope.object.te.manager.radiusPhysics.set("other",make("aR",{_isDefault:true,_defaultInner:99,_defaultRadius:99}));');
  assert.match(encodeCurrentPcbCommonPreference(source.preference, source.rules).rows[0]?.bodyText ?? "", /"lastViaInnerDiameter":24\.6913/u);
  const expanded = samples('let repeated=[1];for(let i=0;i<20;i++)repeated=[repeated,repeated];scope.object.ce.pcbConfig._layerPhyPerferenceConfig=repeated;');
  assert.throws(() => encodeCurrentPcbCommonPreference(expanded.preference, expanded.rules), /JSON expansion bound/u);
  const large = samples('let repeated=["x".repeat(4096)];for(let i=0;i<10;i++)repeated=[repeated,repeated];scope.object.ce.pcbConfig._layerPhyPerferenceConfig=repeated;');
  assert.throws(() => encodeCurrentPcbCommonPreference(large.preference, large.rules), /JSON byte expansion bound/u);
  const other = samples('scope.object.x.env._id="1111111111111111";');
  assert.throws(() => encodeCurrentPcbCommonPreference(source.preference, other.rules), /document differs/u);
  assert.throws(() => encodeCurrentPcbCommonPresentation(new Proxy(source.presentation, {})), /PCB_COMMON_GRAPH_REPLY/u);
});

void test("full presentation and preference graph instances refuse own public shadows", () => {
  for (const change of ["scope.object.Ke.manager.deactiveAlpha=0;", "scope.object.Ke.manager.getAllItem=null;",
    "scope.object.Ke.manager.map.get(3).visible=false;", "scope.object.Ke.manager.map.get(3).status.config=false;",
    "black.toString=null;", "scope.object.Ke.manager._layerPhys.get(3).thickness=99;"]) {
    assert.throws(() => encodeCurrentPcbCommonPresentation(samples(change).presentation), /own public shadow/u, change);
  }
  for (const change of ["scope.object.te.manager.getRadiusPhysicsByNet=null;", "scope.object.te.manager.getDefault=null;",
    'scope.object.te.manager.radiusPhysics.get("default").isDefault=false;',
    'scope.object.te.manager.radiusPhysics.get("default").defalutInner=99;']) {
    const source = samples(change);
    assert.throws(() => encodeCurrentPcbCommonPreference(source.preference, source.rules), /own public shadow/u, change);
  }
});
