import { z } from "zod";
import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "./document-source.ts";

export const PCB_ROUTE_AUDIT_PROFILE = "easyeda-pro-control.pcb-route-audit.v1";
const name = z.string().min(1).max(512); const coordinate = z.number().min(-10_000_000).max(10_000_000);
const names = z.array(name).max(256).refine((values) => new Set(values).size === values.length, "Duplicate selection.");
const pathRequest = z.object({ net: name, fromPad: name, toPad: name }).strict().refine((value) => value.fromPad !== value.toPad, "Path pads must differ.");
const widthContract = z.object({ net: name, layer: z.number().int().positive(), minMil: z.number().positive(), maxMil: z.number().positive() }).strict().refine((value) => value.minMil <= value.maxMil, "Width bounds are reversed.");
export const pcbRouteAuditRequestSchema = z.object({
  kind: z.literal("pcb-route-audit"), nets: names.optional(), differentialPairs: names.optional(),
  paths: z.array(pathRequest).max(256).default([]), widthContracts: z.array(widthContract).max(2048).default([]),
}).strict().superRefine((value, context) => {
  if (new Set(value.paths.map((entry) => entry.net)).size !== value.paths.length) { context.addIssue({ code: "custom", message: "Choose at most one path per net." }); }
  if (new Set(value.widthContracts.map((entry) => canonicalJson([entry.net, entry.layer]))).size !== value.widthContracts.length) { context.addIssue({ code: "custom", message: "Duplicate net/layer width contract." }); }
});
export type PcbRouteAuditRequest = z.infer<typeof pcbRouteAuditRequestSchema>;
const padSchema = z.object({ primitiveId: name, padNumber: z.string(), net: z.string().nullable(), layer: z.number().int().positive(), x: coordinate, y: coordinate, metallization: z.boolean(), parentComponentPrimitiveId: name.optional(), source: z.literal("pcb_PrimitivePad-direct-state") }).loose();
type Pad = z.infer<typeof padSchema>;
const padFamilySchema = z.object({ count: z.number().int().nonnegative(), primitiveIds: z.array(name), byPrimitiveId: z.record(name, padSchema) }).loose();
const padLinkSchema = z.object({ primitiveId: name, parentComponentPrimitiveId: name, padNumber: z.string(), net: z.string().nullable() }).loose();
const padCorrelationSchema = z.object({ status: z.literal("exact-subset"), primitiveIds: z.array(name), byPrimitiveId: z.record(name, padLinkSchema) }).loose();
const padFamiliesSchema = z.object({ pads: padFamilySchema }).loose();
const padInventorySchema = z.object({ ok: z.literal(true), kind: z.literal("pcb-inventory"), documentType: z.literal(3), units: z.object({ coordinatesAndLengths: z.literal("mil") }).loose(),
  families: padFamiliesSchema, componentPadCorrelation: padCorrelationSchema,
}).loose();
const findingSchema = z.object({ code: name, objectIds: z.array(name), detail: z.string() }).strict();
const widthResultSchema = z.object({ objectId: name, net: name, layer: z.number().int(), actualMil: z.number(), authority: z.enum(["native-net-track", "native-pair-width", "requested-width-contract"]), ruleId: z.string().nullable(), minMil: z.number().nullable(), maxMil: z.number().nullable(), status: z.enum(["within-range", "outside-range", "indeterminate"]) }).strict();
const pathResultSchema = z.object({ fromPad: name, toPad: name, connectedInCenterlineModel: z.boolean(), shortestKnownPlanarLengthMil: z.number().nonnegative().nullable(), routeIds: z.array(name), viaIds: z.array(name), containsCycle: z.boolean(), completeSimplePath: z.boolean() }).strict();
const graphNodeSchema = z.object({ x: coordinate, y: coordinate, layers: z.array(z.number().int()) }).strict();
const netResultSchema = z.object({ net: name, padIds: z.array(name), lineCount: z.number().int(), arcCount: z.number().int(), viaCount: z.number().int(), summedPlanarSegmentLengthMil: z.number().nonnegative(), layers: z.array(z.number().int()), danglingNodes: z.array(graphNodeSchema), path: pathResultSchema.nullable(), findings: z.array(findingSchema), widths: z.array(widthResultSchema) }).strict();
const comparisonSchema = z.object({ name, nets: z.array(name), planarSkewMil: z.number().nonnegative().nullable(), maximumSkewMil: z.number().nonnegative().nullable(), ruleId: z.string().nullable(), status: z.enum(["within-planar-limit", "outside-planar-limit", "indeterminate"]), sameEndpointComponentOwners: z.boolean().nullable(), findings: z.array(findingSchema) }).strict();
export const pcbRouteAuditReportSchema = z.object({ profile: z.literal(PCB_ROUTE_AUDIT_PROFILE), documentUuid: name, sourceSha256: z.string().regex(/^[a-f0-9]{64}$/u), inventorySha256: z.string().regex(/^[a-f0-9]{64}$/u), units: z.literal("mil"), nets: z.array(netResultSchema), differentialPairs: z.array(comparisonSchema), equalLengthGroups: z.array(comparisonSchema), limitations: z.array(z.string()) }).strict();
export type PcbRouteAuditReport = z.infer<typeof pcbRouteAuditReportSchema>;
type Finding = z.infer<typeof findingSchema>;
type NetResult = z.infer<typeof netResultSchema>;
type WidthResult = z.infer<typeof widthResultSchema>;
interface Point { x: number; y: number; }
interface Segment { id: string; net: string; layer: number; start: Point; end: Point; width: number; length: number; arc: boolean; }
interface Via { id: string; net: string; point: Point; layers: number[]; }
interface Rule { id: string; context: Record<string, unknown>; }
// Numeric reconciliation only, below the native encoder's 0.0001 mil grid.
// Callers cannot choose this epsilon or expand a missing geometric connection.
const EPSILON_MIL = 1e-7;
function finite(value: unknown): number { return coordinate.parse(value); }
function bodyRecord(value: unknown): Record<string, unknown> { if (!isRecord(value)) { throw new Error("Incomplete route source object."); } return value; }
function identity(object: NativeSourceObject, type: string): unknown[] {
  const value: unknown = JSON.parse(object.id);
  if (!Array.isArray(value) || value[0] !== type) { throw new Error("Native route source identity is malformed."); }
  return value;
}
function netName(object: NativeSourceObject): string { return z.string().parse(identity(object, "NET")[1]); }
function note(code: string, objectIds: string[], detail: string): Finding { return { code, objectIds, detail }; }
function pointKey(point: Point, layer: number): string { return canonicalJson([Math.round(point.x / EPSILON_MIL), Math.round(point.y / EPSILON_MIL), layer]); }
function samePoint(first: Point, second: Point): boolean { return Math.hypot(first.x - second.x, first.y - second.y) <= EPSILON_MIL; }
function orderedCopper(source: NativeSourceSnapshot): number[] {
  return source.objects.filter((entry) => entry.type === "LAYER" && entry.body["use"] === true && ["TOP", "BOTTOM", "SIGNAL", "PLANE"].includes(String(entry.body["layerType"]))).map((entry) => z.number().int().positive().parse(entry.body["layerId"])).toSorted((left, right) => (left === 2 ? 1000 : left) - (right === 2 ? 1000 : right));
}
function selector(source: NativeSourceSnapshot, type: string, selected: string): Record<string, unknown> {
  const object = source.objects.find((entry) => entry.type === "RULE_SELECTOR" && entry.id === JSON.stringify(["RULE_SELECTOR", [type, selected]]));
  return object === undefined ? {} : bodyRecord(object.body["ruleKeyValue"]);
}
function rule(source: NativeSourceSnapshot, family: string, reference?: unknown): Rule | null {
  if (reference !== undefined && reference !== null && typeof reference !== "string") { return null; }
  const candidates = source.objects.filter((entry) => entry.type === "RULE" && identity(entry, "RULE")[1] === family);
  const selected = typeof reference === "string" && reference !== "default" && reference !== "" ? candidates.filter((entry) => identity(entry, "RULE")[2] === reference) : candidates.filter((entry) => entry.body["ruleState"] === "DEFAULT");
  if (selected.length !== 1 || selected[0] === undefined) { return null; }
  return { id: selected[0].id, context: bodyRecord(selected[0].body["ruleContext"]) };
}
function widthResult(segment: Segment, selected: Rule | null, tableName: string, authority: WidthResult["authority"]): WidthResult {
  const table = selected === null ? null : selected.context[tableName];
  let row: Record<string, unknown> | undefined;
  if (isRecord(table) && Array.isArray(table["content"])) {
    const rows = table["content"].map(bodyRecord);
    // Native F1.getValue uses the requested layer, then reference layer 1.
    row = rows.find((entry) => entry["layerId"] === segment.layer) ?? rows.find((entry) => entry["layerId"] === 1);
  }
  const min = row?.["stroMin"]; const max = row?.["stroMax"];
  const valid = typeof min === "number" && Number.isFinite(min) && typeof max === "number" && Number.isFinite(max) && min >= 0 && min <= max;
  let status: WidthResult["status"] = "indeterminate";
  if (valid) { status = segment.width >= min && segment.width <= max ? "within-range" : "outside-range"; }
  return { objectId: segment.id, net: segment.net, layer: segment.layer, actualMil: segment.width, authority, ruleId: selected?.id ?? null, minMil: valid ? min : null, maxMil: valid ? max : null, status };
}

