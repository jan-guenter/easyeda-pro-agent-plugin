import { createSyntheticCompletedPeer, retireSyntheticJournal } from "./helpers/synthetic-journal-retirement.ts";
/* oxlint-disable import/max-dependencies -- The integration test retains the actual engine, runtime, supervisor and artifact contracts. */
import assert from "node:assert/strict";
import fsPromises, { readFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";
import { test } from "node:test";
import { ClosedSymbolBootstrapLaunchStage } from "../src/closed-symbol-launch.ts";
import { FAMILY, createClosedSymbolJournal, inspectClosedSymbolRestart, loadClosedSymbolJournal } from "../src/closed-symbol-journal.ts";
import type { ClosedJournal } from "../src/closed-symbol-journal.ts";
import { loadOperation, updateOperation } from "../src/artifacts.ts";
import { newOperationId, sha256Json } from "../src/core.ts";
import { EasyedaControlEngine } from "../src/engine.ts";
import type { AuthenticatedBridgeDispatchBinding } from "../src/engine.ts";
import { WindowsControlRuntime } from "../src/windows-runtime.ts";
import type { WindowsControlRuntimeOptions } from "../src/windows-runtime.ts";
import type { WindowsAuthorityLaunch, WindowsAuthoritySupervisor } from "../src/windows-authority.ts";
import { closedSessionFixture } from "./helpers/windows-closed-session-fixture.ts";

const hash = "a".repeat(64), project = "b".repeat(64), target = "c".repeat(32);
const LEASE: AuthenticatedBridgeDispatchBinding = { schema: "easyeda-pro-control.bridge-dispatch-lease.v1", gatewayInstanceId: "g".repeat(43), sessionId: "s".repeat(43), sessionSequence: 1, begunAtEpochMs: 1001, leaseId: "l".repeat(43), bindingReceipt: "b".repeat(43) };
interface FixtureState { scope: boolean; bridgeCalls: number; hashes: number; helpers: number; onHash: (() => Promise<void>) | undefined }
interface Fixture {
  journal: ClosedJournal; operationId: string; owner: ReturnType<typeof closedSessionFixture>; runtime: WindowsControlRuntime; engine: EasyedaControlEngine;
  upstream: WindowsControlRuntimeOptions["upstream"]; state: FixtureState; stage: ClosedSymbolBootstrapLaunchStage;
  launches: () => number; dispose: () => Promise<void>;
}
async function fixture(): Promise<Fixture> {
  const owner = closedSessionFixture();
  const state: FixtureState = {
    scope: false, bridgeCalls: 0, hashes: 0, helpers: 0, onHash: undefined,
  };
  const upstream = {
    findTool(): Promise<undefined> { throw new Error("Unexpected synthetic bridge discovery"); },
    callTool(): Promise<never> { state.bridgeCalls += 1; throw new Error("Unexpected synthetic bridge call"); },
    bridgeSessionLifecycle(): ReturnType<WindowsControlRuntimeOptions["upstream"]["bridgeSessionLifecycle"]> {
      return { schema: "easyeda-pro-control.authenticated-bridge-lifecycle.v1" as const, gatewayInstanceId: "g".repeat(43), activeSession: null,
        publicEndpoint: { host: "127.0.0.1" as const, port: 49_100 }, recentClosedSessions: [] };
    },
    currentAuthenticatedBridgeDispatchBinding(): AuthenticatedBridgeDispatchBinding | undefined { return state.scope ? LEASE : undefined; },
  };
  const runtime = new WindowsControlRuntime({ upstream, pluginRoot: "/opt/synthetic-control", assetsRoot: "/mnt/c/Synthetic/resources/app/assets", wslDistribution: "SyntheticReview",
    reviewedExecutionScopeSha256: owner.policy.reviewedExecutionScopeSha256 }, {
    async hashExecutable(executable, assetsRoot): Promise<string> {
      state.hashes += 1;
      assert.equal(executable, "/mnt/c/Synthetic/easyeda-pro.exe"); assert.equal(assetsRoot, "/mnt/c/Synthetic/resources/app/assets");
      await state.onHash?.(); return owner.policy.expectedExecutableSha256;
    },
    startSupervisor(options): Promise<WindowsAuthoritySupervisor> {
      state.helpers += 1;
      assert.equal(options.expectedExecutable, owner.policy.expectedExecutable);
      assert.equal(options.expectedExecutableSha256, owner.policy.expectedExecutableSha256);
      return Promise.resolve(owner.supervisor);
    },
  });
  const engine = new EasyedaControlEngine(upstream, { executionAuthorityValidator: runtime });
  await engine.controlFingerprintPromise;
  const journal = await createClosedSymbolJournal(newOperationId(), { profile: FAMILY, projectUuid: project, branchUuid: "d".repeat(32), ownerUuid: "e".repeat(32), targetUuid: target,
    activeUuid: "f".repeat(32), projectPath: "/synthetic/not-opened.eprj2", operation: { id: "bootstrap-synthetic", action: "library.symbol.modify", libraryUuid: project, target: { uuid: target }, patch: { name: "Synthetic" } },
    marker: { namespaceNonce: "1".repeat(64), keyNonce: "2".repeat(64), bodyNonce: "3".repeat(64) }, nativePinsSha256: hash, facadeSha256: hash, expectedFingerprintSha256: hash });
  const operationId = journal.operationId;
  return { journal, operationId, owner, runtime, engine, upstream, state, stage: new ClosedSymbolBootstrapLaunchStage(engine, runtime),
    launches: (): number => owner.requests.filter((entry) => entry["action"] === "launch").length,
    async dispose(): Promise<void> {
      // Synthetic test-root records only. Do not leave unrelated unfinished
      // Fixtures blocking the next real engine admission check in this worker.
      await retireSyntheticJournal(operationId);
    } };
}

void test("actual runtime launches once only after durable intent and retains partial native result without authentication", async () => {
  const value = await fixture(); let beforeNative = false;
  value.state.onHash = async (): Promise<void> => {
    const retained = await loadClosedSymbolJournal(value.operationId);
    assert.equal(retained.events.length, 1); assert.equal(retained.events[0]?.kind, "intent"); assert.equal(retained.events[0]?.generation, null);
    assert.equal(value.launches(), 0); beforeNative = true;
  };
  try {
    const result = await value.stage.launch(value.journal);
    assert.equal(beforeNative, true); assert.equal(value.launches(), 1); assert.equal(value.state.hashes, 1); assert.equal(value.state.helpers, 1); assert.equal(value.state.bridgeCalls, 0);
    assert.deepEqual(value.owner.requests.map((entry) => entry["action"]), ["launch"]);
    assert.equal(result.executionAuthorized, false); assert.equal(result.admissionProved, false); assert.equal(result.completionProved, false);
    assert.deepEqual(Object.keys(result.generation).toSorted(), ["helperInstance", "jobId", "ordinal", "rootPid", "rootStartIdentity"]);
    const retained = await loadClosedSymbolJournal(value.operationId);
    assert.equal(retained.journal.sequence, 2); assert.deepEqual(retained.events[1]?.data, { launchReceipt: result.launch, launchReceiptSha256: sha256Json(result.launch) });
    assert.equal(retained.journal.saved, false); assert.equal(retained.journal.reopened, false); assert.equal(retained.journal.orphanedCallPossible, false);
    assert.deepEqual(value.runtime.status().launch, result.launch);
    const restart = await inspectClosedSymbolRestart(value.operationId); assert.equal(restart["classification"], "after-result");
  } finally { await value.dispose(); }
});

void test("same stage and another stage on the original runtime cannot replay a successful launch", async () => {
  const value = await fixture();
  try {
    await value.stage.launch(value.journal);
    for (const stage of [value.stage, new ClosedSymbolBootstrapLaunchStage(value.engine, value.runtime)]) {
      await assert.rejects(stage.launch(value.journal), /already consumed/u);
    }
    assert.equal(value.launches(), 1);
  } finally { await value.dispose(); }
});

void test("a concurrent new stage cannot launch while the first original attempt is pending", async () => {
  const value = await fixture(); const entered = Promise.withResolvers<null>(); const gate = Promise.withResolvers<null>();
  value.state.onHash = async (): Promise<void> => { entered.resolve(null); await gate.promise; };
  const running = value.stage.launch(value.journal);
  try {
    await entered.promise;
    await assert.rejects(new ClosedSymbolBootstrapLaunchStage(value.engine, value.runtime).launch(value.journal), /consumed/u);
    assert.equal(value.launches(), 0); gate.resolve(null); await running; assert.equal(value.launches(), 1);
  } finally { gate.resolve(null); await running; await value.dispose(); }
});

void test("a new runtime cannot replay an acknowledged launch from its durable journal", async () => {
  const value = await fixture();
  try {
    await value.stage.launch(value.journal);
    const replacement = await fixture(); await replacement.dispose();
    await assert.rejects(replacement.stage.launch(value.journal), /original empty/u);
    assert.equal(replacement.launches(), 0); assert.equal(replacement.state.hashes, 0);
  } finally { await value.dispose(); }
});

for (const kind of ["scope", "missing-scope", "own-hard-stop", "own-orphan"] as const) {
  void test(`bootstrap refuses ${kind} before helper creation`, async () => {
    const value = await fixture();
    if (kind === "scope") { value.state.scope = true; }
    if (kind === "missing-scope") { Reflect.deleteProperty(value.upstream, "currentAuthenticatedBridgeDispatchBinding"); }
    if (kind === "own-hard-stop") { value.journal.hardStop = true; await updateOperation(value.journal); }
    if (kind === "own-orphan") { value.journal.orphanedCallPossible = true; await updateOperation(value.journal); }
    try {
      await assert.rejects(value.stage.launch(value.journal)); assert.equal(value.launches(), 0); assert.equal(value.state.hashes, 0);
      const retained = await loadClosedSymbolJournal(value.operationId); assert.equal(retained.events.length, 0);
    } finally { await value.dispose(); }
  });
}

for (const kind of ["unfinished", "terminal-orphan"] as const) {
  void test(`actual engine blocks another ${kind} journal before launch intent`, async () => {
    const value = await fixture(); const peer = await fixture();
    if (kind === "terminal-orphan") { const held = await loadOperation(peer.operationId); held["state"] = "completed"; held["orphanedCallPossible"] = true; await updateOperation(held); }
    try {
      await assert.rejects(value.stage.launch(value.journal)); assert.equal(value.launches(), 0); assert.equal(value.state.hashes, 0);
      const retained = await loadClosedSymbolJournal(value.operationId); assert.equal(retained.events.length, 0);
    } finally { await peer.dispose(); await value.dispose(); }
  });
}

for (const kind of ["owned", "released", "launch-unknown", "launching"] as const) {
  void test(`actual ${kind} runtime cannot enter bootstrap`, async () => {
    const value = await fixture(); let pending: Promise<unknown> | undefined; let unblock: (() => void) | undefined;
    if (kind === "owned") { await value.runtime.launch(); }
    if (kind === "released") { await value.runtime.release(); }
    if (kind === "launch-unknown") { value.owner.behavior.errorAction = "launch"; await assert.rejects(value.runtime.launch()); }
    if (kind === "launching") {
      const gate = Promise.withResolvers<null>(); unblock = (): void => { gate.resolve(null); }; value.state.onHash = async (): Promise<void> => { await gate.promise; };
      pending = value.runtime.launch(); assert.equal(value.runtime.status().state, "launching");
    }
    const before = value.launches();
    try { await assert.rejects(value.stage.launch(value.journal), /new index-owned/u); assert.equal(value.launches(), before); }
    finally { unblock?.(); await pending; await value.dispose(); }
  });
}

for (const boundary of ["guard", "intent", "launch"] as const) {
  for (const field of ["operationId", "saved", "plan"] as const) {
    void test(`caller ${field} mutation at ${boundary} cannot redirect or poison journal writes`, async (context) => {
      const value = await fixture(); const peer = await createSyntheticCompletedPeer();
      const peerBefore = await readFile(peer.journalPath); let changed = false;
      const mutate = (): void => {
        changed = true;
        if (field === "operationId") { value.journal.operationId = peer.operationId; }
        else if (field === "saved") { value.journal.saved = true; }
        else { value.journal.plan.operation.patch.name = "Changed caller"; }
      };
      const admission = value.engine.assertRecoveryOperationIsolated.bind(value.engine);
      const link = fsPromises.link;
      if (boundary === "guard") { context.mock.method(value.engine, "assertRecoveryOperationIsolated", async (id: string): Promise<true> => { const result = await admission(id); mutate(); return result; }); }
      if (boundary === "intent") {
        context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>): Promise<void> => { await link(...args); if (basename(String(args[1])) === "01-baseline-launch-intent.json") { mutate(); } }); syncBuiltinESMExports();
      }
      if (boundary === "launch") { value.owner.behavior.afterRequest = (action): void => { if (action === "launch") { mutate(); } }; }
      try {
        await assert.rejects(value.stage.launch(value.journal), /caller changed/u); assert.equal(changed, true);
        assert.deepEqual(await readFile(peer.journalPath), peerBefore);
        const retained = await loadClosedSymbolJournal(value.operationId);
        assert.equal(retained.journal.operationId, value.operationId); assert.equal(retained.journal.saved, false); assert.equal(retained.journal.plan.operation.patch.name, "Synthetic");
        const expectedEvents = { guard: 0, intent: 1, launch: 2 }; assert.equal(retained.events.length, expectedEvents[boundary]);
        assert.equal(value.launches(), boundary === "launch" ? 1 : 0);
      } finally { context.mock.restoreAll(); syncBuiltinESMExports(); await value.dispose(); }
    });
  }
}

