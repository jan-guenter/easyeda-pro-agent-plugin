/** Pure metadata relation with an explicit issued-checkpoint test seam. No
 * production checkpoint, native original owner or SQL grant is constructed. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { loadSyntheticRegistryModule } from "./helpers/load-synthetic-registry-module.ts";

void test("fixed worker metadata omits PCB zIndex, updates real SCH parent/page, and preserves a later initial clock", async () => {
  const meta = { version: "100", updateTime: 100 }; const rawWindowsPath = String.raw`C:\Synthetic\Codex_fixture.eprj2`;
  const pcb = Object.freeze({ profile: "easyeda-pro-control.generated-fixture-open-checkpoint.v1", qualification: { target: { rawWindowsPath, documentUuid: "pcb" } },
    history: { documents: [{ uuid: "pcb", docType: "PCB", metadata: meta }] } });
  const sch = Object.freeze({ profile: "easyeda-pro-control.generated-schematic-fixture-open-checkpoint.v1", qualification: { target: { rawWindowsPath, schematicUuid: "parent", pageUuid: "page" } },
    history: { documents: [{ uuid: "parent", docType: "SCH", metadata: meta }, { uuid: "page", docType: "SCH_PAGE", metadata: meta }] } });
  const loaded = await loadSyntheticRegistryModule(new URL("../src/current-project-save-structure-expectation.ts", import.meta.url), (name, actual): unknown => {
    if (name === "./managed-fixture-generated-open-checkpoint.ts") { return { ...actual, assertOriginalGeneratedFixtureOpenCheckpoint: (input: unknown): void => { assert.equal(input, pcb); } }; }
    if (name === "./managed-schematic-fixture-open-checkpoint.ts") { return { ...actual, assertOriginalGeneratedSchematicFixtureOpenCheckpoint: (input: unknown): void => { assert.equal(input, sch); } }; }
    return actual;
  });
  const project = loaded["expectedCurrentGeneratedProjectSaveStructure"]; assert.ok(typeof project === "function");
  const pcbResult: unknown = Reflect.apply(project, undefined, [pcb, 200]); assert.equal(pcbResult, JSON.stringify({ boards: {}, schematics: {}, sheets: {}, pcbs: { pcb: {
    uuid: "pcb", title: "PCB1", board: "", parent_uuid: "", source: "", version: "200", updateTime: 200 } }, panels: {}, blockSymbols: {}, owner: { uuid: "C:\\Synthetic/", username: "", nickname: "" } }));
  const schResult: unknown = Reflect.apply(project, undefined, [sch, 200]); assert.equal(schResult, JSON.stringify({ boards: {}, schematics: { parent: { uuid: "parent", name: "Schematic1", board: "", source: "", version: "200", updateTime: 200 } },
    sheets: { page: { uuid: "page", title: "Sheet1", schematic_uuid: "parent", zIndex: 1, source: "", version: "200", updateTime: 200 } }, pcbs: {}, panels: {}, blockSymbols: {}, owner: { uuid: "C:\\Synthetic/", username: "", nickname: "" } }));
  const earlier: unknown = Reflect.apply(project, undefined, [sch, 50]); assert.equal(earlier, schResult.replaceAll('"200"', '"100"').replaceAll(':200', ':100'));
  assert.throws(() => Reflect.apply(project, undefined, [{ ...sch }, 200]));
});
