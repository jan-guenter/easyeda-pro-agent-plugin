import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { currentPcbLayersRequestSchema } from "./current-pcb-layers.ts";
import { CURRENT_UI_IMPLEMENTATION } from "./current-ui-implementation.ts";
import { SDK_LOCAL_RUNTIME_PROFILE } from "./sdk-local-runtime.ts";

export const CURRENT_PCB_GEOMETRY_MAX_BYTES = 384 * 1024;
export const CURRENT_PCB_GEOMETRY_MAX_ROWS = 256;
export const CURRENT_PCB_GEOMETRY_MAX_NUMBER = 1e12;
const collectionMethods = ["eda.pcb_PrimitiveLine.getAll", "eda.pcb_PrimitiveArc.getAll", "eda.pcb_PrimitiveVia.getAll",
  "eda.pcb_PrimitiveComponent.getAll", "eda.pcb_PrimitivePad.getAll", "eda.pcb_PrimitiveString.getAll", "eda.pcb_PrimitiveDimension.getAll"] as const;
const selectedMethods = ["eda.pcb_PrimitiveLine.get", "eda.pcb_PrimitiveArc.get", "eda.pcb_PrimitiveVia.get",
  "eda.pcb_PrimitiveComponent.get", "eda.pcb_PrimitivePad.get", "eda.pcb_PrimitiveString.get", "eda.pcb_PrimitiveDimension.get"] as const;
const componentPadsMethod = "eda.pcb_PrimitiveComponent.getAllPinsByPrimitiveId";
const attributeCollectionMethod = "eda.pcb_PrimitiveAttribute.getAll";
const attributeSelectedMethod = "eda.pcb_PrimitiveAttribute.get";
const methods = [...collectionMethods, ...selectedMethods, componentPadsMethod, attributeCollectionMethod, attributeSelectedMethod] as const;
const targetSchema = currentPcbLayersRequestSchema.shape.target;
const numberSchema = z.number().min(-CURRENT_PCB_GEOMETRY_MAX_NUMBER).max(CURRENT_PCB_GEOMETRY_MAX_NUMBER)
  .refine((value) => !Object.is(value, -0), "Signed zero is not supported by this JSON observation.");
const layerSchema = numberSchema.refine((value) => Number.isInteger(value) && value >= 0 && value <= 65_535, "Invalid native layer ID.");
const boundedText = z.string().max(1024);
const idSchema = z.string().min(1).max(256);
const holeFields = { diameter: numberSchema.refine((value) => value >= 0, "Negative hole diameter."),
  offsetX: numberSchema, offsetY: numberSchema, rotation: numberSchema };
const holeSchema = z.discriminatedUnion("shape", [
  z.object({ ...holeFields, shape: z.literal("ROUND") }).strict(),
  z.object({ ...holeFields, shape: z.literal("SLOT"), length: numberSchema.refine((value) => value >= 0, "Negative slot length.") }).strict(),
]).nullable();
const defaultCopperShapeSchema = z.discriminatedUnion("shape", [
  z.object({ shape: z.literal("ELLIPSE"), width: numberSchema, height: numberSchema }).strict(),
  z.object({ shape: z.literal("OVAL"), width: numberSchema, height: numberSchema }).strict(),
  z.object({ shape: z.literal("RECT"), width: numberSchema, height: numberSchema, cornerRatioPercent: numberSchema }).strict(),
  z.object({ shape: z.literal("POLYGON"), details: z.literal("not-projected") }).strict(),
]);
const maskExpansionSchema = z.object({ mode: z.union([z.literal(1), z.literal(2)]), topSolder: numberSchema,
  bottomSolder: numberSchema, paste: numberSchema }).strict();
const thermalSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal(0), clearance: numberSchema, spokeWidth: numberSchema, angle: numberSchema }).strict(),
  z.object({ mode: z.literal(1) }).strict(), z.object({ mode: z.literal(2) }).strict(),
]).nullable();
const identity = { primitiveId: idSchema, primitiveLock: z.boolean() };
const base = { ...identity, net: boundedText.nullable() };
const track = { ...base, layer: layerSchema, startX: numberSchema, startY: numberSchema, endX: numberSchema,
  endY: numberSchema, lineWidth: numberSchema };
const lineSchema = z.object({ ...track, primitiveType: z.literal("Line") }).strict();
const arcSchema = z.object({ ...track, primitiveType: z.literal("Arc"), arcAngle: numberSchema,
  interactiveMode: z.union([z.literal(1), z.literal(2)]) }).strict();
const viaSchema = z.object({ ...base, primitiveType: z.literal("Via"), x: numberSchema, y: numberSchema,
  holeDiameter: numberSchema, diameter: numberSchema, viaType: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  designRuleBlindViaName: boundedText.nullable(), startLayer: layerSchema, endLayer: layerSchema,
  maskExpansionMode: numberSchema.refine(Number.isInteger, "Invalid native mask expansion mode."),
  topMaskExpansion: numberSchema, bottomMaskExpansion: numberSchema }).strict();
const componentSchema = z.object({ ...identity, primitiveType: z.literal("Component"), layer: z.union([z.literal(1), z.literal(2)]),
  x: numberSchema, y: numberSchema, rotation: numberSchema, designator: boundedText.optional(), name: boundedText.optional(),
  manufacturer: boundedText.optional(), manufacturerPart: boundedText.optional(), supplier: boundedText.optional(),
  supplierPart: boundedText.optional() }).strict();
const stringSchema = z.object({ ...identity, primitiveType: z.literal("String"), layer: layerSchema,
  x: numberSchema, y: numberSchema, text: z.string().max(65_536), fontFamily: boundedText,
  fontSize: numberSchema, lineWidth: numberSchema, alignMode: z.number().int().min(1).max(9),
  rotation: numberSchema, reverse: z.boolean(), expansion: numberSchema, mirror: z.boolean(),
  key: boundedText, showKey: z.boolean(), showValue: z.boolean(), positionIsNull: z.boolean(),
  silkColor: z.string().min(1).max(128).nullable() }).strict();
const attributeSchema = stringSchema.omit({ primitiveType: true, text: true, showKey: true, showValue: true }).extend({
  primitiveType: z.literal("Attribute"), parentPrimitiveId: idSchema, value: z.string().max(65_536),
  keyVisible: z.boolean(), valueVisible: z.boolean(),
}).strict();
const attributeGroupsSchema = z.array(z.object({ parentPrimitiveId: idSchema,
  ids: z.array(idSchema).max(CURRENT_PCB_GEOMETRY_MAX_ROWS) }).strict()).max(CURRENT_PCB_GEOMETRY_MAX_ROWS);
const dimensionCoordinatesSchema = z.union([
  z.tuple([numberSchema, numberSchema, numberSchema, numberSchema, numberSchema, numberSchema]),
  z.tuple([numberSchema, numberSchema, numberSchema, numberSchema, numberSchema, numberSchema, numberSchema, numberSchema]),
]);
const dimensionSchema = z.object({ ...identity, primitiveType: z.literal("Dimension"), layer: layerSchema,
  dimensionType: z.enum(["Length Dimension", "Radius Dimension", "Protractor Dimension"]), coordinateSet: dimensionCoordinatesSchema,
  canvasUnit: z.enum(["mm", "cm", "inch", "mil"]), lineWidth: numberSchema.refine((value) => value >= 0, "Negative dimension line width."),
  precision: numberSchema.refine((value) => Number.isInteger(value) && value >= 0 && value <= 4, "Invalid dimension precision.") }).strict().refine((row) => row.coordinateSet.length === (row.dimensionType === "Length Dimension" ? 8 : 6),
  "Dimension coordinate tuple does not match its type.");
