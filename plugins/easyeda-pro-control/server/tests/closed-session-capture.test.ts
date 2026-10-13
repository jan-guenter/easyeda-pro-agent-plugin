import assert from "node:assert/strict";
import { test } from "node:test";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { EasyedaControlEngine } from "../src/engine.ts";
import { createOperation, loadOperation, updateOperation } from "../src/artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash } from "../src/core.ts";
import type { AuthenticatedBridgeDispatchBinding, RuntimeExecutionAuthorityValidator, TrackedDispatchOperationJournal, UpstreamClient } from "../src/engine.ts";
import { closedSessionFixture } from "./helpers/windows-closed-session-fixture.ts";

const operationId = "synthetic-closed-capture";
async function fixture(): Promise<{
  engine: EasyedaControlEngine;
  authority: ReturnType<typeof closedSessionFixture>;
  upstream: UpstreamClient;
  state: { runtimeReads: number; scope: boolean; sequence: number; generation: string; afterRead?: (count: number) => void };
}> {
  const authority = closedSessionFixture();
  await authority.supervisor.launch({ confirmLaunch: true });
  const state = { runtimeReads: 0, scope: true, sequence: 1, generation: "synthetic-runtime-generation-0001" } as {
    runtimeReads: number; scope: boolean; sequence: number; generation: string; afterRead?: (count: number) => void;
  };
  const upstream: UpstreamClient = {
    findTool() { return Promise.resolve({ name: "easyeda_execute" }); },
    bridgeSessionLifecycle() { return {
      schema: "easyeda-pro-control.authenticated-bridge-lifecycle.v1", gatewayInstanceId: "g".repeat(43),
      activeSession: { sessionId: "s".repeat(43), sequence: state.sequence,
        authenticationReceiptSha256: "2".repeat(64), authenticatedAtEpochMs: 1000 },
    }; },
    currentAuthenticatedBridgeDispatchBinding(): AuthenticatedBridgeDispatchBinding | undefined {
      return state.scope ? { schema: "easyeda-pro-control.bridge-dispatch-lease.v1", gatewayInstanceId: "g".repeat(43),
        sessionId: "s".repeat(43), sessionSequence: state.sequence, begunAtEpochMs: 1001,
        leaseId: "l".repeat(43), bindingReceipt: "b".repeat(43) } : undefined;
    },
    callTool(name, args, _timeout, lease) {
      assert.equal(name, "easyeda_execute"); assert.equal(typeof args?.["code"], "string"); assert.ok(lease !== undefined);
      state.runtimeReads += 1;
      const runtime = { kind: "runtime-identity", generation: state.generation, timeOrigin: 1000, processId: 101 };
      state.afterRead?.(state.runtimeReads);
      return Promise.resolve({ content: [{ type: "text", text: JSON.stringify(runtime) }] });
    },
  };
  const engine = new EasyedaControlEngine(upstream, { executionAuthorityValidator: authority.supervisor });
  // The constructor's independent source fingerprint must settle in these tests.
  await engine.controlFingerprintPromise;
  return { engine, authority, upstream, state };
}
function requests(authority: ReturnType<typeof closedSessionFixture>, action: string): number {
  return authority.requests.filter((entry) => entry["action"] === action).length;
}

void test("closed capture survives its authenticated scope and reaches real retained-Job close proof without an orphan journal", async () => {
  const { engine, authority, state } = await fixture();
  const directory = process.env["EASYEDA_CONTROL_DATA_DIR"];
  assert.ok(directory !== undefined);
  await engine.assertBridgeDispatchAllowed();
  const before = await readdir(join(directory, "operations"));
  const receipt = await engine.captureClosedSessionAuthority(operationId, "closed-edit", 1);
  assert.equal(state.runtimeReads, 2); assert.equal(requests(authority, "capture"), 1);
  assert.equal(requests(authority, "release-capture"), 0); assert.equal(Object.isFrozen(receipt), true);
  assert.deepEqual(await readdir(join(directory, "operations")), before);
  state.scope = false;
  const launch = authority.requests[0]; assert.equal(launch?.["action"], "launch");
  const root = receipt.executionAuthority.processes.find((entry) => entry.role === "easyeda-main"); assert.ok(root !== undefined);
  const binding = { ...receipt, launch: { helperInstance: "b".repeat(32), jobId: "1".padStart(32, "0"), root } };
  const intent = await authority.supervisor.prepareClosedSessionClose({ ...binding, windowHandle: "12345" });
  const closeReceipt = await authority.supervisor.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true });
  const proof = await authority.supervisor.proveClosedSession({ ...binding, intent, closeReceipt });
  assert.equal(proof.jobEmpty, true);
  await engine.releaseClosedSessionAuthority(receipt);
  assert.equal(requests(authority, "release-capture"), 1);
  await assert.rejects(engine.releaseClosedSessionAuthority(receipt), /original receipt/u);
});

