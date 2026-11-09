/* oxlint-disable import/max-dependencies -- Actual independent native codebooks expose shared immutable programs and both historical storage formats. */
/** Complete source-only table restoration. These fixed generators allocate no
 * Inspector, native owner, application, process or compiler. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { currentPcbDiagnosticFixedTableNativeSource } from "../src/current-pcb-diagnostic-fixed-table-native.ts";
import { currentFootprintInverseNativeGetTaskCallbackNativeSource } from "../src/current-footprint-inverse-native-get-task-callback-native.ts";
import { currentFootprintInverseNativeGetTaskManagerNativeSource } from "../src/current-footprint-inverse-native-get-task-manager-native.ts";
import { currentFootprintInverseNativeDeleteRegistrationNativeSource } from "../src/current-footprint-inverse-native-delete-registration-native.ts";
import { currentFootprintInverseDeleteSendNativeSource } from "../src/current-footprint-inverse-delete-send-native.ts";
import { currentFootprintInverseReferenceEntryNativeSource } from "../src/current-footprint-inverse-reference-entry-native.ts";
import { currentFootprintInverseReferenceUiNativeSource } from "../src/current-footprint-inverse-reference-ui-native.ts";
import { currentFootprintInverseDeleteCollateralNativeSource } from "../src/current-footprint-inverse-delete-collateral-native.ts";
import { currentFootprintInverseGetIntrinsicsNativeSource } from "../src/current-footprint-inverse-get-intrinsics-native.ts";
import { projectCurrentFootprintInverseCapturedNativePrograms as captured, CURRENT_FOOTPRINT_INVERSE_TASK_STORAGE_CATALOGUE as catalogue, expandCurrentFootprintInverseNativePrograms as expand, projectCurrentFootprintInverseNativePrograms as legacy, projectCurrentFootprintInverseTaskNativePrograms as project } from "../src/current-footprint-inverse-native-program-storage.ts";

void test("inverse task V3 shares actual native/reference/DEL helpers and restores both original historical formats", () => {
  assert.deepEqual(catalogue, { rows: 18, bytes: 92_216, sha256: "fe4d5948dc22ef86ac742c3c2e7c34189f085c9b9f9b23df5cd1b7e5dabfe265" });
  const original = [currentPcbDiagnosticFixedTableNativeSource(), currentFootprintInverseNativeGetTaskCallbackNativeSource(), currentFootprintInverseNativeGetTaskManagerNativeSource(), currentFootprintInverseNativeDeleteRegistrationNativeSource(), currentFootprintInverseDeleteSendNativeSource(), currentFootprintInverseReferenceEntryNativeSource(), currentFootprintInverseReferenceUiNativeSource(), currentFootprintInverseDeleteCollateralNativeSource(), currentFootprintInverseGetIntrinsicsNativeSource()].join("\n"); const packed = project(original); const old = legacy(original); const previous = captured(original);
  assert.ok(packed.includes("// BEGIN FIXED FOOTPRINT INVERSE PROGRAM DATA V3")); assert.ok(packed.length < previous.length); assert.equal(expand(packed), original); assert.equal(project(packed), packed); assert.equal(expand(old), original); assert.equal(expand(previous), original); assert.equal(project(old), packed); assert.equal(project(previous), packed); assert.equal(captured(packed), previous); assert.equal(legacy(packed), old);
  assert.throws(() => expand(packed.replace("expandedLength>65536", "expandedLength>65537"))); assert.throws(() => expand(packed.replace("// END FIXED FOOTPRINT INVERSE PROGRAM DATA V3", ""))); assert.throws(() => expand("EasyedaFootprintInverseProgramDataV3.Load("));
});
