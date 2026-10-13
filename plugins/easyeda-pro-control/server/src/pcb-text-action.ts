import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import { buildReviewedNativeSourceMerge } from "./design-native-adapter.ts";
import type { DesignNativeAdapter } from "./design-native-adapter.ts";
import { compareDocumentSources } from "./document-source.ts";
import type { NativeSourceDelta, NativeSourceObject, NativeSourceSnapshot } from "./document-source.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";
import { buildPcbTextRuntime } from "./pcb-text-runtime.ts";

export const PCB_TEXT_ACTION_PROFILE = "easyeda-pro-control.pcb-standalone-text.v1";
const id = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/u);
const nativeId = z.string().regex(/^[a-f0-9]{16}$/u);
// Refuse precision that the pinned four-decimal native encoder cannot retain;
// Do not round, coerce or normalize either requested or baseline coordinates.
const scalar = z.number().min(-10_000_000).max(10_000_000).refine((value) =>
  !Object.is(value, -0) && Math.round(value * 10_000) / 10_000 === value, "Expected an exact four-decimal native scalar.");
// This deliberately small alphabet is present in the pinned built-in stroke
// Font; no custom-font cache, formula substitution or multiline layout is used.
const text = z.string().min(1).max(256).regex(/^[A-Za-z0-9 ._-]+$/u).regex(/[A-Za-z0-9]/u);
const patchSchema = z.object({ x: scalar.optional(), y: scalar.optional(), text: text.optional() }).strict().refine((patch) =>
  Object.values(patch).length > 0 && Object.values(patch).every((value) => value !== undefined), "Expected explicit nonempty text patch values.");
export const pcbTextOperationSchema = z.object({ id, action: z.literal("pcb.text.modify"),
  target: z.object({ primitiveId: nativeId }).strict(), patch: patchSchema }).strict();
export const pcbTextCreateFieldsSchema = z.object({ x: scalar, y: scalar, text,
  fontSize: scalar.refine((value) => value > 0), strokeWidth: scalar.refine((value) => value > 0) }).strict()
  .refine((body) => body.strokeWidth < body.fontSize, "Text stroke must be smaller than its font size.");
export type PcbTextOperation = z.infer<typeof pcbTextOperationSchema>;
export function compilePcbTextOperation(input: unknown): { profile: typeof PCB_TEXT_ACTION_PROFILE; id: string;
  action: "pcb.text.modify"; documentType: 3; resultKind: "boolean"; operation: PcbTextOperation } {
  const operation = pcbTextOperationSchema.parse(input);
  return { profile: PCB_TEXT_ACTION_PROFILE, id: operation.id, action: operation.action, documentType: 3, resultKind: "boolean", operation };
}

// PCB 3.2.149.5378b690 SHA-256 65401cdc0a8f244db2ff2d8da88fd835b6e1fb3a3ecdbcfd975781502cb04b54:
// STRING field table 3969387; S4 decoder 4002049; s3 encoder 4435183;
// PCB onString 2256122. S4 produces key="", showKey=false, showValue=true,
// Without a parent. ATTR and inherited component text are different records.
// Bold/italic encode as numeric zero. The selected profile excludes decoder
// Fallbacks (missing coordinates, custom fonts, reverse expansion and layer remap).
// Pinned tW458223/Jr.addText7891151 and defaultText8152657 use #000000.
// S4 decodes it through ee.of3 and s3 emits it unchanged. It is NOT equivalent
// To null: getSilkColor5873069 marks only absent color as followDefault. Admit
// Both exact representations, preserving the original scalar without coercion.
const stringBodySchema = z.object({ partitionId: z.literal(""), groupId: z.literal(0), layerId: z.literal(3),
  x: scalar, y: scalar, text, fontFamily: z.literal("default"), fontSize: scalar.refine((value) => value > 0),
  strokeWidth: scalar.refine((value) => value > 0), bold: z.literal(0), italic: z.literal(0),
  origin: z.literal("LEFT_BOTTOM"), angle: z.literal(0), reverse: z.literal(false), expansion: z.literal(0),
  mirror: z.literal(false), locked: z.boolean(), zIndex: z.number().int().min(-1), specialColor: z.union([z.null(), z.literal("#000000")]) }).strict()
  .refine((body) => body.strokeWidth < body.fontSize, "Text stroke must be smaller than its font size.");
const panelDimension = z.number().positive();
const panelQuantity = z.number().int().min(1).max(20_000);
const panelStamp = z.object({ on: z.boolean(), stampHoleGroupQuantity: panelQuantity, stampHoleDiameter: panelDimension,
  stampHoleQuantityPerGroup: panelQuantity, stampHoleSpacing: panelDimension }).strict();
const panelSide = z.object({ on: z.boolean(), sideHeight: panelDimension, positionHoleDiameter: panelDimension,
  markDiameter: panelDimension, markExpansion: panelDimension }).strict();
