/** Managed publication and original-provider admission regressions only.
 * These checks launch no EasyEDA/Windows process or writer. */
/* oxlint-disable import/max-dependencies -- Integration checks compare actual opening prototypes, journal bytes, shared exclusion custody and the genuine factory without replacing their guards. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import { sha256Json, sha256Text } from "../src/core.ts";
import { acquireCurrentPcbDiagnosticLaunchExclusion, releaseCurrentPcbDiagnosticLaunchExclusion } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";
import { loadOperation, operationPath } from "../src/artifacts.ts";
import { CURRENT_FOOTPRINT_FORWARD_EXECUTION_OPENING_BUDGET as BUDGET, CURRENT_FOOTPRINT_FORWARD_EXECUTION_OPENING_NORMAL_STAGES as NORMAL,
  currentFootprintForwardExecutionOpeningProducerEvidenceSchema, currentFootprintForwardExecutionOpeningRecordSchema, currentFootprintForwardExecutionOpeningRequestSchema } from "../src/current-footprint-forward-execution-opening-contract.ts";
import type { CurrentFootprintForwardExecutionOpeningRecord as Entry, CurrentFootprintForwardExecutionOpeningPhase as Phase } from "../src/current-footprint-forward-execution-opening-contract.ts";
import { CurrentFootprintForwardExecutionOpeningJournal, assertCurrentFootprintForwardExecutionOpeningChain, assertNoUnresolvedCurrentFootprintForwardExecutionOpenings,
  readCurrentFootprintForwardExecutionOpeningHistory } from "../src/current-footprint-forward-execution-opening-journal.ts";
import { CurrentFootprintForwardExecutionOpeningProvider } from "../src/current-footprint-forward-execution-opening.ts";
import { CurrentFootprintCopyStartupOpening } from "../src/current-pcb-209-worker-startup-opening.ts";
import { forwardExecutionOpeningJournalFixture } from "./helpers/forward-execution-opening-journal-fixture.ts";
import { forwardExecutionOpeningProviderFixture } from "./helpers/forward-execution-opening-provider-fixture.ts";

function request(suffix: string): ReturnType<typeof currentFootprintForwardExecutionOpeningRequestSchema.parse> {
  const rawWindowsPath = String.raw`C:\Synthetic\validation.eprj2`;
  return currentFootprintForwardExecutionOpeningRequestSchema.parse({ operationId: `footprint-forward-execution-${suffix}`,
    target: { rawWindowsPath, projectUuid: sha256Text(rawWindowsPath), documentUuid: "c".repeat(16), expectedSourceSha256: "d".repeat(64) },
    footprintUuid: "e".repeat(16), confirmDisposableProject: true, acceptExistingProfileEffects: true, acceptNormalOpenEffects: true, acceptDebuggerPauseEffects: true });
}

void test("the provider captures only methods on the actual inherited startup opening prototype", async () => {
  const source = await readFile(new URL("../src/current-footprint-forward-execution-opening.ts", import.meta.url), "utf8");
  const matched = /const openingMethods = (\[[^\]]+\])/u.exec(source); assert.ok(matched?.[1] !== undefined);
  const names: unknown = JSON.parse(matched[1]); assert.ok(Array.isArray(names)); assert.ok(names.length > 0);
  for (const name of names as unknown[]) {
    assert.equal(typeof name, "string"); assert.ok(typeof name === "string");
    assert.equal(typeof Reflect.get(CurrentFootprintCopyStartupOpening.prototype, name), "function", `Missing actual startup opening method: ${name}`);
  }
});

void test("managed v2 reservation blocks another launch until original no-allocation cleanup is published", async () => {
  const journal = new CurrentFootprintForwardExecutionOpeningJournal(request("managed-chain")); await journal.reserve();
  await assert.rejects(assertNoUnresolvedCurrentFootprintForwardExecutionOpenings(), /UNRESOLVED_OWNER/u);
  await assert.rejects(journal.append("release-result", { released: true }), /RELEASE_RESULT/u);
  await assert.rejects(journal.append("allocation-intent", {}), /PREDECESSOR_REQUIRED/u);
  await assert.rejects(journal.append("prepare-intent", { overflow: "x".repeat(BUDGET.normalRecordBytes) }), /RECORD_BOUND/u);
  await journal.append("cleanup-no-allocation", { noAllocationProved: true });
  await assertNoUnresolvedCurrentFootprintForwardExecutionOpenings();
  assert.equal(journal.retained().records.at(-1)?.executionAuthorized, false);
  await assert.rejects(journal.append("failure", { phase: "new", originalErrorRetained: true, code: "ORIGINAL_STAGE_FAILED" }), /CHAIN_IDENTITY/u);
  // Full normal use plus every declared original termination pair still fits
  // Failure, close, abort and final release. These rows are data-only fixtures.
  const rows: Entry[] = []; const selected = request("capacity-only");
  const add = (kind: Phase, evidence: Readonly<Record<string, unknown>>): void => {
    const entry = currentFootprintForwardExecutionOpeningRecordSchema.parse({ schema: "easyeda-pro-control.footprint-forward-execution-opening-record.v2",
      operationId: selected.operationId, sequence: rows.length, previousSha256: rows.length === 0 ? null : sha256Json(rows.at(-1)), kind, evidence, executionAuthorized: false, saveAuthorized: false });
    rows.push(entry);
  };
  add("operation-intent", { request: selected });
  for (const stage of NORMAL) { add(`${stage}-intent` as Phase, {}); add(stage === "launch" ? "binding" : `${stage}-result` as Phase, {}); }
  add("failure", { phase: "sealed", originalErrorRetained: true, code: "ORIGINAL_STAGE_FAILED" });
  add("close-intent", { hwnd: "123" }); add("close-result", { requested: true }); add("abort-intent", {}); add("abort-result", { requested: true, originalJobOnly: true });
  for (let ordinal = 1; ordinal <= BUDGET.terminationObservations; ordinal += 1) { add("termination-intent", { ordinal }); add("termination-result", { ordinal, terminated: ordinal === BUDGET.terminationObservations }); }
  add("release-intent", {}); add("release-result", { released: true });
  assert.equal(rows.length, 518); assert.doesNotThrow(() =>{  assertCurrentFootprintForwardExecutionOpeningChain(rows); });
  const overflow = currentFootprintForwardExecutionOpeningRecordSchema.safeParse({ ...rows.at(-3), sequence: BUDGET.records }); assert.equal(overflow.success, false);
  const exhausted = rows.slice(0, -2), last = exhausted.at(-1); assert.ok(last !== undefined);
  exhausted[exhausted.length - 1] = currentFootprintForwardExecutionOpeningRecordSchema.parse({ ...last, evidence: { ordinal: BUDGET.terminationObservations, terminated: false } });
  const extraPoll = currentFootprintForwardExecutionOpeningRecordSchema.parse({ ...last, kind: "termination-intent", evidence: { ordinal: BUDGET.terminationObservations + 1 },
    sequence: exhausted.length, previousSha256: sha256Json(exhausted.at(-1)) });
  assert.throws(() =>{  assertCurrentFootprintForwardExecutionOpeningChain([...exhausted, extraPoll]); });
});

void test("a second equal request cannot adopt the first original managed journal", async () => {
  const selected = request("foreign-journal"); const original = new CurrentFootprintForwardExecutionOpeningJournal(selected); const copied = new CurrentFootprintForwardExecutionOpeningJournal(selected);
  await original.reserve(); await assert.rejects(copied.reserve());
  await assert.rejects(copied.settle(), /ORIGINAL_RESERVATION_REQUIRED/u);
  await original.append("cleanup-no-allocation", { noAllocationProved: true });
});

void test("original unlaunched release is a distinct strict terminal and preserves the earlier cleanup predecessors", async () => {
  const evidence = { helperClosed: true, launchNeverInvoked: true, originalUnlaunchedReleaseAcknowledged: true };
  for (const allocationPublished of [false, true]) {
    const journal = new CurrentFootprintForwardExecutionOpeningJournal(request(`allocation-${String(allocationPublished)}-terminal`)); await journal.reserve();
    await journal.append("prepare-intent", {}); await journal.append("prepare-result", {});
    await assert.rejects(journal.append("cleanup-unlaunched-owner", evidence), /UNINVOKED_LAUNCH_REQUIRED/u);
    await journal.append("allocation-intent", {});
    if (allocationPublished) { await journal.append("allocation-result", {}); }
    await journal.append("cleanup-unlaunched-owner", evidence);
  }
  for (const suffix of ["new-terminal", "bound-terminal", "close-terminal", "no-process-terminal"] as const) {
    const selected = request(suffix); const journal = new CurrentFootprintForwardExecutionOpeningJournal(selected); await journal.reserve();
    for (const stage of ["prepare", "allocation"] as const) { await journal.append(`${stage}-intent`, {}); await journal.append(`${stage}-result`, {}); }
    await journal.append("launch-intent", {});
    await assert.rejects(journal.append("cleanup-before-launch", { helperClosed: true, stdinBytesWritten: 0 }), /BEFORE_LAUNCH_REQUIRED/u);
    for (const malformed of [{ ...evidence, helperClosed: false }, { ...evidence, launchNeverInvoked: false },
      { ...evidence, originalUnlaunchedReleaseAcknowledged: false }, { ...evidence, callerAuthority: true }, { helperClosed: true }]) {
      await assert.rejects(journal.append("cleanup-unlaunched-owner", malformed));
    }
    if (suffix === "new-terminal") {
      await journal.append("failure", { phase: "new", originalErrorRetained: true, code: "ORIGINAL_STAGE_FAILED" });
      await journal.append("cleanup-unlaunched-owner", evidence);
      await assert.rejects(journal.append("cleanup-unlaunched-owner", evidence), /CHAIN_IDENTITY/u);
    } else {
      if (suffix === "bound-terminal") { await journal.append("binding", {}); }
      if (suffix === "close-terminal") { await journal.append("close-intent", { hwnd: "123" }); }
      if (suffix === "no-process-terminal") { await journal.append("no-process-release-intent", {}); }
      await assert.rejects(journal.append("cleanup-unlaunched-owner", evidence), /UNINVOKED_LAUNCH_REQUIRED/u);
      if (suffix === "no-process-terminal") { await journal.append("cleanup-no-process", { helperReleased: true, noProcessProved: true }); }
      else {
        if (suffix === "bound-terminal") { await journal.append("close-intent", { hwnd: "123" }); }
        await journal.append("termination-intent", { ordinal: 1 }); await journal.append("termination-result", { ordinal: 1, terminated: true });
        await journal.append("release-intent", {}); await journal.append("release-result", { released: true });
      }
    }
  }
  await assertNoUnresolvedCurrentFootprintForwardExecutionOpenings();
});

for (const mode of ["create-ack", "manifest-ack"] as const) {
  void test(`the original ${mode} publication settles without a second reservation or phase publication`, async () => {
    const f = await forwardExecutionOpeningJournalFixture(mode); const selected = request(mode); const journal = new f.Journal(selected);
    await assert.rejects(journal.reserve(), /acknowledgment lost/u);
    assert.equal(journal.reservationOutcome(), mode === "create-ack" ? "create-unknown" : "reserved");
    const before = { ...f.state }; await journal.settle();
    assert.equal(f.state.creates, 1); assert.equal(f.state.artifacts, 1); assert.equal(f.state.manifests, 1); assert.equal(journal.reservationOutcome(), "reserved");
    if (mode === "manifest-ack") { assert.equal(f.state.artifacts, before.artifacts); assert.equal(f.state.manifests, before.manifests); }
    const operation = await loadOperation(selected.operationId); assert.equal(operation.artifacts?.length, 1); assert.equal(journal.retained().publicationPending, false);
    await journal.append("cleanup-no-allocation", { noAllocationProved: true });
  });
}

void test("a held original phase publication refuses concurrent append or settlement without replacing its pending bytes", async () => {
  const f = await forwardExecutionOpeningJournalFixture("held-artifact"); const selected = request("held-publication"); const journal = new f.Journal(selected);
  const reservation = journal.reserve(); await f.entered;
  try {
    await assert.rejects(journal.append("cleanup-no-allocation", { noAllocationProved: true }), /PUBLICATION_BUSY/u);
    await assert.rejects(journal.settle(), /PUBLICATION_BUSY/u);
    assert.equal(f.state.artifacts, 1);
  } finally { f.release(); await reservation; }
  assert.equal(journal.retained().records.length, 1); await journal.append("cleanup-no-allocation", { noAllocationProved: true });
  const heldRequest = request("held-provider-storage"); const provider = await forwardExecutionOpeningProviderFixture(heldRequest, "held-storage");
  assert.ok(provider.journalFixture !== null);
  const launched = assert.rejects(provider.provider.launch(heldRequest), /storage failure before original create/u);
  await provider.journalFixture.entered;
  try { await assert.rejects(provider.provider.cleanupBeforeLaunch(), /BEFORE_LAUNCH_ONLY/u); }
  finally { provider.journalFixture.release(); await launched; }
  assert.equal(provider.state.allocations, 0); await provider.provider.cleanupBeforeLaunch();
  await assert.rejects(provider.provider.launch(heldRequest), /NORMAL_ENDED/u);
  const lease = acquireCurrentPcbDiagnosticLaunchExclusion(); releaseCurrentPcbDiagnosticLaunchExclusion(lease);
});

void test("invalid v2 operation IDs and request accessors refuse before original guards, managed reads or native allocation", async () => {
  let getters = 0, guards = 0;
  const provider = new CurrentFootprintForwardExecutionOpeningProvider(Object.freeze({ pluginRoot: "/synthetic-unused", assetsRoot: "/synthetic-unused",
    powershellSha256: "a".repeat(64), powershellBytes: 1, assertLocalAllowed: (): void => { guards += 1; },
    assertAllowed: (): Promise<void> => { guards += 1; return Promise.resolve(); }, assertOtherLaunchesSettled: (): Promise<void> => { guards += 1; return Promise.resolve(); } }));
  const selected = request("invalid-before-effects");
  await assert.rejects(provider.launch({ ...selected, operationId: `${selected.operationId}!` }));
  const accessor = Object.defineProperty({ ...selected }, "operationId", { get: (): string => { getters += 1; return selected.operationId; } });
  await assert.rejects(provider.launch(accessor)); assert.equal(getters, 0); assert.equal(guards, 0);
});

void test("managed preparation is published before the actual v2 factory and its original pre-ready failure remains cleanable", async () => {
  const selected = request("actual-factory"); const f = await forwardExecutionOpeningProviderFixture(selected);
  await assert.rejects(f.provider.launch(selected), /FORWARD_EXECUTION_FACTORY_READY_FAILED/u);
  assert.equal(f.state.allocations, 1); assert.equal(f.state.preparedWasPublished, true); assert.equal(f.factory.state.writes, 0);
  assert.equal(f.state.producerWasPublished, true); assert.equal(f.state.installationChecks, 1);
  const operation = await loadOperation(selected.operationId); assert.ok(Array.isArray(operation["records"]));
  const allocation: unknown = operation["records"].find((value: unknown) => value !== null && typeof value === "object" && "kind" in value && value.kind === "allocation-intent");
  assert.ok(allocation !== null && typeof allocation === "object" && "evidence" in allocation && allocation.evidence !== null && typeof allocation.evidence === "object" && "producer" in allocation.evidence);
  const producer = currentFootprintForwardExecutionOpeningProducerEvidenceSchema.parse(allocation.evidence.producer);
  assert.equal(producer.facadeSha256, "f".repeat(64));
  assert.equal(currentFootprintForwardExecutionOpeningProducerEvidenceSchema.safeParse({ ...producer, callerProfile: true }).success, false);
  assert.equal(currentFootprintForwardExecutionOpeningProducerEvidenceSchema.safeParse({ ...producer, schema: "easyeda-pro-control.footprint-forward-execution-opening-record.v2" }).success, false);
  assert.equal(currentFootprintForwardExecutionOpeningProducerEvidenceSchema.safeParse({ ...producer, installationSha256: "not-a-digest" }).success, false);
  assert.equal(f.provider.retained().originalOwner, true); assert.equal(f.provider.retained().failed, true);
  await f.provider.cleanupBeforeLaunch(); assert.equal(f.factory.child().exitCode, 0);
  const closedBeforeOwner = await readCurrentFootprintForwardExecutionOpeningHistory(selected.operationId);
  assert.equal(closedBeforeOwner.records.at(-1)?.kind, "cleanup-before-launch");
  assert.deepEqual(closedBeforeOwner.records.at(-1)?.evidence, { helperClosed: true, stdinBytesWritten: 0 });
  assert.equal(f.factory.state.writes, 0);
  await assertNoUnresolvedCurrentFootprintForwardExecutionOpenings();
  await assert.rejects(f.provider.launch(selected), /NORMAL_ENDED/u); assert.equal(f.state.allocations, 1);
});

void test("prepared-publication failure prevents native allocation and settles only the original managed operation", async () => {
  const selected = request("prepared-publication"); const f = await forwardExecutionOpeningProviderFixture(selected, "prepared-publication");
  await assert.rejects(f.provider.launch(selected), /prepared publication acknowledgment lost/u);
  assert.equal(f.state.allocations, 0); assert.equal(f.state.sqlReads, 1);
  await f.provider.settleRecords(); await f.provider.cleanupBeforeLaunch();
  await assertNoUnresolvedCurrentFootprintForwardExecutionOpenings();
  await assert.rejects(f.provider.launch(selected), /NORMAL_ENDED/u); assert.equal(f.state.allocations, 0);
  for (const mode of ["ensure-storage", "create-conflict", "create-ack"] as const) {
    const input = request(`preallocation-${mode}`); const fixture = await forwardExecutionOpeningProviderFixture(input, mode);
    await assert.rejects(fixture.provider.launch(input), /synthetic (?:storage failure before original create|original create (?:conflict|acknowledgment lost))/u);
    assert.equal(fixture.state.allocations, 0); assert.ok(fixture.journalFixture !== null);
    if (mode === "create-ack") {
      const original = await loadOperation(input.operationId); assert.equal(original.artifacts?.length, 0);
    }
    await fixture.provider.cleanupBeforeLaunch();
    assert.equal(fixture.journalFixture.state.creates, mode === "ensure-storage" ? 0 : 1);
    assert.equal(fixture.state.allocations, 0);
    const lease = acquireCurrentPcbDiagnosticLaunchExclusion(); releaseCurrentPcbDiagnosticLaunchExclusion(lease);
    await assert.rejects(fixture.provider.launch(input), /NORMAL_ENDED/u);
  }
  const duplicate = request("duplicate-terminal"); const existing = new CurrentFootprintForwardExecutionOpeningJournal(duplicate);
  await existing.reserve(); await existing.append("cleanup-no-allocation", { noAllocationProved: true });
  const before = await readFile(operationPath(duplicate.operationId)); const refused = await forwardExecutionOpeningProviderFixture(duplicate);
  await assert.rejects(refused.provider.launch(duplicate)); assert.equal(refused.state.allocations, 0); assert.equal(refused.state.checkpointReads, 0);
  await refused.provider.cleanupBeforeLaunch();
  assert.deepEqual(await readFile(operationPath(duplicate.operationId)), before);
  const lease = acquireCurrentPcbDiagnosticLaunchExclusion(); releaseCurrentPcbDiagnosticLaunchExclusion(lease);
  await assertNoUnresolvedCurrentFootprintForwardExecutionOpenings();
});

void test("lost prelaunch cleanup publication settles the original terminal without releasing or appending twice", async context => {
  const selected = request("prelaunch-cleanup-ack"); const f = await forwardExecutionOpeningProviderFixture(selected, "prelaunch-cleanup-ack");
  // This original factory owns only an inert Node child. EOF is test-resource
  // Disposal if an assertion fails; it is never a native release receipt.
  context.after(() => { if (f.state.allocations > 0 && !f.factory.child().stdin.writableEnded) { f.factory.child().stdin.end(); } });
  await assert.rejects(f.provider.launch(selected), /original prelaunch collector failed/u);
  assert.equal(f.state.allocations, 1); assert.equal(f.provider.hasOwnedAllocation(), true);
  await assert.rejects(f.provider.cleanupBeforeLaunch(), /original manifest acknowledgment lost/u);
  assert.equal(f.factory.child().exitCode, 0); assert.equal(f.provider.hasOwnedAllocation(), false);
  assert.equal(f.provider.hasActiveReservation(), true); assert.equal(f.provider.retained().publicationPending, true);
  assert.deepEqual(f.factory.state.actions, ["release-unlaunched"]);
  const before = await readFile(operationPath(selected.operationId)); assert.ok(f.journalFixture !== null);
  const publications = { ...f.journalFixture.state };
  await f.provider.cleanupBeforeLaunch();
  assert.equal(f.provider.hasActiveReservation(), false); assert.equal(f.provider.retained().publicationPending, false);
  assert.deepEqual(f.factory.state.actions, ["release-unlaunched"]);
  const originalRelease = await readCurrentFootprintForwardExecutionOpeningHistory(selected.operationId);
  assert.equal(originalRelease.records.at(-1)?.kind, "cleanup-unlaunched-owner");
  assert.deepEqual(originalRelease.records.at(-1)?.evidence, { helperClosed: true, launchNeverInvoked: true, originalUnlaunchedReleaseAcknowledged: true });
  assert.ok(f.factory.state.bytes > 0);
  assert.deepEqual(f.journalFixture.state, publications); assert.deepEqual(await readFile(operationPath(selected.operationId)), before);
  await assertNoUnresolvedCurrentFootprintForwardExecutionOpenings();
  await f.provider.cleanupBeforeLaunch(); assert.deepEqual(f.factory.state.actions, ["release-unlaunched"]);
  await assert.rejects(f.provider.launch(selected), /NORMAL_ENDED/u);
  const lease = acquireCurrentPcbDiagnosticLaunchExclusion(); releaseCurrentPcbDiagnosticLaunchExclusion(lease);

  const noAllocation = request("no-allocation-cleanup-ack"); const refused = await forwardExecutionOpeningProviderFixture(noAllocation, "no-allocation-cleanup-ack");
  await assert.rejects(refused.provider.launch(noAllocation), /prepared publication acknowledgment lost/u);
  assert.equal(refused.state.allocations, 0);
  await assert.rejects(refused.provider.cleanupBeforeLaunch(), /original manifest acknowledgment lost/u);
  assert.equal(refused.provider.hasActiveReservation(), true); assert.equal(refused.provider.retained().publicationPending, true);
  const bytes = await readFile(operationPath(noAllocation.operationId)); await refused.provider.cleanupBeforeLaunch();
  assert.equal(refused.provider.hasActiveReservation(), false); assert.equal(refused.provider.retained().publicationPending, false);
  assert.equal(refused.state.allocations, 0); assert.deepEqual(refused.factory.state.actions, []);
  assert.deepEqual(await readFile(operationPath(noAllocation.operationId)), bytes);
  await assertNoUnresolvedCurrentFootprintForwardExecutionOpenings();
});

for (const mode of ["allocation-current", "launch-intent-ack", "launch-current", "launch-intent-cleanup-ack", "launch-current-cleanup-ack"] as const) {
  void test(`${mode === "allocation-current" ? "post-allocation" : "post-intent"} prelaunch cleanup settles ${mode} through the original unlaunched release`, async context => {
    const selected = request(mode); const f = await forwardExecutionOpeningProviderFixture(selected, mode);
    context.after(() => { if (f.state.allocations > 0 && !f.factory.child().stdin.writableEnded) { f.factory.child().stdin.end(); } });
    await assert.rejects(f.provider.launch(selected), /synthetic (?:launch-intent manifest acknowledgment lost|post-(?:allocation|launch-intent) current check failed)/u);
    assert.equal(f.state.allocations, 1); assert.equal(f.state.currentFailures, mode === "allocation-current" || mode.startsWith("launch-current") ? 1 : 0);
    assert.equal(f.provider.hasOwnedAllocation(), true); assert.deepEqual(f.factory.state.actions, []);
    assert.equal(f.provider.retained().publicationPending, mode.startsWith("launch-intent"));
    const pending = await readCurrentFootprintForwardExecutionOpeningHistory(selected.operationId);
    assert.equal(pending.operation["state"], "prepared");
    assert.equal(pending.records.some(record => record.kind === "launch-intent"), mode !== "allocation-current");
    if (mode === "allocation-current") { assert.equal(pending.records.some(record => record.kind === "allocation-result"), false); }
    assert.equal(pending.records.some(record => record.kind === "binding"), false);
    await assert.rejects(assertNoUnresolvedCurrentFootprintForwardExecutionOpenings(), /UNRESOLVED_OWNER/u);
    await assert.rejects(f.provider.close("123"), /CLOSE_UNAVAILABLE/u);
    await assert.rejects(f.provider.abort(true), /ABORT_UNAVAILABLE/u);
    await assert.rejects(f.provider.cleanupNoProcess(), /NO_PROCESS_UNAVAILABLE/u);
    const publications = f.journalFixture === null ? null : { ...f.journalFixture.state };
    if (mode !== "launch-intent-ack") {
      await f.provider.settleRecords();
      if (publications !== null) { assert.deepEqual(f.journalFixture?.state, publications); }
      assert.deepEqual(f.factory.state.actions, []); assert.equal(f.provider.retained().publicationPending, false);
    }
    if (mode.endsWith("cleanup-ack")) {
      await assert.rejects(f.provider.cleanupBeforeLaunch(), /original manifest acknowledgment lost/u);
      assert.equal(f.provider.hasActiveReservation(), true); assert.equal(f.provider.retained().publicationPending, true);
      assert.equal(f.provider.hasOwnedAllocation(), false); assert.equal(f.factory.child().exitCode, 0);
      assert.deepEqual(f.factory.state.actions, ["release-unlaunched"]);
      const terminal = await readFile(operationPath(selected.operationId)); const counts = { ...f.journalFixture?.state };
      await f.provider.settleRecords(); await f.provider.cleanupBeforeLaunch();
      assert.deepEqual(await readFile(operationPath(selected.operationId)), terminal); assert.deepEqual(f.journalFixture?.state, counts);
    } else { await f.provider.cleanupBeforeLaunch(); }
    const completed = await readCurrentFootprintForwardExecutionOpeningHistory(selected.operationId);
    assert.equal(completed.operation["state"], "completed"); assert.equal(completed.records.at(-1)?.kind, "cleanup-unlaunched-owner");
    assert.deepEqual(completed.records.at(-1)?.evidence, { helperClosed: true, launchNeverInvoked: true, originalUnlaunchedReleaseAcknowledged: true });
    assert.equal(completed.records.filter(record => record.kind === "cleanup-unlaunched-owner").length, 1);
    assert.equal(completed.records.some(record => record.kind === "cleanup-before-launch" || record.kind === "close-intent" || record.kind === "abort-intent"), false);
    assert.equal(f.factory.child().exitCode, 0); assert.deepEqual(f.factory.state.actions, ["release-unlaunched"]);
    assert.equal(f.provider.hasOwnedAllocation(), false); assert.equal(f.provider.hasActiveReservation(), false);
    await f.provider.cleanupBeforeLaunch(); assert.deepEqual(f.factory.state.actions, ["release-unlaunched"]);
    await assert.rejects(f.provider.launch(selected), /NORMAL_ENDED/u);
    await assert.rejects(f.provider.close("123"), /CLOSE_UNAVAILABLE/u); await assert.rejects(f.provider.abort(true), /ABORT_UNAVAILABLE/u);
    await assertNoUnresolvedCurrentFootprintForwardExecutionOpenings();
    const lease = acquireCurrentPcbDiagnosticLaunchExclusion(); releaseCurrentPcbDiagnosticLaunchExclusion(lease);
  });
}

void test("no-process cleanup settles its original release and terminal after publication failure without a binding or resend", async context => {
  const selected = request("no-process-cleanup-ack"); const f = await forwardExecutionOpeningProviderFixture(selected, "no-process-cleanup-ack");
  context.after(() => { if (f.state.allocations > 0 && !f.factory.child().stdin.writableEnded) { f.factory.child().stdin.end(); } });
  // The synthetic installation deliberately lacks the launch target. Actual
  // Owner state consumes launch but issues no native launch request or binding.
  await assert.rejects(f.provider.launch(selected), /INSTALLATION_TARGET/u);
  assert.equal(f.state.allocations, 1); assert.equal(f.provider.inspection()["binding"], null);
  await assert.rejects(f.provider.cleanupBeforeLaunch(), /BEFORE_LAUNCH_ONLY/u); assert.deepEqual(f.factory.state.actions, []);
  await assert.rejects(f.provider.cleanupNoProcess(), /original manifest acknowledgment lost/u);
  assert.equal(f.factory.child().exitCode, 0); assert.deepEqual(f.factory.state.actions, ["release-no-process"]);
  assert.equal(f.provider.hasActiveReservation(), true); assert.equal(f.provider.retained().publicationPending, true);
  const before = await readFile(operationPath(selected.operationId)); assert.ok(f.journalFixture !== null);
  const publications = { ...f.journalFixture.state };
  await f.provider.cleanupNoProcess();
  assert.equal(f.provider.hasActiveReservation(), false); assert.equal(f.provider.retained().publicationPending, false);
  assert.deepEqual(f.factory.state.actions, ["release-no-process"]); assert.deepEqual(f.journalFixture.state, publications);
  assert.deepEqual(await readFile(operationPath(selected.operationId)), before);
  await f.provider.cleanupNoProcess(); assert.deepEqual(f.factory.state.actions, ["release-no-process"]);
  await assert.rejects(f.provider.launch(selected), /NORMAL_ENDED/u);
  await assertNoUnresolvedCurrentFootprintForwardExecutionOpenings();
  const lease = acquireCurrentPcbDiagnosticLaunchExclusion(); releaseCurrentPcbDiagnosticLaunchExclusion(lease);
});

for (const kind of ["unlaunched", "no-process", "closed"] as const) {
  void test(`genuine ${kind} release preflight failure permits only the next explicit original cleanup`, async context => {
    const selected = request(`${kind}-release-preflight`); const failure = new Error(`synthetic original ${kind} release verification failed`);
    let armed: Error | null = null;
    const verifyNativeGraph = (): Promise<void> => {
      const original = armed; armed = null; return original === null ? Promise.resolve() : Promise.reject(original);
    };
    const closed = kind === "closed" ? {
      launchTarget: { windowsPath: "C:\\Synthetic\\easyeda-pro.exe", sha256: "e".repeat(64) },
      childProgram: `
        const readline=require('node:readline');const input=readline.createInterface({input:process.stdin});
        process.stdout.write(JSON.stringify(packet)+'\\n');
        input.on('line',line=>{const q=JSON.parse(line);let result;
          if(q.action==='launch')result={helperInstance:packet.helperInstance,jobId:packet.jobId,rootPid:123,rootCreated:'123456789012345'};
          else if(q.action==='normal-close')result={closeDispatched:true,saveOrDiscardSelected:false};
          else if(q.action==='termination')result={terminated:true,originalRootExited:true,originalJobEmpty:true};
          else if(q.action==='release')result={released:true};else throw Error('Unexpected inert cleanup request');
          process.stdout.write(JSON.stringify({id:q.id,ok:true,result})+'\\n');});
      `,
    } : {};
    let mode: "launch-current" | "no-process-preflight" | "launched" = "launch-current";
    if (kind === "no-process") { mode = "no-process-preflight"; }
    else if (kind === "closed") { mode = "launched"; }
    const f = await forwardExecutionOpeningProviderFixture(selected, mode, { verifyNativeGraph, ...closed });
    context.after(() => { if (f.state.allocations > 0 && !f.factory.child().stdin.writableEnded) { f.factory.child().stdin.end(); } });
    if (kind === "closed") { await f.provider.launch(selected); await f.provider.close("123"); assert.equal(await f.provider.observeTermination(), true); }
    else { await assert.rejects(f.provider.launch(selected), /post-launch-intent current check failed|INSTALLATION_TARGET/u); }
    const cleanup = (): Promise<void> => {
      if (kind === "closed") { return f.provider.release(); }
      if (kind === "no-process") { return f.provider.cleanupNoProcess(); }
      return f.provider.cleanupBeforeLaunch();
    };
    const before = [...f.factory.state.actions]; armed = failure;
    await assert.rejects(cleanup(), caught => caught === failure);
    assert.deepEqual(f.factory.state.actions, before); assert.equal(armed, null);
    assert.equal(f.provider.hasOwnedAllocation(), true); assert.equal(f.provider.hasActiveReservation(), true);
    assert.equal(f.provider.inspection()["releaseAttempted"], false);
    const unfinished = await readCurrentFootprintForwardExecutionOpeningHistory(selected.operationId);
    assert.equal(unfinished.operation["state"], "prepared");
    const turn = Promise.withResolvers<null>(); setImmediate(() => { turn.resolve(null); }); await turn.promise;
    assert.deepEqual(f.factory.state.actions, before);
    await assert.rejects(f.provider.observeMain(), /NORMAL_ENDED/u);
    await cleanup();
    let releasedActions = ["release-unlaunched"], terminal = "cleanup-unlaunched-owner";
    if (kind === "no-process") { releasedActions = ["release-no-process"]; terminal = "cleanup-no-process"; }
    else if (kind === "closed") { releasedActions = ["termination", "release"]; terminal = "release-result"; }
    assert.deepEqual(f.factory.state.actions, [...before, ...releasedActions]); assert.equal(f.factory.child().exitCode, 0);
    const completed = await readCurrentFootprintForwardExecutionOpeningHistory(selected.operationId);
    assert.equal(completed.records.at(-1)?.kind, terminal);
    assert.equal(f.provider.hasOwnedAllocation(), false); assert.equal(f.provider.hasActiveReservation(), false);
    if (kind === "unlaunched") { await cleanup(); }
    else { assert.equal(await f.provider.observeRelease(), "released"); }
    assert.deepEqual(f.factory.state.actions, [...before, ...releasedActions]);
    await assert.rejects(f.provider.launch(selected), /NORMAL_ENDED/u);
    await assertNoUnresolvedCurrentFootprintForwardExecutionOpenings();
    const lease = acquireCurrentPcbDiagnosticLaunchExclusion(); releaseCurrentPcbDiagnosticLaunchExclusion(lease);
  });
}

void test("a post-dispatch release refusal retains its original rejected promise and unresolved journal", async context => {
  const selected = request("post-dispatch-release-refusal");
  const f = await forwardExecutionOpeningProviderFixture(selected, "no-process-preflight", { childProgram: `
    const readline=require('node:readline');const input=readline.createInterface({input:process.stdin});
    process.stdout.write(JSON.stringify(packet)+'\\n');
    input.on('line',line=>{const q=JSON.parse(line);if(q.action!=='release-no-process')throw Error('Unexpected inert request');
      process.stdout.write(JSON.stringify({id:q.id,ok:true,result:{creationState:'not-entered',processCreated:false,released:false}})+'\\n');});
  ` });
  // Retain this refused synthetic journal. EOF only disposes the inert test
  // Child and cannot stand in for an acknowledged original helper release.
  context.after(() => { if (f.state.allocations > 0 && !f.factory.child().stdin.writableEnded) { f.factory.child().stdin.end(); } });
  await assert.rejects(f.provider.launch(selected), /INSTALLATION_TARGET/u);
  let originalFailure: unknown;
  await assert.rejects(f.provider.cleanupNoProcess(), caught => { originalFailure = caught; return caught instanceof Error && /NO_PROCESS_PROOF/u.test(caught.message); });
  assert.deepEqual(f.factory.state.actions, ["release-no-process"]); assert.equal(f.provider.inspection()["releaseAttempted"], true);
  await assert.rejects(f.provider.cleanupNoProcess(), caught => caught === originalFailure);
  assert.deepEqual(f.factory.state.actions, ["release-no-process"]); assert.equal(f.provider.inspection()["releaseAttempted"], true);
  assert.equal(f.provider.hasOwnedAllocation(), true); assert.equal(f.provider.hasActiveReservation(), true);
  const history = await readCurrentFootprintForwardExecutionOpeningHistory(selected.operationId);
  assert.equal(history.operation["state"], "prepared"); assert.equal(history.records.at(-1)?.kind, "no-process-release-intent");
  await assert.rejects(assertNoUnresolvedCurrentFootprintForwardExecutionOpenings(), /UNRESOLVED_OWNER/u);
  await assert.rejects(f.provider.cleanupBeforeLaunch(), /BEFORE_LAUNCH_ONLY/u);
  await assert.rejects(f.provider.launch(selected), /NORMAL_ENDED/u);
});
