/** Closed original RPC-to-callback grammar. One guarded resume stops before
 * the actual registered GET handler; it invokes no new method or Job. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_PCB_CALLBACK_EXPRESSIONS as EXPRESSIONS, CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_PCB_CALLBACK_PROGRAMS as P } from "./current-footprint-inverse-native-reference-pcb-callback-programs.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_PCB_CALLBACK_CALLS = freezeDeep({ prepare: { refs: 13, size: 5 }, before: { refs: 3, size: 0 }, lexical: { refs: 7, size: 0 }, payload: { refs: 2, size: 3 }, entry: { refs: 5, size: 0 } } as const);
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_PCB_CALLBACK_FLAGS = Object.freeze({ objectGroup: "easyeda-footprint-inverse-native-reference-pcb-callback-v1", silent: true, generatePreview: false, awaitPromise: false, userGesture: false, throwOnSideEffect: true } as const);
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_PCB_CALLBACK_REQUESTS = Object.freeze({ calls: 5, properties: 12, frames: 3, helpers: 8, arm: 1, remove: 1, resumes: 1, cdpRequests: 31, controls: 37, events: 10 } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), ref = z.strictObject({ objectId: handle }), roles = ["prepare", "before", "lexical", "payload", "entry"] as const;
const callParams = z.strictObject({ objectGroup: z.literal(CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_PCB_CALLBACK_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), awaitPromise: z.literal(false), userGesture: z.literal(false), throwOnSideEffect: z.literal(true), objectId: handle, functionDeclaration: z.string().max(16_384), arguments: z.array(ref).max(13), returnByValue: z.boolean() });
const propertyParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const helperParams = z.strictObject({ scriptId: handle });
const frameParams = z.strictObject({ callFrameId: handle, expression: z.string().max(256), objectGroup: z.literal(CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_PCB_CALLBACK_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) });
const armParams = z.strictObject({ objectId: handle, condition: z.literal("") });
const removeParams = z.strictObject({ breakpointId: handle });
const resumeParams = z.strictObject({});
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("inverse-native-reference-pcb-callback-call"), role: z.enum(roles), method: z.literal("Runtime.callFunctionOn"), params: callParams }),
  z.strictObject({ phase: z.literal("inverse-native-reference-pcb-callback-properties"), method: z.literal("Runtime.getProperties"), params: propertyParams }),
  z.strictObject({ phase: z.literal("inverse-native-reference-pcb-callback-helper"), method: z.literal("Debugger.getScriptSource"), params: helperParams }),
  z.strictObject({ phase: z.literal("inverse-native-reference-pcb-callback-arm"), method: z.literal("Debugger.setBreakpointOnFunctionCall"), params: armParams }),
  z.strictObject({ phase: z.literal("inverse-native-reference-pcb-callback-remove"), method: z.literal("Debugger.removeBreakpoint"), params: removeParams }),
  z.strictObject({ phase: z.literal("inverse-native-reference-pcb-callback-resume"), method: z.literal("Debugger.resume"), params: resumeParams }),
  z.strictObject({ phase: z.literal("inverse-native-reference-pcb-callback-frame"), role: z.enum(["rpc", "callback"]), method: z.literal("Debugger.evaluateOnCallFrame"), params: frameParams }),
]);
export type CurrentFootprintInverseNativeReferencePcbCallbackCommand = Readonly<z.infer<typeof schema>>;
/** Require the declared source, full argument arity and exact readonly flags. */
export function validateCurrentFootprintInverseNativeReferencePcbCallbackCommand(input: unknown): CurrentFootprintInverseNativeReferencePcbCallbackCommand {
  const c = schema.parse(capture(input)); if (c.method === "Runtime.callFunctionOn") { const row = CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_PCB_CALLBACK_CALLS[c.role]; if (c.params.functionDeclaration !== P[c.role] || c.params.arguments.length !== row.refs || c.params.returnByValue !== (row.size === 0)) { throw new Error("INVERSE_NATIVE_REFERENCE_PCB_CALLBACK_COMMAND"); } } else if (c.method === "Debugger.evaluateOnCallFrame" && c.params.expression !== EXPRESSIONS[c.role]) { throw new Error("INVERSE_NATIVE_REFERENCE_PCB_CALLBACK_EXPRESSION"); } return freezeDeep(c);
}
/** Correlate only a literal program already admitted by the closed grammar. */
export function qualifyCurrentFootprintInverseNativeReferencePcbCallbackHelper(input: unknown, command: CurrentFootprintInverseNativeReferencePcbCallbackCommand): void {
  const source = z.strictObject({ scriptSource: z.string().max(16_386) }).parse(capture(input)); const c = validateCurrentFootprintInverseNativeReferencePcbCallbackCommand(command); let expected: string | null = null; if (c.method === "Runtime.callFunctionOn") { expected = `(${c.params.functionDeclaration})`; } else if (c.method === "Debugger.evaluateOnCallFrame") { expected = c.params.expression; } if (expected === null || source.scriptSource !== expected) { throw new Error("INVERSE_NATIVE_REFERENCE_PCB_CALLBACK_HELPER"); }
}
/** Bind the fixed command to the actual private pipe ID and UI session. */
export function currentFootprintInverseNativeReferencePcbCallbackWire(input: CurrentFootprintInverseNativeReferencePcbCallbackCommand, id: number, sessionId: string): CurrentFootprintInverseNativeReferencePcbCallbackCommand & Readonly<{ id: number; sessionId: string; inverseNativeReferencePcbCallback: true }> { if (!Number.isSafeInteger(id) || id < 1) { throw new Error("INVERSE_NATIVE_REFERENCE_PCB_CALLBACK_ID"); } handle.parse(sessionId); return freezeDeep({ ...validateCurrentFootprintInverseNativeReferencePcbCallbackCommand(input), id, sessionId, inverseNativeReferencePcbCallback: true }); }
/** Decode exact original wire bytes; no endpoint, source or native code is
 * taken from fields outside the validated command and its owned identities. */
