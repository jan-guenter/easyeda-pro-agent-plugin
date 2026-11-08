/** Actual fixed leaves on the existing inert browser/model fixture. They
 * create no Chrome owner, worker, Save or durable opened state. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_SCHEMATIC_RELEVANCE_SAVED_OPENING_FUNCTION as PROGRAM, currentSchematicRelevanceSavedOpeningArguments as args,
 decodeCurrentSchematicRelevanceSavedOpeningResult as decode } from "../src/current-schematic-relevance-saved-opening-programs.ts";
import { GENERATED_SCHEMATIC_RELEVANCE_REGISTRATION_FUNCTION as REGISTER } from "../src/managed-schematic-fixture-opening-program.ts";
import { qualifyGeneratedSchematicRelevanceFixtureInitialSql } from "../src/managed-schematic-relevance-fixture-initial-sql.ts";
import { generatedSchematicOpeningVm } from "./helpers/generated-schematic-opening-vm.ts";
import { managedSchematicFixtureInitialSqlFixture } from "./helpers/managed-schematic-fixture-initial-sql.ts";

void test("separate saved-reader stages register nowhere and open only their exact project then SCH page", async () => {
 const input = await managedSchematicFixtureInitialSqlFixture(undefined, "relevance"), original = await qualifyGeneratedSchematicRelevanceFixtureInitialSql(input);
 const vm = generatedSchematicOpeningVm(original.qualification, original.history); const target = original.qualification.target;
 await vm.run(`return await (${REGISTER})(target);`);
 for (const phase of ["preflight", "open-project", "open-page"] as const) {
  const values = args(target, phase, "original-window");
  const reply = await vm.run(`return await (${PROGRAM})(...${JSON.stringify(values.map(row => row.value))});`);
  const result = decode(reply, target, phase, "original-window");
  assert.equal(result.phase, phase); assert.equal(result.documentTitle, "EasyEDA Pro - V3.2.209");
  assert.throws(() => decode(reply, target, phase, "foreign-window"));
  if (phase === "open-page") { assert.equal(result.identity?.persistenceVerified, false); assert.equal(result.page?.explicitSaveDispatched, false); }
 }
 assert.deepEqual(vm.evaluate("[calls.registration,calls.project,calls.page]"), [1, 1, 1]);
 await assert.rejects(vm.run(`return await (${PROGRAM})(target,"open-page","original-window");`));
 assert.deepEqual(vm.evaluate("[calls.registration,calls.project,calls.page]"), [1, 1, 1]);
});
void test("wrong fresh window and phase/target shapes refuse before navigation", async () => {
 const input = await managedSchematicFixtureInitialSqlFixture(undefined, "relevance"), original = await qualifyGeneratedSchematicRelevanceFixtureInitialSql(input);
 const vm = generatedSchematicOpeningVm(original.qualification, original.history); const target = original.qualification.target;
 await assert.rejects(vm.run(`return await (${PROGRAM})(target,"open-project","foreign-window");`), /SCHEMATIC_SAVED_OPENING_STAGE/u);
 assert.deepEqual(vm.evaluate("[calls.registration,calls.project,calls.page]"), [0, 0, 0]);
 assert.throws(() => args({ ...target, rawWindowsPath: "C:\\User\\ordinary.eprj2" }, "open-project", "original-window"));
 assert.throws(() => args({ ...target, documentUuid: target.pageUuid }, "open-project", "original-window"));
 const call = { id: 9999, method: "Runtime.callFunctionOn", sessionId: "s".repeat(128), params: { functionDeclaration: PROGRAM, uniqueContextId: "c".repeat(128),
  arguments: args(target,"open-page","w".repeat(128)), awaitPromise: true, returnByValue: true, throwOnSideEffect: false, silent: true, userGesture: false, generatePreview: false } };
 assert.ok(Buffer.byteLength(JSON.stringify(call))+1<65_536);
});
