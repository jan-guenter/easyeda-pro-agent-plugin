/** Separate original observer birth. These reservations admit observation and
 * its cleanup, never a structure trigger, edit, clock, create or Save. */
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS as MAIN } from "./current-footprint-copy-main-backend-budget.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_TRANSPORT as MAIN_STREAM } from "./current-footprint-copy-main-transport-contract.ts";
import { CURRENT_PCB_WORKER_STARTUP_STREAM_LIMITS as STREAM } from "./current-pcb-worker-startup-stream-limits.ts";
import { CURRENT_PROJECT_STRUCTURE_MAIN_REQUESTS as STRUCTURE } from "./current-project-structure-main-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_PROJECT_STRUCTURE_WORKER_REQUESTS } from "./current-project-structure-worker-profile.ts";
import { CURRENT_FOOTPRINT_COLD_PRODUCER_REQUESTS } from "./current-footprint-cold-producer-roster.ts";

export const CURRENT_PROJECT_STRUCTURE_NATIVE_PURPOSE = "project-structure209";
// Every observer normal request rechecks assignments before and after its own
// Command. Each freshScopes additionally needs one recheck and six metadata
// Reads. Arm and final observation each have one standalone owner recheck.
const originalStartupNormal = 224, requestsPerObserver = 3, requestsPerScopes = 7, standaloneRechecks = 2, startup = 256;
const startupCleanup = startup - originalStartupNormal, startupNormal = originalStartupNormal + CURRENT_FOOTPRINT_COLD_PRODUCER_REQUESTS;
const workerNormal = startupNormal + CURRENT_PROJECT_STRUCTURE_WORKER_REQUESTS.normal * requestsPerObserver +
  CURRENT_PROJECT_STRUCTURE_WORKER_REQUESTS.scopes * requestsPerScopes + standaloneRechecks;
const workerCleanup = startupCleanup + CURRENT_PROJECT_STRUCTURE_WORKER_REQUESTS.cleanup;
const mainNormal = MAIN.observeNormal + MAIN.originIssueNormal + STRUCTURE.normal;
const mainCleanup = MAIN.observeCleanup + STRUCTURE.cleanup + MAIN.releaseCleanup;
// Existing original-parent reproof may traverse sixteen enclosing guards, each
// Issuing two native checks. Keep the complete original main poll allowance.
const parentProofs = 16, reproofControls = 2, terminalControls = 32, wrapperProofs = 64, wrapperStages = 16;
const rendererPolls = STREAM.dataPolls + STREAM.waitPolls + STREAM.idlePolls;
const normalControls = reproofControls * (workerNormal * parentProofs + mainNormal + MAIN_STREAM.normalPolls + wrapperStages * wrapperProofs) + rendererPolls;
const cleanupControls = reproofControls * (workerCleanup * parentProofs + mainCleanup + MAIN_STREAM.totalPolls + wrapperStages * wrapperProofs) + rendererPolls + terminalControls;
export const CURRENT_PROJECT_STRUCTURE_NATIVE_PROFILE = freezeDeep({
  purpose: CURRENT_PROJECT_STRUCTURE_NATIVE_PURPOSE, nativeSwitch: "-ProjectStructure209",
  worker: { normal: workerNormal, cleanup: workerCleanup, total: workerNormal + workerCleanup,
    derivation: { startup, startupNormal, startupCleanup, originalStartupNormal, coldProducerRequests: CURRENT_FOOTPRINT_COLD_PRODUCER_REQUESTS,
      requestsPerObserver, requestsPerScopes, standaloneRechecks } },
  main: { normal: mainNormal, cleanup: mainCleanup, total: mainNormal + mainCleanup },
  controls: { normal: normalControls, cleanup: cleanupControls, total: normalControls + cleanupControls,
    derivation: { parentProofs, reproofControls, mainNormalPolls: MAIN_STREAM.normalPolls, mainTotalPolls: MAIN_STREAM.totalPolls,
      rendererPolls, wrapperStages, wrapperProofs, terminalControls } },
  normalMilliseconds: 3_600_000, cleanupMilliseconds: 60_000,
  completeUploadFrontierVerified: false, operationEligibilityVerified: false, writerAuthorized: false, saveAuthorized: false,
} as const);

/** New native constructor constants only. Old Combined/startup limits retain
 * their exact values and cannot acquire this budget by passing larger IDs. */
export function currentProjectStructureNativeLimits(): string {
  const p = CURRENT_PROJECT_STRUCTURE_NATIVE_PROFILE;
  return `public static class EasyedaProjectStructureLimits { public const int WorkerNormal=${String(p.worker.normal)},WorkerCleanup=${String(p.worker.cleanup)},WorkerRequests=${String(p.worker.total)},MainNormal=${String(p.main.normal)},MainCleanup=${String(p.main.cleanup)},MainRequests=${String(p.main.total)},NormalControls=${String(p.controls.normal)},CleanupControls=${String(p.controls.cleanup)}; }`;
}
