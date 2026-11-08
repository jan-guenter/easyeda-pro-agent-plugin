/** Whole fixed schematic layout regeneration, with no helper/app dispatch. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { CURRENT_NATIVE_BASELINE } from "../../scripts/native-baseline-source.ts";
import { generateWorkerStartupProtocol } from "../../scripts/generate-worker-startup-protocol.ts";
import { generateSchematicSavedReadbackNativeSource } from "../../scripts/schematic-saved-readback-native-source.ts";
import { expandCurrentPcbDiagnosticCSharpReviewSource } from "../src/current-pcb-diagnostic-csharp-review-storage.ts";

void test("saved schematic reader native birth compose twice without duplicate main gates or dispatch", async () => {
  const seed = await readFile(new URL(`../../${CURRENT_NATIVE_BASELINE.relativePath}`, import.meta.url), "utf8");
  const first = generateWorkerStartupProtocol(seed, "schematic-saved"); assert.equal(generateWorkerStartupProtocol(first, "schematic-saved"), first);
  const expanded = expandCurrentPcbDiagnosticCSharpReviewSource(first);
  assert.equal(expanded.split("// BEGIN SCHEMATIC RELEVANCE SAVED READBACK BIRTH").length, 2);
  assert.equal(expanded.split("        'schematic-saved-early-actors' {").length, 2);
  assert.equal(expanded.split("if(schematicSavedReadback209)return SchematicSavedCurrentRequestLimit();").length, 2);
  assert.throws(() => generateWorkerStartupProtocol(expanded.replace('throw Error("schematic-saved-birth")', 'throw Error("changed-birth")'), "schematic-saved"), /SCHEMATIC_SAVED_NORMALIZE_BLOCK/u);
  const data = generateSchematicSavedReadbackNativeSource(seed), header = data.helper.slice(0, data.helper.indexOf("\n"));
  assert.equal(header, "param([switch]$CompileOnly,[switch]$SchematicRelevanceSavedReadback209)");
  assert.equal(data.compiler.includes("CreateSchematicRelevanceDisplayWrite209"), false);
  assert.equal(data.compiler.includes("CreateSchematicWireEdit209"), false);
  assert.ok(data.helper.includes("$purposeCount -ne 1")); assert.ok(data.helper.includes("[EasyedaDiagnosticOwner]::VerifySchematicSavedReadbackSmoke()"));
  assert.ok(Buffer.byteLength(data.helper) <= 2_097_152 && Buffer.byteLength(data.compiler) <= 2_097_152);
});
