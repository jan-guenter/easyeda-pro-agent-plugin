/** Original service-to-F2 prefix only. No Lo RPC, row, delete or clock grant. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_LOOKUP_PROGRAMS_V2 as P } from "./current-footprint-inverse-public-lookup-programs-v2.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), ref = z.strictObject({ objectId: handle });
const project = z.string().regex(/^[a-f\d]{64}$/u); const branch = z.string().regex(/^[a-f\d]{32}$/u); const document = z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u);
const target = z.strictObject({ projectUuid: project, branchUuid: branch, documentUuid: document });
export const CURRENT_FOOTPRINT_INVERSE_LOOKUP_PREENTRY_CALLS = freezeDeep({
  roots: { program: P.roots, refs: 2, value: "opening", byValue: false }, parents: { program: P.parents, refs: 1, value: "none", byValue: false },
  merge2: { program: P.merge, refs: 3, value: "none", byValue: false }, merge3: { program: P.merge, refs: 4, value: "none", byValue: false }, merge4: { program: P.merge, refs: 5, value: "none", byValue: false }, merge5: { program: P.merge, refs: 6, value: "none", byValue: false },
  context: { program: P.context, refs: 3, value: "none", byValue: false }, registrySelect: { program: P.registrySelect, refs: 4, value: "none", byValue: false }, registryMembership: { program: P.registryMembership, refs: 4, value: "project", byValue: true }, registrySame: { program: P.registrySame, refs: 1, value: "none", byValue: true },
  classScope: { program: P.classScope, refs: 2, value: "none", byValue: true }, contextScope: { program: P.contextScope, refs: 2, value: "none", byValue: true }, serviceRoots: { program: P.serviceRoots, refs: 2, value: "none", byValue: false }, serviceEntry: { program: P.serviceEntry, refs: 6, value: "target", byValue: true }, f2Entry: { program: P.f2Entry, refs: 3, value: "target", byValue: true },
} as const);
export const CURRENT_FOOTPRINT_INVERSE_LOOKUP_PREENTRY_FLAGS = Object.freeze({ objectGroup: "easyeda-footprint-inverse-lookup-preentry-v1", silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
const flags = { objectGroup: z.literal(CURRENT_FOOTPRINT_INVERSE_LOOKUP_PREENTRY_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const roles = ["roots", "parents", "merge2", "merge3", "merge4", "merge5", "context", "registrySelect", "registryMembership", "registrySame", "classScope", "contextScope", "serviceRoots", "serviceEntry", "f2Entry"] as const;
export const CURRENT_FOOTPRINT_INVERSE_LOOKUP_PREENTRY_EXPRESSIONS = Object.freeze({ service: "[this,n,e,t,i]", entry: "[this,t]" } as const);
const properties = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
/* oxlint-disable unicorn/max-nested-calls -- The closed wire schema is expressed next to its exact flags and fixed source. */
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("inverse-lookup-preentry-call"), role: z.enum(roles), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.string().max(16_384), arguments: z.array(z.union([ref, z.strictObject({ value: z.union([project, target, target.omit({ documentUuid: true })]) })])).max(7), returnByValue: z.boolean() }) }),
  z.strictObject({ phase: z.literal("inverse-lookup-preentry-properties"), role: z.enum(["tuple", "object", "function", "scopes", "argument"]), method: z.literal("Runtime.getProperties"), params: properties }),
  z.strictObject({ phase: z.literal("inverse-lookup-preentry-source"), method: z.literal("Debugger.getScriptSource"), params: z.strictObject({ scriptId: handle }) }),
  z.strictObject({ phase: z.literal("inverse-lookup-preentry-helper"), method: z.literal("Debugger.getScriptSource"), params: z.strictObject({ scriptId: handle }) }),
  z.strictObject({ phase: z.literal("inverse-lookup-preentry-arm"), method: z.literal("Debugger.setBreakpointOnFunctionCall"), params: z.strictObject({ objectId: handle, condition: z.literal("") }) }),
  z.strictObject({ phase: z.literal("inverse-lookup-preentry-frame"), role: z.enum(["service", "entry"]), method: z.literal("Debugger.evaluateOnCallFrame"), params: z.strictObject({ callFrameId: handle, expression: z.string(), objectGroup: z.literal(CURRENT_FOOTPRINT_INVERSE_LOOKUP_PREENTRY_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) }) }),
  z.strictObject({ phase: z.literal("inverse-lookup-preentry-resume"), method: z.literal("Debugger.resume"), params: z.strictObject({}) }),
]);
/* oxlint-enable unicorn/max-nested-calls */
export type CurrentFootprintInverseLookupPreentryCommand = Readonly<z.infer<typeof schema>>;
export const CURRENT_FOOTPRINT_INVERSE_LOOKUP_PREENTRY_REQUESTS = Object.freeze({ calls: 24, properties: 96, source: 1, frame: 2, arm: 1, resume: 1, helpers: 26, cdpRequests: 151, controls: 157, events: 28, cleanupAfterOriginalExit: 0 });
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_LOOKUP_PREENTRY_PROTOCOL"); } }
export function validateCurrentFootprintInverseLookupPreentryCommand(input: unknown): CurrentFootprintInverseLookupPreentryCommand {
  const command = schema.parse(capture(input));
  if (command.phase === "inverse-lookup-preentry-call") { const row = CURRENT_FOOTPRINT_INVERSE_LOOKUP_PREENTRY_CALLS[command.role]; need(command.params.functionDeclaration === row.program && command.params.arguments.length === row.refs + (row.value === "none" ? 0 : 1) && command.params.returnByValue === row.byValue); for (let j = 0; j < row.refs; j += 1) { need("objectId" in (command.params.arguments[j] ?? {})); } if (row.value !== "none") { const last = command.params.arguments.at(-1); need(last !== undefined && "value" in last); if (row.value === "project") { project.parse(last.value); } else if (row.value === "target") { target.parse(last.value); } else { target.omit({ documentUuid: true }).parse(last.value); } } }
  else if (command.phase === "inverse-lookup-preentry-frame") { need(command.params.expression === CURRENT_FOOTPRINT_INVERSE_LOOKUP_PREENTRY_EXPRESSIONS[command.role]); }
  return freezeDeep(command);
}
export function currentFootprintInverseLookupPreentryProgram(command: CurrentFootprintInverseLookupPreentryCommand): string | null { if (command.method === "Runtime.callFunctionOn") { return command.params.functionDeclaration; } if (command.method === "Debugger.evaluateOnCallFrame") { return command.params.expression; } return null; }
export function qualifyCurrentFootprintInverseLookupPreentryHelper(input: unknown, program: string): void { const source = z.strictObject({ scriptSource: z.string().max(16_386) }).parse(capture(input)); const declaration = Object.values(CURRENT_FOOTPRINT_INVERSE_LOOKUP_PREENTRY_CALLS).some(row => row.program === program); const expression = Object.values(CURRENT_FOOTPRINT_INVERSE_LOOKUP_PREENTRY_EXPRESSIONS).some(value => value === program); need(declaration || expression); need(source.scriptSource === (declaration ? `(${program})` : program)); }
export function currentFootprintInverseLookupPreentryWire(input: CurrentFootprintInverseLookupPreentryCommand, id: number, sessionId: string): CurrentFootprintInverseLookupPreentryCommand & Readonly<{ id: number; sessionId: string; inverseLookupPreentry: true }> { need(Number.isSafeInteger(id) && id > 0); handle.parse(sessionId); return freezeDeep({ ...validateCurrentFootprintInverseLookupPreentryCommand(input), id, sessionId, inverseLookupPreentry: true }); }
export function currentFootprintInverseLookupPreentryKey(command: CurrentFootprintInverseLookupPreentryCommand): string { return command.phase.slice("inverse-lookup-preentry-".length) + ("role" in command ? `:${command.role}` : ""); }
export function currentFootprintInverseLookupPreentryNativeFrame(bytes: Buffer, input: CurrentFootprintInverseLookupPreentryCommand, sessionId: string): Readonly<Record<string, string | number>> {
  need(bytes.length <= 65_536 && bytes.at(-1) === 0); const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(0, -1))); const id = z.looseObject({ id: z.number().int().positive() }).parse(capture(raw)).id; const command = validateCurrentFootprintInverseLookupPreentryCommand(input); need(bytes.toString("utf8") === `${JSON.stringify(currentFootprintInverseLookupPreentryWire(command, id, sessionId))}\0`);
  const fields: Record<string, string | number> = { action: "footprint-inverse-lookup-preentry", requestId: id, phase: command.phase, method: command.method }; if ("role" in command) { fields["role"] = command.role; }
  if (command.method === "Debugger.getScriptSource") { fields["scriptId"] = command.params.scriptId; }
  else if (command.method === "Debugger.evaluateOnCallFrame") { fields["callFrameId"] = command.params.callFrameId; }
  else if (command.method !== "Debugger.resume") { fields["objectId"] = command.params.objectId; if (command.method === "Runtime.callFunctionOn") { for (const [index, arg] of command.params.arguments.entries()) { if ("objectId" in arg) { fields[`reference${String(index)}`] = arg.objectId; } else if (typeof arg.value === "string") { fields["projectUuid"] = arg.value; } else { Object.assign(fields, arg.value); } } } }
  return Object.freeze(fields);
}
export function currentFootprintInverseLookupPreentryCases(): readonly CurrentFootprintInverseLookupPreentryCommand[] {
  return freezeDeep([
    ...roles.map(role => { const row = CURRENT_FOOTPRINT_INVERSE_LOOKUP_PREENTRY_CALLS[role]; const args: unknown[] = Array.from({ length: row.refs }, () => ({ objectId: "original_ref" })); if (row.value !== "none") { let value: unknown = "a".repeat(64); if (row.value === "opening") { value = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32) }; } else if (row.value === "target") { value = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(32) }; } args.push({ value }); } return { phase: "inverse-lookup-preentry-call", role, method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_INVERSE_LOOKUP_PREENTRY_FLAGS, objectId: "original_ref", functionDeclaration: row.program, arguments: args, returnByValue: row.byValue } }; }),
    ...(["tuple", "object", "function", "scopes", "argument"] as const).map(role => ({ phase: "inverse-lookup-preentry-properties", role, method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } })),
    ...(["source", "helper"] as const).map(role => ({ phase: `inverse-lookup-preentry-${role}`, method: "Debugger.getScriptSource", params: { scriptId: "original_ref" } })),
    { phase: "inverse-lookup-preentry-arm", method: "Debugger.setBreakpointOnFunctionCall", params: { objectId: "original_ref", condition: "" } },
    ...(["service", "entry"] as const).map(role => ({ phase: "inverse-lookup-preentry-frame", role, method: "Debugger.evaluateOnCallFrame", params: { callFrameId: "original_ref", expression: CURRENT_FOOTPRINT_INVERSE_LOOKUP_PREENTRY_EXPRESSIONS[role], objectGroup: CURRENT_FOOTPRINT_INVERSE_LOOKUP_PREENTRY_FLAGS.objectGroup, silent: true, generatePreview: false, throwOnSideEffect: true, returnByValue: false, includeCommandLineAPI: false } })),
    { phase: "inverse-lookup-preentry-resume", method: "Debugger.resume", params: {} },
  ].map(input => validateCurrentFootprintInverseLookupPreentryCommand(input)));
}
export function currentFootprintInverseLookupPreentryTemplate(input: CurrentFootprintInverseLookupPreentryCommand): Readonly<{ key: string; method: string; names: readonly string[]; template: string }> {
  const command = validateCurrentFootprintInverseLookupPreentryCommand(input); const names: string[] = []; const field = (name: string): string => { need(!names.includes(name)); names.push(name); return `__lookup_preentry_${name}__`; }; const params: Record<string, unknown> = { ...command.params };
  if (command.method === "Debugger.getScriptSource") { params["scriptId"] = field("scriptId"); }
  else if (command.method === "Debugger.evaluateOnCallFrame") { params["callFrameId"] = field("callFrameId"); }
  else if (command.method !== "Debugger.resume") { params["objectId"] = field("objectId"); if (command.method === "Runtime.callFunctionOn") { params["functionDeclaration"] = `__lookup_preentry_program_${command.role}__`; params["arguments"] = command.params.arguments.map((arg, index) => { if ("objectId" in arg) { return { objectId: field(`reference${String(index)}`) }; } if (typeof arg.value === "string") { return { value: field("projectUuid") }; } return { value: Object.fromEntries(Object.keys(arg.value).map(key => [key, field(key)])) }; }); } }
  return freezeDeep({ key: currentFootprintInverseLookupPreentryKey(command), method: command.method, names, template: JSON.stringify({ method: command.method, params }) });
}
