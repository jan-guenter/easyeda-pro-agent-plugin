import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { canonicalJson, extractToolPayload, sha256Json } from "./core.ts";
import type {
  AuthenticatedBridgeSessionIdentity,
  ExecutionAuthorityCaptureInput,
  ExecutionAuthorityEvidence,
  ExecutionAuthorityTerminationInput,
  ExecutionAuthorityTerminationProof,
  RuntimeExecutionAuthorityValidator,
} from "./engine.ts";
import type { UpstreamEasyedaClient } from "./upstream.ts";
import { assertCurrentClosedSessionTerminationObservation, assertCurrentIssuedWindowsClockObservation, startWindowsAuthoritySupervisor, windowsClockObservationForResult } from "./windows-authority.ts";
import type {
  ClosedSessionBinding,
  ClosedSessionCloseIntent,
  ClosedSessionCloseReceipt,
  ClosedSessionTerminationObservation,
  ClosedSessionTerminationProof,
  IssuedCurrentWindowsClockObservation,
  IssuedWindowsClockObservation,
  WindowsApplicationWindowObservation,
  WindowsAuthorityLaunch,
  WindowsAuthorityStartOptions,
  WindowsAuthoritySupervisor,
  WindowsLaunchTerminationObservation,
  WindowsProcessProbe,
} from "./windows-authority.ts";

const PROBE_RESULT_SCHEMA = "easyeda-pro-control.windows-process-probe-result.v1";
const HASH = /^[a-f0-9]{64}$/u;
type ProbeUpstream = Pick<UpstreamEasyedaClient, "callTool" | "bridgeSessionLifecycle" | "currentAuthenticatedBridgeDispatchBinding">;

export interface WindowsControlRuntimeOptions {
  readonly upstream: ProbeUpstream;
  readonly pluginRoot: string;
  readonly assetsRoot: string;
  readonly reviewedExecutionScopeSha256: string;
  /** Capability-specific executable admission; never supplied by a tool caller. */
  readonly expectedExecutableSha256?: string;
  readonly expectedHelperSha256?: string;
  readonly wslDistribution?: string;
  readonly powershellExecutable?: string;
}

/** Dependency injection is for offline tests; production uses the reviewed implementations. */
export interface WindowsRuntimeDependencies {
  readonly startSupervisor?: (options: WindowsAuthorityStartOptions) => Promise<WindowsAuthoritySupervisor>;
  readonly hashExecutable?: (executablePath: string, assetsRoot: string) => Promise<string>;
}

export interface WindowsRuntimePaths {
  readonly assetsRoot: string;
  readonly executablePath: string;
  readonly executableWindowsPath: string;
  readonly helperPath: string;
  readonly helperWindowsPath: string;
  readonly powershellExecutable: string;
}

function canonicalHostPath(value: string): string {
  if (!path.posix.isAbsolute(value) || path.posix.normalize(value) !== value || value.includes("\\") || value.includes('"')) {
    throw new Error("Windows runtime requires an absolute canonical host path.");
  }
  for (let index = 0; index < value.length; index += 1) {
    const code = value.codePointAt(index);
    if (code !== undefined && (code < 32 || code === 127)) { throw new Error("Windows runtime paths cannot contain control characters."); }
  }
  return value;
}

function mountedWindowsPath(value: string): string {
  const match = /^\/mnt\/([a-z])\/(.+)$/u.exec(canonicalHostPath(value));
  const drive = match?.[1];
  const suffix = match?.[2];
  if (drive === undefined || suffix === undefined || suffix.includes(":")) {
    throw new Error("Windows runtime requires a canonical mounted Windows drive path.");
  }
  return `${drive.toUpperCase()}:\\${suffix.replaceAll("/", "\\")}`;
}

