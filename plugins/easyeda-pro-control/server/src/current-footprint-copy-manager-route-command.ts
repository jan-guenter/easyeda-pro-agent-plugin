/** Fixed parent commands for the manager's initialized footprint read route. */
import { z } from "zod";
import { CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_CALLS as CALLS } from "./current-footprint-copy-manager-route-bindings.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u), object = z.object({ objectId: handle }).strict();
const path = z.object({ value: z.string().regex(/^[a-f\d]{64}$/u) }).strict();
const branch = z.object({ value: z.string().regex(/^[a-f\d]{32}$/u) }).strict(), tab = z.object({ value: z.string().regex(/^[A-Za-z\d_-]{1,128}$/u) }).strict();
export const CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_GROUP = "easyeda-pro-control-footprint-copy-manager-route-v1";
export const CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_FLAGS = Object.freeze({ objectGroup: CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_GROUP,
  silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
const flags = { objectGroup: z.literal(CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const call = (phase: keyof typeof CALLS, args: z.ZodType): z.ZodType => z.object({ phase: z.literal(phase), method: z.literal("Runtime.callFunctionOn"), sessionId: handle.max(128),
  params: z.object({ ...flags, objectId: handle, functionDeclaration: z.literal(CALLS[phase].program), arguments: args, returnByValue: z.literal(CALLS[phase].returnByValue) }).strict() }).strict();
/* oxlint-disable unicorn/max-nested-calls -- Strict envelopes keep fixed phase, program and positional arguments reviewable together. */
const schema = z.union([
  call("initial", z.tuple([path, branch, tab])), call("serviceUi", z.tuple([])), call("serviceManager", z.tuple([])), call("handler", z.tuple([])),
  call("registry", z.tuple([object, path, branch, tab])), call("project", z.tuple([object, object, path, branch, tab])),
  call("recheckUi", z.tuple([object, object, object, object, object, object, object, path, branch, tab])),
  call("recheckManager", z.tuple([object, object, object, object, object, object, object, path, branch, tab])),
  z.object({ phase: z.literal("properties"), method: z.literal("Runtime.getProperties"), sessionId: handle.max(128), params: z.object({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }).strict() }).strict(),
  z.object({ phase: z.literal("source"), method: z.literal("Debugger.getScriptSource"), sessionId: handle.max(128), params: z.object({ scriptId: handle }).strict() }).strict(),
  z.object({ phase: z.literal("release"), method: z.literal("Runtime.releaseObjectGroup"), sessionId: handle.max(128), params: z.object({ objectGroup: z.literal(CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_GROUP) }).strict() }).strict(),
]);
/* oxlint-enable unicorn/max-nested-calls */
type Flags = typeof CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_FLAGS;
export type CurrentFootprintCopyManagerRouteCommand = Readonly<{ sessionId: string }> & (
  | Readonly<{ phase: keyof typeof CALLS; method: "Runtime.callFunctionOn"; params: Flags & Readonly<{ objectId: string; functionDeclaration: string; arguments: readonly Readonly<{ value: string } | { objectId: string }>[]; returnByValue: boolean }> }>
  | Readonly<{ phase: "properties"; method: "Runtime.getProperties"; params: Readonly<{ objectId: string; ownProperties: true; accessorPropertiesOnly: false; generatePreview: false }> }>
  | Readonly<{ phase: "source"; method: "Debugger.getScriptSource"; params: Readonly<{ scriptId: string }> }>
  | Readonly<{ phase: "release"; method: "Runtime.releaseObjectGroup"; params: Readonly<{ objectGroup: typeof CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_GROUP }> }>
);
export function validateCurrentFootprintCopyManagerRouteCommand(input: unknown): CurrentFootprintCopyManagerRouteCommand {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The exact union validates every field; the generic call helper erases only its inferred union.
  return freezeDeep(schema.parse(captureCurrentPcbStringClockReply(input).value)) as CurrentFootprintCopyManagerRouteCommand;
}
