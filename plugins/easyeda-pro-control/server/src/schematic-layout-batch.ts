/* oxlint-disable import/max-dependencies -- Layout composes separate exact source, native, electrical, storage and derived wire-order proofs. */
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { schematicLayoutBatchSchema, schematicLayoutStepSchema } from "./schematic-layout-schema.ts";
import type { SchematicLayoutBatch, SchematicLayoutStep as Step } from "./schematic-layout-schema.ts";
import { canonicalJson, sha256Json } from "./core.ts";
import { compareDocumentSources } from "./document-source.ts";
import type { NativeSourceDelta, NativeSourceObject, NativeSourceSnapshot } from "./document-source.ts";
import { SCHEMATIC_NATIVE_READER_CODE } from "./schematic-native-adapter.ts";
import type { SchematicNativeComponent, SchematicNativeSnapshot } from "./schematic-native-adapter.ts";
import { correlateSchematicNativeSource } from "./schematic-source-proof.ts";
import { verifySchematicLifecycleEquivalence } from "./schematic-lifecycle.ts";
import { alignSchematicNetFlagCloneLifecycle, planHistoricalSchematicNetFlagClone, planSchematicNetFlagClone, verifySchematicNetFlagClone } from "./schematic-layout-netflag.ts";
import type { SchematicNetFlagCloneDescriptor } from "./schematic-layout-netflag.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { verifySchematicStorageBaseline, verifySchematicStoragePersistence } from "./schematic-storage-persistence.ts";
import { verifyDesignBaseline } from "./design-persistence.ts";
import { schematicNewWireOrders } from "./schematic-wire-order.ts";
import { retainedWireAttributeOrders, schematicRetainedWireOrders } from "./schematic-retained-wire-order.ts";
import type { SchematicLayoutConstructorWitness } from "./schematic-layout-constructor-witness.ts";
import { bindSchematicWireLabels } from "./schematic-layout-net-label.ts";
import type { SchematicWireLabelBinding } from "./schematic-layout-net-label.ts";
import { alignSchematicCoordinateLifecycle, projectSchematicCoordinateCheckpoint, restoreComposedCoordinateStorage, verifyInactiveNoConnectWrites } from "./schematic-coordinate-lifecycle.ts";
import { verifyStoredPinNumberWrites } from "./schematic-pin-number-coordinates.ts";
import { deriveSchematicWireGroupRepair, schematicWireGroupRepairDescriptorSchema, verifySchematicFlagWireGroups } from "./schematic-layout-wire-groups.ts";
import type { SchematicWireGroupRepairDescriptor } from "./schematic-layout-wire-groups.ts";
import { buildSchematicLayoutPayloadCode } from "./schematic-layout-transport.ts";
import { yieldProofEventLoop } from "./cooperative-proof.ts";
import { assertFlatDisplayRuntimeAction, buildFlatDisplayRuntimeGuard } from "./flat-display-runtime.ts";
import type { FlatDisplayRuntimeGuard } from "./flat-display-runtime.ts";

export { schematicLayoutBatchSchema, schematicLayoutStepSchema } from "./schematic-layout-schema.ts";
export type { SchematicLayoutBatch } from "./schematic-layout-schema.ts";

export const SCHEMATIC_LAYOUT_PROFILE = "easyeda-pro-control.schematic-layout-batch.v1";

/** New-layout preflight uses the same exact coordinate spelling proof as
 * persistence. Validate the raw checkpoint first, then project comparison
 * copies only; the original source, checkpoint and intended targets remain
 * unchanged and their hashes stay in the retained pre-dispatch evidence.
 */
export function verifySchematicLayoutBaseline(input: Parameters<typeof verifySchematicStorageBaseline>[0]): Record<string, unknown> {
  verifyDesignBaseline({ checkpoint: input.checkpoint, source: input.source, targets: [] });
  const coordinates = projectSchematicCoordinateCheckpoint(input.checkpoint, input.source, input.native);
  const comparison = verifySchematicStorageBaseline({ ...input, checkpoint: coordinates.checkpoint });
  const scope = { checkpointSha256: input.checkpoint.checkpointSha256, checkpointSemanticSha256: input.checkpoint.semanticSha256,
    sourceSha256: input.source.sha256, coordinateProof: coordinates.proof, comparison };
  return { ok: true, schema: "easyeda-pro-control.schematic-layout-baseline.v1", targetUuid: input.source.document["uuid"],
    scope: "selected-target-fields-not-whole-editor-cleanliness", ...scope, scopeSha256: sha256Json(scope) };
}

export async function verifySchematicLayoutBaselineCooperatively(input: Parameters<typeof verifySchematicStorageBaseline>[0]): Promise<Record<string, unknown>> {
  const captured = structuredClone(input);
  verifyDesignBaseline({ checkpoint: captured.checkpoint, source: captured.source, targets: [] });
  await yieldProofEventLoop();
  const coordinates = projectSchematicCoordinateCheckpoint(captured.checkpoint, captured.source, captured.native);
  await yieldProofEventLoop();
  const comparison = verifySchematicStorageBaseline({ ...captured, checkpoint: coordinates.checkpoint });
  const scope = { checkpointSha256: captured.checkpoint.checkpointSha256, checkpointSemanticSha256: captured.checkpoint.semanticSha256,
    sourceSha256: captured.source.sha256, coordinateProof: coordinates.proof, comparison };
  const proof = { ok: true, schema: "easyeda-pro-control.schematic-layout-baseline.v1", targetUuid: captured.source.document["uuid"],
    scope: "selected-target-fields-not-whole-editor-cleanliness", ...scope, scopeSha256: sha256Json(scope) };
  await yieldProofEventLoop();
  return proof;
}