function checkedPads(source: NativeSourceSnapshot, inventoryInput: unknown): Pad[] {
  const inventory = padInventorySchema.parse(inventoryInput); const family = inventory.families.pads;
  if (family.count !== family.primitiveIds.length || new Set(family.primitiveIds).size !== family.count || canonicalJson(Object.keys(family.byPrimitiveId).toSorted()) !== canonicalJson(family.primitiveIds.toSorted())) { throw new Error("Route audit pad inventory is incomplete."); }
  const expected = new Map<string, { parent?: string; net: string; number: string }>();
  for (const object of source.objects) {
    if (object.type === "PAD_NET") {
      const id = identity(object, "PAD_NET");
      if (id.length !== 4 || !id.slice(1).every((entry: unknown) => typeof entry === "string")) { throw new Error("Native PAD_NET identity is incomplete."); }
      const parent = name.parse(id[1]); const local = name.parse(id[3]); const globalId = parent + local;
      if (expected.has(globalId) || !source.objects.some((entry) => entry.type === "COMPONENT" && entry.id === parent)) { throw new Error("Native component pad parent or identity is inconsistent."); }
      expected.set(globalId, { parent, net: z.string().parse(object.body["padNet"]), number: z.string().parse(id[2]) });
    } else if (object.type === "PAD") { expected.set(object.id, { net: z.string().parse(object.body["netName"]), number: z.string().parse(object.body["num"]) }); }
  }
  if (canonicalJson([...expected.keys()].toSorted()) !== canonicalJson(family.primitiveIds.toSorted())) { throw new Error("Native source and physical pad inventory identities disagree."); }
  const pads = family.primitiveIds.map((id) => {
    const pad = family.byPrimitiveId[id]; const native = expected.get(id);
    if (pad === undefined || native === undefined || pad.primitiveId !== id || (pad.net ?? "") !== native.net || pad.padNumber !== native.number || pad.parentComponentPrimitiveId !== native.parent) { throw new Error("Native source and physical pad assignment disagree."); }
    if (native.parent === undefined) {
      const nativePad = source.objects.find((entry) => entry.type === "PAD" && entry.id === id);
      if (nativePad === undefined || !samePoint(pad, { x: finite(nativePad.body["centerX"]), y: finite(nativePad.body["centerY"]) }) || pad.layer !== nativePad.body["layerId"]) { throw new Error("Standalone pad source and inventory pose disagree."); }
    } else {
      const link = inventory.componentPadCorrelation.byPrimitiveId[id];
      if (link?.primitiveId !== id || link.parentComponentPrimitiveId !== native.parent || link.padNumber !== native.number || (link.net ?? "") !== native.net) { throw new Error("Physical pad component correlation is incomplete."); }
    }
    return pad;
  });
  const componentPadIds = pads.filter((pad) => pad.parentComponentPrimitiveId !== undefined).map((pad) => pad.primitiveId).toSorted();
  if (canonicalJson(componentPadIds) !== canonicalJson(inventory.componentPadCorrelation.primitiveIds.toSorted()) || canonicalJson(componentPadIds) !== canonicalJson(Object.keys(inventory.componentPadCorrelation.byPrimitiveId).toSorted())) { throw new Error("Component pad correlation set is incomplete."); }
  return pads;
}

