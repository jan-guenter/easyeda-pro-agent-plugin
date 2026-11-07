/** Complete actual packaged-source reads and loader strings only. This does
 * not execute PowerShell, compile a native owner or launch an application. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { captureCurrentSchematicEditNativeHelper } from "../src/current-schematic-edit-native-helper.ts";
import { CURRENT_SCHEMATIC_EDIT_NATIVE_IDENTITY } from "../src/current-schematic-edit-native-identity.ts";

void test("exact helper custody fixes its purpose and rejects unsupported selectors before any native execution", async () => {
  for (const purpose of ["schematic-relevance-display-write209", "schematic-wire-edit209"] as const) {
    const captured = await captureCurrentSchematicEditNativeHelper("Synthetic-Distro", purpose); await captured.verify();
    assert.ok(Object.isFrozen(captured)); assert.ok(captured.bootstrap.includes(CURRENT_SCHEMATIC_EDIT_NATIVE_IDENTITY.helper.sha256));
    assert.ok(captured.bootstrap.includes("[IO.FileShare]::Read")); assert.ok(captured.bootstrap.endsWith("finally{$file.Dispose()}"));
    assert.ok(captured.bootstrap.includes(purpose === "schematic-relevance-display-write209" ? "-SchematicRelevanceDisplayWrite209" : "-SchematicWireEdit209"));
    assert.equal(captured.bootstrap.includes("-StringPrecreate"), false);
  }
  assert.ok(Object.isFrozen(CURRENT_SCHEMATIC_EDIT_NATIVE_IDENTITY.helper)); assert.ok(Object.isFrozen(CURRENT_SCHEMATIC_EDIT_NATIVE_IDENTITY.compiler));
  await assert.rejects(captureCurrentSchematicEditNativeHelper("bad';command", "schematic-wire-edit209"), /SCHEMATIC_NATIVE_HELPER_SOURCE/u);
  const rejected: unknown = Reflect.apply(captureCurrentSchematicEditNativeHelper, undefined, ["Synthetic-Distro", "pcb-via-write209"]); assert.ok(rejected instanceof Promise);
  await assert.rejects(rejected, /SCHEMATIC_NATIVE_HELPER_SOURCE/u);
});