type Body = Record<string, unknown>;
const nativeBodySchema = z.record(z.string(), z.json());
function nativeBody(body: Body): SchematicNativeComponent["body"] { return nativeBodySchema.parse(body); }
type Segment = readonly [number, number, number, number];
export type SchematicLayoutCreatedIds = Readonly<Record<string, string>>;
export interface SchematicLayoutEvidence { readonly history: NativeHistorySnapshot; readonly templates: Readonly<Record<string, SchematicNativeSnapshot>>; readonly wireGroupRepair?: SchematicWireGroupRepairDescriptor; readonly constructorWitness?: SchematicLayoutConstructorWitness }
export interface CompiledSchematicLayoutBatch {
  readonly profile: typeof SCHEMATIC_LAYOUT_PROFILE; readonly id: string; readonly action: "sch.layout.batch";
  readonly documentType: 1; readonly resultKind: "boolean"; readonly operation: SchematicLayoutBatch;
}
export function compileSchematicLayoutBatch(input: unknown): CompiledSchematicLayoutBatch {
  const operation = schematicLayoutBatchSchema.parse(input);
  return { profile: SCHEMATIC_LAYOUT_PROFILE, id: operation.id, action: operation.action, documentType: 1, resultKind: "boolean", operation };
}
const DISPLAY_FIELDS: Readonly<Record<string, string>> = { x: "x", y: "y", rotation: "rotation", fontName: "fontFamily", fontSize: "fontSize", bold: "fontWeight", italic: "italic", underLine: "underline", alignMode: "align", keyVisible: "keyVisible", valueVisible: "valueVisible" };
const ALIGN = ["", "LEFT_TOP", "LEFT_MIDDLE", "LEFT_BOTTOM", "CENTER_TOP", "CENTER_MIDDLE", "CENTER_BOTTOM", "RIGHT_TOP", "RIGHT_MIDDLE", "RIGHT_BOTTOM"];
const STROKE = ["SOLID", "SHORT_DASH", "DOT", "DOT_DASH"];
const same = (left: unknown, right: unknown): boolean => canonicalJson(left) === canonicalJson(right);
function number(value: unknown): number { if (typeof value !== "number" || !Number.isFinite(value)) { throw new TypeError("Layout coordinate is not finite."); } return value; }
function snapshot(before: NativeSourceSnapshot, records: ReadonlyMap<string, NativeSourceObject>): NativeSourceSnapshot {
  const value = { schema: before.schema, document: before.document, objects: structuredClone([...records.values()]).toSorted((a, b) => a.id.localeCompare(b.id)) };
  return { ...value, sha256: sha256Json(value) };
}
function encode(source: NativeSourceSnapshot): string {
  const rows = [`{"type":"DOCHEAD"}||${JSON.stringify(source.document)}`, ...source.objects.map((record, index) => `${JSON.stringify({ type: record.type, id: record.id, ticket: index + 1 })}||${JSON.stringify(record.body)}`)];
  return `${rows.join("|\n")}|\n`;
}
function translated(body: Body, dx: number, dy: number): Body {
  const result = { ...body };
  for (const [key, delta] of [["x", dx], ["y", dy]] as const) {
    if (result[key] !== null && result[key] !== undefined) { result[key] = number(result[key]) + delta; }
  }
  return result;
}
function display(body: Body, patch: Extract<Step, { patch: unknown }>["patch"]): Body {
  const result = { ...body };
  for (const [key, value] of Object.entries(patch)) {
    const field = DISPLAY_FIELDS[key];
    if (field === undefined) { throw new Error("Unreviewed layout display field."); }
    let mapped: unknown = value;
    if (key === "y" && value !== null) { mapped = -number(value); }
    if (key === "alignMode" && value !== null) { mapped = ALIGN[number(value)]; }
    if (mapped === undefined) { throw new Error("Unreviewed layout display enumeration."); }
    result[field] = mapped;
  }
  if ((result["x"] === null) !== (result["y"] === null)) { throw new Error("Displayed attributes need either two coordinates or two null positions."); }
  return result;
}
function segments(value: Extract<Step, { action: "sch.wire.create" }>["properties"]["line"]): Segment[] {
  const groups = typeof value[0] === "number" ? [value] : value;
  const result: Segment[] = [];
  for (const group of groups) {
    if (!Array.isArray(group)) { throw new TypeError("Layout wire path is malformed."); }
    for (let i = 0; i < group.length - 2; i += 2) {
      const part = [number(group[i]), -number(group[i + 1]), number(group[i + 2]), -number(group[i + 3])] as const;
      if ((part[0] === part[2]) === (part[1] === part[3])) { throw new Error("Layout wires must be nonzero orthogonal segments with explicit vertices."); }
      result.push(part);
    }
  }
  if (result.length === 0 || result.length > 2048) { throw new Error("Layout wire segment count exceeds its bound."); }
  return result;
}
function owned(records: ReadonlyMap<string, NativeSourceObject>, id: string): NativeSourceObject[] {
  return [...records.values()].filter((record) => record.id === id || record.body["parentId"] === id || record.body["lineGroup"] === id);
}
function protectedIds(source: NativeSourceSnapshot, native: SchematicNativeSnapshot): Set<string> {
  const locked = new Set(source.objects.filter((record) => record.body["locked"] === true).map((record) => record.id));
  for (const component of native.components) {
    if (component.locked) { locked.add(component.id); }
    for (const pin of component.pins) { if (pin.body["locked"] === true) { locked.add(pin.id); } }
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (const record of source.objects) {
      if (!locked.has(record.id) && [record.body["parentId"], record.body["lineGroup"], record.body["groupId"]].some((parent) => typeof parent === "string" && locked.has(parent))) {
        locked.add(record.id); changed = true;
      }
    }
  }
  return locked;
}
function nextZ(records: ReadonlyMap<string, NativeSourceObject>): number {
  let result = 0;
  for (const record of records.values()) {
    if (record.body["zIndex"] !== undefined) {
      const value = number(record.body["zIndex"]);
      if (value < 0) { throw new Error("Layout z-order is negative."); }
      result = Math.max(result, value);
    }
  }
  if (!Number.isSafeInteger(Math.floor(result) + 1)) { throw new TypeError("Layout z-order exhausted."); }
  return Math.floor(result) + 1;
}
function updateStoredBody(records: Map<string, NativeSourceObject>, id: string, body: Body): void {
  const previous = records.get(id);
  if (previous !== undefined) { records.set(id, { ...previous, body: structuredClone(body) }); }
}
function translateOwnedBody(records: Map<string, NativeSourceObject>, id: string, body: Body, dx: number, dy: number): SchematicNativeComponent["body"] {
  const stored = records.get(id);
  if (stored !== undefined && !same(stored.body, body)) { throw new Error("Stored pin/attribute/no-connect body disagrees with its exact native owner."); }
  const moved = nativeBody(translated(body, dx, dy));
  updateStoredBody(records, id, moved);
  return moved;
}
function inverseDisplay(step: Extract<Step, { patch: unknown }>, id: string, body: Body): Step | undefined {
  const patch: Body = {};
  for (const key of Object.keys(step.patch)) {
    const field = DISPLAY_FIELDS[key];
    if (field === undefined || !Object.hasOwn(body, field)) { return undefined; }
    let value = body[field];
    if (key === "y" && value !== null) { value = -number(value); }
    if (key === "alignMode" && value !== null) { value = typeof value === "string" ? ALIGN.indexOf(value) : -1; }
    patch[key] = value;
  }
  const parsed = schematicLayoutStepSchema.safeParse({ id: `inverse:${step.id}`, action: step.action, target: { primitiveId: id }, patch });
  return parsed.success ? parsed.data : undefined;
}
function lineStyle(record: NativeSourceObject): Body {
  return Object.fromEntries(Object.entries(record.body).filter(([key]) => !["startX", "startY", "endX", "endY", "lineGroup"].includes(key)));
}
function replacementStyle(lines: readonly NativeSourceObject[]): Body {
  const first = lines[0];
  if (first === undefined) { throw new Error("Layout wire replacement requires at least one existing segment."); }
  const style = lineStyle(first);
  if (Object.keys(style).some((key) => !["fillColor", "fillStyle", "strokeColor", "strokeWidth", "strokeStyle"].includes(key)) ||
      style["fillColor"] !== null || style["fillStyle"] !== null || lines.some((record) => !same(lineStyle(record), style))) {
    throw new Error("Layout wire replacement requires a reviewed uniform segment style.");
  }
  return style;
}
type Point = readonly [number, number];
function onSegment(point: Point, segment: Segment): boolean {
  return (point[0] - segment[0]) * (segment[3] - segment[1]) === (point[1] - segment[1]) * (segment[2] - segment[0]) &&
    point[0] >= Math.min(segment[0], segment[2]) && point[0] <= Math.max(segment[0], segment[2]) &&
    point[1] >= Math.min(segment[1], segment[3]) && point[1] <= Math.max(segment[1], segment[3]);
}
function wireReachesAnchor(start: Point, anchors: readonly Point[], graphSegments: readonly Segment[], endpoints: readonly Point[]): boolean {
  const lines = new Set<number>(), pending: Point[] = [start], visited = new Set<string>();
  while (pending.length > 0) {
    const point = pending.pop(); if (point === undefined) { break; }
    const key = canonicalJson(point);
    if (!visited.has(key)) {
      visited.add(key);
      if (anchors.some((anchor) => anchor[0] === point[0] && anchor[1] === point[1])) { return true; }
      const candidates = [...graphSegments.entries()].filter(([index, segment]) => !lines.has(index) && onSegment(point, segment));
      for (const [index, segment] of candidates) {
        lines.add(index);
        if (anchors.some((anchor) => onSegment(anchor, segment))) { return true; }
        pending.push(...endpoints.filter((endpoint) => onSegment(endpoint, segment)));
      }
    }
  }
  return false;
}
interface Simulation {
  readonly expected: NativeSourceSnapshot; readonly native: SchematicNativeSnapshot; readonly createdIds: SchematicLayoutCreatedIds;
  readonly steps: readonly { id: string; action: string; beforeSha256: string; afterSha256: string; delta: NativeSourceDelta }[];
  readonly inverse: SchematicLayoutBatch | undefined;
  readonly netFlags: readonly SchematicNetFlagCloneDescriptor[];
  readonly wireOrders: ReturnType<typeof schematicNewWireOrders>;
  readonly retainedWireOrders: ReturnType<typeof schematicRetainedWireOrders>;
  readonly labelBindings: readonly SchematicWireLabelBinding[];
}
/** Historical readback only. The pinned NetGroup sorter places lines, derived
 * junctions, dangling dots, custom attributes and NET names in this order.
 * Restrict recovery to integral orthogonal endpoint graphs without buses,
 * dangling ends or other pre-existing groups sharing the replaced group.
 */
