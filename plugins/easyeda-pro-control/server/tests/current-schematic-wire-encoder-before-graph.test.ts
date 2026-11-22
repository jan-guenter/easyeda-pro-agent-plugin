import assert from "node:assert/strict";
import type { Runtime } from "node:inspector";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { z } from "zod";
import {
  decodeCurrentFootprintCopyClockRpcV2Array, decodeCurrentFootprintCopyClockRpcV2ArrayCapture,
} from "../src/current-footprint-copy-clock-rpc-v2-protocol.ts";
import { currentSchematicRelevanceRawHandle, currentSchematicRelevanceRawProperties } from "../src/current-schematic-relevance-action-raw-replies.ts";
import { CurrentSchematicWireEncoderBeforeGraphCursor } from "../src/current-schematic-wire-encoder-before-graph.ts";
import { CURRENT_SCHEMATIC_WIRE_ENCODER_BEFORE_GRAPH_PROGRAM } from "../src/current-schematic-wire-encoder-programs.ts";
import { CURRENT_SCHEMATIC_WIRE_WRITER_FLAGS } from "../src/current-schematic-wire-writer-protocol.ts";

class FixtureModel {
  public uploadTo(): never { throw new Error(`${this.constructor.name} upload must never be called by the binding`); }
}

function graphFixture(): Readonly<{
  order: readonly Readonly<{ id: string }>[];
  before: { sourceMap: Map<string, number> };
  sourceCodeIdMap: Map<string, number>;
  state: { modifyAttempted: boolean };
  holder: readonly object[];
  native: readonly unknown[];
}> {
  const rows = Array.from({ length: 6 }, (_, index) => ({ id: `peer.${String(index)}`, model: new FixtureModel() }));
  const order = rows.toReversed();
  const sourceCodeIdMap = new Map(order.map(row => [row.id, 1]));
  const idMap = new Map<string, object>([
    ...rows.map((row): readonly [string, object] => [row.id, row.model]), ["marker.0", {}], ["marker.1", {}],
  ]);
  const ids = { idMap }, page = { idManager: ids, consistencyImpl: {} };
  const handler = { docManager: page, sourceCodeIdMap };
  const consistency = { decodeAndRealTimeSyncHandler: handler };
  page.consistencyImpl = consistency;
  const binding = { page, consistency, handler, ids, index: idMap };
  const before = { tree: rows, sourceMap: new Map(sourceCodeIdMap) };
  const state = {
    owner: null as object | null, before, after: null, failed: false, modifyAttempted: false,
    modifyAcknowledged: false, saveAttempted: false, saveAcknowledged: false,
  };
  Object.defineProperty(state, "guard", { value: () => true, enumerable: true });
  const holder = [binding, state];
  state.owner = holder;
  const native = [
    Object.getOwnPropertyDescriptor, Object.getOwnPropertyDescriptors, Object.getPrototypeOf, Object.is,
    Object.hasOwn, Reflect.ownKeys, Reflect.apply, Array.isArray,
    // oxlint-disable-next-line typescript/unbound-method -- The actual V5 reflection tuple retains unbound Map methods for explicit receiver checks.
    Map.prototype.get, Map.prototype.has, Map.prototype.forEach, Object.getOwnPropertyDescriptor(Map.prototype, "size")?.get,
    // oxlint-disable-next-line typescript/unbound-method -- The remaining original tuple entries are supplied unchanged to the local Inspector.
    Set.prototype.has, Set.prototype.forEach, Object.getOwnPropertyDescriptor(Set.prototype, "size")?.get,
    Object.prototype, Array.prototype, Map.prototype, Set.prototype,
  ];
  return { order, before, sourceCodeIdMap, state, holder, native };
}

const resultHandle = z.object({ result: z.object({ objectId: z.string() }) });

