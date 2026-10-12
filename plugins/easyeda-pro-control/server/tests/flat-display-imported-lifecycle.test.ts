/* oxlint-disable import/max-dependencies -- Exercise the real v2 coordinator and encrypted SQLite reader with isolated native observation/dispatch seams. */
import assert from "node:assert/strict";
import { mkdtemp, rename } from "node:fs/promises";
import { basename, join } from "node:path";
import { test } from "node:test";
import { controlDataDirectory, loadOperation, readArtifact, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
import type { ArtifactDescriptor } from "../src/artifacts.ts";
import { canonicalJson, isRecord, sha256Json } from "../src/core.ts";
import { DesignExecutor } from "../src/design-execution.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import { EasyedaControlEngine } from "../src/engine.ts";
import type { DispatchOperationJournal } from "../src/engine.ts";
import { FLAT_DISPLAY_IMPORTED_TRANSACTION_PROFILE, prepareFlatDisplayProfile } from "../src/flat-display-profile.ts";
import type { FlatDisplayObservationEvidence } from "../src/schematic-flat-read.ts";
import { context as fixtureContext, rehash } from "./flat-display-fixture.ts";
import { nativeFormatAfter, nativeFormatFixture, nativeFormatOperation as operation } from "./flat-display-native-fixture.ts";
import { storedFlatFixture } from "./flat-display-sqlite-fixture.ts";
import { installNavigationPreflight } from "./navigation-preflight-fixture.ts";
import { assertFlatLifecycleObservation, regenerateObservationWitness, withInheritedObservationWitness } from "./flat-lifecycle-observation-fixture.ts";

type Fixture = ReturnType<typeof nativeFormatFixture>;
interface Snapshot { payload: Record<string, unknown>; snapshot: ReturnType<typeof parseDocumentSource>; native: Fixture["native"] }
function importedFixture(): Fixture {
  const value = withInheritedObservationWitness(nativeFormatFixture());
  const peer = value.evidence.history.documents.find((document) => document.uuid === "pcb"); assert.ok(peer);
  const uuid = "imported-symbol";
  value.evidence = { ...value.evidence, history: rehash({ ...value.evidence.history, documents: [...value.evidence.history.documents,
    { ...structuredClone(peer), uuid, docType: "SYMBOL", metadata: { uuid, docType: "SYMBOL" }, records: [
      { id: "META", type: "META", body: { title: "Synthetic imported peer" }, ticket: 1, client: null },
      { id: "symbol-line", type: "LINE", body: { startX: 0, startY: 0, endX: 10, endY: 10 }, ticket: 2, client: null },
    ] }] }) };
  return value;
}

void test("imported-peer v2 apply, retained recovery, Save and inverse use real history proofs without replay", async (t) => {
  const root = controlDataDirectory(); assert.ok(basename(root).startsWith("easyeda-test-control-"));
  for (const recover of [false, true]) {
    for (const finish of ["commit", "rollback", "saved-reconcile", "final-artifact-refusal", "final-proof-refusal", "repeated-checkpoint-refusal", "pre-save-header-drift", "post-save-header-drift"] as const) {
      await t.test(`${recover ? "recovered" : "direct"} ${finish}`, async () => {
        const directory = await mkdtemp(join(root, "flat-imported-lifecycle-"));
        const before = await storedFlatFixture(importedFixture(), directory, "before", { libraryFirstTicket: 0 });
        const context = { ...fixtureContext, project: { ...fixtureContext.project, path: before.evidence.checkpoint.checkpoint } };
        before.evidence.checkpoint.source = context.project.path;
        const prepared = await prepareFlatDisplayProfile({ ...before, context, operation });
        assert.equal(prepared.binding.profile, FLAT_DISPLAY_IMPORTED_TRANSACTION_PROFILE);
        const persisted = await storedFlatFixture(nativeFormatAfter(before, prepared.expectedSource, prepared.expectedNative), directory, "applied", { libraryFirstTicket: 0 });
        const applied = finish === "rollback" ? { ...persisted,
          evidence: { ...before.evidence, observation: persisted.evidence.observation, proof: persisted.evidence.proof } } : persisted;
        const restored = await storedFlatFixture(nativeFormatAfter(before, parseDocumentSource(before.native.source), before.native), directory, "restored", { libraryFirstTicket: 0 });
        const restoredObserver = await storedFlatFixture(restored, directory, "restored-observer", { libraryFirstTicket: 0 });
        const reopened = await storedFlatFixture(regenerateObservationWitness(persisted), directory, "reopened-observer", { libraryFirstTicket: 0 });
        const committed = await storedFlatFixture(reopened, directory, "committed", { libraryFirstTicket: 0 });
        const drifted = await storedFlatFixture(nativeFormatAfter(before, prepared.expectedSource, prepared.expectedNative), directory, "drifted", { libraryFirstTicket: 1 });
        assert.equal(persisted.evidence.history.semanticSha256, drifted.evidence.history.semanticSha256);
        assert.notEqual(persisted.evidence.libraryHeaderEvidence?.contentSha256, drifted.evidence.libraryHeaderEvidence?.contentSha256);
        let current = before, postApplyRefusal = recover, postSaveRefusal = false;
        let collisionPending = finish === "final-artifact-refusal", invalidProofPending = finish === "final-proof-refusal", observations = 0;
        let checkpointRefusals = finish === "repeated-checkpoint-refusal" ? 2 : 0;
        let collision: ArtifactDescriptor | undefined;
        let operationId: string | undefined;
        const calls: string[] = [];
        const engine = new EasyedaControlEngine({ callTool: (): Promise<never> => Promise.reject(new Error("No live calls in synthetic v2 lifecycle.")) },
          { executionAuthorityValidator: { capture: (): Promise<never> => Promise.reject(new Error("Native dispatch is an isolated test seam.")),
            proveTerminated: (): Promise<never> => Promise.reject(new Error("No process actions in synthetic v2 lifecycle.")) } });
        await engine.controlFingerprintPromise;
        t.mock.method(engine, "assertContext", (): Promise<typeof context> => Promise.resolve(context));
        t.mock.method(engine, "awaitProjectUploads", (): Promise<Record<string, unknown>> => Promise.resolve({ scheduledWritesSettled: true }));
        t.mock.method(engine, "assertRecoveryOperationIsolated", (): Promise<true> => Promise.resolve(true));
        t.mock.method(engine, "checkpoint", (): Promise<unknown> => {
          if (current === reopened && checkpointRefusals > 0) {
            checkpointRefusals -= 1;
            return Promise.reject(new Error("Synthetic final checkpoint interruption."));
          }
          let fixture = current;
          if (current === reopened) { fixture = committed; }
          else if (current === restoredObserver) { fixture = restored; }
          return Promise.resolve(fixture.evidence.checkpoint);
        });
        t.mock.method(engine, "rebindAfterLifecycle", (): Promise<typeof context> => Promise.resolve(context));
        const executor = new DesignExecutor(engine);
        await installNavigationPreflight(t, executor, context);
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Test-only native seams leave real coordinator, immutable SQLite reads, seal validation and artifact proofs intact.
        const seams = executor as unknown as { assertRuntime: () => Promise<void>; snapshot: () => Promise<Snapshot>;
          observeFlat: () => Promise<FlatDisplayObservationEvidence>; call: (journal: DispatchOperationJournal, phase: string) => Promise<unknown> };
        t.mock.method(seams, "assertRuntime", (): Promise<void> => Promise.resolve());
        t.mock.method(seams, "snapshot", (): Promise<Snapshot> => {
          if (postSaveRefusal) { postSaveRefusal = false; return Promise.reject(new Error("Synthetic post-Save read interruption.")); }
          return Promise.resolve({ payload: { source: current.native.source, read_consistency: { stable: true, attempts: 2, snapshotSha256: "a".repeat(64) } },
            snapshot: parseDocumentSource(current.native.source), native: current.native });
        });
        t.mock.method(seams, "observeFlat", async (): Promise<FlatDisplayObservationEvidence> => {
          observations += 1;
          if (postApplyRefusal && current === applied) { postApplyRefusal = false; throw new Error("Synthetic post-apply interruption."); }
          if (current === reopened && collisionPending) {
            collisionPending = false; assert.ok(operationId !== undefined);
            const journal = await loadOperation(operationId); assert.equal(typeof journal["sequence"], "number");
            assert.ok(typeof journal["sequence"] === "number");
            collision = await writePhaseArtifact(operationId, journal["sequence"] + 1, "flat-commit-observation", { syntheticCollision: true });
          }
          if (current === reopened && invalidProofPending) {
            invalidProofPending = false;
            return { ...current.evidence, proof: { ...current.evidence.proof, observationSha256: "f".repeat(64) } };
          }
          return current.evidence;
        });
        t.mock.method(seams, "call", async (journal: DispatchOperationJournal, phase: string): Promise<unknown> => {
          operationId = journal.operationId; calls.push(phase);
          current = reopened;
          if (phase === "inverse") { current = restoredObserver; }
          else if (phase === "apply") { current = applied; }
          const hash = "a".repeat(64);
          let result: Record<string, unknown>;
          if (phase === "apply") { result = { ok: true, kind: "typed-design-result", id: operation.id, createdId: null, createdIds: {} }; }
          else if (phase === "inverse") { result = { ok: true }; }
          else {
            journal.sequence += 1;
            journal.artifacts.push(await writePhaseArtifact(journal.operationId, journal.sequence, "design-save-intent", {
              profile: "easyeda-pro-control.design-save-attempt.v1", operationId: journal.operationId, planHash: journal.planHash,
              sequence: journal.sequence, phase: "save-reopen", sourceSha256: prepared.expectedSource.sha256,
              scope: { projectUuid: context.project.uuid, documentUuid: context.document.uuid, documentType: context.document.documentType },
            }));
            await updateOperation(journal);
            result = { ok: true, saved: true, closed: true, reopened: true, document: context.document,
              exactSaveGuard: { passes: 2, labels: ["schematic-source"], snapshotSha256: [hash], saveInvokedInSameExecution: true, publicCompareAndSwapAvailable: false },
              closeProof: { profile: "easyeda-pro-control.native-document-close.v1", closeCalls: 1, terminalNotification: true, oldFrameRemoved: true, oldTabRemoved: true, saved: false },
              openProof: { profile: "easyeda-pro-control.native-document-open.v1", tabId: context.document.tabId, newFrameReady: true, exactContext: true, readinessSamples: 2, activated: true },
              projectUploadBarrier: { profile: "easyeda-pro-control.project-upload-barrier.v1", projectUuid: context.project.uuid, scheduledWritesSettled: true, savedEditorChanges: false },
              flatDisplaySaveGuard: { profile: prepared.binding.profile, bindingSha256: sha256Json(prepared.binding),
                observationSha256: sha256Json(applied.evidence.observation), finalSynchronousCheck: true } };
            if (finish === "saved-reconcile") { postSaveRefusal = true; }
            if (finish === "post-save-header-drift") { current = drifted; }
          }
          journal.sequence += 1; journal.artifacts.push(await writePhaseArtifact(journal.operationId, journal.sequence, phase, result));
          await updateOperation(journal); return result;
        });
        const apply = (): Promise<Record<string, unknown>> => executor.apply({ operation, expectedContext: context, expectedFingerprint: {}, confirmWrite: true });
        if (recover) { await assert.rejects(apply(), /post-apply interruption/u); }
        else { const result = await apply(); assert.equal(result["state"], "applied-unsaved"); }
        assert.ok(operationId !== undefined);
        const original = await loadOperation(operationId), plan = canonicalJson(original.plan);
        if (recover) { const result = await executor.reconcile(operationId); assert.equal(result["state"], "applied-unsaved"); }
        assert.deepEqual(calls, ["apply"]);
        const ready = await loadOperation(operationId); assert.equal(canonicalJson(ready.plan), plan);
        const descriptor = ready.artifacts?.find((entry) => entry.path.endsWith(`flat-${recover ? "reconcile" : "apply"}-verification.json`));
        assert.ok(descriptor);
        const artifact = await readArtifact(descriptor.path, 0, descriptor.bytes);
        const retained: unknown = JSON.parse(artifact.text); assert.ok(isRecord(retained));
        assert.equal(canonicalJson(retained["libraryHeaderEvidence"]), canonicalJson(applied.evidence.libraryHeaderEvidence));
        const observationsBeforeFinish = observations;
        if (finish === "pre-save-header-drift" || finish === "post-save-header-drift") {
          if (finish === "pre-save-header-drift") { current = drifted; }
          await assert.rejects(executor.commit(operationId), /imported library header peers changed/u);
          const refused = await loadOperation(operationId);
          assert.ok(typeof refused["state"] === "string" && refused["state"] !== "completed");
          assert.deepEqual(calls, finish === "pre-save-header-drift" ? ["apply"] : ["apply", "save-reopen"]);
          assert.equal(canonicalJson(refused.plan), plan);
          assert.equal(typeof refused["journalPath"], "string"); assert.ok(typeof refused["journalPath"] === "string");
          await rename(refused["journalPath"], join(directory, "unfinished-journal.json"));
          return;
        }
        if (finish === "saved-reconcile" || finish === "final-artifact-refusal" || finish === "final-proof-refusal" || finish === "repeated-checkpoint-refusal") {
          const refusals = { "saved-reconcile": /post-Save read interruption/u,
            "final-artifact-refusal": /exist|publish|already|EEXIST/u, "final-proof-refusal": /proof|observation/u,
            "repeated-checkpoint-refusal": /final checkpoint interruption/u };
          await assert.rejects(executor.commit(operationId), refusals[finish]);
          assert.deepEqual(calls, ["apply", "save-reopen"]);
          const failed = await loadOperation(operationId);
          assert.equal(failed["state"], "commit-needs-recovery"); assert.equal(failed["hardStop"], true);
          const saveArtifacts = failed.artifacts?.filter((entry) => /-(?:design-save-intent|save-reopen)\.json$/u.test(entry.path));
          assert.equal(saveArtifacts?.length, 2, "The original consumed Save intent and acknowledgment remain retained.");
          assert.equal(failed.artifacts?.some((entry) => entry.path.endsWith("-flat-commit-observation.json")), finish === "repeated-checkpoint-refusal",
            "A later checkpoint failure preserves the already published observation.");
          await assert.rejects(executor.commit(operationId), /Save was already attempted/u);
          if (finish === "repeated-checkpoint-refusal") {
            await assert.rejects(executor.reconcile(operationId), /final checkpoint interruption/u);
            const interrupted = await loadOperation(operationId);
            assert.equal(interrupted["state"], "commit-needs-recovery");
            assert.equal(interrupted.artifacts?.filter((entry) => entry.path.endsWith("-flat-retained-save-observation.json")).length, 1);
            assert.deepEqual(calls, ["apply", "save-reopen"]);
          }
          const result = await executor.reconcile(operationId); assert.equal(result["state"], "completed");
          const recovered = await loadOperation(operationId);
          assert.deepEqual(recovered.artifacts?.filter((entry) => /-(?:design-save-intent|save-reopen)\.json$/u.test(entry.path)), saveArtifacts);
          if (collision !== undefined) {
            const collisionRead = await readArtifact(collision.path, 0, collision.bytes);
            assert.equal(collisionRead.text, `${JSON.stringify({ syntheticCollision: true })}\n`, "Recovery never overwrites collision evidence.");
          }
        } else {
          assert.ok(finish === "commit" || finish === "rollback");
          const result = await executor[finish](operationId); assert.equal(result["state"], finish === "commit" ? "completed" : "rolled-back");
        }
        assert.deepEqual(calls, ["apply", finish === "rollback" ? "inverse" : "save-reopen"]);
        const terminal = await loadOperation(operationId); assert.equal(canonicalJson(terminal.plan), plan);
        assert.ok(isRecord(terminal.plan)); assert.equal(canonicalJson(terminal.plan["flatDisplay"]), canonicalJson(prepared.binding));
        const terminalDescriptor = terminal.artifacts?.at(-1); assert.ok(terminalDescriptor);
        const terminalRead = await readArtifact(terminalDescriptor.path, 0, terminalDescriptor.bytes);
        const terminalEvidence: unknown = JSON.parse(terminalRead.text); assert.ok(isRecord(terminalEvidence));
        const lifecyclePhase = { rollback: "inverse", commit: "commit", "saved-reconcile": "retained-save",
          "final-artifact-refusal": "retained-save", "final-proof-refusal": "retained-save", "repeated-checkpoint-refusal": "retained-save" } as const;
        await assertFlatLifecycleObservation({ terminal: terminalEvidence, journal: terminal, binding: prepared.binding, context,
          current: finish === "rollback" ? restoredObserver : reopened,
          phase: lifecyclePhase[finish] });
        let expectedReads = ["final-artifact-refusal", "final-proof-refusal"].includes(finish) ? 3 : 2;
        if (finish === "repeated-checkpoint-refusal") {
          expectedReads = 4;
          assert.equal(terminal.artifacts?.filter((entry) => entry.path.endsWith("-flat-retained-save-observation.json")).length, 2);
          const originalAfter = ready.artifacts?.findLast((entry) => entry.path.endsWith(recover ? "-reconciled.json" : "-after.json"));
          assert.ok(originalAfter);
          assert.deepEqual(terminalEvidence["retainedAfterArtifact"], originalAfter,
            "Repeated recovery still uses its original pre-Save after evidence, never a later observation artifact.");
        }
        assert.equal(observations - observationsBeforeFinish, expectedReads,
          "Retention does not add a live observation; recovery takes exactly one fresh read.");
      });
    }
  }
});
