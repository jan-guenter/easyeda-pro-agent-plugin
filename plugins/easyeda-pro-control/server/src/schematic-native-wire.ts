/* oxlint-disable import/max-dependencies -- The existing fixed wire writer additionally composes its independently sealed flat graph and generated-marker guards. */
import { canonicalJson, sha256Json } from "./core.ts";
import type { NativeSourceDelta, NativeSourceObject, NativeSourceSnapshot } from "./document-source.ts";
import { compareDocumentSources, parseDocumentSource } from "./document-source.ts";
import { SCHEMATIC_NATIVE_READER_CODE } from "./schematic-native-adapter.ts";
import type { SchematicNativeSnapshot } from "./schematic-native-adapter.ts";
import { buildSchematicLayoutPayloadCode } from "./schematic-layout-transport.ts";
import { schematicOperationSchema } from "./schematic-operations.ts";
import { correlateSchematicNativeSource, prepareSchematicSourceOperation, verifySchematicSourceEffect } from "./schematic-source-proof.ts";
import { schematicNewWireOrders } from "./schematic-wire-order.ts";
import { alignSchematicLifecyclePair } from "./schematic-lifecycle.ts";
import type { SchematicLifecycleChange } from "./schematic-lifecycle.ts";
import { assertFlatDisplayRuntimeAction, buildFlatDisplayRuntimeGuard } from "./flat-display-runtime.ts";
import type { FlatDisplayRuntimeGuard } from "./flat-display-runtime.ts";
import { isFlatWireBinding } from "./flat-transaction-binding.ts";
import { buildFlatWireMarkerGuard, flatWireMarkerSpecification } from "./flat-wire-markers.ts";

export const SCHEMATIC_NATIVE_WIRE_PROFILE = "easyeda-pro-control.schematic-native-wire.v2";
// Allocation is immutable across proof revisions.
// Retained v1 journals keep their original LINE identities during verification.
const LINE_ALLOCATION_PROFILE = "easyeda-pro-control.schematic-native-wire.v1";
type Segment = readonly [number, number, number, number];
interface AttributeOrder { readonly id: string; readonly key: "Relevance" | "NET"; readonly beforeOrder: number; readonly order: number }
export interface SchematicNativeWireDescriptor {
  readonly profile: typeof SCHEMATIC_NATIVE_WIRE_PROFILE;
  readonly operationId: string;
  readonly beforeSourceSha256: string;
  readonly beforeNativeSha256: string;
  readonly wireId: string;
  readonly lineIds: readonly string[];
  readonly allocatedLineIds: readonly string[];
  readonly removedLineIds: readonly string[];
  readonly preservedAttributeIds: readonly string[];
  readonly attributeOrders: readonly AttributeOrder[];
  readonly expectedSourceSha256: string;
}
export interface SchematicNativeWireAdapter {
  readonly profile: typeof SCHEMATIC_NATIVE_WIRE_PROFILE;
  readonly expression: string;
  readonly expected: NativeSourceSnapshot;
  readonly descriptor: SchematicNativeWireDescriptor;
}
export interface SchematicNativeWireProof extends NativeSourceDelta {
  readonly nativeIdentity: { readonly profile: "native-wire-unstored-attribute-identity.v1"; readonly changes: readonly SchematicLifecycleChange[] };
}
const same = (a: unknown, b: unknown): boolean => canonicalJson(a) === canonicalJson(b);
const lineFields = ["endX", "endY", "fillColor", "fillStyle", "lineGroup", "startX", "startY", "strokeColor", "strokeStyle", "strokeWidth"];
const sourceStyles = ["SOLID", "SHORT_DASH", "DOT", "DOT_DASH"] as const;
function finite(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) { throw new TypeError("Native wire requires finite coordinates."); }
  return value;
}
function cardinal(segment: Segment): void {
  if ((segment[0] === segment[2]) === (segment[1] === segment[3])) { throw new Error("Native wire requires nonzero cardinal segments."); }
}

