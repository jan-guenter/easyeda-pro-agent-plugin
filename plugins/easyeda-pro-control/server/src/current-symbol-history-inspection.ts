/** Managed historical diagnostics only. No retained owner or continuation is
 * reconstructed, and no application, source project or SQL snapshot is read.
 */
import { z } from "zod";
import { loadOperation, operationPath } from "./artifacts.ts";

const purposeSchema = z.enum(["disposable-validation", "ordinary-symbol-metadata"]);
type Purpose = z.infer<typeof purposeSchema>;
const hash = z.string().regex(/^[a-f0-9]{64}$/u);
const baselinePlanSchema = z.object({ profile: z.literal("easyeda-pro-control.current-symbol-closed-baseline.v1"),
  purpose: purposeSchema }).loose();
const writerPlanSchema = z.object({ profile: z.literal("easyeda-pro-control.current-symbol-writer.v1"),
  baselinePlan: baselinePlanSchema, baselineJournalSha256: hash, baselineCopyReceiptSha256: hash, startupSha256: hash }).strict();
const verificationPlanSchema = z.object({ profile: z.literal("easyeda-pro-control.current-symbol-verification.v1"),
  writerPlan: writerPlanSchema, writerJournalSha256: hash, posteditCopyReceiptSha256: hash }).strict();
const planSchema = z.discriminatedUnion("profile", [baselinePlanSchema, writerPlanSchema, verificationPlanSchema]);
const flagsSchema = z.object({ hardStop: z.boolean().optional(), orphanedCallPossible: z.boolean().optional(),
  mutationMayHaveOccurred: z.boolean().optional(), finishSnapshotFailed: z.boolean().optional() });
const descriptorSchema = z.object({ path: z.string().min(1).max(4096), bytes: z.number().int().positive(), sha256: hash }).strict();

export async function inspectCurrentSymbolHistory(operationId: string, purpose: Purpose): Promise<Record<string, unknown>> {
  const id = z.string().regex(/^[a-z0-9][a-z0-9-]{7,95}$/u).parse(operationId);
  const expectedPurpose = purposeSchema.parse(purpose);
  // Managed loading rechecks journal, plan and every artifact's bytes.
  // Its unkeyed hashes detect corruption; they do not authenticate history.
  const journal = await loadOperation(id), plan = planSchema.parse(journal.plan);
  let baseline: z.infer<typeof baselinePlanSchema>;
  if (plan.profile === "easyeda-pro-control.current-symbol-verification.v1") { baseline = plan.writerPlan.baselinePlan; }
  else if (plan.profile === "easyeda-pro-control.current-symbol-writer.v1") { baseline = plan.baselinePlan; }
  else { baseline = plan; }
  if (journal.operationId !== id || journal["journalPath"] !== operationPath(id) || baseline.purpose !== expectedPurpose) {
    throw new Error("Current symbol historical inspection has another identity or purpose.");
  }
  const result = { profile: "easyeda-pro-control.current-symbol-historical-inspection.v1", operationId: id,
    purpose: expectedPurpose, journalPath: operationPath(id), recordedPlanProfile: plan.profile,
    recordedState: z.string().min(1).max(160).parse(journal["state"]),
    recordedSequence: z.number().int().nonnegative().parse(journal["sequence"]),
    recordedFlags: flagsSchema.parse(journal), artifacts: z.array(descriptorSchema).max(4096).parse(journal.artifacts),
    historicalEvidenceOnly: true, currentStateVerified: false, originalOwnerRetained: false,
    continuationAuthorized: false, replayAllowed: false, executionAuthorized: false };
  if (Buffer.byteLength(JSON.stringify({ result }), "utf8") > 524_288) {
    throw new Error("Current symbol historical inspection exceeds its complete output bound.");
  }
  return result;
}
