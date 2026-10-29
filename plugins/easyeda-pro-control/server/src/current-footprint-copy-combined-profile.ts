/** New birth-only main/renderer purpose. These exact known-stage capacities
 * do not reserve the unfinished clock, completion, saved or inverse lifecycle. */
import { CURRENT_FOOTPRINT_COPY_EXECUTION_PROFILE as RENDERER } from "./current-footprint-copy-execution-profile.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS as CONSTRUCTION } from "./current-footprint-copy-main-backend-budget.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_REQUESTS as REQUEST } from "./current-footprint-copy-main-request-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_COMBINED_PURPOSE = "worker-startup-footprint-combined209";
const originIssueNormal = CONSTRUCTION.originIssueNormal;
const mainNormal = CONSTRUCTION.observeNormal + originIssueNormal + REQUEST.normal;
const mainCleanup = CONSTRUCTION.observeCleanup + CONSTRUCTION.releaseCleanup + REQUEST.cleanup;
const cleanupControlLimit = 512, cleanupReplyBytes = 512, helperStdoutNormalBytes = 96 * 1024 * 1024, pendingReplyBytes = 100_000;
// One original in-flight reply plus every retained cleanup acknowledgment.
// This reserve does not claim simultaneous saturation of both raw transports.
const cleanupReserveBytes = Math.ceil((pendingReplyBytes + cleanupControlLimit * cleanupReplyBytes) / (1024 * 1024)) * 1024 * 1024;

export const CURRENT_FOOTPRINT_COMBINED_PROFILE = freezeDeep({
  purpose: CURRENT_FOOTPRINT_COMBINED_PURPOSE,
  nativeSwitch: "-WorkerStartupFootprintCombined209",
  // Normal/cleanup are charged classes. The maximum successful normal ID is
  // 50 after interleaved cleanup; it is not the 41-command normal-class ceiling.
  main: { normalRequestLimit: mainNormal, cleanupRequestLimit: mainCleanup, requestLimit: mainNormal + mainCleanup,
    requests: { constructionNormal: CONSTRUCTION.observeNormal, constructionCleanup: CONSTRUCTION.observeCleanup,
      originIssueNormal, requestNormal: REQUEST.normal, requestCleanup: REQUEST.cleanup, releaseCleanup: CONSTRUCTION.releaseCleanup },
    bytes: 32 * 1024 * 1024, messageBytes: 4 * 1024 * 1024 },
  helperStdout: { normalBytes: helperStdoutNormalBytes, cleanupControlLimit, cleanupReplyBytes, pendingReplyBytes, cleanupReserveBytes,
    totalBytes: helperStdoutNormalBytes + cleanupReserveBytes, wholeWriterAggregateReserved: false },
  renderer: { normalRequestLimit: RENDERER.normalRequestLimit, requestLimit: RENDERER.requestLimit,
    cleanupRequestLimit: RENDERER.requests.cleanup, stateSampleLimit: RENDERER.stateSampleLimit, bytes: RENDERER.bytes },
  normalMilliseconds: RENDERER.normalMilliseconds, cleanupMilliseconds: RENDERER.cleanupMilliseconds,
  wholeExecutionBudgetReserved: false, nativeWriterMounted: false, executionAuthorized: false, saveAuthorized: false,
} as const);
export const CURRENT_FOOTPRINT_COMBINED_RENDERER_PROFILE = freezeDeep({
  ...CURRENT_FOOTPRINT_COMBINED_PROFILE.renderer, purpose: CURRENT_FOOTPRINT_COMBINED_PURPOSE,
  normalMilliseconds: CURRENT_FOOTPRINT_COMBINED_PROFILE.normalMilliseconds,
  cleanupMilliseconds: CURRENT_FOOTPRINT_COMBINED_PROFILE.cleanupMilliseconds,
  requests: { cleanup: CURRENT_FOOTPRINT_COMBINED_PROFILE.renderer.cleanupRequestLimit },
  wholeExecutionBudgetReserved: false, executionAuthorized: false, saveAuthorized: false,
} as const);

/** Native constants are generated only for this separate constructor. They
 * never replace or widen the old diagnostic/route-purpose limits. */
export function currentFootprintCombinedNativeLimits(): string {
  const profile = CURRENT_FOOTPRINT_COMBINED_PROFILE;
  return `public static class EasyedaFootprintCombinedLimits { public const int MainNormal=${String(profile.main.normalRequestLimit)}; public const int MainCleanup=${String(profile.main.cleanupRequestLimit)}; public const int MainRequests=${String(profile.main.requestLimit)}; public const int Requests=${String(profile.renderer.requestLimit)}; public const int NormalRequests=${String(profile.renderer.normalRequestLimit)}; public const long NormalMilliseconds=${String(profile.normalMilliseconds)}L; public const long TotalMilliseconds=${String(profile.normalMilliseconds + profile.cleanupMilliseconds)}L; }`;
}
