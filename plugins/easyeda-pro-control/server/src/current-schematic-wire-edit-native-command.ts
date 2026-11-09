/** Closed original SCH stage vocabulary. This data codec issues no ownership
 * and the actual owner separately requires its original checkpoint/arguments. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { generatedSchematicTargetSchema } from "./managed-schematic-fixture-opening.ts";
import { CURRENT_SCHEMATIC_WIRE_EDIT_NATIVE_GROUP as GROUP, CURRENT_SCHEMATIC_WIRE_EDIT_NAVIGATION_FUNCTION as NAVIGATION,
  CURRENT_SCHEMATIC_WIRE_EDIT_STAGE_FUNCTION as STAGE, CURRENT_SCHEMATIC_WIRE_EDIT_START_FUNCTION as START } from "./current-schematic-wire-edit-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const operationId = z.string().min(20).max(80).regex(/^sch209-wire-edit-[a-z\d][a-z\d-]*$(?![\s\S])/u);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const json = z.record(z.string(), z.json());
const peer = z.strictObject({ id: handle, type: z.enum(["CANVAS", "WIRE", "LINE", "BUS", "ATTR", "TEXT"]), body: json });
const operation = z.strictObject({ operationId, wireId: handle, lineId: handle, beforeBody: json, afterBody: json,
  peers: z.array(peer).length(6), rootIds: z.array(handle).length(3) });
const jsonText = z.string().min(1).max(16_384).refine(value => value.isWellFormed());
const flags = Object.freeze({ throwOnSideEffect: false, silent: true, awaitPromise: true, generatePreview: false, userGesture: false, objectGroup: GROUP } as const);
const literals = { throwOnSideEffect: z.literal(false), silent: z.literal(true), awaitPromise: z.literal(true), generatePreview: z.literal(false), userGesture: z.literal(false), objectGroup: z.literal(GROUP) };
const stage = z.enum(["capture", "preflight", "modify", "observe"]), targetArgument = z.strictObject({ value: jsonText });
const stageArgument = z.strictObject({ value: stage });
const startParams = z.strictObject({ ...literals, functionDeclaration: z.literal(START), uniqueContextId: handle, arguments: z.tuple([]), returnByValue: z.literal(true) });
const navigationParams = z.strictObject({ ...literals, functionDeclaration: z.literal(NAVIGATION), uniqueContextId: handle, arguments: z.tuple([targetArgument]), returnByValue: z.literal(true) });
const stageArguments = z.tuple([targetArgument, stageArgument, targetArgument]);
const captureParams = z.strictObject({ ...literals, functionDeclaration: z.literal(STAGE), uniqueContextId: handle, arguments: stageArguments, returnByValue: z.literal(false) });
const stageParams = z.strictObject({ ...literals, functionDeclaration: z.literal(STAGE), objectId: handle, arguments: stageArguments, returnByValue: z.literal(true) });

const schema = z.discriminatedUnion("schematicWireEditPhase", [
  z.strictObject({ schematicWireEditPhase: z.literal("start"), method: z.literal("Runtime.callFunctionOn"), params: startParams }),
  z.strictObject({ schematicWireEditPhase: z.literal("navigate"), method: z.literal("Runtime.callFunctionOn"), params: navigationParams }),
  z.strictObject({ schematicWireEditPhase: z.literal("capture"), method: z.literal("Runtime.callFunctionOn"), params: captureParams }),
  z.strictObject({ schematicWireEditPhase: z.enum(["preflight", "modify", "observe"]), method: z.literal("Runtime.callFunctionOn"), params: stageParams }),
]);
export type CurrentSchematicWireEditNativeCommand = z.infer<typeof schema>;
export type CurrentSchematicWireEditNativePhase = CurrentSchematicWireEditNativeCommand["schematicWireEditPhase"];
export function currentSchematicWireEditNativeCommand(phase: CurrentSchematicWireEditNativePhase, binding: string, target?: unknown, value?: unknown): CurrentSchematicWireEditNativeCommand {
  if (phase === "start") { return freezeDeep(schema.parse({ schematicWireEditPhase: phase, method: "Runtime.callFunctionOn", params: { ...flags, functionDeclaration: START, uniqueContextId: binding, arguments: [], returnByValue: true } })); }
  const selected = canonicalJson(generatedSchematicTargetSchema.parse(target));
  if (phase === "navigate") { return freezeDeep(schema.parse({ schematicWireEditPhase: phase, method: "Runtime.callFunctionOn", params: { ...flags, functionDeclaration: NAVIGATION, uniqueContextId: binding, arguments: [{ value: selected }], returnByValue: true } })); }
  const operationJson = canonicalJson(operation.parse(value));
  return freezeDeep(schema.parse({ schematicWireEditPhase: phase, method: "Runtime.callFunctionOn", params: { ...flags, functionDeclaration: STAGE,
    ...(phase === "capture" ? { uniqueContextId: binding } : { objectId: binding }), arguments: [{ value: selected }, { value: phase }, { value: operationJson }], returnByValue: phase !== "capture" } }));
}
export function validateCurrentSchematicWireEditNativeCommand(input: unknown): CurrentSchematicWireEditNativeCommand {
  const command = schema.parse(input), phase = command.schematicWireEditPhase;
  if (phase !== "start") {
    const selected: unknown = JSON.parse(command.params.arguments[0].value); if (canonicalJson(generatedSchematicTargetSchema.parse(selected)) !== command.params.arguments[0].value) { throw new Error("SCHEMATIC_WIRE_EDIT_NATIVE_TARGET"); }
    if (phase !== "navigate") { const value: unknown = JSON.parse(command.params.arguments[2].value);
      if (command.params.arguments[1].value !== phase || canonicalJson(operation.parse(value)) !== command.params.arguments[2].value) { throw new Error("SCHEMATIC_WIRE_EDIT_NATIVE_OPERATION"); } }
  }
  return freezeDeep(command);
}
export const CURRENT_SCHEMATIC_WIRE_EDIT_CALL_FLAGS = flags;
