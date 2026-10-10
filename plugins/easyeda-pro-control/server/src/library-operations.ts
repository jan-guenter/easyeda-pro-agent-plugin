import { z } from "zod";
import type { DesignArgument, DesignJson } from "./design-operations.ts";
import { encodeModelTransform, modelTransformSchema } from "./model-transform-action.ts";

/** Reviewed positional APIs, not an admission or persistence certificate. */
export const LIBRARY_OPERATION_PROFILE = "easyeda-pro-control.library-operations.v1";
export const MANAGED_FILE_MAX_BYTES = 67_108_864;
const id = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/u);
const uuid = z.string().min(1).max(256);
const name = z.string().min(1).max(512);
const text = z.string().max(65_536);
const fileName = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_. -]{0,127}$/u).refine((value) => !value.includes("..") && !value.endsWith(".") && !value.endsWith(" "));
const identity = z.union([z.object({ uuid }).strict(), z.object({ resultOf: id }).strict()]);
const classification = z.array(name).max(2);
const symbolType = z.union([z.literal(2), z.literal(18), z.literal(19), z.literal(20), z.literal(21), z.literal(22), z.literal(25), z.literal(31), z.literal(17)]);
const associationIdentity = z.object({ uuid, libraryUuid: uuid }).strict();
const association = z.object({ symbol: associationIdentity.optional(), footprint: associationIdentity.nullable().optional(), model3D: associationIdentity.nullable().optional() }).strict();
const propertyScalar = z.union([text, z.number(), z.boolean(), z.null()]);
const propertyMap = z.record(name, propertyScalar).refine((value) => Object.keys(value).length <= 256 && !Object.keys(value).some((key) => ["__proto__", "prototype", "constructor"].includes(key)));
const deviceProperty = z.object({ name: text.nullable().optional(), designator: text.optional(), addIntoBom: z.boolean().optional(), addIntoPcb: z.boolean().optional(), net: text.optional(), manufacturer: text.nullable().optional(), manufacturerId: text.nullable().optional(), supplier: text.nullable().optional(), supplierId: text.nullable().optional(), otherProperty: propertyMap.optional() }).strict();
const metadataPatch = z.object({ name: name.optional(), classification: classification.nullable().optional(), description: text.nullable().optional() }).strict();
const nonemptyPatch = (value: object): boolean => Object.keys(value).length > 0;

