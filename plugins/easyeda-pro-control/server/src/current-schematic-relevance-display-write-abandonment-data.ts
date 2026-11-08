/** Historical cleanup data only. It cannot recreate an original owner,
 * authorize a replay or establish a successful schematic edit or Save. */
import { dirname, join, win32 } from "node:path";
import { z } from "zod";
import { loadOperation, operationPath, readExactBinaryArtifact, verifyExactManagedArtifact } from "./artifacts.ts";
import type { ArtifactDescriptor, OperationJournal } from "./artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, canonicalJson, isErrnoException, isRecord, normalizeEasyedaProjectPath, sha256Json, sha256Text } from "./core.ts";
import { assertGeneratedSchematicRelevanceDisplayJournalChain } from "./generated-schematic-relevance-display-journal.ts";
import { generatedSchematicRelevanceDisplayOperationIdSchema as id, prepareGeneratedSchematicRelevanceDisplayBodyPlan } from "./generated-schematic-relevance-display-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_ABANDONMENT_MAX_BYTES, readCurrentSchematicRelevanceDisplayWriteAbandonmentFile } from "./current-schematic-relevance-display-write-abandonment-file.ts";

const hash = z.string().regex(/^[a-f\d]{64}$/u);
const common = { helperAllocated: z.literal(false), rootCreated: z.literal(false), exitClaimed: z.literal(false) };
export const currentSchematicRelevanceDisplayWriteGenerationClosureSchema = z.discriminatedUnion("outcome", [
  z.strictObject({ outcome: z.literal("allocation-never-entered"), ...common }),
  z.strictObject({ outcome: z.literal("no-resource-allocated"), ...common }),
  z.strictObject({ outcome: z.literal("root-never-created"), helperAllocated: z.literal(true), helperReleased: z.literal(true), rootCreated: z.literal(false), exitClaimed: z.literal(false) }),
  z.strictObject({ outcome: z.literal("root-exited"), helperAllocated: z.literal(true), helperReleased: z.literal(true), rootCreated: z.literal(true), originalRootExited: z.literal(true), originalJobEmpty: z.literal(true) }),
]);
export const currentSchematicRelevanceDisplayWriteFailureClosureValueSchema = z.strictObject({
  writer: currentSchematicRelevanceDisplayWriteGenerationClosureSchema,
  readback: currentSchematicRelevanceDisplayWriteGenerationClosureSchema.nullable(),
  capture: z.enum(["not-started", "all-original-handles-closed"]), saved: z.literal(false), reopened: z.literal(false),
  completionClaimed: z.literal(false), ownerTransferred: z.literal(false), replayAllowed: z.literal(false),
});
export const currentSchematicRelevanceDisplayWriteAbandonmentBodySchema = z.strictObject({
  operationId: id, recordedAt: z.iso.datetime(), originalStoredJournalSha256: hash, originalEntireJournalSha256: hash,
  originalPlanSha256: hash, originalJournal: z.record(z.string(), z.unknown()),
  originalClosure: currentSchematicRelevanceDisplayWriteFailureClosureValueSchema,
  producerContract: z.literal("original-failed-disposable-schematic-relevance:all-factory-calls-publication-helpers-captures-settled.v1"),
  classification: z.literal("historical-abandonment-verified"), historicalQuarantineRelinquished: z.literal(true),
  authorityRestored: z.literal(false), executionAuthorized: z.literal(false),
});
export const currentSchematicRelevanceDisplayWriteAbandonmentSchema = z.strictObject({
  schema: z.literal("easyeda-pro-control.sch209-relevance-display-write-abandonment.v1"),
  body: currentSchematicRelevanceDisplayWriteAbandonmentBodySchema, bodySha256: hash,
});
export interface CurrentSchematicRelevanceDisplayWriteAbandonmentInspection {
  readonly schema: "easyeda-pro-control.sch209-relevance-display-write-abandonment-inspection.v1";
  readonly classification: "historical-abandonment-verified"; readonly operationId: string;
  readonly originalStoredJournalSha256: string; readonly originalEntireJournalSha256: string; readonly bodySha256: string; readonly artifact: ArtifactDescriptor;
  readonly saved: false; readonly reopened: false; readonly completionClaimed: false; readonly ownerTransferred: false;
  readonly replayAllowed: false; readonly authorityRestored: false; readonly executionAuthorized: false;
}
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_ABANDONMENT_EVIDENCE"); } }
function bag(value: unknown): Record<string, unknown> { need(isRecord(value)); return value; }
const nativeId = z.string().regex(/^[a-f\d]{16}$/u);
const body = z.record(z.string(), z.unknown());
const peerId = z.union([z.literal("CANVAS"), nativeId]);
const peerSchema = z.strictObject({ id: peerId, type: z.enum(["CANVAS", "WIRE", "LINE", "BUS", "ATTR"]), body });
const argumentsSchema = z.strictObject({ schema: z.literal("private.generated-schematic-relevance-display-args.v1"),
  target: z.strictObject({ rawWindowsPath: z.string().min(1).max(4096), projectUuid: hash,
    branchUuid: z.string().regex(/^[a-f\d]{32}$/u), schematicUuid: z.string().regex(/^[a-f\d]{32}$/u),
    pageUuid: z.string().regex(/^[a-f\d]{32}$/u), expectedSourceSha256: hash }),
  operation: z.strictObject({ operationId: id, textId: nativeId, rootIds: z.array(nativeId).length(3), beforeBody: body, afterBody: body,
    peers: z.array(peerSchema).length(6) }),
});
/** Recognize only this immutable seven-record disposable writer family. This
 * validates historical data, never an opaque preparation or native authority. */
