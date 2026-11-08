/** Read-only finite vocabulary for the fresh DEL registration and selected manager method. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_MANAGER_PROGRAMS as PROGRAMS } from "./current-footprint-inverse-delete-manager-programs.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), ref = z.strictObject({ objectId: handle });
export const CURRENT_FOOTPRINT_INVERSE_DELETE_MANAGER_FLAGS = Object.freeze({ objectGroup: "easyeda-footprint-inverse-delete-manager-v1", silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
export const CURRENT_FOOTPRINT_INVERSE_DELETE_MANAGER_CALLS = freezeDeep({
  outer: { program: PROGRAMS.outer, refs: 5, value: true, byValue: false },
  moduleUi: { program: PROGRAMS.moduleUi, refs: 3, value: false, byValue: false },
  moduleManager: { program: PROGRAMS.moduleManager, refs: 3, value: false, byValue: false },
  queue: { program: PROGRAMS.queue, refs: 2, value: false, byValue: false },
  task: { program: PROGRAMS.task, refs: 1, value: false, byValue: false },
  members: { program: PROGRAMS.members, refs: 2, value: false, byValue: false },
  methods: { program: PROGRAMS.methods, refs: 4, value: false, byValue: false },
  reply: { program: PROGRAMS.reply, refs: 6, value: false, byValue: false },
  handlerUi: { program: PROGRAMS.handlerUi, refs: 2, value: false, byValue: false },
  handlerManager: { program: PROGRAMS.handlerManager, refs: 2, value: false, byValue: false },
  body: { program: PROGRAMS.body, refs: 2, value: false, byValue: false },
  managerModule: { program: PROGRAMS.managerModule, refs: 3, value: false, byValue: false },
  lookupScope: { program: PROGRAMS.lookupScope, refs: 2, value: false, byValue: false },
  registry: { program: PROGRAMS.registry, refs: 2, value: false, byValue: false },
  registrySelf: { program: PROGRAMS.registrySelf, refs: 2, value: false, byValue: true },
  registryMap: { program: PROGRAMS.registryMap, refs: 2, value: false, byValue: false },
  mapMethods: { program: PROGRAMS.mapMethods, refs: 5, value: false, byValue: false },
  selected: { program: PROGRAMS.selected, refs: 4, value: true, byValue: false },
  project: { program: PROGRAMS.project, refs: 2, value: true, byValue: false },
  footprint: { program: PROGRAMS.footprint, refs: 3, value: false, byValue: false },
  method: { program: PROGRAMS.method, refs: 3, value: false, byValue: false },
  topics: { program: PROGRAMS.topics, refs: 2, value: false, byValue: false },
  topicGroup: { program: PROGRAMS.topicGroup, refs: 1, value: false, byValue: false },
  innerTopic: { program: PROGRAMS.innerTopic, refs: 1, value: false, byValue: false },
  before: { program: PROGRAMS.before, refs: 4, value: false, byValue: true },
} as const);
const flags = { objectGroup: z.literal(CURRENT_FOOTPRINT_INVERSE_DELETE_MANAGER_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const roles = ["outer", "moduleUi", "moduleManager", "queue", "task", "members", "methods", "reply", "handlerUi", "handlerManager", "body", "managerModule", "lookupScope", "registry", "registrySelf", "registryMap", "mapMethods", "selected", "project", "footprint", "method", "topics", "topicGroup", "innerTopic", "before"] as const;
const target = z.strictObject({ projectUuid: z.string().regex(/^[a-f\d]{64}$/u), branchUuid: z.string().regex(/^[a-f\d]{32}$/u), documentUuid: z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u) });
const callArgument = z.union([ref, z.strictObject({ value: target })]);
const callParams = z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.string().max(16_384), arguments: z.array(callArgument).max(6), returnByValue: z.boolean() });
const propertyParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const sourceParams = z.strictObject({ scriptId: handle });
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("inverse-delete-manager-call"), role: z.enum(roles), method: z.literal("Runtime.callFunctionOn"), params: callParams }),
  z.strictObject({ phase: z.literal("inverse-delete-manager-properties"), method: z.literal("Runtime.getProperties"), params: propertyParams }),
  z.strictObject({ phase: z.literal("inverse-delete-manager-helper"), method: z.literal("Debugger.getScriptSource"), params: sourceParams }),
]);
export type CurrentFootprintInverseDeleteManagerCommand = Readonly<z.infer<typeof schema>>;
// Measured with both source-preserving original RPC profiles. Helper source
// Reads belong to the original controller, one for every dispatched projection.
export const CURRENT_FOOTPRINT_INVERSE_DELETE_MANAGER_REQUESTS = Object.freeze({ calls: 23, properties: 112, helpers: 23, cdpRequests: 158 } as const);
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_DELETE_MANAGER_COMMAND"); } }
/** Validate the closed readonly DEL manager preparation command, including its exact fixed program and argument shape, before native encoding. */
export function validateCurrentFootprintInverseDeleteManagerCommand(input: unknown): CurrentFootprintInverseDeleteManagerCommand { const command = schema.parse(capture(input)); if (command.method === "Runtime.callFunctionOn") { const row = CURRENT_FOOTPRINT_INVERSE_DELETE_MANAGER_CALLS[command.role]; need(command.params.functionDeclaration === row.program && command.params.arguments.length === row.refs + Number(row.value) && command.params.returnByValue === row.byValue); for (const [index, value] of command.params.arguments.entries()) { need(index < row.refs ? "objectId" in value : "value" in value); } } return freezeDeep(command); }
/** Return the fixed readonly DEL manager preparation program associated with this command, or null for commands that execute no helper. */
export function currentFootprintInverseDeleteManagerProgram(command: CurrentFootprintInverseDeleteManagerCommand): string | null { return command.method === "Runtime.callFunctionOn" ? command.params.functionDeclaration : null; }
/** Require the complete returned helper source to match the selected readonly DEL manager preparation program, including the Inspector wrapper. */
export function qualifyCurrentFootprintInverseDeleteManagerHelper(input: unknown, program: string): void { const result = z.strictObject({ scriptSource: z.string().max(16_386) }).parse(capture(input)); need(Object.values(PROGRAMS).some(value => value === program) && result.scriptSource === `(${program})`); }
/** Encode the validated readonly DEL manager preparation command with its positive request ID and exact session; no ownership receipt is issued. */
export function currentFootprintInverseDeleteManagerWire(input: CurrentFootprintInverseDeleteManagerCommand, id: number, sessionId: string): CurrentFootprintInverseDeleteManagerCommand & Readonly<{ id: number; sessionId: string; inverseDeleteManager: true }> { need(Number.isSafeInteger(id) && id > 0); handle.parse(sessionId); return freezeDeep({ ...validateCurrentFootprintInverseDeleteManagerCommand(input), id, sessionId, inverseDeleteManager: true }); }
/** Decode one bounded NUL-terminated readonly DEL manager preparation frame and require exact byte parity with its validated command before returning native fields. */
export function currentFootprintInverseDeleteManagerNativeFrame(bytes: Buffer, input: CurrentFootprintInverseDeleteManagerCommand, sessionId: string): Readonly<Record<string, string | number>> {
  need(bytes.length <= 65_536 && bytes.at(-1) === 0); const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(0, -1))); const id = z.looseObject({ id: z.number().int().positive() }).parse(capture(raw)).id; const command = validateCurrentFootprintInverseDeleteManagerCommand(input); need(bytes.toString("utf8") === `${JSON.stringify(currentFootprintInverseDeleteManagerWire(command, id, sessionId))}\0`);
  const fields: Record<string, string | number> = { action: "footprint-inverse-delete-manager", requestId: id, phase: command.phase, method: command.method }; if (command.method === "Debugger.getScriptSource") { fields["scriptId"] = command.params.scriptId; } else { fields["objectId"] = command.params.objectId; if (command.method === "Runtime.callFunctionOn") { fields["role"] = command.role; for (const [index, argument] of command.params.arguments.entries()) { if ("objectId" in argument) { fields[`reference${String(index)}`] = argument.objectId; } else { Object.assign(fields, argument.value); } } } } return Object.freeze(fields);
}
/** Enumerate the fixed readonly DEL manager preparation golden cases used by both TypeScript and the native codec checks. */
export function currentFootprintInverseDeleteManagerCases(): readonly CurrentFootprintInverseDeleteManagerCommand[] { return freezeDeep([
  ...roles.map(role => { const row = CURRENT_FOOTPRINT_INVERSE_DELETE_MANAGER_CALLS[role]; const args: unknown[] = Array.from({ length: row.refs }, () => ({ objectId: "original_ref" })); if (row.value) { args.push({ value: { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16) } }); } return { phase: "inverse-delete-manager-call", role, method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_INVERSE_DELETE_MANAGER_FLAGS, objectId: "original_ref", functionDeclaration: row.program, arguments: args, returnByValue: row.byValue } }; }),
  { phase: "inverse-delete-manager-properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
  { phase: "inverse-delete-manager-helper", method: "Debugger.getScriptSource", params: { scriptId: "original_ref" } },
].map(value => validateCurrentFootprintInverseDeleteManagerCommand(value))); }
/** Derive the fixed readonly DEL manager preparation native template and its unique field placeholders from a validated command. */
export function currentFootprintInverseDeleteManagerTemplate(input: CurrentFootprintInverseDeleteManagerCommand): Readonly<{ key: string; method: string; names: readonly string[]; template: string }> {
  const command = validateCurrentFootprintInverseDeleteManagerCommand(input), names: string[] = []; const field = (name: string): string => { need(!names.includes(name)); names.push(name); return `__delete_manager_${name}__`; }; const params: Record<string, unknown> = { ...command.params };
  if (command.method === "Debugger.getScriptSource") { params["scriptId"] = field("scriptId"); } else { params["objectId"] = field("objectId"); if (command.method === "Runtime.callFunctionOn") { params["functionDeclaration"] = `__delete_manager_program_${command.role}__`; params["arguments"] = command.params.arguments.map((argument, index) => "objectId" in argument ? { objectId: field(`reference${String(index)}`) } : { value: { projectUuid: field("projectUuid"), branchUuid: field("branchUuid"), documentUuid: field("documentUuid") } }); } }
  return freezeDeep({ key: command.phase.slice("inverse-delete-manager-".length) + ("role" in command ? `:${command.role}` : ""), method: command.method, names, template: JSON.stringify({ method: command.method, params }) });
}
