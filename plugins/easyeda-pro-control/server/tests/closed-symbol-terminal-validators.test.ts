/** Actual synthetic full graph; transparent observation of fixed data validators. */
/* oxlint-disable node/no-top-level-await -- The fixed synthetic profile hook must precede dynamic stage imports in this isolated ESM test worker. */
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { test } from 'node:test';
import { installClosedSymbolTestProfiles } from './helpers/install-closed-symbol-test-profiles.ts';
import type { ClosedSymbolTerminalStage, assertOriginalClosedSymbolCompletion } from '../src/closed-symbol-terminal.ts';
import { loadClosedSymbolJournal } from '../src/closed-symbol-journal.ts';
import { isRecord, sha256Json } from '../src/core.ts';

await installClosedSymbolTestProfiles();
const { observedInvocations } = await import('./helpers/recorded-validator-observer.ts');

void test('actual full terminal replay invokes every fixed native producer check with the correct original inputs', async (context) => {
  const observerUrl = new URL('helpers/recorded-validator-observer.ts', import.meta.url).href;
  const sourceUrls = new Set(['../src/closed-symbol-recorded-native.ts', '../src/closed-symbol-recorded-termination.ts'].map(path => new URL(path, import.meta.url).href));
  // The observer's static imports loaded both unchanged originals before this
  // Resolve hook. It always returns their actual result and propagates errors.
  const hook = registerHooks({ resolve(specifier, parent, next) {
    // oxlint-disable-next-line node/callback-return -- Synchronous loader resolution must be inspected before selecting the transparent wrapper.
    const selected = next(specifier, parent);
    return sourceUrls.has(selected.url) && parent.parentURL !== observerUrl ? { url: observerUrl, shortCircuit: true } : selected;
  } });
  context.after(() => { hook.deregister(); });
  const { fixture } = await import('./helpers/closed-symbol-coordinator-fixture.ts');
  const terminal: { ClosedSymbolTerminalStage: typeof ClosedSymbolTerminalStage; assertOriginalClosedSymbolCompletion: typeof assertOriginalClosedSymbolCompletion } =
    await import('../src/closed-symbol-terminal.ts');
  const { assertOriginalClosedSymbolFullEvidence } = await import('../src/closed-symbol-coordinator.ts');
  const { artifactJson, phaseData } = await import('../src/closed-symbol-terminal-lifecycle.ts');
  const f = await fixture(context), full = await f.stage.recordFullEvidence(f.plan);
  const original = assertOriginalClosedSymbolFullEvidence(full, f.engine, full.operationId);
  const { events } = await loadClosedSymbolJournal(full.operationId);
  const qualification = await artifactJson(original.edit.witness.clockArtifact); assert.ok(isRecord(qualification));
  assert.equal(observedInvocations().length, 0);
  const nativeBefore = [...f.events];
  const result = await new terminal.ClosedSymbolTerminalStage(f.engine, f.machine).complete(full);
  terminal.assertOriginalClosedSymbolCompletion(result, f.engine, full.operationId);
  assert.equal(result.completionProved, true); assert.deepEqual(f.events, nativeBefore);
  const invocations = observedInvocations();
  const expected = [
    { kind: 'capture', ordinal: 0, phase: 'closed-baseline', attempt: 1, capture: phaseData(events, 4)['capture'], dispatch: phaseData(events, 3)['bridgeDispatch'] },
    { kind: 'capture', ordinal: 1, phase: 'closed-edit', attempt: 1, capture: phaseData(events, 14)['capture'], dispatch: phaseData(events, 13)['bridgeDispatch'] },
    { kind: 'capture', ordinal: 2, phase: 'closed-verification', attempt: 1, capture: phaseData(events, 32)['capture'], dispatch: phaseData(events, 31)['bridgeDispatch'] },
    { kind: 'capture', ordinal: 1, phase: 'closed-edit', attempt: 2, capture: qualification['beforeCapture'], dispatch: phaseData(events, 13)['bridgeDispatch'] },
    { kind: 'capture', ordinal: 1, phase: 'closed-edit', attempt: 3, capture: qualification['afterCapture'], dispatch: phaseData(events, 13)['bridgeDispatch'] },
    { kind: 'capture', ordinal: 2, phase: 'closed-verification', attempt: 2, capture: phaseData(events, 37)['clockCapture'], dispatch: phaseData(events, 31)['bridgeDispatch'] },
    { kind: 'termination', ordinal: 1, phase: 'closed-edit', attempt: 1, capture: phaseData(events, 14)['capture'], dispatch: phaseData(events, 13)['bridgeDispatch'] },
  ];
  for (const item of expected) {
    const matching = invocations.filter(row => row.kind === item.kind && row.ordinal === item.ordinal && row.phase === item.phase && row.attempt === item.attempt);
    assert.ok(matching.length > 0, `missing ${item.kind}/${item.phase}/${String(item.attempt)}`);
    for (const row of matching) { assert.equal(row.captureSha256, sha256Json(item.capture)); assert.equal(row.bridgeDispatchSha256, sha256Json(item.dispatch)); }
  }
  assert.equal(new Set(invocations.map(row => `${row.kind}/${row.ordinal}/${row.attempt}`)).size, expected.length);
  assert.equal(new Set(invocations.map(row => row.nativeSourceSha256)).size, 1);
  assert.notEqual(sha256Json(qualification['beforeCapture']), sha256Json(phaseData(events, 14)['capture']));
  assert.notEqual(sha256Json(qualification['afterCapture']), sha256Json(phaseData(events, 14)['capture']));
  context.diagnostic(JSON.stringify({ successfulChecks: invocations.length, exactKinds: expected.length, nativeCallsAdded: f.events.length - nativeBefore.length }));
});
