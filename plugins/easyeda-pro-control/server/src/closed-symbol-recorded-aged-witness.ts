/** PRIVATE historical aged-witness reconstruction. No issuer, runtime or resumed action. */
/* oxlint-disable import/max-dependencies -- Replay the fixed producer parsers directly; no owner lookup or configurable callback is imported. */
import { join } from 'node:path';
import { operationPath } from './artifacts.ts';
import type { ArtifactDescriptor } from './artifacts.ts';
import type { ClosedJournal, Generation, PhaseEvent } from './closed-symbol-journal.ts';
import { canonicalJson, extractToolPayload, isRecord, sha256Json, sha256Text } from './core.ts';
import { readWitnessClockArtifact } from './closed-sql-bindings.ts';
import { buildStartupProgram, validateStartupResult } from './closed-symbol-startup-program.ts';
import { buildAgedSymbolWitnessReadExpression, validateAgedSymbolWitnessReadResult } from './aged-symbol-witness.ts';
import { validateActorProjection } from './symbol-dual-actor.ts';
import { compareRendererClockEndpoints } from './renderer-clock-endpoints.ts';
import { validateClockSample } from './windows-clock-transport.ts';
import { readerCompletion } from './sqlite-inventory.ts';
import type { NativeSqlInventory } from './sqlite-inventory-core.ts';
import type { OriginalClosedSymbolWitness } from './closed-symbol-witness.ts';
import type { SymbolSqlWitness } from './symbol-sql-comparator.ts';
import { reconstructRecordedMainReference } from './closed-symbol-recorded-main-reference.ts';
import type { RecordedNativeSource } from './closed-symbol-recorded-native.ts';
import { validateRecordedCaptureEvidence } from './closed-symbol-recorded-native.ts';
import { reconstructRecordedAgedClock } from './closed-symbol-recorded-aged-clock.ts';

