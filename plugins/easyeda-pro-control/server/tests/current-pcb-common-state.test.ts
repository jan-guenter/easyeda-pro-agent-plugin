import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { runInContext } from "node:vm";
import { currentPcbCommonGraphSchema } from "../src/current-pcb-common-graph.ts";
import { CURRENT_PCB_COMMON_PREFERENCE_FUNCTION, CURRENT_PCB_COMMON_PRESENTATION_FUNCTION,
  CURRENT_PCB_COMMON_RULES_FUNCTION, decodeCurrentPcbCommonPreference, decodeCurrentPcbCommonPresentation,
  decodeCurrentPcbCommonRules } from "../src/current-pcb-common-state.ts";
import { pcbCommonFixture } from "./helpers/current-pcb-common-fixture.ts";
import { callPcbStringObservation, pcbStringReply } from "./helpers/current-pcb-string-observation-fixture.ts";

function sample(source: string, change = ""): ReturnType<typeof pcbStringReply> {
  return pcbStringReply(callPcbStringObservation(pcbCommonFixture(change), source));
}

void test("common presentation preserves raw signed zero, aliases, disabled parameters and hidden fields", () => {
  const state = decodeCurrentPcbCommonPresentation(sample(CURRENT_PCB_COMMON_PRESENTATION_FUNCTION));
  assert.deepEqual(state.graph.roots.map(root => root[0]), ["canvas", "grid", "layers", "filters", "silk", "panelize"]);
  assert.ok(state.graph.nodes.some(node => node.kind === "object" && node.className === "S" &&
    JSON.stringify(node.fields).includes('["number","-0"]')));
  const layer = state.graph.nodes.find(node => node.kind === "object" && node.className === "WA");
  assert.ok(layer?.kind === "object");
  assert.deepEqual(layer.fields.find(field => field[0] === "_temporaryActiveColor")?.[1], ["undefined"]);
  assert.deepEqual(layer.fields.find(field => field[0] === "_activeColor")?.[1], layer.fields.find(field => field[0] === "deactiveColor")?.[1]);
  assert.equal(state.completeLiveBaselineVerified, false);
  assert.equal(state.storedSourceMatched, false);
  assert.equal(state.executionAuthorized, false);
  assert.equal(Object.isFrozen(state.graph.nodes), true);
});

void test("270 native layer slots fit the bounded raw presentation reply", () => {
  const reply = sample(CURRENT_PCB_COMMON_PRESENTATION_FUNCTION, `
scope.object.Ke.manager.map.clear();for(let i=1;i<=270;i++){
const color=make("ee",{r:i/270,g:0,b:0,alpha:.5}),inactive=make("ee",{r:i/540,g:0,b:0,alpha:.5});
scope.object.Ke.manager.map.set(i,make("WA",{_temporaryActiveColor:undefined,layerId:i,type:"CUSTOM",hashed:i,name:"Custom"+i,status:make("Ff",{state:0}),_activeColor:color,deactiveColor:inactive}));}
`);
  assert.ok(typeof reply.result.value === "string" && Buffer.byteLength(reply.result.value) > 131_072);
  const state = decodeCurrentPcbCommonPresentation(reply);
  assert.equal(state.graph.nodes.filter(node => node.kind === "object" && node.className === "WA").length, 270);
});

void test("rules retain all raw families, nested tables, source order and shared default object", () => {
  const state = decodeCurrentPcbCommonRules(sample(CURRENT_PCB_COMMON_RULES_FUNCTION));
  const rules = state.graph.nodes[0]; assert.ok(rules?.kind === "object");
  assert.equal(rules.className, "te");
  assert.equal(rules.fields.filter(field => field[0].endsWith("Physics")).length, 6);
  assert.ok(state.graph.nodes.some(node => node.kind === "object" && node.className === "fj"));
  assert.ok(state.graph.nodes.some(node => node.kind === "object" && node.className === "E8"));
  assert.equal(state.graph.nodes.filter(node => node.kind === "object" && node.className === "xI").length, 1);
  assert.deepEqual(state.graph.roots[1], ["ruleUnit", ["string", "mm"]]);
  assert.equal(state.schema, "easyeda-pro-control.pcb-common-rules.v2");
  assert.equal(state.saveAuthorized, false);
});

