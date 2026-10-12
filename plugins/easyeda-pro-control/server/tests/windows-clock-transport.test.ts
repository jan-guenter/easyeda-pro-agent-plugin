import assert from "node:assert/strict";
import { test } from "node:test";
import { createClockedTransport, tzProbeProvesAbsence, validateClockSample } from "../src/windows-clock-transport.ts";
import type { WindowsAuthorityTransport } from "../src/windows-authority.ts";
import { createWindowsAuthoritySupervisor } from "../src/windows-authority.ts";
import { INPUT } from "./helpers/windows-closed-session-fixture.ts";

type Bag = Record<string, unknown>;
const JOB = "a".repeat(32);
const HELPER = "b".repeat(32);
const BINDING = "c".repeat(64);
const SOURCE = { helperSourceSha256: "d".repeat(64), executionScopeSha256: "e".repeat(64) };
const ROOT = { pid: 100, role: "easyeda-main", startIdentity: `win32:639247486999999999:job:${JOB}` };
const DATE = "2026-10-12T12:00:00.0000000Z";
function sample(): Bag {
  return { schema: "easyeda-pro-control.windows-clock-sample.v1", utcBeforeTicks: "639274896000000000", utcAfterTicks: "639274896000010000",
    qpcBefore: "10000000000000000", qpcAfter: "10000000000001000", qpcFrequency: "1000000", highResolution: true, localOffsetMinutes: 120, zoneRulesSha256: "f".repeat(64) };
}
function clock(): Bag {
  const after = sample(); after["utcBeforeTicks"] = "639274896010000000"; after["utcAfterTicks"] = "639274896010010000";
  after["qpcBefore"] = "10000000001000000"; after["qpcAfter"] = "10000000001001000";
  return { status: "observed", tzAbsentBefore: true, tzAbsentAfter: true, before: sample(), after };
}
function base(phase: string): Bag {
  if (phase === "launch") { return { jobId: JOB, helperInstance: HELPER, root: ROOT }; }
  if (phase === "capture") { return { jobId: JOB, helperInstance: HELPER, bindingSha256: BINDING, capturedAt: DATE, processes: [ROOT], runtimePid: 100, socketOwnerPid: null }; }
  return { jobId: JOB, helperInstance: HELPER, captureBindingSha256: BINDING, checkedAt: DATE, jobEmpty: true, retainedProcessesExited: true };
}
function fixture(): { transport: WindowsAuthorityTransport; records: Bag[]; response: Bag; released: number } {
  const state = { records: [] as Bag[], response: { schema: "easyeda-pro-control.windows-clocked-launch.v1", base: base("launch"), clock: clock() } as Bag, released: 0 };
  return Object.assign(state, { transport: {
    request(input: Bag): Promise<unknown> { state.records.push(input); return Promise.resolve(state.response); },
    release(): Promise<void> { state.released += 1; return Promise.resolve(); },
  } });
}
for (const [size, error, expected] of [[0, 203, true], [0, 0, false], [0, 5, false], [1, 0, false], [100, 203, false]]) {
  void test(`TZ classifier ${size}/${error} only admits explicit missing-variable status`, () => { assert.equal(tzProbeProvesAbsence(size, error), expected); });
}
for (const value of [undefined, null, -1, 0.5, Number.NaN, Number.POSITIVE_INFINITY, "0", 4_294_967_296]) {
  void test(`TZ classifier refuses malformed numeric input ${String(value)}`, () => {
    assert.throws(() => tzProbeProvesAbsence(value, 203), /CLOCK_RECEIPT_REFUSED/u);
    assert.throws(() => tzProbeProvesAbsence(1, value), /CLOCK_RECEIPT_REFUSED/u);
  });
}
void test("clock sample preserves exact decimal counters above JS safe integer range and offset sign", () => {
  const value = validateClockSample(sample());
  assert.equal(value.qpcBefore, "10000000000000000"); assert.equal(value.localOffsetMinutes, 120);
  assert.equal(Object.isFrozen(value), true);
});
const mutations: [string, (v: Bag) => void][] = [
  ["schema", (v) => { v["schema"] = "other"; }], ["QPC fallback", (v) => { v["highResolution"] = false; }],
  ["numeric counter", (v) => { v["qpcBefore"] = 10_000; }], ["leading zero", (v) => { v["qpcBefore"] = "01"; }],
  ["negative counter", (v) => { v["qpcBefore"] = "-1"; }], ["huge counter", (v) => { v["qpcBefore"] = "9".repeat(20); }],
  ["zero frequency", (v) => { v["qpcFrequency"] = "0"; }], ["past UTC", (v) => { v["utcBeforeTicks"] = "0"; }],
  ["backward UTC", (v) => { v["utcAfterTicks"] = "639274895999999999"; }],
  ["backward QPC", (v) => { v["qpcAfter"] = "9999999999999999"; }],
  ["slow UTC sample", (v) => { v["utcAfterTicks"] = "639274896010000001"; }],
  ["slow QPC sample", (v) => { v["qpcAfter"] = "10000000001000001"; }],
  ["fractional offset", (v) => { v["localOffsetMinutes"] = 1.5; }], ["offset bound", (v) => { v["localOffsetMinutes"] = 841; }],
  ["bad rules hash", (v) => { v["zoneRulesSha256"] = "private"; }], ["extra field", (v) => { v["TZ"] = "SECRET"; }],
];
for (const [name, mutate] of mutations) {
  void test(`sample refuses ${name}`, () => { const value = sample(); mutate(value); assert.throws(() => validateClockSample(value), /CLOCK_RECEIPT_REFUSED/u); });
}
void test("sample accessors never execute", () => {
  const value = sample(); let reads = 0;
  Object.defineProperty(value, "utcBeforeTicks", { get(): never { reads += 1; throw new Error("secret"); } });
  assert.throws(() => validateClockSample(value), /CLOCK_RECEIPT_REFUSED/u); assert.equal(reads, 0);
});
for (const [action, mapped, phase] of [["launch", "clocked-launch", "launch"], ["capture", "clocked-capture", "capture"],
  ["finish-probe", "clocked-finish-probe", "capture"], ["prove-terminated", "clocked-prove-terminated", "termination"]]) {
  void test(`fixed ${action} mapping preserves the exact old base object`, async () => {
    const f = fixture(); f.response = { schema: `easyeda-pro-control.windows-clocked-${phase}.v1`, base: base(String(phase)), clock: clock() };
    const wrapper = createClockedTransport(f.transport, SOURCE);
    const request = { action, bindingSha256: BINDING, captureBindingSha256: BINDING, jobId: JOB, helperInstance: HELPER };
    const result = await wrapper.transport.request(request);
    assert.equal(result, f.response["base"]); assert.equal(f.records[0]?.["action"], mapped);
    const observation = wrapper.observations()[0]; assert.ok(observation);
    assert.equal(observation.phase, phase); assert.equal(observation.helperSourceSha256, SOURCE.helperSourceSha256);
    assert.equal(observation.executionScopeSha256, SOURCE.executionScopeSha256);
    assert.equal(observation.producerBindingVerified, false); assert.equal(observation.executionAuthorized, false);
    const copy = wrapper.observations(); assert.notEqual(copy, wrapper.observations());
  });
}
for (const action of ["begin-probe", "end-probe", "release-capture", "normal-close"]) {
  void test(`unmodified ${action} request bytes and result identity pass through`, async () => {
    const f = fixture(), wrapper = createClockedTransport(f.transport, SOURCE);
    const request = { action };
    assert.equal(await wrapper.transport.request(request), f.response); assert.equal(JSON.stringify(f.records[0]), JSON.stringify(request));
    assert.notEqual(f.records[0], request); assert.equal(Object.isFrozen(f.records[0]), true);
    assert.deepEqual(wrapper.observations(), []);
  });
}
for (const phase of ["launch", "termination"]) {
  void test(`unavailable clock preserves successful ${phase} base without claiming qualification`, async () => {
    const f = fixture(); f.response = { schema: `easyeda-pro-control.windows-clocked-${phase}.v1`, base: base(phase), clock: { status: "unavailable", reason: "clock-sample" } };
    const wrapper = createClockedTransport(f.transport, SOURCE);
    const value = await wrapper.transport.request({ action: phase === "launch" ? "launch" : "prove-terminated", captureBindingSha256: BINDING, jobId: JOB, helperInstance: HELPER });
    assert.equal(value, f.response["base"]); assert.equal(wrapper.observations()[0]?.clock.status, "unavailable");
  });
}
void test("wrong capture binding refuses before adding an observation", async () => {
  const f = fixture(); f.response = { schema: "easyeda-pro-control.windows-clocked-capture.v1", base: base("capture"), clock: clock() };
  const wrapper = createClockedTransport(f.transport, SOURCE);
  await assert.rejects(wrapper.transport.request({ action: "capture", bindingSha256: "1".repeat(64) }), /CLOCK_RECEIPT_REFUSED/u);
  assert.deepEqual(wrapper.observations(), []);
});
for (const extra of [{ schema: "other" }, { unexpected: true }]) {
  void test(`malformed clock envelope refuses ${Object.keys(extra).join(",")}`, async () => {
    const f = fixture(); Object.assign(f.response, extra); const wrapper = createClockedTransport(f.transport, SOURCE);
    await assert.rejects(wrapper.transport.request({ action: "launch" }), /CLOCK_RECEIPT_REFUSED/u); assert.deepEqual(wrapper.observations(), []);
  });
}
for (const phase of ["launch", "capture", "termination"]) {
  void test(`malformed ${phase} base is still refused even when clock is also malformed`, async () => {
    const f = fixture(); f.response = { schema: `easyeda-pro-control.windows-clocked-${phase}.v1`, base: { ...base(phase), jobId: "invalid" }, clock: null };
    const wrapper = createClockedTransport(f.transport, SOURCE);
    await assert.rejects(wrapper.transport.request({ action: phase === "termination" ? "prove-terminated" : phase, bindingSha256: BINDING,
      captureBindingSha256: BINDING, jobId: JOB, helperInstance: HELPER }), /CLOCK_RECEIPT_REFUSED/u);
    assert.deepEqual(wrapper.observations(), []);
  });
}
for (const [phase, field] of [["capture", "bindingSha256"], ["termination", "captureBindingSha256"], ["termination", "jobId"], ["termination", "helperInstance"]] as const) {
  for (const responseMatchesOriginal of [false, true]) {
    void test(`${phase}/${field} correlation uses immutable predispatch binding; original=${responseMatchesOriginal}`, async () => {
      const socket = { localPort: 1234 };
      const request: Bag = { action: phase === "capture" ? "capture" : "prove-terminated", bindingSha256: BINDING,
        captureBindingSha256: BINDING, jobId: JOB, helperInstance: HELPER, socket };
      const pending = Promise.withResolvers<unknown>(); let sent: Bag | undefined;
      const wrapper = createClockedTransport({ request(input): Promise<unknown> { sent = input; return pending.promise; }, release(): Promise<void> { return Promise.resolve(); } }, SOURCE);
      const result = wrapper.transport.request(request);
      const value = base(phase); const changed = field.endsWith("Sha256") ? "1".repeat(64) : "1".repeat(32);
      request[field] = changed; socket.localPort = 9999;
      if (!responseMatchesOriginal) { value[field] = changed; }
      pending.resolve({ schema: `easyeda-pro-control.windows-clocked-${phase}.v1`, base: value, clock: clock() });
      if (responseMatchesOriginal) { assert.equal(await result, value); }
      else { await assert.rejects(result, /CLOCK_RECEIPT_REFUSED/u); assert.deepEqual(wrapper.observations(), []); }
      assert.ok(sent); assert.notEqual(sent[field], changed);
      assert.deepEqual(sent["socket"], { localPort: 1234 }); assert.equal(Object.isFrozen(sent["socket"]), true);
    });
  }
}
for (const action of ["launch", "capture", "prove-terminated", "normal-close"]) {
  for (const nested of [false, true]) {
    void test(`${action} rejects ${nested ? "nested" : "top-level"} request accessors without invocation or dispatch`, async () => {
      const f = fixture(), wrapper = createClockedTransport(f.transport, SOURCE); let reads = 0;
      const request: Bag = { action }, target: Bag = nested ? {} : request;
      if (nested) { request["socket"] = target; }
      Object.defineProperty(target, "bindingSha256", { enumerable: true, get(): string { reads += 1; return BINDING; } });
      await assert.rejects(wrapper.transport.request(request), /CLOCK_RECEIPT_REFUSED/u);
      assert.equal(reads, 0); assert.equal(f.records.length, 0); assert.deepEqual(wrapper.observations(), []);
    });
  }
}
void test("unknown and inherited mapping names refuse before any transport call", async () => {
  const f = fixture(), wrapper = createClockedTransport(f.transport, SOURCE);
  for (const action of ["constructor", "unknown", "clocked-launch"]) { await assert.rejects(wrapper.transport.request({ action }), /CLOCK_RECEIPT_REFUSED/u); }
  assert.equal(f.records.length, 0);
});
void test("release blocks future requests without forcing any native stop", async () => {
  const f = fixture(), wrapper = createClockedTransport(f.transport, SOURCE);
  await wrapper.transport.release(); assert.equal(f.released, 1);
  await assert.rejects(wrapper.transport.request({ action: "launch" }), /CLOCK_RECEIPT_REFUSED/u); assert.equal(f.records.length, 0);
});
void test("concurrent requests and late receipt after release refuse", async () => {
  const f = fixture(), pending = Promise.withResolvers<unknown>(); let calls = 0;
  const wrapper = createClockedTransport({ request(): Promise<unknown> { calls += 1; return pending.promise; }, release(): Promise<void> { return Promise.resolve(); } }, SOURCE);
  const first = wrapper.transport.request({ action: "launch" });
  await assert.rejects(wrapper.transport.request({ action: "launch" }), /CLOCK_RECEIPT_REFUSED/u);
  await wrapper.transport.release(); pending.resolve(f.response);
  await assert.rejects(first, /CLOCK_RECEIPT_REFUSED/u); assert.equal(calls, 1); assert.deepEqual(wrapper.observations(), []);
});
void test("bounded attachment storage never blocks normal close or probe cleanup", async () => {
  const f = fixture(), wrapper = createClockedTransport(f.transport, SOURCE);
  for (let index = 0; index < 64; index += 1) { await wrapper.transport.request({ action: "launch" }); }
  await wrapper.transport.request({ action: "launch" });
  assert.equal(await wrapper.transport.request({ action: "normal-close" }), f.response);
  assert.equal(await wrapper.transport.request({ action: "end-probe" }), f.response);
  assert.equal(wrapper.observations().length, 64); assert.equal(f.records.length, 67);
});
for (const useProbe of [false, true]) {
  for (const clockMode of ["observed", "unavailable", "malformed", "missing", "accessor"]) {
    void test(`actual maintained supervisor accepts original ownership with probe=${useProbe}, clock=${clockMode}`, async () => {
      const input = { ...INPUT, bindingSha256: BINDING, runtimeIdentity: { ...INPUT.runtimeIdentity, processId: useProbe ? null : 101 } };
      const requests: string[] = [];
      let clockReads = 0, helperAlive = true;
      const raw: WindowsAuthorityTransport = {
        // Synthetic retained helper remains available.
        assertClosedSessionAvailable(): void { assert.equal(helperAlive, true); },
        request(request): Promise<unknown> {
          const action = String(request["action"]); requests.push(action);
          if (action === "begin-probe") { return Promise.resolve({ schema: "easyeda-pro-control.windows-process-probe.v1", bindingSha256: BINDING, port: 12_345, nonce: "0".repeat(64) }); }
          if (action === "end-probe") { return Promise.resolve({ closed: true, bindingSha256: BINDING }); }
          if (action === "normal-close") { return Promise.resolve({ closeDispatched: true, jobId: JOB, saveOrDiscardSelected: false }); }
          let phase = "termination";
          if (action === "clocked-launch") { phase = "launch"; }
          else if (action === "clocked-capture" || action === "clocked-finish-probe") { phase = "capture"; }
          else { assert.equal(action, "clocked-prove-terminated"); }
          const value = base(phase);
          if (phase === "capture") {
            value["processes"] = [ROOT, { pid: 101, role: useProbe ? "native-socket-owner" : "renderer", startIdentity: `win32:639247486999999998:job:${JOB}` }];
            value["runtimePid"] = useProbe ? null : 101; value["socketOwnerPid"] = useProbe ? 101 : null;
          }
          const response: Bag = { schema: `easyeda-pro-control.windows-clocked-${phase}.v1`, base: value };
          if (clockMode === "accessor") { Object.defineProperty(response, "clock", { enumerable: true, get(): never { clockReads += 1; throw new Error("not observable"); } }); }
          else if (clockMode === "unavailable") { response["clock"] = { status: "unavailable", reason: "clock-sample" }; }
          else if (clockMode === "malformed") { response["clock"] = { status: "observed", TZ: "SECRET" }; }
          else if (clockMode !== "missing") { response["clock"] = clock(); }
          return Promise.resolve(response);
        },
        release(): Promise<void> { helperAlive = false; return Promise.resolve(); },
      };
      const wrapper = createClockedTransport(raw, SOURCE);
      const supervisor = createWindowsAuthoritySupervisor(wrapper.transport, { helperSha256: SOURCE.helperSourceSha256, expectedExecutable: "C:\\Synthetic\\easyeda-pro.exe",
        expectedExecutableSha256: "d".repeat(64), reviewedExecutionScopeSha256: SOURCE.executionScopeSha256,
        revalidateClosedSessionHelper(): Promise<void> { return Promise.resolve(); },
        performAuthenticatedProcessProbe(): Promise<void> { return Promise.resolve(); } });
      const launch = await supervisor.launch({ confirmLaunch: true });
      const executionAuthority = await supervisor.capture(input);
      const binding = { operationId: input.operationId, phase: input.orphanPhase, challengeAttempt: input.challengeAttempt,
        bridgeSession: input.bridgeSession, runtimeIdentity: input.runtimeIdentity, executionAuthority, launch };
      const intent = await supervisor.prepareClosedSessionClose({ ...binding, windowHandle: "1234" });
      const closeReceipt = await supervisor.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true });
      const proof = await supervisor.proveClosedSession({ ...binding, intent, closeReceipt });
      assert.equal(proof.jobEmpty, true); assert.equal(proof.queuedWritesPersisted, "not-proved");
      assert.equal(wrapper.observations().length, 3);
      assert.deepEqual(wrapper.observations().map((value) => value.clock.status), Array.from({ length: 3 }, () => clockMode === "observed" ? "observed" : "unavailable"));
      assert.equal(clockReads, 0);
      if (clockMode === "malformed" || clockMode === "missing" || clockMode === "accessor") {
        for (const observation of wrapper.observations()) { assert.deepEqual(observation.clock, { status: "unavailable", reason: "invalid-clock" }); }
      }
      assert.ok(requests.includes(useProbe ? "clocked-finish-probe" : "clocked-capture"));
      assert.equal(requests.filter((value) => value === "normal-close").length, 1);
      assert.equal(requests.includes("capture"), false); assert.equal(requests.includes("launch"), false);
    });
  }
}
