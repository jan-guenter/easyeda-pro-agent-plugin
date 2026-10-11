import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "./document-source.ts";
import { assertPcbInheritedLineEvidence } from "./pcb-inherited-lines.ts";
import type { PcbInheritedLine, PcbInheritedLineEvidence } from "./pcb-inherited-lines.ts";

export const PCB_NET_MEMBERSHIP_METHOD = "eda.pcb_Net.getAllPrimitivesByNet";
export const PCB_NET_MEMBERSHIP_PROFILE = "easyeda-pro-control.pcb-net-membership.v1";
export const PCB_NET_MEMBERSHIP_MAX_ITEMS = 20_000;
export const PCB_NET_MEMBERSHIP_MAX_BYTES = 2_097_152;
export const PCB_NET_MEMBERSHIP_SOURCE_EDIT_VERSION = "3.2.149.88089769";
export const PCB_NET_MEMBERSHIP_API_SHA256 = "5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc";
export const PCB_NET_MEMBERSHIP_PCB_SHA256 = "65401cdc0a8f244db2ff2d8da88fd835b6e1fb3a3ecdbcfd975781502cb04b54";
export const PCB_NET_MEMBERSHIP_LIMITATIONS = [
  "Native task-equivalent identity records, not public primitive instances, native my(item) DTOs or public-method execution parity.",
  "Requires a nonempty net and explicit nonempty unique filters from Line, Arc, Via, Pad and ComponentPad; unfiltered, empty-net and other-family requests are unsupported.",
  "Pad means standalone physical pads; ComponentPad means component-owned physical pads. These disjoint roles differ from the direct Pad enumerator, which also includes component pads.",
  "Requires one exact active project-owned type-3 PCB, the reviewed runtime and source editVersion 3.2.149.88089769. expectedContext.document must retain the observed tabId and parentProjectUuid; a minimal UUID/type selector refuses before dispatch. Library, partition and unmodeled source records are unsupported.",
  "STRING, FONT, RULE_TEMPLATE, PRIMITIVE, PREFERENCE and SILK_OPTS are admitted as nonselected text/metadata. BOARD is a nonselected display outline: its generated Line/Arc drawing controllers are not the Track/ArcTrack objects enumerated by the electrical inventory. Outline geometry and drawing-child ownership are not returned or validated.",
  "PANELIZE is admitted only as one canonical disabled default record: on=false, row=column=1, zero spacing and onlyOutline=true, with all ten settings and exact nested shapes retained. Nested stamp/side flags remain dormant settings; enabled, malformed and descendant panel state is unsupported.",
  "Net matching uses uppercase keys and preserves stored spelling. Full requested-family source/inventory correspondence is checked before filtering; this is not electrical connectivity, DRC, saved-file or persistence proof.",
  "Two matching source/inventory/source cycles require unchanged runtime and full observed context. Switching away and back between observations remains undetectable.",
  "Line reads with explicit Footprint associations or extra inventory identities require a fresh managed checkpoint and repeated complete-database invariance. Only direct empty-net top-silkscreen footprint LINEs on unlocked top-side, zero-rotation components with zero library origin are supported; custom chains, replacements, partitions and ambiguous owners refuse. Their explicit footprint provenance is separate from PCB source records; they never enter a nonempty-net result.",
  "Bounded to 20,000 native source records, 16 MiB native source evidence and 2 MiB result; inherited Line proof also limits decoded checkpoint history to 32 MiB and each referenced document to 20,000 records. Exceeding bounds refuses without truncation.",
] as const;
// oxlint-disable-next-line eslint/no-control-regex -- Native identity selectors cannot carry transport control characters.
const identity = z.string().min(1).max(256).regex(/^[^\u0000-\u001F\u007F]+$/u);
// oxlint-disable-next-line eslint/no-control-regex -- Net spelling is preserved, including empty unassigned nets in evidence.
const net = z.string().max(1024).regex(/^[^\u0000-\u001F\u007F]*$/u);
const padNetKeySchema = z.tuple([z.literal("PAD_NET"), identity, z.string().max(256), identity]);
export const PCB_NET_MEMBERSHIP_TYPES = ["Line", "Arc", "Via", "Pad", "ComponentPad"] as const;
const primitiveType = z.enum(PCB_NET_MEMBERSHIP_TYPES);
export const pcbNetMembershipArgumentsSchema = z.object({ net: net.min(1),
  primitiveTypes: z.array(primitiveType).min(1).max(5).refine((values) => new Set(values).size === values.length, "Duplicate primitive types.") }).strict();
