/** Fixed scalar wire/native-table checks only. No app, native owner, source
 * asset, SQL driver or inspector connection is opened. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { gunzipSync } from "node:zlib";
import { currentFootprintCopyMainCompletionNativeCases, currentFootprintCopyMainCompletionNativeSource } from "../src/current-footprint-copy-main-completion-native.ts";
import { currentFootprintCopyMainCompletionWire } from "../src/current-footprint-copy-main-completion-wire.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS as REQUESTS, currentFootprintCopyMainCompletionNativeCommand } from "../src/current-footprint-copy-main-completion-protocol.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_ORDER as ORDER } from "../src/current-footprint-copy-main-completion-source.ts";

void test("48 native variants reconstruct exact main completion commands without forwarding programs or source coordinates", () => {
  const cases = currentFootprintCopyMainCompletionNativeCases(), source = currentFootprintCopyMainCompletionNativeSource();
  assert.equal(cases.length, 48);
  const encoded = /FromBase64String\(@"([A-Za-z\d+/=]+)"\)/u.exec(source)?.[1]; assert.ok(encoded !== undefined);
  // oxlint-disable-next-line node/no-sync -- Decode a bounded facade-generated in-memory table, without reading app or user input.
  const rows = gunzipSync(Buffer.from(encoded, "base64"), { maxOutputLength: 1_048_576 }).toString("utf8").split("\0");
  assert.equal(rows.length, cases.length);
  const phases = new Set<string>();
  for (const [index, command] of cases.entries()) {
    const row = rows[index]?.split("\t"), wire = currentFootprintCopyMainCompletionWire(command, 73);
    assert.ok(row !== undefined && row.length === 4);
    const [phase, method, fields, template] = row; assert.ok(phase !== undefined && fields !== undefined && template !== undefined);
    assert.equal(phases.has(phase), false); phases.add(phase);
    assert.equal(phase, wire.request["phase"]); assert.equal(method, command.method);
    const actualFields = Object.keys(wire.request).filter(name => !["action", "requestId", "phase", "method"].includes(name));
    assert.deepEqual(fields === "" ? [] : fields.split(","), actualFields);
    const restored = template.replaceAll(/"__maincompletion_([A-Za-z\d]+)__"/gu, (_whole, name: string) => JSON.stringify(wire.request[name]));
    const actual: unknown = JSON.parse(restored);
    assert.deepEqual(actual, { method: command.method, params: command.params });
    assert.deepEqual({ id: 73, ...actual }, currentFootprintCopyMainCompletionNativeCommand(command, 73));
    assert.equal(wire.request["action"], "main-completion-send"); assert.equal(wire.request["requestId"], 73);
    for (const forbidden of ["sessionId", "url", "functionDeclaration", "expression", "condition", "location", "lineNumber", "columnNumber", "arguments", "params", "stage", "role"]) {
      assert.equal(Object.hasOwn(wire.request, forbidden), false);
    }
    assert.ok(Object.values(wire.request).every(value => typeof value === "string" || typeof value === "number"));
    assert.equal(Object.isFrozen(wire), true); assert.equal(Object.isFrozen(wire.request), true); assert.equal(Object.isFrozen(wire.command.params), true);
  }
  assert.equal(phases.has("completion-site-callback-enter"), false);
  assert.equal(phases.has("completion-callback-arm"), true);
  for (const stage of ORDER) {
    assert.equal(phases.has(`completion-join-${stage}`), true); assert.equal(phases.has(`completion-frame-${stage}`), true);
  }
  assert.deepEqual(REQUESTS, { normal: 45, cleanup: 30, total: 75 });
});

void test("wire validation rejects supplied transport/code, altered fixed commands and malformed scalar handles before projection", () => {
  for (const command of currentFootprintCopyMainCompletionNativeCases()) {
    for (const id of [0, -0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 2_147_483_648, "73"]) {
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Deliberately send runtime-invalid caller IDs through the actual public boundary.
      assert.throws(() => currentFootprintCopyMainCompletionWire(command, id as number));
    }
    assert.equal(currentFootprintCopyMainCompletionWire(command, 2_147_483_647).request["requestId"], 2_147_483_647);
    for (const field of ["url", "sessionId", "program", "expression", "callback", "stageExtra"]) {
      assert.throws(() => currentFootprintCopyMainCompletionWire({ ...command, [field]: "copied" }, 73));
    }
    assert.throws(() => currentFootprintCopyMainCompletionWire({ ...command, method: "Runtime.evaluate" }, 73));
    assert.throws(() => currentFootprintCopyMainCompletionWire({ ...command, params: { ...command.params, sessionId: "copied" } }, 73));
    if (command.phase === "completion-source-arm") {
      assert.throws(() => currentFootprintCopyMainCompletionWire({ ...command, params: { ...command.params, condition: "true" } }, 73));
      assert.throws(() => currentFootprintCopyMainCompletionWire({ ...command, params: { ...command.params, location: { ...command.params.location, columnNumber: command.params.location.columnNumber + 1 } } }, 73));
    } else if (command.phase === "completion-frame") {
      assert.throws(() => currentFootprintCopyMainCompletionWire({ ...command, params: { ...command.params, expression: "globalThis" } }, 73));
    } else if (command.phase === "completion-join") {
      assert.throws(() => currentFootprintCopyMainCompletionWire({ ...command, params: { ...command.params, arguments: [], functionDeclaration: "function(){return true;}" } }, 73));
      assert.throws(() => currentFootprintCopyMainCompletionWire({ ...command, params: { ...command.params, returnByValue: !command.params.returnByValue } }, 73));
      assert.throws(() => currentFootprintCopyMainCompletionWire({ ...command, params: { ...command.params, arguments: [{ value: "copied" }] } }, 73));
    }
  }
  const properties = currentFootprintCopyMainCompletionNativeCases().find(command => command.phase === "completion-properties"); assert.ok(properties !== undefined);
  for (const objectId of ["", "x".repeat(257), "valid\n", "\"injected\"", "invalid\\", 1, null, undefined]) {
    assert.throws(() => currentFootprintCopyMainCompletionWire({ ...properties, params: { ...properties.params, objectId } }, 73));
  }
  for (const objectId of ["x".repeat(256), "__maincompletion_objectId__", "A._:-09"]) {
    const wire = currentFootprintCopyMainCompletionWire({ ...properties, params: { ...properties.params, objectId } }, 73);
    assert.equal(wire.request["objectId"], objectId);
  }
});

void test("getter/proxy input cannot enter the fixed flat projection", () => {
  let calls = 0;
  const command = currentFootprintCopyMainCompletionNativeCases()[0]; assert.ok(command !== undefined);
  const accessor = { ...command }; Object.defineProperty(accessor, "method", { enumerable: true, get: (): string => { calls += 1; return command.method; } });
  assert.throws(() => currentFootprintCopyMainCompletionWire(accessor, 73)); assert.equal(calls, 0);
  const proxy = new Proxy(command, { get: (): unknown => { calls += 1; return "copied"; } });
  assert.throws(() => currentFootprintCopyMainCompletionWire(proxy, 73)); assert.equal(calls, 0);
});
