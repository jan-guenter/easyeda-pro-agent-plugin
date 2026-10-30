/** Actual coordinator, result decoder and full SQL verifier. The paired
 * issuer is explicitly synthetic; this is not a native writer lifecycle. */
/* oxlint-disable import/max-dependencies -- Exercise the maintained coordinator and complete SQL relation while substituting only its original paired/native issuer boundary. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentFootprintCopyExecutionCoordinator, CurrentFootprintCopyExecutionNative,
  CurrentFootprintCopyExecutionOwner, CurrentFootprintCopyExecutionQualification } from "../src/current-footprint-copy-execution-runtime.ts";
import type { CurrentFootprintCopyPairedScheduleObservation } from "../src/current-footprint-copy-paired-scheduler.ts";
import { currentFootprintCopyV2Before } from "../src/current-footprint-copy-v2-plan.ts";
import type { CurrentFootprintCopyV2Plan } from "../src/current-footprint-copy-v2-plan.ts";
import { CURRENT_FOOTPRINT_COPY_EXECUTION_PURPOSE } from "../src/current-footprint-copy-execution.ts";
import { TARGET, savedFixture } from "./helpers/current-footprint-copy-v2-saved-fixture.ts";
import { IDS, TIMES, WITNESS } from "./helpers/symbol-sql-fixture.ts";

async function coordinatorModule(scheduler: unknown): Promise<Readonly<{
  Coordinator: typeof CurrentFootprintCopyExecutionCoordinator; Owner: typeof CurrentFootprintCopyExecutionOwner;
}>> {
  const loaded: { exports: Record<string, unknown> } = { exports: {} }, url = new URL("../src/current-footprint-copy-execution-runtime.ts", import.meta.url);
  const originalRequire = createRequire(url), output = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => name === "./current-footprint-copy-paired-scheduler.ts"
    ? { CurrentFootprintCopyPairedScheduler: scheduler } : originalRequire(name) as unknown, loaded, loaded.exports]);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The actual coordinator classes retain their private fields and owner maps; only the paired native issuer is explicitly synthetic.
  return { Coordinator: loaded.exports["CurrentFootprintCopyExecutionCoordinator"] as typeof CurrentFootprintCopyExecutionCoordinator,
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Same actual module and private owner registry as the coordinator above.
    Owner: loaded.exports["CurrentFootprintCopyExecutionOwner"] as typeof CurrentFootprintCopyExecutionOwner };
}
async function fixture(mismatch: "none" | "closed-clocks" | "history" | "project-time"): Promise<Readonly<{
  runner: CurrentFootprintCopyExecutionCoordinator; calls: string[];
}>> {
  const data = await savedFixture();
  const before = currentFootprintCopyV2Before(data.copy), calls: string[] = [], termination = Object.freeze({});
  const shift = mismatch === "closed-clocks" ? 1 : 0;
  const first = TIMES.document + shift, second = data.time + shift;
  const raw = JSON.stringify({ success: true, result: { uuid: TARGET, project_uuid: data.copy.source.projectUuid,
    title: data.copy.destinationMetadata.title.toLowerCase(), display_title: data.copy.destinationMetadata.title, docType: 4,
    creator: {}, createTime: first, modifier: {}, description: data.copy.destinationMetadata.description, updateTime: second,
    custom_tags: JSON.stringify(data.copy.destinationMetadata.tags), owner: { uuid: data.copy.ownerUuid }, source: "",
    version: String(second), path: data.copy.source.projectUuid, ticket: data.copy.metadataTicket } });
  const firstTopic = "a".repeat(64), historyUuid = mismatch === "history" ? "f".repeat(32) : IDS.newHead, secondTopic = "b".repeat(64);
  const packet: CurrentFootprintCopyPairedScheduleObservation = Object.freeze({
    profile: "private.current-footprint-copy-paired-schedule-observation.v1",
    clocks: Object.freeze({ profile: "private.current-footprint-clock-rpc-observation.v1",
      samples: Object.freeze([{ ordinal: 1, producer: "buildString", documentUuid: TARGET, updateTime: first, lexicalOffset: 0, replyTopicSha256: firstTopic },
        { ordinal: 2, producer: "canvasString", documentUuid: TARGET, updateTime: second, lexicalOffset: 0, replyTopicSha256: secondTopic }] as const),
      distinctOriginalRequestsAndPendingTasksObserved: true, originalShiftAndSelectedServiceTaskJoined: true,
      originalCallbackResultAndPostAwaitValueMatched: true, allTenResumesObserved: true, allAllocatedBreakpointsRemoved: true,
      temporaryGroupsReleased: false, nativeBroadcastSenderHandleAuthenticated: false, backendClockOrSqlCompletionVerified: false,
      nativeCreateCompletionVerified: false, executionAuthorized: false }),
    main: Object.freeze({ profile: "private.current-footprint-copy-main-completion-observation.v1",
      value: Object.freeze({ historyUuid, backendActorUuid: IDS.actor,
        observedProjectUpdatedAt: mismatch === "project-time" ? "2026-10-12 14:34:58" : TIMES.project,
        observedProjectModifierUuid: IDS.actor, originalCallbackAwaitCompleted: true,
        originalCommitAwaitCompleted: true, originalProjectUpdateAwaitCompleted: true, originalServiceAwaitCompleted: true,
        controllerBodyJoined: true, nativeSqlCompletionVerified: false, parserUploadPublicationCompleted: false,
        independentClosedSqlVerified: false, savedResultVerified: false, executionAuthorized: false }),
      originalFinalPbResumedOnce: true, allFourteenCompletionPausesResumed: true, allAllocatedCompletionBreakpointsRemoved: true,
      objectGroupReleased: false, nativeSqlCompletionVerified: false, originalGenerationClosed: false, savedResultVerified: false, executionAuthorized: false }),
    serializedCreateResult: raw, clockRetirementBeforeMainCollection: true, exactOriginalCreateReplyJoined: true,
    fullQualificationVerified: false, nativeSqlCompletionVerified: false, savedResultVerified: false, executionAuthorized: false });
  let exited = false;
  class SyntheticPairedIssuer {
    #joined = false;
    #ended = false;
    public requireExecutionReady(copy: CurrentFootprintCopyV2Plan, minimum: number, maximum: number): void {
      assert.equal(copy, data.copy); assert.equal(minimum, WITNESS.serverClockMinMs); assert.equal(maximum, WITNESS.serverClockMaxMs);
      assert.equal(this.#joined, false); assert.equal(this.#ended, false);
    }
    public dispatchCreate(): Promise<void> { assert.equal(this.#ended, false); calls.push("dispatch"); return Promise.resolve(); }
    public collectClocks(): Promise<void> { assert.equal(this.#ended, false); calls.push("paired-clocks"); return Promise.resolve(); }
    public collectMain(): Promise<void> { assert.equal(this.#ended, false); calls.push("main-completion"); return Promise.resolve(); }
    public joinCreate(): Promise<CurrentFootprintCopyPairedScheduleObservation> { calls.push("join-original-create"); this.#joined = true; return Promise.resolve(packet); }
    public requireOriginalResult(value: CurrentFootprintCopyPairedScheduleObservation): void { assert.equal(value, packet); assert.equal(this.#joined, true); }
    public requireQuiescentClose(): void { assert.equal(this.#joined, true); calls.push("quiescent-close"); }
    public observeOriginalGenerationEnded(): Promise<void> { assert.equal(exited, true); this.#ended = true; calls.push("retire-after-exit"); return Promise.resolve(); }
    public diagnostics(): Readonly<Record<string, unknown>> {
      const active = this.#joined ? "complete" : "clocks-armed"; return Object.freeze({ phase: this.#ended ? "ended" : active });
    }
  }
  const schedule = new SyntheticPairedIssuer();
  const supplied = Object.freeze({ copyPlan: data.copy, witness: Object.freeze({ projectUuid: data.copy.source.projectUuid,
    branchUuid: data.copy.source.branchUuid, backendActorUuid: IDS.actor, client: data.copy.client, preDispatchMaxTicket: 100,
    documentClockMinMs: WITNESS.serverClockMinMs, documentClockMaxMs: WITNESS.serverClockMaxMs,
    backendClockMinMs: WITNESS.serverClockMinMs, backendClockMaxMs: WITNESS.serverClockMaxMs,
    backendLocalOffsetMinutes: WITNESS.serverLocalOffsetMinutes }), schedule });
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The VM-loaded actual coordinator uses the explicitly synthetic paired issuer class above; this grants no production scheduler identity.
  const qualification = supplied as unknown as CurrentFootprintCopyExecutionQualification;
  const native: CurrentFootprintCopyExecutionNative = Object.freeze({
    generation: Object.freeze({ profile: "private.current-footprint-copy-execution-generation.v1", purpose: CURRENT_FOOTPRINT_COPY_EXECUTION_PURPOSE,
      operationId: "footprint-copy-paired-coordinator-fixture", bindingSha256: "a".repeat(64) }), nativeGeneration: Object.freeze({}),
    assertOwned: (): void => undefined, qualify: () => Promise.resolve(qualification),
    requireQualification: (value: object) => { assert.equal(value, qualification); return Promise.resolve(); }, publish: () => Promise.resolve(),
    close: () => { calls.push("close"); return Promise.resolve({ closeDispatched: true }); },
    termination: () => { exited = true; return Promise.resolve({ status: "terminated", original: termination } as const); },
    requireTermination: (value: object) => { assert.equal(value, termination); assert.equal(exited, true); return Promise.resolve(); },
    snapshot: () => Promise.resolve(data.after), verifyClockClosure: (_original: CurrentFootprintCopyExecutionQualification, value: CurrentFootprintCopyPairedScheduleObservation, end: object) => {
      assert.equal(value, packet); assert.equal(end, termination); calls.push("native-clock-closure"); return Promise.resolve(); },
    release: () => { calls.push("release"); return Promise.resolve(); }, observeRelease: () => Promise.resolve("released" as const),
    verification: (): never => { throw new Error("saved generation is outside this synthetic writer test"); },
  });
  assert.equal(currentFootprintCopyV2Before(qualification.copyPlan), before);
  const { Coordinator, Owner } = await coordinatorModule(SyntheticPairedIssuer);
  return { runner: new Coordinator(new Owner(native)), calls };
}
for (const mismatch of ["none", "closed-clocks", "history", "project-time"] as const) {
  void test(`paired coordinator joins exact native clocks and main history: ${mismatch}`, async () => {
    const f = await fixture(mismatch);
    await f.runner.advance({ expectedPhase: "prepare" }); await f.runner.advance({ expectedPhase: "create" });
    assert.deepEqual(f.calls, ["dispatch", "paired-clocks", "main-completion", "join-original-create"]);
    await assert.rejects(f.runner.advance({ expectedPhase: "create" }), /PHASE_CONSUMED/u);
    await f.runner.advance({ expectedPhase: "close-writer" });
    const errors = { none: /unused/u, history: /EXACT_CLOSED_MAIN_HISTORY/u, "project-time": /EXACT_CLOSED_MAIN_PROJECT_TIME/u,
      "closed-clocks": /EXACT_CLOSED_TRANSACTION_CLOCKS/u };
    const exit = f.runner.advance({ expectedPhase: "observe-writer-exit" });
    await (mismatch === "none" ? exit : assert.rejects(exit, errors[mismatch]));
    await f.runner.advance({ expectedPhase: "release-writer" });
    assert.equal(f.runner.status().phase, mismatch === "none" ? "start-verification" : "failed-closed");
    assert.equal(f.runner.status().completeClosedSqlEffectVerified, mismatch === "none");
    assert.deepEqual(f.calls.slice(-2), ["retire-after-exit", "release"]);
    assert.equal(f.calls.filter(call => call === "dispatch").length, 1);
    assert.equal(f.runner.status().executionAuthorized, false); assert.equal(f.runner.status().nativeExecutionMounted, false);
  });
}
