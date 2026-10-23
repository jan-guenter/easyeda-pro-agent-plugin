import assert from "node:assert/strict";
import { once } from "node:events";
import { PassThrough, Writable } from "node:stream";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { CurrentPcbWorkerStartupDiscoveryPipe } from "../src/current-pcb-diagnostic-pipe.ts";

function wire(value: unknown): Buffer { return Buffer.from(`${JSON.stringify(value)}\0`); }
function fixture(context: TestContext): Readonly<{
  pipe: CurrentPcbWorkerStartupDiscoveryPipe; input: PassThrough; output: Writable; sent: Buffer[];
}> {
  const input = new PassThrough(), sent: Buffer[] = [];
  // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Exercise the original Writable completion callback.
  const output = new Writable({ autoDestroy: false, write(chunk: unknown, _encoding, callback): void {
    assert.ok(Buffer.isBuffer(chunk)); sent.push(Buffer.from(chunk));
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Writable acknowledges the synthetic write once.
    callback();
  } });
  const pipe = new CurrentPcbWorkerStartupDiscoveryPipe(input, output); pipe.start();
  context.after(async () => {
    const closed = Promise.all([once(input, "close"), once(output, "close")]);
    input.destroy(); output.destroy(); await closed; pipe.releaseClosedListeners();
  });
  return { pipe, input, output, sent };
}
async function attach(value: ReturnType<typeof fixture>): Promise<void> {
  const pending = value.pipe.attachTarget("parent", event => { assert.equal(event.method, "Runtime.consoleAPICalled"); });
  value.input.write(wire({ id: 1, result: { sessionId: "original-session" } }));
  assert.equal(await pending, "original-session");
}

void test("startup pipe transfers exact counters once without dropping listeners or closing either stream", async context => {
  const value = fixture(context); await attach(value);
  const event = wire({ method: "Runtime.consoleAPICalled", params: {}, sessionId: "original-session" });
  value.input.write(event);
  const counts = [value.input.listenerCount("data"), value.input.listenerCount("error"), value.output.listenerCount("error")];
  const handoff = value.pipe.handoff();
  assert.deepEqual(handoff, { sessionId: "original-session", nextRequestId: 2,
    receivedBytes: wire({ id: 1, result: { sessionId: "original-session" } }).length + event.length, eventCount: 1, eventBytes: event.length - 1 });
  assert.equal(Object.isFrozen(handoff), true);
  assert.deepEqual([value.input.listenerCount("data"), value.input.listenerCount("error"), value.output.listenerCount("error")], counts);
  assert.equal(value.input.destroyed, false); assert.equal(value.output.destroyed, false);
  value.input.write(wire({ id: 2, result: {} }));
  assert.equal(value.pipe.status().failure, null); assert.equal(value.pipe.status().receivedBytes, handoff.receivedBytes);
  await assert.rejects(value.pipe.getTargets(), /NOT_STARTED/u);
  assert.throws(() => value.pipe.handoff(), /HANDOFF_UNAVAILABLE/u); assert.equal(value.sent.length, 1);
});

void test("startup pipe handoff refuses pending requests and partial event framing without consuming a clean later handoff", async context => {
  const value = fixture(context); await attach(value);
  const pending = value.pipe.getTargets();
  assert.throws(() => value.pipe.handoff(), /HANDOFF_UNAVAILABLE/u);
  value.input.write(wire({ id: 2, result: { targetInfos: [] } })); await pending;
  const event = wire({ method: "Runtime.consoleAPICalled", params: {}, sessionId: "original-session" });
  value.input.write(event.subarray(0, 12));
  assert.throws(() => value.pipe.handoff(), /HANDOFF_UNAVAILABLE/u);
  value.input.write(event.subarray(12)); assert.equal(value.pipe.handoff().nextRequestId, 3);
});

void test("startup discovery pipe cannot issue legacy autoattachment before handoff", async context => {
  const value = fixture(context); await attach(value);
  await assert.rejects(value.pipe.enableWorkerDiscovery(() => { assert.fail("Legacy discovery must not receive an attachment"); }), /STARTUP_DISCOVERY_ONLY/u);
  assert.equal(value.sent.length, 1);
  assert.throws(() => value.pipe.handoff(), /HANDOFF_UNAVAILABLE/u);
});
