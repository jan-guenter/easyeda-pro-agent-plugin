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
import { assertCurrentPcbViaWriteJournalChain } from "../src/current-pcb-via-write-journal.ts";
import { CurrentPcbViaWriteWorkflow, requireOriginalCurrentPcbViaWriteFailureClosure } from "../src/current-pcb-via-write-workflow.ts";
import { acquireCurrentPcbDiagnosticLaunchExclusion, assertCurrentPcbDiagnosticLaunchExclusion, releaseCurrentPcbDiagnosticLaunchExclusion } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";

type Mode = "reserve-unknown" | "no-resource" | "unlaunched" | "main-failed" | "save-unknown" | "abort-unknown" | "publication-blocked";
function ack(stage: "preflight" | "create" | "save"): Readonly<Record<string, unknown>> {
  return Object.freeze({ schema: "easyeda-pro-control.pcb209-via-write-stage.v1", stage, ok: true,
    dispatchAttempted: true, originalPromiseAcknowledged: true, primitiveId: stage === "preflight" ? null : "original-via",
    createAttempted: stage !== "preflight", createAcknowledged: stage !== "preflight", saveAttempted: stage === "save", saveAcknowledged: stage === "save",
    inverseAvailable: false, persistenceVerified: false });
}
async function fixture(mode: Mode): Promise<Readonly<{ workflow: CurrentPcbViaWriteWorkflow; calls: string[]; saveAck: unknown }>> {
  const calls: string[] = [], operationId = `pcb209-via-write-workflow-${randomUUID()}`;
  const prepared = Object.freeze({ qualification: {}, history: {}, inertOriginalPreparation: true });
  const plan = Object.freeze({ operationId, target: { expectedSourceSha256: "a".repeat(64) }, initialLogicalSha256: "b".repeat(64) });
  const options = Object.freeze({ inertOptions: true }); const saveAck = ack("save");
  const body = Promise.withResolvers<undefined>(), local = Promise.withResolvers<undefined>();
  let binding: object | null = null, exited = false, factoryEntered = false, released = false;
  const noResource = Object.freeze({ inertOriginalNoResource: true });
  const owner = Object.freeze({
    status: (): object => ({ binding, released, helperClosed: released, helperPid: 1, launchConsumed: false, noProcessCleanupAvailable: false }),
    startViaWriteGeneration: (): Promise<void> => {
      calls.push("launch"); if (mode === "unlaunched") { return Promise.reject(new Error("original prelaunch refusal")); }
      binding = Object.freeze({ originalBinding: true }); return Promise.resolve();
    },
    observeFootprintMainConstruction: (): Promise<object> => Promise.resolve({}), observeViaWriteStartPage: (): Promise<object> => Promise.resolve({}),
    inspectFrames: (): Promise<object> => Promise.resolve({}), inspectScript: (): Promise<object> => Promise.resolve({}),
    openGeneratedFixtureProject: (): Promise<object> => { calls.push("project-open"); return Promise.resolve({ ok: true }); },
    openPcb: (): Promise<object> => { calls.push("pcb-open"); return Promise.resolve({ ok: true }); },
    observePcbOpening: (): Promise<object> => Promise.resolve({}),
    executeViaStage: (stage: string): Promise<object> => {
      calls.push(`sdk-${stage}`);
      if (stage === "capture") { return Promise.resolve({ captured: true }); }
      if (stage === "preflight") { return Promise.resolve(ack("preflight")); }
      assert.equal(stage, "save"); return ["save-unknown", "abort-unknown", "publication-blocked"].includes(mode) ? Promise.reject(new Error("original Save acknowledgement unknown")) : Promise.resolve(saveAck);
    },
    requireViaProspectiveSaveMainReady: (): void => { calls.push("original-prospective-save"); }, prepareViaSaveGeneration: (): Promise<void> => Promise.resolve(),
    abortPcbViaWrite: (): Promise<void> => {
      calls.push("original-abort");
      // oxlint-disable-next-line unicorn/no-useless-undefined -- TypeScript7 requires the exact Promise<undefined> resolver argument; this inert collector carries no authority value.
      if (mode === "main-failed") { body.resolve(undefined); } else { body.reject(new Error("original body stopped")); }
      local.reject(new Error("original local stopped"));
      return mode === "abort-unknown" ? Promise.reject(new Error("original Abort acknowledgement unknown")) : Promise.resolve();
    },
    observeTermination: (): Promise<boolean> => { calls.push("original-exit"); exited = true; return Promise.resolve(true); },
    releaseClosed: (): Promise<void> => { assert.ok(exited); calls.push("original-release"); released = true; return Promise.resolve(); },
    releaseUnlaunched: (): Promise<void> => { assert.equal(binding, null); calls.push("original-unlaunched-release"); released = true; return Promise.resolve(); },
  });
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
    public observeOriginalSave(): Promise<void> { return mode === "main-failed" ? Promise.reject(new Error("original Main history refused")) : body.promise; }
    public serviceSaveLocalCalls(): Promise<void> { return local.promise; }
    public drainOriginalSave(): Promise<void> { return local.promise; }
    public cancel(): void { calls.push("observers-cancel"); }
    public settleOriginalCallsAfterExit(): Promise<void> { assert.ok(exited); calls.push("original-collectors-joined"); return Promise.resolve(); }
    public status(): object { return {}; }
    public retainedCreateState(): object { return { requestGenerationEntered: true, originalAcknowledgement: this.#ack }; }
  }
  const native = {
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
    "./current-pcb-via-write-plan.ts": { requireOriginalCurrentPcbViaWritePlan: (actual: unknown): object => { assert.equal(actual, plan); return { prepared }; } },
    "./current-pcb-string-clock-reply.ts": { captureCurrentPcbStringClockReply: (): void => { calls.push("captured-options"); } },
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
  return { workflow, calls, saveAck };
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
  await assert.rejects(original, /Main history refused/u);
  assert.equal(f.workflow.inspect()["originalSaveAcknowledgement"], f.saveAck); assert.equal(f.workflow.inspect()["saved"], false);
  assert.equal(f.calls.filter(value => value === "sdk-save").length, 1); assert.equal(f.calls.includes("journal-save-result"), false);
  assert.ok(f.calls.indexOf("original-abort") < f.calls.indexOf("original-exit"));
  assert.ok(f.calls.indexOf("original-collectors-joined") < f.calls.indexOf("original-release"));
  assert.ok(f.calls.indexOf("journal-opening-intent") < f.calls.indexOf("project-open"));
  assert.ok(f.calls.indexOf("journal-create-intent") < f.calls.indexOf("sdk-create"));
  const result = f.workflow.operationResult("inspect"); assert.equal(result.effects.saveOutcome, "acknowledged");
  assert.equal(result.verification.saved, false); assert.equal(result.verification.reopened, false);
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
