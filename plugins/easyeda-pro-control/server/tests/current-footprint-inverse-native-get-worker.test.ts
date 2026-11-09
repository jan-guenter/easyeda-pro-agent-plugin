// oxlint-disable import/max-dependencies -- The independent native book, old-book parity, actual collector/cursor and Core forgery readers stay separate.
/** Native-origin GET prerequisites without public Call/GetResult or any app. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import type { Runtime } from "node:inspector/promises";
import { test } from "node:test";
import { createContext } from "node:vm";
import { CURRENT_FOOTPRINT_INVERSE_GET_WORKER_PROGRAMS as PROGRAMS } from "../src/current-footprint-inverse-get-worker-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_GET_WORKER_FLAGS as OLD_FLAGS, currentFootprintInverseGetWorkerCases as oldCases } from "../src/current-footprint-inverse-get-worker-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_WORKER_GROUP as GROUP, CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_WORKER_REQUESTS as LIMIT, currentFootprintInverseNativeGetWorkerCases as cases, currentFootprintInverseNativeGetWorkerNativeFrame as nativeFrame, currentFootprintInverseNativeGetWorkerLegacyTemplate as template, validateCurrentFootprintInverseNativeGetWorkerCommand as validate, currentFootprintInverseNativeGetWorkerWire as wire } from "../src/current-footprint-inverse-native-get-worker-protocol.ts";
import { currentFootprintInverseNativeGetWorkerNativeSource } from "../src/current-footprint-inverse-native-get-worker-native.ts";
import { CurrentFootprintInverseNativeGetWorkerCursor as Cursor } from "../src/current-footprint-inverse-native-get-worker-cursor.ts";
import { collectCurrentFootprintInverseNativeGetWorker as collect } from "../src/current-footprint-inverse-native-get-worker-collector.ts";
import { requireOriginalCurrentFootprintInverseNativeGetReadiness } from "../src/current-footprint-inverse-native-get-readiness.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_PROFILE as PROFILE } from "../src/current-footprint-inverse-native-profile.ts";
import { CurrentFootprintInverseNativeOwner } from "../src/current-pcb-diagnostic-owner.ts";
import type { DiagnosticEvent } from "../src/current-pcb-diagnostic-protocol.ts";
import { footprintInverseGetWorkerFixture } from "./helpers/footprint-inverse-get-worker-fixture.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

void test("native GET has its own closed marker/group and preserves old programs, flags and aggregate caps", () => {
  const commands = cases(), old = oldCases(); assert.equal(commands.length, 23); assert.deepEqual(LIMIT, { normal: 22, helpers: 6, cdpRequests: 28, controls: 30, events: 7, cleanupAfterOriginalExit: 0 });
  for (const [index, command] of commands.entries()) {
    const original = old[index]; assert.ok(original !== undefined); assert.equal(command.method, original.method); assert.equal(command.phase, original.phase.replace("inverse-get-worker-", "inverse-native-get-worker-"));
    assert.deepEqual(command.params, original.method === "Runtime.callFunctionOn" ? { ...original.params, objectGroup: GROUP } : original.params);
    assert.throws(() => validate(original)); assert.throws(() => validate({ ...command, method: "Debugger.resume" })); assert.throws(() => validate({ ...command, runtimeJobIssued: true }));
    if (command.method === "Runtime.callFunctionOn") { assert.throws(() => validate({ ...command, params: { ...command.params, objectGroup: OLD_FLAGS.objectGroup } })); assert.throws(() => validate({ ...command, params: { ...command.params, throwOnSideEffect: false } })); }
    const bytes = Buffer.from(`${JSON.stringify(wire(command, 79, "original_worker"))}\0`), fields = nativeFrame(bytes, command, "original_worker"); assert.equal(fields["action"], "footprint-inverse-native-get-worker"); assert.throws(() => nativeFrame(bytes, command, "foreign"));
    const row = template(command); let text = row.template; for (const name of row.names) { text = text.replace(JSON.stringify(`__inverse_get_worker_${name}__`), JSON.stringify(fields[name])); } for (const [role, program] of Object.entries(PROGRAMS)) { text = text.replace(JSON.stringify(`__inverse_get_worker_program${role}__`), JSON.stringify(program)); } if (command.method === "Runtime.callFunctionOn") { text = text.replace(JSON.stringify(OLD_FLAGS.objectGroup), JSON.stringify(GROUP)); } assert.deepEqual(JSON.parse(text), { method: command.method, params: command.params });
  }
  assert.equal(PROFILE.renderer.total, 27_705); assert.equal(PROFILE.controls, 182_736); assert.equal(PROFILE.main.reproofs, 103_376);
  const source = currentFootprintInverseNativeGetWorkerNativeSource(); assert.ok(source.includes("AssertInverseNativeQualification();") && source.includes("inverseGetWorkerBound") && source.includes("nativeGetWorkerFailed=true")); assert.ok(!source.includes("Debugger.resume") && !source.includes("ConsumeFootprintInverseGetWorkerReady"));
});

void test("native GET collector follows the actual original worker registration with six original helpers and no GET execution", async context => {
  const full = await readConfiguredEasyedaAsset("pro-mgr/3.2.185.bf63a159/js/project-worker.js"); if (full === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
  const session = new Session(); session.connect(); const group = "inert-original-native-get-prepare"; let contextId: number | undefined, cursor: Cursor | null = null;
  session.on("Runtime.executionContextCreated", e => { if (e.params.context.name === group) { contextId = e.params.context.id; } });
  const deliver = (method: string, params: DiagnosticEvent["params"]): void => { cursor?.observe({ method, params, sessionId: "original_worker" }); };
  session.on("Debugger.scriptParsed", e => { if (e.params.url === "" && e.params.executionContextId === contextId) { deliver(e.method, { ...e.params }); } }); session.on("Debugger.breakpointResolved", e => { deliver(e.method, { ...e.params }); });
  await session.post("Runtime.enable"); await session.post("Debugger.enable"); createContext({}, { name: group }); assert.ok(contextId !== undefined);
  try {
    const compiled = await session.post("Runtime.compileScript", { expression: footprintInverseGetWorkerFixture(full), sourceURL: "inert-native-get.js", executionContextId: contextId, persistScript: true }); assert.ok(compiled.scriptId !== undefined); const run = await session.post("Runtime.runScript", { scriptId: compiled.scriptId, executionContextId: contextId }); assert.equal(run.exceptionDetails, undefined);
    const reference = async (expression: string): Promise<string> => { const raw = await session.post("Runtime.evaluate", { expression, contextId }); assert.equal(raw.exceptionDetails, undefined); assert.ok(raw.result.objectId !== undefined); return raw.result.objectId; };
    const intrinsics = await reference("fixture.I"), prelude = await reference("fixture.prelude"); let requests = 0;
    cursor = new Cursor({ scriptId: compiled.scriptId, sessionId: "original_worker", contextId, current: (): Promise<void> => Promise.resolve(), request: async (c): Promise<unknown> => {
      requests += 1; let raw: unknown;
      if (c.method === "Runtime.callFunctionOn") {
        const base: Runtime.CallFunctionOnParameterType = { objectId: c.params.objectId, functionDeclaration: c.params.functionDeclaration, arguments: c.params.arguments, objectGroup: c.params.objectGroup, returnByValue: c.params.returnByValue, silent: true, generatePreview: false, awaitPromise: false, userGesture: false };
        const request = { ...base, throwOnSideEffect: c.params.throwOnSideEffect }; raw = await session.post("Runtime.callFunctionOn", request);
      }
      else if (c.method === "Runtime.getProperties") { raw = await session.post("Runtime.getProperties", c.params); }
      else if (c.method === "Debugger.getScriptSource") { raw = await session.post("Debugger.getScriptSource", c.params); }
      else { raw = await session.post("Debugger.setBreakpoint", c.params); }
      assert.ok(raw !== null && typeof raw === "object" && !("exceptionDetails" in raw), JSON.stringify(raw)); return raw;
    } });
    const original = cursor; const graph = await collect({ source: full, scriptId: compiled.scriptId, prelude, intrinsics, current: (): void => { assert.equal(cursor, original); }, request: c => original.request(c), qualifyHelper: c => original.qualifyHelper(c) });
    assert.equal(requests, 28); assert.equal(original.requireReady(), graph.point); assert.deepEqual(original.counts(), { normal: 22, helpers: 6 }); original.complete(); assert.equal(original.requireCompleted(), graph.point); assert.equal(graph.getInvoked, false); assert.equal(graph.runtimeJobIssued, false); await assert.rejects(original.request(commandsFirst()));
  } finally { await session.post("Debugger.disable"); session.disconnect(); }
});

/** Select only the fixed first command for an invalid repeat/scheduling test. */
function commandsFirst(): ReturnType<typeof cases>[number] { const first = cases()[0]; assert.ok(first !== undefined); return first; }
void test("concurrent native GET reads spend custody before verification and caller tokens cannot enroll Core", async () => {
  const gate = Promise.withResolvers<boolean>(); let writes = 0;
  const cursor = new Cursor({ scriptId: "original_source", sessionId: "original_worker", contextId: 1, current: async (): Promise<void> => { await gate.promise; }, request: (): Promise<unknown> => { writes += 1; return Promise.resolve({}); } });
  const first = cursor.request(commandsFirst()); await assert.rejects(cursor.request(commandsFirst())); gate.resolve(true); await assert.rejects(first); assert.equal(writes, 0); assert.throws(() => cursor.requireReady());
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- An equal-shaped owner must fail the original Core registry without a request.
  const owner = Object.create(CurrentFootprintInverseNativeOwner.prototype) as CurrentFootprintInverseNativeOwner;
  const qualification = Object.freeze({ profile: "private.current-footprint-inverse-native-delete-qualification.v1" as const }); assert.throws(() => owner.prepareFootprintInverseNativeGetWorker(qualification));
  assert.throws(() => Reflect.apply(requireOriginalCurrentFootprintInverseNativeGetReadiness, undefined, [{ profile: "private.current-footprint-inverse-native-get-readiness.v1" }, owner, {}]));
});
