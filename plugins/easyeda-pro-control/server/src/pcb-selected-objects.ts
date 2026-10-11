import { z } from "zod";
import { canonicalJson } from "./core.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "./document-source.ts";
import { PCB_NET_MEMBERSHIP_MAX_BYTES, PCB_NET_MEMBERSHIP_MAX_ITEMS, assertPcbMembershipSource, derivePcbPhysicalMembers } from "./pcb-net-membership.ts";
import type { PcbInheritedLineEvidence } from "./pcb-inherited-lines.ts";

export const PCB_SELECTED_OBJECTS_METHOD = "eda.pcb_SelectControl.getAllSelectedPrimitives";
export const PCB_SELECTED_OBJECTS_IDS_METHOD = "eda.pcb_SelectControl.getAllSelectedPrimitives_PrimitiveId";
export const PCB_SELECTED_OBJECTS_PROFILE = "easyeda-pro-control.pcb-selected-source-objects.v1";
export const PCB_SELECTED_OBJECTS_MAX_SELECTED = 256;
export const PCB_SELECTED_OBJECTS_LIMITATIONS = [
  "Native-source DTO equivalent, not public primitive instances or public all-selected execution/parity. The installed public mapper silently drops Text; the raw selected-object handler filters objects without toJSON. Neither is called.",
  "Exact selected-ID order and membership are preserved. Only root Line, Arc, Via, standalone Pad, Component and STRING (String) are supported. Any missing, inherited, generated, grouped, unsupported or colliding selected identity refuses the entire result; no partial array is returned.",
  "Each DTO contains the complete exported native source record and its source-backed direct ATTR records. Fields retain native source encoding, including units, nulls and spelling; no SDK unit conversion, default resolution or native model serialization is invented.",
  "Component source and source-backed attributes do not contain complete inherited footprint geometry or generated attributes. Component pads, selected labels, outline children, footprint text and inherited tracks are not admitted as selected objects.",
  "Complete source/inventory correspondence is required for each selected owning family before returning any DTO. All inventory families are checked for duplicate and cross-family identity collisions. Pad correspondence includes the complete component-owned pad correlation, even though selected ComponentPad objects refuse.",
  "Two identical source/selected-IDs/inventory/selected-IDs/source cycles bind an active project-owned type-3 PCB and private runtime fingerprint. Each constituent read is independently double-sampled. Switching away and back between observations remains undetectable; no atomic snapshot or persistence claim.",
  "Line family correspondence may require the maintained fresh checkpoint proof for unselected inherited footprint lines. Its existing narrow ownership/geometry restrictions remain unchanged; selected inherited lines still refuse.",
  "Generated poured-state correlation must be exactly empty. Selected IDs may not use the ratline prefix, an existing component's descendant prefix, or any source object's generated polygon Line/Arc suffix; these drawing identities are outside ordinary family inventories.",
  "At most 256 selected IDs, 20000 source records and identities per inventory family, 16 MiB source evidence and 2 MiB result. Exceeding bounds refuses without truncation. No selection changes, public object mapper, navigation, Save, mutation or retry.",
] as const;
// oxlint-disable-next-line eslint/no-control-regex -- IDs cannot carry transport controls.
const identity = z.string().min(1).max(256).regex(/^[^\u0000-\u001F\u007F]+$/u);
export const pcbSelectedObjectsArgumentsSchema = z.object({}).strict();
export const pcbSelectedObjectsRequestSchema = z.object({ method: z.literal(PCB_SELECTED_OBJECTS_METHOD), arguments: pcbSelectedObjectsArgumentsSchema }).strict();
export const pcbSelectedObjectIdsSchema = z.array(identity).max(PCB_SELECTED_OBJECTS_MAX_SELECTED).refine((ids) => new Set(ids).size === ids.length, "Selection identities must be unique.");
const sourceRecord = z.object({ id: identity, type: z.string().min(1).max(64), body: z.record(z.string(), z.json()) }).strict();
export const pcbSelectedObjectsResultSchema = z.array(z.object({ primitiveId: identity,
  primitiveType: z.enum(["Line", "Arc", "Via", "Pad", "Component", "String"]),
  sourceRecord, sourceAttributes: z.array(sourceRecord).max(PCB_NET_MEMBERSHIP_MAX_ITEMS),
}).strict()).max(PCB_SELECTED_OBJECTS_MAX_SELECTED).refine((rows) => new Set(rows.map((row) => row.primitiveId)).size === rows.length &&
  rows.every((row) => row.sourceRecord.id === row.primitiveId), "Selected DTO identities must match their unique source records.");
