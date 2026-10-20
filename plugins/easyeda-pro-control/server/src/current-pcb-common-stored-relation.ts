/** Supplied common-body/history join for an otherwise empty ordinary PCB.
 * Original SQL-reader identity and original runner issuance are not live owner,
 * prototype integrity, atomicity, quiescence or permission to create/Save. */
import { types } from "node:util";
import { z } from "zod";
import { yieldProofEventLoop } from "./cooperative-proof.ts";
import { canonicalJson, isRecord, sha256Json, sha256Text } from "./core.ts";
import { requireOriginalCurrentPcbCommonBaselineReplies } from "./current-pcb-common-baseline-runner.ts";
import type { CurrentPcbCommonBaselineObservation } from "./current-pcb-common-baseline-runner.ts";
import { encodeCurrentPcbCommonPreference, encodeCurrentPcbCommonPresentation } from "./current-pcb-common-encoding.ts";
import { encodeCurrentPcbCommonRulesAndPrimitives } from "./current-pcb-common-rule-encoding.ts";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { currentPcbStoredHeaderSchema } from "./current-pcb-stored-header.ts";
import { decodeCurrentPcbStringEmptyAssets } from "./current-pcb-string-empty-assets.ts";
// oxlint-disable-next-line import/max-dependencies -- Pure composition reuses the complete SQL/history decoder and existing common encoders instead of adding an alternate native parser or transport.
import { isNativeDocumentDeleted, parseNativeRecords } from "./native-history.ts";
import type { NativeDocumentSnapshot, NativeObjectSnapshot } from "./native-history.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { SqlCell, SqlRow, SqlTable, readExactSqlInventory } from "./sqlite-inventory.ts";
import { decodeCurrentSymbolPreEditHistory } from "./symbol-sql-comparator.ts";
import { encodeCurrentPcbCommonMetadata } from "./current-pcb-common-metadata.ts";

type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
type DecodedHistory = Awaited<ReturnType<typeof decodeCurrentSymbolPreEditHistory>>;
type BodyRow = Readonly<{ dataType: string; id: string; bodyText: string; bodySha256: string }>;
const identifier = z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u);
const identitySchema = z.object({ projectUuid: z.string().regex(/^(?:[a-f\d]{32}|[a-f\d]{64})$/u),
  branchUuid: z.string().regex(/^[a-f\d]{32}$/u), documentUuid: identifier }).strict();
export type CurrentPcbCommonStoredIdentity = z.infer<typeof identitySchema>;
const jsonText = z.string().min(2).max(16_384).refine(value => value.isWellFormed() && Buffer.byteLength(value) <= 16_384);
const suppliedMetadataSchema = z.object({ headerText: jsonText, metaBodyText: jsonText }).strict();
const metaSchema = z.object({ title: z.string().max(4096), parent: z.literal(""), source: z.literal(""),
  board: z.union([z.literal(""), identifier]), zIndex: z.number().int().min(0).max(1_000_000).refine(value => !Object.is(value, -0)).nullable() }).strict();
const LIMITS = Object.freeze({ originalOwnerVerified: false, nativeIntrinsicsVerified: false,
  originalPrototypeIntegrityVerified: false, metadataObservationProvenanceVerified: false,
  atomicSnapshotVerified: false, continuousObservation: false, completeLiveBaselineVerified: false,
  completeStoredAssetsOwnershipVerified: false, nativeNoMutationVerified: false,
  queueCompletionVerified: false, completeEffectVerified: false, closedFileOwnershipVerified: false,
  savedVerified: false, reopenedVerified: false, saveAuthorized: false, executionAuthorized: false } as const);

