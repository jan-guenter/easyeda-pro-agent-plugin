import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { CURRENT_SYMBOL_METADATA_MAX_BYTES, currentSymbolMetadataResultSchema, parseCurrentSymbolMetadataRequest } from "./current-symbol-metadata.ts";

/** Internal fixed observation only. DOM absence is not a worker lock, actor
 * witness, complete source membership, current SQL baseline or writer grant.
 */
export const currentClosedSymbolMetadataResultSchema = currentSymbolMetadataResultSchema.extend({
  kind: z.literal("current-closed-symbol-metadata-witness"), hiddenEditorsVerified: z.literal(true),
});
export type CurrentClosedSymbolMetadataResult = z.infer<typeof currentClosedSymbolMetadataResultSchema>;
export function validateCurrentClosedSymbolMetadataResult(input: unknown, raw: unknown): CurrentClosedSymbolMetadataResult {
  const request = parseCurrentSymbolMetadataRequest(input), result = currentClosedSymbolMetadataResultSchema.parse(raw);
  if (canonicalJson(result.target) !== canonicalJson(request.target) || result.value.uuid !== request.arguments.symbolUuid ||
      result.value.projectUuid !== request.target.projectUuid || Buffer.byteLength(JSON.stringify(result), "utf8") > CURRENT_SYMBOL_METADATA_MAX_BYTES) {
    throw new Error("Current closed-symbol metadata witness differs from its bounded exact target.");
  }
  return result;
}

/** Deliberate narrower projection for the existing checkpoint preparer. It
 * cannot carry the DOM claim or restore runtime provenance from supplied JSON.
 */
export function currentClosedSymbolMetadataProjection(input: CurrentClosedSymbolMetadataResult): z.infer<typeof currentSymbolMetadataResultSchema> {
  const value = currentClosedSymbolMetadataResultSchema.parse(input);
  return currentSymbolMetadataResultSchema.parse({ ...value, kind: "current-symbol-metadata-observation", hiddenEditorsVerified: false });
}