for (const missing of [false, true]) {
  void test(`scope ${missing ? "observer disappears" : "appears"} during launch retains result then refuses`, async () => {
    const value = await fixture();
    value.owner.behavior.afterRequest = (action): void => {
      if (action === "launch") { if (missing) { Reflect.deleteProperty(value.upstream, "currentAuthenticatedBridgeDispatchBinding"); } else { value.state.scope = true; } }
    };
    try {
      await assert.rejects(value.stage.launch(value.journal), /scope/u);
      const retained = await loadClosedSymbolJournal(value.operationId); assert.equal(value.launches(), 1); assert.equal(retained.events[1]?.kind, "result");
      await assert.rejects(value.stage.launch(value.journal), /consumed/u); assert.equal(value.launches(), 1);
    } finally { await value.dispose(); }
  });
}

for (const boundary of ["guard", "intent"] as const) {
  void test(`missing scope observer after ${boundary} refuses before physical launch`, async (context) => {
    const value = await fixture();
    const remove = (): void => { Reflect.deleteProperty(value.upstream, "currentAuthenticatedBridgeDispatchBinding"); };
    const admission = value.engine.assertRecoveryOperationIsolated.bind(value.engine);
    const link = fsPromises.link;
    if (boundary === "guard") { context.mock.method(value.engine, "assertRecoveryOperationIsolated", async (id: string): Promise<true> => { const result = await admission(id); remove(); return result; }); }
    else { context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>): Promise<void> => { await link(...args); if (basename(String(args[1])) === "01-baseline-launch-intent.json") { remove(); } }); syncBuiltinESMExports(); }
    try {
      await assert.rejects(value.stage.launch(value.journal), /scope/u);
      assert.equal(value.launches(), 0); assert.equal(value.state.hashes, 0);
    } finally { context.mock.restoreAll(); syncBuiltinESMExports(); await value.dispose(); }
  });
}

