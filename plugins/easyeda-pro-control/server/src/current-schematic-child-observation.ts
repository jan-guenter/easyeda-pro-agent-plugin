import { z } from "zod";
import { assertUpstreamReplySettled, canonicalJson, extractToolPayload } from "./core.ts";
import { CURRENT_SCHEMATIC_CHILD_MAX_BYTES } from "./current-schematic-child-program.ts";
import { copyCurrentSchematicChildTransport, parseCurrentSchematicChildObservation } from "./current-schematic-child-roster-contract.ts";
import type { CurrentSchematicChildObservation } from "./current-schematic-child-roster-contract.ts";
import { parseCurrentSchematicRenamePreflightRequest } from "./current-schematic-rename-preflight.ts";
import { EXACT_READ_ENVELOPE_SCHEMA, decodeExactReadEnvelope } from "./exact-readers.ts";

/** Strict transport decoding. The retained program and original SQL comparator
 * supply different evidence; this function cannot reconstruct either owner.
 */
export function decodeCurrentSchematicChildObservation(raw: unknown, request: unknown): CurrentSchematicChildObservation {
  const captured = copyCurrentSchematicChildTransport(raw), selected = parseCurrentSchematicRenamePreflightRequest(copyCurrentSchematicChildTransport(request));
  assertUpstreamReplySettled(captured);
  const envelope = z.object({ schema: z.literal(EXACT_READ_ENVELOPE_SCHEMA), utf8Bytes: z.number().int().nonnegative(),
    json: z.string().min(1).max(CURRENT_SCHEMATIC_CHILD_MAX_BYTES) }).strict().parse(extractToolPayload(captured));
  if (Buffer.byteLength(JSON.stringify(envelope)) > CURRENT_SCHEMATIC_CHILD_MAX_BYTES) { throw new Error("SCH child observation envelope exceeds its bound."); }
  const result = parseCurrentSchematicChildObservation(decodeExactReadEnvelope(envelope));
  if (canonicalJson(result.target) !== canonicalJson(selected.target)) { throw new Error("SCH child observation target differs."); }
  return result;
}
