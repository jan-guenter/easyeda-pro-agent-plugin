import assert from "node:assert/strict";
import { once } from "node:events";
import { PassThrough, Writable } from "node:stream";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { setImmediate as yieldToEventLoop } from "node:timers/promises";
import { CurrentPcbDiagnosticPipe } from "../src/current-pcb-diagnostic-pipe.ts";

/** Real Node byte streams only, with no Windows process, application, bridge,
 * filesystem, socket or native process-owner authority in these tests. */
function fixture(context: TestContext, delayedWrite = false): Readonly<{
  input: PassThrough; output: Writable; pipe: CurrentPcbDiagnosticPipe; sent: Buffer[];
  acknowledge: (error?: Error) => void;
}> {
  const input = new PassThrough(), sent: Buffer[] = [];
  let ack: ((error?: Error | null) => void) | undefined;
  // oxlint-disable-next-line promise/prefer-await-to-callbacks -- The real Writable contract uses this completion callback.
  const output = new Writable({ autoDestroy: false, write(chunk: unknown, _encoding, callback): void {
    assert.ok(Buffer.isBuffer(chunk)); sent.push(Buffer.from(chunk));
    if (delayedWrite) { ack = callback; } else {
      // oxlint-disable-next-line promise/prefer-await-to-callbacks, node/callback-return -- This terminal branch exercises Writable completion and has no following work.
      callback();
    }
  } });
  const pipe = new CurrentPcbDiagnosticPipe(input, output);
  context.after(async () => {
    // These are synthetic test streams, never real diagnostic-pipe shutdown.
    const closed = [input, output].filter(stream => !stream.closed).map(async stream => { await once(stream, "close"); });
    input.destroy(); output.destroy(); await Promise.all(closed);
    pipe.releaseClosedListeners();
  });
  pipe.start();
  return { input, output, pipe, sent, acknowledge: (error?: Error): void => {
    assert.notEqual(ack, undefined); const callback = ack; ack = undefined;
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Release the retained real Writable callback at a test-selected phase.
    callback?.(error);
  } };
}
function wire(value: unknown): Buffer { return Buffer.from(`${JSON.stringify(value)}\0`); }
function retained(value: ReturnType<typeof fixture>): void {
  assert.equal(value.input.destroyed, false); assert.equal(value.output.destroyed, false);
  assert.equal(value.output.writableEnded, false); assert.equal(value.pipe.status().listenersReleased, false);
  assert.throws(() =>{  value.pipe.releaseClosedListeners(); }, /RETAIN_ORIGINAL_STREAMS/u);
}

void test("diagnostic pipe sends only fixed browser discovery reads and keeps complete replies", async context => {
  const value = fixture(context), version = value.pipe.getVersion();
  assert.equal(value.sent[0]?.toString(), '{"id":1,"method":"Browser.getVersion"}\0');
  value.input.write(wire({ id: 1, result: { protocolVersion: "1.3", product: "synthetic", future: { retained: true } } }));
  assert.deepEqual(await version, { protocolVersion: "1.3", product: "synthetic", future: { retained: true } });
  const targets = value.pipe.getTargets();
  assert.equal(value.sent[1]?.toString(), '{"id":2,"method":"Target.getTargets"}\0');
  value.input.write(wire({ id: 2, result: { targetInfos: [{ targetId: "synthetic-worker", type: "worker", url: "" }] } }));
  assert.deepEqual(await targets, { targetInfos: [{ targetId: "synthetic-worker", type: "worker", url: "" }] });
  assert.equal(value.pipe.status().requestCount, 2); assert.equal(value.pipe.status().nativeOwnerVerified, false);
  assert.equal(value.pipe.status().executionAuthorized, false); retained(value);
});

void test("diagnostic pipe copies fragmented bytes and decodes split multibyte UTF8", async context => {
  const value = fixture(context); const reply = value.pipe.getVersion(); const bytes = wire({ id: 1, result: { text: "µ中𐐀\u0000" } });
  for (const byte of bytes) { const chunk = Buffer.from([byte]); value.input.write(chunk); chunk[0] = 255; }
  assert.deepEqual(await reply, { text: "µ中𐐀\u0000" }); retained(value);
});

void test("diagnostic pipe waits for write completion even if the peer responds first", async context => {
  const value = fixture(context, true); const reply = value.pipe.getVersion(); let settled = false;
  const observed = (async (): Promise<unknown> => { const result = await reply; settled = true; return result; })();
  value.input.write(wire({ id: 1, result: { observed: true } })); await yieldToEventLoop();
  assert.equal(settled, false); assert.equal(value.pipe.status().pendingRequestId, 1);
  value.acknowledge(); assert.deepEqual(await observed, { observed: true }); retained(value);
});

