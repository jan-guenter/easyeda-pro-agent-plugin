/** Closed invocation grammar. These commands are not mounted in the current
 * native renderer protocol; a caller cannot supply a program or choose a site. */
import { z } from "zod";
import { createHash } from "node:crypto";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_SITES as SITES, CURRENT_FOOTPRINT_COPY_CLOCK_RPC_SOURCE as SOURCE } from "./current-footprint-copy-clock-rpc-source.ts";
import type { CurrentFootprintCopyClockRpcSite as Site } from "./current-footprint-copy-clock-rpc-source.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_CALLS as CALLS, CURRENT_FOOTPRINT_COPY_CLOCK_RPC_GROUP as GROUP,
  CURRENT_FOOTPRINT_COPY_CLOCK_RPC_TOPIC as TOPIC } from "./current-footprint-copy-clock-rpc-programs.ts";

/** 7 setup/metadata commands, 6 arms, 30 capture/join/properties commands,
 * 2 selected-service caller captures, 4 fresh callback-scope reads. Cleanup is
 * 10 observed resumes, 6 removals and 2 realm-specific group releases. */
export const CURRENT_FOOTPRINT_COPY_CLOCK_RPC_REQUESTS = Object.freeze({ normal: 49, cleanup: 18, total: 67 });
export const CURRENT_FOOTPRINT_COPY_CLOCK_RPC_ORDER = Object.freeze([
  "push", "dispatch", "result", "reply", "buildString", "push", "dispatch", "result", "reply", "canvasString",
] as const);
export const CURRENT_FOOTPRINT_COPY_CLOCK_RPC_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true, generatePreview: false,
  throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
export const CURRENT_FOOTPRINT_COPY_CLOCK_RPC_UI_CALLER = "[this,e,t,i,s,r,o,n]";
const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u), object = z.object({ objectId: handle }).strict();
const uuid = z.string().regex(/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/u);
const integer = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER - 1).refine(value => !Object.is(value, -0));
const replyTopic = z.string().min(1).max(256).regex(/^_MSG_BUS_RPC_-\/pro-mgr\/serverTime\/now-[a-f\d-]{36}-[\d]+$/u);
const time = integer.positive().max(8_640_000_000_000_000);
const argumentValue = (schema: z.ZodType): z.ZodType => z.object({ value: schema }).strict();
const flags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false),
  throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false), returnByValue: z.literal(false) };
const point = z.object({ scriptId: handle, lineNumber: integer, columnNumber: integer }).strict();
/* oxlint-disable unicorn/max-nested-calls -- Keep each fixed selector's positional argument schema at the same closed protocol boundary. */
const argumentsFor = {
  worker: z.tuple([object, object, object]), ui: z.tuple([object]), push: z.tuple([object, object, argumentValue(z.union([z.literal(1), z.literal(2)]))]), dispatch: z.tuple([object, argumentValue(uuid)]),
  result: z.tuple([object, object, object, object, argumentValue(z.object({ replyTopic, workerUuid: uuid, uiUuid: uuid, requestId: integer, ordinal: z.union([z.literal(1), z.literal(2)]) }).strict())]),
  reply: z.tuple([object, argumentValue(z.object({ uiUuid: uuid, value: time }).strict())]),
  producer: z.tuple([object, argumentValue(z.object({ documentUuid: z.string().regex(/^[a-f\d]{16}$/u), value: time }).strict()), argumentValue(z.union([z.literal(1), z.literal(2)]))]),
} as const;
const callRoles = ["worker", "ui", "push", "dispatch", "result", "reply", "producer"] as const;
const calls = callRoles.map(role => z.object({ phase: z.literal(`rpc-${role}`), method: z.literal("Runtime.callFunctionOn"), sessionId: handle.max(128),
  params: z.object({ ...flags, objectId: handle, functionDeclaration: z.literal(CALLS[role].program), arguments: argumentsFor[role] }).strict() }).strict());
