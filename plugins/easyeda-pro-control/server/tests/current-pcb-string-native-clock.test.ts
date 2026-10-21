/** Synthetic native replies only; no Windows helper/process is launched. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { CurrentPcbStringNativeClockIssuer } from "../src/current-pcb-string-native-clock.ts";
import type { CurrentPcbStringNativeClockBinding, CurrentPcbStringNativeClockRequest,
  CurrentPcbStringNativeClockTransport } from "../src/current-pcb-string-native-clock.ts";
import { CURRENT_PCB_STRING_NATIVE_CLOCK_CSHARP } from "../src/current-pcb-string-native-clock-source.ts";

const BINDING = Object.freeze({ helperInstance: "a".repeat(32), jobId: "b".repeat(32), rootPid: 1234, rootCreated: "134370398619813012" });
function sample(ms: number): { schema: string; utcBeforeTicks: string; utcAfterTicks: string; qpcBefore: string;
  qpcAfter: string; qpcFrequency: string; highResolution: boolean; localOffsetMinutes: number; zoneRulesSha256: string } {
  const ticks = 621_355_968_000_000_000n + BigInt(ms) * 10_000n;
  return { schema: "easyeda-pro-control.windows-clock-sample.v1", utcBeforeTicks: String(ticks), utcAfterTicks: String(ticks + 10n),
    qpcBefore: String(ms * 1000), qpcAfter: String(ms * 1000 + 1), qpcFrequency: "1000000", highResolution: true,
    localOffsetMinutes: 120, zoneRulesSha256: "c".repeat(64) };
}
function reply(request: CurrentPcbStringNativeClockRequest): { schema: string; phase: CurrentPcbStringNativeClockRequest["phase"];
  sequence: number; binding: { helperInstance: string; jobId: string; rootPid: number; rootCreated: string };
  clock: { before: { tzAbsent: boolean; reason: null; sample: ReturnType<typeof sample> };
    after: { tzAbsent: boolean; reason: null; sample: ReturnType<typeof sample> } } } {
  return { schema: "easyeda-pro-control.pcb-string-native-clock.v1", phase: request.phase, sequence: request.sequence,
    binding: { ...BINDING }, clock: {
      before: { tzAbsent: true, reason: null, sample: sample(1000 + request.sequence * 100) },
      after: { tzAbsent: true, reason: null, sample: sample(1002 + request.sequence * 100) },
    } };
}
function fixture(change?: (raw: ReturnType<typeof reply>) => void): { issuer: CurrentPcbStringNativeClockIssuer;
  transport: CurrentPcbStringNativeClockTransport; calls: CurrentPcbStringNativeClockRequest[]; expire: () => void } {
  const calls: CurrentPcbStringNativeClockRequest[] = []; let current = true;
  const transport: CurrentPcbStringNativeClockTransport = { async request(request): Promise<unknown> {
    calls.push(request); const raw = reply(request); change?.(raw); await Promise.resolve(); return raw;
  }, assertCurrent(): void { assert.equal(current, true, "original native owner lost"); } };
  return { issuer: new CurrentPcbStringNativeClockIssuer(transport, BINDING), transport, calls,
    expire(): void { current = false; } };
}
void test("String Windows issuer observes ordered original phase tokens without rename authority", async () => {
  const f = fixture();
  for (const phase of ["before", "armed", "post", "termination"] as const) {
    const token = await f.issuer.observe(phase);
    assert.equal(f.issuer.requireOriginal(token), token); assert.equal(token.nativeClockSamplesVerified, true);
    assert.equal(token.originalClockedLaunchVerified, false); assert.equal(token.appClockDirectlyObserved, false);
    assert.equal(token.futureSaveClockVerified, false); assert.equal(token.nativeOwnerAdmissionVerified, false);
    assert.equal(token.executionAuthorized, false); assert.equal(token.saveAuthorized, false);
    assert.throws(() => f.issuer.requireOriginal(structuredClone(token)), /original current/u);
    await assert.rejects(f.issuer.observe(phase), /consumed/u);
  }
  assert.deepEqual(f.calls.map(value => value.sequence), [1, 2, 3, 4]);
  await assert.rejects(f.issuer.observe("before"), /consumed/u);
});
void test("String native clock refuses unavailable/timezone/QPC/identity drift and preserves one cleanup observation", async () => {
  for (const change of [
    (raw: ReturnType<typeof reply>): void => { raw.binding.rootPid += 1; },
    (raw: ReturnType<typeof reply>): void => { raw.clock.before.tzAbsent = false; },
    (raw: ReturnType<typeof reply>): void => { raw.clock.after.sample.localOffsetMinutes = 60; },
    (raw: ReturnType<typeof reply>): void => { raw.clock.after.sample.zoneRulesSha256 = "d".repeat(64); },
    (raw: ReturnType<typeof reply>): void => { raw.clock.after.sample.qpcFrequency = "1000001"; },
    (raw: ReturnType<typeof reply>): void => { raw.clock.after.sample.qpcBefore = "0"; },
    (raw: ReturnType<typeof reply>): void => { raw.clock.before.sample.localOffsetMinutes = -0; },
  ]) {
    const f = fixture(raw => { if (raw.phase === "before") { change(raw); } });
    await assert.rejects(f.issuer.observe("before")); await assert.rejects(f.issuer.observe("before"), /consumed/u);
    await assert.rejects(f.issuer.observe("armed"), /phase order/u);
    const terminal = await f.issuer.observe("termination"); assert.equal(f.issuer.requireOriginal(terminal), terminal);
    assert.equal(f.issuer.evidence().failed, true); assert.equal(f.calls.length, 2);
  }
});
void test("String termination retains its consumed sequence after a local refusal never reached native dispatch", async () => {
  const requests: CurrentPcbStringNativeClockRequest[] = [];
  const issuer = new CurrentPcbStringNativeClockIssuer({ async request(request): Promise<unknown> {
    requests.push(request); await Promise.resolve(); return reply(request);
  }, assertCurrent(phase): void { if (phase === "before") { throw new Error("local pre-dispatch refusal"); } } }, BINDING);
  await assert.rejects(issuer.observe("before"), /local pre-dispatch refusal/u); assert.equal(requests.length, 0);
  const terminal = await issuer.observe("termination"); assert.equal(terminal.sequence, 2);
  assert.deepEqual(requests.map(request => [request.phase, request.sequence]), [["termination", 2]]);
  assert.equal(issuer.requireOriginal(terminal), terminal);
  await assert.rejects(issuer.observe("termination"), /consumed/u);
});
void test("String native issuance binds transport methods, original binding and current lifetime", async () => {
  const f = fixture(), token = await f.issuer.observe("before"); f.expire();
  assert.throws(() => f.issuer.requireOriginal(token), /owner lost/u);
  const other = fixture();
  Object.defineProperty(other.transport, "request", { value: (): Promise<unknown> => Promise.resolve({}) });
  await assert.rejects(other.issuer.observe("before"), /transport/u); assert.equal(other.calls.length, 0);
  const binding: CurrentPcbStringNativeClockBinding = { ...BINDING };
  const changed = new CurrentPcbStringNativeClockIssuer(fixture().transport, binding);
  Object.defineProperty(binding, "rootPid", { value: 4321 }); await assert.rejects(changed.observe("before"), /binding changed/u);
});
void test("String native reply is captured immutably before post-await owner checks", async () => {
  let incoming: ReturnType<typeof reply> | undefined;
  const issuer = new CurrentPcbStringNativeClockIssuer({ async request(request): Promise<unknown> {
    incoming = reply(request); await Promise.resolve(); return incoming;
  }, assertCurrent(): void { if (incoming !== undefined) { incoming.binding.rootPid = 9876; } } }, BINDING);
  const token = await issuer.observe("before"); assert.equal(token.binding.rootPid, BINDING.rootPid);
  const retained = issuer.evidence().rawReplies[0]; assert.ok(retained !== null && typeof retained === "object" && Object.isFrozen(retained));
  assert.throws(() => Object.defineProperty(retained, "phase", { value: "post" }));
  assert.equal(issuer.requireOriginal(token), token);
});
void test("String native replies reject accessor/proxy and fake token lookups without executing hooks", async () => {
  let hooks = 0;
  const issuer = new CurrentPcbStringNativeClockIssuer({ async request(request): Promise<unknown> {
    const raw = reply(request); Object.defineProperty(raw, "clock", { get(): never { hooks += 1; throw new Error("getter"); } });
    await Promise.resolve(); return raw;
  }, assertCurrent(): void {
    // Synthetic native owner.
  } }, BINDING);
  await assert.rejects(issuer.observe("before"), /CAPTURE/u); assert.equal(hooks, 0);
  const original = await fixture().issuer.observe("before");
  const forged = new Proxy(original, { get(): never { hooks += 1; throw new Error("trap"); } });
  assert.throws(() => issuer.requireOriginal(forged), /original current/u); assert.equal(hooks, 0);
});
void test("new native collector reads presence-only TZ and UTC/QPC but has no process authority operation", () => {
  assert.match(CURRENT_PCB_STRING_NATIVE_CLOCK_CSHARP, /GetEnvironmentVariable\("TZ", System.IntPtr.Zero, 0\)/u);
  assert.match(CURRENT_PCB_STRING_NATIVE_CLOCK_CSHARP, /error != 203/u);
  assert.match(CURRENT_PCB_STRING_NATIVE_CLOCK_CSHARP, /Stopwatch.GetTimestamp/u);
  assert.match(CURRENT_PCB_STRING_NATIVE_CLOCK_CSHARP, /TimeZoneInfo.ClearCachedData/u);
  assert.doesNotMatch(CURRENT_PCB_STRING_NATIVE_CLOCK_CSHARP, /Process\.Start|GetProcessById|TerminateProcess|Kill\(/u);
});
void test("String native collector exactly matches the private diagnostic helper source", async () => {
  const helper = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  const begin = "// BEGIN STRING NATIVE CLOCK COLLECTOR", end = "// END STRING NATIVE CLOCK COLLECTOR";
  const finish = helper.indexOf(end), start = helper.indexOf(begin);
  assert.ok(start !== -1 && finish > start); assert.equal(helper.indexOf(begin, start + 1), -1);
  assert.equal(helper.slice(start + begin.length, finish).trim(), CURRENT_PCB_STRING_NATIVE_CLOCK_CSHARP.trim());
});
