/** Internal full-flow orchestration. No route, restart action or terminal completion grant. */
/* oxlint-disable import/max-dependencies -- Construct the actual maintained stages here; do not accept caller-provided authority or phase callbacks. */
import { setTimeout as delay } from "node:timers/promises";
import { writePhaseArtifact } from "./artifacts.ts";
import type { ArtifactDescriptor } from "./artifacts.ts";
import { ClosedSymbolAdmissionStage } from "./closed-symbol-admission.ts";
import { ClosedSymbolCloseStage } from "./closed-symbol-close.ts";
import type { ClosedSymbolCloseResult } from "./closed-symbol-close.ts";
import { ClosedSymbolCopyStage } from "./closed-symbol-copy.ts";
import { assertIssuedClosedFileCopy } from "./closed-file-copy.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import { createClosedSymbolJournal, inspectClosedSymbolRestart, loadClosedSymbolJournal } from "./closed-symbol-journal.ts";
import type { ClosedJournal } from "./closed-symbol-journal.ts";
import { ClosedSymbolBootstrapLaunchStage } from "./closed-symbol-launch.ts";
import { ClosedSymbolRelaunchStage } from "./closed-symbol-relaunch.ts";
import { ClosedSymbolNavigationStage, assertOriginalClosedSymbolNavigation } from "./closed-symbol-navigation.ts";
import { ClosedSymbolWitnessStage, assertOriginalClosedSymbolWitness } from "./closed-symbol-witness.ts";
import { lockedWitnessBaseline } from "./closed-symbol-witness-baseline.ts";
import { selectOriginalBaselineHead } from "./closed-symbol-head-selector.ts";
import { ClosedSymbolMainReferenceStage, assertOriginalMainReference } from "./closed-symbol-main-reference.ts";
import type { OriginalMainReference } from "./closed-symbol-main-reference.ts";
import { ClosedSymbolSqlComparisonStage, assertOriginalClosedSymbolComparison, assertOriginalClosedSymbolPreparation } from "./closed-symbol-sql-comparison.ts";
import { ClosedSymbolWriteStage, assertOriginalClosedSymbolWrite } from "./closed-symbol-write.ts";
import { assertOriginalSavedSymbolSource, prepareOriginalSavedSymbolSource } from "./closed-symbol-saved-source.ts";
import { ClosedSymbolSavedReadStage, assertOriginalClosedSymbolSavedRead } from "./closed-symbol-saved-read.ts";
import { ClosedSymbolStartupStage } from "./closed-symbol-startup.ts";
import { canonicalJson, isRecord, newOperationId, sha256Json, validatePrivateFingerprint } from "./core.ts";
import { selectClosedSymbolApplicationWindow } from "./closed-symbol-window.ts";
import type { EasyedaControlEngine } from "./engine.ts";
import { machineProfileSchema } from "./machine-profile.ts";
import type { MachineProfile } from "./machine-profile.ts";
import type { UpstreamEasyedaClient } from "./upstream.ts";
import { assertClosedSessionCopyAuthority, assertCurrentClosedSessionCopyAuthority, assertCurrentClosedSessionTerminationObservation } from "./windows-authority.ts";
import type { ClosedSessionTerminationObservation, ClosedSessionTerminationProof } from "./windows-authority.ts";
import type { WindowsNativeUiController } from "./windows-native-ui.ts";
import type { WindowsControlRuntime } from "./windows-runtime.ts";

type Launch = Awaited<ReturnType<ClosedSymbolBootstrapLaunchStage["launch"]>>;
type Admission = Awaited<ReturnType<ClosedSymbolAdmissionStage["admit"]>>;
type Startup = Awaited<ReturnType<ClosedSymbolStartupStage["observe"]>>;
type Copy = Awaited<ReturnType<ClosedSymbolCopyStage["copy"]>>;
interface Originals {
  launch?: Launch; admission?: Admission; startup?: Startup; close?: ClosedSymbolCloseResult;
  proof?: ClosedSessionTerminationProof; copy?: Copy;
}
interface LaterOriginals {
  launch?: Awaited<ReturnType<ClosedSymbolRelaunchStage["launch"]>>;
  admission?: Admission; startup?: Startup;
  navigation?: Awaited<ReturnType<ClosedSymbolNavigationStage["openCompanion"]>>;
  witness?: Awaited<ReturnType<ClosedSymbolWitnessStage["collect"]>>;
  preparation?: Awaited<ReturnType<ClosedSymbolSqlComparisonStage["prepareForWrite"]>>;
  write?: Awaited<ReturnType<ClosedSymbolWriteStage["write"]>>;
  close?: ClosedSymbolCloseResult; proof?: ClosedSessionTerminationProof; copy?: Copy;
  comparison?: Awaited<ReturnType<ClosedSymbolSqlComparisonStage["compareEdit"]>>;
  savedSource?: Awaited<ReturnType<typeof prepareOriginalSavedSymbolSource>>;
  savedRead?: Awaited<ReturnType<ClosedSymbolSavedReadStage["read"]>>;
}
export interface FinalEvidenceRecord {
  readonly operationId: string; readonly sequence: 44; readonly journalSha256: string;
  readonly savedRead: NonNullable<LaterOriginals["savedRead"]>;
  readonly verificationComparison: NonNullable<LaterOriginals["comparison"]>;
  readonly proof: ClosedSessionTerminationProof; readonly copy: Copy;
  readonly executionAuthorized: false; readonly completionProved: false;
  readonly saved: false; readonly reopened: false;
}
export interface BaselineRecord {
  readonly operationId: string; readonly sequence: 10; readonly copy: Copy;
  readonly executionAuthorized: false; readonly completionProved: false;
  readonly saved: false; readonly reopened: false;
}
export interface OriginalFullEvidenceBindings {
  readonly journal: ClosedJournal;
  readonly baseline: Readonly<Required<Originals>>;
  readonly edit: Readonly<Required<Pick<LaterOriginals, "launch" | "admission" | "startup" | "navigation" | "witness" | "preparation" | "write" | "close" | "proof" | "copy" | "comparison">>>;
  readonly verification: Readonly<Required<Pick<LaterOriginals, "launch" | "admission" | "startup" | "navigation" | "savedSource" | "savedRead" | "close" | "proof" | "copy" | "comparison">>>;
  readonly fingerprintArtifact: Readonly<ArtifactDescriptor>;
  readonly windowArtifacts: readonly [Readonly<ArtifactDescriptor>, Readonly<ArtifactDescriptor>, Readonly<ArtifactDescriptor>];
}
export interface OriginalAgedFullEvidenceBindings extends OriginalFullEvidenceBindings {
  readonly mainReference: OriginalMainReference;
}
interface FullEvidenceOwner {
  readonly engine: EasyedaControlEngine; readonly operationId: string;
  readonly value: FinalEvidenceRecord;
  readonly bindings: OriginalFullEvidenceBindings | OriginalAgedFullEvidenceBindings; readonly text: string;
  readonly headEligibility: "locked" | "aged-unlocked";
  readonly current: () => void;
}
const fullEvidenceOwners = new WeakMap<object, FullEvidenceOwner>();
const active = new WeakSet<EasyedaControlEngine>(), attempted = new WeakSet<WindowsControlRuntime>();
function need(value: boolean, message: string): asserts value { if (!value) { throw new Error(message); } }

