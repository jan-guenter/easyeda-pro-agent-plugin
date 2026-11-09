/** Explicit inverse-only profile over the unchanged schematic V1 hash banks.
 * Distinct fixed labels and lexical helper names preserve canonical original
 * source restoration without changing the shared hash decoder or bounds. */
import { CURRENT_PCB_DIAGNOSTIC_CSHARP_REVIEW_MAX_BYTES as MAXIMUM } from "./current-pcb-diagnostic-csharp-review-storage.ts";
import { currentPcbDiagnosticCSharpLexicalTokens as tokenize } from "./current-pcb-diagnostic-csharp-spacing.ts";
import { expandCurrentSchematicNativeHashVectors as expandFixed, projectCurrentSchematicNativeHashVectors as projectFixed } from "./current-schematic-native-hash-vector-storage.ts";

const INVERSE = Object.freeze(["// BEGIN FIXED INVERSE HASH VECTORS V1\n", "// END FIXED INVERSE HASH VECTORS V1\n", "// fixed-inverse-hash-vector-source ", "EasyedaInverseHashVectorsV1"] as const);
const SHARED = Object.freeze(["// BEGIN FIXED SCHEMATIC HASH VECTORS V1\n", "// END FIXED SCHEMATIC HASH VECTORS V1\n", "// fixed-schematic-hash-vector-source ", "EasyedaSchematicHashVectorsV1"] as const);
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_HASH_VECTOR_STORAGE"); } }
/** Reject either family's metadata and helper identifiers in original source.
 * String/comment contents remain untouched and cannot masquerade as code. */
function original(source: string): void { if (Buffer.byteLength(source) > MAXIMUM) { throw new Error(`INVERSE_HASH_EXPANDED_BYTES_${String(Buffer.byteLength(source))}`); } need(![...INVERSE.slice(0, 3), ...SHARED.slice(0, 3)].some(marker => source.includes(marker))); const active = tokenize(source); need(!active.some(token => token.kind === "identifier" && (token.text.replace(/^@/u, "") === INVERSE[3] || token.text.replace(/^@/u, "") === SHARED[3]))); }
/** Relabel three unique fixed metadata comments and only exact helper-name
 * identifier tokens. Literal/base64 bytes never participate in replacement. */
function labels(source: string, from: typeof INVERSE | typeof SHARED, to: typeof INVERSE | typeof SHARED): string {
  let result = source; for (const index of [0, 1, 2] as const) { const marker = from[index], replacement = to[index]; need(result.split(marker).length === 2 && !result.includes(replacement)); result = result.replace(marker, replacement); }
  const active = tokenize(result), parts: string[] = []; let prior = 0; let count = 0;
  for (const token of active) { if (token.kind === "identifier") { need(token.text.replace(/^@/u, "") !== to[3]); if (token.text.replace(/^@/u, "") === from[3]) { need(token.text === from[3]); parts.push(result.slice(prior, token.start), to[3]); prior = token.end; count += 1; } } }
  need(count >= 2); parts.push(result.slice(prior)); return parts.join("");
}
/** Detect this format only; detection provides no validity or runtime grant. */
export function hasCurrentFootprintInverseNativeHashVectorStorage(source: string): boolean { return source.includes("FIXED INVERSE HASH VECTORS V1") || source.includes("fixed-inverse-hash-vector-source"); }
/** Restore complete original bytes through the unchanged bounded bank parser,
 * then reproject canonically to bind every hash, use, peer and helper byte. */
export function expandCurrentFootprintInverseNativeHashVectors(source: string): string {
  if (!hasCurrentFootprintInverseNativeHashVectorStorage(source)) { original(source); return expandFixed(source); }
  need(!SHARED.slice(0, 3).some(marker => source.includes(marker))); const restored = expandFixed(labels(source, INVERSE, SHARED)); original(restored); need(labels(projectFixed(restored), SHARED, INVERSE) === source); return restored;
}
/** Opt in solely the inverse compiler with an immutable distinct profile.
 * No caller data selects a format, hash dictionary, source or execution path. */
export function projectCurrentFootprintInverseNativeHashVectors(input: string): string { const source = expandCurrentFootprintInverseNativeHashVectors(input); const projected = projectFixed(source); if (projected === source) { return source; } const result = labels(projected, SHARED, INVERSE); need(expandCurrentFootprintInverseNativeHashVectors(result) === source); return result; }
