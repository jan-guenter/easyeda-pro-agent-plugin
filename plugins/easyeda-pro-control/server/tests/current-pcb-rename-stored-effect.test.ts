/** Synthetic SQLite only; no native dispatch, closure or saved-reopen claim. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { bindCurrentPcbRenameTimes, prepareCurrentPcbRename } from "../src/current-pcb-rename-preparation.ts";
import { completedCurrentPcbRenameStoredSource, verifyCurrentPcbRenameStoredEffect } from "../src/current-pcb-rename-stored-effect.ts";
import { PCB_PROGRAM_TARGET, pcbProgramBaseline } from "./helpers/current-pcb-rename-program-fixture.ts";
import { IDS, TIMES, WITNESS, applyEffect, encrypted, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

function literal(value: string): string { return `'${value.replaceAll("'", "''")}'`; }
async function fixture(): Promise<Readonly<{ path: string; preparation: Awaited<ReturnType<typeof prepareCurrentPcbRename>>; raw: string }>> {
  const baseline = await pcbProgramBaseline();
  const preparation = await prepareCurrentPcbRename({ before: baseline.before, target: PCB_PROGRAM_TARGET, desiredTitle: "Renamed PCB",
    witness: { projectUuid: PCB_PROGRAM_TARGET.projectUuid, branchUuid: IDS.branch, backendActorUuid: IDS.actor, client: WITNESS.client,
      documentClockMinMs: TIMES.document - 500, documentClockMaxMs: TIMES.document + 500,
      backendClockMinMs: WITNESS.serverClockMinMs, backendClockMaxMs: WITNESS.serverClockMaxMs, backendLocalOffsetMinutes: 120 } });
  const bound = await bindCurrentPcbRenameTimes(preparation, { documentTime: TIMES.document, backendTime: TIMES.edit });
  applyEffect(baseline.path, bound.history.chunkText);
  mutate(baseline.path, `UPDATE project_structures SET structure=${literal(bound.structure.afterStructureText)} WHERE branch_uuid='${IDS.branch}'`);
  return { path: baseline.path, preparation, raw: bound.history.chunkText };
}
function newChunk(path: string, raw: string): void {
  mutate(path, `UPDATE history_data SET dataStr=${literal(encrypted(raw, IDS.newHead, IDS.newKey))} WHERE id=12`);
}

void test("stored PCB effect derives only actual timestamps and proves every SQL row against the frozen intent", async () => {
  const f = await fixture(); const after = await inventory(f.path), proof = await verifyCurrentPcbRenameStoredEffect(f.preparation, after, TIMES.document);
  assert.equal(proof.documentTime, TIMES.document); assert.equal(proof.backendTime, TIMES.edit);
  assert.equal(proof.wholeRenameSqlEffectVerified, true); assert.equal(proof.comparison["exactLogicalSqlEffect"], true);
  assert.equal(proof.executionAuthorized, false); assert.equal(proof.generationClosureVerified, false); assert.equal(proof.reopened, false);
  const source = completedCurrentPcbRenameStoredSource(proof, f.preparation, after);
  assert.equal(source.maximumTicket, 101); assert.equal(source.history.documents.length, 2); assert.equal(source.comparison, proof);
  assert.ok(Object.isFrozen(proof)); assert.ok(Object.isFrozen(source));
  assert.throws(() => completedCurrentPcbRenameStoredSource(structuredClone(proof), f.preparation, after), /original successful/u);
  assert.throws(() => completedCurrentPcbRenameStoredSource(proof, structuredClone(f.preparation), after), /original successful/u);
  const reread = await inventory(f.path);
  assert.throws(() => completedCurrentPcbRenameStoredSource(proof, f.preparation, reread), /original successful/u);
  await assert.rejects(verifyCurrentPcbRenameStoredEffect(f.preparation, structuredClone(after), TIMES.document), /original inventory/u);
});

void test("stored PCB effect rejects reply mismatch, off-window backend time and unintended appended data", async () => {
  const f = await fixture(); const after = await inventory(f.path);
  await assert.rejects(verifyCurrentPcbRenameStoredEffect(f.preparation, after, TIMES.document + 1), /retained native reply/u);
  for (const raw of [f.raw.replace(String(TIMES.edit), String(TIMES.edit + 60_000)), f.raw.replace("Renamed PCB", "Changed PCB"),
    `${f.raw}|\n{"type":"LINE","ticket":101,"id":"extra"}||{}`]) {
    newChunk(f.path, raw);
    await assert.rejects(verifyCurrentPcbRenameStoredEffect(f.preparation, await inventory(f.path), TIMES.document), /clock|chunk|capacity|three records/u);
  }
});

void test("stored PCB effect rejects unrelated persisted changes even when the rename history is correct", async () => {
  const f = await fixture(); mutate(f.path, "UPDATE users SET nickname='Changed peer'");
  await assert.rejects(verifyCurrentPcbRenameStoredEffect(f.preparation, await inventory(f.path), TIMES.document), /full SQL delta/u);
});
