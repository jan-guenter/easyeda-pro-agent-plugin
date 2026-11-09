/** Fixed source/codec parity only. No application, SQL, process or C# execution. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { CURRENT_MAIN_STARTUP_LIBRARY_V2 as STOCK } from "../src/current-main-startup-library-v2-profile.ts";
import { CURRENT_MAIN_STARTUP_CONFIG_SQL as CONFIG, qualifyCurrentMainStartupConfigSource } from "../src/current-main-startup-config-sql.ts";
import { qualifyCurrentMainStartupLibrarySource } from "../src/current-main-startup-library-source.ts";
import { currentSelectedFileMainSqlFenceNativeCases, currentSelectedFileMainSqlFenceNativeSource, currentSelectedFileMainSqlFenceWire } from "../src/current-selected-file-main-sql-fence-native.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUESTS as LIMITS, validateCurrentSelectedFileMainSqlFenceCommand } from "../src/current-selected-file-main-sql-fence-protocol.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaApp } from "./helpers/installed-easyeda-source.ts";

void test("cookie cleanup belongs to the separately pinned DC/exec chain while original runScripts may await", async context => {
  const source = await readConfiguredEasyedaApp(); if(source===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}
  qualifyCurrentMainStartupConfigSource(source); qualifyCurrentMainStartupLibrarySource(source);
  const lines = source.split("\n"); const cookieLine = lines[8583], sqlLine = lines[1025]; assert.ok(sqlLine!==undefined&&cookieLine!==undefined);
  assert.equal(sqlLine.slice(3173,3177),"run(");
  assert.equal(sqlLine.slice(3601,3607),"run(i)");
  const caller = source.slice(CONFIG.sourceRows.DC.start,CONFIG.sourceRows.DC.end);
  assert.ok(caller.includes('await t.runScripts(KB);let r=RC.instance();await t.exec({JOIN:r},{LET:[r.expire,Date.now()/1e3]},{DELETE:!0});let i={},s=await t.queryAll'));
  assert.equal(cookieLine.slice(256,260),"exec");
  assert.notEqual(STOCK.initialLineage[2]?.columnNumber,3173);
});
void test("two distinct startup interleave rows retain every historical row and normal-budget ceiling", () => {
  const rows = currentSelectedFileMainSqlFenceNativeCases();
  const old = rows.filter(row=>row.phase!=="sql-fence-startup-read-owner"&&row.phase!=="sql-fence-startup-config-resume"&&!row.phase.startsWith("sql-fence-startup-registration-"));
  assert.equal(old.length,162); assert.equal(createHash("sha256").update(JSON.stringify(old)).digest("hex"),"cf3c57fe32a4ca995ae7c8d56baad906fda469d6162369863dee92aa02d41559");
  const added = rows.filter(row=>row.phase==="sql-fence-startup-read-owner"||row.phase==="sql-fence-startup-config-resume"); assert.equal(added.length,2);
  for(const row of added){const wire=currentSelectedFileMainSqlFenceWire(row,73);assert.equal(wire.request["action"],"main-send");assert.equal(wire.request["phase"],row.phase);assert.throws(()=>validateCurrentSelectedFileMainSqlFenceCommand({...row,phase:"sql-fence-stock-resume"}));}
  assert.ok(currentSelectedFileMainSqlFenceNativeSource().includes("EasyedaSelectedFileMainSqlFenceProtocol"));
  assert.equal(LIMITS.normal,838);assert.equal(LIMITS.perReadonlyRequestMaximum,6);assert.equal(STOCK.requests,2002);
  const readonlyRequests=2+1+1;assert.ok(readonlyRequests<=LIMITS.perReadonlyRequestMaximum);
});

void test("three fixed registration commands cannot select another point, program or stock budget", () => {
  const rows = currentSelectedFileMainSqlFenceNativeCases().filter(row => row.phase.startsWith("sql-fence-startup-registration-")); assert.equal(rows.length, 3);
  for (const row of rows) {
    assert.deepEqual(validateCurrentSelectedFileMainSqlFenceCommand(row), row);
    const encoded = currentSelectedFileMainSqlFenceWire(row, 73); assert.equal(encoded.request["action"], "main-send"); assert.equal(encoded.request["phase"], row.phase);
    assert.throws(() => validateCurrentSelectedFileMainSqlFenceCommand({ ...row, phase: "sql-stock-v2-resume" }));
    if (row.phase === "sql-fence-startup-registration-remove") { assert.throws(() => validateCurrentSelectedFileMainSqlFenceCommand({ ...row, params: { breakpointId: "foreign-point" } })); }
    if (row.phase === "sql-fence-startup-registration-complete") { assert.throws(() => validateCurrentSelectedFileMainSqlFenceCommand({ ...row, params: { ...row.params, functionDeclaration: "function(){return true;}" } })); }
  }
  assert.equal(LIMITS.normal, 838); assert.equal(STOCK.requests, 2002);
});
