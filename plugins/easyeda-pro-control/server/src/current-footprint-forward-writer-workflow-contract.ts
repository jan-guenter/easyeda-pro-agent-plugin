/** Small durable facts for the complete original workflow. Neither records
 * nor matching hashes recreate a native owner, dispatch lease or retry. */
import { z } from "zod";
import { currentFootprintForwardWriterInputOperationIdSchema } from "./current-footprint-forward-writer-input-contract.ts";

import { CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_CLEANUP_ACTIONS as ACTIONS, CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_BUDGET as BUDGET, CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_STAGES as STAGES } from "./current-footprint-forward-writer-workflow-budget.ts";

export { CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_BUDGET, CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_CLEANUP_ACTIONS, CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_PROFILE, CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_STAGES } from "./current-footprint-forward-writer-workflow-budget.ts";
const stages = STAGES;
const actions = ACTIONS;
export const currentFootprintForwardWriterWorkflowIdSchema = z.string().min("footprint-forward-flow-".length + 1).max(96).regex(/^footprint-forward-flow-[a-z\d][a-z\d-]*$(?![\s\S])/u);
export const currentFootprintForwardWriterWorkflowRequestSchema = z.strictObject({ operationId: currentFootprintForwardWriterWorkflowIdSchema,
  parentOperationId: currentFootprintForwardWriterInputOperationIdSchema, confirmDisposableCopy: z.literal(true), acceptUnsupportedInverse: z.literal(true) }).refine(value =>
  value.operationId.slice("footprint-forward-flow-".length) === value.parentOperationId.slice("footprint-forward-writer-".length), "Workflow and original opening suffixes must match.");
export type CurrentFootprintForwardWriterWorkflowRequest = Readonly<z.infer<typeof currentFootprintForwardWriterWorkflowRequestSchema>>;
export const CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_PHASES = ["operation-intent", "stage-intent", "stage-result", "cleanup-intent", "cleanup-result", "failure", "complete", "terminal-failure"] as const;
export type CurrentFootprintForwardWriterWorkflowPhase = typeof CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_PHASES[number];
const digest = z.string().regex(/^[a-f\d]{64}$(?![\s\S])/u);
const cleanup = { generation: z.enum(["writer", "saved"]), action: z.enum(actions), attempt: z.number().int().min(1).max(BUDGET.terminationObservations) };
export const currentFootprintForwardWriterWorkflowEvidenceSchemas = Object.freeze({
  "operation-intent": z.strictObject({ request: currentFootprintForwardWriterWorkflowRequestSchema }),
  "stage-intent": z.strictObject({ stage: z.enum(stages) }),
  "stage-result": z.strictObject({ stage: z.enum(stages), evidenceSha256: digest, originalCompletionObserved: z.literal(true) }),
  "cleanup-intent": z.strictObject(cleanup),
  "cleanup-result": z.strictObject({ ...cleanup, outcome: z.enum(["dispatched", "pending", "terminated", "released", "no-resource", "failed"]), evidenceSha256: digest }),
  failure: z.strictObject({ stage: z.enum(stages), originalErrorRetained: z.literal(true) }),
  complete: z.strictObject({ createdUuid: z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$(?![\s\S])/u), writerSqlSha256: digest, savedSqlSha256: digest, sourceReadSha256: digest,
    originalClosedReadersDistinct: z.literal(true), originalOwnersReleased: z.literal(true), explicitSaveAttempts: z.literal(0), savedResultVerified: z.literal(true), inverseAvailable: z.literal(false) }),
  "terminal-failure": z.strictObject({ originalOwnersClosed: z.literal(true), originalPendingJoined: z.literal(true), released: z.literal(true) }),
});
export const currentFootprintForwardWriterWorkflowRecordSchema = z.strictObject({ schema: z.literal("easyeda-pro-control.footprint-forward-flow-record.v1"), operationId: currentFootprintForwardWriterWorkflowIdSchema,
  sequence: z.number().int().min(0).max(BUDGET.records - 1), previousSha256: digest.nullable(), kind: z.enum(CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_PHASES), evidence: z.record(z.string(), z.unknown()),
  executionAuthorized: z.literal(false), saveAuthorized: z.literal(false) }).superRefine((value, context) => {
    const parsed = currentFootprintForwardWriterWorkflowEvidenceSchemas[value.kind].safeParse(value.evidence);
    if (!parsed.success) { context.addIssue({ code: "custom", path: ["evidence"], message: "Malformed fixed workflow evidence." }); }
    if ((value.kind === "cleanup-intent" || value.kind === "cleanup-result") && value.evidence["action"] !== "termination" && value.evidence["attempt"] !== 1) {
      context.addIssue({ code: "custom", path: ["evidence", "attempt"], message: "Only original termination observation has multiple attempts." });
    }
  });
export type CurrentFootprintForwardWriterWorkflowRecord = Readonly<z.infer<typeof currentFootprintForwardWriterWorkflowRecordSchema>>;
