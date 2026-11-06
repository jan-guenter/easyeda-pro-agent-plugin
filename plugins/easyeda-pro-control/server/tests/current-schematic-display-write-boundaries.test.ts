/** Original schematic birth grammar and composed native source only. No app,
 * native process, project or controller is opened by these checks. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { currentSchematicDisplayWriteNativeRequest } from "../src/current-schematic-display-write-protocol.ts";
import { CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PROFILE as PROFILE } from "../src/current-schematic-display-write-native-profile.ts";
import { applyCurrentSchematicDisplayWriteNativeFragment as schematic } from "../src/current-schematic-display-write-native-fragment.ts";
import { applyCurrentPcbViaWriteNativeFragment as via } from "../src/current-pcb-via-write-native-fragment.ts";
import { applyManagedFixtureRegistrationNativeFragment as registration } from "../src/managed-fixture-registration-native-fragment.ts";
import { applyCurrentProjectStructureNativeFragment as structure } from "../src/current-project-structure-native-fragment.ts";
import { CurrentSchematicDisplayWriteOwner, assertOriginalCurrentSchematicDisplayWriteOwner, startCurrentSchematicDisplayWriteOwner } from "../src/current-schematic-display-write-owner.ts";

function wire(value: unknown): Buffer { return Buffer.from(`${JSON.stringify(value)}\0`); }
function compose(source: string): string { const prepared = registration(structure(source)); return schematic(via(prepared)); }
void test("distinct schematic discovery has a bounded vocabulary and no worker, PCB, script or Save command", () => {
  assert.deepEqual([PROFILE.main.normal, PROFILE.main.cleanup, PROFILE.main.total, PROFILE.renderer.total], [901, 8, 909, 16]);
  assert.equal(PROFILE.workerOwnershipIssued, false); assert.equal(PROFILE.executionAuthorized, false); assert.equal(PROFILE.saveAuthorized, false);
  const request = { id: 16, method: "Target.getTargets" };
  assert.equal(currentSchematicDisplayWriteNativeRequest(wire(request))["requestId"], 16);
  for (const method of ["Runtime.evaluate", "Runtime.callFunctionOn", "Debugger.resume", "Target.setAutoAttach", "PCB_Document.save"]) {
    assert.throws(() => currentSchematicDisplayWriteNativeRequest(wire({ ...request, method })));
  }
  for (const id of [0, 17, 837]) { assert.throws(() => currentSchematicDisplayWriteNativeRequest(wire({ ...request, id }))); }
  assert.throws(() => currentSchematicDisplayWriteNativeRequest(wire({ ...request, foreign: true })));
});
void test("matching schematic/PCB checkpoint JSON and constructed facades cannot issue native ownership", async () => {
  const owner: unknown = Object.create(CurrentSchematicDisplayWriteOwner.prototype);
  assert.throws(() => Reflect.apply(assertOriginalCurrentSchematicDisplayWriteOwner, undefined, [owner]));
  const options = Object.freeze({ pluginRoot: "/synthetic", assetsRoot: "/synthetic-assets", powershellSha256: "a".repeat(64), powershellBytes: 1 });
  const pcb: unknown = Reflect.apply(startCurrentSchematicDisplayWriteOwner, undefined, [options, { profile: "private.generated-fixture-open-checkpoint.v1" }]); assert.ok(pcb instanceof Promise); await assert.rejects(pcb, /Original/u);
  const schematicCopy: unknown = Reflect.apply(startCurrentSchematicDisplayWriteOwner, undefined, [options, { profile: "private.generated-schematic-fixture-open-checkpoint.v1" }]); assert.ok(schematicCopy instanceof Promise); await assert.rejects(schematicCopy, /Original/u);
});
void test("separate schematic fragment composes twice without changing prior Via or generated birth spans", async () => {
  const original = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8"), source = compose(original);
  assert.equal(compose(source), source);
  for (const fragment of ["CreateSchematicDisplayWrite209()", "EasyedaSchematicDisplayBirth", "schematic-display-old-purpose-smoke", "schematic-display-foreign-refusal-smoke",
    "if(schematicDisplayWrite209)return 16; return pcbViaWrite209?837:spatial209?384:", "schematic-display-retain-main-until-exit", "schematic-display-main-construction-consumed"]) { assert.ok(source.includes(fragment), fragment); }
  assert.equal(source.includes('sqlite3.Database='), false);
  assert.throws(() => schematic(original), /SHARED_READONLY_SQL_DATA_REQUIRED/u);
  assert.throws(() => compose(original.replace("[switch]$StringPrecreate,", "[switch]$CallerPurpose,")), /ANCHOR/u);
});
