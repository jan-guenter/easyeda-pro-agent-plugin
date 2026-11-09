/* oxlint-disable import/max-dependencies -- This fixed SQL codec pins separate capture, source, request and registration programs; combining their modules would obscure the independently checked contracts. */
/** Closed readonly-fence inspector grammar. Callers provide no condition,
 * program, target/session, SQL, native DB or request-resume grant. */
import { z } from "zod";
import { checkCurrentSavedProjectRegistrationConfigCommand, currentSavedProjectRegistrationConfigCommandSchemas } from "./current-saved-project-registration-config-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_APP_URL_PATTERN as URL } from "./current-footprint-copy-main-backend-contract.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SOURCE as SOURCE } from "./current-selected-file-main-sql-fence-source.ts";
import { CURRENT_MAIN_CAPTURED_SCOPE_FRAMES as SCOPE_FRAMES } from "./current-main-captured-scope-frames.ts";
import { CURRENT_MAIN_CAPTURED_REQUEST_BIND_PROGRAM as CAPTURED_REQUEST_BIND, CURRENT_MAIN_CAPTURED_SCOPE_JOINS as SCOPE_JOINS } from "./current-main-captured-scope-joins.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CAPTURE_PROGRAM as CAPTURE,
  CURRENT_SELECTED_FILE_MAIN_SQL_CAPTURED_FRAME_EXPRESSIONS as CAPTURED_EXPRESSIONS,CURRENT_SELECTED_FILE_MAIN_SQL_CAPTURED_FRAME_PROGRAM as CAPTURED_FRAME,CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CONDITIONS as CONDITIONS,CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CONFIGURATION_PROGRAM as CONFIGURATION,
  CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_GROUP as GROUP,CURRENT_SELECTED_FILE_MAIN_SQL_PREDICATE_DIAGNOSTIC_PROGRAM as PREDICATE_DIAGNOSTIC,
  CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUIRE_PROGRAM as REQUIRE,CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SELECT_PROGRAM as SELECT } from "./current-selected-file-main-sql-fence-programs.ts";

import { CURRENT_MAIN_STARTUP_LIBRARY_READ_OWNER_PROGRAM as STARTUP_READ_OWNER } from "./current-main-startup-library-interleave.ts";
import { CURRENT_MAIN_STARTUP_CONFIG_CALLS as STARTUP } from "./current-main-startup-config-programs.ts";

import { CURRENT_SELECTED_FILE_MAIN_REQUEST_CALLS as REQUEST, CURRENT_SELECTED_FILE_MAIN_REQUEST_FRAME as REQUEST_FRAME } from "./current-selected-file-main-request-programs.ts";

export { currentSavedProjectRegistrationConfigNativeCases } from "./current-saved-project-registration-config-protocol.ts";

export const CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SITES = Object.freeze(["keeperBirth", "keeperBound", "contextBirth", "contextBound", "initializerBirth", "initializerBound",
  "queryAll", "queryOne", "run", "finalize", "statementEach", "statementRun", "prepare", "prepared", "wrapClose", "keeperClose", "initializerSerialize", "initializerPragma", "initializerClose", "startupVersion", "startupJB", "startupDC", "driver"] as const);
export const CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_EARLY_ID = `2:${String(SOURCE.sites.import.lineNumber)}:${String(SOURCE.sites.import.breakpointColumnNumber)}:${URL}`;
export const CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_NATIVE_EXPRESSION = "[sc.Database,sc.Statement,F5.types.isProxy,Date,Date.now]";
const empty = z.object({}).strict(), handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const location = z.object({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const ref = z.object({ objectId: handle }).strict();
const frameFlags = { objectGroup: z.literal(GROUP), silent: z.literal(true), returnByValue: z.literal(false), generatePreview: z.literal(false),
  throwOnSideEffect: z.literal(true), includeCommandLineAPI: z.literal(false) };
const callFlags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true),
  awaitPromise: z.literal(false), userGesture: z.literal(false) };
