import { canonicalJson, sha256Json } from "./core.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "./document-source.ts";
import type { SchematicLayoutBatch, SchematicLayoutEvidence } from "./schematic-layout-batch.ts";
import type { SchematicNativeSnapshot } from "./schematic-native-adapter.ts";
import { schematicNewWireOrders } from "./schematic-wire-order.ts";
import { assertSchematicLayoutConstructorWitness } from "./schematic-layout-constructor-witness.ts";

type Point = readonly [unknown, unknown];
const same = (a: unknown, b: unknown): boolean => canonicalJson({ value: a }) === canonicalJson({ value: b });
const ends = (row: NativeSourceObject): readonly Point[] => [[row.body["startX"], row.body["startY"]], [row.body["endX"], row.body["endY"]]];
const point = (body: Record<string, unknown>): Point => [body["x"], body["y"]];
const children = (rows: readonly NativeSourceObject[], id: string): NativeSourceObject[] => rows.filter((row) => row.body["parentId"] === id || row.body["lineGroup"] === id);
function hiddenRelevance(row: NativeSourceObject): boolean {
  return row.type === "ATTR" && row.body["key"] === "Relevance" && row.body["value"] === "[]" && row.body["x"] === null && row.body["y"] === null &&
    [row.body["keyVisible"], row.body["valueVisible"]].every((value) => value === null || value === false);
}
function wireAttributes(rows: readonly NativeSourceObject[], id: string): { relevance: NativeSourceObject; net: NativeSourceObject } {
  const attrs = children(rows, id).filter((row) => row.type !== "LINE");
  const relevance = attrs.find((row) => hiddenRelevance(row));
  const net = attrs.find((row) => row.type === "ATTR" && row.body["key"] === "NET");
  if (attrs.length !== 2 || relevance === undefined || net === undefined || typeof net.body["value"] !== "string" || net.body["value"].length === 0 ||
      ![relevance, net].every((row) => typeof row.body["zIndex"] === "number" && Number.isSafeInteger(row.body["zIndex"]) && row.body["zIndex"] >= 0)) {
    throw new Error("Retained wire order requires its sole hidden Relevance and named NET attributes.");
  }
  return { relevance, net };
}
/** Pinned sch.js SHA 3f50136fb4ba2d5593beac7ef3e20ebe5275177b56bbcfdd297e79f176a6618f:
 * _netNames is a Set (3922211); onChildChange maintains insertion order
 * (3927341), and sortChildrenByCategory (3923364) assigns its NET orders
 * after the sole custom Relevance. Retained handleModelData (4637373) keeps
 * the same model/parent; the parent setter (1922179) does not detach it.
 * Require an unambiguous existing category sequence, preserve that relative
 * order, and derive only its new starting index from the intended pin graph.
 */
function multipleNetWireAttributes(rows: readonly NativeSourceObject[], id: string): { relevance: NativeSourceObject; nets: readonly NativeSourceObject[] } | undefined {
  const attrs = children(rows, id).filter((row) => row.type !== "LINE");
  const relevance = attrs.filter((row) => hiddenRelevance(row));
  const nets = attrs.filter((row) => row.type === "ATTR" && row.body["key"] === "NET");
  const first = relevance[0], name = nets[0]?.body["value"];
  if (first === undefined || relevance.length !== 1 || nets.length < 2 || attrs.length !== nets.length + 1 ||
      typeof name !== "string" || name.length === 0 || nets.some((row) => row.body["value"] !== name) ||
      attrs.some((row) => row.body["parentId"] !== id || typeof row.body["zIndex"] !== "number" || !Number.isSafeInteger(row.body["zIndex"]) || row.body["zIndex"] < 0)) {
    return undefined;
  }
  const ordered = nets.toSorted((a, b) => Number(a.body["zIndex"]) - Number(b.body["zIndex"]));
  if (ordered.some((row, index) => row.body["zIndex"] !== Number(first.body["zIndex"]) + index + 1)) {
    return undefined;
  }
  return { relevance: first, nets: ordered };
}

function inactiveOrAbsentNoConnect(pin: SchematicNativeSnapshot["components"][number]["pins"][number],
  records: ReadonlyMap<string, NativeSourceObject>): boolean {
  const marker = pin.noConnect;
  if (marker === null) { return true; }
  // Pinned sch.js NoConnect.valueVisible (4276656) is true only for value
  // "yes". Removing a marker can retain an explicit "no" ATTR. Admit only
  // That exact source-bound inactive record, never other falsy values.
  const stored = records.get(marker.id);
  return marker.value === "no" && marker.body["value"] === "no" && marker.body["key"] === "NO_CONNECT" &&
    marker.body["parentId"] === pin.id && stored?.type === "ATTR" && same(stored.body, marker.body) &&
    [...records.values()].filter((row) => row.type === "ATTR" && row.body["key"] === "NO_CONNECT" && row.body["parentId"] === pin.id).length === 1;
}

