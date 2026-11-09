/** One selected SCH Save clock. Only the original native owner selects worker
 * and UI sessions; fixed scalar/handle slots never accept a caller program. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_V2_SITES as BASE_SITES, CURRENT_FOOTPRINT_COPY_CLOCK_RPC_V2_CALLER as CALLER } from "./current-footprint-copy-clock-rpc-v2-profile.ts";
import { CURRENT_SCHEMATIC_DISPLAY_CLOCK_CALLS as CALLS, CURRENT_SCHEMATIC_DISPLAY_CLOCK_GROUP as GROUP } from "./current-schematic-display-clock-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_DISPLAY_CLOCK_SITES = freezeDeep({ push: BASE_SITES.push, dispatch: BASE_SITES.dispatch, result: BASE_SITES.result, reply: BASE_SITES.reply,
  complete: { realm: "ui", lineNumber: 1, columnNumber: 86_798, functionName: "k", functionLine: 1, functionColumn: 86_476, expression: "[this,B,v,y,k]" } });
export const CURRENT_SCHEMATIC_DISPLAY_CLOCK_UI_CALLER = freezeDeep({ ...CALLER });
export type CurrentSchematicDisplayClockSite = keyof typeof CURRENT_SCHEMATIC_DISPLAY_CLOCK_SITES;
export const CURRENT_SCHEMATIC_DISPLAY_CLOCK_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), id = z.string().regex(/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/u);
const branch = z.string().regex(/^[a-f\d]{32}$/u), project = z.string().regex(/^[a-f\d]{64}$/u), tab = z.string().regex(/^[A-Za-z\d_-]{1,128}$/u);
const object = z.strictObject({ objectId: handle });
const branchArgument = z.strictObject({ value: branch }), projectArgument = z.strictObject({ value: project }), tabArgument = z.strictObject({ value: tab });
const idArgument = z.strictObject({ value: id });
const count = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER - 1).refine(value => !Object.is(value, -0));
const time = z.number().int().positive().max(8_640_000_000_000_000);
const replyTopic = z.string().max(256).regex(/^_MSG_BUS_RPC_-\/pro-mgr\/serverTime\/now-[a-f\d-]{36}-\d+$/u);
const resultExpected = z.strictObject({ replyTopic, workerUuid: id, uiUuid: id, requestId: count, ordinal: z.literal(1) });
const replyExpected = z.strictObject({ uiUuid: id, value: time });
const args = { registration: z.tuple([projectArgument, branchArgument, tabArgument]), callback: z.tuple([]),
  bindings: z.tuple([object, object, object, projectArgument, branchArgument, tabArgument]), offset: z.tuple([object, object, object, object, projectArgument, branchArgument, tabArgument]),
  worker: z.tuple([projectArgument, tabArgument]), ui: z.tuple([object]), push: z.tuple([object]), dispatch: z.tuple([object, idArgument]),
  result: z.tuple([object, object, object, z.strictObject({ value: resultExpected })]), complete: z.tuple([object, object]), reply: z.tuple([object, z.strictObject({ value: replyExpected })]) };
const flags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const roles = ["registration", "callback", "bindings", "offset", "worker", "ui", "push", "dispatch", "result", "reply", "complete"] as const;
const calls = roles.map(role => {
  const receiver = role === "worker" ? { uniqueContextId: handle } : { objectId: handle };
  return z.strictObject({ phase: z.literal(`schematic-clock-${role}`), method: z.literal("Runtime.callFunctionOn"),
    params: z.strictObject({ ...flags, ...receiver, functionDeclaration: z.literal(CALLS[role]), arguments: args[role], returnByValue: z.literal(role === "offset") }) });
});
const sites = ["push", "dispatch", "result", "reply", "complete"] as const;
const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const frameFlags = { objectGroup: z.literal(GROUP), silent: z.literal(true), returnByValue: z.literal(false), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), includeCommandLineAPI: z.literal(false) };
const expressions = z.enum([...sites.map(role => CURRENT_SCHEMATIC_DISPLAY_CLOCK_SITES[role].expression), CALLER.expression]);
const extra = [
  z.strictObject({ phase: z.literal("schematic-clock-source"), role: z.enum(["wrapper", "callback"]), method: z.literal("Debugger.getScriptSource"), params: z.strictObject({ scriptId: handle }) }),
  z.strictObject({ phase: z.literal("schematic-clock-arm"), role: z.enum(sites), method: z.literal("Debugger.setBreakpoint"), params: z.strictObject({ location: point, condition: z.string().min(1).max(1024) }) }),
  z.strictObject({ phase: z.literal("schematic-clock-frame"), method: z.literal("Debugger.evaluateOnCallFrame"), params: z.strictObject({ ...frameFlags, callFrameId: handle, expression: expressions }) }),
  z.strictObject({ phase: z.literal("schematic-clock-properties"), method: z.literal("Runtime.getProperties"), params: z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }) }),
  z.strictObject({ phase: z.literal("schematic-clock-remove"), role: z.enum(sites), method: z.literal("Debugger.removeBreakpoint"), params: z.strictObject({ breakpointId: handle }) }),
  z.strictObject({ phase: z.literal("schematic-clock-resume"), role: z.enum(sites), method: z.literal("Debugger.resume"), params: z.strictObject({}) }),
  z.strictObject({ phase: z.literal("schematic-clock-release"), realm: z.enum(["worker", "ui"]), method: z.literal("Runtime.releaseObjectGroup"), params: z.strictObject({ objectGroup: z.literal(GROUP) }) }),
];
const schema = z.union([...calls, ...extra]);
export type CurrentSchematicDisplayClockCommand = z.infer<typeof schema>;
export function currentSchematicDisplayClockCondition(role: CurrentSchematicDisplayClockSite, busUuid: string): string {
  id.parse(busUuid); let selected: string;
  if (role === "reply") { selected = `typeof t==="string"&&t.startsWith(${JSON.stringify(`_MSG_BUS_RPC_-/pro-mgr/serverTime/now-${busUuid}-`)})`; }
  else { let topic = "t"; if (role === "push") { topic = "e"; } else if (role === "result" || role === "complete") { topic = "y"; } selected = `${topic}==="/pro-mgr/serverTime/now"`; }
  return `(()=>{try{const d=Object.getOwnPropertyDescriptor(this,"uuid");if(!d||!Object.hasOwn(d,"value"))return true;return d.value===${JSON.stringify(busUuid)}&&${selected};}catch{return true;}})()`;
}
export function validateCurrentSchematicDisplayClockCommand(input: unknown): CurrentSchematicDisplayClockCommand {
  const command = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.phase === "schematic-clock-arm") {
    const site = CURRENT_SCHEMATIC_DISPLAY_CLOCK_SITES[command.role]; const actual = command.params.location;
    const busUuid = /d\.value==="([a-f\d-]{36})"/u.exec(command.params.condition)?.[1];
    if (actual.lineNumber !== site.lineNumber || actual.columnNumber !== site.columnNumber || busUuid === undefined ||
      command.params.condition !== currentSchematicDisplayClockCondition(command.role, busUuid)) { throw new Error("SCHEMATIC_DISPLAY_CLOCK_FIXED_ARM"); }
  }
  return freezeDeep(command);
}

/**18 registration +5 pre-offset +8 bus/metadata joins +5 arms +18 paused
 * frame/caller/scope joins +5 post-offset; five original resumes, five removals
 * and two original realm group releases have separate cleanup capacity. */
