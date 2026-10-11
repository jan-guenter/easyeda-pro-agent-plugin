import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { join } from "node:path";
import { test } from "node:test";
import vm from "node:vm";
import { canonicalJson } from "../src/core.ts";
import { verifyPcbTextRetainedSaveAuthority, verifyPcbTextRetainedSaveEffect } from "../src/pcb-text-retained-save.ts";
import { CREATED, fixture, phase, recolor } from "./pcb-text-retained-save-fixture.ts";

type Value = Record<string, unknown>;
interface Subject { reconcile: (id: string) => Promise<Value> }
async function harness(legacy = true): Promise<{
  subject: Subject; journal: ReturnType<typeof fixture>["journal"] & Value & { artifacts: { phase: string }[] };
  calls: string[]; phases: Map<string, unknown>; artifacts: Map<string, unknown>; config: {
    attempts: { attempted: boolean; intentCount: number; provenNotDispatchedCount: number };
    finalDrift: boolean; contextDrift: boolean; checkpointPatch: Value; inverse: boolean;
  };
}> {
  const code = await readFile(new URL("../src/design-execution.ts", import.meta.url), "utf8");
  const start = code.indexOf("  public async reconcile(");
  const end = code.indexOf("  /** Reuse the one retained successful wire lifecycle.", start);
  assert.ok(start > 0 && end > start);
  const artifacts = new Map<string, unknown>(), calls: string[] = [], value = structuredClone(fixture(legacy));
  const names = ["before", "prepared", "apply", "after", "design-save-intent", "save-reopen"];
  const phases = new Map<string, unknown>(names.map((name, index) => [name,
    [value.phases.before, value.phases.prepared, value.phases.apply, value.phases.after, value.phases.intent, value.phases.save][index]]));
  const checkpoint = { checkpoint: "/synthetic/after.eprj2", checkpointSha256: value.afterHistory.checkpointSha256,
    receiptPath: "/synthetic/after.checkpoint.json", source: value.journal.context.project.path, sourceSha256: "a".repeat(64) };
  const journal: ReturnType<typeof fixture>["journal"] & Value & { artifacts: { phase: string }[] } = {
    ...value.journal, artifacts: names.map((name) => ({ phase: name })),
    preCheckpoint: { checkpoint: "/synthetic/before.eprj2", checkpointSha256: value.beforeHistory.checkpointSha256 },
    state: "commit-needs-recovery", saved: false, reopened: false, hardStop: true, orphanedCallPossible: false,
  };
  const config = { attempts: { attempted: true, intentCount: 1, provenNotDispatchedCount: 0 },
    finalDrift: false, contextDrift: false, checkpointPatch: {} as Value, inverse: false };
  let snapshots = 0, subject: Subject | undefined;
  const engine = {
    upstream: { installedEasyedaBundles: (): Promise<Value> => { calls.push("native-identity"); return Promise.resolve({ assetsRoot: "/synthetic/assets" }); } },
    assertRecoveryOperationIsolated: (): Promise<void> => { calls.push("isolated"); return Promise.resolve(); },
    awaitProjectUploads: (): Promise<void> => { calls.push("uploads"); return Promise.resolve(); },
    checkpoint: (input: Value): Promise<Value> => {
      if (input["receiptPath"] === undefined) { calls.push("checkpoint"); return Promise.resolve(checkpoint); }
      calls.push("reverify-checkpoint");
      return Promise.resolve({ ...checkpoint, ok: true, sourceChanged: false, checkpointMatchesReceipt: true,
        sourceMatchesReceipt: true, sourceEqualsCheckpoint: true, ...config.checkpointPatch });
    },
    assertContext: (): Promise<void> => { calls.push("context"); return config.contextDrift ? Promise.reject(new Error("Synthetic context drift")) : Promise.resolve(); },
  };
  const scope = { engine, join, canonicalJson, verifyPcbTextRetainedSaveAuthority, verifyPcbTextRetainedSaveEffect,
    selectDesignPhaseDescriptor: (descriptors: { phase: string }[], name: string): { phase: string } | undefined => {
      const found = descriptors.filter((row) => row.phase === name);
      if (found.length > 1) { throw new Error("Duplicate synthetic phase"); } return found[0];
    },
    register: (instance: Subject): void => { subject = instance; },
    loadOperation: (): Promise<typeof journal> => Promise.resolve(journal), journalPayload: (input: unknown): unknown => input,
    assertTransactionTopologyAvailable: (): void => {
      // PCB has no schematic topology.
    },
    isTerminalOperation: (): boolean => false,
    inspectDesignSaveAttempts: (): Promise<typeof config.attempts> => Promise.resolve(config.attempts),
    hasDesignInverseAttempt: (): boolean => config.inverse,
    verifyNativeRuleReportProfile: (): Promise<void> => { calls.push("pcb-pin"); return Promise.resolve(); },
    verifyDeviceAssociationNativeProfile: (): Promise<void> => { calls.push("worker-pin"); return Promise.resolve(); },
    readNativeHistoryCheckpoint: (input: Value): Promise<unknown> => {
      calls.push("read-checkpoint"); assert.equal(input["documentRecordHistory"], "preserve");
      assert.equal(input["pcbTextReloadOrder"], legacy ? "preserve" : undefined);
      return Promise.resolve(input["checkpointPath"] === "/synthetic/before.eprj2" ? value.beforeHistory : value.afterHistory);
    },
    controlDataDirectory: (): string => "/synthetic",
    snapshot: (): Promise<unknown> => {
      calls.push("snapshot"); snapshots += 1;
      return Promise.resolve(phase(config.finalDrift && snapshots === 2 ? recolor(value.current, CREATED, null) : value.current));
    },
    runtime: (): Promise<void> => { calls.push("runtime"); return Promise.resolve(); },
    updateOperation: (): Promise<void> => { calls.push("update"); return Promise.resolve(); },
    summary: (input: Value): Value => structuredClone(input),
    DesignExecutor: {
      phase: (_journal: unknown, name: string): Promise<unknown> => Promise.resolve(phases.get(name)),
      artifact: (_journal: unknown, name: string, evidence: unknown): Promise<void> => {
        calls.push("artifact"); artifacts.set(name, structuredClone(evidence)); return Promise.resolve();
      },
      hasLibrarySaveEvidence: (): boolean => false,
    },
  };
  // Only I/O, checkpoint decoding, profile reads and sealed phase loading are
  // Synthetic. The maintained coordinator and both complete proof leaves run.
  // No call/prepare/navigation implementation exists in this test subject.
  vm.runInNewContext(stripTypeScriptTypes(`class Subject {
    constructor() { this.engine = engine; }
    async assertRuntime() { await runtime(); }
    async snapshot() { return snapshot(); }
    ${code.slice(start, end)}
  } register(new Subject());`), scope);
  assert.ok(subject); return { subject, journal, calls, phases, artifacts, config };
}

