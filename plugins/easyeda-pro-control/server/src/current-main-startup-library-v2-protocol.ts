/** Closed stock-origin inspector vocabulary. Its budget can never be charged
 * by an ordinary SQL command or a caller-supplied program/condition. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_MAIN_STARTUP_LIBRARY_V2_CALLER_EXPRESSION as CALLER_EXPRESSION, CURRENT_MAIN_STARTUP_LIBRARY_V2_CALLS as CALLS } from "./current-main-startup-library-v2-programs.ts";
import { CURRENT_MAIN_STARTUP_LIBRARY_FRAME_EXPRESSION as FRAME_EXPRESSION } from "./current-main-startup-library-programs.ts";
import { CURRENT_MAIN_STARTUP_LIBRARY_V2 as LIVE } from "./current-main-startup-library-v2-profile.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CALL_FLAGS as CALL, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_FRAME_FLAGS as FRAME } from "./current-selected-file-main-sql-fence-protocol.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_CAPTURED_FRAME_PROGRAM as CAPTURED, CURRENT_SELECTED_FILE_MAIN_SQL_CAPTURED_FRAME_EXPRESSIONS as RAW, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUIRE_PROGRAM as REQUIRE } from "./current-selected-file-main-sql-fence-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const RETURN = CALLS.returned;
const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u), ref = z.strictObject({ objectId: handle });
const point = (value: Readonly<{ lineNumber: number; columnNumber: number }>): z.ZodObject<{ scriptId: typeof handle; lineNumber: z.ZodLiteral<number>; columnNumber: z.ZodLiteral<number> }> =>
  z.strictObject({ scriptId: handle, lineNumber: z.literal(value.lineNumber), columnNumber: z.literal(value.columnNumber) });
const frameFlags = { objectGroup: z.literal(FRAME.objectGroup), silent: z.literal(true), returnByValue: z.literal(false), generatePreview: z.literal(false),
  throwOnSideEffect: z.literal(true), includeCommandLineAPI: z.literal(false), callFrameId: handle };
const callFlags = { objectGroup: z.literal(CALL.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true),
  awaitPromise: z.literal(false), userGesture: z.literal(false), objectId: handle };
const call = { ...callFlags, throwOnSideEffect: z.literal(false) };
const jlFrame = z.strictObject({ ...frameFlags, expression: z.literal(FRAME_EXPRESSION) });
const rawFrame = z.strictObject({ ...frameFlags, expression: z.literal(RAW.run) });
const returnFrame = z.strictObject({ ...frameFlags, expression: z.literal("[t]") });
const path = z.string().min(1).max(4096).refine(value => value.isWellFormed() && !value.includes("\0"));
const pathArgument = z.strictObject({ value: path }); const bindArguments = z.tuple([ref, pathArgument, ref]);
const runArgument = z.strictObject({ value: z.literal("run") }); const capturedArguments = z.tuple([ref, runArgument]);
const schemas = [
  z.strictObject({ phase: z.literal("sql-stock-v2-caller"), method: z.literal("Debugger.evaluateOnCallFrame"), params: z.strictObject({ ...frameFlags, expression: z.literal(CALLER_EXPRESSION) }) }),
  z.strictObject({ phase: z.literal("sql-stock-v2-frame"), method: z.literal("Debugger.evaluateOnCallFrame"), params: jlFrame }),
  z.strictObject({ phase: z.literal("sql-stock-v2-bind"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...call, functionDeclaration: z.literal(CALLS.bind),
    arguments: bindArguments, returnByValue: z.literal(false) }) }),
  z.strictObject({ phase: z.literal("sql-stock-v2-points"), method: z.literal("Debugger.getPossibleBreakpoints"), params: z.strictObject({ start: point(LIVE.functionStart), end: point(LIVE.functionEnd), restrictToFunction: z.literal(true) }) }),
  z.strictObject({ phase: z.literal("sql-stock-v2-arm"), method: z.literal("Debugger.setBreakpoint"), params: z.strictObject({ location: point(LIVE.returnPoint), condition: z.literal("true") }) }),
  z.strictObject({ phase: z.literal("sql-stock-v2-raw"), method: z.literal("Debugger.evaluateOnCallFrame"), params: rawFrame }),
  z.strictObject({ phase: z.literal("sql-stock-v2-captured"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...call, functionDeclaration: z.literal(CAPTURED),
    arguments: capturedArguments, returnByValue: z.literal(false) }) }),
  z.strictObject({ phase: z.literal("sql-stock-v2-select"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...call, functionDeclaration: z.literal(CALLS.select), arguments: z.tuple([ref, ref, ref]), returnByValue: z.literal(true) }) }),
  z.strictObject({ phase: z.literal("sql-stock-v2-require"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...callFlags, functionDeclaration: z.literal(REQUIRE), arguments: z.tuple([]), returnByValue: z.literal(true) }) }),
  z.strictObject({ phase: z.literal("sql-stock-v2-resume"), method: z.literal("Debugger.resume"), params: z.strictObject({}) }),
  z.strictObject({ phase: z.literal("sql-stock-v2-return-frame"), method: z.literal("Debugger.evaluateOnCallFrame"), params: returnFrame }),
  z.strictObject({ phase: z.literal("sql-stock-v2-return-properties"), method: z.literal("Runtime.getProperties"), params: z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }) }),
  z.strictObject({ phase: z.literal("sql-stock-v2-return"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...call, functionDeclaration: z.literal(RETURN), arguments: z.tuple([ref, ref, ref, ref]), returnByValue: z.literal(true) }) }),
  z.strictObject({ phase: z.literal("sql-stock-v2-remove"), method: z.literal("Debugger.removeBreakpoint"), params: z.strictObject({ breakpointId: handle }) }),
] as const;
const schema = z.discriminatedUnion("phase", schemas);
export type CurrentMainStartupLibraryV2Command = Readonly<z.infer<typeof schema>>;
export function validateCurrentMainStartupLibraryV2Command(input: unknown): CurrentMainStartupLibraryV2Command {
  const command = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.phase === "sql-stock-v2-points" && command.params.start.scriptId !== command.params.end.scriptId) { throw new Error("MAIN_STARTUP_LIBRARY_POINTS_SCRIPT"); }
  return freezeDeep(command);
}
