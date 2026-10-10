import { randomBytes } from "node:crypto";
import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import { DEVICE_NATIVE_HOST_GUARD } from "./device-runtime-guard.ts";
import { compareDocumentSources } from "./document-source.ts";
import type { NativeSourceDelta, NativeSourceObject, NativeSourceSnapshot } from "./document-source.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";
import { compileSchematicOperation, schematicOperationSchema } from "./schematic-operations.ts";
import type { SchematicOperation } from "./schematic-operations.ts";

export const SYMBOL_ACTION_PROFILE = "easyeda-pro-control.symbol-source.v1";
export const symbolScopeSchema = z.object({ libraryUuid: z.string().min(1), metadataOwnerUuid: z.string().min(1), symbolUuid: z.string().min(1), symbolName: z.string().min(1), partId: z.string().min(1) }).strict();
export type SymbolScope = z.infer<typeof symbolScopeSchema>;
interface Ids { readonly targetId?: string; readonly createdId?: string }
type Body = Record<string, unknown>;
const TYPES: Readonly<Record<string, string>> = { circle: "CIRCLE", rectangle: "RECT", text: "TEXT", pin: "PIN", attribute: "ATTR" };
const ALIGN = ["", "LEFT_TOP", "LEFT_MIDDLE", "LEFT_BOTTOM", "CENTER_TOP", "CENTER_MIDDLE", "CENTER_BOTTOM", "RIGHT_TOP", "RIGHT_MIDDLE", "RIGHT_BOTTOM"];
const STROKE = ["SOLID", "SHORT_DASH", "DOT", "DOT_DASH"];
const FILL: Readonly<Record<string, string>> = { None: "NONE", Solid: "SOLID", Grid: "GRID", "Horizontal Line": "HORIZONTAL_LINE", "Vertical Line": "VERTICAL_LINE", "Rhombic Grid": "RHOMBIC", "Left Slash Line": "LEFT_SLASH_LINE", "Right Slash Line": "RIGHT_SLASH_LINE" };
const PIN_SHAPE: Readonly<Record<string, string>> = { None: "NONE", Inverted: "INVERTED", Clock: "CLOCK", "Inverted Clock": "INVERTED_CLOCK" };
const FIELDS: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  text: { x: "x", y: "y", content: "value", rotation: "rotation", textColor: "color", fontName: "fontFamily", fontSize: "fontSize", bold: "fontWeight", italic: "italic", underLine: "underline", alignMode: "align" },
  attribute: { x: "x", y: "y", rotation: "rotation", color: "color", fontName: "fontFamily", fontSize: "fontSize", bold: "fontWeight", italic: "italic", underLine: "underline", alignMode: "align", fillColor: "fillColor", key: "key", value: "value", keyVisible: "keyVisible", valueVisible: "valueVisible" },
  pin: { x: "x", y: "y", rotation: "rotation", pinLength: "length", pinColor: "color", pinShape: "pinShape" },
};
const SHAPE_FIELDS: Readonly<Record<string, string>> = { centerX: "centerX", centerY: "centerY", radius: "radius", rotation: "rotation", color: "strokeColor", fillColor: "fillColor", lineWidth: "strokeWidth", lineType: "strokeStyle", fillStyle: "fillStyle" };
const PIN_FIELDS = [["pinName", "Pin Name"], ["pinNumber", "Pin Number"], ["pinType", "Pin Type"]] as const;
const DERIVED_FIELDS = new Set(["topLeftX", "topLeftY", "width", "height", "cornerRadius", ...PIN_FIELDS.map(([property]) => property)]);
const same = (left: unknown, right: unknown): boolean => canonicalJson(left) === canonicalJson(right);
function finite(value: unknown): number { if (typeof value !== "number" || !Number.isFinite(value)) { throw new TypeError("Missing finite symbol coordinate."); } return value; }
function checked(before: NativeSourceSnapshot): NativeSourceObject {
  if (before.schema !== "easyeda-pro-control.document-source.v1" || before.document["docType"] !== "SYMBOL" || before.document["editVersion"] !== "3.2.149.88089769" || before.sha256 !== sha256Json({ schema: before.schema, document: before.document, objects: before.objects }) || new Set(before.objects.map((entry) => entry.id)).size !== before.objects.length) { throw new Error("Symbol source identity, native version or commitment is invalid."); }
  const parts = before.objects.filter((entry) => entry.type === "PART");
  if (parts.length !== 1 || parts[0] === undefined) { throw new Error("This symbol profile needs one explicit existing part."); }
  return parts[0];
}
export function projectSymbolScope(source: NativeSourceSnapshot, history: NativeHistorySnapshot): SymbolScope {
  const part = checked(source);
  const asset = history.documents.find((entry) => entry.uuid === source.document["uuid"] && entry.docType === "SYMBOL" && !isNativeDocumentDeleted(entry));
  const meta = asset?.records.find((entry) => entry.id === "META" && entry.type === "META");
  if (meta === undefined) { throw new Error("Symbol is absent from the complete project checkpoint."); }
  return symbolScopeSchema.parse({ libraryUuid: history.projectUuid, metadataOwnerUuid: history.projectOwnerUuid, symbolUuid: asset?.uuid, symbolName: meta.body["title"], partId: part.id });
}
function parsed(input: unknown): SchematicOperation {
  const operation = schematicOperationSchema.parse(input);
  if (operation.documentType !== 2 || TYPES[operation.action.split(".")[1] ?? ""] === undefined) { throw new Error("Symbol geometry profile supports circle, rectangle, text, pin and attribute operations."); }
  return operation;
}
function resolvedTarget(operation: SchematicOperation, ids: Ids): string {
  if (!("target" in operation)) { throw new Error("Missing symbol target."); }
  const id = "primitiveId" in operation.target ? operation.target.primitiveId : ids.targetId;
  if (id === undefined || (ids.targetId !== undefined && ids.targetId !== id)) { throw new Error("Unresolved or contradictory symbol target."); }
  return id;
}
function patchFields(family: string, properties: Body, previous: Body): Body {
  const result: Body = {};
  const fields = FIELDS[family] ?? SHAPE_FIELDS;
  for (const [key, value] of Object.entries(properties).filter(([property]) => !DERIVED_FIELDS.has(property))) {
    const field = fields[key];
    if (field === undefined) { throw new Error("Unmapped symbol geometry property."); }
    let mapped = value;
    if (["y", "centerY"].includes(key) && value !== null) { mapped = -finite(value); }
    if (key === "alignMode" && value !== null) { mapped = ALIGN[finite(value)]; }
    if (key === "lineType" && value !== null) { mapped = STROKE[finite(value)]; }
    if (key === "fillStyle" && typeof value === "string") { mapped = FILL[value]; }
    if (key === "pinShape" && typeof value === "string") { mapped = PIN_SHAPE[value]; }
    if (mapped === undefined) { throw new Error("Unmapped native symbol enumeration."); }
    result[field] = mapped;
  }
  if (family === "text" && Object.hasOwn(properties, "textColor")) { result["fillColor"] = properties["textColor"]; }
  if (family === "attribute" && Object.hasOwn(properties, "fillColor") && properties["fillColor"] !== (properties["color"] ?? previous["color"])) { throw new Error("Native symbol attributes share their foreground and fill color."); }
  if (family === "attribute" && Object.hasOwn(properties, "color")) { result["fillColor"] = properties["color"]; }
  if (family === "rectangle") {
    const x = properties["topLeftX"] ?? previous["dotX1"], y = properties["topLeftY"] === undefined ? previous["dotY1"] : -finite(properties["topLeftY"]);
    const width = properties["width"] ?? (finite(previous["dotX2"]) - finite(previous["dotX1"]));
    const height = properties["height"] ?? (finite(previous["dotY1"]) - finite(previous["dotY2"]));
    Object.assign(result, { dotX1: finite(x), dotY1: finite(y), dotX2: finite(x) + finite(width), dotY2: finite(y) - finite(height) });
    if (Object.hasOwn(properties, "cornerRadius")) { result["radiusX"] = properties["cornerRadius"]; result["radiusY"] = properties["cornerRadius"]; }
  }
  return result;
}
function snapshot(before: NativeSourceSnapshot, objects: readonly NativeSourceObject[]): NativeSourceSnapshot {
  const base = { schema: before.schema, document: before.document, objects: objects.toSorted((a, b) => a.id.localeCompare(b.id)) };
  return { ...base, sha256: sha256Json(base) };
}
function pinAttribute(id: string, key: string, value: unknown, body: Body, zIndex: number): NativeSourceObject {
  if (typeof value !== "string") { throw new TypeError("Symbol pin attributes require exact string values."); }
  return { id: sha256Json({ id, key }).slice(0, 16), type: "ATTR", body: { partId: body["partId"], locked: false, zIndex, parentId: id, key, value, keyVisible: false, valueVisible: false, x: body["x"], y: body["y"], rotation: 0, color: null, fillColor: null, fontFamily: null, fontSize: null, fontWeight: null, italic: null, underline: null, strikeout: false, align: "LEFT_BOTTOM" } };
}
function updatePinChildren(records: Map<string, NativeSourceObject>, children: readonly NativeSourceObject[], old: NativeSourceObject | undefined, body: Body, values: Body, deleting: boolean): void {
  if (old === undefined) { throw new Error("Missing symbol pin baseline."); }
  for (const child of children) {
    if (deleting) { records.delete(child.id); }
    else {
      const updated = { ...child.body };
      const property = PIN_FIELDS.find(([, key]) => child.body["key"] === key)?.[0];
      if (property !== undefined && Object.hasOwn(values, property)) { updated["value"] = values[property]; }
      for (const coordinate of ["x", "y"].filter((key) => updated[key] !== null && updated[key] !== undefined)) { updated[coordinate] = finite(updated[coordinate]) + finite(body[coordinate]) - finite(old.body[coordinate]); }
      records.set(child.id, { ...child, body: updated });
    }
  }
}
function assertPins(objects: readonly NativeSourceObject[]): void {
  const numbers: unknown[] = [];
  for (const pin of objects.filter((entry) => entry.type === "PIN")) {
    const children = objects.filter((entry) => entry.body["parentId"] === pin.id);
    const keys = children.map((entry) => entry.body["key"]);
    if (children.some((entry) => entry.type !== "ATTR") || new Set(keys).size !== keys.length || PIN_FIELDS.some(([, key]) => !keys.includes(key))) { throw new Error("Symbol pin requires one complete, unique native attribute inventory."); }
    numbers.push(children.find((entry) => entry.body["key"] === "Pin Number")?.body["value"]);
  }
  if (numbers.some((value) => typeof value !== "string" || value.length === 0) || new Set(numbers).size !== numbers.length) { throw new Error("Symbol edit would create missing or duplicate pin numbers."); }
}
export function expectedSymbolSource(input: unknown, before: NativeSourceSnapshot, ids: Ids = {}): NativeSourceSnapshot {
  const operation = parsed(input);
  const part = checked(before);
  const family = operation.action.split(".")[1] ?? "";
  assertPins(before.objects);
  const records = new Map(before.objects.map((entry) => [entry.id, entry]));
  const creating = operation.action.endsWith(".create"), deleting = operation.action.endsWith(".delete");
  const id = creating ? ids.createdId : resolvedTarget(operation, ids);
  if (id === undefined || (creating && (!/^[a-f0-9]{16}$/u.test(id) || records.has(id)))) { throw new Error("Symbol creation needs one fresh journal-owned identity."); }
  const old = records.get(id), type = TYPES[family];
  if (!creating && (old === undefined || old.type !== type || old.body["partId"] !== part.id || old.body["locked"] !== false)) { throw new Error("Symbol target family/part differs or is locked."); }
  if (old !== undefined && old.body["groupId"] !== "" && old.body["groupId"] !== undefined) { throw new Error("Grouped symbol edits require a separate group proof."); }
  let values: Body = {};
  if ("properties" in operation) { values = operation.properties; }
  if ("patch" in operation) { values = operation.patch; }
  if (family === "pin" && old !== undefined && Object.hasOwn(values, "rotation") && values["rotation"] !== old.body["rotation"]) { throw new Error("Symbol pin rotation needs a proved owned-attribute rotation model; translation and renumber remain supported."); }
  const nextZ = Math.max(0, ...before.objects.filter((entry) => entry.body["partId"] === part.id).map((entry) => finite(entry.body["zIndex"]))) + 1;
  // The pinned symbol encoder emits groupId only for membership in an actual
  // PART group; an ungrouped primitive has no groupId property, not an empty one.
  let body: Body = old?.body ?? { partId: part.id, zIndex: nextZ, locked: false, ...(family === "text" ? { strikeout: false } : {}), ...(family === "pin" ? { display: true } : {}) };
  if (!deleting) { body = { ...body, ...patchFields(family, values, body) }; }
  if (deleting) { records.delete(id); } else {
    if (type === undefined) { throw new Error("Unknown native symbol family."); }
    records.set(id, { id, type, body });
  }
  if (family === "pin") {
    const children = before.objects.filter((entry) => entry.body["parentId"] === id);
    if (children.some((entry) => entry.type !== "ATTR" || entry.body["locked"] !== false)) { throw new Error("Symbol pin contains unreviewed or locked owned children."); }
    if (creating) {
      for (const [index, [property, key]] of PIN_FIELDS.entries()) {
        const child = pinAttribute(id, key, values[property], body, nextZ + index + 1);
        if (records.has(child.id)) { throw new Error("Created symbol pin attribute identity collision."); }
        records.set(child.id, child);
      }
    } else { updatePinChildren(records, children, old, body, values, deleting); }
  }
  const after = snapshot(before, [...records.values()]);
  assertPins(after.objects);
  return after;
}
export function assertSymbolProfileSupported(input: unknown, before: NativeSourceSnapshot, ids: Ids = {}): void {
  const operation = parsed(input);
  expectedSymbolSource(operation, before, operation.action.endsWith(".create") ? { ...ids, createdId: ids.createdId ?? "0".repeat(16) } : ids);
}
export interface SymbolMaterializationEffect {
  readonly kind: "native-part-symbol-attribute";
  readonly partId: string;
  readonly record: NativeSourceObject;
}
function hasPartSymbolAttribute(source: NativeSourceSnapshot, partId: string): boolean {
  return source.objects.some((entry) => entry.type === "ATTR" && entry.body["parentId"] === partId && entry.body["key"] === "Symbol");
}
/** The pinned symbol loader's handleAdd calls getOrCreateAttr("Symbol") for
 * every PART. Its previously unexported default can become a stored source row
 * on the first edit. Match the complete one-row body, never discard it or its ID.
 */