for (const legacy of [true, false]) {
  void test(`maintained consumed-Save recovery completes ${legacy ? "legacy" : "v2"} creation without replay or rewriting intent`, async () => {
    const run = await harness(legacy);
    const original = structuredClone(run.journal.after);
    const result = await run.subject.reconcile(run.journal.operationId);
    assert.equal(result["state"], "completed"); assert.equal(result["saved"], true); assert.equal(result["reopened"], true);
    assert.deepEqual(run.journal.after, original);
    assert.equal(run.calls.filter((item) => item === "snapshot").length, 2);
    assert.equal(run.calls.filter((item) => item === "pcb-pin").length, 2);
    assert.equal(run.calls.filter((item) => item === "worker-pin").length, 2);
    assert.deepEqual(run.calls.slice(-4), ["reverify-checkpoint", "context", "artifact", "update"]);
    const retained = run.artifacts.get("pcb-text-retained-save-reconciled"); assert.notEqual(retained, undefined);
  });
}
void test("consumed Save cannot downgrade into ordinary recovery with duplicate/cancelled intent or unsupported text action", async () => {
  for (const patch of [{ intentCount: 2 }, { provenNotDispatchedCount: 1 }]) {
    const run = await harness(); Object.assign(run.config.attempts, patch);
    await assert.rejects(run.subject.reconcile(run.journal.operationId), /exactly one consumed/u);
    assert.equal(run.calls.includes("snapshot"), false); assert.equal(run.calls.includes("update"), false);
  }
  for (const action of ["pcb.text.modify", "pcb.text.delete"]) {
    const run = await harness(); Object.assign(run.journal.plan.operation, { action });
    await assert.rejects(run.subject.reconcile(run.journal.operationId), /no maintained retained-Save/u);
    assert.deepEqual(run.calls, []);
  }
});
void test("retained Save needs the original ordered six artifacts and successful ACK before checkpoint or source reads", async () => {
  for (const mode of ["missing", "error", "identity", "order", "duplicate", "inverse"] as const) {
    const run = await harness();
    if (mode === "missing") { run.phases.delete("save-reopen"); }
    else if (mode === "error") { run.phases.set("save-reopen", { ok: false }); }
    else if (mode === "identity") { run.journal.createdId = "f".repeat(16); }
    else if (mode === "order") { run.journal.artifacts.reverse(); }
    else if (mode === "duplicate") { run.journal.artifacts.push({ phase: "save-reopen" }); }
    else { run.config.inverse = true; }
    await assert.rejects(run.subject.reconcile(run.journal.operationId));
    assert.equal(run.calls.includes("native-identity"), false); assert.equal(run.calls.includes("snapshot"), false);
    assert.equal(run.calls.includes("update"), false);
  }
});
void test("late source/context drift and false or substituted checkpoint verification cannot complete consumed Save", async () => {
  for (const patch of [{ ok: false }, { sourceChanged: true }, { checkpointMatchesReceipt: false }, { sourceMatchesReceipt: false },
    { sourceEqualsCheckpoint: false }, { sourceSha256: "f".repeat(64) }, { checkpointSha256: "f".repeat(64) },
    { checkpoint: "/synthetic/foreign" }, { receiptPath: "/synthetic/foreign" }, { source: "/synthetic/foreign" }]) {
    const run = await harness(); run.config.checkpointPatch = patch;
    await assert.rejects(run.subject.reconcile(run.journal.operationId), /durable source changed/u);
    assert.equal(run.journal["state"], "commit-needs-recovery"); assert.equal(run.calls.includes("artifact"), false);
  }
  for (const mode of ["finalDrift", "contextDrift"] as const) {
    const run = await harness(); run.config[mode] = true;
    await assert.rejects(run.subject.reconcile(run.journal.operationId));
    assert.equal(run.journal["saved"], false); assert.equal(run.calls.includes("update"), false);
  }
});
