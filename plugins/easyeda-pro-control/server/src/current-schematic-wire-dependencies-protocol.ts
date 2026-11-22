/** Separate bound-holder native dependency grammar. Only fixed readonly
 * programs and native handles enter transport; no original writer is issued. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_SCHEMATIC_WIRE_DEPENDENCY_CALLS } from "./current-schematic-wire-dependencies-programs.ts";

export { CURRENT_SCHEMATIC_WIRE_DEPENDENCY_CALLS } from "./current-schematic-wire-dependencies-programs.ts";
export const CURRENT_SCHEMATIC_WIRE_DEPENDENCY_GROUP = "easyeda-pro-control-schematic-wire-dependencies-v1";
// Capture/array18 metadata, iterator/array/next metadata and final identity.
export const CURRENT_SCHEMATIC_WIRE_DEPENDENCY_REQUESTS = Object.freeze({ normal: 24, cleanup: 1, total: 25 });
const roles = ["capture", "iterator", "same"] as const;
export type CurrentSchematicWireDependencyRole = typeof roles[number];
export const CURRENT_SCHEMATIC_WIRE_DEPENDENCY_EXTRA_ARGUMENTS = Object.freeze({ capture: 0, iterator: 1, same: 2 });
export const CURRENT_SCHEMATIC_WIRE_DEPENDENCY_FLAGS = Object.freeze({ objectGroup: CURRENT_SCHEMATIC_WIRE_DEPENDENCY_GROUP, silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const text = z.string().min(1).max(16_384).refine(value => value.isWellFormed() && Buffer.byteLength(value) <= 16_384);
const object = z.strictObject({ objectId: handle }); const data = z.strictObject({ value: text });
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_WIRE_DEPENDENCY_GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const calls = roles.map(role => {
  const args = z.tuple([object, data, data], object).refine(value => value.length === CURRENT_SCHEMATIC_WIRE_DEPENDENCY_EXTRA_ARGUMENTS[role] + 3);
  const params = z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(CURRENT_SCHEMATIC_WIRE_DEPENDENCY_CALLS[role]), arguments: args, returnByValue: z.literal(role === "same") });
  return z.strictObject({ phase: z.literal("wire-dependency-call"), role: z.literal(role), method: z.literal("Runtime.callFunctionOn"), params });
});
const propertyParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const releaseParams = z.strictObject({ objectGroup: z.literal(CURRENT_SCHEMATIC_WIRE_DEPENDENCY_GROUP) });
const commands = z.union([...calls,
  z.strictObject({ phase: z.literal("wire-dependency-properties"), method: z.literal("Runtime.getProperties"), params: propertyParams }),
  z.strictObject({ phase: z.literal("wire-dependency-release"), method: z.literal("Runtime.releaseObjectGroup"), params: releaseParams }),
]);
export type CurrentSchematicWireDependencyCommand = z.infer<typeof commands>;
export function validateCurrentSchematicWireDependencyCommand(input: unknown): CurrentSchematicWireDependencyCommand { return freezeDeep(commands.parse(captureCurrentPcbStringClockReply(input).value)); }
export function requireCurrentSchematicWireDependencyArguments(command: CurrentSchematicWireDependencyCommand, holder: string, target: string, operation: string): void {
  if (command.phase === "wire-dependency-call" && (canonicalJson(command.params.arguments.slice(0, 3)) !== canonicalJson([{ objectId: holder }, { value: target }, { value: operation }]) ||
    command.params.objectId !== holder)) { throw new Error("SCHEMATIC_WIRE_DEPENDENCY_ORIGINAL_ARGUMENTS"); }
}
export function currentSchematicWireDependencyCases(): readonly CurrentSchematicWireDependencyCommand[] {
  return freezeDeep([
    ...roles.map(role => validateCurrentSchematicWireDependencyCommand({ phase: "wire-dependency-call", role, method: "Runtime.callFunctionOn", params: { ...CURRENT_SCHEMATIC_WIRE_DEPENDENCY_FLAGS, objectId: "original_holder", functionDeclaration: CURRENT_SCHEMATIC_WIRE_DEPENDENCY_CALLS[role],
      arguments: [{ objectId: "original_holder" }, { value: "{}" }, { value: "{}" }, ...Array.from({ length: CURRENT_SCHEMATIC_WIRE_DEPENDENCY_EXTRA_ARGUMENTS[role] }, () => ({ objectId: "original_ref" }))], returnByValue: role === "same" } })),
    validateCurrentSchematicWireDependencyCommand({ phase: "wire-dependency-properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }),
    validateCurrentSchematicWireDependencyCommand({ phase: "wire-dependency-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: CURRENT_SCHEMATIC_WIRE_DEPENDENCY_GROUP } }),
  ]);
}
export function currentSchematicWireDependencyTemplate(input: unknown): Readonly<{ phase: string; method: string; fields: Readonly<Record<string, "handle">>; values: Readonly<Record<string, string>>; template: string }> {
  const command = validateCurrentSchematicWireDependencyCommand(input), fields: Record<string, "handle"> = {}, values: Record<string, string> = {};
  const field = (name: string, value: string): string => { fields[name] = "handle"; values[name] = value; return `__schematic_wiredependency_${name}__`; };
  const params: Record<string, unknown> = { ...command.params }; let phase: string = command.phase;
  if (command.phase === "wire-dependency-call") {
    phase += `-${command.role}`; params["objectId"] = "__schematic_wiredependency_boundHolder__";
    params["arguments"] = [{ objectId: "__schematic_wiredependency_boundHolder__" }, { value: "__schematic_wiredependency_boundTarget__" }, { value: "__schematic_wiredependency_boundOperation__" }, ...command.params.arguments.slice(3).map((argument, index) => {
      if (!("objectId" in argument)) { throw new Error("SCHEMATIC_WIRE_DEPENDENCY_HANDLE_ARGUMENT"); } return { objectId: field(`arg${String(index)}`, argument.objectId) };
    })];
  } else if (command.phase === "wire-dependency-properties") { params["objectId"] = field("objectId", command.params.objectId); }
  return freezeDeep({ phase, method: command.method, fields, values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentSchematicWireDependencyWire(input: unknown, requestId: number): Readonly<{ command: CurrentSchematicWireDependencyCommand; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(requestId) || requestId < 1 || requestId > 2_147_483_647) { throw new Error("SCHEMATIC_WIRE_DEPENDENCY_ID"); }
  const command = validateCurrentSchematicWireDependencyCommand(input); const fixed = currentSchematicWireDependencyTemplate(command);
  return freezeDeep({ command, request: { action: "schematic-wire-edit-dependencies", requestId, phase: fixed.phase, method: fixed.method, ...fixed.values } });
}
