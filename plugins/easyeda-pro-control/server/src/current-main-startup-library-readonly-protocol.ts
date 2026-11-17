/** Closed rejection-observation commands. No caller JavaScript, SQL, error,
 * breakpoint condition or retry can enter this separate eight-request lane. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_MAIN_STARTUP_LIBRARY_READONLY_SOURCE as SOURCE } from "./current-main-startup-library-readonly-source.ts";
import { CURRENT_MAIN_STARTUP_LIBRARY_READONLY_PROGRAM as PROOF } from "./current-main-startup-library-readonly-program.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CALL_FLAGS as CALL, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_FRAME_FLAGS as FRAME } from "./current-selected-file-main-sql-fence-protocol.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUIRE_PROGRAM as REQUIRE } from "./current-selected-file-main-sql-fence-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const handle=z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u),ref=z.strictObject({objectId:handle});
const point=(value:Readonly<{lineNumber:number;columnNumber:number}>):z.ZodObject<{scriptId:typeof handle;lineNumber:z.ZodLiteral<number>;columnNumber:z.ZodLiteral<number>}>=>
  z.strictObject({scriptId:handle,lineNumber:z.literal(value.lineNumber),columnNumber:z.literal(value.columnNumber)});
const callFlags={objectGroup:z.literal(CALL.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true),awaitPromise:z.literal(false),userGesture:z.literal(false),objectId:handle};
const frameFlags={objectGroup:z.literal(FRAME.objectGroup),silent:z.literal(true),returnByValue:z.literal(false),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true),includeCommandLineAPI:z.literal(false),callFrameId:handle};
const schemas=[
  z.strictObject({phase:z.literal("sql-stock-readonly-points"),method:z.literal("Debugger.getPossibleBreakpoints"),params:z.strictObject({start:point(SOURCE.start),end:point(SOURCE.end),restrictToFunction:z.literal(true)})}),
  z.strictObject({phase:z.literal("sql-stock-readonly-arm"),method:z.literal("Debugger.setBreakpoint"),params:z.strictObject({location:point(SOURCE.point),condition:z.literal("true")})}),
  z.strictObject({phase:z.literal("sql-stock-readonly-frame"),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({...frameFlags,expression:z.literal(SOURCE.frameExpression)})}),
  z.strictObject({phase:z.literal("sql-stock-readonly-proof"),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...callFlags,functionDeclaration:z.literal(PROOF),arguments:z.tuple([ref,ref,ref]),returnByValue:z.literal(true)})}),
  ...(["remove-return","remove-failure","disarm-normal"] as const).map(phase=>z.strictObject({phase:z.literal(`sql-stock-readonly-${phase}`),method:z.literal("Debugger.removeBreakpoint"),params:z.strictObject({breakpointId:handle})})),
  z.strictObject({phase:z.literal("sql-stock-readonly-require"),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...callFlags,functionDeclaration:z.literal(REQUIRE),arguments:z.tuple([]),returnByValue:z.literal(true)})}),
  z.strictObject({phase:z.literal("sql-stock-readonly-resume"),method:z.literal("Debugger.resume"),params:z.strictObject({})}),
] as const;
const schema=z.discriminatedUnion("phase",schemas);
export type CurrentMainStartupLibraryReadonlyCommand=Readonly<z.infer<typeof schema>>;
export function validateCurrentMainStartupLibraryReadonlyCommand(input:unknown):CurrentMainStartupLibraryReadonlyCommand {
  const command=schema.parse(captureCurrentPcbStringClockReply(input).value);
  if(command.phase==="sql-stock-readonly-points" && command.params.start.scriptId!==command.params.end.scriptId) { throw new Error("STOCK_READONLY_POINTS_SCRIPT"); }
  return freezeDeep(command);
}

/** Diagnostic data only. Parsing never mints the held error or its owner. */
export const currentMainStartupLibraryReadonlyObservationSchema=z.strictObject({
  observed:z.literal(true),failureCode:z.literal("SQLITE_READONLY"),errno:z.literal(8),scriptIndex:z.literal(0),installedStockOnly:z.literal(true),
  originalRethrowPending:z.literal(true),normalReturnProven:z.literal(false),nativeCompletionProven:z.literal(false),successfulInitializationProven:z.literal(false),selectedProjectWriteGrant:z.literal(false),retryAllowed:z.literal(false),
});

/** A separately versioned historical diagnostic. Its data never issues the
 * original held error, a retry, successful maintenance or write authority. */
export const currentMainStartupLibraryReadonlyStateSchema=z.strictObject({
  schema:z.literal("private.current-main-startup-library-readonly-state.v1"),
  pointIssued:z.boolean(),ordinaryRequests:z.number().int().min(0).max(8),
  originalError:currentMainStartupLibraryReadonlyObservationSchema.nullable(),originalRethrowResumed:z.boolean(),
  normalReturnProven:z.literal(false),successfulInitializationProven:z.literal(false),
  retryAllowed:z.literal(false),selectedProjectWriteGrant:z.literal(false),executionAuthorized:z.literal(false),
});
