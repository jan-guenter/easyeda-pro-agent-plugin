import assert from "node:assert/strict";
import { test } from "node:test";
import { fixture } from "./closed-symbol-coordinator-fixture.ts";
import { assertOriginalClosedSymbolFullEvidence } from "../../src/closed-symbol-coordinator.ts";
import { artifactJson, replayRecordedLifecycle } from "../../src/closed-symbol-terminal-lifecycle.ts";
import { loadClosedSymbolJournal } from "../../src/closed-symbol-journal.ts";
import { isRecord } from "../../src/core.ts";

void test("historical lifecycle reconstructs actual three-generation records using retained artifacts only", async (context) => {
  const f = await fixture(context);
  // The native process reports the small tooltip as MainWindowHandle. Both
  // Producer and historical replay must retain/select the actual application.
  f.state.windows = [
    { handle: "12345", pid: 100, owner: "0", className: "Chrome_WidgetWin_1", minimized: false, title: "", bounds: [20, 20, 71, 32] },
    { handle: "54321", pid: 100, owner: "0", className: "Chrome_WidgetWin_1", minimized: false, title: "Synthetic", bounds: [0, 0, 1384, 736] },
  ];
  const result = await f.stage.recordFullEvidence(f.plan);
  const original = assertOriginalClosedSymbolFullEvidence(result, f.engine, result.operationId);
  const { journal, events } = await loadClosedSymbolJournal(result.operationId);
  const qualification = await artifactJson(original.edit.witness.clockArtifact); assert.ok(isRecord(qualification));
  const nativeClockSource = qualification["launchClock"]; assert.ok(isRecord(nativeClockSource));
  const input = { journal, events, inventories: [original.baseline.copy.inventory, original.edit.copy.inventory, original.verification.copy.inventory] as const,
    fingerprint: original.fingerprintArtifact, windows: original.windowArtifacts, runtime: f.machine, nativeClockSource };
  const before = [...f.events];
  const replay = await replayRecordedLifecycle(input);
  assert.equal(replay.length, 3); assert.deepEqual(replay.map((row) => row.generation.ordinal), [0, 1, 2]);
  assert.deepEqual(f.events, before);
  assert.equal(replay[2].terminal.copyReceiptSha256.length, 64);
  assert.deepEqual(replay.map((row) => row.closeIntent["windowHandle"]), ["54321", "54321", "54321"]);
  for (const field of ["jobEmpty", "saveOrDiscardSelected", "queuedWritesPersisted"] as const) {
    const changed = structuredClone(events), event = changed[8];
    assert.ok(isRecord(event?.data)); assert.ok(isRecord(event.data["proof"]));
    event.data["proof"][field] = field === "queuedWritesPersisted" ? "proved" : field === "saveOrDiscardSelected";
    await assert.rejects(replayRecordedLifecycle({ ...input, events: changed }), /termination receipt/u);
  }
  const wrongInventory = [structuredClone(original.baseline.copy.inventory), original.edit.copy.inventory, original.verification.copy.inventory] as const;
  await assert.rejects(replayRecordedLifecycle({ ...input, inventories: wrongInventory }), /original inventory/u);
});
