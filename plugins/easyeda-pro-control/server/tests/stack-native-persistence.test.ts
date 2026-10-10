import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { CAPTURE_NATIVE_STACK_HANDLER_CODE } from "../src/stack-native-persistence.ts";

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
