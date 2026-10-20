/** Separate validation-only diagnostic launch path.
 * Its retained helper owns the original process, non-breakaway Job and pipes.
 * A diagnostic failure never ends stdin or closes an Electron pipe. The only
 * release path first proves original root and complete Job termination.
 * Browser discovery grants no frame, worker, script or CAD execution authority. */
/* oxlint-disable import/max-dependencies -- This owner composes separately audited native installation, fixed protocol, identity observation and original process/pipe cleanup boundaries. */
import { spawn } from "node:child_process";
import type { ChildProcessWithoutNullStreams } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { lstat, readFile, realpath } from "node:fs/promises";
import process from "node:process";
import { PassThrough, Writable } from "node:stream";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { CurrentPcbDiagnosticPipe, decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-pipe.ts";
import { diagnosticNativeRequest } from "./current-pcb-diagnostic-protocol.ts";
import { CurrentPcbDiagnosticContext, diagnosticBoundedObservation, diagnosticTargetInventory, diagnosticTargetSummary,
  validateDiagnosticFrameExpectation, validateDiagnosticScriptProfile } from "./current-pcb-diagnostic-context.ts";
import type { DiagnosticFrameExpectation, DiagnosticScriptProfile } from "./current-pcb-diagnostic-context.ts";
import { CurrentPcbDiagnosticWorkerContext } from "./current-pcb-diagnostic-worker-context.ts";
import type { DiagnosticWorkerScriptProfile } from "./current-pcb-diagnostic-worker-context.ts";
import { verifyCurrentPcbDiagnosticInstallation } from "./current-pcb-diagnostic-installation.ts";
import type { CurrentPcbDiagnosticInstallation, CurrentPcbDiagnosticInstallationOptions } from "./current-pcb-diagnostic-installation.ts";

const HELPER_SHA256 = "8060c09d393064992c5640829c6ac565660263d888cd24503ff6c3dddbcd4c58";
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
  readonly timer: ReturnType<typeof setTimeout>; readonly launch: boolean; written: boolean; reply: RecordValue | null;
}
function record(value: unknown): value is RecordValue { return value !== null && typeof value === "object" && !Array.isArray(value); }
function exact(value: RecordValue, fields: readonly string[]): boolean { return Object.keys(value).toSorted().join(",") === fields.toSorted().join(","); }
function error(code: string): Error { return new Error(`PCB_DIAGNOSTIC_OWNER_${code}`); }
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
 * Only startCurrentPcbDiagnosticOwner checks packaged helper source. Neither
 * constructor nor successful discovery grants current runtime admission. */