const frames = [...Object.values(SITES).map(site => site.expression), CURRENT_FOOTPRINT_COPY_CLOCK_RPC_UI_CALLER];
const grammar = z.union([
  ...calls,
  z.object({ phase: z.literal("rpc-arm"), role: z.enum(["push", "dispatch", "result", "reply", "buildString", "canvasString"]), method: z.literal("Debugger.setBreakpoint"), sessionId: handle.max(128),
    params: z.object({ location: point, condition: z.string().min(1).max(512) }).strict() }).strict(),
  z.object({ phase: z.literal("rpc-frame"), method: z.literal("Debugger.evaluateOnCallFrame"), sessionId: handle.max(128), params: z.object({
    callFrameId: handle, expression: z.enum(frames), objectGroup: z.literal(GROUP), silent: z.literal(true), returnByValue: z.literal(false),
    generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), includeCommandLineAPI: z.literal(false),
  }).strict() }).strict(),
  z.object({ phase: z.literal("rpc-properties"), method: z.literal("Runtime.getProperties"), sessionId: handle.max(128), params: z.object({ objectId: handle,
    ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }).strict() }).strict(),
  z.object({ phase: z.literal("rpc-remove"), method: z.literal("Debugger.removeBreakpoint"), sessionId: handle.max(128), params: z.object({ breakpointId: handle }).strict() }).strict(),
  z.object({ phase: z.literal("rpc-resume"), method: z.literal("Debugger.resume"), sessionId: handle.max(128), params: z.object({}).strict() }).strict(),
  z.object({ phase: z.literal("rpc-release"), method: z.literal("Runtime.releaseObjectGroup"), sessionId: handle.max(128), params: z.object({ objectGroup: z.literal(GROUP) }).strict() }).strict(),
]);
/* oxlint-enable unicorn/max-nested-calls */
export interface CurrentFootprintCopyClockRpcCommand {
  readonly phase: string;
  readonly method: "Runtime.callFunctionOn" | "Debugger.setBreakpoint" | "Debugger.evaluateOnCallFrame" | "Runtime.getProperties" | "Debugger.removeBreakpoint" | "Debugger.resume" | "Runtime.releaseObjectGroup" | "Debugger.getScriptSource";
  readonly sessionId: string;
  readonly role?: Site;
  readonly params: Readonly<Record<string, unknown>>;
}
function need(condition: boolean): asserts condition { if (!condition) { throw new Error("FOOTPRINT_CLOCK_RPC_PROTOCOL"); } }
export function currentFootprintCopyClockRpcCondition(role: Site, busUuid: string): string {
  uuid.parse(busUuid); const receiver = `this.uuid===${JSON.stringify(busUuid)}`;
  if (role === "buildString" || role === "canvasString") { return "true"; }
  if (role === "reply") { return `${receiver}&&typeof t==="string"&&t.startsWith(${JSON.stringify(`_MSG_BUS_RPC_-${TOPIC}-${busUuid}-`)})`; }
  return `${receiver}&&${role === "push" || role === "result" ? "e" : "t"}===${JSON.stringify(TOPIC)}`;
}
export function validateCurrentFootprintCopyClockRpcCommand(input: unknown): CurrentFootprintCopyClockRpcCommand {
  const command = grammar.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.phase === "rpc-arm") {
    const role = command.role; const expected = SITES[role]; const actual = command.params.location;
    need(actual.lineNumber === expected.lineNumber && actual.columnNumber === expected.columnNumber);
    if (role === "buildString" || role === "canvasString") { need(command.params.condition === "true"); }
    else {
      const selected = /this\.uuid==="([a-f\d-]{36})"/u.exec(command.params.condition)?.[1];
      need(selected !== undefined && command.params.condition === currentFootprintCopyClockRpcCondition(role, selected));
    }
  }
  // The strict finite union above retains exact programs, arguments and sites.
  return freezeDeep(command);
}
const remote = z.object({ type: z.enum(["object", "function", "number", "string", "undefined", "boolean"]), subtype: z.string().optional(), className: z.string().optional(),
  objectId: handle.optional(), description: z.string().max(8192).optional(), value: z.unknown().optional() }).strict();
