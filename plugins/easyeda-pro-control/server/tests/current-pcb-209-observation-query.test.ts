import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import { sha256Text } from "../src/core.ts";
import { currentDisposableOpenSealedTargetSchema } from "../src/current-disposable-open.ts";
import { decodeCurrentPcb209ArcShapesReply } from "../src/current-pcb-209-arc-shapes.ts";
import { decodeCurrentPcb209PouredShapesReply } from "../src/current-pcb-209-poured-shapes.ts";
import { decodeCurrentPcb209PrimitivesReply } from "../src/current-pcb-209-primitives.ts";
import { decodeCurrentPcb209ImageShapesReply } from "../src/current-pcb-209-image-shapes.ts";
import { decodeCurrentPcb209PadShapesReply } from "../src/current-pcb-209-pad-shapes.ts";
// oxlint-disable-next-line import/max-dependencies -- Historical reconstruction verifies all seven original decoders together without replacing their behavior with mocks.
import { decodeCurrentPcb209ExtendedPrimitivesReply } from "../src/current-pcb-209-extended-primitives.ts";
import { decodeCurrentPcb209SelectionRelationsReply } from "../src/current-pcb-209-selection-relations.ts";
import { currentPcb209ObservationQuerySchema, queryCurrentPcb209Observation } from "../src/current-pcb-209-observation-query.ts";

const path = String.raw`C:\Reviewed\HistoricalQueryFixture.eprj2`;
const target = currentDisposableOpenSealedTargetSchema.parse({ rawWindowsPath: path, projectUuid: sha256Text(path),
  branchUuid: "b".repeat(32), documentUuid: "c".repeat(16), expectedSourceSha256: "d".repeat(64) });
const projectedTarget = { projectUuid: target.projectUuid, branchUuid: target.branchUuid, documentUuid: target.documentUuid,
  tabId: `${target.documentUuid}@${target.projectUuid}` };
