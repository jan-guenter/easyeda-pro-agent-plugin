/** One natural native DEL clock. A fixed command never supplies its own
 * original Job, event, issued origin, pending Promise or resume permission. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_PROGRAMS as PROGRAMS } from "./current-footprint-inverse-native-delete-clock-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_CALLER as CALLER, CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_SITES as SITES } from "./current-footprint-inverse-native-delete-clock-profile.ts";
import { currentFootprintCopyClockRpcV2Condition as rpcCondition } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_PREFIX = "inverse-native-delete-clock-";
const prefix = CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_PREFIX;
const groups = Object.freeze({ worker: "easyeda-footprint-inverse-native-delete-clock-worker-v1", ui: "easyeda-footprint-inverse-native-delete-clock-ui-v1" } as const);
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_GROUPS = groups;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_CALL_ROLES = ["worker", "expected", "ui", "entry", "push", "retainReturn", "returnJoin", "returnReprove", "dispatch", "result", "reply", "producer"] as const;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_ARM_ROLES = ["push", "qeReturned", "dispatch", "result", "reply", "producer"] as const;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_FRAME_ROLES = ["entry", "push", "qeReturned", "dispatch", "result", "caller", "reply", "producer"] as const;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_PROPERTY_ROLES = [
  "worker", "worker-bundle", "promise-prelude", "promise-constructor-before", "promise-then", "promise-species", "ui", "entry", "push",
  "returned", "return-constructor", "return-join", "promise-pending", "dispatch", "callback-function", "callback-scopes", "result", "reply", "producer", "promise-fulfilled",
] as const;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_RESUME_ROLES = ["initial-ui", "initial-worker", "push", "qeReturned", "dispatch", "result", "reply"] as const;
type CallRole = typeof CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_CALL_ROLES[number];
type FrameRole = typeof CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_FRAME_ROLES[number];
type ArmRole = typeof CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_ARM_ROLES[number];
const realms = ["worker", "ui"] as const;
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), reference = z.strictObject({ objectId: handle });
const uuid = z.string().regex(/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/u);
const integer = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER - 2).refine(value => !Object.is(value, -0));
const time = integer.positive().max(8_640_000_000_000_000); const replyTopic = z.string().regex(/^_MSG_BUS_RPC_-\/pro-mgr\/serverTime\/now-[a-f\d-]{36}-\d+$/u);
export const currentFootprintInverseNativeDeleteClockExpectedSchema = z.strictObject({
  projectUuid: z.string().regex(/^[a-f\d]{64}$/u), branchUuid: z.string().regex(/^[a-f\d]{32}$/u),
  targetUuid: z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u), client: z.string().regex(/^[a-f\d]{16}$/u), maximumTicket: integer,
});
const value = (schema: z.ZodType): z.ZodType => z.strictObject({ value: schema });
/* oxlint-disable unicorn/max-nested-calls -- The complete positional argument grammar is the native codebook boundary. */
const argumentsFor = {
  worker: z.tuple([reference]), expected: z.tuple([]), ui: z.tuple([reference]),
  entry: z.tuple([reference, reference, value(currentFootprintInverseNativeDeleteClockExpectedSchema)]),
  push: z.tuple([reference, reference, value(z.literal(1))]), retainReturn: z.tuple([]), returnJoin: z.tuple([reference, reference]), returnReprove: z.tuple([reference, reference]),
  dispatch: z.tuple([reference, value(uuid)]),
  result: z.tuple([reference, reference, reference, reference, value(z.strictObject({ replyTopic, workerUuid: uuid, uiUuid: uuid, requestId: integer, ordinal: z.literal(1) }))]),
  reply: z.tuple([reference, value(z.strictObject({ uiUuid: uuid, value: time }))]),
  producer: z.tuple([reference, reference, value(z.strictObject({ value: time }))]),
} as const;
const flags = { objectGroup: z.enum([groups.worker, groups.ui]), silent: z.literal(true), generatePreview: z.literal(false),
  throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal(`${prefix}call`), realm: z.enum(realms), role: z.enum(CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_CALL_ROLES),
    method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.string().max(16_384),
      arguments: z.array(z.unknown()).max(5), returnByValue: z.boolean() }) }),
  z.strictObject({ phase: z.literal(`${prefix}frame`), realm: z.enum(realms), role: z.enum(CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_FRAME_ROLES),
    method: z.literal("Debugger.evaluateOnCallFrame"), params: z.strictObject({ callFrameId: handle, expression: z.string().max(128),
      objectGroup: z.enum([groups.worker, groups.ui]), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true),
      returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) }) }),
  z.strictObject({ phase: z.literal(`${prefix}arm`), realm: z.enum(realms), role: z.enum(CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_ARM_ROLES),
    method: z.literal("Debugger.setBreakpoint"), params: z.strictObject({ location: z.strictObject({ scriptId: handle, lineNumber: integer, columnNumber: integer }), condition: z.string().max(512) }) }),
  z.strictObject({ phase: z.literal(`${prefix}properties`), realm: z.enum(realms), role: z.enum(CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_PROPERTY_ROLES),
    method: z.literal("Runtime.getProperties"), params: z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }) }),
  z.strictObject({ phase: z.literal("inverse-native-delete-clock-condition"), realm: z.enum(realms), role: z.enum(CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_ARM_ROLES),
    method: z.literal("Debugger.getScriptSource"), params: z.strictObject({ scriptId: handle }) }),
  z.strictObject({ phase: z.literal(`${prefix}helper`), realm: z.enum(realms), role: z.string().regex(/^(?:call|frame)\/[A-Za-z]+$/u),
    method: z.literal("Debugger.getScriptSource"), params: z.strictObject({ scriptId: handle }) }),
  z.strictObject({ phase: z.literal(`${prefix}resume`), realm: z.enum(realms), role: z.enum(CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_RESUME_ROLES),
    method: z.literal("Debugger.resume"), params: z.strictObject({}) }),
  z.strictObject({ phase: z.literal(`${prefix}remove`), realm: z.enum(realms), role: z.enum(["entry", "onMessage", "postReturned", ...CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_ARM_ROLES]),
    method: z.literal("Debugger.removeBreakpoint"), params: z.strictObject({ breakpointId: handle }) }),
  z.strictObject({ phase: z.literal(`${prefix}release`), realm: z.enum(realms), method: z.literal("Runtime.releaseObjectGroup"),
    params: z.strictObject({ objectGroup: z.enum([groups.worker, groups.ui]) }) }),
]);
/* oxlint-enable unicorn/max-nested-calls */
export type CurrentFootprintInverseNativeDeleteClockCommand = Readonly<z.infer<typeof schema>>;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_FLAGS = Object.freeze({ silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
function need(condition: boolean): asserts condition { if (!condition) { throw new Error("INVERSE_NATIVE_DELETE_CLOCK_PROTOCOL"); } }
function realm(role: string): "worker" | "ui" { return ["ui", "result", "caller", "callback-function", "callback-scopes", "initial-ui", "onMessage", "postReturned"].includes(role) ? "ui" : "worker"; }
export function currentFootprintInverseNativeDeleteClockFrame(role: FrameRole): string { return role === "caller" ? CALLER.expression : SITES[role].expression; }
export function currentFootprintInverseNativeDeleteClockCondition(role: ArmRole, busUuid?: string): string {
  if (role === "qeReturned" || role === "producer") { need(busUuid === undefined); return "true"; }
  need(busUuid !== undefined); uuid.parse(busUuid); return rpcCondition(role, busUuid);
}
export function validateCurrentFootprintInverseNativeDeleteClockCommand(input: unknown): CurrentFootprintInverseNativeDeleteClockCommand {
  const command = schema.parse(capture(input));
  if ("role" in command) {
    const selected = command.phase === `${prefix}helper` ? command.role.slice(command.role.indexOf("/") + 1) : command.role;
    need(command.realm === realm(selected));
  }
  if ("objectGroup" in command.params) { need(command.params.objectGroup === groups[command.realm]); }
  if (command.phase === `${prefix}call`) {
    need(command.params.functionDeclaration === PROGRAMS[command.role] && command.params.returnByValue === (command.role === "expected" || command.role === "returnReprove"));
    argumentsFor[command.role].parse(command.params.arguments);
  } else if (command.phase === `${prefix}frame`) { need(command.params.expression === currentFootprintInverseNativeDeleteClockFrame(command.role)); }
  else if (command.phase === `${prefix}arm`) {
    const site = SITES[command.role]; need(command.params.location.lineNumber === site.lineNumber && command.params.location.columnNumber === site.columnNumber);
    if (command.role === "qeReturned" || command.role === "producer") { need(command.params.condition === "true"); }
    else { const selected = /this\.uuid==="([a-f\d-]{36})"/u.exec(command.params.condition)?.[1]; need(selected !== undefined && command.params.condition === currentFootprintInverseNativeDeleteClockCondition(command.role, selected)); }
  } else if (command.phase === `${prefix}helper`) {
    const part = command.role.slice(0, command.role.indexOf("/")), selected = command.role.slice(command.role.indexOf("/") + 1);
    need(part === "call" ? CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_CALL_ROLES.some(role => role === selected) : part === "frame" && CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_FRAME_ROLES.some(role => role === selected));
  }
  return freezeDeep(command);
}
export function currentFootprintInverseNativeDeleteClockProgram(input: CurrentFootprintInverseNativeDeleteClockCommand): string | null {
  const command = validateCurrentFootprintInverseNativeDeleteClockCommand(input);
  if (command.phase === `${prefix}call`) { return command.params.functionDeclaration; }
  return command.phase === `${prefix}frame` ? command.params.expression : null;
}
export function currentFootprintInverseNativeDeleteClockKey(input: CurrentFootprintInverseNativeDeleteClockCommand): string {
  const command = validateCurrentFootprintInverseNativeDeleteClockCommand(input);
  return `${command.realm}/${command.phase.slice(prefix.length)}${"role" in command ? `/${command.role}` : ""}`;
}
export function currentFootprintInverseNativeDeleteClockHelperCommand(input: CurrentFootprintInverseNativeDeleteClockCommand, scriptId: string): CurrentFootprintInverseNativeDeleteClockCommand {
  const command = validateCurrentFootprintInverseNativeDeleteClockCommand(input); need(command.phase === `${prefix}call` || command.phase === `${prefix}frame`);
  return validateCurrentFootprintInverseNativeDeleteClockCommand({ phase: `${prefix}helper`, realm: command.realm, role: `${command.phase.slice(prefix.length)}/${command.role}`, method: "Debugger.getScriptSource", params: { scriptId } });
}
export function qualifyCurrentFootprintInverseNativeDeleteClockHelper(source: unknown, input: CurrentFootprintInverseNativeDeleteClockCommand): void {
  const program = currentFootprintInverseNativeDeleteClockProgram(input); need(program !== null && typeof source === "string" && source === (program.startsWith("[") ? program : `(${program})`));
}

/** The exact request/helper order is shared as immutable data by both
 * ledgers. Helpers immediately follow their original call/frame response. */
const normalOrder = [
  "worker/call/worker", "worker/properties/worker", "worker/properties/worker-bundle", "worker/properties/promise-prelude",
  "worker/properties/promise-constructor-before", "worker/properties/promise-then", "worker/properties/promise-species", "worker/call/expected",
  "ui/call/ui", "ui/properties/ui", "worker/frame/entry", "worker/call/entry", "worker/properties/entry",
  ...CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_ARM_ROLES.map(role => `${realm(role)  }/arm/${  role}`),
  "ui/remove/onMessage", "ui/remove/postReturned", "ui/resume/initial-ui", "worker/resume/initial-worker",
  "worker/condition/push", "worker/frame/push", "worker/call/push", "worker/properties/push", "worker/resume/push",
  "worker/condition/qeReturned", "worker/frame/qeReturned", "worker/call/retainReturn", "worker/properties/returned", "worker/properties/return-constructor", "worker/call/returnJoin", "worker/properties/return-join", "worker/properties/promise-pending", "worker/resume/qeReturned",
  "worker/condition/dispatch", "worker/frame/dispatch", "worker/call/dispatch", "worker/properties/dispatch", "worker/resume/dispatch",
  "ui/condition/result", "ui/frame/result", "ui/frame/caller", "ui/properties/callback-function", "ui/properties/callback-scopes", "ui/call/result", "ui/properties/result", "ui/resume/result",
  "worker/condition/reply", "worker/frame/reply", "worker/call/reply", "worker/properties/reply", "worker/resume/reply",
  "worker/condition/producer", "worker/frame/producer", "worker/call/producer", "worker/properties/producer", "worker/call/returnReprove", "worker/properties/promise-fulfilled",
  ...["entry", ...CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_ARM_ROLES].map(role => `${realm(role)  }/remove/${  role}`),
  "worker/release", "ui/release",
];
if (normalOrder.length !== 70) { throw new Error("INVERSE_NATIVE_DELETE_CLOCK_ROSTER"); }
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_ORDER = Object.freeze(normalOrder.flatMap(key => {
  const parts = key.split("/"); return parts[1] === "call" || parts[1] === "frame" ? [key, `${parts[0]  }/helper/${  parts.slice(1).join("/")}`] : [key];
}));
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_REQUESTS = Object.freeze({
  normal: 70, helpers: 20, conditionSources: 6, cdpRequests: 90, controls: 106, resumes: 7, events: 45, producerResumed: false, completeDeleteReserved: false, saveAuthorized: false,
} as const);
function caseRef(): Readonly<{ objectId: string }> { return { objectId: "original_ref" }; }
const exampleExpected = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), targetUuid: "c".repeat(16), client: "d".repeat(16), maximumTicket: 7 };
const exampleUuid = "11111111-2222-3333-4444-555555555555";
const exampleTopic = `_MSG_BUS_RPC_-/pro-mgr/serverTime/now-${  exampleUuid  }-7`;
function caseArguments(role: CallRole): unknown[] {
  if (role === "expected" || role === "retainReturn") { return []; }
  if (role === "worker" || role === "ui") { return [caseRef()]; }
  if (role === "entry") { return [caseRef(), caseRef(), { value: exampleExpected }]; }
  if (role === "push") { return [caseRef(), caseRef(), { value: 1 }]; }
  if (role === "returnJoin" || role === "returnReprove") { return [caseRef(), caseRef()]; }
  if (role === "dispatch") { return [caseRef(), { value: exampleUuid }]; }
  if (role === "result") { return [caseRef(), caseRef(), caseRef(), caseRef(), { value: { replyTopic: exampleTopic, workerUuid: exampleUuid, uiUuid: exampleUuid, requestId: 7, ordinal: 1 } }]; }
  return role === "reply" ? [caseRef(), { value: { uiUuid: exampleUuid, value: 7 } }] : [caseRef(), caseRef(), { value: { value: 7 } }];
}
export function currentFootprintInverseNativeDeleteClockCases(): readonly CurrentFootprintInverseNativeDeleteClockCommand[] {
  const commands: unknown[] = [
    ...CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_CALL_ROLES.map(role => ({ phase: `${prefix  }call`, realm: realm(role), role, method: "Runtime.callFunctionOn", params: {
      ...CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_FLAGS, objectGroup: groups[realm(role)], objectId: "original_ref", functionDeclaration: PROGRAMS[role], arguments: caseArguments(role), returnByValue: role === "expected" || role === "returnReprove" } })),
    ...CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_FRAME_ROLES.map(role => ({ phase: `${prefix  }frame`, realm: realm(role), role, method: "Debugger.evaluateOnCallFrame", params: {
      callFrameId: "original_ref", expression: currentFootprintInverseNativeDeleteClockFrame(role), objectGroup: groups[realm(role)], silent: true, generatePreview: false, throwOnSideEffect: true, returnByValue: false, includeCommandLineAPI: false } })),
    ...CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_ARM_ROLES.map(role => ({ phase: `${prefix  }arm`, realm: realm(role), role, method: "Debugger.setBreakpoint", params: {
      location: { scriptId: "original_ref", lineNumber: SITES[role].lineNumber, columnNumber: SITES[role].columnNumber }, condition: currentFootprintInverseNativeDeleteClockCondition(role, role === "qeReturned" || role === "producer" ? undefined : exampleUuid) } })),
    ...CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_ARM_ROLES.map(role => ({ phase: `${prefix  }condition`, realm: realm(role), role, method: "Debugger.getScriptSource", params: { scriptId: "original_ref" } })),
    ...CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_PROPERTY_ROLES.map(role => ({ phase: `${prefix  }properties`, realm: realm(role), role, method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } })),
    ...CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_RESUME_ROLES.map(role => ({ phase: `${prefix  }resume`, realm: realm(role), role, method: "Debugger.resume", params: {} })),
    ...["entry", "onMessage", "postReturned", ...CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_ARM_ROLES].map(role => ({ phase: `${prefix  }remove`, realm: realm(role), role, method: "Debugger.removeBreakpoint", params: { breakpointId: "original_ref" } })),
    ...realms.map(selected => ({ phase: `${prefix  }release`, realm: selected, method: "Runtime.releaseObjectGroup", params: { objectGroup: groups[selected] } })),
  ];
  const checked = commands.map(command => validateCurrentFootprintInverseNativeDeleteClockCommand(command));
  return freezeDeep([...checked, ...checked.filter(command => currentFootprintInverseNativeDeleteClockProgram(command) !== null).map(command => currentFootprintInverseNativeDeleteClockHelperCommand(command, "original_ref"))]);
}
export function currentFootprintInverseNativeDeleteClockWire(input: CurrentFootprintInverseNativeDeleteClockCommand, id: number, sessionId: string): CurrentFootprintInverseNativeDeleteClockCommand & Readonly<{ id: number; sessionId: string; inverseNativeDeleteClock: true }> {
  need(Number.isSafeInteger(id) && id > 0 && id <= 2_147_483_647); handle.parse(sessionId); return freezeDeep({ ...validateCurrentFootprintInverseNativeDeleteClockCommand(input), id, sessionId, inverseNativeDeleteClock: true });
}
const marker = (name: string): string => `__inverse_native_delete_clock_${  name  }__`;
type Scalar = string | number;
function scalarFields(command: CurrentFootprintInverseNativeDeleteClockCommand): Readonly<Record<string, Scalar>> {
  const fields: Record<string, Scalar> = {};
  if (command.method === "Runtime.callFunctionOn") {
    fields["objectId"] = command.params.objectId;
    let index = 0;
    for (const argument of command.params.arguments) {
      const ref = reference.safeParse(argument);
      if (ref.success) { fields[`arg${  String(index)}`] = ref.data.objectId; index += 1; } else {
      const item = z.strictObject({ value: z.unknown() }).parse(argument).value;
      if (command.role === "entry") { const wanted = currentFootprintInverseNativeDeleteClockExpectedSchema.parse(item); Object.assign(fields, { projectUuid: wanted.projectUuid, branchUuid: wanted.branchUuid, documentUuid: wanted.targetUuid, client: wanted.client, maximumTicket: wanted.maximumTicket }); }
      else if (command.role === "dispatch") { fields["uiUuid"] = uuid.parse(item); }
      else if (command.role === "result") { const wanted = z.strictObject({ replyTopic, workerUuid: uuid, uiUuid: uuid, requestId: integer, ordinal: z.literal(1) }).parse(item); Object.assign(fields, { replyTopic: wanted.replyTopic, workerUuid: wanted.workerUuid, uiUuid: wanted.uiUuid, requestIdValue: wanted.requestId }); }
      else if (command.role === "reply") { const wanted = z.strictObject({ uiUuid: uuid, value: time }).parse(item); Object.assign(fields, { uiUuid: wanted.uiUuid, updateTime: wanted.value }); }
      else if (command.role === "producer") { fields["updateTime"] = z.strictObject({ value: time }).parse(item).value; }
      else { need(command.role === "push" && item === 1); }
      }
    }
  } else if (command.method === "Runtime.getProperties") { fields["objectId"] = command.params.objectId; }
  else if (command.method === "Debugger.evaluateOnCallFrame") { fields["callFrameId"] = command.params.callFrameId; }
  else if (command.method === "Debugger.getScriptSource") { fields["scriptId"] = command.params.scriptId; }
  else if (command.method === "Debugger.removeBreakpoint") { fields["breakpointId"] = command.params.breakpointId; }
  else if (command.method === "Debugger.setBreakpoint") { fields["scriptId"] = command.params.location.scriptId;
    if (command.role !== "qeReturned" && command.role !== "producer") { const found = /this\.uuid==="([a-f\d-]{36})"/u.exec(command.params.condition)?.[1]; need(found !== undefined); fields[`condition_${  command.role}`] = uuid.parse(found); }
  }
  return Object.freeze(fields);
}
export function currentFootprintInverseNativeDeleteClockTemplate(input: CurrentFootprintInverseNativeDeleteClockCommand): Readonly<{ key: string; method: string; names: readonly string[]; template: string }> {
  const command = validateCurrentFootprintInverseNativeDeleteClockCommand(input), fields = scalarFields(command);
  const params: Record<string, unknown> = { ...command.params };
  for (const name of ["objectId", "callFrameId", "scriptId", "breakpointId"]) { if (Object.hasOwn(params, name)) { params[name] = marker(name); } }
  if (command.method === "Debugger.setBreakpoint") { params["location"] = { ...command.params.location, scriptId: marker("scriptId") };
    if (command.role !== "qeReturned" && command.role !== "producer") { params["condition"] = marker(`condition_${  command.role}`); } }
  if (command.method === "Runtime.callFunctionOn") {
    params["functionDeclaration"] = marker(`program_${  command.role}`); let index = 0;
    params["arguments"] = command.params.arguments.map(argument => {
      if (reference.safeParse(argument).success) { const name = `arg${  String(index)}`; index += 1; return { objectId: marker(name) }; }
      if (command.role === "entry") { return { value: { projectUuid: marker("projectUuid"), branchUuid: marker("branchUuid"), targetUuid: marker("documentUuid"), client: marker("client"), maximumTicket: marker("maximumTicket") } }; }
      if (command.role === "dispatch") { return { value: marker("uiUuid") }; }
      if (command.role === "result") { return { value: { replyTopic: marker("replyTopic"), workerUuid: marker("workerUuid"), uiUuid: marker("uiUuid"), requestId: marker("requestIdValue"), ordinal: 1 } }; }
      if (command.role === "reply") { return { value: { uiUuid: marker("uiUuid"), value: marker("updateTime") } }; }
      return command.role === "producer" ? { value: { value: marker("updateTime") } } : { value: 1 };
    });
  }
  const key = `${command.realm  }/${  command.phase.slice(prefix.length)  }${"role" in command ? `:${  command.role}` : ""}`;
  return Object.freeze({ key, method: command.method, names: Object.freeze(Object.keys(fields)), template: JSON.stringify({ method: command.method, params }) });
}
export function currentFootprintInverseNativeDeleteClockNativeFrame(bytes: Buffer, input: CurrentFootprintInverseNativeDeleteClockCommand, sessionId: string): Readonly<Record<string, Scalar>> {
  need(bytes.length <= 65_536 && bytes.at(-1) === 0);
  const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(0, -1)));
  const id = z.looseObject({ id: z.number().int().positive().max(2_147_483_647) }).parse(capture(raw)).id; const command = validateCurrentFootprintInverseNativeDeleteClockCommand(input);
  need(bytes.toString("utf8") === `${JSON.stringify(currentFootprintInverseNativeDeleteClockWire(command, id, sessionId))  }\0`);
  return Object.freeze({ action: "footprint-inverse-native-delete-clock", requestId: id, phase: command.phase, method: command.method, realm: command.realm,
    ...("role" in command ? { role: command.role } : {}), ...scalarFields(command) });
}

/** A condition is compiled by the engine, independently of our evaluated
 * helpers. Its exact source is joined to the original acknowledged arm. */
export function qualifyCurrentFootprintInverseNativeDeleteClockConditionSource(source: unknown, input: CurrentFootprintInverseNativeDeleteClockCommand): void {
  const command = validateCurrentFootprintInverseNativeDeleteClockCommand(input);
  need(command.method === "Debugger.setBreakpoint" && typeof source === "string" && source === command.params.condition);
}