/** Pinned sch.js 3f50136f: refreshNetPoint (4131035) recreates endpoint
 * dots/junctions, then sortChildrenByCategory (3923364) orders LINEs,
 * junctions, dangling dots, custom ATTRs and NETs. Restoring obsolete ATTR
 * indices sets _childZIndexChange again; a later refresh restores categories.
 * Derive this sole two-ATTR profile from both complete graphs, never from an
 * observed discrepancy. The shared graph proof rejects buses, near-points
 * and ambiguous retained-group ownership. All other ATTR fields stay exact.
 */
function nativeWireAttributeOrders(before: NativeSourceSnapshot, geometry: NativeSourceSnapshot,
  native: SchematicNativeSnapshot, wireId: string, attrs: readonly NativeSourceObject[]): readonly AttributeOrder[] {
  const relevance = attrs.find((row) => row.body["key"] === "Relevance");
  const net = attrs.find((row) => row.body["key"] === "NET");
  if (attrs.length !== 2 || relevance === undefined || net === undefined || relevance.body["value"] !== "[]" ||
      relevance.body["x"] !== null || relevance.body["y"] !== null ||
      ![relevance.body["keyVisible"], relevance.body["valueVisible"]].every((value) => value === null || value === false) ||
      typeof net.body["value"] !== "string" || net.body["value"].length === 0 ||
      attrs.some((row) => !Number.isSafeInteger(row.body["zIndex"]) || Number(row.body["zIndex"]) < 0)) {
    throw new Error("Native wire order requires sole hidden Relevance and named NET attributes.");
  }
  const candidates = new Map([[wireId, relevance.id]]);
  const original = schematicNewWireOrders(before, new Map(before.objects.map((row) => [row.id, row])), native, candidates)[0];
  const projected = schematicNewWireOrders(before, new Map(geometry.objects.map((row) => [row.id, row])), native, candidates)[0];
  if (original === undefined || projected === undefined || !original.recategorized || !projected.recategorized ||
      relevance.body["zIndex"] !== original.zIndex || net.body["zIndex"] !== original.zIndex + 1) {
    throw new Error("Native wire requires canonical unambiguous before/after child categories.");
  }
  return [{ id: relevance.id, key: "Relevance", beforeOrder: original.zIndex, order: projected.zIndex },
    { id: net.id, key: "NET", beforeOrder: original.zIndex + 1, order: projected.zIndex + 1 }];
}

/** Fixed, version-pinned direct setLines path, not public wire.modify/Zo.
 * Supports only explicit geometry plus all three style fields, with net omitted.
 * Missing LINE identities derive from the sealed operation and original source;
 * preparation and reconciliation reproduce them without a live allocation call.
 * The executor journals before dispatch, retaining the sealed original source,
 * native snapshot and operation plus adapterProfile/code SHA. Those inputs
 * reproduce this exact expected source and descriptor during reconciliation.
 * This descriptor is reproducible data, never an execution or recovery token.
 */
