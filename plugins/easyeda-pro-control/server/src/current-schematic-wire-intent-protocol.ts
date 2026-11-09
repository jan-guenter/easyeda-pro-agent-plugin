/** Separate original Wire intent grammar. Only fixed idle/monitor descriptors
 * and original lexical this joins; no setter, action, worker or Save runs. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_SCHEMATIC_WIRE_INTENT_CALLS } from "./current-schematic-wire-intent-programs.ts";

export { CURRENT_SCHEMATIC_WIRE_INTENT_CALLS } from "./current-schematic-wire-intent-programs.ts";
export const CURRENT_SCHEMATIC_WIRE_INTENT_GROUP = "easyeda-pro-control-schematic-wire-intent-v1";
// Idle21 plus monitor60: three complete8-scope searches include fixed projection
// Array properties for each scope, followed by actual receiver joins.
export const CURRENT_SCHEMATIC_WIRE_INTENT_REQUESTS = Object.freeze({ normal: 81, cleanup: 1, total: 82 });
const roles = ["idle", "idleSame", "monitors", "monitorsSame", "scope", "closure0", "closure1", "closure2"] as const;
export type CurrentSchematicWireIntentRole = typeof roles[number];
export const CURRENT_SCHEMATIC_WIRE_INTENT_EXTRA_ARGUMENTS = Object.freeze({ idle: 1, idleSame: 1, monitors: 0, monitorsSame: 0, scope: 0, closure0: 1, closure1: 1, closure2: 1 });
export const CURRENT_SCHEMATIC_WIRE_INTENT_FLAGS = Object.freeze({ objectGroup: CURRENT_SCHEMATIC_WIRE_INTENT_GROUP, silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const text = z.string().min(1).max(16_384).refine(value => value.isWellFormed() && Buffer.byteLength(value) <= 16_384);
const object = z.strictObject({ objectId: handle }); const data = z.strictObject({ value: text });
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_WIRE_INTENT_GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const calls = roles.map(role => {
  const args = z.tuple([object, data, data], object).refine(value => value.length === CURRENT_SCHEMATIC_WIRE_INTENT_EXTRA_ARGUMENTS[role] + 3);
  const params = z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(CURRENT_SCHEMATIC_WIRE_INTENT_CALLS[role]), arguments: args, returnByValue: z.literal(role === "idleSame" || role === "monitorsSame" || role.startsWith("closure")) });
  return z.strictObject({ phase: z.literal("wire-intent-call"), role: z.literal(role), method: z.literal("Runtime.callFunctionOn"), params });
});
const propertyParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const releaseParams = z.strictObject({ objectGroup: z.literal(CURRENT_SCHEMATIC_WIRE_INTENT_GROUP) });
const commands = z.union([...calls,
  z.strictObject({ phase: z.literal("wire-intent-properties"), method: z.literal("Runtime.getProperties"), params: propertyParams }),
  z.strictObject({ phase: z.literal("wire-intent-release"), method: z.literal("Runtime.releaseObjectGroup"), params: releaseParams }),
]);
export type CurrentSchematicWireIntentCommand = z.infer<typeof commands>;
export function validateCurrentSchematicWireIntentCommand(input: unknown): CurrentSchematicWireIntentCommand { return freezeDeep(commands.parse(captureCurrentPcbStringClockReply(input).value)); }
export function requireCurrentSchematicWireIntentArguments(command: CurrentSchematicWireIntentCommand, holder: string, target: string, operation: string): void {
  if (command.phase === "wire-intent-call" && (canonicalJson(command.params.arguments.slice(0, 3)) !== canonicalJson([{ objectId: holder }, { value: target }, { value: operation }]) ||
    !["scope", "idleSame", "monitorsSame"].includes(command.role) && command.params.objectId !== holder)) { throw new Error("SCHEMATIC_WIRE_INTENT_ORIGINAL_ARGUMENTS"); }
}
export function currentSchematicWireIntentCases(): readonly CurrentSchematicWireIntentCommand[] {
  return freezeDeep([
    ...roles.map(role => validateCurrentSchematicWireIntentCommand({ phase: "wire-intent-call", role, method: "Runtime.callFunctionOn", params: { ...CURRENT_SCHEMATIC_WIRE_INTENT_FLAGS, objectId: "original_holder", functionDeclaration: CURRENT_SCHEMATIC_WIRE_INTENT_CALLS[role],
      arguments: [{ objectId: "original_holder" }, { value: "{}" }, { value: "{}" }, ...Array.from({ length: CURRENT_SCHEMATIC_WIRE_INTENT_EXTRA_ARGUMENTS[role] }, () => ({ objectId: "original_ref" }))], returnByValue: role === "idleSame" || role === "monitorsSame" || role.startsWith("closure") } })),
    validateCurrentSchematicWireIntentCommand({ phase: "wire-intent-properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }),
    validateCurrentSchematicWireIntentCommand({ phase: "wire-intent-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: CURRENT_SCHEMATIC_WIRE_INTENT_GROUP } }),
  ]);
}
export function currentSchematicWireIntentTemplate(input: unknown): Readonly<{ phase: string; method: string; fields: Readonly<Record<string, "handle">>; values: Readonly<Record<string, string>>; template: string }> {
  const command = validateCurrentSchematicWireIntentCommand(input), fields: Record<string, "handle"> = {}, values: Record<string, string> = {};
  const field = (name: string, value: string): string => { fields[name] = "handle"; values[name] = value; return `__schematic_wireintent_${name}__`; };
  const params: Record<string, unknown> = { ...command.params }; let phase: string = command.phase;
  if (command.phase === "wire-intent-call") {
    phase += `-${command.role}`; params["objectId"] = ["scope", "idleSame", "monitorsSame"].includes(command.role) ? field("objectId", command.params.objectId) : "__schematic_wireintent_boundHolder__";
    params["arguments"] = [{ objectId: "__schematic_wireintent_boundHolder__" }, { value: "__schematic_wireintent_boundTarget__" }, { value: "__schematic_wireintent_boundOperation__" }, ...command.params.arguments.slice(3).map((argument, index) => {
      if (!("objectId" in argument)) { throw new Error("SCHEMATIC_WIRE_INTENT_HANDLE_ARGUMENT"); } return { objectId: field(`arg${String(index)}`, argument.objectId) };
    })];
  } else if (command.phase === "wire-intent-properties") { params["objectId"] = field("objectId", command.params.objectId); }
  return freezeDeep({ phase, method: command.method, fields, values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentSchematicWireIntentWire(input: unknown, requestId: number): Readonly<{ command: CurrentSchematicWireIntentCommand; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(requestId) || requestId < 1 || requestId > 2_147_483_647) { throw new Error("SCHEMATIC_WIRE_INTENT_ID"); }
  const command = validateCurrentSchematicWireIntentCommand(input); const fixed = currentSchematicWireIntentTemplate(command);
  return freezeDeep({ command, request: { action: "schematic-wire-edit-intent", requestId, phase: fixed.phase, method: fixed.method, ...fixed.values } });
}
