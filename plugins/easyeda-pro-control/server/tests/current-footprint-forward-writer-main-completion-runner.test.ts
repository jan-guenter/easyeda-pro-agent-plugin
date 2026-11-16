/** Actual fixed runner with a synthetic full issuer. No native owner, SQL or
 * application exists; these checks establish registry selection and scheduling. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { createCurrentFootprintForwardWriterMainCompletionRunner, requireOriginalCurrentFootprintForwardWriterCompletionContext } from "../src/current-footprint-copy-main-completion-runner.ts";
import type { CurrentFootprintCopyMainCompletionRunner, CurrentFootprintForwardWriterMainCompletionObservation } from "../src/current-footprint-copy-main-completion-runner.ts";
import { mainCompletionRunnerFixture } from "./helpers/footprint-main-completion-runner-fixture.ts";

async function fixture(): Promise<Readonly<{ runner: CurrentFootprintCopyMainCompletionRunner; f: ReturnType<typeof mainCompletionRunnerFixture>; allocations: unknown[]; readContext: (packet: CurrentFootprintForwardWriterMainCompletionObservation) => ReturnType<typeof requireOriginalCurrentFootprintForwardWriterCompletionContext>; createAgain: () => unknown; constructOld: () => unknown }>> {
  const f = mainCompletionRunnerFixture(), path = new URL("../src/current-footprint-copy-main-completion-runner.ts", import.meta.url);
  const token = Object.freeze({ profile: "private.current-footprint-forward-writer-main-completion-origin.v1", executionAuthorized: false });
  const allocations: unknown[] = [];
  const bindings = Object.freeze({ ...f.bindings, request: async (...args: [Parameters<typeof f.bindings.request>[0], boolean, ((raw: unknown) => void)?]): Promise<unknown> => {
    const reply = await f.bindings.request(args[0], args[1]);
    if (args[2] !== undefined) { allocations.push(reply); args[2](reply); } return reply;
  }, settleAllocation: (): Promise<void> => Promise.resolve() });
  const loaded: { exports: Record<string, unknown> } = { exports: {} }, originalRequire = createRequire(path);
  const output = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(specifier: string): unknown => {
    if (specifier === "./current-footprint-forward-writer-main-origin.ts") { return {
      isCurrentFootprintForwardWriterMainCompletionOrigin: (input: unknown): boolean => input === token,
      requireCurrentFootprintForwardWriterMainCompletionOrigin: (input: unknown): typeof bindings => { assert.equal(input, token); assert.ok(!f.state.retired); return bindings; }
    }; }
    if (specifier === "./current-footprint-copy-main-completion-origin.ts") { return { requireCurrentFootprintCopyMainCompletionOrigin: f.require }; }
    if (specifier === "./current-footprint-copy-main-completion-source.ts") { return { ...originalRequire(specifier), requireCurrentFootprintCopyMainCompletionSource: f.requireSource }; }
    return originalRequire(specifier) as unknown;
  }, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentFootprintCopyMainCompletionRunner"], create = loaded.exports["createCurrentFootprintForwardWriterMainCompletionRunner"];
  assert.ok(typeof create === "function"); assert.ok(typeof Constructor === "function");
  const result: unknown = Reflect.apply(create, undefined, [token]); assert.ok(result !== null && typeof result === "object");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The actual fixed private-field runner is loaded above with only explicit synthetic issuer/source dependencies.
  const runner = result as CurrentFootprintCopyMainCompletionRunner;
  const read = loaded.exports["requireOriginalCurrentFootprintForwardWriterCompletionContext"]; assert.ok(typeof read === "function");
  return { runner, f, allocations, readContext: (packet): ReturnType<typeof requireOriginalCurrentFootprintForwardWriterCompletionContext> => {
    const value: unknown = Reflect.apply(read, undefined, [runner, packet]); assert.ok(value !== null && typeof value === "object" && "held" in value && value.held === bindings.transferredHeld && "origin" in value && value.origin === token);
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The actual production getter above returned its own verified exact token and retained binding in this synthetic issuer harness.
    return value as ReturnType<typeof requireOriginalCurrentFootprintForwardWriterCompletionContext>;
  }, createAgain: (): unknown => Reflect.apply(create, undefined, [token]), constructOld: (): unknown => Reflect.construct(Constructor, [token]) };
}
void test("full completion uses its own issuer and one-shot factory while preserving the exact 45/30 protocol", async () => {
  const { runner, f, allocations, readContext, createAgain, constructOld } = await fixture();
  assert.ok(Object.isFrozen(runner)); assert.throws(createAgain, /FULL_ENGINE_CONSUMED/u); assert.throws(constructOld);
  await runner.arm(); const packet = await runner.collect(); await runner.requireOriginal(packet);
  const context = readContext(packet); assert.throws(() => readContext(structuredClone(packet)));
  assert.equal(allocations.length, 14); assert.equal(runner.diagnostics().normalRequests, 45); assert.equal(runner.diagnostics().cleanupRequests, 29);
  assert.equal(packet.executionAuthorized, false); assert.equal(packet.savedResultVerified, false); assert.equal(packet.nativeSqlCompletionVerified, false);
  await assert.rejects(runner.requireOriginal(structuredClone(packet))); await runner.cleanup(); assert.equal(f.state.retired, true); assert.equal(readContext(packet).held, context.held);
  assert.equal(runner.diagnostics().cleanupRequests, 30); await assert.rejects(runner.requireOriginal(packet));
});
void test("production full completion rejects copied profiles without invoking caller properties", () => {
  const proxy = new Proxy({}, { getPrototypeOf: (): never => { throw new Error("proxy trap"); }, ownKeys: (): never => { throw new Error("proxy trap"); } });
  assert.throws(() => Reflect.apply(requireOriginalCurrentFootprintForwardWriterCompletionContext, undefined, [proxy,{}]), /^Error: FOOTPRINT_MAIN_COMPLETION_FULL_ORIGINAL_CONTEXT$/u);
  let calls = 0; const copied: unknown = Object.create(null); assert.ok(copied !== null && typeof copied === "object");
  Object.defineProperty(copied, "profile", { get: (): never => { calls += 1; throw new Error("caller getter"); } });
  assert.throws(() => Reflect.apply(createCurrentFootprintForwardWriterMainCompletionRunner, undefined, [copied])); assert.equal(calls, 0);
  for (const profile of ["private.current-footprint-forward-writer-main-completion-origin.v1", "private.current-footprint-forward-main-completion-origin.v2", "private.current-footprint-copy-main-completion-origin.v1"]) {
    assert.throws(() => Reflect.apply(createCurrentFootprintForwardWriterMainCompletionRunner, undefined, [Object.freeze({ profile, executionAuthorized: false })]));
  }
});
