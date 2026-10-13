import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { fixture } from "./closed-symbol-coordinator-fixture.ts";
import { loadClosedSymbolJournal } from "../../src/closed-symbol-journal.ts";
import { operationPath } from "../../src/artifacts.ts";

void test("full concrete coordinator reaches all44 events with actual original stage issuers", async (context) => {
  const f = await fixture(context);
  const result = await f.stage.recordFullEvidence(f.plan);
  assert.equal(result.sequence, 44); assert.equal(result.completionProved, false);
  assert.equal(result.saved, false); assert.equal(result.reopened, false);
  const loaded = await loadClosedSymbolJournal(result.operationId);
  assert.equal(loaded.events.length, 44); assert.equal(loaded.journal.state, "closed-session-evidence-recorded");
  assert.equal(f.events.filter((event) => event === "launch").length, 3);
  assert.equal(f.events.filter((event) => event === "normal-close").length, 3);
  assert.equal(f.events.filter((event) => event === "scope-enter").length, 3);
  assert.equal(f.events.filter((event) => event === "scope-exit").length, 3);
  assert.equal(f.state.writes, 1); assert.equal(f.state.opens, 2); assert.equal(f.state.reads, 1);
  assert.equal(f.events.includes("save"), false);
  // Inspect before the fixture's explicitly test-only retirement hook changes
  // State. The actual 44-event bytes remain evidence-only and unchanged here.
  const before = await readFile(operationPath(result.operationId));
  const restart = await f.stage.inspectRestart();
  assert.equal(restart["classification"], "all-evidence-recorded");
  assert.equal(restart["completionProved"], false); assert.equal(restart["authorityRestored"], false);
  assert.deepEqual(await readFile(operationPath(result.operationId)), before);
  await assert.rejects(f.stage.recordFullEvidence(f.plan), /consumed/u);
});
