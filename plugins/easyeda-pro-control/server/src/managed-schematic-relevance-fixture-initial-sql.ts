/* oxlint-disable import/max-dependencies -- A distinct full SCH/ATTR baseline joins exact source templates, the immutable structure profile, SQL completion and native history without an old-profile alias. */
import { z } from "zod";
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { qualifyManagedFixtureArchive } from "./managed-fixture-archive.ts";
import { qualifyGeneratedInitialSqlRows } from "./managed-fixture-initial-sql-common.ts";
import type { GeneratedFixtureInitialSqlInput } from "./managed-fixture-initial-sql-common.ts";
import { readManagedLibraryZip } from "./managed-library-files-zip.ts";
import { MANAGED_SCHEMATIC_FIXTURE_BUS_LINE, MANAGED_SCHEMATIC_FIXTURE_GROUP,
  MANAGED_SCHEMATIC_FIXTURE_TEXT, MANAGED_SCHEMATIC_FIXTURE_WIRE_LINE } from "./managed-schematic-fixture-generator.ts";
import { MANAGED_SCHEMATIC_RELEVANCE_ATTRIBUTE, MANAGED_SCHEMATIC_RELEVANCE_FIXTURE_PROFILE } from "./managed-schematic-relevance-fixture-generator.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "./native-history.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { NativeSqlInventory } from "./sqlite-inventory-core.ts";

import { MANAGED_SCHEMATIC_INITIAL_SQL_PROFILE } from "./managed-schematic-fixture-initial-sql.ts";

export interface QualifiedGeneratedSchematicRelevanceFixtureTarget {
  readonly schema: "easyeda-pro-control.qualified-generated-schematic-relevance-fixture-target.v1";
  readonly target: Readonly<{ rawWindowsPath: string; projectUuid: string; branchUuid: string; schematicUuid: string; pageUuid: string; expectedSourceSha256: string }>;
  readonly archiveSha256: string; readonly qualificationSha256: string; readonly inventoryLogicalSha256: string;
  readonly sourceSha256: string; readonly initialSqlProfileSha256: string; readonly nativeLocalOffsetMinutes: number;
  readonly sourceCreatedEpochMs: number; readonly sourceModifiedEpochMs: number;
  readonly completeInitialSqlRowsQualified: true; readonly exactInitialNativePayloadQualified: true; readonly untickedDocHeadsQualified: true;
  readonly completeSchematicAndPageRosterQualified: true; readonly writerClockAuthority: false; readonly registrationVerified: false;
  readonly nativePageReadinessVerified: false; readonly electricalConnectivityVerified: false; readonly designExecutionAuthorized: false;
}
const RELEVANCE_INITIAL_SQL_PROFILE = Object.freeze({ schema: "easyeda-pro-control.sch209-relevance-initial-sql-profile.v1", base: MANAGED_SCHEMATIC_INITIAL_SQL_PROFILE,
  template: MANAGED_SCHEMATIC_RELEVANCE_FIXTURE_PROFILE });
const qualifications = new WeakMap<object, Readonly<{ text: string; inventory: NativeSqlInventory }>>();
const uuid = z.string().regex(/^[a-f0-9]{32}$/u); const clientId = z.string().regex(/^[a-f0-9]{16}$/u);
const sourceRow = z.object({ header: z.object({ type: z.string(), id: z.string().optional(), ticket: z.number().int().nonnegative().optional() }).strict(),
  body: z.record(z.string(), z.unknown()) }).strict();
const headBody = z.object({ docType: z.enum(["SCH", "SCH_PAGE"]), uuid, client: clientId, updateTime: z.number().int().positive(),
  version: z.string(), editVersion: z.literal("3.2.209") }).strict().refine(value => value.version === String(value.updateTime));
function need(value: boolean, reason: string): asserts value { if (!value) { throw new Error(`Generated schematic initial SQL refused: ${reason}.`); } }

/** Distinct new-data baseline. No PCB stand-in, synthetic document, numeric
 * DOCHEAD substitution, caller attestation or old runtime ownership is admitted.
 */
