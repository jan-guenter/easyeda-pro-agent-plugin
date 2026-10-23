import assert from "node:assert/strict";
import { once } from "node:events";
import { createHash } from "node:crypto";
import { PassThrough, Writable } from "node:stream";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { setImmediate as yieldToEventLoop } from "node:timers/promises";
import { CurrentPcbDiagnosticPipe, CurrentPcbStringPrecreatePipe } from "../src/current-pcb-diagnostic-pipe.ts";
import { CURRENT_PCB_STRING_PRECREATE_REQUEST_LIMIT, currentPcbStringWorkerCommand } from "../src/current-pcb-string-commands.ts";
import type { DiagnosticEvent } from "../src/current-pcb-diagnostic-protocol.ts";
import { DIAGNOSTIC_REQUEST_LIMIT, DIAGNOSTIC_WORKER_ATTACH_PARAMS, diagnosticNativeRequest, diagnosticPrimitives209Params, diagnosticWorkerEvaluationParams } from "../src/current-pcb-diagnostic-protocol.ts";

/** Real Node byte streams only, with no Windows process, application, bridge,
 * filesystem, socket or native process-owner authority in these tests. */
function fixture(context: TestContext, delayedWrite = false, stringPurpose = false): Readonly<{
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
  const Pipe = stringPurpose ? CurrentPcbStringPrecreatePipe : CurrentPcbDiagnosticPipe;
  const pipe = new Pipe(input, output);
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

void test("209 primitive pipe binds the original attachment and retains streams on remote refusal", async context => {
  const path = String.raw`C:\Reviewed\PrimitiveFixture.eprj2`, value = fixture(context);
  const target = { rawWindowsPath: path, projectUuid: createHash("sha256").update(path).digest("hex"),
    documentUuid: "b".repeat(16), expectedSourceSha256: "c".repeat(64), branchUuid: "a".repeat(32) };
  await assert.rejects(value.pipe.observePrimitives209("ui-original", target), /PCB209_PRIMITIVES_PIPE_INPUT/u);
  assert.equal(value.sent.length, 0);
  const attachment = value.pipe.attachTarget("original-target", () => { assert.fail("Unexpected diagnostic event"); });
  value.input.write(wire({ id: 1, result: { sessionId: "original-session" } })); await attachment;
  const observation = value.pipe.observePrimitives209("ui-original", target);
  assert.equal(value.sent[1]?.toString(), wire({ id: 2, method: "Runtime.callFunctionOn",
    params: diagnosticPrimitives209Params("ui-original", target), sessionId: "original-session" }).toString());
  const refusal = assert.rejects(observation, /PIPE_REMOTE-ERROR/u);
  value.input.write(wire({ id: 2, sessionId: "original-session", error: { code: -32_000, message: "private" } }));
  await refusal;
  assert.equal(value.pipe.status().failureObservation?.request?.phase, "primitives209");
  retained(value);
  await assert.rejects(value.pipe.observePrimitives209("ui-original", target), /PIPE_REMOTE-ERROR/u);
  assert.equal(value.sent.length, 2);
});

void test("separate String pipe accepts its fixed packet budget and rejects overflow without dispatch; diagnostic purpose remains separate", async context => {
  const diagnostic = fixture(context);
  await assert.rejects(diagnostic.pipe.observeStringPrecreate(currentPcbStringWorkerCommand("worker")), /PCB_STRING_PIPE_PURPOSE/u);
  assert.equal(diagnostic.sent.length, 0);
  const string = fixture(context, false, true);
  for (let id = 1; id <= CURRENT_PCB_STRING_PRECREATE_REQUEST_LIMIT; id += 1) {
    const result = string.pipe.getTargets();
    string.input.write(wire({ id, result: {} })); await result;
  }
  await assert.rejects(string.pipe.getTargets(), /PIPE_BUDGET/u);
  assert.equal(string.sent.length, CURRENT_PCB_STRING_PRECREATE_REQUEST_LIMIT);
  assert.equal(string.pipe.status().requestCount, CURRENT_PCB_STRING_PRECREATE_REQUEST_LIMIT); retained(string); retained(diagnostic);
});

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

void test("diagnostic pipe consumes its fixed request budget without dispatching an extra request", async context => {
  const value = fixture(context);
  for (let id = 1; id <= DIAGNOSTIC_REQUEST_LIMIT; id += 1) {
    const reply = value.pipe.getVersion(); value.input.write(wire({ id, result: {} })); await reply;
  }
  await assert.rejects(value.pipe.getTargets(), /PIPE_BUDGET/u);
  assert.equal(value.sent.length, DIAGNOSTIC_REQUEST_LIMIT); assert.equal(value.pipe.status().requestCount, DIAGNOSTIC_REQUEST_LIMIT); retained(value);
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

async function attach(value: ReturnType<typeof fixture>, events: DiagnosticEvent[]): Promise<void> {
  const result = value.pipe.attachTarget("target-1", event => { events.push(event); });
  value.input.write(wire({ id: 1, result: { sessionId: "session-1" } })); assert.equal(await result, "session-1");
}
void test("fixed attached session accepts bounded events between replies and refuses a foreign session", async context => {
  const events: DiagnosticEvent[] = [], value = fixture(context); await attach(value, events);
  const reply = value.pipe.enableRuntime();
  assert.equal(value.sent[1]?.toString(), '{"id":2,"method":"Runtime.enable","params":{},"sessionId":"session-1"}\0');
  const created = { method: "Runtime.executionContextCreated", params: { context: { id: 7 } }, sessionId: "session-1" };
  value.input.write(Buffer.concat([wire(created), wire({ id: 2, result: {}, sessionId: "session-1" })]));
  await reply; assert.deepEqual(events, [created]);
  value.input.write(wire({ ...created, sessionId: "foreign" }));
  await assert.rejects(value.pipe.getFrameTree(), /PIPE_REPLY/u); retained(value);
});
void test("identity event rejection poisons transport but never closes the original streams", async context => {
  const value = fixture(context);
  const result = value.pipe.attachTarget("target-1", () => { throw new Error("identity lost"); });
  value.input.write(wire({ id: 1, result: { sessionId: "session-1" } })); await result;
  const reply = value.pipe.getFrameTree(); const rejected = assert.rejects(reply, /PIPE_REPLY/u);
  value.input.write(wire({ method: "Page.frameNavigated", params: {}, sessionId: "session-1" }));
  await rejected; retained(value);
});
void test("navigation event diagnostic labels survive rejection without retaining URLs or payload", async context => {
  for (const method of ["Page.frameScheduledNavigation", "Page.frameClearedScheduledNavigation",
    "Page.frameSubtreeWillBeDetached", "Page.documentOpened", "Debugger.globalObjectCleared"]) {
    const value = fixture(context);
    const attached = value.pipe.attachTarget("target-1", () => { throw new Error("private failure"); });
    value.input.write(wire({ id: 1, result: { sessionId: "session-1" } })); await attached;
    const rejected = assert.rejects(value.pipe.getFrameTree(), /PIPE_REPLY/u);
    value.input.write(wire({ method, params: { url: "private project URL" }, sessionId: "session-1" }));
    await rejected;
    assert.equal(value.pipe.status().failureObservation?.eventKind, method);
    assert.equal(JSON.stringify(value.pipe.status().failureObservation).includes("private"), false);
    retained(value);
  }
});
void test("first rejected event retains bounded request identity and survives later noise without private payload", async context => {
  const value = fixture(context);
  const result = value.pipe.attachTarget("target-1", () => { throw new Error("private exception URL and design data"); });
  value.input.write(wire({ id: 1, result: { sessionId: "session-1" } })); await result;
  const rejected = assert.rejects(value.pipe.getFrameTree(), /PIPE_REPLY/u);
  value.input.write(wire({ method: "Page.frameNavigated", params: { url: "private-project-url", objectId: "private-handle" }, sessionId: "session-1" }));
  await rejected;
  const first = value.pipe.status().failureObservation;
  assert.deepEqual(first, { schema: "easyeda-pro-control.pcb-diagnostic-pipe-failure.v1", code: "reply", reason: "event-callback",
    request: { id: 2, method: "Page.getFrameTree", phase: "discovery" }, requestPending: true, eventKind: "Page.frameNavigated",
    executionAuthorized: false, dispatchAbsenceVerified: false });
  assert.ok(Object.isFrozen(first)); assert.ok(Object.isFrozen(first?.request));
  assert.equal(JSON.stringify(first).includes("private"), false);
  value.input.emit("error", new Error("later private failure")); value.input.emit("end"); value.output.emit("error", new Error("cleanup noise"));
  assert.equal(value.pipe.status().failureObservation, first);
  await assert.rejects(value.pipe.getTargets(), /PIPE_REPLY/u); assert.equal(value.sent.length, 2); retained(value);
});
void test("unknown event labels and malformed envelopes disclose no received strings or exception text", async context => {
  const value = fixture(context);
  const attached = value.pipe.attachTarget("target-1", () => { throw new Error("private callback detail"); });
  value.input.write(wire({ id: 1, result: { sessionId: "session-1" } })); await attached;
  value.input.write(wire({ method: "private-user-text", params: { data: "private-data" }, sessionId: "session-1" }));
  const failure = value.pipe.status().failureObservation;
  assert.equal(failure?.eventKind, "unknown"); assert.equal(failure?.requestPending, false);
  assert.equal(failure?.request?.id, 1); assert.equal(failure?.reason, "event-callback");
  assert.equal(JSON.stringify(failure).includes("private"), false);
  await assert.rejects(value.pipe.getTargets(), /PIPE_REPLY/u); retained(value);
  const envelope = fixture(context), rejected = assert.rejects(envelope.pipe.getVersion(), /PIPE_REPLY/u);
  envelope.input.write(wire({ id: "private-id", result: { private: "private-value" } })); await rejected;
  assert.equal(envelope.pipe.status().failureObservation?.reason, "reply-id");
  assert.equal(envelope.pipe.status().failureObservation?.eventKind, null);
  assert.equal(JSON.stringify(envelope.pipe.status().failureObservation).includes("private"), false); retained(envelope);
});
void test("opening failure records exact fixed phase without target paths contexts or native dispatch claims", async context => {
  const value = fixture(context); await attach(value, []);
  const rawWindowsPath = String.raw`C:\Fixtures\PrivateDiagnostic.eprj2`;
  const target = { rawWindowsPath, projectUuid: createHash("sha256").update(rawWindowsPath).digest("hex"),
    branchUuid: "b".repeat(32), documentUuid: "c".repeat(16), expectedSourceSha256: "d".repeat(64) };
  const rejected = assert.rejects(value.pipe.observeProjectOpening("private-context", target, "open-project"), /PIPE_REPLY/u);
  value.input.write(wire({ id: 2, result: [], sessionId: "session-1" })); await rejected;
  const failure = value.pipe.status().failureObservation;
  assert.deepEqual(failure?.request, { id: 2, method: "Runtime.callFunctionOn", phase: "project-open-project" });
  assert.equal(failure?.reason, "reply-result"); assert.equal(failure?.requestPending, true);
  assert.equal(failure?.dispatchAbsenceVerified, false); assert.equal(failure?.executionAuthorized, false);
  assert.equal(JSON.stringify(failure).includes("Private"), false);
  assert.equal(JSON.stringify(failure).includes("private"), false); retained(value);
});
void test("partial event after a reply must complete before the request settles", async context => {
  const events: DiagnosticEvent[] = [], value = fixture(context); await attach(value, events);
  const reply = value.pipe.enablePage(); let settled = false;
  const observed = (async (): Promise<void> => { await reply; settled = true; })();
  const eventBytes = wire({ method: "Page.loadEventFired", params: { timestamp: 1 }, sessionId: "session-1" });
  value.input.write(Buffer.concat([wire({ id: 2, result: {}, sessionId: "session-1" }), eventBytes.subarray(0, 9)]));
  await yieldToEventLoop(); assert.equal(settled, false);
  value.input.write(eventBytes.subarray(9)); await observed; assert.equal(events.length, 1); retained(value);
});
void test("only script-source replies receive the larger frame allowance", async context => {
  const events: DiagnosticEvent[] = [], value = fixture(context); await attach(value, events);
  const payload = "a".repeat(2 * 1024 * 1024), reply = value.pipe.getScriptSource("script-1");
  const bytes = wire({ id: 2, result: { scriptSource: payload }, sessionId: "session-1" });
  for (let offset = 0; offset < bytes.length; offset += 65_536) { value.input.write(bytes.subarray(offset, offset + 65_536)); }
  const result = await reply; assert.equal(result["scriptSource"], payload);
  const small = value.pipe.getFrameTree(); const rejected = assert.rejects(small, /PIPE_FRAMING/u);
  value.input.write(Buffer.alloc(1024 * 1024, 32)); value.input.write(Buffer.from("x")); await rejected; retained(value);
});
void test("attached event count and byte budgets apply even without pending requests", async context => {
  const events: DiagnosticEvent[] = [], value = fixture(context); await attach(value, events);
  const eventBytes = wire({ method: "Page.loadEventFired", params: { timestamp: 1 }, sessionId: "session-1" });
  for (let index = 0; index <= 4096; index += 1) { value.input.write(eventBytes); }
  assert.equal(events.length, 4096); await assert.rejects(value.pipe.getFrameTree(), /PIPE_REPLY/u); retained(value);
  const bytesValue = fixture(context); await attach(bytesValue, []);
  const large = wire({ method: "Runtime.consoleAPICalled", params: { text: "x".repeat(1024 * 1024 - 200) }, sessionId: "session-1" });
  for (let index = 0; index < 9; index += 1) { bytesValue.input.write(large); }
  await assert.rejects(bytesValue.pipe.getFrameTree(), /PIPE_REPLY/u); retained(bytesValue);
});
void test("source transport enforces its separate 32 MiB frame and64 MiB lifetime limits", async context => {
  const oversized = fixture(context); await attach(oversized, []);
  const rejected = assert.rejects(oversized.pipe.getScriptSource("script-1"), /PIPE_FRAMING/u);
  const chunk = Buffer.alloc(1024 * 1024, 32);
  for (let index = 0; index < 32; index += 1) { oversized.input.write(chunk); }
  oversized.input.write(Buffer.from("x")); await rejected; retained(oversized);
  const cumulative = fixture(context); await attach(cumulative, []);
  const payload = "x".repeat(16 * 1024 * 1024 - 200);
  for (let id = 2; id <= 6; id += 1) {
    const reply = cumulative.pipe.getScriptSource("script-1");
    const outcome = id === 6 ? assert.rejects(reply, /PIPE_FRAMING/u) : reply;
    const bytes = wire({ id, result: { scriptSource: payload }, sessionId: "session-1" });
    for (let offset = 0; offset < bytes.length; offset += 65_536) { cumulative.input.write(bytes.subarray(offset, offset + 65_536)); }
    await outcome;
  }
  retained(cumulative);
});

function workerAttached(sessionId = "child-session", targetId = "child-target"): unknown {
  return { method: "Target.attachedToTarget", sessionId: "session-1", params: { sessionId,
    targetInfo: { targetId, type: "worker", attached: true, url: "https://synthetic/editor?entry=worker.js", title: "private worker" },
    waitingForDebugger: false } };
}
void test("direct worker discovery retains parent-scoped children before ACK but grants selection only after completion", async context => {
  const childEvents: DiagnosticEvent[] = [], parentEvents: DiagnosticEvent[] = [], value = fixture(context);
  await attach(value, parentEvents);
  const discovered = value.pipe.enableWorkerDiscovery(event => { childEvents.push(event); });
  assert.deepEqual(JSON.parse(value.sent[1]?.subarray(0, -1).toString() ?? "") as unknown,
    { id: 2, method: "Target.setAutoAttach", params: DIAGNOSTIC_WORKER_ATTACH_PARAMS, sessionId: "session-1" });
  value.input.write(wire(workerAttached()));
  assert.throws(() => { value.pipe.selectWorkerSession("child-session"); }, /WORKER_SELECTION/u);
  assert.equal(parentEvents.length, 0); assert.equal(childEvents.length, 1);
  value.input.write(wire({ id: 2, result: {}, sessionId: "session-1" })); await discovered;
  assert.throws(() => { value.pipe.selectWorkerSession("foreign"); }, /WORKER_SELECTION/u);
  value.pipe.selectWorkerSession("child-session");
  const runtime = value.pipe.enableWorkerRuntime();
  assert.equal(value.sent[2]?.toString(), '{"id":3,"method":"Runtime.enable","params":{},"sessionId":"child-session"}\0');
  value.input.write(Buffer.concat([
    wire({ method: "Runtime.executionContextCreated", sessionId: "child-session", params: { context: { id: 7 } } }),
    wire({ id: 3, result: {}, sessionId: "child-session" }),
  ])); await runtime;
  assert.equal(childEvents.length, 2); assert.equal(parentEvents.length, 0);
  assert.throws(() => { value.pipe.selectWorkerSession("child-session"); }, /WORKER_SELECTION/u);
  await assert.rejects(value.pipe.enableWorkerDiscovery(() => { assert.fail("Consumed discovery must not deliver events"); }), /WORKER_DISCOVERY_INPUT/u); retained(value);
});
void test("worker state uses the selected child and immutable evaluation fields without helper expression authority", async context => {
  const value = fixture(context); await attach(value, []);
  const discovery = value.pipe.enableWorkerDiscovery(event => { assert.equal(event.method, "Target.attachedToTarget"); });
  const child = workerAttached();
  value.input.write(Buffer.concat([wire(child), wire({ id: 2, result: {}, sessionId: "session-1" })])); await discovery;
  value.pipe.selectWorkerSession("child-session");
  const observed = value.pipe.observeWorkerState("unique-worker");
  const expected = { id: 3, method: "Runtime.evaluate", params: diagnosticWorkerEvaluationParams("unique-worker"), sessionId: "child-session" };
  assert.equal(value.sent[2]?.toString(), `${JSON.stringify(expected)}\0`);
  assert.deepEqual(diagnosticNativeRequest(value.sent[2] ?? Buffer.alloc(0)),
    { action: "send", requestId: 3, method: "Runtime.evaluate", sessionId: "child-session", uniqueContextId: "unique-worker" });
  value.input.write(wire({ id: 3, result: { result: { type: "string", value: "{}" } }, sessionId: "child-session" }));
  await observed; retained(value);
  for (const change of [{ expression: "1" }, { throwOnSideEffect: false }, { timeout: 0 }, { userGesture: true },
    { contextId: 7 }, { awaitPromise: true }, { allowUnsafeEvalBlockedByCSP: true }]) {
    assert.throws(() => diagnosticNativeRequest(wire({ ...expected, params: { ...expected.params, ...change } })), /OUTBOUND/u);
  }
  assert.deepEqual(diagnosticNativeRequest(wire({ id: 1, method: "Target.setAutoAttach", params: DIAGNOSTIC_WORKER_ATTACH_PARAMS, sessionId: "parent" })),
    { action: "send", requestId: 1, method: "Target.setAutoAttach", sessionId: "parent" });
  for (const change of [{ autoAttach: false }, { waitForDebuggerOnStart: true }, { flatten: false }, { filter: [{ exclude: false }] }]) {
    assert.throws(() => diagnosticNativeRequest(wire({ id: 1, method: "Target.setAutoAttach",
      params: { ...DIAGNOSTIC_WORKER_ATTACH_PARAMS, ...change }, sessionId: "parent" })), /OUTBOUND/u);
  }
});
void test("worker events cannot attach recursively or bypass the fixed direct-child bound", async context => {
  const value = fixture(context); await attach(value, []);
  const discovery = value.pipe.enableWorkerDiscovery(event => { assert.equal(event.sessionId, "session-1"); });
  for (let index = 0; index < 16; index += 1) {
    const child = workerAttached(`child-${String(index)}`, `target-${String(index)}`);
    value.input.write(wire(child));
  }
  const rejected = assert.rejects(discovery, /PIPE_REPLY/u);
  value.input.write(wire(workerAttached("overflow", "overflow"))); await rejected; retained(value);
  const nested = fixture(context); await attach(nested, []);
  const started = nested.pipe.enableWorkerDiscovery(event => {
    if (event.sessionId !== "session-1") { throw new Error("recursive attachment refused"); }
  });
  const nestedChild = workerAttached();
  nested.input.write(Buffer.concat([wire(nestedChild), wire({ id: 2, result: {}, sessionId: "session-1" })])); await started;
  nested.pipe.selectWorkerSession("child-session");
  const pending = assert.rejects(nested.pipe.enableWorkerRuntime(), /PIPE_REPLY/u);
  nested.input.write(wire({ method: "Target.attachedToTarget", sessionId: "child-session", params: {} }));
  await pending; retained(nested);
});
void test("worker-specific failure preserves original streams and parent navigation checks", async context => {
  const value = fixture(context);
  const attached = value.pipe.attachTarget("target-1", event => {
    if (event.method === "Page.frameNavigated") { throw new Error("original parent changed"); }
  });
  value.input.write(wire({ id: 1, result: { sessionId: "session-1" } })); await attached;
  const discovery = value.pipe.enableWorkerDiscovery(event => { assert.equal(event.method, "Target.attachedToTarget"); });
  const child = workerAttached();
  value.input.write(Buffer.concat([wire(child), wire({ id: 2, result: {}, sessionId: "session-1" })])); await discovery;
  value.pipe.selectWorkerSession("child-session");
  const observed = assert.rejects(value.pipe.enableWorkerRuntime(), /PIPE_REPLY/u);
  value.input.write(wire({ method: "Page.frameNavigated", params: {}, sessionId: "session-1" }));
  await observed; retained(value);
});