const componentIds = ["component-a", "component-b"];
const records = z.array(z.record(z.string(), z.unknown()));
type Stage = "primitives209" | "extended-primitives209" | "selection-relations209" | "pad-shapes209" | "image-shapes209" | "arc-shapes209" | "poured-shapes209";
function fixture(stage: Stage): Readonly<Record<string, unknown>> {
  const line = { primitiveId: "line-a", primitiveType: "Line", primitiveLock: false, net: "", layer: 1, startX: 0, startY: 1, endX: 2, endY: 3, lineWidth: 4 };
  const pad = { primitiveId: "pad-a", primitiveType: "Pad", primitiveLock: false, net: null, layer: 12, padNumber: "1", x: 1, y: 2, rotation: 0,
    metallization: true, padType: 0, hole: null, defaultCopperShape: { shape: "RECT", width: 10, height: 12, cornerRatioPercent: 0 },
    maskExpansion: { mode: 1, topSolder: 0, bottomSolder: 0, paste: 0 }, thermal: null };
  const textRow = { primitiveId: "string-a", primitiveType: "String", primitiveLock: false, layer: 3, x: 1, y: 2, text: "hello",
    fontFamily: "", fontSize: 10, lineWidth: 1, alignMode: 1, rotation: 0, reverse: false, expansion: 0, mirror: false, key: "",
    showKey: false, showValue: true, positionIsNull: false, silkColor: null };
  const attribute = { primitiveId: "attribute-a", primitiveType: "Attribute", primitiveLock: false, layer: 3, x: 1, y: 2, value: "U1",
    fontFamily: "", fontSize: 10, lineWidth: 1, alignMode: 1, rotation: 0, reverse: false, expansion: 0, mirror: false, key: "Designator",
    keyVisible: false, valueVisible: true, positionIsNull: false, silkColor: null, parentPrimitiveId: "component-a" };
  const components = [
    { primitiveId: "component-a", primitiveType: "Component", primitiveLock: false, layer: 1, x: 1, y: 2, rotation: 0, designator: "U1", name: "" },
    { primitiveId: "component-b", primitiveType: "Component", primitiveLock: true, layer: 2, x: 3, y: 4, rotation: 0, designator: "" },
    { primitiveId: "component-c", primitiveType: "Component", primitiveLock: false, layer: 1, x: 5, y: 6, rotation: 0 },
  ];
  const pads = [pad, { ...pad, primitiveId: "pad-b", net: "Gnd", padNumber: "2", padType: 1 }];
  const all = [
    { family: "Line", rows: [line, { ...line, primitiveId: "line-b", net: "Gnd", layer: 2, primitiveLock: true }, { ...line, primitiveId: "line-c", net: null }] },
    { family: "Arc", rows: [{ ...line, primitiveId: "arc-a", primitiveType: "Arc", arcAngle: 90, interactiveMode: 1 }] },
    { family: "Via", rows: [{ primitiveId: "via-a", primitiveType: "Via", primitiveLock: false, net: "GND", x: 1, y: 2, holeDiameter: 5, diameter: 10,
      viaType: 0, designRuleBlindViaName: null, startLayer: 1, endLayer: 2, maskExpansionMode: 1, topMaskExpansion: 0, bottomMaskExpansion: 0 }] },
    { family: "Component", rows: components }, { family: "Pad", rows: pads }, { family: "String", rows: [textRow] },
    { family: "Attribute", rows: [attribute], attributeParentGroups: components.map(row => ({ parentPrimitiveId: row.primitiveId,
      ids: row.primitiveId === "component-a" ? ["attribute-a"] : [] })), relationshipEvidence: "native-component-attribute-groups", reciprocalParentVerified: false },
    { family: "Dimension", rows: [] }, { family: "Image", rows: [] },
  ];
  let selected = new Set(all.map(row => row.family));
  if (stage === "primitives209") { selected = new Set(["Line", "Arc", "Via", "String"]); }
  if (stage === "extended-primitives209") { selected = new Set(["Component", "Pad", "Attribute", "Dimension", "Image"]); }
  const observations = all.filter(entry => selected.has(entry.family)).map(({ family, ...entry }) => {
    const observation = { ok: true, kind: "current-pcb-geometry-observation", method: `eda.pcb_Primitive${family}.getAll`,
      target: projectedTarget, samples: 2, implementationKind: "native-task-equivalent", cadAuthority: false,
      persistenceVerified: false, sourceMembershipVerified: false };
    return Object.assign(observation, entry);
  });
  const componentMetadataStates = components.map(row => ({ primitiveId: row.primitiveId, states: {
    designator: Object.hasOwn(row, "designator") ? "present" : "absent", name: Object.hasOwn(row, "name") ? "present" : "undefined",
    manufacturer: "absent", manufacturerPart: "absent", supplier: "absent", supplierPart: "absent" } }));
  const scalarRows = pads.toReversed().map(row => ({ primitiveId: row.primitiveId, padNumber: row.padNumber, net: row.net, layer: row.layer,
    primitiveLock: row.primitiveLock, metallization: row.metallization, padType: row.padType }));
  if (stage === "pad-shapes209") {
    return decodeCurrentPcb209PadShapesReply({ result: { type: "string", value: JSON.stringify({ ok: true,
      kind: "pcb209-original-pad-shapes-observation", target: projectedTarget,
      observation: observations.find(entry => entry.method === "eda.pcb_PrimitivePad.getAll"),
      specialShapeGroups: pads.map(row => ({ primitiveId: row.primitiveId, groups: row.primitiveId === "pad-a" ? [] : [
        { nativeStartLayer: 1, nativeEndLayer: 1, shape: { shape: "RECT", width: 10, height: 12, cornerRatioPercent: 15 } },
        { nativeStartLayer: 1, nativeEndLayer: 2, shape: { shape: "ELLIPSE", width: 9, height: 11 } },
        { nativeStartLayer: 2, nativeEndLayer: 2, shape: { shape: "OVAL", width: 8, height: 10 } },
      ] })),
    }) } }, target);
  }
  if (stage === "image-shapes209") {
    const image = { primitiveId: "image-a", primitiveType: "Image", primitiveLock: false, imageType: "Image", layer: 3,
      x: 1, y: 2, width: 3, height: 4, rotation: 0, horizonMirror: false };
    return decodeCurrentPcb209ImageShapesReply({ result: { type: "string", value: JSON.stringify({ ok: true,
      kind: "pcb209-original-image-shapes-observation", target: projectedTarget,
      observation: { ok: true, kind: "current-pcb-geometry-observation", method: "eda.pcb_PrimitiveImage.getAll", target: projectedTarget,
        rows: [image, { ...image, primitiveId: "picture-a", imageType: "Picture", layer: 4 }], samples: 2,
        implementationKind: "native-task-equivalent", cadAuthority: false, persistenceVerified: false, sourceMembershipVerified: false },
      imageShapes: [{ primitiveId: "image-a", imageType: "Image", pathString: "M 0 1 L 2 3", silkColor: null },
        { primitiveId: "picture-a", imageType: "Picture", assetReference: "opaque-reference" }],
    }) } }, target);
  }
  if (stage === "arc-shapes209") {
    const shapes = [{ primitiveId: "arc-a", centerX: 10, centerY: 20, radius: 30, startAngleRadians: 0, endAngleRadians: Math.PI / 2, sweep: 1 },
      { primitiveId: "arc-b", centerX: 11, centerY: 22, radius: 31, startAngleRadians: 0, endAngleRadians: Math.PI / 2, sweep: 1 }];
    const rows = shapes.map(shape => ({ primitiveId: shape.primitiveId, primitiveType: "Arc", primitiveLock: false, net: "GND", layer: 1,
      startX: shape.centerX + Math.cos(shape.startAngleRadians) * shape.radius, startY: shape.centerY + Math.sin(shape.startAngleRadians) * shape.radius,
      endX: shape.centerX + Math.cos(shape.endAngleRadians) * shape.radius, endY: shape.centerY + Math.sin(shape.endAngleRadians) * shape.radius,
      lineWidth: 1, arcAngle: 90, interactiveMode: 1 }));
    return decodeCurrentPcb209ArcShapesReply({ result: { type: "string", value: JSON.stringify({ ok: true,
      kind: "pcb209-original-arc-shapes-observation", target: projectedTarget,
      observation: { ok: true, kind: "current-pcb-geometry-observation", method: "eda.pcb_PrimitiveArc.getAll", target: projectedTarget,
        rows, samples: 2, implementationKind: "native-task-equivalent", cadAuthority: false, persistenceVerified: false, sourceMembershipVerified: false }, arcShapes: shapes,
    }) } }, target);
  }
  if (stage === "poured-shapes209") {
    const fill = { primitiveType: "Poured", primitiveId: "fill-a", pourPrimitiveId: "pour-a", partition: "", layerId: 1, net: "Gnd", style: "solid",
      gridLineWidth: 0, clearance: 1, optimization: null, optimizationState: "undefined", optimizationWidth: 0.5, copperPath: [["CIRCLE", 1, 2, 3]] };
    return decodeCurrentPcb209PouredShapesReply({ result: { type: "string", value: JSON.stringify({ ok: true,
      kind: "pcb209-original-poured-shapes-observation", target: projectedTarget,
      observation: { ok: true, kind: "current-pcb-poured-source-observation", method: "eda.pcb_PrimitivePoured.getAll", target: projectedTarget,
        rows: [fill, { ...fill, primitiveId: "fill-b", pourPrimitiveId: "pour-b", net: null, layerId: 2, style: "45grid" },
          { ...fill, primitiveId: "fill-c", net: "", style: "none" }], samples: 2, implementationKind: "native-task-equivalent", cadAuthority: false,
        persistenceVerified: false, sourceMembershipVerified: false, copperRebuildPerformed: false },
      parentGroups: [{ pourPrimitiveId: "pour-a", primitiveIds: ["fill-a", "fill-c"] }, { pourPrimitiveId: "pour-b", primitiveIds: ["fill-b"] }],
    }) } }, target);
  }
  const base = { ok: true, target: projectedTarget, observations };
  let packet: Record<string, unknown>;
  if (stage === "primitives209") { packet = { ...base, kind: "pcb209-original-primitives-observation" }; }
  else if (stage === "extended-primitives209") { packet = { ...base, kind: "pcb209-original-extended-primitives-observation", componentMetadataStates }; }
  else {
    packet = { ...base, kind: "pcb209-original-selection-relations-observation", componentMetadataStates,
      selectedPrimitiveIds: ["attribute-a", "pad-b", "component-a"], requestedComponentIds: componentIds,
      componentPadGroups: [{ parentPrimitiveId: "component-a", ids: ["pad-b", "pad-a"], scalarRows }, { parentPrimitiveId: "component-b", ids: [], scalarRows: [] }] };
  }
  const reply = { result: { type: "string", value: JSON.stringify(packet) } };
  if (stage === "primitives209") { return decodeCurrentPcb209PrimitivesReply(reply, target); }
  if (stage === "extended-primitives209") { return decodeCurrentPcb209ExtendedPrimitivesReply(reply, target); }
  return decodeCurrentPcb209SelectionRelationsReply(reply, target, componentIds);
}
function query(stage: Stage, request: unknown, result = fixture(stage), originalComponentIds: unknown = stage === "selection-relations209" ? componentIds : undefined): Readonly<Record<string, unknown>> {
  return queryCurrentPcb209Observation(result, target, request, { operationId: "pcb209-historical-fixture", stage,
    resultRecordSha256: "e".repeat(64), observedAt: "2026-10-24T01:02:03.000Z" }, originalComponentIds);
}

