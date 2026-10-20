import assert from "node:assert/strict";
import { test } from "node:test";
import { runInContext } from "node:vm";
import { encodeCurrentPcbCommonRulesAndPrimitives } from "../src/current-pcb-common-rule-encoding.ts";
import { CURRENT_PCB_COMMON_PRESENTATION_FUNCTION, CURRENT_PCB_COMMON_RULES_FUNCTION } from "../src/current-pcb-common-state.ts";
import { PCB_COMMON_RULE_ENCODING_SETUP, pcbCommonFixture } from "./helpers/current-pcb-common-fixture.ts";
import { callPcbStringObservation, pcbStringReply } from "./helpers/current-pcb-string-observation-fixture.ts";

function fixture(change = ""): { rules: ReturnType<typeof pcbStringReply>; presentation: ReturnType<typeof pcbStringReply>; context: ReturnType<typeof pcbCommonFixture> } {
  const context = pcbCommonFixture(PCB_COMMON_RULE_ENCODING_SETUP + change);
  return { rules: pcbStringReply(callPcbStringObservation(context, CURRENT_PCB_COMMON_RULES_FUNCTION)),
    presentation: pcbStringReply(callPcbStringObservation(context, CURRENT_PCB_COMMON_PRESENTATION_FUNCTION)), context };
}
function encoded(change = ""): ReturnType<typeof encodeCurrentPcbCommonRulesAndPrimitives> {
  const source = fixture(change); return encodeCurrentPcbCommonRulesAndPrimitives(source.rules, source.presentation);
}
function ruleText(result: ReturnType<typeof encoded>, type: string): string {
  const found = result.rows.find(row => row.id === JSON.stringify(["RULE", type, "default"])); assert.ok(found); return found.bodyText;
}

void test("all fourteen rule families encode in native order, with type/name only in the ID", () => {
  const source = fixture(); const result = encodeCurrentPcbCommonRulesAndPrimitives(source.rules, source.presentation);
  assert.deepEqual(result.rows.filter(row => row.dataType === "RULE").map(row => row.id),
    ["SAFE", "OTHER", "CREEPAGE", "TRACK", "NET_LENGTH", "NET_LENGTH_TOLERANCE", "DIFFER_ENTAIL", "BLIND", "RADIUS", "PLANE", "COPPER", "PASTE", "SOLDER", "AUTO_ROUTER"].map(type => JSON.stringify(["RULE", type, "default"])));
  assert.equal(result.rows[0]?.bodyText, '{"name":""}'); assert.equal(result.rows.length, 52);
  assert.equal(ruleText(result, "OTHER"), '{"ruleState":"DEFAULT","ruleContext":{"unit":"mm","deviceClearance":2,"thru2SmdClearance":0,"holeClearance":6.9}}');
  assert.equal(ruleText(result, "CREEPAGE"), '{"ruleState":"DEFAULT","ruleContext":{"unit":"mm","creepageDistance":0,"ignoreLayer":true}}');
  assert.equal(ruleText(result, "NET_LENGTH"), '{"ruleState":"DEFAULT","ruleContext":{"unit":"mm","netLenMin":12.3457,"netLenMax":120}}');
  assert.equal(ruleText(result, "NET_LENGTH_TOLERANCE"), '{"ruleState":"DEFAULT","ruleContext":{"unit":"mm","netLengthTolerance":1.25}}');
  assert.equal(ruleText(result, "RADIUS"), '{"ruleState":"DEFAULT","ruleContext":{"unit":"mm","minRadius":5,"defRadius":10,"maxRadius":100,"minInner":2.5,"defInner":5,"maxInner":50}}');
  assert.equal(runInContext("getterReads+vendorCalls", source.context) as unknown, 0);
  assert.equal(result.executionAuthorized, false); assert.equal(result.nativeNoMutationVerified, false);
});

void test("safe clearance uses raw stride12 triangular matrices and selected reference table", () => {
  const result = encoded(); const raw: unknown = JSON.parse(ruleText(result, "SAFE"));
  assert.ok(raw !== null && typeof raw === "object" && "ruleContext" in raw);
  const expectedContent = Array.from({ length: 13 }, (_, r) => Array.from({ length: Math.min(r + 1, r >= 11 ? r : 12, 12) }, (__, c) => r * 12 + c));
  assert.deepEqual(raw, { ruleState: "DEFAULT", ruleContext: { unit: "mm", isForAll: "ALL", safeSpacing: [{ layerId: 1, isOpen: true, content: expectedContent, columnNames: [] }] } });
  const extra = encoded('rule("safeSpacings").tables.set(2,make("fj",{status:0,_data:Array(156).fill(99)}));');
  assert.equal(ruleText(extra, "SAFE"), ruleText(result, "SAFE")); assert.notEqual(extra.rulesGraphSha256, result.rulesGraphSha256);
  const layered = encoded('rule("safeSpacings")._status=1;rule("safeSpacings").tables.set(2,make("fj",{status:0,_data:Array(156).fill(99)}));');
  assert.match(ruleText(layered, "SAFE"), /"isForAll":"LAYERED"/u); assert.match(ruleText(layered, "SAFE"), /"layerId":2,"isOpen":false/u);
});

