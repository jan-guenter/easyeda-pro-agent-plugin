/** Passive private data from an already rejected startup read-owner reply.
 * Preserve the original decoder Error and native pause; this issues no resume,
 * retry, native owner or successful-read claim and sends no further request. */
import { z } from "zod";
import { canonicalJson, sha256Text } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const schema = z.strictObject({ profile: z.literal("private.current-main-startup-read-owner-failure.v1"),
  replySha256: z.string().regex(/^[a-f\d]{64}$(?![\s\S])/u), reply: z.unknown(), additionalRequests: z.literal(0),
  originalRejectedReplyRetained: z.literal(true), resumeAuthorized: z.literal(false), executionAuthorized: z.literal(false) });
export type CurrentMainStartupReadOwnerFailure = Readonly<z.infer<typeof schema>>;
const issued = new WeakMap<object, CurrentMainStartupReadOwnerFailure>();
export function validateCurrentMainStartupReadOwnerFailure(input: unknown): CurrentMainStartupReadOwnerFailure {
  const value = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (Buffer.byteLength(canonicalJson(value)) > 16_384 || value.replySha256 !== sha256Text(canonicalJson(value.reply))) { throw new Error("STARTUP_READ_OWNER_FAILURE_DATA"); }
  return freezeDeep(value);
}
/** Capture once, including bounded unknown CDP exception fields, without
 * reading any property of the Error or replacing the original rejection. */
export function retainCurrentMainStartupReadOwnerFailure(error: unknown, input: unknown): void {
  if (error === null || typeof error !== "object" || issued.has(error)) { return; }
  try {
    const reply = captureCurrentPcbStringClockReply(input).value;
    const value = validateCurrentMainStartupReadOwnerFailure({ profile: "private.current-main-startup-read-owner-failure.v1",
      replySha256: sha256Text(canonicalJson(reply)), reply, additionalRequests: 0, originalRejectedReplyRetained: true,
      resumeAuthorized: false, executionAuthorized: false });
    issued.set(error, value);
  } catch {
    // Optional evidence cannot replace the original decoder failure or alter
    // Native cleanup, command consumption or publication behavior.
  }
}
export function currentMainStartupReadOwnerFailureForError(error: unknown): CurrentMainStartupReadOwnerFailure | null {
  return error !== null && typeof error === "object" ? issued.get(error) ?? null : null;
}
