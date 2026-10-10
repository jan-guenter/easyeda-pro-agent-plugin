import { z } from "zod";

import { polygonSourceSchema } from "./design-operations.ts";
import { EXACT_READ_ENVELOPE_SCHEMA, assertExactTransportValue } from "./exact-readers.ts";
import { editorTabLookupRequestSchema, isEditorTabLookupMethod } from "./editor-tab-lookups.ts";
import { SCHEMATIC_NATIVE_ID_METHODS, buildSchematicNativeIdsExpression, isSchematicNativeIdMethod } from "./schematic-native-ids.ts";
import { SCHEMATIC_COMPONENT_PROPERTY_METHOD, buildSchematicComponentPropertyNamesExpression, schematicComponentPropertyNamesSchema } from "./schematic-component-properties.ts";
import { SYMBOL_PIN_ENUMERATION_METHOD, SYMBOL_PIN_GETTER_FIELDS, buildSymbolPinEnumerationExpression } from "./symbol-pin-enumeration.ts";

/** This fixed allowlist is independent of the declaration catalog. Public entries
 * were reviewed against this implementation, including delegated getters.
 * Explicit native equivalents use separately pinned implementations. Neither
 * class supplies complete native-source, connectivity or persistence proof.
 */
export const PUBLIC_SDK_READ_API_SHA256 = "5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc";
export const PUBLIC_SDK_READ_MAX_BYTES = 2_097_152;
const MAX_ITEMS = 20_000;
const MAX_NODES = 100_000;
const ALL_DOCUMENTS = [1, 2, 3, 4] as const;
const SCHEMATIC_DOCUMENTS = [1, 2] as const;
const PCB_DOCUMENTS = [3, 4] as const;
// oxlint-disable-next-line eslint/no-control-regex -- Native identifiers cannot carry control characters across the bridge.
const id = z.string().min(1).max(256).regex(/^[^\u0000-\u001F\u007F]+$/u);
// oxlint-disable-next-line eslint/no-control-regex -- Net/rule names are data, but control characters are not valid selectors.
const text = z.string().max(1024).regex(/^[^\u0000-\u001F\u007F]*$/u);
const name = text.min(1);
const coordinate = z.number().min(-1_000_000_000).max(1_000_000_000);
const ids = z.array(id).min(1).max(256).refine((value) => new Set(value).size === value.length, "Duplicate IDs are not accepted.");
const primitiveIds = z.union([id, ids]);
const emptyArguments = z.object({}).strict();
const layerInner = Array.from({ length: 30 }, (_, index) => index + 15);
const layerCustom = Array.from({ length: 30 }, (_, index) => index + 71);
const layerCopper = [1, 2, ...layerInner];
const layerLine = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 56, ...layerInner, ...layerCustom];
const layerImage = [1, 2, 3, 4, 5, 6, 9, 10, 13, 14, 56, ...layerInner, ...layerCustom];
const layerFill = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, ...layerInner, ...layerCustom];
const layer = (values: number[]): z.ZodType<number> => z.number().int().refine((value) => values.includes(value), "Layer is outside this reviewed primitive family.");
const layerLineSchema = layer(layerLine).optional();
const layerImageSchema = layer(layerImage).optional();
const optionalLock = z.boolean().optional();
const optionalNet = text.optional();

type OutputKind = "json" | "string" | "number" | "boolean" | "strings" | "ids" | "records" | "record" | "bbox" | "point" | "origin" | "primitive" | "polygon" | "polygons";
interface ReadDefinition {
  implementationKind: "public-method" | "native-task-equivalent";
  path: string;
  documentTypes: readonly number[];
  argumentsSchema: z.ZodType<Record<string, unknown>>;
  parameters: string[];
  output: OutputKind;
  primitiveType: string | undefined;
  membership: { method: string; argument: string } | undefined;
  restParameter: string | undefined;
  optionalResult: boolean;
  getters: string[];
  parameterSupport: "complete" | "narrowed";
  limitations: string[];
}

export interface PublicSdkReadRequest {
  method: string;
  arguments: Record<string, unknown>;
}

export interface PublicSdkReadDescriptor {
  path: string;
  documentTypes: number[];
  inputSchema: Record<string, unknown>;
  parameterSupport: "complete" | "narrowed";
  limitations: string[];
  implementation: { kind: "public-method" | "native-task-equivalent"; source: string; test: string; publicApiSha256: string };
  liveValidation: "not-yet-validated";
  parameters: string[];
  membership: { method: string; argument: string } | null;
  restParameter: string | null;
  result: { kind: OutputKind; optional: boolean; getterFields: string[]; primitiveType: string | null };
}

const definitions = new Map<string, ReadDefinition>();
function add(path: string, documentTypes: readonly number[], output: OutputKind,
  argumentsSchema: z.ZodType<Record<string, unknown>> = emptyArguments,
  parameters: string[] = [], options: Partial<Pick<ReadDefinition, "implementationKind" | "getters" | "primitiveType" | "membership" | "restParameter" | "optionalResult" | "parameterSupport" | "limitations">> = {}): void {
  if (!/^eda\.(?:dmt|lib|pcb|sch|sys)_[A-Za-z0-9]+\.[A-Za-z0-9_]+$/u.test(path) || definitions.has(path)) { throw new Error("Invalid or duplicate fixed public SDK read."); }
  definitions.set(path, { path, documentTypes, argumentsSchema, parameters, output, implementationKind: options.implementationKind ?? "public-method", primitiveType: options.primitiveType, membership: options.membership, restParameter: options.restParameter,
    optionalResult: options.optionalResult ?? false, getters: options.getters ?? [],
    parameterSupport: options.parameterSupport ?? "complete", limitations: options.limitations ?? [] });
}

// Current project metadata only. Arbitrary project/team/folder/cloud lookup is
// Deliberately not admitted by a reader's current-project context binding.
for (const path of ["dmt_Board.getAllBoardsInfo", "dmt_Panel.getAllPanelsInfo", "dmt_Pcb.getAllPcbsInfo", "dmt_Schematic.getAllSchematicsInfo", "dmt_Schematic.getAllSchematicPagesInfo"]) {
  add(`eda.${path}`, ALL_DOCUMENTS, "records");
}
for (const path of ["dmt_Board.getCurrentBoardInfo", "dmt_Project.getCurrentProjectInfo", "dmt_SelectControl.getCurrentDocumentInfo"]) {
  add(`eda.${path}`, ALL_DOCUMENTS, "record", emptyArguments, [], { optionalResult: true });
}
add("eda.dmt_Pcb.getCurrentPcbInfo", [3], "record", emptyArguments, [], { optionalResult: true });
for (const path of ["dmt_Schematic.getCurrentSchematicInfo", "dmt_Schematic.getCurrentSchematicPageInfo"]) {
  add(`eda.${path}`, [1], "record", emptyArguments, [], { optionalResult: true });
}
add("eda.dmt_Schematic.getCurrentSchematicAllSchematicPagesInfo", [1], "records");
add("eda.dmt_Schematic.getSchematicInfo", ALL_DOCUMENTS, "record", z.object({ schematicUuid: id }).strict(), ["schematicUuid"], {
  membership: { method: "eda.dmt_Schematic.getAllSchematicsInfo", argument: "schematicUuid" }, limitations: ["UUID must first be present in the active project's complete schematic list; returned UUID must match."] });
add("eda.dmt_Schematic.getSchematicPageInfo", ALL_DOCUMENTS, "record", z.object({ schematicPageUuid: id }).strict(), ["schematicPageUuid"], {
  membership: { method: "eda.dmt_Schematic.getAllSchematicPagesInfo", argument: "schematicPageUuid" }, limitations: ["UUID must first be present in the active project's complete page list; returned UUID must match."] });
add("eda.dmt_Board.getBoardInfo", ALL_DOCUMENTS, "record", z.object({ boardName: name }).strict(), ["boardName"], { optionalResult: true });
add("eda.dmt_Panel.getPanelInfo", ALL_DOCUMENTS, "record", z.object({ panelUuid: id }).strict(), ["panelUuid"], { optionalResult: true,
  limitations: ["The pinned UI implementation resolves the UUID only within getAllPanelsInfo for the active project."] });
