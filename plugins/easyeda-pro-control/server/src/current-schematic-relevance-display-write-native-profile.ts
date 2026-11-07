import { CURRENT_PCB_VIA_MAIN_REQUESTS as MAIN } from "./current-pcb-via-main-protocol.ts";
import { CURRENT_PCB_VIA_MAIN_STEP_REQUESTS as STEP } from "./current-pcb-via-main-step-protocol.ts";
import { CURRENT_PCB_VIA_MAIN_BEGIN_REQUESTS as BEGIN } from "./current-pcb-via-main-begin-protocol.ts";
import { CURRENT_PCB_VIA_MAIN_HISTORY_REQUESTS as HISTORY } from "./current-pcb-via-main-history-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_REQUESTS as MODIFY_ENTRY } from "./current-schematic-relevance-display-modify-entry-protocol.ts";
/** New original seven-record birth, with its own immutable accounting. Equal
 * finite source algorithms do not transfer the six-record owner's resources. */
import { CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PROFILE as SHARED } from "./current-schematic-display-write-native-profile.ts";
import { CURRENT_SCHEMATIC_DISPLAY_ACTION_REQUESTS as ACTION } from "./current-schematic-display-action-protocol.ts";
import { CURRENT_SCHEMATIC_DISPLAY_ACTION_GUARD_REQUESTS as ACTION_GUARD } from "./current-schematic-display-action-guard-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_SAVE_STRUCTURE_REQUESTS as STRUCTURE } from "./current-project-save-structure-protocol.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_NATIVE_PURPOSE = "schematic-relevance-display-write209";
export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_NATIVE_PROFILE = Object.freeze({
  purpose: CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_NATIVE_PURPOSE, nativeSwitch: "-SchematicRelevanceDisplayWrite209",
  main: Object.freeze({ normal: SHARED.main.normal + MAIN.normal + STEP.normal + BEGIN.normal + HISTORY.normal, cleanup: SHARED.main.cleanup + MAIN.cleanup + BEGIN.cleanup + HISTORY.cleanup, total: SHARED.main.total + MAIN.total + STEP.total + BEGIN.total + HISTORY.total }), renderer: Object.freeze({ ...SHARED.renderer,
    structureObservation: STRUCTURE.cdpRequests,
    actionPreflightObservation: ACTION.total, actionGuardObservation: ACTION_GUARD.cdpRequests, actionGuardBindingControls: ACTION_GUARD.bindingControls,
    modifyEntryObservation: MODIFY_ENTRY.observation,
    total: SHARED.renderer.total - SHARED.renderer.structureObservation - SHARED.renderer.actionPreflightObservation - SHARED.renderer.actionGuardObservation - SHARED.renderer.actionGuardBindingControls +
      STRUCTURE.cdpRequests + ACTION.total + ACTION_GUARD.cdpRequests + ACTION_GUARD.bindingControls + MODIFY_ENTRY.observation }),
});
