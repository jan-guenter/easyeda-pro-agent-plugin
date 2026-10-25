/** Separate fixed-purpose empty209 lifecycle; importing this contract allocates no owner. */
import { z } from "zod";
import { currentPcb209RatlineContinuationValidationRequestSchema } from "./current-pcb-209-ratline-continuation-validation.ts";
import { currentPcb209RatlineStartupValidationRequestSchema } from "./current-pcb-209-ratline-startup-validation.ts";
import { currentPcb209WorkerStartupCaptureRequestSchema, currentPcb209WorkerStartupLifecycleRequestSchema,
  currentPcb209WorkerStartupValidationRequestSchema } from "./current-pcb-209-worker-startup-validation.ts";

export const CURRENT_PCB_209_EMPTY_STARTUP_OPERATION_PREFIX = "pcb209-empty-";
export const currentPcb209EmptyStartupIdSchema = z.string().max(80).regex(/^pcb209-empty-[a-z0-9][a-z0-9_-]*$/u);
const operationId = currentPcb209EmptyStartupIdSchema;
export const currentPcb209EmptyStartupLifecycleRequestSchema = z.discriminatedUnion("action", [
  currentPcb209WorkerStartupLifecycleRequestSchema.options[0].extend({ operationId }),
  ...currentPcb209WorkerStartupLifecycleRequestSchema.options.slice(1).map(option => option.extend({ operationId })),
]);
export const currentPcb209EmptyStartupValidationRequestSchema = z.discriminatedUnion("action", [
  ...currentPcb209EmptyStartupLifecycleRequestSchema.options,
  currentPcb209WorkerStartupCaptureRequestSchema.extend({ operationId }),
  z.object({ action: z.literal("observe-empty-baseline"), operationId,
    expectedBindingSha256: z.string().regex(/^[a-f0-9]{64}$/u), acceptNormalOpenEffects: z.literal(true) }).strict(),
]);
export type CurrentPcb209EmptyStartupLifecycleRequest = z.infer<typeof currentPcb209EmptyStartupLifecycleRequestSchema>;
export type CurrentPcb209EmptyStartupValidationRequest = z.infer<typeof currentPcb209EmptyStartupValidationRequestSchema>;
/** The existing tool receives this extra wrapper; legacy requests retain their exact schema. */
export const currentPcb209WorkerStartupToolRequestSchema = z.discriminatedUnion("action", [
  ...currentPcb209WorkerStartupValidationRequestSchema.options,
  z.object({ action: z.literal("empty-baseline"), request: currentPcb209EmptyStartupValidationRequestSchema }).strict(),
  z.object({ action: z.literal("ratline-held-import"), request: currentPcb209RatlineStartupValidationRequestSchema }).strict(),
  z.object({ action: z.literal("ratline-continuation"), request: currentPcb209RatlineContinuationValidationRequestSchema }).strict(),
]);
export function queryCurrentPcb209EmptyStartupValidation(includeSchemas: boolean): Record<string, unknown> {
  return { wrapperAction: "pcb209-empty-baseline", toolWrapperAction: "empty-baseline", validationOnly: true,
    connectedValidation: false, executionAuthorized: false, saveAuthorized: false,
    actions: currentPcb209EmptyStartupValidationRequestSchema.options.map(option => option.shape.action.value),
    limitations: [
      "Launch a fresh pcb209-empty-* operation with its separately budgeted native owner. Existing diagnostic and startup owners cannot be upgraded or adopted.",
      "Capture-project retains the original disposable target, completed SQL reader and managed checkpoint. Observe-empty-baseline then opens that same PCB once, qualifies its source and joins common metadata to the retained checkpoint between two empty raw-manager samples.",
      "Launch and ordinary project/PCB opening can restore state, migrate or automatically persist files and use the network. Explicit acceptance of these existing-profile effects is required.",
      "The fixed empty route refuses populated geometry or differing stored common/meta records. Matching samples do not prove an atomic snapshot, full startup completion, pending-producer inventory, complete live baseline or future persistence.",
      "Each capture and baseline stage is consumed once. Inspect retained failures and settle pending records; never replay an uncertain opening. Original normal close, root/Job termination and helper release remain separate.",
      "This route offers no assignments, actor/channel, editing or Save action. Historical records cannot recreate the original native owner.",
    ], ...(includeSchemas ? { inputSchema: z.toJSONSchema(currentPcb209EmptyStartupValidationRequestSchema) } : {}) };
}
export function validateCurrentPcb209EmptyStartupArguments(input: unknown): Record<string, unknown> {
  const parsed = currentPcb209EmptyStartupValidationRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, validationOnly: true, executionAuthorized: false } : {
    valid: false, validationOnly: true, executionAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}
