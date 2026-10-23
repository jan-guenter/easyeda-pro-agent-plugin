/** Fixed private startup wire vocabulary. No command text or caller-supplied
 * expression crosses the native boundary. Separate from diagnostic no-pause. */
import { z } from "zod";
import { types } from "node:util";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PCB_WORKER_CONSTRUCTION_IDENTITY, CURRENT_PCB_WORKER_CONSTRUCTION_PROJECT, CURRENT_PCB_WORKER_CONSTRUCTION_SAME,
  CURRENT_PCB_WORKER_CONSTRUCTION_SITES, CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE } from "./current-pcb-worker-construction-contract.ts";
import { CURRENT_PCB_WORKER_STARTUP_ATTACH } from "./current-pcb-worker-startup-contract.ts";
import type { CurrentPcbWorkerStartupCommand } from "./current-pcb-worker-startup-contract.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_CALLS } from "./current-pcb-worker-construction-assignment.ts";
import { CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION } from "./current-pcb-diagnostic-opening.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import { CURRENT_PCB_WORKER_STARTUP_UI_ACTOR_CLOCK_FUNCTION, CURRENT_PCB_WORKER_STARTUP_WORKER_ACTOR_CLOCK_FUNCTION } from "./current-pcb-worker-startup-actor.ts";
// oxlint-disable-next-line import/max-dependencies -- The native boundary must compare all fixed startup programs with their original contract literals in one encoder.
import { CURRENT_PCB_WORKER_STARTUP_CHANNEL_CALLS } from "./current-pcb-worker-startup-channel-observation.ts";

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
  z.object({ method: z.literal("Target.getTargets"), params: empty }).strict(),
  command("Page.getFrameTree", empty),
  command("DOM.getFrameOwner", z.object({ frameId: sessionId }).strict()),
  command("DOM.describeNode", z.object({ backendNodeId: z.number().int().min(1).max(2_147_483_647), depth: z.literal(0), pierce: z.literal(false) }).strict()),
  command("Runtime.callFunctionOn", z.object({ functionDeclaration: z.literal(CURRENT_PCB_WORKER_STARTUP_UI_ACTOR_CLOCK_FUNCTION),
    uniqueContextId: sessionId, arguments: z.tuple([]), returnByValue: z.literal(true), throwOnSideEffect: z.literal(true),
    silent: z.literal(true), awaitPromise: z.literal(false), generatePreview: z.literal(false), userGesture: z.literal(false) }).strict()),
  command("Runtime.callFunctionOn", z.object({ functionDeclaration: z.literal(CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION),
    uniqueContextId: sessionId, arguments: z.tuple([z.object({ value: currentDisposableOpenSealedTargetSchema }).strict(),
      z.object({ value: z.enum(["preflight", "open-project"]) }).strict()]),
    returnByValue: z.literal(true), awaitPromise: z.literal(true), silent: z.literal(true), generatePreview: z.literal(false),
    userGesture: z.literal(false), throwOnSideEffect: z.literal(false) }).strict()),
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
function plain(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !types.isProxy(value) && !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}
/** The fixed opener exceeds the generic reply text ceiling. Replace only its
 * exact own-data literal during inert capture, then restore it locally; caller
 * strings and the shared reply-capture limits are not broadened. */
function captureWire(raw: unknown): unknown {
  if (!plain(raw)) { return captureCurrentPcbStringClockReply(raw).value; }
  const params = Object.getOwnPropertyDescriptor(raw, "params");
  const original: unknown = params?.value;
  if (params === undefined || !Object.hasOwn(params, "value") || !plain(original)) { return captureCurrentPcbStringClockReply(raw).value; }
  const functionField = Object.getOwnPropertyDescriptor(original, "functionDeclaration");
  if (functionField === undefined || !Object.hasOwn(functionField, "value") || functionField.value !== CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION) {
    return captureCurrentPcbStringClockReply(raw).value;
  }
  const descriptors = Object.getOwnPropertyDescriptors(original);
  descriptors["functionDeclaration"] = { ...functionField, value: "fixed-startup-opening" };
  const outer = Object.getOwnPropertyDescriptors(raw);
  outer["params"] = { ...params, value: Object.create(null, descriptors) as unknown };
  const captured = captureCurrentPcbStringClockReply(Object.create(null, outer)).value;
  if (!plain(captured) || !plain(captured["params"])) { return fail(); }
  return { ...captured, params: { ...captured["params"], functionDeclaration: CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION } };
}

