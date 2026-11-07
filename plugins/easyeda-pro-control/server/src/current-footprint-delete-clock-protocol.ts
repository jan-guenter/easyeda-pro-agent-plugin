/** Closed invocation grammar. These commands are not mounted in the current
 * native renderer protocol; a caller cannot supply a program or choose a site. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_FOOTPRINT_DELETE_CLOCK_SITES as SITES } from "./current-footprint-delete-clock-source.ts";
import type { CurrentFootprintDeleteClockSite as Site } from "./current-footprint-delete-clock-source.ts";
import { CURRENT_FOOTPRINT_DELETE_CLOCK_CALLS as CALLS, CURRENT_FOOTPRINT_DELETE_CLOCK_GROUP as GROUP } from "./current-footprint-delete-clock-programs.ts";

/** One wave:7 setup,6 arms,18 capture/join/array reads, one deleteData
 * caller capture, one UI caller capture and2 fresh scope reads. Cleanup:6
 * observed resumes,6 removals and2 realm group releases. This local49-command
 * leaf excludes original native/SDK caller custody and all generation reproofs. */
export const CURRENT_FOOTPRINT_DELETE_CLOCK_REQUESTS = Object.freeze({ normal: 35, cleanup: 14, total: 49 });
export const CURRENT_FOOTPRINT_DELETE_CLOCK_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true, generatePreview: false,
  throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
export const CURRENT_FOOTPRINT_DELETE_CLOCK_UI_CALLER = "[this,e,t,i,s,r,o,n]";
export const CURRENT_FOOTPRINT_DELETE_CLOCK_DELETE_CALLER = "[this,s]";
const TOPIC = "/pro-mgr/serverTime/now";
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
  worker: z.tuple([object, object, object]), ui: z.tuple([object]), push: z.tuple([object, object, argumentValue(z.literal(1))]), dispatch: z.tuple([object, argumentValue(uuid)]),
  result: z.tuple([object, object, object, object, argumentValue(z.object({ replyTopic, workerUuid: uuid, uiUuid: uuid, requestId: integer, ordinal: z.literal(1) }).strict())]),
  reply: z.tuple([object, argumentValue(z.object({ uiUuid: uuid, value: time }).strict())]),
  entry: z.tuple([object, object, argumentValue(z.object({ projectUuid: z.string().regex(/^(?:[a-f\d]{32}|[a-f\d]{64})$/u), branchUuid: z.string().regex(/^[a-f\d]{32}$/u),
    targetUuid: z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u), client: z.string().regex(/^[a-f\d]{16}$/u), maximumTicket: integer }).strict())]),
  producer: z.tuple([object, object, argumentValue(z.object({ value: time }).strict())]),
} as const;
const callRoles = ["worker", "ui", "push", "dispatch", "result", "reply", "entry", "producer"] as const;
const calls = callRoles.map(role => z.object({ phase: z.literal(`delete-clock-${role}`), method: z.literal("Runtime.callFunctionOn"), sessionId: handle.max(128),
  params: z.object({ ...flags, objectId: handle, functionDeclaration: z.literal(CALLS[role].program), arguments: argumentsFor[role] }).strict() }).strict());
