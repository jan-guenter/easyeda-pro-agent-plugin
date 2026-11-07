/* oxlint-disable import/max-dependencies -- Finite codec composes original capture leaves, strict generated registration and unchanged discovery encoding. */
import { CURRENT_PCB_209_COMPONENT_POINT_BINDINGS_FUNCTION } from "./current-pcb-209-component-point-capture.ts";
import { CURRENT_PCB_209_COMPONENT_POINT_READ_FUNCTION } from "./current-pcb-209-component-point-read-program.ts";
import { GENERATED_COMPONENT_FIXTURE_REGISTRATION_FUNCTION } from "./managed-component-fixture-registration-program.ts";
import { diagnosticGeneratedFixtureRegistrationParams,diagnosticNativeRequest,diagnosticRecord } from "./current-pcb-diagnostic-protocol.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
/** Closed private spatial grammar. Qualification and mounting remain the owner's
 * responsibility; native requests contain selectors and values, never code. */
import { z } from "zod";
import { CURRENT_PCB_209_SPATIAL_BINDINGS_FUNCTION, CURRENT_PCB_209_SPATIAL_CALLBACK_EXPRESSION,
  CURRENT_PCB_209_SPATIAL_FUNCTIONS_FUNCTION, CURRENT_PCB_209_SPATIAL_HANDLER_FUNCTION } from "./current-pcb-209-spatial-capture-program.ts";
import { CURRENT_PCB_209_SPATIAL_READ_FUNCTION } from "./current-pcb-209-spatial-read-program.ts";
import { currentPcb209SpatialQuerySchema } from "./current-pcb-209-spatial-read.ts";
import { CURRENT_PCB_SPATIAL_OBJECT_GROUP } from "./current-pcb-spatial-capture-runner.ts";
import type { CurrentPcbSpatialCaptureCommand } from "./current-pcb-spatial-capture-runner.ts";
import { CURRENT_PCB_SPATIAL_DISCOVERY_METHODS } from "./current-pcb-spatial-profile.ts";
import { CURRENT_PCB_COMPONENT_SPATIAL_PROFILE } from "./current-pcb-component-spatial-profile.ts";
import { captureCurrentPcbSpatialCommand } from "./current-pcb-spatial-command-input.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { currentPcb209SpatialPadPointSchema } from "./current-pcb-209-spatial-pad-read.ts";

import {CURRENT_PCB_209_COMPONENT_CLONED_POINT_BINDINGS_FUNCTION,CURRENT_PCB_209_COMPONENT_CLONED_POINT_READ_FUNCTION} from "./current-pcb-209-component-cloned-point-read.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}(?![\s\S])/u), session = handle.max(128);
const effects = { throwOnSideEffect: z.literal(true), silent: z.literal(true), awaitPromise: z.literal(false),
  generatePreview: z.literal(false), userGesture: z.literal(false) };
const group = z.literal(CURRENT_PCB_SPATIAL_OBJECT_GROUP);
const functions = Object.freeze({ handler: CURRENT_PCB_209_SPATIAL_HANDLER_FUNCTION,
  bindings: CURRENT_PCB_209_SPATIAL_BINDINGS_FUNCTION, functions: CURRENT_PCB_209_SPATIAL_FUNCTIONS_FUNCTION });
const wrapperParams = z.strictObject({ ...effects, expression: z.literal(CURRENT_PCB_209_SPATIAL_CALLBACK_EXPRESSION),
  uniqueContextId: session, objectGroup: group, returnByValue: z.literal(false), timeout: z.literal(1000),
  includeCommandLineAPI: z.literal(false), allowUnsafeEvalBlockedByCSP: z.literal(false) });
const propertyParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const handlerParams = z.strictObject({ ...effects, objectId: handle, functionDeclaration: z.literal(functions.handler), objectGroup: group, returnByValue: z.literal(false) });
const functionParams = z.strictObject({ ...effects, objectId: handle, functionDeclaration: z.literal(functions.functions), objectGroup: group, returnByValue: z.literal(false) });
const bindingArgument = z.strictObject({ objectId: handle }), queryArgument = z.strictObject({ value: currentPcb209SpatialQuerySchema });
const bindingParams = z.strictObject({ ...effects, throwOnSideEffect: z.literal(false), objectId: handle, functionDeclaration: z.literal(functions.bindings), objectGroup: group,
  returnByValue: z.literal(false), arguments: z.tuple([bindingArgument]) });
const readParams = z.strictObject({ ...effects, throwOnSideEffect: z.literal(false), objectId: handle,
  functionDeclaration: z.literal(CURRENT_PCB_209_SPATIAL_READ_FUNCTION), objectGroup: group, returnByValue: z.literal(true), arguments: z.tuple([queryArgument]) });
