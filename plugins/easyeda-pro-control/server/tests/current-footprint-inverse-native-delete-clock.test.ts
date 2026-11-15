// oxlint-disable import/max-dependencies -- The complete source locations, production program, original-return fixture and cursor refusal are direct subjects of this regression.
/** Actual-source and local cursor checks only; no native clock is authorized. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { CurrentFootprintInverseNativeDeleteClockController as Controller } from "../src/current-footprint-inverse-native-delete-clock-controller.ts";
import assert from "node:assert/strict";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_REQUESTS as LIMIT, CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_ORDER as ORDER,
  currentFootprintInverseNativeDeleteClockCases as cases, currentFootprintInverseNativeDeleteClockNativeFrame as nativeFrame,
  currentFootprintInverseNativeDeleteClockTemplate as template, validateCurrentFootprintInverseNativeDeleteClockCommand as validateClock,
  currentFootprintInverseNativeDeleteClockWire as wire } from "../src/current-footprint-inverse-native-delete-clock-protocol.ts";
import { currentFootprintInverseNativeClockBookNativeSource } from "../src/current-footprint-inverse-native-clock-book-storage.ts";
import { currentFootprintInverseNativeDeleteClockRegistrationNativeSource } from "../src/current-footprint-inverse-native-delete-clock-registration-native.ts";
import { currentFootprintInverseNativeDeleteClockNativeSource } from "../src/current-footprint-inverse-native-delete-clock-native.ts";
import { currentFootprintInverseNativeDeleteClockPromise as qualifyPromise } from "../src/current-footprint-inverse-native-delete-clock-replies.ts";
import { Session } from "node:inspector/promises";
import type { Debugger } from "node:inspector/promises";
import { test } from "node:test";
import { Script } from "node:vm";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { z } from "zod";
import { qualifyCurrentFootprintInverseClockWorkerSource as qualifyWorker } from "../src/current-footprint-inverse-clock-worker-source.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_SOURCE as UI, qualifyCurrentFootprintCopyClockRegistrationV2Source as qualifyUi } from "../src/current-footprint-copy-clock-registration-v2-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_SITES as SITES } from "../src/current-footprint-inverse-native-delete-clock-profile.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_PROGRAMS as PROGRAMS, CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_REGISTRATION_PROGRAMS as REGISTRATION } from "../src/current-footprint-inverse-native-delete-clock-programs.ts";
import {  CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_REGISTRATION_FLAGS as FLAGS, CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_REGISTRATION_ORDER as REG_ORDER, currentFootprintInverseNativeDeleteClockRegistrationCases as registrationCases , currentFootprintInverseNativeDeleteClockRegistrationTemplate as registrationTemplate, validateCurrentFootprintInverseNativeDeleteClockRegistrationCommand as validate } from "../src/current-footprint-inverse-native-delete-clock-registration-protocol.ts";
import { captureCurrentFootprintInverseNativeDeleteClockRegistrationReply as captureReply } from "../src/current-footprint-inverse-native-delete-clock-registration-collector.ts";
import { CurrentFootprintInverseNativeDeleteClockRegistrationCursor as Cursor } from "../src/current-footprint-inverse-native-delete-clock-registration-cursor.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAssets } from "./helpers/installed-easyeda-source.ts";

void test("native single-clock sites are actual breakable locations in both qualified complete source files", async context => {
  const sources = await readConfiguredEasyedaAssets(["pro-mgr/3.2.185.bf63a159/js/project-worker.js", UI.wrapper.relativePath]);
  if (sources === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
  const worker = sources[0]; const ui = sources[1]; assert.ok(worker !== undefined && ui !== undefined); qualifyWorker(worker); qualifyUi("wrapper", ui);
  for (const value of [...Object.values(PROGRAMS), ...Object.values(REGISTRATION)]) { assert.doesNotThrow(() => new Script(`(${  value  })`)); }
  const sourceCommand = validate({ phase: "inverse-native-delete-clock-registration-source", role: "wrapper", method: "Debugger.getScriptSource", params: { scriptId: "actual_preload" } });
  assert.doesNotThrow(() => captureReply(sourceCommand, { scriptSource: ui }));
  const metadataCommand = validate({ phase: "inverse-native-delete-clock-registration-properties", role: "wrapper-function", method: "Runtime.getProperties",
    params: { objectId: "actual_wrapper", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  assert.throws(() => captureReply(metadataCommand, { scriptSource: ui }));
  let getterCalls = 0;
  assert.throws(() => captureReply(sourceCommand, { get scriptSource(): string { getterCalls += 1; return ui; } }));
  assert.equal(getterCalls, 0);
  const session = new Session(); session.connect();
  try {
    await session.post("Runtime.enable"); await session.post("Debugger.enable");
    for (const [realm, source] of [["worker", worker], ["ui", ui]] as const) {
      const result = await session.post("Runtime.compileScript", { expression: source, sourceURL: `inert-unexecuted-native-clock-${  realm  }.js`, persistScript: true });
      assert.ok(result.scriptId !== undefined);
      for (const site of Object.values(SITES).filter(row => row.realm === realm)) {
        const start: Debugger.Location = { scriptId: result.scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber };
        const points: Debugger.GetPossibleBreakpointsReturnType = await session.post("Debugger.getPossibleBreakpoints", { start, end: { ...start, columnNumber: site.columnNumber + 1 }, restrictToFunction: true });
        assert.equal(points.locations.length, 1); assert.equal(points.locations[0]?.lineNumber, start.lineNumber); assert.equal(points.locations[0]?.columnNumber, start.columnNumber);
      }
    }
  } finally { session.disconnect(); }
});

void test("production return retention preserves actual qe outer Promise across its original resume", async context => {
  const sources = await readConfiguredEasyedaAssets(["pro-mgr/3.2.185.bf63a159/js/project-worker.js"]);
  if (sources === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
  const source = sources[0]; assert.ok(source !== undefined); qualifyWorker(source);
  // The standalone Node fixture has no test-runner async-hook instrumentation;
  // Its original worker exit and child-process exit are both joined.
  // oxlint-disable-next-line typescript/strict-void-return -- Node returns the original ChildProcess; promisify consumes its completion callback.
  const execute = promisify(execFile);
  const result = await execute(process.execPath, ["--import", fileURLToPath(new URL("../../scripts/test-isolation.ts", import.meta.url)),
    fileURLToPath(new URL("helpers/native-delete-clock-return-main.ts", import.meta.url))], { maxBuffer: 4096, timeout: 10_000 });
  const parsed: unknown = JSON.parse(result.stdout);
  const proof = z.strictObject({ originalReturnCapturedBeforeResume: z.literal(true), capturedReturnIsOuterPromise: z.literal(true),
    capturedReturnIsInnerPromise: z.literal(false), sameRetainedPromiseFulfilled: z.literal(true), requests: z.number().int().max(18), nativeOwnerIssued: z.literal(false) }).parse(parsed);
  assert.ok(proof.requests > 0);
});

void test("native clock preparation reproof failure before original transport dispatch stays consumed", async () => {
  const ready = Promise.withResolvers<null>(); let held = true, sends = 0;
  const cursor = new Cursor({ sessionId: "native_ui", contextId: 7, current: async (): Promise<void> => { await ready.promise; },
    assertOriginalHeld: (): void => { assert.equal(held, true); }, assertOriginalEvent: (event): void => { assert.equal(event.sessionId, "native_ui"); },
    request: (): Promise<unknown> => { sends += 1; return Promise.resolve({}); } });
  const command = validate({ phase: "inverse-native-delete-clock-registration-initial", method: "Runtime.callFunctionOn",
    params: { ...FLAGS, objectId: "original_root", functionDeclaration: REGISTRATION.initial,
      arguments: [{ value: "a".repeat(64) }, { value: "b".repeat(32) }, { value: "original_tab" }], returnByValue: false } });
  const pending = cursor.request(command); const settled = assert.rejects(pending); held = false; ready.resolve(null); await settled;
  assert.equal(sends, 0); assert.throws(() => cursor.request(command)); await cursor.settleAfterOriginalExit(); assert.equal(sends, 0);
});

void test("native DEL single-clock command roster is closed and keeps original handles out of JSON authority", () => {
  const commands = cases(); assert.equal(commands.length, 90); assert.equal(ORDER.length, 90); assert.equal(LIMIT.normal, 70); assert.equal(LIMIT.helpers, 20);
  assert.equal(new Set(ORDER).size, 90); assert.equal(LIMIT.controls, LIMIT.cdpRequests + 16); assert.equal(LIMIT.producerResumed, false);
  for (const command of commands) {
    const encoded = Buffer.from(`${JSON.stringify(wire(command, 79, "original_session"))  }\0`);
    const selected = nativeFrame(encoded, command, "original_session"); assert.equal(selected["action"], "footprint-inverse-native-delete-clock");
    assert.equal(template(command).method, command.method); assert.throws(() => nativeFrame(encoded, command, "foreign_session"));
    assert.throws(() => validateClock({ ...command, realm: command.realm === "ui" ? "worker" : "ui" }));
  }
  const program = commands.find(command => command.method === "Runtime.callFunctionOn"); assert.ok(program !== undefined);
  assert.throws(() => validateClock({ ...program, params: { ...program.params, functionDeclaration: "function(){return true}" } }));
  assert.throws(() => validateClock({ ...program, params: { ...program.params, awaitPromise: true } }));
  assert.throws(() => validateClock({ phase: "inverse-native-delete-clock-resume", role: "producer", realm: "worker", method: "Debugger.resume", params: {} }));
  const code = currentFootprintInverseNativeDeleteClockNativeSource();
  assert.match(code, /AssertDncr\(\)/u); assert.match(code, /dncStep!=90/u); assert.match(code, /dncRemoved.Count!=9/u);
  assert.doesNotMatch(code, /ntfPoints|ntcComplete|ControlFootprintInversePublic/u);
  const pending = { result: [], internalProperties: [
    { name: "[[Prototype]]", value: { type: "object", className: "Promise", objectId: "original_prototype" } },
    { name: "[[PromiseState]]", value: { type: "string", value: "pending" } },
    { name: "[[PromiseResult]]", value: { type: "undefined" } },
  ] };
  assert.doesNotThrow(() =>{  qualifyPromise(pending, "pending"); }); assert.throws(() =>{  qualifyPromise(pending, "fulfilled", 7); });
  assert.throws(() =>{  qualifyPromise({ ...pending, result: [{ name: "then", value: { type: "function", objectId: "script_then" } }] }, "pending"); });
});

void test("shared native clock pool restores all original programs, packets and registration order", () => {
  const code = currentFootprintInverseNativeClockBookNativeSource();
  const matches = [...code.matchAll(/EasyedaDiagnosticFixedTable\.Load\(@"([A-Za-z\d+/=]+)",(\d+),@"([a-f\d]{64})",@"([a-f\d]{64})",(\d+),4\)/gu)];
  assert.equal(matches.length, 1); const match = matches[0]; assert.ok(match !== undefined);
  const packed = Buffer.from(match[1] ?? "", "base64"); assert.equal(createHash("sha256").update(packed).digest("hex"), match[4]);
  // oxlint-disable-next-line node/no-sync -- Decode one immutable bounded codebook for comparison against the independent original programs/packet grammars.
  const raw = gunzipSync(packed, { maxOutputLength: 60_000 }); assert.equal(raw.length, 59_649); assert.equal(raw.length, Number(match[2]));
  assert.equal(createHash("sha256").update(raw).digest("hex"), match[3]);
  const aliases = [
    ["~e~", '"silent":true,"generatePreview":false,"throwOnSideEffect":true,"returnByValue":false,"includeCommandLineAPI":false'],
    ["~p~", '"ownProperties":true,"accessorPropertiesOnly":false,"generatePreview":false'],
    ["~f~", '"silent":true,"generatePreview":false,"throwOnSideEffect":true,"awaitPromise":false,"userGesture":false'],
    ["~g~", "easyeda-footprint-inverse-native-delete-clock"], ["~c~", "__inverse_native_delete_clock_"],
    ["~r~", "__inverse_native_delete_clock_registration_"],
  ] as const;
  const rows = raw.toString("utf8").split("\0").map(row => row.split("\t").map(field => { let text = field; for (const [from, to] of aliases) { text = text.replaceAll(from, to); } return text; }));
  assert.equal(rows.length, 129); assert.equal(rows.length, Number(match[5])); for (const row of rows) { assert.equal(row.length, 4); }
  const dictionary = rows[0]?.[3]; assert.ok(dictionary !== undefined);
  const families = new Map<string, string[][]>();
  for (const family of ["c", "r"]) { const selected = rows.filter(row => (row[0] ?? "").startsWith(`${family  }/`)).map(row => {
    const first = row[0]; const second = row[1]; const third = row[2]; const fourth = row[3]; assert.ok(first !== undefined && second !== undefined && third !== undefined && fourth !== undefined);
    const kind = first.slice(2), text = family === "c" && kind === "program" ? fourth.replace("__native_delete_clock_helpers_v1__", () => dictionary) : fourth;
    return [kind, second, third, text];
  }); families.set(family, selected); }
  const clock = families.get("c"), registration = families.get("r"); assert.ok(clock !== undefined && registration !== undefined);
  assert.equal(clock.length, 102); assert.equal(registration.length, 26);
  for (const [family, expected] of [[clock, PROGRAMS], [registration, REGISTRATION]] as const) {
    const programs = new Map(family.filter(row => row[0] === "program").map(row => [row[1], row[3]]));
    assert.equal(programs.size, Object.keys(expected).length);
    for (const [role, program] of Object.entries(expected)) { assert.equal(programs.get(role), JSON.stringify(program)); }
  }
  const clockByKey = new Map(cases().map(command => { const row = template(command); return [row.key.replace(":", "/"), row]; }));
  const clockRows = clock.filter(row => row[0] !== "program"); assert.equal(clockRows.length, 90);
  for (const [index, row] of clockRows.entries()) { const expected = clockByKey.get(ORDER[index] ?? ""); assert.ok(expected !== undefined); assert.deepEqual(row, [expected.key, expected.method, expected.names.join(","), expected.template]); }
  const expectedRegistration = registrationCases().map(command => { const row = registrationTemplate(command); return [row.key, row.method, row.names.join(","), row.template]; });
  assert.deepEqual(registration.filter(row => row[0] !== "program"), expectedRegistration);
  const indices = /int\[\] indices=\{([\d,]+)\}/u.exec(currentFootprintInverseNativeDeleteClockRegistrationNativeSource())?.[1]?.split(",").map(Number); assert.ok(indices !== undefined);
  assert.deepEqual(indices.map(index => registration[index]?.[0]), REG_ORDER.map(name => name.replace("/", ":")));
});

void test("single-clock owner drift after the original bind await sends no renderer command or resume", async () => {
  const gate = Promise.withResolvers<null>(); let current = true, exited = false, resumes = 0, sends = 0;
  const original = { method: "Debugger.paused", sessionId: "original_worker", params: {} };
  const controller = new Controller({
    registration: { initial: "initial", wrapper: "wrapper", callback: "callback", bindings: "bindings", wrapperScriptId: "ui_script", callbackScriptId: "service_script", lexicalOffset: 0, normal: 18, helpers: 4, clockInvoked: false, runtimeOriginIssued: false },
    originalClock: "original_clock", accepted: "accepted", initialUi: { ...original, sessionId: "original_ui" }, initialWorker: original,
    entryPoint: "entry", inheritedUiPoints: { onMessage: "on_message", postReturned: "post_returned" },
    sessions: { worker: "original_worker", ui: "original_ui" }, scripts: { worker: "worker_script", ui: "ui_script" }, contexts: { worker: 1, ui: 2 },
    target: { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16) },
    current: (): void => { assert.equal(current, true); }, assertOriginalHeld: (): void => { assert.equal(current, true); },
    assertOriginalEvent: (): void => { throw new Error("unexpected event"); }, assertOriginalExit: (): void => { assert.equal(exited, true); },
    poll: (): Promise<void> => Promise.reject(new Error("unexpected poll")),
    send: (): Promise<unknown> => { sends += 1; return Promise.resolve({}); },
    resume: (): Promise<unknown> => { resumes += 1; return Promise.resolve({}); }, consumeOriginalHold: (): void => { throw new Error("unexpected hold spend"); },
    control: async (phase): Promise<void> => { assert.equal(phase, "bind"); await gate.promise; },
  });
  for (let index = 0; index < 64; index += 1) { assert.equal(controller.observe({ method: "Runtime.consoleAPICalled", sessionId: "original_ui", params: {} }), false); }
  const pending = controller.start(); const rejected = assert.rejects(pending); current = false; gate.resolve(null); await rejected;
  assert.equal(controller.start(), pending); assert.equal(sends, 0); assert.equal(resumes, 0); exited = true; await controller.settleAfterOriginalExit();
});

void test("actual Inspector conditions compile per evaluation and stay separate from evaluated helper receipts", async () => {
  // oxlint-disable-next-line typescript/strict-void-return -- The ChildProcess is retained by promisify until its original exit.
  const execute = promisify(execFile);
  const result = await execute(process.execPath, ["--import", fileURLToPath(new URL("../../scripts/test-isolation.ts", import.meta.url)),
    fileURLToPath(new URL("helpers/native-delete-clock-condition-main.ts", import.meta.url))], { maxBuffer: 4096, timeout: 10_000 });
  const parsed: unknown = JSON.parse(result.stdout);
  assert.deepEqual(parsed, { conditionEvaluations: 10, falseEvaluations: 4, originalConditionSourcesQualified: 10, actualPauses: 6, actualResumes: 6,
    rendererRequests: 58, nativeOwnerIssued: false, applicationExecuted: false });
});
