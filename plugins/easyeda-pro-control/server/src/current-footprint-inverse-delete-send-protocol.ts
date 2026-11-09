/** Original DEL body/method holds, before any worker RPC body is released. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_SEND_EXPRESSIONS as EXPRESSIONS } from "./current-footprint-inverse-delete-send-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_SEND_PROGRAMS as P } from "./current-footprint-inverse-delete-send-programs.ts";
import {CURRENT_FOOTPRINT_INVERSE_LOOKUP_NATIVE_PROGRAMS as NATIVE}from"./current-footprint-inverse-lookup-native-programs.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), ref = z.strictObject({ objectId: handle });
const target = z.strictObject({ projectUuid: z.string().regex(/^[a-f\d]{64}$/u), branchUuid: z.string().regex(/^[a-f\d]{32}$/u), documentUuid: z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u) });
export const CURRENT_FOOTPRINT_INVERSE_DELETE_SEND_CALLS=freezeDeep({nativeInstance:{program:NATIVE.defaultInstance,refs:3,value:false,byValue:true},nativeHooks:{program:NATIVE.hooks,refs:2,value:false,byValue:true},managerData:{program:P.managerData,refs:8,value:false,byValue:false},managerLinks:{program:P.managerLinks,refs:8,value:false,byValue:false},managerTopics:{program:P.managerTopics,refs:3,value:false,byValue:false},prepareUi:{program:P.prepareUi,refs:4,value:true,byValue:false},prepareManager:{program:P.prepareManager,refs:4,value:true,byValue:false},before:{program:P.before,refs:1,value:false,byValue:true},body:{program:P.body,refs:2,value:false,byValue:true},method:{program:P.method,refs:2,value:false,byValue:true}}as const);
export const CURRENT_FOOTPRINT_INVERSE_DELETE_SEND_FLAGS = Object.freeze({ objectGroup: "easyeda-footprint-inverse-delete-send-v1", silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
const flags = { objectGroup: z.literal(CURRENT_FOOTPRINT_INVERSE_DELETE_SEND_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const roles=["nativeInstance","nativeHooks","managerData","managerLinks","managerTopics","prepareUi","prepareManager","before","body","method"]as const;
const argument = z.union([ref, z.strictObject({ value: target })]);
const callParams = z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.string().max(16_384), arguments: z.array(argument).max(8), returnByValue: z.boolean() });
const propertyParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const frameParams = z.strictObject({ callFrameId: handle, expression: z.string(), objectGroup: flags.objectGroup, silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) });
const sourceParams = z.strictObject({ scriptId: handle }); const armParams = z.strictObject({ objectId: handle, condition: z.literal("") });
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("inverse-delete-send-call"), role: z.enum(roles), method: z.literal("Runtime.callFunctionOn"), params: callParams }),
  z.strictObject({ phase: z.literal("inverse-delete-send-properties"), method: z.literal("Runtime.getProperties"), params: propertyParams }),
  z.strictObject({ phase: z.literal("inverse-delete-send-helper"), method: z.literal("Debugger.getScriptSource"), params: sourceParams }),
  z.strictObject({ phase: z.literal("inverse-delete-send-remove"), method: z.literal("Debugger.removeBreakpoint"), params: z.strictObject({breakpointId:handle}) }),
  z.strictObject({ phase: z.literal("inverse-delete-send-arm"), role:z.enum(["body","method"]), method: z.literal("Debugger.setBreakpointOnFunctionCall"), params: armParams }),
  z.strictObject({ phase: z.literal("inverse-delete-send-frame"), role: z.enum(["body","method"]), method: z.literal("Debugger.evaluateOnCallFrame"), params: frameParams }),
  z.strictObject({ phase: z.literal("inverse-delete-send-resume"), method: z.literal("Debugger.resume"), params: z.strictObject({}) }),
]);
export type CurrentFootprintInverseDeleteSendCommand = Readonly<z.infer<typeof schema>>;
export const CURRENT_FOOTPRINT_INVERSE_DELETE_SEND_REQUESTS = Object.freeze({normal:54,calls:13,properties:33,frames:2,arm:2,remove:2,resume:2,helpers:15,cdpRequests:69,controls:78}as const);
/** Reject departures from the fixed DEL wire/argument grammar with a closed
 * error code; successful parsing supplies no native dispatch authority. */
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_DELETE_SEND_COMMAND"); } }
/** Validate the closed command grammar and every fixed program, argument and flag. */
export function validateCurrentFootprintInverseDeleteSendCommand(input: unknown): CurrentFootprintInverseDeleteSendCommand { const command = schema.parse(capture(input)); if (command.method === "Runtime.callFunctionOn") { const row = CURRENT_FOOTPRINT_INVERSE_DELETE_SEND_CALLS[command.role]; need(command.params.functionDeclaration === row.program && command.params.returnByValue === row.byValue && command.params.arguments.length === row.refs + Number(row.value)); for (const [index, value] of command.params.arguments.entries()) { need(index < row.refs ? "objectId" in value : "value" in value); } } else if (command.method === "Debugger.evaluateOnCallFrame") { need(command.params.expression === EXPRESSIONS[command.role]); } return freezeDeep(command); }
/** Return only an exact submitted helper whose source needs a correlated receipt. */
export function currentFootprintInverseDeleteSendProgram(command: CurrentFootprintInverseDeleteSendCommand): string | null { if (command.method === "Runtime.callFunctionOn") { return command.params.functionDeclaration; } if (command.method === "Debugger.evaluateOnCallFrame") { return command.params.expression; } return null; }
/** Require the actual script source to equal its original fixed declaration or expression. */
export function qualifyCurrentFootprintInverseDeleteSendHelper(input: unknown, program: string): void { const source = z.strictObject({ scriptSource: z.string().max(16_386) }).parse(capture(input)); const declaration = Object.values(CURRENT_FOOTPRINT_INVERSE_DELETE_SEND_CALLS).some(row => row.program === program); need(declaration || Object.values(EXPRESSIONS).some(value => value === program)); need(source.scriptSource === (declaration ? `(${program})` : program)); }
/** Encode the fixed command with this lane's marker and original session. */
export function currentFootprintInverseDeleteSendWire(input: CurrentFootprintInverseDeleteSendCommand, id: number, sessionId: string): CurrentFootprintInverseDeleteSendCommand & Readonly<{ id: number; sessionId: string; inverseDeleteSend: true }> { need(Number.isSafeInteger(id) && id > 0); handle.parse(sessionId); return freezeDeep({ ...validateCurrentFootprintInverseDeleteSendCommand(input), id, sessionId, inverseDeleteSend: true }); }
/** Recover native fields only from a byte-exact original wire frame. */
export function currentFootprintInverseDeleteSendNativeFrame(bytes: Buffer, input: CurrentFootprintInverseDeleteSendCommand, sessionId: string): Readonly<Record<string, string | number>> {
  need(bytes.length <= 65_536 && bytes.at(-1) === 0); const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(0, -1))); const id = z.looseObject({ id: z.number().int().positive() }).parse(capture(raw)).id; const command = validateCurrentFootprintInverseDeleteSendCommand(input); need(bytes.toString("utf8") === `${JSON.stringify(currentFootprintInverseDeleteSendWire(command, id, sessionId))}\0`);
  const fields: Record<string, string | number> = { action: "footprint-inverse-delete-send", requestId: id, phase: command.phase, method: command.method }; if ("role" in command) { fields["role"] = command.role; }
  if (command.method === "Debugger.getScriptSource") { fields["scriptId"] = command.params.scriptId; } else if (command.method === "Debugger.evaluateOnCallFrame") { fields["callFrameId"] = command.params.callFrameId; } else if(command.method==="Debugger.removeBreakpoint"){fields["breakpointId"]=command.params.breakpointId;} else if (command.method !== "Debugger.resume") { fields["objectId"] = command.params.objectId; if (command.method === "Runtime.callFunctionOn") { for (const [index, value] of command.params.arguments.entries()) { if ("objectId" in value) { fields[`reference${String(index)}`] = value.objectId; } else { Object.assign(fields, value.value); } } } } return Object.freeze(fields);
}
/** Enumerate every fixed message shape for independent native hash parity. */
export function currentFootprintInverseDeleteSendCases(): readonly CurrentFootprintInverseDeleteSendCommand[] { return freezeDeep([
  ...roles.map(role => { const row = CURRENT_FOOTPRINT_INVERSE_DELETE_SEND_CALLS[role]; const args: unknown[] = Array.from({ length: row.refs }, () => ({ objectId: "original_ref" })); if (row.value) { args.push({ value: { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16) } }); } return { phase: "inverse-delete-send-call", role, method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_INVERSE_DELETE_SEND_FLAGS, objectId: "original_ref", functionDeclaration: row.program, arguments: args, returnByValue: row.byValue } }; }),
  { phase: "inverse-delete-send-properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
  { phase: "inverse-delete-send-helper", method: "Debugger.getScriptSource", params: { scriptId: "original_ref" } },
  {phase:"inverse-delete-send-remove",method:"Debugger.removeBreakpoint",params:{breakpointId:"original_ref"}},
  ...(["body","method"] as const).map(role=>({ phase: "inverse-delete-send-arm",role, method: "Debugger.setBreakpointOnFunctionCall", params: { objectId: "original_ref", condition: "" } })),
  ...(["body","method"] as const).map(role => ({ phase: "inverse-delete-send-frame", role, method: "Debugger.evaluateOnCallFrame", params: { callFrameId: "original_ref", expression: EXPRESSIONS[role], objectGroup: CURRENT_FOOTPRINT_INVERSE_DELETE_SEND_FLAGS.objectGroup, silent: true, generatePreview: false, throwOnSideEffect: true, returnByValue: false, includeCommandLineAPI: false } })),
  { phase: "inverse-delete-send-resume", method: "Debugger.resume", params: {} },
].map(value => validateCurrentFootprintInverseDeleteSendCommand(value))); }
/** Build a closed template with substitutions limited to original handles and target fields. */
export function currentFootprintInverseDeleteSendTemplate(input: CurrentFootprintInverseDeleteSendCommand): Readonly<{ key: string; method: string; names: readonly string[]; template: string }> {
  const command = validateCurrentFootprintInverseDeleteSendCommand(input); const names: string[] = []; const field = (name: string): string => { need(!names.includes(name)); names.push(name); return `__delete_send_${name}__`; }; const params: Record<string, unknown> = { ...command.params };
  if (command.method === "Debugger.getScriptSource") { params["scriptId"] = field("scriptId"); } else if (command.method === "Debugger.evaluateOnCallFrame") { params["callFrameId"] = field("callFrameId"); } else if(command.method==="Debugger.removeBreakpoint"){params["breakpointId"]=field("breakpointId");} else if (command.method !== "Debugger.resume") { params["objectId"] = field("objectId"); if (command.method === "Runtime.callFunctionOn") { params["functionDeclaration"] = `__delete_send_program_${command.role}__`; params["arguments"] = command.params.arguments.map((arg, index) => "objectId" in arg ? { objectId: field(`reference${String(index)}`) } : { value: { projectUuid: field("projectUuid"), branchUuid: field("branchUuid"), documentUuid: field("documentUuid") } }); } }
  return freezeDeep({ key: command.phase.slice("inverse-delete-send-".length) + ("role" in command ? `:${command.role}` : ""), method: command.method, names, template: JSON.stringify({ method: command.method, params }) });
}
