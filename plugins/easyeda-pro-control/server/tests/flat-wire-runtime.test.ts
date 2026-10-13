/* oxlint-disable import/max-dependencies -- Exercise the real source, graph, wire, marker, coordinator and Save generators against one isolated synthetic editor. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { sha256Json } from "../src/core.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import { prepareDesignActionCooperatively } from "../src/design-action.ts";
import { buildSchematicNativeWireAdapter } from "../src/schematic-native-wire.ts";
import { prepareFlatWireProfile } from "../src/flat-wire-profile.ts";
import { buildExactReadExpression } from "../src/exact-readers.ts";
import { buildSaveReopenCode } from "../src/runtime-scripts.ts";
import type { FlatDisplayRuntimeGuard } from "../src/flat-display-runtime.ts";
import { context } from "./flat-display-fixture.ts";
import { branchWireOperation, flatWireBranchFixture, flatWireFixture, wireAfter, wireOperation } from "./flat-wire-fixture.ts";
import { wireRuntimeFixture } from "./flat-wire-runtime-fixture.ts";

function execute(expression: string, runtime: object): Promise<unknown> {
  const result: unknown = runInNewContext(expression, runtime); return Promise.resolve(result);
}
// oxlint-disable-next-line typescript/explicit-function-return-type -- Local fixture binds exact builder output without duplicating its maintained types.
async function preparedFixture() {
  const before = flatWireFixture(), prepared = await prepareFlatWireProfile({ ...before, context, operation: wireOperation });
  const guard: FlatDisplayRuntimeGuard = { binding: prepared.binding, operation: wireOperation, context,
    observation: before.evidence.observation, phase: "before" };
  const adapter = buildSchematicNativeWireAdapter(wireOperation, parseDocumentSource(before.native.source), before.native, guard);
  return { before, prepared, guard, adapter };
}
void test("flat wire generated action preserves IDs and runs exactly one fixed setLines action", async () => {
  const { before, prepared, guard, adapter } = await preparedFixture(), scene = wireRuntimeFixture(before);
  assert.deepEqual(structuredClone(await execute(adapter.expression, scene.runtime)), { primitiveId: "wire" });
  assert.deepEqual(scene.calls, ["action", "setLines"]);
  assert.deepEqual(parseDocumentSource(scene.source.raw), prepared.expectedSource);
  assert.equal(scene.source.written, "");
  for (const forbidden of ["eda.sch_PrimitiveWire.modify", "setSourceCode(source)", "saveAllFiles", "getSchPinNetlist"]) {
    assert.ok(!adapter.expression.includes(forbidden));
  }
  const integrated = await prepareDesignActionCooperatively(wireOperation, { source: parseDocumentSource(before.native.source), schematic: before.native }, { targetId: "wire" }, guard);
  assert.ok(integrated.code.includes(adapter.expression));
});
void test("flat wire final owned callback refuses contact, receiver, method and identity drift", async () => {
  const { before, adapter } = await preparedFixture();
  for (const kind of ["contact", "method", "receiver", "source", "foreign-action"] as const) {
    const scene = wireRuntimeFixture(before);
    scene.hooks.start = (): void => {
      if (kind === "contact") { scene.contacts.get("[0,0]")?.Pin.clear(); }
      else if (kind === "method") { scene.wire.setLines = (): void => { scene.calls.push("foreign"); }; }
      else if (kind === "receiver") { scene.document.shapeManager = { ...scene.shapes }; }
      else if (kind === "source") { scene.source.raw = scene.source.raw.replace("Heading", "Unrequested"); }
      else { scene.runner.currentAction = { status: "running" }; }
    };
    await assert.rejects(execute(adapter.expression, scene.runtime), /FLAT_|BASELINE_CHANGED/u);
    assert.deepEqual(scene.calls, ["action"], kind); assert.equal(scene.source.written, "");
  }
});
void test("flat wire keeps the original inverse exact and refuses repeat/foreign callbacks", async () => {
  const { before, prepared, guard } = await preparedFixture();
  const after = wireAfter(before, prepared.expectedSource, prepared.expectedNative);
  const inverseGuard: FlatDisplayRuntimeGuard = { ...guard, observation: after.evidence.observation, phase: "after" };
  const inverse = buildSchematicNativeWireAdapter(prepared.inverse, prepared.expectedSource, after.native, inverseGuard), scene = wireRuntimeFixture(after);
  await execute(inverse.expression, scene.runtime); assert.deepEqual(parseDocumentSource(scene.source.raw), parseDocumentSource(before.native.source));
  assert.deepEqual(scene.calls, ["action", "setLines"]);
  assert.throws(() => buildSchematicNativeWireAdapter(wireOperation, prepared.expectedSource, after.native, inverseGuard), /inverse/u);
});

void test("flat wire rejects every generated-marker namespace contradiction before mutation", async () => {
  const { before, adapter } = await preparedFixture();
  for (const kind of ["coordinate", "radius", "node", "parent", "global-set", "group-set", "line-index", "unknown-extra", "source-collision", "lazy-getter", "foreign-index", "wrong-kind-index", "index-accessor"] as const) {
    const scene = wireRuntimeFixture(before);
    const marker = scene.wire.children.find((entry) => Reflect.get(entry, "modelType") === "UnConnectDot"); assert.ok(marker);
    if (kind === "coordinate") { Reflect.set(marker, "cx", 21); }
    else if (kind === "radius") { Reflect.set(marker, "r", 2); }
    else if (kind === "node") { Reflect.set(marker, "connectionPointNode", {}); }
    else if (kind === "parent") { Reflect.set(marker, "parent", {}); }
    else if (kind === "global-set") { Reflect.set(scene.shapes.netPointManager, "unConnectDotModels", new Set()); }
    else if (kind === "group-set") { Reflect.set(scene.wire, "_unConnectDotModels", new Set()); }
    else if (kind === "line-index") { Reflect.set(scene.shapes.netPointManager, "netGroupLineUnConnectDotIdMap", {}); }
    else if (kind === "unknown-extra") { scene.wire.children.push({ ...marker, id: "extra" }); }
    else if (kind === "source-collision") { Reflect.set(marker, "id", "line0"); }
    else if (kind === "lazy-getter") { Object.defineProperty(scene.wire, "_unConnectDotModels", { get: (): never => { throw new Error("LAZY_GETTER_MUST_NOT_RUN"); } }); }
    else {
      const map: unknown = Reflect.get(scene.shapes.netPointManager, kind === "wrong-kind-index" ? "netGroupLineJunctionIdMap" : "netGroupLineUnConnectDotIdMap");
      assert.ok(typeof map === "object" && map !== null);
      if (kind === "index-accessor") { Object.defineProperty(map, "foreign", { get: (): never => { throw new Error("INDEX_GETTER_MUST_NOT_RUN"); } }); }
      else { Reflect.set(map, "foreign", new Set([Reflect.get(marker, "id")])); }
    }
    await assert.rejects(execute(adapter.expression, scene.runtime), /FLAT_WIRE_MARKER_OR_RECEIVER_DRIFT/u, kind);
    assert.deepEqual(scene.calls, []); assert.equal(scene.source.written, "");
  }
});

void test("flat wire verifies generated marker post-effect and awaited action completion", async () => {
  const { before, adapter } = await preparedFixture();
  const scene = wireRuntimeFixture(before);
  const original = scene.update;
  Reflect.set(scene.shapes, "bboxMonitor", { update: (): void => {
    original(); const marker = scene.wire.children.find((entry) => Reflect.get(entry, "modelType") === "UnConnectDot"); assert.ok(marker);
    Reflect.set(marker, "r", 4);
  } });
  await assert.rejects(execute(adapter.expression, scene.runtime), /FLAT_WIRE_MARKER_OR_RECEIVER_DRIFT/u);
  assert.deepEqual(scene.calls, ["action", "setLines"]); assert.equal(scene.source.written, "");
});

void test("flat wire Save checks exact contact/marker/method state after final awaited context", async () => {
  const { before, prepared, guard } = await preparedFixture();
  const after = wireAfter(before, prepared.expectedSource, prepared.expectedNative), reference = wireRuntimeFixture(after);
  const request = { kind: "schematic-source" };
  const payload = await execute(buildExactReadExpression(request), reference.runtime);
  const code = buildSaveReopenCode(context, [{ request, expectedSnapshotSha256: sha256Json(payload) }],
    { ...guard, observation: after.evidence.observation, phase: "after" });
  for (const kind of ["clean", "contact", "marker", "method", "busy"] as const) {
    const scene = wireRuntimeFixture(after);
    scene.hooks.context = (): void => {
      if (kind === "contact") { scene.contacts.get("[0,0]")?.Pin.clear(); }
      else if (kind === "marker") { Reflect.set(scene.wire, "_unConnectDotModels", new Set()); }
      else if (kind === "method") { scene.wire.setLines = (): void => undefined; }
      else if (kind === "busy") { scene.runner.currentAction = { status: "running" }; }
    };
    await assert.rejects(execute(`(async()=>{${code}})()`, scene.runtime), kind === "clean" ? /TEST_SAVE_BOUNDARY/u : /FLAT_|SHAPES/u);
    assert.deepEqual(scene.calls, kind === "clean" ? ["save"] : []);
  }
});

void test("flat wire moves a wire-only junction with exact generated set and LINE-index parity", async () => {
  const before = flatWireBranchFixture(), prepared = await prepareFlatWireProfile({ ...before, context, operation: branchWireOperation });
  const guard: FlatDisplayRuntimeGuard = { binding: prepared.binding, operation: branchWireOperation, context,
    observation: before.evidence.observation, phase: "before" };
  const adapter = buildSchematicNativeWireAdapter(branchWireOperation, parseDocumentSource(before.native.source), before.native, guard);
  const scene = wireRuntimeFixture(before);
  await execute(adapter.expression, scene.runtime);
  const junctions = scene.wire.children.filter((entry) => Reflect.get(entry, "modelType") === "Junction");
  assert.equal(junctions.length, 1); const junction = junctions[0]; assert.ok(junction);
  assert.equal(Reflect.get(junction, "cx"), 15); assert.equal(Reflect.get(junction, "cy"), 0);
  assert.deepEqual(parseDocumentSource(scene.source.raw), prepared.expectedSource); assert.deepEqual(scene.calls, ["action", "setLines"]);
  for (const key of ["_junctionModels", "_unConnectDotModels"] as const) {
    const corrupt = wireRuntimeFixture(before); Reflect.set(corrupt.wire, key, new Set());
    await assert.rejects(execute(adapter.expression, corrupt.runtime), /FLAT_WIRE_MARKER/u); assert.deepEqual(corrupt.calls, []);
  }
});
