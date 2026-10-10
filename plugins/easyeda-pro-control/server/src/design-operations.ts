import { z } from "zod";

/** Positional contracts reviewed against the installed public API 0.2.53 declarations. */
export const DESIGN_OPERATION_PROFILE = "easyeda-pro-control.pcb-operations.v1";

const number = z.number();
const positive = number.positive();
const name = z.string().min(1).max(512);
const id = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/u);
const net = z.string().max(512);
const primitiveId = z.string().min(1).max(256);
const targetSchema = z.union([
  z.object({ primitiveId }).strict(),
  z.object({ resultOf: id }).strict(),
]);
const uniqueNames = z.array(name).max(20_000).refine((items) => new Set(items).size === items.length, "Duplicate names.");
const color = z.object({ r: number.min(0).max(255), g: number.min(0).max(255), b: number.min(0).max(255), alpha: number.min(0).max(1) }).strict().nullable();
const copperLayer = z.number().int().refine((value) => value === 1 || value === 2 || (value >= 15 && value <= 44), "Not a copper layer.");
const graphicLayer = z.number().int().refine((value) => (value >= 1 && value <= 11) || (value >= 13 && value <= 44) || value === 56 || (value >= 71 && value <= 100), "Not a line layer.");
const fillLayer = z.number().int().refine((value) => (value >= 1 && value <= 10) || (value >= 12 && value <= 44) || (value >= 71 && value <= 100), "Not a fill layer.");
const regionLayer = z.union([copperLayer, z.literal(12)]);
const padLayer = z.union([z.literal(1), z.literal(2), z.literal(12)]);
const componentLayer = z.union([z.literal(1), z.literal(2)]);

/** Source grammar is data, never an expression; native polygon construction also must succeed. */
export const polygonSourceSchema = z.array(z.union([number, z.enum(["L", "ARC", "CARC", "C", "R", "CIRCLE"])])).min(3).max(20_000)
  .superRefine((source, context) => {
    const first = source[0];
    if (first === "R" || first === "CIRCLE") {
      if (source.length !== (first === "R" ? 7 : 4) || source.slice(1).some((value) => typeof value !== "number")) {
        context.addIssue({ code: "custom", message: "Malformed rectangle/circle source." });
      }
      return;
    }
    if (typeof first !== "number" || typeof source[1] !== "number") {
      context.addIssue({ code: "custom", message: "Polygon must begin with a coordinate pair." });
      return;
    }
    let cursor = 2;
    while (cursor < source.length) {
      const command = source[cursor];
      cursor += 1;
      const start = cursor;
      while (typeof source[cursor] === "number") { cursor += 1; }
      const count = cursor - start;
      const valid = (command === "L" && count >= 2 && count % 2 === 0) ||
        ((command === "ARC" || command === "CARC") && count === 3) ||
        (command === "C" && count >= 6 && count % 6 === 0);
      if (!valid) {
        context.addIssue({ code: "custom", message: "Malformed polygon command or arity." });
        return;
      }
    }
  });
const complexPolygon = z.union([polygonSourceSchema, z.array(polygonSourceSchema).min(1).max(1024)]);
const mask = z.object({ topSolderMask: number.optional(), bottomSolderMask: number.optional(), topPasteMask: number.optional(), bottomPasteMask: number.optional() }).strict().nullable();
const heat = z.object({ connectionMethod: z.enum(["Divergent", "Direct-connected", "Non-connected"]), divergenceSpacing: number.nonnegative().optional(), divergenceLineWidth: positive.optional(), divergenceAngle: number.optional() }).strict().nullable();
const padShape = z.union([
  z.tuple([z.enum(["ELLIPSE", "OVAL"]), positive, positive]),
  z.tuple([z.literal("RECT"), positive, positive, number.nonnegative()]),
  z.tuple([z.literal("NGON"), positive, z.number().int().min(3).max(256)]),
  z.tuple([z.literal("POLYGON"), complexPolygon]),
]);
const holeShape = z.union([
  z.tuple([z.literal("ROUND"), positive]),
  z.tuple([z.literal("SLOT"), positive, positive]).refine((value) => value[2] >= value[1], "Slot length is smaller than its diameter."),
]).nullable();