void test("missing authenticated scope refuses without native capture or runtime probe", async () => {
  const { engine, authority, state } = await fixture(); state.scope = false;
  await assert.rejects(engine.captureClosedSessionAuthority(operationId, "closed-edit", 1), /exact authenticated/u);
  assert.equal(requests(authority, "capture"), 0); assert.equal(state.runtimeReads, 0);
});
void test("settled per-call orphan cleanup releases its own capture, not normal-completion authority", async () => {
  const { engine, authority } = await fixture();
  const id = "synthetic-closed-capture-tracked", plan = { synthetic: "closed-preopen" };
  const journal: TrackedDispatchOperationJournal = {
    schema: OPERATION_SCHEMA, operationId: id, plan, planHash: buildPlanHash(plan), journalPath: "",
    state: "closed-preopen", mutationState: "unchanged", saved: false, reopened: false,
    orphanedCallPossible: false, hardStop: false, mutationMayHaveOccurred: false,
    nextSafeAction: "Synthetic tracked read only.", sequence: 0, artifacts: [], updatedAt: new Date().toISOString(),
  };
  journal.journalPath = await createOperation(journal);
  try {
    const receipt = await engine.captureClosedSessionAuthority(id, "closed-baseline", 1);
    await engine.dispatchWithOrphanTracking(journal, "synthetic-read", "easyeda_execute", { code: "return true;" }, 1000);
    const retained = await loadOperation(id);
    assert.equal(retained["orphanedCallPossible"], false);
    assert.equal(Object.hasOwn(retained, "context"), false); assert.equal(Object.hasOwn(retained, "preCheckpoint"), false);
    assert.equal(requests(authority, "capture"), 2); assert.equal(requests(authority, "release-capture"), 1);
    const root = receipt.executionAuthority.processes.find((entry) => entry.role === "easyeda-main"); assert.ok(root !== undefined);
    const binding = { ...receipt, launch: { helperInstance: "b".repeat(32), jobId: "1".padStart(32, "0"), root } };
    const intent = await authority.supervisor.prepareClosedSessionClose({ ...binding, windowHandle: "12345" });
    const closeReceipt = await authority.supervisor.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true });
    const proof = await authority.supervisor.proveClosedSession({ ...binding, intent, closeReceipt });
    assert.equal(proof.jobEmpty, true);
    await engine.releaseClosedSessionAuthority(receipt);
    assert.equal(requests(authority, "release-capture"), 2);
  } finally { await updateOperation({ ...journal, state: "completed", orphanedCallPossible: false }); }
});
void test("missing explicit release support refuses before native work", async () => {
  const { upstream, authority, state } = await fixture();
  const validator: RuntimeExecutionAuthorityValidator = { capture: authority.supervisor.capture, proveTerminated: authority.supervisor.proveTerminated };
  const engine = new EasyedaControlEngine(upstream, { executionAuthorityValidator: validator }); await engine.controlFingerprintPromise;
  await assert.rejects(engine.captureClosedSessionAuthority(operationId, "closed-edit", 1), /explicit release/u);
  assert.equal(state.runtimeReads, 0); assert.equal(requests(authority, "capture"), 0);
});
for (const phase of ["closed-baseline", "closed-edit", "closed-verification"] as const) {
  void test(`independent one-shot reservation for ${phase}`, async () => {
    const { engine, authority } = await fixture();
    const pending = engine.captureClosedSessionAuthority(operationId, phase, 1);
    await assert.rejects(engine.captureClosedSessionAuthority(operationId, phase, 1), /already consumed/u);
    const receipt = await pending;
    await engine.releaseClosedSessionAuthority(receipt);
    await assert.rejects(engine.captureClosedSessionAuthority(operationId, phase, 1), /already consumed/u);
    assert.equal(requests(authority, "capture"), 1);
  });
}
for (const at of [1, 2]) {
  for (const drift of ["session", "scope"] as const) {
    void test(`${drift} drift after runtime read ${at} refuses and cleans only a completed capture`, async () => {
      const { engine, authority, state } = await fixture();
      state.afterRead = (count): void => { if (count === at) { if (drift === "session") { state.sequence += 1; } else { state.scope = false; } } };
      await assert.rejects(engine.captureClosedSessionAuthority(operationId, "closed-edit", 1), /authenticated/u);
      assert.equal(requests(authority, "capture"), at - 1); assert.equal(requests(authority, "release-capture"), at - 1);
    });
  }
}
void test("drift during authority capture refuses before the final probe and releases its separate handles", async () => {
  const { engine, authority, state } = await fixture();
  authority.behavior.afterRequest = (action): void => { if (action === "capture") { state.scope = false; } };
  await assert.rejects(engine.captureClosedSessionAuthority(operationId, "closed-edit", 1), /authenticated/u);
  assert.equal(state.runtimeReads, 1); assert.equal(requests(authority, "release-capture"), 1);
});
void test("native runtime drift after capture refuses and releases handles", async () => {
  const { engine, authority, state } = await fixture();
  authority.behavior.afterRequest = (action): void => { if (action === "capture") { state.generation = "synthetic-runtime-generation-0002"; } };
  await assert.rejects(engine.captureClosedSessionAuthority(operationId, "closed-edit", 1), /native runtime identity/u);
  assert.equal(requests(authority, "release-capture"), 1);
});
void test("capture read failure plus failed cleanup preserves both errors and consumes attempt", async () => {
  const { engine, authority, state } = await fixture();
  state.afterRead = (count): void => { if (count === 2) { throw new Error("synthetic probe failure"); } };
  authority.behavior.errorAction = "release-capture";
  await assert.rejects(engine.captureClosedSessionAuthority(operationId, "closed-edit", 1), AggregateError);
  await assert.rejects(engine.captureClosedSessionAuthority(operationId, "closed-edit", 1), /already consumed/u);
  assert.equal(requests(authority, "release-capture"), 1);
});
void test("copy, cross-engine and changed nested receipt cannot release original handles", async () => {
  const { engine, authority, upstream } = await fixture();
  const receipt = await engine.captureClosedSessionAuthority(operationId, "closed-edit", 1);
  const other = new EasyedaControlEngine(upstream, { executionAuthorityValidator: authority.supervisor }); await other.controlFingerprintPromise;
  await assert.rejects(other.releaseClosedSessionAuthority(receipt), /original receipt/u);
  await assert.rejects(engine.releaseClosedSessionAuthority(structuredClone(receipt)), /original receipt/u);
  receipt.runtimeIdentity.generation = "changed";
  await assert.rejects(engine.releaseClosedSessionAuthority(receipt), /original receipt/u);
  assert.equal(requests(authority, "release-capture"), 0);
});
void test("concurrent and ambiguous release never repeats the native release", async () => {
  const { engine, authority } = await fixture();
  const receipt = await engine.captureClosedSessionAuthority(operationId, "closed-edit", 1);
  authority.behavior.errorAction = "release-capture";
  const pending = engine.releaseClosedSessionAuthority(receipt);
  await assert.rejects(engine.releaseClosedSessionAuthority(receipt), /original receipt/u);
  await assert.rejects(pending, /synthetic helper/u);
  await assert.rejects(engine.releaseClosedSessionAuthority(receipt), /original receipt/u);
  assert.equal(requests(authority, "release-capture"), 1);
});
for (const [id, attempt] of [["", 1], ["bad/id", 1], [operationId, 0], [operationId, 1.5], [operationId, Number.MAX_SAFE_INTEGER + 1]] as const) {
  void test(`invalid capture identity ${id}:${attempt} refuses before native work`, async () => {
    const { engine, authority, state } = await fixture();
    await assert.rejects(engine.captureClosedSessionAuthority(id, "closed-edit", attempt), /strict operation/u);
    assert.equal(state.runtimeReads, 0); assert.equal(requests(authority, "capture"), 0);
  });
}
for (const orphanedCallPossible of [false, true]) {
  void test(`unfinished journal admission, orphan=${orphanedCallPossible}, stops every capture probe`, async () => {
    const { engine, authority, state } = await fixture();
    const id = `synthetic-capture-blocker-${String(orphanedCallPossible)}`;
    const plan = { synthetic: id };
    const journal = { schema: OPERATION_SCHEMA, operationId: id, plan, planHash: buildPlanHash(plan),
      state: "library-needs-review", artifacts: [], orphanedCallPossible };
    await createOperation(journal);
    try {
      await assert.rejects(engine.captureClosedSessionAuthority(operationId, "closed-edit", 1), orphanedCallPossible ? /quarantined/u : /not isolated/u);
      assert.equal(state.runtimeReads, 0); assert.equal(requests(authority, "capture"), 0);
    } finally {
      await updateOperation({ ...journal, state: "completed", orphanedCallPossible: false });
    }
  });
}
