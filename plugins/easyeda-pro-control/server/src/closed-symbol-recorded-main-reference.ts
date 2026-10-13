/** PRIVATE historical exact-literal evidence. No invocation, registry or revived authority. */
/* oxlint-disable import/max-dependencies -- Fixed producer parsers and managed artifact reads, never a configurable issuer. */
import { join } from 'node:path';
import { operationPath, readExactUtf8Artifact } from './artifacts.ts';
import type { ArtifactDescriptor } from './artifacts.ts';
import type { ClosedJournal, PhaseEvent } from './closed-symbol-journal.ts';
import { canonicalJson, isRecord, sha256Json } from './core.ts';
import { readerCompletion } from './sqlite-inventory.ts';
import type { NativeSqlInventory } from './sqlite-inventory-core.ts';
import type { RecordedNativeSource } from './closed-symbol-recorded-native.ts';
import type { OriginalMainReference } from './closed-symbol-main-reference.ts';
import { MAIN_REFERENCE_PROFILE, validateMainReferenceRequest } from './closed-symbol-main-reference-program.ts';
import { WITNESS_NATIVE_PINS_SHA256 } from './closed-symbol-native-profile.ts';
import { validateClockSample } from './windows-clock-transport.ts';
import { validateRecordedBaselineTerminationEvidence } from './closed-symbol-recorded-baseline-termination.ts';
import { recordedUnlockedBaseline } from './closed-symbol-recorded-unlocked-baseline.ts';
import { compileMainReferenceV3Metadata } from './closed-symbol-main-reference-v3-metadata.ts';
import { validateMainReferenceTransportV3Result } from './closed-symbol-main-reference-v3-result.ts';
import { successfulRetainedMainReferenceText } from './closed-symbol-main-reference-result-envelope.ts';

type Bag = Readonly<Record<string, unknown>>;
const EPOCH = 621_355_968_000_000_000n;
function need(value: boolean): asserts value { if (!value) { throw new Error('Recorded main reference refused.'); } }
function exact(value: unknown, keys: readonly string[]): Bag {
  need(isRecord(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null) && Reflect.ownKeys(value).length === keys.length);
  const out: Record<string, unknown> = {};
  for (const key of keys) { const item = Object.getOwnPropertyDescriptor(value, key); need(item !== undefined && Object.hasOwn(item, 'value') && item.enumerable === true); out[key] = item.value as unknown; } return out;
}
function same(actual: unknown, expected: unknown): void { need(canonicalJson(actual) === canonicalJson(expected)); }
function hash(value: unknown): string { need(typeof value === 'string' && /^[a-f0-9]{64}$/u.test(value)); return value; }
function freeze<T>(value: T): T { if (value !== null && typeof value === 'object') { for (const child of Object.values(value)) { freeze(child); } Object.freeze(value); } return value; }
function timestamp(value: unknown): number {
  need(typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3,7}Z$/u.test(value));
  const time = Date.parse(value); need(Number.isFinite(time) && new Date(time).toISOString() === `${value.slice(0, 23)}Z`); return time;
}
function descriptor(value: unknown, expected: string, limit: number): ArtifactDescriptor {
  const data = exact(value, ['path', 'bytes', 'sha256']); need(data['path'] === expected && typeof data['bytes'] === 'number' && Number.isSafeInteger(data['bytes']) && data['bytes'] > 0 && data['bytes'] <= limit);
  return { path: expected, bytes: data['bytes'], sha256: hash(data['sha256']) };
}
function phase(journal: ClosedJournal, events: readonly PhaseEvent[], sequence: number, step: PhaseEvent['step'], kind: PhaseEvent['kind']): PhaseEvent {
  const value = events[sequence - 1]; const file = journal.artifacts[sequence - 1];
  need(value !== undefined && file !== undefined && value.sequence === sequence && value.step === step && value.kind === kind && value.operationId === journal.operationId &&
    value.closedPlanSha256 === journal.closedPlanSha256 && value.markerSha256 === journal.markerSha256 && value.dataSha256 === sha256Json(value.data));
  descriptor(file, join(operationPath(journal.operationId).slice(0, -5), `${String(sequence).padStart(2, '0')}-${step}-${kind}.json`), 60_000); return value;
}
function pair(intent: PhaseEvent, result: PhaseEvent): void { need(intent.requestSha256 === sha256Json(intent.data) && result.requestSha256 === intent.requestSha256); same(intent.generation, result.generation); }

