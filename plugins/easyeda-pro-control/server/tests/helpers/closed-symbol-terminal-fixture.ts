/** Synthetic managed artifacts only. These shaped terminal records do not prove completion. */
/* oxlint-disable import/max-dependencies -- Compose the actual managed journal, closed copy, SQL reader and synthetic authority producers without replacement proof callbacks. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { loadOperation, operationPath, updateOperation, writePhaseArtifact } from "../../src/artifacts.ts";
import { copyClosedProjectBytes } from "../../src/closed-file-copy.ts";
import { readClosedCopySqlInventory } from "../../src/closed-file-sql.ts";
import { FAMILY, STEPS, appendClosedSymbolEvent, createClosedSymbolJournal, loadClosedSymbolJournal } from "../../src/closed-symbol-journal.ts";
import type { AppendInput, ClosedJournal, ClosedSymbolPlan, Generation, LaunchGeneration } from "../../src/closed-symbol-journal.ts";
import { newOperationId, sha256Json } from "../../src/core.ts";
import { syntheticSqlRoot, syntheticSqlRuntime } from "./sqlite-inventory-fixture.ts";
import { mintSyntheticClosedSessionProof } from "./windows-closed-session-fixture.ts";
import { TERMINAL_NEXT_ACTION, TERMINAL_STATE, parseClosedSymbolTerminalEnvelope } from "../../src/closed-symbol-terminal-shape.ts";
import type { ClosedSymbolTerminalEnvelope, TerminalDescriptor } from "../../src/closed-symbol-terminal-shape.ts";

const digest = "a".repeat(64), project = "b".repeat(64), target = "c".repeat(32);
export function terminalPlan(projectPath: string): ClosedSymbolPlan {
  return { profile: FAMILY, projectUuid: project, branchUuid: "d".repeat(32), ownerUuid: "e".repeat(32), targetUuid: target, activeUuid: "f".repeat(32), projectPath,
    operation: { id: "rename-synthetic", action: "library.symbol.modify", libraryUuid: project, target: { uuid: target }, patch: { name: "Historical Ω" } },
    marker: { namespaceNonce: "1".repeat(64), keyNonce: "2".repeat(64), bodyNonce: "3".repeat(64) }, nativePinsSha256: digest, facadeSha256: digest, expectedFingerprintSha256: digest };
}
export function terminalPhaseInput(journal: ClosedJournal): AppendInput {
  const step = STEPS[Math.floor(journal.sequence / 2)]; assert.ok(step !== undefined);
  const kind = journal.sequence % 2 === 0 ? "intent" : "result";
  let ordinal = 2;
  if (step.startsWith("baseline-")) { ordinal = 0; }
  else if (step.startsWith("edit-")) { ordinal = 1; }
  const jobId = String(ordinal + 1).repeat(32);
  const launch: LaunchGeneration = { ordinal, helperInstance: "a".repeat(32), jobId, rootPid: ordinal + 100, rootStartIdentity: `win32:13436257345960252${String(ordinal)}:job:${jobId}` };
  const full: Generation = { ...launch, runtimeSha256: digest, sessionSha256: digest, captureSha256: digest };
  let generation: LaunchGeneration | Generation | null = full;
  if (step.endsWith("-launch")) { generation = kind === "intent" ? null : launch; }
  else if (step.endsWith("-admission") && kind === "intent") { generation = launch; }
  const launchReceipt = { jobId, helperInstance: launch.helperInstance, root: { pid: launch.rootPid, role: "easyeda-main", startIdentity: launch.rootStartIdentity } };
  return { step, kind, generation, requestSha256: sha256Json({ step }), data: step.endsWith("-launch") && kind === "result" ? { launchReceipt, launchReceiptSha256: sha256Json(launchReceipt) } : { syntheticOnly: true } };
}
export function envelopeForJournal(journal: ClosedJournal): ClosedSymbolTerminalEnvelope {
  const directory = operationPath(journal.operationId).slice(0, -5);
  const artifact = (name: string): TerminalDescriptor => ({ path: join(directory, name), bytes: 1, sha256: digest });
  const sqlDigests = { checkpointSha256: digest, schemaSha256: digest, logicalSha256: digest };
  const body = { operationId: journal.operationId, family: FAMILY, closedPlanSha256: journal.closedPlanSha256, markerSha256: journal.markerSha256,
    expectedFingerprintSha256: journal.plan.expectedFingerprintSha256, facadeSha256: journal.plan.facadeSha256, nativePinsSha256: journal.plan.nativePinsSha256,
    predecessor: { state: "closed-session-evidence-recorded" as const, updatedAt: journal.updatedAt, nextSafeAction: journal.nextSafeAction, entireJournalSha256: sha256Json(journal) },
    recordedAt: new Date(Date.parse(journal.updatedAt) + 1).toISOString(), phaseArtifacts: journal.artifacts,
    generations: ([0, 1, 2] as const).map((ordinal) => ({ ordinal, generationSha256: digest, launchReceiptSha256: digest, closeIntentSha256: digest,
      closeReceiptSha256: digest, terminationProofSha256: digest, checkpointReceiptSha256: digest, copyReceiptSha256: digest,
      copyArtifact: artifact(`closed-copy-${String(ordinal).repeat(8)}-0000-4000-8000-000000000000.eprj2`), sqlDigests })),
    evidence: { fingerprint: artifact("00-expected-fingerprint.json"), baselineWindow: artifact("00-baseline-owned-window.json"),
      editWindow: artifact("00-edit-owned-window.json"), verificationWindow: artifact("00-verify-owned-window.json"),
      witnessQualification: artifact("20-edit-witness-clock-qualification.json"), witnessRaw: artifact("20-edit-witness-result.json"),
      writeRaw: artifact("22-edit-write-result.json"), savedReadRaw: artifact("38-verify-content-read-raw.json") },
    results: { witnessResultSha256: digest, preparationSha256: digest, writeResultSha256: digest, editComparisonSha256: digest, savedSourceSha256: digest,
      savedReadResultSha256: digest, verificationComparisonSha256: digest, verificationNavigationBindingSha256: digest },
    finalSource: { source: journal.plan.projectPath, sourceSha256: digest, sourceIdentitySha256: digest, checkpointReceiptSha256: digest,
      copyReceiptSha256: digest, sqlDigests, method: "issued-copy+verifyCheckpoint+complete-sql" as const },
    outcome: { metadataPersistedAndVerified: true as const, savedContentVerifiedInFreshWorker: true as const, wholeOwnedSessionsExited: true as const,
      companionOpenedInFreshSession: true as const, explicitSavePerformed: false as const, targetEditorOpened: false as const, saved: false as const, reopened: false as const } };
  return parseClosedSymbolTerminalEnvelope({ profile: "easyeda-pro-control.closed-symbol-terminal.v1", body, bodySha256: sha256Json(body) });
}
export async function terminalFixture(): Promise<{
  predecessor: ClosedJournal; stored: Awaited<ReturnType<typeof loadOperation>>; envelope: ClosedSymbolTerminalEnvelope;
  terminalArtifact: TerminalDescriptor; copy: Awaited<ReturnType<typeof copyClosedProjectBytes>>;
}> {
  const directory = await mkdtemp(join(syntheticSqlRoot(), "terminal-phase-"));
  const source = join(directory, "source.eprj2");
  const database = new DatabaseSync(source, { defensive: false });
  try { database.exec("CREATE TABLE t(value); INSERT INTO t(rowid,value) VALUES(55,'historical'); PRAGMA schema_version=99"); }
  finally { database.close(); }
  const journal = await createClosedSymbolJournal(newOperationId(), terminalPlan(source));
  journal["syntheticUnknown"] = { important: ["Ω", { retained: true }] }; await updateOperation(journal);
  while (journal.sequence < 9) { await appendClosedSymbolEvent(journal, terminalPhaseInput(journal)); }
  const { proof } = await mintSyntheticClosedSessionProof();
  const expectedSourceSha256 = createHash("sha256").update(await readFile(source)).digest("hex");
  const copy = await copyClosedProjectBytes({ source, expectedSourceSha256, artifactDirectory: operationPath(journal.operationId).slice(0, -5), closureProof: proof });
  const inventory = await readClosedCopySqlInventory({ copy, runtime: await syntheticSqlRuntime() });
  const data = { copyReceipt: structuredClone(copy), sqlDigests: { checkpointSha256: inventory.checkpointSha256, schemaSha256: inventory.schemaSha256, logicalSha256: inventory.logicalSha256 } };
  while (journal.sequence < 44) {
    const next = terminalPhaseInput(journal);
    await appendClosedSymbolEvent(journal, next.step.endsWith("-copy") && next.kind === "result" ? { ...next, data } : next);
  }
  const { journal: predecessor } = await loadClosedSymbolJournal(journal.operationId);
  const envelope = envelopeForJournal(predecessor);
  const terminalArtifact = await writePhaseArtifact(journal.operationId, 45, "closed-symbol-terminal", envelope);
  assert.equal(basename(terminalArtifact.path), "45-closed-symbol-terminal.json");
  const successor = { ...predecessor, state: TERMINAL_STATE, updatedAt: envelope.body.recordedAt, nextSafeAction: TERMINAL_NEXT_ACTION, terminalArtifact };
  await updateOperation(successor);
  const stored = await loadOperation(journal.operationId);
  return { predecessor, stored, envelope, terminalArtifact, copy };
}
