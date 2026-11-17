/** Separate full-writer startup component. Its parent retains the same native
 * purpose and all process/helper ownership. Durable rows grant no execution. */
import {z} from "zod";

export const CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_FRONTIER_PROFILE="private.current-footprint-forward-writer-startup-frontier.v1";
export const CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_FRONTIER_PREFIX="footprint-forward-frontier-";
const parentPrefix="footprint-forward-writer-";
const sourceRecordUpperBound=512;
const callbackHolds=3*sourceRecordUpperBound;
const normalRecords=1+2+2*callbackHolds+2*2+2+1;
const cleanupRecords=1+2;
const recordBytes=4096;
const artifactPathUnits=8192;
/** Exact logical component reservation. Evaluated helper-source reads are
 * absent in this actual controller; no7R helper proof is claimed. */
export const CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_FRONTIER_BUDGET=Object.freeze({
 sourceRecordUpperBound,callbackHolds,callbackCommands:18*sourceRecordUpperBound,callbackArms:4,
 queueCommands:3*sourceRecordUpperBound+3,timerCommands:28,
 rendererRequests:4+18*sourceRecordUpperBound+(3*sourceRecordUpperBound+3)+28,
 normalRecords,cleanupRecords,records:normalRecords+cleanupRecords,recordBytes,
 normalBytes:normalRecords*recordBytes,cleanupBytes:cleanupRecords*recordBytes,
 artifactPathUnits,manifestBytes:(normalRecords+cleanupRecords)*(recordBytes+artifactPathUnits+512)+65_536,
 wholeWriterReserved:false,executionAuthorized:false,saveAuthorized:false,
});
export const currentFootprintForwardWriterStartupFrontierIdSchema=z.string().min(CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_FRONTIER_PREFIX.length+8).max(96).regex(/^footprint-forward-frontier-[a-z0-9][a-z0-9-]*$(?![\s\S])/u);
export const currentFootprintForwardWriterStartupFrontierRequestSchema=z.strictObject({
 operationId:currentFootprintForwardWriterStartupFrontierIdSchema,
 parentOperationId:z.string().min(parentPrefix.length+8).max(96).regex(/^footprint-forward-writer-[a-z0-9][a-z0-9-]*$(?![\s\S])/u),
 acceptOriginalProjectTimerCancellation:z.literal(true),
}).refine(value=>value.parentOperationId===parentPrefix+value.operationId.slice(CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_FRONTIER_PREFIX.length));
export type CurrentFootprintForwardWriterStartupFrontierRequest=Readonly<z.infer<typeof currentFootprintForwardWriterStartupFrontierRequestSchema>>;
export const CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_FRONTIER_PHASES=Object.freeze([
 "operation-intent","setup-intent","setup-result","callback-intent","callback-result","timer-intent","timer-result",
 "queue-intent","queue-result","frontier-result","failure","release-intent","release-result",
] as const);
export type CurrentFootprintForwardWriterStartupFrontierPhase=typeof CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_FRONTIER_PHASES[number];
export const CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_FRONTIER_CALLBACK_ROLES=Object.freeze(["startupEntry","startupReturn","initialFinally","queuedFinally"] as const);
export const currentFootprintForwardWriterStartupFrontierRecordSchema=z.strictObject({
 schema:z.literal("easyeda-pro-control.footprint-forward-writer-startup-frontier-record.v1"),
 operationId:currentFootprintForwardWriterStartupFrontierIdSchema,
 sequence:z.number().int().min(0).max(CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_FRONTIER_BUDGET.records-1),
 previousSha256:z.string().regex(/^[a-f\d]{64}$(?![\s\S])/u).nullable(),
 kind:z.enum(CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_FRONTIER_PHASES),evidence:z.record(z.string(),z.unknown()),
 executionAuthorized:z.literal(false),saveAuthorized:z.literal(false),
});
export type CurrentFootprintForwardWriterStartupFrontierRecord=Readonly<z.infer<typeof currentFootprintForwardWriterStartupFrontierRecordSchema>>;
export {CURRENT_FOOTPRINT_FORWARD_WRITER_PURPOSE as CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_FRONTIER_PURPOSE} from "./current-footprint-forward-writer-profile.ts";