const lineProperties = z.object({ net, layer: graphicLayer, startX: number, startY: number, endX: number, endY: number, lineWidth: positive, primitiveLock: z.boolean() }).strict();
const arcProperties = lineProperties.extend({ arcAngle: number.min(-360).max(360).refine((value) => value !== 0), interactiveMode: z.union([z.literal(1), z.literal(2)]) }).strict();
const viaProperties = z.object({ net, x: number, y: number, holeDiameter: positive, diameter: positive, viaType: z.union([z.literal(0), z.literal(1), z.literal(2)]), designRuleBlindViaName: name.nullable(), solderMaskExpansion: mask, primitiveLock: z.boolean() }).strict();
const padProperties = z.object({ layer: padLayer, padNumber: net, x: number, y: number, rotation: number, pad: padShape, net, hole: holeShape, holeOffsetX: number, holeOffsetY: number, holeRotation: number, metallization: z.boolean(), padType: z.union([z.literal(0), z.literal(1), z.literal(2)]), solderMaskAndPasteMaskExpansion: mask, heatWelding: heat, primitiveLock: z.boolean() }).strict();
const polylineProperties = z.object({ net, layer: graphicLayer, polygon: polygonSourceSchema, lineWidth: positive, primitiveLock: z.boolean() }).strict();
const regionRule = z.union([z.literal(2), z.literal(3), z.literal(5), z.literal(6), z.literal(7), z.literal(8), z.literal(9)]);
const areaOutlineWidth = number.nonnegative().describe("Legacy outline decoration input. This native version fixes the effective value to 0.2 mil and reports it in parameterEffects. Not copper width, grid width or clearance; supply 0.2.");
const regionProperties = z.object({ layer: regionLayer, complexPolygon, ruleType: z.array(regionRule).max(7).refine((values) => new Set(values).size === values.length), regionName: net, lineWidth: areaOutlineWidth, primitiveLock: z.boolean() }).strict();
const pourProperties = z.object({ net, layer: copperLayer, complexPolygon, pourFillMethod: z.enum(["45grid", "90grid", "solid"]), preserveSilos: z.boolean(), pourName: net, pourPriority: z.number().int().nonnegative(), lineWidth: areaOutlineWidth, primitiveLock: z.boolean(), gridLineWidth: positive.optional(), gridSpacing: positive.optional(), optimizationFineness: number.nonnegative().optional() }).strict();
const fillProperties = z.object({ layer: fillLayer, complexPolygon, net, fillMode: z.union([z.literal(0), z.literal(1), z.literal(2)]), lineWidth: areaOutlineWidth, primitiveLock: z.boolean() }).strict();
const poseProperties = z.object({ layer: componentLayer, x: number, y: number, rotation: number, primitiveLock: z.boolean() }).strict();
const componentProperties = poseProperties.extend({ component: z.object({ libraryUuid: name, uuid: name }).strict() }).strict();

/** Shared geometry shapes only; the footprint adapter has a separate strict
 * document-type-4 action schema and never admits PCB operations to a library.
 */
export const footprintGeometryProperties = { line: lineProperties, arc: arcProperties, pad: padProperties, polyline: polylineProperties, fill: fillProperties };

// oxlint-disable-next-line typescript/explicit-function-return-type -- Preserve the inferred literal discriminators and each strict generic property shape.
function primitiveOperations<const Family extends string, Shape extends z.ZodRawShape>(family: Family, properties: z.ZodObject<Shape>) {
  return [
    z.object({ id, action: z.literal(`pcb.${family}.create`), properties }).strict(),
    z.object({ id, action: z.literal(`pcb.${family}.modify`), target: targetSchema, patch: properties.partial().refine((value) => Object.keys(value).length > 0, "Empty patch.") }).strict(),
    z.object({ id, action: z.literal(`pcb.${family}.delete`), target: targetSchema }).strict(),
  ] as const;
}

