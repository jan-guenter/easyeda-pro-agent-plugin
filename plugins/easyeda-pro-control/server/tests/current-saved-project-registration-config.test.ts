import { currentSavedProjectRegistrationConfigNativeCases } from "../src/current-saved-project-registration-config-protocol.ts";
import { currentSelectedFileMainSqlFenceWire } from "../src/current-selected-file-main-sql-fence-native.ts";
import { validateCurrentSelectedFileMainSqlFenceCommand } from "../src/current-selected-file-main-sql-fence-protocol.ts";
import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Text } from "../src/core.ts";
import { compareCurrentSavedProjectRegistrationConfigSql, prepareCurrentSavedProjectRegistrationTargetData } from "../src/current-saved-project-registration-config-data.ts";
import { CURRENT_SAVED_PROJECT_REGISTRATION_CONFIG_SQL as SQL } from "../src/current-saved-project-registration-config-source.ts";

const path = String.raw`C:\disposable\Fixture@1.2.eprj2`;
const target = { rawWindowsPath: path, projectUuid: sha256Text(path), branchUuid: "a".repeat(32), documentUuid: "b".repeat(32), expectedSourceSha256: "c".repeat(64) };
const dates = [{ kind: "date-data", epochMilliseconds: 1000 }, { kind: "date-data", epochMilliseconds: 2000 }];
function fixture(): ReturnType<typeof prepareCurrentSavedProjectRegistrationTargetData> { return prepareCurrentSavedProjectRegistrationTargetData(target, "system"); }

void test("the exact recent-project SQL preserves file-derived metadata and both independent native Date data slots", () => {
  const data = fixture(); assert.equal(data.name, "Fixture"); assert.equal(data.version, "1.2"); assert.equal(data.registrationAuthorized, false);
  const result = compareCurrentSavedProjectRegistrationConfigSql(data, { kind: "upsert", sql: SQL.upsert, parameters: [data.name, path, data.version, ...dates] });
  assert.deepEqual(result.dateEpochMilliseconds, [1000, 2000]); assert.equal(result.nativeDateObjectsVerified, false);
  assert.equal(result.nativeCallbackCompletionVerified, false); assert.equal(result.sharedProfileMutationProven, false); assert.equal(result.selectedDesignWriteAuthorized, false);
  const query = compareCurrentSavedProjectRegistrationConfigSql(data, { kind: "query-one", sql: SQL.query, parameters: [path] });
  assert.equal(query.kind, "query-one"); assert.equal(query.dateEpochMilliseconds, null);
});

void test("other SQL, altered fields or target and extra parameters cannot expand a registration row comparison", () => {
  const data = fixture();
  for (const input of [{ kind: "upsert", sql: SQL.upsert.trim(), parameters: [data.name, path, data.version, ...dates] },
    { kind: "upsert", sql: SQL.upsert.replace("db_paths", "other_table"), parameters: [data.name, path, data.version, ...dates] },
    { kind: "upsert", sql: SQL.upsert, parameters: ["changed name", path, data.version, ...dates] },
    { kind: "upsert", sql: SQL.upsert, parameters: [data.name, path, "changed version", ...dates] },
    { kind: "upsert", sql: SQL.upsert, parameters: [data.name, path, data.version, ...dates, "extra"] },
    { kind: "query-one", sql: SQL.query, parameters: [String.raw`C:\disposable\foreign.eprj2`] }]) {
    assert.throws(() => compareCurrentSavedProjectRegistrationConfigSql(data, input));
  }
  assert.throws(() => prepareCurrentSavedProjectRegistrationTargetData(target, "Fixture"));
  assert.throws(() => prepareCurrentSavedProjectRegistrationTargetData({ ...target, projectUuid: "d".repeat(64) }, "system"));
});

void test("native Date instances and metadata objects cannot masquerade as independently captured data or run serialization hooks", () => {
  let calls = 0;
  const value = new Date(1000); value.toJSON = (): string => { calls += 1; return "foreign"; };
  assert.throws(() => compareCurrentSavedProjectRegistrationConfigSql(fixture(), { kind: "upsert", sql: SQL.upsert, parameters: ["Fixture", path, "1.2", value, value] }));
  assert.equal(calls, 0);
  const proxy = new Proxy({}, { get: (): never => { calls += 1; throw new Error("trap"); } });
  assert.throws(() => prepareCurrentSavedProjectRegistrationTargetData(proxy, "system")); assert.equal(calls, 0);
});

void test("the finite registration native vocabulary rejects substituted source, conditions, locations and connection selectors", () => {
  const cases = currentSavedProjectRegistrationConfigNativeCases(); assert.equal(cases.length, 16);
  const historical = cases.slice(0, 10); const historicalJson = JSON.stringify(historical);
  assert.equal(sha256Text(historicalJson), "3724ba9e3d16e0033b97bf5b5696ac66866cbbe166b8476eb7be0ddef49379e2");
  for (const command of cases) {
    validateCurrentSelectedFileMainSqlFenceCommand(command); const wire = currentSelectedFileMainSqlFenceWire(command, 73); assert.equal(wire.command.id, 73);
    assert.throws(() => validateCurrentSelectedFileMainSqlFenceCommand({ ...command, params: { ...command.params, sessionId: "foreign" } }));
    if (command.method === "Runtime.callFunctionOn") { assert.throws(() => validateCurrentSelectedFileMainSqlFenceCommand({ ...command, params: { ...command.params, functionDeclaration: "function(){return true}" } })); }
    if (command.method === "Debugger.setBreakpoint") {
      assert.throws(() => validateCurrentSelectedFileMainSqlFenceCommand({ ...command, params: { ...command.params, condition: "false" } }));
      assert.throws(() => validateCurrentSelectedFileMainSqlFenceCommand({ ...command, params: { ...command.params, location: { ...command.params.location, columnNumber: command.params.location.columnNumber + 1 } } }));
    }
    if (command.phase === "sql-fence-registration-raw-frame") {
      assert.throws(() => validateCurrentSelectedFileMainSqlFenceCommand({ ...command, params: { ...command.params, expression: "[this,F5]" } }));
    }
  }
});
