/* oxlint-disable eslint/max-classes-per-file -- Two explicitly synthetic owner classes isolate the real handoff's acknowledgment state machine; the separate first test uses the real bootstrap owner. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentPcb209RatlineBootstrapOwner } from "../src/current-pcb-209-ratline-bootstrap-owner.ts";
import type { CurrentPcb209RatlineBootstrapPacket } from "../src/current-pcb-209-ratline-bootstrap-owner.ts";
import { CurrentPcb209RatlineContinuationHandoff, isCurrentPcb209ContinuedSourceSeal,
  issueCurrentPcb209CompletedCaptureSeal, issueCurrentPcb209ContinuedSourceSeal } from "../src/current-pcb-209-ratline-continuation-handoff.ts";
import type { CurrentPcb209CompletedCaptureSeal, CurrentPcb209ContinuedSourceSeal } from "../src/current-pcb-209-ratline-continuation-handoff.ts";
import type { CurrentPcb209RatlineStartupPacket, CurrentPcb209RatlineWorkerStartup } from "../src/current-pcb-209-ratline-startup-session.ts";

function source(role: "worker" | "subordinate"): CurrentPcb209RatlineBootstrapPacket {
  return Object.freeze({ profile: "private.pcb209-ratline-bootstrap.v1", childTargetId: `${role}-target`, childSessionId: `${role}-session`,
    scriptId: `${role}-script`, uniqueContextId: `${role}-context`, completeImportedSourceQualified: true,
    importedSourceHeldBeforeExecution: true, nativeWorkerTargetIdentityVerified: false, continuousInstallationLeaseVerified: false,
    executionAuthorized: false });
}

void test("real bootstrap owner rejects manufactured and copied source seals without acquiring or dispatching anything", () => {
  let nativeCalls = 0;
  const unused = (): never => { nativeCalls += 1; throw new Error("Unqualified owner cannot dispatch"); };
  const owner = new CurrentPcb209RatlineBootstrapOwner(Object.freeze({ assertOriginalChild: unused, assertOriginalTermination: unused,
    observeOriginalFirstScript: unused, request: unused, subscribe: unused }));
  const packet = source("worker"); const manufactured = issueCurrentPcb209ContinuedSourceSeal(owner, packet, 1);
  assert.equal(isCurrentPcb209ContinuedSourceSeal(manufactured, owner, packet), true);
  // Even the internal issuer cannot populate the owner's private original seal.
  for (const candidate of [manufactured, Object.freeze({ ...manufactured }),
    issueCurrentPcb209ContinuedSourceSeal({}, packet, 1), Object.freeze({ source: packet, contextId: 1 })]) {
    assert.throws(() => { owner.requireOriginalSealedSource(candidate); }, /PCB209_RATLINE_BOOTSTRAP_ORIGINAL_SOURCE_SEAL/u);
    assert.throws(() => { owner.retireOriginalSealedSource(candidate); }, /PCB209_RATLINE_BOOTSTRAP_ORIGINAL_SOURCE_SEAL/u);
  }
  assert.equal(owner.status()["retired"], false); assert.equal(owner.status()["consumed"], false); assert.equal(nativeCalls, 0);
});

/** This fixture models sealed observations only; it has no native dependencies,
 * source qualification or execution authority. Actual owner composition is
 * covered separately by the terminating-child V8 fixture. */
