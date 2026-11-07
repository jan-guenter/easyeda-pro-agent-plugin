/** Fixed source/wire boundaries only. No native owner, prefix or action grant. */
/* oxlint-disable import/max-dependencies -- Compare independently sealed writer and released grammars with the common source guard. */
import { expandCurrentPcbDiagnosticCSharpReviewSource } from "../src/current-pcb-diagnostic-csharp-review-storage.ts";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { currentProjectSaveProducerGuardCases, validateCurrentProjectSaveProducerGuardCommand } from "../src/current-project-save-producer-guard-protocol.ts";
import { currentProjectSaveProducerGuardWire } from "../src/current-project-save-producer-guard-wire.ts";
import { applyCurrentProjectSaveProducerGuardNativeFragment as guard } from "../src/current-project-save-producer-guard-native-fragment.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_GUARD_SITES as SITES, qualifyCurrentProjectSaveProducerGuardSource } from "../src/current-project-save-producer-guard-source.ts";
import { applyCurrentProjectStructureTransportNativeFragment as transport } from "../src/current-project-structure-transport-native-fragment.ts";
import { applyCurrentProjectStructureNativeFragment as structure } from "../src/current-project-structure-native-fragment.ts";
import { applyManagedFixtureRegistrationNativeFragment as registration } from "../src/managed-fixture-registration-native-fragment.ts";
import { applyCurrentPcbViaWriteNativeFragment as via } from "../src/current-pcb-via-write-native-fragment.ts";
import { applyCurrentSchematicDisplayWriteNativeFragment as schematic } from "../src/current-schematic-display-write-native-fragment.ts";
import { currentPcbViaWriteNativeRequest } from "../src/current-pcb-via-write-protocol.ts";
import { currentSchematicDisplayWriteNativeRequest } from "../src/current-schematic-display-write-protocol.ts";
import { diagnosticNativeRequest } from "../src/current-pcb-diagnostic-protocol.ts";
import { spatialDiagnosticNativeRequest } from "../src/current-pcb-spatial-protocol.ts";
import { requireOriginalCurrentProjectSaveProducerPrefix } from "../src/current-pcb-diagnostic-owner.ts";

function bytes(input: unknown): Buffer { return Buffer.from(`${JSON.stringify(input)}\0`); }
function compose(input: string): string { const base = registration(structure(input)), writers = schematic(via(base)); return guard(transport(writers)); }
void test("ten fixed guards cover all five history roots and pre-effect producer ingress without any resume grammar", () => {
  const cases = currentProjectSaveProducerGuardCases("original-script"); assert.equal(cases.length, 10); assert.equal(Object.keys(SITES).filter(role => role.startsWith("history")).length, 5);
  for (const command of cases) {
    assert.deepEqual(validateCurrentProjectSaveProducerGuardCommand(command), command);
    assert.throws(() => validateCurrentProjectSaveProducerGuardCommand({ ...command, method: "Debugger.resume", params: {} }));
    assert.throws(() => validateCurrentProjectSaveProducerGuardCommand({ ...command, params: { ...command.params, condition: "false" } }));
    for (const purpose of ["via", "schematic"] as const) {
      const encoded = bytes({ id: 1, ...command, producerGuardCommand: true, sessionId: "original-worker" }), wire = currentProjectSaveProducerGuardWire(command, 1, purpose);
      assert.deepEqual((purpose === "via" ? currentPcbViaWriteNativeRequest : currentSchematicDisplayWriteNativeRequest)(encoded), wire.request);
      assert.throws(() => diagnosticNativeRequest(encoded)); assert.throws(() => spatialDiagnosticNativeRequest(encoded));
      for (const field of ["condition", "lineNumber", "columnNumber", "sessionId", "functionDeclaration", "grant"]) { assert.equal(Object.hasOwn(wire.request, field), false); }
    }
  }
  assert.throws(() => { qualifyCurrentProjectSaveProducerGuardSource("partial source"); });
  assert.throws(() => requireOriginalCurrentProjectSaveProducerPrefix({ profile: "private.current-pcb-via-save-producer-prefix.v1" }, {}, {}), /ORIGINAL_PREFIX/u);
});
void test("combined generation retains exact guard enrollment and never gives the guard a resume or cleanup path", async () => {
  const original = expandCurrentPcbDiagnosticCSharpReviewSource(await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8")), source = compose(original);
  assert.equal(compose(source), source); assert.equal(guard(source), source);
  for (const action of ["pcb-via-producer-guard", "pcb-via-producer-prefix-enroll", "schematic-display-producer-guard", "schematic-display-producer-prefix-enroll"]) { assert.equal(source.split(`        '${action}' {`).length, 2); }
  assert.ok(source.includes('stage=="create"&&!viaProducerPrefixEnrolled')); assert.ok(source.includes("!viaStructureBootstrapResumed||!viaProducerModeRequested"));
  assert.throws(() => guard(source.replace("$owner.EnrollViaProducerPrefix()", "$owner.ForeignEnrollViaProducerPrefix()")), /CHANGED/u);
});
