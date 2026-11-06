/** New-purpose worker codec. It adds only exact observation sites/programs to
 * the existing209 construction prefix; no program text crosses native stdin. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE } from "./current-pcb-worker-construction-contract.ts";
import { currentPcb209WorkerStartupWire } from "./current-pcb-worker-startup-wire.ts";
import { CURRENT_PROJECT_STRUCTURE_NATIVE_PROFILE as PROFILE } from "./current-project-structure-native-profile.ts";
import { CURRENT_PROJECT_STRUCTURE_WORKER_SITES as SITES } from "./current-project-structure-worker-profile.ts";
import { CURRENT_PROJECT_STRUCTURE_WORKER_CALLS as CALLS } from "./current-project-structure-worker-programs.ts";
import { CURRENT_FOOTPRINT_COLD_PRODUCER_CALLS as COLD } from "./current-footprint-cold-producer-roster.ts";
import { CURRENT_FOOTPRINT_HEAD_CACHE_CONDITION as CONDITION, CURRENT_FOOTPRINT_DETACHED_CACHE_SITES,
  CURRENT_FOOTPRINT_DETACHED_CACHE_CALLS as DETACHED, CURRENT_FOOTPRINT_DETACHED_CACHE_GROUP as DETACHED_GROUP,
  CURRENT_FOOTPRINT_DETACHED_CACHE_EXPRESSION as EXPRESSION, CURRENT_FOOTPRINT_HEAD_CACHE_CALLS as HEAD,
  CURRENT_FOOTPRINT_HEAD_CACHE_EXPRESSION as HEAD_EXPRESSION } from "./current-footprint-detached-cache-profile.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const argument = z.object({ objectId: handle }).strict();
const group = CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE.group;
const sites = Object.freeze({ ...SITES, ...Object.fromEntries(Object.entries(CURRENT_FOOTPRINT_DETACHED_CACHE_SITES).map(([name, site]) => [`detached-${name}`, site])) });
const programs = Object.freeze({ ...CALLS, "cold-project": COLD.project, "cold-stream": COLD.stream, "cold-cooperation": COLD.cooperation,
  "detached-admit": DETACHED.admit, "detached-matches": DETACHED.matches, "head-admit": HEAD.admit, "head-matches": HEAD.matches,
  "head-retain": HEAD.retain, "head-barrier": HEAD.barrier });
const programNames = Object.keys(programs);
/* oxlint-disable unicorn/max-nested-calls -- Keep each strict fixed inspector shape together; parsed objects are copied before entering the schema. */
const schema = z.discriminatedUnion("method", [
  z.object({ sessionId: handle.max(128), method: z.literal("Debugger.setBreakpoint"), params: z.object({ location: z.object({
    scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict(), condition: z.literal(CONDITION).optional() }).strict() }).strict(),
  z.object({ sessionId: handle.max(128), method: z.literal("Runtime.callFunctionOn"), params: z.object({ objectId: handle,
    functionDeclaration: z.string().max(8192), arguments: z.array(argument).max(7), objectGroup: z.enum([group, DETACHED_GROUP]), returnByValue: z.boolean(),
    silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) }).strict() }).strict(),
  z.object({ sessionId: handle.max(128), method: z.literal("Debugger.evaluateOnCallFrame"), params: z.object({ callFrameId: handle,
    expression: z.enum([EXPRESSION, HEAD_EXPRESSION]), objectGroup: z.literal(DETACHED_GROUP), silent: z.literal(true), returnByValue: z.literal(false),
    generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), includeCommandLineAPI: z.literal(false) }).strict() }).strict(),
  z.object({ sessionId: handle.max(128), method: z.literal("Runtime.releaseObjectGroup"), params: z.object({ objectGroup: z.literal(DETACHED_GROUP) }).strict() }).strict(),
]);
/* oxlint-enable unicorn/max-nested-calls */
/** Validate the fixed additional observation grammar. Return null only when
 * the input belongs to the separate unchanged construction prefix. */
export function currentProjectStructureWorkerWire(input: unknown, id: number): ReturnType<typeof currentPcb209WorkerStartupWire> {
  if (!Number.isSafeInteger(id) || id < 1 || id > PROFILE.worker.total) { throw new Error("PROJECT_STRUCTURE_WORKER_WIRE_ID"); }
  const captured = captureCurrentPcbStringClockReply(input).value;
  const candidate = schema.safeParse(captured);
  if (candidate.success) {
    const command = candidate.data;
    const request: Record<string, string | number> = { action: "structure-worker-send", requestId: id, method: command.method, sessionId: command.sessionId };
    if (command.method === "Debugger.setBreakpoint") {
      const site = Object.entries(sites).find(([, point]) => command.params.location.lineNumber === point.lineNumber && command.params.location.columnNumber === point.columnNumber);
      if (site !== undefined) {
        if (command.params.condition !== (site[0].startsWith("detached-head") ? CONDITION : undefined)) { throw new Error("PROJECT_STRUCTURE_WORKER_WIRE_CONDITION"); }
        request["phase"] = `site-${site[0]}`; request["scriptId"] = command.params.location.scriptId;
        const params = { location: command.params.location, ...(command.params.condition === undefined ? {} : { condition: command.params.condition }) };
        return freezeDeep({ command: { ...command, params, id }, request }); }
    } else if (command.method === "Debugger.evaluateOnCallFrame") {
      request["phase"] = command.params.expression === HEAD_EXPRESSION ? "head-frame" : "detached-frame"; request["callFrameId"] = command.params.callFrameId; return freezeDeep({ command: { ...command, id }, request });
    } else if (command.method === "Runtime.releaseObjectGroup") {
      request["phase"] = "detached-release"; return freezeDeep({ command: { ...command, id }, request });
    } else {
      const selected = programNames.find(name => Reflect.get(programs, name) === command.params.functionDeclaration);
      if (selected !== undefined) {
        let count = 0;
        if (selected === "pristine") { count = 7; }
        else if (selected === "detached-admit" || selected === "head-admit") { count = 1; }
        else if (selected === "detached-matches" || selected === "head-matches") { count = 2; }
        else if (selected === "cold-stream" || selected === "cold-cooperation") { count = 3; }
        else if (["packet", "debounce", "taskRemoved", "callbackKind"].includes(selected)) { count = 2; }
        else if (["same", "serial"].includes(selected)) { count = 1; }
        const byValue = ["pristine", "same", "success", "taskRemoved", "packetText", "callbackKind", "cold-project", "cold-stream", "cold-cooperation", "detached-admit", "detached-matches", "head-admit", "head-matches", "head-barrier"].includes(selected);
        if (command.params.arguments.length !== count || command.params.returnByValue !== byValue || command.params.objectGroup !== (selected.startsWith("detached-") || selected.startsWith("head-") ? DETACHED_GROUP : group)) { throw new Error("PROJECT_STRUCTURE_WORKER_WIRE_SHAPE"); }
        request["phase"] = `call-${selected}`; request["objectId"] = command.params.objectId;
        for (const [index, arg] of command.params.arguments.entries()) { request[`argument${String(index)}`] = arg.objectId; }
        return freezeDeep({ command: { ...command, id }, request });
      }
    }
  }
  // Reuse only the original bounded grammar; enlarge this new birth's counter
  // Without changing the legacy encoder or accepting its rejected commands.
  const original = currentPcb209WorkerStartupWire(captured, 1);
  return freezeDeep({ command: { ...original.command, id }, request: { ...original.request, requestId: id } });
}
