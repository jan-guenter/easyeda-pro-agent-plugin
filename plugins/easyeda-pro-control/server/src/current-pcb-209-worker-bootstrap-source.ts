/** Fixed 209 project-worker bootstrap/import source closure. These immutable
 * strings and issuer tokens prove supplied bytes only. Native target ancestry,
 * original execution contexts and installation leases remain owner duties. */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCE_PROFILE = freezeDeep({
  backend: { relativePath: "../app.js", bytes: 2_657_192,
    sha256: "52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c" },
  editorConfig: { relativePath: "../editor.ini", bytes: 8031,
    sha256: "ced74cf98aedf6b04d0f23871b945f4155978d7e35edbc1704b8cdaf566623f9" },
  version: { relativePath: "../version.txt", bytes: 36,
    sha256: "dcb366bd92736cca5736ab702fbe9381238a418e502e9c462a934a02e2e4090a" },
  manager: { relativePath: "pro-mgr/3.2.185.bf63a159/js/pro-mgr.js", bytes: 2_196_424,
    sha256: "b3260ec9d98d6cad5f65a6234aa839b32f6bf5954cb03de0bd6ce003577b388d" },
  preload: { relativePath: "pro-mgr/3.2.185.bf63a159/js/preload.js", bytes: 875_163,
    sha256: "4f802b0d345b7c54817627fc854e61541f70585e8fcb0ecb98789365a88f9935" },
  project: { relativePath: "pro-mgr/3.2.185.bf63a159/js/project-worker.js", bytes: 2_181_308,
    sha256: "0e7a474385029ac4f69dac08abdfd8beec7346aea8c2a4f71d5afb78bb454046" },
} as const);
export type CurrentPcb209WorkerBootstrapSourceKind = keyof typeof CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCE_PROFILE;
export type CurrentPcb209WorkerBootstrapSources = Readonly<Record<CurrentPcb209WorkerBootstrapSourceKind, string>>;
const sourceKinds = ["backend", "editorConfig", "version", "manager", "preload", "project"] as const;
export const CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES = Object.freeze([
  "bootstrap", "preload", "preload-copy-1", "preload-copy-2", "preload-copy-3", "preload-copy-4", "project",
] as const);
export type CurrentPcb209StartupScriptRole = typeof CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES[number];
export const CURRENT_PCB_209_WORKER_PRELOAD_URL = "https://modules.lceda.cn/pro-mgr/3.2.185.bf63a159/js/preload.js";
export const CURRENT_PCB_209_PROJECT_WORKER_URL = "https://modules.lceda.cn/pro-mgr/3.2.185.bf63a159/js/project-worker.js";
/** Four original top-level initializers copy the same Is sorting function by
 * indirect eval. Only the parenthesized function is evaluated, never called.
 * Parsing these anonymous scripts precedes the preload's later Zf log. Each
 * script requires its original preload creator and distinct ordered caller. */
export const CURRENT_PCB_209_PRELOAD_COPY_SOURCE = freezeDeep({
  functionSpan: { start: 217_968, end: 218_612, bytes: 644,
    sha256: "2d5e02e944e9e1892c6166201678a02f72db441f9a58e2f300ed43536748d370" },
  generatedBytes: 646, generatedSha256: "447abb67bca110f9560c4a4c8d4c370018a59a012cfb1098e561f7e3686f178b",
  methodSpan: { start: 220_925, end: 220_981, bytes: 56,
    sha256: "da37f021b5e2ebf10ee80e9ba885b2e93373f0f096c8ac6fc38d1f6f12f2ccc4" },
  creator: { functionName: "funcCopy", lineNumber: 7, columnNumber: 42_723 },
  callBytes: 15, callSha256: "67475c7d3c4548bd6fe3d1d7d0b575f8e1d63976acf27bf47848e2f6ceb90db7",
} as const);
export const CURRENT_PCB_209_PRELOAD_COPY_CALLERS = freezeDeep({
  "preload-copy-1": { start: 340_896, end: 340_911, lineNumber: 8, columnNumber: 102_962 },
  "preload-copy-2": { start: 349_724, end: 349_739, lineNumber: 8, columnNumber: 111_790 },
  "preload-copy-3": { start: 349_743, end: 349_758, lineNumber: 8, columnNumber: 111_809 },
  "preload-copy-4": { start: 349_762, end: 349_777, lineNumber: 8, columnNumber: 111_828 },
} as const);
export function currentPcb209PreloadCopyCaller(role: CurrentPcb209StartupScriptRole):
  typeof CURRENT_PCB_209_PRELOAD_COPY_CALLERS[keyof typeof CURRENT_PCB_209_PRELOAD_COPY_CALLERS] | null {
  switch (role) {
    case "preload-copy-1": case "preload-copy-2": case "preload-copy-3": case "preload-copy-4": {
      return CURRENT_PCB_209_PRELOAD_COPY_CALLERS[role];
    }
    case "bootstrap": case "preload": case "project": { return null; }
    default: { throw new Error("PCB209_WORKER_BOOTSTRAP_SOURCE"); }
  }
}
const copyToken = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const copyLocation = z.looseObject({ scriptId: copyToken, lineNumber: z.number().int().nonnegative(),
  columnNumber: z.number().int().nonnegative() });
