import assert from "node:assert/strict";
import { test } from "node:test";
import { loadOperation, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
import { ordinaryTrackedCleanupFixture } from "./helpers/ordinary-tracked-cleanup-fixture.ts";

void test("original tracked cleanup closes once, proves original root/Job and old HMAC lease settlement, then records unknown effects", async context => {
  const value = await ordinaryTrackedCleanupFixture(context, "sch209-open-cleanup-success");
  await assert.rejects(value.work, /lost native reply/u);
  const inspected = value.cleanup.inspect(value.journal.operationId), nonce = inspected["cleanupNonce"]; assert.equal(typeof nonce, "string");
  assert.ok(typeof nonce === "string");
  const bound = { operationId: value.journal.operationId, cleanupNonce: nonce };
  await value.cleanup.run({ action: "request-cleanup-close", ...bound, confirmNormalClose: true, acceptUnknownFileEffects: true });
  await assert.rejects(value.cleanup.run({ action: "request-cleanup-close", ...bound, confirmNormalClose: true, acceptUnknownFileEffects: true }));
  assert.equal(value.calls.filter(call => call === "normal-close").length, 1);
  await value.cleanup.run({ action: "observe-cleanup-termination", ...bound });
  await assert.rejects(value.cleanup.run({ action: "finish-cleanup", ...bound }));
  value.behavior.terminated = true;
  await value.cleanup.run({ action: "observe-cleanup-termination", ...bound });
  await assert.rejects(value.cleanup.run({ action: "finish-cleanup", ...bound }), /HMAC session or lease still pending/u);
  const stillQuarantined = await loadOperation(value.journal.operationId);
  assert.equal(stillQuarantined["orphanedCallPossible"], true);
  value.behavior.sessionClosed = true; value.behavior.leaseReleased = true;
  const completed = await value.cleanup.run({ action: "finish-cleanup", ...bound });
  assert.equal(completed["cleanupComplete"], true); assert.equal(completed["navigationEffects"], "unknown");
  const journal = await loadOperation(value.journal.operationId);
  assert.equal(journal["orphanedCallPossible"], false); assert.equal(journal["state"], "completed");
  assert.equal(journal["mutationMayHaveOccurred"], true); assert.equal(journal["saved"], false);
  assert.equal(journal["reopened"], false); assert.equal(journal["runtimeRestartChallenge"], undefined);
  assert.equal(value.calls.filter(call => call === "native-call").length, 1); assert.equal(value.calls.at(-1), "release-capture");
  await assert.rejects(value.cleanup.run({ action: "finish-cleanup", ...bound }));
});

void test("pending native Promise, copied historical journal, wrong nonce and changed original owner cannot start cleanup", async context => {
  const value = await ordinaryTrackedCleanupFixture(context, "sch209-open-cleanup-pending", { deferred: true });
  await value.nativeEntered;
  assert.equal(value.cleanup.inspect(value.journal.operationId)["cleanupAvailable"], false);
  assert.throws(() => value.engine.originalSettledTrackedDispatch(value.journal));
  value.settle(); await assert.rejects(value.work, /lost native reply/u);
  assert.throws(() => value.engine.originalSettledTrackedDispatch(structuredClone(value.journal)));
  await assert.rejects(value.cleanup.run({ action: "request-cleanup-close", operationId: value.journal.operationId, cleanupNonce: "wrong".repeat(12),
    confirmNormalClose: true, acceptUnknownFileEffects: true }));
  assert.equal(value.calls.includes("normal-close"), false);
  const nonce = value.cleanup.inspect(value.journal.operationId)["cleanupNonce"]; assert.ok(typeof nonce === "string");
  value.behavior.launchCurrent = false;
  await assert.rejects(value.cleanup.run({ action: "request-cleanup-close", operationId: value.journal.operationId, cleanupNonce: nonce,
    confirmNormalClose: true, acceptUnknownFileEffects: true }));
  assert.equal(value.calls.includes("normal-close"), false);
});

void test("a settled acknowledged call with later failed checks can close without replacement or duplicate capture release", async context => {
  const value = await ordinaryTrackedCleanupFixture(context, "sch209-open-cleanup-acknowledged", { settledResult: true }); await value.work;
  assert.equal(value.journal.orphanedCallPossible, false);
  const nonce = value.cleanup.inspect(value.journal.operationId)["cleanupNonce"]; assert.ok(typeof nonce === "string");
  const bound = { operationId: value.journal.operationId, cleanupNonce: nonce };
  value.behavior.terminated = true; value.behavior.sessionClosed = true; value.behavior.leaseReleased = true;
  await value.cleanup.run({ action: "observe-cleanup-termination", ...bound }); await value.cleanup.run({ action: "finish-cleanup", ...bound });
  assert.equal(value.calls.filter(call => call === "release-capture").length, 1);
  assert.equal(value.calls.filter(call => call === "native-call").length, 1);
});

void test("lost close-intent artifact acknowledgment settles exact retained bytes before the first and only native close", async context => {
  let failed = false;
  const value = await ordinaryTrackedCleanupFixture(context, "sch209-open-cleanup-artifact", { cleanupDependencies: {
    writePhaseArtifact: async (id, sequence, phase, record) => {
      const result = await writePhaseArtifact(id, sequence, phase, record);
      if (phase === "cleanup-normal-close-intent" && !failed) { failed = true; throw new Error("synthetic artifact acknowledgment lost"); }
      return result;
    },
  } });
  await assert.rejects(value.work, /lost native reply/u);
  const nonce = value.cleanup.inspect(value.journal.operationId)["cleanupNonce"]; assert.ok(typeof nonce === "string");
  const bound = { operationId: value.journal.operationId, cleanupNonce: nonce };
  await assert.rejects(value.cleanup.run({ action: "request-cleanup-close", ...bound, confirmNormalClose: true, acceptUnknownFileEffects: true }), /artifact acknowledgment/u);
  assert.equal(value.calls.includes("normal-close"), false);
  assert.equal(value.cleanup.inspect(value.journal.operationId)["cleanupPublicationPending"], true);
  await assert.rejects(value.cleanup.run({ action: "observe-cleanup-termination", ...bound }));
  await value.cleanup.run({ action: "settle-cleanup-records", ...bound });
  await value.cleanup.run({ action: "settle-cleanup-records", ...bound });
  assert.equal(value.calls.filter(call => call === "normal-close").length, 1);
  assert.equal(value.journal.sequence, 2);
});

void test("lost terminal journal acknowledgment settles the original consumed nonce without repeating close or release", async context => {
  let failed = false, terminalWrites = 0;
  const value = await ordinaryTrackedCleanupFixture(context, "sch209-open-cleanup-terminal", { cleanupDependencies: {
    updateOperation: async journal => {
      const result = await updateOperation(journal);
      if (journal["originalTrackedOpenCleanup"] !== undefined) {
        terminalWrites += 1;
        if (!failed) { failed = true; throw new Error("synthetic terminal acknowledgment lost"); }
      }
      return result;
    },
  } });
  await assert.rejects(value.work, /lost native reply/u);
  const nonce = value.cleanup.inspect(value.journal.operationId)["cleanupNonce"]; assert.ok(typeof nonce === "string");
  const bound = { operationId: value.journal.operationId, cleanupNonce: nonce };
  value.behavior.terminated = true; value.behavior.sessionClosed = true; value.behavior.leaseReleased = true;
  await value.cleanup.run({ action: "observe-cleanup-termination", ...bound });
  await assert.rejects(value.cleanup.run({ action: "finish-cleanup", ...bound }), /terminal acknowledgment/u);
  assert.throws(() => value.engine.originalSettledTrackedDispatch(value.journal), /consumed/u);
  assert.equal(value.journal.orphanedCallPossible, true);
  const published = await loadOperation(value.journal.operationId); assert.equal(published["orphanedCallPossible"], false);
  assert.equal(value.cleanup.inspect(value.journal.operationId)["cleanupPublicationPending"], true);
  const completed = await value.cleanup.run({ action: "settle-cleanup-records", ...bound });
  assert.equal(completed["cleanupComplete"], true); assert.equal(terminalWrites, 1);
  assert.equal(value.calls.filter(call => call === "release-capture").length, 1);
  assert.equal(value.calls.filter(call => call === "native-call").length, 1);
});

void test("publication settlement refuses a valid foreign journal change instead of overwriting it or closing", async context => {
  const value = await ordinaryTrackedCleanupFixture(context, "sch209-open-cleanup-foreign", { cleanupDependencies: {
    updateOperation: (): Promise<never> => Promise.reject(new Error("synthetic local publication unavailable")),
  } });
  await assert.rejects(value.work, /lost native reply/u);
  const nonce = value.cleanup.inspect(value.journal.operationId)["cleanupNonce"]; assert.ok(typeof nonce === "string");
  const bound = { operationId: value.journal.operationId, cleanupNonce: nonce };
  await assert.rejects(value.cleanup.run({ action: "request-cleanup-close", ...bound, confirmNormalClose: true, acceptUnknownFileEffects: true }), /publication unavailable/u);
  const foreign = structuredClone(value.journal); foreign.nextSafeAction = "Different independently valid journal content"; await updateOperation(foreign);
  await assert.rejects(value.cleanup.run({ action: "settle-cleanup-records", ...bound }));
  const preserved = await loadOperation(value.journal.operationId); assert.equal(preserved["nextSafeAction"], foreign.nextSafeAction);
  assert.equal(value.calls.includes("normal-close"), false);
});

void test("the managed fixture phase uses the same original-only cleanup without a schematic target or replay", async context => {
  const value = await ordinaryTrackedCleanupFixture(context, "sch209-open-cleanup-fixture", { profile: "managed-fixture-import209-v1", phase: "managed-fixture-import" });
  await assert.rejects(value.work, /lost native reply/u);
  const nonce = value.cleanup.inspect(value.journal.operationId)["cleanupNonce"]; assert.ok(typeof nonce === "string");
  const bound = { operationId: value.journal.operationId, cleanupNonce: nonce };
  value.behavior.terminated = true; value.behavior.sessionClosed = true; value.behavior.leaseReleased = true;
  await value.cleanup.run({ action: "observe-cleanup-termination", ...bound });
  await value.cleanup.run({ action: "finish-cleanup", ...bound });
  const journal = await loadOperation(value.journal.operationId), proof = journal["originalTrackedOpenCleanup"];
  assert.ok(typeof proof === "object" && proof !== null && "originalPhase" in proof); assert.equal(proof.originalPhase, "managed-fixture-import");
  assert.equal(value.calls.filter(call => call === "native-call").length, 1);
});

void test("an uncertain original normal close remains consumed through local settlement and termination cleanup", async context => {
  const value = await ordinaryTrackedCleanupFixture(context, "sch209-open-cleanup-close-lost", { normalCloseUncertain: true });
  await assert.rejects(value.work, /lost native reply/u);
  const nonce = value.cleanup.inspect(value.journal.operationId)["cleanupNonce"]; assert.ok(typeof nonce === "string");
  const bound = { operationId: value.journal.operationId, cleanupNonce: nonce };
  await assert.rejects(value.cleanup.run({ action: "request-cleanup-close", ...bound, confirmNormalClose: true, acceptUnknownFileEffects: true }), /normal-close acknowledgment/u);
  const observed = await value.cleanup.run({ action: "settle-cleanup-records", ...bound });
  assert.equal(observed["cleanupCloseDispatched"], true); assert.equal(observed["cleanupCloseAcknowledged"], false);
  value.behavior.terminated = true; value.behavior.sessionClosed = true; value.behavior.leaseReleased = true;
  await value.cleanup.run({ action: "observe-cleanup-termination", ...bound }); await value.cleanup.run({ action: "finish-cleanup", ...bound });
  assert.equal(value.calls.filter(call => call === "normal-close").length, 1);
  assert.equal(value.calls.filter(call => call === "native-call").length, 1);
});

void test("replacement cleanup isolation, source issuer or closed-session proof functions refuse before native close", async context => {
  for (const method of ["assertRecoveryOperationIsolated", "originalSettledTrackedDispatch", "assertClosedAuthenticatedBridgeDispatchReleased"] as const) {
    const value = await ordinaryTrackedCleanupFixture(context, `sch209-open-cleanup-method-${method.toLowerCase()}`);
    await assert.rejects(value.work, /lost native reply/u);
    const nonce = value.cleanup.inspect(value.journal.operationId)["cleanupNonce"]; assert.ok(typeof nonce === "string");
    const replacement = (): never => { assert.fail(`Replaced cleanup proof ${method} was invoked`); };
    Object.defineProperty(method === "assertClosedAuthenticatedBridgeDispatchReleased" ? value.engine.upstream : value.engine, method, { value: replacement });
    await assert.rejects(value.cleanup.run({ action: "request-cleanup-close", operationId: value.journal.operationId, cleanupNonce: nonce,
      confirmNormalClose: true, acceptUnknownFileEffects: true }));
    assert.equal(value.calls.includes("normal-close"), false);
  }
});
