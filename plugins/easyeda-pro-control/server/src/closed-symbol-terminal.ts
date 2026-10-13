/** Internal locked-profile terminal proof. No tool registration or action recovery. */
/* oxlint-disable import/max-dependencies -- Fixed producer and replay modules are explicit; callers cannot supply an authority verifier. */
import { join } from "node:path";
import { controlDataDirectory, controlRootCapability, operationPath, readArtifact, readExactUtf8Artifact, updateOperation, writePhaseArtifact } from "./artifacts.ts";
import { verifyCheckpoint } from "./checkpoint.ts";
import { compareClosedSymbolClockData } from "./closed-sql-clock.ts";
import { FAMILY, loadClosedSymbolHistoricalPhaseJournal } from "./closed-symbol-journal.ts";
import type { ClosedJournal } from "./closed-symbol-journal.ts";
import { inspectRecordedClosedCopy } from "./closed-symbol-recorded-copy.ts";
import { TERMINAL_MAX_BYTES, TERMINAL_NEXT_ACTION, TERMINAL_STATE, parseClosedSymbolTerminalArtifact, parseClosedSymbolTerminalEnvelope } from "./closed-symbol-terminal-shape.ts";
import type { ClosedSymbolTerminalBody, ClosedSymbolTerminalEnvelope, TerminalDescriptor } from "./closed-symbol-terminal-shape.ts";
import { canonicalJson, isErrnoException, isRecord, sha256Json } from "./core.ts";
import type { EasyedaControlEngine } from "./engine.ts";
import { machineProfileSchema } from "./machine-profile.ts";
import type { MachineProfile } from "./machine-profile.ts";
import { assertClosedSessionCopyAuthority, assertCurrentClosedSessionCopyAuthority } from "./windows-authority.ts";
import { validateRecordedCaptureEvidence } from "./closed-symbol-recorded-native.ts";
import { validateRecordedTerminationEvidence } from "./closed-symbol-recorded-termination.ts";
import { reconstructRecordedLockedSymbolWitness } from "./closed-symbol-recorded-witness.ts";
import { reconstructClosedSymbolSqlEvidence } from "./closed-symbol-recorded-sql.ts";
import { assertOriginalClosedSymbolFullEvidence } from "./closed-symbol-coordinator.ts";
import type { FinalEvidenceRecord, OriginalFullEvidenceBindings } from "./closed-symbol-coordinator.ts";
import { reconstructRecordedSavedRead, reconstructRecordedWrite, recordedNavigationBinding } from "./closed-symbol-terminal-content.ts";
import { artifactJson, inventoryDigests, phaseData, replayRecordedLifecycle } from "./closed-symbol-terminal-lifecycle.ts";

type PhaseJournal = Awaited<ReturnType<typeof loadClosedSymbolHistoricalPhaseJournal>>;
type Bag = Readonly<Record<string, unknown>>;
type Evidence = ClosedSymbolTerminalBody["evidence"];
const attempts = new WeakMap<EasyedaControlEngine, Set<string>>();
function need(value: boolean, message: string): asserts value { if (!value) { throw new Error(message); } }
function bag(value: unknown): Bag { need(isRecord(value), "Terminal object missing."); return value; }
function same(actual: unknown, expected: unknown, label: string): void { need(canonicalJson(actual) === canonicalJson(expected), `Terminal ${label} differs.`); }
function phaseArtifact(journal: ClosedJournal, sequence: number): TerminalDescriptor {
  const value = journal.artifacts[sequence - 1]; need(value !== undefined, "Terminal phase descriptor missing."); return value;
}
function evidenceFromOriginal(original: OriginalFullEvidenceBindings): Evidence {
  return { fingerprint: original.fingerprintArtifact, baselineWindow: original.windowArtifacts[0], editWindow: original.windowArtifacts[1],
    verificationWindow: original.windowArtifacts[2], witnessQualification: original.edit.witness.clockArtifact,
    witnessRaw: phaseArtifact(original.journal, 20), writeRaw: phaseArtifact(original.journal, 22), savedReadRaw: original.verification.savedRead.rawArtifact };
}

