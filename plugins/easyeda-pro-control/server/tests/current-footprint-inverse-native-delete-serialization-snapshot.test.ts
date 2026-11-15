/** Read-only protocol surrogates exercise only the pre-await data snapshot. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { observeCurrentFootprintInverseNativeDeleteSerialization as observe } from "../src/current-footprint-inverse-native-delete-serialization-observer.ts";
import type { CurrentFootprintInverseNativeDeleteSerializationBindings as Bindings } from "../src/current-footprint-inverse-native-delete-serialization-observer.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_BEGIN as BEGIN, CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_FRAME_LENGTHS as LENGTHS, CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_SITES as SITES } from "../src/current-footprint-inverse-native-delete-serialization-profile.ts";

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


function tuple(count: number, role: string): unknown {
  return { result: [...Array.from({ length: count }, (_, index) => ({ name: String(index),
    value: { type: "object", objectId: `${role}_${String(index)}` }, writable: true, configurable: true, enumerable: true, isOwn: true })),
    { name: "length", value: { type: "number", value: count }, writable: true, configurable: false, enumerable: false, isOwn: true }],
    internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", objectId: "array_prototype" } }] };
}
function fulfilled(body: string): unknown {
  return { result: [], internalProperties: [
    { name: "[[Prototype]]", value: { type: "object", className: "Promise", objectId: "promise_prototype" } },
    { name: "[[PromiseState]]", value: { type: "string", value: "fulfilled" } },
    { name: "[[PromiseResult]]", value: { type: "string", value: body } }] };
}
function held(role: keyof typeof SITES): Bindings["initial"] {
  const site = SITES[role];
  let returned: Readonly<Record<string, string>> | undefined;
  if (role === "stringReturned") { returned = { type: "object", subtype: "promise", className: "Promise", description: "Promise", objectId: "outer_promise" }; }
  else if (role === "setterReturned") { returned = { type: "undefined" }; }
  const top = { callFrameId: `frame_${role}`, functionName: site.functionName,
    location: { scriptId: "script", lineNumber: site.lineNumber, columnNumber: site.columnNumber },
    functionLocation: { scriptId: "script", lineNumber: site.functionLine, columnNumber: site.functionColumn },
    ...(returned === undefined ? {} : { returnValue: returned }) };
  return { method: "Debugger.paused", sessionId: "worker", params: { reason: "other",
    hitBreakpoints: [role === "uploadEntry" ? "original_upload" : `point_${role}`], callFrames: [top,
      { callFrameId: "original_caller", functionName: "deleteString", functionLocation: {
        scriptId: "script", lineNumber: BEGIN.functionLine, columnNumber: BEGIN.functionColumn }, location: { ...top.location } }] } };
}
function tupleLength(role: string): number {
  if (role === "begin") { return 8; }
  if (["retainReturn", "retained", "stringReturned", "uploadEntry"].includes(role)) { return 3; }
  return 2;
}
void test("serialization uses one original text snapshot for begin and both fulfilled Promise observations", async () => {
  const texts: [string, string, string] = ["head", "delete", "body"];
  let begins = 0; let promises = 0; let helpers = 0; let resumes = 0; let completed = false;
  const bound = { ...bindings(expected(), unexpected), texts }; const retainedPoints = new Set<string>();
  const request: Bindings["request"] = (command): Promise<unknown> => {
    if (command.method === "Runtime.callFunctionOn") {
      if (command.role === "environment") {
        texts[0] = "changed head"; texts[2] = "changed body"; bound.texts = ["replacement", "delete", "replacement body"];
        return Promise.resolve(capture(8));
      }
      if (command.role === "begin") {
        const argument = command.params.arguments[2]; assert.ok(argument !== null && typeof argument === "object" && "value" in argument);
        assert.deepEqual(argument.value, ["head", "delete", "body"]);
        assert.equal(Object.isFrozen(argument.value), true); begins += 1;
      }
      return Promise.resolve(capture(tupleLength(command.role)));
    }
    if (command.method === "Runtime.getProperties") {
      if (command.role === "environment") { return Promise.resolve(environment()); }
      if (["push", "join", "stringify", "string", "promise", "then", "self"].includes(command.role)) { return Promise.resolve(native(command.role)); }
      if (command.role === "returned-constructor") { return Promise.resolve(native("promise")); }
      if (command.role === "fulfilled-before" || command.role === "fulfilled-after") {
        texts[2] = `changed during ${command.role}`; bound.texts = ["head", "delete", `replaced during ${command.role}`];
        promises += 1; return Promise.resolve(fulfilled("body"));
      }
      return Promise.resolve(tuple(tupleLength(command.role), command.role));
    }
    if (command.method === "Debugger.evaluateOnCallFrame") { return Promise.resolve(capture(LENGTHS[command.role])); }
    if (command.method === "Debugger.setBreakpoint") { return Promise.resolve({ breakpointId: `point_${command.role}`, actualLocation: command.params.location }); }
    if (command.method === "Debugger.getPossibleBreakpoints") { return Promise.resolve({ locations: [{ ...command.params.start, type: "call" }] }); }
    return Promise.resolve({});
  };
  bound.request = request;
  bound.qualifyHelper = (): Promise<void> => { helpers += 1; return Promise.resolve(); };
  bound.retainPoint = (_role, point): void => { assert.equal(retainedPoints.has(point), false); retainedPoints.add(point); };
  bound.next = (role: keyof typeof SITES): Promise<Bindings["initial"]> => Promise.resolve(held(role));
  bound.resume = (): Promise<void> => { resumes += 1; return Promise.resolve(); };
  bound.control = (phase: "armed" | "complete"): Promise<void> => { if (phase === "complete") { completed = true; } return Promise.resolve(); };
  const observed = await observe(bound, "a".repeat(64));
  assert.equal(begins, 1); assert.equal(promises, 2); assert.equal(helpers, 16); assert.equal(resumes, 6); assert.equal(completed, true);
  assert.equal(retainedPoints.size, 6); assert.equal(observed.normal, 53); assert.equal(observed.originalDeleteStringPromiseFulfilled, true);
  assert.equal(observed.uploadHeld, true); assert.equal(observed.uploadResumed, false); assert.equal(observed.saveAuthorized, false);
});
void test("serialization refuses text hooks, exotic arrays and invalid tuples before any callback", async () => {
  let hooks = 0; let callbacks = 0;
  const ownGetter = ["head", "delete", "body"];
  Object.defineProperty(ownGetter, "2", { get: (): string => { hooks += 1; throw new Error("text getter must not run"); }, enumerable: true });
  const proxy = new Proxy(["head", "delete", "body"], { get: (): never => { hooks += 1; throw new Error("proxy get must not run"); },
    getOwnPropertyDescriptor: (): never => { hooks += 1; throw new Error("proxy descriptor must not run"); } });
  const revoked = Proxy.revocable(["head", "delete", "body"], {}); revoked.revoke();
  const sparse = ["head", "delete", "body"]; const extra = ["head", "delete", "body"]; const odd = ["head", "delete", "body"];
  Reflect.deleteProperty(sparse, "1");
  Object.defineProperty(extra, "extra", { value: "surplus", enumerable: true }); Object.setPrototypeOf(odd, null);
  const cases: readonly unknown[] = [ownGetter, proxy, revoked.proxy, sparse, extra, odd, ["head", "delete"], ["head", "delete", "body", "extra"],
    ["", "delete", "body"], ["a".repeat(1025), "delete", "body"], ["head", "a".repeat(257), "body"], ["head", "delete", "a".repeat(1281)]];
  const current = (): void => { callbacks += 1; };
  for (const candidate of cases) {
    const b = bindings(expected(), unexpected); Object.defineProperty(b, "texts", { value: candidate, enumerable: true });
    Object.defineProperty(b, "current", { value: current, enumerable: true });
    await assert.rejects(observe(b, "a".repeat(64)));
  }
  const accessor = bindings(expected(), unexpected);
  Object.defineProperty(accessor, "texts", { get: (): Bindings["texts"] => { hooks += 1; throw new Error("binding getter must not run"); }, enumerable: true });
  await assert.rejects(observe(accessor, "a".repeat(64)));
  const inherited = bindings(expected(), unexpected); Reflect.deleteProperty(inherited, "texts");
  Object.setPrototypeOf(inherited, { get texts(): Bindings["texts"] { hooks += 1; throw new Error("inherited getter must not run"); } });
  await assert.rejects(observe(inherited, "a".repeat(64)));
  const proxied = new Proxy(bindings(expected(), unexpected), { get: (): never => { hooks += 1; throw new Error("binding proxy must not run"); },
    getOwnPropertyDescriptor: (): never => { hooks += 1; throw new Error("binding proxy descriptor must not run"); } });
  await assert.rejects(observe(proxied, "a".repeat(64)));
  assert.equal(hooks, 0); assert.equal(callbacks, 0);
});
