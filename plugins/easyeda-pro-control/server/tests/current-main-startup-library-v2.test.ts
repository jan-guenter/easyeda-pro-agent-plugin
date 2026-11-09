/** Inert same-reference programs and separate finite protocol only. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { runInContext } from "node:vm";
import { CURRENT_MAIN_STARTUP_LIBRARY_V2_CALLS as CALLS } from "../src/current-main-startup-library-v2-programs.ts";
import { CurrentMainStartupLibraryV2Schedule, CURRENT_MAIN_STARTUP_LIBRARY_V2 as LIVE } from "../src/current-main-startup-library-v2-profile.ts";
import { currentMainStartupLibraryV2NativeCases, currentMainStartupLibraryV2NativeRows, currentMainStartupLibraryV2Wire } from "../src/current-main-startup-library-v2-native.ts";
import { validateCurrentMainStartupLibraryCommand } from "../src/current-main-startup-library-protocol.ts";
import { CURRENT_MAIN_STARTUP_LIBRARY_LIVE as V1 } from "../src/current-main-startup-library-live-profile.ts";
import { fixture } from "./helpers/startup-library-fixture.ts";

function bound(): ReturnType<typeof fixture> {
  const context = fixture(false, 320);
  runInContext(`const rawInvocation=yE.replace(/^--.*$/g,"").split(/\\r?\\n\\r?\\n/m);const caller=index=>[kit.libraryOwner,rawInvocation,kit.tuple(index,[])[1]];tracker=(${CALLS.bind}).call(frame,kit.configTracker,kit.app,caller(0));`, context);
  return context;
}
void test("original runScripts array remains necessary for all332 ordered calls and original return", () => {
  const context = bound();
  for (let index = 0; index < 332; index += 1) {
    const value: unknown = runInContext(`(${CALLS.select}).call(kit.tuple(${String(index)},[]),kit.configTracker,tracker,caller(${String(index)}))`, context);
    assert.ok(value !== null && typeof value === "object"); assert.equal(Reflect.get(value, "scriptIndex"), index);
  }
  assert.equal(runInContext(`(${CALLS.returned}).call([kit.libraryOwner],kit.configTracker,tracker,Promise.resolve(kit.libraryOwner),kit.libraryOwner)`, context), true);
  assert.equal(runInContext("calls", context), 0);
});
void test("same-owner same-SQL foreign array, reordered cursor, accessor and changed raw descriptors fail before application calls", () => {
  for (const changed of ["[kit.libraryOwner,rawInvocation.slice(),caller(0)[2]]", "caller(1)", "new Proxy(caller(0),{})"]) {
    const context = bound(); assert.throws(() => runInContext(`(${CALLS.select}).call(kit.tuple(0,[]),kit.configTracker,tracker,${changed})`, context));
    assert.equal(runInContext("tracker[0][9].next", context), 0); assert.equal(runInContext("calls", context), 0);
  }
  for (const change of ['Object.defineProperty(rawInvocation,"1",{get(){calls++;throw Error("getter")}})', 'Object.defineProperty(rawInvocation,"1",{writable:false})', 'rawInvocation[0]="different"']) {
    const context = bound(); runInContext(change, context); assert.throws(() => runInContext(`(${CALLS.select}).call(kit.tuple(0,[]),kit.configTracker,tracker,caller(0))`, context));
    assert.equal(runInContext("tracker[0][9].next", context), 0); assert.equal(runInContext("calls", context), 0);
  }
});
void test("V2 owns exactly2002 requests and cannot spend immutable V1 phases or normal SQL quota", () => {
  const schedule = new CurrentMainStartupLibraryV2Schedule();
  for (let index = 0; index < 332; index += 1) {
    for (const phase of ["raw", "captured", "caller"]) { schedule.consume(`sql-stock-v2-${phase}`); }
    if (index === 0) { for (const phase of ["frame", "bind", "points", "arm"]) { schedule.consume(`sql-stock-v2-${phase}`); } }
    for (const phase of ["select", "require", "resume"]) { schedule.consume(`sql-stock-v2-${phase}`); }
  }
  assert.equal(schedule.complete, false); assert.equal(schedule.requests, 1996);
  for (const phase of ["return-frame", "return-properties", "return", "remove", "require", "resume"]) { schedule.consume(`sql-stock-v2-${phase}`); }
  assert.equal(schedule.complete, true); assert.equal(schedule.requests, LIVE.requests); assert.equal(V1.requests, 1670);
  for (const phase of ["sql-stock-v2-raw", "sql-stock-resume", "sql-fence-resume"]) { assert.throws(() => { schedule.consume(phase); }); }
  const rows = currentMainStartupLibraryV2NativeCases(); assert.equal(rows.length, 14); assert.equal(currentMainStartupLibraryV2NativeRows().length, 14);
  for (const row of rows) { assert.throws(() => validateCurrentMainStartupLibraryCommand(row)); assert.equal(currentMainStartupLibraryV2Wire(row, 7).request["phase"], row.phase); }
});
