/** Separate durable continuation; no historical result or stage is widened. */
import {z} from "zod";

export const COLD_UI_PREFIX="footprint-inverse-cold-ui-";
export const COLD_UI_PROFILE="private.current-footprint-inverse-native-delete-cold-ui-stage.v1";
export const COLD_UI_PURPOSE="readonly-cold-ui-negative-task";
export const COLD_UI_STAGES=["checkpoint","birth","read","window","close","exit","observers","release","absence"]as const;
export const coldUiIdSchema=z.string().regex(/^footprint-inverse-cold-ui-[a-f\d]{32}$(?![\s\S])/u);
const hash=z.string().regex(/^[a-f\d]{64}$(?![\s\S])/u);
export const coldUiStageRequestSchema=z.strictObject({operationId:coldUiIdSchema,parentOperationId:z.string().min(1).max(96).regex(/^[A-Za-z\d_.:-]+$(?![\s\S])/u),sourceSha256:hash,
 documentUuid:z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$(?![\s\S])/u),readonlyContinuation:z.literal(true),saveRequests:z.literal(0)});
const normal=["checkpoint-intent","checkpoint-result","birth-intent","birth-result","read-intent","read-result","window-intent","window-result","close-intent","close-result","exit-intent","exit-result","observers-intent","observers-result","release-intent","release-result","absence-intent","absence-result"]as const;
export const coldUiRecordSchema=z.strictObject({schema:z.literal("easyeda-pro-control.footprint-inverse-cold-ui-stage-record.v1"),operationId:coldUiIdSchema,
 sequence:z.number().int().nonnegative().max(23),previousSha256:hash.nullable(),
 kind:z.enum(["operation-intent",...normal,"failure","cleanup-intent","cleanup-result","terminal-success","terminal-failure"]),evidence:z.record(z.string(),z.unknown()),executionAuthorized:z.literal(false),saveAuthorized:z.literal(false)});
export type ColdUiStageRequest=Readonly<z.infer<typeof coldUiStageRequestSchema>>;
export type ColdUiStageRecord=Readonly<z.infer<typeof coldUiRecordSchema>>;
export type ColdUiStagePhase=ColdUiStageRecord["kind"];
export const COLD_UI_JOURNAL_BUDGET=Object.freeze({records:24,normalRecords:20,cleanupRecords:4,recordBytes:4096,manifestBytes:196_608,artifactPathUnits:4096});

export const coldUiAbsenceResultSchema=z.strictObject({
 profile:z.literal("private.current-footprint-inverse-native-delete-cold-ui-absence.v1"),targetUuid:z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$(?![\s\S])/u),maximumTicket:z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
 nativeManagerColdAbsenceVerified:z.literal(true),originalUiTaskColdAbsenceVerified:z.literal(true),originalUiInvocations:z.literal(1),
 originalColdRootAndWholeJobExited:z.literal(true),originalColdHelperReleased:z.literal(true),coldGenerationClosureVerified:z.literal(true),
 completeClosedSqlCompared:z.literal(true),logicalSqlUnchangedAfterColdRead:z.literal(true),replayNamespacesAbsentAtOpenFrontier:z.literal(true),
 continuousReplayExclusion:z.literal(false),publicSdkParity:z.literal(false),nativeUiTaskAbsenceVerified:z.literal(true),saveRequests:z.literal(0),
 wholeInverseVerified:z.literal(false),executionAuthorized:z.literal(false),
});
