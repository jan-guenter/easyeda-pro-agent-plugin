/* oxlint-disable import/max-dependencies -- This integration test joins the real runner, fixed wire/native generator and isolated source-boundary loader. */
/** Synthetic CDP replies exercise the actual runner and fixed wire. Only the
 * separately tested complete vendor-source issuer is replaced in this fixture. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { CURRENT_FOOTPRINT_COPY_UI_SOURCE as SOURCE } from "../src/current-footprint-copy-ui-source.ts";
import type { CurrentFootprintCopyUiFunction, CurrentFootprintCopyUiSourceQualification } from "../src/current-footprint-copy-ui-source.ts";
import { CURRENT_FOOTPRINT_COPY_UI_FUNCTION_ORDER as ORDER } from "../src/current-footprint-copy-ui-bindings.ts";
import { CURRENT_FOOTPRINT_COPY_UI_REQUESTS, CurrentFootprintCopyUiRunner } from "../src/current-footprint-copy-ui-runner.ts";
import type { CurrentFootprintCopyUiTransport } from "../src/current-footprint-copy-ui-runner.ts";
import { validateCurrentFootprintCopyUiCommand } from "../src/current-footprint-copy-ui-command.ts";
import type { CurrentFootprintCopyUiCommand } from "../src/current-footprint-copy-ui-command.ts";
import { currentFootprintCopyUiNativeCases, currentFootprintCopyUiNativeSource } from "../src/current-footprint-copy-ui-native.ts";
import { currentFootprintCopyUiWire } from "../src/current-footprint-copy-ui-wire.ts";
import { FOOTPRINT_COPY_UI_FIXTURE as FIXTURE } from "./current-footprint-copy-ui-fixture.ts";

type Data = Record<string, unknown>;
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
async function constructor(): Promise<typeof CurrentFootprintCopyUiRunner> {
  const path = new URL("../src/current-footprint-copy-ui-runner.ts", import.meta.url);
  const actualRequire = createRequire(path);
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const program = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${program.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(specifier: string): unknown => specifier === "./current-footprint-copy-ui-source.ts" ? {
    requireCurrentFootprintCopyUiSource: (value: unknown): void => { assert.equal(value, source); },
  } : actualRequire(specifier) as unknown, loaded, loaded.exports]);
  const value = loaded.exports["CurrentFootprintCopyUiRunner"]; assert.ok(typeof value === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Load the actual runner with only its separately tested full vendor-source issuer replaced above.
  return value as typeof CurrentFootprintCopyUiRunner;
}
function fixture(): { commands: CurrentFootprintCopyUiCommand[]; transport: CurrentFootprintCopyUiTransport;
  state: { current: boolean; expireAfter: number; refuseMembership: boolean; scopeReads: number } } {
  const commands: CurrentFootprintCopyUiCommand[] = [];
  const state = { current: true, expireAfter: 0, refuseMembership: false, scopeReads: 0 };
  const response = (command: CurrentFootprintCopyUiCommand): unknown => {
    if (command.phase === "release") { return {}; }
    if (command.phase === "initial" || command.phase === "route") {
      return { result: { type: "object", subtype: "array", className: "Array", description: command.phase === "initial" ? "Array(7)" : "Array(17)", objectId: command.phase === "initial" ? "notification" : "route" } };
    }
    if (command.phase === "responder") { return { result: { type: "function", className: "AsyncFunction", description: FIXTURE.responder, objectId: "responder" } }; }
    if (command.method === "Runtime.getProperties") {
      const id = command.params.objectId;
      if (id === "notification" || id === "route") { return bundle(id); }
      if (id === "native-16") { return { result: [property("name", { type: "string", value: "has" }), property("length", { type: "number", value: 1 })],
        internalProperties: [{ name: "[[Prototype]]", value: { type: "function", className: "Function", objectId: "native-prototype" } },
          { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[0]", objectId: "native-scopes" } }] }; }
      if (id === "wrapper-scopes" || id === "responder-scopes") {
        state.scopeReads += 1;
        return { result: [id === "wrapper-scopes" ? "Closure (rpcService)" : "Closure", "Global"].map((description, index) => property(String(index), {
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
  const packet = await runner.observe(); assert.equal(value.commands.length, 25);
  assert.equal(value.commands[16]?.phase, "properties"); assert.equal(value.commands[17]?.phase, "membership");
  assert.equal(value.state.scopeReads, 4); assert.equal(packet.projectWorkerTargetBound, false);
  await runner.requireOriginal(packet); assert.equal(value.commands.length, 32); assert.equal(value.state.scopeReads, 6);
  assert.notDeepEqual(value.commands[23], value.commands[30]);
  await runner.release(); assert.equal(value.commands.length, 33); assert.equal(runner.retained().released, true);
  await assert.rejects(runner.release()); await assert.rejects(runner.requireOriginal(packet)); await assert.rejects(runner.observe());
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
  await assert.rejects(second.requireOriginal(structuredClone(secondPacket))); assert.equal(other.commands.length, 25);
});

void test("UI source copies and transport accessors are rejected before dispatch", async () => {
  const value = fixture(); assert.throws(() => new CurrentFootprintCopyUiRunner(source, value.transport, binding));
  assert.equal(value.commands.length, 0);
  const Constructor = await constructor(); let invoked = 0;
  Object.defineProperty(value.transport, "request", { get(): never { invoked += 1; throw new Error("must not call getter"); } });
  assert.throws(() => new Constructor(source, value.transport, binding)); assert.equal(invoked, 0);
});

void test("UI native grammar reconstructs nine fixed commands and rejects program, argument and field substitutions", () => {
  const cases = currentFootprintCopyUiNativeCases(); assert.equal(cases.length, 9);
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
  assert.equal(CURRENT_FOOTPRINT_COPY_UI_REQUESTS.observe, 25); assert.equal(CURRENT_FOOTPRINT_COPY_UI_REQUESTS.reprove, 7);
});