/** SDK rule blobs have version-specific keys; only bounded JSON enters fixed collection setters. */
export type DesignJson = null | boolean | number | string | DesignJson[] | { [key: string]: DesignJson };
function isDesignJson(value: unknown, depth = 0): value is DesignJson {
  if (depth > 24) { return false; }
  if (value === null || typeof value === "boolean") { return true; }
  if (typeof value === "number") { return Number.isFinite(value); }
  if (typeof value === "string") { return value.length <= 65_536 && !["[MaxDepth]", "[Truncated]", "[Circular]"].includes(value); }
  if (typeof value !== "object") { return false; }
  if (Array.isArray(value)) { return value.length <= 20_000 && value.every((entry) => isDesignJson(entry, depth + 1)); }
  if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) { return false; }
  const entries = Object.entries(value);
  return entries.length <= 20_000 && entries.every(([key, entry]) => !["__proto__", "prototype", "constructor"].includes(key) && isDesignJson(entry, depth + 1));
}
// Validate raw input before Zod's JSON parser, which otherwise drops __proto__.
// Unlike z.custom, unknown + refinement is representable by MCP tools/list.
const boundedJsonInput = z.unknown().refine(isDesignJson, "Expected bounded plain JSON without placeholders.")
  .meta({ description: "Plain JSON only; maximum depth 24, bounded collections, no prototype keys or truncation placeholders." });
const json = boundedJsonInput.pipe(z.json()).refine((value) => JSON.stringify(value).length <= 1_048_576, "JSON exceeds operation bound.");
const jsonObject = json.refine((value) => typeof value === "object" && value !== null && !Array.isArray(value), "Expected a rule object.");
const jsonRows = z.array(jsonObject).max(20_000);

// oxlint-disable-next-line typescript/explicit-function-return-type -- Preserve exact literal action discriminators in the composed public schema.
function groupOperations<const Group extends "netclass" | "equal-length">(group: Group) {
  return [
    z.object({ id, action: z.literal(`pcb.${group}.create`), name, nets: uniqueNames, color }).strict(),
    z.object({ id, action: z.literal(`pcb.${group}.delete`), name }).strict(),
    z.object({ id, action: z.literal(`pcb.${group}.rename`), name, newName: name }).strict(),
    z.object({ id, action: z.literal(`pcb.${group}.add-nets`), name, nets: uniqueNames.min(1) }).strict(),
    z.object({ id, action: z.literal(`pcb.${group}.remove-nets`), name, nets: uniqueNames.min(1) }).strict(),
  ] as const;
}

export const designOperationSchema = z.discriminatedUnion("action", [
  ...primitiveOperations("line", lineProperties),
  ...primitiveOperations("arc", arcProperties),
  ...primitiveOperations("via", viaProperties),
  z.object({ id, action: z.literal("pcb.pad.create"), properties: padProperties }).strict(),
  z.object({ id, action: z.literal("pcb.pad.modify"), target: targetSchema, patch: padProperties.omit({ padType: true }).partial().refine((value) => Object.keys(value).length > 0, "Empty patch.") }).strict(),
  z.object({ id, action: z.literal("pcb.pad.delete"), target: targetSchema }).strict(),
  ...primitiveOperations("polyline", polylineProperties),
  ...primitiveOperations("region", regionProperties),
  ...primitiveOperations("pour", pourProperties),
  z.object({ id, action: z.literal("pcb.pour.rebuild"), target: targetSchema }).strict(),
  z.object({ id, action: z.literal("pcb.pour.clear-derived"), target: targetSchema }).strict(),
  ...primitiveOperations("fill", fillProperties),
  z.object({ id, action: z.literal("pcb.component.create"), properties: componentProperties }).strict(),
  z.object({ id, action: z.literal("pcb.component.modify"), target: targetSchema, patch: poseProperties.partial().refine((value) => Object.keys(value).length > 0, "Empty patch.") }).strict(),
  z.object({ id, action: z.literal("pcb.component.delete"), target: targetSchema }).strict(),
  ...groupOperations("netclass"),
  ...groupOperations("equal-length"),
  z.object({ id, action: z.literal("pcb.differential-pair.create"), name, positiveNet: name, negativeNet: name }).strict(),
  z.object({ id, action: z.literal("pcb.differential-pair.delete"), name }).strict(),
  z.object({ id, action: z.literal("pcb.differential-pair.rename"), name, newName: name }).strict(),
  z.object({ id, action: z.literal("pcb.differential-pair.set-positive"), name, net: name }).strict(),
  z.object({ id, action: z.literal("pcb.differential-pair.set-negative"), name, net: name }).strict(),
  z.object({ id, action: z.literal("pcb.rules.configuration.replace"), value: jsonObject }).strict(),
  z.object({ id, action: z.literal("pcb.rules.net.replace"), value: jsonRows }).strict(),
  z.object({ id, action: z.literal("pcb.rules.net-to-net.replace"), value: jsonObject }).strict(),
  z.object({ id, action: z.literal("pcb.rules.region.replace"), value: jsonRows }).strict(),
]).superRefine((operation, context) => {
  if (operation.action === "pcb.via.create" && operation.properties.diameter <= operation.properties.holeDiameter) {
    context.addIssue({ code: "custom", message: "Via land diameter must exceed hole diameter." });
  }
  if (operation.action === "pcb.differential-pair.create" && operation.positiveNet === operation.negativeNet) {
    context.addIssue({ code: "custom", message: "Differential nets must differ." });
  }
});

