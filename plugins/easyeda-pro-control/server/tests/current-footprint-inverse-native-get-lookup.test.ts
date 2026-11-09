/** Actual original getter entry, fixed book and original Promise scheduling. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { Worker } from "node:worker_threads";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { currentFootprintInverseNativeGetLookupCases as cases, currentFootprintInverseNativeGetLookupNativeFrame as nativeFrame, currentFootprintInverseNativeGetLookupTemplate as template, validateCurrentFootprintInverseNativeGetLookupCommand as validate, currentFootprintInverseNativeGetLookupWire as wire } from "../src/current-footprint-inverse-native-get-lookup-protocol.ts";
import { currentFootprintInverseNativeGetLookupNativeSource } from "../src/current-footprint-inverse-native-get-lookup-native.ts";
import { CurrentFootprintInverseNativeGetLookupController as Controller, assertOriginalCurrentFootprintInverseNativeGetLookupController as assertOriginal } from "../src/current-footprint-inverse-native-get-lookup-controller.ts";
import { FOOTPRINT_INVERSE_NATIVE_GET_LOOKUP_INSPECTOR as INSPECTOR, footprintInverseNativeGetLookupFixture as fixture } from "./helpers/footprint-inverse-native-get-lookup-fixture.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

const sha = (value: Uint8Array): string => createHash("sha256").update(value).digest("hex");

function inert(): void {
  // No owner or application exists in this constructor-only fixture.
}

void test("native lookup has only ten fixed cases and the sole invoke has its separate false flag", () => {
  const rows = cases(); assert.equal(rows.length, 10);
  for (const row of rows) { assert.deepEqual(validate(row), row); assert.throws(() => validate({ ...row, extra: true })); if (row.method === "Runtime.callFunctionOn") { assert.throws(() => validate({ ...row, params: { ...row.params, functionDeclaration: `${row.params.functionDeclaration} ` } })); assert.throws(() => validate({ ...row, params: { ...row.params, throwOnSideEffect: !row.params.throwOnSideEffect } })); } }
  assert.equal(rows.filter(row => row.method === "Runtime.callFunctionOn" && !row.params.throwOnSideEffect).length, 1);
});

void test("the bounded native table restores every fixed wire row with unchanged true probe flags", () => {
  const source = currentFootprintInverseNativeGetLookupNativeSource(); const records: string[][] = [];
  const pattern = /EasyedaDiagnosticFixedTable\.Load\(@"([A-Za-z\d+/=]+)",(\d+),@"([a-f\d]{64})",@"([a-f\d]{64})",(\d+),4\)/gu;
  for (const match of source.matchAll(pattern)) {
    const packed = Buffer.from(match[1] ?? "", "base64"); assert.equal(sha(packed), match[4]);
    // oxlint-disable-next-line node/no-sync -- Only immutable build-time catalogue data reaches this small bounded decompressor.
    const bytes = gunzipSync(packed, { maxOutputLength: 60_000 }); assert.equal(bytes.length, Number(match[2])); assert.equal(sha(bytes), match[3]);
    const rows = bytes.toString("utf8").split("\0").map(row => row.split("\t")); assert.equal(rows.length, Number(match[5])); assert.ok(rows.every(row => row.length === 4)); records.push(...rows);
  }
  assert.equal(records.length, 16); const programs = new Map(records.filter(row => row[0] === "program").map(row => [row[1], row[3]]));
  for (const c of cases()) {
    const packet = wire(c, 79, "original-ui"); const fields = nativeFrame(Buffer.from(`${JSON.stringify(packet)}\0`), c, "original-ui"); const selected = template(c); const row = records.find(r => r[0] === selected.key); assert.ok(row !== undefined); assert.equal(row[1], c.method);
    let params = row[3]; assert.ok(params !== undefined); assert.equal(params, selected.template); for (const name of selected.names) { params = params.replaceAll(JSON.stringify(`__native_get_lookup_${name}__`), JSON.stringify(fields[name])); }
    for (const [role, text] of programs) { assert.ok(role !== undefined && text !== undefined); params = params.replaceAll(JSON.stringify(`__native_get_lookup_program_${role}__`), text); }
    assert.deepEqual(JSON.parse(params), { method: c.method, params: c.params });
    // The unchanged C# helper inserts id/session around the complete row body.
    // Checking only params would miss a missing method/params envelope.
    const actual = Buffer.from(`{"id":79,${params.slice(1, -1)},"sessionId":"original-ui"}\0`), expected = Buffer.from(`${JSON.stringify({ id: 79, method: c.method, params: c.params, sessionId: "original-ui" })}\0`); assert.deepEqual(actual, expected); assert.equal(sha(actual), sha(expected)); assert.throws(() => nativeFrame(Buffer.from(`${JSON.stringify({ ...packet, sessionId: "foreign-ui" })}\0`), c, "original-ui"));
  }
});

void test("controller custody rejects copied instances, Proxy traps and substituted original methods", () => {
  const original = new Controller({ receipt: "original_i11", scope: "original_scope", sender: "original_sender", uiScriptId: "original_script", sessionId: "original_ui", contextId: 1, target: { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16) }, current: inert, beforeInvoke: inert, assertOriginalEvent: inert, assertOriginalExit: inert, poll: (): Promise<void> => Promise.resolve(), send: (): Promise<unknown> => Promise.resolve({}), submit: (): never => { throw new Error("No original request exists"); } });
  assertOriginal(original); assert.throws(() => Reflect.apply(assertOriginal, undefined, [{}]));
  let traps = 0; const proxy = new Proxy(original, { get: (): never => { traps += 1; throw new Error("Proxy trap must stay unused"); }, getPrototypeOf: (): never => { traps += 1; throw new Error("Proxy trap must stay unused"); } }); assert.throws(() => { assertOriginal(proxy); }); assert.equal(traps, 0);
  const descriptor = Object.getOwnPropertyDescriptor(Controller.prototype, "start"); assert.ok(descriptor !== undefined);
  try { Object.defineProperty(Controller.prototype, "start", { ...descriptor, value: inert }); assert.throws(() => { assertOriginal(original); }); } finally { Object.defineProperty(Controller.prototype, "start", descriptor); }
  assertOriginal(original);
});

void test("original tw first-frame custody retains the invocation without a getter body or worker grant", async context => {
  const ui = await readConfiguredEasyedaAsset("pro-ui/3.2.198.2800f583/js/ui.js"); if (ui === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
  for (const mode of ["held", "lateGuard", "badSource", "copiedEvent", "resumed", "pendingReadExit"] as const) {
    const worker = new Worker(INSPECTOR, { eval: true, workerData: { mode, ui: fixture(ui), controller: new URL("../src/current-footprint-inverse-native-get-lookup-controller.ts", import.meta.url).href } });
    try {
      // oxlint-disable-next-line promise/avoid-new -- Original isolated Inspector worker supplies the actual pause and result.
      const raw: unknown = await new Promise((resolve, reject) => { worker.once("message", resolve); worker.once("error", reject); worker.once("exit", code => { reject(new Error(`Original Inspector exited before result: ${String(code)}`)); }); });
      assert.ok(raw !== null && typeof raw === "object" && !("error" in raw), JSON.stringify(raw));
      if (mode === "pendingReadExit") { assert.deepEqual(raw, { pendingReadJoined: true, invokes: 0 }); }
      else if (mode === "lateGuard" || mode === "badSource") { assert.deepEqual(raw, { refused: true, invokes: 0 }); }
      else { assert.deepEqual(raw, { held: true, requests: 25, invokes: 1, forged: true, exitRefused: true, effectsAfterFixtureRelease: 1, effectsWhileHeld: 0, originalInvocationIssued: true, getterBodyAuthorized: false, runtimeJobIssued: false, referenceResultsVerified: false, dispatchAuthorized: false }); }
    } finally { await worker.terminate(); }
  }
});
