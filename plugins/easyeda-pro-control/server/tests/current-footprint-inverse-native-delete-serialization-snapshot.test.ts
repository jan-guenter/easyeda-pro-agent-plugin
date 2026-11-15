/** Read-only protocol surrogates exercise only the pre-await data snapshot. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { observeCurrentFootprintInverseNativeDeleteSerialization as observe } from "../src/current-footprint-inverse-native-delete-serialization-observer.ts";
import type { CurrentFootprintInverseNativeDeleteSerializationBindings as Bindings } from "../src/current-footprint-inverse-native-delete-serialization-observer.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_BEGIN as BEGIN } from "../src/current-footprint-inverse-native-delete-serialization-profile.ts";

const expected = (): Bindings["expected"] => ({ projectUuid: "a".repeat(64), branchUuid: "b".repeat(32),
  targetUuid: "c".repeat(16), client: "d".repeat(16), maximumTicket: 7, documentClock: 9 });
const unexpected = (): never => { throw new Error("unexpected continuation"); };
function bindings(value: Bindings["expected"], request: Bindings["request"]): Bindings {
  return { originalUploadPoint: "original_upload", intrinsics: "original_intrinsics", accepted: "original_accepted",
    initial: { method: "Debugger.paused", sessionId: "worker", params: { reason: "other", hitBreakpoints: ["original_begin"],
      callFrames: [{ callFrameId: "frame", functionName: BEGIN.functionName,
        location: { scriptId: "script", lineNumber: BEGIN.lineNumber, columnNumber: BEGIN.columnNumber },
        functionLocation: { scriptId: "script", lineNumber: BEGIN.functionLine, columnNumber: BEGIN.functionColumn } }] } },
    scriptId: "script", sessionId: "worker", expected: value, texts: ["head", "delete", "body"], current: (): void => { assert.ok(Object.hasOwn(value, "projectUuid")); },
    request, qualifyHelper: (): Promise<void> => Promise.resolve(), retainPoint: unexpected, next: unexpected, resume: unexpected, control: unexpected };
}
function capture(count: number): unknown {
  return { result: { type: "object", subtype: "array", className: "Array", objectId: "tuple", description: `Array(${String(count)})` } };
}
function environment(): unknown {
  return { result: [...Array.from({ length: 8 }, (_, i) => ({ name: String(i), value: { type: "function", objectId: `native_${String(i)}` },
    writable: true, configurable: true, enumerable: true, isOwn: true })),
    { name: "length", value: { type: "number", value: 8 }, writable: true, configurable: false, enumerable: false, isOwn: true }],
    internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", objectId: "array_prototype" } }] };
}
function native(role: string): unknown {
  const roles = new Map<string, readonly [string, number]>([["push", ["push", 1]], ["join", ["join", 1]], ["stringify", ["stringify", 3]],
    ["string", ["String", 1]], ["promise", ["Promise", 1]], ["then", ["then", 2]], ["self", ["get self", 0]]]);
  const selected = roles.get(role); assert.ok(selected !== undefined);
  return { result: [
    { name: "name", value: { type: "string", value: selected[0] }, writable: false, configurable: true, enumerable: false, isOwn: true },
    { name: "length", value: { type: "number", value: selected[1] }, writable: false, configurable: true, enumerable: false, isOwn: true }],
    internalProperties: [
      { name: "[[Prototype]]", value: { type: "function", className: "Function", objectId: "function_prototype" } },
      { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[0]", objectId: "native_scopes" } }] };
}

void test("serialization retains one descriptor-safe expected snapshot before its first awaited request", async () => {
  const mutable = { ...expected() }, original = { ...mutable }; let beginObserved = false;
  const stop = new Error("original begin command inspected");
  const run = observe(bindings(mutable, (command): Promise<unknown> => {
    if (command.method === "Runtime.callFunctionOn" && command.role === "environment") { mutable.maximumTicket = 33; return Promise.resolve(capture(8)); }
    if (command.method === "Runtime.getProperties") { return Promise.resolve(command.role === "environment" ? environment() : native(command.role)); }
    if (command.method === "Debugger.evaluateOnCallFrame") { return Promise.resolve(capture(12)); }
    if (command.method === "Runtime.callFunctionOn" && command.role === "begin") {
      assert.equal(JSON.stringify(command.params.arguments[1]), JSON.stringify({ value: original })); beginObserved = true; return Promise.reject(stop);
    }
    return Promise.reject(new Error("unexpected request"));
  }), "a".repeat(64));
  await assert.rejects(run, error => error === stop);
  assert.equal(beginObserved, true); assert.equal(mutable.maximumTicket, 33);
});

void test("serialization expected accessors are refused before a request or getter invocation", async () => {
  let getterCalls = 0, requests = 0;
  const fields = { ...expected(), get maximumTicket(): number { getterCalls += 1; return 7; } };
  await assert.rejects(observe(bindings(fields, (): Promise<unknown> => { requests += 1; return Promise.resolve({}); }), "a".repeat(64)));
  assert.equal(getterCalls, 0); assert.equal(requests, 0);
});
