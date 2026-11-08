/** The inverse helper has no schematic birth or runtime route. Other layouts
 * retain the original schematic code and selected-file installation policy. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { generateWorkerStartupProtocol } from "../../scripts/generate-worker-startup-protocol.ts";
import { expandCurrentPcbDiagnosticCSharpReviewSource } from "../src/current-pcb-diagnostic-csharp-review-storage.ts";
import { projectCurrentFootprintInverseSchematicRuntime } from "../src/current-footprint-inverse-native-schematic-projection.ts";

void test("closed inverse omits schematic runtime and retains only refusing shared entries", async () => {
  const seed = await readFile(new URL("../../scripts/native-baseline/shared-owner.ps1.txt", import.meta.url), "utf8");
  const inverse = generateWorkerStartupProtocol(seed, "inverse");
  assert.equal(generateWorkerStartupProtocol(inverse, "inverse"), inverse);
  const source = expandCurrentPcbDiagnosticCSharpReviewSource(inverse);
  assert.ok(source.includes("readonly bool schematicDisplayWrite209=false;"));
  for (const [signature, code] of [
    ["public static EasyedaDiagnosticOwner CreateSchematicDisplayWrite209()", "birth"],
    ["public void AdmitSchematicDisplayAction(string action)", "action"],
    ["void SchematicDisplayDiscovery(string method,string session)", "discovery"],
    ["void SendSchematicDisplayMain(int id,string phase,string method,System.Collections.IDictionary fields)", "main"],
  ]) { assert.ok(source.includes(`${signature}{throw Error("inverse-schematic-${code}-closed");}`)); }
  for (const name of ["schematicDisplayWrite209=true;", "SchematicDisplayStart=", "SchematicDisplayNavigation=", "SchematicDisplayStage=", "class EasyedaSchematicDisplayWorkerProtocol", "void SendSchematicDisplayNative(", "void BindSchematicDisplayWorker(", "VerifySchematicDisplayWorkerSmoke()", "VerifySchematicDisplaySmoke()"] ) { assert.equal(source.includes(name), false, name); }
  for (const action of ["worker-prepare", "worker-bind", "worker-parent", "worker", "native", "abort"]) { assert.equal(source.includes(`        'schematic-display-${action}' {`), false, action); }
  assert.ok(source.includes("return pcbViaWrite209||schematicDisplayWrite209||footprintInverse209;"));
  assert.ok(source.includes("if(SelectedSqlInstallation)installation.AdmitSelectedSql(paths,sizes,hashes);"));
  const diagnostic = expandCurrentPcbDiagnosticCSharpReviewSource(generateWorkerStartupProtocol(seed, "diagnostic"));
  assert.ok(diagnostic.includes("schematicDisplayWrite209=true;"));
  assert.ok(diagnostic.includes("class EasyedaSchematicDisplayWorkerProtocol"));
  const projected = projectCurrentFootprintInverseSchematicRuntime(diagnostic);
  for (const name of ["SHARED STRUCTURE TRANSPORT", "SHARED PRODUCER GUARDS", "SHARED PRODUCER OBSERVATION", "GENERATED INITIAL CACHE", "GENERATED INITIAL SYNC", "GENERATED PERIODIC SYNC"]) {
    const end = `// END ORIGINAL ${name}`, start = `// BEGIN ORIGINAL ${name}`;
    const block = (input: string): string => input.slice(input.indexOf(start), input.indexOf(end) + end.length);
    assert.equal(block(projected), block(diagnostic), name);
  }
  const begin = "// BEGIN GENERATED ORIGINAL SCHEMATIC DISPLAY MAIN BIRTH";
  assert.throws(() => projectCurrentFootprintInverseSchematicRuntime(diagnostic.replace(begin, `${begin}\n${begin}`)), /INVERSE_SCHEMATIC_BLOCK_ROSTER/u);
  assert.throws(() => projectCurrentFootprintInverseSchematicRuntime(diagnostic.replace("        'schematic-display-worker' {", "        'unknown-worker' {")), /INVERSE_SCHEMATIC_DISPATCH_ROSTER/u);
  assert.throws(() => projectCurrentFootprintInverseSchematicRuntime(diagnostic.replace("// BEGIN ORIGINAL SHARED PRODUCER GUARDS", "// BEGIN OMITTED SHARED PRODUCER GUARDS")), /INVERSE_SCHEMATIC_NESTED_ROSTER/u);
});
