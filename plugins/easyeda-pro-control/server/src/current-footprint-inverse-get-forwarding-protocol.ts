/** Read-only finite vocabulary for the held initialized GET graph. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_GET_FORWARDING_PROGRAMS as PROGRAMS } from "./current-footprint-inverse-get-forwarding-programs.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), ref = z.strictObject({ objectId: handle });
export const CURRENT_FOOTPRINT_INVERSE_GET_FORWARDING_FLAGS = Object.freeze({ objectGroup: "easyeda-footprint-inverse-get-forwarding-v1", silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
export const CURRENT_FOOTPRINT_INVERSE_GET_FORWARDING_CALLS = freezeDeep({ moduleUi: { program: PROGRAMS.moduleUi, refs: 3 }, moduleManager: { program: PROGRAMS.moduleManager, refs: 3 }, roots: { program: PROGRAMS.roots, refs: 2 }, queue: { program: PROGRAMS.queue, refs: 1 }, task: { program: PROGRAMS.task, refs: 1 }, taskMembers: { program: PROGRAMS.taskMembers, refs: 2 }, methods: { program: PROGRAMS.methods, refs: 3 }, reply: { program: PROGRAMS.reply, refs: 6 }, handlerUi: { program: PROGRAMS.handlerUi, refs: 2 }, handlerManager: { program: PROGRAMS.handlerManager, refs: 2 }, handlerBody: { program: PROGRAMS.handlerBody, refs: 2 }, managerModule: { program: PROGRAMS.managerModule, refs: 2 } } as const);
const flags = { objectGroup: z.literal(CURRENT_FOOTPRINT_INVERSE_GET_FORWARDING_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const roles = ["moduleUi", "moduleManager", "roots", "queue", "task", "taskMembers", "methods", "reply", "handlerUi", "handlerManager", "handlerBody", "managerModule"] as const;
const callParams = z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.string().max(16_384), arguments: z.array(ref).max(6), returnByValue: z.literal(false) });
const propertyParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const sourceParams = z.strictObject({ scriptId: handle });
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("inverse-get-forwarding-call"), role: z.enum(roles), method: z.literal("Runtime.callFunctionOn"), params: callParams }),
  z.strictObject({ phase: z.literal("inverse-get-forwarding-properties"), method: z.literal("Runtime.getProperties"), params: propertyParams }),
  z.strictObject({ phase: z.literal("inverse-get-forwarding-helper"), method: z.literal("Debugger.getScriptSource"), params: sourceParams }),
]);
export type CurrentFootprintInverseGetForwardingCommand = Readonly<z.infer<typeof schema>>;
// Ten original projections, sixty-one property packets (including all newly
// Selected objects/functions and three scope lists), ten exact helper reads.
export const CURRENT_FOOTPRINT_INVERSE_GET_FORWARDING_REQUESTS = Object.freeze({ calls: 10, properties: 61, helpers: 10, cdpRequests: 81, controls: 83 } as const);
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_GET_FORWARDING_COMMAND"); } }
export function validateCurrentFootprintInverseGetForwardingCommand(input: unknown): CurrentFootprintInverseGetForwardingCommand { const command = schema.parse(capture(input)); if (command.method === "Runtime.callFunctionOn") { const row = CURRENT_FOOTPRINT_INVERSE_GET_FORWARDING_CALLS[command.role]; need(command.params.functionDeclaration === row.program && command.params.arguments.length === row.refs); } return freezeDeep(command); }
export function currentFootprintInverseGetForwardingProgram(command: CurrentFootprintInverseGetForwardingCommand): string | null { return command.method === "Runtime.callFunctionOn" ? command.params.functionDeclaration : null; }
export function qualifyCurrentFootprintInverseGetForwardingHelper(input: unknown, program: string): void { const result = z.strictObject({ scriptSource: z.string().max(16_386) }).parse(capture(input)); need(Object.values(PROGRAMS).some(value => value === program) && result.scriptSource === `(${program})`); }
export function currentFootprintInverseGetForwardingWire(input: CurrentFootprintInverseGetForwardingCommand, id: number, sessionId: string): CurrentFootprintInverseGetForwardingCommand & Readonly<{ id: number; sessionId: string; inverseGetForwarding: true }> { need(Number.isSafeInteger(id) && id > 0); handle.parse(sessionId); return freezeDeep({ ...validateCurrentFootprintInverseGetForwardingCommand(input), id, sessionId, inverseGetForwarding: true }); }
export function currentFootprintInverseGetForwardingNativeFrame(bytes: Buffer, input: CurrentFootprintInverseGetForwardingCommand, sessionId: string): Readonly<Record<string, string | number>> {
  need(bytes.length <= 65_536 && bytes.at(-1) === 0); const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(0, -1))); const id = z.looseObject({ id: z.number().int().positive() }).parse(capture(raw)).id; const command = validateCurrentFootprintInverseGetForwardingCommand(input); need(bytes.toString("utf8") === `${JSON.stringify(currentFootprintInverseGetForwardingWire(command, id, sessionId))}\0`);
  const fields: Record<string, string | number> = { action: "footprint-inverse-get-forwarding", requestId: id, phase: command.phase, method: command.method }; if (command.method === "Debugger.getScriptSource") { fields["scriptId"] = command.params.scriptId; } else { fields["objectId"] = command.params.objectId; if (command.method === "Runtime.callFunctionOn") { fields["role"] = command.role; for (const [index, argument] of command.params.arguments.entries()) { fields[`reference${String(index)}`] = argument.objectId; } } } return Object.freeze(fields);
}
export function currentFootprintInverseGetForwardingCases(): readonly CurrentFootprintInverseGetForwardingCommand[] { return freezeDeep([
  ...roles.map(role => { const row = CURRENT_FOOTPRINT_INVERSE_GET_FORWARDING_CALLS[role]; return { phase: "inverse-get-forwarding-call", role, method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_INVERSE_GET_FORWARDING_FLAGS, objectId: "original_ref", functionDeclaration: row.program, arguments: Array.from({ length: row.refs }, () => ({ objectId: "original_ref" })), returnByValue: false } }; }),
  { phase: "inverse-get-forwarding-properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
  { phase: "inverse-get-forwarding-helper", method: "Debugger.getScriptSource", params: { scriptId: "original_ref" } },
].map(value => validateCurrentFootprintInverseGetForwardingCommand(value))); }
export function currentFootprintInverseGetForwardingTemplate(input: CurrentFootprintInverseGetForwardingCommand): Readonly<{ key: string; method: string; names: readonly string[]; template: string }> {
  const command = validateCurrentFootprintInverseGetForwardingCommand(input), names: string[] = []; const field = (name: string): string => { need(!names.includes(name)); names.push(name); return `__get_forwarding_${name}__`; }; const params: Record<string, unknown> = { ...command.params };
  if (command.method === "Debugger.getScriptSource") { params["scriptId"] = field("scriptId"); } else { params["objectId"] = field("objectId"); if (command.method === "Runtime.callFunctionOn") { params["functionDeclaration"] = `__get_forwarding_program_${command.role}__`; params["arguments"] = command.params.arguments.map((_argument, index) => ({ objectId: field(`reference${String(index)}`) })); } }
  return freezeDeep({ key: command.phase.slice("inverse-get-forwarding-".length) + ("role" in command ? `:${command.role}` : ""), method: command.method, names, template: JSON.stringify({ method: command.method, params }) });
}
