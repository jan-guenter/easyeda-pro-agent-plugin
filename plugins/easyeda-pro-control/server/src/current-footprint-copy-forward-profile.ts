/** Separate forward birth and counter range. Finite capacity does not prove
 * head/cache/clock eligibility, reserve an inverse or enable native creation. */
import { CURRENT_FOOTPRINT_COPY_ALLOCATED_CREATE_CLOCK_BUDGET as ALLOCATION } from "./current-footprint-copy-allocated-create-clock-budget.ts";
import { CURRENT_FOOTPRINT_COPY_EXECUTION_PROFILE as PREPARATION } from "./current-footprint-copy-execution-profile.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_KNOWN_CAPACITY as MAIN } from "./current-footprint-copy-main-capacity.ts";
import { CURRENT_FOOTPRINT_COPY_PREPARATION_REQUESTS as SOURCE_PREPARATION } from "./current-footprint-copy-preparation.ts";
import { CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_REQUESTS as SOURCE } from "./current-footprint-copy-source-stage-budget.ts";
import { CURRENT_PCB_WORKER_STARTUP_STREAM_LIMITS as STREAM } from "./current-pcb-worker-startup-stream-limits.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_COPY_FORWARD_PURPOSE = "worker-startup-footprint-forward209";
const normal = PREPARATION.normalRequestLimit - PREPARATION.requests.transactionClock + ALLOCATION.normal + SOURCE + SOURCE_PREPARATION;
const cleanup = PREPARATION.requests.cleanup - 5 + ALLOCATION.cleanup;
const requests = normal + cleanup;

export const CURRENT_FOOTPRINT_COPY_FORWARD_PROFILE = freezeDeep({
  purpose: CURRENT_FOOTPRINT_COPY_FORWARD_PURPOSE,
  nativeSwitch: "-WorkerStartupFootprintForward209",
  renderer: {
    // Normal commands can follow cleanup. This is the normal ID ceiling,
    // While normalClassLimit counts the separately charged command class.
    normalRequestLimit: requests, requestLimit: requests,
    normalClassLimit: normal, cleanupClassLimit: cleanup,
    requests: { cleanup }, stateSampleLimit: PREPARATION.stateSampleLimit,
    bytes: STREAM.receivedBytes,
  },
  main: { normalRequestLimit: MAIN.minimumNormal, cleanupRequestLimit: MAIN.minimumCleanup, requestLimit: MAIN.minimumTotal },
  normalMilliseconds: STREAM.lifetimeMilliseconds,
  cleanupMilliseconds: PREPARATION.cleanupMilliseconds,
  nativeWriterMounted: false, wholeFourGenerationBudgetReserved: false,
  executionAuthorized: false, saveAuthorized: false,
} as const);

export const CURRENT_FOOTPRINT_COPY_FORWARD_RENDERER_PROFILE = freezeDeep({
  ...CURRENT_FOOTPRINT_COPY_FORWARD_PROFILE.renderer, purpose: CURRENT_FOOTPRINT_COPY_FORWARD_PURPOSE,
  normalMilliseconds: CURRENT_FOOTPRINT_COPY_FORWARD_PROFILE.normalMilliseconds,
  cleanupMilliseconds: CURRENT_FOOTPRINT_COPY_FORWARD_PROFILE.cleanupMilliseconds,
  wholeExecutionBudgetReserved: false, executionAuthorized: false, saveAuthorized: false,
} as const);

/** Fixed constants for the separate forward constructor. Existing combined
 * and execution purpose limits are not widened or replaced. */
export function currentFootprintCopyForwardNativeLimits(): string {
  const profile = CURRENT_FOOTPRINT_COPY_FORWARD_PROFILE;
  return `public static class EasyedaFootprintForwardLimits { public const int MainNormal=${String(profile.main.normalRequestLimit)}; public const int MainCleanup=${String(profile.main.cleanupRequestLimit)}; public const int MainRequests=${String(profile.main.requestLimit)}; public const int Requests=${String(profile.renderer.requestLimit)}; public const int NormalRequests=${String(profile.renderer.normalRequestLimit)}; public const int NormalClass=${String(profile.renderer.normalClassLimit)}; public const int CleanupClass=${String(profile.renderer.cleanupClassLimit)}; public const long NormalMilliseconds=${String(profile.normalMilliseconds)}L; public const long TotalMilliseconds=${String(profile.normalMilliseconds + profile.cleanupMilliseconds)}L; }`;
}
