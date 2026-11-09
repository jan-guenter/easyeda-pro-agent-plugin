/** Explicit inverse-only build projection over the unchanged fixed framework
 * catalogue. Its separate markers never admit a schematic alias block. */
import { expandCurrentSchematicNativeTypeAliases as expandFixed, projectCurrentSchematicNativeTypeAliases as projectFixed } from "./current-schematic-native-type-aliases.ts";

const INVERSE = Object.freeze(["// BEGIN FIXED INVERSE TYPE ALIASES V1\n", "// END FIXED INVERSE TYPE ALIASES V1\n", "// fixed-inverse-type-alias-source "] as const);
const SHARED = Object.freeze(["// BEGIN FIXED SCHEMATIC TYPE ALIASES V1\n", "// END FIXED SCHEMATIC TYPE ALIASES V1\n", "// fixed-schematic-type-alias-source "] as const);
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_TYPE_ALIASES"); } }
/** Translate exactly three unique build metadata labels. Program, alias and
 * source-hash bytes remain untouched; mixed or repeated families refuse. */
function labels(source: string, from: typeof INVERSE | typeof SHARED, to: typeof INVERSE | typeof SHARED): string {
  let result = source; for (const [index, marker] of from.entries()) { const replacement = to[index]; need(replacement !== undefined && source.split(marker).length === 2 && !source.includes(replacement)); result = result.replace(marker, replacement); } return result;
}
/** Restore the original complete source before any maintained source pass.
 * The fixed parser rechecks alias collisions, hash and canonical projection. */
export function expandCurrentFootprintInverseNativeTypeAliases(source: string): string {
  need(!SHARED.some(marker => source.includes(marker)));
  if (!source.includes(INVERSE[0])) { need(!INVERSE.some(marker => source.includes(marker))); return expandFixed(source); }
  const restored = expandFixed(labels(source, INVERSE, SHARED)); need(!INVERSE.some(marker => restored.includes(marker)) && !SHARED.some(marker => restored.includes(marker)) && labels(projectFixed(restored), SHARED, INVERSE) === source); return restored;
}
/** Opt in only this inverse compiler to the fixed catalogue. It retains full
 * old-source restoration and adds no runtime, Call, Job or writer authority. */
export function projectCurrentFootprintInverseNativeTypeAliases(input: string): string { const source = expandCurrentFootprintInverseNativeTypeAliases(input); const projected = labels(projectFixed(source), SHARED, INVERSE); need(expandCurrentFootprintInverseNativeTypeAliases(projected) === source); return projected; }
