/** Fixed full-purpose startup syntax. Shared source templates supply no
 * inverse owner, caller program, timer identifier or resume authority. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { currentProjectSaveStructureNativeCases, validateCurrentProjectSaveStructureCommand } from "./current-project-save-structure-protocol.ts";
import { currentFootprintInverseStartupCallbackCases, validateCurrentFootprintInverseStartupCallbackCommand } from "./current-footprint-inverse-startup-callback-protocol.ts";
import { currentFootprintInverseStartupQueueCases, validateCurrentFootprintInverseStartupQueueCommand } from "./current-footprint-inverse-startup-queue-protocol.ts";
import { currentProjectSyncQuiesceNativeCases, validateCurrentProjectSyncQuiesceCommand } from "./current-project-sync-quiesce-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_CALLBACK_ROLES = Object.freeze(["startupEntry", "startupReturn", "initialFinally", "queuedFinally"] as const);
export type CurrentFootprintForwardWriterStartupCallbackRole = typeof CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_CALLBACK_ROLES[number];
const laneSchema = z.enum(["callback", "timer", "queue"]);
export type CurrentFootprintForwardWriterFrontierLane = z.infer<typeof laneSchema>;
const envelope = z.strictObject({ phase: z.literal("forward-startup-frontier"), lane: laneSchema, command: z.unknown() });
export type CurrentFootprintForwardWriterFrontierCommand = Readonly<{ phase: "forward-startup-frontier"; lane: CurrentFootprintForwardWriterFrontierLane;
  command: ReturnType<typeof validateCurrentProjectSaveStructureCommand> | ReturnType<typeof validateCurrentProjectSyncQuiesceCommand> | ReturnType<typeof validateCurrentFootprintInverseStartupQueueCommand> }>;
export type CurrentFootprintForwardWriterFrontierChannelCommand = CurrentFootprintForwardWriterFrontierCommand["command"] & Readonly<{ forwardStartupFrontier: CurrentFootprintForwardWriterFrontierLane }>;
/** A separate marker selects only the full channel's closed native encoder.
 * The original inner method/params retain the channel's reply accounting. */
export function currentFootprintForwardWriterFrontierChannelCommand(input: unknown): CurrentFootprintForwardWriterFrontierChannelCommand {
  const value = validateCurrentFootprintForwardWriterFrontierCommand(input); return freezeDeep({ ...value.command, forwardStartupFrontier: value.lane });
}
/** Include exactly the four owned startup points; their conditional source
 * guards keep ready callbacks outside this startup-only continuation. */
export function currentFootprintForwardWriterFrontierArms(): readonly ReturnType<typeof validateCurrentProjectSaveStructureCommand>[] {
  return currentProjectSaveStructureNativeCases().filter(command => command.phase === "project-save-structure-arm" && CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_CALLBACK_ROLES.some(role => role === command.role));
}
export function validateCurrentFootprintForwardWriterFrontierCommand(input: unknown): CurrentFootprintForwardWriterFrontierCommand {
  const value = envelope.parse(captureCurrentPcbStringClockReply(input).value);
  if (value.lane === "timer") { return freezeDeep({ ...value, command: validateCurrentProjectSyncQuiesceCommand(value.command) }); }
  if (value.lane === "queue") {
    const command = validateCurrentFootprintInverseStartupQueueCommand(value.command);
    if (command.phase === "inverse-startup-queue-helper") { throw new Error("FORWARD_WRITER_FRONTIER_QUEUE_HELPER_UNMOUNTED"); }
    return freezeDeep({ ...value, command });
  }
  const arm = captureCurrentPcbStringClockReply(value.command).value;
  if (arm !== null && typeof arm === "object" && Object.getOwnPropertyDescriptor(arm, "phase")?.value === "project-save-structure-arm") {
    const command = validateCurrentProjectSaveStructureCommand(arm);
    if (command.phase !== "project-save-structure-arm" || !CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_CALLBACK_ROLES.some(role => role === command.role)) { throw new Error("FORWARD_WRITER_FRONTIER_CALLBACK_ARM"); }
    return freezeDeep({ ...value, command });
  }
  const command = validateCurrentFootprintInverseStartupCallbackCommand(value.command);
  if (command.phase === "inverse-startup-callback-helper") { throw new Error("FORWARD_WRITER_FRONTIER_CALLBACK_HELPER_UNMOUNTED"); }
  return freezeDeep({ ...value, command });
}
/** Scalar-only fixed native fields. The exact full channel substitutes its
 * bound worker session/context; every program body remains in the codebook. */
export function currentFootprintForwardWriterFrontierTemplate(input: unknown): Readonly<{
  command: CurrentFootprintForwardWriterFrontierCommand; lane: CurrentFootprintForwardWriterFrontierLane; phase: string; method: string;
  fields: readonly string[]; values: Readonly<Record<string, string>>; template: string;
}> {
  const selected = validateCurrentFootprintForwardWriterFrontierCommand(input); const command = selected.command, values: Record<string, string> = {};
  const field = (name: string, value: string): string => { if (Object.hasOwn(values, name)) { throw new Error("FORWARD_WRITER_FRONTIER_FIELD_ALIAS"); } values[name] = value; return `__fwf_${name}__`; };
  const params: Record<string, unknown> = { ...command.params };
  if (command.method === "Debugger.setBreakpoint") { params["location"] = { ...command.params.location, scriptId: field("scriptId", command.params.location.scriptId) }; }
  else if (command.method === "Debugger.evaluateOnCallFrame") { params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if (command.method === "Debugger.removeBreakpoint") { params["breakpointId"] = field("breakpointId", command.params.breakpointId); }
  else if (command.method === "Runtime.callFunctionOn" || command.method === "Runtime.getProperties") {
    if ("uniqueContextId" in command.params) { params["uniqueContextId"] = "__fwf_boundContext__"; }
    else { params["objectId"] = field("objectId", command.params.objectId); }
  }
  if (command.method === "Runtime.callFunctionOn") { params["arguments"] = command.params.arguments.map((argument, index) => ({ objectId: field(`argument${String(index)}`, argument.objectId) })); }
  let suffix: string | null = null; if ("role" in command) { suffix = command.role; } else if ("index" in command) { suffix = String(command.index); }
  return freezeDeep({ command: selected, lane: selected.lane, phase: command.phase + (suffix === null ? "" : `-${suffix}`), method: command.method,
    fields: Object.keys(values), values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentFootprintForwardWriterFrontierCases(): readonly CurrentFootprintForwardWriterFrontierCommand[] {
  const callback = [...currentFootprintForwardWriterFrontierArms(), ...currentFootprintInverseStartupCallbackCases().filter(command => command.phase !== "inverse-startup-callback-helper")];
  const rows = [ ...callback.map(command => ({ phase: "forward-startup-frontier", lane: "callback", command })),
    ...currentProjectSyncQuiesceNativeCases().map(command => ({ phase: "forward-startup-frontier", lane: "timer", command })),
    ...currentFootprintInverseStartupQueueCases().filter(command => command.phase !== "inverse-startup-queue-helper").map(command => ({ phase: "forward-startup-frontier", lane: "queue", command })) ];
  return freezeDeep(rows.map(value => validateCurrentFootprintForwardWriterFrontierCommand(value)));
}
