import assert from "node:assert/strict";
import { test } from "node:test";
import { isRecord } from "../src/core.ts";
import { inspectCurrentPcbStringSavePrerequisites } from "../src/current-pcb-string-save-prerequisites.ts";

// Source-derived supplied data only. No native manager, compiler, timer, worker,
// IPC route, Save or persistent database is exercised by these tests.
function fixture(): Record<string, unknown> {
  return {
    target: { projectUuid: "a".repeat(64), documentUuid: "b".repeat(16), uniqueId: "synthetic-unique", client: "synthetic-client" },
    compiler: { uuid: "b".repeat(16), path: "a".repeat(64), uniqueId: "synthetic-unique", client: "synthetic-client",
      headType: "PCB", isProject: true, isInit: true, canSave: true, isInitIng: false, isDestroy: false,
      pendCacheLength: 0, pendCacheKeys: [], pendTimer: null, pendPromise: null, cacheKeys: [], deleteCacheKeys: [] },
    footprints: { holderKeys: [], otherProjectManagerKeys: [], otherDecodingProjectId: null },
    dynamicCopper: { workerName: null, bus: null, time: null },
    workers: { mapKeys: [], busMapKeys: [], ratlineWorkerKeys: [], workerBusKeys: [], workerStateKeys: [] },
    history: { undoCommand: [], redoCommand: [], stack: null },
    uploads: { boardFlag: false, pouredIds: [], innerLayerIds: [] },
    teardrop: { isMove: false, suspend: true, modify: [], task: [], modifyTears: [], timeoutId: null },
    projectWorker: { isReady: true, isTemporary: false, isHistoryBack: false, isV2Format: false,
      task1: [], task2: [], task3: [], cachePromise: [], bufferUploadDataKeys: [], bufferUploadCacheKeys: [],
      isUploadingCloud: false, pendingSyncCloud: false, isBatchUpload: false, uniqueIdsKeys: [] },
  };
}
function nested(value: Readonly<Record<string, unknown>>, key: string): Record<string, unknown> {
  const result = value[key]; assert.ok(isRecord(result)); return result;
}
function changed(section: string, key: string, value: unknown): Record<string, unknown> {
  const result = fixture(); nested(result, section)[key] = value; return result;
}
function refuse(value: unknown): void {
  assert.throws(() => inspectCurrentPcbStringSavePrerequisites(value, fixture()));
  assert.throws(() => inspectCurrentPcbStringSavePrerequisites(fixture(), value));
}

void test("String Save supplied pre-create exclusions match, predict only compiler documents and remain frozen", () => {
  const first = fixture(), second = fixture(); const result = inspectCurrentPcbStringSavePrerequisites(first, second);
  assert.equal(result.suppliedSamplesMatch, true);
  assert.equal(result.stage, "supplied-pre-create-only");
  assert.deepEqual(result.expectedNativeCompilerDocIds, ["b".repeat(16), "BLOB", "FONT"]);
  assert.deepEqual(result.excludedNativeSaveParticipants, ["loaded-custom-footprints", "dynamic-copper-worker"]);
  assert.match(result.observationSha256, /^[a-f\d]{64}$/u);
  assert.equal(Object.isFrozen(result), true); assert.equal(Object.isFrozen(result.remaining), true);
  assert.equal(Object.isFrozen(result.expectedNativeCompilerDocIds), true);
  nested(first, "target")["documentUuid"] = "c".repeat(16);
  assert.equal(result.expectedNativeCompilerDocIds[0], "b".repeat(16));
});

void test("String Save rejects every nonempty native queue and footprint/worker inventory", () => {
  for (const [section, value] of Object.entries(fixture())) {
    assert.ok(value !== null && typeof value === "object");
    for (const [key, field] of Object.entries(value)) {
      if (Array.isArray(field)) { refuse(changed(section, key, ["pending"])); }
    }
  }
  // A custom holder with no canvas component still participates in Save.
  refuse(changed("footprints", "holderKeys", ["custom-with-zero-components"]));
  // Native workerName truthiness is unsafe. ID0 is a real first worker.
  for (const workerName of [0, -0, 1, "", false, undefined]) { refuse(changed("dynamicCopper", "workerName", workerName)); }
  refuse(changed("dynamicCopper", "bus", {})); refuse(changed("dynamicCopper", "time", 1));
});

