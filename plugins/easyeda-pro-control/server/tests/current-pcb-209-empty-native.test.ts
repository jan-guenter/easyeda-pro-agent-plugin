import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { gunzipSync } from "node:zlib";
import { CURRENT_PCB_209_EMPTY_NATIVE_CASES } from "../src/current-pcb-209-empty-native-cases.ts";
import { currentPcb209EmptyNativeSource } from "../src/current-pcb-209-empty-native.ts";
import { CURRENT_PCB_209_EMPTY_NATIVE_PROFILE, currentPcb209EmptyNativeReplyFrameBytes } from "../src/current-pcb-209-empty-native-profile.ts";
import { currentPcb209EmptyNativeWire } from "../src/current-pcb-209-empty-native-wire.ts";
import { currentPcb209WorkerStartupNativeCases, currentPcbWorkerStartupNativeParentCases } from "../src/current-pcb-worker-startup-native.ts";
import { currentPcb209WorkerStartupWire } from "../src/current-pcb-worker-startup-wire.ts";

const limit = CURRENT_PCB_209_EMPTY_NATIVE_PROFILE.requestLimit;
void test("empty209 wire preserves all fixed startup cases and original actual IDs without widening the old grammar", () => {
  const cases = [...currentPcb209WorkerStartupNativeCases(), ...currentPcbWorkerStartupNativeParentCases()];
  assert.equal(cases.length, 51);
  for (const sample of cases) {
    const encoded = currentPcb209EmptyNativeWire(sample, limit), old = currentPcb209WorkerStartupWire(sample, 1);
    assert.deepEqual(encoded.command, { ...old.command, id: limit });
    assert.deepEqual(encoded.request, { ...old.request, requestId: limit });
    assert.throws(() => currentPcb209WorkerStartupWire(sample, 257));
  }
});
void test("empty209 finite baseline grammar admits exact19 cases and transmits only phases and handles", () => {
  assert.equal(CURRENT_PCB_209_EMPTY_NATIVE_CASES.length, 19);
  for (const sample of CURRENT_PCB_209_EMPTY_NATIVE_CASES) {
    const encoded = currentPcb209EmptyNativeWire(sample, limit);
    assert.deepEqual(encoded.command, { ...sample, id: limit });
    assert.equal(encoded.request["action"], "commonPhase" in sample ? "worker-startup-empty-common" : "worker-startup-empty-root");
    for (const name of ["params", "expression", "functionDeclaration", "arguments", "objectGroup", "generation", "budget"]) {
      assert.equal(Object.hasOwn(encoded.request, name), false);
    }
    assert.ok(Object.isFrozen(encoded.command.params) && Object.isFrozen(encoded.request));
    assert.throws(() => currentPcb209WorkerStartupWire(sample, 1));
    for (const patch of [{ extra: true }, { throwOnSideEffect: false }, { objectGroup: "foreign" }, { awaitPromise: true },
      { uniqueContextId: "foreign\ncontext" }, { executionContextId: 1 }]) {
      assert.throws(() => currentPcb209EmptyNativeWire({ ...sample, params: { ...sample.params, ...patch } }, 1));
    }
    if (sample.method === "Runtime.callFunctionOn") {
      assert.throws(() => currentPcb209EmptyNativeWire({ ...sample, params: { ...sample.params,
        functionDeclaration: `${sample.params.functionDeclaration} ` } }, 1));
      assert.throws(() => currentPcb209EmptyNativeWire({ ...sample, params: { ...sample.params,
        returnByValue: !sample.params.returnByValue } }, 1));
    }
    for (const id of [-0, -1, 0, limit + 1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      assert.throws(() => currentPcb209EmptyNativeWire(sample, id));
    }
  }
});
void test("empty209 native encoding refuses hooks, symbols, inherited fields and proxy traps without invoking them", () => {
  let hooks = 0;
  const sample = CURRENT_PCB_209_EMPTY_NATIVE_CASES[0]; assert.ok(sample !== undefined);
  const getter = (): never => { hooks += 1; throw new Error("Unexpected hook"); };
  const outer = { ...sample }, params = { ...sample.params };
  Object.defineProperty(outer, "params", { get: getter });
  Object.defineProperty(params, "expression", { get: getter });
  const inherited: unknown = Object.create(sample);
  const hidden = { ...sample }; Object.defineProperty(hidden, "method", { value: sample.method, enumerable: false });
  for (const input of [outer, { ...sample, params }, new Proxy(sample, { ownKeys: getter }), inherited, hidden,
    { ...sample, [Symbol("extra")]: true }, { ...sample, params: new Proxy(sample.params, { ownKeys: getter }) },
    { ...sample, toJSON: getter }, { ...sample, commonPhase: undefined }, { ...sample, rootPhase: "wrapper" }]) {
    assert.throws(() => currentPcb209EmptyNativeWire(input, 1));
  }
  assert.equal(hooks, 0);
});
void test("empty209 handles preserve placeholder-shaped data and reject excess or sparse arguments", () => {
  const sample = CURRENT_PCB_209_EMPTY_NATIVE_CASES.find(command => "rootPhase" in command && command.rootPhase === "before");
  assert.ok(sample?.method === "Runtime.callFunctionOn" && "arguments" in sample.params);
  const command = { ...sample, params: { ...sample.params, objectId: "__empty209_argument0__", arguments: [{ objectId: "original" }] } };
  const encoded = currentPcb209EmptyNativeWire(command, 3352);
  assert.equal(encoded.request["objectId"], "__empty209_argument0__"); assert.equal(encoded.request["argument0"], "original");
  for (const argumentsValue of [[], [{ objectId: "a" }, { objectId: "b" }], [{ value: "a" }], Array.from({ length: 1 }),
    [{ objectId: "x".repeat(257) }], [{ objectId: "bad\nhandle" }]]) {
    assert.throws(() => currentPcb209EmptyNativeWire({ ...command, params: { ...command.params, arguments: argumentsValue } }, 1));
  }
  for (const sessionId of ["", "s".repeat(129), "bad\n", 4, null]) { assert.throws(() => currentPcb209EmptyNativeWire({ ...command, sessionId }, 1)); }
});
void test("empty209 native compressed table exactly matches all typed programs and independent fixed encoders", () => {
  const native = currentPcb209EmptyNativeSource();
  const match = /static readonly string\[\] Templates=Unpack\(@"([A-Za-z\d+/=]+)",(\d+),@"([a-f\d]{64})"\)/u.exec(native);
  assert.ok(match !== null && match[1] !== undefined && match[2] !== undefined && match[3] !== undefined);
  const packed = Buffer.from(match[1], "base64");
  // oxlint-disable-next-line node/no-sync -- This focused parity test decodes one bounded in-memory generated constant.
  const decoded = gunzipSync(packed);
  assert.equal(packed.toString("base64"), match[1]); assert.equal(decoded.length, Number(match[2]));
  assert.equal(createHash("sha256").update(decoded).digest("hex"), match[3]);
  assert.deepEqual(decoded.toString("utf8").split("\0"), CURRENT_PCB_209_EMPTY_NATIVE_CASES.map(command => JSON.stringify(command.params)));
  assert.ok(Buffer.byteLength(native) < 40_000);
  assert.ok(native.includes("EasyedaWorkerStartupProtocol.Encode209(1,method,sessionId,phase,fields)"));
  assert.ok(native.includes("EasyedaDiagnosticOwner.WorkerStartupParentProtocolMessage(1,method,phase,fields)"));
  assert.ok(native.includes("encoded.StartsWith(prefix,System.StringComparison.Ordinal)"));
  assert.ok(native.includes("encoded.Substring(prefix.Length)")); assert.equal(native.includes("parameters.Replace("), false);
  assert.ok(native.includes("new System.Text.UTF8Encoding(false,true)"));
  assert.ok(native.includes('System.Convert.ToBase64String(packed)==encoded'));
  assert.equal(native.split('"smoke-parity"').length - 1, 19);
});
void test("empty209 profile accounts for complete fixed command, framed text, helper base64, events, polls and cleanup limits", () => {
  const profile = CURRENT_PCB_209_EMPTY_NATIVE_PROFILE;
  assert.equal(profile.requests.common, 3090); assert.equal(profile.requests.roots, 9);
  assert.equal(profile.normalRequestLimit - profile.requests.optional, 3352);
  assert.equal(profile.normalRequestLimit, 3434); assert.equal(profile.requestLimit, 3466);
  assert.equal(Object.values(profile.startupDerivation).reduce((sum, value) => sum + value, 0), profile.requests.startup);
  assert.equal(profile.bytes.total, profile.bytes.normal + profile.bytes.cleanup);
  assert.equal(profile.bytes.normal, profile.bytes.prefix + profile.bytes.common + profile.bytes.roots + profile.bytes.continuationEvents);
  assert.equal(profile.bytes.prefix, 64 * 1024 * 1024); assert.equal(profile.events.totalCount, 8192);
  assert.equal(Object.values(profile.replyClasses).reduce((sum, entry) => sum + entry.count, 0), 3099);
  assert.equal(Object.values(profile.replyClasses).reduce((sum, entry) => sum + entry.totalBytes, 0), profile.bytes.common + profile.bytes.roots);
  assert.equal(profile.elapsed.totalMilliseconds, 3_660_000); assert.equal(profile.elapsed.anchor, "original-monotonic-launch");
  assert.ok(profile.bytes.helperStdout > 4 * profile.bytes.total / 3 + profile.polling.limit * 1024);
  assert.ok(profile.polling.limit >= Math.ceil(profile.elapsed.totalMilliseconds / profile.polling.intervalMilliseconds));
  for (const command of CURRENT_PCB_209_EMPTY_NATIVE_CASES) {
    const bytes = currentPcb209EmptyNativeReplyFrameBytes(command);
    if ("commonPhase" in command && command.commonPhase === "packet-read") { assert.equal(bytes, 6 * 262_144 + 1024); }
    if ("commonPhase" in command && command.commonPhase === "packet-advance") { assert.equal(bytes, 2048); }
    if ("rootPhase" in command && command.rootPhase === "after") { assert.equal(bytes, 6 * 16_384 + 1024); }
  }
});
