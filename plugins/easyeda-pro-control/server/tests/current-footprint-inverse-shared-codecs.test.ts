/** Closed build projection/codebook checks only. No app, PowerShell or native
 * helper is started, and all original inverse limits remain in their owner. */
/* oxlint-disable import/max-dependencies -- Exact original codebook modules and both complete fixed native graphs are compared in one build-only regression. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { generateWorkerStartupProtocol } from "../../scripts/generate-worker-startup-protocol.ts";
import { generateFootprintInverseNativeSource } from "../../scripts/footprint-inverse-native-source.ts";
import { currentPcbDiagnosticCSharpReviewSource, expandCurrentPcbDiagnosticCSharpReviewSource } from "../src/current-pcb-diagnostic-csharp-review-storage.ts";
import { currentScopedCacheNativeCodec } from "../src/current-scoped-cache-native-codec.ts";
import { currentScopedCacheMetadataNativeCodec } from "../src/current-pcb-via-saved-cache-metadata-native.ts";
import { currentPcbViaSavedLoadWorkerNativeSource } from "../src/current-pcb-via-saved-load-worker-native.ts";
import { CURRENT_PCB_VIA_SAVED_READBACK_PROFILE as PROFILE } from "../src/current-pcb-via-saved-readback-profile.ts";
import { applyCurrentPcbViaSavedReadbackNativeFragment as apply } from "../src/current-pcb-via-saved-readback-native-fragment.ts";
import { projectCurrentFootprintInverseSchematicRuntime } from "../src/current-footprint-inverse-native-schematic-projection.ts";
import { expandCurrentFootprintInverseNativeTypeAliases } from "../src/current-footprint-inverse-native-type-aliases.ts";
import { expandCurrentFootprintInverseNativeHashVectors } from "../src/current-footprint-inverse-native-hash-vector-storage.ts";

/** Restore fixed aliases and hash banks before comparing original codec bytes. */
function originalCodecs(input: string): string {
 const source=expandCurrentPcbDiagnosticCSharpReviewSource(input);
 const body=currentPcbDiagnosticCSharpReviewSource(source);
 return source.replace(body,expandCurrentFootprintInverseNativeHashVectors(expandCurrentFootprintInverseNativeTypeAliases(body)));
}

void test("inverse retains exact shared cache/metadata/load/actor bytes and omits the entire Saved Via runtime",async()=>{
 const seed=await readFile(new URL("../../scripts/native-baseline/shared-owner.ps1.txt",import.meta.url),"utf8");
 const diagnostic=currentPcbDiagnosticCSharpReviewSource(generateWorkerStartupProtocol(seed,"diagnostic")),inverse=generateFootprintInverseNativeSource(seed);const review=expandCurrentFootprintInverseNativeHashVectors(inverse.review);
 for(const codec of [currentScopedCacheNativeCodec(PROFILE.renderer.activeReadOnly),currentScopedCacheMetadataNativeCodec(PROFILE.renderer.activeReadOnly),currentPcbViaSavedLoadWorkerNativeSource()]){assert.ok(diagnostic.includes(codec),"Original shared codec bytes occur in the unchanged default family");assert.ok(review.includes(codec),"Closed inverse retains those same full program/table/options/hash bytes");}
 for(const name of ["SavedViaReadbackEarlyActorProtocolMessage","SavedViaReadbackActorProtocolMessage"]){const original=diagnostic.split("\n").filter(line=>line.startsWith(`public static string ${name}(`));assert.equal(original.length,1);assert.ok(original[0]!==undefined&&review.includes(original[0]),name);}
 for(const unavailable of ["savedViaReadback209","EasyedaSavedViaReadbackBirth","CreatePcbViaSavedReadback209","SendSavedViaReadbackMain","SendSavedViaReadbackCache","SendSavedViaMetadata","VerifySavedViaReadbackSmoke","SavedViaReadbackDiscovery"]){assert.equal(review.includes(unavailable),false,unavailable);}
 for(const action of ["saved-readback-abort","saved-readback-cache","saved-readback-metadata","saved-readback-worker","saved-readback-project-open","saved-readback-model","saved-readback-scene"]){assert.equal(inverse.helper.includes(`        '${action}' {`),false,action);}
 for(const unavailable of ["EasyedaSchematicDisplayClockProtocol", "EasyedaSchematicDisplayAccessorProtocol", "EasyedaSchematicDisplayActionProtocol", "SendSchematicDisplayClock", "SendSchematicDisplayAccessor", "SendSchematicDisplayAction", "ArmSchematicActionGuard"]){assert.ok(diagnostic.includes(unavailable));assert.equal(review.includes(unavailable),false,unavailable);}
 for(const action of ["schematic-display-action-guard-bind", "schematic-display-action-guard", "schematic-display-action", "schematic-display-accessor", "schematic-display-clock-bind", "schematic-display-clock"]){assert.equal(inverse.helper.includes(`        '${action}' {`),false,action);}
 assert.equal(inverse.helper.split("\n")[0],"param([switch]$CompileOnly,[switch]$FootprintInverse209,[string]$InverseReadyChallenge)");
 const names=[...inverse.helper.matchAll(/\[EasyedaDiagnosticOwner\]::(VerifyFootprintInverse\w*)\(\)/gu)].map(match=>match[1]);assert.ok(names.length>=28);assert.equal(new Set(names).size,names.length);
 const broad=generateWorkerStartupProtocol(seed,"inverse");assert.equal(generateWorkerStartupProtocol(broad,"inverse"),broad);
});
void test("inverse shared-codec block is idempotent and refuses edited blocks or unknown build modes",async()=>{
 const seed=await readFile(new URL("../../scripts/native-baseline/shared-owner.ps1.txt",import.meta.url),"utf8");const first=originalCodecs(generateWorkerStartupProtocol(seed,"inverse"));assert.equal(apply(first,"inverse-closed"),first);
 assert.throws(()=>apply(first.replace("SavedViaMetadataPrograms=","ChangedMetadataPrograms="),"inverse-closed"),/INVERSE_SHARED_SAVED_CODEC_BLOCK/u);
 assert.throws(()=>Reflect.apply(apply,undefined,[seed,"unknown"]),/SAVED_READBACK_BUILD_LAYOUT/u);
 const diagnostic=expandCurrentPcbDiagnosticCSharpReviewSource(generateWorkerStartupProtocol(seed,"diagnostic"));
 assert.throws(()=>projectCurrentFootprintInverseSchematicRuntime(diagnostic.replace("// END GENERATED SCHEMATIC ORIGINAL CLOCK OBSERVER","// changed clock boundary")),/INVERSE_SCHEMATIC_BLOCK_ROSTER/u);
 assert.throws(()=>projectCurrentFootprintInverseSchematicRuntime(`${diagnostic}\n// BEGIN ORIGINAL SCHEMATIC ACTION REFUSAL GUARDS`),/INVERSE_SCHEMATIC_BLOCK_ROSTER/u);
});
