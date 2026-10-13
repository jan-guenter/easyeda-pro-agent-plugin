import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isRecord, sha256Json } from '../src/core.ts';
import { assertClosedSessionTerminationProof, assertIssuedWindowsClockObservation } from '../src/windows-authority.ts';
import { fixture } from './helpers/recorded-native-termination-fixture.ts';
import { validateRecordedBaselineTerminationEvidence } from '../src/closed-symbol-recorded-baseline-termination.ts';

type Bag = Record<string, unknown>;
// oxlint-disable-next-line typescript/explicit-function-return-type -- Preserve writable, explicitly synthetic adversarial fixture fields.
function prepared() {
  const f = fixture('closed-baseline', 1), { generation, journal, capture, bridgeDispatch, source } = f.input;
  const launch = f.sourceInput.launchClock.base;
  const proof: Bag = { schema: 'easyeda-pro-control.closed-session-termination.v1', operationId: journal.operationId, phase: 'closed-baseline', challengeAttempt: 1,
    closeIntentSha256: '1'.repeat(64), closeReceiptSha256: '2'.repeat(64), authoritySha256: f.authority['authoritySha256'], launchSha256: sha256Json(launch),
    bridgeSessionSha256: generation.sessionSha256, runtimeIdentitySha256: generation.runtimeSha256, helperInstance: generation.helperInstance, jobId: generation.jobId,
    closedAt: '1970-01-01T00:00:01.0050000Z', jobEmpty: true, retainedProcessesExited: true, saveOrDiscardSelected: false,
    policyId: f.authority['policyId'], policySha256: f.authority['policySha256'], queuedWritesPersisted: 'not-proved', persistentWorkReplayExcluded: 'not-proved', proofSha256: '' };
  const seal = (): void => { const { proofSha256: _ignored, ...body } = proof; proof['proofSha256'] = sha256Json(body); }; seal();
  const clock: Bag = { ...structuredClone(f.clock), phase: 'termination',
    base: { jobId: generation.jobId, helperInstance: generation.helperInstance, captureBindingSha256: f.authority['bindingSha256'], jobEmpty: true, retainedProcessesExited: true, checkedAt: proof['closedAt'] },
    ownerBinding: { operationId: journal.operationId, phase: 'closed-baseline', challengeAttempt: 1, authoritySha256: f.authority['authoritySha256'],
      closeIntentSha256: proof['closeIntentSha256'], captureBindingSha256: f.authority['bindingSha256'] } };
  return { f, proof, clock, seal, input: { journal, generation, capture, bridgeDispatch, source, terminationClock: clock, closedProof: proof } };
}
function selected(value: Bag, path: string): Readonly<{ parent: Bag; key: string }> {
  const parts = path.split('.'); const key = parts.pop(); assert.ok(key !== undefined);
  let parent = value; for (const part of parts) { const next = parent[part]; assert.ok(isRecord(next)); parent = next; } return { parent, key };
}
const changed: readonly (readonly [string, unknown])[] = [
  ['schema', 'other'], ['phase', 'capture'], ['baseSha256', 'invalid'], ['helperSourceSha256', 'f'.repeat(64)], ['executionScopeSha256', 'f'.repeat(64)],
  ['producerBindingVerified', true], ['executionAuthorized', true], ['extra', false], ['base.jobId', 'a'.repeat(32)], ['base.helperInstance', 'a'.repeat(32)],
  ['base.captureBindingSha256', 'a'.repeat(64)], ['base.jobEmpty', false], ['base.retainedProcessesExited', false], ['base.checkedAt', '2026-02-30T12:00:00.000Z'],
  ['base.extra', false], ['ownerBinding.operationId', 'other'], ['ownerBinding.phase', 'closed-verification'], ['ownerBinding.challengeAttempt', 2],
  ['ownerBinding.authoritySha256', 'a'.repeat(64)], ['ownerBinding.closeIntentSha256', 'a'.repeat(64)], ['ownerBinding.captureBindingSha256', 'a'.repeat(64)],
  ['ownerBinding.extra', false], ['clock.status', 'unavailable'], ['clock.tzAbsentBefore', false], ['clock.tzAbsentAfter', false], ['clock.extra', false],
  ['clock.after.qpcFrequency', '1001'], ['clock.after.localOffsetMinutes', 0], ['clock.after.zoneRulesSha256', 'b'.repeat(64)],
  ['clock.after.utcBeforeTicks', '621355968000000000'], ['clock.after.qpcBefore', '0'], ['clock.after.extra', false],
];
for (const [path, value] of changed) {
  void test(`termination strict attachment refuses ${path}`, () => {
    const f = prepared(), target = selected(f.clock, path); assert.notDeepEqual(target.parent[target.key], value); target.parent[target.key] = value;
    assert.throws(() => validateRecordedBaselineTerminationEvidence(f.input), /Recorded native termination refused|CLOCK_RECEIPT_REFUSED/u);
  });
}
const proofChanges: readonly (readonly [string, unknown])[] = [
  ['schema', 'other'], ['operationId', 'other'], ['phase', 'closed-verification'], ['challengeAttempt', 2], ['closeIntentSha256', 'wrong'], ['closeReceiptSha256', 'wrong'],
  ['authoritySha256', 'a'.repeat(64)], ['launchSha256', 'a'.repeat(64)], ['bridgeSessionSha256', 'a'.repeat(64)], ['runtimeIdentitySha256', 'a'.repeat(64)],
  ['helperInstance', 'a'.repeat(32)], ['jobId', 'a'.repeat(32)], ['closedAt', '1970-01-01T00:00:01.004Z'], ['jobEmpty', false], ['retainedProcessesExited', false],
  ['saveOrDiscardSelected', true], ['policyId', 'other'], ['policySha256', 'a'.repeat(64)], ['queuedWritesPersisted', 'proved'], ['persistentWorkReplayExcluded', 'proved'], ['extra', false],
];
for (const [key, value] of proofChanges) {
  void test(`self-resealed proof refuses ${key}`, () => {
    const f = prepared(); assert.notDeepEqual(f.proof[key], value); f.proof[key] = value; f.seal();
    assert.throws(() => validateRecordedBaselineTerminationEvidence(f.input), /Recorded native termination refused/u);
  });
}
void test('exact historical receipt remains deeply frozen data without restored brands', async () => {
  const f = prepared(), out = validateRecordedBaselineTerminationEvidence(f.input);
  assert.deepEqual(out.termination, f.clock); assert.deepEqual(out.proof, f.proof);
  assert.equal(out.rawBasePropertyOrderReconstructed, false); assert.equal(out.authorityRestored, false); assert.equal(out.executionAuthorized, false);
  assert.ok(Object.isFrozen(out.proof) && Object.isFrozen(out.termination['base']) && Object.isFrozen(out.termination['ownerBinding']));
  await assert.rejects(assertClosedSessionTerminationProof(out.proof), /not issued/u);
  await assert.rejects(assertIssuedWindowsClockObservation(out.termination), /not issued/u);
});
void test('self-consistent base and owner cannot substitute another capture binding', () => {
  const f = prepared(); for (const key of ['base', 'ownerBinding']) { const target = f.clock[key]; assert.ok(isRecord(target)); target['captureBindingSha256'] = 'f'.repeat(64); }
  assert.throws(() => validateRecordedBaselineTerminationEvidence(f.input), /Recorded native termination refused/u);
});
void test('later witness capture cannot replace original admission even if everything else matches', () => {
  const f = prepared(); f.input.capture.challengeAttempt = 2;
  assert.throws(() => validateRecordedBaselineTerminationEvidence(f.input), /Recorded native capture refused/u);
});
void test('checkedAt before admission or outside clock bracket refuses after resealing', () => {
  for (const time of ['1970-01-01T00:00:01.0000000Z', '1970-01-01T00:00:01.0200000Z']) {
    const f = prepared(); const base = f.clock['base']; assert.ok(isRecord(base)); base['checkedAt'] = time; f.proof['closedAt'] = time; f.seal();
    assert.throws(() => validateRecordedBaselineTerminationEvidence(f.input), /Recorded native termination refused/u);
  }
});
void test('missing, inherited, accessor and symbol fields refuse without getter execution', () => {
  for (const targetName of ['proof', 'clock', 'base', 'ownerBinding']) {
    for (const mutation of ['missing', 'accessor', 'inherited', 'symbol']) {
      const f = prepared(); let target: unknown = f.clock[targetName];
      if (targetName === 'proof') { target = f.proof; } else if (targetName === 'clock') { target = f.clock; } assert.ok(isRecord(target));
      const key = Object.keys(target)[0]; assert.ok(key !== undefined); let reads = 0;
      if (mutation === 'missing') { Reflect.deleteProperty(target, key); }
      if (mutation === 'accessor') { Object.defineProperty(target, key, { get() { reads += 1; throw new Error('getter must not run'); }, enumerable: true }); }
      if (mutation === 'inherited') { Object.setPrototypeOf(target, { inherited: true }); }
      if (mutation === 'symbol') { Object.defineProperty(target, Symbol('extra'), { value: true }); }
      assert.throws(() => validateRecordedBaselineTerminationEvidence(f.input), /Recorded native termination refused/u); assert.equal(reads, 0);
    }
  }
});
void test('raw wire digest is bound as retained data, not fabricated canonical property order', () => {
  const f = prepared(); f.clock['baseSha256'] = '0'.repeat(64);
  const result = validateRecordedBaselineTerminationEvidence(f.input); assert.equal(result.rawBasePropertyOrderReconstructed, false);
});
for (const ordinal of [1, 2]) {
  void test(`fixed baseline parser rejects generation ordinal ${ordinal}`, () => {
    const f = prepared(); f.input.generation.ordinal = ordinal;
    assert.throws(() => validateRecordedBaselineTerminationEvidence(f.input), /Recorded native capture refused/u);
  });
}
for (const phase of ['closed-edit', 'closed-verification'] as const) {
  void test(`fixed baseline parser rejects capture phase ${phase}`, () => {
    const f = prepared(); f.input.capture.phase = phase;
    assert.throws(() => validateRecordedBaselineTerminationEvidence(f.input), /Recorded native capture refused/u);
  });
}
