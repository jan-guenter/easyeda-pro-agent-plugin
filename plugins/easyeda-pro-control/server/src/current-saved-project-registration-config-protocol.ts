/** Fixed private registration vocabulary. No caller supplies SQL, JavaScript,
 * a breakpoint condition or a session/connection selector. */
import { z } from "zod";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_GROUP as GROUP } from "./current-selected-file-main-sql-fence-programs.ts";
import { CURRENT_SAVED_PROJECT_REGISTRATION_CONFIG_CALLS as CALLS } from "./current-saved-project-registration-config-programs.ts";
import { CURRENT_SAVED_PROJECT_REGISTRATION_CONFIG_SITES as SITES } from "./current-saved-project-registration-config-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SAVED_PROJECT_REGISTRATION_CONFIG_SITE_NAMES = ["bind", "afterExec", "opened"] as const;
const site = z.enum(CURRENT_SAVED_PROJECT_REGISTRATION_CONFIG_SITE_NAMES);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), ref = z.strictObject({ objectId: handle });
const flags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false) };
const frameFlags = { ...flags, returnByValue: z.literal(false), throwOnSideEffect: z.literal(true), includeCommandLineAPI: z.literal(false) };
const callFlags = { ...flags, throwOnSideEffect: z.literal(false), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const path = z.string().min(1).max(4096).refine(value => {
  if (!value.isWellFormed()) { return false; }
  for (const character of value) { const point = character.codePointAt(0); if (point === undefined || point < 32 || point === 127) { return false; } }
  return true;
});
const location = z.strictObject({ scriptId: handle, lineNumber: z.literal(8549), columnNumber: z.number().int().positive() });
const pathArgument = z.strictObject({ value: path });
const bindArguments = z.tuple([ref, pathArgument]);
export const currentSavedProjectRegistrationConfigCommandSchemas = [
  z.strictObject({ phase: z.literal("sql-fence-registration-arm"), site, method: z.literal("Debugger.setBreakpoint"), params: z.strictObject({
    location, condition: z.literal("true") }) }),
  z.strictObject({ phase: z.literal("sql-fence-registration-frame"), site, method: z.literal("Debugger.evaluateOnCallFrame"), params: z.strictObject({
    ...frameFlags, callFrameId: handle, expression: z.string().max(256) }) }),
  z.strictObject({ phase: z.literal("sql-fence-registration-bind"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({
    ...callFlags, objectId: handle, functionDeclaration: z.literal(CALLS.bind), arguments: bindArguments, returnByValue: z.literal(false) }) }),
  z.strictObject({ phase: z.literal("sql-fence-registration-run"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({
    ...callFlags, objectId: handle, functionDeclaration: z.literal(CALLS.run), arguments: z.tuple([ref]), returnByValue: z.literal(true) }) }),
  z.strictObject({ phase: z.literal("sql-fence-registration-after-exec"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({
    ...callFlags, objectId: handle, functionDeclaration: z.literal(CALLS.afterExec), arguments: z.tuple([ref]), returnByValue: z.literal(true) }) }),
  z.strictObject({ phase: z.literal("sql-fence-registration-opened"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({
    ...callFlags, objectId: handle, functionDeclaration: z.literal(CALLS.opened), arguments: z.tuple([ref]), returnByValue: z.literal(true) }) }),
] as const;
const schema = z.discriminatedUnion("phase", currentSavedProjectRegistrationConfigCommandSchemas);
export type CurrentSavedProjectRegistrationConfigCommand = Readonly<z.infer<typeof schema>>;
export function checkCurrentSavedProjectRegistrationConfigCommand(command: CurrentSavedProjectRegistrationConfigCommand): void {
  if (command.phase === "sql-fence-registration-arm" && (command.params.location.lineNumber !== SITES[command.site].lineNumber || command.params.location.columnNumber !== SITES[command.site].columnNumber) ||
    command.phase === "sql-fence-registration-frame" && command.params.expression !== SITES[command.site].expression) { throw new Error("SAVED_PROJECT_REGISTRATION_FIXED_SITE"); }
}
/** Finite inert native templates, never runtime ownership. */
export function currentSavedProjectRegistrationConfigNativeCases(): readonly CurrentSavedProjectRegistrationConfigCommand[] {
  const argument = { objectId: "__selectedsql_argument0__" }, objectId = "__selectedsql_objectId__";
  const frame = { objectGroup: GROUP, silent: true, generatePreview: false, returnByValue: false, throwOnSideEffect: true, includeCommandLineAPI: false } as const;
  const call = { objectGroup: GROUP, silent: true, generatePreview: false, throwOnSideEffect: false, awaitPromise: false, userGesture: false } as const;
  const commands: CurrentSavedProjectRegistrationConfigCommand[] = [];
  for (const name of CURRENT_SAVED_PROJECT_REGISTRATION_CONFIG_SITE_NAMES) {
    commands.push({ phase: "sql-fence-registration-arm", site: name, method: "Debugger.setBreakpoint", params: { location: {
      scriptId: "__selectedsql_scriptId__", lineNumber: SITES[name].lineNumber, columnNumber: SITES[name].columnNumber }, condition: "true" } },
    { phase: "sql-fence-registration-frame", site: name, method: "Debugger.evaluateOnCallFrame", params: {
      ...frame, callFrameId: "__selectedsql_callFrameId__", expression: SITES[name].expression } });
  }
  commands.push({ phase: "sql-fence-registration-bind", method: "Runtime.callFunctionOn", params: { ...call, objectId, functionDeclaration: CALLS.bind,
    arguments: [argument, { value: "__selectedsql_path__" }], returnByValue: false } },
  { phase: "sql-fence-registration-run", method: "Runtime.callFunctionOn", params: { ...call, objectId, functionDeclaration: CALLS.run, arguments: [argument], returnByValue: true } },
  { phase: "sql-fence-registration-after-exec", method: "Runtime.callFunctionOn", params: { ...call, objectId, functionDeclaration: CALLS.afterExec, arguments: [argument], returnByValue: true } },
  { phase: "sql-fence-registration-opened", method: "Runtime.callFunctionOn", params: { ...call, objectId, functionDeclaration: CALLS.opened, arguments: [argument], returnByValue: true } });
  for (const command of commands) { schema.parse(command); checkCurrentSavedProjectRegistrationConfigCommand(command); }
  return freezeDeep(commands);
}
/** Three source arms, four original frame joins, one consume/three awaits,
 * capture reprovals and one native resume for each of four original pauses. */
export const CURRENT_SAVED_PROJECT_REGISTRATION_CONFIG_REQUESTS = 32;
