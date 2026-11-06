/** Distinct original schematic display birth. Fixed navigation and source
 * read stages share this immutable budget; writer/Save grants stay separate. */
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUESTS as FENCE } from "./current-selected-file-main-sql-fence-protocol.ts";

export const CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PURPOSE = "schematic-display-write209";
export const CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PROFILE = Object.freeze({ purpose: CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PURPOSE,
  nativeSwitch: "-SchematicDisplayWrite209", main: Object.freeze({ normal: 64 + FENCE.normal, cleanup: 8, total: 64 + FENCE.normal + 8 }),
  renderer: Object.freeze({ discovery: 16, navigationCalls: 2, stageCalls: 5, stageBrackets: 5 * 8, total: 16 + 2 + 5 + 5 * 8 }), workerOwnershipIssued: false,
  executionAuthorized: false, saveAuthorized: false, persistenceVerified: false });
export const CURRENT_SCHEMATIC_DISPLAY_DISCOVERY_METHODS = Object.freeze(["Browser.getVersion", "Target.getTargets", "Target.attachToTarget", "Page.enable", "Page.getFrameTree",
  "Runtime.enable", "Debugger.enable", "Debugger.getScriptSource", "DOM.getFrameOwner", "DOM.describeNode"]);
