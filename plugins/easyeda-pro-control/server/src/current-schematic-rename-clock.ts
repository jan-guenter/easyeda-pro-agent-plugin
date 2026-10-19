/** Private SCH clock relation, with original SCH startup/writer identities.
 * The renderer sample is supplied data until an original dispatch coordinator
 * retains the fixed collector's reply. Only the lifecycle coordinator can
 * consume the relation; this module grants no independent dispatch authority.
 * Unlocked heads require an original independent native age issuer at runtime.
 */
/* oxlint-disable import/max-dependencies -- Compose SCH-owned startup/SQL/result and original Windows clock issuers without converting PCB ownership. */
import { types } from "node:util";
import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import { assertCurrentSchematicRenameWriterOwner } from "./current-schematic-rename-generation-runtime.ts";
import type { CurrentProjectOnlySchematicRenameGeneration, CurrentSchematicRenameWriterOwner } from "./current-schematic-rename-generation-runtime.ts";
import { originalCurrentSchematicRenameSqlPreparation, prepareCurrentSchematicRenameSql } from "./current-schematic-rename-sql.ts";
import type { CurrentSchematicRenameSqlPreparation, CurrentSchematicRenameSqlWitness } from "./current-schematic-rename-sql.ts";
import { validateCurrentSchematicRenameResult } from "./current-schematic-rename-program.ts";
import type { CurrentSchematicRenameProgramResult } from "./current-schematic-rename-program.ts";
import { completedCurrentSchematicRenameStoredSource, verifyCurrentSchematicRenameStoredEffect } from "./current-schematic-rename-stored-effect.ts";
import type { CurrentSchematicRenameStoredEffect } from "./current-schematic-rename-stored-effect.ts";
import { assertOriginalCurrentSchematicRenameStartup } from "./current-schematic-rename-startup-runtime.ts";
import type { CurrentSchematicRenameStartupObservation } from "./current-schematic-rename-startup-runtime.ts";
import type { EasyedaControlEngine } from "./engine.ts";
import type { readExactSqlInventory } from "./sqlite-inventory.ts";
import { validateActorProjection } from "./symbol-dual-actor.ts";
import type { ActorProjection } from "./symbol-dual-actor.ts";
import { assertCurrentIssuedWindowsClockObservation, assertIssuedWindowsClockObservation, windowsClockObservationForResult } from "./windows-authority.ts";
import type { IssuedWindowsClockObservation } from "./windows-authority.ts";
import { validateClockSample } from "./windows-clock-transport.ts";

const COLLECTION_MS = 10_000, EPOCH_TICKS = 621_355_968_000_000_000n, WINDOW_MS = 60_000;
type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
const LIMITS = Object.freeze({ dispatchOwnershipVerified: false, documentSampleProvenanceVerified: false, startupQualified: false,
  schematicSubscriberCompletionVerified: false, completeAstSourceBindingVerified: false, startupLocalChangesExcluded: false, backendActorVerified: false, producerBindingVerified: false,
  appClockDirectlyObserved: false, continuousClockStabilityProved: false, futureWriteClockVerified: false,
  entireJobExitedWithinOriginalWindow: false, persistentUploadReplayExcluded: false, reopened: false, writerReady: false, executionAuthorized: false } as const);
const ASSUMPTIONS = Object.freeze({ commonOsClockAndNoInterveningChangeRequired: true,
  reviewedOrdinaryDateAndVfsImplementationsRequired: true, noOtherTargetWriterRequired: true } as const);
