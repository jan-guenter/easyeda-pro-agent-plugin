import { z } from "zod";
import type {
  DesignArgument,
  DesignCall,
  DesignExpectedField,
  DesignInverse,
  DesignJson,
  DesignReadDescriptor,
  DesignTarget,
} from "./design-operations.ts";

export const SCHEMATIC_OPERATION_PROFILE = "easyeda-pro-control.schematic-operations.v1";
const number = z.number();
const name = z.string().min(1).max(512);
const text = z.string().max(65_536);
const id = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/u);
const primitiveId = z.string().min(1).max(256);
const targetSchema = z.union([z.object({ primitiveId }).strict(), z.object({ resultOf: id }).strict()]);
const graphicDocument = z.union([z.literal(1), z.literal(2)]).default(1);
const lineType = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]).nullable();
const color = z.string().max(128).nullable();
const width = number.positive().nullable();
const fillStyle = z.enum(["None", "Solid", "Grid", "Horizontal Line", "Vertical Line", "Rhombic Grid", "Left Slash Line", "Right Slash Line"]).nullable();
const alignment = z.number().int().min(1).max(9);
const coordinates = z.array(number).min(4).max(20_000).refine((points) => points.length % 2 === 0, "Expected complete coordinate pairs.");
const lines = z.union([coordinates, z.array(coordinates).min(1).max(1024)]);
const style = { color, fillColor: color, lineWidth: width, lineType };
const wireProperties = z.object({ line: lines, net: text, color, lineWidth: width, lineType }).strict();
const busProperties = z.object({ busName: name, line: lines, color, lineWidth: width, lineType }).strict();
const pinProperties = z.object({ x: number, y: number, pinNumber: name, pinName: text, rotation: number, pinLength: number.nonnegative(), pinColor: color, pinShape: z.enum(["None", "Inverted", "Clock", "Inverted Clock"]), pinType: z.enum(["IN", "OUT", "BI", "Passive", "Open Collector", "Open Emitter", "Power", "Ground", "HIZ", "Terminator", "Undefined"]) }).strict();
const textProperties = z.object({ x: number, y: number, content: text, rotation: number, textColor: color, fontName: name.nullable(), fontSize: width, bold: z.boolean(), italic: z.boolean(), underLine: z.boolean(), alignMode: alignment }).strict();
const polygonProperties = z.object({ line: coordinates.min(6), ...style }).strict();
const rectangleProperties = z.object({ topLeftX: number, topLeftY: number, width: number.positive(), height: number.positive(), cornerRadius: number.nonnegative(), rotation: number, ...style, fillStyle }).strict();
const arcProperties = z.object({ startX: number, startY: number, referenceX: number, referenceY: number, endX: number, endY: number, ...style }).strict();
const circleProperties = z.object({ centerX: number, centerY: number, radius: number.positive(), ...style, fillStyle }).strict();
const componentCreateProperties = z.object({ component: z.object({ libraryUuid: name, uuid: name }).strict(), x: number, y: number, subPartName: name, rotation: number, mirror: z.boolean(), addIntoBom: z.boolean(), addIntoPcb: z.boolean() }).strict();
const scalar = z.union([text, number, z.boolean()]);
// Exact binding spellings in the pinned native attribute enum. getOrCreateAttr
// Uses a case-sensitive Map lookup; these are not ordinary sourcing metadata.
const SCHEMATIC_BINDING_PROPERTIES = new Set(["Device", "Symbol", "Footprint", "OBJ", "3D Model", "3D Model Title", "Origin 3D Model Title", "3D Model Transform", "Origin Footprint"]);
export function isSchematicBindingProperty(key: string): boolean { return SCHEMATIC_BINDING_PROPERTIES.has(key); }
const otherProperty = z.record(z.string().min(1).max(512).refine((key) => !["__proto__", "prototype", "constructor"].includes(key)), scalar).refine((value) => Object.keys(value).length <= 4096);
const genericOtherProperty = otherProperty.refine((value) => Object.keys(value).every((key) => !isSchematicBindingProperty(key)), "Library-binding attributes require an explicit instance replacement/ECO operation, not a generic property patch.");
const preservedProperties = z.object({ otherProperty, manufacturer: text.nullable(), manufacturerId: text.nullable(), supplier: text.nullable(), supplierId: text.nullable() }).strict();
export type SchematicPreservedProperties = z.infer<typeof preservedProperties>;
const componentPatch = z.object({ x: number, y: number, rotation: number, mirror: z.boolean(), addIntoBom: z.boolean(), addIntoPcb: z.boolean(), designator: text.nullable(), name: text.nullable(), uniqueId: text.nullable(), manufacturer: text.nullable(), manufacturerId: text.nullable(), supplier: text.nullable(), supplierId: text.nullable(), otherProperty: genericOtherProperty }).strict().partial().refine((value) => Object.keys(value).length > 0, "Empty component patch.");
const portProperties = z.object({ direction: z.enum(["IN", "OUT", "BI"]), net: name, x: number, y: number, rotation: number, mirror: z.boolean() }).strict();
const flagProperties = z.object({ identification: z.enum(["Power", "Ground", "AnalogGround", "ProtectGround"]), net: name, x: number, y: number, rotation: number, mirror: z.boolean() }).strict();
const attributePatch = z.object({ x: number.nullable(), y: number.nullable(), rotation: number.nullable(), color, fontName: name.nullable(), fontSize: width, bold: z.boolean().nullable(), italic: z.boolean().nullable(), underLine: z.boolean().nullable(), alignMode: alignment.nullable(), fillColor: color, key: text, value: text, keyVisible: z.boolean().nullable(), valueVisible: z.boolean().nullable() }).strict().partial().refine((value) => Object.keys(value).length > 0, "Empty attribute patch.");

