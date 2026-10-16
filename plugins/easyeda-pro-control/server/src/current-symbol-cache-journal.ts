/** Pure checks of the maintained executor's journal transitions. Matching data
 * is not original process authority, a disk lock or an authenticated journal.
 */
import { isDeepStrictEqual } from "node:util";
import { sha256Json } from "./core.ts";
import type { AuthenticatedBridgeDispatchBinding, ClosedSessionAuthorityCapture, ExecutionAuthorityEvidence, ExecutionAuthorityProcessIdentity, TrackedDispatchOperationJournal } from "./engine.ts";
import type { WindowsAuthorityLaunch } from "./windows-authority.ts";

type Journal = TrackedDispatchOperationJournal;
const HASH = /^[a-f0-9]{64}$/u;
const ID = /^[A-Za-z0-9_-]{43}$/u;
const MARK_FIELDS = ["runtimeIdentityBeforeOrphan", "bridgeSessionBeforeOrphan", "bridgeDispatchBeforeOrphan", "executionAuthorityBeforeOrphan",
  "orphanedCallPossible", "orphanedCallPhase", "orphanedCallMarkedAt", "orphanedCallReturnedAt", "runtimeRestartChallengeAttempt",
  "runtimeRestartChallenge", "runtimeRestartChallengeIssuedAt", "runtimeRestartBoundary", "updatedAt", "journalSha256"] as const;
const CLEAR_FIELDS = ["orphanedCallPossible", "orphanedCallReturnedAt", "runtimeRestartChallenge", "runtimeRestartChallengeIssuedAt", "updatedAt", "journalSha256"] as const;
function need(value: boolean, detail: string): asserts value { if (!value) { throw new Error(`Current symbol cache journal ${detail} refused.`); } }
function exactBoolean(value: unknown, expected: boolean): boolean { return value === expected; }
function data(value: object): Record<string, unknown> {
  need(Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null, "object");
  const result: Record<string, unknown> = {};
  for (const key of Reflect.ownKeys(value)) {
    need(typeof key === "string", "symbol field");
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    need(descriptor !== undefined && descriptor.enumerable === true && Object.hasOwn(descriptor, "value") && descriptor.value !== undefined, "own data field");
    Object.defineProperty(result, key, { value: descriptor.value as unknown, enumerable: true, configurable: true });
  }
  return result;
}
function seal(value: Journal): void {
  const core = data(value), hash = core["journalSha256"]; delete core["journalSha256"];
  need(typeof hash === "string" && HASH.test(hash) && hash === sha256Json(core), "self-seal");
}
function unchanged(before: Journal, after: Journal, permitted: readonly string[]): void {
  const left = data(before), right = data(after);
  for (const key of permitted) { Reflect.deleteProperty(left, key); Reflect.deleteProperty(right, key); }
  need(isDeepStrictEqual(left, right), "invariant projection");
}
function timestamp(value: unknown): number {
  need(typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value), "timestamp");
  const parsed = Date.parse(value);
  need(Number.isFinite(parsed) && new Date(parsed).toISOString() === value, "timestamp");
  return parsed;
}
function attempt(value: unknown): number {
  need(typeof value === "number" && Number.isSafeInteger(value) && value >= 0, "attempt"); return value;
}
function phase(value: string): void {
  need(typeof value === "string" && value.length <= 160 && /^[A-Za-z0-9._:-]+$/u.test(value), "phase");
}
function markedFields(value: Journal, expectedPhase: string): void {
  phase(expectedPhase);
  need(exactBoolean(value.orphanedCallPossible, true) && value.orphanedCallPhase === expectedPhase &&
    !Object.hasOwn(value, "orphanedCallReturnedAt") && !Object.hasOwn(value, "runtimeRestartBoundary"), "marked state");
  const ordinal = attempt(value.runtimeRestartChallengeAttempt);
  need(ordinal > 0 && typeof value.operationId === "string" && value.operationId.length <= 160 && /^[A-Za-z0-9._:-]+$/u.test(value.operationId), "operation");
  const prefix = `EASYEDA_RESTARTED_AND_RECONNECTED:${value.operationId}:${expectedPhase}:${String(ordinal)}:`;
  const challenge = value.runtimeRestartChallenge;
  need(typeof challenge === "string" && challenge.startsWith(prefix) &&
    /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/u.test(challenge.slice(prefix.length)), "challenge");
  need(timestamp(value.orphanedCallMarkedAt) <= timestamp(value.runtimeRestartChallengeIssuedAt) &&
    timestamp(value.runtimeRestartChallengeIssuedAt) <= timestamp(value.updatedAt), "marked timestamp order");
}
function authority(value: ExecutionAuthorityEvidence, launch: WindowsAuthorityLaunch): void {
  const payload = data(value);
  const hash = payload["authoritySha256"]; delete payload["authoritySha256"];
  need(value.schema === "easyeda-pro-control.execution-authority.v1" && typeof hash === "string" && HASH.test(hash) && hash === sha256Json(payload) &&
    typeof value.bindingSha256 === "string" && HASH.test(value.bindingSha256) && typeof value.policySha256 === "string" && HASH.test(value.policySha256) &&
    typeof value.policyId === "string" && /^[a-z0-9][a-z0-9._:-]{0,127}$/iu.test(value.policyId) &&
    typeof value.capturedAt === "string" && Number.isFinite(Date.parse(value.capturedAt)), "execution authority");
  need(typeof launch.jobId === "string" && /^[a-f0-9]{32}$/u.test(launch.jobId) && typeof launch.helperInstance === "string" &&
    /^[a-f0-9]{32}$/u.test(launch.helperInstance) && launch.root.role === "easyeda-main", "launch");
  const processes = value.processes;
  need(Array.isArray(processes) && processes.length > 0 && processes.length <= 512 &&
    processes.every((process: ExecutionAuthorityProcessIdentity) => typeof process.pid === "number" && Number.isSafeInteger(process.pid) && process.pid > 0 &&
      typeof process.role === "string" && /^[a-z0-9][a-z0-9._:-]{0,63}$/iu.test(process.role) &&
      typeof process.startIdentity === "string" && /^win32:[0-9]{15,20}:job:[a-f0-9]{32}$/u.test(process.startIdentity) &&
      process.startIdentity.endsWith(`:job:${launch.jobId}`)) && new Set(processes.map((process: ExecutionAuthorityProcessIdentity) => process.pid)).size === processes.length &&
    value.processTreeSha256 === sha256Json(processes), "process tree");
  const roots = processes.filter((process: ExecutionAuthorityProcessIdentity) => process.role === "easyeda-main");
  need(roots.length === 1 && isDeepStrictEqual(roots[0], launch.root), "root or Job");
}

