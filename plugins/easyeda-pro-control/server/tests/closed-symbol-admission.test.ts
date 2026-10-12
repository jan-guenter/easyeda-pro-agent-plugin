/* oxlint-disable import/max-dependencies -- Exercise the actual engine, runtime, managed recorder and native supervisor behind its synthetic transport. */
import assert from "node:assert/strict";
import fsPromises, { readFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";
import { test } from "node:test";
import { ClosedSymbolAdmissionStage } from "../src/closed-symbol-admission.ts";
import type { AdmissionPhase } from "../src/closed-symbol-admission.ts";
import { FAMILY, STEPS, appendClosedSymbolEvent, createClosedSymbolJournal, inspectClosedSymbolRestart, loadClosedSymbolJournal } from "../src/closed-symbol-journal.ts";
import type { ClosedJournal, Generation, LaunchGeneration } from "../src/closed-symbol-journal.ts";
import { loadOperation, updateOperation } from "../src/artifacts.ts";
import { newOperationId, sha256Json } from "../src/core.ts";
import { EasyedaControlEngine } from "../src/engine.ts";
import type { AuthenticatedBridgeDispatchBinding, ClosedSessionAuthorityCapture } from "../src/engine.ts";
import { WindowsControlRuntime } from "../src/windows-runtime.ts";
import type { WindowsControlRuntimeOptions } from "../src/windows-runtime.ts";
import type { WindowsAuthoritySupervisor } from "../src/windows-authority.ts";
import { closedSessionFixture } from "./helpers/windows-closed-session-fixture.ts";

const hash = "a".repeat(64), project = "b".repeat(64), target = "c".repeat(32);
const PHASES = ["baseline-admission", "edit-admission", "verify-admission"] as const;
interface State { scope: boolean; sequence: number; generation: string; reads: number; afterRead: ((count: number) => void | Promise<void>) | undefined }
type Upstream = WindowsControlRuntimeOptions["upstream"] & { findTool: () => Promise<{ name: string }> };
interface Fixture {
  engine: EasyedaControlEngine; journal: ClosedJournal; launch: Awaited<ReturnType<WindowsControlRuntime["launch"]>>;
  operationId: string; ordinal: number; owner: ReturnType<typeof closedSessionFixture>; phase: AdmissionPhase;
  runtime: WindowsControlRuntime; stage: ClosedSymbolAdmissionStage; state: State; upstream: Upstream; beforeCount: number;
  captures: () => number; dispose: () => Promise<void>;
}
async function fixture(phase: AdmissionPhase = "baseline-admission"): Promise<Fixture> {
  const owner = closedSessionFixture();
  const state: State = { scope: true, sequence: 1, generation: "synthetic-admission-runtime-0001", reads: 0, afterRead: undefined };
  const upstream: Upstream = {
    findTool(): Promise<{ name: string }> { return Promise.resolve({ name: "easyeda_execute" }); },
    bridgeSessionLifecycle(): ReturnType<WindowsControlRuntimeOptions["upstream"]["bridgeSessionLifecycle"]> {
      return { schema: "easyeda-pro-control.authenticated-bridge-lifecycle.v1", gatewayInstanceId: "g".repeat(43), activeSession: {
        sessionId: "s".repeat(43), sequence: state.sequence, authenticationReceiptSha256: "2".repeat(64), authenticatedAtEpochMs: 1000,
      }, publicEndpoint: { host: "127.0.0.1", port: 49_100 }, recentClosedSessions: [] };
    },
    currentAuthenticatedBridgeDispatchBinding(): AuthenticatedBridgeDispatchBinding | undefined {
      return state.scope ? { schema: "easyeda-pro-control.bridge-dispatch-lease.v1", gatewayInstanceId: "g".repeat(43), sessionId: "s".repeat(43),
        sessionSequence: state.sequence, begunAtEpochMs: 1001, leaseId: "l".repeat(43), bindingReceipt: "b".repeat(43) } : undefined;
    },
    async callTool(name: string, args?: Record<string, unknown>, _timeout?: number, binding?: AuthenticatedBridgeDispatchBinding): ReturnType<Upstream["callTool"]> {
      assert.equal(name, "easyeda_execute"); assert.ok(binding !== undefined);
      assert.equal(typeof args?.["code"], "string"); assert.match(String(args?.["code"]), /runtime-identity/u);
      state.reads += 1;
      const identity = { kind: "runtime-identity", generation: state.generation, timeOrigin: 1000, processId: 101 };
      await state.afterRead?.(state.reads);
      return { content: [{ type: "text", text: JSON.stringify(identity) }] };
    },
  };
  const runtime = new WindowsControlRuntime({ upstream, pluginRoot: "/opt/synthetic-control", assetsRoot: "/mnt/c/Synthetic/resources/app/assets",
    wslDistribution: "SyntheticReview", reviewedExecutionScopeSha256: owner.policy.reviewedExecutionScopeSha256 }, {
    hashExecutable(executable, assetsRoot): Promise<string> {
      assert.equal(executable, "/mnt/c/Synthetic/easyeda-pro.exe"); assert.equal(assetsRoot, "/mnt/c/Synthetic/resources/app/assets");
      return Promise.resolve(owner.policy.expectedExecutableSha256);
    },
    startSupervisor(options): Promise<WindowsAuthoritySupervisor> {
      assert.equal(options.expectedExecutable, owner.policy.expectedExecutable);
      assert.equal(options.expectedExecutableSha256, owner.policy.expectedExecutableSha256);
      return Promise.resolve(owner.supervisor);
    },
  });
  const launch = await runtime.launch();
  // Match the actual index-owned stable forwarding wrapper, not validator === runtime.
  const engine = new EasyedaControlEngine(upstream, { executionAuthorityValidator: {
    capture: (input): ReturnType<WindowsControlRuntime["capture"]> => runtime.capture(input),
    proveTerminated: (input): ReturnType<WindowsControlRuntime["proveTerminated"]> => runtime.proveTerminated(input),
    releaseCapture: (input): ReturnType<WindowsControlRuntime["releaseCapture"]> => runtime.releaseCapture(input),
  } }); await engine.controlFingerprintPromise;
  const ordinal = PHASES.indexOf(phase);
  const journal = await createClosedSymbolJournal(newOperationId(), { profile: FAMILY, projectUuid: project, branchUuid: "d".repeat(32), ownerUuid: "e".repeat(32), targetUuid: target,
    activeUuid: "f".repeat(32), projectPath: "/synthetic/not-opened.eprj2", operation: { id: "admission-synthetic", action: "library.symbol.modify", libraryUuid: project, target: { uuid: target }, patch: { name: "Synthetic" } },
    marker: { namespaceNonce: "1".repeat(64), keyNonce: "2".repeat(64), bodyNonce: "3".repeat(64) }, nativePinsSha256: hash, facadeSha256: hash, expectedFingerprintSha256: hash });
  // Prior phases are explicitly synthetic historical data, not executed stage
  // Proofs. The selected current launch is produced by the actual runtime.
  const beforeCount = STEPS.indexOf(phase) * 2;
  for (let index = 0; index < beforeCount; index += 1) {
    const step = STEPS[Math.floor(index / 2)]; assert.ok(step !== undefined);
    const kind = index % 2 === 0 ? "intent" : "result";
    const boundOrdinal = step.startsWith("baseline-") ? 0 : Number(step.startsWith("verify-")) + 1;
    const previousJob = String(boundOrdinal + 7).repeat(32);
    const receipt = boundOrdinal === ordinal ? launch : { jobId: previousJob, helperInstance: "b".repeat(32),
      root: { pid: boundOrdinal + 700, role: "easyeda-main", startIdentity: `win32:13436257345960252${String(boundOrdinal)}:job:${previousJob}` } };
    const partial: LaunchGeneration = { ordinal: boundOrdinal, helperInstance: receipt.helperInstance, jobId: receipt.jobId, rootPid: receipt.root.pid, rootStartIdentity: receipt.root.startIdentity };
    const full: Generation = { ...partial, runtimeSha256: hash, sessionSha256: hash, captureSha256: hash };
    let generation: Generation | LaunchGeneration | null = full;
    if (step.endsWith("-launch")) { generation = kind === "intent" ? null : partial; }
    else if (step.endsWith("-admission") && kind === "intent") { generation = partial; }
    await appendClosedSymbolEvent(journal, { step, kind, generation, requestSha256: sha256Json({ step }),
      data: step.endsWith("-launch") && kind === "result" ? { launchReceipt: receipt, launchReceiptSha256: sha256Json(receipt) } : { syntheticOnly: true } });
  }
  const operationId = journal.operationId, stage = new ClosedSymbolAdmissionStage(engine, runtime);
  return { engine, journal, launch, operationId, ordinal, owner, phase, runtime, stage, state, upstream, beforeCount,
    captures: (): number => owner.requests.filter((request) => request["action"] === "capture").length,
    async dispose(): Promise<void> {
      const retained = await loadOperation(operationId); retained["state"] = "completed"; retained["orphanedCallPossible"] = false; await updateOperation(retained);
    } };
}

for (const phase of PHASES) {
  void test(`${phase} records partial intent before actual capture, retains the original and derives exact full hashes`, async (context) => {
    const value = await fixture(phase);
    const originalCapture = value.engine.captureClosedSessionAuthority.bind(value.engine);
    let original: ClosedSessionAuthorityCapture | undefined;
    context.mock.method(value.engine, "captureClosedSessionAuthority", async (...args: Parameters<typeof originalCapture>) => {
      const before = await loadClosedSymbolJournal(value.operationId);
      assert.equal(before.events.at(-1)?.kind, "intent"); assert.equal(before.events.at(-1)?.step, phase);
      assert.equal(Object.hasOwn(before.events.at(-1)?.generation ?? {}, "captureSha256"), false);
      assert.equal(value.captures(), 0);
      original = await originalCapture(...args); return original;
    });
    try {
      const result = await value.stage.admit(value.journal, phase);
      assert.equal(result.capture, original); assert.equal(value.stage.originalCapture(value.operationId, phase), original);
      assert.equal(new ClosedSymbolAdmissionStage(value.engine, value.runtime).originalCapture(value.operationId, phase), original);
      assert.equal(result.generation.ordinal, value.ordinal); assert.equal(result.generation.captureSha256, sha256Json(original));
      assert.equal(result.generation.runtimeSha256, sha256Json(original?.runtimeIdentity)); assert.equal(result.generation.sessionSha256, sha256Json(original?.bridgeSession));
      assert.equal(result.executionAuthorized, false); assert.equal(result.startupQualified, false); assert.equal(result.completionProved, false);
      assert.equal(value.state.reads, 3); assert.equal(value.captures(), 1);
      const retained = await loadClosedSymbolJournal(value.operationId);
      assert.equal(retained.journal.sequence, value.beforeCount + 2); assert.equal(retained.journal.saved, false); assert.equal(retained.journal.reopened, false);
      assert.deepEqual(retained.events.at(-1)?.data, { capture: original, captureSha256: sha256Json(original) });
      const inspection = await inspectClosedSymbolRestart(value.operationId); assert.equal(inspection["authorityRestored"], false);
      await assert.rejects(value.engine.releaseClosedSessionAuthority(structuredClone(result.capture)), /original/u);
      // The exact original reaches the actual retained supervisor close binding.
      // This tests capture provenance, not stage-level permission to close.
      const intent = await value.runtime.prepareClosedSessionClose({ ...result.capture, windowHandle: "12345" });
      assert.equal(intent.operationId, value.operationId); assert.equal(intent.jobId, value.launch.jobId);
      await value.engine.releaseClosedSessionAuthority(result.capture);
      assert.equal(value.owner.requests.filter((request) => request["action"] === "release-capture").length, 1);
    } finally { await value.dispose(); }
  });
}

void test("same/new stages consume one attempt even after failure and cannot replay a retained result", async () => {
  const value = await fixture();
  try {
    await value.stage.admit(value.journal, value.phase);
    for (const stage of [value.stage, new ClosedSymbolAdmissionStage(value.engine, value.runtime)]) { await assert.rejects(stage.admit(value.journal, value.phase), /consumed/u); }
    const other = new EasyedaControlEngine(value.upstream, { executionAuthorityValidator: value.runtime }); await other.controlFingerprintPromise;
    const replacement = new ClosedSymbolAdmissionStage(other, value.runtime);
    assert.equal(replacement.originalCapture(value.operationId, value.phase), undefined);
    await assert.rejects(replacement.admit(value.journal, value.phase), /last acknowledged launch/u);
    assert.equal(value.captures(), 1);
  } finally { await value.dispose(); }
});

void test("concurrent new stage cannot enter while actual capture is pending", async (context) => {
  const entered = Promise.withResolvers<null>(), gate = Promise.withResolvers<null>(), value = await fixture();
  const capture = value.engine.captureClosedSessionAuthority.bind(value.engine);
  context.mock.method(value.engine, "captureClosedSessionAuthority", async (...args: Parameters<typeof capture>) => { entered.resolve(null); await gate.promise; return capture(...args); });
  const pending = value.stage.admit(value.journal, value.phase);
  try {
    await entered.promise; await assert.rejects(new ClosedSymbolAdmissionStage(value.engine, value.runtime).admit(value.journal, value.phase), /consumed/u);
    assert.equal(value.captures(), 0); gate.resolve(null); await pending; assert.equal(value.captures(), 1);
  } finally { gate.resolve(null); await pending; await value.dispose(); }
});

for (const invalid of ["scope", "observer", "runtime", "validator", "stale", "quarantine", "phase"] as const) {
  void test(`initial ${invalid} refuses before any runtime probe or authority capture`, async () => {
    const value = await fixture();
    try {
      if (invalid === "scope") { value.state.scope = false; }
      if (invalid === "observer") { Reflect.deleteProperty(value.upstream, "currentAuthenticatedBridgeDispatchBinding"); }
      if (invalid === "runtime") { await value.runtime.release(); }
      if (invalid === "validator") { Object.defineProperty(value.engine, "executionAuthorityValidator", { value: value.owner.supervisor }); }
      if (invalid === "stale") { value.journal.sequence += 1; }
      if (invalid === "quarantine") { value.journal.hardStop = true; await updateOperation(value.journal); }
      await assert.rejects(value.stage.admit(value.journal, invalid === "phase" ? "verify-admission" : value.phase));
      assert.equal(value.state.reads, 0); assert.equal(value.captures(), 0); assert.equal(value.stage.originalCapture(value.operationId, value.phase), undefined);
    } finally { await value.dispose(); }
  });
}

for (const at of ["guard", "intent", "capture"] as const) {
  for (const mutation of ["operationId", "saved", "plan"] as const) {
    void test(`${mutation} caller mutation at ${at} never contaminates the working journal or existing peer`, async (context) => {
      const peer = await fixture(), value = await fixture(); await peer.dispose();
      const peerBytes = await readFile(peer.journal.journalPath);
      const mutate = (): void => {
        if (mutation === "operationId") { value.journal.operationId = peer.operationId; }
        else if (mutation === "saved") { value.journal.saved = true; }
        else { Object.defineProperty(value.journal.plan, "targetUuid", { value: "9".repeat(32) }); }
      };
      const guard = value.engine.assertRecoveryOperationIsolated.bind(value.engine), link = fsPromises.link;
      if (at === "guard") { context.mock.method(value.engine, "assertRecoveryOperationIsolated", async (id: string) => { const result = await guard(id); mutate(); return result; }); }
      if (at === "intent") { context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>) => { await link(...args); if (basename(String(args[1])).endsWith("admission-intent.json")) { mutate(); } }); syncBuiltinESMExports(); }
      if (at === "capture") { value.owner.behavior.afterRequest = (action): void => { if (action === "capture") { mutate(); } }; }
      try {
        await assert.rejects(value.stage.admit(value.journal, value.phase), /caller changed/u);
        assert.deepEqual(await readFile(peer.journal.journalPath), peerBytes);
        const retained = await loadClosedSymbolJournal(value.operationId);
        assert.equal(retained.journal.saved, false); assert.equal(retained.journal.plan.targetUuid, target);
        assert.equal(value.captures(), at === "capture" ? 1 : 0);
        assert.equal(retained.events.at(-1)?.kind, at === "intent" ? "intent" : "result");
        assert.equal(value.stage.originalCapture(value.operationId, value.phase) !== undefined, at === "capture");
      } finally { context.mock.restoreAll(); syncBuiltinESMExports(); await value.dispose(); }
    });
  }
}