interface RetainedWireOrderBase {
  readonly id: string;
  readonly relevanceId: string; readonly netId: string; readonly lines: number; readonly junctions: number; readonly danglingDots: number;
  readonly beforeRelevanceOrder: number; readonly relevanceOrder: number; readonly beforeNetOrder: number; readonly netOrder: number;
}
export interface RetainedWireOrder extends RetainedWireOrderBase {
  readonly componentId: string; readonly removedStubId: string;
}
export interface FullImportRetainedWireOrder extends RetainedWireOrderBase {
  readonly profile: "full-import-unchanged-retained-wire";
}
export interface FullImportMultipleNetWireOrder {
  readonly profile: "full-import-unchanged-retained-multiple-net-wire";
  readonly id: string; readonly relevanceId: string; readonly lines: number; readonly junctions: number; readonly danglingDots: number;
  readonly beforeRelevanceOrder: number; readonly relevanceOrder: number;
  readonly nets: readonly { readonly id: string; readonly beforeOrder: number; readonly order: number }[];
}
export interface DetachedPinSparseTwoNetWireOrder extends Omit<FullImportMultipleNetWireOrder, "profile"> {
  readonly profile: "full-import-detached-pin-sparse-two-net-wire";
  readonly departingComponentId: string;
  readonly departingPinId: string;
  readonly retainedPinId: string;
  readonly constructorOperationId: string;
  readonly firstClockOrderSha256: string;
}
type SchematicRetainedWireOrder = RetainedWireOrder | FullImportRetainedWireOrder | FullImportMultipleNetWireOrder | DetachedPinSparseTwoNetWireOrder;
export function retainedWireAttributeOrders(order: SchematicRetainedWireOrder): readonly { id: string; key: "Relevance" | "NET"; beforeOrder: number; order: number }[] {
  const nets = "nets" in order ? order.nets : [{ id: order.netId, beforeOrder: order.beforeNetOrder, order: order.netOrder }];
  return [{ id: order.relevanceId, key: "Relevance", beforeOrder: order.beforeRelevanceOrder, order: order.relevanceOrder },
    ...nets.map((net) => ({ id: net.id, beforeOrder: net.beforeOrder, order: net.order, key: "NET" as const }))];
}
type DisplayPatch = Extract<SchematicLayoutBatch["operations"][number], { action: "sch.attribute.display" }>["patch"];
type DisplayMapper = (body: Record<string, unknown>, patch: DisplayPatch) => Record<string, unknown>;

/** Pinned sch.js refreshNetPoint (4131035) appends a junction to the maximum
 * global-order owner and then invokes NetGroup.sortChildrenByCategory
 * (3923364): lines, junctions, dangling dots, custom attributes, NET names.
 * Existing groups are recategorized too. Restrict this additional profile to
 * a one-pin netport moved from an explicitly deleted isolated stub onto an
 * unchanged retained wire. Candidates come from the typed operation and its
 * projected pin graph, never from discrepancies in an observed result.
 */