class SyntheticSourceOwner {
  readonly #packet: CurrentPcb209RatlineBootstrapPacket;
  readonly #seal: CurrentPcb209ContinuedSourceSeal;
  public retired = false;
  public constructor(packet: CurrentPcb209RatlineBootstrapPacket, contextId: number) {
    this.#packet = packet; this.#seal = issueCurrentPcb209ContinuedSourceSeal(this, packet, contextId);
  }
  public requireOriginal(packet: CurrentPcb209RatlineBootstrapPacket): Promise<void> { assert.equal(packet, this.#packet); return Promise.resolve(); }
  public sealOriginalContinuedSource(packet: CurrentPcb209RatlineBootstrapPacket): Promise<CurrentPcb209ContinuedSourceSeal> {
    assert.equal(packet, this.#packet); return Promise.resolve(this.#seal);
  }
  public requireOriginalSealedSource(seal: CurrentPcb209ContinuedSourceSeal): void { assert.equal(seal, this.#seal); }
  public retireOriginalSealedSource(seal: CurrentPcb209ContinuedSourceSeal): void {
    this.requireOriginalSealedSource(seal); assert.equal(this.retired, false); this.retired = true;
  }
}
class SyntheticCaptureOwner {
  readonly #seal: CurrentPcb209CompletedCaptureSeal;
  public constructor(packet: CurrentPcb209RatlineStartupPacket) { this.#seal = issueCurrentPcb209CompletedCaptureSeal(this, packet); }
  public requireOriginal(packet: CurrentPcb209RatlineStartupPacket): Promise<void> { assert.equal(packet, this.#seal.packet); return Promise.resolve(); }
  public sealOriginalCompletedCapture(packet: CurrentPcb209RatlineStartupPacket): Promise<CurrentPcb209CompletedCaptureSeal> {
    assert.equal(packet, this.#seal.packet); return Promise.resolve(this.#seal);
  }
  public requireOriginalSealedCapture(seal: CurrentPcb209CompletedCaptureSeal): void { assert.equal(seal, this.#seal); }
}

void test("synthetic sealed handoff cannot publish complete retirement after detach and resume without the original acknowledgment", async () => {
  const revoked: string[] = []; const flow = new CurrentPcb209RatlineContinuationHandoff(() => Promise.resolve(), (role, session): void => { revoked.push(`${role}:${session}`); });
  const subordinate = source("subordinate"), worker = source("worker");
  const subordinateOwner = new SyntheticSourceOwner(subordinate, 2), workerOwner = new SyntheticSourceOwner(worker, 1);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Explicit synthetic state-machine fixture; production owner identity is tested above and in the separate actual V8 composition.
  flow.register("worker", workerOwner as unknown as CurrentPcb209RatlineBootstrapOwner, worker, "pcb-session", "a".repeat(64));
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The fixture deliberately supplies only the four handoff source-owner methods and cannot dispatch native commands.
  flow.register("subordinate", subordinateOwner as unknown as CurrentPcb209RatlineBootstrapOwner, subordinate, "worker-session", "a".repeat(64));
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Opaque identity-only sentinel, never passed to a production packet decoder, capture owner or native command.
  const packet = Object.freeze({ syntheticCaptureIdentityOnly: true }) as unknown as CurrentPcb209RatlineStartupPacket;
  const capture = new SyntheticCaptureOwner(packet), pcbPause = Object.freeze({}), workerPause = Object.freeze({});
  try {
    await flow.sealSubordinate();
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Explicit three-method synthetic capture seal; this test isolates acknowledgment gating, not capture qualification.
    await flow.sealWorker(capture as unknown as CurrentPcb209RatlineWorkerStartup, packet);
    await flow.beforeResume("worker", "initialized", workerPause, { site: "synthetic-worker-initialized" });
    await flow.beforeResume("pcb", "received", pcbPause, { site: "synthetic-pcb-received" });
    flow.requestResume("worker", workerPause); flow.requestResume("pcb", pcbPause);
    for (const [parentSessionId, child] of [["worker-session", subordinate], ["pcb-session", worker]] as const) {
      assert.equal(flow.consumeRetirementEvent({ method: "Target.detachedFromTarget", sessionId: parentSessionId,
        params: { sessionId: child.childSessionId, targetId: child.childTargetId } }), true);
    }
    flow.observeResume("worker", workerPause); flow.observeResume("pcb", pcbPause); flow.acknowledgeResume("pcb", pcbPause);
    assert.deepEqual(revoked, ["subordinate:subordinate-session", "worker:worker-session"]);
    assert.equal(subordinateOwner.retired, true); assert.equal(workerOwner.retired, true);
    assert.throws(() => { flow.requestResume("worker", workerPause); }, /PCB209_RATLINE_HANDOFF_RESUME_STATE/u);
    await assert.rejects(flow.requireOriginalHistory(), /PCB209_RATLINE_HANDOFF_INCOMPLETE/u);
    assert.throws(() => flow.evidence(), /PCB209_RATLINE_HANDOFF_INCOMPLETE/u);
    // The same original late acknowledgment is the sole missing condition.
    flow.acknowledgeResume("worker", workerPause); await flow.requireOriginalHistory();
    assert.equal(flow.evidence().subordinate.executionAuthorized, false);
    assert.throws(() => { flow.acknowledgeResume("worker", workerPause); }, /PCB209_RATLINE_HANDOFF_RESUME_ACKNOWLEDGMENT/u);
  } finally { flow.abort(); }
});
