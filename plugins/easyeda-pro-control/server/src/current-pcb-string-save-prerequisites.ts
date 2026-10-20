/** Supplied-data exclusions before the FIRST String creation, not a live Save
 * preflight or a post-create model. No observer, token or dispatcher consumes
 * this result. Native anchors refer to PCB217199c8 and WORKERb849bd12. */
import { types } from "node:util";
import { z } from "zod";
import { canonicalJson, sha256Text } from "./core.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const empty = z.array(z.never()).length(0);
const identifier = z.string().min(1).max(128).regex(/^[A-Za-z0-9_-]+$/u);
const targetSchema = z.object({ projectUuid: z.string().regex(/^[a-f\d]{64}$/u),
  documentUuid: z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u), uniqueId: identifier, client: identifier }).strict();
const snapshotSchema = z.object({
  target: targetSchema,
  // Base compiler cachePendData@3145459 and save@3147112. Null means supplied
  // Nullish raw field, never a falsey/coerced value or a missing observation.
  compiler: z.object({ uuid: identifier, path: identifier, uniqueId: identifier, client: identifier,
    headType: z.literal("PCB"), isProject: z.literal(true), isInit: z.literal(true), canSave: z.literal(true),
    // A8e.initProject sets isDestroy=false before its first awaited RPC.
    // An initialized compiler never represents that state as null/undefined.
    isInitIng: z.literal(false), isDestroy: z.literal(false), pendCacheLength: z.literal(0),
    pendCacheKeys: empty, pendTimer: z.null(), pendPromise: z.null(), cacheKeys: empty, deleteCacheKeys: empty }).strict(),
  // Native wi/Dm@4309943 selects a manager while otherDecodingProjectId is
  // Set. Empty component DTOs say nothing about loaded Al custom holders.
  footprints: z.object({ holderKeys: empty, otherProjectManagerKeys: empty, otherDecodingProjectId: z.null() }).strict(),
  // FP/ON@6438258; native Save tests workerName by truthiness. Worker ID0 is
  // Real, so ONLY explicitly observed null/undefined maps to this null field.
  dynamicCopper: z.object({ workerName: z.null(), bus: z.null(), time: z.null() }).strict(),
  workers: z.object({ mapKeys: empty, busMapKeys: empty, ratlineWorkerKeys: empty,
    workerBusKeys: empty, workerStateKeys: empty }).strict(),
  // Xe/kde@7922234 initializes stack=null. Us/tge's eagerly created empty De
  // It is a different owner; it must not be substituted for this history stack.
  // Any existing history stack is excluded, even with no waiting uploads.
  history: z.object({ undoCommand: empty, redoCommand: empty, stack: z.null() }).strict(),
  uploads: z.object({ boardFlag: z.literal(false), pouredIds: empty, innerLayerIds: empty }).strict(),
  // Sfe@9092131 always schedules a callback; removeTears calls increaseUpload
  // Even for an empty set. A future post-create observer must own that interval.
  teardrop: z.object({ isMove: z.literal(false), suspend: z.literal(true), modify: empty,
    task: empty, modifyTears: empty, timeoutId: z.null() }).strict(),
  // SaveCanvas@2144972 may drain the WHOLE project buffer when its uniqueId has
  // No pending data. These are complete supplied inventories, not task counts.
  projectWorker: z.object({ isReady: z.literal(true), isTemporary: z.literal(false),
    isHistoryBack: z.literal(false), isV2Format: z.literal(false), task1: empty, task2: empty, task3: empty,
    cachePromise: empty, bufferUploadDataKeys: empty, bufferUploadCacheKeys: empty,
    isUploadingCloud: z.literal(false), pendingSyncCloud: z.literal(false), isBatchUpload: z.literal(false),
    uniqueIdsKeys: empty }).strict(),
}).strict();
type Snapshot = z.infer<typeof snapshotSchema>;

const LIMITS = Object.freeze({ liveObservationVerified: false, nativeReceiverVerified: false,
  emptyRootPcbVerified: false, completeLiveBaselineVerified: false, completeStoredBaselineVerified: false,
  producerOwnershipVerified: false, queueCompletionVerified: false, nativeSaveEffectVerified: false,
  persistenceVerified: false, renderingVerified: false, writerSupported: false, executionAuthorized: false } as const);