const releaseParams = z.strictObject({ objectGroup: group });
const sceneHex16 = z.string().regex(/^[a-f0-9]{16}$/u), sceneHex32 = z.string().regex(/^[a-f0-9]{32}$/u);
const scene = z.strictObject({ schema: z.literal("private.pcb209-generated-component-scene.v1"), projectUuid: z.string().regex(/^[a-f0-9]{64}$/u), documentUuid: sceneHex32, footprintUuid: sceneHex32,
  componentId: sceneHex16, padId: sceneHex16, ownedPadId: sceneHex32, footprintAttrId: sceneHex16, designatorAttrId: sceneHex16, placedFootprintAttrId: sceneHex16, placedDesignatorAttrId: sceneHex16 }).refine(value => value.ownedPadId === value.componentId + value.padId);
const sceneArgument = z.strictObject({ value: scene });
const componentBindingArguments = z.tuple([bindingArgument, sceneArgument]);
const componentBindingParams = bindingParams.extend({ functionDeclaration: z.literal(CURRENT_PCB_209_COMPONENT_POINT_BINDINGS_FUNCTION), arguments: componentBindingArguments });
const componentQueryArgument = z.strictObject({ value: currentPcb209SpatialPadPointSchema });
const componentReadParams = readParams.extend({ functionDeclaration: z.literal(CURRENT_PCB_209_COMPONENT_POINT_READ_FUNCTION), arguments: z.tuple([componentQueryArgument]) });
const clonedBindingParams=componentBindingParams.extend({functionDeclaration:z.literal(CURRENT_PCB_209_COMPONENT_CLONED_POINT_BINDINGS_FUNCTION)});
const clonedReadParams=componentReadParams.extend({functionDeclaration:z.literal(CURRENT_PCB_209_COMPONENT_CLONED_POINT_READ_FUNCTION)});
const schema = z.discriminatedUnion("spatialPhase", [
  z.strictObject({ spatialPhase: z.literal("wrapper"), method: z.literal("Runtime.evaluate"), params: wrapperParams }),
  z.strictObject({ spatialPhase: z.literal("properties"), method: z.literal("Runtime.getProperties"), params: propertyParams }),
  z.strictObject({ spatialPhase: z.literal("handler"), method: z.literal("Runtime.callFunctionOn"), params: handlerParams }),
  z.strictObject({ spatialPhase: z.literal("functions"), method: z.literal("Runtime.callFunctionOn"), params: functionParams }),
  z.strictObject({ spatialPhase: z.literal("bindings-component"), method: z.literal("Runtime.callFunctionOn"), params: componentBindingParams }),
  z.strictObject({ spatialPhase: z.literal("read-component"), method: z.literal("Runtime.callFunctionOn"), params: componentReadParams }),
  z.strictObject({ spatialPhase: z.literal("bindings-component-cloned"), method: z.literal("Runtime.callFunctionOn"), params: clonedBindingParams }),
  z.strictObject({ spatialPhase: z.literal("read-component-cloned"), method: z.literal("Runtime.callFunctionOn"), params: clonedReadParams }),
  z.strictObject({ spatialPhase: z.literal("release"), method: z.literal("Runtime.releaseObjectGroup"), params: releaseParams }),
]);
export type CurrentPcbSpatialWireCommand = CurrentPcbSpatialCaptureCommand & Readonly<{ id: number; sessionId: string }>;
/** Admit only the fixed programs, selectors and effect flags after inert input
 * Capture. Validation supplies no native session or execution authority. */
export function validateCurrentPcbComponentSpatialCommand(input: unknown): z.infer<typeof schema> {
  return freezeDeep(schema.parse(captureCurrentPcbSpatialCommand(input)));
}
/** Encode the closed native field vocabulary for one original session request.
 * Normal work cannot consume the final request reserved for group release. */
export function currentPcbComponentSpatialWire(input: unknown, id: number, sessionId: string): Readonly<{
  command: CurrentPcbSpatialWireCommand; request: Readonly<Record<string, unknown>>;
}> {
  if (!Number.isSafeInteger(id) || id < 1 || id > CURRENT_PCB_COMPONENT_SPATIAL_PROFILE.requestLimit) { throw new Error("PCB_SPATIAL_REQUEST_ID"); }
  const command = validateCurrentPcbComponentSpatialCommand(input), selectedSession = session.parse(sessionId);
  if (command.spatialPhase !== "release" && id > CURRENT_PCB_COMPONENT_SPATIAL_PROFILE.normalRequestLimit) { throw new Error("PCB_SPATIAL_CLEANUP_RESERVE"); }
  return freezeDeep({ command: { id, ...command, sessionId: selectedSession }, request: {
    action: "component-spatial419", requestId: id, method: command.method, sessionId: selectedSession, spatialPhase: command.spatialPhase,
    ...("uniqueContextId" in command.params ? { uniqueContextId: command.params.uniqueContextId } : {}),
    ...("objectId" in command.params ? { objectId: command.params.objectId } : {}),
    ...((command.spatialPhase === "bindings-component" || command.spatialPhase === "bindings-component-cloned") ? { callbackObjectId: command.params.arguments[0].objectId, ...command.params.arguments[1].value } : {}),
    ...((command.spatialPhase === "read-component" || command.spatialPhase === "read-component-cloned") ? { queryKind: command.params.arguments[0].value.kind, xMil: command.params.arguments[0].value.xMil, yMil: command.params.arguments[0].value.yMil } : {}),
  } });
}
/** Reuse the unchanged legacy reconstruction only with a local ID of one.
 * The separate native birth restores the actual bounded ID. This never changes
 * the legacy encoder's cap or permits its model/worker/drawing vocabulary. */