function materializedPartSymbolAttribute(before: NativeSourceSnapshot, expected: NativeSourceSnapshot, after: NativeSourceSnapshot): SymbolMaterializationEffect | undefined {
  const part = checked(before);
  if (hasPartSymbolAttribute(before, part.id) || hasPartSymbolAttribute(expected, part.id)) { return undefined; }
  const delta = compareDocumentSources(expected, after), record = delta.added[0];
  const zIndex = Math.max(0, ...before.objects.filter((entry) => entry.body["partId"] === part.id).map((entry) => finite(entry.body["zIndex"]))) + 1;
  const body = { x: null, y: null, rotation: null, color: null, fontFamily: null, fontSize: null, fontWeight: null,
    italic: null, underline: null, align: null, value: null, keyVisible: null, valueVisible: null, key: "Symbol", fillColor: null,
    parentId: part.id, zIndex, partId: part.id };
  if (delta.documentChanged || delta.changed.length > 0 || delta.removed.length > 0 || delta.added.length !== 1 ||
      record === undefined || record.type !== "ATTR" || !/^[a-f0-9]{16}$/u.test(record.id) || !Number.isSafeInteger(zIndex) ||
      !same(record.body, body)) { return undefined; }
  return { kind: "native-part-symbol-attribute", partId: part.id, record };
}
export function verifySymbolSourceEffect(input: unknown, before: NativeSourceSnapshot, after: NativeSourceSnapshot, ids: Ids = {}): NativeSourceDelta & { readonly symbolMaterializations: readonly SymbolMaterializationEffect[] } {
  checked(after);
  const expected = expectedSymbolSource(input, before, ids);
  const materialization = same(expected, after) ? undefined : materializedPartSymbolAttribute(before, expected, after);
  if (!same(expected, after) && materialization === undefined) { throw new Error("Symbol edit changed source outside its exact typed effect."); }
  return { ...compareDocumentSources(before, after), symbolMaterializations: materialization === undefined ? [] : [materialization] };
}
export function inverseSymbolOperation(input: unknown, before: NativeSourceSnapshot, ids: Ids = {}): SchematicOperation | undefined {
  const operation = parsed(input);
  // A normal typed inverse would leave the loader-materialized default behind.
  // Do not advertise exact restoration of a baseline where that row is absent.
  if (!hasPartSymbolAttribute(before, checked(before).id)) { return undefined; }
  const inverseId = `inverse-${sha256Json(operation.id).slice(0, 32)}`;
  if (operation.action.endsWith(".delete")) { return undefined; }
  if (operation.action.endsWith(".create")) { return schematicOperationSchema.parse({ id: inverseId, documentType: 2, action: operation.action.replace(".create", ".delete"), target: { primitiveId: ids.createdId } }); }
  checked(before);
  if (!("patch" in operation)) { throw new Error("Missing symbol patch."); }
  const targetId = resolvedTarget(operation, ids);
  const original = before.objects.find((entry) => entry.id === targetId);
  if (original === undefined) { throw new Error("Missing symbol inverse baseline."); }
  const patch = Object.fromEntries(Object.keys(operation.patch).map((key) => [key, inverseField(operation.action.split(".")[1] ?? "", key, original, before)]));
  return schematicOperationSchema.parse({ id: inverseId, documentType: 2, action: operation.action, target: { primitiveId: targetId }, patch });
}
function inverseField(family: string, key: string, original: NativeSourceObject, before: NativeSourceSnapshot): unknown {
  const body = original.body;
  const special: Body = { topLeftX: body["dotX1"], topLeftY: body["dotY1"] === undefined ? undefined : -finite(body["dotY1"]), cornerRadius: body["radiusX"] };
  if (key === "width") { return finite(body["dotX2"]) - finite(body["dotX1"]); }
  if (key === "height") { return finite(body["dotY1"]) - finite(body["dotY2"]); }
  if (Object.hasOwn(special, key)) { return special[key]; }
  const pinField = PIN_FIELDS.find(([property]) => property === key);
  if (pinField !== undefined) { return before.objects.find((entry) => entry.type === "ATTR" && entry.body["parentId"] === original.id && entry.body["key"] === pinField[1])?.body["value"]; }
  const field = (FIELDS[family] ?? SHAPE_FIELDS)[key];
  if (field === undefined) { throw new Error("Unmapped symbol inverse property."); }
  const value = body[field];
  if (value === null) { return null; }
  if (key === "y" || key === "centerY") { return -finite(value); }
  if (key === "alignMode" && typeof value === "string") { return ALIGN.indexOf(value); }
  if (key === "lineType" && typeof value === "string") { return STROKE.indexOf(value); }
  if (key === "fillStyle") { return Object.entries(FILL).find(([, native]) => native === value)?.[0]; }
  if (key === "pinShape") { return Object.entries(PIN_SHAPE).find(([, native]) => native === value)?.[0]; }
  return value;
}
export function compileSymbolOperation(input: unknown): ReturnType<typeof compileSchematicOperation> { return compileSchematicOperation(parsed(input)); }

