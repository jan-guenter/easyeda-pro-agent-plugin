/** Historical pre-relaunch retirement only. Never restores process/copy authority,
 * checks the original project file, or resumes the abandoned coordinator.
 */
import { opendir } from "node:fs/promises";
import { basename, join } from "node:path";
import { z } from "zod";
import { controlDataDirectory, controlRootCapability, loadOperation, operationPath, publishManagedAttachmentExclusive,
  readArtifact, readExactUtf8Artifact, verifyExactManagedArtifact } from "./artifacts.ts";
import { canonicalJson, isErrnoException, isRecord, normalizeEasyedaProjectPath, sha256Json, sha256Text } from "./core.ts";

const PROFILE = "easyeda-pro-control.current-symbol-baseline-abandonment.v1";
export const CURRENT_BASELINE_PROFILE = "easyeda-pro-control.current-symbol-closed-baseline.v1";
const FILE = "abandoned-baseline-before-relaunch.json";
const MAX_BYTES = 262_144;
const phases = ["capture-intent", "capture-result", "close-intent", "close-result", "copy-intent", "copy-result", "stopped"] as const;
const hash = z.string().regex(/^[a-f0-9]{64}$/u);
const identifier = z.string().regex(/^[a-z0-9][a-z0-9-]{7,95}$/iu);
const descriptor = z.object({ path: z.string().min(1).max(4096), bytes: z.number().int().positive().max(268_435_456), sha256: hash }).strict();
type Descriptor = z.infer<typeof descriptor>;
const value = z.record(z.string(), z.unknown());
const phaseEvidence = z.object({ artifact: descriptor, value }).strict();
const flags = { completionProved: z.literal(false), processClosureProved: z.literal(false), currentSourceChecked: z.literal(false),
  sourceInvarianceProved: z.literal(false), authorityRestored: z.literal(false), executionAuthorized: z.literal(false),
  replayAllowed: z.literal(false), writerReady: z.literal(false), saved: z.literal(false), reopened: z.literal(false) };
const bodySchema = z.object({ operationId: identifier, recordedAt: z.iso.datetime(), originalJournalSha256: hash,
  originalStoredJournalSha256: hash, originalJournal: value, phaseEvidence: z.array(phaseEvidence).length(7),
  rawCopy: descriptor, checkpoint: descriptor, checkpointReceipt: descriptor,
  producerContract: z.literal("current-symbol-baseline.v1:closed-copy-result-before-durable-relaunch-intent"),
  boundary: z.literal("closed-baseline-before-relaunch-intent"), outcome: z.literal("abandoned-before-relaunch"),
  confirmDisposableProject: z.literal(true), ...flags }).strict();
const envelopeSchema = z.object({ profile: z.literal(PROFILE), body: bodySchema, bodySha256: hash }).strict();
const journalSchema = z.object({ schema: z.literal("easyeda-pro-control.operation.v2"), operationId: identifier,
  journalPath: z.string(), plan: value, planHash: hash, state: z.literal("stopped"), mutationState: z.literal("not-inferred"),
  saved: z.literal(false), reopened: z.literal(false), orphanedCallPossible: z.literal(false), hardStop: z.literal(true),
  mutationMayHaveOccurred: z.literal(true), sequence: z.literal(7), artifacts: z.array(descriptor).length(7),
  closeAttempted: z.literal(true), copyAttempted: z.literal(true), relaunchAttempted: z.literal(true),
  releaseAttempted: z.literal(false), admissionAttempted: z.literal(false), cacheAttempted: z.literal(false), projectOpenAttempted: z.literal(false),
  finishCloseAttempted: z.literal(false), finishReleaseAttempted: z.literal(false), finishSnapshotAttempted: z.literal(false).optional(),
  finishSnapshotCaptured: z.literal(false).optional(), finishSnapshotFailed: z.literal(false).optional(),
  createdAt: z.iso.datetime(), updatedAt: z.iso.datetime(), nextSafeAction: z.string(), integrityModel: z.string(), journalSha256: hash }).strict();
type Prefix = Readonly<{ journal: z.infer<typeof journalSchema>; events: z.infer<typeof phaseEvidence>[];
  rawCopy: Descriptor; checkpoint: Descriptor; checkpointReceipt: Descriptor }>;
