/** Private fixed metadata dispatch. No route, Save, replay or completion grant. */
/* oxlint-disable import/max-dependencies -- Bind the original witness, prepared SQL plan, managed recorder and fixed native compiler directly instead of hiding those ownership checks behind pass-through imports. */
import { readExactUtf8Artifact } from "./artifacts.ts";
import { appendClosedSymbolEvent, loadClosedSymbolJournal } from "./closed-symbol-journal.ts";
import type { ClosedJournal, Generation } from "./closed-symbol-journal.ts";
import type { ClosedSymbolAdmissionStage } from "./closed-symbol-admission.ts";
import type { ClosedSymbolRelaunchStage } from "./closed-symbol-relaunch.ts";
import { assertSubset, canonicalJson, extractToolPayload, isRecord, sha256Json, sha256Text, validatePrivateFingerprint } from "./core.ts";
import type { EasyedaControlEngine, ExpectedContext } from "./engine.ts";
import { decodeExactReadEnvelope } from "./exact-readers.ts";
import type { WindowsControlRuntime } from "./windows-runtime.ts";
import { assertOriginalClosedSymbolWitness } from "./closed-symbol-witness.ts";
import { WITNESS_NATIVE_PINS_SHA256, verifyWitnessNativeProfile } from "./closed-symbol-native-profile.ts";
import { buildWorkerBoundProjectSymbolMetadataExpression } from "./project-symbol-metadata.ts";
// oxlint-disable-next-line import/no-cycle -- Fixed original-owner lookup closes prepare/write/compare ordering; neither module invokes the other during initialization.
import { assertOriginalClosedSymbolPreparation } from "./closed-symbol-sql-comparison.ts";
import type { ClosedSymbolSqlComparisonStage, PreparedClosedSymbolSql } from "./closed-symbol-sql-comparison.ts";

export interface OriginalClosedSymbolWrite {
  readonly profile: "private.closed-symbol-write-result.v1";
  readonly operationId: string; readonly generation: Generation;
  readonly requestSha256: string; readonly artifactSha256: string;
  readonly witnessArtifactSha256: string; readonly witnessClockArtifactSha256: string;
  readonly preparedSqlPlanSha256: string; readonly metadataPlanSha256: string;
  readonly result: Readonly<{ kind: "project-symbol-metadata"; targetId: string; createdId: null }>;
  readonly executionAuthorized: false; readonly completionProved: false; readonly saved: false; readonly reopened: false;
}
interface Issuance { readonly engine: EasyedaControlEngine; readonly operationId: string; readonly text: string; readonly result: OriginalClosedSymbolWrite }
const attempts = new WeakMap<EasyedaControlEngine, Set<string>>(), issued = new WeakMap<object, Issuance>();
function need(value: boolean, message: string): asserts value { if (!value) { throw new Error(message); } }
export function assertOriginalClosedSymbolWrite(value: unknown, engine: EasyedaControlEngine, operationId: string): OriginalClosedSymbolWrite {
  need(value !== null && typeof value === "object", "Original closed symbol write result missing.");
  const owner = issued.get(value);
  need(owner !== undefined && owner.engine === engine && owner.operationId === operationId && canonicalJson(value) === owner.text,
    "Closed symbol write result is not the unchanged original successful stage result.");
  return owner.result;
}

export class ClosedSymbolWriteStage {
  private readonly engine: EasyedaControlEngine;
  private readonly runtime: WindowsControlRuntime;
  private readonly admission: ClosedSymbolAdmissionStage;
  private readonly relaunch: ClosedSymbolRelaunchStage;
  private readonly sql: ClosedSymbolSqlComparisonStage;
  private readonly fingerprint: Record<string, unknown>;
  private readonly returns = new Map<string, unknown>();
  public constructor(engine: EasyedaControlEngine, runtime: WindowsControlRuntime, admission: ClosedSymbolAdmissionStage,
    relaunch: ClosedSymbolRelaunchStage, sql: ClosedSymbolSqlComparisonStage, fingerprint: Record<string, unknown>) {
    validatePrivateFingerprint(fingerprint);
    this.engine = engine; this.runtime = runtime; this.admission = admission; this.relaunch = relaunch;
    this.sql = sql; this.fingerprint = structuredClone(fingerprint);
  }
  public originalReturn(operationId: string): unknown { return this.returns.get(operationId); }

