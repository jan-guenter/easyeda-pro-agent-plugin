/** Real generated files and exact descriptor capture; no helper/app launch. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {test} from "node:test";
import {CURRENT_NATIVE_BASELINE,assertCurrentNativeBaseline} from "../../scripts/native-baseline-source.ts";
import {currentFootprintForwardWriterNativeOutputs} from "../src/current-footprint-forward-writer-native-source.ts";
import {currentFootprintForwardWriterCompleteNativeOutputs} from "../src/current-footprint-forward-writer-complete-native-source.ts";
import {captureCurrentFootprintForwardWriterCompleteNativeGraph} from "../src/current-footprint-forward-writer-complete-native-graph.ts";
import {currentFootprintForwardWriterCompleteProfile} from "../src/current-footprint-forward-writer-complete-profile.ts";
import {currentFootprintForwardWriterProfile} from "../src/current-footprint-forward-writer-profile.ts";

void test("new complete generation preserves every released six-role source and committed complete file",async()=>{
 const source=await readFile(new URL(`../../${CURRENT_NATIVE_BASELINE.relativePath}`,import.meta.url),"utf8");assertCurrentNativeBaseline(source);
 const before=currentFootprintForwardWriterNativeOutputs(source);
 const complete=currentFootprintForwardWriterCompleteNativeOutputs(source);
 assert.deepEqual(currentFootprintForwardWriterNativeOutputs(source),before);
 for(const row of [...before,...complete]){assert.equal(await readFile(new URL(`../../${row.relativePath}`,import.meta.url),"utf8"),row.source);}
 const completeProfile=currentFootprintForwardWriterCompleteProfile();
 assert.equal(completeProfile.wholeWriterReserved,true);
 assert.equal(completeProfile.executionAuthorized,false);assert.equal(completeProfile.saveAuthorized,false);
 assert.deepEqual(completeProfile.pendingContinuationBudgets,[]);assert.deepEqual(completeProfile.pendingOriginalProviders,[]);
 assert.equal(currentFootprintForwardWriterProfile().wholeWriterReserved,false);
 assert.equal(currentFootprintForwardWriterCompleteProfile().stages.complete.naturalTicketTimerBudgetReserved,true);
});
void test("complete graph captures all original files and rejects malformed native challenge text",async()=>{
 const capture=await captureCurrentFootprintForwardWriterCompleteNativeGraph("archlinux","a".repeat(32));await capture.verify();
 assert.ok(capture.bootstrap.includes("-WorkerStartupFootprintForwardWriterComplete209"));
 assert.ok(capture.bootstrap.includes("$forwardWriterTailBytes=$b6"));
 assert.equal(capture.bootstrap.includes("-WorkerStartupFootprintForwardWriter209"),false);
 for(const challenge of ["a".repeat(31),"a".repeat(33),`${"a".repeat(32)}\n`,"x".repeat(32)]){await assert.rejects(captureCurrentFootprintForwardWriterCompleteNativeGraph("archlinux",challenge));}
 await assert.rejects(captureCurrentFootprintForwardWriterCompleteNativeGraph("archlinux\n","a".repeat(32)));
});
