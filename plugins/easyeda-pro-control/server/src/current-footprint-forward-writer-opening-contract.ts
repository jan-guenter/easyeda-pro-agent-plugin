/** Separate managed producer-capable full-writer opening lifecycle. These durable descriptions
 * cannot recreate a native owner or admit a create, clock, Save or saved read. */
import { z } from "zod";
import { currentDisposableOpenTargetSchema } from "./current-disposable-open.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_PURPOSE } from "./current-footprint-forward-writer-profile.ts";
import { currentFootprintForwardWriterHeadInputRequestSchema } from "./current-footprint-forward-writer-head-input.ts";
import { CURRENT_FOOTPRINT_COPY_EXECUTION_LIMITS } from "./current-footprint-copy-execution.ts";

export const CURRENT_FOOTPRINT_FORWARD_WRITER_OPENING_PROFILE = "private.current-footprint-forward-writer-opening.v1";
export const CURRENT_FOOTPRINT_FORWARD_WRITER_OPENING_NORMAL_STAGES = [
  "prepare", "allocation", "launch", "main", "browser", "frames", "ui-source", "handoff", "opening", "assignments", "ui", "state", "source", "preparation", "seal",
] as const;
// Eight cache jobs have three source-held phases; startup sync has nine calls.
// Head observation, producer arming and the two optional settlement samples add four.
export const CURRENT_FOOTPRINT_FORWARD_WRITER_OPENING_PRODUCER_STEPS=8*3+9+4;
const baseNormalRecords=1+2*CURRENT_FOOTPRINT_FORWARD_WRITER_OPENING_NORMAL_STAGES.length;
const normalRecords=baseNormalRecords+2*CURRENT_FOOTPRINT_FORWARD_WRITER_OPENING_PRODUCER_STEPS;
const terminationObservations = CURRENT_FOOTPRINT_COPY_EXECUTION_LIMITS.terminationObservationsPerGeneration;
const cleanupRecords = 1 + 2 + 2 + 2 * terminationObservations + 2;
const normalRecordBytes = 262_144;
const sourceRecordBytes = 4 * 1024 * 1024 + 65_536 + 8192;
const cleanupRecordBytes = 4096;
const producerRecordBytes=4096;
const normalBytes=(baseNormalRecords-1)*normalRecordBytes+sourceRecordBytes+2*CURRENT_FOOTPRINT_FORWARD_WRITER_OPENING_PRODUCER_STEPS*producerRecordBytes;
/** Reserve the complete opening journal, including failure, normal close,
 * original abort, every finite termination pair and final release. This is
 * logical publication headroom, never a whole writer/native reservation. */
export const CURRENT_FOOTPRINT_FORWARD_WRITER_OPENING_BUDGET = Object.freeze({
  normalRecords, cleanupRecords, records: normalRecords + cleanupRecords, terminationObservations,
  normalRecordBytes, sourceRecordBytes, cleanupRecordBytes, producerRecordBytes,
  normalBytes,
  cleanupBytes: cleanupRecords * cleanupRecordBytes,
  artifactPathUnits: 8192,
  manifestBytes: normalBytes + cleanupRecords * cleanupRecordBytes + (normalRecords + cleanupRecords) * (8192 + 512) + 65_536,
  wholeWriterReserved: false,
});
export const currentFootprintForwardWriterOpeningIdSchema = currentFootprintForwardWriterHeadInputRequestSchema.shape.operationId;
export const currentFootprintForwardWriterOpeningRequestSchema = z.object({
  operationId: currentFootprintForwardWriterOpeningIdSchema, target: currentDisposableOpenTargetSchema,
  footprintUuid: z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$(?![\s\S])/u),
  confirmDisposableProject: z.literal(true), acceptExistingProfileEffects: z.literal(true),
  acceptNormalOpenEffects: z.literal(true), acceptDebuggerPauseEffects: z.literal(true),
}).strict();
export type CurrentFootprintForwardWriterOpeningRequest = Readonly<z.infer<typeof currentFootprintForwardWriterOpeningRequestSchema>>;
export const CURRENT_FOOTPRINT_FORWARD_WRITER_OPENING_PHASES = [
  "producer-intent", "producer-result", "operation-intent", "prepare-intent", "prepare-result", "allocation-intent", "allocation-result", "launch-intent", "binding",
  "main-intent", "main-result", "browser-intent", "browser-result", "frames-intent", "frames-result", "ui-source-intent", "ui-source-result",
  "handoff-intent", "handoff-result", "opening-intent", "opening-result", "assignments-intent", "assignments-result", "ui-intent", "ui-result",
  "state-intent", "state-result", "source-intent", "source-result", "preparation-intent", "preparation-result", "seal-intent", "seal-result",
  "close-intent", "close-result", "abort-intent", "abort-result", "termination-intent", "termination-result", "release-intent", "release-result",
  "cleanup-unowned-helper", "no-process-release-intent", "cleanup-before-launch", "cleanup-unlaunched-owner", "cleanup-no-process", "cleanup-no-allocation", "failure",
] as const;
export type CurrentFootprintForwardWriterOpeningPhase = typeof CURRENT_FOOTPRINT_FORWARD_WRITER_OPENING_PHASES[number];
const digest = z.string().regex(/^[a-f\d]{64}$(?![\s\S])/u);
/** Optional producer evidence in newly written allocation intents. Its own
 * version describes the completed installation verifier, never native custody
 * or permission to reinterpret older records that omitted this subobject. */
export const currentFootprintForwardWriterOpeningProducerEvidenceSchema = z.object({
  schema: z.literal("easyeda-pro-control.footprint-forward-writer-opening-producer.v1"),
  source: z.literal("verifyCurrentPcb209DiagnosticInstallation"),
  facadeSha256: digest, installationSha256: digest,
}).strict();
export type CurrentFootprintForwardWriterOpeningProducerEvidence = Readonly<z.infer<typeof currentFootprintForwardWriterOpeningProducerEvidenceSchema>>;
export const currentFootprintForwardWriterOpeningRecordSchema = z.object({
  schema: z.literal("easyeda-pro-control.footprint-forward-writer-opening-record.v1"),
  operationId: currentFootprintForwardWriterOpeningIdSchema, sequence: z.number().int().min(0).max(CURRENT_FOOTPRINT_FORWARD_WRITER_OPENING_BUDGET.records - 1),
  previousSha256: digest.nullable(), kind: z.enum(CURRENT_FOOTPRINT_FORWARD_WRITER_OPENING_PHASES),
  evidence: z.record(z.string(), z.unknown()), executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).strict();
export type CurrentFootprintForwardWriterOpeningRecord = Readonly<z.infer<typeof currentFootprintForwardWriterOpeningRecordSchema>>;
export const currentFootprintForwardWriterOpeningResultSchema = z.object({
  schema: z.literal("easyeda-pro-control.footprint-forward-writer-source-input.v1"),
  purpose: z.literal(CURRENT_FOOTPRINT_FORWARD_WRITER_PURPOSE), operationId: currentFootprintForwardWriterOpeningIdSchema,
  bindingSha256: digest, checkpointSha256: digest, beforeSqlSha256: digest,
  sourcePlanSha256: digest, sourcePacketSha256: digest, preparationSha256: digest,
  originalOpeningRetained: z.literal(true), sameWriterSourceSealed: z.literal(true),
  wholeWriterReserved: z.literal(false), routeAndClocksQualified: z.literal(false),
  executionReady: z.literal(false), executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).strict();
export type CurrentFootprintForwardWriterOpeningResult = Readonly<z.infer<typeof currentFootprintForwardWriterOpeningResultSchema>>;