// oxlint-disable-next-line typescript/explicit-function-return-type -- Keep each literal discriminator and strict per-family schema in the union.
function graphicOperations<const FamilyName extends string, Shape extends z.ZodRawShape>(family: FamilyName, properties: z.ZodObject<Shape>) {
  return [
    z.object({ id, action: z.literal(`sch.${family}.create`), documentType: graphicDocument, properties }).strict(),
    z.object({ id, action: z.literal(`sch.${family}.modify`), documentType: graphicDocument, target: targetSchema, patch: properties.partial().refine((value) => Object.keys(value).length > 0, "Empty patch.") }).strict(),
    z.object({ id, action: z.literal(`sch.${family}.delete`), documentType: graphicDocument, target: targetSchema }).strict(),
  ] as const;
}

export const schematicOperationSchema = z.discriminatedUnion("action", [
  ...graphicOperations("wire", wireProperties),
  ...graphicOperations("bus", busProperties),
  ...graphicOperations("text", textProperties),
  ...graphicOperations("polygon", polygonProperties),
  ...graphicOperations("rectangle", rectangleProperties),
  ...graphicOperations("arc", arcProperties),
  ...graphicOperations("circle", circleProperties),
  z.object({ id, action: z.literal("sch.pin.create"), documentType: z.literal(2), properties: pinProperties }).strict(),
  z.object({ id, action: z.literal("sch.pin.modify"), documentType: z.literal(2), target: targetSchema, patch: pinProperties.partial().refine((value) => Object.keys(value).length > 0, "Empty pin patch.") }).strict(),
  z.object({ id, action: z.literal("sch.pin.delete"), documentType: z.literal(2), target: targetSchema }).strict(),
  z.object({ id, action: z.literal("sch.component-pin.renumber"), documentType: z.literal(1).default(1), target: targetSchema, pinNumber: name }).strict(),
  z.object({ id, action: z.literal("sch.component-pin.no-connect"), documentType: z.literal(1).default(1), target: targetSchema, noConnected: z.boolean() }).strict(),
  z.object({ id, action: z.literal("sch.component.create"), documentType: z.literal(1).default(1), properties: componentCreateProperties }).strict(),
  z.object({ id, action: z.literal("sch.component.modify"), documentType: z.literal(1).default(1), target: targetSchema, patch: componentPatch }).strict(),
  z.object({ id, action: z.literal("sch.component.delete"), documentType: z.literal(1).default(1), target: targetSchema }).strict(),
  z.object({ id, action: z.literal("sch.port.create"), documentType: z.literal(1).default(1), properties: portProperties }).strict(),
  z.object({ id, action: z.literal("sch.net-flag.create"), documentType: z.literal(1).default(1), properties: flagProperties }).strict(),
  z.object({ id, action: z.literal("sch.net-label.create"), documentType: z.literal(1).default(1), properties: z.object({ x: number, y: number, net: name }).strict() }).strict(),
  z.object({ id, action: z.literal("sch.net-label.delete"), documentType: z.literal(1).default(1), target: targetSchema }).strict(),
  z.object({ id, action: z.literal("sch.attribute.modify"), documentType: graphicDocument, target: targetSchema, patch: attributePatch }).strict(),
]).superRefine((operation, context) => {
  if ((operation.action.startsWith("sch.wire.") || operation.action.startsWith("sch.bus.")) && operation.documentType !== 1) {
    context.addIssue({ code: "custom", message: "Electrical wires and buses require a schematic page." });
  }
});

