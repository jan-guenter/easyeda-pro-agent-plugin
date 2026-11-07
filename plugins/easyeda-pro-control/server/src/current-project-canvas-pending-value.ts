/** Inert values from the selected original pending node. This schema issues
 * no worker origin, body authority, mutation grant or completion evidence. */
import { z } from "zod";

const bounded = (maximum: number): z.ZodString => z.string().max(maximum).refine(value => value.isWellFormed());
export const currentProjectCanvasPendingValueSchema = z.strictObject({
  maximumTicket: z.number().int().positive().max(Number.MAX_SAFE_INTEGER - 2),
  primitiveId: bounded(256).min(1), ticket: z.number().int().positive(), client: bounded(128).min(1),
  dataType: z.enum(["VIA", "TEXT"]), data: bounded(16_384).min(1).refine(value => Buffer.byteLength(value) <= 16_384),
  canvasUuid: bounded(128).min(1), workerEditVersion: bounded(128).nullable(), priorVersion: bounded(128).nullable(),
  priorUserUndefined: z.boolean(), priorUserJson: bounded(4096).nullable(),
}).refine(value => value.ticket <= value.maximumTicket && value.priorUserUndefined === (value.priorUserJson === null));
export type CurrentProjectCanvasPendingValue = Readonly<z.infer<typeof currentProjectCanvasPendingValueSchema>>;