const property = z.object({ name: z.string().max(256), value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) }).strict();
const internal = z.object({ name: z.string(), value: remote }).strict();
export function decodeCurrentFootprintCopyClockRpcArrayCapture(input: unknown, count: number): string {
  const result = z.object({ type: z.literal("object"), subtype: z.literal("array"), className: z.literal("Array"), objectId: handle,
    description: z.literal(`Array(${String(count)})`) }).strict();
  return z.object({ result }).strict().parse(captureCurrentPcbStringClockReply(input).value).result.objectId;
}
export function decodeCurrentFootprintCopyClockRpcArray(input: unknown, count: number): ReadonlyMap<string, z.infer<typeof remote>> {
  const reply = z.object({ result: z.array(property).length(count + 1), internalProperties: z.array(internal).length(1) }).strict().parse(captureCurrentPcbStringClockReply(input).value);
  const fields = new Map(reply.result.map(item => [item.name, item])); need(fields.size === count + 1);
  const length = fields.get("length"), parent = reply.internalProperties[0];
  need(length?.value.type === "number" && length.value.value === count && length.writable && !length.enumerable && !length.configurable &&
    parent?.name === "[[Prototype]]" && parent.value.type === "object" && parent.value.subtype === "array" && parent.value.objectId !== undefined);
  const result = new Map<string, z.infer<typeof remote>>();
  for (let index = 0; index < count; index += 1) { const field = fields.get(String(index)); need(field !== undefined && field.writable && field.enumerable && field.configurable && field.value.subtype !== "proxy"); result.set(String(index), field.value); }
  return result;
}
export function currentFootprintCopyClockRpcArrayObject(array: ReadonlyMap<string, z.infer<typeof remote>>, index: number): string {
  const value = array.get(String(index)); need(value !== undefined && (value.type === "object" || value.type === "function") && value.objectId !== undefined && value.value === undefined); return value.objectId;
}
export function currentFootprintCopyClockRpcArrayValue(array: ReadonlyMap<string, z.infer<typeof remote>>, index: number): string | number {
  const value = array.get(String(index)); need(value !== undefined && (value.type === "number" && typeof value.value === "number" && Number.isSafeInteger(value.value) && !Object.is(value.value, -0) || value.type === "string" && typeof value.value === "string") && value.objectId === undefined);
  return value.value;
}
export function decodeCurrentFootprintCopyClockRpcFunction(input: unknown, role: "push" | "dispatch" | "reply", scriptId: string): void {
  const expected = SOURCE.worker.functions[role];
  const reply = z.object({ result: z.array(property).length(2), internalProperties: z.array(internal).length(3) }).strict().parse(captureCurrentPcbStringClockReply(input).value);
  const fields = new Map(reply.result.map(field => [field.name, field])); need(fields.size === 2);
  for (const [key, literal] of [["name", expected.name], ["length", expected.arity]] as const) {
    const field = fields.get(key); need(field !== undefined && !field.writable && !field.enumerable && field.configurable && field.value.objectId === undefined &&
      field.value.type === (key === "name" ? "string" : "number") && field.value.value === literal && !Object.is(field.value.value, -0));
  }
  const values = new Map(reply.internalProperties.map(field => [field.name, field.value]));
  const location = values.get("[[FunctionLocation]]"); const actual = point.parse(location?.value); const parent = values.get("[[Prototype]]");
  need(values.size === 3 && location?.type === "object" && location.subtype === "internal#location" && actual.scriptId === scriptId && actual.lineNumber === expected.lineNumber && actual.columnNumber === expected.columnNumber &&
    parent?.type === "function" && parent.objectId !== undefined && values.get("[[Scopes]]")?.subtype === "internal#scopeList");
}
export function requireCurrentFootprintCopyClockRpcDescription(value: unknown, role: "push" | "dispatch" | "reply"): void {
  const profile = SOURCE.worker.functions[role]; need(typeof value === "string" && Buffer.byteLength(value) === profile.bytes && createHash("sha256").update(value).digest("hex") === profile.sha256);
}
const pausedFrame = z.looseObject({ callFrameId: handle, functionName: z.string().max(256), location: point, functionLocation: point });
const paused = z.looseObject({ reason: z.literal("other"), hitBreakpoints: z.tuple([handle]), callFrames: z.array(pausedFrame).min(1).max(32) });
export function decodeCurrentFootprintCopyClockRpcPause(input: unknown, role: Site, scriptId: string, breakpointId: string,
  ordinal: 1 | 2): Readonly<{ frameId: string; callerId: string | null }> {
  const event = paused.parse(captureCurrentPcbStringClockReply(input).value); const top = event.callFrames[0]; const site = SITES[role];
  need(top !== undefined && event.hitBreakpoints[0] === breakpointId && top.functionName === site.functionName && top.location.scriptId === scriptId &&
    top.location.lineNumber === site.lineNumber && top.location.columnNumber === site.columnNumber && top.functionLocation.scriptId === scriptId &&
    top.functionLocation.lineNumber === site.functionLine && top.functionLocation.columnNumber === site.functionColumn);
  if (role === "push") {
    const producer = SITES[ordinal === 1 ? "buildString" : "canvasString"];
    need(event.callFrames.some(frame => frame.functionName === "qe" && frame.functionLocation.scriptId === scriptId && frame.functionLocation.lineNumber === 108 && frame.functionLocation.columnNumber === 9674) &&
      event.callFrames.some(frame => frame.functionName === producer.functionName && frame.functionLocation.scriptId === scriptId && frame.functionLocation.lineNumber === producer.functionLine && frame.functionLocation.columnNumber === producer.functionColumn));
  }
  if (role !== "result") { return Object.freeze({ frameId: top.callFrameId, callerId: null }); }
  const caller = event.callFrames.find(frame => frame.functionName === "onReceivedIGive" && frame.functionLocation.scriptId === scriptId && frame.functionLocation.lineNumber === 0 && frame.functionLocation.columnNumber === 11_387);
  need(caller !== undefined && caller.location.scriptId === scriptId && caller.location.lineNumber === 0 && caller.location.columnNumber === 11_589);
  return Object.freeze({ frameId: top.callFrameId, callerId: caller.callFrameId });
}
