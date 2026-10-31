/* oxlint-disable import/max-dependencies -- Closed protocol parity compares every independently implemented fixed reader and constructor selector. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { currentDisposableOpenSealedTargetSchema } from "../src/current-disposable-open.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION, CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION,
  CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_FUNCTION } from "../src/current-pcb-diagnostic-model-program.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_OBJECT_GROUP } from "../src/current-pcb-diagnostic-model-runner.ts";
import { CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION } from "../src/current-pcb-diagnostic-pending-program.ts";
import { CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_FUNCTION } from "../src/current-pcb-diagnostic-raw-strings.ts";
import { CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_FUNCTION } from "../src/current-pcb-diagnostic-root-inventory.ts";
import { CURRENT_PCB_CONSTRUCTOR_BUNDLE_FUNCTIONS } from "../src/current-pcb-constructor-scope.ts";
import { CURRENT_PCB_TEARDROP_CALLBACK_SELECTOR, CURRENT_PCB_TEARDROP_OWNER_ASSOCIATION } from "../src/current-pcb-teardrop-owner-program.ts";
import { DIAGNOSTIC_REQUEST_LIMIT, diagnosticNativeRequest, diagnosticOpeningParams, diagnosticPcbOpeningParams, stringPrecreateNativeRequest } from "../src/current-pcb-diagnostic-protocol.ts";
import { readPackedNativeProgram } from "./helpers/native-packed-program.ts";

type Row = Record<string, unknown>;
function wire(value: unknown): Buffer { return Buffer.from(`${JSON.stringify(value)}\0`); }
/** Build schema-valid target data whose project ID hashes the exact supplied
 * path. The document, branch and source digest are synthetic; acceptance does
 * not read a file, establish checkpoint membership or authorize navigation. */
function target(rawWindowsPath = String.raw`C:\validation\disposable.eprj2`): ReturnType<typeof currentDisposableOpenSealedTargetSchema.parse> {
  return currentDisposableOpenSealedTargetSchema.parse({
    rawWindowsPath, projectUuid: createHash("sha256").update(rawWindowsPath).digest("hex"),
    documentUuid: "d".repeat(16), expectedSourceSha256: "e".repeat(64), branchUuid: "b".repeat(32),
  });
}
const effects = { throwOnSideEffect: true, silent: true, awaitPromise: false, generatePreview: false, userGesture: false };
function properties(objectId: string): Row {
  return { method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } };
}
/** Assemble the eleven fixed model phases with increasing physical IDs and
 * distinct receiver-role placeholders. Mutation cases serialize these packets
 * through the real adapter; the fixtures issue no live handle or owner proof. */
function modelCommands(): readonly Row[] {
  const commands = [
    { method: "Runtime.evaluate", params: { ...effects, expression: CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION,
      uniqueContextId: "context", objectGroup: CURRENT_PCB_DIAGNOSTIC_MODEL_OBJECT_GROUP,
      returnByValue: false, timeout: 1000, includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false } },
    properties("wrapper"), properties("wrapper-scopes"),
    { method: "Runtime.callFunctionOn", params: { ...effects, objectId: "wrapper-scope",
      functionDeclaration: CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION, returnByValue: false } },
    properties("handler"), properties("handler-scopes"),
    { method: "Runtime.callFunctionOn", params: { ...effects, objectId: "handler-scope",
      functionDeclaration: CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_FUNCTION, returnByValue: true, arguments: [{ objectId: "wrapper" }] } },
    { method: "Runtime.callFunctionOn", params: { ...effects, objectId: "handler-scope",
      functionDeclaration: CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION, returnByValue: true, arguments: [{ objectId: "wrapper" }, { objectId: "constructors" }, { objectId: "teardrop" }] } },
    { method: "Runtime.callFunctionOn", params: { ...effects, objectId: "handler-scope",
      functionDeclaration: CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_FUNCTION, returnByValue: true, arguments: [{ objectId: "wrapper" }] } },
    { method: "Runtime.callFunctionOn", params: { ...effects, objectId: "handler-scope",
      functionDeclaration: CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_FUNCTION, returnByValue: true, arguments: [{ objectId: "wrapper" }, { objectId: "constructors" }] } },
    { method: "Runtime.releaseObjectGroup", params: { objectGroup: CURRENT_PCB_DIAGNOSTIC_MODEL_OBJECT_GROUP } },
  ];
  return commands.map((command, index) => ({ id: index + 1, method: command["method"], params: command["params"], sessionId: "original-page-session" }));
}
function row(value: unknown): value is Row { return value !== null && typeof value === "object" && !Array.isArray(value); }
function params(command: Row): Row {
  const value = command["params"]; assert.ok(row(value));
  return value;
}