void test("209 historical family queries reconstruct each exact published decoder without fresh authority", () => {
  for (const stage of ["primitives209", "extended-primitives209", "selection-relations209"] as const) {
    const family = stage === "extended-primitives209" ? "Component" : "Line";
    const result = query(stage, { kind: "family", family });
    assert.equal(result["historical"], true); assert.equal(result["freshObservation"], false);
    for (const flag of ["sourceMembershipVerified", "reciprocalParentVerified", "symbolPinMappingVerified", "connectivityVerified", "persistenceVerified", "executionAuthorized", "saveAuthorized"]) {
      assert.equal(result[flag], false);
    }
    assert.equal(result["returnedRowCount"], 3); assert.equal(Object.isFrozen(result), true); assert.equal(Object.isFrozen(result["rows"]), true);
    assert.deepEqual(result["provenance"], { operationId: "pcb209-historical-fixture", stage, resultRecordSha256: "e".repeat(64), observedAt: "2026-10-24T01:02:03.000Z" });
  }
  assert.throws(() => query("primitives209", { kind: "family", family: "Component" }), /PCB209_QUERY_FAMILY_UNAVAILABLE/u);
  for (const request of [{ kind: "selection" }, { kind: "component-pads", componentId: "component-a" }]) {
    assert.throws(() => query("extended-primitives209", request), /PCB209_QUERY_RELATIONS_UNAVAILABLE/u);
  }
});

