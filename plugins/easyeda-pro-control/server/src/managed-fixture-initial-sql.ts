import { z } from "zod";
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { qualifyManagedFixtureArchive } from "./managed-fixture-archive.ts";
import { readManagedLibraryZip } from "./managed-library-files-zip.ts";
import { MANAGED_FIXTURE_ARC_BODY, MANAGED_FIXTURE_LINE_BODY, MANAGED_FIXTURE_VIA_BODY } from "./managed-fixture-generator.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "./native-history.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { NativeSqlInventory } from "./sqlite-inventory-core.ts";
import { qualifyGeneratedInitialSqlRows } from "./managed-fixture-initial-sql-common.ts";

export { MANAGED_FIXTURE_INITIAL_BASE_SQL_ROWS } from "./managed-fixture-initial-sql-common.ts";

const qualifications = new WeakMap<object, Readonly<{ text: string; inventory: NativeSqlInventory }>>();
const uuid = z.string().regex(/^[a-f0-9]{32}$/u);
const sourceRowSchema = z.object({ header: z.object({ type: z.string(), id: z.string().optional(), ticket: z.number().int().nonnegative().optional() }).strict(), body: z.record(z.string(), z.unknown()) });
export interface QualifiedGeneratedFixtureTarget {
  readonly schema: "easyeda-pro-control.qualified-generated-fixture-target.v1";
  readonly target: Readonly<{ rawWindowsPath: string; projectUuid: string; branchUuid: string; documentUuid: string; expectedSourceSha256: string }>;
  readonly archiveSha256: string;
  readonly qualificationSha256: string;
  readonly inventoryLogicalSha256: string;
  readonly sourceSha256: string;
  readonly nativeLocalOffsetMinutes: number;
  readonly sourceCreatedEpochMs: number;
  readonly sourceModifiedEpochMs: number;
  readonly completeInitialSqlRowsQualified: true;
  readonly exactInitialNativePayloadQualified: true;
  readonly untickedDocHeadQualified: true;
  readonly writerClockAuthority: false;
  readonly registrationVerified: false;
  readonly designExecutionAuthorized: false;
}
function need(value: boolean, reason: string): asserts value { if (!value) { throw new Error(`Generated fixture initial SQL refused: ${reason}.`); } }

/** Qualify a new initial baseline, not a user-project delta. Every table, row,
 * column, raw encrypted history payload and original archive record is covered.
 * Dynamic IDs must be native UUIDs linked exactly across their source-defined
 * rows. File birth/mtime bound SQLite UTC defaults and the unique local So
 * formatter offset. This timestamp evidence grants no writer clock authority.
 */
