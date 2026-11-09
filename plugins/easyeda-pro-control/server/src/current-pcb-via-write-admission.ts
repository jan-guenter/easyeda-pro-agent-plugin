/** Rechecks a private Via journal through ordinary managed readers. Historical
 * terminal acceptance clears a blocker; it grants no execution or ownership. */
import { z } from "zod";
import { loadOperation, verifyExactManagedArtifact } from "./artifacts.ts";
import { sha256Json } from "./core.ts";
import { currentPcbViaWriteHistoricalTerminal } from "./current-pcb-via-write-journal-codec.ts";

import { inspectCurrentPcbViaWriteAbandonment } from "./current-pcb-via-write-abandonment-data.ts";
import { inspectCurrentPcbViaPreopeningRelinquishment } from "./current-pcb-via-preopening-relinquishment-journal.ts";

const expectedSchema = z.strictObject({ operationId: z.string().min(1).max(96),
  storedJournalSha256: z.string().regex(/^[a-f\d]{64}$/u), entireStoredJournalSha256: z.string().regex(/^[a-f\d]{64}$/u) });
export async function inspectCurrentPcbViaWriteAdmission(expected: z.infer<typeof expectedSchema>): Promise<Readonly<{ terminal: boolean; abandoned?: true }>> {
  expectedSchema.parse(expected);
  const operation = await loadOperation(expected.operationId);
  const current = (): void => {
    if (operation.operationId !== expected.operationId || operation["journalSha256"] !== expected.storedJournalSha256 || sha256Json(operation) !== expected.entireStoredJournalSha256) {
      throw new Error("PCB_VIA_WRITE_ADMISSION_JOURNAL_CHANGED");
    }
  };
  current(); const terminal = currentPcbViaWriteHistoricalTerminal(operation);
  for (const descriptor of operation.artifacts ?? []) { await verifyExactManagedArtifact(descriptor); current(); }
  const abandoned = terminal ? undefined : await inspectCurrentPcbViaWriteAbandonment(expected.operationId, expected) ?? await inspectCurrentPcbViaPreopeningRelinquishment(expected.operationId, expected); current();
  const final = await loadOperation(expected.operationId); current();
  if (sha256Json(final) !== expected.entireStoredJournalSha256 || currentPcbViaWriteHistoricalTerminal(final) !== terminal) {
    throw new Error("PCB_VIA_WRITE_ADMISSION_FINAL_JOURNAL_CHANGED");
  }
  return abandoned === undefined ? Object.freeze({ terminal }) : Object.freeze({ terminal, abandoned: true });
}