for (const boundary of ["guard", "intent", "result"] as const) {
  for (const changed of ["scope", "session", "observer"] as const) {
    void test(`${changed} drift after ${boundary} is refused without losing a returned capture`, async (context) => {
      const link = fsPromises.link, value = await fixture();
      const change = (): void => {
        if (changed === "scope") { value.state.scope = false; }
        if (changed === "session") { value.state.sequence += 1; }
        if (changed === "observer") { const previous = value.upstream.currentAuthenticatedBridgeDispatchBinding.bind(value.upstream); value.upstream.currentAuthenticatedBridgeDispatchBinding = (): AuthenticatedBridgeDispatchBinding | undefined => previous(); }
      };
      const guard = value.engine.assertRecoveryOperationIsolated.bind(value.engine);
      if (boundary === "guard") { context.mock.method(value.engine, "assertRecoveryOperationIsolated", async (id: string) => { const result = await guard(id); change(); return result; }); }
      else { context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>) => { await link(...args); if (basename(String(args[1])).endsWith(`admission-${boundary}.json`)) { change(); } }); syncBuiltinESMExports(); }
      try {
        await assert.rejects(value.stage.admit(value.journal, value.phase), /scope changed/u);
        assert.equal(value.captures(), boundary === "result" ? 1 : 0);
        assert.equal(value.stage.originalCapture(value.operationId, value.phase) !== undefined, boundary === "result");
        if (boundary === "result") { const retained = await loadClosedSymbolJournal(value.operationId); assert.equal(retained.events.at(-1)?.kind, "result"); }
      } finally { context.mock.restoreAll(); syncBuiltinESMExports(); await value.dispose(); }
    });
  }
}

