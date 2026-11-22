/** Separately named writer source birth. Every reserved read derives from a
 * completed finite codec/cursor; no missing setter/worker/Save count is guessed.
 * Tail mutation issuance remains unavailable until its own full composition. */
import { CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PROFILE as BASE } from "./current-schematic-display-write-native-profile.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_SAVE_STRUCTURE_REQUESTS as STRUCTURE } from "./current-project-save-structure-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_ACCESSOR_REQUESTS as ACCESSOR } from "./current-schematic-wire-accessor-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_LEXICAL_REQUESTS as LEXICAL } from "./current-schematic-wire-lexical-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_INTENT_REQUESTS as INTENT } from "./current-schematic-wire-intent-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_DEPENDENCY_REQUESTS as DEPENDENCY } from "./current-schematic-wire-dependencies-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_PREFIX_REQUESTS as PREFIX } from "./current-schematic-wire-prefix-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_WRITER_ACTIVE_REQUESTS as ACTIVE, CURRENT_SCHEMATIC_WIRE_WRITER_RAW_REQUESTS as RAW } from "./current-schematic-wire-writer-protocol.ts";

const metadata = ACCESSOR.total + LEXICAL.total + INTENT.total + DEPENDENCY.total;
export const CURRENT_SCHEMATIC_WIRE_WRITER_V4_NATIVE_PURPOSE = "schematic-wire-writer-v4-209";
export const CURRENT_SCHEMATIC_WIRE_WRITER_V4_NATIVE_PROFILE = Object.freeze({
  purpose: CURRENT_SCHEMATIC_WIRE_WRITER_V4_NATIVE_PURPOSE, nativeSwitch: "-SchematicWireWriterV4",
  main: Object.freeze({ ...BASE.main }),
  renderer: Object.freeze({ ...BASE.renderer, structureObservation: STRUCTURE.cdpRequests, accessorObservation: metadata,
    rawObservation: RAW.rawObservation, prefixObservation: PREFIX.total, activeObservation: ACTIVE.total,
    total: BASE.renderer.total - BASE.renderer.accessorObservation - BASE.renderer.structureObservation + metadata + STRUCTURE.cdpRequests + RAW.rawObservation + PREFIX.total + ACTIVE.total }),
  originalTailReservationComplete: false, executionAuthorized: false, saveAuthorized: false, persistenceVerified: false,
});
