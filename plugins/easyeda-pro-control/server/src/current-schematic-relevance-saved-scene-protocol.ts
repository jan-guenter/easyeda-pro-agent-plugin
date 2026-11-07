/** Fixed readonly scene grammar for a separately born saved schematic reader.
 * This codec supplies no original context, historical plan or runtime owner. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { captureCurrentFootprintInverseDeleteBindingReply as captureFixedFrame } from "./current-footprint-inverse-delete-binding-capture.ts";
import { generatedSchematicTargetSchema } from "./managed-schematic-fixture-opening.ts";
import { generatedSchematicRelevanceDisplayOperationIdSchema } from "./generated-schematic-relevance-display-source.ts";
import { GENERATED_SCHEMATIC_RELEVANCE_SAVED_READER_FUNCTION } from "./generated-schematic-relevance-saved-reader-function.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_SAVED_SCENE_GROUP = "easyeda-pro-control-schematic-relevance-saved-scene-v1";
export const CURRENT_SCHEMATIC_RELEVANCE_SAVED_SCENE_REQUESTS = Object.freeze({ capture: 1, observe: 1, release: 1, total: 3 });
export const CURRENT_SCHEMATIC_RELEVANCE_SAVED_SCENE_FUNCTION = `async function(targetJson,stage,operationJson){"use strict";return Reflect.apply(${GENERATED_SCHEMATIC_RELEVANCE_SAVED_READER_FUNCTION},this,[JSON.parse(targetJson),stage,JSON.parse(operationJson)]);}`;
const token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const json = z.record(z.string(), z.json());
const peer = z.strictObject({ id: token, type: z.enum(["CANVAS", "WIRE", "LINE", "BUS", "ATTR"]), body: json });
const operation = z.strictObject({ operationId: generatedSchematicRelevanceDisplayOperationIdSchema, textId: token, body: json,
  peers: z.array(peer).length(6), rootIds: z.array(token).length(3) });
const argumentsSchema = z.strictObject({ target: generatedSchematicTargetSchema, operation });
const text = z.string().min(1).max(16_384).refine(value => value.isWellFormed() && Buffer.byteLength(value) <= 16_384);
const value = z.strictObject({ value: text });
const fixed = Object.freeze({ throwOnSideEffect: false, silent: true, awaitPromise: true, generatePreview: false, userGesture: false,
  objectGroup: CURRENT_SCHEMATIC_RELEVANCE_SAVED_SCENE_GROUP } as const);
const literals = { throwOnSideEffect: z.literal(false), silent: z.literal(true), awaitPromise: z.literal(true), generatePreview: z.literal(false),
  userGesture: z.literal(false), objectGroup: z.literal(CURRENT_SCHEMATIC_RELEVANCE_SAVED_SCENE_GROUP), functionDeclaration: z.literal(CURRENT_SCHEMATIC_RELEVANCE_SAVED_SCENE_FUNCTION) };
const captureArguments = z.tuple([value, z.strictObject({ value: z.literal("capture") }), value]);
const observeArguments = z.tuple([value, z.strictObject({ value: z.literal("observe") }), value]);
const captureParams = z.strictObject({ ...literals, uniqueContextId: token, arguments: captureArguments, returnByValue: z.literal(false) });
const observeParams = z.strictObject({ ...literals, objectId: token, arguments: observeArguments, returnByValue: z.literal(true) });
const releaseParams = z.strictObject({ objectGroup: z.literal(CURRENT_SCHEMATIC_RELEVANCE_SAVED_SCENE_GROUP) });
const schema = z.discriminatedUnion("savedScenePhase", [
  z.strictObject({ savedScenePhase: z.literal("capture"), method: z.literal("Runtime.callFunctionOn"), params: captureParams }),
  z.strictObject({ savedScenePhase: z.literal("observe"), method: z.literal("Runtime.callFunctionOn"), params: observeParams }),
  z.strictObject({ savedScenePhase: z.literal("release"), method: z.literal("Runtime.releaseObjectGroup"), params: releaseParams }),
]);
export type CurrentSchematicRelevanceSavedSceneCommand = z.infer<typeof schema>;
export type CurrentSchematicRelevanceSavedScenePhase = CurrentSchematicRelevanceSavedSceneCommand["savedScenePhase"];

/** Inert arguments must be checked again against the actual original plan by
 * the owning controller. Matching JSON never supplies that custody. */
