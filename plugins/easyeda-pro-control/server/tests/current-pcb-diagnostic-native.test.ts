import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { CURRENT_PCB_DIAGNOSTIC_WORKER_EXPRESSION, CURRENT_PCB_DIAGNOSTIC_WORKER_EXPRESSION_SHA256 } from "../src/current-pcb-diagnostic-worker-program.ts";

const sourcePath = new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url);

void test("native helper embeds the complete fixed worker program with separate outgoing frame budget", async () => {
  const source = await readFile(sourcePath, "utf8");
  const encoded = /const string WorkerExpression=@"((?:""|[^"])*)";/u.exec(source)?.[1];
  assert.ok(encoded !== undefined);
  const expression = encoded.replaceAll('""', '"');
  assert.equal(expression, CURRENT_PCB_DIAGNOSTIC_WORKER_EXPRESSION);
  assert.equal(Buffer.byteLength(expression, "utf8"), 3841);
  assert.equal(createHash("sha256").update(expression, "utf8").digest("hex"), CURRENT_PCB_DIAGNOSTIC_WORKER_EXPRESSION_SHA256);
  assert.ok(source.includes(`source.Length!=3841`));
  assert.ok(source.includes(CURRENT_PCB_DIAGNOSTIC_WORKER_EXPRESSION_SHA256));
  assert.ok(source.includes('Encoding.UTF8.GetByteCount(message)>(method=="Runtime.evaluate"?8192:4096)'));
  assert.ok(source.includes("$line.Length -ge 4096"));
  assert.ok(source.includes("[EasyedaDiagnosticOwner]::VerifyProtocolSmoke()"));
});

void test("native worker commands accept identifiers only and keep fixed non-pausing effect controls", async () => {
  const source = await readFile(sourcePath, "utf8");
  assert.ok(source.includes("'Target.setAutoAttach' {$fields+=@('sessionId')}"));
  assert.ok(source.includes("'Runtime.evaluate' {$fields+=@('sessionId','uniqueContextId')}"));
  assert.ok(source.includes('if(id<1 || id>32 || (method!="Runtime.evaluate" && uniqueContextId!=null))'));
  assert.ok(source.includes('if(scriptId!=null || !token(uniqueContextId))'));
  assert.ok(source.includes(String.raw`\"filter\":[{\"type\":\"worker\",\"exclude\":false},{\"exclude\":true}]`));
  assert.ok(source.includes(String.raw`\"autoAttach\":true,\"waitForDebuggerOnStart\":false,\"flatten\":true`));
  for (const [name, value] of Object.entries({ returnByValue: true, throwOnSideEffect: true, silent: true, awaitPromise: false,
    includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false, timeout: 1000, userGesture: false, generatePreview: false })) {
    assert.ok(source.includes(`\\"${name}\\":${String(value)}`), name);
  }
  assert.ok(!source.includes("$request.expression"));
  assert.ok(!source.includes("$request.params"));
  assert.ok(!source.includes("$request.timeout"));
  const encoded = /const string WorkerExpression=@"((?:""|[^"])*)";/u.exec(source)?.[1];
  assert.ok(encoded !== undefined);
  const message = JSON.stringify({ id: 32, method: "Runtime.evaluate", sessionId: "s".repeat(128), params: {
    expression: encoded.replaceAll('""', '"'), uniqueContextId: "c".repeat(128), returnByValue: true, throwOnSideEffect: true,
    silent: true, awaitPromise: false, includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false, timeout: 1000,
    userGesture: false, generatePreview: false,
  } });
  assert.ok(Buffer.byteLength(message, "utf8") + 1 > 4096);
  assert.ok(Buffer.byteLength(message, "utf8") + 1 <= 8192);
});

void test("native creation failure captures numeric error before cleanup while preserving unknown-creation refusal", async () => {
  const source = await readFile(sourcePath, "utf8");
  assert.match(source, /if\(!createdProcess\) \{\s*\/\/[^\n]*\n\s*\/\/[^\n]*\n\s*createProcessError=unchecked\(\(uint\)Marshal.GetLastWin32Error\(\)\);/u);
  assert.equal(source.match(/Marshal\.GetLastWin32Error\(\)/gu)?.length, 1);
  assert.ok(source.includes("public uint? CreateProcessError { get { return createProcessError; } }"));
  assert.ok(source.includes("info.process==IntPtr.Zero && info.thread==IntPtr.Zero && info.processId==0 && info.threadId==0"));
  assert.ok(source.includes("creationPhase!=CreationPhase.NotEntered && creationPhase!=CreationPhase.ReturnedFalse"));
  assert.ok(source.includes("$result.creationState -ceq 'returned-false' -and $null -ne $owner.CreateProcessError"));
  assert.ok(source.includes("$state -ceq 'returned-false' -and $null -ne $owner.CreateProcessError"));
  assert.ok(source.includes("$depth -lt 4 -and $null -ne $exception"));
  assert.ok(source.includes("$exception.Message -cmatch '^pcb-diagnostic-[a-z-]{1,80}$'"));
  assert.ok(!source.includes("FormatMessage"));
  assert.ok(!source.includes("Win32Exception("));
});
