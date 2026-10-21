/** Bounded evidence vocabulary for the original String-purpose common stage.
 * These data schemas validate records, not retained execution authority. */
import { z } from "zod";
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { requireOriginalCurrentPcbCommonBaselineReplies } from "./current-pcb-common-baseline-runner.ts";
import { currentPcbCommonRunnerFailureDetail, currentPcbCommonRunnerFailureSchema } from "./current-pcb-common-baseline-failure.ts";
import type { CurrentPcbCommonBaselineObservation } from "./current-pcb-common-baseline-runner.ts";
import type { CurrentPcbCommonBaselinePacket } from "./current-pcb-common-baseline-session.ts";
import type { CurrentPcbCommonHistoricalHeader } from "./current-pcb-common-stored-relation.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const digest = z.string().regex(/^[a-f\d]{64}$/u);
export const currentPcbCommonIdentitySchema = z.object({ projectUuid: z.string().regex(/^(?:[a-f\d]{32}|[a-f\d]{64})$/u),
  branchUuid: z.string().regex(/^[a-f\d]{32}$/u), documentUuid: z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u) }).strict();
const replyNames = ["presentation", "rules", "preference", "assets", "metadata"] as const;
const hashes = z.object({ presentation: digest, rules: digest, preference: digest, assets: digest, metadata: digest }).strict();
const claims = { atomicSnapshotVerified: z.literal(false), continuousObservation: z.literal(false),
  completeLiveBaselineVerified: z.literal(false), completeStoredAssetsOwnershipVerified: z.literal(false),
  queueCompletionVerified: z.literal(false), completeEffectVerified: z.literal(false),
  closedFileOwnershipVerified: z.literal(false), savedVerified: z.literal(false), reopenedVerified: z.literal(false),
  saveAuthorized: z.literal(false), executionAuthorized: z.literal(false) };
const matchedResult = z.object({
  schema: z.literal("easyeda-pro-control.pcb-common-baseline-observation.v1"), identity: currentPcbCommonIdentitySchema,
  beforeSqlSha256: digest, checkpointSha256: digest, historicalHeaderSha256: digest,
  observationSha256: digest, relationSha256: digest, packetSha256: digest, retainedReplySha256: hashes,
  commonRowCount: z.number().int().min(1).max(2049), documentCount: z.number().int().min(1).max(65_536),
  originalRunnerIssued: z.literal(true), originalCompletedSqlReaderRetained: z.literal(true),
  historicalHeaderJoined: z.literal(true), completeTargetCommonAndMetaMatched: z.literal(true),
  ...claims,
}).strict();
const refusedResult = z.object({
  schema: z.literal("easyeda-pro-control.pcb-common-baseline-refusal.v1"), identity: currentPcbCommonIdentitySchema,
  beforeSqlSha256: digest, checkpointSha256: digest, historicalHeaderSha256: digest,
  observationSha256: digest, retainedReplySha256: hashes, phase: z.literal("stored-relation"),
  comparisonAccepted: z.literal(false), originalRunnerIssued: z.literal(true), originalContextsRechecked: z.literal(true),
  independentPrecreateNotBlocked: z.literal(true), ...claims,
}).strict();
export const currentPcbCommonBaselineResultSchema = z.discriminatedUnion("schema", [matchedResult, refusedResult]);
export type CurrentPcbCommonBaselineResult = z.infer<typeof currentPcbCommonBaselineResultSchema>;
export function currentPcbCommonBaselineResult(packet: CurrentPcbCommonBaselinePacket): CurrentPcbCommonBaselineResult {
  const { profile: _profile, historicalHeader: _header, relation: _relation, originalOwnerVerified: _owner, ...summary } = packet;
  return freezeDeep(currentPcbCommonBaselineResultSchema.parse({ ...summary,
    schema: "easyeda-pro-control.pcb-common-baseline-observation.v1", beforeSqlSha256: packet.relation.common.beforeSqlSha256,
    checkpointSha256: packet.relation.common.checkpointSha256, historicalHeaderSha256: packet.historicalHeader.headerSha256,
    relationSha256: packet.relation.relationSha256, commonRowCount: packet.relation.common.rows.length,
    documentCount: packet.relation.common.documentCount,
  }));
}