type SerializedClient = Readonly<{ kind: "absent" | "null" }> | Readonly<{ kind: "value"; value: string }>;
interface Occurrence {
  readonly chunkIndex: number; readonly recordIndex: number; readonly type: string; readonly id: string | null;
  readonly ticket: number; readonly client: string | null; readonly serializedClient: SerializedClient;
  readonly inheritedClient: string | null; readonly headerSha256: string; readonly bodySha256: string | null;
  readonly recordSha256: string; readonly bodyText: string; readonly body: Readonly<Record<string, unknown>> | null;
}
type Commitment = Omit<Occurrence, "bodyText" | "body">;
interface JoinedRow {
  readonly dataType: string; readonly id: string; readonly bodySha256: string;
  readonly selected: Commitment; readonly sameWinningClockOccurrences: number;
}
export interface CurrentPcbCommonStoredRelation extends Readonly<typeof LIMITS> {
  readonly profile: "private.current-pcb-common-stored-relation.v1";
  readonly identity: CurrentPcbCommonStoredIdentity;
  readonly suppliedTargetCommonAndMetaMatch: true;
  readonly metadataContract: "supplied-ordinary-root-header-and-meta-v1";
  readonly beforeSqlSha256: string; readonly checkpointSha256: string;
  readonly historySha256: string; readonly completeHistoryLinksSha256: string;
  readonly historyChunkSha256: readonly string[]; readonly maximumHistoryTicket: number;
  readonly documentCount: number; readonly peerDocumentsSha256: string;
  readonly targetSemanticSha256: string; readonly targetOccurrencesSha256: string; readonly targetOccurrenceCount: number;
  readonly selectedHeader: Commitment; readonly rows: readonly JoinedRow[];
  readonly commonEmissionOrder: readonly string[]; readonly bodySequenceSha256: string;
  readonly presentationGraphSha256: string; readonly rulesGraphSha256: string; readonly preferenceGraphSha256: string;
  readonly suppliedReplySha256: Readonly<Record<string, string>>; readonly suppliedMetadataSha256: string;
  readonly structureRowsSha256: string; readonly structureTextSha256: string; readonly structureRowCount: number;
  readonly relationSha256: string;
}
export interface CurrentPcbCommonStoredInput {
  readonly before: Inventory; readonly identity: CurrentPcbCommonStoredIdentity;
  readonly replies: Readonly<{ presentation: unknown; rules: unknown; preference: unknown; assets: unknown }>;
  /** Bounded supplied contract only. This is not a native metadata observation. */
  readonly metadata: Readonly<{ headerText: string; metaBodyText: string }>;
}
function need(ok: boolean, detail: string): asserts ok {
  if (!ok) { throw new Error(`PCB_COMMON_STORED_RELATION: ${detail}`); }
}
function own(input: unknown, fields: readonly string[]): Record<string, unknown> {
  need(input !== null && typeof input === "object" && !types.isProxy(input) && !Array.isArray(input), "own plain input required");
  const keys = Reflect.ownKeys(input), prototype: unknown = Object.getPrototypeOf(input);
  need((prototype === Object.prototype || prototype === null) && keys.length === fields.length &&
    keys.every(key => typeof key === "string" && fields.includes(key)), "input fields differ");
  return Object.fromEntries(fields.map(key => {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value"), "own data input required");
    return [key, descriptor.value as unknown];
  }));
}
function rawReplyText(input: unknown): string {
  const wrapper = own(input, ["result"]);
  const result = own(wrapper["result"], ["type", "value"]);
  need(result["type"] === "string" && typeof result["value"] === "string", "raw reply text required"); return result["value"];
}
function parseMetadata(input: unknown, documentUuid: string): { headerText: string; metaBodyText: string;
  header: z.infer<typeof currentPcbStoredHeaderSchema>; meta: z.infer<typeof metaSchema> } {
  const supplied = suppliedMetadataSchema.parse(own(input, ["headerText", "metaBodyText"]));
  const header: unknown = decodeCurrentPcbDiagnosticJson(Buffer.from(supplied.headerText));
  const meta: unknown = decodeCurrentPcbDiagnosticJson(Buffer.from(supplied.metaBodyText));
  const parsedHeader = currentPcbStoredHeaderSchema.parse(header), parsedMeta = metaSchema.parse(meta);
  need(parsedHeader.uuid === documentUuid, "supplied metadata document differs");
  need(JSON.stringify(header) === supplied.headerText && JSON.stringify(meta) === supplied.metaBodyText, "metadata exact JSON encoding required");
  return { ...supplied, header: parsedHeader, meta: parsedMeta };
}
function sqlTable(before: Inventory, name: string): SqlTable {
  const tables = before.tables.filter(table => table.name === name);
  const table = tables[0]; need(tables.length === 1 && table !== undefined, "unique SQL table required"); return table;
}
function sqlField(table: SqlTable, row: SqlRow, name: string): SqlCell {
  const index = table.columns.findIndex(column => column["name"] === name);
  const cell = row.cells[index];
  need(index !== -1 && cell !== undefined, "SQL column required"); return cell;
}
function sqlText(cell: SqlCell): string {
  need(cell.kind === "text", "SQL TEXT required");
  const bytes = Buffer.from(cell.hex, "hex"), text = bytes.toString("utf8");
  need(Buffer.from(text).equals(bytes), "exact SQL UTF8 required"); return text;
}
function structureRelation(before: Inventory, identity: CurrentPcbCommonStoredIdentity, metadata: ReturnType<typeof parseMetadata>,
  maximumTicket: number): { structureRowsSha256: string; structureTextSha256: string; structureRowCount: number } {
  const table = sqlTable(before, "project_structures"); need(table.rows.length <= 4096, "structure row bound");
  const rows = table.rows.filter(row => sqlText(sqlField(table, row, "branch_uuid")) === identity.branchUuid);
  const first = rows[0]; need(first !== undefined, "structure branch rows required");
  const text = sqlText(sqlField(table, first, "structure")); need(Buffer.byteLength(text) <= 2_097_152, "structure text bound");
  for (const row of rows) {
    const ticket = sqlField(table, row, "ticket");
    need(sqlText(sqlField(table, row, "project_uuid")) === identity.projectUuid && ticket.kind === "integer" &&
      BigInt(ticket.decimal) >= 0n && BigInt(ticket.decimal) <= BigInt(maximumTicket) &&
      sqlText(sqlField(table, row, "structure")) === text, "selected structure rows differ");
  }
  const value = decodeCurrentPcbDiagnosticJson(Buffer.from(text));
  need(isRecord(value) && JSON.stringify(value) === text && Object.keys(value).join(",") ===
    "boards,schematics,sheets,pcbs,panels,blockSymbols,owner", "native structure framing differs");
  for (const key of ["boards", "schematics", "sheets", "pcbs", "panels", "blockSymbols"]) { need(isRecord(value[key]), "structure collection required"); }
  const projects = sqlTable(before, "projects");
  const project = projects.rows[0];
  need(projects.rows.length === 1 && project !== undefined && isRecord(value["owner"]) &&
    value["owner"]["uuid"] === sqlText(sqlField(projects, project, "owner_uuid")) && isRecord(value["pcbs"]), "structure owner differs");
  const target = value["pcbs"][identity.documentUuid];
  need(isRecord(target) && target["uuid"] === identity.documentUuid && target["title"] === metadata.meta.title &&
    target["board"] === metadata.meta.board && target["parent_uuid"] === "" && target["source"] === "" &&
    target["version"] === metadata.header.version && target["updateTime"] === metadata.header.updateTime &&
    (target["docType"] === undefined || target["docType"] === 3) &&
    (target["zIndex"] === undefined ? metadata.meta.zIndex === null : target["zIndex"] === metadata.meta.zIndex) &&
    Object.keys(target).every(key => ["uuid", "title", "board", "zIndex", "docType", "parent_uuid", "source", "version", "updateTime"].includes(key)),
  "target structure and stored metadata differ");
  return { structureRowsSha256: sha256Json(rows), structureTextSha256: sha256Text(text), structureRowCount: rows.length };
}
function commitment(value: Occurrence): Commitment {
  const { body: _body, bodyText: _bodyText, ...rest } = value; return rest;
}
function integer(value: unknown): number {
  need(typeof value === "number" && Number.isSafeInteger(value) && value >= 0 && !Object.is(value, -0), "ticket differs"); return value;
}
function client(value: unknown): string | null {
  if (value === undefined) { return null; }
  need(typeof value === "string" && value.length > 0 && value.length <= 128, "client differs"); return value;
}
async function targetOccurrences(chunks: readonly string[], documentUuid: string): Promise<Occurrence[]> {
  const result: Occurrence[] = []; let bytes = 0, count = 0;
  for (const [chunkIndex, chunk] of chunks.entries()) {
    let current: unknown, inheritedClient: string | null = null;
    const lines = chunk.split("|\n"); if (lines.at(-1) === "") { lines.pop(); }
    for (const [recordIndex, line] of lines.entries()) {
      count += 1; need(count <= 50_000, "history occurrence bound");
      const records = parseNativeRecords(line);
      const record = records[0];
      need(records.length === 1 && record !== undefined, "raw occurrence framing differs");
      const { body, header } = record, type = header["type"];
      need(typeof type === "string", "raw record type differs");
      if (type === "DOCHEAD") {
        current = body?.["uuid"]; inheritedClient = client(body?.["client"]);
      }
      if (current === documentUuid && type !== "EDIT_HEAD") {
        const split = line.indexOf("||");
        const bodyText = line.slice(split + 2), rawClient = header["client"];
        let serializedClient: SerializedClient = { kind: "absent" };
        if (rawClient === null) { serializedClient = { kind: "null" }; }
        else if (rawClient !== undefined) { const explicit = client(rawClient); need(explicit !== null, "explicit client differs"); serializedClient = { kind: "value", value: explicit }; }
        const id = type === "DOCHEAD" ? null : header["id"]; need(id === null || typeof id === "string", "record ID differs");
        result.push({ chunkIndex, recordIndex, type, id, ticket: integer(header["ticket"]),
          client: client(rawClient ?? inheritedClient ?? undefined), serializedClient, inheritedClient,
          headerSha256: sha256Text(line.slice(0, split)), bodySha256: body === null ? null : sha256Text(bodyText),
          recordSha256: sha256Text(line), bodyText, body });
        need(result.length <= 20_000, "target occurrence bound");
      }
      bytes += Buffer.byteLength(line);
      if (count % 128 === 0 || bytes >= 65_536) { bytes = 0; await yieldProofEventLoop(); }
    }
    await yieldProofEventLoop();
  }
  return result;
}
function selectHeader(occurrences: readonly Occurrence[], target: NativeDocumentSnapshot, expected: string): Occurrence {
  let selected: Occurrence | undefined;
  for (const item of occurrences) { if (item.type === "DOCHEAD" && (selected === undefined || item.ticket > selected.ticket)) { selected = item; } }
  need(selected !== undefined && canonicalJson(selected.body) === canonicalJson(target.metadata), "materialized header join differs");
  need(selected.bodyText === expected, "supplied header bytes differ"); return selected;
}
function joinRow(expected: BodyRow, stored: NativeObjectSnapshot, occurrences: readonly Occurrence[]): JoinedRow {
  need(stored.type === expected.dataType && stored.id === expected.id, "stored row identity differs");
  const semantic = canonicalJson(stored.body);
  const matches = occurrences.filter(item => item.type === stored.type && item.id === stored.id &&
    item.ticket === stored.ticket && item.client === stored.client && canonicalJson(item.body) === semantic);
  // Existing materialization selects the first identical clock/client and the
  // Lexically greater non-null client on ties. Match its selected final clock,
  // Not physical last occurrence or the branch-wide maximum ticket.
  const selected = matches[0]; need(selected !== undefined, "materialized record has no raw occurrence");
  need(selected.bodyText === expected.bodyText, "stored common body bytes differ");
  return { dataType: expected.dataType, id: expected.id, bodySha256: expected.bodySha256,
    selected: commitment(selected), sameWinningClockOccurrences: matches.length };
}
function commonRows(replies: Record<string, unknown>): { rows: readonly BodyRow[]; documentUuid: string;
  presentationGraphSha256: string; rulesGraphSha256: string; preferenceGraphSha256: string } {
  const presentation = encodeCurrentPcbCommonPresentation(replies["presentation"]);
  const preference = encodeCurrentPcbCommonPreference(replies["preference"], replies["rules"]);
  const rules = encodeCurrentPcbCommonRulesAndPrimitives(replies["rules"], replies["presentation"]);
  const assets = decodeCurrentPcbStringEmptyAssets(replies["assets"]);
  need([preference.documentUuid, rules.documentUuid, assets.documentUuid].every(id => id === presentation.documentUuid), "supplied common documents differ");
  const rows = [...presentation.rows.filter(row => row.dataType !== "SILK_OPTS"), ...rules.rows,
    ...presentation.rows.filter(row => row.dataType === "SILK_OPTS"), ...preference.rows, rules.panelize];
  need(rows.length <= 2048 && new Set(rows.map(row => row.id)).size === rows.length, "common output roster differs");
  return { rows, documentUuid: presentation.documentUuid, presentationGraphSha256: presentation.rawGraphSha256,
    rulesGraphSha256: rules.rulesGraphSha256, preferenceGraphSha256: preference.rawGraphSha256 };
}
function targetDocument(history: DecodedHistory, documentUuid: string): NativeDocumentSnapshot {
  const matches = history.history.documents.filter(document => document.uuid === documentUuid), target = matches[0];
  need(matches.length === 1 && target !== undefined && target.docType === "PCB" && !isNativeDocumentDeleted(target), "active PCB target required"); return target;
}