/** Call only with the fixed phase-loader output and a newly completed historical
 * baseline copy inventory. This replays a subset, not a whole terminal verdict.
 * Retained native raw-order hashes stay opaque. The main handshake/prepared
 * manifest are source-checked by the original transport but not returned as raw
 * artifacts; this reader must not claim to reconstruct those unretained bytes. */
export async function reconstructRecordedMainReference(input: Readonly<{
  journal: ClosedJournal; events: readonly PhaseEvent[]; baselineInventory: NativeSqlInventory; nativeSource: RecordedNativeSource;
  mainReferenceIntent: ArtifactDescriptor; mainReferenceResult: ArtifactDescriptor;
}>): Promise<Readonly<{ result: OriginalMainReference; resultSha256: string; baselineTermination: Bag;
  historicalEvidenceVerified: true; rawBasePropertyOrderReconstructed: false; preparedManifestReconstructed: false; handshakeArtifactReconstructed: false;
  authorityRestored: false; executionAuthorized: false; completionProved: false }>> {
  const { journal, events, baselineInventory, nativeSource } = input;
  const captured = canonicalJson({ journal, events, nativeSource, intent: input.mainReferenceIntent, result: input.mainReferenceResult });
  const unchanged = (): void => { need(input.journal === journal && input.events === events && input.baselineInventory === baselineInventory && input.nativeSource === nativeSource &&
    readerCompletion(baselineInventory).exitCode === 0 && captured === canonicalJson({ journal, events, nativeSource, intent: input.mainReferenceIntent, result: input.mainReferenceResult })); };
  need(events.length >= 10 && events.length <= 44 && journal.artifacts.length === events.length && journal.sequence === events.length && journal.plan.nativePinsSha256 === WITNESS_NATIVE_PINS_SHA256); unchanged();
  const directory = operationPath(journal.operationId).slice(0, -5);
  const intentArtifact = descriptor(input.mainReferenceIntent, join(directory, '10-baseline-main-reference-intent.json'), 60_000);
  const resultArtifact = descriptor(input.mainReferenceResult, join(directory, '10-baseline-main-reference-result.json'), 196_608);
  const launchEvent = phase(journal, events, 2, 'baseline-launch', 'result');
  const admissionIntent = phase(journal, events, 3, 'baseline-admission', 'intent'); const admissionEvent = phase(journal, events, 4, 'baseline-admission', 'result');
  const closeIntent = phase(journal, events, 7, 'baseline-close', 'intent'); const closeEvent = phase(journal, events, 8, 'baseline-close', 'result');
  const copyIntent = phase(journal, events, 9, 'baseline-copy', 'intent'); const copyEvent = phase(journal, events, 10, 'baseline-copy', 'result');
  // Admission moves partial launch evidence to a full capture; it cannot use pair().
  need(admissionIntent.requestSha256 === sha256Json(admissionIntent.data) && admissionEvent.requestSha256 === admissionIntent.requestSha256);
  pair(closeIntent, closeEvent); pair(copyIntent, copyEvent);
  const generation = admissionEvent.generation; need(generation !== null && 'captureSha256' in generation && generation.ordinal === 0);
  for (const value of [closeIntent, closeEvent, copyIntent, copyEvent]) { same(value.generation, generation); }
  const launch = exact(launchEvent.data, ['launchReceipt', 'launchReceiptSha256']);
  const launchBody = { jobId: generation.jobId, helperInstance: generation.helperInstance, root: { pid: generation.rootPid, role: 'easyeda-main', startIdentity: generation.rootStartIdentity } };
  same(launch, { launchReceipt: launchBody, launchReceiptSha256: sha256Json(launchBody) });
  const admitted = exact(admissionEvent.data, ['capture', 'captureSha256']); need(admitted['captureSha256'] === generation.captureSha256 && sha256Json(admitted['capture']) === generation.captureSha256);
  const admissionRequest = exact(admissionIntent.data, ['profile', 'operationId', 'phase', 'closedPlanSha256', 'launchReceiptSha256', 'capturePhase', 'challengeAttempt', 'bridgeDispatch']);
  same(admissionRequest, { profile: 'easyeda-pro-control.closed-symbol-admission-request.v1', operationId: journal.operationId, phase: 'baseline-admission',
    closedPlanSha256: journal.closedPlanSha256, launchReceiptSha256: sha256Json(launchBody), capturePhase: 'closed-baseline', challengeAttempt: 1, bridgeDispatch: admissionRequest['bridgeDispatch'] });
  const copyRequest = exact(copyIntent.data, ['proof', 'checkpoint', 'source', 'generation']); same(copyRequest['generation'], generation); need(copyRequest['source'] === journal.plan.projectPath);
  const copyData = exact(copyEvent.data, ['copyReceipt', 'sqlDigests']); need(isRecord(copyData['copyReceipt']));
  const copy = copyData['copyReceipt']; hash(copy['receiptSha256']);
  const baseline = await recordedUnlockedBaseline(journal, copyEvent, baselineInventory); unchanged();
  const intentRaw = await readExactUtf8Artifact(intentArtifact); unchanged();
  const intent = exact(JSON.parse(intentRaw.text) as unknown, ['profile', 'request', 'resultPath', 'commandSha256', 'mainSha256', 'sourcePins', 'runtimePinsSha256', 'baselineClock', 'helperIdentity', 'stdinProfile', 'stdinSha256', 'windowsSideEffects', 'executionAuthorized']);
  need(intent['profile'] === 'private.main-reference-intent.v3');
  const termination = validateRecordedBaselineTerminationEvidence({ journal, generation, capture: admitted['capture'], bridgeDispatch: admissionRequest['bridgeDispatch'], terminationClock: intent['baselineClock'], closedProof: copyRequest['proof'], source: nativeSource });
  need(copy['closureProofSha256'] === termination.proof['proofSha256']);
  const close = exact(closeIntent.data, ['intent', 'capture', 'launch']); same(close['capture'], admitted['capture']); same(close['launch'], launchBody);
  const closeBody = exact(close['intent'], ['schema', 'operationId', 'phase', 'challengeAttempt', 'authoritySha256', 'captureBindingSha256', 'launchSha256', 'bridgeSessionSha256', 'runtimeIdentitySha256', 'helperInstance', 'jobId', 'windowHandle', 'preparedAt', 'policyId', 'policySha256', 'closeIntentSha256']);
  need(isRecord(admitted['capture']) && isRecord(admitted['capture']['executionAuthority'])); const authority = admitted['capture']['executionAuthority'];
  const expectedClose = { schema: 'easyeda-pro-control.closed-session-close-intent.v1', operationId: journal.operationId, phase: 'closed-baseline', challengeAttempt: 1,
    authoritySha256: authority['authoritySha256'], captureBindingSha256: authority['bindingSha256'], launchSha256: sha256Json(launchBody), bridgeSessionSha256: generation.sessionSha256,
    runtimeIdentitySha256: generation.runtimeSha256, helperInstance: generation.helperInstance, jobId: generation.jobId, windowHandle: closeBody['windowHandle'], preparedAt: closeBody['preparedAt'], policyId: authority['policyId'], policySha256: authority['policySha256'] };
  need(typeof closeBody['windowHandle'] === 'string' && /^[1-9]\d{0,18}$/u.test(closeBody['windowHandle'])); timestamp(closeBody['preparedAt']);
  same(closeBody, { ...expectedClose, closeIntentSha256: sha256Json(expectedClose) }); need(termination.proof['closeIntentSha256'] === closeBody['closeIntentSha256']);
  const receiptBody = { schema: 'easyeda-pro-control.closed-session-close-dispatch.v1', closeIntentSha256: closeBody['closeIntentSha256'], closeDispatched: true, saveOrDiscardSelected: false, terminationProved: false };
  const receipt = { ...receiptBody, closeReceiptSha256: sha256Json(receiptBody) };
  same(closeEvent.data, { closeIntentSha256: closeBody['closeIntentSha256'], closeReceipt: receipt, closeReceiptSha256: sha256Json(receipt) }); need(termination.proof['closeReceiptSha256'] === receipt.closeReceiptSha256);
  need(isRecord(termination.termination['clock'])); const baselineAfter = validateClockSample(termination.termination['clock']['after']);
  const request = validateMainReferenceRequest(intent['request']);
  same(request, { profile: MAIN_REFERENCE_PROFILE, nonce: request.nonce, operationId: journal.operationId, closedPlanSha256: journal.closedPlanSha256,
    baselineCopyReceiptSha256: copy['receiptSha256'], baselineLogicalSha256: baselineInventory.logicalSha256, baselineClosureClockSha256: sha256Json(intent['baselineClock']),
    nativePinsSha256: journal.plan.nativePinsSha256, historyUuid: baseline.historyUuid, createdAtLiteral: baseline.createdAtLiteral, referenceUtcMs: Number((BigInt(baselineAfter.utcBeforeTicks) - EPOCH) / 10_000n) });
  const metadata = await compileMainReferenceV3Metadata(request); unchanged();
  same(intent, { profile: 'private.main-reference-intent.v3', request, resultPath: resultArtifact.path, commandSha256: metadata.commandSha256, mainSha256: metadata.mainSha256,
    sourcePins: metadata.sourcePins, runtimePinsSha256: metadata.runtimePinsSha256, baselineClock: intent['baselineClock'],
    helperIdentity: metadata.helperIdentity, stdinProfile: metadata.stdinProfile, stdinSha256: metadata.stdinSha256,
    windowsSideEffects: 'one disjoint nonce scratch copy and one owned synthetic Job; no EasyEDA app/profile input', executionAuthorized: false });
  const resultRaw = await readExactUtf8Artifact(resultArtifact); unchanged();
  // The unchanged observer retains its v2 envelope. Current-manifest native
  // Reconstruction separately requires v3 identity/intent/output, never a
  // Serialized legacy-profile fallback. Legacy metadata and raw data stay old.
  const retained = successfulRetainedMainReferenceText(JSON.parse(resultRaw.text) as unknown, metadata.requestSha256, intentArtifact.sha256);
  const observation = validateMainReferenceTransportV3Result(JSON.parse(retained.text) as unknown, metadata);
  const before = validateClockSample(observation['nativeBefore']); const after = validateClockSample(observation['nativeAfter']);
  for (const sample of [before, after]) { need(sample.zoneRulesSha256 === baselineAfter.zoneRulesSha256 && sample.localOffsetMinutes === baselineAfter.localOffsetMinutes && sample.qpcFrequency === baselineAfter.qpcFrequency); }
  need(BigInt(before.qpcBefore) >= BigInt(baselineAfter.qpcAfter) && BigInt(before.utcBeforeTicks) >= BigInt(baselineAfter.utcAfterTicks));
  await readExactUtf8Artifact(resultArtifact); unchanged(); await readExactUtf8Artifact(intentArtifact); unchanged();
  const result: OriginalMainReference = { profile: 'private.original-main-reference.v1', operationId: journal.operationId, request, observation, intentArtifact, resultArtifact,
    baselineCopyReceiptSha256: hash(copy['receiptSha256']), baselineLogicalSha256: baselineInventory.logicalSha256, operationSha256: sha256Json(journal.plan.operation), appClockDirectlyObserved: false, executionAuthorized: false };
  return freeze(structuredClone({ result, resultSha256: sha256Json(result), baselineTermination: termination.termination, historicalEvidenceVerified: true as const,
    rawBasePropertyOrderReconstructed: false as const, preparedManifestReconstructed: false as const, handshakeArtifactReconstructed: false as const,
    authorityRestored: false as const, executionAuthorized: false as const, completionProved: false as const }));
}