const frames = [...Object.values(SITES).map(site => site.expression), CURRENT_FOOTPRINT_DELETE_CLOCK_UI_CALLER, CURRENT_FOOTPRINT_DELETE_CLOCK_DELETE_CALLER];
const grammar = z.union([
  ...calls,
  z.object({ phase: z.literal("delete-clock-arm"), role: z.enum(["push", "dispatch", "result", "reply", "entry", "producer"]), method: z.literal("Debugger.setBreakpoint"), sessionId: handle.max(128),
    params: z.object({ location: point, condition: z.string().min(1).max(512) }).strict() }).strict(),
  z.object({ phase: z.literal("delete-clock-frame"), method: z.literal("Debugger.evaluateOnCallFrame"), sessionId: handle.max(128), params: z.object({
    callFrameId: handle, expression: z.enum(frames), objectGroup: z.literal(GROUP), silent: z.literal(true), returnByValue: z.literal(false),
    generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), includeCommandLineAPI: z.literal(false),
  }).strict() }).strict(),
  z.object({ phase: z.literal("delete-clock-properties"), method: z.literal("Runtime.getProperties"), sessionId: handle.max(128), params: z.object({ objectId: handle,
    ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }).strict() }).strict(),
  z.object({ phase: z.literal("delete-clock-remove"), method: z.literal("Debugger.removeBreakpoint"), sessionId: handle.max(128), params: z.object({ breakpointId: handle }).strict() }).strict(),
  z.object({ phase: z.literal("delete-clock-resume"), method: z.literal("Debugger.resume"), sessionId: handle.max(128), params: z.object({}).strict() }).strict(),
  z.object({ phase: z.literal("delete-clock-release"), method: z.literal("Runtime.releaseObjectGroup"), sessionId: handle.max(128), params: z.object({ objectGroup: z.literal(GROUP) }).strict() }).strict(),
]);
/* oxlint-enable unicorn/max-nested-calls */
export interface CurrentFootprintDeleteClockCommand {
  readonly phase: string;
  readonly method: "Runtime.callFunctionOn" | "Debugger.setBreakpoint" | "Debugger.evaluateOnCallFrame" | "Runtime.getProperties" | "Debugger.removeBreakpoint" | "Debugger.resume" | "Runtime.releaseObjectGroup";
  readonly sessionId: string;
  readonly role?: Site;
  readonly params: Readonly<Record<string, unknown>>;
}
function need(condition: boolean): asserts condition { if (!condition) { throw new Error("FOOTPRINT_DELETE_CLOCK_PROTOCOL"); } }
export function currentFootprintDeleteClockCondition(role: Site, busUuid: string): string {
  uuid.parse(busUuid); const receiver = `this.uuid===${JSON.stringify(busUuid)}`;
  if (role === "entry" || role === "producer") { return "true"; }
  if (role === "reply") { return `${receiver}&&typeof t==="string"&&t.startsWith(${JSON.stringify(`_MSG_BUS_RPC_-${TOPIC}-${busUuid}-`)})`; }
  return `${receiver}&&${role === "push" || role === "result" ? "e" : "t"}===${JSON.stringify(TOPIC)}`;
}
export function validateCurrentFootprintDeleteClockCommand(input: unknown): CurrentFootprintDeleteClockCommand {
  const command = grammar.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.phase === "delete-clock-arm") {
    const role = command.role; const expected = SITES[role]; const actual = command.params.location;
    need(actual.lineNumber === expected.lineNumber && actual.columnNumber === expected.columnNumber);
    if (role === "entry" || role === "producer") { need(command.params.condition === "true"); }
    else {
      const selected = /this\.uuid==="([a-f\d-]{36})"/u.exec(command.params.condition)?.[1];
      need(selected !== undefined && command.params.condition === currentFootprintDeleteClockCondition(role, selected));
    }
  }
  // The strict finite union above retains exact programs, arguments and sites.
  return freezeDeep(command);
}
const pausedFrame = z.looseObject({ callFrameId: handle, functionName: z.string().max(256), location: point, functionLocation: point });
const paused = z.looseObject({ reason: z.literal("other"), hitBreakpoints: z.tuple([handle]), callFrames: z.array(pausedFrame).min(1).max(32) });
/** Original script/breakpoint/caller substitution remains the native owner's
 * task. Decoding these values supplies no sender or invocation authority. */
export function decodeCurrentFootprintDeleteClockPause(input: unknown, role: Site, scriptId: string, breakpointId: string): Readonly<{ frameId: string; uiCallerId: string | null; deleteCallerId: string | null }> {
  need(typeof role === "string" && Object.hasOwn(SITES, role));
  const event = paused.parse(captureCurrentPcbStringClockReply(input).value), site = SITES[role], top = event.callFrames[0];
  need(top !== undefined && event.hitBreakpoints[0] === breakpointId && top.functionName === site.functionName && top.location.scriptId === scriptId &&
    top.location.lineNumber === site.lineNumber && top.location.columnNumber === site.columnNumber && top.functionLocation.scriptId === scriptId &&
    top.functionLocation.lineNumber === site.functionLine && top.functionLocation.columnNumber === site.functionColumn);
  let deleteCallerId: string | null = null; let uiCallerId: string | null = null;
  if (role === "entry") {
    const caller = event.callFrames[1]; need(caller !== undefined && caller.functionName === "deleteData" && caller.functionLocation.scriptId === scriptId &&
      caller.functionLocation.lineNumber === 109 && caller.functionLocation.columnNumber === 40_299 && caller.location.scriptId === scriptId && caller.location.lineNumber === 109 && caller.location.columnNumber === 40_416);
    deleteCallerId = caller.callFrameId;
  }
  if (role === "push") {
    need(event.callFrames.some(frame => frame.functionName === "qe" && frame.functionLocation.scriptId === scriptId && frame.functionLocation.lineNumber === 108 && frame.functionLocation.columnNumber === 9674) &&
      event.callFrames.some(frame => frame.functionName === "deleteString" && frame.functionLocation.scriptId === scriptId && frame.functionLocation.lineNumber === 109 && frame.functionLocation.columnNumber === 40_040));
  }
  if (role === "result") {
    const caller = event.callFrames.find(frame => frame.functionName === "onReceivedIGive" && frame.functionLocation.scriptId === scriptId && frame.functionLocation.lineNumber === 0 && frame.functionLocation.columnNumber === 11_387);
    need(caller !== undefined && caller.location.scriptId === scriptId && caller.location.lineNumber === 0 && caller.location.columnNumber === 11_589); uiCallerId = caller.callFrameId;
  }
  return Object.freeze({ frameId: top.callFrameId, uiCallerId, deleteCallerId });
}
