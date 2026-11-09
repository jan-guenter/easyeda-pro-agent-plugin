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
import { CURRENT_SCHEMATIC_PRIVATE_FIELDS as FIELDS, CURRENT_SCHEMATIC_WIRE_LEXICAL_PRIVATE_FIELDS as LEXICAL_FIELDS, CURRENT_SCHEMATIC_WIRE_ACCESSOR_PRIVATE_FIELDS as WIRE_FIELDS, compactCurrentSchematicPrivateFields as compact } from "../src/current-schematic-private-fields.ts";

/** Reconstruct verbose field spellings in this test only. Production has no
 * field expander, storage metadata or enlarged review/decoder ceiling. */
function original(source: string): string {
  const names = new Map<string, string>([...FIELDS, ...WIRE_FIELDS, ...LEXICAL_FIELDS].map(row => [row.emitted, row.field])); let prior = 0; const parts: string[] = [];
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
  // The full payload pins the composed registration/SQL source and both separate Wire regions.
  assert.equal(Buffer.byteLength(restored), 2_252_534); assert.equal(hash(restored), "f2f6c3337781aaa21ec604243ea6464b0272c1535dc7ae64bc58c1b8318ba346");
  assert.equal(Buffer.byteLength(restored) - Buffer.byteLength(emitted), 36_144);
  assert.equal(2_228_224 - Buffer.byteLength(emitted), 11_834); assert.equal(2_097_152 - Buffer.byteLength(compiler), 26_178);
  assert.equal(compact(restored), emitted); assert.equal(FIELDS.length, 155); assert.equal(FIELDS.reduce((sum, row) => sum + row.uses, 0), 1718);
  assert.equal(WIRE_FIELDS.length, 2); assert.equal(WIRE_FIELDS.reduce((sum, row) => sum + row.uses, 0), 6);
  assert.equal(LEXICAL_FIELDS.length, 2); assert.equal(LEXICAL_FIELDS.reduce((sum, row) => sum + row.uses, 0), 10);
  assert.equal(FIELDS.reduce((sum, row) => sum + (row.field.length - row.emitted.length) * row.uses, 0), 35_414);
  assert.equal(Buffer.byteLength(restored) - Buffer.byteLength(emitted) - 35_414, 261 + 469);
  assert.equal(hash(JSON.stringify(FIELDS)), "5a06e467ef7cf91f7197021c6df811a4e1b723a275c1721a42785d39bd6ae45d");
  const after = tokenize(emitted), before = tokenize(restored); const names = new Map<string, string>([...FIELDS, ...WIRE_FIELDS, ...LEXICAL_FIELDS].map(row => [row.field, row.emitted])); assert.equal(before.length, after.length);
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
  const begin = "// BEGIN GENERATED SCHEMATIC WIRE ACCESSOR FIELDS", end = "// END GENERATED SCHEMATIC WIRE ACCESSOR FIELDS";
  const from = restored.indexOf(begin), to = restored.indexOf(end); assert.ok(from !== -1 && to > from); const region = restored.slice(from, to + end.length);
  const outer = "// BEGIN GENERATED SCHEMATIC WIRE EDIT BIRTH209", outerEnd = "// END GENERATED SCHEMATIC WIRE EDIT BIRTH209";
  const outerFrom = restored.indexOf(outer), outerTo = restored.indexOf(outerEnd); assert.ok(outerFrom !== -1 && outerTo > outerFrom); const wholeWire = restored.slice(outerFrom, outerTo + outerEnd.length);
  const partialFrom = restored.indexOf("public sealed partial class EasyedaDiagnosticOwner {\nbool schematicWireEdit209;\n"); assert.ok(partialFrom > outerFrom && partialFrom < from);
  const nestedPartial = `${restored.slice(0, partialFrom)}class ForeignScope {\n${restored.slice(partialFrom, outerTo)}}\n${restored.slice(outerTo)}`;
  for (const changed of [restored.replace(region, "") + region,
    restored.replace("public sealed partial class EasyedaDiagnosticOwner {\nbool schematicWireEdit209;", "public sealed partial class ForeignWireOwner {\nbool schematicWireEdit209;"),
    restored.replace(region, region.replace("schematicDisplayAbort", "false")),
    restored.replace(region, region.replace("int schematicWireAccessorNormal", "int arbitraryCounter;int schematicWireAccessorNormal")),
    `${restored}\npublic sealed partial class EasyedaDiagnosticOwner{void ExtraWire(){schematicWireAccessorNormal++;}}\n`,
    `${restored}\nclass Foreign{int schematicWireAccessorCleanup;}\n`,
    `${restored}\nclass Foreign{${region}}\n`, nestedPartial, restored.replace(wholeWire, `namespace ForeignWireScope{${wholeWire}}`),
    restored.replace("// BEGIN GENERATED SCHEMATIC WIRE EDIT BIRTH209", "// BEGIN GENERATED SCHEMATIC WIRE EDIT BIRTH210")]) {
    assert.notEqual(changed, restored); assert.throws(() => compact(changed), /SCHEMATIC_PRIVATE_FIELD/u);
  }
  const lexicalBegin = "// BEGIN GENERATED SCHEMATIC WIRE LEXICAL FIELDS"; const lexicalEnd = "// END GENERATED SCHEMATIC WIRE LEXICAL FIELDS";
  const lexicalFrom = restored.indexOf(lexicalBegin); const lexicalTo = restored.indexOf(lexicalEnd); assert.ok(lexicalFrom > to && lexicalTo > lexicalFrom);
  const lexicalRegion = restored.slice(lexicalFrom, lexicalTo + lexicalEnd.length); const lexicalOwner = restored.lastIndexOf("public sealed partial class EasyedaDiagnosticOwner {\n", lexicalFrom); assert.ok(lexicalOwner > from);
  const nestedLexical = `${restored.slice(0, lexicalOwner)}class ForeignLexicalScope{\n${restored.slice(lexicalOwner, outerTo)}}\n${restored.slice(outerTo)}`;
  const namespaceLexical = `${restored.slice(0, lexicalOwner)}namespace ForeignLexicalScope{\n${restored.slice(lexicalOwner, outerTo)}}\n${restored.slice(outerTo)}`;
  for (const changed of [nestedLexical, namespaceLexical, restored.replace(lexicalRegion, "") + lexicalRegion,
    restored.replace(lexicalRegion, lexicalRegion.replace("schematicDisplayAbort", "false")),
    restored.replace(lexicalRegion, lexicalRegion.replace("int schematicWireLexicalNormal", "int unknownCounter;int schematicWireLexicalNormal")),
    `${restored}\npublic sealed partial class EasyedaDiagnosticOwner{void ExtraLexical(){schematicWireLexicalNormal++;}}\n`]) {
    assert.notEqual(changed, restored); assert.throws(() => compact(changed), /SCHEMATIC_PRIVATE_FIELD/u);
  }
});
