/** Shaped synthetic bytes only. The six .eprj2 files are NOT SQL completion evidence. */
/* oxlint-disable import/max-dependencies -- Compose real journal/storage shape helpers with synthetic files, without replacing any production proof issuer. */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { lstat, mkdir, mkdtemp, symlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { loadOperation, operationPath, updateOperation, writePhaseArtifact } from "../../src/artifacts.ts";
import { createClosedSymbolJournal } from "../../src/closed-symbol-journal.ts";
import type { PhaseEvent } from "../../src/closed-symbol-journal.ts";
import { TERMINAL_NEXT_ACTION, TERMINAL_STATE, parseClosedSymbolTerminalEnvelope } from "../../src/closed-symbol-terminal-shape.ts";
import { newOperationId, sha256Json, sha256Text } from "../../src/core.ts";
import { envelopeForJournal, terminalPhaseInput, terminalPlan } from "./closed-symbol-terminal-fixture.ts";
import { syntheticSqlRoot, syntheticSqlRuntime } from "./sqlite-inventory-fixture.ts";
import { setSyntheticManifestPath } from "./closed-symbol-terminal-closure-synthetic-core.ts";
import { captureClosedSymbolJournalBytes } from "../../src/closed-symbol-terminal-closure-journal.ts";
import type { CapturedClosureJournal } from "../../src/closed-symbol-terminal-closure-journal.ts";

async function descriptor(path: string, text: string): Promise<{ path: string; bytes: number; sha256: string }> {
  await writeFile(path, text, { flag: "wx", mode: 0o600 }); return { path, bytes: Buffer.byteLength(text), sha256: sha256Text(text) };
}
async function identity(path: string): Promise<Record<string, string>> {
  const value = await lstat(path, { bigint: true });
  return { device: String(value.dev), inode: String(value.ino), size: String(value.size), mtimeNs: String(value.mtimeNs), ctimeNs: String(value.ctimeNs), birthtimeNs: String(value.birthtimeNs), mode: String(value.mode), uid: String(value.uid), gid: String(value.gid), links: String(value.nlink) };
}
export async function closureFixture(databaseBytes = 0, manifestParentAlias = false): Promise<{
  input: { journal: Awaited<ReturnType<typeof loadOperation>>; journalBytes: CapturedClosureJournal; events: PhaseEvent[]; envelope: ReturnType<typeof parseClosedSymbolTerminalEnvelope>; fingerprint: Record<string, unknown>; runtime: Awaited<ReturnType<typeof syntheticSqlRuntime>> };
  directory: string;
}> {
  const root = syntheticSqlRoot(); assert.match(root, /easyeda-test-control-/u);
  const scratch = await mkdtemp(join(root, "closure-shapes-"));
  const manifestDirectory = join(scratch, "manifest-parent"); await mkdir(manifestDirectory, { mode: 0o700 });
  let manifestPath = join(manifestDirectory, "manifest.json");
  if (manifestParentAlias) { const alias = join(scratch, "manifest-alias"); await symlink(manifestDirectory, alias); manifestPath = join(alias, "manifest.json"); }
  const manifest = await descriptor(manifestPath, "{\"syntheticOnly\":true}\n"); setSyntheticManifestPath(manifest.path);
  const fingerprint = { syntheticOnly: true, reviewedCompatibilityManifest: manifest };
  const plan = { ...terminalPlan(join(scratch, "never-opened-source.eprj2")), expectedFingerprintSha256: sha256Json(fingerprint) };
  const journal = await createClosedSymbolJournal(newOperationId(), plan);
  const directory = operationPath(journal.operationId).slice(0, -5);
  await mkdir(directory, { mode: 0o700 });
  const checkpointDirectory = join(root, "checkpoints"); await mkdir(checkpointDirectory, { recursive: true, mode: 0o700 });
  const pairs: { copy: { artifact: string; bytes: number; sha256: string; artifactIdentity: Record<string, string>; receiptSha256: string };
    checkpoint: { schema: string; source: string; checkpoint: string; checkpointSha256: string; receiptPath: string; checkpointIdentity: Record<string, string>; receiptSha256: string };
    copyArtifact: { path: string; bytes: number; sha256: string } }[] = [];
  for (const ordinal of [0, 1, 2]) {
    const copyArtifact = await descriptor(join(directory, `closed-copy-${randomUUID()}.eprj2`), databaseBytes > 0 ? "x".repeat(databaseBytes) : `synthetic-not-sql:${String(ordinal)}`);
    const artifactIdentity = await identity(copyArtifact.path);
    const body = { artifact: copyArtifact.path, bytes: copyArtifact.bytes, sha256: copyArtifact.sha256, artifactIdentity };
    const copy = { ...body, receiptSha256: sha256Json(body) };
    const checkpointDescriptor = await descriptor(join(checkpointDirectory, `${randomUUID()}.eprj2`), `synthetic-checkpoint:${String(ordinal)}`);
    const info = await lstat(checkpointDescriptor.path, { bigint: true });
    const checkpointBody = { schema: "easyeda-pro-control.checkpoint.v2", source: plan.projectPath, checkpoint: checkpointDescriptor.path,
      checkpointSha256: checkpointDescriptor.sha256, receiptPath: `${checkpointDescriptor.path}.json`,
      checkpointIdentity: { dev: String(info.dev), ino: String(info.ino), birthtimeNs: String(info.birthtimeNs), ctimeNs: String(info.ctimeNs) } };
    const checkpoint = { ...checkpointBody, receiptSha256: sha256Json(checkpointBody) };
    await descriptor(checkpoint.receiptPath, `${JSON.stringify(checkpoint, null, 2)}\n`);
    pairs.push({ copy, checkpoint, copyArtifact });
  }
  const events: PhaseEvent[] = [];
  while (journal.sequence < 44) {
    const next = terminalPhaseInput(journal);
    let ordinal = 2;
    if (next.step.startsWith("baseline-")) { ordinal = 0; } else if (next.step.startsWith("edit-")) { ordinal = 1; }
    const pair = pairs[ordinal]; assert.ok(pair !== undefined);
    const input = next.step.endsWith("-copy") ? { ...next, data: next.kind === "intent" ? { checkpoint: pair.checkpoint } : { copyReceipt: pair.copy } } : next;
    // Deliberately shaped data, not issued stage/SQL evidence. This avoids 44
    // Production journal replays for every byte-hashing adversarial case.
    const event: PhaseEvent = { profile: "easyeda-pro-control.project-symbol-closed-session-event.v1", operationId: journal.operationId,
      closedPlanSha256: journal.closedPlanSha256, markerSha256: journal.markerSha256, sequence: journal.sequence + 1,
      step: next.step, kind: next.kind, generationOrdinal: ordinal, generation: next.generation,
      previousArtifactSha256: journal.artifacts.at(-1)?.sha256 ?? null, requestSha256: next.requestSha256, dataSha256: sha256Json(input.data),
      data: { syntheticOnly: true } };
    // The fixed synthetic source object is serialized and checked as unknown
    // Data by the actual closure derivation; no runtime brand is constructed.
    Object.defineProperty(event, "data", { value: structuredClone(input.data), enumerable: true });
    const artifact = await descriptor(join(directory, `${String(event.sequence).padStart(2, "0")}-${next.step}-${next.kind}.json`), `${JSON.stringify(event)}\n`);
    events.push(event); journal.artifacts.push(artifact); journal.sequence += 1;
  }
  journal.state = "closed-session-evidence-recorded"; journal.mutationMayHaveOccurred = true; await updateOperation(journal);
  const stored = await loadOperation(journal.operationId);
  // Storage reseals the same mutable journal object; the returned data is checked.
  assert.equal(stored["journalSha256"], journal["journalSha256"]);
  const initial = envelopeForJournal(journal);
  const evidence = { ...initial.body.evidence };
  for (const key of ["fingerprint", "baselineWindow", "editWindow", "verificationWindow", "witnessQualification", "witnessRaw", "writeRaw", "savedReadRaw"] as const) {
    if (key === "witnessRaw" || key === "writeRaw") {
      const selected = journal.artifacts[key === "witnessRaw" ? 19 : 21]; assert.ok(selected !== undefined); evidence[key] = selected;
    } else { evidence[key] = await descriptor(evidence[key].path, `${JSON.stringify(key === "fingerprint" ? fingerprint : { syntheticOnly: key })}\n`); }
  }
  const generations = initial.body.generations.map((entry, ordinal) => {
    const pair = pairs[ordinal]; assert.ok(pair !== undefined);
    return { ...entry, checkpointReceiptSha256: sha256Json(pair.checkpoint), copyReceiptSha256: sha256Json(pair.copy), copyArtifact: pair.copyArtifact };
  });
  const body = { ...initial.body, evidence, generations };
  const envelope = parseClosedSymbolTerminalEnvelope({ profile: initial.profile, body, bodySha256: sha256Json(body) });
  const terminalArtifact = await writePhaseArtifact(journal.operationId, 45, "closed-symbol-terminal", envelope);
  await updateOperation({ ...journal, state: TERMINAL_STATE, updatedAt: body.recordedAt, nextSafeAction: TERMINAL_NEXT_ACTION, terminalArtifact });
  const loadedJournal = await loadOperation(journal.operationId);
  const journalBytes = await captureClosedSymbolJournalBytes(loadedJournal);
  return { input: { journal: loadedJournal, journalBytes, events, envelope, fingerprint, runtime: await syntheticSqlRuntime() }, directory };
}
