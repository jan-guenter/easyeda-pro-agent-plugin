/** Reconstruct every fixed passive message from the actual combined native
 * tables, without starting a C# runtime, owner or application. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { gunzipSync } from "node:zlib";
import { currentSchematicRelevanceModifyEchoGroupNativeSource as native, currentSchematicRelevanceModifyEchoGroupPrograms as programs, currentSchematicRelevanceModifyEchoGroupRows as rows } from "../src/current-schematic-relevance-modify-echo-native-group.ts";
import { currentSchematicRelevanceModifyEchoTemplate as preparation, currentSchematicRelevanceModifyEchoWire as preparationWire } from "../src/current-schematic-relevance-modify-echo-wire.ts";
import { currentSchematicRelevanceModifyEchoEventTemplate as event, currentSchematicRelevanceModifyEchoEventWire as eventWire } from "../src/current-schematic-relevance-modify-echo-event-wire.ts";
import { currentSchematicRelevanceModifyEchoCompletionTemplate as completion, currentSchematicRelevanceModifyEchoCompletionWire as completionWire } from "../src/current-schematic-relevance-modify-echo-completion-wire.ts";
import { currentSchematicRelevanceNormalCommandBodyPrograms as shared } from "../src/current-schematic-relevance-normal-command-ui-native.ts";

function hash(value: Uint8Array): string { return createHash("sha256").update(value).digest("hex"); }
function tables(code: string): ReadonlyMap<string, readonly (readonly string[])[]> {
  const found = new Map<string, readonly (readonly string[])[]>();
  for (const match of code.matchAll(/string\[\]\[\] ([A-Za-z\d]+)=EasyedaDiagnosticFixedTable\.Load\(@"([^"]*)",(\d+),@"([a-f\d]{64})",@"([a-f\d]{64})",(\d+),(\d+)\);/gu)) {
    const [, name, encoded, bytes, rawHash, packedHash, count, columns] = match;
    assert.ok(name !== undefined && encoded !== undefined); const packed = Buffer.from(encoded, "base64"); assert.equal(hash(packed), packedHash);
    // oxlint-disable-next-line node/no-sync -- Only bounded immutable compile-time gzip data is decoded.
    const raw = gunzipSync(packed); assert.equal(raw.length, Number(bytes)); assert.ok(raw.length <= 65_536); assert.equal(hash(raw), rawHash);
    const decoded = raw.toString().split("\0").map(row => row.split("\t")); assert.equal(decoded.length, Number(count)); assert.ok(decoded.every(row => row.length === Number(columns))); assert.equal(found.has(name), false); found.set(name, decoded);
  }
  return found;
}
void test("all three passive Echo books retain their exact native messages and shared program identity", () => {
  const code = native(); assert.equal(native(), code); const decoded = tables(code); const storedRows = decoded.get("Rows"); assert.ok(storedRows !== undefined); const expected = rows(); assert.equal(storedRows.length, expected.length);
  const restoredPrograms = [...shared()];
  for (const [name, group] of decoded) { if (name.startsWith("OwnPrograms")) { for (const row of group) { const key = Number(row[0]); const value: unknown = JSON.parse(row[1] ?? ""); assert.equal(key, restoredPrograms.length); assert.equal(typeof value, "string"); if (typeof value !== "string") { throw new TypeError("program-string"); } restoredPrograms.push(value); } } }
  assert.deepEqual(restoredPrograms, programs()); assert.ok(code.includes("JoinPrograms(EasyedaSchematicRelevanceNormalCommandBodyProtocol.Programs,OwnPrograms)"));
  for (const [index, row] of expected.entries()) {
    const original = row.command; let selected: ReturnType<typeof completion>; if (row.book === "preparation") { selected = preparation(original); } else if (row.book === "event") { selected = event(original); } else { selected = completion(original); } const stored: readonly string[] | undefined = storedRows[index]; assert.ok(stored !== undefined); assert.deepEqual(stored.slice(0, 3), [row.phase, row.method, row.names.join(",")]); assert.equal(stored[3], row.template);
    const fields = Object.fromEntries(row.names.map((name, fieldIndex) => [name, `held_${String(fieldIndex)}`]));
    const restored = row.template.replaceAll(/"__schematic_modifyechogroup_([A-Za-z\d]+)__"/gu, (_match, name: string) => {
      if (name.startsWith("program")) { const program = restoredPrograms[Number(name.slice(7))]; assert.ok(program !== undefined); return JSON.stringify(program); }
      assert.ok(row.names.includes(name)); return JSON.stringify(fields[name]);
    });
    const originalRestored = selected.template.replaceAll(/"__schematic_(?:modifyecho|modifyechoevent|modifyechocompletion)_([A-Za-z\d]+)__"/gu, (_match, name: string) => name.startsWith("program") ? JSON.stringify(original.method === "Runtime.callFunctionOn" ? original.params.functionDeclaration : null) : JSON.stringify(fields[name]));
    assert.equal(restored, originalRestored); let wire: Readonly<{ request: Readonly<Record<string,string|number>> }>; if (row.book === "preparation") { wire = preparationWire(original, 83); } else if (row.book === "event") { wire = eventWire(original, 83); } else { wire = completionWire(original, 83); } assert.equal(wire.request["phase"], row.phase);
  }
  assert.equal(new Set(expected.map(row => row.book)).size, 3); assert.throws(() => preparationWire(expected[0]?.command, 0)); assert.throws(() => eventWire({ phase: "modify-echo-event-call", method: "Runtime.callFunctionOn", params: {} }, 83));
});
