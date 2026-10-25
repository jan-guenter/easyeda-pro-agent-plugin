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
  assert.ok(source.includes("readonly bool workerStartupRatlineContinuation209;"));
  assert.ok(source.includes('workerStartupRatlineContinuation209=purpose=="worker-startup-ratline-continuation209";'));
  assert.equal([...source.matchAll(/\bworkerStartupRatlineContinuation209\s*=(?!=)/gu)].length, 1);
  for (const limit of ["RequestLimit", "NormalRequestLimit", "CleanupRequestLimit", "NormalByteLimit", "TotalByteLimit", "NormalPollLimit", "PollLimit", "HelperControlLimit",
    "HelperStdoutByteLimit", "NormalMilliseconds", "TotalMilliseconds"]) {
    assert.ok(source.includes(`long Ratline${limit} { get { return workerStartupRatlineContinuation209?EasyedaRatlineContinuation209Limits.${limit}:EasyedaRatline209Limits.${limit}; } }`), limit);
  }
});
void test("native ratline activation and cleanup remain separate from old purposes and caller programs", async () => {
  const source = await readFile(sourcePath, "utf8");
  assert.ok(source.includes("if ($WorkerStartupRatline209 -and ($StringPrecreate -or $WorkerStartup -or $Layers209 -or $WorkerStartup209 -or $WorkerStartupEmpty209))"));
  assert.ok(source.includes('if(!workerStartupRatline209 || workerStartupRatlineContinuation209)throw Error("ratline-purpose");'));
  assert.ok(source.includes("[EasyedaDiagnosticOwner]::VerifyRatline209PurposeSmoke()"));
  assert.ok(source.includes("cleanup && (!ratlineCleanup || ratlineCleanupRequests>=RatlineCleanupRequestLimit)"));
  assert.ok(source.includes("!cleanup && (ratlineCleanup || received>RatlineNormalByteLimit)"));
  assert.ok(source.includes("ratlineCleanup?RatlinePollLimit:RatlineNormalPollLimit"));
  assert.ok(source.includes("Math.Min(Math.Min(65536u,available),limit-received)"));
  assert.ok(source.includes("worker-startup-ratline-abort"));
  assert.ok(source.includes("$owner.AbortWorkerStartupRatline(); $result=@{aborted=$true}"));
  assert.ok(source.includes("ratlineCleanup || !ratlineChildStarted || ratlineChildResumes>=6"));
  assert.ok(source.includes("ratlineChildArm!=5 || ratlineChildStarted || ratlineCleanup"));
  assert.ok(source.includes('ratlineOriginConsumed || ratlinePcbSources!=29 || ratlineChildArm!=5 || !ratlineChildStarted || ratlineChildSources!=1 || ratlineChildResumes!=0'));
  assert.ok(source.includes('ratlineOriginConsumed=true;return;'));
  assert.ok(source.includes("if(workerStartupRatline209 && (ratlineChildSession!=null && sessionId==ratlineChildSession || workerStartupRatlineContinuation209 && (sessionId==continuationSessions[1] || sessionId==continuationSessions[2])))throw Error(\"ratline-child-prefix\")"));
  assert.ok(source.includes('throw Error("ratline-terminal-scope")'));
  assert.ok(source.includes("if(!error.Message.StartsWith(\"pcb-ratline209-\",StringComparison.Ordinal))throw;throw Error(\"ratline-protocol\")"));
  assert.ok(source.includes("$exception.Message -cmatch '^pcb-diagnostic-[a-z-]{1,80}$'"));
  for (const field of ["expression", "functionDeclaration", "params", "budget", "generation"]) { assert.equal(source.includes(`$request.${field}`), false, field); }
});
