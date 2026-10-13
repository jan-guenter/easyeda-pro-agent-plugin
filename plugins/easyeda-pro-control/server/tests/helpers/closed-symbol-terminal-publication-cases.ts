import assert from "node:assert/strict";
import fsPromises from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";
import { test } from "node:test";
import { fixture } from "./closed-symbol-coordinator-fixture.ts";
import { ClosedSymbolTerminalStage, assertOriginalClosedSymbolCompletion, inspectClosedSymbolTerminal } from "../../src/closed-symbol-terminal.ts";
import { loadClosedSymbolHistoricalPhaseJournal } from "../../src/closed-symbol-journal.ts";
import { isRecord } from "../../src/core.ts";

for (const failure of ["before-journal-replacement", "after-journal-replacement"] as const) {
  void test(`terminal ${failure} retains45 and never issues completion or permits retry`, async (context) => {
    const f = await fixture(context), full = await f.stage.recordFullEvidence(f.plan);
    const stage = new ClosedSymbolTerminalStage(f.engine, f.machine);
    const rename = fsPromises.rename;
    let changed = false;
    const publication = context.mock.method(fsPromises, "rename", async (...args: Parameters<typeof rename>): ReturnType<typeof rename> => {
      if (!changed && basename(String(args[1])) === `${full.operationId}.json`) {
        const raw: unknown = JSON.parse(await fsPromises.readFile(args[0], "utf8"));
        if (isRecord(raw) && raw["state"] === "closed-session-completed") {
          changed = true;
          if (failure === "after-journal-replacement") { await rename(...args); }
          throw new Error(`Synthetic ${failure}`);
        }
      }
      await rename(...args);
    }); syncBuiltinESMExports();
    const before = [...f.events];
    try { await assert.rejects(stage.complete(full), /Synthetic/u); }
    finally { publication.mock.restore(); syncBuiltinESMExports(); }
    assert.equal(changed, true); assert.ok(stage.originalArtifact(full.operationId) !== undefined);
    assert.throws(() => { assertOriginalClosedSymbolCompletion(stage.originalArtifact(full.operationId), f.engine, full.operationId); }, /original/iu);
    await assert.rejects(stage.complete(full), /cannot repeat/u);
    const result = await inspectClosedSymbolTerminal(full.operationId, f.machine);
    assert.equal(result.classification, failure === "after-journal-replacement" ? "historical-completion-verified" : "terminal-publication-incomplete");
    assert.equal(result.liveOriginalCompletionProved, false); assert.equal(result.currentOwnershipChecked, false);
    const loaded = await loadClosedSymbolHistoricalPhaseJournal(full.operationId);
    assert.equal(loaded.journal.state, failure === "after-journal-replacement" ? "closed-session-completed" : "closed-session-evidence-recorded");
    assert.deepEqual(f.events, before);
  });
}
