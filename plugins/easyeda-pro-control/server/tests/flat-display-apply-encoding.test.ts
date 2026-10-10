/* oxlint-disable import/max-dependencies -- Exercise actual apply/reconcile/commit/inverse coordinators against isolated encrypted SQLite history and explicit native read/dispatch seams. */
import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { basename, join } from "node:path";
import { test } from "node:test";
import { controlDataDirectory, loadOperation, readArtifact, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
import { canonicalJson, isRecord, sha256Json } from "../src/core.ts";
import { DesignExecutor } from "../src/design-execution.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import { EasyedaControlEngine } from "../src/engine.ts";
import type { DispatchOperationJournal } from "../src/engine.ts";
import { prepareFlatDisplayProfile } from "../src/flat-display-profile.ts";
import type { FlatDisplayObservationEvidence } from "../src/schematic-flat-read.ts";
import { schematicNativeSnapshotHash } from "../src/schematic-native-adapter.ts";
import { context } from "./flat-display-fixture.ts";
import { nativeFormatAfter, nativeFormatFixture, nativeFormatOperation as operation } from "./flat-display-native-fixture.ts";
import { storedFlatFixture } from "./flat-display-sqlite-fixture.ts";

type Fixture = ReturnType<typeof nativeFormatFixture>;
interface Snapshot { payload: Record<string, unknown>; snapshot: ReturnType<typeof parseDocumentSource>; native: Fixture["native"] }

void test("actual flat apply and retained v1 reconciliation accept exporter encoding before exact commit or inverse, with no replay", async (t) => {
  const root = controlDataDirectory();
  assert.ok(basename(root).startsWith("easyeda-test-control-"), "Never use real control storage for synthetic journals.");
  for (const recover of [false, true]) {
    for (const finish of ["rollback", "commit"] as const) {
      const directory = await mkdtemp(join(root, "flat-apply-encoding-"));
      const before = await storedFlatFixture(nativeFormatFixture(), directory, "before");
      const prepared = await prepareFlatDisplayProfile({ ...before, context, operation });
      const applied = await storedFlatFixture(nativeFormatAfter(before, prepared.expectedSource, prepared.expectedNative), directory, "applied");
      const restored = await storedFlatFixture(nativeFormatAfter(before, parseDocumentSource(before.native.source), before.native), directory, "restored");
      assert.notEqual(schematicNativeSnapshotHash(applied.native), prepared.binding.after.nativeSha256);
      let current = before, refuseOriginalAfterObservation = recover;
      const calls: string[] = [];
      const engine = new EasyedaControlEngine({ callTool: (): Promise<never> => Promise.reject(new Error("No live upstream in coordinator fixture.")) },
        { executionAuthorityValidator: { capture: (): Promise<never> => Promise.reject(new Error("Synthetic dispatch seam must not capture live authority.")),
          proveTerminated: (): Promise<never> => Promise.reject(new Error("No process actions in coordinator fixture.")) } });
      await engine.controlFingerprintPromise;
      t.mock.method(engine, "assertContext", (): Promise<typeof context> => Promise.resolve(context));
      t.mock.method(engine, "awaitProjectUploads", (): Promise<Record<string, unknown>> => Promise.resolve({ scheduledWritesSettled: true }));
      t.mock.method(engine, "assertRecoveryOperationIsolated", (): Promise<true> => Promise.resolve(true));
      t.mock.method(engine, "checkpoint", (): Promise<unknown> => Promise.resolve(current.evidence.checkpoint));
      t.mock.method(engine, "rebindAfterLifecycle", (): Promise<typeof context> => Promise.resolve(context));
      const executor = new DesignExecutor(engine);
      // Generated writer and authority guards have separate runtime tests.
      // Only native observation/dispatch are replaced; the full coordinator,
      // Original v1 seals, artifact retention and durable proofs run unchanged.
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Private test seams are never part of the MCP caller interface.
      const seams = executor as unknown as { assertRuntime: () => Promise<void>; snapshot: () => Promise<Snapshot>;
        observeFlat: () => Promise<FlatDisplayObservationEvidence>; call: (journal: DispatchOperationJournal, phase: string, code: string) => Promise<unknown> };
      t.mock.method(seams, "assertRuntime", (): Promise<void> => Promise.resolve());
      t.mock.method(seams, "snapshot", (): Promise<Snapshot> => Promise.resolve({ payload: { read_consistency: { snapshotSha256: "a".repeat(64) } },
        snapshot: parseDocumentSource(current.native.source), native: current.native }));
      t.mock.method(seams, "observeFlat", (): Promise<FlatDisplayObservationEvidence> => {
        if (refuseOriginalAfterObservation && current === applied) {
          refuseOriginalAfterObservation = false;
          return Promise.reject(new Error("Synthetic old-generation post-apply representation refusal."));
        }
        return Promise.resolve(current.evidence);
      });
      let dispatchedOperationId: string | undefined;
      t.mock.method(seams, "call", async (journal: DispatchOperationJournal, phase: string): Promise<unknown> => {
        calls.push(phase); dispatchedOperationId = journal.operationId;
        current = phase === "inverse" ? restored : applied;
        let result: Record<string, unknown>;
        if (phase === "apply") { result = { ok: true, kind: "typed-design-result", id: operation.id, createdId: null, createdIds: {} }; }
        else if (phase === "inverse") { result = { ok: true }; }
        else { result = { flatDisplaySaveGuard: { profile: prepared.binding.profile, bindingSha256: sha256Json(prepared.binding),
          observationSha256: sha256Json(applied.evidence.observation), finalSynchronousCheck: true } }; }
        journal.sequence += 1;
        journal.artifacts.push(await writePhaseArtifact(journal.operationId, journal.sequence, phase, result));
        await updateOperation(journal);
        return result;
      });
      const apply = (): Promise<Record<string, unknown>> => executor.apply({ operation, expectedContext: context, expectedFingerprint: {}, confirmWrite: true });
      if (recover) { await assert.rejects(apply(), /post-apply representation refusal/u); }
      else { const result = await apply(); assert.equal(result["state"], "applied-unsaved"); }
      assert.ok(dispatchedOperationId !== undefined);
      const original = await loadOperation(dispatchedOperationId), originalPlan = canonicalJson(original.plan);
      assert.ok(isRecord(original.plan));
      assert.equal(canonicalJson(original.plan["flatDisplay"]), canonicalJson(prepared.binding));
      if (recover) {
        assert.equal(original["state"], "apply-needs-review");
        assert.equal(original["after"], undefined); assert.equal(original["inverse"], undefined);
        const reconciled = await executor.reconcile(dispatchedOperationId);
        assert.equal(reconciled["state"], "applied-unsaved");
        assert.deepEqual(calls, ["apply"], "Reconciliation must never repeat the writer or Save.");
      }
      const ready = await loadOperation(dispatchedOperationId);
      assert.equal(canonicalJson(ready.plan), originalPlan, "Original v1 seals cannot be rewritten by reconciliation.");
      assert.equal(canonicalJson(ready["afterNative"]), canonicalJson(applied.native), "Retain the raw actual export, not the comparison copy.");
      assert.equal(canonicalJson(ready["inverse"]), canonicalJson(prepared.inverse));
      const finished = await executor[finish](dispatchedOperationId);
      assert.equal(finished["state"], finish === "commit" ? "completed" : "rolled-back");
      assert.deepEqual(calls, ["apply", finish === "commit" ? "save-reopen" : "inverse"]);
      const terminal = await loadOperation(dispatchedOperationId);
      const descriptor = terminal.artifacts?.at(-1); assert.ok(descriptor);
      assert.equal(canonicalJson(terminal.plan), originalPlan);
      const retained = await readArtifact(descriptor.path, 0, descriptor.bytes); assert.equal(retained.eof, true);
      const artifact: unknown = JSON.parse(retained.text); assert.ok(isRecord(artifact) && isRecord(artifact["persistence"]));
      const persistence = artifact["persistence"];
      if (finish === "commit") { assert.equal(persistence["documentCount"], 9); }
      else { assert.ok(isRecord(persistence["comparison"])); assert.equal(persistence["comparison"]["documentCount"], 9); }
      assert.equal(parseDocumentSource(current.native.source).objects.find((row) => row.id === "text")?.body["x"], finish === "commit" ? 290 : 280);
    }
  }
});
