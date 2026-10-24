/** Fixed PCB-page source closure. The order follows blocking script tags and
 * direct outer-IIFE copy initializers in the pinned assets. Exact supplied
 * bytes and copy stacks establish no native frame or installation authority. */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCE_PROFILE } from "./current-pcb-209-worker-bootstrap-source.ts";
import { CURRENT_PCB_209_RATLINE_SOURCE_PROFILE } from "./current-pcb-209-ratline-source.ts";

export const CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_SOURCE_PROFILE = freezeDeep({
  backend: CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCE_PROFILE.backend,
  editorConfig: CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCE_PROFILE.editorConfig,
  version: CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCE_PROFILE.version,
  "define-top": { relativePath: "pro-mgr/3.2.185.bf63a159/js/define-top.js", bytes: 136,
    sha256: "1ab48d3bb4bcb65c6e2a54590af635fb3d7576672ee016e383ad2a39d1d88e08" },
  preload: CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCE_PROFILE.preload,
  api: { relativePath: "pro-api/0.3.59.1ca9efb5/api.js", bytes: 1_980_754,
    sha256: "e7c31b0de9dcbe4806e6b3cf8879b31c9e44425361bb8e67c3e8480ae359c8b1" },
  engine: { relativePath: "smt-gl-engine/3.2.56.b216263a/smt-gl-engine.js", bytes: 3_228_452,
    sha256: "0b43c5f607f45352290aa3d7a382867ea7acb949c9e818384cebf50beca59f49" },
  pcb: CURRENT_PCB_209_RATLINE_SOURCE_PROFILE.pcb,
} as const);
export const CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_ROLES = Object.freeze([
  "bootstrap",
  "define-top",
  "preload",
  "preload-copy-1",
  "preload-copy-2",
  "preload-copy-3",
  "preload-copy-4",
  "api",
  "api-copy-1",
  "api-copy-2",
  "api-copy-3",
  "api-copy-4",
  "engine",
  "engine-copy-1",
  "engine-copy-2",
  "engine-copy-3",
  "engine-copy-4",
  "engine-copy-5",
  "engine-copy-6",
  "engine-copy-7",
  "engine-copy-8",
  "engine-copy-9",
  "engine-copy-10",
  "engine-copy-11",
  "engine-copy-12",
  "engine-copy-13",
  "engine-copy-14",
  "engine-copy-15",
  "pcb"
] as const);
export type CurrentPcb209RatlinePcbBootstrapRole = typeof CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_ROLES[number];
export const CURRENT_PCB_209_RATLINE_PCB_FRAME_URL = "https://client/editor?entry=pcb";
export const CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_SOURCES = Object.freeze(
  (["ONLINE", "HALF_OFFLINE", "OFFLINE"] as const).map(mode =>
    `self.PRO_EDITOR_VERSION = '3.2.209';self.PRO_COMPRESS_BUILDDATE = '10/21/2026';self.PRO_EDITOR_MODE = "CLIENT-${mode}-EASYEDA-PCB-SCH-PANEL-SIM";`),
);
interface Span { readonly start: number; readonly end: number; readonly bytes: number; readonly sha256: string }
interface Location { readonly lineNumber: number; readonly columnNumber: number }
interface CopyGroup {
  readonly ownerRole: "preload" | "api" | "engine";
  readonly functionSpan: Span;
  readonly methodSpan: Span;
  readonly generatedBytes: number;
  readonly generatedSha256: string;
  readonly creator: Location & Readonly<{ functionName: "funcCopy" }>;
  readonly callers: readonly (Span & Location & Readonly<{ role: CurrentPcb209RatlinePcbBootstrapRole }>)[];
}
// Each caller is a direct variable initializer in the asset's outer IIFE.
// Creator columns were also observed with only these inert copying methods and
// Uncalled function declarations extracted at their original source positions.
const copies: readonly CopyGroup[] = freezeDeep([
  {
    "ownerRole": "preload",
    "functionSpan": {
      "start": 217_968,
      "end": 218_612,
      "bytes": 644,
      "sha256": "2d5e02e944e9e1892c6166201678a02f72db441f9a58e2f300ed43536748d370"
    },
    "methodSpan": {
      "start": 220_925,
      "end": 220_981,
      "bytes": 56,
      "sha256": "da37f021b5e2ebf10ee80e9ba885b2e93373f0f096c8ac6fc38d1f6f12f2ccc4"
    },
    "generatedBytes": 646,
    "generatedSha256": "447abb67bca110f9560c4a4c8d4c370018a59a012cfb1098e561f7e3686f178b",
    "creator": {
      "functionName": "funcCopy",
      "lineNumber": 7,
      "columnNumber": 42_723
    },
    "callers": [
      {
        "role": "preload-copy-1",
        "start": 340_896,
        "end": 340_911,
        "bytes": 15,
        "sha256": "67475c7d3c4548bd6fe3d1d7d0b575f8e1d63976acf27bf47848e2f6ceb90db7",
        "lineNumber": 8,
        "columnNumber": 102_962
      },
      {
        "role": "preload-copy-2",
        "start": 349_724,
        "end": 349_739,
        "bytes": 15,
        "sha256": "67475c7d3c4548bd6fe3d1d7d0b575f8e1d63976acf27bf47848e2f6ceb90db7",
        "lineNumber": 8,
        "columnNumber": 111_790
      },
      {
        "role": "preload-copy-3",
        "start": 349_743,
        "end": 349_758,
        "bytes": 15,
        "sha256": "67475c7d3c4548bd6fe3d1d7d0b575f8e1d63976acf27bf47848e2f6ceb90db7",
        "lineNumber": 8,
        "columnNumber": 111_809
      },
      {
        "role": "preload-copy-4",
        "start": 349_762,
        "end": 349_777,
        "bytes": 15,
        "sha256": "67475c7d3c4548bd6fe3d1d7d0b575f8e1d63976acf27bf47848e2f6ceb90db7",
        "lineNumber": 8,
        "columnNumber": 111_828
      }
    ]
  },
  {
    "ownerRole": "api",
    "functionSpan": {
      "start": 689_082,
      "end": 689_726,
      "bytes": 644,
      "sha256": "dc3b19cf25ec82e61a6ad3f50c2f6a2afe963081c88e97c50ada1492380809b7"
    },
    "methodSpan": {
      "start": 692_039,
      "end": 692_095,
      "bytes": 56,
      "sha256": "da37f021b5e2ebf10ee80e9ba885b2e93373f0f096c8ac6fc38d1f6f12f2ccc4"
    },
    "generatedBytes": 646,
    "generatedSha256": "0ba5064ce3435995c8c207799a5bc598012ab100991fcf47b3164c0105ccf5e9",
    "creator": {
      "functionName": "funcCopy",
      "lineNumber": 33,
      "columnNumber": 42_885
    },
    "callers": [
      {
        "role": "api-copy-1",
        "start": 812_724,
        "end": 812_739,
        "bytes": 15,
        "sha256": "48c378ac2f875c6fd2c3d04dcdc497b5644b584968ef7d6ed0dade85de4e6136",
        "lineNumber": 34,
        "columnNumber": 103_653
      },
      {
        "role": "api-copy-2",
        "start": 821_575,
        "end": 821_590,
        "bytes": 15,
        "sha256": "48c378ac2f875c6fd2c3d04dcdc497b5644b584968ef7d6ed0dade85de4e6136",
        "lineNumber": 34,
        "columnNumber": 112_504
      },
      {
        "role": "api-copy-3",
        "start": 821_594,
        "end": 821_609,
        "bytes": 15,
        "sha256": "48c378ac2f875c6fd2c3d04dcdc497b5644b584968ef7d6ed0dade85de4e6136",
        "lineNumber": 34,
        "columnNumber": 112_523
      },
      {
        "role": "api-copy-4",
        "start": 821_613,
        "end": 821_628,
        "bytes": 15,
        "sha256": "48c378ac2f875c6fd2c3d04dcdc497b5644b584968ef7d6ed0dade85de4e6136",
        "lineNumber": 34,
        "columnNumber": 112_542
      }
    ]
  },
  {
    "ownerRole": "engine",
    "functionSpan": {
      "start": 858_537,
      "end": 859_181,
      "bytes": 644,
      "sha256": "ce9f84878657fdf9804a149729360282933d3dde95aa1ee1af2904bb790e709b"
    },
    "methodSpan": {
      "start": 861_494,
      "end": 861_550,
      "bytes": 56,
      "sha256": "8704b077aa2344da8b91e45f6f878c70e2da1043978e976d429d19e4901b1858"
    },
    "generatedBytes": 646,
    "generatedSha256": "9dda4d6393d7e59ab3f2f6ccf8cfb32cd772a8cf0d1e91faca62acd66420f3f0",
    "creator": {
      "functionName": "funcCopy",
      "lineNumber": 29,
      "columnNumber": 438_827
    },
    "callers": [
      {
        "role": "engine-copy-1",
        "start": 985_125,
        "end": 985_140,
        "bytes": 15,
        "sha256": "0b05b856e941ea10c721192bd8467e1120dcef40228ff8d4c0e60ce45f651d2b",
        "lineNumber": 30,
        "columnNumber": 106_924
      },
      {
        "role": "engine-copy-2",
        "start": 993_976,
        "end": 993_991,
        "bytes": 15,
        "sha256": "0b05b856e941ea10c721192bd8467e1120dcef40228ff8d4c0e60ce45f651d2b",
        "lineNumber": 30,
        "columnNumber": 115_775
      },
      {
        "role": "engine-copy-3",
        "start": 993_996,
        "end": 994_011,
        "bytes": 15,
        "sha256": "0b05b856e941ea10c721192bd8467e1120dcef40228ff8d4c0e60ce45f651d2b",
        "lineNumber": 30,
        "columnNumber": 115_795
      },
      {
        "role": "engine-copy-4",
        "start": 994_016,
        "end": 994_031,
        "bytes": 15,
        "sha256": "0b05b856e941ea10c721192bd8467e1120dcef40228ff8d4c0e60ce45f651d2b",
        "lineNumber": 30,
        "columnNumber": 115_815
      }
    ]
  },
  {
    "ownerRole": "engine",
    "functionSpan": {
      "start": 1_514_747,
      "end": 1_515_391,
      "bytes": 644,
      "sha256": "78b07378be5115e6d2c6258e69298fe635389d836cc97cc2cfffa6272cae4a48"
    },
    "methodSpan": {
      "start": 1_517_704,
      "end": 1_517_760,
      "bytes": 56,
      "sha256": "8704b077aa2344da8b91e45f6f878c70e2da1043978e976d429d19e4901b1858"
    },
    "generatedBytes": 646,
    "generatedSha256": "994be072cca974264ac1e5975fccf1d0e4d7b71b360508d4cf828eb634e985ac",
    "creator": {
      "functionName": "funcCopy",
      "lineNumber": 775,
      "columnNumber": 42_889
    },
    "callers": [
      {
        "role": "engine-copy-5",
        "start": 1_638_482,
        "end": 1_638_497,
        "bytes": 15,
        "sha256": "187eca53dc877683598d6c9bbea5fe5b95f69c30462fa561dd1f125368d25426",
        "lineNumber": 776,
        "columnNumber": 103_732
      },
      {
        "role": "engine-copy-6",
        "start": 1_647_344,
        "end": 1_647_359,
        "bytes": 15,
        "sha256": "187eca53dc877683598d6c9bbea5fe5b95f69c30462fa561dd1f125368d25426",
        "lineNumber": 776,
        "columnNumber": 112_594
      },
      {
        "role": "engine-copy-7",
        "start": 1_647_364,
        "end": 1_647_379,
        "bytes": 15,
        "sha256": "187eca53dc877683598d6c9bbea5fe5b95f69c30462fa561dd1f125368d25426",
        "lineNumber": 776,
        "columnNumber": 112_614
      },
      {
        "role": "engine-copy-8",
        "start": 1_647_384,
        "end": 1_647_399,
        "bytes": 15,
        "sha256": "187eca53dc877683598d6c9bbea5fe5b95f69c30462fa561dd1f125368d25426",
        "lineNumber": 776,
        "columnNumber": 112_634
      }
    ]
  },
  {
    "ownerRole": "engine",
    "functionSpan": {
      "start": 1_101_892,
      "end": 1_102_525,
      "bytes": 633,
      "sha256": "7615583508454a4e1ba4821b1ea60175c2561f79b1782bd60043e5b45b773ebe"
    },
    "methodSpan": {
      "start": 1_104_888,
      "end": 1_104_946,
      "bytes": 58,
      "sha256": "fff697bc0d76308284097b8af67e8af0efd01934e34d7d41d55652dd611f2323"
    },
    "generatedBytes": 635,
    "generatedSha256": "494a82d9cb230329578f818a775ddf93b27624a22907af6e4b831d9e731e84c4",
    "creator": {
      "functionName": "funcCopy",
      "lineNumber": 30,
      "columnNumber": 226_715
    },
    "callers": [
      {
        "role": "engine-copy-9",
        "start": 2_186_342,
        "end": 2_186_357,
        "bytes": 15,
        "sha256": "36c42fa65c0d21b9ca0a5b8d4ed9aa81ccc6186b4ec9e5b2544c329fdad913b4",
        "lineNumber": 779,
        "columnNumber": 28_638
      },
      {
        "role": "engine-copy-10",
        "start": 2_187_147,
        "end": 2_187_162,
        "bytes": 15,
        "sha256": "36c42fa65c0d21b9ca0a5b8d4ed9aa81ccc6186b4ec9e5b2544c329fdad913b4",
        "lineNumber": 779,
        "columnNumber": 29_443
      },
      {
        "role": "engine-copy-11",
        "start": 2_187_167,
        "end": 2_187_182,
        "bytes": 15,
        "sha256": "36c42fa65c0d21b9ca0a5b8d4ed9aa81ccc6186b4ec9e5b2544c329fdad913b4",
        "lineNumber": 779,
        "columnNumber": 29_463
      },
      {
        "role": "engine-copy-12",
        "start": 2_187_187,
        "end": 2_187_202,
        "bytes": 15,
        "sha256": "36c42fa65c0d21b9ca0a5b8d4ed9aa81ccc6186b4ec9e5b2544c329fdad913b4",
        "lineNumber": 779,
        "columnNumber": 29_483
      },
      {
        "role": "engine-copy-13",
        "start": 2_187_207,
        "end": 2_187_222,
        "bytes": 15,
        "sha256": "36c42fa65c0d21b9ca0a5b8d4ed9aa81ccc6186b4ec9e5b2544c329fdad913b4",
        "lineNumber": 779,
        "columnNumber": 29_503
      },
      {
        "role": "engine-copy-14",
        "start": 2_389_290,
        "end": 2_389_305,
        "bytes": 15,
        "sha256": "36c42fa65c0d21b9ca0a5b8d4ed9aa81ccc6186b4ec9e5b2544c329fdad913b4",
        "lineNumber": 829,
        "columnNumber": 2043
      },
      {
        "role": "engine-copy-15",
        "start": 2_389_310,
        "end": 2_389_325,
        "bytes": 15,
        "sha256": "36c42fa65c0d21b9ca0a5b8d4ed9aa81ccc6186b4ec9e5b2544c329fdad913b4",
        "lineNumber": 829,
        "columnNumber": 2063
      }
    ]
  }
]);
export interface CurrentPcb209RatlinePcbBootstrapCopy {
  readonly ownerRole: "preload" | "api" | "engine";
  readonly creator: Location & Readonly<{ functionName: "funcCopy" }>;
  readonly caller: Span & Location;
  readonly generatedBytes: number;
  readonly generatedSha256: string;
}
function need(value: boolean): asserts value { if (!value) { throw new Error("PCB209_RATLINE_PCB_BOOTSTRAP_SOURCE"); } }
function digest(value: string): string { return createHash("sha256").update(value).digest("hex"); }
export function currentPcb209RatlinePcbBootstrapCopy(role: CurrentPcb209RatlinePcbBootstrapRole): CurrentPcb209RatlinePcbBootstrapCopy | null {
  need(CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_ROLES.some(value => value === role));
  for (const group of copies) {
    const caller = group.callers.find(value => value.role === role);
    if (caller !== undefined) { return Object.freeze({ ownerRole: group.ownerRole, creator: group.creator, caller,
      generatedBytes: group.generatedBytes, generatedSha256: group.generatedSha256 }); }
  }
  return null;
}
export function currentPcb209RatlinePcbBootstrapRoleUrl(role: CurrentPcb209RatlinePcbBootstrapRole, frameUrl: string): string {
  if (currentPcb209RatlinePcbBootstrapCopy(role) !== null) { return ""; }
  if (role === "bootstrap") { need(frameUrl === CURRENT_PCB_209_RATLINE_PCB_FRAME_URL); return frameUrl; }
  if (role === "define-top" || role === "preload" || role === "api" || role === "engine" || role === "pcb") {
    return `https://modules.lceda.cn/${CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_SOURCE_PROFILE[role].relativePath}`;
  }
  throw new Error("PCB209_RATLINE_PCB_BOOTSTRAP_SOURCE");
}
function source(input: unknown): string {
  need(input !== null && typeof input === "object" && !types.isProxy(input) &&
    (Object.getPrototypeOf(input) === Object.prototype || Object.getPrototypeOf(input) === null));
  const descriptor = Object.getOwnPropertyDescriptor(input, "scriptSource"), keys = Reflect.ownKeys(input);
  need(keys.length === 1 && keys[0] === "scriptSource" && descriptor !== undefined && Object.hasOwn(descriptor, "value") && descriptor.enumerable === true);
  const text: unknown = descriptor.value; need(typeof text === "string"); return text;
}
function match(text: string, pin: Readonly<{ bytes: number; sha256: string }>): void {
  need(text.length <= pin.bytes && text.isWellFormed() && Buffer.byteLength(text) === pin.bytes && digest(text) === pin.sha256);
}
/** Complete getScriptSource reply only; no caller-selected pin or source path. */
export function qualifyCurrentPcb209RatlinePcbBootstrapSource(role: CurrentPcb209RatlinePcbBootstrapRole, input: unknown): void {
  const copy = currentPcb209RatlinePcbBootstrapCopy(role), text = source(input);
  if (role === "bootstrap") { need(CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_SOURCES.includes(text)); return; }
  if (copy !== null) { match(text, { bytes: copy.generatedBytes, sha256: copy.generatedSha256 }); return; }
  if (role === "define-top" || role === "preload" || role === "api" || role === "engine" || role === "pcb") {
    match(text, CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_SOURCE_PROFILE[role]);
    for (const group of copies.filter(value => value.ownerRole === role)) {
      for (const span of [group.functionSpan, group.methodSpan, ...group.callers]) { match(text.slice(span.start, span.end), span); }
      match(`(${text.slice(group.functionSpan.start, group.functionSpan.end)})`, { bytes: group.generatedBytes, sha256: group.generatedSha256 });
    }
    return;
  }
  throw new Error("PCB209_RATLINE_PCB_BOOTSTRAP_SOURCE");
}
const token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location = z.looseObject({ scriptId: token, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const stackFrame = z.looseObject({ functionName: z.string().max(256), scriptId: token, url: z.string().max(8192),
  lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const pauseFrame = z.looseObject({ functionName: z.string().max(256), location });
/** The owner supplies the already qualified original parent source script. */
export function qualifyCurrentPcb209RatlinePcbBootstrapCopyCreator(role: CurrentPcb209RatlinePcbBootstrapRole, parentScriptId: string, input: unknown): void {
  const copy = currentPcb209RatlinePcbBootstrapCopy(role); need(copy !== null); token.parse(parentScriptId);
  const event = z.looseObject({ url: z.literal(""), hasSourceURL: z.literal(false).optional(), isLiveEdit: z.literal(false).optional(),
    stackTrace: z.object({ callFrames: z.tuple([stackFrame]) }).strict() }).parse(captureCurrentPcbStringClockReply(input).value);
  const frame = event.stackTrace.callFrames[0];
  need(frame.scriptId === parentScriptId && frame.url === currentPcb209RatlinePcbBootstrapRoleUrl(copy.ownerRole, "") &&
    frame.functionName === copy.creator.functionName && frame.lineNumber === copy.creator.lineNumber && frame.columnNumber === copy.creator.columnNumber);
}
export function qualifyCurrentPcb209RatlinePcbBootstrapCopyPause(role: CurrentPcb209RatlinePcbBootstrapRole,
  copyScriptId: string, parentScriptId: string, input: unknown): void {
  const copy = currentPcb209RatlinePcbBootstrapCopy(role); need(copy !== null); token.parse(copyScriptId); token.parse(parentScriptId);
  const event = z.looseObject({ reason: z.literal("instrumentation"), data: z.looseObject({ scriptId: token, url: z.literal("") }),
    hitBreakpoints: z.array(token).length(0), callFrames: z.array(pauseFrame).min(3).max(16) }).parse(captureCurrentPcbStringClockReply(input).value);
  const [evaluated, creator, caller] = event.callFrames;
  need(event.data.scriptId === copyScriptId && evaluated?.functionName === "" && evaluated.location.scriptId === copyScriptId &&
    evaluated.location.lineNumber === 0 && evaluated.location.columnNumber === 0 && creator?.functionName === copy.creator.functionName &&
    creator.location.scriptId === parentScriptId && creator.location.lineNumber === copy.creator.lineNumber && creator.location.columnNumber === copy.creator.columnNumber &&
    caller?.functionName === "" && caller.location.scriptId === parentScriptId && caller.location.lineNumber === copy.caller.lineNumber && caller.location.columnNumber === copy.caller.columnNumber);
}