void test("fixed project opener flattens only sealed identifiers and path, with schema/native field-order parity", () => {
  for (const phase of ["preflight", "open-project"] as const) {
    const selected = target();
    const command = { id: 64, method: "Runtime.callFunctionOn",
      params: diagnosticOpeningParams("original-context", selected, phase), sessionId: "original-page-session" };
    const request = diagnosticNativeRequest(wire(command));
    assert.deepEqual(request, { action: "send", requestId: 64, method: "Runtime.callFunctionOn",
      sessionId: "original-page-session", uniqueContextId: "original-context", openingPhase: phase,
      targetRawWindowsPath: selected.rawWindowsPath, targetProjectUuid: selected.projectUuid,
      targetBranchUuid: selected.branchUuid, targetDocumentUuid: selected.documentUuid,
      targetExpectedSourceSha256: selected.expectedSourceSha256 });
    assert.equal(Object.hasOwn(request, "functionDeclaration"), false); assert.equal(Object.hasOwn(request, "arguments"), false);
    assert.deepEqual(Object.keys(selected), ["rawWindowsPath", "projectUuid", "documentUuid", "expectedSourceSha256", "branchUuid"]);
    const argument = command.params.arguments[0]?.value;
    assert.deepEqual(argument, selected);
  }
  const selected = target(`${String.raw`C:\validation`}\\${"µ中".repeat(100)}.eprj2`);
  const command = { id: 1, method: "Runtime.callFunctionOn", params: diagnosticOpeningParams("context", selected, "preflight"), sessionId: "session" };
  assert.equal(diagnosticNativeRequest(wire(command))["targetRawWindowsPath"], selected.rawWindowsPath);
});

void test("all eleven fixed model requests map to private phases without forwarding source or group selectors", () => {
  const commands = modelCommands(), expected = ["wrapper", "properties", "properties", "handler", "properties", "properties", "snapshot", "pending", "raw-strings", "root-inventory", "release"];
  for (let index = 0; index < commands.length; index += 1) {
    const command = commands[index]; assert.ok(command !== undefined);
    const request = diagnosticNativeRequest(wire(command));
    assert.equal(request["modelPhase"], expected[index]); assert.equal(request["requestId"], index + 1);
    assert.equal(request["sessionId"], "original-page-session");
    for (const field of ["params", "expression", "functionDeclaration", "objectGroup", "arguments", "timeout"]) {
      assert.equal(Object.hasOwn(request, field), false, field);
    }
    if (index >= 6 && index <= 9) { assert.equal(request["objectId"], "handler-scope"); assert.equal(request["callbackObjectId"], "wrapper"); }
    if (index === 10) { assert.deepEqual(Object.keys(request), ["action", "requestId", "method", "sessionId", "modelPhase"]); }
  }
});

