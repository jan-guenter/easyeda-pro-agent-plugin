/** Readonly finite ticket/return data. The original controller separately
 * owns every resume and the one scoped native notification cancellation. */
import { z } from "zod";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_RETURN_PROGRAMS as P } from "./current-schematic-relevance-modify-return-programs.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_RETURN_FLAGS = Object.freeze({ objectGroup: "easyeda-schematic-relevance-modify-return-v1", silent: true, generatePreview: false, throwOnSideEffect: true } as const);
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_RETURN_CALLS = freezeDeep([
 ["timer-entry", P.timerEntry, 5, true], ["collection-same", P.collectionSame, 4, true], ["tuple", P.tuple, 2, true], ["project", P.project, 2, false], ["parent-delta", P.parentDelta, 4, true], ["parent-before", P.parentBefore, 5, true], ["methods", P.methods, 2, false], ["natives", P.natives, 1, false], ["native-proof", P.nativeProof, 2, true],
 ["ticket-before", P.ticketBefore, 5, true], ["ticket-introduced", P.ticketIntroduced, 3, true], ["ticket-cleared", P.ticketCleared, 3, true], ["websocket-excluded", P.websocketExcluded, 4, true],
 ["event-read", P.eventRead, 7, false], ["event-same", P.eventSame, 2, true], ["snapshot", P.snapshot, 1, false], ["same", P.same, 2, true],
] as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_RELEVANCE_MODIFY_RETURN_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const propertiesParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const argument = z.strictObject({ objectId: handle });
const argumentsSchema = z.array(argument).max(7);
const functionDeclaration = z.string().max(16_384);
const callParams = z.strictObject({ ...flags, objectId: handle, functionDeclaration, arguments: argumentsSchema, returnByValue: z.boolean(), awaitPromise: z.literal(false), userGesture: z.literal(false) });
const propertiesCommand = z.strictObject({ phase: z.literal("modify-return-properties"), method: z.literal("Runtime.getProperties"), params: propertiesParams });
const role = z.string().max(32);
const callCommand = z.strictObject({ phase: z.literal("modify-return-call"), role, method: z.literal("Runtime.callFunctionOn"), params: callParams });
const schema = z.discriminatedUnion("phase", [propertiesCommand, callCommand]);
export type CurrentSchematicRelevanceModifyReturnCommand = z.infer<typeof schema>;
/** Capture before any caller field read and match the exact reviewed helper,
 * arity, flags and result mode. This accepts no native cancellation or resume. */
export function validateCurrentSchematicRelevanceModifyReturnCommand(input: unknown): CurrentSchematicRelevanceModifyReturnCommand {
 const command = schema.parse(captureCurrentPcbStringClockReply(input).value);
 if (command.phase === "modify-return-call") { const row = CURRENT_SCHEMATIC_RELEVANCE_MODIFY_RETURN_CALLS.find(value => value[0] === command.role); if (row === undefined || row[1] !== command.params.functionDeclaration || row[2] !== command.params.arguments.length || row[3] !== command.params.returnByValue) { throw new Error("SCH_MODIFY_RETURN_FIXED_CALL"); } }
 return freezeDeep(command);
}
const beforeReads = 48; const introducedReads = 32; const cancelledReads = 24; const websocketReads = 24; const websocketReturnReads = 16; const remoteReturnReads = 16; const batchReturnReads = 24; const handlerReturnReads = 24; const timerEntryReads = 40;
const parentBeforeReads=2;
const reads = parentBeforeReads + beforeReads + introducedReads + cancelledReads + websocketReads + websocketReturnReads + remoteReturnReads + batchReturnReads + handlerReturnReads + timerEntryReads;
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_RETURN_REQUESTS = Object.freeze({ reads, helpers: reads, total: reads * 2, parentBeforeReads, beforeReads, introducedReads, cancelledReads, websocketReads, websocketReturnReads, remoteReturnReads, batchReturnReads, handlerReturnReads, timerEntryReads, controls: 0 } as const);
