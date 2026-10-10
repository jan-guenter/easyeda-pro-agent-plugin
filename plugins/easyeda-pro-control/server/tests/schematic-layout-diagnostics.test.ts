import assert from "node:assert/strict";
import { test } from "node:test";
import { nativeFailureCategory } from "../src/native-diagnostics.ts";

void test("layout and loaded-template diagnostics admit only complete maintained literals", () => {
  for (const code of ["SCH_LAYOUT_BASELINE_CHANGED", "SCH_LAYOUT_SOURCE_API_MISSING", "SCH_LAYOUT_HEADER_INVALID", "SCH_LAYOUT_SOURCE_REJECTED", "SCH_LAYOUT_ACTION_REJECTED", "SCH_LAYOUT_TEMPLATE_BOUND", "SCH_NETFLAG_TEMPLATE_MANAGER", "SCH_NETFLAG_TEMPLATE_SCOPE", "SCH_NETFLAG_TEMPLATE_UNSTABLE"]) {
    assert.equal(nativeFailureCategory(code), `native-preflight:${code}`);
    assert.equal(nativeFailureCategory(`${code} private suffix`), null);
  }
  assert.equal(nativeFailureCategory("SCH_LAYOUT_UNKNOWN"), null);
});
