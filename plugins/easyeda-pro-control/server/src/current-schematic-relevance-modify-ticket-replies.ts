/** Source/native metadata only. An original Core owner must independently
 * bind the actual worker, receiver, returned timer and once-only cancellation. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentGeneratedSyncCallee } from "./current-generated-initial-sync-replies.ts";
import { decodeCurrentNativeFunctionMetadata } from "./current-native-function-metadata.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_TICKET_SOURCE as SOURCE } from "./current-schematic-relevance-modify-ticket-source.ts";
import type { CurrentSchematicRelevanceModifyTicketRole } from "./current-schematic-relevance-modify-ticket-source.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.looseObject({ type: z.string(), subtype: z.string().optional(), className: z.string().optional(), description: z.string().optional(), objectId: handle.optional(), value: z.unknown().optional() });
const internal = z.strictObject({ name: z.string(), value: remote });
const packet = z.looseObject({ internalProperties: z.array(internal).min(2).max(3) });
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_TICKET_NATIVE = Object.freeze({
  setTimeout: Object.freeze({ name: "setTimeout", arity: 1, constructor: false }),
  clearTimeout: Object.freeze({ name: "clearTimeout", arity: 0, constructor: false }),
} as const);
export interface CurrentSchematicRelevanceModifyTicketMetadata {
  readonly functionPrototypeObjectId: string;
  readonly scopesObjectId: string;
  readonly originalReceiverVerified: false;
  readonly nativeTimerOwnershipVerified: false;
  readonly cancellationAuthorized: false;
  readonly workerCompleted: false;
  readonly modifyCompleted: false;
  readonly saveAuthorized: false;
}
/** Reject missing source/native metadata without turning a descriptive handle into authority. */
function need(value: boolean): asserts value { if (!value) { throw new Error("SCH_MODIFY_TICKET_METADATA"); } }
/** Retain only the prototype and scope handles after the strict callee decoder succeeds. */
function retained(input: unknown): CurrentSchematicRelevanceModifyTicketMetadata {
  const parsed = packet.parse(input);
  const parent = parsed.internalProperties.find(value => value.name === "[[Prototype]]")?.value;
  const scopes = parsed.internalProperties.find(value => value.name === "[[Scopes]]")?.value;
  need(parent?.objectId !== undefined && scopes?.objectId !== undefined);
  return Object.freeze({ functionPrototypeObjectId: parent.objectId, scopesObjectId: scopes.objectId, originalReceiverVerified: false,
    nativeTimerOwnershipVerified: false, cancellationAuthorized: false, workerCompleted: false, modifyCompleted: false, saveAuthorized: false });
}
/** Match the complete original method/arrow description and actual V8
 * function location. Hidden lexical this remains unproved by scope metadata. */
export function decodeCurrentSchematicRelevanceModifyTicketCallee(input: unknown, actualInput: unknown, role: CurrentSchematicRelevanceModifyTicketRole, scriptId: string): CurrentSchematicRelevanceModifyTicketMetadata {
  const actual = remote.parse(captureCurrentPcbStringClockReply(actualInput).value), expected = SOURCE[role], value = captureCurrentPcbStringClockReply(input).value;
  need(actual.type === "function" && actual.className === "Function" && actual.subtype === undefined && actual.objectId !== undefined && actual.description === expected.source);
  decodeCurrentGeneratedSyncCallee(value, { name: expected.name, arity: expected.arity, async: false, regular: false,
    lineNumber: expected.functionLineNumber, columnNumber: expected.functionColumnNumber }, scriptId);
  return retained(value);
}
/** Qualify only the selected browser-native timer function's shape. Realm,
 * descriptor-owner identity and the retained actual timer require other proofs. */
export function decodeCurrentSchematicRelevanceModifyTicketNative(input: unknown, actualInput: unknown, role: keyof typeof CURRENT_SCHEMATIC_RELEVANCE_MODIFY_TICKET_NATIVE): CurrentSchematicRelevanceModifyTicketMetadata {
  const actual = remote.parse(captureCurrentPcbStringClockReply(actualInput).value), expected = CURRENT_SCHEMATIC_RELEVANCE_MODIFY_TICKET_NATIVE[role], value = captureCurrentPcbStringClockReply(input).value;
  need(actual.type === "function" && actual.className === "Function" && actual.subtype === undefined && actual.objectId !== undefined && actual.description === `function ${expected.name}() { [native code] }`);
  decodeCurrentNativeFunctionMetadata(value, expected); return retained(value);
}
