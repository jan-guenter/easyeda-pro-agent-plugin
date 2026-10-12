/* oxlint-disable import/max-dependencies -- This integration suite exercises the actual managed store, engine, runtime and supervisor together. */
import assert from "node:assert/strict";
import fsPromises, { readFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";
import { test } from "node:test";
import { ClosedSymbolCloseStage } from "../src/closed-symbol-close.ts";
import { ClosedSymbolBootstrapLaunchStage } from "../src/closed-symbol-launch.ts";
import { FAMILY, appendClosedSymbolEvent, createClosedSymbolJournal, loadClosedSymbolJournal } from "../src/closed-symbol-journal.ts";
import { loadOperation, updateOperation } from "../src/artifacts.ts";
import { newOperationId, sha256Json } from "../src/core.ts";
import { EasyedaControlEngine } from "../src/engine.ts";
import type { AuthenticatedBridgeDispatchBinding } from "../src/engine.ts";
import { WindowsControlRuntime } from "../src/windows-runtime.ts";
import type { WindowsControlRuntimeOptions } from "../src/windows-runtime.ts";
import { assertClosedSessionCopyAuthority } from "../src/windows-authority.ts";
import { closedSessionFixture } from "./helpers/windows-closed-session-fixture.ts";

const hash = "a".repeat(64), project = "b".repeat(64), target = "c".repeat(32);
type CloseInput = Parameters<ClosedSymbolCloseStage["close"]>[0];
type Upstream = WindowsControlRuntimeOptions["upstream"];
interface Fixture {
  stage: ClosedSymbolCloseStage; journal: CloseInput["journal"]; generation: CloseInput["generation"]; capture: CloseInput["capture"];
  runtime: WindowsControlRuntime; owner: ReturnType<typeof closedSessionFixture>; engine: EasyedaControlEngine;
  upstream: { -readonly [Key in keyof Upstream]: Upstream[Key] }; state: { scope: boolean; runtimeReads: number }; operationId: string;
  input: { -readonly [Key in keyof CloseInput]: CloseInput[Key] };
  calls: (action: string) => number; dispose: () => Promise<void>;
}
async function fixture(): Promise<Fixture> {
  const owner = closedSessionFixture();
  const state = { scope: false, runtimeReads: 0 };
  const upstream = {
    findTool(): Promise<{ name: string }> { return Promise.resolve({ name: "easyeda_execute" }); },
    callTool(name: string): Promise<{ content: { type: "text"; text: string }[] }> {
      assert.equal(name, "easyeda_execute"); state.runtimeReads += 1;
      return Promise.resolve({ content: [{ type: "text", text: JSON.stringify({ kind: "runtime-identity", generation: "synthetic-runtime-generation-0001", timeOrigin: 1000, processId: 101 }) }] });
    },
    bridgeSessionLifecycle(): ReturnType<Upstream["bridgeSessionLifecycle"]> { return { schema: "easyeda-pro-control.authenticated-bridge-lifecycle.v1" as const,
      gatewayInstanceId: "g".repeat(43), activeSession: { sessionId: "s".repeat(43), sequence: 1, authenticationReceiptSha256: "2".repeat(64), authenticatedAtEpochMs: 1000 },
      publicEndpoint: { host: "127.0.0.1" as const, port: 49_100 }, recentClosedSessions: [] }; },
    currentAuthenticatedBridgeDispatchBinding(): AuthenticatedBridgeDispatchBinding | undefined {
      return state.scope ? { schema: "easyeda-pro-control.bridge-dispatch-lease.v1", gatewayInstanceId: "g".repeat(43), sessionId: "s".repeat(43), sessionSequence: 1,
        begunAtEpochMs: 1001, leaseId: "l".repeat(43), bindingReceipt: "b".repeat(43) } : undefined;
    },
  };
  const runtime = new WindowsControlRuntime({ upstream, pluginRoot: "/opt/synthetic-control", assetsRoot: "/mnt/c/Synthetic/resources/app/assets", wslDistribution: "SyntheticReview",
    reviewedExecutionScopeSha256: owner.policy.reviewedExecutionScopeSha256 }, {
    hashExecutable: (): Promise<string> => Promise.resolve(owner.policy.expectedExecutableSha256),
    startSupervisor: (): Promise<typeof owner.supervisor> => Promise.resolve(owner.supervisor),
  });
  const engine = new EasyedaControlEngine(upstream, { executionAuthorityValidator: runtime });
  await engine.controlFingerprintPromise;
  const journal = await createClosedSymbolJournal(newOperationId(), { profile: FAMILY, projectUuid: project, branchUuid: "d".repeat(32), ownerUuid: "e".repeat(32), targetUuid: target,
    activeUuid: "f".repeat(32), projectPath: "/synthetic/not-opened.eprj2", operation: { id: "close-synthetic", action: "library.symbol.modify", libraryUuid: project, target: { uuid: target }, patch: { name: "Synthetic" } },
    marker: { namespaceNonce: "1".repeat(64), keyNonce: "2".repeat(64), bodyNonce: "3".repeat(64) }, nativePinsSha256: hash, facadeSha256: hash, expectedFingerprintSha256: hash });
  const operationId = journal.operationId;
  const first = await new ClosedSymbolBootstrapLaunchStage(engine, runtime).launch(journal);
  await appendClosedSymbolEvent(journal, { step: "baseline-admission", kind: "intent", generation: first.generation, requestSha256: hash, data: { synthetic: "capture next" } });
  state.scope = true;
  const capture = await engine.captureClosedSessionAuthority(operationId, "closed-baseline", 1);
  const generation = { ...first.generation, captureSha256: sha256Json(capture), runtimeSha256: sha256Json(capture.runtimeIdentity), sessionSha256: sha256Json(capture.bridgeSession) };
  await appendClosedSymbolEvent(journal, { step: "baseline-admission", kind: "result", generation, requestSha256: hash, data: { capture } });
  // This suite tests only close orchestration. Marker records are synthetic
  // Prerequisites, not claims that a storage operation or bridge program ran.
  for (const kind of ["intent", "result"] as const) {
    await appendClosedSymbolEvent(journal, { step: "baseline-marker-create", kind, generation, requestSha256: hash, data: { synthetic: "marker prerequisite" } });
  }
  state.scope = false;
  const stage = new ClosedSymbolCloseStage(engine, runtime);
  return { stage, journal, generation, capture, runtime, owner, upstream, state, engine, operationId,
    input: { journal, generation, capture, phase: "baseline-close" as const, windowHandle: "12345" },
    calls: (action: string): number => owner.requests.filter((request) => request["action"] === action).length,
    async dispose(): Promise<void> { const loaded = await loadOperation(operationId); loaded["state"] = "completed"; loaded["orphanedCallPossible"] = false; await updateOperation(loaded); },
  };
}

void test("real engine capture reaches actual runtime close and separately issued termination proof", async () => {
  const value = await fixture();
  try {
    const result = await value.stage.close(value.input);
    assert.equal(value.calls("normal-close"), 1); assert.equal(value.calls("prove-terminated"), 0);
    assert.equal(result.terminationProved, false); assert.equal(result.completionProved, false); assert.equal(result.executionAuthorized, false);
    const retained = await loadClosedSymbolJournal(value.operationId);
    assert.equal(retained.events.at(-1)?.step, "baseline-close"); assert.equal(retained.events.at(-1)?.kind, "result");
    assert.equal(retained.journal.saved, false); assert.equal(retained.journal.reopened, false);
    assert.equal(value.stage.originalResult(value.operationId, "baseline-close"), result);
    const proof = await value.stage.prove(result);
    assert.equal(await assertClosedSessionCopyAuthority(proof), proof);
    assert.equal(value.calls("prove-terminated"), 1); assert.equal(value.calls("normal-close"), 1); assert.equal(value.calls("release-capture"), 0);
    assert.equal(value.state.runtimeReads, 2); assert.equal(proof.queuedWritesPersisted, "not-proved");
  } finally { await value.dispose(); }
});

void test("same and new close stages cannot repeat one acknowledged close", async () => {
  const value = await fixture();
  try {
    await value.stage.close(value.input);
    for (const stage of [value.stage, new ClosedSymbolCloseStage(value.engine, value.runtime)]) { await assert.rejects(stage.close(value.input), /consumed/u); }
    assert.equal(value.calls("normal-close"), 1);
  } finally { await value.dispose(); }
});

void test("uncertain close keeps its intent and never retries or invents result", async () => {
  const value = await fixture(); value.owner.behavior.errorAction = "normal-close";
  try {
    await assert.rejects(value.stage.close(value.input), /helper request/u);
    const loaded = await loadClosedSymbolJournal(value.operationId); assert.equal(loaded.events.at(-1)?.kind, "intent");
    assert.equal(value.stage.originalResult(value.operationId, "baseline-close"), undefined);
    await assert.rejects(value.stage.close(value.input), /consumed/u); assert.equal(value.calls("normal-close"), 1);
  } finally { await value.dispose(); }
});

void test("a not-yet-empty retained Job can be queried again without another close", async () => {
  const value = await fixture();
  try {
    const result = await value.stage.close(value.input); value.owner.behavior.termination["jobEmpty"] = false;
    await assert.rejects(value.stage.prove(result), /entire retained/u);
    value.owner.behavior.termination["jobEmpty"] = true;
    const proof = await value.stage.prove(result); assert.equal(proof.jobEmpty, true);
    assert.equal(value.calls("normal-close"), 1); assert.equal(value.calls("prove-terminated"), 2);
    await assert.rejects(value.stage.prove(structuredClone(result)), /original/u);
  } finally { await value.dispose(); }
});

for (const change of ["scope", "missing", "replacement", "runtime", "capture", "generation", "window"] as const) {
  void test(`invalid ${change} refuses before native close`, async () => {
    const value = await fixture();
    if (change === "scope") { value.state.scope = true; }
    if (change === "missing") { Reflect.deleteProperty(value.upstream, "currentAuthenticatedBridgeDispatchBinding"); }
    if (change === "runtime") { await value.runtime.release(); }
    if (change === "capture") { value.capture.runtimeIdentity.generation = "wrong"; }
    if (change === "generation") { Reflect.set(value.generation, "rootPid", value.generation.rootPid + 1); }
    if (change === "window") { value.input.windowHandle = "0"; }
    if (change === "replacement") { value.owner.behavior.onHelperCheck = (): Promise<void> => { value.upstream.currentAuthenticatedBridgeDispatchBinding = (): undefined => undefined; return Promise.resolve(); }; }
    try { await assert.rejects(value.stage.close(value.input)); assert.equal(value.calls("normal-close"), 0); }
    finally { await value.dispose(); }
  });
}

for (const boundary of ["intent", "close"] as const) {
  for (const change of ["operationId", "saved", "plan", "scope", "missing"] as const) {
    void test(`${change} changes at ${boundary} preserve original journal and acknowledged result`, async (context) => {
      const value = await fixture(); const link = fsPromises.link; let changed = false;
      const mutate = (): void => {
        changed = true;
        if (change === "operationId") { value.journal.operationId = "synthetic-peer"; }
        if (change === "saved") { value.journal.saved = true; }
        if (change === "plan") { value.journal.plan.operation.patch.name = "Wrong"; }
        if (change === "scope") { value.state.scope = true; }
        if (change === "missing") { Reflect.deleteProperty(value.upstream, "currentAuthenticatedBridgeDispatchBinding"); }
      };
      if (boundary === "intent") { context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>): Promise<void> => { await link(...args); if (basename(String(args[1])) === "07-baseline-close-intent.json") { mutate(); } }); syncBuiltinESMExports(); }
      else { value.owner.behavior.afterRequest = (action): void => { if (action === "normal-close") { mutate(); } }; }
      try {
        await assert.rejects(value.stage.close(value.input)); assert.equal(changed, true);
        const loaded = await loadClosedSymbolJournal(value.operationId);
        assert.equal(loaded.journal.operationId, value.operationId); assert.equal(loaded.journal.saved, false); assert.equal(loaded.journal.plan.operation.patch.name, "Synthetic");
        assert.equal(loaded.events.at(-1)?.kind, boundary === "intent" ? "intent" : "result");
        assert.equal(value.calls("normal-close"), boundary === "intent" ? 0 : 1);
        assert.equal(value.stage.originalResult(value.operationId, "baseline-close") !== undefined, boundary === "close");
      } finally { context.mock.restoreAll(); syncBuiltinESMExports(); await value.dispose(); }
    });
  }
}

