/** Synthetic retained-owner transport. These tests establish issuer ordering
 * and refusal; they do not establish Windows or backend-clock provenance. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentFootprintCopyWindowsClockIssuer } from "../src/current-footprint-copy-windows-clock.ts";
import type { CurrentFootprintCopyWindowsClockPhase, CurrentFootprintCopyWindowsClockRequest,
  CurrentFootprintCopyWindowsClockTransport } from "../src/current-footprint-copy-windows-clock.ts";

type Data = Record<string, unknown>;
const binding = Object.freeze({ helperInstance: "a".repeat(32), jobId: "b".repeat(32), rootPid: 123, rootCreated: "639274896000000000" });
function sample(milliseconds: number): Data {
  const ticks = 639_274_896_000_000_000n + BigInt(milliseconds) * 10_000n;
  const qpc = 10_000_000_000_000_000n + BigInt(milliseconds) * 1000n;
  return { schema: "easyeda-pro-control.windows-clock-sample.v1", utcBeforeTicks: String(ticks), utcAfterTicks: String(ticks + 10_000n),
    qpcBefore: String(qpc), qpcAfter: String(qpc + 1000n), qpcFrequency: "1000000", highResolution: true,
    localOffsetMinutes: 120, zoneRulesSha256: "c".repeat(64) };
}
function reply(request: CurrentFootprintCopyWindowsClockRequest, before: Data = sample(request.sequence * 1000),
  after: Data = sample(request.sequence * 1000 + 10)): Data {
  return { schema: "easyeda-pro-control.footprint-copy-windows-clock.v1", phase: request.phase, sequence: request.sequence, binding,
    clock: { before: { tzAbsent: true, reason: null, sample: before }, after: { tzAbsent: true, reason: null, sample: after } } };
}
function fixture(): {
  issuer: CurrentFootprintCopyWindowsClockIssuer; transport: CurrentFootprintCopyWindowsClockTransport;
  state: { live: boolean; empty: boolean; owned: boolean; records: CurrentFootprintCopyWindowsClockRequest[];
    onOwned: () => void; onCurrent: (phase: CurrentFootprintCopyWindowsClockPhase) => void;
    respond: (request: CurrentFootprintCopyWindowsClockRequest) => Promise<unknown> };
} {
  const state = { live: true, empty: false, owned: true, records: [] as CurrentFootprintCopyWindowsClockRequest[],
    onOwned: (): void => {
      // Synthetic owner callback.
    }, onCurrent: (_phase: CurrentFootprintCopyWindowsClockPhase): void => {
      // Synthetic current callback.
    },
    respond: (request: CurrentFootprintCopyWindowsClockRequest): Promise<unknown> => Promise.resolve(reply(request)) };
  const transport = {
    request(request: CurrentFootprintCopyWindowsClockRequest): Promise<unknown> { state.records.push(request); return state.respond(request); },
    assertOwned(): void { assert.equal(state.owned, true, "owner lost"); state.onOwned(); },
    assertCurrent(phase: CurrentFootprintCopyWindowsClockPhase): void {
      assert.equal(phase === "termination" ? !state.live && state.empty : state.live, true, "root/Job state differs"); state.onCurrent(phase);
    },
  };
  return { issuer: new CurrentFootprintCopyWindowsClockIssuer(transport, binding), transport, state };
}
void test("original four-phase samples retain historical identity after exit without granting a new live observation", async () => {
  const f = fixture(); const before = await f.issuer.observe("before");
  await assert.rejects(f.issuer.observe("post")); assert.equal(f.state.records.length, 1);
  const armed = await f.issuer.observe("armed"); await f.issuer.observe("post");
  f.state.live = false; f.state.empty = true;
  assert.equal(f.issuer.requireRecorded(before), before);
  assert.throws(() => f.issuer.requireCurrent(armed), /root\/Job state differs/u);
  const termination = await f.issuer.observe("termination");
  assert.equal(f.issuer.requireCurrent(termination), termination);
  assert.throws(() => f.issuer.requireRecorded({ ...before }), /original recorded/u);
  assert.equal(termination.backendActorProvenanceVerified, false); assert.equal(termination.executionAuthorized, false);
  await assert.rejects(f.issuer.observe("termination")); await assert.rejects(f.issuer.observe("before"));
  assert.deepEqual(f.state.records.map(request => [request.phase, request.sequence]), [["before", 1], ["armed", 2], ["post", 3], ["termination", 4]]);
  f.state.owned = false; assert.throws(() => f.issuer.requireRecorded(before), /owner lost/u);
});
void test("owner callbacks cannot substitute the next request or assertion before dispatch", async () => {
  for (const hook of ["onOwned", "onCurrent"] as const) {
    const f = fixture(); let substituted = 0;
    f.state[hook] = (): void => { Object.defineProperty(f.transport, "request", { value: (): Promise<unknown> => {
      substituted += 1; return Promise.resolve(null);
    } }); };
    await assert.rejects(f.issuer.observe("before"), /original transport or binding changed/u);
    assert.equal(substituted, 0); assert.equal(f.state.records.length, 0); assert.equal(f.issuer.evidence().failed, true);
  }
});
void test("lost ownership after an awaited reply retains raw evidence and consumes the phase; termination needs the whole Job empty", async () => {
  const f = fixture(); f.state.respond = (request): Promise<unknown> => { f.state.live = false; return Promise.resolve(reply(request)); };
  await assert.rejects(f.issuer.observe("before"), /root\/Job state differs/u);
  assert.equal(f.issuer.evidence().rawReplies.length, 1); assert.deepEqual(f.issuer.evidence().phasesObserved, []);
  await assert.rejects(f.issuer.observe("before")); await assert.rejects(f.issuer.observe("armed")); assert.equal(f.state.records.length, 1);
  await assert.rejects(f.issuer.observe("termination"), /root\/Job state differs/u);
  f.state.empty = true; await assert.rejects(f.issuer.observe("termination")); assert.equal(f.state.records.length, 1);
});
void test("native pair refuses identity, zone, backward counters, nonmissing TZ and collection overruns without issuing evidence", async () => {
  const alterations: readonly [((request: CurrentFootprintCopyWindowsClockRequest) => Data), number][] = [
    [request => ({ ...reply(request), sequence: request.sequence + 1 }), 1],
    [request => ({ ...reply(request), binding: { ...binding, rootPid: binding.rootPid + 1 } }), 1],
    [request => reply(request, sample(1000), { ...sample(1010), localOffsetMinutes: 60 }), 1],
    [request => reply(request, sample(1000), { ...sample(1010), zoneRulesSha256: "d".repeat(64) }), 1],
    [request => reply(request, sample(1000), sample(999)), 1],
    [request => reply(request, sample(1000), sample(11_000)), 1],
    // The inert raw copier rejects negative zero before retaining a JSON packet.
    [request => reply(request, { ...sample(1000), localOffsetMinutes: -0 }, sample(1010)), 0],
    [request => ({ ...reply(request), clock: { before: { tzAbsent: false, reason: "tz-present", sample: sample(1000) },
      after: { tzAbsent: true, reason: null, sample: sample(1010) } } }), 1],
  ];
  for (const [alter, retained] of alterations) {
    const f = fixture(); f.state.respond = (request): Promise<unknown> => Promise.resolve(alter(request));
    await assert.rejects(f.issuer.observe("before")); assert.equal(f.state.records.length, 1);
    assert.equal(f.issuer.evidence().failed, true); assert.equal(f.issuer.evidence().rawReplies.length, retained);
    assert.deepEqual(f.issuer.evidence().phasesObserved, []);
  }
});
