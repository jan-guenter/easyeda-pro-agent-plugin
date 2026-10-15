import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { CURRENT_SYMBOL_METADATA_MAX_BYTES, currentSymbolMetadataResultSchema, parseCurrentSymbolMetadataRequest } from "./current-symbol-metadata.ts";
import { currentSymbolRuntimeObservationSchema } from "./current-symbol-runtime-observation.ts";

/** Internal fixed observation only. DOM absence is not a worker lock, actor
 * witness, complete source membership, current SQL baseline or writer grant.
 */
export const currentClosedSymbolMetadataResultSchema = currentSymbolMetadataResultSchema.extend({
  kind: z.literal("current-closed-symbol-metadata-witness"), hiddenEditorsVerified: z.literal(true),
  runtimeObservation: currentSymbolRuntimeObservationSchema,
  clientTicketObservation: z.object({ client: z.string().regex(/^[a-f0-9]{16}$/u),
    maxTicket: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER)
      .refine((value) => !Object.is(value, -0), "Signed zero is unsupported."), samples: z.literal(4) }).strict(),
}).refine((value) => value.clientTicketObservation.maxTicket >= value.value.ticket,
  "Observed project maximum ticket cannot precede the symbol metadata ticket.");
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
  return currentSymbolMetadataResultSchema.parse({ ok: value.ok, kind: "current-symbol-metadata-observation", method: value.method,
    target: value.target, value: value.value, samples: value.samples, implementationKind: value.implementationKind,
    targetClosedInRegistry: value.targetClosedInRegistry, hiddenEditorsVerified: false, workerIdentityVerified: value.workerIdentityVerified,
    cadAuthority: value.cadAuthority, persistenceVerified: value.persistenceVerified, sourceMembershipVerified: value.sourceMembershipVerified });
}
