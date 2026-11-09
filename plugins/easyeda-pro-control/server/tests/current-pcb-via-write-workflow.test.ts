/** Real outer scheduling with explicit inert original-factory/observer seams.
 * No native helper, application, source file or Save is dispatched. */
/* oxlint-disable import/max-dependencies -- The actual outer scheduler, journal validator and shared original launch lease are tested together with explicit inert factory seams; splitting the imports would hide the concurrent-lease regression. */
/* oxlint-disable eslint/max-classes-per-file -- The two inert test-only replacements preserve the production journal and observer constructor/method signatures. */
/* oxlint-disable eslint/class-methods-use-this -- Fixed test-only instance methods deliberately model native callbacks without manufacturing production private state. */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { sha256Json } from "../src/core.ts";
import { captureCurrentPcbStringClockReply } from "../src/current-pcb-string-clock-reply.ts";
import {mainBackendModule,mainBackendTransportFixture} from "./helpers/footprint-main-backend-runner-fixture.ts";
import { createOriginalSourceError } from "../src/original-source-error.ts";
import { captureCurrentSelectedFileMainSqlStartupPauseLocations, createCurrentSelectedFileMainSqlStartupRefusalContext } from "../src/current-selected-file-main-sql-startup-refusal-context.ts";
import { assertCurrentPcbViaWriteJournalChain } from "../src/current-pcb-via-write-journal.ts";
import { CurrentPcbViaWriteWorkflow, requireOriginalCurrentPcbViaWriteFailureClosure } from "../src/current-pcb-via-write-workflow.ts";
import { acquireCurrentPcbDiagnosticLaunchExclusion, assertCurrentPcbDiagnosticLaunchExclusion, releaseCurrentPcbDiagnosticLaunchExclusion } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";

