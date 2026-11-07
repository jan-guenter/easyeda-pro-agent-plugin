/** New original seven-record birth, with its own immutable accounting. Equal
 * finite source algorithms do not transfer the six-record owner's resources. */
import { CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PROFILE as SHARED } from "./current-schematic-display-write-native-profile.ts";
import { CURRENT_SCHEMATIC_DISPLAY_ACTION_REQUESTS as ACTION } from "./current-schematic-display-action-protocol.ts";
import { CURRENT_SCHEMATIC_DISPLAY_ACTION_GUARD_REQUESTS as ACTION_GUARD } from "./current-schematic-display-action-guard-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_SAVE_STRUCTURE_REQUESTS as STRUCTURE } from "./current-project-save-structure-protocol.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_NATIVE_PURPOSE = "schematic-relevance-display-write209";
export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_NATIVE_PROFILE = Object.freeze({
  purpose: CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_NATIVE_PURPOSE, nativeSwitch: "-SchematicRelevanceDisplayWrite209",
  main: Object.freeze({ ...SHARED.main }), renderer: Object.freeze({ ...SHARED.renderer,
    structureObservation: STRUCTURE.cdpRequests,
    actionPreflightObservation: ACTION.total, actionGuardObservation: ACTION_GUARD.cdpRequests, actionGuardBindingControls: ACTION_GUARD.bindingControls,
    total: SHARED.renderer.total - SHARED.renderer.structureObservation - SHARED.renderer.actionPreflightObservation - SHARED.renderer.actionGuardObservation - SHARED.renderer.actionGuardBindingControls +
      STRUCTURE.cdpRequests + ACTION.total + ACTION_GUARD.cdpRequests + ACTION_GUARD.bindingControls }),
});