export async function qualifyGeneratedSchematicRelevanceFixtureInitialSql(inputValue: GeneratedFixtureInitialSqlInput): Promise<Readonly<{
  qualification: QualifiedGeneratedSchematicRelevanceFixtureTarget; history: NativeHistorySnapshot;
}>> {
  const input = Object.freeze({ archive: Buffer.from(inputValue.archive), inventory: inputValue.inventory, rawWindowsPath: inputValue.rawWindowsPath,
    sourceCreatedEpochMs: inputValue.sourceCreatedEpochMs, sourceModifiedEpochMs: inputValue.sourceModifiedEpochMs }); readerCompletion(input.inventory);
  const original = qualifyManagedFixtureArchive(input.archive);
  need(/^Codex_schematic_relevance_[a-f0-9]{16}$/u.test(original.manifest.title) && input.rawWindowsPath.endsWith(`\\${original.expectedDestinationBasename}`), "fixed generated schematic filename");
  const source = readManagedLibraryZip(input.archive).get(original.source.member); need(source !== undefined, "complete original source member");
  const entries = source.toString("utf8").slice(0, -2).split("|\n").map(value => {
    const boundary = value.indexOf("||"); return sourceRow.parse({ header: JSON.parse(value.slice(0, boundary)) as unknown, body: JSON.parse(value.slice(boundary + 2)) as unknown });
  });
  need(canonicalJson(entries.map(entry => entry.header.type)) === canonicalJson(["DOCHEAD", "META", "DOCHEAD", "META", "TEXT", "WIRE", "LINE", "BUS", "LINE", "ATTR"]), "exact two-document fixed family roster");
  const schematic = entries[0]; const schematicMeta = entries[1]; const page = entries[2]; const pageMeta = entries[3];
  need(schematic !== undefined && schematicMeta !== undefined && page !== undefined && pageMeta !== undefined, "complete schematic/page headers and metadata");
  const schHead = headBody.parse(schematic.body), sheetHead = headBody.parse(page.body);
  need(schHead.docType === "SCH" && sheetHead.docType === "SCH_PAGE" && schHead.uuid !== sheetHead.uuid &&
    schHead.client === sheetHead.client && schHead.updateTime === sheetHead.updateTime && schHead.version === sheetHead.version &&
    canonicalJson(schematic.header) === canonicalJson({ type: "DOCHEAD" }) && canonicalJson(page.header) === canonicalJson({ type: "DOCHEAD" }), "exact unticked paired source headers");
  need(canonicalJson(original.documents.map(document => ({ uuid: document.uuid, type: document.documentType }))) ===
    canonicalJson([{ uuid: schHead.uuid, type: "SCH" }, { uuid: sheetHead.uuid, type: "SCH_PAGE" }]), "complete source document UUID/type roster");
  need(canonicalJson(schematicMeta.body) === canonicalJson({ title: "Schematic1", source: "", board: "", zIndex: null }) &&
    canonicalJson(pageMeta.body) === canonicalJson({ title: "Sheet1", schematic: schHead.uuid, source: "", zIndex: 1 }), "fixed metadata and real schematic parent");
  for (const meta of [schematicMeta, pageMeta]) { need(canonicalJson(meta.header) === canonicalJson({ type: "META", ticket: 1, id: "META" }), "exact initial metadata clocks"); }
  const text = entries[4]; const wire = entries[5]; const wireLine = entries[6]; const bus = entries[7]; const busLine = entries[8]; const relevance = entries[9];
  need(text !== undefined && wire !== undefined && wireLine !== undefined && bus !== undefined && busLine !== undefined && relevance !== undefined, "complete fixed primitive roster");
  const primitives = [text, wire, wireLine, bus, busLine, relevance];
  for (const [index, entry] of primitives.entries()) { need(entry.header.id !== undefined && /^0[a-f0-9]{15}$/u.test(entry.header.id) && entry.header.ticket === index + 2 && Object.keys(entry.header).length === 3, "fixed primitive ID/clock roster"); }
  need(new Set([schHead.uuid, sheetHead.uuid, schHead.client, ...primitives.map(entry => entry.header.id)]).size === 9, "fresh distinct identities");
  need(canonicalJson(text.body) === canonicalJson(MANAGED_SCHEMATIC_FIXTURE_TEXT) && canonicalJson(wire.body) === canonicalJson(MANAGED_SCHEMATIC_FIXTURE_GROUP) &&
    canonicalJson(wireLine.body) === canonicalJson({ lineGroup: wire.header.id, ...MANAGED_SCHEMATIC_FIXTURE_WIRE_LINE }) &&
    canonicalJson(bus.body) === canonicalJson({ ...MANAGED_SCHEMATIC_FIXTURE_GROUP, busEntry: {} }) &&
    canonicalJson(busLine.body) === canonicalJson({ lineGroup: bus.header.id, ...MANAGED_SCHEMATIC_FIXTURE_BUS_LINE }) &&
    canonicalJson(relevance.body) === canonicalJson({ ...MANAGED_SCHEMATIC_RELEVANCE_ATTRIBUTE, parentId: wire.header.id }), "complete fixed Text/Wire/Bus bodies and line ownership");
  const directory = input.rawWindowsPath.slice(0, input.rawWindowsPath.lastIndexOf("\\"));
  const structure = { boards: {}, schematics: { [schHead.uuid]: { uuid: schHead.uuid, name: "Schematic1", board: "", source: "", version: schHead.version, updateTime: schHead.updateTime } },
    sheets: { [sheetHead.uuid]: { uuid: sheetHead.uuid, title: "Sheet1", schematic_uuid: schHead.uuid, zIndex: 1, source: "", version: sheetHead.version, updateTime: sheetHead.updateTime } },
    pcbs: {}, panels: {}, blockSymbols: {}, owner: { uuid: `${directory}/`, username: "", nickname: "" } };
  const common = await qualifyGeneratedInitialSqlRows(input, { source, title: original.manifest.title, structureJson: JSON.stringify(structure) });
  const document = (head: typeof schHead, sourceEntries: typeof entries): NativeDocumentSnapshot => {
    const records = sourceEntries.map(entry => { need(entry.header.id !== undefined && entry.header.ticket !== undefined, "complete native record identity");
      return { id: entry.header.id, type: entry.header.type, ticket: entry.header.ticket, client: head.client, body: entry.body }; }).toSorted((left, right) => left.id.localeCompare(right.id));
    return { uuid: head.uuid, docType: head.docType, metadata: head, records,
      semanticSha256: sha256Json({ uuid: head.uuid, docType: head.docType, metadata: head, records: records.map(({ id, type, body }) => ({ id, type, body })) }) };
  };
  const documents = [document(schHead, [schematicMeta]), document(sheetHead, entries.slice(3))];
  const history: NativeHistorySnapshot = { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: common.projectUuid, projectOwnerUuid: common.actor,
    branchUuid: common.branchUuid, headHistoryUuid: common.historyUuid, checkpointSha256: input.inventory.checkpointSha256, historyRowCount: 1, chunkCount: 1,
    plaintextBytes: Buffer.byteLength(common.plaintext), documents, semanticSha256: sha256Json(documents.map(value => ({ uuid: value.uuid, docType: value.docType, semanticSha256: value.semanticSha256 }))) };
  const target = Object.freeze({ rawWindowsPath: input.rawWindowsPath, projectUuid: common.projectUuid, branchUuid: common.branchUuid, schematicUuid: schHead.uuid,
    pageUuid: sheetHead.uuid, expectedSourceSha256: input.inventory.checkpointSha256 });
  const qualification: QualifiedGeneratedSchematicRelevanceFixtureTarget = Object.freeze({ schema: "easyeda-pro-control.qualified-generated-schematic-relevance-fixture-target.v1", target,
    archiveSha256: original.archiveSha256, qualificationSha256: original.qualificationSha256, inventoryLogicalSha256: input.inventory.logicalSha256,
    sourceSha256: sha256Text(common.plaintext), initialSqlProfileSha256: sha256Json(RELEVANCE_INITIAL_SQL_PROFILE), nativeLocalOffsetMinutes: common.nativeLocalOffsetMinutes,
    sourceCreatedEpochMs: input.sourceCreatedEpochMs, sourceModifiedEpochMs: input.sourceModifiedEpochMs, completeInitialSqlRowsQualified: true,
    exactInitialNativePayloadQualified: true, untickedDocHeadsQualified: true, completeSchematicAndPageRosterQualified: true, writerClockAuthority: false,
    registrationVerified: false, nativePageReadinessVerified: false, electricalConnectivityVerified: false, designExecutionAuthorized: false });
  readerCompletion(input.inventory); qualifications.set(qualification, { text: canonicalJson(qualification), inventory: input.inventory });
  return Object.freeze({ qualification, history });
}
export function assertOriginalGeneratedSchematicRelevanceFixtureTarget(value: QualifiedGeneratedSchematicRelevanceFixtureTarget): void {
  need(qualifications.get(value)?.text === canonicalJson(value), "original issued schematic data target required");
}
export function originalGeneratedSchematicRelevanceFixtureInventory(value: QualifiedGeneratedSchematicRelevanceFixtureTarget): NativeSqlInventory {
  assertOriginalGeneratedSchematicRelevanceFixtureTarget(value); const original = qualifications.get(value); need(original !== undefined, "original schematic inventory");
  readerCompletion(original.inventory); return original.inventory;
}
