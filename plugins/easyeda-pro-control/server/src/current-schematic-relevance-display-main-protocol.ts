import { types } from "node:util";
/** Fixed Main syntax only. Reusing these encoders does not call a Via sender
 * or populate a Via origin registry. Every native action is seven-record-only. */
import { currentPcbViaMainWire, validateCurrentPcbViaMainCommand } from "./current-pcb-via-main-protocol.ts";
import type { CurrentPcbViaMainCommand } from "./current-pcb-via-main-protocol.ts";
import { currentPcbViaMainStepWire, validateCurrentPcbViaMainStepCommand } from "./current-pcb-via-main-step-protocol.ts";
import type { CurrentPcbViaMainStepCommand } from "./current-pcb-via-main-step-protocol.ts";
import { currentPcbViaMainBeginWire } from "./current-pcb-via-main-begin-wire.ts";
import { validateCurrentPcbViaMainBeginCommand } from "./current-pcb-via-main-begin-protocol.ts";
import type { CurrentPcbViaMainBeginCommand } from "./current-pcb-via-main-begin-protocol.ts";
import { currentPcbViaMainHistoryWire } from "./current-pcb-via-main-history-wire.ts";
import { validateCurrentPcbViaMainHistoryCommand } from "./current-pcb-via-main-history-protocol.ts";
import type { CurrentPcbViaMainHistoryCommand } from "./current-pcb-via-main-history-protocol.ts";

export type CurrentSchematicRelevanceDisplayMainCommand = CurrentPcbViaMainCommand | CurrentPcbViaMainStepCommand | CurrentPcbViaMainBeginCommand | CurrentPcbViaMainHistoryCommand;
export function currentSchematicRelevanceDisplayMainWire(input: unknown, id: number): Readonly<Record<string, string | number>> {
  if (input === null || typeof input !== "object" || types.isProxy(input)) { throw new Error("RELEVANCE_MAIN_COMMAND"); }
  const descriptor = Object.getOwnPropertyDescriptor(input, "phase");
  if (descriptor === undefined || !("value" in descriptor) || typeof descriptor.value !== "string") { throw new Error("RELEVANCE_MAIN_COMMAND_PHASE"); }
  const phase = descriptor.value;
  if (phase.startsWith("via-main-history-")) { return Object.freeze({ ...currentPcbViaMainHistoryWire(validateCurrentPcbViaMainHistoryCommand(input), id).request, action: "schematic-relevance-display-main-history" }); }
  if (phase.startsWith("via-main-begin-")) { return Object.freeze({ ...currentPcbViaMainBeginWire(validateCurrentPcbViaMainBeginCommand(input), id).request, action: "schematic-relevance-display-main-begin" }); }
  if (["via-main-driver-step", "via-main-context-step", "via-main-controller-step"].includes(phase)) { return Object.freeze({ ...currentPcbViaMainStepWire(validateCurrentPcbViaMainStepCommand(input), id), action: "schematic-relevance-display-main-step" }); }
  return Object.freeze({ ...currentPcbViaMainWire(validateCurrentPcbViaMainCommand(input), id).request, action: "schematic-relevance-display-main-observe" });
}
