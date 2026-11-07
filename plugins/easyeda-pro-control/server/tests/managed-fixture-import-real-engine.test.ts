import assert from "node:assert/strict";
import { test } from "node:test";
import { loadOperation } from "../src/artifacts.ts";
import { managedFixtureRealEngine } from "./helpers/managed-fixture-real-engine.ts";

void test("real Engine imports through one original HMAC scope, retaining separate environment/import captures and refusing SDK replay", { timeout: 15_000 }, async context => {
  const value = await managedFixtureRealEngine(context, "fixture-real-engine-success");
  const result = await value.run(); assert.equal(result["phase"], "sdk-settled-unverified");
  assert.deepEqual(value.calls.filter(call => call.endsWith("-sdk")), ["environment-sdk", "import-sdk"]);
  const environment = value.exactJournal("fixture-real-engine-success-environment"), operation = value.exactJournal("fixture-real-engine-success");
  assert.deepEqual(operation.bridgeDispatchBeforeOrphan, environment.bridgeDispatchBeforeOrphan);
  assert.deepEqual(operation.bridgeSessionBeforeOrphan, environment.bridgeSessionBeforeOrphan);
  assert.notEqual(operation.executionAuthorityBeforeOrphan?.bindingSha256, environment.executionAuthorityBeforeOrphan?.bindingSha256);
  assert.equal(operation.orphanedCallPossible, false); assert.equal(operation.hardStop, true);
  const nonce = value.cleanup.inspect(operation.operationId)["cleanupNonce"]; assert.ok(typeof nonce === "string");
  value.behavior.terminated = true;
  const bound = { operationId: operation.operationId, cleanupNonce: nonce };
  await value.owner.execute({ action: "observe-cleanup-termination", ...bound });
  await assert.rejects(value.owner.execute({ action: "finish-cleanup", ...bound }), /exact session closure|retirement|closed/u);
  await value.closeOriginalSession(); await value.owner.execute({ action: "finish-cleanup", ...bound });
  assert.equal(value.cleanup.inspect(operation.operationId)["cleanupComplete"], true);
  await assert.rejects(value.run()); assert.equal(value.calls.filter(call => call === "import-sdk").length, 1);
});

void test("real Engine watcher refusal before importer SDK entry preserves terminal no-dispatch and original environment cleanup", { timeout: 15_000 }, async context => {
  const id = "fixture-real-engine-watch-refusal", value = await managedFixtureRealEngine(context, id, { watchFailure: true });
  await assert.rejects(value.run(), /retry is forbidden/u);
  assert.deepEqual(value.calls.filter(call => call.endsWith("-sdk")), ["environment-sdk"]);
  const operation = await loadOperation(id); assert.equal(operation["mutationMayHaveOccurred"], false); assert.equal(operation["orphanedCallPossible"], false);
  assert.equal(operation["state"], "completed");
  const inspected = value.cleanup.inspect(`${id}-environment`); assert.equal(inspected["cleanupAvailable"], true);
  const environment = value.exactJournal(`${id}-environment`);
  assert.throws(() => value.engine.originalSettledTrackedDispatch(environment), /generic terminal/u);
  assert.throws(() => value.engine.originalSettledFixtureEnvironmentDispatch(structuredClone(environment)));
  const nonce = inspected["cleanupNonce"]; assert.ok(typeof nonce === "string");
  value.behavior.terminated = true; await value.closeOriginalSession();
  await value.owner.execute({ action: "observe-cleanup-termination", operationId: `${id}-environment`, cleanupNonce: nonce });
  await value.owner.execute({ action: "finish-cleanup", operationId: `${id}-environment`, cleanupNonce: nonce });
  await value.owner.execute({ action: "release-destination", operationId: id, confirmReleaseRetainedDirectory: true });
  await value.owner.execute({ action: "release-owner", operationId: id, confirmReleaseFixtureOwner: true });
  assert.equal(value.owner.hasActiveReservation(), false);
});

void test("real Engine keeps cleanup unavailable until the original importer Promise and HMAC scope settle", { timeout: 15_000 }, async context => {
  const id = "fixture-real-engine-pending", value = await managedFixtureRealEngine(context, id, { pendingImport: true });
  const work = value.run(); const rejection = assert.rejects(work, /retry is forbidden/u);
  await value.importEntered;
  assert.equal(value.cleanup.inspect(id)["cleanupAvailable"], false);
  assert.throws(() => value.engine.originalSettledTrackedDispatch(value.exactJournal(id)));
  value.rejectImport(); await rejection;
  const operation = value.exactJournal(id); assert.equal(operation.orphanedCallPossible, true);
  const nonce = value.cleanup.inspect(id)["cleanupNonce"]; assert.ok(typeof nonce === "string");
  value.behavior.terminated = true;
  await value.owner.execute({ action: "observe-cleanup-termination", operationId: id, cleanupNonce: nonce });
  await assert.rejects(value.owner.execute({ action: "finish-cleanup", operationId: id, cleanupNonce: nonce }));
  await value.closeOriginalSession(); await value.owner.execute({ action: "finish-cleanup", operationId: id, cleanupNonce: nonce });
  assert.equal(value.calls.filter(call => call === "import-sdk").length, 1);
});

