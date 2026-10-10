import assert from "node:assert/strict";
import { test } from "node:test";
import { extractToolPayload } from "../src/core.ts";
import { nativeFailureCategory } from "../src/native-diagnostics.ts";

void test("only exact reviewed native literal errors become diagnostics", () => {
  assert.equal(nativeFailureCategory("SCH_NATIVE_MANAGER_MISSING"), "native-preflight:SCH_NATIVE_MANAGER_MISSING");
  assert.equal(nativeFailureCategory("Recovery navigation refused: registry-membership"), "native-preflight:RECOVERY_REGISTRY_MEMBERSHIP");
  assert.equal(nativeFailureCategory("Recovery navigation refused: unrelated-editor-tab"), "native-preflight:RECOVERY_UNRELATED_EDITOR_TAB");
  assert.equal(nativeFailureCategory("Recovery navigation refused: tab-tree-leaf"), "native-preflight:RECOVERY_TAB_TREE_LEAF");
  assert.equal(nativeFailureCategory("EDITOR_TABS_CONTEXT_DRIFT"), "native-preflight:EDITOR_TABS_CONTEXT_DRIFT");
  assert.equal(nativeFailureCategory("Pad history changed unrelated records"), "native-preflight:PAD_HISTORY_COLLATERAL");
  assert.equal(nativeFailureCategory("Pad history changed unrelated records secret"), null);
  assert.equal(nativeFailureCategory("Footprint lifecycle metadata drift"), "native-lifecycle:FOOTPRINT_LIFECYCLE_METADATA");
  assert.equal(nativeFailureCategory("Footprint reopen identity failed"), "native-lifecycle:FOOTPRINT_LIFECYCLE_REOPEN");
  assert.equal(nativeFailureCategory("Footprint reopen identity failed private suffix"), null);
  for (const code of ["FOOTPRINT_LINE_OBJECT_INVALID", "FOOTPRINT_LINE_BASELINE_DRIFT", "FOOTPRINT_HISTORY_FRAME", "FOOTPRINT_HISTORY_IDENTITY", "FOOTPRINT_HISTORY_BASELINE", "FOOTPRINT_HISTORY_RESULT"]) {
    assert.equal(nativeFailureCategory(code), `native-preflight:${code}`);
    assert.equal(nativeFailureCategory(`${code} private suffix`), null);
  }
  for (const message of ["SCH_NATIVE_MANAGER_MISSING secret", "SCH_SECRET_KEY", "Error: SCH_NATIVE_MANAGER_MISSING", "Recovery navigation refused: registry-membership secret", {}, null]) {
    assert.equal(nativeFailureCategory(message), null);
  }
  assert.throws(() => extractToolPayload({ structuredContent: { ok: false, error: "LIBRARY_EXPORT_FILE_INVALID" } }), /native-preflight:LIBRARY_EXPORT_FILE_INVALID/u);
});