export type DesignOperation = z.infer<typeof designOperationSchema>;
export type DesignTarget = z.infer<typeof targetSchema>;
export type DesignPrimitiveFamily = "line" | "arc" | "via" | "pad" | "polyline" | "region" | "pour" | "fill" | "component";
export type DesignArgument =
  | { kind: "literal"; value: DesignJson }
  | { kind: "undefined" }
  | { kind: "target"; target: DesignTarget }
  | { kind: "polygon"; complex: boolean; source: z.infer<typeof complexPolygon> }
  | { kind: "object"; properties: Record<string, DesignArgument> };

export interface DesignCall {
  api: string;
  method: string;
  args: DesignArgument[];
}
export interface DesignReadDescriptor {
  purpose: "target" | "family-identities" | "complete-rules" | "complete-document-source";
  api: string;
  method: string;
  args: DesignArgument[];
}
export interface DesignExpectedField {
  field: string;
  getter: string | null;
  value: DesignJson;
  authority: "public-getter" | "document-source-required";
  comparison: "equals" | "absent" | "contains-all" | "excludes-all";
  selector?: { name: string };
}
export type DesignInverse =
  | { kind: "delete-created"; api: string; resultOf: string }
  | { kind: "restore-patch-from-before"; api: string; target: DesignTarget; fields: string[] }
  | { kind: "restore-collection-from-before"; api: "pcb_Drc"; readMethod: string; writeMethod: string }
  | { kind: "restore-from-checkpoint"; reason: "deleted-identity" | "group-membership-and-rule-associations" };

export interface CompiledDesignOperation {
  profile: typeof DESIGN_OPERATION_PROFILE;
  id: string;
  action: DesignOperation["action"];
  documentType: 3;
  call: DesignCall;
  resultKind: "created-primitive" | "modified-primitive" | "boolean" | "derived-copper";
  beforeReads: DesignReadDescriptor[];
  afterReads: DesignReadDescriptor[];
  expectedFields: DesignExpectedField[];
  inverse: DesignInverse;
  effect: { family: string; target: DesignTarget | null; identity: "create" | "preserve" | "delete" | "collection"; fields: string[]; collateral: string[] };
  limitations: string[];
}

const literal = (value: DesignJson): DesignArgument => ({ kind: "literal", value });
const targetArgument = (target: DesignTarget): DesignArgument => ({ kind: "target", target });

const primitiveCatalog = {
  line: { api: "pcb_PrimitiveLine", fields: ["net", "layer", "startX", "startY", "endX", "endY", "lineWidth", "primitiveLock"] },
  arc: { api: "pcb_PrimitiveArc", fields: ["net", "layer", "startX", "startY", "endX", "endY", "arcAngle", "lineWidth", "interactiveMode", "primitiveLock"] },
  via: { api: "pcb_PrimitiveVia", fields: ["net", "x", "y", "holeDiameter", "diameter", "viaType", "designRuleBlindViaName", "solderMaskExpansion", "primitiveLock"] },
  pad: { api: "pcb_PrimitivePad", fields: ["layer", "padNumber", "x", "y", "rotation", "pad", "net", "hole", "holeOffsetX", "holeOffsetY", "holeRotation", "metallization", "padType", "specialPad", "solderMaskAndPasteMaskExpansion", "heatWelding", "primitiveLock"] },
  polyline: { api: "pcb_PrimitivePolyline", fields: ["net", "layer", "polygon", "lineWidth", "primitiveLock"] },
  region: { api: "pcb_PrimitiveRegion", fields: ["layer", "complexPolygon", "ruleType", "regionName", "lineWidth", "primitiveLock"] },
  pour: { api: "pcb_PrimitivePour", fields: ["net", "layer", "complexPolygon", "pourFillMethod", "preserveSilos", "pourName", "pourPriority", "lineWidth", "primitiveLock"] },
  fill: { api: "pcb_PrimitiveFill", fields: ["layer", "complexPolygon", "net", "fillMode", "lineWidth", "primitiveLock"] },
  component: { api: "pcb_PrimitiveComponent", fields: ["component", "layer", "x", "y", "rotation", "primitiveLock"] },
} as const;

