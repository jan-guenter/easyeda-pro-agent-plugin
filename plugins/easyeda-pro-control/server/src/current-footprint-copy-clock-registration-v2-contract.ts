/** Unmounted closed v2 vocabulary. Every program, method, flag and argument
 * position is fixed; no caller program or replacement source role is accepted. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_CALLS as CALLS,
  CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_GROUP as GROUP } from "./current-footprint-copy-clock-registration-v2-programs.ts";
import type { CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_FLAGS as FLAGS } from "./current-footprint-copy-clock-registration-v2-programs.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_SOURCE as SOURCE,
  assertCurrentFootprintCopyClockRegistrationV2Function } from "./current-footprint-copy-clock-registration-v2-source.ts";
import type { CurrentFootprintCopyClockRegistrationV2Role as Role } from "./current-footprint-copy-clock-registration-v2-source.ts";

const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u), object = z.object({ objectId: handle }).strict();
const branch = z.object({ value: z.string().regex(/^[a-f\d]{32}$/u) }).strict(), path = z.object({ value: z.string().regex(/^[a-f\d]{64}$/u) }).strict(), tab = z.object({ value: z.string().regex(/^[A-Za-z\d_-]{1,128}$/u) }).strict();
const flags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false),
  throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const call = (phase: keyof typeof CALLS, args: z.ZodType): z.ZodType => z.object({ phase: z.literal(phase), method: z.literal("Runtime.callFunctionOn"), sessionId: handle.max(128),
  params: z.object({ ...flags, objectId: handle, functionDeclaration: z.literal(CALLS[phase].program), arguments: args, returnByValue: z.literal(CALLS[phase].returnByValue) }).strict() }).strict();
/* oxlint-disable unicorn/max-nested-calls -- Each fixed selector retains its exact positional argument roster at this closed boundary. */
const commandSchema = z.union([
  call("initial", z.tuple([path, branch, tab])), call("callback", z.tuple([])),
  call("bindings", z.tuple([object, object, object, path, branch, tab])), call("sample", z.tuple([object, object, object, object, path, branch, tab])),
  z.object({ phase: z.literal("properties"), method: z.literal("Runtime.getProperties"), sessionId: handle.max(128), params: z.object({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }).strict() }).strict(),
  ...["wrapper-source", "callback-source"].map(phase => z.object({ phase: z.literal(phase), method: z.literal("Debugger.getScriptSource"), sessionId: handle.max(128), params: z.object({ scriptId: handle }).strict() }).strict()),
  z.object({ phase: z.literal("release"), method: z.literal("Runtime.releaseObjectGroup"), sessionId: handle.max(128), params: z.object({ objectGroup: z.literal(GROUP) }).strict() }).strict(),
]);
/* oxlint-enable unicorn/max-nested-calls */
export type CurrentFootprintCopyClockRegistrationV2Command = Readonly<{ sessionId: string }> & (
  | Readonly<{ phase: keyof typeof CALLS; method: "Runtime.callFunctionOn"; params: typeof FLAGS & Readonly<{ objectId: string; functionDeclaration: string; arguments: readonly Readonly<{ value: string } | { objectId: string }>[]; returnByValue: boolean }> }>
  | Readonly<{ phase: "properties"; method: "Runtime.getProperties"; params: Readonly<{ objectId: string; ownProperties: true; accessorPropertiesOnly: false; generatePreview: false }> }>
  | Readonly<{ phase: "wrapper-source" | "callback-source"; method: "Debugger.getScriptSource"; params: Readonly<{ scriptId: string }> }>
  | Readonly<{ phase: "release"; method: "Runtime.releaseObjectGroup"; params: Readonly<{ objectGroup: typeof GROUP }> }>
);
export function validateCurrentFootprintCopyClockRegistrationV2Command(input: unknown): CurrentFootprintCopyClockRegistrationV2Command {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The finite schema fixes every method, literal program, flag, source role and positional argument.
  return freezeDeep(commandSchema.parse(captureCurrentPcbStringClockReply(input).value)) as CurrentFootprintCopyClockRegistrationV2Command;
}

