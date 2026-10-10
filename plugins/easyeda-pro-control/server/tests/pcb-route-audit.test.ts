import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";
import { auditPcbRoutes } from "../src/pcb-route-audit.ts";

function object(type: string, id: string, body: Record<string, unknown>): NativeSourceObject { return { type, id, body }; }
function snapshot(objects: NativeSourceObject[]): NativeSourceSnapshot {
  const value = { schema: "easyeda-pro-control.document-source.v1" as const, document: { docType: "PCB", uuid: "board" }, objects: objects.toSorted((left, right) => left.id.localeCompare(right.id)) };
  return { ...value, sha256: sha256Json(value) };
}
interface FixturePad { primitiveId: string; padNumber: string; net: string; layer: number; x: number; y: number; metallization: boolean; source: "pcb_PrimitivePad-direct-state"; }
interface Fixture {
  objects: NativeSourceObject[];
  pads: Record<string, FixturePad>;
  inventory: { ok: boolean; kind: string; documentType: number; units: { coordinatesAndLengths: string }; families: { pads: { count: number; primitiveIds: string[]; byPrimitiveId: Record<string, FixturePad> } }; componentPadCorrelation: { status: string; primitiveIds: string[]; byPrimitiveId: Record<string, unknown> } };
}
function fixture(): Fixture {
  const objects = [
    object("LAYER", '["LAYER",1]', { layerId: 1, layerType: "TOP", use: true }), object("LAYER", '["LAYER",2]', { layerId: 2, layerType: "BOTTOM", use: true }),
    object("RULE", '["RULE","TRACK","track"]', { ruleState: "DEFAULT", ruleContext: { track: { isOpen: true, content: [{ layerId: 1, stroMin: 5, stroMax: 15, stroDef: 10 }] } } }),
    object("RULE", '["RULE","DIFFER_ENTAIL","pair"]', { ruleState: "DEFAULT", ruleContext: { differPairLenTolerMax: 1, stroWidth: { isOpen: true, content: [{ layerId: 1, stroMin: 5, stroMax: 15, stroDef: 10 }] } } }),
  ];
  const pads: Record<string, FixturePad> = {};
  for (const [net, y, length] of [["P", 0, 100], ["N", 20, 102]] as const) {
    objects.push(object("NET", JSON.stringify(["NET", net]), { differentialName: "USB", isPositiveNet: net === "P", equalLengthGroupName: null }));
    for (const [end, x] of [["a", 0], ["b", length]] as const) {
      const id = net + end;
      objects.push(object("PAD", id, { num: end, netName: net, centerX: x, centerY: y, layerId: 1 }));
      pads[id] = { primitiveId: id, padNumber: end, net, layer: 1, x, y, metallization: true, source: "pcb_PrimitivePad-direct-state" };
    }
    objects.push(object("LINE", `${net  }line`, { netName: net, startX: 0, startY: y, endX: length, endY: y, layerId: 1, width: 10 }));
  }
  const inventory = { ok: true, kind: "pcb-inventory", documentType: 3, units: { coordinatesAndLengths: "mil" }, families: { pads: { count: 4, primitiveIds: Object.keys(pads), byPrimitiveId: pads } }, componentPadCorrelation: { status: "exact-subset", primitiveIds: [], byPrimitiveId: {} } };
  return { objects, inventory, pads };
}

void test("route audit measures exact native pair length/skew and applies per-net/layer width contracts", () => {
  const { objects, inventory } = fixture();
  const report = auditPcbRoutes(snapshot(objects), inventory, { kind: "pcb-route-audit", widthContracts: [{ net: "P", layer: 1, minMil: 11, maxMil: 12 }] });
  assert.equal(report.nets.find((net) => net.net === "P")?.path?.shortestKnownPlanarLengthMil, 100);
  assert.equal(report.nets.find((net) => net.net === "N")?.path?.shortestKnownPlanarLengthMil, 102);
  assert.equal(report.differentialPairs[0]?.planarSkewMil, 2);
  assert.equal(report.differentialPairs[0]?.status, "outside-planar-limit");
  assert.equal(report.nets.find((net) => net.net === "P")?.widths.find((width) => width.authority === "requested-width-contract")?.status, "outside-range");
});

void test("arc sweeps use circular length, not chord or rounded public coordinates", () => {
  const { objects, inventory } = fixture();
  const index = objects.findIndex((entry) => entry.id === "Pline"); const line = objects[index]; assert.ok(line); objects[index] = { ...line, type: "ARC", body: { ...line.body, angle: 180 } };
  const report = auditPcbRoutes(snapshot(objects), inventory, { kind: "pcb-route-audit" });
  const measured = report.nets.find((net) => net.net === "P")?.path?.shortestKnownPlanarLengthMil;
  assert.ok(typeof measured === "number" && Math.abs(measured - 50 * Math.PI) < 1e-10);
});

void test("layer discontinuity, interior junctions and mismatched pad evidence cannot become complete pair proof", () => {
  const { objects, inventory } = fixture();
  const line = objects.find((entry) => entry.id === "Pline"); assert.ok(line); line.body["layerId"] = 2;
  let report = auditPcbRoutes(snapshot(objects), inventory, { kind: "pcb-route-audit" });
  assert.equal(report.nets.find((net) => net.net === "P")?.path?.connectedInCenterlineModel, false);
  assert.equal(report.differentialPairs[0]?.status, "indeterminate");
  line.body["layerId"] = 1;
  objects.push(object("LINE", "branch", { netName: "P", layerId: 1, startX: 50, startY: 0, endX: 50, endY: 30, width: 10 }));
  report = auditPcbRoutes(snapshot(objects), inventory, { kind: "pcb-route-audit" });
  assert.equal(report.nets.find((net) => net.net === "P")?.path?.completeSimplePath, false);
  assert.equal(report.nets.find((net) => net.net === "P")?.findings.some((finding) => finding.code === "interior-junction-unmodeled"), true);
  const changed = structuredClone(inventory); const pad = changed.families.pads.byPrimitiveId["Pa"]; assert.ok(pad); pad.net = "N";
  assert.throws(() => auditPcbRoutes(snapshot(objects), changed, { kind: "pcb-route-audit" }), /assignment disagree/u);
});
