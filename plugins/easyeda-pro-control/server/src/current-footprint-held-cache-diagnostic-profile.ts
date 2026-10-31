/** Fixed read-only qualification envelope. This purpose owns no copy, saved
 * generation, project-opening, worker or replay authority. */
import { z } from "zod";
import { CURRENT_FOOTPRINT_SAVED_CACHE_HELD_LIMITS as HELD } from "./current-footprint-saved-cache-held-profile.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_HELD_CACHE_PAGE_READINESS = Object.freeze({ targetSamples: 16, delayMilliseconds: 250 });
const startupStages = ["checkpoint", "launch", "native-reproof", "browser-version", "browser-targets", "frames", "ui-source", "parent", "ancillary", "cache-bind", "ready"] as const;
export type CurrentFootprintHeldCacheStartupStage = typeof startupStages[number];
/** Refuse coerced, fractional and negative-zero diagnostic counters. */
function counter(maximum: number, minimum = 0): z.ZodNumber {
  return z.number().int().min(minimum).max(maximum).refine(value => !Object.is(value, -0));
}
const startupSampleSchema = z.object({ attempt: counter(16, 1), targetCount: counter(256), pageCount: counter(256),
  classification: z.enum(["empty", "about-blank", "startup-loading", "ready", "ready-with-loading", "multiple-pages", "attached-page", "unexpected-page"]),
  inventorySha256: z.string().regex(/^[a-f\d]{64}(?![\s\S])/u),
}).strict().readonly();
/** Only empty, about:blank or the admitted installation's loading page permits another target query. */
function transient(classification: string): boolean { return classification === "empty" || classification === "about-blank" || classification === "startup-loading"; }
/** Match a recorded classification to its observed page count, preserving
 * non-page targets without treating them as additional editor pages. */
function pageCountMatches(sample: z.infer<typeof startupSampleSchema>): boolean {
  if (sample.classification === "empty") { return sample.pageCount === 0; }
  if (sample.classification === "multiple-pages") { return sample.pageCount >= 2; }
  if (sample.classification === "ready-with-loading") { return sample.pageCount === 2; }
  if (sample.classification === "attached-page") { return sample.pageCount >= 1; }
  return sample.pageCount === 1;
}
/** Strict inert diagnostic evidence, including initial or interrupted reads.
 * One pending target attempt may lack a sample. Ready historical snapshots
 * remain valid when an outer abort subsequently fails the launch controller. */
/** Describe the original startup's bounded observations, including one pending
 * target reply and a healthy-ready snapshot retained by a later launch failure.
 * Stage, accepted sample order and failure kind must agree; these diagnostics
 * always deny native/cache/execution authority.
 */
