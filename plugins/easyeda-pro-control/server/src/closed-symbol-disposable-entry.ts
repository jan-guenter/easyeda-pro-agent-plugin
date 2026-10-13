/** Disposable-validation entry. Ordinary action gates remain unchanged;
 * fixed native stages enforce their own prerequisites and completion checks. */
/* oxlint-disable import/max-dependencies -- Fixed internal owners and issuers remain explicit; do not replace them with supplied providers. */
import { randomBytes } from "node:crypto";
import { canonicalJson, sha256Json } from "./core.ts";
import type { EasyedaControlEngine, SerializedGate } from "./engine.ts";
import type { UpstreamEasyedaClient } from "./upstream.ts";
import type { WindowsControlRuntime } from "./windows-runtime.ts";
import type { WindowsNativeUiController } from "./windows-native-ui.ts";
import { currentProcessSqlRuntime } from "./machine-profile.ts";
import type { MachineProfile } from "./machine-profile.ts";
import { buildClosedSymbolExpectedFingerprint } from "./closed-symbol-expected-fingerprint.ts";
import type { ClosedSymbolExpectedFingerprint } from "./closed-symbol-expected-fingerprint.ts";
import { VALIDATION_ACTION_ID, claimClosedSymbolValidationTarget } from "./closed-symbol-target-claim.ts";
import type { ClosedSymbolTargetClaim } from "./closed-symbol-target-claim.ts";
import { parseClosedSymbolValidationRequest } from "./closed-symbol-validation-request.ts";
import type { ClosedSymbolValidationRequest } from "./closed-symbol-validation-request.ts";
import type { ClosedSymbolPlan } from "./closed-symbol-journal.ts";
import { WITNESS_NATIVE_PINS_SHA256 } from "./closed-symbol-native-profile.ts";
import type { ClosedSymbolCoordinator, FinalEvidenceRecord } from "./closed-symbol-coordinator.ts";
import type { ClosedSymbolTerminalStage, OriginalTerminalCompletion, assertOriginalClosedSymbolCompletion } from "./closed-symbol-terminal.ts";
import type { ClosedSymbolAgedTerminalStage, OriginalAgedTerminalCompletion, assertOriginalAgedClosedSymbolCompletion } from "./closed-symbol-aged-terminal.ts";

type Kind = "locked" | "aged-unlocked";
type Phase = "request" | "queue" | "admission" | "sql-runtime" | "expectation" | "construction" | "claim" | "coordinator" | "terminal" | "projection";
type ClaimState = "not-attempted" | "publication-unknown" | "acknowledged";
type Descriptor = Readonly<{ path: string; bytes: number; sha256: string }>;
interface Common {
  readonly profile: "easyeda-pro-control.closed-symbol-disposable-result.v1";
  readonly action: "run-disposable-once"; readonly replayAllowed: false;
  readonly executionAuthorized: false; readonly saved: false; readonly reopened: false;
}
export type ClosedSymbolDisposableResult = Common & (
  Readonly<{ outcome: "completed"; operationId: string; headEligibility: Kind; claimState: "acknowledged";
    claimArtifact: Descriptor; terminalArtifact: Descriptor; bodySha256: string;
    completionProved: true; historicalCompletionRecorded: true; explicitSavePerformed: false; targetEditorOpened: false }> |
  Readonly<{ outcome: "stopped"; phase: Phase; reason: "entry-already-used" | "validation-stopped";
    operationId: string | null; claimState: ClaimState; claimArtifact: Descriptor | null;
    terminalArtifact: Descriptor | null; completionProved: false; historicalCompletionRecorded: "not-checked";
    nextSafeAction: "Inspect retained evidence. Do not repeat this request or any native phase." }>);
const COMMON: Common = Object.freeze({ profile: "easyeda-pro-control.closed-symbol-disposable-result.v1", action: "run-disposable-once",
  replayAllowed: false, executionAuthorized: false, saved: false, reopened: false });
