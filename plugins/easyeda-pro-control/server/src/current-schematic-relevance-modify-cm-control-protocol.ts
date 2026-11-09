/** Fixed guards around the one original worker CM update. This command book
 * does not select an owner, supply a callee or issue a worker/Save grant. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CALLEE_SOURCE as CM } from "./current-schematic-relevance-modify-cm-callee-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_STRUCTURE_SOURCE as STRUCTURE } from "./current-schematic-relevance-modify-structure-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_TICKET_SOURCE as TICKET } from "./current-schematic-relevance-modify-ticket-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_TICKET_CANCEL_PROGRAM as CANCEL } from "./current-schematic-relevance-modify-ticket-control-program.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_KINDS = Object.freeze(["remote", "onChange", "ticket", "canWs"] as const);
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_ROLES = Object.freeze(["remote", "onChange", "ticket", "ticketReturned", "canWs", "canWsReturned", "remoteReturned"] as const);
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_RETURN_KINDS = Object.freeze(["remote", "ticket", "canWs"] as const);
export type CurrentSchematicRelevanceModifyCmControlKind = typeof CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_KINDS[number];
export type CurrentSchematicRelevanceModifyCmControlRole = typeof CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_ROLES[number];
export type CurrentSchematicRelevanceModifyCmControlReturnKind = typeof CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_RETURN_KINDS[number];

/** Setup and event reservations are finite and independent of the old
 * eight-record startup structure budget. Parent events retain their original
 * worker-controller reservation; only the seven nested CM pairs are new. */
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_REQUESTS = Object.freeze({
  setup: CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_RETURN_KINDS.length * 2 + CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_KINDS.length,
  captures: CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_ROLES.length + 1,
  removals: CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_ROLES.length,
  resumes: CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_ROLES.length,
  parentResumes: 3, parentCaptures: 2, parentRemovals: 4,
  events: CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_ROLES.length * 2,
  cancellations: 1,
  helpers: CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_ROLES.length + 2,
  total: CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_RETURN_KINDS.length * 2 + CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_KINDS.length + CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_ROLES.length * 6 + 4,
} as const);

/** Function starts come from the exact uninvoked source metadata. Entry and
 * return points were observed with source-preserving local V8 fixtures. */
export function currentSchematicRelevanceModifyCmControlFunctionPoint(kind: CurrentSchematicRelevanceModifyCmControlKind): Readonly<{ lineNumber: number; columnNumber: number }> {
  if (kind === "remote") { return Object.freeze({ lineNumber: CM.roles.remoteChange.lineNumber, columnNumber: CM.roles.remoteChange.columnNumber }); }
  if (kind === "onChange") { return Object.freeze({ lineNumber: STRUCTURE.onChange.lineNumber, columnNumber: STRUCTURE.onChange.columnNumber }); }
  const row = kind === "ticket" ? TICKET.localPublishTicket : TICKET.canWsPublish;
  return Object.freeze({ lineNumber: row.functionLineNumber, columnNumber: row.functionColumnNumber });
}
/** Select a single fixed original entry/normal-return boundary. No caller can
 * round a source coordinate or choose the earlier private/history return. */
