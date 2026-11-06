/** New schemas only. A stage acknowledgement grants no persistence or inverse. */
import { z } from "zod";
import { CURRENT_PCB_VIA_WRITE_STAGES } from "./current-pcb-via-write-program.ts";

export const CURRENT_PCB_VIA_WRITE_PURPOSE = "pcb-via-write209";
export const currentPcbViaWriteStageResultSchema = z.strictObject({
  schema: z.literal("easyeda-pro-control.pcb209-via-write-stage.v1"), stage: z.enum(CURRENT_PCB_VIA_WRITE_STAGES), ok: z.boolean(),
  dispatchAttempted: z.boolean(), originalPromiseAcknowledged: z.boolean(),
  primitiveId: z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u).nullable(),
  createAttempted: z.boolean(), createAcknowledged: z.boolean(), saveAttempted: z.boolean(), saveAcknowledged: z.boolean(),
  inverseAvailable: z.literal(false), persistenceVerified: z.literal(false),
}).refine(value => (!value.createAcknowledged || value.createAttempted && value.primitiveId !== null) &&
  (!value.saveAttempted || value.createAcknowledged) && (!value.saveAcknowledged || value.saveAttempted) &&
  (!value.originalPromiseAcknowledged || value.dispatchAttempted) &&
  (!value.ok || value.stage !== "create" || value.createAcknowledged && value.originalPromiseAcknowledged) &&
  (!value.ok || value.stage !== "save" || value.saveAcknowledged && value.originalPromiseAcknowledged));
export type CurrentPcbViaWriteStageResult = z.infer<typeof currentPcbViaWriteStageResultSchema>;
