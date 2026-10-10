import { spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { lstat, readFile, realpath } from "node:fs/promises";
import { isIP } from "node:net";
import path from "node:path";

import { canonicalJson, sha256Json } from "./core.ts";
import type {
  AuthenticatedBridgeSessionIdentity,
  ExecutionAuthorityCaptureInput,
  ExecutionAuthorityEvidence,
  ExecutionAuthorityProcessIdentity,
  ExecutionAuthorityTerminationInput,
  ExecutionAuthorityTerminationProof,
  RuntimeExecutionAuthorityValidator,
} from "./engine.ts";

const HELPER_SCHEMA = "easyeda-pro-control.windows-authority-helper.v1";
const POLICY_ID = "windows.easyeda-contained-local-api.v1";
const MAXIMUM_RESPONSE_BYTES = 262_144;

type JsonRecord = Record<string, unknown>;

/** Windows-observed outbound socket, already correlated to this gateway session.
 * A WSL forwarding tuple is not assumed to equal this tuple. The resolver must
 * prove that mapping or reject; listener reachability is insufficient.
 */
export interface AuthenticatedWindowsSocket {
  readonly bridgeSessionSha256: string;
  readonly localAddress: string;
  readonly localPort: number;
  readonly remoteAddress: string;
  readonly remotePort: number;
}

export interface WindowsProcessProbe {
  readonly schema: "easyeda-pro-control.windows-process-probe.v1";
  readonly bindingSha256: string;
  readonly port: number;
  readonly nonce: string;
}

export interface WindowsAuthorityTransport {
  readonly request: (request: JsonRecord) => Promise<unknown>;
  /** Drops proof authority without terminating or saving EasyEDA. */
  readonly release: () => Promise<void>;
}

export interface WindowsAuthorityPolicy {
  readonly helperSha256: string;
  readonly expectedExecutable: string;
  readonly expectedExecutableSha256: string;
  /** Reviewed call paths must not delegate execution to an outside broker.
   * This is a code-review identity, not a caller-selected safety opt-out.
   */
  readonly reviewedExecutionScopeSha256: string;
  readonly resolveAuthenticatedSocket?: (
    session: AuthenticatedBridgeSessionIdentity,
  ) => Promise<AuthenticatedWindowsSocket>;
  /** Facade-generated four-argument native SYS_WebSocket probe under the exact
   * existing authenticated dispatch lease. Resolve only after checking the
   * helper's nonce-bearing message and closing that probe socket.
   */
  readonly performAuthenticatedProcessProbe?: (
    session: AuthenticatedBridgeSessionIdentity,
    probe: WindowsProcessProbe,
  ) => Promise<void>;
}

export interface WindowsAuthorityLaunch {
  readonly jobId: string;
  readonly helperInstance: string;
  readonly root: ExecutionAuthorityProcessIdentity;
}

export interface WindowsAuthoritySupervisor extends RuntimeExecutionAuthorityValidator {
  readonly releaseCapture: (evidence: ExecutionAuthorityEvidence) => Promise<void>;
  /** Explicit lifecycle action. Refuses an existing unsupervised instance. */
  readonly launch: (confirmation: { readonly confirmLaunch: true }) => Promise<WindowsAuthorityLaunch>;
  /** Dispatches WM_CLOSE only. A prompt or surviving process is not resolved. */
  readonly requestNormalClose: (input: {
    readonly confirmNormalClose: true;
    readonly windowHandle: string;
    readonly launch: WindowsAuthorityLaunch;
  }) => Promise<void>;
  readonly release: () => Promise<void>;
}

export interface WindowsAuthorityStartOptions extends Omit<WindowsAuthorityPolicy, "helperSha256"> {
  readonly powershellExecutable: string;
  /** Canonical host path, used for reviewed-file hashing. */
  readonly helperPath: string;
  /** Explicit Windows/UNC spelling of that same reviewed helper. */
  readonly helperWindowsPath: string;
}

interface CaptureReceipt {
  readonly bindingSha256: string;
  readonly capturedAt: string;
  readonly helperInstance: string;
  readonly jobId: string;
  readonly processes: readonly ExecutionAuthorityProcessIdentity[];
  readonly runtimePid: number | null;
  readonly socketOwnerPid: number | null;
}

interface RetainedAuthority {
  readonly evidence: ExecutionAuthorityEvidence;
  readonly receipt: CaptureReceipt;
  readonly operationId: string;
  readonly orphanPhase: string;
  readonly challengeAttempt: number;
  readonly bridgeSessionSha256: string;
  readonly runtimeIdentitySha256: string;
}

function isRecord(value: unknown): value is JsonRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function record(value: unknown): JsonRecord {
  if (!isRecord(value)) {
    throw new Error("Windows authority returned a malformed record.");
  }
  return value;
}

function text(value: unknown, pattern: RegExp): string {
  if (typeof value !== "string" || !pattern.test(value)) {
    throw new Error("Windows authority returned a malformed identity.");
  }
  return value;
}

function windowsPath(value: unknown, pattern: RegExp): string {
  const result = text(value, pattern);
  for (let index = 0; index < result.length; index += 1) {
    const code = result.codePointAt(index);
    if (code !== undefined && (code < 32 || code === 127)) {
      throw new Error("Windows authority path contains control characters.");
    }
  }
  return result;
}

function hash(value: unknown): string {
  return text(value, /^[a-f0-9]{64}$/u);
}

function pid(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value <= 0) {
    throw new TypeError("Windows authority requires an exact positive process ID.");
  }
  return value;
}

