/** Historical stopped startup only. No continuation, process proof or target release. */
import { opendir } from "node:fs/promises";
import { basename, join } from "node:path";
import { z } from "zod";
import { controlDataDirectory, controlRootCapability, operationPath, publishManagedAttachmentExclusive, readArtifact, readExactUtf8Artifact } from "./artifacts.ts";
import { loadClosedSymbolJournal } from "./closed-symbol-journal.ts";
import { buildStartupProgram, validateStartupResult } from "./closed-symbol-startup-program.ts";
import { VALIDATION_ACTION_ID } from "./closed-symbol-target-claim.ts";
import { canonicalJson, extractToolPayload, isErrnoException, isRecord, sha256Json, sha256Text } from "./core.ts";
import type { ClosedSymbolAbandonmentInspection } from "./closed-symbol-abandonment.ts";

const PROFILE = "easyeda-pro-control.closed-symbol-baseline-abandonment.v1";
const FILE = "abandoned-baseline-before-navigation.json";
const WINDOW_FILE = "00-baseline-owned-window.json";
const MAX_BYTES = 65_536;
const hash = z.string().regex(/^[a-f0-9]{64}$/u);
const identifier = z.string().regex(/^easyeda-[a-z0-9-]{8,96}$/u);
const descriptor = z.object({ path: z.string().min(1).max(4096), bytes: z.number().int().positive().max(262_144), sha256: hash }).strict();
type Descriptor = z.infer<typeof descriptor>;
const flags = { markerEffectsPreserved: z.literal(true), processClosureProved: z.literal(false), sourceInvarianceProved: z.literal(false),
  completionProved: z.literal(false), executionAuthorized: z.literal(false), authorityRestored: z.literal(false),
  replayAllowed: z.literal(false), saved: z.literal(false), reopened: z.literal(false) };
const bodySchema = z.object({ operationId: identifier, recordedAt: z.iso.datetime(), originalJournalSha256: hash,
  originalStoredJournalSha256: hash, phaseArtifacts: z.array(descriptor).length(6), claimArtifact: descriptor, windowArtifact: descriptor.nullable(),
  outcome: z.literal("abandoned-before-navigation"), boundary: z.literal("baseline-startup-observed"), ...flags }).strict();
