/* oxlint-disable import/max-dependencies -- This integration test joins the real runner, fixed wire/native generator and isolated source-boundary loader. */
/** Synthetic CDP replies exercise the actual runner and fixed wire. Only the
 * separately tested complete vendor-source issuer is replaced in this fixture. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { CURRENT_FOOTPRINT_COPY_UI_REGISTRY_SOURCE as REGISTRY_SOURCE } from "../src/current-footprint-copy-ui-registry-source.ts";
import type { CurrentFootprintCopyUiRegistryFunction, CurrentFootprintCopyUiRegistrySourceQualification } from "../src/current-footprint-copy-ui-registry-source.ts";
import { FOOTPRINT_COPY_UI_REGISTRY_FIXTURE as REGISTRY_FIXTURE } from "./current-footprint-copy-ui-registry-fixture.ts";
import { CURRENT_FOOTPRINT_COPY_UI_SOURCE as SOURCE } from "../src/current-footprint-copy-ui-source.ts";
import type { CurrentFootprintCopyUiFunction, CurrentFootprintCopyUiSourceQualification } from "../src/current-footprint-copy-ui-source.ts";
import { CURRENT_FOOTPRINT_COPY_UI_FUNCTION_ORDER as ORDER } from "../src/current-footprint-copy-ui-bindings.ts";
import { CURRENT_FOOTPRINT_COPY_UI_REQUESTS, CurrentFootprintCopyUiRunner } from "../src/current-footprint-copy-ui-runner.ts";
import type { CurrentFootprintCopyUiTransport } from "../src/current-footprint-copy-ui-runner.ts";
import { validateCurrentFootprintCopyUiCommand } from "../src/current-footprint-copy-ui-command.ts";
import type { CurrentFootprintCopyUiCommand } from "../src/current-footprint-copy-ui-command.ts";
import { currentFootprintCopyUiNativeCases, currentFootprintCopyUiNativeSource } from "../src/current-footprint-copy-ui-native.ts";
import { currentFootprintCopyUiWire } from "../src/current-footprint-copy-ui-wire.ts";
import { captureCurrentPcbStringClockReply } from "../src/current-pcb-string-clock-reply.ts";
import { FOOTPRINT_COPY_UI_FIXTURE as FIXTURE } from "./current-footprint-copy-ui-fixture.ts";
import type { CurrentFootprintCopyClockRegistrationBinding, CurrentFootprintCopyClockRegistrationTransport } from "../src/current-footprint-copy-clock-registration-runner.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_CALLS as CLOCK_CALLS, CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_FLAGS as CLOCK_FLAGS } from "../src/current-footprint-copy-clock-registration-contract.ts";

type Data = Record<string, unknown>;
// Keep the real transport size while replacing only full-source hash issuance.
// The previous tiny source fixture hid the generic clock capture's text limit.
const registryText = "x".repeat(REGISTRY_SOURCE.bytes);
const registrySource: CurrentFootprintCopyUiRegistrySourceQualification = Object.freeze({ sourceSha256: REGISTRY_SOURCE.sha256, functionCount: 5, runtimeBound: false, executionAuthorized: false });
const binding = Object.freeze({ sessionId: "parent", uniqueContextId: "context", scriptId: "ui",
  projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), windowTabId: "tab_1" });
const source: CurrentFootprintCopyUiSourceQualification = Object.freeze({ sourceSha256: SOURCE.sha256,
  functionCount: 9, runtimeBound: false, executionAuthorized: false });
const property = (name: string, value: Data, writable = false, enumerable = false, configurable = true):
  { name: string; value: Data; writable: boolean; enumerable: boolean; configurable: boolean; isOwn: true } =>
  ({ name, value, writable, enumerable, configurable, isOwn: true });
function metadata(role: CurrentFootprintCopyUiFunction): Data {
  const profile = SOURCE.functions[role];
  const result = [property("name", { type: "string", value: profile.name }), property("length", { type: "number", value: profile.arity })];
  if (role === "contextProducer") { result.push(property("prototype", { type: "object", objectId: "own-prototype" }, true, false, false)); }
  return { result, internalProperties: [
    { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "ui", lineNumber: profile.lineNumber, columnNumber: profile.columnNumber } } },
    { name: "[[Prototype]]", value: { type: profile.async ? "object" : "function", className: profile.async ? "AsyncFunction" : "Function", objectId: "prototype" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", objectId: `${role}-scopes`, description: "Scopes[2]" } },
  ] };
}
function registryMetadata(role: CurrentFootprintCopyUiRegistryFunction): Data {
  const profile = REGISTRY_SOURCE.functions[role];
  const result: Data[] = [property("name", { type: "string", value: profile.name }), property("length", { type: "number", value: profile.arity })];
  if (role === "contextProducer") { result.push(property("prototype", { type: "object", className: "Object", description: "Object", objectId: "registry-context-prototype" }, true, false, false),
    property("arguments", { type: "object", subtype: "null", value: null }, false, false, false), property("caller", { type: "object", subtype: "null", value: null }, false, false, false)); }
  if (role === "registryConstructor") {
    result.push(property("prototype", { type: "object", className: "Object", description: "Object", objectId: "registry-prototype" }, false, false, false),
      property("getInstance", { type: "function", className: "Function", description: REGISTRY_FIXTURE.registryInstance, objectId: "preload:registryInstance" }, true),
      { name: "context", get: { type: "function", className: "Function", description: REGISTRY_FIXTURE.registryContext, objectId: "preload:registryContext" }, set: { type: "undefined" }, enumerable: false, configurable: true, isOwn: true },
      property("LIB_ID_PREFFIX", { type: "string", value: "extend_lib_" }, true, true));
  }
  return { result, internalProperties: [
    { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "preload", lineNumber: profile.lineNumber, columnNumber: profile.columnNumber } } },
    { name: "[[Prototype]]", value: { type: "function", className: "Function", objectId: "registry-function-prototype" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", objectId: `${role}-scopes`, description: "Scopes[2]" } },
  ] };
}
function registryBundle(): Data {
  const roles = ["registryConstructor", "registryHas", "registryInstance", "registryContext"] as const;
  const result: Data[] = Array.from({ length: 8 }, (_, index) => {
    const role = roles[index];
    if (role !== undefined) { return property(String(index), { type: "function", className: "Function", description: REGISTRY_FIXTURE[role], objectId: `preload:${role}` }, true, true); }
    const value: Data = { type: "object", objectId: `registry-object-${String(index)}`, className: ["", "", "", "", "Object", "sl", "Map", "Array"][index] };
    if (index === 6) { value["subtype"] = "map"; }
    if (index === 7) { value["subtype"] = "array"; value["description"] = "Array(7)"; }
    return property(String(index), value, true, true);
  });
  result.push(property("length", { type: "number", value: 8 }, true, false, false));
  return { result, internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", description: "Array(0)", objectId: "registry-array-prototype" } }] };
}
function bundle(kind: "route" | "notification"): Data {
  const count = kind === "route" ? 17 : 7;
  const roles: readonly CurrentFootprintCopyUiFunction[] = kind === "route" ? ORDER : ["wrapper"];
  const result = Array.from({ length: count }, (_, index) => {
    const role = roles[index], value = role === undefined ? { type: kind === "route" && (index === 7 || index === 8 || index === 16) ? "function" : "object", objectId: `native-${String(index)}`, ...(index === 16 ? { className: "Function", description: "function has() { [native code] }" } : {}) } :
      { type: "function", className: SOURCE.functions[role].async ? "AsyncFunction" : "Function", objectId: role, description: FIXTURE[role] };
    return property(String(index), value, true, true);
  });
  result.push(property("length", { type: "number", value: count }, true, false, false));
  return { result, internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", description: "Array(0)", objectId: "array-prototype" } }] };
}
async function constructor(clockModule?: object): Promise<typeof CurrentFootprintCopyUiRunner> {
  const path = new URL("../src/current-footprint-copy-ui-runner.ts", import.meta.url);
  const actualRequire = createRequire(path);
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const program = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${program.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(specifier: string): unknown => {
    if (specifier === "./current-footprint-copy-ui-registry-source.ts") {
      const actual: unknown = actualRequire(specifier); assert.ok(actual !== null && typeof actual === "object");
      return { ...actual, qualifyCurrentFootprintCopyUiRegistrySource: (value: unknown): CurrentFootprintCopyUiRegistrySourceQualification => {
        assert.equal(value, registryText); return registrySource;
      }, requireCurrentFootprintCopyUiRegistrySource: (value: unknown): void => { assert.equal(value, registrySource); } };
    }
    if (specifier === "./current-footprint-copy-ui-source.ts") { return { requireCurrentFootprintCopyUiSource: (value: unknown): void => { assert.equal(value, source); } }; }
    if (specifier === "./current-footprint-copy-clock-registration-runner.ts" && clockModule !== undefined) { return clockModule; }
    return actualRequire(specifier) as unknown;
  }, loaded, loaded.exports]);
  const value = loaded.exports["CurrentFootprintCopyUiRunner"]; assert.ok(typeof value === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Load the actual runner with only its separately tested full vendor-source issuer replaced above.
  return value as typeof CurrentFootprintCopyUiRunner;
}
function fixture(): { commands: CurrentFootprintCopyUiCommand[]; transport: CurrentFootprintCopyUiTransport;
  state: { current: boolean; expireAfter: number; refuseMembership: boolean; scopeReads: number; registrySourceChanged: boolean } } {
  const commands: CurrentFootprintCopyUiCommand[] = [];
  const state = { current: true, expireAfter: 0, refuseMembership: false, scopeReads: 0, registrySourceChanged: false };
  const response = (command: CurrentFootprintCopyUiCommand): unknown => {
    if (command.phase === "release") { return {}; }
    if (command.phase === "registrySource") { return { scriptSource: state.registrySourceChanged ? "changed-preload-source" : registryText }; }
    if (command.phase === "registryContextProducer") { return { result: { type: "function", className: "Function", description: REGISTRY_FIXTURE.contextProducer, objectId: "preload:contextProducer" } }; }
    if (command.phase === "registry") { return { result: { type: "object", subtype: "array", className: "Array", description: "Array(8)", objectId: "registry" } }; }
    if (command.phase === "initial" || command.phase === "route") {
      return { result: { type: "object", subtype: "array", className: "Array", description: command.phase === "initial" ? "Array(7)" : "Array(17)", objectId: command.phase === "initial" ? "notification" : "route" } };
    }
    if (command.phase === "responder") { return { result: { type: "function", className: "AsyncFunction", description: FIXTURE.responder, objectId: "responder" } }; }
    if (command.method === "Runtime.getProperties") {
      const id = command.params.objectId;
      if (id === "registry") { return registryBundle(); }
      const registryRole = id.startsWith("preload:") ? id.slice("preload:".length) : "";
      if (Object.hasOwn(REGISTRY_SOURCE.functions, registryRole)) {
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Exact own-key membership in the fixed preload role table was asserted above.
        return registryMetadata(registryRole as CurrentFootprintCopyUiRegistryFunction);
      }
      if (id === "notification" || id === "route") { return bundle(id); }
      if (id === "native-16") { return { result: [property("name", { type: "string", value: "has" }), property("length", { type: "number", value: 1 })],
        internalProperties: [{ name: "[[Prototype]]", value: { type: "function", className: "Function", objectId: "native-prototype" } },
          { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[0]", objectId: "native-scopes" } }] }; }
      if (id === "wrapper-scopes" || id === "responder-scopes" || id === "registryContext-scopes") {
        state.scopeReads += 1;
        const labels = id === "registryContext-scopes" ? ["Block", "Closure", "Global"] : [id === "wrapper-scopes" ? "Closure (rpcService)" : "Closure", "Global"];
        return { result: labels.map((description, index) => property(String(index), {
          type: "object", subtype: "internal#scope", className: "Object", objectId: `${id}-${String(state.scopeReads)}-${String(index)}`, description,
        }, true, true)) };
      }
      assert.ok(Object.hasOwn(SOURCE.functions, id));
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Exact own-key membership of the fixed role table was asserted immediately above.
      return metadata(id as CurrentFootprintCopyUiFunction);
    }
    if ((command.phase === "membership" || command.phase === "routeRecheck") && state.refuseMembership) { return { exceptionDetails: { text: "occupied" } }; }
    return { result: { type: "boolean", value: true } };
  };
  return { commands, state, transport: {
    assertCurrent(): Promise<void> { assert.ok(state.current, "original parent lost"); return Promise.resolve(); },
    request(command): Promise<unknown> {
      commands.push(command); const result = response(command);
      if (commands.length === state.expireAfter) { state.current = false; }
      return Promise.resolve(result);
    },
  } };
}

void test("UI runner qualifies every function before membership, retains native arrays and freshly rechecks scopes", async () => {
  const Constructor = await constructor(), value = fixture();
  const runner = new Constructor(source, value.transport, binding);
  const packet = await runner.observe(); assert.equal(value.commands.length, 39);
  assert.equal(value.commands[16]?.phase, "properties"); assert.equal(value.commands[27]?.phase, "membership");
  assert.equal(value.state.scopeReads, 6); assert.equal(packet.projectWorkerTargetBound, false);
  await runner.requireOriginal(packet); assert.equal(value.commands.length, 50); assert.equal(value.state.scopeReads, 9);
  assert.notDeepEqual(value.commands[37], value.commands[48]);
  await runner.release(); assert.equal(value.commands.length, 51); assert.equal(runner.retained().released, true);
  await assert.rejects(runner.release()); await assert.rejects(runner.requireOriginal(packet)); await assert.rejects(runner.observe());
});

void test("UI runner retains full preload source through observation and reproof without small clock recapture", async () => {
  assert.throws(() => { captureCurrentPcbStringClockReply({ scriptSource: registryText }); }, /PCB_STRING_CLOCK_REPLY_CAPTURE/u);
  const Constructor = await constructor(), value = fixture();
  const runner = new Constructor(source, value.transport, binding);
  const packet = await runner.observe(); await runner.requireOriginal(packet);
  const retained = runner.retained().replies.filter((reply): reply is object => reply !== null && typeof reply === "object" && Object.hasOwn(reply, "scriptSource"));
  assert.equal(retained.length, 3);
  for (const reply of retained) { assert.equal(Reflect.get(reply, "scriptSource"), registryText); }
  assert.equal(value.commands.length, 50); await runner.release();
});

void test("UI full preload reply is retained before awaited owner loss and the attempt stays consumed", async () => {
  const Constructor = await constructor(), value = fixture(); value.state.expireAfter = 24;
  const runner = new Constructor(source, value.transport, binding);
  await assert.rejects(runner.observe(), /original parent lost/u);
  assert.equal(value.commands.at(-1)?.phase, "registrySource"); assert.equal(runner.retained().replies.length, 24);
  const last = runner.retained().replies.at(-1); assert.ok(last !== null && typeof last === "object");
  assert.equal(Reflect.get(last, "scriptSource"), registryText);
  assert.equal(value.commands.some(command => command.phase === "membership"), false);
  await assert.rejects(runner.observe()); assert.equal(value.commands.length, 24);
});

void test("UI runner retains delivered evidence before owner loss and refuses replay", async () => {
  const Constructor = await constructor(), value = fixture(); value.state.expireAfter = 5;
  const runner = new Constructor(source, value.transport, binding);
  await assert.rejects(runner.observe(), /original parent lost/u);
  assert.equal(runner.retained().requests, 5); assert.equal(runner.retained().replies.length, 5);
  await assert.rejects(runner.observe()); assert.equal(value.commands.length, 5);
});

void test("UI current registry absence is rechecked and copied packets cannot recreate ownership", async () => {
  const Constructor = await constructor(), value = fixture();
  const runner = new Constructor(source, value.transport, binding);
  const packet = await runner.observe(); value.state.refuseMembership = true;
  await assert.rejects(runner.requireOriginal(packet)); assert.equal(value.commands.at(-1)?.phase, "routeRecheck");
  assert.equal(runner.retained().failed, true); await runner.release();
  const other = fixture(), second = new Constructor(source, other.transport, binding); const secondPacket = await second.observe();
  await assert.rejects(second.requireOriginal(structuredClone(secondPacket))); assert.equal(other.commands.length, 39);
});

void test("UI source copies and transport accessors are rejected before dispatch", async () => {
  const value = fixture(); assert.throws(() => new CurrentFootprintCopyUiRunner(source, value.transport, binding));
  assert.equal(value.commands.length, 0);
  const Constructor = await constructor(); let invoked = 0;
  Object.defineProperty(value.transport, "request", { get(): never { invoked += 1; throw new Error("must not call getter"); } });
  assert.throws(() => new Constructor(source, value.transport, binding)); assert.equal(invoked, 0);
});

void test("UI native grammar reconstructs thirteen fixed commands and rejects program, argument and field substitutions", () => {
  const cases = currentFootprintCopyUiNativeCases(); assert.equal(cases.length, 13);
  for (const command of cases) {
    const wire = currentFootprintCopyUiWire(command, 123); assert.equal(wire.request["parentPhase"], `footprint-copy-ui-${command.phase}`);
    assert.equal(Object.hasOwn(wire.request, "sessionId"), false); assert.equal(wire.command.id, 123);
    assert.throws(() => validateCurrentFootprintCopyUiCommand({ ...command, extra: true }));
    if (command.method === "Runtime.callFunctionOn") {
      assert.throws(() => validateCurrentFootprintCopyUiCommand({ ...command, params: { ...command.params, functionDeclaration: "function(){return true}" } }));
      assert.throws(() => validateCurrentFootprintCopyUiCommand({ ...command, params: { ...command.params, arguments: [] } }));
    }
  }
  const native = currentFootprintCopyUiNativeSource(); assert.ok(Buffer.byteLength(native) < 10_000);
  assert.match(native, /originalParentSession/u); assert.match(native, /fields.Count==names.Length/u);
  assert.equal(CURRENT_FOOTPRINT_COPY_UI_REQUESTS.observe, 39); assert.equal(CURRENT_FOOTPRINT_COPY_UI_REQUESTS.reprove, 11);
});

void test("UI clock child composition binds original lifetime, receipt, transport methods and parent session", async () => {
  for (const failure of ["owner", "transport", "release"]) {
    const capture: { transport?: CurrentFootprintCopyClockRegistrationTransport; binding?: CurrentFootprintCopyClockRegistrationBinding } = {};
    // Capture constructor arguments here; clock-registration tests exercise
    // The actual child collector independently.
    // oxlint-disable-next-line typescript/no-extraneous-class -- The original parent issues a new child instance; this fixture captures that exact construction boundary.
    class Child {
      public constructor(input: unknown, transport: CurrentFootprintCopyClockRegistrationTransport, childBinding: CurrentFootprintCopyClockRegistrationBinding) {
        assert.equal(input, source); capture.transport = transport; capture.binding = childBinding;
      }
    }
    const Constructor = await constructor({ CurrentFootprintCopyClockRegistrationRunner: Child }), value = fixture();
    const runner = new Constructor(source, value.transport, binding); const packet = await runner.observe(); let calls = 0;
    const transport: CurrentFootprintCopyClockRegistrationTransport = { assertCurrent: (): Promise<void> => Promise.resolve(), request: (): Promise<unknown> => { calls += 1; return Promise.resolve({}); } };
    assert.throws(() => runner.createClockRegistration(structuredClone(packet), transport));
    runner.createClockRegistration(packet, transport); assert.throws(() => runner.createClockRegistration(packet, transport));
    const original = capture.transport; assert.ok(original !== undefined); assert.equal(capture.binding?.sessionId, binding.sessionId); assert.equal(capture.binding.uiRoute, "route");
    await original.assertCurrent();
    const command = { phase: "callback" as const, method: "Runtime.callFunctionOn" as const, sessionId: binding.sessionId, params: { ...CLOCK_FLAGS, objectId: "scope", functionDeclaration: CLOCK_CALLS.callback.program, arguments: [], returnByValue: false } };
    await original.request(command); assert.equal(calls, 1); assert.throws(() => original.request({ ...command, sessionId: "another" })); assert.equal(calls, 1);
    if (failure === "owner") { value.state.current = false; }
    else if (failure === "transport") { Object.defineProperty(transport, "request", { value: (): Promise<unknown> => { calls += 1; return Promise.resolve({}); } }); }
    else { await runner.release(); }
    await assert.rejects(original.assertCurrent()); assert.equal(calls, 1);
  }
});

void test("UI runner retains native exception evidence and reports its phase before success-shape parsing", async () => {
  const Constructor = await constructor(), value = fixture();
  const original = value.transport.request;
  const exception = { result: { type: "object", subtype: "error", className: "Error", objectId: "exception" },
    exceptionDetails: { lineNumber: 1, columnNumber: 15, exception: { description: "Error: FOOTPRINT_COPY_UI_BINDING:MAP_PROTOTYPE" } } };
  const transport: CurrentFootprintCopyUiTransport = { ...value.transport,
    request: (command): Promise<unknown> => command.phase === "route" ? Promise.resolve(exception) : original(command) };
  const runner = new Constructor(source, transport, binding);
  await assert.rejects(runner.observe(), /FOOTPRINT_COPY_UI_CDP_EXCEPTION:route:MAP_PROTOTYPE:1:15/u);
  assert.equal(runner.retained().requests, 8); assert.deepEqual(structuredClone(runner.retained().replies.at(-1)), exception);
  assert.equal(runner.retained().failed, true); await assert.rejects(runner.observe()); await runner.release();
});

void test("preload source drift refuses before membership and the retained registry is reproved before reuse", async () => {
  const Constructor = await constructor(), value = fixture(); value.state.registrySourceChanged = true;
  const runner = new Constructor(source, value.transport, binding);
  await assert.rejects(runner.observe());
  assert.equal(value.commands.some(command => command.phase === "membership"), false);
  const retained = fixture(), second = new Constructor(source, retained.transport, binding);
  const packet = await second.observe();
  retained.state.registrySourceChanged = true;
  const before = retained.commands.length; await assert.rejects(second.requireOriginal(packet));
  assert.equal(retained.commands.at(-1)?.phase, "registrySource");
  assert.equal(retained.commands.slice(before).some(command => command.phase === "routeRecheck"), false);
  assert.equal(second.retained().failed, true); await second.release();
});
