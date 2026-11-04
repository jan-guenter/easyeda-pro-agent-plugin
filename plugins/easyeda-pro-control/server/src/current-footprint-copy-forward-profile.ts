/** Separate forward birth and counter range. Finite capacity does not prove
 * head/cache/clock eligibility, reserve an inverse or enable native creation. */
import { CURRENT_FOOTPRINT_COPY_ALLOCATED_CREATE_CLOCK_BUDGET as ALLOCATION } from "./current-footprint-copy-allocated-create-clock-budget.ts";
import { CURRENT_FOOTPRINT_COPY_EXECUTION_PROFILE as PREPARATION } from "./current-footprint-copy-execution-profile.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_KNOWN_CAPACITY as MAIN } from "./current-footprint-copy-main-capacity.ts";
import { CURRENT_FOOTPRINT_COPY_PREPARATION_REQUESTS as SOURCE_PREPARATION,
  CURRENT_FOOTPRINT_COPY_SOURCE_SEAL_REQUESTS as SOURCE_SEAL } from "./current-footprint-copy-preparation.ts";
import { CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_REQUESTS as SOURCE } from "./current-footprint-copy-source-stage-budget.ts";
import { CURRENT_FOOTPRINT_COPY_EXECUTION_LIMITS as COORDINATOR } from "./current-footprint-copy-execution.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_TRANSPORT as MAIN_STREAM } from "./current-footprint-copy-main-transport-contract.ts";
import { CURRENT_PCB_WORKER_STARTUP_STREAM_LIMITS as STREAM } from "./current-pcb-worker-startup-stream-limits.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_COPY_FORWARD_PURPOSE = "worker-startup-footprint-forward209";
const normal = PREPARATION.normalRequestLimit - PREPARATION.requests.transactionClock + ALLOCATION.normal + SOURCE + SOURCE_PREPARATION + SOURCE_SEAL;
const cleanup = PREPARATION.requests.cleanup - 5 + ALLOCATION.cleanup;
const requests = normal + cleanup;
// Every parent proof performs two worker-startup-reprove exchanges. A normal
// Construction metadata read alone has five such callbacks: construction
// Before/after, transport before/after, and channel before dispatch. Sixteen
// Reserves those five plus the opening, source/assignment and leaf-owner joins.
// UI/manager/registration wrappers have fewer layers. Calls without a renderer
// Command are separately bounded below, rather than disappearing into an ID cap.
const controlsPerParentProof = 2, parentProofsPerRendererRequest = 16;
const wrapperStages = Object.freeze(["launch-discovery", "capture-parent", "capture-opening", "capture-constructors", "capture-worker",
  "assignments", "actor", "cache-construction", "state", "producers", "dependencies", "callbacks", "destinations", "ui", "ui-reproof",
  "registration", "manager", "peer", "route-reproof", "windows-clock", "registration-sample", "source-plan", "source", "source-reproof",
  "preparation-reproof-first", "preparation-reproof-second", "preparation-reproof-third", "owned-preparation-reproof",
  "source-seal-opening-first", "source-seal-preparation-first", "source-seal-opening-second", "source-seal-preparation-second"]);
// A stage can bracket its native commands with up to32 opening checks, each
// Containing two original-parent callbacks. The command-associated callbacks
// Above are additional. Reserve the same wrapper allowance for interrupted
// Cleanup; an unwound stage never receives a renewed normal allowance.
const parentProofsPerWrapperStage = 32 * 2;
const fixedControls = 32;
// Opening transport, held parent construction, parent peer, native owner
// Release and final channel release each reobserve original exit once. Window,
// Main detach and actual helper release add three controls alongside close/abort.
const terminalExitReproofs = 5;
const terminalControls = COORDINATOR.terminationObservationsPerGeneration + COORDINATOR.normalCloseAttemptsPerGeneration + 1 + terminalExitReproofs + 3;
// Main's request and pump each assertCurrent before/after. The normal side
// Includes the entire original poll/command ceiling because cleanup can occur
// During construction, before the native owner enters terminal cleanup.
const normalControls = controlsPerParentProof * (requests * parentProofsPerRendererRequest + wrapperStages.length * parentProofsPerWrapperStage) +
  2 * (MAIN_STREAM.totalPolls + MAIN.minimumTotal) + fixedControls;
const cleanupControls = controlsPerParentProof * (cleanup * parentProofsPerRendererRequest + wrapperStages.length * parentProofsPerWrapperStage) +
  2 * (MAIN_STREAM.totalPolls - MAIN_STREAM.normalPolls + MAIN.minimumCleanup) + terminalControls;
export const CURRENT_FOOTPRINT_COPY_FORWARD_CONTROL_BUDGET = freezeDeep({ normal: normalControls, cleanup: cleanupControls,
  total: normalControls + cleanupControls, derivation: { controlsPerParentProof, parentProofsPerRendererRequest,
    parentProofsPerWrapperStage, wrapperStages, mainReproofsPerRequestOrPoll: 2, fixedControls, terminalExitReproofs, terminalControls },
  sourceDerivedUpperBound: true, independentlyNativeMeasured: false } as const);

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
  controls: CURRENT_FOOTPRINT_COPY_FORWARD_CONTROL_BUDGET,
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
