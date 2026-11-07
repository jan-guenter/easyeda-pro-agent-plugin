/** Finite original-worker Save observation grammar. No caller code, condition,
 * topic, SQL, realm selector or application invocation is represented. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PCB_VIA_SAVE_CALLS as CALLS, CURRENT_PCB_VIA_SAVE_GROUP as GROUP } from "./current-pcb-via-save-programs.ts";
import { CURRENT_PCB_VIA_SAVE_SITES as SITES } from "./current-pcb-via-save-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u), object = z.strictObject({ objectId: handle });
export const CURRENT_PCB_VIA_SAVE_FRAME_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true, returnByValue: false,
  generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } as const);
export const CURRENT_PCB_VIA_SAVE_CALL_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true, generatePreview: false,
  throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
const frameFlags = { objectGroup: z.literal(GROUP), silent: z.literal(true), returnByValue: z.literal(false), generatePreview: z.literal(false),
  throwOnSideEffect: z.literal(true), includeCommandLineAPI: z.literal(false) };
const callFlags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false),
  throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const roles = ["noData", "entry", "clock", "compress", "body", "result"] as const;
const argumentFor = { entry: z.tuple([z.strictObject({ value: z.string().regex(/^[a-f\d]{32}$/u) }), z.strictObject({ value: z.string().regex(/^[a-f\d]{64}$/u) })]),
  clock: z.tuple([object, object]), compress: z.tuple([object, object]), body: z.tuple([object, object]), result: z.tuple([object, object]), value: z.tuple([object]) };
const calls = (["entry", "clock", "compress", "body", "result", "value"] as const).map(role => z.strictObject({ phase: z.literal(`via-save-${role}`),
  method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...callFlags, objectId: handle, functionDeclaration: z.literal(CALLS[role]),
    arguments: argumentFor[role], returnByValue: z.literal(role === "value") }) }));
const point = z.strictObject({ scriptId: handle, lineNumber: z.literal(110), columnNumber: z.number().int().positive() });
const expressions = z.enum(roles.map(role => SITES[role].expression));
const extras = [
  z.strictObject({ phase: z.literal("via-save-source"), method: z.literal("Debugger.getScriptSource"), params: z.strictObject({ scriptId: handle }) }),
  z.strictObject({ phase: z.literal("via-save-arm"), role: z.enum(roles), method: z.literal("Debugger.setBreakpoint"), params: z.strictObject({
    location: point }) }),
  z.strictObject({ phase: z.literal("via-save-frame"), role: z.enum(roles), method: z.literal("Debugger.evaluateOnCallFrame"), params: z.strictObject({
    ...frameFlags, callFrameId: handle, expression: expressions }) }),
  z.strictObject({ phase: z.literal("via-save-properties"), method: z.literal("Runtime.getProperties"), params: z.strictObject({ objectId: handle,
    ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }) }),
  z.strictObject({ phase: z.literal("via-save-remove"), method: z.literal("Debugger.removeBreakpoint"), params: z.strictObject({ breakpointId: handle }) }),
  z.strictObject({ phase: z.literal("via-save-resume"), method: z.literal("Debugger.resume"), params: z.strictObject({}) }),
  z.strictObject({ phase: z.literal("via-save-release"), method: z.literal("Runtime.releaseObjectGroup"), params: z.strictObject({ objectGroup: z.literal(GROUP) }) }),
 ];
const commands = z.union([...calls, ...extras]);
export type CurrentPcbViaSaveCommand = z.infer<typeof commands>;
export function validateCurrentPcbViaSaveCommand(input: unknown): CurrentPcbViaSaveCommand {
  const command = commands.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.phase === "via-save-arm" && command.params.location.columnNumber !== SITES[command.role].columnNumber ||
      command.phase === "via-save-frame" && command.params.expression !== SITES[command.role].expression) { throw new Error("PCB_VIA_SAVE_FIXED_SITE"); }
  return freezeDeep(command);
}
/** One source, six arms, five frame/join/property triples, six original method
 * metadata reads, one body value and two reserved reproof reads. Each normal
 * pause has one cleanup resume; all six breakpoints plus the group are released. */
export const CURRENT_PCB_VIA_SAVE_REQUESTS = Object.freeze({ normal: 1 + 6 + 5 * 3 + 6 + 1 + 2, cleanup: 5 + 6 + 1, total: 43 });
const marker = (name: string): string => `via_save_${name}`;
export function currentPcbViaSaveNativeCases(): readonly CurrentPcbViaSaveCommand[] {
  const callFrameId = marker("callFrameId"), objectId = marker("objectId"), scriptId = marker("scriptId");
  const result: CurrentPcbViaSaveCommand[] = [];
  for (const role of roles) {
    result.push({ phase: "via-save-arm", role, method: "Debugger.setBreakpoint", params: { location: { scriptId, lineNumber: 110, columnNumber: SITES[role].columnNumber } } },
      { phase: "via-save-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...CURRENT_PCB_VIA_SAVE_FRAME_FLAGS, callFrameId, expression: SITES[role].expression } });
  }
  const args = { entry: [{ value: "a".repeat(32) }, { value: "b".repeat(64) }], clock: [{ objectId: marker("original") }, { objectId: marker("previous") }],
    compress: [{ objectId: marker("original") }, { objectId: marker("previous") }], body: [{ objectId: marker("original") }, { objectId: marker("previous") }],
    result: [{ objectId: marker("original") }, { objectId: marker("previous") }], value: [{ objectId: marker("original") }] };
  for (const role of ["entry", "clock", "compress", "body", "result", "value"] as const) {
    result.push(validateCurrentPcbViaSaveCommand({ phase: `via-save-${role}`, method: "Runtime.callFunctionOn", params: { ...CURRENT_PCB_VIA_SAVE_CALL_FLAGS,
      objectId, functionDeclaration: CALLS[role], arguments: args[role], returnByValue: role === "value" } }));
  }
  result.push({ phase: "via-save-source", method: "Debugger.getScriptSource", params: { scriptId } },
    { phase: "via-save-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    { phase: "via-save-remove", method: "Debugger.removeBreakpoint", params: { breakpointId: marker("breakpointId") } },
    { phase: "via-save-resume", method: "Debugger.resume", params: {} }, { phase: "via-save-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } });
  return freezeDeep(result.map(command => validateCurrentPcbViaSaveCommand(command)));
}