const familySchema = z.object({ status: z.literal("adapter-enumerated"), count: z.number().int().min(0).max(PCB_NET_MEMBERSHIP_MAX_ITEMS),
  primitiveIds: z.array(identity).max(PCB_NET_MEMBERSHIP_MAX_ITEMS), byPrimitiveId: z.record(identity, z.unknown()).optional() }).loose();
const inventorySchema = z.object({ ok: z.literal(true), kind: z.literal("pcb-inventory"), documentType: z.literal(3),
  families: z.record(z.string(), familySchema), pouredFillPieceCount: z.literal(0),
  pouredCorrelation: z.object({ status: z.literal("derived-subset"), count: z.literal(0), pourPrimitiveIds: z.array(identity).length(0),
    byPourPrimitiveId: z.object({}).strict() }).strict() }).loose();
const familyDefinitions = [
  { sourceType: "LINE", type: "Line", family: "lines" }, { sourceType: "ARC", type: "Arc", family: "arcs" },
  { sourceType: "VIA", type: "Via", family: "vias" }, { sourceType: "PAD", type: "Pad", family: "pads" },
  { sourceType: "COMPONENT", type: "Component", family: "components" }, { sourceType: "STRING", type: "String", family: "strings" },
] as const;
const familyNames = ["components", "pads", "vias", "lines", "arcs", "strings", "attributes", "polylines", "regions", "pours", "fills", "dimensions", "images", "objects"] as const;
function sameSet(actual: readonly string[], expected: readonly string[]): void {
  if (new Set(actual).size !== actual.length || new Set(expected).size !== expected.length || canonicalJson(actual.toSorted()) !== canonicalJson(expected.toSorted())) {
    throw new Error("Selected PCB source objects require exact complete owning-family membership.");
  }
}
function rootRecord(row: NativeSourceObject): void {
  if (row.body["parentId"] !== undefined && row.body["parentId"] !== "" && row.body["parentId"] !== null ||
      row.body["groupId"] !== undefined && row.body["groupId"] !== 0 || row.body["groupID"] !== undefined && row.body["groupID"] !== 0) {
    throw new Error("Selected PCB source objects do not admit inherited or grouped records.");
  }
}

/** Source rows are data, never fed into a native decoder. The installed ID
 * handler maps every selected item's globalIndex, without the lossy toJSON
 * filter or Text switch used by the object wrappers. Owning-family parity
 * makes an unknown selection a refusal, never a silently omitted object.
 */
