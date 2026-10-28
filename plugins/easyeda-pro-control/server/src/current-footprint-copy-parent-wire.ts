/** Fixed parent construction and reciprocal diagnostic grammar. The native
 * owner chooses both original sessions; these requests carry only a realm. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_FOOTPRINT_PARENT_CONSTRUCTION_GROUP as GROUP, CURRENT_FOOTPRINT_PARENT_CONSTRUCTION_PROGRAMS as PROGRAMS } from "./current-footprint-copy-parent-construction-contract.ts";
import type { CurrentFootprintParentConstructionCommand } from "./current-footprint-copy-parent-construction-contract.ts";
import { CURRENT_FOOTPRINT_COPY_PARENT_WORKER_SITES as SITES } from "./current-footprint-copy-parent-worker-source.ts";
import { validateCurrentFootprintParentWorkerCommand } from "./current-footprint-copy-parent-worker-wire.ts";
import type { CurrentFootprintParentWorkerCommand } from "./current-footprint-copy-parent-worker-contract.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export type CurrentFootprintParentCommand = CurrentFootprintParentConstructionCommand | CurrentFootprintParentWorkerCommand;
export type CurrentFootprintParentCommandKind = "construction" | "peer";
const token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const session = token.max(128);
const object = z.object({ objectId: token }).strict();
const project = z.object({ value: z.string().regex(/^[a-f\d]{64}$/u) }).strict();
const tab = z.object({ value: z.string().regex(/^[A-Za-z\d_-]{1,128}$/u) }).strict();
const flags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false),
  returnByValue: z.literal(true), awaitPromise: z.literal(false), throwOnSideEffect: z.literal(true), userGesture: z.literal(false) };
/* oxlint-disable unicorn/max-nested-calls -- Keep exact native parameter envelopes beside each fixed source/phase. */
const construction = z.union([
  z.object({ phase: z.literal("source"), method: z.literal("Debugger.getScriptSource"), sessionId: session, params: z.object({ scriptId: token }).strict() }).strict(),
  ...(["before", "after"] as const).map(side => z.object({ phase: z.literal(`breakpoint-${side}`), method: z.literal("Debugger.setBreakpoint"), sessionId: session,
    params: z.object({ location: z.object({ scriptId: token, lineNumber: z.literal(SITES[side].lineNumber), columnNumber: z.literal(SITES[side].columnNumber) }).strict() }).strict() }).strict()),
  z.object({ phase: z.literal("remove"), method: z.literal("Debugger.removeBreakpoint"), sessionId: session, params: z.object({ breakpointId: token }).strict() }).strict(),
  z.object({ phase: z.literal("resume"), method: z.literal("Debugger.resume"), sessionId: session, params: z.object({}).strict() }).strict(),
  z.object({ phase: z.literal("release"), method: z.literal("Runtime.releaseObjectGroup"), sessionId: session, params: z.object({ objectGroup: z.literal(GROUP) }).strict() }).strict(),
  z.object({ phase: z.literal("receiver"), method: z.literal("Debugger.evaluateOnCallFrame"), sessionId: session,
    params: z.object({ callFrameId: token, expression: z.literal("this"), objectGroup: z.literal(GROUP), returnByValue: z.literal(false),
      silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), includeCommandLineAPI: z.literal(false) }).strict() }).strict(),
  z.object({ phase: z.literal("before"), method: z.literal("Runtime.callFunctionOn"), sessionId: session,
    params: z.object({ ...flags, objectId: token, functionDeclaration: z.literal(PROGRAMS.before), arguments: z.tuple([project, tab]) }).strict() }).strict(),
  z.object({ phase: z.literal("after"), method: z.literal("Runtime.callFunctionOn"), sessionId: session,
    params: z.object({ ...flags, objectId: token, functionDeclaration: z.literal(PROGRAMS.after), arguments: z.tuple([object, project, tab]) }).strict() }).strict(),
]);
/* oxlint-enable unicorn/max-nested-calls */
export function currentFootprintCopyParentWire(input: unknown, id: number, kind: CurrentFootprintParentCommandKind,
  originalParentSession: string, originalChildSession: string | null): Readonly<{
    command: CurrentFootprintParentCommand & Readonly<{ id: number }>;
    request: Readonly<Record<string, string | number>>;
  }> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647) { throw new Error("FOOTPRINT_PARENT_WIRE_ID"); }
  const command = kind === "construction" ? construction.parse(captureCurrentPcbStringClockReply(input).value) : validateCurrentFootprintParentWorkerCommand(input);
  let realm: "parent" | "child";
  if (command.sessionId === session.parse(originalParentSession)) { realm = "parent"; }
  else if (kind === "peer" && originalChildSession !== null && command.sessionId === session.parse(originalChildSession)) { realm = "child"; }
  else { throw new Error("FOOTPRINT_PARENT_WIRE_SESSION"); }
  if (kind === "peer" && command.phase !== "properties" && command.phase !== "release" &&
      (command.phase.startsWith("child") ? realm !== "child" : realm !== "parent")) { throw new Error("FOOTPRINT_PARENT_WIRE_REALM"); }
  const request: Record<string, string | number> = { action: "footprint-copy-parent", requestId: id, method: command.method, parentStage: `${kind}-${command.phase}`, realm };
  if (command.method === "Debugger.setBreakpoint") { request["scriptId"] = command.params.location.scriptId; }
  else if (command.method === "Debugger.getScriptSource") { request["scriptId"] = command.params.scriptId; }
  else if (command.method === "Debugger.removeBreakpoint") { request["breakpointId"] = command.params.breakpointId; }
  else if (command.method === "Debugger.evaluateOnCallFrame") { request["callFrameId"] = command.params.callFrameId; }
  else if (command.method === "Runtime.getProperties") { request["objectId"] = command.params.objectId; }
  else if (command.method === "Runtime.callFunctionOn") {
    if ("objectId" in command.params && command.params.objectId !== undefined) { request["objectId"] = command.params.objectId; }
    if ("uniqueContextId" in command.params && command.params.uniqueContextId !== undefined) { request["uniqueContextId"] = command.params.uniqueContextId; }
    for (const [index, argument] of command.params.arguments.entries()) {
      if ("objectId" in argument) { request[`arg${String(index)}ObjectId`] = argument.objectId; }
      else { request[`arg${String(index)}Value`] = argument.value; }
    }
  }
  return freezeDeep({ command: { ...command, id }, request });
}