export interface CurrentSchematicRenameDocumentClockSample {
  readonly rendererBeforeMs: number; readonly serverTimeMs: number; readonly rendererAfterMs: number;
  readonly rendererBeforeIso: string; readonly rendererAfterIso: string;
  readonly rendererTimezoneOffsetMinutes: number; readonly notifyTabId: string;
}
export interface CurrentSchematicRenameClockInput {
  readonly engine: EasyedaControlEngine; readonly generation: CurrentProjectOnlySchematicRenameGeneration;
  readonly startup: CurrentSchematicRenameStartupObservation; readonly dispatchOwner: CurrentSchematicRenameWriterOwner;
  readonly beforeClock: IssuedWindowsClockObservation; readonly armedClock: IssuedWindowsClockObservation;
  /** Caller data until the fixed native dispatch issuer proves its origin. */
  readonly documentBefore: CurrentSchematicRenameDocumentClockSample;
  readonly agedHead?: CurrentSchematicRenameSqlWitness["agedHead"];
}
export interface CurrentSchematicRenameClockPlan extends Readonly<typeof LIMITS>, Readonly<typeof ASSUMPTIONS> {
  readonly profile: "private.current-schematic-rename-clock-plan.v1";
  readonly operationId: string; readonly beforeSqlSha256: string; readonly preparationSha256: string; readonly metadataProjectionSha256: string;
  readonly ownerBindingSha256: string; readonly documentBeforeSha256: string;
  readonly backendWindow: Readonly<{ minimumMs: number; maximumMs: number }>;
  readonly documentWindow: Readonly<{ minimumMs: number; maximumMs: number }>;
  readonly collectionMaximumMs: 10_000;
  readonly originalWindowsObservationsRetained: true;
  readonly originalStartupBound: true;
}
interface Clock {
  readonly token: IssuedWindowsClockObservation;
  readonly before: ReturnType<typeof validateClockSample>; readonly after: ReturnType<typeof validateClockSample>;
}
interface Prepared {
  readonly engine: EasyedaControlEngine; readonly generation: CurrentProjectOnlySchematicRenameGeneration; readonly startup: CurrentSchematicRenameStartupObservation;
  readonly dispatchOwner: CurrentSchematicRenameWriterOwner; readonly source: ReturnType<typeof assertOriginalCurrentSchematicRenameStartup>;
  readonly launch: Clock; readonly capture: Clock; readonly before: Clock; readonly armed: Clock;
  readonly documentBefore: CurrentSchematicRenameDocumentClockSample; readonly expectedActor: ActorProjection;
  readonly preparation: CurrentSchematicRenameSqlPreparation; readonly writer: ReturnType<typeof assertCurrentSchematicRenameWriterOwner>; readonly text: string;
  readonly scopeReader: EasyedaControlEngine["upstream"]["currentAuthenticatedBridgeDispatchBinding"];
  readonly scopeText: string | undefined;
}
const attempts = new WeakSet<CurrentSchematicRenameStartupObservation>(), owners = new WeakSet<object>(), plans = new WeakMap<CurrentSchematicRenameClockPlan, Prepared>();
interface Lifecycle {
  stage: "armed" | "post-consumed" | "post-recorded" | "verification-consumed";
  post?: Readonly<{ clock: Clock; result: CurrentSchematicRenameProgramResult; originalResult: unknown }>;
  completed?: Readonly<{ after: Inventory; afterText: string; effect: CurrentSchematicRenameStoredEffect;
    comparison: Readonly<Record<string, unknown>>; comparisonText: string }>;
}
const lifecycles = new WeakMap<CurrentSchematicRenameClockPlan, Lifecycle>();
function need(condition: boolean, message = "Current SCH rename clock refused."): asserts condition { if (!condition) { throw new Error(message); } }
function fields(value: unknown, required: readonly string[], optional: readonly string[] = []): void {
  need(value !== null && typeof value === "object" && !types.isProxy(value) && !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null), "Clock input must be plain data.");
  const keys = Reflect.ownKeys(value);
  need(keys.every(key => typeof key === "string" && (required.includes(key) || optional.includes(key))) && required.every(key => keys.includes(key)), "Clock input fields differ.");
  for (const key of keys) { need(Object.hasOwn(Object.getOwnPropertyDescriptor(value, key) ?? {}, "value"), "Clock input accessors refused."); }
}
function documentSample(value: CurrentSchematicRenameDocumentClockSample): CurrentSchematicRenameDocumentClockSample {
  fields(value, ["rendererBeforeMs", "serverTimeMs", "rendererAfterMs", "rendererBeforeIso", "rendererAfterIso", "rendererTimezoneOffsetMinutes", "notifyTabId"]);
  const copy = Object.freeze({ ...value });
  for (const time of [copy.rendererBeforeMs, copy.serverTimeMs, copy.rendererAfterMs]) {
    need(Number.isSafeInteger(time) && time >= 0 && time <= 8_640_000_000_000_000 && !Object.is(time, -0));
  }
  need(copy.rendererBeforeMs <= copy.serverTimeMs && copy.serverTimeMs <= copy.rendererAfterMs && copy.rendererAfterMs - copy.rendererBeforeMs <= COLLECTION_MS &&
    new Date(copy.rendererBeforeMs).toISOString() === copy.rendererBeforeIso && new Date(copy.rendererAfterMs).toISOString() === copy.rendererAfterIso &&
    Number.isSafeInteger(copy.rendererTimezoneOffsetMinutes) && Math.abs(copy.rendererTimezoneOffsetMinutes) <= 840 && !Object.is(copy.rendererTimezoneOffsetMinutes, -0) &&
    typeof copy.notifyTabId === "string" && /^[a-f0-9]{16}$/u.test(copy.notifyTabId)); return copy;
}
function exactUtcTicks(value: unknown): bigint {
  need(typeof value === "string"); const match = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\.(\d{7})Z$/u.exec(value);
  need(match?.[1] !== undefined && match[2] !== undefined, "Windows observation time requires exact UTC ticks.");
  const iso = `${match[1]}.${match[2].slice(0, 3)}Z`, milliseconds = Date.parse(iso);
  need(Number.isSafeInteger(milliseconds) && milliseconds >= 0 && new Date(milliseconds).toISOString() === iso, "Windows observation time failed its calendar roundtrip.");
  return EPOCH_TICKS + BigInt(milliseconds) * 10_000n + BigInt(match[2].slice(3));
}
async function issued(value: IssuedWindowsClockObservation, phase: IssuedWindowsClockObservation["phase"]): Promise<Clock> {
  const token = await assertIssuedWindowsClockObservation(value);
  need(token === value && token.phase === phase && token.clock.status === "observed" && token.clock.tzAbsentBefore && token.clock.tzAbsentAfter,
    "Clock requires its original observed Windows token.");
  const after = validateClockSample(token.clock.after), before = validateClockSample(token.clock.before);
  need(BigInt(before.utcAfterTicks) <= BigInt(after.utcBeforeTicks) && BigInt(before.qpcAfter) <= BigInt(after.qpcBefore));
  if (phase !== "launch") {
    const key = { capture: "capturedAt", termination: "checkedAt", "owned-observation": "observedAt" }[phase], ticks = exactUtcTicks(token.base[key]);
    need(ticks >= BigInt(before.utcBeforeTicks) && ticks <= BigInt(after.utcAfterTicks), "Windows observation time is outside its exact tick bracket.");
  }
  return Object.freeze({ token, before, after });
}
function minimum(clock: Clock): number { return Number((BigInt(clock.before.utcBeforeTicks) - EPOCH_TICKS) / 10_000n); }
function maximum(clock: Clock): number { return Number((BigInt(clock.after.utcAfterTicks) - EPOCH_TICKS + 9999n) / 10_000n); }
function sameGeneration(reference: Clock, clock: Clock): void {
  for (const key of ["jobId", "helperInstance"]) { need(reference.token.base[key] === clock.token.base[key]); }
  need(reference.token.helperSourceSha256 === clock.token.helperSourceSha256 && reference.token.executionScopeSha256 === clock.token.executionScopeSha256);
  for (const sample of [clock.before, clock.after]) {
    need(sample.localOffsetMinutes === reference.before.localOffsetMinutes && sample.zoneRulesSha256 === reference.before.zoneRulesSha256 && sample.qpcFrequency === reference.before.qpcFrequency);
  }
}
function ordered(first: Clock, last: Clock): void {
  sameGeneration(first, last); need(BigInt(first.after.utcAfterTicks) <= BigInt(last.before.utcBeforeTicks) && BigInt(first.after.qpcAfter) <= BigInt(last.before.qpcBefore));
}
function sameCapture(capture: Clock, clock: Clock): void {
  sameGeneration(capture, clock);
  need(canonicalJson(capture.token.ownerBinding) === canonicalJson(clock.token.ownerBinding) && clock.token.base["captureBindingSha256"] === capture.token.base["bindingSha256"]);
}

