/** Fixed disposable preparation purpose; no action dispatches a copy or Save. */
import { z } from "zod";
import { currentPcb209WorkerStartupLifecycleRequestSchema, currentPcb209WorkerStartupValidationRequestSchema } from "./current-pcb-209-worker-startup-validation.ts";
import { CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE } from "./current-footprint-copy-preparation-profile.ts";

export const CURRENT_FOOTPRINT_COPY_PREPARATION_OPERATION_PREFIX = "footprint-preparation-";
export const currentFootprintCopyPreparationIdSchema = z.string().max(80).regex(/^footprint-preparation-[a-z0-9][a-z0-9_-]*$/u);
const operationId = currentFootprintCopyPreparationIdSchema;
export const currentFootprintCopyPreparationLifecycleRequestSchema = z.discriminatedUnion("action",
  [currentPcb209WorkerStartupLifecycleRequestSchema.options[0].extend({ operationId }),
    ...currentPcb209WorkerStartupLifecycleRequestSchema.options.slice(1).map(option => option.extend({ operationId }))]);
export const currentFootprintCopyPreparationValidationRequestSchema = z.discriminatedUnion("action", [
  currentPcb209WorkerStartupValidationRequestSchema.options[0].extend({ operationId }),
  ...currentPcb209WorkerStartupValidationRequestSchema.options.slice(1).map(option => option.extend({ operationId })),
  z.object({ action: z.literal("prepare-footprint-bindings"), operationId,
    expectedBindingSha256: z.string().regex(/^[a-f0-9]{64}$/u) }).strict(),
  z.object({ action: z.literal("observe-footprint-ui"), operationId,
    expectedBindingSha256: z.string().regex(/^[a-f0-9]{64}$/u) }).strict(),
  z.object({ action: z.literal("observe-footprint-manager-route"), operationId,
    expectedBindingSha256: z.string().regex(/^[a-f0-9]{64}$/u) }).strict(),
  z.object({ action: z.literal("prepare-footprint-dependencies"), operationId,
    expectedBindingSha256: z.string().regex(/^[a-f0-9]{64}$/u) }).strict(),
]);
export type CurrentFootprintCopyPreparationValidationRequest = z.infer<typeof currentFootprintCopyPreparationValidationRequestSchema>;
export function queryCurrentFootprintCopyPreparation(includeSchemas: boolean): Record<string, unknown> {
  return { wrapperAction: "footprint-copy-preparation", toolWrapperAction: "footprint-copy-preparation",
    validationOnly: true, connectedValidation: false, executionAuthorized: false, saveAuthorized: false,
    profile: CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE,
    actions: currentFootprintCopyPreparationValidationRequestSchema.options.map(option => option.shape.action.value),
    limitations: [
      "Launch a separate footprint-preparation-* owner. Existing startup purposes cannot be upgraded or adopted.",
      "Capture the disposable project once, observe assignments, actor, footprint state and source, prepare the source copy plan, then prepare-footprint-bindings, observe-footprint-ui, prepare-footprint-dependencies and observe-footprint-manager-route once each. It retains original producer, actor/SQL, initialized UI/manager route and 53 dependency functions with raw failure evidence.",
      `The fixed ${String(CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.normalRequestLimit)} normal requests cover startup/source/preparation, actor, producer bindings, UI route and dependency qualification; ${String(CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.requests.cleanup)} cleanup slots remain separate. Existing byte/event ceilings may refuse early. Optional observations consume the same budget.`,
      "Reciprocal worker/bus identity, asynchronous parser/upload completion, native document-clock transport, create, complete effect, Save and saved verification are still unavailable. Preparation grants no writer authority.",
      "Launch/open use the existing profile and can restore tabs, use the network and automatically persist. Only an identified disposable project may be opened. Retain the original owner through normal close, observed root/Job termination, release and record settlement.",
    ], ...(includeSchemas ? { inputSchema: z.toJSONSchema(currentFootprintCopyPreparationValidationRequestSchema) } : {}) };
}
export function validateCurrentFootprintCopyPreparationArguments(input: unknown): Record<string, unknown> {
  const parsed = currentFootprintCopyPreparationValidationRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, validationOnly: true, executionAuthorized: false } : {
    valid: false, validationOnly: true, executionAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}
