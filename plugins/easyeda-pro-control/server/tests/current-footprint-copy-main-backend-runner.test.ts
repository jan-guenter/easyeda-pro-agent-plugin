/** Synthetic original transport callback ordering. No application or design is
 * connected, and source qualification below is explicitly an identity issuer. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { transform } from "esbuild";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE as SOURCE } from "../src/current-footprint-copy-main-backend-source.ts";
import type { CurrentFootprintCopyMainBackendRole as Role } from "../src/current-footprint-copy-main-backend-source.ts";
import type { CurrentFootprintCopyMainBackendCommand as Command } from "../src/current-footprint-copy-main-backend-contract.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REGISTRATION_BREAKPOINT_ID as REGISTRATION_ID } from "../src/current-footprint-copy-main-backend-contract.ts";
import type { CurrentFootprintCopyMainBackendRunner, CurrentFootprintCopyMainBackendTransport } from "../src/current-footprint-copy-main-backend-runner.ts";
import { mainBackendFragments as fragments } from "./helpers/footprint-main-backend-fragments.ts";

type Data = Record<string, unknown>;
const qualified = Object.freeze({ profile: "private.current-footprint-copy-main-backend-source.v1", sha256: SOURCE.sha256, runtimeBound: false, executionAuthorized: false });
async function constructor(): Promise<typeof CurrentFootprintCopyMainBackendRunner> {
  const path = new URL("../src/current-footprint-copy-main-backend-runner.ts", import.meta.url);
  const loaded: { exports: Record<string, unknown> } = { exports: {} }, originalRequire = createRequire(path);
  const output = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = vm.runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  const source: unknown = originalRequire("./current-footprint-copy-main-backend-source.ts"); assert.ok(source !== null && typeof source === "object");
  Reflect.apply(evaluate, undefined, [(specifier: string): unknown => {
    if (specifier === "./current-footprint-copy-main-backend-source.ts") { return { ...source,
      qualifyCurrentFootprintCopyMainBackendSource: (value: unknown): typeof qualified => { assert.equal(value, "synthetic-complete-app-source"); return qualified; },
      requireCurrentFootprintCopyMainBackendSource: (value: unknown): void => { assert.equal(value, qualified); } }; }
    return originalRequire(specifier) as unknown;
  }, loaded, loaded.exports]);
  const result = loaded.exports["CurrentFootprintCopyMainBackendRunner"]; assert.equal(typeof result, "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The original class is loaded with one explicitly synthetic full-source issuer and identity checker.
  return result as typeof CurrentFootprintCopyMainBackendRunner;
}
function property(name: string, value: Data, writable = false, enumerable = false, configurable = true): Data { return { name, value, writable, enumerable, configurable, isOwn: true }; }
function internal(native: boolean, async = false): Data[] {
  return [{ name: "[[Prototype]]", value: { type: async ? "object" : "function", className: async ? "AsyncFunction" : "Function", objectId: "function-prototype" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: native ? "Scopes[0]" : "Scopes[1]", objectId: "scopes" } }];
}
function metadata(role: Role): Data {
  const profile = SOURCE.functions[role], result = [property("name", { type: "string", value: profile.name }), property("length", { type: "number", value: profile.arity })];
  if (!profile.async) { result.push(property("prototype", { type: "object", className: "Object", objectId: "router-prototype" }, true, false, false)); }
  return { result, internalProperties: [{ name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: {
    scriptId: "app", lineNumber: profile.lineNumber, columnNumber: profile.columnNumber } } }, ...internal(false, profile.async)] };
}
function nativeMetadata(role: "Date" | "now"): Data {
  const result = [property("name", { type: "string", value: role }), property("length", { type: "number", value: role === "Date" ? 7 : 0 })];
  if (role === "Date") {
    result.push(property("prototype", { type: "object", className: "Object", objectId: "date-prototype" }, false, false, false));
    for (const name of ["now", "parse", "UTC"]) { result.push(property(name, { type: "function", className: "Function", objectId: `native-${name}`, description: `function ${name}() { [native code] }` }, true)); }
  }
  return { result, internalProperties: internal(true) };
}
function array(): Data {
  const roles = new Map<number, Role>([[3, "protocolCallback"], [5, "driverIntercept"], [6, "driverCallback"], [7, "router"], [8, "actorClock"], [9, "projectSql"]]);
  const result = Array.from({ length: 12 }, (_, index) => {
    const role = roles.get(index); let value: Data = { type: "object", objectId: `member-${String(index)}` };
    if (role !== undefined) { value = { type: "function", className: SOURCE.functions[role].async ? "AsyncFunction" : "Function", description: fragments[role], objectId: role }; }
    else if (index === 10 || index === 11) { value = { type: "function", className: "Function", objectId: index === 10 ? "Date" : "now" }; }
    return property(String(index), value, true, true);
  });
  result.push(property("length", { type: "number", value: 12 }, true, false, false));
  return { result, internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", objectId: "array-prototype" } }] };
}
function fixture(): Readonly<{ transport: CurrentFootprintCopyMainBackendTransport; commands: Command[]; state: {
  current: boolean; wrongSource: boolean; foreignPause: boolean; duplicateResume: boolean; sendFailure: string; malformedChunk: boolean; resumeCount: number; polls: number;
  registrationColumnDelta: number; foreignRegistrationScript: boolean;
} }> {
  const commands: Command[] = [], queue: string[] = [];
  const state = { current: true, wrongSource: false, foreignPause: false, duplicateResume: false, sendFailure: "", malformedChunk: false, resumeCount: 0, polls: 0,
    registrationColumnDelta: 0, foreignRegistrationScript: false };
  const event = (method: string, params: Data): void => { queue.push(`${JSON.stringify({ method, params })}\0`); };
  function response(command: Command): unknown {
    if (command.phase === "debugger-enable") { return { debuggerId: "main-debugger" }; }
    if (command.phase === "registration-arm") { return { breakpointId: REGISTRATION_ID, locations: [] }; }
    if (command.phase === "run-waiting") { event("Debugger.paused", { reason: state.foreignPause ? "other" : "Break on start", hitBreakpoints: [], callFrames: [{ callFrameId: "initial-frame", location: { scriptId: "internal", lineNumber: 1, columnNumber: 0 } }] }); return {}; }
    if (command.phase === "resume") {
      state.resumeCount += 1; event("Debugger.resumed", {}); if (state.duplicateResume) { event("Debugger.resumed", {}); }
      if (state.resumeCount === 1) {
        const registeredLocation = { scriptId: state.foreignRegistrationScript ? "foreign" : "app", lineNumber: SOURCE.registration.https.lineNumber,
          columnNumber: SOURCE.registration.https.breakpointColumnNumber + state.registrationColumnDelta };
        event("Debugger.scriptParsed", { scriptId: "app", url: "file:///synthetic/app.js", executionContextId: 1 });
        event("Debugger.breakpointResolved", { breakpointId: REGISTRATION_ID, location: registeredLocation });
        event("Debugger.paused", { reason: "other", hitBreakpoints: [REGISTRATION_ID], callFrames: [{ callFrameId: "registration-frame", location: registeredLocation }] });
      }
      return {};
    }
    if (command.phase === "source") { return { scriptSource: state.wrongSource ? "drift" : "synthetic-complete-app-source" }; }
    if (command.phase === "frame" || command.phase === "capture") { return { result: { type: "object", subtype: "array", className: "Array", description: command.phase === "frame" ? "Array(8)" : "Array(12)", objectId: command.phase } }; }
    if (command.phase === "require") { return { result: { type: "boolean", value: true } }; }
    if (command.phase === "properties") {
      const id = command.params.objectId;
      if (id === "capture") { return array(); }
      if (id === "Date" || id === "now") { return nativeMetadata(id); }
      assert.ok(Object.hasOwn(SOURCE.functions, id));
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Above membership check restricts this synthetic remote handle to the exact six role literals.
      return metadata(id as Role);
    }
    return {};
  }
  const transport: CurrentFootprintCopyMainBackendTransport = Object.freeze({
    assertCurrent(): Promise<void> { assert.ok(state.current, "original transport lost"); return Promise.resolve(); },
    send(command: Command, id: number): Promise<void> {
      assert.equal(id, commands.length + 1); commands.push(command);
      if (state.sendFailure === command.phase) { return Promise.reject(new Error("lost original send acknowledgment")); }
      const result = response(command); queue.push(`${JSON.stringify({ id, result })}\0`); return Promise.resolve();
    },
    poll(): Promise<string> { state.polls += 1; if (state.malformedChunk) { return Promise.resolve("===="); } return Promise.resolve(Buffer.from(queue.shift() ?? "").toString("base64")); },
  });
  return { transport, commands, state };
}
void test("original main startup arms registration before its one initial continuation and retains exact construction without invoking app methods", async () => {
  const Constructor = await constructor(), value = fixture(); const runner = new Constructor(value.transport); const packet = await runner.observe();
  assert.equal(value.state.resumeCount, 2); assert.equal(packet.initialContinuationCount, 1); assert.equal(packet.executionAuthorized, false); assert.equal(packet.protocolRegistrationObserved, false);
  assert.deepEqual(value.commands.slice(0, 6).map(command => command.phase), ["runtime-enable", "debugger-enable", "registration-arm", "run-waiting", "resume", "source"]);
  await runner.reprove(packet); await runner.release(); assert.equal(runner.retained().released, true); assert.equal(runner.retained().pendingReplies, 0);
  await assert.rejects(runner.observe()); await assert.rejects(runner.reprove(structuredClone(packet))); await assert.rejects(runner.release());
});
void test("a rejected original registration retains bounded location and script-membership evidence before lexical evaluation", async () => {
  const Constructor = await constructor();
  for (const foreign of [false, true]) {
    const value = fixture(); value.state.foreignRegistrationScript = foreign; value.state.registrationColumnDelta = foreign ? 0 : 9;
    const runner = new Constructor(value.transport); await assert.rejects(runner.observe(), /REGISTRATION_LOCATION/u);
    const retained = runner.retained().registrationLocationFailure;
    assert.deepEqual(retained, { lineNumber: SOURCE.registration.https.lineNumber,
      columnNumber: SOURCE.registration.https.breakpointColumnNumber + value.state.registrationColumnDelta, scriptObserved: !foreign });
    assert.ok(Object.isFrozen(retained));
    assert.equal(value.commands.some(command => command.phase === "source" || command.phase === "frame" || command.phase === "capture"), false);
    value.state.current = false; await assert.rejects(runner.release());
    assert.equal(runner.retained().registrationLocationFailure, retained);
  }
});
void test("source drift, foreign pauses and duplicate resume events refuse before lexical evaluation without repeating continuation", async () => {
  const Constructor = await constructor();
  for (const failure of ["wrongSource", "foreignPause", "duplicateResume"] as const) {
    const value = fixture(); value.state[failure] = true; const runner = new Constructor(value.transport); await assert.rejects(runner.observe());
    assert.equal(value.commands.some(command => command.phase === "frame" || command.phase === "capture"), false); assert.ok(value.state.resumeCount <= 1);
    const count = value.commands.length; await assert.rejects(runner.observe()); assert.equal(value.commands.length, count); assert.equal(runner.retained().failed, true);
  }
});
void test("a lost original write acknowledgment or malformed framing consumes the attempt and retains its pending reply", async () => {
  const Constructor = await constructor();
  for (const failure of ["send", "chunk"] as const) {
    const value = fixture(); if (failure === "send") { value.state.sendFailure = "runtime-enable"; } else { value.state.malformedChunk = true; }
    const runner = new Constructor(value.transport); await assert.rejects(runner.observe()); assert.equal(value.commands.length, 1); assert.equal(runner.retained().pendingReplies, 1);
    await assert.rejects(runner.release()); assert.equal(value.commands.length, 1); await assert.rejects(runner.observe());
  }
});
