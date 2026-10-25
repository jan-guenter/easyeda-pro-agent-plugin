import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentPcb209RatlineContinuationRouter } from "../src/current-pcb-209-ratline-continuation-router.ts";
import type { CurrentPcb209RatlineContinuationListener, CurrentPcb209RatlineContinuationRealm,
  CurrentPcb209RatlineContinuationRoutingDependency } from "../src/current-pcb-209-ratline-continuation-router.ts";
import type { CurrentPcbWorkerStartupEvent } from "../src/current-pcb-worker-startup-contract.ts";

type Stream = Parameters<CurrentPcb209RatlineContinuationRoutingDependency["subscribe"]>[0];
function attached(parent: string, sessionId: string, targetId: string): CurrentPcbWorkerStartupEvent {
  return { method: "Target.attachedToTarget", sessionId: parent, params: { sessionId, waitingForDebugger: true,
    targetInfo: { targetId, type: "worker", attached: true, title: "pcb-ratline-worker", url: "https://client/editor?entry=pcb-ratline-worker.js" } } };
}
function event(sessionId: string): CurrentPcbWorkerStartupEvent { return { method: "Debugger.scriptParsed", sessionId, params: { scriptId: "observed-only" } }; }
function fixture(): Readonly<{
  router: CurrentPcb209RatlineContinuationRouter; observed: string[]; listener: CurrentPcb209RatlineContinuationListener;
  emit: (input: CurrentPcbWorkerStartupEvent) => void; state: { terminated: boolean; unsubscribed: number; proofs: number; lost: number; replaceOwner: boolean };
}> {
  const parent = Object.freeze({ targetId: "pcb-target", sessionId: "pcb-session", nextRequestId: 19 });
  const observed: string[] = []; const state = { terminated: false, unsubscribed: 0, proofs: 0, lost: 0, replaceOwner: false };
  let stream: Stream | null = null;
  const router = new CurrentPcb209RatlineContinuationRouter({
    requireOriginalParent: (): Promise<typeof parent> => { state.proofs += 1; return Promise.resolve(state.replaceOwner ? Object.freeze({ ...parent }) : parent); },
    assertOriginalTermination: (): Promise<void> => { assert.equal(state.terminated, true); return Promise.resolve(); },
    subscribe: (listener): (() => void) => { assert.equal(stream, null); stream = listener; return (): void => { state.unsubscribed += 1; stream = null; }; },
  });
  const listener: CurrentPcb209RatlineContinuationListener = {
    event: (input, realm): void => { observed.push(`${realm.role}:${input.method}`); }, lost: (): void => { state.lost += 1; },
  };
  return { router, observed, listener, emit: input => stream?.event(input), state };
}
async function close(f: ReturnType<typeof fixture>): Promise<void> { f.state.terminated = true; await f.router.releaseAfterTermination(); }
void test("original continuation stream routes three finite realms without dispatch or source/Worker identity claims", async () => {
  const f = fixture(), pcb = await f.router.start(f.listener);
  assert.throws(() => f.router.claimOriginalChild(pcb, f.listener), /ORIGINAL_ATTACHMENT/u);
  f.emit(attached("pcb-session", "worker-session", "worker-target")); const worker = f.router.claimOriginalChild(pcb, f.listener);
  f.emit(attached("worker-session", "subordinate-session", "subordinate-target")); const subordinate = f.router.claimOriginalChild(worker, f.listener);
  for (const realm of [pcb, worker, subordinate]) { await f.router.requireOriginal(realm); f.emit(event(realm.sessionId)); }
  assert.deepEqual(f.observed, ["pcb:Target.attachedToTarget", "worker:Target.attachedToTarget", "pcb:Debugger.scriptParsed", "worker:Debugger.scriptParsed", "subordinate:Debugger.scriptParsed"]);
  assert.throws(() => f.router.claimOriginalChild(pcb, f.listener), /LISTENER_CONSUMED/u);
  assert.throws(() => f.router.claimOriginalChild(subordinate, f.listener), /DEPTH/u);
  const state = f.router.status(); assert.equal(state.realms.length, 3); assert.equal(state.firstFailure, null);
  assert.equal(state.sourceQualified, false); assert.equal(state.nativeWorkerTargetIdentityVerified, false); assert.equal(state.executionAuthorized, false);
  await assert.rejects(f.router.requireOriginal({ ...worker }), /ORIGINAL_REALM/u); assert.equal(f.router.status().firstFailure, "OWNER_CHANGED");
  await close(f); assert.equal(f.state.unsubscribed, 1); assert.equal(f.router.status().realms.length, 3);
});
void test("duplicate, reparented, foreign and deeper attachments poison the original routes without adding a fourth realm", async () => {
  for (const invalid of [attached("pcb-session", "other", "other"), attached("worker-session", "pcb-session", "other"),
    attached("worker-session", "other", "pcb-target"), attached("foreign-session", "other", "other"), attached("subordinate-session", "fourth", "fourth")]) {
    const f = fixture(), pcb = await f.router.start(f.listener);
    f.emit(attached("pcb-session", "worker-session", "worker-target")); const worker = f.router.claimOriginalChild(pcb, f.listener);
    f.emit(attached("worker-session", "subordinate-session", "subordinate-target")); f.router.claimOriginalChild(worker, f.listener);
    const delivered = f.observed.length; f.emit(invalid); assert.equal(f.router.status().firstFailure, "EVENT_OR_CALLBACK");
    assert.equal(f.router.status().realms.length, 3); assert.equal(f.observed.length, delivered); assert.equal(f.state.lost, 3);
    f.emit(event("pcb-session")); assert.equal(f.observed.length, delivered); assert.equal(f.state.lost, 3); await close(f);
  }
});
void test("an identical replacement parent cannot adopt the original handles and failed termination retains their subscription", async () => {
  const f = fixture(), pcb = await f.router.start(f.listener); f.state.replaceOwner = true;
  await assert.rejects(f.router.requireOriginal(pcb), /ORIGINAL_PARENT/u);
  await assert.rejects(f.router.releaseAfterTermination()); assert.equal(f.state.unsubscribed, 0); assert.equal(f.router.status().released, false);
  assert.equal(f.router.status().firstFailure, "OWNER_CHANGED"); f.router.abort(); assert.equal(f.router.status().firstFailure, "OWNER_CHANGED");
  await close(f); assert.equal(f.state.unsubscribed, 1); await assert.rejects(f.router.start(f.listener), /START_CONSUMED/u);
});
void test("the PCB listener is installed before a synchronous original attachment and can claim its waiting child", async () => {
  const parent = Object.freeze({ targetId: "pcb-target", sessionId: "pcb-session", nextRequestId: 19 });
  let claimed: CurrentPcb209RatlineContinuationRealm | null = null;
  const listener: CurrentPcb209RatlineContinuationListener = { event: (): void => { assert.fail("Unexpected child event"); }, lost: (): void => { assert.fail("Unexpected stream loss"); } };
  const router = new CurrentPcb209RatlineContinuationRouter({ requireOriginalParent: (): Promise<typeof parent> => Promise.resolve(parent),
    assertOriginalTermination: (): Promise<void> => Promise.resolve(), subscribe: (stream): (() => void) => {
      stream.event(attached("pcb-session", "worker-session", "worker-target")); return (): void => {
        // This synthetic stream has no native resource; termination is tested separately.
      };
    } });
  await router.start({ event: (_input, realm): void => { claimed = router.claimOriginalChild(realm, listener); }, lost: (): void => { assert.fail("Unexpected stream loss"); } });
  assert.ok(claimed !== null); await router.requireOriginal(claimed); await router.releaseAfterTermination();
});
void test("hostile events and mutated listeners neither execute hooks nor replace first failure", async () => {
  let hooks = 0; const hook = (): never => { hooks += 1; throw new Error("Unexpected hook"); };
  const f = fixture(); await f.router.start(f.listener);
  const hostile = event("pcb-session"); Object.defineProperty(hostile, "params", { get: hook, enumerable: true });
  f.emit(hostile); assert.equal(f.router.status().firstFailure, "EVENT_OR_CALLBACK"); assert.equal(hooks, 0); await close(f);
  const changed = fixture(); await changed.router.start(changed.listener); Object.defineProperty(changed.listener, "event", { value: hook });
  changed.emit(event("pcb-session")); assert.equal(changed.router.status().firstFailure, "EVENT_OR_CALLBACK"); assert.equal(hooks, 0); await close(changed);
});
void test("termination during original-parent acquisition cannot create a late subscription", async () => {
  const parent = Promise.withResolvers<Readonly<{ targetId: string; sessionId: string; nextRequestId: number }>>();
  let subscriptions = 0;
  const router = new CurrentPcb209RatlineContinuationRouter({ requireOriginalParent: (): typeof parent.promise => parent.promise,
    assertOriginalTermination: (): Promise<void> => Promise.resolve(), subscribe: (): (() => void) => {
      subscriptions += 1; return (): void => { assert.fail("No subscription may exist"); };
    } });
  const started = assert.rejects(router.start({ event: (): void => { assert.fail("No event may arrive"); }, lost: (): void => { assert.fail("No listener may exist"); } }), /START_INTERRUPTED/u);
  await router.releaseAfterTermination(); parent.resolve(Object.freeze({ targetId: "pcb-target", sessionId: "pcb-session", nextRequestId: 19 })); await started;
  assert.equal(subscriptions, 0); assert.equal(router.status().realms.length, 0); assert.equal(router.status().released, true);
});
void test("synchronous loss retains the returned disposer and late callbacks cannot poison confirmed release", async () => {
  for (const synchronousLoss of [false, true]) {
    const parent = Object.freeze({ targetId: "pcb-target", sessionId: "pcb-session", nextRequestId: 19 });
    let disposed = 0, losses = 0;
    const router = new CurrentPcb209RatlineContinuationRouter({ requireOriginalParent: (): Promise<typeof parent> => Promise.resolve(parent),
      assertOriginalTermination: (): Promise<void> => Promise.resolve(), subscribe: (stream): (() => void) => {
        if (synchronousLoss) { stream.lost(); }
        return (): void => { disposed += 1; stream.lost(); stream.event(event("pcb-session")); };
      } });
    const start = router.start({ event: (): void => { assert.fail("Late event must be ignored"); }, lost: (): void => { losses += 1; } });
    await (synchronousLoss ? assert.rejects(start) : start);
    await router.releaseAfterTermination(); assert.equal(disposed, 1); assert.equal(losses, synchronousLoss ? 1 : 0);
    assert.equal(router.status().firstFailure, synchronousLoss ? "STREAM_LOST" : null); assert.equal(router.status().released, true);
    assert.equal(router.status().terminationVerified, true); assert.equal(router.status().unsubscribeConsumed, true);
  }
});
void test("ambiguous subscription and consumed throwing disposer remain explicit cleanup failures without replay", async () => {
  for (const acquisitionThrows of [true, false]) {
    const parent = Object.freeze({ targetId: "pcb-target", sessionId: "pcb-session", nextRequestId: 19 });
    let disposals = 0;
    const router = new CurrentPcb209RatlineContinuationRouter({ requireOriginalParent: (): Promise<typeof parent> => Promise.resolve(parent),
      assertOriginalTermination: (): Promise<void> => Promise.resolve(), subscribe: (): (() => void) => {
        if (acquisitionThrows) { throw new Error("Acquisition may have occurred"); }
        return (): void => { disposals += 1; throw new Error("Disposal outcome unknown"); };
      } });
    const start = router.start({ event: (): void => { assert.fail("No event expected"); }, lost: (): void => {
      // Failure notification is expected; it grants no cleanup retry.
    } });
    await (acquisitionThrows ? assert.rejects(start) : start);
    await assert.rejects(router.releaseAfterTermination()); const state = router.status();
    assert.equal(state.released, false); assert.equal(state.terminationVerified, true);
    assert.equal(state.cleanupFailure, acquisitionThrows ? "SUBSCRIPTION_UNCERTAIN" : "UNSUBSCRIBE_FAILED");
    assert.equal(state.unsubscribeConsumed, !acquisitionThrows); await assert.rejects(router.releaseAfterTermination(), /RELEASE_STATE/u);
    assert.equal(disposals, acquisitionThrows ? 0 : 1);
  }
});
