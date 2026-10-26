/** Pinned copy-create route and its source-visible effects. Supplied source
 * bytes do not retain a native receiver, responder, clock or generation. */
import { sha256Json, sha256Text } from "./core.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_COPY_CREATE_SOURCE_PROFILE = freezeDeep({
  "worker": {
    "relativePath": "pro-mgr/3.2.185.bf63a159/js/project-worker.js",
    "bytes": 2_181_308,
    "sha256": "0e7a474385029ac4f69dac08abdfd8beec7346aea8c2a4f71d5afb78bb454046",
    "spans": {
      "create": {
        "start": 1_884_898,
        "end": 1_885_523,
        "bytes": 625,
        "sha256": "41754b7deddc26b6e894ec3e92d877791d904323fb424936d7c47a7ca6b134ce"
      },
      "buildString": {
        "start": 1_883_915,
        "end": 1_884_565,
        "bytes": 650,
        "sha256": "a5de191a03fc3d3c3eda2a4d9c5d9d4fbb5d1baee27950a41837f516902bee3b"
      },
      "canvasString": {
        "start": 1_889_419,
        "end": 1_889_822,
        "bytes": 403,
        "sha256": "2ad2650ac660d5d6ee56726650a8b636dbd670f74b522e4a5c640f325bb34715"
      },
      "getCanvasData": {
        "start": 1_889_822,
        "end": 1_890_210,
        "bytes": 388,
        "sha256": "bba6c084bbd315bc4c2bcf338eab7ee949d03e2e1d9548095464216cf608930c"
      },
      "get": {
        "start": 1_880_762,
        "end": 1_881_278,
        "bytes": 516,
        "sha256": "8d9f306dc82edd247d74300e4f33e6bae6656fa1243f94fb16e889a674898dfe"
      },
      "getStr": {
        "start": 1_890_246,
        "end": 1_890_717,
        "bytes": 471,
        "sha256": "8f2466efb348dbaae6eee3631eec72f26a1547d9812a0c00126414e805fc6013"
      },
      "getCanvasByConsistency": {
        "start": 2_146_221,
        "end": 2_146_420,
        "bytes": 199,
        "sha256": "f4f434afc27e1e7a274c63627adc50e58868a9b395df629f5334d91213cf03f9"
      },
      "compress": {
        "start": 2_131_732,
        "end": 2_131_913,
        "bytes": 181,
        "sha256": "30371572974d9f7abfb4a94a2fa557915c8b5d0e713a1cab6539e2b7b740861b"
      },
      "asyncCompressFull": {
        "start": 294_244,
        "end": 294_370,
        "bytes": 126,
        "sha256": "faa2b7b6ef22333b855caa8e7e5d18073b80fc86d98084881b62a4800b6ed0df"
      },
      "historyCacheData": {
        "start": 282_643,
        "end": 283_717,
        "bytes": 1074,
        "sha256": "d7fd81e1922acf1cb0d19043260bed2ecab67e3e44e4f939fc199d9339e0e34a"
      },
      "delayClear": {
        "start": 278_374,
        "end": 278_928,
        "bytes": 554,
        "sha256": "1d6f68446b4b1aa51761d3ae064847e68171023381193586b489f1f24e7a058d"
      },
      "uploadLocal": {
        "start": 2_031_202,
        "end": 2_031_622,
        "bytes": 420,
        "sha256": "5add70c985bd271d5683fc48abd3d69ed0627cb54a9638acc73a164e583b5ea4"
      },
      "setDoctype": {
        "start": 276_431,
        "end": 276_517,
        "bytes": 86,
        "sha256": "4f6225761c5db83104b08188553e43a3590a807272eaf84dc4550206e1e5331a"
      },
      "newTicket": {
        "start": 1_856_510,
        "end": 1_856_613,
        "bytes": 103,
        "sha256": "b2e4944fdd2d9d7ceaaba8b9b3ff803e12fd8f86eb782a987057ba2ea4c924df"
      },
      "serverTime": {
        "start": 1_711_153,
        "end": 1_711_246,
        "bytes": 93,
        "sha256": "891be3132a4d163bbede847d96e1c03351acac41e990064bcb619aee63286ea4"
      },
      "notifySource": {
        "start": 1_388_611,
        "end": 1_388_725,
        "bytes": 114,
        "sha256": "2d4e41923be0b9c811fd6057e28b352d54ae6cef45bce7f018d51f9917c1e497"
      },
      "sourceRouter": {
        "start": 1_642_869,
        "end": 1_643_127,
        "bytes": 258,
        "sha256": "b8f8fc21b8e26f9a449b37eae23e8532f3772070cf54baaa2ecd070e1e4e2490"
      },
      "cacheData": {
        "start": 2_013_316,
        "end": 2_014_458,
        "bytes": 1142,
        "sha256": "c646ada5303c2ed37413329da6d708f4135f6acde933273bfab61dca45833804"
      }
    }
  },
  "ui": {
    "relativePath": "pro-ui/3.2.198.2800f583/js/ui.js",
    "bytes": 17_468_192,
    "sha256": "3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6",
    "spans": {
      "projectSource": {
        "start": 6_339_783,
        "end": 6_340_307,
        "bytes": 524,
        "sha256": "e800866588e5d39bf469ba520d66078590c851fcca9154753ee56b2541434f82"
      },
      "sourceRouter": {
        "start": 6_340_920,
        "end": 6_341_182,
        "bytes": 262,
        "sha256": "04ccc946a35f17e21356ef0246d4bc36f9d10d96f6ad243f588b85f173251cff"
      },
      "responder": {
        "start": 16_969_142,
        "end": 16_969_178,
        "bytes": 36,
        "sha256": "391b67d00b4dc26b7504ada02d36093d3e989718243663ff378e2c95458c4bab"
      }
    }
  }
} as const);
export type CurrentFootprintCopyCreateSourceKind = keyof typeof CURRENT_FOOTPRINT_COPY_CREATE_SOURCE_PROFILE;
const limits = Object.freeze({ suppliedSourceBytesOnly: true, runtimeMethodsBound: false, uiSourceRouteBound: false,
  nativeClockProvenanceVerified: false, parserAndCacheEffectsContained: false, uploadCompletionVerified: false,
  nativeGenerationClosed: false, persistenceVerified: false, executionAuthorized: false } as const);
