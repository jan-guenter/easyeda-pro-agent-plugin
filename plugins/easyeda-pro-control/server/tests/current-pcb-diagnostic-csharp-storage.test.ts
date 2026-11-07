import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { gzipSync } from "node:zlib";
import { generateWorkerStartupProtocol } from "../../scripts/generate-worker-startup-protocol.ts";
import { CURRENT_PCB_DIAGNOSTIC_CSHARP_DECODER as DECODER, expandCurrentPcbDiagnosticCSharpStorage as expand, packCurrentPcbDiagnosticCSharpStorage as pack } from "../src/current-pcb-diagnostic-csharp-storage.ts";
import { CURRENT_PCB_DIAGNOSTIC_HELPER_SOURCE_MAX_BYTES as MAXIMUM } from "../src/current-pcb-diagnostic-helper-source-profile.ts";
import { currentFootprintForwardNativeOutputs } from "../src/current-footprint-forward-native-graph-source.ts";
import { currentFootprintForwardColdNativeOutputs } from "../src/current-footprint-forward-cold-native-graph-source.ts";

const sha = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");
const sample = "# fixed preamble\nAdd-Type @'\nusing System;\npublic class Fixed { public string Value = \"LF\\n\"; }\n'@\n# fixed suffix\n";
const fields = /^\$fixedCurrent209CSharp=Expand-FixedCurrent209CSharp '([A-Za-z\d+/=]+)' (\d+) '([a-f\d]{64})' (\d+) '([a-f\d]{64})'$/mu;
function payload(source: string, raw: Buffer, packed: Buffer): string {
  return source.replace(fields, `$fixedCurrent209CSharp=Expand-FixedCurrent209CSharp '${packed.toString("base64")}' ${String(raw.length)} '${sha(raw)}' ${String(packed.length)} '${sha(packed)}'`);
}

void test("final emission is reversible, bounded and preserves every released forward/cold file", async () => {
  assert.equal(process.versions.node, "24.18.0");
  const shared = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8"); const packed = pack(shared);
  assert.equal(expand(packed), shared); assert.equal(pack(packed), packed); assert.ok(Buffer.byteLength(packed) < MAXIMUM);
  for (const derive of [currentFootprintForwardNativeOutputs, currentFootprintForwardColdNativeOutputs]) {
    const expected = derive(shared); assert.deepEqual(derive(packed), expected); assert.equal(expected.length, 3);
    for (const output of expected) { assert.equal(await readFile(new URL(`../../${output.relativePath}`, import.meta.url), "utf8"), output.source); }
  }
  const generated = generateWorkerStartupProtocol(shared); assert.equal(generateWorkerStartupProtocol(generated), generated);
  assert.ok(Buffer.byteLength(generated) <= MAXIMUM); const restored = expand(generated), start = restored.indexOf("Add-Type @'\n") + 12, stop = restored.indexOf("\n'@\n");
  assert.ok(start >= 12 && stop > start); assert.ok(Buffer.byteLength(restored.slice(start, stop)) <= MAXIMUM);
  assert.ok(Buffer.byteLength(generated) + 15_000 < Buffer.byteLength(restored));
});

void test("hostile storage refuses before returning any compiler input", () => {
  const stored = pack(sample); assert.equal(expand(stored), sample);
  const match = fields.exec(stored); assert.ok(match !== null && match[1] !== undefined);
  const encoded = match[1]; const originalPacked = Buffer.from(encoded, "base64"); const raw = Buffer.from('using System;\npublic class Fixed { public string Value = "LF\\n"; }');
  assert.throws(() => expand(stored.replace("# END FIXED", "# UNKNOWN FIXED")));
  assert.throws(() => expand(`${stored}${stored}`)); assert.throws(() => expand(`${stored}Add-Type @'\nforeign\n'@\n`));
  assert.throws(() => expand(stored.replace("$fixedZip.ReadByte() -ne -1", "$false")));
  assert.throws(() => expand(stored.replace(encoded, `!${encoded.slice(1)}`)));
  assert.throws(() => expand(stored.replace(encoded, `${encoded} `)));
  assert.throws(() => expand(stored.replace(/' [a-f\d]+ '/u, "' 0 '")));
  const rawHash = match[3]; assert.ok(rawHash !== undefined); assert.throws(() => expand(stored.replace(rawHash, "0".repeat(64))));
  assert.throws(() => expand(stored.replace(/' (\d+) '/u, "' 2097153 '")));
  assert.throws(() => pack("#".repeat(MAXIMUM) + sample));
  const altered = Buffer.from(originalPacked); altered[12] = altered[12] === 0 ? 1 : 0;
  assert.throws(() => expand(payload(stored, raw, altered)));
  const trailing = Buffer.concat([originalPacked, Buffer.from([0])]); assert.throws(() => expand(payload(stored, raw, trailing)));
  // oxlint-disable-next-line node/no-sync -- Deliberately malformed bounded fixed-storage fixture, without a compiler or application.
  const extraMember = Buffer.concat([originalPacked, gzipSync(Buffer.alloc(0), { level: 9 })]);
  assert.throws(() => expand(payload(stored, raw, extraMember)));
  for (const invalid of [Buffer.from([0xEF, 0xBB, 0xBF, 65]), Buffer.from([0xFF]), Buffer.alloc(MAXIMUM + 1, 65)]) {
    // oxlint-disable-next-line node/no-sync -- Fixed hostile source fixtures check BOM/UTF-8/size refusal before any compiler input is returned.
    const compressed = gzipSync(invalid, { level: 9 }); assert.throws(() => expand(payload(stored, invalid, compressed)));
  }
  assert.throws(() => pack(sample.replace("using System;", "\uFEFFusing System;")));
  assert.throws(() => pack(sample.replace("using System;", "using π;")));
});

void test("synthetic CompileOnly extraction uses the identical fixed decoder before its original hooks", async () => {
  const smoke = await readFile(new URL("../../scripts/pcb-diagnostic-launch-smoke.ps1", import.meta.url), "utf8");
  assert.ok(smoke.includes(DECODER)); assert.ok(smoke.indexOf(DECODER) < smoke.indexOf("# These test-only methods"));
  assert.ok(DECODER.includes("$fixedZip.ReadByte() -ne -1 -or $fixedInput.Position -ne $fixedPackedLength"));
  assert.ok(DECODER.indexOf("ComputeHash($fixedPacked)") < DECODER.indexOf("GZipStream"));
  assert.ok(DECODER.indexOf("ComputeHash($fixedBytes)") < DECODER.indexOf("GetString($fixedBytes)"));
  assert.ok(DECODER.includes(`$fixedLength -gt ${String(MAXIMUM)}`)); assert.ok(DECODER.includes("UTF8Encoding]::new($false,$true)"));
});
