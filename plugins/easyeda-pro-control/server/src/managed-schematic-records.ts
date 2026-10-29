import { createHash } from "node:crypto";
import { isRecord } from "./core.ts";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { MANAGED_PROJECT_DOCUMENT_MAX_RECORDS } from "./managed-project-document-sources.ts";
import type { ManagedProjectDocumentSource } from "./managed-project-document-sources.ts";

export const MANAGED_SCHEMATIC_RECORD_PAGE_ENTRIES = 16;
const MAX_PAGE_BYTES = 32 * 1024;
const FAMILIES = new Set(["COMPONENT", "PIN", "WIRE", "LINE", "NET", "ATTR", "RELEVANCE", "PART", "PORT", "NET_LABEL"]);
function refuse(reason: string): never { throw new Error(`Supplied schematic record inspection refused: ${reason}.`); }
interface RawRecord {
  readonly recordIndex: number;
  readonly recordSha256: string;
  readonly recordType: string;
  readonly recordId: string | null;
  readonly recordText: string;
  readonly header: Readonly<Record<string, unknown>>;
  readonly body: Readonly<Record<string, unknown>>;
}
function parse(item: ManagedProjectDocumentSource): readonly RawRecord[] {
  if (!["SCH", "SCH_PAGE"].includes(item.documentType) || !item.documentSource.endsWith("|\n") ||
      createHash("sha256").update(item.documentSource, "utf8").digest("hex") !== item.sha256) { refuse("complete digest-bound native SCH or SCH_PAGE source required"); }
  const lines = item.documentSource.slice(0, -2).split("|\n");
  if (lines.length === 0 || lines.length > MANAGED_PROJECT_DOCUMENT_MAX_RECORDS) { refuse("record bound"); }
  const identities = new Set<string>();
  return lines.map((line, recordIndex) => {
    const boundary = line.indexOf("||");
    if (boundary < 1) { refuse("record header/body framing"); }
    const header = decodeCurrentPcbDiagnosticJson(Buffer.from(line.slice(0, boundary), "utf8"));
    const body = decodeCurrentPcbDiagnosticJson(Buffer.from(line.slice(boundary + 2), "utf8"));
    if (!isRecord(header) || !isRecord(body) || typeof header["type"] !== "string" || !/^[A-Z][A-Z0-9_]{0,63}$/u.test(header["type"])) {
      refuse("object record framing, without tombstones");
    }
    const recordType = header["type"]; let recordId: string | null = null;
    if (recordIndex === 0) {
      if (recordType !== "DOCHEAD" || body["docType"] !== item.documentType || typeof body["uuid"] !== "string" ||
          !/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u.test(body["uuid"]) ||
          (item.documentUuid !== null && body["uuid"] !== item.documentUuid)) { refuse("document header identity agreement"); }
    } else {
      if (["DOCHEAD", "EDIT_HEAD", "DELETE", "DELETE_DOC", "META_CREATE", "META_MODIFY"].includes(recordType)) { refuse("unique exported source required, not mutable history"); }
      if (typeof header["id"] !== "string" || header["id"].length === 0 || header["id"].length > 4096 || !header["id"].isWellFormed() || header["id"].includes("\u0000")) {
        refuse("exact bounded record identity");
      }
      recordId = header["id"];
      if (identities.has(recordId)) { refuse("duplicate record identity"); }
      identities.add(recordId);
    }
    return { recordIndex, recordSha256: createHash("sha256").update(line, "utf8").digest("hex"), recordType, recordId, recordText: line, header, body };
  });
}

/** This is a raw source report, not a compiler. Components may inherit symbol
 * pins and wires may encode joins outside the reported fields. Complete native
 * framing and unique records are required before any page is returned. Unknown
 * records remain available verbatim through source pages. */
export function inspectManagedSchematicRecords(item: ManagedProjectDocumentSource, offset: number, length: number): Record<string, unknown> {
  if (!Number.isSafeInteger(offset) || offset < 0 || !Number.isSafeInteger(length) || length < 1 || length > MANAGED_SCHEMATIC_RECORD_PAGE_ENTRIES) { refuse("record page bounds"); }
  const records = parse(item); const selected = records.filter(row => FAMILIES.has(row.recordType));
  if (offset > selected.length) { refuse("offset exceeds complete recognized record roster"); }
  const page: RawRecord[] = []; let nextOffset = offset;
  for (const row of selected.slice(offset, offset + length)) {
    if (Buffer.byteLength(JSON.stringify([...page, row]), "utf8") > MAX_PAGE_BYTES) {
      if (page.length === 0) { refuse("one complete record exceeds report bound; use lossless source pages"); } break;
    }
    page.push(row); nextOffset += 1;
  }
  const counts = new Map<string, number>();
  for (const row of records) { counts.set(row.recordType, (counts.get(row.recordType) ?? 0) + 1); }
  return { sourceId: item.sourceId, member: item.member, sourceSha256: item.sha256, documentType: item.documentType,
    documentUuid: records[0]?.body["uuid"], sourceFormat: "native-dochead", coordinateConvention: "raw-file-fields-no-unit-conversion",
    recordCount: records.length, recordTypes: Object.fromEntries(counts), recognizedRecordFamilies: [...FAMILIES],
    unknownRecordsPreservedInSource: true, totalRecognizedRecords: selected.length, offsetUnit: "recognized-record-entry", offset,
    nextOffset, endOfRecords: nextOffset === selected.length, completeRecordsReturned: offset === 0 && nextOffset === selected.length,
    records: page, inheritedSymbolPinsResolved: false, componentDependenciesVerified: false, geometricContactsEvaluated: false,
    connectivityCompiled: false, netMembershipVerified: false, electricalRulesEvaluated: false };
}