/** Uses the same native F9 source action as the symbol editor, not a library
 * import or propagation to placed components. Scope comes from the checkpoint.
 */
export function buildSymbolNativeAdapter(input: unknown, before: NativeSourceSnapshot, scopeInput: SymbolScope, ids: Ids = {}): { profile: typeof SYMBOL_ACTION_PROFILE; code: string; expected: NativeSourceSnapshot; createdId?: string } {
  const operation = parsed(input), scope = symbolScopeSchema.parse(scopeInput);
  if (scope.symbolUuid !== before.document["uuid"] || scope.partId !== checked(before).id) { throw new Error("Symbol source and exact project library scope differ."); }
  const createdId = operation.action.endsWith(".create") ? ids.createdId ?? randomBytes(8).toString("hex") : undefined;
  const expected = expectedSymbolSource(operation, before, createdId === undefined ? ids : { ...ids, createdId });
  const code = `${buildSymbolSourceGuard(before, scope)}
const wanted=${JSON.stringify(expected.objects)};
const original=doc.consistencyImpl.getSourceCode();
const head=original.split('|\\n')[0];
const source=[head,...wanted.map((record,index)=>JSON.stringify({type:record.type,id:record.id,ticket:index+1})+'||'+JSON.stringify(record.body))].join('|\\n')+'|\\n';
const applied=await doc.shapeManager.actionRunner.run(async()=>{assertManager();if(stable(capture())!==stable(BASELINE))throw new Error('SYMBOL_SOURCE_CHANGED');if(await doc.consistencyImpl.setSourceCode(source)!==true)throw new Error('SYMBOL_SOURCE_REJECTED');});
if(applied!==true)throw new Error('SYMBOL_ACTION_REJECTED');assertManager();
return ${createdId === undefined ? "true" : JSON.stringify({ primitiveId: createdId })};`;
  return { profile: SYMBOL_ACTION_PROFILE, code, expected, ...(createdId === undefined ? {} : { createdId }) };
}