function attachedPortWireOrders(operation: SchematicLayoutBatch, before: NativeSourceSnapshot,
  records: ReadonlyMap<string, NativeSourceObject>, beforeNative: SchematicNativeSnapshot, native: SchematicNativeSnapshot): readonly RetainedWireOrder[] {
  if (operation.operations.some((step) => !["sch.component.translate", "sch.attribute.display", "sch.wire.delete"].includes(step.action))) { return []; }
  const moves = operation.operations.filter((step) => step.action === "sch.component.translate");
  if (moves.length === 0 || moves.some((step) => {
    const id = "primitiveId" in step.target ? step.target.primitiveId : undefined;
    return id === undefined || beforeNative.components.find((model) => model.id === id)?.kind !== "netport";
  })) { return []; }
  const removed = new Set(operation.operations.flatMap((step) => step.action === "sch.wire.delete" && "primitiveId" in step.target ? [step.target.primitiveId] : []));
  const rows = [...records.values()];
  const old = new Map(before.objects.map((row) => [row.id, row]));
  const candidates = new Map<string, { componentId: string; removedStubId: string; relevance: NativeSourceObject; net: NativeSourceObject }>();
  const addCandidate = (step: (typeof moves)[number]): void => {
    if (!("primitiveId" in step.target)) { throw new Error("Retained wire attachment needs a retained component identity."); }
    const componentId = step.target.primitiveId;
    const original = beforeNative.components.find((model) => model.id === componentId);
    const moved = native.components.find((model) => model.id === componentId);
    const pin = original?.pins[0];
    const movedPin = moved?.pins[0];
    if (original?.kind !== "netport" || moved?.kind !== "netport" || original.pins.length !== 1 || moved.pins.length !== 1 || pin === undefined || movedPin === undefined ||
        pin.id !== movedPin.id || pin.net !== movedPin.net || typeof pin.net !== "string" || pin.net.length === 0 || !same(pin.noConnect, movedPin.noConnect)) {
      throw new Error("Retained wire attachment lost its exact one-pin netport contract.");
    }
    const stubs = before.objects.filter((row) => row.type === "WIRE" && removed.has(row.id) && children(before.objects, row.id).some((child) => child.type === "LINE" && ends(child).some((xy) => same(xy, point(pin.body)))));
    if (stubs.length === 0) { return; }
    const stub = stubs[0];
    if (stubs.length !== 1 || stub === undefined || records.has(stub.id)) { throw new Error("Retained wire attachment has ambiguous or undeleted source stubs."); }
    const stubChildren = children(before.objects, stub.id);
    const stubLines = stubChildren.filter((row) => row.type === "LINE");
    const stubAttrs = wireAttributes(before.objects, stub.id);
    if (stubLines.length !== 1 || stubAttrs.net.body["value"] !== pin.net || stubChildren.some((row) => records.has(row.id))) { throw new Error("Retained wire attachment needs an entirely removed single-line named stub."); }
    const stubLine = stubLines[0];
    if (stubLine === undefined || (stubLine.body["startX"] === stubLine.body["endX"]) === (stubLine.body["startY"] === stubLine.body["endY"])) { throw new Error("Retained wire stub must be nonzero and orthogonal."); }
    const onStub = (xy: Point): boolean => {
      const [a, b] = ends(stubLine);
      if (a === undefined || b === undefined || ![...xy, ...a, ...b].every((value) => typeof value === "number" && Number.isFinite(value))) { throw new Error("Retained wire stub coordinate is not finite."); }
      return (a[0] === b[0] && xy[0] === a[0] && Number(xy[1]) >= Math.min(Number(a[1]), Number(b[1])) && Number(xy[1]) <= Math.max(Number(a[1]), Number(b[1]))) ||
        (a[1] === b[1] && xy[1] === a[1] && Number(xy[0]) >= Math.min(Number(a[0]), Number(b[0])) && Number(xy[0]) <= Math.max(Number(a[0]), Number(b[0])));
    };
    if (beforeNative.components.flatMap((model) => model.pins).some((other) => other.id !== pin.id && onStub(point(other.body))) ||
        before.objects.some((row) => row.type === "LINE" && row.body["lineGroup"] !== stub.id && old.get(String(row.body["lineGroup"]))?.type === "WIRE" && ends(row).some((xy) => onStub(xy)))) {
      throw new Error("Retained wire source stub is not isolated from other pins and groups.");
    }
    const destinations = rows.filter((row) => row.type === "WIRE" && old.get(row.id)?.type === "WIRE" && children(rows, row.id).some((child) => child.type === "LINE" && ends(child).some((xy) => same(xy, point(movedPin.body)))));
    const wire = destinations[0];
    if (destinations.length !== 1 || wire === undefined || candidates.has(wire.id) || !same(old.get(wire.id), wire)) { throw new Error("Retained wire destination is ambiguous, reused or changed."); }
    const attrs = wireAttributes(before.objects, wire.id), nextAttrs = wireAttributes(rows, wire.id);
    const originalChildren = children(before.objects, wire.id);
    const currentChildren = children(rows, wire.id);
    if (attrs.net.body["value"] !== pin.net || !same(originalChildren.map((row) => row.id).toSorted(), currentChildren.map((row) => row.id).toSorted()) ||
        !same(attrs.relevance, nextAttrs.relevance)) { throw new Error("Retained wire children, naming or hidden Relevance changed."); }
    for (const row of currentChildren) {
      const prior = old.get(row.id);
      const visibilitySteps = operation.operations.filter((entry) => entry.action === "sch.attribute.display" && "primitiveId" in entry.target && entry.target.primitiveId === row.id);
      const visibility = visibilitySteps.at(-1);
      const allowed = row.id === attrs.net.id && visibility?.action === "sch.attribute.display" && visibilitySteps.every((entry) => entry.action === "sch.attribute.display" && same(Object.keys(entry.patch), ["valueVisible"]));
      if (!same(prior, row) && !(allowed && prior !== undefined && same({ ...prior, body: { ...prior.body, valueVisible: visibility.patch.valueVisible } }, row))) {
        throw new Error("Retained wire geometry or attribute fields differ beyond the exact requested NET visibility.");
      }
    }
    candidates.set(wire.id, { componentId, removedStubId: stub.id, ...attrs });
  };
  for (const step of moves) { addCandidate(step); }
  const orders = schematicNewWireOrders(before, records, native, new Map([...candidates].map(([id, value]) => [id, value.relevance.id])));
  return orders.filter((order) => order.recategorized).map((order) => {
    const candidate = candidates.get(order.id);
    if (candidate === undefined) { throw new Error("Retained wire order candidate is absent."); }
    return { id: order.id, componentId: candidate.componentId, removedStubId: candidate.removedStubId, relevanceId: order.relevanceId, netId: candidate.net.id,
      lines: order.lines, junctions: order.junctions, danglingDots: order.danglingDots,
      beforeRelevanceOrder: Number(candidate.relevance.body["zIndex"]), relevanceOrder: order.zIndex,
      beforeNetOrder: Number(candidate.net.body["zIndex"]), netOrder: order.zIndex + 1 };
  });
}

