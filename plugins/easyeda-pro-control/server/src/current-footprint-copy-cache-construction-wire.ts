/** Closed vocabulary for the original writer's cache construction pauses.
 * Each command is fixed data; session selection remains with its channel. */
import { z } from "zod";
import { CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_CALLS as CALLS, CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_GROUP as GROUP,
  CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_SITES as SITES } from "./current-footprint-copy-cache-construction-contract.ts";
import type { CurrentFootprintCacheConstructionCommand } from "./current-footprint-copy-cache-construction-contract.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export type CurrentFootprintCacheConstructionChannelCommand = CurrentFootprintCacheConstructionCommand & Readonly<{ phase: "cache-construction"; sessionId: string }>;
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}(?![\s\S])/u), project = z.string().regex(/^[a-f\d]{64}(?![\s\S])/u);
const object = z.object({ objectId: handle }).strict(), path = z.object({ value: project }).strict();
const nil = z.object({ value: z.null() }).strict(), one = z.object({ value: z.literal(1) }).strict(), zero = z.object({ value: z.literal(0) }).strict();
const empty = z.object({}).strict();
const wrapped = <M extends CurrentFootprintCacheConstructionCommand["method"], P extends z.ZodType>(method: M, params: P):
  z.ZodObject<{ phase: z.ZodLiteral<"cache-construction">; sessionId: typeof handle; method: z.ZodLiteral<M>; params: P }, z.core.$strict> =>
  z.object({ phase: z.literal("cache-construction"), sessionId: handle.max(128), method: z.literal(method), params }).strict();
type Argument = Readonly<{ objectId: string } | { value: string | number | null }>;
const call = (role: keyof typeof CALLS, args: z.ZodType<readonly Argument[]>):
  z.ZodType<Extract<CurrentFootprintCacheConstructionChannelCommand, { method: "Runtime.callFunctionOn" }>> => wrapped("Runtime.callFunctionOn", z.object({ objectId: handle,
  functionDeclaration: z.literal(CALLS[role].program), arguments: args, objectGroup: z.literal(GROUP),
  returnByValue: z.literal(CALLS[role].returnByValue), silent: z.literal(true), generatePreview: z.literal(false),
  throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) }).strict());
// oxlint-disable unicorn/max-nested-calls -- Each entry keeps its exact literal, ordinal and parameter tuple together at the native grammar boundary.
const cases = [
  ...SITES.map(site => ({ phase: `arm-${site.role}`, schema: wrapped("Debugger.setBreakpoint", z.object({ location: z.object({
    scriptId: handle, lineNumber: z.literal(site.lineNumber), columnNumber: z.literal(site.columnNumber) }).strict() }).strict()) })),
  { phase: "remove", schema: wrapped("Debugger.removeBreakpoint", z.object({ breakpointId: handle }).strict()) },
  { phase: "resume", schema: wrapped("Debugger.resume", empty) },
  { phase: "select", schema: wrapped("Debugger.evaluateOnCallFrame", z.object({ callFrameId: handle, expression: z.literal("this"), objectGroup: z.literal(GROUP),
    returnByValue: z.literal(false), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), includeCommandLineAPI: z.literal(false) }).strict()) },
  { phase: "properties", schema: wrapped("Runtime.getProperties", z.object({ objectId: handle, ownProperties: z.literal(true),
    accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }).strict()) },
  { phase: "before-first", schema: call("before", z.tuple([path, zero, nil])) },
  { phase: "before-second", schema: call("before", z.tuple([path, one, object])) },
  { phase: "bind-first", schema: call("bind", z.tuple([path, zero])) },
  { phase: "bind-second", schema: call("bind", z.tuple([path, one])) },
  { phase: "after-first", schema: call("after", z.tuple([object, path, zero])) },
  { phase: "after-second", schema: call("after", z.tuple([object, path, one])) },
  { phase: "join", schema: call("join", z.tuple([object, object, path])) },
  { phase: "release", schema: wrapped("Runtime.releaseObjectGroup", z.object({ objectGroup: z.literal(GROUP) }).strict()) },
] as const;
// oxlint-enable unicorn/max-nested-calls
const schema: z.ZodType<CurrentFootprintCacheConstructionChannelCommand> = z.union(cases.map(entry => entry.schema));
export function currentFootprintCacheConstructionWire(raw: unknown, id: number): Readonly<{
  command: CurrentFootprintCacheConstructionChannelCommand & Readonly<{ id: number }>;
  request: Readonly<Record<string, string | number>>;
}> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647) { throw new Error("FOOTPRINT_CACHE_CONSTRUCTION_REQUEST_ID"); }
  const captured = captureCurrentPcbStringClockReply(raw).value;
  const selected = cases.find(entry => entry.schema.safeParse(captured).success);
  if (selected === undefined) { throw new Error("FOOTPRINT_CACHE_CONSTRUCTION_WIRE"); }
  // Every strict case above is one branch of the internal command contract;
  // The complete typed union independently checks the discriminator shapes.
  const command = schema.parse(captured), request: Record<string, string | number> = {
    action: "footprint-cache-construction", requestId: id, method: command.method, cachePhase: selected.phase,
  };
  switch (command.method) {
    case "Debugger.setBreakpoint": { request["scriptId"] = command.params.location.scriptId; break; }
    case "Debugger.removeBreakpoint": { request["breakpointId"] = command.params.breakpointId; break; }
    case "Debugger.evaluateOnCallFrame": { request["callFrameId"] = command.params.callFrameId; break; }
    case "Runtime.getProperties": { request["objectId"] = command.params.objectId; break; }
    case "Runtime.callFunctionOn": {
      request["objectId"] = command.params.objectId;
      for (const [index, argument] of command.params.arguments.entries()) {
        if ("objectId" in argument) { request[`arg${String(index)}ObjectId`] = argument.objectId; }
        else if (typeof argument.value === "string") { request["projectUuid"] = argument.value; }
      }
      break;
    }
    case "Debugger.resume": case "Runtime.releaseObjectGroup": { break; }
    default: { throw new Error("FOOTPRINT_CACHE_CONSTRUCTION_WIRE"); }
  }
  return freezeDeep({ command: { ...command, id }, request });
}