void test("209 exact historical IDs preserve request order and missing IDs cannot hide behind a filter", () => {
  const ordered = query("primitives209", { kind: "family", family: "Line", primitiveIds: ["line-b", "line-a"] });
  assert.deepEqual(ordered["primitiveIds"], ["line-b", "line-a"]); assert.equal(ordered["candidateRowCount"], 3); assert.equal(ordered["requestedIdCount"], 2);
  assert.deepEqual(query("primitives209", { kind: "family", family: "Line", primitiveIds: ["line-b", "line-a"], where: { net: "" } })["primitiveIds"], ["line-a"]);
  assert.throws(() => query("primitives209", { kind: "family", family: "Line", primitiveIds: ["missing"], where: { net: "absent" } }), /PCB209_QUERY_ID_MISSING/u);
  assert.throws(() => query("primitives209", { kind: "family", family: "Line", primitiveIds: ["arc-a"] }), /PCB209_QUERY_ID_MISSING/u);
});

void test("209 historical filters retain null empty case metadata absence and typed family boundaries", () => {
  for (const [net, expected] of [[null, ["line-c"]], ["", ["line-a"]], ["Gnd", ["line-b"]], ["GND", []]] as const) {
    assert.deepEqual(query("primitives209", { kind: "family", family: "Line", where: { net } })["primitiveIds"], expected);
  }
  assert.deepEqual(query("primitives209", { kind: "family", family: "Line", where: { primitiveLock: true, layer: 2 } })["primitiveIds"], ["line-b"]);
  const component = query("extended-primitives209", { kind: "family", family: "Component", where: { designator: "" } });
  assert.deepEqual(component["primitiveIds"], ["component-b"]);
  assert.deepEqual(records.parse(component["componentMetadataStates"]).map(row => row["primitiveId"]), ["component-b"]);
  assert.deepEqual(query("extended-primitives209", { kind: "family", family: "Pad", where: { padType: 1, padNumber: "2", net: "Gnd" } })["primitiveIds"], ["pad-b"]);
  const attribute = query("extended-primitives209", { kind: "family", family: "Attribute", where: { parentPrimitiveId: "component-b" } });
  assert.deepEqual(attribute["rows"], []); assert.equal(records.parse(attribute["attributeParentGroups"]).length, 3);
  assert.equal(attribute["attributeGroupScope"], "complete-observed-component-roster;returned-rows-may-be-filtered");
  for (const request of [
    { kind: "family", family: "Via", where: { layer: 1 } }, { kind: "family", family: "String", where: { net: null } },
    { kind: "family", family: "Line", where: { designator: "U1" } }, { kind: "family", family: "Pad", where: { padType: 3 } },
    { kind: "family", family: "Pad", where: { layer: -0 } }, { kind: "family", family: "Line", where: { primitiveLock: "false" } },
    { kind: "family", family: "Line", primitiveIds: [] }, { kind: "family", family: "Line", primitiveIds: ["a", "a"] },
    { kind: "selection", where: {} }, { kind: "family", family: "Region" },
  ]) { assert.equal(currentPcb209ObservationQuerySchema.safeParse(request).success, false); }
  assert.throws(() => query("primitives209", { kind: "family", family: "Line", where: { net: undefined } }), /PCB209_QUERY_UNDEFINED_FILTER/u);
});

