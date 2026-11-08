/** Full maintained choreography with a real durable journal. Native owners,
 * effect/SQL and saved-reader receipts are explicitly inert external seams;
 * this fixture makes no connected writer or persistence claim. */
import assert from "node:assert/strict";
import { createOriginalSourceError } from "../../src/original-source-error.ts";
import { updateOperation } from "../../src/artifacts.ts";
import { freezeDeep } from "../../src/sqlite-inventory-core.ts";
import type { GeneratedSchematicRelevanceDisplayJournal } from "../../src/generated-schematic-relevance-display-journal.ts";
import type { GeneratedFixtureJournalPublicationDependencies } from "../../src/generated-fixture-journal-publication.ts";
import type { CurrentSchematicRelevanceDisplayWriteWorkflow } from "../../src/current-schematic-relevance-display-write-workflow.ts";
import { generatedSchematicRelevanceDisplayStageResultSchema } from "../../src/generated-schematic-relevance-display.ts";
import { loadSyntheticRegistryModule } from "./load-synthetic-registry-module.ts";
import { data } from "../generated-schematic-relevance-display-fixture.ts";

type Mode = "normal" | "modify-failure" | "capture-poison" | "reader-failure" | "allocation-intent-lost-ack" | "global-blocker";
let count = 0;
export async function schematicDisplayWorkflowFixture(mode: Mode = "normal"): Promise<Readonly<{ workflow: CurrentSchematicRelevanceDisplayWriteWorkflow; failure: Error;
  calls: string[]; counters: { launches: number; modifications: number; saves: number; aborts: number; releases: number; readerAborts: number; leaseReleased: boolean }; journal: () => GeneratedSchematicRelevanceDisplayJournal; requireFailure: (token: unknown) => unknown }>> {
  count += 1; const calls: string[] = [], failure = createOriginalSourceError("SCHEMATIC_RELEVANCE_WORKFLOW", `SYNTHETIC_ORIGINAL_${mode.toUpperCase().replaceAll("-", "_")}`);
  const source = data(); const operationId = `sch209-relevance-display-workflow-${String(count)}-${mode}`;
  const args = freezeDeep({ ...source.args, operation: { ...source.args.operation, operationId } });
  const prepared = Object.freeze({ qualification: { target: args.target }, history: source.history, preparationCheckpoint: { path: "synthetic-closed-checkpoint", bytes: 1, sha256: "a".repeat(64) } });
  const plan = Object.freeze({ profile: "private.current-schematic-relevance-display-write-plan.v1", operationId, executionAuthorized: false });
  const original = Object.freeze({ prepared, argumentsValue: args, request: { schema: "synthetic-fixed-request" } }); const options = Object.freeze({ explicitSyntheticOptions: true });
  const counters = { launches: 0, modifications: 0, saves: 0, aborts: 0, releases: 0, readerAborts: 0, leaseReleased: false };
  const lease = Object.freeze({ explicitSyntheticLaunchExclusion: true }); const termination = Object.freeze({ explicitSyntheticOriginalTermination: true });
  const effect = Object.freeze({ explicitSyntheticNativeEffect: true }); const drained = Object.freeze({ explicitSyntheticDrained: true });
  const snapshot = Object.freeze({ sourceSha256: "b".repeat(64) }); const lifecycle = Object.freeze({ explicitSyntheticClosedLifecycle: true }); const savedPlan = Object.freeze({ explicitSyntheticSavedPlan: true });
  let journal: GeneratedSchematicRelevanceDisplayJournal | null = null; let released = false; let closed = false; let binding: object | null = null;
  let captureAttempted = false, captureClosed = false, parent: object | null = null;
  const packets = Object.fromEntries((["preflight", "modify", "observe", "save"] as const).map(stage => [stage, Object.freeze(generatedSchematicRelevanceDisplayStageResultSchema.parse({
    schema: "easyeda-pro-control.generated-schematic-relevance-display-stage.v1", stage, ok: true,
    dispatchAttempted: stage === "modify" || stage === "save", originalPromiseSettled: stage === "modify" || stage === "save",
    modifyAttempted: stage !== "preflight", modifyAcknowledged: stage !== "preflight", saveAttempted: stage === "save", saveAcknowledged: stage === "save", savePromiseSettled: stage === "save",
    source: "explicit inert original source", windowTabId: "synthetic-window", originalContextIntact: true, connectivityVerified: false, sourceVersionAliased: false,
    workerCompletionVerified: false, structureCompletionVerified: false, persistenceVerified: false, inverseAvailable: false,
  }))]));
  const journalModule = await loadSyntheticRegistryModule(new URL("../../src/generated-schematic-relevance-display-journal.ts", import.meta.url), (name, actual): unknown => {
    if (name === "./generated-schematic-relevance-display-source.ts") { return { ...actual, requireOriginalGeneratedSchematicRelevanceDisplayNativeArguments: (value: unknown, checkpoint: unknown): void => { assert.equal(value, args); assert.equal(checkpoint, prepared); } }; }
    return actual;
  });
  const Journal = journalModule["GeneratedSchematicRelevanceDisplayJournal"]; assert.ok(typeof Journal === "function"); const JournalConstructor = Journal; let lost = false;
  const dependencies: GeneratedFixtureJournalPublicationDependencies = { updateJournal: async operation => {
    await updateOperation(operation); const rows: unknown = operation["records"]; const last: unknown = Array.isArray(rows) ? rows.at(-1) : undefined;
    if (mode === "allocation-intent-lost-ack" && !lost && last !== null && typeof last === "object" && "kind" in last && last.kind === "allocation-intent") { lost = true; throw failure; }
    return String(operation["journalPath"]);
  } };
  function JournalBoundary(value: unknown, checkpoint: unknown): GeneratedSchematicRelevanceDisplayJournal {
    assert.equal(value, args); assert.equal(checkpoint, prepared);
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Actual maintained journal constructor and private registry; only its original argument assertion seam is inert.
    journal = Reflect.construct(JournalConstructor, [args, prepared, dependencies]) as GeneratedSchematicRelevanceDisplayJournal; return journal;
  }
  const owner = Object.freeze({
    status: (): object => ({ helperPid: 123, binding, released, helperClosed: released, launchConsumed: binding !== null, noProcessCleanupAvailable: false }),
    startSchematicRelevanceDisplayWriteGeneration: (): Promise<void> => { counters.launches += 1; calls.push("launch"); binding = Object.freeze({ originalSyntheticBinding: true }); return Promise.resolve(); },
    observeFootprintMainConstruction: (): Promise<object> => { calls.push("main"); return Promise.resolve({ originalSyntheticMain: true }); },
    browserObservation: (): Promise<object> => Promise.resolve({ schema: "easyeda-pro-control.pcb-diagnostic-browser-observation.v1", targets: [{ targetId: "original-page", type: "page", url: "https://client/editor?cll=info", attached: false }] }),
    inspectFrames: (): Promise<object> => Promise.resolve({ schema: "easyeda-pro-control.pcb-diagnostic-frame-inventory.v1", targetId: "original-page", frames: [{ id: "original-frame", loaderId: "original-loader", url: "https://client/editor?cll=info", securityOrigin: "https://client" }] }),
    inspectScript: (): Promise<void> => { calls.push("ui-source"); return Promise.resolve(); },
    openGeneratedSchematicDisplay: (): Promise<object> => { calls.push("open"); return Promise.resolve({ outcome: "opened-ready" }); },
    executeSchematicDisplayStage: (stage: string): Promise<unknown> => { calls.push(stage); return Promise.resolve(stage === "capture" ? { captured: true } : packets[stage]); },
    requireSchematicRelevanceDisplaySaveMainReady: (): void => { calls.push("prospective-main-ready"); },
    prepareSchematicRelevanceDisplaySaveGeneration: (): Promise<void> => { calls.push("prepare-save"); return Promise.resolve(); },
    generateSchematicRelevanceDisplaySave: (): Promise<void> => { counters.saves += 1; calls.push("generate-save"); return Promise.resolve(); },
    waitSchematicRelevanceDisplaySave: (): Promise<unknown> => Promise.resolve(packets["save"]),
    observeApplicationWindow: (): Promise<string> => Promise.resolve("123"),
    requestNormalClose: (): Promise<void> => { calls.push("normal-close"); closed = true; return Promise.resolve(); },
    observeTermination: (): Promise<boolean> => { calls.push("termination"); return Promise.resolve(closed); },
    releaseClosed: (): Promise<void> => { assert.equal(closed, true); counters.releases += 1; released = true; calls.push("release-writer"); return Promise.resolve(); },
    releaseUnlaunched: (): Promise<void> => { counters.releases += 1; released = true; return Promise.resolve(); },
    releaseNoProcess: (): Promise<void> => { counters.releases += 1; released = true; return Promise.resolve(); },
    abortSchematicDisplayWrite: (): Promise<void> => { counters.aborts += 1; closed = true; calls.push("abort-writer"); return Promise.resolve(); },
  });
  const composition = Object.freeze({
    continueOriginalRun: (): Promise<void> => { calls.push("run"); return mode === "modify-failure" ? Promise.reject(failure) : Promise.resolve(); },
    waitOriginalModification: (): Promise<unknown> => Promise.resolve(packets["modify"]), observeAfterModification: (): Promise<unknown> => Promise.resolve(packets["observe"]),
    armSaveClock: (value: unknown): Promise<void> => { assert.equal(value, effect); calls.push("clock"); return Promise.resolve(); },
    prepareSaveMain: (value: unknown): Promise<void> => { assert.equal(value, effect); calls.push("prepare-save-main"); return Promise.resolve(); },
    observeOriginalSave: (): Promise<void> => { calls.push("save-observer"); return Promise.resolve(); },
    serviceSaveLocalCalls: (): Promise<void> => { calls.push("local-observer"); return Promise.resolve(); },
    drainOriginalSave: (): Promise<void> => { calls.push("drain-observer"); return Promise.resolve(); }, requireOriginalSaveDrained: (): object => drained,
  });
  function Group(): object { return {
    armBeforeNavigation: (): void => { calls.push("arm-before-navigation"); }, waitForStartupObservations: (): Promise<void> => Promise.resolve(), observeAccessors: (): Promise<void> => Promise.resolve(),
    prepareModification: (): Promise<void> => Promise.resolve(), generateModificationEntry: (): Promise<void> => { counters.modifications += 1; return Promise.resolve(); },
    observeOriginalRunPrefix: (): Promise<void> => Promise.resolve(), settleOriginalCallsAfterExit: (): Promise<void> => { calls.push("settle-group"); return Promise.resolve(); }, cancel: (): void => { calls.push("cancel-group"); }, status: (): object => ({ explicitSyntheticGroup: true }),
  }; }
  function Capture(): object { return {
    capture: (): Promise<object> => { captureAttempted = true; calls.push("capture-closed"); if (mode === "capture-poison") { return Promise.reject(failure); } captureClosed = true; return Promise.resolve(snapshot); },
    settleRelease: (): Promise<void> => mode === "capture-poison" ? Promise.reject(failure) : Promise.resolve(), isReleaseAcknowledged: (): boolean => captureClosed,
    status: (): object => ({ attempted: captureAttempted }),
  }; }
  class Reader {
    #settled = false; #cleaned = false; readonly #result = Object.freeze({ schema: "private.current-schematic-relevance-saved-readback-workflow-result.v1", operationId, acceptance: Object.freeze({ explicitSyntheticAcceptance: true }) });
    public constructor(opts: unknown, planValue: unknown, parentValue: unknown) { assert.equal(opts, options); assert.equal(planValue, savedPlan); assert.equal(parentValue, parent); }
    public async execute(): Promise<object> {
      calls.push("reader"); assert.ok(journal !== null); await journal.append("reopen-intent", { separateOriginalReader: true });
      if (mode === "reader-failure") { this.#settled = true; throw failure; }
      for (const kind of ["reopen-result", "reopened-effect-intent", "reopened-effect-result", "reopen-close-intent", "reopen-close-result", "reopen-exit-intent", "reopen-exit-result", "reopened-sql-intent", "reopened-sql-result"] as const) { await journal.append(kind, { explicitSyntheticReaderStage: true }); }
      this.#settled = true; this.#cleaned = true; return this.#result;
    }
    public requireOriginalResult(value: unknown): object { assert.equal(value, this.#result); assert.equal(this.#settled && this.#cleaned, true); return this.#result; }
    public abort(): Promise<void> { counters.readerAborts += 1; this.#cleaned = true; return Promise.resolve(); }
    public settleCleanup(): Promise<void> { assert.equal(this.#cleaned, true); return Promise.resolve(); }
    public cleanupStatus(): object { return { allocation: mode === "reader-failure" ? "no-resource" : "released", nativeResourcesRetained: false, abortAttempted: counters.readerAborts > 0,
      originalTerminationVerified: mode !== "reader-failure", helperReleaseVerified: mode !== "reader-failure", captureReleasePending: false, originalCallsPending: !this.#settled, publicationPending: false }; }
    public requireOriginalResourceClosure(): object { assert.equal(this.#settled && this.#cleaned, true); return { generation: mode === "reader-failure" ? { outcome: "no-resource-allocated", helperAllocated: false, rootCreated: false, exitClaimed: false } :
      { outcome: "root-exited", helperAllocated: true, helperReleased: true, rootCreated: true, originalRootExited: true, originalJobEmpty: true }, captureStarted: mode !== "reader-failure" }; }
    public inspect(): object { return this.cleanupStatus(); }
  }
  const workflowModule = await loadSyntheticRegistryModule(new URL("../../src/current-schematic-relevance-display-write-workflow.ts", import.meta.url), (name, actual): unknown => {
    if (name === "./current-pcb-string-clock-reply.ts") { return { ...actual, captureCurrentPcbStringClockReply: (value: unknown): void => { assert.equal(value, options); } }; }
    if (name === "./current-schematic-relevance-display-write-plan.ts") { return { ...actual, requireOriginalCurrentSchematicRelevanceDisplayWritePlan: (value: unknown): object => { assert.equal(value, plan); return original; } }; }
    if (name === "./generated-schematic-relevance-display-journal.ts") { return { ...actual, GeneratedSchematicRelevanceDisplayJournal: JournalBoundary }; }
    if (name === "./current-schematic-relevance-display-write-admission.ts") { return { ...actual, assertNoUnresolvedCurrentSchematicRelevanceDisplayWrites: (): Promise<void> => { calls.push("global-preflight"); return mode === "global-blocker" ? Promise.reject(failure) : Promise.resolve(); } }; }
    if (name === "./current-pcb-diagnostic-lifecycle-journal.ts") { return { ...actual,
      acquireCurrentPcbDiagnosticLaunchExclusion: (): object => { calls.push("lease"); return lease; }, assertCurrentPcbDiagnosticLaunchExclusion: (value: unknown): void => { assert.equal(value, lease); assert.equal(counters.leaseReleased, false); }, releaseCurrentPcbDiagnosticLaunchExclusion: (value: unknown): void => { assert.equal(value, lease); assert.equal(counters.leaseReleased, false); counters.leaseReleased = true; } }; }
    if (name === "./managed-schematic-relevance-fixture-open-checkpoint.ts") { return { ...actual, verifyGeneratedSchematicRelevanceFixtureOpenCheckpoint: (value: unknown): Promise<void> => { assert.equal(value, prepared); return Promise.resolve(); } }; }
    if (name === "./current-schematic-relevance-display-write-owner.ts") { return { ...actual,
      startCurrentSchematicRelevanceDisplayWriteOwner: (): Promise<object> => { calls.push("factory"); return Promise.resolve(owner); },
      assertOriginalCurrentSchematicRelevanceDisplayWriteOwner: (value: unknown): void => { assert.equal(value, owner); }, originalCurrentSchematicRelevanceDisplayWriteTarget: (value: unknown): object => { assert.equal(value, owner); return prepared; },
      originalCurrentSchematicRelevanceDisplayWriteTermination: (value: unknown): object => { assert.equal(value, owner); assert.equal(closed, true); return termination; },
      currentSchematicRelevanceDisplayWriteAllocationOutcome: (): object => ({ state: calls.includes("factory") ? "retained" : "not-attempted", owner: calls.includes("factory") ? owner : null }),
      requireOriginalSchematicRelevanceDisplayStage: (_owner: unknown, _args: unknown, packet: unknown, stage: string): unknown => { assert.equal(packet, packets[stage]); return packet; },
    }; }
    if (name === "./current-schematic-relevance-display-write-observers.ts") { return { ...actual, CurrentSchematicRelevanceDisplayWriteObservers: Group,
      requireCurrentSchematicRelevanceDisplayWriteCompositionSource: (): void => { calls.push("composition-source"); }, requireOriginalCurrentSchematicRelevanceDisplayWriteComposition: (): object => composition }; }
    if (name === "./generated-schematic-relevance-display-effect.ts") { return { ...actual, qualifyOriginalGeneratedSchematicRelevanceDisplayEffect: (): object => effect, requireOriginalGeneratedSchematicRelevanceDisplayEffect: (value: unknown): object => { assert.equal(value, effect); return effect; } }; }
    if (name === "./current-pcb-diagnostic-owner.ts") { return { ...actual, requireOriginalCurrentSchematicRelevanceDisplaySaveDrained: (value: unknown): void => { assert.equal(value, drained); } }; }
    if (name === "./generated-schematic-relevance-display-closed-snapshot.ts") { return { ...actual, GeneratedSchematicRelevanceDisplayClosedCapture: Capture,
      requireOriginalGeneratedSchematicRelevanceDisplayClosedSnapshot: (value: unknown): object => { assert.equal(value, snapshot); assert.equal(captureClosed, true); return { inventory: { logicalSha256: "d".repeat(64) }, rawHistory: { explicitSyntheticRawHistory: true } }; } }; }
    if (name === "./generated-schematic-relevance-closed-lifecycle.ts") { return { ...actual, completeOriginalGeneratedSchematicRelevanceClosedLifecycle: (): Promise<object> => { assert.equal(captureClosed, true); assert.equal(closed, true); return Promise.resolve(lifecycle); } }; }
    if (name === "./generated-schematic-relevance-saved-readback-plan.ts") { return { ...actual, prepareGeneratedSchematicRelevanceSavedReadbackPlan: (value: unknown): Promise<object> => { assert.equal(value, lifecycle); assert.equal(released, true); return Promise.resolve(savedPlan); } }; }
    if (name === "./current-schematic-relevance-saved-readback-parent.ts") { return { ...actual, prepareOriginalCurrentSchematicRelevanceSavedReadbackParent: (value: unknown, readPlan: unknown): object => { assert.equal(value, journal); assert.equal(readPlan, savedPlan); parent = Object.freeze({ explicitSyntheticParent: true }); return parent; } }; }
    if (name === "./current-schematic-relevance-saved-readback-workflow.ts") { return { ...actual, CurrentSchematicRelevanceSavedReadbackWorkflow: Reader }; }
    return actual;
  });
  const Constructor = workflowModule["CurrentSchematicRelevanceDisplayWriteWorkflow"], requireFailure = workflowModule["requireOriginalCurrentSchematicRelevanceDisplayWriteFailureClosure"]; assert.ok(typeof Constructor === "function" && typeof requireFailure === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Maintained private-field workflow, real journal/FS publication, explicit inert native/receipt seams above only.
  const workflow = Reflect.construct(Constructor, [options, plan]) as CurrentSchematicRelevanceDisplayWriteWorkflow;
  return { workflow, calls, counters, failure, journal: (): GeneratedSchematicRelevanceDisplayJournal => { assert.ok(journal !== null); return journal; }, requireFailure: (token: unknown): unknown => Reflect.apply(requireFailure, undefined, [token, plan, journal]) };
}
