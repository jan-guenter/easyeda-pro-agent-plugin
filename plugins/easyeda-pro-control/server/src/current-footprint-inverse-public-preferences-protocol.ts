/** Original Storage backup/guard vocabulary. Restoration remains absent until
 * actual G9o entry/return and its poststate have their own original grant. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_PREFERENCE_PROGRAMS as P } from "./current-footprint-inverse-public-preferences-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_PREFERENCES_SOURCE as SITE } from "./current-footprint-inverse-public-preferences-source.ts";

const h = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), ref = z.strictObject({ objectId: h });
const roles = ["roots", "members", "storage", "backup", "before"] as const;
const propertyRoles = ["roots", "members", "storage", "backup", "census"] as const;
const functionRoles = ["constructor", "getter", "g9o", "length", "remove", "set"] as const;
export const CURRENT_FOOTPRINT_INVERSE_PUBLIC_PREFERENCES_GROUP = "easyeda-footprint-inverse-public-preferences-v1";
export const CURRENT_FOOTPRINT_INVERSE_PUBLIC_PREFERENCES_FLAGS = Object.freeze({ objectGroup: CURRENT_FOOTPRINT_INVERSE_PUBLIC_PREFERENCES_GROUP, silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
const flags = { objectGroup: z.literal(CURRENT_FOOTPRINT_INVERSE_PUBLIC_PREFERENCES_GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const properties = z.strictObject({ objectId: h, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
export const CURRENT_FOOTPRINT_INVERSE_PUBLIC_PREFERENCES_CALLS = freezeDeep({ roots: { program: P.roots, args: 1, value: false }, members: { program: P.members, args: 0, value: false }, storage: { program: P.storage, args: 1, value: false }, backup: { program: P.backup, args: 0, value: false }, before: { program: P.before, args: 1, value: true } } as const);
/* oxlint-disable unicorn/max-nested-calls -- Closed literal CDP vocabulary only. */
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("inverse-public-preferences-call"), role: z.enum(roles), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: h, functionDeclaration: z.string().max(16_384), arguments: z.array(ref).max(1), returnByValue: z.boolean() }) }),
  z.strictObject({ phase: z.literal("inverse-public-preferences-properties"), role: z.enum(propertyRoles), method: z.literal("Runtime.getProperties"), params: properties }),
  z.strictObject({ phase: z.literal("inverse-public-preferences-function"), role: z.enum(functionRoles), method: z.literal("Runtime.getProperties"), params: properties }),
  z.strictObject({ phase: z.literal("inverse-public-preferences-arm"), role: z.enum(["entry", "returned"]), method: z.literal("Debugger.setBreakpoint"), params: z.strictObject({ location: z.strictObject({ scriptId: h, lineNumber: z.literal(SITE.lineNumber), columnNumber: z.union([z.literal(SITE.entryColumn), z.literal(SITE.returnedColumn)]) }), condition: z.literal("") }) }),
  z.strictObject({ phase: z.literal("inverse-public-preferences-helper"), method: z.literal("Debugger.getScriptSource"), params: z.strictObject({ scriptId: h }) }),
]);
/* oxlint-enable unicorn/max-nested-calls */
export type CurrentFootprintInversePublicPreferencesCommand = Readonly<z.infer<typeof schema>>;
export const CURRENT_FOOTPRINT_INVERSE_PUBLIC_PREFERENCES_REQUESTS = Object.freeze({ normal: 19, helpers: 5, cdpRequests: 24, controls: 26, events: 7, restorationAuthorized: false, cleanupAfterOriginalExit: 0 });
function need(condition: boolean): asserts condition { if (!condition) { throw new Error("FOOTPRINT_INVERSE_PREFERENCES_PROTOCOL"); } }
export function validateCurrentFootprintInversePublicPreferencesCommand(input: unknown): CurrentFootprintInversePublicPreferencesCommand {
  const command = schema.parse(capture(input)); if (command.phase === "inverse-public-preferences-call") { const expected = CURRENT_FOOTPRINT_INVERSE_PUBLIC_PREFERENCES_CALLS[command.role]; need(command.params.functionDeclaration === expected.program && command.params.arguments.length === expected.args && command.params.returnByValue === expected.value); }
  else if (command.phase === "inverse-public-preferences-arm") { need(command.params.location.columnNumber === (command.role === "entry" ? SITE.entryColumn : SITE.returnedColumn)); }
  return freezeDeep(command);
}
export function currentFootprintInversePublicPreferencesProgram(command: CurrentFootprintInversePublicPreferencesCommand): string | null { return command.phase === "inverse-public-preferences-call" ? command.params.functionDeclaration : null; }
export function qualifyCurrentFootprintInversePublicPreferencesHelper(input: unknown, program: string): void { need(Object.values(CURRENT_FOOTPRINT_INVERSE_PUBLIC_PREFERENCES_CALLS).some(row => row.program === program)); const raw = z.strictObject({ scriptSource: z.string().max(16_386) }).parse(capture(input)); need(raw.scriptSource === `(${program})`); }
export function currentFootprintInversePublicPreferencesKey(command: CurrentFootprintInversePublicPreferencesCommand): string { return command.phase.slice(27) + ("role" in command ? `:${command.role}` : ""); }
const order = Object.freeze(["call:roots", "properties:roots", "function:constructor", "function:getter", "function:g9o", "call:members", "properties:members", "function:length", "function:remove", "function:set", "call:storage", "properties:storage", "properties:census", "call:backup", "properties:backup", "call:before", "properties:census", "arm:entry", "arm:returned"]);
export function currentFootprintInversePublicPreferencesOrder(index: number): string { need(Number.isSafeInteger(index) && index >= 0 && !Object.is(index, -0) && index < order.length); return order[index] ?? "unreachable"; }
export function currentFootprintInversePublicPreferencesWire(input: CurrentFootprintInversePublicPreferencesCommand, id: number, sessionId: string): CurrentFootprintInversePublicPreferencesCommand & Readonly<{ id: number; sessionId: string; inversePublicPreferences: true }> { need(Number.isSafeInteger(id) && id > 0); h.parse(sessionId); return freezeDeep({ ...validateCurrentFootprintInversePublicPreferencesCommand(input), id, sessionId, inversePublicPreferences: true }); }
export function currentFootprintInversePublicPreferencesNativeFrame(bytes: Buffer, input: CurrentFootprintInversePublicPreferencesCommand, sessionId: string): Readonly<Record<string, string | number>> {
  need(bytes.length <= 65_536 && bytes.at(-1) === 0); const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(0, -1))); const id = z.looseObject({ id: z.number().int().positive() }).parse(capture(raw)).id; const command = validateCurrentFootprintInversePublicPreferencesCommand(input); need(bytes.toString("utf8") === `${JSON.stringify(currentFootprintInversePublicPreferencesWire(command, id, sessionId))}\0`);
  const fields: Record<string, string | number> = { action: "footprint-inverse-public-preferences", requestId: id, phase: command.phase, method: command.method }; if ("role" in command) { fields["role"] = command.role; }
  if (command.phase === "inverse-public-preferences-arm") { fields["scriptId"] = command.params.location.scriptId; }
  else if (command.method === "Debugger.getScriptSource") { fields["scriptId"] = command.params.scriptId; }
  else { fields["objectId"] = command.params.objectId; if (command.method === "Runtime.callFunctionOn") { for (const [index, arg] of command.params.arguments.entries()) { fields[`argument${String(index)}`] = arg.objectId; } } }
  return Object.freeze(fields);
}
export function currentFootprintInversePublicPreferencesCases(): readonly CurrentFootprintInversePublicPreferencesCommand[] {
  const params = { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } as const;
  return freezeDeep([
    ...roles.map(role => { const row = CURRENT_FOOTPRINT_INVERSE_PUBLIC_PREFERENCES_CALLS[role]; return { phase: "inverse-public-preferences-call", role, method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_INVERSE_PUBLIC_PREFERENCES_FLAGS, objectId: "original_ref", functionDeclaration: row.program, arguments: Array.from({ length: row.args }, () => ({ objectId: "original_ref" })), returnByValue: row.value } }; }),
    ...propertyRoles.map(role => ({ phase: "inverse-public-preferences-properties", role, method: "Runtime.getProperties", params })),
    ...functionRoles.map(role => ({ phase: "inverse-public-preferences-function", role, method: "Runtime.getProperties", params })),
    ...(["entry", "returned"] as const).map(role => ({ phase: "inverse-public-preferences-arm", role, method: "Debugger.setBreakpoint", params: { location: { scriptId: "original_ref", lineNumber: SITE.lineNumber, columnNumber: role === "entry" ? SITE.entryColumn : SITE.returnedColumn }, condition: "" } })),
    { phase: "inverse-public-preferences-helper", method: "Debugger.getScriptSource", params: { scriptId: "original_ref" } },
  ].map(command => validateCurrentFootprintInversePublicPreferencesCommand(command)));
}
export function currentFootprintInversePublicPreferencesTemplate(input: CurrentFootprintInversePublicPreferencesCommand): Readonly<{ key: string; method: string; names: readonly string[]; template: string }> {
  const command = validateCurrentFootprintInversePublicPreferencesCommand(input); const names: string[] = []; const field = (name: string): string => { need(!names.includes(name)); names.push(name); return `__inverse_preferences_${name}__`; }; const params: Record<string, unknown> = { ...command.params };
  if (command.phase === "inverse-public-preferences-arm") { params["location"] = { ...command.params.location, scriptId: field("scriptId") }; }
  else if (command.method === "Debugger.getScriptSource") { params["scriptId"] = field("scriptId"); }
  else { params["objectId"] = field("objectId"); if (command.method === "Runtime.callFunctionOn") { params["functionDeclaration"] = `__inverse_preferences_program_${command.role}__`; params["arguments"] = command.params.arguments.map((_, index) => ({ objectId: field(`argument${String(index)}`) })); } }
  return freezeDeep({ key: currentFootprintInversePublicPreferencesKey(command), method: command.method, names, template: JSON.stringify({ method: command.method, params }) });
}
export function currentFootprintInversePublicPreferencesTemplateHash(command: CurrentFootprintInversePublicPreferencesCommand): string { return createHash("sha256").update(`${JSON.stringify({ id: 79, method: command.method, params: command.params, sessionId: "original_ui" })}\0`).digest("hex"); }
