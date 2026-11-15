/** Closed readonly preparation of the native DEL's selected clock service.
 * These packets grant no qe, resume, task, Date.now, upload or mutation call. */
import { z } from "zod";
import { captureCurrentFootprintInverseDeleteBindingReply as capture } from "./current-footprint-inverse-delete-binding-capture.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_REGISTRATION_PROGRAMS as PROGRAMS } from "./current-footprint-inverse-native-delete-clock-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const group = "easyeda-footprint-inverse-native-delete-clock-registration-v1";
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_REGISTRATION_FLAGS = Object.freeze({
  objectGroup: group, silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false,
} as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), reference = z.strictObject({ objectId: handle });
const path = z.strictObject({ value: z.string().regex(/^[a-f\d]{64}$/u) }); const branch = z.strictObject({ value: z.string().regex(/^[a-f\d]{32}$/u) });
const tab = z.strictObject({ value: z.string().regex(/^[A-Za-z\d_-]{1,128}$/u) });
const flags = { objectGroup: z.literal(group), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true),
  awaitPromise: z.literal(false), userGesture: z.literal(false) };
const prefix = "inverse-native-delete-clock-registration-";
const propertyRoles = ["initial", "wrapper-function", "wrapper-scopes", "callback-function", "callback-scopes", "bindings", "now", "name",
  "sample-wrapper-function", "sample-wrapper-scopes", "sample-callback-function", "sample-callback-scopes"] as const;
const programs = ["initial", "callback", "bindings", "sample"] as const;
/* oxlint-disable unicorn/max-nested-calls -- Each native selector has a strict fixed positional argument roster. */
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal(`${prefix}initial`), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({
    ...flags, objectId: handle, functionDeclaration: z.literal(PROGRAMS.initial), arguments: z.tuple([path, branch, tab]), returnByValue: z.literal(false),
  }) }),
  z.strictObject({ phase: z.literal(`${prefix}callback`), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({
    ...flags, objectId: handle, functionDeclaration: z.literal(PROGRAMS.callback), arguments: z.tuple([]), returnByValue: z.literal(false),
  }) }),
  z.strictObject({ phase: z.literal(`${prefix}bindings`), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({
    ...flags, objectId: handle, functionDeclaration: z.literal(PROGRAMS.bindings), arguments: z.tuple([reference, reference, reference, path, branch, tab]), returnByValue: z.literal(false),
  }) }),
  z.strictObject({ phase: z.literal(`${prefix}sample`), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({
    ...flags, objectId: handle, functionDeclaration: z.literal(PROGRAMS.sample), arguments: z.tuple([reference, reference, reference, reference, path, branch, tab]), returnByValue: z.literal(true),
  }) }),
  z.strictObject({ phase: z.literal(`${prefix}properties`), role: z.enum(propertyRoles), method: z.literal("Runtime.getProperties"), params: z.strictObject({
    objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false),
  }) }),
  z.strictObject({ phase: z.literal(`${prefix}source`), role: z.enum(["wrapper", "callback"]), method: z.literal("Debugger.getScriptSource"), params: z.strictObject({ scriptId: handle }) }),
  z.strictObject({ phase: z.literal(`${prefix}helper`), role: z.enum(programs), method: z.literal("Debugger.getScriptSource"), params: z.strictObject({ scriptId: handle }) }),
]);
/* oxlint-enable unicorn/max-nested-calls */
export type CurrentFootprintInverseNativeDeleteClockRegistrationCommand = Readonly<z.infer<typeof schema>>;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_REGISTRATION_REQUESTS = Object.freeze({
  normal: 18, helpers: 4, cdpRequests: 22, controls: 24, resumes: 0, completeClockLifecycleReserved: false, executionAuthorized: false,
} as const);
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_REGISTRATION_ORDER = Object.freeze([
  "initial", "properties/initial", "properties/wrapper-function", "source/wrapper", "properties/wrapper-scopes",
  "callback", "properties/callback-function", "source/callback", "properties/callback-scopes",
  "bindings", "properties/bindings", "properties/now", "properties/name", "properties/sample-wrapper-function",
  "properties/sample-wrapper-scopes", "properties/sample-callback-function", "properties/sample-callback-scopes", "sample",
] as const);
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_DELETE_CLOCK_REGISTRATION_PROTOCOL"); } }
export function validateCurrentFootprintInverseNativeDeleteClockRegistrationCommand(input: unknown): CurrentFootprintInverseNativeDeleteClockRegistrationCommand {
  return freezeDeep(schema.parse(capture(input)));
}
export function currentFootprintInverseNativeDeleteClockRegistrationKey(input: CurrentFootprintInverseNativeDeleteClockRegistrationCommand): string {
  const command = validateCurrentFootprintInverseNativeDeleteClockRegistrationCommand(input);
  const phase = command.phase.slice(prefix.length);
  return "role" in command ? `${phase}/${command.role}` : phase;
}
export function currentFootprintInverseNativeDeleteClockRegistrationProgram(input: CurrentFootprintInverseNativeDeleteClockRegistrationCommand): string | null {
  const command = validateCurrentFootprintInverseNativeDeleteClockRegistrationCommand(input);
  return command.method === "Runtime.callFunctionOn" ? command.params.functionDeclaration : null;
}
export function currentFootprintInverseNativeDeleteClockRegistrationHelperCommand(input: CurrentFootprintInverseNativeDeleteClockRegistrationCommand, scriptId: string): CurrentFootprintInverseNativeDeleteClockRegistrationCommand {
  const command = validateCurrentFootprintInverseNativeDeleteClockRegistrationCommand(input);
  need(command.method === "Runtime.callFunctionOn");
  const role = programs.find(value => `${prefix}${value}` === command.phase); need(role !== undefined);
  return validateCurrentFootprintInverseNativeDeleteClockRegistrationCommand({ phase: `${prefix}helper`, role, method: "Debugger.getScriptSource", params: { scriptId } });
}
export function qualifyCurrentFootprintInverseNativeDeleteClockRegistrationHelper(source: unknown, input: CurrentFootprintInverseNativeDeleteClockRegistrationCommand): void {
  const program = currentFootprintInverseNativeDeleteClockRegistrationProgram(input);
  need(program !== null && typeof source === "string" && source === `(${program})`);
}

