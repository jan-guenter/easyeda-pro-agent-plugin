/** Separate validation-only diagnostic launch path.
 * Its retained helper owns the original process, non-breakaway Job and pipes.
 * A diagnostic failure never ends stdin or closes an Electron pipe. The only
 * release path first proves original root and complete Job termination.
 * Browser discovery grants no frame, worker, script or CAD execution authority. */
/* oxlint-disable import/max-dependencies -- This owner composes separately audited native installation, fixed protocol, identity observation and original process/pipe cleanup boundaries. */
/* oxlint-disable max-classes-per-file -- Two fixed-purpose exported facades share an unexported retained owner core; exporting a configurable core would expose a purpose-selection bypass. */
import { spawn } from "node:child_process";
import type { ChildProcessWithoutNullStreams } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { lstat, readFile, realpath } from "node:fs/promises";
import process from "node:process";
import { PassThrough, Writable } from "node:stream";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { canonicalJson, sha256Json } from "./core.ts";
import { CurrentPcbDiagnosticPipe, CurrentPcbStringPrecreatePipe, decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-pipe.ts";
import type { CurrentPcbDiagnosticFailureObservation } from "./current-pcb-diagnostic-pipe.ts";
import { diagnosticNativeRequest, stringPrecreateNativeRequest } from "./current-pcb-diagnostic-protocol.ts";
import { CurrentPcbDiagnosticContext, diagnosticBoundedObservation, diagnosticTargetInventory, diagnosticTargetSummary,
  validateDiagnosticFrameExpectation, validateDiagnosticScriptProfile } from "./current-pcb-diagnostic-context.ts";
import type { DiagnosticFrameExpectation, DiagnosticScriptProfile } from "./current-pcb-diagnostic-context.ts";
import { CurrentPcbDiagnosticWorkerContext } from "./current-pcb-diagnostic-worker-context.ts";
import type { DiagnosticWorkerScriptProfile } from "./current-pcb-diagnostic-worker-context.ts";
import { verifyCurrentPcbDiagnosticInstallation } from "./current-pcb-diagnostic-installation.ts";
import type { CurrentPcbDiagnosticInstallation, CurrentPcbDiagnosticInstallationOptions } from "./current-pcb-diagnostic-installation.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import { currentPcbDiagnosticOpeningArguments, decodeCurrentPcbDiagnosticOpeningReply } from "./current-pcb-diagnostic-opening.ts";
import type { CurrentPcbDiagnosticOpeningResult } from "./current-pcb-diagnostic-opening.ts";
import { CurrentPcbDiagnosticModelRunner } from "./current-pcb-diagnostic-model-runner.ts";
import type { CurrentPcbDiagnosticModelObservation } from "./current-pcb-diagnostic-model-runner.ts";
import { currentPcbDiagnosticPcbOpeningArguments, decodeCurrentPcbDiagnosticPcbOpeningReply } from "./current-pcb-diagnostic-pcb-opening.ts";
import type { CurrentPcbDiagnosticPcbOpeningResult } from "./current-pcb-diagnostic-pcb-opening.ts";
import { CurrentPcbStringPrecreateRunner } from "./current-pcb-string-precreate-runner.ts";
import { currentPcbObservationFailure, currentPcbObservationFailureDetail } from "./current-pcb-observation-failure.ts";
import type { CurrentPcbObservationFailure, CurrentPcbObservationPhase } from "./current-pcb-observation-failure.ts";
import { CurrentPcbCommonBaselineSession } from "./current-pcb-common-baseline-session.ts";
import { currentPcbCommonBaselineFailure, currentPcbCommonBaselineRefusal, currentPcbCommonBaselineResult } from "./current-pcb-common-baseline-validation.ts";
import type { CurrentPcbCommonBaselineFailure, CurrentPcbCommonBaselineResult } from "./current-pcb-common-baseline-validation.ts";
import type { readExactSqlInventory } from "./sqlite-inventory.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import { CurrentPcbStringWorkerProducerRunner } from "./current-pcb-string-worker-producer-runner.ts";
import { currentPcbStringWorkerProducerFailureDetail } from "./current-pcb-string-worker-producer-evidence.ts";
import { CurrentPcbStringActorClockRunner } from "./current-pcb-string-actor-clock-runner.ts";
import type { CurrentPcbStringActorClockPacket } from "./current-pcb-string-actor-clock-runner.ts";
import { prepareCurrentPcbStringSaveProvenance, requireOriginalCurrentPcbStringSaveProvenance } from "./current-pcb-string-save-provenance.ts";
import type { CurrentPcbStringSaveProvenance } from "./current-pcb-string-save-provenance.ts";
import { CurrentPcbStringMoveRunner, currentPcbStringMoveFailureDetail } from "./current-pcb-string-move-runner.ts";
import { inspectCurrentPcbStringFiniteEffects } from "./current-pcb-string-finite-effects.ts";
import { CurrentPcbStringNativeClockIssuer } from "./current-pcb-string-native-clock.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { CurrentPcbStringNativeClockObservation, CurrentPcbStringNativeClockPhase } from "./current-pcb-string-native-clock.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const HELPER_SHA256 = "6f961eab97eda5d6f73f8ca54432c803ea2fabbf2690fedf46b9916fefb14081";
const HELPER_BYTES = 611_926;
const MAX_LINE = 100_000;
// 64 MiB native bytes need at most 85.34 MiB base64 plus bounded poll envelopes.
const MAX_TOTAL = 96 * 1024 * 1024;
// Original helper owners remain reachable after caller exceptions.
const retainedOwners = new Set<object>();
type RecordValue = Record<string, unknown>;
interface Binding { readonly helperInstance: string; readonly jobId: string; readonly rootPid: number; readonly rootCreated: string }
export interface CurrentPcbDiagnosticNoProcessRelease {
  readonly launchRequestOutcome: "not-issued" | "native-refused";
  readonly creationState: "not-entered" | "returned-false";
  readonly createProcessError?: number;
  readonly processCreated: false; readonly released: true;
}
interface NoProcessProof { readonly creationState: "not-entered" | "returned-false"; readonly createProcessError?: number }
interface Pending {
  readonly id: string; readonly resolve: (value: RecordValue) => void; readonly reject: (error: Error) => void;
  readonly timer: ReturnType<typeof setTimeout>; readonly launch: boolean; readonly send: boolean; written: boolean; reply: RecordValue | null;
}
function record(value: unknown): value is RecordValue { return value !== null && typeof value === "object" && !Array.isArray(value); }
function exact(value: RecordValue, fields: readonly string[]): boolean { return Object.keys(value).toSorted().join(",") === fields.toSorted().join(","); }
function error(code: string): Error { return new Error(`PCB_DIAGNOSTIC_OWNER_${code}`); }
interface TerminationObservation { readonly originalRootExited: boolean | null; readonly originalJobEmpty: boolean | null; readonly terminated: boolean }
function terminationObservation(value: RecordValue): Readonly<TerminationObservation> {
  const { originalRootExited, originalJobEmpty, terminated } = value;
  if (!exact(value, ["terminated", "originalRootExited", "originalJobEmpty"]) ||
      typeof terminated !== "boolean" || originalRootExited !== null && typeof originalRootExited !== "boolean" ||
      originalJobEmpty !== null && typeof originalJobEmpty !== "boolean" ||
      terminated !== (originalRootExited === true && originalJobEmpty === true)) { throw error("TERMINATION_REPLY"); }
  return Object.freeze({ originalRootExited, originalJobEmpty, terminated });
}
function binding(value: RecordValue): Binding {
  const { helperInstance, jobId, rootPid, rootCreated } = value;
  if (!exact(value, ["helperInstance", "jobId", "rootPid", "rootCreated"]) ||
      typeof helperInstance !== "string" || !/^[a-f\d]{32}$/u.test(helperInstance) ||
      typeof jobId !== "string" || !/^[a-f\d]{32}$/u.test(jobId) ||
      typeof rootPid !== "number" || !Number.isSafeInteger(rootPid) || rootPid < 1 ||
      typeof rootCreated !== "string" || !/^(?:0|[1-9]\d{14,19})$/u.test(rootCreated)) { throw error("BINDING"); }
  return Object.freeze({ helperInstance, jobId, rootPid, rootCreated });
}
function noProcessState(value: RecordValue, released: boolean): Readonly<NoProcessProof> {
  const code = value["createProcessError"], hasError = Object.hasOwn(value, "createProcessError");
  if (!exact(value, [...(released ? ["released"] : []), "creationState", "processCreated", ...(hasError ? ["createProcessError"] : [])]) ||
      value["processCreated"] !== false || released && value["released"] !== true ||
      value["creationState"] !== "not-entered" && value["creationState"] !== "returned-false" ||
      hasError && (value["creationState"] !== "returned-false" || typeof code !== "number" || !Number.isSafeInteger(code) ||
        code < 0 || code > 4_294_967_295 || Object.is(code, -0))) { throw error("NO_PROCESS_PROOF"); }
  return Object.freeze({ creationState: value["creationState"], ...(hasError && typeof code === "number" ? { createProcessError: code } : {}) });
}

/** Test seams supply a real retained child, never process IDs or an attach path.
 * Only the two fixed owner factories check packaged helper source. Neither
 * constructor nor successful discovery grants current runtime admission. */
class CurrentPcbRetainedOwnerCore {
  readonly #child: ChildProcessWithoutNullStreams;
  readonly #verify: () => Promise<void>;
  readonly #verifyInstallation: () => Promise<void>;
  readonly #installation: CurrentPcbDiagnosticInstallation | null;
  readonly #input = new PassThrough({ autoDestroy: false });
  readonly #output: Writable;
  readonly #pipe: CurrentPcbDiagnosticPipe | CurrentPcbStringPrecreatePipe;
  readonly #stringPurpose: boolean;
  readonly #closed = Promise.withResolvers<null>();
  #pending: Pending | null = null;
  #buffer = Buffer.alloc(0);
  #total = 0;
  #failure: string | null = null;
  #binding: Binding | null = null;
  #busy = false;
  #launchConsumed = false;
  #launchSucceeded = false;
  #launchSettled = false;
  #launchRequestIssued = false;
  #nativeLaunchRefused = false;
  #noProcessProof: Readonly<NoProcessProof> | null = null;
  #nativeLaunchError: string | null = null;
  #nativeSendError: string | null = null;
  #observationFailure: CurrentPcbObservationFailure | null = null;
  #closeConsumed = false;
  #releaseConsumed = false;
  #released = false;
  #childClosed = false;
  #send: Promise<void> | null = null;
  #inspectionConsumed = false;
  #browserObservationConsumed = false;
  #framesConsumed = false;
  #scriptConsumed = false;
  #browserTargets: readonly Readonly<RecordValue>[] | null = null;
  #stagedContext: CurrentPcbDiagnosticContext | null = null;
  #stagedAttachment: Readonly<{ targetId: string; sessionId: string }> | null = null;
  #workerContext: CurrentPcbDiagnosticWorkerContext | null = null;
  #workersConsumed = false;
  #workerScriptConsumed = false;
  #workerStateConsumed = false;
  #projectOpeningConsumed = false;
  #projectOpeningResult: CurrentPcbDiagnosticOpeningResult | null = null;
  #projectOpeningTarget: CurrentDisposableOpenSealedTarget | null = null;
  #pcbOpeningConsumed = false;
  #pcbOpeningResult: CurrentPcbDiagnosticPcbOpeningResult | null = null;
  #pcbObservationConsumed = false;
  #pcbFrameObservation: CurrentPcbDiagnosticPcbOpeningResult | null = null;
  #pcbSourceQualified = false;
  #modelConsumed = false;
  #stringPrecreateConsumed = false;
  #commonBaselineConsumed = false;
  #commonBaselineSession: CurrentPcbCommonBaselineSession | null = null;
  #commonBaselineFailure: CurrentPcbCommonBaselineFailure | null = null;
  #stringWorkerRunner: CurrentPcbStringWorkerProducerRunner | null = null;
  #stringActorRunner: CurrentPcbStringActorClockRunner | null = null;
  #stringActorPacket: CurrentPcbStringActorClockPacket | null = null;
  #stringBeforeSql: Awaited<ReturnType<typeof readExactSqlInventory>> | null = null;
  #stringSaveProvenance: CurrentPcbStringSaveProvenance | null = null;
  #stringMoveRunner: CurrentPcbStringMoveRunner | null = null;
  #stringNativeClock: CurrentPcbStringNativeClockIssuer | null = null;
  #terminationObserved = false;
  #terminationObservation: Readonly<TerminationObservation> | null = null;

  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>,
    installation: CurrentPcbDiagnosticInstallation | null, verifyInstallation: () => Promise<void>, stringPurpose: boolean) {
    this.#child = child; this.#verify = verify; this.#installation = installation; this.#verifyInstallation = verifyInstallation;
    this.#stringPurpose = stringPurpose;
    this.#output = new Writable({ autoDestroy: false,
      // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Writable requires its original callback, acknowledged only after native WriteFile.
      write: (chunk: unknown, _encoding, callback): void => {
        this.#send = this.#sendFrame(chunk, callback);
      },
    });
    this.#pipe = stringPurpose ? new CurrentPcbStringPrecreatePipe(this.#input, this.#output) : new CurrentPcbDiagnosticPipe(this.#input, this.#output);
  }

  /** Retain the object before attaching listeners; failures preserve its child. */
  public start(): void {
    if (this.#pipe.status().started) { throw error("START_CONSUMED"); }
    this.#child.on("error", this.#childError);
    this.#child.on("close", this.#childClose);
    this.#child.stdin.on("error", this.#childError);
    this.#child.stdout.on("error", this.#childError);
    this.#child.stderr.on("error", this.#childError);
    this.#child.stderr.on("data", this.#stderr);
    this.#child.stdout.on("data", this.#data);
    this.#pipe.start();
  }

  public status(): Readonly<{ helperPid: number | null; binding: Binding | null; failure: string | null;
    busy: boolean; launchConsumed: boolean; closeConsumed: boolean; released: boolean; helperClosed: boolean;
    cleanupOnly: boolean; noProcessCleanupAvailable: boolean; frameWorkerVerified: false; executionAuthorized: false;
    nativeLaunchError: string | null; nativeSendError: string | null; createProcessError: number | null;
    browserObservationConsumed: boolean; frameInspectionConsumed: boolean; scriptInspectionConsumed: boolean; diagnosticFailure: string | null;
    diagnosticFailureObservation: CurrentPcbDiagnosticFailureObservation | null;
    observationFailure?: CurrentPcbObservationFailure | null;
    lastTerminationObservation?: Readonly<TerminationObservation> | null;
    projectOpeningConsumed: boolean; projectOpeningResult: CurrentPcbDiagnosticOpeningResult | null; modelObservationConsumed: boolean;
    pcbOpeningConsumed: boolean; pcbOpeningResult: CurrentPcbDiagnosticPcbOpeningResult | null;
    pcbObservationConsumed: boolean; pcbFrameObservation: CurrentPcbDiagnosticPcbOpeningResult | null; pcbSourceQualified: boolean;
    stringPrecreateConsumed: boolean; commonBaselineConsumed?: boolean; profile: "diagnostic" | "string-precreate" }> {
    return Object.freeze({ helperPid: this.#child.pid ?? null, binding: this.#binding, failure: this.#failure,
      busy: this.#busy, launchConsumed: this.#launchConsumed, closeConsumed: this.#closeConsumed,
      released: this.#released, helperClosed: this.#childClosed, cleanupOnly: this.#binding !== null && !this.#launchSucceeded,
      noProcessCleanupAvailable: this.#noProcessCleanupAvailable(), frameWorkerVerified: false, executionAuthorized: false, browserObservationConsumed: this.#browserObservationConsumed,
      nativeLaunchError: this.#nativeLaunchError, nativeSendError: this.#nativeSendError, createProcessError: this.#noProcessProof?.createProcessError ?? null,
      frameInspectionConsumed: this.#framesConsumed, scriptInspectionConsumed: this.#scriptConsumed, diagnosticFailure: this.#pipe.status().failure,
      diagnosticFailureObservation: this.#pipe.status().failureObservation,
      observationFailure: this.#observationFailure,
      lastTerminationObservation: this.#terminationObservation,
      projectOpeningConsumed: this.#projectOpeningConsumed, projectOpeningResult: this.#projectOpeningResult, modelObservationConsumed: this.#modelConsumed,
      pcbOpeningConsumed: this.#pcbOpeningConsumed, pcbOpeningResult: this.#pcbOpeningResult,
      pcbObservationConsumed: this.#pcbObservationConsumed, pcbFrameObservation: this.#pcbFrameObservation, pcbSourceQualified: this.#pcbSourceQualified,
      stringPrecreateConsumed: this.#stringPrecreateConsumed, commonBaselineConsumed: this.#commonBaselineConsumed,
      profile: this.#stringPurpose ? "string-precreate" : "diagnostic" });
  }

  public async launch(input: Readonly<{ executable: string; executableSha256: string; confirmDiagnosticLaunch: true }>): Promise<Binding> {
    if (this.#launchConsumed) { throw error("LAUNCH_CONSUMED"); }
    const { executable, executableSha256, confirmDiagnosticLaunch } = input;
    // oxlint-disable-next-line typescript/no-unnecessary-boolean-literal-compare, eslint/no-control-regex -- Exact confirmation and exclusion of native command control characters are required at this boundary.
    if (confirmDiagnosticLaunch !== true || !/^[A-Za-z]:\\[^\u0000-\u001F"\r\n]+\\easyeda-pro\.exe$/u.test(executable) ||
        !/^[a-f\d]{64}$/u.test(executableSha256)) { throw error("LAUNCH_INPUT"); }
    this.#enter(); this.#launchConsumed = true;
    try {
      await this.#verifyInstallation(); await this.#verify(); this.#available();
      const nativeFile = this.#installation?.plan.files[0];
      if (this.#installation !== null && (nativeFile?.windowsPath !== executable || nativeFile.sha256 !== executableSha256)) { throw error("INSTALLATION_TARGET"); }
      try { this.#binding = binding(await this.#request({ action: "launch", executable, executableSha256, confirmDiagnosticLaunch: true,
        ...(this.#installation === null ? {} : { installation: this.#installation.plan }) })); }
      catch (caughtError) {
        // Native failure can follow successful CreateProcess. Recover only this
        // Original helper's retained binding; never launch or adopt a PID again.
        if (this.#failure === null) { await this.#recoverLaunchBinding(); }
        throw caughtError;
      }
      await this.#verify(); this.#available();
      if (this.#binding.rootCreated === "0") { throw error("CLEANUP_ONLY"); }
      this.#launchSucceeded = true;
      return this.#binding;
    } finally { this.#launchSettled = true; this.#busy = false; }
  }

  async #recoverLaunchBinding(): Promise<void> {
    const observed = await this.#request({ action: "identity" });
    if (observed["rootPid"] !== 0) { this.#binding = binding(observed); }
    else if (this.#nativeLaunchRefused) {
      if (!exact(observed, ["helperInstance", "jobId", "rootPid", "rootCreated"]) || observed["rootCreated"] !== "0" ||
          typeof observed["helperInstance"] !== "string" || !/^[a-f\d]{32}$/u.test(observed["helperInstance"]) ||
          typeof observed["jobId"] !== "string" || !/^[a-f\d]{32}$/u.test(observed["jobId"])) { throw error("NO_PROCESS_IDENTITY"); }
      this.#noProcessProof = noProcessState(await this.#request({ action: "no-process-proof" }), false);
    }
  }

  public getVersion(): Promise<RecordValue> { return this.#discover("version"); }
  public getTargets(): Promise<RecordValue> { return this.#discover("targets"); }

  /** One fixed browser sample. No attachment, bridge startup or profile claim. */
  public async browserObservation(): Promise<Readonly<RecordValue>> {
    if (this.#browserObservationConsumed || this.#inspectionConsumed) { throw error("BROWSER_OBSERVATION_CONSUMED"); }
    this.#enter(true); this.#browserObservationConsumed = true;
    try {
      const version = await this.#transfer(() => this.#pipe.getVersion());
      if (!exact(version, ["protocolVersion", "product", "revision", "userAgent", "jsVersion"]) ||
          Object.values(version).some(value => typeof value !== "string" || value.length > 8192 || value.includes("\0"))) {
        throw error("BROWSER_VERSION_REPLY");
      }
      this.#browserTargets = diagnosticTargetInventory(await this.#transfer(() => this.#pipe.getTargets()));
      return diagnosticBoundedObservation({ schema: "easyeda-pro-control.pcb-diagnostic-browser-observation.v1", version: structuredClone(version),
        targets: this.#browserTargets.map(value => diagnosticTargetSummary(value)), projectFreeVerified: false, profileIsolated: false,
        debuggerSocketAbsenceVerified: false, bridgeAuthentication: false, executionAuthorized: false });
    } catch (caughtError) { this.#input.emit("error", error("BROWSER_OBSERVATION_FAILED")); throw caughtError; }
    finally { this.#busy = false; }
  }

  /** Attach once to a member of the retained inventory and expose actual frame
   * IDs. This original context/event sink stays retained between tool calls. */
  public async inspectFrames(targetId: string): Promise<Readonly<RecordValue>> {
    if (this.#framesConsumed || this.#inspectionConsumed || this.#browserTargets === null) { throw error("FRAME_INSPECTION_UNAVAILABLE"); }
    const original = this.#browserTargets.find(item => item["targetId"] === targetId);
    if (original?.["type"] !== "page" || original["attached"] !== false) { throw error("FRAME_TARGET_UNOBSERVED"); }
    this.#enter(true); this.#framesConsumed = true;
    const context = new CurrentPcbDiagnosticContext(targetId); this.#stagedContext = context;
    try {
      const targets = await this.#transfer(() => this.#pipe.getTargets());
      if (JSON.stringify(diagnosticTargetInventory(targets).find(item => item["targetId"] === targetId)) !== JSON.stringify(original)) { throw error("FRAME_TARGET_CHANGED"); }
      context.selectTarget(targets);
      await this.#attach(context, targetId);
      const page = await this.#transfer(() => this.#pipe.enablePage());
      if (!exact(page, [])) { throw error("PAGE_ENABLE_REPLY"); }
      context.observeFrames(await this.#transfer(() => this.#pipe.getFrameTree()));
      context.observeTarget(await this.#transfer(() => this.#pipe.getTargets()));
      return context.observeFrames(await this.#transfer(() => this.#pipe.getFrameTree()));
    } catch (caughtError) { this.#input.emit("error", error("FRAME_INSPECTION_FAILED")); throw caughtError; }
    finally { this.#busy = false; }
  }

  /** Internal profile only. Public routing supplies a fixed reviewed family;
   * neither URL/path matching nor source bytes authorize any JavaScript/CAD. */
  public async inspectScript(frameId: string, input: DiagnosticScriptProfile): Promise<Readonly<RecordValue>> {
    const context = this.#stagedContext, profile = validateDiagnosticScriptProfile(input);
    if (this.#scriptConsumed || context === null || !this.#framesConsumed || this.#inspectionConsumed) { throw error("SCRIPT_INSPECTION_UNAVAILABLE"); }
    this.#enter(true); this.#scriptConsumed = true;
    try {
      context.observeTarget(await this.#transfer(() => this.#pipe.getTargets()));
      context.observeFrames(await this.#transfer(() => this.#pipe.getFrameTree()));
      context.selectFrame(frameId, profile);
      return await this.#inspectScript(context);
    } catch (caughtError) { this.#input.emit("error", error("IDENTITY_FAILED")); throw caughtError; }
    finally { this.#busy = false; }
  }

  /** Project-only fixed opening under this original diagnostic process owner.
   * The lifecycle supplies the checkpoint-sealed target and one original
   * reproof callback, after durable intent. No ordinary launcher is borrowed.
   * Even a refused preflight consumes this overall stage; cleanup stays usable. */
  public async openProject(input: CurrentDisposableOpenSealedTarget, reverify: () => Promise<void>): Promise<CurrentPcbDiagnosticOpeningResult> {
    const context = this.#stagedContext, target = currentDisposableOpenSealedTargetSchema.parse(input);
    currentPcbDiagnosticOpeningArguments(target, "preflight");
    if (this.#projectOpeningConsumed || context === null || !this.#scriptConsumed || this.#inspectionConsumed ||
        this.#workersConsumed || this.#workerContext !== null || this.#modelConsumed || typeof reverify !== "function") { throw error("PROJECT_OPENING_UNAVAILABLE"); }
    this.#enter(true); this.#projectOpeningConsumed = true; this.#projectOpeningTarget = Object.freeze(target);
    try {
      await this.#verifyInstallation(); await this.#verify(); this.#available();
      await this.#observeOpeningAncillary();
      const selected = context.openingContext();
      await this.#observeParent(); context.openingContext();
      const preflight = decodeCurrentPcbDiagnosticOpeningReply(
        await this.#transfer(() => this.#pipe.observeProjectOpening(selected.uniqueContextId, target, "preflight")), target, "preflight");
      this.#projectOpeningResult = preflight;
      context.openingContext();
      await this.#verifyInstallation(); this.#available();
      if (!preflight.ok) { this.#input.emit("error", error("PROJECT_PREFLIGHT_REFUSED")); return preflight; }
      await reverify(); context.openingContext();
      await this.#verifyInstallation(); await this.#verify(); this.#available();
      await this.#observeParent(); context.openingContext();
      await this.#observeOpeningAncillary(); context.openingContext();
      const titleProof = preflight.observation;
      if (titleProof === null) { throw error("PROJECT_TITLE_PROOF"); }
      const opening = context.beginOpeningTransition(target.projectUuid,
        { initialTitle: titleProof.initialTitle, expectedOpenedTitle: titleProof.expectedOpenedTitle });
      const result = decodeCurrentPcbDiagnosticOpeningReply(
        await this.#transfer(() => this.#pipe.observeProjectOpening(opening.uniqueContextId, target, "open-project")), target, "open-project");
      this.#projectOpeningResult = result;
      context.openingContext();
      await this.#verifyInstallation(); this.#available();
      if (!result.ok) { this.#input.emit("error", error("PROJECT_OPENING_REFUSED")); return result; }
      if (result.observation?.initialTitle !== titleProof.initialTitle ||
          result.observation.expectedOpenedTitle !== titleProof.expectedOpenedTitle) { throw error("PROJECT_TITLE_CHANGED"); }
      // The armed context deliberately retains its original frame/target until
      // Both post-reads settle. Ordinary parent checks would reject the expected
      // Fragment transition instead of completing this one narrow admission.
      const targets = await this.#transfer(() => this.#pipe.getTargets());
      context.openingContext();
      const frameTree = await this.#transfer(() => this.#pipe.getFrameTree());
      context.finishOpeningTransition(targets, frameTree);
      await this.#observeOpeningAncillary(); context.openingContext();
      await this.#verifyInstallation(); await this.#verify(); this.#available(); context.openingContext();
      const ancillaryFrame = context.ancillaryObservation();
      this.#projectOpeningResult = ancillaryFrame === null ? result : Object.freeze({ ...result, ancillaryFrame });
      return this.#projectOpeningResult;
    } catch (caughtError) { this.#input.emit("error", error("PROJECT_OPENING_FAILED")); throw caughtError; }
    finally { this.#busy = false; }
  }

  /** Opens only the PCB sealed by this owner's original accepted project open.
   * Acknowledgment is retained before independent frame/source qualification. */
  public async openPcb(input: CurrentDisposableOpenSealedTarget, reverify: () => Promise<void>): Promise<CurrentPcbDiagnosticPcbOpeningResult> {
    const context = this.#stagedContext, target = currentDisposableOpenSealedTargetSchema.parse(input);
    currentPcbDiagnosticPcbOpeningArguments(target, "preflight");
    if (context === null || !this.#scriptConsumed || this.#inspectionConsumed || this.#workersConsumed || this.#workerContext !== null ||
        this.#modelConsumed || this.#pcbOpeningConsumed || this.#projectOpeningResult?.ok !== true ||
        this.#projectOpeningResult.status !== "opened-prefix-observed" ||
        JSON.stringify(target) !== JSON.stringify(this.#projectOpeningTarget) || typeof reverify !== "function") { throw error("PCB_OPENING_UNAVAILABLE"); }
    this.#enter(true); this.#pcbOpeningConsumed = true;
    try {
      await this.#verifyInstallation(); await this.#verify(); this.#available();
      const selected = context.openingContext();
      await this.#observeParent(); context.openingContext();
      const preflight = decodeCurrentPcbDiagnosticPcbOpeningReply(
        await this.#transfer(() => this.#pipe.observePcbOpening(selected.uniqueContextId, target, "preflight")), target, "preflight");
      this.#pcbOpeningResult = preflight;
      context.openingContext(); await this.#verifyInstallation(); this.#available();
      if (!preflight.ok) { this.#input.emit("error", error("PCB_PREFLIGHT_REFUSED")); return preflight; }
      await reverify(); context.openingContext();
      await this.#verifyInstallation(); await this.#verify(); this.#available();
      await this.#observeParent(); context.openingContext();
      await this.#observeOpeningAncillary(); context.openingContext();
      const opening = context.beginPcbOpeningTransition(target.projectUuid, target.documentUuid);
      const result = decodeCurrentPcbDiagnosticPcbOpeningReply(
        await this.#transfer(() => this.#pipe.observePcbOpening(opening.uniqueContextId, target, "open-document")), target, "open-document");
      this.#pcbOpeningResult = result;
      context.pcbOpeningContext();
      await this.#verifyInstallation(); await this.#verify(); this.#available(); context.pcbOpeningContext();
      if (!result.ok) { this.#input.emit("error", error("PCB_OPENING_REFUSED")); }
      return result;
    } catch (caughtError) { this.#input.emit("error", error("PCB_OPENING_FAILED")); throw caughtError; }
    finally { this.#busy = false; }
  }

  /** Fixed UI/frame/DOM/source observations, never another navigation attempt. */
  public async observePcbOpening(input: CurrentDisposableOpenSealedTarget, inputProfile: DiagnosticScriptProfile): Promise<Readonly<RecordValue>> {
    const context = this.#stagedContext, profile = validateDiagnosticScriptProfile(inputProfile);
    const target = currentDisposableOpenSealedTargetSchema.parse(input);
    if (context === null || this.#pcbObservationConsumed || this.#pcbOpeningResult?.ok !== true ||
        this.#pcbOpeningResult.phase !== "open-document" || this.#pcbOpeningResult.status !== "opened" ||
        this.#workersConsumed || this.#workerContext !== null || this.#modelConsumed || profile.family !== "pcb" ||
        JSON.stringify(target) !== JSON.stringify(this.#projectOpeningTarget)) { throw error("PCB_OBSERVATION_UNAVAILABLE"); }
    this.#enter(true); this.#pcbObservationConsumed = true;
    try {
      await this.#verifyInstallation(); await this.#verify(); this.#available();
      const selected = context.pcbOpeningContext();
      const targets = await this.#transfer(() => this.#pipe.getTargets()); context.pcbOpeningContext();
      const frameTree = await this.#transfer(() => this.#pipe.getFrameTree()); context.pcbOpeningContext();
      const child = context.observePcbOpeningFrames(targets, frameTree);
      await this.#observeOpeningAncillary(); context.pcbOpeningContext();
      const frameOwner = await this.#transfer(() => this.#pipe.getFrameOwner(child.frameId)); context.pcbOpeningContext();
      const backend = frameOwner["backendNodeId"];
      if (typeof backend !== "number" || !Number.isSafeInteger(backend) || backend < 1 || backend > 2_147_483_647) { throw error("PCB_FRAME_OWNER"); }
      const node = await this.#transfer(() => this.#pipe.describeFrameOwner(backend)); context.pcbOpeningContext();
      context.observePcbFrameOwner(frameOwner, node);
      const script = context.pcbScript(profile);
      const source = await this.#transfer(() => this.#pipe.getScriptSource(script.scriptId)); context.pcbOpeningContext();
      const afterTargets = await this.#transfer(() => this.#pipe.getTargets()); context.pcbOpeningContext();
      const afterFrames = await this.#transfer(() => this.#pipe.getFrameTree()); context.pcbOpeningContext();
      const proof = context.finishPcbOpening(source, afterTargets, afterFrames);
      // The fixed UI observation invokes the child's identity RPC. Admit the
      // Exact child source first, not merely its URL or parent UI source.
      const observed = decodeCurrentPcbDiagnosticPcbOpeningReply(
        await this.#transfer(() => this.#pipe.observePcbOpening(selected.uniqueContextId, target, "observe")), target, "observe");
      this.#pcbFrameObservation = observed; context.pcbOpeningContext(); context.pcbScript(profile);
      if (!observed.ok) { throw error("PCB_FRAME_REFUSED"); }
      await this.#observeParent(); context.pcbScript(profile);
      await this.#verifyInstallation(); context.pcbScript(profile);
      await this.#verify(); this.#available(); context.pcbScript(profile);
      context.completePcbOpening(); context.modelContext();
      const result = diagnosticBoundedObservation({ ...proof, openingObservation: observed, ancillaryFrame: context.ancillaryObservation() });
      this.#pcbSourceQualified = true;
      return result;
    } catch (caughtError) { this.#input.emit("error", error("PCB_OBSERVATION_FAILED")); throw caughtError; }
    finally { this.#busy = false; }
  }

  /** Fixed parent-only child reporting. The optional profile is an internal
   * synthetic-test seam, never part of the public lifecycle request. */
  public async inspectWorkers(profile?: DiagnosticWorkerScriptProfile): Promise<Readonly<RecordValue>> {
    const attachment = this.#stagedAttachment;
    if (this.#workersConsumed || this.#stagedContext === null || attachment === null || this.#inspectionConsumed ||
        this.#modelConsumed || (this.#stringPurpose ? !this.#pcbSourceQualified : this.#pcbOpeningConsumed)) {
      throw error("WORKER_INSPECTION_UNAVAILABLE");
    }
    this.#enter(true); this.#workersConsumed = true;
    try {
      const context = new CurrentPcbDiagnosticWorkerContext(attachment.targetId, attachment.sessionId, profile);
      this.#workerContext = context;
      await this.#observeParent();
      const reply = await this.#transfer(() => this.#pipe.enableWorkerDiscovery(event => { context.observeEvent(event); }));
      if (!exact(reply, [])) { throw error("WORKER_DISCOVERY_REPLY"); }
      // This is a bounded sample after the ACK, not a complete worker roster.
      const targets = await this.#observeParent();
      return context.finishInventory(targets);
    } catch (caughtError) { this.#input.emit("error", error("WORKER_INSPECTION_FAILED")); throw caughtError; }
    finally { this.#busy = false; }
  }

  public async inspectWorkerScript(targetId: string): Promise<Readonly<RecordValue>> {
    const context = this.#workerContext;
    if (this.#workerScriptConsumed || context === null || !this.#workersConsumed) { throw error("WORKER_SCRIPT_UNAVAILABLE"); }
    this.#enter(true); this.#workerScriptConsumed = true;
    try {
      context.observeTargets(await this.#observeParent());
      const selected = context.selectWorker(targetId);
      this.#pipe.selectWorkerSession(selected.sessionId);
      const runtime = await this.#transfer(() => this.#pipe.enableWorkerRuntime());
      if (!exact(runtime, [])) { throw error("WORKER_RUNTIME_REPLY"); }
      const debuggerReply = await this.#transfer(() => this.#pipe.enableWorkerDebugger());
      if (!exact(debuggerReply, ["debuggerId"]) || typeof debuggerReply["debuggerId"] !== "string") { throw error("WORKER_DEBUGGER_REPLY"); }
      const source = await this.#transfer(() => this.#pipe.getWorkerScriptSource(context.script().scriptId));
      return context.finishSource(source, await this.#observeParent());
    } catch (caughtError) { this.#input.emit("error", error("WORKER_SOURCE_FAILED")); throw caughtError; }
    finally { this.#busy = false; }
  }

  /** One fixed side-effect-checked sample. No caller code or context selector. */
  public async observeWorkerState(): Promise<Readonly<RecordValue>> {
    const context = this.#workerContext;
    if (this.#stringPurpose || this.#workerStateConsumed || context === null || !this.#workerScriptConsumed) { throw error("WORKER_STATE_UNAVAILABLE"); }
    this.#enter(true); this.#workerStateConsumed = true;
    try {
      context.observeTargets(await this.#observeParent());
      const reply = await this.#transfer(() => this.#pipe.observeWorkerState(context.evaluationContext()));
      return context.finishState(reply, await this.#observeParent());
    } catch (caughtError) { this.#input.emit("error", error("WORKER_STATE_FAILED")); throw caughtError; }
    finally { this.#busy = false; }
  }

  /** Fixed read-only scope path in an already source-qualified PCB context.
   * No opened UI/worker or caller-provided handle can substitute for it. */
  public async observeModelState(): Promise<CurrentPcbDiagnosticModelObservation> {
    const context = this.#stagedContext;
    if (this.#stringPurpose || this.#modelConsumed || context === null || !this.#scriptConsumed || this.#inspectionConsumed ||
        this.#workersConsumed || this.#workerContext !== null ||
        this.#projectOpeningConsumed && !this.#pcbSourceQualified) { throw error("MODEL_OBSERVATION_UNAVAILABLE"); }
    this.#enter(true); this.#modelConsumed = true;
    try {
      await this.#verifyInstallation(); await this.#verify(); this.#available();
      const selected = context.modelContext();
      await this.#observeParent();
      const assertCurrent = (): void => {
        this.#available();
        if (JSON.stringify(context.modelContext()) !== JSON.stringify(selected)) { throw error("MODEL_CONTEXT_CHANGED"); }
      };
      const runner = new CurrentPcbDiagnosticModelRunner({
        request: (command): Promise<unknown> => this.#transfer(() => this.#pipe.observeModel(command)), assertCurrent,
      }, selected.scriptId, selected.uniqueContextId);
      const result = await runner.observe();
      if (this.#pcbSourceQualified && result.documentUuid !== this.#projectOpeningTarget?.documentUuid) { throw error("MODEL_DOCUMENT_CHANGED"); }
      assertCurrent(); await this.#observeParent();
      await this.#verifyInstallation(); await this.#verify(); this.#available(); assertCurrent();
      return result;
    } catch (caughtError) {
      this.#observationFailure ??= currentPcbObservationFailureDetail(caughtError);
      this.#input.emit("error", error("MODEL_OBSERVATION_FAILED")); throw caughtError;
    }
    finally { this.#busy = false; }
  }

  /** Separate pre-create generation only. It collects both original contexts
   * in one retained lifetime but does not qualify backend delivery or writing. */
  public async observeStringPrecreate(before?: Awaited<ReturnType<typeof readExactSqlInventory>>): Promise<Readonly<RecordValue>> {
    const context = this.#stagedContext, target = this.#projectOpeningTarget, worker = this.#workerContext;
    const pipe = this.#pipe;
    if (!this.#stringPurpose || !(pipe instanceof CurrentPcbStringPrecreatePipe) || this.#stringPrecreateConsumed || context === null || worker === null || target === null ||
        !this.#pcbSourceQualified || !this.#workerScriptConsumed || this.#modelConsumed || this.#workerStateConsumed) {
      throw error("STRING_PRECREATE_UNAVAILABLE");
    }
    this.#enter(true); this.#stringPrecreateConsumed = true;
    let phase: CurrentPcbObservationPhase = "owner";
    try {
      // Only synthetic owners without an admitted installation may omit SQL.
      // The lifecycle forwards its retained pre-navigation reader, never JSON.
      if (this.#installation !== null && before === undefined) { throw error("STRING_ORIGINAL_SQL_REQUIRED"); }
      if (before !== undefined) {
        const completion = readerCompletion(before);
        if (!completion.observedChildClose || completion.exitCode !== 0 || completion.exitSignal !== null) {
          throw error("STRING_ORIGINAL_SQL_REQUIRED");
        }
      }
      await this.#verifyInstallation(); await this.#verify(); this.#available();
      const selected = context.modelContext(), workerContext = worker.evaluationContext();
      const producerContext = worker.producerContext(), uiContext = context.pcbOpeningContext();
      const windowTabId = this.#projectOpeningResult?.observation?.windowTabId;
      if (windowTabId === undefined || windowTabId !== this.#pcbFrameObservation?.windowTabId) { throw error("STRING_WINDOW_CHANGED"); }
      const assertCurrent = (): void => {
        this.#available();
        if (this.#closeConsumed || this.#terminationObserved || this.#releaseConsumed || this.#pipe.status().failure !== null ||
            this.#terminationObservation?.originalRootExited === true || this.#terminationObservation?.originalJobEmpty === true ||
            this.#stagedContext !== context || this.#workerContext !== worker || this.#projectOpeningTarget !== target ||
            JSON.stringify(context.modelContext()) !== JSON.stringify(selected) || worker.evaluationContext() !== workerContext ||
            JSON.stringify(worker.producerContext()) !== JSON.stringify(producerContext) ||
            JSON.stringify(context.pcbOpeningContext()) !== JSON.stringify(uiContext)) {
          throw error("STRING_CONTEXT_CHANGED");
        }
      };
      const runner = new CurrentPcbStringPrecreateRunner({
        request: (command): Promise<unknown> => this.#transfer(() => "stringPhase" in command
          ? pipe.observeStringPrecreate(command) : pipe.observeModel(command)),
        assertCurrent,
        observeCurrent: async (): Promise<void> => { assertCurrent(); await this.#observeParent(); assertCurrent(); },
      }, selected.scriptId, selected.uniqueContextId, workerContext, { ...target, windowTabId });
      const result = await runner.observe();
      phase = "owner-observation";
      assertCurrent(); await this.#observeParent(); assertCurrent();
      phase = "worker-producers";
      this.#stringWorkerRunner = new CurrentPcbStringWorkerProducerRunner({
        request: (command): Promise<unknown> => this.#transfer(() => pipe.observeWorkerProducers(command)), assertCurrent,
      }, producerContext, { projectUuid: target.projectUuid, branchUuid: target.branchUuid, windowTabId });
      const workerProducers = await this.#stringWorkerRunner.observe();
      phase = "move-producers";
      this.#stringMoveRunner = new CurrentPcbStringMoveRunner({
        request: (command): Promise<unknown> => this.#transfer(() => pipe.observeMoveProducers(command)), assertCurrent,
      }, selected, { projectUuid: target.projectUuid, branchUuid: target.branchUuid, documentUuid: target.documentUuid, windowTabId });
      const moveProducers = await this.#stringMoveRunner.observe();
      const finiteEffects = inspectCurrentPcbStringFiniteEffects(this.#stringMoveRunner, moveProducers, this.#stringWorkerRunner, workerProducers);
      phase = "actor-clock";
      this.#stringActorRunner = new CurrentPcbStringActorClockRunner({
        request: (command): Promise<unknown> => this.#transfer(() => pipe.observeActorClock(command)), assertCurrent,
      }, { ui: uiContext.uniqueContextId, worker: workerContext, pcb: selected.uniqueContextId },
      { projectUuid: target.projectUuid, branchUuid: target.branchUuid, documentUuid: target.documentUuid, windowTabId });
      const actorClock = await this.#stringActorRunner.observe();
      phase = "owner-final";
      assertCurrent(); await this.#observeParent(); assertCurrent();
      assertCurrent(); await this.#verifyInstallation(); await this.#verify(); assertCurrent();
      this.#stringWorkerRunner.requireOriginal(workerProducers); this.#stringActorRunner.requireOriginalPacket(actorClock);
      this.#stringMoveRunner.requireOriginal(moveProducers);
      phase = "bounds";
      const combined = freezeDeep({ ...result, schema: "easyeda-pro-control.pcb-string-precreate-observation.v3", workerProducers, moveProducers, finiteEffects, actorClock });
      // V2's680KiB plus16KiB move/startup and16KiB finite-effect report.
      if (Buffer.byteLength(canonicalJson(actorClock)) > 131_072 || Buffer.byteLength(canonicalJson(moveProducers)) > 16_384 ||
          Buffer.byteLength(canonicalJson(finiteEffects)) > 16_384 || Buffer.byteLength(canonicalJson(combined)) > 729_088) { throw error("STRING_COMBINED_BOUND"); }
      if (before !== undefined) {
        const provenance = prepareCurrentPcbStringSaveProvenance(this.#stringActorRunner, actorClock, before);
        assertCurrent();
        this.#stringActorPacket = actorClock; this.#stringBeforeSql = before; this.#stringSaveProvenance = provenance;
      }
      return combined;
    } catch (caughtError) {
      const failure = currentPcbObservationFailureDetail(caughtError) === null ?
        currentPcbObservationFailure("STRING_PRECREATE", phase, [caughtError], currentPcbStringWorkerProducerFailureDetail(caughtError)?.cleanup === "failed" ||
          currentPcbStringMoveFailureDetail(caughtError)?.cleanup === "failed") : caughtError;
      this.#observationFailure ??= currentPcbObservationFailureDetail(failure);
      this.#input.emit("error", error("STRING_PRECREATE_FAILED")); throw failure;
    }
    finally { this.#busy = false; }
  }

  /** Private in-process composition only. A copied observation/SQL object is
   * never adopted, and closing the original owner invalidates this live source.
   * Attribution retains its explicit false backend/clock/writer authority. */
  public originalStringSaveProvenance(): CurrentPcbStringSaveProvenance {
    this.#available();
    if (!this.#stringPurpose || this.#busy || this.#closeConsumed || this.#terminationObserved || this.#releaseConsumed ||
        this.#stringActorRunner === null || this.#stringActorPacket === null || this.#stringBeforeSql === null ||
        this.#stringSaveProvenance === null) { throw error("STRING_ORIGINAL_PROVENANCE_UNAVAILABLE"); }
    return requireOriginalCurrentPcbStringSaveProvenance(this.#stringSaveProvenance,
      this.#stringActorRunner, this.#stringActorPacket, this.#stringBeforeSql);
  }

  /** Optional fixed common baseline, before the unchanged precreate attempt.
   * The enclosing lifecycle supplies only its original pre-navigation reader. */
  public async observeCommonBaseline(before: Awaited<ReturnType<typeof readExactSqlInventory>>): Promise<CurrentPcbCommonBaselineResult> {
    const context = this.#stagedContext, target = this.#projectOpeningTarget, worker = this.#workerContext;
    const pipe = this.#pipe;
    if (!this.#stringPurpose || !(pipe instanceof CurrentPcbStringPrecreatePipe) || this.#commonBaselineConsumed ||
        this.#stringPrecreateConsumed || context === null || worker === null || target === null ||
        !this.#pcbSourceQualified || !this.#workerScriptConsumed || this.#modelConsumed || this.#workerStateConsumed) {
      throw error("COMMON_BASELINE_UNAVAILABLE");
    }
    this.#enter(true); this.#commonBaselineConsumed = true;
    const identity = { projectUuid: target.projectUuid, branchUuid: target.branchUuid, documentUuid: target.documentUuid };
    const progress: { phase: CurrentPcbCommonBaselineFailure["phase"] } = { phase: "owner-before" };
    try {
      await this.#verifyInstallation(); await this.#verify(); this.#available();
      const selected = context.modelContext(), workerContext = worker.evaluationContext();
      const assertCurrent = (): void => {
        this.#available();
        if (this.#stagedContext !== context || this.#workerContext !== worker || this.#projectOpeningTarget !== target ||
            JSON.stringify(context.modelContext()) !== JSON.stringify(selected) || worker.evaluationContext() !== workerContext) {
          throw error("COMMON_CONTEXT_CHANGED");
        }
      };
      await this.#observeParent(); assertCurrent();
      const session = new CurrentPcbCommonBaselineSession({ before, identity, scriptId: selected.scriptId,
        uniqueContextId: selected.uniqueContextId, transport: {
          request: (command): Promise<unknown> => this.#transfer(() => pipe.observeCommonBaseline(command)), assertCurrent,
        } });
      this.#commonBaselineSession = session;
      const finishOwner = async (): Promise<void> => {
        progress.phase = "owner-after";
        assertCurrent(); await this.#observeParent(); assertCurrent();
        await this.#verifyInstallation(); await this.#verify(); assertCurrent();
      };
      let packet: Awaited<ReturnType<CurrentPcbCommonBaselineSession["observeAndJoin"]>>;
      try { packet = await session.observeAndJoin(); }
      catch (caughtError) {
        if (!session.comparisonRefused()) { throw caughtError; }
        // Only the original completed reader's comparison exception is eligible.
        // Native, decoder, cleanup and ownership exceptions never enter this path.
        session.requireOriginalComparisonRefusal(); await finishOwner();
        const observation = session.requireOriginalComparisonRefusal();
        this.#commonBaselineFailure = currentPcbCommonBaselineFailure(identity, "stored-relation", observation,
          session.retainedHistoricalHeader(), true);
        return currentPcbCommonBaselineRefusal(this.#commonBaselineFailure, sha256Json(observation));
      }
      await finishOwner();
      session.requireOriginalPacket(packet);
      return currentPcbCommonBaselineResult(packet);
    } catch (caughtError) {
      const session = this.#commonBaselineSession;
      this.#commonBaselineFailure = currentPcbCommonBaselineFailure(identity, progress.phase === "owner-after" ? progress.phase : session?.status().failurePhase ?? progress.phase,
        session?.retainedObservation() ?? null, session?.retainedHistoricalHeader() ?? null, false, session?.retainedFailure());
      this.#input.emit("error", error("COMMON_BASELINE_FAILED")); throw caughtError;
    } finally { this.#busy = false; }
  }

  /** Original retained diagnostic evidence only; callable after reader failure.
   * No historical JSON, new native dispatch or owner adoption is involved. */
  public retainedCommonBaselineFailure(): CurrentPcbCommonBaselineFailure | null { return this.#commonBaselineFailure; }

  async #observeParent(): Promise<RecordValue> {
    const context = this.#stagedContext;
    if (context === null) { throw error("WORKER_PARENT_UNAVAILABLE"); }
    context.assertCurrent();
    const targets = await this.#transfer(() => this.#pipe.getTargets());
    context.observeTarget(targets);
    context.observeFrames(await this.#transfer(() => this.#pipe.getFrameTree()));
    context.assertCurrent(); this.#workerContext?.assertCurrent();
    if (this.#stringPurpose) { this.#workerContext?.observeTargets(targets); }
    return targets;
  }

  /** Five bounded samples at original project/PCB boundaries. The native
   * protocol already supports these two fixed DOM reads. No caller selector,
   * source execution, editor-frame exception or native registry claim follows. */
  async #observeOpeningAncillary(): Promise<void> {
    const context = this.#stagedContext;
    if (context === null) { throw error("ANCILLARY_UNAVAILABLE"); }
    const frameId = context.openingAncillaryFrame();
    if (frameId === null) { return; }
    const owner = await this.#transfer(() => this.#pipe.getFrameOwner(frameId));
    if (context.openingAncillaryFrame() !== frameId) { throw error("ANCILLARY_CHANGED"); }
    const backend = owner["backendNodeId"];
    if (typeof backend !== "number" || !Number.isSafeInteger(backend) || backend < 1 || backend > 2_147_483_647) { throw error("ANCILLARY_BACKEND"); }
    const node = await this.#transfer(() => this.#pipe.describeFrameOwner(backend));
    context.observeOpeningAncillaryOwner(owner, node);
  }

  async #attach(context: CurrentPcbDiagnosticContext, targetId: string): Promise<void> {
    let sessionId: string | null = null;
    await this.#transfer(async () => {
      sessionId = await this.#pipe.attachTarget(targetId, event => { context.observeEvent(event); });
      return { sessionId };
    });
    if (sessionId === null) { throw error("ATTACH_REPLY"); }
    context.bindSession(sessionId);
    if (context === this.#stagedContext) { this.#stagedAttachment = Object.freeze({ targetId, sessionId }); }
  }

  async #inspectScript(context: CurrentPcbDiagnosticContext): Promise<Readonly<RecordValue>> {
    const runtime = await this.#transfer(() => this.#pipe.enableRuntime());
    if (!exact(runtime, [])) { throw error("RUNTIME_ENABLE_REPLY"); }
    const debuggerReply = await this.#transfer(() => this.#pipe.enableDebugger());
    if (!exact(debuggerReply, ["debuggerId"]) || typeof debuggerReply["debuggerId"] !== "string") { throw error("DEBUGGER_ENABLE_REPLY"); }
    const selected = context.script();
    const source = await this.#transfer(() => this.#pipe.getScriptSource(selected.scriptId));
    const targets = await this.#transfer(() => this.#pipe.getTargets());
    const frameTree = await this.#transfer(() => this.#pipe.getFrameTree());
    context.assertCurrent(); return context.finish(source, targets, frameTree);
  }

  /** One fixed identity-only attachment. Expectations are comparison inputs,
   * not native installation, project-worker or CAD execution authority. */
  public async inspectFrameIdentity(input: DiagnosticFrameExpectation): Promise<Readonly<Record<string, unknown>>> {
    const expected = validateDiagnosticFrameExpectation(input);
    if (this.#inspectionConsumed || this.#browserObservationConsumed) { throw error("INSPECTION_CONSUMED"); }
    this.#enter(true); this.#inspectionConsumed = true;
    const context = new CurrentPcbDiagnosticContext(expected);
    try {
      context.selectTarget(await this.#transfer(() => this.#pipe.getTargets()));
      await this.#attach(context, expected.targetId);
      const page = await this.#transfer(() => this.#pipe.enablePage());
      if (!exact(page, [])) { throw error("PAGE_ENABLE_REPLY"); }
      context.observeFrame(await this.#transfer(() => this.#pipe.getFrameTree()));
      return await this.#inspectScript(context);
    } catch (caughtError) {
      this.#input.emit("error", error("IDENTITY_FAILED")); throw caughtError;
    } finally { this.#busy = false; }
  }

  public async observeApplicationWindow(): Promise<string | null> {
    this.#enter(true);
    try {
      await this.#verify(); this.#available(); const reply = await this.#request({ action: "window" });
      await this.#verify(); this.#available();
      if (!exact(reply, ["hwnd"]) || (reply["hwnd"] !== null && (typeof reply["hwnd"] !== "string" || !/^[1-9]\d{0,18}$/u.test(reply["hwnd"])))) { throw error("WINDOW_REPLY"); }
      return reply["hwnd"];
    } finally { this.#busy = false; }
  }

  public async requestNormalClose(hwnd: string): Promise<void> {
    if (this.#closeConsumed) { throw error("CLOSE_CONSUMED"); }
    if (!/^[1-9]\d{0,18}$/u.test(hwnd)) { throw error("WINDOW_INPUT"); }
    this.#enter(true); this.#closeConsumed = true;
    try {
      await this.#verify(); this.#available();
      const reply = await this.#request({ action: "normal-close", hwnd, confirmNormalClose: true });
      if (!exact(reply, ["closeDispatched", "saveOrDiscardSelected"]) || reply["closeDispatched"] !== true || reply["saveOrDiscardSelected"] !== false) { throw error("CLOSE_REPLY"); }
      await this.#verify(); this.#available();
    } finally { this.#busy = false; }
  }

  public async observeTermination(): Promise<boolean> {
    this.#enter();
    try {
      await this.#verify(); this.#available(); const reply = terminationObservation(await this.#request({ action: "termination" }));
      await this.#verify(); this.#available();
      this.#terminationObservation = reply;
      if (reply.terminated) { this.#terminationObserved = true; }
      return reply.terminated;
    } finally { this.#busy = false; }
  }

  /** Private String-native clock boundary. Not a public validation action or a
   * Save permit. The future writer must journal and seal these original tokens
   * before closing; historical JSON cannot recreate this retained issuer. */
  public async observeStringNativeClock(phase: CurrentPcbStringNativeClockPhase): Promise<CurrentPcbStringNativeClockObservation> {
    const original = this.#binding;
    if (!this.#stringPurpose || original === null || !this.#launchSucceeded ||
        phase === "termination" && !this.#terminationObserved ||
        phase !== "termination" && (this.#terminationObserved || this.#pipe.status().failure !== null)) {
      throw error("STRING_NATIVE_CLOCK_UNAVAILABLE");
    }
    this.#enter(true);
    try {
      await this.#verifyInstallation(); await this.#verify(); this.#available();
      this.#stringNativeClock ??= new CurrentPcbStringNativeClockIssuer({
          request: async (request): Promise<unknown> => {
            await this.#verifyInstallation(); await this.#verify(); this.#available();
            const result = captureCurrentPcbStringClockReply(await this.#request({ ...request }));
            await this.#verifyInstallation(); await this.#verify(); this.#available(); return result.value;
          },
          assertCurrent: (selected): void => {
            this.#available();
            if (this.#binding !== original || !this.#launchSucceeded ||
                selected === "termination" && !this.#terminationObserved ||
                selected !== "termination" && (this.#terminationObserved || this.#pipe.status().failure !== null)) {
              throw error("STRING_NATIVE_CLOCK_OWNER_CHANGED");
            }
          },
        }, original);
      return await this.#stringNativeClock.observe(phase);
    } finally { this.#busy = false; }
  }

  public releaseClosed(): Promise<void> { return this.#release(false); }

  /** Original helper only, before this owner has ever invoked launch. Native
   * state independently proves no creation attempt and an empty original Job. */
  public async releaseUnlaunched(): Promise<void> {
    if (this.#launchConsumed || this.#binding !== null) { throw error("UNLAUNCHED_RELEASE_REFUSED"); }
    await this.#release(true);
  }

  /** A completed original launch refusal is not an uncertain dispatch. The
   * helper independently proves its creation phase and empty original Job. */
  public async releaseNoProcess(): Promise<Readonly<CurrentPcbDiagnosticNoProcessRelease>> {
    if (this.#releaseConsumed) { throw error("RELEASE_CONSUMED"); }
    if (!this.#noProcessCleanupAvailable()) { throw error("NO_PROCESS_CLEANUP_UNAVAILABLE"); }
    const launchRequestOutcome = this.#launchRequestIssued ? "native-refused" : "not-issued";
    this.#enter();
    try {
      await this.#verify(); this.#available();
      this.#releaseConsumed = true;
      const proof = noProcessState(await this.#request({ action: "release-no-process" }), true);
      if (launchRequestOutcome === "not-issued" ? proof.creationState !== "not-entered" : JSON.stringify(proof) !== JSON.stringify(this.#noProcessProof)) {
        throw error("NO_PROCESS_PROOF_CHANGED");
      }
      await this.#finishRelease();
      return Object.freeze({ launchRequestOutcome, ...proof, processCreated: false, released: true });
    } finally { this.#busy = false; }
  }

  #noProcessCleanupAvailable(): boolean {
    return this.#launchConsumed && this.#launchSettled && !this.#launchSucceeded && this.#binding === null &&
      !this.#busy && this.#pending === null && this.#failure === null && !this.#releaseConsumed && !this.#released &&
      !this.#childClosed && this.#child.exitCode === null && this.#child.signalCode === null &&
      (!this.#launchRequestIssued || this.#nativeLaunchRefused && this.#noProcessProof !== null);
  }

  async #release(unlaunched: boolean): Promise<void> {
    if (this.#releaseConsumed) { throw error("RELEASE_CONSUMED"); }
    this.#enter();
    try {
      await this.#verify(); this.#available();
      if (!unlaunched) {
        const termination = terminationObservation(await this.#request({ action: "termination" }));
        if (!termination.terminated) { throw error("RETAIN_LIVE_OWNER"); }
      }
      this.#releaseConsumed = true;
      // Native release independently observes original root and Job again.
      // A rejected live release consumes only this call, never closes a pipe.
      const reply = await this.#request({ action: unlaunched ? "release-unlaunched" : "release" });
      if (!exact(reply, unlaunched ? ["released", "launchNeverAttempted"] : ["released"]) || reply["released"] !== true ||
          unlaunched && reply["launchNeverAttempted"] !== true) { throw error("RELEASE_REPLY"); }
      await this.#finishRelease();
    } finally { this.#busy = false; }
  }

  async #finishRelease(): Promise<void> {
    this.#released = true;
    this.#child.stdin.end();
    await this.#closed.promise;
    if (this.#failure !== null) { throw error(this.#failure); }
    if (this.#child.exitCode !== 0 || this.#child.signalCode !== null) { throw error("RELEASE_EXIT"); }
    this.#input.destroy(); this.#output.destroy();
    // Local synthetic adapters only. Native pipes were released after closure.
    await delay(0); this.#pipe.releaseClosedListeners();
    retainedOwners.delete(this);
  }

  #available(): void {
    if (this.#failure !== null || this.#released || this.#childClosed || this.#child.exitCode !== null || this.#child.signalCode !== null) { throw error(this.#failure ?? "UNAVAILABLE"); }
  }
  #enter(requireLaunch = false): void {
    this.#available();
    if (this.#busy) { throw error("BUSY"); }
    if (requireLaunch && this.#binding === null) { throw error("NO_LAUNCH"); }
    this.#busy = true;
  }
  async #discover(kind: "version" | "targets"): Promise<RecordValue> {
    this.#enter(true);
    try { return await this.#transfer(() => kind === "version" ? this.#pipe.getVersion() : this.#pipe.getTargets()); }
    finally { this.#busy = false; }
  }
  async #transfer(request: () => Promise<RecordValue>): Promise<RecordValue> {
    try {
      if (!this.#launchSucceeded) { throw error("CLEANUP_ONLY"); }
      await this.#verify(); this.#available();
      const reply = request();
      // Attach rejection before any await, including the native write callback.
      const observed = (async (): Promise<{ value: RecordValue } | { cause: unknown }> => {
        try { return { value: await reply }; } catch (caughtError) { return { cause: caughtError }; }
      })();
      await this.#send;
      while (this.#pipe.status().pendingRequestId !== null) {
        this.#available(); const chunk = await this.#request({ action: "poll" });
        if (!exact(chunk, ["bytes"]) || typeof chunk["bytes"] !== "string" || chunk["bytes"].length > 87_384 ||
            !/^(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{2}==|[A-Za-z\d+/]{3}=)?$/u.test(chunk["bytes"])) { throw error("PIPE_CHUNK"); }
        const bytes = Buffer.from(chunk["bytes"], "base64");
        if (bytes.toString("base64") !== chunk["bytes"] || bytes.length > 65_536) { throw error("PIPE_CHUNK"); }
        if (bytes.length > 0) { this.#input.write(bytes); } else { await delay(20); }
      }
      const result = await observed;
      if ("cause" in result) {
        // Preserve only the native label already admitted by #data, never
        // Arbitrary PowerShell, OS, path, payload or exception text. This is a
        // Diagnostic cause, not proof that WriteFile was never entered.
        if (this.#nativeSendError !== null && result.cause instanceof Error &&
            result.cause.message === "PCB_DIAGNOSTIC_PIPE_OUTPUT") {
          throw new Error(`PCB_DIAGNOSTIC_PIPE_OUTPUT:${this.#nativeSendError}`);
        }
        throw result.cause;
      }
      await this.#verify(); this.#available(); return result.value;
    } catch (caughtError) {
      // A malformed helper chunk must poison discovery immediately, not leave
      // Its prior request pending until the byte transport's later deadline.
      // This local adapter error preserves every native endpoint and normal close.
      this.#input.emit("error", error("DISCOVERY_FAILED")); throw caughtError;
    }
  }
  // oxlint-disable-next-line promise/prefer-await-to-callbacks -- This adapter must settle the original Writable completion callback after native WriteFile.
  async #sendFrame(chunk: unknown, callback: (cause?: Error | null) => void): Promise<void> {
    try {
      if (!Buffer.isBuffer(chunk)) { throw error("OUTBOUND_FRAME"); }
      const result = await this.#request(this.#stringPurpose ? stringPrecreateNativeRequest(chunk) : diagnosticNativeRequest(chunk));
      if (!exact(result, ["written"]) || result["written"] !== true) { throw error("WRITE_ACK"); }
      // oxlint-disable-next-line promise/prefer-await-to-callbacks, eslint/no-useless-return -- Writable completion must be the terminal branch operation.
      callback(); return;
    } catch {
      // oxlint-disable-next-line promise/prefer-await-to-callbacks, eslint/no-useless-return -- Native failure settles the Writable callback as the terminal branch operation.
      callback(error("WRITE_FAILED")); return;
    }
  }
  #request(request: RecordValue): Promise<RecordValue> {
    this.#available();
    if (this.#pending !== null) { throw error("REQUEST_PENDING"); }
    const deferred = Promise.withResolvers<RecordValue>(), id = randomBytes(16).toString("hex");
    const launch = request["action"] === "launch";
    const pending: Pending = { id, resolve: deferred.resolve, reject: deferred.reject, launch, send: request["action"] === "send", written: false, reply: null,
      timer: setTimeout(() => { this.#fail("HELPER_DEADLINE"); }, 15_000) };
    this.#pending = pending;
    if (launch) { this.#launchRequestIssued = true; }
    try {
      const data = `${JSON.stringify({ ...this.#binding, ...request, id })}\n`;
      const maximum = request["action"] === "send" && request["method"] === "Runtime.callFunctionOn" &&
        (request["openingPhase"] === "preflight" || request["openingPhase"] === "open-project" ||
          request["pcbOpeningPhase"] === "preflight" || request["pcbOpeningPhase"] === "open-document" ||
          request["pcbOpeningPhase"] === "observe") ? 32_768 : 4096;
      if (Buffer.byteLength(data) > maximum) { throw error("REQUEST_SIZE"); }
      this.#child.stdin.write(data, cause => {
        if (cause !== null && cause !== undefined) { this.#fail("HELPER_WRITE"); }
        else if (this.#pending === pending) { pending.written = true; this.#settle(); }
      });
    } catch { this.#fail("HELPER_WRITE"); }
    return deferred.promise;
  }
  #settle(): void {
    const pending = this.#pending;
    if (pending !== null && pending.written && pending.reply !== null && this.#failure === null) {
      this.#pending = null; clearTimeout(pending.timer);
      const reply = pending.reply;
      if (reply["ok"] === false) {
        if (pending.send && typeof reply["error"] === "string") { this.#nativeSendError = reply["error"]; }
        if (pending.launch) {
          this.#nativeLaunchRefused = true;
          /* Data parsing admitted only the bounded fixed native label, never
           * arbitrary exception messages, command lines or paths. */
          this.#nativeLaunchError = typeof reply["error"] === "string" ? reply["error"] : null;
        }
        pending.reject(error("NATIVE_REFUSAL"));
      }
      else if (record(reply["result"])) { pending.resolve(reply["result"]); }
      else { pending.reject(error("HELPER_REPLY")); }
    }
  }
  #fail(reason: string): void {
    this.#failure ??= reason; this.#buffer = Buffer.alloc(0);
    const pending = this.#pending; this.#pending = null;
    if (pending !== null) { clearTimeout(pending.timer); pending.reject(error(this.#failure)); }
    // Do not end, destroy, signal, unref or detach this original helper.
  }
  readonly #data = (chunk: unknown): void => {
    if (this.#failure !== null) { return; }
    if (!Buffer.isBuffer(chunk) || chunk.length > MAX_LINE || this.#total + chunk.length > MAX_TOTAL || this.#buffer.length + chunk.length > MAX_LINE) { this.#fail("HELPER_BOUND"); return; }
    this.#total += chunk.length; this.#buffer = Buffer.concat([this.#buffer, chunk]);
    const newline = this.#buffer.indexOf(10);
    if (newline === -1) { return; }
    if (newline !== this.#buffer.length - 1) { this.#fail("HELPER_FRAMING"); return; }
    try {
      const raw = decodeCurrentPcbDiagnosticJson(this.#buffer.subarray(0, newline));
      const pending = this.#pending;
      if (!record(raw) || pending === null || pending.reply !== null || raw["id"] !== pending.id ||
          (raw["ok"] === true ? !exact(raw, ["id", "ok", "result"]) || !record(raw["result"]) :
            raw["ok"] !== false || !exact(raw, ["id", "ok", "error"]) || typeof raw["error"] !== "string" || !/^pcb-diagnostic-[a-z-]{1,80}$/u.test(raw["error"]))) { this.#fail("HELPER_REPLY"); return; }
      this.#buffer = Buffer.alloc(0); pending.reply = raw; this.#settle();
    } catch { this.#fail("HELPER_FRAMING"); }
  };
  readonly #stderr = (): void => { this.#fail("HELPER_STDERR"); };
  readonly #childError = (): void => { this.#fail("HELPER_ERROR"); };
  readonly #childClose = (): void => { this.#childClosed = true; if (!this.#released) { this.#fail("HELPER_CLOSED"); } this.#closed.resolve(null); };
}

/** Existing diagnostic facade retains103 requests and mutually exclusive
 * worker/PCB-model branches. Callers cannot select another purpose. */
export class CurrentPcbDiagnosticOwner extends CurrentPcbRetainedOwnerCore {
  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>,
    installation: CurrentPcbDiagnosticInstallation | null = null, verifyInstallation: () => Promise<void> = (): Promise<void> => Promise.resolve()) {
    super(child, verify, installation, verifyInstallation, false);
  }
}

/** Unregistered pre-create-only facade, with no create, Save or generic send. */
export class CurrentPcbStringPrecreateOwner extends CurrentPcbRetainedOwnerCore {
  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>,
    installation: CurrentPcbDiagnosticInstallation | null = null, verifyInstallation: () => Promise<void> = (): Promise<void> => Promise.resolve()) {
    super(child, verify, installation, verifyInstallation, true);
  }
}

// Only the validation lifecycle allocates this owner. It supplies no ordinary
// Windows runtime authority, bridge authentication or connected qualification.
export function startCurrentPcbDiagnosticOwner(options: CurrentPcbDiagnosticInstallationOptions): Promise<CurrentPcbDiagnosticOwner> {
  return startFixedOwner(options, false);
}
/** Called only by the separate String lifecycle, never diagnostic requests. */
export function startCurrentPcbStringPrecreateOwner(options: CurrentPcbDiagnosticInstallationOptions): Promise<CurrentPcbStringPrecreateOwner> {
  return startFixedOwner(options, true);
}
async function startFixedOwner(options: CurrentPcbDiagnosticInstallationOptions, stringPurpose: boolean): Promise<CurrentPcbDiagnosticOwner | CurrentPcbStringPrecreateOwner> {
  const sealedOptions = Object.freeze({ ...options });
  const installation = await verifyCurrentPcbDiagnosticInstallation(sealedOptions);
  if (fileURLToPath(new URL("../..", import.meta.url)) !== `${sealedOptions.pluginRoot}/`) { throw error("INSTALLATION_PLUGIN"); }
  const verifyInstallation = async (): Promise<void> => {
    const current = await verifyCurrentPcbDiagnosticInstallation(sealedOptions);
    if (current.facadeSha256 !== installation.facadeSha256 || JSON.stringify(current.plan) !== JSON.stringify(installation.plan)) { throw error("INSTALLATION_CHANGED"); }
  };
  const helperPath = fileURLToPath(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url));
  const before = await lstat(helperPath);
  const verify = async (): Promise<void> => {
    const first = await lstat(helperPath);
    if (!first.isFile() || first.isSymbolicLink() || first.nlink !== 1 || first.size !== HELPER_BYTES ||
        first.dev !== before.dev || first.ino !== before.ino || first.size !== before.size ||
        first.mtimeMs !== before.mtimeMs || first.ctimeMs !== before.ctimeMs || await realpath(helperPath) !== helperPath ||
        createHash("sha256").update(await readFile(helperPath)).digest("hex") !== HELPER_SHA256) { throw error("HELPER_SOURCE"); }
    const after = await lstat(helperPath);
    if (after.dev !== first.dev || after.ino !== first.ino || after.size !== first.size || after.mtimeMs !== first.mtimeMs || after.ctimeMs !== first.ctimeMs) { throw error("HELPER_SOURCE"); }
  };
  await verify();
  const distro = sealedOptions.wslDistribution ?? process.env["WSL_DISTRO_NAME"];
  let windowsPath: string;
  if (/^\/mnt\/[a-z]\//u.test(helperPath)) { windowsPath = `${helperPath[5]?.toUpperCase()}:\\${helperPath.slice(7).replaceAll("/", "\\")}`; }
  else {
    if (distro === undefined || !/^[A-Za-z\d][A-Za-z\d_.-]{0,127}$/u.test(distro)) { throw error("WSL_PATH"); }
    windowsPath = `\\\\wsl.localhost\\${distro}${helperPath.replaceAll("/", "\\")}`;
  }
  // PowerShell executes exactly the bytes hashed through this retained file.
  // A short encoded bootstrap avoids the Windows command-length limit for the
  // Entire native helper and avoids reopening a pathname after byte admission.
  const bootstrap = `$ErrorActionPreference='Stop';$ProgressPreference='SilentlyContinue';` +
    `$file=[IO.File]::Open('${windowsPath.replaceAll("'", "''")}',[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::Read);` +
    `try{if($file.Length -ne ${HELPER_BYTES}){throw 'pcb-diagnostic-helper-size'};$bytes=New-Object byte[] ([int]$file.Length);$offset=0;` +
    `while($offset -lt $bytes.Length){$count=$file.Read($bytes,$offset,$bytes.Length-$offset);if($count -le 0){throw 'pcb-diagnostic-helper-eof'};$offset+=$count};` +
    `$hash=[Security.Cryptography.SHA256]::Create();try{$digest=([BitConverter]::ToString($hash.ComputeHash($bytes))).Replace('-','').ToLowerInvariant()}finally{$hash.Dispose()};` +
    `if($digest -cne '${HELPER_SHA256}'){throw 'pcb-diagnostic-helper-hash'};` +
    `$decoder=New-Object Text.UTF8Encoding($false,$true);& ([ScriptBlock]::Create($decoder.GetString($bytes)))${stringPurpose ? " -StringPrecreate" : ""}}finally{$file.Dispose()}`;
  const encoded = Buffer.from(bootstrap, "utf16le").toString("base64");
  if (encoded.length > 16_000) { throw error("BOOTSTRAP_BOUND"); }
  const child = spawn(installation.paths.powershellExecutable,
    ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-EncodedCommand", encoded],
    { stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
  const owner = stringPurpose ? new CurrentPcbStringPrecreateOwner(child, verify, installation, verifyInstallation) :
    new CurrentPcbDiagnosticOwner(child, verify, installation, verifyInstallation);
  retainedOwners.add(owner); owner.start();
  return owner;
}