void test("String Save excludes existing history, unpublished compiler data and active deferred effects", () => {
  for (const [section, key, value] of [
    ["history", "stack", { commands: [], waitingUploadStack: [] }],
    ["compiler", "pendCacheLength", 1], ["compiler", "pendPromise", "settled"], ["compiler", "pendTimer", 0],
    ["compiler", "isDestroy", true], ["uploads", "boardFlag", true],
    ["teardrop", "isMove", true], ["teardrop", "suspend", false], ["teardrop", "timeoutId", 0],
    ["projectWorker", "isUploadingCloud", true], ["projectWorker", "pendingSyncCloud", true],
    ["projectWorker", "isBatchUpload", true], ["projectWorker", "isTemporary", true],
    ["projectWorker", "isHistoryBack", true], ["projectWorker", "isV2Format", true],
  ] as const) { refuse(changed(section, key, value)); }
});

void test("String Save uses the actual initialized compiler flag, without null or falsey normalization", () => {
  assert.doesNotThrow(() => inspectCurrentPcbStringSavePrerequisites(fixture(), fixture()));
  for (const value of [null, undefined, true, 0, "", "false"]) { refuse(changed("compiler", "isDestroy", value)); }
});

void test("String Save rejects incomplete, extra, coerced and conflicting identities", () => {
  for (const [section, value] of Object.entries(fixture())) {
    assert.ok(value !== null && typeof value === "object");
    for (const key of Object.keys(value)) {
      const incomplete = fixture(); assert.equal(Reflect.deleteProperty(nested(incomplete, section), key), true); refuse(incomplete);
    }
    refuse(changed(section, "unreviewed", false));
  }
  for (const [key, value] of [["uuid", "c".repeat(16)], ["path", "c".repeat(64)], ["client", "other"],
    ["uniqueId", "other"], ["headType", "FOOTPRINT"], ["isProject", false], ["canSave", false],
    ["isInit", false], ["isInitIng", true], ["pendCacheLength", -0], ["pendCacheLength", "0"]] as const) {
    refuse(changed("compiler", key, value));
  }
  for (const value of [null, [], new Map(), { ...fixture(), saveAuthorized: true },
    changed("target", "projectUuid", "a".repeat(65))]) { refuse(value); }
  const different = fixture(); nested(different, "target")["client"] = "other"; nested(different, "compiler")["client"] = "other";
  assert.throws(() => inspectCurrentPcbStringSavePrerequisites(fixture(), different), /supplied samples differ/u);
});

void test("String Save refuses getters, proxies, coercions, inherited values and decorated arrays without invoking them", () => {
  let calls = 0;
  const accessor = fixture(); Object.defineProperty(nested(accessor, "compiler"), "pendPromise", { enumerable: true, get() { calls += 1; return null; } });
  const proxy = new Proxy(fixture(), { getPrototypeOf(): object { calls += 1; return Object.prototype; } });
  const queue = Object.defineProperty([], "extra", { get() { calls += 1; return 0; } });
  const coercion = { toJSON(): null { calls += 1; return null; } };
  const inherited: unknown = Object.create(fixture());
  for (const value of [accessor, proxy, changed("compiler", "pendPromise", coercion),
    changed("uploads", "pouredIds", queue), inherited, { ...fixture(), [Symbol("extra")]: null },
    Object.defineProperty(fixture(), "compiler", { value: fixture()["compiler"], enumerable: false })]) { refuse(value); }
  assert.equal(calls, 0);
  const repeated = fixture(); nested(repeated, "uploads")["pouredIds"] = nested(repeated, "uploads")["innerLayerIds"]; refuse(repeated);
  const cyclic = fixture(); nested(cyclic, "dynamicCopper")["bus"] = cyclic; refuse(cyclic);
  refuse(changed("history", "undoCommand", Array.from({ length: 25 }, () => null)));
});

void test("String Save supplied relation grants no live observation, queue, execution or persistence authority", () => {
  const result = inspectCurrentPcbStringSavePrerequisites(fixture(), fixture());
  for (const field of ["liveObservationVerified", "nativeReceiverVerified", "emptyRootPcbVerified", "completeLiveBaselineVerified",
    "completeStoredBaselineVerified", "producerOwnershipVerified", "queueCompletionVerified", "nativeSaveEffectVerified",
    "persistenceVerified", "renderingVerified", "writerSupported", "executionAuthorized"]) { assert.equal(Reflect.get(result, field), false); }
  for (const field of ["saveAuthorized", "dispatchToken", "saveCode", "queueOwner", "primitiveId", "header", "ticket"]) {
    assert.equal(Object.hasOwn(result, field), false);
  }
  assert.equal(result.remaining.length, 5);
});
