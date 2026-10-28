/** Separate fixed writer grammar. No preparation or startup route imports this
 * selector, and recognizing its data never issues execution authority. */
import { z } from "zod";
import { types } from "node:util";
import { CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_CALL } from "./current-footprint-copy-create-bindings.ts";
import { currentFootprintCopyV2NativeCreateArguments } from "./current-footprint-copy-v2-native-arguments.ts";
import type { CurrentFootprintCopyV2Plan } from "./current-footprint-copy-v2-plan.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE } from "./current-pcb-worker-construction-contract.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_LIMITS = Object.freeze({ argumentsBytes: 65_536,
  commandBytes: 81_920, serializedResultBytes: 2_097_152, responseFrameBytes: 4_198_400,
  createRequests: 1, explicitSaveRequests: 0, mounted: false });
const token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}(?![\s\S])/u);
const project = z.string().regex(/^(?:[a-f\d]{32}|[a-f\d]{64})(?![\s\S])/u);
const text = z.string().max(65_536).refine(value => value.isWellFormed());
const argument = z.object({ uuid: z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})(?![\s\S])/u), path: project,
  isProject: z.literal(true), docType: z.literal(4), title: text.min(1).max(512), display_title: text.min(1).max(512),
  description: text, custom_tags: text, source: z.literal(""), version: z.literal("") }).strict();
const remote = z.object({ objectId: token }).strict();
const argumentValue = z.object({ value: argument }).strict(), projectValue = z.object({ value: project }).strict();
const schema = z.object({ method: z.literal("Runtime.callFunctionOn"), sessionId: token.max(128), params: z.object({
  objectId: token, functionDeclaration: z.literal(CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_CALL.program),
  arguments: z.tuple([remote, remote, remote, remote, remote, projectValue, argumentValue]),
  objectGroup: z.literal(CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE.group), silent: z.literal(true), returnByValue: z.literal(true),
  generatePreview: z.literal(false), throwOnSideEffect: z.literal(false), awaitPromise: z.literal(true), userGesture: z.literal(false),
}).strict() }).strict();
export type CurrentFootprintCopyNativeCreateCommand = Readonly<z.infer<typeof schema>>;

/** All large strings enter as one primitive serialized envelope so the small
 * inspector metadata copier keeps its existing independent limits. JSON text
 * is data only; native evaluation always uses the single fixed literal. */
export function currentFootprintCopyNativeCreateWire(serialized: unknown, id: number): Readonly<{
  command: CurrentFootprintCopyNativeCreateCommand & Readonly<{ id: number }>;
  request: Readonly<Record<string, string | number>>;
}> {
  if (typeof serialized !== "string" || !serialized.isWellFormed() || serialized.length > CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_LIMITS.commandBytes ||
    Buffer.byteLength(serialized) > CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_LIMITS.commandBytes || !Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647) {
    throw new Error("FOOTPRINT_COPY_NATIVE_CREATE_WIRE");
  }
  const parsed: unknown = JSON.parse(serialized);
  const command = schema.parse(parsed);
  if (JSON.stringify(parsed) !== serialized) { throw new Error("FOOTPRINT_COPY_NATIVE_CREATE_SERIALIZATION"); }
  const args = command.params.arguments, value = args[6].value;
  const tags: unknown = JSON.parse(value.custom_tags);
  const tagSchema = z.array(z.string().max(512).refine(tag => tag.isWellFormed())).max(256);
  tagSchema.parse(tags);
  const createArgumentJson = JSON.stringify(value);
  if (value.path !== args[5].value || value.display_title !== value.title || JSON.stringify(tags) !== value.custom_tags ||
    Buffer.byteLength(createArgumentJson) > CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_LIMITS.argumentsBytes) {
    throw new Error("FOOTPRINT_COPY_NATIVE_CREATE_ARGUMENTS");
  }
  const request: Record<string, string | number> = { action: "footprint-copy-native-create", requestId: id,
    objectId: command.params.objectId, expectedProjectUuid: args[5].value, createArgumentJson };
  for (const [index, entry] of args.slice(0, 5).entries()) {
    if (!("objectId" in entry)) { throw new Error("FOOTPRINT_COPY_NATIVE_CREATE_HANDLES"); }
    request[`arg${String(index)}ObjectId`] = entry.objectId;
  }
  return freezeDeep({ command: { ...command, id }, request });
}

/** Creates only a fixed data envelope; original handle custody and consumed
 * dispatch remain the enclosing native owner's duties. */
export function currentFootprintCopyNativeCreateCommand(sessionId: string, projectObjectId: string,
  handles: readonly [string, string, string, string, string], plan: CurrentFootprintCopyV2Plan): CurrentFootprintCopyNativeCreateCommand {
  captureCurrentPcbStringClockReply({ sessionId, projectObjectId, handles });
  const args = currentFootprintCopyV2NativeCreateArguments(plan);
  const command = { method: "Runtime.callFunctionOn", sessionId, params: { objectId: projectObjectId,
    functionDeclaration: CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_CALL.program,
    arguments: [...handles.map(objectId => ({ objectId })), { value: args.expectedProjectUuid }, { value: args.createArgument }],
    objectGroup: CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE.group, silent: true, returnByValue: true, generatePreview: false,
    throwOnSideEffect: false, awaitPromise: true, userGesture: false } };
  const wire = currentFootprintCopyNativeCreateWire(JSON.stringify(command), 1);
  const { id: _id, ...output } = wire.command; return freezeDeep(output);
}

/** The owner must retain the original received frame before decoding. Missing
 * acknowledgment and exception replies consume create just as a valid result
 * does; this extractor cannot grant a retry or substitute a result UUID. */
function fields(value: unknown, names: readonly string[]): readonly unknown[] {
    if (value === null || typeof value !== "object" || types.isProxy(value) ||
      Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null || Reflect.ownKeys(value).length !== names.length) {
      throw new Error("FOOTPRINT_COPY_NATIVE_CREATE_REPLY");
    }
    return names.map(name => {
      const field = Object.getOwnPropertyDescriptor(value, name);
      if (field === undefined || !Object.hasOwn(field, "value") || field.enumerable !== true) { throw new Error("FOOTPRINT_COPY_NATIVE_CREATE_REPLY"); }
      return field.value as unknown;
    });
}
export function captureCurrentFootprintCopyNativeCreateReply(input: unknown): string {
  const [result] = fields(input, ["result"]), [type, value] = fields(result, ["type", "value"]);
  if (type !== "string" || typeof value !== "string" || !value.isWellFormed() || value.length > CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_LIMITS.serializedResultBytes ||
    Buffer.byteLength(value) > CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_LIMITS.serializedResultBytes) {
    throw new Error("FOOTPRINT_COPY_NATIVE_CREATE_REPLY");
  }
  return value;
}
