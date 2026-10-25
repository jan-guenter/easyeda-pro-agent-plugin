import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentPcb209RatlineBudget, assertOriginalCurrentPcb209RatlineBudget,
  currentPcb209RatlineSourceBudget, isCurrentPcb209RatlineNormalResourceRefusal, CURRENT_PCB_209_RATLINE_NATIVE_PROFILE as profile } from "../src/current-pcb-209-ratline-budget.ts";
import type { CurrentPcb209RatlineReplyKind } from "../src/current-pcb-209-ratline-budget.ts";

function refusal(work: () => void): unknown { try { work(); } catch (error) { return error; } return assert.fail("Expected a resource refusal"); }
function prefix(): CurrentPcb209RatlineBudget {
  const budget = new CurrentPcb209RatlineBudget(); budget.consumeDiscoveryRequest(1); budget.closeDiscovery(2); return budget;
}
function continuation(): CurrentPcb209RatlineBudget { const budget = prefix(); budget.beginContinuation(); return budget; }
function consume(budget: CurrentPcb209RatlineBudget, kind: CurrentPcb209RatlineReplyKind): void {
  const id = budget.snapshot().requests + 1; budget.consumeRequest(id, kind); budget.consumeReply(id, 1);
}
void test("ratline profile derives exact fixed slots, JSON expansion and bounded staged availability", () => {
  assert.equal(profile.normalRequestLimit, 320); assert.equal(profile.cleanupRequests, 43); assert.equal(profile.requestLimit, 363);
  assert.equal(profile.sources.pcb.length, 29); assert.equal(profile.sources.child.length, 7);
  assert.equal(profile.bytes.sources, 132_203_004); assert.equal(profile.frames.source, 65_949_670);
  assert.ok(profile.frames.source > 32 * 1024 * 1024);
  for (const role of ["pcb", "child"] as const) {
    for (const [ordinal, slot] of profile.sources[role].entries()) {
      assert.equal(currentPcb209RatlineSourceBudget(role, ordinal), slot);
      assert.equal(slot.frameBytes, 6 * slot.sourceBytes + profile.frames.envelope);
      assert.equal(slot.deadlineMilliseconds, profile.elapsed.ordinaryRequestMilliseconds +
        (Math.ceil(slot.frameBytes / profile.frames.chunk) + 2) * profile.polling.intervalMilliseconds);
      assert.ok(Object.isFrozen(slot));
    }
  }
  assert.equal(profile.elapsed.ancestryProofMilliseconds, 30_000);
  assert.equal(profile.elapsed.pcbBootstrapSendMilliseconds, 7500);
  assert.equal(profile.elapsed.pcbBootstrapResumeMilliseconds, 10_000);
  assert.equal(profile.elapsed.sourceReleaseMilliseconds, 52_500);
  assert.equal(profile.elapsed.childArmMilliseconds, 97_500);
  assert.equal(profile.elapsed.childOwnerMilliseconds, 7500);
  assert.equal(profile.elapsed.childBootstrapSendMilliseconds, 17_500);
  assert.equal(profile.elapsed.childBootstrapAllocationMilliseconds, 10_000);
  assert.equal(profile.elapsed.childBootstrapResumeMilliseconds, 20_000);
  assert.equal(profile.elapsed.pcbRealmAllocationMilliseconds, 5000);
  assert.equal(profile.elapsed.pcbChildStartMilliseconds, 10_000);
  assert.equal(profile.elapsed.creationContinuationMilliseconds, 27_500);
  assert.equal(profile.elapsed.capturePauseMilliseconds, 32_500);
  assert.equal(profile.elapsed.captureWaitMilliseconds, 91_940);
  assert.ok(profile.elapsed.captureWaitMilliseconds < profile.elapsed.normalMilliseconds);
  assert.equal(profile.bytes.total, profile.bytes.normal + profile.bytes.cleanup);
  assert.equal(profile.bytes.cleanup, profile.cleanupRequests * profile.frames.envelope);
  assert.ok(Object.isFrozen(profile.requestClasses)); assert.ok(Object.isFrozen(profile.sources));
});
void test("discovery and post-discovery prefix share original IDs and raw byte accounting", () => {
  const budget = new CurrentPcb209RatlineBudget();
  for (let id = 1; id <= 19; id += 1) { budget.consumeDiscoveryRequest(id); }
  budget.consumePipeBytes(100); budget.consumeHelperStdout(200); budget.consumePoll(); budget.consumeHelperControl();
  budget.closeDiscovery(20); budget.consumeRequest(20, "prefix"); budget.consumeEvent(30); budget.consumeReply(20, 40);
  budget.consumePipeBytes(70); budget.beginContinuation(); budget.consumeEvent(50); budget.consumeRequest(21, "preparation");
  budget.consumeReply(21, 60); budget.consumePipeBytes(110);
  const snapshot = budget.snapshot();
  assert.equal(snapshot.requests, 21); assert.equal(snapshot.prefixRequests, 20); assert.equal(snapshot.pendingReplies, 0);
  assert.equal(snapshot.receivedBytes, 280); assert.equal(snapshot.prefixBytes, 170);
  assert.equal(snapshot.reservedDiscoveryEvents, 4096); assert.equal(snapshot.observedStartupEvents, 1);
  assert.equal(snapshot.observedStartupEventBytes, 30); assert.equal(snapshot.continuationEvents, 1);
  assert.equal(snapshot.continuationEventBytes, 50); assert.equal(snapshot.polls, 1); assert.equal(snapshot.helperControls, 1);
  assert.equal(snapshot.helperStdoutBytes, 200); assert.ok(snapshot.elapsedMilliseconds >= 0); assert.ok(Object.isFrozen(snapshot));
  assertOriginalCurrentPcb209RatlineBudget(budget);
});
void test("a handoff cannot copy counters, skip IDs, retain pending replies or reopen discovery", () => {
  const attempts = [
    (): void => { const budget = new CurrentPcb209RatlineBudget(); budget.closeDiscovery(20); },
    (): void => { const budget = new CurrentPcb209RatlineBudget(); budget.consumeDiscoveryRequest(2); },
    (): void => { const budget = prefix(); budget.closeDiscovery(2); },
    (): void => { const budget = prefix(); budget.consumeDiscoveryRequest(2); },
    (): void => { const budget = prefix(); budget.consumeRequest(3, "prefix"); },
    (): void => { const budget = prefix(); budget.consumeRequest(2, "prefix"); budget.beginContinuation(); },
    (): void => { const budget = continuation(); budget.beginContinuation(); },
    (): void => { const budget = continuation(); budget.consumeRequest(2, "prefix"); },
  ];
  for (const attempt of attempts) { assert.throws(attempt, /PCB209_RATLINE_BUDGET_/u); }
  const budget = new CurrentPcb209RatlineBudget();
  for (let id = 1; id <= 19; id += 1) { budget.consumeDiscoveryRequest(id); }
  assert.throws(() => { budget.consumeDiscoveryRequest(20); }, /DISCOVERY_REQUEST/u);
  assert.throws(() => { budget.assertNormal(); }, /NORMAL_CLOSED/u);
});
void test("all source reservations bind one exact ordinal and a refused reply cannot be retried", () => {
  const budget = continuation();
  for (const [kind, role] of [["pcb-source", "pcb"], ["child-source", "child"]] as const) {
    for (const [ordinal, slot] of profile.sources[role].entries()) {
      const id = budget.snapshot().requests + 1, reservation = budget.consumeRequest(id, kind);
      assert.equal(reservation.sourceOrdinal, ordinal); assert.equal(reservation.frameBytes, slot.frameBytes);
      assert.equal(budget.pendingReplyFrameBytes(id), slot.frameBytes); assert.ok(Object.isFrozen(reservation));
      budget.consumeReply(id, slot.frameBytes);
    }
    assert.equal(budget.remainingRequests(kind), 0);
  }
  assert.throws(() => { budget.consumeRequest(budget.snapshot().requests + 1, "child-source"); }, /REQUEST_LIMIT/u);
  const refused = continuation(), reservation = refused.consumeRequest(2, "pcb-source");
  assert.throws(() => { refused.consumeReply(2, reservation.frameBytes + 1); }, /REPLY_BOUND/u);
  assert.equal(refused.snapshot().pendingReplies, 0);
  assert.throws(() => { refused.consumeReply(2, reservation.frameBytes); }, /REPLY_BOUND/u);
  assert.throws(() => { refused.consumeRequest(3, "pcb-source"); }, /NORMAL_CLOSED/u);
});
void test("all fixed normal classes leave their separate cleanup request reservation", () => {
  const budget = prefix();
  for (let count = 1; count < profile.requestClasses.prefix.count; count += 1) { consume(budget, "prefix"); }
  budget.beginContinuation();
  for (const kind of ["preparation", "navigation", "ancestry", "pcb-source", "child-source", "pcb-bootstrap", "child-bootstrap", "pcb-construction", "pcb-capture", "origin-stack"] as const) {
    for (let count = 0; count < profile.requestClasses[kind].count; count += 1) { consume(budget, kind); }
  }
  assert.equal(budget.snapshot().requests, profile.normalRequestLimit);
  budget.beginCleanup();
  for (let count = 0; count < profile.cleanupRequests; count += 1) { consume(budget, "cleanup"); }
  assert.equal(budget.snapshot().requests, profile.requestLimit);
  assert.throws(() => { consume(budget, "cleanup"); }, /REQUEST_ID_OR_PHASE/u);
});
void test("one pending cleanup slot survives normal pending exhaustion and accepts late replies", () => {
  const budget = prefix();
  for (let count = 0; count < profile.normalPendingRequests; count += 1) { budget.consumeRequest(count + 2, "prefix"); }
  assert.throws(() => { budget.consumeRequest(33, "prefix"); }, /REQUEST_LIMIT/u);
  budget.beginCleanup(); budget.consumeRequest(33, "cleanup"); budget.consumeReply(33, 1);
  assert.equal(budget.snapshot().failed, true); assert.equal(budget.snapshot().pendingReplies, 31);
  budget.consumeReply(2, 1); consume(budget, "cleanup"); budget.assertCleanup();
  assert.throws(() => { budget.beginContinuation(); }, /NORMAL_CLOSED/u);
});
void test("raw prefix and total ceilings remain cumulative across phases", () => {
  const budget = prefix(); budget.consumePipeBytes(profile.bytes.prefix); budget.beginContinuation();
  budget.consumePipeBytes(profile.bytes.normal - profile.bytes.prefix);
  assert.throws(() => { budget.consumePipeBytes(1); }, /PIPE_BYTES/u); budget.beginCleanup();
  budget.consumePipeBytes(profile.bytes.cleanup - 1);
  assert.throws(() => { budget.consumePipeBytes(1); }, /PIPE_BYTES/u);
  const prefixOverflow = prefix(); prefixOverflow.consumePipeBytes(profile.bytes.prefix);
  assert.throws(() => { prefixOverflow.consumePipeBytes(1); }, /PIPE_BYTES/u);
  assert.equal(prefixOverflow.snapshot().receivedBytes, profile.bytes.prefix + 1);
});
void test("discovery event reservation is never passed off as observed startup events", () => {
  const discovery = new CurrentPcb209RatlineBudget();
  assert.equal(discovery.snapshot().observedStartupEvents, 0);
  assert.throws(() => { discovery.consumeEvent(1); }, /DISCOVERY_PARSER_OWNS_EVENTS/u);
  const startup = prefix();
  for (let count = 0; count < profile.events.startupCount; count += 1) { startup.consumeEvent(1); }
  assert.throws(() => { startup.consumeEvent(1); }, /STARTUP_EVENT_BOUND/u);
  const continued = continuation();
  for (let count = 0; count < profile.events.continuationCount; count += 1) { continued.consumeEvent(1); }
  assert.throws(() => { continued.consumeEvent(1); }, /EVENT_BOUND/u);
  const oversized = continuation(); assert.throws(() => { oversized.consumeEvent(profile.frames.ordinary + 1); }, /EVENT_BOUND/u);
});
void test("polls, controls and helper stdout have one finite original ledger", () => {
  const budget = prefix();
  for (let count = 0; count < profile.polling.normalLimit; count += 1) { budget.consumePoll(); }
  assert.throws(() => { budget.consumePoll(); }, /POLL_BOUND/u);
  budget.beginCleanup();
  for (let count = 1; count < profile.polling.cleanupReserve; count += 1) { budget.consumePoll(); }
  assert.throws(() => { budget.consumePoll(); }, /POLL_BOUND/u);
  for (let count = 0; count < profile.helperNormalControlMessages; count += 1) { budget.consumeHelperControl(); }
  assert.throws(() => { budget.consumeHelperControl(); }, /HELPER_CONTROL_BOUND/u);
  for (let count = 0; count < profile.helperCleanupControlReserve; count += 1) { budget.consumeHelperControl(true); }
  assert.throws(() => { budget.consumeHelperControl(true); }, /HELPER_CONTROL_BOUND/u);
  budget.consumeHelperStdout(profile.bytes.helperStdout);
  assert.throws(() => { budget.consumeHelperStdout(1); }, /HELPER_STDOUT_BOUND/u);
});
void test("malformed inputs and forged ledgers never supply accounting authority", () => {
  let hooks = 0;
  const hostile = { valueOf: (): number => { hooks += 1; return 1; }, toString: (): string => { hooks += 1; return "prefix"; } };
  // Deliberately malformed runtime inputs exercise the boundary without coercion.
  /* oxlint-disable typescript/no-unsafe-type-assertion */
  assert.throws(() => { prefix().consumePipeBytes(hostile as unknown as number); }, /NUMBER/u);
  assert.throws(() => { prefix().consumeRequest(2, hostile as unknown as CurrentPcb209RatlineReplyKind); }, /REPLY_KIND/u);
  assert.throws(() => { currentPcb209RatlineSourceBudget("pcb", hostile as unknown as number); }, /SOURCE_SLOT/u);
  assert.equal(hooks, 0);
  for (const ordinal of [-1, Number.NaN, Infinity, 29, 0.5]) { assert.throws(() => currentPcb209RatlineSourceBudget("pcb", ordinal), /SOURCE_SLOT/u); }
  const fake = Object.create(CurrentPcb209RatlineBudget.prototype) as CurrentPcb209RatlineBudget, original = prefix();
  /* oxlint-enable typescript/no-unsafe-type-assertion */
  assert.throws(() => { assertOriginalCurrentPcb209RatlineBudget(fake); }, /ORIGINAL/u);
  assert.throws(() => { assertOriginalCurrentPcb209RatlineBudget(new Proxy(original, {})); }, /ORIGINAL/u);
  Object.defineProperty(original, "snapshot", { value: (): object => ({}) });
  assert.throws(() => { assertOriginalCurrentPcb209RatlineBudget(original); }, /ORIGINAL/u);
});

