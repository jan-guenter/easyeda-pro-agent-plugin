/** One original pending Modify owns all Echo observations and transfers.
 * Each member still passes its own immutable protocol before encoding. */
import { currentSchematicRelevanceModifyCanvasSendWire } from "./current-schematic-relevance-modify-canvas-send-wire.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { currentSchematicRelevanceModifyEchoWire } from "./current-schematic-relevance-modify-echo-wire.ts";
import { currentSchematicRelevanceModifyEchoEventWire } from "./current-schematic-relevance-modify-echo-event-wire.ts";
import { currentSchematicRelevanceModifyEchoCompletionWire } from "./current-schematic-relevance-modify-echo-completion-wire.ts";
import { currentSchematicRelevanceModifyEchoControlWire } from "./current-schematic-relevance-modify-echo-control-wire.ts";
import { currentSchematicRelevancePublicationWire } from "./current-schematic-relevance-publication-wire.ts";
import { currentSchematicRelevanceModifyCanvasControlWire } from "./current-schematic-relevance-modify-canvas-control-wire.ts";
import { validateCurrentSchematicRelevanceModifyCanvasControlCommand } from "./current-schematic-relevance-modify-canvas-control-protocol.ts";

type Wire = ReturnType<typeof currentSchematicRelevanceModifyCanvasSendWire> | ReturnType<typeof currentSchematicRelevanceModifyEchoWire> | ReturnType<typeof currentSchematicRelevanceModifyEchoEventWire> | ReturnType<typeof currentSchematicRelevanceModifyEchoCompletionWire> | ReturnType<typeof currentSchematicRelevanceModifyEchoControlWire> | ReturnType<typeof currentSchematicRelevancePublicationWire> | ReturnType<typeof currentSchematicRelevanceModifyCanvasControlWire>;
export type CurrentSchematicRelevanceModifyEchoContinuationCommand = Wire["command"];
/** Choose only a fixed passive book or the original finite transfer grammar.
 * Earlier Canvas setup/body roles cannot be replayed through this route. */
export function currentSchematicRelevanceModifyEchoContinuationWire(input: unknown, requestId: number): Readonly<{ command: CurrentSchematicRelevanceModifyEchoContinuationCommand; request: Readonly<Record<string, string | number>> }> {
  const value = captureCurrentPcbStringClockReply(input).value;
  if (value === null || typeof value !== "object" || Array.isArray(value)) { throw new TypeError("SCH_ECHO_CONTINUATION_COMMAND"); }
  const phase: unknown = Reflect.get(value, "phase"); if (typeof phase !== "string") { throw new TypeError("SCH_ECHO_CONTINUATION_PHASE"); }
  let wire: Wire;
  if (phase.startsWith("modify-canvas-send-")) { wire = currentSchematicRelevanceModifyCanvasSendWire(value, requestId); }
  else if (phase.startsWith("modify-echo-control-")) { wire = currentSchematicRelevanceModifyEchoControlWire(value, requestId); }
  else if (phase.startsWith("modify-echo-event-")) { wire = currentSchematicRelevanceModifyEchoEventWire(value, requestId); }
  else if (phase.startsWith("modify-echo-completion-")) { wire = currentSchematicRelevanceModifyEchoCompletionWire(value, requestId); }
  else if (phase.startsWith("modify-echo-")) { wire = currentSchematicRelevanceModifyEchoWire(value, requestId); }
  else if (phase.startsWith("publication-")) { wire = currentSchematicRelevancePublicationWire(value, requestId); }
  else {
    const command = validateCurrentSchematicRelevanceModifyCanvasControlCommand(value);
    if (command.phase !== "modify-canvas-control-remove" && (!(command.phase === "modify-canvas-control-frame" || command.phase === "modify-canvas-control-resume") || command.role !== "timer" && command.role !== "timerReturned")) { throw new Error("SCH_ECHO_CANVAS_FINITE_TAIL"); }
    wire = currentSchematicRelevanceModifyCanvasControlWire(command, requestId);
  }
  return Object.freeze({ command: wire.command, request: Object.freeze({ ...wire.request, action: "schematic-relevance-modify-echo" }) });
}