void test("diagnostic pipe retains write error after an early peer response without disconnecting", async context => {
  const value = fixture(context, true); const reply = value.pipe.getVersion(); const rejected = assert.rejects(reply, /^Error: PCB_DIAGNOSTIC_PIPE_OUTPUT$/u);
  value.input.write(wire({ id: 1, result: { early: true } })); value.acknowledge(new Error("private native detail"));
  await rejected; assert.equal(value.pipe.status().failure, "output"); retained(value);
  await assert.rejects(value.pipe.getTargets(), /PIPE_OUTPUT/u); assert.equal(value.sent.length, 1);
});

void test("diagnostic pipe refuses concurrent requests without consuming or writing the second", async context => {
  const value = fixture(context); const reply = value.pipe.getVersion();
  await assert.rejects(value.pipe.getTargets(), /REQUEST_PENDING/u);
  assert.equal(value.pipe.status().requestCount, 1); assert.equal(value.sent.length, 1);
  value.input.write(wire({ id: 1, result: {} })); await reply;
  const second = value.pipe.getTargets(); value.input.write(wire({ id: 2, result: {} })); await second;
  assert.equal(value.pipe.status().requestCount, 2);
});

void test("diagnostic pipe consumes timeout and ignores late reply without closing or retry", async context => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const value = fixture(context); const reply = value.pipe.getVersion(); const rejected = assert.rejects(reply, /PIPE_DEADLINE/u);
  context.mock.timers.tick(5001); await rejected; retained(value);
  value.input.write(wire({ id: 1, result: { tooLate: true } }));
  value.input.emit("error", new Error("later private detail"));
  assert.equal(value.pipe.status().failure, "deadline");
  await assert.rejects(value.pipe.getVersion(), /PIPE_DEADLINE/u); assert.equal(value.sent.length, 1);
});

void test("diagnostic pipe rejects every contradictory or unsolicited response envelope", async context => {
  const cases = [
    { id: 2, result: {} }, { id: "1", result: {} }, { id: 1, result: {}, error: {} },
    { id: 1, result: {}, sessionId: "not-owned" }, { id: 1, result: [] }, { id: 1, result: null },
    { id: 1 }, { method: "Target.targetCreated", params: {} }, [], true,
  ];
  for (const message of cases) {
    const value = fixture(context); const reply = value.pipe.getVersion(); const rejected = assert.rejects(reply, /PIPE_REPLY/u);
    value.input.write(wire(message)); await rejected; retained(value);
  }
});

void test("diagnostic pipe rejects malformed JSON UTF8 BOM and unterminated frames", async context => {
  const messages = [Buffer.from("{\0"), Buffer.from([123, 34, 255, 34, 125, 0]),
    Buffer.concat([Buffer.from([239, 187, 191]), wire({ id: 1, result: {} })])];
  for (const message of messages) {
    const value = fixture(context); const rejected = assert.rejects(value.pipe.getVersion(), /PIPE_FRAMING/u);
    value.input.write(message); await rejected; retained(value);
  }
  const value = fixture(context); const rejected = assert.rejects(value.pipe.getVersion(), /PIPE_FRAMING/u);
  value.input.write(Buffer.from('{"id":1')); value.input.end(); await rejected;
  assert.equal(value.pipe.status().failure, "framing"); assert.equal(value.output.destroyed, false);
});

void test("diagnostic pipe rejects coalesced duplicate replies before returning the first", async context => {
  const value = fixture(context); const rejected = assert.rejects(value.pipe.getVersion(), /PIPE_REPLY/u);
  value.input.write(Buffer.concat([wire({ id: 1, result: { first: true } }), wire({ id: 1, result: { duplicate: true } })]));
  await rejected; retained(value);
});

void test("diagnostic pipe rejects duplicate JSON fields and excessive nesting without rewriting valid escapes", async context => {
  for (const text of ['{"id":2,"id":1,"result":{}}', '{"id":1,"result":{"targetId":"one","targetId":"two"}}',
    String.raw`{"id":1,"result":{"targetId":"one","target\u0049d":"two"}}`,
    `{"id":1,"result":{"deep":${"[".repeat(64)}0${"]".repeat(64)}}}`]) {
    const value = fixture(context); const rejected = assert.rejects(value.pipe.getVersion(), /PIPE_FRAMING/u);
    value.input.write(Buffer.from(`${text}\0`)); await rejected; retained(value);
  }
  const value = fixture(context); const reply = value.pipe.getVersion();
  value.input.write(Buffer.from(' { "id" : 1, "result": {"escaped":"\\u00b5", "quoted":"\\\"key\\\":{\\\\}"} } \0'));
  assert.deepEqual(await reply, { escaped: "µ", quoted: '"key":{\\}' });
});

