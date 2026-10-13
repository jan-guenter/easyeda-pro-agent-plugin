import assert from "node:assert/strict";
import fsPromises from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { after, test } from "node:test";
import { loadClosedSymbolJournal } from "../src/closed-symbol-journal.ts";
import { isRecord } from "../src/core.ts";
import { installSyntheticNativeProfile } from "./helpers/install-synthetic-native-profile.ts";
// oxlint-disable-next-line node/no-top-level-await -- Install this exact worker-local prerequisite mock before loading the real stage graph.
const profile = await installSyntheticNativeProfile();
after(() => { profile.unregister(); });
// oxlint-disable-next-line node/no-top-level-await -- Consumer imports follow the synthetic prerequisite hook; issuer modules stay unchanged.
const { assertOriginalClosedSymbolWitness } = await import("../src/closed-symbol-witness.ts");
// oxlint-disable-next-line node/no-top-level-await -- Load the actual stage fixture after its worker-local prerequisite mock.
const { witnessFixture } = await import("./helpers/closed-symbol-witness-fixture.ts");

function block(raw: unknown): Record<string, unknown> {
  assert.ok(isRecord(raw) && Array.isArray(raw["content"]) && isRecord(raw["content"][0]));
  const result = raw["content"][0]; assert.equal(typeof result["text"], "string"); return result;
}
function mutate(raw: unknown, field: string, value: unknown): void {
  const content = block(raw), original = content["text"]; assert.equal(typeof original, "string");
  const parsed: unknown = JSON.parse(String(original)); assert.ok(isRecord(parsed)); parsed[field] = value; content["text"] = JSON.stringify(parsed);
}
for (const boundary of ["publication", "after-validation"] as const) {
  void test(`witness seals its original settled reply at ${boundary}`, async (context) => {
    const f = await witnessFixture(context); let changed = false, valid = "";
    if (boundary === "publication") { f.state.afterWitness = (value): void => { valid = JSON.stringify(value); value["workerMaxTicket"] = -1; }; }
    const link = fsPromises.link;
    context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>): Promise<void> => {
      await link(...args);
      if (boundary === "publication" && String(args[1]).endsWith("/20-edit-witness-result.json")) { block(f.state.returned)["text"] = valid; changed = true; }
    }); syncBuiltinESMExports();
    context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
    if (boundary === "after-validation") {
      f.state.afterRuntime = (): Promise<void> => {
        if (!changed && f.state.returned !== undefined) { mutate(f.state.returned, "workerMaxTicket", 42); changed = true; }
        return Promise.resolve();
      };
    }
    await assert.rejects(f.stage.collect(f.input), /settled reply changed/u);
    assert.equal(changed, true); assert.equal(f.state.witnessCalls, 1); assert.strictEqual(f.stage.originalReturn(f.journal.operationId), f.state.returned);
    assert.throws(() => assertOriginalClosedSymbolWitness(f.state.returned, f.engine, f.journal.operationId), /not issued/u);
    const loaded = await loadClosedSymbolJournal(f.journal.operationId); assert.equal(loaded.events.at(-1)?.kind, "result");
    assert.equal(loaded.journal.orphanedCallPossible, boundary === "publication");
    await assert.rejects(f.stage.collect(f.input), /already consumed/u);
  });
}