export const currentFootprintHeldCacheStartupObservationSchema = z.object({
  schema: z.literal("private.current-footprint-held-cache-startup-observation.v1"), stage: z.enum(startupStages),
  failed: z.boolean(), failureKind: z.enum(["inventory", "selection", "target-limit", "version", "transport-or-owner"]).nullable(),
  versionAttempts: counter(1), versionSha256: z.string().regex(/^[a-f\d]{64}(?![\s\S])/u).nullable(),
  targetAttempts: counter(CURRENT_FOOTPRINT_HELD_CACHE_PAGE_READINESS.targetSamples),
  maximumTargetSamples: z.literal(CURRENT_FOOTPRINT_HELD_CACHE_PAGE_READINESS.targetSamples),
  delayMilliseconds: z.literal(CURRENT_FOOTPRINT_HELD_CACHE_PAGE_READINESS.delayMilliseconds),
  // Check cardinality before strict per-row validation can accumulate errors.
  samples: z.array(z.unknown()).max(CURRENT_FOOTPRINT_HELD_CACHE_PAGE_READINESS.targetSamples).pipe(z.array(startupSampleSchema)).readonly(),
  uiSourceQualified: z.literal(false), cacheQualificationGranted: z.literal(false), executionAuthorized: z.literal(false),
}).strict().superRefine((observation, context) => {
  const last = observation.samples.at(-1);
  let valid = observation.failed === (observation.failureKind !== null) &&
    observation.samples.length <= observation.targetAttempts && observation.targetAttempts <= observation.samples.length + 1 &&
    (observation.versionSha256 === null ? observation.targetAttempts === 0 : observation.versionAttempts === 1);
  for (const [index, sample] of observation.samples.entries()) {
    valid &&= sample.attempt === index + 1 && sample.pageCount <= sample.targetCount &&
      pageCountMatches(sample) &&
      (index === observation.samples.length - 1 || transient(sample.classification));
  }
  if (last !== undefined && !transient(last.classification)) { valid &&= observation.targetAttempts === observation.samples.length; }
  if (["checkpoint", "launch", "native-reproof"].includes(observation.stage)) {
    valid &&= observation.versionAttempts === 0 && observation.versionSha256 === null && observation.targetAttempts === 0;
  } else if (observation.stage === "browser-version") { valid &&= observation.versionAttempts === 1 && observation.targetAttempts === 0; }
  else {
    valid &&= observation.versionAttempts === 1 && observation.versionSha256 !== null;
    if (observation.stage !== "browser-targets") { valid &&= last?.classification === "ready" || last?.classification === "ready-with-loading"; }
  }
  if (observation.failureKind === "target-limit") { valid &&= observation.stage === "browser-targets" && observation.targetAttempts === 16 && observation.samples.length === 16 && last !== undefined && transient(last.classification); }
  if (observation.failureKind === "inventory") { valid &&= observation.stage === "browser-targets" && observation.targetAttempts === observation.samples.length + 1; }
  if (observation.failureKind === "selection") { valid &&= observation.stage === "browser-targets" && last !== undefined && ["multiple-pages", "attached-page", "unexpected-page"].includes(last.classification); }
  if (observation.failureKind === "version") { valid &&= observation.stage === "browser-version" && observation.versionSha256 === null; }
  if (!valid) { context.addIssue({ code: "custom", message: "Startup stage, attempts, accepted samples and failure classification must agree." }); }
}).readonly();
export type CurrentFootprintHeldCacheStartupObservation = z.infer<typeof currentFootprintHeldCacheStartupObservationSchema>;
const discovery = { browser: 1 + CURRENT_FOOTPRINT_HELD_CACHE_PAGE_READINESS.targetSamples, frames: 6, script: 7, parent: 2, ancillary: 2 } as const;
const discoveryRequests = Object.values(discovery).reduce((total, value) => total + value, 0);
export const CURRENT_FOOTPRINT_HELD_CACHE_DIAGNOSTIC_PROFILE = freezeDeep({
  purpose: "footprint-held-cache209", discovery, discoveryRequests,
  normalRequestLimit: discoveryRequests + HELD.normal, cleanupRequestLimit: HELD.cleanup,
  requestLimit: discoveryRequests + HELD.normal + HELD.cleanup,
  maximumRequestBytes: 32_768, maximumHeldReplyFrameBytes: HELD.replyBytes + 256,
  nativeAuthorityIssued: false, copyAuthorized: false, savedGenerationAuthorized: false,
  runtimeAdmissionGranted: false, replayTokenIssued: false, executionAuthorized: false,
} as const);
const token = z.string().regex(/^[A-Za-z\d_.:-]{1,128}(?![\s\S])/u);
export const currentFootprintHeldCacheDiagnosticBindingSchema = z.object({ sessionId: token, uniqueContextId: token,
  projectUuid: z.string().regex(/^[a-f\d]{64}(?![\s\S])/u), branchUuid: z.string().regex(/^[a-f\d]{32}(?![\s\S])/u) }).strict();
export type CurrentFootprintHeldCacheDiagnosticBinding = Readonly<z.infer<typeof currentFootprintHeldCacheDiagnosticBindingSchema>>;
export const CURRENT_FOOTPRINT_HELD_CACHE_DIAGNOSTIC_METHODS = Object.freeze(["Browser.getVersion", "Target.getTargets", "Target.attachToTarget",
  "Page.enable", "Page.getFrameTree", "Runtime.enable", "Debugger.enable", "Debugger.getScriptSource", "DOM.getFrameOwner", "DOM.describeNode"] as const);
