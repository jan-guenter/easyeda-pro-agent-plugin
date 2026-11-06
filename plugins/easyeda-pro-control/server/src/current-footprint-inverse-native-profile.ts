/** Separate third-generation birth. Only original discovery/main bootstrap is
 * admitted here; single-clock/delete/producer and whole-lifecycle grants stay
 * closed until their exact original inverse composition is installed. */
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUESTS as FENCE } from "./current-selected-file-main-sql-fence-protocol.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_TRANSPORT as MAIN } from "./current-footprint-copy-main-transport-contract.ts";
import { CURRENT_SAVED_PROJECT_REGISTRATION_CONFIG_REQUESTS as REGISTRATION } from "./current-saved-project-registration-config-protocol.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_PURPOSE = "footprint-inverse209";
const mainCleanup = MAIN.cleanupRequests, mainNormal = MAIN.normalRequests + FENCE.normal + REGISTRATION;
const discovery = 16;
// Every request and poll has at most two original native reproof callbacks.
// Include the same audited16-parent-proof upper envelope for each renderer
// Discovery, plus one close/abort and240 termination/release observations each.
const controls = 2 * (mainNormal + mainCleanup + MAIN.totalPolls) + 32 * discovery + 1 + 1 + 240 + 240 + 8;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_PROFILE = Object.freeze({
  purpose: CURRENT_FOOTPRINT_INVERSE_NATIVE_PURPOSE, nativeSwitch: "-FootprintInverse209",
  main: Object.freeze({ constructionNormal: MAIN.normalRequests, fenceNormal: FENCE.normal, registrationNormal: REGISTRATION,
    normal: mainNormal, cleanup: mainCleanup, total: mainNormal + mainCleanup }),
  renderer: Object.freeze({ discovery, total: discovery }), controls,
  completeInverseReserved: false, deleteInvocationAuthorized: false, executionAuthorized: false, saveAuthorized: false,
});
export const CURRENT_FOOTPRINT_INVERSE_DISCOVERY_METHODS = Object.freeze(["Browser.getVersion", "Target.getTargets", "Target.attachToTarget", "Page.enable", "Page.getFrameTree",
  "Runtime.enable", "Debugger.enable", "Debugger.getScriptSource", "DOM.getFrameOwner", "DOM.describeNode"]);
