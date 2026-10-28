import { crc32, deflateRawSync } from "node:zlib";

export interface ManagedProjectFootprintArchiveEntry { readonly name: string; readonly content: string | Buffer }
export function managedProjectFootprintArchive(entries: readonly ManagedProjectFootprintArchiveEntry[]): Buffer {
  const locals: Buffer[] = []; const centrals: Buffer[] = []; let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name); const content = typeof entry.content === "string" ? Buffer.from(entry.content) : entry.content;
    // oxlint-disable-next-line node/no-sync -- Deterministic compressed synthetic archives exercise the bounded production inflation and CRC path.
    const compressed = deflateRawSync(content); const local = Buffer.alloc(30); const central = Buffer.alloc(46);
    local.writeUInt32LE(0x04_03_4B_50); local.writeUInt16LE(20, 4); local.writeUInt16LE(8, 8);
    local.writeUInt32LE(crc32(content), 14); local.writeUInt32LE(compressed.length, 18); local.writeUInt32LE(content.length, 22); local.writeUInt16LE(name.length, 26);
    central.writeUInt32LE(0x02_01_4B_50); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(8, 10);
    central.writeUInt32LE(crc32(content), 16); central.writeUInt32LE(compressed.length, 20); central.writeUInt32LE(content.length, 24);
    central.writeUInt16LE(name.length, 28); central.writeUInt32LE(offset, 42);
    locals.push(local, name, compressed); centrals.push(central, name); offset += local.length + name.length + compressed.length;
  }
  const directory = Buffer.concat(centrals); const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06_05_4B_50); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, directory, end]);
}