const REMAINING = Object.freeze([
  "Observe these private native holders and queues through a reviewed exact-frame/original-worker route; no such route is provided here.",
  "Independently prove complete empty root geometry, stored history, assets, source ownership, startup effects and extension subscribers.",
  "Bind the one native-generated ID and exact create effect, including filtering, asynchronous teardrop and compiler publication, without retry.",
  "Qualify post-create state and the original Save producer; the pre-create empty history and pendPromise conditions no longer suffice.",
  "Consume exactly one journaled Save intent, retain the original acknowledgment or ambiguity, and prove full closed SQL, fresh reopened readback and visual result.",
] as const);

function need(value: boolean, detail: string): asserts value {
  if (!value) { throw new Error(`Current PCB String Save prerequisites: ${detail}.`); }
}

/** Reject callbacks, proxies and lossy data before Zod or JSON serialization can
 * Touch them. Fixed limits precede recursion and allocation of child copies. */
function copyData(input: unknown): unknown {
  const seen = new Set<object>(); let count = 0;
  function visit(value: unknown, depth: number): unknown {
    count += 1; need(count <= 256 && depth <= 5, "observation exceeds bounds");
    if (value === null || typeof value === "boolean") { return value; }
    if (typeof value === "string") { need(value.length <= 128, "observation string exceeds bound"); return value; }
    if (typeof value === "number") { need(Number.isFinite(value) && !Object.is(value, -0), "lossless finite number required"); return value; }
    need(typeof value === "object" && !types.isProxy(value), "plain own-data observation required");
    need(!seen.has(value), "repeated or cyclic object unsupported"); seen.add(value);
    const keys = Reflect.ownKeys(value), prototype: unknown = Object.getPrototypeOf(value);
    need(keys.length <= 24, "observation fields exceed bound");
    if (Array.isArray(value)) {
      need(prototype === Array.prototype && keys.length === 1 && keys[0] === "length" && value.length === 0,
        "nonempty or decorated queue inventory unsupported"); return [];
    }
    need(prototype === Object.prototype || prototype === null, "plain own-data observation required");
    const result: Record<string, unknown> = {};
    for (const key of keys) {
      need(typeof key === "string" && key.length <= 64 && !["__proto__", "prototype", "constructor"].includes(key), "unexpected observation key");
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && descriptor.enumerable === true, "own enumerable data required");
      result[key] = visit(descriptor.value as unknown, depth + 1);
    }
    return result;
  }
  return visit(input, 0);
}
function parse(input: unknown): Snapshot {
  const result = snapshotSchema.parse(copyData(input));
  const { target, compiler } = result;
  need(target.projectUuid === compiler.path && target.documentUuid === compiler.uuid &&
    target.uniqueId === compiler.uniqueId && target.client === compiler.client, "supplied compiler identity differs");
  return result;
}

export interface CurrentPcbStringSavePrerequisites extends Readonly<typeof LIMITS> {
  readonly profile: "private.current-pcb-string-save-prerequisites.v1";
  readonly stage: "supplied-pre-create-only";
  readonly suppliedSamplesMatch: true;
  readonly observationSha256: string;
  readonly expectedNativeCompilerDocIds: readonly [string, "BLOB", "FONT"];
  readonly excludedNativeSaveParticipants: readonly ["loaded-custom-footprints", "dynamic-copper-worker"];
  readonly remaining: typeof REMAINING;
}

/** Two equal supplied snapshots establish only this bounded data relation. They
 * Cannot establish complete collection, temporal stability, backend quiescence,
 * Ownership or that a successful Save will persist only one STRING. */
export function inspectCurrentPcbStringSavePrerequisites(first: unknown, second: unknown): CurrentPcbStringSavePrerequisites {
  const a = parse(first), b = parse(second), serialized = canonicalJson(a);
  need(serialized === canonicalJson(b), "supplied samples differ");
  return freezeDeep({ profile: "private.current-pcb-string-save-prerequisites.v1", stage: "supplied-pre-create-only",
    suppliedSamplesMatch: true, observationSha256: sha256Text(serialized),
    expectedNativeCompilerDocIds: [a.target.documentUuid, "BLOB", "FONT"],
    excludedNativeSaveParticipants: ["loaded-custom-footprints", "dynamic-copper-worker"], remaining: REMAINING, ...LIMITS } as const);
}