const disabledPanel = z.object({ on: z.literal(false), row: z.literal(1), column: z.literal(1), rowSpacing: z.literal(0),
  columnSpacing: z.literal(0), onlyOutline: z.literal(true), horizontalStamp: panelStamp, verticalStamp: panelStamp,
  horizontalSize: panelSide, verticalSize: panelSide }).strict();
// Native xV.build 5861127 unconditionally publishes autoFill and, for type 3,
// Applies panelization then publishes HistoryFlushService. Existing generated
// Copper refusals remain intact. POUR is additionally unadmitted here until a
// Text-only derived-state proof is reviewed; this is not a claim that every
// Text edit rebuilds copper. No decoder or geometry guard is weakened.
const supportedRecords = new Set(["CANVAS", "LAYER", "LAYER_PHYS", "ACTIVE_LAYER", "NET", "RULE", "RULE_SELECTOR",
  "RULE_TEMPLATE", "PRIMITIVE", "PREFERENCE", "SILK_OPTS", "BOARD", "PANELIZE", "LINE", "ARC", "VIA", "PAD",
  "PAD_NET", "COMPONENT", "ATTR", "STRING", "POLY", "REGION", "FILL"]);
const jsonObject = z.record(z.string(), z.json());

export function assertPcbTextSourceProfile(source: NativeSourceSnapshot): void {
  if (source.schema !== "easyeda-pro-control.document-source.v1" || source.document["docType"] !== "PCB" ||
      source.document["editVersion"] !== "3.2.149.88089769" || typeof source.document["uuid"] !== "string" || !/^[a-f0-9]{16}$/u.test(source.document["uuid"]) ||
      source.objects.length > 20_000 || Buffer.byteLength(JSON.stringify(source)) > 8_388_608 ||
      source.sha256 !== sha256Json({ schema: source.schema, document: source.document, objects: source.objects })) {
    throw new Error("Standalone PCB text requires its complete bounded, hash-verified native source baseline.");
  }
  jsonObject.parse(source.document);
  const records = new Map<string, NativeSourceObject>();
  const attributes = new Set<string>();
  const componentIds = new Set(source.objects.filter((row) => row.type === "COMPONENT").map((row) => row.id));
  for (const row of source.objects) {
    jsonObject.parse(row.body);
    if (!row.id || row.id.length > 2048 || records.has(row.id) || !supportedRecords.has(row.type)) {
      throw new Error("Standalone PCB text source has duplicate identities or an unsupported record family.");
    }
    records.set(row.id, row);
    if (row.body["partitionId"] !== undefined && row.body["partitionId"] !== "" ||
        row.body["groupId"] !== undefined && row.body["groupId"] !== 0 ||
        row.body["groupID"] !== undefined && row.body["groupID"] !== 0) {
      throw new Error("Standalone PCB text does not admit partition or group ownership.");
    }
    const parent = row.body["parentId"];
    if (row.type === "ATTR") {
      const key = row.body["key"];
      if (typeof parent !== "string" || !componentIds.has(parent) || typeof key !== "string" || !key ||
          typeof row.body["value"] !== "string" || typeof row.body["keyVisible"] !== "boolean" || typeof row.body["valueVisible"] !== "boolean") {
        throw new Error("Standalone PCB text requires explicit native component-attribute ownership; root or malformed ATTR is unsupported.");
      }
      const identity = JSON.stringify([parent, key]);
      if (attributes.has(identity)) { throw new Error("Standalone PCB text refuses duplicate native component attributes."); }
      attributes.add(identity);
    } else if (parent !== undefined && parent !== "") { throw new Error("Standalone PCB text source has ambiguous native parent ownership."); }
    if (row.type === "STRING") {
      nativeId.parse(row.id);
      stringBodySchema.parse(row.body);
    }
    if ((row.type === "PANELIZE" || row.id === "PANELIZE") &&
        (row.type !== "PANELIZE" || row.id !== "PANELIZE" || !disabledPanel.safeParse(row.body).success)) {
      throw new Error("Standalone PCB text admits only one canonical disabled default panel record.");
    }
  }
  const layers = source.objects.filter((row) => row.type === "LAYER" && row.body["layerId"] === 3);
  if (layers.length !== 1 || layers[0]?.body["locked"] !== false || layers[0].body["use"] !== true || layers[0].body["show"] !== true) {
    throw new Error("Standalone PCB text requires exactly one enabled, visible, unlocked top-silkscreen layer.");
  }
}

export function selectPcbTextString(primitiveId: string, source: NativeSourceSnapshot): NativeSourceObject {
  nativeId.parse(primitiveId);
  assertPcbTextSourceProfile(source);
  const selected = source.objects.find((row) => row.id === primitiveId);
  if (selected?.type !== "STRING" || selected.body["locked"] !== false) {
    throw new Error("Standalone PCB text requires an existing unlocked STRING, never ATTR or a component child.");
  }
  return selected;
}