const busy = new Set<string>();
function need(condition: boolean, message: string): asserts condition { if (!condition) { throw new Error(message); } }
function bag(input: unknown): Record<string, unknown> { need(isRecord(input), "Pre-relaunch abandonment object missing."); return input; }
function same(actual: unknown, expected: unknown, label: string): void {
  need(canonicalJson(actual) === canonicalJson(expected), `Pre-relaunch abandonment ${label} differs.`);
}
function sealed(input: unknown, key: string): Record<string, unknown> {
  const object = bag(input);
  const digest = hash.parse(object[key]);
  const payload = Object.fromEntries(Object.entries(object).filter(([name]) => name !== key));
  need(sha256Json(payload) === digest, `Pre-relaunch abandonment ${key} differs.`); return object;
}
function pathFor(operationId: string): string { return join(operationPath(identifier.parse(operationId)).slice(0, -5), FILE); }
async function managedJson(path: string): Promise<{ artifact: Descriptor; value: Record<string, unknown> }> {
  const page = await readArtifact(path, 0, MAX_BYTES);
  need(page.eof && page.size > 0 && page.size <= MAX_BYTES && page.bytesRead === page.size, "Pre-relaunch abandonment JSON bound exceeded.");
  const artifact = descriptor.parse({ path, bytes: page.size, sha256: sha256Text(page.text) });
  const raw = await readExactUtf8Artifact(artifact);
  return { artifact, value: bag(JSON.parse(raw.text)) };
}
async function noLaterEvidence(operationId: string, artifacts: readonly Descriptor[], rawCopy: Descriptor): Promise<void> {
  const root = await controlRootCapability(false);
  const directory = await root.openDirectory(operationPath(operationId).slice(0, -5), false);
  const required = new Set([basename(rawCopy.path), ...artifacts.map(item => basename(item.path))]);
  const allowed = new Set([FILE, ...required]);
  try {
    const entries = await opendir(`/proc/self/fd/${directory.handle.fd}`);
    const seen = new Set<string>();
    for await (const entry of entries) {
      seen.add(entry.name);
      need(entry.isFile() && seen.size <= allowed.size && allowed.has(entry.name), "Pre-relaunch abandonment found later or unrecognized evidence.");
    }
    need([...required].every(name => seen.has(name)), "Pre-relaunch abandonment evidence directory is incomplete.");
    const after = await directory.handle.stat({ bigint: true });
    const unchanged = (current: typeof after): boolean => current.dev === directory.info.dev && current.ino === directory.info.ino &&
      current.ctimeNs === directory.info.ctimeNs && current.mtimeNs === directory.info.mtimeNs;
    need(unchanged(after), "Pre-relaunch abandonment evidence directory changed during enumeration.");
    const named = await root.openDirectory(directory.absolute, false);
    try { need(unchanged(named.info), "Pre-relaunch abandonment evidence directory path changed."); }
    finally { await named.handle.close(); }
    await root.assertCurrent();
  } finally { await directory.handle.close(); }
}

