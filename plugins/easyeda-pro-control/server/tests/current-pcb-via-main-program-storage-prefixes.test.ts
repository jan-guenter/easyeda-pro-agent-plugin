/** Lossless source storage of actual fixed Via wire templates only. No native
 * decoder, application, process, Job or continuation runs in this fixture. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_PCB_VIA_MAIN_STORAGE_PREFIXES as PREFIXES, CURRENT_PCB_VIA_MAIN_STORAGE_PREFIX_TABLE as TABLE } from "../src/current-pcb-via-main-program-storage-prefixes.ts";
import { currentPcbViaMainBeginTemplates } from "../src/current-pcb-via-main-begin-wire.ts";
import { currentPcbViaMainHistoryTemplates } from "../src/current-pcb-via-main-history-wire.ts";
import { currentPcbViaMainStructureTemplates } from "../src/current-pcb-via-main-structure-wire.ts";

void test("closed helper catalogue restores every actual Via wire byte and fits one unchanged64KiB data table", () => {
  assert.equal(TABLE.rows, 10); assert.ok(TABLE.bytes <= 65_536); assert.equal(PREFIXES[0]?.bytes, 7393); assert.equal(PREFIXES[0]?.sha256, "52f1fa754dd9b420d3f84549a56514ea2ac9e3e3c70c7bec2366539cfd1c87e3");
  const templates = [...currentPcbViaMainBeginTemplates(), ...currentPcbViaMainHistoryTemplates(), ...currentPcbViaMainStructureTemplates()]; const used = new Set<string>();
  for (const template of templates) {
    let reduced = template.template; for (const [index, prefix] of PREFIXES.entries()) { if (reduced.includes(prefix.escaped)) { used.add(prefix.key); reduced = reduced.replaceAll(prefix.escaped, `__via_main_storage_${String(index)}__`); } }
    let restored = reduced; for (const [index, prefix] of PREFIXES.entries()) { restored = restored.replaceAll(`__via_main_storage_${String(index)}__`, prefix.escaped); }
    assert.equal(restored, template.template); assert.deepEqual(JSON.parse(restored), JSON.parse(template.template));
  }
  assert.equal(used.size, PREFIXES.length); assert.equal(templates.length, 242);
});