void test("diagnostic pipe refuses late duplicate replies and all further requests", async context => {
  const value = fixture(context); const reply = value.pipe.getVersion();
  value.input.write(wire({ id: 1, result: {} })); await reply;
  value.input.write(wire({ id: 1, result: {} }));
  assert.equal(value.pipe.status().failure, "reply");
  await assert.rejects(value.pipe.getTargets(), /PIPE_REPLY/u); assert.equal(value.sent.length, 1); retained(value);
});

void test("diagnostic pipe rejects numeric overflow at every JSON result depth", async context => {
  for (const text of ['{"id":1,"result":{"value":1e309}}', '{"id":1,"result":{"nested":[{"value":-1e309}]}}']) {
    const value = fixture(context); const rejected = assert.rejects(value.pipe.getVersion(), /PIPE_FRAMING/u);
    value.input.write(Buffer.from(`${text}\0`)); await rejected; retained(value);
  }
});

void test("diagnostic pipe refuses even partial unsolicited or coalesced trailing data", async context => {
  const idle = fixture(context); idle.input.write(Buffer.from("{"));
  await assert.rejects(idle.pipe.getVersion(), /PIPE_REPLY/u); assert.equal(idle.sent.length, 0); retained(idle);
  const value = fixture(context); const rejected = assert.rejects(value.pipe.getVersion(), /PIPE_REPLY/u);
  value.input.write(Buffer.concat([wire({ id: 1, result: {} }), Buffer.from("{")]));
  await rejected; retained(value);
});

void test("diagnostic pipe enforces frame and cumulative byte budgets before unbounded buffering", async context => {
  const tooLarge = fixture(context); const rejected = assert.rejects(tooLarge.pipe.getVersion(), /PIPE_FRAMING/u);
  tooLarge.input.write(Buffer.alloc(1024 * 1024, 32)); tooLarge.input.write(Buffer.from("x")); await rejected; retained(tooLarge);
  const value = fixture(context); const payload = "x".repeat(1024 * 1024 - 100);
  for (let id = 1; id <= 9; id += 1) {
    const reply = value.pipe.getVersion();
    if (id === 9) {
      const failed = assert.rejects(reply, /PIPE_FRAMING/u); value.input.write(wire({ id, result: { payload } })); await failed;
    } else { value.input.write(wire({ id, result: { payload } })); await reply; }
  }
  retained(value);
});

void test("diagnostic pipe consumes its fixed request budget without dispatching request 33", async context => {
  const value = fixture(context);
  for (let id = 1; id <= 32; id += 1) {
    const reply = value.pipe.getVersion(); value.input.write(wire({ id, result: {} })); await reply;
  }
  await assert.rejects(value.pipe.getTargets(), /PIPE_BUDGET/u);
  assert.equal(value.sent.length, 32); assert.equal(value.pipe.status().requestCount, 32); retained(value);
});

void test("diagnostic pipe reports remote errors without revealing the private vendor payload", async context => {
  const value = fixture(context); const rejected = assert.rejects(value.pipe.getVersion(), /^Error: PCB_DIAGNOSTIC_PIPE_REMOTE-ERROR$/u);
  value.input.write(wire({ id: 1, error: { code: -32_000, message: "private vendor payload" } }));
  await rejected; retained(value);
});

void test("diagnostic pipe releases only its own listeners after both original streams close", async context => {
  const value = fixture(context); const other = (): void => { assert.equal(value.pipe.status().listenersReleased, true); };
  value.input.on("error", other); value.output.on("error", other);
  const rejected = assert.rejects(value.pipe.getVersion(), /PIPE_CLOSED/u);
  const inputClosed = once(value.input, "close"); value.input.destroy(); await inputClosed; await rejected;
  assert.throws(() =>{  value.pipe.releaseClosedListeners(); }, /RETAIN_ORIGINAL_STREAMS/u);
  const outputClosed = once(value.output, "close"); value.output.destroy(); await outputClosed;
  value.pipe.releaseClosedListeners(); value.pipe.releaseClosedListeners();
  assert.equal(value.pipe.status().listenersReleased, true); assert.equal(value.pipe.status().nativeOwnerVerified, false);
  assert.deepEqual(value.input.listeners("error"), [other]); assert.deepEqual(value.output.listeners("error"), [other]);
  await assert.rejects(value.pipe.getVersion(), /NOT_STARTED/u);
  assert.throws(() =>{  value.pipe.start(); }, /START_CONSUMED/u);
});
