/** Actual source-built Linux packets for the accessor-retaining header profile;
 * only opaque handles are normalized. No Windows ABI or payload identity claim. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { decodeCurrentSelectedFileMainSqlFenceNative as decode } from "../src/current-selected-file-main-sql-fence-replies.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_NAPI3_ACCESSOR_PROFILE as PROFILE, matchesCurrentSelectedFileMainSqlFenceNapi3 as matches, currentSelectedFileMainSqlFenceNativeShape as shape } from "../src/current-selected-file-main-sql-napi3-profile.ts";

function record(input: unknown): asserts input is Record<string, unknown> {
  assert.ok(input !== null && typeof input === "object" && !Array.isArray(input));
}
/** Read the entire sealed packet and verify its committed normalized bytes. */
async function packets(callerOwn: boolean): Promise<Record<string, unknown>> {
  const variant = callerOwn ? "caller-own" : "caller-absent";
  const hash = callerOwn ? "987fa2214e24242d3e490b0d57d53a4bef5de4dede46081c755eba8cef5fc35a" : "996f303dc8682640c464c02fec46af8d83767b318802bb83db1324a42f27fdba";
  const raw = await readFile(new URL(`fixtures/current-selected-main-napi3-accessor-${variant}-metadata.json`, import.meta.url), "utf8");
  assert.equal(createHash("sha256").update(raw).digest("hex"), hash);
  const value: unknown = JSON.parse(raw); record(value); return value;
}
/** Require an actual packet result array before applying a hostile mutation. */
function rows(input: unknown): unknown[] {
  record(input); const value = input["result"]; assert.ok(Array.isArray(value)); return value;
}

void test("accessor-retaining headers admit only their complete caller-own and caller-absent metadata", async () => {
  for (const callerOwn of [true, false]) {
    const input = await packets(callerOwn);
    for (const role of ["Database", "Statement"] as const) {
      const packet = input[role]; assert.equal(matches(packet, role), true); assert.doesNotThrow(() => { decode(packet, role); });
      assert.equal(matches(packet, role === "Database" ? "Statement" : "Database"), false);
    }
    assert.equal(rows(input["Database"]).length, callerOwn ? 14 : 12);
    assert.equal(rows(input["Statement"]).length, callerOwn ? 12 : 10);
    if (!callerOwn) { assert.deepEqual(shape(input["Database"]), { fields: 12, fingerprint: "4BB052F5C3E6EA39" }); }
  }
  assert.equal(PROFILE.databaseSymbols, 9); assert.equal(PROFILE.statementSymbols, 7);
  assert.equal(PROFILE.externalPayloadIdentityProven, false); assert.equal(PROFILE.windowsAbiObserved, false); assert.equal(PROFILE.executionAuthorized, false);
});

void test("extra symbols, duplicate handles, accessors, changed flags and mixed function cores still refuse", async () => {
  const captured = await packets(false);
  const original = captured["Database"];
  const mutations: readonly ((packet: unknown) => void)[] = [
    packet => { const extra: unknown = structuredClone(rows(packet).at(-1)); record(extra); record(extra["value"]); record(extra["symbol"]); extra["value"]["objectId"] = "extra_value"; extra["symbol"]["objectId"] = "extra_symbol"; rows(packet).push(extra); },
    packet => { rows(packet)[4] = structuredClone(rows(packet)[3]); },
    packet => { const field = rows(packet)[3]; record(field); field["get"] = { type: "undefined" }; },
    packet => { const field = rows(packet)[3]; record(field); field["writable"] = true; },
    packet => { rows(packet).splice(2, 0, { name: "caller", value: { type: "object", subtype: "null", value: null } }); },
  ];
  for (const mutate of mutations) {
    const packet: unknown = structuredClone(original); mutate(packet);
    assert.equal(matches(packet, "Database"), false); assert.throws(() => { decode(packet, "Database"); });
  }
});
