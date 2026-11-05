/** Actual seal adapter and complete SQL comparator, with explicit synthetic
 * native owner/checkpoint collectors. No native application or writer runs. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { CurrentFootprintCopyForwardNativeOwner } from "../src/current-pcb-diagnostic-owner.ts";
import { sealCurrentFootprintForwardSource } from "../src/current-footprint-forward-source-seal.ts";
import type { CurrentFootprintForwardSourceSeal, proveCurrentFootprintForwardClosedBaseline } from "../src/current-footprint-forward-source-seal.ts";
import { inventory, mutate, fixture as sqlFixture } from "./helpers/symbol-sql-fixture.ts";
import { syntheticSqlRuntime } from "./helpers/sqlite-inventory-fixture.ts";

type Row = Record<string, unknown>;
type SealApi = Readonly<{ sealCurrentFootprintForwardSource: typeof sealCurrentFootprintForwardSource;
  proveCurrentFootprintForwardClosedBaseline: typeof proveCurrentFootprintForwardClosedBaseline }>;
async function fixture(mode: "success" | "seal-failure" | "sql-change" | "runtime-failure" = "success"): Promise<Readonly<{
  api: SealApi; owner: object; other: object; seal: () => Promise<CurrentFootprintForwardSourceSeal>;
  terminate: () => void; drift: () => void; calls: string[];
}>> {
  const sql = await sqlFixture();
  const calls: string[] = [], opening = Object.freeze({}), preparation = Object.freeze({}), result = Object.freeze({});
  const checkpoint = Object.freeze({ checkpointSha256: sql.before.checkpointSha256 }), runtime = await syntheticSqlRuntime();
  const operationId = "footprint-copy-qualify-source-seal-unit", termination = Object.freeze({});
  let after: object | null = null, origin: Row | null = null, snapshot: Row | null = null, terminated = false;
  class Owner {
    #sealed = false;
    public async sealFootprintCopyExecutionSource(id: unknown, actualOpening: unknown, actualResult: unknown,
      actualPreparation: unknown, actualCheckpoint: unknown, actualRuntime: unknown): Promise<void> {
      assert.equal(this.#sealed, false); this.#sealed = true; calls.push("native-seal");
      assert.equal(id, operationId); assert.equal(actualOpening, opening); assert.equal(actualResult, result);
      assert.equal(actualPreparation, preparation); assert.equal(actualCheckpoint, checkpoint); assert.equal(actualRuntime, runtime);
      await Promise.resolve();
      if (mode === "seal-failure") { throw new Error("synthetic seal refused"); }
      origin = Object.freeze({ operationId, checkpoint, before: sql.before, source: sql.path });
    }
  }
  const owner = new Owner();
  const other = new Owner();
  const original = (candidate: unknown): void => { assert.equal(candidate, owner); };
  const heldOrigin = (candidate: unknown): Row => { original(candidate); assert.ok(origin); return origin; };
  const replacements = new Map<string, unknown>([
    ["./current-pcb-diagnostic-owner.ts", { CurrentFootprintCopyForwardNativeOwner: Owner,
      assertOriginalCurrentFootprintCopyForwardNativeOwner: original, originalCurrentFootprintCopyNativeTarget: heldOrigin,
      originalCurrentFootprintCopyNativeTermination: (candidate: unknown): object => { original(candidate); assert.equal(terminated, true); return termination; } }],
    ["./machine-profile.ts", { loadRuntimeMachineProfile: (): Promise<unknown> => mode === "runtime-failure" ?
      Promise.reject(new Error("synthetic runtime refused")) : Promise.resolve({ profile: { runtime } }) }],
    ["./current-footprint-copy-closed-snapshot.ts", {
      captureCurrentFootprintCopyClosedSnapshot: async (candidate: unknown, observed: unknown): Promise<object> => {
        original(candidate); assert.equal(observed, termination); assert.equal(terminated, true); calls.push("closed-snapshot");
        if (mode === "sql-change") { mutate(sql.path, "UPDATE resources SET dataStr='different source'"); }
        const actual = await inventory(sql.path); after = actual;
        snapshot = Object.freeze({ inventory: actual, checkpoint: Object.freeze({ checkpointSha256: actual.checkpointSha256 }) });
        return actual;
      },
      requireCurrentFootprintCopyClosedSnapshot: (candidate: unknown, actual: unknown): object => {
        original(candidate); assert.equal(actual, after); assert.ok(snapshot); return snapshot;
      },
    }],
  ]);
  const path = new URL("../src/current-footprint-forward-source-seal.ts", import.meta.url);
  const originalRequire = createRequire(path);
  const transformed = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const loaded: { exports: Row } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${transformed.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => replacements.has(name) ? replacements.get(name) : originalRequire(name) as unknown, loaded, loaded.exports]);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Evaluate the actual unchanged module with only the named synthetic native collectors above.
  const api = loaded.exports as unknown as SealApi;
  const seal = (): Promise<CurrentFootprintForwardSourceSeal> => {
    const pending: unknown = Reflect.apply(api.sealCurrentFootprintForwardSource, undefined, [owner, operationId, opening, result, preparation, checkpoint]);
    assert.ok(pending instanceof Promise); return pending;
  };
  return { api, owner, other, seal, terminate: (): void => { terminated = true; },
    drift: (): void => { origin = Object.freeze({ ...origin }); }, calls };
}

void test("source sealing rejects fabricated actual forward owners before configuration or native work", async () => {
  for (const owner of [{}, Object.create(CurrentFootprintCopyForwardNativeOwner.prototype), new Proxy({}, {})] as unknown[]) {
    const pending: unknown = Reflect.apply(sealCurrentFootprintForwardSource, undefined, [owner, "footprint-copy-qualify-forged", {}, {}, {}, {}]);
    assert.ok(pending instanceof Promise); await assert.rejects(pending, /ORIGINAL/u);
  }
});
void test("source seal retains original references through closed SQL equality without accepting cloned descriptors", async () => {
  const f = await fixture(), seal = await f.seal();
  await assert.rejects(f.seal(), /ORIGINAL_REQUIRED/u);
  await assert.rejects(f.api.proveCurrentFootprintForwardClosedBaseline(structuredClone(seal)), /ORIGINAL_REQUIRED/u);
  assert.deepEqual(f.calls, ["native-seal"]); f.terminate();
  const proven = await f.api.proveCurrentFootprintForwardClosedBaseline(seal);
  assert.equal(proven.before.logicalSha256, proven.after.logicalSha256);
  assert.equal(proven.closedSqlSha256, seal.beforeSqlSha256);
  await assert.rejects(f.api.proveCurrentFootprintForwardClosedBaseline(seal), /ORIGINAL_REQUIRED/u);
  assert.deepEqual(f.calls, ["native-seal", "closed-snapshot"]);
});
for (const mode of ["seal-failure", "runtime-failure"] as const) {
  void test(`source seal failure consumes its original attempt: ${mode}`, async () => {
    const f = await fixture(mode); await assert.rejects(f.seal(), /synthetic .* refused/u);
    await assert.rejects(f.seal(), /ORIGINAL_REQUIRED/u);
    assert.equal(f.calls.filter(value => value === "native-seal").length, mode === "seal-failure" ? 1 : 0);
  });
}
void test("complete closed SQL comparison rejects changed peer data and consumes the original snapshot attempt", async () => {
  const f = await fixture("sql-change"), seal = await f.seal(); f.terminate();
  await assert.rejects(f.api.proveCurrentFootprintForwardClosedBaseline(seal), /Closed SQL equality refused/u);
  await assert.rejects(f.api.proveCurrentFootprintForwardClosedBaseline(seal), /ORIGINAL_REQUIRED/u);
  assert.deepEqual(f.calls, ["native-seal", "closed-snapshot"]);
});
void test("closed baseline cannot select a replaced source binding or missing original termination", async () => {
  const drift = await fixture(), seal = await drift.seal(); drift.drift(); drift.terminate();
  await assert.rejects(drift.api.proveCurrentFootprintForwardClosedBaseline(seal), /ORIGINAL_REQUIRED/u);
  const pending = await fixture();
  const original = await pending.seal();
  await assert.rejects(pending.api.proveCurrentFootprintForwardClosedBaseline(original));
  pending.terminate(); await assert.rejects(pending.api.proveCurrentFootprintForwardClosedBaseline(original), /ORIGINAL_REQUIRED/u);
  assert.deepEqual(pending.calls, ["native-seal"]);
});
