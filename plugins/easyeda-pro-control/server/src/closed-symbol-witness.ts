/** Private fixed collector. No route, replay, aged-head or completion authority. */
/* oxlint-disable import/max-dependencies -- This owner binds the original managed journal, process receipts, completed SQL reader and fixed collectors directly; a pass-through import would hide that boundary. */
import { join } from "node:path";
import { operationPath, readExactUtf8Artifact, writePhaseArtifact } from "./artifacts.ts";
import type { ArtifactDescriptor } from "./artifacts.ts";
import type { ClosedFileCopyReceipt } from "./closed-file-copy.ts";
import type { ClosedSymbolAdmissionStage } from "./closed-symbol-admission.ts";
import type { ClosedSymbolRelaunchStage } from "./closed-symbol-relaunch.ts";
import { appendClosedSymbolEvent, loadClosedSymbolJournal } from "./closed-symbol-journal.ts";
import type { ClosedJournal, Generation } from "./closed-symbol-journal.ts";
import { assertSubset, canonicalJson, extractToolPayload, isRecord, sha256Json, sha256Text, validatePrivateFingerprint } from "./core.ts";
import type { ClosedSessionAuthorityCapture, EasyedaControlEngine } from "./engine.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { NativeSqlInventory as ExactSqlInventory } from "./sqlite-inventory-core.ts";
import { validateActorProjection } from "./symbol-dual-actor.ts";
import type { ActorProjection } from "./symbol-dual-actor.ts";
import { buildSymbolWitnessReadExpression, validateSymbolWitnessReadResult } from "./symbol-predispatch-witness.ts";
import type { SymbolSqlWitness } from "./symbol-sql-comparator.ts";
import type { WindowsControlRuntime } from "./windows-runtime.ts";
import type { ClosedSymbolStartupStage } from "./closed-symbol-startup.ts";
import { validateStartupResult } from "./closed-symbol-startup-program.ts";
import { assertIssuedWindowsClockObservation } from "./windows-authority.ts";
import type { IssuedWindowsClockObservation, WindowsAuthorityLaunch } from "./windows-authority.ts";
import { compareRendererClockEndpoints } from "./renderer-clock-endpoints.ts";
import { lockedWitnessBaseline } from "./closed-symbol-witness-baseline.ts";
import { WITNESS_NATIVE_PINS_SHA256, verifyWitnessNativeProfile } from "./closed-symbol-native-profile.ts";

import { assertOriginalMainReference, revalidateOriginalMainReference } from "./closed-symbol-main-reference.ts";
import { mainReferenceBaseline } from "./closed-symbol-main-reference-baseline.ts";
import { compareHistoricalSqlClock } from "./historical-sql-clock.ts";
import { validateClockSample } from "./windows-clock-transport.ts";
import { buildAgedSymbolWitnessReadExpression, validateAgedSymbolWitnessReadResult } from "./aged-symbol-witness.ts";

type Engine = EasyedaControlEngine & { readonly clockObservationForClosedCapture?: (capture: ClosedSessionAuthorityCapture) => Promise<IssuedWindowsClockObservation> };
type Runtime = WindowsControlRuntime & { readonly clockObservationForLaunch?: (launch: WindowsAuthorityLaunch) => Promise<IssuedWindowsClockObservation> };
export interface OriginalClosedSymbolWitness {
  readonly expectedActor: ActorProjection;
  readonly witness: Readonly<SymbolSqlWitness>; readonly generation: Generation;
  readonly artifactSha256: string; readonly clockArtifactSha256: string; readonly clockArtifact: Readonly<ArtifactDescriptor>;
  readonly baselineCopyReceiptSha256: string; readonly baselineLogicalSha256: string; readonly operationSha256: string;
  readonly executionAuthorized: false; readonly completionProved: false;
}
interface Issuance { readonly engine: EasyedaControlEngine; readonly operationId: string; readonly sealed: string; readonly result: OriginalClosedSymbolWitness }
const attempts = new WeakMap<EasyedaControlEngine, Set<string>>(), issued = new WeakMap<object, Issuance>();
const EPOCH_TICKS = 621_355_968_000_000_000n;
function need(value: boolean, message: string): asserts value { if (!value) { throw new Error(message); } }

