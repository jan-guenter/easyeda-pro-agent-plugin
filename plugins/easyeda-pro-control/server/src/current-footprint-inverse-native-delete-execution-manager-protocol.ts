/** Closed original DEL wrapper/body/receiver grammar. Three guarded resumes
 * stop before deleteData reads its ready project or invokes the worker bus. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_EXECUTION_MANAGER_EXPRESSIONS as EXPRESSIONS, CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_EXECUTION_MANAGER_PROGRAMS as P } from "./current-footprint-inverse-native-delete-execution-manager-programs.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_EXECUTION_MANAGER_CALLS = freezeDeep({ prepare: { refs: 5, size: 7 }, manager: { refs: 12, size: 1 }, before: { refs: 4, size: 0 }, wrapper: { refs: 3, size: 0 }, body: { refs: 6, size: 0 }, deleteData: { refs: 6, size: 0 } } as const);
/** The original remote object-group label is inert storage metadata; own
 * phase, event, request, controller and Core ledgers supply DEL custody. */
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_EXECUTION_MANAGER_FLAGS = Object.freeze({ objectGroup: "easyeda-footprint-inverse-native-get-task-manager-v1", silent: true, generatePreview: false, awaitPromise: false, userGesture: false, throwOnSideEffect: true } as const);
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_EXECUTION_MANAGER_REQUESTS = Object.freeze({ calls: 6, properties: 15, frames: 5, helpers: 11, arm: 3, remove: 3, resumes: 3, cdpRequests: 46, controls: 58, events: 17 } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), ref = z.strictObject({ objectId: handle }), roles = ["prepare", "manager", "before", "wrapper", "body", "deleteData"] as const;
const callParams = z.strictObject({ objectGroup: z.literal(CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_EXECUTION_MANAGER_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), awaitPromise: z.literal(false), userGesture: z.literal(false), throwOnSideEffect: z.literal(true), objectId: handle, functionDeclaration: z.string().max(16_384), arguments: z.array(ref).max(13), returnByValue: z.boolean() });
const propertyParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const helperParams = z.strictObject({ scriptId: handle });
const frameParams = z.strictObject({ callFrameId: handle, expression: z.string().max(256), objectGroup: z.literal(CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_EXECUTION_MANAGER_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) });
const armParams = z.strictObject({ objectId: handle, condition: z.literal("") });
const removeParams = z.strictObject({ breakpointId: handle });
const resumeParams = z.strictObject({});
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("inverse-native-delete-execution-manager-call"), role: z.enum(roles), method: z.literal("Runtime.callFunctionOn"), params: callParams }),
  z.strictObject({ phase: z.literal("inverse-native-delete-execution-manager-properties"), method: z.literal("Runtime.getProperties"), params: propertyParams }),
  z.strictObject({ phase: z.literal("inverse-native-delete-execution-manager-helper"), method: z.literal("Debugger.getScriptSource"), params: helperParams }),
  z.strictObject({ phase: z.literal("inverse-native-delete-execution-manager-arm"), role: z.enum(["wrapper", "body", "deleteData"]), method: z.literal("Debugger.setBreakpointOnFunctionCall"), params: armParams }),
  z.strictObject({ phase: z.literal("inverse-native-delete-execution-manager-remove"), method: z.literal("Debugger.removeBreakpoint"), params: removeParams }),
  z.strictObject({ phase: z.literal("inverse-native-delete-execution-manager-resume"), method: z.literal("Debugger.resume"), params: resumeParams }),
  z.strictObject({ phase: z.literal("inverse-native-delete-execution-manager-frame"), role: z.enum(["callback", "wrapper", "body", "applier", "deleteData"]), method: z.literal("Debugger.evaluateOnCallFrame"), params: frameParams }),
]);
export type CurrentFootprintInverseNativeDeleteExecutionManagerCommand = Readonly<z.infer<typeof schema>>;
/** Require the declared source, full argument arity and exact readonly flags. */
export function validateCurrentFootprintInverseNativeDeleteExecutionManagerCommand(input: unknown): CurrentFootprintInverseNativeDeleteExecutionManagerCommand {
  const c = schema.parse(capture(input)); if (c.method === "Runtime.callFunctionOn") { const row = CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_EXECUTION_MANAGER_CALLS[c.role]; if (c.params.functionDeclaration !== P[c.role] || c.params.arguments.length !== row.refs || c.params.returnByValue !== (row.size === 0)) { throw new Error("INVERSE_NATIVE_DELETE_EXECUTION_MANAGER_COMMAND"); } } else if (c.method === "Debugger.evaluateOnCallFrame" && c.params.expression !== EXPRESSIONS[c.role]) { throw new Error("INVERSE_NATIVE_DELETE_EXECUTION_MANAGER_EXPRESSION"); } return freezeDeep(c);
}
/** Correlate only a literal program already admitted by the closed grammar. */
export function qualifyCurrentFootprintInverseNativeDeleteExecutionManagerHelper(input: unknown, command: CurrentFootprintInverseNativeDeleteExecutionManagerCommand): void {
  const source = z.strictObject({ scriptSource: z.string().max(16_386) }).parse(capture(input)); const c = validateCurrentFootprintInverseNativeDeleteExecutionManagerCommand(command); let expected: string | null = null; if (c.method === "Runtime.callFunctionOn") { expected = `(${c.params.functionDeclaration})`; } else if (c.method === "Debugger.evaluateOnCallFrame") { expected = c.params.expression; } if (expected === null || source.scriptSource !== expected) { throw new Error("INVERSE_NATIVE_DELETE_EXECUTION_MANAGER_HELPER"); }
}
/** Bind the fixed command to the actual private pipe ID and UI session. */
export function currentFootprintInverseNativeDeleteExecutionManagerWire(input: CurrentFootprintInverseNativeDeleteExecutionManagerCommand, id: number, sessionId: string): CurrentFootprintInverseNativeDeleteExecutionManagerCommand & Readonly<{ id: number; sessionId: string; inverseNativeDeleteExecutionManager: true }> { if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647) { throw new Error("INVERSE_NATIVE_DELETE_EXECUTION_MANAGER_ID"); } handle.parse(sessionId); return freezeDeep({ ...validateCurrentFootprintInverseNativeDeleteExecutionManagerCommand(input), id, sessionId, inverseNativeDeleteExecutionManager: true }); }
/** Decode exact original wire bytes; no endpoint, source or native code is
 * taken from fields outside the validated command and its owned identities. */
