import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { CURRENT_PCB_209_VISUAL_FUNCTION } from "../src/current-pcb-209-visual-actions.ts";
import { readPackedNativeProgram } from "./helpers/native-packed-program.ts";

void test("native visual program is exact, packed and independently constrained to its three viewport operations", async () => {
  const source = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  assert.equal(readPackedNativeProgram(source, "Visual209Function"), CURRENT_PCB_209_VISUAL_FUNCTION);
  assert.equal(/const string Visual209FunctionSha256="([a-f0-9]{64})";/u.exec(source)?.[1],
    createHash("sha256").update(CURRENT_PCB_209_VISUAL_FUNCTION).digest("hex"));
  assert.ok(Buffer.byteLength(source) <= 1024 * 1024);
  assert.equal(Buffer.from(source).some((byte) => byte > 0x7F), false);
  for (const guard of ["CreateVisual209()", "if(!visual209 || !layers209 || stringPrecreate || workerStartup)",
    'if(visual209Attempted)throw Error("visual209-consumed");visual209Attempted=true;SendMessage',
    "new Visual209Json(value).Build()", "visual209-duplicate-field", "visual209-operation-size", "visual209-number-bound",
    "visual209-invalid-operation", "visual209-old-purpose", "visual209-id-count", "visual209-id-length",
    "visual209-old-abort", "visual209-unbound-abort", "visual209-abort-dispatch", "visual209-termination-identity",
    "Native(TerminateJobObject(job,0x45444156))", "$request.confirmAbortOriginalVisualJob -isnot [bool]",
    "[EasyedaDiagnosticOwner]::VerifyVisual209Smoke()", "$request.visualOperationJson -isnot [string]",
    "if (-not $Visual209) {throw 'pcb-diagnostic-visual209-purpose'}"]) { assert.ok(source.includes(guard), guard); }
  assert.equal(source.includes("$request.functionDeclaration"), false);
  assert.equal(source.includes("$request.expression"), false);
  assert.equal(source.includes("$request.arguments"), false);
});