add("eda.dmt_Pcb.getPcbInfo", ALL_DOCUMENTS, "record", z.object({ pcbUuid: id }).strict(), ["pcbUuid"], { optionalResult: true,
  limitations: ["The pinned implementation looks up the UUID only in the active project's getAllPcbsInfo result."] });
add("eda.lib_LibrariesList.getProjectLibraryUuid", ALL_DOCUMENTS, "string", emptyArguments, [], { optionalResult: true });
for (const request of editorTabLookupRequestSchema.options) {
  const method = request.shape.method.value;
  add(method, ALL_DOCUMENTS, method.endsWith("getSplitScreenIdByTabId") ? "string" : "records", request.shape.arguments,
    method.endsWith("getSplitScreenIdByTabId") ? ["tabId"] : ["splitScreenId"], { parameterSupport: "narrowed", limitations: [
      "Requires a verified complete current-project checkpoint and two matching owned editor-tree observations; only an existing owned tab or nonempty leaf is admitted.",
      "Returns identity/type/project/library-owner fields only, never titles or raw tab data. Missing, parent, foreign, duplicate or ambiguous empty containers refuse; no navigation, preference changes or Save.",
    ] });
}

for (const method of ["getEditorCurrentVersion", "getEditorCompliedDate"]) { add(`eda.sys_Environment.${method}`, ALL_DOCUMENTS, "string"); }
for (const method of ["isClient", "isWeb", "isEasyEDAProEdition", "isJLCEDAProEdition", "isProPrivateEdition", "isOnlineMode", "isHalfOfflineMode", "isOfflineMode"]) {
  add(`eda.sys_Environment.${method}`, ALL_DOCUMENTS, "boolean");
}
add("eda.sys_I18n.getCurrentLanguage", ALL_DOCUMENTS, "string");
add("eda.sys_I18n.getAllSupportedLanguages", ALL_DOCUMENTS, "strings");
add("eda.sys_I18n.isLanguageSupported", ALL_DOCUMENTS, "boolean", z.object({ language: z.string().min(1).max(64).regex(/^[A-Za-z0-9_-]+$/u) }).strict(), ["language"]);
const interpolationValues = z.array(z.union([z.string().max(1024), coordinate, z.boolean(), z.null()])).max(16).default([]);
add("eda.sys_I18n.text", ALL_DOCUMENTS, "string", z.object({ tag: text, namespace: z.literal("eda").default("eda"), language: z.string().min(1).max(64).regex(/^[A-Za-z0-9_-]+$/u).optional(), args: interpolationValues }).strict(),
  ["tag", "namespace", "language", "args"], { restParameter: "args", parameterSupport: "narrowed", limitations: ["Official eda translation namespace only; at most 16 scalar interpolation values. Arbitrary extension namespaces and object conversion hooks are not admitted."] });
for (const method of ["isLeftPanelLocked", "isRightPanelLocked", "isBottomPanelLocked"]) { add(`eda.sys_PanelControl.${method}`, ALL_DOCUMENTS, "boolean"); }
add("eda.sys_Window.getCurrentTheme", ALL_DOCUMENTS, "string");
add("eda.sys_ShortcutKey.getShortcutKeys", ALL_DOCUMENTS, "records", z.object({ includeSystem: z.boolean().optional() }).strict(), ["includeSystem"]);
add("eda.sys_Unit.getFrontendDataUnit", ALL_DOCUMENTS, "string", emptyArguments, [], { optionalResult: true });
for (const [method, parameter] of [["milToMm", "mil"], ["milToInch", "mil"], ["mmToMil", "mm"], ["mmToInch", "mm"], ["inchToMil", "inch"], ["inchToMm", "inch"]] as const) {
  add(`eda.sys_Unit.${method}`, ALL_DOCUMENTS, "number", z.object({ [parameter]: coordinate, numberOfDecimals: z.number().int().min(0).max(12).optional() }).strict(), [parameter, "numberOfDecimals"],
    { parameterSupport: "narrowed", limitations: ["Finite input magnitude at most 1e9; decimal precision 0–12 bounds rounding work. This is the SDK's conversion, not a coordinate-system conversion."] });
}
const linePoints = z.array(coordinate).min(4).max(256).refine((value) => value.length % 2 === 0, "A polyline needs complete x/y pairs.");
const splitLinesSchema = z.union([linePoints, z.array(linePoints).min(1).max(32)]);
add("eda.sch_Utils.splitLines", ALL_DOCUMENTS, "json", z.object({ lines: splitLinesSchema }).strict(), ["lines"],
  { optionalResult: true, parameterSupport: "narrowed", limitations: ["At most 32 polylines with 128 points each; results describe the public geometry algorithm, not native electrical connectivity."] });

add("eda.pcb_Document.getCanvasOrigin", PCB_DOCUMENTS, "origin");
for (const method of ["convertCanvasOriginToDataOrigin", "convertDataOriginToCanvasOrigin"]) {
  add(`eda.pcb_Document.${method}`, PCB_DOCUMENTS, "point", z.object({ x: coordinate, y: coordinate }).strict(), ["x", "y"]);
}
const boundedPolygon = polygonSourceSchema.max(1024);
const boundedComplexPolygon = z.union([boundedPolygon, z.array(boundedPolygon).min(1).max(8)]);
const splitPolygonGroups = z.array(boundedComplexPolygon).min(1).max(8);
const SPLIT_POLYGON_METHOD = "eda.pcb_MathPolygon.splitPolygon";
for (const method of ["calculateWidth", "calculateHeight", "calculateBBoxHeight", "createComplexPolygon"]) {
  add(`eda.pcb_MathPolygon.${method}`, ALL_DOCUMENTS, method === "createComplexPolygon" ? "polygon" : "number",
    z.object({ complexPolygon: boundedComplexPolygon }).strict(), ["complexPolygon"], { optionalResult: method === "createComplexPolygon", parameterSupport: "narrowed",
      limitations: ["JSON polygon arrays only, at most eight polygons of 1024 tokens. No native handles. Constructor returns serialized getSource data, not a reusable native object."] });
}
add("eda.pcb_MathPolygon.createPolygon", ALL_DOCUMENTS, "polygon", z.object({ polygon: boundedPolygon }).strict(), ["polygon"], { optionalResult: true, parameterSupport: "narrowed",
  limitations: ["JSON polygon array only, at most 1024 tokens. Constructor returns serialized getSource data, not a reusable native object."] });
add(SPLIT_POLYGON_METHOD, ALL_DOCUMENTS, "polygons", z.object({ complexPolygons: splitPolygonGroups }).strict(), ["complexPolygons"], { restParameter: "complexPolygons", parameterSupport: "narrowed",
  limitations: ["JSON source arrays only: 1–8 complex-polygon groups, 1–8 polygons per group and at most 1024 tokens per polygon, additionally subject to the shared 16384-node/131072-character input limits.",
    "Constructs only temporary SDK complex polygons, calls the fixed public splitPolygon and returns getSource arrays with exact input order, duplicates and source parity. No caller objects or native handles; public geometry data only, not a CAD or connectivity proof."] });
