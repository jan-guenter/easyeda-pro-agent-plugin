/** Check the actual generated PowerShell/C# boundary. A compilable internal
 * class alone is insufficient for PowerShell's public type lookup. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { generateSchematicEditNativeSource } from "../../scripts/schematic-edit-native-source.ts";
import { generateWorkerStartupProtocol } from "../../scripts/generate-worker-startup-protocol.ts";
import { applySchematicPublicCompileSmokes } from "../src/current-schematic-native-compile-smoke-fragment.ts";

void test("every generated schematic PowerShell smoke call reaches an emitted public type and static method", async () => {
 const seed = await readFile(new URL("../../scripts/native-baseline/shared-owner.ps1.txt",import.meta.url),"utf8");
 const data = generateSchematicEditNativeSource(seed); const begin = data.helper.indexOf("  if ($CompileOnly) {"); const end = data.helper.indexOf("  $launched=$false",begin);
 const broad=generateWorkerStartupProtocol(seed,"schematic");assert.ok(generateWorkerStartupProtocol(broad,"schematic")===broad,"complete schematic composition remains byte-exact on its second pass");
 assert.ok(begin!==-1 && end>begin);
 const calls = [...data.helper.slice(begin,end).matchAll(/\[(Easyeda[A-Za-z0-9_]+)\]::([A-Za-z0-9_]+)\(\)/gu)];
 assert.equal(calls.length,7);
 assert.ok(calls.some(call=>call[2]==="VerifySchematicRelevanceModifyWorkerSmoke"));
 assert.ok(calls.some(call=>call[2]==="VerifySchematicRelevancePublicationSmoke"));
 assert.ok(calls.some(call=>call[2]==="VerifySchematicRelevanceDisplayRegistrationSmoke"));
 for(const call of calls){
  const type=call[1]; const method=call[2];assert.ok(type!==undefined && method!==undefined);
  assert.match(data.compiler,new RegExp(`public\\s+(?:(?:sealed|partial|static|abstract)\\s+)*class\\s+${type}\\b`,"u"));
  assert.ok(data.compiler.includes(`public static void ${method}(`));
 }
 assert.ok(data.compiler.includes("EasyedaProjectLibraryRefreshProtocol.VerifySmoke();"));
 assert.ok(data.compiler.includes("EasyedaSchematicRelevanceRunPrefixProtocol.VerifySmoke();"));
 assert.ok(data.compiler.includes("EasyedaSchematicRelevanceRunGuardProtocol.VerifySmoke();"));
 assert.equal(data.helper.includes("[EasyedaProjectLibraryRefreshProtocol]::VerifySmoke()"),false);
 const workflow=await readFile(new URL("../../../../.github/workflows/windows-launch-recovery.yml",import.meta.url),"utf8");
 assert.ok(workflow.includes("'-SchematicRelevanceSavedReadback209'"));
});
void test("public smoke fragment is idempotent and refuses a partial or modified publication",()=>{
 const source=applySchematicPublicCompileSmokes("header\n'@\ntail");
 assert.equal(applySchematicPublicCompileSmokes(source),source);
 assert.throws(()=>applySchematicPublicCompileSmokes(source.replace("VerifySchematicProtocolSmokes","foreign")));
 assert.throws(()=>applySchematicPublicCompileSmokes(source.replace("// END SCHEMATIC PUBLIC COMPILE SMOKES","")));
});