void test("native runtime drift on post-publication read retains capture/result and rejects current admission", async () => {
  const value = await fixture();
  value.owner.behavior.afterRequest = (action): void => { if (action === "capture") { value.state.afterRead = (count): void => { if (count === 2) { value.state.generation = "synthetic-admission-runtime-0002"; } }; } };
  try {
    await assert.rejects(value.stage.admit(value.journal, value.phase), /current native runtime changed/u);
    assert.equal(value.captures(), 1); assert.equal(value.state.reads, 3);
    assert.ok(value.stage.originalCapture(value.operationId, value.phase) !== undefined);
    const retained = await loadClosedSymbolJournal(value.operationId); assert.equal(retained.events.at(-1)?.kind, "result");
  } finally { await value.dispose(); }
});

void test("mutation through retained original accessor during result publication cannot poison recorded capture", async (context) => {
  const link = fsPromises.link, value = await fixture();
  context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>) => {
    await link(...args);
    if (basename(String(args[1])).endsWith("admission-result.json")) {
      const original = value.stage.originalCapture(value.operationId, value.phase); assert.ok(original !== undefined);
      original.runtimeIdentity.generation = "mutated-original";
    }
  }); syncBuiltinESMExports();
  try {
    await assert.rejects(value.stage.admit(value.journal, value.phase), /original capture changed/u);
    const retained = await loadClosedSymbolJournal(value.operationId);
    assert.match(JSON.stringify(retained.events.at(-1)?.data), /synthetic-admission-runtime-0001/u);
    assert.doesNotMatch(JSON.stringify(retained.events.at(-1)?.data), /mutated-original/u); assert.equal(value.captures(), 1);
  } finally { context.mock.restoreAll(); syncBuiltinESMExports(); await value.dispose(); }
});