/** The same pinned refreshNetPoint also recreates already-existing dangling
 * dots after the layout writer imports the complete intended source. Appending
 * them requests sortChildrenByCategory even when that wire was not edited.
 * Derive candidates solely from retained source identities and the typed plan;
 * never inspect an observed discrepancy. This additional scope is deliberately
 * limited to circuit batches creating wires and unchanged, named wire groups.
 */
function fullImportWireOrders(operation: SchematicLayoutBatch, before: NativeSourceSnapshot,
  records: ReadonlyMap<string, NativeSourceObject>, native: SchematicNativeSnapshot, display?: DisplayMapper): readonly (FullImportRetainedWireOrder | FullImportMultipleNetWireOrder)[] {
  if (!operation.operations.some((step) => step.action === "sch.wire.create")) { return []; }
  const replacements = new Set(operation.operations.flatMap((step) => step.action === "sch.wire.replace" && "primitiveId" in step.target ? [step.target.primitiveId] : []));
  const rows = [...records.values()];
  const candidates = new Map<string, { relevance: NativeSourceObject; nets: readonly NativeSourceObject[] }>();
  const old = new Map(before.objects.map((row) => [row.id, row]));
  const addCandidate = (wire: NativeSourceObject): void => {
    if (!same(wire, records.get(wire.id))) { throw new Error("Full-import retained wire root changed."); }
    const current = children(rows, wire.id), prior = children(before.objects, wire.id);
    if (!same(prior.map((row) => row.id).toSorted(), current.map((row) => row.id).toSorted())) { throw new Error("Full-import retained wire child inventory changed."); }
    const priorAttrs = prior.filter((row) => row.type !== "LINE");
    const multiple = priorAttrs.filter((row) => row.type === "ATTR" && row.body["key"] === "NET").length > 1;
    // Other pre-existing child categories receive no order allowance.
    // Multiple-NET profiles must instead prove every child and its strict order.
    if (priorAttrs.length !== 2 && !multiple) { return; }
    const attrs = multiple ? multipleNetWireAttributes(before.objects, wire.id) : ((): NonNullable<ReturnType<typeof multipleNetWireAttributes>> => {
      const single = wireAttributes(before.objects, wire.id);
      return { relevance: single.relevance, nets: [single.net] };
    })();
    // Eligibility comes only from the original source. Unsupported original
    // Profiles retain exact-effect verification with no ordering allowance.
    if (attrs === undefined) { return; }
    if (multiple) {
      if (multipleNetWireAttributes(rows, wire.id) === undefined) { throw new Error("Eligible multiple-NET retained wire profile changed."); }
    } else { wireAttributes(rows, wire.id); }
    const lines = prior.filter((row) => row.type === "LINE");
    if (lines.length === 0 || lines.some((row) => (row.body["startX"] === row.body["endX"]) === (row.body["startY"] === row.body["endY"]))) {
      throw new Error("Full-import retained wire requires nonzero orthogonal lines.");
    }
    for (const row of current) {
      const original = old.get(row.id);
      if (original === undefined) { throw new Error("Full-import retained wire child is absent."); }
      let expected = original;
      const changes = operation.operations.filter((step) => (step.action === "sch.attribute.display" || step.action === "sch.net-label.display") && "primitiveId" in step.target && step.target.primitiveId === row.id);
      for (const step of changes) {
        if (!("patch" in step) || !attrs.nets.some((net) => net.id === row.id) || display === undefined) { throw new Error("Full-import retained wire has an unsupported display request."); }
        expected = { id: original.id, type: original.type, body: display(expected.body, step.patch) };
      }
      if (!same(expected, row)) { throw new Error("Full-import retained wire geometry or unrequested attribute fields changed."); }
    }
    const endpoints = lines.flatMap((row) => ends(row));
    for (const xy of endpoints) {
      // The native shared-group owner depends on first insertion. Do not
      // Infer an owner or net for a newly created/unbound foreign group here.
      if (rows.some((row) => row.type === "LINE" && row.body["lineGroup"] !== wire.id && records.get(String(row.body["lineGroup"]))?.type === "WIRE" && ends(row).some((end) => same(end, xy)))) {
        throw new Error("Full-import retained wire shares an endpoint with another group.");
      }
      if (native.components.flatMap((model) => model.pins).some((pin) => same(point(pin.body), xy) && (pin.net !== attrs.nets[0]?.body["value"] || !inactiveOrAbsentNoConnect(pin, records)))) {
        throw new Error("Full-import retained wire endpoint has a foreign-net or NC pin.");
      }
    }
    candidates.set(wire.id, attrs);
  };
  for (const wire of before.objects.filter((row) => row.type === "WIRE" && records.has(row.id) && !replacements.has(row.id))) { addCandidate(wire); }
  const orders = schematicNewWireOrders(before, records, native, new Map([...candidates].map(([id, value]) => [id, value.relevance.id])));
  return orders.filter((order) => order.recategorized).flatMap((order): (FullImportRetainedWireOrder | FullImportMultipleNetWireOrder)[] => {
    const candidate = candidates.get(order.id);
    if (candidate === undefined) { throw new Error("Full-import retained wire candidate is absent."); }
    const beforeRelevanceOrder = Number(candidate.relevance.body["zIndex"]);
    const nets = candidate.nets.map((net, index) => ({ id: net.id, beforeOrder: Number(net.body["zIndex"]), order: order.zIndex + index + 1 }));
    if (beforeRelevanceOrder === order.zIndex && nets.every((net) => net.beforeOrder === net.order)) { return []; }
    if (nets.length > 1) {
      return [{ profile: "full-import-unchanged-retained-multiple-net-wire", id: order.id, relevanceId: order.relevanceId,
        lines: order.lines, junctions: order.junctions, danglingDots: order.danglingDots, beforeRelevanceOrder, relevanceOrder: order.zIndex, nets }];
    }
    const net = nets[0];
    if (net === undefined) { throw new Error("Full-import retained wire has no NET attribute."); }
    return [{ profile: "full-import-unchanged-retained-wire", id: order.id, relevanceId: order.relevanceId, netId: net.id,
      lines: order.lines, junctions: order.junctions, danglingDots: order.danglingDots,
      beforeRelevanceOrder, relevanceOrder: order.zIndex, beforeNetOrder: net.beforeOrder, netOrder: net.order }];
  });
}

