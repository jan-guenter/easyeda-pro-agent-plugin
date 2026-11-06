/** Distinct original schematic display birth. Initial infrastructure permits
 * main-source/SQL observation and bounded discovery only. */
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUESTS as FENCE } from "./current-selected-file-main-sql-fence-protocol.ts";

export const CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PURPOSE = "schematic-display-write209";
export const CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PROFILE = Object.freeze({ purpose: CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PURPOSE,
  nativeSwitch: "-SchematicDisplayWrite209", main: Object.freeze({ normal: 64 + FENCE.normal, cleanup: 8, total: 64 + FENCE.normal + 8 }),
  renderer: Object.freeze({ discovery: 16, total: 16 }), workerOwnershipIssued: false,
  executionAuthorized: false, saveAuthorized: false, persistenceVerified: false });
export const CURRENT_SCHEMATIC_DISPLAY_DISCOVERY_METHODS = Object.freeze(["Browser.getVersion", "Target.getTargets", "Target.attachToTarget", "Page.enable", "Page.getFrameTree",
  "Runtime.enable", "Debugger.enable", "Debugger.getScriptSource", "DOM.getFrameOwner", "DOM.describeNode"]);
