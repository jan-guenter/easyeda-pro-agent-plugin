/** Scalar joins for the same-reader TEXT wave. Neither a copied packet nor
 * these comparisons issue observer custody or a worker continuation. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { CurrentSchematicRelevancePublicationPayload } from "./current-schematic-relevance-publication-body-replies.ts";

const values = z.tuple([z.string(), z.string(), z.string(), z.literal("TEXT"), z.string(), z.number().int().nonnegative(), z.literal(true), z.string(), z.literal("SCH_PAGE"), z.string().regex(/^[a-f\d]{64}$/u)]);
/** Match all ten original onChange scalars to the retained wire packet and
 * the separately bound project UUID. The wire UUID is the page, and the
 * channel is never accepted as a substitute for project ownership. */
export function requireCurrentSchematicRelevanceModifyStructureCaller(input: unknown, payload: Readonly<CurrentSchematicRelevancePublicationPayload>, projectUuid: string): void {
  const actual = values.parse(captureCurrentPcbStringClockReply(input).value);
  const expected = [payload[3], payload[4], payload[6], payload[10], payload[7], payload[5], true, payload[8], payload[11], projectUuid];
  if (!actual.every((value, index) => Object.is(value, expected[index]))) { throw new Error("PROJECT_STRUCTURE_MODIFY_ORIGINAL_TEXT_PAYLOAD"); }
}
