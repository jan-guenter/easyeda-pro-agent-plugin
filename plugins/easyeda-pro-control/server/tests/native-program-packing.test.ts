import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { packedNativeProgram } from "../../scripts/native-program-packing.ts";
import { readPackedNativeProgram } from "./helpers/native-packed-program.ts";

void test("native program packing preserves exact UTF-8 source and deterministic hashes", () => {
  for (const source of ["async function(){return 'π';}\n", "\\r\\n\"quoted\"\u0000", "a".repeat(65_536)]) {
    const packed = packedNativeProgram("FixtureFunction", source);
    assert.equal(packed, packedNativeProgram("FixtureFunction", source));
    assert.equal(readPackedNativeProgram(packed, "FixtureFunction"), source);
    assert.throws(() => readPackedNativeProgram(packed.replace(/FunctionGzip,([0-9]+),/u, "FunctionGzip,1,"), "FixtureFunction"));
  }
  for (const source of ["", "a".repeat(65_537), "\uD800"]) {
    assert.throws(() => packedNativeProgram("FixtureFunction", source));
  }
  assert.throws(() => packedNativeProgram('Unsafe"Function', "source"));
});

void test("native decoder has bounded fixed inputs and real CompileOnly refusal coverage", async () => {
  const native = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  for (const guard of ["encoded.Length>87384", "length<1 || length>65536", "compressed.Length>65536",
    "Convert.ToBase64String(compressed)!=encoded", "packed-program-compressed-hash", "new byte[length]",
    "stream.Read(bytes,offset,bytes.Length-offset)", "packed-program-truncated", "stream.ReadByte()!=-1",
    "input.Position!=input.Length", "packed-program-hash", "new UTF8Encoding(false,true).GetString(bytes)",
    "[EasyedaDiagnosticOwner]::VerifyPackedProgramSmoke()", "new int[]{0,20,22,65537}"]) {
    assert.ok(native.includes(guard), guard);
  }
  assert.equal(native.includes("$request.functionDeclaration"), false);
  assert.equal(native.includes("$request.programGzip"), false);
});
