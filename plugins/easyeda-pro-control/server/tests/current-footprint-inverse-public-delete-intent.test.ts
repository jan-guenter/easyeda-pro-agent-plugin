/** Actual original-factory/token boundaries only. No native allocation. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { consumeCurrentFootprintInversePublicDeleteIntent, enrollCurrentFootprintInversePublicDeleteIntent, requireOriginalCurrentFootprintInversePublicDeleteIntent } from "../src/current-footprint-inverse-public-delete-intent.ts";
import { requireOriginalCurrentFootprintInversePublicDeleteCall } from "../src/current-footprint-inverse-public-delete-call.ts";
import { CurrentFootprintInversePublicServiceObserver } from "../src/current-footprint-inverse-public-service-observer.ts";
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

void test("written-looking caller DTO cannot issue an original public call or invoke its supplied callbacks", () => {
  let reads = 0; const trap = (): never => { reads += 1; throw new Error("caller callback"); };
  const packet = Object.freeze({ profile: "private.current-footprint-inverse-public-delete-call.v1", written: Promise.resolve(), assertCurrent: trap, assertOriginalWritten: trap });
  const owner = new Proxy({}, { get: trap, getPrototypeOf: trap });
  assert.throws(() => Reflect.apply(requireOriginalCurrentFootprintInversePublicDeleteCall, undefined, [packet, owner, owner])); assert.equal(reads, 0);
});

void test("source-shaped service origin cannot borrow the original SDK holder or read caller getters", () => {
  let reads = 0; const trap = (): never => { reads += 1; throw new Error("caller getter"); };
  const origin = Object.freeze({ profile: "private.current-footprint-inverse-public-service-origin.v1" } as const);
  const prepared = Object.freeze({ profile: "private.current-footprint-forward-saved-checkpoint.v1" } as const);
  const owner = new Proxy({}, { get: trap, getPrototypeOf: trap });
  assert.throws(() => new CurrentFootprintInversePublicServiceObserver(origin, owner, prepared)); assert.equal(reads, 0);
});
