import { canonicalJson, sha256Json } from "./core.ts";
import { compareDocumentSources, parseDocumentSource } from "./document-source.ts";
import type { NativeSourceDelta, NativeSourceObject, NativeSourceSnapshot } from "./document-source.ts";
import { nativeSchematicAttributePatch, normalizeSchematicNativeSnapshot, schematicPreservedProperties } from "./schematic-native-adapter.ts";
import type { SchematicNativeComponent, SchematicNativeSnapshot } from "./schematic-native-adapter.ts";
import { SCHEMATIC_OPERATION_PROFILE, compileSchematicOperation, schematicOperationSchema } from "./schematic-operations.ts";
import type { CompiledSchematicOperation, SchematicOperation } from "./schematic-operations.ts";
import { alignSchematicLifecyclePair } from "./schematic-lifecycle.ts";

export interface SchematicSourceIds { readonly targetId?: string; readonly createdId?: string }
export interface SchematicNativeProof { readonly before: SchematicNativeSnapshot; readonly after: SchematicNativeSnapshot }
type Body = Record<string, unknown>;
type Segment = readonly [number, number, number, number];
const same = (left: unknown, right: unknown): boolean => canonicalJson({ value: left }) === canonicalJson({ value: right });
function unsupported(reason: string): never { throw new Error(`SCHEMATIC_SOURCE_UNSUPPORTED: ${reason}`); }
function number(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) { throw new TypeError("Native schematic coordinate is not finite."); }
  return value;
}
function checked(source: NativeSourceSnapshot): void {
  if (source.schema !== "easyeda-pro-control.document-source.v1" || source.document["docType"] !== "SCH_PAGE" ||
      typeof source.document["uuid"] !== "string" || source.document["uuid"].length === 0 ||
      source.sha256 !== sha256Json({ schema: source.schema, document: source.document, objects: source.objects }) ||
      new Set(source.objects.map((entry) => entry.id)).size !== source.objects.length) {
    throw new Error("Invalid complete schematic source snapshot.");
  }
}
function targetId(operation: CompiledSchematicOperation, ids: SchematicSourceIds): string {
  const target = operation.effect.target;
  if (!target) { return unsupported("operation has no target"); }
  if ("primitiveId" in target) {
    if (ids.targetId !== undefined && ids.targetId !== target.primitiveId) { throw new Error("Resolved target contradicts operation."); }
    return target.primitiveId;
  }
  if (ids.targetId === undefined || ids.targetId.length === 0) { return unsupported("result reference has not been journal-resolved"); }
  return ids.targetId;
}

/** Cross-check independent public source against the synchronous native encoder and manager. */
export function correlateSchematicNativeSource(source: NativeSourceSnapshot, input: unknown): SchematicNativeSnapshot {
  checked(source);
  const native = normalizeSchematicNativeSnapshot(input);
  if (native.document.documentUuid !== source.document["uuid"]) { throw new Error("Native/source schematic identity mismatch."); }
  const encoded = parseDocumentSource(native.source);
  if (encoded.document["uuid"] !== native.document.documentUuid || encoded.document["docType"] !== "SCH_PAGE") { throw new Error("Native encoder document identity differs from selected schematic."); }
  const objects = encoded.objects;
  if (!same(objects, source.objects)) { throw new Error("Independent schematic source disagrees with native encoder records."); }
  const components = source.objects.filter((entry) => entry.type === "COMPONENT");
  if (!same(components.map(({ id }) => id).toSorted(), native.components.map(({ id }) => id).toSorted())) { throw new Error("Native component inventory is incomplete."); }
  for (const model of native.components) {
    if (!same(model.body, components.find(({ id }) => id === model.id)?.body)) { throw new Error("Native component body differs from source."); }
    for (const attr of [...model.attributes, ...model.pins.flatMap((pin) => pin.attributes)]) {
      const stored = source.objects.find(({ id }) => id === attr.id);
      if (stored !== undefined && (stored.type !== "ATTR" || !same(stored.body, attr.body))) { throw new Error("Native stored attribute differs from source."); }
    }
  }
  return native;
}

