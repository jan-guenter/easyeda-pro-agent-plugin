/** Own callback reader adds packing and retirement around immutable original
 * Wire comparison rows. No invocation, resume or mutation is admitted. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { diagnosticRecord } from "./current-pcb-diagnostic-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_SCHEMATIC_WIRE_WRITER_FLAGS as FLAGS, currentSchematicWireWriterCases, currentSchematicWireWriterTemplate, validateCurrentSchematicWireWriterCommand } from "./current-schematic-wire-writer-protocol.ts";
import type { CurrentSchematicWireWriterCommand } from "./current-schematic-wire-writer-protocol.ts";

export const CURRENT_SCHEMATIC_WIRE_CALLBACK_VALUES = 'function(pointCtor,normalClass,floats,ints,normal,finite,defaults,noop){"use strict";return[pointCtor,normalClass,floats,ints,normal,finite,defaults,noop];}';
// One pack2 + entry5 + two before6 + two after8 + setter5.
// Each of the seven callFunctionOn invocations compiles its own helper source.
export const CURRENT_SCHEMATIC_WIRE_CALLBACK_REQUESTS = Object.freeze({ values: 2, entry: 5, before: 6, after: 8, setter: 5, normal: 40, helperSourcesMaximum: 7, cleanup: 1, totalMaximum: 48 } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), object = z.strictObject({ objectId: handle });
const flags = { objectGroup: z.literal(FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const valuesParams = z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(CURRENT_SCHEMATIC_WIRE_CALLBACK_VALUES), arguments: z.array(object).length(8), returnByValue: z.literal(false), awaitPromise: z.literal(false), userGesture: z.literal(false) });
const schema = z.union([
  z.strictObject({ phase: z.literal("wire-callback-values"), method: z.literal("Runtime.callFunctionOn"), params: valuesParams }),
  z.strictObject({ phase: z.literal("wire-callback-release"), method: z.literal("Runtime.releaseObjectGroup"), params: z.strictObject({ objectGroup: flags.objectGroup }) }),
]);
type OwnCommand = z.infer<typeof schema>;
export type CurrentSchematicWireCallbackCommand = CurrentSchematicWireWriterCommand | OwnCommand;
/** Historical rows retain their exact grammar; only two own rows are added. */
export function validateCurrentSchematicWireCallbackCommand(input: unknown): CurrentSchematicWireCallbackCommand {
  const raw = capture(input).value;
  if (diagnosticRecord(raw) && (raw["phase"] === "wire-callback-values" || raw["phase"] === "wire-callback-release")) { return freezeDeep(schema.parse(raw)); }
  return validateCurrentSchematicWireWriterCommand(raw);
}
/** Enumerate fixed original reader rows plus packing and retirement. */
export function currentSchematicWireCallbackCases(): readonly CurrentSchematicWireCallbackCommand[] {
  return freezeDeep([...currentSchematicWireWriterCases(),
    validateCurrentSchematicWireCallbackCommand({ phase: "wire-callback-values", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: "original_holder", functionDeclaration: CURRENT_SCHEMATIC_WIRE_CALLBACK_VALUES, arguments: Array.from({ length: 8 }, () => ({ objectId: "original_ref" })), returnByValue: false, awaitPromise: false, userGesture: false } }),
    validateCurrentSchematicWireCallbackCommand({ phase: "wire-callback-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: FLAGS.objectGroup } }),
  ]);
}
/** Replace only original selectors while preserving all reviewed program bytes. */
export function currentSchematicWireCallbackTemplate(input: unknown): Readonly<{ phase: string; method: string; fields: Readonly<Record<string, "handle">>; values: Readonly<Record<string, string>>; template: string }> {
  const command = validateCurrentSchematicWireCallbackCommand(input);
  if (command.phase !== "wire-callback-values" && command.phase !== "wire-callback-release") { return currentSchematicWireWriterTemplate(command); }
  const own = schema.parse(command);
  const fields: Record<string, "handle"> = {}, values: Record<string, string> = {};
  const field = (name: string, value: string): string => { fields[name] = "handle"; values[name] = value; return `__schematic_wirecallback_${name}__`; };
  const params: Record<string, unknown> = { ...own.params };
  if (own.phase === "wire-callback-values") { params["objectId"] = field("objectId", own.params.objectId); params["arguments"] = own.params.arguments.map((arg, index) => ({ objectId: field(`arg${String(index)}`, arg.objectId) })); }
  return freezeDeep({ phase: command.phase, method: command.method, fields, values, template: JSON.stringify({ method: command.method, params }) });
}