add("eda.pcb_Document.getCalculatingRatlineStatus", [3], "string");
add("eda.pcb_Document.getCurrentFilterConfiguration", PCB_DOCUMENTS, "record", emptyArguments, [], { optionalResult: true });
for (const method of ["getAllNetClasses", "getAllEqualLengthNetGroups", "getAllPadPairGroups", "getNetRules", "getRegionRules"]) { add(`eda.pcb_Drc.${method}`, [3], "records"); }
add("eda.pcb_Drc.getAllDifferentialPairs", [3], "json", emptyArguments, [], { limitations: ["The public SDK may return a record instead of an array; this observation does not assert complete differential-pair native state."] });
add("eda.pcb_Drc.getNetByNetRules", [3], "record");
for (const method of ["getCurrentRuleConfigurationName", "getDefaultRuleConfigurationName"]) { add(`eda.pcb_Drc.${method}`, [3], "string", emptyArguments, [], { optionalResult: true }); }
add("eda.pcb_Drc.getCurrentRuleConfiguration", [3], "record", emptyArguments, [], { optionalResult: true });
add("eda.pcb_Drc.getRuleConfiguration", [3], "record", z.object({ configurationName: name }).strict(), ["configurationName"], { optionalResult: true });
add("eda.pcb_Drc.getAllRuleConfigurations", [3], "records", z.object({ includeSystem: z.boolean().optional() }).strict(), ["includeSystem"]);
add("eda.pcb_Drc.getPadPairGroupMinWireLength", [3], "records", z.object({ padPairGroupName: name }).strict(), ["padPairGroupName"]);
add("eda.pcb_Layer.getAllLayers", PCB_DOCUMENTS, "records");
add("eda.pcb_Layer.getTheNumberOfCopperLayers", PCB_DOCUMENTS, "number");
add("eda.pcb_Net.getAllNets", [3], "records");
for (const method of ["getAllNetName", "getAllNetsName"]) { add(`eda.pcb_Net.${method}`, [3], "strings"); }
for (const [method, output] of [["getNet", "record"], ["getNetColor", "json"], ["getNetLength", "number"]] as const) {
  add(`eda.pcb_Net.${method}`, [3], output, z.object({ net: text }).strict(), ["net"], { optionalResult: true });
}
for (const [prefix, documents] of [["pcb", PCB_DOCUMENTS], ["sch", SCHEMATIC_DOCUMENTS]] as const) {
  add(`eda.${prefix}_Primitive.getPrimitivesBBox`, documents, "bbox", z.object({ primitiveIds: ids }).strict(), ["primitiveIds"],
    { optionalResult: true, parameterSupport: "narrowed", limitations: ["String IDs only; in-process primitive handles are not accepted."] });
  add(`eda.${prefix}_SelectControl.getAllSelectedPrimitives_PrimitiveId`, documents, "ids");
  add(`eda.${prefix}_SelectControl.getCurrentMousePosition`, documents, "point", emptyArguments, [], { optionalResult: true });
}
add("eda.sch_SelectControl.getSelectedPrimitives_PrimitiveId", SCHEMATIC_DOCUMENTS, "ids");
add("eda.sch_Primitive.getPrimitiveTypeByPrimitiveId", SCHEMATIC_DOCUMENTS, "string", z.object({ id }).strict(), ["id"], { optionalResult: true });
add("eda.pcb_ManufactureData.getBomTemplates", [3], "strings");
add("eda.sch_ManufactureData.getBomTemplates", [1], "strings");
add("eda.sch_ManufactureData.getAssemblyVariantsConfigs", [1], "records");
for (const method of SCHEMATIC_NATIVE_ID_METHODS) {
  add(method, [1], "ids", emptyArguments, method.includes("PrimitiveWire") ? ["net"] : [], {
    implementationKind: "native-task-equivalent", parameterSupport: "narrowed", limitations: [
      "Fixed synchronous native equivalent, not the public wrapper: only the exact active ordinary SCH_PAGE; symbol/block-instance pages and every net filter are refused.",
      "Complete bounded connected-tree/ID-index agreement and direct-root Text/NetGroup source/model membership are required. Generated or inherited descendant Text is not a root Text entry. Wire/bus IDs identify groups, not their LINE children.",
      "Structural GROUP records owned by combinationManager are unsupported because they have no ID-index model; their presence refuses the entire read. No compiler, AST/net-name lookup, settings change, serialization, navigation or Save.",
      "Sorted ID-only observation; not primitive contents, electrical connectivity or persistence proof. Public Text callbacks and compiler-backed Wire/Bus wrappers are not called.",
    ],
  });
}
add(SCHEMATIC_COMPONENT_PROPERTY_METHOD, [1], "strings", emptyArguments, [], {
  implementationKind: "native-task-equivalent", parameterSupport: "narrowed", limitations: [
    "Fixed synchronous native equivalent, not the broken installed public wrapper: only the exact active ordinary SCH_PAGE; hierarchical/block-instance pages and unknown Symbol kinds refuse.",
    "Complete bounded connected-tree/ID-index/source membership and direct-root Symbol family agreement are required. Each Symbol's direct Attr children, attribute map and getAttr result must agree exactly, including generated and inherited attributes absent from page-source rows.",
    "Includes part, sheet, netflag, netport, offPageConnector, nonElectrical_symbol, short_symbol and diffPairsFlag. Pin attributes are not component properties. Structural GROUP records and nonreciprocal cross-linked model ownership are unsupported and refuse the entire read.",
    "Sorted unique exact keys preserve case, whitespace and empty strings. At most 4096 attributes per Symbol, 1024 UTF-16 units per key, 20000 keys and 131072 total key units; shared transport placeholder guards still apply.",
    "No attribute values, compiler, multiPart, source serializer, settings, RPC, navigation or Save. Stable property-name sets are not complete source/connectivity/persistence proof or proof that other design fields remained unchanged.",
  ],
});
add(SYMBOL_PIN_ENUMERATION_METHOD, [2], "primitive", emptyArguments, [], {
  implementationKind: "native-task-equivalent", parameterSupport: "narrowed", primitiveType: "Pin", getters: [...SYMBOL_PIN_GETTER_FIELDS], limitations: [
    "Native membership plus explicit public get(id) parity, never the broken getAll or public ID inventory. Only one exact active ordinary project-symbol PART is supported; schematic instances, multipart/inherited shapes, drawing/flag symbols, device associations and source GROUP records refuse.",
    "Complete reciprocal tree/ID-index/source and PART Pin-family agreement are required. Generated UnConnectDot children are checked but not counted as Pins. Exactly three source-backed Pin Name/Pin Number/Pin Type attributes are required; custom properties and no-connect/junction children refuse.",
    "Sorted unique IDs, at most 256 Pins. All twelve fixed getter fields must equal independent native values, with original state and ownership rechecked around every awaited explicit-ID get. Names/colors are at most 4096 UTF-16 units, geometry finite and length nonnegative; unknown shape/type enums refuse.",
    "OtherProperty must be undefined, with exact per-row absence evidence. Coordinates and rotation follow the installed explicit getter, not source-serialized rotation. JSON transport normalizes signed zero; native reproof and getter parity still distinguish it before serialization.",
    "No compiler, serializer, sorting parts getter, settings, navigation or Save. This is bounded Pin getter data, not complete native-source, electrical connectivity, persistence or proof that other design fields stayed unchanged between observations.",
  ],
});

