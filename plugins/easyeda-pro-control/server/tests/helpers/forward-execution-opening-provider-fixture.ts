/** Real v2 factory/private allocation registry and managed journal with one
 * inert Linux helper. Checkpoint, complete-SQL and installation collectors
 * are explicit synthetic seams; no native/source equivalence is proved. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { loadOperation } from "../../src/artifacts.ts";
import { CurrentFootprintForwardExecutionOpeningJournal } from "../../src/current-footprint-forward-execution-opening-journal.ts";
import type { CurrentFootprintForwardExecutionOpeningProvider } from "../../src/current-footprint-forward-execution-opening.ts";
import type { CurrentFootprintForwardExecutionOpeningRequest } from "../../src/current-footprint-forward-execution-opening-contract.ts";
import { forwardExecutionOpeningJournalFixture } from "./forward-execution-opening-journal-fixture.ts";
// oxlint-disable-next-line import/max-dependencies -- Join the real private factory and real managed journal through separate, explicitly synthetic external collector seams.
import { combinedReadyFactoryFixture } from "./current-footprint-combined-ready-fixture.ts";

export async function forwardExecutionOpeningProviderFixture(request: CurrentFootprintForwardExecutionOpeningRequest,
  mode?: "prepared-publication" | "prelaunch-cleanup-ack" | "no-allocation-cleanup-ack" | "no-process-cleanup-ack" | "ensure-storage" | "held-storage" | "create-ack" | "create-conflict"): Promise<Readonly<{
  provider: CurrentFootprintForwardExecutionOpeningProvider;
  factory: Awaited<ReturnType<typeof combinedReadyFactoryFixture>>;
  state: { allocations: number; checkpointReads: number; sqlReads: number; preparedWasPublished: boolean };
  journalFixture: Awaited<ReturnType<typeof forwardExecutionOpeningJournalFixture>> | null;
}>> {
  const factory = await combinedReadyFactoryFixture(mode === "prelaunch-cleanup-ack" || mode === "no-process-cleanup-ack" ? "ready" : "wrong-challenge", "forward-execution", false,
    mode === "no-process-cleanup-ack" ? { childProgram: `
      const readline=require('node:readline');const input=readline.createInterface({input:process.stdin});
      process.stdout.write(JSON.stringify(packet)+'\\n');
      input.on('line',line=>{const q=JSON.parse(line);if(q.action!=='release-no-process')throw Error('Unexpected inert request');
        process.stdout.write(JSON.stringify({id:q.id,ok:true,result:{creationState:'not-entered',processCreated:false,released:true}})+'\\n');});
    ` } : {});
  const source = new URL("../../src/current-footprint-forward-execution-opening.ts", import.meta.url); const require = createRequire(source);
  const output = await transform(await readFile(source, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const loaded = { exports: {} }, state = { allocations: 0, checkpointReads: 0, sqlReads: 0, preparedWasPublished: false };
  const checkpoint = Object.freeze({ profile: "easyeda-pro-control.current-disposable-open-checkpoint.v1", checkpoint: Object.freeze({ checkpointSha256: "a".repeat(64) }),
    targetEvidence: Object.freeze({ projectUuid: request.target.projectUuid, documentUuid: request.target.documentUuid, branchUuid: "b".repeat(32), docType: "PCB", sourceSha256: request.target.expectedSourceSha256 }) });
  const before = Object.freeze({ checkpointSha256: "a".repeat(64), logicalSha256: "c".repeat(64) });
  const completion = Object.freeze({ observedChildClose: true, exitCode: 0, exitSignal: null, elapsedMs: 1 });
  const journalFixture = mode !== undefined && mode !== "prepared-publication" ? await forwardExecutionOpeningJournalFixture(mode === "prelaunch-cleanup-ack" || mode === "no-allocation-cleanup-ack" || mode === "no-process-cleanup-ack" ? "cleanup-ack" : mode) : null;
  const BaseJournal = journalFixture?.Journal ?? CurrentFootprintForwardExecutionOpeningJournal;
  let fail = mode === "prepared-publication" || mode === "no-allocation-cleanup-ack";
  let allocationFail = mode === "prelaunch-cleanup-ack";
  class InterruptedJournal extends BaseJournal {
    public override async append(...args: Parameters<CurrentFootprintForwardExecutionOpeningJournal["append"]>): Promise<void> {
      await super.append(...args);
      if (args[0] === "prepare-result" && fail) { fail = false; throw new Error("synthetic prepared publication acknowledgment lost"); }
      if (args[0] === "allocation-result" && allocationFail) { allocationFail = false; throw new Error("synthetic original prelaunch collector failed"); }
    }
  }
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name === "./current-footprint-forward-execution-opening-journal.ts") { return { CurrentFootprintForwardExecutionOpeningJournal: InterruptedJournal }; }
    if (name === "./current-pcb-diagnostic-owner.ts") {
      const actual: unknown = require("./current-pcb-diagnostic-owner.ts"); assert.ok(actual !== null && typeof actual === "object");
      return { ...actual, ...factory.api,
      startCurrentFootprintForwardExecutionNativeOwner: async (input: Parameters<typeof factory.api.startCurrentFootprintForwardExecutionNativeOwner>[0]) => {
        state.allocations += 1; const operation = await loadOperation(request.operationId);
        assert.ok(Array.isArray(operation["records"])); state.preparedWasPublished = operation["records"].some((value: unknown) =>
          value !== null && typeof value === "object" && "kind" in value && value.kind === "prepare-result");
        assert.equal(state.preparedWasPublished, true); assert.equal(state.checkpointReads, 1); assert.equal(state.sqlReads, 1);
        return factory.api.startCurrentFootprintForwardExecutionNativeOwner(input);
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
    if (name === "./current-pcb-diagnostic-installation.ts") { return { verifyCurrentPcb209DiagnosticInstallation: (): Promise<object> => Promise.resolve({ plan: { files: [{ windowsPath: "C:\\Synthetic\\easyeda-pro.exe", sha256: "e".repeat(64) }] } }) }; }
    // oxlint-disable-next-line import/no-dynamic-require -- Forward unchanged imports while naming every synthetic external collector above.
    return require(name) as unknown;
  }, loaded, loaded.exports]);
  const api: unknown = loaded.exports; assert.ok(api !== null && typeof api === "object" && "CurrentFootprintForwardExecutionOpeningProvider" in api && typeof api.CurrentFootprintForwardExecutionOpeningProvider === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Original transformed provider composes the actual factory's private module instance; external collectors are explicitly synthetic.
  const Constructor = api.CurrentFootprintForwardExecutionOpeningProvider as typeof CurrentFootprintForwardExecutionOpeningProvider;
  const provider = new Constructor(Object.freeze({ ...factory.options, assertLocalAllowed: (): void => undefined,
    assertAllowed: (): Promise<void> => Promise.resolve(), assertOtherLaunchesSettled: (): Promise<void> => Promise.resolve() }));
  return Object.freeze({ provider, factory, state, journalFixture });
}