function copyProjection(value: Copy): unknown {
  assertIssuedClosedFileCopy(value.copy);
  const { inventory, ...rest } = value;
  // The actual reader freezes its complete result and registers it only after
  // Child close. Retain that identity instead of serializing every SQL cell.
  const completion = readerCompletion(inventory);
  need(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null &&
    inventory.checkpointSha256 === value.copy.sha256, "Full evidence inventory lacks its completed original reader.");
  return { ...rest, inventory: { checkpointSha256: inventory.checkpointSha256, schemaSha256: inventory.schemaSha256,
    logicalSha256: inventory.logicalSha256 }, completion };
}
function fullEvidenceText(value: FinalEvidenceRecord, bindings: OriginalFullEvidenceBindings): string {
  need(value.copy === bindings.verification.copy && value.proof === bindings.verification.proof &&
    value.savedRead === bindings.verification.savedRead && value.verificationComparison === bindings.verification.comparison,
    "Full evidence public original references changed.");
  return canonicalJson({ value: { ...value, copy: copyProjection(value.copy) }, bindings: { ...bindings,
    baseline: { ...bindings.baseline, copy: copyProjection(bindings.baseline.copy) },
    edit: { ...bindings.edit, copy: copyProjection(bindings.edit.copy) },
    verification: { ...bindings.verification, copy: copyProjection(bindings.verification.copy) } } });
}
function assertFullStageOriginals(bindings: OriginalFullEvidenceBindings, engine: EasyedaControlEngine, operationId: string): void {
  const { edit, verification } = bindings;
  if ("mainReference" in bindings) { assertOriginalMainReference(bindings.mainReference, engine, operationId); }
  assertOriginalClosedSymbolWitness(edit.witness, engine, operationId);
  assertOriginalClosedSymbolPreparation(edit.preparation, engine, operationId);
  assertOriginalClosedSymbolWrite(edit.write, engine, operationId);
  assertOriginalClosedSymbolComparison(edit.comparison, engine, operationId, "edit-sql-compare");
  assertOriginalClosedSymbolNavigation(edit.navigation, engine, operationId, "edit-open");
  assertOriginalClosedSymbolNavigation(verification.navigation, engine, operationId, "verify-open");
  assertOriginalSavedSymbolSource(verification.savedSource, engine, operationId);
  assertOriginalClosedSymbolSavedRead(verification.savedRead, engine, operationId);
  assertOriginalClosedSymbolComparison(verification.comparison, engine, operationId, "verify-sql-compare");
  assertCurrentClosedSessionCopyAuthority(verification.proof);
}

/** Original successful orchestration only. It still does not prove terminal
 * completion, and never restores authority from journal data or receipt hashes.
 */
function assertFullEvidence(value: unknown, engine: EasyedaControlEngine, operationId: string, headEligibility: "locked" | "aged-unlocked"): OriginalFullEvidenceBindings | OriginalAgedFullEvidenceBindings {
  need(value !== null && typeof value === "object", "Original full evidence is missing.");
  const owner = fullEvidenceOwners.get(value);
  need(owner !== undefined && owner.engine === engine && owner.operationId === operationId && owner.headEligibility === headEligibility,
    "Full evidence requires its original successful coordinator result.");
  owner.current();
  need(fullEvidenceText(owner.value, owner.bindings) === owner.text, "Full evidence retained values changed.");
  assertFullStageOriginals(owner.bindings, engine, operationId);
  return owner.bindings;
}

/** Locked and aged original results are deliberately not interchangeable. */
export function assertOriginalClosedSymbolFullEvidence(value: unknown, engine: EasyedaControlEngine, operationId: string): OriginalFullEvidenceBindings {
  const bindings = assertFullEvidence(value, engine, operationId, "locked");
  need(!Object.hasOwn(bindings, "mainReference"), "Locked full evidence contains an aged reference.");
  return bindings;
}
export function assertOriginalAgedClosedSymbolFullEvidence(value: unknown, engine: EasyedaControlEngine, operationId: string): OriginalAgedFullEvidenceBindings {
  const bindings = assertFullEvidence(value, engine, operationId, "aged-unlocked");
  need("mainReference" in bindings, "Aged full evidence lacks its original reference.");
  return bindings;
}

/** Fixed terminal selection from the successful original registry only. */
export function originalClosedSymbolFullEvidenceKind(value: unknown, engine: EasyedaControlEngine, operationId: string): "locked" | "aged-unlocked" {
  need(value !== null && typeof value === "object", "Original full evidence is missing.");
  const owner = fullEvidenceOwners.get(value);
  need(owner !== undefined, "Full evidence requires its original successful coordinator result.");
  assertFullEvidence(value, engine, operationId, owner.headEligibility);
  need(owner.headEligibility === "locked" ? !Object.hasOwn(owner.bindings, "mainReference") : Object.hasOwn(owner.bindings, "mainReference"),
    "Full evidence reference does not match its sealed terminal kind.");
  return owner.headEligibility;
}

/** Only the index supplies these concrete owners. Its SerializedGate encloses
 * the whole call; none of these inputs belongs in a public request schema.
 */