/** This is an artifact identity, never a filesystem path or a download URL. */
export const managedFileInputSchema = z.object({
  artifactId: id,
  sha256: z.string().regex(/^[a-f0-9]{64}$/u),
  bytes: z.number().int().min(1).max(MANAGED_FILE_MAX_BYTES),
  name: fileName,
  mime: z.string().max(127).regex(/^[A-Za-z0-9!#$&^_.+-]+\/[A-Za-z0-9!#$&^_.+-]+$/u),
}).strict();

// oxlint-disable-next-line typescript/explicit-function-return-type -- Preserve literal discriminators when composing strict schemas.
function assetOperations<const Family extends "symbol" | "footprint" | "device" | "model3d">(family: Family) {
  return [
    z.object({ id, action: z.literal(`library.${family}.get`), libraryUuid: uuid, target: identity }).strict(),
    z.object({ id, action: z.literal(`library.${family}.delete`), libraryUuid: uuid, target: identity }).strict(),
    z.object({ id, action: z.literal(`library.${family}.copy`), libraryUuid: uuid, target: identity, targetLibraryUuid: uuid, classification: classification.optional(), name }).strict(),
  ] as const;
}
// oxlint-disable-next-line typescript/explicit-function-return-type -- Preserve literal discriminators when composing strict schemas.
function sourceOperations<const Family extends "symbol" | "footprint">(family: Family) {
  return [
    z.object({ id, action: z.literal(`library.${family}.source.replace`), libraryUuid: uuid, target: identity, documentSource: z.string().min(1).max(1_048_576) }).strict(),
    z.object({ id, action: z.literal(`library.${family}.open`), libraryUuid: uuid, target: identity, splitScreenId: uuid.optional() }).strict(),
  ] as const;
}
// oxlint-disable-next-line typescript/explicit-function-return-type -- Preserve literal discriminators when composing strict schemas.
function simpleExport<const Action extends string>(action: Action) {
  return z.object({ id, action: z.literal(action), fileName, maxBytes: z.number().int().min(1).max(MANAGED_FILE_MAX_BYTES) }).strict();
}
const exportOptions = { fileName, maxBytes: z.number().int().min(1).max(MANAGED_FILE_MAX_BYTES) };
/* oxlint-disable unicorn/max-nested-calls -- Declarative Zod nesting mirrors the exact native option objects; retaining each action's strict schema together makes its positional contract reviewable. */
const bomOptions = { ...exportOptions, fileType: z.enum(["xlsx", "csv"]), template: name.optional(), filterOptions: z.array(z.object({ property: name, includeValue: z.union([z.boolean(), text]) }).strict()).max(256).optional(), statistics: z.array(name).max(256).optional(), property: z.array(name).max(256).optional() };
const netlistOptions = { ...exportOptions, fileType: z.enum(["Allegro", "PADS", "Protel2", "JLCEDA", "EasyEDA", "DISA", "DSNET"]) };
const primitiveSources = ["Pad", "Via", "Track", "Text", "Image", "Dimension", "BoardOutline", "BoardCutout", "CopperFilled", "SolidRegion", "FPCStiffener", "Line", "PlaneZone", "ComponentProperty", "ComponentSilkscreen", "TearDrop"] as const;

export const libraryOperationSchema = z.discriminatedUnion("action", [
  ...assetOperations("symbol"), ...assetOperations("footprint"), ...assetOperations("device"), ...assetOperations("model3d"),
  ...sourceOperations("symbol"), ...sourceOperations("footprint"),
  z.object({ id, action: z.literal("library.symbol.create"), libraryUuid: uuid, name, classification: classification.optional(), symbolType, description: text.optional() }).strict(),
  z.object({ id, action: z.literal("library.footprint.create"), libraryUuid: uuid, name, classification: classification.optional(), description: text.optional() }).strict(),
  z.object({ id, action: z.literal("library.device.create"), libraryUuid: uuid, name, classification: classification.optional(), association: association.extend({ symbol: associationIdentity, footprint: associationIdentity.optional(), model3D: associationIdentity.optional() }).strict(), description: text.optional(), property: deviceProperty.optional() }).strict(),
  z.object({ id, action: z.literal("library.model3d.create"), libraryUuid: uuid, file: managedFileInputSchema, classification: classification.optional(), unit: z.enum(["mm", "cm", "m", "mil", "inch"]) }).strict(),
  z.object({ id, action: z.literal("library.symbol.modify"), libraryUuid: uuid, target: identity, patch: metadataPatch.refine(nonemptyPatch, "Empty patch.") }).strict(),
  z.object({ id, action: z.literal("library.footprint.modify"), libraryUuid: uuid, target: identity, patch: metadataPatch.refine(nonemptyPatch, "Empty patch.") }).strict(),
  z.object({ id, action: z.literal("library.model3d.modify"), libraryUuid: uuid, target: identity, patch: metadataPatch.refine(nonemptyPatch, "Empty patch.") }).strict(),
  z.object({ id, action: z.literal("library.device.modify"), libraryUuid: uuid, target: identity, patch: metadataPatch.extend({ association: association.refine(nonemptyPatch).optional(), property: deviceProperty.refine(nonemptyPatch).optional() }).strict().refine(nonemptyPatch, "Empty patch.") }).strict(),
  z.object({ id, action: z.literal("library.device.model-transform"), libraryUuid: uuid, target: z.object({ uuid }).strict(), transform: modelTransformSchema, inheritedInstances: z.array(z.object({ documentUuid: uuid, documentType: z.enum(["PCB", "SCH_PAGE"]), componentUuid: uuid }).strict()).max(20_000) }).strict(),
  z.object({ id, action: z.literal("project.create"), name, projectName: z.string().regex(/^[A-Za-z0-9-]{1,128}$/u).optional(), teamUuid: uuid, folderUuid: uuid.optional(), description: text.optional() }).strict(),
  z.object({ id, action: z.literal("project.open"), target: identity }).strict(),
  z.object({ id, action: z.literal("document.open"), target: identity, splitScreenId: uuid.optional() }).strict(),
  z.object({ id, action: z.literal("document.activate"), tabId: uuid }).strict(),
  z.object({ id, action: z.literal("document.close"), tabId: uuid }).strict(),
  z.object({ id, action: z.literal("document.pcb.create"), boardName: name.optional() }).strict(),
  z.object({ id, action: z.literal("document.schematic.create"), boardName: name.optional() }).strict(),
  z.object({ id, action: z.literal("document.page.create"), schematic: identity }).strict(),
  z.object({ id, action: z.literal("document.pcb.copy"), target: identity, boardName: name.optional() }).strict(),
  z.object({ id, action: z.literal("document.schematic.copy"), target: identity, boardName: name.optional() }).strict(),
  z.object({ id, action: z.literal("document.page.copy"), target: identity, schematic: identity }).strict(),
  z.object({ id, action: z.literal("document.pcb.rename"), target: identity, name }).strict(),
  z.object({ id, action: z.literal("document.schematic.rename"), target: identity, name }).strict(),
  z.object({ id, action: z.literal("document.page.rename"), target: identity, name }).strict(),
  z.object({ id, action: z.literal("document.pcb.delete"), target: identity }).strict(),
  z.object({ id, action: z.literal("document.schematic.delete"), target: identity }).strict(),
  z.object({ id, action: z.literal("document.page.delete"), target: identity }).strict(),
  z.object({ id, action: z.literal("document.pcb.save"), target: identity }).strict(),
  z.object({ id, action: z.literal("document.schematic.save"), target: identity }).strict(),
  z.object({ id, action: z.literal("export.pcb.gerber"), ...exportOptions, colorSilkscreen: z.boolean(), unit: z.enum(["mm", "inch"]), digitalFormat: z.object({ integerNumber: z.number().int().min(1).max(6), decimalNumber: z.number().int().min(1).max(6) }).strict(), other: z.object({ metallicDrillingInformation: z.boolean(), nonMetallicDrillingInformation: z.boolean(), drillTable: z.boolean(), flyingProbeTestingFile: z.boolean() }).strict(), layers: z.array(z.object({ layerId: z.number().int().min(1).max(100), isMirror: z.boolean() }).strict()).min(1).max(100), objects: z.array(z.enum(primitiveSources)).min(1).max(17) }).strict(),
  z.object({ id, action: z.literal("export.pcb.model3d"), ...exportOptions, fileType: z.enum(["step", "obj"]), elements: z.array(z.enum(["Component Model", "Via", "Silkscreen", "Wire In Signal Layer"])).max(4), modelMode: z.enum(["Outfit", "Parts"]), autoGenerateModels: z.boolean() }).strict(),
  z.object({ id, action: z.literal("export.pcb.pick-and-place"), ...exportOptions, fileType: z.enum(["xlsx", "csv"]), unit: z.enum(["mm", "mil"]) }).strict(),
  z.object({ id, action: z.literal("export.pcb.bom"), ...bomOptions }).strict(),
  z.object({ id, action: z.literal("export.schematic.bom"), ...bomOptions }).strict(),
  z.object({ id, action: z.literal("export.pcb.netlist"), ...netlistOptions }).strict(),
  z.object({ id, action: z.literal("export.schematic.netlist"), ...netlistOptions }).strict(),
  z.object({ id, action: z.literal("export.pcb.test-points"), ...exportOptions, fileType: z.enum(["xlsx", "csv"]) }).strict(),
  z.object({ id, action: z.literal("export.pcb.ipc2581c"), ...exportOptions, fileType: z.enum(["xml", "cvg", "2581"]), unit: z.enum(["inch", "mm"]), oemNumber: z.enum(["Device", "Manufacturer Part", "Supplier Part", "Comment"]) }).strict(),
  z.object({ id, action: z.literal("export.schematic.document"), ...exportOptions, fileType: z.enum(["PDF", "PNG", "SVG"]), object: z.enum(["All Schematic", "Current Schematic", "Current Schematic Page"]), typeSpecificParams: z.object({ theme: z.enum(["Default", "White on Black", "Black on White"]).optional(), lineWidth: z.enum(["Default", "Always 1px", "Follow the Zoom Change"]).optional(), displayAttributesAsMenu: z.boolean().optional() }).strict().optional(), objectSpecificParams: z.object({ range: z.union([z.literal("All"), z.tuple([z.number().int().positive(), z.number().int().positive()])]), outputMethod: z.enum(["Merged sheet", "Separated sheet"]) }).strict().optional() }).strict(),
  simpleExport("export.pcb.pdf"), simpleExport("export.pcb.dxf"), simpleExport("export.pcb.flying-probe"), simpleExport("export.pcb.ipcd356a"), simpleExport("export.pcb.odb"), simpleExport("export.pcb.dsn"), simpleExport("export.pcb.autoroute-json"), simpleExport("export.pcb.autoroute-jrouter"), simpleExport("export.pcb.autolayout-json"), simpleExport("export.pcb.altium"), simpleExport("export.pcb.pads"), simpleExport("export.pcb.info"), simpleExport("export.pcb.idx"), simpleExport("export.schematic.simulation"),
]).superRefine((operation, context) => {
  // The modify API permits null deletion; the create contract does not.
  if (operation.action === "library.device.create" && operation.property && (Object.values(operation.property).some((value) => value === null) || Object.values(operation.property.otherProperty ?? {}).some((value) => value === null))) {
    context.addIssue({ code: "custom", message: "Device creation properties cannot contain null deletion values." });
  }
  if (operation.action === "export.schematic.document" && Array.isArray(operation.objectSpecificParams?.range) && operation.objectSpecificParams.range[0] > operation.objectSpecificParams.range[1]) {
    context.addIssue({ code: "custom", message: "Reversed sheet range." });
  }
});
/* oxlint-enable unicorn/max-nested-calls */

export type LibraryOperation = z.infer<typeof libraryOperationSchema>;
export type LibraryIdentity = z.infer<typeof identity>;
export type ManagedFileInput = z.infer<typeof managedFileInputSchema>;
export type LibraryArgument = DesignArgument | { kind: "identity"; target: LibraryIdentity } | { kind: "managed-file"; file: ManagedFileInput };
export interface LibraryCall { api: string; method: string; args: LibraryArgument[] }
export interface LibraryReadDescriptor extends LibraryCall { purpose: "identity-metadata" | "project-inventory" | "document-inventory" | "editor-tabs" | "complete-document-source" }
export interface CompiledLibraryOperation {
  profile: typeof LIBRARY_OPERATION_PROFILE;
  id: string;
  action: LibraryOperation["action"];
  scope: "library" | "project" | "document" | "export";
  documentTypes: number[] | null;
  target: { identity: LibraryIdentity; libraryUuid: string | null } | null;
  call: LibraryCall;
  resultKind: "identity" | "identities" | "metadata" | "boolean" | "tab-id" | "managed-file";
  beforeReads: LibraryReadDescriptor[];
  afterReads: LibraryReadDescriptor[];
  requiredProofs: string[];
  /** Patch comparison recurses over supplied fields only; native null means cleared, not literal null storage. */
  expectedFields: { field: string; value: DesignJson; authority: "metadata" | "complete-document-source"; comparison: "equals" | "patch-with-null-clears" }[];
  inverse: { kind: "none" | "delete-created" | "restore-metadata-from-before" | "restore-source-from-before" | "checkpoint-and-library-backup-required" | "restore-editor-context"; api: string | null };
  effect: { family: string; identity: "read" | "create" | "preserve" | "delete"; fields: string[]; collateral: string[] };
  contextTransition: "preserve" | "project" | "document" | "close";
  fileTransfer: { direction: "input" | "output"; maxBytes: number; chunkBytes: 262_144; hash: "sha256"; ownership: "executor-managed" } | null;
  limitations: string[];
}

function operationJson(value: unknown): DesignJson {
  if (value === null || typeof value === "string" || typeof value === "boolean") { return value; }
  if (typeof value === "number" && Number.isFinite(value)) { return value; }
  if (Array.isArray(value)) { return value.map((entry) => operationJson(entry)); }
  if (typeof value === "object" && value !== null && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined).map(([key, entry]) => [key, operationJson(entry)]));
  }
  throw new Error("Unserializable typed operation value.");
}
const literal = (value: unknown): LibraryArgument => ({ kind: "literal", value: operationJson(value) });
const optional = (value: unknown): LibraryArgument => value === undefined ? { kind: "undefined" } : literal(value);
const ref = (target: LibraryIdentity): LibraryArgument => ({ kind: "identity", target });
const source: LibraryReadDescriptor = { purpose: "complete-document-source", api: "sys_FileManager", method: "getDocumentSource", args: [] };
const tabs: LibraryReadDescriptor = { purpose: "editor-tabs", api: "dmt_EditorControl", method: "getSplitScreenTree", args: [] };
const project: LibraryReadDescriptor = { purpose: "project-inventory", api: "dmt_Project", method: "getCurrentProjectInfo", args: [] };
const assetApis = { symbol: "lib_Symbol", footprint: "lib_Footprint", device: "lib_Device", model3d: "lib_3DModel" } as const;

