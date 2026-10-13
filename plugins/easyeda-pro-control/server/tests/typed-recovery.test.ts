/* oxlint-disable import/max-dependencies -- The builtin-only fixture helper isolates credential and upstream paths alongside these coordinator test dependencies. */
import { configureTestControlRoot } from "./test-control-root.ts";
import assert from "node:assert/strict";
import fileSystem, { mkdtemp, rm } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, describe, it } from "node:test";
import type { TestContext } from "node:test";
import { OPERATION_SCHEMA, buildPlanHash, isRecord, newOperationId, sha256Json, sha256Text } from "../src/core.ts";
import type { AuthenticatedBridgeDispatchBinding, AuthenticatedBridgeSessionIdentity, DispatchOperationJournal, EasyedaControlEngine, ExecutionAuthorityEvidence, ExecutionAuthorityTerminationProof, ExpectedContext, RuntimeIdentity } from "../src/engine.ts";
import type { controlRootCapability, createOperation, loadOperation, operationPath, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
import type { DesignExecutor } from "../src/design-execution.ts";

let engineModule: { EasyedaControlEngine: typeof EasyedaControlEngine };
let artifacts: { controlRootCapability: typeof controlRootCapability; createOperation: typeof createOperation; loadOperation: typeof loadOperation;
  operationPath: typeof operationPath; updateOperation: typeof updateOperation; writePhaseArtifact: typeof writePhaseArtifact };
let executorModule: { DesignExecutor: typeof DesignExecutor };
let directory: string;
const priorControlDirectory = process.env["EASYEDA_CONTROL_DATA_DIR"];
const PRIOR_SESSION: AuthenticatedBridgeSessionIdentity = { gatewayInstanceId: "G".repeat(43), sessionId: "P".repeat(43),
  authenticationReceiptSha256: "ab".repeat(32), authenticatedAtEpochMs: 100, sequence: 1 };
const NEXT_SESSION: AuthenticatedBridgeSessionIdentity = { ...PRIOR_SESSION, sessionId: "N".repeat(43), authenticatedAtEpochMs: 300, sequence: 2 };
const PRIOR_RUNTIME: RuntimeIdentity = { kind: "runtime-identity", generation: "old-renderer-generation-001", timeOrigin: 100, processId: null };
const NEXT_RUNTIME: RuntimeIdentity = { kind: "runtime-identity", generation: "new-renderer-generation-002", timeOrigin: 300, processId: null };

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "easyeda-typed-recovery-test-"));
  configureTestControlRoot(directory);
  engineModule = await import("../src/engine.ts");
  artifacts = await import("../src/artifacts.ts");
  executorModule = await import("../src/design-execution.ts");
});
after(async () => {
  const capability = await artifacts.controlRootCapability();
  await capability.close();
  if (priorControlDirectory === undefined) { configureTestControlRoot(); }
  else { configureTestControlRoot(priorControlDirectory); }
  await rm(directory, { recursive: true, force: true });
});

function authority(bindingSha256 = "cd".repeat(32)): ExecutionAuthorityEvidence {
  const processes = [{ pid: 123, role: "easyeda-job", startIdentity: "synthetic-process-birth" }];
  const body = { schema: "easyeda-pro-control.execution-authority.v1" as const, bindingSha256,
    capturedAt: new Date(100).toISOString(), policyId: "synthetic-retained-job", policySha256: "ef".repeat(32),
    processes, processTreeSha256: sha256Json(processes) };
  return { ...body, authoritySha256: sha256Json(body) };
}

