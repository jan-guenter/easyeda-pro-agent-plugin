/* oxlint-disable import/max-dependencies -- Exercise maintained coordinator bodies with real typed preparation/effect/inverse proofs and synthetic authority, storage and dispatch boundaries. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { join } from "node:path";
import { test } from "node:test";
import vm from "node:vm";
import { OPERATION_SCHEMA, buildPlanHash, canonicalJson, isRecord, sha256Json, sha256Text } from "../src/core.ts";
import { assertDesignActionSupportedCooperatively, compileDesignAction, designActionSchema, inverseDesignActionCooperatively,
  prepareDesignActionCooperatively, verifyDesignActionCooperatively } from "../src/design-action.ts";
import type { PreparedDesignAction } from "../src/design-action.ts";
import type { NativeSourceSnapshot } from "../src/document-source.ts";
import { flatTransactionBinding } from "../src/flat-transaction-binding.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";
import { PCB_TEXT_LIFECYCLE_PROFILE, assertPcbTextCreateRetainedAuthority, assertPcbTextLifecycleAcknowledgment,
  expectedPcbTextLifecycleSource } from "../src/pcb-text-lifecycle.ts";

type RecordValue = Record<string, unknown>;
const context = { project: { uuid: "a".repeat(64), path: "/synthetic/project.eprj2" },
  document: { uuid: "d".repeat(16), documentType: 3, tabId: "fixture-tab" } };
const create = { id: "create-text", action: "pcb.text.create" as const,
  properties: { x: 95, y: 210, text: "Fixture1", fontSize: 120, strokeWidth: 8 } };
const remove = { id: "delete-text", action: "pcb.text.delete" as const, target: { primitiveId: "1".repeat(16) } };
interface Journal extends RecordValue {
  operationId: string; createdId?: string; before: NativeSourceSnapshot; after?: NativeSourceSnapshot;
  plan: { operation: typeof create | typeof remove }; inverse?: unknown;
}
interface Subject {
  apply: (input: RecordValue) => Promise<RecordValue>;
  reconcile: (operationId: string) => Promise<RecordValue>;
  rollback: (operationId: string) => Promise<RecordValue>;
}
function fixture(): { before: NativeSourceSnapshot; history: NativeHistorySnapshot } {
  const source = { schema: "easyeda-pro-control.document-source.v1" as const,
    document: { uuid: context.document.uuid, docType: "PCB", editVersion: "3.2.149.88089769" },
    objects: [{ id: "layer3", type: "LAYER", body: { layerId: 3, use: true, show: true, locked: false } }] };
  const empty = { ...source, sha256: sha256Json(source) };
  const before = expectedPcbTextLifecycleSource(create, empty, { createdId: remove.target.primitiveId });
  return { before, history: { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: context.project.uuid,
    branchUuid: "b".repeat(32), headHistoryUuid: "c".repeat(32), checkpointSha256: "e".repeat(64),
    historyRowCount: 1, chunkCount: 1, plaintextBytes: 1,
    documents: [{ uuid: context.document.uuid, docType: "PCB", metadata: before.document,
      records: before.objects.map((row) => ({ ...row, ticket: 1, client: null })), semanticSha256: before.sha256 }], semanticSha256: before.sha256 } };
}

async function harness(failure: "none" | "lost-ack" | "foreign-ack" | "wrong-primitive" = "none"): Promise<{
  subject: Subject; journal: () => Journal; phases: Map<string, unknown>; calls: string[];
  preparations: PreparedDesignAction[]; seals: Journal[]; setSource: (value: NativeSourceSnapshot) => void;
}> {
  const source = await readFile(new URL("../src/design-execution.ts", import.meta.url), "utf8");
  function slice(start: string, end: string): string {
    const from = source.indexOf(start), to = source.indexOf(end, from);
    assert.ok(from > 0 && to > from); return source.slice(from, to);
  }
  const { before, history } = fixture(), calls: string[] = [], phases = new Map<string, unknown>();
  const preparations: PreparedDesignAction[] = [], seals: Journal[] = [];
  let current = before, retained: Journal | undefined, subject: Subject | undefined;
  function journal(): Journal { assert.ok(retained); return retained; }
  function artifact(_journal: unknown, phase: string, value: unknown): Promise<void> {
    calls.push(`artifact-${phase}`); phases.set(phase, structuredClone(value)); return Promise.resolve();
  }
  const scope = {
    OPERATION_SCHEMA, PROFILE: "easyeda-pro-control.typed-design-transaction.v1", DESIGN_SAVE_ATTEMPT_PROFILE: "synthetic-save",
    structuredClone, join, buildPlanHash, canonicalJson, isRecord, sha256Text, flatTransactionBinding,
    designActionSchema, compileDesignAction, assertDesignActionSupportedCooperatively, verifyDesignActionCooperatively,
    inverseDesignActionCooperatively, assertPcbTextCreateRetainedAuthority, assertPcbTextLifecycleAcknowledgment,
    prepareDesignActionCooperatively: async (...args: Parameters<typeof prepareDesignActionCooperatively>): Promise<PreparedDesignAction> => {
      calls.push("prepare"); const value = await prepareDesignActionCooperatively(...args); preparations.push(value); return value;
    },
    register: (value: Subject): void => { subject = value; },
    snapshot: (): Promise<{ snapshot: NativeSourceSnapshot }> => { calls.push("snapshot"); return Promise.resolve({ snapshot: current }); },
    runtime: (): Promise<void> => { calls.push("runtime"); return Promise.resolve(); },
    engine: {
      executionAuthorityValidator: true,
      assertContext: (): Promise<typeof context> => Promise.resolve(context),
      assertRecoveryOperationIsolated: (): Promise<void> => Promise.resolve(),
      awaitProjectUploads: (): Promise<unknown> => { calls.push("uploads"); return Promise.resolve({ synthetic: true }); },
      checkpoint: (): Promise<{ receiptPath: string }> => { calls.push("checkpoint"); return Promise.resolve({ receiptPath: "/synthetic/checkpoint" }); },
    },
    listOperationStates: (): Promise<unknown[]> => Promise.resolve([]),
    isTerminalOperation: (): boolean => false,
    assertDesignTopologyExecutionAvailable: (): void => {
      // PCB has no schematic topology.
    },
    assertTransactionTopologyAvailable: (): void => {
      // PCB has no schematic topology.
    },
    newOperationId: (): string => "synthetic-text-operation", operationPath: (): string => "/synthetic/journal",
    controlDataDirectory: (): string => "/synthetic", journalPayload: (value: unknown): unknown => value,
    journalDurableSnapshot: (): Promise<NativeHistorySnapshot> => Promise.resolve(history),
    deriveDesignBaselineTargets: (): unknown[] => [],
    verifyDesignBaseline: (): RecordValue => ({ syntheticBoundary: true }),
    verifyDesignPersistence: (): RecordValue => { calls.push("durable-proof"); return { syntheticBoundary: true }; },
    createOperation: (value: Journal): Promise<void> => { retained = value; seals.push(structuredClone(value)); calls.push("seal"); return Promise.resolve(); },
    updateOperation: (value: Journal): Promise<void> => { seals.push(structuredClone(value)); calls.push("update"); return Promise.resolve(); },
    loadOperation: (): Promise<Journal> => Promise.resolve(journal()),
    inspectDesignSaveAttempts: (): Promise<{ attempted: boolean }> => Promise.resolve({ attempted: false }),
    hasDesignInverseAttempt: (value: RecordValue): boolean => value["inverseAttempted"] === true,
    flatEffectProof: (_journal: unknown, value: unknown): unknown => value,
    summary: (value: Journal): RecordValue => structuredClone(value),
    transactionError: (error: unknown): unknown => error,
    dispatch: async (value: Journal, phase: string, code: string): Promise<unknown> => {
      calls.push(`dispatch-${phase}`); const prepared = preparations.at(-1); assert.ok(prepared);
      assert.equal(code, prepared.code); assert.ok(prepared.expectedSource);
      if (phase === "apply") {
        assert.equal(value.createdId, prepared.createdId);
        assert.equal(seals[0]?.createdId, prepared.createdId);
        assertPcbTextLifecycleAcknowledgment(value.plan.operation, value.createdId === undefined ? {} : { createdId: value.createdId },
          value.plan.operation.action === "pcb.text.create"
            ? { ok: true, kind: "typed-design-result", id: create.id, primitiveId: value.createdId, createdId: value.createdId }
            : { ok: true, kind: "typed-design-result", id: remove.id, createdId: null, createdIds: null });
        assert.deepEqual(phases.get("prepared"), { adapterProfile: PCB_TEXT_LIFECYCLE_PROFILE, createdId: prepared.createdId ?? null,
          createdIds: null, componentCreate: null, codeSha256: sha256Text(code) });
      }
      current = prepared.expectedSource;
      value["mutationMayHaveOccurred"] = true;
      if (phase === "apply" && failure === "lost-ack") { throw new Error("Synthetic original acknowledgment lost"); }
      const acknowledgment = prepared.compiled.resultKind === "created-primitive"
        ? { ok: true, kind: "typed-design-result", id: prepared.compiled.id, primitiveId: failure === "wrong-primitive" ? "2".repeat(16) : value.createdId,
          createdId: failure === "foreign-ack" ? "2".repeat(16) : value.createdId }
        : { ok: true, kind: "typed-design-result", id: prepared.compiled.id, createdId: null, createdIds: null };
      await artifact(value, phase, acknowledgment); return acknowledgment;
    },
    DesignExecutor: { artifact, phase: (_journal: unknown, phase: string): Promise<unknown> => Promise.resolve(phases.get(phase)),
      verifyWireGroupRepairIntent: (): Promise<void> => Promise.resolve(), layoutConstructorWitness: (): Promise<void> => Promise.resolve(),
      hasLibrarySaveEvidence: (): boolean => false },
  };
  // Run the maintained apply/reconcile/rollback bodies. Only authority, disk,
  // Checkpoint materialization and transport are synthetic. This is not a live
  // Or SQLite persistence proof; their independent suites cover those seams.
  const rollbackBody = source.slice(source.indexOf("  public async rollback("), source.lastIndexOf("\n}"));
  const maintainedBodies = `
    ${slice("function state(", "interface LibraryLifecycle")}
    ${slice("function nativeState(", "type WirePageLoadAuthority")}
    ${slice("function appliedNextSafeAction(", "type LayoutRepairAuthority")}
    class Subject {
      constructor(engine) { this.engine = engine; }
      async assertRuntime() { await runtime(); }
      async snapshot() { return snapshot(); }
      async readLayoutTemplates() { return undefined; }
      async call(journal, phase, code) { return dispatch(journal, phase, code); }
      ${slice("  public async apply(", "  public static async inspect(")}
      ${slice("  public async reconcile(", "  /** Reuse the one retained successful wire lifecycle.")}
      ${rollbackBody}
    }
    register(new Subject(engine));`;
  vm.runInNewContext(stripTypeScriptTypes(maintainedBodies), scope);
  assert.ok(subject);
  return { subject, journal, phases, calls, preparations, seals, setSource: (value): void => { current = value; } };
}
function input(operation: typeof create | typeof remove): RecordValue {
  return { confirmWrite: true, operation, expectedContext: context, expectedFingerprint: {} };
}

void test("actual text-create apply reserves and seals one identity/program before dispatch and retains its exact ACK", async () => {
  const current = await harness();
  const result = await current.subject.apply(input(create));
  const journal = current.journal();
  assert.equal(result["state"], "applied-unsaved"); assert.match(journal.createdId ?? "", /^[a-f0-9]{16}$/u);
  assert.deepEqual(journal.inverse, { id: `inverse-${sha256Json(create).slice(0, 32)}`, action: "pcb.text.delete", target: { primitiveId: journal.createdId } });
  assert.equal(current.preparations.length, 1);
  assert.equal(current.calls.filter((entry) => entry.startsWith("dispatch")).length, 1);
  assert.ok(current.calls.indexOf("seal") < current.calls.indexOf("artifact-prepared"));
  assert.ok(current.calls.indexOf("artifact-prepared") < current.calls.indexOf("dispatch-apply"));
  assert.ok(current.calls.indexOf("artifact-apply") < current.calls.indexOf("artifact-after"));
});

void test("lost text-create ACK reconciles only original reserved identity without preparation or dispatch replay", async () => {
  const current = await harness("lost-ack");
  await assert.rejects(current.subject.apply(input(create)), /acknowledgment lost/u);
  const identity = current.journal().createdId;
  assert.equal(current.journal()["state"], "apply-needs-review"); assert.equal(current.phases.has("apply"), false);
  const result = await current.subject.reconcile(current.journal().operationId);
  assert.equal(result["state"], "applied-unsaved"); assert.equal(current.journal().createdId, identity);
  assert.equal(current.phases.has("apply"), false); assert.equal(current.preparations.length, 1);
  assert.equal(current.calls.filter((entry) => entry.startsWith("dispatch")).length, 1);
  assert.deepEqual(current.journal().inverse, { id: `inverse-${sha256Json(create).slice(0, 32)}`, action: "pcb.text.delete", target: { primitiveId: identity } });
});

void test("foreign creation identity/primitive ACK stays retained and cannot gain reconciliation authority", async () => {
  for (const failure of ["foreign-ack", "wrong-primitive"] as const) {
    const current = await harness(failure);
    await assert.rejects(current.subject.apply(input(create)));
    const acknowledgment = structuredClone(current.phases.get("apply")), original = current.journal().createdId;
    await assert.rejects(current.subject.reconcile(current.journal().operationId));
    assert.equal(current.journal().createdId, original); assert.deepEqual(current.phases.get("apply"), acknowledgment);
    assert.equal(current.preparations.length, 1); assert.equal(current.calls.filter((entry) => entry.startsWith("dispatch")).length, 1);
  }
});

void test("creation recovery refuses missing/foreign preparation, identity, collateral source and pending orphan", async () => {
  for (const failure of ["missing", "profile", "identity", "code", "journal-id", "collateral", "orphan"] as const) {
    const current = await harness("lost-ack"); await assert.rejects(current.subject.apply(input(create)));
    const prepared = current.phases.get("prepared"); assert.ok(isRecord(prepared));
    if (failure === "missing") { current.phases.delete("prepared"); }
    else if (failure === "profile") { current.phases.set("prepared", { ...prepared, adapterProfile: "foreign" }); }
    else if (failure === "identity") { current.phases.set("prepared", { ...prepared, createdId: "2".repeat(16) }); }
    else if (failure === "code") { current.phases.set("prepared", { ...prepared, codeSha256: "missing" }); }
    else if (failure === "journal-id") { delete current.journal().createdId; }
    else if (failure === "orphan") { current.journal()["orphanedCallPossible"] = true; }
    else {
      const expected = current.preparations[0]?.expectedSource; assert.ok(expected);
      const objects = structuredClone(expected.objects);
      const peer = objects.find((row) => row.id === remove.target.primitiveId); assert.ok(peer); peer.body["x"] = 96;
      const source = { schema: expected.schema, document: expected.document, objects };
      current.setSource({ ...source, sha256: sha256Json(source) });
    }
    await assert.rejects(current.subject.reconcile(current.journal().operationId));
    assert.equal(current.preparations.length, 1); assert.equal(current.calls.filter((entry) => entry.startsWith("dispatch")).length, 1);
  }
});

void test("creation inverse dispatches one deletion of original ID and deletion itself has no inverse", async () => {
  const creation = await harness(); await creation.subject.apply(input(create));
  const original = creation.journal().createdId;
  const result = await creation.subject.rollback(creation.journal().operationId);
  assert.equal(result["state"], "rolled-back");
  assert.equal(creation.preparations.length, 2);
  assert.equal(creation.preparations[1]?.compiled.action, "pcb.text.delete");
  assert.equal(creation.preparations[1]?.createdId, undefined); assert.equal(creation.journal().createdId, original);
  assert.deepEqual(creation.preparations[1]?.expectedSource, creation.journal().before);
  assert.equal(creation.calls.filter((entry) => entry === "dispatch-inverse").length, 1);
  assert.equal(creation.calls.filter((entry) => entry === "durable-proof").length, 1);
  await assert.rejects(creation.subject.rollback(creation.journal().operationId), /already attempted/u);
  const deletion = await harness(); await deletion.subject.apply(input(remove));
  assert.equal(deletion.journal().inverse, undefined); assert.equal(deletion.journal().createdId, undefined);
  const calls = [...deletion.calls];
  await assert.rejects(deletion.subject.rollback(deletion.journal().operationId), /no safely dispatchable inverse/u);
  assert.deepEqual(deletion.calls, calls);
});
