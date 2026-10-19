/** Private SCH clock relation, with original SCH startup/writer identities.
 * The renderer sample is supplied data until an original dispatch coordinator
 * retains the fixed collector's reply. No write or backend producer is enabled.
 * This first slice accepts locked history heads only, never a caller age claim.
 */
import { types } from "node:util";
import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import { assertCurrentSchematicRenameWriterOwner } from "./current-schematic-rename-generation-runtime.ts";
import type { CurrentProjectOnlySchematicRenameGeneration, CurrentSchematicRenameWriterOwner } from "./current-schematic-rename-generation-runtime.ts";
import { originalCurrentSchematicRenameSqlPreparation, prepareCurrentSchematicRenameSql } from "./current-schematic-rename-sql.ts";
import type { CurrentSchematicRenameSqlPreparation } from "./current-schematic-rename-sql.ts";
import { assertOriginalCurrentSchematicRenameStartup } from "./current-schematic-rename-startup-runtime.ts";
import type { CurrentSchematicRenameStartupObservation } from "./current-schematic-rename-startup-runtime.ts";
import type { EasyedaControlEngine } from "./engine.ts";
import { validateActorProjection } from "./symbol-dual-actor.ts";
import type { ActorProjection } from "./symbol-dual-actor.ts";
import { assertCurrentIssuedWindowsClockObservation, assertIssuedWindowsClockObservation } from "./windows-authority.ts";
import type { IssuedWindowsClockObservation } from "./windows-authority.ts";
import { validateClockSample } from "./windows-clock-transport.ts";

const COLLECTION_MS = 10_000, EPOCH_TICKS = 621_355_968_000_000_000n, WINDOW_MS = 60_000;
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
}
const attempts = new WeakSet<CurrentSchematicRenameStartupObservation>(), owners = new WeakSet<object>(), plans = new WeakMap<CurrentSchematicRenameClockPlan, Prepared>();
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
  fields(input, ["engine", "generation", "startup", "dispatchOwner", "beforeClock", "armedClock", "documentBefore"]);
  const { engine, generation, startup, dispatchOwner: owner } = input;
  const source = assertOriginalCurrentSchematicRenameStartup(startup, engine, generation);
  const writer = assertCurrentSchematicRenameWriterOwner(owner, engine);
  need(writer.generation === generation && writer.original === source.source, "Original SCH writer generation differs.");
  need(owner !== null && typeof owner === "object" && !attempts.has(startup) && !owners.has(owner), "SCH clock reservation already consumed.");
  attempts.add(startup); owners.add(owner);
  const document = documentSample(input.documentBefore), expectedActor = validateActorProjection(source.observation.runtimeObservation.actor);
  const tokens = [source.source.launchClock, source.source.captureClock, input.beforeClock, input.armedClock] as const;
  const check = (): void => {
    need(assertOriginalCurrentSchematicRenameStartup(startup, engine, generation) === source &&
      assertCurrentSchematicRenameWriterOwner(owner, engine) === writer, "Original SCH startup/writer owner changed.");
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
      backendClockMinMs: backendWindow.minimumMs, backendClockMaxMs: backendWindow.maximumMs, backendLocalOffsetMinutes: before.before.localOffsetMinutes } }); check();
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
    expectedActor, preparation, writer, text: canonicalJson(plan) })); return plan;
}

/** Only this accessor exposes the original prepared mutation inputs. It does
 * not manufacture a fresh Windows or renderer clock observation.
 */
export function assertOriginalCurrentSchematicRenameClock(plan: CurrentSchematicRenameClockPlan, engine: EasyedaControlEngine,
  generation: CurrentProjectOnlySchematicRenameGeneration, startup: CurrentSchematicRenameStartupObservation, dispatchOwner: CurrentSchematicRenameWriterOwner): Prepared {
  const prepared = plans.get(plan);
  need(prepared !== undefined && prepared.engine === engine && prepared.generation === generation && prepared.startup === startup &&
    prepared.dispatchOwner === dispatchOwner && prepared.text === canonicalJson(plan), "Original SCH clock preparation required.");
  need(assertOriginalCurrentSchematicRenameStartup(startup, engine, generation) === prepared.source);
  need(assertCurrentSchematicRenameWriterOwner(dispatchOwner, engine) === prepared.writer, "Original SCH writer changed.");
  originalCurrentSchematicRenameSqlPreparation(prepared.preparation, prepared.source.source.baseline.inventory, prepared.source.projection); return prepared;
}


