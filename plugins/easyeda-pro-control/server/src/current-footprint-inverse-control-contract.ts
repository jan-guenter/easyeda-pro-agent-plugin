/** Separately versioned disposable inverse control. Source and native custody
 * come only from the same retained forward coordinator, never input JSON. */
import { z } from "zod";
import { CURRENT_FOOTPRINT_INVERSE_FULL_WORKFLOW_STAGES, currentFootprintInverseFullWorkflowIdSchema, currentFootprintInverseFullWorkflowRequestSchema, currentFootprintInverseFullWorkflowResultSchema } from "./current-footprint-inverse-full-workflow-contract.ts";

export const CURRENT_FOOTPRINT_INVERSE_CONTROL_TOOL = "easyeda_control_current_footprint_inverse";
export const CURRENT_FOOTPRINT_INVERSE_CONTROL_SCHEMA = "easyeda-pro-control.footprint-inverse-control.v1";
export const CURRENT_FOOTPRINT_INVERSE_CONTROL_CLEANUP_ACTIONS = ["inspect", "cleanup", "settle-publication"] as const;
export const currentFootprintInverseControlActionSchema = z.discriminatedUnion("action", [
 z.strictObject({ schema:z.literal(CURRENT_FOOTPRINT_INVERSE_CONTROL_SCHEMA), ...currentFootprintInverseFullWorkflowRequestSchema.shape, action:z.literal("execute"),
  confirmValidationOnly:z.literal(true), confirmDisposableProject:z.literal(true) }).refine(value =>
   value.operationId.slice("footprint-inverse-flow-".length)===value.sourceOperationId.slice("footprint-forward-flow-".length)),
 z.strictObject({ schema:z.literal(CURRENT_FOOTPRINT_INVERSE_CONTROL_SCHEMA), action:z.literal("cleanup"), operationId:currentFootprintInverseFullWorkflowIdSchema, confirmOriginalJobsOnly:z.literal(true) }),
 z.strictObject({ schema:z.literal(CURRENT_FOOTPRINT_INVERSE_CONTROL_SCHEMA), action:z.enum(["inspect","settle-publication"]), operationId:currentFootprintInverseFullWorkflowIdSchema }),
]);
export type CurrentFootprintInverseControlAction = z.infer<typeof currentFootprintInverseControlActionSchema>;
export type CurrentFootprintInverseControlExecution = Extract<CurrentFootprintInverseControlAction,{action:"execute"}>;
export const currentFootprintInverseControlResultSchema = z.strictObject({
 schema:z.literal("easyeda-pro-control.footprint-inverse-operation.v1"),
 action:z.enum(["execute",...CURRENT_FOOTPRINT_INVERSE_CONTROL_CLEANUP_ACTIONS]),
 operationId:currentFootprintInverseFullWorkflowIdSchema, sourceOperationId:currentFootprintInverseFullWorkflowRequestSchema.shape.sourceOperationId,
 state:z.enum(["running","needs-cleanup","stopped","completed"]), stage:z.enum(CURRENT_FOOTPRINT_INVERSE_FULL_WORKFLOW_STAGES),
 execution:z.strictObject({attempted:z.literal(true),settled:z.boolean(),failed:z.boolean()}),
 cleanup:z.strictObject({requested:z.boolean(),settled:z.boolean(),failed:z.boolean(),originalResourcesClosed:z.boolean(),publicationPending:z.boolean(),cleanupPublicationPending:z.boolean()}),
 publication:z.strictObject({attempted:z.boolean(),settled:z.boolean(),failed:z.boolean()}),
 diagnostic:z.strictObject({originalFailureRetained:z.boolean(),code:z.string().regex(/^[A-Z][A-Z0-9_:-]{0,255}$/u).nullable()}),
 completed:currentFootprintInverseFullWorkflowResultSchema.nullable(),
 managerOnlyColdAbsence:z.literal(true),nativeUiTaskAbsenceVerified:z.literal(false),publicSdkParity:z.literal(false),wholeInverseVerified:z.literal(false),
 validationOnly:z.literal(true),connectedValidation:z.literal(false),ordinaryProjectsSupported:z.literal(false),generalSdkWriter:z.literal(false),
 executionAuthorized:z.literal(false),saveAuthorized:z.literal(false),explicitSaveAttempts:z.literal(0),
 }).refine(value=>value.operationId.slice("footprint-inverse-flow-".length)===value.sourceOperationId.slice("footprint-forward-flow-".length)&&(value.completed===null||value.completed.operationId===value.operationId&&value.completed.sourceOperationId===value.sourceOperationId)&&
 (value.state!=="completed"||value.completed!==null&&value.execution.settled&&value.cleanup.originalResourcesClosed&&!value.cleanup.publicationPending&&value.publication.settled));
export type CurrentFootprintInverseControlResult = z.infer<typeof currentFootprintInverseControlResultSchema>;