export const pcbNetMembershipRequestSchema = z.object({ method: z.literal(PCB_NET_MEMBERSHIP_METHOD), arguments: pcbNetMembershipArgumentsSchema }).strict();
export const pcbNetMembershipItemSchema = z.object({ primitiveId: identity, primitiveType, net: net.min(1),
  parentComponentPrimitiveId: identity.nullable(), sourceRecordId: z.string().min(1).max(2048), sourceType: z.enum(["LINE", "ARC", "VIA", "PAD", "PAD_NET"]) }).strict();
export const pcbNetMembershipItemsSchema = z.array(pcbNetMembershipItemSchema).max(PCB_NET_MEMBERSHIP_MAX_ITEMS).refine((rows) =>
  rows.every((row, index) => (index === 0 || (rows[index - 1]?.primitiveId ?? "") < row.primitiveId) && itemMatchesRole(row)),
"Membership identities must be unique, sorted and bound to their native owner role.");
export type PcbNetMembershipItem = z.infer<typeof pcbNetMembershipItemSchema>;
type PrimitiveType = z.infer<typeof primitiveType>;
const count = z.number().int().min(0).max(PCB_NET_MEMBERSHIP_MAX_ITEMS);
const identities = z.array(identity).max(PCB_NET_MEMBERSHIP_MAX_ITEMS);
const inventoryItem = z.object({ primitiveId: identity, primitiveType: z.string(), net: net.nullable(),
  parentComponentPrimitiveId: identity.optional(), padNumber: z.string().max(256).optional() }).loose();
const familySchema = z.object({ count, primitiveIds: identities, byPrimitiveId: z.record(identity, inventoryItem) }).loose();
const componentFamilySchema = z.object({ status: z.literal("adapter-enumerated"), count, primitiveIds: identities }).strict();
const padLinkSchema = z.object({ primitiveId: identity, parentComponentPrimitiveId: identity, padNumber: z.string().max(256), net: net.nullable() }).loose();
const padCorrelationSchema = z.object({ status: z.literal("exact-subset"), count, primitiveIds: identities,
  byPrimitiveId: z.record(identity, padLinkSchema), byComponentPrimitiveId: z.record(identity, identities) }).loose();
const inventorySchema = z.object({ ok: z.literal(true), kind: z.literal("pcb-inventory"), documentType: z.literal(3),
  families: z.record(z.string(), z.unknown()), componentPadCorrelation: padCorrelationSchema }).loose();
const panelDimension = z.number().positive();
const panelQuantity = z.number().int().min(1).max(PCB_NET_MEMBERSHIP_MAX_ITEMS);
const panelStampSchema = z.object({ on: z.boolean(), stampHoleGroupQuantity: panelQuantity, stampHoleDiameter: panelDimension,
  stampHoleQuantityPerGroup: panelQuantity, stampHoleSpacing: panelDimension }).strict();
const panelSideSchema = z.object({ on: z.boolean(), sideHeight: panelDimension, positionHoleDiameter: panelDimension,
  markDiameter: panelDimension, markExpansion: panelDimension }).strict();
const disabledPanelSchema = z.object({ on: z.literal(false), row: z.literal(1), column: z.literal(1), rowSpacing: z.literal(0),
  columnSpacing: z.literal(0), onlyOutline: z.literal(true), horizontalStamp: panelStampSchema, verticalStamp: panelStampSchema,
  horizontalSize: panelSideSchema, verticalSize: panelSideSchema }).strict();
const supportedRecords = new Set(["LINE", "ARC", "VIA", "PAD", "PAD_NET", "COMPONENT", "ATTR", "CANVAS", "LAYER", "LAYER_PHYS",
  "ACTIVE_LAYER", "NET", "RULE", "RULE_SELECTOR", "POLY", "REGION", "POUR", "FILL", "TEXT", "STRING", "DIMENSION", "IMAGE", "OBJECT", "GROUP",
  "FONT", "RULE_TEMPLATE", "PRIMITIVE", "PREFERENCE", "SILK_OPTS", "BOARD", "PANELIZE"]);