/** The caller still revalidates original capture ownership and exact disk bytes. */
export function assertCurrentSymbolCacheMark(before: Journal, marked: Journal, expected: Readonly<{
  phase: string; bridgeDispatch: AuthenticatedBridgeDispatchBinding; capture: ClosedSessionAuthorityCapture; launch: WindowsAuthorityLaunch;
}>): void {
  seal(before); seal(marked); unchanged(before, marked, MARK_FIELDS); markedFields(marked, expected.phase);
  const previousAttempt = attempt(before.runtimeRestartChallengeAttempt ?? 0);
  need(exactBoolean(before.orphanedCallPossible, false) && previousAttempt < Number.MAX_SAFE_INTEGER && marked.runtimeRestartChallengeAttempt === previousAttempt + 1 &&
    timestamp(before.updatedAt) <= timestamp(marked.orphanedCallMarkedAt), "fresh mark");
  const { bridgeDispatch, capture, launch } = expected;
  const runtime = capture.runtimeIdentity, session = capture.bridgeSession;
  need(capture.operationId === before.operationId && (capture.phase === "closed-edit" || capture.phase === "closed-verification") && capture.challengeAttempt === 1 &&
    isDeepStrictEqual(marked.bridgeSessionBeforeOrphan, session) && isDeepStrictEqual(marked.runtimeIdentityBeforeOrphan, runtime) &&
    isDeepStrictEqual(marked.bridgeDispatchBeforeOrphan, bridgeDispatch), "selected capture or scope");
  need(typeof session.gatewayInstanceId === "string" && ID.test(session.gatewayInstanceId) && typeof session.sessionId === "string" && ID.test(session.sessionId) &&
    typeof session.authenticationReceiptSha256 === "string" && HASH.test(session.authenticationReceiptSha256) &&
    Number.isSafeInteger(session.sequence) && session.sequence > 0 && Number.isSafeInteger(session.authenticatedAtEpochMs) && session.authenticatedAtEpochMs > 0 &&
    bridgeDispatch.schema === "easyeda-pro-control.bridge-dispatch-lease.v1" && bridgeDispatch.gatewayInstanceId === session.gatewayInstanceId &&
    bridgeDispatch.sessionId === session.sessionId && bridgeDispatch.sessionSequence === session.sequence &&
    Number.isSafeInteger(bridgeDispatch.begunAtEpochMs) && bridgeDispatch.begunAtEpochMs >= session.authenticatedAtEpochMs &&
    typeof bridgeDispatch.leaseId === "string" && ID.test(bridgeDispatch.leaseId) && typeof bridgeDispatch.bindingReceipt === "string" && ID.test(bridgeDispatch.bindingReceipt), "session or scope");
  need(runtime.kind === "runtime-identity" && typeof runtime.generation === "string" && runtime.generation.length >= 24 &&
    typeof runtime.timeOrigin === "number" && Number.isFinite(runtime.timeOrigin) && runtime.timeOrigin > 0 &&
    (runtime.processId === null || typeof runtime.processId === "number" && Number.isSafeInteger(runtime.processId) && runtime.processId > 0), "runtime identity");
  const evidence = marked.executionAuthorityBeforeOrphan;
  need(evidence !== undefined, "missing execution authority"); authority(evidence, launch); authority(capture.executionAuthority, launch);
  need(evidence.bindingSha256 === sha256Json({ schema: "easyeda-pro-control.execution-authority-binding.v1", operationId: marked.operationId,
    orphanPhase: expected.phase, challengeAttempt: marked.runtimeRestartChallengeAttempt, bridgeSession: session, bridgeDispatch, runtimeIdentity: runtime }) &&
    evidence.policyId === capture.executionAuthority.policyId && evidence.policySha256 === capture.executionAuthority.policySha256 &&
    (runtime.processId === null || evidence.processes.some((process) => process.pid === runtime.processId && process.role === "renderer")), "authority binding");
}

/** Only the executor's clear fields may change; all retained evidence stays exact. */
export function assertCurrentSymbolCacheClear(marked: Journal, cleared: Journal, expectedPhase: string): void {
  seal(marked); seal(cleared); markedFields(marked, expectedPhase); unchanged(marked, cleared, CLEAR_FIELDS);
  need(exactBoolean(cleared.orphanedCallPossible, false) && cleared.orphanedCallPhase === expectedPhase &&
    !Object.hasOwn(cleared, "runtimeRestartChallenge") && !Object.hasOwn(cleared, "runtimeRestartChallengeIssuedAt") &&
    timestamp(marked.updatedAt) <= timestamp(cleared.orphanedCallReturnedAt) && timestamp(cleared.orphanedCallReturnedAt) <= timestamp(cleared.updatedAt), "cleared state");
}