export class ClosedSymbolCoordinator {
  private readonly engine: EasyedaControlEngine;
  private readonly upstream: UpstreamEasyedaClient;
  private readonly runtime: WindowsControlRuntime;
  private readonly nativeUi: WindowsNativeUiController;
  private readonly fingerprint: Record<string, unknown>;
  private readonly fingerprintText: string;
  private readonly methods: readonly unknown[];
  private readonly launch: ClosedSymbolBootstrapLaunchStage;
  private readonly admission: ClosedSymbolAdmissionStage;
  private readonly startup: ClosedSymbolStartupStage;
  private readonly close: ClosedSymbolCloseStage;
  private readonly copy: ClosedSymbolCopyStage;
  private readonly relaunch: ClosedSymbolRelaunchStage;
  private readonly navigation: ClosedSymbolNavigationStage;
  private readonly witness: ClosedSymbolWitnessStage;
  private readonly sql: ClosedSymbolSqlComparisonStage;
  private readonly writer: ClosedSymbolWriteStage;
  private readonly savedReader: ClosedSymbolSavedReadStage;
  private readonly mainReferenceStage: ClosedSymbolMainReferenceStage;
  private mainReference: OriginalMainReference | undefined;
  private headEligibility: "locked" | "aged-unlocked" | undefined;
  private readonly edit: LaterOriginals = {};
  private readonly verification: LaterOriginals = {};
  private fullRun = false;
  private readonly originals: Originals = {};
  private operationId: string | undefined;
  private journal: ClosedJournal | undefined;
  private journalText: string | undefined;
  private lastSuccessfulStage = "none";
  private failure: unknown;
  private fingerprintArtifact: ArtifactDescriptor | undefined;
  private windowArtifact: ArtifactDescriptor | undefined;
  private windowObservation: unknown;
  private readonly windowObservations = new Map<string, unknown>();
  private readonly windowArtifacts = new Map<string, ArtifactDescriptor>();
  private readonly terminationByGeneration = new Map<number, ClosedSessionTerminationObservation>();
  private terminationObservation: ClosedSessionTerminationObservation | undefined;
  private terminationObservations = 0;
  private readonly nativeRuntime: MachineProfile["runtime"];

  public constructor(engine: EasyedaControlEngine, upstream: UpstreamEasyedaClient, runtime: WindowsControlRuntime,
    nativeUi: WindowsNativeUiController, machineRuntime: MachineProfile["runtime"], expectedFingerprint: Record<string, unknown>) {
    need(engine.upstream === upstream, "Coordinator engine and upstream owners differ.");
    validatePrivateFingerprint(expectedFingerprint);
    const fingerprintText = canonicalJson(expectedFingerprint);
    need(Buffer.byteLength(fingerprintText) <= 262_144 && Buffer.byteLength(`${JSON.stringify(expectedFingerprint)}\n`) <= 262_144,
      "Coordinator fingerprint exceeds its retained artifact bound.");
    this.engine = engine; this.upstream = upstream; this.runtime = runtime; this.nativeUi = nativeUi;
    this.fingerprint = structuredClone(expectedFingerprint); this.fingerprintText = fingerprintText;
    this.nativeRuntime = machineProfileSchema.shape.runtime.parse(machineRuntime);
    this.methods = this.currentMethods();
    this.launch = new ClosedSymbolBootstrapLaunchStage(engine, runtime);
    this.admission = new ClosedSymbolAdmissionStage(engine, runtime);
    this.startup = new ClosedSymbolStartupStage(engine, runtime, this.admission);
    this.close = new ClosedSymbolCloseStage(engine, runtime);
    this.copy = new ClosedSymbolCopyStage(engine, this.nativeRuntime);
    this.relaunch = new ClosedSymbolRelaunchStage(engine, runtime);
    this.navigation = new ClosedSymbolNavigationStage(engine, this.fingerprint);
    this.witness = new ClosedSymbolWitnessStage(engine, runtime, this.admission, this.startup, this.relaunch, this.fingerprint);
    this.sql = new ClosedSymbolSqlComparisonStage(engine, this.nativeRuntime);
    this.writer = new ClosedSymbolWriteStage(engine, runtime, this.admission, this.relaunch, this.sql, this.fingerprint);
    this.savedReader = new ClosedSymbolSavedReadStage(engine, runtime, this.admission, this.relaunch, this.startup, this.navigation, this.fingerprint);
    this.mainReferenceStage = new ClosedSymbolMainReferenceStage(engine);
  }

  private currentMethods(): readonly unknown[] {
    /* oxlint-disable typescript/unbound-method -- Retain identities only; calls always keep their concrete receiver. */
    return [this.upstream.connect, this.upstream.withAuthenticatedBridgeDispatchScope, this.upstream.currentAuthenticatedBridgeDispatchBinding,
      this.upstream.bridgeSessionLifecycle, this.runtime.status, this.nativeUi.run];
    /* oxlint-enable typescript/unbound-method */
  }
  private owner(): void {
    need(this.engine.upstream === this.upstream && this.methods.every((value, index) => typeof value === "function" && value === this.currentMethods()[index]),
      "Coordinator retained owner methods changed.");
    need(canonicalJson(this.fingerprint) === this.fingerprintText, "Coordinator fingerprint changed.");
  }
  private outside(): void {
    this.owner(); need(this.upstream.currentAuthenticatedBridgeDispatchBinding() === undefined, "Coordinator requires no enclosing authenticated scope.");
  }

