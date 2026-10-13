/* oxlint-disable import/max-dependencies -- Actual stage graph, historical readers and original brand assertions are independent fixed dependencies. */
import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { installSyntheticNativeProfile } from './helpers/install-synthetic-native-profile.ts';
import { loadClosedSymbolJournal } from '../src/closed-symbol-journal.ts';
import { inspectRecordedClosedCopy } from '../src/closed-symbol-recorded-copy.ts';
import { validateRecordedNativeSource } from '../src/closed-symbol-recorded-native.ts';
import { isRecord } from '../src/core.ts';
import { reconstructRecordedAgedSymbolWitness } from '../src/closed-symbol-recorded-aged-witness.ts';
import { reconstructAgedClosedSymbolSqlEvidence } from '../src/closed-symbol-recorded-aged-sql.ts';
import { reconstructClosedSymbolSqlEvidence } from '../src/closed-symbol-recorded-sql.ts';
import { testAgedSqlAdversaries } from './helpers/closed-symbol-recorded-aged-sql-adversaries.ts';
// oxlint-disable-next-line node/no-top-level-await -- Install the worker-local source prerequisite only; original issuers remain unchanged.
const profile = await installSyntheticNativeProfile(); after(() => { profile.unregister(); });
// oxlint-disable-next-line node/no-top-level-await -- Issuer imports must follow the synthetic source-profile seam, without replacing original registries.
const { assertOriginalClosedSymbolComparison, assertOriginalClosedSymbolPreparation } = await import('../src/closed-symbol-sql-comparison.ts');
// oxlint-disable-next-line node/no-top-level-await -- This dependency imports the same witness graph and must also follow the I/O prerequisite.
const { assertOriginalSavedSymbolSource } = await import('../src/closed-symbol-saved-source.ts');
// oxlint-disable-next-line node/no-top-level-await -- The actual stage graph imports after the explicit synthetic I/O prerequisite.
const { savedReadFixture } = await import('./helpers/closed-symbol-recorded-aged-saved-read-fixture.ts');

void test('aged complete SQL and saved source replay equals original staged results', async context => {
  const f = await savedReadFixture(context); await f.readStage.read(f.readInput);
  f.state.scope = false;
  const closed = await f.close.close({ journal: f.journal, generation: f.verifyGeneration, capture: f.verifyAdmission.capture, phase: 'verify-close', windowHandle: '12345' });
  const proof = await f.close.prove(closed); const copied = await f.copyStage.copy(f.journal, 'verify-copy', f.verifyGeneration, proof);
  const verification = await f.sql.compareVerification({ journal: f.journal, proof, copy: copied.copy, inventory: copied.inventory, originalEditComparison: f.originalEditComparison });
  const loaded = await loadClosedSymbolJournal(f.journal.operationId);
  const initial = loaded.events[0]; const baselineAdmission = loaded.events[3]; assert.ok(initial && isRecord(initial.data) && baselineAdmission?.generation && 'captureSha256' in baselineAdmission.generation);
  const nativeSource = validateRecordedNativeSource({ journal: loaded.journal, fingerprint: f.identity, bootstrapStatus: initial.data['runtimeStatus'], launchClock: f.launchClock, launchGeneration: baselineAdmission.generation });
  const baseline = await inspectRecordedClosedCopy({ operationId: f.journal.operationId, phase: 'baseline-copy', runtime: f.sqlRuntime });
  const edit = await inspectRecordedClosedCopy({ operationId: f.journal.operationId, phase: 'edit-copy', runtime: f.sqlRuntime });
  const reopened = await inspectRecordedClosedCopy({ operationId: f.journal.operationId, phase: 'verify-copy', runtime: f.sqlRuntime });
  const historical = await reconstructRecordedAgedSymbolWitness({ ...loaded, baselineInventory: baseline.inventory, nativeSource, mainReferenceIntent: f.reference.intentArtifact, mainReferenceResult: f.reference.resultArtifact });
  const input = { ...loaded, baselineInventory: baseline.inventory, editInventory: edit.inventory, verificationInventory: reopened.inventory, witness: historical.result.witness, witnessClockArtifact: historical.result.clockArtifact };
  const result = await reconstructAgedClosedSymbolSqlEvidence(input);
  assert.deepEqual(result.preparation, f.preparation); assert.deepEqual(result.editComparison, f.originalEditComparison);
  assert.deepEqual(result.verificationComparison, verification); assert.deepEqual(result.savedSource, f.preparedSource);
  assert.equal(result.authorityRestored, false); assert.equal(result.executionAuthorized, false); assert.equal(result.completionProved, false);
  assert.equal(result.preparation.sqlPlan.headEligibility, 'aged-unlocked');
  assert.throws(() => assertOriginalClosedSymbolPreparation(result.preparation, f.engine, f.journal.operationId), /original/u);
  assert.throws(() => assertOriginalClosedSymbolComparison(result.editComparison, f.engine, f.journal.operationId, 'edit-sql-compare'), /original/u);
  assert.throws(() => assertOriginalSavedSymbolSource(result.savedSource, f.engine, f.journal.operationId), /Original successful/u);
  await assert.rejects(reconstructClosedSymbolSqlEvidence(input), /exact locked witness/u);
  const { agedHead: _removed, ...withoutAge } = historical.result.witness;
  await assert.rejects(reconstructAgedClosedSymbolSqlEvidence({ ...input, witness: withoutAge }), /exact aged witness/u);
  for (const [key, value] of [['createdAtLiteral', '2026-01-16 12:34:56'], ['nativeParsedLocalMs', 1], ['nativeTimezoneOffsetMinutes', -60]] as const) {
    await context.test(`aged preselected ${key} cannot be substituted`, async () => {
      assert.ok(input.witness.agedHead !== undefined); assert.notEqual(input.witness.agedHead[key], value);
      await assert.rejects(reconstructAgedClosedSymbolSqlEvidence({ ...input, witness: { ...input.witness, agedHead: { ...input.witness.agedHead, [key]: value } } }));
    });
  }
  await testAgedSqlAdversaries(context, input, { baseline: f.copied.copy.artifact, edit: f.edited.copy.artifact });
  assert.equal(f.transport.calls, 1); assert.equal(f.agedState.calls, 1); assert.equal(f.writeState.calls, 1); assert.equal(f.readState.calls, 1);
});
