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

void test("new complete generation preserves separate six-role outputs and every committed complete file",async()=>{
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
 assert.ok(Buffer.from(capture.bootstrap,"utf16le").toString("base64").length<=16_000);
 assert.equal([...capture.bootstrap.matchAll(/[=]Read-WriterGraphRole /gu)].length,7);
 assert.equal([...capture.bootstrap.matchAll(/\[IO.File\]::Open/gu)].length,1);
 assert.ok(capture.bootstrap.includes("$forwardWriterTailBytes=$b6"));
 assert.equal(capture.bootstrap.includes("-WorkerStartupFootprintForwardWriter209"),false);
 for(const challenge of ["a".repeat(31),"a".repeat(33),`${"a".repeat(32)}\n`,"x".repeat(32)]){await assert.rejects(captureCurrentFootprintForwardWriterCompleteNativeGraph("archlinux",challenge));}
 // Distribution names participate only in the UNC branch, never drive paths.
 const driveCheckout=/^\/mnt\/[a-z]\//u.test(import.meta.filename);
 for(const distribution of ["archlinux\n","bad distribution","../archlinux"]){
  if(driveCheckout){
   const driveCapture=await captureCurrentFootprintForwardWriterCompleteNativeGraph(distribution,"a".repeat(32));await driveCapture.verify();
   assert.equal(driveCapture.bootstrap.includes("wsl.localhost"),false);
  }else{await assert.rejects(captureCurrentFootprintForwardWriterCompleteNativeGraph(distribution,"a".repeat(32)));}
 }
});

void test("complete-only transport repairs retain first failure and original terminal cleanup",async()=>{
 const source=await readFile(new URL(`../../${CURRENT_NATIVE_BASELINE.relativePath}`,import.meta.url),"utf8");assertCurrentNativeBaseline(source);
 const complete=currentFootprintForwardWriterCompleteNativeOutputs(source),legacy=currentFootprintForwardWriterNativeOutputs(source);
 const core=complete.find(row=>row.role==="core")?.source,driver=complete.find(row=>row.role==="driver")?.source;
 assert.ok(core!==undefined&&driver!==undefined);
 const write=core.slice(core.indexOf("void WriteAll("),core.indexOf("void WriteFrame("));
 assert.match(write,/catch\{Fail\("socket-write"\);throw;\}/u);
 const tcp=core.slice(core.indexOf("static TcpRow[] TcpRows()"),core.indexOf("internal static void CompareRows("));
 assert.match(tcp,/attempt<3/u);assert.match(tcp,/size>capacity&&size<=4\+65536U\*24&&attempt<2/u);
 assert.match(tcp,/finally\{System.Runtime.InteropServices.Marshal.FreeHGlobal\(memory\);\}/u);
 const release=core.slice(core.indexOf("  public void ReleaseClosed()"),core.indexOf("// BEGIN FORWARD WRITER BOUNDED PIPE"));
 assert.match(release,/originalMain.Release\(\);originalMainReleaseObserved=true;/u);
 assert.match(release,/if\(originalMainReleaseObserved&&launchAttempted&&creationPhase==CreationPhase.RootRetained\|\|Terminated\(\)\)/u);
 const smoke=core.slice(core.indexOf("}finally{if(pending!=null)pending.CancelAtDeadline()"));
 assert.ok(smoke.indexOf("smoke-unblock-read")<smoke.indexOf("while(pending!=null&&!pending.TryDisposeExited())"));
 assert.ok(smoke.indexOf("while(pending!=null&&!pending.TryDisposeExited())")<smoke.indexOf("bool writeClosed=CloseHandle(write)"));
 const loop=driver.slice(driver.indexOf("  while (-not $release)"));
 assert.ok(loop.indexOf("$request=$null")<loop.indexOf("try {"));
 assert.ok(loop.indexOf("try {")<loop.indexOf("$line=New-Object Text.StringBuilder"));
 assert.ok(loop.indexOf("if ($oversized) {throw 'pcb-diagnostic-request-size'}")<loop.indexOf("ConvertFrom-Json"));
 assert.match(loop,/if \(\$line.Length -ge 32768\) \{\$oversized=\$true\}/u);
 assert.match(driver.split("\n")[1]??"",/@\(\$args\).Count -ne 0/u);
 const oldCore=legacy.find(row=>row.role==="core")?.source,oldDriver=legacy.find(row=>row.role==="driver")?.source;
 assert.ok(oldCore!==undefined&&oldDriver!==undefined);
 assert.equal(oldCore.includes('catch{Fail("socket-write");throw;}'),false);
 assert.equal(oldCore.includes("originalMainReleaseObserved"),false);
 assert.equal(oldDriver.includes("$oversized=$false"),false);
});