for (const boundary of ["artifact", "journal-before", "journal-after"] as const) {
  void test(`failed result ${boundary} publication preserves one close and original in-memory receipt`, async (context) => {
    const value = await fixture(); const link = fsPromises.link, rename = fsPromises.rename; let updates = 0;
    context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>): Promise<void> => {
      if (boundary === "artifact" && basename(String(args[1])) === "08-baseline-close-result.json") { throw new Error("Synthetic publication failed"); }
      await link(...args);
    });
    context.mock.method(fsPromises, "rename", async (...args: Parameters<typeof rename>): Promise<void> => {
      if (basename(String(args[1])) === `${value.operationId}.json`) { updates += 1; }
      if (updates === 2 && boundary === "journal-before") { throw new Error("Synthetic publication failed"); }
      await rename(...args);
      if (updates === 2 && boundary === "journal-after") { throw new Error("Synthetic publication failed"); }
    }); syncBuiltinESMExports();
    try {
      await assert.rejects(value.stage.close(value.input), /publication/u);
      const result = value.stage.originalResult(value.operationId, "baseline-close"); assert.ok(result !== undefined);
      await assert.rejects(value.stage.prove(result), /durably recorded/u);
      await assert.rejects(value.stage.close(value.input), /consumed/u); assert.equal(value.calls("normal-close"), 1);
    } finally { context.mock.restoreAll(); syncBuiltinESMExports(); await value.dispose(); }
  });
}

