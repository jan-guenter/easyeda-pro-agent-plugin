/** Shared inert native-binding shape. Parsing historical data never recreates
 * the original helper, process, Job or pipe ownership. */
import { z } from "zod";

const token = z.string().regex(/^[a-f0-9]{32}$/u);
export const diagnosticLifecycleBindingSchema = z.object({
  helperInstance: token, jobId: token, rootPid: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  rootCreated: z.string().regex(/^(?:0|[1-9]\d{14,19})$/u),
}).strict();
