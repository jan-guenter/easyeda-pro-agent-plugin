/** Fresh born-forward source/route qualification. No writer or scheduler controls. */
import { z } from "zod";
import { currentPcb209WorkerStartupActorRequestSchema, currentPcb209WorkerStartupAssignmentsRequestSchema,
  currentPcb209WorkerStartupCaptureRequestSchema, currentPcb209WorkerStartupFootprintSourceInputSchema,
  currentPcb209WorkerStartupLifecycleRequestSchema } from "./current-pcb-209-worker-startup-validation.ts";
import { CURRENT_FOOTPRINT_COPY_FORWARD_PROFILE } from "./current-footprint-copy-forward-profile.ts";

export const CURRENT_FOOTPRINT_FORWARD_PREWRITE_OPERATION_PREFIX = "footprint-copy-qualify-";
export const currentFootprintForwardPrewriteIdSchema = z.string().max(80).regex(/^footprint-copy-qualify-[a-z0-9][a-z0-9-]*(?![\s\S])/u);
const operationId = currentFootprintForwardPrewriteIdSchema;
const digest = z.string().regex(/^[a-f0-9]{64}$/u);
const bound = { operationId, expectedBindingSha256: digest };
export const currentFootprintForwardPrewriteLifecycleRequestSchema = z.discriminatedUnion("action", [
  currentPcb209WorkerStartupLifecycleRequestSchema.options[0].extend({ operationId, acceptDebuggerPauseEffects: z.literal(true) }),
  ...currentPcb209WorkerStartupLifecycleRequestSchema.options.slice(1).map(option => option.extend({ operationId })),
]);
export const currentFootprintForwardPrewriteValidationRequestSchema = z.discriminatedUnion("action", [
  ...currentFootprintForwardPrewriteLifecycleRequestSchema.options,
  currentPcb209WorkerStartupCaptureRequestSchema.extend({ operationId }),
  currentPcb209WorkerStartupAssignmentsRequestSchema.extend({ operationId }),
  currentPcb209WorkerStartupActorRequestSchema.extend({ operationId }),
  z.object({ action: z.literal("observe-main-construction"), ...bound }).strict(),
  z.object({ action: z.literal("observe-footprint-route"), ...bound }).strict(),
  currentPcb209WorkerStartupFootprintSourceInputSchema.extend({ action: z.literal("qualify-footprint-source"), ...bound }),
  z.object({ action: z.literal("abort-generation"), ...bound, confirmAbortOriginalForwardJob: z.literal(true) }).strict(),
]);
export const currentFootprintForwardPrewriteResultSchema = z.object({
  profile: z.literal("private.current-footprint-forward-prewrite.v1"),
  mainResultSha256: digest, routeResultSha256: digest,
  beforeCheckpointSha256: digest, beforeSqlSha256: digest,
  sourcePlanSha256: digest, sourcePacketSha256: digest, copyPlanSha256: digest,
  nativeArgumentsSha256: digest, sourceAssetsSha256: digest, headReferenceSha256: digest,
  prewriteSourceRouteJoined: z.literal(true), originalForwardOwnerRetained: z.literal(true),
  sourceSealedForClosedSnapshot: z.literal(false), headAgeVerified: z.literal(false),
  atomicPrewriteQueuesVerified: z.literal(false), documentClocksArmed: z.literal(false),
  backendPublicationVerified: z.literal(false), wholeFourGenerationBudgetReserved: z.literal(false),
  executionReady: z.literal(false), executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).strict();
export type CurrentFootprintForwardPrewriteValidationRequest = z.infer<typeof currentFootprintForwardPrewriteValidationRequestSchema>;
/** Discover the fixed forward-only observations without allocating native resources. */
export function queryCurrentFootprintForwardPrewrite(includeSchemas: boolean): Record<string, unknown> {
  return { wrapperAction: "footprint-forward-prewrite", toolWrapperAction: "footprint-forward-prewrite", validationOnly: true,
    connectedValidation: false, executionReady: false, executionAuthorized: false, saveAuthorized: false,
    profile: CURRENT_FOOTPRINT_COPY_FORWARD_PROFILE,
    actions: currentFootprintForwardPrewriteValidationRequestSchema.options.map(option => option.shape.action.value),
    limitations: [
      "Launch a new footprint-copy-qualify-* original born-forward owner. Existing startup, preparation, route, Combined or cache owners cannot be upgraded or adopted.",
      "Publish main construction before disposable project capture. After original assignment/actor and route publication, qualify-footprint-source reads the complete checkpoint-member native source twice and derives its original owned copy preparation, source assets and historical head. It never creates a footprint.",
      "The source/route join is point-in-time qualification. Source sealing, current unlocked-head age, atomic prewrite queues, document clocks, backend publication and complete four-generation capacity remain unavailable. executionReady remains false.",
      "Launch/open can restore tabs, use the network and automatically persist files. Debugger pauses affect timing. Keep the original owner through normal close or explicitly confirmed original-Job abort, observed root/empty Job, helper release and record settlement. Failed stages are consumed; historical JSON cannot recreate ownership.",
    ], ...(includeSchemas ? { inputSchema: z.toJSONSchema(currentFootprintForwardPrewriteValidationRequestSchema) } : {}) };
}
/** Validate exact data arguments; successful parsing supplies no execution authority. */
export function validateCurrentFootprintForwardPrewriteArguments(input: unknown): Record<string, unknown> {
  const parsed = currentFootprintForwardPrewriteValidationRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, validationOnly: true, executionReady: false, executionAuthorized: false } : {
    valid: false, validationOnly: true, executionReady: false, executionAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}
