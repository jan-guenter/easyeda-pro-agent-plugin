/** Original accepted GET event observation for the fresh native task. This
 * readonly collector supplies comparison data; Core alone can issue its Job. */
import type { z } from "zod";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_ACCEPT_FLAGS as FLAGS, CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_ACCEPT_REQUESTS as LIMIT, currentFootprintInverseNativeGetTaskAcceptCases as cases, currentFootprintInverseNativeGetTaskAcceptProgram as program, validateCurrentFootprintInverseNativeGetTaskAcceptCommand as validate } from "./current-footprint-inverse-native-get-task-accept-protocol.ts";
import type { CurrentFootprintInverseNativeGetTaskAcceptCommand as Command } from "./current-footprint-inverse-native-get-task-accept-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_GET_NATIVE_EXPRESSIONS as EXPRESSIONS, CURRENT_FOOTPRINT_INVERSE_GET_NATIVE_DELIVERY_PROGRAMS as P } from "./current-footprint-inverse-get-native-delivery-programs.ts";
import type { currentFootprintInverseGetNativeExpectedSchema } from "./current-footprint-inverse-get-native-delivery-replies.ts";
import { currentFootprintInverseGetEntryFrames as frames } from "./current-footprint-inverse-get-entry-replies.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array as array, decodeCurrentFootprintCopyClockRpcV2ArrayCapture as result } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { qualifyCurrentFootprintInverseNativeDeliveryEvent as qualifyEvent } from "./current-footprint-inverse-native-delivery-replies.ts";
import { currentNativeMessageEventCallable as callable, qualifyCurrentNativeMessageEventFunction as metadata } from "./current-native-message-event-metadata.ts";
import { currentFootprintInverseDeleteRpcTrue as truth } from "./current-footprint-inverse-delete-rpc-protocol.ts";

interface Bindings {
  readonly event: DiagnosticEvent; readonly point: string; readonly sessionId: string; readonly scriptId: string;
  readonly intrinsics: string; readonly channel: Readonly<{ bound: string; events: string }>;
  readonly prepared: Readonly<{ capture: string; link: string }>;
  readonly expected: Readonly<z.infer<typeof currentFootprintInverseGetNativeExpectedSchema>>;
  readonly current: () => void; readonly assertOriginalEvent: (event: DiagnosticEvent) => void;
  readonly request: (command: Command) => Promise<unknown>; readonly qualifyHelper: (command: Command) => Promise<void>;
}
export interface CurrentFootprintInverseNativeGetTaskAcceptedData {
  readonly proof: string; readonly entry: string; readonly service: string; readonly event: string;
  readonly normal: 20; readonly helpers: 6; readonly getBodyAuthorized: false; readonly runtimeJobIssued: false;
}
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_GET_TASK_ACCEPT_SEQUENCE"); } }
/** Compare the actual selected native Event with the same sender's fixed
 * envelope, original registered callback/receiver and own-undefined argument.
 * Matching supplied data or a copied event cannot establish provenance. */
export async function collectCurrentFootprintInverseNativeGetTaskAccept(b: Bindings): Promise<Readonly<CurrentFootprintInverseNativeGetTaskAcceptedData>> {
  const current = (): void => { b.current(); b.assertOriginalEvent(b.event); }; current();
  const selected = frames(b.event, b.sessionId, b.scriptId, b.point); let helpers = 0; let normal = 0; const order = cases().slice(0, LIMIT.normal).map(command => command.phase);
  /** Burn each fixed normal slot before transport and join the same original
   * helper before exposing its result to any subsequent traversal. */
  const send = async (input: Command): Promise<unknown> => { current(); const command = validate(input); need(command.phase === order[normal] && normal < LIMIT.normal); normal += 1; const raw = await b.request(command); current(); if (program(command) !== null) { need((helpers += 1) <= LIMIT.helpers); await b.qualifyHelper(command); current(); } return raw; };
  const props = (role: string, objectId: string): Promise<unknown> => send(validate({ phase: `inverse-native-get-task-accept-properties-${role}`, method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }));
  /** Project only the fixed live frame and qualify its complete dense array;
   * opaque values remain untraversed until the next original identity join. */
  const frame = async (role: keyof typeof EXPRESSIONS, callFrameId: string, count: number): Promise<Readonly<{ tuple: string; values: ReturnType<typeof array> }>> => { const tuple = result(await send(validate({ phase: `inverse-native-get-task-accept-frame-${role}`, method: "Debugger.evaluateOnCallFrame", params: { callFrameId, expression: EXPRESSIONS[role], objectGroup: FLAGS.objectGroup, silent: true, generatePreview: false, throwOnSideEffect: true, returnByValue: false, includeCommandLineAPI: false } })), count); return Object.freeze({ tuple, values: array(await props(role, tuple), count) }); };
  current(); const entry = await frame("entry", selected.entryFrame, 3); const service = await frame("service", selected.serviceFrame, 7); const event = await frame("event", selected.eventFrame, 2); const value = event.values.get("1"); need(value?.type === "object" && value.className === "MessageEvent" && value.description === "MessageEvent" && value.subtype === undefined && value.objectId !== undefined); qualifyEvent(await props("event-value", value.objectId));
  const members = result(await send(validate({ phase: "inverse-native-get-task-accept-members", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: b.channel.events, functionDeclaration: P.members, arguments: [{ objectId: value.objectId }], returnByValue: false } })), 12); const memberValues = array(await props("members", members), 12); const getterRoles = ["target", "type", "trusted", "data", "origin", "source", "current-target", "event-phase"] as const;
  for (const [index, role] of getterRoles.entries()) { const getter = memberValues.get(String(index + 3)); need(getter !== undefined); const id = callable({ result: getter }, index + 1); metadata(await props(role, id), index + 1); }
  const proof = result(await send(validate({ phase: "inverse-native-get-task-accept-capture", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: event.tuple, functionDeclaration: P.capture, arguments: [{ objectId: b.intrinsics }, { objectId: b.channel.bound }, { objectId: b.prepared.capture }, { objectId: b.prepared.link }, { objectId: entry.tuple }, { objectId: service.tuple }, { objectId: members }, { value: b.expected }], returnByValue: false } })), 10); const values = array(await props("proof", proof), 10); need(values.get("9")?.type === "function");
  truth(await send(validate({ phase: "inverse-native-get-task-accept-reprove", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: proof, functionDeclaration: P.reprove, arguments: [], returnByValue: true } }))); current(); need(normal === LIMIT.normal && helpers === LIMIT.helpers); return Object.freeze({ proof, entry: entry.tuple, service: service.tuple, event: event.tuple, normal: 20, helpers: 6, getBodyAuthorized: false, runtimeJobIssued: false });
}
