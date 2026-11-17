/** Controlled disposable full-writer API. No action accepts execution code,
 * a native owner, runtime hooks, a future UUID or a serialized capability. */
import { z } from "zod";
import { currentDisposableOpenTargetSchema } from "./current-disposable-open.ts";
import { currentFootprintForwardWriterHeadInputRequestSchema, currentFootprintForwardWriterInputOperationIdSchema } from "./current-footprint-forward-writer-input-contract.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_STAGES, currentFootprintForwardWriterWorkflowIdSchema } from "./current-footprint-forward-writer-workflow-contract.ts";

export const CURRENT_FOOTPRINT_FORWARD_WRITER_CONTROL_TOOL = "easyeda_control_current_footprint_forward_write";
const operationId = currentFootprintForwardWriterWorkflowIdSchema.refine(value => currentFootprintForwardWriterInputOperationIdSchema.safeParse(value.replace("footprint-forward-flow-", "footprint-forward-writer-")).success);
export const CURRENT_FOOTPRINT_FORWARD_WRITER_CONTROL_CLEANUP_ACTIONS = ["inspect", "cleanup", "settle-publication"] as const;
export const currentFootprintForwardWriterControlActionSchema = z.discriminatedUnion("action", [
 z.strictObject({action:z.literal("prepare"),operationId,target:currentDisposableOpenTargetSchema,footprintUuid:currentFootprintForwardWriterHeadInputRequestSchema.shape.footprintUuid,
  confirmValidationOnly:z.literal(true),confirmDisposableProject:z.literal(true),acceptExistingProfileEffects:z.literal(true),acceptNormalOpenEffects:z.literal(true),acceptDebuggerPauseEffects:z.literal(true)}),
 z.strictObject({action:z.literal("execute"),operationId,confirmDisposableCopy:z.literal(true),confirmCopyTriggeredPersistence:z.literal(true),confirmNoExplicitSave:z.literal(true),acceptUnsupportedInverse:z.literal(true)}),
 z.strictObject({action:z.literal("cleanup"),operationId,confirmOriginalJobsOnly:z.literal(true)}),
 z.strictObject({action:z.enum(["inspect","settle-publication"]),operationId}),
]);
export type CurrentFootprintForwardWriterControlAction = z.infer<typeof currentFootprintForwardWriterControlActionSchema>;
const digest=z.string().regex(/^[a-f0-9]{64}$/u);
export const currentFootprintForwardWriterControlV1CompletionSchema=z.strictObject({
 profile:z.literal("private.current-footprint-forward-writer-workflow-result.v1"),operationId,createdUuid:z.string().regex(/^[a-f0-9]{16}$/u),
 writerSqlSha256:digest,savedSqlSha256:digest,sourceReadSha256:digest,
 originalClosedReadersDistinct:z.literal(true),originalOwnersReleased:z.literal(true),explicitSaveAttempts:z.literal(0),
 savedResultVerified:z.literal(true),inverseAvailable:z.literal(false),executionAuthorized:z.literal(false),
});
export const currentFootprintForwardWriterControlV1ResultSchema=z.strictObject({
 schema:z.literal("easyeda-pro-control.footprint-forward-write-operation.v1"),action:z.enum(["prepare","execute",...CURRENT_FOOTPRINT_FORWARD_WRITER_CONTROL_CLEANUP_ACTIONS]),operationId,
 state:z.enum(["prepared","running","needs-cleanup","stopped","completed"]),stage:z.enum(CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_STAGES),
 execution:z.strictObject({attempted:z.boolean(),settled:z.boolean(),failed:z.boolean()}),
 cleanup:z.strictObject({requested:z.boolean(),settled:z.boolean(),failed:z.boolean(),writerTerminated:z.boolean(),writerReleased:z.boolean(),savedTerminated:z.boolean(),savedReleased:z.boolean(),publicationPending:z.boolean()}),
 diagnostic:z.strictObject({originalFailureRetained:z.boolean(),code:z.string().regex(/^[A-Z][A-Z0-9_:-]{0,255}$/u).nullable()}),
 completed:currentFootprintForwardWriterControlV1CompletionSchema.nullable(),
 validationOnly:z.literal(true),connectedValidation:z.literal(false),ordinaryProjectsSupported:z.literal(false),generalSdkWriter:z.literal(false),inverseAvailable:z.literal(false),explicitSaveAttempts:z.literal(0),
}).refine(value=>(value.state!=="completed"||value.completed!==null&&value.execution.settled&&!value.execution.failed&&value.cleanup.writerReleased&&value.cleanup.savedReleased&&!value.cleanup.publicationPending)&&
 (value.completed===null||value.completed.operationId===value.operationId));
export const currentFootprintForwardWriterControlCompletionSchema=z.strictObject({...currentFootprintForwardWriterControlV1CompletionSchema.shape,
 profile:z.literal("private.current-footprint-forward-writer-workflow-result.v2"),
});
export const currentFootprintForwardWriterControlResultSchema=z.strictObject({...currentFootprintForwardWriterControlV1ResultSchema.shape,
 schema:z.literal("easyeda-pro-control.footprint-forward-write-operation.v2"),completed:currentFootprintForwardWriterControlCompletionSchema.nullable(),
}).refine(value=>(value.state!=="completed"||value.completed!==null&&value.execution.settled&&!value.execution.failed&&value.cleanup.writerReleased&&value.cleanup.savedReleased&&!value.cleanup.publicationPending)&&
 (value.completed===null||value.completed.operationId===value.operationId));
export type CurrentFootprintForwardWriterControlResult=z.infer<typeof currentFootprintForwardWriterControlResultSchema>;
