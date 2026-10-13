/* oxlint-disable import/max-dependencies -- Exercise actual maintained issuers, fresh recorded SQL, and managed I/O mutation boundaries without replacing an authority registry. */
import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import fsPromises, { readFile, writeFile } from 'node:fs/promises';
import { syncBuiltinESMExports } from 'node:module';
import { basename } from 'node:path';
import { loadClosedSymbolJournal } from '../src/closed-symbol-journal.ts';
import { canonicalJson, isRecord, sha256Json, sha256Text } from '../src/core.ts';
import { inspectRecordedClosedCopy } from '../src/closed-symbol-recorded-copy.ts';
import { syntheticSqlRuntime } from './helpers/sqlite-inventory-fixture.ts';
import { installSyntheticNativeProfile } from './helpers/install-synthetic-native-profile.ts';
import { reconstructRecordedLockedSymbolWitness } from '../src/closed-symbol-recorded-witness.ts';
// oxlint-disable-next-line node/no-top-level-await -- Install only the prerequisite fixture before importing the actual issuers.
const profile = await installSyntheticNativeProfile(); after(() => { profile.unregister(); });
// oxlint-disable-next-line node/no-top-level-await -- The source-profile mock does not replace witness, clock, SQL or writer issuers.
const { writeFixture } = await import('./helpers/closed-symbol-write-fixture.ts');
// oxlint-disable-next-line node/no-top-level-await -- Import the same maintained issuer graph after the fixture prerequisite.
const { assertOriginalClosedSymbolWitness } = await import('../src/closed-symbol-witness.ts');

