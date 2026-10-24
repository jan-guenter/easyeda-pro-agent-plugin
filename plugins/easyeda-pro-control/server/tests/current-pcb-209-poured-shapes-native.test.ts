import { readPackedNativeProgram } from "./helpers/native-packed-program.ts";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { CURRENT_PCB_209_POURED_SHAPES_FUNCTION } from "../src/current-pcb-209-poured-shapes.ts";
import { DIAGNOSTIC_REQUEST_LIMIT, diagnosticNativeRequest, diagnosticPouredShapes209Params } from "../src/current-pcb-diagnostic-protocol.ts";

const path = String.raw`C:\Reviewed\PouredShapeFixture.eprj2`;
const target = { rawWindowsPath: path, projectUuid: createHash("sha256").update(path).digest("hex"),
  documentUuid: "b".repeat(16), expectedSourceSha256: "c".repeat(64), branchUuid: "a".repeat(32) };
function wire(value: unknown): Buffer { return Buffer.from(`${JSON.stringify(value)}\0`); }

void test("209 Poured shape wire reconstructs only its fixed command within the unchanged budget", () => {
  const command = { id: 103, method: "Runtime.callFunctionOn", params: diagnosticPouredShapes209Params("ui-original", target), sessionId: "session-original" };
  assert.deepEqual(diagnosticNativeRequest(wire(command)), { action: "send", requestId: 103, method: "Runtime.callFunctionOn",
    sessionId: "session-original", uniqueContextId: "ui-original", pcbPouredShapes209Phase: "observe", targetRawWindowsPath: path,
    targetProjectUuid: target.projectUuid, targetBranchUuid: target.branchUuid, targetDocumentUuid: target.documentUuid,
    targetExpectedSourceSha256: target.expectedSourceSha256 });
  assert.equal(DIAGNOSTIC_REQUEST_LIMIT, 103);
  assert.throws(() => diagnosticNativeRequest(wire({ ...command, id: 104 })));
  for (const params of [{ ...command.params, functionDeclaration: "async()=>1" }, { ...command.params, throwOnSideEffect: true },
    { ...command.params, arguments: [{ value: target }, { value: "open-document" }] },
    { ...command.params, arguments: [{ value: { ...target, branchUuid: undefined } }, { value: "observe" }] },
    { ...command.params, arguments: [{ value: { ...target, projectUuid: "f".repeat(64) } }, { value: "observe" }] },
    { ...command.params, uniqueContextId: "" }, { ...command.params, family: "Poured" }, { ...command.params, userGesture: true }]) {
    assert.throws(() => diagnosticNativeRequest(wire({ ...command, params })));
  }
});

void test("native209 Poured shape source embeds the exact program and refuses other purposes", async () => {
  const native = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  assert.equal(readPackedNativeProgram(native, "PouredShapes209Function"), CURRENT_PCB_209_POURED_SHAPES_FUNCTION);
  assert.equal(/const string PouredShapes209FunctionSha256="([a-f0-9]{64})";/u.exec(native)?.[1],
    createHash("sha256").update(CURRENT_PCB_209_POURED_SHAPES_FUNCTION).digest("hex"));
  assert.ok(native.includes('if(!layers209 || stringPrecreate || workerStartup) throw Error("poured-shapes209-purpose")'));
  assert.ok(native.includes("if (-not $Layers209) {throw 'pcb-diagnostic-poured-shapes209-purpose'}"));
  assert.ok(native.includes("[EasyedaDiagnosticOwner]::VerifyPouredShapes209Smoke()"));
  for (const check of ["poured-shapes209-program", "poured-shapes209-command", "poured-shapes209-budget", "poured-shapes209-phase",
    "poured-shapes209-legacy-purpose", "poured-shapes209-exclusive-purpose", "pcb-diagnostic-poured-shapes209-field"]) {
    assert.ok(native.includes(check), check);
  }
  assert.equal(native.includes("$request.functionDeclaration"), false);
  assert.equal(native.includes("$request.expression"), false);
  assert.equal(native.includes("$request.arguments"), false);
});