function sourceSegments(source: NativeSourceSnapshot, net: string): Segment[] {
  return source.objects.filter((entry) => ["LINE", "ARC"].includes(entry.type) && entry.body["netName"] === net).map((entry) => {
    const value = entry.body; const start = { x: finite(value["startX"]), y: finite(value["startY"]) }; const end = { x: finite(value["endX"]), y: finite(value["endY"]) };
    const chord = Math.hypot(end.x - start.x, end.y - start.y); const angle = entry.type === "ARC" ? Math.abs(finite(value["angle"])) * Math.PI / 180 : 0;
    if (chord <= EPSILON_MIL || (entry.type === "ARC" && (angle <= 0 || angle >= 2 * Math.PI))) { throw new Error("Degenerate/full-circle native route needs an explicit geometry model."); }
    return { id: entry.id, net, layer: z.number().int().positive().parse(value["layerId"]), start, end, width: z.number().positive().parse(value["width"]), length: entry.type === "ARC" ? chord * angle / (2 * Math.sin(angle / 2)) : chord, arc: entry.type === "ARC" };
  });
}
function sourceVias(source: NativeSourceSnapshot, net: string, copper: number[], findings: Finding[]): Via[] {
  const result: Via[] = [];
  for (const object of source.objects.filter((entry) => entry.type === "VIA" && entry.body["netName"] === net)) {
    let layers: number[] = [];
    if (object.body["viaType"] === "NORMAL") { layers = copper; }
    else if (object.body["viaType"] === "BLIND") {
      const blind = rule(source, "BLIND")?.context["blinds"];
      const rows = isRecord(blind) && Array.isArray(blind["content"]) ? blind["content"].filter((entry: unknown) => isRecord(entry) && entry["name"] === object.body["ruleName"]) : [];
      const row = rows.length === 1 ? bodyRecord(rows[0]) : null;
      const first = row === null ? -1 : copper.indexOf(Number(row["staLayerId"])); const last = row === null ? -1 : copper.indexOf(Number(row["endLayerId"]));
      if (first >= 0 && last >= 0 && first !== last) { layers = copper.slice(Math.min(first, last), Math.max(first, last) + 1); }
    }
    if (layers.length < 2) { findings.push(note("unsupported-via-span", [object.id], "Via span is not one reviewed through/blind-layer connection.")); }
    else { result.push({ id: object.id, net, point: { x: finite(object.body["centerX"]), y: finite(object.body["centerY"]) }, layers }); }
  }
  return result;
}

