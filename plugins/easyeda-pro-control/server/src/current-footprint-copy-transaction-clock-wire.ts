/** Fixed transaction-clock grammar. The enclosing execution owner supplies its
 * original worker session; preparation and generic startup owners do not route
 * this action. No caller program, arbitrary breakpoint or clock call is accepted. */
import { z } from "zod";
import { CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_GROUP as GROUP, CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_RELATION as RELATION,
  CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_SITES as SITES } from "./current-footprint-copy-transaction-clock.ts";
import type { CurrentFootprintCopyTransactionClockCommand } from "./current-footprint-copy-transaction-clock.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const session = handle.max(128);
const object = z.object({ objectId: handle }).strict();
/* oxlint-disable unicorn/max-nested-calls -- Keep each exact CDP method, source literal and strict parameter envelope in one auditable schema. */
const schema = z.union([
  ...SITES.map(site => z.object({ method: z.literal("Debugger.setBreakpoint"), params: z.object({
    location: z.object({ scriptId: handle, lineNumber: z.literal(site.lineNumber), columnNumber: z.literal(site.columnNumber) }).strict(),
  }).strict() }).strict()),
  z.object({ method: z.literal("Debugger.removeBreakpoint"), params: z.object({ breakpointId: handle }).strict() }).strict(),
  z.object({ method: z.literal("Debugger.resume"), params: z.object({}).strict() }).strict(),
  z.object({ method: z.literal("Runtime.releaseObjectGroup"), params: z.object({ objectGroup: z.literal(GROUP) }).strict() }).strict(),
  ...SITES.map(site => z.object({ method: z.literal("Debugger.evaluateOnCallFrame"), params: z.object({ callFrameId: handle,
    expression: z.literal(site.expression), objectGroup: z.literal(GROUP), returnByValue: z.literal(false), silent: z.literal(true),
    throwOnSideEffect: z.literal(true), generatePreview: z.literal(false), includeCommandLineAPI: z.literal(false),
  }).strict() }).strict()),
  z.object({ method: z.literal("Runtime.callFunctionOn"), params: z.object({ objectId: handle,
    functionDeclaration: z.literal(RELATION), arguments: z.tuple([object, object]), objectGroup: z.literal(GROUP),
    returnByValue: z.literal(true), silent: z.literal(true), throwOnSideEffect: z.literal(true), generatePreview: z.literal(false),
    awaitPromise: z.literal(false), userGesture: z.literal(false),
  }).strict() }).strict(),
]);
/* oxlint-enable unicorn/max-nested-calls */

export function currentFootprintCopyTransactionClockWire(input: unknown, id: number, originalWorkerSession: string): Readonly<{
  command: CurrentFootprintCopyTransactionClockCommand & Readonly<{ id: number; sessionId: string }>;
  request: Readonly<Record<string, string | number>>;
}> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647) { throw new Error("FOOTPRINT_COPY_TRANSACTION_CLOCK_WIRE_ID"); }
  const sessionId = session.parse(originalWorkerSession);
  // The descriptor copier rejects getters, proxies and non-data objects before
  // Zod inspects nested fields or the native encoder sees the command.
  const command = schema.parse(captureCurrentPcbStringClockReply(input).value);
  const fields: Record<string, string | number> = { action: "footprint-copy-clock", requestId: id, method: command.method };
  if (command.method === "Debugger.setBreakpoint") {
    const site = SITES.find(candidate => candidate.columnNumber === command.params.location.columnNumber);
    if (site === undefined) { throw new Error("FOOTPRINT_COPY_TRANSACTION_CLOCK_WIRE_SITE"); }
    fields["clockPhase"] = `arm-${site.role}`; fields["scriptId"] = command.params.location.scriptId;
  } else if (command.method === "Debugger.evaluateOnCallFrame") {
    const site = SITES.find(candidate => candidate.expression === command.params.expression);
    if (site === undefined) { throw new Error("FOOTPRINT_COPY_TRANSACTION_CLOCK_WIRE_SITE"); }
    fields["clockPhase"] = `capture-${site.role}`; fields["callFrameId"] = command.params.callFrameId;
  } else if (command.method === "Debugger.removeBreakpoint") {
    fields["clockPhase"] = "remove"; fields["breakpointId"] = command.params.breakpointId;
  } else if (command.method === "Runtime.callFunctionOn") {
    fields["clockPhase"] = "relate"; fields["objectId"] = command.params.objectId;
    fields["sampleObjectId"] = command.params.arguments[0].objectId;
    fields["lexicalBundleObjectId"] = command.params.arguments[1].objectId;
  } else { fields["clockPhase"] = command.method === "Debugger.resume" ? "resume" : "release"; }
  return freezeDeep({ command: { ...command, id, sessionId }, request: fields });
}