function bindClosure(journal: z.infer<typeof journalSchema>, events: Prefix["events"]): void {
  const plan = journal.plan;
  const launch = bag(plan["launch"]);
  const capture = bag(events[1]?.value["capture"]);
  const authority = sealed(capture["executionAuthority"], "authoritySha256");
  const intent = sealed(events[2]?.value["intent"], "closeIntentSha256");
  const receipt = sealed(events[3]?.value["closeReceipt"], "closeReceiptSha256");
  const proof = sealed(events[4]?.value["proof"], "proofSha256");
  need(capture["operationId"] === journal.operationId && capture["phase"] === "closed-baseline" && capture["challengeAttempt"] === 1 &&
    authority["schema"] === "easyeda-pro-control.execution-authority.v1" && authority["processTreeSha256"] === sha256Json(authority["processes"]),
  "Pre-relaunch abandonment capture binding differs.");
  const processes = z.array(value).min(1).max(256).parse(authority["processes"]);
  same(processes.filter(item => item["role"] === "easyeda-main"), [launch["root"]], "captured root");
  need(processes.every(item => typeof item["startIdentity"] === "string" && item["startIdentity"].endsWith(`:job:${String(launch["jobId"])}`)),
    "Pre-relaunch abandonment captured Job differs.");
  const shared = { operationId: journal.operationId, phase: "closed-baseline", challengeAttempt: 1,
    authoritySha256: authority["authoritySha256"], launchSha256: sha256Json(launch),
    bridgeSessionSha256: sha256Json(capture["bridgeSession"]), runtimeIdentitySha256: sha256Json(capture["runtimeIdentity"]),
    helperInstance: launch["helperInstance"], jobId: launch["jobId"], policyId: authority["policyId"], policySha256: authority["policySha256"] };
  for (const [key, expected] of Object.entries(shared)) { same(intent[key], expected, `close intent ${key}`); same(proof[key], expected, `termination ${key}`); }
  need(intent["schema"] === "easyeda-pro-control.closed-session-close-intent.v1" && intent["captureBindingSha256"] === authority["bindingSha256"] &&
    receipt["schema"] === "easyeda-pro-control.closed-session-close-dispatch.v1" && receipt["closeIntentSha256"] === intent["closeIntentSha256"] &&
    receipt["closeDispatched"] === true && receipt["saveOrDiscardSelected"] === false && receipt["terminationProved"] === false &&
    proof["schema"] === "easyeda-pro-control.closed-session-termination.v1" && proof["closeIntentSha256"] === intent["closeIntentSha256"] &&
    proof["closeReceiptSha256"] === receipt["closeReceiptSha256"] && proof["jobEmpty"] === true && proof["retainedProcessesExited"] === true &&
    proof["saveOrDiscardSelected"] === false && proof["queuedWritesPersisted"] === "not-proved" && proof["persistentWorkReplayExcluded"] === "not-proved",
  "Pre-relaunch abandonment recorded closure chain differs.");
  need(sealed(events[5]?.value["copy"], "receiptSha256")["closureProofSha256"] === proof["proofSha256"],
    "Pre-relaunch abandonment copy closure differs.");
}

