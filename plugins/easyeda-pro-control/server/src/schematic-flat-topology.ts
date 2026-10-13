import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import { NORMALIZE_DOCUMENT_SOURCE_CODE, parseDocumentSource } from "./document-source.ts";
import type { NativeSourceObject } from "./document-source.ts";
import { designTopologySchema } from "./design-topology.ts";
import type { DesignTopology } from "./design-topology.ts";

/** This profile deliberately does not use the asynchronous schematic AST. */
export const SCHEMATIC_FLAT_TOPOLOGY_PROFILE = "easyeda-pro-control.schematic-flat-named-wire-topology.v1";
const identity = z.string().min(1).max(512);
const coordinate = z.number().int().min(-1_000_000).max(1_000_000);
const point = z.tuple([coordinate, coordinate]);
const body = z.record(z.string(), z.json());
const attribute = z.strictObject({ id: identity, key: identity, value: z.json(), body });
const pin = z.strictObject({ id: identity, number: identity, origin: point, noConnect: z.boolean(), body,
  noConnectAttribute: attribute.nullable(), attributes: z.array(attribute).max(4096) });
const symbol = z.strictObject({ id: identity, kind: z.enum(["part", "sheet"]), body,
  partCount: z.literal(1), partNumber: z.literal(1), attributes: z.array(attribute).max(4096), pins: z.array(pin).max(4096) });
const line = z.strictObject({ id: identity, body, points: z.tuple([point, point]) });
const wire = z.strictObject({ id: identity, body, names: z.array(attribute).length(1), lines: z.array(line).min(1).max(20_000) });
const contact = z.strictObject({ point, lineIds: z.array(identity).max(20_000), pinIds: z.array(identity).max(20_000) });
export const schematicFlatTopologyScopeSchema = z.strictObject({ projectUuid: identity, schematicUuid: identity,
  activePageUuid: identity, activeTabId: identity, pageIds: z.array(identity).min(1).max(256) });
const pageSchema = z.strictObject({ uuid: identity, tabId: identity, source: z.string().min(1).max(4_194_304),
  symbols: z.array(symbol).max(20_000), wires: z.array(wire).max(20_000), contacts: z.array(contact).max(100_000) });
