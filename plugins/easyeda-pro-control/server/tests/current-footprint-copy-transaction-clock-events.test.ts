/** Synthetic original-channel ordering and grammar tests. No live EasyEDA
 * process, native create, backend clock or saved lifecycle is exercised. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { gunzipSync } from "node:zlib";
import { CurrentFootprintCopyTransactionClockEvents } from "../src/current-footprint-copy-transaction-clock-events.ts";
import type { CurrentFootprintCopyTransactionClockEventTransport } from "../src/current-footprint-copy-transaction-clock-events.ts";
import { currentFootprintCopyTransactionClockNativeCases, currentFootprintCopyTransactionClockNativeSource } from "../src/current-footprint-copy-transaction-clock-native.ts";
import { currentFootprintCopyTransactionClockWire } from "../src/current-footprint-copy-transaction-clock-wire.ts";
import { CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_SITES as SITES } from "../src/current-footprint-copy-transaction-clock.ts";
import type { CurrentFootprintCopyTransactionClockCommand } from "../src/current-footprint-copy-transaction-clock.ts";

function pause(index: number): unknown {
  const site = SITES[index]; assert.ok(site);
  return { method: "Debugger.paused", sessionId: "worker", params: { reason: "other", hitBreakpoints: [`point-${String(index)}`],
    callFrames: [{ callFrameId: `frame-${String(index)}`, functionName: site.role,
      location: { scriptId: "script", lineNumber: site.lineNumber, columnNumber: site.columnNumber } }] } };
}
function fixture(options: Readonly<{ armReject?: unknown; terminated?: boolean }> = {}): Readonly<{ collector: CurrentFootprintCopyTransactionClockEvents; transport: CurrentFootprintCopyTransactionClockEventTransport;
  commands: CurrentFootprintCopyTransactionClockCommand[]; emit: (event: unknown) => void; firstResume: PromiseWithResolvers<unknown>;
  firstResumeDispatched: Promise<null>; unsubscribed: () => boolean }> {
  let armCount = 0, captureCount = 0, listener: ((event: unknown) => void) | null = null, resumeCount = 0, unsubscribed = false;
  const commands: CurrentFootprintCopyTransactionClockCommand[] = [], firstResume = Promise.withResolvers<unknown>();
  const firstResumeDispatched = Promise.withResolvers<null>();
  const emit = (event: unknown): void => { assert.ok(listener); listener(event); };
  const transport: CurrentFootprintCopyTransactionClockEventTransport = { scriptId: "script", managerObjectId: "manager",
    lexicalBundleObjectId: "lexicals", workerSessionId: "worker", assertOriginal: (): Promise<void> => Promise.resolve(),
    assertCleanup: (): void => { assert.equal(unsubscribed, false); },
    assertOriginalTermination: (): Promise<void> => options.terminated === true ? Promise.resolve() : Promise.reject(new Error("original root has not terminated")),
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Exercise the actual synchronous original-owner event subscription contract.
    subscribe: (callback: (event: unknown) => void): (() => void) => {
      assert.equal(listener, null); listener = callback;
      return (): void => { assert.equal(listener, callback); unsubscribed = true; listener = null; };
    },
    request: (command): Promise<unknown> => {
      assert.equal(command.sessionId, "worker"); commands.push(command);
      if (command.method === "Debugger.setBreakpoint") {
        // oxlint-disable-next-line typescript/prefer-promise-reject-errors -- Deliberately reproduce null/undefined native rejection reasons to verify the retained failure latch.
        if (Object.hasOwn(options, "armReject")) { return Promise.reject(options.armReject); }
        const breakpointId = `point-${String(armCount)}`; armCount += 1;
        return Promise.resolve({ breakpointId, actualLocation: command.params.location });
      }
      if (command.method === "Debugger.evaluateOnCallFrame") {
        captureCount += 1;
        return Promise.resolve({ result: { type: "object", subtype: "array", className: "Array", description: "Array(4)", objectId: `sample-${String(captureCount)}` } });
      }
      if (command.method === "Runtime.callFunctionOn") {
        return Promise.resolve({ result: { type: "object", value: { documentUuid: "a".repeat(16), updateTime: 1_777_777_777_777 } } });
      }
      if (command.method === "Debugger.resume") {
        resumeCount += 1; emit({ method: "Debugger.resumed", sessionId: "worker", params: {} });
        if (resumeCount === 1) { emit(pause(1)); firstResumeDispatched.resolve(null); return firstResume.promise; }
      }
      return Promise.resolve({});
    },
  };
  return { collector: new CurrentFootprintCopyTransactionClockEvents(transport), transport, commands, emit,
    firstResume, firstResumeDispatched: firstResumeDispatched.promise, unsubscribed: (): boolean => unsubscribed };
}
void test("original clock events retain a second pause received before the previous resume acknowledgment", async () => {
  const f = fixture(); await f.collector.arm(); f.collector.consumeBeforeCreate(); f.emit(pause(0));
  await f.firstResumeDispatched;
  assert.equal(f.collector.retained().pauseCount, 2);
  assert.equal(f.collector.retained().runner.samples.length, 0);
  assert.equal(f.commands.filter(command => command.method === "Debugger.evaluateOnCallFrame").length, 1);
  f.firstResume.resolve({});
  const packet = await f.collector.result(); await f.collector.requireOriginal(packet);
  assert.equal(packet.samples.length, 2); assert.equal(packet.samples[0].updateTime, packet.samples[1].updateTime);
  assert.equal(f.commands.length, 11); assert.equal(f.collector.retained().events.length, 4);
  assert.equal(f.collector.retained().runner.pauses.length, 2); assert.equal(f.collector.retained().failed, false);
  await assert.rejects(new CurrentFootprintCopyTransactionClockEvents(f.transport).arm(), /ARM_CONSUMED/u);
  await f.collector.cleanup(); assert.equal(f.unsubscribed(), true); assert.equal(f.commands.length, 11);
  await assert.rejects(f.collector.requireOriginal(packet), /UNAVAILABLE/u);
});
void test("lost first resume acknowledgment preserves the next owned pause for cleanup without clock replay", async () => {
  const f = fixture(); await f.collector.arm(); f.collector.consumeBeforeCreate(); f.emit(pause(0));
  await f.firstResumeDispatched; f.firstResume.reject(new Error("original resume acknowledgment lost"));
  await assert.rejects(f.collector.result(), /acknowledgment lost/u);
  await f.collector.cleanup();
  const retained = f.collector.retained();
  assert.equal(retained.failed, true); assert.equal(retained.runner.phase, "failed");
  assert.equal(retained.runner.mutationMayHaveOccurred, true); assert.equal(retained.runner.samples.length, 0);
  assert.deepEqual(retained.runner.pauses, [{ ordinal: 1, resumeAttempted: true, resumeObserved: false },
    { ordinal: 2, resumeAttempted: true, resumeObserved: true }]);
  assert.equal(f.commands.filter(command => command.method === "Debugger.resume").length, 2);
  assert.equal(f.commands.filter(command => command.method === "Debugger.evaluateOnCallFrame").length, 1);
  assert.equal(f.unsubscribed(), true);
});
void test("foreign or premature events consume the observation without resuming an unrelated worker", async () => {
  for (const event of [pause(0), { method: "Debugger.paused", sessionId: "foreign", params: {} },
    { method: "Debugger.resumed", sessionId: "worker", params: {} }]) {
    const f = fixture(); await f.collector.arm(); f.emit(event);
    await assert.rejects(f.collector.result(), /OWNER_OR_PHASE/u);
    assert.throws(() => { f.collector.consumeBeforeCreate(); }, /DISPATCH_CONSUMED/u);
    await f.collector.cleanup(); assert.equal(f.commands.filter(command => command.method === "Debugger.resume").length, 0);
  }
});
void test("an unobserved original root exit cannot release the retained clock subscription", async () => {
  const f = fixture(); await f.collector.arm();
  await assert.rejects(f.collector.releaseAfterTermination(), /has not terminated/u);
  assert.equal(f.unsubscribed(), false); assert.equal(f.collector.retained().originalTerminationObserved, false);
  await f.collector.cleanup(); assert.equal(f.unsubscribed(), true);
});
void test("nullish transport rejections remain failures and never reenable dispatch", async () => {
  for (const armReject of [null, undefined]) {
    const f = fixture({ armReject });
    await assert.rejects(f.collector.arm(), (error: unknown): boolean => error === armReject);
    await assert.rejects(f.collector.result(), (error: unknown): boolean => error === armReject);
    assert.equal(f.collector.retained().failed, true);
    assert.throws(() => { f.collector.consumeBeforeCreate(); }, /DISPATCH_CONSUMED/u);
    await f.collector.cleanup(); assert.equal(f.unsubscribed(), true);
  }
});
void test("original termination releases an armed collector without upgrading samples or dispatch", async () => {
  const f = fixture({ terminated: true }); await f.collector.arm();
  await f.collector.releaseAfterTermination();
  assert.equal(f.unsubscribed(), true); assert.equal(f.collector.retained().released, true);
  assert.equal(f.collector.retained().originalTerminationObserved, true); assert.equal(f.collector.retained().failed, true);
  assert.equal(f.collector.retained().runner.samples.length, 0);
  await assert.rejects(f.collector.result(), /ORIGINAL_TERMINATED/u);
  await assert.rejects(f.collector.releaseAfterTermination(), /CONSUMED/u);
  assert.throws(() => { f.collector.consumeBeforeCreate(); }, /DISPATCH_CONSUMED/u);
  assert.equal(f.commands.filter(command => command.method === "Debugger.resume").length, 0);
});
void test("fixed clock wire rejects caller code, arbitrary locations, session substitution and descriptor traps", () => {
  const cases = currentFootprintCopyTransactionClockNativeCases();
  assert.equal(cases.length, 8);
  for (const command of cases) {
    const encoded = currentFootprintCopyTransactionClockWire(command, 900, "original-worker");
    assert.equal(encoded.command.id, 900); assert.equal(encoded.command.sessionId, "original-worker");
    assert.equal(encoded.request["action"], "footprint-copy-clock");
    assert.equal(Object.hasOwn(encoded.request, "sessionId"), false);
    assert.throws(() => currentFootprintCopyTransactionClockWire({ ...command, sessionId: "foreign" }, 1, "worker"));
    assert.throws(() => currentFootprintCopyTransactionClockWire(command, 0, "worker"));
  }
  assert.throws(() => currentFootprintCopyTransactionClockWire({ method: "Debugger.setBreakpoint",
    params: { location: { scriptId: "script", lineNumber: 109, columnNumber: 36_822 } } }, 1, "worker"));
  let traps = 0;
  const getter = Object.defineProperty({}, "method", { enumerable: true, get: (): string => { traps += 1; return "Debugger.resume"; } });
  const proxy = new Proxy({}, { getPrototypeOf: (): null => { traps += 1; return null; } });
  for (const input of [getter, proxy]) { assert.throws(() => currentFootprintCopyTransactionClockWire(input, 1, "worker")); }
  assert.equal(traps, 0);
});
void test("native clock encoder embeds the same bounded eight grammars and independently seals packed bytes", () => {
  const source = currentFootprintCopyTransactionClockNativeSource();
  const base64 = /FromBase64String\(@"([A-Za-z\d+/=]+)"\)/u.exec(source)?.[1]; assert.ok(base64 !== undefined);
  // oxlint-disable-next-line node/no-sync -- Inspect one fixed in-memory generated table; this test performs no file decompression.
  const bytes = gunzipSync(Buffer.from(base64, "base64"));
  assert.ok(bytes.length <= 65_536); assert.ok(source.includes(createHash("sha256").update(bytes).digest("hex")));
  const rows = bytes.toString("utf8").split("\0"); assert.equal(rows.length, 8);
  for (const [index, sample] of currentFootprintCopyTransactionClockNativeCases().entries()) {
    const wire = currentFootprintCopyTransactionClockWire(sample, 1, "__copyclock_sessionId__");
    const { id: _id, ...command } = wire.command;
    const row = rows[index]?.split("\t"); assert.ok(row);
    assert.equal(row[0], wire.request["clockPhase"]); assert.equal(row[1], command.method);
    assert.equal(row[3], JSON.stringify(command));
  }
  assert.ok(source.includes('Need(fields.Count==names.Length)'));
  assert.ok(source.includes('originalWorkerSession'));
  assert.ok(source.includes('stream.ReadByte()==-1'));
});