void test("every empty selector and cached net participant refuses before raw output", () => {
  for (const name of ["nets", "netClass", "netDifferentials", "regionSelectors", "equalLengthGroups", "padsPairGroups", "cacheNetModel"]) {
    assert.throws(() => sample(CURRENT_PCB_COMMON_RULES_FUNCTION, `scope.object.te.manager.${name}.set("hidden",{});`), /PCB_COMMON_STATE/u);
  }
  for (const name of ["rule", "cacheRuleMap"]) {
    assert.throws(() => sample(CURRENT_PCB_COMMON_RULES_FUNCTION, `scope.object.te.manager.betweenNetRule.${name}.push({});`), /PCB_COMMON_STATE/u);
  }
  assert.throws(() => sample(CURRENT_PCB_COMMON_RULES_FUNCTION, "delete scope.object.te.manager.trackPhysics;"), /PCB_COMMON_STATE/u);
});

void test("fixed raw common readers pass V8 side-effect checks over synthetic original scopes", async () => {
  const session = new Session(); session.connect();
  let uniqueContextId = "";
  session.on("Runtime.executionContextCreated", ({ params }): void => {
    if (params.context.name === "pcb-string-observation-synthetic" &&
        "uniqueId" in params.context && typeof params.context.uniqueId === "string") { uniqueContextId = params.context.uniqueId; }
  });
  try {
    await session.post("Runtime.enable");
    for (const [source, decode] of [
      [CURRENT_PCB_COMMON_PRESENTATION_FUNCTION, decodeCurrentPcbCommonPresentation],
      [CURRENT_PCB_COMMON_RULES_FUNCTION, decodeCurrentPcbCommonRules],
      [CURRENT_PCB_COMMON_PREFERENCE_FUNCTION, decodeCurrentPcbCommonPreference],
    ] as const) {
      const context = pcbCommonFixture();
      assert.notEqual(uniqueContextId, "");
      const expression = `(${source}).call(scope,MSG_BUS_PCB.messageBus.subscribed["pcb/saveCompiler"][0].callback)`;
      const parameters = { expression, uniqueContextId, returnByValue: true, throwOnSideEffect: true, silent: true,
        awaitPromise: false, includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false,
        userGesture: false, generatePreview: false, timeout: 1000 };
      // Node's declaration lacks uniqueContextId and chooses the void overload.
      const observed = await (session.post("Runtime.evaluate", parameters) as Promise<unknown>);
      decode(observed);
      runInContext('scope.object.x.env=new Proxy(scope.object.x.env,{getOwnPropertyDescriptor(o,k){getterReads++;return Reflect.getOwnPropertyDescriptor(o,k);}});', context);
      const refused = await (session.post("Runtime.evaluate", parameters) as Promise<unknown>);
      assert.throws(() => decode(refused), /PCB_COMMON_GRAPH_REPLY/u);
      assert.equal(runInContext("getterReads+vendorCalls", context) as unknown, 0);
    }
  } finally { session.disconnect(); }
});

void test("preferences retain lazy width fallback inputs without invoking vendor getters", () => {
  const context = pcbCommonFixture('Object.defineProperty(scope.object.Yme.prototype,"prevTrackWidth",{get(){getterReads++;this._prevTrackWidth=1;return 1;}});');
  const state = decodeCurrentPcbCommonPreference(pcbStringReply(callPcbStringObservation(context, CURRENT_PCB_COMMON_PREFERENCE_FUNCTION)));
  assert.ok(state.graph.nodes.some(node => node.kind === "object" &&
    node.fields.some(field => field[0] === "_prevTrackWidth" && field[1][0] === "null")));
  assert.equal(runInContext("scope.object.Me._prevTrackWidth", context) as unknown, null);
  assert.equal(runInContext("getterReads+vendorCalls", context) as unknown, 0);
});

