/** Exact fixed codebooks only. These checks allocate no inspector, native
 * owner, application or generated runtime artifact. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { currentPcbDiagnosticFixedTableNativeSource } from "../src/current-pcb-diagnostic-fixed-table-native.ts";
import { currentPcbViaMainBeginNativeSource } from "../src/current-pcb-via-main-begin-native-fragment.ts";
import { currentPcbViaMainHistoryNativeSource } from "../src/current-pcb-via-main-history-native-fragment.ts";
import { currentPcbViaMainStructureNativeSource } from "../src/current-pcb-via-main-structure-native-fragment.ts";
import { currentSelectedFileMainSqlFenceNativeSource } from "../src/current-selected-file-main-sql-fence-native.ts";
import { expandCurrentFootprintInverseNativePrograms as expandInverse, projectCurrentFootprintInverseCapturedNativePrograms as inverse, projectCurrentFootprintInverseNativePrograms as inverseLegacy } from "../src/current-footprint-inverse-native-program-storage.ts";
import { expandCurrentSchematicNativePrograms as expandSchematic, projectCurrentSchematicCapturedNativePrograms as schematic, projectCurrentSchematicNativePrograms as schematicLegacy } from "../src/current-schematic-native-program-storage.ts";

const profiles = [
  { name: "inverse", project: inverse, legacy: inverseLegacy, expand: expandInverse, marker: "FOOTPRINT INVERSE PROGRAM DATA V2", className: "EasyedaFootprintInverseProgramDataV2" },
  { name: "schematic", project: schematic, legacy: schematicLegacy, expand: expandSchematic, marker: "SCHEMATIC PROGRAM DATA V5", className: "EasyedaSchematicProgramDataV5" },
] as const;

/** Exercise the complete actual SQL codebook through both catalogue versions.
 * Every original compiler byte must restore, including canonical packed rows;
 * changed decoder code and unknown storage markers must refuse. */
function verify(profile: typeof profiles[number]): void {
  const original = [currentPcbDiagnosticFixedTableNativeSource(), currentSelectedFileMainSqlFenceNativeSource(), currentPcbViaMainBeginNativeSource(), currentPcbViaMainHistoryNativeSource(), currentPcbViaMainStructureNativeSource()].join("\n");
  const captured = profile.project(original), legacy = profile.legacy(original);
  assert.ok(captured.includes(`// BEGIN FIXED ${profile.marker}`));
  assert.ok(Buffer.byteLength(captured) < Buffer.byteLength(legacy));
  assert.equal(profile.expand(captured), original);
  assert.equal(profile.expand(legacy), original);
  assert.equal(profile.project(captured), captured);
  assert.equal(profile.project(legacy), captured);
  assert.equal(profile.legacy(captured), legacy);
  assert.throws(() => profile.expand(captured.replace("expandedLength>65536", "expandedLength>65537")), /PROGRAM_STORAGE/u);
  assert.throws(() => profile.expand(captured.replace(`// END FIXED ${profile.marker}`, "")), /PROGRAM_STORAGE/u);
  assert.throws(() => profile.expand(`${profile.className}.Load(`), /PROGRAM_STORAGE/u);
}

for (const profile of profiles) {
  void test(`${profile.name} captured classifier catalogue preserves actual SQL commands and historical restoration`, () => { verify(profile); });
}
