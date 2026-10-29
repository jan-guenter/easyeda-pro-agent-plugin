import { createHash } from "node:crypto";
import { isRecord } from "./core.ts";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { MANAGED_LIBRARY_ARCHIVE_MAX_EXPANDED_BYTES, MANAGED_LIBRARY_ARCHIVE_MAX_MEMBERS } from "./managed-library-files-zip.ts";
import { MANAGED_PROJECT_FOOTPRINT_INDEX_MAX_BYTES, MANAGED_PROJECT_FOOTPRINT_ROSTER_PAGE_ENTRIES,
  pageManagedProjectFootprintSource } from "./managed-project-footprint-sources.ts";

export const MANAGED_PROJECT_DOCUMENT_MAX_RECORDS = 65_536;
export interface ManagedProjectDocumentSource {
  readonly sourceId: string;
  readonly member: string;
  readonly documentType: string;
  readonly documentUuid: string | null;
  readonly schematicId: string | null;
  readonly sheetId: string | null;
  readonly identityKind: "native-dochead" | "legacy-archive-member";
  readonly memberByteOffset: number;
  readonly bytes: number;
  readonly sha256: string;
  readonly utf16CodeUnits: number;
  readonly documentSource: string;
}
export interface ManagedProjectDocumentSourceSet {
  readonly sourceSetSha256: string;
  readonly inputSha256: string;
  readonly inputMembers: number;
  readonly totalSourceBytes: number;
  readonly sourceLayout: "combined-native" | "recognized-legacy-members" | "no-recognized-sources";
  readonly sources: readonly ManagedProjectDocumentSource[];
}
function refuse(reason: string): never { throw new Error(`Supplied project document sources refused: ${reason}.`); }
function hash(bytes: Buffer): string { return createHash("sha256").update(bytes).digest("hex"); }
function exactText(content: Buffer): string {
  const text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(content);
  if (!Buffer.from(text, "utf8").equals(content)) { refuse("lossless UTF-8 source encoding"); }
  return text;
}
function entry(member: string, content: Buffer, metadata: Pick<ManagedProjectDocumentSource,
  "documentType" | "documentUuid" | "schematicId" | "sheetId" | "identityKind" | "memberByteOffset">): ManagedProjectDocumentSource {
  if (content.length === 0 || content.length > MANAGED_LIBRARY_ARCHIVE_MAX_EXPANDED_BYTES) { refuse("empty source or source byte bound"); }
  const documentSource = exactText(content);
  const sourceId = hash(Buffer.from(JSON.stringify([member, metadata.memberByteOffset, metadata.documentUuid]), "utf8"));
  return Object.freeze({ sourceId, member, ...metadata, bytes: content.length, sha256: hash(content), utf16CodeUnits: documentSource.length, documentSource });
}
function nativeSegments(member: string, content: Buffer): readonly ManagedProjectDocumentSource[] {
  const text = exactText(content);
  if (!text.endsWith("|\n")) { refuse("complete native project record delimiter"); }
  const records = text.slice(0, -2).split("|\n");
  if (records.length === 0 || records.length > MANAGED_PROJECT_DOCUMENT_MAX_RECORDS) { refuse("native project record bound"); }
  const sources: ManagedProjectDocumentSource[] = []; const identities = new Set<string>();
  let documentType: string | undefined;
  let documentUuid: string | undefined;
  let position = 0, start = 0;
  const append = (end: number): void => {
    if (documentUuid === undefined || documentType === undefined) { refuse("records before original DOCHEAD"); }
    sources.push(entry(member, content.subarray(start, end), { documentType, documentUuid, schematicId: null,
      sheetId: null, identityKind: "native-dochead", memberByteOffset: start }));
  };
  for (const record of records) {
    const boundary = record.indexOf("||");
    if (boundary < 1) { refuse("native record header/body separator"); }
    const header = decodeCurrentPcbDiagnosticJson(Buffer.from(record.slice(0, boundary), "utf8"));
    const bodyText = record.slice(boundary + 2);
    const body = bodyText === "" ? null : decodeCurrentPcbDiagnosticJson(Buffer.from(bodyText, "utf8"));
    if (!isRecord(header) || typeof header["type"] !== "string" || header["type"].length === 0 || header["type"].length > 64) { refuse("native record header"); }
    if (header["type"] === "DOCHEAD") {
      if (!isRecord(body) || typeof body["uuid"] !== "string" || !/^[A-Za-z0-9_-]{1,128}$/u.test(body["uuid"]) ||
          typeof body["docType"] !== "string" || !/^[A-Z][A-Z0-9_]{0,63}$/u.test(body["docType"])) { refuse("native document identity"); }
      if (documentUuid !== undefined) { append(position); }
      documentUuid = body["uuid"]; documentType = body["docType"];
      if (identities.has(documentUuid)) { refuse("repeated native document identity, not a unique exported source"); }
      identities.add(documentUuid); start = position;
    } else if (documentUuid === undefined) { refuse("records before original DOCHEAD"); }
    position += Buffer.byteLength(record, "utf8") + 2;
  }
  append(position);
  return sources;
}

/** The current exporter emits one root *.epru stream; the legacy exporter emits
 * SHEET/<schematic>/<sheet_id>.esch and typed UUID members. Every record in a
 * combined stream is decoded before delimiting DOCHEAD segments. Text inside a
 * JSON string therefore cannot manufacture a boundary. Original bytes remain
 * unchanged, including unknown bodies and deletion/history records. */
