/** Source and bounded command data only. Native code is never compiled or run. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_MAIN_STARTUP_LIBRARY_LIVE as LIVE, currentMainStartupLibraryAppDirectory } from "../src/current-main-startup-library-live-profile.ts";
import { CurrentMainStartupLibrarySchedule } from "../src/current-main-startup-library-schedule.ts";
import { currentMainStartupLibraryNativeCases, currentMainStartupLibraryNativeFragment, currentMainStartupLibraryNativeRows, currentMainStartupLibraryWire } from "../src/current-main-startup-library-native.ts";
import { validateCurrentMainStartupLibraryCommand } from "../src/current-main-startup-library-protocol.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUESTS as HISTORICAL, validateCurrentSelectedFileMainSqlFenceCommand } from "../src/current-selected-file-main-sql-fence-protocol.ts";
import { currentSelectedFileMainSqlFenceNativeSource } from "../src/current-selected-file-main-sql-fence-native.ts";

function consume(schedule: CurrentMainStartupLibrarySchedule): void {
  for (let index = 0; index < 332; index += 1) {
    schedule.consume("sql-stock-raw"); schedule.consume("sql-stock-captured");
    if (index === 0) { for (const phase of ["sql-stock-frame", "sql-stock-bind", "sql-stock-points", "sql-stock-arm"]) { schedule.consume(phase); } }
    for (const phase of ["sql-stock-select", "sql-stock-require", "sql-stock-resume"]) { schedule.consume(phase); }
  }
}
void test("stock phases have their own finite 1670-request schedule with a separately consumed normal return", () => {
  const schedule = new CurrentMainStartupLibrarySchedule(); consume(schedule);
  assert.equal(schedule.complete, false); assert.equal(schedule.requests, 1664);
  assert.throws(() => { schedule.consume("sql-stock-resume"); }); assert.throws(() => { schedule.consume("sql-fence-resume"); });
  for (const phase of ["sql-stock-return-frame", "sql-stock-return-properties", "sql-stock-return", "sql-stock-remove", "sql-stock-require", "sql-stock-resume"]) { schedule.consume(phase); }
  assert.equal(schedule.complete, true); assert.equal(schedule.requests, LIVE.requests);
  assert.equal(Object.values(LIVE.limits).reduce((sum, value) => sum + value, 0), LIVE.requests);
  assert.throws(() => { schedule.consume("sql-stock-raw"); });
  assert.equal(HISTORICAL.normal, 838); assert.equal(HISTORICAL.startupNativeCalls, 48); assert.equal(HISTORICAL.mutationPauses, 64);
});
void test("all thirteen stock rows use fixed programs and tagged wire phases that the historical grammar rejects", () => {
  const cases = currentMainStartupLibraryNativeCases(); assert.equal(cases.length, 13); assert.equal(currentMainStartupLibraryNativeRows().length, 13);
  for (const command of cases) {
    assert.deepEqual(validateCurrentMainStartupLibraryCommand(command), command);
    assert.equal(currentMainStartupLibraryWire(command, 73).request["phase"], command.phase);
    assert.throws(() => validateCurrentSelectedFileMainSqlFenceCommand(command));
    for (const changed of [{ ...command, sessionId: "foreign" }, { ...command, method: "Runtime.evaluate" }, { ...command, phase: "sql-stock-caller" }]) {
      assert.throws(() => validateCurrentMainStartupLibraryCommand(changed));
    }
  }
  const selected = cases.find(command => command.phase === "sql-stock-select");
  assert.ok(selected?.phase === "sql-stock-select"); assert.equal(selected.params.throwOnSideEffect, false);
  const frame = cases.find(command => command.phase === "sql-stock-frame"); assert.ok(frame?.phase === "sql-stock-frame");
  assert.equal(frame.params.expression, "[t,W0,yE]");
  assert.throws(() => validateCurrentMainStartupLibraryCommand({ ...frame, params: { ...frame.params, expression: "[t,W0,yE,sc,F5]" } }));
  assert.throws(() => validateCurrentMainStartupLibraryCommand({ ...frame, params: { ...frame.params, throwOnSideEffect: false } }));
  const native = currentSelectedFileMainSqlFenceNativeSource(); const fragment = currentMainStartupLibraryNativeFragment();
  assert.ok(native.includes("EasyedaSelectedFileMainSqlFenceProtocol")); assert.equal(native.includes("65035700892914af03e6e844f3e32654787852c1e76c37a517b3ddbd2e80823f"), false);
  assert.ok(fragment.includes("stockMainStage<17")); assert.ok(fragment.includes("stockRequests<1670"));
  assert.equal(fragment.includes("normalLimit+="), false); assert.equal(fragment.includes("normalRequests++"), false);
});
void test("app directory comparison derives only from the original canonical app.js URL", () => {
  const directory = String.raw`C:\Program Files\easyeda-pro\resources\app`;
  assert.equal(currentMainStartupLibraryAppDirectory(`${directory}\\app.js`), directory);
  assert.equal(currentMainStartupLibraryAppDirectory("file:///C:/Program%20Files/easyeda-pro/resources/app/app.js"), directory);
  for (const value of ["app.js", "file://foreign/C:/app.js", "file:///C:/app.js?query", "C:/foreign/app.js", String.raw`c:\foreign\app.js`, "C:\\foreign\\app.js\n"]) {
    assert.throws(() => currentMainStartupLibraryAppDirectory(value));
  }
});
