/** Schematic-only V1 storage of immutable smoke expectations. Banks reuse the
 * unchanged 256-hash decoder; each original vector stores ushort indexes.
 * Expansion restores every original C# byte before maintained source passes. */
import { createHash } from "node:crypto";
import { CURRENT_PCB_DIAGNOSTIC_CSHARP_REVIEW_MAX_BYTES as MAXIMUM } from "./current-pcb-diagnostic-csharp-review-storage.ts";
import { currentPcbDiagnosticCSharpLexicalTokens as tokenize } from "./current-pcb-diagnostic-csharp-spacing.ts";
import { currentPcbDiagnosticNativeHashVector as originalVector } from "./current-pcb-diagnostic-fixed-table-native.ts";

const BEGIN = "\n// BEGIN FIXED SCHEMATIC HASH VECTORS V1\n", END = "// END FIXED SCHEMATIC HASH VECTORS V1\n";
const NAME = "EasyedaSchematicHashVectorsV1", ORIGINAL = "EasyedaDiagnosticFixedTable";
const BANK_SIZE = 256, INDEX_BASE64_MAXIMUM = 684, MAX_VECTORS = 128;
const MAX_HASHES = BANK_SIZE * MAX_VECTORS;
type Token = ReturnType<typeof tokenize>[number];
interface Vector { readonly first: Token; readonly last: Token; readonly hashes: readonly string[] }
interface Stored { readonly banks: readonly (readonly string[])[]; readonly indexes: readonly (readonly number[])[] }
const hash = (source: string): string => createHash("sha256").update(source).digest("hex");
/** Reject before storage output. This codec has no caller-selected dictionary,
 * native request, compilation, process or execution authority. */
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_NATIVE_HASH_VECTOR_STORAGE"); } }
/** Use the existing complete bounded ASCII C# lexer; unsupported syntax refuses. */
function tokens(source: string): readonly Token[] {
  need(Buffer.byteLength(source) <= MAXIMUM); return tokenize(source).filter(token => token.kind !== "space" && token.kind !== "comment");
}
/** Decode the exact old binary32 vector with its unchanged bounds and canonical
 * base64. No old source module or historical decoder is changed. */
function hashes(encoded: string, count: number): readonly string[] {
  need(Number.isSafeInteger(count) && count >= 1 && count <= BANK_SIZE && encoded.length <= 10_924 && /^[A-Za-z\d+/]+={0,2}$/u.test(encoded));
  const bytes = Buffer.from(encoded, "base64"); need(bytes.length === count * 32 && bytes.toString("base64") === encoded);
  return Object.freeze(Array.from({ length: count }, (_value, index) => bytes.subarray(index * 32, (index + 1) * 32).toString("hex")));
}
/** Match only the old emitter's contiguous verbatim call shape. Foreign roots,
 * escaped spellings, altered punctuation or fresh helper collisions refuse. */
function vectors(source: string): readonly Vector[] {
  const active = tokens(source), result: Vector[] = [];
  for (const [index, first] of active.entries()) {
    if (first.kind === "identifier") {
      need(first.text.replace(/^@/u, "") !== NAME);
      if (first.text.replace(/^@/u, "") === ORIGINAL && active[index + 1]?.text === "." && active[index + 2]?.text.replace(/^@/u, "") === "Hashes") {
        need(first.text === ORIGINAL && active[index + 2]?.text === "Hashes" && active[index + 3]?.text === "(" && active[index - 1]?.text !== "." && active[index - 1]?.text !== "::");
        const integer = active[index + 6], last = active[index + 7], literal = active[index + 4];
        need(literal?.kind === "verbatim" && /^@"[A-Za-z\d+/=]+"$/u.test(literal.text) && active[index + 5]?.text === "," && integer?.kind === "number" && /^[1-9]\d{0,2}$/u.test(integer.text) && last?.text === ")");
        const values = hashes(literal.text.slice(2, -1), Number(integer.text));
        need(source.slice(first.start, last.end) === originalVector(values)); result.push({ first, last, hashes: values });
      }
    }
  }
  need(result.length > 0 && result.length <= MAX_VECTORS); return result;
}
/** Assign every hash its first-occurrence index, then split only at the fixed
 * 256-entry bank boundary. ushort indexes remain below the unchanged roster cap. */
