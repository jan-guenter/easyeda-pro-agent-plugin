/** Original v4 refusal-only run point. No invocation, resume, setter or Save
 * command exists. Source sites share only immutable comparison data. */
import { z } from "zod";
import { CURRENT_SCHEMATIC_DISPLAY_ACTION_GUARD_SITES as SITES } from "./current-schematic-display-action-guard-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_WRITER_V4_NATIVE_PROFILE as PROFILE } from "./current-schematic-wire-writer-v4-native-profile.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_WIRE_WRITER_V4_RUN_GUARD_REQUESTS = Object.freeze({ normal: 1, cleanup: 0, total: 1, bindingControls: 1, resumeRequests: 0 });
if (CURRENT_SCHEMATIC_WIRE_WRITER_V4_RUN_GUARD_REQUESTS.total > PROFILE.renderer.actionGuardObservation) { throw new Error("WIRE_V4_RUN_GUARD_RESERVATION"); }
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const schema = z.strictObject({ role: z.literal("run"), variant: z.union([z.literal(0), z.literal(1)]),
  method: z.literal("Debugger.setBreakpoint"), params: z.strictObject({ location }) });
export type CurrentSchematicWireWriterV4RunGuardCommand = z.infer<typeof schema>;
export interface CurrentSchematicWireWriterV4RunGuardObservation {
  readonly profile: "private.current-schematic-wire-writer-v4-run-guard.v1";
  readonly originalRunnerEntryPointArmed: true; readonly actualInvocationObserved: false;
  readonly continuationAuthorized: false; readonly executionAuthorized: false; readonly saveAuthorized: false;
}
export function validateCurrentSchematicWireWriterV4RunGuardCommand(input: unknown): CurrentSchematicWireWriterV4RunGuardCommand {
  const value = schema.parse(captureCurrentPcbStringClockReply(input).value); const expected = SITES[value.variant].run;
  if (value.params.location.lineNumber !== expected.lineNumber || value.params.location.columnNumber !== expected.columnNumber) { throw new Error("WIRE_V4_RUN_GUARD_SITE"); }
  return freezeDeep(value);
}
export function currentSchematicWireWriterV4RunGuardCommand(variant: 0 | 1, scriptId: string): CurrentSchematicWireWriterV4RunGuardCommand {
  return validateCurrentSchematicWireWriterV4RunGuardCommand({ role: "run", variant, method: "Debugger.setBreakpoint", params: { location: { scriptId, ...SITES[variant].run } } });
}
export function currentSchematicWireWriterV4RunGuardWire(input: unknown, id: number): Readonly<{ command: CurrentSchematicWireWriterV4RunGuardCommand; request: Readonly<{ action: "schematic-wire-writer-v4-run-guard"; requestId: number }> }> {
  if (!Number.isSafeInteger(id) || id < 1 || id > PROFILE.renderer.total) { throw new Error("WIRE_V4_RUN_GUARD_ID"); }
  const command = validateCurrentSchematicWireWriterV4RunGuardCommand(input);
  return freezeDeep({ command, request: { action: "schematic-wire-writer-v4-run-guard", requestId: id } });
}
const reply = z.strictObject({ breakpointId: handle, actualLocation: location });
/** Match only the actual fixed-location ACK; no serialized reply issues custody. */
export function decodeCurrentSchematicWireWriterV4RunGuardReply(input: unknown, command: CurrentSchematicWireWriterV4RunGuardCommand): string {
  const value = reply.parse(captureCurrentPcbStringClockReply(input).value); const expected = command.params.location;
  if (value.actualLocation.scriptId !== expected.scriptId || value.actualLocation.lineNumber !== expected.lineNumber || value.actualLocation.columnNumber !== expected.columnNumber) { throw new Error("WIRE_V4_RUN_GUARD_REPLY"); }
  return value.breakpointId;
}
