import { crc32, inflateRawSync } from "node:zlib";
import { z } from "zod";

export const MANAGED_LIBRARY_ARCHIVE_MAX_BYTES = 4 * 1024 * 1024;
export const MANAGED_LIBRARY_ARCHIVE_MAX_EXPANDED_BYTES = 8 * 1024 * 1024;
export const MANAGED_LIBRARY_ARCHIVE_MAX_MEMBERS = 256;
const inflatedSchema = z.object({ buffer: z.instanceof(Buffer), engine: z.object({ bytesWritten: z.number().int().nonnegative() }) });

function refuse(reason: string): never { throw new Error(`Managed library ZIP refused: ${reason}.`); }
function signature(bytes: Buffer, offset: number, value: number): void {
  if (offset < 0 || offset + 4 > bytes.length || bytes.readUInt32LE(offset) !== value) { refuse("record signature or extent"); }
}

function memberName(bytes: Buffer): string {
  const name = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
  if (name.length === 0 || name.length > 256 || !/^[A-Za-z0-9_./ -]+$/u.test(name) || name.startsWith("/") ||
      name.split("/").some((part, index, all) => part === "." || part === ".." || part === "" && index !== all.length - 1)) {
    refuse("member name, traversal or unsupported encoding");
  }
  return name;
}

/** ZIP32 only: every member is accounted for and checked before any metadata
 * is projected. Entries remain in memory; no archive pathname is opened. */
export function readManagedLibraryZip(bytes: Buffer): ReadonlyMap<string, Buffer> {
  if (bytes.length < 22 || bytes.length > MANAGED_LIBRARY_ARCHIVE_MAX_BYTES) { refuse("archive byte bound"); }
  let end = -1;
  for (let offset = bytes.length - 22; offset >= Math.max(0, bytes.length - 1046); offset -= 1) {
    if (bytes.readUInt32LE(offset) === 0x06_05_4B_50 && offset + 22 + bytes.readUInt16LE(offset + 20) === bytes.length) {
      if (end !== -1) { refuse("ambiguous end record"); }
      end = offset;
    }
  }
  if (end < 0 || bytes.readUInt16LE(end + 4) !== 0 || bytes.readUInt16LE(end + 6) !== 0) { refuse("missing or multi-disk end record"); }
  const count = bytes.readUInt16LE(end + 10); const centralBytes = bytes.readUInt32LE(end + 12); const centralStart = bytes.readUInt32LE(end + 16);
  if (count === 0 || count > MANAGED_LIBRARY_ARCHIVE_MAX_MEMBERS || bytes.readUInt16LE(end + 8) !== count || centralStart + centralBytes !== end) {
    refuse("directory count or complete extent");
  }
  const output = new Map<string, Buffer>(); const foldedNames = new Set<string>();
  let central = centralStart; let expanded = 0; let local = 0;
  for (let index = 0; index < count; index += 1) {
    signature(bytes, central, 0x02_01_4B_50);
    if (central + 46 > end) { refuse("truncated directory entry"); }
    const flags = bytes.readUInt16LE(central + 8); const method = bytes.readUInt16LE(central + 10); const crc = bytes.readUInt32LE(central + 16);
    const compressedSize = bytes.readUInt32LE(central + 20); const size = bytes.readUInt32LE(central + 24);
    const nameLength = bytes.readUInt16LE(central + 28); const extraLength = bytes.readUInt16LE(central + 30); const commentLength = bytes.readUInt16LE(central + 32);
    const attributes = bytes.readUInt32LE(central + 38); const localOffset = bytes.readUInt32LE(central + 42);
    const nextCentral = central + 46 + nameLength + extraLength + commentLength;
    if (nextCentral > end || nameLength === 0 || extraLength !== 0 || commentLength > 1024 || bytes.readUInt16LE(central + 34) !== 0 ||
        ![0, 2048].includes(flags) || ![0, 8].includes(method) || bytes.readUInt16LE(central + 6) > 20 || localOffset !== local ||
        compressedSize > MANAGED_LIBRARY_ARCHIVE_MAX_BYTES || size > MANAGED_LIBRARY_ARCHIVE_MAX_EXPANDED_BYTES - expanded) {
      refuse("unsupported flags, compression, extras, extent or expansion");
    }
    const nameBytes = bytes.subarray(central + 46, central + 46 + nameLength); const name = memberName(nameBytes); const directory = name.endsWith("/");
    const unixMode = Math.floor(attributes / 65_536); const kind = Math.floor(unixMode / 4096);
    if (foldedNames.has(name.toLowerCase()) || (kind !== 0 && kind !== (directory ? 4 : 8)) ||
        attributes % 65_536 !== 0 && attributes % 65_536 !== (directory ? 16 : 32)) { refuse("duplicate, alias or non-regular member"); }
    foldedNames.add(name.toLowerCase());
    signature(bytes, local, 0x04_03_4B_50);
    if (local + 30 > centralStart || bytes.readUInt16LE(local + 4) !== bytes.readUInt16LE(central + 6) ||
        bytes.readUInt16LE(local + 6) !== flags || bytes.readUInt16LE(local + 8) !== method ||
        bytes.readUInt32LE(local + 10) !== bytes.readUInt32LE(central + 12) || bytes.readUInt32LE(local + 14) !== crc ||
        bytes.readUInt32LE(local + 18) !== compressedSize || bytes.readUInt32LE(local + 22) !== size ||
        bytes.readUInt16LE(local + 26) !== nameLength || bytes.readUInt16LE(local + 28) !== 0) { refuse("local and central records differ"); }
    const dataStart = local + 30 + nameLength; const dataEnd = dataStart + compressedSize;
    if (dataEnd > centralStart || !bytes.subarray(local + 30, dataStart).equals(nameBytes)) { refuse("member extent or local name"); }
    const compressed = bytes.subarray(dataStart, dataEnd);
    let content: Buffer;
    if (method === 0) { content = Buffer.from(compressed); }
    else {
      // Bounded synchronous decompression consumes at most 4 MiB input and 8 MiB
      // Output across this call. Node's info result also rejects trailing streams.
      // oxlint-disable-next-line node/no-sync
      const inflated: unknown = inflateRawSync(compressed, { maxOutputLength: Math.max(1, size), info: true });
      const result = inflatedSchema.parse(inflated);
      if (result.engine.bytesWritten !== compressed.length) { refuse("unconsumed deflate bytes"); }
      content = result.buffer;
    }
    if (content.length !== size || crc32(content) !== crc || directory && size !== 0) { refuse("member size, CRC or directory content"); }
    expanded += size; output.set(name, content); local = dataEnd; central = nextCentral;
  }
  if (central !== end || local !== centralStart) { refuse("unaccounted archive bytes"); }
  for (const name of output.keys()) {
    if (name.endsWith("/") && foldedNames.has(name.slice(0, -1).toLowerCase())) { refuse("file and directory share a name"); }
    const parts = name.replace(/\/$/u, "").split("/");
    for (let index = 1; index < parts.length; index += 1) {
      if (foldedNames.has(parts.slice(0, index).join("/").toLowerCase())) { refuse("file also used as a directory"); }
    }
  }
  return output;
}
