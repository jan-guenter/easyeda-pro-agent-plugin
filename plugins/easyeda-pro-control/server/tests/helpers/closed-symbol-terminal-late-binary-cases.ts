import assert from "node:assert/strict";
import fsPromises from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";
import { test } from "node:test";
import { fixture } from "./closed-symbol-coordinator-fixture.ts";
import { assertOriginalClosedSymbolFullEvidence } from "../../src/closed-symbol-coordinator.ts";
import { ClosedSymbolTerminalStage, inspectClosedSymbolTerminal } from "../../src/closed-symbol-terminal.ts";

for (const selected of ["raw-copy", "checkpoint"] as const) {
  void test(`historical replay refuses a late ${selected} byte change`, async (context) => {
    const f = await fixture(context), full = await f.stage.recordFullEvidence(f.plan);
    const original = assertOriginalClosedSymbolFullEvidence(full, f.engine, full.operationId);
    await new ClosedSymbolTerminalStage(f.engine, f.machine).complete(full);
    const path = selected === "raw-copy" ? original.baseline.copy.copy.artifact : original.baseline.copy.checkpoint.checkpoint;
    const bytes = await fsPromises.readFile(path), open = fsPromises.open;
    const before = [...f.events]; let changed = false;
    const read = context.mock.method(fsPromises, "open", async (...args: Parameters<typeof open>): ReturnType<typeof open> => {
      const handle = await open(...args);
      if (!changed && basename(String(args[0])) === "38-verify-content-read-raw.json") {
        changed = true; const replacement = Buffer.from(bytes);
        // oxlint-disable-next-line eslint/no-bitwise -- Flip one bit in a synthetic SQLite file for this exact raw-byte corruption test.
        replacement[64] = (replacement[64] ?? 0) ^ 1;
        await fsPromises.writeFile(path, replacement);
      }
      return handle;
    }); syncBuiltinESMExports();
    try {
      await assert.rejects(inspectClosedSymbolTerminal(full.operationId, f.machine), /identity|changed|hash|SHA/u);
      assert.equal(changed, true); assert.deepEqual(f.events, before);
    } finally {
      read.mock.restore(); syncBuiltinESMExports();
      // Bytes are restored for retained diagnostics. The old ctime identity is
      // Not restored or claimed current, and this historical record still refuses.
      await fsPromises.writeFile(path, bytes);
    }
    await assert.rejects(inspectClosedSymbolTerminal(full.operationId, f.machine), /identity|changed/u);
  });
}
