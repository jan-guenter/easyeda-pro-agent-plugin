/* oxlint-disable import/max-dependencies -- Compare independently bounded legacy/v2 source, fixed generator and six released artifacts together. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { gzipSync } from "node:zlib";
import { generateWorkerStartupProtocol } from "../../scripts/generate-worker-startup-protocol.ts";
import { currentPcbDiagnosticCSharpCompilerInput as legacyCompiler } from "../src/current-pcb-diagnostic-csharp-storage.ts";
import { CURRENT_PCB_DIAGNOSTIC_CSHARP_REVIEW_MAX_BYTES as REVIEW_MAXIMUM, currentPcbDiagnosticCSharpRuntimeCompilerInput as compiler, expandCurrentPcbDiagnosticCSharpReviewSource as expand, packCurrentPcbDiagnosticCSharpReviewStorage as pack, packCurrentPcbDiagnosticCSharpTokenFusionStorage as packV3, currentPcbDiagnosticCSharpReviewSource as review } from "../src/current-pcb-diagnostic-csharp-review-storage.ts";
import { CURRENT_PCB_DIAGNOSTIC_CSHARP_SPACING_MAX_BYTES as SPACING_MAXIMUM, compactCurrentPcbDiagnosticCSharp as compact, restoreCurrentPcbDiagnosticCSharp as restore } from "../src/current-pcb-diagnostic-csharp-spacing.ts";
import { CURRENT_PCB_DIAGNOSTIC_HELPER_SOURCE_MAX_BYTES as MAXIMUM } from "../src/current-pcb-diagnostic-helper-source-profile.ts";
import { currentFootprintForwardNativeOutputs } from "../src/current-footprint-forward-native-graph-source.ts";
import { currentFootprintForwardColdNativeOutputs } from "../src/current-footprint-forward-cold-native-graph-source.ts";

const body = String.raw`using System;
// BEGIN ORIGINAL MARKER
public class Fixed {
  public string Regular = "  // not trivia /* \\\" \u0020";
  public string Verbatim = @"  /* not trivia */
