/** Additional fixed worker commands for the separate original copy owner.
 * Existing preparation grammar neither admits these sites nor selects them. */
import { z } from "zod";
import { types } from "node:util";
import { CURRENT_FOOTPRINT_COPY_ASYNC_CALLS } from "./current-footprint-copy-async-bindings.ts";
import { CURRENT_FOOTPRINT_COPY_DESTINATION_CALLS } from "./current-footprint-copy-destination-bindings.ts";
import { CURRENT_FOOTPRINT_COPY_CONSTRUCTION_SITES, CURRENT_FOOTPRINT_COPY_PARSER_CONSTRUCTION_CALLS } from "./current-footprint-copy-parser-construction.ts";
import { CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE } from "./current-pcb-worker-construction-contract.ts";
import type { CurrentPcbWorkerStartupCommand } from "./current-pcb-worker-startup-contract.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_COPY_EXECUTION_WORKER_CALLS = freezeDeep({
  "parser-head": CURRENT_FOOTPRINT_COPY_PARSER_CONSTRUCTION_CALLS.head,
  "parser-change": CURRENT_FOOTPRINT_COPY_PARSER_CONSTRUCTION_CALLS.change,
  "parser-registered": CURRENT_FOOTPRINT_COPY_PARSER_CONSTRUCTION_CALLS.registered,
  "async-capture": CURRENT_FOOTPRINT_COPY_ASYNC_CALLS.captureRegistered,
  "async-recheck": CURRENT_FOOTPRINT_COPY_ASYNC_CALLS.recheck,
  "async-upload": CURRENT_FOOTPRINT_COPY_ASYNC_CALLS.captureConstructedUpload,
  "async-sample": CURRENT_FOOTPRINT_COPY_ASYNC_CALLS.sample,
  "destination-capture": CURRENT_FOOTPRINT_COPY_DESTINATION_CALLS.capture,
  "destination-recheck": CURRENT_FOOTPRINT_COPY_DESTINATION_CALLS.recheck,
});
export const CURRENT_FOOTPRINT_COPY_EXECUTION_WORKER_SITES = freezeDeep({
  "parser-head-arm": CURRENT_FOOTPRINT_COPY_CONSTRUCTION_SITES.parserHead,
  "parser-change-arm": CURRENT_FOOTPRINT_COPY_CONSTRUCTION_SITES.parserChange,
});
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), session = handle.max(128);
const object = z.object({ objectId: handle }).strict();
/* oxlint-disable unicorn/max-nested-calls -- Keep each fixed source literal, exact argument count and immutable CDP parameter envelope together. */
const schema = z.union([
  ...Object.values(CURRENT_FOOTPRINT_COPY_EXECUTION_WORKER_SITES).map(site => z.object({ method: z.literal("Debugger.setBreakpoint"),
    sessionId: session, params: z.object({ location: z.object({ scriptId: handle, lineNumber: z.literal(site.lineNumber),
      columnNumber: z.literal(site.columnNumber) }).strict() }).strict() }).strict()),
  ...Object.values(CURRENT_FOOTPRINT_COPY_EXECUTION_WORKER_CALLS).map(call => z.object({ method: z.literal("Runtime.callFunctionOn"),
    sessionId: session, params: z.object({ objectId: handle, functionDeclaration: z.literal(call.program),
      arguments: z.array(object).length(call.arguments), objectGroup: z.literal(CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE.group),
      silent: z.literal(true), returnByValue: z.literal(call.returnByValue), generatePreview: z.literal(false),
      throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) }).strict() }).strict()),
]);
/* oxlint-enable unicorn/max-nested-calls */
function own(value: unknown, name: string): unknown {
  if (value === null || typeof value !== "object" || types.isProxy(value) ||
    Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) { throw new Error("FOOTPRINT_COPY_EXECUTION_WORKER_DATA"); }
  const descriptor = Object.getOwnPropertyDescriptor(value, name);
  if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { throw new Error("FOOTPRINT_COPY_EXECUTION_WORKER_DATA"); }
  return descriptor.value as unknown;
}
/** Old opening/source literals have their own bounded large-text capture.
 * Match only these extra cases before using the smaller generic reply copier. */
function additional(raw: unknown): boolean {
  const method = own(raw, "method");
  if (method === "Runtime.callFunctionOn") {
    const source = own(own(raw, "params"), "functionDeclaration");
    return Object.values(CURRENT_FOOTPRINT_COPY_EXECUTION_WORKER_CALLS).some(call => call.program === source);
  }
  if (method !== "Debugger.setBreakpoint") { return false; }
  const location = own(own(raw, "params"), "location");
  const columnNumber = own(location, "columnNumber"), lineNumber = own(location, "lineNumber");
  return Object.values(CURRENT_FOOTPRINT_COPY_EXECUTION_WORKER_SITES).some(site => site.lineNumber === lineNumber && site.columnNumber === columnNumber);
}
export function currentFootprintCopyExecutionWorkerWire(raw: unknown, id: number): Readonly<{
  command: CurrentPcbWorkerStartupCommand & Readonly<{ id: number }>;
  request: Readonly<Record<string, string | number>>;
}> | null {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647) { throw new Error("FOOTPRINT_COPY_EXECUTION_WORKER_ID"); }
  if (!additional(raw)) { return null; }
  const parsed = schema.safeParse(captureCurrentPcbStringClockReply(raw).value);
  if (!parsed.success) { return null; }
  const command = parsed.data;
  const request: Record<string, string | number> = { action: "footprint-copy-worker", requestId: id, method: command.method };
  if (command.method === "Debugger.setBreakpoint") {
    const selected = Object.entries(CURRENT_FOOTPRINT_COPY_EXECUTION_WORKER_SITES).find(([, site]) =>
      site.lineNumber === command.params.location.lineNumber && site.columnNumber === command.params.location.columnNumber);
    if (selected === undefined) { throw new Error("FOOTPRINT_COPY_EXECUTION_WORKER_SITE"); }
    request["executionPhase"] = selected[0]; request["scriptId"] = command.params.location.scriptId;
  } else {
    const selected = Object.entries(CURRENT_FOOTPRINT_COPY_EXECUTION_WORKER_CALLS).find(([, call]) => call.program === command.params.functionDeclaration);
    if (selected === undefined) { throw new Error("FOOTPRINT_COPY_EXECUTION_WORKER_CALL"); }
    request["executionPhase"] = selected[0]; request["objectId"] = command.params.objectId;
    for (const [index, argument] of command.params.arguments.entries()) { request[`arg${String(index)}ObjectId`] = argument.objectId; }
  }
  return freezeDeep({ command: { ...command, id }, request });
}
