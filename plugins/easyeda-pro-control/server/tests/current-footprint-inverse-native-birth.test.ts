/** Real factory/private registries with synthetic closed-data admission and inert
 * Linux child pipes. No application, Windows handle or writer proof is issued. */
import assert from "node:assert/strict";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { generateWorkerStartupProtocol } from "../../scripts/generate-worker-startup-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_PROFILE as PROFILE } from "../src/current-footprint-inverse-native-profile.ts";
import { combinedReadyFactoryFixture } from "./helpers/current-footprint-combined-ready-fixture.ts";

function pending(method: unknown, args: readonly unknown[]): Promise<unknown> {
  assert.equal(typeof method, "function"); assert.ok(typeof method === "function");
  const result: unknown = Reflect.apply(method, undefined, args); assert.ok(result instanceof Promise); return result;
}
interface CheckpointModule { requireOriginalCurrentFootprintForwardSavedCheckpoint: (input: unknown) => object; verifyCurrentFootprintForwardSavedCheckpoint: (input: unknown) => Promise<void> }
async function prepared(verify: () => Promise<void> = (): Promise<void> => Promise.resolve(), inverseSourceRefusal = false): Promise<Readonly<{ f: Awaited<ReturnType<typeof combinedReadyFactoryFixture>>; token: object; module: CheckpointModule }>> {
  const held: { prior?: object } = {}, token = Object.freeze({ syntheticDataToken: true });
  const module: CheckpointModule = { requireOriginalCurrentFootprintForwardSavedCheckpoint: (input: unknown): object => {
    assert.equal(input, token); assert.ok(held.prior !== undefined); return held.prior;
  }, verifyCurrentFootprintForwardSavedCheckpoint: (input: unknown): Promise<void> => { assert.equal(input, token); return verify(); } };
  const f = await combinedReadyFactoryFixture("ready", "forward-execution", true, { modules: { "./current-footprint-copy-held-saved-generation.ts": module }, ...(inverseSourceRefusal ? { inverseSourceRefusal: true } : {}) });
  const after = Object.freeze({}), writer = await f.api.startCurrentFootprintForwardExecutionNativeOwner(f.options);
  f.seedSyntheticClosedSnapshot(writer, after); await writer.releaseUnlaunched();
  const saved = await pending(f.api.startCurrentFootprintForwardHeldSavedNativeOwner, [writer, after]);
  assert.ok(saved instanceof f.api.CurrentFootprintCopyHeldSavedNativeOwner); await saved.releaseUnlaunched();
  held.prior = Object.freeze({ writer, owner: saved, writerAfter: after, inventory: Object.freeze({}), projection: Object.freeze({}),
    savedRead: Object.freeze({}), paired: Object.freeze({}), snapshot: Object.freeze({}) });
  return { f, token, module };
}

void test("inverse birth consumes only its original saved data and retains a distinct original helper", async context => {
  const { f, token } = await prepared(), predecessor = f.child();
  context.after(async () => { if (f.child().exitCode === null) { const closed = once(f.child(), "close"); f.child().stdin.end(); await closed; } });
  const owner = await pending(f.api.startCurrentFootprintInverseNativeOwner, [token]); assert.ok(owner instanceof f.api.CurrentFootprintInverseNativeOwner);
  assert.notEqual(f.child(), predecessor); assert.equal(predecessor.exitCode, 0);
  f.api.assertOriginalCurrentFootprintInverseNativeOwner(owner); assert.equal(f.api.originalCurrentFootprintInverseTarget(owner), token);
  assert.equal(owner.status().profile, "footprint-inverse209");
  assert.throws(() => f.api.originalCurrentFootprintInverseTermination(owner), /ORIGINAL_TERMINATION/u);
  const copied: unknown = Object.create(f.api.CurrentFootprintInverseNativeOwner.prototype);
  assert.throws(() => { Reflect.apply(f.api.assertOriginalCurrentFootprintInverseNativeOwner, undefined, [copied]); }, /ORIGINAL_FACTORY/u);
  await assert.rejects(pending(f.api.startCurrentFootprintInverseNativeOwner, [token]), /ALLOCATION_CONSUMED_OR_SOURCE/u);
  await owner.releaseUnlaunched(); assert.equal(f.child().exitCode, 0);
  f.api.assertOriginalCurrentFootprintInverseNativeOwner(owner); assert.equal(f.api.originalCurrentFootprintInverseTarget(owner), token);
  assert.throws(() => f.api.originalCurrentFootprintInverseTermination(owner), /ORIGINAL_TERMINATION/u);
  assert.deepEqual(f.state.actions, ["release-unlaunched", "release-unlaunched", "release-unlaunched"]);
});

