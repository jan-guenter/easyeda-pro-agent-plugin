/** Rechecks a private seven-record schematic journal through ordinary managed readers. Historical
 * terminal acceptance clears a blocker; it grants no execution or ownership. */
import { z } from "zod";
import { createOperationScanner, loadOperation, verifyExactManagedArtifact } from "./artifacts.ts";
import { isRecord, sha256Json } from "./core.ts";
import { inspectCurrentSchematicRelevanceDisplayWriteAbandonment, schematicRelevanceDisplayWriteHistoricalTerminal } from "./current-schematic-relevance-display-write-abandonment-data.ts";

const expectedSchema = z.strictObject({ operationId: z.string().min(1).max(96),
  storedJournalSha256: z.string().regex(/^[a-f\d]{64}$/u), entireStoredJournalSha256: z.string().regex(/^[a-f\d]{64}$/u) });
export async function inspectCurrentSchematicRelevanceDisplayWriteAdmission(expected: z.infer<typeof expectedSchema>): Promise<Readonly<{ terminal: boolean; abandoned?: true }>> {
  expectedSchema.parse(expected);
  const operation = await loadOperation(expected.operationId);
  const current = (): void => {
    if (operation.operationId !== expected.operationId || operation["journalSha256"] !== expected.storedJournalSha256 || sha256Json(operation) !== expected.entireStoredJournalSha256) {
      throw new Error("SCHEMATIC_RELEVANCE_WRITE_ADMISSION_JOURNAL_CHANGED");
    }
  };
  current(); const terminal = schematicRelevanceDisplayWriteHistoricalTerminal(operation);
  for (const descriptor of operation.artifacts ?? []) { await verifyExactManagedArtifact(descriptor); current(); }
  const abandoned = terminal ? undefined : await inspectCurrentSchematicRelevanceDisplayWriteAbandonment(expected.operationId, expected); current();
  const final = await loadOperation(expected.operationId); current();
  if (sha256Json(final) !== expected.entireStoredJournalSha256 || schematicRelevanceDisplayWriteHistoricalTerminal(final) !== terminal) {
    throw new Error("SCHEMATIC_RELEVANCE_WRITE_ADMISSION_FINAL_JOURNAL_CHANGED");
  }
  return abandoned === undefined ? Object.freeze({ terminal }) : Object.freeze({ terminal, abandoned: true });
}

/** Private workflow preflight only, before its own journal exists. Every
 * matching historical family is freshly parsed; no record becomes an owner. */
export async function assertNoUnresolvedCurrentSchematicRelevanceDisplayWrites(): Promise<void> {
  const scanner = createOperationScanner(operation => {
    const operationId = operation["operationId"], plan = operation["plan"];
    if (!(isRecord(plan) && plan["profile"] === "private.generated-schematic-relevance-display-journal.v1") &&
      !(typeof operationId === "string" && operationId.startsWith("sch209-relevance-display-"))) {
      // oxlint-disable-next-line unicorn/no-useless-undefined -- Undefined is the operation scanner's explicit omitted-family result.
      return undefined;
    }
    return expectedSchema.parse({ operationId, storedJournalSha256: operation["journalSha256"], entireStoredJournalSha256: sha256Json(operation) });
  });
  for (const row of await scanner()) {
    const qualified = await inspectCurrentSchematicRelevanceDisplayWriteAdmission(row);
    if (!qualified.terminal && qualified.abandoned !== true) { throw new Error("SCHEMATIC_RELEVANCE_WRITE_ADMISSION_UNRESOLVED_OPERATION"); }
  }
}
