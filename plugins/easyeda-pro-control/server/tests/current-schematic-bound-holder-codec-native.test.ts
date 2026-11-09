/** Source and wire parity only; this test starts no C# or native actor. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { gunzipSync } from "node:zlib";
import { currentSchematicDisplayAccessorTemplates } from "../src/current-schematic-display-accessor-wire.ts";
import { currentSchematicDisplayActionTemplates } from "../src/current-schematic-display-action-wire.ts";
import { currentSchematicRelevanceDisplayModifyEntryNativeCases, currentSchematicRelevanceDisplayModifyEntryTemplate } from "../src/current-schematic-relevance-display-modify-entry-protocol.ts";
import { factorCurrentSchematicBoundHolderCodecs as factor } from "../src/current-schematic-bound-holder-codec-native.ts";
import { currentSchematicDisplayAccessorNativeSource as accessor } from "../src/current-schematic-display-accessor-native.ts";
import { currentSchematicDisplayActionNativeSource as action } from "../src/current-schematic-display-action-native.ts";
import { currentSchematicRelevanceDisplayModifyEntryNativeSource as entry } from "../src/current-schematic-relevance-display-modify-entry-native.ts";

const peers = [{ source: accessor, marker: "accessor", idle: false }, { source: action, marker: "action", idle: false }, { source: entry, marker: "entry", idle: true }] as const;
const original = peers.map(peer => peer.source()).join("\n");
function implementation(source: string): string { return source.slice(source.indexOf("static string Json("), source.indexOf("public static void VerifySmoke()")); }

void test("shared bound encoder expands to every exact original guard, JSON and encoding statement", () => {
  const compact = factor(original), entryClass = compact.slice(compact.indexOf("public static class EasyedaSchematicRelevanceDisplayModifyEntryProtocol"));
  const body = entryClass.slice(entryClass.indexOf("static string Json("), entryClass.indexOf("public static string Encode("));
  for (const peer of peers) {
    const signature = peer.idle ? "string holder,string idle" : "string holder";
    let expanded = body.replaceAll(",System.Action<bool> Need)", ")").replaceAll(",Need)", ")");
    expanded = expanded.replace("internal static string EncodeBound(int id,string session,string holder,string idle,string target,string operation,string phase,string method,System.Collections.IDictionary fields,string[][] Cases,string marker,bool hasIdle)", `public static string Encode(int id,string session,${signature},string target,string operation,string phase,string method,System.Collections.IDictionary fields)`);
    expanded = expanded.replace('if(hasIdle)Field("handle",idle);', peer.idle ? 'Field("handle",idle);' : "");
    expanded = expanded.replace('"__schematic_"+marker+"_', `"__schematic_${peer.marker}_`);
    expanded = expanded.replace('if(hasIdle&&name=="boundIdle")value=idle;else if(name=="boundHolder")', peer.idle ? 'if(name=="boundIdle")value=idle;else if(name=="boundHolder")' : 'if(name=="boundHolder")');
    assert.equal(expanded, implementation(peer.source()));
  }
  assert.ok(Buffer.byteLength(original) - Buffer.byteLength(compact) === 3896);
});

const tables = (source: string): readonly string[] => [...source.matchAll(/EasyedaDiagnosticFixedTable\.(?:Load|Hashes)\([^;]*?\)/gu)].map(match => match[0]);

void test("factoring preserves complete tables, golden vectors, public signatures and smoke bodies", () => {
  const compact = factor(original);
  assert.deepEqual(tables(compact), tables(original));
  for (const peer of peers) {
    const source = peer.source(); const from = source.indexOf("static string Json("), to = source.indexOf("public static void VerifySmoke()");
    assert.ok(compact.includes(source.slice(0, from))); assert.ok(compact.includes(source.slice(to)));
    const signature = peer.idle ? "string holder,string idle" : "string holder";
    assert.ok(compact.includes(`public static string Encode(int id,string session,${signature},string target,string operation,string phase,string method,System.Collections.IDictionary fields)`));
  }
  assert.equal(factor(compact), compact);
});

void test("missing, mixed, duplicate and substituted encoder families refuse before packing", () => {
  const accessorSource = accessor(), compact = factor(original);
  assert.throws(() => factor(original.replace(accessorSource, "")), /SCHEMATIC_BOUND_HOLDER_CODEC/u);
  assert.throws(() => factor(original + accessorSource), /SCHEMATIC_BOUND_HOLDER_CODEC/u);
  assert.throws(() => factor(original.replace('target.Length<=16384', 'target.Length<=16385')), /SCHEMATIC_BOUND_HOLDER_CODEC/u);
  const prefix = compact.slice(0, compact.indexOf("public static class EasyedaSchematicDisplayActionProtocol"));
  assert.throws(() => factor(original.replace(accessorSource, prefix.trimEnd())), /SCHEMATIC_BOUND_HOLDER_CODEC/u);
  assert.throws(() => factor(compact.replace('marker,bool hasIdle', 'marker,bool changedIdle')), /SCHEMATIC_BOUND_HOLDER_CODEC/u);
});

/** Read the emitted immutable tables under their existing decoded bound. */
function tableRows(source: string): readonly (readonly string[])[] {
  const result: string[][] = [];
  for (const match of source.matchAll(/EasyedaDiagnosticFixedTable\.Load\(@"([A-Za-z\d+/=]+)",([1-9]\d*),@"[a-f\d]{64}",@"[a-f\d]{64}",([1-9]\d*),4\)/gu)) {
    const encoded = match[1], length = Number(match[2]); assert.ok(encoded !== undefined && length <= 65_536);
    // oxlint-disable-next-line node/no-sync -- Fixed emitted table data under the existing64KiB ceiling, no process or native code.
    const raw = gunzipSync(Buffer.from(encoded, "base64"), { maxOutputLength: 65_536 }); assert.equal(raw.length, length);
    const rows = raw.toString("utf8").split("\0").map(row => row.split("\t")); assert.equal(rows.length, Number(match[3])); result.push(...rows);
  }
  return result;
}