void test("inverse qualification refusal closes no invented resource and cannot retry allocation", async () => {
  const failure = new Error("synthetic fresh closed-byte refusal"), { f, token } = await prepared((): Promise<void> => Promise.reject(failure));
  const predecessor = f.child(); await assert.rejects(pending(f.api.startCurrentFootprintInverseNativeOwner, [token]), value => value === failure);
  assert.equal(f.child(), predecessor); assert.equal(predecessor.exitCode, 0);
  assert.deepEqual(Reflect.apply(f.api.currentFootprintInverseAllocationOutcome, undefined, [token]), { state: "no-resource", owner: null });
  await assert.rejects(pending(f.api.startCurrentFootprintInverseNativeOwner, [token]), /ALLOCATION_CONSUMED_OR_SOURCE/u);
  assert.deepEqual(f.state.actions, ["release-unlaunched", "release-unlaunched"]);
});

void test("inverse checkpoint function identity drift refuses before helper allocation", async () => {
  const { f, token, module } = await prepared(); const original = module.verifyCurrentFootprintForwardSavedCheckpoint;
  module.verifyCurrentFootprintForwardSavedCheckpoint = (): Promise<void> => { module.verifyCurrentFootprintForwardSavedCheckpoint = original; return Promise.resolve(); };
  // The factory captures the actual module functions before awaiting them.
  await assert.rejects(pending(f.api.startCurrentFootprintInverseNativeOwner, [token]), /ORIGINAL_PREPARATION/u);
  assert.deepEqual(f.state.actions, ["release-unlaunched", "release-unlaunched"]);
});

void test("postspawn inverse source refusal retains only the original helper through zero-input EOF", async () => {
  let checks = 0; const failure = new Error("synthetic postspawn source refusal");
  const { f, token } = await prepared((): Promise<void> => { checks += 1; return checks > 1 ? Promise.reject(failure) : Promise.resolve(); });
  const prior = f.child(); await assert.rejects(pending(f.api.startCurrentFootprintInverseNativeOwner, [token]), value => value === failure);
  assert.notEqual(f.child(), prior); assert.equal(f.child().exitCode, 0);
  const outcome: unknown = Reflect.apply(f.api.currentFootprintInverseAllocationOutcome, undefined, [token]);
  assert.ok(outcome !== null && typeof outcome === "object" && "owner" in outcome && outcome.owner instanceof f.api.CurrentFootprintInverseNativeOwner);
  assert.equal(outcome.owner.status().helperClosed, true);
  assert.deepEqual(f.state.actions, ["release-unlaunched", "release-unlaunched"]);
});

void test("failed inverse source prerequisite clears busy custody before original unlaunched cleanup", async context => {
  const { f, token } = await prepared(undefined, true);
  context.after(async () => { if (f.child().exitCode === null) { const closed = once(f.child(), "close"); f.child().stdin.end(); await closed; } });
  const owner = await pending(f.api.startCurrentFootprintInverseNativeOwner, [token]); assert.ok(owner instanceof f.api.CurrentFootprintInverseNativeOwner);
  const setup: unknown = Reflect.get(owner, "syntheticInverseSourceRefusalForTest"); assert.equal(typeof setup, "function"); assert.ok(typeof setup === "function"); Reflect.apply(setup, owner, []);
  await assert.rejects(owner.prepareFootprintInverseUi()); assert.equal(owner.status().busy, false);
  await owner.releaseUnlaunched(); assert.equal(f.child().exitCode, 0); assert.equal(owner.status().helperClosed, true);
  assert.deepEqual(f.state.actions, ["release-unlaunched", "release-unlaunched", "release-unlaunched"]);
});

void test("whole native composition is idempotent with original inverse limits and no writer grant", async () => {
  const source = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  const first = generateWorkerStartupProtocol(source); assert.equal(generateWorkerStartupProtocol(first), first);
  assert.equal(first.split("[switch]$FootprintInverse209").length - 1, 1);
  assert.equal(first.split("if ($FootprintInverse209 -and (").length - 1, 1);
  assert.ok(first.includes(`if(footprintInverse209)return ${String(PROFILE.renderer.total)};`));
  assert.ok(first.includes("spatial209?384:componentSpatial209?419:"));
  assert.equal(PROFILE.deleteInvocationAuthorized, false); assert.equal(PROFILE.executionAuthorized, false); assert.equal(PROFILE.saveAuthorized, false);
  assert.ok(first.includes('if(footprintInverseConstructionComplete)throw Error("footprint-inverse-main-construction-consumed")'));
});