void test("209 historical selection and observed component child lists preserve their different orders and evidence", () => {
  const selected = query("selection-relations209", { kind: "selection" });
  assert.deepEqual(selected["primitiveIds"], ["attribute-a", "pad-b", "component-a"]);
  assert.deepEqual(records.parse(selected["componentMetadataStates"]).map(row => row["primitiveId"]), ["component-a"]);
  assert.equal(records.parse(selected["attributeParentGroups"]).length, 3);
  const children = query("selection-relations209", { kind: "component-pads", componentId: "component-a" });
  assert.deepEqual(children["primitiveIds"], ["pad-b", "pad-a"]); assert.equal(records.parse(children["componentPadGroups"]).length, 1);
  assert.deepEqual(query("selection-relations209", { kind: "component-pads", componentId: "component-b" })["rows"], []);
  assert.throws(() => query("selection-relations209", { kind: "component-pads", componentId: "component-c" }), /PCB209_QUERY_COMPONENT_NOT_OBSERVED/u);
  assert.throws(() => query("selection-relations209", { kind: "selection" }, fixture("selection-relations209"), []), /PCB209_SELECTION_RELATIONS_REQUEST/u);
  assert.throws(() => queryCurrentPcb209Observation(fixture("selection-relations209"), target, { kind: "selection" }, {
    operationId: "pcb209-historical-fixture", stage: "selection-relations209", resultRecordSha256: "e".repeat(64), observedAt: "2026-10-24T01:02:03.000Z" }));
  assert.throws(() => query("primitives209", { kind: "family", family: "Line" }, fixture("primitives209"), []), /PCB209_QUERY_UNEXPECTED_COMPONENT_INTENT/u);
});

