/** Actual coordinator with explicit original-native/data issuer seams only.
 * No app, native helper, writer, cache mutation or connected proof is issued. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentPcbViaSavedReadbackWorkflow, CurrentPcbViaSavedReadbackWorkflowResult } from "../src/current-pcb-via-saved-readback-workflow.ts";

async function fixture(mode: "complete" | "pending-cache" | "pending-launch" | "late-exit" | "exit-never" | "no-root" | "fd-close" = "complete", journalMode: "none" | "complete" | "lost" = "none"): Promise<Readonly<{
  journalRecords: readonly string[]; repairJournal: () => void; workflow: CurrentPcbViaSavedReadbackWorkflow; calls: string[]; entered: Promise<true>; continueLaunch: () => void;
  requireResult: (result: CurrentPcbViaSavedReadbackWorkflowResult) => unknown;
}>> {
  const url = new URL("../src/current-pcb-via-saved-readback-workflow.ts", import.meta.url); const sourceRequire = createRequire(url);
  const originalSource = await readFile(url, "utf8");
  const compiledSource = mode === "late-exit" || mode === "exit-never" ? originalSource.replace("delayMilliseconds: 250", "delayMilliseconds: 0") : originalSource;
  const compiled = await transform(compiledSource, { loader: "ts", format: "cjs", target: "node24" });
  const originalPlan = Object.freeze({ syntheticOriginalPlan: true });
  const prepared = Object.freeze({ operationId: "synthetic-original-saved" }); const options = Object.freeze({ pluginRoot: "synthetic" });
  const model = Object.freeze({ syntheticOriginalModel: true }); const proof = Object.freeze({ syntheticOriginalClosedProof: true, inventoryLogicalSha256: "a".repeat(64) }); const termination = Object.freeze({ syntheticOriginalTermination: true });
  const origin = Object.freeze({ syntheticOrigin: true }); const calls: string[] = [];
  const entered = Promise.withResolvers<true>(); const blocked = Promise.withResolvers<true>();
  let launched = false; let terminated = false; let released = false; let busy = false; let captured = false; let factoryCalled = false; let terminationCalls = 0;
  const call = async (name: string): Promise<void> => { await Promise.resolve(); calls.push(name); };
  const owner = Object.freeze({
    status: (): object => ({ binding: launched ? { original: true } : null, launchConsumed: calls.includes("launch"), noProcessCleanupAvailable: mode === "no-root" && !released, released, helperClosed: released, busy }),
    startSavedReadbackGeneration: async (): Promise<void> => { await Promise.resolve(); calls.push("launch"); if (mode === "no-root") { throw new Error("original root was never created"); } if (mode === "pending-launch") { busy = true; entered.resolve(true); await blocked.promise; busy = false; } launched = true; },
    observeFootprintMainConstruction: (): Promise<void> => call("main"), observeSavedReadbackStartPage: async (): Promise<object> => { await Promise.resolve(); calls.push("browser"); return { schema: "easyeda-pro-control.pcb-diagnostic-browser-observation.v1", targets: [{ targetId: "page", type: "page", attached: false, url: "https://client/editor?cll=warn" }] }; },
    inspectFrames: async (target: string): Promise<object> => { await Promise.resolve(); assert.equal(target, "page"); calls.push("frames"); return { schema: "easyeda-pro-control.pcb-diagnostic-frame-inventory.v1", targetId: "page", frames: [{ id: "frame", loaderId: "loader", securityOrigin: "https://client", url: "https://client/editor?cll=warn" }] }; },
    inspectScript: async (frame: string): Promise<void> => { await Promise.resolve(); assert.equal(frame, "frame"); calls.push("ui"); },
    createSavedReadbackCacheOrigin: async (): Promise<object> => { await Promise.resolve(); calls.push("cache-origin"); return origin; },
    publishSavedCacheBackup: (): Promise<void> => call("backup"), invalidateSavedCaches: (): Promise<void> => call("invalidate"), prepareSavedReadbackLoading: (): Promise<void> => call("load-prepare"),
    armSavedReadbackLoadWorker: async (setup: (source: object) => Promise<void>): Promise<void> => { await Promise.resolve(); calls.push("load-arm"); await setup(origin); },
    prepareSavedReadbackRegistrationIntent: (): Promise<void> => call("registration-intent"), registerSavedReadbackProject: (): Promise<void> => call("registration"),
    openSavedReadbackProject: async (): Promise<object> => { await Promise.resolve(); calls.push("project"); return { ok: true }; }, openSavedReadbackPcb: async (): Promise<object> => { await Promise.resolve(); calls.push("pcb"); return { ok: true }; },
    observeSavedReadbackPcbOpening: (): Promise<void> => call("pcb-source"), observeSavedReadbackPrimitives: async (): Promise<object> => { await call("dto"); return { syntheticOriginalDto: true }; }, observeSavedReadbackScene: async (): Promise<object> => { await call("scene"); return { syntheticOriginalScene: true }; },
    qualifySavedReadbackModel: (): object => { calls.push("model"); return model; }, observeApplicationWindow: async (): Promise<string> => { await Promise.resolve(); calls.push("window"); return "123"; },
    requestNormalClose: async (hwnd: string): Promise<void> => { await Promise.resolve(); assert.equal(hwnd, "123"); calls.push("normal-close"); terminated = true; },
    observeTermination: async (): Promise<boolean> => { await Promise.resolve(); assert.equal(busy, false); calls.push("termination"); terminationCalls += 1; if (mode === "late-exit") { terminated = terminationCalls > 80; } else if (mode === "exit-never") { terminated = false; } return terminated; },
    abortSavedReadback: async (confirm: true): Promise<void> => { await Promise.resolve(); assert.equal(confirm, true); assert.equal(launched, true); calls.push("abort"); terminated = true; busy = false; if ((mode === "pending-cache" || mode === "exit-never")) { blocked.reject(new Error("original cache canceled")); } },
    releaseNoProcess: async (): Promise<void> => { await Promise.resolve(); assert.equal(launched, false); calls.push("release-no-process"); released = true; },
    releaseClosed: async (): Promise<void> => { await Promise.resolve(); assert.equal(terminated, true); assert.equal(busy, false); if (mode === "complete") { assert.equal(captured, false); } calls.push("release"); released = true; },
  });
  const journalRecords = ["reopen-intent"]; let publicationPending = false, repaired = false;
  const journal = Object.freeze({
    retained: (): object => ({ records: journalRecords.map(kind => ({ kind })), publicationPending }),
    waitForPublication: (): Promise<void> => Promise.resolve(), assertCurrent: (): Promise<void> => Promise.resolve(),
    settlePublication: async (): Promise<void> => { await Promise.resolve(); if (!repaired) { throw new Error("original publication still unavailable"); } publicationPending = false; },
    append: async (kind: string): Promise<void> => { await Promise.resolve(); journalRecords.push(kind); calls.push(`journal:${kind}`);
      if (journalMode === "lost" && kind === "reopened-native-intent") { publicationPending = true; throw new Error("original publication acknowledgement lost"); }
    },
    recordReaderNoProcessReleaseIntent: async (actual: unknown): Promise<void> => { await Promise.resolve(); assert.equal(actual, owner); assert.equal(launched, false); journalRecords.push("no-process-release-intent"); calls.push("journal:no-process-release-intent"); },
    requireReaderNoProcessReleaseReady: (actual: unknown): void => { assert.equal(actual, owner); assert.equal(journalRecords.at(-1), "no-process-release-intent"); },
    recordReaderNoProcessReleaseResult: async (actual: unknown): Promise<void> => { await Promise.resolve(); assert.equal(actual, owner); assert.equal(released, true); journalRecords.push("no-process-release-result"); calls.push("journal:no-process-release-result"); },
  });
  class Capture {
    readonly #proof = proof; #released = false; #releasePromise: Promise<void> | null = null;
    public constructor(actual: object, exit: object, observed: object) { assert.equal(actual, owner); assert.equal(exit, termination); assert.equal(observed, model); assert.equal(released, true); calls.push("capture-constructor"); }
    public async capture(): Promise<object> { await Promise.resolve(); assert.equal(terminated, true); calls.push("capture"); captured = true; return this.#proof; }
    public settleRelease(): Promise<void> {
      this.#releasePromise ??= (async (): Promise<void> => { await Promise.resolve(); calls.push("fd-release"); if (mode === "fd-close") { throw new Error("original FD close acknowledgement unknown"); } this.#released = true; })();
      return this.#releasePromise;
    }
    public isReleaseAcknowledged(): boolean { return this.#released; }
    public status(): object { return { descriptorReleaseAcknowledged: this.#released }; }
  }
  const loaded: { exports: Record<string, unknown> } = { exports: {} }; const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name === "./current-pcb-via-write-journal.ts") { return { assertOriginalCurrentPcbViaWriteJournal: (actual: unknown, plan: unknown): void => { assert.equal(actual, journal); assert.equal(plan, originalPlan); } }; }
    if (name === "./current-pcb-via-write-closed-checkpoint.ts") { return { requireOriginalCurrentPcbViaWriteClosedCheckpoint: (actual: unknown): object => { assert.equal(actual, prepared); return { plan: originalPlan }; } }; }
    if (name === "./current-pcb-via-saved-readback-owner.ts") { return {
      startCurrentPcbViaSavedReadbackOwner: async (actual: unknown, target: unknown): Promise<object> => { await Promise.resolve(); assert.equal(actual, options); assert.equal(target, prepared); assert.equal(factoryCalled, false); factoryCalled = true; calls.push("factory"); return owner; },
      assertOriginalCurrentPcbViaSavedReadbackOwner: (actual: unknown): void => { assert.equal(actual, owner); },
      originalCurrentPcbViaSavedReadbackTarget: (actual: unknown): object => { assert.equal(actual, owner); return prepared; },
      originalCurrentPcbViaSavedReadbackTermination: (actual: unknown): object => { assert.equal(actual, owner); assert.equal(terminated, true); return termination; },
      currentPcbViaSavedReadbackAllocationOutcome: (target: unknown): object => { assert.equal(target, prepared); return { state: factoryCalled ? "retained" : "not-attempted", owner: factoryCalled ? owner : null }; },
      requireOriginalCurrentPcbViaSavedLoadOrigin: (source: unknown, actual: unknown, target: unknown): object => { assert.equal(source, origin); assert.equal(actual, owner); assert.equal(target, prepared); return { assertCurrent: async (): Promise<void> => { await Promise.resolve(); calls.push("load-source-original"); } }; },
    }; }
    if (name === "./current-pcb-via-saved-cache-observer.ts") { return { observeOriginalCurrentPcbViaSavedCaches: async (actual: unknown, target: unknown, source: unknown): Promise<void> => { await Promise.resolve();
      assert.equal(actual, owner); assert.equal(target, prepared); assert.equal(source, origin); calls.push("cache-observe"); if ((mode === "pending-cache" || mode === "exit-never")) { busy = true; entered.resolve(true); try { await blocked.promise; } finally { busy = false; } }
    } }; }
    if (name === "./current-pcb-via-saved-readback-closed-proof.ts") { return { CurrentPcbViaSavedReadbackClosedCapture: Capture,
      requireOriginalCurrentPcbViaSavedReadbackClosedProof: (actual: unknown, actor: unknown, observed: unknown): object => { assert.equal(actual, proof); assert.equal(actor, owner); assert.equal(observed, model); assert.equal(captured, true); return { rawHistory: { syntheticCompleteRawHistory: true } }; } }; }
    return sourceRequire(name) as unknown;
  }, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentPcbViaSavedReadbackWorkflow"], lookup = loaded.exports["requireOriginalCurrentPcbViaSavedReadbackWorkflowResult"]; assert.ok(typeof Constructor === "function" && typeof lookup === "function");
  assert.throws(() => Reflect.construct(Constructor, [options, { ...prepared }]));
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Checked production coordinator; only its imported native/data issuers are explicit inert seams, never constructor-injected callbacks.
  const workflow = Reflect.construct(Constructor, [options, prepared, journalMode === "none" ? null : journal]) as CurrentPcbViaSavedReadbackWorkflow;
  assert.throws(() => Reflect.construct(Constructor, [options, prepared]));
  return { workflow, calls, journalRecords, repairJournal: (): void => { repaired = true; }, entered: entered.promise, continueLaunch: (): void => { blocked.resolve(true); }, requireResult: (result): unknown => Reflect.apply(lookup, undefined, [result, workflow]) };
}
void test("complete saved coordinator retains one execution and releases only after original model/closure/fullclosed proof", async () => {
  const f = await fixture(); const execution = f.workflow.execute(); assert.equal(f.workflow.execute(), execution); const result = await execution;
  assert.equal(result.reopenedVerified, true); assert.equal(f.workflow.inspect()["cleanupComplete"], true); assert.equal(f.requireResult(result), result);
  assert.throws(() => f.requireResult({ ...result })); assert.equal(f.workflow.execute(), execution);
  assert.deepEqual(f.calls, ["factory", "launch", "main", "browser", "frames", "ui", "cache-origin", "cache-observe", "backup", "invalidate", "load-prepare", "load-arm", "load-source-original", "registration-intent", "registration", "project", "pcb", "pcb-source", "dto", "scene", "model", "window", "normal-close", "termination", "release", "capture-constructor", "capture", "fd-release"]);
});
void test("journaled reader publishes each intent before its original effect and releases before fresh fullSQL capture", async () => {
  const f = await fixture("complete", "complete"); const result = await f.workflow.execute(); assert.equal(f.requireResult(result), result);
  const ordered = ["journal:reopen-result", "journal:reopened-native-intent", "dto", "journal:reopened-native-result", "journal:reopened-scene-intent", "scene", "journal:reopened-scene-result", "journal:reopen-close-intent", "normal-close", "journal:reopen-close-result", "journal:reopen-exit-intent", "termination", "release", "journal:reopen-exit-result", "journal:reopened-sql-intent", "capture", "fd-release", "journal:reopened-sql-result"];
  let previous = -1; for (const entry of ordered) { const index = f.calls.indexOf(entry); assert.ok(index > previous, entry); previous = index; }
  assert.equal(f.journalRecords.includes("complete-result"), false);
});
void test("an unreproved original publication holds cleanup until one settlement joins the same record", async () => {
  const f = await fixture("complete", "lost"); await assert.rejects(f.workflow.execute(), /publication acknowledgement lost/u);
  assert.equal(f.calls.includes("dto"), false); assert.equal(f.calls.includes("abort"), false); assert.equal(f.calls.includes("release"), false);
  assert.equal(f.workflow.inspect()["cleanupPublicationBlocked"], true);
  f.repairJournal(); const settlement = f.workflow.settleCleanup(); assert.equal(f.workflow.settleCleanup(), settlement); await settlement;
  assert.equal(f.calls.filter(value => value === "abort").length, 1); assert.equal(f.calls.filter(value => value === "release").length, 1);
  assert.deepEqual(f.journalRecords.slice(-7), ["failure", "abort-intent", "abort-result", "termination-intent", "termination-result", "release-intent", "release-result"]);
  assert.equal(f.workflow.inspect()["reopenedVerified"], false); assert.equal(f.workflow.inspect()["cleanupComplete"], true);
});
void test("lost original descriptor-close acknowledgement cannot report cleanup or reopened SQL acceptance", async () => {
  const f = await fixture("fd-close", "complete"); await assert.rejects(f.workflow.execute(), /FD close acknowledgement unknown/u);
  assert.equal(f.calls.filter(value => value === "release").length, 1); assert.equal(f.calls.filter(value => value === "fd-release").length, 1);
  assert.equal(f.workflow.inspect()["cleanupComplete"], false); assert.equal(f.workflow.inspect()["reopenedVerified"], false);
  assert.equal(f.journalRecords.includes("reopened-sql-result"), false); assert.equal(f.journalRecords.includes("failure"), true);
  await assert.rejects(f.workflow.settleCleanup(), /FD close acknowledgement unknown/u);
  assert.equal(f.calls.filter(value => value === "fd-release").length, 1);
});
void test("journaled reader no-root cleanup never manufactures termination or design completion", async () => {
  const f = await fixture("no-root", "complete"); await assert.rejects(f.workflow.execute(), /never created/u);
  assert.deepEqual(f.calls.slice(-4), ["journal:failure", "journal:no-process-release-intent", "release-no-process", "journal:no-process-release-result"]);
  assert.equal(f.calls.includes("abort"), false); assert.equal(f.calls.includes("termination"), false);
  assert.equal(f.workflow.inspect()["originalClosureObserved"], false); assert.equal(f.workflow.inspect()["cleanupComplete"], true); assert.equal(f.workflow.inspect()["reopenedVerified"], false);
});
void test("pending original cache abort joins its parent failure and original helper closure without reopening or replay", async () => {
  const f = await fixture("pending-cache"); const execution = f.workflow.execute(), refused = assert.rejects(execution); await f.entered;
  const cleanup = f.workflow.abort(true); assert.equal(f.workflow.settleCleanup(), cleanup); await cleanup; await refused;
  assert.equal(f.workflow.inspect()["cleanupComplete"], true); assert.equal(f.workflow.inspect()["reopenedVerified"], false);
  assert.equal(f.workflow.execute(), execution); assert.deepEqual(f.calls.slice(-3), ["abort", "termination", "release"]); assert.equal(f.calls.filter(value => value === "factory").length, 1);
});
void test("abort during original launch waits that same Promise and cleans its late original binding", async () => {
  const f = await fixture("pending-launch"); const execution = f.workflow.execute(), refused = assert.rejects(execution); await f.entered;
  const cleanup = f.workflow.abort(true); await Promise.resolve(); assert.equal(f.calls.includes("abort"), false); f.continueLaunch(); await cleanup; await refused;
  assert.equal(f.workflow.inspect()["cleanupComplete"], true); assert.deepEqual(f.calls, ["factory", "launch", "abort", "termination", "release"]);
});

void test("one additional original exit wait can finish cleanup without changing the failed operation proof", async () => {
  const f = await fixture("late-exit"); const execution = f.workflow.execute(); await assert.rejects(execution, /EXIT_NOT_OBSERVED/u);
  assert.equal(f.workflow.inspect()["cleanupSettled"], true); assert.equal(f.workflow.inspect()["cleanupExitWaitExhausted"], true);
  assert.equal(f.calls.filter(value => value === "termination").length, 80); assert.equal(f.calls.filter(value => value === "abort").length, 1);
  const settlement = f.workflow.settleCleanup(); assert.equal(f.workflow.settleCleanup(), settlement); await settlement;
  assert.equal(f.workflow.inspect()["cleanupComplete"], true); assert.equal(f.workflow.inspect()["failed"], true); assert.equal(f.workflow.inspect()["reopenedVerified"], false);
  assert.equal(f.calls.filter(value => value === "termination").length, 81); assert.equal(f.calls.filter(value => value === "release").length, 1); assert.equal(f.calls.includes("capture"), false);
  assert.equal(f.workflow.execute(), execution); await assert.rejects(execution); await f.workflow.settleCleanup(); assert.equal(f.calls.filter(value => value === "release").length, 1);
});
void test("an exhausted additional read-only wait stays consumed without another abort or third wait", async () => {
  const f = await fixture("exit-never"); const execution = f.workflow.execute(), refused = assert.rejects(execution); await f.entered;
  const cleanup = f.workflow.abort(true); await assert.rejects(cleanup, /EXIT_NOT_OBSERVED/u); await refused;
  const settlement = f.workflow.settleCleanup(); await assert.rejects(settlement, /EXIT_NOT_OBSERVED/u);
  assert.equal(f.workflow.settleCleanup(), settlement); await assert.rejects(f.workflow.settleCleanup());
  assert.equal(f.calls.filter(value => value === "abort").length, 1); assert.equal(f.calls.filter(value => value === "termination").length, 80); assert.equal(f.calls.includes("release"), false);
  assert.equal(f.workflow.inspect()["cleanupComplete"], false); assert.equal(f.workflow.inspect()["reopenedVerified"], false);
});