/** A positive path is continuous through explicit segment ends and plated
 * transitions. Interior crossings and copper areas are not silently joined.
 * Their presence prevents completeSimplePath and a pair-length pass.
 */
function intersectionWarning(a: Segment, b: Segment): Finding | null {
  if (a.layer !== b.layer) { return null; }
  const shared = [a.start, a.end].some((point) => samePoint(point, b.start) || samePoint(point, b.end));
  if (a.arc || b.arc) { return note("arc-interior-intersections-unproved", [a.id, b.id], "Multiple segments involving an arc need native intersection checking before a complete-path claim."); }
  const ax = a.end.x - a.start.x; const ay = a.end.y - a.start.y; const bx = b.end.x - b.start.x; const by = b.end.y - b.start.y; const dx = b.start.x - a.start.x; const dy = b.start.y - a.start.y; const determinant = ax * by - ay * bx;
  if (Math.abs(determinant) <= EPSILON_MIL) {
    if (Math.abs(dx * ay - dy * ax) <= EPSILON_MIL) {
      const squared = ax * ax + ay * ay; const start = (dx * ax + dy * ay) / squared; const end = ((b.end.x - a.start.x) * ax + (b.end.y - a.start.y) * ay) / squared;
      if (Math.max(0, Math.min(start, end)) < Math.min(1, Math.max(start, end))) { return note("overlapping-tracks", [a.id, b.id], "Overlapping copper segments cannot be counted as one simple path."); }
    }
  } else if (!shared) {
    const alongA = (dx * by - dy * bx) / determinant; const alongB = (dx * ay - dy * ax) / determinant;
    if (alongA >= 0 && alongA <= 1 && alongB >= 0 && alongB <= 1) { return note("interior-junction-unmodeled", [a.id, b.id], "Tracks meet away from shared source endpoints; native connectivity is required."); }
  }
  return null;
}
function geometryWarnings(segments: Segment[]): Finding[] {
  const result: Finding[] = [];
  for (let first = 0; first < segments.length; first += 1) {
    const a = segments[first];
    if (a === undefined) { throw new Error("Route segment index is absent."); }
    for (const b of segments.slice(first + 1)) {
      const warning = intersectionWarning(a, b);
      if (warning !== null) { result.push(warning); }
      if (result.length > 4096) { throw new Error("Route audit has more than 4096 geometric ambiguities on one net; native connectivity checking is required."); }
    }
  }
  return result;
}

