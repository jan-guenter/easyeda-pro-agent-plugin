/** Exact v1/v2 journal data codec. Moving it changes no record/result bytes,
 * schemas or authority. Historical consumers cannot recreate a live owner. */
import { dirname, join } from "node:path";
import { z } from "zod";
import { operationPath } from "./artifacts.ts";
import type { ArtifactDescriptor } from "./artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, canonicalJson, isRecord, sha256Json, sha256Text } from "./core.ts";
import { currentPcbViaWriteStageResultSchema } from "./current-pcb-via-write-contract.ts";

export const CURRENT_PCB_VIA_WRITE_JOURNAL_STAGES = ["baseline", "allocation", "launch", "main", "opening", "sdk", "preflight",
  "native-before", "scene-before", "create", "native-after", "scene-after", "effect", "save", "close", "exit", "closed-sql",
  "reopen", "reopened-native", "reopened-scene", "reopen-close", "reopen-exit", "reopened-sql", "complete"] as const;
export type CurrentPcbViaWriteJournalStage = typeof CURRENT_PCB_VIA_WRITE_JOURNAL_STAGES[number];
export type Kind = "no-process-release-intent" | "no-process-release-result" | "operation-intent" | "failure" | "no-allocation" | "allocation-refused" | "abort-intent" | "abort-result" | "termination-intent" |
  "termination-result" | "release-intent" | "release-result" | `${CurrentPcbViaWriteJournalStage}-${"intent" | "result"}`;
export const legacyProfile = "private.pcb209-via-write-journal.v1", maximumRecordBytes = 65_536, maximumRecords = 64, profile = "private.pcb209-via-write-journal.v2";
const kinds = new Set<string>(["no-process-release-intent", "no-process-release-result", "operation-intent", "failure", "no-allocation", "allocation-refused", "abort-intent", "abort-result", "termination-intent",
  "termination-result", "release-intent", "release-result", ...CURRENT_PCB_VIA_WRITE_JOURNAL_STAGES.flatMap(stage => [`${stage}-intent`, `${stage}-result`])]);
const hash = z.string().regex(/^[a-f\d]{64}$/u);
export const entrySchema = z.strictObject({ schema: z.enum(["easyeda-pro-control.pcb209-via-write-record.v1", "easyeda-pro-control.pcb209-via-write-record.v2"]),
  operationId: z.string().max(96).regex(/^pcb209-via-write-[a-z\d][a-z\d-]*$(?![\s\S])/u),
  sequence: z.number().int().nonnegative().max(maximumRecords - 1), previousSha256: hash.nullable(),
  kind: z.custom<Kind>((value): value is Kind => typeof value === "string" && kinds.has(value)),
  evidence: z.record(z.string(), z.unknown()), inverseAvailable: z.literal(false),
}).refine(value => Buffer.byteLength(`${JSON.stringify(value)}\n`) <= maximumRecordBytes &&
  (!["allocation-refused", "no-process-release-intent", "no-process-release-result"].includes(value.kind) || value.schema === "easyeda-pro-control.pcb209-via-write-record.v2"));
export type Entry = z.infer<typeof entrySchema>;
const artifactSchema = z.strictObject({ path: z.string().max(4096), sha256: hash, bytes: z.number().int().positive().max(maximumRecordBytes) });
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`PCB_VIA_WRITE_JOURNAL_${code}`); } }
export function terminal(kind: Kind | undefined): boolean { return kind === "complete-result" || kind === "no-allocation" || kind === "allocation-refused"; }
function resultEvidence(entry: Entry): void {
  if (entry.kind === "no-process-release-intent") {
    z.strictObject({ generation: z.enum(["writer", "readback"]), originalFactoryVerified: z.literal(true), rootNeverCreated: z.literal(true), jobEmpty: z.literal(true),
      releaseOriginalHelperOnly: z.literal(true) }).parse(entry.evidence);
  }
  if (entry.kind === "no-process-release-result") {
    z.strictObject({ generation: z.enum(["writer", "readback"]), originalFactoryVerified: z.literal(true), rootNeverCreated: z.literal(true), jobEmpty: z.literal(true),
      helperReleaseVerified: z.literal(true), designCompletionClaimed: z.literal(false), readbackCompletionClaimed: z.literal(false) }).parse(entry.evidence);
  }
  if (entry.kind === "allocation-refused") {
    z.strictObject({ allocationIntentPublished: z.literal(true), nativeAllocationNeverEntered: z.literal(true), originalFactoryNoResourceVerified: z.literal(true),
      originalProcessExitClaimed: z.literal(false), nativeOwnershipTransferred: z.literal(false) }).parse(entry.evidence);
  }
  if (entry.kind === "create-result" || entry.kind === "save-result") {
    const result = currentPcbViaWriteStageResultSchema.parse(entry.evidence);
    need(result.ok && result.stage === entry.kind.slice(0, -7), "SDK_ACKNOWLEDGEMENT");
  }
  if (entry.kind === "exit-result" || entry.kind === "reopen-exit-result") {
    z.strictObject({ rootExited: z.literal(true), jobEmpty: z.literal(true), helperReleased: z.literal(true) }).parse(entry.evidence);
  }
  if (entry.kind === "closed-sql-result" || entry.kind === "reopened-sql-result") {
    z.strictObject({ logicalSha256: hash, nativeHistorySha256: hash, completeSqlVerified: z.literal(true), sourceMembershipVerified: z.literal(true) }).parse(entry.evidence);
  }
  if (entry.kind === "complete-result") {
    z.strictObject({ saved: z.literal(true), reopened: z.literal(true), completeSqlVerified: z.literal(true), peerRosterPreserved: z.literal(true), inverseAvailable: z.literal(false) }).parse(entry.evidence);
  }
}

