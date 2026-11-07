/** Synthetic issuance exercises the actual controller. Scene/source data comes
 * from the fixed readonly program in an inert VM, not an EasyEDA owner. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { GENERATED_SCHEMATIC_RELEVANCE_SAVED_READER_FUNCTION as PROGRAM } from "../src/generated-schematic-relevance-saved-reader-function.ts";
import { fixture } from "./generated-schematic-relevance-display-vm.ts";
import { data } from "./generated-schematic-relevance-display-fixture.ts";
import { controllerFixture } from "./helpers/schematic-saved-scene-controller-fixture.ts";

async function prepared(mismatchedBody = false): ReturnType<typeof controllerFixture> {
 const vm = fixture(); vm.edit('for(const [key,value]of Object.entries(op.afterBody))textRecord.body[key]=value;');
 const fn = vm.reference(`(${PROGRAM})`), root = vm.reference("globalThis");
 const args = vm.reference('({target:t,operation:{operationId:op.operationId,textId:op.textId,body:op.afterBody,peers:op.peers,rootIds:op.rootIds}})');
 assert.ok(typeof fn === "function" && args !== null && typeof args === "object" && "target" in args && "operation" in args);
 const tuple: unknown = await Reflect.apply(fn, root, [args.target, "capture", args.operation]);
 const reply: unknown = await Reflect.apply(fn, tuple, [args.target, "observe", args.operation]);
 assert.ok(reply !== null && typeof reply === "object" && "source" in reply && typeof reply.source === "string");
 const source = mismatchedBody ? reply.source.replace('"fontWeight":true', '"fontWeight":false') : reply.source; if (mismatchedBody) { assert.notEqual(source, reply.source); }
 return controllerFixture(data().args, { ...reply, source, windowTabId: "synthetic-saved-window" });
}
void test("one original sequence retains its Promise and seven-row comparison without granting persistence", async () => {
 const value = await prepared(), { api, owner, origin, calls } = value;
 const promise = api.observeOriginalCurrentSchematicRelevanceSavedScene(owner, origin);
 assert.equal(api.observeOriginalCurrentSchematicRelevanceSavedScene(owner, origin), promise);
 const observation = await promise, retained = api.requireOriginalCurrentSchematicRelevanceSavedSceneObservation(observation, owner, origin);
 assert.deepEqual(calls, ["capture", "observe", "release"]); assert.ok(value.state.checks >= 4);
 assert.equal(retained.projection.exactProjectedTextBodyVerified, true); assert.equal(retained.projection.completePeerBodyRosterPreserved, true);
 for (const key of ["originalReaderVerified", "coldLoadVerified", "persistenceVerified", "reopenedVerified", "executionAuthorized"] as const) { assert.equal(retained.projection[key], false); }
 assert.throws(() => api.requireOriginalCurrentSchematicRelevanceSavedSceneObservation({ ...observation }, owner, origin));
 assert.equal(api.observeOriginalCurrentSchematicRelevanceSavedScene(owner, origin), promise); assert.equal(calls.length, 3);
});
void test("lost capture/read acknowledgments and thrown undefined retain failure and release only once", async () => {
 for (const phase of ["capture", "observe"] as const) {
  const { api, owner, origin, calls, state } = await prepared(); state.failPhase = phase; state.throwUndefined = true;
  const promise = api.observeOriginalCurrentSchematicRelevanceSavedScene(owner, origin); await assert.rejects(promise, AggregateError);
  assert.deepEqual(calls, phase === "capture" ? ["capture", "release"] : ["capture", "observe", "release"]);
  assert.equal(api.observeOriginalCurrentSchematicRelevanceSavedScene(owner, origin), promise); await assert.rejects(promise); assert.equal(calls.filter(p => p === "release").length, 1);
 }
});
void test("source drift and lost group release refuse acceptance after one cleanup attempt", async () => {
 for (const mode of ["drift", "release"] as const) {
  const { api, owner, origin, calls, state } = await prepared(); if (mode === "drift") { state.driftOnCheck = 3; } else { state.releaseFails = true; }
  const promise = api.observeOriginalCurrentSchematicRelevanceSavedScene(owner, origin); await assert.rejects(promise);
  assert.deepEqual(calls, ["capture", "observe", "release"]); assert.equal(api.observeOriginalCurrentSchematicRelevanceSavedScene(owner, origin), promise);
 }
 const wrong = await prepared(true);
 await assert.rejects(wrong.api.observeOriginalCurrentSchematicRelevanceSavedScene(wrong.owner, wrong.origin), /EXACT_LITERAL_TEXT_BODY/u);
 assert.deepEqual(wrong.calls, ["capture", "observe", "release"]);
});
