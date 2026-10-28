/** Actual composition and receipt with synthetic original opening/actor seams.
 * No native producer, clock, writer or saved-state validation is claimed. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { CurrentFootprintCopyStartupOpening } from "../src/current-pcb-209-worker-startup-opening.ts";
import { CURRENT_FOOTPRINT_COPY_BINDINGS_REPROOF_REQUESTS, CURRENT_FOOTPRINT_COPY_BINDINGS_REQUESTS } from "../src/current-footprint-copy-bindings.ts";
import type { prepareCurrentFootprintCopyBindingsOwned, requireCurrentFootprintCopyBindingsOwned, retainedCurrentFootprintCopyBindingsProducers } from "../src/current-footprint-copy-bindings-runtime.ts";

type Source = Parameters<typeof prepareCurrentFootprintCopyBindingsOwned>[0];
async function fixture(): Promise<Readonly<{
  source: Source; calls: string[]; expire: () => void; replaceMethod: () => void;
  prepare: typeof prepareCurrentFootprintCopyBindingsOwned; require: typeof requireCurrentFootprintCopyBindingsOwned;
  retained: typeof retainedCurrentFootprintCopyBindingsProducers;
}>> {
  const path = new URL("../src/current-footprint-copy-bindings-runtime.ts", import.meta.url);
  const actualRequire = createRequire(path), loaded: { exports: Record<string, unknown> } = { exports: {} };
  const calls: string[] = []; let alive = true, source: Source | null = null;
  const producers = Object.freeze({ methodCount: 8, lexicalFunctionCount: 7 });
  const actor = Object.freeze({ footprintCapturedUser: "own-undefined", footprintDocheadUserOmitted: true });
  const copy = Object.freeze({ copy: { before: { logicalSha256: "b".repeat(64) } }, actor: { synthetic: true } });
  class Opening {
    readonly #original = Object.freeze({ synthetic: true });
    public observeFootprintProducers(result: unknown, assignments: unknown, state: unknown): Promise<typeof producers> {
      assert.equal(this.#original.synthetic, true); assert.ok(source); assert.equal(result, source.result);
      assert.equal(assignments, source.assignments); assert.equal(state, source.state); assert.ok(alive, "original owner lost");
      calls.push("producers"); return Promise.resolve(producers);
    }
    public requireFootprintProducers(result: unknown, assignments: unknown, state: unknown, selected: unknown): Promise<void> {
      assert.equal(this.#original.synthetic, true); assert.ok(source); assert.equal(result, source.result);
      assert.equal(assignments, source.assignments); assert.equal(state, source.state); assert.equal(selected, producers);
      assert.ok(alive, "original owner lost"); calls.push("producer-reproof"); return Promise.resolve();
    }
  }
  const opening = new Opening();
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The actual composition is evaluated below with explicit private-field opening and actor seams; their small inert data is not a native result.
  source = Object.freeze({ opening, result: {}, assignments: {}, state: {}, actor: {}, preparation: {} }) as unknown as Source;
  const replacements = new Map<string, unknown>([
    ["./current-pcb-209-worker-startup-opening.ts", { CurrentFootprintCopyStartupOpening, CurrentPcb209WorkerStartupOpening: Opening }],
    ["./current-footprint-copy-actor-preparation.ts", {
      prepareCurrentFootprintCopyActorOwned: (input: unknown): Promise<typeof actor> => {
        assert.equal(input, source); assert.ok(alive, "original owner lost"); calls.push("actor"); return Promise.resolve(actor);
      },
      requireCurrentFootprintCopyActorOwned: (input: unknown, owner: unknown): Promise<typeof copy> => {
        assert.equal(input, actor); assert.equal(owner, opening); assert.ok(alive, "original owner lost");
        calls.push("actor-reproof"); return Promise.resolve(copy);
      },
    }],
  ]);
  const output = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => replacements.has(name) ? replacements.get(name) : actualRequire(name) as unknown,
    loaded, loaded.exports]);
  const prepare = loaded.exports["prepareCurrentFootprintCopyBindingsOwned"], require = loaded.exports["requireCurrentFootprintCopyBindingsOwned"];
  const retained = loaded.exports["retainedCurrentFootprintCopyBindingsProducers"];
  assert.ok(typeof prepare === "function" && typeof require === "function" && typeof retained === "function");
  return { source, calls, expire: (): void => { alive = false; },
    replaceMethod: (): void => { Opening.prototype.requireFootprintProducers = (): never => assert.fail("Replacement must not execute"); },
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The evaluated exports are the actual typed source with the synthetic dependencies named above.
    prepare: prepare as typeof prepareCurrentFootprintCopyBindingsOwned,
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Same actual-source export boundary as prepare.
    require: require as typeof requireCurrentFootprintCopyBindingsOwned,
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Same actual-source export boundary as prepare.
    retained: retained as typeof retainedCurrentFootprintCopyBindingsProducers };
}
void test("owned copy bindings join original producers and actor once with finite stage and reuse counts", async () => {
  const f = await fixture(), token = await f.prepare(f.source);
  assert.equal(CURRENT_FOOTPRINT_COPY_BINDINGS_REQUESTS, 97); assert.equal(CURRENT_FOOTPRINT_COPY_BINDINGS_REPROOF_REQUESTS, 24);
  assert.deepEqual(f.calls, ["producers", "actor", "actor-reproof", "producer-reproof"]);
  assert.equal(token.originalProducerObservationRetained, true); assert.equal(token.originalActorPreparationRetained, true);
  assert.equal(token.footprintCapturedUser, "own-undefined"); assert.equal(token.clockProvenanceVerified, false);
  assert.equal(token.transitiveProducerClosuresBound, false); assert.equal(token.executionAuthorized, false);
  await assert.rejects(f.prepare(f.source), /consumed/u);
  await assert.rejects(f.require(structuredClone(token), f.source.opening), /original owned bindings/u);
  const count = f.calls.length, selected = f.retained(token, f.source.opening);
  assert.equal(f.retained(token, f.source.opening), selected); assert.equal(f.calls.length, count);
  assert.throws(() => f.retained(structuredClone(token), f.source.opening), /original owned bindings/u);
  const other = await fixture(); assert.throws(() => f.retained(token, other.source.opening), /original owned bindings/u);
  await f.require(token, f.source.opening); assert.deepEqual(f.calls.slice(-2), ["actor-reproof", "producer-reproof"]);
  f.expire(); await assert.rejects(f.require(token, f.source.opening), /original owner lost/u);
  await assert.rejects(f.require(token, f.source.opening), /original owned bindings/u);
  assert.throws(() => f.retained(token, f.source.opening), /original owned bindings/u);
});
void test("copy bindings reject accessors and consumed or substituted original owners before producer dispatch", async () => {
  const f = await fixture(); let getters = 0;
  const forged = Object.freeze(Object.defineProperty({ ...f.source }, "state", { get: (): never => { getters += 1; throw new Error("getter"); } }));
  await assert.rejects(f.prepare(forged), /data references/u); assert.equal(getters, 0); assert.deepEqual(f.calls, []);
  f.expire(); await assert.rejects(f.prepare(f.source), /original owner lost/u);
  await assert.rejects(f.prepare(f.source), /consumed/u); assert.deepEqual(f.calls, []);
  const replacement = await fixture(), token = await replacement.prepare(replacement.source);
  const before = replacement.calls.length;
  replacement.replaceMethod(); await assert.rejects(replacement.require(token, replacement.source.opening), /methods changed/u);
  assert.equal(replacement.calls.length, before);
});
