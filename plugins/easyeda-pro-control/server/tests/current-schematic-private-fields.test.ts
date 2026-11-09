/** Complete emitted-source FIELD proof only. No C# compiler, owner, Inspector,
 * SQL, Windows helper or application is started by this test. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { generateWorkerStartupProtocol } from "../../scripts/generate-worker-startup-protocol.ts";
import { currentPcbDiagnosticCSharpReviewSource, currentPcbDiagnosticCSharpRuntimeCompilerInput } from "../src/current-pcb-diagnostic-csharp-review-storage.ts";
import { currentPcbDiagnosticCSharpLexicalTokens as tokenize } from "../src/current-pcb-diagnostic-csharp-spacing.ts";
import { expandCurrentSchematicNativeHashVectors } from "../src/current-schematic-native-hash-vector-storage.ts";
import { expandCurrentSchematicNativeTypeAliasesV2 } from "../src/current-schematic-native-type-aliases-v2.ts";
import { CURRENT_SCHEMATIC_PRIVATE_FIELDS as FIELDS, compactCurrentSchematicPrivateFields as compact } from "../src/current-schematic-private-fields.ts";

/** Reconstruct verbose field spellings in this test only. Production has no
 * field expander, storage metadata or enlarged review/decoder ceiling. */
function original(source: string): string {
  const names = new Map<string, string>(FIELDS.map(row => [row.emitted, row.field])); let prior = 0; const parts: string[] = [];
  for (const token of tokenize(source)) { if (token.kind === "identifier") { const old = names.get(token.text); if (old !== undefined) { parts.push(source.slice(prior, token.start), old); prior = token.end; } } }
  parts.push(source.slice(prior)); return parts.join("");
}
const hash = (source: string): string => createHash("sha256").update(source).digest("hex");

void test("complete schematic emission changes only the fixed private FIELD tokens and retains the full original payload", async context => {
  const seed = await readFile(new URL("../../scripts/native-baseline/shared-owner.ps1.txt", import.meta.url), "utf8");
  const generated = generateWorkerStartupProtocol(seed, "schematic");
  const compiler = currentPcbDiagnosticCSharpRuntimeCompilerInput(generated);
  const emitted = expandCurrentSchematicNativeHashVectors(expandCurrentSchematicNativeTypeAliasesV2(currentPcbDiagnosticCSharpReviewSource(generated)));
  const restored = original(emitted);
  context.diagnostic(JSON.stringify({ compilerBytes: Buffer.byteLength(compiler), compilerSha256: hash(compiler), prehashBytes: Buffer.byteLength(emitted), prehashSha256: hash(emitted), sourceSaving: Buffer.byteLength(restored) - Buffer.byteLength(emitted) }));
  // The full payload also pins the independently reviewed shared SQL codec.
  assert.equal(Buffer.byteLength(restored), 2_233_094); assert.equal(hash(restored), "1a471107f748f30e30a1ff3e77db9add90338a89e5b877dac5676be5435fdd1d");
  assert.equal(Buffer.byteLength(restored) - Buffer.byteLength(emitted), 35_384);
  assert.ok(Buffer.byteLength(emitted) <= 2_228_224 - 30_000); assert.ok(Buffer.byteLength(compiler) <= 2_097_152 - 30_000);
  assert.equal(compact(restored), emitted); assert.equal(FIELDS.length, 155); assert.equal(FIELDS.reduce((sum, row) => sum + row.uses, 0), 1717);
  assert.equal(hash(JSON.stringify(FIELDS)), "6c8da5d28f20db7cadbc8309c8ca6bf5951675f891eaffee765df6d115fae338");
  const after = tokenize(emitted), before = tokenize(restored); const names = new Map<string, string>(FIELDS.map(row => [row.field, row.emitted])); assert.equal(before.length, after.length);
  for (const [index, token] of before.entries()) { const changed = after[index]; assert.ok(changed !== undefined); assert.equal(changed.kind, token.kind); assert.equal(changed.text, token.kind === "identifier" ? names.get(token.text) ?? token.text : token.text); }
  assert.equal(generateWorkerStartupProtocol(generated, "schematic"), generated);
  const first = FIELDS[0]; assert.ok(first !== undefined); const token = before.find(item => item.kind === "identifier" && item.text === first.field); assert.ok(token !== undefined);
  const escaped = `${restored.slice(0, token.start)}@${restored.slice(token.start)}`;
  for (const changed of [escaped, `${restored}\nclass Foreign{int @sgx0;}\n`, restored.replaceAll("class EasyedaDiagnosticOwner", "class ForeignOwner"),
    `${restored}\npublic sealed partial class EasyedaDiagnosticOwner{public bool ${first.field};}\n`, `${restored}\npublic sealed partial class EasyedaDiagnosticOwner{void Extra(){bool ${first.field}=false;}}\n`,
    `${restored}\npublic sealed partial class EasyedaDiagnosticOwner{void Extra(){var value=new{${first.field}=true};}}\n`, `${restored}\nclass Foreign{void Extra(){GetField();}}\n`,
    restored.replace("zone.ToSerializedString()", "this.ToSerializedString()"), `${restored}\nclass Foreign{void ControlSchematicRelevanceUploadSerialize(){}}\n`]) {
    assert.notEqual(changed, restored); assert.throws(() => compact(changed), /SCHEMATIC_PRIVATE_FIELD/u);
  }
  const suffix = `\n// GetFields @sgx0 ${first.field}\nclass LiteralOwner{const string Value="sgx0 GetField ${first.field}";}\n`;
  assert.ok(compact(restored + suffix).endsWith(suffix));
});