export const schematicFlatTopologyObservationSchema = z.strictObject({
  profile: z.literal(SCHEMATIC_FLAT_TOPOLOGY_PROFILE), scope: schematicFlatTopologyScopeSchema,
  settings: z.strictObject({ defaultNetName: z.literal(true), netLabelInterPageConnection: z.literal(true) }),
  pages: z.array(pageSchema).min(1).max(256),
}).superRefine((value, context) => {
  if (Buffer.byteLength(JSON.stringify(value), "utf8") > 16 * 1024 * 1024) {
    context.addIssue({ code: "custom", message: "Flat topology observation exceeds the complete-response bound." });
  }
});
export type SchematicFlatTopologyObservation = z.infer<typeof schematicFlatTopologyObservationSchema>;
export interface SchematicFlatTopologyProof {
  readonly profile: typeof SCHEMATIC_FLAT_TOPOLOGY_PROFILE;
  readonly authority: "complete-native-source-and-endpoint-membership";
  readonly compiledCacheUsed: false;
  readonly topology: DesignTopology;
  readonly sourceSha256ByPage: Readonly<Record<string, string>>;
  readonly observationSha256: string;
  readonly componentCount: number;
  readonly pinCount: number;
}
const same = (left: unknown, right: unknown): boolean => canonicalJson(left) === canonicalJson(right);
function refuse(reason: string): never { throw new Error(`SCHEMATIC_FLAT_TOPOLOGY_UNSUPPORTED: ${reason}`); }
function unique(values: readonly string[], label: string): void {
  if (new Set(values).size !== values.length) { refuse(`duplicate ${label}`); }
}
function exactMembers(actual: readonly string[], expected: readonly string[], label: string): void {
  unique(actual, label); unique(expected, label);
  if (!same(actual.toSorted(), expected.toSorted())) { refuse(`incomplete ${label}`); }
}
function stored(records: ReadonlyMap<string, NativeSourceObject>, id: string, type: string, value: unknown): void {
  const record = records.get(id);
  if (record?.type !== type || !same(record.body, value)) { refuse(`source record mismatch for ${type}`); }
}
function stringAttribute(attributes: readonly z.infer<typeof attribute>[], key: string): string {
  const selected = attributes.filter((item) => item.key === key);
  const value = selected[0]?.value;
  if (selected.length !== 1 || typeof value !== "string" || value.length === 0) { return refuse(`missing exact ${key}`); }
  return value;
}
function checkAttributes(records: ReadonlyMap<string, NativeSourceObject>, ownerId: string,
  attributes: readonly z.infer<typeof attribute>[], sourceAttributes: readonly NativeSourceObject[]): void {
  unique(attributes.map((item) => item.id), "attribute IDs"); unique(attributes.map((item) => item.key), "attribute keys");
  for (const item of attributes) {
    if (item.body["parentId"] !== ownerId || item.body["key"] !== item.key) { refuse("attribute owner or key mismatch"); }
    if (records.has(item.id)) { stored(records, item.id, "ATTR", item.body); }
  }
  const captured = new Set(attributes.map((item) => item.id));
  for (const record of sourceAttributes) {
    if (!captured.has(record.id)) {
      refuse("stored owner attribute omitted from native inventory");
    }
  }
}
function pointKey(value: readonly [number, number]): string { return JSON.stringify(value); }
interface Endpoint { readonly point: [number, number]; readonly lines: string[]; readonly pins: string[] }
function endpoint(index: Map<string, Endpoint>, value: [number, number]): Endpoint {
  const key = pointKey(value);
  const existing = index.get(key);
  if (existing !== undefined) { return existing; }
  const added = { point: value, lines: [], pins: [] }; index.set(key, added); return added;
}
function liesInside(value: readonly [number, number], segment: z.infer<typeof line>): boolean {
  const [a, b] = segment.points;
  if (same(value, a) || same(value, b)) { return false; }
  return (value[0] - a[0]) * (b[1] - a[1]) === (value[1] - a[1]) * (b[0] - a[0]) &&
    value[0] >= Math.min(a[0], b[0]) && value[0] <= Math.max(a[0], b[0]) &&
    value[1] >= Math.min(a[1], b[1]) && value[1] <= Math.max(a[1], b[1]);
}
function crossInside(left: z.infer<typeof line>, right: z.infer<typeof line>): boolean {
  const [a, b] = left.points, [c, d] = right.points;
  const crossing: [number, number] = a[0] === b[0] ? [a[0], c[1]] : [c[0], a[1]];
  return (a[0] === b[0]) !== (c[0] === d[0]) && liesInside(crossing, left) && liesInside(crossing, right);
}
const VISUAL_SOURCE_TYPES = new Set(["CANVAS", "META", "COMPONENT", "ATTR", "WIRE", "LINE", "TEXT", "POLYLINE", "CIRCLE", "ARC", "RECT", "BEZIER", "ELLIPSE"]);

/** A complete, deliberately narrow native electrical proof. Its input must come
 * from the fixed builder under the ordinary context/runtime/transport gates.
 * Passing caller-supplied JSON through this verifier grants no runtime authority.
 */
