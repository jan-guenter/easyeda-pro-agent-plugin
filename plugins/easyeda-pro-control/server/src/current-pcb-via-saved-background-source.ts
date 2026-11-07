/** Exact supplied-source candidates, never runtime actor or no-cache authority.
 * Empty target URLs and matching constructors identify no running worker.
 * Fixed zip dispatchers import task-provided scripts; their hashes alone cannot
 * establish complete code, idle state or freedom from cache/storage effects. */
import { sha256Text } from "./core.ts";
import { CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCE_PROFILE as COMMON } from "./current-pcb-209-worker-bootstrap-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_VIA_SAVED_BACKGROUND_SOURCE_FILES = freezeDeep([
{"role":"ui","relativePath":"pro-ui/3.2.198.2800f583/js/ui.js","bytes":17_468_192,"sha256":"3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6"},
{"role":"manager","relativePath":"pro-mgr/3.2.185.bf63a159/js/pro-mgr.js","bytes":2_196_424,"sha256":"b3260ec9d98d6cad5f65a6234aa839b32f6bf5954cb03de0bd6ce003577b388d"},
{"role":"ui-worker","relativePath":"pro-ui/3.2.198.2800f583/js/worker.js","bytes":2_702_597,"sha256":"10d5d634a2881b4bd43c207854e1c45494d978edf9ad6b0d64ceb20fd21dd328"},
{"role":"library-worker","relativePath":"pro-mgr/3.2.185.bf63a159/js/lib-worker.js","bytes":1_629_823,"sha256":"ee7738d0203daa4094f9a3ed62cdc4b3d93fe27ee249e276f27109d7c52f2555"},
{"role":"preload","relativePath":"pro-mgr/3.2.185.bf63a159/js/preload.js","bytes":875_163,"sha256":"4f802b0d345b7c54817627fc854e61541f70585e8fcb0ecb98789365a88f9935"}
] as const);
export const CURRENT_PCB_VIA_SAVED_BACKGROUND_GENERATORS = freezeDeep([
{"role":"ui-fflate-1","file":"ui","start":6_017_161,"end":6_017_526,"bytes":365,"sha256":"f2693f8eba3fc9248e35d0646f9f86a0f38ca6c86e87d5fef0f3b2afeb365aa7","lineNumber":1169,"columnNumber":43_890,"constructorOffset":6_017_187,"workerSourceIdentityVerified":false,"noCacheBehaviorVerified":false},
{"role":"ui-fflate-2","file":"ui","start":8_492_652,"end":8_493_017,"bytes":365,"sha256":"57e451717e90903bd85a4023bc2e2c95409698b946992465072d904339274029","lineNumber":1173,"columnNumber":23_659,"constructorOffset":8_492_678,"workerSourceIdentityVerified":false,"noCacheBehaviorVerified":false},
{"role":"ui-zip-constructor","file":"ui","start":12_605_978,"end":12_606_201,"bytes":223,"sha256":"9b7b26ff4e75905bf3e66e24d14012dbc091e27f4d49e1550a0335c071613749","lineNumber":1716,"columnNumber":86_043,"constructorOffset":12_606_088,"workerSourceIdentityVerified":false,"noCacheBehaviorVerified":false},
{"role":"ui-zip-blob","file":"ui","start":12_653_728,"end":12_653_850,"bytes":122,"sha256":"136a1ca3bc90a52c843e30d2344897ce3223e9c5a29f57ccdc15921107a84e15","lineNumber":1717,"columnNumber":4,"constructorOffset":null,"workerSourceIdentityVerified":false,"noCacheBehaviorVerified":false},
{"role":"ui-message-worker","file":"ui","start":16_968_110,"end":16_976_907,"bytes":8797,"sha256":"62367e574ce53745e9f21bbdd7baf99b10e1ba27573121db60b5932edb10f8ad","lineNumber":2262,"columnNumber":161_711,"constructorOffset":16_968_564,"workerSourceIdentityVerified":false,"noCacheBehaviorVerified":false},
{"role":"manager-fflate-1","file":"manager","start":699_163,"end":699_526,"bytes":363,"sha256":"c3e0b991ba141e152abab0072b6021e892cfe8aa3fd0c4be04c8b62f3a5784b6","lineNumber":26,"columnNumber":69_523,"constructorOffset":699_189,"workerSourceIdentityVerified":false,"noCacheBehaviorVerified":false},
{"role":"manager-fflate-2","file":"manager","start":976_921,"end":977_284,"bytes":363,"sha256":"350270055d7b6f0e24457b4c182f3c9bef99af241b4eee6f3107837a5767e16d","lineNumber":29,"columnNumber":40_444,"constructorOffset":976_947,"workerSourceIdentityVerified":false,"noCacheBehaviorVerified":false},
{"role":"manager-zip-constructor","file":"manager","start":1_612_776,"end":1_612_994,"bytes":218,"sha256":"8ff8ed331ec5704e659697c5bcd07d8f33f58d6771113383684cb32b86ad1bad","lineNumber":103,"columnNumber":78_261,"constructorOffset":1_612_884,"workerSourceIdentityVerified":false,"noCacheBehaviorVerified":false},
{"role":"manager-zip-blob","file":"manager","start":1_614_926,"end":1_659_628,"bytes":44_702,"sha256":"b7224ec5392a5de0590cc8e1fa2c3a228288770561974f8fba7bd24e6113ad6b","lineNumber":103,"columnNumber":80_411,"constructorOffset":null,"workerSourceIdentityVerified":false,"noCacheBehaviorVerified":false},
{"role":"manager-message-worker","file":"manager","start":2_191_258,"end":2_191_425,"bytes":167,"sha256":"b865e92d72c0b4e3ead991eaa69ac564ceb1dc86dd902c1e7bcd88711b4914dd","lineNumber":108,"columnNumber":163_904,"constructorOffset":2_191_278,"workerSourceIdentityVerified":false,"noCacheBehaviorVerified":false}
] as const);
export const CURRENT_PCB_VIA_SAVED_BACKGROUND_ZIP_DISPATCHERS = freezeDeep([
{"role":"ui-zip-dispatcher","file":"ui","start":12_608_404,"end":12_653_725,"bytes":45_319,"sha256":"7c7ef421b151a6bd52ef1358292e83b3915da27e2fe984425515fe24a515db0c","allowsTaskScriptImports":true,"requiresOriginalTaskScriptAndCodecQualification":true,"noCacheBehaviorVerified":false},
{"role":"manager-zip-dispatcher","file":"manager","start":1_614_960,"end":1_659_600,"bytes":44_638,"sha256":"de8ffac02fe9f93f50013e9eb8ca6cf8ee2c84cb4d8c5224b02151ebe43265d7","allowsTaskScriptImports":true,"requiresOriginalTaskScriptAndCodecQualification":true,"noCacheBehaviorVerified":false}
] as const);