export function buildSchematicNativeWireAdapter(input: unknown, sourceInput: NativeSourceSnapshot, nativeInput: unknown, flatGuard?: FlatDisplayRuntimeGuard): SchematicNativeWireAdapter {
  if (flatGuard !== undefined) {
    if (!isFlatWireBinding(flatGuard.binding)) { throw new Error("Native wire requires its own sealed flat reroute profile."); }
    assertFlatDisplayRuntimeAction(flatGuard, input);
  }
  const operation = schematicOperationSchema.parse(input);
  if (operation.action !== "sch.wire.modify" || operation.documentType !== 1 || !("primitiveId" in operation.target) ||
      !same(Object.keys(operation.patch).toSorted(), ["color", "line", "lineType", "lineWidth"])) {
    throw new Error("Native wire profile requires exact geometry/color/lineWidth/lineType and omitted net.");
  }
  const before = structuredClone(sourceInput), native = correlateSchematicNativeSource(before, nativeInput);
  if (!same(parseDocumentSource(native.source), before)) { throw new Error("Complete native/source baseline differs."); }
  const compiled = prepareSchematicSourceOperation(operation, before, native);
  const wireId = operation.target.primitiveId;
  const subtree = before.objects.filter((row) => row.id === wireId || row.body["lineGroup"] === wireId || row.body["parentId"] === wireId);
  const group = subtree.find((row) => row.id === wireId);
  if (group?.type !== "WIRE" || group.body["locked"] !== false ||
      (group.body["groupId"] !== undefined && group.body["groupId"] !== "") ||
      !Object.keys(group.body).every((key) => ["groupId", "locked", "zIndex"].includes(key)) || !Number.isFinite(group.body["zIndex"])) {
    throw new Error("Native wire requires an exact unlocked root WIRE profile.");
  }
  const oldLines = subtree.filter((row) => row.type === "LINE").toSorted((a, b) => a.id.localeCompare(b.id));
  const attrs = subtree.filter((row) => row.type === "ATTR").toSorted((a, b) => a.id.localeCompare(b.id));
  if (oldLines.length === 0 || oldLines.length > 4096 || subtree.length !== 1 + oldLines.length + attrs.length) {
    throw new Error("Native wire subtree contains unsupported records or LINE count.");
  }
  for (const row of oldLines) {
    if (!same(Object.keys(row.body).toSorted(), lineFields) || row.body["lineGroup"] !== wireId || row.body["fillColor"] !== null || row.body["fillStyle"] !== null ||
        (row.body["strokeStyle"] !== null && !sourceStyles.some((style) => style === row.body["strokeStyle"])) ||
        (row.body["strokeColor"] !== null && typeof row.body["strokeColor"] !== "string") ||
        (row.body["strokeWidth"] !== null && (finite(row.body["strokeWidth"]) < 1 || finite(row.body["strokeWidth"]) > 10))) {
      throw new Error("Native wire LINE source profile differs.");
    }
    cardinal([finite(row.body["startX"]), finite(row.body["startY"]), finite(row.body["endX"]), finite(row.body["endY"])]);
  }
  for (const row of attrs) {
    if (row.body["parentId"] !== wireId || (row.body["locked"] !== undefined && row.body["locked"] !== false) || !Number.isFinite(row.body["zIndex"])) {
      throw new Error("Native wire ATTR must retain an exact unlocked finite-order source body.");
    }
  }
  const line = operation.patch.line;
  if (line === undefined || operation.patch.color === undefined || operation.patch.lineWidth === undefined || operation.patch.lineType === undefined) {
    throw new Error("Native wire explicit patch fields cannot be undefined.");
  }
  const { color, lineWidth, lineType } = operation.patch;
  const paths = typeof line[0] === "number" ? [line] : line;
  const segments: Segment[] = [];
  for (const path of paths) {
    if (!Array.isArray(path)) { throw new TypeError("Native wire coordinate path is malformed."); }
    for (let index = 0; index < path.length - 2; index += 2) {
      const segment: Segment = [finite(path[index]), 0 - finite(path[index + 1]), finite(path[index + 2]), 0 - finite(path[index + 3])];
      cardinal(segment); segments.push(segment);
    }
  }
  if (segments.length === 0 || segments.length > 4096) { throw new Error("Native wire segment count exceeds the fixed profile."); }
  const usedIds = new Set(before.objects.map((row) => row.id));
  const allocatedLineIds: string[] = [];
  const nextLines = segments.map((segment, index): NativeSourceObject => {
    const previous = oldLines[index];
    const id = previous?.id ?? sha256Json({ profile: LINE_ALLOCATION_PROFILE, operation, beforeSourceSha256: before.sha256, wireId, index }).slice(0, 16);
    if (previous === undefined) {
      if (usedIds.has(id)) { throw new Error("Deterministic native wire LINE identity collides with source."); }
      usedIds.add(id); allocatedLineIds.push(id);
    }
    return { id, type: "LINE", body: { fillColor: null, fillStyle: null, strokeColor: color,
      strokeStyle: lineType === null ? null : sourceStyles[lineType], strokeWidth: lineWidth,
      startX: segment[0], startY: segment[1], endX: segment[2], endY: segment[3], lineGroup: wireId } };
  });
  const objects = [...before.objects.filter((row) => !oldLines.includes(row)), ...nextLines].toSorted((a, b) => a.id.localeCompare(b.id));
  const geometryBase = { schema: before.schema, document: before.document, objects };
  const geometry: NativeSourceSnapshot = { ...geometryBase, sha256: sha256Json(geometryBase) };
  // Independent existing exact segment-multiset/whole-source verifier, unchanged.
  verifySchematicSourceEffect(compiled, before, geometry);
  const attributeOrders = nativeWireAttributeOrders(before, geometry, native, wireId, attrs);
  const orders = new Map(attributeOrders.map((entry) => [entry.id, entry.order]));
  const expectedObjects: NativeSourceObject[] = [];
  for (const row of objects) {
    const order = orders.get(row.id);
    expectedObjects.push(order === undefined ? row : { ...row, body: { ...row.body, zIndex: order } });
  }
  const expectedBase = { ...geometryBase, objects: expectedObjects };
  const expected: NativeSourceSnapshot = { ...expectedBase, sha256: sha256Json(expectedBase) };
  const nextAttrs = expected.objects.filter((row) => row.type === "ATTR" && row.body["parentId"] === wireId);
  const descriptor: SchematicNativeWireDescriptor = { profile: SCHEMATIC_NATIVE_WIRE_PROFILE, operationId: operation.id,
    beforeSourceSha256: before.sha256, beforeNativeSha256: sha256Json(native), wireId,
    lineIds: nextLines.map((row) => row.id), allocatedLineIds, removedLineIds: oldLines.slice(nextLines.length).map((row) => row.id),
    preservedAttributeIds: attrs.map((row) => row.id), attributeOrders, expectedSourceSha256: expected.sha256 };
  const markerGuard = flatGuard === undefined ? undefined : buildFlatWireMarkerGuard(flatWireMarkerSpecification(expected, native, wireId), wireId);
  const expression = `(async () => {
const binding=${JSON.stringify(native.document)};
${SCHEMATIC_NATIVE_READER_CODE}
const canonical=value=>JSON.stringify(value,(_key,entry)=>entry&&typeof entry==='object'&&!Array.isArray(entry)?Object.fromEntries(Object.keys(entry).sort().map(key=>[key,entry[key]])):entry);
${buildSchematicLayoutPayloadCode(canonicalJson(native), JSON.stringify(expected.objects))}
const original=JSON.parse(baseline),wireId=${JSON.stringify(wireId)},groupRow=${JSON.stringify(group)};
const oldRows=${JSON.stringify(oldLines)},attrRows=${JSON.stringify(attrs)},nextAttrRows=${JSON.stringify(nextAttrs)},nextRows=${JSON.stringify(nextLines)};
const allocated=${JSON.stringify(allocatedLineIds)},removed=${JSON.stringify(descriptor.removedLineIds)};
const nativeStyle=${JSON.stringify({ strokeColor: color, strokeWidth: lineWidth, strokeStyle: lineType })};
const expectedDocument=${JSON.stringify(before.document)};
const sourceRows=snapshot=>{
 const records=snapshot.source.split('|\\n').filter(Boolean).map(line=>{const split=line.indexOf('||');if(split<0)throw new Error('SCH_WIRE_SOURCE_INVALID');return {head:JSON.parse(line.slice(0,split)),body:JSON.parse(line.slice(split+2))};});
 const head=records.shift();if(!head||head.head.type!=='DOCHEAD'||canonical(head.body)!==canonical(expectedDocument))throw new Error('SCH_WIRE_DOCUMENT_CHANGED');
 const rows=records.map(row=>({id:row.head.id,type:row.head.type,body:row.body}));
 if(rows.some(row=>typeof row.id!=='string'||typeof row.type!=='string'||!row.body||typeof row.body!=='object'||Array.isArray(row.body))||new Set(rows.map(row=>row.id)).size!==rows.length)throw new Error('SCH_WIRE_SOURCE_INVALID');
 return rows.sort((a,b)=>a.id.localeCompare(b.id));
};
const manager=schDoc.shapeManager;
if(typeof manager.idManager?.get!=='function'||typeof manager.actionRunner?.run!=='function'||typeof manager.bboxMonitor?.update!=='function')throw new Error('SCH_WIRE_API_MISSING');
const wire=manager.idManager.get(wireId);
${markerGuard === undefined ? "" : `const wireAfterMarkers=${markerGuard}(schDoc,manager);\n`}
${flatGuard === undefined ? "" : "const setLinesMethod=wire?.setLines;\n"}
const bindSubtree=(rows,attributesExpected,projectOrder=false)=>{
 ${flatGuard === undefined ? "" : "if(wire?.setLines!==setLinesMethod)throw new Error('FLAT_WIRE_METHOD_DRIFT');"}
 if(manager.idManager.get(wireId)!==wire||!wire||wire.id!==wireId||wire.tagName!=='NetGroup'||wire.type!=='wire'||wire.parent?.id!=='$$root'||wire.isConnected!==true||wire.locked!==false||typeof wire.setLines!=='function'||typeof wire.getAttr!=='function'||canonical(schBody(wire))!==canonical(groupRow.body))throw new Error('SCH_WIRE_TARGET_CHANGED');
 if(!Array.isArray(wire.lines)||!Array.isArray(wire.children))throw new Error('SCH_WIRE_CHILDREN_INVALID');
 const attributes=wire.getAttr();if(!Array.isArray(attributes)||attributes.length!==attrRows.length||new Set(attributes.map(attr=>attr.id)).size!==attributes.length)throw new Error('SCH_WIRE_ATTR_CHANGED');
 if(canonical(wire.lines.map(line=>line.id).sort())!==canonical(rows.map(row=>row.id).sort()))throw new Error('SCH_WIRE_LINES_CHANGED');
 const stored=new Set();
 for(const row of rows){const model=manager.idManager.get(row.id);if(!model||model.id!==row.id||model.parent!==wire||model.isConnected!==true||!wire.lines.includes(model)||canonical(schBody(model))!==canonical(row.body)||!Array.isArray(model.points)||model.points.length!==2)throw new Error('SCH_WIRE_LINE_CHANGED');stored.add(model);}
 for(const row of attributesExpected){const model=manager.idManager.get(row.id);if(!model||model.id!==row.id||model.parent!==wire||model.isConnected!==true||!attributes.includes(model))throw new Error('SCH_WIRE_ATTR_CHANGED');
  const actual=schBody(model);if(canonical(projectOrder?{...actual,zIndex:row.body.zIndex}:actual)!==canonical(row.body))throw new Error('SCH_WIRE_ATTR_CHANGED');stored.add(model);
 }
 if(new Set(wire.children).size!==wire.children.length||[...stored].some(model=>!wire.children.includes(model)))throw new Error('SCH_WIRE_CHILDREN_INVALID');
 for(const child of wire.children){if(stored.has(child))continue;
  if(!child||child.parent!==wire||child.isConnected!==true||child.notAddHistory!==true||typeof child.getConsistencyData!=='function'||child.getConsistencyData()!==undefined||!((child.tagName==='Junction'&&child.modelType==='Junction'&&child.cmdKey==='junction')||(child.tagName==='UnConnectDot'&&child.modelType==='UnConnectDot'&&child.cmdKey==='unConnectDot')))throw new Error('SCH_WIRE_UNKNOWN_CHILD');
 }
};
const beforeGuard=()=>{schCheck();if(canonical(schCapture())!==baseline)throw new Error('SCH_WIRE_BASELINE_CHANGED');bindSubtree(oldRows,attrRows);
 for(const id of allocated)if(manager.idManager.get(id)!=null)throw new Error('SCH_WIRE_ID_COLLISION');};
${flatGuard === undefined ? "" : `const flatDisplayGuard=await ${buildFlatDisplayRuntimeGuard(flatGuard, "source-action")};flatDisplayGuard.assertWriter(schNative,schManager,schDoc);await flatDisplayGuard.read();flatDisplayGuard.check();\n`}
beforeGuard();
const seed=wire.lines[0].points;
const clonePoint=(point,x,y)=>{if(!point||typeof point.scale!=='function'||!Number.isFinite(point.x)||!Number.isFinite(point.y))throw new Error('SCH_WIRE_POINT_INVALID');
 const copy=point.scale(1);if(!copy||copy===point||copy.x!==point.x||copy.y!==point.y||typeof copy.scale!=='function')throw new Error('SCH_WIRE_POINT_CLONE_INVALID');copy.x=x;copy.y=y;return copy;};
const changes=nextRows.map(row=>({id:row.id,...nativeStyle,points:[clonePoint(seed[0],row.body.startX,row.body.startY),clonePoint(seed[1],row.body.endX,row.body.endY)]}));
const afterModelGuard=()=>{schCheck();bindSubtree(nextRows,nextAttrRows);for(const id of removed)if(manager.idManager.get(id)!=null)throw new Error('SCH_WIRE_REMOVE_FAILED');
 const models=manager.getModels('Symbol');if(!Array.isArray(models)||models.length>20000)throw new Error('SCH_WIRE_COMPONENTS_INVALID');
 const components=models.map(model=>schCaptureComponent(model)).sort((a,b)=>a.id.localeCompare(b.id));
 if(canonical(components)!==canonical(original.components))throw new Error('SCH_WIRE_COMPONENTS_CHANGED');${markerGuard === undefined ? "" : "wireAfterMarkers();"}};
const applied=await ${flatGuard === undefined ? "manager.actionRunner" : "flatDisplayGuard"}.run(()=>{
 ${flatGuard === undefined ? "" : "flatDisplayGuard.assertWriter(schNative,schManager,schDoc);flatDisplayGuard.check();"}
 beforeGuard();wire.setLines(changes);
 // Refresh normal geometry/junction watchers while the native action is active.
 // Use the source-derived category indices, not obsolete original indices.
 manager.bboxMonitor.update();bindSubtree(nextRows,nextAttrRows,true);
 for(const row of nextAttrRows){const attr=manager.idManager.get(row.id);if(attr.zIndex!==row.body.zIndex)attr.zIndex=row.body.zIndex;}
 // Newly allocated LINEs enter sourceCodeIdMap at action-end history upload.
 // Prove model/attribute/component state here, never force an early upload.
 afterModelGuard();
});
if(applied!==true)throw new Error('SCH_WIRE_ACTION_REJECTED');
afterModelGuard();
const actual=schCapture();if(canonical(actual.document)!==canonical(original.document)||canonical(actual.components)!==canonical(original.components)||canonical(sourceRows(actual))!==canonical(desired))throw new Error('SCH_WIRE_EFFECT_MISMATCH');
return {primitiveId:wireId};
})()`;
  return { profile: SCHEMATIC_NATIVE_WIRE_PROFILE, expression, expected, descriptor };
}

