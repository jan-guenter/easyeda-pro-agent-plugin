/** Independently born negative UI generation. These finite from-birth
 * reservations do not upgrade a historical cold owner or issue a call. */
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_COLD_UI_OPENING_BASE_PROFILE as HELD} from "./current-footprint-inverse-native-cold-ui-base-data.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_CONTROLLER_REQUESTS as CALL,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_PRIMITIVE_REQUESTS as PRIMITIVE,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_RECEIVER_REQUESTS as RECEIVER,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_SENDER_REQUESTS as SENDER,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_TOMBSTONE_REQUESTS as TOMBSTONE,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_WORKER_REQUESTS as WORKER} from "./current-footprint-inverse-native-delete-cold-ui-request-budgets.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

const sources={originalLease:1,assignmentReproofs:2,openingDelegates:2,tombstone:TOMBSTONE.cdpRequests,uiPrimitives:PRIMITIVE.cdpRequests,
 sender:SENDER.cdpRequests,managerWholeSource:1,receiver:RECEIVER.cdpRequests,workerPrimitives:PRIMITIVE.cdpRequests,worker:WORKER.cdpRequests,call:CALL.normal}as const;
const sourceTotal=Object.values(sources).reduce((sum,value)=>sum+value,0);
const normal=HELD.requests.startup+HELD.requests.parserConstruction+HELD.requests.initialState+HELD.requests.heldCacheNormal+sourceTotal;
const cleanup=HELD.cleanupRequestLimit+CALL.cleanup;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_PROFILE=freezeDeep({
 profile:"private.current-footprint-inverse-native-delete-cold-ui-profile.v1",
 purpose:HELD.purpose,nativePurpose:"footprint-inverse-native-delete-cold-ui209",
 nativeSwitch:"-FootprintInverseNativeDeleteColdUi209",nativeConstructor:"CreateFootprintInverseNativeDeleteColdUi209",
 normalRequestLimit:normal,cleanupRequestLimit:cleanup,requestLimit:normal+cleanup,normalIdCeiling:normal+cleanup,
 sourceCdpRequests:TOMBSTONE.cdpRequests+2*PRIMITIVE.cdpRequests+SENDER.cdpRequests+RECEIVER.cdpRequests+WORKER.cdpRequests+CALL.cdpRequests+1,
 requests:{startup:HELD.requests.startup,parserConstruction:HELD.requests.parserConstruction,initialState:HELD.requests.initialState,
 heldCacheNormal:HELD.requests.heldCacheNormal,sources,sourceTotal,cleanup},
 stateSampleLimit:HELD.stateSampleLimit,normalMilliseconds:HELD.normalMilliseconds,cleanupMilliseconds:HELD.cleanupMilliseconds,bytes:HELD.bytes,
 stageControls:{bind:1,workerPrimitives:1,tombstone:1,uiPrimitives:1,sender:1,receiver:1,worker:1,call:1},
 transactionClockRequests:0,parentChallengeRequests:0,createRequests:0,saveRequests:0,explicitSaveRequests:0,executionAuthorized:false,saveAuthorized:false,
}as const);