export function verifySchematicFlatTopology(input: unknown): SchematicFlatTopologyProof {
  const observation = schematicFlatTopologyObservationSchema.parse(input);
  const { scope, pages } = observation;
  exactMembers(pages.map((page) => page.uuid), scope.pageIds, "declared pages");
  if (!scope.pageIds.includes(scope.activePageUuid) || pages.find((page) => page.uuid === scope.activePageUuid)?.tabId !== scope.activeTabId) {
    refuse("active page binding differs");
  }
  const topology: DesignTopology = [];
  const allPartIds: string[] = [], allPinIds: string[] = [];
  const designators = new Set<string>(), nameSpelling = new Map<string, string>(), sourceHashes = new Map<string, string>();
  for (const page of pages) {
    const source = parseDocumentSource(page.source);
    const records = new Map(source.objects.map((item) => [item.id, item]));
    const attributesByOwner = new Map<string, NativeSourceObject[]>(), linesByOwner = new Map<string, NativeSourceObject[]>();
    for (const item of source.objects) {
      const key = item.body[item.type === "ATTR" ? "parentId" : "lineGroup"];
      const index = item.type === "ATTR" ? attributesByOwner : linesByOwner;
      if ((item.type === "ATTR" || item.type === "LINE") && typeof key === "string") {
        const collection = index.get(key) ?? []; collection.push(item); index.set(key, collection);
      }
    }
    if (source.document["uuid"] !== page.uuid || source.document["docType"] !== "SCH_PAGE") { refuse("page source identity differs"); }
    sourceHashes.set(page.uuid, source.sha256);
    if (source.objects.some((item) => !VISUAL_SOURCE_TYPES.has(item.type) || item.body["key"] === "_NETLABEL_" ||
      (item.body["groupId"] !== undefined && item.body["groupId"] !== ""))) { refuse("unsupported source family, standalone net label or grouped object"); }
    exactMembers(page.symbols.map((item) => item.id), source.objects.filter((item) => item.type === "COMPONENT").map((item) => item.id), "source components");
    exactMembers(page.wires.map((item) => item.id), source.objects.filter((item) => item.type === "WIRE").map((item) => item.id), "source wires");
    const wireIds = new Set(page.wires.map((item) => item.id));
    const pinIds = new Set(page.symbols.flatMap((item) => item.pins.map((terminal) => terminal.id)));
    for (const item of source.objects.filter((entry) => entry.type === "ATTR")) {
      const key = item.body["key"], owner = item.body["parentId"];
      if ((key === "NET" && (typeof owner !== "string" || !wireIds.has(owner))) ||
          (typeof key === "string" && ["Pin Number", "Pin Name", "Pin Type", "NO_CONNECT"].includes(key) && (typeof owner !== "string" || !pinIds.has(owner)))) {
        refuse("source electrical attribute has an unrepresented owner");
      }
    }
    if (source.objects.some((item) => item.type === "LINE" && (typeof item.body["lineGroup"] !== "string" || !wireIds.has(item.body["lineGroup"])))) {
      refuse("source line has an unrepresented wire owner");
    }
    const points = new Map<string, Endpoint>();
    const lineNet = new Map<string, string>();
    const lines: z.infer<typeof line>[] = [];
    for (const group of page.wires) {
      stored(records, group.id, "WIRE", group.body);
      const name = group.names[0];
      if (name === undefined || typeof name.value !== "string" || !/^[A-Za-z_][A-Za-z0-9_+-]{0,127}$/u.test(name.value) ||
          name.key !== "Name" || name.body["key"] !== "NET" || name.body["parentId"] !== group.id || name.body["value"] !== name.value) {
        refuse("wire requires one literal simple NET name");
      }
      const net = name.value;
      if (nameSpelling.has(net.toUpperCase()) && nameSpelling.get(net.toUpperCase()) !== net) { refuse("case-ambiguous net names"); }
      nameSpelling.set(net.toUpperCase(), net); stored(records, name.id, "ATTR", name.body);
      exactMembers(group.names.map((item) => item.id), (attributesByOwner.get(group.id) ?? []).filter((item) => item.body["key"] === "NET").map((item) => item.id), "wire names");
      exactMembers(group.lines.map((item) => item.id), (linesByOwner.get(group.id) ?? []).map((item) => item.id), "wire lines");
      for (const item of group.lines) {
        stored(records, item.id, "LINE", item.body);
        const [a, b] = item.points;
        if (!same([item.body["startX"], item.body["startY"], item.body["endX"], item.body["endY"]], [...a, ...b]) ||
            item.body["lineGroup"] !== group.id || same(a, b) || (a[0] !== b[0] && a[1] !== b[1])) { refuse("wire line is not one nonzero orthogonal source segment"); }
        if (lineNet.has(item.id)) { refuse("duplicate wire line ownership"); }
        lineNet.set(item.id, net); lines.push(item);
        endpoint(points, a).lines.push(item.id); endpoint(points, b).lines.push(item.id);
      }
    }
    for (const item of page.symbols) {
      stored(records, item.id, "COMPONENT", item.body); checkAttributes(records, item.id, item.attributes, attributesByOwner.get(item.id) ?? []);
      if (item.kind === "sheet" && item.pins.length > 0) { refuse("drawing frame has electrical pins"); }
    }
    for (const item of page.symbols.filter((entry) => entry.kind === "part")) {
      if (item.attributes.some((entry) => ["Group ID", "Channel ID", "Reuse Block", "Multi-Part Group"].includes(entry.key) && entry.value !== "" && entry.value !== null)) { refuse("instance, reuse or multipart attributes"); }
      if (stringAttribute(item.attributes, "Convert to PCB") !== "yes") { refuse("part excluded from PCB conversion"); }
      const uniqueId = stringAttribute(item.attributes, "Unique ID");
      const designator = stringAttribute(item.attributes, "Designator");
      if (!/^[A-Za-z]+[1-9][0-9]*$/u.test(designator) || designators.has(designator.toUpperCase())) { refuse("ambiguous or unannotated designator"); }
      designators.add(designator.toUpperCase()); allPartIds.push(item.id);
      const partPins: DesignTopology[number]["pins"] = [];
      unique(item.pins.map((entry) => entry.number), "part pin numbers");
      for (const terminal of item.pins) {
        if (!/^[A-Za-z0-9_+-]{1,128}$/u.test(terminal.number)) { refuse("compound pin number"); }
        const noConnect = terminal.noConnectAttribute;
        if (noConnect !== null && (noConnect.key !== "NO_CONNECT" || (noConnect.value !== "yes" && noConnect.value !== "no"))) { refuse("unsupported no-connect attribute"); }
        if (terminal.noConnect !== (noConnect?.value === "yes")) { refuse("no-connect flag differs from its native attribute"); }
        checkAttributes(records, terminal.id, noConnect === null ? terminal.attributes : [...terminal.attributes, noConnect], attributesByOwner.get(terminal.id) ?? []);
        if (stringAttribute(terminal.attributes, "Pin Number") !== terminal.number ||
            !same([terminal.body["x"], terminal.body["y"]], terminal.origin)) { refuse("pin identity or source origin differs"); }
        allPinIds.push(terminal.id);
        if (allPinIds.length > 100_000) { refuse("complete pin-count bound"); }
        endpoint(points, terminal.origin).pins.push(terminal.id);
        const joined = new Set(endpoint(points, terminal.origin).lines.map((id) => lineNet.get(id)));
        if (joined.size > 1 || joined.has(undefined) || (terminal.noConnect && joined.size > 0)) { refuse("pin has contradictory native nets or no-connect state"); }
        partPins.push({ pinNumber: terminal.number, net: [...joined][0] ?? "" });
      }
      topology.push({ uniqueId, designator, pins: partPins.toSorted((left, right) => left.pinNumber.localeCompare(right.pinNumber)) });
    }
    if (points.size * lines.length > 2_000_000) { refuse("endpoint/interior comparison bound"); }
    for (const value of points.values()) {
      if (lines.some((item) => liesInside(value.point, item))) { refuse("unsplit endpoint or pin touches a segment interior"); }
    }
    if (lines.length * lines.length > 2_000_000) { refuse("line intersection comparison bound"); }
    if (lines.some((item, index) => lines.slice(index + 1).some((other) => crossInside(item, other)))) { refuse("unsplit segment crossing"); }
    exactMembers(page.contacts.map((item) => pointKey(item.point)), [...points.keys()], "native contact points");
    for (const actual of page.contacts) {
      const expected = points.get(pointKey(actual.point));
      if (expected === undefined) { refuse("extra native contact"); }
      exactMembers(actual.lineIds, expected.lines, "native contact wire lines");
      exactMembers(actual.pinIds, expected.pins, "native contact pins");
      const nets = new Set(expected.lines.map((id) => lineNet.get(id)));
      if (nets.size > 1) { refuse("contact joins differently named wires"); }
      if (expected.lines.length === 0 && expected.pins.length > 1) { refuse("multiple pins coincide without an explicitly named wire"); }
    }
  }
  unique(allPartIds, "all-page component IDs"); unique(allPinIds, "all-page pin IDs");
  const normalized = designTopologySchema.parse(topology.toSorted((left, right) => left.uniqueId.localeCompare(right.uniqueId)));
  return { profile: SCHEMATIC_FLAT_TOPOLOGY_PROFILE, authority: "complete-native-source-and-endpoint-membership", compiledCacheUsed: false,
    topology: normalized, sourceSha256ByPage: Object.fromEntries(sourceHashes), observationSha256: sha256Json(observation), componentCount: normalized.length, pinCount: allPinIds.length };
}

