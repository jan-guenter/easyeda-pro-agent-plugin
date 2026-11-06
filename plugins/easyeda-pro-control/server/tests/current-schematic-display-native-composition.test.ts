import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { applyCurrentPcbViaWriteNativeFragment as via } from "../src/current-pcb-via-write-native-fragment.ts";
import { applyCurrentSchematicDisplayWriteNativeFragment as schematic } from "../src/current-schematic-display-write-native-fragment.ts";

void test("combined Via and schematic native generation stays idempotent with one dispatcher for each action", async () => {
  const original = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  const first = schematic(via(original)), second = schematic(via(first));
  assert.equal(second, first);
  for (const action of ["pcb-via-main-step", "schematic-display-native", "schematic-display-abort"]) {
    assert.equal(first.split(`        '${action}' {`).length, 2);
  }
  assert.ok(first.indexOf("        'schematic-display-native' {") < first.indexOf("        'pcb-via-main-step' {"));
  const start = first.indexOf("        'schematic-display-native' {"), stop = first.indexOf("        'pcb-via-main-step' {");
  const schematicBlock = first.slice(start, stop);
  const interleaved = first.replace(schematicBlock, "").replace("        'pcb-via-main-observe' {", `${schematicBlock}        'pcb-via-main-observe' {`);
  assert.equal(schematic(via(interleaved)), first);
  assert.throws(() => schematic(first.replace("        'schematic-display-native' {", "        'schematic-display-native' {\n        'schematic-display-native' {")), /SCHEMATIC_DISPLAY_NATIVE_DISPATCH_CHANGED/u);
});
