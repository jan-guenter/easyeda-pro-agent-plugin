/** Finite readonly native metadata preparation while original F2 is held. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_LOOKUP_NATIVE_PROGRAMS as P } from "./current-footprint-inverse-lookup-native-programs.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), ref = z.strictObject({ objectId: handle });
export const CURRENT_FOOTPRINT_INVERSE_GET_INTRINSICS_CALLS = freezeDeep({
  roots: { program: P.roots, refs: 0, byValue: false }, prototypes: { program: P.prototypes, refs: 1, byValue: false },
  parents: { program: P.parents, refs: 1, byValue: false }, nextParents: { program: P.nextParents, refs: 1, byValue: false }, merge: { program: P.merge, refs: 2, byValue: false },
  members: { program: P.members, refs: 2, byValue: false }, defaultInstance: { program: P.defaultInstance, refs: 3, byValue: true }, hooks: { program: P.hooks, refs: 2, byValue: true },
  iterator: { program: P.iterator, refs: 1, byValue: false }, iteratorNext: { program: P.iteratorNext, refs: 2, byValue: false }, asyncPrototype: { program: P.asyncPrototype, refs: 0, byValue: false },
} as const);
export const CURRENT_FOOTPRINT_INVERSE_GET_INTRINSICS_FLAGS = Object.freeze({ objectGroup: "easyeda-footprint-inverse-get-intrinsics-v1", silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
const flags = { objectGroup: z.literal(CURRENT_FOOTPRINT_INVERSE_GET_INTRINSICS_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const roles = ["roots", "prototypes", "parents", "nextParents", "merge", "members", "defaultInstance", "hooks", "iterator", "iteratorNext", "asyncPrototype"] as const;
const callParams = z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.string().max(16_384), arguments: z.array(ref).max(3), returnByValue: z.boolean() });
const propertyParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const sourceParams = z.strictObject({ scriptId: handle });
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("inverse-get-intrinsics-call"), role: z.enum(roles), method: z.literal("Runtime.callFunctionOn"), params: callParams }),
  z.strictObject({ phase: z.literal("inverse-get-intrinsics-properties"), method: z.literal("Runtime.getProperties"), params: propertyParams }),
  z.strictObject({ phase: z.literal("inverse-get-intrinsics-helper"), method: z.literal("Debugger.getScriptSource"), params: sourceParams }),
]);
export type CurrentFootprintInverseGetIntrinsicsCommand = Readonly<z.infer<typeof schema>>;
export const CURRENT_FOOTPRINT_INVERSE_GET_INTRINSICS_REQUESTS = Object.freeze({ calls: 21, properties: 128, helpers: 21, cdpRequests: 170, controls: 172 } as const);
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_GET_INTRINSICS_COMMAND"); } }
export function validateCurrentFootprintInverseGetIntrinsicsCommand(input: unknown): CurrentFootprintInverseGetIntrinsicsCommand { const command = schema.parse(capture(input)); if (command.method === "Runtime.callFunctionOn") { const row = CURRENT_FOOTPRINT_INVERSE_GET_INTRINSICS_CALLS[command.role]; need(command.params.functionDeclaration === row.program && command.params.arguments.length === row.refs && command.params.returnByValue === row.byValue); } return freezeDeep(command); }
export function currentFootprintInverseGetIntrinsicsProgram(command: CurrentFootprintInverseGetIntrinsicsCommand): string | null { return command.method === "Runtime.callFunctionOn" ? command.params.functionDeclaration : null; }
export function qualifyCurrentFootprintInverseGetIntrinsicsHelper(input: unknown, program: string): void { const source = z.strictObject({ scriptSource: z.string().max(16_386) }).parse(capture(input)); need(Object.values(CURRENT_FOOTPRINT_INVERSE_GET_INTRINSICS_CALLS).some(row => row.program === program) && source.scriptSource === `(${program})`); }
export function currentFootprintInverseGetIntrinsicsWire(input: CurrentFootprintInverseGetIntrinsicsCommand, id: number, sessionId: string): CurrentFootprintInverseGetIntrinsicsCommand & Readonly<{ id: number; sessionId: string; inverseGetIntrinsics: true }> { need(Number.isSafeInteger(id) && id > 0); handle.parse(sessionId); return freezeDeep({ ...validateCurrentFootprintInverseGetIntrinsicsCommand(input), id, sessionId, inverseGetIntrinsics: true }); }
export function currentFootprintInverseGetIntrinsicsNativeFrame(bytes: Buffer, input: CurrentFootprintInverseGetIntrinsicsCommand, sessionId: string): Readonly<Record<string, string | number>> {
  need(bytes.length <= 65_536 && bytes.at(-1) === 0); const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(0, -1))); const id = z.looseObject({ id: z.number().int().positive() }).parse(capture(raw)).id; const command = validateCurrentFootprintInverseGetIntrinsicsCommand(input); need(bytes.toString("utf8") === `${JSON.stringify(currentFootprintInverseGetIntrinsicsWire(command, id, sessionId))}\0`);
  const fields: Record<string, string | number> = { action: "footprint-inverse-get-intrinsics", requestId: id, phase: command.phase, method: command.method };
  if (command.method === "Debugger.getScriptSource") { fields["scriptId"] = command.params.scriptId; } else { fields["objectId"] = command.params.objectId; if (command.method === "Runtime.callFunctionOn") { fields["role"] = command.role; for (const [index, value] of command.params.arguments.entries()) { fields[`reference${String(index)}`] = value.objectId; } } } return Object.freeze(fields);
}
export function currentFootprintInverseGetIntrinsicsCases(): readonly CurrentFootprintInverseGetIntrinsicsCommand[] { return freezeDeep([
  ...roles.map(role => { const row = CURRENT_FOOTPRINT_INVERSE_GET_INTRINSICS_CALLS[role]; return { phase: "inverse-get-intrinsics-call", role, method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_INVERSE_GET_INTRINSICS_FLAGS, objectId: "original_ref", functionDeclaration: row.program, arguments: Array.from({ length: row.refs }, () => ({ objectId: "original_ref" })), returnByValue: row.byValue } }; }),
  { phase: "inverse-get-intrinsics-properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
  { phase: "inverse-get-intrinsics-helper", method: "Debugger.getScriptSource", params: { scriptId: "original_ref" } },
].map(value => validateCurrentFootprintInverseGetIntrinsicsCommand(value))); }
export function currentFootprintInverseGetIntrinsicsTemplate(input: CurrentFootprintInverseGetIntrinsicsCommand): Readonly<{ key: string; method: string; names: readonly string[]; template: string }> {
  const command = validateCurrentFootprintInverseGetIntrinsicsCommand(input); const names: string[] = []; const field = (name: string): string => { need(!names.includes(name)); names.push(name); return `__get_intrinsics_${name}__`; }; const params: Record<string, unknown> = { ...command.params };
  if (command.method === "Debugger.getScriptSource") { params["scriptId"] = field("scriptId"); } else { params["objectId"] = field("objectId"); if (command.method === "Runtime.callFunctionOn") { params["functionDeclaration"] = `__get_intrinsics_program_${command.role}__`; params["arguments"] = command.params.arguments.map((_, index) => ({ objectId: field(`reference${String(index)}`) })); } }
  return freezeDeep({ key: command.phase.slice("inverse-get-intrinsics-".length) + ("role" in command ? `:${command.role}` : ""), method: command.method, names, template: JSON.stringify({ method: command.method, params }) });
}