export function componentSpatialDiagnosticNativeRequest(chunk: Buffer): Readonly<Record<string, unknown>> {
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { throw new Error("PCB_SPATIAL_WIRE"); }
  const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1)));
  if (!diagnosticRecord(raw) || typeof raw["id"] !== "number" || !Number.isSafeInteger(raw["id"]) ||
    raw["id"] < 1 || raw["id"] > CURRENT_PCB_COMPONENT_SPATIAL_PROFILE.requestLimit || !chunk.equals(Buffer.from(`${JSON.stringify(raw)}\0`))) {
    throw new Error("PCB_SPATIAL_WIRE");
  }
  if (Object.hasOwn(raw, "spatialPhase")) {
    const { id, sessionId, ...command } = raw;
    if (typeof sessionId !== "string") { throw new TypeError("PCB_SPATIAL_WIRE"); }
    const fixed = currentPcbComponentSpatialWire(command, id, sessionId);
    if (!chunk.equals(Buffer.from(`${JSON.stringify(fixed.command)}\0`))) { throw new Error("PCB_SPATIAL_WIRE"); }
    return fixed.request;
  }
  if (raw["method"] === "Runtime.callFunctionOn" && diagnosticRecord(raw["params"]) && raw["params"]["functionDeclaration"] === GENERATED_COMPONENT_FIXTURE_REGISTRATION_FUNCTION) {
    if (Reflect.ownKeys(raw).length !== 4 || !["id", "method", "params", "sessionId"].every(key => Object.hasOwn(raw, key))) { throw new Error("COMPONENT_REGISTRATION_ENVELOPE"); }
    const params = raw["params"]; const argumentsValue = params["arguments"];
    if (!Array.isArray(argumentsValue) || argumentsValue.length !== 2 || !diagnosticRecord(argumentsValue[0]) || !diagnosticRecord(argumentsValue[1]) || argumentsValue[1]["value"] !== "register-generated-fixture" || typeof params["uniqueContextId"] !== "string" || typeof raw["sessionId"] !== "string") { throw new Error("COMPONENT_REGISTRATION_WIRE"); }
    const target = currentDisposableOpenSealedTargetSchema.parse(argumentsValue[0]["value"]);
    const expected = { ...diagnosticGeneratedFixtureRegistrationParams(params["uniqueContextId"], target), functionDeclaration: GENERATED_COMPONENT_FIXTURE_REGISTRATION_FUNCTION };
    if (JSON.stringify(params) !== JSON.stringify(expected) || raw["id"] > CURRENT_PCB_COMPONENT_SPATIAL_PROFILE.normalRequestLimit) { throw new Error("COMPONENT_REGISTRATION_WIRE"); }
    session.parse(raw["sessionId"]);
    return Object.freeze({ action: "component-register419", requestId: raw["id"], sessionId: raw["sessionId"], uniqueContextId: params["uniqueContextId"], targetRawWindowsPath: target.rawWindowsPath, targetProjectUuid: target.projectUuid, targetBranchUuid: target.branchUuid, targetDocumentUuid: target.documentUuid, targetExpectedSourceSha256: target.expectedSourceSha256 });
  }
  const request = diagnosticNativeRequest(Buffer.from(`${JSON.stringify({ ...raw, id: 1 })}\0`));
  if (raw["id"] > CURRENT_PCB_COMPONENT_SPATIAL_PROFILE.normalRequestLimit) { throw new Error("PCB_SPATIAL_CLEANUP_RESERVE"); }
  if (!CURRENT_PCB_SPATIAL_DISCOVERY_METHODS.some(method => method === raw["method"]) &&
    !(raw["method"] === "Runtime.callFunctionOn" && (typeof request["openingPhase"] === "string" || typeof request["pcbOpeningPhase"] === "string" || request["generatedFixtureRegistrationPhase"] === "register-generated-fixture"))) {
    throw new Error("PCB_SPATIAL_DISCOVERY_ONLY");
  }
  return Object.freeze({ ...request, requestId: raw["id"] });
}