// Fixed getter DTOs avoid serializing live objects, invoking toJSON, exposing
// Methods, or accepting caller-selected property names. Polygon values use only
// The documented read-only getSource() projection. Native-only fields remain
// Outside these public snapshots and are never silently claimed to be covered.
const pcbGetters: Record<string, string> = {
  Via: "Net X Y HoleDiameter Diameter ViaType DesignRuleBlindViaName SolderMaskExpansion PrimitiveLock",
  Line: "Net Layer StartX StartY EndX EndY LineWidth PrimitiveLock",
  Arc: "Net Layer StartX StartY EndX EndY ArcAngle LineWidth InteractiveMode PrimitiveLock",
  Attribute: "ParentPrimitiveId Layer X Y Key Value KeyVisible ValueVisible FontFamily FontSize LineWidth AlignMode Rotation Reverse Expansion Mirror PrimitiveLock",
  Component: "Component Footprint Layer X Y Rotation PrimitiveLock AddIntoBom Model3D Designator Pads Name UniqueId Manufacturer ManufacturerId Supplier SupplierId OtherProperty",
  Dimension: "DimensionType CoordinateSet Layer Unit LineWidth Precision TextFollow PrimitiveLock",
  Fill: "Net Layer ComplexPolygon FillMode LineWidth PrimitiveLock",
  Image: "X Y ComplexPolygon Layer Width Height Rotation HorizonMirror PrimitiveLock",
  Object: "Layer TopLeftX TopLeftY BinaryData Width Height Rotation Mirror FileName PrimitiveLock",
  Pad: "Layer PadNumber X Y Rotation Pad Net Hole HoleOffsetX HoleOffsetY HoleRotation Metallization PadType SpecialPad SolderMaskAndPasteMaskExpansion HeatWelding PrimitiveLock",
  Polyline: "Net Layer Polygon LineWidth PrimitiveLock",
  Pour: "Net Layer ComplexPolygon PourFillMethod PreserveSilos PourName PourPriority LineWidth PrimitiveLock",
  Poured: "PourPrimitiveId PourFills",
  Region: "Layer ComplexPolygon RuleType RegionName LineWidth PrimitiveLock",
  String: "Layer X Y Text FontFamily FontSize LineWidth AlignMode Rotation Reverse Expansion Mirror PrimitiveLock",
};
const schGetters: Record<string, string> = {
  Arc: "StartX StartY ReferenceX ReferenceY EndX EndY Color FillColor LineWidth LineType",
  Attribute: "X Y Rotation Color FontName FontSize Bold Italic UnderLine AlignMode FillColor Key Value KeyVisible ValueVisible ParentPrimitiveId",
  Circle: "CenterX CenterY Radius Color FillColor LineWidth LineType FillStyle",
  Component: "ComponentType Component X Y SubPartName Rotation Mirror AddIntoBom AddIntoPcb Net Symbol Footprint Designator Name UniqueId Manufacturer ManufacturerId Supplier SupplierId OtherProperty",
  Object: "Content StartX StartY Width Height Rotation Mirror FileName",
  Pin: "X Y PinNumber PinName Rotation PinLength PinColor PinShape pinType OtherProperty",
  Polygon: "Line Color FillColor LineWidth LineType",
  Rectangle: "TopLeftX TopLeftY Width Height CornerRadius Rotation Color FillColor LineWidth LineType FillStyle",
};
const regionRuleTypes = z.array(z.union([z.literal(2), z.literal(3), z.literal(5), z.literal(6), z.literal(7), z.literal(8), z.literal(9)])).min(1).max(7).optional();
const pcbFilters: Record<string, { schema: z.ZodType<Record<string, unknown>>; parameters: string[]; limitation?: string }> = {
  Via: { schema: z.object({ net: optionalNet, primitiveLock: optionalLock }).strict(), parameters: ["net", "primitiveLock"] },
  Line: { schema: z.object({ net: optionalNet, layer: layerLineSchema, primitiveLock: optionalLock }).strict(), parameters: ["net", "layer", "primitiveLock"] },
  Arc: { schema: z.object({ net: optionalNet, layer: layerLineSchema, primitiveLock: optionalLock }).strict(), parameters: ["net", "layer", "primitiveLock"] },
  Polyline: { schema: z.object({ net: optionalNet, layer: layerLineSchema, primitiveLock: optionalLock }).strict(), parameters: ["net", "layer", "primitiveLock"] },
  Attribute: { schema: z.object({ parentPrimitiveId: id.optional(), layer: layerImageSchema, primitiveLock: optionalLock }).strict(), parameters: ["parentPrimitiveId", "layer", "primitiveLock"] },
  Component: { schema: z.object({ layer: layer([1, 2]).optional(), primitiveLock: optionalLock }).strict(), parameters: ["layer", "primitiveLock"] },
  Dimension: { schema: z.object({ primitiveLock: optionalLock }).strict(), parameters: ["layer", "primitiveLock"], limitation: "Layer filtering is omitted: the pinned wrapper sends the layer as net, so its advertised filter is incorrect." },
  Object: { schema: z.object({ primitiveLock: optionalLock }).strict(), parameters: ["layer", "primitiveLock"], limitation: "Layer filtering is omitted: the pinned wrapper sends the layer as net, so its advertised filter is incorrect." },
  Fill: { schema: z.object({ layer: layer(layerFill).optional(), net: optionalNet, primitiveLock: optionalLock }).strict(), parameters: ["layer", "net", "primitiveLock"] },
  Image: { schema: z.object({ layer: layerImageSchema, primitiveLock: optionalLock }).strict(), parameters: ["layer", "primitiveLock"] },
  String: { schema: z.object({ layer: layerImageSchema, primitiveLock: optionalLock }).strict(), parameters: ["layer", "primitiveLock"] },
  Pad: { schema: z.object({ layer: layer([1, 2, 12]).optional(), net: optionalNet, primitiveLock: optionalLock, padType: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional() }).strict(), parameters: ["layer", "net", "primitiveLock", "padType"] },
  Pour: { schema: z.object({ net: optionalNet, layer: layer(layerCopper).optional(), primitiveLock: optionalLock }).strict(), parameters: ["net", "layer", "primitiveLock"] },
  Poured: { schema: emptyArguments, parameters: [] },
  Region: { schema: z.object({ layer: layer([...layerCopper, 12]).optional(), ruleType: regionRuleTypes, primitiveLock: optionalLock }).strict(), parameters: ["layer", "ruleType", "primitiveLock"] },
};
for (const [family, fields] of Object.entries(pcbGetters)) {
  const getterNames = `PrimitiveType PrimitiveId ${fields}`.split(" ");
  const filter = pcbFilters[family];
  if (filter === undefined) { throw new Error("Missing fixed PCB primitive filter."); }
  const options = { getters: getterNames, primitiveType: family, limitations: ["Public SDK getter projection; native hidden fields, mapper losses, and saved persistence are not independently verified.", ...(filter.limitation === undefined ? [] : [filter.limitation]),
    ...(["Fill", "Region", "Pour"].includes(family) ? ["Pinned getter truthiness checks can throw for valid zero widths, zero pour priority or empty pour name. Such results refuse; no replacement values are fabricated."] : [])],
    parameterSupport: filter.limitation === undefined ? "complete" as const : "narrowed" as const };
  add(`eda.pcb_Primitive${family}.get`, PCB_DOCUMENTS, "primitive", z.object({ primitiveIds }).strict(), ["primitiveIds"], { ...options, optionalResult: true });
  add(`eda.pcb_Primitive${family}.getAll`, PCB_DOCUMENTS, "primitive", filter.schema, filter.parameters, options);
  add(`eda.pcb_Primitive${family}.getAllPrimitiveId`, PCB_DOCUMENTS, "ids", filter.schema, filter.parameters, { limitations: options.limitations, parameterSupport: options.parameterSupport });
}
for (const [family, fields] of Object.entries(schGetters)) {
  const getterNames = `PrimitiveType PrimitiveId ${fields}`.split(" ");
  let filter: { schema: z.ZodType<Record<string, unknown>>; parameters: string[] } = { schema: emptyArguments, parameters: [] };
  if (family === "Attribute") { filter = { schema: z.object({ parentPrimitiveId: id.optional() }).strict(), parameters: ["parentPrimitiveId"] }; }
  if (family === "Component") { filter = { schema: z.object({ componentType: z.enum(["part", "sheet", "netflag", "netport", "nonElectrical_symbol", "short_symbol", "netlabel", "offPageConnector", "diffPairsFlag", "block_symbol"]).optional(), allSchematicPages: z.literal(false).optional() }).strict(), parameters: ["componentType", "allSchematicPages"] }; }
  const options = { getters: getterNames, primitiveType: family, limitations: ["Public SDK getter projection; native hidden fields, mapper losses, and saved persistence are not independently verified.",
    ...(family === "Component" ? ["Only the bound current page is admitted; allSchematicPages:true can exceed the document scope."] : []),
    ...(family === "Object" ? ["String content only; File-valued embedded content refuses rather than silently serializing an empty object."] : [])],
  parameterSupport: family === "Component" || family === "Object" ? "narrowed" as const : "complete" as const };
  add(`eda.sch_Primitive${family}.get`, SCHEMATIC_DOCUMENTS, "primitive", z.object({ primitiveIds }).strict(), ["primitiveIds"], { ...options, optionalResult: true,
    limitations: [...options.limitations, ...(family === "Pin" ? [
      "The installed explicit Pin getter omits custom attributes from OtherProperty and returns native rotation unchanged, unlike the stored PIN rotation convention (native plus 180 degrees, normalized). This result is not a lossless attribute/source projection.",
      "Explicit requested-ID parity does not prove complete native Pin membership. The maintained ordinary-symbol getAll native equivalent independently proves membership and refuses custom attributes before checking getter parity.",
    ] : [])] });
  // Pin getAll uses the separate native membership/parity registration above;
  // Its public wrapper swallows RPC and projection failures as an empty array.
  if (family !== "Pin") { add(`eda.sch_Primitive${family}.getAll`, SCHEMATIC_DOCUMENTS, "primitive", filter.schema, filter.parameters, options); }
  add(`eda.sch_Primitive${family}.getAllPrimitiveId`, SCHEMATIC_DOCUMENTS, "ids", filter.schema, filter.parameters, {
    limitations: [...options.limitations, ...(family === "Pin" ? [
      "The installed public Pin ID wrapper substitutes an empty object for missing shapes.pin and an empty array for an absent inventory. A successful empty response does not independently prove complete native membership.",
      "Its native inventory reads the parts getter, which may sort the in-memory parts index and clear shouldSortParts. This is not proof of pure native-state invariance; no compiler or Save belongs to this reviewed callback chain.",
      "Use the maintained ordinary-symbol getAll native equivalent for independent complete membership/parity within its narrow contract; that route avoids the sorting parts getter and public ID inventory.",
    ] : [])], parameterSupport: options.parameterSupport });
}
add("eda.pcb_PrimitiveComponent.getAllPropertyNames", PCB_DOCUMENTS, "strings");
add("eda.pcb_PrimitiveComponent.getAllPinsByPrimitiveId", [3], "primitive", z.object({ primitiveId: id }).strict(), ["primitiveId"],
  { getters: `PrimitiveType PrimitiveId ${pcbGetters["Pad"]} ParentComponentPrimitiveId`.split(" "), primitiveType: "ComponentPad", optionalResult: true,
    limitations: ["Public component-pad projection only. The pinned wrapper has a known 0.1 drill-scale defect; pad/hole geometry and offsets are raw SDK observations, not accurate dimensional authority. The exact component-pad reader intentionally excludes this geometry; use native source and maintained physical-pad correlations instead."] });
