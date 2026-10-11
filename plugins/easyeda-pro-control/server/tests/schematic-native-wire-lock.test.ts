import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { parseDocumentSource } from "../src/document-source.ts";
import { buildSchematicNativeWireAdapter } from "../src/schematic-native-wire.ts";
import { prepareFlatWireProfile } from "../src/flat-wire-profile.ts";
import type { FlatDisplayRuntimeGuard } from "../src/flat-display-runtime.ts";
import { context, encode } from "./flat-display-fixture.ts";
import { flatWireFixture, wireAfter, wireOperation } from "./flat-wire-fixture.ts";
import { wireRuntimeFixture } from "./flat-wire-runtime-fixture.ts";

type LockMode = "omitted" | "false";
function lockFixture(mode: LockMode): ReturnType<typeof flatWireFixture> {
  const before = flatWireFixture(), source = parseDocumentSource(before.native.source);
  const group = source.objects.find((row) => row.id === "wire"); assert.ok(group);
  const observed = before.evidence.observation.pages[0]?.wires[0]; assert.ok(observed);
  for (const body of [group.body, observed.body]) {
    if (mode === "omitted") { Reflect.deleteProperty(body, "locked"); }
    else { body["locked"] = false; }
  }
  const encoded = encode(source.objects);
  return wireAfter(before, parseDocumentSource(encoded), { ...before.native, source: encoded });
}
function execute(expression: string, runtime: object): Promise<unknown> {
  const result: unknown = runInNewContext(expression, runtime); return Promise.resolve(result);
}
// oxlint-disable-next-line typescript/explicit-function-return-type -- Keep the maintained sealed binding and adapter types inferred.
async function preparedFixture(mode: LockMode) {
  const before = lockFixture(mode), prepared = await prepareFlatWireProfile({ ...before, context, operation: wireOperation });
  const guard: FlatDisplayRuntimeGuard = { binding: prepared.binding, operation: wireOperation, context,
    observation: before.evidence.observation, phase: "before" };
  const adapter = buildSchematicNativeWireAdapter(wireOperation, parseDocumentSource(before.native.source), before.native, guard);
  return { before, prepared, guard, adapter };
}

for (const mode of ["omitted", "false"] as const) {
  void test(`native wire preserves the producer's ${mode} unlocked representation in forward and inverse actions`, async () => {
    const { before, prepared, guard, adapter } = await preparedFixture(mode), scene = wireRuntimeFixture(before);
    const original = structuredClone(before), source = parseDocumentSource(before.native.source);
    const group = source.objects.find((row) => row.id === "wire"); assert.ok(group);
    assert.equal(Object.hasOwn(group.body, "locked"), mode === "false");
    assert.equal(scene.wire.locked, mode === "false" ? false : undefined);
    assert.equal(JSON.stringify(scene.wire.getConsistencyData()), JSON.stringify(group.body));
    assert.deepEqual(structuredClone(await execute(adapter.expression, scene.runtime)), { primitiveId: "wire" });
    assert.deepEqual(scene.calls, ["action", "setLines"]); assert.equal(scene.source.written, "");
    const actual = parseDocumentSource(scene.source.raw);
    assert.deepEqual(actual, prepared.expectedSource);
    assert.deepEqual(actual.objects.filter((row) => row.type !== "LINE"), source.objects.filter((row) => row.type !== "LINE"));
    assert.deepEqual(before, original);
    const after = wireAfter(before, prepared.expectedSource, prepared.expectedNative);
    const inverseGuard: FlatDisplayRuntimeGuard = { ...guard, observation: after.evidence.observation, phase: "after" };
    const inverse = buildSchematicNativeWireAdapter(prepared.inverse, prepared.expectedSource, after.native, inverseGuard);
    const inverseScene = wireRuntimeFixture(after);
    await execute(inverse.expression, inverseScene.runtime);
    assert.deepEqual(parseDocumentSource(inverseScene.source.raw), source);
    assert.deepEqual(inverseScene.calls, ["action", "setLines"]); assert.equal(inverseScene.source.written, "");
  });

  void test(`native wire refuses ${mode} lock representation drift at both pre-mutation boundaries`, async () => {
    const { before, adapter } = await preparedFixture(mode);
    const changes: unknown[] = [mode === "omitted" ? false : undefined, true, null, 0, "false"];
    for (const insideAction of [false, true]) {
      for (const locked of changes) {
        const scene = wireRuntimeFixture(before);
        const drift = (): void => { Reflect.set(scene.wire, "locked", locked); };
        if (insideAction) { scene.hooks.start = drift; } else { drift(); }
        await assert.rejects(execute(adapter.expression, scene.runtime), /SCH_WIRE_TARGET_CHANGED|FLAT_/u);
        assert.deepEqual(scene.calls, insideAction ? ["action"] : []);
        assert.equal(scene.source.written, "");
      }
    }
  });

  void test(`native wire does not claim success after ${mode} lock representation changes during the native action`, async () => {
    const { before, adapter } = await preparedFixture(mode), scene = wireRuntimeFixture(before);
    const update = scene.update;
    Reflect.set(scene.shapes, "bboxMonitor", { update: (): void => { update(); Reflect.set(scene.wire, "locked", mode === "omitted" ? false : undefined); } });
    await assert.rejects(execute(adapter.expression, scene.runtime), /SCH_WIRE_TARGET_CHANGED|FLAT_/u);
    assert.deepEqual(scene.calls, ["action", "setLines"]); assert.equal(scene.source.written, "");
  });
}

void test("native wire source profile refuses own undefined and every non-false lock value", () => {
  for (const locked of [undefined, null, true, 0, 1, "false", {}, []]) {
    const before = lockFixture("omitted"), rows = parseDocumentSource(before.native.source).objects;
    const group = rows.find((row) => row.id === "wire"); assert.ok(group); group.body["locked"] = locked;
    const encoded = encode(rows), source = parseDocumentSource(encoded);
    // Own undefined cannot occur in JSON, but the exported builder also accepts source objects.
    const target = source.objects.find((row) => row.id === "wire"); assert.ok(target); target.body["locked"] = locked;
    assert.ok(Object.hasOwn(target.body, "locked"));
    assert.throws(() => buildSchematicNativeWireAdapter(wireOperation, source, { ...before.native, source: encoded }), /locked|WIRE profile/u);
  }
});

void test("native wire still refuses a grouped root even when its lock is omitted", () => {
  const before = lockFixture("omitted"), source = parseDocumentSource(before.native.source);
  const target = source.objects.find((row) => row.id === "wire"); assert.ok(target); target.body["groupId"] = "foreign";
  const encoded = encode(source.objects);
  assert.throws(() => buildSchematicNativeWireAdapter(wireOperation, parseDocumentSource(encoded), { ...before.native, source: encoded }), /WIRE profile|group/u);
});
