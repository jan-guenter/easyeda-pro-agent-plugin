/** One original CM action carries three closed codebooks. The discriminator
 * selects immutable syntax only and confers no worker continuation authority. */
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { currentSchematicRelevanceModifyCmWire } from "./current-schematic-relevance-modify-cm-wire.ts";
import type { CurrentSchematicRelevanceModifyCmCommand } from "./current-schematic-relevance-modify-cm-protocol.ts";
import { currentSchematicRelevanceModifyCmControlWire } from "./current-schematic-relevance-modify-cm-control-wire.ts";
import type { CurrentSchematicRelevanceModifyCmControlCommand } from "./current-schematic-relevance-modify-cm-control-protocol.ts";
import { currentSchematicRelevanceModifyCmDeltaWire } from "./current-schematic-relevance-modify-cm-delta-wire.ts";
import type { CurrentSchematicRelevanceModifyCmDeltaCommand } from "./current-schematic-relevance-modify-cm-delta-protocol.ts";

export type CurrentSchematicRelevanceModifyCmContinuationCommand = CurrentSchematicRelevanceModifyCmCommand | CurrentSchematicRelevanceModifyCmControlCommand | CurrentSchematicRelevanceModifyCmDeltaCommand;
/** Capture the command before reading its phase, then require the complete
 * selected schema, fixed program, role and result mode in its own encoder. */
export function currentSchematicRelevanceModifyCmContinuationWire(input: unknown, requestId: number): ReturnType<typeof currentSchematicRelevanceModifyCmWire> | ReturnType<typeof currentSchematicRelevanceModifyCmControlWire> | ReturnType<typeof currentSchematicRelevanceModifyCmDeltaWire> {
 const value = captureCurrentPcbStringClockReply(input).value;
 if (typeof value !== "object" || value === null || Array.isArray(value)) { throw new TypeError("SCH_MODIFY_CM_COMMAND"); }
 const phase: unknown = Reflect.get(value, "phase"); if (typeof phase !== "string") { throw new TypeError("SCH_MODIFY_CM_PHASE"); }
 if (phase.startsWith("modify-cm-control-")) { return currentSchematicRelevanceModifyCmControlWire(value, requestId); }
 if (phase.startsWith("modify-cm-delta-")) { return currentSchematicRelevanceModifyCmDeltaWire(value, requestId); }
 return currentSchematicRelevanceModifyCmWire(value, requestId);
}