/** Decodes only inert own-data input before any schema/property inspection.
 * Native code independently reconstructs these phases from identifiers. */
export function currentPcbWorkerStartupWire(raw: unknown, id: number): Readonly<{
  command: CurrentPcbWorkerStartupCommand & Readonly<{ id: number }>;
  request: Readonly<Record<string, string | number>>;
}> {
  if (!Number.isSafeInteger(id) || id < 1 || id > CURRENT_PCB_WORKER_STARTUP_REQUEST_LIMIT) { return fail(); }
  const parsed = schema.parse(captureWire(raw));
  let fields: Record<string, string | number>;
  let action = "worker-startup-send";
  switch (parsed.method) {
    case "Target.getTargets": { action = "worker-startup-parent"; fields = { parentPhase: "targets" }; break; }
    case "Page.getFrameTree": { action = "worker-startup-parent"; fields = { parentPhase: "frames" }; break; }
    case "DOM.getFrameOwner": { action = "worker-startup-parent"; fields = { parentPhase: "frame-owner", frameId: parsed.params.frameId }; break; }
    case "DOM.describeNode": { action = "worker-startup-parent"; fields = { parentPhase: "describe-owner", backendNodeId: parsed.params.backendNodeId }; break; }
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
      if ("uniqueContextId" in parsed.params) {
        action = "worker-startup-parent";
        if (parsed.params.arguments.length === 0) {
          fields = { parentPhase: "actor-clock", uniqueContextId: parsed.params.uniqueContextId }; break;
        }
        const [target, phase] = parsed.params.arguments;
        fields = { parentPhase: phase.value, uniqueContextId: parsed.params.uniqueContextId,
          targetRawWindowsPath: target.value.rawWindowsPath, targetProjectUuid: target.value.projectUuid,
          targetBranchUuid: target.value.branchUuid, targetDocumentUuid: target.value.documentUuid,
          targetExpectedSourceSha256: target.value.expectedSourceSha256 };
        break;
      }
      const assignment = Object.entries(CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_CALLS)
        .find(([, value]) => value.program === parsed.params.functionDeclaration);
      const channel = Object.entries(CURRENT_PCB_WORKER_STARTUP_CHANNEL_CALLS)
        .find(([, value]) => value.program === parsed.params.functionDeclaration);
      if (channel !== undefined) {
        const [phase, expected] = channel;
        if (parsed.params.arguments.length !== expected.arguments || parsed.params.returnByValue !== expected.returnByValue) { return fail(); }
        fields = { startupPhase: `channel-${phase}`, objectId: parsed.params.objectId };
      } else if (assignment === undefined) {
        if (parsed.params.functionDeclaration !== CURRENT_PCB_WORKER_CONSTRUCTION_SAME && parsed.params.functionDeclaration !== CURRENT_PCB_WORKER_CONSTRUCTION_PROJECT &&
            parsed.params.functionDeclaration !== CURRENT_PCB_WORKER_CONSTRUCTION_IDENTITY && parsed.params.functionDeclaration !== CURRENT_PCB_WORKER_STARTUP_WORKER_ACTOR_CLOCK_FUNCTION ||
            parsed.params.arguments.length !== 1 || !parsed.params.returnByValue) { return fail(); }
        let phase = "identity";
        if (parsed.params.functionDeclaration === CURRENT_PCB_WORKER_CONSTRUCTION_SAME) { phase = "same"; }
        else if (parsed.params.functionDeclaration === CURRENT_PCB_WORKER_CONSTRUCTION_PROJECT) { phase = "project"; }
        else if (parsed.params.functionDeclaration === CURRENT_PCB_WORKER_STARTUP_WORKER_ACTOR_CLOCK_FUNCTION) { phase = "actor-clock"; }
        fields = { startupPhase: phase, objectId: parsed.params.objectId };
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
  return freezeDeep({ command: { id, ...parsed }, request: { action, requestId: id,
    method: parsed.method, ...(parsed.sessionId === undefined ? {} : { sessionId: parsed.sessionId }), ...fields } });
}