void test("layered width/differential/pad contexts preserve each native field order", () => {
  const result = encoded();
  assert.equal(ruleText(result, "TRACK"), '{"ruleState":"DEFAULT","ruleContext":{"unit":"mm","track":{"isOpen":true,"content":[{"layerId":2,"stroMin":5,"stroDef":10,"stroMax":100},{"layerId":1,"stroMin":5,"stroDef":10,"stroMax":100}]}}}');
  assert.equal(ruleText(result, "DIFFER_ENTAIL"), '{"ruleState":"DEFAULT","ruleContext":{"unit":"mm","stroWidth":{"isOpen":true,"content":[{"layerId":1,"stroMin":5,"stroMax":100,"stroDef":10}]},"spacing":{"isOpen":false,"content":[{"layerId":1,"spacMin":5,"spacDef":10}]},"differPairLenTolerMax":5}}');
  assert.match(ruleText(result, "PLANE"), /"mulPad":\{"isOpen":true,"content":\[\{"layerId":1,"connType":"DIVERGENCE","spoSpac":5,"spoWidth":10,"spoAng":45\}\]\}/u);
  assert.match(ruleText(result, "COPPER"), /"track":\{"isOpen":true,"content":\[\{"layerId":1,"connType":"NON_CONNECT"\}\]\}/u);
});

void test("blind, expansion and autorouter rules preserve unitless and sentinel branches", () => {
  const result = encoded();
  assert.equal(ruleText(result, "BLIND"), '{"ruleState":"DEFAULT","ruleContext":{"blinds":{"content":[{"name":"blind","staLayerId":1,"endLayerId":15,"viaSizeRule":"radius"}]}}}');
  assert.equal(ruleText(result, "PASTE"), '{"ruleState":"DEFAULT","ruleContext":{"unit":"mm","padTopExpan":1,"padBotExpan":2,"testPointTopExpan":-1000,"testPointBotExpan":-1000}}');
  assert.equal(ruleText(result, "SOLDER"), '{"ruleState":"DEFAULT","ruleContext":{"unit":"mm","padTopExpan":1,"padBotExpan":2,"viaTopExpan":3,"viaBotExpan":4,"testPointTopExpan":-1000,"testPointBotExpan":-1000}}');
  assert.equal(ruleText(result, "AUTO_ROUTER"), '{"ruleState":"DEFAULT","ruleContext":{"routingCorner":"A90","isKeep":1,"viaQuantity":"MID","routingEffectPriority":"SPEED_FIRST","layers":[1,2,12],"ignoreNets":["GND"]}}');
  const changed = encoded('Object.assign(rule("autoRouters"),{_routingCorner:99,_viaQuatity:99,_routingEffectPriority:99,_isDefault:false});scope.object._Fe.UNIT_NAME="mil";');
  assert.match(ruleText(changed, "AUTO_ROUTER"), /"ruleState":"NORMAL"/u); assert.match(ruleText(changed, "AUTO_ROUTER"), /"routingCorner":"L45","isKeep":1,"viaQuantity":"LESS","routingEffectPriority":"COMPLETION_FIRST"/u);
  assert.match(ruleText(changed, "RADIUS"), /"unit":"mil"/u);
});

void test("rule Map aliases become a Set once, while duplicate record IDs refuse", () => {
  const alias = encoded('owner.radiusPhysics.set("alias",rule("radiusPhysics"));'), first = encoded();
  assert.equal(first.bodySequenceSha256, alias.bodySequenceSha256); assert.notEqual(first.rulesGraphSha256, alias.rulesGraphSha256);
  assert.throws(() => encoded('owner.radiusPhysics.set("other",make("aR",Object.assign({},rule("radiusPhysics"))));'), /colliding native rule ID/u);
  assert.throws(() => encoded('rule("safeSpacings").tables.clear();'), /missing safe reference table/u);
  assert.throws(() => encoded('rule("safeSpacings").tables.get(1)._data.pop();'), /safe matrix storage length/u);
  assert.throws(() => encoded('rule("radiusPhysics")._defaultRadius=1e308;'), /numeric overflow/u);
});