export async function qualifyGeneratedFixtureInitialSql(inputValue: Readonly<{
  archive: Buffer; inventory: NativeSqlInventory; rawWindowsPath: string;
  sourceCreatedEpochMs: number; sourceModifiedEpochMs: number;
}>): Promise<Readonly<{ qualification: QualifiedGeneratedFixtureTarget; history: NativeHistorySnapshot }>> {
  const input = Object.freeze({ archive: Buffer.from(inputValue.archive), inventory: inputValue.inventory, rawWindowsPath: inputValue.rawWindowsPath,
    sourceCreatedEpochMs: inputValue.sourceCreatedEpochMs, sourceModifiedEpochMs: inputValue.sourceModifiedEpochMs });
  readerCompletion(input.inventory);
  const original = qualifyManagedFixtureArchive(input.archive), projectUuid = sha256Text(input.rawWindowsPath);
  need(input.rawWindowsPath.endsWith(`\\${original.expectedDestinationBasename}`) && /^Codex_(?:via_only|line_and_via|arc_line_and_via)_[a-f0-9]{16}$/u.test(original.manifest.title), "original generated filename");
  const source = readManagedLibraryZip(input.archive).get(original.source.member); need(source !== undefined, "original source member");
  const entries = source.toString("utf8").slice(0, -2).split("|\n").map((text) => { const boundary = text.indexOf("||");
    return sourceRowSchema.parse({ header: JSON.parse(text.slice(0, boundary)) as unknown, body: JSON.parse(text.slice(boundary + 2)) as unknown }); });
  const head = entries[0], meta = entries[1]; need(head !== undefined && meta !== undefined, "generated header/META");
  const arc = original.manifest.title.startsWith("Codex_arc_line_and_via_"); const line = arc || original.manifest.title.startsWith("Codex_line_and_via_");
  need(canonicalJson(entries.map((entry) => entry.header.type)) === canonicalJson(["DOCHEAD", "META", "VIA", ...(line ? ["LINE"] : []), ...(arc ? ["ARC"] : [])]), "generated family roster");
  need(head.header.ticket === undefined && Object.keys(head.header).length === 1 && meta.header.id === "META" && meta.header.ticket === 1, "exact initial unticked header and META clock");
  need(canonicalJson(meta.body) === canonicalJson({ title: "PCB1", parent: "", source: "", board: "", zIndex: null }) &&
    canonicalJson(entries[2]?.body) === canonicalJson(MANAGED_FIXTURE_VIA_BODY) && (!line || canonicalJson(entries[3]?.body) === canonicalJson(MANAGED_FIXTURE_LINE_BODY)) &&
    (!arc || canonicalJson(entries[4]?.body) === canonicalJson(MANAGED_FIXTURE_ARC_BODY)), "exact fixed geometry and META");
  const documentUuid = uuid.parse(head.body["uuid"]); const client = z.string().regex(/^[a-f0-9]{16}$/u).parse(head.body["client"]);
  need(head.body["docType"] === "PCB" && head.body["editVersion"] === "3.2.209" && typeof head.body["updateTime"] === "number" && head.body["version"] === String(head.body["updateTime"]), "original source header");
  const directory = input.rawWindowsPath.slice(0, input.rawWindowsPath.lastIndexOf("\\"));
  const structure = { boards: {}, schematics: {}, sheets: {}, pcbs: { [documentUuid]: { uuid: documentUuid, title: "PCB1", board: "", zIndex: null,
    parent_uuid: "", source: "", version: head.body["version"], updateTime: head.body["updateTime"] } }, panels: {}, blockSymbols: {}, owner: { uuid: `${directory}/`, username: "", nickname: "" } };
  const { actor, branchUuid, historyUuid, plaintext, nativeLocalOffsetMinutes: offsetMinimum } = await qualifyGeneratedInitialSqlRows(input,
    { source, title: original.manifest.title, structureJson: JSON.stringify(structure) });
  const records = entries.slice(1).map((entry, index) => {
    need(entry.header.id !== undefined && entry.header.ticket === index + 1, "exact META/primitive IDs/tickets");
    return { id: entry.header.id, type: entry.header.type, ticket: entry.header.ticket, client, body: entry.body };
  }).toSorted((left, right) => left.id.localeCompare(right.id));
  const document: NativeDocumentSnapshot = { uuid: documentUuid, docType: "PCB", metadata: head.body, records,
    semanticSha256: sha256Json({ uuid: documentUuid, docType: "PCB", metadata: head.body, records: records.map(({ id, type, body }) => ({ id, type, body })) }) };
  const history: NativeHistorySnapshot = { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid, projectOwnerUuid: actor, branchUuid,
    headHistoryUuid: historyUuid, checkpointSha256: input.inventory.checkpointSha256, historyRowCount: 1, chunkCount: 1, plaintextBytes: Buffer.byteLength(plaintext), documents: [document],
    semanticSha256: sha256Json([{ uuid: documentUuid, docType: "PCB", semanticSha256: document.semanticSha256 }]) };
  const target = Object.freeze({ rawWindowsPath: input.rawWindowsPath, projectUuid, branchUuid, documentUuid, expectedSourceSha256: input.inventory.checkpointSha256 });
  const qualification: QualifiedGeneratedFixtureTarget = Object.freeze({ schema: "easyeda-pro-control.qualified-generated-fixture-target.v1", target,
    archiveSha256: original.archiveSha256, qualificationSha256: original.qualificationSha256, inventoryLogicalSha256: input.inventory.logicalSha256,
    sourceSha256: sha256Text(plaintext), nativeLocalOffsetMinutes: offsetMinimum, sourceCreatedEpochMs: input.sourceCreatedEpochMs,
    sourceModifiedEpochMs: input.sourceModifiedEpochMs, completeInitialSqlRowsQualified: true, exactInitialNativePayloadQualified: true,
    untickedDocHeadQualified: true, writerClockAuthority: false, registrationVerified: false, designExecutionAuthorized: false });
  readerCompletion(input.inventory);
  qualifications.set(qualification, { text: canonicalJson(qualification), inventory: input.inventory }); return Object.freeze({ qualification, history });
}
export function assertOriginalGeneratedFixtureTarget(value: QualifiedGeneratedFixtureTarget): void {
  need(qualifications.get(value)?.text === canonicalJson(value), "original issued generated target required");
}
/** Actual immutable completed reader object, retained by the qualification.
 * It supplies the source side of the one-field VACUUM projection; JSON copies
 * and caller-created inventory reports cannot serve as either side.
 */
export function originalGeneratedFixtureInventory(value: QualifiedGeneratedFixtureTarget): NativeSqlInventory {
  assertOriginalGeneratedFixtureTarget(value); const original = qualifications.get(value);
  need(original !== undefined, "original initial inventory"); readerCompletion(original.inventory); return original.inventory;
}
