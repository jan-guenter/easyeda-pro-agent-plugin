/** Private single saved-content read. No public route, Save or completion grant. */
/* oxlint-disable import/max-dependencies -- Bind original lifecycle/source issuers and maintained evidence I/O directly; no injected proof callbacks or replacement issuers. */
import { join } from "node:path";
import { operationPath, readExactUtf8Artifact, writePhaseArtifact } from "./artifacts.ts";
import type { ArtifactDescriptor } from "./artifacts.ts";
import type { ClosedSymbolAdmissionStage } from "./closed-symbol-admission.ts";
import type { ClosedSymbolRelaunchStage } from "./closed-symbol-relaunch.ts";
import type { ClosedSymbolStartupStage } from "./closed-symbol-startup.ts";
import { validateStartupResult } from "./closed-symbol-startup-program.ts";
import { assertOriginalClosedSymbolNavigation } from "./closed-symbol-navigation.ts";
import type { ClosedSymbolNavigationStage } from "./closed-symbol-navigation.ts";
import { appendClosedSymbolEvent, loadClosedSymbolJournal } from "./closed-symbol-journal.ts";
import type { ClosedJournal, Generation } from "./closed-symbol-journal.ts";
import { WITNESS_NATIVE_PINS_SHA256, verifyWitnessNativeProfile } from "./closed-symbol-native-profile.ts";
import { assertSubset, canonicalJson, extractToolPayload, isRecord, sha256Json, sha256Text, validatePrivateFingerprint } from "./core.ts";
import type { ClosedSessionAuthorityCapture, EasyedaControlEngine, ExpectedContext } from "./engine.ts";
import { validateActorProjection } from "./symbol-dual-actor.ts";
import { assertIssuedWindowsClockObservation } from "./windows-authority.ts";
import type { WindowsControlRuntime } from "./windows-runtime.ts";
import { assertOriginalSavedSymbolSource, revalidateOriginalSavedSymbolSource, verifyOriginalSavedSymbolContent } from "./closed-symbol-saved-source.ts";
import type { OriginalSavedSymbolSource } from "./closed-symbol-saved-source.ts";
import { buildClosedSymbolSavedContentExpression } from "./saved-symbol-reader.ts";

type Value = Record<string, unknown>;
export interface OriginalClosedSymbolSavedRead {
  readonly profile: "private.closed-symbol-saved-read.v1";
  readonly operationId: string; readonly generation: Generation; readonly sourceSha256: string;
  readonly editComparisonResultSha256: string; readonly editComparisonArtifactSha256: string;
  readonly requestSha256: string; readonly artifactSha256: string;
  readonly rawArtifact: Readonly<ArtifactDescriptor>; readonly rawReturnSha256: string; readonly rawReturnBytes: number;
  readonly relation: Readonly<Value>;
  readonly executionAuthorized: false; readonly completionProved: false; readonly saved: false; readonly reopened: false;
}
interface Issuance { readonly engine: EasyedaControlEngine; readonly operationId: string; readonly text: string;
  readonly value: OriginalClosedSymbolSavedRead; readonly originalReply: () => void }
const attempts = new WeakMap<EasyedaControlEngine, Set<string>>(), issued = new WeakMap<object, Issuance>();
const ARTIFACT_LIMIT = 240 * 1024, EPOCH_TICKS = 621_355_968_000_000_000n, RAW_LIMIT = 172_032;
function need(value: boolean, message: string): asserts value { if (!value) { throw new Error(message); } }
export function assertOriginalClosedSymbolSavedRead(value: unknown, engine: EasyedaControlEngine, operationId: string): OriginalClosedSymbolSavedRead {
  need(value !== null && typeof value === "object", "Original saved read missing.");
  const owner = issued.get(value);
  need(owner !== undefined && owner.engine === engine && owner.operationId === operationId && canonicalJson(value) === owner.text,
    "Saved read requires the original successful result for this engine and operation.");
  owner.originalReply(); return owner.value;
}