export function currentFootprintInverseNativeReferencePcbCallbackNativeFrame(bytes: Buffer, input: CurrentFootprintInverseNativeReferencePcbCallbackCommand, sessionId: string): Readonly<Record<string, string | number>> {
  if (bytes.length > 65_536 || bytes.at(-1) !== 0) { throw new Error("INVERSE_NATIVE_REFERENCE_PCB_CALLBACK_FRAME"); } const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(0, -1))); const id = z.looseObject({ id: z.number().int().positive() }).parse(capture(raw)).id; const c = validateCurrentFootprintInverseNativeReferencePcbCallbackCommand(input); if (bytes.toString("utf8") !== `${JSON.stringify(currentFootprintInverseNativeReferencePcbCallbackWire(c, id, sessionId))}\0`) { throw new Error("INVERSE_NATIVE_REFERENCE_PCB_CALLBACK_BYTES"); }
  const fields: Record<string, string | number> = { action: "footprint-inverse-native-reference-pcb-callback", requestId: id, phase: c.phase, method: c.method }; if (c.method === "Runtime.callFunctionOn") { fields["role"] = c.role; fields["objectId"] = c.params.objectId; for (const [index, arg] of c.params.arguments.entries()) { fields[`reference${String(index)}`] = arg.objectId; } } else if (c.method === "Debugger.evaluateOnCallFrame") { fields["role"] = c.role; fields["callFrameId"] = c.params.callFrameId; } else if (c.method === "Debugger.getScriptSource") { fields["scriptId"] = c.params.scriptId; } else if (c.method === "Debugger.removeBreakpoint") { fields["breakpointId"] = c.params.breakpointId; } else if (c.method !== "Debugger.resume") { fields["objectId"] = c.params.objectId; } return Object.freeze(fields);
}
/** Enumerate all twelve fixed cases for complete emitted native/CDP parity. */
export function currentFootprintInverseNativeReferencePcbCallbackCases(): readonly CurrentFootprintInverseNativeReferencePcbCallbackCommand[] { return freezeDeep([
  ...roles.map(role => { const row = CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_PCB_CALLBACK_CALLS[role]; return { phase: "inverse-native-reference-pcb-callback-call", role, method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_PCB_CALLBACK_FLAGS, objectId: "original_ref", functionDeclaration: P[role], arguments: Array.from({ length: row.refs }, () => ({ objectId: "original_ref" })), returnByValue: row.size === 0 } }; }),
  { phase: "inverse-native-reference-pcb-callback-properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
  { phase: "inverse-native-reference-pcb-callback-helper", method: "Debugger.getScriptSource", params: { scriptId: "original_ref" } },
  { phase: "inverse-native-reference-pcb-callback-arm", method: "Debugger.setBreakpointOnFunctionCall", params: { objectId: "original_ref", condition: "" } },
  { phase: "inverse-native-reference-pcb-callback-remove", method: "Debugger.removeBreakpoint", params: { breakpointId: "original_ref" } },
  { phase: "inverse-native-reference-pcb-callback-resume", method: "Debugger.resume", params: {} },
  ...(["rpc", "callback"] as const).map(role => ({ phase: "inverse-native-reference-pcb-callback-frame", role, method: "Debugger.evaluateOnCallFrame", params: { callFrameId: "original_ref", expression: EXPRESSIONS[role], objectGroup: CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_PCB_CALLBACK_FLAGS.objectGroup, silent: true, generatePreview: false, throwOnSideEffect: true, returnByValue: false, includeCommandLineAPI: false } })),
].map(c => validateCurrentFootprintInverseNativeReferencePcbCallbackCommand(c))); }
/** Emit a complete method/params row for the unchanged fixed-message decoder. */
export function currentFootprintInverseNativeReferencePcbCallbackTemplate(input: CurrentFootprintInverseNativeReferencePcbCallbackCommand): Readonly<{ key: string; method: string; names: readonly string[]; template: string }> {
  const c = validateCurrentFootprintInverseNativeReferencePcbCallbackCommand(input); const names: string[] = []; const field = (name: string): string => { if (names.includes(name)) { throw new Error("INVERSE_NATIVE_REFERENCE_PCB_CALLBACK_FIELD"); } names.push(name); return `__native_reference_pcb_callback_${name}__`; }; const params: Record<string, unknown> = { ...c.params };
  if (c.method === "Runtime.callFunctionOn") { params["objectId"] = field("objectId"); params["functionDeclaration"] = `__native_reference_pcb_callback_program_${c.role}__`; params["arguments"] = c.params.arguments.map((_, index) => ({ objectId: field(`reference${String(index)}`) })); } else if (c.method === "Debugger.evaluateOnCallFrame") { params["callFrameId"] = field("callFrameId"); } else if (c.method === "Debugger.getScriptSource") { params["scriptId"] = field("scriptId"); } else if (c.method === "Debugger.removeBreakpoint") { params["breakpointId"] = field("breakpointId"); } else if (c.method !== "Debugger.resume") { params["objectId"] = field("objectId"); }
  return freezeDeep({ key: c.phase.slice("inverse-native-reference-pcb-callback-".length) + ("role" in c ? `:${c.role}` : ""), method: c.method, names, template: JSON.stringify({ method: c.method, params }) });
}