function date(value: unknown): string {
  const candidate = text(value, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3,7}Z$/u);
  if (!Number.isFinite(Date.parse(candidate))) {throw new TypeError("Windows authority timestamp is invalid.");}
  return candidate;
}

function processRecord(value: unknown, jobId: string): ExecutionAuthorityProcessIdentity {
  const candidate = record(value);
  const startIdentity = text(candidate["startIdentity"], /^win32:\d{15,20}:job:[a-f0-9]{32}$/u);
  if (!startIdentity.endsWith(`:job:${jobId}`)) {
    throw new Error("Windows process generation belongs to another Job.");
  }
  return {
    pid: pid(candidate["pid"]),
    role: text(candidate["role"], /^(?:easyeda-main|easyeda-descendant|renderer|native-socket-owner)$/u),
    startIdentity,
  };
}

function captureReceipt(value: unknown, bindingSha256: string): CaptureReceipt {
  const candidate = record(value);
  if (candidate["bindingSha256"] !== bindingSha256) {throw new Error("Windows capture binding changed.");}
  const jobId = text(candidate["jobId"], /^[a-f0-9]{32}$/u);
  const rows = candidate["processes"];
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > 512) {
    throw new Error("Windows capture contains no complete bounded process list.");
  }
  const processes = rows.map((row: unknown) => processRecord(row, jobId));
  if (new Set(processes.map((row) => row.pid)).size !== processes.length ||
      processes.some((row, index) => index > 0 && row.pid <= (processes[index - 1]?.pid ?? 0))) {
    throw new Error("Windows capture process IDs are duplicated or unsorted.");
  }
  return {
    bindingSha256,
    capturedAt: date(candidate["capturedAt"]),
    helperInstance: text(candidate["helperInstance"], /^[a-f0-9]{32}$/u),
    jobId,
    processes,
    runtimePid: candidate["runtimePid"] === null ? null : pid(candidate["runtimePid"]),
    socketOwnerPid: candidate["socketOwnerPid"] === null ? null : pid(candidate["socketOwnerPid"]),
  };
}

function socketRecord(value: AuthenticatedWindowsSocket, session: AuthenticatedBridgeSessionIdentity): JsonRecord {
  if (value.bridgeSessionSha256 !== sha256Json(session) ||
      isIP(value.localAddress) === 0 || isIP(value.remoteAddress) === 0 ||
      pid(value.localPort) > 65_535 || pid(value.remotePort) > 65_535) {
    throw new Error("Windows socket is not bound to this exact authenticated session.");
  }
  return {
    localAddress: value.localAddress,
    localPort: value.localPort,
    remoteAddress: value.remoteAddress,
    remotePort: value.remotePort,
  };
}

/** Adapter for the retained native Job helper. This factory does not launch an
 * application and never treats a PID inventory alone as complete authority.
 */
