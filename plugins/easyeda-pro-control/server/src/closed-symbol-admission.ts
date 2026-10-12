/** Private first capture of each owned generation. No startup or edit authority. */
import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import type { ClosedSessionAuthorityCapture, EasyedaControlEngine } from "./engine.ts";
import type { WindowsControlRuntime } from "./windows-runtime.ts";
import { appendClosedSymbolEvent, loadClosedSymbolJournal } from "./closed-symbol-journal.ts";
import type { ClosedJournal, Generation, LaunchGeneration } from "./closed-symbol-journal.ts";

type Engine = Pick<EasyedaControlEngine, "assertBridgeDispatchAllowed" | "assertRecoveryOperationIsolated" | "captureClosedSessionAuthority" | "executionAuthorityValidator" | "runtimeIdentity" | "upstream">;
type Runtime = Pick<WindowsControlRuntime, "status" | "capture" | "proveTerminated" | "releaseCapture">;
export type AdmissionPhase = "baseline-admission" | "edit-admission" | "verify-admission";
const PHASES = {
  "baseline-admission": { ordinal: 0, launch: "baseline-launch", capture: "closed-baseline" },
  "edit-admission": { ordinal: 1, launch: "edit-launch", capture: "closed-edit" },
  "verify-admission": { ordinal: 2, launch: "verify-launch", capture: "closed-verification" },
} as const;
interface Owner { readonly used: Set<string>; readonly captures: Map<string, ClosedSessionAuthorityCapture> }
const owners = new WeakMap<Engine, WeakMap<Runtime, Owner>>();
function requireValue(value: boolean, message: string): asserts value { if (!value) { throw new Error(message); } }

/** Construct with the actual index-owned engine/runtime. The returned original
 * capture remains engine-branded. JSON and this stage's false flags grant no
 * normal close, marker, project access, edit or completion by themselves.
 */
export class ClosedSymbolAdmissionStage {
  private readonly engine: Engine;
  private readonly runtime: Runtime;
  private readonly owner: Owner;
  private readonly validator: Engine["executionAuthorityValidator"];
  private readonly validatorMethods: readonly unknown[];

  public constructor(engine: Engine, runtime: Runtime) {
    this.engine = engine; this.runtime = runtime; this.validator = engine.executionAuthorityValidator;
    this.validatorMethods = [this.validator?.capture, this.validator?.proveTerminated, this.validator?.releaseCapture];
    let runtimes = owners.get(engine);
    if (runtimes === undefined) { runtimes = new WeakMap(); owners.set(engine, runtimes); }
    let owner = runtimes.get(runtime);
    if (owner === undefined) { owner = { used: new Set(), captures: new Map() }; runtimes.set(runtime, owner); }
    this.owner = owner;
  }

  /** Original in-memory receipt only, including after publication/refusal. This
   * does not adopt disk data or authorize normal-path close after failed admit.
   */
  public originalCapture(operationId: string, phase: AdmissionPhase): ClosedSessionAuthorityCapture | undefined {
    return this.owner.captures.get(JSON.stringify([operationId, phase]));
  }

