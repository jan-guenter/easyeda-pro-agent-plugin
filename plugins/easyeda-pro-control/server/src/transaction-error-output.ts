import { z } from "zod";
import { transactionErrorDetails } from "./transaction-error.ts";

function printableInstruction(text: string): boolean {
  for (const character of text) {
    const code = character.codePointAt(0) ?? 0;
    if (code === 127 || (code < 32 && ![9, 10, 13].includes(code))) { return false; }
  }
  return true;
}
export const transactionErrorOutputSchema = z.object({
  operationId: z.string().regex(/^[a-z0-9][a-z0-9-]{7,95}$/u),
  transactionState: z.string().regex(/^[a-z0-9][a-z0-9-]{0,127}$/u),
  orphanedCallPossible: z.boolean(),
  nextSafeAction: z.string().min(1).max(4096).refine(printableInstruction),
}).strict();
export function boundedTransactionErrorOutput(error: unknown): Partial<z.infer<typeof transactionErrorOutputSchema>> {
  const parsed = transactionErrorOutputSchema.safeParse(transactionErrorDetails(error));
  return parsed.success ? parsed.data : {};
}
