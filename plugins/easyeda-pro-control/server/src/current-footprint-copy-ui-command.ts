/** Private fixed parent commands for the copy UI owner. Native dispatch is not
 * registered by this module; a copy-purpose channel must enforce this grammar
 * and its own reservation before it can mount the runner. */
import { z } from "zod";
import { CURRENT_FOOTPRINT_COPY_UI_CALLS as CALLS } from "./current-footprint-copy-ui-bindings.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const session = handle.max(128);
const value = z.object({ value: z.string().min(1).max(128) }).strict();
const object = z.object({ objectId: handle }).strict();
const path = z.object({ value: z.string().regex(/^[a-f\d]{64}$/u) }).strict();
const branch = z.object({ value: z.string().regex(/^[a-f\d]{32}$/u) }).strict();
const tab = z.object({ value: z.string().regex(/^[A-Za-z\d_-]{1,128}$/u) }).strict();
export const CURRENT_FOOTPRINT_COPY_UI_GROUP = "easyeda-pro-control-footprint-copy-ui-v1";
const flags = { objectGroup: z.literal(CURRENT_FOOTPRINT_COPY_UI_GROUP), silent: z.literal(true),
  generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const call = (name: keyof typeof CALLS, args: z.ZodType): z.ZodType =>
  z.object({ phase: z.literal(name), method: z.literal("Runtime.callFunctionOn"), sessionId: session,
    params: z.object({ ...flags, objectId: handle, functionDeclaration: z.literal(CALLS[name].program),
      arguments: args, returnByValue: z.literal(CALLS[name].returnByValue) }).strict() }).strict();
/* oxlint-disable unicorn/max-nested-calls -- Keep each strict fixed CDP envelope together so phase/program/argument relations are reviewable. */
const schema = z.union([
  z.object({ phase: z.literal("initial"), method: z.literal("Runtime.callFunctionOn"), sessionId: session,
    params: z.object({ ...flags, uniqueContextId: session, functionDeclaration: z.literal(CALLS.initial.program),
      arguments: z.tuple([path, branch, tab]), returnByValue: z.literal(false) }).strict() }).strict(),
  call("notificationRecheck", z.tuple([object, path, branch, tab])),
  call("responder", z.tuple([object])), call("responderRecheck", z.tuple([object, object])),
  call("route", z.tuple([object, path, branch, tab])),
  call("registry", z.tuple([object, path, branch, tab])),
  call("registryContextProducer", z.tuple([object, object, object, path, branch, tab])),
  call("registryRecheck", z.tuple([object, object, object, object, path, branch, tab])),
  call("membership", z.tuple([object, path, branch, tab, object, object])),
  call("routeRecheck", z.tuple([object, path, branch, tab, object, object])),
  z.object({ phase: z.literal("registrySource"), method: z.literal("Debugger.getScriptSource"), sessionId: session, params: z.object({ scriptId: handle }).strict() }).strict(),
  z.object({ phase: z.literal("properties"), method: z.literal("Runtime.getProperties"), sessionId: session,
    params: z.object({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false),
      generatePreview: z.literal(false) }).strict() }).strict(),
  z.object({ phase: z.literal("release"), method: z.literal("Runtime.releaseObjectGroup"), sessionId: session,
    params: z.object({ objectGroup: z.literal(CURRENT_FOOTPRINT_COPY_UI_GROUP) }).strict() }).strict(),
]);
/* oxlint-enable unicorn/max-nested-calls */
type Argument = Readonly<z.infer<typeof object> | z.infer<typeof value>>;
type Flags = Readonly<{ objectGroup: typeof CURRENT_FOOTPRINT_COPY_UI_GROUP; silent: true; generatePreview: false;
  throwOnSideEffect: true; awaitPromise: false; userGesture: false }>;
export type CurrentFootprintCopyUiCommand = Readonly<{ sessionId: string }> & (
  | Readonly<{ phase: Exclude<keyof typeof CALLS, "notification">; method: "Runtime.callFunctionOn";
    params: Flags & Readonly<{ functionDeclaration: string; arguments: readonly Argument[]; returnByValue: boolean }> &
      (Readonly<{ objectId: string }> | Readonly<{ uniqueContextId: string }>) }>
  | Readonly<{ phase: "properties"; method: "Runtime.getProperties"; params: Readonly<{
    objectId: string; ownProperties: true; accessorPropertiesOnly: false; generatePreview: false }> }>
  | Readonly<{ phase: "registrySource"; method: "Debugger.getScriptSource"; params: Readonly<{ scriptId: string }> }>
  | Readonly<{ phase: "release"; method: "Runtime.releaseObjectGroup"; params: Readonly<{ objectGroup: typeof CURRENT_FOOTPRINT_COPY_UI_GROUP }> }>
);
export const CURRENT_FOOTPRINT_COPY_UI_FLAGS: Flags = Object.freeze({ objectGroup: CURRENT_FOOTPRINT_COPY_UI_GROUP,
  silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false });

/** The phase fixes both program and argument layout. No notification callback,
 * SDK responder, dynamic property name or caller program can pass this gate. */
export function validateCurrentFootprintCopyUiCommand(input: unknown): CurrentFootprintCopyUiCommand {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The strict discriminated schemas above validate every command field; the helper's generic schema return erases only its inferred union.
  return freezeDeep(schema.parse(captureCurrentPcbStringClockReply(input).value)) as CurrentFootprintCopyUiCommand;
}