  private issueFullEvidence(value: FinalEvidenceRecord): FinalEvidenceRecord {
    function required<T extends object, K extends keyof T>(slot: T, keys: readonly K[]): asserts slot is T & { [P in K]-?: NonNullable<T[P]> } {
      need(keys.every((key) => slot[key] !== undefined && slot[key] !== null), "Full evidence original stage set is incomplete.");
    }
    required(this.originals, ["launch", "admission", "startup", "close", "proof", "copy"]);
    required(this.edit, ["launch", "admission", "startup", "navigation", "witness", "preparation", "write", "close", "proof", "copy", "comparison"]);
    required(this.verification, ["launch", "admission", "startup", "navigation", "savedSource", "savedRead", "close", "proof", "copy", "comparison"]);
    const journal = this.journal;
    const fingerprintArtifact = this.fingerprintArtifact;
    const baselineWindow = this.windowArtifacts.get("baseline"), editWindow = this.windowArtifacts.get("edit"), verifyWindow = this.windowArtifacts.get("verify");
    need(journal !== undefined && fingerprintArtifact !== undefined && baselineWindow !== undefined && editWindow !== undefined && verifyWindow !== undefined,
      "Full evidence auxiliary records are incomplete.");
    need(value.operationId === journal.operationId && value.journalSha256 === sha256Json(journal), "Full evidence final journal binding differs.");
    const headEligibility = this.headEligibility, mainReference = this.mainReference;
    need(headEligibility !== undefined && (headEligibility === "locked" ? mainReference === undefined : mainReference !== undefined),
      "Full evidence reference does not match its selected entry.");
    if (mainReference !== undefined) { assertOriginalMainReference(mainReference, this.engine, value.operationId); }
    const bindings: OriginalFullEvidenceBindings | OriginalAgedFullEvidenceBindings = Object.freeze({ journal, baseline: Object.freeze({ ...this.originals }),
      edit: Object.freeze({ ...this.edit }), verification: Object.freeze({ ...this.verification }), fingerprintArtifact,
      windowArtifacts: Object.freeze([baselineWindow, editWindow, verifyWindow] as const),
      ...(mainReference === undefined ? {} : { mainReference }) });
    assertFullStageOriginals(bindings, this.engine, value.operationId);
    const text = fullEvidenceText(value, bindings);
    const current = (): void => {
      this.outside();
      need(this.journal === journal && this.operationId === value.operationId && this.lastSuccessfulStage === "verify-sql-compare" &&
        this.headEligibility === headEligibility && this.mainReference === mainReference,
        "Full evidence retained coordinator owner changed.");
      for (const [slot, retained] of [[this.originals, bindings.baseline], [this.edit, bindings.edit], [this.verification, bindings.verification]] as const) {
        need(slot.copy === retained.copy && slot.proof === retained.proof && slot.admission === retained.admission && slot.launch === retained.launch &&
          slot.startup === retained.startup && slot.close === retained.close, "Full evidence original generation objects changed.");
      }
    };
    current();
    fullEvidenceOwners.set(value, { engine: this.engine, operationId: value.operationId, value, bindings, text, current, headEligibility });
    return value;
  }

  /** Original internal objects, including successful stages before a later error.
   * No clones, deserialization or pending stage is promoted to authority here.
   */
  public retained(): Readonly<Record<string, unknown>> {
    return Object.freeze({ operationId: this.operationId, lastSuccessfulStage: this.lastSuccessfulStage,
      originals: Object.freeze({ ...this.originals }), fingerprintArtifact: this.fingerprintArtifact, windowArtifact: this.windowArtifact,
      edit: Object.freeze({ ...this.edit }), verification: Object.freeze({ ...this.verification }),
      windowObservation: this.windowObservation, terminationObservation: this.terminationObservation, terminationObservations: this.terminationObservations,
      windowObservations: Object.freeze(Object.fromEntries(this.windowObservations)), windowArtifacts: Object.freeze(Object.fromEntries(this.windowArtifacts)),
      terminationByGeneration: Object.freeze(Object.fromEntries(this.terminationByGeneration)),
      launchReceipt: this.operationId === undefined ? undefined : this.launch.originalLaunch(this.operationId),
      startupRaw: this.operationId === undefined ? undefined : this.startup.originalReturn(this.operationId, "baseline-marker-create"),
      admissionCapture: this.operationId === undefined ? undefined : this.admission.originalCapture(this.operationId, "baseline-admission"),
      closeResult: this.operationId === undefined ? undefined : this.close.originalResult(this.operationId, "baseline-close"),
      copyReceipt: this.operationId === undefined ? undefined : this.copy.originalCopy(this.operationId, "baseline-copy"),
      laterRaw: this.operationId === undefined ? undefined : Object.freeze({
        editLaunch: this.relaunch.originalLaunch(this.operationId, "edit-launch"), verifyLaunch: this.relaunch.originalLaunch(this.operationId, "verify-launch"),
        editCapture: this.admission.originalCapture(this.operationId, "edit-admission"), verifyCapture: this.admission.originalCapture(this.operationId, "verify-admission"),
        editStartup: this.startup.originalReturn(this.operationId, "edit-marker-read"), verifyStartup: this.startup.originalReturn(this.operationId, "verify-marker-read"),
        editOpen: this.navigation.originalReturn(this.operationId, "edit-open"), verifyOpen: this.navigation.originalReturn(this.operationId, "verify-open"),
        witness: this.witness.originalReturn(this.operationId), write: this.writer.originalReturn(this.operationId), savedRead: this.savedReader.originalReturn(this.operationId),
        editClose: this.close.originalResult(this.operationId, "edit-close"), verifyClose: this.close.originalResult(this.operationId, "verify-close"),
        editCopy: this.copy.originalCopy(this.operationId, "edit-copy"), verifyCopy: this.copy.originalCopy(this.operationId, "verify-copy"),
        preparation: this.sql.originalPreparation(this.operationId), editSql: this.sql.originalComparison(this.operationId, "edit-sql-compare"),
        verifySql: this.sql.originalComparison(this.operationId, "verify-sql-compare"),
      }),
      mainReference: this.mainReference, headEligibility: this.headEligibility,
      mainReferenceRaw: this.operationId === undefined ? undefined : this.mainReferenceStage.originalReturn(this.operationId),
      failure: this.failure, executionAuthorized: false, completionProved: false, replayAllowed: false });
  }

  public inspectRestart(): Promise<Readonly<Record<string, unknown>>> {
    need(this.operationId !== undefined, "Coordinator has no retained operation.");
    return inspectClosedSymbolRestart(this.operationId);
  }