const text = z.string().max(524_288).refine(value => value.isWellFormed() && Buffer.byteLength(value) <= 524_288);
const reply = z.object({ result: z.object({ type: z.literal("string"), value: text }).strict() }).strict();
const rawReplies = z.object({ presentation: reply, rules: reply, preference: reply, assets: reply, metadata: reply }).strict();
export const CURRENT_PCB_COMMON_FAILURE_MAX_BYTES = 6 * 1024 * 1024;
export const currentPcbCommonBaselineFailureSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-common-baseline-failure.v1"), identity: currentPcbCommonIdentitySchema,
  phase: z.enum(["owner-before", "historical-header", "observation", "stored-relation", "owner-final", "owner-after"]),
  historicalHeader: z.object({ headerText: z.string().max(16_384), headerSha256: digest, beforeSqlSha256: digest,
    checkpointSha256: digest }).strict().nullable(),
  originalReplies: rawReplies.nullable(), retainedReplySha256: hashes.nullable(), observationSha256: digest.nullable(),
  runnerFailure: currentPcbCommonRunnerFailureSchema.nullable(),
  originalRunnerIssued: z.boolean(), comparisonAccepted: z.literal(false), nativeContinuationAllowed: z.boolean(), executionAuthorized: z.literal(false),
}).strict().refine(value => value.originalRunnerIssued === (value.originalReplies !== null) &&
  (!value.nativeContinuationAllowed || value.phase === "stored-relation" && value.originalReplies !== null && value.historicalHeader !== null && value.runnerFailure === null) &&
  (value.originalReplies === null) === (value.retainedReplySha256 === null) &&
  (value.originalReplies === null) === (value.observationSha256 === null) &&
  (value.historicalHeader === null || sha256Text(value.historicalHeader.headerText) === value.historicalHeader.headerSha256) &&
  (value.originalReplies === null || replyNames.every(name => sha256Text(value.originalReplies?.[name].result.value ?? "") === value.retainedReplySha256?.[name])) &&
  Buffer.byteLength(canonicalJson(value)) <= CURRENT_PCB_COMMON_FAILURE_MAX_BYTES, "Common failure evidence differs or exceeds its bound.");
export type CurrentPcbCommonBaselineFailure = z.infer<typeof currentPcbCommonBaselineFailureSchema>;
/** MCP inspection stays below its existing response limit. Full original raw
 * replies are retained in the immutable journal, not repeated in tool output. */
export function currentPcbCommonBaselineFailureSummary(failure: CurrentPcbCommonBaselineFailure): Readonly<Record<string, unknown>> {
  const { originalReplies, historicalHeader, ...summary } = failure;
  const rawReplyBytes = originalReplies === null ? null : Object.fromEntries(replyNames.map(name => [name, Buffer.byteLength(originalReplies[name].result.value)]));
  return freezeDeep({ ...summary, schema: "easyeda-pro-control.pcb-common-baseline-failure-summary.v1", rawReplyBytes,
    historicalHeader: historicalHeader === null ? null : { headerSha256: historicalHeader.headerSha256,
      beforeSqlSha256: historicalHeader.beforeSqlSha256, checkpointSha256: historicalHeader.checkpointSha256,
      bytes: Buffer.byteLength(historicalHeader.headerText) },
    retainedFailureSha256: sha256Json(failure), rawRepliesIncluded: false });
}
export function currentPcbCommonBaselineFailure(identity: CurrentPcbCommonBaselineFailure["identity"],
  phase: CurrentPcbCommonBaselineFailure["phase"], observation: CurrentPcbCommonBaselineObservation | null,
  header: CurrentPcbCommonHistoricalHeader | null, nativeContinuationAllowed = false, originalError: unknown = null): CurrentPcbCommonBaselineFailure {
  const replies = observation === null ? null : requireOriginalCurrentPcbCommonBaselineReplies(observation);
  const retainedReplySha256 = replies === null ? null : Object.fromEntries(replyNames.map(name => [name, sha256Text(replies[name].result.value)]));
  return freezeDeep(currentPcbCommonBaselineFailureSchema.parse({ schema: "easyeda-pro-control.pcb-common-baseline-failure.v1", identity, phase,
    historicalHeader: header === null ? null : { headerText: header.headerText, headerSha256: header.headerSha256,
      beforeSqlSha256: header.beforeSqlSha256, checkpointSha256: header.checkpointSha256 },
    originalReplies: replies, retainedReplySha256,
    runnerFailure: currentPcbCommonRunnerFailureDetail(originalError), originalRunnerIssued: replies !== null,
    observationSha256: observation === null ? null : sha256Json(observation), comparisonAccepted: false, nativeContinuationAllowed, executionAuthorized: false }));
}

export function currentPcbCommonBaselineRefusal(failure: CurrentPcbCommonBaselineFailure,
  observationSha256: string): CurrentPcbCommonBaselineResult {
  if (!failure.nativeContinuationAllowed || failure.historicalHeader === null || failure.retainedReplySha256 === null || failure.observationSha256 !== observationSha256) {
    throw new Error("PCB_COMMON_BASELINE_REFUSAL_UNAVAILABLE");
  }
  const limits = Object.fromEntries(Object.keys(claims).map(key => [key, false]));
  return freezeDeep(refusedResult.parse({ schema: "easyeda-pro-control.pcb-common-baseline-refusal.v1", identity: failure.identity,
    beforeSqlSha256: failure.historicalHeader.beforeSqlSha256, checkpointSha256: failure.historicalHeader.checkpointSha256,
    historicalHeaderSha256: failure.historicalHeader.headerSha256, observationSha256, retainedReplySha256: failure.retainedReplySha256,
    phase: "stored-relation", comparisonAccepted: false, originalRunnerIssued: true, originalContextsRechecked: true,
    independentPrecreateNotBlocked: true, ...limits }));
}
