/* oxlint-disable import/max-dependencies -- Actual original stages plus historical reader; only native program I/O prerequisites are synthetic. */
import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import fsPromises, { readFile, writeFile } from 'node:fs/promises';
import { syncBuiltinESMExports } from 'node:module';
import { basename } from 'node:path';
import { installSyntheticNativeProfile } from './helpers/install-synthetic-native-profile.ts';
import { loadClosedSymbolJournal } from '../src/closed-symbol-journal.ts';
import { inspectRecordedClosedCopy } from '../src/closed-symbol-recorded-copy.ts';
import { validateRecordedNativeSource } from '../src/closed-symbol-recorded-native.ts';
import { syntheticSqlRuntime } from './helpers/sqlite-inventory-fixture.ts';
import { canonicalJson, isRecord, sha256Json, sha256Text } from '../src/core.ts';
import { reconstructRecordedAgedSymbolWitness } from '../src/closed-symbol-recorded-aged-witness.ts';
import { reconstructRecordedLockedSymbolWitness } from '../src/closed-symbol-recorded-witness.ts';
// oxlint-disable-next-line node/no-top-level-await -- Install the worker-local I/O fixture before original stage imports; no authority issuer is mocked.
const profile = await installSyntheticNativeProfile(); after(() => { profile.unregister(); });
// oxlint-disable-next-line node/no-top-level-await -- Import the actual stage graph only after the synthetic source-profile prerequisite seam.
const { writeFixture } = await import('./helpers/closed-symbol-recorded-aged-write-fixture.ts');
// oxlint-disable-next-line node/no-top-level-await -- Use the same unchanged original witness issuer, never a reconstructed registry.
const { assertOriginalClosedSymbolWitness } = await import('../src/closed-symbol-witness.ts');

