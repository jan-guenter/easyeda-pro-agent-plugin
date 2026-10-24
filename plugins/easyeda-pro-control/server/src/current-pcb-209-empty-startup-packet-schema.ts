/** Durable evidence decoding only. Parsing JSON never issues an original session or native capability. */
import { z } from "zod";
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { CURRENT_PCB_209_COMMON_BASELINE_PACKET_MAX_BYTES } from "./current-pcb-209-common-baseline-session.ts";
import { CURRENT_PCB_209_EMPTY_BASELINE_PACKET_MAX_BYTES, CURRENT_PCB_209_EMPTY_BASELINE_REQUEST_COUNT } from "./current-pcb-209-empty-baseline-session.ts";
import { CURRENT_PCB_209_OPENING_SCRIPTS } from "./current-pcb-209-opening-profile.ts";
import { CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_RESULT_BYTES } from "./current-pcb-diagnostic-pcb-opening.ts";
import { CURRENT_PCB_209_WORKER_STARTUP_PCB_COMMAND_LIMIT } from "./current-pcb-209-worker-startup-pcb-session.ts";

// Source observations already enforce128KiB; PCB observations enforce16KiB.
// The8KiB remainder covers the fixed PCB, empty-session and journal envelopes.
export const CURRENT_PCB_209_EMPTY_STARTUP_RESULT_MAX_BYTES = CURRENT_PCB_209_EMPTY_BASELINE_PACKET_MAX_BYTES +
  128 * 1024 + CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_RESULT_BYTES + 8192;
const digest = z.string().regex(/^[a-f\d]{64}$/u), id = z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u);
const token = z.string().regex(/^[A-Za-z\d_.:-]{1,128}$/u);
const count = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).refine(value => !Object.is(value, -0));
const identity = z.object({ projectUuid: z.string().regex(/^(?:[a-f\d]{32}|[a-f\d]{64})$/u),
  branchUuid: z.string().regex(/^[a-f\d]{32}$/u), documentUuid: id }).strict();
const noAuthority = { executionAuthorized: z.literal(false), saveAuthorized: z.literal(false) };
const commonLimits = { originalOwnerVerified: z.literal(false), closedFileOwnershipVerified: z.literal(false),
  atomicSnapshotVerified: z.literal(false), continuousObservation: z.literal(false), completeLiveBaselineVerified: z.literal(false),
  completeStoredAssetsOwnershipVerified: z.literal(false), queueCompletionVerified: z.literal(false), completeEffectVerified: z.literal(false),
  savedVerified: z.literal(false), reopenedVerified: z.literal(false), ...noAuthority };
const relationLimits = { ...commonLimits, nativeIntrinsicsVerified: z.literal(false), originalPrototypeIntegrityVerified: z.literal(false),
  metadataObservationProvenanceVerified: z.literal(false), nativeNoMutationVerified: z.literal(false) };
const serializedClient = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("absent") }).strict(), z.object({ kind: z.literal("null") }).strict(),
  z.object({ kind: z.literal("value"), value: z.string() }).strict(),
]);
const commitment = z.object({ chunkIndex: count, recordIndex: count, type: z.string(), id: z.string().nullable(), ticket: count,
  client: z.string().nullable(), serializedClient, inheritedClient: z.string().nullable(), headerSha256: digest,
  bodySha256: digest.nullable(), recordSha256: digest }).strict();
