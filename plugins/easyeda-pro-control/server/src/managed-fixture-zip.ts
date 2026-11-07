import { crc32 } from "node:zlib";

/** Fixed two-member ZIP32 framing for new generated data. There is no supplied
 * member name, extraction path, native file or filesystem operation. */
export function packManagedFixtureArchive(manifest: Buffer, source: Buffer): Buffer {
  const centrals: Buffer[] = [], locals: Buffer[] = [];
  let offset = 0;
  for (const [nameText, content] of [["project2.json", manifest], ["Fixture.epru", source]] as const) {
    const central = Buffer.alloc(46), local = Buffer.alloc(30), name = Buffer.from(nameText, "utf8");
    const checksum = crc32(content);
    local.writeUInt32LE(0x04_03_4B_50); local.writeUInt16LE(20, 4); local.writeUInt16LE(33, 12);
    local.writeUInt32LE(checksum, 14); local.writeUInt32LE(content.length, 18); local.writeUInt32LE(content.length, 22); local.writeUInt16LE(name.length, 26);
    central.writeUInt32LE(0x02_01_4B_50); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(33, 14);
    central.writeUInt32LE(checksum, 16); central.writeUInt32LE(content.length, 20); central.writeUInt32LE(content.length, 24);
    central.writeUInt16LE(name.length, 28); central.writeUInt32LE(offset, 42);
    locals.push(local, name, content); centrals.push(central, name); offset += local.length + name.length + content.length;
  }
  const directory = Buffer.concat(centrals), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06_05_4B_50); end.writeUInt16LE(2, 8); end.writeUInt16LE(2, 10);
  end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, directory, end]);
}
