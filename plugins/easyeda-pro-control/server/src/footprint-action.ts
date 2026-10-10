import { randomBytes } from "node:crypto";
import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import { buildReviewedNativeSourceMerge } from "./design-native-adapter.ts";
import type { DesignNativeAdapter } from "./design-native-adapter.ts";
import { footprintGeometryProperties } from "./design-operations.ts";
import { assertDesignSourceProfileSupported, buildExpectedDesignSource, buildInverseDesignOperation } from "./design-source-proof.ts";
import type { DesignSourceIds } from "./design-source-proof.ts";
import { compareDocumentSources } from "./document-source.ts";
import type { NativeSourceDelta, NativeSourceObject, NativeSourceSnapshot } from "./document-source.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";
import type { ExpectedContext } from "./engine.ts";

export const FOOTPRINT_ACTION_PROFILE = "easyeda-pro-control.footprint-geometry.v1";
const id = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/u);
const target = z.union([z.object({ primitiveId: z.string().min(1).max(256) }).strict(), z.object({ resultOf: id }).strict()]);
const textProperties = z.object({
  layer: z.number().int().refine((value) => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14].includes(value) || (value >= 71 && value <= 100)),
  x: z.number(), y: z.number(), text: z.string().min(1).max(4096), fontSize: z.number().positive(), lineWidth: z.number().positive(),
  origin: z.enum(["LEFT_BOTTOM", "CENTER_BOTTOM", "RIGHT_BOTTOM", "LEFT_MIDDLE", "CENTER_MIDDLE", "RIGHT_MIDDLE", "LEFT_TOP", "CENTER_TOP", "RIGHT_TOP"]),
  rotation: z.number(), mirror: z.boolean(), reverse: z.boolean(), expansion: z.number().nonnegative(), primitiveLock: z.boolean(),
}).strict();

// oxlint-disable-next-line typescript/explicit-function-return-type -- Preserve the strict literal action discriminator for each shared geometry schema.
function geometry<const Family extends string, Shape extends z.ZodRawShape>(family: Family, properties: z.ZodObject<Shape>) {
  return [
    z.object({ id, action: z.literal(`footprint.${family}.create`), properties }).strict(),
    z.object({ id, action: z.literal(`footprint.${family}.modify`), target, patch: properties.partial().refine((value) => Object.keys(value).length > 0, "Empty footprint patch.") }).strict(),
    z.object({ id, action: z.literal(`footprint.${family}.delete`), target }).strict(),
  ] as const;
}
const pad = footprintGeometryProperties.pad.extend({ net: z.literal("") });
const emptyNet = { net: z.literal("") };
const arc = footprintGeometryProperties.arc.extend(emptyNet), fill = footprintGeometryProperties.fill.extend(emptyNet), line = footprintGeometryProperties.line.extend(emptyNet), polyline = footprintGeometryProperties.polyline.extend(emptyNet);
export const footprintOperationSchema = z.discriminatedUnion("action", [
  ...geometry("line", line),
  ...geometry("arc", arc),
  ...geometry("polyline", polyline),
  ...geometry("fill", fill),
  z.object({ id, action: z.literal("footprint.pad.create"), properties: pad }).strict(),
  z.object({ id, action: z.literal("footprint.pad.modify"), target, patch: pad.omit({ padType: true }).partial().refine((value) => Object.keys(value).length > 0) }).strict(),
  z.object({ id, action: z.literal("footprint.pad.delete"), target }).strict(),
  ...geometry("text", textProperties),
]);
export type FootprintOperation = z.infer<typeof footprintOperationSchema>;
export const footprintScopeSchema = z.object({ libraryUuid: z.string().min(1).max(256), metadataOwnerUuid: z.string().min(1).max(256), footprintUuid: z.string().min(1).max(256), footprintName: z.string().min(1).max(512) }).strict();
export type FootprintScope = z.infer<typeof footprintScopeSchema>;

/** The project collection and metadata owner are distinct native identities. */
export function projectFootprintScope(source: NativeSourceSnapshot, history: NativeHistorySnapshot, context: ExpectedContext): FootprintScope {
  if (context.document.documentType !== 4 || context.document.uuid !== source.document["uuid"] ||
      context.project.uuid !== history.projectUuid || context.document.tabId !== `${String(source.document["uuid"])}@${history.projectUuid}` ||
      context.document["parentLibraryUuid"] !== history.projectOwnerUuid) { throw new Error("Footprint context is not bound to its exact checkpoint collection and owner."); }
  const asset = history.documents.find((entry) => entry.uuid === source.document["uuid"] && entry.docType === "FOOTPRINT" && !isNativeDocumentDeleted(entry));
  const metadata = asset?.records.find((entry) => entry.id === "META" && entry.type === "META");
  if (metadata === undefined || source.document["docType"] !== "PCB") { throw new Error("Footprint is absent from the complete project checkpoint or has an unreviewed export header."); }
  return footprintScopeSchema.parse({ libraryUuid: history.projectUuid, metadataOwnerUuid: history.projectOwnerUuid, footprintUuid: asset?.uuid, footprintName: metadata.body["title"] });
}

