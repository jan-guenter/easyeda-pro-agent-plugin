import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { isRecord } from "./core.ts";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { readManagedLibraryZip } from "./managed-library-files-zip.ts";
import { MANAGED_PROJECT_FOOTPRINT_INDEX_MAX_BYTES, MANAGED_PROJECT_FOOTPRINT_ROSTER_PAGE_ENTRIES,
  MANAGED_PROJECT_FOOTPRINT_UUID_PATTERN, pageManagedProjectFootprintSource } from "./managed-project-footprint-sources.ts";

export const MANAGED_LIBRARY_ARCHIVE_MAX_ITEMS = 16;
export const MANAGED_LIBRARY_ARCHIVE_MAX_SOURCE_BYTES = 256 * 1024;
const MAX_RECORDS = 8192;
const DELIMITER = "|\n";
export interface ManagedLibraryArchiveSource {
  readonly sourceId: string;
  readonly member: string;
  readonly documentUuid: string;
  readonly documentType: "FOOTPRINT" | "SYMBOL";
  readonly docType: 4 | 2;
  readonly memberByteOffset: number;
  readonly bytes: number;
  readonly sha256: string;
  readonly utf16CodeUnits: number;
  readonly documentSource: string;
  readonly metadataSha256: string;
  readonly metadata: Readonly<{ title: string; path: string; description?: string }>;
  readonly exportPrefix: Readonly<{ memberByteOffset: number; bytes: number; sha256: string; headerSha256: string; metaSha256: string }>;
}
export interface ManagedLibraryArchiveSourceSet {
  readonly sourceSetSha256: string;
  readonly inputSha256: string;
  readonly inputMembers: 2;
  readonly manifestMember: "footprint2.json" | "symbol2.json";
  readonly manifestSha256: string;
  readonly sourceMember: string;
  readonly sourceMemberSha256: string;
  readonly totalSourceBytes: number;
  readonly sourceLayout: "native-library-export-v2";
  readonly sources: readonly ManagedLibraryArchiveSource[];
}
interface NativeRecord {
  readonly text: string;
  readonly start: number;
  readonly end: number;
  readonly header: Readonly<Record<string, unknown>>;
  readonly body: unknown;
}
function refuse(reason: string): never { throw new Error(`Supplied library archive sources refused: ${reason}.`); }
function hash(bytes: Buffer | string): string { return createHash("sha256").update(bytes).digest("hex"); }
function string(value: unknown, maximum: number): string {
  if (typeof value !== "string" || value.length > maximum || !value.isWellFormed() || value.includes("\u0000")) { refuse("bounded exact string field"); }
  return value;
}
function exactText(bytes: Buffer): string {
  const text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
  if (!Buffer.from(text, "utf8").equals(bytes) || text.includes("\u0000")) { refuse("lossless UTF-8 without NUL"); }
  return text;
}
function decode(text: string): unknown { return decodeCurrentPcbDiagnosticJson(Buffer.from(text, "utf8")); }

/** Locate the complete header object lexically. An unknown header string may
 * itself contain ||, so searching for the first separator would misframe it. */
