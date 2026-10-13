import { configureTestControlRoot } from "./test-control-root.ts";
import assert from "node:assert/strict";
import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, afterEach, before, test } from "node:test";
import { OPERATION_SCHEMA, buildPlanHash, isRecord, operationSummary } from "../src/core.ts";
import type { controlRootCapability, createOperation, ensureOperationStorage, listOperationStates, listOperations, loadOperation, operationPath, scanOperations, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
import type { EasyedaControlEngine } from "../src/engine.ts";
import type { UnknownRecord } from "../src/core.ts";

let artifacts: {
  controlRootCapability: typeof controlRootCapability; createOperation: typeof createOperation;
  ensureOperationStorage: typeof ensureOperationStorage; listOperationStates: typeof listOperationStates;
  listOperations: typeof listOperations; loadOperation: typeof loadOperation; operationPath: typeof operationPath;
  scanOperations: typeof scanOperations; updateOperation: typeof updateOperation; writePhaseArtifact: typeof writePhaseArtifact;
};
let engineModule: { EasyedaControlEngine: typeof EasyedaControlEngine };
let directory: string;
const previousDirectory = process.env["EASYEDA_CONTROL_DATA_DIR"];

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "easyeda-operation-scan-test-"));
  configureTestControlRoot(directory);
  artifacts = await import("../src/artifacts.ts");
  engineModule = await import("../src/engine.ts");
  await artifacts.ensureOperationStorage();
});
afterEach(async () => {
  const operations = join(directory, "operations");
  for (const name of await readdir(operations)) {
    await rm(join(operations, name), { recursive: true, force: true });
  }
});
after(async () => {
  const capability = await artifacts.controlRootCapability();
  await capability.close();
  if (previousDirectory === undefined) { configureTestControlRoot(); }
  else { configureTestControlRoot(previousDirectory); }
  await rm(directory, { recursive: true, force: true });
});

async function journal(id: string, overrides: UnknownRecord = {}): Promise<void> {
  const plan = { name: "Synthetic scan fixture", expectedFingerprint: { fixture: true } };
  await artifacts.createOperation({
    schema: OPERATION_SCHEMA, operationId: id, plan, planHash: buildPlanHash(plan),
    state: "completed", mutationState: "after", saved: true, reopened: true,
    hardStop: false, mutationMayHaveOccurred: false, nextSafeAction: "Preserve evidence.",
    journalPath: artifacts.operationPath(id), updatedAt: "2026-01-01T00:00:00Z", artifacts: [],
    before: { objects: [{ payload: "Unrelated full source must not enter compact results." }] },
    ...overrides,
  });
}

async function engine(): Promise<InstanceType<typeof engineModule.EasyedaControlEngine>> {
  const result = new engineModule.EasyedaControlEngine({
    callTool(): Promise<never> { return Promise.reject(new Error("Synthetic fixture forbids bridge calls.")); },
  });
  await result.controlFingerprintPromise;
  return result;
}

void test("operation scan preserves full-list compatibility and projects every sorted journal once", async () => {
  await journal("easyeda-scan-b");
  await journal("easyeda-scan-a", { state: "applied-unsaved" });
  const full = await artifacts.listOperations();
  assert.deepEqual(full, [await artifacts.loadOperation("easyeda-scan-a"), await artifacts.loadOperation("easyeda-scan-b")]);
  const visited: unknown[] = [];
  const selected = await artifacts.scanOperations((entry) => {
    visited.push(entry["operationId"]);
    return entry["state"] === "completed" ? entry["operationId"] : undefined;
  });
  assert.deepEqual(visited, ["easyeda-scan-a", "easyeda-scan-b"]);
  assert.deepEqual(selected, ["easyeda-scan-b"]);
  assert.deepEqual(await artifacts.listOperationStates(), full.map((entry) => ({ operationId: entry.operationId, state: entry["state"] })));
});

void test("operation scan does not turn projector failures into unreadable journals", async () => {
  await journal("easyeda-scan-projection");
  const failure = new Error("Exact projector failure");
  await assert.rejects(artifacts.scanOperations(() => { throw failure; }), (error: unknown) => error === failure);
  const retained = await artifacts.loadOperation("easyeda-scan-projection");
  assert.equal(retained["state"], "completed");
});

void test("operation scan preserves unreadable records and catches late corrupt phase artifacts before dispatch", async () => {
  await journal("easyeda-scan-a");
  await journal("easyeda-scan-z");
  const phase = await artifacts.writePhaseArtifact("easyeda-scan-z", 1, "before", { exact: "original" });
  const last = await artifacts.loadOperation("easyeda-scan-z");
  await artifacts.updateOperation({ ...last, artifacts: [phase] });
  await writeFile(phase.path, "changed phase", { mode: 0o600 });
  await writeFile(artifacts.operationPath("easyeda-scan-broken"), "{broken", { mode: 0o600 });
  const full = await artifacts.listOperations();
  assert.deepEqual(await artifacts.scanOperations((entry) => entry), full);
  assert.deepEqual(full.map((entry) => entry["state"]), ["completed", "journal-unreadable", "journal-unreadable"]);
  const scanned = await artifacts.listOperationStates();
  assert.deepEqual(scanned, full.map((entry) => ({ operationId: entry["operationId"], state: entry["state"] })));
  const control = await engine();
  let downstreamCalls = 0;
  await assert.rejects(async () => {
    await control.assertBridgeDispatchAllowed();
    downstreamCalls += 1;
  }, /quarantined/u);
  assert.equal(downstreamCalls, 0);
});

void test("streaming recovery preserves full summary fields and explicit-false legacy orphan semantics", async () => {
  await journal("easyeda-scan-legacy", { state: "saving", orphanedCallPossible: false, saved: false, reopened: false,
    unknownPhase: "save", runtimeRestartBoundary: { fixture: true }, lastError: { name: "Error", message: "Retained failure" },
    preCheckpoint: { receiptPath: "/fixture/before.json", checkpointSha256: "a".repeat(64) } });
  const phase = await artifacts.writePhaseArtifact("easyeda-scan-legacy", 1, "before", { exact: true });
  const legacy = await artifacts.loadOperation("easyeda-scan-legacy");
  await artifacts.updateOperation({ ...legacy, artifacts: [phase] });
  const control = await engine();
  assert.equal(await control.assertBridgeDispatchAllowed(), true);
  const expected = operationSummary(await artifacts.loadOperation("easyeda-scan-legacy"));
  assert.deepEqual(await control.recover(), [expected]);
  assert.equal(expected.artifacts.count, 1);
  const pending = await artifacts.loadOperation("easyeda-scan-legacy");
  delete pending["orphanedCallPossible"];
  await artifacts.updateOperation(pending);
  await assert.rejects(control.assertBridgeDispatchAllowed(), /quarantined/u);
  const summaries = await control.recover();
  const summary = summaries[0];
  assert.ok(isRecord(summary));
  assert.equal(summary.orphanedCallPossible, true);
});

void test("streaming recovery isolation still checks orphan risk on terminal peer journals", async () => {
  await journal("easyeda-scan-target", { state: "applied-unsaved", orphanedCallPossible: false });
  const control = await engine();
  assert.equal(await control.assertRecoveryOperationIsolated("easyeda-scan-target"), true);
  await journal("easyeda-scan-peer", { orphanedCallPossible: true, orphanedCallPhase: "apply" });
  await assert.rejects(control.assertRecoveryOperationIsolated("easyeda-scan-target"), /not isolated/u);
  await assert.rejects(control.assertBridgeDispatchAllowed(), /quarantined/u);
});
