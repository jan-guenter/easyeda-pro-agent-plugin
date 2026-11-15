/** Separate complete graph envelope. The old six-role graph and its file,
 * aggregate, compiler and bootstrap limits are unchanged. The new tail has a
 * 128KiB role; its seven-file loader is17,516 encoded characters at the
 * private validation path and has a separate20,000-character ceiling, below
 * the Windows command-line limit. Legacy six-file bootstrap remains16,000.
 * The fixed timer unit has its own32KiB aggregate/compiler reservation inside
 * the unchanged one-MiB core role. Exact emitted bytes and hashes remain pinned. */
import {CURRENT_FOOTPRINT_FORWARD_WRITER_NATIVE_GRAPH_LIMITS as PREVIOUS} from "./current-footprint-forward-writer-native-limits.ts";

const timerSource=32_768;
export const CURRENT_FOOTPRINT_FORWARD_WRITER_COMPLETE_NATIVE_GRAPH_LIMITS=Object.freeze({...PREVIOUS,tail:131_072,timerSource,bootstrapEncoded:20_000,aggregate:PREVIOUS.aggregate+131_072+timerSource,compiled:PREVIOUS.compiled+131_072+timerSource});
