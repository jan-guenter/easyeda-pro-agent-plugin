/** Separate disposable main/renderer generation, sealed before native launch. */
import { z } from "zod";
import { currentPcb209WorkerStartupActorRequestSchema, currentPcb209WorkerStartupAssignmentsRequestSchema,
  currentPcb209WorkerStartupCaptureRequestSchema, currentPcb209WorkerStartupLifecycleRequestSchema } from "./current-pcb-209-worker-startup-validation.ts";
import { CURRENT_FOOTPRINT_COMBINED_PROFILE } from "./current-footprint-copy-combined-profile.ts";

export const CURRENT_FOOTPRINT_COMBINED_OPERATION_PREFIX = "footprint-combined-";
export const currentFootprintCombinedIdSchema = z.string().max(80).regex(/^footprint-combined-[a-z0-9][a-z0-9_-]*(?![\s\S])/u);
const operationId = currentFootprintCombinedIdSchema;
const digest = z.string().regex(/^[a-f0-9]{64}$/u);
const bound = { operationId, expectedBindingSha256: digest };
export const currentFootprintCombinedLifecycleRequestSchema = z.discriminatedUnion("action", [
  currentPcb209WorkerStartupLifecycleRequestSchema.options[0].extend({ operationId, acceptDebuggerPauseEffects: z.literal(true) }),
  ...currentPcb209WorkerStartupLifecycleRequestSchema.options.slice(1).map(option => option.extend({ operationId })),
]);
export const currentFootprintCombinedValidationRequestSchema = z.discriminatedUnion("action", [
  ...currentFootprintCombinedLifecycleRequestSchema.options,
  currentPcb209WorkerStartupCaptureRequestSchema.extend({ operationId }),
  currentPcb209WorkerStartupAssignmentsRequestSchema.extend({ operationId }),
  currentPcb209WorkerStartupActorRequestSchema.extend({ operationId }),
  z.object({ action: z.literal("observe-footprint-route"), ...bound }).strict(),
  z.object({ action: z.literal("observe-main-construction"), ...bound }).strict(),
  z.object({ action: z.literal("abort-generation"), ...bound, confirmAbortOriginalCombinedJob: z.literal(true) }).strict(),
]);
export const currentFootprintCombinedNativeStateSchema = z.object({
  combinedAbortDispatchAttempted: z.boolean(), combinedOutputCleanupOnly: z.boolean(),
}).strict();
export type CurrentFootprintCombinedValidationRequest = z.infer<typeof currentFootprintCombinedValidationRequestSchema>;
export function queryCurrentFootprintCombined(includeSchemas: boolean): Record<string, unknown> {
  return { wrapperAction: "footprint-combined", toolWrapperAction: "footprint-combined", validationOnly: true,
    connectedValidation: false, executionAuthorized: false, saveAuthorized: false, profile: CURRENT_FOOTPRINT_COMBINED_PROFILE,
    actions: currentFootprintCombinedValidationRequestSchema.options.map(option => option.shape.action.value),
    limitations: [
      "Launch a new footprint-combined-* original main/renderer owner with all four exact confirmations. Existing diagnostic, route and preparation owners cannot be upgraded or adopted.",
      "Observe-main-construction must complete and publish its source-qualified result before disposable capture-project. Browser/frame/UI qualification, original project-worker capture, assignment/actor and route observations retain their existing exact guards.",
      "The separate native birth purpose shares original main request IDs, event cursor, process/Job handles and absolute lifetime. This public route mounts no backend request collector, copy/delete writer, document-clock arming, explicit Save or saved-result proof. Whole-writer authority remains false.",
      "Abort-generation durably consumes its intent before requesting termination of only this original combined Job. Exact confirmation is required; missing acknowledgment is consumed. Abort blocks normal work and is distinct from observed original-root exit, empty Job, release and record settlement.",
      "Existing-profile launch and disposable opening can restore tabs, use the network and automatically persist files. Debugger pauses affect timing. Retain the original owner through cleanup; historical JSON and screenshots cannot recreate it.",
    ], ...(includeSchemas ? { inputSchema: z.toJSONSchema(currentFootprintCombinedValidationRequestSchema) } : {}) };
}
export function validateCurrentFootprintCombinedArguments(input: unknown): Record<string, unknown> {
  const parsed = currentFootprintCombinedValidationRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, validationOnly: true, executionAuthorized: false } : {
    valid: false, validationOnly: true, executionAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}
