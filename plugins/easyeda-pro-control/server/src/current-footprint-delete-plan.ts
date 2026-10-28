/** Unmounted inverse groundwork. This predicts one native footprint tombstone,
 * not a database restoration, native invocation or completed delete lifecycle. */
import { z } from "zod";
import { sha256Text } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

const integer = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).refine(value => !Object.is(value, -0));
const inputSchema = z.object({
  targetUuid: z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})(?![\s\S])/u),
  client: z.string().regex(/^[a-f\d]{16}(?![\s\S])/u),
  maximumTicketBeforeClock: integer.max(Number.MAX_SAFE_INTEGER - 1),
  maximumTicketAfterClock: integer.max(Number.MAX_SAFE_INTEGER - 1),
  documentClock: integer.positive().max(8_640_000_000_000_000),
  managerUserAbsent: z.literal(true),
  editorVersion: z.literal("3.2.209"),
}).strict().refine(value => value.maximumTicketBeforeClock === value.maximumTicketAfterClock,
  "The native clock await must not hide a changed ticket baseline.");
export interface CurrentFootprintDeletePlan {
  readonly profile: "private.current-footprint-delete-plan.v1";
  readonly targetUuid: string;
  readonly ticket: number;
  readonly documentClock: number;
  readonly workerUpload: string;
  readonly workerUploadSha256: string;
  readonly documentClockCalls: 1;
  readonly explicitSaveAttempts: 0;
  readonly databaseRestoration: false;
  readonly executionAuthorized: false;
  readonly dependencyEligibilityVerified: false;
  readonly nativeClockProvenanceVerified: false;
  readonly wholeSqlEffectVerified: false;
  readonly savedAbsenceVerified: false;
}
const issued = new WeakSet<CurrentFootprintDeletePlan>();
export function prepareCurrentFootprintDeletePlan(input: unknown): CurrentFootprintDeletePlan {
  const value = inputSchema.parse(captureCurrentPcbStringClockReply(input).value);
  const ticket = value.maximumTicketAfterClock + 1;
  const head = `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({
    docType: "FOOTPRINT", client: value.client, uuid: value.targetUuid, updateTime: value.documentClock,
    version: String(value.documentClock), editVersion: value.editorVersion,
  })}`;
  const deletion = `${JSON.stringify({ type: "DELETE_DOC", ticket, id: "DELETE_DOC" })}||{"isDelete":true}`;
  const workerUpload = `${head}|\n${deletion}`;
  const plan: CurrentFootprintDeletePlan = Object.freeze({ profile: "private.current-footprint-delete-plan.v1",
    targetUuid: value.targetUuid, ticket, documentClock: value.documentClock, workerUpload,
    workerUploadSha256: sha256Text(workerUpload), documentClockCalls: 1, explicitSaveAttempts: 0,
    databaseRestoration: false, executionAuthorized: false, dependencyEligibilityVerified: false,
    nativeClockProvenanceVerified: false, wholeSqlEffectVerified: false, savedAbsenceVerified: false });
  issued.add(plan); return plan;
}
/** The comparison uses exact bytes, including native header order, tombstone ID,
 * omission of an absent manager user, and no trailing source separator. */
export function verifyCurrentFootprintDeleteWorkerUpload(plan: CurrentFootprintDeletePlan, value: unknown): void {
  if (!issued.has(plan) || typeof value !== "string" || value !== plan.workerUpload) {
    throw new Error("FOOTPRINT_DELETE_WORKER_UPLOAD");
  }
}