add("eda.sch_PrimitiveComponent.getAllPinsByPrimitiveId", [1], "primitive", z.object({ primitiveId: id }).strict(), ["primitiveId"],
  { getters: `PrimitiveType PrimitiveId ${schGetters["Pin"]} NoConnected`.split(" "), primitiveType: "ComponentPin", optionalResult: true,
    limitations: ["Public component-pin projection only; use schematic-native for exact electrical and hidden-property proof."] });

/** Refuse accessors/prototype keys before Zod can traverse caller data. */
function assertPlainInput(value: unknown, depth: number, budget: { nodes: number; characters: number }): void {
  budget.nodes += 1;
  if (depth > 12 || budget.nodes > 16_384) { throw new Error("Public SDK read arguments exceed the depth or node bound."); }
  if (typeof value === "string") { budget.characters += value.length; }
  if (budget.characters > 131_072) { throw new Error("Public SDK read arguments exceed the character bound."); }
  if (value === null || typeof value === "string" || typeof value === "boolean" || typeof value === "number" && Number.isFinite(value)) { return; }
  if (typeof value !== "object") { throw new TypeError("Public SDK reads accept JSON data only."); }
  const prototype: unknown = Object.getPrototypeOf(value);
  if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null) { throw new Error("Public SDK read arguments require plain data."); }
  const fields = Object.getOwnPropertyDescriptors(value);
  if (Reflect.ownKeys(value).some((key) => typeof key !== "string") || Object.keys(fields).length > 4096) { throw new Error("Invalid public SDK read argument collection."); }
  for (const [key, descriptor] of Object.entries(fields)) {
    budget.characters += key.length;
    if (key.length > 256 || budget.characters > 131_072) { throw new Error("Public SDK read argument keys exceed the bound."); }
    if (["__proto__", "prototype", "constructor"].includes(key) || !Object.hasOwn(descriptor, "value")) { throw new Error("Public SDK read arguments cannot contain accessors or prototype keys."); }
    if (!(Array.isArray(value) && key === "length")) {
      if (descriptor.enumerable !== true || Array.isArray(value) && !/^(?:0|[1-9]\d*)$/u.test(key)) { throw new Error("Public SDK read arguments require enumerable JSON fields."); }
      assertPlainInput(descriptor.value, depth + 1, budget);
    }
  }
  if (Array.isArray(value) && Object.keys(fields).length !== value.length + 1) { throw new Error("Sparse public SDK arrays are not accepted."); }
}

const requestShape = z.object({ method: z.enum([...definitions.keys()]), arguments: z.record(z.string(), z.unknown()).default({}) }).strict();
export const publicSdkReadRequestSchema = z.unknown().transform((input, context) => {
  try {
    assertPlainInput(input, 0, { nodes: 0, characters: 0 });
    const parsed = requestShape.safeParse(input);
    if (!parsed.success) {
      for (const issue of parsed.error.issues.slice(0, 32)) { context.addIssue({ code: "custom", path: issue.path.slice(0, 12), message: `Invalid public SDK request field (${issue.code}); use a fixed sdk-reads method.` }); }
      return z.NEVER;
    }
    const request = parsed.data;
    const definition = definitions.get(request.method);
    if (definition === undefined) { throw new Error("Unsupported fixed SDK method."); }
    const argumentsResult = definition.argumentsSchema.safeParse(request.arguments);
    if (!argumentsResult.success) {
      for (const issue of argumentsResult.error.issues.slice(0, 32)) { context.addIssue({ code: "custom", path: ["arguments", ...issue.path.slice(0, 11)], message: `Invalid public SDK argument (${issue.code}); consult this method's sdk-reads schema.` }); }
      return z.NEVER;
    }
    return { method: request.method, arguments: argumentsResult.data };
  } catch {
    context.addIssue({ code: "custom", message: "Invalid public SDK read method or arguments; consult its strict offline sdk-reads schema." });
    return z.NEVER;
  }
});

export function validatePublicSdkReadRequest(input: unknown, documentType: number): PublicSdkReadRequest {
  const request = publicSdkReadRequestSchema.parse(input);
  const definition = definitions.get(request.method);
  if (definition === undefined || !definition.documentTypes.includes(documentType)) { throw new Error("Public SDK read is not admitted for this document type."); }
  return request;
}

/** Shared routing metadata comes from the fixed registry, never method-name guesses. */
export function publicSdkReadImplementationKind(method: string): ReadDefinition["implementationKind"] {
  const definition = definitions.get(method);
  if (definition === undefined) { throw new Error("Unsupported fixed SDK method."); }
  return definition.implementationKind;
}

export function publicSdkReadDescriptors(): PublicSdkReadDescriptor[] {
  return [...definitions.values()].map((entry) => ({ path: entry.path, documentTypes: [...entry.documentTypes],
    inputSchema: z.toJSONSchema(z.object({ method: z.literal(entry.path), arguments: entry.argumentsSchema }).strict(), { io: "input", unrepresentable: "throw" }),
    parameterSupport: entry.parameterSupport, limitations: [...entry.limitations],
    implementation: { kind: entry.implementationKind,
      source: `server/src/${readImplementationName(entry.path)}.ts`,
      test: `server/tests/${entry.path === SPLIT_POLYGON_METHOD ? "public-sdk-polygon-split" : readImplementationName(entry.path)}.test.ts`, publicApiSha256: PUBLIC_SDK_READ_API_SHA256 },
    liveValidation: "not-yet-validated", parameters: [...entry.parameters], membership: entry.membership === undefined ? null : { ...entry.membership }, restParameter: entry.restParameter ?? null,
    result: { kind: entry.output, optional: entry.optionalResult, getterFields: [...entry.getters], primitiveType: entry.primitiveType ?? null } }));
}