void test("proof result or journal mutation refuses without another native close or proof", async () => {
  const value = await fixture();
  try {
    const result = await value.stage.close(value.input); const before = await readFile(value.journal.journalPath);
    Reflect.set(result.intent, "windowHandle", "999");
    await assert.rejects(value.stage.prove(result), /original/u);
    assert.deepEqual(await readFile(value.journal.journalPath), before); assert.equal(value.calls("prove-terminated"), 0); assert.equal(value.calls("normal-close"), 1);
  } finally { await value.dispose(); }
});

void test("independent proof refuses a sealed journal advance during retained native proof", async () => {
  const value = await fixture(); let advanced = false;
  try {
    const result = await value.stage.close(value.input);
    value.owner.behavior.onHelperCheck = async (): Promise<void> => {
      if (!advanced) {
        advanced = true;
        await appendClosedSymbolEvent(value.journal, { step: "baseline-copy", kind: "intent", generation: value.generation, requestSha256: hash, data: { synthetic: "concurrent copy intent; no copy executes" } });
      }
    };
    await assert.rejects(value.stage.prove(result), /journal.*(?:advanced|changed)/u);
    assert.equal(advanced, true); assert.equal(value.calls("normal-close"), 1); assert.equal(value.calls("prove-terminated"), 1);
  } finally { await value.dispose(); }
});