void test('aged historical witness reconstructs exact original data without issuer authority', async context => {
  const f = await writeFixture(context); await f.writer.write(f.writeInput);
  const loaded = await loadClosedSymbolJournal(f.journal.operationId);
  const initial = loaded.events[0]; const baseline = loaded.events[3]; assert.ok(initial && isRecord(initial.data) && baseline?.generation && 'captureSha256' in baseline.generation);
  const nativeSource = validateRecordedNativeSource({ journal: loaded.journal, fingerprint: f.identity, bootstrapStatus: initial.data['runtimeStatus'], launchClock: f.launchClock, launchGeneration: baseline.generation });
  const historical = await inspectRecordedClosedCopy({ operationId: f.journal.operationId, phase: 'baseline-copy', runtime: await syntheticSqlRuntime() });
  const input = { ...loaded, baselineInventory: historical.inventory, nativeSource, mainReferenceIntent: f.reference.intentArtifact, mainReferenceResult: f.reference.resultArtifact };
  const result = await reconstructRecordedAgedSymbolWitness(input);
  assert.deepEqual(result.result, f.witness); assert.equal(result.resultSha256, sha256Json(f.witness));
  assert.equal(result.result.witness.agedHead?.nativeTimezoneOffsetMinutes, -120);
  assert.equal(result.result.witness.agedHead?.nativeParsedLocalMs, Date.parse('2026-01-15T11:34:56Z'));
  assert.equal(result.executionAuthorized, false); assert.equal(result.authorityRestored, false); assert.equal(result.completionProved, false);
  assert.throws(() => assertOriginalClosedSymbolWitness(result.result, f.engine, f.journal.operationId), /not issued/u);
  const storedBefore = canonicalJson(await loadClosedSymbolJournal(f.journal.operationId));
  await context.test('unchanged locked reader still rejects the aged baseline', async () => {
    await assert.rejects(reconstructRecordedLockedSymbolWitness(input), /Recorded locked witness baseline refused/u);
  });
  await context.test('serialized inventory cannot replace the fresh completed reader', async () => {
    await assert.rejects(reconstructRecordedAgedSymbolWitness({ ...input, baselineInventory: structuredClone(historical.inventory) }), /original inventory/u);
  });
  for (const name of ['reference', 'reference-result', 'source', 'code', 'actor', 'qualification-path', 'baseline', 'window', 'extra', 'raw-controls', 'raw-worker'] as const) {
    await context.test(`self-resealed ${name} evidence refuses`, async () => {
      const events = structuredClone(loaded.events), journal = structuredClone(loaded.journal);
      const request = events[18]; const raw = events[19]; assert.ok(request && raw && isRecord(request.data) && isRecord(raw.data));
      const data = request.data;
      const before = canonicalJson({ data, raw: raw.data });
      if (name === 'reference') { data['mainReference'] = {}; }
      if (name === 'reference-result') { assert.ok(isRecord(data['mainReference'])); data['mainReference']['resultSha256'] = '0'.repeat(64); }
      if (name === 'source') { assert.ok(isRecord(data['launchClock'])); data['launchClock']['helperSourceSha256'] = '0'.repeat(64); }
      if (name === 'code') { data['codeSha256'] = '0'.repeat(64); }
      if (name === 'actor') { data['expectedActor'] = { uuid: 'f'.repeat(32), username: 'other', nickname: '' }; }
      if (name === 'qualification-path') { data['qualificationPath'] = `${f.witness.clockArtifact.path}.other`; }
      if (name === 'baseline') { data['baselineLogicalSha256'] = '0'.repeat(64); }
      if (name === 'window') { data['plannedWindow'] = { notBeforeMs: 1, notAfterMs: 60_001 }; }
      if (name === 'extra') { data['extra'] = false; }
      if (name === 'raw-controls' || name === 'raw-worker') {
        assert.ok(isRecord(raw.data['rawReturn']) && Array.isArray(raw.data['rawReturn']['content']));
        const first: unknown = raw.data['rawReturn']['content'][0]; assert.ok(isRecord(first) && typeof first['text'] === 'string');
        const payload: unknown = JSON.parse(first['text']); assert.ok(isRecord(payload));
        if (name === 'raw-controls') { assert.ok(isRecord(payload['controlsAfter'])); payload['controlsAfter']['extra'] = true; }
        else { assert.ok(isRecord(payload['witness'])); payload['witness']['workerClient'] = 'f'.repeat(16); }
        first['text'] = JSON.stringify(payload);
      }
      assert.notEqual(canonicalJson({ data, raw: raw.data }), before);
      Object.assign(request, { dataSha256: sha256Json(data), requestSha256: sha256Json(data) });
      Object.assign(raw, { dataSha256: sha256Json(raw.data), requestSha256: request.requestSha256 });
      await assert.rejects(reconstructRecordedAgedSymbolWitness({ ...input, journal, events }), /Recorded aged witness refused|AGED_WITNESS_(?:INPUT|RESULT)_REFUSED|CLOCK_CONTROLS_REFUSED/u);
    });
  }
  const bytes = await readFile(f.witness.clockArtifact.path);
  for (const side of ['before', 'after'] as const) {
    await context.test(`self-resealed impossible ${side}-capture calendar refuses`, async () => {
      const q: unknown = JSON.parse(bytes.toString('utf8')); assert.ok(isRecord(q));
      const retainedCapture = q[`${side}Capture`], retainedClock = q[`${side}Clock`]; assert.ok(isRecord(retainedCapture) && isRecord(retainedClock));
      const authority = retainedCapture['executionAuthority'], clock = retainedClock;
      assert.ok(isRecord(authority) && isRecord(clock['base']) && isRecord(clock['ownerBinding']));
      assert.notEqual(authority['capturedAt'], '2026-02-30T00:00:00.000Z');
      authority['capturedAt'] = '2026-02-30T00:00:00.000Z';
      const { authoritySha256: _old, ...body } = authority; authority['authoritySha256'] = sha256Json(body);
      clock['base']['capturedAt'] = authority['capturedAt']; clock['ownerBinding']['authoritySha256'] = authority['authoritySha256'];
      const events = structuredClone(loaded.events); const journal = structuredClone(loaded.journal);
      if (side === 'before') {
        const request = events[18]; const raw = events[19]; assert.ok(request && raw && isRecord(request.data));
        Object.assign(request.data, { beforeCapture: retainedCapture, beforeClock: retainedClock });
        const requestHash = sha256Json(request.data); Object.assign(request, { dataSha256: requestHash, requestSha256: requestHash });
        Object.assign(raw, { requestSha256: requestHash }); q['requestSha256'] = requestHash;
      }
      const text = `${JSON.stringify(q)}\n`; const digest = sha256Text(text);
      const write = events[20]; assert.ok(write && isRecord(write.data) && isRecord(write.data['witnessClockArtifact']));
      Object.assign(write.data['witnessClockArtifact'], { sha256: digest, bytes: Buffer.byteLength(text) }); write.data['witnessClockArtifactSha256'] = digest;
      Object.assign(write, { requestSha256: sha256Json(write.data), dataSha256: sha256Json(write.data) });
      try {
        await writeFile(f.witness.clockArtifact.path, text, { mode: 0o600 });
        await assert.rejects(reconstructRecordedAgedSymbolWitness({ ...input, journal, events }), /Recorded native capture refused/u);
      } finally { await writeFile(f.witness.clockArtifact.path, bytes, { mode: 0o600 }); }
    });
  }
  const qualificationChanges: readonly (readonly [string, unknown])[] = [
    ['mainReference.resultSha256', 'e'.repeat(64)], ['historicalRelations', []], ['witness.agedHead.createdAtLiteral', '2026-01-16 12:34:56'],
    ['witness.agedHead.nativeParsedLocalMs', 1], ['witness.agedHead.nativeTimezoneOffsetMinutes', -60],
    ['witness.client', 'f'.repeat(16)], ['witness.actorUuid', 'f'.repeat(32)], ['executionAuthorized', true], ['completionProved', true],
    ['beforeCapture.challengeAttempt', 3], ['afterCapture.operationId', 'easyeda-other-operation'], ['afterCapture.runtimeIdentity.ok', false],
    ['beforeClock.ownerBinding.phase', 'closed-verification'], ['afterClock.ownerBinding.authoritySha256', 'f'.repeat(64)],
    ['beforeClock.base.processes', []], ['afterClock.base.socketOwnerPid', 999_999], ['launchClock.ownerBinding.launchSha256', 'f'.repeat(64)],
    ['launchClock.helperSourceSha256', 'f'.repeat(64)], ['beforeClock.clock.tzAbsentBefore', false], ['beforeClock.baseSha256', 'not-a-hash'],
    ['afterClock.clock.after.localOffsetMinutes', 0], ['afterClock.clock.before.zoneRulesSha256', 'e'.repeat(64)],
    ['afterClock.clock.after.qpcFrequency', '1'], ['plannedWindow.notAfterMs', 1], ['rawResultArtifactSha256', 'f'.repeat(64)], ['requestSha256', 'f'.repeat(64)],
  ];
  for (const [path, value] of qualificationChanges) {
    await context.test(`self-resealed qualification ${path} refuses`, async () => {
      const q: unknown = JSON.parse(bytes.toString('utf8')); assert.ok(isRecord(q));
      const keys = path.split('.'); const key = keys.pop(); assert.ok(key !== undefined && key.length > 0); let selected = q;
      for (const part of keys) { const next = selected[part]; assert.ok(isRecord(next)); selected = next; }
      assert.notDeepEqual(selected[key], value); selected[key] = value;
      const text = `${JSON.stringify(q)}\n`; const digest = sha256Text(text);
      const events = structuredClone(loaded.events), journal = structuredClone(loaded.journal), write = events[20];
      assert.ok(write && isRecord(write.data) && isRecord(write.data['witnessClockArtifact']));
      Object.assign(write.data['witnessClockArtifact'], { sha256: digest, bytes: Buffer.byteLength(text) }); write.data['witnessClockArtifactSha256'] = digest;
      Object.assign(write, { requestSha256: sha256Json(write.data), dataSha256: sha256Json(write.data) });
      try {
        await writeFile(f.witness.clockArtifact.path, text, { mode: 0o600 });
        await assert.rejects(reconstructRecordedAgedSymbolWitness({ ...input, journal, events }), /Recorded (?:aged witness|native capture) refused|CLOCK_RECEIPT_REFUSED|RENDERER_CLOCK_ENDPOINTS_REFUSED/u);
      } finally { await writeFile(f.witness.clockArtifact.path, bytes, { mode: 0o600 }); }
    });
  }
  for (const descriptor of ['mainReferenceIntent', 'mainReferenceResult'] as const) {
    await context.test(`exact auxiliary ${descriptor} binding refuses a sibling path`, async () => {
      await assert.rejects(reconstructRecordedAgedSymbolWitness({ ...input, [descriptor]: { ...input[descriptor], path: `${input[descriptor].path}.other` } }), /Recorded main reference refused/u);
    });
  }
  await context.test('partial qualification refuses and is restored', async () => {
    try { await writeFile(f.witness.clockArtifact.path, '{', { mode: 0o600 }); await assert.rejects(reconstructRecordedAgedSymbolWitness(input)); }
    finally { await writeFile(f.witness.clockArtifact.path, bytes, { mode: 0o600 }); }
  });
  await context.test('caller drift during auxiliary read refuses', async () => {
    let changed = false; const open = fsPromises.open;
    context.mock.method(fsPromises, 'open', async (...args: Parameters<typeof open>): Promise<Awaited<ReturnType<typeof open>>> => {
      const handle = await open(...args);
      if (basename(String(args[0])) === '20-edit-witness-clock-qualification.json') { input.journal.saved = true; changed = true; }
      return handle;
    }); syncBuiltinESMExports();
    try { await assert.rejects(reconstructRecordedAgedSymbolWitness(input), /Recorded aged witness refused/u); assert.equal(changed, true); }
    finally { context.mock.restoreAll(); syncBuiltinESMExports(); input.journal.saved = false; }
  });
  assert.equal(canonicalJson(await loadClosedSymbolJournal(f.journal.operationId)), storedBefore);
  assert.equal(f.transport.calls, 1); assert.equal(f.agedState.calls, 1); assert.equal(f.writeState.calls, 1);
});
