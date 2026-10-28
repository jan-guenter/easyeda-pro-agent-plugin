/** A distinct disposable owner qualifies the original route without creating a footprint. */
import { z } from "zod";
import { currentPcb209WorkerStartupActorRequestSchema, currentPcb209WorkerStartupAssignmentsRequestSchema,
  currentPcb209WorkerStartupCaptureRequestSchema, currentPcb209WorkerStartupLifecycleRequestSchema } from "./current-pcb-209-worker-startup-validation.ts";
import { CURRENT_FOOTPRINT_COPY_EXECUTION_PROFILE } from "./current-footprint-copy-execution-profile.ts";

export const CURRENT_FOOTPRINT_COPY_ROUTE_PREPARATION_OPERATION_PREFIX = "footprint-route-";
export const currentFootprintCopyRoutePreparationIdSchema = z.string().max(80).regex(/^footprint-route-[a-z0-9][a-z0-9_-]*(?![\s\S])/u);
const operationId = currentFootprintCopyRoutePreparationIdSchema;
export const currentFootprintCopyRoutePreparationLifecycleRequestSchema = z.discriminatedUnion("action", [
  currentPcb209WorkerStartupLifecycleRequestSchema.options[0].extend({ operationId }),
  ...currentPcb209WorkerStartupLifecycleRequestSchema.options.slice(1).map(option => option.extend({ operationId })),
]);
export const currentFootprintCopyRoutePreparationValidationRequestSchema = z.discriminatedUnion("action", [
  ...currentFootprintCopyRoutePreparationLifecycleRequestSchema.options,
  currentPcb209WorkerStartupCaptureRequestSchema.extend({ operationId }),
  currentPcb209WorkerStartupAssignmentsRequestSchema.extend({ operationId }),
  currentPcb209WorkerStartupActorRequestSchema.extend({ operationId }),
  z.object({ action: z.literal("observe-footprint-route"), operationId,
    expectedBindingSha256: z.string().regex(/^[a-f0-9]{64}$/u) }).strict(),
]);
export type CurrentFootprintCopyRoutePreparationValidationRequest = z.infer<typeof currentFootprintCopyRoutePreparationValidationRequestSchema>;
export function queryCurrentFootprintCopyRoutePreparation(includeSchemas: boolean): Record<string, unknown> {
  return { wrapperAction: "footprint-copy-route-preparation", toolWrapperAction: "footprint-copy-route-preparation",
    validationOnly: true, connectedValidation: false, executionAuthorized: false, saveAuthorized: false,
    profile: CURRENT_FOOTPRINT_COPY_EXECUTION_PROFILE,
    actions: currentFootprintCopyRoutePreparationValidationRequestSchema.options.map(option => option.shape.action.value),
    limitations: [
      "Launch a separate footprint-route-* owner. Existing startup and preparation owners cannot be upgraded or adopted.",
      "After browser, frame and UI-source qualification, capture the identified disposable project once. The distinct constructor capture retains parser callbacks, observes four original cache-open events and installs a one-use native Worker message observer while its parent is held. After qualified construction and one send acknowledgment, an original pending capability permits the parent's normal-open continuation so Chromium can deliver the queued message. Only its actual receipt grants peer proof and later route observations. Cache namespace evidence requires the original events, native results and unchanged project assignments; names alone cannot supply it.",
      "After assignments and actor observation, observe-footprint-route consumes one journaled stage for original footprint state, producers, dependencies, parser callbacks, destinations, UI/manager peer binding and a Windows clock sample.",
      "These are bounded point-in-time observations. No copy, document-clock breakpoint arming, queue completion, explicit Save or saved/reopened effect is offered.",
      "Existing-profile launch and opening can restore tabs, use the network and automatically persist. Retain the original owner through normal close, observed root/Job exit, release and record settlement. Failed probes are consumed and must not be repeated.",
    ], ...(includeSchemas ? { inputSchema: z.toJSONSchema(currentFootprintCopyRoutePreparationValidationRequestSchema) } : {}) };
}
export function validateCurrentFootprintCopyRoutePreparationArguments(input: unknown): Record<string, unknown> {
  const parsed = currentFootprintCopyRoutePreparationValidationRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, validationOnly: true, executionAuthorized: false } : {
    valid: false, validationOnly: true, executionAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}
