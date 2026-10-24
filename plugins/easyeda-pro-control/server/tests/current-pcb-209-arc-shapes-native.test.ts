import { readPackedNativeProgram } from "./helpers/native-packed-program.ts";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { CURRENT_PCB_209_ARC_SHAPES_FUNCTION } from "../src/current-pcb-209-arc-shapes.ts";
import { DIAGNOSTIC_REQUEST_LIMIT, diagnosticArcShapes209Params, diagnosticNativeRequest } from "../src/current-pcb-diagnostic-protocol.ts";

const path = String.raw`C:\Reviewed\ArcShapeFixture.eprj2`;
const target = { rawWindowsPath: path, projectUuid: createHash("sha256").update(path).digest("hex"),
  documentUuid: "b".repeat(16), expectedSourceSha256: "c".repeat(64), branchUuid: "a".repeat(32) };
function wire(value: unknown): Buffer { return Buffer.from(`${JSON.stringify(value)}\0`); }

void test("209 Arc shape wire reconstructs only its fixed command within the unchanged budget", () => {
  const command = { id: 103, method: "Runtime.callFunctionOn", params: diagnosticArcShapes209Params("ui-original", target), sessionId: "session-original" };
  assert.deepEqual(diagnosticNativeRequest(wire(command)), { action: "send", requestId: 103, method: "Runtime.callFunctionOn",
    sessionId: "session-original", uniqueContextId: "ui-original", pcbArcShapes209Phase: "observe", targetRawWindowsPath: path,
    targetProjectUuid: target.projectUuid, targetBranchUuid: target.branchUuid, targetDocumentUuid: target.documentUuid,
    targetExpectedSourceSha256: target.expectedSourceSha256 });
  assert.equal(DIAGNOSTIC_REQUEST_LIMIT, 103);
  assert.throws(() => diagnosticNativeRequest(wire({ ...command, id: 104 })));
  for (const params of [{ ...command.params, functionDeclaration: "async()=>1" }, { ...command.params, throwOnSideEffect: true },
    { ...command.params, arguments: [{ value: target }, { value: "open-document" }] },
    { ...command.params, arguments: [{ value: { ...target, branchUuid: undefined } }, { value: "observe" }] },
    { ...command.params, arguments: [{ value: { ...target, projectUuid: "f".repeat(64) } }, { value: "observe" }] },
    { ...command.params, uniqueContextId: "" }, { ...command.params, family: "Arc" }, { ...command.params, userGesture: true }]) {
    assert.throws(() => diagnosticNativeRequest(wire({ ...command, params })));
  }
});

void test("native209 Arc shape source embeds the exact program and refuses other purposes", async () => {
  const native = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  assert.equal(readPackedNativeProgram(native, "ArcShapes209Function"), CURRENT_PCB_209_ARC_SHAPES_FUNCTION);
  assert.equal(/const string ArcShapes209FunctionSha256="([a-f0-9]{64})";/u.exec(native)?.[1],
    createHash("sha256").update(CURRENT_PCB_209_ARC_SHAPES_FUNCTION).digest("hex"));
  assert.ok(native.includes('if(!layers209 || stringPrecreate || workerStartup) throw Error("arc-shapes209-purpose")'));
  assert.ok(native.includes("if (-not $Layers209) {throw 'pcb-diagnostic-arc-shapes209-purpose'}"));
  assert.ok(native.includes("[EasyedaDiagnosticOwner]::VerifyArcShapes209Smoke()"));
  for (const check of ["arc-shapes209-program", "arc-shapes209-command", "arc-shapes209-budget", "arc-shapes209-phase",
    "arc-shapes209-legacy-purpose", "arc-shapes209-exclusive-purpose", "pcb-diagnostic-arc-shapes209-field"]) {
    assert.ok(native.includes(check), check);
  }
  assert.equal(native.includes("$request.functionDeclaration"), false);
  assert.equal(native.includes("$request.expression"), false);
  assert.equal(native.includes("$request.arguments"), false);
});
