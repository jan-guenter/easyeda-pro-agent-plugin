import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Text } from "../src/core.ts";
import { CURRENT_FOOTPRINT_HELD_CACHE_FRAME_TRANSITION_BYTES, currentFootprintHeldCacheFrameTargetTransitionSchema,
  issueCurrentFootprintHeldCacheFrameTargetTransition, takeCurrentFootprintHeldCacheFrameTargetTransition } from "../src/current-footprint-held-cache-frame-transition.ts";

const message = "PCB_DIAGNOSTIC_OWNER_FRAME_TARGET_CHANGED";
const target = { targetId: "original-page", type: "page", url: "https://client/editor?cll=info", title: "Private initial title", attached: false };

void test("issued original errors retain only bounded full-inventory hashes and fixed changed-field flags", () => {
  const after = [{ ...target, title: "Private final title", future: { privateUrl: "https://private.invalid" } }];
  const error = new Error(message), keys = Object.getOwnPropertyNames(error);
  assert.equal(issueCurrentFootprintHeldCacheFrameTargetTransition(error, [target], after, target.targetId), error);
  assert.equal(error.message, message); assert.deepEqual(Object.getOwnPropertyNames(error), keys); assert.equal(JSON.stringify(error), "{}");
  const packet = takeCurrentFootprintHeldCacheFrameTargetTransition(error); assert.ok(packet);
  assert.equal(packet.beforeInventorySha256, sha256Text(JSON.stringify([target]))); assert.equal(packet.afterInventorySha256, sha256Text(JSON.stringify(after)));
  assert.equal(packet.targetPresent, true); assert.equal(packet.changedFields.title, true); assert.equal(packet.changedFields.other, true);
  assert.equal(packet.changedFields.url, false); assert.equal(packet.changedFields.attached, false);
  assert.ok(Buffer.byteLength(JSON.stringify(packet)) <= CURRENT_FOOTPRINT_HELD_CACHE_FRAME_TRANSITION_BYTES);
  assert.doesNotMatch(JSON.stringify(packet), /Private|private\.invalid|https:\/\//u); assert.ok(Object.isFrozen(packet) && Object.isFrozen(packet.changedFields));
  assert.equal(takeCurrentFootprintHeldCacheFrameTargetTransition(error), null);
  assert.equal(takeCurrentFootprintHeldCacheFrameTargetTransition(new Error(message)), null);
  issueCurrentFootprintHeldCacheFrameTargetTransition(error, [target], after, target.targetId);
  assert.equal(takeCurrentFootprintHeldCacheFrameTargetTransition(error), null);
  assert.throws(() => currentFootprintHeldCacheFrameTargetTransitionSchema.parse({ ...packet, rawTitle: "private" }));
  assert.throws(() => currentFootprintHeldCacheFrameTargetTransitionSchema.parse({ ...packet, changedFields: { ...packet.changedFields, title: "private" } }));
});

void test("target disappearance and field-order-only drift remain distinguishable without raw data", () => {
  const missing = new Error(message); issueCurrentFootprintHeldCacheFrameTargetTransition(missing, [target], [], target.targetId);
  const disappeared = takeCurrentFootprintHeldCacheFrameTargetTransition(missing); assert.ok(disappeared);
  assert.equal(disappeared.targetPresent, false); assert.equal(disappeared.changedFields.targetId, true);
  const changed = new Error(message), reordered = Object.fromEntries(Object.entries(target).toReversed());
  issueCurrentFootprintHeldCacheFrameTargetTransition(changed, [target], [reordered], target.targetId);
  const packet = takeCurrentFootprintHeldCacheFrameTargetTransition(changed); assert.ok(packet);
  assert.equal(packet.changedFields.propertyOrder, true); assert.equal(packet.changedFields.title, false); assert.equal(packet.changedFields.other, false);
  assert.notEqual(packet.beforeInventorySha256, packet.afterInventorySha256);
  const invalid = new Error(message);
  assert.equal(issueCurrentFootprintHeldCacheFrameTargetTransition(invalid, [target], [target, target], target.targetId), invalid);
  assert.equal(takeCurrentFootprintHeldCacheFrameTargetTransition(invalid), null); assert.equal(invalid.message, message);
});
