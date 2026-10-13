import assert from "node:assert/strict";
import { test } from "node:test";
import { createClockedTransport } from "../src/windows-clock-transport.ts";
import type { WindowsAuthorityTransport } from "../src/windows-authority.ts";

const SOURCE = { helperSourceSha256: "d".repeat(64), executionScopeSha256: "e".repeat(64) };
function raw(): { -readonly [Key in keyof WindowsAuthorityTransport]: WindowsAuthorityTransport[Key] } {
  return { request(): Promise<unknown> { return Promise.resolve(null); }, release(): Promise<void> { return Promise.resolve(); } };
}
void test("availability is omitted only when the original transport never provided it", () => {
  const wrapper = createClockedTransport(raw(), SOURCE);
  assert.equal(Object.hasOwn(wrapper.transport, "assertClosedSessionAvailable"), false);
  const source = raw(); Object.defineProperty(source, "assertClosedSessionAvailable", { value: undefined });
  assert.throws(() => createClockedTransport(source, SOURCE), /CLOCK_RECEIPT_REFUSED/u);
});
void test("availability retains its original receiver and propagates its original refusal", () => {
  const source = raw(); let calls = 0;
  source.assertClosedSessionAvailable = function assertClosedSessionAvailable(this: WindowsAuthorityTransport): never { assert.equal(this, source); calls += 1; throw new Error("original-refusal"); };
  const wrapper = createClockedTransport(source, SOURCE);
  assert.throws(() => wrapper.transport.assertClosedSessionAvailable?.(), /original-refusal/u); assert.equal(calls, 1);
});
for (const mutation of ["delete", "replace", "accessor"]) {
  void test(`availability ${mutation} refuses without calling old or replacement callback`, () => {
    const source = raw(); let calls = 0, reads = 0;
    source.assertClosedSessionAvailable = (): void => { calls += 1; };
    const wrapper = createClockedTransport(source, SOURCE);
    if (mutation === "delete") { delete source.assertClosedSessionAvailable; }
    else if (mutation === "replace") { source.assertClosedSessionAvailable = (): void => { calls += 1; }; }
    else { Object.defineProperty(source, "assertClosedSessionAvailable", { get(): never { reads += 1; throw new Error("getter"); } }); }
    assert.throws(() => wrapper.transport.assertClosedSessionAvailable?.(), /CLOCK_RECEIPT_REFUSED/u);
    assert.equal(calls, 0); assert.equal(reads, 0);
  });
}
void test("initial availability accessors and inherited callbacks refuse without invocation", () => {
  let reads = 0;
  const source = raw(); Object.defineProperty(source, "assertClosedSessionAvailable", { get(): never { reads += 1; throw new Error("getter"); } });
  assert.throws(() => createClockedTransport(source, SOURCE), /CLOCK_RECEIPT_REFUSED/u);
  const inherited = raw(); Object.setPrototypeOf(inherited, { assertClosedSessionAvailable(): void { reads += 1; } });
  assert.throws(() => createClockedTransport(inherited, SOURCE), /CLOCK_RECEIPT_REFUSED/u); assert.equal(reads, 0);
});