function snapshot(before: NativeSourceSnapshot, objects: readonly NativeSourceObject[], document = before.document): NativeSourceSnapshot {
  const base = { schema: before.schema, document, objects: objects.toSorted((left, right) => left.id.localeCompare(right.id)) };
  return { ...base, sha256: sha256Json(base) };
}

function assertFootprintSource(before: NativeSourceSnapshot): NativeSourceObject {
  if (before.schema !== "easyeda-pro-control.document-source.v1" || before.document["docType"] !== "PCB" || before.document["editVersion"] !== "3.2.149.88089769" || typeof before.document["uuid"] !== "string" || !before.document["uuid"] || before.sha256 !== sha256Json({ schema: before.schema, document: before.document, objects: before.objects }) || new Set(before.objects.map((object) => object.id)).size !== before.objects.length) {throw new Error("Invalid footprint source identity, hash or native version.");}
  const attributes = before.objects.filter((object) => object.type === "ATTR"), names = new Set<string>();
  for (const attribute of attributes) {
    const key = attribute.body["key"];
    if (typeof key !== "string" || (key !== "" && names.has(key)) || (attribute.body["parentId"] !== "" && attribute.body["parentId"] !== null && attribute.body["parentId"] !== undefined)) {throw new Error("Footprint attributes would invoke native duplicate/parent repair.");}
    if (key !== "") {names.add(key);}
  }
  const footprint = attributes.find((attribute) => attribute.body["key"] === "Footprint");
  if (footprint === undefined || typeof footprint.body["value"] !== "string" || !footprint.body["value"]) {throw new Error("Footprint source lacks its required named Footprint attribute.");}
  if (before.objects.some((object) => object.type === "COMPONENT" || object.type === "PAD_NET")) {throw new Error("Footprint geometry cannot contain PCB component/pad-net instances.");}
  return footprint;
}

function pcbProjection(before: NativeSourceSnapshot): NativeSourceSnapshot {
  assertFootprintSource(before);
  return snapshot(before, before.objects, { ...before.document, docType: "PCB" });
}

function pcbOperation(operation: FootprintOperation): unknown {
  return { ...operation, action: operation.action.replace("footprint.", "pcb.") };
}

const textFields: Readonly<Record<string, string>> = { layer: "layerId", x: "x", y: "y", text: "text", fontSize: "fontSize", lineWidth: "strokeWidth", origin: "origin", rotation: "angle", mirror: "mirror", reverse: "reverse", expansion: "expansion", primitiveLock: "locked" };
function textExpected(operation: FootprintOperation, before: NativeSourceSnapshot, ids: DesignSourceIds): NativeSourceSnapshot {
  const patch: Record<string, unknown> = {};
  let values: Record<string, unknown> = {};
  if ("properties" in operation) {values = operation.properties;}
  if ("patch" in operation) {values = operation.patch;}
  for (const [field, value] of Object.entries(values)) {
    const key = textFields[field];
    if (key === undefined) {throw new Error("Unreviewed footprint text field.");}
    patch[key] = typeof value === "number" ? Math.round(value * 10_000 + 1e-10) / 10_000 : value;
  }
  const records = new Map(before.objects.map((object) => [object.id, object]));
  if (operation.action === "footprint.text.create") {
    const created = ids.createdId;
    if (created === undefined || !/^[a-f0-9]{16}$/u.test(created) || records.has(created)) {throw new Error("Footprint text creation needs one fresh journal-owned identity.");}
    records.set(created, { id: created, type: "STRING", body: { groupId: 0, fontFamily: "default", bold: 0, italic: 0, zIndex: -1, specialColor: null, ...patch } });
  } else {
    if (!("target" in operation)) {throw new Error("Missing footprint text target.");}
    const wantedId = "primitiveId" in operation.target ? operation.target.primitiveId : ids.targetId;
    if (ids.targetId !== undefined && wantedId !== ids.targetId) {throw new Error("Footprint resolved text identity disagrees with its target.");}
    const wanted = wantedId === undefined ? undefined : records.get(wantedId);
    if (wanted === undefined || wanted.type !== "STRING" || wanted.body["fontFamily"] !== "default") {throw new Error("Footprint text requires an existing standalone default-font STRING.");}
    if (wanted.body["locked"] !== false && !(Object.keys(patch).length === 1 && patch["locked"] === false)) {throw new Error("Locked footprint text requires a separate unlock.");}
    if (Object.keys(patch).some((key) => !Object.hasOwn(wanted.body, key))) {throw new Error("Footprint text patch has no complete baseline value.");}
    if (operation.action === "footprint.text.delete") {records.delete(wanted.id);}
    else {records.set(wanted.id, { ...wanted, body: { ...wanted.body, ...patch } });}
  }
  return snapshot(before, [...records.values()]);
}

