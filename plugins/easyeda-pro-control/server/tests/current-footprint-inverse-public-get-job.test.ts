/** The thin GET contract cannot issue a job from source-shaped JSON. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { requireOriginalCurrentFootprintInversePublicGetJob } from "../src/current-footprint-inverse-public-get-job.ts";

void test("copied GET labels and undefined tags never reach an unissued original registry", () => {
  let effects = 0; const token = { profile: "private.current-footprint-inverse-public-get-job.v1", get nativeEnvelope(): never { effects += 1; throw new Error("getter"); } };
  assert.throws(() => Reflect.apply(requireOriginalCurrentFootprintInversePublicGetJob, undefined, [token, {}, {}]), /FOOTPRINT_INVERSE_PUBLIC_GET_JOB_ORIGINAL/u); assert.equal(effects, 0);
  // oxlint-disable-next-line unicorn/prefer-structured-clone -- The contract specifically rejects JSON serialization dropping an own undefined field.
  const need = { uuid: "a".repeat(32), need: undefined }; assert.equal(Object.hasOwn(need, "need"), true); const json: unknown = JSON.parse(JSON.stringify(need)); assert.ok(json !== null && typeof json === "object"); assert.equal(Object.hasOwn(json, "need"), false);
});
