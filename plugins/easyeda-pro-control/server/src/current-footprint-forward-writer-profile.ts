/** A separate native birth for the fixed forward writer stages. Historical
 * observation/v2 ceilings remain unchanged. Each continuation reserves its own
 * fixed stages; missing tails cannot borrow another stage's slots. */
/* oxlint-disable import/max-dependencies -- Derive this distinct purpose from each fixed stage's original finite reservation; duplicating those constants would hide accounting drift. */
import { CURRENT_FOOTPRINT_FORWARD_EXECUTION_CAPACITY as PREVIOUS } from "./current-footprint-copy-forward-capacity.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_CLOCK_PREPARATION_REQUESTS as PREPARATION } from "./current-footprint-forward-writer-clock-preparation-budget.ts";
import { CURRENT_FOOTPRINT_FORWARD_HEAD_MAIN_REQUESTS as HEAD } from "./current-footprint-forward-head-protocol.ts";
import { CURRENT_FOOTPRINT_COPY_HELD_SAVED_CAPACITY as SAVED } from "./current-footprint-copy-held-saved-capacity.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_REQUESTS as PRODUCER } from "./current-project-save-producer-protocol.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_GUARD_REQUESTS as GUARDS } from "./current-project-save-producer-guard-protocol.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUESTS as FENCE } from "./current-selected-file-main-sql-fence-protocol.ts";
import { CURRENT_MAIN_STARTUP_LIBRARY_V2 as STOCK } from "./current-main-startup-library-v2-profile.ts";
import { CURRENT_FOOTPRINT_INVERSE_MAIN_HISTORY_REQUESTS as HISTORY } from "./current-footprint-inverse-main-history-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_INITIAL_SYNC_REQUESTS as SYNC } from "./current-footprint-inverse-initial-sync-protocol.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_FRONTIER_REQUESTS as FRONTIER } from "./current-footprint-forward-writer-frontier-budget.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_FORWARD_WRITER_PURPOSE = "worker-startup-footprint-forward-writer209";
/** Join only the finite fixed stages; pending continuation counts stay absent. */
// oxlint-disable-next-line typescript/explicit-function-return-type -- Preserve the exact deeply frozen literal profile and finite imported stage types in the public derivation.
function derive() {
// The original head-age collector has45 requests:18 normal/3 cleanup for the
// Already reserved Main construction,23 normal body reads, and the original
// Construction group's final cleanup release. Shared commands are counted once.
const age = Object.freeze({ normal: 23, cleanup: 0, total: 23 });
// Eight startup jobs replace the generic observer's three already counted
// Jobs: five more need14 observation requests each, then the fixed eight
// Cursor requests per job. Bind, each of24 holds and completion are controls.
const cache = Object.freeze({ jobs: 8, additionalObservation: 5 * 14, additionalEvents: 5 * 3, cursorRequests: 8 * 8, controls: 1 + 3 * 8 + 1 });
const sync = Object.freeze({ cursorRequests: SYNC.cdpRequests, holds: SYNC.events, controls: SYNC.events + 1 });
const rendererExtra = PREPARATION.normal + PRODUCER.normal + GUARDS.normal + cache.additionalObservation + cache.cursorRequests + sync.cursorRequests + FRONTIER.rendererCommands;
const normal = PREVIOUS.writer.renderer.normalClassLimit + rendererExtra;
const cleanup = PREVIOUS.writer.renderer.cleanupClassLimit;
// The common Main runner's bounded startup observation/fence is distinct
// From the already reserved copy construction. Original stock uses its own
// 2002-request ledger and shares only the physical request-ID cursor.
const startup = Object.freeze({ ordinaryNormal: 64 + FENCE.normal, stock: STOCK.requests });
const history = Object.freeze({ normal: HISTORY.repetitions * HISTORY.normal, cleanup: HISTORY.repetitions * HISTORY.cleanup, total: HISTORY.repetitions * HISTORY.total });
const main = Object.freeze({ normalRequestLimit: PREVIOUS.writer.main.normalClassLimit + HEAD.normal + age.normal + startup.ordinaryNormal + startup.stock + history.normal,
  cleanupRequestLimit: PREVIOUS.writer.main.cleanupClassLimit + HEAD.cleanup + history.cleanup,
  ordinaryNormalRequestLimit: PREVIOUS.writer.main.normalClassLimit + HEAD.normal + age.normal + startup.ordinaryNormal + history.normal,
  stockRequestLimit: startup.stock,
  requestLimit: PREVIOUS.writer.main.requestLimit + HEAD.total + age.total + startup.ordinaryNormal + startup.stock + history.total });
// Six additional wrapper operations bracket source/lease collection, producer
// Construction, guards, observation and final exclusion. As in the old fixed
// Budget, each can use32 opening checks containing two parent-proof exchanges.
const wrappers = Object.freeze(["clock-source-and-leases", "producer-original-bootstrap", "producer-intrinsics", "producer-guards", "producer-observation", "producer-exclusion", "startup-cache-cursor", "startup-frontier"]);
const wrapperControls = wrappers.length * 32 * 2 * 2;
const extraMainNormal = main.normalRequestLimit - PREVIOUS.writer.main.normalClassLimit;
const extraMainCleanup = main.cleanupRequestLimit - PREVIOUS.writer.main.cleanupClassLimit;
const ageWindowsControls = 2;
const producerBindingControls = 1;
const normalControls = PREVIOUS.controls.writer.normal + 32 * rendererExtra + 2 * (extraMainNormal + extraMainCleanup) + wrapperControls + producerBindingControls + cache.controls + sync.controls + GUARDS.enrollmentControls + ageWindowsControls + FRONTIER.controls;
const cleanupControls = PREVIOUS.controls.writer.cleanup + 2 * extraMainCleanup + wrapperControls;
const controls = Object.freeze({ normal: normalControls, cleanup: cleanupControls, total: normalControls + cleanupControls });
const extraCommands = rendererExtra + extraMainNormal + extraMainCleanup;
const extraControls = controls.total - PREVIOUS.controls.writer.total;
const extraStdout = (extraCommands + extraControls) * PREVIOUS.controls.replyHeaderBytes + ageWindowsControls * PREVIOUS.controls.windowsClockReplyBytes;

return freezeDeep({
  profile: "private.current-footprint-forward-writer-birth.v1",
  purpose: CURRENT_FOOTPRINT_FORWARD_WRITER_PURPOSE,
  nativeSwitch: "-WorkerStartupFootprintForwardWriter209",
  renderer: { ...PREVIOUS.writer.renderer, normalClassLimit: normal, cleanupClassLimit: cleanup,
    normalRequestLimit: normal + cleanup, requestLimit: normal + cleanup, normalIdCeiling: normal + cleanup, eventCount: PREVIOUS.writer.renderer.eventCount + FRONTIER.eventCount },
  main, controls,
  saved: SAVED,
  stages: { previous: PREVIOUS.profile, clockPreparation: PREPARATION, head: HEAD, age, startup, cache, history, sync, frontier: FRONTIER,
    producer: PRODUCER, guards: GUARDS, wrappers, wrapperControls, producerBindingControls, ageWindowsControls },
  output: { ...PREVIOUS.output, helperStdoutBytes: PREVIOUS.output.helperStdoutBytes - PREVIOUS.saved.helperStdoutBytes + SAVED.helperStdoutBytes + extraStdout,
    artifactBytes: PREVIOUS.output.artifactBytes + FRONTIER.artifactBytes, journalBytes: PREVIOUS.output.journalBytes + FRONTIER.journalBytes,
    retainedBytes: PREVIOUS.output.retainedBytes + FRONTIER.retainedBytes },
  writerHelperStdoutBytes: PREVIOUS.writer.helperStdoutBytes + extraStdout,
  normalMilliseconds: PREVIOUS.normalMillisecondsPerGeneration,
  cleanupMilliseconds: PREVIOUS.cleanupMillisecondsPerGeneration,
  pendingContinuationBudgets: ["forward-producer-planned-resumes", "forward-producer-save-upload-frontier"],
  pendingOriginalProviders: ["same-full-writer-source-and-head-opening", "full-writer-clock-interleave",
    "sole-upload-and-cache-retry-frontier", "single-use-create-result-and-saved-successor"],
  wholeWriterReserved: false,
  executionAuthorized: false,
  saveAuthorized: false,
} as const);
}
let retained: ReturnType<typeof derive> | null = null;
/** Lazy derivation permits the original ledger module to use this fixed third
 * profile without evaluating an imported old envelope during its own birth. */
export function currentFootprintForwardWriterProfile(): ReturnType<typeof derive> { retained ??= derive(); return retained; }