void test("constructor selection is purpose-pinned and pending requires exactly the qualified tuple handle", () => {
  for (const kind of ["diagnostic", "precreate"] as const) {
    const accepted = kind === "diagnostic" ? diagnosticNativeRequest : stringPrecreateNativeRequest;
    const rejected = kind === "diagnostic" ? stringPrecreateNativeRequest : diagnosticNativeRequest;
    const command = { id: 1, method: "Runtime.callFunctionOn", params: { ...effects, objectId: "scope",
      functionDeclaration: CURRENT_PCB_CONSTRUCTOR_BUNDLE_FUNCTIONS[kind], returnByValue: false,
      arguments: [{ objectId: "wrapper" }, { objectId: "teardrop" }] }, sessionId: "session" };
    assert.deepEqual(accepted(wire(command)), { action: "send", requestId: 1, method: "Runtime.callFunctionOn",
      sessionId: "session", modelPhase: `constructors-${kind}`, objectId: "scope", callbackObjectId: "wrapper", teardropObjectId: "teardrop" });
    assert.throws(() => rejected(wire(command)), /OUTBOUND/u);
    for (const changes of [{ returnByValue: true }, { throwOnSideEffect: false },
      { arguments: [{ objectId: "wrapper" }] }, { arguments: [{ objectId: "wrapper" }, { value: "extra" }] }]) {
      assert.throws(() => accepted(wire({ ...command, params: { ...command.params, ...changes } })), /OUTBOUND/u);
    }
  }
  const pending = modelCommands()[7]; assert.ok(pending !== undefined);
  assert.equal(diagnosticNativeRequest(wire(pending))["constructorObjectId"], "constructors");
  for (const args of [[{ objectId: "wrapper" }], [{ objectId: "wrapper" }, { value: "constructors" }],
    [{ objectId: "wrapper" }, { objectId: "constructors" }],
    [{ objectId: "wrapper" }, { objectId: "constructors" }, { objectId: "teardrop" }, { objectId: "extra" }]]) {
    assert.throws(() => diagnosticNativeRequest(wire({ ...pending, params: { ...params(pending), arguments: args } })), /OUTBOUND/u);
  }
});

void test("teardrop owner protocol admits exactly six bound receivers and six source-qualified targets", () => {
  for (const [phase, functionDeclaration, argumentCount] of [
    ["teardrop-callbacks", CURRENT_PCB_TEARDROP_CALLBACK_SELECTOR, 1],
    ["teardrop-owner", CURRENT_PCB_TEARDROP_OWNER_ASSOCIATION, 14],
  ] as const) {
    const argumentsList = Array.from({ length: argumentCount }, (_, index) => ({ objectId: `a${index}` }));
    const command = { id: 103, method: "Runtime.callFunctionOn", params: { ...effects, objectId: "scope",
      functionDeclaration, returnByValue: false, arguments: argumentsList }, sessionId: "page" };
    for (const adapter of [diagnosticNativeRequest, stringPrecreateNativeRequest]) {
      const flat = adapter(wire(command)); assert.equal(flat["modelPhase"], phase); assert.equal(flat["callbackObjectId"], "a0");
      if (argumentCount === 14) {
        assert.equal(flat["teardropCallbacksObjectId"], "a1");
        for (let index = 0; index < 6; index += 1) {
          assert.equal(flat[`teardropReceiver${index}`], `a${index + 2}`);
          assert.equal(flat[`teardropTarget${index}`], `a${index + 8}`);
        }
      }
      for (const changes of [{ arguments: [] }, { arguments: [...argumentsList, { objectId: "extra" }] },
        { returnByValue: true }, { throwOnSideEffect: false }, { awaitPromise: true }, { uniqueContextId: "foreign" }]) {
        assert.throws(() => adapter(wire({ ...command, params: { ...command.params, ...changes } })), /OUTBOUND/u);
      }
      for (let index = 0; index < argumentsList.length; index += 1) {
        const changed = structuredClone(argumentsList); changed[index] = { objectId: "foreign/handle" };
        assert.throws(() => adapter(wire({ ...command, params: { ...command.params, arguments: changed } })), /OUTBOUND/u);
      }
      for (const key of ["params", "functionDeclaration", "arguments", "expression", "budget"]) { assert.equal(Object.hasOwn(flat, key), false); }
    }
  }
});

