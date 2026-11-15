/** Pure original full-writer input schema shared by runtime and frontend.
 * Importing it allocates no checkpoint, reader, provider or native owner. */
import { z } from "zod";
import { currentDisposableOpenTargetSchema } from "./current-disposable-open.ts";

export const currentFootprintForwardWriterHeadInputRequestSchema = z.strictObject({
  operationId:z.string().max(96).regex(/^footprint-forward-writer-[a-z\d][a-z\d-]{0,95}$(?![\s\S])/u),
  target:currentDisposableOpenTargetSchema,footprintUuid:z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$(?![\s\S])/u),
  confirmDisposableProject:z.literal(true),acceptExistingProfileEffects:z.literal(true),
  acceptNormalOpenEffects:z.literal(true),acceptDebuggerPauseEffects:z.literal(true),
});

export const currentFootprintForwardWriterInputOperationIdSchema=currentFootprintForwardWriterHeadInputRequestSchema.shape.operationId;