/** Save cannot skip native/source effect acceptance. A second attempt cannot
 * occur after an acknowledgement, failure, cleanup or pending publication. */
export function assertCurrentPcbViaWriteJournalChain(input: readonly Entry[]): void {
  need(input.length <= maximumRecords, "RECORD_BOUND");
  let failed = false, next = 0, pending: string | null = null, previous: Entry | null = null;
  const seen = new Set<string>();
  for (const [index, raw] of input.entries()) {
    const entry = entrySchema.parse(raw);
    resultEvidence(entry);
    need(entry.sequence === index && entry.previousSha256 === (previous === null ? null : sha256Json(previous)) &&
      (previous === null || entry.operationId === previous.operationId && entry.schema === previous.schema) && !seen.has(entry.kind) && !terminal(previous?.kind), "CHAIN");
    if (index === 0) { need(entry.kind === "operation-intent", "FIRST"); }
    else if (entry.kind === "failure") { need(!failed, "DUPLICATE_FAILURE"); failed = true; }
    else if (entry.kind === "no-allocation") {
      need(failed && !seen.has("allocation-intent") && entry.evidence["allocationNeverEntered"] === true, "NO_ALLOCATION");
    } else if (entry.kind === "allocation-refused") {
      need(failed && previous?.kind === "failure" && pending === "allocation" && seen.has("allocation-intent") && !seen.has("allocation-result") && !seen.has("launch-intent"), "ORIGINAL_FACTORY_REFUSAL");
    } else if (entry.kind === "no-process-release-intent" || entry.kind === "no-process-release-result") {
      need(failed && ![...seen].some(kind => /^(?:abort|termination|release)-/u.test(kind)), "NO_PROCESS_AFTER_FAILURE_ONLY");
      if (entry.kind === "no-process-release-result") {
        need(seen.has("no-process-release-intent") && previous?.kind === "no-process-release-intent" && previous.evidence["generation"] === entry.evidence["generation"], "NO_PROCESS_RELEASE_INTENT");
      }
    } else if (entry.kind.startsWith("abort-") || entry.kind.startsWith("termination-") || entry.kind.startsWith("release-")) {
      need(failed && !seen.has("no-process-release-intent") && !seen.has("no-process-release-result"), "CLEANUP_BEFORE_FAILURE");
      if (entry.kind.endsWith("-result")) { need(seen.has(entry.kind.replace(/-result$/u, "-intent")), "CLEANUP_INTENT"); }
      if (entry.kind === "termination-result") { need(entry.evidence["rootExited"] === true && entry.evidence["jobEmpty"] === true, "ORIGINAL_EXIT"); }
      if (entry.kind === "release-intent") { need(seen.has("termination-result"), "EXIT_BEFORE_RELEASE"); }
      if (entry.kind === "release-result") { need(entry.evidence["released"] === true, "ORIGINAL_RELEASE"); }
    } else {
      need(!failed, "NORMAL_AFTER_FAILURE"); const stage = CURRENT_PCB_VIA_WRITE_JOURNAL_STAGES[next]; need(stage !== undefined, "STAGE_BOUND");
      if (entry.kind.endsWith("-intent")) { need(pending === null && entry.kind === `${stage}-intent`, "INTENT_ORDER"); pending = stage; }
      else { need(pending === stage && entry.kind === `${stage}-result`, "RESULT_ORDER"); pending = null; next += 1; }
    }
    seen.add(entry.kind); previous = entry;
  }
}
export function entries(input: Readonly<Record<string, unknown>>): readonly Entry[] {
  const operation = z.looseObject({ operationId: z.string(), plan: z.looseObject({ profile: z.enum([legacyProfile, profile]) }), planHash: hash,
    records: z.array(entrySchema).max(maximumRecords), state: z.enum(["completed", "prepared"]),
    artifacts: z.array(artifactSchema).max(maximumRecords) }).parse(input);
  const records = operation.records; assertCurrentPcbViaWriteJournalChain(records);
  need(operation.state === (terminal(records.at(-1)?.kind) ? "completed" : "prepared") &&
    records.every(entry => entry.operationId === operation.operationId && entry.schema === (operation.plan.profile === legacyProfile ?
      "easyeda-pro-control.pcb209-via-write-record.v1" : "easyeda-pro-control.pcb209-via-write-record.v2")), "MANIFEST_STATE");
  const artifacts = operation.artifacts; need(artifacts !== undefined && artifacts.length === records.length, "ARTIFACT_ROSTER");
  for (const [index, record] of records.entries()) { need(canonicalJson(artifacts[index]) === canonicalJson(artifact(record)), "ARTIFACT_BINDING"); }
  return records;
}
/** Historical validation only. Full artifact bytes and a fresh final journal
 * read are separately required by global admission. This cannot issue a plan,
 * recreate an owner, retry an action or adopt a native allocation. */
export function currentPcbViaWriteHistoricalTerminal(input: Readonly<Record<string, unknown>>): boolean {
  const data = input["plan"], records = entries(input);
  need(input["schema"] === OPERATION_SCHEMA && isRecord(data) && isRecord(data["plan"]) && data["plan"]["operationId"] === input["operationId"] &&
    input["planHash"] === buildPlanHash(data) && (records.length === 0 || canonicalJson(records[0]?.evidence["plan"]) === canonicalJson(data["plan"])), "HISTORICAL_PLAN");
  return terminal(records.at(-1)?.kind);
}
export function artifact(entry: Entry): ArtifactDescriptor {
  const text = `${JSON.stringify(entry)}\n`; return { path: join(dirname(operationPath(entry.operationId)), entry.operationId,
    `${String(entry.sequence).padStart(2, "0")}-${entry.kind}.json`), sha256: sha256Text(text), bytes: Buffer.byteLength(text) };
}