function inventoryOnlyCopper(source: NativeSourceSnapshot, inventory: unknown, net: string): string[] {
  if (!isRecord(inventory) || !isRecord(inventory["families"])) { throw new Error("Route inventory families are absent."); }
  const ids = new Set(source.objects.map((entry) => entry.id)); const unknown: string[] = [];
  for (const key of ["lines", "arcs", "vias", "polylines", "fills", "pours"]) {
    const family = inventory["families"][key];
    if (isRecord(family) && isRecord(family["byPrimitiveId"])) {
      for (const [id, value] of Object.entries(family["byPrimitiveId"])) {
        if (isRecord(value) && value["net"] === net && !ids.has(id)) { unknown.push(id); }
      }
    }
  }
  return [...new Set(unknown)].toSorted();
}

function netGraph(segments: Segment[], vias: Via[], pads: Pad[], copper: number[], selected: z.infer<typeof pathRequest> | undefined, findings: Finding[]): Pick<NetResult, "path" | "danglingNodes"> {
  const parents = new Map<string, string>(); const points = new Map<string, { point: Point; layer: number }>();
  const node = (point: Point, layer: number): string => { const key = pointKey(point, layer); if (!parents.has(key)) { parents.set(key, key); points.set(key, { point, layer }); } return key; };
  const root = (key: string): string => { let current = key; while (parents.get(current) !== current) { const parent = parents.get(current); if (parent === undefined) { throw new Error("Route graph identity disappeared."); } current = parent; } return current; };
  const union = (keys: string[]): void => { const first = keys[0]; if (first !== undefined) { for (const key of keys.slice(1)) { parents.set(root(key), root(first)); } } };
  const padNodes = new Map<string, string[]>();
  for (const pad of pads) {
    const layers = pad.layer === 12 ? copper : [pad.layer]; const keys = layers.map((layer) => node(pad, layer));
    padNodes.set(pad.primitiveId, keys);
    if (pad.layer === 12 && pad.metallization) { union(keys); }
    if (pad.layer === 12 && !pad.metallization) { findings.push(note("unplated-multilayer-pad", [pad.primitiveId], "An unplated hole does not join copper layers.")); }
  }
  const viaNodes = new Map(vias.map((via) => { const keys = via.layers.map((layer) => node(via.point, layer)); union(keys); return [via.id, keys] as const; }));
  const graph = new Map<string, { to: string; segment: Segment }[]>();
  for (const segment of segments) {
    const first = root(node(segment.start, segment.layer)); const last = root(node(segment.end, segment.layer));
    for (const [from, to] of [[first, last], [last, first]] as const) { const edges = graph.get(from) ?? []; edges.push({ to, segment }); graph.set(from, edges); }
  }
  const terminalNodes = new Set([...padNodes.values()].flat().map((key) => root(key)));
  const danglingNodes = [...graph].filter(([key, edges]) => edges.length === 1 && !terminalNodes.has(key)).map(([key]) => {
    const members = [...points].filter(([id]) => root(id) === key); const point = members[0]?.[1].point;
    if (point === undefined) { throw new Error("Route graph node position is absent."); }
    return { x: point.x, y: point.y, layers: [...new Set(members.map(([, value]) => value.layer))].toSorted((a, b) => a - b) };
  });
  if (selected === undefined) { return { path: null, danglingNodes }; }
  const fromKeys = padNodes.get(selected.fromPad); const toKeys = padNodes.get(selected.toPad);
  if (fromKeys === undefined || toKeys === undefined) { throw new Error("Requested route endpoints do not belong to the selected net."); }
  const targets = new Set(toKeys.map((key) => root(key))); const distances = new Map<string, number>(fromKeys.map((key) => [root(key), 0])); const previous = new Map<string, { from: string; segment: Segment }>(); const visited = new Set<string>();
  let end: string | undefined;
  while (true) {
    let current; let best = Infinity;
    for (const [key, value] of distances) { if (!visited.has(key) && value < best) { current = key; best = value; } }
    if (current === undefined) { break; } visited.add(current);
    if (targets.has(current)) { end = current; break; }
    for (const edge of graph.get(current) ?? []) { const next = best + edge.segment.length; if (next < (distances.get(edge.to) ?? Infinity)) { distances.set(edge.to, next); previous.set(edge.to, { from: current, segment: edge.segment }); } }
  }
  const routeIds: string[] = []; const routeNodes = new Set<string>();
  let cursor = end;
  while (cursor !== undefined) { routeNodes.add(cursor); const step = previous.get(cursor); if (step === undefined) { break; } routeIds.push(step.segment.id); cursor = step.from; }
  routeIds.reverse();
  const reachable = new Set<string>(); const pending = fromKeys.map((key) => root(key)); const reachedEdges = new Set<string>();
  while (pending.length > 0) { const key = pending.pop(); if (key !== undefined && !reachable.has(key)) { reachable.add(key); for (const edge of graph.get(key) ?? []) { reachedEdges.add(edge.segment.id); pending.push(edge.to); } } }
  const containsCycle = reachedEdges.size >= reachable.size;
  const usedVias = [...viaNodes].filter(([, keys]) => keys.some((key) => routeNodes.has(root(key)))).map(([id]) => id).toSorted();
  if (usedVias.length !== vias.length) { findings.push(note("unused-via-in-net", vias.filter((via) => !usedVias.includes(via.id)).map((via) => via.id), "A via on this net lies outside the selected centerline path.")); }
  return { danglingNodes, path: { fromPad: selected.fromPad, toPad: selected.toPad, connectedInCenterlineModel: end !== undefined, shortestKnownPlanarLengthMil: end === undefined ? null : distances.get(end) ?? null, routeIds, viaIds: usedVias, containsCycle, completeSimplePath: end !== undefined && !containsCycle && findings.length === 0 && pads.length === 2 && routeIds.length === segments.length && danglingNodes.length === 0 } };
}

