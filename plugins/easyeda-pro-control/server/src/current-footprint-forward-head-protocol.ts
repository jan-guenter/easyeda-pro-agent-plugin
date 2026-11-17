/** Fixed read-only forward bootstrap vocabulary. The original native/Main
 * issuer, not this decoder or its command data, supplies capture authority. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_FOOTPRINT_FORWARD_HEAD_FRAME, CURRENT_FOOTPRINT_FORWARD_HEAD_GROUP as GROUP } from "./current-footprint-forward-head-programs.ts";
import { CURRENT_FOOTPRINT_FORWARD_HEAD_OPEN_POINT as POINT } from "./current-footprint-forward-head-source.ts";
import { validateCurrentFootprintForwardHeadCommand } from "./current-footprint-forward-head-controller.ts";
import type { CurrentFootprintForwardHeadCommand } from "./current-footprint-forward-head-controller.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_EARLY_ID as EARLY, validateCurrentSelectedFileMainSqlFenceCommand } from "./current-selected-file-main-sql-fence-protocol.ts";
import type { CurrentSelectedFileMainSqlFenceCommand } from "./current-selected-file-main-sql-fence-protocol.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_GROUP as SQL_GROUP } from "./current-selected-file-main-sql-fence-programs.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$(?![\s\S])/u);
const location = z.strictObject({ scriptId: handle, lineNumber: z.literal(POINT.lineNumber), columnNumber: z.literal(POINT.columnNumber) });
const frame = z.strictObject({ callFrameId: handle, expression: z.literal(CURRENT_FOOTPRINT_FORWARD_HEAD_FRAME), objectGroup: z.literal(GROUP),
  silent: z.literal(true), returnByValue: z.literal(false), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), includeCommandLineAPI: z.literal(false) });
const arm = z.strictObject({ phase: z.literal("arm"), method: z.literal("Debugger.setBreakpoint"), params: z.strictObject({ location }) });
const selectedFrame = z.strictObject({ phase: z.literal("frame"), method: z.literal("Debugger.evaluateOnCallFrame"), params: frame });
const breakpointId = z.union([handle, z.literal(EARLY)]);
const remove = z.strictObject({ phase: z.literal("remove"), method: z.literal("Debugger.removeBreakpoint"), params: z.strictObject({ breakpointId }) });
const resume = z.strictObject({ phase: z.literal("resume"), method: z.literal("Debugger.resume"), params: z.strictObject({}) });
const release = z.strictObject({ phase: z.literal("release"), method: z.literal("Runtime.releaseObjectGroup"), params: z.strictObject({ objectGroup: z.literal(SQL_GROUP) }) });
const opening = z.discriminatedUnion("phase", [arm, selectedFrame, remove, resume, release]);
export type CurrentFootprintForwardHeadOpeningCommand = Readonly<z.infer<typeof opening>>;
export type CurrentFootprintForwardHeadMainCommand = Readonly<{
  phase: "forward-head-sql"; command: CurrentSelectedFileMainSqlFenceCommand;
}> | Readonly<{ phase: "forward-head-read"; command: CurrentFootprintForwardHeadCommand }>
  | Readonly<{ phase: "forward-head-open"; command: CurrentFootprintForwardHeadOpeningCommand }>;
const wrapper = z.strictObject({ phase: z.enum(["forward-head-sql", "forward-head-read", "forward-head-open"]), command: z.unknown() });
const sqlPhases = new Set(["sql-fence-early-arm", "sql-fence-after-imports-arm", "sql-fence-frame", "sql-fence-native-frame",
  "sql-fence-properties", "sql-fence-capture", "sql-fence-require", "sql-fence-resume"]);
/** No SQL mutations, startup callbacks, generic evaluation, caller programs or
 * conditional breakpoint can enter the forward head-only native lane. */
export function validateCurrentFootprintForwardHeadMainCommand(input: unknown): CurrentFootprintForwardHeadMainCommand {
  const value = wrapper.parse(captureCurrentPcbStringClockReply(input).value);
  if (value.phase === "forward-head-sql") {
    const command = validateCurrentSelectedFileMainSqlFenceCommand(value.command);
    if (!sqlPhases.has(command.phase) || command.phase === "sql-fence-frame" && command.site !== "afterImports") { throw new Error("FORWARD_HEAD_SQL_PHASE"); }
    return Object.freeze({ phase: value.phase, command });
  }
  if (value.phase === "forward-head-read") { return Object.freeze({ phase: value.phase, command: validateCurrentFootprintForwardHeadCommand(value.command) }); }
  return Object.freeze({ phase: value.phase, command: opening.parse(value.command) });
}
/** This reservation is for a head observation, not the full writer schedule.
 * It uses the existing v2 ceiling and excludes later writer-origin issuance. */
export const CURRENT_FOOTPRINT_FORWARD_HEAD_MAIN_REQUESTS = Object.freeze({ bootstrapNormal: 14, bootstrapCleanup: 4,
  openingNormal: 6, openingCleanup: 4, normal: 20, cleanup: 8, total: 28, wholeWriterReserved: false });
export function isCurrentFootprintForwardHeadMainCommand(input: Readonly<{ phase: string }>): input is CurrentFootprintForwardHeadMainCommand {
  return input.phase === "forward-head-sql" || input.phase === "forward-head-read" || input.phase === "forward-head-open";
}
