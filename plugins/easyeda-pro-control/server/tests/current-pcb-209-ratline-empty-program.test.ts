import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { CURRENT_PCB_209_RATLINE_CAPTURE_PROGRAMS as programs } from "../src/current-pcb-209-ratline-capture-program.ts";

function invoke(value: unknown): unknown {
  const callback: unknown = runInNewContext(`(${programs.empty})`);
  assert.equal(typeof callback, "function"); assert.ok(typeof callback === "function");
  return Reflect.apply(callback, value, []) as unknown;
}
function rejected(value: unknown): Record<string, unknown> {
  try { invoke(value); }
  catch (error) {
    assert.ok(error !== null && typeof error === "object");
    const message: unknown = Object.getOwnPropertyDescriptor(error, "message")?.value;
    assert.ok(typeof message === "string"); assert.ok(message.length < 300);
    assert.ok(message.startsWith("PCB209_RATLINE_CAPTURE_RELATION "));
    const parsed: unknown = JSON.parse(message.slice("PCB209_RATLINE_CAPTURE_RELATION ".length));
    assert.ok(parsed !== null && typeof parsed === "object" && !Array.isArray(parsed));
    return Object.fromEntries(Object.entries(parsed));
  }
  throw new Error("Expected empty-only ratline refusal");
}
void test("empty ratline capture retains its exact admitted set and bounded queue diagnostics", () => {
  assert.equal(invoke([]), true);
  assert.deepEqual(rejected({ length: 0 }), { reason: "not-array" });
  assert.deepEqual(rejected(Object.assign([], { extra: true })), { reason: "extra-own-keys" });
  assert.deepEqual(rejected(["[]"]), { reason: "nonzero-length", length: 1, firstSlot: "string", firstStringLength: 2, firstIsEmptyJson: true });
  const payload = JSON.stringify([{ net: "PRIVATE_NET_SHOULD_NOT_LEAK", data: [{ x: 1 }] }]);
  const details = rejected([payload]);
  assert.equal(details["firstStringLength"], payload.length); assert.equal(details["firstIsEmptyJson"], false);
  assert.equal(JSON.stringify(details).includes("PRIVATE_NET"), false);
  const sparse: unknown[] = []; sparse.length = 4_294_967_295;
  assert.deepEqual(rejected(sparse), { reason: "nonzero-length", length: 4_294_967_295, firstSlot: "absent", firstStringLength: null, firstIsEmptyJson: false });
});
void test("empty ratline diagnostics inspect descriptors without executing first-slot accessors", () => {
  let calls = 0;
  const accessor: unknown[] = [];
  Object.defineProperty(accessor, "0", { get: (): never => { calls += 1; throw new Error("getter invoked"); } });
  assert.deepEqual(rejected(accessor), { reason: "nonzero-length", length: 1, firstSlot: "accessor", firstStringLength: null, firstIsEmptyJson: false });
  assert.equal(calls, 0);
  assert.deepEqual(rejected([null]), { reason: "nonzero-length", length: 1, firstSlot: "null", firstStringLength: null, firstIsEmptyJson: false });
});