void test("209 historical reconstruction rejects forged flags hashes selected rows family IDs and complete metadata", () => {
  for (const stage of ["primitives209", "extended-primitives209", "selection-relations209"] as const) {
    for (const field of ["executionAuthorized", "saveAuthorized", "persistenceVerified", "sourceMembershipVerified", "matchingSamples"]) {
      const result = { ...structuredClone(fixture(stage)) }; result[field] = result[field] !== true;
      assert.throws(() => query(stage, { kind: "family", family: stage === "primitives209" ? "Line" : "Component" }, result), /PCB209_QUERY_RECONSTRUCTION_MISMATCH/u);
    }
    for (const change of [
      (result: Record<string, unknown>): void => { result["projectionSha256"] = "0".repeat(64); },
      (result: Record<string, unknown>): void => { result["unprovedExtra"] = true; },
      (result: Record<string, unknown>): void => {
        const families = records.parse(result["families"]);
        const first = families[0]; assert.ok(first); first["primitiveIds"] = []; result["families"] = families;
      },
    ]) {
      const result = structuredClone(fixture(stage)); change(result);
      assert.throws(() => query(stage, { kind: "family", family: stage === "primitives209" ? "Line" : "Component" }, result), /PCB209_QUERY_RECONSTRUCTION_MISMATCH/u);
    }
  }
  const selected = { ...structuredClone(fixture("selection-relations209")), selectedRows: [] };
  assert.throws(() => query("selection-relations209", { kind: "selection" }, selected), /PCB209_QUERY_RECONSTRUCTION_MISMATCH/u);
  const metadata = { ...structuredClone(fixture("extended-primitives209")), componentMetadataStates: [] };
  assert.throws(() => query("extended-primitives209", { kind: "family", family: "Component" }, metadata), /PCB209_EXTENDED_PRIMITIVES_COMPONENT_ASSOCIATION/u);
});

void test("209 historical query rejects target provenance Unicode and byte-bound drift without truncating", () => {
  const result = fixture("primitives209");
  const provenance = { operationId: "pcb209-historical-fixture", stage: "primitives209",
    resultRecordSha256: "e".repeat(64), observedAt: "2026-10-24T01:02:03.000Z" };
  assert.throws(() => queryCurrentPcb209Observation(result, { ...target, documentUuid: "f".repeat(16) }, { kind: "family", family: "Line" }, provenance), /PCB209_PRIMITIVES_TARGET/u);
  for (const replacement of [{ resultRecordSha256: "bad" }, { stage: "layers209" }, { observedAt: "now" }, { operationId: "../outside" }]) {
    assert.throws(() => queryCurrentPcb209Observation(result, target, { kind: "family", family: "Line" }, { ...provenance, ...replacement }));
  }
  for (const primitiveIds of [[String.fromCodePoint(0xD8_00)], ["😀".repeat(129)], Array.from({ length: 257 }, (_, i) => `id${i}`)]) {
    assert.equal(currentPcb209ObservationQuerySchema.safeParse({ kind: "family", family: "Line", primitiveIds }).success, false);
  }
  assert.equal(currentPcb209ObservationQuerySchema.safeParse({ kind: "family", family: "Line", primitiveIds: ["quote\"slash\\newline\n", "😀".repeat(128)] }).success, true);
  assert.throws(() => query("primitives209", { kind: "family", family: "Line" }, { ...result, huge: "x".repeat(393_216) }), /PCB209_QUERY_SOURCE_BOUND/u);
});

