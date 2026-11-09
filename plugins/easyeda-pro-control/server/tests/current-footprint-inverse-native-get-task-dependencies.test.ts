// oxlint-disable import/max-dependencies -- Two independent fixed-codec books, original-source factories and actual Inspector consumers are checked together without sharing authority.
/** Original inert consumers and exact readonly books. These data tests issue
 * no Core/native constructor receipt, body permission or accepted worker Job. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { Worker } from "node:worker_threads";
import { gunzipSync } from "node:zlib";
import { currentFootprintInverseNativeGetTaskDependenciesCases as cases, currentFootprintInverseNativeGetTaskDependenciesNativeFrame as frame, currentFootprintInverseNativeGetTaskDependenciesTemplate as template, validateCurrentFootprintInverseNativeGetTaskDependenciesCommand as validate, currentFootprintInverseNativeGetTaskDependenciesWire as wire } from "../src/current-footprint-inverse-native-get-task-dependencies-protocol.ts";
import { currentFootprintInverseNativeGetTaskDependenciesNativeSource as nativeSource } from "../src/current-footprint-inverse-native-get-task-dependencies-native.ts";
import { currentFootprintInverseNativeGetTaskIntrinsicsCases as intrinsicCases, currentFootprintInverseNativeGetTaskIntrinsicsNativeFrame as intrinsicFrame, currentFootprintInverseNativeGetTaskIntrinsicsTemplate as intrinsicTemplate, validateCurrentFootprintInverseNativeGetTaskIntrinsicsCommand as intrinsicValidate, currentFootprintInverseNativeGetTaskIntrinsicsWire as intrinsicWire } from "../src/current-footprint-inverse-native-get-task-intrinsics-protocol.ts";
import { currentFootprintInverseGetIntrinsicsNativeSource } from "../src/current-footprint-inverse-get-intrinsics-native.ts";
import { FOOTPRINT_INVERSE_NATIVE_GET_TASK_DEPENDENCIES_INSPECTOR as INSPECTOR, footprintInverseNativeGetTaskManagerFixture, footprintInverseNativeGetTaskUiFixture } from "./helpers/footprint-inverse-native-get-task-dependencies-fixture.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAssets } from "./helpers/installed-easyeda-source.ts";

const sha = (value: Uint8Array): string => createHash("sha256").update(value).digest("hex");
/** Decode only bounded immutable fixed rows, including their independent hashes. */
function rows(source: string): readonly (readonly string[])[] {
  const result: string[][] = []; for (const match of source.matchAll(/EasyedaDiagnosticFixedTable\.Load\(@"([A-Za-z\d+/=]+)",(\d+),@"([a-f\d]{64})",@"([a-f\d]{64})",(\d+),4\)/gu)) { const packed = Buffer.from(match[1] ?? "", "base64"); assert.equal(sha(packed), match[4]);
    // oxlint-disable-next-line node/no-sync -- Fixed source tables are independently decoded under the unchanged 64 KiB ceiling.
    const bytes = gunzipSync(packed, { maxOutputLength: 65_536 }); assert.equal(bytes.length, Number(match[2])); assert.equal(sha(bytes), match[3]); const part = bytes.toString("utf8").split("\0").map(row => row.split("\t")); assert.equal(part.length, Number(match[5])); assert.ok(part.every(row => row.length === 4)); result.push(...part);
  } return result;
}
/** Compare actual emitted rows through the unchanged complete-message envelope. */
function complete(table: readonly (readonly string[])[], key: string, names: readonly string[], prefix: string, fields: Readonly<Record<string, string | number>>, expected: object): void {
  const row = table.find(value => value[0] === key); assert.ok(row !== undefined && row[3] !== undefined); let text = row[3];
  for (const name of names) { text = text.replaceAll(JSON.stringify(`__${prefix}${name}__`), JSON.stringify(fields[name])); }
  for (const program of table.filter(value => value[0] === "program")) { assert.ok(program[1] !== undefined && program[3] !== undefined); text = text.replaceAll(JSON.stringify(`__${prefix}program_${program[1]}__`), program[3]); }
  const actual = Buffer.from(`{"id":79,${text.slice(1, -1)},"sessionId":"original_ui"}\0`), wanted = Buffer.from(`${JSON.stringify(expected)}\0`); assert.deepEqual(actual, wanted); assert.equal(sha(actual), sha(wanted));
}
void test("separate native-task readonly books retain exact complete CDP rows without a public ledger or broad flags", () => {
  const table = rows(nativeSource()); assert.equal(table.length, 15); assert.equal(cases().length, 9);
  for (const c of cases()) { const packet = wire(c, 79, "original_ui"); const bytes = Buffer.from(`${JSON.stringify(packet)}\0`); const fields = frame(bytes, c, "original_ui"); const row = template(c); complete(table, row.key, row.names, "native_get_task_dependencies_", fields, { id: 79, method: c.method, params: c.params, sessionId: "original_ui" }); assert.throws(() => frame(bytes, c, "foreign")); assert.throws(() => validate({ ...c, publicCall: "borrowed" })); if (c.method === "Runtime.callFunctionOn" || c.method === "Debugger.evaluateOnCallFrame") { assert.equal(c.params.throwOnSideEffect, true); assert.throws(() => validate({ ...c, params: { ...c.params, throwOnSideEffect: false } })); } }
  const old = rows(currentFootprintInverseGetIntrinsicsNativeSource()); assert.equal(intrinsicCases().length, 13);
  for (const c of intrinsicCases()) { const packet = intrinsicWire(c, 79, "original_ui"); const bytes = Buffer.from(`${JSON.stringify(packet)}\0`); const fields = intrinsicFrame(bytes, c, "original_ui"); const row = intrinsicTemplate(c); complete(old, row.key, row.names, "get_intrinsics_", fields, { id: 79, method: c.method, params: c.params, sessionId: "original_ui" }); assert.throws(() => intrinsicValidate({ ...c, inverseGetIntrinsics: true })); }
});
void test("actual original GET callback dependencies rejoin a fresh held frame without worker or body effects", async context => {
  const sources = await readConfiguredEasyedaAssets(["pro-ui/3.2.198.2800f583/js/ui.js", "pro-mgr/3.2.185.bf63a159/js/pro-mgr.js"]); if (sources === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; } const [ui, manager] = sources; assert.ok(ui !== undefined && manager !== undefined);
  context.after(() => { for (const key of ["inertNativeReg", "inertNativeRegCtor", "inertNativeRegTimer", "gVars", "_MSG_BUS_"]) { Reflect.deleteProperty(globalThis, key); } });
  for (const mode of ["ready", "nativePromiseDrift", "proxyCallback"] as const) {
    const worker = new Worker(INSPECTOR, { eval: true, workerData: { mode, ui: footprintInverseNativeGetTaskUiFixture(ui), manager: footprintInverseNativeGetTaskManagerFixture(manager), deleteSender: new URL("../src/current-footprint-inverse-native-delete-sender-collector.ts", import.meta.url).href, registration: new URL("../src/current-footprint-inverse-native-delete-registration-collector.ts", import.meta.url).href, sender: new URL("../src/current-footprint-inverse-native-get-task-sender-collector.ts", import.meta.url).href, controller: new URL("../src/current-footprint-inverse-native-get-task-call-controller.ts", import.meta.url).href, collector: new URL("../src/current-footprint-inverse-native-get-task-dependencies-collector.ts", import.meta.url).href, protocol: new URL("../src/current-footprint-inverse-native-get-task-dependencies-protocol.ts", import.meta.url).href } });
    try {
      // oxlint-disable-next-line promise/avoid-new -- The original Inspector worker owns its real held frame and message.
      const value: unknown = await new Promise((resolve, reject) => { worker.once("message", resolve); worker.once("error", reject); }); assert.ok(value !== null && typeof value === "object" && !("error" in value), JSON.stringify(value)); assert.ok("effectsWhileHeld" in value); assert.deepEqual(value.effectsWhileHeld, [0, 0, 0]);
      if (mode === "ready") { assert.ok("counts" in value && "order" in value); assert.deepEqual(value.counts, { calls: 6, properties: 28, frames: 1 }); const match = /NativeGetTaskDependencyOrder=\{([^}]+)\}/u.exec(nativeSource()); assert.ok(match !== null && match[1] !== undefined); const expected: unknown = JSON.parse(`[${match[1].replaceAll('@"', '"')}]`); assert.deepEqual(value.order, expected); }
      else { assert.ok("refused" in value && value.refused === true); }
    } finally { await worker.terminate(); }
  }
});
