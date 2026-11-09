/** Original manager entries under inert Inspector with no Core/native owner,
 * accepted worker Job, EasyEDA process or target-runtime claim. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { Worker } from "node:worker_threads";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { currentFootprintInverseNativeGetTaskManagerCases as cases, currentFootprintInverseNativeGetTaskManagerNativeFrame as frame, currentFootprintInverseNativeGetTaskManagerTemplate as template, validateCurrentFootprintInverseNativeGetTaskManagerCommand as validate, currentFootprintInverseNativeGetTaskManagerWire as wire } from "../src/current-footprint-inverse-native-get-task-manager-protocol.ts";
import { currentFootprintInverseNativeGetTaskManagerNativeSource as nativeSource } from "../src/current-footprint-inverse-native-get-task-manager-native.ts";
import { FOOTPRINT_INVERSE_NATIVE_GET_TASK_MANAGER_INSPECTOR as INSPECTOR, footprintInverseNativeGetTaskManagerEntryFixture } from "./helpers/footprint-inverse-native-get-task-manager-fixture.ts";
import { footprintInverseNativeGetTaskUiFixture } from "./helpers/footprint-inverse-native-get-task-dependencies-fixture.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAssets } from "./helpers/installed-easyeda-source.ts";

const sha = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");
void test("native manager book preserves every literal row and the actual three-resume order", () => {
  const rows: string[][] = []; for (const match of nativeSource().matchAll(/EasyedaDiagnosticFixedTable\.Load\(@"([A-Za-z\d+/=]+)",(\d+),@"([a-f\d]{64})",@"([a-f\d]{64})",(\d+),4\)/gu)) { const packed = Buffer.from(match[1] ?? "", "base64"); assert.equal(sha(packed), match[4]);
    // oxlint-disable-next-line node/no-sync -- Immutable fixed source rows are independently decoded under the unchanged chunk ceiling.
    const bytes = gunzipSync(packed, { maxOutputLength: 60_000 }); assert.equal(bytes.length, Number(match[2])); assert.equal(sha(bytes), match[3]); const part = bytes.toString("utf8").split("\0").map(row => row.split("\t")); assert.equal(part.length, Number(match[5])); rows.push(...part);
  }
  assert.equal(rows.length, 24); assert.equal(cases().length, 18); assert.equal(cases().filter(c => c.method === "Debugger.resume").length, 1);
  const programs = rows.filter(row => row[0] === "program"); for (const c of cases()) { const packet = wire(c, 79, "original_ui"); const bytes = Buffer.from(`${JSON.stringify(packet)}\0`); const fields = frame(bytes, c, "original_ui"); const selected = template(c); const row = rows.find(value => value[0] === selected.key); assert.ok(row !== undefined && row[3] !== undefined); let text = row[3];
    for (const name of selected.names) { text = text.replaceAll(JSON.stringify(`__native_get_task_manager_${name}__`), JSON.stringify(fields[name])); } for (const p of programs) { assert.ok(p[1] !== undefined && p[3] !== undefined); text = text.replaceAll(JSON.stringify(`__native_get_task_manager_program_${p[1]}__`), p[3]); }
    assert.deepEqual(Buffer.from(`{"id":79,${text.slice(1, -1)},"sessionId":"original_ui"}\0`), Buffer.from(`${JSON.stringify({ id: 79, method: c.method, params: c.params, sessionId: "original_ui" })}\0`)); assert.throws(() => validate({ ...c, publicCall: "borrowed" })); assert.throws(() => frame(bytes, c, "foreign")); if (c.method === "Runtime.callFunctionOn" || c.method === "Debugger.evaluateOnCallFrame") { assert.equal(c.params.throwOnSideEffect, true); assert.throws(() => validate({ ...c, params: { ...c.params, throwOnSideEffect: false } })); }
  }
});
void test("actual native GET wrapper/body live entries retain original receiver and stop before worker transport", async context => {
  const sources = await readConfiguredEasyedaAssets(["pro-ui/3.2.198.2800f583/js/ui.js", "pro-mgr/3.2.185.bf63a159/js/pro-mgr.js"]); if (sources === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; } const [ui, manager] = sources; assert.ok(ui !== undefined && manager !== undefined);
  context.after(() => { for (const name of ["inertNativeReg", "inertNativeRegCtor", "inertNativeRegTimer", "gVars", "_MSG_BUS_"]) { Reflect.deleteProperty(globalThis, name); } });
  for (const mode of ["held", "spentGuard", "managerLate"] as const) { const worker = new Worker(INSPECTOR, { eval: true, workerData: { mode, ui: footprintInverseNativeGetTaskUiFixture(ui), manager: footprintInverseNativeGetTaskManagerEntryFixture(manager), deleteSender: new URL("../src/current-footprint-inverse-native-delete-sender-collector.ts", import.meta.url).href, registration: new URL("../src/current-footprint-inverse-native-delete-registration-collector.ts", import.meta.url).href, sender: new URL("../src/current-footprint-inverse-native-get-task-sender-collector.ts", import.meta.url).href, callController: new URL("../src/current-footprint-inverse-native-get-task-call-controller.ts", import.meta.url).href, dependencies: new URL("../src/current-footprint-inverse-native-get-task-dependencies-collector.ts", import.meta.url).href, dependencyProtocol: new URL("../src/current-footprint-inverse-native-get-task-dependencies-protocol.ts", import.meta.url).href, controller: new URL("../src/current-footprint-inverse-native-get-task-callback-controller.ts", import.meta.url).href, managerController: new URL("../src/current-footprint-inverse-native-get-task-manager-controller.ts", import.meta.url).href } });
    try {
      // oxlint-disable-next-line promise/avoid-new -- The original isolated Inspector retains its actual pause and completion message.
      const value: unknown = await new Promise((resolve, reject) => { worker.once("message", resolve); worker.once("error", reject); }); assert.ok(value !== null && typeof value === "object" && !("error" in value), JSON.stringify(value)); assert.ok("effectsWhileHeld" in value && "managerResumes" in value && "exitRefused" in value); assert.equal(value.exitRefused, true); assert.deepEqual(value.effectsWhileHeld, [0, 1, 0]);
      if (mode === "managerLate") { assert.equal(value.managerResumes, 0); assert.ok("managerRefused" in value && value.managerRefused === true); }
      else { assert.equal(value.managerResumes, 3); assert.ok("callbackSpent" in value && value.callbackSpent === true && "managerForged" in value && value.managerForged === true); assert.ok("authority" in value); assert.deepEqual(value.authority, [true, false, false]); assert.ok("order" in value); const match = /NativeGetTaskManagerOrder=\{([^}]+)\}/u.exec(nativeSource()); assert.ok(match !== null && match[1] !== undefined); assert.deepEqual(value.order, JSON.parse(`[${match[1].replaceAll('@"', '"')}]`)); }
    } finally { await worker.terminate(); }
  }
});
