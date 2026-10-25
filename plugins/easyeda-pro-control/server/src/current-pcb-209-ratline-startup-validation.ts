/** Distinct launch purpose through the first ratline child's held import. This
 * data contract never allocates or recreates an original native owner. */
import { z } from "zod";
import { currentPcb209WorkerStartupCaptureRequestSchema, currentPcb209WorkerStartupLifecycleRequestSchema } from "./current-pcb-209-worker-startup-validation.ts";

export const CURRENT_PCB_209_RATLINE_STARTUP_OPERATION_PREFIX = "pcb209-ratline-";
export const currentPcb209RatlineStartupIdSchema = z.string().max(80).regex(/^pcb209-ratline-[a-z0-9][a-z0-9_-]*$/u);
const operationId = currentPcb209RatlineStartupIdSchema;
export const currentPcb209RatlineStartupLifecycleRequestSchema = z.discriminatedUnion("action", [
  currentPcb209WorkerStartupLifecycleRequestSchema.options[0].extend({ operationId }),
  ...currentPcb209WorkerStartupLifecycleRequestSchema.options.slice(1).map(option => option.extend({ operationId })),
]);
export const currentPcb209RatlineStartupValidationRequestSchema = z.discriminatedUnion("action", [
  ...currentPcb209RatlineStartupLifecycleRequestSchema.options,
  currentPcb209WorkerStartupCaptureRequestSchema.extend({ operationId }),
  z.object({ action: z.literal("observe-ratline-held-import"), operationId,
    expectedBindingSha256: z.string().regex(/^[a-f0-9]{64}$/u), acceptNormalOpenEffects: z.literal(true), acceptDebuggerPause: z.literal(true) }).strict(),
]);
export type CurrentPcb209RatlineStartupLifecycleRequest = z.infer<typeof currentPcb209RatlineStartupLifecycleRequestSchema>;
export type CurrentPcb209RatlineStartupValidationRequest = z.infer<typeof currentPcb209RatlineStartupValidationRequestSchema>;
export function queryCurrentPcb209RatlineStartupValidation(includeSchemas: boolean): Record<string, unknown> {
  return { wrapperAction: "pcb209-ratline-held-import", toolWrapperAction: "ratline-held-import", validationOnly: true,
    connectedValidation: false, executionAuthorized: false, saveAuthorized: false,
    actions: currentPcb209RatlineStartupValidationRequestSchema.options.map(option => option.shape.action.value),
    limitations: [
      "Launch a separate pcb209-ratline-* operation with its original fixed-purpose owner. Existing diagnostic, startup and empty-baseline owners cannot be upgraded or adopted.",
      "After the original disposable project capture, observe-ratline-held-import opens the retained PCB once, qualifies its 29 source stages, observes PCB construction and qualifies the first child's seven source stages while holding its final import.",
      "Ratline-only async-depth capture observes the first child's external native creation stack through the original parent debugger. Missing IDs or unqualified locations/scopes remain explicit refusals. Complete bounded observations and their recomputed digest accompany the held-import result; an unpublished failed attempt retains evidence in original-owner status.",
      "Launch and ordinary opening may restore state, migrate or automatically persist files and use the network. Existing-profile effects and debugger pauses require explicit acceptance.",
      "The result records a held-import boundary. It does not independently associate the native Worker object with its CDP target, continue the worker import, capture a subordinate worker, prove callback or startup completion, establish a complete live baseline, or authorize edits or Save.",
      "One launch clock and cumulative request, byte and event budgets remain in force across all handoffs. A deadline or partial failure grants no retry. Original process and Job termination, helper release and durable record settlement remain separate.",
      "Historical JSON cannot recreate the original owner or its continuation capabilities. No assignments, actor/channel, empty-baseline, editing or Save action is offered by this purpose.",
    ], ...(includeSchemas ? { inputSchema: z.toJSONSchema(currentPcb209RatlineStartupValidationRequestSchema) } : {}) };
}
export function validateCurrentPcb209RatlineStartupArguments(input: unknown): Record<string, unknown> {
  const parsed = currentPcb209RatlineStartupValidationRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, validationOnly: true, executionAuthorized: false } : {
    valid: false, validationOnly: true, executionAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}
