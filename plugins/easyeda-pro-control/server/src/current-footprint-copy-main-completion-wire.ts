/** Unmounted original-main completion projection. The retained native channel
 * supplies its connection and allocator. Wire fields never carry executable
 * source, inspector sessions, conditions or caller-selected source locations. */
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { currentFootprintCopyMainCompletionNativeCommand, validateCurrentFootprintCopyMainCompletionCommand } from "./current-footprint-copy-main-completion-protocol.ts";
import type { CurrentFootprintCopyMainCompletionCommand as Command } from "./current-footprint-copy-main-completion-protocol.ts";

export function currentFootprintCopyMainCompletionWire(input: unknown, id: number): Readonly<{
  command: Command & Readonly<{ id: number }>; request: Readonly<Record<string, string | number>>;
}> {
  const command = validateCurrentFootprintCopyMainCompletionCommand(input);
  currentFootprintCopyMainCompletionNativeCommand(command, id);
  const request: Record<string, string | number> = { action: "main-completion-send", requestId: id, phase: command.phase, method: command.method };
  if (command.phase === "completion-source-arm") {
    request["phase"] = `completion-site-${command.stage}`;
    request["scriptId"] = command.params.location.scriptId;
  } else if (command.phase === "completion-frame") {
    request["phase"] = `completion-frame-${command.role}`;
    request["callFrameId"] = command.params.callFrameId;
  } else if (command.phase === "completion-join") {
    request["phase"] = `completion-join-${command.stage}`;
    request["objectId"] = command.params.objectId;
    for (const [index, argument] of command.params.arguments.entries()) { request[`argument${String(index)}`] = argument.objectId; }
  } else if (command.phase === "completion-callback-arm" || command.phase === "completion-properties") {
    request["objectId"] = command.params.objectId;
  } else if (command.phase === "completion-remove") { request["breakpointId"] = command.params.breakpointId; }
  const envelope = `${JSON.stringify({ helperInstance: "f".repeat(32), jobId: "f".repeat(32), rootPid: 4_294_967_295,
    rootCreated: "9".repeat(20), ...request, id: "f".repeat(32) })}\n`;
  if (Buffer.byteLength(envelope) > 32_768 || envelope.length >= 32_768) { throw new Error("FOOTPRINT_MAIN_COMPLETION_ENVELOPE_BYTES"); }
  return freezeDeep({ command: { ...command, id }, request });
}