void test("terminal accounting closure clears only pending work and cannot renew dispatch", () => {
  const budget = continuation(); budget.consumeRequest(2, "pcb-source"); budget.consumePipeBytes(100);
  budget.consumeHelperStdout(200); budget.consumeHelperControl(); budget.consumePoll();
  const before = budget.snapshot(); budget.endAfterOriginalTermination(); budget.beginCleanup();
  const after = budget.snapshot();
  assert.equal(after.closed, true); assert.equal(after.pendingReplies, 0);
  assert.equal(after.requests, before.requests); assert.equal(after.receivedBytes, before.receivedBytes);
  assert.equal(after.helperStdoutBytes, before.helperStdoutBytes); assert.equal(after.polls, before.polls);
  assert.ok(after.elapsedMilliseconds >= before.elapsedMilliseconds);
  assert.throws(() => { budget.consumeRequest(3, "cleanup"); }, /CLEANUP_CLOSED/u);
  assert.throws(() => { budget.consumePoll(); }, /CLEANUP_CLOSED/u);
  assert.throws(() => { budget.beginContinuation(); }, /NORMAL_CLOSED/u);
  budget.consumeHelperControl(true); budget.consumeHelperStdout(30);
  assert.equal(budget.snapshot().helperControls, 2); assert.equal(budget.snapshot().helperStdoutBytes, 230);
  assertOriginalCurrentPcb209RatlineBudget(budget);
});