function base(operation: LibraryOperation, scope: CompiledLibraryOperation["scope"], call: LibraryCall): CompiledLibraryOperation {
  return {
    profile: LIBRARY_OPERATION_PROFILE, id: operation.id, action: operation.action, scope, documentTypes: null,
    target: "target" in operation ? { identity: operation.target, libraryUuid: "libraryUuid" in operation ? operation.libraryUuid : null } : null,
    call, resultKind: "boolean",
    beforeReads: [], afterReads: [], requiredProofs: ["exact-runtime-and-target-context", "no-incomplete-operation", "journal-before-dispatch", "independent-after-readback"], expectedFields: [],
    inverse: { kind: "checkpoint-and-library-backup-required", api: null },
    effect: { family: operation.action, identity: "preserve", fields: [], collateral: ["all-out-of-scope-records"] }, contextTransition: "preserve", fileTransfer: null,
    limitations: ["A native success return is not durable proof; this descriptor does not enable runtime dispatch."],
  };
}

function compileAsset(operation: LibraryOperation & { libraryUuid: string }): CompiledLibraryOperation {
  const family = operation.action.split(".")[1];
  if (family !== "symbol" && family !== "footprint" && family !== "device" && family !== "model3d") { throw new Error("Unknown library family."); }
  const api = assetApis[family];
  const method = operation.action.split(".").at(-1) ?? "";
  const result = base(operation, "library", { api, method, args: [] });
  result.requiredProofs.push("exact-library-identity-and-write-authority", "library-inventory-and-duplicate-search", "library-backup-before-mutation", "library-persistence-and-reopen");
  result.effect.family = `library.${family}`;
  result.effect.collateral.push("unrelated-library-assets", "placed-device-and-pad-bindings", "project-design-records");
  if ("target" in operation) {
    result.beforeReads.push({ purpose: "identity-metadata", api, method: "get", args: [ref(operation.target), literal(operation.libraryUuid)] });
    result.afterReads.push(...result.beforeReads);
  }
  if (method === "get" && "target" in operation) {
    result.call.args = [ref(operation.target), literal(operation.libraryUuid)];
    result.resultKind = "metadata"; result.effect.identity = "read"; result.inverse = { kind: "none", api: null };
    result.requiredProofs = ["exact-runtime-and-target-context", "exact-library-identity", "bounded-lossless-metadata-result"];
    return result;
  }
  if (operation.action === "library.device.model-transform") {
    result.call = { api: "native-project-message-bus", method: "/PrjDB/device/updateData", args: [] };
    result.requiredProofs.push("checkpoint-bound-complete-device-metadata", "exact-inherited-instance-authority", "single-device-transform-value-delta");
    result.effect.fields = ["attributes.3D Model Transform"];
    result.expectedFields = [{ field: "attributes.3D Model Transform", value: encodeModelTransform(operation.transform), authority: "complete-document-source", comparison: "equals" }];
    result.inverse = { kind: "restore-metadata-from-before", api: "native-project-message-bus" };
    result.limitations.push("Changes the device default for exactly acknowledged inheriting instances; preserves all stored instance records and model bindings. No geometry or collision claim.");
    return result;
  }
  if (method === "delete" && "target" in operation) {
    result.call.args = [ref(operation.target), literal(operation.libraryUuid)]; result.effect.identity = "delete";
    result.requiredProofs.push("no-unapproved-asset-dependants", "exact-target-absence-after-delete");
    return result;
  }
  if (method === "copy" && "targetLibraryUuid" in operation) {
    result.call.args = [ref(operation.target), literal(operation.libraryUuid), literal(operation.targetLibraryUuid), optional(operation.classification), literal(operation.name)];
    result.afterReads = [{ purpose: "identity-metadata", api, method: "get", args: [ref({ resultOf: operation.id }), literal(operation.targetLibraryUuid)] }];
    result.expectedFields = [{ field: "name", value: operation.name, authority: "metadata", comparison: "equals" }];
    result.resultKind = "identity"; result.effect.identity = "create"; result.inverse = { kind: "delete-created", api };
    result.requiredProofs.push("target-library-write-authority", "associated-assets-and-copy-collateral");
    return result;
  }
  if (operation.action === "library.symbol.open" || operation.action === "library.footprint.open") {
    // Pinned dmt symbol open waits on the broken ajaxGetDocData Deferred and
    // Subscribes to tabChange only after opening. The symbol API instead reads
    // The same exact project asset, awaits its native open, then returns the tab.
    result.call = operation.action === "library.symbol.open" ?
      { api: "lib_Symbol", method: "openInEditor", args: [ref(operation.target), literal(operation.libraryUuid), optional(operation.splitScreenId)] } :
      { api: "dmt_EditorControl", method: "openLibraryDocument", args: [literal(operation.libraryUuid), literal("4"), ref(operation.target), optional(operation.splitScreenId)] };
    result.resultKind = "tab-id"; result.contextTransition = "document"; result.inverse = { kind: "restore-editor-context", api: "dmt_EditorControl" };
    result.afterReads.push(tabs, source); result.requiredProofs.push("exact-opened-library-document-context");
    return result;
  }
  if ("documentSource" in operation) {
    result.call = { api, method: "updateDocumentSource", args: [ref(operation.target), literal(operation.libraryUuid), literal(operation.documentSource)] };
    result.documentTypes = [family === "symbol" ? 2 : 4]; result.beforeReads.push(source); result.afterReads.push(source);
    result.requiredProofs.push("active-library-document-matches-target", "complete-source-grammar-and-geometry-validation");
    result.expectedFields = [{ field: "documentSource", value: operation.documentSource, authority: "complete-document-source", comparison: "equals" }];
    result.effect.fields = ["documentSource"]; result.inverse = { kind: "restore-source-from-before", api };
    return result;
  }
  if ("patch" in operation) {
    const patch = operation.patch;
    result.call.args = [ref(operation.target), literal(operation.libraryUuid), optional(patch.name), optional(patch.classification)];
    if (operation.action === "library.device.modify") { result.call.args.push(optional(operation.patch.association)); }
    result.call.args.push(optional(patch.description));
    if (operation.action === "library.device.modify") { result.call.args.push(optional(operation.patch.property)); }
    result.effect.fields = Object.keys(patch);
    result.expectedFields = Object.entries(patch).filter(([, value]) => value !== undefined).map(([field, value]) => ({ field, value: operationJson(value), authority: "metadata", comparison: "patch-with-null-clears" }));
    result.inverse = { kind: "restore-metadata-from-before", api };
    return result;
  }
  if (operation.action === "library.model3d.create") {
    result.call.args = [literal(operation.libraryUuid), { kind: "managed-file", file: operation.file }, optional(operation.classification), literal(operation.unit)];
    result.resultKind = "identities";
    result.fileTransfer = { direction: "input", maxBytes: operation.file.bytes, chunkBytes: 262_144, hash: "sha256", ownership: "executor-managed" };
    result.requiredProofs.push("artifact-receipt-and-exact-byte-hash", "every-returned-model-identity", "model-geometry-and-units");
    result.limitations.push("The native importer can create several model UUIDs; never collapse the result to its first entry.");
  } else if (operation.action === "library.symbol.create" || operation.action === "library.footprint.create" || operation.action === "library.device.create") {
    result.call.args = [literal(operation.libraryUuid), literal(operation.name), optional(operation.classification)];
    if (operation.action === "library.symbol.create") { result.call.args.push(literal(operation.symbolType)); }
    if (operation.action === "library.device.create") { result.call.args.push(literal(operation.association)); }
    result.call.args.push(optional(operation.description));
    if (operation.action === "library.device.create") { result.call.args.push(optional(operation.property)); }
    result.resultKind = "identity";
    result.afterReads.push({ purpose: "identity-metadata", api, method: "get", args: [ref({ resultOf: operation.id }), literal(operation.libraryUuid)] });
    result.expectedFields = [{ field: "name", value: operation.name, authority: "metadata", comparison: "equals" }];
  } else { throw new Error("Uncompiled library operation."); }
  result.effect.identity = "create"; result.inverse = { kind: "delete-created", api };
  return result;
}

