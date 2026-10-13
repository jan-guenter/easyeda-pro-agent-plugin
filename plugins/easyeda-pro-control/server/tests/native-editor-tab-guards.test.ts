import assert from "node:assert/strict";
import { test } from "node:test";
import { NATIVE_PROJECT_PLACEHOLDER_PREDICATE } from "../src/native-editor-tab-guards.ts";
import { METADATA_NATIVE_DIAGNOSTIC_CATCH } from "../src/metadata-native-diagnostics.ts";

const PLACEHOLDER = { tabId: "0", data: { doctype: 0 }, isAbleDelete: false,
  isDisplayNone: true, draggable: false, group: "start_blank" };
function accepted(tab: unknown): boolean {
  // oxlint-disable-next-line typescript/no-implied-eval, no-new-func -- Only the fixed reviewed predicate is compiled against isolated test data.
  const run = new Function("tab", `${NATIVE_PROJECT_PLACEHOLDER_PREDICATE}return isNativeProjectPlaceholder(tab);`);
  // oxlint-disable-next-line typescript/no-unsafe-call -- Confine the generated result to unknown before checking its type.
  const result: unknown = run(tab); assert.equal(typeof result, "boolean"); return result === true;
}

void test("native hidden project placeholder matches the pinned initializer without inventing ownership", () => {
  assert.equal(accepted(PLACEHOLDER), true);
  assert.equal(accepted({ ...PLACEHOLDER, documentType: 0, isUnSaved: false }), true);
  for (const key of ["tabId", "data", "isAbleDelete", "isDisplayNone", "draggable", "group"]) {
    const missing: Record<string, unknown> = { ...PLACEHOLDER }; Reflect.deleteProperty(missing, key);
    assert.equal(accepted(missing), false);
  }
});

void test("unknown, visible, dirty and foreign-owned type-zero tabs cannot masquerade as the placeholder", () => {
  for (const patch of [{ tabId: "0@project" }, { documentType: 1 }, { isDisplayNone: false }, { draggable: true },
    { isAbleDelete: true }, { group: "other" }, { isUnSaved: true }, { isUnSaved: undefined },
    { parentProjectUuid: "project" }, { parentProjectUuid: null }, { parentLibraryUuid: "owner" },
    { data: { doctype: 0, pid: "project" } }, { data: { doctype: 0, owner: "owner" } },
    { data: { doctype: 0, pid: null } }, { data: { doctype: 0, owner: null } }, { data: { doctype: "0" } }]) {
    assert.equal(accepted({ ...PLACEHOLDER, ...patch }), false);
  }
  for (const invalid of [null, undefined, [], {}, "0"]) { assert.equal(accepted(invalid), false); }
});

function diagnostic(error: unknown): unknown {
  // oxlint-disable-next-line typescript/no-implied-eval, no-new-func -- Test only compiler-owned error extraction without native execution.
  const run = new Function("error", `${METADATA_NATIVE_DIAGNOSTIC_CATCH}return code;`);
  // oxlint-disable-next-line typescript/no-unsafe-call -- Keep any generated result confined to unknown.
  const result: unknown = run(error); return result;
}

void test("metadata subguard extraction accepts exact data properties without evaluating native error getters", () => {
  assert.equal(diagnostic(new Error("PROJECT_PLACEHOLDER")), "PROJECT_PLACEHOLDER");
  const nativeGetter = { get message(): never { throw new Error("Private getter must remain uncalled."); } };
  assert.equal(diagnostic(nativeGetter), "EXCEPTION");
  for (const error of ["PROJECT_PLACEHOLDER", { message: "PROJECT_PLACEHOLDER /private/project" },
    { message: "PROJECT_PLACEHOLDER\n" }, Object.create({ message: "PROJECT_PLACEHOLDER" }),
    new Proxy({}, { getOwnPropertyDescriptor(): never { throw new Error("Private proxy"); } }), null]) {
    assert.equal(diagnostic(error), "EXCEPTION");
  }
});