function historicalWireOrders(operation: SchematicLayoutBatch, before: NativeSourceSnapshot, records: Map<string, NativeSourceObject>, native: SchematicNativeSnapshot): void {
  const replacements = operation.operations.filter((step) => step.action === "sch.wire.replace");
  if (replacements.length > 1 || [...records.values()].some((row) => ["BUS", "BUSENTRY"].includes(row.type))) { throw new Error("Historical layout wire-order scope is unsupported."); }
  for (const step of replacements) {
    if (!("primitiveId" in step.target)) { throw new Error("Historical wire replacement needs its original identity."); }
    const id = step.target.primitiveId;
    const wires = [...records.values()].filter((row) => row.type === "WIRE");
    const wireIds = new Set(wires.map((row) => row.id));
    const lines = [...records.values()].filter((row) => row.type === "LINE" && wireIds.has(String(row.body["lineGroup"])));
    const endpoints = new Map<string, { wires: NativeSourceObject[]; pins: number }>();
    const point = (x: unknown, y: unknown): { wires: NativeSourceObject[]; pins: number } => {
      if (!Number.isSafeInteger(number(x)) || !Number.isSafeInteger(number(y))) { throw new TypeError("Historical wire-order graph requires exact integer coordinates."); }
      const key = canonicalJson([x, y]); const result = endpoints.get(key) ?? { wires: [], pins: 0 }; endpoints.set(key, result); return result;
    };
    for (const row of lines) {
      if ((row.body["startX"] === row.body["endX"]) === (row.body["startY"] === row.body["endY"])) { throw new Error("Historical wire-order graph needs nonzero orthogonal segments."); }
      point(row.body["startX"], row.body["startY"]).wires.push(row);
      point(row.body["endX"], row.body["endY"]).wires.push(row);
    }
    for (const pin of native.components.flatMap((model) => model.pins)) { point(pin.body["x"], pin.body["y"]).pins += 1; }
    let junctions = 0;
    for (const entry of endpoints.values()) {
      if (entry.wires.some((row) => row.body["lineGroup"] === id)) {
        if (entry.wires.length + entry.pins === 1 || entry.wires.some((row) => row.body["lineGroup"] !== id && before.objects.some((old) => old.id === row.body["lineGroup"]))) { throw new Error("Historical wire-order graph has an unsupported dangling or existing-group connection."); }
        if ((entry.pins >= 2 && entry.wires.length > 0) || (entry.pins === 1 && entry.wires.length >= 2) || (entry.pins === 0 && entry.wires.length >= 3)) { junctions += 1; }
      }
    }
    const attrs = [...records.values()].filter((row) => row.type === "ATTR" && row.body["parentId"] === id);
    const nets = attrs.filter((row) => row.body["key"] === "NET"), relevance = attrs.filter((row) => row.body["key"] === "Relevance");
    if (attrs.length !== 2 || relevance.length !== 1 || nets.length !== 1 || relevance[0]?.body["value"] !== "[]") { throw new Error("Historical wire-order attributes are outside the reviewed profile."); }
    const offset = lines.filter((row) => row.body["lineGroup"] === id).length + junctions;
    for (const [index, row] of [...relevance, ...nets].entries()) { records.set(row.id, { ...row, body: { ...row.body, zIndex: offset + index } }); }
  }
}
function historicalWireRelevance(source: NativeSourceSnapshot, parentId: string, used: Set<string>): string {
  const found = source.objects.filter((row) => row.type === "ATTR" && row.body["parentId"] === parentId && row.body["key"] === "Relevance");
  if (found.length !== 1 || found[0] === undefined || !/^[a-f0-9]{16}$/u.test(found[0].id) || used.has(found[0].id)) { throw new Error("Historical wire Relevance identity is absent, ambiguous or reused."); }
  used.add(found[0].id); return found[0].id;
}
// Both drains execute the same state machine; yields expose no mutable state.
// Every step, snapshot, identity check and finalization phase stays intact.
function* simulateSteps(input: unknown, before: NativeSourceSnapshot, nativeInput: unknown, providedIds?: SchematicLayoutCreatedIds, evidence?: SchematicLayoutEvidence, historicalSource?: NativeSourceSnapshot, legacyStandaloneLabels = false, legacyFlagGroups = false): Generator<void, Simulation, void> {
  const operation = schematicLayoutBatchSchema.parse(input);
  if (historicalSource === undefined && operation.operations.some((step) => step.action === "sch.wire.replace")) { throw new Error("Layout wire replacement lacks a complete native child-order profile; use explicit delete/create with unchanged compiled topology."); }
  const native = structuredClone(correlateSchematicNativeSource(before, nativeInput));
  if (before.document["editVersion"] !== "3.2.149.88089769") { throw new Error("Layout requires the reviewed native schematic encoder."); }
  const records = new Map(before.objects.map((record) => [record.id, structuredClone(record)]));
  const locked = protectedIds(before, native);
  const allocated = new Map<string, string>(), used = new Set(before.objects.map((record) => record.id));
  const created = new Map<string, string>();
  const createdWires = new Map<string, string>();
  const netFlags: SchematicNetFlagCloneDescriptor[] = [];
  const steps: { id: string; action: string; beforeSha256: string; afterSha256: string; delta: NativeSourceDelta }[] = [];
  let inverseSteps: Step[] | undefined = [];
  const allocate = (key: string): string => {
    const value = providedIds === undefined ? randomBytes(8).toString("hex") : providedIds[key];
    if (allocated.has(key) || typeof value !== "string" || !/^[a-f0-9]{16}$/u.test(value) || used.has(value)) { throw new Error("Layout creation identity is missing, reused or collides with an existing record."); }
    used.add(value); allocated.set(key, value); return value;
  };
  const targetId = (step: Extract<Step, { target: unknown }>): string => {
    const value = "primitiveId" in step.target ? step.target.primitiveId : created.get(step.target.resultOf);
    if (value === undefined || !records.has(value) || locked.has(value)) { throw new Error("Layout target is absent, unresolved or initially locked."); }
    return value;
  };
  let current = before;
  yield;
  for (const step of operation.operations) {
    if (step.action === "sch.net-flag.clone") {
      if (evidence === undefined) { throw new Error("Net-flag cloning requires authenticated loaded-template and checkpoint evidence."); }
      const template = evidence.templates[step.template.sheetUuid];
      if (template === undefined) { throw new Error("The exact net-flag template sheet is not in the retained evidence."); }
      const planned = historicalSource === undefined ? planSchematicNetFlagClone(step, current, evidence.history, template, allocate) :
        planHistoricalSchematicNetFlagClone(step, current, evidence.history, template, allocate, historicalSource);
      for (const record of planned.records) { if (records.has(record.id)) { throw new Error("Net-flag addition collides with an existing record."); } records.set(record.id, structuredClone(record)); }
      native.components.push(planned.component); native.components.sort((a, b) => a.id.localeCompare(b.id));
      netFlags.push(planned.descriptor); inverseSteps = undefined;
    } else if (step.action === "sch.component.translate") {
      const id = targetId(step), record = records.get(id);
      const component = native.components.find((model) => model.id === id);
      if (record?.type !== "COMPONENT" || component === undefined || !["part", "netport", "netflag"].includes(component.kind) || component.locked ||
          component.attributes.some((attribute) => attribute.body["locked"] === true) ||
          component.pins.some((pin) => pin.body["locked"] === true || pin.noConnect?.body["locked"] === true || pin.attributes.some((attribute) => attribute.body["locked"] === true))) { throw new Error("Layout translation requires one unlocked part/netport/netflag and unlocked descendants, never a frame."); }
      inverseSteps?.push({ id: `inverse:${step.id}`, action: step.action, target: { primitiveId: id }, x: number(record.body["x"]), y: -number(record.body["y"]) });
      const dx = step.x - number(record.body["x"]), dy = -step.y - number(record.body["y"]);
      component.body = nativeBody(translated(component.body, dx, dy)); records.set(id, { ...record, body: structuredClone(component.body) });
      const children = [...component.attributes, ...component.pins.flatMap((pin) => pin.attributes)];
      for (const attribute of children) {
        attribute.body = translateOwnedBody(records, attribute.id, attribute.body, dx, dy);
      }
      for (const pin of component.pins) {
        pin.body = translateOwnedBody(records, pin.id, pin.body, dx, dy);
        if (pin.noConnect !== null) {
          pin.noConnect.body = translateOwnedBody(records, pin.noConnect.id, pin.noConnect.body, dx, dy);
        }
      }
    } else if (step.action === "sch.attribute.display" || step.action === "sch.net-label.display" || step.action === "sch.text.display") {
      const id = targetId(step), record = records.get(id);
      const requiredType = step.action === "sch.text.display" ? "TEXT" : "ATTR";
      if (record?.type !== requiredType || record.body["key"] === "NO_CONNECT") { throw new Error("Layout display needs a stored drawing attribute/text, not a no-connect marker."); }
      if (step.action === "sch.net-label.display" && (record.body["key"] !== "_NETLABEL_" || record.body["parentId"] !== "$$root")) { throw new Error("Layout net-label target is not a standalone label."); }
      const reverse = inverseDisplay(step, id, record.body);
      if (reverse === undefined) { inverseSteps = undefined; } else { inverseSteps?.push(reverse); }
      const body = display(record.body, step.patch);
      records.set(id, { ...record, body });
      const attributes = native.components.flatMap((component) => [...component.attributes, ...component.pins.flatMap((pin) => pin.attributes)]);
      for (const attribute of attributes.filter((entry) => entry.id === id)) { attribute.body = nativeBody(body); }
    } else if (step.action === "sch.net-label.create") {
      if (!native.components.some((component) => component.pins.some((pin) => pin.net === step.properties.net)) &&
          !before.objects.some((record) => record.type === "ATTR" && ["_NETLABEL_", "NET", "Global Net Name"].includes(String(record.body["key"])) && record.body["value"] === step.properties.net)) {
        throw new Error("Layout labels may name only an existing exact net.");
      }
      const id = allocate(step.id); created.set(step.id, id);
      inverseSteps?.push({ id: `inverse:${step.id}`, action: "sch.net-label.delete", target: { primitiveId: id } });
      records.set(id, { id, type: "ATTR", body: { x: step.properties.x, y: -step.properties.y, rotation: 0, color: null, fontFamily: null,
        fontSize: null, fontWeight: null, italic: null, underline: null, strikeout: null, align: "LEFT_BOTTOM", value: step.properties.net,
        keyVisible: false, valueVisible: true, key: "_NETLABEL_", fillColor: null, parentId: "$$root", zIndex: nextZ(records), locked: false } });
    } else if (step.action === "sch.net-label.delete" || step.action === "sch.text.delete") {
      const id = targetId(step), record = records.get(id);
      const matched = step.action === "sch.text.delete" ? record?.type === "TEXT" : record?.type === "ATTR" && record.body["key"] === "_NETLABEL_" && record.body["parentId"] === "$$root";
      if (!matched) { throw new Error("Layout can delete only an exact standalone net label or selected text."); }
      records.delete(id);
      inverseSteps = undefined;
    } else {
      const creating = step.action === "sch.wire.create";
      const id = creating ? allocate(step.id) : targetId(step);
      const children = creating ? [] : owned(records, id);
      const group = records.get(id);
      if (!creating && (group?.type !== "WIRE" || children.some((record) => !["WIRE", "LINE", "ATTR"].includes(record.type) || locked.has(record.id)))) { throw new Error("Layout wire group is missing, locked or has unknown children."); }
      if (step.action === "sch.wire.delete") { for (const record of children) { records.delete(record.id); } createdWires.delete(id); inverseSteps = undefined; }
      else {
        const oldLines = children.filter((record) => record.type === "LINE").toSorted((a, b) => a.id.localeCompare(b.id));
        const paths = segments(creating ? step.properties.line : step.line);
        let style: Body;
        if (creating) {
          inverseSteps?.push({ id: `inverse:${step.id}`, action: "sch.wire.delete", target: { primitiveId: id } });
          created.set(step.id, id);
          records.set(id, { id, type: "WIRE", body: { zIndex: nextZ(records), locked: false } });
          // Native NetGroup constructs Relevance[] before its lines. Supply its
          // Exact stored identity instead of accepting an editor-generated ID.
          const relevanceId = historicalSource !== undefined && providedIds?.[`${step.id}:relevance`] === undefined ?
            historicalWireRelevance(historicalSource, id, used) : allocate(`${step.id}:relevance`);
          records.set(relevanceId, { id: relevanceId, type: "ATTR", body: { x: null, y: null, rotation: null, color: null,
            fontFamily: null, fontSize: null, fontWeight: null, italic: null, underline: null, align: null, value: "[]",
            keyVisible: null, valueVisible: null, key: "Relevance", fillColor: null, parentId: id, zIndex: 0 } });
          createdWires.set(id, relevanceId);
          style = { fillColor: null, fillStyle: null, strokeColor: step.properties.color,
            strokeWidth: step.properties.lineWidth, strokeStyle: step.properties.lineType === null ? null : STROKE[step.properties.lineType] };
        } else {
          style = replacementStyle(oldLines);
          const reverse: Step = { id: `inverse:${step.id}`, action: "sch.wire.replace", target: { primitiveId: id }, line: oldLines.map((record) => [number(record.body["startX"]), -number(record.body["startY"]), number(record.body["endX"]), -number(record.body["endY"])]) };
          inverseSteps = oldLines.length === paths.length && inverseSteps !== undefined ? [...inverseSteps, reverse] : undefined;
        }
        for (const record of oldLines) { records.delete(record.id); }
        for (const [index, segment] of paths.entries()) {
          const lineId = oldLines[index]?.id ?? allocate(`${step.id}:segment:${index}`);
          records.set(lineId, { id: lineId, type: "LINE", body: { ...style, startX: segment[0], startY: segment[1], endX: segment[2], endY: segment[3], lineGroup: id } });
        }
      }
    }
    const next = snapshot(before, records);
    for (const id of locked) {
      if (!same({ record: before.objects.find((record) => record.id === id) }, { record: records.get(id) })) { throw new Error("Layout changed an initially locked record or its child."); }
    }
    steps.push({ id: step.id, action: step.action, beforeSha256: current.sha256, afterSha256: next.sha256, delta: compareDocumentSources(current, next) });
    current = next;
    yield;
  }
  const retainedWireOrders = historicalSource === undefined ? schematicRetainedWireOrders(operation, before, records, correlateSchematicNativeSource(before, nativeInput), native, display, evidence) : [];
  for (const order of retainedWireOrders) {
    for (const { id, order: zIndex } of retainedWireAttributeOrders(order)) {
      const row = records.get(id);
      if (row === undefined) { throw new Error("Retained-wire order record is absent."); }
      if (locked.has(id) && row.body["zIndex"] !== zIndex) { throw new Error("Retained-wire order would change an initially locked child."); }
      records.set(id, { ...row, body: { ...row.body, zIndex } });
    }
  }
  yield;
  let wireOrders = schematicNewWireOrders(before, records, native, createdWires);
  for (const order of wireOrders) {
    const row = records.get(order.relevanceId);
    if (row === undefined) { throw new Error("New-wire order record is absent."); }
    records.set(row.id, { ...row, body: { ...row.body, zIndex: order.zIndex } });
  }
  yield;
  const labels = operation.operations.filter((step) => step.action === "sch.net-label.create").flatMap((step) => {
    const id = allocated.get(step.id);
    return id === undefined || !records.has(id) ? [] : [{ id, x: step.properties.x, y: -step.properties.y }];
  });
  const labelBindings = legacyStandaloneLabels || historicalSource !== undefined ? [] : bindSchematicWireLabels(records, labels, wireOrders);
  if (labelBindings.length > 0) { inverseSteps = undefined; }
  current = snapshot(before, records);
  yield;
  if (historicalSource !== undefined) {
    historicalWireOrders(operation, before, records, native);
    current = snapshot(before, records);
    inverseSteps = undefined;
  }
  yield;
  if (providedIds !== undefined && !same(Object.keys(providedIds).toSorted(), [...allocated.keys()].toSorted())) { throw new Error("Layout creation map contains unknown or missing identities."); }
  if (evidence?.wireGroupRepair !== undefined) {
    if (legacyFlagGroups || historicalSource !== undefined) { throw new Error("Ground repair evidence cannot be mixed with a legacy diagnostic mode."); }
    const repaired = deriveSchematicWireGroupRepair(operation, before, current, native, Object.fromEntries(allocated), netFlags);
    if (!same(repaired.descriptor, schematicWireGroupRepairDescriptorSchema.parse(evidence.wireGroupRepair))) { throw new Error("Ground repair descriptor differs from the sealed original operation and creation map."); }
    current = repaired.source;
    for (const merge of repaired.descriptor.merges) { createdWires.delete(merge.dropWireId); }
    wireOrders = schematicNewWireOrders(before, new Map(current.objects.map((row) => [row.id, row])), native, createdWires);
  }
  yield;
  native.source = encode(current);
  yield;
  if (!legacyFlagGroups) { verifySchematicFlagWireGroups(current, native, netFlags); }
  const inverse = inverseSteps === undefined ? undefined : schematicLayoutBatchSchema.parse({ id: `inverse:${operation.id}`, action: operation.action, documentType: 1, operations: inverseSteps.toReversed() });
  return { expected: current, native, createdIds: Object.freeze(Object.fromEntries(allocated)), steps, inverse, netFlags, wireOrders, retainedWireOrders, labelBindings };
}