export function currentFootprintInverseNativeDeleteExecutionManagerNativeFrame(bytes: Buffer, input: CurrentFootprintInverseNativeDeleteExecutionManagerCommand, sessionId: string): Readonly<Record<string, string | number>> {
  if (bytes.length > 65_536 || bytes.at(-1) !== 0) { throw new Error("INVERSE_NATIVE_DELETE_EXECUTION_MANAGER_FRAME"); } const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(0, -1))); const id = z.looseObject({ id: z.number().int().positive().max(2_147_483_647) }).parse(capture(raw)).id; const c = validateCurrentFootprintInverseNativeDeleteExecutionManagerCommand(input); if (bytes.toString("utf8") !== `${JSON.stringify(currentFootprintInverseNativeDeleteExecutionManagerWire(c, id, sessionId))}\0`) { throw new Error("INVERSE_NATIVE_DELETE_EXECUTION_MANAGER_BYTES"); }
  const fields: Record<string, string | number> = { action: "footprint-inverse-native-delete-execution-manager", requestId: id, phase: c.phase, method: c.method }; if (c.method === "Runtime.callFunctionOn") { fields["role"] = c.role; fields["objectId"] = c.params.objectId; for (const [index, arg] of c.params.arguments.entries()) { fields[`reference${String(index)}`] = arg.objectId; } } else if (c.method === "Debugger.evaluateOnCallFrame") { fields["role"] = c.role; fields["callFrameId"] = c.params.callFrameId; } else if (c.method === "Debugger.getScriptSource") { fields["scriptId"] = c.params.scriptId; } else if (c.method === "Debugger.removeBreakpoint") { fields["breakpointId"] = c.params.breakpointId; } else if (c.method !== "Debugger.resume") { if (c.method === "Debugger.setBreakpointOnFunctionCall") { fields["role"] = c.role; } fields["objectId"] = c.params.objectId; } return Object.freeze(fields);
}
/** Enumerate all fixed manager-entry cases for complete emitted native/CDP parity. */
export function currentFootprintInverseNativeDeleteExecutionManagerCases(): readonly CurrentFootprintInverseNativeDeleteExecutionManagerCommand[] { return freezeDeep([
  ...roles.map(role => { const row = CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_EXECUTION_MANAGER_CALLS[role]; return { phase: "inverse-native-delete-execution-manager-call", role, method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_EXECUTION_MANAGER_FLAGS, objectId: "original_ref", functionDeclaration: P[role], arguments: Array.from({ length: row.refs }, () => ({ objectId: "original_ref" })), returnByValue: row.size === 0 } }; }),
  { phase: "inverse-native-delete-execution-manager-properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
  { phase: "inverse-native-delete-execution-manager-helper", method: "Debugger.getScriptSource", params: { scriptId: "original_ref" } },
  { phase: "inverse-native-delete-execution-manager-arm", role: "wrapper", method: "Debugger.setBreakpointOnFunctionCall", params: { objectId: "original_ref", condition: "" } },
  ...(["body", "deleteData"] as const).map(role => ({ phase: "inverse-native-delete-execution-manager-arm", role, method: "Debugger.setBreakpointOnFunctionCall", params: { objectId: "original_ref", condition: "" } })),
  { phase: "inverse-native-delete-execution-manager-remove", method: "Debugger.removeBreakpoint", params: { breakpointId: "original_ref" } },
  { phase: "inverse-native-delete-execution-manager-resume", method: "Debugger.resume", params: {} },
  ...(["callback", "wrapper", "body", "applier", "deleteData"] as const).map(role => ({ phase: "inverse-native-delete-execution-manager-frame", role, method: "Debugger.evaluateOnCallFrame", params: { callFrameId: "original_ref", expression: EXPRESSIONS[role], objectGroup: CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_EXECUTION_MANAGER_FLAGS.objectGroup, silent: true, generatePreview: false, throwOnSideEffect: true, returnByValue: false, includeCommandLineAPI: false } })),
].map(c => validateCurrentFootprintInverseNativeDeleteExecutionManagerCommand(c))); }
/** Emit a complete method/params row for the unchanged fixed-message decoder. */
export function currentFootprintInverseNativeDeleteExecutionManagerTemplate(input: CurrentFootprintInverseNativeDeleteExecutionManagerCommand): Readonly<{ key: string; method: string; names: readonly string[]; template: string }> {
  const c = validateCurrentFootprintInverseNativeDeleteExecutionManagerCommand(input); const names: string[] = []; const field = (name: string): string => { if (names.includes(name)) { throw new Error("INVERSE_NATIVE_DELETE_EXECUTION_MANAGER_FIELD"); } names.push(name); return `__native_delete_execution_manager_${name}__`; }; const params: Record<string, unknown> = { ...c.params };
  if (c.method === "Runtime.callFunctionOn") { params["objectId"] = field("objectId"); params["functionDeclaration"] = `__native_delete_execution_manager_program_${c.role}__`; params["arguments"] = c.params.arguments.map((_, index) => ({ objectId: field(`reference${String(index)}`) })); } else if (c.method === "Debugger.evaluateOnCallFrame") { params["callFrameId"] = field("callFrameId"); } else if (c.method === "Debugger.getScriptSource") { params["scriptId"] = field("scriptId"); } else if (c.method === "Debugger.removeBreakpoint") { params["breakpointId"] = field("breakpointId"); } else if (c.method !== "Debugger.resume") { params["objectId"] = field("objectId"); }
  return freezeDeep({ key: c.phase.slice("inverse-native-delete-execution-manager-".length) + ("role" in c ? `:${c.role}` : ""), method: c.method, names, template: JSON.stringify({ method: c.method, params }) });
}