type Mode = "reserve-unknown" | "no-resource" | "unlaunched" | "main-failed" | "main-construction-failed" | "main-attach-failed" | "save-unknown" | "abort-unknown" | "publication-blocked" | "exit-late";
function ack(stage: "preflight" | "create" | "save"): Readonly<Record<string, unknown>> {
  return Object.freeze({ schema: "easyeda-pro-control.pcb209-via-write-stage.v1", stage, ok: true,
    dispatchAttempted: true, originalPromiseAcknowledged: true, primitiveId: stage === "preflight" ? null : "original-via",
    createAttempted: stage !== "preflight", createAcknowledged: stage !== "preflight", saveAttempted: stage === "save", saveAcknowledged: stage === "save",
    inverseAvailable: false, persistenceVerified: false });
}
async function fixture(mode: Mode, startupDiagnostic: unknown = null, predicateDiagnostic: unknown = null, startupRefusalContext: unknown = null): Promise<Readonly<{ workflow: CurrentPcbViaWriteWorkflow; calls: string[]; saveAck: unknown; permitOriginalExit: () => void; rejectNextOriginalExit: (error: Error) => void; replaceMainStatus:()=>void; replaceStartupDiagnostic:()=>void; replacePredicateDiagnostic:()=>void; replaceStartupRefusalContext:()=>void; failureEvidence:()=>Readonly<Record<string,unknown>>|undefined }>> {
  const calls: string[] = [], operationId = `pcb209-via-write-workflow-${randomUUID()}`;
  const prepared = Object.freeze({ qualification: {}, history: {}, inertOriginalPreparation: true });
  const plan = Object.freeze({ operationId, target: { expectedSourceSha256: "a".repeat(64) }, initialLogicalSha256: "b".repeat(64) });
  const options = Object.freeze({ inertOptions: true }); const saveAck = ack("save");
  const body = Promise.withResolvers<undefined>(), local = Promise.withResolvers<undefined>();
  let binding: object | null = null, exited = false, factoryEntered = false, released = false;
  let exitPermitted = mode !== "exit-late"; let nextExitError: Error | null = null;
  const main=mode==="main-construction-failed"?await mainBackendModule():null;const mainTransport=mainBackendTransportFixture();mainTransport.state.metadataShapeRole="capture";
  const mainRunner=main===null?null:new main.Constructor(mainTransport.transport);
  let mainStatusOwner:object|null=null;
  class InertOwner{
    public status():object{assert.equal(this,mainStatusOwner);return Object.freeze({failure:null,mainNativeFailure:mode==="main-attach-failed"?Object.freeze({action:"main-attach",code:"pcb-diagnostic-main-endpoint-deadline"}):null});}
    public retainedFootprintMainConstruction():unknown{assert.equal(this,mainStatusOwner);calls.push("main-failure-snapshot");return mainRunner?.retained()??null;}
    public retainedFootprintMainStartupDiagnostic():unknown{assert.equal(this,mainStatusOwner);calls.push("main-startup-snapshot");return startupDiagnostic;}
    public retainedFootprintMainStartupRefusalContext():unknown{assert.equal(this,mainStatusOwner);calls.push("main-startup-context-snapshot");return startupRefusalContext;}
    public retainedFootprintMainPredicateDiagnostic():unknown{assert.equal(this,mainStatusOwner);calls.push("main-predicate-snapshot");return predicateDiagnostic;}
  }
  const noResource = Object.freeze({ inertOriginalNoResource: true });
  const owner = Object.freeze({
    status: (): object => ({ binding, released, helperClosed: released, helperPid: 1, launchConsumed: false, noProcessCleanupAvailable: false }),
    startViaWriteGeneration: (): Promise<void> => {
      calls.push("launch"); if (mode === "unlaunched") { return Promise.reject(new Error("original prelaunch refusal")); }
      binding = Object.freeze({ originalBinding: true }); return Promise.resolve();
    },
    observeFootprintMainConstruction: (): Promise<object> => {
      if(mode==="main-attach-failed"){return Promise.reject(new Error("Inert original Main attach refusal"));}
      if(mainRunner===null){return Promise.resolve({});}
      return mainRunner.observe();
    }, observeViaWriteStartPage: (): Promise<object> => Promise.resolve({}),
    inspectFrames: (): Promise<object> => Promise.resolve({}), inspectScript: (): Promise<object> => Promise.resolve({}),
    openGeneratedFixtureProject: (): Promise<object> => { calls.push("project-open"); return Promise.resolve({ ok: true }); },
    openPcb: (): Promise<object> => { calls.push("pcb-open"); return Promise.resolve({ ok: true }); },
    observePcbOpening: (): Promise<object> => Promise.resolve({}),
    executeViaStage: (stage: string): Promise<object> => {
      calls.push(`sdk-${stage}`);
      if (stage === "capture") { return Promise.resolve({ captured: true }); }
      if (stage === "preflight") { return Promise.resolve(ack("preflight")); }
      assert.equal(stage, "save"); return ["save-unknown", "abort-unknown", "publication-blocked", "exit-late"].includes(mode) ? Promise.reject(new Error("original Save acknowledgement unknown")) : Promise.resolve(saveAck);
    },
    requireViaProspectiveSaveMainReady: (): void => { calls.push("original-prospective-save"); }, prepareViaSaveGeneration: (): Promise<void> => Promise.resolve(),
    abortPcbViaWrite: (): Promise<void> => {
      calls.push("original-abort");
      // oxlint-disable-next-line unicorn/no-useless-undefined -- TypeScript7 requires the exact Promise<undefined> resolver argument; this inert collector carries no authority value.
      if (mode === "main-failed"||mode==="main-construction-failed"||mode==="main-attach-failed") { body.resolve(undefined); } else { body.reject(new Error("original body stopped")); }
      if(mode==="main-construction-failed"||mode==="main-attach-failed"){
        // oxlint-disable-next-line unicorn/no-useless-undefined -- The original test deferred retains Promise<undefined>; TypeScript requires its explicit settlement value.
        local.resolve(undefined);
      }else{local.reject(new Error("original local stopped"));}
      return mode === "abort-unknown" || mode === "exit-late" ? Promise.reject(new Error("original Abort acknowledgement unknown")) : Promise.resolve();
    },
    observeTermination: (): Promise<boolean> => {
      calls.push("original-exit"); if (nextExitError !== null) { const original = nextExitError; nextExitError = null; return Promise.reject(original); }
      exited = exitPermitted; return Promise.resolve(exited);
    },
    releaseClosed: (): Promise<void> => { assert.ok(exited); calls.push("original-release"); released = true; return Promise.resolve(); },
    releaseUnlaunched: (): Promise<void> => { assert.equal(binding, null); calls.push("original-unlaunched-release"); released = true; return Promise.resolve(); },
  });
  mainStatusOwner=owner;
  type Entry = Parameters<typeof assertCurrentPcbViaWriteJournalChain>[0][number];
  const records: Entry[] = [];
  class InertJournal {
    #reserved = false; #writer: unknown = null;
    #lost = false; #pending: Entry | null = null;
    public reserve(): Promise<void> {
      if (mode === "reserve-unknown") { return Promise.reject(new Error("original reservation acknowledgement unknown")); }
      this.#reserved = true; return this.append("operation-intent", {});
    }
    public append(kind: Entry["kind"], evidence: Entry["evidence"]): Promise<void> {
      calls.push(`journal-${kind}`);
      const entry: Entry = { schema: "easyeda-pro-control.pcb209-via-write-record.v2", operationId, sequence: records.length,
        previousSha256: records.length === 0 ? null : sha256Json(records.at(-1)), kind, evidence, inverseAvailable: false };
      assertCurrentPcbViaWriteJournalChain([...records, entry]);
      if (mode === "publication-blocked" && kind === "failure" && !this.#lost) {
        this.#lost = true; this.#pending = entry; return Promise.reject(new Error("original publication acknowledgement lost"));
      }
      records.push(entry); return Promise.resolve();
    }
    public bindWriter(actual: unknown): void { assert.equal(actual, owner); assert.equal(this.#writer, null); this.#writer = actual; calls.push("bind-original-writer"); }
    public async appendPollingCancellationIntent(actual: unknown): Promise<object> {
      assert.equal(actual, this.#writer); await this.append("opening-intent", {}); return Object.freeze({ inertOpening: true });
    }
    public async appendIntent(stage: "create" | "save", evidence: Entry["evidence"], actual: unknown): Promise<object> {
      assert.equal(actual, this.#writer); await this.append(`${stage}-intent`, evidence); return Object.freeze({ inertDispatch: stage });
    }
    public assertCurrent(): Promise<void> {
      if (mode === "reserve-unknown" && !this.#reserved) { return Promise.reject(new Error("original reservation remains uncertain")); }
      assertCurrentPcbViaWriteJournalChain(records); return Promise.resolve();
    }
    public retained(): object { return { records: [...records], reserved: this.#reserved, publicationPending: this.#pending !== null }; }
    public waitForPublication(): Promise<void> { return Promise.resolve(); }
    public settlePublication(): Promise<void> {
      if (mode === "reserve-unknown" && !this.#reserved) { this.#reserved = true; return this.append("operation-intent", {}); }
      assert.ok(this.#pending !== null); assertCurrentPcbViaWriteJournalChain([...records, this.#pending]);
      calls.push("settle-original-publication"); records.push(this.#pending); this.#pending = null; return Promise.resolve();
    }
    public recordAllocationRefusal(actual: unknown): Promise<void> {
      assert.equal(actual, noResource); return this.append("allocation-refused", { allocationIntentPublished: true, nativeAllocationNeverEntered: true,
        originalFactoryNoResourceVerified: true, originalProcessExitClaimed: false, nativeOwnershipTransferred: false });
    }
    public recordWriterNoProcessReleaseIntent(actual: unknown): Promise<void> {
      assert.equal(actual, this.#writer); return this.append("no-process-release-intent", { generation: "writer", originalFactoryVerified: true,
        rootNeverCreated: true, jobEmpty: true, releaseOriginalHelperOnly: true });
    }
    public requireWriterNoProcessReleaseReady(actual: unknown): void { assert.equal(actual, this.#writer); assert.equal(binding, null); }
    public recordWriterNoProcessReleaseResult(actual: unknown): Promise<void> {
      assert.equal(actual, this.#writer); assert.ok(released); return this.append("no-process-release-result", { generation: "writer", originalFactoryVerified: true,
        rootNeverCreated: true, jobEmpty: true, helperReleaseVerified: true, designCompletionClaimed: false, readbackCompletionClaimed: false });
    }
  }
  class InertGroup {
    readonly #ack = ack("create");
    public armBeforeNavigation(): void { calls.push("observers-arm"); }
    public waitForStartupObservations(): Promise<void> { return Promise.resolve(); }
    public observeBeforeNative(): Promise<object> { return Promise.resolve({}); }
    public observeBeforeScene(): Promise<object> { return Promise.resolve({}); }
    public prepareCreate(): Promise<void> { calls.push("create-observers"); return Promise.resolve(); }
    public dispatchCreate(): Promise<object> { calls.push("sdk-create"); return Promise.resolve(this.#ack); }
    public observeAfterNative(): Promise<object> { return Promise.resolve({}); }
    public observeAfterScene(): Promise<object> { return Promise.resolve({}); }
    public qualifyEffect(): object { return Object.freeze({ inertOriginalEffect: true }); }
    public armSaveClock(): Promise<void> { return Promise.resolve(); }
    public observeOriginalSave(): Promise<void> { return mode === "main-failed" ? Promise.reject(createOriginalSourceError("PCB_DIAGNOSTIC_OWNER", "MAIN_HISTORY_REFUSED")) : body.promise; }
    public serviceSaveLocalCalls(): Promise<void> { return local.promise; }
    public drainOriginalSave(): Promise<void> { return local.promise; }
    public cancel(): void { calls.push("observers-cancel"); }
    public settleOriginalCallsAfterExit(): Promise<void> { assert.ok(exited); calls.push("original-collectors-joined"); return Promise.resolve(); }
    public status(): object { return {}; }
    public retainedCreateState(): object { return { requestGenerationEntered: true, originalAcknowledgement: this.#ack }; }
  }
  const native = {
    CurrentPcbViaWriteOwner:InertOwner,
    assertOriginalCurrentPcbViaWriteOwner: (actual: unknown): void => { assert.equal(actual, owner); },
    originalCurrentPcbViaWriteTarget: (): object => prepared,
    startCurrentPcbViaWriteOwner: (): Promise<object> => {
      calls.push("original-factory"); factoryEntered = true; return mode === "no-resource" ? Promise.reject(new Error("original factory never allocated")) : Promise.resolve(owner);
    }, currentPcbViaWriteAllocationOutcome: (): object => factoryEntered ? ({ state: mode === "no-resource" ? "no-resource" : "retained", owner: mode === "no-resource" ? null : owner }) : ({ state: "not-attempted", owner: null }),
    originalCurrentPcbViaWriteNoResource: (): object => noResource,
    requireOriginalCurrentPcbViaWriteNoResourceProof: (actual: unknown): void => { assert.equal(actual, noResource); },
    originalCurrentPcbViaWriteTermination: (): object => { assert.ok(exited); return Object.freeze({ inertTermination: true }); },
  };
  const replacements: Readonly<Record<string, unknown>> = {
    "node:timers/promises": { setTimeout: (): Promise<void> => Promise.resolve() },
    "./current-pcb-via-write-plan.ts": { requireOriginalCurrentPcbViaWritePlan: (actual: unknown): object => { assert.equal(actual, plan); return { prepared }; } },
    "./current-pcb-string-clock-reply.ts": { captureCurrentPcbStringClockReply: (value:unknown):ReturnType<typeof captureCurrentPcbStringClockReply> => { calls.push("captured-options");return captureCurrentPcbStringClockReply(value); } },
    "./current-pcb-via-write-owner.ts": native,
    "./current-pcb-via-write-journal.ts": { CurrentPcbViaWriteJournal: InertJournal, assertNoUnresolvedCurrentPcbViaWrites: (): Promise<void> => Promise.resolve() },
    "./current-pcb-via-write-observers.ts": { CurrentPcbViaWriteObservers: InertGroup },
    "./managed-fixture-generated-open-checkpoint.ts": { verifyGeneratedFixtureOpenCheckpoint: (): Promise<void> => Promise.resolve() },
    "./current-pcb-209-start-page-selection.ts": { selectCurrentPcb209StartPage: (): object => ({ targetId: "original-page" }),
      selectCurrentPcb209StartPageFrame: (): object => ({ frameId: "original-frame" }) },
  };
  const sourceRequire = createRequire(new URL("../src/current-pcb-via-write-workflow.ts", import.meta.url));
  const source = await readFile(new URL("../src/current-pcb-via-write-workflow.ts", import.meta.url), "utf8");
  const output = await transform(source, { loader: "ts", format: "cjs", target: "node24" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(id: string): unknown => replacements[id] ?? sourceRequire(id), loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentPcbViaWriteWorkflow"]; assert.ok(typeof Constructor === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Only the explicit inert original issuers/observers above differ; the actual workflow's private state and Promise scheduling run unchanged.
  const workflow = Reflect.construct(Constructor, [options, plan]) as CurrentPcbViaWriteWorkflow;
  return { workflow, calls, saveAck, permitOriginalExit: (): void => { exitPermitted = true; },
    rejectNextOriginalExit: (error: Error): void => { nextExitError = error; },
    replaceMainStatus:():void=>{Object.defineProperty(InertOwner.prototype,"retainedFootprintMainConstruction",{get:():never=>{calls.push("replacement-main-getter");throw new Error("must not execute");},configurable:true});},
    replaceStartupDiagnostic:():void=>{Object.defineProperty(InertOwner.prototype,"retainedFootprintMainStartupDiagnostic",{get:():never=>{calls.push("replacement-startup-getter");throw new Error("must not execute");},configurable:true});},
    replacePredicateDiagnostic:():void=>{Object.defineProperty(InertOwner.prototype,"retainedFootprintMainPredicateDiagnostic",{get:():never=>{calls.push("replacement-predicate-getter");throw new Error("must not execute");},configurable:true});},
    replaceStartupRefusalContext:():void=>{Object.defineProperty(InertOwner.prototype,"retainedFootprintMainStartupRefusalContext",{get:():never=>{calls.push("replacement-context-getter");throw new Error("must not execute");},configurable:true});},
    failureEvidence:()=>records.find(entry=>entry.kind==="failure")?.evidence };
}

void test("actual original plan custody refuses an equal-looking outer workflow before factory birth", () => {
  assert.throws(() => Reflect.construct(CurrentPcbViaWriteWorkflow, [Object.freeze({}), {}]), /ORIGINAL_PLAN/u);
  assert.throws(() => Reflect.apply(requireOriginalCurrentPcbViaWriteFailureClosure, undefined,
    [Object.freeze({ profile: "private.current-pcb-via-write-failure-closure.v1" }), {}, {}]), /ORIGINAL_FAILURE_CLOSURE_TOKEN/u);
});
void test("original never-allocated failure publishes its distinct terminal without exit or helper claims", async () => {
  const f = await fixture("no-resource");
  assert.throws(() => f.workflow.requireOriginalFailureClosure(), /ORIGINAL_FAILURE_CLOSURE_PENDING/u);
  await assert.rejects(f.workflow.execute(), /never allocated/u);
  assert.ok(f.calls.includes("journal-allocation-refused")); assert.equal(f.calls.includes("launch"), false);
  assert.equal(f.calls.includes("original-exit"), false); assert.equal(f.calls.includes("original-release"), false);
  assert.equal(f.workflow.inspect()["saved"], false);
  const result = f.workflow.operationResult("inspect"); assert.equal(result.effects.createAttempted, false);
  assert.equal(result.cleanup.allocation, "no-resource"); assert.equal(result.cleanup.originalTerminationVerified, false);
  assert.equal(f.workflow.inspect()["originalLaunchExclusionRetained"], false);
  const closure = f.workflow.requireOriginalFailureClosure(); assert.ok(Object.isFrozen(closure));
  assert.equal(f.workflow.requireOriginalFailureClosure(), closure);
  const source = f.workflow.requireOriginalFailurePublicationSource(); assert.ok(source !== null && Object.isFrozen(source));
  assert.equal(source.token, closure); assert.equal(f.workflow.requireOriginalFailurePublicationSource(), source);
});
void test("another original launch lease refuses before allocation and cannot be released by this failed attempt", async () => {
  const f = await fixture("no-resource"), original = acquireCurrentPcbDiagnosticLaunchExclusion();
  try {
    await assert.rejects(f.workflow.execute(), /LAUNCH_BUSY/u); assert.equal(f.calls.includes("original-factory"), false);
    assertCurrentPcbDiagnosticLaunchExclusion(original);
    assert.equal(f.workflow.requireOriginalFailurePublicationSource(), null); assert.equal(f.calls.includes("journal-operation-intent"), false);
  } finally { releaseCurrentPcbDiagnosticLaunchExclusion(original); }
});
void test("original prelaunch failure releases the actual unlaunched helper with no fake termination", async () => {
  const f = await fixture("unlaunched"); await assert.rejects(f.workflow.execute(), /prelaunch refusal/u);
  assert.ok(f.calls.includes("original-unlaunched-release")); assert.ok(f.calls.includes("journal-no-process-release-result"));
  assert.equal(f.calls.includes("original-abort"), false); assert.equal(f.calls.includes("original-exit"), false);
  assert.ok(f.calls.indexOf("bind-original-writer") < f.calls.indexOf("journal-allocation-result"));
  const result = f.workflow.operationResult("inspect"); assert.equal(result.cleanup.helperReleaseVerified, true);
  assert.equal(result.cleanup.originalTerminationVerified, false); assert.equal(result.verification.saved, false);
});
void test("later Main failure preserves the original Save ACK and aborts before joining blocked local work", async () => {
  const f = await fixture("main-failed"); const original = f.workflow.execute(); assert.equal(f.workflow.execute(), original);
  await assert.rejects(original, /MAIN_HISTORY_REFUSED/u);
  const diagnostic = f.workflow.diagnostic(); assert.equal(diagnostic.errorCode, "PCB_DIAGNOSTIC_OWNER_MAIN_HISTORY_REFUSED");
  assert.equal(diagnostic.stage, "writer-original-save"); assert.equal(diagnostic.executionAuthorized, false);
  assert.equal(f.workflow.inspect()["originalSaveAcknowledgement"], f.saveAck); assert.equal(f.workflow.inspect()["saved"], false);
  assert.equal(f.calls.filter(value => value === "sdk-save").length, 1); assert.equal(f.calls.includes("journal-save-result"), false);
  assert.ok(f.calls.indexOf("original-abort") < f.calls.indexOf("original-exit"));
  assert.ok(f.calls.indexOf("original-collectors-joined") < f.calls.indexOf("original-release"));
  assert.ok(f.calls.indexOf("journal-opening-intent") < f.calls.indexOf("project-open"));
  assert.ok(f.calls.indexOf("journal-create-intent") < f.calls.indexOf("sdk-create"));
  const result = f.workflow.operationResult("inspect"); assert.equal(result.effects.saveOutcome, "acknowledged");
  assert.equal(result.verification.saved, false); assert.equal(result.verification.reopened, false);
  await f.workflow.settleCleanup(); assert.equal(f.workflow.diagnostic(), diagnostic);
});
void test("unknown original Save is never replayed while original abort wakes both blocked collectors", async () => {
  const f = await fixture("save-unknown"); await assert.rejects(f.workflow.execute(), /acknowledgement unknown/u);
  await assert.rejects(f.workflow.execute(), /acknowledgement unknown/u); assert.equal(f.calls.filter(value => value === "sdk-save").length, 1);
  assert.equal(f.workflow.inspect()["originalSaveAcknowledgement"], null); assert.ok(f.calls.includes("original-release"));
  assert.equal(f.calls.includes("journal-complete-result"), false);
  assert.equal(f.workflow.operationResult("inspect").effects.saveOutcome, "unknown");
});
void test("unknown original Abort acknowledgement still permits independent original exit proof without repeating control", async () => {
  const f = await fixture("abort-unknown"); await assert.rejects(f.workflow.execute(), /Save acknowledgement unknown/u);
  assert.equal(f.workflow.inspect()["originalAbortAcknowledged"], false); assert.ok(f.calls.includes("original-release"));
  assert.equal(f.calls.filter(value => value === "original-abort").length, 1); assert.equal(f.workflow.inspect()["saved"], false);
});
void test("unsettled original cleanup publication holds controls and one settlement never repeats Save", async () => {
  const f = await fixture("publication-blocked"); await assert.rejects(f.workflow.execute(), /Save acknowledgement unknown/u);
  assert.equal(f.workflow.inspect()["cleanupPublicationBlocked"], true); assert.equal(f.calls.includes("original-abort"), false);
  assert.throws(() => f.workflow.requireOriginalFailureClosure(), /ORIGINAL_FAILURE_CLOSURE_PENDING/u);
  const settlement = f.workflow.settleCleanup(); assert.equal(f.workflow.settleCleanup(), settlement); await settlement;
  assert.ok(f.calls.indexOf("settle-original-publication") < f.calls.indexOf("original-abort"));
  assert.equal(f.calls.filter(value => value === "sdk-save").length, 1); assert.equal(f.calls.filter(value => value === "original-abort").length, 1);
  assert.ok(f.calls.includes("original-release")); assert.equal(f.workflow.inspect()["saved"], false);
  assert.ok(Object.isFrozen(f.workflow.requireOriginalFailureClosure()));
});

void test("ambiguous original reservation retains custody until exact publication and failure cleanup settle", async () => {
  const f = await fixture("reserve-unknown"); await assert.rejects(f.workflow.execute(), /reservation acknowledgement unknown/u);
  assert.equal(f.workflow.operationResult("inspect").state, "needs-cleanup");
  assert.equal(f.workflow.operationResult("inspect").cleanup.publicationPending, true);
  assert.equal(f.workflow.inspect()["originalLaunchExclusionRetained"], true);
  assert.equal(f.calls.includes("original-factory"), false);
  assert.throws(() => f.workflow.requireOriginalFailurePublicationSource(), /ORIGINAL_FAILURE_CLOSURE_PENDING/u);
  await f.workflow.settlePublication();
  assert.throws(() => f.workflow.requireOriginalFailurePublicationSource(), /ORIGINAL_FAILURE_CLOSURE_PENDING/u);
  await f.workflow.settleCleanup();
  assert.equal(f.workflow.operationResult("inspect").cleanup.publicationPending, false);
  assert.equal(f.workflow.inspect()["originalLaunchExclusionRetained"], false);
  assert.ok(f.calls.includes("journal-no-allocation")); assert.ok(f.workflow.requireOriginalFailurePublicationSource() !== null);
  assert.equal(f.calls.includes("original-abort"), false); assert.equal(f.calls.includes("original-release"), false);
});

void test("each explicit exhausted original exit round stays bounded and shared until the same root finally exits", async () => {
  const f = await fixture("exit-late"); await assert.rejects(f.workflow.execute(), /Save acknowledgement unknown/u);
  const initialReads = f.calls.filter(value => value === "original-exit").length; assert.equal(initialReads, 40);
  assert.equal(f.workflow.inspect()["cleanupExitWaitExhausted"], true);
  assert.equal(f.workflow.inspect()["originalLaunchExclusionRetained"], true);
  const exhausted = f.workflow.settleCleanup(); assert.equal(f.workflow.settleCleanup(), exhausted);
  await assert.rejects(exhausted, /ORIGINAL_EXIT_NOT_OBSERVED/u);
  assert.equal(f.calls.filter(value => value === "original-exit").length, 2 * initialReads);
  assert.equal(f.workflow.inspect()["cleanupExitWaitExhausted"], true);
  const observed = f.workflow.settleCleanup(); assert.notEqual(observed, exhausted); assert.equal(f.workflow.settleCleanup(), observed);
  f.permitOriginalExit(); await observed;
  assert.equal(f.calls.filter(value => value === "original-exit").length, 2 * initialReads + 1);
  await assert.rejects(exhausted, /ORIGINAL_EXIT_NOT_OBSERVED/u);
  assert.equal(f.workflow.settleCleanup(), observed); await f.workflow.abort(true);
  assert.equal(f.workflow.inspect()["cleanupExitWaitExhausted"], false);
  assert.equal(f.workflow.inspect()["originalAbortAcknowledged"], false);
  assert.equal(f.workflow.inspect()["originalLaunchExclusionRetained"], false);
  for (const action of ["original-abort", "original-release", "sdk-save", "journal-abort-intent", "journal-abort-result", "journal-termination-intent", "journal-termination-result", "journal-release-intent", "journal-release-result"]) {
    assert.equal(f.calls.filter(value => value === action).length, 1, action);
  }
  assert.equal(f.workflow.operationResult("inspect").verification.saved, false);
  assert.equal(f.workflow.operationResult("inspect").verification.reopened, false);
  assert.ok(Object.isFrozen(f.workflow.requireOriginalFailureClosure()));
});

void test("first Main snapshot retains the real runner schema refusal before cleanup and cannot be replaced",async()=>{
 const f=await fixture("main-construction-failed");assert.equal(f.workflow.mainFailure(),null);
 await assert.rejects(f.workflow.execute());const snapshot=f.workflow.mainFailure();assert.ok(snapshot!==null,JSON.stringify({diagnostic:f.workflow.diagnostic(),calls:f.calls}));
 assert.equal(snapshot.capture,"original-status-retained");assert.equal(snapshot.status?.failure,"REPLY_SCHEMA");assert.equal(snapshot.status.metadataRole,"retained-array");
 assert.ok(snapshot.status.schemaIssues!==null&&snapshot.status.schemaIssues.length>0);assert.ok(snapshot.status.requests>0);
 assert.equal(snapshot.status.releaseAttempted,false);assert.equal(snapshot.executionAuthorized,false);assert.equal(snapshot.persistenceVerified,false);
 assert.ok(f.calls.indexOf("main-failure-snapshot")<f.calls.indexOf("original-abort"));
 assert.equal(f.calls.filter(value=>value==="main-failure-snapshot").length,1);assert.equal(f.calls.includes("project-open"),false);
 assert.equal(JSON.stringify(snapshot).includes("sensitive-foreign-value"),false);assert.ok(Object.isFrozen(snapshot)&&Object.isFrozen(snapshot.status)&&Object.isFrozen(snapshot.status.schemaIssues));
 f.replaceMainStatus();await f.workflow.settleCleanup();assert.equal(f.workflow.mainFailure(),snapshot);assert.equal(f.calls.includes("replacement-main-getter"),false);
});
void test("a substituted Main retained-status accessor is never invoked and cannot replace the execution failure",async()=>{
 const f=await fixture("main-construction-failed");f.replaceMainStatus();await assert.rejects(f.workflow.execute());
 const snapshot=f.workflow.mainFailure();assert.ok(snapshot!==null,JSON.stringify({diagnostic:f.workflow.diagnostic(),calls:f.calls}));assert.equal(snapshot.capture,"capture-refused");assert.equal(snapshot.status,null);
 assert.equal(f.calls.includes("replacement-main-getter"),false);assert.ok(f.calls.includes("original-abort")&&f.calls.includes("original-release"));
});

void test("original native Main refusal remains visible when no runner was constructed",async()=>{
 const f=await fixture("main-attach-failed");await assert.rejects(f.workflow.execute());const snapshot=f.workflow.mainFailure();assert.ok(snapshot!==null);
 assert.equal(snapshot.capture,"runner-absent");assert.equal(snapshot.status,null);assert.deepEqual(snapshot.nativeFailure,{action:"main-attach",code:"pcb-diagnostic-main-endpoint-deadline"});assert.equal(snapshot.ownerFailure,null);
 assert.ok(f.calls.includes("original-abort")&&f.calls.includes("original-release"));assert.equal(f.calls.includes("project-open"),false);assert.equal(f.workflow.mainFailure(),snapshot);
});

/** Inert data from the separate original-getter seam, never a native issuer. */
function startupDiagnosticPacket(): Record<string, unknown> {
  return { profile: "private.selected-file-main-sql-startup-diagnostic.v1", site: "queryOne", refusal: "site-outside-startup-profile",
    originalPhase: "sql-fence-resume", frameState: "captured", diagnosticRequests: 2,
    summary: { slotKinds: ["object", "string", "array", "object", "object"], pathKind: "not-applicable", sqlKind: "select" },
    sourceQualified: true, originalFailureRetained: true, predicateBranchVerified: false, resumeAuthorized: false, executionAuthorized: false, saveAuthorized: false };
}

/** Valid data comes through the same passive factory, without issuing an owner
 * or treating a serialized historical record as native authority. */
function startupContextPacket(): Record<string, unknown> {
  return { ...createCurrentSelectedFileMainSqlStartupRefusalContext("run", "selection-unrecognized", { recognized: false },
    { currentVersionObserved: true, jbCallsConsumed: 0, dcCallsConsumed: 0, profileSqlOnly: true,
      cookieUpdatesAdmitted: false, selectedProjectWriteGrant: false, nativeCompletionProven: false },
    captureCurrentSelectedFileMainSqlStartupPauseLocations([{ scriptId: "app", lineNumber: 0, columnNumber: 1 }], "app", "abc")) };
}

void test("passive startup context reaches only the private failure artifact through the original pinned getter", async () => {
  const packet = startupContextPacket(); const f = await fixture("main-construction-failed", null, null, packet);
  await assert.rejects(f.workflow.execute()); const evidence = f.failureEvidence(), failure = f.workflow.mainFailure(); assert.ok(evidence !== undefined);
  assert.deepEqual(evidence["mainStartupRefusalContext"], packet); assert.notEqual(evidence["mainStartupRefusalContext"], packet);
  assert.ok(Object.isFrozen(evidence["mainStartupRefusalContext"]));
  assert.equal(Object.hasOwn(failure ?? {}, "mainStartupRefusalContext"), false); assert.equal(Object.hasOwn(f.workflow.inspect(), "mainStartupRefusalContext"), false);
  assert.equal(failure?.status?.failure, "REPLY_SCHEMA"); assert.equal(f.calls.includes("project-open"), false); assert.equal(f.calls.includes("sdk-save"), false);
  assert.ok(f.calls.indexOf("main-startup-context-snapshot") < f.calls.indexOf("original-abort"));
  packet["site"] = "prepare"; f.replaceStartupRefusalContext(); await f.workflow.settleCleanup();
  assert.equal(f.calls.filter(value => value === "main-startup-context-snapshot").length, 1);
  assert.equal(f.calls.includes("replacement-context-getter"), false); assert.equal(f.workflow.mainFailure(), failure); assert.equal(f.failureEvidence(), evidence);
  assert.ok(f.calls.includes("original-exit") && f.calls.includes("original-release"));
});

void test("malformed context, hostile data and substituted getters cannot change the first failure or original cleanup", async () => {
  let hooks = 0;
  const getter = Object.defineProperty({}, "profile", { enumerable: true, get: (): never => { hooks += 1; throw new Error("private getter"); } });
  const proxy = new Proxy({}, { ownKeys: (): never => { hooks += 1; throw new Error("private proxy"); } });
  for (const packet of [{ ...startupContextPacket(), sql: "private SQL" }, getter, proxy, startupContextPacket()]) {
    const f = await fixture("main-construction-failed", null, null, packet);
    if (packet !== getter && packet !== proxy && !Object.hasOwn(packet, "sql")) { f.replaceStartupRefusalContext(); }
    await assert.rejects(f.workflow.execute()); assert.equal(f.workflow.mainFailure()?.status?.failure, "REPLY_SCHEMA");
    assert.deepEqual(f.failureEvidence(), { stage: "main", originalExecutionStopped: true, retryAuthorized: false });
    assert.equal(f.calls.includes("replacement-context-getter"), false); assert.equal(f.calls.includes("project-open"), false); assert.equal(f.calls.includes("sdk-save"), false);
    assert.ok(f.calls.includes("original-abort") && f.calls.includes("original-exit") && f.calls.includes("original-release"));
  }
  assert.equal(hooks, 0);
});

void test("Main startup data persists once in the original private failure artifact without changing public v1 or cleanup", async () => {
  const packet = startupDiagnosticPacket(); const f = await fixture("main-construction-failed", packet);
  await assert.rejects(f.workflow.execute()); const snapshot = f.workflow.mainFailure(); assert.ok(snapshot !== null);
  assert.equal(snapshot.capture, "original-status-retained"); assert.equal(snapshot.status?.failure, "REPLY_SCHEMA");
  const evidence = f.failureEvidence(); assert.ok(evidence !== undefined);
  assert.deepEqual(evidence["mainStartupDiagnostic"], packet); assert.notEqual(evidence["mainStartupDiagnostic"], packet);
  assert.equal(evidence["stage"], "main"); assert.equal(evidence["originalExecutionStopped"], true); assert.equal(evidence["retryAuthorized"], false);
  assert.ok(Object.isFrozen(evidence["mainStartupDiagnostic"])); assert.equal(Object.hasOwn(snapshot, "mainStartupDiagnostic"), false);
  assert.ok(f.calls.indexOf("main-startup-snapshot") < f.calls.indexOf("original-abort"));
  assert.ok(f.calls.includes("original-exit") && f.calls.includes("original-release")); assert.equal(f.calls.includes("project-open"), false);
  assert.equal(f.calls.includes("sdk-save"), false); packet["site"] = "driver";
  f.replaceStartupDiagnostic(); await f.workflow.settleCleanup();
  assert.equal(f.calls.filter(value => value === "main-startup-snapshot").length, 1);
  assert.equal(f.calls.includes("replacement-startup-getter"), false); assert.equal(f.workflow.mainFailure(), snapshot);
  assert.equal(f.failureEvidence(), evidence);
});

void test("live captured-tuple v2 reaches the same private artifact while historical v1 remains supported", async () => {
  const packet = { ...startupDiagnosticPacket(), profile: "private.selected-file-main-sql-startup-diagnostic.v2", frameOrigin: "captured-original-tuple", diagnosticRequests: 1 };
  const f = await fixture("main-construction-failed", packet); await assert.rejects(f.workflow.execute());
  const evidence = f.failureEvidence(), failure = f.workflow.mainFailure(); assert.ok(evidence !== undefined);
  assert.deepEqual(evidence["mainStartupDiagnostic"], packet); assert.equal(Object.hasOwn(failure ?? {}, "mainStartupDiagnostic"), false);
  assert.equal(Object.hasOwn(f.workflow.inspect(), "mainStartupDiagnostic"), false); assert.equal(failure?.status?.failure, "REPLY_SCHEMA");
  assert.equal(f.calls.filter(value => value === "main-startup-snapshot").length, 1);
  assert.ok(f.calls.includes("original-exit") && f.calls.includes("original-release")); assert.equal(f.calls.includes("project-open"), false); assert.equal(f.calls.includes("sdk-save"), false);
});

void test("substituted or malformed optional startup data cannot leak values, replace Main failure or block original cleanup", async () => {
  let hooks = 0; const poison = {};
  Object.defineProperty(poison, "profile", { enumerable: true, get: (): never => { hooks += 1; throw new Error("private value"); } });
  for (const packet of [{ ...startupDiagnosticPacket(), sql: "private SQL" }, poison, startupDiagnosticPacket()]) {
    const f = await fixture("main-construction-failed", packet); if (packet !== poison && !Object.hasOwn(packet, "sql")) { f.replaceStartupDiagnostic(); }
    await assert.rejects(f.workflow.execute()); assert.equal(f.workflow.mainFailure()?.capture, "original-status-retained");
    assert.deepEqual(f.failureEvidence(), { stage: "main", originalExecutionStopped: true, retryAuthorized: false });
    assert.equal(f.calls.includes("replacement-startup-getter"), false); assert.ok(f.calls.includes("original-abort") && f.calls.includes("original-release"));
    assert.equal(f.calls.includes("sdk-save"), false); assert.equal(JSON.stringify(f.failureEvidence()).includes("private"), false);
  }
  assert.equal(hooks, 0);
});

/** Separate closed failure probe data, with no original native authority. */
function predicateDiagnosticPacket(): Record<string, unknown> {
  return { profile: "private.selected-file-main-sql-predicate-diagnostic.v1", site: "initializerBirth", probeState: "captured", stage: "path",
    diagnosticRequests: 1, sourceQualified: true, originalFailureRetained: true, originalPredicateBranchVerified: false,
    resumeAuthorized: false, executionAuthorized: false, saveAuthorized: false };
}
void test("separate predicate packet persists through original failure publication and cannot alter cleanup or public v1", async () => {
  const packet = predicateDiagnosticPacket(); const f = await fixture("main-construction-failed", startupDiagnosticPacket(), packet);
  await assert.rejects(f.workflow.execute()); const evidence = f.failureEvidence(); assert.ok(evidence !== undefined);
  assert.deepEqual(evidence["mainStartupPredicateDiagnostic"], packet); assert.notEqual(evidence["mainStartupPredicateDiagnostic"], packet);
  assert.ok(Object.isFrozen(evidence["mainStartupPredicateDiagnostic"])); assert.ok(Object.hasOwn(evidence, "mainStartupDiagnostic"));
  assert.equal(Object.hasOwn(f.workflow.mainFailure() ?? {}, "mainStartupPredicateDiagnostic"), false);
  assert.ok(f.calls.indexOf("main-predicate-snapshot") < f.calls.indexOf("original-abort"));
  assert.ok(f.calls.includes("original-exit") && f.calls.includes("original-release")); assert.equal(f.calls.includes("sdk-save"), false);
  packet["stage"] = "condition-false"; f.replacePredicateDiagnostic(); await f.workflow.settleCleanup();
  assert.equal(f.calls.filter(value => value === "main-predicate-snapshot").length, 1); assert.equal(f.calls.includes("replacement-predicate-getter"), false);
});
void test("optional predicate data rejects substituted accessors and malformed values without invoking getters or blocking release", async () => {
  let getters = 0; const poison = Object.defineProperty({}, "profile", { enumerable: true, get: (): never => { getters += 1; throw new Error("private"); } });
  for (const packet of [{ ...predicateDiagnosticPacket(), path: "private" }, poison, predicateDiagnosticPacket()]) {
    const f = await fixture("main-construction-failed", null, packet);
    if (packet !== poison && !Object.hasOwn(packet, "path")) { f.replacePredicateDiagnostic(); }
    await assert.rejects(f.workflow.execute()); assert.deepEqual(f.failureEvidence(), { stage: "main", originalExecutionStopped: true, retryAuthorized: false });
    assert.ok(f.calls.includes("original-abort") && f.calls.includes("original-release")); assert.equal(f.calls.includes("replacement-predicate-getter"), false);
  }
  assert.equal(getters, 0);
});
void test("a new protocol failure cannot reuse the prior exhausted-round eligibility", async () => {
  const f = await fixture("exit-late"); await assert.rejects(f.workflow.execute(), /Save acknowledgement unknown/u);
  const initialReads = f.calls.filter(value => value === "original-exit").length;
  const protocolFailure = new Error("original termination protocol failed"); f.rejectNextOriginalExit(protocolFailure);
  const failed = f.workflow.settleCleanup(); await assert.rejects(failed, error => error === protocolFailure);
  assert.equal(f.workflow.inspect()["cleanupExitWaitExhausted"], false); f.permitOriginalExit();
  assert.equal(f.workflow.settleCleanup(), failed); await assert.rejects(failed, error => error === protocolFailure);
  assert.equal(f.calls.filter(value => value === "original-exit").length, initialReads + 1);
  assert.equal(f.calls.filter(value => value === "original-abort").length, 1);
  assert.equal(f.calls.includes("original-release"), false);
  // The final inert fixture deliberately retains its process-local launch
  // Quarantine; it has no helper, application, file handles or active timers.
  assert.equal(f.workflow.inspect()["originalLaunchExclusionRetained"], true);
});
