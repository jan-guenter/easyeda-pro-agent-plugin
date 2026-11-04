/** Actual maintained stages with fixed synthetic I/O. No native execution. */
/* oxlint-disable import/max-dependencies -- Join the original completed coordinator and terminal issuer with the real release path in this provenance regression. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { handlerFixture, originalClaim } from "./closed-symbol-disposable-entry-fixture.ts";
import { ClosedSymbolDisposableEntry } from "../../src/closed-symbol-disposable-entry.ts";
import type { FinalEvidenceRecord } from "../../src/closed-symbol-coordinator.ts";
import { assertOriginalClosedSymbolCompletion } from "../../src/closed-symbol-terminal.ts";
import { ClosedSymbolCoordinator, originalClosedSymbolFullEvidenceKind } from "../../src/closed-symbol-coordinator.ts";
import { OPERATION_SCHEMA, buildPlanHash, isRecord, newOperationId, sha256Json } from "../../src/core.ts";
import { createOperation, operationPath } from "../../src/artifacts.ts";
import { readFile } from "node:fs/promises";
import { retireSyntheticJournal } from "./synthetic-journal-retirement.ts";
import { closedSymbolEntryFailureDiagnostic } from "../../src/closed-symbol-failure-diagnostic.ts";

/** Exercise the actual entry, terminal and runtime owners on fixed synthetic I/O.
 * Require original completion before helper disposal and preserve consumed
 * results and owner identities when later requests are refused.
 */
export function registerSuccess(kind: "locked" | "aged"): void {
  void test(`dormant handler ${kind} selects its terminal from the original full result`, async context => {
    const f = await handlerFixture(context, kind), result = await f.entry.run(f.request);
    assert.equal(result.outcome, "completed", String(f.entry.retained()["failure"])); assert.ok(result.outcome === "completed");
    assert.equal(result.headEligibility, kind === "locked" ? "locked" : "aged-unlocked");
    assert.equal(result.completionProved, true); assert.equal(result.historicalCompletionRecorded, true);
    assert.equal(result.saved, false); assert.equal(result.reopened, false); assert.equal(result.explicitSavePerformed, false); assert.equal(result.targetEditorOpened, false);
    assert.equal(f.launches(), 3); assert.equal(f.state.writes, 1); assert.equal(f.state.opens, 2); assert.equal(f.state.reads, 1);
    assert.equal(f.transport.calls, kind === "locked" ? 0 : 1); assert.deepEqual(f.localReads, ["launcherFingerprint"]);
    const retained = f.entry.retained();
    const plan = retained["plan"];
    assert.ok(isRecord(plan) && isRecord(plan["marker"]));
    assert.equal(new Set(Object.values(plan["marker"])).size, 3);
    for (const nonce of Object.values(plan["marker"])) { assert.equal(typeof nonce, "string"); assert.match(String(nonce), /^[a-f0-9]{64}$/u); }
    const claim = await originalClaim(f.entry);
    assert.equal(claim.closedPlanSha256, sha256Json(plan)); assert.equal(claim.requestSha256, sha256Json(f.request));
    assert.deepEqual(result.claimArtifact, claim.artifact); assert.ok(Buffer.byteLength(JSON.stringify(result)) <= 16_384);
    for (const key of ["fingerprint", "expected", "plan", "request", "raw", "failure", "full", "completion", "coordinator"]) { assert.equal(Object.hasOwn(result, key), false); }
    assert.equal(originalClosedSymbolFullEvidenceKind(retained["full"], f.engine, result.operationId), result.headEligibility);
    assert.equal(f.entry.isRuntimeDisposed(), false);
    let disposed = 0;
    const release = await f.entry.releaseCompletedRuntime(result.operationId, original => {
      assert.equal(original, f.runtime); assert.equal(original.isReleaseAcknowledged(), true); disposed += 1;
    });
    assert.equal(release.family, "symbol-metadata"); assert.equal(f.entry.isRuntimeDisposed(f.runtime), true);
    assert.equal(f.runtime.status().state, "released"); assert.equal(disposed, 1);
    await assert.rejects(f.entry.releaseCompletedRuntime(result.operationId, () => { disposed += 1; }), /completed/u);
    assert.equal(disposed, 1);
    const events = [...f.events];
    const again = await f.entry.run(f.request);
    assert.equal(again.outcome, "stopped"); assert.ok(again.outcome === "stopped"); assert.equal(again.reason, "entry-already-used");
    const other = new ClosedSymbolDisposableEntry(f.engine, f.upstream, f.runtime, f.ui, f.gate);
    const refused = await other.run(f.request); assert.equal(refused.outcome, "stopped");
    assert.deepEqual(f.events, events); assert.equal(f.entry.retained()["full"], retained["full"]); assert.equal(f.entry.retained()["completion"], retained["completion"]);
  });
}