/** One attempt per original startup and SCH-issued writer owner. Neither
 * can be replaced to resample a failed preparation or extend its deadlines.
 */
export async function prepareCurrentSchematicRenameClock(input: CurrentSchematicRenameClockInput): Promise<CurrentSchematicRenameClockPlan> {
  fields(input, ["engine", "generation", "startup", "dispatchOwner", "beforeClock", "armedClock", "documentBefore"], ["agedHead"]);
  const { engine, generation, startup, dispatchOwner: owner } = input;
  const scopeReader = engine.upstream.currentAuthenticatedBridgeDispatchBinding;
  const scope = scopeReader?.call(engine.upstream), scopeText = scope === undefined ? undefined : canonicalJson(scope);
  const source = assertOriginalCurrentSchematicRenameStartup(startup, engine, generation);
  const writer = assertCurrentSchematicRenameWriterOwner(owner, engine, scopeText);
  need(writer.generation === generation && writer.original === source.source, "Original SCH writer generation differs.");
  need(owner !== null && typeof owner === "object" && !attempts.has(startup) && !owners.has(owner), "SCH clock reservation already consumed.");
  attempts.add(startup); owners.add(owner);
  const document = documentSample(input.documentBefore), expectedActor = validateActorProjection(source.observation.runtimeObservation.actor);
  const tokens = [source.source.launchClock, source.source.captureClock, input.beforeClock, input.armedClock] as const;
  const aged = input.agedHead;
  if (aged !== undefined) { fields(aged, ["createdAtLiteral", "nativeParsedLocalMs", "nativeTimezoneOffsetMinutes"]); }
  const agedHead = aged === undefined ? undefined : Object.freeze({ ...aged });
  const check = (): void => {
    const active = scopeReader?.call(engine.upstream);
    need(engine.upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader &&
      (active === undefined ? undefined : canonicalJson(active)) === scopeText, "Original SCH clock dispatch scope changed.");
    need(assertOriginalCurrentSchematicRenameStartup(startup, engine, generation) === source &&
      assertCurrentSchematicRenameWriterOwner(owner, engine, scopeText) === writer, "Original SCH startup/writer owner changed.");
  };
  need(tokens[2] !== tokens[3], "Pre-dispatch Windows brackets require distinct original observations.");
  const launch = await issued(tokens[0], "launch"); check(); const capture = await issued(tokens[1], "capture"); check();
  const before = await issued(tokens[2], "owned-observation"); check(); const armed = await issued(tokens[3], "owned-observation"); check();
  ordered(launch, capture); ordered(capture, before); ordered(before, armed); sameGeneration(launch, launch); sameCapture(capture, before); sameCapture(capture, armed);
  const processes = capture.token.base["processes"], root = launch.token.base["root"];
  need(isRecord(root) && root["role"] === "easyeda-main" && Array.isArray(processes) && processes.some((process: unknown) => canonicalJson(process) === canonicalJson(root)),
    "Original launch root is absent from the capture.");
  need(document.rendererTimezoneOffsetMinutes === -before.before.localOffsetMinutes && document.rendererBeforeMs >= maximum(before) && document.rendererAfterMs <= minimum(armed),
    "Document clock lies outside its independent Windows bracket.");
  need(maximum(armed) - minimum(before) <= COLLECTION_MS && BigInt(armed.after.qpcAfter) - BigInt(before.before.qpcBefore) <= BigInt(before.before.qpcFrequency) * 10n,
    "Pre-dispatch clock collection exceeds its fixed bound.");
  const backendWindow = Object.freeze({ minimumMs: minimum(before), maximumMs: minimum(before) + WINDOW_MS });
  const documentWindow = Object.freeze({ minimumMs: document.serverTimeMs, maximumMs: document.serverTimeMs + WINDOW_MS });
  const { baseline } = source.source, { target, desiredTitle } = baseline.intent;
  need(canonicalJson(source.projection.request.target) === canonicalJson(target) && source.projection.request.desiredTitle === desiredTitle,
    "Original SCH intent differs from startup metadata.");
  const preparation = await prepareCurrentSchematicRenameSql({ before: baseline.inventory, metadata: source.projection,
    witness: { projectUuid: target.projectUuid, branchUuid: target.branchUuid, client: source.observation.clientTicketObservation.client,
      backendActorUuid: expectedActor.uuid, documentClockMinMs: documentWindow.minimumMs, documentClockMaxMs: documentWindow.maximumMs,
      backendClockMinMs: backendWindow.minimumMs, backendClockMaxMs: backendWindow.maximumMs, backendLocalOffsetMinutes: before.before.localOffsetMinutes,
      ...(agedHead === undefined ? {} : { agedHead }) } }); check();
  const sql = originalCurrentSchematicRenameSqlPreparation(preparation, baseline.inventory, source.projection);
  need(canonicalJson(sql.backendActor) === canonicalJson(expectedActor), "Historical SQL actor strings differ from the original UI observation.");
  await assertIssuedWindowsClockObservation(before.token); check(); await assertIssuedWindowsClockObservation(armed.token); check();
  for (const clock of [launch, capture, before, armed]) { assertCurrentIssuedWindowsClockObservation(clock.token); }
  need(capture.token.ownerBinding["operationId"] === generation.operationId, "Original Windows capture operation differs.");
  const plan: CurrentSchematicRenameClockPlan = Object.freeze({ profile: "private.current-schematic-rename-clock-plan.v1", operationId: generation.operationId,
    beforeSqlSha256: baseline.inventory.logicalSha256, preparationSha256: preparation.preparationSha256, metadataProjectionSha256: source.projection.projectionSha256,
    ownerBindingSha256: sha256Json(capture.token.ownerBinding), documentBeforeSha256: sha256Json(document), backendWindow, documentWindow,
    collectionMaximumMs: COLLECTION_MS, originalWindowsObservationsRetained: true, originalStartupBound: true, ...ASSUMPTIONS, ...LIMITS });
  plans.set(plan, Object.freeze({ engine, generation, startup, dispatchOwner: owner, source, launch, capture, before, armed, documentBefore: document,
    expectedActor, preparation, writer, scopeReader, scopeText, text: canonicalJson(plan) })); lifecycles.set(plan, { stage: "armed" }); return plan;
}

