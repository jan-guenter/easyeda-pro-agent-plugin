/** Known native DELETE Main prefix only. Natural post-sync/cache/HTTP calls
 * require their own complete source-derived successor before whole admission. */
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_REQUESTS as REQUEST}from "./current-footprint-inverse-native-delete-main-protocol.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_BEGIN_REQUESTS as BEGIN}from "./current-footprint-inverse-native-delete-main-begin-protocol.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_HISTORY_REQUESTS as HISTORY}from "./current-footprint-inverse-native-delete-main-history-protocol.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_PREFIX=Object.freeze({
 request:REQUEST,begin:BEGIN,history:HISTORY,requestSteps:3,selectedReadonly:9,preUpload:16,
 ownNormal:REQUEST.normal+3+BEGIN.normal+HISTORY.normal,cleanup:REQUEST.cleanup+BEGIN.cleanup+HISTORY.cleanup,
 normal:REQUEST.normal+3+BEGIN.normal+HISTORY.normal+9,
 total:REQUEST.total+3+BEGIN.total+HISTORY.total+9,
 postSyncReserved:false,cloudReserved:false,wholeInverseReserved:false,
});