void test('locked historical reconstruction exactly matches original data without reviving a witness', async context => {
  const f = await writeFixture(context); await f.writer.write(f.writeInput);
  const loaded = await loadClosedSymbolJournal(f.journal.operationId);
  const baseline = await inspectRecordedClosedCopy({ operationId: f.journal.operationId, phase: 'baseline-copy', runtime: await syntheticSqlRuntime() });
  const input = { ...loaded, baselineInventory: baseline.inventory };
  const reconstructed = await reconstructRecordedLockedSymbolWitness(input);
  assert.deepEqual(reconstructed.result, f.witness); assert.equal(reconstructed.resultSha256, sha256Json(f.witness));
  assert.equal(reconstructed.authorityRestored, false); assert.equal(reconstructed.executionAuthorized, false); assert.equal(reconstructed.completionProved, false);
  assert.equal(reconstructed.rawBasePropertyOrderReconstructed, false);
  assert.throws(() => assertOriginalClosedSymbolWitness(reconstructed.result, f.engine, f.journal.operationId), /not issued/u);
  assert.equal(f.writeState.calls, 1); assert.equal(f.state.witnessCalls, 1);
  const prior = canonicalJson(await loadClosedSymbolJournal(f.journal.operationId));
  for (const name of ['request-extra', 'actor', 'worker', 'scope', 'code', 'baseline', 'window', 'aged', 'source', 'raw-shape', 'descriptor'] as const) {
    const events = structuredClone(loaded.events), journal = structuredClone(loaded.journal);
    const request = events[18]; const raw = events[19]; const write = events[20]; assert.ok(request && raw && write && isRecord(request.data) && isRecord(raw.data) && isRecord(write.data));
    const data: Record<string, unknown> = request.data;
    if (name === 'request-extra' || name === 'aged') { data[name === 'aged' ? 'mainReference' : 'extra'] = {}; }
    if (name === 'actor') { data['expectedActor'] = { uuid: 'f'.repeat(32), username: 'other', nickname: '' }; }
    if (name === 'scope') { assert.ok(isRecord(data['scope'])); assert.notEqual(data['scope']['createdAtLiteral'], '2021-01-01 00:00:00'); data['scope']['createdAtLiteral'] = '2021-01-01 00:00:00'; }
    if (name === 'code') { data['codeSha256'] = '0'.repeat(64); }
    if (name === 'baseline') { data['baselineLogicalSha256'] = '0'.repeat(64); }
    if (name === 'window') { assert.ok(isRecord(data['plannedWindow'])); data['plannedWindow']['notAfterMs'] = 1; }
    if (name === 'source') { assert.ok(isRecord(data['launchClock'])); data['launchClock']['helperSourceSha256'] = '0'.repeat(64); }
    if (name === 'raw-shape' || name === 'worker') {
      assert.ok(isRecord(raw.data['rawReturn']) && Array.isArray(raw.data['rawReturn']['content']));
      const content = raw.data['rawReturn']['content'][0] as unknown; assert.ok(isRecord(content) && typeof content['text'] === 'string');
      const payload: unknown = JSON.parse(content['text']); assert.ok(isRecord(payload));
      payload[name === 'worker' ? 'workerClient' : 'extra'] = name === 'worker' ? 'f'.repeat(16) : true; content['text'] = JSON.stringify(payload);
    }
    if (name === 'descriptor') { assert.ok(isRecord(write.data['witnessClockArtifact'])); write.data['witnessClockArtifact']['path'] = `${f.witness.clockArtifact.path  }.other`; }
    const requestSha256 = sha256Json(data);
    Object.assign(request, { dataSha256: requestSha256, requestSha256 }); Object.assign(raw, { dataSha256: sha256Json(raw.data), requestSha256 });
    Object.assign(write, { dataSha256: sha256Json(write.data), requestSha256: sha256Json(write.data) });
    await assert.rejects(reconstructRecordedLockedSymbolWitness({ journal, events, baselineInventory: baseline.inventory }), /Recorded locked witness refused|SYMBOL_WITNESS_(?:INPUT|RESULT)|Closed SQL copy binding refused/u, name);
  }
  await assert.rejects(reconstructRecordedLockedSymbolWitness({ ...input, baselineInventory: structuredClone(baseline.inventory) }), /original inventory/u);
  const bytes = await readFile(f.witness.clockArtifact.path);
  const changes: readonly (readonly [string, unknown])[] = [
    ['mainReference', {}], ['historicalRelations', []], ['witness.agedHead', {}], ['witness.client', 'f'.repeat(16)],
    ['witness.actorUuid', 'f'.repeat(32)], ['executionAuthorized', true], ['completionProved', true], ['relation.endpointsAgree', false],
    ['beforeCapture.challengeAttempt', 3], ['afterCapture.operationId', 'easyeda-other-operation'], ['beforeClock.ownerBinding.phase', 'closed-verification'],
    ['afterClock.ownerBinding.authoritySha256', 'f'.repeat(64)], ['beforeClock.base.processes', []], ['afterClock.base.socketOwnerPid', 999_999],
    ['launchClock.ownerBinding.launchSha256', 'f'.repeat(64)], ['launchClock.helperSourceSha256', 'f'.repeat(64)],
    ['beforeClock.clock.tzAbsentBefore', false], ['beforeClock.baseSha256', 'not-a-hash'], ['afterClock.clock.after.localOffsetMinutes', 0],
    ['afterClock.clock.before.zoneRulesSha256', 'e'.repeat(64)], ['afterClock.clock.after.qpcFrequency', '1'],
    ['plannedWindow.notAfterMs', 1], ['rawResultArtifactSha256', 'f'.repeat(64)], ['requestSha256', 'f'.repeat(64)],
  ];
  for (const [path, value] of changes) {
    const q: unknown = JSON.parse(bytes.toString('utf8')); assert.ok(isRecord(q));
    const keys = path.split('.'); const key = keys.pop(); assert.ok(key !== undefined && key.length > 0); let selected = q;
    for (const part of keys) { const next = selected[part]; assert.ok(isRecord(next)); selected = next; }
    assert.notDeepEqual(selected[key], value, path); selected[key] = value;
    const text = `${JSON.stringify(q)}\n`; const digest = sha256Text(text);
    const events = structuredClone(loaded.events); const journal = structuredClone(loaded.journal);
    const write = events[20]; assert.ok(write && isRecord(write.data) && isRecord(write.data['witnessClockArtifact']));
    Object.assign(write.data['witnessClockArtifact'], { sha256: digest, bytes: Buffer.byteLength(text) });
    write.data['witnessClockArtifactSha256'] = digest; Object.assign(write, { requestSha256: sha256Json(write.data), dataSha256: sha256Json(write.data) });
    try {
      await writeFile(f.witness.clockArtifact.path, text, { mode: 0o600 });
      await assert.rejects(reconstructRecordedLockedSymbolWitness({ journal, events, baselineInventory: baseline.inventory }), /Recorded locked witness refused|CLOCK_RECEIPT_REFUSED|RENDERER_CLOCK_ENDPOINTS_REFUSED/u, path);
    } finally { await writeFile(f.witness.clockArtifact.path, bytes, { mode: 0o600 }); }
  }
  try { await writeFile(f.witness.clockArtifact.path, Buffer.from('{'), { mode: 0o600 }); await assert.rejects(reconstructRecordedLockedSymbolWitness(input)); }
  finally { await writeFile(f.witness.clockArtifact.path, bytes, { mode: 0o600 }); }
  let changed = false; const open = fsPromises.open;
  context.mock.method(fsPromises, 'open', async (...args: Parameters<typeof open>): Promise<Awaited<ReturnType<typeof open>>> => {
    const handle = await open(...args);
    if (basename(String(args[0])) === '20-edit-witness-clock-qualification.json') { input.journal.saved = true; changed = true; }
    return handle;
  }); syncBuiltinESMExports();
  try { await assert.rejects(reconstructRecordedLockedSymbolWitness(input), /Recorded locked witness refused/u); assert.equal(changed, true); }
  finally { context.mock.restoreAll(); syncBuiltinESMExports(); input.journal.saved = false; }
  assert.equal(canonicalJson(await loadClosedSymbolJournal(f.journal.operationId)), prior);
  assert.equal(f.writeState.calls, 1); assert.equal(f.state.witnessCalls, 1);
});
