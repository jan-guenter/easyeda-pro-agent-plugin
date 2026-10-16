/** Conditional persisted-value comparison. No dispatch issuer or writer authority. */
import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import { decodeCurrentSymbolTransactionActorHistory, prepareCurrentSymbolTransactionActor, verifyCurrentSymbolTransactionActor } from "./current-symbol-transaction-actor.ts";
import type { CurrentSymbolTransactionActorInput, CurrentSymbolTransactionActorPlan } from "./current-symbol-transaction-actor.ts";
import { assertCurrentIssuedWindowsClockObservation, assertIssuedWindowsClockObservation, windowsClockObservationForResult } from "./windows-authority.ts";
import type { IssuedWindowsClockObservation } from "./windows-authority.ts";
import { validateClockSample } from "./windows-clock-transport.ts";

type Inventory = CurrentSymbolTransactionActorInput["before"];
type Identity = Omit<CurrentSymbolTransactionActorInput["bounds"], "documentClockMinMs" | "documentClockMaxMs" |
  "backendClockMinMs" | "backendClockMaxMs" | "backendLocalOffsetMinutes">;
type Bag = Readonly<Record<string, unknown>>;
const EPOCH_TICKS = 621_355_968_000_000_000n;
const COLLECTION_MS = 10_000, WINDOW_MS = 60_000;
const LIMITS = Object.freeze({ dispatchOwnershipVerified: false, documentSampleProvenanceVerified: false,
  sourceOwnershipVerified: false, startupQualified: false, producerBindingVerified: false,
  appClockDirectlyObserved: false, continuousClockStabilityProved: false, futureWriteClockVerified: false,
  entireJobExitedWithinOriginalWindow: false, persistentUploadReplayExcluded: false, reopened: false,
  writerReady: false, executionAuthorized: false } as const);
const ASSUMPTIONS = Object.freeze({ commonOsClockAndNoInterveningChangeRequired: true,
  reviewedOrdinaryDateAndVfsImplementationsRequired: true, noOtherTargetWriterRequired: true } as const);