  public async write(input: Readonly<{ journal: ClosedJournal; witnessResult: unknown; preparation: PreparedClosedSymbolSql }>): Promise<OriginalClosedSymbolWrite> {
    const callerText = canonicalJson(input.journal), operationId = input.journal.operationId;
    let used = attempts.get(this.engine); if (used === undefined) { used = new Set(); attempts.set(this.engine, used); }
    need(!used.has(operationId), "Closed symbol write attempt already consumed."); used.add(operationId);
    const preparationInput = input.preparation, witnessInput = input.witnessResult;
    const witness = assertOriginalClosedSymbolWitness(witnessInput, this.engine, operationId);
    const preparation = assertOriginalClosedSymbolPreparation(preparationInput, this.engine, operationId);
    need(this.sql.assertOriginalPreparation(preparationInput, operationId) === preparation, "Closed symbol write SQL stage differs from the original preparation.");
    const preparationText = canonicalJson(preparation), witnessText = canonicalJson(witness);
    const { journal, events } = await loadClosedSymbolJournal(operationId);
    const unchanged = (): void => {
      need(canonicalJson(input.journal) === callerText && input.witnessResult === witnessInput && input.preparation === preparationInput,
        "Closed symbol write caller changed.");
      need(assertOriginalClosedSymbolWitness(witnessInput, this.engine, operationId) === witness && canonicalJson(witness) === witnessText &&
        assertOriginalClosedSymbolPreparation(preparationInput, this.engine, operationId) === preparation &&
        this.sql.assertOriginalPreparation(preparationInput, operationId) === preparation && canonicalJson(preparation) === preparationText,
        "Closed symbol write original witness or preparation changed.");
    };
    unchanged(); need(canonicalJson(journal) === callerText && !journal.hardStop && !journal.orphanedCallPossible, "Closed symbol write journal differs or is quarantined.");
    const generation = Object.freeze(structuredClone(witness.generation)), last = events.at(-1);
    need(last?.step === "edit-witness" && last.kind === "result" && canonicalJson(last.generation) === canonicalJson(generation) && generation.ordinal === 1 &&
      journal.artifacts.at(-1)?.sha256 === witness.artifactSha256, "Closed symbol write is not immediately after its original witness.");
    need(preparation.closedPlanSha256 === journal.closedPlanSha256 && preparation.operationSha256 === sha256Json(journal.plan.operation) &&
      preparation.witnessSha256 === sha256Json(witness.witness) && preparation.witnessArtifactSha256 === witness.artifactSha256 &&
      preparation.witnessClockArtifactSha256 === witness.clockArtifactSha256 && canonicalJson(preparation.witnessClockArtifact) === canonicalJson(witness.clockArtifact) &&
      preparation.baselineCopyReceiptSha256 === witness.baselineCopyReceiptSha256 && preparation.baselineSqlSha256 === witness.baselineLogicalSha256 &&
      preparation.metadataPlanSha256 === sha256Json(preparation.metadataPlan), "Closed symbol write prepared operation or evidence binding differs.");
    const capture = this.admission.originalCapture(operationId, "edit-admission"), launch = this.relaunch.originalLaunch(operationId, "edit-launch");
    need(capture !== undefined && launch !== undefined && sha256Json(capture) === generation.captureSha256 &&
      launch.jobId === generation.jobId && launch.helperInstance === generation.helperInstance && launch.root.pid === generation.rootPid &&
      launch.root.startIdentity === generation.rootStartIdentity, "Closed symbol write lacks its original generation receipts.");
    const captureText = canonicalJson(capture), launchText = canonicalJson(launch);
    const scopeReader = this.engine.upstream.currentAuthenticatedBridgeDispatchBinding, sessionReader = this.engine.upstream.bridgeSessionLifecycle;
    need(typeof scopeReader === "function" && typeof sessionReader === "function", "Closed symbol write authenticated observers unavailable.");
    const binding = structuredClone(scopeReader.call(this.engine.upstream)), status = this.runtime.status();
    need(binding !== undefined && status.state === "owned" && canonicalJson(status.launch) === launchText, "Closed symbol write needs its original active generation.");
    const statusText = canonicalJson(status), validator = this.engine.executionAuthorityValidator;
    const validatorMethods = [validator?.capture, validator?.releaseCapture, validator?.proveTerminated];
    // oxlint-disable-next-line typescript/unbound-method -- Retain method identities only; every invocation uses its original receiver.
    const methodIdentities = (): readonly unknown[] => [this.engine.dispatchWithOrphanTracking, this.engine.runtimeIdentity, this.sql.assertOriginalPreparation];
    const engineMethods = methodIdentities();
    let rawReturnText: string | undefined;
    const returnedUnchanged = (): void => {
      need(rawReturnText !== undefined && canonicalJson(this.returns.get(operationId)) === rawReturnText,
        "Closed symbol write settled reply changed after receipt; retained evidence requires review.");
    };
    const planText = canonicalJson({ operationId, plan: journal.plan, closedPlanSha256: journal.closedPlanSha256, markerSha256: journal.markerSha256 });
    const working = (): void => { need(canonicalJson({ operationId: journal.operationId, plan: journal.plan, closedPlanSha256: journal.closedPlanSha256, markerSha256: journal.markerSha256 }) === planText,
      "Closed symbol write working plan changed."); };
    const current = (): void => {
      unchanged(); working();
      if (rawReturnText !== undefined) { returnedUnchanged(); }
      need(this.admission.originalCapture(operationId, "edit-admission") === capture && this.relaunch.originalLaunch(operationId, "edit-launch") === launch &&
        canonicalJson(capture) === captureText && canonicalJson(launch) === launchText, "Closed symbol write original generation changed.");
      need(this.engine.executionAuthorityValidator === validator && validatorMethods.every((method) => typeof method === "function") &&
        [validator?.capture, validator?.releaseCapture, validator?.proveTerminated].every((method, index) => method === validatorMethods[index]) &&
        methodIdentities().every((method, index) => method === engineMethods[index]),
        "Closed symbol write retained authority methods changed.");
      need(canonicalJson(this.runtime.status()) === statusText && this.engine.upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader &&
        this.engine.upstream.bridgeSessionLifecycle === sessionReader && canonicalJson(scopeReader.call(this.engine.upstream) ?? null) === canonicalJson(binding),
        "Closed symbol write current runtime or scope changed.");
      const session = sessionReader.call(this.engine.upstream);
      need(isRecord(session) && session["schema"] === "easyeda-pro-control.authenticated-bridge-lifecycle.v1" && isRecord(session["activeSession"]) &&
        canonicalJson({ gatewayInstanceId: session["gatewayInstanceId"], ...session["activeSession"] }) === canonicalJson(capture.bridgeSession), "Closed symbol write session changed.");
    };
    const native = async (): Promise<void> => {
      current(); const value = await this.engine.runtimeIdentity(binding); current(); need(sha256Json(value) === generation.runtimeSha256, "Closed symbol write native runtime changed.");
    };
    const qualification = async (): Promise<void> => {
      const descriptor = witness.clockArtifact;
      need(descriptor.bytes > 0 && descriptor.bytes <= 60_000, "Closed symbol write clock artifact bound refused.");
      await readExactUtf8Artifact(descriptor); current();
    };
    current(); await this.engine.assertBridgeDispatchAllowed(); current(); await this.engine.assertRecoveryOperationIsolated(operationId); current();
    need(journal.plan.nativePinsSha256 === WITNESS_NATIVE_PINS_SHA256 && journal.plan.expectedFingerprintSha256 === sha256Json(this.fingerprint), "Closed symbol write sealed implementation differs.");
    const fingerprint = await this.engine.controlFingerprintPromise; current(); need(fingerprint.sha256 === journal.plan.facadeSha256, "Closed symbol write facade differs.");
    const actualStatus = await this.engine.status(); current(); assertSubset(actualStatus.stableFingerprint, this.fingerprint, "Closed symbol write runtime");
    const bundles = await this.engine.upstream.installedEasyedaBundles?.(); current(); need(bundles !== undefined, "Closed symbol write native sources unavailable.");
    await verifyWitnessNativeProfile(bundles.assetsRoot); current(); await qualification();
    const context: ExpectedContext = { project: { uuid: journal.plan.projectUuid, path: journal.plan.projectPath },
      document: { uuid: journal.plan.activeUuid, documentType: 3, tabId: `${journal.plan.activeUuid}@${journal.plan.projectUuid}` } };
    const code = `return await ${buildWorkerBoundProjectSymbolMetadataExpression(preparation.metadataPlan, context, witness.expectedActor,
      { projectUuid: witness.witness.projectUuid, client: witness.witness.client, maxTicket: witness.witness.preDispatchMaxTicket,
        notBeforeMs: witness.witness.serverClockMinMs, notAfterMs: witness.witness.serverClockMaxMs })}`;
    const request = { profile: "private.closed-symbol-write-request.v1", witnessArtifactSha256: witness.artifactSha256,
      witnessClockArtifactSha256: witness.clockArtifactSha256, witnessClockArtifact: witness.clockArtifact,
      preparedSqlPlanSha256: preparation.preparedSqlPlanSha256, metadataPlanSha256: preparation.metadataPlanSha256,
      codeSha256: sha256Text(code), context, sameOriginalClockWindow: true };
    const requestSha256 = sha256Json(request);
    await appendClosedSymbolEvent(journal, { step: "edit-write", kind: "intent", generation, requestSha256, data: request }); current();
    need(journal.mutationMayHaveOccurred, "Closed symbol write intent lacks its durable possible-mutation marker.");
    const dispatchGeneration = (): void => {
      const roots = journal.executionAuthorityBeforeOrphan?.processes.filter((entry) => entry.role === "easyeda-main");
      need(sha256Json(journal.runtimeIdentityBeforeOrphan) === generation.runtimeSha256 && sha256Json(journal.bridgeSessionBeforeOrphan) === generation.sessionSha256 &&
        roots?.length === 1 && roots[0]?.pid === generation.rootPid && roots[0].startIdentity === generation.rootStartIdentity,
        "Closed symbol write dispatch generation differs.");
    };
    const raw = await this.engine.dispatchWithOrphanTracking(journal, "edit-write", "easyeda_execute", { code, timeoutMs: 15_000, confirmWrite: true }, 25_000,
      async () => {
        current(); dispatchGeneration(); await this.engine.assertRecoveryOperationIsolated(operationId); current(); dispatchGeneration();
        await qualification(); await native(); dispatchGeneration();
      }, async (returned) => {
        this.returns.set(operationId, returned);
        // Seal the actual settled data before publication or engine cleanup can await.
        rawReturnText = canonicalJson(returned); working();
        await appendClosedSymbolEvent(journal, { step: "edit-write", kind: "result", generation, requestSha256, data: { rawReturn: returned } });
        returnedUnchanged();
      });
    current();
    need(this.returns.get(operationId) === raw, "Closed symbol write dispatcher returned a different reply object.");
    returnedUnchanged();
    const result = decodeExactReadEnvelope(extractToolPayload(raw));
    need(canonicalJson(result) === canonicalJson({ kind: "project-symbol-metadata", targetId: journal.plan.targetUuid, createdId: null }),
      "Closed symbol write acknowledgment refused; retained result requires review, never replay.");
    await native(); await qualification();
    const final = await loadClosedSymbolJournal(operationId); current();
    need(canonicalJson(final.journal) === canonicalJson(journal), "Closed symbol write durable journal advanced or changed.");
    const artifactSha256 = journal.artifacts.at(-1)?.sha256; need(typeof artifactSha256 === "string", "Closed symbol write result artifact missing.");
    const value: OriginalClosedSymbolWrite = Object.freeze({ profile: "private.closed-symbol-write-result.v1", operationId, generation, requestSha256, artifactSha256,
      witnessArtifactSha256: witness.artifactSha256, witnessClockArtifactSha256: witness.clockArtifactSha256,
      preparedSqlPlanSha256: preparation.preparedSqlPlanSha256, metadataPlanSha256: preparation.metadataPlanSha256,
      result: Object.freeze({ kind: "project-symbol-metadata", targetId: journal.plan.targetUuid, createdId: null }),
      executionAuthorized: false, completionProved: false, saved: false, reopened: false });
    Object.assign(input.journal, journal); issued.set(value, { engine: this.engine, operationId, text: canonicalJson(value), result: value }); return value;
  }
}
