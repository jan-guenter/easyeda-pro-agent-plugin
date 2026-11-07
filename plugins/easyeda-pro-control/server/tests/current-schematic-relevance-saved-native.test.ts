/** Whole fixed schematic layout regeneration, with no helper/app dispatch. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { generateWorkerStartupProtocol } from "../../scripts/generate-worker-startup-protocol.ts";
import { generateSchematicEditNativeSource } from "../../scripts/schematic-edit-native-source.ts";
import { expandCurrentPcbDiagnosticCSharpReviewSource } from "../src/current-pcb-diagnostic-csharp-review-storage.ts";

void test("three distinct schematic native births compose twice without duplicate main gates or dispatch", async () => {
  const seed = await readFile(new URL("../../scripts/native-baseline/shared-owner.ps1.txt", import.meta.url), "utf8");
  const first = generateWorkerStartupProtocol(seed, "schematic"); assert.equal(generateWorkerStartupProtocol(first, "schematic"), first);
  const expanded = expandCurrentPcbDiagnosticCSharpReviewSource(first);
  assert.equal(expanded.split("// BEGIN SCHEMATIC RELEVANCE SAVED READBACK BIRTH").length, 2);
  assert.equal(expanded.split("        'schematic-saved-early-actors' {").length, 2);
  assert.equal(expanded.split("if(schematicSavedReadback209)return 19;").length, 2);
  assert.throws(() => generateWorkerStartupProtocol(expanded.replace('throw Error("schematic-saved-purpose");switch', 'throw Error("changed-purpose");switch'), "schematic"), /SCHEMATIC_SAVED_NORMALIZE_BLOCK/u);
  const data = generateSchematicEditNativeSource(seed), header = data.helper.slice(0, data.helper.indexOf("\n"));
  assert.equal(header, "param([switch]$CompileOnly,[switch]$SchematicRelevanceDisplayWrite209,[switch]$SchematicWireEdit209,[switch]$SchematicRelevanceSavedReadback209)");
  assert.ok(data.helper.includes("$purposeCount -ne 1")); assert.ok(data.helper.includes("[EasyedaDiagnosticOwner]::VerifySchematicSavedReadbackSmoke()"));
  assert.ok(Buffer.byteLength(data.helper) <= 2_097_152 && Buffer.byteLength(data.compiler) <= 2_097_152);
});