export interface CurrentSymbolDocumentClockSample {
  readonly rendererBeforeMs: number; readonly serverTimeMs: number; readonly rendererAfterMs: number;
  readonly rendererBeforeIso: string; readonly rendererAfterIso: string;
  readonly rendererTimezoneOffsetMinutes: number; readonly notifyTabId: string;
}
export interface CurrentSymbolTransactionClockInput {
  readonly before: Inventory; readonly operation: unknown; readonly startupActor: unknown; readonly cachedActor: unknown;
  readonly comparisonIdentity: Identity;
  /** An opaque same-object reservation only. No production dispatch issuer exists yet. */
  readonly dispatchOwner: object;
  readonly launchClock: IssuedWindowsClockObservation; readonly captureClock: IssuedWindowsClockObservation;
  readonly beforeClock: IssuedWindowsClockObservation; readonly armedClock: IssuedWindowsClockObservation;
  readonly documentBefore: CurrentSymbolDocumentClockSample;
}
export interface CurrentSymbolTransactionClockPlan extends Readonly<typeof LIMITS>, Readonly<typeof ASSUMPTIONS> {
  readonly profile: "easyeda-pro-control.current-symbol-transaction-clock-plan.v1";
  readonly operationId: string; readonly beforeSqlSha256: string; readonly targetUuid: string;
  readonly ownerBindingSha256: string; readonly documentBeforeSha256: string;
  readonly backendWindow: Readonly<{ minimumMs: number; maximumMs: number }>;
  readonly documentWindow: Readonly<{ minimumMs: number; maximumMs: number }>;
  readonly collectionMaximumMs: 10_000;
}
interface Clock {
  readonly token: IssuedWindowsClockObservation;
  readonly before: ReturnType<typeof validateClockSample>; readonly after: ReturnType<typeof validateClockSample>;
}
interface Prepared {
  readonly dispatchOwner: object; readonly launch: Clock; readonly capture: Clock; readonly before: Clock; readonly armed: Clock;
  readonly documentBefore: CurrentSymbolDocumentClockSample; readonly actorPlan: CurrentSymbolTransactionActorPlan;
  stage: "armed" | "post-consumed" | "post-recorded" | "verification-consumed";
  post?: Readonly<{ clock: Clock; document: CurrentSymbolDocumentClockSample }>;
  completed?: Readonly<{ after: Inventory; afterText: string; comparison: Readonly<Record<string, unknown>>; comparisonText: string }>;
}
const plans = new WeakMap<CurrentSymbolTransactionClockPlan, Prepared>();
const owners = new WeakSet<object>();
function need(condition: boolean, message = "Current symbol transaction clock refused."): asserts condition {
  if (!condition) { throw new Error(message); }
}
function fields(value: unknown, required: readonly string[], optional: readonly string[] = []): void {
  need(value !== null && typeof value === "object" && !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null), "Clock input must be plain data.");
  const keys = Reflect.ownKeys(value);
  need(keys.every((key) => typeof key === "string" && (required.includes(key) || optional.includes(key))) &&
    required.every((key) => keys.includes(key)), "Clock input fields differ.");
  for (const key of keys) { need(Object.hasOwn(Object.getOwnPropertyDescriptor(value, key) ?? {}, "value"), "Clock input accessors refused."); }
}
/** Snapshot only bounded plain data. Never clone an issuer token or the owner. */
function data(value: unknown, depth = 0): unknown {
  need(depth <= 4, "Clock comparison input nesting exceeds its bound.");
  if (value === null || typeof value === "boolean") { return value; }
  if (typeof value === "string") { need(value.length <= 131_072); return value; }
  if (typeof value === "number") { need(Number.isFinite(value)); return value; }
  need(isRecord(value));
  const keys = Reflect.ownKeys(value); need(keys.length <= 16);
  fields(value, Object.keys(value));
  const copy: Record<string, unknown> = {};
  for (const key of keys) {
    need(typeof key === "string");
    Object.defineProperty(copy, key, { value: data(value[key], depth + 1), enumerable: true });
  }
  return Object.freeze(copy);
}
function documentSample(value: CurrentSymbolDocumentClockSample): CurrentSymbolDocumentClockSample {
  fields(value, ["rendererBeforeMs", "serverTimeMs", "rendererAfterMs", "rendererBeforeIso", "rendererAfterIso",
    "rendererTimezoneOffsetMinutes", "notifyTabId"]);
  const copy = Object.freeze({ ...value });
  for (const time of [copy.rendererBeforeMs, copy.serverTimeMs, copy.rendererAfterMs]) {
    need(Number.isSafeInteger(time) && time >= 0 && time <= 8_640_000_000_000_000 && !Object.is(time, -0));
  }
  need(copy.rendererBeforeMs <= copy.serverTimeMs && copy.serverTimeMs <= copy.rendererAfterMs &&
    copy.rendererAfterMs - copy.rendererBeforeMs <= COLLECTION_MS &&
    new Date(copy.rendererBeforeMs).toISOString() === copy.rendererBeforeIso &&
    new Date(copy.rendererAfterMs).toISOString() === copy.rendererAfterIso &&
    Number.isSafeInteger(copy.rendererTimezoneOffsetMinutes) && Math.abs(copy.rendererTimezoneOffsetMinutes) <= 840 &&
    !Object.is(copy.rendererTimezoneOffsetMinutes, -0) && typeof copy.notifyTabId === "string" && /^[a-f0-9]{16}$/u.test(copy.notifyTabId));
  return copy;
}
async function issued(value: IssuedWindowsClockObservation, phase: IssuedWindowsClockObservation["phase"]): Promise<Clock> {
  const token = await assertIssuedWindowsClockObservation(value);
  need(token === value && token.phase === phase && token.clock.status === "observed" &&
    token.clock.tzAbsentBefore && token.clock.tzAbsentAfter, "Clock requires its original observed Windows token.");
  const before = validateClockSample(token.clock.before);
  const after = validateClockSample(token.clock.after);
  need(BigInt(before.utcAfterTicks) <= BigInt(after.utcBeforeTicks) && BigInt(before.qpcAfter) <= BigInt(after.qpcBefore));
  if (phase !== "launch") {
    const key = { capture: "capturedAt", termination: "checkedAt", "owned-observation": "observedAt" }[phase];
    const ticks = exactUtcTicks(token.base[key]);
    need(ticks >= BigInt(before.utcBeforeTicks) && ticks <= BigInt(after.utcAfterTicks), "Windows observation time is outside its exact tick bracket.");
  }
  return Object.freeze({ token, before, after });
}
function exactUtcTicks(value: unknown): bigint {
  need(typeof value === "string");
  const match = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\.(\d{7})Z$/u.exec(value);
  need(match?.[1] !== undefined && match[2] !== undefined, "Windows observation time requires exact UTC ticks.");
  const iso = `${match[1]}.${match[2].slice(0, 3)}Z`, milliseconds = Date.parse(iso);
  need(Number.isSafeInteger(milliseconds) && milliseconds >= 0 && new Date(milliseconds).toISOString() === iso,
    "Windows observation time failed its calendar roundtrip.");
  return EPOCH_TICKS + BigInt(milliseconds) * 10_000n + BigInt(match[2].slice(3));
}
function minimum(clock: Clock): number { return Number((BigInt(clock.before.utcBeforeTicks) - EPOCH_TICKS) / 10_000n); }
function maximum(clock: Clock): number { return Number((BigInt(clock.after.utcAfterTicks) - EPOCH_TICKS + 9999n) / 10_000n); }
function sameGeneration(reference: Clock, clock: Clock): void {
  for (const key of ["jobId", "helperInstance"]) { need(reference.token.base[key] === clock.token.base[key]); }
  need(reference.token.helperSourceSha256 === clock.token.helperSourceSha256 &&
    reference.token.executionScopeSha256 === clock.token.executionScopeSha256);
  for (const sample of [clock.before, clock.after]) {
    need(sample.localOffsetMinutes === reference.before.localOffsetMinutes && sample.zoneRulesSha256 === reference.before.zoneRulesSha256 &&
      sample.qpcFrequency === reference.before.qpcFrequency);
  }
}
function ordered(first: Clock, last: Clock): void {
  sameGeneration(first, last);
  need(BigInt(first.after.utcAfterTicks) <= BigInt(last.before.utcBeforeTicks) && BigInt(first.after.qpcAfter) <= BigInt(last.before.qpcBefore));
}
function sameCapture(capture: Clock, clock: Clock): void {
  sameGeneration(capture, clock);
  need(canonicalJson(capture.token.ownerBinding) === canonicalJson(clock.token.ownerBinding) &&
    clock.token.base["captureBindingSha256"] === capture.token.base["bindingSha256"]);
}
function bracket(document: CurrentSymbolDocumentClockSample, before: Clock, after: Clock): void {
  need(document.rendererTimezoneOffsetMinutes === -before.before.localOffsetMinutes &&
    document.rendererBeforeMs >= maximum(before) && document.rendererAfterMs <= minimum(after), "Document clock lies outside its independent Windows bracket.");
}
function operationId(binding: Bag): string {
  const value = binding["operationId"]; need(typeof value === "string" && /^[A-Za-z0-9._:-]{1,160}$/u.test(value)); return value;
}

