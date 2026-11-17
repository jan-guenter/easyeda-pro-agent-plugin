import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_POSTSTATE_REQUESTS as POSTSTATE } from "./current-footprint-inverse-native-delete-poststate-budget.ts";
/** V4 selects a distinct original compiler at birth. Its finite native drain
 * reserve changes no V3 ceiling and grants no complete inverse or persistence. */
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_V4_BASE_PROFILE as V3, CURRENT_FOOTPRINT_INVERSE_NATIVE_V4_BASE_ACTION_LIMITS as V3_ACTIONS } from "./current-footprint-inverse-native-v4-base-data.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CALLER_REQUESTS as CALLER } from "./current-footprint-inverse-native-delete-caller-budget.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_REQUESTS as DRAIN } from "./current-footprint-inverse-native-delete-drain-budget.ts";

import {CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_COMPILER_MAX_BYTES,CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_INPUT_MAX_BYTES,CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_LAYOUT,CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_REVIEW_MAX_BYTES}from "./current-footprint-inverse-native-v4-build-profile.ts";

export {CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_COMPILER_MAX_BYTES,CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_INPUT_MAX_BYTES,CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_LAYOUT,CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_REVIEW_MAX_BYTES}from "./current-footprint-inverse-native-v4-build-profile.ts";
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_ACTION_LIMITS=Object.freeze({...V3_ACTIONS,
 "footprint-inverse-native-delete-drain":DRAIN.nativeActions,
 "footprint-inverse-native-delete-caller":CALLER.nativeActions,
 "footprint-inverse-native-delete-poststate":POSTSTATE.nativeActions,
 "main-reprove":V3_ACTIONS["main-reprove"]+DRAIN.sourceReproofs+CALLER.sourceReproofs+POSTSTATE.sourceReproofs,
});
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_PROFILE=Object.freeze({...V3,
 layout:CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_LAYOUT,nativeSwitch:"-FootprintInverseNativeContinuationV4",
 compiler:Object.freeze({inputMaxBytes:CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_INPUT_MAX_BYTES,reviewMaxBytes:CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_REVIEW_MAX_BYTES,compilerMaxBytes:CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_COMPILER_MAX_BYTES}),
 main:Object.freeze({...V3.main,reproofs:CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_ACTION_LIMITS["main-reprove"]}),
 renderer:Object.freeze({...V3.renderer,nativeDeleteOriginalDrain:DRAIN,nativeDeleteOriginalCaller:CALLER,nativeDeleteOriginalPoststate:POSTSTATE,total:V3.renderer.total+DRAIN.cdpRequests+CALLER.cdpRequests+POSTSTATE.cdpRequests}),
 controls:V3.controls+DRAIN.nativeActions+DRAIN.sourceReproofs+CALLER.nativeActions+CALLER.sourceReproofs+POSTSTATE.nativeActions+POSTSTATE.sourceReproofs,
 workerTailArmed:false,workerPostSyncVerified:false,wholeInverseReserved:false,
});