/** A failed completion preflight cannot poison the genuine final owner; a
 * concurrent request cannot create another release owner while checks await. */
export function registerReleasePreflightRetry(): void {
  void test("closed-symbol release permits original retry after preflight refusal and releases its helper once", async context => {
    const f = await handlerFixture(context), result = await f.entry.run(f.request);
    assert.equal(result.outcome, "completed", String(f.entry.retained()["failure"])); assert.ok(result.outcome === "completed");
    const retained = f.entry.retained();
    const coordinator = retained["coordinator"];
    const full = retained["full"];
    const completion = retained["completion"];
    assert.ok(coordinator instanceof ClosedSymbolCoordinator);
    assert.equal(originalClosedSymbolFullEvidenceKind(full, f.engine, result.operationId), "locked");
    assertOriginalClosedSymbolCompletion(completion, f.engine, result.operationId);
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The actual coordinator registry above verifies this retained original full result, not caller JSON.
    const originalFull = full as FinalEvidenceRecord;
    let disposed = 0, releases = 0;
    const release = f.runtime.release.bind(f.runtime);
    context.mock.method(f.runtime, "release", (): ReturnType<typeof release> => { releases += 1; return release(); });
    const complete = (runtime: typeof f.runtime): void => { assert.equal(runtime, f.runtime); assert.equal(runtime.isReleaseAcknowledged(), true); disposed += 1; };
    const captureCount = (): number => f.owner.requests.filter(request => request["action"] === "release-capture").length;
    const before = captureCount();
    const invalid = assert.rejects(coordinator.releaseCompletedRuntime(originalFull, structuredClone(completion), complete), /Original terminal completion owner or value differs/u);
    await assert.rejects(coordinator.releaseCompletedRuntime(originalFull, completion, complete), /preflight is already pending/u);
    await invalid;
    assert.equal(releases, 0); assert.equal(disposed, 0); assert.equal(captureCount(), before); assert.equal(coordinator.isRuntimeDisposed(), false);
    const valid = coordinator.releaseCompletedRuntime(originalFull, completion, complete);
    await assert.rejects(coordinator.releaseCompletedRuntime(originalFull, completion, complete), /preflight is already pending/u);
    const receipt = await valid;
    assert.equal(receipt.helperReleaseAcknowledged, true); assert.equal(coordinator.isRuntimeDisposed(f.runtime), true);
    assert.equal(releases, 1); assert.equal(disposed, 1); assert.equal(captureCount(), before + 3);
    assert.equal(f.entry.retained()["full"], full); assert.equal(f.entry.retained()["completion"], completion);
    await assert.rejects(coordinator.releaseCompletedRuntime(originalFull, completion, complete), /completed/u);
    assert.equal(releases, 1); assert.equal(disposed, 1); assert.equal(captureCount(), before + 3);
  });
}

/** Register refusal cases that must stop before a claim or native allocation.
 * Real unresolved journals and queued request drift cannot become cleanup or
 * ownership authority merely because their diagnostic result is inspectable.
 */
