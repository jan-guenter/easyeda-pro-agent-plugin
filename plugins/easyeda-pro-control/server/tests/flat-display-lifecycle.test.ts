/* oxlint-disable import/max-dependencies -- Coordinator regressions compose real sealed journals, encrypted SQLite history and complete flat storage proofs with isolated runtime seams. */
import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { basename, join } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { controlDataDirectory, createOperation, loadOperation, operationPath, readArtifact, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, isRecord, newOperationId, sha256Json } from "../src/core.ts";
import { DesignExecutor } from "../src/design-execution.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import { EasyedaControlEngine } from "../src/engine.ts";
import { prepareFlatDisplayProfile, verifyFlatDisplayMembershipTopology, verifyFlatDisplayObservation } from "../src/flat-display-profile.ts";
import type { FlatDisplayObservationEvidence } from "../src/schematic-flat-read.ts";
import { context, rehash } from "./flat-display-fixture.ts";
import { nativeFormatAfter, nativeFormatFixture, nativeFormatOperation as operation } from "./flat-display-native-fixture.ts";
import { storedFlatFixture as storedFixture } from "./flat-display-sqlite-fixture.ts";

type Fixture = ReturnType<typeof nativeFormatFixture>;
interface Snapshot { payload: Record<string, unknown>; snapshot: ReturnType<typeof parseDocumentSource>; native: Fixture["native"] }
type Phase = "before" | "after";
type Action = "commit" | "rollback" | "reconcile" | "saved-reconcile";

