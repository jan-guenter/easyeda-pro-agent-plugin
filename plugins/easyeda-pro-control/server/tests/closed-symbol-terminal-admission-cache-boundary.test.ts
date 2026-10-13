/** Explicit mocked-dependency boundary controls, not native or complete SQL evidence. */
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";
import { ClosureEvidenceChangedError, ClosureIneligibleError } from "../src/closed-symbol-terminal-closure-plan.ts";
import { makeFixture, reset, state } from "./helpers/closed-symbol-terminal-cache-unit-dependencies.ts";
import type { Step } from "./helpers/closed-symbol-terminal-cache-unit-dependencies.ts";

const fakeUrl = new URL("helpers/closed-symbol-terminal-cache-unit-dependencies.ts", import.meta.url), wrapperUrl = new URL("../src/closed-symbol-terminal-admission-cache.ts", import.meta.url);
const replaced = new Set([
  "../src/artifacts.ts",
  "../src/closed-symbol-journal.ts",
  "../src/closed-symbol-terminal.ts",
  "../src/closed-symbol-terminal-closure-journal.ts",
  "../src/closed-symbol-terminal-closure-observer.ts",
].map((path) => new URL(path, import.meta.url).href));
registerHooks({ resolve(specifier, context, nextResolve) {
  const selected = nextResolve(specifier, context);
  return context.parentURL?.startsWith(wrapperUrl.href) === true && replaced.has(selected.url) ? { url: fakeUrl.href, shortCircuit: true } : selected;
} });
function isRun(value: unknown): value is (candidate: unknown, runtime: unknown) => Promise<unknown> { return typeof value === "function"; }
let instance = 0;
async function setupCase(label: string): Promise<{ run: (candidate: unknown, runtime: unknown) => Promise<unknown>; fixture: ReturnType<typeof makeFixture> }> {
  reset(); instance += 1;
  const imported: unknown = await import(`${wrapperUrl.href}?${label}=${String(instance)}`);
  assert.ok(imported !== null && typeof imported === "object");
  const run: unknown = Reflect.get(imported, "inspectLockedTerminalForAdmission"); assert.ok(isRun(run));
  return { run, fixture: makeFixture(instance) };
}
for (const finalStep of ["cold", "observe", "revalidate"] as const) {
  void test(`no asynchronous root check can mutate evidence after final ${finalStep}`, async (context) => {
    const { run, fixture } = await setupCase("final-boundary");
    if (finalStep === "revalidate") { await run(fixture.candidate, fixture.runtime); }
    let finalSettled = false, observedVersion = 0, postFinalRootChecks = 0, retainedDependencyVersion = 1;
    state.before = (step: Step): void => {
      if (finalStep === "cold" && step === "capture") { throw new ClosureIneligibleError("unit-cold-only"); }
      if (step === "scope" && finalSettled) {
        // A concrete mutation after the final mocked semantic/byte observation,
        // During the old extra awaited scope check, before its success returned.
        postFinalRootChecks += 1; retainedDependencyVersion = 2;
      }
    };
    state.after = (step): void => { if (step === finalStep) { observedVersion = retainedDependencyVersion; finalSettled = true; } };
    assert.deepEqual(await run(fixture.candidate, fixture.runtime), fixture.result);
    context.diagnostic(JSON.stringify({ finalStep, observedVersion, retainedDependencyVersion, postFinalRootChecks }));
    assert.equal(observedVersion, 1);
    assert.equal(postFinalRootChecks, 0, "No awaited root action follows the final historical observation.");
    assert.equal(retainedDependencyVersion, observedVersion);
  });
}
for (const failingStep of ["capture", "observe", "revalidate"] as const) {
  for (const kind of ["contradiction", "ineligible", "other"] as const) {
    void test(`${failingStep} ${kind} survives a caller-drift scope failure with correct precedence`, async (context) => {
      const { run, fixture } = await setupCase("precedence");
      if (failingStep === "revalidate") { await run(fixture.candidate, fixture.runtime); }
      let primary: Error = new Error("unit-primary");
      if (kind === "contradiction") { primary = new ClosureEvidenceChangedError("unit-primary-contradiction"); }
      else if (kind === "ineligible") { primary = new ClosureIneligibleError("unit-primary-ineligible"); }
      state.before = (step): void => {
        if (step === failingStep) { fixture.candidate["unexpectedOversize"] = "x".repeat(8_388_609); throw primary; }
      };
      await assert.rejects(run(fixture.candidate, fixture.runtime), (error: unknown) => {
        context.diagnostic(JSON.stringify({ failingStep, kind, actualClass: error instanceof Error ? error.constructor.name : "unknown", primaryRetained: error === primary }));
        if (kind === "contradiction") { return error === primary; }
        return error instanceof AggregateError && error.errors.length === 2 && error.errors[0] === primary && error.errors[1] instanceof ClosureIneligibleError;
      });
      if (failingStep === "revalidate") { assert.equal(state.calls.filter((step) => step === "cold").length, 1); }
    });
  }
}