for (const boundary of ["guard", "launch"] as const) {
  void test(`equal scope-reader replacement at ${boundary} cannot substitute the captured receiver`, async (context) => {
    const value = await fixture();
    const replace = (): void => { value.upstream.currentAuthenticatedBridgeDispatchBinding = (): undefined => undefined; };
    const admission = value.engine.assertRecoveryOperationIsolated.bind(value.engine);
    if (boundary === "guard") { context.mock.method(value.engine, "assertRecoveryOperationIsolated", async (id: string): Promise<true> => { const result = await admission(id); replace(); return result; }); }
    else { value.owner.behavior.afterRequest = (action): void => { if (action === "launch") { replace(); } }; }
    try {
      await assert.rejects(value.stage.launch(value.journal), /scope/u);
      const retained = await loadClosedSymbolJournal(value.operationId);
      assert.equal(value.launches(), boundary === "guard" ? 0 : 1); assert.equal(retained.events.length, boundary === "guard" ? 0 : 2);
    } finally { context.mock.restoreAll(); await value.dispose(); }
  });
}

void test("loss of current runtime ownership after result publication refuses without losing the acknowledged launch", async (context) => {
  const value = await fixture(); const rename = fsPromises.rename; let replacements = 0;
  context.mock.method(fsPromises, "rename", async (...args: Parameters<typeof rename>): Promise<void> => {
    await rename(...args);
    if (basename(String(args[1])) === `${value.operationId}.json`) { replacements += 1; if (replacements === 2) { await value.runtime.release(); } }
  });
  syncBuiltinESMExports();
  try {
    await assert.rejects(value.stage.launch(value.journal), /current owner differs/u);
    const retained = await loadClosedSymbolJournal(value.operationId);
    assert.equal(retained.events[1]?.kind, "result"); assert.equal(value.runtime.status().state, "released"); assert.equal(value.launches(), 1);
    await assert.rejects(value.stage.launch(value.journal), /consumed/u); assert.equal(value.launches(), 1);
  } finally { context.mock.restoreAll(); syncBuiltinESMExports(); await value.dispose(); }
});

