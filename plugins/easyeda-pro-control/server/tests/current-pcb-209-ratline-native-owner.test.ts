import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { currentPcb209RatlineNativeSource } from "../src/current-pcb-209-ratline-native.ts";
import { CURRENT_PCB_209_RATLINE_NATIVE_PROFILE as profile } from "../src/current-pcb-209-ratline-budget.ts";

const sourcePath = new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url);
void test("native ratline purpose embeds exact finite runtime and fixed cumulative resource limits", async () => {
  const source = await readFile(sourcePath, "utf8");
  assert.ok(source.includes(currentPcb209RatlineNativeSource()));
  const values = { RequestLimit: profile.requestLimit, NormalRequestLimit: profile.normalRequestLimit, CleanupRequestLimit: profile.cleanupRequests,
    NormalByteLimit: profile.bytes.normal, TotalByteLimit: profile.bytes.total, NormalPollLimit: profile.polling.normalLimit, PollLimit: profile.polling.limit,
    HelperControlLimit: profile.helperControlMessages, HelperStdoutByteLimit: profile.bytes.helperStdout,
    NormalMilliseconds: profile.elapsed.normalMilliseconds, TotalMilliseconds: profile.elapsed.totalMilliseconds };
  const end = source.indexOf("// END GENERATED WORKER STARTUP RATLINE209 PROTOCOL"), start = source.indexOf("public static class EasyedaRatline209Limits {");
  assert.ok(start > 0 && end > start);
  assert.deepEqual(Object.fromEntries([...source.slice(start, end).matchAll(/public const long (\w+)=(\d+)L;/gu)].map(match => [match[1], Number(match[2])])), values);
  assert.ok(Buffer.byteLength(source) <= 1_048_576);
  assert.ok(source.includes("workerStartupRatline209=true;emptyElapsed=Stopwatch.StartNew();"));
  for (const limit of ["RequestLimit", "NormalRequestLimit", "CleanupRequestLimit", "NormalByteLimit", "TotalByteLimit", "NormalPollLimit", "PollLimit", "HelperControlLimit",
    "HelperStdoutByteLimit", "NormalMilliseconds", "TotalMilliseconds"]) {
    assert.ok(source.split(`EasyedaRatline209Limits.${limit}`).length > 1, limit);
  }
});
void test("native ratline activation and cleanup remain separate from old purposes and caller programs", async () => {
  const source = await readFile(sourcePath, "utf8");
  assert.ok(source.includes("if ($WorkerStartupRatline209 -and ($StringPrecreate -or $WorkerStartup -or $Layers209 -or $WorkerStartup209 -or $WorkerStartupEmpty209))"));
  assert.ok(source.includes('if(!workerStartupRatline209)throw Error("ratline-purpose");'));
  assert.ok(source.includes("[EasyedaDiagnosticOwner]::VerifyRatline209PurposeSmoke()"));
  assert.ok(source.includes("cleanup && (!ratlineCleanup || ratlineCleanupRequests>=EasyedaRatline209Limits.CleanupRequestLimit)"));
  assert.ok(source.includes("!cleanup && (ratlineCleanup || received>EasyedaRatline209Limits.NormalByteLimit)"));
  assert.ok(source.includes("ratlineCleanup?EasyedaRatline209Limits.PollLimit:EasyedaRatline209Limits.NormalPollLimit"));
  assert.ok(source.includes("Math.Min(Math.Min(65536u,available),limit-received)"));
  assert.ok(source.includes("worker-startup-ratline-abort"));
  assert.ok(source.includes("$owner.AbortWorkerStartupRatline(); $result=@{aborted=$true}"));
  assert.ok(source.includes("ratlineCleanup || !ratlineChildStarted || ratlineChildResumes>=6"));
  assert.ok(source.includes("ratlineChildArm!=4 || ratlineChildStarted || ratlineCleanup"));
  assert.ok(source.includes("ratlineChildSession!=null && sessionId==ratlineChildSession)throw Error(\"ratline-child-prefix\")"));
  assert.ok(source.includes('throw Error("ratline-terminal-scope")'));
  assert.ok(source.includes("if(!error.Message.StartsWith(\"pcb-ratline209-\",StringComparison.Ordinal))throw;throw Error(\"ratline-protocol\")"));
  assert.ok(source.includes("$exception.Message -cmatch '^pcb-diagnostic-[a-z-]{1,80}$'"));
  for (const field of ["expression", "functionDeclaration", "params", "budget", "generation"]) { assert.equal(source.includes(`$request.${field}`), false, field); }
});