export function currentSchematicRelevanceModifyCmControlPoint(role: CurrentSchematicRelevanceModifyCmControlRole): Readonly<{ lineNumber: number; columnNumber: number }> {
  const points = { remote: [17, 1428], onChange: [110, 91_378], ticket: [110, 93_968], ticketReturned: [110, 94_333], canWs: [110, 94_349], canWsReturned: [110, 94_411], remoteReturned: [17, 4036] } as const;
  const value = points[role]; return Object.freeze({ lineNumber: value[0], columnNumber: value[1] });
}
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_FRAMES = freezeDeep({
  remote: "[this,e,t,s,r,i,n,a,o,c,l,u,h,p,d,m,At,EE]", remoteReturned: "[this,e,t,s,r,i,n,a,o,c,l,u,h,p,d,m,At,EE]",
  onChange: "[this,n,a,o,c,l,u,h,p,d,m,f,g,y]", ticket: "[this,s]", ticketReturned: "[this,s]", canWs: "[this,jr]", canWsReturned: "[this,jr]", batchCaller: "[this,s]",
} as const);
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_FLAGS = Object.freeze({ objectGroup: "easyeda-schematic-relevance-modify-cm-control-v1", silent: true, generatePreview: false, throwOnSideEffect: true } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const kind = z.enum(CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_KINDS);
const role = z.enum(CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_ROLES);
const returnKind = z.enum(CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_RETURN_KINDS);
const empty = z.strictObject({});
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const possibleParams = z.strictObject({ start: point, end: point, restrictToFunction: z.literal(true) });
const returnParams = z.strictObject({ location: point, condition: z.literal("") });
const functionParams = z.strictObject({ objectId: handle, condition: z.literal("") });
const frameRoles = z.enum([...CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_ROLES, "batchCaller"]);
const frameParams = z.strictObject({ ...flags, callFrameId: handle, expression: z.string().max(128), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) });
const cancelParams = z.strictObject({ ...flags, throwOnSideEffect: z.literal(false), objectId: handle, functionDeclaration: z.literal(CANCEL), arguments: z.array(z.strictObject({ objectId: handle })).length(4), returnByValue: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) });
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("modify-cm-control-possible"), kind: returnKind, method: z.literal("Debugger.getPossibleBreakpoints"), params: possibleParams }),
  z.strictObject({ phase: z.literal("modify-cm-control-return"), kind: returnKind, method: z.literal("Debugger.setBreakpoint"), params: returnParams }),
  z.strictObject({ phase: z.literal("modify-cm-control-function"), kind, method: z.literal("Debugger.setBreakpointOnFunctionCall"), params: functionParams }),
  z.strictObject({ phase: z.literal("modify-cm-control-frame"), role: frameRoles, method: z.literal("Debugger.evaluateOnCallFrame"), params: frameParams }),
  z.strictObject({ phase: z.literal("modify-cm-control-remove"), role, method: z.literal("Debugger.removeBreakpoint"), params: z.strictObject({ breakpointId: handle }) }),
  z.strictObject({ phase: z.literal("modify-cm-control-resume"), role, method: z.literal("Debugger.resume"), params: empty }),
  z.strictObject({ phase: z.literal("modify-cm-control-batch-frame"), role: z.enum(["batchReturned", "handlerReturned"]), method: z.literal("Debugger.evaluateOnCallFrame"), params: frameParams }),
  z.strictObject({ phase: z.literal("modify-cm-control-batch-remove"), role: z.enum(["handler", "batch", "batchReturned", "handlerReturned"]), method: z.literal("Debugger.removeBreakpoint"), params: z.strictObject({ breakpointId: handle }) }),
  z.strictObject({ phase: z.literal("modify-cm-control-cancel-ticket"), method: z.literal("Runtime.callFunctionOn"), params: cancelParams }),
  z.strictObject({ phase: z.literal("modify-cm-control-batch-resume"), role: z.enum(["batch", "batchReturned", "handlerReturned"]), method: z.literal("Debugger.resume"), params: empty }),
]);
export type CurrentSchematicRelevanceModifyCmControlCommand = Readonly<z.infer<typeof schema>>;

/** Copy descriptor-safe input and accept only this source-owned finite book.
 * Original callee/point/event custody remains with Core and its controller. */
export function validateCurrentSchematicRelevanceModifyCmControlCommand(input: unknown): CurrentSchematicRelevanceModifyCmControlCommand {
  const command = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.phase === "modify-cm-control-batch-frame" && command.params.expression !== "[this,s]") { throw new Error("SCH_MODIFY_CM_CONTROL_PARENT_FRAME"); }
  if (command.phase === "modify-cm-control-frame" && command.params.expression !== CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_FRAMES[command.role]) { throw new Error("SCH_MODIFY_CM_CONTROL_FRAME"); }
  if (command.phase === "modify-cm-control-possible" || command.phase === "modify-cm-control-return") {
    let returned: CurrentSchematicRelevanceModifyCmControlRole = "canWsReturned";
    if (command.kind === "remote") { returned = "remoteReturned"; }
    if (command.kind === "ticket") { returned = "ticketReturned"; }
    const end = currentSchematicRelevanceModifyCmControlPoint(returned);
    if (command.phase === "modify-cm-control-return") {
      if (command.params.location.lineNumber !== end.lineNumber || command.params.location.columnNumber !== end.columnNumber) { throw new Error("SCH_MODIFY_CM_CONTROL_RETURN"); }
    } else {
      const start = currentSchematicRelevanceModifyCmControlFunctionPoint(command.kind);
      if (command.params.start.scriptId !== command.params.end.scriptId || command.params.start.lineNumber !== start.lineNumber || command.params.start.columnNumber !== start.columnNumber || command.params.end.lineNumber !== end.lineNumber || command.params.end.columnNumber !== end.columnNumber + 1) { throw new Error("SCH_MODIFY_CM_CONTROL_POSSIBLE"); }
    }
  }
  return freezeDeep(command);
}
