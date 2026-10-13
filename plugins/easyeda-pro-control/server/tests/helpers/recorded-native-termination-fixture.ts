/** Synthetic data only. Copied from the frozen 66-case fixture; no native issuer. */
import { FAMILY } from '../../src/closed-symbol-journal.ts';
import type { ClosedSymbolPlan } from '../../src/closed-symbol-journal.ts';
import { loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint, sha256Json } from '../../src/core.ts';
import { WITNESS_NATIVE_PINS_SHA256 } from '../../src/closed-symbol-native-profile.ts';
import { IDS, OPERATION } from './symbol-sql-fixture.ts';
import { validateRecordedNativeSource } from '../../src/closed-symbol-recorded-native.ts';
import type { validateClockSample } from '../../src/windows-clock-transport.ts';

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
function sample(time: number): ReturnType<typeof validateClockSample> { return { schema: 'easyeda-pro-control.windows-clock-sample.v1', utcBeforeTicks: String(621_355_968_000_000_000n + BigInt(time) * 10_000n),
  utcAfterTicks: String(621_355_968_000_000_000n + BigInt(time + 1) * 10_000n), qpcBefore: String(time), qpcAfter: String(time + 1), qpcFrequency: '1000',
  highResolution: true, localOffsetMinutes: 120, zoneRulesSha256: 'a'.repeat(64) }; }
// oxlint-disable-next-line typescript/explicit-function-return-type, typescript/explicit-module-boundary-types -- Preserve the exact writable synthetic fixture shape for adversarial mutations.
export function fixture(phase: 'closed-baseline' | 'closed-edit' | 'closed-verification' = 'closed-edit', attempt = 2, runtimePid: number | null = 101) {
  const identity = fingerprint(); const helperInstance = 'c'.repeat(32), jobId = 'b'.repeat(32), operationId = 'easyeda-20261012t000000z-12345678';
  const journal = { operationId, plan: { profile: FAMILY, projectUuid: IDS.project, branchUuid: IDS.branch, ownerUuid: IDS.actor, targetUuid: IDS.target,
    activeUuid: IDS.peer, projectPath: '/synthetic/project.eprj2', operation: OPERATION, marker: { namespaceNonce: '1'.repeat(64), keyNonce: '2'.repeat(64), bodyNonce: '3'.repeat(64) },
    nativePinsSha256: WITNESS_NATIVE_PINS_SHA256, facadeSha256: 'd'.repeat(64), expectedFingerprintSha256: sha256Json(identity) } satisfies ClosedSymbolPlan };
  const generation = { ordinal: ['closed-baseline', 'closed-edit', 'closed-verification'].indexOf(phase), jobId, helperInstance, rootPid: 100,
    rootStartIdentity: `win32:134362560000000000:job:${jobId}`, sessionSha256: '', runtimeSha256: '', captureSha256: '' };
  const launch = { jobId, helperInstance, root: { pid: 100, role: 'easyeda-main', startIdentity: generation.rootStartIdentity } };
  const clockValues = { status: 'observed', tzAbsentBefore: true, tzAbsentAfter: true, before: sample(1000), after: sample(1010) };
  const common = { schema: 'easyeda-pro-control.owned-clock-attachment.v1', baseSha256: 'f'.repeat(64), helperSourceSha256: helper, executionScopeSha256: 'e'.repeat(64),
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