function record(text: string, start: number): NativeRecord {
  let boundary = -1, depth = 0, quoted = false;
  if (!text.startsWith("{")) { refuse("native header object"); }
  for (let offset = 0; offset < text.length; offset += 1) {
    const character = text[offset];
    if (quoted) {
      if (character === "\\") { offset += 1; }
      else if (character === '"') { quoted = false; }
    } else if (character === '"') { quoted = true; }
    else if (character === "{" || character === "[") { depth += 1; }
    else if (character === "}" || character === "]") { depth -= 1; if (depth === 0) { boundary = offset + 1; break; } }
  }
  if (boundary < 1 || text.slice(boundary, boundary + 2) !== "||") { refuse("complete native header and body separator"); }
  const header = decode(text.slice(0, boundary)); const bodyText = text.slice(boundary + 2);
  if (!isRecord(header) || typeof header["type"] !== "string" || !/^[A-Z][A-Z0-9_]{0,63}$/u.test(header["type"]) ||
      typeof header["ticket"] !== "number" || !Number.isSafeInteger(header["ticket"]) || header["ticket"] < 0 || bodyText.length === 0) { refuse("native record header or tombstone"); }
  return { text, start, end: start + text.length, header, body: decode(bodyText) };
}
function records(text: string): readonly (NativeRecord | null)[] {
  const parts = text.split(DELIMITER);
  if (parts.at(-1) === "") { parts.pop(); }
  if (parts.length < 4 || parts.length > MAX_RECORDS) { refuse("complete native record count"); }
  const result: (NativeRecord | null)[] = []; let start = 0;
  for (const part of parts) { result.push(part === "" ? null : record(part, start)); start += part.length + DELIMITER.length; }
  return result;
}
function documentIdentity(row: NativeRecord, expectedType: string): string {
  if (row.header["type"] !== "DOCHEAD" || !isRecord(row.body) || row.body["docType"] !== expectedType ||
      typeof row.body["uuid"] !== "string" || !MANAGED_PROJECT_FOOTPRINT_UUID_PATTERN.test(row.body["uuid"])) { refuse("matching native document type and UUID"); }
  return row.body["uuid"];
}
function generatedCount(member: string): number {
  const match = /^ProLib_(pc|[1-9][0-9]?pcs)_([0-9]{4})-([0-9]{2})-([0-9]{2})\.elibu$/u.exec(member);
  if (match === null) { refuse("canonical generated-name native library member"); }
  const day = Number(match[4]), month = Number(match[3]), year = Number(match[2]);
  const date = new Date(0); date.setUTCFullYear(year, month - 1, day); date.setUTCHours(0, 0, 0, 0);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) { refuse("generated member date"); }
  return match[1] === "pc" ? 1 : Number(match[1]?.slice(0, -3));
}
function metadata(value: unknown, uuid: string, docType: 2 | 4): Readonly<Record<string, unknown>> {
  if (!isRecord(value) || value["uuid"] !== uuid || value["docType"] !== docType) { refuse("manifest UUID key and document type agreement"); }
  string(value["title"], 512); const path = string(value["path"], 128);
  if (!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/u.test(path)) { refuse("supplied library path identity"); }
  if (value["display_title"] !== undefined) { string(value["display_title"], 512); }
  if (value["description"] !== undefined) { string(value["description"], 4096); }
  if (value["source"] !== undefined) { string(value["source"], 4096); }
  return value;
}
function synthesizedMeta(value: Readonly<Record<string, unknown>>, docType: 2 | 4): Record<string, unknown> {
  const tags = value["tags"] ?? [];
  if (!Array.isArray(tags) || tags.length > 64 || tags.some((tag) => typeof tag !== "string" || tag.length > 128 || !tag.isWellFormed() || tag.includes("\u0000"))) {
    // Hierarchical tag names depend on the exporter's UI language. This first
    // Subset refuses them rather than inventing a locale or dropping tags.
    refuse("bounded array tags required for independently matching synthesized metadata");
  }
  const displayTitle = value["display_title"];
  return { title: displayTitle === undefined || displayTitle === "" ? value["title"] : displayTitle,
    ...(value["description"] === undefined ? {} : { description: value["description"] }), tags,
    source: value["source"] ?? "", ...(docType === 2 ? { docType: 2 } : {}) };
}

/** Decode only supplied v2 footprint or ordinary-symbol metadata archives.
 * The complete ZIP and every record are recognized before returning a source.
 * Unknown fields remain in the exact archive; no asset reference is followed. */
