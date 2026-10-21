/** Historical schema tests only. Synthetic JSON must never issue a native owner
 * or be adopted as a current collector packet. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { STRING_PRECREATE_OBSERVATION_MAX_BYTES, stringPrecreateObservationResultSchema,
  stringPrecreateTargetMatches } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";
import { CURRENT_PCB_STRING_ACTOR_CLOCK_LIMITS } from "../src/current-pcb-string-actor-clock-runner.ts";

const TARGET = Object.freeze({ projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "d".repeat(16), windowTabId: "window_1" });
function historicalV1(): Record<string, unknown> {
  return { schema: "easyeda-pro-control.pcb-string-precreate-observation.v1", target: TARGET, first: {}, second: {},
    matchingSamples: true, originalContextsRechecked: true, atomicSnapshotVerified: false, projectWorkerAssociationVerified: false,
    publicationCaptureVerified: false, completeLiveSourceVerified: false, continuousObservation: false,
    queueCompletionVerified: false, saveAuthorized: false, executionAuthorized: false };
}
function worker(windowTabId: string = TARGET.windowTabId): Record<string, unknown> {
  return { schema: "easyeda-pro-control.pcb-string-worker-producer-observation.v1",
    identity: { projectUuid: TARGET.projectUuid, branchUuid: TARGET.branchUuid, windowTabId },
    originalRunnerIssued: true, hiddenCallbackReceiversVerified: false, completePublishersVerified: false,
    writeDestinationsContained: false, atomicSnapshotVerified: false, continuousObservation: false,
    queueCompletionVerified: false, saveAuthorized: false, executionAuthorized: false };
}
function actor(windowTabId: string = TARGET.windowTabId): Record<string, unknown> {
  return { profile: "private.current-pcb-string-actor-clock-packet.v1", identity: { ...TARGET, windowTabId },
    originalRunnerIssued: true, pairedActorValuesMatched: true, packetSha256: "c".repeat(64), ...CURRENT_PCB_STRING_ACTOR_CLOCK_LIMITS };
}
function currentV2(windowTabId: string = TARGET.windowTabId): Record<string, unknown> {
  return { ...historicalV1(), schema: "easyeda-pro-control.pcb-string-precreate-observation.v2",
    target: { ...TARGET, windowTabId }, workerProducers: worker(windowTabId), actorClock: actor(windowTabId) };
}
function padded(bytes: number): Readonly<Record<string, string>> {
  const result = { padding: "x".repeat(bytes - Buffer.byteLength(JSON.stringify({ padding: "" }))) };
  assert.equal(Buffer.byteLength(JSON.stringify(result)), bytes); return result;
}

void test("historical V1 stays readable while V2 requires both new bounded evidence sections", () => {
  assert.equal(stringPrecreateObservationResultSchema.safeParse(historicalV1()).success, true);
  const current = currentV2(); assert.equal(stringPrecreateObservationResultSchema.safeParse(current).success, true);
  for (const key of ["workerProducers", "actorClock"]) {
    const missing = Object.fromEntries(Object.entries(current).filter(([field]) => field !== key));
    assert.equal(stringPrecreateObservationResultSchema.safeParse(missing).success, false, key);
  }
  assert.equal(stringPrecreateObservationResultSchema.safeParse({ ...current,
    schema: "easyeda-pro-control.pcb-string-precreate-observation.v1" }).success, false);
  assert.equal(stringPrecreateObservationResultSchema.safeParse({ ...historicalV1(),
    schema: "easyeda-pro-control.pcb-string-precreate-observation.v2" }).success, false);
});

void test("all original window ID spellings survive journal identity checks without coercion", () => {
  for (const windowTabId of ["window_1", "f".repeat(16), "f".repeat(32), "Window1_".repeat(16)]) {
    const result = stringPrecreateObservationResultSchema.parse(currentV2(windowTabId));
    assert.equal(result.target.windowTabId, windowTabId);
    assert.equal(stringPrecreateTargetMatches(result, TARGET, { observation: { windowTabId } },
      { openingObservation: { windowTabId } }), true);
    assert.equal(stringPrecreateTargetMatches(result, TARGET, { observation: { windowTabId: "other" } },
      { openingObservation: { windowTabId } }), false);
  }
  assert.equal(stringPrecreateObservationResultSchema.safeParse(currentV2("bad/window")).success, false);
  const oversizedWindow = "x".repeat(129);
  assert.equal(stringPrecreateObservationResultSchema.safeParse(currentV2(oversizedWindow)).success, false);
});

void test("V2 refuses foreign original identities and promoted actor/worker authority claims", () => {
  const current = currentV2();
  for (const change of [
    { workerProducers: { ...worker(), identity: { projectUuid: "e".repeat(64), branchUuid: TARGET.branchUuid, windowTabId: TARGET.windowTabId } } },
    { workerProducers: worker("other") }, { actorClock: actor("other") },
    { actorClock: { ...actor(), identity: { ...TARGET, documentUuid: "e".repeat(16) } } },
    { first: { state: "first" }, second: { state: "different" } },
  ]) { assert.equal(stringPrecreateObservationResultSchema.safeParse({ ...current, ...change }).success, false); }
  for (const field of Object.keys(CURRENT_PCB_STRING_ACTOR_CLOCK_LIMITS)) {
    assert.equal(stringPrecreateObservationResultSchema.safeParse({ ...current, actorClock: { ...actor(), [field]: true } }).success, false, field);
  }
  for (const field of ["hiddenCallbackReceiversVerified", "completePublishersVerified", "writeDestinationsContained", "atomicSnapshotVerified",
    "continuousObservation", "queueCompletionVerified", "saveAuthorized", "executionAuthorized"]) {
    assert.equal(stringPrecreateObservationResultSchema.safeParse({ ...current, workerProducers: { ...worker(), [field]: true } }).success, false, field);
  }
  assert.equal(stringPrecreateObservationResultSchema.safeParse({ ...current, executionAuthorized: true }).success, false);
});

void test("historical and V2 sweeps keep separate limits and both collector sections retain their own cap", () => {
  const historicalEdge = padded(188_416), v2Edge = padded(212_992);
  assert.equal(stringPrecreateObservationResultSchema.safeParse({ ...historicalV1(), first: historicalEdge, second: historicalEdge }).success, true);
  assert.equal(stringPrecreateObservationResultSchema.safeParse({ ...historicalV1(), first: v2Edge, second: v2Edge }).success, false);
  assert.equal(stringPrecreateObservationResultSchema.safeParse({ ...currentV2(), first: v2Edge, second: v2Edge }).success, true);
  const tooLarge = padded(212_993);
  assert.equal(stringPrecreateObservationResultSchema.safeParse({ ...currentV2(), first: tooLarge, second: tooLarge }).success, false);
  for (const [key, base] of [["workerProducers", worker()], ["actorClock", actor()]] as const) {
    assert.equal(stringPrecreateObservationResultSchema.safeParse({ ...currentV2(), [key]: { ...base, padding: "x".repeat(131_072) } }).success, false);
  }
  assert.equal(STRING_PRECREATE_OBSERVATION_MAX_BYTES, 696_320);
});