export interface CurrentFootprintCopyCreateSourceQualification extends Readonly<typeof limits> {
  readonly profile: "private.current-footprint-copy-create-source.v1";
  readonly sourceClosureSha256: string;
  readonly sourceSpanCount: number;
}
const issued = new WeakSet<object>();
function need(condition: boolean): asserts condition {
  if (!condition) { throw new Error("CURRENT_FOOTPRINT_COPY_CREATE_SOURCE"); }
}

/** Source evidence only. This never evaluates supplied text or reflects on
 * caller objects, and an exact slice cannot substitute for the full bundles. */
export function assertCurrentFootprintCopyCreateSourceSpan(kind: CurrentFootprintCopyCreateSourceKind,
  name: string, source: unknown): void {
  need((kind === "worker" || kind === "ui") && typeof name === "string" && typeof source === "string");
  const spans: Readonly<Record<string, Readonly<{ bytes: number; sha256: string }>>> =
    CURRENT_FOOTPRINT_COPY_CREATE_SOURCE_PROFILE[kind].spans;
  need(Object.hasOwn(spans, name)); const span = spans[name];
  need(span !== undefined && source.length <= span.bytes && source.isWellFormed() &&
    Buffer.byteLength(source) === span.bytes && sha256Text(source) === span.sha256);
}

/** Both complete pinned immutable bundles and all selected UTF-16 slices must
 * match. No source file, callback, path, native handle or caller profile is
 * accepted. The original enclosing owner still must bind these implementations
 * and their transitive dependencies to actual method/bus objects. */
export function qualifyCurrentFootprintCopyCreateSources(workerSource: unknown,
  uiSource: unknown): CurrentFootprintCopyCreateSourceQualification {
  let sourceSpanCount = 0;
  for (const [kind, source] of [["worker", workerSource], ["ui", uiSource]] as const) {
    const profile = CURRENT_FOOTPRINT_COPY_CREATE_SOURCE_PROFILE[kind];
    need(typeof source === "string" && source.length <= profile.bytes && source.isWellFormed() &&
      Buffer.byteLength(source) === profile.bytes && sha256Text(source) === profile.sha256);
    const spans: Readonly<Record<string, Readonly<{ start: number; end: number }>>> = profile.spans;
    for (const [name, span] of Object.entries(spans)) {
      assertCurrentFootprintCopyCreateSourceSpan(kind, name, source.slice(span.start, span.end)); sourceSpanCount += 1;
    }
  }
  const qualification: CurrentFootprintCopyCreateSourceQualification = Object.freeze({
    profile: "private.current-footprint-copy-create-source.v1", sourceSpanCount,
    sourceClosureSha256: sha256Json(CURRENT_FOOTPRINT_COPY_CREATE_SOURCE_PROFILE), ...limits });
  issued.add(qualification); return qualification;
}

export function requireCurrentFootprintCopyCreateSources(value: unknown): void {
  need(value !== null && typeof value === "object" && issued.has(value));
}

/** Facts derived from the pinned code, not observations of a running copy.
 * Future lifecycle admission must account for every listed producer. */
export const CURRENT_FOOTPRINT_COPY_CREATE_EFFECTS = Object.freeze({
  destinationAllocatedBeforeFirstClockAwait: true,
  destinationDocTypeSetBeforeFirstClockAwait: true,
  metadataTicketConsumedBeforeSourceRequest: true,
  sourceRequestCrossesUiNotifyBus: true,
  externalLibraryLookupPrecedesProjectFlag: true,
  emptyUiSourceReplyCanBeReportedSuccessful: true,
  sourceCompressionMayInitializeHistoryCache: true,
  missingChunkMayReplayHistoryThroughParser: true,
  sourceCompressionSchedulesDeferredCacheCleanup: true,
  nativeUploadParsesBeforeCachePut: true,
  failedCachePutCanFallBackToUploadCloud: true,
  successfulCachePutSchedulesBufferedUpload: true,
  createIgnoresUploadResultSuccessFlag: true,
  createSuccessCanContainNullMetadata: true,
  nativeFailureProvesNoMutation: false,
  nativeSuccessProvesPersistence: false,
  sourceQualificationEnablesExecution: false,
} as const);
