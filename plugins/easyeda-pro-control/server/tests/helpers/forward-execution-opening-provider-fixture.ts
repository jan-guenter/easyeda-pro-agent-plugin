/** Real v2 factory/private allocation registry and managed journal with one
 * inert Linux helper. Checkpoint, complete-SQL and installation collectors
 * are explicit synthetic seams; no native/source equivalence is proved. */
/* oxlint-disable import/max-dependencies -- The actual factory fixture joins managed records, their digests and separate synthetic collectors without replacing private ownership guards. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { loadOperation } from "../../src/artifacts.ts";
import { sha256Json } from "../../src/core.ts";
import { CurrentFootprintForwardExecutionOpeningJournal } from "../../src/current-footprint-forward-execution-opening-journal.ts";
import type { CurrentFootprintForwardExecutionOpeningProvider } from "../../src/current-footprint-forward-execution-opening.ts";
import type { CurrentFootprintForwardExecutionOpeningRequest } from "../../src/current-footprint-forward-execution-opening-contract.ts";
import type { CurrentPcb209WorkerStartupOpening } from "../../src/current-pcb-209-worker-startup-opening.ts";
import { forwardExecutionOpeningJournalFixture } from "./forward-execution-opening-journal-fixture.ts";
import { combinedReadyFactoryFixture } from "./current-footprint-combined-ready-fixture.ts";

export async function forwardExecutionOpeningProviderFixture(request: CurrentFootprintForwardExecutionOpeningRequest,
  mode?: "prepared-publication" | "prelaunch-cleanup-ack" | "no-allocation-cleanup-ack" | "no-process-cleanup-ack" | "no-process-preflight" | "launched" | "allocation-current" | "launch-intent-ack" | "launch-intent-cleanup-ack" | "launch-current" | "launch-current-cleanup-ack" | "ensure-storage" | "held-storage" | "create-ack" | "create-conflict",
  supplied: Readonly<{ verifyNativeGraph?: () => Promise<void>; childProgram?: string; launchTarget?: Readonly<{ windowsPath: string; sha256: string }>;
    openingForRelease?: Readonly<{ Constructor: typeof CurrentPcb209WorkerStartupOpening; opening: CurrentPcb209WorkerStartupOpening }> }> = {}): Promise<Readonly<{
  provider: CurrentFootprintForwardExecutionOpeningProvider;
  factory: Awaited<ReturnType<typeof combinedReadyFactoryFixture>>;
  state: { allocations: number; checkpointReads: number; sqlReads: number; preparedWasPublished: boolean; producerWasPublished: boolean; installationChecks: number; currentFailures: number };
  journalFixture: Awaited<ReturnType<typeof forwardExecutionOpeningJournalFixture>> | null;
}>> {
  const noProcess = mode === "no-process-cleanup-ack" || mode === "no-process-preflight";
  const postIntent = mode === "launch-intent-ack" || mode === "launch-intent-cleanup-ack" || mode === "launch-current" || mode === "launch-current-cleanup-ack";
  const modules: Record<string, unknown> = {};
  if (supplied.verifyNativeGraph !== undefined) {
    const verify = supplied.verifyNativeGraph;
    modules["./current-footprint-forward-cold-native-graph.ts"] = { captureCurrentFootprintForwardColdNativeGraph: (distribution: unknown, challenge: unknown): Promise<object> => {
      assert.equal(distribution, "Synthetic"); assert.equal(typeof challenge, "string"); assert.match(String(challenge), /^[a-f\d]{32}$/u);
      return Promise.resolve(Object.freeze({ verify,
        bootstrap: `$ErrorActionPreference='Stop';# synthetic fixed graph, never executed\n& {} -WorkerStartupFootprintForwardExecution209 -CombinedReadyChallenge '${String(challenge)}'` }));
    } };
  }
  let childProgram = supplied.childProgram;
  if (childProgram === undefined && noProcess) { childProgram = `
      const readline=require('node:readline');const input=readline.createInterface({input:process.stdin});
      process.stdout.write(JSON.stringify(packet)+'\\n');
      input.on('line',line=>{const q=JSON.parse(line);if(q.action!=='release-no-process')throw Error('Unexpected inert request');
        process.stdout.write(JSON.stringify({id:q.id,ok:true,result:{creationState:'not-entered',processCreated:false,released:true}})+'\\n');});
    `; }
  const factory = await combinedReadyFactoryFixture(mode === "prelaunch-cleanup-ack" || noProcess || mode === "launched" || mode === "allocation-current" || postIntent ? "ready" : "wrong-challenge", "forward-execution", false,
    { modules, ...(childProgram === undefined ? {} : { childProgram }), ...(supplied.launchTarget === undefined ? {} : { launchTarget: supplied.launchTarget }) });
  const source = new URL("../../src/current-footprint-forward-execution-opening.ts", import.meta.url); const require = createRequire(source);
  let providerSource = await readFile(source, "utf8");
  if (supplied.openingForRelease !== undefined) {
    // Attach a genuine settled StartupOpening inside the transformed test module.
    // Native owner allocation, termination and release stay original.
    providerSource = providerSource.replace("  public async release(): Promise<void> {", "  public syntheticOpeningForReleaseForTest(opening: CurrentFootprintCopyStartupOpening): void { need(this.#opening === null && opening.status().settled, 'SYNTHETIC_SETTLED_OPENING'); this.#opening = opening; this.#openingInvoked = true; }\n  public async release(): Promise<void> {");
  }
  const output = await transform(providerSource, { loader: "ts", format: "cjs", target: "node24" });
  const loaded = { exports: {} }, state = { allocations: 0, checkpointReads: 0, sqlReads: 0, preparedWasPublished: false, producerWasPublished: false, installationChecks: 0, currentFailures: 0 };
  const installationFile = Object.freeze({ windowsPath: "C:\\Synthetic\\easyeda-pro.exe", bytes: 1, sha256: "e".repeat(64) });
  const installationPlan = Object.freeze({ schema: "easyeda-pro-control.pcb-diagnostic-installation.v1", files: Object.freeze([installationFile]) });
  const installation = Object.freeze({ paths: Object.freeze({ syntheticVerifiedPaths: true }), facadeSha256: "f".repeat(64), plan: installationPlan });
  const checkpoint = Object.freeze({ profile: "easyeda-pro-control.current-disposable-open-checkpoint.v1", checkpoint: Object.freeze({ checkpointSha256: "a".repeat(64) }),
    targetEvidence: Object.freeze({ projectUuid: request.target.projectUuid, documentUuid: request.target.documentUuid, branchUuid: "b".repeat(32), docType: "PCB", sourceSha256: request.target.expectedSourceSha256 }) });
  const before = Object.freeze({ checkpointSha256: "a".repeat(64), logicalSha256: "c".repeat(64) });
  const completion = Object.freeze({ observedChildClose: true, exitCode: 0, exitSignal: null, elapsedMs: 1 });
  const journalMode = mode === "prelaunch-cleanup-ack" || mode === "no-allocation-cleanup-ack" || mode === "no-process-cleanup-ack" || mode === "launch-current-cleanup-ack" ? "cleanup-ack" : mode;
  const journalFixture = journalMode !== undefined && journalMode !== "prepared-publication" && journalMode !== "launch-current" && journalMode !== "allocation-current" && journalMode !== "launched" && journalMode !== "no-process-preflight" ? await forwardExecutionOpeningJournalFixture(journalMode) : null;
  const BaseJournal = journalFixture?.Journal ?? CurrentFootprintForwardExecutionOpeningJournal;
  let fail = mode === "prepared-publication" || mode === "no-allocation-cleanup-ack";
  let allocationFail = mode === "prelaunch-cleanup-ack";
  let failCurrent = false;
  class InterruptedJournal extends BaseJournal {
    public override async append(...args: Parameters<CurrentFootprintForwardExecutionOpeningJournal["append"]>): Promise<void> {
      await super.append(...args);
      if (args[0] === "prepare-result" && fail) { fail = false; throw new Error("synthetic prepared publication acknowledgment lost"); }
      if (args[0] === "allocation-result" && allocationFail) { allocationFail = false; throw new Error("synthetic original prelaunch collector failed"); }
      if (args[0] === "launch-intent" && (mode === "launch-current" || mode === "launch-current-cleanup-ack")) { failCurrent = true; }
    }
  }
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name === "./current-pcb-209-worker-startup-opening.ts" && supplied.openingForRelease !== undefined) {
      return { CurrentFootprintCopyStartupOpening: supplied.openingForRelease.Constructor };
    }
    if (name === "./current-footprint-forward-execution-opening-journal.ts") { return { CurrentFootprintForwardExecutionOpeningJournal: InterruptedJournal }; }
    if (name === "./current-pcb-diagnostic-owner.ts") {
      const actual: unknown = require("./current-pcb-diagnostic-owner.ts"); assert.ok(actual !== null && typeof actual === "object");
      return { ...actual, ...factory.api,
      startCurrentFootprintForwardExecutionNativeOwner: async (input: Parameters<typeof factory.api.startCurrentFootprintForwardExecutionNativeOwner>[0]) => {
        state.allocations += 1; const operation = await loadOperation(request.operationId);
        assert.ok(Array.isArray(operation["records"])); state.preparedWasPublished = operation["records"].some((value: unknown) =>
          value !== null && typeof value === "object" && "kind" in value && value.kind === "prepare-result");
        assert.equal(state.preparedWasPublished, true); assert.equal(state.checkpointReads, 1); assert.equal(state.sqlReads, 1);
        const intent: unknown = operation["records"].find((value: unknown) => value !== null && typeof value === "object" && "kind" in value && value.kind === "allocation-intent");
        assert.ok(intent !== null && typeof intent === "object" && "evidence" in intent && intent.evidence !== null && typeof intent.evidence === "object");
        assert.ok("producer" in intent.evidence);
        assert.deepEqual(intent.evidence.producer, { schema: "easyeda-pro-control.footprint-forward-execution-opening-producer.v1",
          source: "verifyCurrentPcb209DiagnosticInstallation", facadeSha256: installation.facadeSha256, installationSha256: sha256Json(installation) });
        assert.equal(state.installationChecks, 1); state.producerWasPublished = true;
        const owner = await factory.api.startCurrentFootprintForwardExecutionNativeOwner(input);
        if (mode === "allocation-current") { failCurrent = true; }
        return owner;
      } };
    }
    if (name === "./current-disposable-open-checkpoint.ts") { return {
      prepareCurrentDisposableOpenCheckpoint: (target: unknown): Promise<object> => { assert.deepEqual(target, request.target); state.checkpointReads += 1; return Promise.resolve(checkpoint); },
      verifyCurrentDisposableOpenCheckpoint: (current: unknown, target: unknown): Promise<void> => { assert.equal(current, checkpoint); assert.deepEqual(target, request.target); return Promise.resolve(); },
      verifyHistoricalCurrentDisposableOpenCheckpoint: (): never => { throw new Error("Synthetic fixture does not observe post-open source"); },
    }; }
    if (name === "./sqlite-inventory.ts") { return {
      readExactSqlInventory: (): Promise<object> => { state.sqlReads += 1; return Promise.resolve(before); },
      readerCompletion: (value: unknown): object => { assert.equal(value, before); return completion; },
    }; }
    if (name === "./machine-profile.ts") { return { loadRuntimeMachineProfile: (): Promise<object> => Promise.resolve({ profile: { runtime: { nodeExecutable: "/synthetic-unused/node", nodeVersion: "24.18.0", nodeSha256: "d".repeat(64) } } }) }; }
    if (name === "./current-pcb-diagnostic-installation.ts") { return { verifyCurrentPcb209DiagnosticInstallation: (): Promise<object> => {
      state.installationChecks += 1; return Promise.resolve(installation);
    } }; }
    // oxlint-disable-next-line import/no-dynamic-require -- Forward unchanged imports while naming every synthetic external collector above.
    return require(name) as unknown;
  }, loaded, loaded.exports]);
  const api: unknown = loaded.exports; assert.ok(api !== null && typeof api === "object" && "CurrentFootprintForwardExecutionOpeningProvider" in api && typeof api.CurrentFootprintForwardExecutionOpeningProvider === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Original transformed provider composes the actual factory's private module instance; external collectors are explicitly synthetic.
  const Constructor = api.CurrentFootprintForwardExecutionOpeningProvider as typeof CurrentFootprintForwardExecutionOpeningProvider;
  const provider = new Constructor(Object.freeze({ ...factory.options, assertLocalAllowed: (): void => {
    if (failCurrent) { failCurrent = false; state.currentFailures += 1; throw new Error(`synthetic ${mode === "allocation-current" ? "post-allocation" : "post-launch-intent"} current check failed`); }
  },
    assertAllowed: (): Promise<void> => Promise.resolve(), assertOtherLaunchesSettled: (): Promise<void> => Promise.resolve() }));
  if (supplied.openingForRelease !== undefined) {
    assert.ok(supplied.openingForRelease.opening instanceof supplied.openingForRelease.Constructor);
    const attach: unknown = Reflect.get(provider, "syntheticOpeningForReleaseForTest"); assert.ok(typeof attach === "function");
    Reflect.apply(attach, provider, [supplied.openingForRelease.opening]);
  }
  return Object.freeze({ provider, factory, state, journalFixture });
}
