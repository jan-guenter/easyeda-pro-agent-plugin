import { canonicalJson, extractToolPayload, isRecord, sha256Json, sha256Text } from "./core.ts";
import type { EasyedaControlEngine } from "./engine.ts";
import type { WindowsControlRuntime } from "./windows-runtime.ts";
import type { AdmissionPhase, ClosedSymbolAdmissionStage } from "./closed-symbol-admission.ts";
import { appendClosedSymbolEvent, loadClosedSymbolJournal } from "./closed-symbol-journal.ts";
import type { ClosedJournal } from "./closed-symbol-journal.ts";
import { buildStartupProgram, validateStartupResult } from "./closed-symbol-startup-program.ts";
import type { StartupInput, StartupPhase } from "./closed-symbol-startup-program.ts";

type Engine = Pick<EasyedaControlEngine, "assertBridgeDispatchAllowed" | "assertRecoveryOperationIsolated" | "dispatchWithOrphanTracking" | "executionAuthorityValidator" | "runtimeIdentity" | "upstream">;
type Runtime = Pick<WindowsControlRuntime, "status">;
const PHASES: Readonly<Record<StartupPhase, AdmissionPhase>> = { "baseline-marker-create": "baseline-admission", "edit-marker-read": "edit-admission", "verify-marker-read": "verify-admission" };
const attempts = new WeakMap<Engine, Set<string>>();
function requireValue(value: boolean, message: string): asserts value { if (!value) { throw new Error(message); } }

/** No arbitrary scripts, callbacks, source overrides, navigation or Save. This
 * stage dispatches one fixed composite and retains its return before cleanup.
 * Full clean-start provenance/APP actor/clock qualification remain separate.
 */
export class ClosedSymbolStartupStage {
  private readonly engine: Engine;
  private readonly runtime: Runtime;
  private readonly admission: ClosedSymbolAdmissionStage;
  private readonly validator: Engine["executionAuthorityValidator"];
  private readonly validatorMethods: readonly unknown[];
  private readonly retainedReturns = new Map<string, unknown>();

  public constructor(engine: Engine, runtime: Runtime, admission: ClosedSymbolAdmissionStage) {
    this.engine = engine; this.runtime = runtime; this.admission = admission;
    this.validator = engine.executionAuthorityValidator;
    this.validatorMethods = [this.validator?.capture, this.validator?.proveTerminated, this.validator?.releaseCapture];
  }

  /** Original transport reply for inspection after publication/cleanup failure.
   * This data does not qualify startup or authorize a retry or later phase.
   */
  public originalReturn(operationId: string, phase: StartupPhase): unknown {
    return this.retainedReturns.get(JSON.stringify([operationId, phase]));
  }