// Pinned PCB 65401cdc: STRING fields 3969387 and S4 decoder 4002049 are text-only.
// S4 creates go.addText/$E objects, not selected electrical primitives.
// Native source and full requested-family inventory still must correspond.
// FONT/QE 4188625 updates Xy glyph cache; RULE_TEMPLATE/nie 4206454 sets its name.
// PRIMITIVE/rne 4768822 changes Ui pick/visible; SILK_OPTS/ine 4772996 sets colors.
// PREFERENCE/ene 4763570 changes routing defaults; ll setters 7286703/7289867
// Store options only, without calling Hi(). No metadata decoder runs here.
// BOARD/one 4781396 fixes type Board, layer 1006 and null net.
// Mu 4083197 keeps that net null; yd 4090475 creates uncached outline models.
// Es 4382216 wraps polygon children as ft/_t drawing controllers.
// The bde/Pde factories 7918269/7918772 call Db.updateItem 7745368.
// That only updates stashed selection IDs, not On's Track/ArcTrack models.
// Exact Line/Arc getAll maps to track-getAll/arc-getAll 10290781/10244162.
// Those enumerate dr/Xh 7877954 backed by On, filtered to _r/Si controllers.
// BOARD therefore contributes no selected identity; extra inventory IDs still
// Fail complete source correspondence. No outline decoder runs here.
const families = [{ name: "lines", type: "Line", sourceType: "LINE" }, { name: "arcs", type: "Arc", sourceType: "ARC" },
  { name: "vias", type: "Via", sourceType: "VIA" }] as const;
interface Member { primitiveId: string; primitiveType: PrimitiveType; net: string; parentComponentPrimitiveId: string | null; sourceRecordId: string; sourceType: PcbNetMembershipItem["sourceType"]; padNumber?: string; }

function itemMatchesRole(row: PcbNetMembershipItem): boolean {
  if (row.primitiveType === "ComponentPad") {
    let key: unknown;
    try { key = JSON.parse(row.sourceRecordId); } catch { return false; }
    const parsed = padNetKeySchema.safeParse(key);
    return parsed.success && parsed.data[1] === row.parentComponentPrimitiveId && parsed.data[1] + parsed.data[3] === row.primitiveId &&
      JSON.stringify(parsed.data) === row.sourceRecordId && row.sourceType === "PAD_NET";
  }
  return row.parentComponentPrimitiveId === null && row.sourceRecordId === row.primitiveId &&
    row.sourceType === ({ Line: "LINE", Arc: "ARC", Via: "VIA", Pad: "PAD" } as const)[row.primitiveType];
}

