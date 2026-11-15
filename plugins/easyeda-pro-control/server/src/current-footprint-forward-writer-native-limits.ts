/** The separate full writer adds one fixed startup role to the old graph.
 * Its maintained SQL codebook is121707 bytes and the original stock ledger
 * is2606 bytes;128KiB covers those two emitted units and the closed routing
 * glue. No historical one-file or three-role limit changes. */
import { CURRENT_FOOTPRINT_FORWARD_COLD_NATIVE_GRAPH_LIMITS as PREVIOUS } from "./current-footprint-forward-cold-native-limits.ts";

export const CURRENT_FOOTPRINT_FORWARD_WRITER_NATIVE_GRAPH_LIMITS = Object.freeze({
  ...PREVIOUS, startup: 131_072, sync: 65_536,
  // The now-complete producer/cache role has its own64KiB reservation in
  // Addition to the old three-role envelope and the new128KiB startup role.
  aggregate: PREVIOUS.aggregate + 131_072 + 65_536 + 65_536,
  compiled: PREVIOUS.compiled + 131_072 + 65_536 + 65_536,
});
