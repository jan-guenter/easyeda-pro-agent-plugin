/** Fixed source/data parity only. C# is neither compiled nor executed here. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { gunzipSync } from "node:zlib";
import { SCHEMATIC_CLASSIC_CODEC_PEERS as PEERS } from "./helpers/schematic-classic-codec-peers.ts";
import { expandCurrentSchematicNativePrograms, projectCurrentSchematicCapturedNativePrograms } from "../src/current-schematic-native-program-storage.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_UI_FIXED_CODEC as SHARED } from "../src/current-schematic-relevance-ui-fixed-codec-native.ts";

const digest = (value: string | Uint8Array): string => createHash("sha256").update(value).digest("hex");
const tablePattern = (): RegExp => /EasyedaDiagnosticFixedTable\.Load\(@"([A-Za-z\d+/=]+)",([1-9]\d*),@"([a-f\d]{64})",@"([a-f\d]{64})",([1-9]\d*),([1-9]\d*)\)/gu;
const vectorPattern = (): RegExp => /EasyedaDiagnosticFixedTable\.Hashes\(@"([A-Za-z\d+/=]+)",([1-9]\d*)\)/gu;
function table(match: RegExpMatchArray): readonly (readonly string[])[] {
  const [encoded, length, hash, packedHash, count, columns] = match.slice(1); assert.ok(encoded !== undefined && length !== undefined && hash !== undefined && packedHash !== undefined && count !== undefined && columns !== undefined);
  assert.ok(Number(length) <= 65_536 && Number(count) <= 256 && Number(columns) <= 8);
  const packed = Buffer.from(encoded, "base64"); assert.equal(packed.toString("base64"), encoded); assert.equal(digest(packed), packedHash);
  // oxlint-disable-next-line node/no-sync -- Bounded immutable compiler-table data only, with the original64KiB ceiling.
  const raw = gunzipSync(packed, { maxOutputLength: 65_536 }); assert.equal(raw.length, Number(length)); assert.equal(digest(raw), hash);
  const rows = new TextDecoder("utf-8", { fatal: true }).decode(raw).split("\0").map(row => row.split("\t"));
  assert.equal(rows.length, Number(count)); for (const row of rows) { assert.equal(row.length, Number(columns)); } return rows;
}
void test("all ten classic native books retain their exact pre-refactor tables and golden wire packets", () => {
  let packets = 0;
  for (const peer of PEERS) {
    const source = peer.source(); const loads = [...source.matchAll(tablePattern())], vectors = [...source.matchAll(vectorPattern())];
    assert.equal(vectors.length, 1); assert.equal(loads.length, peer.name === "RunGuard" ? 1 : 2);
    assert.equal(digest([...loads, ...vectors].map(match => match[0]).join("\0")), peer.dataSha256);
    const rows = table(loads[0] ?? assert.fail("missing rows")); const programs = loads[1] === undefined ? [] : table(loads[1]);
    const vector = vectors[0]; const bytes = Buffer.from(vector?.[1] ?? assert.fail("missing vector"), "base64");
    assert.equal(bytes.length, rows.length * 32); assert.equal(rows.length, Number(vector?.[2]));
    const marker = /EasyedaSchematicUiFixedCodec\.Encode\(id,session,phase,method,fields,Rows,(?:Programs|new string\[0\]\[\]),"([a-z_]+)",Need\)/u.exec(source)?.[1];
    assert.equal(marker, peer.marker);
    for (const [index, row] of rows.entries()) {
      const names = (row[2] ?? assert.fail("missing names")).split(",").filter(Boolean), values = new Map(names.map(name => [name, '"original_ref"']));
      for (const program of programs) { values.set(`program${program[0] ?? assert.fail("missing program index")}`, program[1] ?? assert.fail("missing program")); }
      const template = row[3] ?? assert.fail("missing template");
      const text = template.replaceAll(new RegExp(`"__schematic_${peer.marker}_([A-Za-z0-9]+)__"`, "gu"), (_match: string, name: string): string => values.get(name) ?? assert.fail("unbound marker"));
      const wire = `{"id":${String(peer.goldenId)},${text.slice(1, -1)},"sessionId":"original_ui"}\0`;
      assert.equal(digest(wire), bytes.subarray(index * 32, (index + 1) * 32).toString("hex")); packets += 1;
    }
  }
  assert.ok(packets > 250);
});
void test("factoring preserves the existing shared guard implementation and removes at least18KB", () => {
  assert.equal(digest(SHARED), "df54e061bfbbf2ef7fa7a4ca6a3fdb17ea0946a86f5c554368b81221d5bcf988");
  const saving = PEERS.reduce((sum, peer) => sum + peer.originalBytes - Buffer.byteLength(peer.source()), 0); assert.ok(saving >= 18_000);
  const prefix = PEERS.find(peer => peer.name === "RunPrefix"); assert.ok(prefix !== undefined); assert.ok(prefix.source().includes('"prefix-resume-run","Debugger.resume"'));
  const guard = PEERS.find(peer => peer.name === "RunGuard"); assert.ok(guard !== undefined); const source = guard.source(); const owner = source.slice(source.indexOf("public sealed partial class EasyedaDiagnosticOwner"));
  assert.equal(digest(owner), "7d1311f9c5ed549709f6b611424827d9333a7577f222c607cf6050fc978260bf"); assert.ok(source.includes('Encode(89,"original_ui"'));
});

void test("current V5 storage restores the factored books and repeats without changing any table", () => {
  const source = `internal static class EasyedaDiagnosticFixedTable {}\n${PEERS.map(peer => peer.source()).join("\n")}`;
  const stored = projectCurrentSchematicCapturedNativePrograms(source); assert.ok(stored.includes("BEGIN FIXED SCHEMATIC PROGRAM DATA V5"));
  assert.equal(expandCurrentSchematicNativePrograms(stored), source); assert.equal(projectCurrentSchematicCapturedNativePrograms(stored), stored);
});