void test("independent concurrent proof refuses the second caller without a second native query", async () => {
  const value = await fixture(); const entered = Promise.withResolvers<null>(); const release = Promise.withResolvers<null>();
  let waiting = true;
  try {
    const result = await value.stage.close(value.input);
    const before = await readFile(value.journal.journalPath);
    value.owner.behavior.onHelperCheck = async (): Promise<void> => {
      if (waiting) { waiting = false; entered.resolve(null); await release.promise; }
    };
    const first = value.stage.prove(result);
    await entered.promise;
    await assert.rejects(value.stage.prove(result), /unchanged original/u);
    release.resolve(null);
    const proof = await first; assert.equal(proof.jobEmpty, true);
    assert.equal(value.calls("normal-close"), 1); assert.equal(value.calls("prove-terminated"), 1);
    assert.deepEqual(await readFile(value.journal.journalPath), before);
  } finally { release.resolve(null); await value.dispose(); }
});

for (const change of ["intent", "receipt", "generation", "scope"] as const) {
  void test(`independent ${change} mutation at the proof return cannot yield stage admission`, async () => {
    const value = await fixture(); let mutated = false;
    try {
      const result = await value.stage.close(value.input);
      value.owner.behavior.afterRequest = (action): void => {
        if (action === "prove-terminated") {
          mutated = true;
          if (change === "intent") { Reflect.set(result.intent, "windowHandle", "999"); }
          else if (change === "receipt") { Reflect.set(result.closeReceipt, "terminationProved", true); }
          else if (change === "generation") { Reflect.set(result.generation, "captureSha256", "b".repeat(64)); }
          else { value.state.scope = true; }
        }
      };
      await assert.rejects(value.stage.prove(result));
      assert.equal(mutated, true); assert.equal(value.calls("normal-close"), 1); assert.equal(value.calls("prove-terminated"), 1);
    } finally { await value.dispose(); }
  });
}
