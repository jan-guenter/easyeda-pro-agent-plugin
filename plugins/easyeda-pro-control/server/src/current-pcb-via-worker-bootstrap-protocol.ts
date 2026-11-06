/** Fixed cold worker bootstrap vocabulary for the distinct original Via birth.
 * Pure source qualifiers are shared; no existing worker lease is transferable. */
import { z } from "zod";
import { CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES as ROLES } from "./current-pcb-209-worker-bootstrap-source.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
export const CURRENT_PCB_VIA_WORKER_PARENT_PARAMS = Object.freeze({ autoAttach: true, waitForDebuggerOnStart: true, flatten: true,
  filter: Object.freeze([Object.freeze({ type: "worker", exclude: false }), Object.freeze({ exclude: true })]) } as const);
export const CURRENT_PCB_VIA_WORKER_RUNNING_PARAMS = Object.freeze({ ...CURRENT_PCB_VIA_WORKER_PARENT_PARAMS, waitForDebuggerOnStart: false } as const);
const debuggerParams = z.strictObject({ maxScriptsCacheSize: z.literal(33_554_432) });
const asyncParams = z.strictObject({ maxDepth: z.literal(32) });
const instrumentationParams = z.strictObject({ instrumentation: z.literal("beforeScriptExecution") });
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("via-worker-runtime"), method: z.literal("Runtime.enable"), params: z.strictObject({}) }),
  z.strictObject({ phase: z.literal("via-worker-debugger"), method: z.literal("Debugger.enable"), params: debuggerParams }),
  z.strictObject({ phase: z.literal("via-worker-async"), method: z.literal("Debugger.setAsyncCallStackDepth"), params: asyncParams }),
  z.strictObject({ phase: z.literal("via-worker-instrument"), method: z.literal("Debugger.setInstrumentationBreakpoint"), params: instrumentationParams }),
  z.strictObject({ phase: z.literal("via-worker-run-waiting"), method: z.literal("Runtime.runIfWaitingForDebugger"), params: z.strictObject({}) }),
  z.strictObject({ phase: z.literal("via-worker-source"), role: z.enum(ROLES), method: z.literal("Debugger.getScriptSource"), params: z.strictObject({ scriptId: handle }) }),
  z.strictObject({ phase: z.literal("via-worker-remove"), method: z.literal("Debugger.removeBreakpoint"), params: z.strictObject({ breakpointId: handle }) }),
  z.strictObject({ phase: z.literal("via-worker-resume"), role: z.enum(ROLES), method: z.literal("Debugger.resume"), params: z.strictObject({}) }),
]);
export type CurrentPcbViaWorkerBootstrapCommand = z.infer<typeof schema>;
/** Two parent configurations, one fresh existing-worker inventory, two realm
 * enables, one fixed asynchronous-stack depth, one instrumentation arm, one run-waiting, seven full source reads,
 * seven original startup continuations and one instrumentation removal. */
export const CURRENT_PCB_VIA_WORKER_BOOTSTRAP_REQUESTS = Object.freeze({ parent: 2, inventory: 1,
  workerNormal: 2 + 1 + 1 + 1 + ROLES.length, workerCleanup: ROLES.length + 1, total: 2 + 1 + 2 + 1 + 1 + 1 + 2 * ROLES.length + 1 });
export function validateCurrentPcbViaWorkerBootstrapCommand(input: unknown): CurrentPcbViaWorkerBootstrapCommand {
  return freezeDeep(schema.parse(captureCurrentPcbStringClockReply(input).value));
}
export function currentPcbViaWorkerBootstrapNativeCases(): readonly CurrentPcbViaWorkerBootstrapCommand[] {
  const rows: CurrentPcbViaWorkerBootstrapCommand[] = [
    { phase: "via-worker-runtime", method: "Runtime.enable", params: {} },
    { phase: "via-worker-debugger", method: "Debugger.enable", params: { maxScriptsCacheSize: 33_554_432 } },
    { phase: "via-worker-async", method: "Debugger.setAsyncCallStackDepth", params: { maxDepth: 32 } },
    { phase: "via-worker-instrument", method: "Debugger.setInstrumentationBreakpoint", params: { instrumentation: "beforeScriptExecution" } },
    { phase: "via-worker-run-waiting", method: "Runtime.runIfWaitingForDebugger", params: {} },
    { phase: "via-worker-remove", method: "Debugger.removeBreakpoint", params: { breakpointId: "via_worker_breakpointId" } },
  ];
  for (const role of ROLES) { rows.push({ phase: "via-worker-source", role, method: "Debugger.getScriptSource", params: { scriptId: "via_worker_scriptId" } },
    { phase: "via-worker-resume", role, method: "Debugger.resume", params: {} }); }
  return freezeDeep(rows);
}