  private async ownedWindow(journal: ClosedJournal, admission: Admission, phase: "baseline" | "edit" | "verify" = "baseline"): Promise<string> {
    this.outside();
    const generation = admission.generation, status = this.runtime.status(), statusText = canonicalJson(status);
    need(status.state === "owned" && status.launch?.jobId === generation.jobId && status.launch.helperInstance === generation.helperInstance &&
      status.launch.root.pid === generation.rootPid && status.launch.root.startIdentity === generation.rootStartIdentity, "Coordinator close owner differs.");
    const observed = await this.nativeUi.run({ action: "windows" }); this.windowObservation = observed; this.windowObservations.set(phase, observed); this.outside();
    need(canonicalJson(this.runtime.status()) === statusText, "Coordinator runtime changed during window discovery.");
    const binding = observed["binding"], result = observed["result"];
    need(observed["schema"] === "easyeda-pro-control.windows-native-ui.v1" && observed["action"] === "windows" && observed["authority"] === "retained-job" &&
      isRecord(binding) && binding["rootPid"] === generation.rootPid && binding["executableSha256"] === status.executableSha256 &&
      generation.rootStartIdentity === `win32:${String(binding["rootStartTicks"])}:job:${generation.jobId}` && isRecord(result), "Coordinator owned-window envelope differs.");
    const observedText = canonicalJson(observed);
    const artifactValue = {
      profile: "private.closed-symbol-owned-window.v1", generation, observed,
    };
    need(Buffer.byteLength(`${JSON.stringify(artifactValue)}\n`) <= 262_144, "Coordinator owned-window artifact exceeds its retained bound.");
    this.windowArtifact = await writePhaseArtifact(journal.operationId, 0, `${phase}-owned-window`, artifactValue);
    this.windowArtifacts.set(phase, this.windowArtifact);
    this.outside(); need(canonicalJson(observed) === observedText && canonicalJson(this.runtime.status()) === statusText, "Coordinator window observation changed during retention.");
    // Retain bounded diagnostics even if semantic selection refuses. The
    // Historical consumer applies the same selector before accepting close evidence.
    return selectClosedSymbolApplicationWindow(result, generation.rootPid);
  }

  private async waitForAuthentication(gatewayInstanceId: string, current: () => void, priorSession?: Readonly<{ sessionId: string; sequence: number }>): Promise<string> {
    const deadline = performance.now() + 60_000, statusText = canonicalJson(this.runtime.status());
    let candidate: string | undefined;
    for (let observation = 0; observation < 601; observation += 1) {
      current(); this.outside();
      need(canonicalJson(this.runtime.status()) === statusText, "Coordinator runtime changed while awaiting authentication.");
      const lifecycle = this.upstream.bridgeSessionLifecycle();
      need(isRecord(lifecycle) && lifecycle.schema === "easyeda-pro-control.authenticated-bridge-lifecycle.v1" &&
        lifecycle.gatewayInstanceId === gatewayInstanceId, "Coordinator authentication gateway changed.");
      const session = lifecycle.activeSession;
      if (session === null) { need(candidate === undefined, "Coordinator authentication disappeared after observation."); } else {
        need(isRecord(session) && typeof session.sessionId === "string" && /^[A-Za-z0-9_-]{43}$/u.test(session.sessionId) &&
          typeof session.sequence === "number" && Number.isSafeInteger(session.sequence) && session.sequence > 0 &&
          typeof session.authenticatedAtEpochMs === "number" && Number.isSafeInteger(session.authenticatedAtEpochMs) && session.authenticatedAtEpochMs > 0 &&
          typeof session.authenticationReceiptSha256 === "string" && /^[a-f0-9]{64}$/u.test(session.authenticationReceiptSha256), "Coordinator authentication session is malformed.");
        const observed = canonicalJson(session);
        need(priorSession === undefined || session.sessionId !== priorSession.sessionId && session.sequence > priorSession.sequence,
          "Coordinator subsequent authentication reused a previous session.");
        need(candidate === undefined || candidate === observed, "Coordinator authentication session changed.");
        if (candidate === observed) { return observed; }
        candidate = observed;
      }
      need(performance.now() < deadline && observation < 600, "Coordinator authentication deadline expired; launch must not be repeated.");
      await delay(100);
      current(); this.outside();
      need(canonicalJson(this.runtime.status()) === statusText && performance.now() <= deadline,
        "Coordinator authentication deadline or retained runtime changed.");
    }
    throw new Error("Coordinator authentication observation bound exhausted.");
  }

  /** Fresh one-shot prefix only. Failures never trigger automatic native cleanup. */
  private async waitForTermination(result: ClosedSymbolCloseResult, current: () => void): Promise<ClosedSessionTerminationProof> {
    const deadline = performance.now() + 60_000, statusText = canonicalJson(this.runtime.status());
    for (let observation = 0; observation < 241; observation += 1) {
      current(); this.outside();
      need(canonicalJson(this.runtime.status()) === statusText && performance.now() <= deadline,
        "Coordinator termination deadline or retained runtime changed.");
      const observed = await this.close.probe(result);
      this.terminationObservation = observed; this.terminationObservations += 1;
      this.terminationByGeneration.set(result.generation.ordinal, observed);
      if (observed.status === "terminated") {
        const retained = [this.originals, this.edit, this.verification][result.generation.ordinal];
        need(retained !== undefined, "Coordinator termination ordinal refused.");
        retained.proof = observed.proof;
      }
      current(); this.outside(); assertCurrentClosedSessionTerminationObservation(observed);
      need(performance.now() <= deadline, "Coordinator termination deadline expired; close must not be repeated.");
      if (observed.status === "terminated") { return observed.proof; }
      need(observation < 240, "Coordinator termination observation bound exhausted; close must not be repeated.");
      await delay(250);
      current(); this.outside(); assertCurrentClosedSessionTerminationObservation(observed);
      need(canonicalJson(this.runtime.status()) === statusText && performance.now() <= deadline,
        "Coordinator termination deadline or retained runtime changed.");
    }
    throw new Error("Coordinator termination observation bound exhausted.");
  }

