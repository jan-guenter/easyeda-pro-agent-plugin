import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";

const path = new URL("../src/current-pcb-worker-startup-lifecycle-adapter.ts", import.meta.url);
const actualRequire = createRequire(path);
void test("adapter forwards the actual private-field opening and original packet, never structural copies", async () => {
  const packet = Object.freeze({ synthetic: true });
  class Opening {
    readonly #packet = packet;
    public open(): Promise<typeof packet> { return Promise.resolve(this.#packet); }
    public status(): Readonly<{ synthetic: true }> { assert.equal(this.#packet, packet); return { synthetic: true }; }
    public retainedOpeningResult = unused;
    public requireOriginal = unused;
    public proveCurrentAssignments = unused;
    public requireCurrentAssignments = unused;
    public retainedActorObservation = unused;
    public observeActorClock = unused;
    public requireActorClock = unused;
    public retainedChannelObservation = unused;
    public observeCurrentChannel = unused;
    public requireCurrentChannel = unused;
    public releaseAfterTermination = unused;
  }
  // Substitute only the opening class. The actual adapter runs unchanged with
  // Real private fields, retained receivers and asynchronous packet forwarding.
  const generated = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${generated.code}\n})`);
  assert.ok(typeof evaluate === "function");
  const load = (name: string): unknown => name === "./current-pcb-209-worker-startup-opening.ts"
    ? { CurrentPcb209WorkerStartupOpening: Opening } : actualRequire(name) as unknown;
  Reflect.apply(evaluate, undefined, [load, loaded, loaded.exports]);
  const adapt = loaded.exports["adaptCurrentPcb209WorkerStartupLifecycle"], original = loaded.exports["requireCurrentPcb209StartupOpening"];
  assert.ok(typeof adapt === "function" && typeof original === "function");
  const owner = new Opening();
  const adapter: unknown = Reflect.apply(adapt, undefined, [owner]); assert.ok(adapter !== null && typeof adapter === "object");
  assert.throws(() => Reflect.apply(original, undefined, [adapter, packet]), /ORIGINAL_ADAPTER/u);
  const open: unknown = Reflect.get(adapter, "open"); assert.ok(typeof open === "function");
  const result: unknown = await Reflect.apply(open, adapter, [{}, unused]); assert.equal(result, packet);
  const retained: unknown = Reflect.apply(original, undefined, [adapter, result]);
  assert.ok(retained !== null && typeof retained === "object" && "opening" in retained && "result" in retained);
  assert.equal(retained.opening, owner); assert.equal(retained.result, packet);
  assert.throws(() => Reflect.apply(original, undefined, [{ ...adapter }, result]), /ORIGINAL_ADAPTER/u);
  assert.throws(() => Reflect.apply(original, undefined, [adapter, { ...packet }]), /ORIGINAL_ADAPTER/u);
  owner.requireOriginal = (): never => { throw new Error("replacement method must not run"); };
  assert.throws(() => Reflect.apply(original, undefined, [adapter, result]), /ORIGINAL_ADAPTER/u);
  assert.throws(() => Reflect.apply(adapt, undefined, [Object.create(Opening.prototype)]), TypeError);
});
function unused(): never { throw new Error("unexpected coordinator operation"); }
