import assert from "node:assert/strict";
import fsPromises from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";
import { test } from "node:test";
import { fixture } from "./closed-symbol-coordinator-fixture.ts";
import { ClosedSymbolTerminalStage, inspectClosedSymbolTerminal } from "../../src/closed-symbol-terminal.ts";
import { assertOriginalClosedSymbolFullEvidence } from "../../src/closed-symbol-coordinator.ts";

void test("historical semantic replay rechecks dependencies changed after their first reads", async (context) => {
  const f = await fixture(context), full = await f.stage.recordFullEvidence(f.plan);
  const original = assertOriginalClosedSymbolFullEvidence(full, f.engine, full.operationId);
  const stage = new ClosedSymbolTerminalStage(f.engine, f.machine);
  await stage.complete(full);
  const paths = [original.fingerprintArtifact.path, ...original.windowArtifacts.map((value) => value.path), original.edit.witness.clockArtifact.path];
  const before = [...f.events];
  for (const path of paths) {
    await context.test(`late ${basename(path)} mutation refuses`, async (subcontext) => {
      const bytes = await fsPromises.readFile(path), open = fsPromises.open;
      let changed = false;
      subcontext.mock.method(fsPromises, "open", async (...args: Parameters<typeof open>): ReturnType<typeof open> => {
        const handle = await open(...args);
        if (!changed && basename(String(args[0])) === "38-verify-content-read-raw.json") {
          changed = true; await fsPromises.writeFile(path, "{}\n");
        }
        return handle;
      }); syncBuiltinESMExports();
      try { await assert.rejects(inspectClosedSymbolTerminal(full.operationId, f.machine), /byte length|SHA-256|identity|changed/u); assert.equal(changed, true); }
      finally { subcontext.mock.restoreAll(); syncBuiltinESMExports(); await fsPromises.writeFile(path, bytes); }
    });
  }
  const final = await inspectClosedSymbolTerminal(full.operationId, f.machine);
  assert.equal(final.historicalCompletionRecorded, true);
  assert.deepEqual(f.events, before);
});
