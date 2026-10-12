/** Internal normal-close stage. A close acknowledgment is not termination or persistence. */
import { canonicalJson, sha256Json } from "./core.ts";
import type { ClosedSessionAuthorityCapture, EasyedaControlEngine } from "./engine.ts";
import type { WindowsControlRuntime } from "./windows-runtime.ts";
import type { ClosedSessionCloseIntent, ClosedSessionCloseReceipt, ClosedSessionTerminationProof, WindowsAuthorityLaunch } from "./windows-authority.ts";
import { appendClosedSymbolEvent, loadClosedSymbolJournal } from "./closed-symbol-journal.ts";
import type { ClosedJournal, Generation } from "./closed-symbol-journal.ts";

type Engine = Pick<EasyedaControlEngine, "assertBridgeDispatchAllowed" | "assertRecoveryOperationIsolated" | "upstream">;
type Runtime = Pick<WindowsControlRuntime, "status" | "prepareClosedSessionClose" | "requestClosedSessionNormalClose" | "proveClosedSession">;
type Phase = "baseline-close" | "edit-close" | "verify-close";
const PHASES = {
  "baseline-close": { ordinal: 0, capture: "closed-baseline", admission: "baseline-admission" },
  "edit-close": { ordinal: 1, capture: "closed-edit", admission: "edit-admission" },
  "verify-close": { ordinal: 2, capture: "closed-verification", admission: "verify-admission" },
} as const;
type Binding = Omit<Parameters<WindowsControlRuntime["prepareClosedSessionClose"]>[0], "windowHandle">;
export interface ClosedSymbolCloseResult {
  readonly intent: ClosedSessionCloseIntent;
  readonly closeReceipt: ClosedSessionCloseReceipt;
  readonly generation: Generation;
  readonly terminationProved: false;
  readonly completionProved: false;
  readonly executionAuthorized: false;
}
interface Slot {
  readonly binding: Binding; readonly launch: WindowsAuthorityLaunch;
  readonly resultText: string; readonly outsideScope: () => void;
  readonly operationId: string; eventSha256: string | undefined;
  proving: boolean;
}
const attempted = new WeakMap<Runtime, Set<string>>();
function requireValue(value: boolean, message: string): asserts value { if (!value) { throw new Error(message); } }

/** The owner must finish all bridge work and end its authenticated scope first.
 * This stage never selects Save/Discard, retries a close, or releases a capture.
 * A later copy intent must retain the original issued termination proof.
 */
export class ClosedSymbolCloseStage {
  private readonly engine: Engine;
  private readonly runtime: Runtime;
  private readonly slots = new WeakMap<ClosedSymbolCloseResult, Slot>();
  private readonly retainedResults = new Map<string, ClosedSymbolCloseResult>();
  public constructor(engine: Engine, runtime: Runtime) { this.engine = engine; this.runtime = runtime; }

  public originalResult(operationId: string, phase: Phase): ClosedSymbolCloseResult | undefined {
    return this.retainedResults.get(`${operationId}:${phase}`);
  }