  /** Fresh one-shot prefix only. Failures never trigger automatic native cleanup. */
  public async recordBaseline(planInput: unknown): Promise<BaselineRecord> {
    need(!active.has(this.engine) && !attempted.has(this.runtime) && this.operationId === undefined, "Coordinator baseline attempt already active or consumed.");
    active.add(this.engine); attempted.add(this.runtime);
    try {
      this.outside(); need(this.runtime.status().state === "not-launched", "Coordinator requires a fresh index-owned runtime.");
      const callerText = canonicalJson(planInput), operationId = newOperationId(); this.operationId = operationId;
      const journal = await createClosedSymbolJournal(operationId, planInput); this.journal = journal;
      const working = (): unknown => ({ operationId: journal.operationId, plan: journal.plan, planHash: journal.planHash,
        closedPlanSha256: journal.closedPlanSha256, markerSha256: journal.markerSha256 });
      const workingPlanText = canonicalJson(working());
      const current = (): void => {
        this.owner(); need(canonicalJson(planInput) === callerText, "Coordinator caller plan changed.");
        need(this.journal === journal && journal.operationId === operationId && canonicalJson(working()) === workingPlanText, "Coordinator working plan changed.");
      };
      current();
      need(journal.plan.expectedFingerprintSha256 === sha256Json(this.fingerprint), "Coordinator plan fingerprint differs.");
      const implementation = await this.engine.controlFingerprintPromise; current();
      need(journal.plan.facadeSha256 === implementation.sha256, "Coordinator plan facade differs.");
      need(Buffer.byteLength(`${JSON.stringify(this.fingerprint)}\n`) <= 262_144, "Coordinator fingerprint artifact exceeds its retained bound.");
      this.fingerprintArtifact = await writePhaseArtifact(operationId, 0, "expected-fingerprint", this.fingerprint); current();
      this.lastSuccessfulStage = "planned";
      await this.engine.assertBridgeDispatchAllowed(); current(); this.outside();
      await this.engine.assertRecoveryOperationIsolated(operationId); current(); this.outside();
      await this.upstream.connect(); current(); this.outside();
      // Refuse existing authenticated state rather than adopting its provenance.
      const before = this.upstream.bridgeSessionLifecycle();
      need(isRecord(before) && before.schema === "easyeda-pro-control.authenticated-bridge-lifecycle.v1" &&
        typeof before.gatewayInstanceId === "string" && /^[A-Za-z0-9_-]{43}$/u.test(before.gatewayInstanceId) &&
        before.activeSession === null, "Coordinator baseline requires no previous authenticated session.");
      this.originals.launch = await this.launch.launch(journal); this.lastSuccessfulStage = "baseline-launch"; current(); this.outside();
      const authenticated = await this.waitForAuthentication(before.gatewayInstanceId, current); current(); this.outside();
      await this.upstream.withAuthenticatedBridgeDispatchScope(async () => {
        current();
        const scopedSession = this.upstream.bridgeSessionLifecycle();
        need(scopedSession?.gatewayInstanceId === before.gatewayInstanceId && canonicalJson(scopedSession.activeSession) === authenticated,
          "Coordinator authenticated session changed before scope admission.");
        this.originals.admission = await this.admission.admit(journal, "baseline-admission"); this.lastSuccessfulStage = "baseline-admission"; current();
        this.originals.startup = await this.startup.observe(journal, "baseline-marker-create"); this.lastSuccessfulStage = "baseline-marker-create"; current();
      });
      current(); this.outside();
      const admission = this.originals.admission;
      need(admission !== undefined && this.originals.startup !== undefined, "Coordinator baseline scope has no successful startup.");
      const windowHandle = await this.ownedWindow(journal, admission); current();
      this.originals.close = await this.close.close({ journal, phase: "baseline-close", generation: admission.generation, capture: admission.capture, windowHandle });
      this.lastSuccessfulStage = "baseline-close"; this.journalText = canonicalJson(journal); current(); this.outside();
      this.originals.proof = await this.waitForTermination(this.originals.close, current); this.lastSuccessfulStage = "baseline-termination"; current(); this.outside();
      // Revalidate the original proof through the maintained owner registry;
      // Serialized receipts and caller-selected verifiers cannot qualify it.
      const copyProof = await assertClosedSessionCopyAuthority(this.originals.proof); current(); this.outside();
      this.originals.copy = await this.copy.copy(journal, "baseline-copy", admission.generation, copyProof);
      this.lastSuccessfulStage = "baseline-copy"; this.journalText = canonicalJson(journal); current(); this.outside();
      await assertClosedSessionCopyAuthority(this.originals.proof); current(); this.outside();
      const final = await loadClosedSymbolJournal(operationId); current(); this.outside();
      need(final.journal.sequence === 10 && canonicalJson(final.journal) === this.journalText, "Coordinator final baseline journal differs.");
      assertCurrentClosedSessionCopyAuthority(this.originals.proof);
      return Object.freeze({ operationId, sequence: 10, copy: this.originals.copy, executionAuthorized: false, completionProved: false, saved: false, reopened: false });
    } catch (error) { this.failure = error; throw error; }
    finally { if (!this.fullRun) { active.delete(this.engine); } }
  }

  /** A read-only same-process exit query after an acknowledged close. It cannot
   * retry close, copy, open or advance to an edit generation after a failed run.
   */
  public async inspectRetainedBaselineExit(): Promise<ClosedSessionTerminationProof> {
    need(!active.has(this.engine) && this.originals.close !== undefined && this.journal !== undefined && this.journalText !== undefined,
      "Coordinator has no idle original acknowledged close.");
    active.add(this.engine);
    try {
      this.outside();
      const retained = await loadClosedSymbolJournal(this.journal.operationId); this.outside();
      need(canonicalJson(retained.journal) === this.journalText && retained.events.at(-1)?.step === "baseline-close", "Coordinator close inspection journal advanced.");
      const proof = await this.close.prove(this.originals.close); this.outside();
      this.originals.proof = proof; return proof;
    } finally { active.delete(this.engine); }
  }

  private async waitForDisconnectedSession(admitted: Admission, proof: ClosedSessionTerminationProof, current: () => void): Promise<string> {
    const expected = admitted.capture.bridgeSession, { gatewayInstanceId, ...activeSession } = expected;
    const deadline = performance.now() + 60_000, statusText = canonicalJson(this.runtime.status());
    for (let observation = 0; observation < 601; observation += 1) {
      current(); this.outside(); assertCurrentClosedSessionCopyAuthority(proof);
      need(canonicalJson(this.runtime.status()) === statusText && performance.now() <= deadline, "Coordinator disconnected-session owner or deadline changed.");
      const lifecycle = this.upstream.bridgeSessionLifecycle();
      need(isRecord(lifecycle) && lifecycle.schema === "easyeda-pro-control.authenticated-bridge-lifecycle.v1" &&
        lifecycle.gatewayInstanceId === gatewayInstanceId, "Coordinator disconnected-session gateway changed.");
      if (lifecycle.activeSession === null) { return gatewayInstanceId; }
      need(canonicalJson(lifecycle.activeSession) === canonicalJson(activeSession), "Coordinator observed an unrelated session before subsequent launch.");
      need(observation < 600, "Coordinator previous session did not disconnect; launch refused.");
      await delay(100);
    }
    throw new Error("Coordinator disconnection observation bound exhausted.");
  }

