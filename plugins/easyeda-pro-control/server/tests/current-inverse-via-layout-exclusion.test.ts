/** Source generation and codec selection only. No process or Job is allocated. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {test} from "node:test";
import {currentPcbDiagnosticCSharpReviewSource,expandCurrentPcbDiagnosticCSharpReviewSource} from "../src/current-pcb-diagnostic-csharp-review-storage.ts";
import {expandCurrentFootprintInverseNativeTypeAliases} from "../src/current-footprint-inverse-native-type-aliases.ts";
import {expandCurrentFootprintInverseNativeHashVectors} from "../src/current-footprint-inverse-native-hash-vector-storage.ts";
import {factorCurrentFootprintInverseLegacyCodecs} from "../src/current-footprint-inverse-legacy-codecs.ts";
import {generateWorkerStartupProtocol} from "../../scripts/generate-worker-startup-protocol.ts";
import {applyCurrentProjectSyncQuiesceCodecNativeFragment,currentProjectSyncQuiesceCodecNativeSource} from "../src/current-project-sync-quiesce-native-fragment.ts";

void test("inverse layout retains the shared timer codec without seven unrelated Via action lanes",async()=>{
 const seed=await readFile(new URL("../../scripts/native-baseline/shared-owner.ps1.txt",import.meta.url),"utf8");
 const helper=generateWorkerStartupProtocol(seed,"inverse");
 const body=currentPcbDiagnosticCSharpReviewSource(helper);
 const inverse=expandCurrentPcbDiagnosticCSharpReviewSource(helper).replace(body,expandCurrentFootprintInverseNativeHashVectors(expandCurrentFootprintInverseNativeTypeAliases(body)));
 for(const marker of ["SAVE REQUEST GENERATION","LOCAL UPLOAD","UPLOAD REQUEST","TAIL OBSERVATION","POST HISTORY SYNC","SAVE DRAIN","OBSERVED SOURCES"]){assert.equal(inverse.includes(`// BEGIN ORIGINAL VIA ${marker}`),false,marker);}
 assert.match(inverse,/EasyedaProjectSyncQuiesceProtocol\.Phase\(step\)/u);
 assert.match(inverse,/class EasyedaProjectSyncQuiesceProtocol/u);
 assert.equal(inverse.includes("BindPcbViaSyncQuiesce"),false);
 assert.equal(inverse.includes("SendPcbViaSyncQuiesce"),false);
 assert.equal(inverse.includes("ComponentClonedReadFunction"),false);
 // Reapply the source codec before its existing closed-build method factoring.
 const once=applyCurrentProjectSyncQuiesceCodecNativeFragment(inverse),onceBody=currentPcbDiagnosticCSharpReviewSource(once);
 const factored=once.replace(onceBody,factorCurrentFootprintInverseLegacyCodecs(onceBody));assert.equal(factored,inverse);
 const twice=applyCurrentProjectSyncQuiesceCodecNativeFragment(factored),twiceBody=currentPcbDiagnosticCSharpReviewSource(twice);
 assert.equal(twice.replace(twiceBody,factorCurrentFootprintInverseLegacyCodecs(twiceBody)),factored);
 const codec=currentProjectSyncQuiesceCodecNativeSource();assert.match(codec,/ProjectSyncQuiesceQuote/u);assert.equal(codec.includes("viaSyncQuiesceContext"),false);assert.equal(codec.includes("SendMessage("),false);
});