void test("opening protocol rejects code/options, phase, target identity and noncanonical target-order mutations", () => {
  const selected = target();
  const original = { id: 1, method: "Runtime.callFunctionOn",
    params: diagnosticOpeningParams("context", selected, "open-project"), sessionId: "session" };
  const changes: readonly ((command: Row) => void)[] = [
    command => { params(command)["functionDeclaration"] = "function(){return true}"; },
    command => { params(command)["throwOnSideEffect"] = true; },
    command => { params(command)["awaitPromise"] = false; },
    command => { params(command)["objectId"] = "unowned"; },
    command => { params(command)["arguments"] = [{ value: selected }, { value: "save" }]; },
    command => { params(command)["arguments"] = [{ value: { ...selected, projectUuid: "f".repeat(64) } }, { value: "open-project" }]; },
    command => { params(command)["arguments"] = [{ value: selected }, { value: "open-project" }, { value: "extra" }]; },
    command => { params(command)["arguments"] = [{ value: Object.fromEntries(Object.entries(selected).toReversed()) }, { value: "open-project" }]; },
    command => { command["modelPhase"] = "wrapper"; },
  ];
  for (const change of changes) {
    const command: Row = structuredClone(original); change(command);
    assert.throws(() => diagnosticNativeRequest(wire(command)));
  }
});

void test("model protocol rejects every effect override, extra scope/call options and non-retained handle shape", () => {
  const originals = modelCommands();
  for (const original of originals) {
    for (const change of [
      (command: Row): void => { command["modelPhase"] = "snapshot"; },
      (command: Row): void => { params(command)["executionContextId"] = 1; },
      (command: Row): void => { command["sessionId"] = "s".repeat(129); },
    ]) {
      const command = structuredClone(original); change(command);
      assert.throws(() => diagnosticNativeRequest(wire(command)));
    }
  }
  for (const index of [0, 3, 6, 7, 8, 9]) {
    const original = originals[index]; assert.ok(original !== undefined);
    for (const [field, value] of Object.entries({ throwOnSideEffect: false, silent: false, awaitPromise: true,
      generatePreview: true, userGesture: true })) {
      const command = structuredClone(original); params(command)[field] = value;
      assert.throws(() => diagnosticNativeRequest(wire(command)), field);
    }
  }
  for (const [index, field, value] of [
    [0, "expression", "globalThis"], [0, "objectGroup", "foreign"], [0, "uniqueContextId", "c".repeat(257)],
    [1, "objectId", "foreign/handle"], [1, "ownProperties", false], [1, "accessorPropertiesOnly", true],
    [3, "timeout", 1000], [3, "arguments", []], [3, "functionDeclaration", "function(){}"],
    [6, "arguments", [{ value: "caller-data" }]], [6, "arguments", [{ objectId: "a" }, { objectId: "b" }]],
    [6, "arguments", [{ objectId: "x".repeat(257) }]], [7, "arguments", []], [8, "arguments", [{ value: "foreign" }]],
    [7, "functionDeclaration", "function(){}"], [8, "functionDeclaration", "function(){}"],
    [9, "arguments", [{ value: "foreign" }]], [9, "functionDeclaration", "function(){}"],
    [9, "arguments", [{ objectId: "a" }]],
    [9, "arguments", [{ objectId: "a" }, { objectId: "b" }, { objectId: "extra" }]],
    [10, "objectGroup", "foreign"], [10, "objectId", "extra"],
  ] as const) {
    const original = originals[index]; assert.ok(original !== undefined);
    const command = structuredClone(original); params(command)[field] = value;
    assert.throws(() => diagnosticNativeRequest(wire(command)), `${index}:${field}`);
  }
});

void test("adapter request and byte budgets are fixed and reject overflow without a caller override", () => {
  assert.equal(DIAGNOSTIC_REQUEST_LIMIT, 103);
  const original = modelCommands()[0]; assert.ok(original !== undefined);
  assert.equal(diagnosticNativeRequest(wire({ ...original, id: 103 }))["requestId"], 103);
  for (const id of [0, -1, 104, 1.5, "103"]) {
    assert.throws(() => diagnosticNativeRequest(wire({ ...original, id })));
  }
  assert.throws(() => diagnosticNativeRequest(Buffer.alloc(65_537)));
  assert.throws(() => diagnosticNativeRequest(Buffer.from(JSON.stringify(original))));
  assert.throws(() => diagnosticNativeRequest(Buffer.from(`${JSON.stringify(original)} \0`)));
});