void test("209 historical Pad shape queries preserve requested row order and complete corresponding style groups", () => {
  const result = query("pad-shapes209", { kind: "family", family: "Pad", primitiveIds: ["pad-b", "pad-a"] });
  assert.deepEqual(result["primitiveIds"], ["pad-b", "pad-a"]);
  const groups = records.parse(result["specialShapeGroups"]);
  assert.deepEqual(groups.map(group => group["primitiveId"]), ["pad-b", "pad-a"]);
  assert.equal(records.parse(groups[0]?.["groups"]).length, 3); assert.deepEqual(groups[1]?.["groups"], []);
  assert.equal(result["specialShapeScope"], "native-top-inner-bottom-style-groups");
  assert.equal(result["physicalLayerExpansionVerified"], false);
  assert.deepEqual(query("pad-shapes209", { kind: "family", family: "Pad", where: { net: "missing" } })["specialShapeGroups"], []);
  assert.throws(() => query("pad-shapes209", { kind: "family", family: "Component" }), /PCB209_QUERY_FAMILY_UNAVAILABLE/u);
  assert.throws(() => query("pad-shapes209", { kind: "selection" }), /PCB209_QUERY_RELATIONS_UNAVAILABLE/u);
  assert.throws(() => query("pad-shapes209", { kind: "family", family: "Pad", primitiveIds: ["absent"], where: { net: "missing" } }), /PCB209_QUERY_ID_MISSING/u);
  for (const changed of [{ physicalLayerExpansionVerified: true }, { specialShapeGroups: [] }, { projectionSha256: "0".repeat(64) },
    { specialShapeScope: "physical-stack" }]) {
    assert.throws(() => query("pad-shapes209", { kind: "family", family: "Pad" }, { ...fixture("pad-shapes209"), ...changed }));
  }
  assert.equal(Object.hasOwn(query("extended-primitives209", { kind: "family", family: "Pad" }), "specialShapeGroups"), false);
});

void test("209 historical Image shapes retain native path units and opaque references in requested order", () => {
  const result = query("image-shapes209", { kind: "family", family: "Image", primitiveIds: ["picture-a", "image-a"] });
  assert.deepEqual(result["primitiveIds"], ["picture-a", "image-a"]);
  const shapes = records.parse(result["imageShapes"]);
  assert.deepEqual(shapes.map(shape => shape["primitiveId"]), ["picture-a", "image-a"]);
  assert.equal(shapes[0]?.["assetReference"], "opaque-reference"); assert.equal(shapes[1]?.["pathString"], "M 0 1 L 2 3");
  assert.equal(result["imageShapeScope"], "native-image-path-and-picture-reference");
  assert.deepEqual(result["units"], { placementLinear: "mil", rotation: "degrees", vectorPathLinear: "native-distance;10-mil-per-unit", vectorPathYAxis: "inverted-board-y" });
  assert.equal(result["renderedGeometryVerified"], false); assert.equal(result["assetContentVerified"], false);
  assert.deepEqual(query("image-shapes209", { kind: "family", family: "Image", where: { layer: 9 } })["imageShapes"], []);
  assert.throws(() => query("image-shapes209", { kind: "family", family: "Pad" }), /PCB209_QUERY_FAMILY_UNAVAILABLE/u);
  assert.throws(() => query("image-shapes209", { kind: "selection" }), /PCB209_QUERY_RELATIONS_UNAVAILABLE/u);
  for (const changed of [{ renderedGeometryVerified: true }, { assetContentVerified: true }, { imageShapes: [] },
    { units: { vectorPathLinear: "mil" } }, { imageShapeScope: "rendered-svg" }]) {
    assert.throws(() => query("image-shapes209", { kind: "family", family: "Image" }, { ...fixture("image-shapes209"), ...changed }));
  }
  assert.equal(Object.hasOwn(query("extended-primitives209", { kind: "family", family: "Image" }), "imageShapes"), false);
});

void test("209 historical Arc shapes retain requested descriptor order units and source interpretation limits", () => {
  const result = query("arc-shapes209", { kind: "family", family: "Arc", primitiveIds: ["arc-b", "arc-a"] });
  assert.deepEqual(result["primitiveIds"], ["arc-b", "arc-a"]);
  assert.deepEqual(records.parse(result["arcShapes"]).map(shape => shape["primitiveId"]), ["arc-b", "arc-a"]);
  assert.equal(result["arcShapeScope"], "native-center-radius-directed-endpoint-angles");
  assert.equal(result["fullCircleInterpretationVerified"], false);
  assert.deepEqual(result["units"], { linear: "mil", arcAngle: "degrees", endpointAngles: "radians", sweep: "native-enum-0-CW-1-CCW" });
  assert.deepEqual(query("arc-shapes209", { kind: "family", family: "Arc", where: { layer: 2 } })["arcShapes"], []);
  assert.throws(() => query("arc-shapes209", { kind: "family", family: "Pad" }), /PCB209_QUERY_FAMILY_UNAVAILABLE/u);
  assert.throws(() => query("arc-shapes209", { kind: "selection" }), /PCB209_QUERY_RELATIONS_UNAVAILABLE/u);
  for (const changed of [{ fullCircleInterpretationVerified: true }, { arcShapes: [] }, { units: { endpointAngles: "degrees" } },
    { arcShapeScope: "rendered-circle" }]) { assert.throws(() => query("arc-shapes209", { kind: "family", family: "Arc" }, { ...fixture("arc-shapes209"), ...changed })); }
  assert.equal(Object.hasOwn(query("primitives209", { kind: "family", family: "Arc" }), "arcShapes"), false);
});

