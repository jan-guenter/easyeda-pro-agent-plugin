import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import type { NativeSourceSnapshot } from "../src/document-source.ts";
import { verifyCopperLifecycleEquivalence, verifyCopperSaveAcknowledgment } from "../src/copper-lifecycle.ts";

const PATH = [0.18954999999999966, -24.28664, "ARC", 90.00000000000006, 1.1995499999999997, -25.296639999999996,
  "L", 4.37465, -25.29664, "ARC", 89.99999999999994, 5.38465, -24.28664, "L", 5.38465, -20.885039999999996,
  "ARC", 90.00000000000006, 4.37465, -19.87504, "L", 1.1995499999999995, -19.875039999999995,
  "ARC", 89.99999999999994, 0.18954999999999966, -20.885039999999996, "L", 0.18954999999999966, -24.28664];
function source(path = PATH, change: { width?: number; childId?: string; componentX?: number; parentNet?: string } = {}): NativeSourceSnapshot {
  const base = { schema: "easyeda-pro-control.document-source.v1" as const, document: { uuid: "fixture", docType: "PCB", editVersion: "3.2.149.88089769" },
    objects: [{ id: "part", type: "COMPONENT", body: { x: change.componentX ?? 10 } },
      { id: "pour", type: "POUR", body: { layerId: 1, netName: change.parentNet ?? "GND" } },
      { id: '["POURED","pour"]', type: "POURED", body: { pourFill: [{ id: change.childId ?? "copper", strokeWidth: change.width ?? 0, fill: true, path: [path] }] } }].toSorted((a, b) => a.id.localeCompare(b.id)) };
  return { ...base, sha256: sha256Json(base) };
}
void test("native arc reload retains raw hashes while reporting only bounded operands", () => {
  const after = [...PATH]; after[3] = 90.00000000000011; after[10] = 89.99999999999989; after[21] = 1.1995499999999992;
  const before = source(), observed = source(after);
  const report = verifyCopperLifecycleEquivalence(before, observed);
  assert.equal(report["exact"], false); assert.equal(report["differenceCount"], 3);
  assert.equal(report["referenceSha256"], before.sha256); assert.equal(report["observedSha256"], observed.sha256);
  assert.notEqual(before.sha256, observed.sha256);
  assert.equal(verifyCopperLifecycleEquivalence(before, before)["exact"], true);
});
void test("copper reload rejects geometry, command, width, identity and unrelated record changes", () => {
  const before = source();
  for (const [index, value] of [[3, 90.0000000000002], [21, 1.2], [6, "ARC"], [11, 5.384650000000001], [0, 0]] as const) {
    const changed = [...PATH]; changed[index] = value;
    assert.throws(() => verifyCopperLifecycleEquivalence(before, source(changed)), /Copper lifecycle/u);
  }
  for (const change of [{ width: 0.1 }, { childId: "other" }, { componentX: 10.000000000000002 }, { parentNet: "OTHER" }]) {
    assert.throws(() => verifyCopperLifecycleEquivalence(before, source(PATH, change)), /Copper lifecycle/u);
  }
  const lines = source([0, 0, "L", 20, 20]);
  assert.throws(() => verifyCopperLifecycleEquivalence(lines, source([0, 0, "L", 20.000000000000004, 20])), /Copper lifecycle/u);
  assert.throws(() => verifyCopperLifecycleEquivalence({ ...before, sha256: "0".repeat(64) }, before), /commitment/u);
});
void test("recovery acknowledgment binds completed save to the verified after-phase source", () => {
  const expected = source();
  const text = `{"type":"DOCHEAD"}||${JSON.stringify(expected.document)}|\n${expected.objects.map((entry) => `${JSON.stringify({ id: entry.id, type: entry.type })}||${JSON.stringify(entry.body)}|\n`).join("")}`;
  const hash = "a".repeat(64);
  const phase = { payload: { source: text, read_consistency: { stable: true, snapshotSha256: hash } } };
  const ack = { ok: true, saved: true, closed: true, reopened: true, document: { uuid: "fixture", documentType: 3 },
    exactSaveGuard: { passes: 2, labels: ["pcb-source"], snapshotSha256: [hash], saveInvokedInSameExecution: true, publicCompareAndSwapAvailable: false } };
  assert.doesNotThrow(() => { verifyCopperSaveAcknowledgment(ack, phase, expected); });
  assert.throws(() => { verifyCopperSaveAcknowledgment({ ...ack, saved: false }, phase, expected); }, /acknowledgment/u);
  assert.throws(() => { verifyCopperSaveAcknowledgment({ ...ack, exactSaveGuard: { ...ack.exactSaveGuard, snapshotSha256: ["b".repeat(64)] } }, phase, expected); }, /save guard/u);
  assert.throws(() => { verifyCopperSaveAcknowledgment(ack, phase, source(PATH, { componentX: 11 })); }, /verified source/u);
});
