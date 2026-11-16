/** Closed readonly cold native-get grammar. The original cold factory must
 * retain every handle, helper script and request; wire JSON creates no owner. */
import { z } from "zod";
import { captureCurrentFootprintInverseDeleteBindingReply as capture } from "./current-footprint-inverse-delete-binding-capture.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_GET_PROGRAMS as PROGRAMS, CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_GET_SIGNATURES as SIGNATURES } from "./current-footprint-inverse-native-delete-cold-get-programs.ts";

const prefix = "inverse-native-delete-cold-get-";
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const ref = z.strictObject({ objectId: handle });
export const currentFootprintInverseNativeDeleteColdGetTargetSchema = z.strictObject({
  projectUuid: z.string().regex(/^[a-f0-9]{64}$(?![\s\S])/u),
  branchUuid: z.string().regex(/^[a-f0-9]{32}$(?![\s\S])/u),
  targetUuid: z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$(?![\s\S])/u),
  maximumTicket: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
});
const value = z.strictObject({ value: currentFootprintInverseNativeDeleteColdGetTargetSchema });
const roles = ["project", "footprint", "methods", "snapshot", "read", "result", "reprove"] as const;
const properties = ["projectFootprint", "footprintView", "methods", "get", "getData", "proof", "read", "result"] as const;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_GET_FLAGS = Object.freeze({
  objectGroup: "easyeda-native-delete-cold-get-v1", silent: true, generatePreview: false,
  throwOnSideEffect: true, awaitPromise: false, userGesture: false,
} as const);
const flags = {
  objectGroup: z.literal(CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_GET_FLAGS.objectGroup),
  silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true),
  awaitPromise: z.literal(false), userGesture: z.literal(false),
};
const sourceSchema = z.string().min(1).max(32_768);
const argumentsSchema = z.array(z.union([ref, value])).max(6);
const callParams = z.strictObject({ ...flags, objectId: handle, functionDeclaration: sourceSchema,
  arguments: argumentsSchema, returnByValue: z.boolean() });
const propertyParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true),
  accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const schema = z.discriminatedUnion("method", [
  z.strictObject({ phase: z.literal("inverse-native-delete-cold-get-call"), role: z.enum(roles), method: z.literal("Runtime.callFunctionOn"),
    params: callParams }),
  z.strictObject({ phase: z.literal("inverse-native-delete-cold-get-properties"), role: z.enum(properties), method: z.literal("Runtime.getProperties"),
    params: propertyParams }),
  z.strictObject({ phase: z.literal("inverse-native-delete-cold-get-helper"), method: z.literal("Debugger.getScriptSource"),
    params: z.strictObject({ scriptId: handle }) }),
]);
export type CurrentFootprintInverseNativeDeleteColdGetCommand = Readonly<z.infer<typeof schema>>;
export type CurrentFootprintInverseNativeDeleteColdGetRole = typeof roles[number];
export type CurrentFootprintInverseNativeDeleteColdGetPropertyRole = typeof properties[number];
export type CurrentFootprintInverseNativeDeleteColdGetTarget = Readonly<z.infer<typeof currentFootprintInverseNativeDeleteColdGetTargetSchema>>;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_GET_REQUESTS = freezeDeep({
  preparationNormal: 10, preparationHelpers: 4,
  samples: 2, sampleNormal: 4, sampleHelpers: 2,
  finalNormal: 1, finalHelpers: 1,
  normal: 19, helpers: 9, cdpRequests: 28, events: 9, resumes: 0,
  originalManagerInvocations: 2, cacheWrites: 0, saveRequests: 0,
});
function need(ok: boolean): asserts ok { if (!ok) { throw new Error("INVERSE_NATIVE_DELETE_COLD_GET_COMMAND"); } }
export function validateCurrentFootprintInverseNativeDeleteColdGetCommand(input: unknown): CurrentFootprintInverseNativeDeleteColdGetCommand {
  const command = schema.parse(capture(input));
  if (command.method === "Runtime.callFunctionOn") {
    const spec = SIGNATURES[command.role];
    need(command.params.functionDeclaration === PROGRAMS[command.role] && command.params.returnByValue === spec.byValue &&
      command.params.arguments.length === spec.references + (spec.target ? 1 : 0));
    for (const [index, arg] of command.params.arguments.entries()) {
      need(index < spec.references ? "objectId" in arg : spec.target && "value" in arg);
    }
  }
  return freezeDeep(command);
}
export function currentFootprintInverseNativeDeleteColdGetProgram(input: CurrentFootprintInverseNativeDeleteColdGetCommand): string | null {
  const command = validateCurrentFootprintInverseNativeDeleteColdGetCommand(input);
  return command.method === "Runtime.callFunctionOn" ? command.params.functionDeclaration : null;
}
export function qualifyCurrentFootprintInverseNativeDeleteColdGetHelper(input: unknown, command: CurrentFootprintInverseNativeDeleteColdGetCommand): void {
  const source = z.strictObject({ scriptSource: z.string().max(32_768) }).parse(capture(input));
  const program = currentFootprintInverseNativeDeleteColdGetProgram(command);
  need(program !== null && source.scriptSource === `(${program})`);
}
export function currentFootprintInverseNativeDeleteColdGetWire(input: CurrentFootprintInverseNativeDeleteColdGetCommand,
  id: number, sessionId: string): CurrentFootprintInverseNativeDeleteColdGetCommand & Readonly<{ id: number; sessionId: string; inverseNativeDeleteColdGet: true }> {
  need(Number.isSafeInteger(id) && id > 0 && id <= 2_147_483_647); handle.parse(sessionId);
  return freezeDeep({ ...validateCurrentFootprintInverseNativeDeleteColdGetCommand(input), id, sessionId, inverseNativeDeleteColdGet: true });
}
export function currentFootprintInverseNativeDeleteColdGetNativeFrame(bytes: Buffer, input: CurrentFootprintInverseNativeDeleteColdGetCommand,
  sessionId: string): Readonly<Record<string, string | number>> {
  need(bytes.length <= 65_536 && bytes.at(-1) === 0);
  const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(0, -1)));
  const id = z.looseObject({ id: z.number().int().positive().max(2_147_483_647) }).parse(capture(raw)).id;
  const command = validateCurrentFootprintInverseNativeDeleteColdGetCommand(input);
  need(bytes.toString("utf8") === `${JSON.stringify(currentFootprintInverseNativeDeleteColdGetWire(command,id,sessionId))}\0`);
  const fields: Record<string, string | number> = { action: "footprint-inverse-native-delete-cold-get", requestId: id, phase: command.phase, method: command.method };
  if (command.method === "Debugger.getScriptSource") { fields["scriptId"] = command.params.scriptId; }
  else {
    fields["role"] = command.role; fields["objectId"] = command.params.objectId;
    if (command.method === "Runtime.callFunctionOn") {
      for (const [index, arg] of command.params.arguments.entries()) {
        if ("objectId" in arg) { fields[`reference${String(index)}`] = arg.objectId; }
        else { fields["projectUuid"] = arg.value.projectUuid; fields["branchUuid"] = arg.value.branchUuid; fields["documentUuid"] = arg.value.targetUuid; fields["ticket"] = arg.value.maximumTicket; }
      }
    }
  }
  return Object.freeze(fields);
}
export function currentFootprintInverseNativeDeleteColdGetCases(): readonly CurrentFootprintInverseNativeDeleteColdGetCommand[] {
  const sample = { projectUuid: "1".repeat(64), branchUuid: "3".repeat(32), targetUuid: "2".repeat(16), maximumTicket: 7 };
  const calls = roles.map(role => {
    const spec = SIGNATURES[role];
    const args: ({ objectId: string } | { value: typeof sample })[] = Array.from({ length: spec.references }, () => ({ objectId: "original_ref" }));
    if (spec.target) { args.push({ value: sample }); }
    return { phase: "inverse-native-delete-cold-get-call", role, method: "Runtime.callFunctionOn",
      params: { ...CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_GET_FLAGS, objectId: "original_ref", functionDeclaration: PROGRAMS[role], arguments: args, returnByValue: spec.byValue } };
  });
  return freezeDeep([
    ...calls, ...properties.map(role => ({ phase: "inverse-native-delete-cold-get-properties", role, method: "Runtime.getProperties",
      params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } })),
    { phase: "inverse-native-delete-cold-get-helper", method: "Debugger.getScriptSource", params: { scriptId: "original_helper" } },
  ].map(candidate => validateCurrentFootprintInverseNativeDeleteColdGetCommand(candidate)));
}
export function currentFootprintInverseNativeDeleteColdGetTemplate(input: CurrentFootprintInverseNativeDeleteColdGetCommand): Readonly<{
  key: string; method: string; names: readonly string[]; template: string; values: Readonly<Record<string, string | number>>;
}> {
  const command = validateCurrentFootprintInverseNativeDeleteColdGetCommand(input);
  const params: Record<string, unknown> = { ...command.params }; const values: Record<string, string | number> = {};
  const field = (name: string, actual: string | number): string => { need(!Object.hasOwn(values, name)); values[name] = actual; return `__cold_get_${name}__`; };
  if (command.method === "Debugger.getScriptSource") { params["scriptId"] = field("scriptId", command.params.scriptId); }
  else {
    params["objectId"] = field("objectId", command.params.objectId);
    if (command.method === "Runtime.callFunctionOn") {
      params["functionDeclaration"] = `__cold_get_program_${command.role}__`;
      params["arguments"] = command.params.arguments.map((arg, index) => "objectId" in arg ? { objectId: field(`reference${String(index)}`, arg.objectId) } :
        { value: { projectUuid: field("projectUuid", arg.value.projectUuid), branchUuid: field("branchUuid", arg.value.branchUuid), targetUuid: field("documentUuid", arg.value.targetUuid), maximumTicket: field("ticket", arg.value.maximumTicket) } });
    }
  }
  return freezeDeep({ key: command.phase.slice(prefix.length) + ("role" in command ? ":" + command.role : ""),
    method: command.method, names: Object.keys(values), template: JSON.stringify({ method: command.method, params }), values });
}

/** Fixed private readonly channel selector; it creates no owner or origin. */
export function currentFootprintInverseNativeDeleteColdGetFixedWire(input:unknown,id:number,sessionId:string):Readonly<{command:CurrentFootprintInverseNativeDeleteColdGetCommand;request:Readonly<Record<string,string|number>>}>{
 const command=validateCurrentFootprintInverseNativeDeleteColdGetCommand(input),packet=currentFootprintInverseNativeDeleteColdGetWire(command,id,sessionId);
 const bytes=Buffer.from(JSON.stringify(packet)+String.fromCodePoint(0));
 const request=currentFootprintInverseNativeDeleteColdGetNativeFrame(bytes,command,sessionId);
 return Object.freeze({command,request});
}
