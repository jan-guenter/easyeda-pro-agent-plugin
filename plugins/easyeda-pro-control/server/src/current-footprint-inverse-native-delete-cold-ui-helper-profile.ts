/** Separately pinned build envelope for one independently born cold UI
 * helper. These source ceilings issue no runtime, receiver or call authority.
 * Every historical shared/V1/V2/V3/V4 envelope remains byte-exact. */
import {freezeDeep} from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_HELPER_PROFILE=freezeDeep({
 schema:"private.current-footprint-inverse-native-delete-cold-ui-helper-profile.v1",
 layout:"native-delete-cold-ui.v1",
 nativeSwitch:"-FootprintInverseNativeDeleteColdUi209",
 nativeConstructor:"CreateFootprintInverseNativeDeleteColdUi209",
 helperRelativePath:"scripts/footprint-inverse-native-delete-cold-ui.ps1",
 reviewRelativePath:"scripts/footprint-inverse-native-delete-cold-ui.cs",
 compilerMaxBytes:2*1024*1024,helperMaxBytes:2*1024*1024,reviewMaxBytes:2*1024*1024,
 nativeExecutionAuthorized:false,wholeInverseVerified:false,
}as const);
