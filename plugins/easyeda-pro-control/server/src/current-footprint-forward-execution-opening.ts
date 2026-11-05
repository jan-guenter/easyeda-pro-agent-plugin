/** Actual managed same-writer input provider, deliberately unmounted. It
 * composes original native opening/source custody, never an ExecutionNative
 * placeholder. Main dispatch, clocks, complete budgets and saved providers
 * must exist before this owner can reach any writer coordinator. */
/* oxlint-disable import/max-dependencies -- The provider joins existing managed checkpoint, native birth, opening, source preparation and cleanup implementations rather than duplicating their authority. */
import { types } from "node:util";
import { z } from "zod";
import { operationPath } from "./artifacts.ts";
import { canonicalJson, sha256Json } from "./core.ts";
import { prepareCurrentDisposableOpenCheckpoint, verifyCurrentDisposableOpenCheckpoint,
  verifyHistoricalCurrentDisposableOpenCheckpoint } from "./current-disposable-open-checkpoint.ts";
import type { CurrentDisposableOpenCheckpoint } from "./current-disposable-open-checkpoint.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import { prepareCurrentFootprintCopyOwned } from "./current-footprint-copy-preparation-runtime.ts";
import { prepareCurrentFootprintSourcePlan } from "./current-footprint-source-plan.ts";
import { CurrentFootprintCopyStartupOpening } from "./current-pcb-209-worker-startup-opening.ts";
import type { CurrentFootprintCopyStartupOpeningResult } from "./current-pcb-209-worker-startup-opening.ts";
import { CURRENT_PCB_209_OPENING_SCRIPTS } from "./current-pcb-209-opening-profile.ts";
import { acquireCurrentPcbDiagnosticLaunchExclusion, assertCurrentPcbDiagnosticLaunchExclusion,
  assertNoUnresolvedCurrentPcbDiagnosticLaunches, releaseCurrentPcbDiagnosticLaunchExclusion } from "./current-pcb-diagnostic-lifecycle-journal.ts";
import type { CurrentPcbDiagnosticLifecycleOptions } from "./current-pcb-diagnostic-lifecycle.ts";
import { verifyCurrentPcb209DiagnosticInstallation } from "./current-pcb-diagnostic-installation.ts";
import type { CurrentPcbDiagnosticInstallationOptions } from "./current-pcb-diagnostic-installation.ts";
import { assertOriginalCurrentFootprintForwardExecutionNativeOwner, currentFootprintForwardExecutionBirthAllocationOutcome,
  currentFootprintForwardExecutionBirthFailureDiagnostics, startCurrentFootprintForwardExecutionNativeOwner } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentFootprintCombinedAbortReservation, CurrentFootprintForwardExecutionNativeOwner } from "./current-pcb-diagnostic-owner.ts";
import { assertNoUnresolvedOrdinaryLaunches } from "./ordinary-launch.ts";
import { loadRuntimeMachineProfile } from "./machine-profile.ts";
import type { MachineProfile } from "./machine-profile.ts";
import { readExactSqlInventory, readerCompletion } from "./sqlite-inventory.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE } from "./current-footprint-forward-execution-contract.ts";
import { CURRENT_FOOTPRINT_FORWARD_EXECUTION_OPENING_BUDGET, currentFootprintForwardExecutionOpeningRequestSchema, currentFootprintForwardExecutionOpeningResultSchema } from "./current-footprint-forward-execution-opening-contract.ts";
import type { CURRENT_FOOTPRINT_FORWARD_EXECUTION_OPENING_NORMAL_STAGES, CurrentFootprintForwardExecutionOpeningRequest as Request,
  CurrentFootprintForwardExecutionOpeningResult as Result } from "./current-footprint-forward-execution-opening-contract.ts";
import { CurrentFootprintForwardExecutionOpeningJournal } from "./current-footprint-forward-execution-opening-journal.ts";
import { captureCurrentFootprintForwardExecutionPrototypes, captureCurrentFootprintForwardExecutionReceiver,
  requireCurrentFootprintForwardExecutionPrototypes } from "./current-footprint-forward-execution-opening-identity.ts";

const token = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$(?![\s\S])/u);
const openingPrototypes = captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintCopyStartupOpening.prototype);
const journalPrototypes = captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintForwardExecutionOpeningJournal.prototype);
const openingMethods = ["open", "requireOriginal", "proveCurrentAssignments", "observeFootprintState", "observeFootprintSource", "requireFootprintSource", "releaseAfterTermination", "assertOriginalMethodsCurrent"] as const;
const nativeMethods = ["launch", "status", "observeFootprintMainConstruction", "browserObservation", "inspectFrames", "inspectScript", "handoffWorkerStartup",
  "observeFootprintCopyUi", "requireFootprintCopyUi", "assertFootprintForwardExecutionSourceCapacity", "sealFootprintForwardExecutionSource", "originalFootprintForwardExecutionSource", "requestNormalClose",
  "observeApplicationWindow",
  "observeTermination", "releaseClosed", "releaseUnlaunched", "releaseNoProcess", "reserveFootprintCombinedAbort", "dispatchFootprintCombinedAbort", "observeFootprintForwardExecutionRelease"] as const;
function need(condition: boolean, code: string): asserts condition { if (!condition) { throw new Error(`FORWARD_EXECUTION_OPENING_${code}`); } }
type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
type Stage = Exclude<typeof CURRENT_FOOTPRINT_FORWARD_EXECUTION_OPENING_NORMAL_STAGES[number], "prepare" | "allocation" | "launch" | "seal">;
type Lease = ReturnType<typeof acquireCurrentPcbDiagnosticLaunchExclusion>;
interface Prepared {
  readonly checkpoint: CurrentDisposableOpenCheckpoint;
  readonly before: Inventory;
  readonly completion: ReturnType<typeof readerCompletion>;
  readonly sealedTarget: z.infer<typeof currentDisposableOpenSealedTargetSchema>;
  readonly text: string;
  readonly runtime: MachineProfile["runtime"];
}
/** Reject options accessors/proxies before any guard, checkpoint or allocation.
 * The actual installation verifier retains all machine/path/hash requirements. */