void test("fixed root inventory stays within the existing command bound at maximum original handle widths", () => {
  const original = modelCommands()[9]; assert.ok(original !== undefined);
  const command = { ...original, id: 64, sessionId: "s".repeat(128),
    params: { ...params(original), objectId: "o".repeat(256), arguments: [{ objectId: "c".repeat(256) }, { objectId: "t".repeat(256) }] } };
  const encoded = wire(command);
  assert.ok(encoded.length <= 65_536);
  const request = diagnosticNativeRequest(encoded);
  assert.equal(request["modelPhase"], "root-inventory");
  assert.equal(request["requestId"], 64);
  assert.equal(request["objectId"], "o".repeat(256));
  assert.equal(request["callbackObjectId"], "c".repeat(256));
  assert.equal(Object.hasOwn(request, "functionDeclaration"), false);
});

void test("native adapter embeds and private fields match TS programs without native execution", async () => {
  const source = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  for (const [name, program] of Object.entries({
    OpeningFunction: diagnosticOpeningParams("context", target(), "preflight").functionDeclaration,
    PcbOpeningFunction: diagnosticPcbOpeningParams("context", target(), "preflight").functionDeclaration,
    ModelCallbackExpression: CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION,
    ModelHandlerFunction: CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION, ModelStateFunction: CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_FUNCTION,
    ModelPendingFunction: CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION, ModelRawStringsFunction: CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_FUNCTION,
    ModelRootInventoryFunction: CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_FUNCTION,
    ModelDiagnosticConstructorsFunction: CURRENT_PCB_CONSTRUCTOR_BUNDLE_FUNCTIONS.diagnostic,
    ModelPrecreateConstructorsFunction: CURRENT_PCB_CONSTRUCTOR_BUNDLE_FUNCTIONS.precreate,
    TeardropCallbacksFunction: CURRENT_PCB_TEARDROP_CALLBACK_SELECTOR,
    TeardropOwnerFunction: CURRENT_PCB_TEARDROP_OWNER_ASSOCIATION,
  })) {
    const encoded = new RegExp(`const string ${name}=@"((?:""|[^"])*)";`, "u").exec(source)?.[1];
    const actual = ["ModelRawStringsFunction", "TeardropCallbacksFunction", "TeardropOwnerFunction"].includes(name) || name === "OpeningFunction" || name === "PcbOpeningFunction" || name === "ModelStateFunction" || name === "ModelPendingFunction" || name === "ModelRootInventoryFunction" || name === "ModelDiagnosticConstructorsFunction" || name === "ModelPrecreateConstructorsFunction"
      ? readPackedNativeProgram(source, name) : encoded?.replaceAll('""', '"');
    assert.equal(actual, program, name);
    assert.ok(source.includes(createHash("sha256").update(program).digest("hex")));
  }
  assert.ok(source.includes(String.raw`string target="{\"rawWindowsPath\":"+JsonString(path)+",\"projectUuid\":"+JsonString(project)+`));
  assert.ok(source.includes(String.raw`",\"documentUuid\":"+JsonString(document)+",\"expectedSourceSha256\":"+JsonString(source)+",\"branchUuid\":"+JsonString(branch)+"}";`));
  assert.ok(source.includes("$requestLimit=if ($StringPrecreate) {3309} else {103}"));
  assert.ok(source.includes("$request.requestId -gt $requestLimit"));
  assert.ok(source.includes("id!=nextRequest || id>EffectiveRequestLimit"));
  assert.ok(source.includes("int RequestLimit { get { return workerStartup?256:stringPrecreate?3309:103; } }"));
  // New held purposes choose their fixed physical-ID ceilings before the
  // Unchanged legacy route chain. Normal/cleanup classes are counted separately.
  const heldLimitPrefix = "footprintHeldCache209?HeldCacheRequests:workerStartupFootprintHeldSaved209?HeldSavedRequests:";
  const legacyLimit = "workerStartupFootprintForward209?EasyedaFootprintForwardLimits.Requests:workerStartupFootprintCombined209?EasyedaFootprintCombinedLimits.Requests:workerStartupFootprintSaved209?EasyedaFootprintSavedLimits.Requests:workerStartupFootprintCopy209?EasyedaFootprintExecutionLimits.Requests:EasyedaFootprintPreparationLimits.Requests";
  const footprintLimits = [...source.matchAll(/long FootprintRequestLimit \{ get \{ return ([^;\r\n]+); \} \}/gu)];
  assert.equal(footprintLimits.length, 1); assert.equal(footprintLimits[0]?.[1], heldLimitPrefix + legacyLimit);
  const legacyNormalLimit = legacyLimit.replaceAll(".Requests", ".NormalRequests");
  const footprintNormalLimits = [...source.matchAll(/long FootprintNormalRequestLimit \{ get \{ return ([^;\r\n]+); \} \}/gu)];
  assert.equal(footprintNormalLimits.length, 1); assert.equal(footprintNormalLimits[0]?.[1], heldLimitPrefix + legacyNormalLimit);
  assert.ok(source.includes("public const int HeldSavedRequests=363,HeldSavedNormal=328,HeldSavedCleanup=35;"));
  assert.ok(source.includes("public const int HeldCacheRequests=46,HeldCacheNormal=45,HeldCacheCleanup=1;"));
  assert.ok(source.includes("public static class EasyedaFootprintSavedLimits { public const int Requests=353; public const int NormalRequests=319;"));
  assert.ok(source.includes("long EffectiveRequestLimit { get { return workerStartupFootprint209?FootprintRequestLimit:workerStartupRatline209?RatlineRequestLimit:workerStartupEmpty209?EasyedaWorkerStartupEmpty209Protocol.RequestLimit:RequestLimit; } }"));
  assert.ok(source.includes("public const int RequestLimit=3466;"));
  assert.ok(source.includes("public const long RequestLimit=383L;"));
  assert.ok(source.includes("public const long NormalRequestLimit=337L;"));
  assert.ok(source.includes("if (($StringPrecreate -and $WorkerStartup) -or ($Layers209 -and ($StringPrecreate -or $WorkerStartup)))"));
  assert.ok(source.includes("if ($WorkerStartupRatline209 -and ($StringPrecreate -or $WorkerStartup -or $Layers209 -or $WorkerStartup209 -or $WorkerStartupEmpty209))"));
  const legacyStartupLimit = "if ($WorkerStartupFootprintForward209) {[EasyedaFootprintForwardLimits]::Requests} elseif ($WorkerStartupFootprintCombined209) {[EasyedaFootprintCombinedLimits]::Requests} elseif ($WorkerStartupFootprintSaved209) {[EasyedaFootprintSavedLimits]::Requests} elseif ($WorkerStartupFootprintCopy209) {[EasyedaFootprintExecutionLimits]::Requests} elseif ($WorkerStartupFootprint209) {[EasyedaFootprintPreparationLimits]::Requests} elseif ($WorkerStartupRatlineContinuation209) {[EasyedaRatlineContinuation209Limits]::RequestLimit} elseif ($WorkerStartupRatline209) {[EasyedaRatline209Limits]::RequestLimit} elseif ($WorkerStartupEmpty209) {[EasyedaWorkerStartupEmpty209Protocol]::RequestLimit} else {256}";
  const startupLimits = [...source.matchAll(/^\$startupRequestLimit=(.+)$/gmu)];
  assert.equal(startupLimits.length, 1);
  assert.equal(startupLimits[0]?.[1], `if ($FootprintHeldCache209) {[EasyedaDiagnosticOwner]::HeldCacheRequests} elseif ($WorkerStartupFootprintHeldSaved209) {[EasyedaDiagnosticOwner]::HeldSavedRequests} else${legacyStartupLimit}`);
  assert.ok(source.includes("$request.requestId -gt $startupRequestLimit) {throw 'pcb-diagnostic-startup-fields'}"));
  assert.ok(source.includes('if((long)received+count>(workerStartupRatline209?RatlineTotalByteLimit:workerStartupEmpty209?EasyedaWorkerStartupEmpty209Protocol.TotalByteLimit:64L*1024*1024)) throw Error("receive-budget")'));
  assert.ok(source.includes("'snapshot' {$fields+=@('objectId','callbackObjectId')}"));
  assert.ok(source.includes("'pending' {$fields+=@('objectId','callbackObjectId','constructorObjectId','teardropObjectId')}"));
  assert.ok(source.includes("'raw-strings' {$fields+=@('objectId','callbackObjectId')}"));
  assert.ok(source.includes("'root-inventory' {$fields+=@('objectId','callbackObjectId','constructorObjectId')}"));
  assert.ok(source.includes("CreateProcess(installation.Executable,new StringBuilder(args),IntPtr.Zero,IntPtr.Zero,true,0x00080004"));
  const retained = source.indexOf("root=info.process; rootThread=info.thread; rootPid=info.processId;");
  const checked = source.indexOf("installation.AssertCreatedImage(root);"), resumed = source.indexOf("if(ResumeThread(rootThread)!=1)");
  assert.ok(retained > 0 && checked > retained && resumed > checked);
  assert.ok(source.includes("QueryFullProcessImageName(process,1,actual,ref count)"));
});

