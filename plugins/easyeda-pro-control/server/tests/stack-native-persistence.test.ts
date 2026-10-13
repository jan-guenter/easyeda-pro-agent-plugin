import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { CAPTURE_NATIVE_STACK_HANDLER_CODE, buildNativeStackPersistenceCode, expectedNativeStackIntermediate } from "../src/stack-native-persistence.ts";
import { sha256Json } from "../src/core.ts";
import type { NativeSourceSnapshot } from "../src/document-source.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import { pcbExactFrameFixture } from "./pcb-exact-frame-fixture.ts";

interface MockBus { publish: (topic: string, value: unknown) => void; messageBus: { subscribed: { openMainDialog: object[] }; publish: () => void }; }
function fixture(failure?: "throw" | "unexpected" | "duplicate"): { bus: MockBus; original: unknown; calls: string[]; capture: () => unknown } {
  const calls: string[] = [];
  const original = (): void => { calls.push("native-ui-delivery"); };
  const handler = { applyLayerPhysConfig(): void { calls.push("physical-apply"); }, getPhyZIndex(): number { return 1; } };
  const bus: MockBus = { publish: original, messageBus: { subscribed: { openMainDialog: [{}] }, publish(): void {
    const { publish } = bus;
    publish("TempMaskRightClickMenu", "");
    if (failure === "throw") { throw new Error("native-dispatch-failed"); }
    publish(failure === "unexpected" ? "another-dialog" : "openDialog", handler);
    if (failure === "duplicate") { publish("openDialog", handler); }
  } } };
  const capture = (): unknown => runInNewContext(`${CAPTURE_NATIVE_STACK_HANDLER_CODE}\ncaptureNativeStackHandler(bus);`, { bus });
  return { bus, original, calls, capture };
}

void test("native stack handler capture never delivers a dialog and restores the exact bus descriptor", () => {
  const value = fixture();
  const before = Object.getOwnPropertyDescriptor(value.bus, "publish");
  assert.notEqual(value.capture(), undefined);
  assert.deepEqual(Object.getOwnPropertyDescriptor(value.bus, "publish"), before);
  assert.equal(value.bus.publish, value.original);
  assert.deepEqual(value.calls, []);
});

void test("native stack capture restores publication on throw, foreign event and duplicate delivery", () => {
  for (const failure of ["throw", "unexpected", "duplicate"] as const) {
    const value = fixture(failure);
    const before = Object.getOwnPropertyDescriptor(value.bus, "publish");
    assert.throws(value.capture);
    assert.deepEqual(Object.getOwnPropertyDescriptor(value.bus, "publish"), before);
    assert.deepEqual(value.calls, []);
  }
});

function encodeSource(source: NativeSourceSnapshot): string {
  return `{"type":"DOCHEAD"}||${JSON.stringify(source.document)}|\n${source.objects.map((entry) => `${JSON.stringify({ id: entry.id, type: entry.type })}||${JSON.stringify(entry.body)}|\n`).join("")}`;
}

