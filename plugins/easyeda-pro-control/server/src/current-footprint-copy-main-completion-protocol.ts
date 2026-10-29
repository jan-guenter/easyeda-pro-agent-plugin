/** Finite, unmounted history-completion grammar. It grants no native transport,
 * full writer reservation, SQL read or application execution authority. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_GROUP as GROUP } from "./current-footprint-copy-main-request-programs.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_EXPRESSIONS as EXPRESSIONS, CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_PROGRAMS as PROGRAMS } from "./current-footprint-copy-main-completion-programs.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_FUNCTIONS as FUNCTIONS, CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_ORDER as ORDER,
  CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_SITES as SITES, CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_SQL_CONDITION as SQL_CONDITION } from "./current-footprint-copy-main-completion-source.ts";
import type { CurrentFootprintCopyMainCompletionStage as Stage } from "./current-footprint-copy-main-completion-source.ts";

// 13 initial source arms +14 frame/join pairs +one caller frame +two original
// Callback metadata reads +one callback-function arm. Cleanup includes the
// Original held PB resume,14 collected resumes/removals and one group release.
export const CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS = Object.freeze({ normal: 45, cleanup: 30, total: 75 });
export const CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_FRAME_ROLES = Object.freeze([...ORDER, "project-sql-caller"] as const);
export const CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true,
  generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u), object = z.object({ objectId: handle }).strict();
const point = z.object({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const source = z.object({ location: point, condition: z.literal(SQL_CONDITION).optional() }).strict();
const frame = z.object({ callFrameId: handle, expression: z.enum(Object.values(EXPRESSIONS)), objectGroup: z.literal(GROUP),
  silent: z.literal(true), returnByValue: z.literal(false), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), includeCommandLineAPI: z.literal(false) }).strict();
const call = z.object({ objectId: handle, functionDeclaration: z.enum(Object.values(PROGRAMS).map(value => value.program)),
  arguments: z.array(object).min(1).max(2), returnByValue: z.boolean(), objectGroup: z.literal(GROUP), silent: z.literal(true),
  generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) }).strict();
const properties = z.object({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }).strict();
const empty = z.object({}).strict();
const release = z.object({ objectGroup: z.literal(GROUP) }).strict();
const frameRoles = z.enum(CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_FRAME_ROLES);
const commandSchema = z.discriminatedUnion("phase", [
  z.object({ phase: z.literal("completion-source-arm"), stage: z.enum(ORDER), method: z.literal("Debugger.setBreakpoint"), params: source }).strict(),
  z.object({ phase: z.literal("completion-callback-arm"), method: z.literal("Debugger.setBreakpointOnFunctionCall"), params: object }).strict(),
  z.object({ phase: z.literal("completion-frame"), role: frameRoles, method: z.literal("Debugger.evaluateOnCallFrame"), params: frame }).strict(),
  z.object({ phase: z.literal("completion-join"), stage: z.enum(ORDER), method: z.literal("Runtime.callFunctionOn"), params: call }).strict(),
  z.object({ phase: z.literal("completion-properties"), method: z.literal("Runtime.getProperties"), params: properties }).strict(),
  z.object({ phase: z.literal("completion-remove"), method: z.literal("Debugger.removeBreakpoint"), params: z.object({ breakpointId: handle }).strict() }).strict(),
  z.object({ phase: z.enum(["completion-resume", "completion-resume-final-pb"]), method: z.literal("Debugger.resume"), params: empty }).strict(),
  z.object({ phase: z.literal("completion-release"), method: z.literal("Runtime.releaseObjectGroup"), params: release }).strict(),
]).superRefine((command, context) => {
  let matches = true;
  if (command.phase === "completion-source-arm") {
    const site = SITES[command.stage]; matches = !site.dynamic && command.params.location.lineNumber === site.lineNumber &&
      command.params.location.columnNumber === site.columnNumber && command.params.condition === (command.stage === "project-sql" ? SQL_CONDITION : undefined);
  } else if (command.phase === "completion-frame") { matches = command.params.expression === EXPRESSIONS[command.role]; }
  else if (command.phase === "completion-join") {
    const program = PROGRAMS[command.stage]; matches = command.params.functionDeclaration === program.program &&
      command.params.arguments.length === program.arguments && command.params.returnByValue === program.returnByValue;
  }
  if (!matches) { context.addIssue({ code: "custom", message: "The exact fixed stage, source site and selector must match." }); }
});
export type CurrentFootprintCopyMainCompletionCommand = Readonly<z.infer<typeof commandSchema>>;
export function validateCurrentFootprintCopyMainCompletionCommand(input: unknown): CurrentFootprintCopyMainCompletionCommand {
  return freezeDeep(commandSchema.parse(captureCurrentPcbStringClockReply(input).value));
}
export function currentFootprintCopyMainCompletionSourceArm(stage: Exclude<Stage, "callback-enter">, scriptId: string): CurrentFootprintCopyMainCompletionCommand {
  const site = SITES[stage];
  return validateCurrentFootprintCopyMainCompletionCommand({ phase: "completion-source-arm", stage, method: "Debugger.setBreakpoint",
    params: { location: { scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber }, ...(stage === "project-sql" ? { condition: SQL_CONDITION } : {}) } });
}
/** Bounded CDP projection for a future fixed native encoder. There is no mounted
 * sender, native-purpose budget or permission to forward a supplied program. */
