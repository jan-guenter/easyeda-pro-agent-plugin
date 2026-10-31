/** Fixed construction-only original-main vocabulary. The native original owner
 * selects the connection and script/call-frame handles. No session or URL enters
 * this command grammar, and no program invokes application methods. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_CALLS as CALLS, CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_EXPRESSION as EXPRESSION,
  CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_FLAGS as FLAGS, CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_GROUP as GROUP } from "./current-footprint-copy-main-backend-programs.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE as SOURCE, assertCurrentFootprintCopyMainBackendFunction } from "./current-footprint-copy-main-backend-source.ts";
import type { CurrentFootprintCopyMainBackendRole as Role } from "./current-footprint-copy-main-backend-source.ts";
import { CURRENT_FOOTPRINT_HEAD_AGE_CAPTURE_PROGRAM, CURRENT_FOOTPRINT_HEAD_AGE_OBSERVE_PROGRAM } from "./current-footprint-head-age-main.ts";

import { CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_BIND_PROGRAM, CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_CAPTURE_PROGRAM } from "./current-footprint-head-age-context.ts";

const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const object = z.object({ objectId: handle }).strict();
const flags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false),
  throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const breakpointLocation = z.object({ scriptId: handle, lineNumber: z.literal(SOURCE.registration.https.lineNumber),
  columnNumber: z.union([z.literal(SOURCE.registration.https.breakpointColumnNumber), z.literal(SOURCE.registration.http.breakpointColumnNumber)]) }).strict();
const breakpointParameters = z.object({ location: breakpointLocation }).strict(), sourceParameters = z.object({ scriptId: handle }).strict();
const frameParameters = z.object({ callFrameId: handle, expression: z.literal(EXPRESSION), objectGroup: z.literal(GROUP), silent: z.literal(true),
  returnByValue: z.literal(false), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), includeCommandLineAPI: z.literal(false) }).strict();
const captureParameters = z.object({ ...flags, objectId: handle, functionDeclaration: z.literal(CALLS.capture.program), arguments: z.tuple([]), returnByValue: z.literal(false) }).strict();
const headCaptureParameters = z.object({ ...flags, objectId: handle, functionDeclaration: z.literal(CURRENT_FOOTPRINT_HEAD_AGE_CAPTURE_PROGRAM), arguments: z.tuple([object, object]), returnByValue: z.literal(false) }).strict();
const headContextCaptureParameters = z.object({ ...flags, objectId: handle, functionDeclaration: z.literal(CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_CAPTURE_PROGRAM), arguments: z.tuple([object]), returnByValue: z.literal(false) }).strict();
const nativePidArgument = z.object({ value: z.number().int().positive().max(4_294_967_295) }).strict();
const headContextBindParameters = z.object({ ...flags, objectId: handle, functionDeclaration: z.literal(CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_BIND_PROGRAM), arguments: z.tuple([object, object, object, object, nativePidArgument]), returnByValue: z.literal(false) }).strict();
const headDateLiteral = z.object({ value: z.string().length(19).regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/u) }).strict();
const headWallEpoch = z.object({ value: z.number().int().min(0).max(253_402_214_399_999) }).strict();
const headObserveParameters = z.object({ ...flags, throwOnSideEffect: z.literal(false), objectId: handle,
  functionDeclaration: z.literal(CURRENT_FOOTPRINT_HEAD_AGE_OBSERVE_PROGRAM), arguments: z.tuple([
    headDateLiteral, headWallEpoch,
  ]), returnByValue: z.literal(true) }).strict();
const requireParameters = z.object({ ...flags, objectId: handle, functionDeclaration: z.literal(CALLS.require.program), arguments: z.tuple([object]), returnByValue: z.literal(true) }).strict();
const propertiesParameters = z.object({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }).strict();
export const CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_APP_URL_PATTERN = String.raw`(?:^|[\\/])app\.js$`;
export const CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REGISTRATION_BREAKPOINT_ID = `2:${String(SOURCE.registration.https.lineNumber)}:${String(SOURCE.registration.https.breakpointColumnNumber)}:${CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_APP_URL_PATTERN}`;
const breakpointId = z.union([handle, z.literal(CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REGISTRATION_BREAKPOINT_ID)]);
const releaseParameters = z.object({ objectGroup: z.literal(GROUP) }).strict(), removeParameters = z.object({ breakpointId }).strict();
const registrationParameters = z.object({ urlRegex: z.literal(CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_APP_URL_PATTERN),
  lineNumber: z.literal(SOURCE.registration.https.lineNumber), columnNumber: z.literal(SOURCE.registration.https.breakpointColumnNumber) }).strict();
const debuggerParameters = z.object({ maxScriptsCacheSize: z.literal(33_554_432) }).strict(), emptyParameters = z.object({}).strict();
const command = z.discriminatedUnion("phase", [
  z.object({ phase: z.literal("runtime-enable"), method: z.literal("Runtime.enable"), params: emptyParameters }).strict(),
  z.object({ phase: z.literal("debugger-enable"), method: z.literal("Debugger.enable"), params: debuggerParameters }).strict(),
  z.object({ phase: z.literal("run-waiting"), method: z.literal("Runtime.runIfWaitingForDebugger"), params: emptyParameters }).strict(),
  z.object({ phase: z.literal("resume"), method: z.literal("Debugger.resume"), params: emptyParameters }).strict(),
  z.object({ phase: z.literal("registration-arm"), method: z.literal("Debugger.setBreakpointByUrl"), params: registrationParameters }).strict(),
  z.object({ phase: z.literal("source"), method: z.literal("Debugger.getScriptSource"), params: sourceParameters }).strict(),
  z.object({ phase: z.literal("breakpoint"), method: z.literal("Debugger.setBreakpoint"), params: breakpointParameters }).strict(),
  z.object({ phase: z.literal("frame"), method: z.literal("Debugger.evaluateOnCallFrame"), params: frameParameters }).strict(),
  z.object({ phase: z.literal("capture"), method: z.literal("Runtime.callFunctionOn"), params: captureParameters }).strict(),
  z.object({ phase: z.literal("head-age-context-capture"), method: z.literal("Runtime.callFunctionOn"), params: headContextCaptureParameters }).strict(),
  z.object({ phase: z.literal("head-age-context-source"), method: z.literal("Debugger.getScriptSource"), params: sourceParameters }).strict(),
  z.object({ phase: z.literal("head-age-context-bind"), method: z.literal("Runtime.callFunctionOn"), params: headContextBindParameters }).strict(),
  z.object({ phase: z.literal("head-age-capture"), method: z.literal("Runtime.callFunctionOn"), params: headCaptureParameters }).strict(),
  z.object({ phase: z.literal("head-age-observe"), method: z.literal("Runtime.callFunctionOn"), params: headObserveParameters }).strict(),
  z.object({ phase: z.literal("require"), method: z.literal("Runtime.callFunctionOn"), params: requireParameters }).strict(),
  z.object({ phase: z.literal("properties"), method: z.literal("Runtime.getProperties"), params: propertiesParameters }).strict(),
  z.object({ phase: z.literal("remove"), method: z.literal("Debugger.removeBreakpoint"), params: removeParameters }).strict(),
  z.object({ phase: z.literal("release"), method: z.literal("Runtime.releaseObjectGroup"), params: releaseParameters }).strict(),
]);
export type CurrentFootprintCopyMainBackendCommand = Readonly<z.infer<typeof command>>;
/** Capture bounded plain data and require an exact fixed inspector command.
 * Validation freezes the result but issues no transport or native ownership. */
