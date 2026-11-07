/** Pure comparisons only. No SQLite connection, native call, cookie store,
 * application startup or configuration mutation is executed in these tests. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { CURRENT_MAIN_STARTUP_CONFIG_SQL as SQL, compareCurrentMainStartupConfigSql as compare,
  qualifyCurrentMainStartupConfigSource } from "../src/current-main-startup-config-sql.ts";

void test("all exact h6 chunks and the exact KB chunk remain source-pinned configuration comparisons", () => {
  assert.equal(SQL.requiredWebDbVersion, "25.10.31.1"); assert.equal(SQL.scripts.jb.length, 41); assert.equal(SQL.scripts.dc.length, 1);
  for (const role of ["jb", "dc"] as const) {
    for (const [index, row] of SQL.scripts[role].entries()) {
      assert.equal(createHash("sha256").update(row.sql).digest("hex"), row.sha256);
      const match = compare(role, "run", row.sql, []);
      assert.ok(match !== null); assert.equal(match.kind, "script"); assert.equal(match.scriptIndex, index); assert.equal(match.designWriteGrant, false);
      assert.equal(match.readonlySql, false); assert.equal(match.nativeCompletionProven, false);
      assert.equal(compare(role, "run", `${row.sql} `, []), null); assert.equal(compare(role, "prepare", row.sql, []), null);
      assert.equal(compare(role, "run", row.sql, [1]), null);
      assert.equal(compare(role === "jb" ? "dc" : "jb", "run", row.sql, []), null);
    }
  }
  assert.throws(() =>{  qualifyCurrentMainStartupConfigSource(SQL.scripts.jb.map(row => row.sql).join("\n\n")); });
});
void test("only JB has the exact original transaction literals; unknown/configuration SQL never gains a match", () => {
  for (const [kind, sql] of Object.entries(SQL.transaction)) {
    assert.equal(compare("jb", "run", sql, [])?.kind, kind); assert.equal(compare("dc", "run", sql, []), null);
    assert.equal(compare("jb", "run", sql.toUpperCase(), []), null); assert.equal(compare("jb", "statementRun", sql, []), null);
  }
  for (const sql of ["update projects set ticket=1", "pragma journal_mode=delete", "delete from history_data", "delete from web_cookies", "drop table system_attributes"] as const) {
    assert.equal(compare("jb", "run", sql, []), null); assert.equal(compare("dc", "run", sql, []), null);
  }
});
void test("original inline Date operands stay observed values and require exact numeric rendering and empty parameters", () => {
  const milliseconds = 1_700_000_000_123, seconds = milliseconds / 1000;
  const broadcast = `${SQL.broadcastDeletePrefix}${String(milliseconds - 3_600_000)}`, cookies = `${SQL.cookieDeletePrefix}${String(seconds)}`;
  assert.equal(compare("jb", "run", broadcast, [])?.inlineClockOperand, milliseconds - 3_600_000);
  assert.equal(compare("dc", "run", cookies, [])?.inlineClockOperand, seconds);
  for (const suffix of ["", "NaN", "Infinity", "-Infinity", "-0", "01", "1;delete from projects", "1 ", "9e999", "900000000000000000000"]) {
    assert.equal(compare("jb", "run", SQL.broadcastDeletePrefix + suffix, []), null);
    assert.equal(compare("dc", "run", SQL.cookieDeletePrefix + suffix, []), null);
  }
  assert.equal(compare("jb", "run", `${SQL.broadcastDeletePrefix}1.5`, []), null);
  assert.equal(compare("jb", "run", broadcast, [milliseconds]), null); assert.equal(compare("dc", "run", broadcast, []), null);
});
void test("cookie upsert comparison validates all nine original bind slots privately without returning their contents", () => {
  const payload = "private-cookie-content-for-synthetic-test", values: unknown[] = ["https", ".synthetic.invalid", "session", payload, 1_700_000_000.125, 1, payload, 1_700_000_000.125, 1];
  for (const site of ["prepare", "prepared", "finalize"] as const) {
    assert.equal(compare("dc", site, SQL.cookieUpsert, [])?.kind, "cookie-upsert"); assert.equal(compare("dc", site, SQL.cookieUpsert, values), null);
  }
  const match = compare("dc", "statementRun", SQL.cookieUpsert, values); assert.equal(match?.kind, "cookie-upsert");
  assert.equal(JSON.stringify(match).includes(payload), false); assert.equal(compare("dc", "run", SQL.cookieUpsert, values), null);
  for (const [index, value] of [[0, ""], [1, ""], [2, ""], [3, {}], [4, Infinity], [5, 2], [6, "different"], [7, 0], [8, 0]] as const) {
    const changed = [...values]; changed[index] = value;
    if (typeof value === "object" || value === Infinity) { assert.throws(() => compare("dc", "statementRun", SQL.cookieUpsert, changed)); }
    else { assert.equal(compare("dc", "statementRun", SQL.cookieUpsert, changed), null); }
  }
});
void test("parameter accessors, inherited slots, proxies and objects are rejected without their hooks running", () => {
  let calls = 0;
  const accessor: unknown[] = []; Object.defineProperty(accessor, "0", { enumerable: true, get(): never { calls += 1; throw new Error("forbidden"); } });
  const proxy = new Proxy([], { get(): never { calls += 1; throw new Error("forbidden"); }, getPrototypeOf(): never { calls += 1; throw new Error("forbidden"); } });
  const object = { toJSON(): never { calls += 1; throw new Error("forbidden"); } };
  const sparse: unknown[] = []; sparse.length = 1;
  for (const params of [accessor, proxy, [object], sparse, Object.create([])]) {
    assert.throws(() => compare("dc", "statementRun", SQL.cookieUpsert, params));
  }
  assert.equal(calls, 0);
});