export function currentFootprintCopyMainCompletionNativeCommand(input: unknown, id: number): Readonly<{ id: number; method: string; params: unknown }> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647) { throw new Error("FOOTPRINT_MAIN_COMPLETION_COMMAND_ID"); }
  const parsed = validateCurrentFootprintCopyMainCompletionCommand(input), value = { id, method: parsed.method, params: parsed.params };
  if (Buffer.byteLength(JSON.stringify(value)) > 65_536) { throw new Error("FOOTPRINT_MAIN_COMPLETION_COMMAND_BYTES"); }
  return freezeDeep(value);
}
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_MAIN_COMPLETION_REPLY"); } }
const pauseFrame = z.looseObject({ callFrameId: handle, functionName: z.string().max(128), location: point, functionLocation: point });
const pause = z.looseObject({ reason: z.literal("other"), hitBreakpoints: z.tuple([handle]), callFrames: z.array(pauseFrame).min(1).max(64) });
export function decodeCurrentFootprintCopyMainCompletionPause(input: unknown, stage: Stage, scriptId: string, breakpointId: string): Readonly<{ frameId: string; callerFrameId: string | null }> {
  const value = pause.parse(captureCurrentPcbStringClockReply(input).value);
  const first = value.callFrames[0], site = SITES[stage];
  const fn = FUNCTIONS[site.role];
  need(first !== undefined && value.hitBreakpoints[0] === breakpointId && first.functionName === site.name && first.location.scriptId === scriptId &&
    first.location.lineNumber === site.lineNumber && first.location.columnNumber === site.columnNumber && first.functionLocation.scriptId === scriptId &&
    first.functionLocation.lineNumber === fn.functionLocation.lineNumber && first.functionLocation.columnNumber === fn.functionLocation.columnNumber);
  if (stage === "project-sql") {
    const caller = value.callFrames[1]; need(caller !== undefined && caller.functionName === "xB" && caller.location.scriptId === scriptId &&
      caller.location.lineNumber === 8572 && caller.location.columnNumber === 26_571 && caller.functionLocation.scriptId === scriptId &&
      caller.functionLocation.lineNumber === FUNCTIONS.project.functionLocation.lineNumber && caller.functionLocation.columnNumber === FUNCTIONS.project.functionLocation.columnNumber);
    return Object.freeze({ frameId: first.callFrameId, callerFrameId: caller.callFrameId });
  }
  return Object.freeze({ frameId: first.callFrameId, callerFrameId: null });
}
export function decodeCurrentFootprintCopyMainCompletionAllocation(input: unknown, stage: Stage, scriptId: string): string {
  if (stage === "callback-enter") { return z.object({ breakpointId: handle }).strict().parse(captureCurrentPcbStringClockReply(input).value).breakpointId; }
  const value = z.object({ breakpointId: handle, actualLocation: point }).strict().parse(captureCurrentPcbStringClockReply(input).value);
  const site = SITES[stage];
  need(value.actualLocation.scriptId === scriptId && value.actualLocation.lineNumber === site.lineNumber && value.actualLocation.columnNumber === site.columnNumber); return value.breakpointId;
}
export function currentFootprintCopyMainCompletionAllocatedId(input: unknown): string | null {
  const value = z.looseObject({ breakpointId: handle }).safeParse(captureCurrentPcbStringClockReply(input).value); return value.success ? value.data.breakpointId : null;
}
const remote = z.object({ type: z.string(), subtype: z.string().optional(), className: z.string().optional(), objectId: handle.optional(),
  description: z.string().max(8192).optional(), value: z.unknown().optional() }).strict();