const joinedRow = z.object({ dataType: z.string(), id: z.string(), bodySha256: digest, selected: commitment, sameWinningClockOccurrences: count }).strict();
const commonReplyDigests = z.object({ presentation: digest, rules: digest, preference: digest, assets: digest }).strict();
function size(value: unknown, limit: number): boolean { return Buffer.byteLength(canonicalJson(value)) <= limit; }
function without(value: Readonly<Record<string, unknown>>, keys: readonly string[]): Record<string, unknown> {
  return Object.fromEntries(Object.entries(value).filter(([key]) => !keys.includes(key)));
}
function packetHash(value: Readonly<Record<string, unknown>>): boolean { return value["packetSha256"] === sha256Json(without(value, ["packetSha256"])); }
const historicalHeader = z.object({ profile: z.literal("private.current-pcb-common-historical-header.v1"), identity,
  headerText: z.string().max(16_384), headerSha256: digest, beforeSqlSha256: digest, checkpointSha256: digest, historySha256: digest,
  targetSemanticSha256: digest, selected: commitment, currentOwnerVerified: z.literal(false), closedFileOwnershipVerified: z.literal(false),
  executionAuthorized: z.literal(false) }).strict().refine(value => value.headerSha256 === sha256Text(value.headerText));
const storedRelation = z.object({ profile: z.literal("private.current-pcb-common-stored-relation.v1"), identity,
  suppliedTargetCommonAndMetaMatch: z.literal(true), metadataContract: z.literal("supplied-ordinary-root-header-and-meta-v1"),
  beforeSqlSha256: digest, checkpointSha256: digest, historySha256: digest, completeHistoryLinksSha256: digest,
  historyChunkSha256: z.array(digest), maximumHistoryTicket: count, documentCount: count, peerDocumentsSha256: digest,
  targetSemanticSha256: digest, targetOccurrencesSha256: digest, targetOccurrenceCount: count, selectedHeader: commitment,
  rows: z.array(joinedRow),
  commonEmissionOrder: z.array(z.string()), bodySequenceSha256: digest, presentationGraphSha256: digest, rulesGraphSha256: digest,
  preferenceGraphSha256: digest, suppliedReplySha256: commonReplyDigests, suppliedMetadataSha256: digest,
  structureRowsSha256: digest, structureTextSha256: digest, structureRowCount: count, relationSha256: digest, ...relationLimits,
}).strict().refine(value => value.relationSha256 === sha256Json(without(value,
  ["profile", "suppliedTargetCommonAndMetaMatch", "metadataContract", "relationSha256", ...Object.keys(relationLimits)])));
const metadataRelation = z.object({ profile: z.literal("private.current-pcb-common-metadata-stored-relation.v1"), common: storedRelation,
  compilerUniqueId: z.string(), metadataReplySha256: digest, metadataGraphSha256: digest, metadataBodySha256: digest,
  relationSha256: digest, headerSourceMatched: z.literal(false), ...relationLimits,
}).strict().refine(value => value.relationSha256 === sha256Json(without(value,
  ["profile", "relationSha256", "headerSourceMatched", ...Object.keys(relationLimits)])));
const common = z.object({ profile: z.literal("private.current-pcb209-common-baseline-packet.v1"), identity, historicalHeader,
  relation: metadataRelation, originalRunnerIssued: z.literal(true), originalCompletedSqlReaderRetained: z.literal(true),
  historicalHeaderJoined: z.literal(true), completeTargetCommonAndMetaMatched: z.literal(true), observationSha256: digest,
  retainedReplySha256: commonReplyDigests.extend({ metadata: digest }), packetSha256: digest, ...commonLimits,
}).strict().refine(value => size(value, CURRENT_PCB_209_COMMON_BASELINE_PACKET_MAX_BYTES) && packetHash(value) &&
  canonicalJson(value.identity) === canonicalJson(value.historicalHeader.identity) &&
  canonicalJson(value.identity) === canonicalJson(value.relation.common.identity) &&
  value.historicalHeader.beforeSqlSha256 === value.relation.common.beforeSqlSha256 &&
  value.historicalHeader.checkpointSha256 === value.relation.common.checkpointSha256 &&
  value.historicalHeader.historySha256 === value.relation.common.historySha256 &&
  value.historicalHeader.targetSemanticSha256 === value.relation.common.targetSemanticSha256 &&
  value.historicalHeader.selected.recordSha256 === value.relation.common.selectedHeader.recordSha256);
