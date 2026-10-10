import { canonicalJson, sha256Json } from "./core.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "./document-source.ts";
import { correlateSchematicNativeSource } from "./schematic-source-proof.ts";
import type { SchematicNativeComponent, SchematicNativeSnapshot } from "./schematic-native-adapter.ts";
import { buildSchematicLayoutAdapter, expectedSchematicLayout, schematicLayoutBatchSchema, verifySchematicLayoutEffect, verifySchematicLayoutPersistence } from "./schematic-layout-batch.ts";
import type { SchematicLayoutCreatedIds, SchematicLayoutEvidence } from "./schematic-layout-batch.ts";

type Point = readonly [number, number];
export interface SchematicLayoutVisibilityRepairLabel {
  readonly stepId: string;
  readonly attributeId: string;
  readonly wireId: string;
  readonly net: string;
  readonly portId: string;
  readonly pinId: string;
  readonly beforePoint: Point;
  readonly afterPoint: Point;
  readonly created?: { readonly labelStepId: string; readonly wireStepId: string };
}
export interface SchematicLayoutVisibilityRepairDescriptor {
  readonly profile: "easyeda-pro-control.schematic-layout-visibility-repair.v1";
  readonly operationSha256: string;
  readonly beforeSourceSha256: string;
  readonly beforeNativeSha256: string;
  readonly intendedSourceSha256: string;
  readonly currentSourceSha256: string;
  readonly currentNativeSha256: string;
  readonly correctedSourceSha256: string;
  readonly correctedNativeSha256: string;
  readonly labels: readonly SchematicLayoutVisibilityRepairLabel[];
}
const same = (a: unknown, b: unknown): boolean => canonicalJson(a) === canonicalJson(b);
function fail(): never { throw new Error("Deferred wire-label repair is outside the exact moved-port visibility profile."); }
function point(model: { readonly body: Readonly<Record<string, unknown>> }): Point {
  const x = model.body["x"], y = model.body["y"];
  if (typeof x !== "number" || !Number.isFinite(x) || typeof y !== "number" || !Number.isFinite(y)) { return fail(); }
  return [x, y];
}
function segment(row: NativeSourceObject): readonly [number, number, number, number] {
  const values = [row.body["startX"], row.body["startY"], row.body["endX"], row.body["endY"]];
  if (!values.every((value): value is number => typeof value === "number" && Number.isFinite(value))) { return fail(); }
  return [values[0] ?? fail(), values[1] ?? fail(), values[2] ?? fail(), values[3] ?? fail()];
}
function touchingGroups(source: NativeSourceSnapshot, at: Point, endpointsOnly: boolean): string[] {
  const wires = new Set(source.objects.filter((row) => row.type === "WIRE").map((row) => row.id));
  const groups = new Set<string>();
  for (const row of source.objects.filter((entry) => entry.type === "LINE" && wires.has(String(entry.body["lineGroup"])))) {
    const [x1, y1, x2, y2] = segment(row);
    const endpoint = at[0] === x1 && at[1] === y1 || at[0] === x2 && at[1] === y2;
    const onLine = (at[0] - x1) * (y2 - y1) === (at[1] - y1) * (x2 - x1) &&
      at[0] >= Math.min(x1, x2) && at[0] <= Math.max(x1, x2) && at[1] >= Math.min(y1, y2) && at[1] <= Math.max(y1, y2);
    if (endpoint || !endpointsOnly && onLine) { groups.add(String(row.body["lineGroup"])); }
  }
  return [...groups].toSorted();
}
function namedPort(model: SchematicNativeComponent, net: string): boolean {
  const names = model.attributes.filter((attribute) => attribute.key === "Name");
  return model.kind === "netport" && model.pins.length === 1 && names.length === 1 && names[0]?.value === net && names[0].body["value"] === net;
}
function encode(source: NativeSourceSnapshot): string {
  return `{"type":"DOCHEAD"}||${JSON.stringify(source.document)}|\n${source.objects.map((row) => `${JSON.stringify({ type: row.type, id: row.id })}||${JSON.stringify(row.body)}`).join("|\n")}|\n`;
}

/** Pure proof for an original journal's failed apply, never a success profile.
 * Pinned SCH 3.2.149.35ae2987 commitForApplySourceCode corrects hidden NETs using
 * netGroupConnectedMap before the outer action's onDidTransact bbox refresh.
 * A moved port can therefore be absent from that cached map even though its new
 * pin is exactly attached. Only the requested, deferred false writes are fixed.
 * The caller must separately prove original dispatch, one-shot authority, exact
 * original topology and the complete durable delta before any repair dispatch.
 */
