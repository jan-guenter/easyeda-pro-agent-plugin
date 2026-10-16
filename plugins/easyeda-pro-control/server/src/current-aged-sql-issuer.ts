/** Original current renderer/scratch relation, collected before write arming. */
/* oxlint-disable import/max-dependencies -- Retain existing generation, original Windows, source and scratch issuers directly; no supplied verifier or authority registration. */
import { readExactUtf8Artifact, writePhaseArtifact } from "./artifacts.ts";
import type { ArtifactDescriptor } from "./artifacts.ts";
import { assertExpectedFingerprint, canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { CURRENT_AGED_SQL_DATE_PARSER_SOURCE } from "./current-aged-sql-clock-controls.ts";
import type { CurrentAgedSqlClockControls } from "./current-aged-sql-clock-controls.ts";
// oxlint-disable-next-line import/no-cycle -- The invoking baseline coordinator also owns the scratch stage; the fixed original-token lookup cannot be a supplied callback.
import { assertOriginalCurrentAgedSqlReference, revalidateOriginalCurrentAgedSqlReference } from "./current-aged-sql-reference.ts";
import type { OriginalCurrentAgedSqlReference } from "./current-aged-sql-reference.ts";
import { buildCurrentAgedSqlRendererProgram, decodeCurrentAgedSqlRendererReply } from "./current-aged-sql-renderer-program.ts";
import { verifyCurrentProjectOnlySymbolPreflightImplementation } from "./current-disposable-open-profile.ts";
// oxlint-disable-next-line import/no-cycle -- Only the invoking coordinator issues this renderer generation; no alternate registration or callback issuer is allowed.
import { assertCurrentProjectOnlySymbolGeneration, revalidateCurrentProjectOnlySymbolGeneration } from "./current-symbol-baseline-runtime.ts";
import type { CurrentProjectOnlySymbolGeneration, CurrentProjectOnlySymbolGenerationSource } from "./current-symbol-baseline-runtime.ts";
import { currentSymbolClockEvidenceId } from "./current-symbol-clock-evidence.ts";
import type { EasyedaControlEngine } from "./engine.ts";
import { compareRendererClockEndpoints } from "./renderer-clock-endpoints.ts";
import { validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";
import { assertCurrentIssuedWindowsClockObservation } from "./windows-authority.ts";
import type { IssuedWindowsClockObservation } from "./windows-authority.ts";

const EPOCH_TICKS = 621_355_968_000_000_000n;
export interface OriginalCurrentAgedSqlClock {
  readonly profile: "private.original-current-aged-sql-clock.v1";
  readonly operationId: string; readonly historyUuid: string; readonly createdAtLiteral: string;
  readonly parserSource: typeof CURRENT_AGED_SQL_DATE_PARSER_SOURCE;
  readonly rendererSha256: string; readonly referenceSha256: string;
  readonly intentArtifact: Readonly<ArtifactDescriptor>; readonly resultArtifact: Readonly<ArtifactDescriptor>;
  readonly originalReferenceAndRendererRetained: true;
  readonly currentSourceProfileChecked: true;
  readonly sourceFreshnessVerified: false; readonly startupQualified: false;
  readonly producerBindingVerified: false; readonly executionAuthorized: false;
}
interface Original {
  readonly engine: EasyedaControlEngine; readonly generation: CurrentProjectOnlySymbolGeneration;
  readonly source: CurrentProjectOnlySymbolGenerationSource; readonly reference: OriginalCurrentAgedSqlReference;
  readonly renderer: CurrentAgedSqlClockControls;
  readonly before: IssuedWindowsClockObservation; readonly after: IssuedWindowsClockObservation;
  readonly text: string;
}
const issued = new WeakMap<object, Original>();
const attempts = new WeakSet<CurrentProjectOnlySymbolGeneration>();
interface Collection {
  readonly engine: EasyedaControlEngine;
  before?: IssuedWindowsClockObservation; raw?: unknown; after?: IssuedWindowsClockObservation;
  intentArtifact?: Readonly<ArtifactDescriptor>; resultArtifact?: Readonly<ArtifactDescriptor>;
  resultPublicationAttempted: boolean; failureObserved: boolean;
}
const collections = new WeakMap<CurrentProjectOnlySymbolGeneration, Collection>();
function need(condition: boolean, message = "Current aged SQL issuer refused."): asserts condition { if (!condition) { throw new Error(message); } }

/** Original diagnostic retention survives owner loss; never reconstructs an
 * issuer or permits retry. No error text or arbitrary caller data is included.
 */
export function currentAgedSqlCollectionEvidence(generation: CurrentProjectOnlySymbolGeneration, engine: EasyedaControlEngine): Readonly<Record<string, unknown>> | undefined {
  const collection = collections.get(generation);
  if (collection === undefined) { return undefined; }
  need(collection.engine === engine);
  return Object.freeze({ profile: "private.current-aged-sql-collection-evidence.v1", before: collection.before ?? null,
    raw: collection.raw ?? null, after: collection.after ?? null, intentArtifact: collection.intentArtifact ?? null,
    beforeRetained: collection.before !== undefined, rawRetained: Object.hasOwn(collection, "raw"), afterRetained: collection.after !== undefined,
    resultArtifact: collection.resultArtifact ?? null, resultPublicationAttempted: collection.resultPublicationAttempted,
    failureObserved: collection.failureObserved, executionAuthorized: false });
}
function current(value: unknown, engine: EasyedaControlEngine, generation: CurrentProjectOnlySymbolGeneration): Original {
  need(value !== null && typeof value === "object");
  const original = issued.get(value);
  need(original !== undefined && original.engine === engine && original.generation === generation && original.text === canonicalJson(value));
  const scope = engine.upstream.currentAuthenticatedBridgeDispatchBinding?.();
  need(scope !== undefined && assertCurrentProjectOnlySymbolGeneration(generation, engine, canonicalJson(scope)) === original.source);
  need(assertOriginalCurrentAgedSqlReference(original.reference, engine, original.source.baseline) === original.reference);
  assertCurrentIssuedWindowsClockObservation(original.before); assertCurrentIssuedWindowsClockObservation(original.after);
  return original;
}
function rawClock(token: IssuedWindowsClockObservation): Exclude<IssuedWindowsClockObservation["clock"], { status: "unavailable" }> {
  need(assertCurrentIssuedWindowsClockObservation(token) === token && token.phase === "owned-observation" && token.clock.status === "observed" &&
    token.clock.tzAbsentBefore && token.clock.tzAbsentAfter &&
    BigInt(token.clock.before.utcAfterTicks) <= BigInt(token.clock.after.utcBeforeTicks) &&
    BigInt(token.clock.before.qpcAfter) <= BigInt(token.clock.after.qpcBefore));
  return token.clock;
}

/** A new exact dispatch lease can collect this read, but cannot adopt an old
 * generation. Any failure consumes the generation's one attempt. Read result
 * evidence is retained before interpretation; no mutation or Save is issued.
 */
export async function collectCurrentAgedSqlClock(engine: EasyedaControlEngine, generation: CurrentProjectOnlySymbolGeneration,
  reference: OriginalCurrentAgedSqlReference): Promise<OriginalCurrentAgedSqlClock> {
  const scopeReader = engine.upstream.currentAuthenticatedBridgeDispatchBinding;
  need(scopeReader !== undefined);
  const scope = scopeReader.call(engine.upstream); need(scope !== undefined);
  const scopeText = canonicalJson(scope);
  const source = assertCurrentProjectOnlySymbolGeneration(generation, engine, scopeText);
  assertOriginalCurrentAgedSqlReference(reference, engine, source.baseline);
  need(!attempts.has(generation), "Current aged SQL generation attempt already consumed."); attempts.add(generation);
  const collection: Collection = { engine, resultPublicationAttempted: false, failureObserved: false };
  collections.set(generation, collection);
  const evidenceId = currentSymbolClockEvidenceId(generation.operationId);
  try {
  // oxlint-disable-next-line typescript/unbound-method -- Identity only; every call retains the actual engine receiver.
  const observe = engine.freshClockObservationForClosedCapture;
  const call = engine.upstream.callTool;
  const unchanged = (): void => {
    need(assertCurrentProjectOnlySymbolGeneration(generation, engine, scopeText) === source &&
      assertOriginalCurrentAgedSqlReference(reference, engine, source.baseline) === reference &&
      engine.upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader && canonicalJson(scopeReader.call(engine.upstream)) === scopeText &&
      engine.freshClockObservationForClosedCapture === observe && engine.upstream.callTool === call);
  };
  unchanged();
  await revalidateCurrentProjectOnlySymbolGeneration(generation, engine, scopeText); unchanged();
  await revalidateOriginalCurrentAgedSqlReference(reference, engine, source.baseline); unchanged();
  const fingerprint = source.source.expectedFingerprint;
  assertExpectedFingerprint(fingerprint);
  validateSdkLocalRuntimeFingerprint(fingerprint);
  const assetsRoot = fingerprint.installedBundles.assetsRoot;
  await verifyCurrentProjectOnlySymbolPreflightImplementation(assetsRoot); unchanged();
  await engine.assertBridgeDispatchAllowed(); unchanged();
  const actor = source.originalPreparation.closedTargetWitness.observation.runtimeObservation.actor;
  const request = { scope: { createdAtLiteral: reference.request.createdAtLiteral, referenceUtcMs: reference.request.referenceUtcMs },
    target: { projectUuid: source.baseline.preparation.target.projectUuid, branchUuid: source.baseline.preparation.target.branchUuid }, actor };
  const code = buildCurrentAgedSqlRendererProgram(request);
  const intent = await writePhaseArtifact(evidenceId, 0, "current-aged-renderer-intent", {
    profile: "private.current-aged-sql-renderer-intent.v1", request, codeSha256: sha256Text(code),
    referenceSha256: sha256Json(reference), captureSha256: sha256Json(source.capture), scopeSha256: sha256Json(scope), executionAuthorized: false });
  collection.intentArtifact = Object.freeze(intent);
  unchanged();
  await readExactUtf8Artifact(intent); unchanged();
  const before = await observe.call(engine, source.capture); collection.before = before; unchanged();
  const raw = await call.call(engine.upstream, "easyeda_execute", { code, timeoutMs: 15_000, confirmWrite: true }, 25_000);
  collection.raw = raw; unchanged();
  const after = await observe.call(engine, source.capture); collection.after = after; unchanged();
  collection.resultPublicationAttempted = true;
  const artifact = await writePhaseArtifact(evidenceId, 0, "current-aged-renderer-result", { raw, before, after });
  collection.resultArtifact = Object.freeze(artifact); unchanged();
  const renderer = decodeCurrentAgedSqlRendererReply(raw, request);
  const first = rawClock(before), last = rawClock(after);
  const minimum = Number((BigInt(first.before.utcBeforeTicks) - EPOCH_TICKS) / 10_000n);
  const maximum = Number((BigInt(last.after.utcAfterTicks) - EPOCH_TICKS + 9999n) / 10_000n);
  for (const sample of [first.after, last.before, last.after]) {
    need(sample.zoneRulesSha256 === first.before.zoneRulesSha256 && sample.localOffsetMinutes === first.before.localOffsetMinutes &&
      sample.qpcFrequency === first.before.qpcFrequency);
  }
  compareRendererClockEndpoints({ nativeBefore: first.before, nativeAfter: last.after,
    plannedWindow: { notBeforeMs: minimum, notAfterMs: maximum }, renderer: { schema: "private.renderer-clock-endpoints.v1",
      nowBeforeMs: renderer.controlsBefore.clockBefore.epochMs, nowAfterMs: renderer.controlsAfter.clockAfter.epochMs,
      isoBefore: renderer.controlsBefore.clockBefore.iso, isoAfter: renderer.controlsAfter.clockAfter.iso,
      offsetBeforeMinutes: renderer.controlsBefore.clockBefore.offsetMinutes, offsetAfterMinutes: renderer.controlsAfter.clockAfter.offsetMinutes } });
  need(before !== after && canonicalJson(before.ownerBinding) === canonicalJson(after.ownerBinding) && maximum - minimum <= 10_000 &&
    BigInt(last.after.qpcAfter) - BigInt(first.before.qpcBefore) <= BigInt(first.before.qpcFrequency) * 10n &&
    BigInt(first.after.utcAfterTicks) <= BigInt(last.before.utcBeforeTicks) && BigInt(first.after.qpcAfter) <= BigInt(last.before.qpcBefore) &&
    // Date.now returns integer milliseconds, unlike Windows' sub-millisecond
    // Tick endpoints. Preserve the observed containing millisecond at each end.
    renderer.controlsBefore.clockBefore.epochMs >= Number((BigInt(first.after.utcAfterTicks) - EPOCH_TICKS) / 10_000n) &&
    renderer.controlsAfter.clockAfter.epochMs <= Number((BigInt(last.before.utcBeforeTicks) - EPOCH_TICKS) / 10_000n) &&
    BigInt(reference.nativeAfter.utcAfterTicks) <= BigInt(first.before.utcBeforeTicks) &&
    BigInt(reference.nativeAfter.qpcAfter) <= BigInt(first.before.qpcBefore) &&
    reference.nativeAfter.zoneRulesSha256 === first.before.zoneRulesSha256 && reference.nativeAfter.qpcFrequency === first.before.qpcFrequency &&
    reference.nativeAfter.localOffsetMinutes === first.before.localOffsetMinutes &&
    canonicalJson(reference.controlsAfter.epochs) === canonicalJson(renderer.controlsBefore.epochs) &&
    canonicalJson(reference.controlsAfter.sql) === canonicalJson(renderer.controlsBefore.sql) &&
    reference.controlsAfter.clockAfter.offsetMinutes === renderer.controlsBefore.clockBefore.offsetMinutes);
  await verifyCurrentProjectOnlySymbolPreflightImplementation(assetsRoot); unchanged();
  await readExactUtf8Artifact(artifact); unchanged();
  await revalidateCurrentProjectOnlySymbolGeneration(generation, engine, scopeText); unchanged();
  rawClock(before); rawClock(after);
  const result: OriginalCurrentAgedSqlClock = Object.freeze({ profile: "private.original-current-aged-sql-clock.v1", operationId: generation.operationId,
    historyUuid: reference.request.historyUuid, createdAtLiteral: reference.request.createdAtLiteral, parserSource: CURRENT_AGED_SQL_DATE_PARSER_SOURCE,
    rendererSha256: sha256Json(renderer), referenceSha256: sha256Json(reference), intentArtifact: Object.freeze(intent), resultArtifact: Object.freeze(artifact),
    originalReferenceAndRendererRetained: true, currentSourceProfileChecked: true,
    sourceFreshnessVerified: false, startupQualified: false, producerBindingVerified: false, executionAuthorized: false });
  issued.set(result, { engine, generation, source, reference, renderer, before, after, text: canonicalJson(result) }); return result;
  } catch (error) {
    collection.failureObserved = true;
    if (collection.intentArtifact !== undefined && !collection.resultPublicationAttempted) {
      collection.resultPublicationAttempted = true;
      try {
        collection.resultArtifact = Object.freeze(await writePhaseArtifact(evidenceId, 0, "current-aged-renderer-result",
          currentAgedSqlCollectionEvidence(generation, engine)));
      } catch (retentionError) {
        throw new AggregateError([error, retentionError], "Current aged SQL read failed and partial evidence publication failed; original attempt is retained.", { cause: retentionError });
      }
    }
    throw error;
  }
}

/** Bind the age result to a fresh original backend-window observation. This
 * does not arm, dispatch or widen a window; the writer owns those later steps.
 */
export function qualifyCurrentAgedSqlHead(value: OriginalCurrentAgedSqlClock, engine: EasyedaControlEngine,
  generation: CurrentProjectOnlySymbolGeneration, backendStart: IssuedWindowsClockObservation): Readonly<{
    createdAtLiteral: string; nativeParsedLocalMs: number; nativeTimezoneOffsetMinutes: number;
  }> {
  const original = current(value, engine, generation);
  const after = rawClock(original.after), clock = rawClock(backendStart);
  need(backendStart !== original.before && backendStart !== original.after &&
    canonicalJson(backendStart.ownerBinding) === canonicalJson(original.after.ownerBinding) &&
    clock.before.zoneRulesSha256 === after.after.zoneRulesSha256 && clock.before.localOffsetMinutes === after.after.localOffsetMinutes &&
    clock.before.qpcFrequency === after.after.qpcFrequency && BigInt(clock.before.utcBeforeTicks) >= BigInt(after.after.utcAfterTicks) &&
    BigInt(clock.before.qpcBefore) >= BigInt(after.after.qpcAfter));
  const selected = original.renderer.controlsBefore.sql[0]; need(selected !== undefined);
  const offset = original.renderer.controlsBefore.clockBefore.offsetMinutes;
  const minimum = Number((BigInt(clock.before.utcBeforeTicks) - EPOCH_TICKS) / 10_000n);
  const adjusted = selected.epochMs - offset * 60_000;
  need(Number.isSafeInteger(adjusted) && Number.isSafeInteger(minimum) && minimum - adjusted >= 61_000,
    "Current unlocked SQL head is not 61000 ms old at the original backend window.");
  return Object.freeze({ createdAtLiteral: value.createdAtLiteral, nativeParsedLocalMs: selected.epochMs, nativeTimezoneOffsetMinutes: offset });
}
