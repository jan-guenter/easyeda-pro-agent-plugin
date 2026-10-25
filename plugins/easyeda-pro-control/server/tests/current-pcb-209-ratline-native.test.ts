import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { gunzipSync } from "node:zlib";
import { CURRENT_PCB_209_RATLINE_NATIVE_CASES } from "../src/current-pcb-209-ratline-native-cases.ts";
import { currentPcb209RatlineNativeWire } from "../src/current-pcb-209-ratline-native-wire.ts";
import { currentPcb209RatlineNativeSource } from "../src/current-pcb-209-ratline-native.ts";
import { currentPcb209EmptyNativeWire } from "../src/current-pcb-209-empty-native-wire.ts";
import { currentPcb209RatlineNativeParitySource } from "./helpers/current-pcb-209-ratline-native-parity.ts";

void test("ratline native grammar preserves exact role cases and issued IDs without granting existing empty209 admission", () => {
  const counts = { pcb: 0, worker: 0 };
  for (const entry of CURRENT_PCB_209_RATLINE_NATIVE_CASES) {
    counts[entry.role] += 1;
    const encoded = currentPcb209RatlineNativeWire(entry.role, entry.command, 2_147_483_647);
    assert.deepEqual(encoded.command, { ...entry.command, id: 2_147_483_647 });
    assert.equal(encoded.request["phase"], entry.phase); assert.equal(encoded.request["role"], entry.role);
    assert.equal(encoded.request["requestId"], 2_147_483_647); assert.ok(Object.isFrozen(encoded.command.params));
    for (const name of ["params", "expression", "functionDeclaration", "objectGroup", "arguments", "budget", "generation"]) {
      assert.equal(Object.hasOwn(encoded.request, name), false);
    }
    if (entry.phase === "origin-stack" || entry.phase === "bootstrap-async-depth" || entry.phase.startsWith("creation-") || entry.phase.startsWith("capture-") || entry.phase.startsWith("relation-") ||
        entry.phase.startsWith("object-") || entry.phase.startsWith("value-")) { assert.throws(() => currentPcb209EmptyNativeWire(entry.command, 1)); }
    for (const id of [-0, -1, 0, 1.5, 2_147_483_648, Number.NaN, Number.POSITIVE_INFINITY]) {
      assert.throws(() => currentPcb209RatlineNativeWire(entry.role, entry.command, id));
    }
    for (const patch of [{ extra: true }, { throwOnSideEffect: false }, { objectGroup: "foreign" }, { awaitPromise: true }]) {
      assert.throws(() => currentPcb209RatlineNativeWire(entry.role, { ...entry.command, params: { ...entry.command.params, ...patch } }, 301));
    }
    const command = entry.command;
    if (command.method === "Runtime.callFunctionOn") {
      assert.throws(() => currentPcb209RatlineNativeWire(entry.role, { ...command,
        params: { ...command.params, functionDeclaration: `${command.params.functionDeclaration} ` } }, 301));
    }
    if (entry.command.method === "Debugger.setBreakpoint") {
      const other = entry.role === "pcb" ? "worker" : "pcb";
      assert.throws(() => currentPcb209RatlineNativeWire(other, entry.command, 301));
    }
  }
  assert.deepEqual(counts, { pcb: 31, worker: 47 });
});
void test("ratline native syntax refuses getters, proxies, inherited fields, sparse arguments and unsafe handles without running hooks", () => {
  const entry = CURRENT_PCB_209_RATLINE_NATIVE_CASES.find(value => value.role === "pcb" && value.phase === "relation-same");
  assert.ok(entry?.command.method === "Runtime.callFunctionOn"); const sample = entry.command;
  let hooks = 0;
  const getter = (): never => { hooks += 1; throw new Error("Unexpected hook"); };
  const outer = { ...sample }, params = { ...sample.params }; Object.defineProperty(outer, "params", { get: getter });
  Object.defineProperty(params, "functionDeclaration", { get: getter });
  const hidden = { ...sample }, inherited: unknown = Object.create(sample);
  Object.defineProperty(hidden, "method", { value: sample.method, enumerable: false });
  for (const input of [outer, { ...sample, params }, new Proxy(sample, { ownKeys: getter }), inherited, hidden,
    { ...sample, [Symbol("extra")]: true }, { ...sample, params: new Proxy(sample.params, { ownKeys: getter }) }, { ...sample, toJSON: getter }]) {
    assert.throws(() => currentPcb209RatlineNativeWire("pcb", input, 301));
  }
  for (const args of [[], [{ objectId: "first" }, { objectId: "second" }], [{ value: "other" }], Array.from({ length: 1 }),
    [{ objectId: "bad\n" }], [{ objectId: "x".repeat(257) }]]) {
    assert.throws(() => currentPcb209RatlineNativeWire("pcb", { ...sample, params: { ...sample.params, arguments: args } }, 301));
  }
  for (const sessionId of ["", "s".repeat(129), "bad\n", 7, null]) {
    assert.throws(() => currentPcb209RatlineNativeWire("pcb", { ...sample, sessionId }, 301));
  }
  const encoded = currentPcb209RatlineNativeWire("pcb", { ...sample, params: { ...sample.params,
    objectId: "__ratline209_argument0__", arguments: [{ objectId: "original" }] } }, 301);
  assert.equal(encoded.request["objectId"], "__ratline209_argument0__"); assert.equal(encoded.request["argument0"], "original");
  assert.equal(hooks, 0);
});
void test("origin syntax has separate bounded IDs and fixed depth one without worker lookup or depth reset", () => {
  const command = { method: "Debugger.getStackTrace", sessionId: "parent", params: { stackTraceId: { id: "stack", debuggerId: "debugger" } } } as const;
  assert.equal(currentPcb209RatlineNativeWire("pcb", command, 301).request["stackTraceId"], "stack");
  assert.throws(() => currentPcb209RatlineNativeWire("worker", command, 301));
  for (const key of ["id", "debuggerId"] as const) {
    for (const value of ["", "x".repeat(257), "bad\n", null, 3]) {
      assert.throws(() => currentPcb209RatlineNativeWire("pcb", { ...command, params: { stackTraceId: { ...command.params.stackTraceId, [key]: value } } }, 301));
    }
  }
  for (const role of ["pcb", "worker"] as const) {
    for (const maxDepth of [0, 2, -1, 1.5]) {
      assert.throws(() => currentPcb209RatlineNativeWire(role, { method: "Debugger.setAsyncCallStackDepth", sessionId: "s", params: { maxDepth } }, 301));
    }
  }
});
void test("ratline C# template table preserves every fixed command and exact bounded UTF-8 payload", () => {
  const source = currentPcb209RatlineNativeSource();
  const match = /string\[\] rows=Unpack\(@"([A-Za-z\d+/=]+)",(\d+),@"([a-f\d]{64})"\)/u.exec(source);
  assert.ok(match !== null && match[1] !== undefined && match[2] !== undefined && match[3] !== undefined);
  // oxlint-disable-next-line node/no-sync -- Bounded in-memory build constant, not a filesystem or runtime compression operation.
  const decoded = gunzipSync(Buffer.from(match[1], "base64"));
  assert.equal(decoded.length, Number(match[2])); assert.equal(createHash("sha256").update(decoded).digest("hex"), match[3]);
  assert.deepEqual(decoded.toString("utf8").split("\0").map(row => row.split("\t")), CURRENT_PCB_209_RATLINE_NATIVE_CASES.map(entry => {
    const wire = currentPcb209RatlineNativeWire(entry.role, entry.command, 1);
    return [entry.role, entry.phase, entry.command.method,
      Object.keys(wire.request).filter(key => !["action", "requestId", "method", "role", "phase"].includes(key)).join(","), JSON.stringify(entry.command)];
  }));
  assert.ok(source.includes("new System.Text.UTF8Encoding(false,true)"));
  assert.ok(source.includes("System.Convert.ToBase64String(packed)==encoded"));
  assert.ok(source.includes("Need(count==length && stream.ReadByte()==-1"));
  assert.ok(source.includes("System.StringComparison.Ordinal"));
  const bound = /MaximumEncodedBytes=(\d+);/u.exec(source)?.[1]; assert.ok(bound !== undefined);
  let maximum = 0;
  for (const entry of CURRENT_PCB_209_RATLINE_NATIVE_CASES) {
    const raw: unknown = JSON.parse(JSON.stringify(entry.command).replaceAll(/__ratline209_([A-Za-z\d]+)__/gu,
      (_match: string, name: string): string => "x".repeat(name === "sessionId" ? 128 : 256)));
    const encoded = currentPcb209RatlineNativeWire(entry.role, raw, 2_147_483_647);
    maximum = Math.max(maximum, Buffer.byteLength(`${JSON.stringify(encoded.command)}\0`));
  }
  assert.equal(maximum, Number(bound));
  // The fixed table and runtime smoke must fit alongside the existing native
  // Owner without its exhaustive test vectors consuming helper headroom.
  assert.ok(Buffer.byteLength(source) < 10_000);
  assert.equal(source.includes('"parity-'), false);
});
void test("ratline exhaustive compiled parity stays outside the helper runtime fragment", () => {
  const source = currentPcb209RatlineNativeParitySource();
  assert.equal(source.match(/"parity-\d+"/gu)?.length, CURRENT_PCB_209_RATLINE_NATIVE_CASES.length);
  for (const [index, entry] of CURRENT_PCB_209_RATLINE_NATIVE_CASES.entries()) {
    assert.ok(source.includes(`EasyedaRatline209Protocol.Encode(${String(301 + index)},@"${entry.role}",@"${entry.phase}"`));
  }
  assert.ok(source.includes("EasyedaRatline209Protocol.VerifySmoke();"));
  assert.ok(source.includes("System.StringComparer.OrdinalIgnoreCase"));
  assert.ok(source.includes('fields.Add("expression","arbitrary")'));
});