  public async close(input: Readonly<{
    journal: ClosedJournal; generation: Generation; capture: ClosedSessionAuthorityCapture;
    phase: Phase; windowHandle: string;
  }>): Promise<ClosedSymbolCloseResult> {
    const callerText = canonicalJson(input), operationId = input.journal.operationId;
    const retained = structuredClone(input), { phase, generation, capture, windowHandle } = retained;
    requireValue(phase === "baseline-close" || phase === "edit-close" || phase === "verify-close", "Closed symbol close phase refused.");
    requireValue(/^[1-9]\d{0,18}$/u.test(windowHandle), "Closed symbol close needs its exact owned window.");
    let attempts = attempted.get(this.runtime);
    if (attempts === undefined) { attempts = new Set(); attempted.set(this.runtime, attempts); }
    const key = `${operationId}:${phase}`;
    requireValue(!attempts.has(key), "Closed symbol close attempt already consumed.");
    attempts.add(key);
    const { journal, events } = await loadClosedSymbolJournal(operationId);
    const unchanged = (): void => { requireValue(canonicalJson(input) === callerText, "Closed symbol close caller changed."); };
    unchanged();
    requireValue(canonicalJson(journal) === canonicalJson(retained.journal), "Closed symbol close journal is stale.");
    const selected = PHASES[phase];
    const admission = events.find((event) => event.step === selected.admission && event.kind === "result");
    requireValue(generation.ordinal === selected.ordinal && admission !== undefined && canonicalJson(admission.generation) === canonicalJson(generation),
      "Closed symbol close lacks its exact durable generation admission.");
    requireValue(capture.operationId === operationId && capture.phase === selected.capture && capture.challengeAttempt === 1 &&
      sha256Json(capture) === generation.captureSha256 && sha256Json(capture.bridgeSession) === generation.sessionSha256 &&
      sha256Json(capture.runtimeIdentity) === generation.runtimeSha256, "Closed symbol close capture differs from admission.");
    const binding: Binding = { operationId, phase: capture.phase, challengeAttempt: capture.challengeAttempt,
      bridgeSession: capture.bridgeSession, runtimeIdentity: capture.runtimeIdentity, executionAuthority: capture.executionAuthority };
    const initialStatus = this.runtime.status();
    requireValue(initialStatus.state === "owned" && initialStatus.launch !== null, "Closed symbol close has no retained runtime.");
    const launch = structuredClone(initialStatus.launch);
    requireValue(launch.helperInstance === generation.helperInstance && launch.jobId === generation.jobId &&
      launch.root.pid === generation.rootPid && launch.root.startIdentity === generation.rootStartIdentity,
      "Closed symbol close belongs to another launch.");
    const scopeReader = this.engine.upstream.currentAuthenticatedBridgeDispatchBinding;
    requireValue(typeof scopeReader === "function", "Closed symbol close cannot inspect bridge scope.");
    const outsideScope = (): void => {
      requireValue(this.engine.upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader && scopeReader.call(this.engine.upstream) === undefined,
        "Closed symbol close cannot run inside an unknown or authenticated scope.");
    };
    const current = (): void => {
      outsideScope();
      const status = this.runtime.status();
      requireValue(status.state === "owned" && canonicalJson(status.launch) === canonicalJson(launch), "Closed symbol close runtime owner changed.");
    };
    current();
    await this.engine.assertBridgeDispatchAllowed(); unchanged(); current();
    await this.engine.assertRecoveryOperationIsolated(operationId); unchanged(); current();
    const intent = await this.runtime.prepareClosedSessionClose({ ...binding, windowHandle });
    unchanged(); current();
    const request = { intent, capture, launch };
    const requestSha256 = sha256Json(request);
    await appendClosedSymbolEvent(journal, { step: phase, kind: "intent", generation, requestSha256, data: request });
    unchanged(); current();
    const closeReceipt = await this.runtime.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true });
    const result: ClosedSymbolCloseResult = Object.freeze({ intent: structuredClone(intent), closeReceipt: structuredClone(closeReceipt),
      generation: structuredClone(generation), terminationProved: false, completionProved: false, executionAuthorized: false });
    const slot: Slot = { binding, launch, resultText: canonicalJson(result), outsideScope,
      operationId, eventSha256: undefined, proving: false };
    this.slots.set(result, slot);
    this.retainedResults.set(key, result);
    // Publish the settled close before any caller/scope/ownership check or exit
    // Probe. No later failure can turn the recorded close into permission to retry.
    await appendClosedSymbolEvent(journal, { step: phase, kind: "result", generation, requestSha256,
      data: { closeIntentSha256: intent.closeIntentSha256, closeReceipt, closeReceiptSha256: sha256Json(closeReceipt) } });
    const event = journal.artifacts.at(-1);
    requireValue(event !== undefined, "Closed symbol close result artifact missing.");
    slot.eventSha256 = event.sha256;
    unchanged(); current();
    Object.assign(input.journal, journal);
    return result;
  }

  /** Read-only retained-Job proof. A not-yet-empty Job may be queried again, but
   * Never by repeating close. A serialized result cannot restore this owner.
   */
  public async prove(result: ClosedSymbolCloseResult): Promise<ClosedSessionTerminationProof> {
    const slot = this.slots.get(result);
    requireValue(slot !== undefined && slot.eventSha256 !== undefined && !slot.proving && canonicalJson(result) === slot.resultText,
      "Closed symbol proof needs its unchanged original durably recorded result.");
    slot.proving = true;
    try {
      const current = (): void => {
        slot.outsideScope();
        const status = this.runtime.status();
        requireValue(status.state === "owned" && canonicalJson(status.launch) === canonicalJson(slot.launch), "Closed symbol proof owner changed.");
        requireValue(canonicalJson(result) === slot.resultText, "Closed symbol proof result changed.");
      };
      current();
      const loaded = await loadClosedSymbolJournal(slot.operationId);
      current();
      requireValue(loaded.journal.artifacts.at(-1)?.sha256 === slot.eventSha256,
        "Closed symbol proof journal advanced or changed.");
      const proof = await this.runtime.proveClosedSession({ ...slot.binding, intent: result.intent, closeReceipt: result.closeReceipt });
      current();
      const final = await loadClosedSymbolJournal(slot.operationId);
      current();
      requireValue(canonicalJson(final.journal) === canonicalJson(loaded.journal),
        "Closed symbol proof journal advanced or changed.");
      return proof;
    } finally { slot.proving = false; }
  }
}
