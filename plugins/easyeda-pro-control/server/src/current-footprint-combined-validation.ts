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
export const currentFootprintCombinedAbandonUnknownRequestSchema = z.object({
  action: z.literal("abandon-unknown-launch"), operationId, expectedIntentSha256: digest,
  confirmAbandonUnknownLaunch: z.literal(true), acceptUnobservedDescendants: z.literal(true), acceptUnknownProfileEffects: z.literal(true),
}).strict();
export const currentFootprintCombinedValidationRequestSchema = z.discriminatedUnion("action", [
  ...currentFootprintCombinedLifecycleRequestSchema.options, currentFootprintCombinedAbandonUnknownRequestSchema,
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
      "This combined purpose requires a private challenge-matched helper-ready packet before any launch input. Only its original factory can prove an observed closed, never-written helper failed before application dispatch; factory-before-launch-failed grants no native-resource-release proof and cannot qualify older intent-only failures.",
      "A new same-purpose launch may replace a consumed combined coordinator only after all calls settle and its original reservation is released. Inspection retains the previous coordinator, unknown/live attempts remain reserved, and durable old operation IDs cannot be replayed.",
      "Observe-main-construction must complete and publish its source-qualified result before disposable capture-project. Browser/frame/UI qualification, original project-worker capture, assignment/actor and route observations retain their existing exact guards.",
      "The separate native birth purpose shares original main request IDs, event cursor, process/Job handles and absolute lifetime. This public route mounts no backend request collector, copy/delete writer, document-clock arming, explicit Save or saved-result proof. Whole-writer authority remains false.",
      "The private clock/RPC integration retains original construction and registration leases through one combined native owner, paired router, allocator and event cursor. It reserves up to69 existing IDs for handoff plus its49 normal/18 cleanup/67-command unit within the unchanged normal-ID ceiling780. Fixed native begin/send/retire consumes before dispatch and requires original exit for failed retirement; this public tool exposes no clock invocation action. Connected origin/router execution remains unvalidated. The held final-PB prefix and14-stage backend completion derive105 main commands only. Its48-variant native codec is embedded, but genuine completion origin issuance, atomic held transfer, pre-write eligibility, native dispatch and complete owner budgets remain unimplemented. Pure logical delete/saved-reader models support locked or aged heads and retained tombstones, not native deletion/reopen or replay exclusion. The complete four-generation budget remains unavailable.",
      "Historical abandon-unknown-launch is separate, explicitly accepts unknown effects/descendants, and requires a fresh coordinator, exact reviewed223950 intent-only bytes, no other Linux facade, and absent PowerShell/EasyEDA samples. It preserves the original journal and grants no termination, non-dispatch, resource-release, design or persistence proof.",
      "A Windows process-presence refusal reports only its validated two-sample PowerShell/EasyEDA presence flags through assertionResults. These flags identify neither a process nor its purpose and grant no permission to close, terminate or adopt unrelated work.",
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