function simulate(...args: Parameters<typeof simulateSteps>): Simulation {
  const steps = simulateSteps(...args);
  for (;;) {
    const result = steps.next();
    if (result.done === true) { return result.value; }
  }
}

async function drainSimulationCooperatively(steps: Generator<void, Simulation, void>): Promise<Simulation> {
  for (;;) {
    const result = steps.next();
    if (result.done === true) { return result.value; }
    await yieldProofEventLoop();
  }
}

export function expectedSchematicLayout(input: unknown, before: NativeSourceSnapshot, native: unknown, createdIds?: SchematicLayoutCreatedIds, evidence?: SchematicLayoutEvidence): Simulation {
  return simulate(input, before, native, createdIds, evidence);
}

export async function expectedSchematicLayoutCooperatively(input: unknown, before: NativeSourceSnapshot, native: unknown, createdIds?: SchematicLayoutCreatedIds, evidence?: SchematicLayoutEvidence): Promise<Simulation> {
  // Capture before the first await, not inside the lazily started generator.
  const captured = structuredClone({ input, before, native, createdIds, evidence });
  const result = await drainSimulationCooperatively(simulateSteps(captured.input, captured.before, captured.native, captured.createdIds, captured.evidence));
  return result;
}
/** Never called by preparation or a writer. Reconstruct the old typed intent
 * with its immutable creation map, then bind exact materialized identities to
 * a complete fresh source/native read. Unknown additions remain rejected.
 */
export function verifyHistoricalSchematicLayoutEffect(input: unknown, before: NativeSourceSnapshot, after: NativeSourceSnapshot, oldNative: unknown, newNative: unknown, createdIds: SchematicLayoutCreatedIds, evidence: SchematicLayoutEvidence): Record<string, unknown> {
  correlateSchematicNativeSource(after, newNative);
  const expected = simulate(input, before, oldNative, createdIds, evidence, after);
  const aligned = alignLayoutClones(expected, after, newNative);
  const lifecycle = verifySchematicLifecycleEquivalence(expected.expected, expected.native, aligned.source, aligned.native);
  return { profile: "easyeda-pro-control.schematic-layout-historical-recovery.v1", effect: compareDocumentSources(before, after), lifecycle,
    netFlags: expected.netFlags, wireOrders: expected.wireOrders, cloneLifecycle: aligned.proof, originalCreatedIds: createdIds,
    supplementalIdentities: expected.expected.objects.filter((row) => !before.objects.some((old) => old.id === row.id) && !Object.values(createdIds).includes(row.id)).map((row) => ({ id: row.id, type: row.type, parentId: row.body["parentId"], key: row.body["key"], bodySha256: sha256Json(row.body) })),
    rawBeforeSourceSha256: before.sha256, rawAfterSourceSha256: after.sha256, rawAfterNativeSha256: sha256Json(newNative),
    inverseAvailable: false, topology: "executor-requires-unchanged-compiled-pin-nets" };
}
export function inverseSchematicLayout(input: unknown, before: NativeSourceSnapshot, native: unknown, createdIds: SchematicLayoutCreatedIds = {}, evidence?: SchematicLayoutEvidence): SchematicLayoutBatch | undefined {
  const forward = simulate(input, before, native, createdIds, evidence);
  if (forward.inverse === undefined) { return undefined; }
  const reverse = simulate(forward.inverse, forward.expected, forward.native, {});
  return same(reverse.expected, before) ? forward.inverse : undefined;
}

export async function inverseSchematicLayoutCooperatively(input: unknown, before: NativeSourceSnapshot, native: unknown, createdIds: SchematicLayoutCreatedIds = {}, evidence?: SchematicLayoutEvidence): Promise<SchematicLayoutBatch | undefined> {
  const captured = structuredClone({ input: schematicLayoutBatchSchema.parse(input), before, native, createdIds, evidence });
  const forward = await drainSimulationCooperatively(simulateSteps(captured.input, captured.before, captured.native, captured.createdIds, captured.evidence));
  await yieldProofEventLoop();
  if (forward.inverse === undefined) { return undefined; }
  const reverse = await drainSimulationCooperatively(simulateSteps(forward.inverse, forward.expected, forward.native, {}));
  const inverse = same(reverse.expected, captured.before) ? forward.inverse : undefined;
  await yieldProofEventLoop();
  return inverse;
}
function alignLayoutClones(expected: Simulation, source: NativeSourceSnapshot, native: unknown, history?: NativeHistorySnapshot): {
  source: NativeSourceSnapshot; native: SchematicNativeSnapshot; proof: readonly ReturnType<typeof alignSchematicNetFlagCloneLifecycle>["proof"][];
  coordinates?: ReturnType<typeof alignSchematicCoordinateLifecycle>["proof"];
} {
  let current = { source, native: correlateSchematicNativeSource(source, native) };
  const proof: ReturnType<typeof alignSchematicNetFlagCloneLifecycle>["proof"][] = [];
  for (const flag of expected.netFlags) {
    const aligned = alignSchematicNetFlagCloneLifecycle(flag, current.source, current.native);
    proof.push(aligned.proof); current = aligned;
  }
  if (history === undefined) { return { ...current, proof }; }
  const coordinatePair = alignSchematicCoordinateLifecycle(expected.expected, expected.native, current.source, current.native, history);
  return { source: coordinatePair.source, native: coordinatePair.native, proof, coordinates: coordinatePair.proof };
}
export function verifySchematicLayoutEffect(input: unknown, before: NativeSourceSnapshot, after: NativeSourceSnapshot, oldNative: unknown, newNative: unknown, createdIds: SchematicLayoutCreatedIds = {}, evidence?: SchematicLayoutEvidence, allowCloneLifecycle = false): NativeSourceDelta {
  const expected = simulate(input, before, oldNative, createdIds, evidence);
  return verifySimulatedLayoutEffect(expected, before, after, newNative, evidence, allowCloneLifecycle);
}

