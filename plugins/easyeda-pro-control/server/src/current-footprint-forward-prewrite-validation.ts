/** Fresh born-forward source/route qualification. No writer or scheduler controls. */
import { z } from "zod";
import { currentPcb209WorkerStartupActorRequestSchema, currentPcb209WorkerStartupAssignmentsRequestSchema,
  currentPcb209WorkerStartupCaptureRequestSchema, currentPcb209WorkerStartupFootprintSourceInputSchema,
  currentPcb209WorkerStartupLifecycleRequestSchema } from "./current-pcb-209-worker-startup-validation.ts";
import { CURRENT_FOOTPRINT_COPY_FORWARD_PROFILE } from "./current-footprint-copy-forward-profile.ts";
import { currentFootprintQualifiedSourcePageBoundsSchema, currentFootprintQualifiedSourcePageDataSchema } from "./current-footprint-qualified-source-page.ts";

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
  z.object({ action: z.literal("seal-footprint-source"), ...bound }).strict(),
  z.object({ action: z.literal("prove-closed-baseline"), ...bound }).strict(),
  currentFootprintQualifiedSourcePageBoundsSchema.extend({ action: z.literal("read-qualified-source"), ...bound }),
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
/** Separate results preserve the released qualification's fixed false fields. */
export const currentFootprintForwardSourceSealResultSchema = z.object({
  profile: z.literal("private.current-footprint-forward-source-seal.v1"),
  qualificationResultSha256: digest, beforeCheckpointSha256: digest, beforeSqlSha256: digest, sourceBindingSha256: digest,
  originalForwardOwnerRetained: z.literal(true), sourceSealedForClosedSnapshot: z.literal(true),
  headAgeVerified: z.literal(false), atomicPrewriteQueuesVerified: z.literal(false), documentClocksArmed: z.literal(false),
  backendPublicationVerified: z.literal(false), wholeFourGenerationBudgetReserved: z.literal(false),
  executionReady: z.literal(false), executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).strict();
export const currentFootprintForwardClosedBaselineResultSchema = z.object({
  profile: z.literal("private.current-footprint-forward-closed-baseline.v1"),
  sourceSealResultSha256: digest, beforeCheckpointSha256: digest, beforeSqlSha256: digest,
  closedCheckpointSha256: digest, closedSqlSha256: digest,
  exactLogicalSqlUnchanged: z.literal(true), originalRootExited: z.literal(true), originalJobEmpty: z.literal(true),
  helperReleaseProved: z.literal(false), savedCopyVerified: z.literal(false),
  executionReady: z.literal(false), executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).strict();
export const currentFootprintForwardSourcePageResultSchema = currentFootprintQualifiedSourcePageDataSchema.extend({
  schema: z.literal("easyeda-pro-control.footprint-qualified-source-page.v1"), operationId,
  bindingSha256: digest, qualificationResultRecordSha256: digest,
  pointInTime: z.literal(true), currentStateVerified: z.literal(false), savedStateVerified: z.literal(false), nativeCalls: z.literal(0),
  executionReady: z.literal(false), executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
});
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
      "The source/route join is point-in-time qualification. Its original v1 result does not itself seal source or verify current unlocked-head age, atomic prewrite queues, document clocks, backend publication or complete four-generation capacity. executionReady remains false.",
      "After published qualification, seal-footprint-source once binds the original source/preparation to its actual checkpoint. After normal closure and published original root/empty-Job termination, prove-closed-baseline once captures the original complete closed SQL snapshot and requires exact logical equality. Helper release remains separate. Neither result grants head/queue/clock, writer or saved-copy authority.",
      "read-qualified-source returns bounded base64 byte pages of the original published source packet's canonical UTF-8 JSON. It retains the original private packet and rechecks its published journal. Concatenate bytes before UTF-8 decoding and verify the complete packet/source hashes. Retrieval makes no native call and proves no current or saved state; historical JSON cannot supply the original private packet.",
      "Launch/open can restore tabs, use the network and automatically persist files. Debugger pauses affect timing. Keep the original owner through normal close or explicitly confirmed original-Job abort, observed root/empty Job, helper release and record settlement. Failed stages are consumed; historical JSON cannot recreate ownership.",
    ], ...(includeSchemas ? { inputSchema: z.toJSONSchema(currentFootprintForwardPrewriteValidationRequestSchema), resultSchemas: {
      qualification: z.toJSONSchema(currentFootprintForwardPrewriteResultSchema),
      sourceSeal: z.toJSONSchema(currentFootprintForwardSourceSealResultSchema),
      closedBaseline: z.toJSONSchema(currentFootprintForwardClosedBaselineResultSchema),
      sourcePage: z.toJSONSchema(currentFootprintForwardSourcePageResultSchema),
    } } : {}) };
}
/** Validate exact data arguments; successful parsing supplies no execution authority. */
export function validateCurrentFootprintForwardPrewriteArguments(input: unknown): Record<string, unknown> {
  const parsed = currentFootprintForwardPrewriteValidationRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, validationOnly: true, executionReady: false, executionAuthorized: false } : {
    valid: false, validationOnly: true, executionReady: false, executionAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}
