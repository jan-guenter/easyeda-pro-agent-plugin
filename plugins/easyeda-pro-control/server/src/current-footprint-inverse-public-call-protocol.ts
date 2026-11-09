/** Inverse-only SDK invocation to an original held service entry. No resume,
 * selected SQL, timer, or collateral-completion command belongs to this lane. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentFootprintInverseDeleteBindingReply as capture } from "./current-footprint-inverse-delete-binding-capture.ts";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_CALL_EXPRESSIONS as E, CURRENT_FOOTPRINT_INVERSE_PUBLIC_CALL_PROGRAMS as P, CURRENT_FOOTPRINT_INVERSE_PUBLIC_CALL_SITES as S } from "./current-footprint-inverse-public-call-programs.ts";

const h = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), ref = z.strictObject({ objectId: h });
const target = z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u);
export const CURRENT_FOOTPRINT_INVERSE_PUBLIC_CALL_GROUP = "easyeda-footprint-inverse-public-call-v1";
export const CURRENT_FOOTPRINT_INVERSE_PUBLIC_CALL_FLAGS = Object.freeze({ objectGroup: CURRENT_FOOTPRINT_INVERSE_PUBLIC_CALL_GROUP, silent: true, generatePreview: false, awaitPromise: false, userGesture: false } as const);
const flags = { objectGroup: z.literal(CURRENT_FOOTPRINT_INVERSE_PUBLIC_CALL_GROUP), silent: z.literal(true), generatePreview: z.literal(false), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const props = z.strictObject({ objectId: h, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
/* oxlint-disable unicorn/max-nested-calls -- Closed literal CDP vocabulary. */
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("inverse-public-call-arm"), role: z.enum(["entry", "returned"]), method: z.literal("Debugger.setBreakpoint"), params: z.strictObject({ location: z.strictObject({ scriptId: h, lineNumber: z.literal(1), columnNumber: z.union([z.literal(S.entry.columnNumber), z.literal(S.returned.columnNumber)]) }), condition: z.literal("") }) }),
  z.strictObject({ phase: z.literal("inverse-public-call-sdk"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, throwOnSideEffect: z.literal(false), objectId: h, functionDeclaration: z.literal(P.invoke), arguments: z.tuple([ref, z.strictObject({ value: target })]), returnByValue: z.literal(false) }) }),
  z.strictObject({ phase: z.literal("inverse-public-call-frame"), role: z.enum(["entry", "dispatch"]), method: z.literal("Debugger.evaluateOnCallFrame"), params: z.strictObject({ callFrameId: h, expression: z.union([z.literal(E.entry), z.literal(E.dispatch)]), objectGroup: z.literal(CURRENT_FOOTPRINT_INVERSE_PUBLIC_CALL_GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) }) }),
  z.strictObject({ phase: z.literal("inverse-public-call-properties"), role: z.enum(["entry", "dispatch", "packet", "message", "proof"]), method: z.literal("Runtime.getProperties"), params: props }),
  z.strictObject({ phase: z.literal("inverse-public-call-proof"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, throwOnSideEffect: z.literal(true), objectId: h, functionDeclaration: z.literal(P.entry), arguments: z.tuple([ref, ref, ref, ref, ref, z.strictObject({ value: target })]), returnByValue: z.literal(false) }) }),
  z.strictObject({ phase: z.literal("inverse-public-call-reprove"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, throwOnSideEffect: z.literal(true), objectId: h, functionDeclaration: z.literal(P.reprove), arguments: z.tuple([]), returnByValue: z.literal(true) }) }),
  z.strictObject({ phase: z.literal("inverse-public-call-helper"), method: z.literal("Debugger.getScriptSource"), params: z.strictObject({ scriptId: h }) }),
]);
/* oxlint-enable unicorn/max-nested-calls */
export type CurrentFootprintInversePublicCallCommand = Readonly<z.infer<typeof schema>>;
// Two original points, SDK, two frames/properties, two packet metadata reads,
// Proof/properties/reproof, and five exact original helper source receipts.
export const CURRENT_FOOTPRINT_INVERSE_PUBLIC_CALL_REQUESTS = Object.freeze({ normal: 12, helpers: 5, cdpRequests: 17, controls: 20, events: 8, cleanupAfterOriginalExit: 0 });
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_INVERSE_PUBLIC_CALL_PROTOCOL"); } }
export function validateCurrentFootprintInversePublicCallCommand(input: unknown): CurrentFootprintInversePublicCallCommand {
  const command = schema.parse(capture(input));
  if (command.phase === "inverse-public-call-arm") { need(command.params.location.columnNumber === S[command.role].columnNumber); }
  else if (command.phase === "inverse-public-call-frame") { need(command.params.expression === E[command.role]); }
  return freezeDeep(command);
}
export function currentFootprintInversePublicCallProgram(command: CurrentFootprintInversePublicCallCommand): string | null {
  if (command.method === "Runtime.callFunctionOn") { return command.params.functionDeclaration; }
  if (command.method === "Debugger.evaluateOnCallFrame") { return command.params.expression; }
  return null;
}
export function qualifyCurrentFootprintInversePublicCallHelper(input: unknown, program: string): void {
  need([...Object.values(P), E.entry, E.dispatch].includes(program));
  const raw = z.strictObject({ scriptSource: z.string().max(16_384) }).parse(capture(input));
  need(raw.scriptSource === (program === E.entry || program === E.dispatch ? program : `(${program})`));
}
export function currentFootprintInversePublicCallWire(input: CurrentFootprintInversePublicCallCommand, id: number, sessionId: string): CurrentFootprintInversePublicCallCommand & Readonly<{ id: number; sessionId: string; inversePublicCall: true }> {
  need(Number.isSafeInteger(id) && id > 0); h.parse(sessionId); return freezeDeep({ ...validateCurrentFootprintInversePublicCallCommand(input), id, sessionId, inversePublicCall: true });
}
export function currentFootprintInversePublicCallKey(command: CurrentFootprintInversePublicCallCommand): string { return command.phase.slice(20) + ("role" in command ? `:${command.role}` : ""); }
export function currentFootprintInversePublicCallNativeFrame(bytes: Buffer, input: CurrentFootprintInversePublicCallCommand, sessionId: string): Readonly<Record<string, string | number>> {
  need(bytes.length <= 65_536 && bytes.at(-1) === 0); const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(0, -1))); const id = z.looseObject({ id: z.number().int().positive() }).parse(capture(raw)).id;
  const command = validateCurrentFootprintInversePublicCallCommand(input); need(bytes.toString("utf8") === `${JSON.stringify(currentFootprintInversePublicCallWire(command, id, sessionId))}\0`);
  const fields: Record<string, string | number> = { action: "footprint-inverse-public-call", requestId: id, phase: command.phase, method: command.method }; if ("role" in command) { fields["role"] = command.role; }
  if (command.phase === "inverse-public-call-arm") { fields["scriptId"] = command.params.location.scriptId; }
  else if (command.method === "Debugger.evaluateOnCallFrame") { fields["callFrameId"] = command.params.callFrameId; }
  else if (command.method === "Debugger.getScriptSource") { fields["scriptId"] = command.params.scriptId; }
  else { fields["objectId"] = command.params.objectId; if ("arguments" in command.params) { for (const [index, arg] of command.params.arguments.entries()) { fields[`argument${String(index)}`] = "objectId" in arg ? arg.objectId : arg.value; } } }
  return Object.freeze(fields);
}
export function currentFootprintInversePublicCallCases(): readonly CurrentFootprintInversePublicCallCommand[] {
  const properties = { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } as const;
  return freezeDeep([
    ...(["entry", "returned"] as const).map(role => ({ phase: "inverse-public-call-arm", role, method: "Debugger.setBreakpoint", params: { location: { scriptId: "original_ref", ...S[role] }, condition: "" } })),
    { phase: "inverse-public-call-sdk", method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_INVERSE_PUBLIC_CALL_FLAGS, throwOnSideEffect: false, objectId: "original_ref", functionDeclaration: P.invoke, arguments: [{ objectId: "original_ref" }, { value: "a".repeat(16) }], returnByValue: false } },
    ...(["entry", "dispatch"] as const).map(role => ({ phase: "inverse-public-call-frame", role, method: "Debugger.evaluateOnCallFrame", params: { callFrameId: "original_ref", expression: E[role], objectGroup: CURRENT_FOOTPRINT_INVERSE_PUBLIC_CALL_GROUP, silent: true, generatePreview: false, throwOnSideEffect: true, returnByValue: false, includeCommandLineAPI: false } })),
    ...(["entry", "dispatch", "packet", "message", "proof"] as const).map(role => ({ phase: "inverse-public-call-properties", role, method: "Runtime.getProperties", params: properties })),
    { phase: "inverse-public-call-proof", method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_INVERSE_PUBLIC_CALL_FLAGS, throwOnSideEffect: true, objectId: "original_ref", functionDeclaration: P.entry, arguments: [...Array.from({ length: 5 }, () => ({ objectId: "original_ref" })), { value: "a".repeat(16) }], returnByValue: false } },
    { phase: "inverse-public-call-reprove", method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_INVERSE_PUBLIC_CALL_FLAGS, throwOnSideEffect: true, objectId: "original_ref", functionDeclaration: P.reprove, arguments: [], returnByValue: true } },
    { phase: "inverse-public-call-helper", method: "Debugger.getScriptSource", params: { scriptId: "original_ref" } },
  ].map(command => validateCurrentFootprintInversePublicCallCommand(command)));
}
export function currentFootprintInversePublicCallTemplate(input: CurrentFootprintInversePublicCallCommand): Readonly<{ key: string; method: string; names: readonly string[]; template: string }> {
  const command = validateCurrentFootprintInversePublicCallCommand(input); const names: string[] = []; const field = (name: string): string => { need(!names.includes(name)); names.push(name); return `__inverse_call_${name}__`; }; const params: Record<string, unknown> = { ...command.params };
  if (command.phase === "inverse-public-call-arm") { params["location"] = { ...command.params.location, scriptId: field("scriptId") }; }
  else if (command.method === "Debugger.evaluateOnCallFrame") { params["callFrameId"] = field("callFrameId"); }
  else if (command.method === "Debugger.getScriptSource") { params["scriptId"] = field("scriptId"); }
  else { params["objectId"] = field("objectId"); if ("arguments" in command.params) { params["arguments"] = command.params.arguments.map((arg, index) => "objectId" in arg ? { objectId: field(`argument${String(index)}`) } : { value: field(`argument${String(index)}`) }); } }
  if (command.method === "Runtime.callFunctionOn") { params["functionDeclaration"] = `__inverse_call_program_${command.phase.slice(20)}__`; }
  return freezeDeep({ key: currentFootprintInversePublicCallKey(command), method: command.method, names, template: JSON.stringify({ method: command.method, params }) });
}
export function currentFootprintInversePublicCallTemplateHash(command: CurrentFootprintInversePublicCallCommand): string { return createHash("sha256").update(`${JSON.stringify({ id: 79, method: command.method, params: command.params, sessionId: "original_ui" })}\0`).digest("hex"); }
