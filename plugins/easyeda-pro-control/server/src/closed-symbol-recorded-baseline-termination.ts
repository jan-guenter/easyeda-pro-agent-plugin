/** Exact historical baseline termination producer data. Never restores clock or Job authority. */
import { canonicalJson, isRecord, sha256Json } from './core.ts';
import type { ClosedJournal, Generation } from './closed-symbol-journal.ts';
import { validateClockSample } from './windows-clock-transport.ts';
import { validateRecordedCaptureEvidence } from './closed-symbol-recorded-native.ts';
import type { RecordedNativeSource } from './closed-symbol-recorded-native.ts';

type Bag = Readonly<Record<string, unknown>>;
const EPOCH = 621_355_968_000_000_000n, HASH = /^[a-f0-9]{64}$/u;
function need(value: boolean): asserts value { if (!value) { throw new Error('Recorded native termination refused.'); } }
function exact(value: unknown, keys: readonly string[]): Bag {
  need(isRecord(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null) && Reflect.ownKeys(value).length === keys.length);
  const out: Record<string, unknown> = {};
  for (const key of keys) { const item = Object.getOwnPropertyDescriptor(value, key); need(item !== undefined && Object.hasOwn(item, 'value') && item.enumerable === true); out[key] = item.value as unknown; } return out;
}
function same(actual: unknown, expected: unknown): void { need(canonicalJson(actual) === canonicalJson(expected)); }
function hash(value: unknown): void { need(typeof value === 'string' && HASH.test(value)); }
function timestamp(value: unknown): number {
  need(typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3,7}Z$/u.test(value));
  const time = Date.parse(value); need(Number.isFinite(time) && new Date(time).toISOString() === `${value.slice(0, 23)}Z`); return time;
}
function freeze<T>(value: T): T { if (value !== null && typeof value === 'object') { for (const item of Object.values(value)) { freeze(item); } Object.freeze(value); } return value; }

/** The caller separately proves artifact bytes and the full close intent/receipt
 * chain. This fixed leaf validates the native attachment, original admission
 * binding and complete termination payload before the pure interval relation.
 * Raw baseSha256 remains opaque: normalized JSON cannot recreate wire key order. */
export function validateRecordedBaselineTerminationEvidence(input: Readonly<{
  journal: Pick<ClosedJournal, 'operationId' | 'plan'>; generation: Generation; capture: unknown; bridgeDispatch: unknown;
  terminationClock: unknown; closedProof: unknown; source: RecordedNativeSource;
}>): Readonly<{ termination: Bag; proof: Bag; rawBasePropertyOrderReconstructed: false; authorityRestored: false; executionAuthorized: false }> {
  const { journal, generation, source } = input;
  const admitted = validateRecordedCaptureEvidence({ journal, generation, capture: input.capture, phase: 'closed-baseline', attempt: 1, bridgeDispatch: input.bridgeDispatch, source });
  const authority = exact(admitted.capture['executionAuthority'], ['schema', 'bindingSha256', 'policyId', 'policySha256', 'capturedAt', 'processes', 'processTreeSha256', 'authoritySha256']);
  const v = exact(input.terminationClock, ['schema', 'phase', 'baseSha256', 'helperSourceSha256', 'executionScopeSha256', 'base', 'clock', 'producerBindingVerified', 'executionAuthorized', 'ownerBinding']);
  need(v['schema'] === 'easyeda-pro-control.owned-clock-attachment.v1' && v['phase'] === 'termination' && v['helperSourceSha256'] === source.helperSourceSha256 &&
    v['executionScopeSha256'] === source.executionScopeSha256 && v['producerBindingVerified'] === false && v['executionAuthorized'] === false); hash(v['baseSha256']);
  const clock = exact(v['clock'], ['status', 'tzAbsentBefore', 'tzAbsentAfter', 'before', 'after']);
  need(clock['status'] === 'observed' && clock['tzAbsentBefore'] === true && clock['tzAbsentAfter'] === true);
  const after = validateClockSample(clock['after']), before = validateClockSample(clock['before']);
  need(before.qpcFrequency === after.qpcFrequency && before.zoneRulesSha256 === after.zoneRulesSha256 && before.localOffsetMinutes === after.localOffsetMinutes &&
    BigInt(after.qpcBefore) >= BigInt(before.qpcAfter) && BigInt(after.utcBeforeTicks) >= BigInt(before.utcAfterTicks));
  const base = exact(v['base'], ['jobId', 'helperInstance', 'captureBindingSha256', 'jobEmpty', 'retainedProcessesExited', 'checkedAt']);
  need(base['jobId'] === generation.jobId && base['helperInstance'] === generation.helperInstance && base['captureBindingSha256'] === authority['bindingSha256'] &&
    base['jobEmpty'] === true && base['retainedProcessesExited'] === true);
  const closedTime = timestamp(base['checkedAt']);
  need(closedTime >= timestamp(authority['capturedAt']) && closedTime >= Number((BigInt(before.utcBeforeTicks) - EPOCH) / 10_000n) &&
    closedTime <= Number((BigInt(after.utcAfterTicks) - EPOCH + 9999n) / 10_000n));
  const proof = exact(input.closedProof, ['schema', 'operationId', 'phase', 'challengeAttempt', 'closeIntentSha256', 'closeReceiptSha256', 'authoritySha256', 'launchSha256',
    'bridgeSessionSha256', 'runtimeIdentitySha256', 'helperInstance', 'jobId', 'closedAt', 'jobEmpty', 'retainedProcessesExited', 'saveOrDiscardSelected', 'policyId',
    'policySha256', 'queuedWritesPersisted', 'persistentWorkReplayExcluded', 'proofSha256']);
  hash(proof['closeIntentSha256']); hash(proof['closeReceiptSha256']);
  const launch = { jobId: generation.jobId, helperInstance: generation.helperInstance, root: { pid: generation.rootPid, role: 'easyeda-main', startIdentity: generation.rootStartIdentity } };
  const body = { schema: 'easyeda-pro-control.closed-session-termination.v1', operationId: journal.operationId, phase: 'closed-baseline', challengeAttempt: 1,
    closeIntentSha256: proof['closeIntentSha256'], closeReceiptSha256: proof['closeReceiptSha256'], authoritySha256: authority['authoritySha256'], launchSha256: sha256Json(launch),
    bridgeSessionSha256: generation.sessionSha256, runtimeIdentitySha256: generation.runtimeSha256, helperInstance: generation.helperInstance, jobId: generation.jobId,
    closedAt: base['checkedAt'], jobEmpty: true, retainedProcessesExited: true, saveOrDiscardSelected: false, policyId: authority['policyId'], policySha256: authority['policySha256'],
    queuedWritesPersisted: 'not-proved', persistentWorkReplayExcluded: 'not-proved' };
  same(proof, { ...body, proofSha256: sha256Json(body) });
  same(exact(v['ownerBinding'], ['operationId', 'phase', 'challengeAttempt', 'authoritySha256', 'closeIntentSha256', 'captureBindingSha256']), {
    operationId: journal.operationId, phase: 'closed-baseline', challengeAttempt: 1, authoritySha256: authority['authoritySha256'],
    closeIntentSha256: proof['closeIntentSha256'], captureBindingSha256: authority['bindingSha256'] });
  return freeze(structuredClone({ termination: v, proof, rawBasePropertyOrderReconstructed: false as const, authorityRestored: false as const, executionAuthorized: false as const }));
}
