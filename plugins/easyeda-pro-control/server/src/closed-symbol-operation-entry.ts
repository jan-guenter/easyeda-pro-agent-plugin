/** Ordinary one-shot symbol metadata entry. Source-owned validation gate remains closed. */
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
import { claimClosedSymbolOperationIntent } from "./closed-symbol-operation-intent.ts";
import type { ClosedSymbolOperationIntent } from "./closed-symbol-operation-intent.ts";
import { assertClosedSymbolOperationValidated, parseClosedSymbolOperationRequest } from "./closed-symbol-operation-request.ts";
import type { ClosedSymbolOperationRequest } from "./closed-symbol-operation-request.ts";
import { CLOSED_SYMBOL_OPERATION_COMMON as COMMON, closedSymbolOperationStopped } from "./closed-symbol-operation-tool.ts";
import type { ClosedSymbolOperationResult } from "./closed-symbol-operation-tool.ts";
import type { ClosedSymbolPlan } from "./closed-symbol-journal.ts";
import { WITNESS_NATIVE_PINS_SHA256 } from "./closed-symbol-native-profile.ts";
import type { ClosedSymbolCoordinator, FinalEvidenceRecord } from "./closed-symbol-coordinator.ts";
import type { ClosedSymbolTerminalStage, OriginalTerminalCompletion, assertOriginalClosedSymbolCompletion } from "./closed-symbol-terminal.ts";
import type { ClosedSymbolAgedTerminalStage, OriginalAgedTerminalCompletion, assertOriginalAgedClosedSymbolCompletion } from "./closed-symbol-aged-terminal.ts";

type Phase = "request" | "validation" | "queue" | "admission" | "sql-runtime" | "expectation" | "construction" | "intent" | "coordinator" | "terminal" | "projection";
type ClaimState = "not-attempted" | "publication-unknown" | "acknowledged";
type Descriptor = Readonly<{ path: string; bytes: number; sha256: string }>;
const attempts = new WeakSet<WindowsControlRuntime>();
function need(value: boolean, message: string): asserts value { if (!value) { throw new Error(message); } }
function method(owner: object, key: string): unknown {
  let current: object | null = owner;
  for (let depth = 0; current !== null && depth < 8; depth += 1) {
    const item = Object.getOwnPropertyDescriptor(current, key);
    if (item !== undefined) { need(Object.hasOwn(item, "value") && typeof item.value === "function", "Ordinary entry owner method changed."); return item.value as unknown; }
    const parent: unknown = Object.getPrototypeOf(current);
    need(parent === null || typeof parent === "object", "Ordinary entry owner prototype changed."); current = parent;
  }
  throw new Error("Ordinary entry owner method is unavailable.");
}
function descriptor(value: Descriptor): Descriptor {
  need(typeof value.path === "string" && value.path.length <= 4096 && value.path.startsWith("/") && !/[\0\r\n]/u.test(value.path) &&
    Number.isSafeInteger(value.bytes) && value.bytes > 0 && value.bytes <= 131_072 && /^[a-f0-9]{64}$/u.test(value.sha256), "Ordinary result descriptor refused.");
  return Object.freeze({ path: value.path, bytes: value.bytes, sha256: value.sha256 });
}
function response<T extends ClosedSymbolOperationResult>(value: T): T {
  need(Buffer.byteLength(JSON.stringify(value)) <= 16_384, "Ordinary result exceeds 16 KiB."); return Object.freeze(value);
}
function planFor(request: ClosedSymbolOperationRequest, expected: ClosedSymbolExpectedFingerprint): ClosedSymbolPlan {
  const nonces = [randomBytes(32).toString("hex"), randomBytes(32).toString("hex"), randomBytes(32).toString("hex")] as const;
  need(new Set(nonces).size === 3, "Ordinary marker nonce collision; no regeneration.");
  return Object.freeze({ profile: "easyeda-pro-control.project-symbol-closed-session.v1", projectUuid: request.target.projectUuid,
    branchUuid: request.target.branchUuid, ownerUuid: request.target.ownerUuid, targetUuid: request.target.symbolUuid,
    activeUuid: request.target.companionPcbUuid, projectPath: request.target.projectPath,
    operation: request.operation,
    marker: Object.freeze({ namespaceNonce: nonces[0], keyNonce: nonces[1], bodyNonce: nonces[2] }),
    nativePinsSha256: WITNESS_NATIVE_PINS_SHA256, facadeSha256: expected.fingerprint.facadeImplementation.sha256,
    expectedFingerprintSha256: sha256Json(expected.fingerprint) });
}

