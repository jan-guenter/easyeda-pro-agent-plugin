import assert from "node:assert/strict";
import { test } from "node:test";
import { MANAGED_SCHEMATIC_FIXTURE_TEXT } from "../src/managed-schematic-fixture-generator.ts";
import { buildGeneratedSchematicDisplayNativeArguments, prepareGeneratedSchematicDisplayBodyPlan, projectGeneratedSchematicInitialNativeTextBody } from "../src/generated-schematic-display-source.ts";
import { generatedSchematicDisplayRequestSchema } from "../src/generated-schematic-display.ts";

void test("current native Text projection declares every initial body difference and preserves literal value", () => {
  const body = projectGeneratedSchematicInitialNativeTextBody(MANAGED_SCHEMATIC_FIXTURE_TEXT);
  assert.equal(body["fillColor"], "#000000"); assert.equal(Object.hasOwn(body, "version"), false); assert.equal(Object.hasOwn(body, "groupId"), false);
  const { groupId: _group, version: _version, ...expected } = MANAGED_SCHEMATIC_FIXTURE_TEXT;
  assert.deepEqual(body, { ...expected, fillColor: expected.color });
  assert.throws(() => projectGeneratedSchematicInitialNativeTextBody({ ...MANAGED_SCHEMATIC_FIXTURE_TEXT, value: "changed literal" }));
});
void test("new209 display data reuses the original field mapper without accepting old source eligibility or persistence", () => {
  const result = prepareGeneratedSchematicDisplayBodyPlan({ x: 25, y: 0, bold: true, fontSize: 24, alignMode: 5 });
  assert.equal(result.nativeAfterBody["x"], 25); assert.equal(Number(result.nativeAfterBody["y"]), 0);
  assert.equal(result.nativeAfterBody["fontWeight"], true); assert.equal(result.nativeAfterBody["fontSize"], 24); assert.equal(result.nativeAfterBody["align"], "CENTER_MIDDLE");
  assert.equal(result.nativeAfterBody["value"], MANAGED_SCHEMATIC_FIXTURE_TEXT.value); assert.equal(result.nativeBeforeBody["fillColor"], result.nativeAfterBody["fillColor"]);
  assert.equal(result.sourceVersionAliased, false); assert.equal(result.pageEligibilityVerified, false); assert.equal(result.nativeOwnerVerified, false); assert.equal(result.writerAuthority, false);
  assert.throws(() => prepareGeneratedSchematicDisplayBodyPlan({ bold: false })); assert.throws(() => prepareGeneratedSchematicDisplayBodyPlan({ x: null }));
});
void test("display request accepts only bounded literal root Text fields with no caller target, wiring or source selectors", () => {
  const base = { action: "prepare", operationId: "sch209-display-source-test", patch: { bold: true } };
  assert.equal(generatedSchematicDisplayRequestSchema.safeParse(base).success, true);
  for (const patch of [{ content: "new value" }, { netName: "GND" }, { primitiveId: "caller" }, { rotation: 45 }, { fontSize: 5000 }, { x: -0 }]) {
    assert.equal(generatedSchematicDisplayRequestSchema.safeParse({ ...base, patch }).success, false);
  }
  for (const extra of [{ target: "caller" }, { rawWindowsPath: "caller" }, { textId: "caller" }, { source: "caller" }]) {
    assert.equal(generatedSchematicDisplayRequestSchema.safeParse({ ...base, ...extra }).success, false);
  }
});

void test("a copied or structural checkpoint cannot issue native display arguments", () => {
  assert.throws(() => Reflect.apply(buildGeneratedSchematicDisplayNativeArguments, undefined,
    [{ profile: "easyeda-pro-control.generated-schematic-fixture-open-checkpoint.v1", qualification: {}, history: {} }, "sch209-display-forged-checkpoint", { bold: true }]), /Original generated fixture checkpoint owner/u);
});
