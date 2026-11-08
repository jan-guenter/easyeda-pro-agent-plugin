/** The unissued private lifecycle registry accepts no matching JSON or caller
 * callback. No app, file publication, native owner or receipt is created. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { requireOriginalCurrentSchematicRelevanceDisplayWriteFailureClosure } from "../src/current-schematic-relevance-display-write-workflow.ts";

void test("forged original failure closure is refused before any caller method or field is read", () => {
  let calls = 0;
  const token: unknown = Object.create(null, { profile: { get: (): never => { calls += 1; throw new Error("UNEXPECTED_PROFILE"); } }, assertCurrent: { get: (): never => { calls += 1; throw new Error("UNEXPECTED_CALLBACK"); } } });
  assert.throws(() => Reflect.apply(requireOriginalCurrentSchematicRelevanceDisplayWriteFailureClosure, undefined, [token, Object.freeze({}), Object.freeze({})]), /ORIGINAL_FAILURE_CLOSURE/u);
  assert.throws(() => Reflect.apply(requireOriginalCurrentSchematicRelevanceDisplayWriteFailureClosure, undefined, [{ profile: "private.current-schematic-relevance-display-write-failure-closure.v1" }, {}, {}]), /ORIGINAL_FAILURE_CLOSURE/u);
  assert.equal(calls, 0);
});
