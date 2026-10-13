/** Internal subsequent launch. No authentication, project-open, edit or completion grant. */
import { join } from "node:path";
import { controlDataDirectory, controlRootCapability } from "./artifacts.ts";
import { verifyCheckpoint } from "./checkpoint.ts";
import type { CheckpointReceipt } from "./checkpoint.ts";
import { assertIssuedClosedFileCopy } from "./closed-file-copy.ts";
import type { ClosedFileCopyReceipt } from "./closed-file-copy.ts";
import { appendClosedSymbolEvent, loadClosedSymbolJournal } from "./closed-symbol-journal.ts";
import type { ClosedJournal, LaunchGeneration } from "./closed-symbol-journal.ts";
import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import type { EasyedaControlEngine } from "./engine.ts";
import { assertClosedSessionCopyAuthority } from "./windows-authority.ts";
import type { ClosedSessionTerminationProof, WindowsAuthorityLaunch } from "./windows-authority.ts";
import type { WindowsControlRuntime } from "./windows-runtime.ts";

type Engine = Pick<EasyedaControlEngine, "assertBridgeDispatchAllowed" | "assertRecoveryOperationIsolated" | "upstream">;
type Runtime = Pick<WindowsControlRuntime, "launch" | "status">;
type Phase = "edit-launch" | "verify-launch";
const PHASES = {
  "edit-launch": { ordinal: 1, copy: "baseline-copy", predecessor: "baseline-copy", close: "closed-baseline" },
  "verify-launch": { ordinal: 2, copy: "edit-copy", predecessor: "edit-sql-compare", close: "closed-edit" },
} as const;
const attempts = new WeakMap<Runtime, Set<string>>();
function requireValue(value: boolean, message: string): asserts value { if (!value) { throw new Error(message); } }

/** Only the serialized owning coordinator may invoke this stage. In particular,
 * verify-launch must follow its original successful SQL comparison; the data
 * recorder's phase order is not an independent SQL acceptance mechanism.
 */
export class ClosedSymbolRelaunchStage {
  private readonly engine: Engine;
  private readonly runtime: Runtime;
  private readonly launches = new Map<string, WindowsAuthorityLaunch>();
  public constructor(engine: Engine, runtime: Runtime) { this.engine = engine; this.runtime = runtime; }
  public originalLaunch(operationId: string, phase: Phase): WindowsAuthorityLaunch | undefined { return this.launches.get(`${operationId}:${phase}`); }

