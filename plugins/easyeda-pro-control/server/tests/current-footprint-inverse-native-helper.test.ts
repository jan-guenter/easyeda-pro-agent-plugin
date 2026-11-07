/** Complete fixed helper custody and separate finite build layouts only.
 * No native owner, PowerShell, application or request is started here. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { captureCurrentFootprintInverseNativeHelper as capture } from "../src/current-footprint-inverse-native-helper.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_IDENTITY as IDENTITY } from "../src/current-footprint-inverse-native-identity.ts";
import { currentPcbDiagnosticCSharpRuntimeCompilerInput as compiler, expandCurrentPcbDiagnosticCSharpReviewSource as expand } from "../src/current-pcb-diagnostic-csharp-review-storage.ts";
import { CURRENT_PCB_DIAGNOSTIC_HELPER_SOURCE_MAX_BYTES as MAXIMUM } from "../src/current-pcb-diagnostic-helper-source-profile.ts";
import { applyPcb209SpatialNativeSource } from "../../scripts/pcb209-spatial-native-source.ts";

void test("fixed inverse loader binds the original challenge and exact complete helper bytes", async () => {
  const challenge = "ab".repeat(16), held = await capture("Synthetic-Distro", "footprint-inverse209", challenge); await held.verify();
  assert.ok(held.bootstrap.includes(IDENTITY.helper.sha256)); assert.ok(held.bootstrap.includes("[IO.FileShare]::Read"));
  assert.ok(held.bootstrap.includes(`-FootprintInverse209 -InverseReadyChallenge '${challenge}'`)); assert.equal(held.bootstrap.includes("-ComponentSpatial209"), false);
  for (const invalid of ["", "a".repeat(31), "A".repeat(32), "';command"]) { await assert.rejects(capture("Synthetic-Distro", "footprint-inverse209", invalid), /INVERSE_NATIVE_HELPER_SOURCE/u); }
  const wrongPurpose: unknown = Reflect.apply(capture, undefined, ["Synthetic-Distro", "pcb-via-write209", challenge]); assert.ok(wrongPurpose instanceof Promise); await assert.rejects(wrongPurpose, /INVERSE_NATIVE_HELPER_SOURCE/u);
});
void test("diagnostic and inverse layouts keep the immutable compiler cap and their separate runtime births", async () => {
  const root = new URL("../../scripts/", import.meta.url);
  const [diagnostic, inverse] = await Promise.all([readFile(new URL("pcb-diagnostic-owner.ps1", root), "utf8"), readFile(new URL("footprint-inverse-native.ps1", root), "utf8")]);
  for (const source of [diagnostic, inverse]) { assert.ok(Buffer.byteLength(source) <= MAXIMUM); assert.ok(Buffer.byteLength(compiler(source)) <= MAXIMUM); }
  assert.equal(MAXIMUM, 2 * 1024 * 1024);
  const read = expand(diagnostic); assert.equal(applyPcb209SpatialNativeSource(read), read); assert.ok(read.includes("SpatialPadReadFunction")); assert.ok(read.includes("SpatialArcReadFunction")); assert.ok(read.includes("ComponentReadFunction"));
  assert.equal(diagnostic.includes("[switch]$FootprintInverse209"), false); assert.equal(inverse.split("\n")[0], "param([switch]$CompileOnly,[switch]$FootprintInverse209,[string]$InverseReadyChallenge)");
  assert.ok(inverse.includes("$owner=[EasyedaDiagnosticOwner]::CreateFootprintInverse209()")); assert.equal(inverse.includes("$owner=if "), false);
});
