import { createHash } from "node:crypto";
import { MANAGED_LIBRARY_ARCHIVE_MAX_EXPANDED_BYTES, MANAGED_LIBRARY_ARCHIVE_MAX_MEMBERS } from "./managed-library-files-zip.ts";

export const MANAGED_PROJECT_FOOTPRINT_SOURCE_PAGE_UNITS = 4096;
export const MANAGED_PROJECT_FOOTPRINT_ROSTER_PAGE_ENTRIES = 32;
export const MANAGED_PROJECT_FOOTPRINT_INDEX_MAX_BYTES = 256 * 1024;
export const MANAGED_PROJECT_FOOTPRINT_UUID_PATTERN = /^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u;

export interface ManagedProjectFootprintSource {
  readonly member: string;
  readonly footprintUuid: string;
  readonly bytes: number;
  readonly sha256: string;
  readonly utf16CodeUnits: number;
  readonly documentSource: string;
}
export interface ManagedProjectFootprintSourceSet {
  readonly sourceSetSha256: string;
  readonly archiveSha256: string;
  readonly archiveMembers: number;
  readonly totalSourceBytes: number;
  readonly sources: readonly ManagedProjectFootprintSource[];
}

function refuse(reason: string): never { throw new Error(`Supplied project footprint sources refused: ${reason}.`); }
function hash(bytes: Buffer): string { return createHash("sha256").update(bytes).digest("hex"); }

/** Members come only from the complete extent/inflation/CRC-checked ZIP reader.
 * Source text stays opaque: this does not parse CAD records or infer validity. */
export function collectManagedProjectFootprintSources(
  members: ReadonlyMap<string, Buffer>, archiveSha256: string,
): ManagedProjectFootprintSourceSet {
  if (members.size === 0 || members.size > MANAGED_LIBRARY_ARCHIVE_MAX_MEMBERS || !/^[a-f0-9]{64}$/u.test(archiveSha256)) {
    refuse("archive roster or digest");
  }
  const sources: ManagedProjectFootprintSource[] = []; const identities = new Set<string>(); let totalSourceBytes = 0;
  for (const [member, content] of members) {
    if (member.toLowerCase().replace(/\/$/u, "").endsWith(".efoo")) {
      const basename = member.slice(member.lastIndexOf("/") + 1);
      const footprintUuid = basename.slice(0, -5);
      if (member.endsWith("/") || !basename.endsWith(".efoo") || !MANAGED_PROJECT_FOOTPRINT_UUID_PATTERN.test(footprintUuid) || identities.has(footprintUuid)) {
        refuse("every .efoo member requires a distinct lowercase 16- or 32-hex UUID.efoo basename");
      }
      if (content.length === 0 || content.length > MANAGED_LIBRARY_ARCHIVE_MAX_EXPANDED_BYTES - totalSourceBytes) { refuse("empty source or aggregate source byte bound"); }
      const documentSource = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(content);
      if (!Buffer.from(documentSource, "utf8").equals(content)) { refuse("lossless UTF-8 source encoding"); }
      identities.add(footprintUuid); totalSourceBytes += content.length;
      sources.push(Object.freeze({ member, footprintUuid, bytes: content.length, sha256: hash(content), utf16CodeUnits: documentSource.length, documentSource }));
    }
  }
  const sourceSet = { archiveSha256, archiveMembers: members.size, totalSourceBytes, sources: Object.freeze(sources) };
  const indexBytes = encodeManagedProjectFootprintSourceIndex(sourceSet);
  if (indexBytes.length > MANAGED_PROJECT_FOOTPRINT_INDEX_MAX_BYTES) { refuse("complete source index byte bound"); }
  return Object.freeze({ ...sourceSet, sourceSetSha256: hash(indexBytes) });
}

export function encodeManagedProjectFootprintSourceIndex(sourceSet: Omit<ManagedProjectFootprintSourceSet, "sourceSetSha256">): Buffer {
  return Buffer.from(JSON.stringify({ schema: "easyeda-pro-control.project-footprint-source-index.v1", archiveSha256: sourceSet.archiveSha256,
    archiveMembers: sourceSet.archiveMembers, totalSourceBytes: sourceSet.totalSourceBytes,
    sources: sourceSet.sources.map(({ documentSource: _documentSource, ...source }) => source) }), "utf8");
}

/** Complete roster access through bounded metadata pages. UUIDs do not need to
 * Be known beforehand, and source bodies never enter an index-page response. */
export function pageManagedProjectFootprintRoster(sourceSet: ManagedProjectFootprintSourceSet, offset: number, length: number): Record<string, unknown> {
  if (!Number.isSafeInteger(offset) || offset < 0 || offset > sourceSet.sources.length || !Number.isSafeInteger(length) ||
      length < 1 || length > MANAGED_PROJECT_FOOTPRINT_ROSTER_PAGE_ENTRIES) { refuse("source roster page bounds"); }
  const nextOffset = Math.min(sourceSet.sources.length, offset + length);
  return { totalFootprints: sourceSet.sources.length, offsetUnit: "source-entry", offset, nextOffset,
    endOfRoster: nextOffset === sourceSet.sources.length, completeRosterReturned: offset === 0 && nextOffset === sourceSet.sources.length,
    sources: sourceSet.sources.slice(offset, nextOffset).map(({ documentSource: _documentSource, ...source }) => source) };
}

/** Page offsets use UTF-16 code units, with no split surrogate pairs. Base64
 * contains the exact corresponding UTF-8 bytes, preserving BOM and line ends. */
export function pageManagedProjectFootprintSource(source: ManagedProjectFootprintSource, offset: number, length: number): Record<string, unknown> {
  if (!Number.isSafeInteger(offset) || offset < 0 || offset > source.utf16CodeUnits || !Number.isSafeInteger(length) ||
      length < 1 || length > MANAGED_PROJECT_FOOTPRINT_SOURCE_PAGE_UNITS) { refuse("source page bounds"); }
  const splitPair = (position: number): boolean => position > 0 && position < source.documentSource.length &&
    (source.documentSource.codePointAt(position - 1) ?? 0) > 0xFF_FF;
  if (splitPair(offset)) { refuse("source page offset splits a Unicode surrogate pair"); }
  let nextOffset = Math.min(source.utf16CodeUnits, offset + length);
  if (splitPair(nextOffset)) { nextOffset -= 1; }
  if (nextOffset === offset && offset < source.utf16CodeUnits) { refuse("source page length cannot contain the next Unicode character"); }
  const documentSource = source.documentSource.slice(offset, nextOffset); const bytes = Buffer.from(documentSource, "utf8");
  return { member: source.member, footprintUuid: source.footprintUuid, sourceBytes: source.bytes, sourceSha256: source.sha256,
    totalUtf16CodeUnits: source.utf16CodeUnits, offsetUnit: "utf16-code-unit", offset, nextOffset,
    endOfSource: nextOffset === source.utf16CodeUnits, completeSourceReturned: offset === 0 && nextOffset === source.utf16CodeUnits,
    documentSource, pageBase64: bytes.toString("base64"), pageBytes: bytes.length, pageSha256: hash(bytes) };
}
