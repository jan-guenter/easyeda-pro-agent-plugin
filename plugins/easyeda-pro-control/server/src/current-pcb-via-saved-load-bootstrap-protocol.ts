/** Distinct readonly cold-loading grammar. No writer, arbitrary code, worker
 * selector or final project-script continuation is represented. */
import { z } from "zod";
import { CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES as ROLES } from "./current-pcb-209-worker-bootstrap-source.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const empty = z.strictObject({}), handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const asyncParams = z.strictObject({ maxDepth: z.literal(32) }), debuggerParams = z.strictObject({ maxScriptsCacheSize: z.literal(33_554_432) });
const bypassParams = z.strictObject({ bypass: z.literal(true) }), cacheParams = z.strictObject({ cacheDisabled: z.literal(true) });
const instrumentParams = z.strictObject({ instrumentation: z.literal("beforeScriptExecution") }), resumeRoles = ROLES.filter(role => role !== "project");
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("saved-load-runtime"), method: z.literal("Runtime.enable"), params: empty }),
  z.strictObject({ phase: z.literal("saved-load-debugger"), method: z.literal("Debugger.enable"), params: debuggerParams }),
  z.strictObject({ phase: z.literal("saved-load-async"), method: z.literal("Debugger.setAsyncCallStackDepth"), params: asyncParams }),
  z.strictObject({ phase: z.literal("saved-load-network"), method: z.literal("Network.enable"), params: empty }),
  z.strictObject({ phase: z.literal("saved-load-http-cache"), method: z.literal("Network.setCacheDisabled"), params: cacheParams }),
  z.strictObject({ phase: z.literal("saved-load-service-worker"), method: z.literal("Network.setBypassServiceWorker"), params: bypassParams }),
  z.strictObject({ phase: z.literal("saved-load-instrument"), method: z.literal("Debugger.setInstrumentationBreakpoint"), params: instrumentParams }),
  z.strictObject({ phase: z.literal("saved-load-run-browser"), method: z.literal("Runtime.runIfWaitingForDebugger"), params: empty }),
  z.strictObject({ phase: z.literal("saved-load-run-page"), method: z.literal("Runtime.runIfWaitingForDebugger"), params: empty }),
  z.strictObject({ phase: z.literal("saved-load-source"), role: z.enum(ROLES), method: z.literal("Debugger.getScriptSource"), params: z.strictObject({ scriptId: handle }) }),
  z.strictObject({ phase: z.literal("saved-load-resume"), role: z.enum(resumeRoles), method: z.literal("Debugger.resume"), params: empty }),
]);
export type CurrentPcbViaSavedLoadBootstrapCommand = z.infer<typeof schema>;
export function validateCurrentPcbViaSavedLoadBootstrapCommand(input: unknown): CurrentPcbViaSavedLoadBootstrapCommand {
  return freezeDeep(schema.parse(captureCurrentPcbStringClockReply(input).value));
}
/** Runtime/debugger/async, scoped network policy3, instrumentation, both actual
 * waiting attachments, seven source reads and six initial continuations. The
 * project remains paused; its later continuation/removal reserve is separate. */
export const CURRENT_PCB_VIA_SAVED_LOAD_BOOTSTRAP_REQUESTS = Object.freeze({
  normal: 2 + 1 + 3 + 1 + 2 + ROLES.length, initialContinuations: ROLES.length - 1,
  projectRemainsHeld: true, totalUntilProjectHeld: 2 + 1 + 3 + 1 + 2 + 2 * ROLES.length - 1,
});
export function currentPcbViaSavedLoadBootstrapCases(): readonly CurrentPcbViaSavedLoadBootstrapCommand[] {
  const result: CurrentPcbViaSavedLoadBootstrapCommand[] = [
    { phase: "saved-load-runtime", method: "Runtime.enable", params: {} },
    { phase: "saved-load-debugger", method: "Debugger.enable", params: { maxScriptsCacheSize: 33_554_432 } },
    { phase: "saved-load-async", method: "Debugger.setAsyncCallStackDepth", params: { maxDepth: 32 } },
    { phase: "saved-load-network", method: "Network.enable", params: {} },
    { phase: "saved-load-http-cache", method: "Network.setCacheDisabled", params: { cacheDisabled: true } },
    { phase: "saved-load-service-worker", method: "Network.setBypassServiceWorker", params: { bypass: true } },
    { phase: "saved-load-instrument", method: "Debugger.setInstrumentationBreakpoint", params: { instrumentation: "beforeScriptExecution" } },
    { phase: "saved-load-run-browser", method: "Runtime.runIfWaitingForDebugger", params: {} },
    { phase: "saved-load-run-page", method: "Runtime.runIfWaitingForDebugger", params: {} },
  ];
  for (const role of ROLES) { result.push({ phase: "saved-load-source", role, method: "Debugger.getScriptSource", params: { scriptId: "saved_load_scriptId" } });
    if (role !== "project") { result.push({ phase: "saved-load-resume", role, method: "Debugger.resume", params: {} }); } }
  return freezeDeep(result);
}
