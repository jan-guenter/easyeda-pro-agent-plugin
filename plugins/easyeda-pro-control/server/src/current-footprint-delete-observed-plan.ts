/** Actual worker-version encoding for the future original inverse. v1 remains
 * immutable; this data model grants no clock, delete or native ownership. */
import { z } from "zod";
import { sha256Text } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

const integer = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER - 1).refine(value => !Object.is(value, -0));
const encodingFields = {
  workerEditorVersionPresent: z.boolean(), workerEditorVersionUndefined: z.boolean(),
  workerEditorVersion: z.string().min(1).max(64).refine(value => value.isWellFormed()).nullable(),
};
const encodingSchema = z.object(encodingFields).strict().refine(value =>
  value.workerEditorVersionUndefined === (value.workerEditorVersion === null) && (value.workerEditorVersionPresent || value.workerEditorVersionUndefined));
export type CurrentFootprintDeleteWorkerEncoding = Readonly<z.infer<typeof encodingSchema>>;
/** Bounded own-data encoding only. Native origin and clock provenance remain
 * the original owner's separate obligation. No caller attestation grants it. */
export function captureCurrentFootprintDeleteWorkerEncoding(input: unknown): CurrentFootprintDeleteWorkerEncoding {
  return Object.freeze(encodingSchema.parse(captureCurrentPcbStringClockReply(input).value));
}
const inputSchema = z.object({
  targetUuid: z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$(?![\s\S])/u),
  client: z.string().regex(/^[a-f\d]{16}$(?![\s\S])/u),
  maximumTicketBeforeClock: integer,
  maximumTicketAfterClock: integer,
  documentClock: integer.positive().max(8_640_000_000_000_000),
  managerUserAbsent: z.literal(true),
  ...encodingFields,
}).strict().refine(value => value.maximumTicketBeforeClock === value.maximumTicketAfterClock &&
  (value.workerEditorVersionUndefined === (value.workerEditorVersion === null)) &&
  (value.workerEditorVersionPresent || value.workerEditorVersionUndefined));
export interface CurrentFootprintDeleteObservedPlan {
  readonly profile: "private.current-footprint-delete-plan.v2";
  readonly targetUuid: string;
  readonly ticket: number;
  readonly documentClock: number;
  readonly workerEditorVersionPresent: boolean;
  readonly workerEditorVersionUndefined: boolean;
  readonly workerEditorVersion: string | null;
  readonly workerUpload: string;
  readonly workerUploadSha256: string;
  readonly documentClockCalls: 1;
  readonly explicitSaveAttempts: 0;
  readonly databaseRestoration: false;
  readonly executionAuthorized: false;
  readonly nativeClockProvenanceVerified: false;
  readonly wholeSqlEffectVerified: false;
  readonly savedAbsenceVerified: false;
}
const originals = new WeakSet<CurrentFootprintDeleteObservedPlan>();
export function prepareCurrentFootprintDeleteObservedPlan(input: unknown): CurrentFootprintDeleteObservedPlan {
  const value = inputSchema.parse(captureCurrentPcbStringClockReply(input).value);
  const ticket = value.maximumTicketAfterClock + 1;
  // Native xt appends editVersion only when its actual worker value is truthy.
  // This scope admits absent/undefined or bounded nonempty string values only.
  const header: Record<string, string | number> = { docType: "FOOTPRINT", client: value.client, uuid: value.targetUuid,
    updateTime: value.documentClock, version: String(value.documentClock) };
  if (value.workerEditorVersion !== null) { header["editVersion"] = value.workerEditorVersion; }
  const workerUpload = `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify(header)}|\n${JSON.stringify({ type: "DELETE_DOC", ticket, id: "DELETE_DOC" })}||{"isDelete":true}`;
  const plan: CurrentFootprintDeleteObservedPlan = Object.freeze({ profile: "private.current-footprint-delete-plan.v2",
    targetUuid: value.targetUuid, ticket, documentClock: value.documentClock,
    workerEditorVersionPresent: value.workerEditorVersionPresent, workerEditorVersionUndefined: value.workerEditorVersionUndefined,
    workerEditorVersion: value.workerEditorVersion, workerUpload, workerUploadSha256: sha256Text(workerUpload),
    documentClockCalls: 1, explicitSaveAttempts: 0, databaseRestoration: false, executionAuthorized: false,
    nativeClockProvenanceVerified: false, wholeSqlEffectVerified: false, savedAbsenceVerified: false });
  originals.add(plan); return plan;
}
export function verifyCurrentFootprintDeleteObservedUpload(plan: CurrentFootprintDeleteObservedPlan, value: unknown): void {
  if (!originals.has(plan) || typeof value !== "string" || value !== plan.workerUpload) { throw new Error("FOOTPRINT_DELETE_OBSERVED_UPLOAD"); }
}