/** The index owns these exact instances. No caller-selected factory, verifier,
 * path, fingerprint, phase or authority object is part of run()'s request.
 * Index must have found its global runtime slot absent, constructed/assigned this
 * fresh runtime with default dependencies, and retained this entry object.
 */
export class ClosedSymbolOperationEntry {
  private readonly engine: EasyedaControlEngine;
  private readonly upstream: UpstreamEasyedaClient;
  private readonly runtime: WindowsControlRuntime;
  private readonly nativeUi: WindowsNativeUiController;
  private readonly gate: SerializedGate;
  private started = false;
  private phase: Phase = "request";
  private claimState: ClaimState = "not-attempted";
  private request: ClosedSymbolOperationRequest | undefined;
  private expected: ClosedSymbolExpectedFingerprint | undefined;
  private sqlRuntime: Readonly<MachineProfile["runtime"]> | undefined;
  private plan: ClosedSymbolPlan | undefined;
  private claim: ClosedSymbolOperationIntent | undefined;
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
    need(engine.upstream === upstream, "Ordinary entry engine/upstream owner differs.");
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
      this.ownerMethods().every((value, index) => value === this.methods[index]), "Ordinary entry owners changed.");
    need(this.upstream.currentAuthenticatedBridgeDispatchBinding() === undefined, "Ordinary entry requires no enclosing authenticated scope.");
  }
  private fresh(): void {
    this.owner();
    const status = this.runtime.status();
    const lifecycle = this.upstream.bridgeSessionLifecycle();
    need(status.state === "not-launched" && status.launch === null && status.executableSha256 === null, "Ordinary entry runtime is not fresh.");
    need(lifecycle === undefined || lifecycle.activeSession === null, "Ordinary entry cannot adopt an authenticated session.");
  }
  /** Internal diagnostics only. Never serialize this bag through MCP or use it to
   * choose a terminal. Earlier exact objects survive later refusal/publication failure.
   */
  public retained(): Readonly<Record<string, unknown>> {
    return Object.freeze({ request: this.request, expected: this.expected, sqlRuntime: this.sqlRuntime, plan: this.plan,
      claimState: this.claimState, claim: this.claim, coordinator: this.coordinator, terminal: this.terminal,
      full: this.full, completion: this.completion, failure: this.failure, phase: this.phase, replayAllowed: false });
  }
  private stopped(): ClosedSymbolOperationResult {
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
    return closedSymbolOperationStopped({ phase: this.phase, actionId: this.request?.operation.id ?? null, operationId,
      attemptReserved: this.started, intentArtifact: claimArtifact, terminalArtifact });
  }
  public run(rawRequest: unknown): Promise<ClosedSymbolOperationResult> {
    try { this.phase = "validation"; assertClosedSymbolOperationValidated(); }
    catch (error) { this.failure = error; return Promise.resolve(this.stopped()); }
    if (this.started || attempts.has(this.runtime)) { return Promise.resolve(this.stopped()); }
    this.started = true; attempts.add(this.runtime);
    let request: ClosedSymbolOperationRequest, requestText: string;
    try {
      request = parseClosedSymbolOperationRequest(rawRequest); this.request = request;
      need((request.operation.patch.name ?? "").trim().length > 0, "Ordinary symbol title must not be blank.");
      requestText = canonicalJson(request); this.owner();
    } catch (error) { this.failure = error; return Promise.resolve(this.stopped()); }
    const current = (): void => {
      this.owner(); need(this.request === request && canonicalJson(parseClosedSymbolOperationRequest(rawRequest)) === requestText &&
        canonicalJson(request) === requestText, "Ordinary entry request changed.");
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
          "Ordinary runtime scope differs from the actual facade expectation.");
        this.plan = planFor(request, expected);
        const plan = this.plan, planText = canonicalJson(plan);
        // oxlint-disable-next-line prefer-const -- planned() must compare the initial undefined slots before their later original-return assignments.
        let claim: ClosedSymbolOperationIntent | undefined, coordinator: ClosedSymbolCoordinator | undefined;
        const planned = (): void => {
          current(); need(this.plan === plan && this.expected === expected && this.sqlRuntime === sqlRuntime && this.coordinator === coordinator &&
            this.claim === claim && canonicalJson(plan) === planText, "Ordinary retained preparation or plan changed.");
        };
        this.phase = "construction";
        // Literal maintained import. Terminal consumers share this coordinator registry.
        const coordinatorModule = await import("./closed-symbol-coordinator.ts"); planned(); this.fresh();
        this.coordinator = new coordinatorModule.ClosedSymbolCoordinator(this.engine, this.upstream, this.runtime, this.nativeUi,
          sqlRuntime, { ...expected.fingerprint }); coordinator = this.coordinator;
        this.phase = "intent"; this.claimState = "publication-unknown";
        this.claim = await claimClosedSymbolOperationIntent(request, plan); claim = this.claim;
        this.claimState = "acknowledged"; planned(); this.fresh();
        need(claim.closedPlanSha256 === sha256Json(plan) && claim.requestSha256 === sha256Json(request) &&
          claim.markerSha256 === sha256Json(plan.marker), "Ordinary claim differs from its exact internal plan.");
        // Both ordinary guards are also retained inside the coordinator before its
        // First launch. A claim is permanent even if one of those later guards fails.
        this.phase = "coordinator";
        this.full = await coordinator.recordAutomaticFullEvidence(plan); planned();
        need(this.coordinator === coordinator, "Ordinary coordinator owner changed.");
        const full = this.full;
        const kind = coordinatorModule.originalClosedSymbolFullEvidenceKind(full, this.engine, full.operationId);
        this.phase = "terminal";
        if (kind === "locked") {
          const terminalModule = await import("./closed-symbol-terminal.ts"); planned();
          need(coordinatorModule.originalClosedSymbolFullEvidenceKind(full, this.engine, full.operationId) === "locked", "Ordinary terminal kind changed.");
          const terminal = new terminalModule.ClosedSymbolTerminalStage(this.engine, sqlRuntime); this.terminal = terminal;
          this.completion = await terminal.complete(full); planned();
          need(this.terminal === terminal, "Ordinary terminal owner changed.");
          const assertLockedCompletion: typeof assertOriginalClosedSymbolCompletion = terminalModule.assertOriginalClosedSymbolCompletion;
          assertLockedCompletion(this.completion, this.engine, full.operationId);
        } else {
          const terminalModule = await import("./closed-symbol-aged-terminal.ts"); planned();
          need(coordinatorModule.originalClosedSymbolFullEvidenceKind(full, this.engine, full.operationId) === "aged-unlocked", "Ordinary terminal kind changed.");
          const terminal = new terminalModule.ClosedSymbolAgedTerminalStage(this.engine, sqlRuntime); this.terminal = terminal;
          this.completion = await terminal.complete(full); planned();
          need(this.terminal === terminal, "Ordinary terminal owner changed.");
          const assertAgedCompletion: typeof assertOriginalAgedClosedSymbolCompletion = terminalModule.assertOriginalAgedClosedSymbolCompletion;
          assertAgedCompletion(this.completion, this.engine, full.operationId);
        }
        this.phase = "projection";
        need(this.full === full && this.coordinator === coordinator && this.completion.operationId === full.operationId,
          "Ordinary final original references changed.");
        return response({ ...COMMON, outcome: "completed", actionId: request.operation.id, operationId: full.operationId, headEligibility: kind,
          intentArtifact: descriptor(claim.artifact), terminalArtifact: descriptor(this.completion.terminalArtifact), bodySha256: this.completion.bodySha256,
          completionProved: true, explicitSavePerformed: false, targetEditorOpened: false });
      } catch (error) { this.failure = error; return this.stopped(); }
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Observe gate-entry rejection while keeping the synchronous one-shot consumption and parser boundary explicit.
    }).catch((error: unknown) => { this.failure = error; return this.stopped(); });
  }
}