/** Decode the original completed SQL inventory and each strict raw observation.
 * Every surviving target record must be a modeled common body or the supplied
 * META. No missing row is invented from native defaults or shared preferences. */
export async function prepareCurrentPcbCommonStoredRelation(input: CurrentPcbCommonStoredInput): Promise<CurrentPcbCommonStoredRelation> {
  const supplied = own(input, ["before", "identity", "replies", "metadata"]);
  const before = input.before, completion = readerCompletion(before);
  need(supplied["before"] === before, "original SQL input changed");
  need(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null, "original completed SQL reader required");
  const identity = identitySchema.parse(own(supplied["identity"], ["projectUuid", "branchUuid", "documentUuid"]));
  const replies = own(supplied["replies"], ["presentation", "rules", "preference", "assets"]);
  const common = commonRows(replies);
  need(common.documentUuid === identity.documentUuid, "target and common document differ");
  const metadata = parseMetadata(supplied["metadata"], identity.documentUuid);
  const replySha256 = Object.fromEntries(Object.entries(replies).map(([key, value]) => [key, sha256Text(rawReplyText(value))]));
  const history = await decodeCurrentSymbolPreEditHistory(before, { projectUuid: identity.projectUuid, branchUuid: identity.branchUuid });
  const target = targetDocument(history, identity.documentUuid);
  const structure = structureRelation(before, identity, metadata, history.maximumTicket);
  const occurrences = await targetOccurrences(history.chunks, identity.documentUuid);
  const header = selectHeader(occurrences, target, metadata.headerText);
  const expected = [...common.rows, { dataType: "META", id: "META", bodyText: metadata.metaBodyText, bodySha256: sha256Text(metadata.metaBodyText) }];
  need(target.records.length === expected.length, "missing or unmodeled surviving target rows");
  const stored = new Map(target.records.map(row => [row.id, row]));
  const indexed = new Map<string, Occurrence[]>();
  for (const occurrence of occurrences) {
    if (occurrence.id !== null) { const prior = indexed.get(occurrence.id) ?? []; prior.push(occurrence); indexed.set(occurrence.id, prior); }
  }
  const rows = expected.map(row => {
    const actual = stored.get(row.id); need(actual !== undefined, "missing required common row; defaults not inferred"); return joinRow(row, actual, indexed.get(row.id) ?? []);
  });
  const relation = { identity, beforeSqlSha256: before.logicalSha256, checkpointSha256: before.checkpointSha256,
    historySha256: history.history.semanticSha256, completeHistoryLinksSha256: sha256Json(history.links),
    historyChunkSha256: history.chunks.map(chunk => sha256Text(chunk)), maximumHistoryTicket: history.maximumTicket,
    documentCount: history.history.documents.length,
    peerDocumentsSha256: sha256Json(history.history.documents.filter(document => document.uuid !== identity.documentUuid)),
    targetSemanticSha256: target.semanticSha256, targetOccurrencesSha256: sha256Json(occurrences.map(item => commitment(item))),
    targetOccurrenceCount: occurrences.length, selectedHeader: commitment(header), rows,
    commonEmissionOrder: common.rows.map(row => row.id), bodySequenceSha256: sha256Json(common.rows),
    presentationGraphSha256: common.presentationGraphSha256, rulesGraphSha256: common.rulesGraphSha256,
    preferenceGraphSha256: common.preferenceGraphSha256, suppliedReplySha256: replySha256, suppliedMetadataSha256: sha256Json(metadata), ...structure };
  need(readerCompletion(before) === completion, "original SQL reader changed");
  return freezeDeep({ profile: "private.current-pcb-common-stored-relation.v1", suppliedTargetCommonAndMetaMatch: true,
    metadataContract: "supplied-ordinary-root-header-and-meta-v1", ...relation, relationSha256: sha256Json(relation), ...LIMITS });
}

