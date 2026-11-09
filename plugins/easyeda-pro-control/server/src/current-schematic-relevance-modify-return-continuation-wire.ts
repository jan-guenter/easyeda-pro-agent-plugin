/** The remaining original CM/parent controls retain their existing exact
 * codebook. This purpose wrapper selects no owner or arbitrary new control. */
import { currentSchematicRelevanceModifyCanvasControlWire } from "./current-schematic-relevance-modify-canvas-control-wire.ts";
import type { CurrentSchematicRelevanceModifyCanvasControlCommand } from "./current-schematic-relevance-modify-canvas-control-protocol.ts";
import { validateCurrentSchematicRelevanceModifyCanvasControlCommand } from "./current-schematic-relevance-modify-canvas-control-protocol.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { currentSchematicRelevanceModifyReturnWire } from "./current-schematic-relevance-modify-return-wire.ts";
import type { CurrentSchematicRelevanceModifyReturnCommand } from "./current-schematic-relevance-modify-return-protocol.ts";
import { currentSchematicRelevanceModifyCmControlWire } from "./current-schematic-relevance-modify-cm-control-wire.ts";
import { validateCurrentSchematicRelevanceModifyCmControlCommand } from "./current-schematic-relevance-modify-cm-control-protocol.ts";
import type { CurrentSchematicRelevanceModifyCmControlCommand } from "./current-schematic-relevance-modify-cm-control-protocol.ts";

export type CurrentSchematicRelevanceModifyReturnContinuationCommand = CurrentSchematicRelevanceModifyReturnCommand | CurrentSchematicRelevanceModifyCmControlCommand | CurrentSchematicRelevanceModifyCanvasControlCommand;
/** Accept only the original later CM/parent frame, removal, cancellation and
 * resume rows. Setup, the spent remote/onChange entries and batch resume refuse. */
export function currentSchematicRelevanceModifyReturnContinuationWire(input: unknown, requestId: number): Readonly<{ command: CurrentSchematicRelevanceModifyReturnContinuationCommand; request: Readonly<Record<string, string | number>> }> {
 const value = captureCurrentPcbStringClockReply(input).value; if (typeof value !== "object" || value === null || Array.isArray(value)) { throw new TypeError("SCH_MODIFY_RETURN_COMMAND"); }
 const phase: unknown = Reflect.get(value, "phase"); if (typeof phase !== "string") { throw new TypeError("SCH_MODIFY_RETURN_PHASE"); }
 if (phase.startsWith("modify-canvas-control-")) { const command = validateCurrentSchematicRelevanceModifyCanvasControlCommand(value); if (command.phase !== "modify-canvas-control-frame" || command.role !== "timer") { throw new Error("SCH_MODIFY_RETURN_TIMER_HELD"); } const wire = currentSchematicRelevanceModifyCanvasControlWire(command, requestId); return { command: wire.command, request: { ...wire.request, action: "schematic-relevance-modify-return" } }; }
 if (!phase.startsWith("modify-cm-control-")) { return currentSchematicRelevanceModifyReturnWire(value, requestId); }
 const command = validateCurrentSchematicRelevanceModifyCmControlCommand(value); let allowed = false;
 if (command.phase === "modify-cm-control-frame") { allowed = ["ticket", "ticketReturned", "canWs", "canWsReturned", "remoteReturned", "onChange"].includes(command.role); }
 else if (command.phase === "modify-cm-control-resume") { allowed = ["ticket", "ticketReturned", "canWs", "canWsReturned", "remoteReturned"].includes(command.role); }
 else if (command.phase === "modify-cm-control-batch-resume") { allowed = command.role === "batchReturned" || command.role === "handlerReturned"; }
 else { allowed = command.phase === "modify-cm-control-remove" || command.phase === "modify-cm-control-cancel-ticket" || command.phase === "modify-cm-control-batch-frame" || command.phase === "modify-cm-control-batch-remove"; }
 if (!allowed) { throw new Error("SCH_MODIFY_RETURN_CONTROL_ROLE"); } const wire = currentSchematicRelevanceModifyCmControlWire(command, requestId);
 return { command: wire.command, request: { ...wire.request, action: "schematic-relevance-modify-return" } };
}