/** Pure path derivation; no native process, helper or bridge is started. */
export function deriveWindowsRuntimePaths(options: Omit<WindowsControlRuntimeOptions, "upstream" | "reviewedExecutionScopeSha256">): WindowsRuntimePaths {
  const assetsRoot = canonicalHostPath(options.assetsRoot);
  mountedWindowsPath(assetsRoot);
  if (!assetsRoot.endsWith("/resources/app/assets")) { throw new Error("EasyEDA assets must belong to the reviewed installed resources/app/assets tree."); }
  const executablePath = path.posix.resolve(assetsRoot, "../../..", "easyeda-pro.exe");
  const executableWindowsPath = mountedWindowsPath(executablePath);
  const helperPath = path.posix.join(canonicalHostPath(options.pluginRoot), "scripts/windows-authority.ps1");
  let helperWindowsPath: string;
  if (/^\/mnt\/[a-z]\//u.test(helperPath)) { helperWindowsPath = mountedWindowsPath(helperPath); }
  else {
    const distribution = options.wslDistribution ?? process.env["WSL_DISTRO_NAME"];
    if (distribution === undefined || !/^[A-Za-z0-9][A-Za-z0-9_.-]{0,127}$/u.test(distribution)) {
      throw new Error("A valid WSL distribution profile is required for the reviewed helper UNC path.");
    }
    helperWindowsPath = `\\\\wsl.localhost\\${distribution}${helperPath.replaceAll("/", "\\")}`;
  }
  const powershellExecutable = options.powershellExecutable ?? "/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe";
  mountedWindowsPath(powershellExecutable);
  if (!powershellExecutable.endsWith("/powershell.exe")) { throw new Error("Windows authority needs the configured PowerShell executable."); }
  return { assetsRoot, executablePath, executableWindowsPath, helperPath, helperWindowsPath, powershellExecutable };
}

/** Hash the exact installed executable without following links or accepting a changing file. */
async function hashInstalledExecutable(executablePath: string, assetsRoot: string): Promise<string> {
  const directory = await lstat(assetsRoot);
  if (!directory.isDirectory() || directory.isSymbolicLink() || await realpath(assetsRoot) !== assetsRoot ||
      await realpath(executablePath) !== executablePath || path.posix.resolve(assetsRoot, "../../..", "easyeda-pro.exe") !== executablePath) {
    throw new Error("EasyEDA executable and canonical installed assets do not agree.");
  }
  // oxlint-disable-next-line eslint/no-bitwise -- Combine the read-only and no-symlink OS open flags for the executable descriptor.
  const handle = await open(executablePath, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const before = await handle.stat();
    if (!before.isFile() || before.nlink !== 1 || before.size === 0 || before.size > 1_073_741_824) {
      throw new Error("EasyEDA executable is not a bounded single-link regular file.");
    }
    const digest = createHash("sha256");
    for await (const chunk of handle.createReadStream({ autoClose: false })) {
      if (!Buffer.isBuffer(chunk)) { throw new TypeError("Executable hashing returned non-binary data."); }
      digest.update(chunk);
    }
    const after = await handle.stat();
    const named = await lstat(executablePath);
    for (const candidate of [after, named]) {
      if (!candidate.isFile() || candidate.nlink !== 1 || candidate.dev !== before.dev || candidate.ino !== before.ino || candidate.size !== before.size || candidate.mtimeMs !== before.mtimeMs || candidate.ctimeMs !== before.ctimeMs) {
        throw new Error("EasyEDA executable changed during reviewed identity capture.");
      }
    }
    if (await realpath(executablePath) !== executablePath || await realpath(assetsRoot) !== assetsRoot) { throw new Error("EasyEDA installed paths changed during identity capture."); }
    return digest.digest("hex");
  } finally { await handle.close(); }
}

/** One fixed native loopback socket, under the current authenticated lease. No renderer/browser fallback. */
export function buildWindowsProcessProbeCode(session: AuthenticatedBridgeSessionIdentity, probe: WindowsProcessProbe): string {
  if (probe.schema !== "easyeda-pro-control.windows-process-probe.v1" || !HASH.test(probe.bindingSha256) || !HASH.test(probe.nonce) || !Number.isSafeInteger(probe.port) || probe.port <= 0 || probe.port > 65_535) {
    throw new Error("Windows process probe has an invalid fixed binding.");
  }
  const sessionSha256 = sha256Json(session);
  return `return await new Promise((resolve, reject) => {
    const expectedNonce = ${JSON.stringify(probe.nonce)};
    const socketId = "easyeda-control-authority-probe-" + expectedNonce;
    const timerId = socketId + "-deadline";
    const socket = eda.sys_WebSocket;
    const timers = eda.sys_Timer;
    if (!socket || typeof socket.register !== "function" || typeof socket.close !== "function" || !timers || typeof timers.setTimeoutTimer !== "function" || typeof timers.clearTimeoutTimer !== "function") {
      reject(new Error("WINDOWS_PROBE_NATIVE_API_UNAVAILABLE")); return;
    }
    let settled = false;
    let timerInstalled = false;
    let socketAttempted = false;
    let opened = false;
    const finish = (accepted) => {
      if (settled) return;
      settled = true;
      let timerCleared = !timerInstalled;
      let socketClosed = !socketAttempted;
      try { if (timerInstalled) timerCleared = timers.clearTimeoutTimer(timerId) === true; } catch { timerCleared = false; }
      try { if (socketAttempted) socketClosed = socket.close(socketId, 1000, "ownership-probe-complete") === undefined; } catch { socketClosed = false; }
      if (!accepted || !opened || !timerCleared || !socketClosed) { reject(new Error("WINDOWS_PROBE_NOT_PROVEN")); return; }
      resolve({schema:${JSON.stringify(PROBE_RESULT_SCHEMA)},bindingSha256:${JSON.stringify(probe.bindingSha256)},sessionSha256:${JSON.stringify(sessionSha256)},ok:true,socketClosed:true,timerCleared:true});
    };
    try {
      timerInstalled = timers.setTimeoutTimer(timerId, 9000, () => finish(false)) === true;
      if (!timerInstalled) { finish(false); return; }
      socketAttempted = true;
      socket.register(socketId, ${JSON.stringify(`ws://127.0.0.1:${probe.port}/${probe.nonce}`)}, (event) => {
        if (settled) return;
        const data = typeof event === "string" ? event : event && typeof event === "object" ? event.data : undefined;
        if (typeof data !== "string" || data.length > 128) { finish(false); return; }
        try {
          const message = JSON.parse(data);
          const accepted = message !== null && typeof message === "object" && !Array.isArray(message) && Object.keys(message).sort().join(",") === "kind,nonce" && message.kind === "easyeda-authority-probe" && message.nonce === expectedNonce;
          finish(accepted);
        } catch { finish(false); }
      }, () => { if (!settled) opened = true; });
    } catch { finish(false); }
  });`;
}

function assertCurrentSession(upstream: ProbeUpstream, session: AuthenticatedBridgeSessionIdentity): void {
  const lifecycle = upstream.bridgeSessionLifecycle();
  const active = lifecycle?.activeSession;
  const binding = upstream.currentAuthenticatedBridgeDispatchBinding();
  if (lifecycle === undefined || active === undefined || active === null || binding === undefined ||
      lifecycle.gatewayInstanceId !== session.gatewayInstanceId || binding.gatewayInstanceId !== session.gatewayInstanceId ||
      binding.sessionId !== session.sessionId || binding.sessionSequence !== session.sequence ||
      canonicalJson({ ...active, gatewayInstanceId: lifecycle.gatewayInstanceId }) !== canonicalJson(session)) {
    throw new Error("Windows process probe requires the exact current authenticated session and dispatch lease.");
  }
}

export async function performWindowsAuthenticatedProcessProbe(upstream: ProbeUpstream, session: AuthenticatedBridgeSessionIdentity, probe: WindowsProcessProbe): Promise<void> {
  assertCurrentSession(upstream, session);
  const binding = upstream.currentAuthenticatedBridgeDispatchBinding();
  const code = buildWindowsProcessProbeCode(session, probe);
  const result = await upstream.callTool("easyeda_execute", { code, timeoutMs: 10_000, confirmWrite: true }, 12_000, binding);
  assertCurrentSession(upstream, session);
  const payload = extractToolPayload(result);
  const expected = { schema: PROBE_RESULT_SCHEMA, bindingSha256: probe.bindingSha256, sessionSha256: sha256Json(session), ok: true, socketClosed: true, timerCleared: true };
  if (canonicalJson(payload) !== canonicalJson(expected)) { throw new Error("Windows process probe did not return its exact nonce-free cleanup proof."); }
}

export interface WindowsControlRuntimeStatus {
  readonly state: "not-launched" | "launching" | "owned" | "launch-unknown" | "released";
  readonly launch: WindowsAuthorityLaunch | null;
  readonly executableSha256: string | null;
  readonly reviewedExecutionScopeSha256: string;
}

export class WindowsControlRuntime implements RuntimeExecutionAuthorityValidator {
  private readonly options: WindowsControlRuntimeOptions;
  private readonly dependencies: WindowsRuntimeDependencies;
  private readonly paths: WindowsRuntimePaths;
  private supervisor: WindowsAuthoritySupervisor | undefined;
  private readonly supervisorClockMethods = new WeakMap<WindowsAuthoritySupervisor, {
    readonly observe: WindowsAuthoritySupervisor["observeCurrentClock"];
    readonly capture: WindowsAuthoritySupervisor["capture"];
  }>();
  private currentLaunch: WindowsAuthorityLaunch | null = null;
  private readonly clockLaunches = new WeakMap<WindowsAuthorityLaunch, {
    readonly original: WindowsAuthorityLaunch; readonly snapshot: string; readonly supervisor: WindowsAuthoritySupervisor;
  }>();
  private state: WindowsControlRuntimeStatus["state"] = "not-launched";
  private executableSha256: string | null = null;
  private readonly closedSessionLaunches = new Map<string, {
    readonly intent: ClosedSessionCloseIntent;
    readonly launch: WindowsAuthorityLaunch;
  }>();

  public constructor(options: WindowsControlRuntimeOptions, dependencies: WindowsRuntimeDependencies = {}) {
    if (!HASH.test(options.reviewedExecutionScopeSha256)) { throw new Error("Reviewed Windows execution scope identity is missing."); }
    if (options.expectedExecutableSha256 !== undefined && !HASH.test(options.expectedExecutableSha256)) {
      throw new Error("Reviewed Windows executable identity is invalid.");
    }
    if (options.expectedHelperSha256 !== undefined && !HASH.test(options.expectedHelperSha256)) {
      throw new Error("Reviewed Windows helper identity is invalid.");
    }
    this.options = options;
    this.dependencies = dependencies;
    this.paths = deriveWindowsRuntimePaths(options);
  }

  /** Explicit launch only; constructor/status/capture never start an application. */
  public async launch(): Promise<WindowsAuthorityLaunch> {
    if (this.state === "released" || this.state === "launching" || this.state === "launch-unknown") { throw new Error("Windows runtime cannot start another application from its current state."); }
    this.state = "launching";
    try {
      const supervisor = await this.ensureSupervisor();
      const launch = await supervisor.launch({ confirmLaunch: true });
      this.currentLaunch = structuredClone(launch);
      this.state = "owned";
      const returned = structuredClone(launch);
      this.clockLaunches.set(returned, { original: launch, snapshot: canonicalJson(returned), supervisor });
      return returned;
    } catch (error) { this.state = "launch-unknown"; throw error; }
  }

  private async ensureSupervisor(): Promise<WindowsAuthoritySupervisor> {
    if (this.supervisor !== undefined) { return this.supervisor; }
    const expectedState = this.state;
    const hashExecutable = this.dependencies.hashExecutable ?? hashInstalledExecutable;
    const executableSha256 = await hashExecutable(this.paths.executablePath, this.paths.assetsRoot);
    if (!HASH.test(executableSha256)) { throw new Error("Installed EasyEDA executable identity is invalid."); }
    if (this.options.expectedExecutableSha256 !== undefined && executableSha256 !== this.options.expectedExecutableSha256) {
      throw new Error("Installed EasyEDA executable differs from the reviewed launch profile.");
    }
    this.executableSha256 = executableSha256;
    if (this.state !== expectedState) { throw new Error("Windows runtime changed before helper startup."); }
    const start = this.dependencies.startSupervisor ?? startWindowsAuthoritySupervisor;
    this.supervisor = await start({
      powershellExecutable: this.paths.powershellExecutable, helperPath: this.paths.helperPath, helperWindowsPath: this.paths.helperWindowsPath,
      expectedExecutable: this.paths.executableWindowsPath, expectedExecutableSha256: executableSha256,
      ...(this.options.expectedHelperSha256 === undefined ? {} : { expectedHelperSha256: this.options.expectedHelperSha256 }),
      reviewedExecutionScopeSha256: this.options.reviewedExecutionScopeSha256,
      performAuthenticatedProcessProbe: (session, probe) => performWindowsAuthenticatedProcessProbe(this.options.upstream, session, probe),
    });
    if (this.state !== expectedState) {
      const acquired = this.supervisor;
      this.supervisor = undefined;
      await acquired.release();
      throw new Error("Windows runtime changed during helper startup.");
    }
    // Identity only. Calls below retain their original supervisor receiver.
    this.supervisorClockMethods.set(this.supervisor, { observe: this.supervisor.observeCurrentClock, capture: this.supervisor.capture });
    return this.supervisor;
  }

  /** Starts only the proof helper, not EasyEDA. Existing instances are observed
   * without adoption, close, bridge calls or a consumed application attempt.
   */
  public async observeExistingApplication(): Promise<{ readonly running: boolean }> {
    if (this.state !== "not-launched" && this.state !== "owned") {
      throw new Error("Windows runtime cannot observe an existing application from its current state.");
    }
    const previousState = this.state;
    const supervisor = await this.ensureSupervisor();
    if (supervisor.observeExistingApplication === undefined) { throw new Error("Existing application observation is unavailable."); }
    const observation = await supervisor.observeExistingApplication();
    if (this.supervisor !== supervisor || this.state !== previousState || typeof observation.running !== "boolean") {
      throw new Error("Windows runtime changed during existing application observation.");
    }
    return observation;
  }

  /** Exact original runtime return only. This reads a clock fact, never launches. */
  public async clockObservationForLaunch(launch: WindowsAuthorityLaunch): Promise<IssuedWindowsClockObservation> {
    const slot = this.clockLaunches.get(launch);
    const current = (): void => {
      if (slot === undefined || this.requireSupervisor() !== slot.supervisor ||
          canonicalJson(launch) !== slot.snapshot || canonicalJson(this.currentLaunch) !== slot.snapshot) {
        throw new Error("Runtime clock lookup requires the unchanged original current launch.");
      }
    };
    current();
    if (slot === undefined) { throw new Error("Original runtime clock launch is missing."); }
    const observation = await windowsClockObservationForResult(slot.original, "launch"); current(); return observation;
  }

  private requireSupervisor(): WindowsAuthoritySupervisor {
    if (this.state !== "owned" || this.supervisor === undefined || this.currentLaunch === null) { throw new Error("Windows authority requires the explicitly launched supervised runtime."); }
    return this.supervisor;
  }

  public capture(input: ExecutionAuthorityCaptureInput): Promise<ExecutionAuthorityEvidence> { return this.requireSupervisor().capture(input); }
  public proveTerminated(input: ExecutionAuthorityTerminationInput): Promise<ExecutionAuthorityTerminationProof> { return this.requireSupervisor().proveTerminated(input); }
  public releaseCapture(evidence: ExecutionAuthorityEvidence): Promise<void> { return this.requireSupervisor().releaseCapture(evidence); }

  /** Internal fresh read from the original capture. Never starts or adopts a helper. */
  public async observeCurrentClock(evidence: ExecutionAuthorityEvidence): Promise<IssuedCurrentWindowsClockObservation> {
    const supervisor = this.requireSupervisor();
    const methods = this.supervisorClockMethods.get(supervisor);
    const observe = methods?.observe;
    if (observe === undefined) { throw new Error("Retained runtime has no original fresh-clock method."); }
    const evidenceText = canonicalJson(evidence), launch = this.currentLaunch, launchText = canonicalJson(launch);
    const current = (): void => {
      if (this.requireSupervisor() !== supervisor || this.currentLaunch !== launch || canonicalJson(this.currentLaunch) !== launchText ||
          this.supervisorClockMethods.get(supervisor) !== methods || supervisor.observeCurrentClock !== observe ||
          supervisor.capture !== methods?.capture || canonicalJson(evidence) !== evidenceText) {
        throw new Error("Fresh runtime clock lost its original capture, supervisor, method or launch.");
      }
    };
    current();
    const observation = await observe.call(supervisor, evidence); current();
    const issued = assertCurrentIssuedWindowsClockObservation(observation);
    if (issued !== observation || observation.phase !== "owned-observation" || launch === null ||
        observation.base["jobId"] !== launch.jobId || observation.base["helperInstance"] !== launch.helperInstance ||
        observation.base["captureBindingSha256"] !== evidence.bindingSha256 ||
        observation.ownerBinding["bindingSha256"] !== evidence.bindingSha256 ||
        observation.ownerBinding["authoritySha256"] !== evidence.authoritySha256) {
      throw new Error("Fresh runtime clock returned another original capture or launch.");
    }
    current(); return observation;
  }

  /** Internal coordinator-only preparation; never starts a helper or application. */
  public async prepareClosedSessionClose(input: Omit<ClosedSessionBinding, "launch"> & {
    readonly windowHandle: string;
  }): Promise<ClosedSessionCloseIntent> {
    const bound = structuredClone(input);
    const supervisor = this.requireSupervisor();
    const launch = structuredClone(this.currentLaunch);
    if (launch === null) { throw new Error("Closed-session launch identity is missing."); }
    const intent = await supervisor.prepareClosedSessionClose({ ...bound, launch });
    if (this.requireSupervisor() !== supervisor || canonicalJson(this.currentLaunch) !== canonicalJson(launch)) {
      throw new Error("Windows runtime ownership changed during closed-session preparation.");
    }
    this.closedSessionLaunches.set(intent.closeIntentSha256, { intent: structuredClone(intent), launch });
    return intent;
  }

  private closedSessionLaunch(intent: ClosedSessionCloseIntent): WindowsAuthorityLaunch {
    this.requireSupervisor();
    const retained = this.closedSessionLaunches.get(intent.closeIntentSha256);
    if (retained === undefined || canonicalJson(retained.intent) !== canonicalJson(intent)) {
      throw new Error("Closed-session intent was not prepared by this Windows runtime.");
    }
    return structuredClone(retained.launch);
  }

  public requestClosedSessionNormalClose(input: Omit<ClosedSessionBinding, "launch"> & {
    readonly intent: ClosedSessionCloseIntent; readonly confirmNormalClose: true;
  }): Promise<ClosedSessionCloseReceipt> {
    const bound = structuredClone(input);
    const launch = this.closedSessionLaunch(bound.intent);
    return this.requireSupervisor().requestClosedSessionNormalClose({ ...bound, launch });
  }

  public proveClosedSession(input: Omit<ClosedSessionBinding, "launch"> & {
    readonly intent: ClosedSessionCloseIntent; readonly closeReceipt: ClosedSessionCloseReceipt;
  }): Promise<ClosedSessionTerminationProof> {
    const bound = structuredClone(input);
    const launch = this.closedSessionLaunch(bound.intent);
    return this.requireSupervisor().proveClosedSession({ ...bound, launch });
  }

  public async probeClosedSessionTermination(input: Omit<ClosedSessionBinding, "launch"> & {
    readonly intent: ClosedSessionCloseIntent; readonly closeReceipt: ClosedSessionCloseReceipt;
  }): Promise<ClosedSessionTerminationObservation> {
    const bound = structuredClone(input), callerText = canonicalJson(input);
    const launch = this.closedSessionLaunch(bound.intent), supervisor = this.requireSupervisor();
    const observation = await supervisor.probeClosedSessionTermination({ ...bound, launch });
    if (this.requireSupervisor() !== supervisor || canonicalJson(input) !== callerText ||
        canonicalJson(this.currentLaunch) !== canonicalJson(launch) ||
        canonicalJson(this.closedSessionLaunch(bound.intent)) !== canonicalJson(launch)) {
      throw new Error("Windows runtime ownership changed during the closed-session probe.");
    }
    assertCurrentClosedSessionTerminationObservation(observation);
    return observation;
  }

  public async normalClose(windowHandle: string): Promise<void> {
    const supervisor = this.requireSupervisor();
    const launch = structuredClone(this.currentLaunch);
    if (launch === null) { throw new Error("Windows application launch identity is missing."); }
    await supervisor.requestNormalClose({ confirmNormalClose: true, windowHandle, launch });
    if (this.requireSupervisor() !== supervisor || canonicalJson(this.currentLaunch) !== canonicalJson(launch)) {
      throw new Error("Retained launch identity changed during normal close; do not repeat close.");
    }
  }

  /** Read-only bounded window observation from the retained helper, without
   * Computer Use, title disclosure, focus changes or launch adoption.
   */
  public async observeApplicationWindow(): Promise<WindowsApplicationWindowObservation> {
    const launch = structuredClone(this.currentLaunch), supervisor = this.requireSupervisor();
    if (launch === null || supervisor.observeApplicationWindow === undefined) {
      throw new Error("Retained application window observation is unavailable.");
    }
    const observation = await supervisor.observeApplicationWindow(launch);
    if (this.requireSupervisor() !== supervisor || canonicalJson(this.currentLaunch) !== canonicalJson(launch) ||
        Object.keys(observation).toSorted().join(",") !== "helperInstance,hwnd,jobId,outcome" ||
        observation.jobId !== launch.jobId || observation.helperInstance !== launch.helperInstance ||
        (observation.outcome !== "available" && observation.outcome !== "unavailable" && observation.outcome !== "ambiguous") ||
        (observation.outcome === "available" ? typeof observation.hwnd !== "string" || !/^[1-9]\d{0,18}$/u.test(observation.hwnd) : observation.hwnd !== null)) {
      throw new Error("Retained launch identity or window changed during application window observation.");
    }
    return observation;
  }

  /** Read only: a true result requires this helper's original root and Job to
   * have exited. It never requests closure or reacquires lost process handles.
   */
  public async observeLaunchTermination(): Promise<WindowsLaunchTerminationObservation> {
    const supervisor = this.requireSupervisor();
    const launch = structuredClone(this.currentLaunch);
    if (launch === null || supervisor.observeLaunchTermination === undefined) {
      throw new Error("Retained launch termination observation is unavailable.");
    }
    const observation = await supervisor.observeLaunchTermination(launch);
    if (this.requireSupervisor() !== supervisor || canonicalJson(this.currentLaunch) !== canonicalJson(launch) ||
        observation.jobId !== launch.jobId || observation.helperInstance !== launch.helperInstance ||
        typeof observation.terminated !== "boolean") {
      throw new Error("Retained launch identity changed during termination observation.");
    }
    return observation;
  }

  public async release(): Promise<void> {
    if (this.state === "launching") { throw new Error("Cannot release Windows proof authority during launch."); }
    this.state = "released";
    this.currentLaunch = null;
    this.closedSessionLaunches.clear();
    const supervisor = this.supervisor;
    this.supervisor = undefined;
    await supervisor?.release();
  }

  public status(): WindowsControlRuntimeStatus {
    return { state: this.state, launch: structuredClone(this.currentLaunch), executableSha256: this.executableSha256, reviewedExecutionScopeSha256: this.options.reviewedExecutionScopeSha256 };
  }
}