const pathValue = z.string().min(1).max(4096).refine(value => value.isWellFormed() && !value.includes("\0"));
const pathArgument = z.object({ value: pathValue }).strict();
const captureArguments = z.tuple([pathArgument]);
const selectArguments = z.tuple([ref]);
const afterImportsLocation = z.object({ scriptId: handle, lineNumber: z.literal(SOURCE.sites.afterImports.lineNumber), columnNumber: z.literal(SOURCE.sites.afterImports.breakpointColumnNumber) }).strict();
const afterImportsParams = z.object({ location: afterImportsLocation }).strict();
const earlyParams = z.object({ urlRegex: z.literal(URL), lineNumber: z.literal(SOURCE.sites.import.lineNumber), columnNumber: z.literal(SOURCE.sites.import.breakpointColumnNumber) }).strict();
const armParams = z.object({ location, condition: z.string().min(1).max(8192) }).strict();
const heldArmParams = z.object({ location, condition: z.literal("true") }).strict();
const frameParams = z.object({ ...frameFlags, callFrameId: handle, expression: z.string().min(1).max(256) }).strict();
const nativeFrameParams = z.object({ ...frameFlags, callFrameId: handle, expression: z.literal(CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_NATIVE_EXPRESSION) }).strict();
// The same bounded scratch Proxy check as the original condition needs
// Side-effect evaluation; only this fixed failure probe admits that flag.
const predicateDiagnosticParams = z.object({ ...frameFlags, throwOnSideEffect: z.literal(false), returnByValue: z.literal(true),
  callFrameId: handle, expression: z.literal(PREDICATE_DIAGNOSTIC) }).strict();
const propertiesParams = z.object({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }).strict();
const captureParams = z.object({ ...callFlags, objectId: handle, functionDeclaration: z.literal(CAPTURE), arguments: captureArguments, returnByValue: z.literal(false) }).strict();
const requireParams = z.object({ ...callFlags, objectId: handle, functionDeclaration: z.literal(REQUIRE), arguments: z.tuple([]), returnByValue: z.literal(true) }).strict();
const selectParams = z.object({ ...callFlags, objectId: handle, functionDeclaration: z.literal(SELECT), arguments: selectArguments, returnByValue: z.literal(false) }).strict();
const requestFrameParams = z.object({ ...frameFlags, callFrameId: handle, expression: z.literal(REQUEST_FRAME) }).strict();
const driverRawFrameParams = z.object({ ...frameFlags, callFrameId: handle, expression: z.literal(SCOPE_FRAMES.driver.rawExpression) }).strict();
// Only these exact programs freeze newly allocated inspector bookkeeping.
// No caller program, flag override, application mutation or SQL is admitted.
const driverRebaseCaptureParams = z.object({ ...callFlags, throwOnSideEffect: z.literal(false), objectId: handle, functionDeclaration: z.literal(SCOPE_JOINS.driver), arguments: selectArguments, returnByValue: z.literal(false) }).strict();
const requestCaptureParams = z.object({ ...callFlags, objectId: handle, functionDeclaration: z.literal(REQUEST.capture), arguments: z.tuple([ref]), returnByValue: z.literal(false) }).strict();
const requestBindParams = z.object({ ...callFlags, objectId: handle, functionDeclaration: z.literal(REQUEST.bind), arguments: z.tuple([ref, ref, ref, ref]), returnByValue: z.literal(false) }).strict();
const requestRebindParams = z.object({ ...callFlags, objectId: handle, functionDeclaration: z.literal(REQUEST.rebind), arguments: z.tuple([ref]), returnByValue: z.literal(false) }).strict();
const requestPrivateBindParams = requestBindParams.extend({ throwOnSideEffect: z.literal(false), functionDeclaration: z.literal(CAPTURED_REQUEST_BIND) });
const requestPrivateRebindParams = requestRebindParams.extend({ throwOnSideEffect: z.literal(false) });
const requestReadParams = z.object({ ...callFlags, objectId: handle, functionDeclaration: z.literal(REQUEST.read), arguments: z.tuple([]), returnByValue: z.literal(true) }).strict();
// This fixed reader retains the qualified Request getter/brand/prototype
// Checks. V8 rejects its native hasInstance even for a genuine Request.
const requestPrivateReadParams = requestReadParams.extend({ throwOnSideEffect: z.literal(false) });
const sites = z.enum(CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SITES);
// The fixed classifier creates only local scratch for the original Proxy
// Sanity check. Its result itself authorizes no native continuation.
const capturedFrameParams = z.object({ ...callFlags, throwOnSideEffect: z.literal(false), objectId: handle,
  functionDeclaration: z.literal(CAPTURED_FRAME), arguments: z.tuple([ref, z.object({ value: sites }).strict()]), returnByValue: z.literal(false) }).strict();