/** Recompute semantic data from fixed managed files. Never reads the source project. */
async function replay(loaded: PhaseJournal, evidence: Evidence, runtime: MachineProfile["runtime"]): Promise<Readonly<{
  generations: ClosedSymbolTerminalBody["generations"]; results: ClosedSymbolTerminalBody["results"]; finalSource: ClosedSymbolTerminalBody["finalSource"];
  values: Readonly<{ witness: unknown; preparation: unknown; write: unknown; editComparison: unknown; savedSource: unknown; savedRead: unknown; verificationComparison: unknown }>;
  recheckDependencies: () => Promise<void>;
}>> {
  const { predecessor: journal, events } = loaded;
  need(journal.sequence === 44 && events.length === 44, "Terminal semantic replay needs all44 events.");
  const seal = canonicalJson(loaded);
  const evidenceSeal = canonicalJson(evidence);
  const current = (): void => { same(canonicalJson(loaded), seal, "replay input"); same(canonicalJson(evidence), evidenceSeal, "replay descriptors"); };
  same(evidence.witnessRaw, phaseArtifact(journal, 20), "witness raw descriptor"); same(evidence.writeRaw, phaseArtifact(journal, 22), "write raw descriptor");
  const baseline = await inspectRecordedClosedCopy({ operationId: journal.operationId, phase: "baseline-copy", runtime }); current();
  const edit = await inspectRecordedClosedCopy({ operationId: journal.operationId, phase: "edit-copy", runtime }); current();
  const verification = await inspectRecordedClosedCopy({ operationId: journal.operationId, phase: "verify-copy", runtime }); current();
  const witness = await reconstructRecordedLockedSymbolWitness({ journal, events, baselineInventory: baseline.inventory }); current();
  const lifecycle = await replayRecordedLifecycle({ journal, events, inventories: [baseline.inventory, edit.inventory, verification.inventory],
    fingerprint: evidence.fingerprint, windows: [evidence.baselineWindow, evidence.editWindow, evidence.verificationWindow], runtime,
    nativeClockSource: bag(witness.qualification["launchClock"]) }); current();
  same(witness.result.clockArtifact, evidence.witnessQualification, "witness qualification descriptor");
  const editDispatch = phaseData(events, 13)["bridgeDispatch"];
  validateRecordedCaptureEvidence({ journal, generation: lifecycle[1].generation, phase: "closed-edit", attempt: 2,
    capture: witness.qualification["beforeCapture"], clock: witness.qualification["beforeClock"], bridgeDispatch: editDispatch, source: lifecycle[1].nativeSource });
  validateRecordedCaptureEvidence({ journal, generation: lifecycle[1].generation, phase: "closed-edit", attempt: 3,
    capture: witness.qualification["afterCapture"], clock: witness.qualification["afterClock"], bridgeDispatch: editDispatch, source: lifecycle[1].nativeSource });
  const sql = await reconstructClosedSymbolSqlEvidence({ journal, events, baselineInventory: baseline.inventory, editInventory: edit.inventory,
    verificationInventory: verification.inventory, witness: witness.result.witness, witnessClockArtifact: witness.result.clockArtifact }); current();
  const clockRequest = phaseData(events, 27);
  validateRecordedTerminationEvidence({ journal, generation: lifecycle[1].generation, capture: lifecycle[1].capture, bridgeDispatch: editDispatch,
    terminationClock: clockRequest["terminationObservation"], closedProof: lifecycle[1].proof, source: lifecycle[1].nativeSource });
  const clockRelation = compareClosedSymbolClockData({ operationId: journal.operationId, generation: lifecycle[1].generation,
    witnessArtifactSha256: witness.result.artifactSha256, witness: witness.result.witness, qualification: witness.qualification,
    proof: lifecycle[1].proof, termination: clockRequest["terminationObservation"] });
  same(clockRequest["clockRelation"], clockRelation, "independently replayed exit clock relation");
  const write = reconstructRecordedWrite({ journal, events, witness: witness.result, preparation: sql.preparation });
  await recordedNavigationBinding(journal, events, "edit-open"); current();
  const navigation = await recordedNavigationBinding(journal, events, "verify-open"); current();
  const savedRead = await reconstructRecordedSavedRead({ journal, events, source: sql.savedSource, projection: sql.projection,
    rawArtifact: evidence.savedReadRaw, nativeSource: lifecycle[2].nativeSource }); current();
  const final = lifecycle[2];
  need(typeof final.copy["sha256"] === "string", "Terminal final source digest missing.");
  const finalSource = Object.freeze({ source: journal.plan.projectPath, sourceSha256: final.copy["sha256"], sourceIdentitySha256: sha256Json(final.copy["sourceIdentity"]),
    checkpointReceiptSha256: sha256Json(final.checkpoint), copyReceiptSha256: sha256Json(final.copy), sqlDigests: inventoryDigests(verification.inventory),
    method: "issued-copy+verifyCheckpoint+complete-sql" as const });
  const results = Object.freeze({ witnessResultSha256: witness.resultSha256, ...sql.resultHashes, writeResultSha256: sha256Json(write),
    savedReadResultSha256: sha256Json(savedRead), verificationNavigationBindingSha256: sha256Json(navigation) });
  const values = Object.freeze({ witness: witness.result, preparation: sql.preparation, write, editComparison: sql.editComparison,
    savedSource: sql.savedSource, savedRead, verificationComparison: sql.verificationComparison });
  const generations = lifecycle.map((row) => row.terminal);
  const recheckDependencies = async (): Promise<void> => {
    current();
    for (const descriptor of Object.values(evidence)) { await readExactUtf8Artifact(descriptor); current(); }
    const before = await inspectRecordedClosedCopy({ operationId: journal.operationId, phase: "baseline-copy", runtime }); current();
    const edited = await inspectRecordedClosedCopy({ operationId: journal.operationId, phase: "edit-copy", runtime }); current();
    const verified = await inspectRecordedClosedCopy({ operationId: journal.operationId, phase: "verify-copy", runtime }); current();
    const checked = await replayRecordedLifecycle({ journal, events, inventories: [before.inventory, edited.inventory, verified.inventory],
      fingerprint: evidence.fingerprint, windows: [evidence.baselineWindow, evidence.editWindow, evidence.verificationWindow], runtime,
      nativeClockSource: bag(witness.qualification["launchClock"]) }); current();
    same(checked.map((row) => row.terminal), generations, "late dependency identities and bytes");
  };
  // Fixed complete reload validates every managed phase again. This is a sequence
  // Of observations, not an atomic multi-file snapshot or ongoing immutability.
  await recheckDependencies();
  const end = await loadClosedSymbolHistoricalPhaseJournal(journal.operationId); current();
  same(end.journal, loaded.journal, "journal changed during semantic replay");
  return Object.freeze({ generations, results, finalSource, values, recheckDependencies });
}
function envelopeFor(journal: ClosedJournal, evidence: Evidence, computed: Awaited<ReturnType<typeof replay>>, recordedAt: string): ClosedSymbolTerminalEnvelope {
  const body: ClosedSymbolTerminalBody = { operationId: journal.operationId, family: FAMILY, closedPlanSha256: journal.closedPlanSha256,
    markerSha256: journal.markerSha256, expectedFingerprintSha256: journal.plan.expectedFingerprintSha256, facadeSha256: journal.plan.facadeSha256,
    nativePinsSha256: journal.plan.nativePinsSha256,
    predecessor: { state: "closed-session-evidence-recorded", updatedAt: journal.updatedAt, nextSafeAction: journal.nextSafeAction, entireJournalSha256: sha256Json(journal) },
    recordedAt, phaseArtifacts: journal.artifacts, generations: computed.generations, evidence, results: computed.results, finalSource: computed.finalSource,
    outcome: { metadataPersistedAndVerified: true, savedContentVerifiedInFreshWorker: true, wholeOwnedSessionsExited: true,
      companionOpenedInFreshSession: true, explicitSavePerformed: false, targetEditorOpened: false, saved: false, reopened: false } };
  return parseClosedSymbolTerminalEnvelope({ profile: "easyeda-pro-control.closed-symbol-terminal.v1", body, bodySha256: sha256Json(body) });
}
export interface HistoricalTerminalInspection {
  readonly profile: "private.closed-symbol-historical-terminal.v1"; readonly operationId: string;
  readonly classification: "historical-completion-verified" | "terminal-publication-incomplete" | "evidence-only";
  readonly historicalCompletionRecorded: boolean; readonly terminalOutcomeVerified: boolean;
  readonly liveOriginalCompletionProved: false; readonly currentSourceChecked: false; readonly currentOwnershipChecked: false;
  readonly authorityRestored: false; readonly executionAuthorized: false; readonly replayAllowed: false;
  readonly terminalArtifact: TerminalDescriptor | null; readonly bodySha256: string | null;
  readonly storedJournalSha256: string; readonly entireStoredJournalSha256: string;
}
function historical(journal: ClosedJournal, classification: HistoricalTerminalInspection["classification"], descriptor: TerminalDescriptor | null, bodySha256: string | null): HistoricalTerminalInspection {
  need(typeof journal["journalSha256"] === "string", "Terminal stored self-seal missing.");
  return Object.freeze({ profile: "private.closed-symbol-historical-terminal.v1", operationId: journal.operationId, classification,
    historicalCompletionRecorded: classification === "historical-completion-verified", terminalOutcomeVerified: classification === "historical-completion-verified",
    liveOriginalCompletionProved: false, currentSourceChecked: false, currentOwnershipChecked: false, authorityRestored: false,
    executionAuthorized: false, replayAllowed: false, terminalArtifact: descriptor, bodySha256,
    storedJournalSha256: journal["journalSha256"], entireStoredJournalSha256: sha256Json(journal) });
}
/** The sole restart entry accepts an operation ID and trusted local SQL runtime,
 * never a supplied journal, callback, restored Stage token or source project. */
