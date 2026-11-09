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
import { CURRENT_FOOTPRINT_FORWARD_EXECUTION_OPENING_BUDGET, currentFootprintForwardExecutionOpeningProducerEvidenceSchema, currentFootprintForwardExecutionOpeningRequestSchema, currentFootprintForwardExecutionOpeningResultSchema } from "./current-footprint-forward-execution-opening-contract.ts";
import type { CURRENT_FOOTPRINT_FORWARD_EXECUTION_OPENING_NORMAL_STAGES, CurrentFootprintForwardExecutionOpeningRequest as Request,
  CurrentFootprintForwardExecutionOpeningResult as Result } from "./current-footprint-forward-execution-opening-contract.ts";
import { compareCompleteClosedSql } from "./closed-sql-equality.ts";
import { captureCurrentFootprintForwardExecutionClosedSnapshot, requireCurrentFootprintForwardExecutionClosedSnapshot } from "./current-footprint-copy-closed-snapshot.ts";
import { CurrentFootprintForwardExecutionBaselineJournal, currentFootprintForwardExecutionBaselineIntentSchema, currentFootprintForwardExecutionBaselineResultSchema } from "./current-footprint-forward-execution-baseline.ts";
import type { CurrentFootprintForwardExecutionBaselineResult as BaselineResult } from "./current-footprint-forward-execution-baseline.ts";
import { CurrentFootprintForwardExecutionOpeningJournal } from "./current-footprint-forward-execution-opening-journal.ts";
import { captureCurrentFootprintForwardExecutionPrototypes, captureCurrentFootprintForwardExecutionReceiver,
  requireCurrentFootprintForwardExecutionPrototypes } from "./current-footprint-forward-execution-opening-identity.ts";

const token = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$(?![\s\S])/u);
const openingPrototypes = captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintCopyStartupOpening.prototype);
const journalPrototypes = captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintForwardExecutionOpeningJournal.prototype);
const openingMethods = ["open", "requireOriginal", "proveCurrentAssignments", "observeFootprintState", "observeFootprintSource", "requireFootprintSource", "releaseAfterTermination", "status"] as const satisfies readonly (keyof CurrentFootprintCopyStartupOpening)[];
const nativeMethods = ["launch", "status", "observeFootprintMainConstruction", "browserObservation", "inspectFrames", "inspectScript", "handoffWorkerStartup",
  "observeFootprintCopyUi", "requireFootprintCopyUi", "assertFootprintForwardExecutionSourceCapacity", "sealFootprintForwardExecutionSource", "originalFootprintForwardExecutionSource", "requestNormalClose",
  "observeApplicationWindow", "originalFootprintForwardExecutionTermination", "requireFootprintForwardExecutionTermination",
  "observeTermination", "releaseClosed", "releaseUnlaunched", "releaseNoProcess", "consumeFootprintForwardExecutionReleasePreflightFailure", "reserveFootprintCombinedAbort", "dispatchFootprintCombinedAbort", "observeFootprintForwardExecutionRelease"] as const satisfies readonly (keyof CurrentFootprintForwardExecutionNativeOwner)[];
