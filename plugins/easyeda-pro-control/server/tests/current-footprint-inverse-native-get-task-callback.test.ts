/** Actual original callback prefix with inert factories; this does not run
 * Core/native constructor enrollment or issue an accepted worker Job. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { Worker } from "node:worker_threads";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { currentFootprintInverseNativeGetTaskCallbackCases as cases, currentFootprintInverseNativeGetTaskCallbackNativeFrame as frame, currentFootprintInverseNativeGetTaskCallbackTemplate as template, validateCurrentFootprintInverseNativeGetTaskCallbackCommand as validate, currentFootprintInverseNativeGetTaskCallbackWire as wire } from "../src/current-footprint-inverse-native-get-task-callback-protocol.ts";
import { currentFootprintInverseNativeGetTaskCallbackNativeSource as nativeSource } from "../src/current-footprint-inverse-native-get-task-callback-native.ts";
import { FOOTPRINT_INVERSE_NATIVE_GET_TASK_CALLBACK_INSPECTOR as INSPECTOR } from "./helpers/footprint-inverse-native-get-task-callback-fixture.ts";
import { footprintInverseNativeGetTaskManagerFixture, footprintInverseNativeGetTaskUiFixture } from "./helpers/footprint-inverse-native-get-task-dependencies-fixture.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAssets } from "./helpers/installed-easyeda-source.ts";

const sha = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");
void test("native callback book preserves complete readonly CDP rows and owns one literal original resume", () => {
  const rows: string[][] = []; for (const match of nativeSource().matchAll(/EasyedaDiagnosticFixedTable\.Load\(@"([A-Za-z\d+/=]+)",(\d+),@"([a-f\d]{64})",@"([a-f\d]{64})",(\d+),4\)/gu)) { const packed = Buffer.from(match[1] ?? "", "base64"); assert.equal(sha(packed), match[4]);
    // oxlint-disable-next-line node/no-sync -- Immutable fixed source rows are independently decoded under the unchanged chunk ceiling.
    const bytes = gunzipSync(packed, { maxOutputLength: 60_000 }); assert.equal(bytes.length, Number(match[2])); assert.equal(sha(bytes), match[3]); const part = bytes.toString("utf8").split("\0").map(row => row.split("\t")); assert.equal(part.length, Number(match[5])); rows.push(...part);
  }
  assert.equal(rows.length, 17); assert.equal(cases().length, 12); assert.equal(cases().filter(c => c.method === "Debugger.resume").length, 1);
  const programs = rows.filter(row => row[0] === "program"); for (const c of cases()) { const packet = wire(c, 79, "original_ui"); const bytes = Buffer.from(`${JSON.stringify(packet)}\0`); const fields = frame(bytes, c, "original_ui"); const selected = template(c); const row = rows.find(value => value[0] === selected.key); assert.ok(row !== undefined && row[3] !== undefined); let text = row[3];
    for (const name of selected.names) { text = text.replaceAll(JSON.stringify(`__native_get_task_callback_${name}__`), JSON.stringify(fields[name])); } for (const p of programs) { assert.ok(p[1] !== undefined && p[3] !== undefined); text = text.replaceAll(JSON.stringify(`__native_get_task_callback_program_${p[1]}__`), p[3]); }
    assert.deepEqual(Buffer.from(`{"id":79,${text.slice(1, -1)},"sessionId":"original_ui"}\0`), Buffer.from(`${JSON.stringify({ id: 79, method: c.method, params: c.params, sessionId: "original_ui" })}\0`)); assert.throws(() => validate({ ...c, publicCall: "borrowed" })); assert.throws(() => frame(bytes, c, "foreign")); if (c.method === "Runtime.callFunctionOn" || c.method === "Debugger.evaluateOnCallFrame") { assert.equal(c.params.throwOnSideEffect, true); assert.throws(() => validate({ ...c, params: { ...c.params, throwOnSideEffect: false } })); }
  }
});
void test("actual RPC prefix burns the old hold at guarded transfer and stops before its GET handler", async context => {
  const sources = await readConfiguredEasyedaAssets(["pro-ui/3.2.198.2800f583/js/ui.js", "pro-mgr/3.2.185.bf63a159/js/pro-mgr.js"]); if (sources === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; } const [ui, manager] = sources; assert.ok(ui !== undefined && manager !== undefined);
  context.after(() => { for (const name of ["inertNativeReg", "inertNativeRegCtor", "inertNativeRegTimer", "gVars", "_MSG_BUS_"]) { Reflect.deleteProperty(globalThis, name); } });
  for (const mode of ["held", "spentGuard", "lateGuard"] as const) { const worker = new Worker(INSPECTOR, { eval: true, workerData: { mode, ui: footprintInverseNativeGetTaskUiFixture(ui), manager: footprintInverseNativeGetTaskManagerFixture(manager), deleteSender: new URL("../src/current-footprint-inverse-native-delete-sender-collector.ts", import.meta.url).href, registration: new URL("../src/current-footprint-inverse-native-delete-registration-collector.ts", import.meta.url).href, sender: new URL("../src/current-footprint-inverse-native-get-task-sender-collector.ts", import.meta.url).href, callController: new URL("../src/current-footprint-inverse-native-get-task-call-controller.ts", import.meta.url).href, dependencies: new URL("../src/current-footprint-inverse-native-get-task-dependencies-collector.ts", import.meta.url).href, dependencyProtocol: new URL("../src/current-footprint-inverse-native-get-task-dependencies-protocol.ts", import.meta.url).href, controller: new URL("../src/current-footprint-inverse-native-get-task-callback-controller.ts", import.meta.url).href } });
    try {
      // oxlint-disable-next-line promise/avoid-new -- The original isolated Inspector owns its real pause and result message.
      const value: unknown = await new Promise((resolve, reject) => { worker.once("message", resolve); worker.once("error", reject); }); assert.ok(value !== null && typeof value === "object" && !("error" in value), JSON.stringify(value)); assert.ok("effectsWhileHeld" in value && "resumes" in value && "exitRefused" in value); assert.equal(value.exitRefused, true);
      if (mode === "lateGuard") { assert.equal(value.resumes, 0); assert.deepEqual(value.effectsWhileHeld, [0, 0, 0]); assert.ok("refused" in value && value.refused === true); }
      else { assert.equal(value.resumes, 1); assert.deepEqual(value.effectsWhileHeld, [0, 1, 0]); assert.ok("oldSpent" in value && value.oldSpent === true && "forged" in value && value.forged === true); assert.ok("authority" in value); assert.deepEqual(value.authority, [true, false, false]); assert.ok("order" in value); const match = /NativeGetTaskCallbackOrder=\{([^}]+)\}/u.exec(nativeSource()); assert.ok(match !== null && match[1] !== undefined); assert.deepEqual(value.order, JSON.parse(`[${match[1].replaceAll('@"', '"')}]`)); }
    } finally { await worker.terminate(); }
  }
});