void test("uncertain native capture retains intent only and cannot be repeated", async () => {
  const value = await fixture(); value.owner.behavior.errorAction = "capture";
  try {
    await assert.rejects(value.stage.admit(value.journal, value.phase), /synthetic helper/u);
    assert.equal(value.stage.originalCapture(value.operationId, value.phase), undefined);
    const inspection = await inspectClosedSymbolRestart(value.operationId); assert.equal(inspection["classification"], "intent-without-result");
    await assert.rejects(new ClosedSymbolAdmissionStage(value.engine, value.runtime).admit(value.journal, value.phase), /consumed/u);
    assert.equal(value.captures(), 1);
  } finally { await value.dispose(); }
});

for (const failure of ["result-artifact", "result-journal-before", "result-journal-after"] as const) {
  void test(`${failure} preserves original in-memory capture without granting retry or completion`, async (context) => {
    const link = fsPromises.link, rename = fsPromises.rename, value = await fixture();
    let replacements = 0;
    context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>) => {
      if (failure === "result-artifact" && basename(String(args[1])).endsWith("admission-result.json")) { throw new Error("Synthetic publication failure"); }
      await link(...args);
    });
    context.mock.method(fsPromises, "rename", async (...args: Parameters<typeof rename>) => {
      const selected = basename(String(args[1])) === `${value.operationId}.json`;
      if (selected) { replacements += 1; }
      if (selected && replacements === 2 && failure === "result-journal-before") { throw new Error("Synthetic publication failure"); }
      await rename(...args);
      if (selected && replacements === 2 && failure === "result-journal-after") { throw new Error("Synthetic publication failure"); }
    }); syncBuiltinESMExports();
    try {
      await assert.rejects(value.stage.admit(value.journal, value.phase), /publication failure/u);
      const original = value.stage.originalCapture(value.operationId, value.phase); assert.ok(original !== undefined);
      assert.equal(new ClosedSymbolAdmissionStage(value.engine, value.runtime).originalCapture(value.operationId, value.phase), original);
      assert.equal(value.captures(), 1);
      if (failure === "result-journal-before") { await assert.rejects(inspectClosedSymbolRestart(value.operationId), /Unreferenced/u); }
      else { const inspection = await inspectClosedSymbolRestart(value.operationId); assert.equal(inspection["classification"], failure === "result-artifact" ? "intent-without-result" : "after-result"); }
      await assert.rejects(value.stage.admit(value.journal, value.phase), /consumed/u);
      // Test explicit engine cleanup ownership only. The stage itself never
      // Releases, closes or pretends an incomplete publication is admission.
      await value.engine.releaseClosedSessionAuthority(original);
    } finally { context.mock.restoreAll(); syncBuiltinESMExports(); await value.dispose(); }
  });
}