const marker = z.enum(["absent", "undefined", "null"]);
const emptyFamily = z.object({ count: z.literal(0), last: marker }).strict();
const smallCount = count.pipe(z.number().max(128));
const layerId = count.pipe(z.number().max(65_535)), positiveCount = count.pipe(z.number().positive());
const rootObservation = z.object({ schema: z.literal("easyeda-pro-control.pcb209-empty-root-membership.v1"), documentUuid: id,
  families: z.object({ tracks: emptyFamily, pads: emptyFamily, vias: emptyFamily, circles: emptyFamily, radiusDimensions: emptyFamily,
    rectangles: emptyFamily, strings: emptyFamily, protractorDimensions: emptyFamily, lengthDimensions: emptyFamily,
    smartDimensions: emptyFamily, components: emptyFamily, polygons: emptyFamily, images: emptyFamily, pictures: emptyFamily,
    copper: emptyFamily, inner: emptyFamily, groups: emptyFamily }).strict(),
  innerLayerIds: z.array(layerId).max(128).refine(values =>
    values.every((value, index) => index === 0 || value > (values[index - 1] ?? value))),
  board: z.object({ marker, outlineCount: z.literal(0), autoGenerate: z.literal(false) }).strict(),
  panel: z.object({ enabled: z.literal(false), success: z.literal(false), arrayCount: z.literal(13) }).strict(),
  spatial: z.object({ typedKeys: smallCount, otherKeys: smallCount, ratlineKeys: smallCount, totalKeys: smallCount, treeCount: smallCount }).strict()
    .refine(value => value.totalKeys >= value.typedKeys + value.otherKeys + value.ratlineKeys && value.treeCount === value.totalKeys - value.typedKeys),
  originalOwnerVerified: z.literal(false), nativeIntrinsicsVerified: z.literal(false), projectWorkerAssociationVerified: z.literal(false),
  completeLiveBaselineVerified: z.literal(false), queueCompletionVerified: z.literal(false), publicationDelivered: z.literal(false), ...noAuthority,
}).strict().refine(value => size(value, 16_384));
const roots = z.object({ profile: z.literal("private.current-pcb209-empty-root-pair.v1"), documentUuid: id,
  before: rootObservation, after: rootObservation, beforeReplySha256: digest, afterReplySha256: digest,
  originalRunnerIssued: z.literal(true), rawManagersSampled: z.literal(17), matchingSamples: z.literal(true),
  continuousObservation: z.literal(false), atomicSnapshotVerified: z.literal(false), completeLiveBaselineVerified: z.literal(false),
  queueCompletionVerified: z.literal(false), executionAuthorized: z.literal(false),
}).strict().refine(value => value.documentUuid === value.before.documentUuid && value.documentUuid === value.after.documentUuid &&
  canonicalJson(value.before) === canonicalJson(value.after));
const baseline = z.object({ profile: z.literal("private.current-pcb209-empty-baseline.v1"), common, roots,
  commonSqlJoinBracketedByEmptyRoots: z.literal(true), storedTargetContainsOnlyMatchedCommonAndMeta: z.literal(true),
  rawManagersIncludeWatcherlessModels: z.literal(true), originalCompletedSqlReaderRetained: z.literal(true), originalRunnersRetained: z.literal(true),
  matchingSamples: z.literal(true), completeLiveBaselineVerified: z.literal(false), sourceMembershipVerified: z.literal(false),
  sourceSerializationObserved: z.literal(false), atomicSnapshotVerified: z.literal(false), continuousObservation: z.literal(false),
  startupCompletionVerified: z.literal(false), queueCompletionVerified: z.literal(false), pendingProducerInventoryVerified: z.literal(false),
  activeToolsCovered: z.literal(false), closedFileOwnershipVerified: z.literal(false), savedVerified: z.literal(false), reopenedVerified: z.literal(false),
  ...noAuthority, packetSha256: digest,
}).strict().refine(value => size(value, CURRENT_PCB_209_EMPTY_BASELINE_PACKET_MAX_BYTES) && packetHash(value) &&
  value.common.identity.documentUuid === value.roots.documentUuid);
