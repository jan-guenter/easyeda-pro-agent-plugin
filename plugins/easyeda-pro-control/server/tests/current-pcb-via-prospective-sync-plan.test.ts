/** The real private issuer runs against explicit inert owner/reader seams.
 * No native allocation, histories GET or SQL connection exists. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { viaLiveHistoryCacheInput } from "./helpers/via-live-history-cache-data.ts";

void test("prospective branch planning needs original completed effects/body but does not need or invent future native rows", async () => {
  for (const mode of ["mutable", "append"] as const) {
    const input = viaLiveHistoryCacheInput(mode); let drift = false;
    const effects = Object.freeze(input.effects); const delta = Object.freeze({ bodySha256: effects.bodySha256 }); const workerValue = Object.freeze({ body: input.body });
    const inventory = Object.freeze({ logicalSha256: input.initial.initialLogicalSha256 }), original = Object.freeze({ inventory, qualification: { sourceSha256: input.initial.initialSourceSha256 } });
    const plan = Object.freeze({ initialLogicalSha256: inventory.logicalSha256, target: { projectUuid: input.projectUuid, branchUuid: input.branchUuid, documentUuid: input.documentUuid } });
    const owner = Object.freeze({ requireViaHistorySqlEffects: () => effects, requireViaLiveHistoryBody: () => ({ delta: drift ? { ...delta } : delta, workerValue, clock: input.clock }), requireViaInitialCacheData: () => input.initial, requireViaInitialBranchData: () => input.initialBranch });
    const url = new URL("../src/current-pcb-via-prospective-sync-plan.ts", import.meta.url); const local = createRequire(url); const compiled = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
    const loaded: { exports: Record<string, unknown> } = { exports: {} }; const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
    Reflect.apply(evaluate, undefined, [(name: string): unknown => {
      if (name === "./current-pcb-via-write-owner.ts") { return { assertOriginalCurrentPcbViaWriteOwner: (value: unknown): void => { assert.equal(value, owner); } }; }
      if (name === "./current-pcb-via-write-plan.ts") { return { requireOriginalCurrentPcbViaWritePlan: (value: unknown): object => { assert.equal(value, plan); return original; } }; }
      if (name === "./sqlite-inventory.ts") { return { readerCompletion: (value: unknown): object => { assert.equal(value, inventory); return { exitCode: 0 }; } }; }
      return local(name) as unknown;
    }, loaded, loaded.exports]);
    const prepare = loaded.exports["prepareCurrentPcbViaProspectiveSyncPlan"]; const lookup = loaded.exports["requireOriginalCurrentPcbViaProspectiveSyncPlan"]; assert.ok(typeof prepare === "function" && typeof lookup === "function");
    const token: unknown = Reflect.apply(prepare, undefined, [owner, plan]); assert.equal(Reflect.apply(prepare, undefined, [owner, plan]), token);
    const data: unknown = Reflect.apply(lookup, undefined, [token, owner, plan]); assert.ok(data !== null && typeof data === "object");
    const body: unknown = Reflect.get(data, "branchBody"); assert.ok(typeof body === "string"); const row: unknown = JSON.parse(body); assert.ok(row !== null && typeof row === "object"); assert.equal(Reflect.get(row, "history_uuid"), effects.historyUuid); assert.equal(Reflect.get(row, "project_histories_id"), mode === "append" ? 2 : 1); assert.equal(Reflect.get(data, "actualHistoryRowsVerified"), false);
    assert.ok(token !== null && typeof token === "object"); assert.throws(() => Reflect.apply(lookup, undefined, [{ ...token }, owner, plan])); assert.throws(() => Reflect.apply(prepare, undefined, [{ ...owner }, plan]));
    drift = true; assert.throws(() => Reflect.apply(lookup, undefined, [token, owner, plan]));
  }
});