/** Only this accessor exposes the original prepared mutation inputs. It does
 * not manufacture a fresh Windows or renderer clock observation.
 */
export function assertOriginalCurrentSchematicRenameClock(plan: CurrentSchematicRenameClockPlan, engine: EasyedaControlEngine,
  generation: CurrentProjectOnlySchematicRenameGeneration, startup: CurrentSchematicRenameStartupObservation, dispatchOwner: CurrentSchematicRenameWriterOwner): Prepared {
  const prepared = plans.get(plan);
  need(prepared !== undefined && prepared.engine === engine && prepared.generation === generation && prepared.startup === startup &&
    prepared.dispatchOwner === dispatchOwner && prepared.text === canonicalJson(plan), "Original SCH clock preparation required.");
  const active = prepared.scopeReader?.call(engine.upstream);
  need(engine.upstream.currentAuthenticatedBridgeDispatchBinding === prepared.scopeReader &&
    (active === undefined ? undefined : canonicalJson(active)) === prepared.scopeText, "Original SCH clock dispatch scope changed.");
  need(assertOriginalCurrentSchematicRenameStartup(startup, engine, generation) === prepared.source);
  need(assertCurrentSchematicRenameWriterOwner(dispatchOwner, engine, prepared.scopeText) === prepared.writer, "Original SCH writer changed.");
  for (const clock of [prepared.launch, prepared.capture, prepared.before, prepared.armed]) { assertCurrentIssuedWindowsClockObservation(clock.token); }
  originalCurrentSchematicRenameSqlPreparation(prepared.preparation, prepared.source.source.baseline.inventory, prepared.source.projection); return prepared;
}

