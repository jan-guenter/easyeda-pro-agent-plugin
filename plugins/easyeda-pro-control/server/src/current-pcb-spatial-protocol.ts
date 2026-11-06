/** Closed private spatial grammar. Qualification and mounting remain the owner's
 * responsibility; native requests contain selectors and values, never code. */
import { z } from "zod";
import { CURRENT_PCB_209_SPATIAL_ARC_BINDINGS_FUNCTION, CURRENT_PCB_209_SPATIAL_BINDINGS_FUNCTION, CURRENT_PCB_209_SPATIAL_CALLBACK_EXPRESSION,
  CURRENT_PCB_209_SPATIAL_FUNCTIONS_FUNCTION, CURRENT_PCB_209_SPATIAL_HANDLER_FUNCTION, CURRENT_PCB_209_SPATIAL_TRACK_BINDINGS_FUNCTION } from "./current-pcb-209-spatial-capture-program.ts";
import { CURRENT_PCB_209_SPATIAL_ARC_READ_FUNCTION, CURRENT_PCB_209_SPATIAL_READ_FUNCTION, CURRENT_PCB_209_SPATIAL_TRACK_READ_FUNCTION } from "./current-pcb-209-spatial-read-program.ts";
import { currentPcb209SpatialQuerySchema } from "./current-pcb-209-spatial-read.ts";
import { CURRENT_PCB_SPATIAL_OBJECT_GROUP } from "./current-pcb-spatial-capture-runner.ts";
import type { CurrentPcbSpatialCaptureCommand } from "./current-pcb-spatial-capture-runner.ts";
import { diagnosticNativeRequest, diagnosticRecord } from "./current-pcb-diagnostic-protocol.ts";
import { CURRENT_PCB_SPATIAL_DISCOVERY_METHODS, CURRENT_PCB_SPATIAL_PROFILE } from "./current-pcb-spatial-profile.ts";
import { captureCurrentPcbSpatialCommand } from "./current-pcb-spatial-command-input.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_PCB_209_SPATIAL_PAD_BINDINGS_FUNCTION, CURRENT_PCB_209_SPATIAL_PAD_READ_FUNCTION,
  currentPcb209SpatialPadPointSchema } from "./current-pcb-209-spatial-pad-read.ts";

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
const trackBindingParams = bindingParams.extend({ functionDeclaration: z.literal(CURRENT_PCB_209_SPATIAL_TRACK_BINDINGS_FUNCTION) });
const trackReadParams = readParams.extend({ functionDeclaration: z.literal(CURRENT_PCB_209_SPATIAL_TRACK_READ_FUNCTION) });
const arcBindingParams = bindingParams.extend({ functionDeclaration: z.literal(CURRENT_PCB_209_SPATIAL_ARC_BINDINGS_FUNCTION) });
const arcReadParams = readParams.extend({ functionDeclaration: z.literal(CURRENT_PCB_209_SPATIAL_ARC_READ_FUNCTION) });
const componentPadBindingParams = bindingParams.extend({ functionDeclaration: z.literal(CURRENT_PCB_209_SPATIAL_PAD_BINDINGS_FUNCTION) });
const componentPadReadParams = readParams.extend({ functionDeclaration: z.literal(CURRENT_PCB_209_SPATIAL_PAD_READ_FUNCTION), arguments: z.tuple([z.strictObject({ value: currentPcb209SpatialPadPointSchema })]) });
const schema = z.discriminatedUnion("spatialPhase", [
  z.strictObject({ spatialPhase: z.literal("wrapper"), method: z.literal("Runtime.evaluate"), params: wrapperParams }),
  z.strictObject({ spatialPhase: z.literal("properties"), method: z.literal("Runtime.getProperties"), params: propertyParams }),
  z.strictObject({ spatialPhase: z.literal("handler"), method: z.literal("Runtime.callFunctionOn"), params: handlerParams }),
  z.strictObject({ spatialPhase: z.literal("functions"), method: z.literal("Runtime.callFunctionOn"), params: functionParams }),
  z.strictObject({ spatialPhase: z.literal("bindings"), method: z.literal("Runtime.callFunctionOn"), params: bindingParams }),
  z.strictObject({ spatialPhase: z.literal("bindings-track"), method: z.literal("Runtime.callFunctionOn"),
    params: trackBindingParams }),
  z.strictObject({ spatialPhase: z.literal("bindings-arc"), method: z.literal("Runtime.callFunctionOn"), params: arcBindingParams }),
  z.strictObject({ spatialPhase: z.literal("bindings-pad"), method: z.literal("Runtime.callFunctionOn"), params: componentPadBindingParams }),
  z.strictObject({ spatialPhase: z.literal("read"), method: z.literal("Runtime.callFunctionOn"), params: readParams }),
  z.strictObject({ spatialPhase: z.literal("read-track"), method: z.literal("Runtime.callFunctionOn"),
    params: trackReadParams }),
  z.strictObject({ spatialPhase: z.literal("read-arc"), method: z.literal("Runtime.callFunctionOn"), params: arcReadParams }),
  z.strictObject({ spatialPhase: z.literal("read-pad"), method: z.literal("Runtime.callFunctionOn"), params: componentPadReadParams }),
  z.strictObject({ spatialPhase: z.literal("release"), method: z.literal("Runtime.releaseObjectGroup"), params: releaseParams }),
]);
export type CurrentPcbSpatialWireCommand = CurrentPcbSpatialCaptureCommand & Readonly<{ id: number; sessionId: string }>;
/** Admit only the fixed programs, selectors and effect flags after inert input
 * Capture. Validation supplies no native session or execution authority. */
