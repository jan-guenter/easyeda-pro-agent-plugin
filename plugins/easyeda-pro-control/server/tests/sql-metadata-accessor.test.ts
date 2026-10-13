import assert from "node:assert/strict";
import { test } from "node:test";
import { isRecord } from "../src/core.ts";
import { metadataPlanForOriginalSymbolSqlPlan, prepareSymbolNewHeadSqlPlan, verifySymbolNewHeadSqlEffect } from "../src/symbol-sql-comparator.ts";
import { IDS, OPERATION, WITNESS, applyEffect, fixture, inventory } from "./helpers/symbol-sql-fixture.ts";

void test("original SQL preparation exposes only a fresh frozen exact retained metadata plan", async () => {
  const value = await fixture();
  const plan = await prepareSymbolNewHeadSqlPlan({ before: value.before, operation: OPERATION, witness: WITNESS });
  const first = metadataPlanForOriginalSymbolSqlPlan(plan), second = metadataPlanForOriginalSymbolSqlPlan(plan);
  assert.notEqual(first, second); assert.notEqual(first.beforeTags, second.beforeTags); assert.deepEqual(first, second);
  assert.equal(first.projectUuid, IDS.project); assert.equal(first.branchUuid, IDS.branch); assert.equal(first.ownerUuid, IDS.actor);
  assert.equal(first.targetUuid, IDS.target); assert.equal(first.beforeTitle, "Original synthetic"); assert.equal(first.desiredTitle, OPERATION.patch.name);
  assert.equal(first.desiredDescription, OPERATION.patch.description); assert.deepEqual(first.beforeTags, ["synthetic"]);
  assert.ok(Object.isFrozen(first) && Object.isFrozen(first.beforeTags) && Object.isFrozen(first.peerTitles));
  assert.equal(Object.hasOwn(first, "executionAuthorized"), false);
  applyEffect(value.path); const after = await inventory(value.path);
  const result = await verifySymbolNewHeadSqlEffect(plan, after);
  assert.equal(result["exactLogicalSqlEffect"], true);
});
void test("cloned, modified, foreign and invented SQL plans cannot expose retained metadata", async () => {
  const { before } = await fixture();
  const plan = await prepareSymbolNewHeadSqlPlan({ before, operation: OPERATION, witness: WITNESS });
  const isolatedUrl = new URL("../src/symbol-sql-comparator.ts?foreign-ownership-registry", import.meta.url).href;
  const isolated: unknown = await import(isolatedUrl); assert.ok(isRecord(isolated));
  const foreignPrepare = isolated["prepareSymbolNewHeadSqlPlan"]; assert.ok(typeof foreignPrepare === "function");
  const foreign: unknown = await Reflect.apply(foreignPrepare, undefined, [{ before, operation: OPERATION, witness: WITNESS }]);
  for (const candidate of [structuredClone(plan), { ...plan, targetUuid: IDS.peer }, foreign, null, undefined, {}, 1]) {
    assert.throws(() => metadataPlanForOriginalSymbolSqlPlan(candidate), /original prepared plan/u);
  }
  assert.equal(Reflect.set(plan, "targetUuid", IDS.peer), false);
  assert.equal(metadataPlanForOriginalSymbolSqlPlan(plan).targetUuid, IDS.target);
});
void test("caller operation/witness mutation cannot replace retained metadata or mutate returned copies", async () => {
  const { before } = await fixture(); const operation = structuredClone(OPERATION), witness = structuredClone(WITNESS);
  const pending = prepareSymbolNewHeadSqlPlan({ before, operation, witness });
  operation.patch.name = "unrequested later name"; operation.target.uuid = IDS.peer;
  Reflect.set(witness, "client", "0".repeat(16));
  const plan = await pending;
  const metadata = metadataPlanForOriginalSymbolSqlPlan(plan);
  assert.equal(metadata.desiredTitle, OPERATION.patch.name); assert.equal(metadata.targetUuid, IDS.target);
  assert.equal(Reflect.set(metadata, "desiredTitle", "changed"), false);
  assert.throws(() => metadata.beforeTags.push("changed"), TypeError);
  assert.deepEqual(metadataPlanForOriginalSymbolSqlPlan(plan), metadata);
});