// oxlint-disable-next-line typescript/explicit-function-return-type -- Keep the exact mutable test graph inferred for pre/post-mutation fault injection, without widening native handlers to unknown or any.
function stackFixture() {
  const base = { schema: "easyeda-pro-control.document-source.v1" as const,
    document: { uuid: "1".repeat(16), docType: "PCB", editVersion: "3.2.149.88089769" },
    objects: [1, 2, 361].flatMap((layerId) => [
      { id: JSON.stringify(["LAYER", layerId]), type: "LAYER", body: { layerId, layerName: `Layer${layerId}`, layerType: layerId === 361 ? "SUBSTRATE" : "SIGNAL", use: true, show: true, locked: false, activeColor: "#123456", activateTransparency: 1, inactiveColor: "#654321", inactiveTransparency: 0.5 } },
      { id: JSON.stringify(["LAYER_PHYS", layerId]), type: "LAYER_PHYS", body: { zIndex: layerId, thickness: 1, material: "FR4", permittivity: 4.5, lossTangent: 0.02, isKeepIsland: true } },
    ]).toSorted((left, right) => left.id.localeCompare(right.id)) };
  const before: NativeSourceSnapshot = { ...base, sha256: sha256Json(base) };
  const expectedBase = structuredClone(base);
  for (const row of expectedBase.objects) { if (row.type === "LAYER_PHYS") { row.body.thickness = 2; } }
  const expected: NativeSourceSnapshot = { ...expectedBase, sha256: sha256Json(expectedBase) };
  const intermediate = expectedNativeStackIntermediate(before, expected);
  const runtime = pcbExactFrameFixture(String(before.document["uuid"]), encodeSource(before));
  const effects: string[] = [];
  const handler = {
    getPhyZIndex: (layerId: number): number => layerId,
    applyLayerPhysConfig: (): void => { effects.push("physical"); runtime.state.source = encodeSource(intermediate); },
  };
  const bus = Object.assign(runtime.frame.contentWindow.MSG_BUS_PCB, { publish: (_topic: string, _value: unknown): never => assert.fail("No actual stack dialog") });
  Object.assign(runtime.channel, { subscribed: { openMainDialog: [{}] }, publish: (topic: string): void => {
    if (topic === "openMainDialog") { bus.publish("TempMaskRightClickMenu", ""); bus.publish("openDialog", handler); return; }
    assert.equal(topic, "toggleLayerState"); effects.push("persist");
  } });
  runtime.state.onDecode = (): void => { effects.push("decode"); };
  return { ...runtime, code: buildNativeStackPersistenceCode(before, expected), effects, expected };
}

void test("stack physical apply and presentation restore share sealed exact-frame scope and unchanged boolean results", async () => {
  const value = stackFixture();
  assert.equal(await value.run(value.code), true);
  assert.deepEqual(value.effects, ["physical", "decode", "persist"]);
  assert.equal(value.state.writes.length, 1);
  assert.equal(parseDocumentSource(value.state.source).sha256, value.expected.sha256);
});

void test("stack rejects scope drift before physical mutation and never resumes or retries a partial stack write", async () => {
  for (const key of ["EXPECTED_PCB_PROJECT_UUID", "EXPECTED_PCB_BRANCH_UUID"]) {
    const value = stackFixture();
    await assert.rejects(value.run(value.code, { ...value.runtime, [key]: null }), /CONTEXT/u);
    assert.deepEqual(value.effects, []);
  }
  for (const boundary of ["onIdentityReply", "onSourceReply"] as const) {
    const value = stackFixture();
    value.state[boundary] = (): void => { value.host.currentProject.branchUuid = "c".repeat(32); };
    await assert.rejects(value.run(value.code), /PROJECT/u);
    assert.deepEqual(value.effects, []);
  }
  const late = stackFixture();
  let reads = 0;
  late.state.onSourceReply = (): void => { reads += 1; if (reads === 2) { late.state.activeTab = "foreign"; } };
  await assert.rejects(late.run(late.code), /ACTIVE_TAB/u);
  assert.deepEqual(late.effects, ["physical"]);
  assert.equal(late.state.writes.length, 0);
  const afterDecode = stackFixture();
  afterDecode.state.onDecode = (): void => { afterDecode.effects.push("decode"); afterDecode.frame.isConnected = false; };
  await assert.rejects(afterDecode.run(afterDecode.code), /FRAME/u);
  assert.deepEqual(afterDecode.effects, ["physical", "decode"]);
  assert.equal(afterDecode.state.writes.length, 1);
  const replacedPublisher = stackFixture();
  replacedPublisher.state.onDecode = (): void => {
    replacedPublisher.effects.push("decode");
    Object.assign(replacedPublisher.channel, { publish: (): never => assert.fail("Never publish through a substituted stack receiver") });
  };
  await assert.rejects(replacedPublisher.run(replacedPublisher.code), /publisher changed/u);
  assert.deepEqual(replacedPublisher.effects, ["physical", "decode"]);
  assert.equal(replacedPublisher.state.writes.length, 1);
  const refused = stackFixture();
  refused.state.acknowledgment = false;
  await assert.rejects(refused.run(refused.code), /did not confirm/u);
  assert.deepEqual(refused.effects, ["physical", "decode"]);
  assert.equal(refused.state.writes.length, 1);
});