void test("actual runtime uncertain transport leaves intent and launch-unknown with no retry or authentication", async () => {
  const value = await fixture(); value.owner.behavior.errorAction = "launch";
  try {
    await assert.rejects(value.stage.launch(value.journal), /helper request refused/u);
    assert.equal(value.runtime.status().state, "launch-unknown"); assert.equal(value.launches(), 1); assert.equal(value.state.bridgeCalls, 0);
    const restart = await inspectClosedSymbolRestart(value.operationId); assert.equal(restart["classification"], "intent-without-result");
    await assert.rejects(new ClosedSymbolBootstrapLaunchStage(value.engine, value.runtime).launch(value.journal), /consumed/u);
    assert.equal(value.launches(), 1);
  } finally { await value.dispose(); }
});

for (const failure of ["result-artifact", "result-journal-before", "result-journal-after"] as const) {
  void test(`failed ${failure} publication never makes an acknowledged launch repeatable`, async (context) => {
    const value = await fixture(); let replacements = 0; let injected = false;
    const launch = value.runtime.launch.bind(value.runtime); let original: WindowsAuthorityLaunch | undefined;
    context.mock.method(value.runtime, "launch", async (): Promise<WindowsAuthorityLaunch> => { original = await launch(); return original; });
    const link = fsPromises.link, rename = fsPromises.rename;
    context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>): Promise<void> => {
      if (failure === "result-artifact" && basename(String(args[1])) === "02-baseline-launch-result.json") { injected = true; throw new Error("Synthetic result publication failure"); }
      await link(...args);
    });
    context.mock.method(fsPromises, "rename", async (...args: Parameters<typeof rename>): Promise<void> => {
      if (basename(String(args[1])) === `${value.operationId}.json`) { replacements += 1; }
      const selected = replacements === 2 && basename(String(args[1])) === `${value.operationId}.json`;
      if (selected && failure === "result-journal-before") { injected = true; throw new Error("Synthetic result publication failure"); }
      await rename(...args);
      if (selected && failure === "result-journal-after") { injected = true; throw new Error("Synthetic result publication failure"); }
    });
    syncBuiltinESMExports();
    try {
      await assert.rejects(value.stage.launch(value.journal), /publication failure/u); assert.equal(injected, true); assert.equal(value.launches(), 1); assert.equal(value.runtime.status().state, "owned");
      assert.ok(original !== undefined); assert.equal(value.stage.originalLaunch(value.operationId), original);
      assert.equal(value.stage.originalLaunch("another-operation"), undefined);
      if (failure === "result-journal-before") { await assert.rejects(inspectClosedSymbolRestart(value.operationId), /Unreferenced/u); }
      else { const restart = await inspectClosedSymbolRestart(value.operationId); assert.equal(restart["classification"], failure === "result-artifact" ? "intent-without-result" : "after-result"); }
      await assert.rejects(value.stage.launch(value.journal), /consumed/u); assert.equal(value.launches(), 1);
      const replacement = await fixture(); await replacement.dispose();
      await assert.rejects(replacement.stage.launch(value.journal));
      assert.equal(replacement.launches(), 0); assert.equal(replacement.state.hashes, 0);
    } finally { context.mock.restoreAll(); syncBuiltinESMExports(); await value.dispose(); }
  });
}