function options(input: CurrentPcbDiagnosticLifecycleOptions): CurrentPcbDiagnosticLifecycleOptions {
  need(input !== null && typeof input === "object" && !types.isProxy(input) && Object.isFrozen(input) && Object.getPrototypeOf(input) === Object.prototype, "OPTIONS");
  const keys = new Set(["pluginRoot", "assetsRoot", "powershellSha256", "powershellBytes", "wslDistribution", "assertAllowed", "assertLocalAllowed", "assertOtherLaunchesSettled"]);
  for (const key of Reflect.ownKeys(input)) {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    need(typeof key === "string" && keys.has(key) && descriptor !== undefined && Object.hasOwn(descriptor, "value"), "OPTIONS_OWN_DATA");
  }
  need(typeof input.assertAllowed === "function" && typeof input.assertLocalAllowed === "function" && typeof input.assertOtherLaunchesSettled === "function", "OPTIONS_GUARDS");
  return input;
}
/** One original operation retains its helper, constructor capture and every
 * consumed native stage. Failed normal work permits only original cleanup and
 * publication settlement. No public request or caller function table mounts it. */
export class CurrentFootprintForwardExecutionOpeningProvider {
  readonly #options: CurrentPcbDiagnosticLifecycleOptions;
  readonly #birthOptions: CurrentPcbDiagnosticInstallationOptions;
  readonly #guards: readonly unknown[];
  #lease: Lease | null = null;
  #request: Request | null = null;
  #journal: CurrentFootprintForwardExecutionOpeningJournal | null = null;
  #journalCurrent: (() => void) | null = null;
  #prepared: Prepared | null = null;
  #owner: CurrentFootprintForwardExecutionNativeOwner | null = null;
  #ownerMethods: ReadonlyMap<string, unknown> | null = null;
  #opening: CurrentFootprintCopyStartupOpening | null = null;
  #openingCurrent: (() => void) | null = null;
  #openingResult: CurrentFootprintCopyStartupOpeningResult | null = null;
  #result: Result | null = null;
  #bindingSha256: string | null = null;
  #stage: "new" | "launched" | "main" | "browser" | "frames" | "ui-source" | "sealed" = "new";
  #busy = false;
  #cleanupBusy = false;
  #failed: unknown = null;
  #factoryInvoked = false;
  #factoryFailure: unknown = null;
  #launchAttempted = false;
  #cleanupKind: "close" | "abort" | null = null;
  #abort: CurrentFootprintCombinedAbortReservation | null = null;
  #terminationOrdinal = 0;
  #terminated = false;
  #releaseAttempted = false;
  #releaseObserved = false;
  #failureRecordAttempted = false;
  #closeDispatched = false;
  #abortDispatched = false;
  #cleanupAcknowledged: "close" | "abort" | null = null;
  #closeHwnd: string | null = null;
  #noProcessRelease = false;
  #noProcessReleasePending: ReturnType<CurrentFootprintForwardExecutionNativeOwner["releaseNoProcess"]> | null = null;
  #openingReleased = false;
  #terminationPending: { ordinal: number; dispatched: boolean; result: boolean | null } | null = null;
  #windowAttempted = false;
  #windowObservation: string | null = null;
  #windowOutcome: "not-attempted" | "pending" | "returned" | "unknown" = "not-attempted";
  #windowPending: Promise<string | null> | null = null;
  #windowFailure: unknown = null;
  #prelaunchRelease: Promise<void> | null = null;
  #prelaunchCleanupKind: "cleanup-no-allocation" | "cleanup-before-launch" | null = null;
  public constructor(input: CurrentPcbDiagnosticLifecycleOptions) {
    this.#options = options(input);
    this.#guards = Object.freeze<readonly unknown[]>([input.assertAllowed, input.assertLocalAllowed, input.assertOtherLaunchesSettled]);
    this.#birthOptions = Object.freeze({ pluginRoot: input.pluginRoot, assetsRoot: input.assetsRoot, powershellSha256: input.powershellSha256,
      powershellBytes: input.powershellBytes, ...(input.wslDistribution === undefined ? {} : { wslDistribution: input.wslDistribution }) });
    Object.freeze(this);
  }
  /** Recheck actual receiver resolution and the same original owners after
   * awaits. Cleanup retains custody without restoring normal eligibility. */
  #current(cleanup = false): void {
    // oxlint-disable-next-line eslint/no-use-before-define -- Snapshot is captured only after the full class prototype has been defined, before any provider instance can be constructed.
    requireCurrentFootprintForwardExecutionPrototypes(providerPrototypes);
    need(Object.getPrototypeOf(this) === CurrentFootprintForwardExecutionOpeningProvider.prototype && Reflect.ownKeys(this).length === 0, "ORIGINAL_PROVIDER");
    need(this.#options.assertAllowed === this.#guards[0] && this.#options.assertLocalAllowed === this.#guards[1] && this.#options.assertOtherLaunchesSettled === this.#guards[2], "ORIGINAL_GUARDS");
    this.#options.assertLocalAllowed();
    if (this.#lease !== null) { assertCurrentPcbDiagnosticLaunchExclusion(this.#lease); }
    if (!cleanup) { need(this.#failed === null && this.#cleanupKind === null && !this.#releaseAttempted, "NORMAL_ENDED"); }
    if (this.#owner !== null) {
      assertOriginalCurrentFootprintForwardExecutionNativeOwner(this.#owner);
      for (const [key, value] of this.#ownerMethods ?? []) { need(Reflect.get(this.#owner, key) === value, "ORIGINAL_RECEIVER_METHOD"); }
    }
    this.#openingCurrent?.();
    this.#journalCurrent?.();
  }
  /** A failed stage permanently ends normal work. Any failure publishing its
   * diagnostic is kept alongside the original error rather than replacing it. */
  async #normal<T>(action: () => Promise<T>): Promise<T> {
    this.#current(); need(!this.#busy && !this.#cleanupBusy, "BUSY"); this.#busy = true;
    try { return await action(); }
    catch (error) {
      this.#failed ??= error;
      if (this.#cleanupKind === null && this.#journal !== null && !this.#failureRecordAttempted && this.#journal.retained().reserved && !this.#journal.retained().publicationPending) {
        this.#failureRecordAttempted = true;
        try { await this.#journal.append("failure", { phase: this.#stage, originalErrorRetained: true, code: "ORIGINAL_STAGE_FAILED" }); }
        catch (publicationError) {
          // oxlint-disable-next-line eslint/preserve-caught-error -- The first original stage error remains the cause; the publication error is separately retained in this aggregate.
          throw new AggregateError([error, publicationError], "FORWARD_EXECUTION_FAILURE_PUBLICATION", { cause: error });
        }
      }
      throw error;
    }
    finally { this.#busy = false; }
  }
  #journalRequired(): CurrentFootprintForwardExecutionOpeningJournal { need(this.#journal !== null, "JOURNAL_REQUIRED"); return this.#journal; }
  #ownerRequired(): CurrentFootprintForwardExecutionNativeOwner { need(this.#owner !== null, "OWNER_REQUIRED"); return this.#owner; }
  /** Consume durable intent before native work and retain actual returned
   * resources before fallible result publication or post-reply reproof. */
  async #stageCall<T>(stage: Stage, evidence: Readonly<Record<string, unknown>>, action: () => Promise<T>, retain: (value: T) => void = (): void => {
      /* This stage returns no newly owned resource requiring separate retention. */
    },
    project: (value: T) => Readonly<Record<string, unknown>> = value => ({ result: value })): Promise<T> {
    const journal = this.#journalRequired();
    await journal.append(`${stage}-intent`, evidence); this.#current();
    const value = await action(); retain(value); this.#current();
    await journal.append(`${stage}-result`, project(value)); this.#current(); return value;
  }
  /** Before navigation verify the live source; afterward recheck only the
   * original managed backup and reader, never manufacture a new baseline. */
  async #preparedCurrent(beforeOpen: boolean): Promise<Prepared> {
    const prepared = this.#prepared, request = this.#request; need(prepared !== null && request !== null, "PREPARATION_REQUIRED");
    this.#current(); need(canonicalJson(prepared.checkpoint) === prepared.text && readerCompletion(prepared.before) === prepared.completion, "PREPARATION_CHANGED");
    await (beforeOpen ? verifyCurrentDisposableOpenCheckpoint(prepared.checkpoint, request.target) : verifyHistoricalCurrentDisposableOpenCheckpoint(prepared.checkpoint, request.target));
    this.#current(); need(this.#prepared === prepared && canonicalJson(prepared.checkpoint) === prepared.text && readerCompletion(prepared.before) === prepared.completion, "PREPARATION_CHANGED");
    return prepared;
  }
  /** Prepare and publish the original whole checkpoint before allocating or
   * launching this actual writer-v2 generation. No navigation occurs here. */
  public launch(input: unknown): Promise<Readonly<Record<string, unknown>>> {
    let selected: Request;
    try { selected = freezeDeep(currentFootprintForwardExecutionOpeningRequestSchema.parse(captureCurrentPcbStringClockReply(input).value)); operationPath(selected.operationId); }
    catch (error) {
      // oxlint-disable-next-line typescript/prefer-promise-reject-errors -- Keep the exact original parser/accessor refusal; no native or managed effect has begun.
      return Promise.reject(error);
    }
    return this.#normal(async () => {
      need(this.#stage === "new" && this.#request === null, "LAUNCH_CONSUMED");
      const request = selected; this.#request = request;
      await this.#options.assertAllowed(); this.#current(); await this.#options.assertOtherLaunchesSettled(); this.#current();
      await assertNoUnresolvedOrdinaryLaunches(); await assertNoUnresolvedCurrentPcbDiagnosticLaunches(); this.#current();
      this.#lease = acquireCurrentPcbDiagnosticLaunchExclusion();
      const journal = new CurrentFootprintForwardExecutionOpeningJournal(request); this.#journal = journal;
      this.#journalCurrent = captureCurrentFootprintForwardExecutionReceiver(journal, journalPrototypes, ["reserve", "append", "settle", "waitForCurrentPublication", "assertCurrent", "retained", "reservationOutcome"]);
      await journal.reserve(); this.#current();
      await journal.append("prepare-intent", { target: request.target }); this.#current();
      const checkpoint = await prepareCurrentDisposableOpenCheckpoint(request.target); this.#current();
      const configured = await loadRuntimeMachineProfile(); this.#current();
      await verifyCurrentDisposableOpenCheckpoint(checkpoint, request.target); this.#current();
      const before = await readExactSqlInventory({ checkpointPath: checkpoint.checkpoint.checkpoint, expectedSha256: checkpoint.checkpoint.checkpointSha256,
        runtime: configured.profile.runtime }), completion = readerCompletion(before); this.#current();
      await verifyCurrentDisposableOpenCheckpoint(checkpoint, request.target); this.#current();
      need(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null && before.checkpointSha256 === checkpoint.checkpoint.checkpointSha256, "COMPLETE_SQL_REQUIRED");
      const sealedTarget = freezeDeep(currentDisposableOpenSealedTargetSchema.parse({ ...request.target, branchUuid: checkpoint.targetEvidence.branchUuid }));
      const prepared = Object.freeze({ checkpoint, before, completion, sealedTarget, text: canonicalJson(checkpoint), runtime: Object.freeze({ ...configured.profile.runtime }) });
      this.#prepared = prepared;
      await journal.append("prepare-result", { checkpoint, beforeSqlSha256: before.logicalSha256, originalSqlReaderCompleted: true }); this.#current();
      const installation = await verifyCurrentPcb209DiagnosticInstallation(this.#birthOptions); this.#current();
      const executable = installation.plan.files[0]; need(executable !== undefined, "EXECUTABLE_REQUIRED");
      await this.#preparedCurrent(true); await journal.append("allocation-intent", { purpose: CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE }); this.#current();
      this.#factoryInvoked = true;
      try { this.#owner = await startCurrentFootprintForwardExecutionNativeOwner(this.#birthOptions); }
      catch (error) {
        this.#factoryFailure = error;
        const outcome = currentFootprintForwardExecutionBirthAllocationOutcome(this.#birthOptions);
        if (outcome.owner !== null) { this.#owner = outcome.owner; }
        throw error;
      }
      const owner = this.#ownerRequired(); assertOriginalCurrentFootprintForwardExecutionNativeOwner(owner);
      this.#ownerMethods = new Map(nativeMethods.map(key => [key, Reflect.get(owner, key)])); this.#current();
      await journal.append("allocation-result", { retained: true, purpose: CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE }); this.#current();
      await this.#preparedCurrent(true); await journal.append("launch-intent", { executableSha256: executable.sha256 }); this.#current();
      this.#launchAttempted = true; let failure: unknown;
      try { await owner.launch({ executable: executable.windowsPath, executableSha256: executable.sha256, confirmDiagnosticLaunch: true }); }
      catch (error) { failure = error; }
      const binding = owner.status().binding;
      if (failure !== undefined) { this.#failed ??= failure; }
      if (binding !== null) {
        try {
          await journal.append("binding", { binding, acknowledged: failure === undefined });
          const entry = journal.retained().records.find(record => record.kind === "binding"); need(entry !== undefined, "BINDING_PUBLICATION_REQUIRED");
          this.#bindingSha256 = sha256Json(entry);
        }
        catch (publicationError) {
          if (failure !== undefined) {
            // oxlint-disable-next-line eslint/preserve-caught-error -- Original native launch remains the cause, and this publication failure remains in the aggregate.
            throw new AggregateError([failure, publicationError], "FORWARD_EXECUTION_BINDING_PUBLICATION", { cause: failure });
          }
          throw publicationError;
        }
      }
      this.#current(true); if (failure !== undefined) {
        // oxlint-disable-next-line typescript/only-throw-error -- Propagate the exact retained native failure after publishing any genuine binding; never replace its identity.
        throw failure;
      }
      need(binding !== null && this.#bindingSha256 !== null, "BINDING_REQUIRED"); this.#stage = "launched";
      return Object.freeze({ operationId: request.operationId, binding, bindingSha256: this.#bindingSha256, executionAuthorized: false, saveAuthorized: false });
    });
  }
  /** Capture the actual new writer's original main runner before any project
   * navigation. This does not issue a Combined or v2 main dispatch capability. */
  public observeMain(): Promise<Readonly<Record<string, unknown>>> {
    return this.#normal(async () => {
      need(this.#stage === "launched", "MAIN_STAGE"); const owner = this.#ownerRequired();
      const result = await this.#stageCall("main", {}, () => owner.observeFootprintMainConstruction()); this.#stage = "main"; return result;
    });
  }
  /** Publish one original browser inventory after main construction. Empty or
   * failed observations never permit another browser selection attempt. */
  public observeBrowser(): Promise<Readonly<Record<string, unknown>>> {
    return this.#normal(async () => {
      need(this.#stage === "main", "BROWSER_STAGE"); const owner = this.#ownerRequired();
      const result = await this.#stageCall("browser", {}, () => owner.browserObservation()); this.#stage = "browser"; return result;
    });
  }
  /** Attach only to the selected member of that retained browser inventory;
   * native/context checks, not the supplied ID, establish original custody. */
  public inspectFrames(targetId: string): Promise<Readonly<Record<string, unknown>>> {
    return this.#normal(async () => {
      need(this.#stage === "browser", "FRAME_STAGE"); const selected = token.parse(targetId); const owner = this.#ownerRequired();
      const result = await this.#stageCall("frames", { targetId: selected }, () => owner.inspectFrames(selected)); this.#stage = "frames"; return result;
    });
  }
  /** Qualify only the fixed pinned UI asset in the original retained frame.
   * No caller source, alternate family or document execution is admitted. */
  public inspectUi(frameId: string): Promise<Readonly<Record<string, unknown>>> {
    return this.#normal(async () => {
      need(this.#stage === "frames", "UI_SOURCE_STAGE"); const selected = token.parse(frameId); const owner = this.#ownerRequired();
      const result = await this.#stageCall("ui-source", { frameId: selected, family: "ui" }, () => owner.inspectScript(selected, CURRENT_PCB_209_OPENING_SCRIPTS.ui));
      this.#stage = "ui-source"; return result;
    });
  }
  /** Capture, read and seal the actual new writer's inputs. The original
   * preparation stays v1/false; this separate result does not qualify clocks,
   * current head/queues, whole budgets, dispatch or persistence. */
  public captureSource(): Promise<Result> {
    return this.#normal(async () => {
      need(this.#stage === "ui-source" && this.#request !== null && this.#bindingSha256 !== null, "SOURCE_STAGE");
      const request = this.#request; const owner = this.#ownerRequired(); const prepared = await this.#preparedCurrent(true);
      const handoff = await this.#stageCall("handoff", {}, () => owner.handoffWorkerStartup(), (): void => undefined,
        value => ({ originalChannelRetained: true, parentSessionId: value.dependency.parentSessionId, parentTargetId: value.dependency.parentTargetId }));
      requireCurrentFootprintForwardExecutionPrototypes(openingPrototypes);
      const opening = new CurrentFootprintCopyStartupOpening(handoff); this.#opening = opening;
      this.#openingCurrent = captureCurrentFootprintForwardExecutionReceiver(opening, openingPrototypes, openingMethods);
      const result = await this.#stageCall("opening", { target: prepared.sealedTarget }, () => opening.open(prepared.sealedTarget, async () => {
        await this.#preparedCurrent(true); await this.#journalRequired().assertCurrent(); this.#current();
      }), value => { this.#openingResult = value; });
      const assignments = await this.#stageCall("assignments", {}, () => opening.proveCurrentAssignments(result));
      await this.#stageCall("ui", {}, async () => { const packet = await owner.observeFootprintCopyUi(opening, result); this.#current(); await owner.requireFootprintCopyUi(packet); return packet; });
      const state = await this.#stageCall("state", {}, () => opening.observeFootprintState(result, assignments));
      await this.#preparedCurrent(false);
      owner.assertFootprintForwardExecutionSourceCapacity(); this.#current();
      const plan = await prepareCurrentFootprintSourcePlan(prepared.before, { projectUuid: prepared.sealedTarget.projectUuid, branchUuid: prepared.sealedTarget.branchUuid, footprintUuid: request.footprintUuid });
      this.#current(); need(plan.maximumTicket === state.maximumTicket, "SOURCE_BASELINE_CHANGED");
      const source = await this.#stageCall("source", { sourcePlanSha256: sha256Json(plan) }, () => opening.observeFootprintSource(result, assignments, state, plan));
      const preparation = await this.#stageCall("preparation", {}, () => prepareCurrentFootprintCopyOwned(Object.freeze({ opening, result, assignments, state, sourcePlan: plan, source, before: prepared.before })));
      await this.#journalRequired().append("seal-intent", { sourcePacketSha256: sha256Json(source), preparationSha256: sha256Json(preparation) }); this.#current();
      await owner.sealFootprintForwardExecutionSource(request.operationId, opening, result, preparation, prepared.checkpoint.checkpoint, prepared.runtime); this.#current();
      const original = owner.originalFootprintForwardExecutionSource();
      need(original.opening === opening && original.result === result && original.preparation === preparation && original.owned.before === prepared.before, "ORIGINAL_SEALED_INPUTS");
      const observed = currentFootprintForwardExecutionOpeningResultSchema.parse({ schema: "easyeda-pro-control.footprint-forward-execution-source-input.v2",
        purpose: CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE, operationId: request.operationId, bindingSha256: this.#bindingSha256,
        checkpointSha256: prepared.before.checkpointSha256, beforeSqlSha256: prepared.before.logicalSha256, sourcePlanSha256: sha256Json(plan),
        sourcePacketSha256: sha256Json(source), preparationSha256: sha256Json(preparation), originalOpeningRetained: true, sameWriterSourceSealed: true,
        wholeWriterReserved: false, routeAndClocksQualified: false, executionReady: false, executionAuthorized: false, saveAuthorized: false });
      this.#result = freezeDeep(observed);
      await this.#journalRequired().append("seal-result", { result: observed }); this.#current(); this.#stage = "sealed"; return this.#result;
    });
  }
  /** Settle original retained publication bytes and acknowledged cleanup facts
   * only. This sends no native command and never revives failed normal work. */
  public async settleRecords(): Promise<void> {
    this.#current(true); need(!this.#cleanupBusy, "SETTLEMENT_BUSY");
    const journal = this.#journalRequired(); const originalOwner = this.#owner; const originalBinding = originalOwner?.status().binding ?? null;
    await journal.settle(); this.#current(true);
    need(this.#owner === originalOwner && (originalOwner === null || originalOwner.status().binding === originalBinding), "SETTLEMENT_ORIGINAL_BINDING");
    const publishedBinding = journal.retained().records.find(record => record.kind === "binding");
    if (publishedBinding !== undefined && originalBinding !== null) {
      need(canonicalJson(publishedBinding.evidence["binding"]) === canonicalJson(originalBinding), "SETTLEMENT_BINDING_RECORD");
      const digest = sha256Json(publishedBinding);
      need(this.#bindingSha256 === null || this.#bindingSha256 === digest, "SETTLEMENT_BINDING_CHANGED");
      this.#bindingSha256 = digest;
    }
    if (this.#cleanupAcknowledged !== null) {
      const kind = this.#cleanupAcknowledged === "close" ? "close-result" : "abort-result";
      if (!journal.retained().records.some(record => record.kind === kind)) {
        await journal.append(kind, this.#cleanupAcknowledged === "close" ? { requested: true } : { requested: true, originalJobOnly: true });
      }
    }
  }
  /** Consume one normal-close request; the native owner independently proves
   * its HWND/root relation. A publication-only retry cannot resend native close. */
  public async close(hwnd: string): Promise<void> {
    this.#current(true); need(!this.#busy && !this.#cleanupBusy && !this.#closeDispatched && !this.#noProcessRelease && this.#launchAttempted, "CLOSE_UNAVAILABLE");
    const selected = z.string().regex(/^[1-9]\d{0,18}$(?![\s\S])/u).parse(hwnd);
    need(this.#cleanupKind === null || this.#cleanupKind === "close" && this.#closeHwnd === selected, "ORIGINAL_CLOSE_REQUIRED");
    this.#cleanupKind = "close"; this.#closeHwnd = selected; this.#cleanupBusy = true;
    try {
      const journal = this.#journalRequired(); await journal.settle();
      if (!journal.retained().records.some(record => record.kind === "close-intent")) { await journal.append("close-intent", { hwnd: selected }); }
      this.#closeDispatched = true; await this.#ownerRequired().requestNormalClose(selected); this.#cleanupAcknowledged = "close";
      await this.#journalRequired().append("close-result", { requested: true });
    }
    finally { this.#cleanupBusy = false; }
  }
  /** Reserve original Job cutoff before journal awaits, including during a
   * pending capture. Only the exact reservation may dispatch once afterward. */
  public async abort(confirmAbortOriginalJob: true): Promise<void> {
    this.#current(true);
    // oxlint-disable-next-line typescript/no-unnecessary-boolean-literal-compare -- Runtime cleanup requires this exact confirmation before cutoff/reservation.
    need(confirmAbortOriginalJob === true && !this.#cleanupBusy && !this.#abortDispatched && !this.#noProcessRelease && this.#launchAttempted && !this.#terminated, "ABORT_UNAVAILABLE");
    const owner = this.#ownerRequired();
    this.#abort ??= owner.reserveFootprintCombinedAbort(); this.#cleanupKind = "abort"; this.#failed ??= new Error("FORWARD_EXECUTION_OPENING_ABORTED"); this.#cleanupBusy = true;
    try {
      const journal = this.#journalRequired(); await journal.waitForCurrentPublication(); this.#current(true); await journal.settle();
      if (!journal.retained().records.some(record => record.kind === "abort-intent")) { await journal.append("abort-intent", {}); }
      this.#abortDispatched = true; await owner.dispatchFootprintCombinedAbort(this.#abort, true); this.#cleanupAcknowledged = "abort";
      await this.#journalRequired().append("abort-result", { requested: true, originalJobOnly: true });
    }
    finally { this.#cleanupBusy = false; }
  }
  /** Repeat only a completed pending observation. A lost reply retains its
   * original poll; an acknowledged result may settle without another send. */
  public async observeTermination(): Promise<boolean> {
    this.#current(true); need(this.#cleanupKind !== null && !this.#cleanupBusy && (!this.#terminated || this.#terminationPending !== null), "TERMINATION_UNAVAILABLE"); this.#cleanupBusy = true;
    try {
      if (this.#terminationPending === null) {
        need(this.#terminationOrdinal < CURRENT_FOOTPRINT_FORWARD_EXECUTION_OPENING_BUDGET.terminationObservations, "TERMINATION_BUDGET");
        this.#terminationOrdinal += 1;
        this.#terminationPending = { ordinal: this.#terminationOrdinal, dispatched: false, result: null };
      }
      const pending = this.#terminationPending; const evidence = { ordinal: pending.ordinal }; const journal = this.#journalRequired();
      await journal.settle();
      if (!journal.retained().records.some(record => record.kind === "termination-intent" && record.evidence["ordinal"] === pending.ordinal)) { await journal.append("termination-intent", evidence); }
      if (pending.result === null) {
        need(!pending.dispatched, "ORIGINAL_TERMINATION_PENDING"); pending.dispatched = true;
        pending.result = await this.#ownerRequired().observeTermination(); this.#terminated = pending.result;
      }
      if (!journal.retained().records.some(record => record.kind === "termination-result" && record.evidence["ordinal"] === pending.ordinal)) {
        await journal.append("termination-result", { ...evidence, terminated: pending.result });
      }
      const terminated = pending.result; this.#terminationPending = null; return terminated;
    } finally { this.#cleanupBusy = false; }
  }
  /** Release original construction resources only after actual root/empty-Job
   * termination, then issue the helper release once and retain its outcome. */
  public async release(): Promise<void> {
    this.#current(true); need(this.#terminated && !this.#cleanupBusy && !this.#releaseAttempted, "RELEASE_UNAVAILABLE"); this.#cleanupBusy = true;
    try {
      const journal = this.#journalRequired(); await journal.settle();
      if (!journal.retained().records.some(record => record.kind === "release-intent")) { await journal.append("release-intent", {}); }
      if (this.#opening !== null && !this.#openingReleased) { await this.#opening.releaseAfterTermination(); this.#openingReleased = true; }
      this.#releaseAttempted = true;
      await this.#ownerRequired().releaseClosed(); this.#releaseObserved = true;
      await this.#journalRequired().append("release-result", { released: true }); this.#releaseLease();
    } finally { this.#cleanupBusy = false; }
  }
  /** Inspect the retained original release and settle its record. Pending or
   * failed helper closure never becomes permission to send release again. */
  public async observeRelease(): Promise<"pending" | "released"> {
    this.#current(true); need(this.#releaseAttempted, "RELEASE_NOT_ATTEMPTED");
    if (!this.#releaseObserved) { this.#releaseObserved = this.#ownerRequired().observeFootprintForwardExecutionRelease() === "released"; }
    if (!this.#releaseObserved) { return "pending"; }
    await this.#journalRequired().settle();
    const kind = this.#noProcessRelease ? "cleanup-no-process" : "release-result";
    if (this.#journalRequired().retained().records.at(-1)?.kind !== kind) {
      await this.#journalRequired().append(kind, this.#noProcessRelease ? { helperReleased: true, noProcessProved: true } : { released: true });
    }
    this.#releaseLease(); return "released";
  }
  /** The original native owner must hold its own no-process proof. A missing
   * binding or failed launch acknowledgment alone never permits this branch. */
  public async cleanupNoProcess(): Promise<void> {
    this.#current(true); const owner = this.#ownerRequired();
    need(this.#launchAttempted && this.#cleanupKind === null && !this.#cleanupBusy, "NO_PROCESS_UNAVAILABLE");
    if (this.#releaseAttempted) {
      need(this.#noProcessRelease && this.#noProcessReleasePending !== null, "NO_PROCESS_UNAVAILABLE");
      this.#cleanupBusy = true;
      try {
        await this.#noProcessReleasePending; this.#releaseObserved = true;
        need(await this.observeRelease() === "released", "NO_PROCESS_ORIGINAL_RELEASE_PENDING");
      } finally { this.#cleanupBusy = false; }
      return;
    }
    need(owner.status().noProcessCleanupAvailable, "NO_PROCESS_UNAVAILABLE");
    this.#cleanupBusy = true; this.#noProcessRelease = true;
    try {
      const journal = this.#journalRequired(); await journal.settle();
      if (!journal.retained().records.some(record => record.kind === "no-process-release-intent")) { await journal.append("no-process-release-intent", {}); }
      this.#releaseAttempted = true; this.#noProcessReleasePending = owner.releaseNoProcess();
      await this.#noProcessReleasePending; this.#releaseObserved = true;
      await journal.append("cleanup-no-process", { helperReleased: true, noProcessProved: true }); this.#releaseLease();
    } finally { this.#cleanupBusy = false; }
  }
  /** End normal work before prelaunch cleanup and use only the original
   * journal/allocation outcomes. A pre-create refusal releases this provider's
   * own exclusion without touching an existing journal. Unknown create/spawn
   * or EOF remains retained until original settlement, never adopted. */
  public async cleanupBeforeLaunch(): Promise<void> {
    this.#current(true); need(!this.#busy && !this.#launchAttempted && !this.#cleanupBusy, "BEFORE_LAUNCH_ONLY");
    this.#failed ??= new Error("FORWARD_EXECUTION_OPENING_PRELAUNCH_CLEANUP"); this.#cleanupBusy = true;
    try {
      if (this.#journal === null) {
        need(!this.#factoryInvoked && this.#owner === null && !this.#launchAttempted &&
          currentFootprintForwardExecutionBirthAllocationOutcome(this.#birthOptions).state === "not-attempted", "ORIGINAL_NO_ALLOCATION_REQUIRED");
        this.#releaseLease(); return;
      }
      const journal = this.#journalRequired();
      if (this.#prelaunchCleanupKind !== null) { await this.#publishPrelaunchCleanup(this.#prelaunchCleanupKind); return; }
      const reservation = journal.reservationOutcome();
      if (!this.#factoryInvoked && (reservation === "not-entered" || reservation === "conflict")) {
        this.#releaseLease(); return;
      }
      await journal.settle();
      if (!this.#factoryInvoked) { await this.#publishPrelaunchCleanup("cleanup-no-allocation"); return; }
      const outcome = currentFootprintForwardExecutionBirthAllocationOutcome(this.#birthOptions);
      if (outcome.state === "no-resource") { await this.#publishPrelaunchCleanup("cleanup-no-allocation"); return; }
      if (outcome.state === "closed-before-owner") { await this.#publishPrelaunchCleanup("cleanup-before-launch"); return; }
      const owner = this.#ownerRequired();
      const diagnostics = currentFootprintForwardExecutionBirthFailureDiagnostics(this.#factoryFailure, this.#birthOptions);
      if (diagnostics?.helperClosed !== true || diagnostics.launchInvoked || diagnostics.stdinBytesWritten !== 0) {
        this.#prelaunchRelease ??= owner.releaseUnlaunched(); await this.#prelaunchRelease;
      }
      need(owner.status().helperClosed, "ORIGINAL_HELPER_NOT_CLOSED");
      await this.#publishPrelaunchCleanup("cleanup-before-launch");
    } finally { this.#cleanupBusy = false; }
  }
  /** Retain only an already-proved original cleanup fact across publication
   * failures. Settlement cannot resend native release or append a terminal twice. */
  async #publishPrelaunchCleanup(kind: "cleanup-no-allocation" | "cleanup-before-launch"): Promise<void> {
    need(this.#prelaunchCleanupKind === null || this.#prelaunchCleanupKind === kind, "ORIGINAL_PRELAUNCH_CLEANUP");
    this.#prelaunchCleanupKind = kind;
    const journal = this.#journalRequired();
    const evidence = kind === "cleanup-no-allocation" ? { noAllocationProved: true } : { helperClosed: true, stdinBytesWritten: 0 };
    await journal.settle(); this.#current(true);
    const published = journal.retained().records.find(record => record.kind === kind);
    if (published === undefined) { await journal.append(kind, evidence); }
    else { need(canonicalJson(published.evidence) === canonicalJson(evidence), "ORIGINAL_PRELAUNCH_CLEANUP_RECORD"); }
    this.#current(true); this.#releaseLease();
  }
  #releaseLease(): void { if (this.#lease !== null) { releaseCurrentPcbDiagnosticLaunchExclusion(this.#lease); this.#lease = null; } }
  /** Return only this provider's published original inputs. A result JSON clone
   * cannot retrieve the native owner, opening, SQL reader or preparation. */
  public async requireSourceInput(): Promise<Readonly<{ result: Result; owner: CurrentFootprintForwardExecutionNativeOwner;
    source: ReturnType<CurrentFootprintForwardExecutionNativeOwner["originalFootprintForwardExecutionSource"]> }>> {
    this.#current(); need(this.#stage === "sealed" && this.#result !== null && this.#openingResult !== null, "SOURCE_NOT_PUBLISHED");
    await this.#journalRequired().assertCurrent(); this.#current();
    const owner = this.#ownerRequired(), source = owner.originalFootprintForwardExecutionSource();
    need(source.opening === this.#opening && source.result === this.#openingResult && source.owned.before === this.#prepared?.before, "ORIGINAL_SOURCE_INPUTS");
    return Object.freeze({ result: this.#result, owner, source });
  }
  /** Describe this instance's retained progress without returning native
   * handles, current-source proof or any execution/Save authority. */
  public retained(): Readonly<{ stage: string; failed: boolean; busy: boolean; publicationPending: boolean; result: Result | null; originalOwner: boolean; executionAuthorized: false; saveAuthorized: false }> {
    this.#current(true); return Object.freeze({ stage: this.#stage, failed: this.#failed !== null, busy: this.#busy, publicationPending: this.#journal?.retained().publicationPending ?? false,
      result: this.#result, originalOwner: this.#owner !== null, executionAuthorized: false, saveAuthorized: false });
  }
  /** Local admission tracks original custody even before an owner constructor
   * returns. Only the original factory's observed closure ends allocation. */
  public hasOwnedAllocation(): boolean {
    this.#current(true);
    if (!this.#factoryInvoked) { return false; }
    const outcome = currentFootprintForwardExecutionBirthAllocationOutcome(this.#birthOptions);
    return outcome.state === "retained" ? !outcome.owner.status().helperClosed :
      outcome.state !== "no-resource" && outcome.state !== "not-attempted" && outcome.state !== "closed-before-owner";
  }
  /** A settled helper alone cannot erase an outstanding journal or call. */
  public hasActiveReservation(): boolean {
    this.#current(true); return this.#lease !== null || this.#busy || this.#cleanupBusy || this.#journal?.retained().publicationPending === true;
  }
  /** Fresh-facade historical resolvers cannot reset this original attempt. */
  public hasAttemptedNativeOwnerAllocation(): boolean { this.#current(true); return this.#factoryInvoked; }
  /** Observe the original window once. A missing reply remains consumed;
   * cleanup cannot replay the native observation or select another HWND. */
  public async observeWindow(): Promise<string | null> {
    this.#current(true); need(!this.#busy && !this.#cleanupBusy && !this.#windowAttempted && this.#launchAttempted && !this.#releaseAttempted, "WINDOW_UNAVAILABLE");
    const owner = this.#ownerRequired(); const binding = owner.status().binding;
    need(binding !== null, "WINDOW_ORIGINAL_BINDING");
    this.#windowAttempted = true; this.#windowOutcome = "pending"; this.#cleanupBusy = true;
    try {
      this.#windowPending = owner.observeApplicationWindow();
      const hwnd = await this.#windowPending; this.#current(true);
      need(owner === this.#owner && owner.status().binding === binding, "WINDOW_ORIGINAL_BINDING");
      this.#windowObservation = hwnd; this.#windowOutcome = "returned"; return hwnd;
    } catch (error) { this.#windowFailure ??= error; this.#windowOutcome = "unknown"; throw error;
    } finally { this.#cleanupBusy = false; }
  }
  /** Only original private references produce the cleanup projection. Its
   * hashes and marker are comparison data, never a reconstructed native owner. */
  public inspection(): Readonly<Record<string, unknown>> {
    this.#current(true);
    const journal = this.#journal?.retained(); const records = journal?.records ?? []; const owner = this.#owner?.status();
    const publishedBinding = records.find(record => record.kind === "binding");
    const binding = owner?.binding ?? null;
    const originalBindingRetained = this.#lease !== null && this.#owner !== null && binding !== null && publishedBinding !== undefined &&
      this.#bindingSha256 !== null && sha256Json(publishedBinding) === this.#bindingSha256 && canonicalJson(publishedBinding.evidence["binding"]) === canonicalJson(binding);
    return Object.freeze({ schema: "easyeda-pro-control.footprint-forward-source-validation-inspection.v1",
      operationId: this.#request?.operationId ?? null, state: this.#stage, busy: this.#busy, cleanupBusy: this.#cleanupBusy,
      failed: this.#failed !== null, publicationPending: journal?.publicationPending ?? false,
      publicationSettlementAvailable: this.#request !== null && this.#journal !== null && this.#lease !== null,
      intentSha256: records[0] === undefined ? null : sha256Json(records[0]), binding,
      bindingSha256: this.#bindingSha256, originalBindingRetained,
      launchAcknowledged: publishedBinding?.evidence["acknowledged"] === true,
      helperClosed: owner?.helperClosed ?? false, terminationObserved: this.#terminated,
      releaseAttempted: this.#releaseAttempted, releaseObserved: this.#releaseObserved,
      windowAttempted: this.#windowAttempted, windowOutcome: this.#windowOutcome, windowFailureRetained: this.#windowFailure !== null, hwnd: this.#windowObservation,
      source: this.#result, opening: this.#opening?.status() ?? null,
      channel: owner?.workerStartupChannel ?? null,
      executionReady: false, executionAuthorized: false, saveAuthorized: false });
  }
}
const providerPrototypes = captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintForwardExecutionOpeningProvider.prototype);

// oxlint-disable-next-line typescript/unbound-method -- The captured method is called only with its exact original private-field provider receiver.
const originalPublishedSourceInput = CurrentFootprintForwardExecutionOpeningProvider.prototype.requireSourceInput;
/** The later main issuer resolves the original settled provider through this
 * captured method. Replacing receiver/prototype lookup cannot mint admission. */
export function requireCurrentFootprintForwardExecutionOpeningInput(provider: CurrentFootprintForwardExecutionOpeningProvider): ReturnType<CurrentFootprintForwardExecutionOpeningProvider["requireSourceInput"]> {
  need(provider !== null && typeof provider === "object" && !types.isProxy(provider), "ORIGINAL_PROVIDER");
  return originalPublishedSourceInput.call(provider);
}
