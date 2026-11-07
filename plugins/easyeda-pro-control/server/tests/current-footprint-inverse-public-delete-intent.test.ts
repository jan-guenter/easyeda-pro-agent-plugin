/** Actual original-factory/token boundaries only. No native allocation. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { consumeCurrentFootprintInversePublicDeleteIntent, enrollCurrentFootprintInversePublicDeleteIntent, requireOriginalCurrentFootprintInversePublicDeleteIntent } from "../src/current-footprint-inverse-public-delete-intent.ts";
import { CurrentFootprintInverseNativeOwner } from "../src/current-footprint-inverse-native-owner.ts";

void test("copied inverse public-delete intent and caller-owned receivers refuse with zero property traps", () => {
  let reads = 0; const trap = (): never => { reads += 1; throw new Error("caller getter"); };
  const token = Object.freeze({ profile: "private.current-footprint-inverse-public-delete-intent.v1" });
  const fake = Object.defineProperty({}, "prepared", { get: trap }); const proxy = new Proxy({}, { get: trap, getPrototypeOf: trap });
  for (const owner of [fake, proxy, Object.create(CurrentFootprintInverseNativeOwner.prototype)]) {
    // oxlint-disable-next-line typescript/unbound-method -- Invalid receivers test the actual private original-factory gate.
    assert.throws(() => Reflect.apply(CurrentFootprintInverseNativeOwner.prototype.prepareFootprintInversePublicDeleteIntent, owner, []));
    for (const lookup of [requireOriginalCurrentFootprintInversePublicDeleteIntent, enrollCurrentFootprintInversePublicDeleteIntent, consumeCurrentFootprintInversePublicDeleteIntent]) {
      assert.throws(() => Reflect.apply(lookup, undefined, [token, owner, fake]));
    }
  }
  assert.equal(reads, 0);
});
