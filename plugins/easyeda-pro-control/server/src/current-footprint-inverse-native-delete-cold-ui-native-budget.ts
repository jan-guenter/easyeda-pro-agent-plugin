/** Immutable build projection of the complete TS ledger, not caller input. */
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_PROFILE as P} from "./current-footprint-inverse-native-delete-cold-ui-profile.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_CAPACITY as C} from "./current-footprint-inverse-native-delete-cold-ui-capacity.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_NATIVE_BUDGET=Object.freeze({
 requestLimit:P.requestLimit,normalRequestLimit:P.normalRequestLimit,cleanupRequestLimit:P.cleanupRequestLimit,
 normalMilliseconds:P.normalMilliseconds,cleanupMilliseconds:P.cleanupMilliseconds,
 controls:Object.freeze({normal:C.controls.normal,cleanup:C.controls.cleanup}),
 normalPolls:C.renderer.normalPolls,cleanupPolls:C.renderer.cleanupPolls,normalReceivedBytes:C.renderer.normalReceivedBytes,cleanupReceivedBytes:C.renderer.cleanupReceivedBytes,
 normalHelperStdoutBytes:C.normalHelperStdoutBytes,cleanupHelperStdoutBytes:C.cleanupHelperStdoutBytes,
 stages:Object.freeze({workerPrimitives:P.requests.sources.workerPrimitives,tombstone:P.requests.sources.tombstone,
 uiPrimitives:P.requests.sources.uiPrimitives,sender:P.requests.sources.sender,receiver:P.requests.sources.receiver+P.requests.sources.managerWholeSource,
 worker:P.requests.sources.worker,call:P.requests.sources.call,callCleanup:10}),
});
