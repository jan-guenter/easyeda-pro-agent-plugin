import assert from "node:assert/strict";
import fsPromises from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";
import { test } from "node:test";
import { loadOperation } from "../src/artifacts.ts";
import { loadClosedSymbolJournal } from "../src/closed-symbol-journal.ts";
import { prepared } from "./helpers/closed-symbol-startup-fixture.ts";

for (const boundary of ["artifact", "journal-before", "journal-after"] as const) {
  void test(`startup result publication failure ${boundary} retains original settled return without replay authority`, async (context) => {
    const { value, stage, calls } = await prepared();
    const link = fsPromises.link, rename = fsPromises.rename; let resultPublication = false;
    context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>): Promise<void> => {
      if (basename(String(args[1])) === "06-baseline-marker-create-result.json") {
        resultPublication = true;
        if (boundary === "artifact") { throw new Error("Synthetic startup result publication refused"); }
      }
      await link(...args);
    });
    context.mock.method(fsPromises, "rename", async (...args: Parameters<typeof rename>): Promise<void> => {
      const selected = resultPublication && basename(String(args[1])) === `${value.operationId}.json`;
      if (selected && boundary === "journal-before") { throw new Error("Synthetic startup result publication refused"); }
      await rename(...args);
      if (selected && boundary === "journal-after") { throw new Error("Synthetic startup result publication refused"); }
    }); syncBuiltinESMExports();
    try {
      await assert.rejects(stage.observe(value.journal, "baseline-marker-create"), /publication/u);
      assert.equal(resultPublication, true); assert.equal(calls.count, 1); assert.ok(calls.returned !== undefined);
      const accessor: unknown = Reflect.get(stage, "originalReturn");
      assert.equal(typeof accessor, "function", "settled startup reply needs an accessible original before fallible publication");
      assert.ok(typeof accessor === "function");
      const original: unknown = Reflect.apply(accessor, stage, [value.operationId, "baseline-marker-create"]);
      assert.equal(original, calls.returned);
      const durable = await loadOperation(value.operationId);
      assert.equal(durable["orphanedCallPossible"], true); assert.equal(durable["saved"], false);
      if (boundary === "journal-before") {
        await assert.rejects(loadClosedSymbolJournal(value.operationId), /Unreferenced next phase artifact/u);
      } else {
        const retained = await loadClosedSymbolJournal(value.operationId);
        assert.equal(retained.events.at(-1)?.kind, boundary === "journal-after" ? "result" : "intent");
      }
      await assert.rejects(stage.observe(value.journal, "baseline-marker-create"), /consumed/u);
      assert.equal(calls.count, 1);
    } finally { context.mock.restoreAll(); syncBuiltinESMExports(); await value.dispose(); }
  });
}