const attempts = new WeakSet<WindowsControlRuntime>();
function need(value: boolean, message: string): asserts value { if (!value) { throw new Error(message); } }
function method(owner: object, key: string): unknown {
  let current: object | null = owner;
  for (let depth = 0; current !== null && depth < 8; depth += 1) {
    const item = Object.getOwnPropertyDescriptor(current, key);
    if (item !== undefined) { need(Object.hasOwn(item, "value") && typeof item.value === "function", "Disposable entry owner method changed."); return item.value as unknown; }
    const parent: unknown = Object.getPrototypeOf(current);
    need(parent === null || typeof parent === "object", "Disposable entry owner prototype changed."); current = parent;
  }
  throw new Error("Disposable entry owner method is unavailable.");
}
function descriptor(value: Descriptor): Descriptor {
  need(typeof value.path === "string" && value.path.length <= 4096 && value.path.startsWith("/") && !/[\0\r\n]/u.test(value.path) &&
    Number.isSafeInteger(value.bytes) && value.bytes > 0 && value.bytes <= 131_072 && /^[a-f0-9]{64}$/u.test(value.sha256), "Disposable result descriptor refused.");
  return Object.freeze({ path: value.path, bytes: value.bytes, sha256: value.sha256 });
}
function response<T extends ClosedSymbolDisposableResult>(value: T): T {
  need(Buffer.byteLength(JSON.stringify(value)) <= 16_384, "Disposable result exceeds 16 KiB."); return Object.freeze(value);
}
function planFor(request: ClosedSymbolValidationRequest, expected: ClosedSymbolExpectedFingerprint): ClosedSymbolPlan {
  const nonces = [randomBytes(32).toString("hex"), randomBytes(32).toString("hex"), randomBytes(32).toString("hex")] as const;
  need(new Set(nonces).size === 3, "Disposable marker nonce collision; no regeneration.");
  return Object.freeze({ profile: "easyeda-pro-control.project-symbol-closed-session.v1", projectUuid: request.target.projectUuid,
    branchUuid: request.target.branchUuid, ownerUuid: request.target.ownerUuid, targetUuid: request.target.symbolUuid,
    activeUuid: request.target.companionPcbUuid, projectPath: request.target.projectPath,
    operation: Object.freeze({ id: VALIDATION_ACTION_ID, action: "library.symbol.modify", libraryUuid: request.target.projectUuid,
      target: Object.freeze({ uuid: request.target.symbolUuid }), patch: request.metadata }),
    marker: Object.freeze({ namespaceNonce: nonces[0], keyNonce: nonces[1], bodyNonce: nonces[2] }),
    nativePinsSha256: WITNESS_NATIVE_PINS_SHA256, facadeSha256: expected.fingerprint.facadeImplementation.sha256,
    expectedFingerprintSha256: sha256Json(expected.fingerprint) });
}

/** The index owns these exact instances. No caller-selected factory, verifier,
 * path, fingerprint, phase or authority object is part of run()'s request.
 * Index must have found its global runtime slot absent, constructed/assigned this
 * fresh runtime with default dependencies, and retained this entry object.
 */
export class ClosedSymbolDisposableEntry {
  private readonly engine: EasyedaControlEngine;
  private readonly upstream: UpstreamEasyedaClient;
  private readonly runtime: WindowsControlRuntime;
  private readonly nativeUi: WindowsNativeUiController;
  private readonly gate: SerializedGate;
  private started = false;
  private phase: Phase = "request";
  private claimState: ClaimState = "not-attempted";
  private request: ClosedSymbolValidationRequest | undefined;
  private expected: ClosedSymbolExpectedFingerprint | undefined;
  private sqlRuntime: Readonly<MachineProfile["runtime"]> | undefined;
  private plan: ClosedSymbolPlan | undefined;
  private claim: ClosedSymbolTargetClaim | undefined;
  private coordinator: ClosedSymbolCoordinator | undefined;
  private terminal: ClosedSymbolTerminalStage | ClosedSymbolAgedTerminalStage | undefined;
  private full: FinalEvidenceRecord | undefined;
  private completion: OriginalTerminalCompletion | OriginalAgedTerminalCompletion | undefined;
  private failure: unknown;
  private readonly methods: readonly unknown[];
  private readonly facadePromise: EasyedaControlEngine["controlFingerprintPromise"];
  private readonly owners: Readonly<{ engine: EasyedaControlEngine; upstream: UpstreamEasyedaClient;
    runtime: WindowsControlRuntime; nativeUi: WindowsNativeUiController; gate: SerializedGate }>;

