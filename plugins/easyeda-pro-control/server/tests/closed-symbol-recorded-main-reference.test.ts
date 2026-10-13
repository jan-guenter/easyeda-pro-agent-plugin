/* oxlint-disable import/max-dependencies -- Actual managed stages, independently completed SQL and fixed historical readers; no issuer replacement. */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import fsPromises, { readFile, writeFile } from 'node:fs/promises';
import { syncBuiltinESMExports } from 'node:module';
import { basename } from 'node:path';
import { loadClosedSymbolJournal } from '../src/closed-symbol-journal.ts';
import { inspectRecordedClosedCopy } from '../src/closed-symbol-recorded-copy.ts';
import { validateRecordedNativeSource } from '../src/closed-symbol-recorded-native.ts';
import { assertOriginalMainReference } from '../src/closed-symbol-main-reference.ts';
import { canonicalJson, isRecord, sha256Json, sha256Text } from '../src/core.ts';
import { syntheticSqlRuntime } from './helpers/sqlite-inventory-fixture.ts';
import { mainReferenceFixture } from './helpers/closed-symbol-recorded-reference-fixture.ts';
import { transportFixture } from './helpers/closed-symbol-recorded-reference-transport-fixture.ts';
import { reconstructRecordedMainReference } from '../src/closed-symbol-recorded-main-reference.ts';
import { compileMainReferenceV3Metadata } from '../src/closed-symbol-main-reference-v3-metadata.ts';
import { validateMainReferenceTransportV3Result } from '../src/closed-symbol-main-reference-v3-result.ts';

type Bag = Record<string, unknown>;
function change(value: Bag, path: string, replacement: unknown): void {
  const parts = path.split('.'); const key = parts.pop(); assert.ok(key !== undefined); let target = value;
  for (const part of parts) { const next = target[part]; assert.ok(isRecord(next)); target = next; }
  assert.notDeepEqual(target[key], replacement, path); target[key] = replacement;
}