export function createWindowsAuthoritySupervisor(
  transport: WindowsAuthorityTransport,
  policy: WindowsAuthorityPolicy,
): WindowsAuthoritySupervisor {
  const policySha256 = sha256Json({
    schema: HELPER_SCHEMA,
    policyId: POLICY_ID,
    helperSha256: hash(policy.helperSha256),
    expectedExecutableSha256: hash(policy.expectedExecutableSha256),
    reviewedExecutionScopeSha256: hash(policy.reviewedExecutionScopeSha256),
    containment: "atomic-launch-job-list:no-breakaway:no-kill-on-close:retained-handles",
    excluded: "outside-job-brokers-services-and-unreviewed-delegation",
  });
  const executable = windowsPath(policy.expectedExecutable, /^[A-Za-z]:\\[^"\r\n]+\.exe$/u);
  const authorities = new Map<string, RetainedAuthority>();
  const usedCaptureBindings = new Set<string>();
  let currentLaunch: WindowsAuthorityLaunch | undefined;
  let released = false;

  function requireOwned(): void {
    if (released) {throw new Error("Windows supervisor authority was released; recapture is required.");}
  }

  async function nativeProbeCapture(input: ExecutionAuthorityCaptureInput): Promise<CaptureReceipt> {
    const performProbe = policy.performAuthenticatedProcessProbe;
    if (performProbe === undefined) {throw new Error("Authenticated native process probe is unavailable.");}
    async function observedDispatch(probe: WindowsProcessProbe): Promise<boolean> {
      try {
        await performProbe?.(input.bridgeSession, probe);
        return true;
      } catch {
        return false;
      }
    }
    async function closeProbe(): Promise<void> {
      const closed = record(await transport.request({ action: "end-probe", bindingSha256: input.bindingSha256 }));
      if (closed["closed"] !== true || closed["bindingSha256"] !== input.bindingSha256) {
        throw new Error("Native ownership probe cleanup is unproven.");
      }
    }
    const started = record(await transport.request({ action: "begin-probe", bindingSha256: input.bindingSha256 }));
    try {
      if (started["schema"] !== "easyeda-pro-control.windows-process-probe.v1" ||
          started["bindingSha256"] !== input.bindingSha256) {
        throw new Error("Native process probe has another schema or operation binding.");
      }
      const port = pid(started["port"]);
      if (port > 65_535) {throw new Error("Native process probe port is invalid.");}
      const probe: WindowsProcessProbe = {
        schema: "easyeda-pro-control.windows-process-probe.v1", bindingSha256: input.bindingSha256,
        port, nonce: hash(started["nonce"]),
      };
      // Attach both outcomes immediately: a failed helper must not leave an
      // Unhandled rejection while the leased renderer probe cleans itself up.
      const dispatched = observedDispatch(probe);
      let result: unknown;
      try {
        result = await transport.request({ action: "finish-probe", bindingSha256: input.bindingSha256, nonce: probe.nonce });
      } catch (error) {
        await dispatched;
        throw error;
      }
      if (!await dispatched) {throw new Error("The authenticated renderer did not complete and close its native ownership probe.");}
      return captureReceipt(result, input.bindingSha256);
    } finally {
      await closeProbe();
    }
  }

  async function capture(input: ExecutionAuthorityCaptureInput): Promise<ExecutionAuthorityEvidence> {
    requireOwned();
    if (currentLaunch === undefined) {throw new Error("Windows authority needs an explicitly supervised EasyEDA launch.");}
    hash(input.bindingSha256);
    if (usedCaptureBindings.has(input.bindingSha256)) {throw new Error("Windows authority capture binding was already used.");}
    const runtimePid = input.runtimeIdentity.processId;
    if (runtimePid !== null) {pid(runtimePid);}
    let socket: JsonRecord | null = null;
    if (policy.resolveAuthenticatedSocket !== undefined) {
      socket = socketRecord(await policy.resolveAuthenticatedSocket(input.bridgeSession), input.bridgeSession);
    }
    const useNativeProbe = runtimePid === null && socket === null && policy.performAuthenticatedProcessProbe !== undefined;
    if (runtimePid === null && socket === null && !useNativeProbe) {
      throw new Error("Renderer PID is unavailable and no verified authenticated Windows socket mapping is installed.");
    }
    usedCaptureBindings.add(input.bindingSha256);
    const receipt = useNativeProbe
      ? await nativeProbeCapture(input)
      : captureReceipt(await transport.request({
        action: "capture", bindingSha256: input.bindingSha256, runtimePid, socket,
      }), input.bindingSha256);
    requireOwned();
    if (receipt.jobId !== currentLaunch.jobId || receipt.helperInstance !== currentLaunch.helperInstance ||
        receipt.runtimePid !== runtimePid ||
        (runtimePid !== null && !receipt.processes.some((row) => row.pid === runtimePid && row.role === "renderer")) ||
        ((socket !== null || useNativeProbe) && !receipt.processes.some((row) => row.pid === receipt.socketOwnerPid)) ||
        (socket === null && !useNativeProbe && receipt.socketOwnerPid !== null) ||
        !receipt.processes.some((row) => row.pid === currentLaunch?.root.pid && row.startIdentity === currentLaunch.root.startIdentity)) {
      throw new Error("Windows capture did not bind the authenticated process and launched generation to its Job.");
    }
    const payload = {
      schema: "easyeda-pro-control.execution-authority.v1" as const,
      bindingSha256: input.bindingSha256,
      policyId: POLICY_ID,
      policySha256,
      capturedAt: receipt.capturedAt,
      processes: receipt.processes,
      processTreeSha256: sha256Json(receipt.processes),
    };
    const evidence: ExecutionAuthorityEvidence = { ...payload, authoritySha256: sha256Json(payload) };
    if (authorities.has(evidence.authoritySha256)) {throw new Error("Windows authority capture was replayed.");}
    authorities.set(evidence.authoritySha256, {
      evidence: structuredClone(evidence), receipt,
      operationId: input.operationId, orphanPhase: input.orphanPhase, challengeAttempt: input.challengeAttempt,
      bridgeSessionSha256: sha256Json(input.bridgeSession), runtimeIdentitySha256: sha256Json(input.runtimeIdentity),
    });
    return evidence;
  }

  async function proveTerminated(input: ExecutionAuthorityTerminationInput): Promise<ExecutionAuthorityTerminationProof> {
    requireOwned();
    hash(input.bindingSha256);
    const retained = authorities.get(input.priorExecutionAuthority.authoritySha256);
    if (retained === undefined || canonicalJson(retained.evidence) !== canonicalJson(input.priorExecutionAuthority) ||
        retained.operationId !== input.operationId || retained.orphanPhase !== input.orphanPhase ||
        !Number.isSafeInteger(input.challengeAttempt) || input.challengeAttempt < retained.challengeAttempt ||
        retained.bridgeSessionSha256 !== sha256Json(input.priorBridgeSession) ||
        retained.runtimeIdentitySha256 !== sha256Json(input.priorRuntimeIdentity) ||
        input.currentBridgeSession.sessionId === input.priorBridgeSession.sessionId ||
        input.currentBridgeSession.gatewayInstanceId !== input.priorBridgeSession.gatewayInstanceId ||
        input.currentRuntimeIdentity.generation === input.priorRuntimeIdentity.generation ||
        input.currentRuntimeIdentity.timeOrigin === input.priorRuntimeIdentity.timeOrigin) {
      throw new Error("Windows termination proof lacks its retained operation/session/generation capture.");
    }
    const receipt = record(await transport.request({
      action: "prove-terminated", captureBindingSha256: retained.receipt.bindingSha256,
      helperInstance: retained.receipt.helperInstance, jobId: retained.receipt.jobId,
    }));
    requireOwned();
    const checkedAt = date(receipt["checkedAt"]);
    if (receipt["captureBindingSha256"] !== retained.receipt.bindingSha256 ||
        receipt["helperInstance"] !== retained.receipt.helperInstance || receipt["jobId"] !== retained.receipt.jobId ||
        receipt["jobEmpty"] !== true || receipt["retainedProcessesExited"] !== true ||
        Date.parse(checkedAt) < Date.parse(retained.receipt.capturedAt)) {
      throw new Error("Windows helper did not prove the entire retained Job and process generations terminated.");
    }
    return {
      schema: "easyeda-pro-control.execution-authority-termination.v1" as const,
      bindingSha256: input.bindingSha256, checkedAt,
      noPriorExecutionAuthorityRemains: true as const, ok: true as const,
      policyId: POLICY_ID, policySha256,
      terminatedAuthoritySha256: retained.evidence.authoritySha256,
    };
  }

  return {
    capture, proveTerminated,
    async releaseCapture(evidence) {
      requireOwned();
      const retained = authorities.get(evidence.authoritySha256);
      if (retained === undefined || canonicalJson(retained.evidence) !== canonicalJson(evidence)) {
        throw new Error("Windows capture release lacks its exact retained authority.");
      }
      // Retire proof before dispatch: an uncertain cleanup must never let this
      // Capture be reused as if its native handles were still retained.
      authorities.delete(evidence.authoritySha256);
      const response = record(await transport.request({ action: "release-capture",
        captureBindingSha256: retained.receipt.bindingSha256, helperInstance: retained.receipt.helperInstance, jobId: retained.receipt.jobId }));
      if (response["released"] !== true || response["captureBindingSha256"] !== retained.receipt.bindingSha256 ||
          response["helperInstance"] !== retained.receipt.helperInstance || response["jobId"] !== retained.receipt.jobId) {
        throw new Error("Windows capture handle release was not proved.");
      }
    },
    async launch(confirmation) {
      requireOwned();
      if (!confirmation.confirmLaunch) {throw new Error("Supervised launch requires explicit authority.");}
      const response = record(await transport.request({
        action: "launch", confirmLaunch: true, executable, executableSha256: policy.expectedExecutableSha256,
      }));
      requireOwned();
      const jobId = text(response["jobId"], /^[a-f0-9]{32}$/u);
      const launch = {
        jobId, helperInstance: text(response["helperInstance"], /^[a-f0-9]{32}$/u),
        root: processRecord(response["root"], jobId),
      };
      if (launch.root.role !== "easyeda-main") {throw new Error("Supervised launch root role is invalid.");}
      currentLaunch = structuredClone(launch);
      return launch;
    },
    async requestNormalClose(input) {
      requireOwned();
      if (!input.confirmNormalClose || currentLaunch === undefined ||
          canonicalJson(input.launch) !== canonicalJson(currentLaunch)) {
        throw new Error("Normal close requires the exact supervised application generation.");
      }
      const rootStartTicks = /^win32:(\d+):/u.exec(currentLaunch.root.startIdentity)?.[1];
      const response = record(await transport.request({
        action: "normal-close", confirmNormalClose: true, jobId: currentLaunch.jobId,
        rootStartTicks, windowHandle: text(input.windowHandle, /^[1-9]\d{0,18}$/u),
      }));
      if (response["closeDispatched"] !== true || response["jobId"] !== currentLaunch.jobId ||
          response["saveOrDiscardSelected"] !== false) {throw new Error("Normal close dispatch is unproven; do not retry blindly.");}
    },
    async release() {
      released = true;
      authorities.clear();
      await transport.release();
    },
  };
}

/** Starts only the retained Windows proof helper, not EasyEDA. A lost protocol
 * makes that helper unusable. We never kill an application on helper shutdown.
 */
export async function startWindowsAuthoritySupervisor(options: WindowsAuthorityStartOptions): Promise<WindowsAuthoritySupervisor> {
  const helperStat = await lstat(options.helperPath);
  if (!helperStat.isFile() || helperStat.isSymbolicLink() || helperStat.nlink !== 1 || helperStat.size > 65_536 ||
      await realpath(options.helperPath) !== options.helperPath || !path.isAbsolute(options.powershellExecutable)) {
    throw new Error("Windows authority helper requires a canonical reviewed regular file and absolute PowerShell executable.");
  }
  const helperSha256 = createHash("sha256").update(await readFile(options.helperPath)).digest("hex");
  windowsPath(options.helperWindowsPath, /^(?:[A-Za-z]:\\|\\\\)[^"\r\n]+\.ps1$/u);
  const child = spawn(options.powershellExecutable, [
    "-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", options.helperWindowsPath,
  ], { stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
  let pending: { readonly id: string; readonly resolve: (value: unknown) => void; readonly reject: (error: Error) => void } | undefined;
  let buffer = "";
  let failed = false;
  const closed = Promise.withResolvers<null>();
  function fail(): void {
    failed = true;
    pending?.reject(new Error("Windows authority helper exited or violated its bounded protocol. Prior proof authority is unavailable."));
    pending = undefined;
    child.stdin.end();
  }
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk: string) => {
    buffer += chunk;
    if (Buffer.byteLength(buffer) > MAXIMUM_RESPONSE_BYTES) { fail(); return; }
    const newline = buffer.indexOf("\n");
    if (newline === -1) {return;}
    const line = buffer.slice(0, newline);
    buffer = buffer.slice(newline + 1);
    try {
      const response = record(JSON.parse(line) as unknown);
      const request = pending;
      if (request === undefined || response["id"] !== request.id || buffer.length > 0) { fail(); return; }
      if (response["ok"] === true) {
        pending = undefined;
        request.resolve(response["result"]);
      } else if (response["ok"] === false) {
        const error = new Error(text(response["error"], /^authority-[a-z-]{1,80}$/u));
        pending = undefined;
        request.reject(error);
      } else {
        fail();
      }
    } catch { fail(); }
  });
  // Never relay Windows exception text, paths or command lines into MCP output.
  child.stderr.on("data", () => { fail(); });
  child.on("error", () => { fail(); });
  child.on("close", () => { fail(); closed.resolve(null); });
  child.stdin.on("error", () => { fail(); });
  const transport: WindowsAuthorityTransport = {
    async request(request) {
      if (failed || pending !== undefined) {throw new Error("Windows authority helper is unavailable or already executing a request.");}
      const id = randomBytes(16).toString("hex");
      const response = Promise.withResolvers<unknown>();
      pending = { id, resolve: response.resolve, reject: response.reject };
      const deadline = setTimeout(fail, 15_000);
      child.stdin.write(`${JSON.stringify({ ...request, id })}\n`);
      try { return await response.promise; } finally { clearTimeout(deadline); }
    },
    async release() {
      fail();
      await closed.promise;
    },
  };
  return createWindowsAuthoritySupervisor(transport, { ...options, helperSha256 });
}