const documentApis = {
  pcb: { api: "dmt_Pcb", create: "createPcb", copy: "copyPcb", rename: "modifyPcbName", delete: "deletePcb", get: "getPcbInfo", all: "getAllPcbsInfo", type: 3 },
  schematic: { api: "dmt_Schematic", create: "createSchematic", copy: "copySchematic", rename: "modifySchematicName", delete: "deleteSchematic", get: "getSchematicInfo", all: "getAllSchematicsInfo", type: 1 },
  page: { api: "dmt_Schematic", create: "createSchematicPage", copy: "copySchematicPage", rename: "modifySchematicPageName", delete: "deleteSchematicPage", get: "getSchematicPageInfo", all: "getAllSchematicPagesInfo", type: 1 },
} as const;

function compileLifecycle(operation: LibraryOperation): CompiledLibraryOperation {
  const result = base(operation, operation.action.startsWith("project.") ? "project" : "document", { api: "dmt_EditorControl", method: "", args: [] });
  result.beforeReads = [project, tabs]; result.afterReads = [project, tabs];
  result.requiredProofs.push("complete-project-document-inventory", "durable-baseline-and-no-unapproved-dirty-document", "save-close-reopen-persistence");
  if (operation.action === "project.create") {
    result.call = { api: "dmt_Project", method: "createProject", args: [literal(operation.name), optional(operation.projectName), literal(operation.teamUuid), optional(operation.folderUuid), optional(operation.description)] };
    result.resultKind = "identity"; result.effect.identity = "create";
    result.afterReads.push({ purpose: "identity-metadata", api: "dmt_Project", method: "getProjectInfo", args: [ref({ resultOf: operation.id })] });
    result.limitations.push("Project destination is explicit; native project deletion is a stub, so automatic create rollback is unavailable.");
    return result;
  }
  if (operation.action === "project.open") {
    result.call = { api: "dmt_Project", method: "openProject", args: [ref(operation.target)] };
    result.contextTransition = "project"; result.requiredProofs.push("proven-clean-project-before-open");
    result.limitations.push("Native openProject discards unsaved state; a caller assertion is not proof that every open document is clean.");
    result.inverse = { kind: "restore-editor-context", api: "dmt_Project" }; return result;
  }
  if (operation.action === "document.open") {
    result.call = { api: "dmt_EditorControl", method: "openDocument", args: [ref(operation.target), optional(operation.splitScreenId)] };
    result.resultKind = "tab-id"; result.contextTransition = "document"; result.inverse = { kind: "restore-editor-context", api: "dmt_EditorControl" }; return result;
  }
  if (operation.action === "document.activate" || operation.action === "document.close") {
    result.call = { api: "dmt_EditorControl", method: operation.action === "document.activate" ? "activateDocument" : "closeDocument", args: [literal(operation.tabId)] };
    result.contextTransition = operation.action === "document.activate" ? "document" : "close";
    result.requiredProofs.push("exact-tab-document-binding");
    if (operation.action === "document.close") { result.requiredProofs.push("proven-clean-target-before-close", "no-unresolved-save-or-discard-dialog"); }
    result.inverse = { kind: "restore-editor-context", api: "dmt_EditorControl" }; return result;
  }
  const family = operation.action.split(".")[1];
  const verb = operation.action.split(".")[2];
  if (family !== "pcb" && family !== "schematic" && family !== "page") { throw new Error("Unknown document family."); }
  const entry = documentApis[family];
  const all: LibraryReadDescriptor = { purpose: "document-inventory", api: entry.api, method: entry.all, args: [] };
  result.beforeReads.push(all); result.afterReads.push(all);
  if (verb === "save" && "target" in operation) {
    result.call = { api: family === "pcb" ? "pcb_Document" : "sch_Document", method: "save", args: family === "pcb" ? [ref(operation.target)] : [] };
    result.documentTypes = [entry.type]; result.beforeReads.push(source); result.afterReads.push(source);
    result.requiredProofs.push("active-document-matches-explicit-target", "no-ambiguous-dispatch-or-collateral-mismatch", "independent-logical-database-and-reopened-proof");
    return result;
  }
  if (verb !== "create" && verb !== "copy" && verb !== "rename" && verb !== "delete") { throw new Error("Unknown document operation."); }
  result.call = { api: entry.api, method: entry[verb], args: [] };
  if ("target" in operation) {
    result.call.args.push(ref(operation.target));
    result.beforeReads.push({ purpose: "identity-metadata", api: entry.api, method: entry.get, args: [ref(operation.target)] });
  }
  if ("schematic" in operation) { result.call.args.push(ref(operation.schematic)); }
  else if (verb === "create" || verb === "copy") { result.call.args.push(optional("boardName" in operation ? operation.boardName : undefined)); }
  if ("name" in operation) { result.call.args.push(literal(operation.name)); result.expectedFields.push({ field: "name", value: operation.name, authority: "metadata", comparison: "equals" }); }
  if (verb === "delete") { result.effect.identity = "delete"; }
  else if (verb === "rename") { result.effect.identity = "preserve"; }
  else { result.effect.identity = "create"; }
  result.resultKind = result.effect.identity === "create" ? "identity" : "boolean";
  if (result.effect.identity === "create") {
    result.afterReads.push({ purpose: "identity-metadata", api: entry.api, method: entry.get, args: [ref({ resultOf: operation.id })] });
    result.inverse = { kind: "delete-created", api: entry.api };
  } else if ("target" in operation) { result.afterReads.push({ purpose: "identity-metadata", api: entry.api, method: entry.get, args: [ref(operation.target)] }); }
  result.requiredProofs.push("associated-board-page-and-library-collateral");
  return result;
}

