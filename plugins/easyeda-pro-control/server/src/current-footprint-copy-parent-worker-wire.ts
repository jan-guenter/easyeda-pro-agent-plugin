/** Both the TypeScript channel and native helper select these exact programs.
 * This is diagnostic instrumentation; only its fixed install/send/remove phases
 * permit side effects, and none is a vendor method or arbitrary expression. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_FOOTPRINT_COPY_PARENT_WORKER_GROUP as GROUP, CURRENT_FOOTPRINT_COPY_PARENT_WORKER_PROGRAMS as PROGRAMS } from "./current-footprint-copy-parent-worker-programs.ts";
import type { CurrentFootprintParentWorkerCommand as Command } from "./current-footprint-copy-parent-worker-contract.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const nonce = z.object({ value: z.string().regex(/^[a-f\d]{64}$/u) }).strict();
const object = z.object({ objectId: token }).strict();
const argument = z.union([nonce, object]);
const parameters = z.object({ objectId: token.optional(), uniqueContextId: token.optional(), functionDeclaration: z.string().max(8192),
  arguments: z.array(argument).max(2), objectGroup: z.literal(GROUP), returnByValue: z.boolean(), awaitPromise: z.boolean(),
  silent: z.literal(true), generatePreview: z.literal(false), userGesture: z.literal(false), throwOnSideEffect: z.boolean() }).strict();
const call = z.object({ phase: z.enum(["parentSelect", "parentSend", "parentRecheck", "managerJoin", "childSelect", "childInstall", "childReceipt", "childRecheck", "childDispose"]),
  method: z.literal("Runtime.callFunctionOn"), sessionId: token, params: parameters,
}).strict().superRefine((command, context) => {
  const { phase, params } = command;
  const select = phase === "parentSelect" || phase === "childSelect";
  const readonly = select || phase === "parentRecheck" || phase === "childRecheck" || phase === "managerJoin";
  const contextSelection = phase === "childSelect" ? params.objectId === undefined && params.uniqueContextId !== undefined : params.objectId !== undefined && params.uniqueContextId === undefined;
  let args = params.arguments.length === 1 && nonce.safeParse(params.arguments[0]).success;
  if (select) { args = params.arguments.length === 0; }
  else if (phase === "managerJoin") { args = params.arguments.length === 2 && object.safeParse(params.arguments[0]).success && nonce.safeParse(params.arguments[1]).success; }
  if (params.functionDeclaration !== PROGRAMS[phase] || params.returnByValue !== !select || params.awaitPromise !== (phase === "childReceipt") ||
    params.throwOnSideEffect !== readonly || !contextSelection || !args) { context.addIssue({ code: "custom", message: "Private peer command differs from its fixed phase." }); }
});
const propertyParameters = z.object({ objectId: token, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }).strict();
const releaseParameters = z.object({ objectGroup: z.literal(GROUP) }).strict();
const properties = z.object({ phase: z.literal("properties"), method: z.literal("Runtime.getProperties"), sessionId: token, params: propertyParameters }).strict();
const release = z.object({ phase: z.literal("release"), method: z.literal("Runtime.releaseObjectGroup"), sessionId: token, params: releaseParameters }).strict();
const schema = z.union([call, properties, release]);
export function validateCurrentFootprintParentWorkerCommand(value: unknown): Command {
  const parsed = schema.parse(captureCurrentPcbStringClockReply(value).value);
  if (parsed.method === "Runtime.callFunctionOn") {
    const { objectId, uniqueContextId, ...rest } = parsed.params;
    const selection = objectId === undefined ? { uniqueContextId: token.parse(uniqueContextId) } : { objectId };
    return freezeDeep({ ...parsed, params: { ...rest, ...selection, functionDeclaration: PROGRAMS[parsed.phase] } });
  }
  return freezeDeep(parsed);
}
