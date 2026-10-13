import assert from "node:assert/strict";
import fsPromises from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { test } from "node:test";
import { loadClosedSymbolJournal } from "../src/closed-symbol-journal.ts";
import { isRecord } from "../src/core.ts";
import { ClosedSymbolStartupStage } from "../src/closed-symbol-startup.ts";
import { prepared } from "./helpers/closed-symbol-startup-fixture.ts";

function block(raw: unknown): Record<string, unknown> {
  assert.ok(isRecord(raw) && Array.isArray(raw["content"]) && isRecord(raw["content"][0]));
  const result = raw["content"][0]; assert.equal(typeof result["text"], "string"); return result;
}
function mutate(raw: unknown, field: string, value: unknown): void {
  const content = block(raw), original = content["text"]; assert.equal(typeof original, "string");
  const parsed: unknown = JSON.parse(String(original)); assert.ok(isRecord(parsed)); parsed[field] = value; content["text"] = JSON.stringify(parsed);
}
for (const phase of ["baseline-marker-create", "edit-marker-read", "verify-marker-read"] as const) {
  void test(`startup seals ${phase} reply before fallible publication`, async (context) => {
    const f = await prepared(phase), stage = new ClosedSymbolStartupStage(f.value.engine, f.value.runtime, f.value.stage); let changed = false, valid = "";
    context.after(async () => { await f.value.dispose(); });
    const original = f.value.engine.upstream.callTool.bind(f.value.engine.upstream);
    f.value.engine.upstream.callTool = async (...args): ReturnType<typeof original> => {
      const raw = await original(...args);
      if (f.calls.returned === raw) { valid = String(block(raw)["text"]); mutate(raw, "ok", false); } return raw;
    };
    const link = fsPromises.link;
    context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>): Promise<void> => {
      await link(...args);
      if (String(args[1]).endsWith(`-${phase}-result.json`)) { block(f.calls.returned)["text"] = valid; changed = true; }
    }); syncBuiltinESMExports();
    context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
    await assert.rejects(stage.observe(f.value.journal, phase), /settled reply changed/u);
    assert.equal(changed, true); assert.equal(f.calls.count, 1); assert.strictEqual(stage.originalReturn(f.value.operationId, phase), f.calls.returned);
    const loaded = await loadClosedSymbolJournal(f.value.operationId); assert.equal(loaded.events.at(-1)?.kind, "result"); assert.equal(loaded.journal.orphanedCallPossible, true);
    await assert.rejects(stage.observe(f.value.journal, phase), /already consumed/u);
  });
}
void test("startup seals original reply across postvalidation runtime await", async (context) => {
  const f = await prepared(), stage = new ClosedSymbolStartupStage(f.value.engine, f.value.runtime, f.value.stage); let changed = false;
  context.after(async () => { await f.value.dispose(); });
  f.value.state.afterRead = (): void => { if (!changed && f.calls.returned !== undefined) { mutate(f.calls.returned, "ok", false); changed = true; } };
  await assert.rejects(stage.observe(f.value.journal, "baseline-marker-create"), /settled reply changed/u);
  assert.equal(changed, true); assert.equal(f.calls.count, 1); assert.strictEqual(stage.originalReturn(f.value.operationId, "baseline-marker-create"), f.calls.returned);
  const loaded = await loadClosedSymbolJournal(f.value.operationId); assert.equal(loaded.journal.orphanedCallPossible, false); assert.equal(loaded.events.at(-1)?.kind, "result");
  await assert.rejects(stage.observe(f.value.journal, "baseline-marker-create"), /already consumed/u);
});