function verifySimulatedLayoutEffect(expected: Simulation, before: NativeSourceSnapshot, after: NativeSourceSnapshot, newNative: unknown, evidence: SchematicLayoutEvidence | undefined, allowCloneLifecycle: boolean): NativeSourceDelta {
  correlateSchematicNativeSource(after, newNative);
  const compared = allowCloneLifecycle ? alignLayoutClones(expected, after, newNative, evidence?.history) : { source: after, native: newNative, proof: [] };
  for (const flag of expected.netFlags) { verifySchematicNetFlagClone(flag, compared.source, compared.native); }
  const lifecycle = verifySchematicLifecycleEquivalence(expected.expected, expected.native, compared.source, compared.native);
  return Object.assign(compareDocumentSources(before, after), { layoutSteps: expected.steps, layoutLifecycle: lifecycle, netFlags: expected.netFlags, wireOrders: expected.wireOrders, retainedWireOrders: expected.retainedWireOrders, labelBindings: expected.labelBindings,
    cloneLifecycle: compared.proof, coordinateLifecycle: "coordinates" in compared ? compared.coordinates : null, rawAfterSourceSha256: after.sha256, topology: "executor-requires-unchanged-compiled-pin-nets" });
}

export async function verifySchematicLayoutEffectCooperatively(input: unknown, before: NativeSourceSnapshot, after: NativeSourceSnapshot, oldNative: unknown, newNative: unknown, createdIds: SchematicLayoutCreatedIds = {}, evidence?: SchematicLayoutEvidence, allowCloneLifecycle = false): Promise<NativeSourceDelta> {
  const captured = structuredClone({ input, before, after, oldNative, newNative, createdIds, evidence, allowCloneLifecycle });
  const expected = await drainSimulationCooperatively(simulateSteps(captured.input, captured.before, captured.oldNative, captured.createdIds, captured.evidence));
  await yieldProofEventLoop();
  const proof = verifySimulatedLayoutEffect(expected, captured.before, captured.after, captured.newNative, captured.evidence, captured.allowCloneLifecycle);
  await yieldProofEventLoop();
  return proof;
}

/** Keep both checkpoints unchanged. Only comparison source/native copies adopt
 * the durable false/omitted spelling of the exact new clone's watched fields.
 * The ordinary whole-project verifier still checks every persisted record.
 */
export function verifySchematicLayoutPersistence(operation: unknown, input: Parameters<typeof verifySchematicStoragePersistence>[0], createdIds: SchematicLayoutCreatedIds, evidence: SchematicLayoutEvidence): Record<string, unknown> {
  if (input.before.checkpointSha256 !== evidence.history.checkpointSha256 || input.before.semanticSha256 !== evidence.history.semanticSha256) { throw new Error("Layout persistence template evidence belongs to another baseline checkpoint."); }
  const expected = simulate(operation, input.expectedBefore, input.beforeNative, createdIds, evidence);
  const effect = verifySchematicLayoutEffect(operation, input.expectedBefore, input.expectedAfter, input.beforeNative, input.afterNative, createdIds, evidence, true);
  return layoutStoragePersistence(expected, input, evidence, effect);
}

export async function verifySchematicLayoutPersistenceCooperatively(operation: unknown, input: Parameters<typeof verifySchematicStoragePersistence>[0], createdIds: SchematicLayoutCreatedIds, evidence: SchematicLayoutEvidence): Promise<Record<string, unknown>> {
  const captured = structuredClone({ operation: schematicLayoutBatchSchema.parse(operation), input, createdIds, evidence });
  if (captured.input.before.checkpointSha256 !== captured.evidence.history.checkpointSha256 || captured.input.before.semanticSha256 !== captured.evidence.history.semanticSha256) { throw new Error("Layout persistence template evidence belongs to another baseline checkpoint."); }
  const expected = await drainSimulationCooperatively(simulateSteps(captured.operation, captured.input.expectedBefore, captured.input.beforeNative, captured.createdIds, captured.evidence));
  await yieldProofEventLoop();
  const effect = await verifySchematicLayoutEffectCooperatively(captured.operation, captured.input.expectedBefore, captured.input.expectedAfter,
    captured.input.beforeNative, captured.input.afterNative, captured.createdIds, captured.evidence, true);
  await yieldProofEventLoop();
  const proof = layoutStoragePersistence(expected, captured.input, captured.evidence, effect);
  await yieldProofEventLoop();
  return proof;
}
/** Full source import can upload a retained attribute's captured order before
 * refreshNetPoint recreates its dots/junctions and the non-history category
 * sorter changes its model order. Admit that original-source materialization
 * only for independently derived full-import groups, from durable null or,
 * for the explicit multiple-NET profile, a lagging safe numeric order, with
 * every other stored/source field unchanged. This comparison-only baseline
 * projection lets the ordinary storage verifier retain that exact old order;
 * neither the raw checkpoint nor the intended source is modified.
 */