/** Fixed synchronous reader; caller data only binds identities. It performs no
 * compilation, navigation, annotation, Save, native action or cached pin read.
 * Root integration must establish the declared scope independently before it.
 */
export function buildSchematicFlatTopologyExpression(input: unknown, internalAction?: "flat-display-owned-action"): string {
  if (internalAction !== undefined && internalAction !== "flat-display-owned-action") { throw new Error("Unknown internal flat capture action profile."); }
  const scope = schematicFlatTopologyScopeSchema.parse(input);
  unique(scope.pageIds, "declared pages");
  return `(() => {
const scope=${JSON.stringify(scope)};
const fail=(reason)=>{throw new Error('SCH_FLAT_TOPOLOGY_'+reason);};
const manager=globalThis.SCH?.docMemoryManager;
if(typeof manager?.getActiveDoc!=='function'||typeof manager?.getSchDocs!=='function')fail('MANAGER');
const active=manager.getActiveDoc();
const check=()=>{const current=manager.getActiveDoc();if(current!==active||current?.uuid!==scope.activePageUuid||current?.tabId!==scope.activeTabId||current?.project_uuid!==scope.projectUuid||current?.schematicUuid!==scope.schematicUuid)fail('CONTEXT');};
check();
const project=active.projectMgr;
if(project?.setting?.universal?.defaultNetName!==true||project.netLabelInterPageConnection!==true)fail('SETTINGS');
const settings={defaultNetName:true,netLabelInterPageConnection:true};
let copiedBytes=0,totalSources=0,totalSymbols=0,totalPins=0,totalLines=0,totalPoints=0;
const array=(value,max)=>{if(!Array.isArray(value)||value.length>max)fail('ARRAY');return value;};
const id=value=>{if(typeof value!=='string'||!value||value.length>512)fail('IDENTITY');return value;};
const pair=value=>{if(!value||![value.x,value.y].every(number=>Number.isSafeInteger(number)&&Math.abs(number)<=1000000))fail('COORDINATE');return [value.x,value.y];};
const copy=value=>{const encoded=JSON.stringify(value);if(typeof encoded!=='string'||encoded.length>1048576)fail('BODY');copiedBytes+=encoded.length;if(copiedBytes>8388608)fail('BODY_TOTAL');return JSON.parse(encoded);};
const body=model=>{if(typeof model?.getConsistencyData!=='function')fail('BODY_METHOD');return copy(model.getConsistencyData());};
const attribute=(item,owner)=>{if(typeof item.getInstanceValue!=='function'||item.getInstanceValue()!=null||item.variantValue!=null)fail('INSTANCE_ATTRIBUTE');const data=body(item);let value=item.value;if(owner?.cmdKey==='sheet'&&(item.key==='@Update Date'||item.key==='@Update Time')){const pattern=item.key==='@Update Time'?/^(?:[0-2]\\d:[0-5]\\d:[0-5]\\d)?$/:/^(?:\\d{4}-\\d{2}-\\d{2})?$/;if(typeof value!=='string'||!pattern.test(value)||data.key!==item.key||data.parentId!==owner.id||data.value===undefined)fail('FRAME_TIMESTAMP');value=data.value;}return{id:id(item.id),key:id(item.key),value:copy(value),body:data};};
const attr=model=>{if(typeof model?.getAttr!=='function')fail('ATTR_METHOD');return array(model.getAttr(),4096).map(item=>attribute(item,model));};
const get=(attrs,key)=>{const selected=attrs.filter(item=>item.key===key);if(selected.length!==1||typeof selected[0].value!=='string'||!selected[0].value)fail('ATTRIBUTE');return selected[0].value;};
const docs=array(manager.getSchDocs(),256).filter(page=>page?.project_uuid===scope.projectUuid&&page?.schematicUuid===scope.schematicUuid);
const actualIds=docs.map(page=>id(page.uuid)).sort();
if(JSON.stringify(actualIds)!==JSON.stringify([...scope.pageIds].sort())||new Set(actualIds).size!==actualIds.length)fail('PAGE_MEMBERSHIP');
const pages=docs.map(page=>{
 if(page.projectMgr!==project||page.isSchSheetDoc?.()!==true||page.isBlockSymbolInstancePage!==false||page.readonlyMode===true||page.tabId!==page.uuid+'@'+scope.projectUuid)fail('PAGE_KIND');
 if(page.consistencyImpl?.state!=='initialized')fail('PAGE_NOT_INITIALIZED');
 const shapes=page.shapeManager;if(typeof shapes?.getModels!=='function'||${internalAction === undefined ? "shapes.actionRunner?.running!==false" : "!flatDisplayActionMatches(page,shapes)"}||typeof shapes.netPointManager?.getNetPoint!=='function')fail('SHAPES');
 const handler=page.consistencyImpl?.decodeAndRealTimeSyncHandler;if(typeof handler?.getSourceCodeIdMap!=='function'||page.idManager!==shapes.idManager)fail('SOURCE_INVENTORY');const sourceIds=handler.getSourceCodeIdMap();if(!(sourceIds instanceof Map)||sourceIds.size>100000)fail('SOURCE_INVENTORY');
 // Pinned sch.js 3f50136f: ad (4272450) inherits xb.modelType='NetLabel'
 // (4267994), but tagName='NetName' and keyInSourceCode='NET'. Only its
 // reciprocal, source-indexed child of a root wire NetGroup is admitted here.
 const wireModels=array(shapes.getModels('NetGroup'),20000),wireNames=new Map(),admittedNames=new Set();
 const root=shapes.root,rootChildren=wireModels.length?array(root?.children,100000):[],rootMembers=new Set(rootChildren);
 if(new Set(wireModels).size!==wireModels.length||rootMembers.size!==rootChildren.length)fail('NET_NAME_MEMBERSHIP');
 let totalWireChildren=0;
 for(const model of wireModels){
  if(root?.id!=='$$root'||root.modelType!=='Root'||root.shapeManager!==shapes||root.parent!=null||root.isConnected!==true||model?.modelType!=='NetGroup'||model.tagName!=='NetGroup'||model.type!=='wire'||model.combination||model.parent!==root||model.shapeManager!==shapes||!rootMembers.has(model)||!sourceIds.has(id(model.id))||page.idManager.idMap?.get(model.id)!==model||shapes.idManager.get?.(model.id)!==model)fail('NET_NAME_OWNER');
  const names=array(model.netNames,4096),children=array(model.children,100000),nameMembers=new Set(names),childMembers=new Set(children);
  totalWireChildren+=children.length;if(totalWireChildren>100000||nameMembers.size!==names.length||childMembers.size!==children.length)fail('NET_NAME_MEMBERSHIP');
  for(const item of names){
   if(item?.modelType!=='NetLabel'||item.tagName!=='NetName'||item.cmdKey!=='netlabel'||item.key!=='Name'||item.keyInSourceCode!=='NET'||item.parent!==model||item.shapeManager!==shapes||item.combination||!childMembers.has(item)||!sourceIds.has(id(item.id))||page.idManager.idMap?.get(item.id)!==item||shapes.idManager.get?.(item.id)!==item||admittedNames.has(item))fail('NET_NAME_MEMBERSHIP');
   admittedNames.add(item);
  }
  for(const child of children)if((child?.modelType==='NetLabel'||child?.tagName==='NetName')&&!nameMembers.has(child))fail('NET_NAME_MEMBERSHIP');
  wireNames.set(model,names);
 }
 const serializable=new Set(['Symbol','NetGroup','Wire','Attr','noConnect','Text','Polyline','Circle','Arc','Rect','Bezier','Ellipse']);for(const sourceId of sourceIds.keys()){const model=page.idManager.idMap?.get(sourceId);if(!model||model.id!==sourceId||(!serializable.has(model.modelType)&&!(model.modelType==='NetLabel'&&admittedNames.has(model))))fail('SOURCE_MODEL_KIND');}
 for(const type of ['BusEntry','MaskRegion','NetLabel','Combination','Image','Table'])if(array(shapes.getModels(type),20000).length)fail('UNSUPPORTED_FAMILY');
 const points=new Map();const remember=value=>{const key=JSON.stringify(pair(value));if(!points.has(key)){if(++totalPoints>100000)fail('POINT_TOTAL');points.set(key,value);}};
 const symbols=array(shapes.getModels('Symbol'),20000).map(model=>{
  if(++totalSymbols>20000||!['part','sheet'].includes(model.cmdKey)||model.isAbnormal===true||typeof model.getShapes!=='function'||typeof model.traversePins!=='function')fail('SYMBOL_KIND');
  if(model.cmdKey==='part'){const template=project.componentCache?.symbolTemplate?.[id(model.symbolUuid)],library=template?.shapeManager;if(template?.consistencyImpl?.state!=='initialized')fail('TEMPLATE_NOT_INITIALIZED');if(typeof library?.getModels!=='function'||typeof library.getPart!=='function')fail('PART_TEMPLATE');const parts=array(library.getModels('Symbol'),20000);if(parts.length!==1||parts[0]?.partId!==model.partId||library.getPart(model.partId)!==parts[0])fail('MULTIPART');}
  const attributes=attr(model),pinModels=array(model.getShapes('Pin'),4096),traversed=[];model.traversePins(item=>traversed.push(item));
  if(traversed.length!==pinModels.length||traversed.some(item=>!pinModels.includes(item)))fail('PIN_MEMBERSHIP');
  const pins=pinModels.map(item=>{if(++totalPins>100000||item.parent!==model||typeof item.isNoConnectShow!=='boolean')fail('PIN_OWNER');const attrs=attr(item);remember(item.origin);return{id:id(item.id),number:get(attrs,'Pin Number'),origin:pair(item.origin),noConnect:item.isNoConnectShow,noConnectAttribute:item.noConnect?attribute(item.noConnect):null,body:body(item),attributes:attrs};});
  return{id:id(model.id),kind:model.cmdKey,body:body(model),partCount:1,partNumber:1,attributes,pins};
 });
 const wires=wireModels.map(model=>{
  if(model.type!=='wire'||model.combination)fail('WIRE_KIND');
  const names=wireNames.get(model).map(item=>({id:id(item.id),key:id(item.key),value:copy(item.value),body:body(item)}));
  const lines=array(model.lines,20000).map(item=>{if(++totalLines>20000||item.parent!==model)fail('LINE_OWNER');const coordinates=array(item.points,2);if(coordinates.length!==2)fail('LINE_ARITY');coordinates.forEach(remember);return{id:id(item.id),body:body(item),points:coordinates.map(pair)};});
  return{id:id(model.id),body:body(model),names,lines};
 });
 const contacts=[...points.values()].map(value=>{const point=shapes.netPointManager.getNetPoint(value);if(!point||JSON.stringify(pair(point))!==JSON.stringify(pair(value))||!(point.Wire instanceof Set)||!(point.Pin instanceof Set)||!(point.Bus instanceof Set)||!(point.BusEntry instanceof Set)||point.Bus.size||point.BusEntry.size)fail('CONTACT');const ids=items=>[...items].map(item=>{if(item.shapeManager!==shapes||shapes.idManager?.get(item.id)!==item)fail('CONTACT_OWNER');return id(item.id);}).sort();return{point:pair(value),lineIds:ids(point.Wire),pinIds:ids(point.Pin)};});
 let source=page.consistencyImpl?.getSourceCode();if(typeof source!=='string'||!source||source.length>4194304)fail('SOURCE');totalSources+=source.length;if(totalSources>8388608)fail('SOURCE_TOTAL');
 ${NORMALIZE_DOCUMENT_SOURCE_CODE}
 if(sourceHeader.uuid!==page.uuid||sourceHeader.docType!=='SCH_PAGE')fail('SOURCE_IDENTITY');
 return{uuid:page.uuid,tabId:id(page.tabId),source,symbols,wires,contacts};
});
check();if(project.setting.universal.defaultNetName!==true||project.netLabelInterPageConnection!==true)fail('SETTINGS_CHANGED');
return{profile:${JSON.stringify(SCHEMATIC_FLAT_TOPOLOGY_PROFILE)},scope,settings,pages};
})()`;
}
