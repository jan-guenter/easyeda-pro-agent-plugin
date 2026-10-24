/** Fixed backend-generated ratline bootstrap and complete imported sources.
 * Supplied bytes establish no native target ancestry or installation lease. */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { CURRENT_PCB_209_PROJECT_WORKER_URL, CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCES,
  CURRENT_PCB_209_WORKER_PRELOAD_URL, qualifyCurrentPcb209StartupScriptSource } from "./current-pcb-209-worker-bootstrap-source.ts";
import { inspectCurrentPcb209RatlineSource } from "./current-pcb-209-ratline-source.ts";

export const CURRENT_PCB_209_RATLINE_WORKER_URL = "https://modules.lceda.cn/pro-pcb/3.2.195.6b67774e/js/ratlineworker.js";
export const CURRENT_PCB_209_RATLINE_BOOTSTRAP_ROLES = Object.freeze([
  "bootstrap", "preload", "preload-copy-1", "preload-copy-2", "preload-copy-3", "preload-copy-4", "worker",
] as const);
export type CurrentPcb209RatlineBootstrapRole = typeof CURRENT_PCB_209_RATLINE_BOOTSTRAP_ROLES[number];
export const CURRENT_PCB_209_RATLINE_BOOTSTRAP_SOURCES = Object.freeze(CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCES.map(source =>
  source.replace(CURRENT_PCB_209_PROJECT_WORKER_URL, CURRENT_PCB_209_RATLINE_WORKER_URL)));
function need(value: boolean): asserts value { if (!value) { throw new Error("PCB209_RATLINE_BOOTSTRAP_SOURCE"); } }
/** Match the original constructor argument hash without normalizing URL bytes.
 * PCB query provenance still belongs to the original parent/frame owner. */
export function qualifyCurrentPcb209RatlineBootstrapUrl(role: "pcb" | "worker", url: string, requestedSha256: string): void {
  need((role === "pcb" || role === "worker") && typeof url === "string" && url.length <= 4096 &&
    /^https:\/\/client\/editor\?entry=pcb-ratline-worker\.js(?:&[^#\\\s]*)?$/u.test(url));
  const relative = url.slice("https://client/".length);
  need(role !== "worker" || relative === "editor?entry=pcb-ratline-worker.js");
  need(createHash("sha256").update(relative).digest("hex") === requestedSha256);
}
export function currentPcb209RatlineBootstrapRoleUrl(role: CurrentPcb209RatlineBootstrapRole, bootstrapUrl: string): string {
  switch (role) {
    case "bootstrap": { return bootstrapUrl; }
    case "preload": { return CURRENT_PCB_209_WORKER_PRELOAD_URL; }
    case "worker": { return CURRENT_PCB_209_RATLINE_WORKER_URL; }
    case "preload-copy-1": case "preload-copy-2": case "preload-copy-3": case "preload-copy-4": { return ""; }
    default: { throw new Error("PCB209_RATLINE_BOOTSTRAP_SOURCE"); }
  }
}
export function qualifyCurrentPcb209RatlineBootstrapSource(role: CurrentPcb209RatlineBootstrapRole, input: unknown): void {
  need(CURRENT_PCB_209_RATLINE_BOOTSTRAP_ROLES.some(value => value === role));
  need(input !== null && typeof input === "object" && !types.isProxy(input) &&
    (Object.getPrototypeOf(input) === Object.prototype || Object.getPrototypeOf(input) === null));
  const descriptor = Object.getOwnPropertyDescriptor(input, "scriptSource"), keys = Reflect.ownKeys(input);
  need(keys.length === 1 && keys[0] === "scriptSource" && descriptor !== undefined && Object.hasOwn(descriptor, "value"));
  const source: unknown = descriptor.value; need(typeof source === "string" && source.isWellFormed());
  if (role === "bootstrap") { need(CURRENT_PCB_209_RATLINE_BOOTSTRAP_SOURCES.includes(source)); }
  else if (role === "worker") { need(inspectCurrentPcb209RatlineSource("worker", source).sourceProfileMatches); }
  else { qualifyCurrentPcb209StartupScriptSource(role, { scriptSource: source }); }
}