export function compileFootprintOperation(input: unknown): { profile: typeof FOOTPRINT_ACTION_PROFILE; id: string; action: FootprintOperation["action"]; documentType: 4; resultKind: "created-primitive" | "modified-primitive" | "boolean"; operation: FootprintOperation } {
  const operation = footprintOperationSchema.parse(input);
  let resultKind: "created-primitive" | "modified-primitive" | "boolean" = "boolean";
  if (operation.action.endsWith(".create")) {resultKind = "created-primitive";}
  if (operation.action.endsWith(".modify")) {resultKind = "modified-primitive";}
  return { profile: FOOTPRINT_ACTION_PROFILE, id: operation.id, action: operation.action, documentType: 4, resultKind, operation };
}

export function expectedFootprintSource(input: unknown, before: NativeSourceSnapshot, ids: DesignSourceIds = {}): NativeSourceSnapshot {
  const operation = footprintOperationSchema.parse(input);
  assertFootprintSource(before);
  if (operation.action.startsWith("footprint.text.")) {return textExpected(operation, before, ids);}
  const expected = buildExpectedDesignSource(pcbOperation(operation), pcbProjection(before), ids);
  // QR.ignorePartitionId is true in editor 4. Native FileSource omits this
  // Empty PCB-only default; never remove any field from an existing record.
  const existing = new Set(before.objects.map((object) => object.id));
  const objects = expected.objects.map((object) => {
    let body = object.body;
    if (!existing.has(object.id) && body["partitionId"] === "") { body = Object.fromEntries(Object.entries(body).filter(([key]) => key !== "partitionId")); }
    if (!existing.has(object.id) && object.type === "PAD") { body = { ...body, unusedInnerLayers: [] }; }
    if (object.type === "POLY" && (!existing.has(object.id) || (operation.action === "footprint.polyline.modify" && operation.patch.polygon !== undefined))) {
      const paths = body["path"];
      if (!Array.isArray(paths) || paths.length !== 1 || !Array.isArray(paths[0])) { throw new Error("Footprint POLY requires one native contour."); }
      body = { ...body, path: paths[0] };
    }
    return { id: object.id, type: object.type, body };
  });
  const result = snapshot(before, objects);
  return result;
}

export function assertFootprintProfileSupported(input: unknown, before: NativeSourceSnapshot, ids: DesignSourceIds = {}): void {
  const operation = footprintOperationSchema.parse(input);
  assertFootprintSource(before);
  if (operation.action === "footprint.text.create") {return;}
  if (operation.action.startsWith("footprint.text.")) {textExpected(operation, before, ids);}
  else {assertDesignSourceProfileSupported(pcbOperation(operation), pcbProjection(before), ids);}
}

export function verifyFootprintSourceEffect(input: unknown, before: NativeSourceSnapshot, after: NativeSourceSnapshot, ids: DesignSourceIds = {}): NativeSourceDelta {
  const expected = expectedFootprintSource(input, before, ids);
  assertFootprintSource(after);
  if (canonicalJson(expected) !== canonicalJson(after)) {throw new Error("Footprint geometry changed attributes, metadata, fonts or unrelated records beyond its exact typed effect.");}
  return compareDocumentSources(before, after);
}

