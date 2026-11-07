/** Exact metadata of the original generated callback, with no invocation. */
import { z } from "zod";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_ACTION_CALLBACK, CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_FUNCTION } from "./current-schematic-relevance-display-action-programs.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { captureCurrentSchematicDisplayAccessorSource } from "./current-schematic-display-accessor-replies.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_CALLBACK_SOURCE = CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_ACTION_CALLBACK;
export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_CALLBACK_SCRIPT = `(${CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_FUNCTION})`;
const callbackStart = CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_CALLBACK_SCRIPT.indexOf(CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_CALLBACK_SOURCE);
const before = CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_CALLBACK_SCRIPT.slice(0, callbackStart);
const callbackColumn = before.length - before.lastIndexOf("\n") - 1, callbackLine = before.split("\n").length - 1;
export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_CALLBACK_LOCATION = Object.freeze({ lineNumber: callbackLine, columnNumber: callbackColumn });
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.strictObject({ type: z.enum(["object", "function", "string", "number"]), subtype: z.string().optional(), className: z.string().optional(), objectId: handle.optional(), value: z.unknown().optional(), description: z.string().optional() });
const field = z.strictObject({ name: z.string(), value: remote, writable: z.literal(false), configurable: z.literal(true), enumerable: z.literal(false), isOwn: z.literal(true) });
const internal = z.strictObject({ name: z.string(), value: remote });
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_MODIFY_ENTRY_ORIGINAL_CALLBACK"); } }
export function decodeCurrentSchematicRelevanceDisplayModifyEntryTuple(input: unknown): string {
  const fields = decodeCurrentFootprintCopyClockRpcV2Array(input, 3); const callback = fields.get("1"), options = fields.get("2"), runner = fields.get("0");
  need(runner?.type === "object" && runner.objectId !== undefined && runner.subtype === undefined && callback?.type === "function" && callback.className === "AsyncFunction" && callback.objectId !== undefined && callback.description === CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_CALLBACK_SOURCE && options?.type === "object" && options.subtype === undefined && options.className === "Object" && options.objectId !== undefined);
  return callback.objectId;
}
export function decodeCurrentSchematicRelevanceDisplayModifyEntryCallback(input: unknown): string {
  const reply = z.strictObject({ result: z.array(field).length(2), internalProperties: z.array(internal).length(3) }).parse(captureCurrentPcbStringClockReply(input).value);
  const fields = new Map(reply.result.map(item => [item.name, item.value])), internals = new Map(reply.internalProperties.map(item => [item.name, item.value]));
  need(fields.size === 2 && fields.get("name")?.type === "string" && fields.get("name")?.value === "" && fields.get("length")?.type === "number" && fields.get("length")?.value === 0 && internals.size === 3);
  const location = internals.get("[[FunctionLocation]]"), parent = internals.get("[[Prototype]]"), scopes = internals.get("[[Scopes]]");
  need(location?.type === "object" && location.subtype === "internal#location" && location.objectId === undefined && parent?.type === "object" && parent.className === "AsyncFunction" && parent.objectId !== undefined && scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.objectId !== undefined && /^Scopes\[(?:[1-9]|1[0-6])\]$/u.test(scopes.description ?? ""));
  const point = z.strictObject({ scriptId: handle, lineNumber: z.literal(callbackLine), columnNumber: z.literal(callbackColumn) }).parse(location.value); return point.scriptId;
}
export function requireCurrentSchematicRelevanceDisplayModifyCallbackSource(input: unknown): void { need(captureCurrentSchematicDisplayAccessorSource(input).scriptSource === CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_CALLBACK_SCRIPT); }