/** Consume the original live plan once. The supplied result is still data until
 * the one-shot dispatch coordinator separately retains its actual native raw.
 */
export async function recordCurrentSchematicRenameClockPost(plan: CurrentSchematicRenameClockPlan, input: Readonly<{
  engine: EasyedaControlEngine; generation: CurrentProjectOnlySchematicRenameGeneration; startup: CurrentSchematicRenameStartupObservation;
  dispatchOwner: CurrentSchematicRenameWriterOwner; afterClock: IssuedWindowsClockObservation; result: unknown;
}>): Promise<void> {
  const lifecycle = lifecycles.get(plan); need(lifecycle !== undefined && lifecycle.stage === "armed", "Original SCH clock post already consumed or absent.");
  lifecycle.stage = "post-consumed";
  fields(input, ["engine", "generation", "startup", "dispatchOwner", "afterClock", "result"]);
  const prepared = assertOriginalCurrentSchematicRenameClock(plan, input.engine, input.generation, input.startup, input.dispatchOwner);
  const { engine, generation, startup, dispatchOwner, afterClock: token, result: originalResult } = input;
  const check = (): void => { need(assertOriginalCurrentSchematicRenameClock(plan, engine, generation, startup, dispatchOwner) === prepared); };
  const result = validateCurrentSchematicRenameResult(originalResult, prepared.preparation, prepared.source.source.baseline.inventory, prepared.source.projection, prepared.source.source.baseline.children, { expectedActor: prepared.expectedActor, rendererTimezoneOffsetMinutes: prepared.documentBefore.rendererTimezoneOffsetMinutes });
  need(token !== prepared.before.token && token !== prepared.armed.token, "Post Windows bracket requires a distinct original observation.");
  const after = await issued(token, "owned-observation"); check();
  await assertIssuedWindowsClockObservation(prepared.before.token); check(); await assertIssuedWindowsClockObservation(prepared.armed.token); check();
  for (const clock of [prepared.launch, prepared.capture, prepared.before, prepared.armed, after]) { assertCurrentIssuedWindowsClockObservation(clock.token); }
  sameCapture(prepared.capture, after); ordered(prepared.armed, after);
  for (const value of [result.documentBefore, result.documentAfter]) {
    const document = documentSample(value);
    need(document.rendererTimezoneOffsetMinutes === -prepared.armed.before.localOffsetMinutes && document.rendererBeforeMs >= maximum(prepared.armed) &&
      document.rendererAfterMs <= minimum(after) && document.notifyTabId === prepared.documentBefore.notifyTabId &&
      document.rendererBeforeMs >= prepared.documentBefore.rendererAfterMs && document.serverTimeMs >= plan.documentWindow.minimumMs &&
      document.rendererAfterMs <= plan.documentWindow.maximumMs, "Writer document sample is outside its original independent brackets.");
  }
  lifecycle.post = Object.freeze({ clock: after, result, originalResult }); lifecycle.stage = "post-recorded";
}