for (const boundary of ["guard", "result"] as const) {
  for (const changed of ["runtime", "validator", "capture-forwarder", "session-reader"] as const) {
    void test(`${changed} identity change after ${boundary} refuses at the correct pre/post-capture boundary`, async (context) => {
      const link = fsPromises.link, value = await fixture();
      const change = async (): Promise<void> => {
        if (changed === "runtime") { await value.runtime.release(); }
        if (changed === "validator") { Object.defineProperty(value.engine, "executionAuthorityValidator", { value: value.owner.supervisor }); }
        if (changed === "capture-forwarder") {
          const validator = value.engine.executionAuthorityValidator; assert.ok(validator !== undefined);
          Object.defineProperty(validator, "capture", { value: value.runtime.capture.bind(value.runtime) });
        }
        if (changed === "session-reader") { const previous = value.upstream.bridgeSessionLifecycle.bind(value.upstream); value.upstream.bridgeSessionLifecycle = (): ReturnType<Upstream["bridgeSessionLifecycle"]> => previous(); }
      };
      const guard = value.engine.assertRecoveryOperationIsolated.bind(value.engine);
      if (boundary === "guard") { context.mock.method(value.engine, "assertRecoveryOperationIsolated", async (id: string) => { const result = await guard(id); await change(); return result; }); }
      else { context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>) => { await link(...args); if (basename(String(args[1])).endsWith("admission-result.json")) { await change(); } }); syncBuiltinESMExports(); }
      try {
        await assert.rejects(value.stage.admit(value.journal, value.phase), /changed/u);
        assert.equal(value.captures(), boundary === "guard" ? 0 : 1);
        assert.equal(value.stage.originalCapture(value.operationId, value.phase) !== undefined, boundary === "result");
        const retained = await loadClosedSymbolJournal(value.operationId);
        assert.equal(retained.events.at(-1)?.step, boundary === "guard" ? "baseline-launch" : "baseline-admission");
      } finally { context.mock.restoreAll(); syncBuiltinESMExports(); await value.dispose(); }
    });
  }
}

