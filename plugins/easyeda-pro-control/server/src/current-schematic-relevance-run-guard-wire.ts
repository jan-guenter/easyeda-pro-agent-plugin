/** Separate receiver/continuation syntax. The actual controller and original
 * pending invocation must still authorize every correlated step. */
import { z } from "zod";
import { CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_FLAGS as FLAGS, CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_GUARDS as GUARDS, validateCurrentSchematicRelevanceRunPrefixCommand } from "./current-schematic-relevance-run-prefix-protocol.ts";
import type { CurrentSchematicRelevanceRunGuardStep } from "./current-schematic-relevance-run-guard-controller.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const role = z.enum(["run", ...GUARDS]);
const schema = z.strictObject({ guard: role, command: z.unknown() });
export function validateCurrentSchematicRelevanceRunGuardStep(input: unknown): CurrentSchematicRelevanceRunGuardStep {
  const value = schema.parse(captureCurrentPcbStringClockReply(input).value); const command = validateCurrentSchematicRelevanceRunPrefixCommand(value.command);
  let allowed = false;
  if (command.phase === "prefix-resume") { allowed = command.role === value.guard; }
  else if (value.guard !== "run") {
    switch (command.phase) {
      case "prefix-arm": case "prefix-remove": { allowed = command.role === value.guard; break; }
      case "prefix-frame": { allowed = command.role === "receiver"; break; }
      case "prefix-properties": { allowed = true; break; }
      case "prefix-call": { allowed = command.role === "callback-receiver"; break; }
      case "prefix-source": { break; }
      default: { throw new Error("SCHEMATIC_RUN_GUARD_PHASE"); }
    }
  }
  if (!allowed) { throw new Error("SCHEMATIC_RUN_GUARD_FIXED_STEP"); } return freezeDeep({ guard: value.guard, command });
}
export function currentSchematicRelevanceRunGuardCases(): readonly CurrentSchematicRelevanceRunGuardStep[] {
  const values: CurrentSchematicRelevanceRunGuardStep[] = [];
  const proof = CALLS.find(row => row[0] === "callback-receiver"); if (proof === undefined) { throw new Error("SCHEMATIC_RUN_GUARD_PROOF"); }
  for (const guard of GUARDS) {
    values.push(validateCurrentSchematicRelevanceRunGuardStep({ guard, command: { phase: "prefix-arm", role: guard, method: "Debugger.setBreakpointOnFunctionCall", params: { objectId: "original_ref", condition: "" } } }));
    for (const variant of [0, 1] as const) { values.push(validateCurrentSchematicRelevanceRunGuardStep({ guard, command: { phase: "prefix-frame", role: "receiver", variant, method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: "original_ref", expression: "[this]", returnByValue: false, includeCommandLineAPI: false } } })); }
    values.push(validateCurrentSchematicRelevanceRunGuardStep({ guard, command: { phase: "prefix-properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } } }),
      validateCurrentSchematicRelevanceRunGuardStep({ guard, command: { phase: "prefix-call", role: "callback-receiver", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: "original_ref", functionDeclaration: proof[1], arguments: [{ objectId: "original_ref" }, { objectId: "original_ref" }], returnByValue: true, awaitPromise: false, userGesture: false } } }),
      validateCurrentSchematicRelevanceRunGuardStep({ guard, command: { phase: "prefix-remove", role: guard, method: "Debugger.removeBreakpoint", params: { breakpointId: "original_ref" } } }),
      validateCurrentSchematicRelevanceRunGuardStep({ guard, command: { phase: "prefix-resume", role: guard, method: "Debugger.resume", params: {} } }));
  }
  values.push(validateCurrentSchematicRelevanceRunGuardStep({ guard: "run", command: { phase: "prefix-resume", role: "run", method: "Debugger.resume", params: {} } }));
  return freezeDeep(values);
}
export interface CurrentSchematicRelevanceRunGuardTemplate { readonly phase: string; readonly method: string; readonly names: readonly string[]; readonly values: Readonly<Record<string, string>>; readonly template: string }
export function currentSchematicRelevanceRunGuardTemplate(input: unknown): CurrentSchematicRelevanceRunGuardTemplate {
  const { command, guard } = validateCurrentSchematicRelevanceRunGuardStep(input); const params: Record<string, unknown> = { ...command.params };
  const names: string[] = []; const values: Record<string, string> = {};
  const field = (name: string, value: string): string => { names.push(name); values[name] = value; return `__schematic_run_guard_${name}__`; };
  let phase = `${guard}-${command.phase}`;
  if (command.phase === "prefix-frame") { phase += `-${String(command.variant)}`; params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if (command.phase === "prefix-remove") { params["breakpointId"] = field("breakpointId", command.params.breakpointId); }
  else if (command.phase === "prefix-arm" || command.phase === "prefix-properties" || command.phase === "prefix-call") {
    params["objectId"] = field("objectId", command.params.objectId);
    if (command.phase === "prefix-call") { params["arguments"] = command.params.arguments.map((argument, index) => ({ objectId: field(`argument${String(index)}`, argument.objectId) })); }
  }
  return freezeDeep({ phase, method: command.method, names, values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentSchematicRelevanceRunGuardWire(input: unknown, requestId: number): Readonly<{ step: CurrentSchematicRelevanceRunGuardStep; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(requestId) || requestId < 1 || requestId > 2_147_483_647) { throw new Error("SCHEMATIC_RUN_GUARD_ID"); }
  const step = validateCurrentSchematicRelevanceRunGuardStep(input); const row = currentSchematicRelevanceRunGuardTemplate(step);
  return freezeDeep({ step, request: { action: "schematic-relevance-run-guard", requestId, phase: row.phase, method: row.method, ...row.values } });
}
