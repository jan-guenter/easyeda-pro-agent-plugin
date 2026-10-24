/** Fixed 209 project-worker bootstrap/import source closure. These immutable
 * strings and issuer tokens prove supplied bytes only. Native target ancestry,
 * original execution contexts and installation leases remain owner duties. */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { canonicalJson } from "./core.ts";
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
export const CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES = Object.freeze(["bootstrap", "preload", "project"] as const);
export type CurrentPcb209StartupScriptRole = typeof CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES[number];
export const CURRENT_PCB_209_WORKER_PRELOAD_URL = "https://modules.lceda.cn/pro-mgr/3.2.185.bf63a159/js/preload.js";
export const CURRENT_PCB_209_PROJECT_WORKER_URL = "https://modules.lceda.cn/pro-mgr/3.2.185.bf63a159/js/project-worker.js";
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
    for (const span of [CURRENT_PCB_209_WORKER_PRELOAD_LOG.sourceSpan, CURRENT_PCB_209_WORKER_PRELOAD_LOG.rootCallSpan]) {
      const text = source.slice(span.start, span.end);
      need(Buffer.byteLength(text) === span.bytes && digest(text) === span.sha256);
    }
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
export function currentPcb209StartupScriptRole(url: string): CurrentPcb209StartupScriptRole | null {
  if (isCurrentPcb209BootstrapTargetUrl(url)) { return "bootstrap"; }
  if (url === CURRENT_PCB_209_WORKER_PRELOAD_URL) { return "preload"; }
  if (url === CURRENT_PCB_209_PROJECT_WORKER_URL) { return "project"; }
  return null;
}
/** Raw Debugger.getScriptSource result only, with no caller hash/profile override. */
export function qualifyCurrentPcb209StartupScriptSource(role: CurrentPcb209StartupScriptRole, input: unknown): void {
  need(CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES.some(value => value === role));
  plain(input); const keys = Reflect.ownKeys(input);
  need(keys.length === 1 && keys[0] === "scriptSource");
  const source = sourceProperty(input, "scriptSource");
  if (role === "bootstrap") { need(CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCES.includes(source)); }
  else { qualifiedSource(source, role); }
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
