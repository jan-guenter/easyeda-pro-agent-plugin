/** PCB-specific clock preparation. Original Windows tokens and startup data
 * remain separate from the unqualified renderer sample and writer authority.
 */
/* oxlint-disable import/max-dependencies -- Compose original startup, exact result/SQL comparators and original Windows issuers; none can be replaced by caller callbacks. */
import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import { assertOriginalCurrentPcbRenameBinding, prepareCurrentPcbRenameBinding } from "./current-pcb-rename-binding.ts";
import type { CurrentPcbRenameBinding } from "./current-pcb-rename-binding.ts";
import type { CurrentProjectOnlyPcbRenameGeneration } from "./current-pcb-rename-generation-runtime.ts";
import { prepareCurrentPcbRename } from "./current-pcb-rename-preparation.ts";
import type { CurrentPcbRenamePreparation } from "./current-pcb-rename-preparation.ts";
import { validateCurrentPcbRenameResult } from "./current-pcb-rename-program.ts";
import type { CurrentPcbRenameProgramResult } from "./current-pcb-rename-program.ts";
import type { CurrentPcbRenameSqlWitness } from "./current-pcb-rename-sql.ts";
import { assertOriginalCurrentPcbRenameStartup } from "./current-pcb-rename-startup-runtime.ts";
import type { CurrentPcbRenameStartupObservation } from "./current-pcb-rename-startup-runtime.ts";
import { completedCurrentPcbRenameStoredSource, verifyCurrentPcbRenameStoredEffect } from "./current-pcb-rename-stored-effect.ts";
import type { CurrentPcbRenameStoredEffect } from "./current-pcb-rename-stored-effect.ts";
import type { EasyedaControlEngine } from "./engine.ts";
import type { readExactSqlInventory } from "./sqlite-inventory.ts";
import { validateActorProjection } from "./symbol-dual-actor.ts";
import type { ActorProjection } from "./symbol-dual-actor.ts";
import { assertCurrentIssuedWindowsClockObservation, assertIssuedWindowsClockObservation, windowsClockObservationForResult } from "./windows-authority.ts";
import type { IssuedWindowsClockObservation } from "./windows-authority.ts";
import { validateClockSample } from "./windows-clock-transport.ts";

const COLLECTION_MS = 10_000, EPOCH_TICKS = 621_355_968_000_000_000n, WINDOW_MS = 60_000;
const LIMITS = Object.freeze({ dispatchOwnershipVerified: false, documentSampleProvenanceVerified: false, startupQualified: false,
  completeAstSourceBindingVerified: false, startupLocalChangesExcluded: false, backendActorVerified: false, producerBindingVerified: false,
  appClockDirectlyObserved: false, continuousClockStabilityProved: false, futureWriteClockVerified: false,
  entireJobExitedWithinOriginalWindow: false, persistentUploadReplayExcluded: false, reopened: false, writerReady: false, executionAuthorized: false } as const);
const ASSUMPTIONS = Object.freeze({ commonOsClockAndNoInterveningChangeRequired: true,
  reviewedOrdinaryDateAndVfsImplementationsRequired: true, noOtherTargetWriterRequired: true } as const);