void test("common graph refuses accessors, unknown prototypes, sparse arrays and nonfinite values", () => {
  for (const change of [
    'Object.defineProperty(scope.object.Ke.manager,"hidden",{get(){getterReads++;return 1;}});',
    'scope.object.Ke.manager.extra=new Date();',
    'scope.object.Ke.manager.extra=[,1];',
    'scope.object.Ke.manager.extra=NaN;',
    'scope.object.Ke.manager.extra=Infinity;',
    'scope.object.Ke.manager.extra=()=>{};',
    String.raw`scope.object.Ke.manager.extra="\uD800";`,
    'scope.object.Ke.manager.extra="x".repeat(4097);',
    'scope.object.Ke.manager.map=new(class extends Map{})();',
    'scope.object.Ke.manager[Symbol("hidden")]=1;',
    'scope.object.ai.model._param.on=true;',
    'scope.object.ai.model._param.success=true;',
    'scope.object.x.env._doctype=4;',
  ]) { assert.throws(() => sample(CURRENT_PCB_COMMON_PRESENTATION_FUNCTION, change), /PCB_COMMON_STATE/u, change); }
});

void test("common graph retains unknown inert own data and cycles rather than dropping it", () => {
  const state = decodeCurrentPcbCommonRules(sample(CURRENT_PCB_COMMON_RULES_FUNCTION,
    'scope.object.te.manager.extra={};scope.object.te.manager.extra.self=scope.object.te.manager.extra;'));
  assert.ok(state.graph.nodes.some((node, index) => node.kind === "object" &&
    node.fields.some(field => field[0] === "self" && field[1][0] === "ref" && field[1][1] === index)));
});

void test("graph decoder rejects unreachable or dangling nodes, duplicate keys and noncanonical numbers", () => {
  for (const graph of [
    { roots: [["x", ["ref", 1]]], nodes: [] },
    { roots: [["x", ["null"]]], nodes: [{ kind: "object", className: "plain", fields: [] }] },
    { roots: [["x", ["null"]], ["x", ["null"]]], nodes: [] },
    { roots: [["x", ["number", "01"]]], nodes: [] },
    { roots: [["x", ["number", "NaN"]]], nodes: [] },
    { roots: [["x", ["ref", 0]]], nodes: [{ kind: "object", className: "plain", fields: [["a", ["null"]], ["a", ["null"]]] }] },
    { roots: [["x", ["ref", 0]]], nodes: [{ kind: "map", entries: [[["string", "a"], ["null"]], [["string", "a"], ["null"]]] }] },
    { roots: [["x", ["ref", 0]]], nodes: [{ kind: "map", entries: [[["number", "-0"], ["null"]]] }] },
    { roots: [["x", ["ref", 0]]], nodes: [{ kind: "set", values: [["number", "0"], ["number", "-0"]] }] },
  ]) { assert.equal(currentPcbCommonGraphSchema.safeParse(graph).success, false); }
});

void test("decoder requires every fixed pick field and initialized map across all roots", () => {
  for (const [source, decode, names] of [
    [CURRENT_PCB_COMMON_PRESENTATION_FUNCTION, decodeCurrentPcbCommonPresentation,
      ["_unit", "_stepX", "_topBoardColor", "activeLayer", "_deactiveAlpha"]],
    [CURRENT_PCB_COMMON_PREFERENCE_FUNCTION, decodeCurrentPcbCommonPreference,
      ["_startTrackWidth", "_prevTrackWidth", "innerRadius", "_mode", "minimumTrackCorners", "layerPreference"]],
  ] as const) {
    const original = decode(sample(source));
    for (const name of names) {
      const graph = structuredClone(original.graph);
      const node = graph.nodes.find(item => item.kind === "object" && item.fields.some(field => field[0] === name));
      assert.ok(node?.kind === "object");
      node.fields = node.fields.filter(field => field[0] !== name);
      if (node.enumerableKeys !== undefined) { node.enumerableKeys = node.enumerableKeys.filter(key => key !== name); }
      const malformed = JSON.stringify({ schema: original.schema, documentUuid: original.documentUuid, pickedOwnerPublicShadowsAbsent: true, graph });
      assert.throws(() => decode(pcbStringReply(malformed)), /PCB_COMMON_GRAPH_REPLY/u, name);
    }
    for (const [name, value] of original.graph.roots) {
      assert.equal(value[0], "ref");
      if (value[0] !== "ref") { throw new Error("Fixture root"); }
      const graph = structuredClone(original.graph), node = graph.nodes[value[1]];
      assert.ok(node?.kind === "object");
      node.fields = [];
      if (node.enumerableKeys !== undefined) { node.enumerableKeys = []; }
      const malformed = JSON.stringify({ schema: original.schema, documentUuid: original.documentUuid, pickedOwnerPublicShadowsAbsent: true, graph });
      assert.throws(() => decode(pcbStringReply(malformed)), /PCB_COMMON_GRAPH_REPLY/u, name);
    }
  }
});