void test("bootstrap returns the original runtime token rather than its serialized copy", async (context) => {
  const value = await fixture(); const launch = value.runtime.launch.bind(value.runtime); let original: WindowsAuthorityLaunch | undefined;
  context.mock.method(value.runtime, "launch", async (): Promise<WindowsAuthorityLaunch> => { original = await launch(); return original; });
  try {
    const result = await value.stage.launch(value.journal); assert.ok(original !== undefined);
    assert.equal(result.launch, original); assert.equal(value.stage.originalLaunch(value.operationId), original);
    assert.notEqual(value.runtime.status().launch, original); assert.equal(value.launches(), 1);
  } finally { context.mock.restoreAll(); await value.dispose(); }
});

void test("bootstrap refuses an original launch changed during result publication", async (context) => {
  const value = await fixture(); const launch = value.runtime.launch.bind(value.runtime), link = fsPromises.link;
  let original: WindowsAuthorityLaunch | undefined;
  context.mock.method(value.runtime, "launch", async (): Promise<WindowsAuthorityLaunch> => { original = await launch(); return original; });
  context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>): Promise<void> => {
    await link(...args);
    if (basename(String(args[1])) === "02-baseline-launch-result.json") { assert.ok(original !== undefined); Reflect.set(original.root, "pid", 999); }
  }); syncBuiltinESMExports();
  try {
    await assert.rejects(value.stage.launch(value.journal), /current owner/u);
    assert.equal(value.stage.originalLaunch(value.operationId), original); assert.equal(value.launches(), 1);
    const retained = await loadClosedSymbolJournal(value.operationId); assert.notEqual(retained.events[1]?.generation?.rootPid, 999);
    await assert.rejects(value.stage.launch(value.journal), /consumed/u);
  } finally { context.mock.restoreAll(); syncBuiltinESMExports(); await value.dispose(); }
});