void test("the read-only Inspector binder retains the original six peers in source-map order", async () => {
  const fixture = graphFixture();
  const session = new Session();
  session.connect();
  const name = "__wireEncoderGraphFixture";
  Object.defineProperty(globalThis, name, { value: fixture, configurable: true });
  try {
    await session.post("Runtime.enable");
    const holder = resultHandle.parse(await session.post("Runtime.evaluate", { expression: `globalThis.${name}.holder` })).result.objectId;
    const native = resultHandle.parse(await session.post("Runtime.evaluate", { expression: `globalThis.${name}.native` })).result.objectId;
    const capture = (): Promise<Runtime.CallFunctionOnReturnType> => session.post("Runtime.callFunctionOn", {
      ...CURRENT_SCHEMATIC_WIRE_WRITER_FLAGS, objectId: holder, functionDeclaration: CURRENT_SCHEMATIC_WIRE_ENCODER_BEFORE_GRAPH_PROGRAM,
      arguments: [{ objectId: native }], awaitPromise: false, userGesture: false, returnByValue: false,
    });
    const tuple = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await capture(), 19);
    const fields = decodeCurrentFootprintCopyClockRpcV2Array(await session.post("Runtime.getProperties", {
      objectId: tuple, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false,
    }), 19);
    const graph = fields.get("0");
    assert.equal(graph?.description, "Array(10)");
    const sourceMap = resultHandle.parse(await session.post("Runtime.evaluate", { expression: `globalThis.${name}.sourceCodeIdMap` })).result.objectId;
    const actualMap = await session.post("Runtime.callFunctionOn", {
      ...CURRENT_SCHEMATIC_WIRE_WRITER_FLAGS, objectId: currentSchematicRelevanceRawHandle(graph, "object"),
      functionDeclaration: "function(map){return this[7]===map}", arguments: [{ objectId: sourceMap }], returnByValue: true,
    });
    assert.equal(actualMap.result.value, true);
    for (const [index, row] of fixture.order.entries()) {
      const offset = 1 + 3 * index;
      const objectId = currentSchematicRelevanceRawHandle(fields.get(String(offset)), "object");
      const own = currentSchematicRelevanceRawProperties(await session.post("Runtime.getProperties", {
        objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false,
      }));
      assert.equal(own.get("id")?.value?.value, row.id);
      assert.equal(fields.get(String(offset + 1))?.type, "object");
      assert.equal(fields.get(String(offset + 2))?.type, "function");
    }

    fixture.state.modifyAttempted = true;
    const changedState = await capture();
    assert.equal(changedState.result.value, "WIRE_ENCODER_BEFORE_GRAPH");
    assert.ok(changedState.exceptionDetails !== undefined);
    fixture.state.modifyAttempted = false;
    fixture.before.sourceMap = fixture.sourceCodeIdMap;
    const replacedSnapshot = await capture();
    assert.equal(replacedSnapshot.result.value, "WIRE_ENCODER_BEFORE_GRAPH");
    assert.ok(replacedSnapshot.exceptionDetails !== undefined);
  } finally {
    Reflect.deleteProperty(globalThis, name);
    session.disconnect();
  }
});

void test("the encoder cursor refuses a copied plan before dispatch and retains the original failed attempt", async () => {
  const pipe = {};
  let exited = false, sent = 0;
  const cursor = new CurrentSchematicWireEncoderBeforeGraphCursor({
    plan: { profile: "private.current-schematic-wire-edit-plan.v1", operationId: "fixture-wire", executionAuthorized: false, saveAuthorized: false },
    source: { schema: "private.schematic-wire-encoder-source-checkpoint.v1", variant: 0, scriptId: "fixture-script",
      sourceQualified: true, originalNativeOwnerJoined: false, executionAuthorized: false },
    holder: "fixture.holder", native: "fixture.native", pipe,
    assertCurrent: (): void => { assert.equal(exited, false); },
    assertOriginalExit: (): void => { assert.equal(exited, true); },
  });
  const transport = Object.freeze({
    pipe, request: (): Promise<unknown> => { sent += 1; return Promise.resolve({}); },
    qualifyHelper: (): Promise<void> => { assert.fail("No helper can be issued by a copied plan"); },
  });
  assert.throws(() => cursor.observe(Object.freeze({ ...transport, pipe: {} })), /WIRE_ENCODER_ORIGINAL_BEFORE_GRAPH/u);
  const attempt = cursor.observe(transport);
  assert.equal(cursor.observe(transport), attempt);
  await assert.rejects(attempt, /SCHEMATIC_WIRE_EDIT_ORIGINAL_PLAN/u);
  assert.equal(sent, 0);
  assert.throws(() => cursor.retireAfterOriginalExit());
  exited = true;
  const retirement = cursor.retireAfterOriginalExit();
  assert.equal(cursor.retireAfterOriginalExit(), retirement);
  await retirement;
  assert.throws(() => cursor.observe(transport), /WIRE_ENCODER_ORIGINAL_BEFORE_GRAPH/u);
});
