/* oxlint-disable import/max-dependencies -- Source-only native protocol fixture additionally restores its exact stored compiler input. */
/** Original schematic birth grammar and composed native source only. No app,
 * native process, project or controller is opened by these checks. */
import { expandCurrentPcbDiagnosticCSharpStorage } from "../src/current-pcb-diagnostic-csharp-storage.ts";
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
  assert.deepEqual([PROFILE.main.normal, PROFILE.main.cleanup, PROFILE.main.total, PROFILE.renderer.total], [901, 8, 909, 2712]);
  assert.equal(PROFILE.workerOwnershipIssued, false); assert.equal(PROFILE.executionAuthorized, false); assert.equal(PROFILE.saveAuthorized, false);
  const request = { id: 16, method: "Target.getTargets" };
  assert.equal(currentSchematicDisplayWriteNativeRequest(wire(request))["requestId"], 16);
  for (const method of ["Runtime.evaluate", "Runtime.callFunctionOn", "Debugger.resume", "Target.setAutoAttach", "PCB_Document.save"]) {
    assert.throws(() => currentSchematicDisplayWriteNativeRequest(wire({ ...request, method })));
  }
  for (const id of [0, PROFILE.renderer.total + 1, PROFILE.renderer.total + 100]) { assert.throws(() => currentSchematicDisplayWriteNativeRequest(wire({ ...request, id }))); }
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
  const original = expandCurrentPcbDiagnosticCSharpStorage(await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8")), source = compose(original);
  assert.equal(compose(source), source);
  const viaLimit = /return pcbViaWrite209\?(\d+):/u.exec(source)?.[1]; assert.ok(viaLimit !== undefined);
  const previous = source.replace("if(schematicDisplayWrite209)return 2712;", "if(schematicDisplayWrite209)return 617;").replace("$requestLimit=2712", "$requestLimit=617").replace(`return pcbViaWrite209?${viaLimit}:`, "return pcbViaWrite209?1019:").replace(`$requestLimit=if ($PcbViaWrite209) {${viaLimit}}`, "$requestLimit=if ($PcbViaWrite209) {1019}");
  assert.equal(compose(previous), source);
  for (const fragment of ["CreateSchematicDisplayWrite209()", "EasyedaSchematicDisplayBirth", "schematic-display-old-purpose-smoke", "schematic-display-foreign-refusal-smoke",
    "if(schematicDisplayWrite209)return 2712;", "schematic-display-retain-main-until-exit", "schematic-display-main-construction-consumed"]) { assert.ok(source.includes(fragment), fragment); }
  const before = via(registration(structure(original))).split("\n").find(line => line.includes("int RequestLimit {"));
  const after = source.split("\n").find(line => line.includes("int RequestLimit {")); assert.ok(before !== undefined);
  assert.equal(after, before.replace(/if\(schematicDisplayWrite209\)return \d+;/u, `if(schematicDisplayWrite209)return ${String(PROFILE.renderer.total)};`));
  assert.equal(source.includes('sqlite3.Database='), false);
  assert.throws(() => schematic(original.replace("public static class EasyedaSelectedFileMainSqlFenceProtocol", "public static class ForeignSqlProtocol")), /SHARED_READONLY_SQL_DATA_REQUIRED/u);
  assert.throws(() => compose(original.replace("[switch]$StringPrecreate,", "[switch]$CallerPurpose,")), /ANCHOR/u);
});
