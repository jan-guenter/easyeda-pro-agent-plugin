/** Finite readonly loading observation. Realm/callee/held-call selectors remain
 * original-owner duties; no caller program, condition or application API exists. */
import { z } from "zod";
import { CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_CALLS as CACHE, CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_PROFILES as CACHE_PROFILES } from "./current-native-cache-response-intrinsics.ts";
import { CURRENT_NATIVE_FETCH_BYTES_CALLS as BYTES, CURRENT_NATIVE_FETCH_BYTES_PROFILES as BYTES_PROFILES } from "./current-native-fetch-bytes-intrinsics.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PCB_VIA_SAVED_LOAD_CALLS as CALLS, CURRENT_PCB_VIA_SAVED_LOAD_FLOW_CALL as FLOW, CURRENT_PCB_VIA_SAVED_LOAD_GROUP as GROUP } from "./current-pcb-via-saved-load-programs.ts";
import { CURRENT_PCB_VIA_SAVED_LOAD_READ_ROLES as READ_ROLES, CURRENT_PCB_VIA_SAVED_LOAD_ROLES as ROLES, CURRENT_PCB_VIA_SAVED_LOAD_SITES as SITES } from "./current-pcb-via-saved-load-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), reference = z.strictObject({ objectId: z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u) });
export const CURRENT_PCB_VIA_SAVED_LOAD_CALL_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
export const CURRENT_PCB_VIA_SAVED_LOAD_FRAME_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true, returnByValue: false, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } as const);
const callFlags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const frameFlags = { objectGroup: z.literal(GROUP), silent: z.literal(true), returnByValue: z.literal(false), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), includeCommandLineAPI: z.literal(false) };
export const CURRENT_PCB_VIA_SAVED_LOAD_INTRINSIC_CALLS = freezeDeep({ cacheConstructors: CACHE.constructors, cacheMembers: CACHE.members, cacheReprove: CACHE.reprove,
  bytesConstructors: BYTES.constructors, bytesMembers: BYTES.members, bytesReprove: BYTES.reprove });
export const CURRENT_PCB_VIA_SAVED_LOAD_ARRAY_LENGTHS = Object.freeze({ cacheConstructors: 4, cacheMembers: 28, bytesConstructors: 4, bytesMembers: 7, project: 3, flowEntry: 6, flowFunctions: 2 });
const callRoles = ["cacheConstructors", "cacheMembers", "cacheReprove", "bytesConstructors", "bytesMembers", "bytesReprove"] as const;
export type CurrentPcbViaSavedLoadIntrinsicRole = typeof callRoles[number];
const properties = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const byValue = (role: CurrentPcbViaSavedLoadIntrinsicRole): z.ZodLiteral<boolean> => z.literal(role.endsWith("Reprove"));
const roleNames = z.enum(["cacheConstructors", "cacheMembers", "bytesConstructors", "bytesMembers", "project", "flowEntry", "flowFunctions"]);
const nativeRoles = z.enum(["cache", "bytes"]), positiveIndex = z.number().int().positive().max(27);
const readRoles = z.enum(READ_ROLES), roles = z.enum(ROLES);
const declarations = z.enum(READ_ROLES.map(role => CALLS[role])), expressions = z.enum(READ_ROLES.map(role => SITES[role].expression));
const argumentTuple = z.tuple([reference, reference, reference]);
const methods = callRoles.map(role => z.strictObject({ phase: z.literal("saved-observe-intrinsic"), role: z.literal(role), method: z.literal("Runtime.callFunctionOn"),
  params: z.strictObject({ ...callFlags, ...(role.endsWith("Constructors") ? { uniqueContextId: handle } : { objectId: handle }),
    functionDeclaration: z.literal(CURRENT_PCB_VIA_SAVED_LOAD_INTRINSIC_CALLS[role].program), arguments: z.tuple([]), returnByValue: byValue(role) }) }));