/** Closure uses retained historical pre/post clocks only. Never revive a live
 * generation/startup assertion after its owner has closed the application.
 */
export async function verifyCurrentSchematicRenameClockEffect(plan: CurrentSchematicRenameClockPlan, input: Readonly<{
  engine: EasyedaControlEngine; dispatchOwner: CurrentSchematicRenameWriterOwner; terminationProof: unknown; after: Inventory;
}>): Promise<Readonly<Record<string, unknown>>> {
  const lifecycle = lifecycles.get(plan), prepared = plans.get(plan); const post = lifecycle?.post;
  need(lifecycle !== undefined && prepared !== undefined && post !== undefined && lifecycle.stage === "post-recorded", "Original SCH clock effect already consumed or post absent.");
  lifecycle.stage = "verification-consumed";
  fields(input, ["engine", "dispatchOwner", "terminationProof", "after"]);
  need(input.engine === prepared.engine && input.dispatchOwner === prepared.dispatchOwner && canonicalJson(plan) === prepared.text, "Original SCH clock closure owner differs.");
  const after = input.after, proof = input.terminationProof, termination = await windowsClockObservationForResult(proof, "termination");
  const exit = await issued(termination, "termination"); ordered(post.clock, exit); sameGeneration(prepared.launch, exit); need(isRecord(proof));
  const base = exit.token.base, original = prepared.capture.token.ownerBinding, owner = exit.token.ownerBinding;
  for (const key of ["operationId", "phase", "challengeAttempt", "authoritySha256"]) { need(proof[key] === original[key] && owner[key] === original[key]); }
  for (const key of ["bridgeSessionSha256", "runtimeIdentitySha256"]) { need(proof[key] === original[key]); }
  for (const key of ["jobId", "helperInstance"]) { need(proof[key] === prepared.capture.token.base[key]); }
  need(base["captureBindingSha256"] === original["bindingSha256"] && owner["captureBindingSha256"] === original["bindingSha256"] &&
    proof["launchSha256"] === prepared.launch.token.ownerBinding["launchSha256"] && owner["closeIntentSha256"] === proof["closeIntentSha256"] &&
    proof["jobEmpty"] === true && proof["retainedProcessesExited"] === true && proof["saveOrDiscardSelected"] === false &&
    base["jobEmpty"] === true && base["retainedProcessesExited"] === true && proof["closedAt"] === base["checkedAt"]);
  const closedAt = exactUtcTicks(proof["closedAt"]);
  need(closedAt >= BigInt(exit.before.utcBeforeTicks) && closedAt <= BigInt(exit.after.utcAfterTicks));
  const effect = await verifyCurrentSchematicRenameStoredEffect(prepared.preparation, prepared.source.source.baseline.inventory, prepared.source.projection, after, post.result.after.updateTime);
  const rendererReturnInterval = Object.freeze({ minimumMs: maximum(prepared.armed), maximumMs: minimum(post.clock) });
  const backendPersistenceInterval = Object.freeze({ minimumMs: maximum(prepared.armed), maximumMs: maximum(exit) });
  // Worker b849bd12 SCH updateData1915783 awaits uploadLocal2031178, which awaits
  // Cache.put but only schedules bufferedUploadCloud before returning, through
  // BufferedStream2029648. It does not await the backend persistence callback.
  // Backend persistence may follow the renderer reply. Its upper bound is the
  // Original termination probe's outer clock endpoint, not its pre-probe sample:
  // Windows-authority.ps1 Handle-ClockedRequest reads before, calls Handle-Request
  // Prove-terminated (retained handles/empty Job, then checkedAt), then reads after.
  // The original SQL preparation still enforces the frozen 60-second window;
  // No renderer/document bracket, consumed attempt or closed-owner check changes.
  need(effect.backendTime >= backendPersistenceInterval.minimumMs && effect.backendTime <= backendPersistenceInterval.maximumMs,
    "Stored backend time is outside the original armed-to-termination persistence interval.");
  need(await windowsClockObservationForResult(proof, "termination") === termination); assertCurrentIssuedWindowsClockObservation(termination);
  const comparison = Object.freeze({ profile: "private.current-schematic-rename-clock-effect.v1", operationId: plan.operationId,
    beforeSqlSha256: plan.beforeSqlSha256, afterSqlSha256: after.logicalSha256, preparationSha256: plan.preparationSha256, metadataProjectionSha256: plan.metadataProjectionSha256,
    ownerBindingSha256: plan.ownerBindingSha256, backendWindow: plan.backendWindow, documentWindow: plan.documentWindow,
    rendererReturnInterval, backendPersistenceInterval,
    documentBeforeSha256: plan.documentBeforeSha256, nativeResultSha256: sha256Json(post.result), storedEffect: effect,
    windowsObservationSha256s: Object.freeze([prepared.launch, prepared.capture, prepared.before, prepared.armed, post.clock, exit].map(clock => sha256Json(clock.token))),
    transactionTimestampsWithinPlannedWindows: true, transactionActorMatchesExpected: true, backendActorPreverified: false, futureRequestActorVerified: false,
    originalLaunchAndJobTerminationVerified: true, originalWindowsObservationsRetained: true, originalStartupBound: true, ...ASSUMPTIONS, ...LIMITS });
  lifecycle.completed = Object.freeze({ after, afterText: canonicalJson(after), effect, comparison, comparisonText: canonicalJson(comparison) }); return comparison;
}