const property = z.object({ name: z.string(), value: remote, writable: z.boolean(), enumerable: z.boolean(), configurable: z.boolean(), isOwn: z.literal(true) }).strict();
const internal = z.object({ name: z.string(), value: remote }).strict();
export function decodeCurrentFootprintCopyMainCompletionCallback(input: unknown): string {
  const value = z.object({ result: z.array(property).length(4), internalProperties: z.array(internal).length(1) }).strict().parse(captureCurrentPcbStringClockReply(input).value);
  const entries = new Map(value.result.map(item => [item.name, item]));
  const callback = entries.get("2")?.value, size = entries.get("length");
  need(entries.size === 4 && size?.value.type === "number" && size.value.value === 3 && size.writable && !size.enumerable && !size.configurable &&
    value.internalProperties[0]?.name === "[[Prototype]]" && value.internalProperties[0].value.subtype === "array");
  for (const key of ["0", "1", "2"]) { const item = entries.get(key); need(item !== undefined && item.writable && item.enumerable && item.configurable); }
  need(callback?.type === "function" && callback.className === "AsyncFunction" && callback.objectId !== undefined && typeof callback.description === "string" &&
    Buffer.byteLength(callback.description) === FUNCTIONS.callback.bytes && createHash("sha256").update(callback.description).digest("hex") === FUNCTIONS.callback.sha256);
  return callback.objectId;
}
export function decodeCurrentFootprintCopyMainCompletionCallbackMetadata(input: unknown, scriptId: string): void {
  const value = z.object({ result: z.array(property).length(2), internalProperties: z.array(internal).length(3) }).strict().parse(captureCurrentPcbStringClockReply(input).value);
  const entries = new Map(value.result.map(item => [item.name, item])), internals = new Map(value.internalProperties.map(item => [item.name, item.value]));
  const length = entries.get("length"), loc = internals.get("[[FunctionLocation]]"), name = entries.get("name"), parent = internals.get("[[Prototype]]"), scopes = internals.get("[[Scopes]]");
  const actual = point.parse(loc?.value), expected = FUNCTIONS.callback.functionLocation;
  need(entries.size === 2 && name?.value.type === "string" && name.value.value === "" && length?.value.type === "number" && length.value.value === 0 &&
    !name.writable && !name.enumerable && name.configurable && !length.writable && !length.enumerable && length.configurable &&
    internals.size === 3 && loc?.type === "object" && loc.subtype === "internal#location" && actual.scriptId === scriptId &&
    actual.lineNumber === expected.lineNumber && actual.columnNumber === expected.columnNumber && parent?.type === "object" && parent.className === "AsyncFunction" &&
    parent.objectId !== undefined && scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" &&
    scopes.objectId !== undefined && /^Scopes\[[1-8]\]$/u.test(scopes.description ?? ""));
}
const value = z.object({ historyUuid: z.string().regex(/^[a-f0-9]{32}$/u), backendActorUuid: z.string().regex(/^[a-f0-9]{32}$/u),
  observedProjectUpdatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/u), observedProjectModifierUuid: z.string().regex(/^[a-f0-9]{32}$/u),
  originalCallbackAwaitCompleted: z.literal(true), originalCommitAwaitCompleted: z.literal(true), originalProjectUpdateAwaitCompleted: z.literal(true),
  originalServiceAwaitCompleted: z.literal(true), controllerBodyJoined: z.literal(true), nativeSqlCompletionVerified: z.literal(false),
  parserUploadPublicationCompleted: z.literal(false), independentClosedSqlVerified: z.literal(false), savedResultVerified: z.literal(false), executionAuthorized: z.literal(false) }).strict();
export function decodeCurrentFootprintCopyMainCompletionValue(input: unknown): Readonly<z.infer<typeof value>> {
  const parsed = z.object({ result: z.object({ type: z.literal("object"), value }).strict() }).strict().parse(captureCurrentPcbStringClockReply(input).value);
  need(parsed.result.value.backendActorUuid === parsed.result.value.observedProjectModifierUuid); return freezeDeep(parsed.result.value);
}
export function requireCurrentFootprintCopyMainCompletionEmpty(input: unknown): void { empty.parse(captureCurrentPcbStringClockReply(input).value); }