void test("209 historical Poured queries preserve fill IDs complete parent roster native paths and strict filters", () => {
  const result = query("poured-shapes209", { kind: "family", family: "Poured", primitiveIds: ["fill-c", "fill-a", "fill-b"], where: { pourPrimitiveId: "pour-a" } });
  assert.deepEqual(result["primitiveIds"], ["fill-c", "fill-a"]);
  assert.deepEqual(records.parse(result["rows"])[0]?.["copperPath"], [["CIRCLE", 1, 2, 3]]);
  assert.deepEqual(result["parentGroups"], [{ pourPrimitiveId: "pour-a", primitiveIds: ["fill-a", "fill-c"] }, { pourPrimitiveId: "pour-b", primitiveIds: ["fill-b"] }]);
  assert.equal(result["parentGroupScope"], "complete-observed-native-fill-parent-roster;returned-rows-may-be-filtered");
  assert.equal(result["sourceParentGroupScope"], "observed-native-fill-parent-identifiers");
  assert.equal(result["primitiveIdScope"], "native-fill-globalIndex-not-public-parent-id");
  assert.deepEqual(result["units"], { linear: "native-distance-10mil-per-unit", pathCoordinates: "native-distance-10mil-per-unit", pathSweep: "degrees" });
  for (const field of ["copperRebuildPerformed", "copperFreshnessVerified", "fabricationGeometryVerified", "executionAuthorized", "saveAuthorized"]) { assert.equal(result[field], false); }
  assert.deepEqual(query("poured-shapes209", { kind: "family", family: "Poured", where: { layerId: 2, net: null, style: "45grid" } })["primitiveIds"], ["fill-b"]);
  assert.deepEqual(query("poured-shapes209", { kind: "family", family: "Poured", where: { net: "" } })["primitiveIds"], ["fill-c"]);
  const empty = query("poured-shapes209", { kind: "family", family: "Poured", where: { net: "GND" } });
  assert.deepEqual(empty["rows"], []); assert.deepEqual(empty["parentGroups"], result["parentGroups"]);
  for (const where of [{ layer: 1 }, { primitiveLock: false }, { layerId: -0 }, { style: "grid" }, { pourPrimitiveId: "" }]) {
    assert.equal(currentPcb209ObservationQuerySchema.safeParse({ kind: "family", family: "Poured", where }).success, false);
  }
  assert.throws(() => query("poured-shapes209", { kind: "family", family: "Poured", primitiveIds: ["pour-a"], where: { net: "absent" } }), /PCB209_QUERY_ID_MISSING/u);
  assert.throws(() => query("poured-shapes209", { kind: "family", family: "Poured", where: { style: undefined } }), /PCB209_QUERY_UNDEFINED_FILTER/u);
  assert.throws(() => query("poured-shapes209", { kind: "selection" }), /PCB209_QUERY_RELATIONS_UNAVAILABLE/u);
  for (const changed of [{ parentGroups: [] }, { primitiveIdScope: "public-parent-id" }, { copperRebuildPerformed: true }, { copperFreshnessVerified: true },
    { fabricationGeometryVerified: true }, { units: { linear: "mil" } }]) {
    assert.throws(() => query("poured-shapes209", { kind: "family", family: "Poured" }, { ...fixture("poured-shapes209"), ...changed }));
  }
  assert.equal(Object.hasOwn(query("primitives209", { kind: "family", family: "Line" }), "parentGroups"), false);
});