  public async admit(journalInput: ClosedJournal, phase: AdmissionPhase): Promise<Readonly<{
    capture: ClosedSessionAuthorityCapture; generation: Generation;
    executionAuthorized: false; startupQualified: false; completionProved: false;
  }>> {
    requireValue(Object.hasOwn(PHASES, phase), "Closed admission phase refused.");
    const callerText = canonicalJson(journalInput), operationId = journalInput.operationId, selected = PHASES[phase];
    const key = JSON.stringify([operationId, phase]);
    requireValue(!this.owner.used.has(key), "Closed admission attempt already consumed.");
    this.owner.used.add(key);
    const { journal, events } = await loadClosedSymbolJournal(operationId);
    const unchanged = (): void => { requireValue(canonicalJson(journalInput) === callerText, "Closed admission caller changed."); };
    unchanged();
    requireValue(canonicalJson(journal) === callerText && !journal.orphanedCallPossible && !journal.hardStop,
      "Closed admission needs its unchanged unquarantined managed journal.");
    const last = events.at(-1);
    requireValue(last?.step === selected.launch && last.kind === "result" && last.generation !== null && last.generation.ordinal === selected.ordinal,
      "Closed admission requires the exact last acknowledged launch.");
    const partial: LaunchGeneration = structuredClone(last.generation);
    requireValue(isRecord(last.data), "Closed admission launch data missing.");
    const launchText = canonicalJson(last.data["launchReceipt"]);
    const initialStatus = this.runtime.status();
    requireValue(initialStatus.state === "owned" && canonicalJson(initialStatus.launch) === launchText,
      "Closed admission current runtime differs from its recorded launch.");
    const statusText = canonicalJson(initialStatus);
    const scopeReader = this.engine.upstream.currentAuthenticatedBridgeDispatchBinding;
    const sessionReader = this.engine.upstream.bridgeSessionLifecycle;
    requireValue(typeof scopeReader === "function" && typeof sessionReader === "function", "Closed admission current scope observers missing.");
    const binding = structuredClone(scopeReader.call(this.engine.upstream));
    requireValue(binding !== undefined, "Closed admission requires its outer authenticated scope.");
    const session = (): unknown => {
      const value = sessionReader.call(this.engine.upstream);
      requireValue(isRecord(value) && value["schema"] === "easyeda-pro-control.authenticated-bridge-lifecycle.v1" && isRecord(value["activeSession"]),
        "Closed admission authenticated session missing.");
      return { gatewayInstanceId: value["gatewayInstanceId"], ...value["activeSession"] };
    };
    const sessionText = canonicalJson(session());
    const current = (): void => {
      // Index supplies a stable wrapper forwarding to ownedWindowsRuntime(),
      // Not the runtime object itself. Identity continuity grants no authority.
      requireValue(this.validatorMethods.every((method) => typeof method === "function") && this.engine.executionAuthorityValidator === this.validator &&
        [this.validator?.capture, this.validator?.proveTerminated, this.validator?.releaseCapture].every((method, index) => method === this.validatorMethods[index]),
        "Closed admission retained execution validator changed or is unavailable.");
      requireValue(canonicalJson(this.runtime.status()) === statusText, "Closed admission current runtime owner changed.");
      requireValue(this.engine.upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader && this.engine.upstream.bridgeSessionLifecycle === sessionReader &&
        canonicalJson(scopeReader.call(this.engine.upstream) ?? null) === canonicalJson(binding) && canonicalJson(session()) === sessionText,
        "Closed admission current authenticated scope changed.");
    };
    current();
    await this.engine.assertBridgeDispatchAllowed(); unchanged(); current();
    await this.engine.assertRecoveryOperationIsolated(operationId); unchanged(); current();
    const request = { profile: "easyeda-pro-control.closed-symbol-admission-request.v1", operationId, phase,
      closedPlanSha256: journal.closedPlanSha256, launchReceiptSha256: sha256Json(last.data["launchReceipt"]),
      capturePhase: selected.capture, challengeAttempt: 1, bridgeDispatch: binding };
    const requestSha256 = sha256Json(request);
    await appendClosedSymbolEvent(journal, { step: phase, kind: "intent", generation: partial, requestSha256, data: request });
    unchanged(); current();
    const original = await this.engine.captureClosedSessionAuthority(operationId, selected.capture, 1);
    // Capture ownership is retained before any publication or fallible current
    // Checks. A disk receipt cannot reconstruct this object after process loss.
    this.owner.captures.set(key, original);
    const captureSha256 = sha256Json(original);
    const retained = structuredClone(original);
    const generation: Generation = { ...partial, runtimeSha256: sha256Json(retained.runtimeIdentity),
      sessionSha256: sha256Json(retained.bridgeSession), captureSha256 };
    await appendClosedSymbolEvent(journal, { step: phase, kind: "result", generation, requestSha256,
      data: { capture: retained, captureSha256 } });
    // Retain the actual return first, even if a caller/session/owner changed
    // During capture. A later refusal never permits another capture attempt.
    const captureUnchanged = (): void => { requireValue(sha256Json(original) === captureSha256, "Closed admission original capture changed."); };
    unchanged(); current(); captureUnchanged();
    requireValue(retained.operationId === operationId && retained.phase === selected.capture && retained.challengeAttempt === 1 &&
      canonicalJson(retained.bridgeSession) === sessionText, "Closed admission capture identity differs.");
    const roots = retained.executionAuthority.processes.filter((entry) => entry.role === "easyeda-main");
    requireValue(roots.length === 1 && roots[0]?.pid === partial.rootPid && roots[0].startIdentity === partial.rootStartIdentity &&
      retained.executionAuthority.processes.every((entry) => entry.startIdentity.endsWith(`:job:${partial.jobId}`)),
      "Closed admission capture belongs to another launched Job.");
    // The actual supervisor binds helperInstance and Job before returning its
    // Authority. That private binding is not invented as extra capture fields.
    const after = await this.engine.runtimeIdentity(binding);
    unchanged(); current(); captureUnchanged();
    requireValue(sha256Json(after) === generation.runtimeSha256, "Closed admission current native runtime changed.");
    const final = await loadClosedSymbolJournal(operationId);
    unchanged(); current(); captureUnchanged();
    requireValue(canonicalJson(final.journal) === canonicalJson(journal), "Closed admission durable journal changed.");
    Object.assign(journalInput, journal);
    return Object.freeze({ capture: original, generation, executionAuthorized: false, startupQualified: false, completionProved: false });
  }
}
