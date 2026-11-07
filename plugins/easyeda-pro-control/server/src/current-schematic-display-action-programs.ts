/** Fixed readonly original-holder projections; no action/factory is invoked. */
import { GENERATED_SCHEMATIC_DISPLAY_ACTION_PREFLIGHT_FUNCTION, GENERATED_SCHEMATIC_DISPLAY_ACTION_PREFLIGHT_SAME_FUNCTION } from "./generated-schematic-display-action-program.ts";

export const CURRENT_SCHEMATIC_DISPLAY_ACTION_GROUP = "easyeda-pro-control-schematic-action-preflight-v1";
export const CURRENT_SCHEMATIC_DISPLAY_ACTION_CALLS = Object.freeze({
  preflight: `function(t,o){"use strict";return Reflect.apply(${GENERATED_SCHEMATIC_DISPLAY_ACTION_PREFLIGHT_FUNCTION},this,[JSON.parse(t),JSON.parse(o)]);}`,
  same: `function(h,t,o){"use strict";return Reflect.apply(${GENERATED_SCHEMATIC_DISPLAY_ACTION_PREFLIGHT_SAME_FUNCTION},this,[h,JSON.parse(t),JSON.parse(o)]);}`,
});