/** One reservation per original owner. Failure consumes it; no hidden resampling.
 * The raw document data is caller-supplied until a fixed dispatch issuer exists.
 */
export async function prepareCurrentSymbolTransactionClock(input: CurrentSymbolTransactionClockInput): Promise<CurrentSymbolTransactionClockPlan> {
  fields(input, ["before", "operation", "startupActor", "cachedActor", "comparisonIdentity", "dispatchOwner", "launchClock", "captureClock",
    "beforeClock", "armedClock", "documentBefore"]);
  const owner = input.dispatchOwner;
  need(owner !== null && typeof owner === "object" && !owners.has(owner), "Clock dispatch-owner reservation already consumed or missing.");
  owners.add(owner);
  fields(input.comparisonIdentity, ["projectUuid", "branchUuid", "client", "preDispatchMaxTicket"], ["agedHead"]);
  data(input.comparisonIdentity);
  const identity = structuredClone(input.comparisonIdentity);
  const operation = data(input.operation);
  const startupActor = data(input.startupActor);
  const cachedActor = data(input.cachedActor);
  const document = documentSample(input.documentBefore);
  const beforeInventory = input.before;
  const tokens = [input.launchClock, input.captureClock, input.beforeClock, input.armedClock] as const;
  need(tokens[2] !== tokens[3], "Pre-dispatch Windows brackets require distinct original observations.");
  const launch = await issued(tokens[0], "launch");
  const capture = await issued(tokens[1], "capture");
  const before = await issued(tokens[2], "owned-observation");
  const armed = await issued(tokens[3], "owned-observation");
  ordered(launch, capture); ordered(capture, before); ordered(before, armed);
  sameGeneration(launch, launch); sameCapture(capture, before); sameCapture(capture, armed);
  const root = launch.token.base["root"];
  const processes = capture.token.base["processes"];
  need(isRecord(root) && root["role"] === "easyeda-main" && Array.isArray(processes) &&
    processes.some((process: unknown) => canonicalJson(process) === canonicalJson(root)), "Original launch root is absent from the capture.");
  bracket(document, before, armed);
  need(maximum(armed) - minimum(before) <= COLLECTION_MS &&
    BigInt(armed.after.qpcAfter) - BigInt(before.before.qpcBefore) <= BigInt(before.before.qpcFrequency) * 10n,
  "Pre-dispatch clock collection exceeds its fixed bound.");
  const backendWindow = Object.freeze({ minimumMs: minimum(before), maximumMs: minimum(before) + WINDOW_MS });
  const documentWindow = Object.freeze({ minimumMs: document.serverTimeMs, maximumMs: document.serverTimeMs + WINDOW_MS });
  const actorPlan = await prepareCurrentSymbolTransactionActor({ before: beforeInventory, operation, startupActor, cachedActor,
    bounds: { ...identity, documentClockMinMs: documentWindow.minimumMs, documentClockMaxMs: documentWindow.maximumMs,
      backendClockMinMs: backendWindow.minimumMs, backendClockMaxMs: backendWindow.maximumMs, backendLocalOffsetMinutes: before.before.localOffsetMinutes } });
  // Retain the original live epoch through awaited SQL preparation.
  // These checks do not collect new clocks or refresh the frozen deadlines.
  await assertIssuedWindowsClockObservation(before.token);
  await assertIssuedWindowsClockObservation(armed.token);
  for (const clock of [launch, capture, before, armed]) { assertCurrentIssuedWindowsClockObservation(clock.token); }
  const plan: CurrentSymbolTransactionClockPlan = Object.freeze({ profile: "easyeda-pro-control.current-symbol-transaction-clock-plan.v1",
    operationId: operationId(capture.token.ownerBinding), beforeSqlSha256: actorPlan.beforeSqlSha256, targetUuid: actorPlan.targetUuid,
    ownerBindingSha256: sha256Json(capture.token.ownerBinding), documentBeforeSha256: sha256Json(document),
    backendWindow, documentWindow, collectionMaximumMs: COLLECTION_MS, ...ASSUMPTIONS, ...LIMITS });
  plans.set(plan, { dispatchOwner: owner, launch, capture, before, armed, documentBefore: document, actorPlan, stage: "armed" });
  return plan;
}

