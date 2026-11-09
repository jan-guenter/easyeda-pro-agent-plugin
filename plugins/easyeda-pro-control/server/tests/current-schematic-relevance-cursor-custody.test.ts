/** Synthetic pending-command custody. No original owner or request is created. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentSchematicRelevanceRawCursor } from "../src/current-schematic-relevance-action-raw-cursor.ts";
import { CurrentSchematicRelevanceRunPrefixCursor } from "../src/current-schematic-relevance-run-prefix-cursor.ts";

void test("Relevance raw cursor refuses a phantom null command and retains its first real reply", () => {
  const cursor = new CurrentSchematicRelevanceRawCursor("original_frame", "original_holder");
  assert.throws(() => Reflect.apply(cursor.reserve.bind(cursor), cursor, [null]), /SCHEMATIC_RELEVANCE_RAW_ORIGINAL_CURSOR/u);
  assert.throws(() => Reflect.apply(cursor.accept.bind(cursor), cursor, [null, {}]), /SCHEMATIC_RELEVANCE_RAW_ORIGINAL_CURSOR/u);
  const command = cursor.next(); assert.ok(command !== null); assert.equal(command.phase, "schematic-raw-frame"); assert.equal(cursor.next(), command);
  assert.throws(() => { cursor.reserve(structuredClone(command)); }); cursor.reserve(command);
  assert.throws(() => Reflect.apply(cursor.accept.bind(cursor), cursor, [null, {}]), /SCHEMATIC_RELEVANCE_RAW_ORIGINAL_CURSOR/u);
  cursor.accept(command, { result: { type: "object", subtype: "array", className: "Array", description: "Array(5)", objectId: "original_roots" } });
  assert.equal(cursor.next()?.phase, "schematic-raw-properties");
});

void test("Relevance prefix cursor refuses a phantom null command before starting its generator", () => {
  const raw = { nativeObjectId: "original_native", referencesObjectId: "original_references", objectsObjectId: "original_objects", snapshotObjectId: "original_snapshot", guardObjectId: "original_guard", originalReferenceSlots: 24, prototypeDepth: 12, originalRequests: 63, encoderInvoked: false, continuationAuthorized: false } as const;
  const run = { callFrameId: "original_frame", tupleObjectId: "original_tuple", callbackObjectId: "original_callback", callbackScriptId: "original_script" };
  const cursor = new CurrentSchematicRelevanceRunPrefixCursor(run, raw, "original_idle", 0, "original_script");
  assert.throws(() => Reflect.apply(cursor.reserve.bind(cursor), cursor, [null]), /SCHEMATIC_RELEVANCE_ORIGINAL_RUN_PREFIX_CURSOR/u);
  assert.throws(() => Reflect.apply(cursor.accept.bind(cursor), cursor, [null, {}]), /SCHEMATIC_RELEVANCE_ORIGINAL_RUN_PREFIX_CURSOR/u);
  const command = cursor.next(); assert.ok(command !== null); assert.equal(command.phase, "prefix-source"); assert.equal(cursor.next(), command);
  assert.throws(() => { cursor.reserve(structuredClone(command)); }); cursor.reserve(command);
  assert.throws(() => Reflect.apply(cursor.accept.bind(cursor), cursor, [null, {}]), /SCHEMATIC_RELEVANCE_ORIGINAL_RUN_PREFIX_CURSOR/u);
  assert.throws(() => { cursor.reserve(command); }); assert.throws(() => cursor.next());
});