/** Synchronous identity lookup only; consumers also rehash the fixed auxiliary
 * artifact through maintained bounded storage before preparation/comparison. */
export function assertOriginalClosedSymbolWitness(value: unknown, engine: EasyedaControlEngine, operationId: string): OriginalClosedSymbolWitness {
  need(value !== null && typeof value === "object", "Original closed symbol witness missing.");
  const owner = issued.get(value);
  need(owner !== undefined && owner.engine === engine && owner.operationId === operationId && owner.sealed === canonicalJson(value),
    "Closed symbol witness was not issued successfully for this original engine and operation.");
  return owner.result;
}

async function observed(value: IssuedWindowsClockObservation): Promise<Readonly<{
  observation: IssuedWindowsClockObservation; clock: Extract<IssuedWindowsClockObservation["clock"], { status: "observed" }>;
}>> {
  const original = await assertIssuedWindowsClockObservation(value);
  need(original === value && value.clock.status === "observed", "Source-owned Windows clock observation is unavailable.");
  return Object.freeze({ observation: value, clock: value.clock });
}
async function artifactExact(descriptor: Readonly<ArtifactDescriptor>): Promise<void> {
  need(descriptor.bytes > 0 && descriptor.bytes <= 60_000, "Witness clock artifact exceeds its fixed bound.");
  await readExactUtf8Artifact({ path: descriptor.path, bytes: descriptor.bytes, sha256: descriptor.sha256 });
}

/** The owning coordinator serializes the source-qualified fresh-start/open
 * sequence. This stage does not infer absence of arbitrary outside writers. */
export class ClosedSymbolWitnessStage {
  private readonly engine: Engine;
  private readonly runtime: Runtime;
  private readonly admission: ClosedSymbolAdmissionStage;
  private readonly startup: ClosedSymbolStartupStage;
  private readonly relaunch: ClosedSymbolRelaunchStage;
  private readonly fingerprint: Record<string, unknown>;
  private readonly returns = new Map<string, unknown>();
  private readonly captures = new Map<string, ClosedSessionAuthorityCapture>();
  private readonly released = new Set<ClosedSessionAuthorityCapture>();

  public constructor(engine: Engine, runtime: Runtime, admission: ClosedSymbolAdmissionStage,
    startup: ClosedSymbolStartupStage, relaunch: ClosedSymbolRelaunchStage, fingerprint: Record<string, unknown>) {
    validatePrivateFingerprint(fingerprint);
    this.engine = engine; this.runtime = runtime; this.admission = admission; this.startup = startup; this.relaunch = relaunch;
    this.fingerprint = structuredClone(fingerprint);
  }
  public originalReturn(operationId: string): unknown { return this.returns.get(operationId); }
  public originalClockCapture(operationId: string, position: "before" | "after"): ClosedSessionAuthorityCapture | undefined {
    return this.captures.get(`${operationId}:${position}`);
  }

