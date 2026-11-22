/** V4-only exact Main joint formulas from immutable donor28d. These finite
 * counts issue no native owner and import no historical V3 profile. */
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_TAIL_REQUESTS as TAIL} from "./current-footprint-inverse-native-delete-main-tail-controller.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SEGMENTS_REQUESTS as SEGMENTS} from "./current-footprint-inverse-native-delete-segments-protocol.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_PREFIX as PREFIX} from "./current-footprint-inverse-native-delete-main-budget.ts";

export const CURRENT_FOOTPRINT_INVERSE_V4_MAIN_JOINT=Object.freeze({
 prefixDriverNormal:5,prefixDriverReaderReproofs:10,
 maximumPendingPollJoins:PREFIX.total+5+TAIL.total,
 extraNormal:5+TAIL.normal,extraCleanup:TAIL.cleanup,extraTotal:5+TAIL.total,
 extraReproofs:SEGMENTS.cdpRequests+2*(5+TAIL.total)+2*(5+TAIL.drivers.capture)+PREFIX.total+5+TAIL.total,
});