export function registerEarlyRefusals(): void {
  for (const orphan of [false, true]) {
    void test(`real ${orphan ? "orphan-risk" : "unfinished"} journal blocks before claim`, async context => {
      const f = await handlerFixture(context);
      const operationId = newOperationId(), plan = { profile: "test.handler-unfinished-peer.v1" };
      await createOperation({ schema: OPERATION_SCHEMA, operationId, plan, planHash: buildPlanHash(plan),
        state: "running", artifacts: [], orphanedCallPossible: orphan });
      context.after(() => retireSyntheticJournal(operationId));
      const bytes = await readFile(operationPath(operationId));
      const result = await f.entry.run(f.request); assert.equal(result.outcome, "stopped"); assert.ok(result.outcome === "stopped");
      assert.equal(result.phase, "admission"); assert.equal(result.claimState, "not-attempted");
      assert.equal(f.launches(), 0); assert.deepEqual(f.localReads, []); assert.deepEqual(await readFile(operationPath(operationId)), bytes);
      assert.match(String(f.entry.retained()["failure"]), /orphan|incomplete|transaction/iu);
    });
  }
  void test("internal malformed request consumes only its defensive entry/runtime attempt", async context => {
    const f = await handlerFixture(context); const result = await f.entry.run({ ...f.request, headEligibility: "locked" });
    assert.equal(result.outcome, "stopped"); assert.ok(result.outcome === "stopped");
    assert.equal(result.phase, "request"); assert.equal(result.claimState, "not-attempted"); assert.equal(f.launches(), 0); assert.deepEqual(f.localReads, []);
    const failure = f.entry.retained()["failure"]; assert.ok(failure instanceof Error);
    await f.entry.run(f.request); assert.equal(f.entry.retained()["failure"], failure); assert.equal(f.launches(), 0);
  });
  void test("preexisting authentication refuses before preparation and claim", async context => {
    const f = await handlerFixture(context); f.state.preexisting = true;
    const result = await f.entry.run(f.request); assert.equal(result.outcome, "stopped"); assert.ok(result.outcome === "stopped");
    assert.equal(result.claimState, "not-attempted"); assert.equal(f.launches(), 0); assert.deepEqual(f.localReads, []);
    assert.match(String(f.entry.retained()["failure"]), /authenticated session/u);
    await assert.rejects(f.entry.releaseCompletedRuntime("synthetic-missing-completion", () => { throw new Error("Partial entry cannot clear an allocation."); }), /complete original entry/u);
    assert.equal(f.entry.isRuntimeDisposed(), false);
  });
  void test("queued caller mutation refuses without any claim or native call", async context => {
    const f = await handlerFixture(context);
    const barrier = Promise.withResolvers<null>();
    const holding = f.gate.run(() => barrier.promise); const request = structuredClone(f.request);
    const pending = f.entry.run(request);
    Object.assign(request.metadata, { name: "late synthetic change" }); barrier.resolve(null); await holding;
    const result = await pending; assert.equal(result.outcome, "stopped"); assert.ok(result.outcome === "stopped");
    assert.equal(result.claimState, "not-attempted"); assert.equal(f.launches(), 0); assert.deepEqual(f.localReads, []);
    assert.match(String(f.entry.retained()["failure"]), /request changed/u);
  });
}

export function registerAfterClaimFailure(): void {
  void test("startup failure retains permanent claim and exact earlier owners without replay", async context => {
    const f = await handlerFixture(context); f.state.startupFailure = true;
    const result = await f.entry.run(f.request); assert.equal(result.outcome, "stopped"); assert.ok(result.outcome === "stopped");
    assert.equal(result.phase, "coordinator"); assert.equal(result.claimState, "acknowledged"); assert.equal(f.launches(), 1);
    const retained = f.entry.retained();
    const claim = await originalClaim(f.entry);
    assert.deepEqual(result.claimArtifact, claim.artifact); assert.ok(retained["coordinator"] instanceof ClosedSymbolCoordinator);
    assert.ok(retained["failure"] instanceof Error); assert.equal(retained["full"], undefined); assert.equal(retained["completion"], undefined);
    const diagnostic = closedSymbolEntryFailureDiagnostic(f.entry);
    assert.equal(diagnostic?.stage, "coordinator"); assert.equal(diagnostic.lastSuccessfulStage, "baseline-admission");
    assert.equal(diagnostic.errorCode, "UNCLASSIFIED_FAILURE"); assert.match(diagnostic.messageSha256 ?? "", /^[a-f0-9]{64}$/u);
    assert.equal(f.events.filter(event => event === "normal-close").length, 0); assert.equal(f.state.writes, 0);
    const events = [...f.events]; await f.entry.run(f.request); assert.deepEqual(f.events, events);
    assert.equal(f.entry.retained()["claim"], retained["claim"]); assert.equal(f.entry.retained()["failure"], retained["failure"]);
    assert.deepEqual(closedSymbolEntryFailureDiagnostic(f.entry), diagnostic);
  });
}