void test("PCB document opening has distinct fixed phases and never aliases project opening", () => {
  const selected = target();
  for (const phase of ["preflight", "open-document", "observe"] as const) {
    const command = { id: 63, method: "Runtime.callFunctionOn",
      params: diagnosticPcbOpeningParams("original-context", selected, phase), sessionId: "original-page-session" };
    const request = diagnosticNativeRequest(wire(command));
    assert.equal(request["pcbOpeningPhase"], phase); assert.equal(Object.hasOwn(request, "openingPhase"), false);
    assert.equal(request["targetDocumentUuid"], selected.documentUuid);
    for (const other of ["open-project", "save", ""]) {
      assert.throws(() => diagnosticNativeRequest(wire({ ...command,
        params: { ...command.params, arguments: [{ value: selected }, { value: other }] } })));
    }
    assert.throws(() => diagnosticNativeRequest(wire({ ...command, params: { ...command.params, throwOnSideEffect: true } })));
  }
});

void test("DOM correlation accepts only original frame IDs or numeric backend IDs and fixed shallow description", () => {
  const frame = { id: 60, method: "DOM.getFrameOwner", params: { frameId: "original-frame" }, sessionId: "original-page-session" };
  const node = { id: 61, method: "DOM.describeNode", params: { backendNodeId: 1234, depth: 0, pierce: false }, sessionId: "original-page-session" };
  assert.deepEqual(diagnosticNativeRequest(wire(frame)), { action: "send", requestId: 60, method: "DOM.getFrameOwner",
    sessionId: "original-page-session", frameId: "original-frame" });
  assert.deepEqual(diagnosticNativeRequest(wire(node)), { action: "send", requestId: 61, method: "DOM.describeNode",
    sessionId: "original-page-session", backendNodeId: 1234 });
  for (const bad of [
    { ...frame, params: { frameId: "x".repeat(129) } }, { ...frame, params: { frameId: "original-frame", nodeId: 1 } },
    ...[0, -1, 1.5, 2_147_483_648, "1234", null].map(backendNodeId => ({ id: node.id, method: node.method,
      params: { backendNodeId, depth: 0, pierce: false }, sessionId: node.sessionId })),
    { ...node, params: { ...node.params, depth: 1 } }, { ...node, params: { ...node.params, pierce: true } },
    { ...node, params: { nodeId: 1234, depth: 0, pierce: false } },
  ]) { assert.throws(() => diagnosticNativeRequest(wire(bad))); }
});
