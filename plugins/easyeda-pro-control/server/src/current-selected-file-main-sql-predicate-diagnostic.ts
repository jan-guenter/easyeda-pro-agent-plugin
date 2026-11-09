/** Closed data from a separate failure-only guard reevaluation. This cannot
 * establish the original breakpoint's caught exception or authorize resume. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

const stage = z.enum(["helper-definitions", "util-types", "proxy-member", "proxy-kind", "proxy-source", "proxy-positive", "proxy-negative", "path", "database-member", "database-proxy", "database-source", "database-prototype", "condition-false"]);
/** Strict private sibling shape. Raw values and error objects have no field;
 * a refused inspector evaluation retains the original semantic failure. */
export const currentSelectedFileMainSqlPredicateDiagnosticSchema = z.strictObject({
  profile: z.literal("private.selected-file-main-sql-predicate-diagnostic.v1"), site: z.literal("initializerBirth"),
  probeState: z.enum(["not-read", "captured", "evaluation-refused"]), stage: stage.nullable(),
  diagnosticRequests: z.number().int().min(0).max(1), sourceQualified: z.literal(true), originalFailureRetained: z.literal(true),
  originalPredicateBranchVerified: z.literal(false), resumeAuthorized: z.literal(false), executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).refine(value => (value.probeState === "captured") === (value.stage !== null) &&
  (value.probeState === "not-read" ? value.diagnosticRequests === 0 : value.diagnosticRequests === 1));
export type CurrentSelectedFileMainSqlPredicateDiagnostic = z.infer<typeof currentSelectedFileMainSqlPredicateDiagnosticSchema>;
const reply = z.strictObject({ result: z.strictObject({ type: z.literal("string"), value: stage }) });
/** Accept only a by-value closed label from the original fixed command. No
 * exceptionDetails, remote handle, preview or caller-supplied code is accepted. */
export function decodeCurrentSelectedFileMainSqlPredicateDiagnostic(input: unknown): z.infer<typeof stage> {
  return reply.parse(captureCurrentPcbStringClockReply(input).value).result.value;
}