/** This is a proof requirement, not an assertion that every document-source adapter is lossless. */
const sourceRead: DesignReadDescriptor = { purpose: "complete-document-source", api: "sys_FileManager", method: "getDocumentSource", args: [] };
const ruleRead: DesignReadDescriptor = { purpose: "complete-rules", api: "pcb_Drc", method: "getCurrentRuleConfiguration", args: [] };

function propertyArgument(field: string, value: unknown): DesignArgument {
  if (value === undefined) { return { kind: "undefined" }; }
  if (field === "polygon" || field === "complexPolygon") {
    return { kind: "polygon", complex: field === "complexPolygon", source: complexPolygon.parse(value) };
  }
  return literal(json.parse(value));
}

function expectedField(family: DesignPrimitiveFamily, field: string, value: unknown): DesignExpectedField {
  const omitted = (family === "region" && field === "ruleType") || (family === "fill" && field === "fillMode") || (family === "pour" && ["gridLineWidth", "gridSpacing", "optimizationFineness"].includes(field));
  const rounded = (family === "arc" && ["startX", "startY", "endX", "endY", "arcAngle"].includes(field)) || (family === "via" && ["diameter", "holeDiameter"].includes(field));
  return {
    field,
    getter: omitted ? null : `getState_${field[0]?.toUpperCase() ?? ""}${field.slice(1)}`,
    // Pinned native Ku/gFe fixes area-object outline decoration to 0.02
    // Internal units = 0.2 mil. It is not poured-copper or clearance width.
    value: json.parse(field === "lineWidth" && ["region", "pour", "fill"].includes(family) ? 0.2 : value),
    authority: omitted || rounded ? "document-source-required" : "public-getter",
    comparison: "equals",
  };
}

export function designParameterEffects(input: unknown): readonly Record<string, unknown>[] {
  const operation = designOperationSchema.parse(input);
  const family = operation.action.split(".")[1];
  let values: object = {};
  if ("properties" in operation) { values = operation.properties; }
  if ("patch" in operation) { values = operation.patch; }
  const requested: unknown = Reflect.get(values, "lineWidth");
  return family !== undefined && ["region", "pour", "fill"].includes(family) && requested !== undefined ?
    [{ field: "lineWidth", requested, effective: 0.2, unit: "mil", authority: "pinned-native-Ku-gFe", meaning: "Fixed outline decoration, not copper width, grid width or clearance." }] : [];
}

