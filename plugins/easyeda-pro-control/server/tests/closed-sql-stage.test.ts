import assert from "node:assert/strict";
import { after, test } from "node:test";
import fsPromises from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";
import { appendClosedSymbolEvent, loadClosedSymbolJournal } from "../src/closed-symbol-journal.ts";
import { canonicalJson } from "../src/core.ts";
import { EasyedaControlEngine } from "../src/engine.ts";
import { INPUT } from "./helpers/windows-closed-session-fixture.ts";



import { installSyntheticNativeProfile } from "./helpers/install-synthetic-native-profile.ts";
// oxlint-disable-next-line node/no-top-level-await -- Install the exact worker-local prerequisite before loading consumers.
const profile = await installSyntheticNativeProfile();
after(() => { profile.unregister(); });
// oxlint-disable-next-line node/no-top-level-await -- Load original issuers only after the worker-local synthetic profile hook.
const { ClosedSymbolSqlComparisonStage, assertOriginalClosedSymbolComparison } = await import("../src/closed-symbol-sql-comparison.ts");
// oxlint-disable-next-line node/no-top-level-await -- Load original issuers only after the worker-local synthetic profile hook.
const { reopenForSqlComparison, sqlStageFixture } = await import("./helpers/closed-symbol-sql-fixture.ts");

void test("actual original write, normal close, issued copy and full SQL compare then reopened exact SQL", async (context) => {
  const f = await sqlStageFixture(context);
  const before = canonicalJson(f.journal);
  await assert.rejects(f.sql.compareEdit({ ...f.compareInput, preparation: structuredClone(f.preparation) }), /not original/u);
  await assert.rejects(f.sql.compareEdit({ ...f.compareInput, originalWriteResult: structuredClone(f.originalWriteResult) }), /original successful stage/u);
  const restarted = new ClosedSymbolSqlComparisonStage(f.engine, f.sqlRuntime);
  await assert.rejects(restarted.compareEdit(f.compareInput), /original successful preparation/u);
  assert.equal(canonicalJson(f.journal), before);
  const reopened = await reopenForSqlComparison(f);
  assert.equal(reopened.originalEditComparison.comparison["exactLogicalSqlEffect"], true);
  assert.strictEqual(assertOriginalClosedSymbolComparison(reopened.originalEditComparison, f.engine, f.journal.operationId, "edit-sql-compare"), reopened.originalEditComparison);
  const result = await f.sql.compareVerification(reopened.input);
  assert.strictEqual(f.sql.originalComparison(f.journal.operationId, "verify-sql-compare"), result);
  assert.equal(result.executionAuthorized, false); assert.equal(result.completionProved, false);
  assert.strictEqual(assertOriginalClosedSymbolComparison(result, f.engine, f.journal.operationId, "verify-sql-compare"), result);
  assert.throws(() => assertOriginalClosedSymbolComparison(structuredClone(result), f.engine, f.journal.operationId, "verify-sql-compare"), /original successful comparison/u);
  assert.throws(() => assertOriginalClosedSymbolComparison(result, f.engine, f.journal.operationId, "edit-sql-compare"), /original successful comparison/u);
  const otherEngine = new EasyedaControlEngine(f.engine.upstream);
  assert.throws(() => assertOriginalClosedSymbolComparison(result, otherEngine, f.journal.operationId, "verify-sql-compare"), /original successful comparison/u);
  await otherEngine.controlFingerprintPromise;
  const loaded = await loadClosedSymbolJournal(f.journal.operationId);
  assert.equal(loaded.events.at(-1)?.step, "verify-sql-compare"); assert.equal(loaded.events.at(-1)?.kind, "result");
  assert.equal(loaded.journal.saved, false); assert.equal(f.writeState.calls, 1);
});

for (const change of ["copy", "inventory", "proof", "caller-journal", "scope", "aux-bytes", "phase"] as const) {
  void test(`edit SQL stage refuses ${change} without publishing a result or repeating the writer`, async (context) => {
    const f = await sqlStageFixture(context), input = { ...f.compareInput };
    if (change === "copy") { input.copy = structuredClone(input.copy); }
    if (change === "inventory") { input.inventory = structuredClone(input.inventory); }
    if (change === "proof") { input.proof = structuredClone(input.proof); }
    if (change === "caller-journal") { input.journal = { ...input.journal, saved: true }; }
    if (change === "scope") { f.state.scope = true; }
    if (change === "aux-bytes") { await fsPromises.writeFile(f.witness.clockArtifact.path, "{}", { mode: 0o600 }); }
    if (change === "phase") {
      await appendClosedSymbolEvent(f.journal, { step: "edit-sql-compare", kind: "intent", generation: f.witness.generation,
        requestSha256: "0".repeat(64), data: { syntheticConcurrent: true } });
    }
    await assert.rejects(f.sql.compareEdit(input));
    assert.equal(f.sql.originalComparison(f.journal.operationId, "edit-sql-compare"), undefined);
    assert.equal(f.writeState.calls, 1);
    const loaded = await loadClosedSymbolJournal(f.journal.operationId);
    assert.ok(!loaded.events.some((event) => event.step === "edit-sql-compare" && event.kind === "result"));
    await assert.rejects(f.sql.compareEdit(f.compareInput), /already consumed/u);
  });
}