export function currentSchematicRelevanceSavedSceneCommand(phase: CurrentSchematicRelevanceSavedScenePhase, binding: string, input?: unknown): CurrentSchematicRelevanceSavedSceneCommand {
  if (phase === "release") { if (binding !== "" || input !== undefined) { throw new Error("SCHEMATIC_RELEVANCE_SAVED_SCENE_RELEASE"); }
    return freezeDeep(schema.parse({ savedScenePhase: phase, method: "Runtime.releaseObjectGroup", params: { objectGroup: CURRENT_SCHEMATIC_RELEVANCE_SAVED_SCENE_GROUP } })); }
  const args = argumentsSchema.parse(captureCurrentPcbStringClockReply(input).value);
  const model = canonicalJson(args.operation), selected = canonicalJson(args.target);
  return freezeDeep(schema.parse({ savedScenePhase: phase, method: "Runtime.callFunctionOn", params: { ...fixed, functionDeclaration: CURRENT_SCHEMATIC_RELEVANCE_SAVED_SCENE_FUNCTION,
    ...(phase === "capture" ? { uniqueContextId: binding } : { objectId: binding }), arguments: [{ value: selected }, { value: phase }, { value: model }], returnByValue: phase === "observe" } }));
}
export function validateCurrentSchematicRelevanceSavedSceneCommand(input: unknown): CurrentSchematicRelevanceSavedSceneCommand {
  // This immutable data copier admits a65,280-byte packet. The fixed scene
  // Function exceeds the old clock string cap; no inverse authority is reused.
  const command = schema.parse(captureFixedFrame(input));
  if (command.savedScenePhase !== "release") {
    const args = argumentsSchema.parse({ target: JSON.parse(command.params.arguments[0].value) as unknown, operation: JSON.parse(command.params.arguments[2].value) as unknown });
    if (canonicalJson(args.target) !== command.params.arguments[0].value || canonicalJson(args.operation) !== command.params.arguments[2].value) { throw new Error("SCHEMATIC_RELEVANCE_SAVED_SCENE_ARGUMENTS"); }
  }
  return freezeDeep(command);
}
export function currentSchematicRelevanceSavedSceneWire(input: unknown, id: number, sessionId: string): Readonly<{
  command: CurrentSchematicRelevanceSavedSceneCommand & Readonly<{ id: number; sessionId: string; schematicRelevanceSavedScene: true }>;
  request: Readonly<Record<string, unknown>>;
}> {
  if (!Number.isSafeInteger(id) || id < 1) { throw new Error("SCHEMATIC_RELEVANCE_SAVED_SCENE_ID"); } token.parse(sessionId);
  const command = validateCurrentSchematicRelevanceSavedSceneCommand(input), phase = command.savedScenePhase;
  let request: Readonly<Record<string, unknown>> = { action: "schematic-relevance-saved-scene", requestId: id, scenePhase: phase };
  if (phase !== "release") { request = { ...request, ...(phase === "capture" ? { uniqueContextId: command.params.uniqueContextId } : { objectId: command.params.objectId }),
    targetJson: command.params.arguments[0].value, operationJson: command.params.arguments[2].value }; }
  return freezeDeep({ command: { id, ...command, schematicRelevanceSavedScene: true, sessionId }, request });
}
export function currentSchematicRelevanceSavedSceneNativeFrame(chunk: Buffer, session: string): Readonly<Record<string, unknown>> {
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { throw new Error("SCHEMATIC_RELEVANCE_SAVED_SCENE_FRAME"); }
  const decoded = new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1));
  const parsed: unknown = JSON.parse(decoded);
  const raw = captureFixedFrame(parsed);
  const envelope = z.looseObject({ id: z.number().int().positive(), sessionId: token, schematicRelevanceSavedScene: z.literal(true) }).parse(raw);
  const { id, sessionId, schematicRelevanceSavedScene: _marker, ...command } = envelope;
  if (sessionId !== session) { throw new Error("SCHEMATIC_RELEVANCE_SAVED_SCENE_SESSION"); }
  const fixedWire = currentSchematicRelevanceSavedSceneWire(command, id, session);
  if (!chunk.equals(Buffer.from(`${JSON.stringify(fixedWire.command)}\0`))) { throw new Error("SCHEMATIC_RELEVANCE_SAVED_SCENE_FRAME"); }
  return fixedWire.request;
}
