/** Fixed allocation data only. The original native owner chooses the worker
 * session; this projection cannot select caller code, expressions or a realm. */
import { z } from "zod";
import { CURRENT_FOOTPRINT_COPY_ALLOCATION_FRAMES as FRAMES, validateCurrentFootprintCopyAllocationCommand } from "./current-footprint-copy-allocation-contract.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
export function currentFootprintCopyAllocationWire(input: unknown, id: number, originalWorkerSession: string): Readonly<{
  command: ReturnType<typeof validateCurrentFootprintCopyAllocationCommand> & Readonly<{ id: number }>;
  request: Readonly<Record<string, string | number>>;
}> {
  const command = validateCurrentFootprintCopyAllocationCommand(input);
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647 || !handle.max(128).safeParse(originalWorkerSession).success ||
    command.sessionId !== originalWorkerSession) { throw new Error("FOOTPRINT_ALLOCATION_WIRE_ORIGINAL"); }
  const request: Record<string, string | number> = { action: "footprint-copy-allocation-send", requestId: id, phase: command.phase, method: command.method };
  if (command.phase === "allocation-frame") {
    const selected = Object.entries(FRAMES).find(([, expression]) => expression === command.params.expression);
    if (selected === undefined) { throw new Error("FOOTPRINT_ALLOCATION_WIRE_FRAME"); }
    request["phase"] = `allocation-frame-${selected[0]}`; request["callFrameId"] = command.params.callFrameId;
  } else if (command.phase === "allocation-arm") { request["scriptId"] = command.params.location.scriptId; }
  else if (command.phase === "allocation-source") { request["scriptId"] = command.params.scriptId; }
  else if (command.phase === "allocation-join") {
    request["objectId"] = command.params.objectId;
    for (const [index, argument] of command.params.arguments.entries()) { request[`arg${String(index)}ObjectId`] = argument.objectId; }
  } else if (command.phase === "allocation-properties") { request["objectId"] = command.params.objectId; }
  else if (command.phase === "allocation-remove") { request["breakpointId"] = command.params.breakpointId; }
  const envelope = `${JSON.stringify({ helperInstance: "f".repeat(32), jobId: "f".repeat(32), rootPid: 4_294_967_295,
    rootCreated: "9".repeat(20), ...request, id: "f".repeat(32) })}\n`;
  if (Buffer.byteLength(envelope) > 32_768 || envelope.length >= 32_768) { throw new Error("FOOTPRINT_ALLOCATION_WIRE_ENVELOPE"); }
  return freezeDeep({ command: { ...command, id }, request });
}