export class CurrentPcbDiagnosticOwner {
  readonly #child: ChildProcessWithoutNullStreams;
  readonly #verify: () => Promise<void>;
  readonly #verifyInstallation: () => Promise<void>;
  readonly #installation: CurrentPcbDiagnosticInstallation | null;
  readonly #input = new PassThrough({ autoDestroy: false });
  readonly #output: Writable;
  readonly #pipe: CurrentPcbDiagnosticPipe;
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

  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>,
    installation: CurrentPcbDiagnosticInstallation | null = null, verifyInstallation: () => Promise<void> = (): Promise<void> => Promise.resolve()) {
    this.#child = child; this.#verify = verify; this.#installation = installation; this.#verifyInstallation = verifyInstallation;
    this.#output = new Writable({ autoDestroy: false,
      // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Writable requires its original callback, acknowledged only after native WriteFile.
      write: (chunk: unknown, _encoding, callback): void => {
        this.#send = this.#sendFrame(chunk, callback);
      },
    });
    this.#pipe = new CurrentPcbDiagnosticPipe(this.#input, this.#output);
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
    nativeLaunchError: string | null; createProcessError: number | null;
    browserObservationConsumed: boolean; frameInspectionConsumed: boolean; scriptInspectionConsumed: boolean; diagnosticFailure: string | null }> {
    return Object.freeze({ helperPid: this.#child.pid ?? null, binding: this.#binding, failure: this.#failure,
      busy: this.#busy, launchConsumed: this.#launchConsumed, closeConsumed: this.#closeConsumed,
      released: this.#released, helperClosed: this.#childClosed, cleanupOnly: this.#binding !== null && !this.#launchSucceeded,
      noProcessCleanupAvailable: this.#noProcessCleanupAvailable(), frameWorkerVerified: false, executionAuthorized: false, browserObservationConsumed: this.#browserObservationConsumed,
      nativeLaunchError: this.#nativeLaunchError, createProcessError: this.#noProcessProof?.createProcessError ?? null,
      frameInspectionConsumed: this.#framesConsumed, scriptInspectionConsumed: this.#scriptConsumed, diagnosticFailure: this.#pipe.status().failure });
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

  /** Fixed parent-only child reporting. The optional profile is an internal
   * synthetic-test seam, never part of the public lifecycle request. */
  public async inspectWorkers(profile?: DiagnosticWorkerScriptProfile): Promise<Readonly<RecordValue>> {
    const attachment = this.#stagedAttachment;
    if (this.#workersConsumed || this.#stagedContext === null || attachment === null || this.#inspectionConsumed) {
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
    if (this.#workerStateConsumed || context === null || !this.#workerScriptConsumed) { throw error("WORKER_STATE_UNAVAILABLE"); }
    this.#enter(true); this.#workerStateConsumed = true;
    try {
      context.observeTargets(await this.#observeParent());
      const reply = await this.#transfer(() => this.#pipe.observeWorkerState(context.evaluationContext()));
      return context.finishState(reply, await this.#observeParent());
    } catch (caughtError) { this.#input.emit("error", error("WORKER_STATE_FAILED")); throw caughtError; }
    finally { this.#busy = false; }
  }

  async #observeParent(): Promise<RecordValue> {
    const context = this.#stagedContext;
    if (context === null) { throw error("WORKER_PARENT_UNAVAILABLE"); }
    context.assertCurrent();
    const targets = await this.#transfer(() => this.#pipe.getTargets());
    context.observeTarget(targets);
    context.observeFrames(await this.#transfer(() => this.#pipe.getFrameTree()));
    context.assertCurrent(); this.#workerContext?.assertCurrent();
    return targets;
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
      await this.#verify(); this.#available(); const reply = await this.#request({ action: "termination" });
      await this.#verify(); this.#available();
      if (!exact(reply, ["terminated"]) || typeof reply["terminated"] !== "boolean") { throw error("TERMINATION_REPLY"); }
      return reply["terminated"];
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
        const termination = await this.#request({ action: "termination" });
        if (!exact(termination, ["terminated"]) || termination["terminated"] !== true) { throw error("RETAIN_LIVE_OWNER"); }
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
      if ("cause" in result) { throw result.cause; }
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
      const result = await this.#request(diagnosticNativeRequest(chunk));
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
    const pending: Pending = { id, resolve: deferred.resolve, reject: deferred.reject, launch, written: false, reply: null,
      timer: setTimeout(() => { this.#fail("HELPER_DEADLINE"); }, 15_000) };
    this.#pending = pending;
    if (launch) { this.#launchRequestIssued = true; }
    try {
      const data = `${JSON.stringify({ ...this.#binding, ...request, id })}\n`;
      if (Buffer.byteLength(data) > 4096) { throw error("REQUEST_SIZE"); }
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

// Only the validation lifecycle allocates this owner. It supplies no ordinary
// Windows runtime authority, bridge authentication or connected qualification.
export async function startCurrentPcbDiagnosticOwner(options: CurrentPcbDiagnosticInstallationOptions): Promise<CurrentPcbDiagnosticOwner> {
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
    if (!first.isFile() || first.isSymbolicLink() || first.nlink !== 1 || first.size > 65_536 ||
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
    `try{if($file.Length -gt 65536){throw 'pcb-diagnostic-helper-size'};$bytes=New-Object byte[] ([int]$file.Length);$offset=0;` +
    `while($offset -lt $bytes.Length){$count=$file.Read($bytes,$offset,$bytes.Length-$offset);if($count -le 0){throw 'pcb-diagnostic-helper-eof'};$offset+=$count};` +
    `$hash=[Security.Cryptography.SHA256]::Create();try{$digest=([BitConverter]::ToString($hash.ComputeHash($bytes))).Replace('-','').ToLowerInvariant()}finally{$hash.Dispose()};` +
    `if($digest -cne '${HELPER_SHA256}'){throw 'pcb-diagnostic-helper-hash'};` +
    `$decoder=New-Object Text.UTF8Encoding($false,$true);& ([ScriptBlock]::Create($decoder.GetString($bytes)))}finally{$file.Dispose()}`;
  const encoded = Buffer.from(bootstrap, "utf16le").toString("base64");
  if (encoded.length > 16_000) { throw error("BOOTSTRAP_BOUND"); }
  const child = spawn(installation.paths.powershellExecutable,
    ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-EncodedCommand", encoded],
    { stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
  const owner = new CurrentPcbDiagnosticOwner(child, verify, installation, verifyInstallation); retainedOwners.add(owner); owner.start();
  return owner;
}
