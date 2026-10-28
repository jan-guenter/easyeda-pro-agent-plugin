/** Focused wrapper state tests use explicit fake dependencies, not semantic graph proof. */
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { performance } from "node:perf_hooks";
import test from "node:test";
import { canonicalJson, sha256Json } from "../src/core.ts";
import { ClosureEvidenceChangedError, ClosureIneligibleError } from "../src/closed-symbol-terminal-closure-plan.ts";
import { makeFixture, reset, root, state } from "./helpers/closed-symbol-terminal-cache-unit-dependencies.ts";
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
let instance = 0;
function isRun(value: unknown): value is (candidate: unknown, runtime: unknown) => Promise<unknown> { return typeof value === "function"; }
async function setup(): Promise<{ run: (candidate: unknown, runtime: unknown) => Promise<unknown>; f: ReturnType<typeof makeFixture> }> {
  reset(); instance += 1;
  const imported: unknown = await import(`${wrapperUrl.href}?isolated=${String(instance)}`);
  assert.ok(imported !== null && typeof imported === "object"); assert.deepEqual(Object.keys(imported), ["inspectLockedTerminalForAdmission"]);
  const run: unknown = Reflect.get(imported, "inspectLockedTerminalForAdmission"); assert.ok(isRun(run));
  return { run, f: makeFixture(instance) };
}
function count(step: Step): number { return state.calls.filter((value) => value === step).length; }
function latch(): { promise: Promise<null>; release: () => void } {
  const { promise, resolve } = Promise.withResolvers<null>(); return { promise, release: (): void => { resolve(null); } };
}
void test("cold then warm returns exact historical data without replaying cold", async () => {
  const { run, f } = await setup(); const cold = await run(f.candidate, f.runtime), warm = await run(f.candidate, f.runtime);
  assert.deepEqual(cold, f.result); assert.deepEqual(warm, cold); assert.notEqual(warm, cold);
  assert.equal(count("cold"), 1); assert.equal(count("observe"), 1); assert.equal(count("revalidate"), 1);
  assert.equal(Object.isFrozen(cold), true); assert.equal(Object.isFrozen(warm), true);
});
for (const step of ["root", "scope", "load", "terminal", "fingerprint", "capture", "cold", "observe"] as const) {
  for (const position of ["before", "after"] as const) {
    void test(`${position} ${step} failure never enrolls a result`, async () => {
      const { run, f } = await setup(); const error = new Error(`unit-${position}-${step}`);
      state[position] = (current): void => { if (current === step) { throw error; } };
      await assert.rejects(run(f.candidate, f.runtime), (actual: unknown) => actual === error);
      delete state.before; delete state.after;
      await run(f.candidate, f.runtime); assert.equal(count("revalidate"), 0); assert.equal(count("observe") > 0, true);
    });
  }
}
for (const step of ["load", "terminal", "fingerprint", "capture", "cold", "observe"] as const) {
  void test(`resolved root drift after ${step} refuses before later action`, async () => {
    const { run, f } = await setup(); state.after = (current): void => { if (current === step) { state.root = `${state.root}-changed`; } };
    await assert.rejects(run(f.candidate, f.runtime), /cache-root-scope-changed/u);
    const index = state.calls.lastIndexOf(step); assert.equal(state.calls.slice(index + 1).some((value) => !["scope", "root"].includes(value)), false);
  });
  void test(`caller drift after ${step} refuses without invoking a late accessor`, async () => {
    const { run, f } = await setup(); let getterCalls = 0;
    state.after = (current): void => { if (current === step) { Object.defineProperty(f.candidate, "family", { get() { getterCalls += 1; return "wrong"; }, configurable: true }); } };
    await assert.rejects(run(f.candidate, f.runtime), /closure-own-data/u); assert.equal(getterCalls, 0);
  });
}
for (const field of ["device", "inode", "path", "assertCurrent", "handle"] as const) {
  void test(`retained root ${field} replacement refuses`, async () => {
    const { run, f } = await setup(); const previous: unknown = Reflect.get(root, field);
    state.after = (current): void => {
      if (current === "capture") {
        let next: unknown = {};
        if (field === "path") { next = `${root.path}-new`; } else if (field === "device" || field === "inode") { next = 99n; }
        Reflect.set(root, field, next);
      }
    };
    try { await assert.rejects(run(f.candidate, f.runtime), /cache-root-scope-changed/u); }
    finally { Reflect.set(root, field, previous); }
  });
}
for (const stage of ["capture", "observe"] as const) {
  void test(`cold-only ${stage} ineligibility preserves genuine cold result but never enrolls`, async () => {
    const { run, f } = await setup(); state.before = (step): void => { if (step === stage) { throw new ClosureIneligibleError("unit-ineligible"); } };
    assert.deepEqual(await run(f.candidate, f.runtime), f.result); assert.deepEqual(await run(f.candidate, f.runtime), f.result);
    assert.equal(count("cold"), stage === "capture" ? 2 : 4); assert.equal(count("revalidate"), 0);
  });
  void test(`${stage} ineligibility plus cleanup aggregate refuses cold success`, async () => {
    const { run, f } = await setup(); const error = new AggregateError([new ClosureIneligibleError("unit"), new Error("cleanup")], "unit-ineligible-cleanup");
    state.before = (step): void => { if (step === stage) { throw error; } };
    await assert.rejects(run(f.candidate, f.runtime), (actual: unknown) => actual === error);
  });
}
for (const error of [new ClosureEvidenceChangedError("changed"), new ClosureIneligibleError("late"), new Error("plain"), new AggregateError([new Error("close")], "unit-close"), Object.assign(new Error("io"), { code: "EIO" })]) {
  void test(`warm ${error.constructor.name}:${error.message} evicts and never falls back cold in same call`, async () => {
    const { run, f } = await setup(); await run(f.candidate, f.runtime);
    state.before = (step): void => { if (step === "revalidate") { throw error; } };
    await assert.rejects(run(f.candidate, f.runtime), (actual: unknown) => actual === error); assert.equal(count("cold"), 1);
    delete state.before; await run(f.candidate, f.runtime); assert.equal(count("cold"), 2);
  });
}
for (const field of ["profile", "operationId", "classification", "historicalCompletionRecorded", "terminalOutcomeVerified", "bodySha256", "storedJournalSha256", "entireStoredJournalSha256", "terminalArtifact",
  "liveOriginalCompletionProved", "currentSourceChecked", "currentOwnershipChecked", "authorityRestored", "executionAuthorized", "replayAllowed"]) {
  void test(`cold result ${field} cannot be adopted`, async () => {
    const { run, f } = await setup(); state.after = (step, value): void => { if (step === "cold" && value !== null && typeof value === "object") { Reflect.set(value, field, "forged"); } };
    await assert.rejects(run(f.candidate, f.runtime), ClosureEvidenceChangedError); assert.equal(count("observe"), 0);
  });
}
void test("cold result extras and accessors refuse without enrollment", async () => {
  const { run, f } = await setup(); let invoked = 0;
  state.after = (step, value): void => { if (step === "cold" && value !== null && typeof value === "object") { Object.defineProperty(value, "authorityRestored", { get() { invoked += 1; return false; } }); } };
  await assert.rejects(run(f.candidate, f.runtime), /closure-own-data/u); assert.equal(invoked, 0); assert.equal(count("observe"), 0);
});
void test("v2 envelope refuses before cold and cannot borrow a locked entry", async () => {
  const { run, f } = await setup(); state.after = (step, value): void => { if (step === "terminal" && value !== null && typeof value === "object") {
    const envelope = { ...f.envelope, profile: "easyeda-pro-control.closed-symbol-terminal.v2" }; Reflect.set(value, "text", JSON.stringify(envelope));
  } };
  await assert.rejects(run(f.candidate, f.runtime)); assert.equal(count("cold"), 0);
});
void test("candidate schema and runtime accessors refuse before root acquisition", async () => {
  const { run, f } = await setup(); let invoked = 0;
  await assert.rejects(run({ ...f.candidate, paths: ["/not-an-input"] }, f.runtime));
  const value = Object.defineProperty({}, "nodeExecutable", { get() { invoked += 1; return "/not-opened"; } });
  await assert.rejects(run(f.candidate, value)); assert.equal(invoked, 0); assert.equal(count("root"), 0);
});
void test("candidate change and runtime change cause fresh cold computation", async () => {
  const { run, f } = await setup(); await run(f.candidate, f.runtime);
  f.journal["newData"] = true; const digest = sha256Json(f.journal); f.candidate["entireStoredJournalSha256"] = digest; f.result["entireStoredJournalSha256"] = digest;
  await run(f.candidate, f.runtime); assert.equal(count("cold"), 2); assert.equal(count("revalidate"), 0);
  f.runtime["nodeSha256"] = "b".repeat(64); await run(f.candidate, f.runtime); assert.equal(count("cold"), 3);
});
void test("compact residents avoid repeated cold replay beyond the former four-entry limit", async () => {
  const { run, f } = await setup(); const fixtures = [f, ...[2001, 2002, 2003, 2004].map((value) => makeFixture(value))];
  for (let scan = 0; scan < 3; scan += 1) { for (const selected of fixtures) { await run(selected.candidate, selected.runtime); } }
  assert.equal(count("cold"), 5); assert.equal(count("revalidate"), 10);
});
void test("large raw replay inputs are not retained in the compact metadata allowance", async () => {
  const { run, f } = await setup(); const fixtures = [f, ...[2101, 2102, 2103].map((value) => makeFixture(value))];
  state.observationPadding = "o".repeat(900_000);
  for (const selected of fixtures) { selected.inputPadding = "p".repeat(8_000_000); await run(selected.candidate, selected.runtime); }
  for (const selected of fixtures) { await run(selected.candidate, selected.runtime); }
  assert.equal(count("cold"), 4); assert.equal(count("revalidate"), 4);
});
void test("512 compact residents remain bounded without eviction churn", async () => {
  const { run, f } = await setup(); const fixtures = [f, ...Array.from({ length: 512 }, (_, index) => makeFixture(3000 + index))];
  for (const selected of fixtures) { await run(selected.candidate, selected.runtime); }
  for (const selected of fixtures) { await run(selected.candidate, selected.runtime); }
  assert.equal(count("cold"), 514); assert.equal(count("revalidate"), 512);
});
void test("32MiB metadata capacity declines new residents without evicting useful ones", async () => {
  const { run, f } = await setup(); const fixtures = [f, ...Array.from({ length: 39 }, (_, index) => makeFixture(4000 + index))];
  state.observationPadding = "o".repeat(900_000);
  for (const selected of fixtures) { await run(selected.candidate, selected.runtime); }
  for (const selected of fixtures) { await run(selected.candidate, selected.runtime); }
  assert.equal(count("cold"), 43); assert.equal(count("revalidate"), 37);
});
void test("absolute ten-minute expiry is not extended by a hit", async (context) => {
  const { run, f } = await setup(); let now = 0; context.mock.method(performance, "now", () => now);
  await run(f.candidate, f.runtime); now = 599_999; await run(f.candidate, f.runtime); now = 600_000; await run(f.candidate, f.runtime);
  assert.equal(count("cold"), 2); assert.equal(count("revalidate"), 1);
});
void test("expiry during warm verification refuses without replay", async (context) => {
  const { run, f } = await setup(); let now = 0; context.mock.method(performance, "now", () => now); await run(f.candidate, f.runtime);
  state.after = (step): void => { if (step === "revalidate") { now = 600_000; } };
  await assert.rejects(run(f.candidate, f.runtime), /cache-hit-expired/u); assert.equal(count("cold"), 1);
});
void test("separate loaded module instance has no serialized resident restoration", async () => {
  const first = await setup(); const savedCandidate = structuredClone(first.f.candidate), savedRuntime = structuredClone(first.f.runtime);
  await first.run(savedCandidate, savedRuntime); const second = await setup(); state.fixtures.set(String(savedCandidate["operationId"]), first.f);
  await second.run(savedCandidate, savedRuntime); assert.equal(count("cold"), 1); assert.equal(count("revalidate"), 0);
});
void test("concurrent misses each complete their own cold proof and only one resident wins", async () => {
  const { run, f } = await setup(); const barrier = latch(), reached = latch(); let observations = 0;
  state.before = async (step): Promise<void> => { if (step === "observe") { observations += 1; if (observations === 2) { reached.release(); } await barrier.promise; } };
  const one = run(f.candidate, f.runtime), two = run(f.candidate, f.runtime); await reached.promise; barrier.release();
  assert.deepEqual(await one, await two); delete state.before; await run(f.candidate, f.runtime);
  assert.equal(count("cold"), 2); assert.equal(count("observe"), 2); assert.equal(count("revalidate"), 1);
});
void test("late failed old hit cannot erase a newly enrolled replacement", async () => {
  const { run, f } = await setup(); await run(f.candidate, f.runtime); const barrier = latch(), reached = latch(); let calls = 0;
  state.before = async (step): Promise<void> => { if (step === "revalidate") { calls += 1; if (calls === 1) { reached.release(); await barrier.promise; } throw new ClosureEvidenceChangedError("unit-hit-changed"); } };
  const first = assert.rejects(run(f.candidate, f.runtime), /unit-hit-changed/u); await reached.promise;
  await assert.rejects(run(f.candidate, f.runtime), /unit-hit-changed/u); delete state.before;
  await run(f.candidate, f.runtime); barrier.release(); await first; await run(f.candidate, f.runtime);
  assert.equal(count("cold"), 2); assert.equal(count("revalidate"), 3);
});
void test("resident public data cannot be mutated through returned snapshots", async () => {
  const { run, f } = await setup(); const returned = await run(f.candidate, f.runtime); assert.ok(returned !== null && typeof returned === "object");
  assert.equal(Reflect.set(returned, "executionAuthorized", true), false);
  assert.equal(canonicalJson(await run(f.candidate, f.runtime)), canonicalJson(f.result));
});
void test("warm scope drift after final revalidation refuses and evicts without cold fallback", async () => {
  const { run, f } = await setup(); await run(f.candidate, f.runtime); const previous = state.root;
  state.after = (step): void => { if (step === "revalidate") { state.root = `${previous}-changed`; } };
  await assert.rejects(run(f.candidate, f.runtime), /cache-root-scope-changed/u); assert.equal(count("cold"), 1);
  state.root = previous; delete state.after; await run(f.candidate, f.runtime); assert.equal(count("cold"), 2);
});
void test("warm caller drift after final revalidation refuses and evicts", async () => {
  const { run, f } = await setup(); await run(f.candidate, f.runtime); const previous = f.runtime["nodeSha256"];
  state.after = (step): void => { if (step === "revalidate") { f.runtime["nodeSha256"] = "e".repeat(64); } };
  await assert.rejects(run(f.candidate, f.runtime), /cache-caller-input-changed/u); assert.equal(count("cold"), 1);
  f.runtime["nodeSha256"] = previous; delete state.after; await run(f.candidate, f.runtime); assert.equal(count("cold"), 2);
});
void test("final observer root precheck failure prevents dispatch and enrollment", async () => {
  const { run, f } = await setup(); let inspected = false;
  state.after = (step): void => { if (step === "cold") { inspected = true; } };
  state.before = (step): void => { if (step === "scope" && inspected) { throw new Error("unit-final-root-precheck"); } };
  await assert.rejects(run(f.candidate, f.runtime), /unit-final-root-precheck/u); assert.equal(count("observe"), 0);
  delete state.before; delete state.after; await run(f.candidate, f.runtime); assert.equal(count("cold"), 2); assert.equal(count("revalidate"), 0);
});
void test("warm final root precheck failure refuses before observer dispatch", async () => {
  const { run, f } = await setup(); await run(f.candidate, f.runtime); let checks = 0;
  state.before = (step): void => { if (step === "scope") { checks += 1; if (checks === 2) { throw new Error("unit-final-root-precheck"); } } };
  await assert.rejects(run(f.candidate, f.runtime), /unit-final-root-precheck/u); assert.equal(count("cold"), 1); assert.equal(count("revalidate"), 0);
});
void test("cold result extra field is rejected by the exact fifteen-field schema", async () => {
  const { run, f } = await setup(); state.after = (step, value): void => { if (step === "cold" && value !== null && typeof value === "object") { Reflect.set(value, "cacheProof", true); } };
  await assert.rejects(run(f.candidate, f.runtime), /cache-exact-fields/u); assert.equal(count("observe"), 0);
});
void test("pre-cold journal and descriptor contradictions refuse before inspector", async () => {
  const { run, f } = await setup(); f.candidate["entireStoredJournalSha256"] = "e".repeat(64);
  await assert.rejects(run(f.candidate, f.runtime), /cache-pre-cold-journal/u); assert.equal(count("cold"), 0);
});
void test("initial caller accessors are not invoked by snapshot or key generation", async () => {
  const { run, f } = await setup(); let calls = 0;
  Object.defineProperty(f.candidate, "state", { get() { calls += 1; return "closed-session-completed"; } });
  await assert.rejects(run(f.candidate, f.runtime), /closure-own-data/u); assert.equal(calls, 0); assert.equal(count("root"), 0);
});
void test("unknown family cannot use a correctly hashed resident", async () => {
  const { run, f } = await setup(); await run(f.candidate, f.runtime); f.candidate["family"] = `${String(f.candidate["family"])}.spoof`;
  await assert.rejects(run(f.candidate, f.runtime), /cache-candidate-profile/u); assert.equal(count("cold"), 1); assert.equal(count("revalidate"), 0);
});
void test("post-cold observer deadline cannot hide evidence changed after replay", async () => {
  const { run, f } = await setup(); let evidenceChanged = false;
  state.before = (step): void => {
    if (step === "observe") { evidenceChanged = true; throw new ClosureIneligibleError("closure-elapsed-deadline"); }
    if (step === "cold" && evidenceChanged) { throw new ClosureEvidenceChangedError("late-evidence-mutation"); }
  };
  await assert.rejects(run(f.candidate, f.runtime), /late-evidence-mutation/u);
  assert.equal(count("cold"), 2); assert.equal(count("revalidate"), 0);
  delete state.before; await run(f.candidate, f.runtime);
  assert.equal(count("cold"), 3); assert.equal(count("revalidate"), 0);
});
void test("fresh replay after observer ineligibility is final and cannot enroll", async () => {
  const { run, f } = await setup(); let finished = false;
  state.before = (step): void => {
    if (step === "observe") { throw new ClosureIneligibleError("closure-elapsed-deadline"); }
    if (finished) { assert.fail(`Unexpected asynchronous work after final cold replay: ${step}`); }
  };
  state.after = (step): void => { if (step === "cold" && count("cold") === 2) { finished = true; } };
  assert.deepEqual(await run(f.candidate, f.runtime), f.result);
  delete state.before; delete state.after; await run(f.candidate, f.runtime);
  assert.equal(count("cold"), 3); assert.equal(count("revalidate"), 0);
});