  public constructor(engine: EasyedaControlEngine, upstream: UpstreamEasyedaClient,
    runtime: WindowsControlRuntime, nativeUi: WindowsNativeUiController, gate: SerializedGate) {
    need(engine.upstream === upstream, "Disposable entry engine/upstream owner differs.");
    this.engine = engine; this.upstream = upstream; this.runtime = runtime; this.nativeUi = nativeUi; this.gate = gate;
    this.owners = Object.freeze({ engine, upstream, runtime, nativeUi, gate });
    this.facadePromise = engine.controlFingerprintPromise; this.methods = this.ownerMethods();
  }
  private ownerMethods(): readonly unknown[] {
    return [method(this.gate, "run"), method(this.engine, "assertBridgeDispatchAllowed"), method(this.engine, "assertNativeUiEditingAllowed"),
      method(this.upstream, "currentAuthenticatedBridgeDispatchBinding"), method(this.upstream, "bridgeSessionLifecycle"),
      method(this.upstream, "launcherFingerprint"), method(this.upstream, "installedEasyedaBundles"),
      method(this.upstream, "connect"), method(this.upstream, "withAuthenticatedBridgeDispatchScope"), method(this.nativeUi, "run"),
      ...["status", "launch", "capture", "proveTerminated", "releaseCapture", "prepareClosedSessionClose", "requestClosedSessionNormalClose",
        "probeClosedSessionTermination", "clockObservationForLaunch"].map(key => method(this.runtime, key))];
  }
  private owner(): void {
    need(this.engine === this.owners.engine && this.upstream === this.owners.upstream && this.runtime === this.owners.runtime &&
      this.nativeUi === this.owners.nativeUi && this.gate === this.owners.gate &&
      this.engine.upstream === this.upstream && this.engine.controlFingerprintPromise === this.facadePromise &&
      this.ownerMethods().every((value, index) => value === this.methods[index]), "Disposable entry owners changed.");
    need(this.upstream.currentAuthenticatedBridgeDispatchBinding() === undefined, "Disposable entry requires no enclosing authenticated scope.");
  }
  private fresh(): void {
    this.owner();
    const status = this.runtime.status();
    const lifecycle = this.upstream.bridgeSessionLifecycle();
    need(status.state === "not-launched" && status.launch === null && status.executableSha256 === null, "Disposable entry runtime is not fresh.");
    need(lifecycle === undefined || lifecycle.activeSession === null, "Disposable entry cannot adopt an authenticated session.");
  }
  /** Internal diagnostics only. Never serialize this bag through MCP or use it to
   * choose a terminal. Earlier exact objects survive later refusal/publication failure.
   */
  public retained(): Readonly<Record<string, unknown>> {
    return Object.freeze({ request: this.request, expected: this.expected, sqlRuntime: this.sqlRuntime, plan: this.plan,
      claimState: this.claimState, claim: this.claim, coordinator: this.coordinator, terminal: this.terminal,
      full: this.full, completion: this.completion, failure: this.failure, phase: this.phase, replayAllowed: false });
  }
  private stopped(reason: "entry-already-used" | "validation-stopped"): ClosedSymbolDisposableResult {
    let claimArtifact: Descriptor | null = null, operationId: string | null = null, terminalArtifact: Descriptor | null = null;
    try {
      const raw = this.full?.operationId ?? this.coordinator?.retained()["operationId"];
      if (typeof raw === "string" && /^easyeda-[a-z0-9-]{1,100}$/u.test(raw)) { operationId = raw; }
      if (this.claim !== undefined) { claimArtifact = descriptor(this.claim.artifact); }
      const rawTerminal = this.completion?.terminalArtifact ?? (operationId === null ? undefined : this.terminal?.originalArtifact(operationId));
      if (rawTerminal !== undefined) { terminalArtifact = descriptor(rawTerminal); }
    } catch {
      /* Diagnostic failure must not replace the original error or cause any action. */
    }
    return response({ ...COMMON, outcome: "stopped", phase: this.phase, reason, operationId, claimState: this.claimState,
      claimArtifact, terminalArtifact, completionProved: false, historicalCompletionRecorded: "not-checked",
      nextSafeAction: "Inspect retained evidence. Do not repeat this request or any native phase." });
  }
  public run(rawRequest: unknown): Promise<ClosedSymbolDisposableResult> {
    if (this.started || attempts.has(this.runtime)) { return Promise.resolve(this.stopped("entry-already-used")); }
    this.started = true; attempts.add(this.runtime);
    let request: ClosedSymbolValidationRequest, requestText: string;
    try {
      request = parseClosedSymbolValidationRequest(rawRequest); this.request = request;
      need(request.metadata.name.trim().length > 0, "Disposable symbol title must not be blank.");
      requestText = canonicalJson(request); this.owner();
    } catch (error) { this.failure = error; return Promise.resolve(this.stopped("validation-stopped")); }
    const current = (): void => {
      this.owner(); need(this.request === request && canonicalJson(parseClosedSymbolValidationRequest(rawRequest)) === requestText &&
        canonicalJson(request) === requestText, "Disposable entry request changed.");
    };
    this.phase = "queue";
    return this.gate.run(async () => {
      try {
        current(); this.fresh();
        this.phase = "admission";
        await this.engine.assertBridgeDispatchAllowed(); current(); this.fresh();
        await this.engine.assertNativeUiEditingAllowed(); current(); this.fresh();
        this.phase = "sql-runtime";
        this.sqlRuntime = await currentProcessSqlRuntime();
        const sqlRuntime = this.sqlRuntime; current(); this.fresh();
        this.phase = "expectation";
        this.expected = await buildClosedSymbolExpectedFingerprint(this.engine, this.upstream);
        const expected = this.expected; current(); this.fresh();
        need(this.runtime.status().reviewedExecutionScopeSha256 === expected.fingerprint.facadeImplementation.sha256,
          "Disposable runtime scope differs from the actual facade expectation.");
        this.plan = planFor(request, expected);
        const plan = this.plan, planText = canonicalJson(plan);
        // oxlint-disable-next-line prefer-const -- planned() must compare the initial undefined slots before their later original-return assignments.
        let claim: ClosedSymbolTargetClaim | undefined, coordinator: ClosedSymbolCoordinator | undefined;
        const planned = (): void => {
          current(); need(this.plan === plan && this.expected === expected && this.sqlRuntime === sqlRuntime && this.coordinator === coordinator &&
            this.claim === claim && canonicalJson(plan) === planText, "Disposable retained preparation or plan changed.");
        };
        this.phase = "construction";
        // Literal maintained import. Terminal consumers share this coordinator registry.
        const coordinatorModule = await import("./closed-symbol-coordinator.ts"); planned(); this.fresh();
        this.coordinator = new coordinatorModule.ClosedSymbolCoordinator(this.engine, this.upstream, this.runtime, this.nativeUi,
          sqlRuntime, { ...expected.fingerprint }); coordinator = this.coordinator;
        this.phase = "claim"; this.claimState = "publication-unknown";
        this.claim = await claimClosedSymbolValidationTarget(request, plan); claim = this.claim;
        this.claimState = "acknowledged"; planned(); this.fresh();
        need(claim.closedPlanSha256 === sha256Json(plan) && claim.requestSha256 === sha256Json(request) &&
          claim.markerSha256 === sha256Json(plan.marker), "Disposable claim differs from its exact internal plan.");
        // Both ordinary guards are also retained inside the coordinator before its
        // First launch. A claim is permanent even if one of those later guards fails.
        this.phase = "coordinator";
        this.full = await coordinator.recordAutomaticFullEvidence(plan); planned();
        need(this.coordinator === coordinator, "Disposable coordinator owner changed.");
        const full = this.full;
        const kind = coordinatorModule.originalClosedSymbolFullEvidenceKind(full, this.engine, full.operationId);
        this.phase = "terminal";
        if (kind === "locked") {
          const terminalModule = await import("./closed-symbol-terminal.ts"); planned();
          need(coordinatorModule.originalClosedSymbolFullEvidenceKind(full, this.engine, full.operationId) === "locked", "Disposable terminal kind changed.");
          const terminal = new terminalModule.ClosedSymbolTerminalStage(this.engine, sqlRuntime); this.terminal = terminal;
          this.completion = await terminal.complete(full); planned();
          need(this.terminal === terminal, "Disposable terminal owner changed.");
          const assertLockedCompletion: typeof assertOriginalClosedSymbolCompletion = terminalModule.assertOriginalClosedSymbolCompletion;
          assertLockedCompletion(this.completion, this.engine, full.operationId);
        } else {
          const terminalModule = await import("./closed-symbol-aged-terminal.ts"); planned();
          need(coordinatorModule.originalClosedSymbolFullEvidenceKind(full, this.engine, full.operationId) === "aged-unlocked", "Disposable terminal kind changed.");
          const terminal = new terminalModule.ClosedSymbolAgedTerminalStage(this.engine, sqlRuntime); this.terminal = terminal;
          this.completion = await terminal.complete(full); planned();
          need(this.terminal === terminal, "Disposable terminal owner changed.");
          const assertAgedCompletion: typeof assertOriginalAgedClosedSymbolCompletion = terminalModule.assertOriginalAgedClosedSymbolCompletion;
          assertAgedCompletion(this.completion, this.engine, full.operationId);
        }
        this.phase = "projection";
        need(this.full === full && this.coordinator === coordinator && this.completion.operationId === full.operationId,
          "Disposable final original references changed.");
        return response({ ...COMMON, outcome: "completed", operationId: full.operationId, headEligibility: kind, claimState: "acknowledged",
          claimArtifact: descriptor(claim.artifact), terminalArtifact: descriptor(this.completion.terminalArtifact), bodySha256: this.completion.bodySha256,
          completionProved: true, historicalCompletionRecorded: true, explicitSavePerformed: false, targetEditorOpened: false });
      } catch (error) { this.failure = error; return this.stopped("validation-stopped"); }
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Observe gate-entry rejection while keeping the synchronous one-shot consumption and parser boundary explicit.
    }).catch((error: unknown) => { this.failure = error; return this.stopped("validation-stopped"); });
  }
}
