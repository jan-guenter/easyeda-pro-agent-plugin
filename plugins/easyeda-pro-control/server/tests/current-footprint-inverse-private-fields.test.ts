/** Full emitted inverse source with fixed FIELD-only spelling changes. This
 * allocates no Inspector, owner, compiler or application and issues no grant. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { generateFootprintInverseNativeSource } from "../../scripts/footprint-inverse-native-source.ts";
import { generateWorkerStartupProtocol } from "../../scripts/generate-worker-startup-protocol.ts";
import { currentPcbDiagnosticCSharpLexicalTokens as tokenize } from "../src/current-pcb-diagnostic-csharp-spacing.ts";
import { expandCurrentFootprintInverseNativeHashVectors } from "../src/current-footprint-inverse-native-hash-vector-storage.ts";
import { CURRENT_FOOTPRINT_INVERSE_PRIVATE_FIELDS as FIELDS, compactCurrentFootprintInversePrivateFields as compact } from "../src/current-footprint-inverse-private-fields.ts";

/** Reconstruct verbose spellings in this test alone. Production has no field
 * expander, stored spelling profile or way to hide an oversized review body. */
function original(source: string): string { const names = new Map<string, string>(FIELDS.map(row => [row.emitted, row.field])); let prior = 0; const parts: string[] = []; for (const token of tokenize(source)) { if (token.kind === "identifier") { const old = names.get(token.text); if (old !== undefined) { parts.push(source.slice(prior, token.start), old); prior = token.end; } } } parts.push(source.slice(prior)); return parts.join(""); }
void test("actual complete inverse C# has one compact private declaration and exact census, with literal/comment/token parity", async () => {
  const seed = await readFile(new URL("../../scripts/native-baseline/shared-owner.ps1.txt", import.meta.url), "utf8"); const built = generateFootprintInverseNativeSource(seed), emitted = expandCurrentFootprintInverseNativeHashVectors(built.review), restored = original(emitted);
  assert.equal(Buffer.byteLength(restored) - Buffer.byteLength(emitted), 26_679); assert.ok(Buffer.byteLength(emitted) <= 2_228_224); assert.ok(Buffer.byteLength(built.compiler) <= 2_097_152); assert.equal(compact(restored), emitted);
  assert.equal(FIELDS.length, 157); assert.equal(FIELDS.reduce((sum, row) => sum + row.uses, 0), 1353); assert.equal(createHash("sha256").update(JSON.stringify(FIELDS)).digest("hex"), "07803d8d506b06795fff9b32b565e17fb9edb4cdd7c14d2f4cd34b162502a034");
  const legacyFields = FIELDS.slice(0, 133); assert.equal(createHash("sha256").update(JSON.stringify(legacyFields)).digest("hex"), "d7d44d0befb77a1b241250424896a8da34211573155246f7132b3de6aeb060a8");
  const before = tokenize(restored); const after = tokenize(emitted); const names = new Map<string, string>(FIELDS.map(row => [row.field, row.emitted])); assert.equal(before.length, after.length); for (const [index, token] of before.entries()) { const changed = after[index]; assert.ok(changed !== undefined); assert.equal(changed.kind, token.kind); assert.equal(changed.text, token.kind === "identifier" ? names.get(token.text) ?? token.text : token.text); }
  const once = generateWorkerStartupProtocol(seed, "inverse"); assert.equal(generateWorkerStartupProtocol(once, "inverse"), once);
  const first = FIELDS[0]; assert.ok(first !== undefined); const firstToken = tokenize(restored).find(token => token.kind === "identifier" && token.text === first.field); assert.ok(firstToken !== undefined); const escaped = `${restored.slice(0, firstToken.start)}@${restored.slice(firstToken.start)}`; for (const changed of [escaped, `${restored}\nclass Foreign{int @igx0;}\n`, restored.replaceAll("class EasyedaDiagnosticOwner", "class ForeignOwner"), `${restored}\npublic sealed partial class EasyedaDiagnosticOwner{public bool ${first.field};}\n`, `${restored}\nclass Foreign{void F(){GetField();}}\n`, restored.replace("zone.ToSerializedString()", "this.ToSerializedString()"), `${restored}\npublic sealed partial class EasyedaDiagnosticOwner{void Extra(){bool inverseGetForeign=false;}}\n`]) { assert.notEqual(changed, restored); assert.throws(() => compact(changed), /INVERSE_PRIVATE_FIELD/u); }
  const withLiteral = `${restored}\n// GetFields @igx0 ${first.field}\nclass LiteralOwner{const string Value="igx0 GetField ${first.field}";}\n`; const kept = compact(withLiteral); assert.equal(kept.endsWith(`// GetFields @igx0 ${first.field}\nclass LiteralOwner{const string Value="igx0 GetField ${first.field}";}\n`), true);
});