function compilePrimitive(operation: DesignOperation, family: DesignPrimitiveFamily): CompiledDesignOperation {
  const catalog = primitiveCatalog[family];
  const method = operation.action.split(".")[2];
  if (method !== "create" && method !== "modify" && method !== "delete") { throw new Error("Unreviewed primitive operation."); }
  const target = "target" in operation ? operation.target : null;
  const properties = "properties" in operation ? operation.properties : {};
  const patch = "patch" in operation ? operation.patch : {};
  const fields = method === "create" ? Object.keys(properties) : Object.keys(patch);
  let args: DesignArgument[];
  let inverse: DesignInverse;
  if (method === "create") {
    args = catalog.fields.map((field) => propertyArgument(field, Reflect.get(properties, field)));
    inverse = { kind: "delete-created", api: catalog.api, resultOf: operation.id };
  } else {
    if (target === null) { throw new Error("Missing primitive target."); }
    args = [targetArgument(target)];
    if (method === "modify") {
      args.push({ kind: "object", properties: Object.fromEntries(Object.entries(patch).map(([field, value]) => [field, propertyArgument(field, value)])) });
      inverse = { kind: "restore-patch-from-before", api: catalog.api, target, fields };
    } else {
      inverse = { kind: "restore-from-checkpoint", reason: "deleted-identity" };
    }
  }
  const identities: DesignReadDescriptor = { purpose: "family-identities", api: catalog.api, method: "getAllPrimitiveId", args: [] };
  const beforeReads = [sourceRead, identities];
  if (target !== null) { beforeReads.push({ purpose: "target", api: catalog.api, method: "get", args: [targetArgument(target)] }); }
  const afterReads = [sourceRead, identities];
  if (method !== "delete") { afterReads.push({ purpose: "target", api: catalog.api, method: "get", args: [targetArgument(target ?? { resultOf: operation.id })] }); }
  const values = method === "create" ? properties : patch;
  const expectedFields = Object.entries(values).map(([field, value]) => expectedField(family, field, value));
  const collateral = family === "component" ? ["target-owned-pads", "target-owned-attributes", "target-owned-footprint-graphics"] : [];
  if (["line", "arc", "via", "pad", "pour", "fill"].includes(family)) { collateral.push("derived-connectivity-and-copper-invalidation"); }
  let resultKind: CompiledDesignOperation["resultKind"] = "boolean";
  if (method === "create") { resultKind = "created-primitive"; }
  if (method === "modify") { resultKind = "modified-primitive"; }
  return {
    profile: DESIGN_OPERATION_PROFILE, id: operation.id, action: operation.action, documentType: 3,
    call: { api: catalog.api, method, args },
    resultKind,
    beforeReads, afterReads, expectedFields, inverse,
    effect: { family, target, identity: method === "modify" ? "preserve" : method, fields, collateral },
    limitations: ["compiler-only-until-connected-mutation-admission", "all-unlisted-document-state-must-remain-unchanged", ...(family === "pad" ? ["standalone-pad-only-unless-parent-collateral-is-explicitly-proven", "specialPad-unimplemented-in-sdk"] : []), ...(family === "region" ? ["public-reader-omits-NO_VIAS"] : []), ...(family === "fill" ? ["public-reader-hardcodes-fillMode"] : []), ...(family === "arc" || family === "via" ? ["public-reader-rounds-geometry"] : [])],
  };
}

const ruleCollections = {
  "pcb.rules.configuration.replace": ["getCurrentRuleConfiguration", "overwriteCurrentRuleConfiguration"],
  "pcb.rules.net.replace": ["getNetRules", "overwriteNetRules"],
  "pcb.rules.net-to-net.replace": ["getNetByNetRules", "overwriteNetByNetRules"],
  "pcb.rules.region.replace": ["getRegionRules", "overwriteRegionRules"],
} as const;

function compileRules(operation: DesignOperation): CompiledDesignOperation {
  if (!(operation.action in ruleCollections) || !("value" in operation)) { throw new Error("Unreviewed rule operation."); }
  const collection = ruleCollections[operation.action];
  const [readMethod, writeMethod] = collection;
  const reads: DesignReadDescriptor[] = [sourceRead, { purpose: "complete-rules", api: "pcb_Drc", method: readMethod, args: [] }];
  return {
    profile: DESIGN_OPERATION_PROFILE, id: operation.id, action: operation.action, documentType: 3,
    call: { api: "pcb_Drc", method: writeMethod, args: [literal(operation.value)] }, resultKind: "boolean",
    beforeReads: reads, afterReads: reads,
    expectedFields: [{ field: "collection", getter: readMethod, value: operation.value, authority: "public-getter", comparison: "equals" }],
    inverse: { kind: "restore-collection-from-before", api: "pcb_Drc", readMethod, writeMethod },
    effect: { family: operation.action, target: null, identity: "collection", fields: ["collection"], collateral: [] },
    limitations: ["compiler-only-until-connected-mutation-admission", "validate-complete-net-coverage-and-unrelated-rules", "rule-blobs-are-version-specific-bounded-json", "public-net-rule-setter-does-not-prove-differential-pair-physics"],
  };
}