async function fixture(t: TestContext): Promise<{
  engine: InstanceType<typeof engineModule.EasyedaControlEngine>;
  journal: DispatchOperationJournal;
  behavior: { session: AuthenticatedBridgeSessionIdentity; runtime: RuntimeIdentity; closure: unknown; termination: "valid" | "wrong-binding" | "fail"; changeSessionDuringProof: boolean };
  calls: string[];
}> {
  const operationId = newOperationId();
  const context = { project: { uuid: "11".repeat(32), path: join(directory, "fixture.eprj2") }, document: { uuid: "board", documentType: 3, tabId: "before-tab" } };
  const plan = { profile: "easyeda-pro-control.typed-design-transaction.v1", expectedContext: context, expectedFingerprint: { synthetic: true },
    operation: { id: "widen", action: "pcb.line.modify", target: { primitiveId: "line1" }, patch: { lineWidth: 8 } } };
  const source = { schema: "easyeda-pro-control.document-source.v1", document: { uuid: "board", docType: "PCB", editVersion: "3.2.149.88089769" }, objects: [] };
  const journal: DispatchOperationJournal = { schema: OPERATION_SCHEMA, operationId, journalPath: artifacts.operationPath(operationId),
    plan, planHash: buildPlanHash(plan), state: "apply-outcome-unknown", mutationState: "before", saved: false, reopened: false,
    orphanedCallPossible: true, orphanedCallPhase: "apply", runtimeRestartChallengeAttempt: 1,
    runtimeRestartChallenge: `fixture-nonce-${operationId}`, runtimeRestartChallengeIssuedAt: new Date(100).toISOString(),
    runtimeIdentityBeforeOrphan: PRIOR_RUNTIME, bridgeSessionBeforeOrphan: PRIOR_SESSION,
    bridgeDispatchBeforeOrphan: { schema: "easyeda-pro-control.bridge-dispatch-lease.v1", begunAtEpochMs: 110,
      bindingReceipt: "B".repeat(43), gatewayInstanceId: PRIOR_SESSION.gatewayInstanceId, leaseId: "L".repeat(43), sessionId: PRIOR_SESSION.sessionId, sessionSequence: 1 },
    executionAuthorityBeforeOrphan: authority(), hardStop: true, mutationMayHaveOccurred: true, nextSafeAction: "Recover authority first.",
    context, before: { ...source, sha256: sha256Json(source) }, preCheckpoint: { receiptPath: join(directory, "synthetic-checkpoint.json") },
    sequence: 0, updatedAt: new Date(100).toISOString(), artifacts: [] };
  await artifacts.createOperation(journal);
  t.after(async () => {
    journal.state = "rolled-back"; journal.orphanedCallPossible = false;
    await artifacts.updateOperation(journal);
  });
  const behavior = { session: NEXT_SESSION, runtime: NEXT_RUNTIME,
    closure: { ...PRIOR_SESSION, closedAtEpochMs: 200, closeReason: "normal-owned-runtime-exit" } as unknown,
    termination: "valid" as "valid" | "wrong-binding" | "fail", changeSessionDuringProof: false };
  const calls: string[] = [];
  const engine = new engineModule.EasyedaControlEngine({
    callTool(): Promise<unknown> { calls.push("unexpected-upstream-call"); return Promise.reject(new Error("Unit fixture forbids live calls.")); },
    bridgeSessionLifecycle(): unknown { return { schema: "easyeda-pro-control.authenticated-bridge-lifecycle.v1", gatewayInstanceId: behavior.session.gatewayInstanceId, activeSession: behavior.session }; },
    closedAuthenticatedBridgeSession(id): unknown { calls.push("closed-session"); assert.equal(id, PRIOR_SESSION.sessionId); return behavior.closure; },
    beginAuthenticatedBridgeDispatch(gatewayInstanceId, sessionId): AuthenticatedBridgeDispatchBinding {
      return { schema: "easyeda-pro-control.bridge-dispatch-lease.v1", gatewayInstanceId, sessionId, sessionSequence: behavior.session.sequence,
        begunAtEpochMs: behavior.session.authenticatedAtEpochMs + 1, leaseId: "L".repeat(43), bindingReceipt: "B".repeat(43) };
    },
    endAuthenticatedBridgeDispatch(): void { calls.push("end-dispatch"); },
    abortAuthenticatedBridgeDispatch(): { released: boolean; retainedUntilSessionClose: boolean } { calls.push("abort-dispatch"); return { released: true, retainedUntilSessionClose: false }; },
  }, { executionAuthorityValidator: {
    capture(input): Promise<ExecutionAuthorityEvidence> { calls.push("capture"); return Promise.resolve(authority(input.bindingSha256)); },
    async releaseCapture(evidence): Promise<void> {
      const stored = await artifacts.loadOperation(journal.operationId);
      assert.equal(stored["orphanedCallPossible"], false);
      const captured = stored["executionAuthorityBeforeOrphan"];
      assert.ok(isRecord(captured));
      assert.equal(captured["authoritySha256"], evidence.authoritySha256);
      calls.push("release-capture-after-durable-clear");
    },
    proveTerminated(input): Promise<ExecutionAuthorityTerminationProof> {
      calls.push("retained-job-termination");
      if (behavior.termination === "fail") { return Promise.reject(new Error("Retained Job still contains prior processes.")); }
      if (behavior.changeSessionDuringProof) { behavior.session = { ...NEXT_SESSION, sessionId: "R".repeat(43), sequence: 3 }; }
      return Promise.resolve({ schema: "easyeda-pro-control.execution-authority-termination.v1", ok: true, noPriorExecutionAuthorityRemains: true,
        bindingSha256: behavior.termination === "wrong-binding" ? "00".repeat(32) : input.bindingSha256,
        checkedAt: new Date(400).toISOString(), terminatedAuthoritySha256: input.priorExecutionAuthority.authoritySha256,
        policyId: input.priorExecutionAuthority.policyId, policySha256: input.priorExecutionAuthority.policySha256 });
    },
  } });
  await engine.controlFingerprintPromise;
  t.mock.method(engine, "runtimeIdentity", () => { calls.push("runtime-identity"); return Promise.resolve(behavior.runtime); });
  return { engine, journal, behavior, calls };
}

