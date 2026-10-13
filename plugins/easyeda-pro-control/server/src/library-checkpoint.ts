import { isRecord } from "./core.ts";
import type { CheckpointReceipt } from "./checkpoint.ts";

/** The sourceChanged=false flag is not success: a corrupt checkpoint also yields
 * that flag. Require the complete verification and its retained exact identity.
 */
export function assertUnchangedLibraryCheckpoint(value: unknown, receipt: CheckpointReceipt, message: string): void {
  if (!isRecord(value) || value["ok"] !== true || value["sourceChanged"] !== false || value["sourceEqualsCheckpoint"] !== true ||
      value["sourceMatchesReceipt"] !== true || value["checkpointMatchesReceipt"] !== true || value["receiptPath"] !== receipt.receiptPath ||
      value["source"] !== receipt.source || value["checkpoint"] !== receipt.checkpoint || value["checkpointSha256"] !== receipt.checkpointSha256 ||
      value["checkpointDumpSha256"] !== receipt.checkpointDumpSha256) { throw new Error(message); }
}
