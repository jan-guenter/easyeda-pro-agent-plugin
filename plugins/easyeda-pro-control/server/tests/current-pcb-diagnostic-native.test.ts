import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { CURRENT_PCB_CONSTRUCTOR_BUNDLE_FUNCTIONS } from "../src/current-pcb-constructor-scope.ts";
import { CURRENT_PCB_DIAGNOSTIC_WORKER_EXPRESSION, CURRENT_PCB_DIAGNOSTIC_WORKER_EXPRESSION_SHA256 } from "../src/current-pcb-diagnostic-worker-program.ts";
import { CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION } from "../src/current-pcb-diagnostic-opening.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION, CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION,
  CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_FUNCTION } from "../src/current-pcb-diagnostic-model-program.ts";
import { CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION } from "../src/current-pcb-diagnostic-pending-program.ts";
import { CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_FUNCTION } from "../src/current-pcb-diagnostic-raw-strings.ts";
// oxlint-disable-next-line import/max-dependencies -- Native parity needs each fixed program from its independently reviewed implementation.
import { CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_FUNCTION } from "../src/current-pcb-diagnostic-root-inventory.ts";
import { CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION } from "../src/current-pcb-diagnostic-pcb-opening.ts";

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
  assert.ok(source.includes("$line.Length -ge 32768"));
  assert.ok(source.includes("$request.method -cne 'Runtime.callFunctionOn') -and $line.Length -gt 4096"));
  assert.ok(source.includes("[EasyedaDiagnosticOwner]::VerifyProtocolSmoke()"));
  assert.ok(source.includes("static string WorkerExpressionJson() {"));
  assert.ok(source.includes("static string JsonString(string value) {"));
});

