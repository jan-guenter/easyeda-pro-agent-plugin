/** Evaluate the actual dependency-free probe guard using synthetic schema
 * replies. This does not launch a package, application or upstream child. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

const actions = ["extract-library-archive-sources", "list-library-archive-sources", "read-library-archive-source"] as const;
/** Build an inert offline schema reply with explicit action constants for probe guard cases. */
function reply(selected: readonly string[]): Record<string, unknown> {
  return { offline: true, publicSdkMethodExecuted: false, installedRuntimeAdmission: false, executionAuthorized: false,
    inputSchema: { oneOf: selected.map(action => ({ type: "object", properties: { action: { type: "string", const: action } } })) } };
}
/** Evaluate the maintained probe's actual guard and helpers without its process-launch code. */
async function actualGuard(): Promise<(value: unknown) => void> {
  const source = await readFile(new URL("../../scripts/probe-installed-offline-catalog.ts", import.meta.url), "utf8");
  const helperStart = source.indexOf("function isRecord(");
  const helperEnd = source.indexOf("function sameFile(", helperStart);
  const start = source.indexOf("  const libraryFileSchemas =");
  const end = source.indexOf("  const fileValidation =", start);
  assert.ok(helperStart > 0 && helperEnd > helperStart && start > 0 && end > start);
  const program = stripTypeScriptTypes(source.slice(helperStart, helperEnd) + source.slice(start, end));
  assert.doesNotMatch(program, /offlineApi|child\.request/u);
  return value => { runInNewContext(program, { libraryFiles: value }); };
}

void test("the installed offline probe requires all three exact archive actions in its existing schema reply", async () => {
  const guard = await actualGuard(); assert.doesNotThrow(() => { guard(reply(actions)); });
  for (const missing of actions) {
    assert.throws(() => { guard(reply(actions.filter(action => action !== missing))); }, /lost a supplied archive source action/u);
  }
  assert.throws(() => { guard(reply(actions.map(action => `${action}-unexpected`))); }, /lost a supplied archive source action/u);
});

void test("the same guard preserves offline denials and refuses malformed action schema branches", async () => {
  const guard = await actualGuard();
  for (const field of ["offline", "publicSdkMethodExecuted", "installedRuntimeAdmission", "executionAuthorized"]) {
    const value = reply(actions); value[field] = field !== "offline";
    assert.throws(() => { guard(value); }, /lost offline scope/u);
  }
  for (const oneOf of [[], [{ properties: { action: { enum: actions } } }], [{ properties: {} }], ["read-library-archive-source"]]) {
    assert.throws(() => { guard({ ...reply(actions), inputSchema: { oneOf } }); });
  }
});