export function prepareSchematicLayoutVisibilityRepair(input: unknown, before: NativeSourceSnapshot, oldNative: unknown,
  createdIds: SchematicLayoutCreatedIds, evidence: SchematicLayoutEvidence, currentSource: NativeSourceSnapshot, currentNative: unknown): {
    readonly profile: SchematicLayoutVisibilityRepairDescriptor["profile"];
    readonly code: string;
    readonly currentSourceSha256: string;
    readonly currentNativeSha256: string;
    readonly correctedSourceSha256: string;
    readonly expectedSource: NativeSourceSnapshot;
    readonly correctedSource: NativeSourceSnapshot;
    readonly correctedNative: SchematicNativeSnapshot;
    readonly descriptor: SchematicLayoutVisibilityRepairDescriptor;
  } {
  const operation = schematicLayoutBatchSchema.parse(input);
  const original = correlateSchematicNativeSource(before, oldNative);
  const actual = correlateSchematicNativeSource(currentSource, currentNative);
  const intended = expectedSchematicLayout(operation, before, original, createdIds, evidence);
  const records = new Map(currentSource.objects.map((row) => [row.id, structuredClone(row)]));
  const originalRecords = new Map(before.objects.map((row) => [row.id, row]));
  const intendedRecords = new Map(intended.expected.objects.map((row) => [row.id, row]));
  const moved = new Set(operation.operations.filter((step) => step.action === "sch.component.translate").map((step) => "primitiveId" in step.target ? step.target.primitiveId : ""));
  const labels: SchematicLayoutVisibilityRepairLabel[] = [];
  const requests = operation.operations.filter((step) => step.action === "sch.attribute.display" || step.action === "sch.net-label.display").filter((step) =>
    step.patch.valueVisible === false && (step.action === "sch.net-label.display" ||
      "primitiveId" in step.target && originalRecords.get(step.target.primitiveId)?.body["key"] === "NET"));
  for (const step of requests) {
    const id = "primitiveId" in step.target ? step.target.primitiveId : createdIds[step.target.resultOf];
    if (id === undefined) { return fail(); }
    const prior = originalRecords.get(id); const expected = intendedRecords.get(id); const current = records.get(id);
    if (expected === undefined) { return fail(); }
    let created: SchematicLayoutVisibilityRepairLabel["created"];
    if (step.action === "sch.attribute.display") {
      if (!("primitiveId" in step.target) || prior?.type !== "ATTR" || prior.body["key"] !== "NET" ||
          !same(Object.keys(step.patch), ["valueVisible"]) || originalRecords.get(String(prior.body["parentId"]))?.type !== "WIRE" ||
          prior.body["valueVisible"] !== true || prior.body["locked"] !== false ||
          expected?.body["parentId"] !== prior.body["parentId"] || expected.body["value"] !== prior.body["value"]) { return fail(); }
    } else {
      if (!("resultOf" in step.target) || prior !== undefined || !/^[a-f0-9]{16}$/u.test(id)) { return fail(); }
      const creatorId = step.target.resultOf;
      const creator = operation.operations.find((candidate) => candidate.id === creatorId);
      const bindings = intended.labelBindings.filter((binding) => binding.id === id);
      const binding = bindings[0];
      const wireCreators = operation.operations.filter((candidate) => candidate.action === "sch.wire.create" && createdIds[candidate.id] === binding?.wireId);
      const wireCreator = wireCreators[0];
      const displays = operation.operations.filter((candidate) => candidate.action === "sch.net-label.display" &&
        ("resultOf" in candidate.target ? candidate.target.resultOf === creatorId : candidate.target.primitiveId === id));
      if (creator?.action !== "sch.net-label.create" || createdIds[creator.id] !== id || bindings.length !== 1 || binding === undefined ||
          wireCreators.length !== 1 || wireCreator === undefined || !/^[a-f0-9]{16}$/u.test(binding.wireId) || originalRecords.has(binding.wireId) ||
          intendedRecords.get(binding.wireId)?.type !== "WIRE" || records.get(binding.wireId)?.type !== "WIRE" || displays.length !== 1 ||
          operation.operations.indexOf(wireCreator) >= operation.operations.indexOf(creator) || operation.operations.indexOf(creator) >= operation.operations.indexOf(step) ||
          binding.net !== creator.properties.net || binding.x !== creator.properties.x || binding.y !== -creator.properties.y ||
          expected?.body["parentId"] !== binding.wireId || expected.body["value"] !== binding.net) { return fail(); }
      created = { labelStepId: creator.id, wireStepId: wireCreator.id };
    }
    const wireId = expected?.body["parentId"]; const net = expected?.body["value"];
    if (expected?.type !== "ATTR" || expected.body["key"] !== "NET" || expected.body["locked"] !== false ||
        typeof wireId !== "string" || typeof net !== "string" || !net || expected.body["valueVisible"] !== false ||
        current?.body["valueVisible"] !== true || !same({ ...current, body: { ...current.body, valueVisible: false } }, expected) ||
        labels.some((label) => label.attributeId === id)) { return fail(); }
    const matches = intended.native.components.filter((model) => {
      if (!moved.has(model.id) || !namedPort(model, net)) { return false; }
      const at = point(model.pins[0] ?? fail());
      return same(touchingGroups(intended.expected, at, true), [wireId]);
    });
    if (matches.length !== 1) { return fail(); }
    const port = matches[0] ?? fail(); const pin = port.pins[0] ?? fail();
    const oldPort = original.components.find((model) => model.id === port.id);
    const oldPin = oldPort?.pins.find((candidate) => candidate.id === pin.id);
    if (oldPort === undefined || oldPin === undefined || !namedPort(oldPort, net) || pin.net !== net || oldPin.net !== net ||
      pin.noConnect?.value === "yes" || oldPin.noConnect?.value === "yes" || same(point(oldPin), point(pin)) ||
      touchingGroups(before, point(oldPin), true).includes(wireId) || !same(touchingGroups(intended.expected, point(pin), false), [wireId])) { return fail(); }
    labels.push({ stepId: step.id, attributeId: id, wireId, net, portId: port.id, pinId: pin.id, beforePoint: point(oldPin), afterPoint: point(pin),
      ...(created === undefined ? {} : { created }) });
    current.body["valueVisible"] = false;
  }
  if (labels.length === 0) { return fail(); }
  const semantic = { schema: currentSource.schema, document: currentSource.document, objects: [...records.values()].toSorted((a, b) => a.id.localeCompare(b.id)) };
  const correctedSource = { ...semantic, sha256: sha256Json(semantic) };
  const correctedNative = structuredClone(actual);
  correctedNative.source = encode(correctedSource);
  // The ordinary verifier must prove ALL original intent after those exact flips.
  // In particular no visibility, geometry, name, parent, style or pin exception
  // Is made here, and retained-wire order remains the ordinary exact profile.
  verifySchematicLayoutEffect(operation, before, correctedSource, original, correctedNative, createdIds, evidence, true);
  const repair = { id: "retained-wire-label-visibility-correction", action: "sch.layout.batch", documentType: 1,
    operations: labels.map((label) => ({ id: `hide:${label.stepId}`, action: "sch.attribute.display", target: { primitiveId: label.attributeId }, patch: { valueVisible: false } })) };
  const adapter = buildSchematicLayoutAdapter(repair, currentSource, actual, {});
  if (!same(adapter.expected, correctedSource)) { throw new Error("Deferred visibility-only adapter exceeds the exact correction."); }
  const descriptor: SchematicLayoutVisibilityRepairDescriptor = {
    profile: "easyeda-pro-control.schematic-layout-visibility-repair.v1", operationSha256: sha256Json(operation),
    beforeSourceSha256: before.sha256, beforeNativeSha256: sha256Json(original), intendedSourceSha256: intended.expected.sha256,
    currentSourceSha256: currentSource.sha256, currentNativeSha256: sha256Json(actual),
    correctedSourceSha256: correctedSource.sha256, correctedNativeSha256: sha256Json(correctedNative), labels,
  };
  return { profile: descriptor.profile, code: adapter.code, currentSourceSha256: descriptor.currentSourceSha256,
    currentNativeSha256: descriptor.currentNativeSha256, correctedSourceSha256: descriptor.correctedSourceSha256,
    expectedSource: correctedSource, correctedSource, correctedNative, descriptor };
}