function sparseTwoNetAttributes(rows: readonly NativeSourceObject[], id: string): {
  relevance: NativeSourceObject; nets: readonly NativeSourceObject[]; line: NativeSourceObject;
} | undefined {
  const owned = children(rows, id);
  const lines = owned.filter((row) => row.type === "LINE");
  const relevance = owned.filter((row) => hiddenRelevance(row));
  const nets = owned.filter((row) => row.type === "ATTR" && row.body["key"] === "NET");
  const first = relevance[0], line = lines[0], name = nets[0]?.body["value"];
  if (owned.length !== 4 || lines.length !== 1 || line === undefined || relevance.length !== 1 || first === undefined || nets.length !== 2 ||
      // The r$ importer buffers children in a plain object.
      // Array-index IDs can reorder the worker's first-clock sequence.
      [first, ...nets].some((row) => /^(?:0|[1-9]\d*)$/u.test(row.id) && Number(row.id) < 4_294_967_295) ||
      line.body["lineGroup"] !== id || typeof name !== "string" || name.length === 0 ||
      (line.body["startX"] === line.body["endX"]) === (line.body["startY"] === line.body["endY"]) ||
      ends(line).flat().some((value) => typeof value !== "number" || !Number.isFinite(value)) ||
      [first, ...nets].some((row) => row.body["parentId"] !== id || typeof row.body["zIndex"] !== "number" || !Number.isSafeInteger(row.body["zIndex"]) || row.body["zIndex"] < 0) ||
      nets.some((row) => row.body["value"] !== name || row.body["valueVisible"] !== true ||
        [row.body["x"], row.body["y"]].some((value) => typeof value !== "number" || !Number.isFinite(value)))) { return undefined; }
  const ordered = nets.toSorted((left, right) => Number(left.body["zIndex"]) - Number(right.body["zIndex"]));
  if (Number(ordered[0]?.body["zIndex"]) <= Number(first.body["zIndex"]) || ordered[0]?.body["zIndex"] === ordered[1]?.body["zIndex"] ||
      ordered.every((row, index) => row.body["zIndex"] === Number(first.body["zIndex"]) + index + 1)) { return undefined; }
  return { relevance: first, nets: ordered, line };
}