function retainedWireInitialOrders(expected: Simulation, input: Parameters<typeof verifySchematicStoragePersistence>[0]): {
  checkpoint: NativeHistorySnapshot; materializations: readonly { id: string; parentId: string; key: string; initialOrder: number; modelOrder: number; originalBodySha256: string }[];
} {
  const before = input.before.documents.find((document) => document.uuid === input.expectedBefore.document["uuid"]);
  const after = input.after.documents.find((document) => document.uuid === input.expectedAfter.document["uuid"]);
  if (before === undefined || after === undefined) { throw new Error("Retained wire materialization target is absent."); }
  const records = new Map(before.records.map((record) => [record.id, record]));
  const materializations: { id: string; parentId: string; key: string; initialOrder: number; modelOrder: number; originalBodySha256: string }[] = [];
  for (const order of expected.retainedWireOrders.filter((entry) => "profile" in entry &&
    ["full-import-unchanged-retained-wire", "full-import-unchanged-retained-multiple-net-wire"].includes(entry.profile))) {
    for (const { id, key, beforeOrder: initialOrder, order: modelOrder } of retainedWireAttributeOrders(order)) {
      const prior = records.get(id), stored = after.records.find((row) => row.id === id);
      const current = input.expectedAfter.objects.find((row) => row.id === id), original = input.expectedBefore.objects.find((row) => row.id === id);
      const durableOrder = prior?.body["zIndex"];
      const laggingMultipleNetOrder = "profile" in order && order.profile === "full-import-unchanged-retained-multiple-net-wire" &&
        typeof durableOrder === "number" && Number.isSafeInteger(durableOrder) && durableOrder >= 0 && durableOrder !== initialOrder;
      if (prior?.type === "ATTR" && (durableOrder === null || laggingMultipleNetOrder) && stored?.type === "ATTR" && stored.body["zIndex"] === initialOrder &&
          original?.type === "ATTR" && original.body["parentId"] === order.id && original.body["key"] === key && original.body["zIndex"] === initialOrder &&
          current?.type === "ATTR" && current.body["zIndex"] === modelOrder && same(stored.body, original.body) &&
          same({ ...prior.body, zIndex: initialOrder }, original.body) && same({ ...original.body, zIndex: modelOrder }, current.body)) {
        records.set(id, { ...prior, body: structuredClone(original.body) });
        materializations.push({ id, parentId: order.id, key, initialOrder, modelOrder, originalBodySha256: sha256Json(original.body) });
      }
    }
  }
  if (materializations.length === 0) { return { checkpoint: input.before, materializations }; }
  const projected = { ...before, records: [...records.values()] };
  const semantic = projected.records.map(({ id, type, body }) => ({ id, type, body }));
  const document = { ...projected, semanticSha256: sha256Json({ uuid: before.uuid, docType: before.docType, metadata: before.metadata, records: semantic }) };
  const documents = input.before.documents.map((entry) => entry.uuid === before.uuid ? document : entry);
  return { checkpoint: { ...input.before, documents, semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) }, materializations };
}
function layoutStoragePersistence(expected: Simulation, input: Parameters<typeof verifySchematicStoragePersistence>[0], evidence: SchematicLayoutEvidence, effect: unknown): Record<string, unknown> {
  verifyStoredPinNumberWrites(input.before, input.after, input.expectedAfter, expected.expected);
  verifyInactiveNoConnectWrites(input.before, input.after, input.expectedAfter, expected.expected);
  const aligned = alignLayoutClones(expected, input.expectedAfter, input.afterNative, evidence.history);
  const coordinateStorage = aligned.coordinates === undefined ? { source: aligned.source, native: aligned.native, restored: [] } :
    restoreComposedCoordinateStorage(aligned.source, aligned.native, input.expectedAfter, input.afterNative, aligned.coordinates);
  const native = structuredClone(coordinateStorage.native), records = new Map(coordinateStorage.source.objects.map((row) => [row.id, structuredClone(row)]));
  const durable = input.after.documents.find((document) => document.uuid === input.expectedAfter.document["uuid"]);
  if (durable === undefined) { throw new Error("Layout persistence target is absent."); }
  const storedPinNumberSpellings: { id: string; rawBodySha256: string; effectComparisonBodySha256: string }[] = [];
  // Exact effect verification above already proved translated/recreated label
  // Arithmetic. Storage compares the independently captured native form, not
  // The effect comparison's associative-arithmetic spelling.
  for (const change of aligned.coordinates?.storedPinNumbers ?? []) {
    const captured = input.expectedAfter.objects.find((row) => row.id === change.attributeId), row = records.get(change.attributeId);
    const attr = native.components.flatMap((model) => model.pins.flatMap((pin) => pin.attributes)).find((entry) => entry.id === change.attributeId);
    if (captured?.type !== "ATTR" || row?.type !== "ATTR" || attr === undefined || captured.body["key"] !== "Pin Number" ||
        !same({ ...captured.body, x: row.body["x"], y: row.body["y"] }, row.body)) { throw new Error("Stored pin-number spelling changed another field."); }
    storedPinNumberSpellings.push({ id: row.id, rawBodySha256: sha256Json(captured.body), effectComparisonBodySha256: sha256Json(row.body) });
    row.body["x"] = number(captured.body["x"]); row.body["y"] = number(captured.body["y"]);
    attr.body["x"] = number(captured.body["x"]); attr.body["y"] = number(captured.body["y"]);
  }
  const spellings: { id: string; parentId: string; key: string; durableStrikeout: "false" | "omitted" }[] = [];
  const orderSpellings: { componentId: string; variant: "initial" | "reconstructed" | "retained-relevance-refreshed-device" | "retained-description-relevance-refreshed-device" | "retained-relevance-refreshed-description-device"; ids: readonly string[] }[] = [];
  for (const flag of expected.netFlags) {
    const component = native.components.find((model) => model.id === flag.component.id);
    if (component === undefined) { throw new Error("Layout persistence lost the exact cloned component."); }
    const attributes = [...component.attributes, ...component.pins.flatMap((pin) => pin.attributes)];
    const orders = flag.reconstructedHiddenAttributeOrder;
    if (orders.length > 0) {
      const initial = orders.every((field) => durable.records.find((entry) => entry.id === field.id)?.body["zIndex"] === field.initialZIndex);
      const reconstructed = orders.every((field) => durable.records.find((entry) => entry.id === field.id)?.body["zIndex"] === field.reconstructedZIndex);
      // Native zIndex changes are non-history (1922659/4163269); later
      // Component uploads explicitly refresh Device but not Relevance
      // (6250850). Admit this one exact mixed durable form, never its inverse.
      const retainedRelevance = orders.length === 2 && orders.every((field) => {
        const stored = durable.records.find((entry) => entry.id === field.id)?.body["zIndex"];
        return field.key === "Relevance" ? stored === field.initialZIndex : field.key === "Device" && stored === field.reconstructedZIndex;
      });
      // The same Device-only upload applies when source reconstruction moves
      // Device before the two retained hidden Description/Relevance records.
      // The descriptor is independently derived from exact library/root order;
      // This spelling retains both other hidden fields at their initial order.
      const retainedDescriptionRelevance = orders.length === 3 &&
        same(orders.map((field) => field.key).toSorted(), ["Description", "Device", "Relevance"]) && orders.every((field) => {
          const stored = durable.records.find((entry) => entry.id === field.id)?.body["zIndex"];
          return stored === (field.key === "Device" ? field.reconstructedZIndex : field.initialZIndex);
        });
      // Source reapplication handles each stored Attr independently through
      // _handleStockSymbols/modifyCustomAttr. Its upload serializes the current
      // Order (6280726), even though recalculation itself is non-history.
      // Thus the materialized empty Description and Device can both refresh
      // While Relevance keeps its original durable record. This is only the
      // Exact library-derived three-cycle, not arbitrary partial live orders.
      const retainedRelevanceRefreshedDescriptionDevice = orders.length === 3 &&
        same(orders.map((field) => field.key).toSorted(), ["Description", "Device", "Relevance"]) &&
        flag.materializedDeviceAttributes.some((field) => field.key === "Description" && orders.some((order) => order.id === field.id && order.key === "Description")) &&
        orders.every((field) => {
          const stored = durable.records.find((entry) => entry.id === field.id)?.body["zIndex"];
          return stored === (field.key === "Relevance" ? field.initialZIndex : field.reconstructedZIndex);
        });
      if (!initial && !reconstructed && !retainedRelevance && !retainedDescriptionRelevance && !retainedRelevanceRefreshedDescriptionDevice) { throw new Error("Layout persistence changed the cloned hidden order beyond its exact native storage forms."); }
      for (const field of orders) {
        const attr = attributes.find((entry) => entry.id === field.id), row = records.get(field.id), stored = durable.records.find((entry) => entry.id === field.id);
        if (row?.type !== "ATTR" || attr === undefined || stored?.type !== "ATTR" || row.body["parentId"] !== component.id || row.body["key"] !== field.key ||
            stored.body["parentId"] !== component.id || stored.body["key"] !== field.key) { throw new Error("Layout persistence changed the cloned hidden attribute identity."); }
        row.body["zIndex"] = stored.body["zIndex"]; attr.body["zIndex"] = number(stored.body["zIndex"]);
      }
      let variant: (typeof orderSpellings)[number]["variant"] = "retained-relevance-refreshed-device";
      if (initial) { variant = "initial"; } else if (reconstructed) { variant = "reconstructed"; }
      else if (retainedDescriptionRelevance) { variant = "retained-description-relevance-refreshed-device"; }
      else if (retainedRelevanceRefreshedDescriptionDevice) { variant = "retained-relevance-refreshed-description-device"; }
      orderSpellings.push({ componentId: component.id, variant, ids: orders.map((field) => field.id) });
    }
    for (const field of flag.watchedOmittedStrikeout.filter((entry) => entry.stored)) {
      const row = records.get(field.id), stored = durable.records.find((entry) => entry.id === field.id);
      const attr = attributes.find((entry) => entry.id === field.id && entry.key === field.key && entry.body["parentId"] === field.parentId);
      if (row === undefined || stored?.type !== "ATTR" || attr === undefined || row.body["parentId"] !== field.parentId || row.body["key"] !== field.key) { throw new Error("Layout persistence clone attribute identity is absent or contradictory."); }
      const body = { ...stored.body }, present = Object.hasOwn(body, "strikeout");
      if (present && body["strikeout"] !== false) { throw new Error("Layout persistence changed a cloned style beyond its reviewed false/omitted representation."); }
      delete body["strikeout"];
      if (!same(body, row.body)) { throw new Error("Layout persistence changed another cloned attribute field."); }
      if (present) { row.body["strikeout"] = false; attr.body["strikeout"] = false; }
      spellings.push({ id: field.id, parentId: field.parentId, key: field.key, durableStrikeout: present ? "false" : "omitted" });
    }
  }
  const source = snapshot(aligned.source, records); native.source = encode(source);
  const retainedOrders = retainedWireInitialOrders(expected, input);
  const beforeCoordinates = projectSchematicCoordinateCheckpoint(retainedOrders.checkpoint, input.expectedBefore, input.beforeNative);
  const afterCoordinates = projectSchematicCoordinateCheckpoint(input.after, source, native);
  const comparisonCheckpoint = structuredClone(afterCoordinates.checkpoint);
  const comparisonPage = comparisonCheckpoint.documents.find((document) => document.uuid === source.document["uuid"]);
  if (comparisonPage === undefined) { throw new Error("Composed coordinate comparison target is absent."); }
  // Constructor-sensitive storage proof above requires the captured part pose.
  // The endpoint graph below requires the already-verified typed geometry.
  // Return only those proved part-owned comparison rows, never any wire row.
  for (const restored of coordinateStorage.restored) {
    const index = native.components.findIndex((model) => model.id === restored.componentId);
    const raw = coordinateStorage.native.components.find((model) => model.id === restored.componentId);
    const reference = aligned.native.components.find((model) => model.id === restored.componentId);
    if (index === -1 || raw === undefined || reference === undefined || !same(native.components[index], raw)) {
      throw new Error("Composed coordinate comparison lost its proved complete native part.");
    }
    for (const id of restored.sourceIds) {
      const captured = coordinateStorage.source.objects.find((row) => row.id === id), current = records.get(id);
      const normalized = aligned.source.objects.find((row) => row.id === id), stored = comparisonPage.records.find((row) => row.id === id);
      if (captured === undefined || current === undefined || normalized === undefined || stored === undefined ||
          !same(current, captured) || stored.type !== current.type || !same(stored.body, current.body) || normalized.type !== current.type ||
          !same({ ...normalized.body, x: current.body["x"], y: current.body["y"] }, current.body) ||
          (id === restored.componentId ? current.type !== "COMPONENT" : current.type !== "ATTR" || !["Pin Number", "NO_CONNECT"].includes(String(current.body["key"])))) {
        throw new Error("Composed coordinate comparison lacks the exact constructor-proved owned row.");
      }
      stored.body["x"] = number(normalized.body["x"]); stored.body["y"] = number(normalized.body["y"]);
      records.set(id, structuredClone(normalized));
    }
    native.components[index] = structuredClone(reference);
  }
  const comparisonSource = snapshot(source, records); native.source = encode(comparisonSource);
  const comparisonDocument = { ...comparisonPage, semanticSha256: sha256Json({ uuid: comparisonPage.uuid, docType: comparisonPage.docType,
    metadata: comparisonPage.metadata, records: comparisonPage.records.map(({ id, type, body }) => ({ id, type, body })) }) };
  const documents = comparisonCheckpoint.documents.map((document) => document.uuid === comparisonDocument.uuid ? comparisonDocument : document);
  const comparedAfter = { ...comparisonCheckpoint, documents, semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
  const persisted = verifySchematicStoragePersistence({ ...input, before: beforeCoordinates.checkpoint, after: comparedAfter, expectedAfter: comparisonSource, afterNative: native });
  return { ...persisted, schema: "easyeda-pro-control.schematic-layout-persistence.v1", rawExpectedAfterSourceSha256: input.expectedAfter.sha256,
    rawAfterNativeSha256: sha256Json(input.afterNative), rawBeforeSemanticSha256: input.before.semanticSha256, rawAfterSemanticSha256: input.after.semanticSha256,
    coordinateStorage: { before: beforeCoordinates.proof, after: afterCoordinates.proof }, retainedWireInitialOrderMaterializations: retainedOrders.materializations,
    storedPinNumberSpellings, composedCoordinateSpellings: coordinateStorage.restored, comparisonSourceSha256: comparisonSource.sha256,
    comparisonAfterSemanticSha256: comparedAfter.semanticSha256, clonedStyleSpellings: spellings, clonedOrderSpellings: orderSpellings, cloneLifecycle: aligned.proof, effect };
}
/** Recovery evidence is not electrical equivalence. It proves the previously
 * dispatched legacy source exactly, and enumerates only its generated-name
 * errors on the physically attached named groups. The corrected result must
 * subsequently pass the ordinary original-net and whole-topology proofs.
 */
export function prepareSchematicLayoutNetLabelRepair(input: unknown, before: NativeSourceSnapshot, oldNative: unknown, createdIds: SchematicLayoutCreatedIds,
  evidence: SchematicLayoutEvidence, currentSource: NativeSourceSnapshot, currentNative: unknown): {
    profile: "easyeda-pro-control.schematic-layout-net-label-repair.v1"; code: string; expectedSource: NativeSourceSnapshot;
    currentSourceSha256: string; currentNativeSha256: string; correctedSourceSha256: string; labelBindings: readonly SchematicWireLabelBinding[];
    misnamedPins: readonly { componentId: string; pinId: string; expectedNet: string; observedNet: string; wireId: string }[];
  } {
  const actual = correlateSchematicNativeSource(currentSource, currentNative);
  const legacy = simulate(input, before, oldNative, createdIds, evidence, undefined, true);
  const corrected = simulate(input, before, oldNative, createdIds, evidence);
  if (corrected.labelBindings.length === 0) { throw new Error("Layout repair has no exact wire-label correction."); }
  const aligned = alignLayoutClones(legacy, currentSource, actual, evidence.history);
  if (!same(legacy.expected, aligned.source)) { throw new Error("Layout repair current source differs from the complete original dispatched layout."); }
  const reference = structuredClone(legacy.native);
  const wireIds = new Set(legacy.expected.objects.filter((row) => row.type === "WIRE").map((row) => row.id));
  const graph: Segment[] = legacy.expected.objects.filter((row) => row.type === "LINE" && wireIds.has(String(row.body["lineGroup"]))).map((row) =>
    [number(row.body["startX"]), number(row.body["startY"]), number(row.body["endX"]), number(row.body["endY"])]);
  const endpoints: Point[] = graph.flatMap((segment) => [[segment[0], segment[1]], [segment[2], segment[3]]]);
  const misnamedPins: { componentId: string; pinId: string; expectedNet: string; observedNet: string; wireId: string }[] = [];
  for (const model of reference.components) {
    for (const pin of model.pins) {
      const observed = aligned.native.components.find((entry) => entry.id === model.id)?.pins.find((entry) => entry.id === pin.id);
      if (observed !== undefined && observed.net !== pin.net) {
        const binding = corrected.labelBindings.find((entry) => entry.net === pin.net && wireReachesAnchor([entry.x, entry.y], [[number(pin.body["x"]), number(pin.body["y"])]], graph, endpoints));
        if (binding === undefined || typeof pin.net !== "string" || typeof observed.net !== "string" || !/^\$[0-9]+N[0-9]+$/u.test(observed.net)) {
          throw new Error("Layout repair found a net difference outside the exact generated-name defect.");
        }
        misnamedPins.push({ componentId: model.id, pinId: pin.id, expectedNet: pin.net, observedNet: observed.net, wireId: binding.wireId });
        pin.net = observed.net;
      }
    }
  }
  verifySchematicLifecycleEquivalence(legacy.expected, reference, aligned.source, aligned.native);
  const expectedRecords = new Map(currentSource.objects.map((row) => [row.id, structuredClone(row)]));
  const removals: NativeSourceObject[] = [];
  for (const binding of corrected.labelBindings) {
    const desired = corrected.expected.objects.find((row) => row.id === binding.id), old = expectedRecords.get(binding.id);
    if (old === undefined || desired === undefined || old.body["locked"] !== false) { throw new Error("Layout repair lost a journal-owned unlocked label."); }
    removals.push(old);
    expectedRecords.set(old.id, { ...old, body: { ...old.body, key: desired.body["key"], parentId: desired.body["parentId"], zIndex: desired.body["zIndex"] } });
  }
  const expectedSource = snapshot(currentSource, expectedRecords);
  return { profile: "easyeda-pro-control.schematic-layout-net-label-repair.v1", code: layoutSourceCode(actual, expectedSource, removals), expectedSource,
    currentSourceSha256: currentSource.sha256, currentNativeSha256: sha256Json(actual), correctedSourceSha256: expectedSource.sha256,
    labelBindings: corrected.labelBindings, misnamedPins };
}
interface MisnamedWireGroupPin { componentId: string; pinId: string; expectedNet: string; observedNet: string; wireId: string }
function legacyWireGroupProof(input: unknown, before: NativeSourceSnapshot, oldNative: unknown, createdIds: SchematicLayoutCreatedIds,
  evidence: SchematicLayoutEvidence, currentSource: NativeSourceSnapshot, currentNative: unknown): {
    legacy: Simulation; descriptor: SchematicWireGroupRepairDescriptor; actual: SchematicNativeSnapshot; misnamedPins: MisnamedWireGroupPin[]; lifecycle: unknown;
  } {
  if (evidence.wireGroupRepair !== undefined) { throw new Error("Retained wire-group correction was already consumed."); }
  const actual = correlateSchematicNativeSource(currentSource, currentNative);
  // Explicit diagnostic reconstruction of the already-dispatched old bug.
  // Ordinary preparation and all successful electrical proofs stay strict.
  const legacy = simulate(input, before, oldNative, createdIds, evidence, undefined, false, true);
  const operation = schematicLayoutBatchSchema.parse(input);
  const { descriptor } = deriveSchematicWireGroupRepair(operation, before, legacy.expected, legacy.native, createdIds, legacy.netFlags);
  const aligned = alignLayoutClones(legacy, currentSource, actual, evidence.history);
  if (!same(legacy.expected, aligned.source)) { throw new Error("Wire-group repair current source differs from the complete original dispatched layout."); }
  const misnamedPins: MisnamedWireGroupPin[] = [], reference = structuredClone(legacy.native);
  for (const model of reference.components) {
    for (const pin of model.pins) {
      const observed = aligned.native.components.find((entry) => entry.id === model.id)?.pins.find((entry) => entry.id === pin.id);
      if (observed !== undefined && observed.net !== pin.net) {
      const candidates = descriptor.merges.filter((merge) => {
        const flag = legacy.netFlags.find((entry) => entry.component.id === merge.flagId);
        return flag?.net === pin.net && legacy.expected.objects.some((row) => row.type === "LINE" && row.body["lineGroup"] === merge.mainWireId &&
          ((row.body["startX"] === pin.body["x"] && row.body["startY"] === pin.body["y"]) || (row.body["endX"] === pin.body["x"] && row.body["endY"] === pin.body["y"])));
      });
      const merge = candidates[0];
      if (model.kind !== "part" || candidates.length !== 1 || merge === undefined || typeof pin.net !== "string" || typeof observed.net !== "string" || !/^\$[0-9]+N[0-9]+$/u.test(observed.net)) {
        throw new Error("Wire-group repair found a net difference outside its exact main-group generated-name defect.");
      }
      misnamedPins.push({ componentId: model.id, pinId: pin.id, expectedNet: pin.net, observedNet: observed.net, wireId: merge.mainWireId });
      pin.net = observed.net;
      }
    }
  }
  if (misnamedPins.length === 0) { throw new Error("Wire-group repair has no independently observed generated-name defect."); }
  const lifecycle = verifySchematicLifecycleEquivalence(legacy.expected, reference, aligned.source, aligned.native);
  return { legacy, descriptor, actual, misnamedPins, lifecycle };
}
/** Complete current durable-state proof of a FAILED legacy layout, not an
 * electrical success. The source/native exception is limited to enumerated
 * generated names; every saved document is still checked without tolerance.
 */
export function verifySchematicLayoutWireGroupRepairLegacyPersistence(operation: unknown, input: Parameters<typeof verifySchematicStoragePersistence>[0],
  createdIds: SchematicLayoutCreatedIds, evidence: SchematicLayoutEvidence): Record<string, unknown> {
  if (input.before.checkpointSha256 !== evidence.history.checkpointSha256 || input.before.semanticSha256 !== evidence.history.semanticSha256) { throw new Error("Wire-group repair template evidence belongs to another baseline checkpoint."); }
  const proof = legacyWireGroupProof(operation, input.expectedBefore, input.beforeNative, createdIds, evidence, input.expectedAfter, input.afterNative);
  const storage = layoutStoragePersistence(proof.legacy, input, evidence, { electricalEquivalent: false, lifecycle: proof.lifecycle, misnamedPins: proof.misnamedPins });
  return { ...storage, schema: "easyeda-pro-control.schematic-layout-wire-group-legacy-persistence.v1", electricalEquivalent: false,
    descriptor: proof.descriptor, misnamedPins: proof.misnamedPins };
}
/** One supplemental edit derived only from immutable retained plan/IDs. Never
 * replays the original layout and never allocates new persistent identities.
 */
export function prepareSchematicLayoutWireGroupRepair(input: unknown, before: NativeSourceSnapshot, oldNative: unknown, createdIds: SchematicLayoutCreatedIds,
  evidence: SchematicLayoutEvidence, currentSource: NativeSourceSnapshot, currentNative: unknown): {
    profile: "easyeda-pro-control.schematic-layout-wire-group-repair.v1"; code: string; expectedSource: NativeSourceSnapshot;
    descriptor: SchematicWireGroupRepairDescriptor; currentSourceSha256: string; currentNativeSha256: string; correctedSourceSha256: string;
    misnamedPins: readonly MisnamedWireGroupPin[];
  } {
  const proof = legacyWireGroupProof(input, before, oldNative, createdIds, evidence, currentSource, currentNative);
  const records = new Map(currentSource.objects.map((row) => [row.id, structuredClone(row)]));
  const removals: { group: NativeSourceObject; line: NativeSourceObject; relevance: NativeSourceObject }[] = [];
  for (const merge of proof.descriptor.merges) {
    const group = records.get(merge.dropWireId), lead = records.get(merge.lineId), relevance = records.get(merge.relevanceId);
    if (group?.type !== "WIRE" || lead?.type !== "LINE" || relevance?.type !== "ATTR" || lead.body["lineGroup"] !== group.id || relevance.body["parentId"] !== group.id) {
      throw new Error("Wire-group correction lost an exact retained drop-group record.");
    }
    removals.push({ group, line: lead, relevance });
    records.set(lead.id, { ...lead, body: { ...lead.body, lineGroup: merge.mainWireId } });
    records.delete(group.id); records.delete(relevance.id);
  }
  for (const order of proof.descriptor.wireOrders) {
    const row = records.get(order.id);
    if (row?.type !== "ATTR" || row.body["key"] !== "Relevance" || row.body["zIndex"] !== order.before) { throw new Error("Wire-group correction encountered an unproven derived child order."); }
    records.set(row.id, { ...row, body: { ...row.body, zIndex: order.after } });
  }
  const expectedSource = snapshot(currentSource, records), projectedNative = structuredClone(proof.actual);
  projectedNative.source = encode(expectedSource);
  for (const entry of proof.misnamedPins) {
    const pin = projectedNative.components.find((model) => model.id === entry.componentId)?.pins.find((candidate) => candidate.id === entry.pinId);
    if (pin === undefined || pin.net !== entry.observedNet) { throw new Error("Wire-group correction lost an independently proven misnamed pin."); }
    pin.net = entry.expectedNet;
  }
  verifySchematicLayoutEffect(input, before, expectedSource, oldNative, projectedNative, createdIds, { ...evidence, wireGroupRepair: proof.descriptor }, true);
  return { profile: "easyeda-pro-control.schematic-layout-wire-group-repair.v1", code: layoutSourceCode(proof.actual, expectedSource, [], removals),
    expectedSource, descriptor: proof.descriptor, currentSourceSha256: currentSource.sha256, currentNativeSha256: sha256Json(proof.actual),
    correctedSourceSha256: expectedSource.sha256, misnamedPins: proof.misnamedPins };
}
function layoutSourceCode(native: SchematicNativeSnapshot, expected: NativeSourceSnapshot, removals: readonly NativeSourceObject[] = [],
  wireRemovals: readonly { group: NativeSourceObject; line: NativeSourceObject; relevance: NativeSourceObject }[] = [], flatGuard?: FlatDisplayRuntimeGuard): string {
  const baseline = canonicalJson(native), desired = JSON.stringify(expected.objects);
  const code = `const binding=${JSON.stringify(native.document)};
${SCHEMATIC_NATIVE_READER_CODE}
const canonical=value=>JSON.stringify(value,(_key,entry)=>entry&&typeof entry==='object'&&!Array.isArray(entry)?Object.fromEntries(Object.keys(entry).sort().map(key=>[key,entry[key]])):entry);
${flatGuard === undefined ? "" : `const flatDisplayGuard=await ${buildFlatDisplayRuntimeGuard(flatGuard, "source-action")};flatDisplayGuard.assertWriter(schNative,schManager,schDoc);await flatDisplayGuard.read();\n`}${buildSchematicLayoutPayloadCode(baseline, desired)}
${flatGuard === undefined ? "" : "flatDisplayGuard.check();\n"}if(canonical(schCapture())!==baseline)throw new Error('SCH_LAYOUT_BASELINE_CHANGED');
if(typeof schDoc.consistencyImpl.setSourceCode!=='function'||typeof schDoc.shapeManager.actionRunner?.run!=='function')throw new Error('SCH_LAYOUT_SOURCE_API_MISSING');
const original=schDoc.consistencyImpl.getSourceCode(),head=original.split('|\\n')[0];
if(!head?.startsWith('{"type":"DOCHEAD"}||'))throw new Error('SCH_LAYOUT_HEADER_INVALID');
const source=[head,...desired.map((record,index)=>JSON.stringify({type:record.type,id:record.id,ticket:index+1})+'||'+JSON.stringify(record.body))].join('|\\n')+'|\\n';
const removals=${JSON.stringify(removals)};
const wireRemovals=${JSON.stringify(wireRemovals)};
const applied=await ${flatGuard === undefined ? "schDoc.shapeManager.actionRunner" : "flatDisplayGuard"}.run(async()=>{schCheck();if(canonical(schCapture())!==baseline)throw new Error('SCH_LAYOUT_BASELINE_CHANGED');
for(const row of removals){const model=schDoc.shapeManager.idManager.get(row.id);if(!model||model.id!==row.id||model.tagName!=='NetLabel'||model.keyInSourceCode!=='_NETLABEL_'||model.parent?.id!=='$$root'||model.isConnected!==true||typeof model.getConsistencyData!=='function'||canonical(model.getConsistencyData())!==canonical(row.body)||typeof model.remove!=='function')throw new Error('SCH_LAYOUT_LABEL_REMOVE_GUARD');}
for(const row of removals){const model=schDoc.shapeManager.idManager.get(row.id);if(model.remove()!==true||model.parent!==null||model.isConnected!==false||schDoc.shapeManager.idManager.idMap.has(row.id)!==false)throw new Error('SCH_LAYOUT_LABEL_REMOVE_FAILED');}
for(const entry of wireRemovals){const model=schDoc.shapeManager.idManager.get(entry.group.id),line=schDoc.shapeManager.idManager.get(entry.line.id),attr=schDoc.shapeManager.idManager.get(entry.relevance.id);if(!model||model.tagName!=='NetGroup'||model.type!=='wire'||model.parent?.id!=='$$root'||model.isConnected!==true||model.locked!==false||typeof model.remove!=='function'||typeof model.getConsistencyData!=='function'||canonical(model.getConsistencyData())!==canonical(entry.group.body)||!Array.isArray(model.lines)||model.lines.length!==1||model.lines[0]!==line||!Array.isArray(model.netNames)||model.netNames.length!==0||typeof model.getCustomAttr!=='function'||model.getCustomAttr().length!==1||model.getCustomAttr()[0]!==attr||!line||!attr||line.parent!==model||attr.parent!==model||line.isConnected!==true||attr.isConnected!==true||typeof line.getConsistencyData!=='function'||typeof attr.getConsistencyData!=='function'||canonical(line.getConsistencyData())!==canonical(entry.line.body)||canonical(attr.getConsistencyData())!==canonical(entry.relevance.body))throw new Error('SCH_LAYOUT_WIRE_REMOVE_GUARD');}
for(const entry of wireRemovals){const model=schDoc.shapeManager.idManager.get(entry.group.id);if(model.remove()!==true||model.parent!==null||model.isConnected!==false||[entry.group.id,entry.line.id,entry.relevance.id].some(id=>schDoc.shapeManager.idManager.idMap.has(id)))throw new Error('SCH_LAYOUT_WIRE_REMOVE_FAILED');}
${flatGuard === undefined ? "" : "flatDisplayGuard.assertWriter(schNative,schManager,schDoc);flatDisplayGuard.check();"}if(await schDoc.consistencyImpl.setSourceCode(source)!==true)throw new Error('SCH_LAYOUT_SOURCE_REJECTED');});
if(applied!==true)throw new Error('SCH_LAYOUT_ACTION_REJECTED');schCheck();return true;`;
  return code;
}
export function buildSchematicLayoutAdapter(input: unknown, before: NativeSourceSnapshot, nativeInput: unknown, createdIds?: SchematicLayoutCreatedIds, evidence?: SchematicLayoutEvidence): {
  readonly profile: typeof SCHEMATIC_LAYOUT_PROFILE; readonly code: string; readonly expected: NativeSourceSnapshot; readonly createdIds: SchematicLayoutCreatedIds;
} {
  const native = correlateSchematicNativeSource(before, nativeInput);
  const result = simulate(input, before, native, createdIds, evidence);
  return layoutAdapterResult(native, result);
}

function layoutAdapterResult(native: SchematicNativeSnapshot, result: Simulation, flatGuard?: FlatDisplayRuntimeGuard): ReturnType<typeof buildSchematicLayoutAdapter> {
  const code = layoutSourceCode(native, result.expected, [], [], flatGuard);
  return { profile: SCHEMATIC_LAYOUT_PROFILE, code, expected: result.expected, createdIds: result.createdIds };
}

export async function buildSchematicLayoutAdapterCooperatively(input: unknown, before: NativeSourceSnapshot, nativeInput: unknown, createdIds?: SchematicLayoutCreatedIds, evidence?: SchematicLayoutEvidence,
  flatGuard?: FlatDisplayRuntimeGuard): Promise<ReturnType<typeof buildSchematicLayoutAdapter>> {
  const captured = structuredClone({ input, before, nativeInput, createdIds, evidence, flatGuard });
  if (captured.flatGuard !== undefined) { assertFlatDisplayRuntimeAction(captured.flatGuard, captured.input); }
  const native = correlateSchematicNativeSource(captured.before, captured.nativeInput);
  const result = await drainSimulationCooperatively(simulateSteps(captured.input, captured.before, native, captured.createdIds, captured.evidence));
  await yieldProofEventLoop();
  // The native writer must keep the ORIGINAL captured native as its CAS guard.
  const adapter = layoutAdapterResult(native, result, captured.flatGuard);
  await yieldProofEventLoop();
  return adapter;
}