const simpleExports = {
  "export.pcb.pdf": "getPdfFile", "export.pcb.dxf": "getDxfFile", "export.pcb.flying-probe": "getFlyingProbeTestFile", "export.pcb.ipcd356a": "getIpcD356AFile", "export.pcb.odb": "getOpenDatabaseDoublePlusFile", "export.pcb.dsn": "getDsnFile", "export.pcb.autoroute-json": "getAutoRouteJsonFile", "export.pcb.autoroute-jrouter": "getAutoRouteJsonFileForJRouter", "export.pcb.autolayout-json": "getAutoLayoutJsonFile", "export.pcb.altium": "getAltiumDesignerFile", "export.pcb.pads": "getPadsFile", "export.pcb.info": "getPcbInfoFile", "export.pcb.idx": "getIdxFile", "export.schematic.simulation": "getSimulationNetlistFile",
} as const;

function compileExport(operation: Extract<LibraryOperation, { fileName: string; maxBytes: number }>): CompiledLibraryOperation {
  const api = operation.action.startsWith("export.pcb.") ? "pcb_ManufactureData" : "sch_ManufactureData";
  const result = base(operation, "export", { api, method: "", args: [literal(operation.fileName)] });
  result.resultKind = "managed-file"; result.documentTypes = [api === "pcb_ManufactureData" ? 3 : 1]; result.effect.identity = "read";
  result.inverse = { kind: "none", api: null }; result.beforeReads = [source]; result.afterReads = [source];
  result.fileTransfer = { direction: "output", maxBytes: operation.maxBytes, chunkBytes: 262_144, hash: "sha256", ownership: "executor-managed" };
  result.requiredProofs.push("real-nonempty-File-result", "size-type-name-and-exact-byte-validation", "bounded-lossless-chunk-transfer", "exclusive-managed-artifact-write-and-receipt", "unchanged-design-source-and-context");
  result.limitations.push("File generation is not fabrication approval or submission. No saveFile, download, arbitrary output path or browser URL is called.");
  const simpleMethod = Object.entries(simpleExports).find(([action]) => action === operation.action)?.[1];
  if (simpleMethod !== undefined) {
    result.call.method = simpleMethod;
    if (operation.action === "export.pcb.pdf") { result.limitations.push("Installed adapter ignores most PDF options; this operation exposes only the filename."); }
    if (operation.action === "export.pcb.odb") { result.limitations.push("Installed adapter overwrites caller drill options with defaults; custom drill options are not exposed."); }
    return result;
  }
  // oxlint-disable-next-line typescript/switch-exhaustiveness-check -- The preceding exact fixed-method table handles every simple export; default rejects any catalog/compiler disagreement.
  switch (operation.action) {
    case "export.pcb.gerber": { result.call.method = "getGerberFile"; result.call.args.push(literal(operation.colorSilkscreen), literal(operation.unit), literal(operation.digitalFormat), literal(operation.other), literal(operation.layers), literal(operation.objects)); break;
    }
    case "export.pcb.model3d": { result.call.method = "get3DFile"; result.call.args.push(literal(operation.fileType), literal(operation.elements), literal(operation.modelMode), literal(operation.autoGenerateModels)); result.limitations.push("STEP output includes only components imported with STEP models; inspect geometry and units independently."); break;
    }
    case "export.pcb.pick-and-place": { result.call.method = "getPickAndPlaceFile"; result.call.args.push(literal(operation.fileType), literal(operation.unit)); break;
    }
    case "export.pcb.bom": case "export.schematic.bom": { result.call.method = "getBomFile"; result.call.args.push(literal(operation.fileType), optional(operation.template), optional(operation.filterOptions), optional(operation.statistics), optional(operation.property)); break;}
    case "export.pcb.netlist": case "export.schematic.netlist": { result.call.method = "getNetlistFile"; result.call.args.push(literal(operation.fileType)); break;}
    case "export.pcb.test-points": { result.call.method = "getTestPointFile"; result.call.args.push(literal(operation.fileType)); break;
    }
    case "export.pcb.ipc2581c": { result.call.method = "getIpc2581CFile"; result.call.args.push(literal(operation.fileType), literal(operation.unit), literal(operation.oemNumber)); result.limitations.push("The adapter JSON-stringifies the source; validate the actual generated format before using it as IPC-2581."); break;
    }
    case "export.schematic.document": { result.call.method = "getExportDocumentFile"; result.call.args.push(literal(operation.fileType), optional(operation.typeSpecificParams), literal(operation.object), optional(operation.objectSpecificParams)); break;
    }
    default: { throw new Error("Uncompiled export operation.");
    }
  }
  return result;
}