const coordinate = z.number().int().nonnegative();
const point = z.strictObject({ scriptId: handle, lineNumber: coordinate, columnNumber: coordinate });
const noArguments = z.tuple([]), noParams = z.strictObject({});
const falseValue = z.literal(false), flowDeclaration = z.literal(FLOW), trueValue = z.literal(true);
const schema = z.union([...methods,
  z.strictObject({ phase: z.literal("saved-observe-array"), role: roleNames, method: z.literal("Runtime.getProperties"), params: properties }),
  z.strictObject({ phase: z.literal("saved-observe-native"), role: nativeRoles, index: positiveIndex, method: z.literal("Runtime.getProperties"), params: properties }),
  z.strictObject({ phase: z.literal("saved-observe-flow-method"), role: z.enum(["update", "end"]), method: z.literal("Runtime.getProperties"), params: properties }),
  z.strictObject({ phase: z.literal("saved-observe-flow-functions"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...callFlags, objectId: handle, functionDeclaration: flowDeclaration, arguments: noArguments, returnByValue: falseValue }) }),
  z.strictObject({ phase: z.literal("saved-observe-arm"), role: roles, method: z.literal("Debugger.setBreakpoint"), params: z.strictObject({ location: point }) }),
  z.strictObject({ phase: z.literal("saved-observe-frame"), role: readRoles, method: z.literal("Debugger.evaluateOnCallFrame"), params: z.strictObject({ ...frameFlags, callFrameId: handle, expression: expressions }) }),
  z.strictObject({ phase: z.literal("saved-observe-value"), role: readRoles, method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...callFlags,
    objectId: handle, functionDeclaration: declarations, arguments: argumentTuple, returnByValue: trueValue }) }),
  z.strictObject({ phase: z.literal("saved-observe-resume"), role: readRoles, method: z.literal("Debugger.resume"), params: noParams }),
  z.strictObject({ phase: z.literal("saved-observe-helper"), method: z.literal("Debugger.getScriptSource"), params: z.strictObject({ scriptId: handle }) }),
  z.strictObject({ phase: z.literal("saved-observe-start-project"), method: z.literal("Debugger.resume"), params: noParams }),
]);
export type CurrentPcbViaSavedLoadObservationCommand = z.infer<typeof schema>;
export function validateCurrentPcbViaSavedLoadObservationCommand(input: unknown): CurrentPcbViaSavedLoadObservationCommand {
  const command = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.phase === "saved-observe-arm") { const site = SITES[command.role]; if (command.params.location.lineNumber !== site.lineNumber || command.params.location.columnNumber !== site.columnNumber) { throw new Error("SAVED_LOAD_FIXED_ARM"); } }
  if (command.phase === "saved-observe-frame" && command.params.expression !== SITES[command.role].expression || command.phase === "saved-observe-value" && command.params.functionDeclaration !== CALLS[command.role]) { throw new Error("SAVED_LOAD_FIXED_PROGRAM"); }
  if (command.phase === "saved-observe-native" && !(command.role === "cache" ? CACHE_PROFILES : BYTES_PROFILES).some(row => row.index === command.index)) { throw new Error("SAVED_LOAD_NATIVE_PROFILE"); }
  return freezeDeep(command);
}
/** Six intrinsic calls, four tuple reads,27 actual native function proofs,
 * thirteen arms, thirteen frame/value/resume triples plus one project ref read,
 *34 exact helper-source receipts, two flow-closure joins and original resume. */
export const CURRENT_PCB_VIA_SAVED_LOAD_OBSERVATION_REQUESTS = Object.freeze({ intrinsicCalls: 6, intrinsicArrays: 4, nativeMetadata: CACHE_PROFILES.length + BYTES_PROFILES.length,
  arms: ROLES.length, normalPauses: 13, helperSources: 6 + 2 * 13 + 2, flowProofRequests: 2 * 6,
  normal: 6 + 4 + CACHE_PROFILES.length + BYTES_PROFILES.length + ROLES.length + 2 * 13 + 1 + 6 + 2 * 13 + 2 * 6,
  continuation: 13 + 1, total: 6 + 4 + CACHE_PROFILES.length + BYTES_PROFILES.length + ROLES.length + 3 * 13 + 1 + 6 + 2 * 13 + 2 * 6 + 1 });
export function currentPcbViaSavedLoadObservationCases(): readonly CurrentPcbViaSavedLoadObservationCommand[] {
  const objectId = "saved_observe_objectId", result: CurrentPcbViaSavedLoadObservationCommand[] = [];
  for (const role of callRoles) { result.push(validateCurrentPcbViaSavedLoadObservationCommand({ phase: "saved-observe-intrinsic", role, method: "Runtime.callFunctionOn",
    params: { ...CURRENT_PCB_VIA_SAVED_LOAD_CALL_FLAGS, ...(role.endsWith("Constructors") ? { uniqueContextId: "saved_observe_uniqueContextId" } : { objectId }),
      functionDeclaration: CURRENT_PCB_VIA_SAVED_LOAD_INTRINSIC_CALLS[role].program, arguments: [], returnByValue: role.endsWith("Reprove") } })); }
  for (const role of ["cacheConstructors", "cacheMembers", "bytesConstructors", "bytesMembers", "project", "flowEntry", "flowFunctions"] as const) { result.push({ phase: "saved-observe-array", role, method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
  for (const role of ["cache", "bytes"] as const) { for (const profile of role === "cache" ? CACHE_PROFILES : BYTES_PROFILES) { result.push({ phase: "saved-observe-native", role, index: profile.index, method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); } }
  for (const role of ["update", "end"] as const) { result.push({ phase: "saved-observe-flow-method", role, method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
  result.push({ phase: "saved-observe-flow-functions", method: "Runtime.callFunctionOn", params: { ...CURRENT_PCB_VIA_SAVED_LOAD_CALL_FLAGS, objectId, functionDeclaration: FLOW, arguments: [], returnByValue: false } });
  for (const role of ROLES) { const site = SITES[role]; result.push({ phase: "saved-observe-arm", role, method: "Debugger.setBreakpoint", params: { location: { scriptId: "saved_observe_scriptId", lineNumber: site.lineNumber, columnNumber: site.columnNumber } } }); }
  for (const role of READ_ROLES) { const site = SITES[role]; result.push(
    { phase: "saved-observe-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...CURRENT_PCB_VIA_SAVED_LOAD_FRAME_FLAGS, callFrameId: "saved_observe_callFrameId", expression: site.expression } },
    { phase: "saved-observe-value", role, method: "Runtime.callFunctionOn", params: { ...CURRENT_PCB_VIA_SAVED_LOAD_CALL_FLAGS, objectId, functionDeclaration: CALLS[role], returnByValue: true,
      arguments: [{ objectId: "saved_observe_cache" }, { objectId: "saved_observe_bytes" }, { objectId: "saved_observe_project" }] } },
    { phase: "saved-observe-resume", role, method: "Debugger.resume", params: {} }); }
  result.push({ phase: "saved-observe-helper", method: "Debugger.getScriptSource", params: { scriptId: "saved_observe_scriptId" } },
    { phase: "saved-observe-start-project", method: "Debugger.resume", params: {} });
  return freezeDeep(result);
}