  public async collect(input: Readonly<{ journal: ClosedJournal; baselineCopy: ClosedFileCopyReceipt; baselineInventory: ExactSqlInventory; mainReference?: unknown }>): Promise<OriginalClosedSymbolWitness> {
    const callerText = canonicalJson(input.journal), operationId = input.journal.operationId;
    let used = attempts.get(this.engine); if (used === undefined) { used = new Set(); attempts.set(this.engine, used); }
    need(!used.has(operationId), "Closed symbol witness attempt already consumed."); used.add(operationId);
    const copy = input.baselineCopy, inventory = input.baselineInventory, referenceInput = input.mainReference;
    const reference = referenceInput === undefined ? undefined : assertOriginalMainReference(referenceInput, this.engine, operationId);
    const copyText = canonicalJson(copy);
    const { journal, events } = await loadClosedSymbolJournal(operationId);
    const unchanged = (): void => { need(canonicalJson(input.journal) === callerText && input.baselineCopy === copy && input.baselineInventory === inventory &&
      canonicalJson(copy) === copyText && readerCompletion(inventory).exitCode === 0 && input.mainReference === referenceInput,
      "Witness caller or baseline changed.");
      if (reference !== undefined) { need(assertOriginalMainReference(referenceInput, this.engine, operationId) === reference, "Witness original main reference changed."); }
    };
    unchanged(); need(canonicalJson(journal) === callerText && !journal.hardStop && !journal.orphanedCallPossible, "Witness managed journal differs or is quarantined.");
    const admission = events.find((event) => event.step === "edit-admission" && event.kind === "result"), last = events.at(-1);
    need(last?.step === "edit-open" && last.kind === "result" && last.generation !== null && "captureSha256" in last.generation && last.generation.ordinal === 1 &&
      canonicalJson(admission?.generation) === canonicalJson(last.generation), "Witness requires the exact edit-open result.");
    const generation = Object.freeze(structuredClone(last.generation));
    const capture = this.admission.originalCapture(operationId, "edit-admission"), launch = this.relaunch.originalLaunch(operationId, "edit-launch");
    need(capture !== undefined && launch !== undefined && sha256Json(capture) === generation.captureSha256 && isRecord(admission?.data) &&
      canonicalJson(admission.data["capture"]) === canonicalJson(capture), "Witness lacks original admission and launch receipts.");
    const captureText = canonicalJson(capture), launchText = canonicalJson(launch);
    const baseline = reference === undefined ? await lockedWitnessBaseline(journal, events, copy, inventory) : await mainReferenceBaseline(journal, events, copy, inventory); unchanged();
    if (reference !== undefined) {
      need("historyUuid" in baseline && reference.request.historyUuid === baseline.historyUuid && reference.request.createdAtLiteral === baseline.createdAtLiteral &&
        reference.request.closedPlanSha256 === journal.closedPlanSha256 && reference.request.nativePinsSha256 === journal.plan.nativePinsSha256 &&
        reference.baselineCopyReceiptSha256 === copy.receiptSha256 && reference.request.baselineCopyReceiptSha256 === copy.receiptSha256 &&
        reference.baselineLogicalSha256 === inventory.logicalSha256 && reference.request.baselineLogicalSha256 === inventory.logicalSha256 &&
        reference.operationSha256 === sha256Json(journal.plan.operation), "Witness main reference selects another baseline or operation.");
      need(await revalidateOriginalMainReference(reference, this.engine, operationId) === reference, "Witness historical main reference differs."); unchanged();
    }
    const startupEvent = events.find((event) => event.step === "edit-marker-read" && event.kind === "result");
    const startupRaw = this.startup.originalReturn(operationId, "edit-marker-read");
    need(startupRaw !== undefined && isRecord(startupEvent?.data) && canonicalJson(startupEvent.data["rawReturn"]) === canonicalJson(startupRaw) &&
      canonicalJson(startupEvent.generation) === canonicalJson(generation), "Witness lacks original startup observations.");
    const startup = validateStartupResult(extractToolPayload(startupRaw), { phase: "edit-marker-read", projectUuid: journal.plan.projectUuid,
      branchUuid: journal.plan.branchUuid, ownerUuid: journal.plan.ownerUuid, marker: journal.plan.marker });
    need(startup["ok"] === true && Array.isArray(startup["observations"]), "Witness startup observation failed.");
    const first = startup["observations"][0] as unknown;
    need(isRecord(first) && isRecord(first["observation"]), "Witness startup actor is missing.");
    const actor = validateActorProjection(first["observation"]["startupActor"]);
    const scopeReader = this.engine.upstream.currentAuthenticatedBridgeDispatchBinding, sessionReader = this.engine.upstream.bridgeSessionLifecycle;
    const validator = this.engine.executionAuthorityValidator, validatorMethods = [validator?.capture, validator?.releaseCapture, validator?.proveTerminated];
    // oxlint-disable-next-line typescript/unbound-method -- Preserve the original cleanup receiver; calls below explicitly use this.engine as this.
    const releaseCapture = this.engine.releaseClosedSessionAuthority;
    // oxlint-disable-next-line typescript/unbound-method -- These references are compared for identity, not invoked unbound.
    const engineMethods = [this.engine.captureClosedSessionAuthority, this.engine.releaseClosedSessionAuthority, this.engine.dispatchWithOrphanTracking, this.engine.runtimeIdentity];
    const captureClockReader = this.engine.clockObservationForClosedCapture, launchClockReader = this.runtime.clockObservationForLaunch;
    need(typeof scopeReader === "function" && typeof sessionReader === "function" && typeof launchClockReader === "function" && typeof captureClockReader === "function",
      "Witness source-owned native clock issuer or authenticated observers are unavailable.");
    const binding = structuredClone(scopeReader.call(this.engine.upstream)), status = this.runtime.status();
    need(binding !== undefined && status.state === "owned" && canonicalJson(status.launch) === launchText, "Witness needs its original active owned generation.");
    const planText = canonicalJson({ operationId, plan: journal.plan, closedPlanSha256: journal.closedPlanSha256, markerSha256: journal.markerSha256 }), statusText = canonicalJson(status);
    const working = (): void => { need(canonicalJson({ operationId: journal.operationId, plan: journal.plan, closedPlanSha256: journal.closedPlanSha256, markerSha256: journal.markerSha256 }) === planText,
      "Witness working plan changed."); };
    let settledReply: unknown, settledText: string | undefined;
    const unchangedReply = (): void => {
      need(settledText === undefined || canonicalJson(settledReply) === settledText, "Witness settled reply changed after retention.");
    };
    const current = (): void => {
      unchangedReply();
      unchanged(); working();
      need(readerCompletion(inventory).exitCode === 0 && this.admission.originalCapture(operationId, "edit-admission") === capture &&
        this.relaunch.originalLaunch(operationId, "edit-launch") === launch && canonicalJson(capture) === captureText && canonicalJson(launch) === launchText,
        "Witness original producer receipts changed.");
      need(this.engine.executionAuthorityValidator === validator && validatorMethods.every((method) => typeof method === "function") &&
        [validator?.capture, validator?.releaseCapture, validator?.proveTerminated].every((method, index) => method === validatorMethods[index]) &&
        // oxlint-disable-next-line typescript/unbound-method -- Identity comparison only.
        [this.engine.captureClosedSessionAuthority, this.engine.releaseClosedSessionAuthority, this.engine.dispatchWithOrphanTracking, this.engine.runtimeIdentity]
          .every((method, index) => method === engineMethods[index]) &&
        this.runtime.clockObservationForLaunch === launchClockReader && this.engine.clockObservationForClosedCapture === captureClockReader,
        "Witness retained authority or clock issuer changed.");
      need(canonicalJson(this.runtime.status()) === statusText && this.engine.upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader &&
        this.engine.upstream.bridgeSessionLifecycle === sessionReader && canonicalJson(scopeReader.call(this.engine.upstream) ?? null) === canonicalJson(binding),
        "Witness current runtime or scope changed.");
      const session = sessionReader.call(this.engine.upstream);
      need(isRecord(session) && session["schema"] === "easyeda-pro-control.authenticated-bridge-lifecycle.v1" && isRecord(session["activeSession"]) &&
        canonicalJson({ gatewayInstanceId: session["gatewayInstanceId"], ...session["activeSession"] }) === canonicalJson(capture.bridgeSession), "Witness current session changed.");
    };
    const native = async (): Promise<void> => {
      current(); const value = await this.engine.runtimeIdentity(binding); current(); need(sha256Json(value) === generation.runtimeSha256, "Witness native runtime changed.");
    };
    current(); await this.engine.assertBridgeDispatchAllowed(); current(); await this.engine.assertRecoveryOperationIsolated(operationId); current();
    need(journal.plan.nativePinsSha256 === WITNESS_NATIVE_PINS_SHA256 && journal.plan.expectedFingerprintSha256 === sha256Json(this.fingerprint), "Witness sealed implementation pins differ.");
    const fingerprint = await this.engine.controlFingerprintPromise; current(); need(fingerprint.sha256 === journal.plan.facadeSha256, "Witness sealed facade differs.");
    const actualStatus = await this.engine.status(); current(); assertSubset(actualStatus.stableFingerprint, this.fingerprint, "Witness runtime");
    const bundles = await this.engine.upstream.installedEasyedaBundles?.(); current(); need(bundles !== undefined, "Witness installed sources unavailable.");
    await verifyWitnessNativeProfile(bundles.assetsRoot); current();
    const launchClock = await observed(await launchClockReader.call(this.runtime, launch)); current();
    need(launchClock.observation.phase === "launch" && canonicalJson(launchClock.observation.base) === launchText, "Witness clock launch differs.");
    const extraCaptures: ClosedSessionAuthorityCapture[] = [];
    try {
      const beforeCapture = await this.engine.captureClosedSessionAuthority(operationId, "closed-edit", 2);
      this.captures.set(`${operationId}:before`, beforeCapture); extraCaptures.push(beforeCapture); current();
      const before = await observed(await captureClockReader.call(this.engine, beforeCapture)); current();
      need(beforeCapture.operationId === operationId && beforeCapture.phase === "closed-edit" && beforeCapture.challengeAttempt === 2 &&
        before.observation.phase === "capture" && before.observation.base["bindingSha256"] === beforeCapture.executionAuthority.bindingSha256 && before.observation.base["jobId"] === generation.jobId &&
        before.observation.base["helperInstance"] === generation.helperInstance && sha256Json(beforeCapture.runtimeIdentity) === generation.runtimeSha256 &&
        sha256Json(beforeCapture.bridgeSession) === generation.sessionSha256, "Witness native-before capture differs.");
      const notBeforeMs = Number((BigInt(before.clock.before.utcBeforeTicks) - EPOCH_TICKS) / 10_000n);
      const plannedWindow = Object.freeze({ notBeforeMs, notAfterMs: notBeforeMs + 60_000 });
      const scope = { projectUuid: journal.plan.projectUuid, branchUuid: journal.plan.branchUuid, ownerUuid: journal.plan.ownerUuid,
        targetUuid: journal.plan.targetUuid, activeUuid: journal.plan.activeUuid, createdAtLiteral: baseline.createdAtLiteral };
      const controlScope = reference === undefined ? undefined : { createdAtLiteral: reference.request.createdAtLiteral, referenceUtcMs: reference.request.referenceUtcMs };
      const code = `return await ${controlScope === undefined ? buildSymbolWitnessReadExpression(scope) : buildAgedSymbolWitnessReadExpression(scope, controlScope, actor)}`;
      const qualificationPath = join(operationPath(operationId).slice(0, -5), "20-edit-witness-clock-qualification.json");
      const request = { profile: "private.closed-symbol-witness-request.v1", scope, plannedWindow, expectedActor: actor,
        ...(reference === undefined ? {} : { mainReference: reference }),
        codeSha256: sha256Text(code), qualificationPath, baselineCopyReceiptSha256: copy.receiptSha256, baselineLogicalSha256: inventory.logicalSha256,
        operationSha256: sha256Json(journal.plan.operation), launchClock: launchClock.observation, beforeCapture, beforeClock: before.observation };
      const requestSha256 = sha256Json(request);
      await appendClosedSymbolEvent(journal, { step: "edit-witness", kind: "intent", generation, requestSha256, data: request }); current();
      const raw = await this.engine.dispatchWithOrphanTracking(journal, "edit-witness", "easyeda_execute", { code, timeoutMs: 15_000, confirmWrite: false }, 25_000,
        async () => {
          current(); await this.engine.assertRecoveryOperationIsolated(operationId); current(); await native();
          const roots = journal.executionAuthorityBeforeOrphan?.processes.filter((entry) => entry.role === "easyeda-main");
          need(sha256Json(journal.runtimeIdentityBeforeOrphan) === generation.runtimeSha256 && sha256Json(journal.bridgeSessionBeforeOrphan) === generation.sessionSha256 &&
            roots?.length === 1 && roots[0]?.pid === generation.rootPid && roots[0].startIdentity === generation.rootStartIdentity, "Witness dispatch generation differs.");
        }, async (returned) => {
          this.returns.set(operationId, returned);
          settledReply = returned; settledText = canonicalJson(returned); working();
          await appendClosedSymbolEvent(journal, { step: "edit-witness", kind: "result", generation, requestSha256, data: { rawReturn: returned } });
          unchangedReply();
        });
      current(); need(raw === settledReply, "Witness settled reply changed after retention.");
      const qualified = controlScope === undefined ? undefined : validateAgedSymbolWitnessReadResult(extractToolPayload(raw), scope, controlScope);
      const observation = qualified?.witness ?? validateSymbolWitnessReadResult(extractToolPayload(raw), scope);
      need(canonicalJson(observation["startupActor"]) === canonicalJson(actor) && canonicalJson(observation["cachedActor"]) === canonicalJson(actor), "Witness actor differs from startup.");
      const afterCapture = await this.engine.captureClosedSessionAuthority(operationId, "closed-edit", 3);
      this.captures.set(`${operationId}:after`, afterCapture); extraCaptures.push(afterCapture); current();
      const after = await observed(await captureClockReader.call(this.engine, afterCapture)); current();
      need(afterCapture.operationId === operationId && afterCapture.phase === "closed-edit" && afterCapture.challengeAttempt === 3 &&
        after.observation.phase === "capture" && after.observation.base["bindingSha256"] === afterCapture.executionAuthority.bindingSha256 && after.observation.base["jobId"] === generation.jobId &&
        after.observation.base["helperInstance"] === generation.helperInstance && sha256Json(afterCapture.runtimeIdentity) === generation.runtimeSha256 &&
        sha256Json(afterCapture.bridgeSession) === generation.sessionSha256, "Witness native-after capture differs.");
      for (const entry of [launchClock.clock.before, launchClock.clock.after, before.clock.before, before.clock.after, after.clock.before, after.clock.after]) {
        need(entry.localOffsetMinutes === before.clock.before.localOffsetMinutes && entry.zoneRulesSha256 === before.clock.before.zoneRulesSha256 &&
          entry.qpcFrequency === before.clock.before.qpcFrequency, "Witness OS timezone or counter changed.");
      }
      const end = observation["rendererClockAfterMs"], offset = observation["rendererTimezoneOffsetMinutes"], start = observation["rendererClockBeforeMs"];
      need(typeof start === "number" && typeof end === "number" && typeof offset === "number", "Witness renderer clock missing.");
      const relation = compareRendererClockEndpoints({ nativeBefore: before.clock.before, nativeAfter: after.clock.after, plannedWindow,
        renderer: { schema: "private.renderer-clock-endpoints.v1", nowBeforeMs: start, nowAfterMs: end, isoBefore: new Date(start).toISOString(),
          isoAfter: new Date(end).toISOString(), offsetBeforeMinutes: offset, offsetAfterMinutes: offset } });
      const lower = Number((BigInt(before.clock.before.utcBeforeTicks) - EPOCH_TICKS) / 10_000n);
      const upper = Number((BigInt(after.clock.after.utcAfterTicks) - EPOCH_TICKS + 9999n) / 10_000n);
      for (const field of ["workerTimeBeforeMs", "workerTimeAfterMs"]) { const time = observation[field]; need(typeof time === "number" && time >= lower && time <= upper, "Witness worker clock is outside the native bracket."); }
      const client = observation["workerClient"], preDispatchMaxTicket = observation["workerMaxTicket"];
      need(typeof client === "string" && typeof preDispatchMaxTicket === "number", "Witness worker client or ticket missing.");
      const historicalRelations = [];
      let agedHead: SymbolSqlWitness["agedHead"];
      if (reference !== undefined) {
        need(qualified !== undefined && controlScope !== undefined && isRecord(reference.observation["reference"]), "Witness qualified main controls missing.");
        let previous = validateClockSample(reference.observation["nativeAfter"]);
        for (const sample of [launchClock.clock.before, launchClock.clock.after, before.clock.before, before.clock.after, after.clock.before, after.clock.after]) {
          need(sample.zoneRulesSha256 === previous.zoneRulesSha256 && sample.localOffsetMinutes === previous.localOffsetMinutes &&
            sample.qpcFrequency === previous.qpcFrequency && BigInt(sample.qpcBefore) >= BigInt(previous.qpcAfter) &&
            BigInt(sample.utcBeforeTicks) >= BigInt(previous.utcAfterTicks), "Witness main-reference to edit-generation clock continuity differs.");
          previous = sample;
        }
        const mainControls = reference.observation["reference"]["mainReference"];
        for (const controls of [qualified.controlsBefore, qualified.controlsAfter]) {
          historicalRelations.push(compareHistoricalSqlClock({ scope: controlScope, renderer: controls, mainReference: mainControls,
            nativeBefore: before.clock.before, nativeAfter: after.clock.after, plannedWindow }));
        }
        const historical = historicalRelations[0];
        need(historical !== undefined && plannedWindow.notBeforeMs - historical.appQ2UnderCommonOsPremiseMs >= 61_000,
          "Witness unlocked head is not old enough at the earliest allowed selection time.");
        agedHead = Object.freeze({ createdAtLiteral: baseline.createdAtLiteral, nativeParsedLocalMs: historical.rendererParsedCreatedAtMs,
          nativeTimezoneOffsetMinutes: historical.currentTimezoneOffsetMinutes });
      }
      const witness: Readonly<SymbolSqlWitness> = Object.freeze({ ...(agedHead === undefined ? {} : { agedHead }), projectUuid: journal.plan.projectUuid, branchUuid: journal.plan.branchUuid, actorUuid: actor.uuid,
        client, preDispatchMaxTicket, serverClockMinMs: plannedWindow.notBeforeMs, serverClockMaxMs: plannedWindow.notAfterMs, serverLocalOffsetMinutes: relation.localOffsetMinutes });
      const artifactSha256 = journal.artifacts.at(-1)?.sha256; need(typeof artifactSha256 === "string", "Witness raw result artifact missing.");
      const qualification = { profile: "private.closed-symbol-witness-clock-qualification.v1", operationId, generation, rawResultArtifactSha256: artifactSha256,
        ...(reference === undefined ? {} : { mainReference: reference, historicalRelations }),
        requestSha256, plannedWindow, beforeCapture, afterCapture, launchClock: launchClock.observation, beforeClock: before.observation, afterClock: after.observation, relation, witness,
        completionProved: false, executionAuthorized: false };
      need(Buffer.byteLength(JSON.stringify(qualification)) <= 59_999, "Witness qualification exceeds its fixed bound.");
      const clockArtifact = Object.freeze(await writePhaseArtifact(operationId, 20, "edit-witness-clock-qualification", qualification));
      current(); need(clockArtifact.path === qualificationPath, "Witness qualification path differs.");
      await artifactExact(clockArtifact); current();
      for (const retained of extraCaptures) { this.released.add(retained); await releaseCapture.call(this.engine, retained); current(); }
      await native(); await verifyWitnessNativeProfile(bundles.assetsRoot); current();
      await artifactExact(clockArtifact); current();
      if (reference !== undefined) { need(await revalidateOriginalMainReference(reference, this.engine, operationId) === reference, "Witness final main-reference evidence differs."); current(); }
      const final = await loadClosedSymbolJournal(operationId); current();
      need(canonicalJson(final.journal) === canonicalJson(journal), "Witness durable journal advanced or changed.");
      const result: OriginalClosedSymbolWitness = Object.freeze({ witness, expectedActor: actor, generation, artifactSha256, clockArtifact, clockArtifactSha256: clockArtifact.sha256,
        baselineCopyReceiptSha256: copy.receiptSha256, baselineLogicalSha256: inventory.logicalSha256, operationSha256: sha256Json(journal.plan.operation),
        executionAuthorized: false, completionProved: false });
      Object.assign(input.journal, journal);
      issued.set(result, { engine: this.engine, operationId, sealed: canonicalJson(result), result });
      return result;
    } catch (error) {
      // Consume cleanup before awaiting. An ambiguous release is never repeated.
      const errors: unknown[] = [error];
      for (const retained of extraCaptures) {
        if (!this.released.has(retained)) {
          this.released.add(retained);
          try { await releaseCapture.call(this.engine, retained); } catch (cleanupError) { errors.push(cleanupError); }
        }
      }
      if (errors.length > 1) { throw new AggregateError(errors, "Witness retained capture cleanup did not complete; never retry collection or release.", { cause: error }); }
      throw error;
    }
  }
}
