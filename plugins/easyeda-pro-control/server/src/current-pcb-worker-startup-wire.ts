/** Fixed private startup wire vocabulary. No command text or caller-supplied
 * expression crosses the native boundary. Separate from diagnostic no-pause. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PCB_WORKER_CONSTRUCTION_PROJECT, CURRENT_PCB_WORKER_CONSTRUCTION_SAME,
  CURRENT_PCB_WORKER_CONSTRUCTION_SITES, CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE } from "./current-pcb-worker-construction-contract.ts";
import { CURRENT_PCB_WORKER_STARTUP_ATTACH } from "./current-pcb-worker-startup-contract.ts";
import type { CurrentPcbWorkerStartupCommand } from "./current-pcb-worker-startup-contract.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_CALLS } from "./current-pcb-worker-construction-assignment.ts";

export const CURRENT_PCB_WORKER_STARTUP_REQUEST_LIMIT = 256;
const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const sessionId = handle.max(128);
const group = z.literal(CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE.group);
const empty = z.object({}).strict();
const objectArgument = z.object({ objectId: handle }).strict();
const command = <Method extends CurrentPcbWorkerStartupCommand["method"], Params extends z.ZodType>(method: Method, params: Params):
  z.ZodObject<{ method: z.ZodLiteral<Method>; params: Params; sessionId: typeof sessionId }, z.core.$strict> =>
  z.object({ method: z.literal(method), params, sessionId }).strict();
/* oxlint-disable unicorn/max-nested-calls -- Keep each exact protocol shape together in this declarative schema union. */
const schema: z.ZodType<CurrentPcbWorkerStartupCommand> = z.union([
  command("Target.setAutoAttach", z.object({ autoAttach: z.literal(true), waitForDebuggerOnStart: z.literal(true),
    flatten: z.literal(true), filter: z.tuple([z.object({ type: z.literal("worker"), exclude: z.literal(false) }).strict(),
      z.object({ exclude: z.literal(true) }).strict()]) }).strict()),
  command("Runtime.enable", empty), command("Runtime.runIfWaitingForDebugger", empty),
  command("Debugger.enable", z.object({ maxScriptsCacheSize: z.literal(33_554_432) }).strict()),
  command("Debugger.setInstrumentationBreakpoint", z.object({ instrumentation: z.literal("beforeScriptExecution") }).strict()),
  command("Debugger.getScriptSource", z.object({ scriptId: handle }).strict()),
  command("Debugger.setBreakpoint", z.object({ location: z.object({ scriptId: handle,
    lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict() }).strict()),
  command("Debugger.removeBreakpoint", z.object({ breakpointId: handle }).strict()),
  command("Debugger.resume", empty),
  command("Debugger.evaluateOnCallFrame", z.object({ callFrameId: handle,
    expression: z.enum(["this", "e", "t", "this.bc", "this.bc.onmessage"]), objectGroup: group,
    silent: z.literal(true), returnByValue: z.literal(false), generatePreview: z.literal(false),
    throwOnSideEffect: z.literal(true), includeCommandLineAPI: z.literal(false) }).strict()),
  command("Runtime.getProperties", z.object({ objectId: handle, ownProperties: z.literal(true), generatePreview: z.literal(false) }).strict()),
  command("Runtime.callFunctionOn", z.object({ objectId: handle,
    functionDeclaration: z.string().max(16_384),
    arguments: z.array(objectArgument).max(5), objectGroup: group, silent: z.literal(true), returnByValue: z.boolean(),
    generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) }).strict()),
  command("Runtime.releaseObjectGroup", z.object({ objectGroup: group }).strict()),
]);
/* oxlint-enable unicorn/max-nested-calls */
function fail(): never { throw new Error("PCB_WORKER_STARTUP_WIRE"); }

/** Decodes only inert own-data input before any schema/property inspection.
 * Native code independently reconstructs these phases from identifiers. */
export function currentPcbWorkerStartupWire(raw: unknown, id: number): Readonly<{
  command: CurrentPcbWorkerStartupCommand & Readonly<{ id: number }>;
  request: Readonly<Record<string, string | number>>;
}> {
  if (!Number.isSafeInteger(id) || id < 1 || id > CURRENT_PCB_WORKER_STARTUP_REQUEST_LIMIT) { return fail(); }
  const parsed = schema.parse(captureCurrentPcbStringClockReply(raw).value);
  let fields: Record<string, string | number>;
  switch (parsed.method) {
    case "Target.setAutoAttach": {
      if (JSON.stringify(parsed.params) !== JSON.stringify(CURRENT_PCB_WORKER_STARTUP_ATTACH)) { return fail(); }
      fields = { startupPhase: "attach" }; break;
    }
    case "Runtime.enable": { fields = { startupPhase: "runtime" }; break; }
    case "Debugger.enable": { fields = { startupPhase: "debugger" }; break; }
    case "Debugger.setInstrumentationBreakpoint": { fields = { startupPhase: "instrument" }; break; }
    case "Runtime.runIfWaitingForDebugger": { fields = { startupPhase: "start" }; break; }
    case "Debugger.getScriptSource": { fields = { startupPhase: "source", scriptId: parsed.params.scriptId }; break; }
    case "Debugger.removeBreakpoint": { fields = { startupPhase: "remove", breakpointId: parsed.params.breakpointId }; break; }
    case "Debugger.resume": { fields = { startupPhase: "resume" }; break; }
    case "Debugger.setBreakpoint": {
      const site = Object.entries(CURRENT_PCB_WORKER_CONSTRUCTION_SITES).find(([, value]) =>
        value.lineNumber === parsed.params.location.lineNumber && value.columnNumber === parsed.params.location.columnNumber)?.[0];
      if (site === undefined) { return fail(); }
      fields = { startupPhase: "breakpoint", site, scriptId: parsed.params.location.scriptId }; break;
    }
    case "Debugger.evaluateOnCallFrame": {
      const selector = { this: "receiver", e: "argument-e", t: "argument-t", "this.bc": "channel", "this.bc.onmessage": "onmessage" }[parsed.params.expression];
      fields = { startupPhase: "select", selector, callFrameId: parsed.params.callFrameId }; break;
    }
    case "Runtime.getProperties": { fields = { startupPhase: "properties", objectId: parsed.params.objectId }; break; }
    case "Runtime.callFunctionOn": {
      const assignment = Object.entries(CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_CALLS)
        .find(([, value]) => value.program === parsed.params.functionDeclaration);
      if (assignment === undefined) {
        if (parsed.params.functionDeclaration !== CURRENT_PCB_WORKER_CONSTRUCTION_SAME && parsed.params.functionDeclaration !== CURRENT_PCB_WORKER_CONSTRUCTION_PROJECT ||
            parsed.params.arguments.length !== 1 || !parsed.params.returnByValue) { return fail(); }
        fields = { startupPhase: parsed.params.functionDeclaration === CURRENT_PCB_WORKER_CONSTRUCTION_SAME ? "same" : "project", objectId: parsed.params.objectId };
      } else {
        const [phase, expected] = assignment;
        if (parsed.params.arguments.length !== expected.arguments || parsed.params.returnByValue !== expected.returnByValue) { return fail(); }
        fields = { startupPhase: `assignment-${phase}`, objectId: parsed.params.objectId };
      }
      for (const [index, value] of parsed.params.arguments.entries()) { fields[`argument${index}`] = value.objectId; }
      break;
    }
    case "Runtime.releaseObjectGroup": { fields = { startupPhase: "release" }; break; }
    default: { return fail(); }
  }
  return freezeDeep({ command: { id, ...parsed }, request: { action: "worker-startup-send", requestId: id,
    method: parsed.method, sessionId: parsed.sessionId, ...fields } });
}