async function prefix(operationId: string): Promise<Prefix> {
  const journal = journalSchema.parse(await loadOperation(identifier.parse(operationId)));
  need(journal.journalPath === operationPath(operationId) && journal.plan["profile"] === CURRENT_BASELINE_PROFILE,
    "Pre-relaunch abandonment requires its exact current closed-baseline profile.");
  const events: Prefix["events"] = [];
  for (const [index, phase] of phases.entries()) {
    const artifact = journal.artifacts[index];
    need(artifact !== undefined && artifact.bytes <= MAX_BYTES && artifact.path === join(operationPath(operationId).slice(0, -5), `${String(index + 1).padStart(2, "0")}-${phase}.json`),
      "Pre-relaunch abandonment requires the contiguous seven-phase prefix.");
    const raw = await readExactUtf8Artifact(artifact); events.push({ artifact, value: bag(JSON.parse(raw.text)) });
  }
  const first = events[0]?.value, preparation = sealed(first?.["preparation"], "preparationSha256"), target = bag(journal.plan["target"]);
  need(first?.["openingOperationId"] === journal.plan["openingOperationId"] && preparation["openingOperationId"] === journal.plan["openingOperationId"] &&
    preparation["profile"] === "private.current-owned-symbol-metadata-preparation.v1" && preparation["preparationSha256"] === journal.plan["preparationSha256"] &&
    preparation["postOpeningBaselineVerified"] === false && preparation["writerReady"] === false && preparation["executionAuthorized"] === false,
  "Pre-relaunch abandonment preparation differs.");
  const stopped = events[6]?.value;
  const expectedStopped: Record<string, unknown> = { phase: "relaunch-or-release", replayAllowed: false, closeAttempted: true, copyAttempted: true,
    relaunchAttempted: true, launchAcknowledged: false, releaseAttempted: false, captureReleased: false, admissionAttempted: false,
    admissionCaptureRetained: false, cacheAttempted: false, cacheReplyRetained: false, projectOpenAttempted: false, projectOpenReplyRetained: false,
    finishCloseAttempted: false, finishCloseAcknowledged: false, finishReleaseAttempted: false, finishCaptureReleased: false };
  if (Object.hasOwn(journal, "finishSnapshotAttempted")) {
    Object.assign(expectedStopped, { finishSnapshotAttempted: false, finishSnapshotCaptured: false, finishSnapshotFailed: false,
      finishSnapshotEvidence: { checkpoint: null, copy: null } });
  }
  same(stopped, expectedStopped, "pre-dispatch stopped event");
  bindClosure(journal, events);
  const result = events[5]?.value;
  need(result !== undefined && ["beforeWriteBaselineVerified", "openingEffectsVerified", "writerReady", "executionAuthorized"].every(key => result[key] === false),
    "Pre-relaunch abandonment closed-copy result flags differ.");
  const checkpointReceipt = sealed(result["checkpoint"], "receiptSha256"), copy = sealed(result["copy"], "receiptSha256");
  const prepared = bag(result["preparation"]);
  const preparedTarget = bag(prepared["target"]), sql = bag(result["sql"]), targetEvidence = bag(result["targetEvidence"]);
  const rawPath = z.string().parse(target["rawWindowsPath"]), source = normalizeEasyedaProjectPath(rawPath);
  need(target["projectUuid"] === sha256Text(rawPath) && checkpointReceipt["source"] === source && copy["source"] === source &&
    checkpointReceipt["schema"] === "easyeda-pro-control.checkpoint.v2" && copy["schema"] === "easyeda-pro-control.closed-file-byte-copy.v1" &&
    checkpointReceipt["sourceSha256"] === copy["sha256"] && sql["checkpointSha256"] === copy["sha256"] &&
    copy["sourceEqualsArtifactBytes"] === true && copy["sourceProjectGenerationBindingVerified"] === false && copy["executionAuthorized"] === false &&
    preparedTarget["projectUuid"] === target["projectUuid"] && preparedTarget["branchUuid"] === target["branchUuid"] &&
    targetEvidence["projectUuid"] === target["projectUuid"] && targetEvidence["branchUuid"] === target["branchUuid"] &&
    targetEvidence["documentUuid"] === target["documentUuid"] && targetEvidence["docType"] === "PCB" && targetEvidence["ownerUuid"] === preparedTarget["ownerUuid"],
  "Pre-relaunch abandonment closed-copy lineage differs.");
  hash.parse(sql["schemaSha256"]); hash.parse(sql["logicalSha256"]);
  const rawCopy = descriptor.parse({ path: copy["artifact"], bytes: copy["bytes"], sha256: copy["sha256"] });
  need(/^closed-copy-[a-f0-9-]{36}\.eprj2$/u.test(basename(rawCopy.path)) && rawCopy.path === join(operationPath(operationId).slice(0, -5), basename(rawCopy.path)),
    "Pre-relaunch abandonment raw copy escaped its operation.");
  const checkpoint = descriptor.parse(bag(prepared["checkpoint"]));
  need(checkpoint.path === checkpointReceipt["checkpoint"] && checkpoint.sha256 === checkpointReceipt["checkpointSha256"] &&
    checkpoint.path === join(controlDataDirectory(), "checkpoints", basename(checkpoint.path)) && checkpoint.path.endsWith(".eprj2"),
  "Pre-relaunch abandonment checkpoint escaped its managed directory.");
  const receiptPath = z.string().parse(checkpointReceipt["receiptPath"]);
  need(receiptPath === checkpoint.path.replace(/\.eprj2$/u, ".checkpoint.json"), "Pre-relaunch abandonment checkpoint receipt path differs.");
  const retainedReceipt = await managedJson(receiptPath); same(retainedReceipt.value, checkpointReceipt, "retained checkpoint receipt");
  await verifyExactManagedArtifact(rawCopy); await verifyExactManagedArtifact(checkpoint);
  await noLaterEvidence(operationId, journal.artifacts, rawCopy);
  return { journal, events, rawCopy, checkpoint, checkpointReceipt: retainedReceipt.artifact };
}