/** Original runner-issued reply composition only. Retained replies grant no
 * current native ownership or continuity across the intervening SQL work. */
export function prepareCurrentPcbCommonStoredFromObservation(input: Readonly<{ before: Inventory;
  identity: CurrentPcbCommonStoredIdentity; observation: CurrentPcbCommonBaselineObservation;
  metadata: CurrentPcbCommonStoredInput["metadata"] }>): Promise<CurrentPcbCommonStoredRelation> {
  own(input, ["before", "identity", "observation", "metadata"]);
  const { assets, preference, presentation, rules } = requireOriginalCurrentPcbCommonBaselineReplies(input.observation);
  return prepareCurrentPcbCommonStoredRelation({ before: input.before,
    identity: input.identity, replies: { assets, preference, presentation, rules }, metadata: input.metadata });
}

export interface CurrentPcbCommonMetadataStoredRelation extends Readonly<typeof LIMITS> {
  readonly profile: "private.current-pcb-common-metadata-stored-relation.v1";
  readonly common: CurrentPcbCommonStoredRelation;
  readonly compilerUniqueId: string; readonly metadataReplySha256: string;
  readonly metadataGraphSha256: string; readonly metadataBodySha256: string;
  readonly relationSha256: string; readonly headerSourceMatched: false;
}