  public async observe(journalInput: ClosedJournal, phase: StartupPhase): Promise<Readonly<Record<string, unknown>>> {
    requireValue(Object.hasOwn(PHASES, phase), "Startup phase refused.");
    const callerText = canonicalJson(journalInput), operationId = journalInput.operationId;
    let used = attempts.get(this.engine);
    if (used === undefined) { used = new Set(); attempts.set(this.engine, used); }
    const key = JSON.stringify([operationId, phase]); requireValue(!used.has(key), "Startup phase attempt already consumed."); used.add(key);
    const { journal, events } = await loadClosedSymbolJournal(operationId);
    const unchanged = (): void => { requireValue(canonicalJson(journalInput) === callerText, "Startup caller journal changed."); };
    unchanged(); requireValue(canonicalJson(journal) === callerText && !journal.hardStop && !journal.orphanedCallPossible, "Startup managed journal differs or is quarantined.");
    const capture = this.admission.originalCapture(operationId, PHASES[phase]), last = events.at(-1);
    requireValue(last?.step === PHASES[phase] && last.kind === "result" && last.generation !== null && "captureSha256" in last.generation &&
      capture !== undefined && last.generation.captureSha256 === sha256Json(capture) && isRecord(last.data) &&
      canonicalJson(last.data["capture"]) === canonicalJson(capture) && last.data["captureSha256"] === sha256Json(capture),
      "Startup needs its original admitted capture and exact last admission result.");
    const captureText = canonicalJson(capture), generation = structuredClone(last.generation);
    const input: StartupInput = { phase, projectUuid: journal.plan.projectUuid, branchUuid: journal.plan.branchUuid, ownerUuid: journal.plan.ownerUuid, marker: structuredClone(journal.plan.marker) };
    const planText = canonicalJson({ operationId, plan: journal.plan, closedPlanSha256: journal.closedPlanSha256, markerSha256: journal.markerSha256 });
    const working = (): void => { requireValue(canonicalJson({ operationId: journal.operationId, plan: journal.plan, closedPlanSha256: journal.closedPlanSha256, markerSha256: journal.markerSha256 }) === planText, "Startup sealed working plan changed."); };
    const scopeReader = this.engine.upstream.currentAuthenticatedBridgeDispatchBinding, sessionReader = this.engine.upstream.bridgeSessionLifecycle;
    requireValue(typeof scopeReader === "function" && typeof sessionReader === "function", "Startup current scope observers unavailable.");
    const binding = structuredClone(scopeReader.call(this.engine.upstream)); requireValue(binding !== undefined, "Startup requires its outer authenticated scope.");
    const status = this.runtime.status();
    requireValue(status.state === "owned" && status.launch?.jobId === generation.jobId && status.launch.helperInstance === generation.helperInstance &&
      status.launch.root.pid === generation.rootPid && status.launch.root.startIdentity === generation.rootStartIdentity, "Startup runtime launch differs.");
    const statusText = canonicalJson(status);
    let settledReply: unknown, settledText: string | undefined;
    const unchangedReply = (): void => {
      requireValue(settledText === undefined || canonicalJson(settledReply) === settledText, "Startup settled reply changed after retention.");
    };
    const current = (): void => {
      unchangedReply();
      working(); unchanged();
      requireValue(this.admission.originalCapture(operationId, PHASES[phase]) === capture && canonicalJson(capture) === captureText, "Startup original capture changed.");
      requireValue(this.engine.executionAuthorityValidator === this.validator && this.validatorMethods.every((method) => typeof method === "function") &&
        [this.validator?.capture, this.validator?.proveTerminated, this.validator?.releaseCapture].every((method, index) => method === this.validatorMethods[index]), "Startup execution validator changed.");
      requireValue(canonicalJson(this.runtime.status()) === statusText, "Startup runtime owner changed.");
      requireValue(this.engine.upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader && this.engine.upstream.bridgeSessionLifecycle === sessionReader &&
        canonicalJson(scopeReader.call(this.engine.upstream) ?? null) === canonicalJson(binding), "Startup authenticated scope changed.");
      const session = sessionReader.call(this.engine.upstream);
      requireValue(isRecord(session) && session["schema"] === "easyeda-pro-control.authenticated-bridge-lifecycle.v1" && isRecord(session["activeSession"]) &&
        canonicalJson({ gatewayInstanceId: session["gatewayInstanceId"], ...session["activeSession"] }) === canonicalJson(capture.bridgeSession), "Startup authenticated session changed.");
    };
    const dispatchGeneration = (): void => {
      const roots = journal.executionAuthorityBeforeOrphan?.processes.filter((entry) => entry.role === "easyeda-main");
      requireValue(sha256Json(journal.runtimeIdentityBeforeOrphan) === generation.runtimeSha256 && sha256Json(journal.bridgeSessionBeforeOrphan) === generation.sessionSha256 &&
        roots?.length === 1 && roots[0]?.pid === generation.rootPid && roots[0].startIdentity === generation.rootStartIdentity, "Startup dispatch generation differs.");
    };
    current();
    await this.engine.assertBridgeDispatchAllowed(); current();
    await this.engine.assertRecoveryOperationIsolated(operationId); current();
    const code = buildStartupProgram(input), request = { profile: "easyeda-pro-control.closed-symbol-startup-request.v1", input, codeSha256: sha256Text(code), directMainFrameOnly: true };
    const requestSha256 = sha256Json(request);
    await appendClosedSymbolEvent(journal, { step: phase, kind: "intent", generation, requestSha256, data: request });
    current();
    // Upstream requires transport confirmation even for the unchanged fixed marker reads.
    const raw = await this.engine.dispatchWithOrphanTracking(journal, phase, "easyeda_execute", { code, timeoutMs: 60_000, confirmWrite: true }, 70_000,
      async () => {
        current(); dispatchGeneration();
        await this.engine.assertRecoveryOperationIsolated(operationId); current(); dispatchGeneration();
        const observed = await this.engine.runtimeIdentity(binding); current(); dispatchGeneration();
        requireValue(sha256Json(observed) === generation.runtimeSha256, "Startup current native runtime changed before dispatch.");
      },
      async (returned) => {
        // Retain the actual settled reply before any fallible check or write.
        this.retainedReturns.set(key, returned);
        settledReply = returned; settledText = canonicalJson(returned);
        // Preserve the settled fixed program reply on the private working
        // Journal even when caller or current scope drifted during its await.
        working();
        await appendClosedSymbolEvent(journal, { step: phase, kind: "result", generation, requestSha256, data: { rawReturn: returned } });
        unchangedReply();
      });
    current(); requireValue(raw === settledReply, "Startup settled reply changed after retention.");
    const result = validateStartupResult(extractToolPayload(raw), input);
    requireValue(result["ok"] === true, "Startup fixed observation refused; retained result requires review, never replay.");
    const observed = await this.engine.runtimeIdentity(binding); current();
    requireValue(sha256Json(observed) === generation.runtimeSha256, "Startup current native runtime changed after dispatch.");
    const final = await loadClosedSymbolJournal(operationId); current();
    requireValue(canonicalJson(final.journal) === canonicalJson(journal), "Startup durable journal changed.");
    Object.assign(journalInput, journal);
    return Object.freeze({ profile: "easyeda-pro-control.closed-symbol-startup-stage.v1", operationId, phase, result,
      executionAuthorized: false, startupQualified: false, completionProved: false, saved: false, reopened: false });
  }
}