const frameSites = z.enum(["afterImports", ...CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SITES]);
const configStage = z.enum(["serialize", "pragma"]);
const configStageArgument = z.object({ value: configStage }).strict();
const configArguments = z.tuple([ref, configStageArgument]);
const configParams = z.object({ ...callFlags, throwOnSideEffect: z.literal(false), objectId: handle, functionDeclaration: z.literal(CONFIGURATION), arguments: configArguments, returnByValue: z.literal(true) }).strict();
const configSite = z.enum(["initializerSerialize", "initializerPragma"]);
const startupSelectSites = z.enum(["run", "prepare", "prepared", "statementRun", "finalize"]);
const startupSelectParams = z.object({ ...callFlags, throwOnSideEffect: z.literal(false), objectId: handle, functionDeclaration: z.literal(STARTUP.select),
  arguments: z.tuple([ref, z.object({ value: startupSelectSites }).strict()]), returnByValue: z.literal(true) }).strict();
const startupVersionParams = z.object({ ...callFlags, throwOnSideEffect: z.literal(false), objectId: handle, functionDeclaration: z.literal(STARTUP.version), arguments: selectArguments, returnByValue: z.literal(false) }).strict();
const startupJBParams = z.object({ ...callFlags, throwOnSideEffect: z.literal(false), objectId: handle, functionDeclaration: z.literal(STARTUP.bindJB), arguments: selectArguments, returnByValue: z.literal(true) }).strict();
const startupDCParams = z.object({ ...callFlags, throwOnSideEffect: z.literal(false), objectId: handle, functionDeclaration: z.literal(STARTUP.bindDC), arguments: selectArguments, returnByValue: z.literal(true) }).strict();
const startupReadOwnerParams = z.object({ ...callFlags, objectId: handle, functionDeclaration: z.literal(STARTUP_READ_OWNER), arguments: selectArguments, returnByValue: z.literal(true) }).strict();
const command = z.discriminatedUnion("phase", [
  z.object({ phase: z.literal("sql-fence-startup-read-owner"), method: z.literal("Runtime.callFunctionOn"), params: startupReadOwnerParams }).strict(),
  z.object({ phase: z.literal("sql-fence-startup-config-resume"), method: z.literal("Debugger.resume"), params: empty }).strict(),
  ...currentSavedProjectRegistrationConfigCommandSchemas,
  z.object({ phase: z.literal("sql-fence-startup-version"), method: z.literal("Runtime.callFunctionOn"), params: startupVersionParams }).strict(),
  z.object({ phase: z.literal("sql-fence-startup-jb"), method: z.literal("Runtime.callFunctionOn"), params: startupJBParams }).strict(),
  z.object({ phase: z.literal("sql-fence-startup-dc"), method: z.literal("Runtime.callFunctionOn"), params: startupDCParams }).strict(),
  z.object({ phase: z.literal("sql-fence-startup-select"), site: startupSelectSites, method: z.literal("Runtime.callFunctionOn"), params: startupSelectParams }).strict(),
  z.object({ phase: z.literal("sql-fence-early-arm"), method: z.literal("Debugger.setBreakpointByUrl"), params: earlyParams }).strict(),
  z.object({ phase: z.literal("sql-fence-after-imports-arm"), method: z.literal("Debugger.setBreakpoint"), params: afterImportsParams }).strict(),
  z.object({ phase: z.literal("sql-fence-arm"), site: sites, method: z.literal("Debugger.setBreakpoint"), params: armParams }).strict(),
  z.object({ phase: z.literal("sql-fence-held-arm"), site: sites, method: z.literal("Debugger.setBreakpoint"), params: heldArmParams }).strict(),
  z.object({ phase: z.literal("sql-fence-raw-frame"), site: sites, method: z.literal("Debugger.evaluateOnCallFrame"), params: frameParams }).strict(),
  z.object({ phase: z.literal("sql-fence-captured-frame"), site: sites, method: z.literal("Runtime.callFunctionOn"), params: capturedFrameParams }).strict(),
  z.object({ phase: z.literal("sql-fence-frame"), site: frameSites, method: z.literal("Debugger.evaluateOnCallFrame"), params: frameParams }).strict(),
  z.object({ phase: z.literal("sql-fence-native-frame"), method: z.literal("Debugger.evaluateOnCallFrame"), params: nativeFrameParams }).strict(),
  z.object({ phase: z.literal("sql-fence-predicate-diagnostic"), method: z.literal("Debugger.evaluateOnCallFrame"), params: predicateDiagnosticParams }).strict(),
  z.object({ phase: z.literal("sql-fence-properties"), method: z.literal("Runtime.getProperties"), params: propertiesParams }).strict(),
  z.object({ phase: z.literal("sql-fence-capture"), method: z.literal("Runtime.callFunctionOn"), params: captureParams }).strict(),
  z.object({ phase: z.literal("sql-fence-require"), method: z.literal("Runtime.callFunctionOn"), params: requireParams }).strict(),
  z.object({ phase: z.literal("sql-fence-select"), method: z.literal("Runtime.callFunctionOn"), params: selectParams }).strict(),
  z.object({ phase: z.literal("sql-fence-configure"), site: configSite, method: z.literal("Runtime.callFunctionOn"), params: configParams }).strict(),
  z.object({ phase: z.literal("sql-fence-driver-frame"), method: z.literal("Debugger.evaluateOnCallFrame"), params: requestFrameParams }).strict(),
  z.object({ phase: z.literal("sql-fence-driver-raw-frame"), method: z.literal("Debugger.evaluateOnCallFrame"), params: driverRawFrameParams }).strict(),
  z.object({ phase: z.literal("sql-fence-driver-rebase-capture"), method: z.literal("Runtime.callFunctionOn"), params: driverRebaseCaptureParams }).strict(),
  z.object({ phase: z.literal("sql-fence-request-capture"), method: z.literal("Runtime.callFunctionOn"), params: requestCaptureParams }).strict(),
  z.object({ phase: z.literal("sql-fence-request-bind"), method: z.literal("Runtime.callFunctionOn"), params: requestBindParams }).strict(),
  z.object({ phase: z.literal("sql-fence-request-rebind"), method: z.literal("Runtime.callFunctionOn"), params: requestRebindParams }).strict(),
  z.object({ phase: z.literal("sql-fence-request-private-bind"), method: z.literal("Runtime.callFunctionOn"), params: requestPrivateBindParams }).strict(),
  z.object({ phase: z.literal("sql-fence-request-private-rebind"), method: z.literal("Runtime.callFunctionOn"), params: requestPrivateRebindParams }).strict(),
  z.object({ phase: z.literal("sql-fence-request-read"), method: z.literal("Runtime.callFunctionOn"), params: requestReadParams }).strict(),
  z.object({ phase: z.literal("sql-fence-request-private-read"), method: z.literal("Runtime.callFunctionOn"), params: requestPrivateReadParams }).strict(),
  z.object({ phase: z.literal("sql-fence-fetch-source"), method: z.literal("Debugger.getScriptSource"), params: z.object({ scriptId: handle }).strict() }).strict(),
  z.object({ phase: z.literal("sql-fence-resume"), method: z.literal("Debugger.resume"), params: empty }).strict(),
]);
export type CurrentSelectedFileMainSqlFenceCommand = Readonly<z.infer<typeof command>>;
export const CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_FRAME_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true, returnByValue: false, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } as const);
export const CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CALL_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
/** Capture inert bounded input and accept only the finite SQL-fence phase,
 * method and fixed-program combinations. Validation grants no continuation. */