const padSchema = z.object({ ...base, primitiveType: z.literal("Pad"), layer: z.union([z.literal(1), z.literal(2), z.literal(12)]),
  padNumber: boundedText, x: numberSchema, y: numberSchema, rotation: numberSchema, metallization: z.boolean(),
  padType: z.union([z.literal(0), z.literal(1), z.literal(2)]), hole: holeSchema,
  defaultCopperShape: defaultCopperShapeSchema, maskExpansion: maskExpansionSchema, thermal: thermalSchema }).strict();
const requestedIdsSchema = z.array(idSchema).min(1).max(CURRENT_PCB_GEOMETRY_MAX_ROWS)
  .refine((ids) => new Set(ids).size === ids.length, "Primitive IDs must be distinct.");
export const currentPcbGeometryRequestSchema = z.discriminatedUnion("method", [
  z.object({ method: z.enum(collectionMethods), arguments: z.object({}).strict(), target: targetSchema }).strict(),
  z.object({ method: z.enum(selectedMethods), arguments: z.object({ primitiveIds: requestedIdsSchema }).strict(), target: targetSchema }).strict(),
  z.object({ method: z.literal(componentPadsMethod), arguments: z.object({ primitiveId: idSchema }).strict(), target: targetSchema }).strict(),
  z.object({ method: z.literal(attributeCollectionMethod), arguments: z.object({}).strict(), target: targetSchema }).strict(),
  z.object({ method: z.literal(attributeSelectedMethod), arguments: z.object({ primitiveIds: requestedIdsSchema }).strict(), target: targetSchema }).strict(),
]);
export type CurrentPcbGeometryRequest = z.infer<typeof currentPcbGeometryRequestSchema>;
export const currentPcbGeometryQuerySchema = z.object({ method: z.enum(methods).optional(), includeSchemas: z.boolean().default(false) }).strict();
const resultShape = { ok: z.literal(true), kind: z.literal("current-pcb-geometry-observation"), target: targetSchema,
  rows: z.array(z.discriminatedUnion("primitiveType", [lineSchema, arcSchema, viaSchema, componentSchema, padSchema, stringSchema, dimensionSchema])).max(CURRENT_PCB_GEOMETRY_MAX_ROWS),
  samples: z.literal(2), implementationKind: z.literal("native-task-equivalent"), cadAuthority: z.literal(false),
  persistenceVerified: z.literal(false), sourceMembershipVerified: z.literal(false) };
const attributeResultShape = { ...resultShape, rows: z.array(attributeSchema).max(CURRENT_PCB_GEOMETRY_MAX_ROWS),
  attributeParentGroups: attributeGroupsSchema, relationshipEvidence: z.literal("native-component-attribute-groups"), reciprocalParentVerified: z.literal(false) };
export const currentPcbGeometryResultSchema = z.discriminatedUnion("method", [
  z.object({ ...resultShape, method: z.enum(collectionMethods) }).strict(),
  z.object({ ...resultShape, method: z.enum(selectedMethods), observedRowCount: z.number().int().min(1).max(CURRENT_PCB_GEOMETRY_MAX_ROWS) }).strict(),
  z.object({ ...resultShape, method: z.literal(componentPadsMethod), componentPrimitiveId: idSchema,
    observedComponentCount: z.number().int().min(1).max(CURRENT_PCB_GEOMETRY_MAX_ROWS),
    observedPadCount: z.number().int().min(0).max(CURRENT_PCB_GEOMETRY_MAX_ROWS),
    relationshipEvidence: z.literal("native-component-child-list-and-global-pad-membership"),
    reciprocalParentVerified: z.literal(false), symbolPinMappingVerified: z.literal(false) }).strict(),
  z.object({ ...attributeResultShape, method: z.literal(attributeCollectionMethod) }).strict(),
  z.object({ ...attributeResultShape, method: z.literal(attributeSelectedMethod), observedRowCount: z.number().int().min(1).max(CURRENT_PCB_GEOMETRY_MAX_ROWS) }).strict(),
]);