void test("primitive rows use exact fixed roster, missing-filter false and shared copper state", () => {
  const rows = encoded().rows.filter(row => row.dataType === "PRIMITIVE"); assert.equal(rows.length, 37);
  assert.equal(rows[0]?.id, '["PRIMITIVE","ALL"]'); assert.equal(rows.at(-1)?.id, '["PRIMITIVE","FPC_STIFFENER"]');
  assert.equal(rows.find(row => row.id === '["PRIMITIVE","RATLINE"]')?.bodyText, '{"display":false,"pick":false}');
  assert.equal(rows.find(row => row.id === '["PRIMITIVE","TEXT"]')?.bodyText, '{"display":true,"pick":true}');
  for (const name of ["COPPEROUTLINE", "COPPERFILLED"]) { assert.equal(rows.find(row => row.id === JSON.stringify(["PRIMITIVE", name]))?.bodyText, '{"display":false,"pick":true}'); }
  assert.throws(() => encoded('scope.object.zi.manager.map.get(13).type=14;'), /filter identity differs/u);
});

void test("disabled panel encoding preserves nested field order, flags, scaling and vertical override", () => {
  assert.equal(encoded().panelize.bodyText, '{"on":false,"row":1,"column":1,"rowSpacing":1.25,"columnSpacing":2.5,"onlyOutline":true,"horizontalStamp":{"on":false,"stampHoleGroupQuantity":1,"stampHoleDiameter":5.5,"stampHoleQuantityPerGroup":8,"stampHoleSpacing":8.5},"verticalStamp":{"on":true,"stampHoleGroupQuantity":16,"stampHoleDiameter":5.5,"stampHoleQuantityPerGroup":8,"stampHoleSpacing":8.5},"horizontalSize":{"on":false,"sideHeight":60,"positionHoleDiameter":0,"markDiameter":10,"markExpansion":5},"verticalSize":{"on":true,"sideHeight":60,"positionHoleDiameter":0,"markDiameter":10,"markExpansion":5}}');
  const result = encoded('scope.object.ai.model._param.vertical=true;scope.object.ai.model._param.createMark=false;');
  assert.match(result.panelize.bodyText, /"horizontalStamp":\{"on":true,"stampHoleGroupQuantity":16/u);
  assert.match(result.panelize.bodyText, /"horizontalSize":\{"on":true,"sideHeight":60,"positionHoleDiameter":0,"markDiameter":0/u);
});

void test("panel clone needs complete descriptor evidence and refuses unknown executable or nested state", () => {
  assert.throws(() => encoded('Object.defineProperty(scope.object.ai.model._param,"rowSpacing",{enumerable:false});'), /missing rowSpacing/u);
  assert.throws(() => encoded('scope.object.ai.model._param.extra={nested:1};'), /unsupported panel clone member/u);
  assert.throws(() => encoded('Object.defineProperty(scope.object.ai.model._param,"__proto__",{value:null,enumerable:true});'), /unsupported panel clone member/u);
  const source = fixture(); assert.ok(typeof source.presentation.result.value === "string");
  const raw: unknown = JSON.parse(source.presentation.result.value);
  assert.ok(raw !== null && typeof raw === "object" && "graph" in raw && raw.graph !== null && typeof raw.graph === "object" && "nodes" in raw.graph && Array.isArray(raw.graph.nodes));
  for (const node of raw.graph.nodes as unknown[]) { if (node !== null && typeof node === "object" && "enumerableKeys" in node) { Reflect.deleteProperty(node, "enumerableKeys"); } }
  assert.throws(() => encodeCurrentPcbCommonRulesAndPrimitives(source.rules, pcbStringReply(JSON.stringify(raw))), /panel clone descriptor evidence/u);
});

void test("rule/filter public shadows refuse instead of substituting backing fields for native dispatch", () => {
  for (const change of ['rule("radiusPhysics").unit="mil";', 'rule("radiusPhysics").name="shadow";',
    'rule("radiusPhysics").isDefault=false;', 'rule("radiusPhysics").defalutRadius=99;',
    'rule("safeSpacings").toJSON=null;', 'rule("safeSpacings").tables.get(1).data=[];',
    'rule("trackPhysics").tables.get(1).toJSON=null;', 'rule("autoRouters").routingNetPriority=0;',
    'owner.getRuleTemplateName=null;', 'owner.getAll=null;', 'owner.getAllNets=null;',
    'scope.object.zi.manager.getItem=null;', 'scope.object.zi.manager.map.get(13).visible=false;']) {
    assert.throws(() => encoded(change), /own public shadow/u, change);
  }
  const initial = encoded(), unknown = encoded('rule("radiusPhysics").futureBackingField={preserved:true};');
  assert.equal(initial.bodySequenceSha256, unknown.bodySequenceSha256);
  assert.notEqual(initial.rulesGraphSha256, unknown.rulesGraphSha256);
});