async function coordinator(t: TestContext, action: Action, drift: "none" | "meta" | "peer"): Promise<void> {
  const root = controlDataDirectory();
  assert.ok(basename(root).startsWith("easyeda-test-control-"), "Coordinator fixtures require the isolated test preload.");
  const directory = await mkdtemp(join(root, "flat-lifecycle-"));
  const before = await storedFixture(nativeFormatFixture(), directory, "before");
  const prepared = await prepareFlatDisplayProfile({ ...before, context, operation });
  const applied = await storedFixture(nativeFormatAfter(before, prepared.expectedSource, prepared.expectedNative), directory, "applied");
  const restored = nativeFormatAfter(before, parseDocumentSource(before.native.source), before.native);
  const final = structuredClone(action === "commit" || action === "saved-reconcile" ? applied : restored);
  if (drift !== "none") {
    const documents = structuredClone(final.evidence.history.documents);
    const row = documents.find((document) => document.uuid === (drift === "meta" ? "page" : "peer5"))?.records.find((record) => record.id === "META");
    assert.ok(row); row.body["title"] = "Unrequested durable change";
    final.evidence = { ...final.evidence, history: rehash({ ...final.evidence.history, documents }) };
  }
  const persisted = await storedFixture(final, directory, "final");
  const operationId = newOperationId();
  const plan = { profile: "easyeda-pro-control.typed-design-transaction.v1", expectedContext: context, expectedFingerprint: {},
    operation: prepared.operation, flatDisplay: prepared.binding, expectedTopology: prepared.binding.topology };
  await createOperation({ schema: OPERATION_SCHEMA, operationId, journalPath: operationPath(operationId), plan, planHash: buildPlanHash(plan),
    state: action === "reconcile" ? "apply-needs-review" : "applied-unsaved", mutationState: "after", saved: false, reopened: false,
    saveAttemptProtocol: "easyeda-pro-control.design-save-attempt.v1", orphanedCallPossible: false, hardStop: action === "reconcile", mutationMayHaveOccurred: true,
    nextSafeAction: "Synthetic coordinator test.", context, before: parseDocumentSource(before.native.source), beforeNative: before.native,
    after: prepared.expectedSource, afterNative: applied.native, inverse: prepared.inverse, createdIds: {}, beforeTopology: prepared.binding.topology,
    preCheckpoint: before.evidence.checkpoint, sequence: 0, artifacts: [] });
  if (action === "saved-reconcile") {
    const hash = "a".repeat(64), journal = await loadOperation(operationId);
    const bindingSha256 = sha256Json(prepared.binding), observationSha256 = sha256Json(applied.evidence.observation);
    const phases: readonly [string, unknown][] = [
      ["after", { snapshot: prepared.expectedSource, native: applied.native, payload: { source: applied.native.source,
        read_consistency: { stable: true, attempts: 2, snapshotSha256: hash } } }],
      ["flat-save-prepared", { flatBindingSha256: bindingSha256, observationSha256 }],
      ["save-reopen", { ok: true, saved: true, closed: true, reopened: true, document: context.document,
        exactSaveGuard: { passes: 2, labels: ["schematic-source"], snapshotSha256: [hash], saveInvokedInSameExecution: true, publicCompareAndSwapAvailable: false },
        closeProof: { profile: "easyeda-pro-control.native-document-close.v1", closeCalls: 1, terminalNotification: true, oldFrameRemoved: true, oldTabRemoved: true, saved: false },
        openProof: { profile: "easyeda-pro-control.native-document-open.v1", tabId: context.document.tabId, newFrameReady: true, exactContext: true, readinessSamples: 2, activated: true },
        projectUploadBarrier: { profile: "easyeda-pro-control.project-upload-barrier.v1", projectUuid: context.project.uuid, scheduledWritesSettled: true, savedEditorChanges: false },
        flatDisplaySaveGuard: { profile: prepared.binding.profile, bindingSha256, observationSha256, finalSynchronousCheck: true } }],
    ];
    assert.ok(journal.artifacts);
    let sequence = 0;
    for (const [phase, value] of phases) {
      sequence += 1;
      journal.artifacts.push(await writePhaseArtifact(operationId, sequence, phase, value));
    }
    journal["sequence"] = sequence; journal["state"] = "commit-needs-recovery"; journal["hardStop"] = true;
    await updateOperation(journal);
  }
  const engine = new EasyedaControlEngine({ callTool: (): Promise<never> => Promise.reject(new Error("No live calls in this fixture.")) });
  await engine.controlFingerprintPromise;
  t.mock.method(engine, "awaitProjectUploads", (): Promise<Record<string, unknown>> => Promise.resolve({ scheduledWritesSettled: true }));
  t.mock.method(engine, "assertRecoveryOperationIsolated", (): Promise<true> => Promise.resolve(true));
  t.mock.method(engine, "checkpoint", (): Promise<unknown> => Promise.resolve(persisted.evidence.checkpoint));
  t.mock.method(engine, "rebindAfterLifecycle", (): Promise<typeof context> => Promise.resolve(context));
  const executor = new DesignExecutor(engine);
  // These tests own only coordinator/persistence wiring. Generated native
  // Programs and authority capture have separate adversarial runtime tests.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Test-only private read/dispatch seams, never a public authority bypass.
  const seams = executor as unknown as { assertRuntime: () => Promise<void>; snapshot: () => Promise<Snapshot>;
    flatEvidence: (journal: unknown, current: Snapshot, phase: Phase, lifecycle?: boolean) => Promise<FlatDisplayObservationEvidence>;
    call: (journal: unknown, phase: string, code: string) => Promise<unknown> };
  let current = action === "reconcile" || action === "saved-reconcile" ? persisted : applied;
  const calls: string[] = [];
  t.mock.method(seams, "assertRuntime", (): Promise<void> => Promise.resolve());
  t.mock.method(seams, "snapshot", (): Promise<Snapshot> => Promise.resolve({ payload: { read_consistency: { snapshotSha256: "a".repeat(64) } },
    snapshot: parseDocumentSource(current.native.source), native: current.native }));
  t.mock.method(seams, "flatEvidence", (_journal: unknown, snapshot: Snapshot, phase: Phase, lifecycle = false): Promise<FlatDisplayObservationEvidence> => {
    if (lifecycle) { verifyFlatDisplayMembershipTopology(prepared.binding, operation, context, current.evidence, snapshot.native); }
    else { verifyFlatDisplayObservation(prepared.binding, operation, context, current.evidence, snapshot.native, phase); }
    return Promise.resolve(current.evidence);
  });
  t.mock.method(seams, "call", (_journal: unknown, phase: string): Promise<unknown> => {
    calls.push(phase); current = persisted;
    return Promise.resolve(phase === "inverse" ? { ok: true } : { flatDisplaySaveGuard: { profile: prepared.binding.profile,
      bindingSha256: sha256Json(prepared.binding), observationSha256: sha256Json(applied.evidence.observation), finalSynchronousCheck: true } });
  });
  const invoke = (): Promise<Record<string, unknown>> => executor[action === "saved-reconcile" ? "reconcile" : action](operationId);
  if (drift === "none") {
    const result = await invoke();
    assert.equal(result["state"], { commit: "completed", rollback: "rolled-back", reconcile: "reconciled-no-mutation", "saved-reconcile": "completed" }[action]);
    const retained = await loadOperation(operationId);
    const descriptor = retained.artifacts?.at(-1); assert.ok(descriptor);
    const read = await readArtifact(descriptor.path, 0, descriptor.bytes); assert.equal(read.eof, true);
    const artifact: unknown = JSON.parse(read.text); assert.ok(isRecord(artifact));
    if (action === "commit" || action === "saved-reconcile") {
      assert.ok(isRecord(artifact["flatMaterialization"])); assert.equal(artifact["flatMaterialization"]["comparisonOnly"], true);
      if (action === "saved-reconcile") { assert.equal(artifact["saveDispatchedByRecovery"], false); assert.equal(artifact["navigationDispatchedByRecovery"], false); }
    }
    else {
      const body = action === "rollback" ? artifact : artifact["durableNoMutation"]; assert.ok(isRecord(body));
      const persistence = body["persistence"]; assert.ok(isRecord(persistence));
      assert.equal(persistence["schema"], "easyeda-pro-control.flat-display-restoration.v1");
    }
  } else {
    await assert.rejects(invoke());
    const retained = await loadOperation(operationId);
    assert.ok(typeof retained["state"] === "string" && !["completed", "rolled-back", "reconciled-no-mutation"].includes(retained["state"]));
  }
  assert.deepEqual(calls, action === "reconcile" || action === "saved-reconcile" ? [] : [action === "commit" ? "save-reopen" : "inverse"]);
}

for (const action of ["commit", "rollback", "reconcile", "saved-reconcile"] as const) {
  for (const drift of ["none", "meta", "peer"] as const) {
    void test(`real-format ${action} coordinator retains complete proof and rejects durable ${drift} drift`, async (t) => { await coordinator(t, action, drift); });
  }
}
