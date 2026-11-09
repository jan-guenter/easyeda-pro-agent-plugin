/** Exact additional observation/control reservations for the two original
 * streams. These are upper bounds, never proof that a source body completed. */
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_REQUESTS as PREPARE } from "./current-schematic-relevance-modify-echo-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_EVENT_REQUESTS as EVENT } from "./current-schematic-relevance-modify-echo-event-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_COMPLETION_REQUESTS as COMPLETE } from "./current-schematic-relevance-modify-echo-completion-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CONTROL_REQUESTS as CONTROL } from "./current-schematic-relevance-modify-echo-control-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_CONTROL_REQUESTS as PUBLICATION } from "./current-schematic-relevance-publication-control-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_SEND_REQUESTS as SEND } from "./current-schematic-relevance-modify-canvas-send-protocol.ts";

const uiReads = PREPARE.reads + EVENT.eventReads + EVENT.receiverReads + COMPLETE.reads + 2 * PUBLICATION.perStage + 64;
const workerReads = SEND.reads;
const controls = 7 + CONTROL.guards;
const canvasTail = 8 + 2 + 3;
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_LIFECYCLE_REQUESTS = Object.freeze({
  uiReads, uiHelpers: uiReads, workerReads, workerHelpers: workerReads + CONTROL.captures + CONTROL.setup + 2, controls,
  controlRequests: CONTROL.total + canvasTail,
  total: uiReads * 2 + workerReads * 2 + CONTROL.captures + CONTROL.setup + 2 + controls + CONTROL.total + canvasTail,
} as const);
