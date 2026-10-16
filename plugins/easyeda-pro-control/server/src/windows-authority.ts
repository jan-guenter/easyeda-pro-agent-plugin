import { spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { lstat, readFile, realpath } from "node:fs/promises";
import { isIP } from "node:net";
import path from "node:path";
import process from "node:process";
import { createClockedTransport } from "./windows-clock-transport.ts";
import type { ClockAttachment } from "./windows-clock-transport.ts";

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
export interface IssuedWindowsClockObservation extends ClockAttachment {
  readonly ownerBinding: Readonly<JsonRecord>;
}
/** Fresh retained-capture observation, not a new capture or execution grant. */
export interface IssuedCurrentWindowsClockObservation extends IssuedWindowsClockObservation {
  readonly phase: "owned-observation";
}
type ClockPhase = ClockAttachment["phase"];
interface NativeTerminationRefusal {
  readonly requestId: string;
  readonly requestSequence: number;
  readonly action: unknown;
  readonly captureBindingSha256: unknown;
  readonly helperInstance: unknown;
  readonly jobId: unknown;
  readonly code: string;
}
interface QualifiedClockSource {
  readonly originalAttachment: (raw: unknown) => ClockAttachment | undefined;
  readonly revalidate: () => Promise<void>;
  readonly assertTransport: () => void;
  readonly assertSource: () => void;
  readonly nativeRefusal: (error: unknown) => NativeTerminationRefusal | undefined;
  readonly requestSequence: () => number;
}
const qualifiedClockSources = new WeakMap<WindowsAuthorityTransport, QualifiedClockSource>();
const originalClocks = new WeakMap<object, IssuedWindowsClockObservation>();
const issuedClocks = new WeakMap<object, { readonly observation: IssuedWindowsClockObservation; readonly current: () => void; readonly verify: () => Promise<void> }>();
const REVIEWED_CLOCK_HELPER_SHA256 = "507fdea31ee30387ea31e90ca749058fa987ee573de12940db57357d2d321e35";
function freezeClockData<T>(value: T): T {
  if (value !== null && typeof value === "object") {
    for (const child of Object.values(value)) { freezeClockData(child); }
    Object.freeze(value);
  }
  return value;
}
/** Source-owned observation only, never a dispatch or persistence grant. */
export async function assertIssuedWindowsClockObservation(value: unknown): Promise<IssuedWindowsClockObservation> {
  const slot = value !== null && typeof value === "object" ? issuedClocks.get(value) : undefined;
  if (slot === undefined) { throw new Error("Windows clock observation was not issued by the source-qualified retained helper."); }
  await slot.verify();
  return slot.observation;
}
/** Original issued token and current retained owner only. Does not rehash source
 * or refresh time. Requires an original source-qualified async observation;
 * fresh collection already hashes its helper before sampling.
 */
export function assertCurrentIssuedWindowsClockObservation(value: unknown): IssuedWindowsClockObservation {
  const slot = value !== null && typeof value === "object" ? issuedClocks.get(value) : undefined;
  if (slot === undefined) { throw new Error("Windows clock observation was not issued by the source-qualified retained helper."); }
  slot.current(); return slot.observation;
}
/** Original supervisor result only; JSON copies and self-hashes are not tokens. */
export async function windowsClockObservationForResult(value: unknown, phase: ClockPhase): Promise<IssuedWindowsClockObservation> {
  const observation = value !== null && typeof value === "object" ? originalClocks.get(value) : undefined;
  if (observation === undefined || observation.phase !== phase) { throw new Error("Original Windows result has no clock observation for this action."); }
  const issued = await assertIssuedWindowsClockObservation(observation);
  return issued;
}

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
  /** Internal liveness of the retained helper/handle owner, not a PID lookup. */
  readonly assertClosedSessionAvailable?: () => void;
  /** Drops proof authority without terminating or saving EasyEDA. */
  readonly release: () => Promise<void>;
}

