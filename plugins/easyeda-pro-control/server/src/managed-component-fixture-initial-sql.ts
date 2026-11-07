/** Separate complete initial Component/FOOTPRINT baseline. Every closed SQL
 * row remains covered by the unchanged strict initial-storage comparator. */
import { z } from "zod";
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { qualifyManagedFixtureArchive } from "./managed-fixture-archive.ts";
import { readManagedLibraryZip } from "./managed-library-files-zip.ts";
import { MANAGED_COMPONENT_FIXTURE_BODY, MANAGED_COMPONENT_FIXTURE_FOOTPRINT_META, managedComponentFixtureHiddenAttribute } from "./managed-component-fixture-generator.ts";
import { MANAGED_PAD_FIXTURE_BODY } from "./managed-pad-fixture-generator.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "./native-history.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { NativeSqlInventory } from "./sqlite-inventory-core.ts";
import { qualifyGeneratedInitialSqlRows } from "./managed-fixture-initial-sql-common.ts";

export interface QualifiedGeneratedComponentFixtureTarget {
  readonly schema: "easyeda-pro-control.qualified-generated-component-fixture-target.v1";
  readonly target: Readonly<{ rawWindowsPath: string; projectUuid: string; branchUuid: string; documentUuid: string; expectedSourceSha256: string }>;
  readonly footprintUuid: string; readonly componentId: string; readonly ownedPadId: string;
  readonly archiveSha256: string; readonly qualificationSha256: string; readonly inventoryLogicalSha256: string; readonly sourceSha256: string;
  readonly nativeLocalOffsetMinutes: number; readonly sourceCreatedEpochMs: number; readonly sourceModifiedEpochMs: number;
  readonly completeInitialSqlRowsQualified: true; readonly exactInitialNativePayloadQualified: true; readonly untickedDocHeadsQualified: true;
  readonly nativeComponentCacheQualified: false; readonly nativeIndexQualified: false; readonly writerClockAuthority: false;
  readonly registrationVerified: false; readonly designExecutionAuthorized: false;
}
const qualifications = new WeakMap<object, Readonly<{ text: string; inventory: NativeSqlInventory }>>();
const uuid = z.string().regex(/^[a-f0-9]{32}$/u); const primitive = z.string().regex(/^[a-f0-9]{16}$/u);
const rowSchema = z.strictObject({ header: z.strictObject({ type: z.string(), id: z.string().optional(), ticket: z.number().int().nonnegative().optional() }), body: z.record(z.string(), z.unknown()) });
function need(value: boolean, reason: string): asserts value { if (!value) { throw new Error(`Generated Component fixture initial SQL refused: ${reason}.`); } }
export async function qualifyGeneratedComponentFixtureInitialSql(value: Readonly<{ archive: Buffer; inventory: NativeSqlInventory; rawWindowsPath: string;
  sourceCreatedEpochMs: number; sourceModifiedEpochMs: number }>): Promise<Readonly<{ qualification: QualifiedGeneratedComponentFixtureTarget; history: NativeHistorySnapshot }>> {
  const input = Object.freeze({ archive: Buffer.from(value.archive), inventory: value.inventory, rawWindowsPath: value.rawWindowsPath, sourceCreatedEpochMs: value.sourceCreatedEpochMs, sourceModifiedEpochMs: value.sourceModifiedEpochMs });
  readerCompletion(input.inventory); const original = qualifyManagedFixtureArchive(input.archive), projectUuid = sha256Text(input.rawWindowsPath);
  need(input.rawWindowsPath.endsWith(`\\${original.expectedDestinationBasename}`) && /^Codex_component_circular_pad_[a-f0-9]{16}$/u.test(original.manifest.title), "original generated filename");
  const source = readManagedLibraryZip(input.archive).get(original.source.member); need(source !== undefined, "original source member");
  const entries = source.toString("utf8").slice(0, -2).split("|\n").map(text => { const at = text.indexOf("||"); return rowSchema.parse({ header: JSON.parse(text.slice(0, at)) as unknown, body: JSON.parse(text.slice(at + 2)) as unknown }); });
  need(canonicalJson(entries.map(row => row.header.type)) === canonicalJson(["DOCHEAD", "META", "PAD", "ATTR", "ATTR", "DOCHEAD", "META", "COMPONENT", "ATTR", "ATTR"]), "complete paired source family roster");
  const footprintHead = entries[0]; const footprintMeta = entries[1]; const pad = entries[2]; const footprintAttr = entries[3]; const designatorAttr = entries[4]; const pcbHead = entries[5]; const pcbMeta = entries[6]; const component = entries[7]; const placedFootprintAttr = entries[8]; const placedDesignatorAttr = entries[9];
  need(footprintHead !== undefined && footprintMeta !== undefined && pad !== undefined && footprintAttr !== undefined && designatorAttr !== undefined && pcbHead !== undefined && pcbMeta !== undefined && component !== undefined && placedFootprintAttr !== undefined && placedDesignatorAttr !== undefined, "complete original records");
  const footprintUuid = uuid.parse(footprintHead.body["uuid"]); const documentUuid = uuid.parse(pcbHead.body["uuid"]); const client = primitive.parse(footprintHead.body["client"]); const componentId = primitive.parse(component.header.id); const padId = primitive.parse(pad.header.id);
  const generatedAt = footprintHead.body["updateTime"];
  need(typeof generatedAt === "number" && Number.isSafeInteger(generatedAt) && generatedAt > 0, "generated source clock format");
  for (const [head, docType, id] of [[footprintHead, "FOOTPRINT", footprintUuid], [pcbHead, "PCB", documentUuid]] as const) {
    need(canonicalJson(head.header) === canonicalJson({ type: "DOCHEAD" }) && canonicalJson(head.body) === canonicalJson({ docType, client, uuid: id, updateTime: generatedAt, version: String(generatedAt), editVersion: "3.2.209" }), "exact unticked paired document header");
  }
  const sourceIds = [footprintUuid, documentUuid, client];
  for (const rows of [entries.slice(1, 5), entries.slice(6, 10)]) { for (const [index, row] of rows.entries()) {
    need(canonicalJson(row.header) === canonicalJson({ type: row.header.type, id: index === 0 ? "META" : primitive.parse(row.header.id), ticket: index + 1 }), "exact initial IDs/tickets");
    if (index > 0) { sourceIds.push(primitive.parse(row.header.id)); }
  } }
  need(new Set(sourceIds).size === sourceIds.length, "fresh complete source identities");
  need(canonicalJson(footprintMeta.body) === canonicalJson(MANAGED_COMPONENT_FIXTURE_FOOTPRINT_META) && canonicalJson(pad.body) === canonicalJson(MANAGED_PAD_FIXTURE_BODY) &&
    canonicalJson(footprintAttr.body) === canonicalJson(managedComponentFixtureHiddenAttribute("", "Footprint", MANAGED_COMPONENT_FIXTURE_FOOTPRINT_META.title)) && canonicalJson(designatorAttr.body) === canonicalJson(managedComponentFixtureHiddenAttribute("", "Designator", "U?")) &&
    canonicalJson(pcbMeta.body) === canonicalJson({ title: "PCB1", parent: "", source: "", board: "", zIndex: null }) && canonicalJson(component.body) === canonicalJson(MANAGED_COMPONENT_FIXTURE_BODY) &&
    canonicalJson(placedFootprintAttr.body) === canonicalJson(managedComponentFixtureHiddenAttribute(componentId, "Footprint", footprintUuid)) && canonicalJson(placedDesignatorAttr.body) === canonicalJson(managedComponentFixtureHiddenAttribute(componentId, "Designator", "U?")), "fixed complete Component/footprint/attribute bodies");
  need(canonicalJson(original.documents.map(doc => ({ uuid: doc.uuid, type: doc.documentType }))) === canonicalJson([{ uuid: footprintUuid, type: "FOOTPRINT" }, { uuid: documentUuid, type: "PCB" }]), "complete archive document roster");
  const directory = input.rawWindowsPath.slice(0, input.rawWindowsPath.lastIndexOf("\\"));
  const structure = { boards: {}, schematics: {}, sheets: {}, pcbs: { [documentUuid]: { uuid: documentUuid, title: "PCB1", board: "", zIndex: null, parent_uuid: "", source: "", version: String(generatedAt), updateTime: generatedAt } }, panels: {}, blockSymbols: {}, owner: { uuid: `${directory}/`, username: "", nickname: "" } };
  const { actor, branchUuid, historyUuid, plaintext, nativeLocalOffsetMinutes } = await qualifyGeneratedInitialSqlRows(input, { source, title: original.manifest.title, structureJson: JSON.stringify(structure) });
  const document = (head: z.infer<typeof rowSchema>, rows: z.infer<typeof rowSchema>[]): NativeDocumentSnapshot => {
    const docUuid = uuid.parse(head.body["uuid"]); const docType = z.enum(["FOOTPRINT", "PCB"]).parse(head.body["docType"]);
    const records = rows.map(row => ({ id: z.string().parse(row.header.id), type: row.header.type, ticket: z.number().parse(row.header.ticket), client, body: row.body })).toSorted((left, right) => left.id.localeCompare(right.id));
    return { uuid: docUuid, docType, metadata: head.body, records, semanticSha256: sha256Json({ uuid: docUuid, docType, metadata: head.body, records: records.map(({ id, type, body }) => ({ id, type, body })) }) };
  };
  const documents = [document(footprintHead, entries.slice(1, 5)), document(pcbHead, entries.slice(6, 10))].toSorted((left, right) => left.uuid.localeCompare(right.uuid));
  const history: NativeHistorySnapshot = { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid, projectOwnerUuid: actor, branchUuid, headHistoryUuid: historyUuid,
    checkpointSha256: input.inventory.checkpointSha256, historyRowCount: 1, chunkCount: 1, plaintextBytes: Buffer.byteLength(plaintext), documents,
    semanticSha256: sha256Json(documents.map(doc => ({ uuid: doc.uuid, docType: doc.docType, semanticSha256: doc.semanticSha256 }))) };
  const qualification: QualifiedGeneratedComponentFixtureTarget = Object.freeze({ schema: "easyeda-pro-control.qualified-generated-component-fixture-target.v1",
    target: Object.freeze({ rawWindowsPath: input.rawWindowsPath, projectUuid, branchUuid, documentUuid, expectedSourceSha256: input.inventory.checkpointSha256 }), footprintUuid, componentId, ownedPadId: componentId + padId,
    archiveSha256: original.archiveSha256, qualificationSha256: original.qualificationSha256, inventoryLogicalSha256: input.inventory.logicalSha256, sourceSha256: sha256Text(plaintext), nativeLocalOffsetMinutes,
    sourceCreatedEpochMs: input.sourceCreatedEpochMs, sourceModifiedEpochMs: input.sourceModifiedEpochMs, completeInitialSqlRowsQualified: true, exactInitialNativePayloadQualified: true, untickedDocHeadsQualified: true,
    nativeComponentCacheQualified: false, nativeIndexQualified: false, writerClockAuthority: false, registrationVerified: false, designExecutionAuthorized: false });
  qualifications.set(qualification, { text: canonicalJson(qualification), inventory: input.inventory }); return Object.freeze({ qualification, history });
}
export function assertOriginalGeneratedComponentFixtureTarget(value: QualifiedGeneratedComponentFixtureTarget): void {
  const original = qualifications.get(value); need(original !== undefined && original.text === canonicalJson(value), "original issued complete Component data target"); readerCompletion(original.inventory);
}
export function originalGeneratedComponentFixtureInventory(value: QualifiedGeneratedComponentFixtureTarget): NativeSqlInventory {
  assertOriginalGeneratedComponentFixtureTarget(value); const original = qualifications.get(value); if (original === undefined) { throw new Error("Original Component inventory unavailable."); } return original.inventory;
}
