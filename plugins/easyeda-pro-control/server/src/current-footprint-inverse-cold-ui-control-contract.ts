/** Separate readonly UI continuation; historical inverse V1 projections stay immutable. */
import { z } from "zod";
import { currentFootprintInverseFullWorkflowIdSchema, currentFootprintInverseFullWorkflowResultSchema } from "./current-footprint-inverse-full-workflow-contract.ts";
import { COLD_UI_STAGES, coldUiAbsenceResultSchema } from "./current-footprint-inverse-native-delete-cold-ui-contract.ts";

export const CURRENT_FOOTPRINT_INVERSE_COLD_UI_CONTROL_TOOL = "easyeda_control_current_footprint_inverse_cold_ui";
export const CURRENT_FOOTPRINT_INVERSE_COLD_UI_CONTROL_SCHEMA = "easyeda-pro-control.footprint-inverse-cold-ui-control.v1";
export const CURRENT_FOOTPRINT_INVERSE_COLD_UI_CLEANUP_ACTIONS = ["inspect", "cleanup", "settle-publication"] as const;
export const currentFootprintInverseColdUiControlIdSchema = z.string().max(96).regex(/^footprint-inverse-cold-ui-flow-[a-z0-9][a-z0-9-]*$(?![\s\S])/u);
export const currentFootprintInverseColdUiControlActionSchema = z.discriminatedUnion("action", [
 z.strictObject({schema:z.literal(CURRENT_FOOTPRINT_INVERSE_COLD_UI_CONTROL_SCHEMA),action:z.literal("execute"),operationId:currentFootprintInverseColdUiControlIdSchema,sourceOperationId:currentFootprintInverseFullWorkflowIdSchema,
  confirmValidationOnly:z.literal(true),confirmDisposableProject:z.literal(true),confirmIndependentColdUiGeneration:z.literal(true),
  acceptExistingProfileOpeningAndCacheEffects:z.literal(true),acceptDebuggerPauseEffects:z.literal(true),confirmNormalCloseWithoutExplicitSave:z.literal(true),acceptNoPublicSdkParity:z.literal(true),
 }).refine(value=>value.operationId.slice("footprint-inverse-cold-ui-flow-".length)===value.sourceOperationId.slice("footprint-inverse-flow-".length)),
 z.strictObject({schema:z.literal(CURRENT_FOOTPRINT_INVERSE_COLD_UI_CONTROL_SCHEMA),action:z.literal("cleanup"),operationId:currentFootprintInverseColdUiControlIdSchema,confirmOriginalJobsOnly:z.literal(true)}),
 z.strictObject({schema:z.literal(CURRENT_FOOTPRINT_INVERSE_COLD_UI_CONTROL_SCHEMA),action:z.enum(["inspect","settle-publication"]),operationId:currentFootprintInverseColdUiControlIdSchema}),
]);
export type CurrentFootprintInverseColdUiControlAction = z.infer<typeof currentFootprintInverseColdUiControlActionSchema>;
export type CurrentFootprintInverseColdUiControlExecution = Extract<CurrentFootprintInverseColdUiControlAction,{action:"execute"}>;
export const currentFootprintInverseColdUiControlResultSchema = z.strictObject({
 schema:z.literal("easyeda-pro-control.footprint-inverse-cold-ui-operation.v1"),action:z.enum(["execute",...CURRENT_FOOTPRINT_INVERSE_COLD_UI_CLEANUP_ACTIONS]),
 operationId:currentFootprintInverseColdUiControlIdSchema,sourceOperationId:currentFootprintInverseFullWorkflowIdSchema,
 state:z.enum(["running","needs-cleanup","stopped","completed"]),stage:z.enum(COLD_UI_STAGES),
 execution:z.strictObject({attempted:z.literal(true),settled:z.boolean(),failed:z.boolean()}),
 cleanup:z.strictObject({requested:z.boolean(),settled:z.boolean(),failed:z.boolean(),originalResourcesClosed:z.boolean(),publicationPending:z.boolean(),journalTerminal:z.boolean(),journalUnsettled:z.boolean()}),
 publication:z.strictObject({attempted:z.boolean(),settled:z.boolean(),failed:z.boolean()}),
 diagnostic:z.strictObject({originalFailureRetained:z.boolean(),code:z.string().regex(/^[A-Z][A-Z0-9_:-]{0,255}$/u).nullable()}),
 originalInverse:currentFootprintInverseFullWorkflowResultSchema,coldUiAbsence:coldUiAbsenceResultSchema.nullable(),nativeUiTaskAbsenceVerified:z.boolean(),
 validationOnly:z.literal(true),connectedValidation:z.literal(false),ordinaryProjectsSupported:z.literal(false),generalSdkWriter:z.literal(false),
 publicSdkParity:z.literal(false),wholeInverseVerified:z.literal(false),executionAuthorized:z.literal(false),saveAuthorized:z.literal(false),explicitSaveAttempts:z.literal(0),
}).refine(value=>value.operationId.slice("footprint-inverse-cold-ui-flow-".length)===value.sourceOperationId.slice("footprint-inverse-flow-".length)&&value.originalInverse.operationId===value.sourceOperationId&&
 value.nativeUiTaskAbsenceVerified===(value.coldUiAbsence!==null)&&
 (value.coldUiAbsence===null||value.coldUiAbsence.targetUuid===value.originalInverse.targetUuid)&&
 (value.state!=="completed"||value.coldUiAbsence!==null&&value.execution.settled&&!value.execution.failed&&value.cleanup.originalResourcesClosed&&!value.cleanup.publicationPending&&value.cleanup.journalTerminal&&!value.cleanup.journalUnsettled&&value.publication.settled&&!value.publication.failed));
export type CurrentFootprintInverseColdUiControlResult = z.infer<typeof currentFootprintInverseColdUiControlResultSchema>;