function compileGroup(operation: DesignOperation): CompiledDesignOperation {
  if (!("name" in operation)) { throw new Error("Missing group name."); }
  const group = operation.action.split(".")[1];
  const verb = operation.action.split(".")[2];
  const pair = group === "differential-pair";
  const stem = group === "netclass" ? "NetClass" : "EqualLengthNetGroup";
  const groupStem = pair ? "DifferentialPair" : stem;
  const readMethod = `getAll${groupStem}${group === "netclass" ? "es" : "s"}`;
  let method: string;
  const args: DesignArgument[] = [literal(operation.name)];
  if (verb === "create") {
    method = `create${groupStem}`;
    if ("positiveNet" in operation) { args.push(literal(operation.positiveNet), literal(operation.negativeNet)); }
    else if ("nets" in operation && "color" in operation) { args.push(literal(operation.nets), literal(operation.color)); }
    else { throw new Error("Missing group creation fields."); }
  } else if (verb === "delete") { method = `delete${groupStem}`; }
  else if (verb === "rename" && "newName" in operation) { method = `modify${groupStem}Name`; args.push(literal(operation.newName)); }
  else if ((verb === "add-nets" || verb === "remove-nets") && "nets" in operation) {
    method = verb === "add-nets" ? `addNetTo${stem}` : `removeNetFrom${stem}`;
    args.push(literal(operation.nets));
  } else if ((verb === "set-positive" || verb === "set-negative") && "net" in operation) {
    method = verb === "set-positive" ? "modifyDifferentialPairPositiveNet" : "modifyDifferentialPairNegativeNet";
    args.push(literal(operation.net));
  } else { throw new Error("Unreviewed group operation."); }
  const reads: DesignReadDescriptor[] = [sourceRead, ruleRead, { purpose: "complete-rules", api: "pcb_Drc", method: readMethod, args: [] }];
  const selector = { name: "newName" in operation ? operation.newName : operation.name };
  const expectation = (field: string, value: DesignJson, comparison: DesignExpectedField["comparison"] = "equals"): DesignExpectedField => ({ field, value, comparison, selector, getter: readMethod, authority: "public-getter" });
  const expectedFields: DesignExpectedField[] = [expectation("name", selector.name)];
  if (verb === "delete") { expectedFields[0] = expectation("name", operation.name, "absent"); }
  if (verb === "rename") { expectedFields.push({ ...expectation("name", operation.name, "absent"), selector: { name: operation.name } }); }
  if ("nets" in operation) {
    let comparison: DesignExpectedField["comparison"] = "equals";
    if (verb === "add-nets") { comparison = "contains-all"; }
    if (verb === "remove-nets") { comparison = "excludes-all"; }
    expectedFields.push(expectation("nets", operation.nets, comparison));
  }
  if ("color" in operation) { expectedFields.push(expectation("color", operation.color)); }
  if ("positiveNet" in operation) { expectedFields.push(expectation("positiveNet", operation.positiveNet), expectation("negativeNet", operation.negativeNet)); }
  if ("net" in operation) { expectedFields.push(expectation(verb === "set-positive" ? "positiveNet" : "negativeNet", operation.net)); }
  return {
    profile: DESIGN_OPERATION_PROFILE, id: operation.id, action: operation.action, documentType: 3,
    call: { api: "pcb_Drc", method, args }, resultKind: "boolean", beforeReads: reads, afterReads: reads,
    expectedFields, inverse: { kind: "restore-from-checkpoint", reason: "group-membership-and-rule-associations" },
    effect: { family: group ?? "", target: null, identity: "collection", fields: [verb ?? ""], collateral: ["group-associated-rule-rows"] },
    limitations: ["compiler-only-until-connected-mutation-admission", "group-inverse-requires-complete-membership-and-associated-rule-baseline", ...(pair ? ["pair-identity-does-not-configure-physics"] : [])],
  };
}

/** Compile only validated actions; a forged precompiled call is never accepted here. */
function isPrimitiveFamily(value: string): value is DesignPrimitiveFamily {
  return Object.hasOwn(primitiveCatalog, value);
}