function actualTarget(source: NativeSourceSnapshot, id: string, type: string): NativeSourceObject {
  const target = source.objects.find((entry) => entry.id === id);
  if (!target || target.type !== type) { return unsupported("native target family mismatch"); }
  if (target.body["locked"] !== undefined && target.body["locked"] !== false) { return unsupported("locked target"); }
  return target;
}
function expectedValues(compiled: CompiledSchematicOperation): Body {
  const values: Body = {};
  for (const field of compiled.expectedFields) {
    if (Object.hasOwn(values, field.field) || field.comparison !== "equals") { throw new Error("Invalid compiled schematic expectations."); }
    values[field.field] = field.value;
  }
  return values;
}

export function prepareSchematicSourceOperation(input: unknown, source: NativeSourceSnapshot, nativeInput?: unknown, ids: SchematicSourceIds = {}): CompiledSchematicOperation {
  checked(source);
  const operation = schematicOperationSchema.parse(input);
  const compiled = compileSchematicOperation(operation);
  if (operation.documentType !== 1) { return unsupported("symbol editor needs its own source profile"); }
  if (operation.action === "sch.component.modify") {
    const native = correlateSchematicNativeSource(source, nativeInput);
    const resolved = targetId(compiled, ids);
    const target = actualTarget(source, resolved, "COMPONENT");
    for (const [field, sourceField] of [["rotation", "rotation"], ["mirror", "isMirror"]] as const) {
      const requested: unknown = Reflect.get(operation.patch, field);
      if (requested !== undefined && !same(requested, target.body[sourceField])) { return unsupported("rotation/mirror needs a complete inherited graphic-transform proof"); }
    }
    // Native adapter edits only supplied keys. Do not materialize inherited
    // Defaults merely to compensate for the separate lossy public wrapper.
    schematicPreservedProperties(native, resolved);
    const model = exactComponent(native, resolved);
    for (const key of Object.keys(nativeSchematicAttributePatch(operation))) {
      const previous = model.attributes.find((entry) => entry.key === key);
      if (previous === undefined) { return unsupported("new property attributes need explicit creation/default proof"); }
      if (previous.instanceValue !== null) { return unsupported("instance-scoped attribute changes require instance-document proof"); }
    }
  } else if (compiled.effect.family === "wire") {
    if (compiled.effect.identity !== "create") { actualTarget(source, targetId(compiled, ids), "WIRE"); }
    const values = expectedValues(compiled);
    if (values["lineWidth"] !== undefined && values["lineWidth"] !== null && (number(values["lineWidth"]) < 1 || number(values["lineWidth"]) > 10)) { return unsupported("native wire width is restricted to 1..10 or null"); }
    if (values["line"] !== undefined) { segments(values["line"]); }
    if (values["net"] !== undefined && values["net"] !== "" && (compiled.effect.identity === "create" || !wireObjects(source, targetId(compiled, ids)).some((entry) => entry.type === "ATTR" && entry.body["key"] === "NET"))) {
      return unsupported("new named-net attribute defaults require a separate proof profile");
    }
  } else { return unsupported("this family's complete native effect model has not been implemented"); }
  return compiled;
}

export function assertSchematicSourceProfileSupported(input: unknown, source: NativeSourceSnapshot, ids: SchematicSourceIds = {}, nativeInput?: unknown): void {
  prepareSchematicSourceOperation(input, source, nativeInput, ids);
}

function translate(body: Body, dx: number, dy: number): Body {
  const result = { ...body };
  if (body["x"] !== null && body["x"] !== undefined) { result["x"] = number(body["x"]) + dx; }
  if (body["y"] !== null && body["y"] !== undefined) { result["y"] = number(body["y"]) + dy; }
  return result;
}
function exactComponent(native: SchematicNativeSnapshot, id: string): SchematicNativeComponent {
  const model = native.components.find((entry) => entry.id === id);
  if (!model || model.kind !== "part") { return unsupported("native component is not one part"); }
  return model;
}
function translatedPin(pin: SchematicNativeComponent["pins"][number], dx: number, dy: number): unknown {
  const attributes = [];
  for (const attr of pin.attributes) { attributes.push({ ...attr, body: translate(attr.body, dx, dy) }); }
  return { ...pin, body: translate(pin.body, dx, dy), attributes, noConnect: pin.noConnect === null ? null : { ...pin.noConnect, body: translate(pin.noConnect.body, dx, dy) } };
}
function hasLifecycleAttributeDrift(before: SchematicNativeSnapshot, after: SchematicNativeSnapshot): boolean {
  return before.components.some((model) => {
    const current = after.components.find((entry) => entry.id === model.id);
    if (current === undefined) { return false; }
    const attrs = [...current.attributes, ...current.pins.flatMap((pin) => pin.attributes)];
    return [...model.attributes, ...model.pins.flatMap((pin) => pin.attributes)].some((attr) => {
      const next = attrs.find((entry) => entry.key === attr.key && entry.body["parentId"] === attr.body["parentId"]);
      return next !== undefined && (attr.id !== next.id || !same(attr.body["zIndex"], next.body["zIndex"]));
    });
  });
}

