/** Actual factory/registry/pipe with inert Linux helpers and explicitly synthetic
 * complete-SQL/source collectors. No native saved-copy or application evidence. */
import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";
import type { CurrentFootprintCopyHeldSavedNativeOwner } from "../src/current-pcb-diagnostic-owner.ts";
import { combinedReadyFactoryFixture } from "./helpers/current-footprint-combined-ready-fixture.ts";

function pending(method: unknown, args: readonly unknown[]): Promise<unknown> {
  assert.equal(typeof method, "function"); assert.ok(typeof method === "function");
  const result: unknown = Reflect.apply(method, undefined, args); assert.ok(result instanceof Promise); return result;
}
async function start(f: Awaited<ReturnType<typeof combinedReadyFactoryFixture>>, writer: object, after: object): Promise<CurrentFootprintCopyHeldSavedNativeOwner> {
  const owner: unknown = await pending(f.api.startCurrentFootprintForwardHeldSavedNativeOwner, [writer, after]);
  assert.ok(owner instanceof f.api.CurrentFootprintCopyHeldSavedNativeOwner); return owner;
}
function requireSaved(f: Awaited<ReturnType<typeof combinedReadyFactoryFixture>>, owner: object, writer: object, after: object): void {
  Reflect.apply(f.api.requireOriginalCurrentFootprintForwardHeldSavedOwner, undefined, [owner, writer, after]);
}


void test("fresh readonly held birth consumes exactly its original released forward-v2 source and retains its own cleanup", async context => {
  const f = await combinedReadyFactoryFixture("ready", "forward-execution", true);
  const writer = await f.api.startCurrentFootprintForwardExecutionNativeOwner(f.options);
  context.after(async () => { if (f.child().exitCode === null) { const closed = once(f.child(), "close"); f.child().stdin.end(); await closed; } });
  const after = Object.freeze({}); f.seedSyntheticClosedSnapshot(writer, after);
  await assert.rejects(pending(f.api.startCurrentFootprintForwardHeldSavedNativeOwner, [writer, after]), /PREDECESSOR_RELEASE_REQUIRED/u);
  assert.equal(f.api.currentFootprintForwardHeldSavedAllocationOutcome(writer).status, "not-attempted");
  await writer.releaseUnlaunched(); const originalChild = f.child();
  await assert.rejects(pending(f.api.startCurrentFootprintCopyHeldSavedNativeOwner, [writer, after]), /ORIGINAL_OWNER/u);
  const saved = await start(f, writer, after);
  assert.notEqual(f.child(), originalChild); assert.equal(originalChild.exitCode, 0);
  assert.equal(saved.status().profile, "worker-startup-footprint-held-saved209");
  requireSaved(f, saved, writer, after);
  const outcome = f.api.currentFootprintForwardHeldSavedAllocationOutcome(writer); assert.equal(outcome.owner, saved); assert.equal(outcome.status, "retained");
  assert.throws(() => { requireSaved(f, saved, writer, {}); });
  const copied: unknown = Object.create(f.api.CurrentFootprintCopyHeldSavedNativeOwner.prototype); assert.ok(copied !== null && typeof copied === "object");
  assert.throws(() => { requireSaved(f, copied, writer, after); });
  await assert.rejects(pending(f.api.startCurrentFootprintForwardHeldSavedNativeOwner, [writer, after]), /ALLOCATION_CONSUMED/u);
  assert.deepEqual(f.state.actions, ["release-unlaunched"]);
  await saved.releaseUnlaunched(); requireSaved(f, saved, writer, after);
  assert.equal(f.child().exitCode, 0); assert.deepEqual(f.state.actions, ["release-unlaunched", "release-unlaunched"]);
});

void test("new held birth retains an unresolved spawn instead of calling it no-resource or allocating again", async () => {
  const f = await combinedReadyFactoryFixture("saved-spawn-refusal", "forward-execution", true);
  const after = Object.freeze({}), writer = await f.api.startCurrentFootprintForwardExecutionNativeOwner(f.options);
  f.seedSyntheticClosedSnapshot(writer, after); await writer.releaseUnlaunched();
  await assert.rejects(pending(f.api.startCurrentFootprintForwardHeldSavedNativeOwner, [writer, after]), /Synthetic saved spawn/u);
  assert.deepEqual(f.api.currentFootprintForwardHeldSavedAllocationOutcome(writer), { status: "unresolved", owner: null });
  await assert.rejects(pending(f.api.startCurrentFootprintForwardHeldSavedNativeOwner, [writer, after]), /ALLOCATION_CONSUMED/u);
  assert.deepEqual(f.state.actions, ["release-unlaunched"]);
});

void test("an actual postspawn held constructor refusal retains and closes only the original never-written helper", async context => {
  let checks = 0; const refusal = new Error("synthetic held constructor failure");
  const f = await combinedReadyFactoryFixture("ready", "forward-execution", true, { modules: {
    "./current-pcb-209-actor-clock-source.ts": { requireCurrentPcb209ActorClockSourceQualification: (): void => { checks += 1; if (checks > 1) { throw refusal; } } },
  } });
  const after = Object.freeze({}), writer = await f.api.startCurrentFootprintForwardExecutionNativeOwner(f.options);
  f.seedSyntheticClosedSnapshot(writer, after); await writer.releaseUnlaunched();
  context.after(async () => { if (f.child().exitCode === null) { await once(f.child(), "close"); } });
  await assert.rejects(pending(f.api.startCurrentFootprintForwardHeldSavedNativeOwner, [writer, after]), error => error === refusal);
  const outcome = f.api.currentFootprintForwardHeldSavedAllocationOutcome(writer);
  assert.equal(outcome.status, "closed-before-owner"); assert.equal(outcome.owner, null);
  assert.ok("helperClosed" in outcome); assert.equal(outcome.helperClosed, true); assert.equal(outcome.eofAttempted, true); assert.equal(outcome.helperExitCode, 0);
  assert.deepEqual(f.state.actions, ["release-unlaunched"]);
});