export function compileDesignOperation(input: unknown): CompiledDesignOperation {
  const operation = designOperationSchema.parse(input);
  if (operation.action === "pcb.pour.clear-derived") {
    return { profile: DESIGN_OPERATION_PROFILE, id: operation.id, action: operation.action, documentType: 3,
      call: { api: "pcb_PrimitivePoured", method: "delete", args: [targetArgument(operation.target)] }, resultKind: "boolean",
      beforeReads: [sourceRead, ruleRead], afterReads: [sourceRead, ruleRead], expectedFields: [],
      inverse: { kind: "restore-from-checkpoint", reason: "deleted-identity" },
      effect: { family: "pour", target: operation.target, identity: "preserve", fields: [], collateral: ["selected-parent-poured-record-only"] },
      limitations: ["manual-copper-lifecycle-clear-edit-rebuild", "automatic-repour-is-not-accepted-as-collateral", "clear-preserves-base-pour-and-all-other-records"] };
  }
  if (operation.action === "pcb.pour.rebuild") {
    return { profile: DESIGN_OPERATION_PROFILE, id: operation.id, action: operation.action, documentType: 3,
      call: { api: "pcb_PrimitivePour", method: "rebuildCopperRegion", args: [targetArgument(operation.target)] }, resultKind: "derived-copper",
      beforeReads: [sourceRead, ruleRead], afterReads: [sourceRead, ruleRead], expectedFields: [],
      inverse: { kind: "restore-from-checkpoint", reason: "deleted-identity" },
      effect: { family: "pour", target: operation.target, identity: "preserve", fields: [], collateral: ["selected-parent-poured-record-only"] },
      limitations: ["independent-native-derived-geometry-proof-required", "public-rebuild-result-drops-other-parents-and-mislabels-grid45", "rebuild-is-not-DRC-or-fabrication-approval"] };
  }
  const family = operation.action.split(".")[1];
  if (family !== undefined && isPrimitiveFamily(family)) {
    return compilePrimitive(operation, family);
  }
  if (family === "rules") { return compileRules(operation); }
  return compileGroup(operation);
}

export const designOperationBatchSchema = z.object({ operations: z.array(designOperationSchema).min(1).max(256) }).strict().superRefine((batch, context) => {
  const prior = new Map<string, DesignOperation>();
  for (const operation of batch.operations) {
    if (prior.has(operation.id)) { context.addIssue({ code: "custom", message: "Duplicate operation ID." }); }
    if ("target" in operation && "resultOf" in operation.target) {
      const creator = prior.get(operation.target.resultOf);
      if (creator === undefined || !creator.action.endsWith(".create") || creator.action.split(".")[1] !== operation.action.split(".")[1]) {
        context.addIssue({ code: "custom", message: "Result reference must name a prior primitive create of the same family." });
      }
    }
    prior.set(operation.id, operation);
  }
});

export function compileDesignOperationBatch(input: unknown): CompiledDesignOperation[] {
  return designOperationBatchSchema.parse(input).operations.map(compileDesignOperation);
}

/** Bind only journal-owned created IDs; every call is rebuilt from the original strict action. */
export function buildDesignOperationCallExpression(input: unknown, createdIds: Readonly<Record<string, string>> = {}): string {
  const compiled = compileDesignOperation(input);
  function argumentExpression(argument: DesignArgument): string {
    switch (argument.kind) {
      case "literal": { return JSON.stringify(argument.value); }
      case "undefined": { return "undefined"; }
      case "target": {
        const target = argument.target;
        let resolved: string | undefined;
        if ("primitiveId" in target) { resolved = target.primitiveId; }
        else if (Object.hasOwn(createdIds, target.resultOf)) { resolved = createdIds[target.resultOf]; }
        return JSON.stringify(primitiveId.parse(resolved));
      }
      case "polygon": {
        const method = argument.complex ? "createComplexPolygon" : "createPolygon";
        return `(() => { const polygon = eda.pcb_MathPolygon.${method}(${JSON.stringify(argument.source)}); if (!polygon) throw new Error("DESIGN_POLYGON_INVALID"); return polygon; })()`;
      }
      case "object": { return `{${Object.entries(argument.properties).map(([key, value]) => `${JSON.stringify(key)}:${argumentExpression(value)}`).join(",")}}`; }
      default: { throw new Error("Unreviewed argument descriptor."); }
    }
  }
  if (compiled.action === "pcb.pour.rebuild") {
    return `(await eda.pcb_PrimitivePour.get(${compiled.call.args.map(argumentExpression).join(",")})).rebuildCopperRegion()`;
  }
  return `eda.${compiled.call.api}.${compiled.call.method}(${compiled.call.args.map(argumentExpression).join(",")})`;
}

export const DESIGN_OPERATION_UNIMPLEMENTED = Object.freeze([
  "pcb.physical-stack: public setters are stubs; separate reviewed native stack adapter is required",
  "pcb.pad.specialPad: explicitly unimplemented by the reviewed SDK",
]);