export function validateCurrentSelectedFileMainSqlFenceCommand(input: unknown): CurrentSelectedFileMainSqlFenceCommand {
  const captured = command.parse(captureCurrentPcbStringClockReply(input).value);
  if (captured.phase.startsWith("sql-fence-registration-")) {
    checkCurrentSavedProjectRegistrationConfigCommand(z.discriminatedUnion("phase", currentSavedProjectRegistrationConfigCommandSchemas).parse(captured));
  }
  if (captured.phase === "sql-fence-startup-select" && captured.params.arguments[1].value !== captured.site) {
    throw new Error("SELECTED_FILE_MAIN_SQL_FENCE_FIXED_STARTUP_SITE");
  } else if (captured.phase === "sql-fence-arm") {
    const actual = captured.params.location, expected = SOURCE.sites[captured.site];
    if (actual.lineNumber !== expected.lineNumber || actual.columnNumber !== expected.breakpointColumnNumber || captured.params.condition !== CONDITIONS[captured.site]) {
      throw new Error("SELECTED_FILE_MAIN_SQL_FENCE_FIXED_CONDITION");
    }
  } else if (captured.phase === "sql-fence-held-arm") {
    const actual = captured.params.location, expected = SOURCE.sites[captured.site];
    if (actual.lineNumber !== expected.lineNumber || actual.columnNumber !== expected.breakpointColumnNumber) { throw new Error("SELECTED_FILE_MAIN_SQL_FENCE_FIXED_HELD_LOCATION"); }
  } else if (captured.phase === "sql-fence-raw-frame" && captured.params.expression !== CAPTURED_EXPRESSIONS[captured.site]) {
    throw new Error("SELECTED_FILE_MAIN_SQL_FENCE_FIXED_RAW_FRAME");
  } else if (captured.phase === "sql-fence-captured-frame" && captured.params.arguments[1].value !== captured.site) {
    throw new Error("SELECTED_FILE_MAIN_SQL_FENCE_FIXED_CAPTURED_SITE");
  } else if (captured.phase === "sql-fence-configure" && captured.params.arguments[1].value !== (captured.site === "initializerSerialize" ? "serialize" : "pragma")) {
    throw new Error("SELECTED_FILE_MAIN_SQL_FENCE_FIXED_CONFIGURATION");
  } else if (captured.phase === "sql-fence-frame" && captured.params.expression !== SOURCE.sites[captured.site].expression) {
    throw new Error("SELECTED_FILE_MAIN_SQL_FENCE_FIXED_FRAME");
  }
  return freezeDeep(captured);
}
/** Additional complete fence schedule only. Original construction/request/
 * completion budgets remain separate, and no mutation-resume grant exists. */
export const CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUESTS = Object.freeze({
  earlyAndAfterImports: 2, conditionalArms: CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SITES.length,
  // One additional passive getProperties checks the actual four import operands
  // Before capture. No program, SQL or resume allowance changes.
  captureAndNativeMetadata: 11, startupResumes: 2, mutationPauses: 64, perMutationMaximum: 3,
  originalFetchSourceAndScopeProof: 20, readonlyRequestPauses: 64, perReadonlyRequestMaximum: 6,
  startupContexts: 3, startupNativeCalls: 48, perStartupPauseMaximum: 4,
  normal: (3 + 48) * 4 + 2 + CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SITES.length + 11 + 2 + 64 * 3 + 20 + 64 * 6,
  cleanup: 0, executionAuthorized: false,
});