/** Initial sample, arm recheck and post-collection recheck. */
export const CURRENT_SCHEMATIC_DISPLAY_CLOCK_OFFSET_SAMPLES = 3;
export const CURRENT_SCHEMATIC_DISPLAY_CLOCK_REQUESTS = Object.freeze({ normal: 18 + 5 + 8 + 5 + 18 + 5, cleanup: 5 + 5 + 2, total: 71 });
const marker = (name: string): string => `schematic_clock_${name}`;
const objectArgument = (name: string): Readonly<{ objectId: string }> => ({ objectId: marker(name) });
export function currentSchematicDisplayClockNativeCases(): readonly CurrentSchematicDisplayClockCommand[] {
  const identity = [{ value: "a".repeat(64) }, { value: "b".repeat(32) }, { value: "window" }];
  const workerUuid = "11111111-1111-1111-1111-111111111111"; const uiUuid = "22222222-2222-2222-2222-222222222222";
  const argumentsFor = { registration: identity, callback: [], bindings: [objectArgument("wrapperScope"), objectArgument("first"), objectArgument("callback"), ...identity],
    offset: [objectArgument("wrapperScope"), objectArgument("first"), objectArgument("callback"), objectArgument("bindings"), ...identity],
    worker: [{ value: "a".repeat(64) }, { value: "window" }], ui: [objectArgument("bindings")], push: [objectArgument("worker")],
    dispatch: [objectArgument("push"), { value: uiUuid }], result: [objectArgument("ui"), objectArgument("caller"), objectArgument("callbackScope"),
      { value: { replyTopic: `_MSG_BUS_RPC_-/pro-mgr/serverTime/now-${workerUuid}-41`, workerUuid, uiUuid, requestId: 41, ordinal: 1 } }],
    reply: [objectArgument("push"), { value: { uiUuid, value: 1_700_000_000_123 } }], complete: [objectArgument("resultFrame"), objectArgument("ui")] };
  const result: CurrentSchematicDisplayClockCommand[] = [];
  for (const role of roles) {
    const receiver = role === "worker" ? { uniqueContextId: marker("workerContext") } : { objectId: marker("objectId") };
    result.push(validateCurrentSchematicDisplayClockCommand({ phase: `schematic-clock-${role}`, method: "Runtime.callFunctionOn", params: {
      ...CURRENT_SCHEMATIC_DISPLAY_CLOCK_FLAGS, ...receiver, functionDeclaration: CALLS[role], arguments: argumentsFor[role], returnByValue: role === "offset" } }));
  }
  for (const role of sites) {
    const site = CURRENT_SCHEMATIC_DISPLAY_CLOCK_SITES[role];
    result.push({ phase: "schematic-clock-arm", role, method: "Debugger.setBreakpoint", params: { location: { scriptId: marker("scriptId"), lineNumber: site.lineNumber,
      columnNumber: site.columnNumber }, condition: currentSchematicDisplayClockCondition(role, site.realm === "ui" ? uiUuid : workerUuid) } },
    { phase: "schematic-clock-frame", method: "Debugger.evaluateOnCallFrame", params: { objectGroup: GROUP, silent: true, returnByValue: false, generatePreview: false,
      throwOnSideEffect: true, includeCommandLineAPI: false, callFrameId: marker("callFrameId"), expression: site.expression } },
    { phase: "schematic-clock-remove", role, method: "Debugger.removeBreakpoint", params: { breakpointId: marker("breakpointId") } },
    { phase: "schematic-clock-resume", role, method: "Debugger.resume", params: {} });
  }
  for (const role of ["wrapper", "callback"] as const) { result.push({ phase: "schematic-clock-source", role, method: "Debugger.getScriptSource", params: { scriptId: marker("scriptId") } }); }
  for (const realm of ["worker", "ui"] as const) { result.push({ phase: "schematic-clock-release", realm, method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } }); }
  result.push({ phase: "schematic-clock-frame", method: "Debugger.evaluateOnCallFrame", params: { objectGroup: GROUP, silent: true, returnByValue: false, generatePreview: false,
    throwOnSideEffect: true, includeCommandLineAPI: false, callFrameId: marker("callFrameId"), expression: CALLER.expression } },
  { phase: "schematic-clock-properties", method: "Runtime.getProperties", params: { objectId: marker("objectId"), ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  return freezeDeep(result.map(command => validateCurrentSchematicDisplayClockCommand(command)));
}