export function validateCurrentPcbSpatialCommand(input: unknown): CurrentPcbSpatialCaptureCommand {
  return freezeDeep(schema.parse(captureCurrentPcbSpatialCommand(input)));
}
/** Encode the closed native field vocabulary for one original session request.
 * Normal work cannot consume the final request reserved for group release. */
export function currentPcbSpatialWire(input: unknown, id: number, sessionId: string): Readonly<{
  command: CurrentPcbSpatialWireCommand; request: Readonly<Record<string, unknown>>;
}> {
  if (!Number.isSafeInteger(id) || id < 1 || id > CURRENT_PCB_SPATIAL_PROFILE.requestLimit) { throw new Error("PCB_SPATIAL_REQUEST_ID"); }
  const command = validateCurrentPcbSpatialCommand(input), selectedSession = session.parse(sessionId);
  if (command.spatialPhase !== "release" && id > CURRENT_PCB_SPATIAL_PROFILE.normalRequestLimit) { throw new Error("PCB_SPATIAL_CLEANUP_RESERVE"); }
  return freezeDeep({ command: { id, ...command, sessionId: selectedSession }, request: {
    action: "spatial209", requestId: id, method: command.method, sessionId: selectedSession, spatialPhase: command.spatialPhase,
    ...("uniqueContextId" in command.params ? { uniqueContextId: command.params.uniqueContextId } : {}),
    ...("objectId" in command.params ? { objectId: command.params.objectId } : {}),
    ...(command.spatialPhase === "bindings" || command.spatialPhase === "bindings-track" || command.spatialPhase === "bindings-arc" || command.spatialPhase === "bindings-pad" ? { callbackObjectId: command.params.arguments[0].objectId } : {}),
    ...(command.spatialPhase === "read" || command.spatialPhase === "read-track" || command.spatialPhase === "read-arc" || command.spatialPhase === "read-pad" ? { queryKind: command.params.arguments[0].value.kind,
      ...(command.params.arguments[0].value.kind === "point" ? { xMil: command.params.arguments[0].value.xMil, yMil: command.params.arguments[0].value.yMil } :
        { queryMode: command.params.arguments[0].value.mode, leftMil: command.params.arguments[0].value.leftMil,
          rightMil: command.params.arguments[0].value.rightMil, bottomMil: command.params.arguments[0].value.bottomMil, topMil: command.params.arguments[0].value.topMil }) } : {}),
  } });
}
/** Reuse the unchanged legacy reconstruction only with a local ID of one.
 * The separate native birth restores the actual bounded ID. This never changes
 * the legacy encoder's cap or permits its model/worker/drawing vocabulary. */
export function spatialDiagnosticNativeRequest(chunk: Buffer): Readonly<Record<string, unknown>> {
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { throw new Error("PCB_SPATIAL_WIRE"); }
  const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1)));
  if (!diagnosticRecord(raw) || typeof raw["id"] !== "number" || !Number.isSafeInteger(raw["id"]) ||
    raw["id"] < 1 || raw["id"] > CURRENT_PCB_SPATIAL_PROFILE.requestLimit || !chunk.equals(Buffer.from(`${JSON.stringify(raw)}\0`))) {
    throw new Error("PCB_SPATIAL_WIRE");
  }
  if (Object.hasOwn(raw, "spatialPhase")) {
    const { id, sessionId, ...command } = raw;
    if (typeof sessionId !== "string") { throw new TypeError("PCB_SPATIAL_WIRE"); }
    const fixed = currentPcbSpatialWire(command, id, sessionId);
    if (!chunk.equals(Buffer.from(`${JSON.stringify(fixed.command)}\0`))) { throw new Error("PCB_SPATIAL_WIRE"); }
    return fixed.request;
  }
  const request = diagnosticNativeRequest(Buffer.from(`${JSON.stringify({ ...raw, id: 1 })}\0`));
  if (raw["id"] > CURRENT_PCB_SPATIAL_PROFILE.normalRequestLimit) { throw new Error("PCB_SPATIAL_CLEANUP_RESERVE"); }
  if (!CURRENT_PCB_SPATIAL_DISCOVERY_METHODS.some(method => method === raw["method"]) &&
    !(raw["method"] === "Runtime.callFunctionOn" && (typeof request["openingPhase"] === "string" || typeof request["pcbOpeningPhase"] === "string" || request["generatedFixtureRegistrationPhase"] === "register-generated-fixture"))) {
    throw new Error("PCB_SPATIAL_DISCOVERY_ONLY");
  }
  return Object.freeze({ ...request, requestId: raw["id"] });
}
