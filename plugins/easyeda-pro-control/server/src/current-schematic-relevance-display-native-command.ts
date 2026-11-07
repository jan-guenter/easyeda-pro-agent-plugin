/** Closed original SCH stage vocabulary. This data codec issues no ownership
 * and the actual owner separately requires its original checkpoint/arguments. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { generatedSchematicTargetSchema } from "./managed-schematic-fixture-opening.ts";
import { generatedSchematicRelevanceDisplayOperationIdSchema } from "./generated-schematic-relevance-display-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_NATIVE_GROUP as GROUP, CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_NAVIGATION_FUNCTION as NAVIGATION,
  CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_STAGE_FUNCTION as STAGE, CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_START_FUNCTION as START } from "./current-schematic-relevance-display-write-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_CAPTURE_FUNCTION as CAPTURE, CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_FUNCTION as MODIFY } from "./current-schematic-relevance-display-action-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const json = z.record(z.string(), z.json());
const peer = z.strictObject({ id: handle, type: z.enum(["CANVAS", "WIRE", "LINE", "BUS", "ATTR"]), body: json });
const operation = z.strictObject({ operationId: generatedSchematicRelevanceDisplayOperationIdSchema, textId: handle, beforeBody: json, afterBody: json,
  peers: z.array(peer).length(6), rootIds: z.array(handle).length(3) });
const jsonText = z.string().min(1).max(16_384).refine(value => value.isWellFormed());
const flags = Object.freeze({ throwOnSideEffect: false, silent: true, awaitPromise: true, generatePreview: false, userGesture: false, objectGroup: GROUP } as const);
const literals = { throwOnSideEffect: z.literal(false), silent: z.literal(true), awaitPromise: z.literal(true), generatePreview: z.literal(false), userGesture: z.literal(false), objectGroup: z.literal(GROUP) };
const stage = z.enum(["capture", "preflight", "modify", "observe", "save"]), targetArgument = z.strictObject({ value: jsonText });
const stageArgument = z.strictObject({ value: stage });
const startParams = z.strictObject({ ...literals, functionDeclaration: z.literal(START), uniqueContextId: handle, arguments: z.tuple([]), returnByValue: z.literal(true) });
const navigationParams = z.strictObject({ ...literals, functionDeclaration: z.literal(NAVIGATION), uniqueContextId: handle, arguments: z.tuple([targetArgument]), returnByValue: z.literal(true) });
const stageArguments = z.tuple([targetArgument, stageArgument, targetArgument]);
const captureParams = z.strictObject({ ...literals, functionDeclaration: z.literal(CAPTURE), uniqueContextId: handle, arguments: stageArguments, returnByValue: z.literal(false) });
const modifyParams = z.strictObject({ ...literals, functionDeclaration: z.literal(MODIFY), objectId: handle, arguments: stageArguments, returnByValue: z.literal(true) });
const stageParams = z.strictObject({ ...literals, functionDeclaration: z.literal(STAGE), objectId: handle, arguments: stageArguments, returnByValue: z.literal(true) });

const schema = z.discriminatedUnion("schematicRelevanceDisplayPhase", [
  z.strictObject({ schematicRelevanceDisplayPhase: z.literal("start"), method: z.literal("Runtime.callFunctionOn"), params: startParams }),
  z.strictObject({ schematicRelevanceDisplayPhase: z.literal("navigate"), method: z.literal("Runtime.callFunctionOn"), params: navigationParams }),
  z.strictObject({ schematicRelevanceDisplayPhase: z.literal("capture"), method: z.literal("Runtime.callFunctionOn"), params: captureParams }),
  z.strictObject({ schematicRelevanceDisplayPhase: z.literal("modify"), method: z.literal("Runtime.callFunctionOn"), params: modifyParams }),
  z.strictObject({ schematicRelevanceDisplayPhase: z.enum(["preflight", "observe", "save"]), method: z.literal("Runtime.callFunctionOn"), params: stageParams }),
]);
export type CurrentSchematicRelevanceDisplayNativeCommand = z.infer<typeof schema>;
export type CurrentSchematicRelevanceDisplayNativePhase = CurrentSchematicRelevanceDisplayNativeCommand["schematicRelevanceDisplayPhase"];
export function currentSchematicRelevanceDisplayNativeCommand(phase: CurrentSchematicRelevanceDisplayNativePhase, binding: string, target?: unknown, value?: unknown): CurrentSchematicRelevanceDisplayNativeCommand {
  if (phase === "start") { return freezeDeep(schema.parse({ schematicRelevanceDisplayPhase: phase, method: "Runtime.callFunctionOn", params: { ...flags, functionDeclaration: START, uniqueContextId: binding, arguments: [], returnByValue: true } })); }
  const selected = canonicalJson(generatedSchematicTargetSchema.parse(target));
  if (phase === "navigate") { return freezeDeep(schema.parse({ schematicRelevanceDisplayPhase: phase, method: "Runtime.callFunctionOn", params: { ...flags, functionDeclaration: NAVIGATION, uniqueContextId: binding, arguments: [{ value: selected }], returnByValue: true } })); }
  const operationJson = canonicalJson(operation.parse(value)); let program = STAGE; if (phase === "capture") { program = CAPTURE; } else if (phase === "modify") { program = MODIFY; }
  return freezeDeep(schema.parse({ schematicRelevanceDisplayPhase: phase, method: "Runtime.callFunctionOn", params: { ...flags, functionDeclaration: program,
    ...(phase === "capture" ? { uniqueContextId: binding } : { objectId: binding }), arguments: [{ value: selected }, { value: phase }, { value: operationJson }], returnByValue: phase !== "capture" } }));
}
export function validateCurrentSchematicRelevanceDisplayNativeCommand(input: unknown): CurrentSchematicRelevanceDisplayNativeCommand {
  const command = schema.parse(input), phase = command.schematicRelevanceDisplayPhase;
  if (phase !== "start") {
    const selected: unknown = JSON.parse(command.params.arguments[0].value); if (canonicalJson(generatedSchematicTargetSchema.parse(selected)) !== command.params.arguments[0].value) { throw new Error("SCHEMATIC_RELEVANCE_DISPLAY_NATIVE_TARGET"); }
    if (phase !== "navigate") { const value: unknown = JSON.parse(command.params.arguments[2].value);
      if (command.params.arguments[1].value !== phase || canonicalJson(operation.parse(value)) !== command.params.arguments[2].value) { throw new Error("SCHEMATIC_RELEVANCE_DISPLAY_NATIVE_OPERATION"); } }
  }
  return freezeDeep(command);
}
export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_CALL_FLAGS = flags;