function verifyComponent(compiled: CompiledSchematicOperation, before: NativeSourceSnapshot, after: NativeSourceSnapshot, ids: SchematicSourceIds, proof?: SchematicNativeProof): void {
  if (!proof) { return unsupported("component proof needs complete native properties and pins"); }
  let oldNative = correlateSchematicNativeSource(before, proof.before);
  let newNative = correlateSchematicNativeSource(after, proof.after);
  let afterObjects = after.objects;
  if (hasLifecycleAttributeDrift(oldNative, newNative)) {
    const pair = alignSchematicLifecyclePair(oldNative, newNative);
    oldNative = pair.reference; newNative = pair.observed; afterObjects = pair.observedSource.objects;
  }
  if (!same(oldNative.document, newNative.document)) { throw new Error("Native schematic context changed."); }
  const id = targetId(compiled, ids);
  const oldModel = exactComponent(oldNative, id);
  const newModel = exactComponent(newNative, id);
  const values = expectedValues(compiled);
  const dx = values["x"] === undefined ? 0 : number(values["x"]) - number(oldModel.body["x"]);
  const dy = values["y"] === undefined ? 0 : -number(values["y"]) - number(oldModel.body["y"]);
  if (!same(translate(oldModel.body, dx, dy), newModel.body) || oldModel.locked !== newModel.locked) { throw new Error("Native component pose/body mismatch."); }
  const expectedAttributes = new Map(oldModel.attributes.map((entry) => [entry.key, { ...entry, body: translate(entry.body, dx, dy) }]));
  const requested: Body = {};
  for (const field of compiled.effect.fields) { requested[field] = values[field]; }
  const operation = schematicOperationSchema.parse({ id: compiled.id, action: "sch.component.modify", target: { primitiveId: id }, patch: requested });
  const patch = nativeSchematicAttributePatch(operation);
  for (const [key, value] of Object.entries(patch)) {
    const previous = expectedAttributes.get(key);
    if (!previous) { return unsupported("new property attributes need explicit creation/default proof"); }
    if (previous.instanceValue !== null) { return unsupported("instance-scoped attribute changes require instance-document proof"); }
    const updated = { ...previous, blockValue: value, value: value ?? previous.symbolValue ?? "", body: { ...previous.body, value } };
    expectedAttributes.set(key, updated);
  }
  const attrs = [...expectedAttributes.values()].toSorted((a, b) => a.id.localeCompare(b.id));
  if (!same(attrs, newModel.attributes)) { throw new Error("Native attribute preservation or requested-value mismatch."); }
  const pins = oldModel.pins.map((pin) => translatedPin(pin, dx, dy));
  if (!same(pins, newModel.pins)) { throw new Error("Native component pins, nets or no-connect state changed outside the pose contract."); }
  if (!same(oldNative.components.filter((entry) => entry.id !== id), newNative.components.filter((entry) => entry.id !== id))) { throw new Error("Unrelated native components changed."); }
  const expected = new Map(before.objects.map((object) => [object.id, object]));
  const oldBody = actualTarget(before, id, "COMPONENT");
  expected.set(id, { ...oldBody, body: newModel.body });
  for (const attr of [...newModel.attributes, ...newModel.pins.flatMap((pin) => pin.attributes)]) {
    const old = expected.get(attr.id);
    if (old !== undefined) { expected.set(attr.id, { ...old, body: attr.body }); }
    else if (Object.hasOwn(patch, attr.key)) { expected.set(attr.id, { id: attr.id, type: "ATTR", body: attr.body }); }
  }
  if (!same([...expected.values()].toSorted((a, b) => a.id.localeCompare(b.id)), afterObjects)) { throw new Error("Schematic source has unplanned collateral changes."); }
}

