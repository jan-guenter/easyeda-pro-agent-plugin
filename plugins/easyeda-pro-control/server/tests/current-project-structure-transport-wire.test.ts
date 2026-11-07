/** Fixed native codecs and source composition only; no native owner is opened. */
/* oxlint-disable import/max-dependencies -- Compare two distinct writer grammars against the common fixed transport and released grammars. */
import { expandCurrentPcbDiagnosticCSharpStorage } from "../src/current-pcb-diagnostic-csharp-storage.ts";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { applyCurrentProjectStructureTransportNativeFragment as transport } from "../src/current-project-structure-transport-native-fragment.ts";
import { currentProjectStructureTransportNativeSource } from "../src/current-project-structure-transport-native.ts";
import { currentProjectStructureTransportTemplates, currentProjectStructureTransportWire } from "../src/current-project-structure-transport-wire.ts";
import { currentProjectStructureTransportNativeCases } from "../src/current-project-structure-transport-protocol.ts";
import { applyCurrentProjectStructureNativeFragment as structure } from "../src/current-project-structure-native-fragment.ts";
import { applyManagedFixtureRegistrationNativeFragment as registration } from "../src/managed-fixture-registration-native-fragment.ts";
import { applyCurrentPcbViaWriteNativeFragment as via } from "../src/current-pcb-via-write-native-fragment.ts";
import { applyCurrentSchematicDisplayWriteNativeFragment as schematic } from "../src/current-schematic-display-write-native-fragment.ts";
import { currentPcbViaWriteNativeRequest } from "../src/current-pcb-via-write-protocol.ts";
import { currentSchematicDisplayWriteNativeRequest } from "../src/current-schematic-display-write-protocol.ts";
import { diagnosticNativeRequest } from "../src/current-pcb-diagnostic-protocol.ts";
import { spatialDiagnosticNativeRequest } from "../src/current-pcb-spatial-protocol.ts";

function bytes(value: unknown): Buffer { return Buffer.from(`${JSON.stringify(value)}\0`); }
function compose(source: string): string { const base = registration(structure(source)), writers = schematic(via(base)); return transport(writers); }
void test("all16 transport calls substitute original native context and keep both released grammars closed", () => {
  const cases = currentProjectStructureTransportNativeCases(), templates = currentProjectStructureTransportTemplates(); assert.equal(cases.length, 16);
  assert.equal(new Set(templates.map(row => row.phase)).size, 16);
  for (const purpose of ["via", "schematic"] as const) {
    for (const command of cases) {
      const wire = currentProjectStructureTransportWire(command, 1, purpose);
      const encoded = bytes({ id: 1, ...command, structureTransportCommand: true, sessionId: "original-worker" });
      const decode = purpose === "via" ? currentPcbViaWriteNativeRequest : currentSchematicDisplayWriteNativeRequest;
      assert.deepEqual(decode(encoded), wire.request);
      for (const key of ["uniqueContextId", "sessionId", "functionDeclaration", "condition", "lineNumber", "grant"]) { assert.equal(Object.hasOwn(wire.request, key), false); }
      assert.throws(() => diagnosticNativeRequest(encoded)); assert.throws(() => spatialDiagnosticNativeRequest(encoded));
      assert.throws(() => decode(bytes({ id: 1, ...command, structureTransportCommand: true, sessionId: "original-worker", grant: true })));
    }
  }
  const captured = templates.find(row => row.phase === "project-structure-transport-capture"); assert.ok(captured);
  assert.deepEqual(captured.fields, []); assert.match(captured.template, /__project_structure_transport_boundContext__/u);
  assert.match(currentProjectStructureTransportNativeSource(), /Regex\.Replace/u);
});
void test("the full transport fragment stays idempotent across adjacent dispatcher movement and cap predecessors", async () => {
  const original = expandCurrentPcbDiagnosticCSharpStorage(await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8")), source = compose(original);
  assert.equal(compose(source), source); assert.equal(transport(source), source);
  const prior = source.replace("if(schematicDisplayWrite209)return 775;", "if(schematicDisplayWrite209)return 747;").replace("$requestLimit=775", "$requestLimit=747")
    .replace("return pcbViaWrite209?1177:", "return pcbViaWrite209?1149:").replace("$requestLimit=if ($PcbViaWrite209) {1177}", "$requestLimit=if ($PcbViaWrite209) {1149}");
  assert.equal(compose(prior), source);
  for (const marker of ["pcb-via-structure-transport-bind", "pcb-via-structure-transport", "schematic-display-structure-transport-bind", "schematic-display-structure-transport"]) {
    assert.equal(source.split(`        '${marker}' {`).length, 2);
  }
  assert.match(source, /viaStructureTransportPublished=false/u); assert.match(source, /schematicStructureTransportPublished=false/u);
  assert.match(source, /project-structure-transport-original-publication-required/u);
  assert.throws(() => transport(source.replace("$owner.BindViaStructureTransport", "$owner.ForeignBindViaStructureTransport")), /CHANGED/u);
  assert.throws(() => transport(source.replace("// END ORIGINAL SHARED STRUCTURE TRANSPORT", "// foreign-end")), /MARKERS/u);
});
