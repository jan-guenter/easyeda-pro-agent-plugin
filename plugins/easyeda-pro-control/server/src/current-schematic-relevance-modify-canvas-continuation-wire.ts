/** The original Canvas action selects fixed syntax only. Its sole CM row is
 * the already-held onChange continuation; no other CM body can use this wire. */
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { currentSchematicRelevanceModifyCanvasWire } from "./current-schematic-relevance-modify-canvas-wire.ts";
import type { CurrentSchematicRelevanceModifyCanvasCommand } from "./current-schematic-relevance-modify-canvas-protocol.ts";
import { currentSchematicRelevanceModifyCanvasControlWire } from "./current-schematic-relevance-modify-canvas-control-wire.ts";
import type { CurrentSchematicRelevanceModifyCanvasControlCommand } from "./current-schematic-relevance-modify-canvas-control-protocol.ts";
import { currentSchematicRelevanceModifyCmControlWire } from "./current-schematic-relevance-modify-cm-control-wire.ts";
import { validateCurrentSchematicRelevanceModifyCmControlCommand } from "./current-schematic-relevance-modify-cm-control-protocol.ts";
import type { CurrentSchematicRelevanceModifyCmControlCommand } from "./current-schematic-relevance-modify-cm-control-protocol.ts";

export type CurrentSchematicRelevanceModifyCanvasContinuationCommand = CurrentSchematicRelevanceModifyCanvasCommand | CurrentSchematicRelevanceModifyCanvasControlCommand | Extract<CurrentSchematicRelevanceModifyCmControlCommand, { phase: "modify-cm-control-resume" }>;
/** Capture before inspecting the discriminator, then validate every field
 * through its fixed encoder. The original native ledger grants each transfer. */
export function currentSchematicRelevanceModifyCanvasContinuationWire(input: unknown, requestId: number): Readonly<{ command: CurrentSchematicRelevanceModifyCanvasContinuationCommand; request: Readonly<Record<string, string | number>> }> {
 const value = captureCurrentPcbStringClockReply(input).value;
 if (typeof value !== "object" || value === null || Array.isArray(value)) { throw new TypeError("SCH_MODIFY_CANVAS_COMMAND"); }
 const phase: unknown = Reflect.get(value, "phase"); if (typeof phase !== "string") { throw new TypeError("SCH_MODIFY_CANVAS_PHASE"); }
 if (phase === "modify-cm-control-resume") { const command = validateCurrentSchematicRelevanceModifyCmControlCommand(value); if (command.phase !== phase || command.role !== "onChange") { throw new Error("SCH_MODIFY_CANVAS_PARENT_ROLE"); } const wire = currentSchematicRelevanceModifyCmControlWire(command, requestId); return { command, request: { ...wire.request, action: "schematic-relevance-modify-canvas" } }; }
 if (phase.startsWith("modify-canvas-control-")) { return currentSchematicRelevanceModifyCanvasControlWire(value, requestId); }
 return currentSchematicRelevanceModifyCanvasWire(value, requestId);
}
