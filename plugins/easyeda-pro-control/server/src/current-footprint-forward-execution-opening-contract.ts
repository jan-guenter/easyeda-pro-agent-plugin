/** Separate managed same-writer input lifecycle. These durable descriptions
 * cannot recreate a native owner or admit a create, clock, Save or saved read. */
import { z } from "zod";
import { currentDisposableOpenTargetSchema } from "./current-disposable-open.ts";
import { CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE, currentFootprintForwardExecutionGenerationSchema } from "./current-footprint-forward-execution-contract.ts";
import { CURRENT_FOOTPRINT_COPY_EXECUTION_LIMITS } from "./current-footprint-copy-execution.ts";

export const CURRENT_FOOTPRINT_FORWARD_EXECUTION_OPENING_PROFILE = "private.current-footprint-forward-execution-opening.v2";
export const CURRENT_FOOTPRINT_FORWARD_EXECUTION_OPENING_NORMAL_STAGES = [
  "prepare", "allocation", "launch", "main", "browser", "frames", "ui-source", "handoff", "opening", "assignments", "ui", "state", "source", "preparation", "seal",
] as const;
const normalRecords = 1 + 2 * CURRENT_FOOTPRINT_FORWARD_EXECUTION_OPENING_NORMAL_STAGES.length;
const terminationObservations = CURRENT_FOOTPRINT_COPY_EXECUTION_LIMITS.terminationObservationsPerGeneration;
const cleanupRecords = 1 + 2 + 2 + 2 * terminationObservations + 2;
const normalRecordBytes = 262_144;
const sourceRecordBytes = 4 * 1024 * 1024 + 65_536 + 8192;
const cleanupRecordBytes = 4096;
/** Reserve the complete opening journal, including failure, normal close,
 * original abort, every finite termination pair and final release. This is
 * logical publication headroom, never a whole writer/native reservation. */
export const CURRENT_FOOTPRINT_FORWARD_EXECUTION_OPENING_BUDGET = Object.freeze({
  normalRecords, cleanupRecords, records: normalRecords + cleanupRecords, terminationObservations,
  normalRecordBytes, sourceRecordBytes, cleanupRecordBytes,
  normalBytes: (normalRecords - 1) * normalRecordBytes + sourceRecordBytes,
  cleanupBytes: cleanupRecords * cleanupRecordBytes,
  artifactPathUnits: 8192,
  manifestBytes: (normalRecords - 1) * normalRecordBytes + sourceRecordBytes + cleanupRecords * cleanupRecordBytes + (normalRecords + cleanupRecords) * (8192 + 512) + 65_536,
  wholeWriterReserved: false,
});
export const currentFootprintForwardExecutionOpeningIdSchema = currentFootprintForwardExecutionGenerationSchema.shape.operationId;
export const currentFootprintForwardExecutionOpeningRequestSchema = z.object({
  operationId: currentFootprintForwardExecutionOpeningIdSchema, target: currentDisposableOpenTargetSchema,
  footprintUuid: z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$(?![\s\S])/u),
  confirmDisposableProject: z.literal(true), acceptExistingProfileEffects: z.literal(true),
  acceptNormalOpenEffects: z.literal(true), acceptDebuggerPauseEffects: z.literal(true),
}).strict();
export type CurrentFootprintForwardExecutionOpeningRequest = Readonly<z.infer<typeof currentFootprintForwardExecutionOpeningRequestSchema>>;
export const CURRENT_FOOTPRINT_FORWARD_EXECUTION_OPENING_PHASES = [
  "operation-intent", "prepare-intent", "prepare-result", "allocation-intent", "allocation-result", "launch-intent", "binding",
  "main-intent", "main-result", "browser-intent", "browser-result", "frames-intent", "frames-result", "ui-source-intent", "ui-source-result",
  "handoff-intent", "handoff-result", "opening-intent", "opening-result", "assignments-intent", "assignments-result", "ui-intent", "ui-result",
  "state-intent", "state-result", "source-intent", "source-result", "preparation-intent", "preparation-result", "seal-intent", "seal-result",
  "close-intent", "close-result", "abort-intent", "abort-result", "termination-intent", "termination-result", "release-intent", "release-result",
  "no-process-release-intent", "cleanup-before-launch", "cleanup-no-process", "cleanup-no-allocation", "failure",
] as const;
export type CurrentFootprintForwardExecutionOpeningPhase = typeof CURRENT_FOOTPRINT_FORWARD_EXECUTION_OPENING_PHASES[number];
const digest = z.string().regex(/^[a-f\d]{64}$(?![\s\S])/u);
export const currentFootprintForwardExecutionOpeningRecordSchema = z.object({
  schema: z.literal("easyeda-pro-control.footprint-forward-execution-opening-record.v2"),
  operationId: currentFootprintForwardExecutionOpeningIdSchema, sequence: z.number().int().min(0).max(CURRENT_FOOTPRINT_FORWARD_EXECUTION_OPENING_BUDGET.records - 1),
  previousSha256: digest.nullable(), kind: z.enum(CURRENT_FOOTPRINT_FORWARD_EXECUTION_OPENING_PHASES),
  evidence: z.record(z.string(), z.unknown()), executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).strict();
export type CurrentFootprintForwardExecutionOpeningRecord = Readonly<z.infer<typeof currentFootprintForwardExecutionOpeningRecordSchema>>;
export const currentFootprintForwardExecutionOpeningResultSchema = z.object({
  schema: z.literal("easyeda-pro-control.footprint-forward-execution-source-input.v2"),
  purpose: z.literal(CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE), operationId: currentFootprintForwardExecutionOpeningIdSchema,
  bindingSha256: digest, checkpointSha256: digest, beforeSqlSha256: digest,
  sourcePlanSha256: digest, sourcePacketSha256: digest, preparationSha256: digest,
  originalOpeningRetained: z.literal(true), sameWriterSourceSealed: z.literal(true),
  wholeWriterReserved: z.literal(false), routeAndClocksQualified: z.literal(false),
  executionReady: z.literal(false), executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).strict();
export type CurrentFootprintForwardExecutionOpeningResult = Readonly<z.infer<typeof currentFootprintForwardExecutionOpeningResultSchema>>;