export class ClosedSymbolSavedReadStage {
  private readonly engine: EasyedaControlEngine;
  private readonly runtime: WindowsControlRuntime;
  private readonly admission: ClosedSymbolAdmissionStage;
  private readonly relaunch: ClosedSymbolRelaunchStage;
  private readonly startup: ClosedSymbolStartupStage;
  private readonly navigation: ClosedSymbolNavigationStage;
  private readonly fingerprint: Value;
  private readonly returns = new Map<string, unknown>();
  private readonly captures = new Map<string, ClosedSessionAuthorityCapture>();
  private readonly released = new Set<ClosedSessionAuthorityCapture>();
  public constructor(engine: EasyedaControlEngine, runtime: WindowsControlRuntime, admission: ClosedSymbolAdmissionStage,
    relaunch: ClosedSymbolRelaunchStage, startup: ClosedSymbolStartupStage, navigation: ClosedSymbolNavigationStage, fingerprint: Value) {
    validatePrivateFingerprint(fingerprint);
    this.engine = engine; this.runtime = runtime; this.admission = admission; this.relaunch = relaunch;
    this.startup = startup; this.navigation = navigation; this.fingerprint = structuredClone(fingerprint);
  }
  public originalReturn(operationId: string): unknown { return this.returns.get(operationId); }
  public originalClockCapture(operationId: string): ClosedSessionAuthorityCapture | undefined { return this.captures.get(operationId); }