void test("failed discovery retains cleanup controls before any channel cleanup transition", () => {
  const budget = new CurrentPcb209RatlineBudget();
  for (let count = 0; count < profile.helperNormalControlMessages; count += 1) { budget.consumeHelperControl(); }
  assert.throws(() => { budget.consumeHelperControl(); }, /HELPER_CONTROL_BOUND/u);
  assert.equal(budget.snapshot().phase, "prefix");
  for (let count = 0; count < profile.helperCleanupControlReserve; count += 1) { budget.consumeHelperControl(true); }
  assert.equal(budget.snapshot().helperControls, profile.helperControlMessages);
  assert.throws(() => { budget.consumeHelperControl(true); }, /HELPER_CONTROL_BOUND/u);
});

void test("normal resource refusal provenance cannot disguise semantic or foreign failures", () => {
  const budget = prefix();
  for (let count = 0; count < profile.helperNormalControlMessages; count += 1) { budget.consumeHelperControl(); }
  const error = refusal(() => { budget.consumeHelperControl(); });
  assert.equal(isCurrentPcb209RatlineNormalResourceRefusal(error, budget), true);
  assert.equal(isCurrentPcb209RatlineNormalResourceRefusal(error, prefix()), false);
  assert.equal(isCurrentPcb209RatlineNormalResourceRefusal(new Error("PCB209_RATLINE_BUDGET_HELPER_CONTROL_BOUND"), budget), false);
  assert.equal(isCurrentPcb209RatlineNormalResourceRefusal(refusal(() => { budget.assertNormal(); }), budget), true);
  const semantic = refusal(() => { budget.consumeEvent(0); });
  assert.equal(isCurrentPcb209RatlineNormalResourceRefusal(semantic, budget), false);
  assert.equal(isCurrentPcb209RatlineNormalResourceRefusal(error, budget), false);
  assert.equal(isCurrentPcb209RatlineNormalResourceRefusal(refusal(() => { budget.assertNormal(); }), budget), false);
  budget.beginCleanup(); budget.consumeHelperControl(true);
  const pending = prefix();
  for (let index = 0; index < profile.normalPendingRequests; index += 1) { pending.consumeRequest(index + 2, "prefix"); }
  const exhausted = refusal(() => { pending.consumeRequest(33, "prefix"); });
  assert.equal(isCurrentPcb209RatlineNormalResourceRefusal(exhausted, pending), true);
  pending.endAfterOriginalTermination(); assert.equal(isCurrentPcb209RatlineNormalResourceRefusal(exhausted, pending), false);
});
