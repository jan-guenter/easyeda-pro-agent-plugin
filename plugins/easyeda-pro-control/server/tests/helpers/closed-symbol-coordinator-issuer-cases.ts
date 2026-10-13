import assert from "node:assert/strict";
import { test } from "node:test";
import { fixture } from "./closed-symbol-coordinator-fixture.ts";
import { assertOriginalClosedSymbolFullEvidence } from "../../src/closed-symbol-coordinator.ts";
import { EasyedaControlEngine } from "../../src/engine.ts";
import { readerCompletion } from "../../src/sqlite-inventory.ts";
import { INPUT } from "./windows-closed-session-fixture.ts";

void test("full evidence issuer accepts only unchanged successful originals and keeps inventories original", async (context) => {
  const f = await fixture(context);
  assert.throws(() => assertOriginalClosedSymbolFullEvidence(f.stage.retained(), f.engine, "unissued"), /original successful/u);
  const result = await f.stage.recordFullEvidence(f.plan);
  const original = assertOriginalClosedSymbolFullEvidence(result, f.engine, result.operationId);
  assert.equal(original.verification.copy, result.copy);
  assert.equal(original.verification.copy.inventory, result.copy.inventory);
  assert.equal(readerCompletion(result.copy.inventory).observedChildClose, true);
  assert.equal(Object.isFrozen(result.copy.inventory), true);
  assert.equal(result.completionProved, false);
  assert.equal(Object.isFrozen(original), true);
  assert.equal(Object.isFrozen(original.baseline), true);
  assert.equal(Object.isFrozen(original.windowArtifacts), true);
  assert.throws(() => assertOriginalClosedSymbolFullEvidence({ ...result }, f.engine, result.operationId), /original successful/u);
  assert.throws(() => assertOriginalClosedSymbolFullEvidence(structuredClone(result), f.engine, result.operationId), /original successful/u);
  assert.throws(() => assertOriginalClosedSymbolFullEvidence(result, f.engine, `${result.operationId}-other`), /original successful/u);
  const otherEngine = new EasyedaControlEngine(f.upstream);
  await otherEngine.controlFingerprintPromise;
  assert.throws(() => assertOriginalClosedSymbolFullEvidence(result, otherEngine, result.operationId), /original successful/u);

  const priorAction = original.journal.nextSafeAction;
  original.journal.nextSafeAction = "caller changed this retained predecessor";
  assert.throws(() => assertOriginalClosedSymbolFullEvidence(result, f.engine, result.operationId), /retained values changed/u);
  original.journal.nextSafeAction = priorAction;
  assert.equal(assertOriginalClosedSymbolFullEvidence(result, f.engine, result.operationId), original);

  const checkpoint = original.baseline.copy.checkpoint, priorHash = checkpoint.sourceSha256;
  assert.equal(Reflect.set(checkpoint, "sourceSha256", "a".repeat(64)), true);
  assert.throws(() => assertOriginalClosedSymbolFullEvidence(result, f.engine, result.operationId), /retained values changed/u);
  assert.equal(Reflect.set(checkpoint, "sourceSha256", priorHash), true);
  assert.equal(assertOriginalClosedSymbolFullEvidence(result, f.engine, result.operationId), original);

  // Runtime JSON/status can remain unchanged while an actual retained helper
  // Capture advances the source-owned lifecycle epoch. The final original copy
  // Authority must be checked synchronously on every issuer lookup.
  await f.owner.supervisor.capture({ ...INPUT, bindingSha256: "8".repeat(64), challengeAttempt: 4 });
  assert.throws(() => assertOriginalClosedSymbolFullEvidence(result, f.engine, result.operationId), /copy authority was invalidated by an intervening lifecycle action/u);
});

void test("a failed saved-read boundary never issues its inspectable edit originals as a full result", async (context) => {
  const f = await fixture(context);
  f.state.onReply = (kind, value): unknown => {
    if (kind === "saved-read") { f.plan["targetUuid"] = "f".repeat(32); }
    return value;
  };
  await assert.rejects(f.stage.recordFullEvidence(f.plan), /changed/u);
  const retained = f.stage.retained();
  const operationId = retained["operationId"];
  assert.equal(typeof operationId, "string");
  assert.throws(() => assertOriginalClosedSymbolFullEvidence(retained, f.engine, String(operationId)), /original successful/u);
  assert.equal(f.state.writes, 1); assert.equal(f.events.filter((value) => value === "normal-close").length, 2);
});
