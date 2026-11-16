/** New readonly successor envelope; historical saved363 remains unchanged.
 * These finite counters grant no original checkpoint, owner or open. */
import {CURRENT_FOOTPRINT_COPY_HELD_SAVED_PROFILE as HELD} from "./current-footprint-copy-held-saved-profile.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_GET_REQUESTS as GET} from "./current-footprint-inverse-native-delete-cold-get-protocol.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_OWN_DATA_REQUESTS as OWN} from "./current-footprint-inverse-native-delete-cold-own-data-protocol.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

const source = {reflection:OWN.cdpRequests,managerGet:GET.cdpRequests,originalLease:1,assignmentReproofs:2,openingDelegates:2} as const;
const sourceTotal=Object.values(source).reduce((total,value)=>total+value,0);
const normal=HELD.requests.startup+HELD.requests.parserConstruction+HELD.requests.initialState+HELD.requests.heldCacheNormal+sourceTotal;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_PROFILE=freezeDeep({
 profile:"private.current-footprint-inverse-native-delete-cold-profile.v1",
 purpose:HELD.purpose,nativeSwitch:"-FootprintInverseNativeDeleteCold209",
 nativeConstructor:"CreateFootprintInverseNativeDeleteCold209",
 normalRequestLimit:normal,cleanupRequestLimit:HELD.cleanupRequestLimit,requestLimit:normal+HELD.cleanupRequestLimit,
 normalIdCeiling:normal+HELD.cleanupRequestLimit,
 requests:{startup:HELD.requests.startup,parserConstruction:HELD.requests.parserConstruction,initialState:HELD.requests.initialState,
  heldCacheNormal:HELD.requests.heldCacheNormal,source,sourceTotal,cleanup:HELD.cleanupRequestLimit},
 stateSampleLimit:2,normalMilliseconds:HELD.normalMilliseconds,cleanupMilliseconds:HELD.cleanupMilliseconds,bytes:HELD.bytes,
 createRequests:0,transactionClockRequests:0,parentChallengeRequests:0,saveRequests:0,
 executionAuthorized:false,saveAuthorized:false,
} as const);