export interface WindowsAuthorityPolicy {
  /** Internal source-identity check; no caller-supplied runtime or bypass flag. */
  readonly revalidateClosedSessionHelper?: () => Promise<void>;
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

/** Original retained launch liveness only, not closed-design or persistence proof. */
export interface WindowsLaunchTerminationObservation {
  readonly jobId: string;
  readonly helperInstance: string;
  readonly terminated: boolean;
}

/** Bounded original-root application window only; no desktop text is returned. */
export interface WindowsApplicationWindowObservation {
  readonly jobId: string;
  readonly helperInstance: string;
  readonly outcome: "available" | "unavailable" | "ambiguous";
  readonly hwnd: string | null;
}

/** Internal completion foundation, with no MCP route. A coordinator must durably publish the
 * returned intent before requesting close, then retain both receipts before
 * closed-file SQL verification. These receipts do not prove queued work saved.
 */
export interface ClosedSessionBinding {
  readonly operationId: string;
  readonly phase: string;
  readonly challengeAttempt: number;
  readonly bridgeSession: AuthenticatedBridgeSessionIdentity;
  readonly runtimeIdentity: ExecutionAuthorityCaptureInput["runtimeIdentity"];
  readonly executionAuthority: ExecutionAuthorityEvidence;
  readonly launch: WindowsAuthorityLaunch;
}
export interface ClosedSessionCloseIntent extends JsonRecord {
  readonly schema: "easyeda-pro-control.closed-session-close-intent.v1";
  readonly operationId: string;
  readonly phase: string;
  readonly authoritySha256: string;
  readonly launchSha256: string;
  readonly bridgeSessionSha256: string;
  readonly runtimeIdentitySha256: string;
  readonly helperInstance: string;
  readonly jobId: string;
  readonly windowHandle: string;
  readonly policyId: string;
  readonly policySha256: string;
  readonly closeIntentSha256: string;
}
export interface ClosedSessionCloseReceipt extends JsonRecord {
  readonly schema: "easyeda-pro-control.closed-session-close-dispatch.v1";
  readonly closeIntentSha256: string;
  readonly closeDispatched: true;
  readonly saveOrDiscardSelected: false;
  readonly terminationProved: false;
  readonly closeReceiptSha256: string;
}
export interface ClosedSessionTerminationReceipt extends JsonRecord {
  readonly schema: "easyeda-pro-control.closed-session-termination.v1";
  readonly closedAt: string;
  readonly closeIntentSha256: string;
  readonly closeReceiptSha256: string;
  readonly authoritySha256: string;
  readonly launchSha256: string;
  readonly jobEmpty: true;
  readonly retainedProcessesExited: true;
  readonly saveOrDiscardSelected: false;
  readonly queuedWritesPersisted: "not-proved";
  readonly persistentWorkReplayExcluded: "not-proved";
  readonly proofSha256: string;
}
const CLOSED_SESSION_PROOF_BRAND: unique symbol = Symbol("closed-session-termination-proof");
export interface ClosedSessionTerminationProof extends ClosedSessionTerminationReceipt {
  readonly [CLOSED_SESSION_PROOF_BRAND]: true;
}
/** Source-observed liveness only. This data does not carry a termination brand. */
export interface ClosedSessionPendingObservation extends JsonRecord {
  readonly schema: "easyeda-pro-control.closed-session-pending.v1";
  readonly status: "pending";
  readonly nativeCode: "authority-prior-job-not-empty" | "authority-retained-process-still-live";
  readonly nativeRequestId: string;
  readonly terminationProved: false;
  readonly completionProved: false;
  readonly executionAuthorized: false;
}
export type ClosedSessionTerminationObservation = ClosedSessionPendingObservation |
  Readonly<{ status: "terminated"; proof: ClosedSessionTerminationProof }>;
const terminationObservationOwners = new WeakMap<object, () => void>();
/** Final no-await ownership check, never a replacement for source revalidation.
 * Pending data or a JSON copy cannot authorize a later polling continuation.
 */
export function assertCurrentClosedSessionTerminationObservation(value: unknown): void {
  const verify = isRecord(value) ? terminationObservationOwners.get(value) : undefined;
  if (verify === undefined) { throw new Error("Closed-session observation was not issued by its original retained owner."); }
  verify();
}
const closedProofOwners = new WeakMap<object, {
  readonly verify: () => Promise<ClosedSessionTerminationProof>;
  readonly verifyCopy: () => Promise<ClosedSessionTerminationProof>;
  readonly verifyCopyCurrent: () => void;
}>();

/** JSON, self-hashes and caller-provided verifier objects cannot mint authority.
 * This proves only the original Job's termination, not absence of other writers.
 */
export async function assertClosedSessionTerminationProof(value: unknown): Promise<ClosedSessionTerminationProof> {
  const owner = isRecord(value) ? closedProofOwners.get(value) : undefined;
  if (owner === undefined) { throw new Error("Closed-session proof was not issued by a retained authority owner."); }
  const proof = await owner.verify();
  return proof;
}
/** Stricter copy admission, not an assertion that an unrelated writer is absent.
 * Call before and after the bounded copy; any intervening lifecycle invalidates it.
 */
export async function assertClosedSessionCopyAuthority(value: unknown): Promise<ClosedSessionTerminationProof> {
  const owner = isRecord(value) ? closedProofOwners.get(value) : undefined;
  if (owner === undefined) { throw new Error("Closed-session copy proof was not issued by a retained authority owner."); }
  const proof = await owner.verifyCopy();
  return proof;
}
/** Final no-await check of the original retained copy owner. Pair this with
 * async helper/source revalidation; it does not replace that file verification.
 * No caller verifier, serialized proof or runtime snapshot can mint this check.
 */
export function assertCurrentClosedSessionCopyAuthority(value: unknown): void {
  const owner = isRecord(value) ? closedProofOwners.get(value) : undefined;
  if (owner === undefined) { throw new Error("Closed-session copy proof was not issued by a retained authority owner."); }
  owner.verifyCopyCurrent();
}
interface ClosedSessionSlot {
  readonly intent: ClosedSessionCloseIntent;
  dispatched: boolean;
  proofInFlight: boolean;
  receipt?: ClosedSessionCloseReceipt;
  proof?: ClosedSessionTerminationReceipt;
  proofLifecycleEpoch?: number;
}

export interface WindowsAuthoritySupervisor extends RuntimeExecutionAuthorityValidator {
  /** Internal only. Requires the original capture object and samples after helper revalidation. */
  readonly observeCurrentClock?: (evidence: ExecutionAuthorityEvidence) => Promise<IssuedCurrentWindowsClockObservation>;
  readonly prepareClosedSessionClose: (input: ClosedSessionBinding & { readonly windowHandle: string }) => Promise<ClosedSessionCloseIntent>;
  readonly requestClosedSessionNormalClose: (input: ClosedSessionBinding & { readonly intent: ClosedSessionCloseIntent; readonly confirmNormalClose: true }) => Promise<ClosedSessionCloseReceipt>;
  readonly proveClosedSession: (input: ClosedSessionBinding & { readonly intent: ClosedSessionCloseIntent; readonly closeReceipt: ClosedSessionCloseReceipt }) => Promise<ClosedSessionTerminationProof>;
  readonly probeClosedSessionTermination: (input: ClosedSessionBinding & { readonly intent: ClosedSessionCloseIntent; readonly closeReceipt: ClosedSessionCloseReceipt }) => Promise<ClosedSessionTerminationObservation>;
  readonly releaseCapture: (evidence: ExecutionAuthorityEvidence) => Promise<void>;
  /** Explicit lifecycle action. Refuses an existing unsupervised instance. */
  readonly launch: (confirmation: { readonly confirmLaunch: true }) => Promise<WindowsAuthorityLaunch>;
  /** Ordinary startup preflight only; any running same-name app refuses launch. */
  readonly observeExistingApplication?: () => Promise<{ readonly running: boolean }>;
  /** Reads the original root handle and Job twice; never closes or rebinds a process. */
  readonly observeLaunchTermination?: (launch: WindowsAuthorityLaunch) => Promise<WindowsLaunchTerminationObservation>;
  /** Read-only unique root-window observation by the original retained helper. */
  readonly observeApplicationWindow?: (launch: WindowsAuthorityLaunch) => Promise<WindowsApplicationWindowObservation>;
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
  /** Internal capability pin checked again immediately before helper startup. */
  readonly expectedHelperSha256?: string;
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
  const reviewedHelperCheck = policy.revalidateClosedSessionHelper;
  const retainedTransportCheck = transport.assertClosedSessionAvailable;
  const closedSessionSlots = new Map<string, ClosedSessionSlot>();
  const normalCloseJobs = new Set<string>();
  const authorities = new Map<string, RetainedAuthority>();
  const originalCaptureResults = new WeakMap<ExecutionAuthorityEvidence, RetainedAuthority>();
  const usedCaptureBindings = new Set<string>();
  let lifecycleEpoch = 0;
  let currentLaunch: WindowsAuthorityLaunch | undefined;
  let released = false;
  const clockSource = qualifiedClockSources.get(transport);
  const captureClockBases = new WeakMap<CaptureReceipt, unknown>();
  function parsedCapture(raw: unknown, bindingSha256: string): CaptureReceipt {
    const receipt = captureReceipt(raw, bindingSha256); captureClockBases.set(receipt, raw); return receipt;
  }
  function retainClock<Phase extends ClockPhase>(result: object, raw: unknown, phase: Phase, ownerBinding: JsonRecord,
    verifyCurrent?: () => void): (IssuedWindowsClockObservation & { readonly phase: Phase }) | undefined {
    if (clockSource === undefined || currentLaunch === undefined) { return undefined; }
    let attachment: ClockAttachment | undefined;
    try { attachment = clockSource.originalAttachment(raw); } catch { return undefined; }
    if (attachment === undefined || attachment.phase !== phase ||
        attachment.base["jobId"] !== currentLaunch.jobId || attachment.base["helperInstance"] !== currentLaunch.helperInstance) { return undefined; }
    const launchText = canonicalJson(currentLaunch), resultText = canonicalJson(result);
    const observation = freezeClockData({ ...structuredClone(attachment), phase, ownerBinding: structuredClone(ownerBinding) });
    function current(): void {
      requireOwned(); clockSource?.assertTransport();
      verifyCurrent?.();
      if (canonicalJson(currentLaunch) !== launchText || canonicalJson(result) !== resultText ||
          originalClocks.get(result) !== observation || qualifiedClockSources.get(transport) !== clockSource) {
        throw new Error("Windows clock owner, result or launched generation changed.");
      }
    }
    async function verify(): Promise<void> {
      current(); await clockSource?.revalidate(); current();
    }
    originalClocks.set(result, observation); issuedClocks.set(observation, { observation, current, verify });
    return observation;
  }

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
      return parsedCapture(result, input.bindingSha256);
    } finally {
      await closeProbe();
    }
  }

  async function capture(input: ExecutionAuthorityCaptureInput): Promise<ExecutionAuthorityEvidence> {
    const clockInput = structuredClone(input);
    lifecycleEpoch += 1;
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
      : parsedCapture(await transport.request({
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
    const retained: RetainedAuthority = {
      evidence: structuredClone(evidence), receipt,
      operationId: input.operationId, orphanPhase: input.orphanPhase, challengeAttempt: input.challengeAttempt,
      bridgeSessionSha256: sha256Json(input.bridgeSession), runtimeIdentitySha256: sha256Json(input.runtimeIdentity),
    };
    authorities.set(evidence.authoritySha256, retained);
    if (canonicalJson(input) === canonicalJson(clockInput)) {
      const observation = retainClock(evidence, captureClockBases.get(receipt), "capture", {
        operationId: clockInput.operationId, phase: clockInput.orphanPhase, challengeAttempt: clockInput.challengeAttempt,
        bindingSha256: clockInput.bindingSha256, bridgeSessionSha256: sha256Json(clockInput.bridgeSession),
        runtimeIdentitySha256: sha256Json(clockInput.runtimeIdentity), authoritySha256: evidence.authoritySha256,
      });
      if (observation !== undefined) { originalCaptureResults.set(evidence, retained); }
    }
    return evidence;
  }

  async function observeCurrentClock(evidence: ExecutionAuthorityEvidence): Promise<IssuedCurrentWindowsClockObservation> {
    const epoch = lifecycleEpoch, launch = currentLaunch, retained = originalCaptureResults.get(evidence);
    const source = clockSource;
    if (retained === undefined || launch === undefined || source === undefined) {
      throw new Error("Fresh Windows clock requires an original source-qualified retained capture.");
    }
    const original = Object.freeze({ launch, retained, source });
    const launchText = canonicalJson(launch);
    function current(): void {
      requireOwned(); original.source.assertSource();
      if (currentLaunch !== original.launch || lifecycleEpoch !== epoch || canonicalJson(original.launch) !== launchText ||
          qualifiedClockSources.get(transport) !== original.source || originalCaptureResults.get(evidence) !== original.retained ||
          authorities.get(original.retained.evidence.authoritySha256) !== original.retained ||
          canonicalJson(evidence) !== canonicalJson(original.retained.evidence) ||
          original.retained.receipt.jobId !== original.launch.jobId || original.retained.receipt.helperInstance !== original.launch.helperInstance ||
          normalCloseJobs.has(original.launch.jobId)) {
        throw new Error("Fresh Windows clock capture, owner or original generation changed.");
      }
    }
    current();
    // Finish file hashing before sampling. Later assertions recheck source.
    // Assertions never refresh this observation's timestamp.
    await source.revalidate(); current();
    const raw = await transport.request({ action: "observe-owned-clock", captureBindingSha256: retained.receipt.bindingSha256,
      helperInstance: retained.receipt.helperInstance, jobId: retained.receipt.jobId });
    current();
    const base = record(raw);
    if (base["captureBindingSha256"] !== retained.receipt.bindingSha256 || base["jobId"] !== launch.jobId ||
        base["helperInstance"] !== launch.helperInstance || base["rootStillLive"] !== true || base["retainedProcessesLive"] !== true ||
        Date.parse(date(base["observedAt"])) < Date.parse(retained.receipt.capturedAt)) {
      throw new Error("Fresh Windows clock observation changed its retained capture binding.");
    }
    const result = freezeClockData({ schema: "easyeda-pro-control.current-owned-clock-result.v1", ...structuredClone(base) });
    const observation = retainClock(result, raw, "owned-observation", {
      operationId: retained.operationId, phase: retained.orphanPhase, challengeAttempt: retained.challengeAttempt,
      bindingSha256: retained.receipt.bindingSha256, bridgeSessionSha256: retained.bridgeSessionSha256,
      runtimeIdentitySha256: retained.runtimeIdentitySha256, authoritySha256: retained.evidence.authoritySha256,
    }, current);
    if (observation?.phase !== "owned-observation") { throw new Error("Fresh Windows clock observation was not issued."); }
    return observation;
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


  /** Revalidation is intentionally separate from recovery's existing contract. */
  async function closedPolicy(): Promise<void> {
    requireOwned();
    if (retainedTransportCheck === undefined || transport.assertClosedSessionAvailable !== retainedTransportCheck) {
      throw new Error("Closed-session retained helper availability is unproven.");
    }
    retainedTransportCheck();
    const expected = sha256Json({
      schema: HELPER_SCHEMA, policyId: POLICY_ID,
      helperSha256: hash(policy.helperSha256),
      expectedExecutableSha256: hash(policy.expectedExecutableSha256),
      reviewedExecutionScopeSha256: hash(policy.reviewedExecutionScopeSha256),
      containment: "atomic-launch-job-list:no-breakaway:no-kill-on-close:retained-handles",
      excluded: "outside-job-brokers-services-and-unreviewed-delegation",
    });
    if (expected !== policySha256 || policy.expectedExecutable !== executable ||
        reviewedHelperCheck === undefined || policy.revalidateClosedSessionHelper !== reviewedHelperCheck) {
      throw new Error("Closed-session policy or reviewed helper proof is unavailable.");
    }
    await reviewedHelperCheck();
    requireOwned();
    retainedTransportCheck();
    if (expected !== sha256Json({
      schema: HELPER_SCHEMA, policyId: POLICY_ID,
      helperSha256: hash(policy.helperSha256),
      expectedExecutableSha256: hash(policy.expectedExecutableSha256),
      reviewedExecutionScopeSha256: hash(policy.reviewedExecutionScopeSha256),
      containment: "atomic-launch-job-list:no-breakaway:no-kill-on-close:retained-handles",
      excluded: "outside-job-brokers-services-and-unreviewed-delegation",
    }) || policy.expectedExecutable !== executable || policy.revalidateClosedSessionHelper !== reviewedHelperCheck ||
        transport.assertClosedSessionAvailable !== retainedTransportCheck) {
      throw new Error("Closed-session policy changed while revalidating its helper.");
    }
  }

  function closedBinding(input: ClosedSessionBinding, current = true): RetainedAuthority {
    requireOwned();
    const retained = authorities.get(input.executionAuthority.authoritySha256);
    if (retained === undefined || canonicalJson(input.executionAuthority) !== canonicalJson(retained.evidence) ||
        retained.operationId !== input.operationId || retained.orphanPhase !== input.phase ||
        retained.challengeAttempt !== input.challengeAttempt ||
        retained.bridgeSessionSha256 !== sha256Json(input.bridgeSession) ||
        retained.runtimeIdentitySha256 !== sha256Json(input.runtimeIdentity) ||
        input.launch.jobId !== retained.receipt.jobId || input.launch.helperInstance !== retained.receipt.helperInstance ||
        !retained.receipt.processes.some((entry) => entry.pid === input.launch.root.pid &&
          entry.startIdentity === input.launch.root.startIdentity) ||
        input.launch.root.role !== "easyeda-main" ||
        current && canonicalJson(input.launch) !== canonicalJson(currentLaunch)) {
      throw new Error("Closed-session proof lacks its retained operation, phase, session, runtime or launch.");
    }
    return retained;
  }

  function closedSlot(input: ClosedSessionBinding, intent: ClosedSessionCloseIntent): ClosedSessionSlot {
    const slot = closedSessionSlots.get(input.launch.jobId);
    if (slot === undefined || canonicalJson(slot.intent) !== canonicalJson(intent) ||
        slot.intent.operationId !== input.operationId || slot.intent.phase !== input.phase ||
        slot.intent.authoritySha256 !== input.executionAuthority.authoritySha256 ||
        slot.intent.launchSha256 !== sha256Json(input.launch)) {
      throw new Error("Closed-session intent does not match its retained one-shot reservation.");
    }
    return slot;
  }

  async function prepareClosedSessionClose(input: ClosedSessionBinding & { readonly windowHandle: string }): Promise<ClosedSessionCloseIntent> {
    const bound = structuredClone(input);
    await closedPolicy();
    const retained = closedBinding(bound);
    text(bound.operationId, /^[A-Za-z0-9._:-]{1,160}$/u);
    text(bound.phase, /^[A-Za-z0-9._:-]{1,160}$/u);
    if (!Number.isSafeInteger(bound.challengeAttempt) || bound.challengeAttempt < 1 ||
        closedSessionSlots.has(bound.launch.jobId) || normalCloseJobs.has(bound.launch.jobId)) {
      throw new Error("This Job already has a close attempt or closed-session reservation.");
    }
    const payload = {
      schema: "easyeda-pro-control.closed-session-close-intent.v1" as const,
      operationId: bound.operationId, phase: bound.phase, challengeAttempt: bound.challengeAttempt,
      authoritySha256: retained.evidence.authoritySha256, captureBindingSha256: retained.receipt.bindingSha256,
      launchSha256: sha256Json(bound.launch), bridgeSessionSha256: retained.bridgeSessionSha256,
      runtimeIdentitySha256: retained.runtimeIdentitySha256, helperInstance: bound.launch.helperInstance,
      jobId: bound.launch.jobId, windowHandle: text(bound.windowHandle, /^[1-9]\d{0,18}$/u),
      preparedAt: new Date().toISOString(), policyId: POLICY_ID, policySha256,
    };
    const intent: ClosedSessionCloseIntent = { ...payload, closeIntentSha256: sha256Json(payload) };
    closedSessionSlots.set(bound.launch.jobId, { intent: structuredClone(intent), dispatched: false, proofInFlight: false });
    return intent;
  }

  async function requestClosedSessionNormalClose(input: ClosedSessionBinding & {
    readonly intent: ClosedSessionCloseIntent; readonly confirmNormalClose: true;
  }): Promise<ClosedSessionCloseReceipt> {
    const bound = structuredClone(input);
    closedBinding(bound);
    const slot = closedSlot(bound, bound.intent);
    // oxlint-disable-next-line typescript/no-unnecessary-boolean-literal-compare -- Preserve exact runtime confirmation even for untyped callers.
    if (bound.confirmNormalClose !== true || slot.dispatched) { throw new Error("Closed-session normal close is not authorized or was already attempted."); }
    // Consume before any await. Failure, missing acknowledgment and lost helper
    // Never grant another close, even if no native dispatch can be established.
    slot.dispatched = true;
    normalCloseJobs.add(bound.launch.jobId);
    await closedPolicy();
    closedBinding(bound);
    const response = record(await transport.request({
      action: "normal-close", confirmNormalClose: true, jobId: bound.launch.jobId,
      helperInstance: bound.launch.helperInstance, rootPid: bound.launch.root.pid, rootStartIdentity: bound.launch.root.startIdentity,
      rootStartTicks: /^win32:(\d+):/u.exec(bound.launch.root.startIdentity)?.[1],
      windowHandle: slot.intent.windowHandle,
    }));
    await closedPolicy();
    closedBinding(bound);
    if (response["closeDispatched"] !== true || response["jobId"] !== bound.launch.jobId ||
        response["saveOrDiscardSelected"] !== false) {
      throw new Error("Closed-session normal-close acknowledgment is missing; do not repeat close.");
    }
    const payload = {
      schema: "easyeda-pro-control.closed-session-close-dispatch.v1" as const,
      closeIntentSha256: slot.intent.closeIntentSha256, closeDispatched: true as const,
      saveOrDiscardSelected: false as const, terminationProved: false as const,
    };
    slot.receipt = { ...payload, closeReceiptSha256: sha256Json(payload) };
    return structuredClone(slot.receipt);
  }

  async function proveClosedSession(input: ClosedSessionBinding & {
    readonly intent: ClosedSessionCloseIntent; readonly closeReceipt: ClosedSessionCloseReceipt;
  }): Promise<ClosedSessionTerminationProof> {
    const bound = structuredClone(input), slot = closedSlot(bound, bound.intent);
    await closedPolicy();
    const retained = closedBinding(bound, slot.proof === undefined);
    if (!slot.dispatched || slot.receipt === undefined || canonicalJson(slot.receipt) !== canonicalJson(bound.closeReceipt)) {
      throw new Error("Closed-session proof requires its original acknowledged one-shot normal close.");
    }
    // Export the same completed proof; never consume or release any capture.
    if (slot.proof !== undefined) { return exportClosedProof(bound, slot); }
    if (slot.proofInFlight) { throw new Error("Closed-session termination proof is already in progress."); }
    slot.proofInFlight = true;
    try {
      const receipt = record(await transport.request({
        action: "prove-terminated", captureBindingSha256: retained.receipt.bindingSha256,
        helperInstance: retained.receipt.helperInstance, jobId: retained.receipt.jobId,
      }));
      await closedPolicy();
      closedBinding(bound);
      const checkedAt = date(receipt["checkedAt"]);
      if (receipt["captureBindingSha256"] !== retained.receipt.bindingSha256 ||
          receipt["helperInstance"] !== retained.receipt.helperInstance || receipt["jobId"] !== retained.receipt.jobId ||
          receipt["jobEmpty"] !== true || receipt["retainedProcessesExited"] !== true ||
          Date.parse(checkedAt) < Date.parse(retained.receipt.capturedAt)) {
        throw new Error("Closed-session helper did not prove the entire retained Job and process generations terminated.");
      }
      const payload = {
        schema: "easyeda-pro-control.closed-session-termination.v1" as const,
        operationId: bound.operationId, phase: bound.phase, challengeAttempt: bound.challengeAttempt,
        closeIntentSha256: slot.intent.closeIntentSha256, closeReceiptSha256: slot.receipt.closeReceiptSha256,
        authoritySha256: retained.evidence.authoritySha256, launchSha256: slot.intent.launchSha256,
        bridgeSessionSha256: retained.bridgeSessionSha256, runtimeIdentitySha256: retained.runtimeIdentitySha256,
        helperInstance: retained.receipt.helperInstance, jobId: retained.receipt.jobId,
        closedAt: checkedAt, jobEmpty: true as const, retainedProcessesExited: true as const,
        saveOrDiscardSelected: false as const, policyId: POLICY_ID, policySha256,
        queuedWritesPersisted: "not-proved" as const, persistentWorkReplayExcluded: "not-proved" as const,
      };
      slot.proof = { ...payload, proofSha256: sha256Json(payload) };
      retainClock(slot.proof, receipt, "termination", {
        operationId: bound.operationId, phase: bound.phase, challengeAttempt: bound.challengeAttempt,
        authoritySha256: retained.evidence.authoritySha256, closeIntentSha256: slot.intent.closeIntentSha256,
        captureBindingSha256: retained.receipt.bindingSha256,
      });
      slot.proofLifecycleEpoch = lifecycleEpoch;
      return exportClosedProof(bound, slot);
    } finally { slot.proofInFlight = false; }
  }

  function exportClosedProof(binding: ClosedSessionBinding, slot: ClosedSessionSlot): ClosedSessionTerminationProof {
    if (slot.proof === undefined) { throw new Error("Closed-session proof is not terminal."); }
    const retainedBinding = structuredClone(binding);
    const proof: ClosedSessionTerminationProof = Object.freeze({
      ...structuredClone(slot.proof), [CLOSED_SESSION_PROOF_BRAND]: true as const,
    });
    async function verify(): Promise<ClosedSessionTerminationProof> {
      await closedPolicy();
      closedBinding(retainedBinding, false);
      if (closedSessionSlots.get(retainedBinding.launch.jobId) !== slot ||
          canonicalJson(slot.proof) !== canonicalJson(proof)) {
        throw new Error("Closed-session proof no longer matches its retained terminal receipt.");
      }
      return proof;
    }
    const clockObservation = originalClocks.get(slot.proof);
    if (clockObservation !== undefined) { originalClocks.set(proof, clockObservation); }
    function verifyCopyCurrent(): void {
      requireOwned();
      if (typeof retainedTransportCheck !== "function" || transport.assertClosedSessionAvailable !== retainedTransportCheck ||
          policy.revalidateClosedSessionHelper !== reviewedHelperCheck || policy.expectedExecutable !== executable ||
          policySha256 !== sha256Json({ schema: HELPER_SCHEMA, policyId: POLICY_ID,
            helperSha256: hash(policy.helperSha256), expectedExecutableSha256: hash(policy.expectedExecutableSha256),
            reviewedExecutionScopeSha256: hash(policy.reviewedExecutionScopeSha256),
            containment: "atomic-launch-job-list:no-breakaway:no-kill-on-close:retained-handles",
            excluded: "outside-job-brokers-services-and-unreviewed-delegation" })) {
        throw new Error("Closed-session copy owner or source policy changed.");
      }
      retainedTransportCheck();
      closedBinding(retainedBinding);
      if (closedSessionSlots.get(retainedBinding.launch.jobId) !== slot || canonicalJson(slot.proof) !== canonicalJson(proof) ||
          slot.proofLifecycleEpoch !== lifecycleEpoch) {
        throw new Error("Closed-session copy authority was invalidated by an intervening lifecycle action.");
      }
    }
    closedProofOwners.set(proof, {
      verify,
      verifyCopyCurrent,
      async verifyCopy() {
        await verify();
        closedBinding(retainedBinding);
        if (slot.proofLifecycleEpoch !== lifecycleEpoch) {
          throw new Error("Closed-session copy authority was invalidated by an intervening lifecycle action.");
        }
        return proof;
      },
    });
    return proof;
  }

  /** Repeat only this read-only probe while its exact native result says live.
   * The existing proof path remains strict; matching Error text is not evidence.
   */
  async function probeClosedSessionTermination(input: ClosedSessionBinding & {
    readonly intent: ClosedSessionCloseIntent; readonly closeReceipt: ClosedSessionCloseReceipt;
  }): Promise<ClosedSessionTerminationObservation> {
    const bound = structuredClone(input), callerText = canonicalJson(input);
    const retained = closedBinding(bound), slot = closedSlot(bound, bound.intent);
    const epoch = lifecycleEpoch, priorRequestSequence = clockSource?.requestSequence();
    function current(): void {
      requireOwned(); clockSource?.assertSource();
      if (retainedTransportCheck === undefined || transport.assertClosedSessionAvailable !== retainedTransportCheck ||
          reviewedHelperCheck === undefined || policy.revalidateClosedSessionHelper !== reviewedHelperCheck ||
          policy.expectedExecutable !== executable || policySha256 !== sha256Json({
            schema: HELPER_SCHEMA, policyId: POLICY_ID, helperSha256: hash(policy.helperSha256),
            expectedExecutableSha256: hash(policy.expectedExecutableSha256), reviewedExecutionScopeSha256: hash(policy.reviewedExecutionScopeSha256),
            containment: "atomic-launch-job-list:no-breakaway:no-kill-on-close:retained-handles",
            excluded: "outside-job-brokers-services-and-unreviewed-delegation" })) {
        throw new Error("Closed-session observation policy or retained helper changed.");
      }
      retainedTransportCheck();
      if (canonicalJson(input) !== callerText || lifecycleEpoch !== epoch ||
          closedSlot(bound, bound.intent) !== slot || closedBinding(bound) !== retained ||
          !slot.dispatched || slot.receipt === undefined || canonicalJson(slot.receipt) !== canonicalJson(bound.closeReceipt)) {
        throw new Error("Closed-session pending probe owner, input or acknowledged close changed.");
      }
    }
    current();
    try {
      const proof = await proveClosedSession(bound);
      current();
      const observation = Object.freeze({ status: "terminated" as const, proof });
      terminationObservationOwners.set(observation, (): void => { current(); assertCurrentClosedSessionCopyAuthority(proof); });
      return observation;
    } catch (error) {
      const refusal = clockSource?.nativeRefusal(error);
      if (clockSource === undefined || refusal === undefined || priorRequestSequence === undefined ||
          refusal.requestSequence <= priorRequestSequence || refusal.requestSequence !== clockSource.requestSequence() ||
          refusal.action !== "clocked-prove-terminated" || refusal.captureBindingSha256 !== retained.receipt.bindingSha256 ||
          refusal.helperInstance !== retained.receipt.helperInstance || refusal.jobId !== retained.receipt.jobId ||
          (refusal.code !== "authority-prior-job-not-empty" && refusal.code !== "authority-retained-process-still-live")) {
        throw error;
      }
      const native = refusal, source = clockSource;
      const originalFailure = (): void => {
        current(); clockSource?.assertTransport();
        if (qualifiedClockSources.get(transport) !== clockSource || slot.proof !== undefined || slot.proofInFlight ||
            source.nativeRefusal(error) !== native || source.requestSequence() !== native.requestSequence) {
          throw new Error("Closed-session pending probe no longer owns its original native refusal.", { cause: error });
        }
      };
      originalFailure();
      await closedPolicy(); originalFailure();
      await clockSource.revalidate(); originalFailure();
      const observation: ClosedSessionPendingObservation = Object.freeze({
        schema: "easyeda-pro-control.closed-session-pending.v1", status: "pending",
        operationId: bound.operationId, phase: bound.phase, challengeAttempt: bound.challengeAttempt,
        closeIntentSha256: slot.intent.closeIntentSha256, closeReceiptSha256: bound.closeReceipt.closeReceiptSha256,
        authoritySha256: retained.evidence.authoritySha256, launchSha256: slot.intent.launchSha256,
        bridgeSessionSha256: retained.bridgeSessionSha256, runtimeIdentitySha256: retained.runtimeIdentitySha256,
        helperInstance: retained.receipt.helperInstance, jobId: retained.receipt.jobId,
        nativeCode: refusal.code, nativeRequestId: refusal.requestId,
        terminationProved: false, completionProved: false, executionAuthorized: false,
        saveOrDiscardSelected: false,
      });
      terminationObservationOwners.set(observation, originalFailure);
      return observation;
    }
  }

  return {
    capture, proveTerminated, prepareClosedSessionClose, requestClosedSessionNormalClose, proveClosedSession, probeClosedSessionTermination, observeCurrentClock,
    async releaseCapture(evidence) {
      lifecycleEpoch += 1;
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
      lifecycleEpoch += 1;
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
      retainClock(launch, response, "launch", { executable, executableSha256: policy.expectedExecutableSha256,
        launchSha256: sha256Json(launch) });
      return launch;
    },
    async observeExistingApplication() {
      const epoch = lifecycleEpoch;
      function current(): void {
        requireOwned();
        if (lifecycleEpoch !== epoch || policy.revalidateClosedSessionHelper !== reviewedHelperCheck ||
            transport.assertClosedSessionAvailable !== retainedTransportCheck) {
          throw new Error("Existing application observation lost its original supervisor ownership.");
        }
        retainedTransportCheck?.();
      }
      current();
      await reviewedHelperCheck?.();
      current();
      const response = record(await transport.request({ action: "observe-existing-application", executable }));
      current();
      await reviewedHelperCheck?.();
      current();
      if (Object.keys(response).length !== 1 || typeof response["running"] !== "boolean") {
        throw new Error("Existing application observation is malformed.");
      }
      return { running: response["running"] };
    },
    async observeLaunchTermination(launch) {
      const epoch = lifecycleEpoch, launchText = canonicalJson(launch);
      function current(): void {
        requireOwned();
        if (currentLaunch === undefined || canonicalJson(currentLaunch) !== launchText ||
            canonicalJson(launch) !== launchText || lifecycleEpoch !== epoch ||
            policy.revalidateClosedSessionHelper !== reviewedHelperCheck ||
            transport.assertClosedSessionAvailable !== retainedTransportCheck) {
          throw new Error("Launch termination observation requires the unchanged original supervised generation.");
        }
        retainedTransportCheck?.();
      }
      current();
      await reviewedHelperCheck?.();
      current();
      const response = record(await transport.request({
        action: "observe-launch-termination", jobId: launch.jobId, helperInstance: launch.helperInstance,
        rootPid: launch.root.pid, rootStartIdentity: launch.root.startIdentity,
      }));
      current();
      await reviewedHelperCheck?.();
      current();
      if (Object.keys(response).toSorted().join(",") !== "helperInstance,jobId,terminated" ||
          response["jobId"] !== launch.jobId || response["helperInstance"] !== launch.helperInstance ||
          typeof response["terminated"] !== "boolean") {
        throw new Error("Retained launch termination observation is malformed or belongs to another owner.");
      }
      return { jobId: launch.jobId, helperInstance: launch.helperInstance, terminated: response["terminated"] };
    },
    async observeApplicationWindow(launch) {
      const epoch = lifecycleEpoch, launchText = canonicalJson(launch);
      function current(): void {
        requireOwned();
        if (currentLaunch === undefined || canonicalJson(currentLaunch) !== launchText ||
            canonicalJson(launch) !== launchText || lifecycleEpoch !== epoch ||
            policy.revalidateClosedSessionHelper !== reviewedHelperCheck ||
            transport.assertClosedSessionAvailable !== retainedTransportCheck) {
          throw new Error("Application window observation requires the unchanged original supervised generation.");
        }
        retainedTransportCheck?.();
      }
      current();
      await reviewedHelperCheck?.();
      current();
      const response = record(await transport.request({
        action: "observe-application-window", jobId: launch.jobId, helperInstance: launch.helperInstance,
        rootPid: launch.root.pid, rootStartIdentity: launch.root.startIdentity,
        rootStartTicks: /^win32:(\d+):/u.exec(launch.root.startIdentity)?.[1],
      }));
      current();
      await reviewedHelperCheck?.();
      current();
      const hwnd = response["hwnd"], outcome = response["outcome"];
      if (Object.keys(response).toSorted().join(",") !== "helperInstance,hwnd,jobId,outcome" ||
          response["jobId"] !== launch.jobId || response["helperInstance"] !== launch.helperInstance ||
          (outcome !== "available" && outcome !== "unavailable" && outcome !== "ambiguous") ||
          (outcome === "available" ? typeof hwnd !== "string" || !/^[1-9]\d{0,18}$/u.test(hwnd) : hwnd !== null)) {
        throw new Error("Application window observation is malformed or belongs to another owner.");
      }
      return { jobId: launch.jobId, helperInstance: launch.helperInstance, outcome, hwnd: outcome === "available" ? text(hwnd, /^[1-9]\d{0,18}$/u) : null };
    },
    async requestNormalClose(input) {
      const epoch = lifecycleEpoch, launch = structuredClone(input.launch), launchText = canonicalJson(launch);
      const windowHandle = text(input.windowHandle, /^[1-9]\d{0,18}$/u);
      function current(): void {
        requireOwned();
        // oxlint-disable-next-line typescript/no-unnecessary-boolean-literal-compare -- Preserve exact runtime confirmation for untyped callers.
        if (input.confirmNormalClose !== true || currentLaunch === undefined || canonicalJson(currentLaunch) !== launchText ||
            canonicalJson(input.launch) !== launchText || input.windowHandle !== windowHandle || lifecycleEpoch !== epoch ||
            policy.revalidateClosedSessionHelper !== reviewedHelperCheck || transport.assertClosedSessionAvailable !== retainedTransportCheck) {
          throw new Error("Normal close requires the unchanged exact supervised application generation.");
        }
        retainedTransportCheck?.();
      }
      current();
      if (closedSessionSlots.has(launch.jobId)) { throw new Error("This Job has a reserved closed-session close; generic close cannot bypass it."); }
      if (normalCloseJobs.has(launch.jobId)) { throw new Error("This Job already has a normal-close attempt; do not repeat close."); }
      // Consume before every await, including source revalidation. An uncertain
      // Request, failed acknowledgment or changed owner never permits a retry.
      normalCloseJobs.add(launch.jobId);
      await reviewedHelperCheck?.();
      current();
      const rootStartTicks = /^win32:(\d+):/u.exec(launch.root.startIdentity)?.[1];
      const response = record(await transport.request({
        action: "normal-close", confirmNormalClose: true, jobId: launch.jobId,
        helperInstance: launch.helperInstance, rootPid: launch.root.pid, rootStartIdentity: launch.root.startIdentity,
        rootStartTicks, windowHandle,
      }));
      current();
      await reviewedHelperCheck?.();
      current();
      if (Object.keys(response).toSorted().join(",") !== "closeDispatched,jobId,saveOrDiscardSelected" ||
          response["closeDispatched"] !== true || response["jobId"] !== launch.jobId ||
          response["saveOrDiscardSelected"] !== false) {throw new Error("Normal close dispatch is unproven; do not retry blindly.");}
    },
    async release() {
      lifecycleEpoch += 1;
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
  if (options.expectedHelperSha256 !== undefined && hash(options.expectedHelperSha256) !== helperSha256) {
    throw new Error("Windows authority helper differs from the reviewed capability pin.");
  }
  const child = spawn(options.powershellExecutable, [
    "-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", options.helperWindowsPath,
  ], { stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
  let pending: { readonly id: string; readonly request: Omit<NativeTerminationRefusal, "code">;
    readonly resolve: (value: unknown) => void; readonly reject: (error: Error) => void } | undefined;
  const nativeRefusals = new WeakMap<Error, NativeTerminationRefusal>();
  let requestSequence = 0;
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
        nativeRefusals.set(error, Object.freeze({ ...request.request, code: error.message }));
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
    assertClosedSessionAvailable() {
      if (failed || child.exitCode !== null || child.signalCode !== null) {
        throw new Error("Closed-session retained helper or process handles are unavailable.");
      }
    },
    async request(request) {
      if (failed || pending !== undefined) {throw new Error("Windows authority helper is unavailable or already executing a request.");}
      const id = randomBytes(16).toString("hex");
      const response = Promise.withResolvers<unknown>();
      requestSequence += 1;
      const requestIdentity = Object.freeze({ requestId: id, requestSequence,
        action: Object.getOwnPropertyDescriptor(request, "action")?.value as unknown,
        captureBindingSha256: Object.getOwnPropertyDescriptor(request, "captureBindingSha256")?.value as unknown,
        helperInstance: Object.getOwnPropertyDescriptor(request, "helperInstance")?.value as unknown,
        jobId: Object.getOwnPropertyDescriptor(request, "jobId")?.value as unknown });
      pending = { id, request: requestIdentity, resolve: response.resolve, reject: response.reject };
      const deadline = setTimeout(fail, 15_000);
      child.stdin.write(`${JSON.stringify({ ...request, id })}\n`);
      try { return await response.promise; } finally { clearTimeout(deadline); }
    },
    async release() {
      fail();
      await closed.promise;
    },
  };
  async function revalidateClosedSessionHelper(): Promise<void> {
    const before = await lstat(options.helperPath);
    if (!before.isFile() || before.isSymbolicLink() || before.nlink !== 1 ||
        before.dev !== helperStat.dev || before.ino !== helperStat.ino ||
        before.size !== helperStat.size || before.mtimeMs !== helperStat.mtimeMs ||
        before.ctimeMs !== helperStat.ctimeMs || await realpath(options.helperPath) !== options.helperPath ||
        createHash("sha256").update(await readFile(options.helperPath)).digest("hex") !== helperSha256) {
      throw new Error("Closed-session reviewed helper source changed.");
    }
    const after = await lstat(options.helperPath);
    if (after.dev !== before.dev || after.ino !== before.ino || after.size !== before.size ||
        after.mtimeMs !== before.mtimeMs || after.ctimeMs !== before.ctimeMs || after.nlink !== 1 || after.isSymbolicLink()) {
      throw new Error("Closed-session helper source changed during verification.");
    }
  }
  // Only this actual child path can qualify clock observations. The public
  // Transport factory and caller-provided hashes never populate this registry.
  let expectedHelperWindowsPath: string | undefined;
  const distribution = process.env["WSL_DISTRO_NAME"];
  if (/^\/mnt\/[a-z]\//u.test(options.helperPath)) {
    expectedHelperWindowsPath = `${options.helperPath[5]?.toUpperCase()}:\\${options.helperPath.slice(7).replaceAll("/", "\\")}`;
  } else if (distribution !== undefined && /^[A-Za-z0-9][A-Za-z0-9_.-]{0,127}$/u.test(distribution)) {
    expectedHelperWindowsPath = `\\\\wsl.localhost\\${distribution}${options.helperPath.replaceAll("/", "\\")}`;
  }
  const sourceBinding = canonicalJson({ helperPath: options.helperPath, helperWindowsPath: options.helperWindowsPath,
    powershellExecutable: options.powershellExecutable, reviewedExecutionScopeSha256: options.reviewedExecutionScopeSha256,
    expectedExecutable: options.expectedExecutable, expectedExecutableSha256: options.expectedExecutableSha256 });
  if (helperSha256 === REVIEWED_CLOCK_HELPER_SHA256 && expectedHelperWindowsPath === options.helperWindowsPath &&
      options.powershellExecutable === "/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe") {
    const clocked = createClockedTransport(transport, { helperSourceSha256: helperSha256, executionScopeSha256: options.reviewedExecutionScopeSha256 });
    const clockTransport = clocked.transport;
    const availabilityMethod = clockTransport.assertClosedSessionAvailable, releaseMethod = clockTransport.release, requestMethod = clockTransport.request;
    const assertTransport = (): void => {
      if (clockTransport.request !== requestMethod || clockTransport.release !== releaseMethod ||
          clockTransport.assertClosedSessionAvailable !== availabilityMethod || availabilityMethod === undefined) {
        throw new Error("Source-qualified clock transport changed.");
      }
      availabilityMethod.call(clockTransport);
    };
    const currentSource = (): void => {
          if (canonicalJson({ helperPath: options.helperPath, helperWindowsPath: options.helperWindowsPath,
            powershellExecutable: options.powershellExecutable, reviewedExecutionScopeSha256: options.reviewedExecutionScopeSha256,
            expectedExecutable: options.expectedExecutable, expectedExecutableSha256: options.expectedExecutableSha256 }) !== sourceBinding) {
            throw new Error("Source-qualified clock helper binding changed.");
          }
          assertTransport();
    };
    qualifiedClockSources.set(clockTransport, { originalAttachment: clocked.originalAttachment, assertTransport, assertSource: currentSource,
      nativeRefusal: (error) => error instanceof Error ? nativeRefusals.get(error) : undefined,
      requestSequence: () => requestSequence,
      async revalidate() {
        currentSource(); await revalidateClosedSessionHelper(); currentSource();
      } });
    return createWindowsAuthoritySupervisor(clockTransport, { ...options, helperSha256, revalidateClosedSessionHelper });
  }
  return createWindowsAuthoritySupervisor(transport, { ...options, helperSha256, revalidateClosedSessionHelper });
}
