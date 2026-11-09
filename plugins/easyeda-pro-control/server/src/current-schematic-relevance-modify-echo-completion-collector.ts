/** Passive actual UI callback/CM observations. Every returned receipt is data;
 * the owner retains the Event, sender, control and SDK completion authority. */
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_COMPLETION_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_COMPLETION_FLAGS as FLAGS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_COMPLETION_REQUESTS as REQUESTS, validateCurrentSchematicRelevanceModifyEchoCompletionCommand as validate } from "./current-schematic-relevance-modify-echo-completion-protocol.ts";
import type { CurrentSchematicRelevanceModifyEchoCompletionCommand as Command } from "./current-schematic-relevance-modify-echo-completion-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CONTROL_FLAGS as CONTROL_FLAGS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CONTROL_FRAMES as FRAMES, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_UI_ROLES as UI, validateCurrentSchematicRelevanceModifyEchoControlCommand as controlValidate } from "./current-schematic-relevance-modify-echo-control-protocol.ts";
import type { CurrentSchematicRelevanceModifyEchoControlCommand as ControlCommand } from "./current-schematic-relevance-modify-echo-control-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_EVENT_CALLS as EVENT_CALLS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_EVENT_FLAGS as EVENT_FLAGS, validateCurrentSchematicRelevanceModifyEchoEventCommand as eventValidate } from "./current-schematic-relevance-modify-echo-event-protocol.ts";
import type { CurrentSchematicRelevanceModifyEchoEventCommand as EventCommand } from "./current-schematic-relevance-modify-echo-event-protocol.ts";
import type { CurrentSchematicRelevanceModifyEchoEventPrepared, CurrentSchematicRelevanceModifyEchoReceiverPrepared } from "./current-schematic-relevance-modify-echo-event-collector.ts";
import type { CurrentSchematicRelevanceModifyEchoPrepared } from "./current-schematic-relevance-modify-echo-collector.ts";
import { reproveCurrentSchematicRelevancePublicationReturned } from "./current-schematic-relevance-publication-body-collector.ts";
import type { CurrentSchematicRelevancePublicationBodyHost, CurrentSchematicRelevancePublicationBodyInputs, CurrentSchematicRelevancePublicationCleared } from "./current-schematic-relevance-publication-body-collector.ts";
import { currentSchematicRelevanceUiPublicationCapture as capture, currentSchematicRelevanceUiPublicationHandle as handle, currentSchematicRelevanceUiPublicationTrue as truth, currentSchematicRelevanceUiPublicationTuple as tuple } from "./current-schematic-relevance-ui-publication-replies.ts";
import { currentSchematicRelevancePublicationNativeRecord as record } from "./current-schematic-relevance-publication-native-replies.ts";
import { requireCurrentSchematicRelevanceConsistencyCalleeDescription as description, decodeCurrentSchematicRelevanceConsistencyCalleeFunction as metadata } from "./current-schematic-relevance-consistency-callee-replies.ts";
import { decodeCurrentSchematicRelevanceNotificationPromise as promiseMetadata, captureCurrentSchematicRelevanceNotificationPromiseRemote as promiseRemote, captureCurrentSchematicRelevanceNotificationPromiseResult as promiseResult } from "./current-schematic-relevance-notification-replies.ts";

type PublicationCommand = Parameters<CurrentSchematicRelevancePublicationBodyHost["request"]>[0];
type Role = typeof UI[number];
export interface CurrentSchematicRelevanceModifyEchoCompletionHost { readonly current: () => void; readonly request: (command: Command | ControlCommand | EventCommand | PublicationCommand) => Promise<unknown> }
export interface CurrentSchematicRelevanceModifyEchoCompletionInputs {
  readonly body: CurrentSchematicRelevancePublicationBodyInputs; readonly returned: CurrentSchematicRelevancePublicationCleared;
  readonly echo: CurrentSchematicRelevanceModifyEchoPrepared; readonly event: CurrentSchematicRelevanceModifyEchoEventPrepared; readonly receiver: CurrentSchematicRelevanceModifyEchoReceiverPrepared;
}
const authority = Object.freeze({ ownershipIssued: false, originalBodyHeld: false, callbackReceiverVerified: false, trustedEventQualified: false, nativeSenderVerified: false, nativeDeliveryVerified: false, echoSuppressionVerified: false, continuationAuthorized: false, workerAuthorized: false, workerCompleted: false, publicationCompleted: false, modifyAuthorized: false, modifyCompleted: false, saveAuthorized: false } as const);
export interface CurrentSchematicRelevanceModifyEchoCompletionBefore extends Readonly<typeof authority> {
  readonly seedObjectId: string; readonly bucketObjectId: string; readonly pendingObjectId: string; readonly methodsObjectId: string; readonly qualifiedObjectId: string; readonly snapshotObjectId: string; readonly originalRequests: number;
}
export interface CurrentSchematicRelevanceModifyEchoCompletionHeld extends Readonly<typeof authority> {
  readonly role: Role; readonly frameObjectId: string; readonly originalRequests: number; readonly taskPromiseObjectId: string | null; readonly taskPromiseFulfilled: boolean; readonly matchingTemporaryEntryDeleted: boolean;
}
interface Read { readonly id: string; readonly fields: ReturnType<typeof tuple> }
function need(value: boolean): asserts value { if (!value) { throw new Error("SCH_ECHO_COMPLETION_COLLECTOR"); } }

