/** Native factory logic/private registries with inert synthetic child pipes.
 * The separate Windows ready/EOF case establishes the actual native packet. */
import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";
import { CURRENT_FOOTPRINT_COMBINED_READY, decodeCurrentFootprintCombinedReady } from "../src/current-footprint-combined-ready.ts";
import { combinedReadyFactoryFixture } from "./helpers/current-footprint-combined-ready-fixture.ts";

void test("combined factory returns only after the original ready packet and writes no input before it", async context => {
  const f = await combinedReadyFactoryFixture("ready");
  const pending = f.api.startCurrentFootprintCombinedNativeOwner(f.options);
  const owner = await pending;
  context.after(async () => { if (!owner.status().helperClosed) { const closed = once(f.child(), "close"); f.child().stdin.end(); await closed; } });
  assert.equal(f.state.readySent, true); assert.deepEqual({ writes: f.state.writes, bytes: f.state.bytes }, { writes: 0, bytes: 0 });
  assert.equal(owner.status().combinedReadiness?.readinessObserved, true);
  await owner.releaseUnlaunched(); assert.equal(f.child().exitCode, 0);
});

void test("pre-ready stderr or malformed packets yield only an original closed zero-input factory failure", async () => {
  for (const mode of ["stderr-close", "malformed", "wrong-challenge", "oversize-no-newline"] as const) {
    const f = await combinedReadyFactoryFixture(mode);
    let failure: unknown;
    try { await f.api.startCurrentFootprintCombinedNativeOwner(f.options); } catch (error) { failure = error; }
    assert.ok(failure instanceof Error);
    assert.deepEqual({ writes: f.state.writes, bytes: f.state.bytes }, { writes: 0, bytes: 0 });
    const proof = f.api.requireCurrentFootprintCombinedUnlaunchedFactoryFailure(failure, f.options);
    assert.deepEqual(proof, { profile: "private.current-footprint-combined-before-launch-failure.v1", helperTransportClosed: true,
      launchRequestWritten: false, applicationLaunchDispatched: false, terminationProved: false });
    assert.equal(Object.isFrozen(proof), true);
    assert.equal(f.api.requireCurrentFootprintCombinedUnlaunchedFactoryFailure(failure, f.options), proof);
    assert.equal(f.api.requireCurrentFootprintCombinedUnlaunchedFactoryFailure(structuredClone(failure), f.options), null);
    assert.equal(f.api.requireCurrentFootprintCombinedUnlaunchedFactoryFailure(failure, { ...f.options }), null);
    assert.equal(f.api.requireCurrentFootprintCombinedUnlaunchedFactoryFailure(new Error("same message"), f.options), null);
    const diagnostics = f.api.currentFootprintCombinedFactoryFailureDiagnostics(failure, f.options);
    assert.equal(diagnostics?.helperClosed, true); assert.equal(diagnostics.readinessObserved, false);
    assert.equal(diagnostics.launchInvoked, false); assert.equal(diagnostics.stdinBytesWritten, 0);
    assert.doesNotMatch(JSON.stringify(diagnostics), /private-synthetic-diagnostic/u);
    assert.equal(diagnostics.stderr.bytes > 0, mode === "stderr-close");
    if (mode === "oversize-no-newline") { assert.equal(diagnostics.failure, "COMBINED_READY_BOUND"); }
  }
});

void test("unobserved child closure cannot issue before-dispatch evidence or consume another owner's options", async () => {
  const f = await combinedReadyFactoryFixture("stderr-delayed-close");
  let failure: unknown;
  try { await f.api.startCurrentFootprintCombinedNativeOwner(f.options); } catch (error) { failure = error; }
  assert.ok(failure instanceof Error);
  assert.equal(f.api.requireCurrentFootprintCombinedUnlaunchedFactoryFailure(failure, f.options), null);
  assert.equal(f.api.currentFootprintCombinedFactoryFailureDiagnostics(failure, f.options)?.helperClosed, false);
  await once(f.child(), "close");
  assert.equal(f.api.requireCurrentFootprintCombinedUnlaunchedFactoryFailure(failure, f.options)?.helperTransportClosed, true);
  assert.equal(f.state.bytes, 0);
});

void test("ready packets remain data-only and reject root/process fields and caller accessors", () => {
  const packet = { schema: CURRENT_FOOTPRINT_COMBINED_READY.schema, challenge: "a".repeat(32), helperInstance: "a".repeat(32), jobId: "b".repeat(32),
    creationState: "not-entered", processCreated: false, emptyJob: true, pipesChecked: true };
  assert.equal(Object.isFrozen(decodeCurrentFootprintCombinedReady(packet)), true);
  for (const extra of [{ processCreated: true }, { rootPid: 123 }, { emptyJob: false }, { jobId: `${"b".repeat(32)}\n` }]) {
    assert.throws(() => decodeCurrentFootprintCombinedReady({ ...packet, ...extra }));
  }
  let invoked = 0;
  assert.throws(() => decodeCurrentFootprintCombinedReady({ ...packet, get helperInstance(): string { invoked += 1; return "a".repeat(32); } }));
  assert.equal(invoked, 0);
});