const limitations = [
  "Only the exact active ordinary project-owned type-3 PCB is admitted. The retained frame, local receiver and complete target are rechecked around awaits, with native tab/type identity bracketing each sample. This is not an atomic lock or proof against switching away and back between observations.",
  "This is an explicit native loaded-view geometry projection, not public class instances, complete native/source records, saved membership, ownership, connectivity, DRC or persistence proof. Loaded views may include inherited, generated and in-progress objects. Native display nets are copied without case conversion; empty string and null remain distinct, while undefined refuses.",
  "Unfiltered getAll accepts empty arguments. The narrower get equivalent accepts only 1 to 256 distinct primitiveIds in an array, returns DTOs in caller order and refuses the entire request if any ID is unavailable in the observed family. Scalar input and the public method's missing-ID skipping are not supported. This does not change editor selection or prove absence from saved source.",
  "Fixed native getAll handlers replace mutable public active-tab routing for both methods. All projected scalar fields and ordered rows across the complete family must match twice before requested IDs are selected; omitted native fields are not compared. Full-family validation and bounds apply even to unrequested rows. No direct getByIds or SDK object constructor is invoked. For get, returnedRowCount counts selected DTOs and observedRowCount counts the complete observed family.",
  "Positions, widths, diameters and mask expansions are in mil; arcAngle and Component/Pad rotation are in degrees. The native callback's scaled results are not rounded using the public wrapper. Arc endpoints/angle and Pad placement can therefore retain precision that the public wrapper rounds; Via diameters are twice the native callback radii, without public one-decimal radius rounding. Layer IDs and arc/via/mask modes are native values, not validated design rules.",
  "Coordinates use the data origin, not the displayed canvas origin. Arc endpoints and angle are incomplete shape data: a full-circle case can project to zero angle. Native center/radius/sweep and partition are omitted, as are Via unused-layer and is-suture fields. Mask expansion values are loaded model observations, not proof of saved overrides or current rule resolution.",
  "Component observation contains identity, lock, placement on layer 1 or 2 and six optional raw attribute strings: designator, name, manufacturer, manufacturerPart, supplier and supplierPart. Missing and own-undefined attributes both omit the corresponding output field; empty strings are preserved. Null, non-string, inherited or accessor-valued selected attributes refuse. Name formulas are returned verbatim, not evaluated or claimed to match rendered text. Other attributes, library/device/footprint/3D enrichment and child associations are omitted. These strings do not prove part identity or ownership.",
  "String is the PCB text family, not pcb_PrimitiveText. Native string-getAll excludes views with a native parent, so get is limited to that same observed family and does not cover component attributes or inherited text. DTOs retain raw text and fontFamily, layer, placement, fontSize, lineWidth, alignMode 1..9, degree rotation, reverse, expansion, mirror, key, showKey, showValue, positionIsNull and serialized silkColor. Native internal distances are multiplied by 10 to mil; rotation is multiplied by 180 then divided by Math.PI, matching the installed public mapper without defaults or coercion. Empty text/font/key strings remain empty; missing or undefined projected scalars refuse. Only silkColor accepts null. The native serializer applies color.toString()||null, so its null does not prove an absent raw model color; nonempty colors stay bounded raw strings, not validated CSS. Text has no net field. Raw value and display flags do not prove rendered text. Outlines, font cache, zIndex, partition/group, model type and source ownership are omitted and not compared. Existing font caches are read by the native serializer, without loading fonts or refreshing geometry.",
  "Attribute observes existing component-view groups through fixed attribute-getAll. Each DTO adds parentPrimitiveId, key/value and keyVisible/valueVisible with the same finite numeric placement, style, display-state and serialized-color projection as String. Nullable public coordinates are not coerced; positionIsNull remains separate. Value is current model text: Name may already be formula-expanded, unlike the raw Component Name metadata. FormulaName, evaluation, rendered text, outlines and font objects are omitted. Complete ordered attributeParentGroups retain every parent and its ordered child IDs, including empty groups, even for get. Two complete group-and-scalar samples must match before selection. Grouping does not prove reciprocal ownership or complete stored component/attribute membership. Parent/layer/lock filters are unsupported; the existing identity-only reader has separate larger limits.",
  "Dimension observes native Length, Radius then Angle manager order, with no parent filter and only existing stateWatcher views. DTOs contain type, layer, lock, precision0..4, nonnegative lineWidth and a coordinateSet of eight numbers for Length or six for Radius/Protractor. Coordinates and lineWidth are already mil in the native callback and are not scaled again. Radius coordinates include a text anchor, not glyph bounds. canvasUnit is the current document unit mm/cm/inch/mil: native getAll overwrites each model's unit, so it is neither the coordinate unit nor verified annotation unit. No bare unit field, rendered measurement, inferred length/radius/angle, annotation text/font/color/textFollow, parent/partition/group, source ownership or persistence is projected. Explicit-ID get uses the same complete getAll sample, not the native generic getByIds lookup. Generic type lookup remains unchanged.",
  "Pad observation adds number, raw net, metallization and pad type 0/1/2 on layer 1/2/12. Hole is null or a ROUND/SLOT projection: diameter, SLOT length and offsets in mil, with rotation in degrees relative to the pad. Native zero dimensions are retained observations, not manufacturing validity. A null hole omits all hole-specific scalars, including native holeRotation that may be NaN. Pad family membership alone does not distinguish free pads from component pads.",
  "defaultCopperShape preserves ELLIPSE/OVAL width/height or RECT width/height/cornerRatioPercent. Native shape dimensions are already rounded to 0.1 mil, and the rectangle fourth value is a percentage, not the radius named in public documentation. These parameters do not reconstruct the rendered outline; native ELLIPSE can use width alone. POLYGON returns only {shape:POLYGON,details:not-projected}: its path is neither returned nor compared. NGON and unknown representations refuse; special physical-layer stacks remain omitted.",
  "Pad maskExpansion reports native mode 1 (follow rules) or 2 (custom), topSolder, bottomSolder and one shared paste value in mil. Negative/zero observations are preserved; native null-to-zero coercion means zero does not prove an explicit override. No rule refresh or face applicability is established. thermal is null, mode 1 (direct), mode 2 (nonconnected), or mode 0 with clearance/spokeWidth in mil and angle in degrees. Null means no pad configuration in this projection, not no connection. Thermal fields may be inherited from a footprint template; they do not prove stored overrides, current rule resolution, actual poured spokes or fabrication validity.",
  "getAllPinsByPrimitiveId accepts one exact component ID and returns its entire native child-pad sequence, correlated by full IDs and common scalar fields with the complete global Pad projection. Two complete ordered component-ID, Pad and child-list samples must match. Missing components, null child replies, duplicate IDs and missing or contradictory global Pad rows refuse; an empty child list is accepted only for an observed component. Geometry, holes, default shape, masks and thermal configuration come from global pad-getAll, not the differently scaled and rounded component callback. No ID-prefix reconstruction, reciprocal parent lookup, exclusivity across other component lists, saved ownership, symbol-pin mapping or connectivity proof is implied. The public ComponentPad parent getter merely returns the caller-supplied component ID and is not invoked.",
  "At most 256 rows per observed family or child list, 256 Attribute parent groups and 256 total Attribute rows, 256 characters per identity, 1024 characters per net/rule name/pad number/component metadata/fontFamily/key string, 128 per serialized String/Attribute silkColor, 65536 UTF-16 units per String text or Attribute value, scalar magnitude 1e12 and 393216 UTF-8 bytes of evidence. The byte ceiling also bounds the complete compound association sample before selection. Signed zero, non-finite projected values, malformed, duplicate, incomplete and oversized results refuse without truncation or coercion. Vendor enumeration and serialization precede these bounds; the observer deadline does not cancel vendor work.",
  "No selection, layer change, navigation, Save, source export, design mutation or project/library service is requested. Local RPC bookkeeping, reviewed native identity initialization and possible empty pad-length singleton allocation remain incidental. Component enumeration reads existing footprint/device/font caches without fetching library data. Source review and offline tests are not current live validation.",
] as const;