export async function inspectClosedSymbolTerminal(operationId: string, runtime: MachineProfile["runtime"]): Promise<HistoricalTerminalInspection> {
  const selectedRuntime = Object.freeze(machineProfileSchema.shape.runtime.parse(runtime));
  await controlRootCapability(false);
  const loaded = await loadClosedSymbolHistoricalPhaseJournal(operationId);
  if (loaded.journal.state !== TERMINAL_STATE) {
    const path = join(operationPath(operationId).slice(0, -5), "45-closed-symbol-terminal.json");
    try { await readArtifact(path, 0, 1); }
    catch (error) { if (isErrnoException(error) && error.code === "ENOENT") { return historical(loaded.journal, "evidence-only", null, null); } throw error; }
    need(loaded.journal.sequence === 44, "Terminal artifact exists before complete phase evidence.");
    return historical(loaded.journal, "terminal-publication-incomplete", null, null);
  }
  const descriptor = parseClosedSymbolTerminalArtifact(loaded.journal["terminalArtifact"], operationId);
  const envelope = parseClosedSymbolTerminalEnvelope(await artifactJson(descriptor));
  const computed = await replay(loaded, envelope.body.evidence, selectedRuntime);
  same(envelope, envelopeFor(loaded.predecessor, envelope.body.evidence, computed, envelope.body.recordedAt), "historical semantic envelope");
  await readExactUtf8Artifact(descriptor);
  await computed.recheckDependencies();
  const final = await loadClosedSymbolHistoricalPhaseJournal(operationId);
  same(final.journal, loaded.journal, "historical terminal changed before return");
  return historical(final.journal, "historical-completion-verified", descriptor, envelope.bodySha256);
}