function readImplementationName(path: string): string {
  if (isSchematicNativeIdMethod(path)) { return "schematic-native-ids"; }
  if (path === SCHEMATIC_COMPONENT_PROPERTY_METHOD) { return "schematic-component-properties"; }
  if (path === SYMBOL_PIN_ENUMERATION_METHOD) { return "symbol-pin-enumeration"; }
  if (isEditorTabLookupMethod(path)) { return "editor-tab-lookups"; }
  return "public-sdk-read";
}

function normalizedSplitPolygonGroups(value: unknown): z.infer<typeof boundedPolygon>[][] {
  return splitPolygonGroups.parse(value).map((group) => {
    if (Array.isArray(group[0])) { return z.array(boundedPolygon).min(1).max(8).parse(group); }
    return [boundedPolygon.parse(group)];
  });
}

/** Only facade-created SDK objects reach this synchronous pure method chain.
 * The independent expected literal is not shared with mutable constructor input.
 */
function splitPolygonExpression(request: PublicSdkReadRequest): string {
  const groups = normalizedSplitPolygonGroups(request.arguments["complexPolygons"]);
  return `(() => {
    const inputs = ${JSON.stringify(groups)};
    const expectedJson = ${JSON.stringify(JSON.stringify(groups.flat()))};
    const api = eda.pcb_MathPolygon;
    if (typeof api.createComplexPolygon !== "function") fail("sdk-polygon-constructor");
    const objects = inputs.map(input => {
      const before = JSON.stringify(input.length === 1 ? input[0] : input);
      const object = api.createComplexPolygon(input);
      if (!object || typeof object.toPolygon !== "function") fail("sdk-polygon-constructor");
      if (JSON.stringify(plain(polygon(object), "/constructor")) !== before) fail("sdk-polygon-constructor-parity");
      return object;
    });
    const result = api.splitPolygon(...objects);
    const expectedCount = ${groups.flat().length};
    if (!Array.isArray(result) || result.length !== expectedCount || Reflect.ownKeys(result).length !== expectedCount + 1) fail("sdk-polygon-split-shape");
    const sources = [];
    for (let index = 0; index < result.length; index += 1) {
      const entry = Object.getOwnPropertyDescriptor(result, String(index));
      if (!entry || !entry.enumerable || !("value" in entry)) fail("sdk-polygon-split-shape");
      sources.push(plain(polygon(entry.value), "/value/" + index));
    }
    if (JSON.stringify(sources) !== expectedJson) fail("sdk-polygon-split-parity");
    return sources;
  })()`;
}

/** Source is constructed solely from the fixed descriptor and parsed JSON.
 * Receiver binding is preserved by the direct eda.namespace.method(...) call.
 * Engine owns authenticated admission, context checks, quarantine and two reads.
 */
export function buildPublicSdkReadCode(input: unknown): string {
  const request = publicSdkReadRequestSchema.parse(input);
  if (isEditorTabLookupMethod(request.method)) { throw new Error("Owned editor lookups require the checkpoint-bound specialized reader."); }
  const definition = definitions.get(request.method);
  if (definition === undefined) { throw new Error("Unsupported fixed SDK method."); }
  const args = definition.parameters.map((key) => {
    if (key === definition.restParameter) { return `...${JSON.stringify(request.arguments[key])}`; }
    return request.arguments[key] === undefined ? "undefined" : JSON.stringify(request.arguments[key]);
  }).join(",");
  let expression = `await ${definition.path}(${args})`;
  if (isSchematicNativeIdMethod(definition.path)) { expression = buildSchematicNativeIdsExpression(definition.path, "sdk-failure-code"); }
  else if (definition.path === SCHEMATIC_COMPONENT_PROPERTY_METHOD) { expression = buildSchematicComponentPropertyNamesExpression("sdk-failure-code"); }
  else if (definition.path === SYMBOL_PIN_ENUMERATION_METHOD) { expression = buildSymbolPinEnumerationExpression("sdk-failure-code"); }
  else if (definition.path === SPLIT_POLYGON_METHOD) { expression = splitPolygonExpression(request); }
  const membership = definition.membership === undefined ? "" : `
  stage = "membership";
  const members = await ${definition.membership.method}();
  if (!Array.isArray(members) || members.length > ${MAX_ITEMS} || members.some(item => !item || typeof item.uuid !== "string" || !item.uuid)) fail("sdk-membership-shape");
  if (!members.some(item => item.uuid === ${JSON.stringify(request.arguments[definition.membership.argument])})) fail("sdk-foreign-document");
  `;
  return `
let stage = "lookup";
let field = "none";
let failureCode = "native-error";
function fail(code) { failureCode = code; throw new Error(code); }
try {
  const undefinedPaths = [];
  let nodes = 0;
  let characters = 0;
  const seen = new Set();
  function plain(value, path, depth = 0) {
    if (++nodes > ${MAX_NODES} || depth > 24) fail("sdk-result-bound");
    if (value === undefined) { undefinedPaths.push(path); return null; }
    if (value === null || typeof value === "boolean") return value;
    if (typeof value === "number") { if (!Number.isFinite(value)) fail("sdk-nonfinite"); return value; }
    if (typeof value === "string") {
      characters += value.length;
      if (characters > ${PUBLIC_SDK_READ_MAX_BYTES} || ["[MaxDepth]", "[Truncated]", "[Circular]"].includes(value) || /^\\[Function(?: |\\])/.test(value)) fail("sdk-result-bound");
      return value;
    }
    if (typeof value !== "object" || seen.has(value)) fail("sdk-non-json");
    const prototype = Object.getPrototypeOf(value);
    if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null) fail("sdk-live-object");
    const fields = Object.getOwnPropertyDescriptors(value);
    if (Reflect.ownKeys(value).some(key => typeof key !== "string") || Object.keys(fields).length > ${MAX_ITEMS} + (Array.isArray(value) ? 1 : 0)) fail("sdk-result-bound");
    const out = Array.isArray(value) ? [] : Object.create(null);
    seen.add(value);
    for (const [key, descriptor] of Object.entries(fields)) {
      if (Array.isArray(value) && key === "length") continue;
      characters += key.length;
      if (key.length > 4096 || characters > ${PUBLIC_SDK_READ_MAX_BYTES}) fail("sdk-result-bound");
      if (["__proto__", "constructor", "prototype"].includes(key) || !descriptor.enumerable || !("value" in descriptor) || Array.isArray(value) && !/^(?:0|[1-9]\\d*)$/.test(key)) fail("sdk-property");
      out[key] = plain(descriptor.value, path + "/" + key.replace(/~/g, "~0").replace(/\\//g, "~1"), depth + 1);
    }
    if (Array.isArray(value) && (out.length !== value.length || Object.keys(fields).length !== value.length + 1)) fail("sdk-sparse-array");
    seen.delete(value);
    return out;
  }
  function state(object, getterField) {
    stage = "getter";
    field = getterField;
    const method = object && object["getState_" + getterField];
    if (typeof method !== "function") fail("sdk-missing-getter");
    const result = method.call(object);
    stage = "projection";
    return result;
  }
  function polygon(value) {
    if (!value || typeof value.getSource !== "function") fail("sdk-polygon");
    return value.getSource();
  }
  function primitive(object) {
    if (!object || typeof object !== "object") fail("sdk-primitive");
    const out = Object.create(null);
    for (const field of ${JSON.stringify(definition.getters)}) {
      let value = state(object, field);
      if ((field === "ComplexPolygon" || field === "Polygon") && !Array.isArray(value)) value = polygon(value);
      if (field === "PourFills") {
        if (!Array.isArray(value) || value.length > ${MAX_ITEMS}) fail("sdk-pour-fills");
        value = value.map(fill => {
          if (!fill || typeof fill !== "object" || !["path", "lineWidth", "fill", "id"].every(key => Object.hasOwn(fill, key)) || Object.keys(fill).length !== 4) fail("sdk-pour-fill-shape");
          return { path: polygon(fill.path), lineWidth: fill.lineWidth, fill: fill.fill, id: fill.id };
        });
      }
      out[field] = value;
    }
    if (out.ComponentType === "block_symbol") { out.Cbb = state(object, "Cbb"); out.CbbSymbol = state(object, "CbbSymbol"); }
    if (typeof out.PrimitiveId !== "string" || !out.PrimitiveId || out.PrimitiveType !== ${JSON.stringify(definition.primitiveType ?? null)}) fail("sdk-primitive-identity");
    ${definition.primitiveType === "ComponentPad" ? `if (out.ParentComponentPrimitiveId !== ${JSON.stringify(request.arguments["primitiveId"])}) fail("sdk-wrong-parent");` : ""}
    return out;
  }
  ${definition.implementationKind === "native-task-equivalent" ? "" : `if (typeof ${definition.path} !== "function") fail("sdk-missing-method");`}
  ${membership}
  stage = "call";
  const native = ${expression};
  stage = "projection";
  const present = native !== undefined;
  ${definition.membership === undefined ? "" : `if (!native || native.uuid !== ${JSON.stringify(request.arguments[definition.membership.argument])}) fail("sdk-wrong-document");`}
  if (!present && ${JSON.stringify(!definition.optionalResult)}) fail("sdk-missing-result");
  let projected = native;
  if (${JSON.stringify(definition.output)} === "primitive" && present) {
    const values = Array.isArray(native) ? native : [native];
    if (values.length > ${MAX_ITEMS}) fail("sdk-result-bound");
    projected = values.map(primitive);
    const returnedIds = projected.map(item => item.PrimitiveId);
    if (new Set(returnedIds).size !== returnedIds.length) fail("sdk-duplicate-identity");
    const requestedIds = ${JSON.stringify(request.arguments["primitiveIds"] ?? null)};
    const expectedIds = Array.isArray(requestedIds) ? requestedIds : [requestedIds];
    if (requestedIds !== null && (returnedIds.length !== expectedIds.length || returnedIds.some(id => !expectedIds.includes(id)))) fail("sdk-wrong-identity");
  }
  if (${JSON.stringify(definition.output)} === "polygon" && present) projected = polygon(native);
  stage = "serialize";
  field = "none";
  const payload = { ok: true, kind: "public-sdk-read", method: ${JSON.stringify(definition.path)}, present, value: plain(projected, "/value"), undefinedPaths };
  const json = JSON.stringify(payload);
  const utf8Bytes = new TextEncoder().encode(json).byteLength;
  const envelope = { schema: ${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)}, utf8Bytes, json };
  if (utf8Bytes > ${PUBLIC_SDK_READ_MAX_BYTES} || new TextEncoder().encode(JSON.stringify(envelope)).byteLength > ${PUBLIC_SDK_READ_MAX_BYTES}) fail("sdk-result-bound");
  return envelope;
} catch { throw new Error("Public SDK read could not produce a complete bounded observation; method=${definition.path}|stage=" + stage + "|code=" + failureCode + "|getter=" + field); }
`;
}