/** Diagnostic durable proof of the failed layout. Retained hide-only requests
 * are omitted; created-label display requests keep every other requested field
 * and substitute only the proven false-to-true result. This never fulfils intent
 * and the diagnostic batch must never be dispatched or sealed as a new plan.
 */
export function verifySchematicLayoutVisibilityRepairPersistence(operation: unknown,
  input: Parameters<typeof verifySchematicLayoutPersistence>[1], createdIds: SchematicLayoutCreatedIds, evidence: SchematicLayoutEvidence): {
    readonly profile: "easyeda-pro-control.schematic-layout-visibility-repair-persistence.v1";
    readonly originalIntentFulfilled: false;
    readonly descriptor: SchematicLayoutVisibilityRepairDescriptor;
    readonly persistence: Record<string, unknown>;
  } {
  const prepared = prepareSchematicLayoutVisibilityRepair(operation, input.expectedBefore, input.beforeNative, createdIds, evidence, input.expectedAfter, input.afterNative);
  const parsed = schematicLayoutBatchSchema.parse(operation);
  const omitted = new Set(prepared.descriptor.labels.filter((label) => label.created === undefined).map((label) => label.stepId));
  const created = new Set(prepared.descriptor.labels.filter((label) => label.created !== undefined).map((label) => label.stepId));
  const diagnostic = { ...parsed, operations: parsed.operations.filter((step) => !omitted.has(step.id)).map((step) => {
    if (!created.has(step.id)) { return step; }
    if (step.action !== "sch.net-label.display" || step.patch.valueVisible !== false) { return fail(); }
    return Object.assign(structuredClone(step), { patch: { ...step.patch, valueVisible: true } });
  }) };
  const persistence = verifySchematicLayoutPersistence(diagnostic, input, createdIds, evidence);
  return { profile: "easyeda-pro-control.schematic-layout-visibility-repair-persistence.v1", originalIntentFulfilled: false, descriptor: prepared.descriptor, persistence };
}