export function validateCurrentFootprintCopyMainBackendCommand(input: unknown): CurrentFootprintCopyMainBackendCommand {
  return freezeDeep(command.parse(captureCurrentPcbStringClockReply(input).value));
}
const point = z.object({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const remote = z.object({ type: z.string(), subtype: z.string().optional(), className: z.string().optional(), objectId: handle.optional(),
  description: z.string().max(8192).optional(), value: z.unknown().optional() }).strict();
const property = z.object({ name: z.string(), value: remote, writable: z.boolean(), enumerable: z.boolean(), configurable: z.boolean(), isOwn: z.literal(true) }).strict();
const internal = z.object({ name: z.string(), value: remote }).strict();
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_COPY_MAIN_BACKEND_REPLY"); } }
/** Match actual V8 function identity and source metadata independently of the
 * descriptor selector. Async functions use AsyncFunction as their class. */
export function decodeCurrentFootprintCopyMainBackendFunction(input: unknown, role: Role, expectedScriptId: string): void {
  const expected = SOURCE.functions[role]; const count = expected.async ? 2 : 3,
    reply = z.object({ result: z.array(property).length(count), internalProperties: z.array(internal).length(3) }).strict().parse(captureCurrentPcbStringClockReply(input).value);
  const fields = new Map(reply.result.map(item => [item.name, item])); need(fields.size === count);
  for (const key of ["name", "length"] as const) {
    const field = fields.get(key); need(field !== undefined && !field.writable && !field.enumerable && field.configurable && field.value.type === (key === "name" ? "string" : "number") &&
      field.value.value === (key === "name" ? expected.name : expected.arity) && field.value.objectId === undefined && !Object.is(field.value.value, -0));
  }
  if (!expected.async) {
    const prototype = fields.get("prototype"); need(prototype !== undefined && prototype.writable && !prototype.enumerable && !prototype.configurable &&
      prototype.value.type === "object" && prototype.value.className === "Object" && prototype.value.objectId !== undefined && prototype.value.value === undefined);
  }
  const entries = new Map(reply.internalProperties.map(item => [item.name, item.value])), location = entries.get("[[FunctionLocation]]"), parent = entries.get("[[Prototype]]"), scopes = entries.get("[[Scopes]]"); const actual = point.parse(location?.value);
  need(entries.size === 3 && location?.type === "object" && location.subtype === "internal#location" && location.objectId === undefined && actual.scriptId === expectedScriptId &&
    actual.lineNumber === expected.lineNumber && actual.columnNumber === expected.columnNumber && parent?.type === (expected.async ? "object" : "function") &&
    parent.className === (expected.async ? "AsyncFunction" : "Function") && parent.objectId !== undefined && parent.value === undefined &&
    scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.objectId !== undefined && scopes.value === undefined && /^Scopes\[[1-8]\]$/u.test(scopes.description ?? ""));
}
/** Return handles only after every fixed member and function text is checked.
 * The returned IDs are descriptive; the future mounted runner retains them. */
export function decodeCurrentFootprintCopyMainBackendArray(input: unknown): readonly string[] {
  const reply = z.object({ result: z.array(property).length(14), internalProperties: z.array(internal).length(1) }).strict().parse(captureCurrentPcbStringClockReply(input).value);
  const fields = new Map(reply.result.map(item => [item.name, item])); need(fields.size === 14);
  const length = fields.get("length"), parent = reply.internalProperties[0];
  need(length?.value.type === "number" && length.value.value === 13 && length.value.objectId === undefined && length.writable && !length.enumerable && !length.configurable &&
    parent?.name === "[[Prototype]]" && parent.value.type === "object" && parent.value.subtype === "array" && parent.value.className === "Array" && parent.value.objectId !== undefined && parent.value.value === undefined);
  const roles = new Map<number, Role>([[3, "protocolCallback"], [5, "driverIntercept"], [6, "driverCallback"], [7, "router"], [8, "actorClock"], [9, "projectSql"], [12, "dateParser"]]);
  return Object.freeze(Array.from({ length: 13 }, (_, index) => {
    const field = fields.get(String(index)), role = roles.get(index);
    need(field !== undefined && field.writable && field.enumerable && field.configurable && field.value.objectId !== undefined && field.value.value === undefined && field.value.subtype !== "proxy");
    if (role !== undefined) {
      need(field.value.type === "function" && field.value.className === (SOURCE.functions[role].async ? "AsyncFunction" : "Function") && field.value.subtype === undefined);
      assertCurrentFootprintCopyMainBackendFunction(role, field.value.description);
    } else if (index === 10 || index === 11) { need(field.value.type === "function" && field.value.className === "Function" && field.value.subtype === undefined); }
    else { need(field.value.type === "object"); }
    return field.value.objectId;
  }));
}
/** Native function internal properties exclude a JavaScript location and retain
 * the zero-scope V8 signature. No Date constructor or clock function is called. */
export function decodeCurrentFootprintCopyMainBackendNative(input: unknown, role: "Date" | "now"): void {
  const count = role === "Date" ? 6 : 2;
  const reply = z.object({ result: z.array(property).length(count), internalProperties: z.array(internal).length(2) }).strict().parse(captureCurrentPcbStringClockReply(input).value);
  const fields = new Map(reply.result.map(item => [item.name, item])); need(fields.size === count);
  for (const key of ["name", "length"] as const) {
    const expected: string | number = key === "name" ? role : 0;
    const arity = role === "Date" ? 7 : 0;
    const field = fields.get(key); need(field !== undefined && !field.writable && !field.enumerable && field.configurable && field.value.type === (key === "name" ? "string" : "number") &&
      field.value.value === (key === "name" ? expected : arity) && field.value.objectId === undefined && !Object.is(field.value.value, -0));
  }
  if (role === "Date") {
    const prototype = fields.get("prototype"); need(prototype !== undefined && !prototype.writable && !prototype.enumerable && !prototype.configurable &&
      prototype.value.type === "object" && prototype.value.className === "Object" && prototype.value.objectId !== undefined && prototype.value.value === undefined);
    for (const name of ["now", "parse", "UTC"] as const) {
      const field = fields.get(name); need(field !== undefined && field.writable && !field.enumerable && field.configurable && field.value.type === "function" &&
        field.value.className === "Function" && field.value.subtype === undefined && field.value.value === undefined && field.value.objectId !== undefined &&
        field.value.description === `function ${name}() { [native code] }`);
    }
  }
  const entries = new Map(reply.internalProperties.map(item => [item.name, item.value])), parent = entries.get("[[Prototype]]"), scopes = entries.get("[[Scopes]]");
  need(entries.size === 2 && parent?.type === "function" && parent.className === "Function" && parent.objectId !== undefined && parent.value === undefined &&
    scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.description === "Scopes[0]" && scopes.objectId !== undefined && scopes.value === undefined);
}
export const CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_CAPTURE_PARAMETERS = Object.freeze({ ...FLAGS,
  functionDeclaration: CALLS.capture.program, arguments: Object.freeze([]), returnByValue: false } as const);