function storage(values: readonly Vector[]): Stored {
  const indexes: number[][] = [], pool: string[] = [], seen = new Map<string, number>();
  for (const value of values) {
    indexes.push(value.hashes.map(item => {
      let index = seen.get(item); if (index === undefined) { index = pool.length; need(index < MAX_HASHES); pool.push(item); seen.set(item, index); } return index;
    }));
  }
  const banks: string[][] = []; for (let index = 0; index < pool.length; index += BANK_SIZE) { banks.push(pool.slice(index, index + BANK_SIZE)); }
  return { banks, indexes };
}
/** Store each fixed vector as canonical little-endian uint16 bytes. */
function encodedIndexes(values: readonly number[], size: number): string {
  need(values.length > 0 && values.length <= BANK_SIZE && size >= 1 && size <= MAX_HASHES);
  const bytes = Buffer.alloc(values.length * 2);
  for (const [position, value] of values.entries()) { need(Number.isSafeInteger(value) && value >= 0 && value < size); bytes.writeUInt16LE(value, position * 2); }
  return bytes.toString("base64");
}
/** Immutable V1 emitted decoder contract. A different body/order/encoding must
 * use a new version so historical canonical blocks remain readable. */
function block(length: number, sha256: string, stored: Stored): string {
  const size = stored.banks.reduce((sum, bank) => sum + bank.length, 0);
  return `${BEGIN}// fixed-schematic-hash-vector-source ${String(length)} ${sha256}\ninternal static class ${NAME}{
static readonly string[][] B=new string[][]{${stored.banks.map(bank => originalVector(bank)).join(",")}};
static readonly ushort[][] V=new ushort[][]{${stored.indexes.map(items => `D(@"${encodedIndexes(items, size)}",${String(items.length)})`).join(",")}};
static ushort[] D(string encoded,int count){if(encoded==null||count<1||count>256||encoded.Length>684)throw new global::System.InvalidOperationException("schematic-hash-index-bound");byte[] bytes=global::System.Convert.FromBase64String(encoded);if(bytes.Length!=count*2||global::System.Convert.ToBase64String(bytes)!=encoded)throw new global::System.InvalidOperationException("schematic-hash-index-encoding");ushort[] result=new ushort[count];for(int i=0;i<count;i++){int value=bytes[i*2]|(bytes[i*2+1]<<8);if(value>=${String(size)})throw new global::System.InvalidOperationException("schematic-hash-index-range");result[i]=(ushort)value;}return result;}
internal static string[] Get(int index){if(index<0||index>=${String(stored.indexes.length)})throw new global::System.InvalidOperationException("schematic-hash-vector-range");ushort[] values=V[index];string[] result=new string[values.Length];for(int i=0;i<values.Length;i++){int bank=values[i]/256,slot=values[i]%256;if(bank>=B.Length||slot>=B[bank].Length)throw new global::System.InvalidOperationException("schematic-hash-bank-range");result[i]=B[bank][slot];}return result;}}
${END}`;
}
/** Project only when the complete fixed representation saves review bytes.
 * Every original count/hash/call remains recoverable; literal/comment bytes stay. */