  private async launchSubsequent(journal: ClosedJournal, phase: "edit" | "verify", current: () => void): Promise<Readonly<{ gateway: string; session: string }>> {
    const previous = phase === "edit" ? this.originals : this.edit, slot = phase === "edit" ? this.edit : this.verification;
    need(previous.admission !== undefined && previous.proof !== undefined && previous.copy !== undefined,
      "Coordinator subsequent launch lacks original preceding evidence.");
    const { admission, proof, copy } = previous;
    const gateway = await this.waitForDisconnectedSession(admission, proof, current); current(); this.outside();
    assertCurrentClosedSessionCopyAuthority(proof);
    slot.launch = await this.relaunch.launch({ journal, phase: `${phase}-launch`, proof, copy: copy.copy, checkpoint: copy.checkpoint });
    this.lastSuccessfulStage = `${phase}-launch`; current(); this.outside();
    const session = await this.waitForAuthentication(gateway, current, admission.capture.bridgeSession); current(); this.outside();
    return Object.freeze({ gateway, session });
  }

  private async closeAndCopy(journal: ClosedJournal, phase: "edit" | "verify", current: () => void): Promise<void> {
    const slot = phase === "edit" ? this.edit : this.verification;
    const admitted = slot.admission;
    need(admitted !== undefined && slot.navigation !== undefined, "Coordinator close lacks original admitted navigation.");
    assertOriginalClosedSymbolNavigation(slot.navigation, this.engine, journal.operationId, `${phase}-open`);
    current(); this.outside();
    const windowHandle = await this.ownedWindow(journal, admitted, phase); current(); this.outside();
    slot.close = await this.close.close({ journal, phase: `${phase}-close`, generation: admitted.generation, capture: admitted.capture, windowHandle });
    this.lastSuccessfulStage = `${phase}-close`; this.journalText = canonicalJson(journal); current(); this.outside();
    slot.proof = await this.waitForTermination(slot.close, current);
    this.lastSuccessfulStage = `${phase}-termination`; current(); this.outside();
    slot.copy = await this.copy.copy(journal, `${phase}-copy`, admitted.generation, slot.proof);
    this.lastSuccessfulStage = `${phase}-copy`; this.journalText = canonicalJson(journal); current(); this.outside();
  }

  /** Fixed locked entry. No phase can be supplied, skipped or replayed. */
  public recordFullEvidence(planInput: unknown): Promise<FinalEvidenceRecord> {
    return this.recordEvidence(planInput, "locked");
  }

  /** Fixed aged entry. The original reference must succeed before edit launch. */
  public recordAgedFullEvidence(planInput: unknown): Promise<FinalEvidenceRecord> {
    return this.recordEvidence(planInput, "aged-unlocked");
  }

  /** One consumed attempt; its original baseline alone selects the fixed path. */
  public recordAutomaticFullEvidence(planInput: unknown): Promise<FinalEvidenceRecord> {
    return this.recordEvidence(planInput);
  }