void test("native worker commands accept identifiers only and keep fixed non-pausing effect controls", async () => {
  const source = await readFile(sourcePath, "utf8");
  assert.ok(source.includes("'Target.setAutoAttach' {$fields+=@('sessionId')}"));
  assert.ok(source.includes("'Runtime.evaluate' {$fields+=@('sessionId','uniqueContextId')}"));
  assert.ok(source.includes('if(id<1 || id>(stringPurpose?225:103) || (method!="Runtime.evaluate" && uniqueContextId!=null))'));
  assert.ok(source.includes("return ProtocolMessageCore(id,method,targetId,sessionId,scriptId,uniqueContextId,false);"));
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

void test("native opening and model programs are byte-exact fixed commands, not caller code", async () => {
  const source = await readFile(sourcePath, "utf8");
  for (const [name, expected] of Object.entries({ OpeningFunction: CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION,
    ModelCallbackExpression: CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION, ModelHandlerFunction: CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION,
    ModelStateFunction: CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_FUNCTION, ModelPendingFunction: CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION,
    ModelRawStringsFunction: CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_FUNCTION,
    ModelRootInventoryFunction: CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_FUNCTION, PcbOpeningFunction: CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION,
    ModelDiagnosticConstructorsFunction: CURRENT_PCB_CONSTRUCTOR_BUNDLE_FUNCTIONS.diagnostic,
    ModelPrecreateConstructorsFunction: CURRENT_PCB_CONSTRUCTOR_BUNDLE_FUNCTIONS.precreate })) {
    const encoded = new RegExp(`const string ${name}=@"((?:""|[^"])*)";`, "u").exec(source)?.[1];
    assert.equal(encoded?.replaceAll('""', '"'), expected, name);
    assert.ok(source.includes(createHash("sha256").update(expected).digest("hex")), name);
  }
  assert.ok(source.includes("new UTF8Encoding(false,true).GetBytes(path)"));
  assert.ok(source.includes('if(observed!=project) throw Error("opening-project")'));
  assert.ok(source.includes('if(Encoding.UTF8.GetByteCount(message)>65536)'));
  assert.ok(source.includes('if((snapshot || pending || phase=="raw-strings" || phase=="root-inventory") && method=="Runtime.callFunctionOn")'));
  assert.ok(source.includes('if(objectId!=null || callbackObjectId!=null)'));
  for (const forbidden of ["$request.functionDeclaration", "$request.expression", "$request.objectGroup", "$request.arguments"]) {
    assert.ok(!source.includes(forbidden), forbidden);
  }
});

void test("native dispatch preserves missing PowerShell fields through object-typed boundaries without accepting supplied empties", async () => {
  const source = await readFile(sourcePath, "utf8");
  assert.ok(source.includes("public void Send(int id,string method,object targetId,object sessionId,object scriptId,object uniqueContextId)"));
  assert.ok(source.includes("public void SendModel(int id,string method,string sessionId,string phase,object uniqueContextId,object objectId,object callbackObjectId,object constructorObjectId,object teardropObjectId)"));
  assert.ok(source.includes("if(value==null) return null;"));
  assert.ok(source.includes('string text=value as string; if(text==null) throw Error("optional-text-type");'));
  assert.ok(source.includes('if(targetId!=null || sessionId!=null || scriptId!=null) throw Error("discovery-fields")'));
  assert.ok(source.includes("[EasyedaDiagnosticOwner]::BoundProtocolMessage(1,'Browser.getVersion',$null,$null,$null,$null)"));
  assert.ok(source.includes("[EasyedaDiagnosticOwner]::BoundModelProtocolMessage(2,'Runtime.releaseObjectGroup','s','release',$null,$null,$null,$null)"));
  assert.ok(source.includes("foreach ($value in @('',7))"));
  assert.ok(source.includes("'pcb-diagnostic-bound-model-extra-field'"));
  assert.ok(source.includes("foreach ($phase in @('snapshot','pending','raw-strings','root-inventory'))"));
  assert.ok(source.includes("[EasyedaDiagnosticOwner]::DomProtocolMessage(5,'DOM.getFrameOwner','s','original-frame',$null)"));
  assert.ok(source.includes("[EasyedaDiagnosticOwner]::DomProtocolMessage(6,'DOM.describeNode','s',$null,1234)"));
});

void test("native constructor grammar admits only purpose-matched fixed selectors and exact required tuple handles", async () => {
  const source = await readFile(sourcePath, "utf8");
  assert.ok(source.includes('(phase=="constructors-precreate")!=stringPurpose'));
  assert.ok(source.includes('if(!pending && phase!="root-inventory" && constructorObjectId!=null) throw Error("model-object")'));
  assert.ok(source.includes('((pending || phase=="root-inventory") && !handle(constructorObjectId))'));
  assert.ok(source.includes('if(!producers && constructors!=null) throw Error("string-scope")'));
  assert.ok(source.includes('(producers && !handle(constructors))'));
  assert.ok(source.includes("'pending' {$fields+=@('objectId','callbackObjectId','constructorObjectId','teardropObjectId')}"));
  assert.ok(source.includes("'root-inventory' {$fields+=@('objectId','callbackObjectId','constructorObjectId')}"));
  assert.ok(source.includes("'empty-producers' {$fields+=@('objectId','callbackObjectId','constructorObjectId')}"));
  assert.ok(source.includes("'constructors-diagnostic' {if ($StringPrecreate) {throw 'pcb-diagnostic-model-constructors'}"));
  assert.ok(source.includes("'constructors-precreate' {if (-not $StringPrecreate) {throw 'pcb-diagnostic-model-constructors'}"));
  for (const check of ["constructors-selector-smoke", "constructors-purpose-smoke", "constructors-required-smoke", "root-constructors-smoke",
    "constructors-extra-smoke", "string-constructors-extra-smoke", "pcb-diagnostic-bound-constructor-field"]) {
    assert.ok(source.includes(check), check);
  }
  assert.ok(source.includes('ProtocolMessage(103,"Browser.getVersion",null,null,null,null)'));
  assert.ok(source.includes('ProtocolMessage(104,"Browser.getVersion",null,null,null,null)'));
  assert.ok(source.includes('StringPrecreateProtocolMessage(225,"Runtime.evaluate","worker","worker-association","context",null,null,null)'));
  assert.ok(source.includes('StringPrecreateProtocolMessage(226,"Runtime.evaluate","worker","worker-association","context",null,null,null)'));
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
