/** Build-only source/codebook comparison, never a native owner allocation. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { generateWorkerStartupProtocol } from "../../scripts/generate-worker-startup-protocol.ts";
import { currentPcbDiagnosticCSharpReviewSource } from "../src/current-pcb-diagnostic-csharp-review-storage.ts";
import { applyNativeFixedProtocolProjection } from "../src/native-fixed-protocol-projection.ts";
import { expandCurrentSchematicNativeTypeAliasesV2 } from "../src/current-schematic-native-type-aliases-v2.ts";
import { expandCurrentSchematicNativeHashVectors } from "../src/current-schematic-native-hash-vector-storage.ts";

void test("schematic layout retains byte-exact shared Via codecs without unreachable Via owners or dispatch", async () => {
 const seed=await readFile(new URL("../../scripts/native-baseline/shared-owner.ps1.txt",import.meta.url),"utf8");
 const diagnostic=generateWorkerStartupProtocol(seed,"diagnostic"),schematic=generateWorkerStartupProtocol(seed,"schematic");assert.equal(generateWorkerStartupProtocol(schematic,"schematic"),schematic);
 const closed=expandCurrentSchematicNativeHashVectors(expandCurrentSchematicNativeTypeAliasesV2(currentPcbDiagnosticCSharpReviewSource(schematic))),full=currentPcbDiagnosticCSharpReviewSource(diagnostic),owner="public sealed partial class EasyedaDiagnosticOwner {";
 for(const name of ["LOCAL UPLOAD","UPLOAD REQUEST","TAIL OBSERVATION","POST HISTORY SYNC","SAVE DRAIN","OBSERVED SOURCES"]){
  const end=`// END ORIGINAL VIA ${name}`,marker=`// BEGIN ORIGINAL VIA ${name}\n`;const a=full.indexOf(marker),b=closed.indexOf(marker);assert.ok(a!==-1&&b!==-1,name);
  const after=closed.slice(b+marker.length,closed.indexOf(owner,b)),before=full.slice(a+marker.length,full.indexOf(owner,a));assert.equal(after,before,`${name} shared fixed classes retain all program/table bytes and hashes`);
  const at=closed.indexOf(end,b);assert.ok(at>b);assert.equal(closed.slice(b,at).includes("public void SendPcbVia"),false);
 }
 for(const unavailable of ["bool viaSaveGenerationAttempted,viaSaveBodyPrepared;","public void SendPcbViaLocalUpload(","public void SendPcbViaUploadRequest(","public void SendPcbViaSaveTailObservation(","public void SendPcbViaSaveTailDelete(","public void SendPcbViaTailExtraObserve(","public void SendPcbViaPostSync(","public void SendPcbViaSaveDrain(","public void SendPcbViaObservedSource(","public void BindPcbViaSyncQuiesce("]){assert.ok(full.includes(unavailable),unavailable);assert.equal(closed.includes(unavailable),false,unavailable);}
 for(const action of ["pcb-via-local-upload","pcb-via-upload-request","pcb-via-tail-observe","pcb-via-post-sync","pcb-via-save-drain","pcb-via-observed-source","pcb-via-sync-quiesce"]){assert.ok(diagnostic.includes(`        '${action}' {`),action);assert.equal(schematic.includes(`        '${action}' {`),false,action);}
 for(const shared of ["EasyedaPcbViaLocalUploadProtocol","EasyedaPcbViaUploadRequestProtocol","EasyedaPcbViaSaveTailDeleteControlProtocol","EasyedaPcbViaSaveTailObservationProtocol","EasyedaPcbViaPostHistorySyncProtocol","EasyedaPcbViaSaveDrainProtocol","EasyedaPcbViaObservedSourceProtocol","EasyedaProjectSyncQuiesceProtocol"]){assert.ok(closed.includes(`public static class ${shared} {`),shared);}
});
void test("codec-only projection refuses an unexpected class/quote roster or preexisting different block",()=>{
 const profile=Object.freeze({begin:"// BEGIN FIXED",end:"// END FIXED",protocols:["ExactProtocol"],quoteMethod:"ExactQuote"});const input="internal enum EasyedaPcbViaWriteBirth { Original }";
 const original="public static class ExactProtocol { public static void VerifySmoke(){} }\npublic sealed partial class EasyedaDiagnosticOwner {\npublic static string ExactQuote(string text){return JsonString(text);}\nint forbiddenRuntimeState;\n}\n";
 const result=applyNativeFixedProtocolProjection(input,profile,original);assert.equal(result.includes("forbiddenRuntimeState"),false);assert.equal(applyNativeFixedProtocolProjection(result,profile,original),result);
 assert.throws(()=>applyNativeFixedProtocolProjection(input,profile,original.replace("class ExactProtocol","class OtherProtocol")),/PROTOCOL_ROSTER/u);
 assert.throws(()=>applyNativeFixedProtocolProjection(input,profile,original.replace("ExactQuote","OtherQuote")),/QUOTE/u);
 assert.throws(()=>applyNativeFixedProtocolProjection(result.replace("VerifySmoke","ChangedSmoke"),profile,original),/EXISTING_BLOCK/u);
});