const point = z.object({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict(), text = z.string().max(8192);
const remote = z.object({ type: z.enum(["object", "function", "string", "number"]), subtype: text.optional(), className: text.optional(), description: text.optional(), objectId: handle.optional(), value: z.union([z.null(), text, z.number(), point]).optional() }).strict();
const internal = z.object({ name: text, value: remote }).strict(), property = z.object({ name: text, value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) }).strict();
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_CLOCK_REGISTRATION_V2_METADATA"); } }
/** Match the selected copy's exact location, not only its duplicate description. */
export function decodeCurrentFootprintCopyClockRegistrationV2Function(input: unknown, role: Role,
  expectedScriptId?: string): Readonly<{ scriptId: string; scopesId: string }> {
  const expected = SOURCE[role].function, reply = z.object({ result: z.array(property).length(2), internalProperties: z.array(internal).length(3) }).strict().parse(captureCurrentPcbStringClockReply(input).value);
  const fields = new Map(reply.result.map(item => [item.name, item])); need(fields.size === 2);
  for (const key of ["name", "length"] as const) { const field = fields.get(key); need(field !== undefined && !field.writable && !field.enumerable && field.configurable && field.value.type === (key === "name" ? "string" : "number") && field.value.value === (key === "name" ? expected.name : expected.arity) && field.value.objectId === undefined && !Object.is(field.value.value, -0)); }
  const entries = new Map(reply.internalProperties.map(item => [item.name, item.value])), location = entries.get("[[FunctionLocation]]"), parent = entries.get("[[Prototype]]"), position = point.parse(location?.value), scopes = entries.get("[[Scopes]]");
  need(entries.size === 3 && location?.type === "object" && location.subtype === "internal#location" && location.objectId === undefined &&
    (expectedScriptId === undefined || position.scriptId === expectedScriptId) && position.lineNumber === expected.lineNumber && position.columnNumber === expected.columnNumber &&
    parent?.type === "function" && parent.className === "Function" && parent.objectId !== undefined && parent.value === undefined &&
    scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.objectId !== undefined && scopes.value === undefined && /^Scopes\[[1-8]\]$/u.test(scopes.description ?? ""));
  return Object.freeze({ scriptId: position.scriptId, scopesId: scopes.objectId });
}
export function decodeCurrentFootprintCopyClockRegistrationV2Array(input: unknown, phase: "initial" | "bindings"): readonly string[] {
  const count = phase === "initial" ? 10 : 4, reply = z.object({ result: z.array(property).length(count + 1), internalProperties: z.array(internal).length(1) }).strict().parse(captureCurrentPcbStringClockReply(input).value);
  const fields = new Map(reply.result.map(item => [item.name, item])); need(fields.size === count + 1); const length = fields.get("length"), parent = reply.internalProperties[0];
  need(length?.value.type === "number" && length.value.value === count && length.value.objectId === undefined && length.writable && !length.enumerable && !length.configurable && parent?.name === "[[Prototype]]" && parent.value.type === "object" && parent.value.subtype === "array" && parent.value.className === "Array" && parent.value.objectId !== undefined && parent.value.value === undefined);
  return Object.freeze(Array.from({ length: count }, (_, index) => {
    const field = fields.get(String(index)); need(field !== undefined && field.writable && field.enumerable && field.configurable && field.value.objectId !== undefined && field.value.value === undefined && field.value.subtype !== "proxy");
    let role: Role | null = null;
    if (phase === "initial" && index === 4) { role = "wrapper"; }
    else if (phase === "bindings" && index === 0) { role = "callback"; }
    if (role !== null) { need(field.value.type === "function" && field.value.className === "Function" && field.value.subtype === undefined); assertCurrentFootprintCopyClockRegistrationV2Function(role, field.value.description); }
    else if (phase === "initial" && index === 8 || phase === "bindings" && (index === 2 || index === 3)) { need(field.value.type === "function" && field.value.className === "Function" && field.value.subtype === undefined); }
    else { need(field.value.type === "object"); }
    if (phase === "initial" && index === 7) { need(field.value.className === "BroadcastChannel" && field.value.subtype === undefined); }
    return field.value.objectId;
  }));
}
