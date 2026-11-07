/* oxlint-disable unicorn/max-nested-calls -- The finite schema mirrors exact nested CDP arguments and validates every field. */
/** Finite changed-head observation vocabulary. Actual original held events,
 * replay receivers and every continuation remain the native owner's custody. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_PCB_VIA_POST_HISTORY_SYNC_CALLER as CALLER, CURRENT_PCB_VIA_POST_HISTORY_SYNC_MODULE as MODULE } from "./current-pcb-via-post-history-sync-source.ts";
import { CURRENT_PCB_VIA_POST_HISTORY_SYNC_PROGRAMS as PROGRAMS } from "./current-pcb-via-post-history-sync-programs.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_CACHE_PROMISE_CAPTURE as RETAIN } from "./current-project-save-producer-cache-replies.ts";

export const CURRENT_PCB_VIA_POST_HISTORY_SYNC_REQUESTS = Object.freeze({ entry: 18, full: 3, branch: 4, history: 5, merged: 3, finalizing: 27, returned: 5, settlementRetry: 2, total: 67, events: 7, graphObjects: 24 });
export const CURRENT_PCB_VIA_POST_HISTORY_SYNC_FLAGS = Object.freeze({ objectGroup: "easyeda-via-post-history-sync209-v1", silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
const flags = { objectGroup: z.literal(CURRENT_PCB_VIA_POST_HISTORY_SYNC_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), ref = z.strictObject({ objectId: handle });
const text = z.strictObject({ value: z.string().min(1).max(8192).refine(value => value.isWellFormed() && Buffer.byteLength(value) <= 8192) });
const roles = ["syncEntry", "syncFull", "syncLast", "syncHistory", "syncMerged", "syncFinalizing", "syncReturned"] as const;
const propertyRoles = ["capture", "callee", "module", "full", "frame", "reply", "result", "graph", "task", "outer"] as const;
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("via-post-sync-frame"), role: z.enum(["module", "caller"]), method: z.literal("Debugger.evaluateOnCallFrame"), params: z.strictObject({ objectGroup: flags.objectGroup, silent: flags.silent, generatePreview: flags.generatePreview, throwOnSideEffect: flags.throwOnSideEffect, includeCommandLineAPI: z.literal(false), returnByValue: z.literal(false), callFrameId: handle, expression: z.enum([MODULE, CALLER.expression]) }) }),
  z.strictObject({ phase: z.literal("via-post-sync-call"), role: z.enum(["capture", "full", "branch", "history", "merged", "index", "finalizing", "returned", "retain"]), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, returnByValue: z.boolean(), functionDeclaration: z.string().min(1).max(32_768), arguments: z.array(z.union([ref, text])).max(7) }) }),
  z.strictObject({ phase: z.literal("via-post-sync-properties"), role: z.enum(propertyRoles), slot: z.number().int().min(0).max(23), method: z.literal("Runtime.getProperties"), params: z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }) }),
  // The owner substitutes all three original receivers and the fixed Root replay program.
  z.strictObject({ phase: z.literal("via-post-sync-replay") }),
  z.strictObject({ phase: z.literal("via-post-sync-resume"), role: z.enum(roles), method: z.literal("Debugger.resume"), params: z.strictObject({}) }),
]);
export type CurrentPcbViaPostHistorySyncCommand = z.infer<typeof schema>;
const counts = Object.freeze({ capture: 6, full: 1, branch: 5, history: 7, merged: 3, index: 2, finalizing: 3, returned: 3, retain: 0 });
export function validateCurrentPcbViaPostHistorySyncCommand(input: unknown): CurrentPcbViaPostHistorySyncCommand {
  const command = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.phase === "via-post-sync-frame" && command.params.expression !== (command.role === "module" ? MODULE : CALLER.expression)) { throw new Error("PCB_VIA_POST_SYNC_FRAME"); }
  if (command.phase === "via-post-sync-call") {
    const program = command.role === "retain" ? RETAIN : PROGRAMS[command.role]; const args = command.params.arguments;
    if (command.params.functionDeclaration !== program || args.length !== counts[command.role] || command.params.returnByValue !== !["capture", "index", "retain"].includes(command.role)) { throw new Error("PCB_VIA_POST_SYNC_CALL"); }
    for (let index = 0; index < args.length; index += 1) { let isText = command.role === "history" && index === 6; if (command.role === "capture") { isText = index >= 4; } else if (command.role === "branch") { isText = index === 4; }
      if (Object.hasOwn(args[index] ?? {}, "value") !== isText) { throw new Error("PCB_VIA_POST_SYNC_ARGUMENT"); }
    }
  }
  if (command.phase === "via-post-sync-properties" && (command.role === "callee" ? command.slot > 11 : command.role !== "graph" && command.slot !== 0)) { throw new Error("PCB_VIA_POST_SYNC_PROPERTY_SLOT"); }
  return freezeDeep(command);
}
export function currentPcbViaPostHistorySyncNativeCases(): readonly CurrentPcbViaPostHistorySyncCommand[] {
  const cases: unknown[] = [];
  for (const role of ["module", "caller"] as const) { cases.push({ phase: "via-post-sync-frame", role, method: "Debugger.evaluateOnCallFrame", params: { objectGroup: CURRENT_PCB_VIA_POST_HISTORY_SYNC_FLAGS.objectGroup, silent: true, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false, returnByValue: false, callFrameId: "original_frame", expression: role === "module" ? MODULE : CALLER.expression } }); }
  for (const role of ["capture", "full", "branch", "history", "merged", "index", "finalizing", "returned", "retain"] as const) { cases.push({ phase: "via-post-sync-call", role, method: "Runtime.callFunctionOn", params: { ...CURRENT_PCB_VIA_POST_HISTORY_SYNC_FLAGS, objectId: "original_frame", returnByValue: !["capture", "index", "retain"].includes(role), functionDeclaration: role === "retain" ? RETAIN : PROGRAMS[role], arguments: Array.from({ length: counts[role] }, (_, index) => role === "capture" && index >= 4 || role === "branch" && index === 4 || role === "history" && index === 6 ? { value: index === 4 && role === "capture" ? "a".repeat(32) : "original_private_body" } : { objectId: "original_argument" }) } }); }
  for (const role of propertyRoles) { let count = 1; if (role === "callee") { count = 12; } else if (role === "graph") { count = 24; }
    for (let slot = 0; slot < count; slot += 1) { cases.push({ phase: "via-post-sync-properties", role, slot, method: "Runtime.getProperties", params: { objectId: "original_object", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
  }
  cases.push({ phase: "via-post-sync-replay" });
  for (const role of roles) { cases.push({ phase: "via-post-sync-resume", role, method: "Debugger.resume", params: {} }); }
  return freezeDeep(cases.map(input => validateCurrentPcbViaPostHistorySyncCommand(input)));
}