export function parseCurrentPcbGeometryRequest(input: unknown): CurrentPcbGeometryRequest { return currentPcbGeometryRequestSchema.parse(input); }
export function currentPcbGeometryFamily(request: CurrentPcbGeometryRequest): "Line" | "Arc" | "Via" | "Component" | "Pad" | "String" | "Attribute" | "Dimension" {
  switch (request.method) {
    case "eda.pcb_PrimitiveLine.getAll":
    case "eda.pcb_PrimitiveLine.get": { return "Line"; }
    case "eda.pcb_PrimitiveArc.getAll":
    case "eda.pcb_PrimitiveArc.get": { return "Arc"; }
    case "eda.pcb_PrimitiveVia.getAll":
    case "eda.pcb_PrimitiveVia.get": { return "Via"; }
    case "eda.pcb_PrimitiveComponent.getAll":
    case "eda.pcb_PrimitiveComponent.get": { return "Component"; }
    case "eda.pcb_PrimitivePad.getAll":
    case "eda.pcb_PrimitivePad.get":
    case componentPadsMethod: { return "Pad"; }
    case "eda.pcb_PrimitiveString.getAll":
    case "eda.pcb_PrimitiveString.get": { return "String"; }
    case attributeCollectionMethod:
    case attributeSelectedMethod: { return "Attribute"; }
    case "eda.pcb_PrimitiveDimension.getAll":
    case "eda.pcb_PrimitiveDimension.get": { return "Dimension"; }
    default: { throw new Error("Unsupported current PCB geometry method."); }
  }
}
export function queryCurrentPcbGeometry(input: unknown = {}): Record<string, unknown> {
  const query = currentPcbGeometryQuerySchema.parse(input);
  const entries = methods.filter((method) => query.method === undefined || query.method === method).map((method) => {
    let parameters: string[] = [];
    if (method === componentPadsMethod) { parameters = ["primitiveId"]; }
    else if (method.endsWith(".get")) { parameters = ["primitiveIds"]; }
    const entry: Record<string, unknown> = { path: method, method, effect: "current-pcb-loaded-view-geometry-read", parameters,
      invocationEnabledByDiscovery: false, limitations: [...limitations], provenance: {
        apiVersion: SDK_LOCAL_RUNTIME_PROFILE.installedBundles.publicApi.version,
        apiSha256: SDK_LOCAL_RUNTIME_PROFILE.installedBundles.publicApi.implementationSha256,
        uiVersion: CURRENT_UI_IMPLEMENTATION.version, uiSha256: CURRENT_UI_IMPLEMENTATION.sha256,
        implementationKind: "native-task-equivalent", liveValidation: "not-recorded" } };
    if (query.includeSchemas) { entry["inputSchema"] = z.toJSONSchema(currentPcbGeometryRequestSchema); }
    return entry;
  });
  return { offline: true, invocationEnabledByDiscovery: false, total: entries.length, entries };
}
export function validateCurrentPcbGeometryArguments(input: unknown): Record<string, unknown> {
  const result = currentPcbGeometryRequestSchema.safeParse(input);
  return result.success ? { valid: true, request: result.data, executionAuthorized: false } : {
    valid: false, executionAuthorized: false,
    issues: result.error.issues.slice(0, 16).map((issue) => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}
function assertAttributeGroups(payload: z.infer<typeof currentPcbGeometryResultSchema>): void {
  if (!("attributeParentGroups" in payload)) { return; }
  const memberships = new Map<string, string>(), orderedIds: string[] = [], parents = new Set<string>();
  for (const group of payload.attributeParentGroups) {
    if (parents.has(group.parentPrimitiveId)) { throw new Error("PCB Attribute groups contain duplicate parents."); }
    parents.add(group.parentPrimitiveId);
  }
  for (const group of payload.attributeParentGroups) {
    if (orderedIds.length + group.ids.length > CURRENT_PCB_GEOMETRY_MAX_ROWS) { throw new Error("PCB Attribute groups exceed their total identity bound."); }
    for (const id of group.ids) {
      if (parents.has(id) || memberships.has(id)) { throw new Error("PCB Attribute groups contain duplicate or colliding identities."); }
      memberships.set(id, group.parentPrimitiveId); orderedIds.push(id);
    }
  }
  for (const row of payload.rows) {
    if (memberships.get(row.primitiveId) !== row.parentPrimitiveId) { throw new Error("PCB Attribute row differs from its observed parent group."); }
  }
  if (payload.method === attributeCollectionMethod) {
    if (canonicalJson(orderedIds) !== canonicalJson(payload.rows.map(row => row.primitiveId))) { throw new Error("PCB Attribute groups differ from the complete ordered rows."); }
  } else if (payload.observedRowCount !== orderedIds.length) { throw new Error("PCB Attribute groups differ from the complete observed count."); }
}
export function validateCurrentPcbGeometryResult(input: unknown, raw: unknown): Record<string, unknown> {
  const request = parseCurrentPcbGeometryRequest(input);
  const payload = currentPcbGeometryResultSchema.parse(raw);
  if (payload.method !== request.method || canonicalJson(payload.target) !== canonicalJson(request.target)) { throw new Error("PCB geometry result differs from its exact target request."); }
  if (Buffer.byteLength(JSON.stringify(payload), "utf8") > CURRENT_PCB_GEOMETRY_MAX_BYTES) { throw new Error("PCB geometry result exceeds its byte bound."); }
  const expectedFamily = currentPcbGeometryFamily(request), seen = new Set<string>();
  for (const row of payload.rows) {
    if (row.primitiveType !== expectedFamily || seen.has(row.primitiveId)) { throw new Error("PCB geometry result contains duplicate or unexpected family identities."); }
    seen.add(row.primitiveId);
  }
  assertAttributeGroups(payload);
  const { rows, ...metadata } = payload;
  const counts: Record<string, number> = { observedRowCount: rows.length };
  if ("primitiveIds" in request.arguments) {
    if (!("observedRowCount" in payload) || payload.observedRowCount < rows.length ||
      canonicalJson(rows.map((row) => row.primitiveId)) !== canonicalJson(request.arguments.primitiveIds)) {
      throw new Error("PCB geometry result differs from its complete requested identity sequence or observed count.");
    }
    counts["observedRowCount"] = payload.observedRowCount;
    counts["returnedRowCount"] = rows.length;
  }
  if ("primitiveId" in request.arguments) {
    if (!("componentPrimitiveId" in payload) || payload.componentPrimitiveId !== request.arguments.primitiveId || payload.observedPadCount < rows.length ||
      seen.has(payload.componentPrimitiveId)) { throw new Error("PCB component child-pad result differs from its requested component or complete observed family."); }
    counts["observedRowCount"] = payload.observedPadCount;
    counts["returnedRowCount"] = rows.length;
  }
  return { ...metadata, value: rows, ...counts, units: { linear: "mil", arcAngle: "degrees", rotation: "degrees" },
    effect: "current-pcb-loaded-view-geometry-read", encoding: "native-getter-projection-without-public-wrapper-rounding",
    authority: "explicit-target-loaded-view-geometry-only;not-design-or-persistence-authority", liveValidation: "not-recorded", limitations: [...limitations] };
}