function sameSet(actual: readonly string[], expected: readonly string[], label: string): void {
  if (new Set(actual).size !== actual.length || new Set(expected).size !== expected.length || canonicalJson(actual.toSorted()) !== canonicalJson(expected.toSorted())) {
    throw new Error(`PCB net membership ${label} is incomplete or ambiguous.`);
  }
}
function family(input: unknown): z.infer<typeof familySchema> {
  const parsed = familySchema.parse(input);
  if (parsed.count !== parsed.primitiveIds.length) { throw new Error("PCB net membership family count is inconsistent."); }
  sameSet(parsed.primitiveIds, Object.keys(parsed.byPrimitiveId), "family keys");
  for (const [key, row] of Object.entries(parsed.byPrimitiveId)) {
    if (key !== row.primitiveId) { throw new Error("PCB net membership family substitutes an identity."); }
  }
  return parsed;
}
function sourceIdentity(source: NativeSourceSnapshot, documentUuid: string): void {
  identity.parse(documentUuid);
  if (source.objects.length > PCB_NET_MEMBERSHIP_MAX_ITEMS || Buffer.byteLength(JSON.stringify(source)) > 16_777_216 || source.schema !== "easyeda-pro-control.document-source.v1" || source.document["docType"] !== "PCB" ||
      source.document["uuid"] !== documentUuid || source.document["editVersion"] !== PCB_NET_MEMBERSHIP_SOURCE_EDIT_VERSION ||
      source.sha256 !== sha256Json({ schema: source.schema, document: source.document, objects: source.objects }) ||
      new Set(source.objects.map((row) => row.id)).size !== source.objects.length) { throw new Error("PCB net membership source identity, bound or commitment is invalid."); }
  // Pinned PCB 65401cdc: Ug.getPanelize 3973367/nF 4448423 encode ten settings.
  // Dp.applyPanelize 5830549 clears Ii/ai derived arrays before the !on return,
  // Setting success=false before copies, stamps, borders or marks can generate.
  // Dormant nested flags are preserved, not executed. No panel decoder runs here.
  const panels = source.objects.filter((row) => row.type === "PANELIZE" || row.id === "PANELIZE");
  if (panels.length > 1 || panels.some((row) => row.type !== "PANELIZE" || row.id !== "PANELIZE" || !disabledPanelSchema.safeParse(row.body).success)) {
    throw new Error("PCB net membership only admits one canonical disabled default PANELIZE record.");
  }
  for (const row of source.objects) {
    if (!supportedRecords.has(row.type)) { throw new Error("PCB net membership source contains an unmodeled record family."); }
    // Partition/panel/template descendants can have additional native membership.
    if (row.body["partitionId"] !== undefined && row.body["partitionId"] !== "" && row.body["partitionId"] !== null) {
      throw new Error("PCB net membership does not admit partition descendants.");
    }
  }
}
function standalone(row: NativeSourceObject, type: PrimitiveType, sourceType: Member["sourceType"]): Member {
  const parent = row.body["parentId"];
  if (parent !== undefined && parent !== null && parent !== "") { throw new Error("PCB net membership source has an unsupported inherited owner."); }
  return { primitiveId: identity.parse(row.id), primitiveType: type, net: net.parse(row.body["netName"]), parentComponentPrimitiveId: null,
    sourceRecordId: row.id, sourceType };
}
function verifyFamily(expected: Map<string, Member | PcbInheritedLine>, actual: z.infer<typeof familySchema>, expectedType: string): void {
  sameSet(actual.primitiveIds, [...expected.keys()], "complete family membership");
  for (const [id, member] of expected) {
    const row = actual.byPrimitiveId[id];
    if (row === undefined || row.primitiveType !== expectedType || (row.net ?? "") !== member.net ||
        (row.parentComponentPrimitiveId ?? null) !== (member.sourceType === "FOOTPRINT_LINE" ? null : member.parentComponentPrimitiveId) ||
        "padNumber" in member && member.padNumber !== undefined && row.padNumber !== member.padNumber) {
      throw new Error("PCB net membership source and inventory assignments disagree.");
    }
  }
}
function sourcePads(source: NativeSourceSnapshot, componentIds: Set<string>): Map<string, Member> {
  const pads = new Map<string, Member>();
  for (const row of source.objects) {
    let member: Member | undefined;
    if (row.type === "PAD") { member = { ...standalone(row, "Pad", "PAD"), padNumber: z.string().max(256).parse(row.body["num"]) }; }
    if (row.type === "PAD_NET") {
      const key: unknown = JSON.parse(row.id);
      const tuple = padNetKeySchema.parse(key);
      if (JSON.stringify(tuple) !== row.id || !componentIds.has(tuple[1]) || row.body["parentId"] !== undefined && row.body["parentId"] !== tuple[1]) {
        throw new Error("PCB net membership PAD_NET owner or canonical identity is invalid.");
      }
      member = { primitiveId: identity.parse(tuple[1] + tuple[3]), primitiveType: "ComponentPad", net: net.parse(row.body["padNet"]),
        parentComponentPrimitiveId: tuple[1], padNumber: tuple[2], sourceRecordId: row.id, sourceType: "PAD_NET" };
    }
    if (member !== undefined) {
      if (pads.has(member.primitiveId)) { throw new Error("PCB net membership physical pad identities collide."); }
      pads.set(member.primitiveId, member);
    }
  }
  return pads;
}
function verifyPadLinks(expected: Map<string, Member>, componentIds: Set<string>, input: z.infer<typeof padCorrelationSchema>): void {
  const inherited = [...expected.values()].filter((row) => row.parentComponentPrimitiveId !== null);
  if (input.count !== inherited.length) { throw new Error("PCB net membership component pad count is inconsistent."); }
  sameSet(input.primitiveIds, inherited.map((row) => row.primitiveId), "component pad correlation");
  sameSet(Object.keys(input.byPrimitiveId), input.primitiveIds, "component pad correlation keys");
  sameSet(Object.keys(input.byComponentPrimitiveId), [...componentIds], "component owner inventory");
  for (const parent of componentIds) {
    sameSet(input.byComponentPrimitiveId[parent] ?? [], inherited.filter((row) => row.parentComponentPrimitiveId === parent).map((row) => row.primitiveId), "component child inventory");
  }
  for (const member of inherited) {
    const link = input.byPrimitiveId[member.primitiveId];
    if (link?.primitiveId !== member.primitiveId || link.parentComponentPrimitiveId !== member.parentComponentPrimitiveId ||
      link.padNumber !== member.padNumber || (link.net ?? "") !== member.net) { throw new Error("PCB net membership component pad owner, number or net disagrees."); }
  }
}