export function buildSymbolSourceGuard(expected: NativeSourceSnapshot, scopeInput: SymbolScope): string {
  const part = checked(expected);
  const scope = symbolScopeSchema.parse(scopeInput);
  if (scope.symbolUuid !== expected.document["uuid"] || scope.partId !== part.id) { throw new Error("Symbol source and exact project library scope differ."); }
  const baseline = canonicalJson({ document: expected.document, objects: expected.objects });
  if (baseline.length > 3 * 1024 * 1024) { throw new Error("Symbol source exceeds the reviewed bound."); }
  return `
const SCOPE=${JSON.stringify(scope)},BASELINE=${baseline};
${DEVICE_NATIVE_HOST_GUARD}
const manager=globalThis.SCH?.docMemoryManager,doc=manager?.getActiveDoc?.();
const assertManager=()=>{if(!doc||manager.getActiveDoc()!==doc||doc.uuid!==SCOPE.symbolUuid||doc.tabId!==SCOPE.symbolUuid+'@'+SCOPE.libraryUuid||doc.isSymbolDoc?.()!==true||doc.activePart?.partId!==SCOPE.partId)throw new Error('SYMBOL_MANAGER_SCOPE_DRIFT');};
assertManager();
const assertContext=async()=>{const p=await eda.dmt_Project.getCurrentProjectInfo(),d=await eda.dmt_SelectControl.getCurrentDocumentInfo();if(host.currentProject?.projectId!==SCOPE.libraryUuid||p?.uuid!==SCOPE.libraryUuid||d?.uuid!==SCOPE.symbolUuid||d?.tabId!==doc.tabId||d?.documentType!==2||d?.parentLibraryUuid!==SCOPE.metadataOwnerUuid)throw new Error('SYMBOL_CONTEXT_DRIFT');assertManager();};
await assertContext();
const metadata=(await bus.rpcCall('/PrjDB/symbol/getData',[SCOPE.symbolUuid,SCOPE.libraryUuid])).message;
if(metadata?.uuid!==SCOPE.symbolUuid||metadata?.project_uuid!==SCOPE.libraryUuid||metadata?.owner?.uuid!==SCOPE.metadataOwnerUuid||metadata?.display_title!==SCOPE.symbolName)throw new Error('SYMBOL_METADATA_DRIFT');
const stable=v=>Array.isArray(v)?'['+v.map(stable).join(',')+']':v!==null&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}':JSON.stringify(v);
const capture=()=>{assertManager();const source=doc.consistencyImpl.getSourceCode();if(typeof source!=='string'||source.length>4194304)throw new Error('SYMBOL_SOURCE_BOUND');const lines=source.split('|\\n');if(lines.at(-1)==='')lines.pop();const rows=lines.map(line=>{const i=line.indexOf('||');if(i<1)throw new Error('SYMBOL_SOURCE_RECORD');return{header:JSON.parse(line.slice(0,i)),body:JSON.parse(line.slice(i+2))};});if(rows[0]?.header.type!=='DOCHEAD')throw new Error('SYMBOL_SOURCE_HEADER');const document={...rows[0].body};if(typeof document.client!=='string'||!/^[a-f0-9]{16}$/.test(document.client)||!Number.isSafeInteger(document.updateTime)||document.version!==String(document.updateTime))throw new Error('SYMBOL_EXPORT_HEADER');delete document.client;delete document.updateTime;delete document.version;const ids=new Set();const objects=rows.slice(1).map(row=>{const{id,type}=row.header;if(typeof id!=='string'||!id||ids.has(id)||typeof type!=='string'||['DOCHEAD','DELETE','DELETE_DOC'].includes(type)||row.body===null||typeof row.body!=='object'||Array.isArray(row.body))throw new Error('SYMBOL_SOURCE_ID');ids.add(id);return{id,type,body:row.body};}).sort((a,b)=>a.id.localeCompare(b.id));return{document,objects};};
await assertContext();if(stable(capture())!==stable(BASELINE))throw new Error('SYMBOL_SOURCE_CHANGED');
`;
}