/** A cheap trigger for managed recovery evidence, not an admission proof. */
export function needsSchematicLayoutConstructorWitness(operation: SchematicLayoutBatch, before: NativeSourceSnapshot,
  beforeNative: SchematicNativeSnapshot | undefined): boolean {
  if (beforeNative === undefined || !operation.operations.some((step) => step.action === "sch.wire.create")) { return false; }
  const moving = new Set(operation.operations.flatMap((step) => step.action === "sch.component.translate" && "primitiveId" in step.target ? [step.target.primitiveId] : []));
  return before.objects.some((wire) => {
    if (wire.type !== "WIRE") { return false; }
    const attrs = sparseTwoNetAttributes(before.objects, wire.id);
    return attrs !== undefined && beforeNative.components.some((model) => model.kind === "part" && moving.has(model.id) &&
      model.pins.some((pin) => ends(attrs.line).some((xy) => same(xy, point(pin.body)))));
  });
}

type ConstructorEvidence = Pick<SchematicLayoutEvidence, "history" | "constructorWitness">;
/** Pinned sch.js 3f50136f...: d7.init (4660740) calls s7/ule.init
 * (4612859/1823898), then cle.init (1820223), then vP.init (1791274).
 * The mapped sixth argument is needNum=true. Pinned project-worker.js
 * 2792c6c8... sorts that cold import by firstTicket/client (286378).
 * r$ (46458xx) defers ATTRs without changing their order; onChildChange
 * (3927341) adds them to _netNames. A verified cold reopen is required:
 * first clocks alone cannot exclude transient detach/reinsert of a live Set.
 * Retained same-parent handleModelData (4637373/1922179) then preserves it.
 */
function sparseTwoNetFirstOrder(before: NativeSourceSnapshot, native: SchematicNativeSnapshot,
  wire: NativeSourceObject, attrs: NonNullable<ReturnType<typeof sparseTwoNetAttributes>>, evidence: ConstructorEvidence): string {
  assertSchematicLayoutConstructorWitness(evidence.constructorWitness, before, native, evidence.history);
  const page = evidence.history.documents.find((document) => document.uuid === before.document["uuid"]);
  if (page?.docType !== "SCH_PAGE" || evidence.history.documents.filter((document) => document.uuid === page.uuid).length !== 1 ||
      new Set(page.records.map((row) => row.id)).size !== page.records.length ||
      page.semanticSha256 !== sha256Json({ uuid: page.uuid, docType: page.docType, metadata: page.metadata,
        records: page.records.map(({ id, type, body }) => ({ id, type, body })) }) ||
      evidence.history.semanticSha256 !== sha256Json(evidence.history.documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 })))) {
    throw new Error("Sparse two-NET constructor evidence lacks a complete hash-bound history page.");
  }
  const durable = page.records.filter((row) => row.id === wire.id || row.body["parentId"] === wire.id || row.body["lineGroup"] === wire.id);
  const original = [wire, ...children(before.objects, wire.id)].toSorted((left, right) => left.id.localeCompare(right.id));
  if (!same(durable.map(({ id, type, body }) => ({ id, type, body })).toSorted((left, right) => left.id.localeCompare(right.id)), original)) {
    throw new Error("Sparse two-NET constructor requires the complete durable group to equal the before source.");
  }
  const clocks = durable.filter((row) => row.type === "ATTR");
  if (clocks.length !== 3 || clocks.some((row) => row.firstTicket === undefined || !Number.isSafeInteger(row.firstTicket) || row.firstTicket < 1 ||
      !Number.isSafeInteger(row.ticket) || row.firstTicket > row.ticket || typeof row.firstClient !== "string" || !/^[a-f0-9]{16}$/u.test(row.firstClient)) ||
      clocks.some((row, index) => clocks.slice(index + 1).some((peer) => row.firstTicket === peer.firstTicket && row.firstClient === peer.firstClient))) {
    throw new Error("Sparse two-NET constructor first clocks are missing or ambiguous.");
  }
  const ordered = clocks.filter((row) => row.body["key"] === "NET").toSorted((left, right) => {
    const ticketOrder = Number(left.firstTicket) - Number(right.firstTicket);
    if (ticketOrder !== 0) { return ticketOrder; }
    if (String(left.firstClient) < String(right.firstClient)) { return -1; }
    return String(left.firstClient) > String(right.firstClient) ? 1 : 0;
  });
  if (!same(ordered.map((row) => row.id), attrs.nets.map((row) => row.id))) { throw new Error("Sparse two-NET constructor order disagrees with the before caption order."); }
  return sha256Json(ordered.map(({ id, firstTicket, firstClient }) => ({ id, firstTicket, firstClient })));
}