export type SchematicOperation = z.infer<typeof schematicOperationSchema>;
export interface CompiledSchematicOperation {
  profile: typeof SCHEMATIC_OPERATION_PROFILE;
  operation: SchematicOperation;
  id: string;
  action: SchematicOperation["action"];
  documentType: 1 | 2;
  call: DesignCall;
  resultKind: "created-primitive" | "modified-primitive" | "boolean";
  beforeReads: DesignReadDescriptor[];
  afterReads: DesignReadDescriptor[];
  expectedFields: DesignExpectedField[];
  inverse: DesignInverse;
  effect: { family: string; target: DesignTarget | null; identity: "create" | "preserve" | "delete"; fields: string[]; collateral: string[] };
  requiredPreservation: null | { kind: "complete-schematic-properties"; fields: string[] };
  limitations: string[];
}

const catalog = {
  wire: { api: "sch_PrimitiveWire", fields: ["line", "net", "color", "lineWidth", "lineType"] },
  bus: { api: "sch_PrimitiveBus", fields: ["busName", "line", "color", "lineWidth", "lineType"] },
  text: { api: "sch_PrimitiveText", fields: ["x", "y", "content", "rotation", "textColor", "fontName", "fontSize", "bold", "italic", "underLine", "alignMode"] },
  polygon: { api: "sch_PrimitivePolygon", fields: ["line", "color", "fillColor", "lineWidth", "lineType"] },
  rectangle: { api: "sch_PrimitiveRectangle", fields: ["topLeftX", "topLeftY", "width", "height", "cornerRadius", "rotation", "color", "fillColor", "lineWidth", "lineType", "fillStyle"] },
  arc: { api: "sch_PrimitiveArc", fields: ["startX", "startY", "referenceX", "referenceY", "endX", "endY", "color", "fillColor", "lineWidth", "lineType"] },
  circle: { api: "sch_PrimitiveCircle", fields: ["centerX", "centerY", "radius", "color", "fillColor", "lineWidth", "lineType", "fillStyle"] },
  pin: { api: "sch_PrimitivePin", fields: ["x", "y", "pinNumber", "pinName", "rotation", "pinLength", "pinColor", "pinShape", "pinType"] },
  "component-pin": { api: "sch_PrimitivePin", fields: ["pinNumber"] },
  component: { api: "sch_PrimitiveComponent", fields: ["component", "x", "y", "subPartName", "rotation", "mirror", "addIntoBom", "addIntoPcb"] },
  port: { api: "sch_PrimitiveComponent", fields: ["direction", "net", "x", "y", "rotation", "mirror"] },
  "net-flag": { api: "sch_PrimitiveComponent", fields: ["identification", "net", "x", "y", "rotation", "mirror"] },
  "net-label": { api: "sch_PrimitiveAttribute", fields: ["x", "y", "net"] },
  attribute: { api: "sch_PrimitiveAttribute", fields: [] },
} as const;
type Family = keyof typeof catalog;
function isFamily(value: string | undefined): value is Family { return value !== undefined && Object.hasOwn(catalog, value); }
function isJson(value: unknown, depth = 0): value is DesignJson {
  if (depth > 16) { return false; }
  if (value === null || typeof value === "string" || typeof value === "boolean") { return true; }
  if (typeof value === "number") { return Number.isFinite(value); }
  if (typeof value !== "object") { return false; }
  if (Array.isArray(value)) { return value.length <= 20_000 && value.every((entry) => isJson(entry, depth + 1)); }
  if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) { return false; }
  return Object.entries(value).every(([key, entry]) => !["__proto__", "prototype", "constructor"].includes(key) && isJson(entry, depth + 1));
}
function literal(value: unknown): DesignArgument {
  if (!isJson(value)) { throw new Error("Schematic argument is missing or not bounded plain JSON."); }
  return { kind: "literal", value };
}
const sourceRead: DesignReadDescriptor = { purpose: "complete-document-source", api: "sys_FileManager", method: "getDocumentSource", args: [] };

function expected(family: Family, field: string, value: unknown): DesignExpectedField {
  let getter: string | null = `getState_${field[0]?.toUpperCase() ?? ""}${field.slice(1)}`;
  let authority: DesignExpectedField["authority"] = "public-getter";
  if (field === "pinType") { getter = "getState_pinType"; }
  if (["direction", "identification"].includes(field) || (family === "net-label" && field === "net")) { getter = null; }
  if (family === "wire" || getter === null || (family === "component" && ["otherProperty", "supplier", "supplierId"].includes(field))) { authority = "document-source-required"; }
  const argument = literal(value);
  if (argument.kind !== "literal") { throw new Error("Expected a literal field."); }
  return { field, getter, value: argument.value, authority, comparison: "equals" };
}

