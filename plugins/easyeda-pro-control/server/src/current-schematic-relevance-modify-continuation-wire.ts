/** One fixed original-worker action carries separate guard and passive Event
 * vocabularies. Neither accepts caller code or chooses a native recipient. */
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { currentSchematicRelevanceModifyControlWire } from "./current-schematic-relevance-modify-control-wire.ts";
import type { CurrentSchematicRelevanceModifyControlCommand } from "./current-schematic-relevance-modify-control-protocol.ts";
import { currentSchematicRelevanceModifyEventWire } from "./current-schematic-relevance-modify-event-wire.ts";
import type { CurrentSchematicRelevanceModifyEventCommand } from "./current-schematic-relevance-modify-event-protocol.ts";

export type CurrentSchematicRelevanceModifyContinuationCommand = CurrentSchematicRelevanceModifyControlCommand | CurrentSchematicRelevanceModifyEventCommand;
/** Select a strict fixed codebook and retain its exact original request ID. */
export function currentSchematicRelevanceModifyContinuationWire(input: unknown, requestId: number): ReturnType<typeof currentSchematicRelevanceModifyControlWire> | ReturnType<typeof currentSchematicRelevanceModifyEventWire> {
  const value = captureCurrentPcbStringClockReply(input).value; if (value === null || typeof value !== "object" || Array.isArray(value)) { throw new TypeError("SCH_MODIFY_CONTINUATION_COMMAND"); }
  const phase: unknown = Reflect.get(value, "phase"); if (typeof phase !== "string") { throw new TypeError("SCH_MODIFY_CONTINUATION_PHASE"); }
  return phase.startsWith("modify-event-") ? currentSchematicRelevanceModifyEventWire(value, requestId) : currentSchematicRelevanceModifyControlWire(value, requestId);
}
