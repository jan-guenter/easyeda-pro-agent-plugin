/** Local native phase capacity only. The extra source read is reserved here;
 * complete owner reproof, main/saved and four-generation budgets remain absent. */
import { CURRENT_FOOTPRINT_COPY_MAIN_KNOWN_CAPACITY as MAIN } from "./current-footprint-copy-main-capacity.ts";

/** Complete fixed main construction/request/completion schedule on one
 * physical cursor. This capacity grants no clock, create or whole writer. */
export const CURRENT_FOOTPRINT_FORWARD_NATIVE_MAIN_LIMITS = Object.freeze({
  normalRequestLimit: MAIN.minimumNormal, cleanupRequestLimit: MAIN.minimumCleanup, requestLimit: MAIN.minimumTotal,
});
export const CURRENT_FOOTPRINT_FORWARD_NATIVE_LIMITS = Object.freeze({
  normalClass: 942, cleanupClass: 61, requestLimit: 1003,
  registration: 39, rpcNormal: 49, rpcCleanup: 18, rpcTotal: 67,
  normalMilliseconds: 3_600_000, totalMilliseconds: 3_660_000,
  wholeWriterReserved: false, executionAuthorized: false,
});
/** Fixed artifact graph bounds are distinct from native request capacity and
 * the unchanged legacy one-file ceiling. All three exact roles are mandatory. */
export const CURRENT_FOOTPRINT_FORWARD_NATIVE_GRAPH_LIMITS = Object.freeze({
  file: 1_048_576, driver: 131_072, core: 1_048_576, phase: 65_536,
  // Exact legacy artifact plus at most two 16 KiB new codecs and 38,350 bytes of
  // Reviewed driver/phase glue. Exact emitted byte counts are pinned as well.
  aggregate: 1_114_112, compiled: 1_048_576, bootstrapEncoded: 16_000,
});
