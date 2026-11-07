/** Source generation and codec selection only. No process or Job is allocated. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {test} from "node:test";
import {expandCurrentPcbDiagnosticCSharpReviewSource} from "../src/current-pcb-diagnostic-csharp-review-storage.ts";
import {generateWorkerStartupProtocol} from "../../scripts/generate-worker-startup-protocol.ts";
import {applyCurrentProjectSyncQuiesceCodecNativeFragment,currentProjectSyncQuiesceCodecNativeSource} from "../src/current-project-sync-quiesce-native-fragment.ts";

void test("inverse layout retains the shared timer codec without seven unrelated Via action lanes",async()=>{
 const seed=await readFile(new URL("../../scripts/native-baseline/shared-owner.ps1.txt",import.meta.url),"utf8");
 const inverse=expandCurrentPcbDiagnosticCSharpReviewSource(generateWorkerStartupProtocol(seed,"inverse"));
 for(const marker of ["SAVE REQUEST GENERATION","LOCAL UPLOAD","UPLOAD REQUEST","TAIL OBSERVATION","POST HISTORY SYNC","SAVE DRAIN","OBSERVED SOURCES"]){assert.equal(inverse.includes(`// BEGIN ORIGINAL VIA ${marker}`),false,marker);}
 assert.match(inverse,/EasyedaProjectSyncQuiesceProtocol\.Phase\(step\)/u);
 assert.match(inverse,/class EasyedaProjectSyncQuiesceProtocol/u);
 assert.equal(inverse.includes("BindPcbViaSyncQuiesce"),false);
 assert.equal(inverse.includes("SendPcbViaSyncQuiesce"),false);
 assert.equal(inverse.includes("ComponentClonedReadFunction"),false);
 const once=applyCurrentProjectSyncQuiesceCodecNativeFragment(inverse);assert.equal(once,inverse);assert.equal(applyCurrentProjectSyncQuiesceCodecNativeFragment(once),once);
 const codec=currentProjectSyncQuiesceCodecNativeSource();assert.match(codec,/ProjectSyncQuiesceQuote/u);assert.equal(codec.includes("viaSyncQuiesceContext"),false);assert.equal(codec.includes("SendMessage("),false);
});
