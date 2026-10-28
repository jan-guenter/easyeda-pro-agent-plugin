/** Unmounted fixed request/actor selector grammar. Object IDs decoded here are
 * descriptive only; JSON and equal handles cannot issue an original owner. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_CALLS as CALLS, CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_EXPRESSIONS as EXPRESSIONS,
  CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_GROUP as GROUP } from "./current-footprint-copy-main-request-programs.ts";

const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const object = z.object({ objectId: handle }).strict();
export const currentFootprintCopyMainRequestPlanSchema = z.object({
  projectUuid: z.string().regex(/^[a-f\d]{64}$/u), branchUuid: z.string().regex(/^[a-f\d]{32}$/u),
  projectKey: z.string().regex(/^[a-f\d]{64}$/u), path: z.string().min(1).max(4096), dataStr: z.string().min(1).max(524_288),
}).strict();
const flags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false),
  throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const frame = z.object({ callFrameId: handle, expression: z.enum(Object.values(EXPRESSIONS)), objectGroup: z.literal(GROUP), silent: z.literal(true),
  returnByValue: z.literal(false), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), includeCommandLineAPI: z.literal(false) }).strict();
const contextParameters = z.object({ ...flags, objectId: handle, functionDeclaration: z.literal(CALLS.context.program),
  arguments: z.tuple([object]), returnByValue: z.literal(false) }).strict();
const planArgument = z.object({ value: currentFootprintCopyMainRequestPlanSchema }).strict();
const controllerParameters = z.object({ ...flags, objectId: handle, functionDeclaration: z.literal(CALLS.controller.program),
  arguments: z.tuple([object, planArgument]), returnByValue: z.literal(false) }).strict();
const actorParameters = z.object({ ...flags, objectId: handle, functionDeclaration: z.literal(CALLS.actor.program),
  arguments: z.tuple([object, object]), returnByValue: z.literal(false) }).strict();
const sqlParameters = z.object({ ...flags, objectId: handle, functionDeclaration: z.literal(CALLS.sql.program),
  arguments: z.tuple([object]), returnByValue: z.literal(false) }).strict();
const valueParameters = z.object({ ...flags, objectId: handle, functionDeclaration: z.literal(CALLS.value.program),
  arguments: z.tuple([]), returnByValue: z.literal(true) }).strict();
const propertiesParameters = z.object({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }).strict();
const command = z.discriminatedUnion("phase", [
  z.object({ phase: z.literal("request-frame"), method: z.literal("Debugger.evaluateOnCallFrame"), params: frame }).strict(),
  z.object({ phase: z.literal("request-context"), method: z.literal("Runtime.callFunctionOn"), params: contextParameters }).strict(),
  z.object({ phase: z.literal("request-controller"), method: z.literal("Runtime.callFunctionOn"), params: controllerParameters }).strict(),
  z.object({ phase: z.literal("request-actor"), method: z.literal("Runtime.callFunctionOn"), params: actorParameters }).strict(),
  z.object({ phase: z.literal("request-sql"), method: z.literal("Runtime.callFunctionOn"), params: sqlParameters }).strict(),
  z.object({ phase: z.literal("request-value"), method: z.literal("Runtime.callFunctionOn"), params: valueParameters }).strict(),
  z.object({ phase: z.literal("request-properties"), method: z.literal("Runtime.getProperties"), params: propertiesParameters }).strict(),
]).readonly();
export type CurrentFootprintCopyMainRequestCommand = z.infer<typeof command>;
export function validateCurrentFootprintCopyMainRequestCommand(input: unknown): CurrentFootprintCopyMainRequestCommand {
  return freezeDeep(command.parse(captureCurrentPcbStringClockReply(input).value));
}
export const CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true, generatePreview: false,
  throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
const remote = z.object({ type: z.string(), subtype: z.string().optional(), className: z.string().optional(), objectId: handle.optional(),
  description: z.string().max(8192).optional(), value: z.unknown().optional() }).strict();
const internal = z.object({ name: z.string(), value: remote }).strict();
const asyncSymbol = z.enum(["Symbol(async_id_symbol)", "Symbol(trigger_async_id_symbol)"]);
const asyncProperty = z.object({ name: asyncSymbol, value: z.object({ type: z.literal("number"), value: z.number().int().nonnegative(), description: z.string().optional() }).strict(),
  writable: z.literal(true), configurable: z.literal(true), enumerable: z.literal(true), isOwn: z.literal(true),
  symbol: z.object({ type: z.literal("symbol"), description: asyncSymbol, objectId: handle }).strict() }).strict();
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_MAIN_REQUEST_REPLY"); } }
/** Read V8's actual fulfilled PromiseResult. Never calls then, awaitPromise,
 * SQL, a native getter, a body reader or a second database initializer. The
 * future runner must use this exact result with its original Promise handle. */
export function decodeCurrentFootprintCopyMainRequestPromise(input: unknown): string {
  // Node's active async hooks add this exact native metadata pair. They do not
  // Shadow then or alter PromiseResult; arbitrary own properties still refuse.
  const reply = z.object({ result: z.array(asyncProperty).max(2), internalProperties: z.array(internal).length(3) }).strict().parse(captureCurrentPcbStringClockReply(input).value);
  need(reply.result.length === 0 || reply.result.length === 2 && new Set(reply.result.map(item => item.name)).size === 2);
  for (const property of reply.result) { need(property.symbol.description === property.name && !Object.is(property.value.value, -0)); }
  const entries = new Map(reply.internalProperties.map(item => [item.name, item.value]));
  const parent = entries.get("[[Prototype]]"), result = entries.get("[[PromiseResult]]"), state = entries.get("[[PromiseState]]");
  need(entries.size === 3 && parent?.type === "object" && parent.className === "Promise" && parent.subtype === undefined && parent.objectId !== undefined && parent.value === undefined &&
    state?.type === "string" && state.value === "fulfilled" && state.objectId === undefined && state.subtype === undefined &&
    result?.type === "object" && result.objectId !== undefined && result.subtype === undefined && result.value === undefined);
  return result.objectId;
}
const value = z.object({ uuid: z.string().regex(/^[a-f\d]{32}$/u), username: z.string().max(1024), nickname: z.string().max(1024),
  updateTime: z.number().int().positive().max(8_640_000_000_000_000) }).strict();
const valueReply = z.object({ result: z.object({ type: z.literal("object"), value }).strict() }).strict();
export function decodeCurrentFootprintCopyMainRequestValue(input: unknown): Readonly<z.infer<typeof value>> {
  return freezeDeep(valueReply.parse(captureCurrentPcbStringClockReply(input).value).result.value);
}