export function collectManagedProjectDocumentSources(members: ReadonlyMap<string, Buffer>, inputSha256: string): ManagedProjectDocumentSourceSet {
  if (members.size === 0 || members.size > MANAGED_LIBRARY_ARCHIVE_MAX_MEMBERS || !/^[a-f0-9]{64}$/u.test(inputSha256)) { refuse("archive roster or digest"); }
  const sources: ManagedProjectDocumentSource[] = []; let combined = false, legacy = false;
  for (const [member, content] of members) {
    const candidate = member.toLowerCase().replace(/\/$/u, "");
    if (candidate.endsWith(".epru")) {
      if (combined || member.includes("/") || member.includes("\\") || !member.endsWith(".epru")) { refuse("one canonical root native project stream"); }
      combined = true; sources.push(...nativeSegments(member, content));
    } else if (/\.(?:esch|epcb|esym|efoo)$/u.test(candidate)) {
      let documentType: string;
      let documentUuid: string | null = null, schematicId: string | null = null, sheetId: string | null = null;
      const sheet = /^SHEET\/([a-f0-9]{16}|[a-f0-9]{32})\/([A-Za-z0-9_-]{1,128})\.esch$/u.exec(member);
      const typed = /^(PCB|SYMBOL|FOOTPRINT)\/([a-f0-9]{16}|[a-f0-9]{32})\.(epcb|esym|efoo)$/u.exec(member);
      if (sheet !== null) { documentType = "SCH_PAGE"; schematicId = sheet[1] ?? null; sheetId = sheet[2] ?? null; }
      else if (typed !== null && new Map([["PCB", "epcb"], ["SYMBOL", "esym"], ["FOOTPRINT", "efoo"]]).get(typed[1] ?? "") === typed[3]) {
        documentType = typed[1] ?? ""; documentUuid = typed[2] ?? null;
      } else { refuse("canonical legacy document member"); }
      legacy = true; sources.push(entry(member, content, { documentType, documentUuid, schematicId, sheetId,
        identityKind: "legacy-archive-member", memberByteOffset: 0 }));
    }
  }
  if (combined && legacy) { refuse("mixed combined and legacy source layouts"); }
  if (sources.length > MANAGED_LIBRARY_ARCHIVE_MAX_MEMBERS) { refuse("complete document roster bound"); }
  const totalSourceBytes = sources.reduce((sum, item) => sum + item.bytes, 0);
  if (totalSourceBytes > MANAGED_LIBRARY_ARCHIVE_MAX_EXPANDED_BYTES) { refuse("aggregate source byte bound"); }
  let sourceLayout: ManagedProjectDocumentSourceSet["sourceLayout"] = "no-recognized-sources";
  if (combined) { sourceLayout = "combined-native"; } else if (legacy) { sourceLayout = "recognized-legacy-members"; }
  const set = { inputSha256, inputMembers: members.size, totalSourceBytes, sourceLayout, sources: Object.freeze(sources) };
  const index = encodeManagedProjectDocumentSourceIndex(set);
  if (index.length > MANAGED_PROJECT_FOOTPRINT_INDEX_MAX_BYTES) { refuse("complete source index byte bound"); }
  return Object.freeze({ ...set, sourceSetSha256: hash(index) });
}
export function encodeManagedProjectDocumentSourceIndex(set: Omit<ManagedProjectDocumentSourceSet, "sourceSetSha256">): Buffer {
  return Buffer.from(JSON.stringify({ schema: "easyeda-pro-control.project-document-source-index.v1", inputSha256: set.inputSha256,
    inputMembers: set.inputMembers, totalSourceBytes: set.totalSourceBytes, sourceLayout: set.sourceLayout,
    completeProjectDocumentInventory: false,
    sources: set.sources.map(({ documentSource: _documentSource, ...item }) => item) }), "utf8");
}
export function pageManagedProjectDocumentRoster(set: ManagedProjectDocumentSourceSet, offset: number, length: number): Record<string, unknown> {
  if (!Number.isSafeInteger(offset) || offset < 0 || offset > set.sources.length || !Number.isSafeInteger(length) ||
      length < 1 || length > MANAGED_PROJECT_FOOTPRINT_ROSTER_PAGE_ENTRIES) { refuse("document roster page bounds"); }
  const nextOffset = Math.min(set.sources.length, offset + length);
  return { totalDocuments: set.sources.length, sourceLayout: set.sourceLayout, completeProjectDocumentInventory: false,
    rosterScope: set.sourceLayout === "combined-native" ? "every-original-DOCHEAD-segment-in-supplied-stream" : "recognized-SHEET-PCB-SYMBOL-FOOTPRINT-members-only",
    offsetUnit: "source-entry", offset, nextOffset,
    endOfRoster: nextOffset === set.sources.length, completeRosterReturned: offset === 0 && nextOffset === set.sources.length,
    sources: set.sources.slice(offset, nextOffset).map(({ documentSource: _documentSource, ...item }) => item) };
}
export function pageManagedProjectDocumentSource(item: ManagedProjectDocumentSource, offset: number, length: number): Record<string, unknown> {
  const { footprintUuid: _footprintUuid, ...page } = pageManagedProjectFootprintSource({ ...item, footprintUuid: item.sourceId }, offset, length);
  return { ...page, sourceId: item.sourceId, documentType: item.documentType, documentUuid: item.documentUuid,
    schematicId: item.schematicId, sheetId: item.sheetId, identityKind: item.identityKind, memberByteOffset: item.memberByteOffset };
}