void test("bootstrap refuses a durable journal changed after result publication", async (context) => {
  const value = await fixture(); const open = fsPromises.open, rename = fsPromises.rename; let changed = false, replacements = 0;
  context.mock.method(fsPromises, "rename", async (...args: Parameters<typeof rename>): Promise<void> => {
    await rename(...args);
    if (basename(String(args[1])) === `${value.operationId}.json`) { replacements += 1; }
  });
  context.mock.method(fsPromises, "open", async (...args: Parameters<typeof open>): ReturnType<typeof open> => {
    const file = await open(...args);
    const info = await file.stat();
    if (basename(String(args[0])) === "operations" && info.isDirectory()) {
      const close = file.close.bind(file);
      context.mock.method(file, "close", async (): Promise<void> => {
        await close();
        // The publication path check has completed; mutate only during its
        // Final directory-handle cleanup, not inside the protected rename.
        if (replacements === 2 && !changed) {
          changed = true; const held = await loadOperation(value.operationId); held["hardStop"] = true; await updateOperation(held);
        }
      });
    }
    return file;
  }); syncBuiltinESMExports();
  try {
    await assert.rejects(value.stage.launch(value.journal), /journal changed/u); assert.equal(changed, true);
    assert.equal(value.launches(), 1); assert.ok(value.stage.originalLaunch(value.operationId) !== undefined);
    assert.equal(value.journal.sequence, 0);
  } finally { context.mock.restoreAll(); syncBuiltinESMExports(); await value.dispose(); }
});

for (const mutation of ["caller", "scope", "owner", "original-launch"] as const) {
  void test(`bootstrap ${mutation} drift during final journal read refuses stale admission`, async (context) => {
    const value = await fixture(); const link = fsPromises.link, open = fsPromises.open, status = value.runtime.status.bind(value.runtime);
    let armed = false, changed = false, published = false;
    context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>): Promise<void> => {
      await link(...args); if (basename(String(args[1])) === "02-baseline-launch-result.json") { published = true; }
    });
    context.mock.method(value.runtime, "status", (): ReturnType<typeof status> => { const actual = status(); if (published) { armed = true; } return actual; });
    context.mock.method(fsPromises, "open", async (...args: Parameters<typeof open>): ReturnType<typeof open> => {
      const file = await open(...args);
      if (armed && !changed && basename(String(args[0])) === `${value.operationId}.json`) {
        changed = true;
        if (mutation === "caller") { value.journal.saved = true; }
        if (mutation === "scope") { value.state.scope = true; }
        if (mutation === "owner") { await value.runtime.release(); }
        if (mutation === "original-launch") { const original = value.stage.originalLaunch(value.operationId); assert.ok(original !== undefined); Reflect.set(original.root, "pid", 999); }
      }
      return file;
    }); syncBuiltinESMExports();
    try {
      await assert.rejects(value.stage.launch(value.journal), /caller changed|scope|current owner/u);
      assert.equal(changed, true); assert.equal(value.launches(), 1);
      assert.ok(value.stage.originalLaunch(value.operationId) !== undefined);
    } finally { context.mock.restoreAll(); syncBuiltinESMExports(); await value.dispose(); }
  });
}
