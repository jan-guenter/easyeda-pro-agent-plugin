/** Refusal-only pre-action guard grammar. There is deliberately no resume,
 * removal, caller condition or producer/body authority in this vocabulary. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_GUARD_SITES as SITES } from "./current-project-save-producer-guard-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const roles = ["historySeed", "historyFlow", "historyUpload", "historyCloud", "historyConverted", "localIngress", "cloudIngress", "bufferIngress", "pendingCache", "pendingLocal"] as const;
const location = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const schema = z.strictObject({ phase: z.literal("project-save-producer-guard"), role: z.enum(roles), method: z.literal("Debugger.setBreakpoint"),
  params: z.strictObject({ location }) });
export type CurrentProjectSaveProducerGuardCommand = z.infer<typeof schema>;
export const CURRENT_PROJECT_SAVE_PRODUCER_GUARD_REQUESTS = Object.freeze({ normal: roles.length, cleanup: 0, cdpRequests: roles.length, enrollmentControls: 1 });
export function validateCurrentProjectSaveProducerGuardCommand(input: unknown): CurrentProjectSaveProducerGuardCommand {
  const command = schema.parse(captureCurrentPcbStringClockReply(input).value), site = SITES[command.role];
  if (command.params.location.lineNumber !== site.lineNumber || command.params.location.columnNumber !== site.columnNumber) { throw new Error("PROJECT_SAVE_PRODUCER_GUARD_FIXED_SITE"); } return freezeDeep(command);
}
export function currentProjectSaveProducerGuardCases(scriptId: string): readonly CurrentProjectSaveProducerGuardCommand[] {
  return freezeDeep(roles.map(role => validateCurrentProjectSaveProducerGuardCommand({ phase: "project-save-producer-guard", role, method: "Debugger.setBreakpoint", params: { location: { scriptId, lineNumber: SITES[role].lineNumber, columnNumber: SITES[role].columnNumber } } })));
}