const sourceObservation = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-pcb-frame-observation.v1"),
  projectUuid: digest, documentUuid: id, tabId: z.string(), family: z.literal("pcb"), sourceVerified: z.literal(true),
  sourceSha256: z.literal(CURRENT_PCB_209_OPENING_SCRIPTS.pcb.scriptSha256), sourceBytes: z.literal(CURRENT_PCB_209_OPENING_SCRIPTS.pcb.scriptBytes),
  domOwnerVerified: z.literal(true), targetId: token, sessionId: token,
  frame: z.object({ id: token, loaderId: token, url: z.literal("https://client/editor?entry=pcb"), securityOrigin: z.literal("https://client"), parentId: token }).strict(),
  context: z.object({ id: positiveCount, uniqueId: token }).strict(), scriptId: z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),
  projectWorkerAssociationVerified: z.literal(false), compilerOwnerVerified: z.literal(false), startupQualified: z.literal(false),
  executionAuthorized: z.literal(false), continuousObservation: z.literal(false),
}).strict().refine(value => size(value, 128 * 1024) && value.tabId === `${value.documentUuid}@${value.projectUuid}`);
const openingObservation = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-pcb-opening.v1"), phase: z.literal("observe"),
  projectUuid: digest, branchUuid: z.string().regex(/^[a-f\d]{32}$/u), documentUuid: id, tabId: z.string(),
  ok: z.literal(true), status: z.literal("frame-observed"), failure: z.null(), dispatchAttempted: z.literal(false),
  publicResult: z.null(), nativeWorkMayRemain: z.literal(false), frameObserved: z.literal(true), windowTabId: z.string().regex(/^[A-Za-z\d_-]{1,128}$/u),
  frameSourceVerified: z.literal(false), restorationCompletionVerified: z.literal(false), startupQualified: z.literal(false),
  persistenceVerified: z.literal(false), queueCompletionVerified: z.literal(false), executionAuthorized: z.literal(false), nativeIntrinsicsVerified: z.literal(false),
}).strict().refine(value => size(value, CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_RESULT_BYTES) && value.tabId === `${value.documentUuid}@${value.projectUuid}`);
export const currentPcb209WorkerStartupPcbPacketSchema = z.object({ profile: z.literal("private.current-pcb209-worker-startup-pcb-session.v1"),
  targetSha256: digest, constructionPacketSha256: digest, sourceObservation, openingObservation, originalSessionContinued: z.literal(true),
  nativeCommands: count.pipe(z.number().min(1).max(CURRENT_PCB_209_WORKER_STARTUP_PCB_COMMAND_LIMIT)),
  completeLiveBaselineVerified: z.literal(false), startupCompletionVerified: z.literal(false), ...noAuthority,
}).strict().refine(value => value.sourceObservation.projectUuid === value.openingObservation.projectUuid &&
  value.sourceObservation.documentUuid === value.openingObservation.documentUuid && value.sourceObservation.tabId === value.openingObservation.tabId);
export const currentPcb209WorkerStartupEmptyPacketSchema = z.object({ profile: z.literal("private.current-pcb209-worker-startup-empty-session.v1"),
  pcbPacketSha256: digest, baseline, originalPcbSessionRetained: z.literal(true), originalNativeDependencyRetained: z.literal(true),
  nativeCommands: count.pipe(z.number().min(1).max(CURRENT_PCB_209_EMPTY_BASELINE_REQUEST_COUNT)),
  completeLiveBaselineVerified: z.literal(false), startupCompletionVerified: z.literal(false), ...noAuthority,
}).strict();