const payloadSchema = z.object({ ok: z.literal(true), kind: z.literal("public-sdk-read"), method: z.string(), present: z.boolean(), value: z.unknown(), undefinedPaths: z.array(z.string().max(4096)).max(MAX_NODES) }).strict();
const stringsResult = z.array(z.string()).max(MAX_ITEMS);
const recordResult = z.record(z.string(), z.unknown());
const rgbaResult = z.object({ r: z.number(), g: z.number(), b: z.number(), alpha: z.number() }).strict().nullable();
const splitLineValue = z.union([z.number(), z.array(z.number()).max(256)]);
const splitLinesResult = z.array(z.array(splitLineValue).max(512)).max(4096);
const symbolPinRows = z.array(z.object({
  PrimitiveType: z.literal("Pin"), PrimitiveId: id, X: z.number(), Y: z.number(), Rotation: z.number(), PinLength: z.number().nonnegative(),
  PinNumber: z.string().max(4096), PinName: z.string().max(4096), PinColor: z.string().max(4096).nullable(),
  PinShape: z.enum(["None", "Inverted", "Clock", "Inverted Clock"]),
  pinType: z.enum(["IN", "OUT", "BI", "Passive", "Open Collector", "Open Emitter", "Power", "Ground", "HIZ", "Terminator", "Undefined"]),
  OtherProperty: z.null(),
}).strict()).max(256).refine((rows) => rows.every((row, index) => index === 0 || (rows[index - 1]?.PrimitiveId ?? "") < row.PrimitiveId),
  "Symbol Pin rows must have sorted unique IDs.");
const resultSchemas: Record<Exclude<OutputKind, "primitive" | "json" | "polygon">, z.ZodType> = {
  string: z.string(), number: z.number(), boolean: z.boolean(), strings: stringsResult,
  ids: z.array(id).max(MAX_ITEMS).refine((value) => new Set(value).size === value.length),
  records: z.array(recordResult).max(MAX_ITEMS), record: recordResult,
  bbox: z.object({ minX: z.number(), minY: z.number(), maxX: z.number(), maxY: z.number() }).strict()
    .refine((value) => value.minX <= value.maxX && value.minY <= value.maxY),
  point: z.object({ x: z.number(), y: z.number() }).strict(),
  origin: z.object({ offsetX: z.number(), offsetY: z.number() }).strict(),
  polygons: z.array(boundedPolygon).min(1).max(64),
};

const numericStateFields = new Set("X Y StartX StartY EndX EndY ReferenceX ReferenceY CenterX CenterY Radius HoleDiameter Diameter Layer LineWidth FontSize Rotation Expansion PourPriority TopLeftX TopLeftY Width Height HoleOffsetX HoleOffsetY HoleRotation Precision PinLength CornerRadius ArcAngle".split(" "));
const booleanStateFields = new Set("PrimitiveLock Mirror HorizonMirror Metallization Reverse PreserveSilos AddIntoBom AddIntoPcb KeyVisible ValueVisible Bold Italic UnderLine NoConnected".split(" "));
const stringStateFields = new Set("Net Text Content Key Value Name Designator UniqueId ParentPrimitiveId ParentComponentPrimitiveId PinNumber PinName PadNumber Color FillColor PinColor TextColor FontName FontFamily RegionName PourName PourPrimitiveId FileName BinaryData Manufacturer ManufacturerId Supplier SupplierId SubPartName DesignRuleBlindViaName".split(" "));
const optionalComponentFields = new Set("Component Footprint Symbol Model3D Designator Pads Name UniqueId Manufacturer ManufacturerId Supplier SupplierId OtherProperty SubPartName".split(" "));
const nullableStyleFields = new Set("Color FillColor PinColor TextColor FontName".split(" "));

/** Validate basic declared scalar contracts as well as exact getter membership.
 * Native polygon/pad/rule unions remain bounded public data, not source proof.
 */
