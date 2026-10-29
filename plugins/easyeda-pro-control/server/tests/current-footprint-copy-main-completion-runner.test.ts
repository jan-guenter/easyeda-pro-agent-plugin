/** Actual fixed sequencer with synthetic origin and native replies. These cases
 * establish command ordering/cleanup only, not a connected completion claim. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentFootprintCopyMainCompletionRunner } from "../src/current-footprint-copy-main-completion-runner.ts";
import { mainCompletionRunnerFixture } from "./helpers/footprint-main-completion-runner-fixture.ts";

async function fixture(): Promise<ReturnType<typeof mainCompletionRunnerFixture> & Readonly<{ runner: CurrentFootprintCopyMainCompletionRunner }>> {
  const f = mainCompletionRunnerFixture(), path = new URL("../src/current-footprint-copy-main-completion-runner.ts", import.meta.url);
  const loaded: { exports: Record<string, unknown> } = { exports: {} }, originalRequire = createRequire(path);
  const output = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(specifier: string): unknown => {
    if (specifier === "./current-footprint-copy-main-completion-origin.ts") { return { requireCurrentFootprintCopyMainCompletionOrigin: f.require }; }
    if (specifier === "./current-footprint-copy-main-request-runner.ts") { return { requireCurrentFootprintCopyMainRequestHeldFinalPb: f.requireHeld }; }
    if (specifier === "./current-footprint-copy-main-completion-source.ts") { return { ...originalRequire(specifier), requireCurrentFootprintCopyMainCompletionSource: f.requireSource }; }
    return originalRequire(specifier) as unknown;
  }, loaded, loaded.exports]);
  const selected = loaded.exports["CurrentFootprintCopyMainCompletionRunner"]; assert.equal(typeof selected, "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Actual sequencer is loaded with explicit synthetic source/issuer dependencies; no production capability or live channel exists.
  const Constructor = selected as typeof CurrentFootprintCopyMainCompletionRunner;
  return { ...f, runner: new Constructor(f.token) };
}
void test("fixed sequencer arms before original PB resume, qualifies original callback, and derives exact 45/30 unit", async () => {
  const f = await fixture(); await f.runner.arm(); assert.equal(f.commands.length, 13);
  assert.equal(f.commands.some(command => command.method === "Debugger.resume"), false);
  const packet = await f.runner.collect(); assert.equal(packet.nativeSqlCompletionVerified, false); assert.equal(packet.savedResultVerified, false);
  assert.equal(f.runner.diagnostics().normalRequests, 45); assert.equal(f.runner.diagnostics().cleanupRequests, 29);
  assert.equal(f.commands.filter(command => command.phase === "completion-resume-final-pb").length, 1);
  assert.equal(f.commands.filter(command => command.phase === "completion-resume").length, 14);
  const arm = f.commands.findIndex(command => command.phase === "completion-callback-arm"), callbackResume = f.commands.findIndex((command, index) => index > arm && command.method === "Debugger.resume");
  assert.ok(arm > 13 && callbackResume > arm);
  await f.runner.requireOriginal(packet); await assert.rejects(f.runner.requireOriginal(structuredClone(packet)));
  await f.runner.cleanup(); assert.equal(f.commands.length, 75); assert.equal(f.runner.diagnostics().cleanupRequests, 30); assert.equal(f.state.retired, true);
  await assert.rejects(f.runner.cleanup()); await assert.rejects(f.runner.requireOriginal(packet));
});
void test("lost original PB resume acknowledgement consumes once and forbids cleanup release until actual original exit", async () => {
  const f = await fixture(); await f.runner.arm(); f.state.lostResume = true;
  await assert.rejects(f.runner.collect(), /lost original PB/u); const failure = f.runner.diagnostics().firstFailure;
  await assert.rejects(f.runner.collect()); await assert.rejects(f.runner.cleanup(), /GENERATION_CLOSURE_REQUIRED/u);
  assert.equal(f.commands.filter(command => command.method === "Debugger.resume").length, 1);
  assert.equal(f.commands.some(command => command.phase === "completion-release"), false); assert.deepEqual(f.runner.diagnostics().firstFailure, failure);
  await assert.rejects(f.runner.observeOriginalGenerationEnded(), /remains live/u);
  f.state.exited = true; await f.runner.observeOriginalGenerationEnded(); assert.equal(f.state.retired, true);
});
void test("changed held lease and lost callback allocation never resume a refused continuation", async () => {
  const held = await fixture(); await held.runner.arm(); held.state.heldCurrent = false;
  await assert.rejects(held.runner.collect()); assert.equal(held.commands.some(command => command.method === "Debugger.resume"), false);
  await assert.rejects(held.runner.cleanup(), /GENERATION_CLOSURE_REQUIRED/u); held.state.exited = true; await held.runner.observeOriginalGenerationEnded();
  const callback = await fixture(); await callback.runner.arm(); callback.state.failPhase = "completion-callback-arm";
  await assert.rejects(callback.runner.collect(), /lost completion allocation/u); assert.equal(callback.runner.diagnostics().uncertainAllocation, true);
  assert.equal(callback.commands.filter(command => command.method === "Debugger.resume").length, 2);
  await assert.rejects(callback.runner.cleanup(), /GENERATION_CLOSURE_REQUIRED/u); callback.state.exited = true; await callback.runner.observeOriginalGenerationEnded();
});
void test("foreign singleton caller and unexpected resume retain ambiguity and block group release", async () => {
  const foreign = await fixture(); await foreign.runner.arm(); foreign.state.foreignCaller = true;
  await assert.rejects(foreign.runner.collect()); assert.equal(foreign.runner.diagnostics().unknownPause, true);
  assert.equal(foreign.commands.some(command => command.phase === "completion-join" && command.stage === "project-sql"), false);
  await assert.rejects(foreign.runner.cleanup(), /GENERATION_CLOSURE_REQUIRED/u); foreign.state.exited = true; await foreign.runner.observeOriginalGenerationEnded();
  const resumed = await fixture(); await resumed.runner.arm(); const packet = await resumed.runner.collect(); resumed.state.unexpectedResume = true;
  await assert.rejects(resumed.runner.cleanup()); assert.equal(resumed.runner.diagnostics().unknownPause, true);
  assert.equal(resumed.commands.some(command => command.phase === "completion-release"), false);
  await assert.rejects(resumed.runner.requireOriginal(packet)); resumed.state.exited = true; await resumed.runner.observeOriginalGenerationEnded();
});