function segments(input: unknown): Segment[] {
  if (!Array.isArray(input) || input.length === 0) { return unsupported("wire line has no points"); }
  const groups: unknown[] = typeof input[0] === "number" ? [input] : input;
  const result: Segment[] = [];
  for (const group of groups) {
    if (!Array.isArray(group) || group.length < 4 || group.length % 2 !== 0) { return unsupported("wire line is malformed"); }
    for (let index = 0; index < group.length - 2; index += 2) {
      const item: Segment = [number(group[index]), -number(group[index + 1]), number(group[index + 2]), -number(group[index + 3])];
      if (item[0] === item[2] && item[1] === item[3]) { return unsupported("zero-length wire segment"); }
      result.push(item);
    }
  }
  return result;
}
const canonicalSegment = (line: Segment): string => canonicalJson(line[0] < line[2] || (line[0] === line[2] && line[1] <= line[3]) ? line : [line[2], line[3], line[0], line[1]]);
function wireObjects(source: NativeSourceSnapshot, id: string): NativeSourceObject[] {
  return source.objects.filter((entry) => entry.id === id || entry.body["lineGroup"] === id || entry.body["parentId"] === id);
}
function verifyWire(compiled: CompiledSchematicOperation, before: NativeSourceSnapshot, after: NativeSourceSnapshot, ids: SchematicSourceIds): void {
  const creating = compiled.effect.identity === "create", deleting = compiled.effect.identity === "delete";
  const id = creating ? ids.createdId : targetId(compiled, ids);
  if (id === undefined || id.length === 0) { return unsupported("wire create needs exact returned group ID"); }
  const previous = wireObjects(before, id);
  const next = wireObjects(after, id);
  if (creating && previous.length > 0) { return unsupported("native wire merged with an existing group; use an explicit group-merge proof"); }
  if (!same(before.objects.filter((entry) => !previous.includes(entry)), after.objects.filter((entry) => !next.includes(entry)))) { throw new Error("Wire mutation changed an unrelated native record."); }
  if (deleting) {
    if (next.length > 0) { throw new Error("Wire deletion left owned records."); }
    return;
  }
  const values = expectedValues(compiled);
  const groups = next.filter((entry) => entry.type === "WIRE" && entry.id === id);
  if (groups.length !== 1 || next.some((entry) => !["WIRE", "LINE", "ATTR"].includes(entry.type))) { throw new Error("Wire result has an unknown or missing record family."); }
  const lines = next.filter((entry) => entry.type === "LINE");
  const oldLines = previous.filter((entry) => entry.type === "LINE");
  const group = groups[0];
  if (!group) { throw new Error("Missing native wire group."); }
  const oldGroup = previous.find((entry) => entry.id === id);
  if (oldGroup !== undefined && !same(oldGroup, group)) { throw new Error("Wire group metadata changed outside request."); }
  if (oldGroup === undefined && Object.keys(group.body).some((key) => !["zIndex", "locked", "groupId"].includes(key))) { return unsupported("unknown new wire-group defaults"); }
  if (group.body["locked"] !== undefined && group.body["locked"] !== false) { throw new Error("New wire group is locked."); }
  if (group.body["groupId"] !== undefined && group.body["groupId"] !== "") { return unsupported("wire unexpectedly belongs to a combination"); }
  const expectedLines = values["line"] === undefined ? oldLines.map((entry): Segment => [number(entry.body["startX"]), number(entry.body["startY"]), number(entry.body["endX"]), number(entry.body["endY"])]) : segments(values["line"]);
  const actualLines = lines.map((entry): Segment => [number(entry.body["startX"]), number(entry.body["startY"]), number(entry.body["endX"]), number(entry.body["endY"])]);
  if (!same(expectedLines.map((line) => canonicalSegment(line)).toSorted(), actualLines.map((line) => canonicalSegment(line)).toSorted())) { throw new Error("Native wire geometry differs from explicit requested segments."); }
  const allowedLine = new Set(["fillColor", "fillStyle", "strokeColor", "strokeStyle", "strokeWidth", "startX", "startY", "endX", "endY", "lineGroup"]);
  for (const line of lines) {
    const oldLine = oldLines.find((entry) => entry.id === line.id);
    if (Object.keys(line.body).some((key) => !allowedLine.has(key)) || line.body["fillColor"] !== null || line.body["fillStyle"] !== null || line.body["lineGroup"] !== id) { return unsupported("unknown wire-line fields or defaults"); }
    if (oldLine === undefined && !creating && values["line"] === undefined) { throw new Error("Wire patch replaced child identities without requested geometry."); }
  }
  for (const [field, sourceField] of [["color", "strokeColor"], ["lineWidth", "strokeWidth"], ["lineType", "strokeStyle"]] as const) {
    if (values[field] !== undefined) {
      let value: unknown = values[field];
      if (field === "lineType" && value !== null) { value = ["SOLID", "SHORT_DASH", "DOT", "DOT_DASH"][number(value)]; }
      if (lines.some((entry) => !same(entry.body[sourceField], value))) { throw new Error("Native wire style differs from request."); }
    } else if (!same(oldLines.map((entry) => entry.body[sourceField]), lines.map((entry) => entry.body[sourceField]))) { throw new Error("Native wire style changed outside the patch."); }
  }
  const attrs = next.filter((entry) => entry.type === "ATTR");
  if (values["net"] !== undefined) {
    if (typeof values["net"] !== "string") { throw new TypeError("Wire net is not a string."); }
    const net = values["net"].toUpperCase();
    if ((net.length > 0 && attrs.length === 0) || attrs.some((entry) => entry.body["key"] !== "NET" || entry.body["value"] !== net)) { throw new Error("Native wire named net differs from request."); }
    for (const attr of attrs) {
      const oldAttr = previous.find((entry) => entry.id === attr.id && entry.type === "ATTR");
      if (oldAttr === undefined) { return unsupported("new named-net attributes require reviewed display/default geometry"); }
      if (!same({ ...oldAttr, body: { ...oldAttr.body, value: net } }, attr)) { throw new Error("Wire net changed attribute metadata outside value."); }
    }
  } else if (!same(previous.filter((entry) => entry.type === "ATTR"), attrs)) { throw new Error("Native wire attributes changed outside the patch."); }
}

