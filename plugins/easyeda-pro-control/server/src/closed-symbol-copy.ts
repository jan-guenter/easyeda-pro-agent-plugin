/** Internal closed-copy orchestration. No completion, replay or project-generation grant. */
import { join } from "node:path";
import { controlDataDirectory, controlRootCapability, operationPath } from "./artifacts.ts";
import { createCheckpoint } from "./checkpoint.ts";
import type { CheckpointReceipt } from "./checkpoint.ts";
import { copyClosedProjectBytes } from "./closed-file-copy.ts";
import type { ClosedFileCopyReceipt } from "./closed-file-copy.ts";
import { readClosedCopySqlInventory } from "./closed-file-sql.ts";
import { appendClosedSymbolEvent, loadClosedSymbolJournal } from "./closed-symbol-journal.ts";
import type { ClosedJournal, Generation } from "./closed-symbol-journal.ts";
import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import type { EasyedaControlEngine } from "./engine.ts";
import type { MachineProfile } from "./machine-profile.ts";
import { assertClosedSessionCopyAuthority } from "./windows-authority.ts";
import type { ClosedSessionTerminationProof } from "./windows-authority.ts";

type Engine = Pick<EasyedaControlEngine, "assertBridgeDispatchAllowed" | "assertRecoveryOperationIsolated" | "upstream">;
type Phase = "baseline-copy" | "edit-copy" | "verify-copy";
const PHASES = {
  "baseline-copy": { ordinal: 0, close: "baseline-close", capture: "closed-baseline", launch: "baseline-launch" },
  "edit-copy": { ordinal: 1, close: "edit-close", capture: "closed-edit", launch: "edit-launch" },
  "verify-copy": { ordinal: 2, close: "verify-close", capture: "closed-verification", launch: "verify-launch" },
} as const;
const used = new WeakMap<Engine, Set<string>>();
function requireValue(value: boolean, message: string): asserts value { if (!value) { throw new Error(message); } }

export class ClosedSymbolCopyStage {
  private readonly engine: Engine;
  private readonly runtime: MachineProfile["runtime"];
  private readonly copies = new Map<string, ClosedFileCopyReceipt>();
  public constructor(engine: Engine, runtime: MachineProfile["runtime"]) { this.engine = engine; this.runtime = structuredClone(runtime); }

  public originalCopy(operationId: string, phase: Phase): ClosedFileCopyReceipt | undefined {
    return this.copies.get(`${operationId}:${phase}`);
  }

