/** Internal prototype: first owned launch only. No admission or transaction completion. */
import { canonicalJson, sha256Json } from "./core.ts";
import type { EasyedaControlEngine } from "./engine.ts";
import type { WindowsControlRuntime } from "./windows-runtime.ts";
import type { WindowsAuthorityLaunch } from "./windows-authority.ts";
import { appendClosedSymbolEvent, loadClosedSymbolJournal } from "./closed-symbol-journal.ts";
import type { ClosedJournal, LaunchGeneration } from "./closed-symbol-journal.ts";

type Engine = Pick<EasyedaControlEngine, "assertBridgeDispatchAllowed" | "assertRecoveryOperationIsolated" | "upstream">;
type Runtime = Pick<WindowsControlRuntime, "launch" | "status">;
const used = new WeakMap<Runtime, Set<string>>();
function requireValue(value: boolean, message: string): asserts value { if (!value) { throw new Error(message); } }

/** Production construction receives the actual index-owned runtime and engine.
 * Only the owning serialized coordinator may call this unregistered stage.
 * Later launches need their own original prior-generation closure/copy inputs.
 */
export class ClosedSymbolBootstrapLaunchStage {
  private readonly engine: Engine;
  private readonly runtime: Runtime;
  private readonly launches = new Map<string, WindowsAuthorityLaunch>();

  public constructor(engine: Engine, runtime: Runtime) { this.engine = engine; this.runtime = runtime; }
  /** Original runtime return, even if publication later failed. Disk data and
   * status snapshots cannot reconstruct this launch's in-memory ownership.
   */
  public originalLaunch(operationId: string): WindowsAuthorityLaunch | undefined { return this.launches.get(operationId); }

  public async launch(journalInput: ClosedJournal): Promise<Readonly<{
    launch: WindowsAuthorityLaunch; generation: LaunchGeneration;
    executionAuthorized: false; admissionProved: false; completionProved: false;
  }>> {
    const callerText = canonicalJson(journalInput), operationId = journalInput.operationId;
    let attempts = used.get(this.runtime);
    if (attempts === undefined) { attempts = new Set(); used.set(this.runtime, attempts); }
    requireValue(!attempts.has(operationId), "Bootstrap launch attempt already consumed.");
    attempts.add(operationId);
    const { journal, events } = await loadClosedSymbolJournal(operationId);
    const unchanged = (): void => { requireValue(canonicalJson(journalInput) === callerText, "Bootstrap launch caller changed."); };
    unchanged();
    requireValue(canonicalJson(journal) === callerText && events.length === 0 && journal.sequence === 0,
      "Bootstrap launch requires its original empty managed journal.");
    requireValue(!journal.orphanedCallPossible && !journal.hardStop, "Bootstrap launch journal is quarantined.");
    const scopeReader = this.engine.upstream.currentAuthenticatedBridgeDispatchBinding;
    requireValue(typeof scopeReader === "function",
      "Bootstrap launch cannot prove the current bridge scope.");
    const outsideScope = (): void => {
      requireValue(this.engine.upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader &&
        scopeReader.call(this.engine.upstream) === undefined, "Bootstrap launch cannot run inside an unknown or authenticated generation scope.");
    };
    const outsideSession = (): void => {
      outsideScope();
      requireValue(this.runtime.status().state === "not-launched", "Bootstrap launch requires a new index-owned runtime.");
    };
    outsideSession();
    await this.engine.assertBridgeDispatchAllowed(); unchanged(); outsideSession();
    await this.engine.assertRecoveryOperationIsolated(operationId); unchanged(); outsideSession();
    const request = { profile: "easyeda-pro-control.closed-symbol-bootstrap-launch-request.v1", operationId,
      closedPlanSha256: journal.closedPlanSha256, runtimeStatus: this.runtime.status() };
    const requestSha256 = sha256Json(request);
    await appendClosedSymbolEvent(journal, { step: "baseline-launch", kind: "intent", generation: null, requestSha256, data: request });
    unchanged(); outsideSession();
    // The only native side effect in this stage. An uncertain rejection leaves
    // The published intent; it does not permit another launch or authentication.
    const original = await this.runtime.launch();
    this.launches.set(operationId, original);
    const launchReceipt = structuredClone(original);
    const generation: LaunchGeneration = { ordinal: 0, helperInstance: launchReceipt.helperInstance,
      jobId: launchReceipt.jobId, rootPid: launchReceipt.root.pid, rootStartIdentity: launchReceipt.root.startIdentity };
    // Retain the actual launch before any fallible authentication, clock or
    // Caller check. Those later steps cannot erase a successful native return.
    await appendClosedSymbolEvent(journal, { step: "baseline-launch", kind: "result", generation, requestSha256,
      data: { launchReceipt, launchReceiptSha256: sha256Json(launchReceipt) } });
    const current = (): void => {
      unchanged(); outsideScope();
      const status = this.runtime.status();
      requireValue(status.state === "owned" && canonicalJson(status.launch) === canonicalJson(launchReceipt) &&
        canonicalJson(original) === canonicalJson(launchReceipt), "Bootstrap launch current owner differs from its retained result.");
    };
    current();
    const final = await loadClosedSymbolJournal(operationId); current();
    requireValue(canonicalJson(final.journal) === canonicalJson(journal), "Bootstrap launch durable journal changed.");
    Object.assign(journalInput, journal);
    return Object.freeze({ launch: original, generation, executionAuthorized: false, admissionProved: false, completionProved: false });
  }
}
