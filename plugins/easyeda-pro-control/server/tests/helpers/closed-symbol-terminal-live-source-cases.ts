import assert from "node:assert/strict";
import fsPromises from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { isRecord } from "../../src/core.ts";
import { fixture } from "./closed-symbol-coordinator-fixture.ts";
import { ClosedSymbolTerminalStage, inspectClosedSymbolTerminal } from "../../src/closed-symbol-terminal.ts";

void test("terminal publication followed by source drift records history but grants no live completion", async (context) => {
  const f = await fixture(context), full = await f.stage.recordFullEvidence(f.plan);
  const stage = new ClosedSymbolTerminalStage(f.engine, f.machine); const rename = fsPromises.rename;
  let changed = false;
  const publication = context.mock.method(fsPromises, "rename", async (...args: Parameters<typeof rename>): ReturnType<typeof rename> => {
    let terminal = false;
    if (basename(String(args[1])) === `${full.operationId}.json`) {
      const value: unknown = JSON.parse(await fsPromises.readFile(args[0], "utf8"));
      terminal = isRecord(value) && value["state"] === "closed-session-completed";
    }
    await rename(...args);
    if (!changed && terminal) {
      changed = true; const database = new DatabaseSync(f.source);
      try { database.prepare("UPDATE projects SET name=?").run("Synthetic independent late change"); }
      finally { database.close(); }
    }
  }); syncBuiltinESMExports();
  const before = [...f.events];
  try { await assert.rejects(stage.complete(full), /current source\/checkpoint|source changed|identity|receipt/iu); }
  finally { publication.mock.restore(); syncBuiltinESMExports(); }
  assert.equal(changed, true); assert.ok(stage.originalArtifact(full.operationId) !== undefined);
  await assert.rejects(stage.complete(full), /cannot repeat/u);
  const historical = await inspectClosedSymbolTerminal(full.operationId, f.machine);
  assert.equal(historical.historicalCompletionRecorded, true); assert.equal(historical.liveOriginalCompletionProved, false);
  assert.equal(historical.currentSourceChecked, false); assert.equal(historical.currentOwnershipChecked, false);
  assert.deepEqual(f.events, before);
});