type Bag = Record<string, unknown>;
const EPOCH = 621_355_968_000_000_000n, HASH = /^[a-f0-9]{64}$/u;
function need(value: boolean): asserts value { if (!value) { throw new Error('Recorded aged witness refused.'); } }
function exact(value: unknown, keys: readonly string[]): Bag {
  need(isRecord(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null) && Reflect.ownKeys(value).length === keys.length);
  const result: Bag = {};
  for (const key of keys) { const item = Object.getOwnPropertyDescriptor(value, key); need(item !== undefined && Object.hasOwn(item, 'value')); result[key] = item.value as unknown; }
  return result;
}
function hash(value: unknown): string { need(typeof value === 'string' && HASH.test(value)); return value; }
function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object') { for (const item of Object.values(value)) { deepFreeze(item); } Object.freeze(value); }
  return value;
}
function event(journal: ClosedJournal, events: readonly PhaseEvent[], sequence: number, step: PhaseEvent['step'], kind: PhaseEvent['kind']): PhaseEvent {
  const value = events[sequence - 1];
  need(value !== undefined && value.sequence === sequence && value.step === step && value.kind === kind && value.operationId === journal.operationId &&
    value.closedPlanSha256 === journal.closedPlanSha256 && value.markerSha256 === journal.markerSha256 && value.dataSha256 === sha256Json(value.data));
  const descriptor = journal.artifacts[sequence - 1]; need(descriptor !== undefined && descriptor.bytes > 0 && descriptor.bytes <= 60_000);
  need(descriptor.path === join(operationPath(journal.operationId).slice(0, -5), `${String(sequence).padStart(2, '0')}-${step}-${kind}.json`));
  hash(descriptor.sha256); return value;
}
function paired(intent: PhaseEvent, result: PhaseEvent): void {
  need(intent.requestSha256 === sha256Json(intent.data) && result.requestSha256 === intent.requestSha256 &&
    canonicalJson(intent.generation) === canonicalJson(result.generation));
}
function capture(value: unknown, operationId: string, generation: Generation, attempt: number): Bag {
  const v = exact(value, ['operationId', 'phase', 'challengeAttempt', 'bridgeSession', 'runtimeIdentity', 'executionAuthority']);
  need(v['operationId'] === operationId && v['phase'] === 'closed-edit' && v['challengeAttempt'] === attempt &&
    sha256Json(v['bridgeSession']) === generation.sessionSha256 && sha256Json(v['runtimeIdentity']) === generation.runtimeSha256);
  const a = exact(v['executionAuthority'], ['schema', 'bindingSha256', 'policyId', 'policySha256', 'capturedAt', 'processes', 'processTreeSha256', 'authoritySha256']);
  const { authoritySha256, ...body } = a; need(authoritySha256 === sha256Json(body) && a['schema'] === 'easyeda-pro-control.execution-authority.v1' &&
    a['policyId'] === 'windows.easyeda-contained-local-api.v1' && a['processTreeSha256'] === sha256Json(a['processes']));
  hash(a['bindingSha256']); hash(a['policySha256']);
  need(typeof a['capturedAt'] === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3,7}Z$/u.test(a['capturedAt']) && Number.isFinite(Date.parse(a['capturedAt'])));
  const processes = a['processes']; need(Array.isArray(processes) && processes.length > 0 && processes.length <= 512);
  let previous = 0, root = 0;
  for (const process of processes) {
    const p = exact(process, ['pid', 'role', 'startIdentity']); const pid = p['pid']; const identity = p['startIdentity'];
    need(typeof pid === 'number' && Number.isSafeInteger(pid) && pid > previous && pid <= 2_147_483_647 && typeof identity === 'string' &&
      new RegExp(`^win32:\\d{15,20}:job:${generation.jobId}$`, 'u').test(identity)); previous = pid;
    need(['easyeda-main', 'easyeda-descendant', 'renderer', 'native-socket-owner'].includes(String(p['role'])));
    if (p['role'] === 'easyeda-main') { root += 1; need(pid === generation.rootPid && identity === generation.rootStartIdentity); }
  }
  need(root === 1); return v;
}
function clock(value: unknown, phase: 'launch' | 'capture', generation: Generation): Readonly<{ data: Bag; base: Bag; owner: Bag; before: ReturnType<typeof validateClockSample>; after: ReturnType<typeof validateClockSample> }> {
  const v = exact(value, ['schema', 'phase', 'baseSha256', 'helperSourceSha256', 'executionScopeSha256', 'base', 'clock', 'producerBindingVerified', 'executionAuthorized', 'ownerBinding']);
  need(v['schema'] === 'easyeda-pro-control.owned-clock-attachment.v1' && v['phase'] === phase &&
    v['producerBindingVerified'] === false && v['executionAuthorized'] === false);
  // The native transport hashes raw JSON property order, then normalizes base.
  // Retain that opaque hash under the whole artifact digest; do not claim its
  // Original ordering can be reconstructed from the normalized stored object.
  hash(v['baseSha256']);
  hash(v['helperSourceSha256']); hash(v['executionScopeSha256']);
  const base = exact(v['base'], phase === 'launch' ? ['jobId', 'helperInstance', 'root'] : ['jobId', 'helperInstance', 'bindingSha256', 'capturedAt', 'processes', 'runtimePid', 'socketOwnerPid']);
  need(base['jobId'] === generation.jobId && base['helperInstance'] === generation.helperInstance);
  const owner = exact(v['ownerBinding'], phase === 'launch' ? ['executable', 'executableSha256', 'launchSha256'] :
    ['operationId', 'phase', 'challengeAttempt', 'bindingSha256', 'bridgeSessionSha256', 'runtimeIdentitySha256', 'authoritySha256']);
  const observed = exact(v['clock'], ['status', 'tzAbsentBefore', 'tzAbsentAfter', 'before', 'after']);
  need(observed['status'] === 'observed' && observed['tzAbsentBefore'] === true && observed['tzAbsentAfter'] === true);
  const before = validateClockSample(observed['before']); const after = validateClockSample(observed['after']);
  need(BigInt(after.utcBeforeTicks) >= BigInt(before.utcAfterTicks) && BigInt(after.qpcBefore) >= BigInt(before.qpcAfter));
  return { data: v, base, owner, before, after };
}
function captureClock(value: ReturnType<typeof clock>, retained: Bag, operationId: string, generation: Generation, attempt: number): void {
  const authority = retained['executionAuthority']; need(isRecord(authority));
  need(canonicalJson(value.owner) === canonicalJson({ operationId, phase: 'closed-edit', challengeAttempt: attempt,
    bindingSha256: authority['bindingSha256'], bridgeSessionSha256: generation.sessionSha256, runtimeIdentitySha256: generation.runtimeSha256,
    authoritySha256: authority['authoritySha256'] }) && value.base['bindingSha256'] === authority['bindingSha256'] &&
    value.base['capturedAt'] === authority['capturedAt'] && canonicalJson(value.base['processes']) === canonicalJson(authority['processes']));
  const identity = retained['runtimeIdentity']; need(isRecord(identity) && value.base['runtimePid'] === identity['processId']);
  const rows = value.base['processes']; need(Array.isArray(rows));
  for (const key of ['runtimePid', 'socketOwnerPid']) {
    const pid = value.base[key]; need(pid === null || (typeof pid === 'number' && Number.isSafeInteger(pid) && pid > 0 && rows.some(entry => isRecord(entry) && entry['pid'] === pid)));
  }
}