/** The original pipe supplies the session and ID; matching JSON enrolls no Job. */
export function currentFootprintInverseNativeDeleteClockRegistrationWire(input: CurrentFootprintInverseNativeDeleteClockRegistrationCommand, id: number, sessionId: string): CurrentFootprintInverseNativeDeleteClockRegistrationCommand & Readonly<{ id: number; sessionId: string; inverseNativeDeleteClockRegistration: true }> {
  need(Number.isSafeInteger(id) && id > 0); handle.parse(sessionId);
  return freezeDeep({ ...validateCurrentFootprintInverseNativeDeleteClockRegistrationCommand(input), id, sessionId, inverseNativeDeleteClockRegistration: true });
}
const marker = (name: string): string => `__inverse_native_delete_clock_registration_${name}__`;
function fieldNames(command: CurrentFootprintInverseNativeDeleteClockRegistrationCommand): readonly string[] {
  if (command.method !== "Runtime.callFunctionOn") { return Object.freeze(command.method === "Runtime.getProperties" ? ["objectId"] : ["scriptId"]); }
  if (command.phase === "inverse-native-delete-clock-registration-initial") { return Object.freeze(["objectId", "projectUuid", "branchUuid", "windowTabId"]); }
  if (command.phase === "inverse-native-delete-clock-registration-callback") { return Object.freeze(["objectId"]); }
  return Object.freeze(["objectId", "arg0", "arg1", "arg2", ...(command.phase === "inverse-native-delete-clock-registration-sample" ? ["arg3"] : []), "projectUuid", "branchUuid", "windowTabId"]);
}
export function currentFootprintInverseNativeDeleteClockRegistrationTemplate(input: CurrentFootprintInverseNativeDeleteClockRegistrationCommand): Readonly<{ key: string; method: string; names: readonly string[]; template: string }> {
  const command = validateCurrentFootprintInverseNativeDeleteClockRegistrationCommand(input), names = fieldNames(command);
  const params: Record<string, unknown> = { ...command.params };
  if (command.method === "Runtime.getProperties") { params["objectId"] = marker("objectId"); }
  else if (command.method === "Debugger.getScriptSource") { params["scriptId"] = marker("scriptId"); }
  else {
    params["objectId"] = marker("objectId");
    params["functionDeclaration"] = marker(`program_${command.phase.slice(prefix.length)}`);
    let ref = 0, value = 0; const values = ["projectUuid", "branchUuid", "windowTabId"] as const;
    params["arguments"] = command.params.arguments.map(argument => {
      if ("objectId" in argument) { const name = `arg${ref}`; ref += 1; return { objectId: marker(name) }; }
      const name = values[value]; value += 1; need(name !== undefined); return { value: marker(name) };
    });
  }
  const role = "role" in command ? `:${command.role}` : "";
  return Object.freeze({ key: command.phase.slice(prefix.length) + role, method: command.method, names,
    template: JSON.stringify({ method: command.method, params }) });
}
/** Reconstruct the exact emitted renderer bytes before scalar native projection. */
export function currentFootprintInverseNativeDeleteClockRegistrationNativeFrame(bytes: Buffer, input: CurrentFootprintInverseNativeDeleteClockRegistrationCommand, sessionId: string): Readonly<Record<string, string | number>> {
  need(bytes.length <= 65_536 && bytes.at(-1) === 0);
  const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(0, -1)));
  const id = z.looseObject({ id: z.number().int().positive() }).parse(capture(raw)).id;
  const command = validateCurrentFootprintInverseNativeDeleteClockRegistrationCommand(input);
  need(bytes.toString("utf8") === `${JSON.stringify(currentFootprintInverseNativeDeleteClockRegistrationWire(command, id, sessionId))}\0`);
  const result: Record<string, string | number> = { action: "footprint-inverse-native-delete-clock-registration", requestId: id, phase: command.phase, method: command.method };
  if ("role" in command) { result["role"] = command.role; }
  if (command.method === "Runtime.getProperties") { result["objectId"] = command.params.objectId; }
  else if (command.method === "Debugger.getScriptSource") { result["scriptId"] = command.params.scriptId; }
  else {
    result["objectId"] = command.params.objectId; let ref = 0, value = 0;
    const values = ["projectUuid", "branchUuid", "windowTabId"] as const;
    for (const argument of command.params.arguments) {
      if ("objectId" in argument) { result[`arg${ref}`] = argument.objectId; ref += 1; }
      else { const name = values[value]; value += 1; need(name !== undefined); result[name] = argument.value; }
    }
  }
  return Object.freeze(result);
}
function caseReference(): Readonly<{ objectId: string }> { return { objectId: "original_ref" }; }
/** Fixed codec/shape cases only. These contain no original callback or owner. */
export function currentFootprintInverseNativeDeleteClockRegistrationCases(): readonly CurrentFootprintInverseNativeDeleteClockRegistrationCommand[] {
  const values = [{ value: "a".repeat(64) }, { value: "b".repeat(32) }, { value: "original_tab" }] as const;
  const commands: unknown[] = [
    { phase: `${prefix}initial`, method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_REGISTRATION_FLAGS, objectId: "original_ref", functionDeclaration: PROGRAMS.initial, arguments: values, returnByValue: false } },
    { phase: `${prefix}callback`, method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_REGISTRATION_FLAGS, objectId: "original_ref", functionDeclaration: PROGRAMS.callback, arguments: [], returnByValue: false } },
    { phase: `${prefix}bindings`, method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_REGISTRATION_FLAGS, objectId: "original_ref", functionDeclaration: PROGRAMS.bindings, arguments: [caseReference(), caseReference(), caseReference(), ...values], returnByValue: false } },
    { phase: `${prefix}sample`, method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_REGISTRATION_FLAGS, objectId: "original_ref", functionDeclaration: PROGRAMS.sample, arguments: [caseReference(), caseReference(), caseReference(), caseReference(), ...values], returnByValue: true } },
    ...propertyRoles.map(role => ({ phase: `${prefix}properties`, role, method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } })),
    ...["wrapper", "callback"].map(role => ({ phase: `${prefix}source`, role, method: "Debugger.getScriptSource", params: { scriptId: "original_ref" } })),
    ...programs.map(role => ({ phase: `${prefix}helper`, role, method: "Debugger.getScriptSource", params: { scriptId: "original_ref" } })),
  ];
  return freezeDeep(commands.map(value => validateCurrentFootprintInverseNativeDeleteClockRegistrationCommand(value)));
}