const envelopeSchema = z.object({ profile: z.literal(PROFILE), body: bodySchema, bodySha256: hash }).strict();
type Loaded = Awaited<ReturnType<typeof loadClosedSymbolJournal>>;
type Prefix = Loaded & Readonly<{ windowArtifact: Descriptor | null }>;
const busy = new Set<string>();
function need(condition: boolean, message: string): asserts condition { if (!condition) { throw new Error(message); } }
function same(actual: unknown, expected: unknown, label: string): void {
  need(canonicalJson(actual) === canonicalJson(expected), `Baseline abandonment ${label} differs.`);
}
function bag(value: unknown): Record<string, unknown> { need(isRecord(value), "Baseline abandonment object missing."); return value; }
function pathFor(operationId: string): string { return join(operationPath(identifier.parse(operationId)).slice(0, -5), FILE); }
async function managedJson(path: string, maximum = MAX_BYTES): Promise<{ artifact: Descriptor; value: unknown }> {
  const page = await readArtifact(path, 0, maximum);
  need(page.eof && page.size > 0 && page.size <= maximum && page.bytesRead === page.size, "Baseline abandonment artifact bound exceeded.");
  const artifact = descriptor.parse({ path, bytes: page.size, sha256: sha256Text(page.text) });
  const raw = await readExactUtf8Artifact(artifact);
  return { artifact, value: JSON.parse(raw.text) as unknown };
}
async function noLaterEvidence(loaded: Loaded): Promise<void> {
  const root = await controlRootCapability(false);
  const directory = await root.openDirectory(operationPath(loaded.journal.operationId).slice(0, -5), false);
  const allowed = new Set(["00-expected-fingerprint.json", WINDOW_FILE, FILE, ...loaded.journal.artifacts.map(item => basename(item.path))]);
  try {
    const entries = await opendir(`/proc/self/fd/${directory.handle.fd}`);
    let count = 0;
    for await (const entry of entries) {
      count += 1;
      need(count <= allowed.size && allowed.has(entry.name), "Baseline abandonment found later or unrecognized evidence.");
    }
    await root.assertCurrent();
  } finally { await directory.handle.close(); }
}
async function windowDiagnostic(loaded: Loaded): Promise<Descriptor | null> {
  const path = join(operationPath(loaded.journal.operationId).slice(0, -5), WINDOW_FILE);
  try { await readArtifact(path, 0, 1); }
  catch (error) { if (isErrnoException(error) && error.code === "ENOENT") { return null; } throw error; }
  const retained = await managedJson(path, 262_144), value = bag(retained.value);
  const generation = loaded.events[3]?.generation;
  need(Object.keys(value).length === 3 && value["profile"] === "private.closed-symbol-owned-window.v1" && generation !== null && generation !== undefined,
    "Baseline abandonment window diagnostic shape differs.");
  same(value["generation"], generation, "window generation");
  const observed = bag(value["observed"]);
  const binding = bag(observed["binding"]);
  need(observed["schema"] === "easyeda-pro-control.windows-native-ui.v1" && observed["action"] === "windows" &&
    observed["authority"] === "retained-job" && isRecord(observed["result"]) && binding["rootPid"] === generation.rootPid &&
    typeof binding["rootStartTicks"] === "string" && /^\d{15,20}$/u.test(binding["rootStartTicks"]) &&
    generation.rootStartIdentity === `win32:${binding["rootStartTicks"]}:job:${generation.jobId}` &&
    typeof binding["executable"] === "string" && /^[A-Za-z]:\\[^\0\r\n]{1,4096}\.exe$/u.test(binding["executable"]),
  "Baseline abandonment window diagnostic owner differs.");
  hash.parse(binding["executableSha256"]);
  // Preserve this diagnostic, including failed/ambiguous selection. It neither
  // Selects a window nor proves the executable or process is currently present.
  return retained.artifact;
}
async function prefix(operationId: string): Promise<Prefix> {
  const loaded = await loadClosedSymbolJournal(operationId), { journal, events } = loaded;
  need(journal.sequence === 6 && events.length === 6 && journal.state === "closed-session-recording" &&
    !journal.hardStop && !journal.orphanedCallPossible && !journal.mutationMayHaveOccurred &&
    journal.plan.operation.id === VALIDATION_ACTION_ID, "Baseline abandonment requires the exact unquarantined six-event validation prefix.");
  hash.parse(journal["journalSha256"]);
  const input = { phase: "baseline-marker-create" as const, projectUuid: journal.plan.projectUuid, branchUuid: journal.plan.branchUuid,
    ownerUuid: journal.plan.ownerUuid, marker: journal.plan.marker };
  const request = { profile: "easyeda-pro-control.closed-symbol-startup-request.v1", input,
    codeSha256: sha256Text(buildStartupProgram(input)), directMainFrameOnly: true };
  same(events[4]?.data, request, "fixed startup intent");
  need(events[4]?.requestSha256 === sha256Json(request), "Baseline abandonment request hash differs.");
  const data = bag(events[5]?.data);
  need(Object.keys(data).length === 1 && Object.hasOwn(data, "rawReturn"), "Baseline abandonment original startup return missing.");
  const raw = bag(data["rawReturn"]);
  need(raw["isError"] !== true, "Baseline abandonment startup transport refused.");
  const startup = validateStartupResult(extractToolPayload(raw), input);
  need(startup["ok"] === true && startup["markerCreateAttempted"] === true,
    "Baseline abandonment requires the complete successful startup observation.");
  await noLaterEvidence(loaded);
  return { ...loaded, windowArtifact: await windowDiagnostic(loaded) };
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
export interface ClosedSymbolBaselineAbandonmentInspection extends ClosedSymbolAbandonmentInspection {
  readonly evidenceProfile: typeof PROFILE;
  readonly boundary: "baseline-startup-observed";
  readonly processClosureProved: false;
  readonly sourceInvarianceProved: false;
}
/** Historical inspection never opens the project, recreates its marker or restores owners. */
export async function inspectClosedSymbolBaselineAbandonment(operationId: string): Promise<ClosedSymbolBaselineAbandonmentInspection | undefined> {
  const path = pathFor(operationId);
  try { await readArtifact(path, 0, 1); }
  catch (error) { if (isErrnoException(error) && error.code === "ENOENT") { return undefined; } throw error; }
  const retained = await managedJson(path);
  const envelope = envelopeSchema.parse(retained.value), { body } = envelope;
  need(body.operationId === operationId && envelope.bodySha256 === sha256Json(body), "Baseline abandonment envelope binding differs.");
  const loaded = await prefix(operationId);
  need(body.originalJournalSha256 === sha256Json(loaded.journal) && body.originalStoredJournalSha256 === loaded.journal["journalSha256"],
    "Baseline abandonment original journal changed.");
  same(body.phaseArtifacts, loaded.journal.artifacts, "phase descriptors");
  same(body.windowArtifact, loaded.windowArtifact, "window diagnostic descriptor");
  same(body.claimArtifact, await claim(loaded), "claim descriptor");
  await readExactUtf8Artifact(body.claimArtifact);
  await readExactUtf8Artifact(retained.artifact);
  const final = await prefix(operationId);
  same(final, loaded, "final prefix");
  return Object.freeze({ profile: "easyeda-pro-control.closed-symbol-abandonment-inspection.v1", classification: "historical-abandonment-verified",
    operationId, originalJournalSha256: body.originalJournalSha256, originalStoredJournalSha256: body.originalStoredJournalSha256,
    artifact: retained.artifact, bodySha256: envelope.bodySha256, evidenceProfile: PROFILE, boundary: body.boundary,
    processClosureProved: false, sourceInvarianceProved: false, completionProved: false, executionAuthorized: false,
    authorityRestored: false, replayAllowed: false, saved: false, reopened: false });
}
/** Index-only publication inside its existing serialized recovery gate. That gate
 * excludes an active coordinator; the index also checks any retained entry return.
 * This profile proves no project navigation by the fixed prefix, not file equality
 * or application closure. The permanent target claim and marker remain consumed.
 */
export async function abandonClosedSymbolBaselineBeforeNavigation(operationId: string): Promise<ClosedSymbolBaselineAbandonmentInspection> {
  const path = pathFor(operationId);
  need(!busy.has(operationId), "Baseline abandonment is already in progress."); busy.add(operationId);
  try {
    const existing = await inspectClosedSymbolBaselineAbandonment(operationId);
    if (existing !== undefined) { return existing; }
    const loaded = await prefix(operationId);
    const claimArtifact = await claim(loaded);
    const predecessor = await prefix(operationId);
    same(predecessor, loaded, "publication predecessor");
    await readExactUtf8Artifact(claimArtifact);
    const body = bodySchema.parse({ operationId, recordedAt: new Date().toISOString(), originalJournalSha256: sha256Json(loaded.journal),
      originalStoredJournalSha256: loaded.journal["journalSha256"], phaseArtifacts: loaded.journal.artifacts, claimArtifact, windowArtifact: loaded.windowArtifact,
      outcome: "abandoned-before-navigation", boundary: "baseline-startup-observed", markerEffectsPreserved: true,
      processClosureProved: false, sourceInvarianceProved: false, completionProved: false, executionAuthorized: false,
      authorityRestored: false, replayAllowed: false, saved: false, reopened: false });
    const envelope = { profile: PROFILE, body, bodySha256: sha256Json(body) };
    const bytes = Buffer.from(`${JSON.stringify(envelope)}\n`);
    need(bytes.length <= MAX_BYTES, "Baseline abandonment publication exceeds its bound.");
    await publishManagedAttachmentExclusive(path, "Closed-symbol stopped baseline abandonment", bytes, PROFILE);
    const result = await inspectClosedSymbolBaselineAbandonment(operationId);
    need(result !== undefined, "Baseline abandonment publication is unavailable.");
    return result;
  } finally { busy.delete(operationId); }
}