/** Consume N1/W1 while the original Job is live. Later closure must not revalidate
 * these live-only tokens as though it issued a fresh observation.
 */
export async function recordCurrentSymbolTransactionClockPost(plan: CurrentSymbolTransactionClockPlan, input: Readonly<{
  dispatchOwner: object; afterClock: IssuedWindowsClockObservation; documentAfter: CurrentSymbolDocumentClockSample;
}>): Promise<void> {
  const prepared = plans.get(plan);
  need(prepared !== undefined && prepared.stage === "armed", "Clock post observation requires its original unconsumed plan.");
  prepared.stage = "post-consumed";
  fields(input, ["dispatchOwner", "afterClock", "documentAfter"]);
  need(input.dispatchOwner === prepared.dispatchOwner, "Clock dispatch owner changed.");
  const document = documentSample(input.documentAfter), token = input.afterClock;
  need(token !== prepared.before.token && token !== prepared.armed.token, "Post Windows bracket requires a distinct original observation.");
  const after = await issued(token, "owned-observation");
  await assertIssuedWindowsClockObservation(prepared.before.token);
  await assertIssuedWindowsClockObservation(prepared.armed.token);
  for (const clock of [prepared.launch, prepared.capture, prepared.before, prepared.armed, after]) {
    assertCurrentIssuedWindowsClockObservation(clock.token);
  }
  sameCapture(prepared.capture, after); ordered(prepared.armed, after); bracket(document, prepared.armed, after);
  need(document.notifyTabId === prepared.documentBefore.notifyTabId && document.rendererBeforeMs >= prepared.documentBefore.rendererAfterMs &&
    document.serverTimeMs >= plan.documentWindow.minimumMs && document.rendererAfterMs <= plan.documentWindow.maximumMs);
  prepared.post = Object.freeze({ clock: after, document }); prepared.stage = "post-recorded";
}

/** Own complete actor/SQL comparison. WT may be later than the frozen windows;
 * this never satisfies the old whole-Job-within-window contract.
 */