export function schematicRelevanceDisplayWriteHistoricalEntries(operation: OperationJournal): ReturnType<typeof assertGeneratedSchematicRelevanceDisplayJournalChain> {
  const plan = z.strictObject({ profile: z.literal("private.generated-schematic-relevance-display-journal.v1"), arguments: argumentsSchema,
    checkpoint: z.strictObject({ path: z.string().min(1).max(4096), bytes: z.number().int().positive().max(67_108_864), sha256: hash }),
    nonce: hash }).parse(operation.plan);
  const args = plan.arguments, raw = args.target.rawWindowsPath;
  normalizeEasyedaProjectPath(raw);
  const parentName = win32.basename(win32.dirname(raw));
  need(/^Codex_schematic_relevance_[a-f\d]{16}\.eprj2$/u.test(win32.basename(raw)) &&
    /^CodexEasyedaFixture_[a-f\d]{32}$/u.test(parentName) && sha256Text(raw) === args.target.projectUuid);
  const operationData = args.operation, peers = operationData.peers;
  need(new Set(operationData.rootIds).size === 3 && new Set(peers.map(row => row.id)).size === 6 && !peers.some(row => row.id === operationData.textId));
  for (const [type, count] of [["CANVAS", 1], ["WIRE", 1], ["BUS", 1], ["LINE", 2], ["ATTR", 1]] as const) { need(peers.filter(row => row.type === type).length === count); }
  need(peers.every(row => (row.type === "CANVAS") === (row.id === "CANVAS")) && canonicalJson(operationData.rootIds) ===
    canonicalJson([operationData.textId, ...peers.filter(row => row.type === "WIRE" || row.type === "BUS").map(row => row.id)].toSorted()));
  const patch = Object.fromEntries(Object.entries(operationData.afterBody).filter(([key, value]) => canonicalJson(value) !== canonicalJson(operationData.beforeBody[key])));
  const projected = prepareGeneratedSchematicRelevanceDisplayBodyPlan(patch);
  need(canonicalJson(projected.nativeBeforeBody) === canonicalJson(operationData.beforeBody) && canonicalJson(projected.nativeAfterBody) === canonicalJson(operationData.afterBody));
  const records = assertGeneratedSchematicRelevanceDisplayJournalChain(operation["records"]);
  const terminal = ["complete-result", "no-allocation"].includes(records.at(-1)?.kind ?? "");
  need(operation["schema"] === OPERATION_SCHEMA && operation.operationId === args.operation.operationId && operation.planHash === buildPlanHash(plan) &&
    operation["state"] === (terminal ? "completed" : "prepared") && operation["sequence"] === records.length && records.length > 0 &&
    canonicalJson(records[0]?.evidence["arguments"]) === canonicalJson(args) && records.every(row => row.operationId === operation.operationId));
  const artifacts = operation.artifacts ?? []; need(artifacts.length === records.length);
  for (const [index, row] of records.entries()) {
    const text = `${JSON.stringify(row)}\n`;
    const directory = dirname(operationPath(operation.operationId));
    const path = join(directory, operation.operationId, `${String(row.sequence).padStart(2, "0")}-${row.kind}.json`);
    need(canonicalJson(artifacts[index]) === canonicalJson({ path, bytes: Buffer.byteLength(text), sha256: sha256Text(text) }));
  }
  return records;
}
export function schematicRelevanceDisplayWriteHistoricalTerminal(operation: OperationJournal): boolean {
  return ["complete-result", "no-allocation"].includes(schematicRelevanceDisplayWriteHistoricalEntries(operation).at(-1)?.kind ?? "");
}
export function requireCurrentSchematicRelevanceAbandonableJournal(operation: OperationJournal): void {
  need(!schematicRelevanceDisplayWriteHistoricalTerminal(operation));
  need(schematicRelevanceDisplayWriteHistoricalEntries(operation).some(row => row.kind === "failure"));
}
function bindClosure(operation: OperationJournal, closure: z.infer<typeof currentSchematicRelevanceDisplayWriteFailureClosureValueSchema>): void {
  const records = schematicRelevanceDisplayWriteHistoricalEntries(operation);
  const has = (kind: string): boolean => records.some(row => row.kind === kind);
  if (!closure.writer.rootCreated) { need(!has("launch-result") && !has("opening-result") && !has("modify-result")); }
  if (!closure.writer.helperAllocated) { need(!has("allocation-result")); }
  if (has("exit-result") || has("termination-result") || has("release-result")) { need(closure.writer.outcome === "root-exited"); }
  if (closure.readback === null || !closure.readback.rootCreated) { need(!has("reopen-result") && !has("reopen-exit-result") && !has("reopened-sql-result")); }
  if (has("closed-sql-result") || has("reopened-sql-result")) { need(closure.capture === "all-original-handles-closed"); }
}
export async function freshCurrentSchematicRelevanceAbandonmentJournal(operationId: string): Promise<OperationJournal> {
  id.parse(operationId); const operation = await loadOperation(operationId); requireCurrentSchematicRelevanceAbandonableJournal(operation);
  for (const artifact of operation.artifacts ?? []) { await verifyExactManagedArtifact(artifact); }
  const final = await loadOperation(operationId); requireCurrentSchematicRelevanceAbandonableJournal(final); need(sha256Json(final) === sha256Json(operation)); return final;
}
export async function inspectCurrentSchematicRelevanceDisplayWriteAbandonment(operationId: string,
  expected?: Readonly<{ storedJournalSha256: string; entireStoredJournalSha256: string }>): Promise<CurrentSchematicRelevanceDisplayWriteAbandonmentInspection | undefined> {
  id.parse(operationId); let retained: Awaited<ReturnType<typeof readCurrentSchematicRelevanceDisplayWriteAbandonmentFile>>;
  try { retained = await readCurrentSchematicRelevanceDisplayWriteAbandonmentFile(operationId); }
  catch (error) { if (isErrnoException(error) && error.code === "ENOENT") { return undefined; } throw error; }
  need(retained.artifact.bytes <= CURRENT_SCHEMATIC_RELEVANCE_ABANDONMENT_MAX_BYTES);
  const envelope = currentSchematicRelevanceDisplayWriteAbandonmentSchema.parse(JSON.parse(retained.text) as unknown), value = envelope.body;
  need(retained.text === `${JSON.stringify(envelope)}\n` && value.operationId === operationId && sha256Json(value) === envelope.bodySha256);
  const operation = await freshCurrentSchematicRelevanceAbandonmentJournal(operationId); bindClosure(operation, value.originalClosure);
  need(canonicalJson(value.originalJournal) === canonicalJson(operation) && value.originalStoredJournalSha256 === operation["journalSha256"] &&
    value.originalEntireJournalSha256 === sha256Json(operation) && value.originalPlanSha256 === sha256Json(bag(operation.plan)));
  if (expected !== undefined) { need(value.originalStoredJournalSha256 === expected.storedJournalSha256 && value.originalEntireJournalSha256 === expected.entireStoredJournalSha256); }
  await readExactBinaryArtifact(retained.artifact); const final = await freshCurrentSchematicRelevanceAbandonmentJournal(operationId);
  need(sha256Json(final) === value.originalEntireJournalSha256); await verifyExactManagedArtifact(retained.artifact);
  return Object.freeze({ schema: "easyeda-pro-control.sch209-relevance-display-write-abandonment-inspection.v1", classification: "historical-abandonment-verified",
    operationId, originalStoredJournalSha256: value.originalStoredJournalSha256, originalEntireJournalSha256: value.originalEntireJournalSha256,
    bodySha256: envelope.bodySha256, artifact: retained.artifact, saved: false, reopened: false, completionClaimed: false,
    ownerTransferred: false, replayAllowed: false, authorityRestored: false, executionAuthorized: false });
}