void test("common decoder rejects reply tricks, duplicate JSON keys, malformed Unicode and invented authority", () => {
  const reply = sample(CURRENT_PCB_COMMON_RULES_FUNCTION);
  const raw = reply.result.value;
  assert.ok(typeof raw === "string");
  for (const value of [
    raw.replace('"documentUuid":', '"executionAuthorized":true,"documentUuid":'),
    raw.replace('"graph":', '"graph":{},"graph":'),
    raw.replace('"rules"', '"wrong"'),
    raw.replace('"rules"', String.raw`"\ud800"`),
  ]) { assert.throws(() => decodeCurrentPcbCommonRules(pcbStringReply(value)), /PCB_COMMON_GRAPH_REPLY/u); }
  assert.throws(() => decodeCurrentPcbCommonRules({ result: { type: "string", value: raw, objectId: "fake" } }), /PCB_COMMON_GRAPH_REPLY/u);
  assert.throws(() => decodeCurrentPcbCommonRules(new Proxy(reply, {})), /PCB_COMMON_GRAPH_REPLY/u);
  assert.throws(() => decodeCurrentPcbCommonRules(pcbStringReply(" ".repeat(524_289))), /PCB_COMMON_GRAPH_REPLY/u);
});

void test("picked owners refuse public getter/method shadows without invoking them; old evidence is not inferred", () => {
  for (const [source, target, key] of [
    [CURRENT_PCB_COMMON_PRESENTATION_FUNCTION, "scope.object.x.env", "origin"],
    [CURRENT_PCB_COMMON_PRESENTATION_FUNCTION, "scope.object.At.ins", "getGridX"],
    [CURRENT_PCB_COMMON_PRESENTATION_FUNCTION, "scope.object.At.ins.param", "getSnapY"],
    [CURRENT_PCB_COMMON_PRESENTATION_FUNCTION, "scope.object.Me", "topBoardColor"],
    [CURRENT_PCB_COMMON_PRESENTATION_FUNCTION, "scope.object.ai.model", "getDefaultPanelize"],
    [CURRENT_PCB_COMMON_PREFERENCE_FUNCTION, "scope.object.ce.pcbConfig", "startTrackWidth"],
    [CURRENT_PCB_COMMON_PREFERENCE_FUNCTION, "scope.object.Me", "prevTrackWidth"],
    [CURRENT_PCB_COMMON_PREFERENCE_FUNCTION, "scope.object.nr.instance", "mode"],
    [CURRENT_PCB_COMMON_PREFERENCE_FUNCTION, "scope.object.ha.instance", "trackMinCorner"],
    [CURRENT_PCB_COMMON_PREFERENCE_FUNCTION, "scope.object.pl.instance", "getTrackMinCorner"],
  ] as const) {
    const context = pcbCommonFixture(`Object.defineProperty(${target},${JSON.stringify(key)},{get(){getterReads++;throw new Error("NO_GETTER");}});`);
    assert.throws(() => callPcbStringObservation(context, source), /PCB_COMMON_STATE/u, key);
    assert.equal(runInContext("getterReads+vendorCalls", context) as unknown, 0);
  }
  for (const [source, decode] of [[CURRENT_PCB_COMMON_PRESENTATION_FUNCTION, decodeCurrentPcbCommonPresentation],
    [CURRENT_PCB_COMMON_PREFERENCE_FUNCTION, decodeCurrentPcbCommonPreference]] as const) {
    const reply = sample(source); const raw = reply.result.value; assert.ok(typeof raw === "string");
    assert.throws(() => decode(pcbStringReply(raw.replace(',"pickedOwnerPublicShadowsAbsent":true', ""))), /PCB_COMMON_GRAPH_REPLY/u);
    assert.throws(() => decode(pcbStringReply(raw.replace(".v2", ".v1"))), /PCB_COMMON_GRAPH_REPLY/u);
  }
});