void test("an original inverse factory cannot adopt a copied source or constructor receipt", async context => {
  const { f, token } = await prepared();
  context.after(async () => { if (f.child().exitCode === null) { const closed = once(f.child(), "close"); f.child().stdin.end(); await closed; } });
  const owner = await pending(f.api.startCurrentFootprintInverseNativeOwner, [token]); assert.ok(owner instanceof f.api.CurrentFootprintInverseNativeOwner);
  const armProducer:unknown=Reflect.get(owner,"armFootprintInverseProducers"),lookupProducer:unknown=Reflect.get(f.api,"requireOriginalCurrentFootprintInverseProducerOrigin");assert.ok(typeof armProducer==="function"&&typeof lookupProducer==="function");
  assert.throws(()=>Reflect.apply(armProducer,owner,[Object.freeze({profile:"private.current-footprint-inverse-bootstrap-held.v1"})]),/FOOTPRINT_INVERSE_PRODUCER_BOOTSTRAP_ORIGINAL/u);
  assert.throws(()=>Reflect.apply(lookupProducer,undefined,[Object.freeze({profile:"private.current-footprint-inverse-producer-origin.v1"}),owner,token]),/FOOTPRINT_INVERSE_PRODUCER_ORIGINAL/u);
  const copiedSource = Object.freeze({ profile: "private.current-footprint-inverse-worker-origin.v1" });
  const arm: unknown = Reflect.get(owner, "armFootprintInverseConstruction"), lookup: unknown = Reflect.get(f.api, "requireOriginalCurrentFootprintInverseConstruction");
  assert.ok(typeof arm === "function" && typeof lookup === "function"); const attempt: unknown = Reflect.apply(arm, owner, [copiedSource]); assert.ok(attempt instanceof Promise);
  await assert.rejects(attempt, /FOOTPRINT_INVERSE_WORKER_ORIGINAL/u);
  assert.throws(() => { Reflect.apply(lookup, undefined, [Object.freeze({ profile: "private.current-footprint-inverse-construction.v1" }), owner, token]); }, /FOOTPRINT_INVERSE_CONSTRUCTION_ORIGINAL/u);
  const cache: unknown = Reflect.get(f.api, "requireOriginalCurrentFootprintInverseCacheOrigin"); assert.ok(typeof cache === "function");
  assert.throws(() => { Reflect.apply(cache, undefined, [Object.freeze({ profile: "private.current-footprint-inverse-cache-origin.v1" }), owner, token]); }, /FOOTPRINT_INVERSE_CACHE_ORIGINAL_ORIGIN/u);
  const backup: unknown = Reflect.get(f.api, "requireOriginalCurrentFootprintInverseCacheBackup"); assert.ok(typeof backup === "function");
  assert.throws(() => { Reflect.apply(backup, undefined, [Object.freeze({ profile: "private.current-footprint-inverse-cache-backup.v1" }), owner, token]); }, /FOOTPRINT_INVERSE_CACHE_BACKUP_ORIGINAL_GRANT/u);
  const absence: unknown = Reflect.get(f.api, "requireOriginalCurrentFootprintInverseCacheAbsence"); assert.ok(typeof absence === "function");
  assert.throws(() => { Reflect.apply(absence, undefined, [Object.freeze({ profile: "private.current-footprint-inverse-cache-absence.v1" }), owner, token]); }, /FOOTPRINT_INVERSE_CACHE_ABSENCE_ORIGINAL/u);
  const worker: unknown = Reflect.get(owner, "armFootprintInverseWorker"); assert.ok(typeof worker === "function");
  const refused: unknown = Reflect.apply(worker, owner, [(): Promise<void> => Promise.resolve()]); assert.ok(refused instanceof Promise);
  await assert.rejects(refused, /FOOTPRINT_INVERSE_CACHE_ABSENCE_REQUIRED/u);
  const cold:unknown=Reflect.get(owner,"armFootprintInverseColdLoad");assert.ok(typeof cold==="function");
  assert.throws(()=>Reflect.apply(cold,owner,[Object.freeze({profile:"private.current-footprint-inverse-bootstrap-held.v1"})]),/FOOTPRINT_INVERSE_COLD_BOOTSTRAP_ORIGINAL/u);
  const coldLookup:unknown=Reflect.get(f.api,"requireOriginalCurrentFootprintInverseColdLoadOrigin");assert.ok(typeof coldLookup==="function");
  assert.throws(()=>Reflect.apply(coldLookup,undefined,[Object.freeze({profile:"private.current-footprint-inverse-cold-load-origin.v1"}),owner,token]),/FOOTPRINT_INVERSE_COLD_ORIGINAL/u);
  assert.equal(owner.status().busy, false); await owner.releaseUnlaunched();
  assert.deepEqual(f.state.actions, ["release-unlaunched", "release-unlaunched", "release-unlaunched"]);
});