const PRELOAD = "https://modules.lceda.cn/pro-mgr/3.2.185.bf63a159/js/preload.js";
export const CURRENT_PCB_VIA_SAVED_BACKGROUND_ENTRYPOINTS = freezeDeep([
  { role: "ui-bootstrap", entry: "ui-worker.js", title: "ui-worker", sourceRole: "ui-worker",
    sourceUrl: "https://modules.lceda.cn/pro-ui/3.2.198.2800f583/js/worker.js" },
  { role: "library-bootstrap", entry: "mgr-lib-worker.js", titlePrefix: "lib_", sourceRole: "library-worker",
    sourceUrl: "https://modules.lceda.cn/pro-mgr/3.2.185.bf63a159/js/lib-worker.js" },
] as const);
/** Exact backend/editor.ini-derived source candidates. No URL or title selects
 * a native owner. The future controller must prove the actual complete roster,
 * context/creator ancestry, original hold and every admitted imported script. */
export const CURRENT_PCB_VIA_SAVED_BACKGROUND_BOOTSTRAPS = freezeDeep(CURRENT_PCB_VIA_SAVED_BACKGROUND_ENTRYPOINTS.map(entry => ({
  role: entry.role, sources: (["ONLINE", "HALF_OFFLINE", "OFFLINE"] as const).map(mode =>
    `self.PRO_EDITOR_VERSION = '3.2.209';self.PRO_COMPRESS_BUILDDATE = '10/21/2026';self.PRO_EDITOR_MODE = "CLIENT-${mode}-EASYEDA-PCB-SCH-PANEL-SIM";` +
    `importScripts('${PRELOAD}');importScripts('${entry.sourceUrl}');`),
})));
interface Pin { readonly role: string; readonly bytes: number; readonly sha256: string }
const pins: readonly Pin[] = freezeDeep([
  ...CURRENT_PCB_VIA_SAVED_BACKGROUND_SOURCE_FILES,
  ...CURRENT_PCB_VIA_SAVED_BACKGROUND_GENERATORS,
  ...CURRENT_PCB_VIA_SAVED_BACKGROUND_ZIP_DISPATCHERS,
  ...(["backend", "editorConfig", "version"] as const).map(role => {
    const pin = COMMON[role]; return { role, bytes: pin.bytes, sha256: pin.sha256 };
  }),
]);
export interface CurrentPcbViaSavedBackgroundSourceData {
  readonly profile: "private.current-pcb-via-saved-background-source-data.v1";
  readonly role: string; readonly bytes: number; readonly sourceSha256: string;
  readonly suppliedSourceBytesVerified: true; readonly nativeWorkerIdentityVerified: false;
  readonly originalContextOrHoldVerified: false; readonly completeNativeScriptRosterVerified: false;
  readonly cacheActorExclusionVerified: false; readonly resumeAuthorized: false;
  readonly nativeOwnershipIssued: false; readonly selectedSqlAuthorized: false; readonly writerAuthorized: false;
}
function need(value: boolean): asserts value { if (!value) { throw new Error("SAVED_BACKGROUND_SOURCE_CANDIDATE"); } }
/** Accept strings only. Matching package bytes never upgrades a constructor,
 * anonymous Blob, copied JSON, late pause or task script into cache exclusion. */
export function qualifyCurrentPcbViaSavedBackgroundSource(role: unknown, source: unknown): CurrentPcbViaSavedBackgroundSourceData {
  need(typeof role === "string" && typeof source === "string" && source.isWellFormed() && source.length <= 20_971_520);
  const pin = pins.find(value => value.role === role);
  const bootstrap = CURRENT_PCB_VIA_SAVED_BACKGROUND_BOOTSTRAPS.find(value => value.role === role);
  const bytes = Buffer.byteLength(source), sourceSha256 = sha256Text(source);
  need(pin === undefined ? bootstrap?.sources.some(value => value === source) === true : bytes === pin.bytes && sourceSha256 === pin.sha256);
  return freezeDeep({ profile: "private.current-pcb-via-saved-background-source-data.v1", role, bytes, sourceSha256,
    suppliedSourceBytesVerified: true, nativeWorkerIdentityVerified: false, originalContextOrHoldVerified: false,
    completeNativeScriptRosterVerified: false, cacheActorExclusionVerified: false, resumeAuthorized: false,
    nativeOwnershipIssued: false, selectedSqlAuthorized: false, writerAuthorized: false });
}
