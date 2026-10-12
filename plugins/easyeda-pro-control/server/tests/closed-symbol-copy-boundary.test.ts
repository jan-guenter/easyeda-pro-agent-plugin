import assert from "node:assert/strict";
import fsPromises from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";
import { test } from "node:test";
import { copyFixture } from "./helpers/closed-symbol-copy-fixture.ts";
import { appendClosedSymbolEvent, loadClosedSymbolJournal } from "../src/closed-symbol-journal.ts";

void test("the final journal reload has no later asynchronous helper callback opportunity", async (context) => {
  const value = await copyFixture(); const link = fsPromises.link;
  let changed = false, checks = 0, published = false;
  context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>): Promise<void> => {
    await link(...args); if (basename(String(args[1])) === "10-baseline-copy-result.json") { published = true; }
  }); syncBuiltinESMExports();
  value.owner.behavior.onHelperCheck = async (): Promise<void> => {
    if (!published) { return; } checks += 1;
    if (checks !== 2) { return; } changed = true;
    const loaded = await loadClosedSymbolJournal(value.operationId);
    await appendClosedSymbolEvent(loaded.journal, { step: "edit-launch", kind: "intent", generation: null,
      requestSha256: "a".repeat(64), data: { synthetic: "late phase only, no native launch" } });
  };
  try {
    const result = await value.copyStage.copy(value.journal, "baseline-copy", value.generation, value.proof);
    assert.equal(changed, false); assert.equal(checks, 1);
    assert.equal(result.completionProved, false);
    const final = await loadClosedSymbolJournal(value.operationId);
    assert.equal(final.events.at(-1)?.step, "baseline-copy"); assert.equal(final.events.at(-1)?.kind, "result");
    assert.ok(value.copyStage.originalCopy(value.operationId, "baseline-copy") !== undefined);
  } finally { context.mock.restoreAll(); syncBuiltinESMExports(); await value.dispose(); }
});

for (const mutation of ["caller", "generation", "scope", "scope-method"] as const) {
  void test(`${mutation} drift during final journal I/O refuses synchronously`, async (context) => {
    const value = await copyFixture(); const link = fsPromises.link, open = fsPromises.open;
    let armed = false, changed = false, published = false;
    context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>): Promise<void> => {
      await link(...args); if (basename(String(args[1])) === "10-baseline-copy-result.json") { published = true; }
    });
    context.mock.method(fsPromises, "open", async (...args: Parameters<typeof open>): ReturnType<typeof open> => {
      const file = await open(...args);
      if (armed && !changed && basename(String(args[0])) === `${value.operationId}.json`) {
        changed = true;
        if (mutation === "caller") { value.journal.saved = true; }
        if (mutation === "generation") { Reflect.set(value.generation, "captureSha256", "0".repeat(64)); }
        if (mutation === "scope") { value.state.scope = true; }
        if (mutation === "scope-method") { value.upstream.currentAuthenticatedBridgeDispatchBinding = (): undefined => undefined; }
      }
      return file;
    }); syncBuiltinESMExports();
    value.owner.behavior.onHelperCheck = (): Promise<void> => { if (published) { armed = true; } return Promise.resolve(); };
    try {
      await assert.rejects(value.copyStage.copy(value.journal, "baseline-copy", value.generation, value.proof), /caller changed|scope changed/u);
      assert.equal(changed, true);
      assert.ok(value.copyStage.originalCopy(value.operationId, "baseline-copy") !== undefined);
    } finally { context.mock.restoreAll(); syncBuiltinESMExports(); await value.dispose(); }
  });
}