  private async recordEvidence(planInput: unknown, headEligibility?: "locked" | "aged-unlocked"): Promise<FinalEvidenceRecord> {
    need(!this.fullRun && !active.has(this.engine) && !attempted.has(this.runtime) && this.operationId === undefined,
      "Coordinator full attempt already active or consumed."); this.fullRun = true; this.headEligibility = headEligibility;
    const callerText = canonicalJson(planInput);
    let selectedHead = headEligibility;
    try {
      await this.recordBaseline(planInput);
      const baseline = this.originals.copy, journal = this.journal, operationId = this.operationId;
      need(journal !== undefined && operationId !== undefined && baseline !== undefined && this.originals.proof !== undefined,
        "Coordinator original baseline is incomplete.");
      const planText = canonicalJson({ operationId, plan: journal.plan, planHash: journal.planHash,
        closedPlanSha256: journal.closedPlanSha256, markerSha256: journal.markerSha256 });
      let mainReference: OriginalMainReference | undefined;
      const current = (): void => {
        this.owner(); need(active.has(this.engine) && this.journal === journal && this.operationId === operationId && canonicalJson(planInput) === callerText &&
          this.headEligibility === selectedHead && this.mainReference === mainReference,
          "Coordinator full caller or exclusive owner changed.");
        need(canonicalJson({ operationId: journal.operationId, plan: journal.plan, planHash: journal.planHash,
          closedPlanSha256: journal.closedPlanSha256, markerSha256: journal.markerSha256 }) === planText, "Coordinator full working plan changed.");
        if (mainReference !== undefined) { assertOriginalMainReference(mainReference, this.engine, operationId); }
      };
      current(); this.outside();
      const loaded = await loadClosedSymbolJournal(operationId); current(); this.outside();
      need(canonicalJson(loaded.journal) === canonicalJson(journal), "Coordinator baseline changed before qualification.");
      if (selectedHead === undefined) {
        assertCurrentClosedSessionCopyAuthority(this.originals.proof);
        const selected = await selectOriginalBaselineHead(journal, loaded.events, baseline.copy, baseline.inventory);
        current(); this.outside(); assertCurrentClosedSessionCopyAuthority(this.originals.proof);
        need(this.headEligibility === undefined && this.mainReference === undefined, "Coordinator automatic selection was already assigned.");
        selectedHead = selected.headEligibility; this.headEligibility = selectedHead;
        current();
      }
      if (selectedHead === "locked") {
        await lockedWitnessBaseline(journal, loaded.events, baseline.copy, baseline.inventory);
      } else {
        const reference = await this.mainReferenceStage.runOnce({ journal, baselineCopy: baseline.copy, baselineInventory: baseline.inventory,
          baselineProof: this.originals.proof });
        // Retain the actual successful stage object even if the next owner or
        // Caller reproof fails. Retention alone does not issue full evidence.
        this.mainReference = reference; mainReference = reference;
        current(); this.outside();
        assertOriginalMainReference(reference, this.engine, operationId);
        this.lastSuccessfulStage = "baseline-main-reference";
      }
      current(); this.outside();
      assertCurrentClosedSessionCopyAuthority(this.originals.proof);

      const editAuthentication = await this.launchSubsequent(journal, "edit", current); current(); this.outside();
      await this.upstream.withAuthenticatedBridgeDispatchScope(async () => {
        current();
        const session = this.upstream.bridgeSessionLifecycle();
        need(session?.gatewayInstanceId === editAuthentication.gateway && canonicalJson(session.activeSession) === editAuthentication.session,
          "Coordinator edit session changed before admission.");
        this.edit.admission = await this.admission.admit(journal, "edit-admission"); this.lastSuccessfulStage = "edit-admission"; current();
        this.edit.startup = await this.startup.observe(journal, "edit-marker-read"); this.lastSuccessfulStage = "edit-marker-read"; current();
        this.edit.navigation = await this.navigation.openCompanion(journal, "edit-open", this.edit.admission.generation, baseline.checkpoint);
        this.lastSuccessfulStage = "edit-open"; current();
        assertOriginalClosedSymbolNavigation(this.edit.navigation, this.engine, operationId, "edit-open");
        this.edit.witness = await this.witness.collect({ journal, baselineCopy: baseline.copy, baselineInventory: baseline.inventory,
          ...(mainReference === undefined ? {} : { mainReference }) });
        this.lastSuccessfulStage = "edit-witness"; current();
        this.edit.preparation = await this.sql.prepareForWrite({ journal, generation: this.edit.admission.generation, witnessResult: this.edit.witness,
          baselineCopy: baseline.copy, baselineInventory: baseline.inventory });
        this.lastSuccessfulStage = "edit-preparation"; current();
        this.edit.write = await this.writer.write({ journal, witnessResult: this.edit.witness, preparation: this.edit.preparation });
        this.lastSuccessfulStage = "edit-write"; current();
      });
      current(); this.outside();
      need(this.edit.write !== undefined && this.edit.preparation !== undefined, "Coordinator edit scope did not complete.");
      await this.closeAndCopy(journal, "edit", current); current(); this.outside();
      need(this.edit.copy !== undefined && this.edit.proof !== undefined, "Coordinator edit copy/proof missing.");
      this.edit.comparison = await this.sql.compareEdit({ journal, copy: this.edit.copy.copy, inventory: this.edit.copy.inventory, proof: this.edit.proof,
        preparation: this.edit.preparation, originalWriteResult: this.edit.write });
      this.lastSuccessfulStage = "edit-sql-compare"; this.journalText = canonicalJson(journal); current(); this.outside();
      assertOriginalClosedSymbolComparison(this.edit.comparison, this.engine, operationId, "edit-sql-compare");
      this.verification.savedSource = await prepareOriginalSavedSymbolSource(this.edit.comparison, this.engine, operationId);
      this.lastSuccessfulStage = "verify-source"; current(); this.outside();
      const verifyAuthentication = await this.launchSubsequent(journal, "verify", current); current(); this.outside();
      await this.upstream.withAuthenticatedBridgeDispatchScope(async () => {
        current();
        const session = this.upstream.bridgeSessionLifecycle();
        need(session?.gatewayInstanceId === verifyAuthentication.gateway && canonicalJson(session.activeSession) === verifyAuthentication.session,
          "Coordinator verification session changed before admission.");
        this.verification.admission = await this.admission.admit(journal, "verify-admission"); this.lastSuccessfulStage = "verify-admission"; current();
        this.verification.startup = await this.startup.observe(journal, "verify-marker-read"); this.lastSuccessfulStage = "verify-marker-read"; current();
        need(this.edit.copy !== undefined && this.verification.savedSource !== undefined, "Coordinator verification original source missing.");
        this.verification.navigation = await this.navigation.openCompanion(journal, "verify-open", this.verification.admission.generation, this.edit.copy.checkpoint);
        this.lastSuccessfulStage = "verify-open"; current();
        assertOriginalClosedSymbolNavigation(this.verification.navigation, this.engine, operationId, "verify-open");
        this.verification.savedRead = await this.savedReader.read({ journal, source: this.verification.savedSource, navigationResult: this.verification.navigation });
        this.lastSuccessfulStage = "verify-saved-content"; current();
      });
      current(); this.outside();
      need(this.verification.savedRead !== undefined, "Coordinator verification scope lacks its original saved read.");
      assertOriginalClosedSymbolSavedRead(this.verification.savedRead, this.engine, operationId);
      await this.closeAndCopy(journal, "verify", current); current(); this.outside();
      need(this.verification.copy !== undefined && this.verification.proof !== undefined, "Coordinator verification copy/proof missing.");
      this.verification.comparison = await this.sql.compareVerification({ journal, copy: this.verification.copy.copy, inventory: this.verification.copy.inventory,
        proof: this.verification.proof, originalEditComparison: this.edit.comparison });
      this.lastSuccessfulStage = "verify-sql-compare"; this.journalText = canonicalJson(journal); current(); this.outside();
      await assertClosedSessionCopyAuthority(this.verification.proof); current(); this.outside();
      const final = await loadClosedSymbolJournal(operationId); current(); this.outside();
      assertCurrentClosedSessionCopyAuthority(this.verification.proof);
      assertOriginalClosedSymbolSavedRead(this.verification.savedRead, this.engine, operationId);
      assertOriginalClosedSymbolComparison(this.verification.comparison, this.engine, operationId, "verify-sql-compare");
      need(journal.sequence === 44 && canonicalJson(final.journal) === this.journalText, "Coordinator final full evidence journal differs.");
      return this.issueFullEvidence(Object.freeze({ operationId, sequence: 44, journalSha256: sha256Json(final.journal), savedRead: this.verification.savedRead,
        verificationComparison: this.verification.comparison, proof: this.verification.proof, copy: this.verification.copy,
        executionAuthorized: false, completionProved: false, saved: false, reopened: false }));
    } catch (error) { this.failure = error; throw error; }
    finally { active.delete(this.engine); }
  }
}