for (const failure of ["result-artifact", "journal-before", "journal-after", "owner-after-result", "copy-after-result"] as const) {
  void test(`settled SQL ${failure} failure retains original comparison but cannot authorize verification`, async (context) => {
    const f = await sqlStageFixture(context), operationId = f.journal.operationId;
    const link = fsPromises.link, open = fsPromises.open, rename = fsPromises.rename; let resultAttempted = false;
    context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>): Promise<void> => {
      const selected = basename(String(args[1])) === "28-edit-sql-compare-result.json";
      if (selected) { resultAttempted = true; if (failure === "result-artifact") { throw new Error("synthetic result artifact refusal"); } }
      await link(...args);
      if (selected && failure === "owner-after-result") { f.state.scope = true; }
    });
    context.mock.method(fsPromises, "rename", async (...args: Parameters<typeof rename>): Promise<void> => {
      const selected = resultAttempted && basename(String(args[1])) === `${operationId}.json`;
      if (selected && failure === "journal-before") { throw new Error("synthetic journal prepublication refusal"); }
      await rename(...args);
      if (selected && failure === "journal-after") { throw new Error("synthetic journal acknowledgement lost"); }
    });
    context.mock.method(fsPromises, "open", (...args: Parameters<typeof open>): ReturnType<typeof open> => {
      if (resultAttempted && failure === "copy-after-result" && basename(String(args[0])) === basename(f.edited.copy.artifact)) {
        return Promise.reject(new Error("synthetic final copy unavailable"));
      }
      return open(...args);
    }); syncBuiltinESMExports();
    await assert.rejects(f.sql.compareEdit(f.compareInput));
    const original = f.sql.originalComparison(operationId, "edit-sql-compare");
    assert.ok(original !== undefined); assert.equal(original.comparison["exactLogicalSqlEffect"], true);
    assert.throws(() => assertOriginalClosedSymbolComparison(original, f.engine, operationId, "edit-sql-compare"), /original successful comparison/u);
    await assert.rejects(f.sql.compareVerification({ ...f.compareInput, originalEditComparison: original }), /original successful edit comparison/u);
    assert.equal(f.writeState.calls, 1);
    context.mock.restoreAll(); syncBuiltinESMExports();
  });
}

for (const drift of ["capture", "capture-release"] as const) {
  void test(`SQL final journal read rejects a changed ${drift} lifecycle epoch`, async (context) => {
    const f = await sqlStageFixture(context), operationId = f.journal.operationId;
    const link = fsPromises.link, open = fsPromises.open;
    let armed = false, changed = false, published = false;
    context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>): Promise<void> => {
      await link(...args); if (basename(String(args[1])) === "28-edit-sql-compare-result.json") { published = true; }
    });
    context.mock.method(fsPromises, "open", async (...args: Parameters<typeof open>): ReturnType<typeof open> => {
      const handle = await open(...args);
      if (published && basename(String(args[0])) === basename(f.witness.clockArtifact.path)) { armed = true; }
      if (armed && !changed && basename(String(args[0])) === `${operationId}.json`) {
        changed = true;
        if (drift === "capture") { await f.owner.supervisor.capture({ ...INPUT, bindingSha256: "8".repeat(64), challengeAttempt: 3 }); }
        else {
          const capture = f.admission.originalCapture(operationId, "edit-admission"); assert.ok(capture !== undefined);
          await f.owner.supervisor.releaseCapture(capture.executionAuthority);
        }
      }
      return handle;
    }); syncBuiltinESMExports();
    try {
      let failure: unknown;
      try { await f.sql.compareEdit(f.compareInput); } catch (error) { failure = error; }
      assert.equal(changed, true, "The synthetic late lifecycle mutation must execute.");
      assert.ok(failure instanceof Error, "A changed final lifecycle epoch must refuse.");
      const retained = f.sql.originalComparison(operationId, "edit-sql-compare"); assert.ok(retained !== undefined);
      assert.throws(() => assertOriginalClosedSymbolComparison(retained, f.engine, operationId, "edit-sql-compare"), /original successful comparison/u);
      assert.equal(f.writeState.calls, 1);
    } finally { context.mock.restoreAll(); syncBuiltinESMExports(); }
  });
}
