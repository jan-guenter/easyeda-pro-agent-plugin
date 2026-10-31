/** Unmounted read-only delete metadata grammar. The selected programs inspect
 * descriptors only; no invocation, clock, completion or native-owner route is
 * admitted by this unit. Function expectations come from the existing source
 * profile and supplied session/script IDs remain descriptive inputs. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { CURRENT_FOOTPRINT_DELETE_TRIGGER_PROGRAMS as PROGRAMS } from "./current-footprint-delete-trigger-programs.ts";
import { CURRENT_FOOTPRINT_DELETE_TRIGGER_METHODS as METHODS } from "./current-footprint-delete-trigger-source.ts";
import { currentFootprintDeleteTriggerExpectationSchema } from "./current-footprint-delete-trigger-protocol.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_DELETE_METADATA_GROUP = "easyeda-footprint-delete-metadata-v1";
export const CURRENT_FOOTPRINT_DELETE_METADATA_ORDER = freezeDeep([
  { phase: "capture", cleanup: false }, { phase: "tuple-before", cleanup: false },
  { phase: "preflight-before", cleanup: false },
  ...METHODS.map((_, index) => ({ phase: "method-properties", index, cleanup: false } as const)),
  { phase: "tuple-after", cleanup: false }, { phase: "preflight-after", cleanup: false },
  { phase: "release", cleanup: true },
] as const);
const replyBytes = 131_072;
export const CURRENT_FOOTPRINT_DELETE_METADATA_BUDGET = Object.freeze({
  normalRequests: CURRENT_FOOTPRINT_DELETE_METADATA_ORDER.filter(value => !value.cleanup).length,
  cleanupRequests: CURRENT_FOOTPRINT_DELETE_METADATA_ORDER.filter(value => value.cleanup).length,
  totalRequests: CURRENT_FOOTPRINT_DELETE_METADATA_ORDER.length,
  ownerAssertionCallbacks: 2 * CURRENT_FOOTPRINT_DELETE_METADATA_ORDER.length,
  commandBytes: 16_384, replyBytes, retainedReplyBytes: replyBytes * CURRENT_FOOTPRINT_DELETE_METADATA_ORDER.length,
  externalOwnerReproofRequestsIncluded: false, wholeNativeBudgetReserved: false, executionAuthorized: false,
} as const);
const token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}(?![\s\S])/u);
const session = token.max(128);
const remoteArgument = z.object({ objectId: token }).strict();
const ownerArguments = [remoteArgument, remoteArgument, remoteArgument, remoteArgument] as const;
const flags = { objectId: token, objectGroup: z.literal(CURRENT_FOOTPRINT_DELETE_METADATA_GROUP),
  silent: z.literal(true), generatePreview: z.literal(false), userGesture: z.literal(false),
  throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false) };
const capture = z.object({ ...flags, functionDeclaration: z.literal(PROGRAMS.capture.program),
  arguments: z.tuple(ownerArguments), returnByValue: z.literal(false) }).strict();
const preflight = z.object({ ...flags, functionDeclaration: z.literal(PROGRAMS.preflight.program),
  arguments: z.tuple([...ownerArguments, remoteArgument, z.object({ value: currentFootprintDeleteTriggerExpectationSchema }).strict()]),
  returnByValue: z.literal(true) }).strict();
const properties = z.object({ objectId: token, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false),
  generatePreview: z.literal(false) }).strict();
const release = z.object({ objectGroup: z.literal(CURRENT_FOOTPRINT_DELETE_METADATA_GROUP) }).strict();
const propertyCommands = (["tuple-before", "tuple-after"] as const).map(phase => z.object({ phase: z.literal(phase),
  method: z.literal("Runtime.getProperties"), sessionId: session, params: properties }).strict());
const preflightCommands = (["preflight-before", "preflight-after"] as const).map(phase => z.object({ phase: z.literal(phase),
  method: z.literal("Runtime.callFunctionOn"), sessionId: session, params: preflight }).strict());
const schema = z.discriminatedUnion("phase", [
  z.object({ phase: z.literal("capture"), method: z.literal("Runtime.callFunctionOn"), sessionId: session, params: capture }).strict(),
  ...propertyCommands, ...preflightCommands,
  z.object({ phase: z.literal("method-properties"), index: z.number().int().min(0).max(METHODS.length - 1),
    method: z.literal("Runtime.getProperties"), sessionId: session, params: properties }).strict(),
  z.object({ phase: z.literal("release"), method: z.literal("Runtime.releaseObjectGroup"), sessionId: session,
    params: release }).strict(),
]);
export type CurrentFootprintDeleteMetadataCommand = Readonly<z.infer<typeof schema>>;

/** Copy inert data before selecting exact fixed programs and side-effect flags.
 * This validates a command shape without issuing an ID or native ownership. */
export function validateCurrentFootprintDeleteMetadataCommand(input: unknown): CurrentFootprintDeleteMetadataCommand {
  const value = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (Buffer.byteLength(JSON.stringify(value)) > CURRENT_FOOTPRINT_DELETE_METADATA_BUDGET.commandBytes) {
    throw new Error("FOOTPRINT_DELETE_METADATA_COMMAND_BYTES");
  }
  return freezeDeep(value);
}

