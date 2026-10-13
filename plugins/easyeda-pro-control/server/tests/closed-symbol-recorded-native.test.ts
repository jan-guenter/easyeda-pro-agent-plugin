import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { FAMILY } from '../src/closed-symbol-journal.ts';
import type { ClosedSymbolPlan } from '../src/closed-symbol-journal.ts';
import { isRecord, loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint, sha256Json } from '../src/core.ts';
import { WITNESS_NATIVE_PINS_SHA256 } from '../src/closed-symbol-native-profile.ts';
import { IDS, OPERATION } from './helpers/symbol-sql-fixture.ts';
import { validateRecordedCaptureEvidence, validateRecordedNativeSource } from '../src/closed-symbol-recorded-native.ts';
import type { validateClockSample } from '../src/windows-clock-transport.ts';

type Bag = Record<string, unknown>;
function fingerprint(): Bag {
  const m = loadReviewedCompatibilityManifest(); const f = m.facadeImplementation['source-tree'], r = m.connectedRuntime;
  return { facadeImplementation: { ...f, mode: 'source-tree', files: f.files.map(file => { const projected = { path: `/synthetic/${file.relativePath}` }; return Object.assign(projected, file); }) },
    upstreamServer: { version: m.upstream.serverVersion }, upstreamLauncher: m.upstream.launcher, upstreamImplementationDrift: false,
    reviewedCompatibilityManifest: reviewedCompatibilityManifestFingerprint(), toolCount: m.upstream.toolCatalog.count, toolCatalogSha256: m.upstream.toolCatalog.sha256,
    health: { payload: { version: r.healthVersion, node_version: r.nodeVersion, bridge_connected: true, easyeda_version: r.easyedaVersion, extension_version: r.extensionVersion, extension_version_mismatch: false, registry_mismatch: false } },
    bridge: { payload: { connected: true, bridge_version: r.bridgeVersion, ...(r.bridgeEasyedaVersion === null ? {} : { easyeda_version: r.bridgeEasyedaVersion }), diagnostics: { method_registry_hash: r.methodRegistryHash } } },
    bridgeDispatcher: { payload: { source: r.dispatcher.source, dispatcher_build_id: r.dispatcher.buildId, total: r.dispatcher.total } },
    installedBundles: { available: true, assetsRoot: '/synthetic/assets', pcbEditor: { ...m.installedBundles.pcbEditor, implementationPath: '/synthetic/pcb.js' },
      publicApi: { ...m.installedBundles.publicApi, implementationPath: '/synthetic/api.js', adapterPath: '/synthetic/adapter.js', declarationsPath: '/synthetic/api.d.ts' } } };
}
const helper = '5a5095d463afcf8f595c3085ec7d5f377baa2e545b623bca81205137c602e608';
const currentHelper = '811d22eca033a31b58a9963ee7d51d2a3ed8182a0d859e511a42cbae68786c65';
function sample(time: number): ReturnType<typeof validateClockSample> { return { schema: 'easyeda-pro-control.windows-clock-sample.v1', utcBeforeTicks: String(621_355_968_000_000_000n + BigInt(time) * 10_000n),
  utcAfterTicks: String(621_355_968_000_000_000n + BigInt(time + 1) * 10_000n), qpcBefore: String(time), qpcAfter: String(time + 1), qpcFrequency: '1000',
  highResolution: true, localOffsetMinutes: 120, zoneRulesSha256: 'a'.repeat(64) }; }