/** Keep old publisher snapshots and the new exact CM graph in one bounded
 * passive request view, with original owner checks around every await. */
function commands(host: CurrentSchematicRelevanceModifyEchoCompletionHost, input: CurrentSchematicRelevanceModifyEchoCompletionInputs, limit: number): {
  readonly send: (command: Command | ControlCommand | EventCommand | PublicationCommand) => Promise<unknown>; readonly props: (id: string) => Promise<unknown>; readonly call: (role: string, id: string, args: readonly string[]) => Promise<unknown>; readonly read: (role: string, id: string, args: readonly string[], size?: number) => Promise<Read>; readonly old: () => Promise<void>; readonly event: () => Promise<void>; readonly iterator: () => Promise<void>; readonly count: () => number;
} {
  let count = 0;
  const send = async (command: Command | ControlCommand | EventCommand | PublicationCommand): Promise<unknown> => { host.current(); need(count < limit); count += 1; const raw = await host.request(command); host.current(); return raw; };
  const props = (objectId: string): Promise<unknown> => send(validate({ phase: "modify-echo-completion-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }));
  const call = (role: string, id: string, args: readonly string[]): Promise<unknown> => { const row = CALLS.find(value => value[0] === role); need(row !== undefined && row[2] === args.length); return send(validate({ phase: "modify-echo-completion-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: id, functionDeclaration: row[1], arguments: args.map(objectId => ({ objectId })), returnByValue: row[3], awaitPromise: false, userGesture: false } })); };
  const read = async (role: string, id: string, args: readonly string[], size?: number): Promise<Read> => { const value = capture(await call(role, id, args)); return Object.freeze({ id: value, fields: tuple(await props(value), size) }); };
  const old = async (): Promise<void> => { const start = count; const used = await reproveCurrentSchematicRelevancePublicationReturned({ current: host.current, request: send }, input.body, input.returned); need(count - start === used); };
  const event = async (): Promise<void> => {
    const make = (role: "read" | "same-read", args: readonly string[]): EventCommand => { const row = EVENT_CALLS.find(value => value[0] === role); need(row !== undefined && row[2] === args.length); return eventValidate({ phase: "modify-echo-event-call", role, method: "Runtime.callFunctionOn", params: { ...EVENT_FLAGS, objectId: input.echo.nativeObjectId, functionDeclaration: row[1], arguments: args.map(objectId => ({ objectId })), returnByValue: row[3], awaitPromise: false, userGesture: false } }); };
    const actual = capture(await send(make("read", [input.event.frameObjectId, input.body.native.rootsObjectId, input.echo.nativeConstructorsObjectId, input.echo.nativePrototypesObjectId, input.echo.nativeMembersObjectId, input.event.qualifiedObjectId, input.event.eventMembersObjectId, input.event.originObjectId]))); tuple(await props(actual), 2); truth(await send(make("same-read", [actual, input.event.readObjectId])));
  };
  const iterator = async (): Promise<void> => { const sdk = input.body.sdk; truth(await call("iterator", sdk.normal.iteratorObjectId, [sdk.raw.nativeObjectId, sdk.prefix.intrinsicFunctionsObjectId, sdk.prefix.intrinsicObjectsObjectId, sdk.active.moduleObjectId])); };
  return { send, props, call, read, old, event, iterator, count: (): number => count };
}

/** Merge only previously qualified original roots, rechecking both complete
 * old snapshots around the new seal. Fresh metadata cannot adopt peer drift. */
async function graph(c: ReturnType<typeof commands>, input: CurrentSchematicRelevanceModifyEchoCompletionInputs): Promise<Readonly<{ grow: (id: string) => Promise<void>; unchanged: () => Promise<void>; qualified: () => string; snapshot: () => string }>> {
  const raw = input.body.sdk.raw.nativeObjectId; const before = async (): Promise<void> => { truth(await c.call("same-snapshot", input.receiver.snapshotObjectId, [raw, input.receiver.qualifiedObjectId])); truth(await c.call("same-snapshot", input.event.snapshotObjectId, [raw, input.event.qualifiedObjectId])); };
  await before(); const merged = await c.read("merge", input.receiver.qualifiedObjectId, [raw, input.event.qualifiedObjectId]); let qualified = merged.id; const initial = await c.read("snapshot", qualified, [raw]); let snapshot = initial.id; await before(); let stages = 0; let objects = 0;
  const unchanged = async (): Promise<void> => { truth(await c.call("same-snapshot", snapshot, [raw, qualified])); };
  const grow = async (id: string): Promise<void> => { stages += 1; need(stages <= REQUESTS.graphStages); let candidate = id;
    for (let wave = 0; wave < REQUESTS.waves; wave += 1) { await unchanged(); const fresh = await c.read("novel", candidate, [raw, qualified]); if (fresh.fields.length === 0) { return; } objects += fresh.fields.length; need(objects <= REQUESTS.objects); for (const value of fresh.fields) { record(await c.props(handle(value)), value); } await unchanged(); const grown = await c.read("merge", qualified, [raw, fresh.id]); const parents = await c.read("prototypes", fresh.id, [raw]); await unchanged(); const next = await c.read("snapshot", grown.id, [raw]); await unchanged(); snapshot = next.id; qualified = grown.id; candidate = parents.id; }
    throw new Error("SCH_ECHO_COMPLETION_PROTOTYPE_BOUND");
  };
  return { grow, unchanged, qualified: (): string => qualified, snapshot: (): string => snapshot };
}
/** Bind the exact temporary local pair issued by the earlier original local
 * change, plus each reached CM callee. Unknown bucket additions refuse. */
export async function collectCurrentSchematicRelevanceModifyEchoCompletionBefore(host: CurrentSchematicRelevanceModifyEchoCompletionHost, input: CurrentSchematicRelevanceModifyEchoCompletionInputs): Promise<CurrentSchematicRelevanceModifyEchoCompletionBefore> {
  const c = commands(host, input, REQUESTS.before); const native = input.echo.nativeObjectId; await c.old(); await c.event(); await c.iterator(); const g = await graph(c, input); const q = g.qualified; const expected = input.event.expectedObjectId; const original = input.body.sdk.cm.nestedObjectId; tuple(await c.props(original), 2);
  const seed = await c.read("seed", native, [input.receiver.bindingsObjectId, q()], 2); await g.grow(seed.id);
  const bucket = await c.read("bucket", native, [seed.id, expected, original, q()], 1); await g.grow(bucket.id);
  const pending = await c.read("pending", native, [bucket.id, expected, original, q()], 1); await g.grow(pending.id);
  const methods = await c.read("methods", native, [input.receiver.bindingsObjectId, q()], 4); await g.grow(methods.id);
  for (const [index, role] of [[0, "consistencyRemoteChange"], [1, "consistencySetMaxTicket"], [2, "consistencySetDocMaxTicket"], [3, "consistencyPublishChange"]] as const) { const fn = methods.fields[index]; need(fn?.type === "function" && typeof fn.description === "string"); description(fn.description, input.body.sdk.variant, role); metadata(await c.props(handle(fn)), input.body.sdk.variant, role, input.body.sdk.script); }
  const proof = async (): Promise<void> => { truth(await c.call("before", native, [input.receiver.bindingsObjectId, seed.id, bucket.id, pending.id, expected, original, methods.id, q()])); };
  await proof(); await g.unchanged(); await c.event(); await c.iterator(); await c.old(); await proof(); await g.unchanged();
  return Object.freeze({ ...authority, seedObjectId: seed.id, bucketObjectId: bucket.id, pendingObjectId: pending.id, methodsObjectId: methods.id, qualifiedObjectId: q(), snapshotObjectId: g.snapshot(), originalRequests: c.count() });
}

/** Match the actual held frame to the selected source arguments and original
 * Event. Later returns admit only the one source-derived CM deletion. */
export async function collectCurrentSchematicRelevanceModifyEchoCompletionHeld(host: CurrentSchematicRelevanceModifyEchoCompletionHost, frameId: string, role: Role, input: CurrentSchematicRelevanceModifyEchoCompletionInputs, before: CurrentSchematicRelevanceModifyEchoCompletionBefore, asyncReturn: unknown = null, originalPromise: string | null = null): Promise<CurrentSchematicRelevanceModifyEchoCompletionHeld> {
  const index = UI.indexOf(role); need(index !== -1); const removed = index >= UI.indexOf("uiRemoteReturned"); const c = commands(host, input, REQUESTS.perStep); const sdk = input.body.sdk; const native = input.echo.nativeObjectId;
  const unchanged = async (): Promise<void> => { if (removed) { truth(await c.call("deletion", before.snapshotObjectId, [sdk.raw.nativeObjectId, before.qualifiedObjectId, before.bucketObjectId, before.pendingObjectId, input.event.expectedObjectId, sdk.cm.nestedObjectId])); } else { truth(await c.call("same-snapshot", before.snapshotObjectId, [sdk.raw.nativeObjectId, before.qualifiedObjectId])); truth(await c.call("before", native, [input.receiver.bindingsObjectId, before.seedObjectId, before.bucketObjectId, before.pendingObjectId, input.event.expectedObjectId, sdk.cm.nestedObjectId, before.methodsObjectId, before.qualifiedObjectId])); } };
  await c.old(); await unchanged(); await c.event(); await c.iterator(); const actual = capture(await c.send(controlValidate({ phase: "modify-echo-control-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...CONTROL_FLAGS, callFrameId: frameId, expression: FRAMES[role], returnByValue: false, includeCommandLineAPI: false } }))); tuple(await c.props(actual));
  let program = "handler"; if (role === "uiExecute" || role === "uiExecuteReturned") { program = "task"; } else if (role === "uiCallback" || role === "uiCallbackReturned") { program = "callback"; } else if (role === "uiPush" || role === "uiPushReturned") { program = "push"; } else if (role === "uiPublish" || role === "uiPublishReturned") { program = "publish"; } else if (role === "uiRemote" || role === "uiRemoteReturned") { program = "remote"; }
  let args: readonly string[] = [actual, input.event.readObjectId, input.event.expectedObjectId, input.receiver.bindingsObjectId, before.qualifiedObjectId];
  if (program === "handler") { args = [actual, input.event.frameObjectId]; } else if (program === "task") { args = [actual, input.receiver.taskTupleObjectId, input.event.readObjectId, input.event.expectedObjectId, input.receiver.bindingsObjectId, before.qualifiedObjectId]; }
  truth(await c.call(program, native, args)); let taskPromiseObjectId = originalPromise; let taskPromiseFulfilled = false;
  if (role === "uiExecuteReturned") { const remote = promiseRemote(asyncReturn); const state = promiseMetadata(await c.props(remote.objectId), remote); truth(await c.call("promise", native, [remote.objectId, sdk.clone.nativeGraph.roots, sdk.clone.nativeGraph.members])); const retained = promiseResult(await c.call("promise-retain", remote.objectId, [])); const retainedState=promiseMetadata(await c.props(retained.objectId),retained); truth(await c.call("promise",native,[retained.objectId,sdk.clone.nativeGraph.roots,sdk.clone.nativeGraph.members])); taskPromiseObjectId=retained.objectId; taskPromiseFulfilled=state.state==="fulfilled"&&retainedState.state==="fulfilled"; }
  if (role === "uiHandlerReturned") { need(taskPromiseObjectId !== null); const remote = { type: "object", subtype: "promise", className: "Promise", description: "Promise", objectId: taskPromiseObjectId }; const state = promiseMetadata(await c.props(taskPromiseObjectId), remote); need(state.state === "fulfilled"); truth(await c.call("promise", native, [taskPromiseObjectId, sdk.clone.nativeGraph.roots, sdk.clone.nativeGraph.members])); taskPromiseFulfilled = true; }
  await c.event(); await c.iterator(); await c.old(); await unchanged();
  return Object.freeze({ ...authority, role, frameObjectId: actual, originalRequests: c.count(), taskPromiseObjectId, taskPromiseFulfilled, matchingTemporaryEntryDeleted: removed });
}