const copyStackFrame = z.looseObject({ functionName: z.string().max(256), scriptId: copyToken,
  url: z.string().max(8192), lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const copyPauseFrame = z.looseObject({ functionName: z.string().max(256), location: copyLocation });
/** Shape/origin checks only. The transport supplies its already source-qualified
 * original preload script and context; these helpers issue no ownership token. */
export function qualifyCurrentPcb209PreloadCopyCreator(preloadScriptId: string, input: unknown): void {
  const script = z.looseObject({ url: z.literal(""), hasSourceURL: z.literal(false).optional(), isLiveEdit: z.literal(false).optional(),
    stackTrace: z.object({ callFrames: z.tuple([copyStackFrame]) }).strict() }).parse(captureCurrentPcbStringClockReply(input).value);
  const creator = script.stackTrace.callFrames[0], expected = CURRENT_PCB_209_PRELOAD_COPY_SOURCE.creator;
  need(creator.scriptId === preloadScriptId && creator.url === CURRENT_PCB_209_WORKER_PRELOAD_URL &&
    creator.functionName === expected.functionName && creator.lineNumber === expected.lineNumber && creator.columnNumber === expected.columnNumber);
}
export function qualifyCurrentPcb209PreloadCopyPause(role: CurrentPcb209StartupScriptRole, copyScriptId: string,
  preloadScriptId: string, input: unknown): void {
  const caller = currentPcb209PreloadCopyCaller(role); need(caller !== null);
  const pause = z.looseObject({ reason: z.literal("instrumentation"), data: z.looseObject({ scriptId: copyToken, url: z.literal("") }),
    hitBreakpoints: z.array(copyToken).length(0), callFrames: z.array(copyPauseFrame).min(3).max(16) })
    .parse(captureCurrentPcbStringClockReply(input).value);
  const [evaluated, creator, originalCaller] = pause.callFrames, expected = CURRENT_PCB_209_PRELOAD_COPY_SOURCE.creator;
  need(pause.data.scriptId === copyScriptId && evaluated?.functionName === "" && evaluated.location.scriptId === copyScriptId &&
    evaluated.location.lineNumber === 0 && evaluated.location.columnNumber === 0 &&
    creator?.functionName === expected.functionName && creator.location.scriptId === preloadScriptId &&
    creator.location.lineNumber === expected.lineNumber && creator.location.columnNumber === expected.columnNumber &&
    originalCaller?.functionName === "" && originalCaller.location.scriptId === preloadScriptId &&
    originalCaller.location.lineNumber === caller.lineNumber && originalCaller.location.columnNumber === caller.columnNumber);
}
// The source call expression begins at column43500. A real V8 console event
// Reports the member call at column43508; these are distinct coordinate uses.
export const CURRENT_PCB_209_WORKER_PRELOAD_LOG = freezeDeep({
  message: "common init----------------", functionName: "Zf", lineNumber: 0, columnNumber: 43_508,
  sourceSpan: { start: 43_500, end: 43_542, bytes: 42,
    sha256: "baff5418dee78d2a4f2eeb28dd46b971cc2ef2f306ffbb341ce328d736f1232c" },
  rootCallSpan: { start: 838_851, end: 838_856, bytes: 5,
    sha256: "0bbb695d77a1b964d26c437c49232d6f564b7d31780ed520b855515012b6c0f9" },
} as const);

// Backend sC renders these exact statements from its fixed version.txt and root
// Editor.ini. The d6 setter admits only these three mode values; the fixed
// EasyEDA package uses EASYEDA. No alternative brand, version or import order.
export const CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCES: readonly string[] = Object.freeze(
  (["ONLINE", "HALF_OFFLINE", "OFFLINE"] as const).map(mode =>
    `self.PRO_EDITOR_VERSION = '3.2.209';self.PRO_COMPRESS_BUILDDATE = '10/21/2026';self.PRO_EDITOR_MODE = "CLIENT-${mode}-EASYEDA-PCB-SCH-PANEL-SIM";` +
    `importScripts('${CURRENT_PCB_209_WORKER_PRELOAD_URL}');importScripts('${CURRENT_PCB_209_PROJECT_WORKER_URL}');`),
);
const limits = Object.freeze({ suppliedSourceBytesOnly: true, nativeTargetIdentityVerified: false,
  originalExecutionContextsOwned: false, continuousInstallationLeaseVerified: false,
  compatibilityAdmitted: false, executionAuthorized: false, saveAuthorized: false } as const);
export interface CurrentPcb209WorkerBootstrapSourceQualification extends Readonly<typeof limits> {
  readonly profile: "private.pcb209-worker-bootstrap-source.v1";
  readonly application: "3.2.209.8a704eab";
  readonly sourceSha256: Readonly<Record<CurrentPcb209WorkerBootstrapSourceKind, string>>;
  readonly sourceClosureSha256: string;
}
const issued = new WeakSet<CurrentPcb209WorkerBootstrapSourceQualification>();
function need(value: boolean): asserts value { if (!value) { throw new Error("PCB209_WORKER_BOOTSTRAP_SOURCE"); } }
function digest(value: string): string { return createHash("sha256").update(value).digest("hex"); }
function plain(value: unknown): asserts value is Record<string, unknown> {
  need(value !== null && typeof value === "object" && !types.isProxy(value) && !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null));
}
function sourceProperty(value: Record<string, unknown>, key: string): string {
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  need(descriptor !== undefined && Object.hasOwn(descriptor, "value"));
  const source: unknown = descriptor.value;
  need(typeof source === "string" && source.isWellFormed()); return source;
}
function qualifiedSource(source: string, kind: CurrentPcb209WorkerBootstrapSourceKind): void {
  const pin = CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCE_PROFILE[kind];
  need(source.length <= pin.bytes && Buffer.byteLength(source) === pin.bytes && digest(source) === pin.sha256);
  if (kind === "preload") {
    const copy = CURRENT_PCB_209_PRELOAD_COPY_SOURCE;
    for (const span of [CURRENT_PCB_209_WORKER_PRELOAD_LOG.sourceSpan, CURRENT_PCB_209_WORKER_PRELOAD_LOG.rootCallSpan,
      copy.functionSpan, copy.methodSpan]) {
      const text = source.slice(span.start, span.end);
      need(Buffer.byteLength(text) === span.bytes && digest(text) === span.sha256);
    }
    for (const caller of Object.values(CURRENT_PCB_209_PRELOAD_COPY_CALLERS)) {
      const text = source.slice(caller.start, caller.end);
      need(Buffer.byteLength(text) === copy.callBytes && digest(text) === copy.callSha256);
    }
    const generated = `(${source.slice(copy.functionSpan.start, copy.functionSpan.end)})`;
    need(Buffer.byteLength(generated) === copy.generatedBytes && digest(generated) === copy.generatedSha256);
  }
}

/** The actual Worker URL is the generated client bootstrap, not either imported
 * asset URL. Only source-reviewed log settings/fallback and debugOpen 0/1 are
 * accepted. Query reordering, escapes, suffixes and URL normalization refuse. */
export function isCurrentPcb209BootstrapTargetUrl(url: string): boolean {
  if (typeof url !== "string" || url.length > 128) { return false; }
  const match = /^https:\/\/client\/editor\?entry=mgr-project-worker\.js&cll=(?:trace|debug|info|warn|error|off|)&debugOpen=[01]$/u.exec(url);
  return match !== null && match[0] === url;
}
export function currentPcb209StartupScriptRole(url: string): "bootstrap" | "preload" | "project" | null {
  if (isCurrentPcb209BootstrapTargetUrl(url)) { return "bootstrap"; }
  if (url === CURRENT_PCB_209_WORKER_PRELOAD_URL) { return "preload"; }
  if (url === CURRENT_PCB_209_PROJECT_WORKER_URL) { return "project"; }
  return null;
}
/** Raw Debugger.getScriptSource result only, with no caller hash/profile override. */
export function qualifyCurrentPcb209StartupScriptSource(role: CurrentPcb209StartupScriptRole, input: unknown): string {
  need(CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES.some(value => value === role));
  plain(input); const keys = Reflect.ownKeys(input);
  need(keys.length === 1 && keys[0] === "scriptSource");
  const source = sourceProperty(input, "scriptSource");
  if (role === "bootstrap") { need(CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCES.includes(source)); }
  else if (role === "preload" || role === "project") { qualifiedSource(source, role); }
  else {
    const copy = CURRENT_PCB_209_PRELOAD_COPY_SOURCE;
    need(Buffer.byteLength(source) === copy.generatedBytes && digest(source) === copy.generatedSha256);
  }
  return source;
}
/** Fixed descriptor-captured installation closure. This module opens no files. */
export function qualifyCurrentPcb209WorkerBootstrapSources(input: CurrentPcb209WorkerBootstrapSources): CurrentPcb209WorkerBootstrapSourceQualification {
  plain(input); const keys = Reflect.ownKeys(input);
  need(keys.length === sourceKinds.length && keys.every(key => sourceKinds.some(kind => kind === key)));
  const sourceSha256 = { backend: "", editorConfig: "", version: "", manager: "", preload: "", project: "" };
  for (const kind of sourceKinds) {
    qualifiedSource(sourceProperty(input, kind), kind);
    sourceSha256[kind] = CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCE_PROFILE[kind].sha256;
  }
  const qualification = freezeDeep({ profile: "private.pcb209-worker-bootstrap-source.v1" as const,
    application: "3.2.209.8a704eab" as const, sourceSha256,
    sourceClosureSha256: digest(canonicalJson(sourceSha256)), ...limits });
  issued.add(qualification); return qualification;
}
/** Issuer identity only. Copied JSON grants no ownership or qualification. */
export function requireCurrentPcb209WorkerBootstrapSourceQualification(value: CurrentPcb209WorkerBootstrapSourceQualification): void {
  need(issued.has(value));
}