  public async copy(journalInput: ClosedJournal, phase: Phase, generationInput: Generation, proof: ClosedSessionTerminationProof): Promise<Readonly<{
    copy: ClosedFileCopyReceipt; checkpoint: CheckpointReceipt; inventory: Awaited<ReturnType<typeof readClosedCopySqlInventory>>;
    executionAuthorized: false; completionProved: false; sourceProjectGenerationBindingVerified: false;
  }>> {
    requireValue(Object.hasOwn(PHASES, phase), "Closed symbol copy phase refused.");
    const operationId = journalInput.operationId;
    const key = `${operationId}:${phase}`, selected = PHASES[phase];
    const callerText = canonicalJson(journalInput), generation = structuredClone(generationInput), generationText = canonicalJson(generation);
    let attempts = used.get(this.engine);
    if (attempts === undefined) { attempts = new Set(); used.set(this.engine, attempts); }
    requireValue(!attempts.has(key), "Closed symbol copy attempt already consumed."); attempts.add(key);
    const { journal, events } = await loadClosedSymbolJournal(operationId);
    const unchanged = (): void => { requireValue(canonicalJson(journalInput) === callerText && canonicalJson(generationInput) === generationText,
      "Closed symbol copy caller changed."); };
    unchanged();
    requireValue(canonicalJson(journal) === callerText && !journal.hardStop && !journal.orphanedCallPossible,
      "Closed symbol copy needs its unchanged unquarantined journal.");
    const closeIntent = events.find((event) => event.step === selected.close && event.kind === "intent"), last = events.at(-1);
    const launch = events.find((event) => event.step === selected.launch && event.kind === "result");
    requireValue(last?.step === selected.close && last.kind === "result" && canonicalJson(last.generation) === generationText &&
      generation.ordinal === selected.ordinal && isRecord(last.data) && isRecord(closeIntent?.data) && isRecord(launch?.data),
      "Closed symbol copy requires the exact acknowledged close.");
    const capture = closeIntent.data["capture"], closeReceipt = last.data["closeReceipt"], intent = closeIntent.data["intent"];
    requireValue(isRecord(intent) && isRecord(closeReceipt) && isRecord(capture), "Closed symbol copy close evidence missing.");
    const originalProof = await assertClosedSessionCopyAuthority(proof);
    unchanged();
    requireValue(originalProof === proof && proof["operationId"] === operationId && proof["phase"] === selected.capture && proof["challengeAttempt"] === 1 &&
      proof["jobId"] === generation.jobId && proof["helperInstance"] === generation.helperInstance &&
      proof["bridgeSessionSha256"] === generation.sessionSha256 && proof["runtimeIdentitySha256"] === generation.runtimeSha256 &&
      proof.closeIntentSha256 === intent["closeIntentSha256"] && proof.closeReceiptSha256 === closeReceipt["closeReceiptSha256"] &&
      proof.authoritySha256 === intent["authoritySha256"] && proof.launchSha256 === sha256Json(launch.data["launchReceipt"]) &&
      sha256Json(capture) === generation.captureSha256 && last.data["closeReceiptSha256"] === sha256Json(closeReceipt),
      "Closed symbol copy proof does not bind the recorded generation and close.");
    const scopeReader = this.engine.upstream.currentAuthenticatedBridgeDispatchBinding;
    requireValue(typeof scopeReader === "function", "Closed symbol copy cannot inspect bridge scope.");
    const current = async (): Promise<void> => {
      unchanged();
      requireValue(this.engine.upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader && scopeReader.call(this.engine.upstream) === undefined,
        "Closed symbol copy cannot run inside an unknown or authenticated scope.");
      requireValue(await assertClosedSessionCopyAuthority(proof) === proof, "Closed symbol copy authority changed.");
      unchanged();
      requireValue(this.engine.upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader && scopeReader.call(this.engine.upstream) === undefined,
        "Closed symbol copy scope changed during authority check.");
    };
    await current();
    await this.engine.assertBridgeDispatchAllowed(); await current();
    await this.engine.assertRecoveryOperationIsolated(operationId); await current();
    const root = await controlRootCapability(); await current();
    const outputDir = join(controlDataDirectory(), "checkpoints");
    const checkpoint = await createCheckpoint({ source: journal.plan.projectPath, outputDir, label: `${phase}-${operationId.slice(-8)}` },
      { expectedSource: journal.plan.projectPath, artifactRoots: [outputDir], controlRoot: root, maximumSourceBytes: 268_435_456 });
    await current();
    // This ordinary VACUUM checkpoint supplies an independently observed source
    // Hash and later navigation input. Its bytes are never the full-SQL baseline.
    const proofData: unknown = JSON.parse(canonicalJson(proof));
    const request = { proof: proofData, checkpoint, source: journal.plan.projectPath, generation };
    const requestSha256 = sha256Json(request);
    await appendClosedSymbolEvent(journal, { step: phase, kind: "intent", generation, requestSha256, data: request });
    await current();
    const copy = await copyClosedProjectBytes({ closureProof: proof, source: journal.plan.projectPath,
      expectedSourceSha256: checkpoint.sourceSha256, artifactDirectory: operationPath(operationId).slice(0, -5) });
    this.copies.set(key, copy);
    await current();
    const lineage = checkpoint.sourceIdentity, source = copy.sourceIdentity, stat = checkpoint["sourceStatAfter"];
    requireValue(lineage.dev === source.device && lineage.ino === source.inode && lineage.birthtimeNs === source.birthtimeNs &&
      lineage.ctimeNs === source.ctimeNs && isRecord(stat) && stat["size"] === source.size && stat["mtimeNs"] === source.mtimeNs &&
      stat["ctimeNs"] === source.ctimeNs, "Closed symbol copy source lineage changed after checkpoint.");
    const inventory = await readClosedCopySqlInventory({ copy, runtime: this.runtime });
    // Retain the actual completed SQL/copy result before fallible caller checks.
    await appendClosedSymbolEvent(journal, { step: phase, kind: "result", generation, requestSha256,
      data: { copyReceipt: copy, sqlDigests: { checkpointSha256: inventory.checkpointSha256, schemaSha256: inventory.schemaSha256, logicalSha256: inventory.logicalSha256 } } });
    await current();
    const final = await loadClosedSymbolJournal(operationId);
    unchanged();
    requireValue(this.engine.upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader && scopeReader.call(this.engine.upstream) === undefined,
      "Closed symbol copy scope changed during final journal read.");
    requireValue(canonicalJson(final.journal) === canonicalJson(journal), "Closed symbol copy journal advanced or changed.");
    Object.assign(journalInput, journal);
    return Object.freeze({ copy, checkpoint, inventory, executionAuthorized: false, completionProved: false, sourceProjectGenerationBindingVerified: false });
  }
}
