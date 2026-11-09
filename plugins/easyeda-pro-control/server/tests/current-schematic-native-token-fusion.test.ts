/* oxlint-disable import/max-dependencies -- Compare the independently versioned driver, program, alias and compiler storage contracts. */
/** Exact source restoration and fixed-purpose build selection only. No owner,
 * application, PowerShell or native process is created by these tests. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {test} from "node:test";
import {generateWorkerStartupProtocol} from "../../scripts/generate-worker-startup-protocol.ts";
import {expandCurrentSchematicNativePrograms,projectCurrentSchematicCapturedNativePrograms} from "../src/current-schematic-native-program-storage.ts";
import {expandCurrentSchematicNativeTypeAliasesV2} from "../src/current-schematic-native-type-aliases-v2.ts";
import {generateSchematicEditNativeSource} from "../../scripts/schematic-edit-native-source.ts";
import {currentPcbDiagnosticCSharpRuntimeCompilerInput as compiler,expandCurrentPcbDiagnosticCSharpReviewSource as expand,packCurrentPcbDiagnosticCSharpReviewStorage as packV2,currentPcbDiagnosticCSharpReviewSource as review} from "../src/current-pcb-diagnostic-csharp-review-storage.ts";
import {compactCurrentPcbDiagnosticCSharp as compactV2} from "../src/current-pcb-diagnostic-csharp-spacing.ts";
import {compactCurrentPcbDiagnosticCSharpV3 as compactV3,restoreCurrentPcbDiagnosticCSharpV3 as restoreV3} from "../src/current-pcb-diagnostic-csharp-spacing-v3.ts";
import {CURRENT_PCB_DIAGNOSTIC_HELPER_SOURCE_MAX_BYTES as MAXIMUM} from "../src/current-pcb-diagnostic-helper-source-profile.ts";

void test("the schematic build selects bounded v3 compiler bytes with exact original tokens and review restoration",async()=>{
 const seed=await readFile(new URL("../../scripts/native-baseline/shared-owner.ps1.txt",import.meta.url),"utf8");const actual=generateSchematicEditNativeSource(seed);const again=generateSchematicEditNativeSource(seed);assert.deepEqual(again,actual);
 assert.ok(actual.helper.includes("# BEGIN FIXED CURRENT209 CSHARP REVIEW STORAGE V3\n"));assert.equal(actual.helper.includes("# BEGIN FIXED CURRENT209 CSHARP REVIEW STORAGE V2\n"),false);
 const original=review(actual.helper),v2=compactV2(original),v3=compactV3(original);assert.equal(actual.review,original);assert.equal(actual.compiler,v3.compact);assert.equal(compiler(actual.helper),actual.compiler);assert.equal(v3.tokenSha256,v2.tokenSha256);assert.equal(restoreV3(v3.compact,v3.spacing,v3.tokenSha256),original);assert.ok(Buffer.byteLength(v3.compact)<Buffer.byteLength(v2.compact));assert.ok(Buffer.byteLength(actual.compiler)<=MAXIMUM);assert.ok(Buffer.byteLength(actual.helper)<=MAXIMUM);
 const expanded=expand(actual.helper);assert.ok(expanded.includes("Add-Type @'\n"));assert.equal(review(expanded),original);
 const unaliased=expanded.replace(original,expandCurrentSchematicNativeTypeAliasesV2(original));
 const programs=expandCurrentSchematicNativePrograms(unaliased);assert.notEqual(programs,unaliased);assert.equal(projectCurrentSchematicCapturedNativePrograms(programs),unaliased);const generated=generateWorkerStartupProtocol(seed,"schematic");assert.equal(generateWorkerStartupProtocol(generated,"schematic"),generated);
 const historical=packV2("Add-Type @'\nclass Fixed { public int Value = 1; }\n'@\n");assert.ok(historical.includes("# BEGIN FIXED CURRENT209 CSHARP REVIEW STORAGE V2\n"));assert.equal(review(historical),"class Fixed { public int Value = 1; }");
});