async function retainNativeResult(journal: DispatchOperationJournal, result: unknown): Promise<void> {
  journal.sequence += 1;
  journal.artifacts.push(await artifacts.writePhaseArtifact(journal.operationId, journal.sequence, "native-return", result));
  await artifacts.updateOperation(journal);
}

void describe("typed transaction retained-authority recovery", () => {
  void it("clears only execution quarantine, preserving immutable plan and pre-dispatch evidence", async (t) => {
    const { engine, journal, calls } = await fixture(t);
    const confirmation = journal.runtimeRestartChallenge;
    assert.equal(typeof confirmation, "string");
    assert.notEqual(confirmation, undefined);
    const planHash = journal.planHash;
    const boundary = await engine.recoverDispatchAuthority(journal, confirmation, () => { calls.push("fingerprint"); return Promise.resolve(); });
    assert.ok(boundary);
    assert.equal(journal.orphanedCallPossible, false);
    assert.equal(journal.state, "apply-outcome-unknown");
    assert.equal(journal.hardStop, true);
    assert.equal(journal.saved, false);
    assert.equal(journal.unsavedStateDiscardedByRestart, undefined);
    assert.equal(journal.runtimeRestartChallenge, undefined);
    assert.deepEqual(journal.runtimeIdentityBeforeOrphan, PRIOR_RUNTIME);
    assert.deepEqual(journal.bridgeSessionBeforeOrphan, PRIOR_SESSION);
    assert.equal(boundary.confirmationSha256, sha256Text(confirmation));
    const stored = await artifacts.loadOperation(journal.operationId);
    assert.equal(stored.planHash, planHash);
    assert.equal(journal.artifacts.length, 1);
    assert.equal(calls.filter((call) => call === "runtime-identity").length, 2);
    assert.equal(calls.includes("unexpected-upstream-call"), false);
    assert.equal(calls.includes("capture"), false);
    assert.equal(calls.at(-1), "release-capture-after-durable-clear");
  });

  void it("rejects wrong nonce before probing or consuming authority", async (t) => {
    const { engine, journal, calls } = await fixture(t);
    await assert.rejects(engine.recoverDispatchAuthority(journal, "wrong-nonce", () => Promise.resolve()), /operation-bound/u);
    assert.equal(journal.orphanedCallPossible, true);
    assert.equal(journal.artifacts.length, 0);
    assert.deepEqual(calls, []);
  });

  for (const failure of ["same-session", "different-gateway", "same-renderer", "missing-closure", "bad-termination", "live-job", "session-race"] as const) {
    void it(`retains quarantine after ${failure}`, async (t) => {
      const { engine, journal, behavior } = await fixture(t);
      if (failure === "same-session") { behavior.session = PRIOR_SESSION; }
      if (failure === "different-gateway") { behavior.session = { ...NEXT_SESSION, gatewayInstanceId: "Q".repeat(43) }; }
      if (failure === "same-renderer") { behavior.runtime = PRIOR_RUNTIME; }
      if (failure === "missing-closure") { behavior.closure = null; }
      if (failure === "bad-termination") { behavior.termination = "wrong-binding"; }
      if (failure === "live-job") { behavior.termination = "fail"; }
      if (failure === "session-race") { behavior.changeSessionDuringProof = true; }
      await assert.rejects(engine.recoverDispatchAuthority(journal, journal.runtimeRestartChallenge, () => Promise.resolve()));
      assert.equal(journal.orphanedCallPossible, true);
      assert.equal(journal.artifacts.length, 0);
      assert.deepEqual(journal.runtimeIdentityBeforeOrphan, PRIOR_RUNTIME);
      assert.deepEqual(journal.bridgeSessionBeforeOrphan, PRIOR_SESSION);
    });
  }

  void it("an artifact collision keeps quarantine closed and permits a fresh nonce with original authority evidence", async (t) => {
    const { engine, journal } = await fixture(t);
    t.mock.method(Date, "now", () => 4242);
    await artifacts.writePhaseArtifact(journal.operationId, 1, "runtime-restart-boundary-4242", { syntheticCollision: true });
    const confirmation = journal.runtimeRestartChallenge;
    await assert.rejects(engine.recoverDispatchAuthority(journal, confirmation, () => Promise.resolve()));
    assert.equal(journal.orphanedCallPossible, true);
    assert.equal(journal.runtimeRestartChallenge, undefined);
    const stored = await artifacts.loadOperation(journal.operationId);
    assert.equal(stored["orphanedCallPossible"], true);
    assert.deepEqual(stored["bridgeSessionBeforeOrphan"], PRIOR_SESSION);
    const next = await engine.ensureRuntimeRestartChallenge(journal);
    assert.notEqual(next, confirmation);
    assert.ok(await engine.recoverDispatchAuthority(journal, next, () => Promise.resolve()));
    assert.equal(journal.orphanedCallPossible, false);
  });

  void it("refuses recovery if another incomplete transaction exists", async (t) => {
    const first = await fixture(t);
    await fixture(t);
    await assert.rejects(first.engine.recoverDispatchAuthority(first.journal, first.journal.runtimeRestartChallenge, () => Promise.resolve()), /not isolated/u);
    assert.equal(first.journal.orphanedCallPossible, true);
  });

  void it("typed executor consumes its technical nonce and rebinds a new tab without mutating the sealed plan", async (t) => {
    const { engine, journal, calls } = await fixture(t);
    // The engine gate is tested above. Here its controlled completion isolates
    // Executor sequencing; no production fingerprint or authority flag changes.
    t.mock.method(engine, "recoverDispatchAuthority", (operation: DispatchOperationJournal, confirmation: string | undefined) => {
      calls.push("authority-gate");
      assert.equal(confirmation, journal.runtimeRestartChallenge);
      operation.orphanedCallPossible = false;
      return Promise.resolve({ rendererGenerationChanged: true });
    });
    t.mock.method(engine, "assertContext", (context: ExpectedContext, options?: { allowTabChange?: boolean }) => {
      calls.push("context");
      assert.equal(options?.allowTabChange, true);
      assert.equal(context.document.tabId, "before-tab");
      return Promise.resolve({ project: context.project, document: { uuid: "board", documentType: 3, tabId: "after-tab" } });
    });
    const executor = new executorModule.DesignExecutor(engine);
    const result = await executor.recoverAuthority(journal.operationId);
    assert.equal(result["state"], "authority-recovered-needs-reconciliation");
    assert.equal(result["hardStop"], true);
    assert.equal(result["saved"], false);
    assert.equal(result["reopened"], false);
    assert.deepEqual(calls, ["authority-gate", "context"]);
    const stored = await artifacts.loadOperation(journal.operationId);
    assert.equal(stored.planHash, journal.planHash);
    assert.equal(sha256Json(stored.plan), sha256Json(journal.plan));
    const savedContext = stored["context"];
    assert.ok(isRecord(savedContext));
    const savedDocument = savedContext["document"];
    assert.ok(isRecord(savedDocument));
    assert.equal(savedDocument["tabId"], "after-tab");
  });

  void it("typed executor never reads context when the retained-authority gate fails", async (t) => {
    const { engine, journal, calls } = await fixture(t);
    t.mock.method(engine, "recoverDispatchAuthority", () => Promise.reject(new Error("Prior Job still running.")));
    t.mock.method(engine, "assertContext", () => { calls.push("forbidden-context"); return Promise.reject(new Error("Unexpected read.")); });
    const executor = new executorModule.DesignExecutor(engine);
    await assert.rejects(executor.recoverAuthority(journal.operationId), /Job still/u);
    assert.deepEqual(calls, []);
    const stored = await artifacts.loadOperation(journal.operationId);
    assert.equal(stored["orphanedCallPossible"], true);
  });

  void it("typed executor records a missing target after authority recovery without reopening or retrying", async (t) => {
    const { engine, journal, calls } = await fixture(t);
    t.mock.method(engine, "recoverDispatchAuthority", (operation: DispatchOperationJournal) => {
      operation.orphanedCallPossible = false;
      return Promise.resolve({ rendererGenerationChanged: true });
    });
    t.mock.method(engine, "assertContext", () => Promise.reject(new Error("Target is not open.")));
    const executor = new executorModule.DesignExecutor(engine);
    await assert.rejects(executor.recoverAuthority(journal.operationId), /not open/u);
    const stored = await artifacts.loadOperation(journal.operationId);
    assert.equal(stored["state"], "authority-recovered-needs-target");
    assert.equal(stored["orphanedCallPossible"], false);
    assert.equal(stored["hardStop"], true);
    assert.deepEqual(calls, []);
  });

  void it("a successful return releases its capture only after the no-orphan journal update", async (t) => {
    const { engine, journal, calls } = await fixture(t);
    const binding = journal.bridgeDispatchBeforeOrphan;
    assert.ok(binding);
    await engine.clearOrphanedCallRisk(journal, "apply", { binding, ownedByAuthenticatedScope: true });
    assert.deepEqual(calls, ["release-capture-after-durable-clear"]);
    assert.equal(journal.orphanedCallPossible, false);
  });

  void it("proven pre-dispatch failure clears and releases its new capture without invoking the design API", async (t) => {
    const { engine, journal, calls } = await fixture(t);
    journal.orphanedCallPossible = false;
    await artifacts.updateOperation(journal);
    let probes = 0;
    t.mock.method(engine, "runtimeIdentity", () => {
      probes += 1;
      return probes === 2 ? Promise.reject(new Error("Second pre-dispatch identity failed.")) : Promise.resolve(NEXT_RUNTIME);
    });
    await assert.rejects(engine.markOrphanedCallRisk(journal, "apply"), /pre-dispatch identity/u);
    assert.equal(journal.orphanedCallPossible, false);
    assert.equal(calls.includes("unexpected-upstream-call"), false);
    assert.deepEqual(calls, ["capture", "abort-dispatch", "release-capture-after-durable-clear"]);
  });

  void it("a durable pre-dispatch callback runs after authority reproof and before the native call", async (t) => {
    const { engine, journal, calls } = await fixture(t);
    journal.orphanedCallPossible = false; await artifacts.updateOperation(journal);
    t.mock.method(engine.upstream, "callTool", () => { calls.push("native-call"); return Promise.resolve({ structuredContent: { ok: true } }); });
    const result = await engine.dispatchWithOrphanTracking(journal, "save-reopen", "easyeda_execute", {}, 70_000, async () => {
      const retained = await artifacts.loadOperation(journal.operationId);
      assert.equal(retained["orphanedCallPossible"], true);
      assert.equal(calls.filter((call) => call === "runtime-identity").length, 2);
      calls.push("durable-intent");
    });
    assert.deepEqual(result, { structuredContent: { ok: true } });
    assert.ok(calls.indexOf("durable-intent") < calls.indexOf("native-call"));
    assert.equal(calls.filter((call) => call === "native-call").length, 1);
    assert.equal(journal.orphanedCallPossible, false);
  });

  void it("a rejected pre-dispatch callback clears only its known unused capture and never calls the native API", async (t) => {
    const { engine, journal, calls } = await fixture(t);
    journal.orphanedCallPossible = false; await artifacts.updateOperation(journal);
    await assert.rejects(engine.dispatchWithOrphanTracking(journal, "save-reopen", "easyeda_execute", {}, 70_000,
      () => Promise.reject(new Error("Synthetic durable intent publication refused"))), /intent publication refused/u);
    assert.equal(calls.includes("unexpected-upstream-call"), false);
    assert.equal(journal.orphanedCallPossible, false);
    assert.equal(calls.at(-1), "release-capture-after-durable-clear");
    const retained = await artifacts.loadOperation(journal.operationId);
    assert.equal(retained["orphanedCallPossible"], false);
  });

  void it("settled-result retention is awaited exactly once before lease clear and capture release", async (t) => {
    const { engine, journal, calls } = await fixture(t);
    const result = { structuredContent: { createdId: "c".repeat(16) } };
    const entered = Promise.withResolvers<true>(), release = Promise.withResolvers<true>();
    t.mock.method(engine.upstream, "callTool", () => { calls.push("native-create"); return Promise.resolve(result); });
    let callbacks = 0;
    const pending = engine.dispatchWithOrphanTracking(journal, "execute", "easyeda_execute", {}, 1000, undefined, async (returned) => {
      callbacks += 1; assert.equal(returned, result);
      assert.equal(journal.orphanedCallPossible, true);
      await retainNativeResult(journal, returned);
      calls.push("native-result-retained"); entered.resolve(true);
      await release.promise;
    });
    await entered.promise;
    assert.equal(calls.includes("end-dispatch"), false);
    assert.equal(calls.includes("release-capture-after-durable-clear"), false);
    const quarantined = await artifacts.loadOperation(journal.operationId);
    assert.equal(quarantined["orphanedCallPossible"], true);
    assert.equal(quarantined.artifacts?.length, 1);
    release.resolve(true);
    assert.equal(await pending, result);
    assert.equal(callbacks, 1);
    assert.equal(calls.filter((call) => call === "native-create").length, 1);
    assert.ok(calls.indexOf("native-result-retained") < calls.indexOf("end-dispatch"));
    assert.equal(calls.at(-1), "release-capture-after-durable-clear");
    assert.equal(journal.orphanedCallPossible, false);
  });

  for (const ownedByScope of [false, true]) {
    // oxlint-disable-next-line eslint/no-loop-func -- Shared artifact module is initialized once by before; each const case owns its runtime fixture.
    void it(`failed immutable result publication preserves quarantine and authority, scoped=${String(ownedByScope)}`, async (t) => {
      const { engine, journal, calls, behavior } = await fixture(t);
      if (ownedByScope) {
        const binding = engine.upstream.beginAuthenticatedBridgeDispatch?.(behavior.session.gatewayInstanceId, behavior.session.sessionId);
        assert.ok(binding); engine.upstream.currentAuthenticatedBridgeDispatchBinding = (): AuthenticatedBridgeDispatchBinding => binding;
      }
      await artifacts.writePhaseArtifact(journal.operationId, 1, "native-return", { unrelated: "exclusive collision" });
      t.mock.method(engine.upstream, "callTool", () => { calls.push("native-create"); return Promise.resolve({ structuredContent: { createdId: "c".repeat(16) } }); });
      let callbacks = 0;
      await assert.rejects(engine.dispatchWithOrphanTracking(journal, "execute", "easyeda_execute", {}, 1000, undefined, (result) => {
        callbacks += 1; return retainNativeResult(journal, result);
      }));
      const retained = await artifacts.loadOperation(journal.operationId);
      assert.equal(callbacks, 1); assert.equal(calls.filter((call) => call === "native-create").length, 1);
      assert.equal(journal.orphanedCallPossible, true); assert.equal(retained["orphanedCallPossible"], true);
      assert.equal(retained.artifacts?.length, 0); assert.equal(journal.artifacts.length, 0);
      assert.equal(calls.includes("end-dispatch"), false);
      assert.equal(calls.includes("release-capture-after-durable-clear"), false);
      assert.equal(calls.includes("abort-dispatch"), !ownedByScope);
    });
  }

  for (const failure of ["lease-end", "clear-write", "capture-release"] as const) {
    // oxlint-disable-next-line eslint/no-loop-func -- Shared artifact module is initialized once by before; each const case owns its runtime fixture.
    void it(`native identity remains published across ${failure} failure without another dispatch`, async (t) => {
      const { engine, journal, calls } = await fixture(t);
      const error = new Error(`Synthetic ${failure} failure`), result = { structuredContent: { createdId: "c".repeat(16) } };
      let callbacks = 0, restoreRename: (() => void) | undefined;
      t.mock.method(engine.upstream, "callTool", () => { calls.push("native-create"); return Promise.resolve(result); });
      if (failure === "lease-end") { engine.upstream.endAuthenticatedBridgeDispatch = (): never => { throw error; }; }
      if (failure === "capture-release") {
        assert.ok(engine.executionAuthorityValidator);
        Object.assign(engine.executionAuthorityValidator, { releaseCapture: async (): Promise<never> => {
          const retained = await artifacts.loadOperation(journal.operationId);
          assert.equal(retained["orphanedCallPossible"], false); assert.equal(retained.artifacts?.length, 1);
          calls.push("release-failed"); throw error;
        } });
      }
      try {
        await assert.rejects(engine.dispatchWithOrphanTracking(journal, "execute", "easyeda_execute", {}, 1000, undefined, async (returned) => {
          callbacks += 1; await retainNativeResult(journal, returned);
          if (failure === "clear-write") {
            const intercepted = t.mock.method(fileSystem, "rename", (): Promise<never> => Promise.reject(error));
            restoreRename = (): void => { intercepted.mock.restore(); syncBuiltinESMExports(); };
            syncBuiltinESMExports();
          }
        }), (actual: unknown) => { assert.equal(actual, error); return true; });
      } finally { restoreRename?.(); }
      const retained = await artifacts.loadOperation(journal.operationId);
      const descriptor = retained.artifacts?.[0];
      assert.ok(descriptor); assert.equal(retained.artifacts?.length, 1);
      assert.equal(await fileSystem.readFile(descriptor.path, "utf8"), `${JSON.stringify(result)}\n`);
      assert.equal(callbacks, 1); assert.equal(calls.filter((call) => call === "native-create").length, 1);
      const unresolved = failure !== "capture-release";
      assert.equal(journal.orphanedCallPossible, unresolved); assert.equal(retained["orphanedCallPossible"], unresolved);
      assert.equal(typeof journal.runtimeRestartChallenge === "string", unresolved);
      assert.equal(calls.includes("abort-dispatch"), unresolved);
      assert.equal(calls.includes("release-capture-after-durable-clear"), false);
      // A caller's ordinary failure publication must not erase quarantine
      // After the durable clear write failed.
      journal.state = "library-needs-review";
      await artifacts.updateOperation(journal);
      const afterFailure = await artifacts.loadOperation(journal.operationId);
      assert.equal(afterFailure["orphanedCallPossible"], unresolved);
    });
  }

  void it("result artifact publication without its journal descriptor is not successful retention", async (t) => {
    const { engine, journal, calls } = await fixture(t);
    const failure = new Error("Synthetic retained-result journal publication failure");
    let callbacks = 0, completed = false, restoreRename: (() => void) | undefined;
    t.mock.method(engine.upstream, "callTool", () => { calls.push("native-create"); return Promise.resolve({ structuredContent: { createdId: "c".repeat(16) } }); });
    try {
      await assert.rejects(engine.dispatchWithOrphanTracking(journal, "execute", "easyeda_execute", {}, 1000, undefined, async (result) => {
        callbacks += 1;
        journal.sequence += 1;
        journal.artifacts.push(await artifacts.writePhaseArtifact(journal.operationId, journal.sequence, "native-return", result));
        const intercepted = t.mock.method(fileSystem, "rename", (): Promise<never> => Promise.reject(failure));
        restoreRename = (): void => { intercepted.mock.restore(); syncBuiltinESMExports(); };
        syncBuiltinESMExports();
        await artifacts.updateOperation(journal);
        completed = true;
      }), (error: unknown) => { assert.equal(error, failure); return true; });
    } finally { restoreRename?.(); }
    const retained = await artifacts.loadOperation(journal.operationId);
    assert.equal(callbacks, 1); assert.equal(completed, false);
    assert.equal(calls.filter((call) => call === "native-create").length, 1);
    assert.equal(journal.orphanedCallPossible, true); assert.equal(retained["orphanedCallPossible"], true);
    assert.equal(journal.artifacts.length, 1); assert.equal(retained.artifacts?.length, 0);
    assert.equal(calls.includes("end-dispatch"), false); assert.equal(calls.includes("release-capture-after-durable-clear"), false);
    assert.equal(calls.includes("abort-dispatch"), true);
  });

  for (const outcome of ["transport-error", "bridge-timeout", "native-unsettled"] as const) {
    // oxlint-disable-next-line eslint/no-loop-func -- Shared artifact module is initialized once by before; each const case owns its runtime fixture.
    void it(`result retention is not called for ${outcome}`, async (t) => {
      const { engine, journal, calls } = await fixture(t);
      let callbacks = 0;
      t.mock.method(engine.upstream, "callTool", (): Promise<unknown> => {
        calls.push("native-create");
        if (outcome === "transport-error") { return Promise.reject(new Error("Synthetic transport failure")); }
        if (outcome === "bridge-timeout") { return Promise.resolve({ structuredContent: { ok: false, error: 'Bridge method "api.execute" timed out after 60000ms' } }); }
        return Promise.resolve({ content: [{ type: "text", text: JSON.stringify({ success: false,
          result: { error: { code: "EASYEDA_API_ERROR", message: "NATIVE_LIFECYCLE_CLOSE_UNSETTLED" } } }) }] });
      });
      await assert.rejects(engine.dispatchWithOrphanTracking(journal, "execute", "easyeda_execute", {}, 1000, undefined, () => {
        callbacks += 1; return Promise.resolve();
      }));
      assert.equal(callbacks, 0); assert.equal(calls.filter((call) => call === "native-create").length, 1);
      assert.equal(journal.orphanedCallPossible, true);
      const retained = await artifacts.loadOperation(journal.operationId);
      assert.equal(retained["orphanedCallPossible"], true);
      assert.equal(calls.includes("end-dispatch"), false); assert.equal(calls.includes("release-capture-after-durable-clear"), false);
    });
  }

  void it("a pre-dispatch authority refusal never reaches the callback or design API", async (t) => {
    const { engine, journal, calls } = await fixture(t);
    journal.orphanedCallPossible = false; await artifacts.updateOperation(journal);
    let callbacks = 0, probes = 0;
    t.mock.method(engine, "runtimeIdentity", () => {
      probes += 1;
      return probes === 2 ? Promise.reject(new Error("Final authority identity refused")) : Promise.resolve(NEXT_RUNTIME);
    });
    await assert.rejects(engine.dispatchWithOrphanTracking(journal, "save-reopen", "easyeda_execute", {}, 70_000,
      () => { callbacks += 1; return Promise.resolve(); }), /authority identity refused/u);
    assert.equal(callbacks, 0);
    assert.equal(calls.includes("unexpected-upstream-call"), false);
    assert.equal(journal.orphanedCallPossible, false);
  });

  void it("callback failure with an unsuccessful durable clear retains the disk quarantine and never dispatches", async (t) => {
    const { engine, journal, calls } = await fixture(t);
    journal.orphanedCallPossible = false; await artifacts.updateOperation(journal);
    t.mock.method(engine, "clearOrphanedCallRisk", () => {
      // Mirror a transient journal-write failure after only the in-memory
      // Marker changed. The persisted retained authority must not be lost.
      journal.orphanedCallPossible = false;
      return Promise.reject(new Error("Synthetic durable clear failed"));
    });
    await assert.rejects(engine.dispatchWithOrphanTracking(journal, "save-reopen", "easyeda_execute", {}, 70_000,
      () => Promise.reject(new Error("Synthetic intent publication failed"))), /durable clear failed/u);
    const retained = await artifacts.loadOperation(journal.operationId);
    assert.equal(retained["orphanedCallPossible"], true);
    assert.equal(calls.includes("unexpected-upstream-call"), false);
    assert.equal(calls.includes("release-capture-after-durable-clear"), false);
  });

  void it("retained failed Save evidence stays consumed and unchanged beneath the new lifecycle refusal", async (t) => {
    const { engine, journal, calls } = await fixture(t);
    const { DESIGN_SAVE_ATTEMPT_PROFILE, createDesignSaveIntent } = await import("../src/design-save-attempt.ts");
    journal.orphanedCallPossible = false;
    journal["after"] = journal["before"];
    journal["saveAttemptProtocol"] = DESIGN_SAVE_ATTEMPT_PROFILE;
    await artifacts.updateOperation(journal);
    t.mock.method(engine.upstream, "callTool", () => {
      calls.push("native-save");
      return Promise.resolve({ isError: true, content: [{ type: "text", text: "Save returned without an acknowledgment" }] });
    });
    const result = await engine.dispatchWithOrphanTracking(journal, "save-reopen", "easyeda_execute", {}, 70_000, async () => {
      assert.ok(isRecord(journal["after"]));
      const sourceHash = journal["after"]["sha256"];
      assert.ok(typeof sourceHash === "string");
      const intent = createDesignSaveIntent({ ...journal, after: { sha256: sourceHash } }, "save-reopen");
      journal.sequence += 1;
      journal.artifacts.push(await artifacts.writePhaseArtifact(journal.operationId, journal.sequence, "design-save-intent", intent));
      await artifacts.updateOperation(journal);
    });
    assert.deepEqual(result, { isError: true, content: [{ type: "text", text: "Save returned without an acknowledgment" }] });
    assert.equal(journal.orphanedCallPossible, false);
    const executor = new executorModule.DesignExecutor(engine);
    for (const state of ["commit-needs-recovery", "runtime-rebound-needs-reconciliation", "applied-unsaved"]) {
      journal.state = state;
      journal.orphanedCallPhase = "reconcile-upload-barrier";
      await artifacts.updateOperation(journal);
      const retained = await fileSystem.readFile(artifacts.operationPath(journal.operationId));
      const beforeCalls = [...calls];
      await assert.rejects(executor.reconcile(journal.operationId), /operation-owned completion.*project_structures/u);
      await assert.rejects(executor.commit(journal.operationId), /operation-owned completion.*project_structures/u);
      assert.deepEqual(await fileSystem.readFile(artifacts.operationPath(journal.operationId)), retained);
      assert.deepEqual(calls, beforeCalls);
      const inspected = await executorModule.DesignExecutor.inspect(journal.operationId);
      assert.equal(inspected["state"], state);
      assert.equal(calls.filter((call) => call === "native-save").length, 1);
    }
  });

  void it("ambiguous dispatched calls retain their captures until termination proof", async (t) => {
    const { engine, journal, calls } = await fixture(t);
    journal.orphanedCallPossible = false;
    await artifacts.updateOperation(journal);
    await assert.rejects(engine.dispatchWithOrphanTracking(journal, "apply", "synthetic-design-call", {}, 1000), /forbids live calls/u);
    assert.equal(journal.orphanedCallPossible, true);
    assert.equal(calls.includes("release-capture-after-durable-clear"), false);
    assert.equal(calls.includes("unexpected-upstream-call"), true);
  });

  void it("returned bridge timeout retains its journal marker, lease and capture", async (t) => {
    const { engine, journal, calls } = await fixture(t);
    journal.orphanedCallPossible = false;
    await artifacts.updateOperation(journal);
    t.mock.method(engine.upstream, "callTool", () => Promise.resolve({ content: [], structuredContent: {
      ok: false, error: 'Bridge method "api.execute" timed out after 60000ms',
    } }));
    await assert.rejects(engine.dispatchWithOrphanTracking(journal, "apply", "easyeda_execute", {}, 1000), /bridge-timeout;execution-unsettled/u);
    assert.equal(journal.orphanedCallPossible, true);
    const persisted = await artifacts.loadOperation(journal.operationId);
    assert.equal(persisted["orphanedCallPossible"], true);
    assert.equal(calls.includes("release-capture-after-durable-clear"), false);
    assert.equal(calls.includes("end-dispatch"), false);
    assert.equal(calls.includes("abort-dispatch"), true);
  });

  void it("an early-returning close failure retains real engine authority even when native teardown finishes later", async (t) => {
    const { engine, journal, calls } = await fixture(t);
    journal.orphanedCallPossible = false;
    await artifacts.updateOperation(journal);
    let nativeClosed = false;
    const finishNativeTeardown = (): void => { nativeClosed = true; };
    t.mock.method(engine.upstream, "callTool", () => Promise.resolve({ content: [{ type: "text", text: JSON.stringify({
      success: false, result: { error: { code: "EASYEDA_API_ERROR", message: "NATIVE_LIFECYCLE_CLOSE_UNSETTLED" } },
    }) }] }));
    await assert.rejects(engine.dispatchWithOrphanTracking(journal, "execute", "easyeda_execute", {}, 1000), /native-lifecycle-unsettled;execution-unsettled/u);
    assert.equal(nativeClosed, false);
    assert.equal(journal.orphanedCallPossible, true);
    assert.ok(journal.executionAuthorityBeforeOrphan);
    const retained = await artifacts.loadOperation(journal.operationId);
    assert.equal(retained["orphanedCallPossible"], true);
    assert.equal(calls.includes("release-capture-after-durable-clear"), false);
    assert.equal(calls.includes("end-dispatch"), false);
    assert.equal(calls.includes("abort-dispatch"), true);
    // A late event is not retained process-termination proof and cannot clear
    // The original journal or allow another close against the same runtime.
    finishNativeTeardown();
    assert.equal(nativeClosed, true);
    const afterLateCompletion = await artifacts.loadOperation(journal.operationId);
    assert.equal(afterLateCompletion["orphanedCallPossible"], true);
    await assert.rejects(engine.recoverDispatchAuthority(journal, undefined, () => Promise.resolve()));
    assert.equal(journal.orphanedCallPossible, true);
    assert.equal(calls.includes("release-capture-after-durable-clear"), false);
  });
});
