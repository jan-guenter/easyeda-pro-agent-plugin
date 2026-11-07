/* oxlint-disable import/max-dependencies -- Compare independently fixed Via, SCH and replay commands with their shared native storage. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { gunzipSync } from "node:zlib";
import { currentProjectCanvasPendingNativeSource, currentProjectCanvasPendingNativeTemplate, expandCurrentProjectCanvasPendingNativeTemplate } from "../src/current-project-canvas-pending-native.ts";
import { CURRENT_PROJECT_CANVAS_PENDING_CAPTURE } from "../src/current-project-canvas-pending-programs.ts";
import { currentPcbViaWorkerNativeSource } from "../src/current-pcb-via-worker-native.ts";
import { currentPcbViaWorkerNativeCases } from "../src/current-pcb-via-worker-wire.ts";
import { currentSchematicDisplayWorkerNativeSource } from "../src/current-schematic-display-worker-native.ts";
import { currentSchematicDisplayWorkerNativeCases } from "../src/current-schematic-display-worker-wire.ts";
import { currentPcbViaPostHistorySyncTemplates } from "../src/current-pcb-via-post-history-sync-wire.ts";

function tables(source: string, columns: number): readonly (readonly string[])[] {
  const result: string[][] = [];
  for (const row of source.matchAll(/EasyedaDiagnosticFixedTable\.Load\(@"([A-Za-z\d+/=]+)",(\d+),@"([a-f\d]{64})",@"([a-f\d]{64})",(\d+),(\d+)\)/gu)) {
    const [, encoded, size, plainSha, packedSha, rows, width] = row;
    assert.ok(encoded !== undefined && size !== undefined && rows !== undefined && width !== undefined);
    if (Number(width) === columns) {
      assert.ok(Number(size) > 0 && Number(size) <= 65_536); const packed = Buffer.from(encoded, "base64");
      assert.equal(packed.toString("base64"), encoded); assert.equal(createHash("sha256").update(packed).digest("hex"), packedSha);
      // oxlint-disable-next-line node/no-sync -- Independently restore immutable bounded in-memory storage; no application or native execution.
      const bytes = gunzipSync(packed, { maxOutputLength: 65_536 });
      assert.equal(bytes.length, Number(size)); assert.equal(createHash("sha256").update(bytes).digest("hex"), plainSha);
      const restored = new TextDecoder("utf-8", { fatal: true }).decode(bytes).split("\0"); assert.equal(restored.length, Number(rows));
      for (const text of restored) { const fields = text.split("\t"); assert.equal(fields.length, columns); result.push(fields); }
    }
  }
  return result;
}

void test("shared pending storage restores every original Via/SCH/replay declaration byte for byte", () => {
  const parts = tables(currentProjectCanvasPendingNativeSource(), 1); assert.equal(parts.length, 3);
  const values = parts.map(row => { const part = row[0]; assert.ok(part !== undefined); return part; });
  const restore = (input: string): string => input.replaceAll("__current209_via_retained_part__", values[1] ?? "").replaceAll("__current209_schematic_retained_part__", values[2] ?? "").replaceAll("__current209_pending_capture_part__", values[0] ?? "");
  let affected = 0;
  for (const [source, commands] of [[currentPcbViaWorkerNativeSource(), currentPcbViaWorkerNativeCases()], [currentSchematicDisplayWorkerNativeSource(), currentSchematicDisplayWorkerNativeCases()]] as const) {
    const rows = tables(source, 4); assert.equal(rows.length, commands.length);
    for (const [index, command] of commands.entries()) {
      const template = rows[index]?.[3]; assert.ok(template !== undefined); const declaration: unknown = Reflect.get(command.params, "functionDeclaration");
      if (typeof declaration === "string") {
        const restored: unknown = JSON.parse(restore(template)); assert.ok(typeof restored === "object" && restored !== null);
        const params: unknown = Reflect.get(restored, "params"); assert.ok(typeof params === "object" && params !== null);
        const actual: unknown = Reflect.get(params, "functionDeclaration"); assert.equal(actual, declaration);
        if (template.includes("__current209_")) { affected += 1; }
      }
    }
  }
  for (const row of currentPcbViaPostHistorySyncTemplates()) {
    const compact = currentProjectCanvasPendingNativeTemplate(row.template);
    assert.equal(restore(compact), row.template); assert.equal(expandCurrentProjectCanvasPendingNativeTemplate(compact), row.template);
    if (compact.includes("__current209_")) { affected += 1; }
  }
  assert.equal(affected, 13);
});

void test("snippet substitution refuses supplied markers and repeated fixed snippets", () => {
  const snippet = JSON.stringify(CURRENT_PROJECT_CANVAS_PENDING_CAPTURE).slice(1, -1);
  assert.equal(expandCurrentProjectCanvasPendingNativeTemplate(currentProjectCanvasPendingNativeTemplate(snippet)), snippet);
  assert.throws(() => currentProjectCanvasPendingNativeTemplate(`${snippet}${snippet}`), /PART_ALIAS/u);
  for (const marker of ["pending_capture", "via_retained", "schematic_retained"]) {
    assert.throws(() => currentProjectCanvasPendingNativeTemplate(`__current209_${marker}_part__`), /PART_INPUT/u);
  }
});
