/* oxlint-disable import/max-dependencies -- Exercise the unchanged coordinator with actual managed journals, engine captures and native authority issuers in one isolated fixture. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { basename } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import vm from "node:vm";
import { z } from "zod";
import { createOperation, loadOperation, operationPath, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, canonicalJson, isRecord, newOperationId, sha256Json } from "../src/core.ts";
import type { CurrentSymbolBaselineOwner } from "../src/current-disposable-open-runtime.ts";
import type { CurrentSymbolBaselineCoordinator } from "../src/current-symbol-baseline-runtime.ts";
import { currentSymbolMetadataPreparationRequestSchema } from "../src/current-symbol-metadata-preparation.ts";
import { EasyedaControlEngine } from "../src/engine.ts";
import type { AuthenticatedBridgeDispatchBinding } from "../src/engine.ts";
import { assertClosedSessionCopyAuthority, assertCurrentClosedSessionCopyAuthority, assertCurrentClosedSessionTerminationObservation } from "../src/windows-authority.ts";
import { WindowsControlRuntime } from "../src/windows-runtime.ts";
import type { WindowsControlRuntimeOptions } from "../src/windows-runtime.ts";
import { qualifiedNativeFixture } from "./helpers/windows-pending-fixture.ts";
import { INPUT } from "./helpers/windows-closed-session-fixture.ts";
import { retireSyntheticJournal } from "./helpers/synthetic-journal-retirement.ts";

const HASH = "a".repeat(64);
const SQL_RUNTIME = { nodeExecutable: "/synthetic/no-sql-child", nodeVersion: "24.18.0" as const, nodeSha256: HASH };
type Upstream = WindowsControlRuntimeOptions["upstream"];

/** Only the opener's private owner lookup and final copy sink are substituted
 * in this VM. The unchanged coordinator, managed storage, engine capture,
 * runtime normal-close and termination issuers execute their actual code.
 * Synthetic native child frames do not launch Windows or establish CAD proof.
 */
