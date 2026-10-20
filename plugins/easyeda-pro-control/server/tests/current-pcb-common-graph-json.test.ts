import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { runInContext } from "node:vm";
import { currentPcbCommonGraphSchema } from "../src/current-pcb-common-graph.ts";
import { CURRENT_PCB_COMMON_PRESENTATION_FUNCTION, decodeCurrentPcbCommonPresentation } from "../src/current-pcb-common-state.ts";
import { pcbCommonFixture } from "./helpers/current-pcb-common-fixture.ts";
import { callPcbStringObservation, pcbStringReply } from "./helpers/current-pcb-string-observation-fixture.ts";

function sample(change = ""): ReturnType<typeof decodeCurrentPcbCommonPresentation> {
  const context = pcbCommonFixture(change);
  return decodeCurrentPcbCommonPresentation(pcbStringReply(callPcbStringObservation(context, CURRENT_PCB_COMMON_PRESENTATION_FUNCTION)));
}

void test("common graph captures exact enumeration without dropping non-enumerable values", () => {
  const result = sample(`const extra=Object.create(null);
Object.defineProperties(extra,{first:{value:1,enumerable:true},hidden:{value:undefined},last:{value:"last",enumerable:true}});
scope.object.Ke.manager.extra=extra;const array=[1,2];Object.defineProperty(array,"0",{enumerable:false});scope.object.Ke.manager.array=array;`);
  const node = result.graph.nodes.find(item => item.kind === "object" && item.fields.some(field => field[0] === "hidden"));
  assert.ok(node?.kind === "object"); assert.equal(node.className, "null");
  assert.deepEqual(node.fields, [["first", ["number", "1"]], ["hidden", ["undefined"]], ["last", ["string", "last"]]]);
  assert.deepEqual(node.enumerableKeys, ["first", "last"]); assert.equal(node.jsonToJSONAbsent, true);
  const array = result.graph.nodes.find(item => item.kind === "array" && item.values.length === 2);
  assert.ok(array?.kind === "array"); assert.deepEqual(array.values, [["number", "1"], ["number", "2"]]);
  assert.equal(array.jsonToJSONAbsent, true); assert.equal(result.nativeIntrinsicsVerified, false);
});

void test("common graph records inherited serializer presence without calling the getter", () => {
  const context = pcbCommonFixture('Object.defineProperty(scope.object.S.prototype,"toJSON",{get(){getterReads++;throw new Error("NO_GETTER");}});');
  const result = decodeCurrentPcbCommonPresentation(pcbStringReply(callPcbStringObservation(context, CURRENT_PCB_COMMON_PRESENTATION_FUNCTION)));
  const point = result.graph.nodes.find(item => item.kind === "object" && item.className === "S");
  assert.ok(point?.kind === "object"); assert.equal(point.jsonToJSONAbsent, false);
  assert.equal(runInContext("getterReads+vendorCalls", context) as unknown, 0);
  const own = sample('scope.object.Ke.manager.extra={toJSON:null};');
  const shadow = own.graph.nodes.find(item => item.kind === "object" && item.fields.some(field => field[0] === "toJSON"));
  assert.ok(shadow?.kind === "object"); assert.equal(shadow.jsonToJSONAbsent, false);
});

void test("older supplied graphs remain decodable without inferred enumeration or serializer absence", () => {
  const original = sample().graph;
  const legacy = { roots: original.roots, nodes: original.nodes.map(node => {
    if (node.kind === "object") { return { kind: node.kind, className: node.className, fields: node.fields }; }
    if (node.kind === "array") { return { kind: node.kind, values: node.values }; }
    return node;
  }) };
  const parsed = currentPcbCommonGraphSchema.parse(legacy);
  for (const node of parsed.nodes) {
    assert.ok(!Object.hasOwn(node, "enumerableKeys")); assert.ok(!Object.hasOwn(node, "jsonToJSONAbsent"));
  }
});

void test("graph decoder rejects duplicate, unordered, unknown and contradictory metadata", () => {
  const fields = [["first", ["number", "1"]], ["hidden", ["undefined"]], ["last", ["string", "last"]]];
  const graph = (metadata: Record<string, unknown>): unknown => ({ roots: [["item", ["ref", 0]]],
    nodes: [{ kind: "object", className: "plain", fields, ...metadata }] });
  for (const metadata of [
    { enumerableKeys: ["last", "first"] }, { enumerableKeys: ["first", "first"] }, { enumerableKeys: ["missing"] },
    { enumerableKeys: [1] }, { jsonToJSONAbsent: "true" }, { jsonToJSONAbsent: null }, { arbitrary: true },
  ]) { assert.equal(currentPcbCommonGraphSchema.safeParse(graph(metadata)).success, false); }
  assert.equal(currentPcbCommonGraphSchema.safeParse(graph({ enumerableKeys: [], jsonToJSONAbsent: true })).success, true);
  assert.equal(currentPcbCommonGraphSchema.safeParse({ roots: [["item", ["ref", 0]]], nodes: [{ kind: "object", className: "plain",
    fields: [["toJSON", ["null"]]], enumerableKeys: ["toJSON"], jsonToJSONAbsent: true }] }).success, false);
  assert.equal(currentPcbCommonGraphSchema.safeParse({ roots: [["item", ["ref", 0]]], nodes: [{ kind: "array", values: [],
    jsonToJSONAbsent: true, enumerableKeys: [] }] }).success, false);
});

void test("toJSON prototype walks refuse excessive depth", () => {
  assert.throws(() => sample('let prototype=null;for(let i=0;i<17;i++)prototype=Object.create(prototype);Object.setPrototypeOf(scope.object.S.prototype,prototype);'), /PCB_COMMON_STATE/u);
});

void test("serializer prototype exclusion and Proxy checks run under V8 without invoking code", async () => {
  const session = new Session(); session.connect(); let uniqueContextId = "";
  session.on("Runtime.executionContextCreated", ({ params }): void => {
    if (params.context.name === "pcb-string-observation-synthetic" &&
      "uniqueId" in params.context && typeof params.context.uniqueId === "string") { uniqueContextId = params.context.uniqueId; }
  });
  try {
    await session.post("Runtime.enable");
    for (const change of [
      'Object.defineProperty(Object.prototype,"toJSON",{get(){getterReads++;throw new Error("NO_GETTER");}});',
      'Object.defineProperty(Array.prototype,"toJSON",{get(){getterReads++;throw new Error("NO_GETTER");}});',
      'Object.setPrototypeOf(scope.object.S.prototype,new Proxy(Object.prototype,{getOwnPropertyDescriptor(o,k){getterReads++;return Reflect.getOwnPropertyDescriptor(o,k);}}));',
    ]) {
      const context = pcbCommonFixture(change); assert.notEqual(uniqueContextId, "");
      const expression = `(${CURRENT_PCB_COMMON_PRESENTATION_FUNCTION}).call(scope,MSG_BUS_PCB.messageBus.subscribed["pcb/saveCompiler"][0].callback,globalThis.producerConstructors)`;
      const parameters = { expression, uniqueContextId, returnByValue: true, throwOnSideEffect: true, silent: true,
        awaitPromise: false, includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false,
        userGesture: false, generatePreview: false, timeout: 1000 };
      // Node does not declare uniqueContextId and selects its void overload.
      const refused = await (session.post("Runtime.evaluate", parameters) as Promise<unknown>);
      assert.throws(() => decodeCurrentPcbCommonPresentation(refused), /PCB_COMMON_GRAPH_REPLY/u);
      assert.equal(runInContext("getterReads+vendorCalls", context) as unknown, 0);
    }
  } finally { session.disconnect(); }
});