type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
export interface CurrentPcbRenameDocumentClockSample {
  readonly rendererBeforeMs: number; readonly serverTimeMs: number; readonly rendererAfterMs: number;
  readonly rendererBeforeIso: string; readonly rendererAfterIso: string;
  readonly rendererTimezoneOffsetMinutes: number; readonly notifyTabId: string;
}
export interface CurrentPcbRenameClockInput {
  readonly engine: EasyedaControlEngine; readonly generation: CurrentProjectOnlyPcbRenameGeneration;
  readonly startup: CurrentPcbRenameStartupObservation; readonly dispatchOwner: object;
  readonly beforeClock: IssuedWindowsClockObservation; readonly armedClock: IssuedWindowsClockObservation;
  /** Caller data until the fixed native dispatch issuer proves its origin. */
  readonly documentBefore: CurrentPcbRenameDocumentClockSample;
  readonly agedHead?: CurrentPcbRenameSqlWitness["agedHead"];
}
export interface CurrentPcbRenameClockPlan extends Readonly<typeof LIMITS>, Readonly<typeof ASSUMPTIONS> {
  readonly profile: "private.current-pcb-rename-clock-plan.v1";
  readonly operationId: string; readonly beforeSqlSha256: string; readonly preparationSha256: string; readonly bindingSha256: string;
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
  readonly engine: EasyedaControlEngine; readonly generation: CurrentProjectOnlyPcbRenameGeneration; readonly startup: CurrentPcbRenameStartupObservation;
  readonly dispatchOwner: object; readonly source: ReturnType<typeof assertOriginalCurrentPcbRenameStartup>;
  readonly launch: Clock; readonly capture: Clock; readonly before: Clock; readonly armed: Clock;
  readonly documentBefore: CurrentPcbRenameDocumentClockSample; readonly expectedActor: ActorProjection;
  readonly preparation: CurrentPcbRenamePreparation; readonly binding: CurrentPcbRenameBinding; readonly text: string;
}
interface Lifecycle {
  stage: "armed" | "post-consumed" | "post-recorded" | "verification-consumed";
  post?: Readonly<{ clock: Clock; result: CurrentPcbRenameProgramResult; originalResult: unknown }>;
  completed?: Readonly<{ after: Inventory; afterText: string; effect: CurrentPcbRenameStoredEffect;
    comparison: Readonly<Record<string, unknown>>; comparisonText: string }>;
}
const attempts = new WeakSet<CurrentPcbRenameStartupObservation>(), owners = new WeakSet<object>(), plans = new WeakMap<CurrentPcbRenameClockPlan, Prepared>();
const lifecycles = new WeakMap<CurrentPcbRenameClockPlan, Lifecycle>();
function need(condition: boolean, message = "Current PCB rename clock refused."): asserts condition { if (!condition) { throw new Error(message); } }
function fields(value: unknown, required: readonly string[], optional: readonly string[] = []): void {
  need(value !== null && typeof value === "object" && !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null), "Clock input must be plain data.");
  const keys = Reflect.ownKeys(value);
  need(keys.every(key => typeof key === "string" && (required.includes(key) || optional.includes(key))) && required.every(key => keys.includes(key)), "Clock input fields differ.");
  for (const key of keys) { need(Object.hasOwn(Object.getOwnPropertyDescriptor(value, key) ?? {}, "value"), "Clock input accessors refused."); }
}
function documentSample(value: CurrentPcbRenameDocumentClockSample): CurrentPcbRenameDocumentClockSample {
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

/** One attempt per original startup and opaque dispatch reservation. Neither
 * can be replaced to resample a failed preparation or extend its deadlines.
 */
export async function prepareCurrentPcbRenameClock(input: CurrentPcbRenameClockInput): Promise<CurrentPcbRenameClockPlan> {
  fields(input, ["engine", "generation", "startup", "dispatchOwner", "beforeClock", "armedClock", "documentBefore"], ["agedHead"]);
  const { engine, generation, startup, dispatchOwner: owner } = input;
  const source = assertOriginalCurrentPcbRenameStartup(startup, engine, generation);
  need(owner !== null && typeof owner === "object" && !attempts.has(startup) && !owners.has(owner), "PCB clock reservation already consumed.");
  attempts.add(startup); owners.add(owner);
  const document = documentSample(input.documentBefore), expectedActor = validateActorProjection(source.observation.runtimeObservation.actor);
  const tokens = [source.source.launchClock, source.source.captureClock, input.beforeClock, input.armedClock] as const;
  const aged = input.agedHead;
  if (aged !== undefined) { fields(aged, ["createdAtLiteral", "nativeParsedLocalMs", "nativeTimezoneOffsetMinutes"]); }
  const agedHead = aged === undefined ? undefined : Object.freeze({ ...aged });
  const check = (): void => { need(assertOriginalCurrentPcbRenameStartup(startup, engine, generation) === source); };
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
  const preparation = await prepareCurrentPcbRename({ before: baseline.inventory, target, desiredTitle,
    witness: { projectUuid: target.projectUuid, branchUuid: target.branchUuid, client: source.observation.clientTicketObservation.client,
      backendActorUuid: expectedActor.uuid, documentClockMinMs: documentWindow.minimumMs, documentClockMaxMs: documentWindow.maximumMs,
      backendClockMinMs: backendWindow.minimumMs, backendClockMaxMs: backendWindow.maximumMs, backendLocalOffsetMinutes: before.before.localOffsetMinutes,
      ...(agedHead === undefined ? {} : { agedHead }) } }); check();
  const binding = await prepareCurrentPcbRenameBinding({ before: baseline.inventory, preparation }); check();
  need(canonicalJson(binding.request) === canonicalJson(source.projection.request) && canonicalJson(binding.peers) === canonicalJson(source.projection.peers) &&
    binding.maximumTicket === source.projection.maximumTicket, "Original startup PCB projection changed.");
  await assertIssuedWindowsClockObservation(before.token); check(); await assertIssuedWindowsClockObservation(armed.token); check();
  for (const clock of [launch, capture, before, armed]) { assertCurrentIssuedWindowsClockObservation(clock.token); }
  need(capture.token.ownerBinding["operationId"] === generation.operationId, "Original Windows capture operation differs.");
  const plan: CurrentPcbRenameClockPlan = Object.freeze({ profile: "private.current-pcb-rename-clock-plan.v1", operationId: generation.operationId,
    beforeSqlSha256: baseline.inventory.logicalSha256, preparationSha256: preparation.preparationSha256, bindingSha256: binding.bindingSha256,
    ownerBindingSha256: sha256Json(capture.token.ownerBinding), documentBeforeSha256: sha256Json(document), backendWindow, documentWindow,
    collectionMaximumMs: COLLECTION_MS, originalWindowsObservationsRetained: true, originalStartupBound: true, ...ASSUMPTIONS, ...LIMITS });
  plans.set(plan, Object.freeze({ engine, generation, startup, dispatchOwner: owner, source, launch, capture, before, armed, documentBefore: document,
    expectedActor, preparation, binding, text: canonicalJson(plan) })); lifecycles.set(plan, { stage: "armed" }); return plan;
}

/** Only this accessor exposes the original prepared mutation inputs. It does
 * not manufacture a fresh Windows or renderer clock observation.
 */
export function assertOriginalCurrentPcbRenameClock(plan: CurrentPcbRenameClockPlan, engine: EasyedaControlEngine,
  generation: CurrentProjectOnlyPcbRenameGeneration, startup: CurrentPcbRenameStartupObservation, dispatchOwner: object): Prepared {
  const prepared = plans.get(plan);
  need(prepared !== undefined && prepared.engine === engine && prepared.generation === generation && prepared.startup === startup &&
    prepared.dispatchOwner === dispatchOwner && prepared.text === canonicalJson(plan), "Original PCB clock preparation required.");
  need(assertOriginalCurrentPcbRenameStartup(startup, engine, generation) === prepared.source);
  assertOriginalCurrentPcbRenameBinding(prepared.binding, prepared.preparation); return prepared;
}

/** Consume the original live plan once. The supplied result is still data until
 * the one-shot dispatch coordinator separately retains its actual native raw.
 */
export async function recordCurrentPcbRenameClockPost(plan: CurrentPcbRenameClockPlan, input: Readonly<{
  engine: EasyedaControlEngine; generation: CurrentProjectOnlyPcbRenameGeneration; startup: CurrentPcbRenameStartupObservation;
  dispatchOwner: object; afterClock: IssuedWindowsClockObservation; result: unknown;
}>): Promise<void> {
  const lifecycle = lifecycles.get(plan); need(lifecycle !== undefined && lifecycle.stage === "armed", "Original PCB clock post already consumed or absent.");
  lifecycle.stage = "post-consumed";
  fields(input, ["engine", "generation", "startup", "dispatchOwner", "afterClock", "result"]);
  const prepared = assertOriginalCurrentPcbRenameClock(plan, input.engine, input.generation, input.startup, input.dispatchOwner);
  const { engine, generation, startup, dispatchOwner, afterClock: token, result: originalResult } = input;
  const check = (): void => { need(assertOriginalCurrentPcbRenameClock(plan, engine, generation, startup, dispatchOwner) === prepared); };
  const result = validateCurrentPcbRenameResult(originalResult, prepared.preparation, prepared.binding, { expectedActor: prepared.expectedActor,
    startup: prepared.source.expectation, rendererTimezoneOffsetMinutes: prepared.documentBefore.rendererTimezoneOffsetMinutes });
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
export async function verifyCurrentPcbRenameClockEffect(plan: CurrentPcbRenameClockPlan, input: Readonly<{
  engine: EasyedaControlEngine; dispatchOwner: object; terminationProof: unknown; after: Inventory;
}>): Promise<Readonly<Record<string, unknown>>> {
  const lifecycle = lifecycles.get(plan), prepared = plans.get(plan); const post = lifecycle?.post;
  need(lifecycle !== undefined && prepared !== undefined && post !== undefined && lifecycle.stage === "post-recorded", "Original PCB clock effect already consumed or post absent.");
  lifecycle.stage = "verification-consumed";
  fields(input, ["engine", "dispatchOwner", "terminationProof", "after"]);
  need(input.engine === prepared.engine && input.dispatchOwner === prepared.dispatchOwner && canonicalJson(plan) === prepared.text, "Original PCB clock closure owner differs.");
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
  const effect = await verifyCurrentPcbRenameStoredEffect(prepared.preparation, after, post.result.after.updateTime);
  need(effect.backendTime >= maximum(prepared.armed) && effect.backendTime <= minimum(post.clock), "Stored backend time is outside the actual original writer bracket.");
  need(await windowsClockObservationForResult(proof, "termination") === termination); assertCurrentIssuedWindowsClockObservation(termination);
  const comparison = Object.freeze({ profile: "private.current-pcb-rename-clock-effect.v1", operationId: plan.operationId,
    beforeSqlSha256: plan.beforeSqlSha256, afterSqlSha256: after.logicalSha256, preparationSha256: plan.preparationSha256, bindingSha256: plan.bindingSha256,
    ownerBindingSha256: plan.ownerBindingSha256, backendWindow: plan.backendWindow, documentWindow: plan.documentWindow,
    documentBeforeSha256: plan.documentBeforeSha256, nativeResultSha256: sha256Json(post.result), storedEffect: effect,
    windowsObservationSha256s: Object.freeze([prepared.launch, prepared.capture, prepared.before, prepared.armed, post.clock, exit].map(clock => sha256Json(clock.token))),
    transactionTimestampsWithinPlannedWindows: true, originalWindowsObservationsRetained: true, originalStartupBound: true, ...ASSUMPTIONS, ...LIMITS });
  lifecycle.completed = Object.freeze({ after, afterText: canonicalJson(after), effect, comparison, comparisonText: canonicalJson(comparison) }); return comparison;
}

export function completedCurrentPcbRenameClockSource(plan: CurrentPcbRenameClockPlan, engine: EasyedaControlEngine, dispatchOwner: object,
  after: Inventory): Omit<ReturnType<typeof completedCurrentPcbRenameStoredSource>, "comparison"> & Readonly<{
    comparison: Readonly<Record<string, unknown>>; expectedActor: ActorProjection; preparation: CurrentPcbRenamePreparation;
    binding: CurrentPcbRenameBinding; storedEffect: CurrentPcbRenameStoredEffect;
  }> {
  const lifecycle = lifecycles.get(plan), prepared = plans.get(plan); const completed = lifecycle?.completed;
  need(lifecycle !== undefined && lifecycle.stage === "verification-consumed" && prepared !== undefined && completed !== undefined &&
    prepared.engine === engine && prepared.dispatchOwner === dispatchOwner && prepared.text === canonicalJson(plan) && completed.after === after &&
    completed.afterText === canonicalJson(after) && completed.comparisonText === canonicalJson(completed.comparison), "Original successful PCB clock effect required.");
  const decoded = completedCurrentPcbRenameStoredSource(completed.effect, prepared.preparation, after);
  return Object.freeze({ history: decoded.history, maximumTicket: decoded.maximumTicket, comparison: completed.comparison,
    expectedActor: prepared.expectedActor, preparation: prepared.preparation, binding: prepared.binding, storedEffect: completed.effect });
}