function need(condition: boolean, code: string): asserts condition { if (!condition) { throw new Error(`FORWARD_EXECUTION_OPENING_${code}`); } }
type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
type Stage = Exclude<typeof CURRENT_FOOTPRINT_FORWARD_EXECUTION_OPENING_NORMAL_STAGES[number], "prepare" | "allocation" | "launch" | "seal">;
type Lease = ReturnType<typeof acquireCurrentPcbDiagnosticLaunchExclusion>;
export interface CurrentFootprintForwardClockPreparationReservation { readonly profile: "private.current-footprint-forward-clock-preparation-reservation.v1" }
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
  #openingInvoked = false;
  #result: Result | null = null;
  #bindingSha256: string | null = null;
  #baselineAttempted = false;
  #baselineJournal: CurrentFootprintForwardExecutionBaselineJournal | null = null;
  #baselineResult: BaselineResult | null = null;
  #baselineFailure: unknown = null;
  #baselineFailed = false;
  #baselineInventory: Inventory | null = null;
  #baselineTermination: object | null = null;
  #stage: "new" | "launched" | "main" | "browser" | "frames" | "ui-source" | "sealed" = "new";
  #busy = false;
  #clockPreparationAttempted = false;
  #clockPreparationReservation: CurrentFootprintForwardClockPreparationReservation | null = null;
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
  #openingReleasePending: Promise<void> | null = null;
  #terminationPending: { ordinal: number; dispatched: boolean; result: boolean | null } | null = null;
  #windowAttempted = false;
  #windowObservation: string | null = null;
  #windowOutcome: "not-attempted" | "pending" | "returned" | "unknown" = "not-attempted";
  #windowPending: Promise<string | null> | null = null;
  #windowFailure: unknown = null;
  #prelaunchRelease: Promise<void> | null = null;
  #prelaunchCleanupKind: "cleanup-no-allocation" | "cleanup-before-launch" | "cleanup-unlaunched-owner" | null = null;
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
  /** Only the original native attempt can prove that release work never
   * started. A missing proof or classifier failure retains the original error
   * and consumed provider state, without sending another native command. */
  #releasePreflightFailure(owner: CurrentFootprintForwardExecutionNativeOwner, failure: unknown, kind: "closed" | "unlaunched" | "no-process"): boolean {
    try { this.#current(true); return this.#owner === owner && owner.consumeFootprintForwardExecutionReleasePreflightFailure(failure, kind); }
    catch { return false; }
  }
  async #awaitNoProcessRelease(owner: CurrentFootprintForwardExecutionNativeOwner): Promise<void> {
    const pending = this.#noProcessReleasePending; need(pending !== null, "ORIGINAL_NO_PROCESS_RELEASE_REQUIRED");
    try { await pending; }
    catch (error) {
      if (this.#releasePreflightFailure(owner, error, "no-process")) {
        this.#releaseAttempted = false; this.#noProcessReleasePending = null; this.#noProcessRelease = false;
      }
      throw error;
    }
  }
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
      await this.#preparedCurrent(true); await journal.append("allocation-intent", { purpose: CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE,
        producer: currentFootprintForwardExecutionOpeningProducerEvidenceSchema.parse({ schema: "easyeda-pro-control.footprint-forward-execution-opening-producer.v1",
          source: "verifyCurrentPcb209DiagnosticInstallation", facadeSha256: installation.facadeSha256, installationSha256: sha256Json(installation) }) }); this.#current();
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
      const result = await this.#stageCall("opening", { target: prepared.sealedTarget }, () => {
        this.#openingInvoked = true;
        return opening.open(prepared.sealedTarget, async () => {
          await this.#preparedCurrent(true); await this.#journalRequired().assertCurrent(); this.#current();
        });
      }, value => { this.#openingResult = value; });
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
  /** Capture the original v2 closed database once, after this provider's
   * acknowledged normal close and actual root/whole-Job exit. Compare every
   * logical SQL field against its original complete pre-open reader. */
  public async proveClosedBaseline(): Promise<BaselineResult> {
    this.#current(true);
    need(!this.#busy && !this.#cleanupBusy && !this.#baselineAttempted && this.#failed === null && this.#stage === "sealed" &&
      this.#result !== null && this.#prepared !== null && this.#cleanupKind === "close" && this.#closeDispatched &&
      this.#cleanupAcknowledged === "close" && !this.#abortDispatched && this.#terminated && this.#terminationPending === null &&
      !this.#releaseAttempted && !this.#noProcessRelease, "CLOSED_BASELINE_UNAVAILABLE");
    this.#baselineAttempted = true; this.#cleanupBusy = true;
    const owner = this.#ownerRequired(), prepared = this.#prepared, result = this.#result;
    try {
      const journal = this.#journalRequired(); await journal.settle(); this.#current(true); await journal.assertCurrent(); this.#current(true);
      const records = journal.retained().records;
      const close = records.find(record => record.kind === "close-result"), terminationRecord = records.at(-1);
      need(close !== undefined && terminationRecord?.kind === "termination-result" && terminationRecord.evidence["terminated"] === true,
        "CLOSED_BASELINE_ORIGINAL_CLOSURE");
      const source = owner.originalFootprintForwardExecutionSource(), termination = owner.originalFootprintForwardExecutionTermination();
      need(source.opening === this.#opening && source.result === this.#openingResult && source.source.before === prepared.before &&
        source.owned.before === prepared.before && source.source.checkpoint === prepared.checkpoint.checkpoint &&
        source.source.operationId === result.operationId && source.source.checkpoint.checkpointSha256 === result.checkpointSha256 &&
        prepared.before.logicalSha256 === result.beforeSqlSha256 && readerCompletion(prepared.before) === prepared.completion &&
        prepared.completion.observedChildClose && prepared.completion.exitCode === 0 && prepared.completion.exitSignal === null,
      "CLOSED_BASELINE_ORIGINAL_SOURCE");
      this.#baselineTermination = termination;
      const current = async (): Promise<void> => {
        this.#current(true); owner.requireFootprintForwardExecutionTermination(termination);
        const fresh = owner.originalFootprintForwardExecutionSource();
        need(this.#owner === owner && this.#prepared === prepared && this.#result === result && fresh.source === source.source &&
          fresh.opening === source.opening && fresh.result === source.result && fresh.preparation === source.preparation &&
          fresh.owned.before === prepared.before && fresh.owned.copyPlan === source.owned.copyPlan &&
          fresh.main === source.main && fresh.mainRetained === source.mainRetained && fresh.resources === source.resources && fresh.binding === source.binding &&
          this.#baselineTermination === termination && readerCompletion(prepared.before) === prepared.completion, "CLOSED_BASELINE_CUSTODY_CHANGED");
        await journal.assertCurrent(); this.#current(true);
        need(sha256Json(journal.retained().records) === sha256Json(records), "CLOSED_BASELINE_RECORDS_CHANGED");
      };
      const intent = Object.freeze(currentFootprintForwardExecutionBaselineIntentSchema.parse({
        schema: "easyeda-pro-control.footprint-forward-execution-baseline-intent.v1", operationId: result.operationId,
        sourceInputSha256: sha256Json(result), openingRecordsSha256: sha256Json(records), normalCloseResultSha256: sha256Json(close),
        terminationResultSha256: sha256Json(terminationRecord), beforeCheckpointSha256: result.checkpointSha256, beforeSqlSha256: result.beforeSqlSha256,
        originalNormalCloseAcknowledged: true, originalRootExited: true, originalJobEmpty: true, executionAuthorized: false, saveAuthorized: false,
      }));
      const baseline = new CurrentFootprintForwardExecutionBaselineJournal(intent); this.#baselineJournal = baseline;
      await current(); await baseline.publishIntent(); await current();
      const after = await captureCurrentFootprintForwardExecutionClosedSnapshot(owner, termination); this.#baselineInventory = after; await current();
      const completion = readerCompletion(after), snapshot = requireCurrentFootprintForwardExecutionClosedSnapshot(owner, after);
      need(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null, "CLOSED_BASELINE_COMPLETE_READER");
      await compareCompleteClosedSql(prepared.before, after); await current();
      need(requireCurrentFootprintForwardExecutionClosedSnapshot(owner, after) === snapshot && readerCompletion(after) === completion &&
        after.checkpointSha256 === snapshot.checkpoint.checkpointSha256 && after.logicalSha256 === prepared.before.logicalSha256,
      "CLOSED_BASELINE_ORIGINAL_SNAPSHOT");
      const closed = Object.freeze(currentFootprintForwardExecutionBaselineResultSchema.parse({ ...intent,
        schema: "easyeda-pro-control.footprint-forward-execution-closed-baseline.v1", baselineIntentSha256: sha256Json(intent),
        closedCheckpointSha256: snapshot.checkpoint.checkpointSha256, closedSqlSha256: after.logicalSha256,
        exactLogicalSqlUnchanged: true, originalCompletedReadersRetained: true, helperReleaseProved: false, savedCopyVerified: false,
        currentHeadVerified: false, continuousProducerExclusionVerified: false, executionReady: false,
      }));
      await baseline.assertCurrent(); await current(); await baseline.publishResult(closed); await current();
      this.#baselineResult = closed; return closed;
    } catch (error) {
      this.#baselineFailed = true; this.#baselineFailure = error;
      if (this.#baselineJournal !== null) {
        try { await this.#baselineJournal.publishFailure(); }
        catch (publicationError) {
          // oxlint-disable-next-line eslint/preserve-caught-error -- The exact original baseline failure is the cause; retain the separate publication refusal as well.
          throw new AggregateError([error, publicationError], "FORWARD_EXECUTION_BASELINE_FAILURE_PUBLICATION", { cause: error });
        }
      }
      throw error;
    } finally { this.#cleanupBusy = false; }
  }
  /** Release original construction resources only after actual root/empty-Job
   * termination, then issue the helper release once and retain its outcome. */
  public async release(): Promise<void> {
    this.#current(true); need(this.#terminated && !this.#cleanupBusy && !this.#releaseAttempted, "RELEASE_UNAVAILABLE"); this.#cleanupBusy = true;
    try {
      const journal = this.#journalRequired(); await journal.settle();
      if (!journal.retained().records.some(record => record.kind === "release-intent")) { await journal.append("release-intent", {}); }
      if (this.#opening !== null && !this.#openingReleased) {
        this.#openingCurrent ??= captureCurrentFootprintForwardExecutionReceiver(this.#opening, openingPrototypes, openingMethods);
        this.#openingCurrent();
        if (this.#openingInvoked) {
          // Retain the original promise before awaiting it.
          // Rejection has no native no-dispatch proof and cannot authorize another call.
          this.#openingReleasePending ??= this.#opening.releaseAfterTermination();
          await this.#openingReleasePending;
        }
        else {
          const opening = this.#opening.status(), transport = opening.transport;
          need(this.#openingResult === null && !opening.consumed && !opening.settled && !opening.openingAttempted &&
            !opening.openingDispatchSettled && !opening.openingResultRetained && !opening.constructionRetained && !opening.completed &&
            opening.diagnostics.stage === "idle" && opening.diagnostics.step === "idle" && opening.diagnostics.failure === null &&
            !transport.started && !transport.settled && !transport.failed && transport.requests === 0 &&
            !transport.initialPauseSeen && !transport.initialResumeAttempted && !transport.initialResumeSeen &&
            !transport.unresolvedInstrumentation && transport.attachedWorkers === 0 && !transport.existingWorkersBound &&
            transport.existingWorkersObserved === 0 && transport.existingWorkersAttached === 0 &&
            transport.parentConstruction === null && transport.parentPeer === null && transport.constructionAssignments === null &&
            transport.bootstrapStages.every(stage => !stage.parsed && !stage.pauseSeen && !stage.resumeAttempted && !stage.resumeSeen),
          "ORIGINAL_UNSTARTED_OPENING_REQUIRED");
        }
        this.#openingReleased = true;
      }
      const owner = this.#ownerRequired(); this.#releaseAttempted = true;
      try { await owner.releaseClosed(); }
      catch (error) {
        if (this.#releasePreflightFailure(owner, error, "closed")) { this.#releaseAttempted = false; }
        throw error;
      }
      this.#releaseObserved = true;
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
        await this.#awaitNoProcessRelease(owner); this.#releaseObserved = true;
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
      await this.#awaitNoProcessRelease(owner); this.#releaseObserved = true;
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
        this.#prelaunchRelease ??= owner.releaseUnlaunched();
        try { await this.#prelaunchRelease; }
        catch (error) {
          if (this.#releasePreflightFailure(owner, error, "unlaunched")) { this.#prelaunchRelease = null; }
          throw error;
        }
      }
      need(owner.status().helperClosed, "ORIGINAL_HELPER_NOT_CLOSED");
      // Cleanup writes helper input even when launch was never invoked.
      // Only factory diagnostics can prove the old zero-input outcome.
      await this.#publishPrelaunchCleanup(this.#prelaunchRelease === null ? "cleanup-before-launch" : "cleanup-unlaunched-owner");
    } finally { this.#cleanupBusy = false; }
  }
  /** Retain only an already-proved original cleanup fact across publication
   * failures. Settlement cannot resend native release or append a terminal twice. */
  async #publishPrelaunchCleanup(kind: "cleanup-no-allocation" | "cleanup-before-launch" | "cleanup-unlaunched-owner"): Promise<void> {
    need(this.#prelaunchCleanupKind === null || this.#prelaunchCleanupKind === kind, "ORIGINAL_PRELAUNCH_CLEANUP");
    this.#prelaunchCleanupKind = kind;
    const journal = this.#journalRequired();
    let evidence: Readonly<Record<string, unknown>> = { helperClosed: true, stdinBytesWritten: 0 };
    if (kind === "cleanup-no-allocation") { evidence = { noAllocationProved: true }; }
    else if (kind === "cleanup-unlaunched-owner") { evidence = { helperClosed: true, launchNeverInvoked: true, originalUnlaunchedReleaseAcknowledged: true }; }
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
  /** Resolve only this provider's original published baseline. Historical
   * records and an equal result cannot supply native or reader custody. */
  public async requireClosedBaseline(result: BaselineResult): Promise<void> {
    this.#current(true);
    if (this.#baselineFailed) {
      throw this.#baselineFailure;
    }
    need(result === this.#baselineResult && !this.#baselineFailed && this.#baselineJournal !== null &&
      this.#baselineInventory !== null && this.#baselineTermination !== null && this.#owner !== null, "ORIGINAL_CLOSED_BASELINE_REQUIRED");
    this.#owner.requireFootprintForwardExecutionTermination(this.#baselineTermination);
    requireCurrentFootprintForwardExecutionClosedSnapshot(this.#owner, this.#baselineInventory);
    await this.#baselineJournal.assertCurrent(); this.#current(true);
  }
  /** Same-provider custody before the first metadata await. This reservation
   * adds no writer authority and cannot be reused after partial preparation. */
  public reserveClockPreparation(): CurrentFootprintForwardClockPreparationReservation {
    this.#current(); need(this.#stage === "sealed" && !this.#busy && !this.#cleanupBusy && !this.#clockPreparationAttempted, "CLOCK_PREPARATION_CONSUMED");
    this.#clockPreparationAttempted = true; this.#busy = true;
    const reservation = Object.freeze({ profile: "private.current-footprint-forward-clock-preparation-reservation.v1" as const });
    this.#clockPreparationReservation = reservation; return reservation;
  }
  /** Called only after that original metadata promise has settled. Failure
   * ends normal work while retaining all original native cleanup custody. */
  public finishClockPreparation(reservation: CurrentFootprintForwardClockPreparationReservation, failure: unknown): void {
    this.#current(true); need(reservation === this.#clockPreparationReservation && this.#busy, "CLOCK_PREPARATION_ORIGINAL_RESERVATION");
    if (failure !== null) { this.#failed ??= failure; }
    this.#clockPreparationReservation = null; this.#busy = false;
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
// oxlint-disable typescript/unbound-method -- Captured methods are invoked only on the exact original private-field provider.
const originalReserveClockPreparation = CurrentFootprintForwardExecutionOpeningProvider.prototype.reserveClockPreparation;
const originalFinishClockPreparation = CurrentFootprintForwardExecutionOpeningProvider.prototype.finishClockPreparation;
// oxlint-enable typescript/unbound-method
export function reserveOriginalCurrentFootprintForwardClockPreparation(provider: CurrentFootprintForwardExecutionOpeningProvider): CurrentFootprintForwardClockPreparationReservation {
  return originalReserveClockPreparation.call(provider);
}
export function finishOriginalCurrentFootprintForwardClockPreparation(provider: CurrentFootprintForwardExecutionOpeningProvider,
  reservation: CurrentFootprintForwardClockPreparationReservation, failure: unknown): void {
  originalFinishClockPreparation.call(provider, reservation, failure);
}
/** The later main issuer resolves the original settled provider through this
 * captured method. Replacing receiver/prototype lookup cannot mint admission. */
export function requireCurrentFootprintForwardExecutionOpeningInput(provider: CurrentFootprintForwardExecutionOpeningProvider): ReturnType<CurrentFootprintForwardExecutionOpeningProvider["requireSourceInput"]> {
  need(provider !== null && typeof provider === "object" && !types.isProxy(provider), "ORIGINAL_PROVIDER");
  return originalPublishedSourceInput.call(provider);
}
