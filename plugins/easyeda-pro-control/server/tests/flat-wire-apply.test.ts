/* oxlint-disable import/max-dependencies -- Exercise actual apply/reconcile/commit/inverse coordinators against isolated encrypted SQLite history and explicit native read/dispatch seams. */
import assert from "node:assert/strict";
import { mkdtemp, rename } from "node:fs/promises";
import { basename, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { controlDataDirectory, loadOperation, readArtifact, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
import { canonicalJson, isRecord, sha256Json } from "../src/core.ts";
import { createCheckpoint } from "../src/checkpoint.ts";
import { DesignExecutor } from "../src/design-execution.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import { EasyedaControlEngine } from "../src/engine.ts";
import type { DispatchOperationJournal } from "../src/engine.ts";
import { prepareFlatWireProfile } from "../src/flat-wire-profile.ts";
import { readNativeHistoryCheckpoint } from "../src/native-history.ts";
import type { FlatDisplayObservationEvidence } from "../src/schematic-flat-read.ts";
import { schematicNativeSnapshotHash } from "../src/schematic-native-adapter.ts";
import { context as fixtureContext } from "./flat-display-fixture.ts";
import { flatWireFixture, wireOperation as operation, wireAfter } from "./flat-wire-fixture.ts";
import { storedFlatFixture } from "./flat-display-sqlite-fixture.ts";

type Fixture = ReturnType<typeof flatWireFixture>;
interface Snapshot { payload: Record<string, unknown>; snapshot: ReturnType<typeof parseDocumentSource>; native: Fixture["native"] }

async function retainUnfinishedFixture(journal: Record<string, unknown>, directory: string): Promise<void> {
  const path = journal["journalPath"]; assert.equal(typeof path, "string"); assert.ok(typeof path === "string");
  await rename(path, join(directory, "unfinished-journal.json"));
}

void test("actual flat wire apply and same sealed-profile reconciliation accept exporter encoding before exact commit or inverse, with no replay", async (t) => {
  const root = controlDataDirectory();
  assert.ok(basename(root).startsWith("easyeda-test-control-"), "Never use real control storage for synthetic journals.");
  for (const recover of [false, true]) {
    for (const finish of ["rollback", "commit", "refused-rollback", "failed-inverse", "live-only-inverse", "dispatch-race", "dispatch-unchanged", "hard-stopped"] as const) {
      await t.test(`${recover ? "reconciled" : "direct"} ${finish}`, async () => {
      const directory = await mkdtemp(join(root, "flat-apply-encoding-"));
      const before = await storedFlatFixture(flatWireFixture(), directory, "before");
      const context = { ...fixtureContext, project: { ...fixtureContext.project, path: before.evidence.checkpoint.checkpoint } };
      before.evidence.checkpoint.source = context.project.path;
      const actualDispatch = finish === "dispatch-race" || finish === "dispatch-unchanged";
      if (actualDispatch) { const checkpoint = await createCheckpoint({ source: context.project.path,
        outputDir: join(root, "checkpoints"), label: "flat-inverse-boundary" });
        const history = await readNativeHistoryCheckpoint({ checkpointPath: checkpoint.checkpoint,
          expectedSha256: checkpoint.checkpointSha256, projectUuid: context.project.uuid });
        before.evidence = { ...before.evidence, checkpoint, history }; }
      const prepared = await prepareFlatWireProfile({ ...before, context, operation });
      const persistedApplied = await storedFlatFixture(wireAfter(before, prepared.expectedSource, prepared.expectedNative), directory, "applied");
      const applied = finish === "commit" || finish === "refused-rollback" ? persistedApplied : { ...persistedApplied,
        evidence: { ...before.evidence, observation: persistedApplied.evidence.observation, proof: persistedApplied.evidence.proof } };
      const restored = await storedFlatFixture(wireAfter(before, parseDocumentSource(before.native.source), before.native), directory, "restored");
      assert.notEqual(schematicNativeSnapshotHash(applied.native), prepared.binding.after.nativeSha256);
      let current = before, refuseOriginalAfterObservation = recover;
      const calls: string[] = [];
      const engine = new EasyedaControlEngine({ callTool: (): Promise<unknown> => {
        assert.equal(finish, "dispatch-unchanged", "Changed SQLite must refuse before upstream callTool.");
        calls.push("inverse"); current = restored;
        return Promise.resolve({ content: [{ type: "text", text: JSON.stringify({ success: true, result: { ok: true } }) }] });
      } },
        { executionAuthorityValidator: { capture: (): Promise<never> => Promise.reject(new Error("Synthetic dispatch seam must not capture live authority.")),
          proveTerminated: (): Promise<never> => Promise.reject(new Error("No process actions in coordinator fixture.")) } });
      await engine.controlFingerprintPromise;
      t.mock.method(engine, "assertContext", (): Promise<typeof context> => Promise.resolve(context));
      t.mock.method(engine, "awaitProjectUploads", (): Promise<Record<string, unknown>> => Promise.resolve({ scheduledWritesSettled: true }));
      t.mock.method(engine, "assertRecoveryOperationIsolated", (): Promise<true> => Promise.resolve(true));
      t.mock.method(engine, "checkpoint", (): Promise<unknown> => Promise.resolve(current.evidence.checkpoint));
      t.mock.method(engine, "rebindAfterLifecycle", (): Promise<typeof context> => Promise.resolve(context));
      let authorityChecks = 0;
      t.mock.method(engine, "markOrphanedCallRisk", (): ReturnType<typeof engine.markOrphanedCallRisk> => {
        authorityChecks += 1;
        if (finish === "dispatch-race") {
          const forward = new DatabaseSync(persistedApplied.evidence.checkpoint.checkpoint, { readOnly: true });
          let data: string;
          try { const row = forward.prepare("SELECT dataStr FROM history_data").get();
            assert.ok(typeof row?.["dataStr"] === "string"); data = row["dataStr"]; }
          finally { forward.close(); }
          const database = new DatabaseSync(context.project.path);
          try { database.prepare("UPDATE history_data SET dataStr=?").run(data); }
          finally { database.close(); }
        }
        return Promise.resolve({ ownedByAuthenticatedScope: true, binding: { schema: "easyeda-pro-control.bridge-dispatch-lease.v1",
          begunAtEpochMs: 1, bindingReceipt: "synthetic", gatewayInstanceId: "synthetic", leaseId: "synthetic", sessionId: "synthetic", sessionSequence: 1 } });
      });
      t.mock.method(engine, "clearOrphanedCallRisk", (): Promise<void> => Promise.resolve());
      const executor = new DesignExecutor(engine);
      // Generated writer and authority guards have separate runtime tests.
      // Only native observation/dispatch are replaced; the full coordinator,
      // Original flat-wire seals, artifact retention and durable proofs run unchanged.
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
      const originalCall = seams.call.bind(executor);
      t.mock.method(seams, "call", async (journal: DispatchOperationJournal, phase: string, code: string): Promise<unknown> => {
        if (actualDispatch && phase === "inverse") { return originalCall(journal, phase, code); }
        calls.push(phase); dispatchedOperationId = journal.operationId;
        current = applied;
        if (phase === "inverse" && finish !== "failed-inverse") { current = finish === "live-only-inverse" ?
          { ...restored, evidence: { ...persistedApplied.evidence, observation: restored.evidence.observation, proof: restored.evidence.proof } } : restored; }
        let result: Record<string, unknown>;
        if (phase === "apply") { result = { ok: true, kind: "typed-design-result", id: operation.id, createdId: null }; }
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
      assert.equal(canonicalJson(original.plan["flatWire"]), canonicalJson(prepared.binding));
      if (recover) {
        assert.equal(original["state"], "apply-needs-review");
        assert.equal(original["after"], undefined); assert.equal(original["inverse"], undefined);
        const reconciled = await executor.reconcile(dispatchedOperationId);
        assert.equal(reconciled["state"], "applied-unsaved");
        assert.deepEqual(calls, ["apply"], "Reconciliation must never repeat the writer or Save.");
      }
      const ready = await loadOperation(dispatchedOperationId);
      assert.equal(canonicalJson(ready.plan), originalPlan, "Original flat-wire seals cannot be rewritten by reconciliation.");
      assert.equal(canonicalJson(ready["afterNative"]), canonicalJson(applied.native), "Retain the raw actual export, not the comparison copy.");
      assert.equal(canonicalJson(ready["inverse"]), canonicalJson(prepared.inverse));
      const verification = ready.artifacts?.find((entry) => entry.path.endsWith(`flat-${recover ? "reconcile" : "apply"}-verification.json`));
      assert.ok(verification);
      const verifiedRead = await readArtifact(verification.path, 0, verification.bytes);
      const verified: unknown = JSON.parse(verifiedRead.text); assert.ok(isRecord(verified));
      assert.equal(canonicalJson(verified["checkpoint"]), canonicalJson(applied.evidence.checkpoint));
      assert.equal(canonicalJson(verified["observation"]), canonicalJson(applied.evidence.observation));
      assert.equal(canonicalJson(verified["topologyProof"]), canonicalJson(applied.evidence.proof));
      assert.equal(verified["observationSha256"], sha256Json(applied.evidence.observation));
      assert.equal(verified["compiledTopology"], false);
      assert.ok(isRecord(verified["durability"]));
      assert.equal(verified["durability"]["classification"], finish === "commit" || finish === "refused-rollback" ? "exact-intended-effect" : "unchanged-baseline");
      const summary = await DesignExecutor.inspect(dispatchedOperationId); assert.ok(isRecord(summary["inverse"]));
      assert.equal(summary["inverse"]["available"], finish !== "commit" && finish !== "refused-rollback");
      if (finish === "hard-stopped") {
        ready["hardStop"] = true; await updateOperation(ready);
        const stopped = await DesignExecutor.inspect(dispatchedOperationId); assert.ok(isRecord(stopped["inverse"]));
        assert.equal(stopped["inverse"]["available"], false);
        await assert.rejects(executor.rollback(dispatchedOperationId), /no safely dispatchable inverse/u);
        assert.deepEqual(calls, ["apply"]);
        await retainUnfinishedFixture(ready, directory);
        return;
      }
      if (finish === "dispatch-race") {
        await assert.rejects(executor.rollback(dispatchedOperationId), /durable baseline changed immediately before dispatch/u);
        assert.equal(authorityChecks, 1); assert.deepEqual(calls, ["apply"]);
        const refused = await loadOperation(dispatchedOperationId);
        assert.equal(refused["inverseAttempted"], true);
        await assert.rejects(executor.rollback(dispatchedOperationId), /inverse was already attempted/u);
        await retainUnfinishedFixture(refused, directory);
        return;
      }
      if (finish === "refused-rollback") {
        await assert.rejects(executor.rollback(dispatchedOperationId), /forward effect already persisted/u);
        const refused = await loadOperation(dispatchedOperationId);
        assert.equal(refused["state"], "applied-unsaved");
        assert.equal(refused.artifacts?.some((entry) => /-(?:inverse|flat-inverse-prepared|design-inverse-intent)\.json$/u.test(entry.path)), false);
        assert.deepEqual(calls, ["apply"]);
        // Preserve this intentionally unfinished synthetic case outside the
        // Active test registry so the next independent case is not quarantined.
        await retainUnfinishedFixture(refused, directory);
        return;
      }
      if (finish === "failed-inverse" || finish === "live-only-inverse") {
        await assert.rejects(executor.rollback(dispatchedOperationId), finish === "failed-inverse" ? /Inverse did not restore/u : /unrequested record/u);
        const failed = await loadOperation(dispatchedOperationId);
        assert.equal(failed["state"], "inverse-needs-recovery");
        assert.equal(failed["inverseAttempted"], true);
        assert.equal(failed.artifacts?.some((entry) => entry.path.endsWith("-design-inverse-intent.json")), true);
        if (finish === "failed-inverse") {
          // Runtime rebind changes the visible state but not retained attempts.
          failed["state"] = "runtime-rebound-needs-reconciliation"; await updateOperation(failed);
          const reconciled = await executor.reconcile(dispatchedOperationId); assert.equal(reconciled["state"], "applied-unsaved");
        } else { await assert.rejects(executor.reconcile(dispatchedOperationId), /unrequested record/u); }
        await assert.rejects(executor.rollback(dispatchedOperationId), /inverse was already attempted/u);
        await assert.rejects(executor.commit(dispatchedOperationId), /inverse was already attempted/u);
        assert.deepEqual(calls, ["apply", "inverse"]);
        const recovered = await loadOperation(dispatchedOperationId); assert.equal(canonicalJson(recovered.plan), originalPlan);
        await retainUnfinishedFixture(failed, directory);
        return;
      }
      const finished = finish === "commit" ? await executor.commit(dispatchedOperationId) : await executor.rollback(dispatchedOperationId);
      if (actualDispatch) { assert.equal(authorityChecks, 1); }
      assert.equal(finished["state"], finish === "commit" ? "completed" : "rolled-back");
      assert.deepEqual(calls, ["apply", finish === "commit" ? "save-reopen" : "inverse"]);
      const terminal = await loadOperation(dispatchedOperationId);
      const descriptor = terminal.artifacts?.at(-1); assert.ok(descriptor);
      assert.equal(canonicalJson(terminal.plan), originalPlan);
      const retained = await readArtifact(descriptor.path, 0, descriptor.bytes); assert.equal(retained.eof, true);
      const artifact: unknown = JSON.parse(retained.text); assert.ok(isRecord(artifact) && isRecord(artifact["persistence"]));
      const persistence = artifact["persistence"];
      if (finish === "commit") { assert.equal(persistence["documentCount"], 3); }
      else { assert.ok(isRecord(persistence["comparison"])); assert.equal(persistence["comparison"]["documentCount"], 3); }
      assert.equal(parseDocumentSource(current.native.source).objects.find((row) => row.id === "line0")?.body["endX"], finish === "commit" ? 15 : 10);
      });
    }
  }
});
