import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { CURRENT_PCB_209_VISUAL_FUNCTION } from "../src/current-pcb-209-visual-actions.ts";
import { readPackedNativeProgram } from "./helpers/native-packed-program.ts";

void test("native visual program is exact, packed and independently constrained to its five viewport operations", async () => {
  const source = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  assert.equal(readPackedNativeProgram(source, "Visual209Function"), CURRENT_PCB_209_VISUAL_FUNCTION);
  assert.equal(/const string Visual209FunctionSha256="([a-f0-9]{64})";/u.exec(source)?.[1],
    createHash("sha256").update(CURRENT_PCB_209_VISUAL_FUNCTION).digest("hex"));
  assert.ok(Buffer.byteLength(source) <= 1024 * 1024);
  assert.equal(Buffer.from(source).some((byte) => byte > 0x7F), false);
  for (const guard of ["CreateVisual209()", "if(!visual209 || !layers209 || stringPrecreate || workerStartup)",
    'if(visual209Attempted)throw Error("visual209-consumed");visual209Attempted=true;SendMessage',
    "new Visual209Json(value).Build()", "visual209-duplicate-field", "visual209-operation-size", "visual209-number-bound",
    "visual209-invalid-operation", "visual209-navigation-invalid", "visual209-navigation-canonical", "visual209-overlay-acceptance",
    "visual209-old-purpose", "visual209-id-count", "visual209-id-length",
    "visual209-old-abort", "visual209-unbound-abort", "visual209-abort-dispatch", "visual209-termination-identity",
    "Native(TerminateJobObject(job,0x45444156))", "$request.confirmAbortOriginalVisualJob -isnot [bool]",
    "[EasyedaDiagnosticOwner]::VerifyVisual209Smoke()", "$request.visualOperationJson -isnot [string]",
    "if (-not $Visual209) {throw 'pcb-diagnostic-visual209-purpose'}"]) { assert.ok(source.includes(guard), guard); }
  assert.equal(source.includes("$request.functionDeclaration"), false);
  assert.equal(source.includes("$request.expression"), false);
  assert.equal(source.includes("$request.arguments"), false);
});

void test("independent Windows launch smoke binds exact helper length, digest and C# fragment under the unchanged cap", async () => {
  const [bytes, consumer] = await Promise.all([
    readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url)),
    readFile(new URL("../../scripts/pcb-diagnostic-launch-smoke.ps1", import.meta.url), "utf8"),
  ]);
  const actualHash = createHash("sha256").update(bytes).digest("hex");
  const source = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  const verify = (program: string): void => {
    assert.equal(Number(/\$bytes = Read-BoundedFile \$helper ([0-9]+)/u.exec(program)?.[1]), 1024 * 1024);
    assert.ok(bytes.length > 0 && bytes.length <= 1024 * 1024);
    assert.equal(Number(/if \(\$bytes\.Length -ne ([0-9]+)\)/u.exec(program)?.[1]), bytes.length);
    assert.equal(/if \(\$helperHash -cne '([a-f0-9]{64})'\)/u.exec(program)?.[1], actualHash);
    const beginLiteral = /^\$begin = "([^"\r\n]+)"$/mu.exec(program)?.[1];
    const endLiteral = /^\$end = "([^"\r\n]+)"$/mu.exec(program)?.[1];
    assert.ok(beginLiteral !== undefined && endLiteral !== undefined);
    const begin = beginLiteral.replaceAll("`n", "\n"), end = endLiteral.replaceAll("`n", "\n");
    const start = source.indexOf(begin), stop = source.indexOf(end);
    assert.ok(start !== -1 && stop > start + begin.length);
    assert.equal(source.indexOf(begin, start + begin.length), -1); assert.equal(source.indexOf(end, stop + end.length), -1);
    const fragment = source.slice(start + begin.length, stop);
    assert.ok(fragment.startsWith("using System;\n")); assert.ok(fragment.endsWith("\n}"));
    assert.ok(fragment.includes("public sealed class EasyedaDiagnosticOwner"));
    assert.ok(program.includes("$native = $source.Substring($start+$begin.Length,$stop-$start-$begin.Length)"));
  };
  verify(consumer);
  // These in-memory corruptions reproduce the independent stale-pin failure
  // Without changing the helper, Windows smoke or its actual source artifact.
  assert.throws(() => { verify(consumer.replace(/\$bytes\.Length -ne [0-9]+/u, `$bytes.Length -ne ${bytes.length - 1}`)); });
  assert.throws(() => { verify(consumer.replace(actualHash, "0".repeat(64))); });
  assert.throws(() => { verify(consumer.replace("Read-BoundedFile $helper 1048576", "Read-BoundedFile $helper 1048577")); });
  assert.throws(() => { verify(consumer.replace("$stop-$start-$begin.Length", "$stop-$start")); });
});