#if not_a_directive
quoted "" text";
  public char Character = '\'';
  public int Integer = 1 /* separator */ + + 2;
}
// END ORIGINAL MARKER`;
const sample = `# preamble\nAdd-Type @'\n${body}\n'@\n# suffix\n`;
const sha = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");
const compilerFields = /^\$fixedCurrent209CompactCompiler=Expand-FixedCurrent209CSharp '([A-Za-z\d+/=]+)' (\d+) '([a-f\d]{64})' (\d+) '([a-f\d]{64})'$/mu;
void test("public packers report measured spacing overflow before packing while retaining the same cap", () => {
  const source = `Add-Type @'\nclass C {}${" ".repeat(SPACING_MAXIMUM)}\n'@\n`;
  for (const store of [pack, packV3]) {
    let failure: unknown;
    try { store(source); } catch (error) { failure = error; }
    assert.ok(failure instanceof Error);
    const match = /^PCB_DIAGNOSTIC_CSHARP_SPACING(?:_V3)?: measured=(\d+), limit=(\d+)$/u.exec(failure.message);
    assert.ok(match !== null); assert.equal(Number(match[2]), SPACING_MAXIMUM); assert.ok(Number(match[1]) > SPACING_MAXIMUM);
  }
});
function payload(stored: string, raw: Buffer, zipped: Buffer): string {
  return stored.replace(compilerFields, `$fixedCurrent209CompactCompiler=Expand-FixedCurrent209CSharp '${zipped.toString("base64")}' ${String(raw.length)} '${sha(raw)}' ${String(zipped.length)} '${sha(zipped)}'`);
}
void test("v2 separates compiler bytes from exact review/marker restoration and preserves every literal", () => {
  const value = compact(body); assert.ok(Buffer.byteLength(value.compact) < Buffer.byteLength(body));
  assert.equal(restore(value.compact, value.spacing, value.tokenSha256), body);
  for (const literal of [String.raw`"  // not trivia /* \\\" \u0020"`, String.raw`@"  /* not trivia */
#if not_a_directive
quoted "" text"`, String.raw`'\''`]) { assert.ok(body.includes(literal)); assert.ok(value.compact.includes(literal)); }
  const stored = pack(sample); assert.equal(pack(stored), stored); assert.equal(expand(stored), sample); assert.equal(review(stored), body); assert.equal(compiler(stored), value.compact);
  assert.throws(() => legacyCompiler(stored)); assert.ok(Buffer.byteLength(stored) <= MAXIMUM); assert.ok(Buffer.byteLength(compiler(stored)) <= MAXIMUM);
});
void test("malformed spacing, token/literal changes and unsupported lexical forms refuse", () => {
  const value = compact(body); const stored = pack(sample); const match = compilerFields.exec(stored); assert.ok(match !== null && match[1] !== undefined);
  const zipped = Buffer.from(match[1], "base64");
  for (const invalid of [Buffer.from([0x80, 0]), Buffer.concat([value.spacing, Buffer.from([0])]), Buffer.alloc(SPACING_MAXIMUM + 1), value.spacing.subarray(0, -1)]) { assert.throws(() => restore(value.compact, invalid, value.tokenSha256)); }
  assert.throws(() => restore(value.compact, value.spacing, "0".repeat(64)));
  assert.throws(() => expand(stored.replace(value.tokenSha256, "0".repeat(64))));
  for (const changed of [value.compact.replace("public class", "private class"), value.compact.replace("not trivia", "foreign bytes")]) {
    const raw = Buffer.from(changed);
    // oxlint-disable-next-line node/no-sync -- Fixed hostile compiler bytes prove token/literal joins before any compiler.
    assert.throws(() => compiler(payload(stored, raw, gzipSync(raw, { level: 9 }))));
  }
  const trailing = Buffer.concat([zipped, Buffer.from([0])]);
  assert.throws(() => expand(payload(stored, Buffer.from(value.compact), trailing)));
  assert.throws(() => expand(stored.replace("# END FIXED", "# UNKNOWN FIXED"))); assert.throws(() => expand(`${stored}${stored}`));
  assert.throws(() => pack(sample.replace(body, " ".repeat(SPACING_MAXIMUM + 1) + body)));
  for (const source of ['#if false\n"unterminated\n#endif', 'class C {string x=$"new";}', 'class C {string x="""new""";}', String.raw`class C {int \u0061;}`, 'class C {char x=\'ab\';}', String.raw`class C {string x="\q";}`, 'class C {int CallerLineNumber;}', '\uFEFFclass C {}']) { assert.throws(() => compact(source)); }
});
void test("bounded v2 original review may exceed the immutable compiler cap; historical v1 stays refused", () => {
  const literal = `class C {public string X="${  "a".repeat(MAXIMUM - 1000)  }";}`;
  const source = `Add-Type @'\n${" ".repeat(2000)}${literal}\n'@\n`;
  const stored = pack(source); assert.ok(Buffer.byteLength(review(stored)) > MAXIMUM); assert.ok(Buffer.byteLength(review(stored)) <= REVIEW_MAXIMUM);
  assert.ok(Buffer.byteLength(compiler(stored)) <= MAXIMUM); assert.equal(expand(stored), source); assert.throws(() => legacyCompiler(stored));
});
void test("complete v2 generation remains idempotent and every released forward/cold output stays byte-exact", async () => {
  assert.equal(process.versions.node, "24.18.0"); const shared = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  const generated = generateWorkerStartupProtocol(shared); assert.equal(generateWorkerStartupProtocol(generated), generated);
  const runtime = compiler(generated);
  const smoke = await readFile(new URL("../../scripts/pcb-diagnostic-launch-smoke.ps1", import.meta.url), "utf8");
  assert.ok(smoke.includes("# BEGIN FIXED CURRENT209 CSHARP REVIEW STORAGE V2"));
  for (const marker of ["public void Admit(string[] paths,long[] sizes,string[] hashes) {", "static readonly string[] DiagnosticCoreProgramTable0="]) {
    assert.equal(runtime.split(marker).length, 2); assert.ok(smoke.includes(marker));
  }
  const stored = pack(shared); const original = expand(stored); assert.ok(Buffer.byteLength(generated) <= MAXIMUM); assert.ok(Buffer.byteLength(compiler(generated)) <= MAXIMUM); assert.ok(Buffer.byteLength(review(generated)) <= REVIEW_MAXIMUM);
  const baseline = await readFile(new URL("../../scripts/native-baseline/shared-owner.ps1.txt", import.meta.url), "utf8");
  const packedBaseline = pack(baseline), restoredBaseline = expand(packedBaseline);
  for (const derive of [currentFootprintForwardNativeOutputs, currentFootprintForwardColdNativeOutputs]) {
    // Released forward inputs retain their exact historical source contract.
    // The new diagnostic-only layout cannot become an inverse/forward input.
    assert.throws(() => derive(shared)); assert.throws(() => derive(stored)); assert.throws(() => derive(original));
    const expected = derive(baseline); assert.deepEqual(derive(packedBaseline), expected); assert.deepEqual(derive(restoredBaseline), expected); assert.equal(expected.length, 3);
    for (const output of expected) { assert.equal(await readFile(new URL(`../../${output.relativePath}`, import.meta.url), "utf8"), output.source); }
  }
});
