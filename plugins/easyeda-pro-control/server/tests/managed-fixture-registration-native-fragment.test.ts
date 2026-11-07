/* oxlint-disable import/max-dependencies -- This boundary test checks exact packed source and both independent old native grammars directly. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { gunzip } from "node:zlib";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { diagnosticGeneratedFixtureRegistrationParams, diagnosticNativeRequest } from "../src/current-pcb-diagnostic-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_REGISTRATION_FUNCTION } from "../src/current-footprint-inverse-registration.ts";
import { GENERATED_FIXTURE_REGISTRATION_FUNCTION } from "../src/managed-fixture-registration-program.ts";
import { applyManagedFixtureRegistrationNativeFragment } from "../src/managed-fixture-registration-native-fragment.ts";
import { applyCurrentProjectStructureNativeFragment } from "../src/current-project-structure-native-fragment.ts";
import { spatialDiagnosticNativeRequest } from "../src/current-pcb-spatial-protocol.ts";

function wire(input: unknown): Buffer { return Buffer.from(`${JSON.stringify(input)}\0`); }

void test("maintained native fragment embeds the complete fixed program and isolates a new finite birth without changing old budgets", async () => {
  const original = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  const generated = applyManagedFixtureRegistrationNativeFragment(original);
  assert.equal(applyManagedFixtureRegistrationNativeFragment(generated), generated);
  assert.equal(applyManagedFixtureRegistrationNativeFragment(applyCurrentProjectStructureNativeFragment(generated)), generated);
  const match = /ManagedRegistrationPrograms=EasyedaDiagnosticFixedTable.Load\(@"([A-Za-z\d+/=]+)",(\d+),@"([a-f\d]{64})",@"([a-f\d]{64})",2,2\);/u.exec(generated);
  assert.ok(match?.[1] !== undefined && match[2] !== undefined && match[3] !== undefined && match[4] !== undefined);
  const compressed = Buffer.from(match[1], "base64"), plain = await promisify(gunzip)(compressed);
  const rows=plain.toString("utf8").split("\0").map(row=>row.split("\t"));assert.deepEqual(rows,[["generated-fixture",GENERATED_FIXTURE_REGISTRATION_FUNCTION],["footprint-inverse",CURRENT_FOOTPRINT_INVERSE_REGISTRATION_FUNCTION]]);
  assert.equal(plain.length, Number(match[2]));assert.ok(plain.length<=60_000);
  assert.equal(createHash("sha256").update(plain).digest("hex"), match[3]); assert.equal(createHash("sha256").update(compressed).digest("hex"), match[4]);
  for(const program of [GENERATED_FIXTURE_REGISTRATION_FUNCTION,CURRENT_FOOTPRINT_INVERSE_REGISTRATION_FUNCTION]){assert.ok(generated.includes(createHash("sha256").update(program).digest("hex")));}
  assert.ok(generated.includes('ManagedRegistrationPrograms[index][0]!=role'));
  assert.ok(generated.includes('GeneratedFixtureRegistrationFunction=ManagedRegistrationProgramAt(0,"generated-fixture")'));
  assert.ok(generated.includes('FootprintInverseRegistrationFunction=ManagedRegistrationProgramAt(1,"footprint-inverse")'));
  for (const clause of ["CreateGeneratedFixture209()", "generatedFixtureRegistrationConsumed=true", "RequireGeneratedFixtureOpening(sessionId,uniqueContextId,path,project,branch,document,source);",
    "pcb-diagnostic-conflicting-generated-fixture-purpose", "VerifyGeneratedFixtureRegistrationSmoke()", "generated-registration-old-birth-smoke"] ) { assert.ok(generated.includes(clause)); }
  assert.ok(generated.includes("$request.generatedFixtureRegistrationPhase -isnot [string]"));
  assert.ok(generated.includes("CreateGeneratedFixtureSpatial209()")); assert.ok(generated.includes("spatial.layers209"));
  assert.equal(generated.includes("[int]$GeneratedFixtureRequestLimit"), false);
  assert.throws(() => applyManagedFixtureRegistrationNativeFragment(original.replace("param([switch]$CompileOnly,", "paramChanged([switch]$CompileOnly,")), /ANCHOR/u);
});
void test("registration wire carries only exact identifiers and rejects alternate code, options, phase, target and extra fields", () => {
  const rawWindowsPath = String.raw`C:\SyntheticTemp\CodexEasyedaFixture_11111111111111111111111111111111\Codex_via_only_2222222222222222.eprj2`;
  const target = { rawWindowsPath, projectUuid: createHash("sha256").update(rawWindowsPath).digest("hex"), branchUuid: "a".repeat(32), documentUuid: "b".repeat(32), expectedSourceSha256: "c".repeat(64) };
  const params = diagnosticGeneratedFixtureRegistrationParams("original", target);
  const command = { id: 103, method: "Runtime.callFunctionOn", params, sessionId: "parent" };
  const request = diagnosticNativeRequest(wire(command));
  assert.equal(request["generatedFixtureRegistrationPhase"], "register-generated-fixture"); assert.equal(request["targetRawWindowsPath"], rawWindowsPath);
  assert.equal(Object.hasOwn(request, "functionDeclaration"), false); assert.equal(Object.hasOwn(request, "arguments"), false);
  assert.equal(spatialDiagnosticNativeRequest(wire({ ...command, id: 383 }))["requestId"], 383);
  assert.throws(() => spatialDiagnosticNativeRequest(wire({ ...command, id: 384 })), /CLEANUP_RESERVE/u);
  for (const mutation of [
    { ...params, functionDeclaration: `${params.functionDeclaration}\n` }, { ...params, userGesture: true },
    { ...params, arguments: [params.arguments[0], { value: "open-project" }] },
    { ...params, arguments: [{ value: { ...target, rawWindowsPath: `${rawWindowsPath}x` } }, params.arguments[1]] },
    { ...params, extra: true }, { ...params, objectId: "foreign" },
  ]) { assert.throws(() => diagnosticNativeRequest(wire({ ...command, params: mutation }))); }
});