function projectOriginal(source: string): string {
  const values = vectors(source);
  const stored = storage(values);
  const parts: string[] = []; let prior = 0;
  for (const [index, value] of values.entries()) { parts.push(source.slice(prior, value.first.start), `${NAME}.Get(${String(index)})`); prior = value.last.end; }
  parts.push(source.slice(prior), block(Buffer.byteLength(source), hash(source), stored));
  const result = parts.join(""); if (result.length >= source.length) { return source; } need(Buffer.byteLength(result) <= MAXIMUM); return result;
}
/** Parse only the exact fixed suffix and its bounded canonical data literals. */
function storedBlock(source: string): Readonly<{ start: number; length: number; sha256: string; stored: Stored }> {
  const start = source.indexOf(BEGIN); need(start !== -1 && source.split(BEGIN).length === 2 && source.split(END).length === 2 && source.endsWith(END));
  const own = source.slice(start);
  const metadata = /^\/\/ fixed-schematic-hash-vector-source ([1-9]\d*) ([a-f\d]{64})\n/u.exec(own.slice(BEGIN.length));
  need(metadata !== null); const length = Number(metadata[1]), sha256 = metadata[2]; need(Number.isSafeInteger(length) && length <= MAXIMUM && sha256 !== undefined);
  const banks: (readonly string[])[] = [];
  for (const match of own.matchAll(/EasyedaDiagnosticFixedTable\.Hashes\(@"([A-Za-z\d+/=]+)",([1-9]\d{0,2})\)/gu)) {
    need(match[1] !== undefined); banks.push(hashes(match[1], Number(match[2]))); need(banks.length <= MAX_VECTORS);
  }
  need(banks.length > 0 && banks.every((bank, index) => index === banks.length - 1 || bank.length === BANK_SIZE));
  const pool = banks.flat(); need(pool.length <= MAX_HASHES && new Set(pool).size === pool.length);
  const indexes: number[][] = [];
  for (const match of own.matchAll(/D\(@"([A-Za-z\d+/=]+)",([1-9]\d{0,2})\)/gu)) {
    const count = Number(match[2]), encoded = match[1]; need(encoded !== undefined && encoded.length <= INDEX_BASE64_MAXIMUM && count >= 1 && count <= BANK_SIZE);
    const bytes = Buffer.from(encoded, "base64"); need(bytes.length === count * 2 && bytes.toString("base64") === encoded);
    const values = Array.from({ length: count }, (_value, index) => bytes.readUInt16LE(index * 2)); need(values.every(value => value < pool.length)); indexes.push(values); need(indexes.length <= MAX_VECTORS);
  }
  const stored = { banks, indexes }; need(indexes.length > 0 && block(length, sha256, stored) === own); return { start, length, sha256, stored };
}
/** Format detection only. It grants no validity, runtime owner or execution. */
export function hasCurrentSchematicNativeHashVectorStorage(source: string): boolean {
  return source.includes("FIXED SCHEMATIC HASH VECTORS V1") || source.includes("fixed-schematic-hash-vector-source");
}
/** Remove only this exact canonical suffix and restore every old call in its
 * original order. Full original bytes/hash and deterministic re-projection bind
 * dictionary order, indexes, all peer text and the immutable emitted decoder. */
export function expandCurrentSchematicNativeHashVectors(source: string): string {
  const active = tokens(source);
  if (!hasCurrentSchematicNativeHashVectorStorage(source)) { need(!active.some(token => token.kind === "identifier" && token.text.replace(/^@/u, "") === NAME)); return source; }
  const own = storedBlock(source), pool = own.stored.banks.flat();
  const without = source.slice(0, own.start);
  const view = tokens(without);
  const parts: string[] = []; let count = 0, length = Buffer.byteLength(without), prior = 0;
  need(length <= own.length);
  for (const [index, token] of view.entries()) {
    if (token.kind === "identifier" && token.text.replace(/^@/u, "") === NAME) {
      // Read indexes from one lexical view so strings/comments cannot masquerade
      // As a use, duplicate a vector or move a call behind another expression.
      const integer = view[index + 4], last = view[index + 5];
      need(token.text === NAME && view[index - 1]?.text !== "." && view[index - 1]?.text !== "::" && view[index + 1]?.text === "." && view[index + 2]?.text === "Get" && view[index + 3]?.text === "(" && integer?.kind === "number" && /^(?:0|[1-9]\d*)$/u.test(integer.text) && Number(integer.text) === count && last?.text === ")");
      const values = own.stored.indexes[count]; need(values !== undefined);
      const restored = originalVector(values.map(value => { const item = pool[value]; need(item !== undefined); return item; }));
      need(without.slice(token.start, last.end) === `${NAME}.Get(${String(count)})`); length += restored.length - (last.end - token.start); need(length <= own.length);
      parts.push(without.slice(prior, token.start), restored); prior = last.end; count += 1;
    }
  }
  parts.push(without.slice(prior)); const result = parts.join("");
  need(count === own.stored.indexes.length && Buffer.byteLength(result) === own.length && hash(result) === own.sha256 && projectOriginal(result) === source); return result;
}
/** Deterministic schematic-only projection. Old shared/inverse storage and
 * native hash decoder modules remain untouched and require their own reader. */
export function projectCurrentSchematicNativeHashVectors(input: string): string {
  const source = expandCurrentSchematicNativeHashVectors(input);
  const result = projectOriginal(source);
  need(expandCurrentSchematicNativeHashVectors(result) === source); return result;
}