export interface CurrentSymbolBaselineAbandonmentInspection {
  readonly profile: "easyeda-pro-control.current-symbol-baseline-abandonment-inspection.v1";
  readonly classification: "historical-abandonment-verified";
  readonly operationId: string;
  readonly originalJournalSha256: string;
  readonly originalStoredJournalSha256: string;
  readonly artifact: Descriptor;
  readonly bodySha256: string;
  readonly completionProved: false; readonly processClosureProved: false; readonly currentSourceChecked: false;
  readonly sourceInvarianceProved: false; readonly authorityRestored: false; readonly executionAuthorized: false;
  readonly replayAllowed: false; readonly writerReady: false; readonly saved: false; readonly reopened: false;
}
export async function inspectCurrentSymbolBaselineAbandonment(operationId: string): Promise<CurrentSymbolBaselineAbandonmentInspection | undefined> {
  const path = pathFor(operationId);
  try { await readArtifact(path, 0, 1); }
  catch (error) { if (isErrnoException(error) && error.code === "ENOENT") { return undefined; } throw error; }
  const retained = await managedJson(path);
  const envelope = envelopeSchema.parse(retained.value), { body } = envelope;
  need(body.operationId === operationId && envelope.bodySha256 === sha256Json(body), "Pre-relaunch abandonment envelope differs.");
  const loaded = await prefix(operationId);
  same(body.originalJournal, loaded.journal, "original journal"); same(body.phaseEvidence, loaded.events, "all phase evidence");
  need(body.originalJournalSha256 === sha256Json(loaded.journal) && body.originalStoredJournalSha256 === loaded.journal.journalSha256,
    "Pre-relaunch abandonment original journal hashes differ.");
  same(body.rawCopy, loaded.rawCopy, "raw copy"); same(body.checkpoint, loaded.checkpoint, "checkpoint");
  same(body.checkpointReceipt, loaded.checkpointReceipt, "checkpoint receipt");
  await readExactUtf8Artifact(retained.artifact);
  same(await prefix(operationId), loaded, "final prefix");
  return Object.freeze({ profile: "easyeda-pro-control.current-symbol-baseline-abandonment-inspection.v1", classification: "historical-abandonment-verified",
    operationId, originalJournalSha256: body.originalJournalSha256, originalStoredJournalSha256: body.originalStoredJournalSha256,
    artifact: retained.artifact, bodySha256: envelope.bodySha256, completionProved: false, processClosureProved: false, currentSourceChecked: false,
    sourceInvarianceProved: false, authorityRestored: false, executionAuthorized: false, replayAllowed: false, writerReady: false, saved: false, reopened: false });
}

/** The producer durably records relaunch-intent before calling runtime.launch.
 * Exactly seven preserved phases exclude that dispatch, not merely its reply.
 * Publication consumes no handles and changes neither journal nor project.
 */
export async function abandonCurrentSymbolBaselineBeforeRelaunch(operationId: string): Promise<CurrentSymbolBaselineAbandonmentInspection> {
  const path = pathFor(operationId); need(!busy.has(operationId), "Pre-relaunch abandonment is already in progress."); busy.add(operationId);
  try {
    const existing = await inspectCurrentSymbolBaselineAbandonment(operationId); if (existing !== undefined) { return existing; }
    const loaded = await prefix(operationId); same(await prefix(operationId), loaded, "publication predecessor");
    const body = bodySchema.parse({ operationId, recordedAt: new Date().toISOString(), originalJournalSha256: sha256Json(loaded.journal),
      originalStoredJournalSha256: loaded.journal.journalSha256, originalJournal: loaded.journal, phaseEvidence: loaded.events,
      rawCopy: loaded.rawCopy, checkpoint: loaded.checkpoint, checkpointReceipt: loaded.checkpointReceipt,
      producerContract: "current-symbol-baseline.v1:closed-copy-result-before-durable-relaunch-intent",
      boundary: "closed-baseline-before-relaunch-intent", outcome: "abandoned-before-relaunch", confirmDisposableProject: true,
      completionProved: false, processClosureProved: false, currentSourceChecked: false, sourceInvarianceProved: false,
      authorityRestored: false, executionAuthorized: false, replayAllowed: false, writerReady: false, saved: false, reopened: false });
    const bytes = Buffer.from(`${JSON.stringify({ profile: PROFILE, body, bodySha256: sha256Json(body) })}\n`);
    need(bytes.length <= MAX_BYTES, "Pre-relaunch abandonment publication exceeds its bound.");
    await publishManagedAttachmentExclusive(path, "Current baseline historical abandonment", bytes, PROFILE);
    const result = await inspectCurrentSymbolBaselineAbandonment(operationId); need(result !== undefined, "Pre-relaunch abandonment publication is unavailable.");
    return result;
  } finally { busy.delete(operationId); }
}
