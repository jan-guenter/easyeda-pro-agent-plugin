import assert from "node:assert/strict";
import { test } from "node:test";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { qualifyGeneratedSchematicFixtureInitialSql } from "../src/managed-schematic-fixture-initial-sql.ts";
import { GENERATED_SCHEMATIC_NAVIGATION_FUNCTION, buildGeneratedSchematicNavigationProgram, buildGeneratedSchematicReadersProgram, validateGeneratedSchematicNavigation, validateGeneratedSchematicReaders } from "../src/managed-schematic-fixture-opening-program.ts";
import { generatedSchematicOpeningRequestSchema } from "../src/managed-schematic-fixture-opening.ts";
import { CURRENT_SCHEMATIC_DISPLAY_NAVIGATION_FUNCTION, CURRENT_SCHEMATIC_DISPLAY_START_FUNCTION } from "../src/current-schematic-display-write-programs.ts";
import { generatedSchematicOpeningVm } from "./helpers/generated-schematic-opening-vm.ts";
import { managedSchematicFixtureInitialSqlFixture } from "./helpers/managed-schematic-fixture-initial-sql.ts";

void test("fixed generated SCH program registers, opens the real project/page once and reads all three nonempty guarded families", async () => {
  const input = await managedSchematicFixtureInitialSqlFixture(), result = await qualifyGeneratedSchematicFixtureInitialSql(input);
  const fixture = generatedSchematicOpeningVm(result.qualification, result.history); const code = buildGeneratedSchematicNavigationProgram(result.qualification);
  assert.ok(Buffer.byteLength(code) <= 65_536);
  const raw = await fixture.run(code); const opening = validateGeneratedSchematicNavigation(decodeExactReadEnvelope(raw), result.qualification);
  assert.equal(opening.outcome, "opened-ready"); assert.equal(opening.attempted.length, 6); assert.equal(opening.identity?.nativePageReadinessObserved, true);
  const readerCode = buildGeneratedSchematicReadersProgram(result.qualification, "original-window"), readerRaw = await fixture.run(readerCode);
  const readers = validateGeneratedSchematicReaders(decodeExactReadEnvelope(readerRaw), result.qualification, result.history, "original-window");
  assert.equal(readers["generatedPrimitiveRosterMatched"], true); assert.equal(readers["persistenceVerified"], false);
  assert.deepEqual(fixture.evaluate("[calls.registration,calls.project,calls.page]"), [1, 1, 1]);
  const tampered = structuredClone(opening); tampered.attempted = ["registration"];
  assert.throws(() => validateGeneratedSchematicNavigation(tampered, result.qualification));
  fixture.evaluate("_TAB_ID_='different-window'");
  await assert.rejects(fixture.run(buildGeneratedSchematicReadersProgram(result.qualification, "original-window")), /IDENTITY/u);
});
void test("fixed native navigation accepts target data and preserves the same consumed six-stage semantics", async () => {
  const input = await managedSchematicFixtureInitialSqlFixture(), result = await qualifyGeneratedSchematicFixtureInitialSql(input);
  assert.ok(Buffer.byteLength(GENERATED_SCHEMATIC_NAVIGATION_FUNCTION) <= 65_536);
  assert.equal(GENERATED_SCHEMATIC_NAVIGATION_FUNCTION.includes(result.qualification.target.rawWindowsPath), false);
  for (const failStage of [undefined, "page-open"] as const) {
    const fixture = generatedSchematicOpeningVm(result.qualification, result.history, failStage === undefined ? {} : { failStage });
    const raw = await fixture.run(`return await (${GENERATED_SCHEMATIC_NAVIGATION_FUNCTION})(${JSON.stringify(result.qualification.target)});`);
    const opening = validateGeneratedSchematicNavigation(decodeExactReadEnvelope(raw), result.qualification);
    assert.equal(opening.outcome, failStage === undefined ? "opened-ready" : "partial-or-refused");
    assert.equal(opening.failedStage, failStage ?? null); assert.deepEqual(fixture.evaluate("[calls.registration,calls.project,calls.page]"), [1, 1, 1]);
  }
});
void test("each consumed native prefix keeps only earlier receipts and never dispatches a later navigation stage", async () => {
  const input = await managedSchematicFixtureInitialSqlFixture(), result = await qualifyGeneratedSchematicFixtureInitialSql(input);
  const stages = ["registration", "project-preflight", "project-open", "page-preflight", "page-open", "page-identity"];
  for (const [index, stage] of stages.entries()) {
    const fixture = generatedSchematicOpeningVm(result.qualification, result.history, { failStage: stage });
    const code = buildGeneratedSchematicNavigationProgram(result.qualification), raw = await fixture.run(code);
    const opening = validateGeneratedSchematicNavigation(decodeExactReadEnvelope(raw), result.qualification);
    assert.equal(opening.outcome, "partial-or-refused"); assert.equal(opening.failedStage, stage); assert.equal(opening.attempted.length, index + 1);
    assert.deepEqual(fixture.evaluate("[calls.registration,calls.project,calls.page]"), [1, index >= 2 ? 1 : 0, index >= 4 ? 1 : 0]);
  }
});
void test("original document/project drift preserves an inert consumed partial without another application call", async () => {
  const input = await managedSchematicFixtureInitialSqlFixture(), result = await qualifyGeneratedSchematicFixtureInitialSql(input);
  for (const drift of ["document", "project"] as const) {
    const fixture = generatedSchematicOpeningVm(result.qualification, result.history, { drift });
    const code = buildGeneratedSchematicNavigationProgram(result.qualification), raw = await fixture.run(code);
    const opening = validateGeneratedSchematicNavigation(decodeExactReadEnvelope(raw), result.qualification);
    assert.equal(opening.originalContextIntact, false); assert.equal(opening.outcome, "partial-or-refused"); assert.equal(opening.failedStage, "page-open");
    assert.deepEqual(fixture.evaluate("[calls.registration,calls.project,calls.page,calls.activePage]"), [1, 1, 1, 0]);
  }
});
void test("generated SCH public requests accept confirmations only and reject caller targets, paths, IDs, code or family selectors", () => {
  const request = { action: "open-generated-schematic", operationId: "sch209-generated-schema-case", confirmGeneratedDisposableFixture: true, acceptRecentPathRegistration: true, acceptNormalOpenEffects: true };
  assert.equal(generatedSchematicOpeningRequestSchema.safeParse(request).success, true);
  for (const extra of [{ target: {} }, { path: "C:\\UserProject" }, { pageUuid: "a".repeat(32) }, { code: "caller" }, { operation: "eda.sch_PrimitiveText.getAll" }]) {
    assert.equal(generatedSchematicOpeningRequestSchema.safeParse({ ...request, ...extra }).success, false);
  }
});