/** No dispatch happens here; full-source and topology assertions belong to the transaction executor. */
export function compileSchematicOperation(input: unknown): CompiledSchematicOperation {
  const operation = schematicOperationSchema.parse(input);
  const family = operation.action.split(".")[1];
  if (!isFamily(family)) { throw new Error("Unreviewed schematic family."); }
  const definition = catalog[family];
  const creating = operation.action.endsWith(".create");
  const deleting = operation.action.endsWith(".delete");
  const target = "target" in operation ? operation.target : null;
  let values: object = {};
  if ("properties" in operation) { values = operation.properties; }
  if ("patch" in operation) { values = operation.patch; }
  if (operation.action === "sch.component-pin.renumber") { values = { pinNumber: operation.pinNumber }; }
  if (operation.action === "sch.component-pin.no-connect") { values = { noConnected: operation.noConnected }; }
  const fields = Object.keys(values);
  let method = "modify";
  let resultKind: CompiledSchematicOperation["resultKind"] = "modified-primitive";
  let args: DesignArgument[] = [];
  let inverse: DesignInverse;
  if (creating) {
    method = "create";
    if (family === "port") { method = "createNetPort"; }
    if (family === "net-flag") { method = "createNetFlag"; }
    if (family === "net-label") { method = "createNetLabel"; }
    resultKind = "created-primitive";
    args = definition.fields.map((field) => literal(Reflect.get(values, field)));
    inverse = { kind: "delete-created", api: definition.api, resultOf: operation.id };
    if (family === "net-label") { inverse = { kind: "restore-from-checkpoint", reason: "deleted-identity" }; }
  } else {
    if (target === null) { throw new Error("Schematic target is missing."); }
    args = [{ kind: "target", target }];
    if (deleting) {
      method = "delete";
      resultKind = "boolean";
      inverse = { kind: "restore-from-checkpoint", reason: "deleted-identity" };
    } else {
      args.push({ kind: "object", properties: Object.fromEntries(Object.entries(values).map(([field, value]) => [field, literal(value)])) });
      inverse = { kind: "restore-patch-from-before", api: definition.api, target, fields };
    }
  }
  const familyIdentities: DesignReadDescriptor = { purpose: "family-identities", api: definition.api, method: "getAllPrimitiveId", args: [] };
  const beforeReads = [sourceRead, familyIdentities];
  const afterReads = [sourceRead, familyIdentities];
  if (target !== null) { beforeReads.push({ purpose: "target", api: definition.api, method: "get", args: [{ kind: "target", target }] }); }
  if (!deleting) { afterReads.push({ purpose: "target", api: definition.api, method: "get", args: [{ kind: "target", target: target ?? { resultOf: operation.id } }] }); }
  const requiredPreservation = operation.action === "sch.component.modify" ? { kind: "complete-schematic-properties" as const, fields: ["otherProperty", "manufacturer", "manufacturerId", "supplier", "supplierId"] } : null;
  const collateral = ["component", "wire", "bus", "pin", "component-pin", "port", "net-flag", "net-label"].includes(family) ? ["explicitly-planned-pin-net-and-junction-changes"] : [];
  if (family === "component") { collateral.push("target-owned-pins-and-attributes", "explicitly-planned-following-wire-geometry"); }
  const limitations = ["compiler-only-until-connected-mutation-admission", "all-unlisted-document-state-must-remain-unchanged"];
  if (family === "wire") { limitations.push("public-wire-enumerators-hide-rpc-failure-use-document-source", "compiled-topology-proof-required"); }
  if (requiredPreservation !== null) { limitations.push("complete-source-property-merge-required-before-component-modify"); }
  if (operation.documentType === 2 && ["polygon", "rectangle"].includes(family)) { limitations.push("known-symbol-editor-shape-manager-misrouting-needs-adapter-validation"); }
  if (["port", "net-flag"].includes(family)) { limitations.push("default-library-symbol-associations-must-be-captured-and-proven"); }
  let identity: CompiledSchematicOperation["effect"]["identity"] = "preserve";
  if (deleting) { identity = "delete"; }
  if (creating) { identity = "create"; }
  return { profile: SCHEMATIC_OPERATION_PROFILE, operation: structuredClone(operation), id: operation.id, action: operation.action, documentType: operation.documentType, call: { api: definition.api, method, args }, resultKind, beforeReads, afterReads, expectedFields: Object.entries(values).map(([field, value]) => expected(family, field, value)), inverse, effect: { family, target, identity, fields, collateral }, requiredPreservation, limitations };
}