function validatePrimitiveFields(row: Record<string, unknown>, rowIndex: number, definition: ReadDefinition, undefinedPointers: ReadonlySet<string>): void {
  const schematic = definition.path.startsWith("eda.sch_");
  const type = definition.primitiveType;
  for (const [field, value] of Object.entries(row)) {
    const missing = undefinedPointers.has(`/value/${rowIndex}/${field}`);
    const optional = type === "Component" && (optionalComponentFields.has(field) || schematic && ["AddIntoBom", "AddIntoPcb", "Net"].includes(field)) ||
      type === "Object" && !schematic && ["Layer", "TopLeftX", "TopLeftY"].includes(field) ||
      type === "Region" && field === "RegionName" || type === "Fill" && ["Net", "FillMode"].includes(field) ||
      ["Pad", "ComponentPad"].includes(type ?? "") && ["Pad", "Net", "SpecialPad"].includes(field) ||
      schematic && ["Pin", "ComponentPin"].includes(type ?? "") && field === "OtherProperty";
    if (missing && !optional) { throw new Error(`Required public SDK getter returned undefined: ${field}.`); }
    if (!missing) {
      const nullable = nullableStyleFields.has(field) || field === "DesignRuleBlindViaName" || type === "Attribute" && ["X", "Y"].includes(field) ||
        schematic && ["LineWidth", "LineType", "FillStyle", "FontSize"].includes(field) ||
        schematic && type === "Attribute" && ["Rotation", "Bold", "Italic", "UnderLine", "AlignMode", "KeyVisible", "ValueVisible"].includes(field);
      if (!(value === null && nullable)) {
        if (numericStateFields.has(field) && (typeof value !== "number" || !Number.isFinite(value))) { throw new Error(`Public SDK numeric getter has an invalid value: ${field}.`); }
        if (booleanStateFields.has(field) && typeof value !== "boolean") { throw new Error(`Public SDK boolean getter has an invalid value: ${field}.`); }
        if (stringStateFields.has(field) && typeof value !== "string") { throw new Error(`Public SDK string getter has an invalid value: ${field}.`); }
      }
    }
  }
}

export function validatePublicSdkReadPayload(input: unknown, requestInput: unknown): Record<string, unknown> {
  const request = publicSdkReadRequestSchema.parse(requestInput);
  if (isEditorTabLookupMethod(request.method)) { throw new Error("Owned editor lookup results require the checkpoint-bound specialized verifier."); }
  const definition = definitions.get(request.method);
  if (definition === undefined) { throw new Error("Unsupported fixed SDK method."); }
  assertExactTransportValue(input);
  if (Buffer.byteLength(JSON.stringify(input), "utf8") > PUBLIC_SDK_READ_MAX_BYTES) { throw new Error("Public SDK observation exceeds the byte bound."); }
  const payload = payloadSchema.parse(input);
  if (payload.method !== request.method || !Object.hasOwn(payload, "value") || !payload.present && (!definition.optionalResult || payload.value !== null || payload.undefinedPaths.length !== 1 || payload.undefinedPaths[0] !== "/value")) {
    throw new Error("Public SDK read result does not match its request.");
  }
  if (payload.present) {
    if (payload.undefinedPaths.includes("/value")) { throw new Error("Public SDK read presence is contradictory."); }
    if (definition.output !== "primitive" && definition.output !== "json" && definition.output !== "polygon") { resultSchemas[definition.output].parse(payload.value); }
    if (definition.output === "polygon") { boundedComplexPolygon.parse(payload.value); }
    if (request.method === SCHEMATIC_COMPONENT_PROPERTY_METHOD) {
      if (payload.undefinedPaths.length > 0) { throw new Error("Component property-name observations cannot contain undefined values."); }
      schematicComponentPropertyNamesSchema.parse(payload.value);
    }
    if (request.method === SYMBOL_PIN_ENUMERATION_METHOD) {
      const rows = symbolPinRows.parse(payload.value);
      if (payload.undefinedPaths.length !== rows.length || rows.some((_row, index) => !payload.undefinedPaths.includes(`/value/${index}/OtherProperty`))) {
        throw new Error("Symbol Pin observations require exactly one undefined OtherProperty pointer per row.");
      }
    }
    if (definition.output === "polygons" && (payload.undefinedPaths.length > 0 || JSON.stringify(payload.value) !== JSON.stringify(normalizedSplitPolygonGroups(request.arguments["complexPolygons"]).flat()))) {
      throw new Error("Public polygon split does not exactly preserve input sources and order.");
    }
    if (request.method === "eda.pcb_Net.getNetColor") { rgbaResult.parse(payload.value); }
    if (request.method === "eda.pcb_Document.getCalculatingRatlineStatus") { z.enum(["active", "inactive"]).parse(payload.value); }
    if (request.method === "eda.sys_Window.getCurrentTheme") { z.enum(["light", "dark"]).parse(payload.value); }
    if (request.method === "eda.sys_Unit.getFrontendDataUnit") { z.enum(["mm", "cm", "dm", "m", "inch", "in", "mil"]).parse(payload.value); }
    if (request.method === "eda.pcb_Drc.getAllDifferentialPairs") { z.union([recordResult, z.array(recordResult).max(MAX_ITEMS)]).parse(payload.value); }
    if (request.method === "eda.sch_Utils.splitLines") { splitLinesResult.parse(payload.value); }
    if (definition.membership !== undefined && recordResult.parse(payload.value)["uuid"] !== request.arguments[definition.membership.argument]) { throw new Error("Public SDK result belongs to a different document."); }
    if (definition.output === "primitive") {
      const rows = z.array(recordResult).max(MAX_ITEMS).parse(payload.value);
      const returnedIds = rows.map((row) => id.parse(row["PrimitiveId"]));
      if (new Set(returnedIds).size !== returnedIds.length) { throw new Error("Duplicate public SDK primitive identity."); }
      const undefinedPointers = new Set(payload.undefinedPaths);
      for (const [rowIndex, row] of rows.entries()) {
        if (row["PrimitiveType"] !== definition.primitiveType) { throw new Error("Public SDK primitive belongs to a different family."); }
        if (definition.primitiveType === "ComponentPad" && row["ParentComponentPrimitiveId"] !== request.arguments["primitiveId"]) { throw new Error("Public SDK component pad belongs to a different parent."); }
        const fields = row["ComponentType"] === "block_symbol" ? [...definition.getters, "Cbb", "CbbSymbol"] : definition.getters;
        if (Object.keys(row).toSorted().join("\n") !== fields.toSorted().join("\n")) { throw new Error("Public SDK primitive projection is incomplete or contains unknown fields."); }
        validatePrimitiveFields(row, rowIndex, definition, undefinedPointers);
      }
      const requested = request.arguments["primitiveIds"];
      let requestedIds: unknown[] | undefined;
      if (typeof requested === "string") { requestedIds = [requested]; }
      if (Array.isArray(requested)) { requestedIds = requested; }
      if (requestedIds !== undefined && (returnedIds.length !== requestedIds.length || returnedIds.some((value) => !requestedIds.includes(value)))) { throw new Error("Public SDK primitive set does not exactly match its request."); }
    }
  }
  if (new Set(payload.undefinedPaths).size !== payload.undefinedPaths.length) { throw new Error("Duplicate undefined-value evidence."); }
  for (const pointer of payload.undefinedPaths) {
    if (!/^\/value(?:\/(?:[^~]|~[01])*)*$/u.test(pointer)) { throw new Error("Invalid undefined-value pointer."); }
    let value: unknown = { value: payload.value };
    for (const token of pointer.slice(1).split("/")) {
      const key = token.replaceAll("~1", "/").replaceAll("~0", "~");
      if (value === null || typeof value !== "object" || !Object.hasOwn(value, key)) { throw new Error("Undefined-value pointer is absent from result."); }
      value = Reflect.get(value, key);
    }
    if (value !== null) { throw new Error("Undefined-value evidence conflicts with result."); }
  }
  let assurance = definition.implementationKind === "native-task-equivalent"
    ? "bounded-native-task-observation-not-complete-source-connectivity-or-persistence-proof"
    : "bounded-public-sdk-observation-not-native-or-persistence-proof";
  if (isSchematicNativeIdMethod(request.method)) { assurance = "bounded-native-id-observation-not-complete-source-connectivity-or-persistence-proof"; }
  if (request.method === SCHEMATIC_COMPONENT_PROPERTY_METHOD) { assurance = "bounded-native-property-name-observation-not-complete-source-connectivity-or-persistence-proof"; }
  if (request.method === SYMBOL_PIN_ENUMERATION_METHOD) { assurance = "bounded-native-pin-getter-observation-not-complete-source-connectivity-or-persistence-proof"; }
  return { ...payload, assurance,
    ...(definition.implementationKind === "native-task-equivalent" ? { implementationKind: definition.implementationKind } : {}),
    publicApiSha256: PUBLIC_SDK_READ_API_SHA256, liveValidation: "not-yet-validated", limitations: [...definition.limitations] };
}
