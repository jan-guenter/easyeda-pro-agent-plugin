/** Source projection only. No PowerShell, owner or application is created. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {test} from "node:test";
import {generateFootprintInverseNativeSource} from "../../scripts/footprint-inverse-native-source.ts";
import {generateSchematicEditNativeSource} from "../../scripts/schematic-edit-native-source.ts";
import {expandCurrentPcbDiagnosticCSharpReviewSource} from "../src/current-pcb-diagnostic-csharp-review-storage.ts";
import {projectCurrentSchematicViaSdkRuntime as project,projectCurrentFootprintInverseViaSdkRuntime} from "../src/current-pcb-via-write-native-fragment.ts";

void test("the exact closed schematic driver omits only Via SDK execution and rejects mixed or changed closure",async()=>{
 const seed=await readFile(new URL("../../scripts/native-baseline/shared-owner.ps1.txt",import.meta.url),"utf8");const data=generateSchematicEditNativeSource(seed);const source=project(expandCurrentPcbDiagnosticCSharpReviewSource(data.helper));
 assert.ok(data.helper.startsWith("param([switch]$CompileOnly,[switch]$SchematicRelevanceDisplayWrite209,[switch]$SchematicWireEdit209)"));assert.ok(data.helper.includes("$PcbViaWrite209=[System.Management.Automation.SwitchParameter]$false"));assert.ok(data.helper.includes("$owner=if ($SchematicRelevanceDisplayWrite209) {[EasyedaDiagnosticOwner]::CreateSchematicRelevanceDisplayWrite209()} else {[EasyedaDiagnosticOwner]::CreateSchematicWireEdit209()}"));
 assert.equal(project(source),source);assert.equal(source.includes("ViaSdkFunction"),false);assert.equal(source.split("PcbViaSdkProtocolMessage(").length-1,2);assert.equal(source.split("SendPcbViaSdk(").length-1,2);assert.ok(source.includes("public static EasyedaDiagnosticOwner CreatePcbViaWrite209()"));assert.ok(source.includes("public void SendPcbViaSdkProperties("));assert.ok(source.includes("class EasyedaSelectedFileMainSqlFenceProtocol"));
 const marker="// BEGIN CLOSED SCHEMATIC VIA SDK";
 for(const changed of[source.replace(marker,""),source.replace(marker,`${marker}\n${marker}`),source.replace('throw new InvalidOperationException("schematic-via-sdk-codec-closed")','throw new InvalidOperationException("changed-codec")'),`${source}\nstatic string ViaSdkFunction="foreign";`,source.replace("// BEGIN GENERATED SCHEMATIC WIRE EDIT BIRTH209","// BEGIN FOREIGN BIRTH")]){assert.throws(()=>project(changed));}
 assert.throws(()=>project(seed));
});

void test("the inverse projection has a separate fixed closure and retains its disabled compatibility dispatch",async()=>{
 const seed=await readFile(new URL("../../scripts/native-baseline/shared-owner.ps1.txt",import.meta.url),"utf8");const data=generateFootprintInverseNativeSource(seed);const before=expandCurrentPcbDiagnosticCSharpReviewSource(data.helper);const source=projectCurrentFootprintInverseViaSdkRuntime(before);
 assert.ok(data.helper.startsWith("param([switch]$CompileOnly,[switch]$FootprintInverse209,"));assert.ok(data.helper.includes("$PcbViaWrite209=[System.Management.Automation.SwitchParameter]$false"));assert.ok(data.helper.includes("$owner=[EasyedaDiagnosticOwner]::CreateFootprintInverse209()"));
 assert.equal(projectCurrentFootprintInverseViaSdkRuntime(source),source);assert.equal(source.includes("ViaSdkFunction"),false);assert.equal(source.split("PcbViaSdkProtocolMessage(").length-1,2);assert.equal(source.split("SendPcbViaSdk(").length-1,2);assert.ok(source.includes("public static EasyedaDiagnosticOwner CreatePcbViaWrite209()"));assert.ok(source.includes("class EasyedaSelectedFileMainSqlFenceProtocol"));assert.ok(source.includes('throw new InvalidOperationException("inverse-via-sdk-codec-closed")'));
 for(const changed of[source.replace("// BEGIN CLOSED INVERSE VIA SDK","// BEGIN CLOSED SCHEMATIC VIA SDK"),source.replace("public void AdmitFootprintInverseAction(string action)","public void AdmitForeignAction(string action)"),source.replace('throw new InvalidOperationException("inverse-via-sdk-codec-closed")','throw new InvalidOperationException("changed-codec")')]){assert.throws(()=>projectCurrentFootprintInverseViaSdkRuntime(changed));}
 // The inverse generator closes this SDK family; repeated projection preserves its bytes.
 assert.throws(()=>projectCurrentFootprintInverseViaSdkRuntime(seed));assert.equal(source,before);
});