export function collectManagedLibraryArchiveSources(name: string, bytes: Buffer, inputSha256: string): ManagedLibraryArchiveSourceSet {
  if (!/^[A-Za-z0-9][A-Za-z0-9_ -]{0,120}\.elibz2$/u.test(name) || !/^[a-f0-9]{64}$/u.test(inputSha256) || inputSha256 !== hash(bytes)) { refuse("archive filename or exact input digest"); }
  const members = readManagedLibraryZip(bytes);
  if (members.size !== 2) { refuse("exact two-member v2 library archive"); }
  const manifestMember: ManagedLibraryArchiveSourceSet["manifestMember"] = members.has("footprint2.json") ? "footprint2.json" : "symbol2.json";
  const manifestBytes = members.get(manifestMember);
  const sourceMember = [...members.keys()].find((member) => member.endsWith(".elibu"));
  if (manifestBytes === undefined || manifestBytes.length === 0 || manifestBytes.length > MANAGED_LIBRARY_ARCHIVE_MAX_SOURCE_BYTES || sourceMember === undefined) { refuse("matching bounded v2 manifest and source member"); }
  const sourceBytes = members.get(sourceMember);
  if (sourceBytes === undefined || sourceBytes.length === 0) { refuse("nonempty native source member"); }
  const count = generatedCount(sourceMember); const manifest = decode(exactText(manifestBytes));
  const documentType = manifestMember === "footprint2.json" ? "FOOTPRINT" : "SYMBOL"; const docType = documentType === "FOOTPRINT" ? 4 : 2;
  const mapName = documentType === "FOOTPRINT" ? "footprints" : "symbols";
  if (!isRecord(manifest)) { refuse("manifest object"); }
  for (const key of ["devices", "symbols", "footprints", "panelLibs"]) {
    if (!isRecord(manifest[key]) || key !== mapName && Object.keys(manifest[key]).length > 0) { refuse("complete matching kind map and empty unsupported maps"); }
  }
  const selected = manifest[mapName]; if (!isRecord(selected)) { refuse("selected source map"); }
  const entries = Object.entries(selected);
  if (entries.length === 0 || entries.length > MANAGED_LIBRARY_ARCHIVE_MAX_ITEMS || entries.length !== count) { refuse("complete manifest membership and generated count"); }
  const metadataByUuid = new Map<string, Readonly<Record<string, unknown>>>();
  for (const [uuid, item] of entries) {
    if (!MANAGED_PROJECT_FOOTPRINT_UUID_PATTERN.test(uuid)) { refuse("canonical manifest UUID"); }
    metadataByUuid.set(uuid, metadata(item, uuid, docType));
  }
  const text = exactText(sourceBytes); const rows = records(text); const sources: ManagedLibraryArchiveSource[] = []; const seen = new Set<string>();
  let cursor = 0;
  while (cursor < rows.length) {
    const meta = rows[cursor + 1], original = rows[cursor + 2], prefix = rows[cursor];
    if (prefix === null || prefix === undefined || meta === null || meta === undefined || original === null || original === undefined) { refuse("complete synthesized header/META and original source"); }
    const uuid = documentIdentity(prefix, documentType); documentIdentity(original, documentType);
    const item = metadataByUuid.get(uuid);
    if (item === undefined || seen.has(uuid) || prefix.text !== original.text || !isDeepStrictEqual(meta.header, { type: "META", ticket: 1, id: "META" }) ||
        !isDeepStrictEqual(meta.body, synthesizedMeta(item, docType))) { refuse("one exact original body per manifest entry and agreeing synthesized prefix"); }
    seen.add(uuid); const ids = new Set<string>(); let next = cursor + 3;
    for (; next < rows.length; next += 1) {
      const row = rows[next];
      if (row === null) { if (rows[next + 1]?.header["type"] !== "DOCHEAD") { refuse("empty native record outside export separator"); } break; }
      if (row === undefined || row.header["type"] === "DOCHEAD") { break; }
      const type = row.header["type"];
      if (["EDIT_HEAD", "DELETE_DOC", "DELETE", "META_CREATE", "META_MODIFY"].includes(String(type)) || !isRecord(row.body)) { refuse("fixed source body required, without history or tombstones"); }
      const id = string(row.header["id"], 4096);
      if (id.length === 0 || ids.has(id)) { refuse("unique fixed source record identities"); } ids.add(id);
      if (type === "META" && docType === 2 && row.body["docType"] !== undefined && row.body["docType"] !== 2) { refuse("original symbol metadata type agreement"); }
    }
    if (ids.size === 0) { refuse("nonempty original native library body"); }
    const boundaryRow = rows[next]; const followingPrefix = boundaryRow === null ? rows[next + 1] : boundaryRow;
    if (followingPrefix === null) { refuse("empty record outside one export separator"); }
    const sourceEnd = followingPrefix === undefined ? text.length : followingPrefix.start - DELIMITER.length;
    const documentSource = text.slice(original.start, sourceEnd); const content = Buffer.from(documentSource, "utf8");
    if (content.length === 0 || content.length > MANAGED_LIBRARY_ARCHIVE_MAX_SOURCE_BYTES) { refuse("original source byte bound"); }
    const prefixText = text.slice(prefix.start, original.start); const memberByteOffset = Buffer.byteLength(text.slice(0, original.start), "utf8");
    const description = item["description"]; const sourceId = hash(JSON.stringify([sourceMember, memberByteOffset, uuid]));
    const selectedMetadata = Object.freeze({ title: string(item["title"], 512), path: string(item["path"], 128),
      ...(description === undefined ? {} : { description: string(description, 4096) }) });
    const exportPrefix = Object.freeze({ memberByteOffset: Buffer.byteLength(text.slice(0, prefix.start), "utf8"), bytes: Buffer.byteLength(prefixText, "utf8"),
      sha256: hash(prefixText), headerSha256: hash(prefix.text), metaSha256: hash(meta.text) });
    const source: ManagedLibraryArchiveSource = { sourceId, member: sourceMember, documentUuid: uuid,
      documentType, docType, memberByteOffset, bytes: content.length, sha256: hash(content), utf16CodeUnits: documentSource.length, documentSource,
      metadataSha256: hash(JSON.stringify(item)), metadata: selectedMetadata, exportPrefix };
    sources.push(Object.freeze(source));
    cursor = boundaryRow === null ? next + 1 : next;
  }
  if (sources.length !== entries.length || entries.some(([uuid]) => !seen.has(uuid))) { refuse("complete manifest and original source membership"); }
  const set: Omit<ManagedLibraryArchiveSourceSet, "sourceSetSha256"> = { inputSha256, inputMembers: 2, manifestMember, manifestSha256: hash(manifestBytes), sourceMember,
    sourceMemberSha256: hash(sourceBytes), totalSourceBytes: sources.reduce((sum, source) => sum + source.bytes, 0),
    sourceLayout: "native-library-export-v2", sources: Object.freeze(sources) };
  const index = encodeManagedLibraryArchiveSourceIndex(set);
  if (index.length > MANAGED_PROJECT_FOOTPRINT_INDEX_MAX_BYTES) { refuse("complete source index byte bound"); }
  return Object.freeze({ ...set, sourceSetSha256: hash(index) });
}
export function encodeManagedLibraryArchiveSourceIndex(set: Omit<ManagedLibraryArchiveSourceSet, "sourceSetSha256">): Buffer {
  return Buffer.from(JSON.stringify({ schema: "easyeda-pro-control.library-archive-source-index.v1", inputSha256: set.inputSha256,
    inputMembers: set.inputMembers, manifestMember: set.manifestMember, manifestSha256: set.manifestSha256,
    sourceMember: set.sourceMember, sourceMemberSha256: set.sourceMemberSha256, totalSourceBytes: set.totalSourceBytes, sourceLayout: set.sourceLayout,
    geometryValidated: false, dependenciesVerified: false, sourceSubtypeVerified: false,
    sources: set.sources.map(({ documentSource: _documentSource, ...source }) => source) }), "utf8");
}
export function pageManagedLibraryArchiveRoster(set: ManagedLibraryArchiveSourceSet, offset: number, length: number): Record<string, unknown> {
  if (!Number.isSafeInteger(offset) || offset < 0 || offset > set.sources.length || !Number.isSafeInteger(length) || length < 1 || length > MANAGED_PROJECT_FOOTPRINT_ROSTER_PAGE_ENTRIES) { refuse("source roster page bounds"); }
  const nextOffset = Math.min(set.sources.length, offset + length);
  return { totalSources: set.sources.length, sourceLayout: set.sourceLayout, inputMembers: set.inputMembers,
    manifestMember: set.manifestMember, manifestSha256: set.manifestSha256, sourceMember: set.sourceMember, sourceMemberSha256: set.sourceMemberSha256,
    offsetUnit: "source-entry", offset, nextOffset,
    endOfRoster: nextOffset === set.sources.length, completeRosterReturned: offset === 0 && nextOffset === set.sources.length,
    geometryValidated: false, dependenciesVerified: false, sourceSubtypeVerified: false,
    sources: set.sources.slice(offset, nextOffset).map(({ documentSource: _documentSource, ...source }) => source) };
}
export function pageManagedLibraryArchiveSource(source: ManagedLibraryArchiveSource, offset: number, length: number): Record<string, unknown> {
  const { footprintUuid: _footprintUuid, ...page } = pageManagedProjectFootprintSource({ ...source, footprintUuid: source.documentUuid }, offset, length);
  return { ...page, sourceId: source.sourceId, documentUuid: source.documentUuid, documentType: source.documentType, docType: source.docType,
    memberByteOffset: source.memberByteOffset, exportPrefix: source.exportPrefix, sourceScope: "original-body-without-synthesized-export-prefix",
    geometryValidated: false, dependenciesVerified: false, sourceSubtypeVerified: false };
}
