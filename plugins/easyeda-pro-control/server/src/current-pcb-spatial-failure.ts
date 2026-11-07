/** Private failed inspector data only. Historical packets grant no ownership,
 * source acceptance, observation retry or native execution. */
import { z } from "zod";
import { CURRENT_PCB_SPATIAL_FAILURE_REPLY_BYTES, captureCurrentPcbSpatialFailureReply } from "./current-pcb-spatial-function-source.ts";

export { CURRENT_PCB_SPATIAL_FAILURE_REPLY_BYTES } from "./current-pcb-spatial-function-source.ts";
const reply = z.string().max(CURRENT_PCB_SPATIAL_FAILURE_REPLY_BYTES).refine(value => {
  try { return captureCurrentPcbSpatialFailureReply(JSON.parse(value) as unknown) === value; }
  catch { return false; }
});
export const currentPcbSpatialDecodeFailureSchema = z.strictObject({
  step: z.string().max(256).regex(/^[A-Za-z\d_.:-]+$/u),
  replyJson: reply.nullable(), replyCaptureRefused: z.boolean(),
}).refine(value => value.replyCaptureRefused === (value.replyJson === null));
