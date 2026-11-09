/** A nonexistent pending command cannot be spent by either readonly cursor.
 * No native request or original owner is created by this regression. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentSchematicWireRawCursor } from "../src/current-schematic-wire-raw-cursor.ts";
import { CurrentSchematicWireActiveCursor } from "../src/current-schematic-wire-active-cursor.ts";

void test("Wire raw and active cursors reject null before a command exists without advancing", () => {
  const raw = new CurrentSchematicWireRawCursor("original_frame", "original_holder");
  const active = new CurrentSchematicWireActiveCursor("original_holder", "original_idle", "{}", "{}", "original_script", 0);
  for (const cursor of [raw, active]) {
    assert.throws(() => Reflect.apply(cursor.reserve, cursor, [null]), /WIRE_(?:RAW_ORIGINAL|ACTIVE)_CURSOR/u);
    assert.throws(() => Reflect.apply(cursor.accept, cursor, [null, {}]), /WIRE_(?:RAW_ORIGINAL|ACTIVE)_CURSOR/u);
  }
  assert.equal(raw.next()?.phase, "wire-raw-frame"); assert.equal(active.next()?.phase, "wire-active-functions");
});