  public async launch(input: Readonly<{
    journal: ClosedJournal; phase: Phase; proof: ClosedSessionTerminationProof; copy: ClosedFileCopyReceipt; checkpoint: CheckpointReceipt;
  }>): Promise<Readonly<{
    launch: WindowsAuthorityLaunch; generation: LaunchGeneration; executionAuthorized: false; admissionProved: false; completionProved: false;
  }>> {
    requireValue(Object.hasOwn(PHASES, input.phase), "Closed symbol relaunch phase refused.");
    const callerText = canonicalJson(input), operationId = input.journal.operationId, phase = input.phase, selected = PHASES[phase];
    const copy = input.copy, proof = input.proof, retained = structuredClone(input);
    const key = `${operationId}:${phase}`;
    let used = attempts.get(this.runtime);
    if (used === undefined) { used = new Set(); attempts.set(this.runtime, used); }
    requireValue(!used.has(key), "Closed symbol relaunch attempt already consumed."); used.add(key);
    assertIssuedClosedFileCopy(copy);
    const { journal, events } = await loadClosedSymbolJournal(operationId);
    const unchanged = (): void => { requireValue(canonicalJson(input) === callerText && input.copy === copy && input.proof === proof,
      "Closed symbol relaunch caller changed."); };
    unchanged();
    requireValue(canonicalJson(journal) === canonicalJson(retained.journal) && !journal.hardStop && !journal.orphanedCallPossible,
      "Closed symbol relaunch requires its unchanged unquarantined journal.");
    const last = events.at(-1), prior = events.find((event) => event.step === selected.copy && event.kind === "result");
    requireValue(last?.step === selected.predecessor && last.kind === "result" && prior !== undefined && prior.generation !== null &&
      prior.generation.ordinal === selected.ordinal - 1 && isRecord(prior.data) && canonicalJson(prior.data["copyReceipt"]) === canonicalJson(copy),
      "Closed symbol relaunch lacks its exact previous copy.");
    const priorGeneration = prior.generation;
    const copyIntent = events.find((event) => event.step === selected.copy && event.kind === "intent");
    requireValue(isRecord(copyIntent?.data) && canonicalJson(copyIntent.data["checkpoint"]) === canonicalJson(retained.checkpoint) &&
      canonicalJson(copyIntent.data["proof"]) === canonicalJson(proof), "Closed symbol relaunch copy intent differs.");
    requireValue(proof["operationId"] === operationId && proof["phase"] === selected.close && proof["challengeAttempt"] === 1 &&
      proof["jobId"] === priorGeneration.jobId && proof["helperInstance"] === priorGeneration.helperInstance &&
      copy.closureProofSha256 === proof.proofSha256 && copy.source === journal.plan.projectPath &&
      retained.checkpoint.source === copy.source && retained.checkpoint.sourceSha256 === copy.sha256,
      "Closed symbol relaunch proof/source binding differs.");
    const scopeReader = this.engine.upstream.currentAuthenticatedBridgeDispatchBinding;
    requireValue(typeof scopeReader === "function", "Closed symbol relaunch cannot inspect bridge scope.");
    const outside = (): void => { unchanged(); requireValue(this.engine.upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader &&
      scopeReader.call(this.engine.upstream) === undefined, "Closed symbol relaunch requires absence of an authenticated scope."); };
    const previous = (): void => {
      outside(); const status = this.runtime.status();
      requireValue(status.state === "owned" && status.launch?.jobId === priorGeneration.jobId && status.launch.helperInstance === priorGeneration.helperInstance &&
        status.launch.root.pid === priorGeneration.rootPid && status.launch.root.startIdentity === priorGeneration.rootStartIdentity,
        "Closed symbol relaunch retained runtime changed.");
    };
    const current = async (): Promise<void> => { previous(); requireValue(await assertClosedSessionCopyAuthority(proof) === proof,
      "Closed symbol relaunch lacks its original current closure authority."); previous(); };
    await current();
    await this.engine.assertBridgeDispatchAllowed(); await current();
    await this.engine.assertRecoveryOperationIsolated(operationId); await current();
    const controlRoot = await controlRootCapability(); await current();
    const verified = await verifyCheckpoint(retained.checkpoint.receiptPath, {
      expectedSource: journal.plan.projectPath, artifactRoots: [join(controlDataDirectory(), "checkpoints")], controlRoot,
    });
    await current();
    requireValue(verified.ok && verified.sourceMatchesReceipt && verified.checkpointMatchesReceipt && verified.sourceEqualsCheckpoint && !verified.sourceChanged &&
      verified.source === copy.source && verified.sourceSha256 === copy.sha256 && verified.receiptPath === retained.checkpoint.receiptPath &&
      verified.checkpoint === retained.checkpoint.checkpoint && verified.checkpointSha256 === retained.checkpoint.checkpointSha256 &&
      verified.sourceDumpSha256 === retained.checkpoint.sourceDumpSha256 && verified.checkpointDumpSha256 === retained.checkpoint.checkpointDumpSha256,
      "Closed symbol relaunch checkpoint changed.");
    const request = { profile: "easyeda-pro-control.closed-symbol-relaunch-request.v1", operationId, phase,
      closedPlanSha256: journal.closedPlanSha256, priorCopySha256: copy.receiptSha256, priorProofSha256: proof.proofSha256, checkpoint: retained.checkpoint };
    const requestSha256 = sha256Json(request);
    await appendClosedSymbolEvent(journal, { step: phase, kind: "intent", generation: null, requestSha256, data: request });
    await current();
    // A new launch deliberately invalidates copy authority from the prior Job.
    // Never recheck that obsolete authority after dispatch or repeat the launch.
    const original = await this.runtime.launch();
    this.launches.set(key, original);
    const launchReceipt = structuredClone(original);
    const generation: LaunchGeneration = { ordinal: selected.ordinal, jobId: launchReceipt.jobId, helperInstance: launchReceipt.helperInstance,
      rootPid: launchReceipt.root.pid, rootStartIdentity: launchReceipt.root.startIdentity };
    await appendClosedSymbolEvent(journal, { step: phase, kind: "result", generation, requestSha256,
      data: { launchReceipt, launchReceiptSha256: sha256Json(launchReceipt) } });
    const launched = (): void => {
      outside();
      const status = this.runtime.status();
      requireValue(status.state === "owned" && canonicalJson(status.launch) === canonicalJson(launchReceipt) && canonicalJson(original) === canonicalJson(launchReceipt),
        "Closed symbol relaunch current owner differs from its recorded result.");
    };
    launched();
    const final = await loadClosedSymbolJournal(operationId); launched();
    requireValue(canonicalJson(final.journal) === canonicalJson(journal), "Closed symbol relaunch journal advanced.");
    Object.assign(input.journal, journal);
    return Object.freeze({ launch: original, generation, executionAuthorized: false, admissionProved: false, completionProved: false });
  }
}