/** A native identity contract over independently complete source/inventory
 * observations, not public primitive instances or my(item) DTOs. The pinned
 * PCB 65401cdc net handler at 10238522 compares filters to model objects;
 * getSameNetItems at 7898915 uppercases keys and excludes noneNetMap. We do
 * neither native call nor serializer invocation here. Pad and ComponentPad
 * are disjoint physical-owner roles, unlike the direct Pad enumerator.
 */
export function derivePcbPhysicalMembers(source: NativeSourceSnapshot, inventoryInput: unknown, documentUuid: string,
  primitiveTypes: readonly PrimitiveType[], inherited?: PcbInheritedLineEvidence): (Member | PcbInheritedLine)[] {
  sourceIdentity(source, documentUuid);
  const inventory = inventorySchema.parse(inventoryInput);
  const selected = new Set(z.array(primitiveType).min(1).max(5).parse(primitiveTypes));
  if (selected.size !== primitiveTypes.length) { throw new Error("PCB physical membership has duplicate requested families."); }
  if (inherited === undefined && selected.has("Line") && source.objects.some((row) => row.type === "ATTR" && row.body["key"] === "Footprint")) {
    throw new Error("PCB Line membership with Footprint associations requires fresh inherited-library evidence, even when no child is enumerated.");
  }
  if (inherited !== undefined) { assertPcbInheritedLineEvidence(inherited, source, inventoryInput); }
  const members: (Member | PcbInheritedLine)[] = [];
  for (const definition of families) {
    if (selected.has(definition.type)) {
      const expected = new Map<string, Member | PcbInheritedLine>(source.objects.filter((row) => row.type === definition.sourceType).map((row) => {
        const member = standalone(row, definition.type, definition.sourceType); return [member.primitiveId, member];
      }));
      if (definition.type === "Line" && inherited !== undefined) {
        for (const member of inherited.members) {
          // The generated evidence already rejects every PCB source-ID collision.
          expected.set(member.primitiveId, member);
        }
      }
      verifyFamily(expected, family(inventory.families[definition.name]), definition.type);
      members.push(...expected.values());
    }
  }
  if (selected.has("Pad") || selected.has("ComponentPad")) {
    const components = source.objects.filter((row) => row.type === "COMPONENT");
    const componentIds = new Set(components.map((row) => identity.parse(row.id)));
    // Exact pcb-inventory identity-counts components without emitting state rows.
    // Its producer proves getAll/getAllPrimitiveId parity.
    // Source IDs and reciprocal pad correlation below prove complete owners.
    const componentFamily = componentFamilySchema.parse(inventory.families["components"]);
    if (componentFamily.count !== componentIds.size) { throw new Error("PCB net membership component count is inconsistent."); }
    sameSet(componentFamily.primitiveIds, [...componentIds], "complete component inventory");
    const expected = sourcePads(source, componentIds);
    verifyFamily(expected, family(inventory.families["pads"]), "Pad");
    verifyPadLinks(expected, componentIds, inventory.componentPadCorrelation);
    members.push(...expected.values());
  }
  if (members.length > PCB_NET_MEMBERSHIP_MAX_ITEMS || new Set(members.map((row) => row.primitiveId)).size !== members.length) {
    throw new Error("PCB net membership result families overlap or exceed their bound.");
  }
  return members;
}

export function derivePcbNetMembership(source: NativeSourceSnapshot, inventoryInput: unknown, requestInput: unknown, documentUuid: string,
  inherited?: PcbInheritedLineEvidence): PcbNetMembershipItem[] {
  const request = pcbNetMembershipRequestSchema.parse(requestInput);
  const selected = new Set<PrimitiveType>(request.arguments.primitiveTypes);
  const members = derivePcbPhysicalMembers(source, inventoryInput, documentUuid, request.arguments.primitiveTypes, inherited);
  const netKey = net.min(1).parse(request.arguments.net.toUpperCase());
  const result = pcbNetMembershipItemsSchema.parse(members.filter((row): row is Member => row.sourceType !== "FOOTPRINT_LINE" && selected.has(row.primitiveType) && row.net !== "" && row.net.toUpperCase() === netKey)
    .map(({ padNumber: _padNumber, ...row }) => row).toSorted((left, right) => left.primitiveId < right.primitiveId ? -1 : 1));
  if (Buffer.byteLength(JSON.stringify(result)) > PCB_NET_MEMBERSHIP_MAX_BYTES) { throw new Error("PCB net membership result exceeds its byte bound."); }
  return result;
}
