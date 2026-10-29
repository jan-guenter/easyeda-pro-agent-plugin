import { createHash } from "node:crypto";
import { MANAGED_LIBRARY_ARCHIVE_MAX_EXPANDED_BYTES, MANAGED_LIBRARY_ARCHIVE_MAX_MEMBERS } from "./managed-library-files-zip.ts";
import { MANAGED_PROJECT_FOOTPRINT_INDEX_MAX_BYTES, MANAGED_PROJECT_FOOTPRINT_ROSTER_PAGE_ENTRIES,
  pageManagedProjectFootprintSource } from "./managed-project-footprint-sources.ts";

export const MANAGED_SYMBOL_SOURCE_ID_PATTERN = /^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/u;
export interface ManagedSymbolSource {
  readonly member: string;
  readonly symbolId: string;
  readonly identityKind: "archive-member-uuid" | "native-filename-sha256";
  readonly bytes: number;
  readonly sha256: string;
  readonly utf16CodeUnits: number;
  readonly documentSource: string;
}
export interface ManagedSymbolSourceSet {
  readonly sourceSetSha256: string;
  readonly inputSha256: string;
  readonly inputMembers: number;
  readonly totalSourceBytes: number;
  readonly sources: readonly ManagedSymbolSource[];
}
function refuse(reason: string): never { throw new Error(`Supplied symbol sources refused: ${reason}.`); }
function hash(bytes: Buffer): string { return createHash("sha256").update(bytes).digest("hex"); }
function source(member: string, symbolId: string, identityKind: ManagedSymbolSource["identityKind"], content: Buffer): ManagedSymbolSource {
  if (content.length === 0 || content.length > MANAGED_LIBRARY_ARCHIVE_MAX_EXPANDED_BYTES) { refuse("empty source or source byte bound"); }
  const documentSource = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(content);
  if (!Buffer.from(documentSource, "utf8").equals(content)) { refuse("lossless UTF-8 source encoding"); }
  return Object.freeze({ member, symbolId, identityKind, bytes: content.length, sha256: hash(content), utf16CodeUnits: documentSource.length, documentSource });
}
function finish(inputSha256: string, inputMembers: number, sources: readonly ManagedSymbolSource[]): ManagedSymbolSourceSet {
  if (!/^[a-f0-9]{64}$/u.test(inputSha256)) { refuse("input digest"); }
  const totalSourceBytes = sources.reduce((sum, item) => sum + item.bytes, 0);
  if (totalSourceBytes > MANAGED_LIBRARY_ARCHIVE_MAX_EXPANDED_BYTES) { refuse("aggregate source byte bound"); }
  const set = { inputSha256, inputMembers, totalSourceBytes, sources: Object.freeze(sources) };
  const index = encodeManagedSymbolSourceIndex(set);
  if (index.length > MANAGED_PROJECT_FOOTPRINT_INDEX_MAX_BYTES) { refuse("complete source index byte bound"); }
  return Object.freeze({ ...set, sourceSetSha256: hash(index) });
}
/** The pinned manager exporter writes SYMBOL/<uuid>.esym, combining symbols and
 * block_symbol. It appends raw dataStr bytes. This index does not infer subtype
 * or execute that source; pin inspection is a separate recognized-format read. */
export function collectManagedProjectSymbolSources(members: ReadonlyMap<string, Buffer>, inputSha256: string): ManagedSymbolSourceSet {
  if (members.size === 0 || members.size > MANAGED_LIBRARY_ARCHIVE_MAX_MEMBERS) { refuse("archive roster bound"); }
  const sources: ManagedSymbolSource[] = []; const identities = new Set<string>();
  for (const [member, content] of members) {
    if (member.toLowerCase().replace(/\/$/u, "").endsWith(".esym")) {
      const match = /^SYMBOL\/([a-f0-9]{16}|[a-f0-9]{32})\.esym$/u.exec(member); const symbolId = match?.[1];
      if (symbolId === undefined || identities.has(symbolId)) { refuse("every .esym candidate requires a distinct canonical SYMBOL/UUID.esym member"); }
      identities.add(symbolId); sources.push(source(member, symbolId, "archive-member-uuid", content));
    }
  }
  return finish(inputSha256, members.size, sources);
}
export function collectManagedStandaloneSymbolSource(name: string, content: Buffer): ManagedSymbolSourceSet {
  if (!/^[A-Za-z0-9][A-Za-z0-9_ -]*\.esym$/u.test(name)) { refuse("standalone symbol filename"); }
  const symbolId = hash(Buffer.from(name, "utf8"));
  return finish(hash(content), 1, [source(name, symbolId, "native-filename-sha256", content)]);
}
export function encodeManagedSymbolSourceIndex(set: Omit<ManagedSymbolSourceSet, "sourceSetSha256">): Buffer {
  return Buffer.from(JSON.stringify({ schema: "easyeda-pro-control.symbol-source-index.v1", inputSha256: set.inputSha256,
    inputMembers: set.inputMembers, totalSourceBytes: set.totalSourceBytes,
    sources: set.sources.map(({ documentSource: _documentSource, ...item }) => item) }), "utf8");
}
export function pageManagedSymbolRoster(set: ManagedSymbolSourceSet, offset: number, length: number): Record<string, unknown> {
  if (!Number.isSafeInteger(offset) || offset < 0 || offset > set.sources.length || !Number.isSafeInteger(length) ||
      length < 1 || length > MANAGED_PROJECT_FOOTPRINT_ROSTER_PAGE_ENTRIES) { refuse("source roster page bounds"); }
  const nextOffset = Math.min(set.sources.length, offset + length);
  return { totalSymbols: set.sources.length, offsetUnit: "source-entry", offset, nextOffset,
    endOfRoster: nextOffset === set.sources.length, completeRosterReturned: offset === 0 && nextOffset === set.sources.length,
    sources: set.sources.slice(offset, nextOffset).map(({ documentSource: _documentSource, ...item }) => item) };
}
export function pageManagedSymbolSource(item: ManagedSymbolSource, offset: number, length: number): Record<string, unknown> {
  const { footprintUuid: _footprintUuid, ...page } = pageManagedProjectFootprintSource({ ...item, footprintUuid: item.symbolId }, offset, length);
  return { ...page, symbolId: item.symbolId, identityKind: item.identityKind };
}