void test("complete original requests retain quoted, Unicode and marker-looking bound data", () => {
  const templates = [currentSchematicDisplayAccessorTemplates(), currentSchematicDisplayActionTemplates(), currentSchematicRelevanceDisplayModifyEntryNativeCases().map(command => currentSchematicRelevanceDisplayModifyEntryTemplate(command))];
  const compact = factor(original), target = JSON.stringify({ path: String.raw`C:\Synthetic\雪`, value: 'quoted"\n\t\u0001', holder: "__schematic_entry_boundHolder__" });
  const operation = JSON.stringify({ fontFamily: '雪"\\\n', literal: "__schematic_action_objectId__" }); let packets = 0;
  for (const [index, peer] of peers.entries()) {
    const allRows = templates[index]; assert.ok(allRows !== undefined);
    const oldClass = peer.source(); const className = oldClass.slice(0, oldClass.indexOf("{"));
    const start = compact.indexOf(className); const next = compact.indexOf("public static class ", start + className.length);
    const nativeRows = tableRows(compact.slice(start, next === -1 ? undefined : next)); assert.equal(nativeRows.length, allRows.length);
    for (const [position, row] of allRows.entries()) {
      const native = nativeRows[position]; assert.ok(native !== undefined); assert.equal(native[0], row.phase); assert.equal(native[1], row.method); assert.equal(native[3], row.template);
      const fields = Object.fromEntries(Object.entries(row.fields).map(([name, kind]) => [name, kind === "field" ? "rotation" : "original_ref"]));
      const bound: Readonly<Record<string, string>> = { boundHolder: "original_holder", boundIdle: "original_idle", boundTarget: target, boundOperation: operation };
      const render = (template: string): string => template.replaceAll(new RegExp(`"__schematic_${peer.marker}_([A-Za-z0-9]+)__"`, "gu"), (_match: string, name: string): string => { const value = bound[name] ?? fields[name]; assert.ok(value !== undefined); return JSON.stringify(value); });
      const nativeBody = native[3]; assert.ok(nativeBody !== undefined);
      const actual = `{"id":73,${render(nativeBody).slice(1, -1)},"sessionId":"original_ui"}\0`;
      const parsed: unknown = JSON.parse(render(row.template)); assert.ok(typeof parsed === "object" && parsed !== null);
      const expected = `${JSON.stringify({ id: 73, ...parsed, sessionId: "original_ui" })}\0`;
      assert.equal(actual, expected); JSON.parse(actual.slice(0, -1)); packets += 1;
    }
  }
  assert.ok(packets > 30);
});
