import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";

const MAX_PROGRAM_BYTES = 65_536;
const MAX_COMPRESSED_BYTES = 65_536;

/** Storage encoding only: execution receives the exact original UTF-8 program. */
export function packedNativeProgram(name: string, program: string): string {
  if (!/^[A-Z][A-Za-z0-9]{1,63}Function$/u.test(name)) { throw new Error("Invalid fixed native program name"); }
  const bytes = Buffer.from(program, "utf8");
  if (bytes.length === 0 || bytes.length > MAX_PROGRAM_BYTES ||
      new TextDecoder("utf-8", { fatal: true }).decode(bytes) !== program) {
    throw new Error("Fixed native program exceeds its exact UTF-8 contract");
  }
  // oxlint-disable-next-line node/no-sync -- The deterministic generator processes at most64KiB of fixed source, outside the runtime request path.
  const compressed = gzipSync(bytes, { level: 9 });
  if (compressed.length > MAX_COMPRESSED_BYTES) { throw new Error("Compressed native program exceeds its bound"); }
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const compressedSha256 = createHash("sha256").update(compressed).digest("hex");
  return `  const string ${name}Gzip="${compressed.toString("base64")}";\n` +
    `  const string ${name}Sha256="${sha256}";\n` +
    `  static readonly string ${name}=UnpackFixedProgram(${name}Gzip,${bytes.length},${name}Sha256,"${compressedSha256}");`;
}

export async function generatePackedNativeProgram(marker: string, name: string, program: string): Promise<void> {
  const action = process.argv[2];
  if (process.argv.length !== 3 || action !== "--write" && action !== "--check") { throw new Error("Expected --write or --check"); }
  if (!/^[A-Z][A-Z ]{1,63}$/u.test(marker)) { throw new Error("Invalid fixed native program marker"); }
  const path = new URL("pcb-diagnostic-owner.ps1", import.meta.url), source = await readFile(path, "utf8");
  const begin = `// BEGIN GENERATED PCB209 ${marker} PROGRAM`, end = `// END GENERATED PCB209 ${marker} PROGRAM`;
  const start = source.indexOf(begin), stop = source.indexOf(end);
  if (start === -1 || stop < start || source.includes(begin, start + begin.length) || source.includes(end, stop + end.length)) {
    throw new Error("Native program markers must occur once");
  }
  const generated = `${begin}\n${packedNativeProgram(name, program)}\n  ${end}`;
  const next = source.slice(0, start) + generated + source.slice(stop + end.length);
  if (action === "--write") { await writeFile(path, next); }
  else if (next !== source) { throw new Error("Generated packed native program differs"); }
}