for (const changed of ["scope", "runtime"] as const) {
  void test(`actual engine ${changed} failure after native capture cleans its handle without fabricating a returned capture`, async () => {
    const value = await fixture();
    value.owner.behavior.afterRequest = (action): void => {
      if (action === "capture") { if (changed === "scope") { value.state.scope = false; } else { value.state.generation = "synthetic-admission-runtime-engine-drift-0002"; } }
    };
    try {
      await assert.rejects(value.stage.admit(value.journal, value.phase), changed === "scope" ? /exact authenticated/u : /capture changed/u);
      assert.equal(value.captures(), 1); assert.equal(value.stage.originalCapture(value.operationId, value.phase), undefined);
      assert.equal(value.owner.requests.filter((request) => request["action"] === "release-capture").length, 1);
      const inspection = await inspectClosedSymbolRestart(value.operationId); assert.equal(inspection["classification"], "intent-without-result");
    } finally { await value.dispose(); }
  });
}

void test("a different actual launch on the same runtime cannot replace the recorded generation", async () => {
  const value = await fixture();
  try {
    const replacement = await value.runtime.launch(); assert.notEqual(replacement.jobId, value.launch.jobId);
    await assert.rejects(value.stage.admit(value.journal, value.phase), /recorded launch/u);
    assert.equal(value.captures(), 0); assert.equal(value.state.reads, 0);
  } finally { await value.dispose(); }
});