void test("native SCH start accepts original browser accessors and its one navigation returns the retained document title", async () => {
  const input = await managedSchematicFixtureInitialSqlFixture(), result = await qualifyGeneratedSchematicFixtureInitialSql(input);
  const fixture = generatedSchematicOpeningVm(result.qualification, result.history);
  fixture.evaluate('const originalDoc=document;delete globalThis.document;Object.defineProperty(globalThis,"document",{get(){return originalDoc;}});void 0;');
  const start = await fixture.run(`return (${CURRENT_SCHEMATIC_DISPLAY_START_FUNCTION})();`); assert.deepEqual(start, { windowTabId: "original-window", documentTitle: "EasyEDA Pro - V3.2.209" });
  assert.deepEqual(fixture.evaluate("[calls.registration,calls.project,calls.page]"), [0, 0, 0]);
  const opened = await fixture.run(`return await (${CURRENT_SCHEMATIC_DISPLAY_NAVIGATION_FUNCTION})(${JSON.stringify(JSON.stringify(result.qualification.target))});`);
  assert.ok(opened !== null && typeof opened === "object" && "navigation" in opened && "documentTitle" in opened);
  const receipt = validateGeneratedSchematicNavigation(decodeExactReadEnvelope(opened.navigation), result.qualification);
  assert.equal(receipt.outcome, "opened-ready"); assert.equal(opened.documentTitle, "EasyEDA Pro - V3.2.209");
  assert.deepEqual(fixture.evaluate("[calls.registration,calls.project,calls.page]"), [1, 1, 1]);
  await assert.rejects(fixture.run(`return (${CURRENT_SCHEMATIC_DISPLAY_START_FUNCTION})();`), /SCHEMATIC_DISPLAY_START/u);
});