/** Standalone native-wire proof only. Reproduce exact LINE identities from the
 * immutable v1 seed and derive the two category indices from the sealed before
 * graph plus the typed geometry. A reopened native model may only regenerate
 * unstored ATTR IDs with identical order and every other native field exact.
 * The aligned comparison copy never supplies source geometry or writer input.
 */
export function verifySchematicNativeWireEffect(input: unknown, before: NativeSourceSnapshot, after: NativeSourceSnapshot,
  beforeNative: unknown, afterNative: unknown): SchematicNativeWireProof {
  const adapter = buildSchematicNativeWireAdapter(input, before, beforeNative);
  const original = correlateSchematicNativeSource(before, beforeNative);
  const observed = correlateSchematicNativeSource(after, afterNative);
  if (!same(parseDocumentSource(observed.source), after) || !same(adapter.expected, after)) {
    throw new Error("Native wire differs from exact geometry, derived attribute order or complete native state.");
  }
  let changes: readonly SchematicLifecycleChange[] = [];
  if (!same({ ...original, source: "" }, { ...observed, source: "" })) {
    const pair = alignSchematicLifecyclePair(original, observed);
    // oxlint-disable-next-line typescript/no-unnecessary-boolean-literal-compare -- Require explicit false at the runtime proof boundary, even if malformed data contradicts the static Boolean type.
    if (pair.changes.some((change) => change.stored !== false || change.beforeZ !== change.afterZ) || !same(pair.observedSource, after) ||
        !same({ ...pair.reference, source: "" }, { ...pair.observed, source: "" })) {
      throw new Error("Native wire changed fields beyond exact unstored attribute identities.");
    }
    changes = pair.changes;
  }
  return { ...compareDocumentSources(before, after), nativeIdentity: { profile: "native-wire-unstored-attribute-identity.v1", changes } };
}