// oxlint-disable-next-line typescript/explicit-function-return-type -- Preserve the exact writable synthetic fixture shape for adversarial mutations.
function fixture(phase: 'closed-baseline' | 'closed-edit' | 'closed-verification' = 'closed-edit', attempt = 2, runtimePid: number | null = 101, selectedHelper: string = helper) {
  const identity = fingerprint(); const helperInstance = 'c'.repeat(32), jobId = 'b'.repeat(32), operationId = 'easyeda-20261012t000000z-12345678';
  const journal = { operationId, plan: { profile: FAMILY, projectUuid: IDS.project, branchUuid: IDS.branch, ownerUuid: IDS.actor, targetUuid: IDS.target,
    activeUuid: IDS.peer, projectPath: '/synthetic/project.eprj2', operation: OPERATION, marker: { namespaceNonce: '1'.repeat(64), keyNonce: '2'.repeat(64), bodyNonce: '3'.repeat(64) },
    nativePinsSha256: WITNESS_NATIVE_PINS_SHA256, facadeSha256: 'd'.repeat(64), expectedFingerprintSha256: sha256Json(identity) } satisfies ClosedSymbolPlan };
  const generation = { ordinal: ['closed-baseline', 'closed-edit', 'closed-verification'].indexOf(phase), jobId, helperInstance, rootPid: 100,
    rootStartIdentity: `win32:134362560000000000:job:${jobId}`, sessionSha256: '', runtimeSha256: '', captureSha256: '' };
  const launch = { jobId, helperInstance, root: { pid: 100, role: 'easyeda-main', startIdentity: generation.rootStartIdentity } };
  const clockValues = { status: 'observed', tzAbsentBefore: true, tzAbsentAfter: true, before: sample(1000), after: sample(1010) };
  const common = { schema: 'easyeda-pro-control.owned-clock-attachment.v1', baseSha256: 'f'.repeat(64), helperSourceSha256: selectedHelper, executionScopeSha256: 'e'.repeat(64),
    producerBindingVerified: false, executionAuthorized: false, clock: clockValues };
  const launchClock = { ...structuredClone(common), phase: 'launch', base: launch,
    ownerBinding: { executable: 'C:\\Synthetic\\easyeda-pro.exe', executableSha256: 'd'.repeat(64), launchSha256: sha256Json(launch) } };
  const bootstrapStatus = { state: 'not-launched', launch: null, executableSha256: null, reviewedExecutionScopeSha256: 'e'.repeat(64) };
  const sourceInput = { journal, fingerprint: identity, bootstrapStatus, launchClock, launchGeneration: generation };
  const source = validateRecordedNativeSource(sourceInput);
  const session = { authenticatedAtEpochMs: 500, authenticationReceiptSha256: '1'.repeat(64), gatewayInstanceId: 'g'.repeat(43), sequence: 1, sessionId: 's'.repeat(43) };
  const runtime: Bag = { ok: true, kind: 'runtime-identity', generation: 'synthetic-runtime-generation-001', timeOrigin: 500.5, processId: runtimePid };
  const bridgeDispatch: Bag = { schema: 'easyeda-pro-control.bridge-dispatch-lease.v1', gatewayInstanceId: session.gatewayInstanceId, sessionId: session.sessionId,
    sessionSequence: 1, begunAtEpochMs: 501, leaseId: 'l'.repeat(43), bindingReceipt: 'b'.repeat(43) };
  const rows: Bag[] = [launch.root, { pid: 101, role: 'renderer', startIdentity: `win32:134362560000000001:job:${jobId}` }];
  const authority: Bag = { schema: 'easyeda-pro-control.execution-authority.v1', bindingSha256: '', policyId: 'windows.easyeda-contained-local-api.v1', policySha256: source.policySha256,
    capturedAt: '1970-01-01T00:00:01.0050000Z', processes: rows, processTreeSha256: '', authoritySha256: '' };
  const capture = { operationId, phase, challengeAttempt: attempt, bridgeSession: session, runtimeIdentity: runtime, executionAuthority: authority };
  const clock: Bag = { ...structuredClone(common), phase: 'capture', base: {}, ownerBinding: {} };
  const input = { journal, generation, capture, phase, attempt, bridgeDispatch, source, clock };
  function seal(): void {
    generation.sessionSha256 = sha256Json(session); generation.runtimeSha256 = sha256Json(runtime);
    authority['bindingSha256'] = sha256Json({ schema: 'easyeda-pro-control.closed-session-authority-binding.v1', operationId, phase, challengeAttempt: attempt,
      bridgeSession: session, bridgeDispatch, runtimeIdentity: runtime });
    authority['processTreeSha256'] = sha256Json(rows); const { authoritySha256: _ignored, ...body } = authority; authority['authoritySha256'] = sha256Json(body);
    generation.captureSha256 = sha256Json(capture);
    clock['base'] = { jobId, helperInstance, bindingSha256: authority['bindingSha256'], capturedAt: authority['capturedAt'], processes: structuredClone(rows), runtimePid,
      socketOwnerPid: runtimePid === null ? 101 : null };
    clock['ownerBinding'] = { operationId, phase, challengeAttempt: attempt, bindingSha256: authority['bindingSha256'], bridgeSessionSha256: generation.sessionSha256,
      runtimeIdentitySha256: generation.runtimeSha256, authoritySha256: authority['authoritySha256'] };
  }
  seal(); return { input, sourceInput, rows, authority, runtime, session, clock, seal };
}
for (const phase of ['closed-baseline', 'closed-edit', 'closed-verification'] as const) {
  for (const attempt of [1, 2, 3]) { for (const pid of [101, null]) {
    void test(`exact recorded ${phase} attempt${String(attempt)} pid${String(pid)} remains data only`, () => {
      const f = fixture(phase, attempt, pid), result = validateRecordedCaptureEvidence(f.input);
      assert.deepEqual(result.capture, f.input.capture); assert.equal(result.authorityRestored, false); assert.equal(result.executionAuthorized, false);
      assert.ok(Object.isFrozen(result.capture)); assert.ok(result.clock !== null && Object.isFrozen(result.clock));
      assert.equal(f.input.source.rawBasePropertyOrderReconstructed, false);
    });
  } }
}
function row(f: ReturnType<typeof fixture>, index: number): Bag { const value = f.rows[index]; assert.ok(value !== undefined); return value; }
const mutations: readonly (readonly [string, (f: ReturnType<typeof fixture>) => void])[] = [
  ['runtime ok', (f: ReturnType<typeof fixture>) => { delete f.runtime['ok']; }],
  ['runtime extra', f => { f.runtime['extra'] = true; }], ['runtime kind', f => { f.runtime['kind'] = 'wrong'; }],
  ['runtime generation', f => { f.runtime['generation'] = 'short'; }], ['runtime time', f => { f.runtime['timeOrigin'] = 0; }],
  ['session token', f => { f.session.sessionId = '!'.repeat(43); }], ['session sequence', f => { f.session.sequence = 0; }],
  ['session time', f => { f.session.authenticatedAtEpochMs = 0; }], ['session hash', f => { f.session.authenticationReceiptSha256 = 'wrong'; }],
  ['dispatch session', f => { f.input.bridgeDispatch['sessionId'] = 'x'.repeat(43); }],
  ['dispatch time', f => { f.input.bridgeDispatch['begunAtEpochMs'] = 499; }], ['dispatch extra', f => { f.input.bridgeDispatch['extra'] = true; }],
  ['authority schema', f => { f.authority['schema'] = 'wrong'; }], ['authority policy', f => { f.authority['policyId'] = 'other'; }],
  ['authority policy hash', f => { f.authority['policySha256'] = '0'.repeat(64); }], ['authority extra', f => { f.authority['extra'] = true; }],
  ['capture date', f => { f.authority['capturedAt'] = '1970-01-01'; }], ['capture outside bracket', f => { f.authority['capturedAt'] = '1970-01-01T00:00:02.000Z'; }],
  ['unsorted processes', f => { f.rows.reverse(); }], ['duplicate process', f => { f.rows.push(structuredClone(row(f, 1))); }],
  ['process role', f => { row(f, 1)['role'] = 'other'; }], ['runtime not renderer', f => { row(f, 1)['role'] = 'easyeda-descendant'; }],
  ['process job', f => { row(f, 1)['startIdentity'] = `win32:134362560000000001:job:${'f'.repeat(32)}`; }],
  ['process pid', f => { row(f, 1)['pid'] = 2_147_483_648; }], ['root mismatch', f => { row(f, 0)['startIdentity'] = `win32:134362560000000001:job:${f.input.generation.jobId}`; }],
];
for (const [name, mutate] of mutations) {
  void test(`self-resealed ${name} refuses`, () => { const f = fixture(); mutate(f); f.seal(); assert.throws(() => validateRecordedCaptureEvidence(f.input), /Recorded native capture refused/u); });
}
const clockMutations: readonly (readonly [string, unknown])[] = [
  ['base.runtimePid', 999], ['base.socketOwnerPid', 999], ['base.extra', true], ['baseSha256', 'wrong'], ['phase', 'launch'],
  ['executionScopeSha256', 'f'.repeat(64)], ['helperSourceSha256', 'f'.repeat(64)], ['producerBindingVerified', true], ['executionAuthorized', true],
  ['ownerBinding.challengeAttempt', 3], ['clock.extra', true], ['clock.tzAbsentAfter', false], ['clock.after.qpcBefore', '0'],
  ['clock.after.zoneRulesSha256', 'b'.repeat(64)], ['clock.after.localOffsetMinutes', 0], ['clock.after.qpcFrequency', '1001'],
];
for (const [path, value] of clockMutations) {
  void test(`exact clock ${path} refuses`, () => {
    const f = fixture(); let selected = f.clock; const parts = path.split('.'); const last = parts.pop(); assert.ok(last !== undefined && last.length > 0);
    for (const part of parts) { const next = selected[part]; assert.ok(isRecord(next)); selected = next; }
    assert.notDeepEqual(selected[last], value); selected[last] = value;
    assert.throws(() => validateRecordedCaptureEvidence(f.input), /Recorded native capture refused|CLOCK_RECEIPT_REFUSED/u);
  });
}
void test('capture cannot use neither a renderer PID nor a probe/socket owner', () => {
  const f = fixture('closed-edit', 2, null); const base = f.clock['base']; assert.ok(isRecord(base)); base['socketOwnerPid'] = null;
  assert.throws(() => validateRecordedCaptureEvidence(f.input), /Recorded native capture refused/u);
});
void test('strict known native source pins and bootstrap continuity refuse changes', () => {
  for (const path of ['native', 'fingerprint', 'scope', 'helper', 'launch', 'executable', 'status']) {
    const f = fixture();
    if (path === 'native') { f.sourceInput.journal.plan.nativePinsSha256 = '0'.repeat(64); }
    if (path === 'fingerprint') { f.sourceInput.journal.plan.expectedFingerprintSha256 = '0'.repeat(64); }
    if (path === 'scope') { f.sourceInput.bootstrapStatus.reviewedExecutionScopeSha256 = '0'.repeat(64); }
    if (path === 'helper') { f.sourceInput.launchClock.helperSourceSha256 = '0'.repeat(64); }
    if (path === 'launch') { f.sourceInput.launchClock.ownerBinding.launchSha256 = '0'.repeat(64); }
    if (path === 'executable') { f.sourceInput.launchClock.ownerBinding.executable = 'C:\\bad\u0001.exe'; }
    if (path === 'status') { f.sourceInput.bootstrapStatus.state = 'owned'; }
    assert.throws(() => validateRecordedNativeSource(f.sourceInput), /Recorded native capture refused/u, path);
  }
});
void test('helper literal and actual native runtime producer shape remain source-backed', async () => {
  const authority = await readFile(new URL('../src/windows-authority.ts', import.meta.url), 'utf8');
  assert.ok(authority.includes(`const REVIEWED_CLOCK_HELPER_SHA256 = "${currentHelper}";`));
  const helperBytes = await readFile(new URL('../../scripts/windows-authority.ps1', import.meta.url));
  assert.equal(createHash('sha256').update(helperBytes).digest('hex'), currentHelper);
  const decoder = await readFile(new URL('../src/closed-symbol-recorded-native.ts', import.meta.url), 'utf8');
  assert.ok(decoder.includes(`const HELPER = '${helper}';`) && decoder.includes(`const CURRENT_HELPER = '${currentHelper}';`));
  const runtime = await readFile(new URL('../src/runtime-scripts.ts', import.meta.url), 'utf8');
  assert.ok(runtime.includes('ok: true,\n    kind: "runtime-identity",\n    generation,\n    timeOrigin,\n    processId:'));
});
void test('current reviewed helper remains data only and has its own bound policy', () => {
  const current = fixture('closed-edit', 2, 101, currentHelper), historical = fixture();
  const result = validateRecordedCaptureEvidence(current.input);
  assert.equal(current.input.source.helperSourceSha256, currentHelper);
  assert.notEqual(current.input.source.policySha256, historical.input.source.policySha256);
  assert.equal(result.authorityRestored, false); assert.equal(result.executionAuthorized, false);
  assert.ok(Object.isFrozen(result.capture));
});
void test('known helper generations cannot be mixed between launch, policy and capture', () => {
  for (const selected of [helper, currentHelper]) {
    const f = fixture('closed-edit', 2, 101, selected), other = selected === helper ? currentHelper : helper;
    f.clock['helperSourceSha256'] = other;
    assert.throws(() => validateRecordedCaptureEvidence(f.input), /Recorded native capture refused/u);
    f.clock['helperSourceSha256'] = selected;
    assert.throws(() => validateRecordedCaptureEvidence({ ...f.input, source: { ...f.input.source, helperSourceSha256: other } }), /Recorded native capture refused/u);
  }
});
void test('complete process bound is512, not the draft lifecycle256', () => {
  const f = fixture();
  for (let index = 2; index < 512; index += 1) { f.rows.push({ pid: 100 + index, role: 'easyeda-descendant', startIdentity: `win32:134362560000000001:job:${f.input.generation.jobId}` }); }
  f.seal(); assert.equal(validateRecordedCaptureEvidence(f.input).authorityRestored, false);
  f.rows.push({ pid: 612, role: 'easyeda-descendant', startIdentity: `win32:134362560000000001:job:${f.input.generation.jobId}` }); f.seal();
  assert.throws(() => validateRecordedCaptureEvidence(f.input), /Recorded native capture refused/u);
});
void test('missing, extra, accessor and inherited record fields refuse without executing getters', () => {
  for (const name of ['missing', 'extra', 'accessor', 'prototype']) {
    const f = fixture(); let reads = 0;
    if (name === 'missing') { delete f.authority['capturedAt']; }
    if (name === 'extra') { f.clock['extra'] = true; }
    if (name === 'accessor') { Object.defineProperty(f.authority, 'capturedAt', { get() { reads += 1; return '1970-01-01T00:00:01.0050000Z'; }, enumerable: true }); }
    if (name === 'prototype') { Object.setPrototypeOf(f.authority, { inherited: true }); }
    assert.throws(() => validateRecordedCaptureEvidence(f.input), /Recorded native capture refused/u); assert.equal(reads, 0);
  }
});
void test('self-sealed capture binding must equal the original admission dispatch relation', () => {
  const f = fixture(); f.authority['bindingSha256'] = '0'.repeat(64);
  const { authoritySha256: _ignored, ...body } = f.authority; f.authority['authoritySha256'] = sha256Json(body);
  assert.throws(() => validateRecordedCaptureEvidence(f.input), /Recorded native capture refused/u);
});
void test('calendar-normalized impossible capturedAt refuses without relying on a clock bracket', () => {
  const f = fixture('closed-baseline', 1); f.authority['capturedAt'] = '2026-02-30T12:00:00.1234567Z'; f.seal();
  const { clock: _clock, ...input } = f.input;
  assert.throws(() => validateRecordedCaptureEvidence(input), /Recorded native capture refused/u);
});