/** Input phases must come from the fixed integrity-checked phase-only loader;
 * the inventory must be a fresh completed historical-copy read. This leaf adds
 * semantic reconstruction, not authentication of arbitrary self-hashed records.
 * It reads only the operation-owned qualification, never the project itself. */
export async function reconstructRecordedAgedSymbolWitness(input: Readonly<{ journal: ClosedJournal; events: readonly PhaseEvent[]; baselineInventory: NativeSqlInventory; nativeSource: RecordedNativeSource; mainReferenceIntent: ArtifactDescriptor; mainReferenceResult: ArtifactDescriptor }>): Promise<Readonly<{
  result: OriginalClosedSymbolWitness; resultSha256: string; qualification: Readonly<Bag>;
  historicalEvidenceVerified: true; rawBasePropertyOrderReconstructed: false; authorityRestored: false; executionAuthorized: false; completionProved: false;
}>> {
  const { journal, events, baselineInventory } = input, sealed = canonicalJson({ journal, events, nativeSource: input.nativeSource, intent: input.mainReferenceIntent, result: input.mainReferenceResult });
  need(events.length >= 21 && events.length <= 44 && journal.artifacts.length === events.length && readerCompletion(baselineInventory).exitCode === 0);
  const unchanged = (): void => { need(input.journal === journal && input.events === events && input.baselineInventory === baselineInventory &&
    canonicalJson({ journal, events, nativeSource: input.nativeSource, intent: input.mainReferenceIntent, result: input.mainReferenceResult }) === sealed && readerCompletion(baselineInventory).exitCode === 0); };
  const baseline = event(journal, events, 10, 'baseline-copy', 'result');
  const reconstructedReference = await reconstructRecordedMainReference(input); unchanged();
  const reference = reconstructedReference.result;
  const literal = reference.request.createdAtLiteral; const controlScope = { createdAtLiteral: literal, referenceUtcMs: reference.request.referenceUtcMs };
  const launchEvent = event(journal, events, 12, 'edit-launch', 'result'); const admissionEvent = event(journal, events, 14, 'edit-admission', 'result');
  const admissionIntent = event(journal, events, 13, 'edit-admission', 'intent');
  const admissionRequest = exact(admissionIntent.data, ['profile', 'operationId', 'phase', 'closedPlanSha256', 'launchReceiptSha256', 'capturePhase', 'challengeAttempt', 'bridgeDispatch']);
  need(admissionIntent.requestSha256 === sha256Json(admissionRequest) && admissionEvent.requestSha256 === admissionIntent.requestSha256 &&
    admissionRequest['profile'] === 'easyeda-pro-control.closed-symbol-admission-request.v1' && admissionRequest['operationId'] === journal.operationId &&
    admissionRequest['phase'] === 'edit-admission' && admissionRequest['closedPlanSha256'] === journal.closedPlanSha256 &&
    admissionRequest['capturePhase'] === 'closed-edit' && admissionRequest['challengeAttempt'] === 1);
  const startupIntent = event(journal, events, 15, 'edit-marker-read', 'intent'), startupResult = event(journal, events, 16, 'edit-marker-read', 'result');
  const intent = event(journal, events, 19, 'edit-witness', 'intent'), rawEvent = event(journal, events, 20, 'edit-witness', 'result');
  const writeIntent = event(journal, events, 21, 'edit-write', 'intent'); paired(intent, rawEvent); paired(startupIntent, startupResult);
  const generation = rawEvent.generation; need(generation !== null && 'captureSha256' in generation && generation.ordinal === 1 &&
    [admissionEvent, startupIntent, startupResult, writeIntent].every(value => canonicalJson(value.generation) === canonicalJson(generation)));
  const admitted = exact(admissionEvent.data, ['capture', 'captureSha256']);
  const admission = capture(admitted['capture'], journal.operationId, generation, 1);
  validateRecordedCaptureEvidence({ journal, generation, capture: admission, phase: 'closed-edit', attempt: 1,
    bridgeDispatch: admissionRequest['bridgeDispatch'], source: input.nativeSource });
  need(admitted['captureSha256'] === generation.captureSha256 && sha256Json(admission) === generation.captureSha256);
  const request = exact(intent.data, ['profile', 'scope', 'plannedWindow', 'expectedActor', 'mainReference', 'codeSha256', 'qualificationPath',
    'baselineCopyReceiptSha256', 'baselineLogicalSha256', 'operationSha256', 'launchClock', 'beforeCapture', 'beforeClock']);
  const scope = { projectUuid: journal.plan.projectUuid, branchUuid: journal.plan.branchUuid, ownerUuid: journal.plan.ownerUuid,
    targetUuid: journal.plan.targetUuid, activeUuid: journal.plan.activeUuid, createdAtLiteral: literal };
  need(request['profile'] === 'private.closed-symbol-witness-request.v1' && canonicalJson(request['scope']) === canonicalJson(scope) && canonicalJson(request['mainReference']) === canonicalJson(reference));
  const startupInput = { phase: 'edit-marker-read' as const, projectUuid: journal.plan.projectUuid, branchUuid: journal.plan.branchUuid,
    ownerUuid: journal.plan.ownerUuid, marker: journal.plan.marker };
  const startupCodeSha256 = sha256Text(buildStartupProgram(startupInput));
  need(canonicalJson(startupIntent.data) === canonicalJson({ profile: 'easyeda-pro-control.closed-symbol-startup-request.v1', input: startupInput,
    codeSha256: startupCodeSha256, directMainFrameOnly: true }));
  const startupRaw = exact(startupResult.data, ['rawReturn'])['rawReturn'];
  const startup = validateStartupResult(extractToolPayload(startupRaw), startupInput);
  need(startup['ok'] === true && Array.isArray(startup['observations'])); const first = startup['observations'][0] as unknown;
  need(isRecord(first) && isRecord(first['observation'])); const actor = validateActorProjection(first['observation']['startupActor']);
  const witnessRaw = exact(rawEvent.data, ['rawReturn'])['rawReturn'];
  const code = `return await ${buildAgedSymbolWitnessReadExpression(scope, controlScope, actor)}`;
  need(request['codeSha256'] === sha256Text(code));
  const qualified = validateAgedSymbolWitnessReadResult(extractToolPayload(witnessRaw), scope, controlScope);
  const observation = qualified.witness;
  need(canonicalJson(request['expectedActor']) === canonicalJson(actor) && canonicalJson(observation['startupActor']) === canonicalJson(actor) && canonicalJson(observation['cachedActor']) === canonicalJson(actor));
  const w = exact(writeIntent.data, ['profile', 'witnessArtifactSha256', 'witnessClockArtifactSha256', 'witnessClockArtifact', 'preparedSqlPlanSha256', 'metadataPlanSha256', 'codeSha256', 'context', 'sameOriginalClockWindow']);
  need(w['profile'] === 'private.closed-symbol-write-request.v1' && w['sameOriginalClockWindow'] === true && writeIntent.requestSha256 === sha256Json(writeIntent.data));
  const d = exact(w['witnessClockArtifact'], ['path', 'bytes', 'sha256']);
  need(typeof d['path'] === 'string' && typeof d['bytes'] === 'number' && Number.isSafeInteger(d['bytes']) && d['bytes'] > 0 && d['bytes'] <= 60_000);
  const clockArtifact: ArtifactDescriptor = { path: d['path'], bytes: d['bytes'], sha256: hash(d['sha256']) };
  need(clockArtifact.path === request['qualificationPath'] && clockArtifact.sha256 === w['witnessClockArtifactSha256']);
  const qualification = await readWitnessClockArtifact(journal.operationId, clockArtifact, clockArtifact.sha256); unchanged();
  const q = exact(qualification, ['profile', 'operationId', 'generation', 'rawResultArtifactSha256', 'mainReference', 'historicalRelations', 'requestSha256', 'plannedWindow', 'beforeCapture', 'afterCapture', 'launchClock', 'beforeClock', 'afterClock', 'relation', 'witness', 'completionProved', 'executionAuthorized']);
  const rawArtifact = journal.artifacts[19]; need(rawArtifact !== undefined && w['witnessArtifactSha256'] === rawArtifact.sha256);
  const baselineData = exact(baseline.data, ['copyReceipt', 'sqlDigests']); need(isRecord(baselineData['copyReceipt']));
  const copyHash = hash(baselineData['copyReceipt']['receiptSha256']);
  need(request['baselineCopyReceiptSha256'] === copyHash && request['baselineLogicalSha256'] === baselineInventory.logicalSha256 && request['operationSha256'] === sha256Json(journal.plan.operation));
  const beforeCapture = capture(q['beforeCapture'], journal.operationId, generation, 2); const afterCapture = capture(q['afterCapture'], journal.operationId, generation, 3);
  validateRecordedCaptureEvidence({ journal, generation, capture: beforeCapture, phase: 'closed-edit', attempt: 2,
    bridgeDispatch: admissionRequest['bridgeDispatch'], source: input.nativeSource, clock: q['beforeClock'] });
  validateRecordedCaptureEvidence({ journal, generation, capture: afterCapture, phase: 'closed-edit', attempt: 3,
    bridgeDispatch: admissionRequest['bridgeDispatch'], source: input.nativeSource, clock: q['afterClock'] });
  const launch = clock(q['launchClock'], 'launch', generation); const before = clock(q['beforeClock'], 'capture', generation); const after = clock(q['afterClock'], 'capture', generation);
  captureClock(before, beforeCapture, journal.operationId, generation, 2); captureClock(after, afterCapture, journal.operationId, generation, 3);
  const launchData = exact(launchEvent.data, ['launchReceipt', 'launchReceiptSha256']);
  need(canonicalJson(launch.base) === canonicalJson(launchData['launchReceipt']) && launchData['launchReceiptSha256'] === sha256Json(launch.base) &&
    launch.owner['launchSha256'] === sha256Json(launch.base) && admissionRequest['launchReceiptSha256'] === sha256Json(launch.base) &&
    canonicalJson(launch.base['root']) === canonicalJson({ pid: generation.rootPid, role: 'easyeda-main', startIdentity: generation.rootStartIdentity }));
  hash(launch.owner['executableSha256']); need(typeof launch.owner['executable'] === 'string' && /^[A-Za-z]:\\[^"\r\n]+\.exe$/u.test(launch.owner['executable']));
  need(launch.owner['executable'] === input.nativeSource.executable && launch.owner['executableSha256'] === input.nativeSource.executableSha256);
  const policySha256 = sha256Json({ schema: 'easyeda-pro-control.windows-authority-helper.v1', policyId: 'windows.easyeda-contained-local-api.v1',
    helperSha256: launch.data['helperSourceSha256'], expectedExecutableSha256: launch.owner['executableSha256'], reviewedExecutionScopeSha256: launch.data['executionScopeSha256'],
    containment: 'atomic-launch-job-list:no-breakaway:no-kill-on-close:retained-handles', excluded: 'outside-job-brokers-services-and-unreviewed-delegation' });
  for (const retained of [admission, beforeCapture, afterCapture]) {
    need(isRecord(retained['executionAuthority']) && retained['executionAuthority']['policySha256'] === policySha256 &&
      retained['executionAuthority']['bindingSha256'] === sha256Json({ schema: 'easyeda-pro-control.closed-session-authority-binding.v1',
        operationId: journal.operationId, phase: 'closed-edit', challengeAttempt: retained['challengeAttempt'], bridgeSession: retained['bridgeSession'],
        bridgeDispatch: admissionRequest['bridgeDispatch'], runtimeIdentity: retained['runtimeIdentity'] }));
  }
  for (const item of [launch, before, after]) {
    need(item.data['helperSourceSha256'] === before.data['helperSourceSha256'] && item.data['executionScopeSha256'] === before.data['executionScopeSha256']);
    for (const sample of [item.before, item.after]) { need(sample.localOffsetMinutes === before.before.localOffsetMinutes && sample.zoneRulesSha256 === before.before.zoneRulesSha256 && sample.qpcFrequency === before.before.qpcFrequency); }
  }
  const plannedWindow = { notBeforeMs: Number((BigInt(before.before.utcBeforeTicks) - EPOCH) / 10_000n), notAfterMs: Number((BigInt(before.before.utcBeforeTicks) - EPOCH) / 10_000n) + 60_000 };
  const start = observation['rendererClockBeforeMs']; const end = observation['rendererClockAfterMs']; const offset = observation['rendererTimezoneOffsetMinutes'];
  need(typeof start === 'number' && typeof end === 'number' && typeof offset === 'number');
  const relation = compareRendererClockEndpoints({ nativeBefore: before.before, nativeAfter: after.after, plannedWindow, renderer: {
    schema: 'private.renderer-clock-endpoints.v1', nowBeforeMs: start, nowAfterMs: end, isoBefore: new Date(start).toISOString(), isoAfter: new Date(end).toISOString(), offsetBeforeMinutes: offset, offsetAfterMinutes: offset } });
  const upper = Number((BigInt(after.after.utcAfterTicks) - EPOCH + 9999n) / 10_000n);
  for (const key of ['workerTimeBeforeMs', 'workerTimeAfterMs']) { const time = observation[key]; need(typeof time === 'number' && time >= plannedWindow.notBeforeMs && time <= upper); }
  const client = observation['workerClient'], preDispatchMaxTicket = observation['workerMaxTicket']; need(typeof client === 'string' && typeof preDispatchMaxTicket === 'number');
  const { agedHead, historicalRelations } = reconstructRecordedAgedClock({ reference, controlsBefore: qualified.controlsBefore, controlsAfter: qualified.controlsAfter,
    editClockSamples: [launch.before, launch.after, before.before, before.after, after.before, after.after], plannedWindow });
  const witness: Readonly<SymbolSqlWitness> = { agedHead, projectUuid: journal.plan.projectUuid, branchUuid: journal.plan.branchUuid, actorUuid: actor.uuid, client,
    preDispatchMaxTicket, serverClockMinMs: plannedWindow.notBeforeMs, serverClockMaxMs: plannedWindow.notAfterMs, serverLocalOffsetMinutes: relation.localOffsetMinutes };
  need(canonicalJson(q) === canonicalJson({ profile: 'private.closed-symbol-witness-clock-qualification.v1', operationId: journal.operationId, generation,
    rawResultArtifactSha256: rawArtifact.sha256, mainReference: reference, historicalRelations, requestSha256: intent.requestSha256, plannedWindow, beforeCapture, afterCapture,
    launchClock: request['launchClock'], beforeClock: request['beforeClock'], afterClock: q['afterClock'], relation, witness, completionProved: false, executionAuthorized: false }) &&
    canonicalJson(request['beforeCapture']) === canonicalJson(beforeCapture) && canonicalJson(request['plannedWindow']) === canonicalJson(plannedWindow));
  const revalidated = await reconstructRecordedMainReference(input); unchanged(); need(revalidated.resultSha256 === sha256Json(reference));
  const result: OriginalClosedSymbolWitness = deepFreeze(structuredClone({ witness, expectedActor: actor, generation, artifactSha256: rawArtifact.sha256,
    clockArtifact, clockArtifactSha256: clockArtifact.sha256, baselineCopyReceiptSha256: copyHash, baselineLogicalSha256: baselineInventory.logicalSha256,
    operationSha256: sha256Json(journal.plan.operation), executionAuthorized: false, completionProved: false }));
  return Object.freeze({ result, resultSha256: sha256Json(result), qualification: deepFreeze(structuredClone(qualification)),
    historicalEvidenceVerified: true, rawBasePropertyOrderReconstructed: false, authorityRestored: false, executionAuthorized: false, completionProved: false });
}
