/** Own inverse transport for the immutable first-timer leaf and its original
 * generated source receipts. No timer identifier is a command argument. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { canonicalJson } from "./core.ts";
import { validateCurrentProjectSyncQuiesceCommand } from "./current-project-sync-quiesce-protocol.ts";
import type { CurrentProjectSyncQuiesceCommand } from "./current-project-sync-quiesce-protocol.ts";
import { currentProjectSyncQuiesceTemplate } from "./current-project-sync-quiesce-wire.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const helper = z.strictObject({ phase: z.literal("inverse-timer-helper"), method: z.literal("Debugger.getScriptSource"),
  params: z.strictObject({ scriptId: z.string().regex(/^[A-Za-z\d_.:-]{1,256}$(?![\s\S])/u) }) });
export type CurrentFootprintInverseTimerCommand = CurrentProjectSyncQuiesceCommand | z.infer<typeof helper>;
export function validateCurrentFootprintInverseTimerCommand(input: unknown): CurrentFootprintInverseTimerCommand {
  const captured = captureCurrentPcbStringClockReply(input).value;
  const parsed = helper.safeParse(captured); return freezeDeep(parsed.success ? parsed.data : validateCurrentProjectSyncQuiesceCommand(captured));
}
export function currentFootprintInverseTimerWire(input: CurrentFootprintInverseTimerCommand, id: number, sessionId: string): CurrentFootprintInverseTimerCommand & Readonly<{ inverseTimer: true; id: number; sessionId: string }> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647 || !/^[A-Za-z\d_.:-]{1,256}$(?![\s\S])/u.test(sessionId)) { throw new Error("FOOTPRINT_INVERSE_TIMER_WIRE"); }
  return freezeDeep({ ...validateCurrentFootprintInverseTimerCommand(input), inverseTimer: true, id, sessionId });
}
export function currentFootprintInverseTimerNativeFrame(chunk: Buffer, input: CurrentFootprintInverseTimerCommand, sessionId: string): Readonly<Record<string, string | number>> {
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { throw new Error("FOOTPRINT_INVERSE_TIMER_FRAME"); }
  const command = validateCurrentFootprintInverseTimerCommand(input); const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1)));
  const envelope = z.looseObject({ id: z.number().int().positive() }).parse(captureCurrentPcbStringClockReply(raw).value);
  const expected = currentFootprintInverseTimerWire(command, envelope.id, sessionId);
  if (canonicalJson(envelope) !== canonicalJson(expected) || chunk.toString("utf8") !== `${JSON.stringify(expected)}\0`) { throw new Error("FOOTPRINT_INVERSE_TIMER_FRAME"); }
  const row = command.phase === "inverse-timer-helper" ? { phase: command.phase, method: command.method, values: { scriptId: command.params.scriptId } } : currentProjectSyncQuiesceTemplate(command);
  return Object.freeze({ action: "footprint-inverse-timer", requestId: envelope.id, phase: row.phase, method: row.method, ...row.values });
}
