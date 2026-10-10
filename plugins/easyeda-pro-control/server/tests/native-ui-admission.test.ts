import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { runNativeUiWithOperationAdmission } from "../src/native-ui-admission.ts";
import { nativeUiRequestSchema } from "../src/windows-native-ui.ts";

const window = { windowHandle: "123" };
const confirmed = { ...window, confirmUIWrite: true };
const availableDuringRecovery = [
  { action: "discover" }, { action: "windows" },
  { action: "inspect", ...window }, { action: "focused", ...window },
  { action: "capture", ...window }, { action: "focus", ...confirmed },
  { action: "normal-close", ...confirmed },
];
const guardedInputs = [
  { action: "invoke", ...confirmed }, { action: "setvalue", text: "value", ...confirmed },
  { action: "filename", controlHandle: "456", text: "fixture.eprj2", ...confirmed },
  { action: "keys", text: "{ESC}", ...confirmed },
  { action: "click", x: 1, y: 2, ...confirmed },
  { action: "doubleclick", x: 1, y: 2, ...confirmed },
  { action: "rightclick", x: 1, y: 2, ...confirmed },
];

void test("native inspection and recovery controls never invoke the unused journal scan", async () => {
  for (const input of availableDuringRecovery) {
    const request = nativeUiRequestSchema.parse(input);
    let calls = 0;
    const result = await runNativeUiWithOperationAdmission(request, (admitted) => {
      calls += 1; assert.strictEqual(admitted, request); return Promise.resolve("native-result");
    }, () => { throw new Error("The journal scan must not run for this action."); });
    assert.equal(result, "native-result"); assert.equal(calls, 1);
  }
});

void test("every confirmed editing input awaits the complete engine admission before native dispatch", async () => {
  for (const input of guardedInputs) {
    const request = nativeUiRequestSchema.parse(input);
    const events: string[] = [];
    await assert.rejects(runNativeUiWithOperationAdmission(request, () => {
      events.push("dispatch"); return Promise.resolve(null);
    }, () => { events.push("scan"); return Promise.reject(new Error("Unsettled operation")); }), /Unsettled operation/u);
    assert.deepEqual(events, ["scan"]);
    events.length = 0;
    await runNativeUiWithOperationAdmission(request, () => {
      events.push("dispatch"); return Promise.resolve(null);
    }, () => { events.push("scan"); return Promise.resolve(true); });
    assert.deepEqual(events, ["scan", "dispatch"]);
  }
});

void test("failed or unresolved editing admission never reaches the native controller", async () => {
  const request = nativeUiRequestSchema.parse(guardedInputs[0]);
  let dispatched = false;
  const run = (): Promise<null> => { dispatched = true; return Promise.resolve(null); };
  await assert.rejects(runNativeUiWithOperationAdmission(request, run, () => Promise.reject(new Error("scan failed"))), /scan failed/u);
  assert.equal(dispatched, false);
  let scans = 0;
  const admission = (): Promise<true> => {
    scans += 1; return scans === 1 ? Promise.resolve(true) : Promise.reject(new Error("New unsettled operation"));
  };
  await runNativeUiWithOperationAdmission(request, run, admission);
  dispatched = false;
  await assert.rejects(runNativeUiWithOperationAdmission(request, run, admission), /New unsettled operation/u);
  assert.equal(scans, 2); assert.equal(dispatched, false);
});

void test("native facade preserves serialized recovery routing and invokes the admission wrapper", async () => {
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const start = source.indexOf('  "easyeda_control_native_ui",');
  const end = source.indexOf("const designRequestSchema", start);
  assert.ok(start > 0 && end > start);
  const handler = source.slice(start, end);
  assert.match(handler, /serializedGuarded\(\(\{ request \}\) =>/u);
  assert.match(handler, /return discardCloseConfirmation\(request, controller\)/u);
  assert.match(handler, /return runNativeUiWithOperationAdmission\(request, \(admitted\) => controller\.run\(admitted\), \(\) => engine\.assertNativeUiEditingAllowed\(\)\)/u);
  assert.match(handler, /allowDuringOrphanRisk: true/u);
  assert.doesNotMatch(handler, /listOperationStates\(\)/u);
});