export function expectedPcbTextSource(input: unknown, before: NativeSourceSnapshot): NativeSourceSnapshot {
  const operation = pcbTextOperationSchema.parse(input);
  const selected = selectPcbTextString(operation.target.primitiveId, before);
  if (Object.entries(operation.patch).every(([key, value]) => selected.body[key] === value)) {
    throw new Error("Standalone PCB text patch has no source effect.");
  }
  const objects = before.objects.map((row) => row.id === selected.id ? { ...row, body: { ...row.body, ...operation.patch } } : row);
  const snapshot = { schema: before.schema, document: before.document, objects };
  return { ...snapshot, sha256: sha256Json(snapshot) };
}
export function verifyPcbTextSourceEffect(input: unknown, before: NativeSourceSnapshot, after: NativeSourceSnapshot): NativeSourceDelta {
  const operation = pcbTextOperationSchema.parse(input);
  const expected = expectedPcbTextSource(operation, before);
  selectPcbTextString(operation.target.primitiveId, after);
  if (canonicalJson(expected) !== canonicalJson(after)) {
    throw new Error("Standalone PCB text changed metadata, native attributes, fonts or peer records beyond its exact x/y/text effect.");
  }
  return compareDocumentSources(before, after);
}
export function inversePcbTextOperation(input: unknown, before: NativeSourceSnapshot): PcbTextOperation {
  const operation = pcbTextOperationSchema.parse(input);
  const selected = selectPcbTextString(operation.target.primitiveId, before);
  const patch = Object.fromEntries(Object.keys(operation.patch).map((key) => [key, selected.body[key]]));
  const inverse = pcbTextOperationSchema.parse({ ...operation, id: `inverse-${sha256Json(operation).slice(0, 32)}`, patch });
  const restored = expectedPcbTextSource(inverse, expectedPcbTextSource(operation, before));
  if (canonicalJson(restored) !== canonicalJson(before)) { throw new Error("Standalone PCB text inverse is not exact."); }
  return inverse;
}
export function buildPcbTextAdapter(input: unknown, before: NativeSourceSnapshot, history?: NativeHistorySnapshot): DesignNativeAdapter {
  const operation = pcbTextOperationSchema.parse(input);
  const expected = expectedPcbTextSource(operation, before);
  verifyPcbTextSourceEffect(operation, before, expected);
  const adapter = buildReviewedNativeSourceMerge(before, expected);
  const scope = pcbTextRuntimeScope(before, history);
  // Reuse the strict merge validation/profile, never its mutable current-tab
  // Runtime. This action reads and decodes on one captured PCB frame instead.
  return { ...adapter, code: buildPcbTextRuntime(before, expected, scope) };
}

export function pcbTextRuntimeScope(before: NativeSourceSnapshot, history?: NativeHistorySnapshot): { projectUuid: string; branchUuid: string } {
  if (history?.profile !== "easyeda.native-history.linear-gcm-gzip.v1" || !/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u.test(history.projectUuid) ||
      !/^[a-f0-9]{32}$/u.test(history.branchUuid) || !/^[a-f0-9]{64}$/u.test(history.checkpointSha256) ||
      history.documents.filter((row) => row.uuid === before.document["uuid"] && row.docType === "PCB" && !isNativeDocumentDeleted(row)).length !== 1) {
    throw new Error("Standalone PCB text requires the journal-owned complete checkpoint and exact native project branch.");
  }
  return { projectUuid: history.projectUuid, branchUuid: history.branchUuid };
}

export const PCB_TEXT_LIMITATIONS = Object.freeze([
  "Native task-equivalent typed source merge, not pcb_PrimitiveString.modify public-method execution parity; no connected lifecycle claim follows from synthetic tests.",
  "Reads and decodes on one captured native PCB frame with synchronous final project/branch/tab/frame checks; requires the journal-owned checkpoint branch and pinned UI/PCB implementations. No mutable current-tab source setter is used.",
  "Modifies only x/y/text of one existing unlocked top-silkscreen standalone STRING on a project-owned type-3 PCB. No creation, deletion, component labels, ATTR, footprint text or inherited text.",
  "All stored STRINGs must use the exact default-font, LEFT_BOTTOM, zero-angle, nonmirrored, nonreverse, zero-expansion profile. Only letters, digits, spaces, dot, underscore and hyphen are supported, with at least one letter or digit.",
  "Only explicit four-decimal native-mil coordinates are accepted; no rounding, font/style/layer change, unlock or missing-field materialization.",
  "Existing specialColor must be exactly null or the pinned default #000000, and is preserved unchanged. These representations are not normalized or claimed equivalent; arbitrary custom colors and color edits are not admitted.",
  "Groups, partitions, generated copper, pours, custom fonts and unmodeled record families refuse; component ATTR ownership and uniqueness and one visible unlocked top-silkscreen layer must be explicit. Only the canonical disabled default panel configuration is admitted.",
  "The reused source merge publishes native autoFill, panelization and HistoryFlushService; a text-only derived-state profile has not been reviewed. The POUR exclusion is conservative, not proof that every text edit rebuilds copper or a permanent SDK limitation.",
  "Complete native-source and saved-project peer proofs remain mandatory; no visual placement, silkscreen clearance or fabrication acceptance is inferred.",
]);