export function completedCurrentSchematicRenameClockSource(plan: CurrentSchematicRenameClockPlan, engine: EasyedaControlEngine, dispatchOwner: CurrentSchematicRenameWriterOwner,
  after: Inventory): Omit<ReturnType<typeof completedCurrentSchematicRenameStoredSource>, "comparison"> & Readonly<{
    comparison: Readonly<Record<string, unknown>>; expectedActor: ActorProjection; preparation: CurrentSchematicRenameSqlPreparation;
    storedEffect: CurrentSchematicRenameStoredEffect;
  }> {
  const lifecycle = lifecycles.get(plan), prepared = plans.get(plan); const completed = lifecycle?.completed;
  need(lifecycle !== undefined && lifecycle.stage === "verification-consumed" && prepared !== undefined && completed !== undefined &&
    prepared.engine === engine && prepared.dispatchOwner === dispatchOwner && prepared.text === canonicalJson(plan) && completed.after === after &&
    completed.afterText === canonicalJson(after) && completed.comparisonText === canonicalJson(completed.comparison), "Original successful SCH clock effect required.");
  const decoded = completedCurrentSchematicRenameStoredSource(completed.effect, prepared.preparation, after);
  return Object.freeze({ history: decoded.history, maximumTicket: decoded.maximumTicket, comparison: completed.comparison,
    expectedActor: prepared.expectedActor, preparation: prepared.preparation, storedEffect: completed.effect });
}