  public async read(input: Readonly<{ journal: ClosedJournal; source: OriginalSavedSymbolSource; navigationResult: unknown }>): Promise<OriginalClosedSymbolSavedRead> {
    const callerText = canonicalJson(input.journal), operationId = input.journal.operationId;
    let used = attempts.get(this.engine); if (used === undefined) { used = new Set(); attempts.set(this.engine, used); }
    need(!used.has(operationId), "Saved read attempt already consumed."); used.add(operationId);
    const navigationInput = input.navigationResult, sourceInput = input.source;
    const source = assertOriginalSavedSymbolSource(sourceInput, this.engine, operationId);
    assertOriginalClosedSymbolNavigation(navigationInput, this.engine, operationId, "verify-open");
    const unchanged = (): void => {
      need(canonicalJson(input.journal) === callerText && input.source === sourceInput && input.navigationResult === navigationInput,
        "Saved read caller changed.");
      need(assertOriginalSavedSymbolSource(sourceInput, this.engine, operationId) === source, "Saved read original source changed.");
      assertOriginalClosedSymbolNavigation(navigationInput, this.engine, operationId, "verify-open");
    };
    const { journal, events } = await loadClosedSymbolJournal(operationId); unchanged();
    need(canonicalJson(journal) === callerText && !journal.hardStop && !journal.orphanedCallPossible && journal.sequence === 36,
      "Saved read managed journal differs or is quarantined.");
    const admissionEvent = events.find((event) => event.step === "verify-admission" && event.kind === "result"), last = events.at(-1);
    need(last?.step === "verify-open" && last.kind === "result" && last.generation !== null && "captureSha256" in last.generation &&
      last.generation.ordinal === 2 && canonicalJson(admissionEvent?.generation) === canonicalJson(last.generation),
      "Saved read needs the exact verification generation and reopen result.");
    const generation = Object.freeze(structuredClone(last.generation));
    need(source.projectUuid === journal.plan.projectUuid && source.branchUuid === journal.plan.branchUuid && source.ownerUuid === journal.plan.ownerUuid &&
      source.targetUuid === journal.plan.targetUuid && source.projectedContentBytes > 0 && source.projectedContentBytes <= 65_536 &&
      journal.artifacts[27]?.sha256 === source.editComparisonArtifactSha256, "Saved read historical source differs from its operation.");
    const capture = this.admission.originalCapture(operationId, "verify-admission"), launch = this.relaunch.originalLaunch(operationId, "verify-launch");
    need(capture !== undefined && launch !== undefined && sha256Json(capture) === generation.captureSha256 &&
      launch.helperInstance === generation.helperInstance && launch.jobId === generation.jobId && launch.root.pid === generation.rootPid &&
      launch.root.startIdentity === generation.rootStartIdentity && isRecord(admissionEvent?.data) &&
      canonicalJson(admissionEvent.data["capture"]) === canonicalJson(capture), "Saved read original generation receipts missing.");
    const captureText = canonicalJson(capture), launchText = canonicalJson(launch);
    const openRaw = this.navigation.originalReturn(operationId, "verify-open"), startupRaw = this.startup.originalReturn(operationId, "verify-marker-read");
    const startupEvent = events.find((event) => event.step === "verify-marker-read" && event.kind === "result");
    need(openRaw !== undefined && isRecord(last.data) && canonicalJson(last.data["rawReturn"]) === canonicalJson(openRaw) && startupRaw !== undefined &&
      isRecord(startupEvent?.data) && canonicalJson(startupEvent.data["rawReturn"]) === canonicalJson(startupRaw) &&
      canonicalJson(startupEvent.generation) === canonicalJson(generation), "Saved read original startup or navigation observation missing.");
    const openText = canonicalJson(openRaw), startupText = canonicalJson(startupRaw);
    const startupResult = validateStartupResult(extractToolPayload(startupRaw), { phase: "verify-marker-read", projectUuid: source.projectUuid,
      branchUuid: source.branchUuid, ownerUuid: source.ownerUuid, marker: journal.plan.marker });
    need(startupResult["ok"] === true && Array.isArray(startupResult["observations"]), "Saved read startup observation refused.");
    const first = startupResult["observations"][0] as unknown;
    need(isRecord(first) && isRecord(first["observation"]), "Saved read startup actor missing.");
    const actor = validateActorProjection(first["observation"]["startupActor"]);
    const scopeReader = this.engine.upstream.currentAuthenticatedBridgeDispatchBinding, sessionReader = this.engine.upstream.bridgeSessionLifecycle;
    need(typeof scopeReader === "function" && typeof sessionReader === "function", "Saved read authenticated observers unavailable.");
    const binding = structuredClone(scopeReader.call(this.engine.upstream)), status = this.runtime.status();
    need(binding !== undefined && status.state === "owned" && canonicalJson(status.launch) === launchText, "Saved read original owned runtime missing.");
    const statusText = canonicalJson(status), validator = this.engine.executionAuthorityValidator;
    const validatorMethods = [validator?.capture, validator?.releaseCapture, validator?.proveTerminated];
    // oxlint-disable-next-line typescript/unbound-method -- Preserve the cleanup receiver and compare methods for identity; invoke only with original receivers.
    const releaseCapture = this.engine.releaseClosedSessionAuthority;
    // oxlint-disable-next-line typescript/unbound-method -- Identity comparisons only.
    const methodIdentities = (): readonly unknown[] => [this.engine.captureClosedSessionAuthority, this.engine.releaseClosedSessionAuthority, this.engine.clockObservationForClosedCapture, this.engine.dispatchWithOrphanTracking, this.engine.runtimeIdentity];
    const methods = methodIdentities(), planText = canonicalJson({ operationId, plan: journal.plan, closedPlanSha256: journal.closedPlanSha256, markerSha256: journal.markerSha256 });
    let rawSeal: string | undefined, rawText: string | undefined;
    const originalReply = (): void => {
      need(rawText !== undefined && rawSeal !== undefined && JSON.stringify(this.returns.get(operationId)) === rawText &&
        canonicalJson(this.returns.get(operationId)) === rawSeal, "Saved read settled reply changed.");
    };
    const working = (): void => { need(canonicalJson({ operationId: journal.operationId, plan: journal.plan, closedPlanSha256: journal.closedPlanSha256, markerSha256: journal.markerSha256 }) === planText,
      "Saved read working plan changed."); };
    const current = (): void => {
      unchanged(); working(); if (rawText !== undefined) { originalReply(); }
      need(this.admission.originalCapture(operationId, "verify-admission") === capture && this.relaunch.originalLaunch(operationId, "verify-launch") === launch &&
        canonicalJson(capture) === captureText && canonicalJson(launch) === launchText && this.startup.originalReturn(operationId, "verify-marker-read") === startupRaw &&
        this.navigation.originalReturn(operationId, "verify-open") === openRaw && canonicalJson(startupRaw) === startupText && canonicalJson(openRaw) === openText,
        "Saved read original lifecycle receipts changed.");
      need(this.engine.executionAuthorityValidator === validator && validatorMethods.every((method) => typeof method === "function") &&
        [validator?.capture, validator?.releaseCapture, validator?.proveTerminated].every((method, index) => method === validatorMethods[index]) &&
        methodIdentities().every((method, index) => method === methods[index]), "Saved read authority methods changed.");
      need(canonicalJson(this.runtime.status()) === statusText && this.engine.upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader &&
        this.engine.upstream.bridgeSessionLifecycle === sessionReader && canonicalJson(scopeReader.call(this.engine.upstream) ?? null) === canonicalJson(binding),
        "Saved read current runtime or scope changed.");
      const session = sessionReader.call(this.engine.upstream);
      need(isRecord(session) && session["schema"] === "easyeda-pro-control.authenticated-bridge-lifecycle.v1" && isRecord(session["activeSession"]) &&
        canonicalJson({ gatewayInstanceId: session["gatewayInstanceId"], ...session["activeSession"] }) === canonicalJson(capture.bridgeSession), "Saved read session changed.");
    };
    const native = async (): Promise<void> => {
      current(); const observed = await this.engine.runtimeIdentity(binding); current();
      need(sha256Json(observed) === generation.runtimeSha256, "Saved read native runtime changed.");
    };
    const historical = async (): Promise<void> => {
      need(await revalidateOriginalSavedSymbolSource(sourceInput, this.engine, operationId) === source, "Saved read historical source changed."); current();
    };
    current(); await this.engine.assertBridgeDispatchAllowed(); current(); await this.engine.assertRecoveryOperationIsolated(operationId); current();
    need(journal.plan.nativePinsSha256 === WITNESS_NATIVE_PINS_SHA256 && journal.plan.expectedFingerprintSha256 === sha256Json(this.fingerprint), "Saved read sealed implementation differs.");
    const fingerprint = await this.engine.controlFingerprintPromise; current(); need(fingerprint.sha256 === journal.plan.facadeSha256, "Saved read facade differs.");
    const actualStatus = await this.engine.status(); current(); assertSubset(actualStatus.stableFingerprint, this.fingerprint, "Saved read runtime");
    const bundles = await this.engine.upstream.installedEasyedaBundles?.(); current(); need(bundles !== undefined, "Saved read native sources unavailable.");
    await verifyWitnessNativeProfile(bundles.assetsRoot); current(); await historical(); await native();
    let extraCapture: ClosedSessionAuthorityCapture | undefined;
    try {
      extraCapture = await this.engine.captureClosedSessionAuthority(operationId, "closed-verification", 2);
      this.captures.set(operationId, extraCapture); current();
      const clock = await this.engine.clockObservationForClosedCapture(extraCapture); current();
      need(await assertIssuedWindowsClockObservation(clock) === clock, "Saved read clock issuer differs."); current();
      need(clock.clock.status === "observed" && clock.phase === "capture" && clock.base["bindingSha256"] === extraCapture.executionAuthority.bindingSha256 &&
        clock.base["jobId"] === generation.jobId && clock.base["helperInstance"] === generation.helperInstance && extraCapture.operationId === operationId &&
        extraCapture.phase === "closed-verification" && extraCapture.challengeAttempt === 2 && sha256Json(extraCapture.runtimeIdentity) === generation.runtimeSha256 &&
        sha256Json(extraCapture.bridgeSession) === generation.sessionSha256, "Saved read native clock capture differs.");
      const notBeforeMs = Number((BigInt(clock.clock.before.utcBeforeTicks) - EPOCH_TICKS) / 10_000n);
      const context: ExpectedContext = { project: { uuid: source.projectUuid, path: journal.plan.projectPath },
        document: { uuid: journal.plan.activeUuid, documentType: 3, tabId: `${journal.plan.activeUuid}@${source.projectUuid}` } };
      const readPlan = { projectUuid: source.projectUuid, branchUuid: source.branchUuid, ownerUuid: source.ownerUuid, targetUuid: source.targetUuid,
        headerEditVersion: source.headerEditVersion, maximumTicket: source.maximumTicket, notBeforeMs, notAfterMs: notBeforeMs + 60_000 };
      const code = `return await ${buildClosedSymbolSavedContentExpression(readPlan, context, actor)}`;
      const rawPath = join(operationPath(operationId).slice(0, -5), "38-verify-content-read-raw.json");
      const request = { profile: "private.closed-symbol-saved-read-request.v1", source, context, expectedActor: actor, readPlan,
        codeSha256: sha256Text(code), rawPath, rawLimit: RAW_LIMIT, artifactLimit: ARTIFACT_LIMIT, clockCapture: extraCapture, clock };
      const requestSha256 = sha256Json(request);
      await appendClosedSymbolEvent(journal, { step: "verify-content-read", kind: "intent", generation, requestSha256, data: request }); current();
      let rawArtifact: Readonly<ArtifactDescriptor> | undefined, rawBytes = 0, rawSha256 = "";
      const dispatchGeneration = (): void => {
        const roots = journal.executionAuthorityBeforeOrphan?.processes.filter((entry) => entry.role === "easyeda-main");
        need(sha256Json(journal.runtimeIdentityBeforeOrphan) === generation.runtimeSha256 && sha256Json(journal.bridgeSessionBeforeOrphan) === generation.sessionSha256 &&
          roots?.length === 1 && roots[0]?.pid === generation.rootPid && roots[0].startIdentity === generation.rootStartIdentity, "Saved read dispatch generation differs.");
      };
      const raw = await this.engine.dispatchWithOrphanTracking(journal, "verify-content-read", "easyeda_execute", { code, timeoutMs: 15_000, confirmWrite: false }, 25_000,
        async () => {
          current(); dispatchGeneration(); await this.engine.assertRecoveryOperationIsolated(operationId); current(); dispatchGeneration();
          // The engine has marked this dispatch in flight. Historical SQL
          // Revalidation requires a non-orphan journal and ran before intent.
          // Current original-token checks remain valid inside this callback.
          await native(); dispatchGeneration();
        }, async (returned) => {
          this.returns.set(operationId, returned); rawSeal = canonicalJson(returned); rawText = JSON.stringify(returned);
          need(typeof rawText === "string", "Saved read raw return is not JSON."); working();
          rawBytes = Buffer.byteLength(rawText); need(rawBytes > 0 && rawBytes <= RAW_LIMIT, "Saved read complete raw return exceeds its fixed byte bound.");
          rawSha256 = sha256Text(rawText);
          const envelope = { profile: "private.closed-symbol-saved-read-raw.v1", operationId, requestSha256, sourceSha256: source.sourceSha256,
            rawReturnSha256: rawSha256, rawReturnBytes: rawBytes, rawReturnBase64: Buffer.from(rawText).toString("base64") };
          need(Buffer.byteLength(JSON.stringify(envelope)) + 1 <= ARTIFACT_LIMIT, "Saved read auxiliary artifact exceeds its fixed bound.");
          rawArtifact = Object.freeze(await writePhaseArtifact(operationId, 38, "verify-content-read-raw", envelope)); originalReply(); working();
          need(rawArtifact.path === rawPath, "Saved read auxiliary path differs.");
          await appendClosedSymbolEvent(journal, { step: "verify-content-read", kind: "result", generation, requestSha256,
            data: { rawArtifact, rawReturnSha256: rawSha256, rawReturnBytes: rawBytes, sourceSha256: source.sourceSha256 } }); originalReply();
        });
      current(); need(this.returns.get(operationId) === raw && rawArtifact !== undefined, "Saved read dispatcher returned a different reply or no raw artifact."); originalReply();
      const observation = extractToolPayload(raw);
      need(isRecord(observation) && Reflect.ownKeys(observation).length === 9 && observation["profile"] === "private.saved-symbol-content-observation.v1" &&
        observation["projectUuid"] === source.projectUuid && observation["targetUuid"] === source.targetUuid && observation["maximumTicket"] === source.maximumTicket &&
        typeof observation["workerClient"] === "string" && /^[a-f0-9]{16}$/u.test(observation["workerClient"]) &&
        typeof observation["content"] === "string" && Buffer.byteLength(observation["content"]) <= 65_536 &&
        observation["executionAuthorized"] === false && observation["producerBindingVerified"] === false && observation["completionProved"] === false,
        "Saved read native observation shape or scope differs.");
      const relation = verifyOriginalSavedSymbolContent(source, this.engine, operationId, observation);
      const artifactExact = async (): Promise<void> => {
        need(rawArtifact !== undefined && rawArtifact.path === rawPath && rawArtifact.bytes <= ARTIFACT_LIMIT, "Saved read retained raw descriptor differs.");
        const bytes = await readExactUtf8Artifact(rawArtifact); current();
        const value: unknown = JSON.parse(bytes.text);
        need(isRecord(value) && value["operationId"] === operationId && value["requestSha256"] === requestSha256 && value["sourceSha256"] === source.sourceSha256 &&
          value["rawReturnBytes"] === rawBytes && value["rawReturnSha256"] === rawSha256 && value["rawReturnBase64"] === Buffer.from(rawText ?? "").toString("base64"),
          "Saved read exact raw artifact differs.");
      };
      await artifactExact(); await historical(); await native(); await verifyWitnessNativeProfile(bundles.assetsRoot); current();
      this.released.add(extraCapture); await releaseCapture.call(this.engine, extraCapture); current();
      await native(); await artifactExact();
      const final = await loadClosedSymbolJournal(operationId); current();
      need(canonicalJson(final.journal) === canonicalJson(journal), "Saved read durable journal changed.");
      const artifactSha256 = journal.artifacts.at(-1)?.sha256; need(typeof artifactSha256 === "string", "Saved read result artifact missing.");
      const value: OriginalClosedSymbolSavedRead = Object.freeze({ profile: "private.closed-symbol-saved-read.v1", operationId, generation,
        sourceSha256: source.sourceSha256, editComparisonResultSha256: source.editComparisonResultSha256, editComparisonArtifactSha256: source.editComparisonArtifactSha256,
        requestSha256, artifactSha256, rawArtifact, rawReturnSha256: rawSha256, rawReturnBytes: rawBytes, relation,
        executionAuthorized: false, completionProved: false, saved: false, reopened: false });
      Object.assign(input.journal, journal); issued.set(value, { engine: this.engine, operationId, text: canonicalJson(value), value, originalReply }); return value;
    } catch (error) {
      if (extraCapture !== undefined && !this.released.has(extraCapture)) {
        this.released.add(extraCapture);
        try { await releaseCapture.call(this.engine, extraCapture); }
        catch (cleanupError) { throw new AggregateError([error, cleanupError], "Saved read capture cleanup did not complete; never repeat the read or release.", { cause: cleanupError }); }
      }
      throw error;
    }
  }
}