void test("durable next-phase advance during final runtime read refuses stale admission and preserves both records", async () => {
  const value = await fixture(); let advanced = false;
  value.state.afterRead = async (count): Promise<void> => {
    if (count !== 3) { return; }
    const retained = await loadClosedSymbolJournal(value.operationId);
    const generation = retained.events.at(-1)?.generation;
    assert.ok(generation !== null && generation !== undefined); assert.equal(retained.journal.sequence, 4);
    await appendClosedSymbolEvent(retained.journal, { step: "baseline-marker-create", kind: "intent", generation,
      requestSha256: sha256Json({ concurrent: "synthetic-next-phase" }), data: { syntheticOnly: true } });
    advanced = true;
  };
  try {
    await assert.rejects(value.stage.admit(value.journal, value.phase), /durable journal changed/u);
    assert.equal(advanced, true); assert.equal(value.captures(), 1); assert.equal(value.journal.sequence, 2);
    const retained = await loadClosedSymbolJournal(value.operationId);
    assert.equal(retained.journal.sequence, 5); assert.equal(retained.events[3]?.step, "baseline-admission"); assert.equal(retained.events[4]?.step, "baseline-marker-create");
    assert.ok(value.stage.originalCapture(value.operationId, value.phase) !== undefined);
  } finally { await value.dispose(); }
});

for (const mutation of ["caller", "scope", "original"] as const) {
  void test(`${mutation} drift during final durable reload cannot escape the final checks`, async (context) => {
    const open = fsPromises.open, value = await fixture(); let finalRead = false, injected = false;
    value.state.afterRead = (count): void => { if (count === 3) { finalRead = true; } };
    context.mock.method(fsPromises, "open", async (...args: Parameters<typeof open>) => {
      const handle = await open(...args);
      if (finalRead && !injected && basename(String(args[0])) === `${value.operationId}.json`) {
        injected = true;
        if (mutation === "caller") { value.journal.saved = true; }
        else if (mutation === "scope") { value.state.scope = false; }
        else { const original = value.stage.originalCapture(value.operationId, value.phase); assert.ok(original !== undefined); original.runtimeIdentity.generation = "changed-original-at-final-read"; }
      }
      return handle;
    }); syncBuiltinESMExports();
    try {
      await assert.rejects(value.stage.admit(value.journal, value.phase), /changed/u);
      assert.equal(injected, true); assert.equal(value.captures(), 1); assert.equal(value.journal.sequence, 2);
      const retained = await loadClosedSymbolJournal(value.operationId); assert.equal(retained.journal.sequence, 4); assert.equal(retained.journal.saved, false);
    } finally { context.mock.restoreAll(); syncBuiltinESMExports(); await value.dispose(); }
  });
}