export function compileLibraryOperation(input: unknown): CompiledLibraryOperation {
  const operation = libraryOperationSchema.parse(input);
  if ("libraryUuid" in operation) { return compileAsset(operation); }
  if ("fileName" in operation) { return compileExport(operation); }
  return compileLifecycle(operation);
}

/** Native stubs and dialog-only gaps are discoverable, never dispatched as completed operations. */
export const LIBRARY_OPERATION_GAPS = [
  { action: "project.rename", api: "dmt_Project", method: "modifyProjectFriendlyName", status: "native-stub" },
  { action: "project.description.modify", api: "dmt_Project", method: "modifyProjectDescription", status: "native-stub" },
  { action: "project.copy", api: "dmt_Project", method: "copyProject", status: "native-stub" },
  { action: "project.delete", api: "dmt_Project", method: "deleteProject", status: "native-stub" },
  { action: "library.device.source.replace", api: "lib_Device", method: "updateDocumentSource", status: "no-public-method" },
  { action: "library.model3d.source.replace", api: "lib_3DModel", method: "updateDocumentSource", status: "no-public-method" },
  { action: "eco.schematic-to-pcb", api: "pcb_Document", method: "importChanges", status: "visible-dialog-gate" },
  { action: "export.pcb.interactive-bom", api: "pcb_ManufactureData", method: "getInteractiveBomFile", status: "unverified-native-file-result" },
] as const;

export function listLibraryOperationCapabilities(): { action: string; status: "typed-descriptor-awaiting-executor-validation" | typeof LIBRARY_OPERATION_GAPS[number]["status"] }[] {
  return [
    ...libraryOperationSchema.options.map((schema) => ({ action: schema.shape.action.value, status: "typed-descriptor-awaiting-executor-validation" as const })),
    ...LIBRARY_OPERATION_GAPS.map(({ action, status }) => ({ action, status })),
  ];
}
