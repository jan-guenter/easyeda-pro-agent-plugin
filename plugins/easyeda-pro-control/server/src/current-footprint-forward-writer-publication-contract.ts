/** Distinct original mutation-publication component under the same full
 * parent. Serialized callback facts never create an owner or execution grant. */
import {z} from "zod";

export const CURRENT_FOOTPRINT_FORWARD_WRITER_PUBLICATION_PROFILE="private.current-footprint-forward-writer-publication.v1";
export const CURRENT_FOOTPRINT_FORWARD_WRITER_PUBLICATION_PREFIX="footprint-forward-publication-";
const parentPrefix="footprint-forward-writer-";
const bodyLineUpperBound=256;
const callbackRunUpperBound=2*bodyLineUpperBound;
const callbackHolds=3*callbackRunUpperBound;
const normalRecords=6*callbackRunUpperBound+8;
const cleanupRecords=3;
const recordBytes=4096;
const artifactPathUnits=8192;
/** P=2R covers original parse and later source replay without rearming the
 * completed startup subscriber. Only the actual controller can spend it. */
export const CURRENT_FOOTPRINT_FORWARD_WRITER_PUBLICATION_BUDGET=Object.freeze({
 bodyLineUpperBound,callbackRunUpperBound,callbackHolds,callbackCommands:18*callbackRunUpperBound,callbackArms:0,timerCommands:0,
 queueCommands:3*callbackRunUpperBound+3,rendererRequests:21*callbackRunUpperBound+3,
 controls:3*callbackRunUpperBound+4,eventUpperBound:15*callbackRunUpperBound+20,
 normalRecords,cleanupRecords,records:normalRecords+cleanupRecords,recordBytes,normalBytes:normalRecords*recordBytes,cleanupBytes:cleanupRecords*recordBytes,
 artifactPathUnits,manifestBytes:(normalRecords+cleanupRecords)*(recordBytes+artifactPathUnits+512)+65_536,
 wholeWriterReserved:false,executionAuthorized:false,saveAuthorized:false,
});
export const currentFootprintForwardWriterPublicationIdSchema=z.string().min(CURRENT_FOOTPRINT_FORWARD_WRITER_PUBLICATION_PREFIX.length+8).max(96).regex(/^footprint-forward-publication-[a-z0-9][a-z0-9-]*$(?![\s\S])/u);
export const currentFootprintForwardWriterPublicationRequestSchema=z.strictObject({operationId:currentFootprintForwardWriterPublicationIdSchema,parentOperationId:z.string().min(parentPrefix.length+8).max(96).regex(/^footprint-forward-writer-[a-z0-9][a-z0-9-]*$(?![\s\S])/u),acceptOriginalMutationPublication:z.literal(true)}).refine(value=>value.parentOperationId===parentPrefix+value.operationId.slice(CURRENT_FOOTPRINT_FORWARD_WRITER_PUBLICATION_PREFIX.length));
export type CurrentFootprintForwardWriterPublicationRequest=Readonly<z.infer<typeof currentFootprintForwardWriterPublicationRequestSchema>>;
export const CURRENT_FOOTPRINT_FORWARD_WRITER_PUBLICATION_PHASES=Object.freeze(["operation-intent","setup-intent","setup-result","body-intent","body-result","callback-intent","callback-result","queue-intent","queue-result","publication-result","failure","release-intent","release-result"] as const);
export type CurrentFootprintForwardWriterPublicationPhase=typeof CURRENT_FOOTPRINT_FORWARD_WRITER_PUBLICATION_PHASES[number];
export const CURRENT_FOOTPRINT_FORWARD_WRITER_PUBLICATION_CALLBACK_ROLES=Object.freeze(["startupEntry","startupReturn","initialFinally","queuedFinally"] as const);
export const currentFootprintForwardWriterPublicationRecordSchema=z.strictObject({schema:z.literal("easyeda-pro-control.footprint-forward-writer-publication-record.v1"),operationId:currentFootprintForwardWriterPublicationIdSchema,sequence:z.number().int().min(0).max(CURRENT_FOOTPRINT_FORWARD_WRITER_PUBLICATION_BUDGET.records-1),previousSha256:z.string().regex(/^[a-f\d]{64}$(?![\s\S])/u).nullable(),kind:z.enum(CURRENT_FOOTPRINT_FORWARD_WRITER_PUBLICATION_PHASES),evidence:z.record(z.string(),z.unknown()),executionAuthorized:z.literal(false),saveAuthorized:z.literal(false)});
export type CurrentFootprintForwardWriterPublicationRecord=Readonly<z.infer<typeof currentFootprintForwardWriterPublicationRecordSchema>>;
export {CURRENT_FOOTPRINT_FORWARD_WRITER_PURPOSE as CURRENT_FOOTPRINT_FORWARD_WRITER_PUBLICATION_PURPOSE} from "./current-footprint-forward-writer-profile.ts";
