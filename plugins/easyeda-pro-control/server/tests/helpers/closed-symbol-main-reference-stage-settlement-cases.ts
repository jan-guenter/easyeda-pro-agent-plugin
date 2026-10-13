/** Actual maintained stages and managed SQLite; fixed synthetic command child only. */
/* oxlint-disable import/max-dependencies -- Join actual managed baseline/issuer/artifacts to the fixed mocked child boundary without an authority callback. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { operationPath } from "../../src/artifacts.ts";
import { loadClosedSymbolJournal } from "../../src/closed-symbol-journal.ts";
import { ClosedSymbolMainReferenceStage, assertOriginalMainReference } from "../../src/closed-symbol-main-reference.ts";
import { canonicalJson, isRecord, sha256Json, sha256Text } from "../../src/core.ts";
import { mainReferenceFixture } from "./closed-symbol-main-reference-fixture.ts";
import { syntheticSqlRoot } from "./sqlite-inventory-fixture.ts";
import { stageSettlementFixture } from "./main-reference-stage-settlement-fixture.ts";

for (const mode of ["drained-unclosed", "guard-incomplete"] as const) {
  void test(`actual main-reference stage preserves ${mode} uncertainty and consumed attempt`, { timeout: 120_000 }, async context => {
    const f = await mainReferenceFixture(context);
    const sqlPrefix = join(syntheticSqlRoot(), "synthetic-symbol-sql-");
    assert.ok(f.source.path.startsWith(sqlPrefix));
    const before = canonicalJson(await loadClosedSymbolJournal(f.journal.operationId));
    const journalBytes = await readFile(operationPath(f.journal.operationId)), sourceBytes = await readFile(f.source.path);
    const seam = stageSettlementFixture(context, mode);
    let settled = false;
    // oxlint-disable-next-line promise/prefer-await-to-then, promise/prefer-await-to-callbacks -- Observe both fulfillment and rejection without swallowing the assertion on the original stage promise.
    const observation = f.stage.runOnce(f.input).then(result => { settled = true; return result; }, (error: unknown): never => { settled = true; throw error; });
    const refused = assert.rejects(observation, /Main reference transport failed or is ambiguous; never retry it/u);
    // A pre-command failure must surface directly instead of waiting for an
    // Unreachable synthetic fault event until the outer test timeout.
    await Promise.race([seam.ready, observation]);
    assert.equal(seam.state.calls, 1); assert.equal(seam.state.kills, 1);
    assert.deepEqual(seam.state.guardAttempts, ["child-error", "child-close", "stdin-error", "stdout-error", "stderr-error"]);
    if (mode === "drained-unclosed") {
      assert.equal(settled, false); assert.equal(f.stage.originalReturn(f.journal.operationId), undefined);
      context.mock.timers.tick(4999); await Promise.resolve(); await Promise.resolve();
      assert.equal(settled, false); assert.equal(f.stage.originalReturn(f.journal.operationId), undefined);
      context.mock.timers.tick(1);
      // Restore real timers synchronously before the stage resumes artifact I/O
      // Or baseline-authority reproof after the transport promise resolves.
      seam.resetFakeTime();
    } else { assert.equal(seam.state.stdinBytes, 0); }
    await refused;

    const original: unknown = f.stage.originalReturn(f.journal.operationId); assert.ok(isRecord(original));
    assert.ok(Object.isFrozen(original));
    const expected = { exitCode: mode === "guard-incomplete" ? 197 : null, signal: null, timedOut: false,
      transportFailure: mode === "guard-incomplete" ? "start-failure" : "stdin-failure",
      rawStdoutBase64: mode === "drained-unclosed" ? Buffer.from("prefix").toString("base64") : "", rawStderrBase64: "",
      transportState: "unresolved", spawnReturnObserved: true, transportCloseObserved: mode === "guard-incomplete",
      observationGuardsComplete: mode === "drained-unclosed", containmentRequest: "accepted", windowsJobTerminationProved: false, executionAuthorized: false };
    assert.deepEqual(original, { stdout: "", stderr: "", ...expected });
    assert.throws(() => assertOriginalMainReference(original, f.engine, f.journal.operationId), /not issued/u);

    const directory = operationPath(f.journal.operationId).slice(0, -5);
    const intentPath = join(directory, "10-baseline-main-reference-intent.json"), resultPath = join(directory, "10-baseline-main-reference-result.json");
    const intentBytes = await readFile(intentPath), resultBytes = await readFile(resultPath);
    assert.ok(resultBytes.length <= 196_608);
    const intent: unknown = JSON.parse(intentBytes.toString("utf8"));
    const retained: unknown = JSON.parse(resultBytes.toString("utf8"));
    assert.ok(isRecord(intent) && isRecord(intent["request"]));
    assert.deepEqual(retained, { profile: "private.main-reference-retained-result.v2", requestSha256: sha256Json(intent["request"]),
      intentSha256: sha256Text(intentBytes.toString("utf8")), returnedEncoding: "base64-streams-v1", returned: expected });

    await assert.rejects(f.stage.runOnce(f.input), /already consumed/u);
    await assert.rejects(new ClosedSymbolMainReferenceStage(f.engine).runOnce(f.input), /already consumed/u);
    assert.equal(seam.state.calls, 1);
    const originalText = canonicalJson(original);
    assert.doesNotThrow(() => { seam.lateEvents(); }); await Promise.resolve(); await Promise.resolve();
    assert.strictEqual(f.stage.originalReturn(f.journal.operationId), original); assert.equal(canonicalJson(original), originalText);
    assert.throws(() => assertOriginalMainReference(original, f.engine, f.journal.operationId), /not issued/u);
    await assert.rejects(f.stage.runOnce(f.input), /already consumed/u);
    await assert.rejects(new ClosedSymbolMainReferenceStage(f.engine).runOnce(f.input), /already consumed/u);
    assert.equal(seam.state.calls, 1); assert.equal(seam.state.kills, 1);
    assert.equal(canonicalJson(await loadClosedSymbolJournal(f.journal.operationId)), before);
    assert.deepEqual(await readFile(operationPath(f.journal.operationId)), journalBytes);
    assert.deepEqual(await readFile(f.source.path), sourceBytes);
    assert.deepEqual(await readFile(intentPath), intentBytes); assert.deepEqual(await readFile(resultPath), resultBytes);
  });
}
