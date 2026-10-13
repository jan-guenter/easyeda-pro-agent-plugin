import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { compileMainReferenceTransport, invokeMainReferenceTransport } from '../src/closed-symbol-main-reference-transport.ts';
import { WITNESS_NATIVE_PINS_SHA256 } from '../src/closed-symbol-native-profile.ts';
import { sha256Text } from '../src/core.ts';
import { compileRecordedMainReferenceMetadata } from '../src/closed-symbol-recorded-main-reference-metadata.ts';

const root = new URL('../../', import.meta.url);
function sourceSection(text: string, start: string, end?: string): string {
  const first = text.indexOf(start);
  assert.notEqual(first, -1); assert.equal(text.indexOf(start, first + start.length), -1);
  if (end === undefined) { return text.slice(first); }
  const last = text.indexOf(end, first + start.length);
  assert.ok(last > first); assert.equal(text.indexOf(end, last + end.length), -1);
  return text.slice(first, last);
}
for (const [literal, referenceUtcMs] of [ ['2026-01-15 12:34:56', Date.parse('2026-10-13T12:00:00Z')],
  ['2026-07-15 12:34:56', Date.parse('2026-10-13T12:00:00Z')], ['2020-01-01 00:00:00', Date.parse('2026-01-13T12:00:00Z')] ] as const) {
  void test(`metadata-only command and input are byte-identical for ${literal}`, async () => {
    const input = { profile: 'private.exact-literal-main-reference.v1', nonce: 'a'.repeat(64), operationId: 'easyeda-20261012t000000z-12345678',
      closedPlanSha256: 'b'.repeat(64), baselineCopyReceiptSha256: 'c'.repeat(64), baselineLogicalSha256: 'd'.repeat(64), baselineClosureClockSha256: 'e'.repeat(64),
      nativePinsSha256: WITNESS_NATIVE_PINS_SHA256, historyUuid: '1'.repeat(32), createdAtLiteral: literal, referenceUtcMs };
    const original = await compileMainReferenceTransport(input); const metadata = await compileRecordedMainReferenceMetadata(input);
    assert.deepEqual(metadata, original); assert.equal(metadata.commandSha256, sha256Text(original.command));
    assert.match(metadata.command, /^#.*\nthrow 'UNREVIEWED MAIN REFERENCE TRANSPORT - DO NOT EXECUTE'/u);
    // This rejects synchronously before spawning: the metadata-only path never
    // Registers an invocation, even when every compiled byte matches.
    assert.throws(() => invokeMainReferenceTransport(metadata), /unissued or already consumed/u);
  });
}
void test('fixed baseline parser is only the reviewed edit parser retargeted to baseline', async () => {
  const original = await readFile(new URL('server/src/closed-symbol-recorded-termination.ts', root), 'utf8');
  const expected = original.replaceAll('validateRecordedTerminationEvidence', 'validateRecordedBaselineTerminationEvidence')
    .replaceAll('closed-edit', 'closed-baseline').replace('Exact historical termination', 'Exact historical baseline termination');
  assert.equal(await readFile(new URL('../src/closed-symbol-recorded-baseline-termination.ts', import.meta.url), 'utf8'), expected);
});
void test('packaged native refusal and all four exact source bytes remain unchanged', async () => {
  for (const [name, digest] of [ ['owner-command.ps1', 'f417642a0dffa2f80df33b6aafd5865aa944acb635b3a4b4814814dcdcfabbd5'],
    ['stdin-decoder.ps1', 'c16caba4dc933f299f25b3bc9acede20e590f8bad3cfdb66799aefb978631e90'],
    ['OwnedSyntheticJob.cs', 'e426dbcb9dd1ad646d63ad88b665381c08ee940c7c3159df19d71a2e24eaa727'],
    ['EasyedaClockObservation.cs', '97449e83f75b1c724717708c5a630669577f60cf7af142db66022cc73b4e656c'] ] as const) {
    const source = await readFile(new URL(`scripts/main-reference/${name}`, root), 'utf8');
    assert.equal(sha256Text(source), digest);
  }
});
void test('historical compiler and result validator retain exact maintained bodies without registration', async () => {
  const live = await readFile(new URL('server/src/closed-symbol-main-reference-transport.ts', root), 'utf8');
  const historical = await readFile(new URL('../src/closed-symbol-recorded-main-reference-metadata.ts', import.meta.url), 'utf8');
  const originalCompiler = sourceSection(live, 'export async function compileMainReferenceTransport(', '/** Current binary-helper compiler.');
  const newCompiler = sourceSection(historical, 'export async function compileRecordedMainReferenceMetadata', 'export function validateRecordedMainReferenceTransportResult');
  assert.equal(newCompiler, originalCompiler.replaceAll('compileMainReferenceTransport', 'compileRecordedMainReferenceMetadata')
    .replaceAll('CompiledMainReferenceTransport', 'RecordedMainReferenceMetadata').replace('compiled.add(result); return result;', 'return result;'));
  assert.equal(sourceSection(historical, 'export function validateRecordedMainReferenceTransportResult'),
    sourceSection(live, 'export function validateMainReferenceTransportResult').replaceAll('validateMainReferenceTransportResult', 'validateRecordedMainReferenceTransportResult')
      .replaceAll('CompiledMainReferenceTransport', 'RecordedMainReferenceMetadata'));
  assert.doesNotMatch(historical, /node:child_process|new WeakSet|compiled\.add|function invoke/u);
});