export function inverseFootprintOperation(input: unknown, before: NativeSourceSnapshot, ids: DesignSourceIds = {}): FootprintOperation | undefined {
  const operation = footprintOperationSchema.parse(input);
  assertFootprintProfileSupported(operation, before, ids);
  if (!operation.action.startsWith("footprint.text.")) {
    const inverse = buildInverseDesignOperation(pcbOperation(operation), pcbProjection(before), ids);
    return inverse === undefined ? undefined : footprintOperationSchema.parse({ ...inverse, action: inverse.action.replace("pcb.", "footprint.") });
  }
  const inverseId = `inverse-${sha256Json(operation).slice(0, 32)}`;
  if (operation.action === "footprint.text.delete") {return undefined;}
  if (operation.action === "footprint.text.create") {return footprintOperationSchema.parse({ id: inverseId, action: "footprint.text.delete", target: { primitiveId: ids.createdId } });}
  if (operation.action !== "footprint.text.modify") {throw new Error("Unreviewed footprint text inverse.");}
  const wantedId = "primitiveId" in operation.target ? operation.target.primitiveId : ids.targetId;
  const wanted = before.objects.find((object) => object.id === wantedId);
  if (wanted === undefined) {throw new Error("Footprint inverse baseline absent.");}
  const patch = Object.fromEntries(Object.keys(operation.patch).map((key) => [key, wanted.body[textFields[key] ?? ""]]));
  return footprintOperationSchema.parse({ id: inverseId, action: "footprint.text.modify", target: { primitiveId: wanted.id }, patch });
}

/** Retained offline source-merge fixture helper, not routed by design-action.
 * Runtime footprint geometry uses explicit native history handlers instead.
 * Native FileSource uses its
 * PCB encoder even for editor type 4; retain that actual export header. The
 * library kind is independently proved by editor context and checkpoint UUID.
 * Save/reopen must use the exact library owner and UUID;
 * a project PCB save or an update of placed instances is not equivalent.
 */
export function buildFootprintNativeAdapter(input: unknown, before: NativeSourceSnapshot, scopeInput: FootprintScope, ids: DesignSourceIds = {}): DesignNativeAdapter {
  const operation = footprintOperationSchema.parse(input), scope = footprintScopeSchema.parse(scopeInput);
  const attribute = assertFootprintSource(before);
  if (scope.footprintUuid !== before.document["uuid"] || scope.footprintName !== attribute.body["value"]) {throw new Error("Footprint source, required attribute and library identity disagree.");}
  const createdId = operation.action.endsWith(".create") ? ids.createdId ?? randomBytes(8).toString("hex") : undefined;
  const resolved = createdId === undefined ? ids : { ...ids, createdId };
  const expected = expectedFootprintSource(operation, before, resolved);
  verifyFootprintSourceEffect(operation, before, expected, resolved);
  const adapter = buildReviewedNativeSourceMerge(before, expected, createdId, 4);
  const guard = `
const FOOTPRINT_SCOPE = ${JSON.stringify(scope)};
const footprintContext = await eda.dmt_SelectControl.getCurrentDocumentInfo();
if (Number(footprintContext?.documentType) !== 4 || footprintContext?.uuid !== FOOTPRINT_SCOPE.footprintUuid || footprintContext?.parentLibraryUuid !== FOOTPRINT_SCOPE.metadataOwnerUuid || footprintContext?.tabId !== FOOTPRINT_SCOPE.footprintUuid + '@' + FOOTPRINT_SCOPE.libraryUuid) throw new Error('Footprint library editor scope drift');
const footprintIdentity = await eda.lib_Footprint.get(FOOTPRINT_SCOPE.footprintUuid,FOOTPRINT_SCOPE.libraryUuid);
if (footprintIdentity?.uuid !== FOOTPRINT_SCOPE.footprintUuid || footprintIdentity?.libraryUuid !== FOOTPRINT_SCOPE.metadataOwnerUuid || footprintIdentity?.name !== FOOTPRINT_SCOPE.footprintName) throw new Error('Footprint library identity drift');
`;
  return { ...adapter, code: guard + adapter.code };
}

export const FOOTPRINT_OPERATION_LIMITATIONS = Object.freeze([
  "Requires a separately verified exact library open/save/close/reopen lifecycle and full owner-store persistence proof.",
  "No implicit propagation to placed PCB instances or external libraries.",
  "Text uses the built-in default font; external font generation is a separate asset mutation.",
  "Required Footprint attribute and named attribute uniqueness must already be valid; no implicit native repair.",
  "PCB native geometry limits for pad shapes, masks, fill styles and cubic polygons also apply.",
  "Public geometry modifications preserve identity and layer; use explicit delete/create for POLY/FILL shape replacement.",
  "Default-font text cannot change reverse state. Graphic-arc angle/mode replacement is explicit delete/create.",
  "PAD property edits may update in-memory default-pad tool settings as the native UI does; this is not an allowed project-source or SQLite exception.",
]);
