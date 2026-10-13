import assert from "node:assert/strict";
import { after, test } from "node:test";
import fsPromises from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";
import { canonicalJson, sha256Json } from "../src/core.ts";
import { loadClosedSymbolJournal } from "../src/closed-symbol-journal.ts";
import { syntheticSqlRuntime } from "./helpers/sqlite-inventory-fixture.ts";



import { installSyntheticNativeProfile } from "./helpers/install-synthetic-native-profile.ts";
// oxlint-disable-next-line node/no-top-level-await -- Install the exact worker-local prerequisite before loading consumers.
const profile = await installSyntheticNativeProfile();
after(() => { profile.unregister(); });
// oxlint-disable-next-line node/no-top-level-await -- Load original issuers only after the worker-local synthetic profile hook.
const { witnessFixture } = await import("./helpers/closed-symbol-witness-fixture.ts");
// oxlint-disable-next-line node/no-top-level-await -- Load original issuers only after the worker-local synthetic profile hook.
const { ClosedSymbolSqlComparisonStage, assertOriginalClosedSymbolPreparation } = await import("../src/closed-symbol-sql-comparison.ts");

void test("actual issued witness/copy/reader prepares the exact retained metadata without a new phase", async (context) => {
  const f = await witnessFixture(context), witnessResult = await f.stage.collect(f.input);
  const stage = new ClosedSymbolSqlComparisonStage(f.engine, await syntheticSqlRuntime());
  const journalBefore = canonicalJson(f.journal);
  const input = { journal: f.journal, generation: witnessResult.generation, witnessResult, baselineCopy: f.copied.copy, baselineInventory: f.copied.inventory };
  const prepared = await stage.prepareForWrite(input);
  assert.strictEqual(stage.originalPreparation(f.journal.operationId), prepared);
  assert.strictEqual(stage.assertOriginalPreparation(prepared, f.journal.operationId), prepared);
  assert.strictEqual(assertOriginalClosedSymbolPreparation(prepared, f.engine, f.journal.operationId), prepared);
  assert.equal(prepared.metadataPlan.desiredTitle, f.journal.plan.operation.patch.name);
  assert.equal(prepared.metadataPlan.targetUuid, f.journal.plan.targetUuid);
  assert.equal(prepared.metadataPlanSha256, sha256Json(prepared.metadataPlan));
  assert.strictEqual(prepared.witnessClockArtifact, witnessResult.clockArtifact);
  assert.equal(prepared.witnessClockArtifactSha256, witnessResult.clockArtifactSha256);
  assert.equal(prepared.executionAuthorized, false); assert.equal(prepared.completionProved, false);
  assert.equal(canonicalJson(f.journal), journalBefore);
  const loaded = await loadClosedSymbolJournal(f.journal.operationId);
  assert.equal(canonicalJson(loaded.journal), journalBefore); assert.equal(loaded.events.at(-1)?.step, "edit-witness");
  for (const replacement of [structuredClone(prepared), { ...prepared, metadataPlanSha256: "0".repeat(64) }, undefined, null]) {
    assert.throws(() => stage.assertOriginalPreparation(replacement, f.journal.operationId), /original successful preparation|preparation missing/u);
    assert.throws(() => assertOriginalClosedSymbolPreparation(replacement, f.engine, f.journal.operationId), /original successful preparation|preparation missing/u);
  }
  const restarted = new ClosedSymbolSqlComparisonStage(f.engine, await syntheticSqlRuntime());
  assert.throws(() => restarted.assertOriginalPreparation(prepared, f.journal.operationId), /original successful preparation/u);
  const forged = { ...prepared, metadataPlan: { ...prepared.metadataPlan, desiredTitle: "not the requested title" } };
  const standIn = { assertOriginalPreparation: (): typeof forged => forged };
  assert.strictEqual(standIn.assertOriginalPreparation(), forged);
  assert.throws(() => assertOriginalClosedSymbolPreparation(forged, f.engine, f.journal.operationId), /original successful preparation/u);
  await assert.rejects(stage.prepareForWrite(input), /already consumed/u);
});

for (const change of ["witness-clone", "copy-clone", "inventory-clone", "generation", "scope", "journal", "aux-bytes"] as const) {
  void test(`actual SQL preparation refuses ${change} without a usable descriptor`, async (context) => {
    const f = await witnessFixture(context), witness = await f.stage.collect(f.input);
    const stage = new ClosedSymbolSqlComparisonStage(f.engine, await syntheticSqlRuntime());
    const input = { journal: f.journal, generation: witness.generation, witnessResult: witness, baselineCopy: f.copied.copy, baselineInventory: f.copied.inventory };
    if (change === "witness-clone") { input.witnessResult = structuredClone(witness); }
    if (change === "copy-clone") { input.baselineCopy = structuredClone(input.baselineCopy); }
    if (change === "inventory-clone") { input.baselineInventory = structuredClone(input.baselineInventory); }
    if (change === "generation") { input.generation = { ...input.generation, rootPid: input.generation.rootPid + 1 }; }
    if (change === "scope") { f.state.scope = false; }
    if (change === "journal") { input.journal = { ...input.journal, saved: true }; }
    if (change === "aux-bytes") { await fsPromises.writeFile(witness.clockArtifact.path, "{}", { mode: 0o600 }); }
    await assert.rejects(stage.prepareForWrite(input));
    assert.throws(() => stage.assertOriginalPreparation(stage.originalPreparation(f.journal.operationId), f.journal.operationId), /original successful preparation|preparation missing/u);
    assert.equal(f.state.witnessCalls, 1);
  });
}

void test("failure after pure preparation retains inspection but cannot expose ready writer data", async (context) => {
  const f = await witnessFixture(context), witness = await f.stage.collect(f.input);
  const stage = new ClosedSymbolSqlComparisonStage(f.engine, await syntheticSqlRuntime());
  const input = { journal: f.journal, generation: witness.generation, witnessResult: witness, baselineCopy: f.copied.copy, baselineInventory: f.copied.inventory };
  const open = fsPromises.open; let seen = 0;
  context.mock.method(fsPromises, "open", (...args: Parameters<typeof open>): ReturnType<typeof open> => {
    if (basename(String(args[0])) === basename(witness.clockArtifact.path)) { seen += 1; if (seen === 2) { return Promise.reject(new Error("synthetic final auxiliary read failure")); } }
    return open(...args);
  }); syncBuiltinESMExports();
  await assert.rejects(stage.prepareForWrite(input), /synthetic final auxiliary read failure/u);
  const retained = stage.originalPreparation(f.journal.operationId); assert.ok(retained !== undefined);
  assert.throws(() => stage.assertOriginalPreparation(retained, f.journal.operationId), /original successful preparation/u);
  assert.throws(() => assertOriginalClosedSymbolPreparation(retained, f.engine, f.journal.operationId), /original successful preparation/u);
  await assert.rejects(stage.prepareForWrite(input), /already consumed/u);
  context.mock.restoreAll(); syncBuiltinESMExports();
});