export const currentFootprintDeleteMetadataBindingSchema = z.object({ sessionId: session, scriptId: token,
  project: token, bus: token, manager: token, consistency: token, constructors: token }).strict();
export type CurrentFootprintDeleteMetadataBinding = Readonly<z.infer<typeof currentFootprintDeleteMetadataBindingSchema>>;
const text = z.string().max(16_384).refine(value => value.isWellFormed());
const position = z.object({ scriptId: token, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const remote = z.object({ type: z.enum(["object", "function", "number", "string"]), subtype: text.optional(), className: text.optional(),
  description: text.optional(), objectId: token.optional(), value: z.union([z.null(), text, z.number(), position]).optional() }).strict();
const property = z.object({ name: text, value: remote, writable: z.boolean(), enumerable: z.boolean(), configurable: z.boolean(), isOwn: z.literal(true) }).strict();
const internal = z.object({ name: text, value: remote }).strict();
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_DELETE_METADATA_ROSTER"); } }

const arrayDescription = `Array(${String(METHODS.length)})`;
const capturedArray = z.object({ type: z.literal("object"), subtype: z.literal("array"), className: z.literal("Array"),
  description: z.literal(arrayDescription), objectId: token }).strict();
export const currentFootprintDeleteMetadataArrayCaptureSchema = z.object({ result: capturedArray }).strict();

/** Require every tuple field, descriptor and pinned function description.
 * Returned CDP handles are references for this observation only. A later
 * getProperties reply may issue different IDs for the same JavaScript values;
 * the existing fixed preflight performs identity comparisons in that realm. */
export function decodeCurrentFootprintDeleteMetadataTuple(input: unknown): readonly string[] {
  const reply = z.object({ result: z.array(property).length(METHODS.length + 1), internalProperties: z.array(internal).length(1) }).strict()
    .parse(captureCurrentPcbStringClockReply(input).value);
  const fields = new Map(reply.result.map(item => [item.name, item])); need(fields.size === METHODS.length + 1);
  const length = fields.get("length"), parent = reply.internalProperties[0];
  need(length?.value.type === "number" && length.value.value === METHODS.length && length.value.objectId === undefined &&
    length.value.subtype === undefined && length.value.className === undefined && length.writable && !length.enumerable && !length.configurable);
  need(parent?.name === "[[Prototype]]" && parent.value.type === "object" && parent.value.subtype === "array" &&
    parent.value.className === "Array" && parent.value.description === "Array(0)" && parent.value.objectId !== undefined && parent.value.value === undefined);
  const ids = METHODS.map((expected, index) => {
    const field = fields.get(String(index)), value = field?.value;
    need(field !== undefined && field.writable && field.enumerable && field.configurable && value?.type === "function" &&
      value.className === (expected.async ? "AsyncFunction" : "Function") && value.objectId !== undefined && value.value === undefined &&
      value.subtype === undefined && value.description !== undefined && Buffer.byteLength(value.description) === expected.bytes &&
      createHash("sha256").update(value.description).digest("hex") === expected.sha256);
    return value.objectId;
  });
  need(new Set(ids).size === METHODS.length); return Object.freeze(ids);
}

/** Match exact name/length and internal field rosters plus the declared source
 * location. The prototype is checked only for its broad type and remote handle;
 * its remaining bounded fields are retained as unqualified metadata. The
 * expected script ID is descriptive, not authenticated by this decoder. */
export function decodeCurrentFootprintDeleteMethodMetadata(input: unknown, scriptId: string, index: number): void {
  token.parse(scriptId); const expected = Number.isInteger(index) && !Object.is(index, -0) ? METHODS[index] : undefined; need(expected !== undefined);
  const reply = z.object({ result: z.array(property).length(2), internalProperties: z.array(internal).length(3) }).strict()
    .parse(captureCurrentPcbStringClockReply(input).value);
  const fields = new Map(reply.result.map(item => [item.name, item])); need(fields.size === 2);
  for (const [name, target] of [["name", expected.name], ["length", expected.arity]] as const) {
    const field = fields.get(name); need(field !== undefined && !field.writable && !field.enumerable && field.configurable &&
      field.value.type === (name === "name" ? "string" : "number") && field.value.value === target && !Object.is(field.value.value, -0) &&
      field.value.objectId === undefined && field.value.subtype === undefined && field.value.className === undefined);
  }
  const entries = new Map(reply.internalProperties.map(item => [item.name, item.value])); need(entries.size === 3);
  const location = entries.get("[[FunctionLocation]]"), parent = entries.get("[[Prototype]]"), scopes = entries.get("[[Scopes]]");
  const point = location?.value;
  need(location?.type === "object" && location.subtype === "internal#location" && location.objectId === undefined &&
    point !== null && typeof point === "object" && point.scriptId === scriptId && point.lineNumber === expected.lineNumber && point.columnNumber === expected.columnNumber &&
    parent?.type === (expected.async ? "object" : "function") && parent.objectId !== undefined && parent.value === undefined &&
    scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.objectId !== undefined &&
    scopes.value === undefined && /^Scopes\[[1-8]\]$/u.test(scopes.description ?? ""));
}
