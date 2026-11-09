/* oxlint-disable import/max-dependencies -- Compare independent driver, closure, alias, hash-bank and historical vector codecs without merging their contracts. */
/** Source projection only. No PowerShell, owner or application is created. */
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFile} from "node:fs/promises";
import {test} from "node:test";
import {generateWorkerStartupProtocol} from "../../scripts/generate-worker-startup-protocol.ts";
import {generateFootprintInverseNativeSource} from "../../scripts/footprint-inverse-native-source.ts";
import {generateSchematicEditNativeSource} from "../../scripts/schematic-edit-native-source.ts";
import {expandCurrentPcbDiagnosticCSharpReviewSource} from "../src/current-pcb-diagnostic-csharp-review-storage.ts";
import {projectCurrentSchematicViaSdkRuntime as project,projectCurrentFootprintInverseViaSdkRuntime} from "../src/current-pcb-via-write-native-fragment.ts";
import {expandCurrentFootprintInverseSmokeVectors as expandVectors,projectCurrentFootprintInverseSmokeVectors as packVectors} from "../src/current-footprint-inverse-smoke-vector-storage.ts";
import {expandCurrentSchematicNativeTypeAliasesV2} from "../src/current-schematic-native-type-aliases-v2.ts";
import {expandCurrentFootprintInverseNativeTypeAliases} from "../src/current-footprint-inverse-native-type-aliases.ts";
import {expandCurrentFootprintInverseNativeHashVectors} from "../src/current-footprint-inverse-native-hash-vector-storage.ts";

/** Transform exactly one C# body while retaining the generated PowerShell driver. */
function withBody(source:string,transform:(body:string)=>string):string {
 const begin="Add-Type @'\n",end="\n'@\n",start=source.indexOf(begin),stop=source.indexOf(end,start);
 assert.ok(start!==-1&&stop>start);assert.equal(source.split(begin).length,2);assert.equal(source.split(end).length,2);
 return source.slice(0,start+begin.length)+transform(source.slice(start+begin.length,stop))+source.slice(stop);
}
/** Select one complete generated member; duplicate or multiline substitutes fail. */
function member(source:string,signature:string):string {
 const rows=source.split("\n").filter(line=>line.startsWith(signature));assert.equal(rows.length,1);const line=rows[0];assert.ok(line!==undefined);return line;
}
/** Load the actual inverse sender captured before SDK closure, without emitting or executing a helper. */
async function unclosedSenderFixture():Promise<string>{
 const raw=await readFile(new URL("fixtures/current-inverse-unclosed-via-sender.json",import.meta.url),"utf8");
 assert.equal(createHash("sha256").update(raw).digest("hex"),"b8109bf35ffb15e46e8c0e70663555b1c53c2959e3501f5591c36667a5548b02");
 const value:unknown=JSON.parse(raw);assert.ok(value!==null&&typeof value==="object"&&!Array.isArray(value)&&"sender"in value);assert.ok(typeof value.sender==="string");return value.sender;
}

void test("the exact closed schematic driver omits only Via SDK execution and rejects mixed or changed closure",async()=>{
 const seed=await readFile(new URL("../../scripts/native-baseline/shared-owner.ps1.txt",import.meta.url),"utf8");const data=generateSchematicEditNativeSource(seed);const source=project(withBody(expandCurrentPcbDiagnosticCSharpReviewSource(data.helper),expandCurrentSchematicNativeTypeAliasesV2));
 assert.ok(data.helper.startsWith("param([switch]$CompileOnly,[switch]$SchematicRelevanceDisplayWrite209,[switch]$SchematicWireEdit209)"));assert.ok(data.helper.includes("$PcbViaWrite209=[System.Management.Automation.SwitchParameter]$false"));assert.ok(data.helper.includes("$owner=if ($SchematicRelevanceDisplayWrite209) {[EasyedaDiagnosticOwner]::CreateSchematicRelevanceDisplayWrite209()} else {[EasyedaDiagnosticOwner]::CreateSchematicWireEdit209()}"));
 assert.equal(project(source),source);assert.equal(source.includes("ViaSdkFunction"),false);assert.equal(source.split("PcbViaSdkProtocolMessage(").length-1,2);assert.equal(source.split("SendPcbViaSdk(").length-1,2);assert.ok(source.includes("public static EasyedaDiagnosticOwner CreatePcbViaWrite209()"));assert.ok(source.includes("public void SendPcbViaSdkProperties("));assert.ok(source.includes("class EasyedaSelectedFileMainSqlFenceProtocol"));
 const marker="// BEGIN CLOSED SCHEMATIC VIA SDK";
 for(const changed of[source.replace(marker,""),source.replace(marker,`${marker}\n${marker}`),source.replace('throw new InvalidOperationException("schematic-via-sdk-codec-closed")','throw new InvalidOperationException("changed-codec")'),`${source}\nstatic string ViaSdkFunction="foreign";`,source.replace("// BEGIN GENERATED SCHEMATIC WIRE EDIT BIRTH209","// BEGIN FOREIGN BIRTH")]){assert.throws(()=>project(changed));}
 assert.throws(()=>project(seed));
});