export async function verifyCurrentSymbolTransactionClock(plan: CurrentSymbolTransactionClockPlan, input: Readonly<{
  dispatchOwner: object; terminationProof: unknown; after: Inventory;
}>): Promise<Readonly<Record<string, unknown>>> {
  const prepared = plans.get(plan);
  const post = prepared?.post;
  need(prepared !== undefined && post !== undefined && prepared.stage === "post-recorded", "Clock verification requires its original unconsumed post observation.");
  prepared.stage = "verification-consumed";
  fields(input, ["dispatchOwner", "terminationProof", "after"]);
  need(input.dispatchOwner === prepared.dispatchOwner, "Clock dispatch owner changed.");
  const proof = input.terminationProof;
  const afterInventory = input.after;
  const termination = await windowsClockObservationForResult(proof, "termination");
  const exit = await issued(termination, "termination");
  ordered(post.clock, exit); sameGeneration(prepared.launch, exit);
  need(isRecord(proof));
  const original = prepared.capture.token.ownerBinding;
  const owner = exit.token.ownerBinding;
  const base = exit.token.base;
  for (const key of ["operationId", "phase", "challengeAttempt", "authoritySha256"]) { need(proof[key] === original[key] && owner[key] === original[key]); }
  for (const key of ["bridgeSessionSha256", "runtimeIdentitySha256"]) { need(proof[key] === original[key]); }
  for (const key of ["jobId", "helperInstance"]) { need(proof[key] === prepared.capture.token.base[key]); }
  need(base["captureBindingSha256"] === original["bindingSha256"] && owner["captureBindingSha256"] === original["bindingSha256"] &&
    proof["launchSha256"] === prepared.launch.token.ownerBinding["launchSha256"] && owner["closeIntentSha256"] === proof["closeIntentSha256"] &&
    proof["jobEmpty"] === true && proof["retainedProcessesExited"] === true && proof["saveOrDiscardSelected"] === false &&
    base["jobEmpty"] === true && base["retainedProcessesExited"] === true && proof["closedAt"] === base["checkedAt"]);
  const closedAt = exactUtcTicks(proof["closedAt"]);
  need(closedAt >= BigInt(exit.before.utcBeforeTicks) && closedAt <= BigInt(exit.after.utcAfterTicks));
  const fullActorSqlEffect = await verifyCurrentSymbolTransactionActor(prepared.actorPlan, afterInventory);
  // The maintained full comparison yields. Reprove its original termination owner.
  // Do not try to revive the already-closed live tokens.
  need(await windowsClockObservationForResult(proof, "termination") === termination);
  assertCurrentIssuedWindowsClockObservation(termination);
  const comparison = Object.freeze({ profile: "easyeda-pro-control.current-symbol-transaction-clock-effect.v1", operationId: plan.operationId,
    beforeSqlSha256: plan.beforeSqlSha256, afterSqlSha256: afterInventory.logicalSha256, targetUuid: plan.targetUuid,
    ownerBindingSha256: plan.ownerBindingSha256, backendWindow: plan.backendWindow, documentWindow: plan.documentWindow,
    documentBeforeSha256: plan.documentBeforeSha256, documentAfterSha256: sha256Json(post.document),
    windowsObservationSha256s: Object.freeze([prepared.launch, prepared.capture, prepared.before, prepared.armed, post.clock, exit].map((clock) => sha256Json(clock.token))),
    transactionTimestampsWithinPlannedWindows: true, originalWindowsObservationsRetained: true,
    fullActorSqlEffect, ...ASSUMPTIONS, ...LIMITS });
  prepared.completed = Object.freeze({ after: afterInventory, afterText: canonicalJson(afterInventory), comparison, comparisonText: canonicalJson(comparison) });
  return comparison;
}

/** Only the original successful comparison can select post-edit native history.
 * A failed consumed comparison, copied plan or equivalent re-read cannot issue
 * this relation. It grants no launch, dispatch or persistence authority.
 */
export async function decodeCompletedCurrentSymbolTransactionHistory(plan: CurrentSymbolTransactionClockPlan,
  dispatchOwner: object, after: Inventory): Promise<Awaited<ReturnType<typeof decodeCurrentSymbolTransactionActorHistory>> & Readonly<{ comparison: Bag }>> {
  const prepared = plans.get(plan);
  const completed = prepared?.completed;
  need(prepared !== undefined && completed !== undefined && prepared.stage === "verification-consumed" &&
    prepared.dispatchOwner === dispatchOwner && completed.after === after && completed.afterText === canonicalJson(after) &&
    completed.comparisonText === canonicalJson(completed.comparison),
  "Saved history requires its original successful clock comparison and inventory.");
  const decoded = await decodeCurrentSymbolTransactionActorHistory(prepared.actorPlan, after);
  need(plans.get(plan) === prepared && prepared.completed === completed && completed.after === after &&
    completed.afterText === canonicalJson(after) && completed.comparisonText === canonicalJson(completed.comparison),
    "Saved history completed comparison changed.");
  return Object.freeze({ ...decoded, comparison: completed.comparison });
}