function nearSegment(xy: Point, line: NativeSourceObject): boolean {
  const [a, b] = ends(line);
  if (a === undefined || b === undefined || [...xy, ...a, ...b].some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    throw new Error("Sparse two-NET graph has a non-finite coordinate.");
  }
  return Number(xy[0]) >= Math.min(Number(a[0]), Number(b[0])) - 0.25 && Number(xy[0]) <= Math.max(Number(a[0]), Number(b[0])) + 0.25 &&
    Number(xy[1]) >= Math.min(Number(a[1]), Number(b[1])) - 0.25 && Number(xy[1]) <= Math.max(Number(a[1]), Number(b[1])) + 0.25;
}

function nearLine(left: NativeSourceObject, right: NativeSourceObject): boolean {
  const leftEnds = ends(left), rightEnds = ends(right);
  if ([...leftEnds.flat(), ...rightEnds.flat()].some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    throw new Error("Sparse two-NET graph has a non-finite line coordinate.");
  }
  return [0, 1].every((axis) => Math.max(...leftEnds.map((xy) => Number(xy[axis]))) + 0.25 >= Math.min(...rightEnds.map((xy) => Number(xy[axis]))) &&
    Math.max(...rightEnds.map((xy) => Number(xy[axis]))) + 0.25 >= Math.min(...leftEnds.map((xy) => Number(xy[axis]))));
}