void test("the inverse projection has a separate fixed closure and retains its disabled compatibility dispatch",async()=>{
 const seed=await readFile(new URL("../../scripts/native-baseline/shared-owner.ps1.txt",import.meta.url),"utf8");const data=generateFootprintInverseNativeSource(seed);const before=withBody(expandCurrentPcbDiagnosticCSharpReviewSource(data.helper),expandCurrentFootprintInverseNativeTypeAliases);const source=projectCurrentFootprintInverseViaSdkRuntime(before);
 assert.ok(data.helper.startsWith("param([switch]$CompileOnly,[switch]$FootprintInverse209,"));assert.ok(data.helper.includes("$PcbViaWrite209=[System.Management.Automation.SwitchParameter]$false"));assert.ok(data.helper.includes("$owner=[EasyedaDiagnosticOwner]::CreateFootprintInverse209()"));
 assert.equal(projectCurrentFootprintInverseViaSdkRuntime(source),source);assert.equal(source.includes("ViaSdkFunction"),false);assert.equal(source.split("PcbViaSdkProtocolMessage(").length-1,2);assert.equal(source.split("SendPcbViaSdk(").length-1,2);assert.ok(source.includes("public static EasyedaDiagnosticOwner CreatePcbViaWrite209()"));assert.ok(source.includes("class EasyedaSelectedFileMainSqlFenceProtocol"));assert.ok(source.includes('throw new InvalidOperationException("inverse-via-sdk-codec-closed")'));
 for(const changed of[source.replace("// BEGIN CLOSED INVERSE VIA SDK","// BEGIN CLOSED SCHEMATIC VIA SDK"),source.replace("public void AdmitFootprintInverseAction(string action)","public void AdmitForeignAction(string action)"),source.replace('throw new InvalidOperationException("inverse-via-sdk-codec-closed")','throw new InvalidOperationException("changed-codec")')]){assert.throws(()=>projectCurrentFootprintInverseViaSdkRuntime(changed));}
 // The inverse generator closes this SDK family; repeated projection preserves its bytes.
 assert.throws(()=>projectCurrentFootprintInverseViaSdkRuntime(seed));assert.equal(source,before);
});

void test("packed unclosed inverse SDK projection removes its original positive vector and repacks to a fixed point",async()=>{
 const seed=await readFile(new URL("../../scripts/native-baseline/shared-owner.ps1.txt",import.meta.url),"utf8");
 // Restore current aliases and hash banks before using the historical codec.
 // Seal the closed fixture and the projected result with that same codec.
 const closed=withBody(expandCurrentPcbDiagnosticCSharpReviewSource(generateFootprintInverseNativeSource(seed).helper),body=>packVectors(expandCurrentFootprintInverseNativeHashVectors(expandCurrentFootprintInverseNativeTypeAliases(body))));
 const diagnostic=expandCurrentPcbDiagnosticCSharpReviewSource(generateWorkerStartupProtocol(seed));
 const inverseSender=await unclosedSenderFixture();
 let unclosed=withBody(closed,expandVectors);
 const marker="// BEGIN CLOSED INVERSE VIA SDK\n// The fixed selected driver excludes the Via SDK.\n// END CLOSED INVERSE VIA SDK";
 assert.equal(unclosed.split(marker).length,2);unclosed=unclosed.replace(marker,member(diagnostic,"static readonly string ViaSdkFunction="));
 for(const signature of["public static string PcbViaSdkProtocolMessage(","public void SendPcbViaSdk(","public static void VerifyPcbViaSdkWireSmoke()"]){
  const prior=member(unclosed,signature);const replacement=signature==="public void SendPcbViaSdk("?inverseSender:member(diagnostic,signature);
  unclosed=unclosed.replace(prior,replacement);
 }
 const packed=withBody(unclosed,packVectors);assert.ok(packed.includes("// BEGIN FIXED INVERSE SMOKE VECTORS V1\n"));assert.ok(packed.includes("ViaSdkFunction"));assert.notEqual(packed,closed);
 const projected=projectCurrentFootprintInverseViaSdkRuntime(packed);
 assert.equal(withBody(projected,expandVectors),withBody(closed,expandVectors));assert.equal(projected,closed);
 assert.equal(packed.split("EasyedaFixedSmokeVectors.Get(").length,projected.split("EasyedaFixedSmokeVectors.Get(").length+1);
 assert.equal(projectCurrentFootprintInverseViaSdkRuntime(projected),projected);
});