export interface OriginalTerminalCompletion {
  readonly profile: "private.closed-symbol-original-completion.v1"; readonly operationId: string; readonly terminalArtifact: TerminalDescriptor;
  readonly bodySha256: string; readonly completionProved: true; readonly historicalCompletionRecorded: true;
  readonly executionAuthorized: false; readonly saved: false; readonly reopened: false;
}
const completions = new WeakMap<object, Readonly<{ engine: EasyedaControlEngine; full: FinalEvidenceRecord; seal: string }>>();
export function assertOriginalClosedSymbolCompletion(value: unknown, engine: EasyedaControlEngine, operationId: string): asserts value is OriginalTerminalCompletion {
  need(isRecord(value), "Original terminal completion required.");
  const owner = completions.get(value);
  need(owner !== undefined && owner.engine === engine && value["operationId"] === operationId && canonicalJson(value) === owner.seal,
    "Original terminal completion owner or value differs.");
  assertOriginalClosedSymbolFullEvidence(owner.full, engine, operationId);
}
export class ClosedSymbolTerminalStage {
  private readonly retainedArtifacts = new Map<string, TerminalDescriptor>();
  private readonly engine: EasyedaControlEngine;
  private readonly runtime: MachineProfile["runtime"];
  public constructor(engine: EasyedaControlEngine, runtime: MachineProfile["runtime"]) { this.engine = engine; this.runtime = Object.freeze(machineProfileSchema.shape.runtime.parse(runtime)); }
  public originalArtifact(operationId: string): TerminalDescriptor | undefined { return this.retainedArtifacts.get(operationId); }
  public async complete(full: FinalEvidenceRecord): Promise<OriginalTerminalCompletion> {
    const operationId = full.operationId;
    const original = assertOriginalClosedSymbolFullEvidence(full, this.engine, operationId);
    let used = attempts.get(this.engine); if (used === undefined) { used = new Set(); attempts.set(this.engine, used); }
    need(!used.has(operationId), "Terminal completion attempt cannot repeat."); used.add(operationId);
    const current = (): void => { need(assertOriginalClosedSymbolFullEvidence(full, this.engine, operationId) === original,
      "Terminal original evidence changed."); assertCurrentClosedSessionCopyAuthority(original.verification.proof); };
    const owned = async (): Promise<void> => { current(); await assertClosedSessionCopyAuthority(original.verification.proof); current(); };
    await owned();
    const loaded = await loadClosedSymbolHistoricalPhaseJournal(operationId); current();
    same(loaded.journal, original.journal, "terminal predecessor");
    const evidence = evidenceFromOriginal(original);
    const computed = await replay(loaded, evidence, this.runtime); current();
    same(computed.values, { witness: original.edit.witness, preparation: original.edit.preparation, write: original.edit.write,
      editComparison: original.edit.comparison, savedSource: original.verification.savedSource, savedRead: original.verification.savedRead,
      verificationComparison: original.verification.comparison }, "original and reconstructed results");
    await owned();
    const root = await controlRootCapability(false); current();
    const { checkpoint, copy } = original.verification.copy;
    const verifyCurrentSource = async (): Promise<void> => {
      current();
      const verified = await verifyCheckpoint(checkpoint.receiptPath, { expectedSource: original.journal.plan.projectPath,
        artifactRoots: [join(controlDataDirectory(), "checkpoints")], controlRoot: root });
      current();
      need(verified.ok && verified.sourceMatchesReceipt && verified.checkpointMatchesReceipt && verified.sourceEqualsCheckpoint && !verified.sourceChanged &&
        verified.source === copy.source && verified.sourceSha256 === copy.sha256 && verified.receiptPath === checkpoint.receiptPath &&
        verified.checkpoint === checkpoint.checkpoint && verified.checkpointSha256 === checkpoint.checkpointSha256 &&
        verified.sourceDumpSha256 === checkpoint.sourceDumpSha256 && verified.checkpointDumpSha256 === checkpoint.checkpointDumpSha256,
        "Terminal current source/checkpoint differs.");
    };
    await verifyCurrentSource();
    await owned();
    const before = await loadClosedSymbolHistoricalPhaseJournal(operationId); current(); same(before.journal, loaded.journal, "prepublication predecessor");
    const envelope = envelopeFor(original.journal, evidence, computed, new Date().toISOString());
    need(Buffer.byteLength(`${JSON.stringify(envelope)}\n`) <= TERMINAL_MAX_BYTES, "Terminal envelope exceeds its byte bound.");
    const descriptor = await writePhaseArtifact(operationId, 45, "closed-symbol-terminal", envelope);
    this.retainedArtifacts.set(operationId, descriptor); current();
    const prior = await loadClosedSymbolHistoricalPhaseJournal(operationId); current(); same(prior.journal, loaded.journal, "terminal publication predecessor");
    const next = { ...structuredClone(original.journal), state: TERMINAL_STATE, updatedAt: envelope.body.recordedAt,
      nextSafeAction: TERMINAL_NEXT_ACTION, terminalArtifact: descriptor };
    await updateOperation(next); current();
    const inspected = await inspectClosedSymbolTerminal(operationId, this.runtime); current();
    need(inspected.terminalOutcomeVerified && inspected.bodySha256 === envelope.bodySha256, "Terminal historical reproof differs.");
    await owned();
    await computed.recheckDependencies(); current();
    await verifyCurrentSource();
    await owned();
    const final = await loadClosedSymbolHistoricalPhaseJournal(operationId); current(); same(final.journal, next, "final completed journal");
    const result = Object.freeze({ profile: "private.closed-symbol-original-completion.v1" as const, operationId, terminalArtifact: descriptor,
      bodySha256: envelope.bodySha256, completionProved: true as const, historicalCompletionRecorded: true as const,
      executionAuthorized: false as const, saved: false as const, reopened: false as const });
    completions.set(result, { engine: this.engine, full, seal: canonicalJson(result) }); return result;
  }
}
