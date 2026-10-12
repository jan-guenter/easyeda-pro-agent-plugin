import assert from "node:assert/strict";
import { test } from "node:test";
import { buildStartupProgram, validateStartupResult } from "../src/closed-symbol-startup-program.ts";
import type { StartupInput } from "../src/closed-symbol-startup-program.ts";
import { startupFixture } from "./helpers/closed-symbol-startup-browser-fixture.ts";

for (const phase of ["baseline-marker-create", "edit-marker-read", "verify-marker-read"] as const) {
  void test(`${phase}: fixed native-leaf ordering and nonauthorizing result`, async () => {
    const value = startupFixture(phase); const result = await value.run();
    assert.equal(result["ok"], true);
    const parsed = validateStartupResult(result, value.input);
    assert.equal(parsed["executionAuthorized"], false); assert.equal(parsed["startupQualified"], false); assert.equal(parsed["completionProved"], false);
    assert.equal(value.registrations.count, 2);
    assert.equal(value.rpc.count, phase === "baseline-marker-create" ? 6 : 3);
    const calls = value.state.calls.map((entry) => entry.kind);
    assert.equal(calls.filter((kind) => kind === "open").length, Number(phase === "baseline-marker-create"));
    assert.equal(calls.filter((kind) => kind === "put").length, Number(phase === "baseline-marker-create"));
    const matches = value.state.calls.filter((entry) => entry.kind === "match");
    assert.equal(matches.length, phase === "baseline-marker-create" ? 5 : 3);
    assert.match(String(matches[0]?.args[0]), phase === "baseline-marker-create" ? /\/upload\//u : /storage-continuity/u);
    assert.ok(Object.isFrozen(parsed));
  });
}

for (const failure of ["owner", "dirty", "service-worker", "active-project", "queue", "existing-marker"] as const) {
  void test(`baseline ${failure} failure retains a bounded prefix with no marker write`, async () => {
    const value = startupFixture();
    if (failure === "owner") { value.actor["uuid"] = "f".repeat(32); }
    else if (failure === "dirty") { value.state.tabs["hasTabUnSaved"] = (): boolean => true; }
    else if (failure === "service-worker") { value.registrations.value = [{}]; }
    else if (failure === "active-project") { value.rpc.value = { message: true }; }
    else if (failure === "queue") { value.state.response = (): object => ({}); }
    else { value.state.exists = true; }
    const result = await value.run(); assert.equal(result["ok"], false);
    validateStartupResult(result, value.input);
    assert.equal(value.state.calls.some((entry) => entry.kind === "open" || entry.kind === "put"), false);
  });
}

void test("later missing marker refuses before target queue reads and does not recreate", async () => {
  const value = startupFixture("edit-marker-read"); value.state.exists = false;
  const result = await value.run(); assert.equal(result["ok"], false); assert.equal(result["failedStep"], "marker-read");
  validateStartupResult(result, value.input);
  assert.equal(value.rpc.count, 0); assert.deepEqual(value.state.calls.map((entry) => entry.kind), ["match"]);
});

void test("put ambiguity remains a recorded create attempt and never triggers another write", async () => {
  const value = startupFixture();
  value.state.onCall = (call): void => { if (call.kind === "put") { throw new Error("synthetic ambiguous put"); } };
  const result = await value.run(); assert.equal(result["ok"], false); assert.equal(result["failedStep"], "marker-create");
  assert.equal(result["markerCreateAttempted"], true); validateStartupResult(result, value.input);
  assert.equal(value.state.calls.filter((entry) => entry.kind === "put").length, 1); assert.equal(value.state.entries.size, 1);
});

void test("post-write actor drift remains bounded failed evidence rather than authority", async () => {
  const value = startupFixture();
  value.state.onCall = (call): void => { if (call.kind === "put") { value.actor["nickname"] = "changed"; } };
  const result = await value.run(); assert.equal(result["ok"], false); assert.equal(result["markerCreateAttempted"], true);
  validateStartupResult(result, value.input); assert.equal(value.state.entries.size, 1);
});

for (const field of ["profile", "phase", "ok", "failedStep", "markerCreateAttempted", "observations", "executionAuthorized", "startupQualified", "completionProved"]) {
  void test(`result accessor ${field} is refused without invocation`, async () => {
    const value = startupFixture(); const result = await value.run(); let reads = 0;
    Object.defineProperty(result, field, { get(): never { reads += 1; throw new Error("getter"); } });
    assert.throws(() => validateStartupResult(result, value.input)); assert.equal(reads, 0);
  });
}

for (const change of ["authority", "phase", "attempt", "extra", "row-order", "sparse", "failed-success"] as const) {
  void test(`result ${change} corruption refuses`, async () => {
    const value = startupFixture(); const result = await value.run();
    if (change === "authority") { result["executionAuthorized"] = true; }
    else if (change === "phase") { result["phase"] = "verify-marker-read"; }
    else if (change === "attempt") { result["markerCreateAttempted"] = false; }
    else if (change === "extra") { result["extra"] = true; }
    else if (change === "failed-success") { result["failedStep"] = "marker-create"; }
    else { const rows = result["observations"]; assert.ok(Array.isArray(rows)); if (change === "row-order") { rows.reverse(); } else { Reflect.deleteProperty(rows, "0"); } }
    assert.throws(() => validateStartupResult(result, value.input));
  });
}

for (const field of ["phase", "projectUuid", "branchUuid", "ownerUuid", "marker"]) {
  void test(`compiler refuses input accessor ${field} without invocation`, () => {
    const value = startupFixture(); let reads = 0;
    Object.defineProperty(value.input, field, { get(): never { reads += 1; throw new Error("getter"); } });
    assert.throws(() => buildStartupProgram(value.input)); assert.equal(reads, 0);
  });
}

void test("compiler rejects iframe transport options and unbounded target data", () => {
  const value = startupFixture();
  assert.throws(() => buildStartupProgram({ ...value.input, allowTopRealm: true } as StartupInput));
  for (const projectUuid of ["../x", "a".repeat(65), "https://client", ""]) { assert.throws(() => buildStartupProgram({ ...value.input, projectUuid })); }
});

void test("an actual iframe execution realm refuses before any asynchronous read or marker write", async () => {
  const value = startupFixture(); const result = await value.run(true);
  assert.equal(result["ok"], false); assert.equal(result["failedStep"], "startup-before");
  validateStartupResult(result, value.input);
  assert.equal(value.state.calls.length, 0); assert.equal(value.registrations.count, 0); assert.equal(value.rpc.count, 0);
});