export function verifySchematicSourceEffect(compiled: CompiledSchematicOperation, before: NativeSourceSnapshot, after: NativeSourceSnapshot, ids: SchematicSourceIds = {}, native?: SchematicNativeProof): NativeSourceDelta {
  checked(before); checked(after);
  if (compiled.profile !== SCHEMATIC_OPERATION_PROFILE || compiled.documentType !== 1) { return unsupported("unreviewed schematic profile"); }
  const delta = compareDocumentSources(before, after);
  if (delta.documentChanged) { throw new Error("Schematic document metadata changed."); }
  if (compiled.action === "sch.component.modify") { verifyComponent(compiled, before, after, ids, native); }
  else if (compiled.effect.family === "wire") { verifyWire(compiled, before, after, ids); }
  else { return unsupported("missing complete family proof"); }
  return delta;
}

/** UUID deletion and new attribute creation require checkpoint recovery, not a fabricated inverse UUID. */
export function buildInverseSchematicOperation(input: unknown, before: NativeSourceSnapshot, ids: SchematicSourceIds = {}, nativeInput?: unknown): SchematicOperation | undefined {
  const operation = schematicOperationSchema.parse(input);
  const compiled = prepareSchematicSourceOperation(operation, before, nativeInput, ids);
  if (compiled.effect.identity === "delete") { return undefined; }
  if (compiled.effect.identity === "create") {
    if (ids.createdId === undefined || ids.createdId.length === 0) { return unsupported("inverse needs journaled created ID"); }
    return schematicOperationSchema.parse({ id: `inverse:${operation.id}`, action: "sch.wire.delete", target: { primitiveId: ids.createdId } });
  }
  if (operation.action === "sch.component.modify") {
    const native = correlateSchematicNativeSource(before, nativeInput);
    const id = targetId(compiled, ids);
    const model = exactComponent(native, id);
    const patch: Body = {};
    for (const field of Object.keys(operation.patch)) {
      if (field === "x") { patch[field] = number(model.body["x"]); }
      else if (field === "y") { patch[field] = -number(model.body["y"]); }
      else if (field === "rotation") { patch[field] = model.body["rotation"]; }
      else if (field === "mirror") { patch[field] = model.body["isMirror"]; }
      else { return undefined; }
    }
    return schematicOperationSchema.parse({ id: `inverse:${operation.id}`, action: operation.action, target: { primitiveId: id }, patch });
  }
  // Replacing wire segments can change child IDs; exact checkpoint restore is required.
  return undefined;
}