function referenceFamily(action: string): string | undefined {
  const family = action.split(".")[1];
  if (family === "port" || family === "net-flag") { return "component"; }
  if (family === "net-label") { return "attribute"; }
  return family;
}
export const schematicOperationBatchSchema = z.object({ operations: z.array(schematicOperationSchema).min(1).max(256) }).strict().superRefine((batch, context) => {
  const prior = new Map<string, SchematicOperation>();
  const documentType = batch.operations[0]?.documentType;
  for (const operation of batch.operations) {
    if (operation.documentType !== documentType) { context.addIssue({ code: "custom", message: "A schematic batch must use one document type and active document." }); }
    if (prior.has(operation.id)) { context.addIssue({ code: "custom", message: "Duplicate operation ID." }); }
    if ("target" in operation && "resultOf" in operation.target) {
      const creator = prior.get(operation.target.resultOf);
      if (creator === undefined || !creator.action.endsWith(".create") || referenceFamily(creator.action) !== referenceFamily(operation.action)) {
        context.addIssue({ code: "custom", message: "Result reference must name a prior create of the same native family." });
      }
    }
    prior.set(operation.id, operation);
  }
});
export function compileSchematicOperationBatch(input: unknown): CompiledSchematicOperation[] {
  return schematicOperationBatchSchema.parse(input).operations.map(compileSchematicOperation);
}

/** Materialize both the call and its full merged expectations from journal-owned native properties. */
export function prepareSchematicOperation(input: unknown, beforeComponents: Readonly<Record<string, SchematicPreservedProperties>> = {}): CompiledSchematicOperation {
  const operation = schematicOperationSchema.parse(input);
  const compiled = compileSchematicOperation(operation);
  if (operation.action === "sch.component.modify") {
    if (!Object.hasOwn(beforeComponents, operation.id)) { throw new Error("Complete schematic component property baseline is required."); }
    const baseline = preservedProperties.parse(beforeComponents[operation.id]);
    const patch = { ...baseline, ...operation.patch, otherProperty: { ...baseline.otherProperty, ...operation.patch.otherProperty } };
    compiled.call.args[1] = literal(patch);
    compiled.expectedFields = Object.entries(patch).map(([field, value]) => expected("component", field, value));
  }
  return compiled;
}

/** Preserved records must be derived from the executor's journal-bound complete source, not the filtered getter. */
export function buildSchematicOperationCallExpression(input: unknown, createdIds: Readonly<Record<string, string>> = {}, beforeComponents: Readonly<Record<string, SchematicPreservedProperties>> = {}): string {
  const compiled = prepareSchematicOperation(input, beforeComponents);
  if (compiled.action.startsWith("sch.net-label.") || compiled.action === "sch.component-pin.no-connect") { throw new Error("This operation requires the fixed native electrical adapter, not the no-op or unacknowledged public wrapper."); }
  function argumentExpression(argument: DesignArgument): string {
    switch (argument.kind) {
      case "literal": { return JSON.stringify(argument.value); }
      case "target": {
        let resolved: string | undefined;
        if ("primitiveId" in argument.target) { resolved = argument.target.primitiveId; }
        else if (Object.hasOwn(createdIds, argument.target.resultOf)) { resolved = createdIds[argument.target.resultOf]; }
        return JSON.stringify(primitiveId.parse(resolved));
      }
      case "object": { return `{${Object.entries(argument.properties).map(([key, value]) => `${JSON.stringify(key)}:${argumentExpression(value)}`).join(",")}}`; }
      case "polygon": { throw new Error("PCB polygon arguments are not schematic arguments."); }
      case "undefined": { throw new Error("Schematic arguments must be explicit."); }
      default: { throw new Error("Unreviewed schematic argument descriptor."); }
    }
  }
  return `eda.${compiled.call.api}.${compiled.call.method}(${compiled.call.args.map(argumentExpression).join(",")})`;
}

export const SCHEMATIC_OPERATION_UNIMPLEMENTED = Object.freeze([
  "sch.net.*: installed SCH_Net enumerators are no-op empty stubs; connectivity is verified through compiled topology",
  "sch.junction.*: no standalone junction API; explicit wire vertices require native connectivity proof",
  "sch.attribute.create/delete: generic methods and createNetLabel are no-op stubs; net labels use the fixed native electrical adapter",
  "sch.component-pin.no-connect: public setter/done rewrites full pin state without acknowledgment; use the fixed native electrical adapter",
  "sch.component-pin.pose/shape/type: documented component-pin setters are no-op stubs",
]);