void test("real Engine retains an acknowledged import's publication uncertainty before marker clearing and settles without redispatch", { timeout: 15_000 }, async context => {
  const id = "fixture-real-engine-publication", value = await managedFixtureRealEngine(context, id, { publicationFailure: true });
  await assert.rejects(value.run(), /retry is forbidden/u);
  assert.equal(value.owner.inspect(id)["publicationPending"], true);
  assert.equal(value.exactJournal(id).orphanedCallPossible, true);
  await value.owner.execute({ action: "settle-import-records", operationId: id });
  assert.equal(value.owner.inspect(id)["publicationPending"], false);
  assert.equal(value.exactJournal(id).orphanedCallPossible, true);
  const nonce = value.cleanup.inspect(id)["cleanupNonce"]; assert.ok(typeof nonce === "string");
  value.behavior.terminated = true; await value.closeOriginalSession();
  await value.owner.execute({ action: "observe-cleanup-termination", operationId: id, cleanupNonce: nonce });
  await value.owner.execute({ action: "finish-cleanup", operationId: id, cleanupNonce: nonce });
  assert.equal(value.calls.filter(call => call === "import-sdk").length, 1);
});

void test("actual upstream reproof refusal after beforeDispatch keeps original main quarantine despite no SDK client entry", { timeout: 15_000 }, async context => {
  const id = "fixture-real-engine-upstream-refusal", value = await managedFixtureRealEngine(context, id, { startupRefusal: true });
  await assert.rejects(value.run(), /retry is forbidden/u);
  assert.deepEqual(value.calls.filter(call => call.endsWith("-sdk")), ["environment-sdk"]);
  const journal = value.exactJournal(id); assert.equal(journal.orphanedCallPossible, true); assert.equal(journal.mutationMayHaveOccurred, true);
  assert.equal(value.cleanup.inspect(id)["cleanupAvailable"], true);
});

void test("post-beforeDispatch dispatcher drift clears only no-entry quarantine and keeps cleanup on the last actual environment call", { timeout: 15_000 }, async context => {
  const id = "fixture-real-engine-post-callback", value = await managedFixtureRealEngine(context, id, { replaceDispatcher: true });
  await assert.rejects(value.run(), /retry is forbidden/u);
  const environment = value.exactJournal(`${id}-environment`), operation = value.exactJournal(id);
  assert.deepEqual(value.engine.originalTrackedDispatchStatus(operation), { phase: "managed-fixture-import", settled: true, callToolEntered: false });
  assert.equal(value.engine.originalTrackedDispatchStatus(environment)?.callToolEntered, true);
  assert.deepEqual(value.calls.filter(call => call.endsWith("-sdk")), ["environment-sdk"]);
  assert.equal(value.calls.includes("replaced-dispatcher"), false);
  assert.equal(operation.orphanedCallPossible, false); assert.equal(operation.mutationMayHaveOccurred, false); assert.equal(operation.state, "completed");
  assert.equal(value.cleanup.inspect(id)["cleanupAvailable"], false);
  const nonce = value.cleanup.inspect(environment.operationId)["cleanupNonce"]; assert.ok(typeof nonce === "string");
  value.behavior.terminated = true; await value.closeOriginalSession();
  await value.owner.execute({ action: "observe-cleanup-termination", operationId: environment.operationId, cleanupNonce: nonce });
  await value.owner.execute({ action: "finish-cleanup", operationId: environment.operationId, cleanupNonce: nonce });
  await value.owner.execute({ action: "release-destination", operationId: id, confirmReleaseRetainedDirectory: true });
  await value.owner.execute({ action: "release-owner", operationId: id, confirmReleaseFixtureOwner: true });
  assert.equal(value.owner.hasActiveReservation(), false);
});

void test("a terminal environment with no actual callTool entry cannot receive the narrow completed-read cleanup source", { timeout: 15_000 }, async context => {
  const id = "fixture-real-engine-environment-refused", value = await managedFixtureRealEngine(context, id, { refuseEnvironmentBeforeDispatch: true });
  await assert.rejects(value.run(), /incomplete/u);
  const environment = value.exactJournal(`${id}-environment`);
  assert.deepEqual(value.engine.originalTrackedDispatchStatus(environment), { phase: "managed-fixture-import", settled: true, callToolEntered: false });
  assert.equal(environment.state, "completed"); assert.equal(environment.orphanedCallPossible, false);
  assert.deepEqual(value.calls.filter(call => call.endsWith("-sdk")), []);
  assert.throws(() => value.engine.originalSettledFixtureEnvironmentDispatch(environment));
  assert.equal(value.cleanup.inspect(environment.operationId)["cleanupAvailable"], false);
  assert.equal(value.owner.hasRetainedDestination(), false);
});