export function derivePcbSelectedObjects(source: NativeSourceSnapshot, inventoryInput: unknown, selectedInput: unknown,
  requestInput: unknown, documentUuid: string, inherited?: PcbInheritedLineEvidence): z.infer<typeof pcbSelectedObjectsResultSchema> {
  pcbSelectedObjectsRequestSchema.parse(requestInput);
  const selected = pcbSelectedObjectIdsSchema.parse(selectedInput);
  assertPcbMembershipSource(source, documentUuid);
  const inventory = inventorySchema.parse(inventoryInput);
  sameSet(Object.keys(inventory.families), familyNames);
  const nativeOwners = new Map<string, string>();
  for (const [name, family] of Object.entries(inventory.families)) {
    if (family.count !== family.primitiveIds.length) { throw new Error("Selected PCB family count is inconsistent."); }
    if (family.byPrimitiveId !== undefined) { sameSet(Object.keys(family.byPrimitiveId), family.primitiveIds); }
    for (const id of family.primitiveIds) {
      if (nativeOwners.has(id)) { throw new Error("Selected PCB inventory has duplicate or colliding family identities."); }
      nativeOwners.set(id, name);
    }
  }
  const rows = new Map(source.objects.map((row) => [row.id, row]));
  const requestedTypes = new Set<string>();
  for (const id of selected) {
    // Pinned PCB 65401cdc: yd generates index+lN/index+aN (4090324);
    // Component descendants prefix their owner's identity; ratlines use rat
    // (4306002/8079739). These can be absent from ordinary family indexes.
    if (id.startsWith("rat") || source.objects.some((owner) => owner.id !== id && id.startsWith(owner.id) &&
      (owner.type === "COMPONENT" || /^[al]\d+$/u.test(id.slice(owner.id.length))))) {
      throw new Error("Selected PCB identity overlaps a generated or inherited identity namespace.");
    }
    const row = rows.get(id);
    const definition = familyDefinitions.find((candidate) => candidate.sourceType === row?.type);
    if (row === undefined || definition === undefined || nativeOwners.get(id) !== definition.family) {
      throw new Error("Every selected PCB ID must be an existing supported root source object with one exact inventory owner.");
    }
    rootRecord(row);
    requestedTypes.add(row.type);
  }
  const physicalTypes = familyDefinitions.filter((definition) => requestedTypes.has(definition.sourceType))
    .map((definition) => definition.type).filter((type): type is "Line" | "Arc" | "Via" | "Pad" => type !== "String" && type !== "Component");
  if (physicalTypes.length > 0) {
    const members = derivePcbPhysicalMembers(source, inventoryInput, documentUuid, physicalTypes, inherited);
    if (members.some((member) => member.sourceRecordId !== member.primitiveId && rows.has(member.primitiveId))) {
      throw new Error("Selected PCB inherited identity collides with a source record.");
    }
    for (const id of selected) {
      const row = rows.get(id);
      if (row !== undefined && ["LINE", "ARC", "VIA", "PAD"].includes(row.type) && !members.some((member) => member.primitiveId === id && member.sourceRecordId === id)) {
        throw new Error("Selected PCB physical identity lacks exact standalone source membership.");
      }
    }
  }
  for (const definition of familyDefinitions.filter((candidate) => candidate.type === "Component" || candidate.type === "String")) {
    if (requestedTypes.has(definition.sourceType)) {
      const complete = source.objects.filter((row) => row.type === definition.sourceType);
      for (const row of complete) { rootRecord(row); }
      sameSet(inventory.families[definition.family]?.primitiveIds ?? [], complete.map((row) => row.id));
    }
  }
  const attributes = new Map<string, NativeSourceObject[]>();
  for (const row of source.objects) {
    if (row.type === "ATTR") {
      const owner = identity.parse(row.body["parentId"]);
      if (!rows.has(owner)) { throw new Error("PCB source attribute has an unresolved owner."); }
      const prior = attributes.get(owner) ?? [];
      prior.push(row); attributes.set(owner, prior);
    }
  }
  const result = pcbSelectedObjectsResultSchema.parse(selected.map((id) => {
    const row = rows.get(id);
    const definition = familyDefinitions.find((candidate) => candidate.sourceType === row?.type);
    if (row === undefined || definition === undefined) { throw new Error("Selected PCB source identity changed during derivation."); }
    return { primitiveId: id, primitiveType: definition.type, sourceRecord: row,
      sourceAttributes: (attributes.get(id) ?? []).toSorted((left, right) => left.id < right.id ? -1 : 1) };
  }));
  if (Buffer.byteLength(JSON.stringify(result)) > PCB_NET_MEMBERSHIP_MAX_BYTES) { throw new Error("Selected PCB source DTOs exceed the result byte bound."); }
  return result;
}