function detachedPinSparseTwoNetOrders(operation: SchematicLayoutBatch, before: NativeSourceSnapshot,
  records: ReadonlyMap<string, NativeSourceObject>, beforeNative: SchematicNativeSnapshot, native: SchematicNativeSnapshot,
  evidence?: ConstructorEvidence): readonly DetachedPinSparseTwoNetWireOrder[] {
  if (evidence?.constructorWitness === undefined || !needsSchematicLayoutConstructorWitness(operation, before, beforeNative)) { return []; }
  const constructorWitness = evidence.constructorWitness;
  const rows = [...records.values()];
  const old = new Map(before.objects.map((row) => [row.id, row]));
  const candidates = new Map<string, { attrs: NonNullable<ReturnType<typeof sparseTwoNetAttributes>>; departingComponentId: string;
    departingPinId: string; retainedPinId: string; firstClockOrderSha256: string }>();
  const beforePins = beforeNative.components.flatMap((model) => model.pins.map((pin) => ({ model, pin })));
  const afterPins = native.components.flatMap((model) => model.pins.map((pin) => ({ model, pin })));
  const addCandidate = (wire: NativeSourceObject): void => {
    const attrs = sparseTwoNetAttributes(before.objects, wire.id);
    if (attrs === undefined) { return; }
    const departing = beforePins.filter(({ model, pin }) => model.kind === "part" && ends(attrs.line).some((xy) => same(xy, point(pin.body))) &&
      operation.operations.some((step) => step.action === "sch.component.translate" && "primitiveId" in step.target && step.target.primitiveId === model.id &&
        (step.x !== model.body["x"] || -step.y !== model.body["y"])));
    if (departing.length === 0) { return; }
    const departure = departing[0];
    if (departure === undefined || departing.length !== 1) { throw new Error("Sparse two-NET wire needs one unique typed departing part pin."); }
    if (!same(wire, records.get(wire.id)) || !same(children(rows, wire.id).toSorted((left, right) => left.id.localeCompare(right.id)),
      children(before.objects, wire.id).toSorted((left, right) => left.id.localeCompare(right.id)))) { throw new Error("Sparse two-NET retained group changed."); }
    const moves = operation.operations.filter((step) => step.action === "sch.component.translate" && "primitiveId" in step.target && step.target.primitiveId === departure.model.id);
    const move = moves[0], next = afterPins.filter(({ pin }) => pin.id === departure.pin.id);
    const moved = next[0];
    if (moves.length !== 1 || move?.action !== "sch.component.translate" || next.length !== 1 || moved === undefined || moved.model.id !== departure.model.id ||
        moved.model.kind !== "part" || moved.pin.net !== departure.pin.net || departure.pin.noConnect !== null || moved.pin.noConnect !== null) {
      throw new Error("Sparse two-NET departure lost its exact typed translation or null-NC pin contract.");
    }
    const dx = move.x - Number(departure.model.body["x"]), dy = -move.y - Number(departure.model.body["y"]);
    if (![dx, dy].every((value) => Number.isFinite(value)) || !same(moved.pin.body, { ...departure.pin.body, x: Number(departure.pin.body["x"]) + dx, y: Number(departure.pin.body["y"]) + dy }) ||
        moved.model.body["x"] !== move.x || moved.model.body["y"] !== -move.y) { throw new Error("Sparse two-NET departing pin is not the requested translation."); }
    const occupants = beforePins.filter(({ pin }) => nearSegment(point(pin.body), attrs.line));
    const other = occupants.filter(({ pin }) => pin.id !== departure.pin.id), retained = other[0];
    const opposite = ends(attrs.line).find((xy) => !same(xy, point(departure.pin.body)));
    if (occupants.length !== 2 || other.length !== 1 || retained === undefined || opposite === undefined || retained.model.kind !== "part" ||
        !same(point(retained.pin.body), opposite) || [departure.pin, retained.pin].some((pin) => pin.net !== attrs.nets[0]?.body["value"] || pin.noConnect !== null) ||
        beforePins.filter(({ pin }) => pin.id === retained.pin.id || pin.id === departure.pin.id).length !== 2) { throw new Error("Sparse two-NET before endpoints are not two isolated same-net null-NC part pins."); }
    const retainedAfter = afterPins.filter(({ pin }) => nearSegment(point(pin.body), attrs.line));
    if (retainedAfter.length !== 1 || retainedAfter[0]?.model.id !== retained.model.id || !same(retainedAfter[0]?.pin, retained.pin) ||
        !same(retainedAfter[0]?.model.body, retained.model.body)) { throw new Error("Sparse two-NET projected endpoint has another, near, changed or NC pin."); }
    for (const collection of [before.objects, rows]) {
      if (collection.some((row) => row.type === "LINE" && row.body["lineGroup"] !== wire.id &&
          (old.get(String(row.body["lineGroup"]))?.type === "WIRE" || records.get(String(row.body["lineGroup"]))?.type === "WIRE") &&
          nearLine(row, attrs.line))) {
        throw new Error("Sparse two-NET line has another or near wire occupancy.");
      }
    }
    const firstClockOrderSha256 = sparseTwoNetFirstOrder(before, beforeNative, wire, attrs, evidence);
    candidates.set(wire.id, { attrs, departingComponentId: departure.model.id, departingPinId: departure.pin.id, retainedPinId: retained.pin.id, firstClockOrderSha256 });
  };
  for (const wire of before.objects.filter((row) => row.type === "WIRE" && records.has(row.id))) { addCandidate(wire); }
  const derived = schematicNewWireOrders(before, records, native, new Map([...candidates].map(([id, { attrs }]) => [id, attrs.relevance.id])));
  return derived.map((order): DetachedPinSparseTwoNetWireOrder => {
    const candidate = candidates.get(order.id);
    if (candidate === undefined || order.lines !== 1 || order.junctions !== 0 || order.danglingDots !== 1 || !order.recategorized || order.zIndex !== 2) {
      throw new Error("Sparse two-NET detachment does not derive exactly one new dangling dot and no junction.");
    }
    return { profile: "full-import-detached-pin-sparse-two-net-wire", id: order.id, relevanceId: order.relevanceId,
      lines: order.lines, junctions: order.junctions, danglingDots: order.danglingDots,
      beforeRelevanceOrder: Number(candidate.attrs.relevance.body["zIndex"]), relevanceOrder: order.zIndex,
      nets: candidate.attrs.nets.map((net, index) => ({ id: net.id, beforeOrder: Number(net.body["zIndex"]), order: order.zIndex + index + 1 })),
      departingComponentId: candidate.departingComponentId, departingPinId: candidate.departingPinId, retainedPinId: candidate.retainedPinId,
      constructorOperationId: constructorWitness.predecessorOperationId, firstClockOrderSha256: candidate.firstClockOrderSha256 };
  });
}

export function schematicRetainedWireOrders(operation: SchematicLayoutBatch, before: NativeSourceSnapshot,
  records: ReadonlyMap<string, NativeSourceObject>, beforeNative: SchematicNativeSnapshot, native: SchematicNativeSnapshot,
  display?: DisplayMapper, evidence?: ConstructorEvidence): readonly SchematicRetainedWireOrder[] {
  return [...attachedPortWireOrders(operation, before, records, beforeNative, native), ...fullImportWireOrders(operation, before, records, native, display),
    ...detachedPinSparseTwoNetOrders(operation, before, records, beforeNative, native, evidence)];
}
