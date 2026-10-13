/** Fixed historical producer data checks. Never registers or revives authority. */
import { canonicalJson, isRecord, sha256Json, validatePrivateFingerprint } from './core.ts';
import type { ClosedJournal, Generation } from './closed-symbol-journal.ts';
import { WITNESS_NATIVE_PINS_SHA256 } from './closed-symbol-native-profile.ts';
import { validateClockSample } from './windows-clock-transport.ts';

type Bag = Readonly<Record<string, unknown>>;
type JournalBinding = Pick<ClosedJournal, 'operationId' | 'plan'>;
type CapturePhase = 'closed-baseline' | 'closed-edit' | 'closed-verification';
const HELPER = '5a5095d463afcf8f595c3085ec7d5f377baa2e545b623bca81205137c602e608';
const HASH = /^[a-f0-9]{64}$/u, ID = /^[a-f0-9]{32}$/u, TOKEN = /^[A-Za-z0-9_-]{43}$/u;
const EPOCH = 621_355_968_000_000_000n;
function need(value: boolean): asserts value { if (!value) { throw new Error('Recorded native capture refused.'); } }
function exact(value: unknown, keys: readonly string[]): Bag {
  need(isRecord(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null) && Reflect.ownKeys(value).length === keys.length);
  const out: Record<string, unknown> = {};
  for (const key of keys) { const item = Object.getOwnPropertyDescriptor(value, key); need(item !== undefined && Object.hasOwn(item, 'value') && item.enumerable === true); out[key] = item.value as unknown; }
  return out;
}
function text(value: unknown, pattern: RegExp): string { need(typeof value === 'string' && pattern.test(value)); return value; }
function number(value: unknown, minimum: number, maximum = Number.MAX_SAFE_INTEGER): number { need(typeof value === 'number' && Number.isSafeInteger(value) && value >= minimum && value <= maximum); return value; }
function same(actual: unknown, expected: unknown): void { need(canonicalJson(actual) === canonicalJson(expected)); }
function freeze<T>(value: T): T { if (value !== null && typeof value === 'object') { for (const item of Object.values(value)) { freeze(item); } Object.freeze(value); } return value; }
function timestamp(value: unknown): string {
  const out = text(value, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3,7}Z$/u); const time = Date.parse(out);
  need(Number.isFinite(time) && new Date(time).toISOString() === `${out.slice(0, 23)}Z`); return out;
}
function processRow(value: unknown, generation: Generation): Bag {
  const p = exact(value, ['pid', 'role', 'startIdentity']); number(p['pid'], 1, 2_147_483_647);
  text(p['role'], /^(?:easyeda-main|easyeda-descendant|renderer|native-socket-owner)$/u);
  const start = text(p['startIdentity'], /^win32:\d{15,20}:job:[a-f0-9]{32}$/u); need(start.endsWith(`:job:${generation.jobId}`)); return p;
}
function processes(value: unknown, generation: Generation): readonly Bag[] {
  need(Array.isArray(value) && Object.getPrototypeOf(value) === Array.prototype && value.length > 0 && value.length <= 512 && Reflect.ownKeys(value).length === value.length + 1);
  const rows: Bag[] = []; let previous = 0;
  for (let index = 0; index < value.length; index += 1) {
    const item = Object.getOwnPropertyDescriptor(value, String(index)); need(item !== undefined && Object.hasOwn(item, 'value'));
    const row = processRow(item.value as unknown, generation); const pid = number(row['pid'], 1, 2_147_483_647); need(pid > previous); previous = pid; rows.push(row);
  }
  const roots = rows.filter(row => row['role'] === 'easyeda-main');
  need(roots.length === 1); same(roots[0], { pid: generation.rootPid, role: 'easyeda-main', startIdentity: generation.rootStartIdentity }); return rows;
}
function clock(value: unknown, phase: 'launch' | 'capture'): Readonly<{ attachment: Bag; before: ReturnType<typeof validateClockSample>; after: ReturnType<typeof validateClockSample> }> {
  const v = exact(value, ['schema', 'phase', 'baseSha256', 'helperSourceSha256', 'executionScopeSha256', 'base', 'clock', 'producerBindingVerified', 'executionAuthorized', 'ownerBinding']);
  need(v['schema'] === 'easyeda-pro-control.owned-clock-attachment.v1' && v['phase'] === phase && v['helperSourceSha256'] === HELPER && v['producerBindingVerified'] === false && v['executionAuthorized'] === false);
  text(v['baseSha256'], HASH); text(v['executionScopeSha256'], HASH);
  const c = exact(v['clock'], ['status', 'tzAbsentBefore', 'tzAbsentAfter', 'before', 'after']);
  need(c['status'] === 'observed' && c['tzAbsentBefore'] === true && c['tzAbsentAfter'] === true);
  const before = validateClockSample(c['before']); const after = validateClockSample(c['after']);
  need(before.qpcFrequency === after.qpcFrequency && before.zoneRulesSha256 === after.zoneRulesSha256 && before.localOffsetMinutes === after.localOffsetMinutes &&
    BigInt(after.qpcBefore) >= BigInt(before.qpcAfter) && BigInt(after.utcBeforeTicks) >= BigInt(before.utcAfterTicks));
  return { attachment: v, before, after };
}
export interface RecordedNativeSource {
  readonly helperSourceSha256: string; readonly executionScopeSha256: string; readonly executable: string; readonly executableSha256: string;
  readonly policySha256: string; readonly rawBasePropertyOrderReconstructed: false; readonly authorityRestored: false;
}
function policy(helper: string, executable: string, scope: string): string {
  return sha256Json({ schema: 'easyeda-pro-control.windows-authority-helper.v1', policyId: 'windows.easyeda-contained-local-api.v1', helperSha256: helper,
    expectedExecutableSha256: executable, reviewedExecutionScopeSha256: scope, containment: 'atomic-launch-job-list:no-breakaway:no-kill-on-close:retained-handles', excluded: 'outside-job-brokers-services-and-unreviewed-delegation' });
}
function sourceFields(value: RecordedNativeSource): void {
  exact(value, ['helperSourceSha256', 'executionScopeSha256', 'executable', 'executableSha256', 'policySha256', 'rawBasePropertyOrderReconstructed', 'authorityRestored']);
  // oxlint-disable-next-line typescript/no-unnecessary-boolean-literal-compare -- Data-only callers may pass malformed untyped historical fields.
  need(value.helperSourceSha256 === HELPER && value.rawBasePropertyOrderReconstructed === false && value.authorityRestored === false);
  text(value.executionScopeSha256, HASH); text(value.executableSha256, HASH);
  text(value.executable, /^[A-Za-z]:\\[^"\r\n]+\.exe$/u);
  for (const character of value.executable) { const code = character.codePointAt(0); need(code !== undefined && code >= 32 && code !== 127); }
  need(value.policySha256 === policy(HELPER, value.executableSha256, value.executionScopeSha256));
}
/** Fingerprint is the retained expected contract, not a new native observation.
 * The scope is the actual retained runtime option. It is not assumed to be the
 * facade digest; index normally supplies that digest, but the producer accepts
 * a separately bound option. Neither this function nor its result issues trust. */
export function validateRecordedNativeSource(input: Readonly<{ journal: JournalBinding; fingerprint: unknown; bootstrapStatus: unknown; launchClock: unknown; launchGeneration: Generation }>): RecordedNativeSource {
  validatePrivateFingerprint(input.fingerprint);
  need(input.journal.plan.nativePinsSha256 === WITNESS_NATIVE_PINS_SHA256 && sha256Json(input.fingerprint) === input.journal.plan.expectedFingerprintSha256);
  const status = exact(input.bootstrapStatus, ['state', 'launch', 'executableSha256', 'reviewedExecutionScopeSha256']);
  need(status['state'] === 'not-launched' && status['launch'] === null && status['executableSha256'] === null);
  const parsed = clock(input.launchClock, 'launch'); const data = parsed.attachment;
  const base = exact(data['base'], ['jobId', 'helperInstance', 'root']);
  need(base['jobId'] === input.launchGeneration.jobId && base['helperInstance'] === input.launchGeneration.helperInstance);
  const root = processRow(base['root'], input.launchGeneration); same(root, { pid: input.launchGeneration.rootPid, role: 'easyeda-main', startIdentity: input.launchGeneration.rootStartIdentity });
  const owner = exact(data['ownerBinding'], ['executable', 'executableSha256', 'launchSha256']); need(owner['launchSha256'] === sha256Json(base));
  const scope = text(data['executionScopeSha256'], HASH); need(status['reviewedExecutionScopeSha256'] === scope);
  const executable = text(owner['executable'], /^[A-Za-z]:\\[^"\r\n]+\.exe$/u), executableSha256 = text(owner['executableSha256'], HASH);
  const result: RecordedNativeSource = { helperSourceSha256: HELPER, executionScopeSha256: scope, executable, executableSha256,
    policySha256: policy(HELPER, executableSha256, scope), rawBasePropertyOrderReconstructed: false, authorityRestored: false };
  sourceFields(result); return Object.freeze(result);
}
export function validateRecordedCaptureEvidence(input: Readonly<{
  journal: JournalBinding; generation: Generation; capture: unknown; phase: CapturePhase; attempt: number; bridgeDispatch: unknown; source: RecordedNativeSource; clock?: unknown;
}>): Readonly<{ capture: Bag; clock: ReturnType<typeof clock> | null; authorityRestored: false; executionAuthorized: false }> {
  const { journal, generation, phase, attempt, source } = input;
  sourceFields(source); text(generation.jobId, ID); text(generation.helperInstance, ID);
  need(generation.ordinal === ['closed-baseline', 'closed-edit', 'closed-verification'].indexOf(phase)); number(attempt, 1, 3);
  const c = exact(input.capture, ['operationId', 'phase', 'challengeAttempt', 'bridgeSession', 'runtimeIdentity', 'executionAuthority']);
  need(c['operationId'] === journal.operationId && c['phase'] === phase && c['challengeAttempt'] === attempt);
  const session = exact(c['bridgeSession'], ['authenticatedAtEpochMs', 'authenticationReceiptSha256', 'gatewayInstanceId', 'sequence', 'sessionId']);
  text(session['authenticationReceiptSha256'], HASH); text(session['gatewayInstanceId'], TOKEN); text(session['sessionId'], TOKEN);
  number(session['authenticatedAtEpochMs'], 1); number(session['sequence'], 1);
  const runtime = exact(c['runtimeIdentity'], ['ok', 'kind', 'generation', 'timeOrigin', 'processId']);
  need(runtime['ok'] === true && runtime['kind'] === 'runtime-identity' && typeof runtime['generation'] === 'string' && runtime['generation'].length >= 24 && runtime['generation'].length <= 48_000 &&
    typeof runtime['timeOrigin'] === 'number' && Number.isFinite(runtime['timeOrigin']) && runtime['timeOrigin'] > 0);
  const runtimePid = runtime['processId']; if (runtimePid !== null) { number(runtimePid, 1, 2_147_483_647); }
  const dispatch = exact(input.bridgeDispatch, ['begunAtEpochMs', 'bindingReceipt', 'gatewayInstanceId', 'leaseId', 'schema', 'sessionId', 'sessionSequence']);
  need(dispatch['schema'] === 'easyeda-pro-control.bridge-dispatch-lease.v1' && dispatch['gatewayInstanceId'] === session['gatewayInstanceId'] && dispatch['sessionId'] === session['sessionId'] && dispatch['sessionSequence'] === session['sequence']);
  number(dispatch['begunAtEpochMs'], Number(session['authenticatedAtEpochMs'])); text(dispatch['bindingReceipt'], TOKEN); text(dispatch['leaseId'], TOKEN);
  need(sha256Json(session) === generation.sessionSha256 && sha256Json(runtime) === generation.runtimeSha256);
  const a = exact(c['executionAuthority'], ['schema', 'bindingSha256', 'policyId', 'policySha256', 'capturedAt', 'processes', 'processTreeSha256', 'authoritySha256']);
  need(a['schema'] === 'easyeda-pro-control.execution-authority.v1' && a['policyId'] === 'windows.easyeda-contained-local-api.v1' && a['policySha256'] === source.policySha256);
  const capturedAt = timestamp(a['capturedAt']), rows = processes(a['processes'], generation);
  if (runtimePid !== null) { need(rows.some(row => row['pid'] === runtimePid && row['role'] === 'renderer')); }
  need(a['processTreeSha256'] === sha256Json(rows) && a['bindingSha256'] === sha256Json({ schema: 'easyeda-pro-control.closed-session-authority-binding.v1', operationId: journal.operationId,
    phase, challengeAttempt: attempt, bridgeSession: session, bridgeDispatch: dispatch, runtimeIdentity: runtime }));
  const { authoritySha256, ...body } = a; need(authoritySha256 === sha256Json(body));
  if (attempt === 1) { need(sha256Json(c) === generation.captureSha256); }
  let parsed: ReturnType<typeof clock> | null = null;
  if (input.clock !== undefined) {
    parsed = clock(input.clock, 'capture'); const data = parsed.attachment;
    need(data['executionScopeSha256'] === source.executionScopeSha256);
    const base = exact(data['base'], ['jobId', 'helperInstance', 'bindingSha256', 'capturedAt', 'processes', 'runtimePid', 'socketOwnerPid']);
    need(base['jobId'] === generation.jobId && base['helperInstance'] === generation.helperInstance && base['bindingSha256'] === a['bindingSha256'] && base['capturedAt'] === capturedAt && base['runtimePid'] === runtimePid);
    same(base['processes'], rows);
    const socket = base['socketOwnerPid']; if (socket !== null) { number(socket, 1, 2_147_483_647); need(rows.some(row => row['pid'] === socket)); }
    need(runtimePid !== null || socket !== null);
    same(data['ownerBinding'], { operationId: journal.operationId, phase, challengeAttempt: attempt, bindingSha256: a['bindingSha256'],
      bridgeSessionSha256: generation.sessionSha256, runtimeIdentitySha256: generation.runtimeSha256, authoritySha256 });
    const time = Date.parse(capturedAt); const lower = Number((BigInt(parsed.before.utcBeforeTicks) - EPOCH) / 10_000n), upper = Number((BigInt(parsed.after.utcAfterTicks) - EPOCH + 9999n) / 10_000n);
    need(time >= lower && time <= upper);
  }
  return freeze(structuredClone({ capture: c, clock: parsed, authorityRestored: false as const, executionAuthorized: false as const }));
}