/** Compose the strict supplied native metadata envelope with common/history.
 * Raw metadata and common observations may have been sampled separately. Their
 * exact target/body agreement proves neither provenance nor atomicity. DOCHEAD
 * remains an explicit historical supplied contract, never a synthesized header.
 */
export async function prepareCurrentPcbCommonStoredFromMetadataObservation(input: Readonly<{
  before: Inventory; identity: CurrentPcbCommonStoredIdentity; replies: CurrentPcbCommonStoredInput["replies"];
  metadataReply: unknown; headerText: string;
}>): Promise<CurrentPcbCommonMetadataStoredRelation> {
  own(input, ["before", "identity", "replies", "metadataReply", "headerText"]);
  const identity = identitySchema.parse(own(input.identity, ["projectUuid", "branchUuid", "documentUuid"]));
  const metadata = encodeCurrentPcbCommonMetadata(input.metadataReply);
  need(metadata.documentUuid === identity.documentUuid && metadata.projectUuid === identity.projectUuid, "metadata observation identity differs");
  const metadataReplySha256 = sha256Text(rawReplyText(input.metadataReply));
  const common = await prepareCurrentPcbCommonStoredRelation({ before: input.before, identity, replies: input.replies,
    metadata: { headerText: input.headerText, metaBodyText: metadata.bodyText } });
  const relation = { common, compilerUniqueId: metadata.compilerUniqueId, metadataReplySha256,
    metadataGraphSha256: metadata.rawGraphSha256, metadataBodySha256: metadata.bodySha256 };
  return freezeDeep({ profile: "private.current-pcb-common-metadata-stored-relation.v1", ...relation,
    relationSha256: sha256Json(relation), headerSourceMatched: false, ...LIMITS });
}

/** Original five-reader issuance seam. No raw reply is fabricated from the
 * decoded observation, and the historical DOCHEAD remains supplied separately. */
export function prepareCurrentPcbCommonStoredFromOriginalBaseline(input: Readonly<{
  before: Inventory; identity: CurrentPcbCommonStoredIdentity; observation: CurrentPcbCommonBaselineObservation; headerText: string;
}>): Promise<CurrentPcbCommonMetadataStoredRelation> {
  own(input, ["before", "identity", "observation", "headerText"]);
  const { assets, metadata, preference, presentation, rules } = requireOriginalCurrentPcbCommonBaselineReplies(input.observation);
  return prepareCurrentPcbCommonStoredFromMetadataObservation({ before: input.before, identity: input.identity,
    replies: { assets, preference, presentation, rules }, metadataReply: metadata, headerText: input.headerText });
}
