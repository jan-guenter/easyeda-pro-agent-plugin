/** Historical abandonment of one stopped pre-navigation prefix. No dispatch,
 * journal update, process proof, completion or renewed attempt authority. */
/* oxlint-disable import/max-dependencies -- Reuse the maintained managed-file, journal, checkpoint and complete-SQL readers; no caller-provided verifier or native executor. */
import { opendir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { z } from "zod";
import { controlDataDirectory, controlRootCapability, operationPath, publishManagedAttachmentExclusive, readArtifact, readExactUtf8Artifact } from "./artifacts.ts";
import { verifyCheckpoint } from "./checkpoint.ts";
import { loadClosedSymbolJournal } from "./closed-symbol-journal.ts";
import { inspectHistoricalAbandonmentSql } from "./closed-symbol-abandonment-cache.ts";
import { buildStartupProgram, validateStartupResult } from "./closed-symbol-startup-program.ts";
import { VALIDATION_ACTION_ID } from "./closed-symbol-target-claim.ts";
import { canonicalJson, extractToolPayload, isErrnoException, isRecord, sha256Json, sha256Text } from "./core.ts";
import { currentProcessSqlRuntime } from "./machine-profile.ts";

const PROFILE = "easyeda-pro-control.closed-symbol-abandonment.v1";
const MAX_BYTES = 65_536;
const hash = z.string().regex(/^[a-f0-9]{64}$/u);
const identifier = z.string().regex(/^easyeda-[a-z0-9-]{8,96}$/u);
const descriptor = z.object({ path: z.string().min(1).max(4096), bytes: z.number().int().positive().max(262_144), sha256: hash }).strict();
type Descriptor = z.infer<typeof descriptor>;
const verification = z.object({ ok: z.literal(true), receiptPath: z.string(), source: z.string(), checkpoint: z.string(),
  sourceMatchesReceipt: z.literal(true), checkpointMatchesReceipt: z.literal(true), sourceEqualsCheckpoint: z.literal(true),
  sourceChanged: z.literal(false), sourceSha256: hash, checkpointSha256: hash, sourceDumpSha256: hash, checkpointDumpSha256: hash }).strict();
const bodySchema = z.object({ operationId: identifier, recordedAt: z.iso.datetime(), originalJournalSha256: hash,
  originalStoredJournalSha256: hash, phaseArtifacts: z.array(descriptor).length(16), claimArtifact: descriptor,
  checkpointReceipt: descriptor, baselineSourceSha256: hash, baselineSchemaSha256: hash, baselineLogicalSha256: hash,
  verification, outcome: z.literal("abandoned-before-navigation"), markerEffectsPreserved: z.literal(true),
  processClosureProved: z.literal(false), completionProved: z.literal(false), executionAuthorized: z.literal(false),
  authorityRestored: z.literal(false), replayAllowed: z.literal(false), saved: z.literal(false), reopened: z.literal(false) }).strict();
const envelopeSchema = z.object({ profile: z.literal(PROFILE), body: bodySchema, bodySha256: hash }).strict();
type Body = z.infer<typeof bodySchema>;
type Prefix = Awaited<ReturnType<typeof loadClosedSymbolJournal>>;
const busy = new Set<string>();
const MESSAGE = 'Tool "easyeda_execute" can mutate design state and requires confirmWrite=true.';
const REJECTION = { isError: true, structuredContent: { errorCode: "ERR_CONFIRM_WRITE_REQUIRED", message: MESSAGE,
  details: { toolName: "easyeda_execute", toolGroup: "diagnostics", risk: "high" } },
  content: [{ type: "text", text: `[ERR_CONFIRM_WRITE_REQUIRED] ${MESSAGE}` }] };

function need(condition: boolean, message: string): asserts condition { if (!condition) { throw new Error(message); } }
function same(actual: unknown, expected: unknown, label: string): void {
  need(canonicalJson(actual) === canonicalJson(expected), `Closed-symbol abandonment ${label} differs.`);
}
function bag(value: unknown): Record<string, unknown> { need(isRecord(value), "Closed-symbol abandonment object missing."); return value; }
function pathFor(operationId: string): string { return join(operationPath(identifier.parse(operationId)).slice(0, -5), "abandoned-before-navigation.json"); }
function text(value: unknown): string { need(typeof value === "string", "Closed-symbol abandonment string missing."); return value; }

/** First bounded display read establishes a descriptor; the exact managed read
 * then rejects changed bytes or malformed UTF-8. No arbitrary path is exposed. */
async function managedJson(path: string, maximum = MAX_BYTES): Promise<{ artifact: Descriptor; value: unknown }> {
  const page = await readArtifact(path, 0, maximum);
  need(page.eof && page.size > 0 && page.size <= maximum && page.bytesRead === page.size,
    "Closed-symbol abandonment artifact bound exceeded.");
  const artifact = descriptor.parse({ path, bytes: page.size, sha256: sha256Text(page.text) });
  const raw = await readExactUtf8Artifact(artifact);
  return { artifact, value: JSON.parse(raw.text) as unknown };
}

async function noLaterEvidence(operationId: string): Promise<void> {
  const root = await controlRootCapability(false);
  const directory = await root.openDirectory(operationPath(operationId).slice(0, -5), false);
  try {
    const entries = await opendir(`/proc/self/fd/${directory.handle.fd}`);
    let count = 0;
    for await (const entry of entries) {
      count += 1;
      need(count <= 128 && !/^(?:1[7-9]|[2-9]\d|\d{3,})-/u.test(entry.name),
        "Closed-symbol abandonment found later or excessive phase evidence.");
    }
    await root.assertCurrent();
  } finally { await directory.handle.close(); }
}

async function prefix(operationId: string): Promise<Prefix> {
  const loaded = await loadClosedSymbolJournal(operationId), { journal, events } = loaded;
  need(journal.sequence === 16 && events.length === 16 && journal.state === "closed-session-recording" &&
    !journal.hardStop && !journal.orphanedCallPossible && !journal.mutationMayHaveOccurred &&
    journal.plan.operation.id === VALIDATION_ACTION_ID, "Closed-symbol abandonment requires the exact unquarantined validation prefix.");
  hash.parse(journal["journalSha256"]);
  const input = { phase: "edit-marker-read" as const, projectUuid: journal.plan.projectUuid, branchUuid: journal.plan.branchUuid,
    ownerUuid: journal.plan.ownerUuid, marker: journal.plan.marker };
  const request = { profile: "easyeda-pro-control.closed-symbol-startup-request.v1", input,
    codeSha256: sha256Text(buildStartupProgram(input)), directMainFrameOnly: true };
  same(events[14]?.data, request, "fixed marker-read intent");
  need(events[14]?.requestSha256 === sha256Json(request), "Closed-symbol abandonment request hash differs.");
  const returned = events[15]?.data;
  if (canonicalJson(returned) !== canonicalJson({ rawReturn: REJECTION })) {
    // A completed fixed marker read can be followed by an admission refusal
    // Before navigation. This is still abandonment, never lifecycle success.
    const data = bag(returned), raw = bag(data["rawReturn"]);
    need(Object.keys(data).length === 1 && raw["isError"] !== true,
      "Closed-symbol abandonment pre-handler rejection differs.");
    const startup = validateStartupResult(extractToolPayload(raw), input);
    need(startup["ok"] === true && startup["markerCreateAttempted"] === false,
      "Closed-symbol abandonment requires a complete successful fixed marker read.");
  }
  await noLaterEvidence(operationId);
  return loaded;
}

async function claim(loaded: Prefix): Promise<Descriptor> {
  const { plan } = loaded.journal;
  const targetKey = sha256Json({ profile: "easyeda-pro-control.closed-symbol-validation-claim.v1", projectUuid: plan.projectUuid, symbolUuid: plan.targetUuid });
  const path = join(controlDataDirectory(), "closed-symbol-validation-claims-v1", targetKey, "claim.json");
  const retained = await managedJson(path, 131_072), value = bag(retained.value);
  const request = { action: "run-disposable-once", target: { projectPath: plan.projectPath, projectUuid: plan.projectUuid,
    branchUuid: plan.branchUuid, ownerUuid: plan.ownerUuid, symbolUuid: plan.targetUuid, companionPcbUuid: plan.activeUuid },
    metadata: plan.operation.patch, confirmDisposableMetadataEdit: true };
  const createdAt = z.iso.datetime().parse(value["createdAt"]);
  same(value, { profile: "easyeda-pro-control.closed-symbol-validation-claim.v1", targetKey, createdAt, request, plan,
    requestSha256: sha256Json(request), closedPlanSha256: loaded.journal.closedPlanSha256, markerSha256: loaded.journal.markerSha256,
    expectedFingerprintSha256: plan.expectedFingerprintSha256, attemptConsumed: true, executionAuthorized: false, completionProved: false }, "permanent claim");
  return retained.artifact;
}

async function baseline(loaded: Prefix): Promise<{ checkpoint: Record<string, unknown>; checkpointReceipt: Descriptor;
  sourceSha256: string; schemaSha256: string; logicalSha256: string }> {
  const { journal, events } = loaded, checkpoint = bag(bag(events[8]?.data)["checkpoint"]);
  const checkpointPath = text(checkpoint["checkpoint"]), receiptPath = text(checkpoint["receiptPath"]);
  const checkpointDirectory = join(controlDataDirectory(), "checkpoints");
  need(dirname(receiptPath) === checkpointDirectory && dirname(checkpointPath) === checkpointDirectory &&
    checkpoint["source"] === journal.plan.projectPath && checkpoint["schema"] === "easyeda-pro-control.checkpoint.v2",
    "Closed-symbol abandonment baseline checkpoint binding differs.");
  // The ordinary checkpoint validator below rechecks both canonical path scope
  // And receipt shape at publication. Historical reads use only retained files.
  const retained = await managedJson(receiptPath);
  same(retained.value, checkpoint, "retained baseline receipt");
  const { receiptSha256, ...receiptBody } = checkpoint;
  need(receiptSha256 === sha256Json(receiptBody), "Closed-symbol abandonment baseline receipt seal differs.");
  const runtime = await currentProcessSqlRuntime();
  // VACUUM can change schema_version and rowids, so its complete inventory is
  // Validated against its own digest, not equated to the raw-copy inventory.
  // Publication proves current raw source bytes equal the original raw copy
  // And separately verifies the complete checkpoint dump. Historical scans
  // Recheck both retained databases without reopening the current source.
  const sql = await inspectHistoricalAbandonmentSql(loaded, checkpoint, runtime);
  return { checkpoint, checkpointReceipt: retained.artifact, ...sql };
}

function assertVerification(value: unknown, retained: Awaited<ReturnType<typeof baseline>>): z.infer<typeof verification> {
  const checked = verification.parse(value), expected = retained.checkpoint;
  need(checked.sourceSha256 === retained.sourceSha256 && checked.source === expected["source"] &&
    checked.receiptPath === expected["receiptPath"] && checked.checkpoint === expected["checkpoint"] &&
    checked.checkpointSha256 === expected["checkpointSha256"] && checked.sourceDumpSha256 === expected["sourceDumpSha256"] &&
    checked.checkpointDumpSha256 === expected["checkpointDumpSha256"], "Closed-symbol abandonment unchanged-source proof differs.");
  return checked;
}

export interface ClosedSymbolAbandonmentInspection {
  readonly profile: "easyeda-pro-control.closed-symbol-abandonment-inspection.v1";
  readonly classification: "historical-abandonment-verified"; readonly operationId: string;
  readonly originalJournalSha256: string; readonly originalStoredJournalSha256: string;
  readonly artifact: Descriptor; readonly bodySha256: string;
  readonly completionProved: false; readonly executionAuthorized: false; readonly authorityRestored: false;
  readonly replayAllowed: false; readonly saved: false; readonly reopened: false;
}

/** Absence returns before loading any journal, SQL runtime or source project.
 * Present invalid evidence throws; callers must keep the operation blocked. */
export async function inspectClosedSymbolAbandonment(operationId: string): Promise<ClosedSymbolAbandonmentInspection | undefined> {
  const path = pathFor(operationId);
  try { await readArtifact(path, 0, 1); }
  catch (error) { if (isErrnoException(error) && error.code === "ENOENT") { return undefined; } throw error; }
  const retained = await managedJson(path);
  const envelope = envelopeSchema.parse(retained.value), { body } = envelope;
  need(body.operationId === operationId && envelope.bodySha256 === sha256Json(body), "Closed-symbol abandonment envelope binding differs.");
  const loaded = await prefix(operationId);
  need(body.originalJournalSha256 === sha256Json(loaded.journal) && body.originalStoredJournalSha256 === loaded.journal["journalSha256"],
    "Closed-symbol abandonment original journal changed.");
  same(body.phaseArtifacts, loaded.journal.artifacts, "retained phase descriptors");
  same(body.claimArtifact, await claim(loaded), "claim descriptor");
  const recorded = await baseline(loaded);
  same(body.checkpointReceipt, recorded.checkpointReceipt, "baseline receipt descriptor");
  need(body.baselineSourceSha256 === recorded.sourceSha256 && body.baselineSchemaSha256 === recorded.schemaSha256 &&
    body.baselineLogicalSha256 === recorded.logicalSha256, "Closed-symbol abandonment baseline inventory changed.");
  assertVerification(body.verification, recorded);
  // No verifyCheckpoint here: historical qualification must not reopen today's
  // Source project or require that a later legitimate edit preserved its bytes.
  await readExactUtf8Artifact(body.claimArtifact);
  await readExactUtf8Artifact(retained.artifact);
  const final = await prefix(operationId);
  same(final.journal, loaded.journal, "final journal");
  return Object.freeze({ profile: "easyeda-pro-control.closed-symbol-abandonment-inspection.v1", classification: "historical-abandonment-verified",
    operationId, originalJournalSha256: body.originalJournalSha256, originalStoredJournalSha256: body.originalStoredJournalSha256,
    artifact: retained.artifact, bodySha256: envelope.bodySha256, completionProved: false, executionAuthorized: false,
    authorityRestored: false, replayAllowed: false, saved: false, reopened: false });
}

/** Publish one historical no-navigation outcome. This never resumes the old
 * operation, resets its permanent claim or confers authority on another one. */
export async function abandonClosedSymbolBeforeNavigation(operationId: string): Promise<ClosedSymbolAbandonmentInspection> {
  const path = pathFor(operationId);
  need(!busy.has(operationId), "Closed-symbol abandonment is already in progress."); busy.add(operationId);
  try {
    const existing = await inspectClosedSymbolAbandonment(operationId);
    if (existing !== undefined) { return existing; }
    const loaded = await prefix(operationId);
    const claimArtifact = await claim(loaded), recorded = await baseline(loaded);
    const root = await controlRootCapability(false);
    const observed = await verifyCheckpoint(recorded.checkpointReceipt.path, { controlRoot: root,
      artifactRoots: [join(controlDataDirectory(), "checkpoints")], expectedSource: loaded.journal.plan.projectPath, maximumSourceBytes: 268_435_456 });
    const checked = assertVerification(observed, recorded), predecessor = await prefix(operationId);
    same(predecessor.journal, loaded.journal, "publication predecessor");
    await readExactUtf8Artifact(claimArtifact);
    const body: Body = bodySchema.parse({ operationId, recordedAt: new Date().toISOString(), originalJournalSha256: sha256Json(loaded.journal),
      originalStoredJournalSha256: loaded.journal["journalSha256"], phaseArtifacts: loaded.journal.artifacts, claimArtifact,
      checkpointReceipt: recorded.checkpointReceipt, baselineSourceSha256: recorded.sourceSha256,
      baselineSchemaSha256: recorded.schemaSha256, baselineLogicalSha256: recorded.logicalSha256, verification: checked,
      outcome: "abandoned-before-navigation", markerEffectsPreserved: true, processClosureProved: false, completionProved: false,
      executionAuthorized: false, authorityRestored: false, replayAllowed: false, saved: false, reopened: false });
    const envelope = { profile: PROFILE, body, bodySha256: sha256Json(body) };
    const bytes = Buffer.from(`${JSON.stringify(envelope)}\n`);
    need(bytes.length <= MAX_BYTES, "Closed-symbol abandonment publication exceeds its bound.");
    await publishManagedAttachmentExclusive(path, "Closed-symbol historical abandonment", bytes, PROFILE);
    const result = await inspectClosedSymbolAbandonment(operationId);
    need(result !== undefined, "Closed-symbol abandonment publication is unavailable.");
    return result;
  } finally { busy.delete(operationId); }
}