void test('actual synthetic original reference matches historical data, without a restored token', async context => {
  const f = await mainReferenceFixture(context), transport = await transportFixture(context, f);
  const original = await f.stage.runOnce(f.input); assert.equal(transport.calls, 1);
  const loaded = await loadClosedSymbolJournal(f.journal.operationId);
  const initial = loaded.events[0]; const admission = loaded.events[3]; assert.ok(initial && admission && isRecord(initial.data) && admission.generation && 'captureSha256' in admission.generation);
  const nativeSource = validateRecordedNativeSource({ journal: loaded.journal, fingerprint: f.identity, bootstrapStatus: initial.data['runtimeStatus'], launchClock: f.launchClock, launchGeneration: admission.generation });
  const historical = await inspectRecordedClosedCopy({ operationId: f.journal.operationId, phase: 'baseline-copy', runtime: await syntheticSqlRuntime() });
  const input = { ...loaded, baselineInventory: historical.inventory, nativeSource, mainReferenceIntent: original.intentArtifact, mainReferenceResult: original.resultArtifact };
  const before = canonicalJson(await loadClosedSymbolJournal(f.journal.operationId));
  const replayed = await reconstructRecordedMainReference(input);
  assert.deepEqual(replayed.result, original); assert.equal(replayed.resultSha256, sha256Json(original));
  assert.equal(replayed.authorityRestored, false); assert.equal(replayed.executionAuthorized, false); assert.equal(replayed.completionProved, false);
  assert.equal(replayed.rawBasePropertyOrderReconstructed, false); assert.equal(replayed.preparedManifestReconstructed, false); assert.equal(replayed.handshakeArtifactReconstructed, false);
  assert.ok(Object.isFrozen(replayed.result.observation));
  assert.throws(() => assertOriginalMainReference(replayed.result, f.engine, f.journal.operationId), /not issued/u);
  assert.equal(canonicalJson(await loadClosedSymbolJournal(f.journal.operationId)), before); assert.equal(transport.calls, 1);
  const originalIntent = await readFile(original.intentArtifact.path), originalResult = await readFile(original.resultArtifact.path);
  const retainedSuccess: unknown = JSON.parse(originalResult.toString('utf8'));
  assert.ok(isRecord(retainedSuccess) && isRecord(retainedSuccess['returned']));
  assert.equal(retainedSuccess['profile'], 'private.main-reference-retained-result.v2');
  assert.equal(retainedSuccess['requestSha256'], sha256Json(original.request));
  assert.equal(retainedSuccess['intentSha256'], original.intentArtifact.sha256);
  const originalReturn = f.stage.originalReturn(f.journal.operationId); assert.ok(originalReturn !== undefined);
  const transportFields = Object.fromEntries(Object.entries(originalReturn).filter(([key]) => key !== 'stdout' && key !== 'stderr'));
  assert.deepEqual(retainedSuccess['returned'], transportFields);
  assert.equal(Object.keys(transportFields).length, 13);
  assert.equal(retainedSuccess['returned']['transportState'], 'closed');
  assert.equal(retainedSuccess['returned']['spawnReturnObserved'], true);
  assert.equal(retainedSuccess['returned']['transportCloseObserved'], true);
  assert.equal(retainedSuccess['returned']['observationGuardsComplete'], true);
  assert.equal(retainedSuccess['returned']['containmentRequest'], 'not-requested');
  assert.equal(retainedSuccess['returned']['windowsJobTerminationProved'], false);
  assert.equal(retainedSuccess['returned']['executionAuthorized'], false);
  const intentChanges: readonly (readonly [string, unknown])[] = [
    ['profile', 'other'], ['extra', false], ['resultPath', `${original.resultArtifact.path}.other`], ['commandSha256', '0'.repeat(64)], ['mainSha256', '0'.repeat(64)],
    ['runtimePinsSha256', '0'.repeat(64)], ['sourcePins.extra', '0'.repeat(64)], ['windowsSideEffects', 'none'], ['executionAuthorized', true],
    ['request.profile', 'other'], ['request.nonce', '0'.repeat(64)], ['request.operationId', 'easyeda-20261012t000000z-00000000'],
    ['request.closedPlanSha256', '0'.repeat(64)], ['request.baselineCopyReceiptSha256', '0'.repeat(64)], ['request.baselineLogicalSha256', '0'.repeat(64)],
    ['request.baselineClosureClockSha256', '0'.repeat(64)], ['request.nativePinsSha256', '0'.repeat(64)], ['request.historyUuid', '0'.repeat(32)],
    ['request.createdAtLiteral', '2026-01-14 12:34:56'], ['request.referenceUtcMs', 1], ['request.extra', false],
    ['baselineClock.phase', 'capture'], ['baselineClock.baseSha256', 'wrong'], ['baselineClock.helperSourceSha256', '0'.repeat(64)],
    ['baselineClock.executionScopeSha256', '0'.repeat(64)], ['baselineClock.ownerBinding.phase', 'closed-edit'], ['baselineClock.base.jobEmpty', false],
    ['baselineClock.base.checkedAt', '2026-02-30T00:00:00.000Z'], ['baselineClock.clock.tzAbsentAfter', false],
    ['baselineClock.clock.after.qpcFrequency', '1'], ['baselineClock.clock.after.zoneRulesSha256', '0'.repeat(64)],
  ];
  const responseChanges: readonly (readonly [string, unknown])[] = [
    ['profile', 'other'], ['extra', false], ['session.requestSha256', '0'.repeat(64)], ['session.root', String.raw`C:\Synthetic\Temp\other`],
    ['helperSha256', '0'.repeat(64)], ['session.clockCleanupKnown', false], ['session.mainSha256', '0'.repeat(64)], ['session.executionAuthorized', true],
    ['session.profile', 'other'], ['session.nonce', '0'.repeat(64)], ['session.owner.job.launchAcknowledged', false], ['session.owner.preparedSha256', 'wrong'],
    ['session.nativeCollectionComplete', false], ['session.failure', 'prepare'], ['session.owner.job.pid', 0], ['session.owner.job.startFileTime', 'wrong'], ['session.owner.job.forced', true],
    ['session.owner.job.emptyJob', false], ['session.owner.job.killOnCloseAttempted', true], ['session.owner.job.exitCode', 1], ['session.referenceValidated', true], ['session.owner.extra', false],
    ['session.result.profile', 'other'], ['session.result.nonce', '0'.repeat(64)], ['session.result.requestSha256', '0'.repeat(64)], ['session.result.mainDateIdentityRetained', false],
    ['session.result.rendererCreated', true], ['session.result.appClockDirectlyObserved', true], ['session.result.executionAuthorized', true], ['session.result.extra', false],
    ['session.nativeBefore.qpcFrequency', '1'], ['session.nativeBefore.zoneRulesSha256', '0'.repeat(64)], ['session.nativeBefore.localOffsetMinutes', 0],
    ['session.nativeBefore.qpcBefore', '0'], ['session.nativeBefore.utcBeforeTicks', '1'], ['session.nativeAfter.extra', false],
  ];
  const envelopeChanges: readonly (readonly [string, unknown])[] = [
    ['profile', 'other'], ['extra', false], ['requestSha256', '0'.repeat(64)], ['intentSha256', '0'.repeat(64)], ['returnedEncoding', 'utf8'],
    ['returned.exitCode', 1], ['returned.signal', 'SIGTERM'], ['returned.timedOut', true], ['returned.transportFailure', 'deadline'],
    ['returned.transportState', 'unresolved'], ['returned.spawnReturnObserved', false], ['returned.transportCloseObserved', false],
    ['returned.observationGuardsComplete', false], ['returned.containmentRequest', 'accepted'],
    ['returned.windowsJobTerminationProved', true], ['returned.executionAuthorized', true],
    ['returned.rawStderrBase64', 'eA=='], ['returned.extra', false], ['returned.rawStdoutBase64', '*'],
    ['returned.rawStdoutBase64', Buffer.from([0xF0, 0x9F, 0x92]).toString('base64')], ['returned.rawStdoutBase64', Buffer.from('{').toString('base64')],
    ['returned.rawStdoutBase64', Buffer.alloc(131_073).toString('base64')],
  ];
  for (const [kind, cases] of [['intent', intentChanges], ['response', responseChanges], ['envelope', envelopeChanges]] as const) {
    for (const [path, replacement] of cases) {
      await context.test(`self-resealed ${kind} rejects ${path} ${String(replacement).slice(0, 30)}`, async () => {
        const i: unknown = JSON.parse(originalIntent.toString('utf8')), r: unknown = JSON.parse(originalResult.toString('utf8')); assert.ok(isRecord(i) && isRecord(r));
        if (kind === 'intent') { change(i, path, replacement); }
        else if (kind === 'envelope') { change(r, path, replacement); }
        else {
          const streams = r['returned']; assert.ok(isRecord(streams) && typeof streams['rawStdoutBase64'] === 'string');
          const response: unknown = JSON.parse(Buffer.from(streams['rawStdoutBase64'], 'base64').toString('utf8')); assert.ok(isRecord(response));
          change(response, path, replacement); streams['rawStdoutBase64'] = Buffer.from(JSON.stringify(response)).toString('base64');
        }
        const iText = `${JSON.stringify(i)}\n`; if (kind === 'intent') { r['intentSha256'] = sha256Text(iText); }
        const rText = `${JSON.stringify(r)}\n`;
        const altered = { ...input, mainReferenceIntent: { ...original.intentArtifact, bytes: Buffer.byteLength(iText), sha256: sha256Text(iText) },
          mainReferenceResult: { ...original.resultArtifact, bytes: Buffer.byteLength(rText), sha256: sha256Text(rText) } };
        try { await writeFile(original.intentArtifact.path, iText); await writeFile(original.resultArtifact.path, rText); await assert.rejects(reconstructRecordedMainReference(altered)); }
        finally { await writeFile(original.intentArtifact.path, originalIntent); await writeFile(original.resultArtifact.path, originalResult); }
      });
    }
  }
  await context.test('self-resealed v2-to-v1 field removal cannot downgrade current successful replay', async () => {
    const retained: unknown = JSON.parse(originalResult.toString('utf8'));
    assert.ok(isRecord(retained) && isRecord(retained['returned']));
    assert.equal(retained['profile'], 'private.main-reference-retained-result.v2');
    retained['profile'] = 'private.main-reference-retained-result.v1';
    for (const key of ['transportState', 'spawnReturnObserved', 'transportCloseObserved', 'observationGuardsComplete',
      'containmentRequest', 'windowsJobTerminationProved', 'executionAuthorized']) {
      assert.equal(Object.hasOwn(retained['returned'], key), true);
      assert.equal(Reflect.deleteProperty(retained['returned'], key), true);
    }
    assert.equal(Object.keys(retained['returned']).length, 6);
    const text = `${JSON.stringify(retained)}\n`;
    assert.notEqual(text, originalResult.toString('utf8'));
    const descriptor = { ...original.resultArtifact, bytes: Buffer.byteLength(text), sha256: sha256Text(text) };
    let changed = false;
    try {
      await writeFile(descriptor.path, text); changed = true;
      const observed = await readFile(descriptor.path);
      assert.equal(observed.byteLength, descriptor.bytes); assert.equal(sha256Text(observed.toString('utf8')), descriptor.sha256);
      await assert.rejects(reconstructRecordedMainReference({ ...input, mainReferenceResult: descriptor }), /Main reference retained transport refused/u);
      assert.equal(transport.calls, 1);
      assert.throws(() => assertOriginalMainReference(retained, f.engine, f.journal.operationId), /not issued/u);
    } finally { await writeFile(original.resultArtifact.path, originalResult); }
    assert.equal(changed, true);
    assert.deepEqual(await readFile(original.resultArtifact.path), originalResult);
    assert.strictEqual(f.stage.originalReturn(f.journal.operationId), originalReturn);
    const restoredReplay = await reconstructRecordedMainReference(input);
    assert.deepEqual(restoredReplay.result, original);
    assert.equal(canonicalJson(await loadClosedSymbolJournal(f.journal.operationId)), before);
    assert.equal(transport.calls, 1);
  });
  for (const [sequence, path, replacement] of [
    [2, 'launchReceipt.root.pid', 999], [3, 'phase', 'edit-admission'], [3, 'launchReceiptSha256', '0'.repeat(64)], [3, 'bridgeDispatch.sessionSequence', 99],
    [4, 'extra', false], [4, 'capture.runtimeIdentity.ok', false], [7, 'extra', false], [7, 'intent.windowHandle', '0'], [7, 'intent.preparedAt', '2026-02-30T00:00:00.000Z'],
    [8, 'extra', false], [8, 'closeReceipt.saveOrDiscardSelected', true], [9, 'proof.phase', 'closed-edit'], [9, 'source', '/synthetic/other'],
    [10, 'copyReceipt.closureProofSha256', '0'.repeat(64)], [10, 'sqlDigests.logicalSha256', '0'.repeat(64)],
  ] as const) {
    await context.test(`phase ${sequence} full producer rejects ${path}`, async () => {
      const events = structuredClone(loaded.events); const event = events[sequence - 1]; assert.ok(event && isRecord(event.data)); change(event.data, path, replacement);
      Object.assign(event, { dataSha256: sha256Json(event.data) });
      if (event.kind === 'intent') { Object.assign(event, { requestSha256: sha256Json(event.data) }); const next = events[sequence]; assert.ok(next); Object.assign(next, { requestSha256: event.requestSha256 }); }
      await assert.rejects(reconstructRecordedMainReference({ ...input, events }));
    });
  }
  await context.test('only a newly completed original inventory is accepted', async () => {
    await assert.rejects(reconstructRecordedMainReference({ ...input, baselineInventory: structuredClone(historical.inventory) }), /original inventory/u);
  });
  for (const field of ['mainReferenceIntent', 'mainReferenceResult'] as const) {
    for (const alteration of ['path', 'bytes', 'hash', 'extra', 'missing', 'partial'] as const) {
      await context.test(`${field} rejects ${alteration}`, async () => {
        const selected = { ...input[field] }; const originalBytes = field === 'mainReferenceIntent' ? originalIntent : originalResult;
        if (alteration === 'path') { selected.path += '.other'; }
        if (alteration === 'bytes') { selected.bytes += 1; }
        if (alteration === 'hash') { selected.sha256 = '0'.repeat(64); }
        if (alteration === 'extra') { selected['extra'] = false; }
        try {
          if (alteration === 'missing' || alteration === 'partial') { await writeFile(selected.path, alteration === 'missing' ? '' : '{'); }
          await assert.rejects(reconstructRecordedMainReference({ ...input, [field]: selected }));
        } finally { if (alteration === 'missing' || alteration === 'partial') { await writeFile(selected.path, originalBytes); } }
      });
    }
  }
  for (const relation of ['qpc-frequency', 'zone-rules', 'qpc-earlier'] as const) {
    await context.test(`self-consistent scratch clock still rejects baseline ${relation}`, async () => {
      const retained: unknown = JSON.parse(originalResult.toString('utf8')); assert.ok(isRecord(retained) && isRecord(retained['returned']));
      const streams = retained['returned']; assert.equal(typeof streams['rawStdoutBase64'], 'string');
      const response: unknown = JSON.parse(Buffer.from(String(streams['rawStdoutBase64']), 'base64').toString('utf8')); assert.ok(isRecord(response));
      const session = response['session']; assert.ok(isRecord(session));
      for (const name of ['nativeBefore', 'nativeAfter']) {
        const sample = session[name]; assert.ok(isRecord(sample));
        if (relation === 'zone-rules') { sample['zoneRulesSha256'] = '0'.repeat(64); }
        if (relation === 'qpc-frequency') { sample['qpcFrequency'] = String(BigInt(String(sample['qpcFrequency'])) * 2n); }
        for (const key of ['qpcBefore', 'qpcAfter']) {
          const counter = BigInt(String(sample[key]));
          if (relation === 'qpc-frequency') { sample[key] = String(counter * 2n); }
          if (relation === 'qpc-earlier') { sample[key] = String(counter / 1000n); }
        }
      }
      // These changes preserve the standalone scratch interval relation. The
      // Historical baseline join, not an invalid inner packet, must reject it.
      if (relation === 'qpc-earlier') {
        const first = session['nativeBefore'], last = session['nativeAfter']; assert.ok(isRecord(first) && isRecord(last));
        const originalResponse: unknown = JSON.parse(Buffer.from(String(streams['rawStdoutBase64']), 'base64').toString('utf8')); assert.ok(isRecord(originalResponse) && isRecord(originalResponse['session']));
        const originalSession = originalResponse['session']; assert.ok(isRecord(originalSession['nativeBefore']) && isRecord(originalSession['nativeAfter']));
        const delta = BigInt(String(originalSession['nativeBefore']['qpcBefore'])) - BigInt(String(first['qpcBefore']));
        for (const name of ['nativeBefore', 'nativeAfter']) { const sample = session[name]; const old = originalSession[name]; assert.ok(isRecord(sample) && isRecord(old));
          for (const key of ['qpcBefore', 'qpcAfter']) { sample[key] = String(BigInt(String(old[key])) - delta); } }
      }
      const metadata = await compileMainReferenceV3Metadata(original.request); validateMainReferenceTransportV3Result(response, metadata);
      streams['rawStdoutBase64'] = Buffer.from(JSON.stringify(response)).toString('base64');
      const text = `${JSON.stringify(retained)}\n`; const descriptor = { ...original.resultArtifact, bytes: Buffer.byteLength(text), sha256: sha256Text(text) };
      try { await writeFile(original.resultArtifact.path, text); await assert.rejects(reconstructRecordedMainReference({ ...input, mainReferenceResult: descriptor }), /Recorded main reference refused/u); }
      finally { await writeFile(original.resultArtifact.path, originalResult); }
    });
  }
  // A finite recheck sequence is not atomic multi-file locking. Test a real
  // Await boundary while retaining and restoring this synthetic input only.
  let changed = false, reads = 0; const open = fsPromises.open;
  context.mock.method(fsPromises, 'open', async (...args: Parameters<typeof open>): ReturnType<typeof open> => {
    const handle = await open(...args);
    if (basename(String(args[0])) === '10-baseline-main-reference-intent.json') { reads += 1; if (reads === 2) { input.journal.saved = true; changed = true; } }
    return handle;
  }); syncBuiltinESMExports();
  try { await assert.rejects(reconstructRecordedMainReference(input), /Recorded main reference refused/u); assert.equal(changed, true); }
  finally { context.mock.restoreAll(); syncBuiltinESMExports(); input.journal.saved = false; }
  assert.equal(canonicalJson(await loadClosedSymbolJournal(f.journal.operationId)), before); assert.equal(transport.calls, 1);
});