/** Internal derived reader. The coordinator supplies complete, double-sampled
 * exact source/inventory evidence under one context, never caller geometry.
 */
export function auditPcbRoutes(source: NativeSourceSnapshot, inventory: unknown, input: unknown): PcbRouteAuditReport {
  const request = pcbRouteAuditRequestSchema.parse(input);
  if (source.schema !== "easyeda-pro-control.document-source.v1" || source.document["docType"] !== "PCB" || source.sha256 !== sha256Json({ schema: source.schema, document: source.document, objects: source.objects }) || new Set(source.objects.map((entry) => entry.id)).size !== source.objects.length) { throw new Error("Route audit requires a valid exact PCB source commitment."); }
  const pads = checkedPads(source, inventory); const copper = orderedCopper(source); const netObjects = source.objects.filter((entry) => entry.type === "NET" && netName(entry) !== "");
  const allNets = new Map(netObjects.map((entry) => [netName(entry), entry]));
  if (allNets.size !== netObjects.length) { throw new Error("Duplicate canonical native net identities."); }
  const pairNames = [...new Set(netObjects.map((entry) => entry.body["differentialName"]).filter((value): value is string => typeof value === "string" && value !== ""))].toSorted();
  const selectedPairs = request.differentialPairs ?? pairNames;
  for (const selected of selectedPairs) { if (!pairNames.includes(selected)) { throw new Error("Requested differential pair does not exist."); } }
  const selectedNets = new Set(request.nets ?? [...allNets.keys()]);
  for (const entry of netObjects) { if (selectedPairs.includes(String(entry.body["differentialName"]))) { selectedNets.add(netName(entry)); } }
  for (const path of request.paths) { selectedNets.add(path.net); }
  if (selectedNets.size > 256) { throw new Error("Select at most 256 nets for one route audit."); }
  if (source.objects.filter((entry) => ["LINE", "ARC"].includes(entry.type) && selectedNets.has(String(entry.body["netName"]))).length > 8192) { throw new Error("Select at most 8192 total route segments for one audit."); }
  for (const contract of request.widthContracts) { if (!selectedNets.has(contract.net)) { throw new Error("Width contract is outside the selected net scope."); } }
  const results: NetResult[] = [];
  for (const net of [...selectedNets].toSorted()) {
    const nativeNet = allNets.get(net); if (nativeNet === undefined) { throw new Error("Requested route net does not exist."); }
    const netPads = pads.filter((pad) => pad.net === net); const segments = sourceSegments(source, net); const findings: Finding[] = [];
    if (segments.length > 2048) { throw new Error("Select a smaller net scope: more than 2048 segments on one net."); }
    const vias = sourceVias(source, net, copper, findings);
    const unmodeledInventory = inventoryOnlyCopper(source, inventory, net);
    if (unmodeledInventory.length > 0) { findings.push(note("inventory-copper-outside-source-model", unmodeledInventory, "Exact inventory includes netted copper without an independently modeled board-source record, such as footprint-owned geometry.")); }
    for (const segment of segments) { if (!copper.includes(segment.layer)) { findings.push(note("not-enabled-copper-layer", [segment.id], "Netted segment is not on an enabled copper layer.")); } }
    const otherCopper = source.objects.filter((entry) => {
      if (!["POLY", "FILL", "POUR", "POURED", "LAYER_FILL", "TEARDROP"].includes(entry.type)) { return false; }
      if (entry.type === "POURED") { const parent = identity(entry, "POURED")[1]; return source.objects.some((candidate) => candidate.type === "POUR" && candidate.id === parent && candidate.body["netName"] === net); }
      return entry.body["netName"] === net;
    });
    if (otherCopper.length > 0) { findings.push(note("area-or-other-copper-not-modeled", otherCopper.map((entry) => entry.id), "This net may connect through copper outside the line/arc/via centerline model.")); }
    findings.push(...geometryWarnings(segments));
    const requestedPath = request.paths.find((entry) => entry.net === net); const selected = requestedPath ?? (netPads.length === 2 && netPads[0] !== undefined && netPads[1] !== undefined ? { net, fromPad: netPads[0].primitiveId, toPad: netPads[1].primitiveId } : undefined);
    if (selected === undefined) { findings.push(note("endpoint-selection-required", netPads.map((pad) => pad.primitiveId), "Specify two endpoint pad IDs for a net without exactly two physical pads.")); }
    const nativeTrack = rule(source, "TRACK", selector(source, "NET", net)["TRACK"]); const widths = segments.map((segment) => widthResult(segment, nativeTrack, "track", "native-net-track"));
    const pairName = nativeNet.body["differentialName"];
    if (typeof pairName === "string" && pairName !== "") { const pairRule = rule(source, "DIFFER_ENTAIL", selector(source, "DIFF_PAIR", pairName)["DIFFER_ENTAIL"]); widths.push(...segments.map((segment) => widthResult(segment, pairRule, "stroWidth", "native-pair-width"))); }
    for (const contract of request.widthContracts.filter((entry) => entry.net === net)) { for (const segment of segments.filter((entry) => entry.layer === contract.layer)) { widths.push({ objectId: segment.id, net, layer: segment.layer, actualMil: segment.width, authority: "requested-width-contract", ruleId: null, minMil: contract.minMil, maxMil: contract.maxMil, status: segment.width >= contract.minMil && segment.width <= contract.maxMil ? "within-range" : "outside-range" }); } }
    results.push({ net, padIds: netPads.map((pad) => pad.primitiveId).toSorted(), lineCount: segments.filter((entry) => !entry.arc).length, arcCount: segments.filter((entry) => entry.arc).length, viaCount: source.objects.filter((entry) => entry.type === "VIA" && entry.body["netName"] === net).length, summedPlanarSegmentLengthMil: segments.reduce((sum, entry) => sum + entry.length, 0), layers: [...new Set(segments.map((entry) => entry.layer))].toSorted((a, b) => a - b), ...netGraph(segments, vias, netPads, copper, selected, findings), findings, widths });
  }
  const compare = (groupName: string, members: string[], selectedRule: Rule | null, maximum: unknown, isPair: boolean): z.infer<typeof comparisonSchema> => {
    const rows = members.map((member) => results.find((entry) => entry.net === member)); const paths = rows.map((entry) => entry?.path); const lengths = paths.map((path) => path?.shortestKnownPlanarLengthMil); const findings: Finding[] = [];
    const complete = members.length >= 2 && paths.every((path) => path?.completeSimplePath === true && path.viaIds.length === 0);
    const measured = lengths.every((length): length is number => typeof length === "number");
    const skew = measured && lengths.length >= 2 ? Math.max(...lengths) - Math.min(...lengths) : null;
    const limit = typeof maximum === "number" && Number.isFinite(maximum) && maximum >= 0 ? maximum : null;
    let sameEndpointComponentOwners: boolean | null = null;
    if (isPair && paths.length === 2 && paths.every((path) => path !== null && path !== undefined)) {
      const owners = paths.map((path) => [path?.fromPad, path?.toPad].map((id) => pads.find((pad) => pad.primitiveId === id)?.parentComponentPrimitiveId));
      if (owners.flat().every((owner) => typeof owner === "string")) { sameEndpointComponentOwners = canonicalJson(owners[0]?.toSorted()) === canonicalJson(owners[1]?.toSorted()); }
      if (sameEndpointComponentOwners === false) { findings.push(note("pair-endpoint-owner-mismatch", [], "The two pair members do not terminate on the same pair of component owners.")); }
    }
    if (!complete) { findings.push(note("planar-comparison-incomplete", [], "Comparison requires one complete simple path per member. Via barrel lengths, branches and other copper need separate proof.")); }
    if (limit === null) { findings.push(note("native-length-limit-unresolved", [], "The corresponding native skew/tolerance profile is missing or unsupported.")); }
    let status: z.infer<typeof comparisonSchema>["status"] = "indeterminate";
    if (complete && skew !== null && limit !== null && sameEndpointComponentOwners !== false) { status = skew <= limit ? "within-planar-limit" : "outside-planar-limit"; }
    return { name: groupName, nets: members, planarSkewMil: skew, maximumSkewMil: limit, ruleId: selectedRule?.id ?? null, status, sameEndpointComponentOwners, findings };
  };
  const differentialPairs = selectedPairs.map((selected) => {
    const members = netObjects.filter((entry) => entry.body["differentialName"] === selected); const positive = members.filter((entry) => entry.body["isPositiveNet"] === true); const negative = members.filter((entry) => entry.body["isPositiveNet"] === false);
    const selectedRule = rule(source, "DIFFER_ENTAIL", selector(source, "DIFF_PAIR", selected)["DIFFER_ENTAIL"]); const result = compare(selected, members.map((entry) => netName(entry)), selectedRule, selectedRule?.context["differPairLenTolerMax"], true);
    if (positive.length !== 1 || negative.length !== 1 || members.length !== 2) { result.status = "indeterminate"; result.findings.push(note("pair-membership-invalid", members.map((entry) => entry.id), "A differential pair requires exactly one positive and one negative net.")); }
    return result;
  });
  const groups = [...new Set(netObjects.map((entry) => entry.body["equalLengthGroupName"]).filter((value): value is string => typeof value === "string" && value !== ""))].toSorted();
  const equalLengthGroups = groups.filter((group) => netObjects.some((entry) => entry.body["equalLengthGroupName"] === group && selectedNets.has(netName(entry)))).map((group) => {
    const keys = selector(source, "EQ_LEN_GRP", group); const reference = keys["NET_LENGTH_TOLERANCE"]; const selectedRule = rule(source, "NET_LENGTH_TOLERANCE", Array.isArray(reference) ? reference[0] : reference);
    const result = compare(group, netObjects.filter((entry) => entry.body["equalLengthGroupName"] === group).map((entry) => netName(entry)), selectedRule, selectedRule?.context["netLengthTolerance"], false);
    if (Array.isArray(reference) && reference[1] !== undefined && reference[1] !== null && reference[1] !== "") {
      result.status = "indeterminate"; result.findings.push(note("target-relative-length-unmodeled", [], "This native group selects a target net; measured planar spread is not a proof of its target-relative tolerance."));
    }
    return result;
  });
  return pcbRouteAuditReportSchema.parse({ profile: PCB_ROUTE_AUDIT_PROFILE, documentUuid: name.parse(source.document["uuid"]), sourceSha256: source.sha256, inventorySha256: sha256Json(inventory), units: "mil", nets: results, differentialPairs, equalLengthGroups, limitations: [
    "Derived from exact native LINE/ARC/VIA records and direct physical-pad centers, not rounded public arc coordinates. Arc length uses the stored signed sweep magnitude.",
    "Connections use explicit centerline endpoints and plated layer transitions. A disconnected result means no path in this model, not a proved electrical open; pad-land contacts and interior crossings require native connectivity/DRC.",
    "Lengths are planar centerline lengths. Via/pad barrels, package pin length, propagation velocity, reference planes, impedance and intrapair coupling/gap are not included.",
    "Native width results are base net-track and pair-width profiles with native layer-1 fallback. Region overrides and rule-priority changes require itemized native DRC; no net-class inheritance is invented.",
    "Pair/equal-length statuses compare planar spread only. They do not certify complete routing, signal integrity, fabrication rules or electrical safety.",
    "The coordinator must bind source and inventory to the same stable project/document and runtime; callers cannot supply measurement geometry.",
  ] });
}
