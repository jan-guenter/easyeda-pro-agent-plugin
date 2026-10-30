/** Synthetic retained-owner transport. These tests establish issuer ordering
 * and refusal; they do not establish Windows or backend-clock provenance. */
import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";
import { combinedReadyFactoryFixture } from "./helpers/current-footprint-combined-ready-fixture.ts";
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

void test("four original phases derive one closed numerical window without a live request or call-provenance claim", async () => {
  const f = fixture();
  assert.throws(() => f.issuer.closedWindow(), /complete original closed/u);
  await f.issuer.observe("before"); await f.issuer.observe("armed"); await f.issuer.observe("post");
  assert.throws(() => f.issuer.closedWindow(), /complete original closed/u);
  f.state.live = false; f.state.empty = true; await f.issuer.observe("termination");
  const window = f.issuer.closedWindow();
  const epoch = 1_791_892_800_000;
  assert.equal(window.backendClockMinMs, epoch + 1000); assert.equal(window.backendClockMaxMs, epoch + 4011);
  assert.equal(window.documentNativeDateMinMs, epoch + 2000); assert.equal(window.documentNativeDateMaxMs, epoch + 3011);
  assert.equal(window.backendLocalOffsetMinutes, 120); assert.equal(window.zoneRulesSha256, "c".repeat(64));
  assert.equal(window.originalFourPhasesJoined, true); assert.equal(window.nativeDateCallProvenanceVerified, false);
  assert.equal(window.continuousClockStabilityProved, false); assert.equal(window.documentClockProvenanceVerified, false);
  assert.equal(window.executionAuthorized, false); assert.equal(f.issuer.closedWindow(), window);
  assert.equal(f.issuer.requireClosedWindow(window), window); assert.equal(f.state.records.length, 4);
  assert.throws(() => f.issuer.requireClosedWindow({ ...window }), /original closed/u);
  const foreign = fixture(); assert.throws(() => foreign.issuer.requireClosedWindow(window), /original closed/u);
  const bounded = f.issuer.boundDocumentValues(window, [[epoch + 2100, 100], [epoch + 2111, -900]]);
  assert.deepEqual(bounded.documentNativeDateValues, [epoch + 2000, epoch + 3011]);
  assert.equal(bounded.documentClockMinMs, epoch + 2100); assert.equal(bounded.documentClockMaxMs, epoch + 2111);
  assert.equal(bounded.suppliedDocumentValuesOnly, true); assert.equal(bounded.documentClockProvenanceVerified, false);
  const equal = f.issuer.boundDocumentValues(window, [[epoch + 2500, 500], [epoch + 2500, -511]]);
  assert.equal(equal.documentClockMinMs, equal.documentClockMaxMs);
  assert.throws(() => f.issuer.boundDocumentValues(window, [[epoch + 1999, 0], [epoch + 2500, 0]]), /outside original interval/u);
  assert.throws(() => f.issuer.boundDocumentValues(window, [[epoch + 3012, 0], [epoch + 2500, 0]]), /outside original interval/u);
  assert.throws(() => f.issuer.boundDocumentValues(window, [[epoch + 2000, 0], [epoch + 62_001, 60_001]]), /exceed one minute/u);
  f.state.owned = false; assert.throws(() => f.issuer.requireClosedWindow(window), /owner lost/u);
});

void test("closed windows refuse missing, failed and overlong generation observations", async () => {
  for (const variant of ["terminal-only", "failed", "utc-span", "qpc-span"] as const) {
    const f = fixture();
    if (variant === "failed") {
      f.state.respond = (): Promise<unknown> => Promise.reject(new Error("lost native clock"));
      await assert.rejects(f.issuer.observe("before"), /lost native clock/u);
      f.state.respond = (request): Promise<unknown> => Promise.resolve(reply(request));
    } else if (variant !== "terminal-only") {
      f.state.respond = (request): Promise<unknown> => {
        let before = sample(request.sequence * 1000);
        let after = sample(request.sequence * 1000 + 10);
        if (request.phase === "termination") {
          if (variant === "utc-span") { before = { ...sample(70_000), qpcBefore: sample(4000)["qpcBefore"], qpcAfter: sample(4000)["qpcAfter"] };
            after = { ...sample(70_010), qpcBefore: sample(4010)["qpcBefore"], qpcAfter: sample(4010)["qpcAfter"] }; }
          else { before = { ...sample(4000), qpcBefore: sample(70_000)["qpcBefore"], qpcAfter: sample(70_000)["qpcAfter"] };
            after = { ...sample(4010), qpcBefore: sample(70_010)["qpcBefore"], qpcAfter: sample(70_010)["qpcAfter"] }; }
        }
        return Promise.resolve(reply(request, before, after));
      };
      await f.issuer.observe("before"); await f.issuer.observe("armed"); await f.issuer.observe("post");
    }
    f.state.live = false; f.state.empty = true; await f.issuer.observe("termination");
    assert.throws(() => f.issuer.closedWindow(), /complete original closed|exceeds one minute/u);
    let expected = 4;
    if (variant === "terminal-only") { expected = 1; }
    else if (variant === "failed") { expected = 2; }
    assert.equal(f.state.records.length, expected);
  }
});

void test("the actual retained-owner forwarders preserve the original issuer and numeric window", async context => {
  // Only private issuer installation/native sampling is synthetic here. The
  // Actual maintained factory, owner, private fields and forwarders are used.
  const factory = await combinedReadyFactoryFixture("ready", "forward");
  const owner = await factory.api.startCurrentFootprintCopyForwardNativeOwner(factory.options);
  context.after(async () => {
    if (!owner.status().helperClosed) { const closed = once(factory.child(), "close"); factory.child().stdin.end(); await closed; }
  });
  assert.throws(() => owner.closedFootprintCopyWindowsClockWindow(), /FOOTPRINT_WINDOWS_CLOCK_ORIGINAL/u);
  const f = fixture(); owner.syntheticClockIssuerForTest(f.issuer);
  await f.issuer.observe("before"); await f.issuer.observe("armed"); await f.issuer.observe("post");
  f.state.live = false; f.state.empty = true; await f.issuer.observe("termination");
  const window = owner.closedFootprintCopyWindowsClockWindow();
  assert.equal(window, f.issuer.closedWindow()); assert.equal(owner.requireClosedFootprintCopyWindowsClockWindow(window), window);
  assert.throws(() => owner.requireClosedFootprintCopyWindowsClockWindow({ ...window }), /original closed/u);
  const middle = window.documentNativeDateMinMs + 1;
  const result = owner.boundFootprintCopyDocumentClockValues(window, [[middle, 0], [middle, 0]]);
  assert.equal(result.documentClockMinMs, middle); assert.equal(result.documentClockProvenanceVerified, false);
  assert.equal(factory.state.writes, 0); assert.equal(f.state.records.length, 4);
  await owner.releaseUnlaunched(); assert.equal(factory.child().exitCode, 0);
});