async function fixture(context: TestContext): Promise<{
  coordinator: CurrentSymbolBaselineCoordinator; restart: () => CurrentSymbolBaselineCoordinator;
  owner: CurrentSymbolBaselineOwner; native: Awaited<ReturnType<typeof qualifiedNativeFixture>>;
  runtime: WindowsControlRuntime;
  state: { scope: boolean; ownerLost: boolean; copyFailure: boolean; copies: number; events: string[];
    afterCompleted: (() => Promise<void>) | undefined; afterLoad: (() => Promise<void>) | undefined; afterStopped: (() => Promise<void>) | undefined };
  calls: (action: string) => number;
}> {
  const native = await qualifiedNativeFixture(context), operationId = newOperationId();
  const state = { scope: true, ownerLost: false, copyFailure: false, copies: 0, events: [] as string[],
    afterCompleted: undefined as (() => Promise<void>) | undefined, afterLoad: undefined as (() => Promise<void>) | undefined,
    afterStopped: undefined as (() => Promise<void>) | undefined };
  const session = { gatewayInstanceId: "g".repeat(43), sessionId: "s".repeat(43), sequence: 1,
    authenticationReceiptSha256: "2".repeat(64), authenticatedAtEpochMs: 1000 };
  const binding: AuthenticatedBridgeDispatchBinding = { schema: "easyeda-pro-control.bridge-dispatch-lease.v1", gatewayInstanceId: session.gatewayInstanceId,
    sessionId: session.sessionId, sessionSequence: 1, begunAtEpochMs: 1001, leaseId: "l".repeat(43), bindingReceipt: "b".repeat(43) };
  const upstream: Upstream & Pick<EasyedaControlEngine["upstream"], "findTool"> = {
    findTool: () => Promise.resolve({ name: "easyeda_execute" }),
    callTool: (name) => {
      assert.equal(name, "easyeda_execute"); assert.equal(state.scope, true); state.events.push("runtime-identity");
      return Promise.resolve({ content: [{ type: "text", text: JSON.stringify({ kind: "runtime-identity",
        generation: "synthetic-current-symbol-runtime-0001", timeOrigin: 1000, processId: 101 }) }] });
    },
    currentAuthenticatedBridgeDispatchBinding: () => state.scope ? binding : undefined,
    bridgeSessionLifecycle: () => ({ schema: "easyeda-pro-control.authenticated-bridge-lifecycle.v1", gatewayInstanceId: session.gatewayInstanceId,
      activeSession: { sessionId: session.sessionId, sequence: session.sequence, authenticationReceiptSha256: session.authenticationReceiptSha256,
        authenticatedAtEpochMs: session.authenticatedAtEpochMs }, publicEndpoint: { host: "127.0.0.1", port: 49_100 }, recentClosedSessions: [] }),
  };
  const runtime = new WindowsControlRuntime({ upstream, pluginRoot: "/opt/synthetic-control", assetsRoot: "/mnt/c/Synthetic/resources/app/assets",
    wslDistribution: "SyntheticReview", reviewedExecutionScopeSha256: native.options.reviewedExecutionScopeSha256 }, {
    hashExecutable: (): Promise<string> => Promise.resolve(native.options.expectedExecutableSha256),
    startSupervisor: (): Promise<typeof native.supervisor> => Promise.resolve(native.supervisor),
  });
  const launch = await runtime.launch();
  context.mock.method(runtime, "observeApplicationWindow", () => {
    assert.equal(state.scope, false); state.events.push("window");
    return Promise.resolve({ jobId: launch.jobId, helperInstance: launch.helperInstance, outcome: "available" as const, hwnd: "12345" });
  });
  native.state.onFrame = (action): void => {
    state.events.push(`native:${action}`);
    if (action === "normal-close" || action === "clocked-prove-terminated") { assert.equal(state.scope, false); }
  };
  const engine = new EasyedaControlEngine(upstream, { executionAuthorityValidator: runtime });
  await engine.controlFingerprintPromise;
  const ownerData = { profile: "synthetic.current-symbol-baseline-owner", operationId, openingOperationId: "synthetic-original-opening" };
  const original = { source: { engine, runtime, launchProjection: launch, bridgeSession: session,
    target: { rawWindowsPath: "C:\\Fixtures\\Disposable.eprj2", projectUuid: "b".repeat(64), documentUuid: "c".repeat(16), branchUuid: "d".repeat(32), expectedSourceSha256: HASH },
    expectedFingerprint: { synthetic: true } }, preparation: { preparationSha256: HASH } };
  const ownerText = canonicalJson(ownerData);
  const checkOwner = (owner: unknown, receivedEngine: unknown): typeof original => {
    assert.equal(receivedEngine, engine); assert.equal(owner, ownerData, "synthetic owner must be original");
    assert.equal(canonicalJson(owner), ownerText, "synthetic owner changed"); assert.equal(state.ownerLost, false, "synthetic owner lost");
    assert.equal(runtime.status().state, "owned"); assert.deepEqual(runtime.status().launch, launch); return original;
  };
  const source = stripTypeScriptTypes(await readFile(new URL("../src/current-symbol-baseline-runtime.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:class|function|const))/gu, "");
  const scope = vm.createContext({ z, Buffer, Object, Date, Reflect, structuredClone,
    OPERATION_SCHEMA, buildPlanHash, canonicalJson, isRecord, sha256Json, currentSymbolMetadataPreparationRequestSchema,
    createOperation, operationPath, writePhaseArtifact,
    loadOperation: async (id: string): ReturnType<typeof loadOperation> => {
      const loaded = await loadOperation(id); await state.afterLoad?.(); return loaded;
    },
    updateOperation: async (journal: Parameters<typeof updateOperation>[0]): Promise<string> => {
      const result = await updateOperation(journal); state.events.push(`journal:${String(journal["state"])}`);
      if (journal["state"] === "completed") { await state.afterCompleted?.(); }
      if (journal["state"] === "stopped") { await state.afterStopped?.(); }
      return result;
    },
    assertCurrentSymbolBaselineOwner: checkOwner,
    revalidateCurrentSymbolBaselineOwner: (owner: unknown, receivedEngine: unknown) => Promise.resolve(checkOwner(owner, receivedEngine)),
    assertCurrentClosedSessionCopyAuthority, assertCurrentClosedSessionTerminationObservation,
    captureCurrentSymbolBaselineCopy: async (receivedEngine: unknown, input: unknown, onEvidence: (event: unknown) => void): Promise<unknown> => {
      assert.equal(receivedEngine, engine); assert.ok(isRecord(input)); assert.equal(input["owner"], ownerData); assert.equal(state.scope, false);
      assert.deepEqual(input["runtime"], SQL_RUNTIME); assert.ok(isRecord(input["capture"]));
      assert.equal(input["capture"]["operationId"], operationId);
      assert.equal(await assertClosedSessionCopyAuthority(input["proof"]), input["proof"]);
      const journal = await loadOperation(operationId), last = journal.artifacts?.at(-1);
      assert.ok(last !== undefined); assert.match(basename(last.path), /-copy-intent\.json$/u);
      state.copies += 1; state.events.push("copy");
      if (state.copyFailure) { throw new Error("synthetic copy failure"); }
      const checkpoint = { checkpointSha256: HASH }, copy = { sha256: HASH }, inventory = { checkpointSha256: HASH, schemaSha256: HASH, logicalSha256: HASH };
      onEvidence({ kind: "checkpoint", value: checkpoint }); onEvidence({ kind: "copy", value: copy }); onEvidence({ kind: "inventory", value: inventory });
      return { checkpoint, copy, inventory, preparation: { syntheticCopySink: true }, targetEvidence: { syntheticCopySink: true } };
    },
  });
  const loaded: unknown = vm.runInContext(`${source}\n({ Coordinator: CurrentSymbolBaselineCoordinator });`, scope);
  assert.ok(isRecord(loaded) && typeof loaded["Coordinator"] === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Checked export is the unchanged maintained coordinator evaluated in this private test scope.
  const Coordinator = loaded["Coordinator"] as typeof CurrentSymbolBaselineCoordinator;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Only this VM's fixed owner lookup admits this synthetic original; no production issuer is modified.
  const owner = ownerData as unknown as CurrentSymbolBaselineOwner;
  const restart = (): CurrentSymbolBaselineCoordinator => new Coordinator(engine, runtime, SQL_RUNTIME);
  context.after(async (): Promise<void> => {
    try { await loadOperation(operationId); }
    catch (error) { if (isRecord(error) && error["code"] === "ENOENT") { return; } throw error; }
    await retireSyntheticJournal(operationId);
  });
  return { coordinator: restart(), restart, owner, native, runtime, state,
    calls: (action): number => native.requests.filter((request) => request["action"] === action).length };
}

void test("current baseline owns one capture and close, polls pending, then copies only after original termination", async (context) => {
  const f = await fixture(context); await f.coordinator.capture(f.owner);
  const captured = await f.coordinator.inspect(f.owner.operationId); assert.equal(captured["state"], "captured");
  f.state.scope = false;
  const closed = await f.coordinator.close(f.owner); assert.equal(closed["state"], "awaiting-termination");
  assert.equal(f.calls("normal-close"), 1); assert.equal(f.state.copies, 0);
  assert.ok(f.state.events.indexOf("journal:close-dispatching") < f.state.events.indexOf("native:normal-close"));
  const dispatchJournal = await loadOperation(f.owner.operationId); assert.equal(dispatchJournal["closeAttempted"], true);
  await assert.rejects(f.coordinator.close(f.owner), /original completed capture/u);
  f.native.state.code = "authority-prior-job-not-empty"; f.native.state.remaining = 1;
  const pending = await f.coordinator.observe(f.owner.operationId);
  assert.equal(pending["termination"], "pending"); assert.equal(pending["state"], "awaiting-termination"); assert.equal(f.state.copies, 0);
  const done = await f.coordinator.observe(f.owner.operationId);
  assert.equal(done["state"], "completed"); assert.equal(done["baselineCaptured"], true);
  for (const key of ["beforeWriteBaselineVerified", "openingEffectsVerified", "writerReady", "executionAuthorized", "explicitSaveDispatched", "replayAllowed"]) {
    assert.equal(done[key], false);
  }
  assert.equal(f.calls("normal-close"), 1); assert.equal(f.calls("clocked-prove-terminated"), 2); assert.equal(f.state.copies, 1);
  await assert.rejects(f.coordinator.observe(f.owner.operationId), /original acknowledged close/u);
  const restarted = f.restart();
  const inspected = await restarted.inspect(f.owner.operationId); assert.equal(inspected["originalOwnerRetained"], false);
  await assert.rejects(restarted.observe(f.owner.operationId), /original acknowledged close/u);
  assert.equal(f.calls("normal-close"), 1); assert.equal(f.state.copies, 1);
});

void test("current baseline uncertain close stays consumed without copy or restart adoption", async (context) => {
  const f = await fixture(context); await f.coordinator.capture(f.owner); f.state.scope = false;
  f.native.behavior.errorAction = "normal-close";
  await assert.rejects(f.coordinator.close(f.owner));
  const stopped = await f.coordinator.inspect(f.owner.operationId); assert.equal(stopped["state"], "stopped");
  await assert.rejects(f.coordinator.close(f.owner), /original completed capture/u);
  await assert.rejects(f.coordinator.observe(f.owner.operationId), /original acknowledged close/u);
  await assert.rejects(f.restart().close(f.owner), /original completed capture/u);
  assert.equal(f.calls("normal-close"), 1); assert.equal(f.calls("clocked-prove-terminated"), 0); assert.equal(f.state.copies, 0);
});

void test("current baseline refuses copied owners and a failed copy cannot be repeated", async (context) => {
  const f = await fixture(context);
  await assert.rejects(f.coordinator.capture(structuredClone(f.owner)), /owner must be original/u);
  await f.coordinator.capture(f.owner); f.state.scope = false;
  await assert.rejects(f.coordinator.close(structuredClone(f.owner)), /original completed capture/u);
  await f.coordinator.close(f.owner); f.state.copyFailure = true;
  f.state.afterStopped = (): Promise<void> => Promise.reject(new Error("synthetic stopped publication failure"));
  await assert.rejects(f.coordinator.observe(f.owner.operationId), (error: unknown): boolean => {
    assert.ok(isRecord(error)); assert.equal(error["name"], "AggregateError");
    const cause = error["cause"], errors = error["errors"]; assert.ok(cause instanceof Error); assert.equal(cause.message, "synthetic stopped publication failure");
    assert.ok(Array.isArray(errors)); assert.equal(errors.length, 2); assert.equal(errors[1], cause);
    assert.match(String(errors[0]), /synthetic copy failure/u); return true;
  });
  const stopped = await f.coordinator.inspect(f.owner.operationId); assert.equal(stopped["state"], "stopped");
  await assert.rejects(f.coordinator.observe(f.owner.operationId), /original acknowledged close/u);
  assert.equal(f.calls("normal-close"), 1); assert.equal(f.state.copies, 1);
});

void test("current baseline owner loss after capture refuses before native close", async (context) => {
  const f = await fixture(context); await f.coordinator.capture(f.owner); f.state.scope = false; f.state.ownerLost = true;
  await assert.rejects(f.coordinator.close(f.owner), /synthetic owner lost/u);
  const stopped = await f.coordinator.inspect(f.owner.operationId); assert.equal(stopped["state"], "stopped");
  assert.equal(f.calls("normal-close"), 0); assert.equal(f.calls("clocked-prove-terminated"), 0); assert.equal(f.state.copies, 0);
});

void test("current baseline preserves external journal changes during pending or terminated probes", async (context) => {
  for (const pending of [true, false]) {
    await context.test(pending ? "pending probe" : "terminated probe", async (childContext) => {
      const f = await fixture(childContext); await f.coordinator.capture(f.owner); f.state.scope = false; await f.coordinator.close(f.owner);
      if (pending) { f.native.state.code = "authority-prior-job-not-empty"; }
      const probe = f.runtime.probeClosedSessionTermination.bind(f.runtime);
      let external: Buffer | undefined;
      childContext.mock.method(f.runtime, "probeClosedSessionTermination", async (...args: Parameters<typeof probe>): ReturnType<typeof probe> => {
        const observation = await probe(...args);
        const journal = await loadOperation(f.owner.operationId);
        journal["nextSafeAction"] = "Synthetic external advance; must not be overwritten.";
        await updateOperation(journal); external = await readFile(operationPath(f.owner.operationId)); return observation;
      });
      await assert.rejects(f.coordinator.observe(f.owner.operationId), /baseline journal changed/u);
      assert.ok(external !== undefined); assert.deepEqual(await readFile(operationPath(f.owner.operationId)), external);
      await assert.rejects(f.coordinator.observe(f.owner.operationId), /original acknowledged close/u);
      assert.deepEqual(await readFile(operationPath(f.owner.operationId)), external);
      assert.equal(f.calls("normal-close"), 1); assert.equal(f.calls("clocked-prove-terminated"), 1); assert.equal(f.state.copies, 0);
    });
  }
});

void test("current baseline rechecks the retained proof epoch at final pending and completion boundaries", async (context) => {
  for (const pending of [true, false]) {
    await context.test(pending ? "pending final journal read" : "completed publication", async (childContext) => {
      const f = await fixture(childContext); await f.coordinator.capture(f.owner); f.state.scope = false; await f.coordinator.close(f.owner);
      let changed = false, reads = 0;
      const invalidate = async (): Promise<void> => {
        await f.native.supervisor.capture({ ...INPUT, bindingSha256: "8".repeat(64), challengeAttempt: 2 }); changed = true;
      };
      if (pending) {
        f.native.state.code = "authority-prior-job-not-empty";
        f.state.afterLoad = async (): Promise<void> => { reads += 1; if (reads === 2) { await invalidate(); } };
      } else { f.state.afterCompleted = invalidate; }
      await assert.rejects(f.coordinator.observe(f.owner.operationId), pending ? /pending probe owner, input or acknowledged close changed/u : /(?:epoch|authority|capture|retained)/u);
      assert.equal(changed, true);
      const stopped = await f.coordinator.inspect(f.owner.operationId); assert.equal(stopped["state"], "stopped");
      await assert.rejects(f.coordinator.observe(f.owner.operationId), /original acknowledged close/u);
      assert.equal(f.calls("normal-close"), 1); assert.equal(f.calls("clocked-prove-terminated"), 1); assert.equal(f.state.copies, pending ? 0 : 1);
    });
  }
});
