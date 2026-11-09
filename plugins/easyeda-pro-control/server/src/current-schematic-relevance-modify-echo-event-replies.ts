/** Bounded primitive UI canvas data, never an origin or delivery issuer. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

export { currentSchematicRelevanceModifyEventMetadata as currentSchematicRelevanceModifyEchoEventMetadata } from "./current-schematic-relevance-modify-event-replies.ts";
export { qualifyCurrentSchematicRelevanceModifyEchoEventSource } from "./current-schematic-relevance-modify-echo-event-source.ts";

const integer = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER), scalar = z.string().min(1).max(256);
const evidence = z.tuple([scalar, scalar, scalar, scalar, integer, z.string().min(1).max(16_384), z.literal("TEXT"), scalar, z.literal(true), scalar, z.literal(false), z.boolean(), integer.nullable()]);
const evidenceReply = z.strictObject({ result: z.strictObject({ type: z.literal("object"), value: evidence }) });
const branch = z.tuple([z.enum(["undefined", "null", "function"]), integer, z.union([z.literal("undefined"), integer])]);
const branchReply = z.strictObject({ result: z.strictObject({ type: z.literal("object"), value: branch }) });
export type CurrentSchematicRelevanceModifyEchoEventEvidence = Readonly<z.infer<typeof evidence>>;
export type CurrentSchematicRelevanceModifyEchoReceiverBranch = Readonly<z.infer<typeof branch>>;
/** An explicit presence bit preserves undefined order numbers through CDP's
 * JSON result encoding. A null value without that tag is not accepted as data. */
export function currentSchematicRelevanceModifyEchoEventEvidence(input: unknown): CurrentSchematicRelevanceModifyEchoEventEvidence {
  const value = evidenceReply.parse(captureCurrentPcbStringClockReply(input).value).result.value;
  if (Object.is(value[4], -0) || value[11] !== (value[12] !== null) || Object.is(value[12], -0) || value[1] !== `/pro-mgr/canvas/${value[2]}/update`) { throw new Error("SCH_UI_ECHO_EVIDENCE"); }
  return Object.freeze(value);
}
/** Branch scalars describe the current channel. They do not call canPush or
 * authorize either callback branch, even when its supplied data is supported. */
export function currentSchematicRelevanceModifyEchoReceiverBranch(input: unknown): CurrentSchematicRelevanceModifyEchoReceiverBranch {
  const value = branchReply.parse(captureCurrentPcbStringClockReply(input).value).result.value;
  if (Object.is(value[1], -0) || Object.is(value[2], -0)) { throw new Error("SCH_UI_ECHO_BRANCH"); } return Object.freeze(value);
}
