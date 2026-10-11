/* oxlint-disable import/max-dependencies -- Exercise the real v2 coordinator and encrypted SQLite reader with isolated native observation/dispatch seams. */
import assert from "node:assert/strict";
import { mkdtemp, rename } from "node:fs/promises";
import { basename, join } from "node:path";
import { test } from "node:test";
import { controlDataDirectory, loadOperation, readArtifact, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
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

type Fixture = ReturnType<typeof nativeFormatFixture>;
interface Snapshot { payload: Record<string, unknown>; snapshot: ReturnType<typeof parseDocumentSource>; native: Fixture["native"] }
function importedFixture(): Fixture {
  const value = nativeFormatFixture();
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
    for (const finish of ["commit", "rollback", "saved-reconcile", "pre-save-header-drift", "post-save-header-drift"] as const) {
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
        const drifted = await storedFlatFixture(nativeFormatAfter(before, prepared.expectedSource, prepared.expectedNative), directory, "drifted", { libraryFirstTicket: 1 });
        assert.equal(persisted.evidence.history.semanticSha256, drifted.evidence.history.semanticSha256);
        assert.notEqual(persisted.evidence.libraryHeaderEvidence?.contentSha256, drifted.evidence.libraryHeaderEvidence?.contentSha256);
        let current = before, postApplyRefusal = recover, postSaveRefusal = false;
        let operationId: string | undefined;
        const calls: string[] = [];
        const engine = new EasyedaControlEngine({ callTool: (): Promise<never> => Promise.reject(new Error("No live calls in synthetic v2 lifecycle.")) },
          { executionAuthorityValidator: { capture: (): Promise<never> => Promise.reject(new Error("Native dispatch is an isolated test seam.")),
            proveTerminated: (): Promise<never> => Promise.reject(new Error("No process actions in synthetic v2 lifecycle.")) } });
        await engine.controlFingerprintPromise;
        t.mock.method(engine, "assertContext", (): Promise<typeof context> => Promise.resolve(context));
        t.mock.method(engine, "awaitProjectUploads", (): Promise<Record<string, unknown>> => Promise.resolve({ scheduledWritesSettled: true }));
        t.mock.method(engine, "assertRecoveryOperationIsolated", (): Promise<true> => Promise.resolve(true));
        t.mock.method(engine, "checkpoint", (): Promise<unknown> => Promise.resolve(current.evidence.checkpoint));
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
        t.mock.method(seams, "observeFlat", (): Promise<FlatDisplayObservationEvidence> => {
          if (postApplyRefusal && current === applied) { postApplyRefusal = false; return Promise.reject(new Error("Synthetic post-apply interruption.")); }
          return Promise.resolve(current.evidence);
        });
        t.mock.method(seams, "call", async (journal: DispatchOperationJournal, phase: string): Promise<unknown> => {
          operationId = journal.operationId; calls.push(phase); current = phase === "inverse" ? restored : applied;
          const hash = "a".repeat(64);
          let result: Record<string, unknown>;
          if (phase === "apply") { result = { ok: true, kind: "typed-design-result", id: operation.id, createdId: null, createdIds: {} }; }
          else if (phase === "inverse") { result = { ok: true }; }
          else {
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
        if (finish === "saved-reconcile") {
          await assert.rejects(executor.commit(operationId), /post-Save read interruption/u);
          assert.deepEqual(calls, ["apply", "save-reopen"]);
          const result = await executor.reconcile(operationId); assert.equal(result["state"], "completed");
        } else { const result = await executor[finish](operationId); assert.equal(result["state"], finish === "commit" ? "completed" : "rolled-back"); }
        assert.deepEqual(calls, ["apply", finish === "rollback" ? "inverse" : "save-reopen"]);
        const terminal = await loadOperation(operationId); assert.equal(canonicalJson(terminal.plan), plan);
        assert.ok(isRecord(terminal.plan)); assert.equal(canonicalJson(terminal.plan["flatDisplay"]), canonicalJson(prepared.binding));
      });
    }
  }
});
