/** Passive original ticket and enclosing-return observations. The original
 * Core owns every body, cancellation and continuation; these are data only. */
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_RETURN_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_RETURN_FLAGS as FLAGS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_RETURN_REQUESTS as REQUESTS, validateCurrentSchematicRelevanceModifyReturnCommand as validate } from "./current-schematic-relevance-modify-return-protocol.ts";
import type { CurrentSchematicRelevanceModifyReturnCommand as Command } from "./current-schematic-relevance-modify-return-protocol.ts";
import { currentSchematicRelevanceModifyReturnTimer as timer } from "./current-schematic-relevance-modify-return-replies.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_FLAGS as CM_FLAGS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_FRAMES as CM_FRAMES, validateCurrentSchematicRelevanceModifyCmControlCommand as cmValidate } from "./current-schematic-relevance-modify-cm-control-protocol.ts";
import type { CurrentSchematicRelevanceModifyCmControlCommand as CmCommand } from "./current-schematic-relevance-modify-cm-control-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_CONTROL_FLAGS as CANVAS_FLAGS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_FRAMES as CANVAS_FRAMES, validateCurrentSchematicRelevanceModifyCanvasControlCommand as canvasValidate } from "./current-schematic-relevance-modify-canvas-control-protocol.ts";
import type { CurrentSchematicRelevanceModifyCanvasControlCommand as CanvasCommand } from "./current-schematic-relevance-modify-canvas-control-protocol.ts";
import { currentSchematicRelevanceUiPublicationCapture as capture, currentSchematicRelevanceUiPublicationHandle as handle, currentSchematicRelevanceUiPublicationTrue as truth, currentSchematicRelevanceUiPublicationTuple as tuple } from "./current-schematic-relevance-ui-publication-replies.ts";
import { decodeCurrentSchematicRelevanceModifyTicketCallee as callee, decodeCurrentSchematicRelevanceModifyTicketNative as native } from "./current-schematic-relevance-modify-ticket-replies.ts";
import type { CurrentSchematicRelevanceModifyWorkerPrepared } from "./current-schematic-relevance-modify-worker-collector.ts";
import type { CurrentSchematicRelevanceModifyCmBefore, CurrentSchematicRelevanceModifyCmEntry } from "./current-schematic-relevance-modify-cm-collector.ts";
import type { CurrentSchematicRelevanceModifyEventPrepared } from "./current-schematic-relevance-modify-event-collector.ts";
import { currentSchematicRelevanceSdkGatePromise as promise } from "./current-schematic-relevance-sdk-gate-replies.ts";

export interface CurrentSchematicRelevanceModifyReturnHost { readonly current: () => void; readonly request: (command: Command | CmCommand | CanvasCommand) => Promise<unknown> }
/** Original Core supplies these existing handles, without an owner issuer or
 * permission inferred from this structural input or any returned receipt. */
export interface CurrentSchematicRelevanceModifyReturnInputs {
  readonly worker: CurrentSchematicRelevanceModifyWorkerPrepared; readonly cmBefore: CurrentSchematicRelevanceModifyCmBefore; readonly cmEntry: CurrentSchematicRelevanceModifyCmEntry;
  readonly cmDelta: Readonly<{ frameObjectId: string }>; readonly event: CurrentSchematicRelevanceModifyEventPrepared; readonly batchFrameObjectId: string;
  readonly canvas: Readonly<{ rootsObjectId: string; nativePartsObjectId: string; createdObjectId: string; resolverObjectId: string; promiseObjectId: string; qualifiedObjectId: string; snapshotObjectId: string; collectionsObjectId: string; collectionSnapshotObjectId: string; timerId: number }>;
}
const authority = Object.freeze({ ownershipIssued: false, originalWorkerOwnerVerified: false, originalConsistencyVerified: false, callbackReceiverVerified: false, originalBodyHeld: false, bodyAuthorized: false, cancellationAuthorized: false, nativeTimerOwnershipVerified: false, nativeTimerDeliveryVerified: false, trustedEventQualified: false, nativeDeliveryVerified: false, deliveryVerified: false, nativeSenderVerified: false, continuationAuthorized: false, senderAuthorized: false, deliveryAuthorized: false, publicationAuthorized: false, publicationCompleted: false, workerAuthorized: false, workerCompleted: false, modifyCompleted: false, modifyAuthorized: false, saveAuthorized: false } as const);
interface Receipt extends Readonly<typeof authority> { readonly frameObjectId: string; readonly originalRequests: number }
export interface CurrentSchematicRelevanceModifyReturnBefore extends Receipt {
  readonly callerFrameObjectId: string; readonly projectTupleObjectId: string; readonly projectObjectId: string; readonly methodsObjectId: string; readonly nativesObjectId: string;
  readonly qualifiedObjectId: string; readonly snapshotObjectId: string; readonly collectionsObjectId: string; readonly collectionSnapshotObjectId: string; readonly promiseObjectId: string;
}
export interface CurrentSchematicRelevanceModifyReturnIntroduced extends Receipt { readonly before: CurrentSchematicRelevanceModifyReturnBefore; readonly timerId: number; readonly snapshotObjectId: string; readonly qualifiedObjectId: string; readonly promiseObjectId: string }
export interface CurrentSchematicRelevanceModifyReturnCleared extends Receipt { readonly before: CurrentSchematicRelevanceModifyReturnBefore; readonly introduced: CurrentSchematicRelevanceModifyReturnIntroduced; readonly timerId: number }
export interface CurrentSchematicRelevanceModifyReturnWebsocket extends Receipt { readonly before: CurrentSchematicRelevanceModifyReturnBefore; readonly cleared: CurrentSchematicRelevanceModifyReturnCleared; readonly callerFrameObjectId: string }
export type CurrentSchematicRelevanceModifyReturnObserved = Receipt;
export interface CurrentSchematicRelevanceModifyReturnBatchReturned extends Receipt { readonly qualifiedObjectId: string; readonly snapshotObjectId: string; readonly collectionsObjectId: string; readonly collectionSnapshotObjectId: string }
export interface CurrentSchematicRelevanceModifyReturnHandlerReturned extends Receipt { readonly readObjectId: string }
export interface CurrentSchematicRelevanceModifyReturnTimerEntry extends Receipt { readonly promiseObjectId: string; readonly resolverObjectId: string }
interface Read { readonly id: string; readonly fields: ReturnType<typeof tuple> }
type FrameRole = "ticket" | "ticketReturned" | "onChange" | "canWs" | "canWsReturned" | "remoteReturned" | "batchReturned" | "handlerReturned" | "timer";
interface Commands { readonly call: (role: string, ids: readonly string[]) => Promise<unknown>; readonly read: (role: string, ids: readonly string[], size?: number) => Promise<Read>; readonly props: (id: string) => Promise<unknown>; readonly frame: (id: string, role: FrameRole) => Promise<Read>; readonly count: () => number }
function need(value: boolean): asserts value { if (!value) { throw new Error("SCH_MODIFY_RETURN_COLLECTOR"); } }

/** Every dispatch is either a readonly fixed recipe, property read or one
 * exact existing frame capture. Control phases cannot enter this sender. */
function commands(host: CurrentSchematicRelevanceModifyReturnHost, input: CurrentSchematicRelevanceModifyReturnInputs, limit: number): Commands {
  need(Number.isSafeInteger(input.canvas.timerId) && input.canvas.timerId > 0 && input.canvas.timerId <= 2_147_483_647);
  let count = 0;
  const send = async (command: Command | CmCommand | CanvasCommand): Promise<unknown> => {
    need(command.method === "Runtime.getProperties" || command.method === "Debugger.evaluateOnCallFrame" || command.phase === "modify-return-call" && command.params.throwOnSideEffect);
    host.current(); need(count < limit); count += 1; const reply = await host.request(command); host.current(); return reply;
  };
  const props = (objectId: string): Promise<unknown> => send(validate({ phase: "modify-return-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }));
  const call = (role: string, ids: readonly string[]): Promise<unknown> => { const row = CALLS.find(value => value[0] === role); need(row !== undefined && row[2] === ids.length); return send(validate({ phase: "modify-return-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: input.worker.nativeObjectId, functionDeclaration: row[1], arguments: ids.map(objectId => ({ objectId })), returnByValue: row[3], awaitPromise: false, userGesture: false } })); };
  const read = async (role: string, ids: readonly string[], size?: number): Promise<Read> => { const id = capture(await call(role, ids)); return Object.freeze({ id, fields: tuple(await props(id), size) }); };
  const frame = async (callFrameId: string, role: FrameRole): Promise<Read> => {
    let command: CmCommand | CanvasCommand, size = 2;
    if (role === "timer") { size = 3; command = canvasValidate({ phase: "modify-canvas-control-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...CANVAS_FLAGS, callFrameId, expression: CANVAS_FRAMES.timer, returnByValue: false, includeCommandLineAPI: false } }); }
    else if (role === "batchReturned" || role === "handlerReturned") { command = cmValidate({ phase: "modify-cm-control-batch-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...CM_FLAGS, callFrameId, expression: "[this,s]", returnByValue: false, includeCommandLineAPI: false } }); }
    else { if (role === "onChange") { size = 14; } else if (role === "remoteReturned") { size = 18; } command = cmValidate({ phase: "modify-cm-control-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...CM_FLAGS, callFrameId, expression: CM_FRAMES[role], returnByValue: false, includeCommandLineAPI: false } }); }
    const id = capture(await send(command)); return Object.freeze({ id, fields: tuple(await props(id), size) });
  };
  return { call, read, props, frame, count: (): number => count };
}
const same = async (c: Commands, snapshot: string, qualified: string): Promise<void> => { truth(await c.call("same", [snapshot, qualified])); };
const collections = async (c: Commands, input: CurrentSchematicRelevanceModifyReturnInputs, qualified: string = input.canvas.qualifiedObjectId): Promise<void> => { truth(await c.call("collection-same", [input.canvas.collectionSnapshotObjectId, input.canvas.collectionsObjectId, input.cmBefore.nativeMethodsObjectId, qualified])); };
const registered = async (c: Commands, input: CurrentSchematicRelevanceModifyReturnInputs): Promise<void> => { await same(c, input.canvas.snapshotObjectId, input.canvas.qualifiedObjectId); await collections(c, input); };
const pending = async (c: Commands, id: string): Promise<void> => { promise(await c.props(id), "pending"); };
const joined = async (c: Commands, frame: string, original: string): Promise<void> => { truth(await c.call("tuple", [frame, original])); };
function beforeMatches(input: CurrentSchematicRelevanceModifyReturnInputs, before: CurrentSchematicRelevanceModifyReturnBefore): void { need(before.qualifiedObjectId === input.canvas.qualifiedObjectId && before.snapshotObjectId === input.canvas.snapshotObjectId && before.collectionsObjectId === input.canvas.collectionsObjectId && before.collectionSnapshotObjectId === input.canvas.collectionSnapshotObjectId && before.promiseObjectId === input.canvas.promiseObjectId); }

/** Match original PROJECT, ticket formals and fresh onChange caller before
 * any timer exists. Native timer functions are requalified without calling them. */
export async function collectCurrentSchematicRelevanceModifyReturnBefore(host: CurrentSchematicRelevanceModifyReturnHost, ticketFrameId: string, freshOnChangeCallerFrameId: string, input: CurrentSchematicRelevanceModifyReturnInputs): Promise<CurrentSchematicRelevanceModifyReturnBefore> {
  const c = commands(host, input, REQUESTS.beforeReads); await registered(c, input); await pending(c, input.canvas.promiseObjectId);
  const frame = await c.frame(ticketFrameId, "ticket"); const caller = await c.frame(freshOnChangeCallerFrameId, "onChange"); await joined(c, caller.id, input.cmDelta.frameObjectId);
  const project = await c.read("project", [input.canvas.rootsObjectId, input.canvas.qualifiedObjectId], 1); const projectObjectId = handle(project.fields[0]);
  const methods = await c.read("methods", [projectObjectId, input.canvas.qualifiedObjectId], 3), natives = await c.read("natives", [input.canvas.qualifiedObjectId], 3);
  for (const [index, role] of [[1, "localPublishTicket"], [2, "canWsPublish"]] as const) { const actual = methods.fields[index]; need(actual !== undefined); callee(await c.props(handle(actual)), actual, role, input.worker.scriptId); }
  for (const [index, role] of [[1, "setTimeout"], [2, "clearTimeout"]] as const) { const actual = natives.fields[index]; need(actual !== undefined); native(await c.props(handle(actual)), actual, role); }
  const proof = async (): Promise<void> => { truth(await c.call("native-proof", [natives.id, input.canvas.qualifiedObjectId])); truth(await c.call("ticket-before", [frame.id, projectObjectId, methods.id, natives.id, input.canvas.qualifiedObjectId])); };
  await proof(); await registered(c, input); await joined(c, caller.id, input.cmDelta.frameObjectId); await proof(); await pending(c, input.canvas.promiseObjectId); await registered(c, input);
  return Object.freeze({ ...authority, frameObjectId: frame.id, callerFrameObjectId: caller.id, projectTupleObjectId: project.id, projectObjectId, methodsObjectId: methods.id, nativesObjectId: natives.id, qualifiedObjectId: input.canvas.qualifiedObjectId, snapshotObjectId: input.canvas.snapshotObjectId, collectionsObjectId: input.canvas.collectionsObjectId, collectionSnapshotObjectId: input.canvas.collectionSnapshotObjectId, promiseObjectId: input.canvas.promiseObjectId, originalRequests: c.count() });
}

/** Observe only the exact null-to-positive PROJECT timer delta after its
 * original body. The pending Canvas Promise and its distinct timer survive. */
export async function collectCurrentSchematicRelevanceModifyReturnIntroduced(host: CurrentSchematicRelevanceModifyReturnHost, ticketReturnFrameId: string, input: CurrentSchematicRelevanceModifyReturnInputs, before: CurrentSchematicRelevanceModifyReturnBefore): Promise<CurrentSchematicRelevanceModifyReturnIntroduced> {
  beforeMatches(input, before); const c = commands(host, input, REQUESTS.introducedReads), frame = await c.frame(ticketReturnFrameId, "ticketReturned"); await joined(c, frame.id, before.frameObjectId); let timerId = 0;
  const exact = async (): Promise<void> => { const actual = timer(await c.call("ticket-introduced", [before.snapshotObjectId, before.qualifiedObjectId, before.projectObjectId])); need(actual !== input.canvas.timerId && (timerId === 0 || actual === timerId)); timerId = actual; await collections(c, input); };
  await exact(); await pending(c, input.canvas.promiseObjectId); const snapshot = await c.read("snapshot", [before.qualifiedObjectId]); await exact(); await same(c, snapshot.id, before.qualifiedObjectId); await pending(c, input.canvas.promiseObjectId); await exact();
  return Object.freeze({ ...authority, before, frameObjectId: frame.id, timerId, snapshotObjectId: snapshot.id, qualifiedObjectId: before.qualifiedObjectId, promiseObjectId: input.canvas.promiseObjectId, originalRequests: c.count() });
}

/** Observe the original Core's separate cancellation effect. This collector
 * never calls clearTimeout and cannot infer timer delivery or cancellation custody. */
export async function collectCurrentSchematicRelevanceModifyReturnCleared(host: CurrentSchematicRelevanceModifyReturnHost, ticketReturnFrameId: string, input: CurrentSchematicRelevanceModifyReturnInputs, before: CurrentSchematicRelevanceModifyReturnBefore, introduced: CurrentSchematicRelevanceModifyReturnIntroduced): Promise<CurrentSchematicRelevanceModifyReturnCleared> {
  beforeMatches(input, before); need(introduced.before === before && introduced.qualifiedObjectId === before.qualifiedObjectId); const c = commands(host, input, REQUESTS.cancelledReads), frame = await c.frame(ticketReturnFrameId, "ticketReturned"); await joined(c, frame.id, introduced.frameObjectId);
  const exact = async (): Promise<void> => { need(timer(await c.call("ticket-cleared", [introduced.snapshotObjectId, before.qualifiedObjectId, before.projectObjectId])) === introduced.timerId); await registered(c, input); };
  await exact(); await pending(c, input.canvas.promiseObjectId); await joined(c, frame.id, before.frameObjectId); await exact();
  return Object.freeze({ ...authority, before, introduced, frameObjectId: frame.id, timerId: introduced.timerId, originalRequests: c.count() });
}

/** Keep the actual private flag false at the original canWsPublish entry
 * while matching the fresh onChange caller and unchanged registered state. */
export async function collectCurrentSchematicRelevanceModifyReturnWebsocket(host: CurrentSchematicRelevanceModifyReturnHost, canWsFrameId: string, freshOnChangeCallerFrameId: string, input: CurrentSchematicRelevanceModifyReturnInputs, before: CurrentSchematicRelevanceModifyReturnBefore, cleared: CurrentSchematicRelevanceModifyReturnCleared): Promise<CurrentSchematicRelevanceModifyReturnWebsocket> {
  beforeMatches(input, before); need(cleared.before === before); const c = commands(host, input, REQUESTS.websocketReads); await registered(c, input);
  const frame = await c.frame(canWsFrameId, "canWs"); const caller = await c.frame(freshOnChangeCallerFrameId, "onChange");
  const proof = async (): Promise<void> => { await joined(c, caller.id, input.cmDelta.frameObjectId); truth(await c.call("websocket-excluded", [frame.id, before.projectObjectId, before.methodsObjectId, before.qualifiedObjectId])); };
  await proof(); await registered(c, input); await proof(); await pending(c, input.canvas.promiseObjectId); await registered(c, input);
  return Object.freeze({ ...authority, before, cleared, frameObjectId: frame.id, callerFrameObjectId: caller.id, originalRequests: c.count() });
}

/** Rejoin the same receiver/private-flag tuple at normal canWsPublish return. */
export async function collectCurrentSchematicRelevanceModifyReturnWebsocketReturned(host: CurrentSchematicRelevanceModifyReturnHost, frameId: string, input: CurrentSchematicRelevanceModifyReturnInputs, before: CurrentSchematicRelevanceModifyReturnBefore, websocket: CurrentSchematicRelevanceModifyReturnWebsocket): Promise<CurrentSchematicRelevanceModifyReturnObserved> {
  beforeMatches(input, before); need(websocket.before === before); const c = commands(host, input, REQUESTS.websocketReturnReads); await registered(c, input); const frame = await c.frame(frameId, "canWsReturned"); await joined(c, frame.id, websocket.frameObjectId); truth(await c.call("websocket-excluded", [frame.id, before.projectObjectId, before.methodsObjectId, before.qualifiedObjectId])); await registered(c, input); await pending(c, input.canvas.promiseObjectId); await registered(c, input);
  return Object.freeze({ ...authority, frameObjectId: frame.id, originalRequests: c.count() });
}

/** Remote return preserves the original 18 formals and registered baseline. */
export async function collectCurrentSchematicRelevanceModifyReturnRemoteReturned(host: CurrentSchematicRelevanceModifyReturnHost, frameId: string, input: CurrentSchematicRelevanceModifyReturnInputs): Promise<CurrentSchematicRelevanceModifyReturnObserved> {
  const c = commands(host, input, REQUESTS.remoteReturnReads); await registered(c, input); const frame = await c.frame(frameId, "remoteReturned"); await joined(c, frame.id, input.cmEntry.frameObjectId); await pending(c, input.canvas.promiseObjectId); await registered(c, input);
  return Object.freeze({ ...authority, frameObjectId: frame.id, originalRequests: c.count() });
}

/** The original batch tail may add only own row.length=0. Its pend array,
 * every peer descriptor/Symbol and ordered collection remain unchanged. */
export async function collectCurrentSchematicRelevanceModifyReturnBatchReturned(host: CurrentSchematicRelevanceModifyReturnHost, frameId: string, input: CurrentSchematicRelevanceModifyReturnInputs): Promise<CurrentSchematicRelevanceModifyReturnBatchReturned> {
  const c = commands(host, input, REQUESTS.batchReturnReads), frame = await c.frame(frameId, "batchReturned"); await joined(c, frame.id, input.batchFrameObjectId);
  const exact = async (): Promise<void> => { truth(await c.call("parent-delta", [input.canvas.snapshotObjectId, input.canvas.qualifiedObjectId, input.event.readObjectId, input.cmDelta.frameObjectId])); await collections(c, input); };
  await exact(); const snapshot = await c.read("snapshot", [input.canvas.qualifiedObjectId]); await exact(); await same(c, snapshot.id, input.canvas.qualifiedObjectId); await pending(c, input.canvas.promiseObjectId); await exact();
  return Object.freeze({ ...authority, frameObjectId: frame.id, qualifiedObjectId: input.canvas.qualifiedObjectId, snapshotObjectId: snapshot.id, collectionsObjectId: input.canvas.collectionsObjectId, collectionSnapshotObjectId: input.canvas.collectionSnapshotObjectId, originalRequests: c.count() });
}
async function batchUnchanged(c: Commands, input: CurrentSchematicRelevanceModifyReturnInputs, batch: CurrentSchematicRelevanceModifyReturnBatchReturned): Promise<void> { need(batch.qualifiedObjectId === input.canvas.qualifiedObjectId && batch.collectionsObjectId === input.canvas.collectionsObjectId && batch.collectionSnapshotObjectId === input.canvas.collectionSnapshotObjectId); await same(c, batch.snapshotObjectId, batch.qualifiedObjectId); await collections(c, input, batch.qualifiedObjectId); }

/** Re-read the original still-active trusted event without the earlier
 * two-field row recipe, which correctly rejects the source-added length. */
export async function collectCurrentSchematicRelevanceModifyReturnHandlerReturned(host: CurrentSchematicRelevanceModifyReturnHost, frameId: string, input: CurrentSchematicRelevanceModifyReturnInputs, batchReturned: CurrentSchematicRelevanceModifyReturnBatchReturned): Promise<CurrentSchematicRelevanceModifyReturnHandlerReturned> {
  const c = commands(host, input, REQUESTS.handlerReturnReads); await batchUnchanged(c, input, batchReturned); const frame = await c.frame(frameId, "handlerReturned"); await joined(c, frame.id, input.event.frameObjectId);
  const read = await c.read("event-read", [frame.id, input.worker.busTupleObjectId, input.worker.nativeConstructorsObjectId, input.worker.nativePrototypesObjectId, input.worker.nativeMembersObjectId, batchReturned.qualifiedObjectId, input.event.eventMembersObjectId], 2); truth(await c.call("event-same", [input.event.readObjectId, read.id])); await batchUnchanged(c, input, batchReturned); await pending(c, input.canvas.promiseObjectId); await batchUnchanged(c, input, batchReturned);
  return Object.freeze({ ...authority, frameObjectId: frame.id, readObjectId: read.id, originalRequests: c.count() });
}

/** Stop at the original Sheet timer entry with the same resolver and pending
 * native Promise. No timer callback body or resolving function runs here. */
export async function collectCurrentSchematicRelevanceModifyReturnTimerEntry(host: CurrentSchematicRelevanceModifyReturnHost, frameId: string, input: CurrentSchematicRelevanceModifyReturnInputs, batchReturned: CurrentSchematicRelevanceModifyReturnBatchReturned): Promise<CurrentSchematicRelevanceModifyReturnTimerEntry> {
  const c = commands(host, input, REQUESTS.timerEntryReads); await batchUnchanged(c, input, batchReturned); const frame = await c.frame(frameId, "timer"); const actual = frame.fields[2]; need(actual?.type === "object" && actual.subtype === "promise" && actual.className === "Promise" && actual.description === "Promise"); const promiseObjectId = handle(actual);
  const proof = async (): Promise<void> => { truth(await c.call("timer-entry", [frame.id, input.canvas.rootsObjectId, input.canvas.createdObjectId, input.canvas.nativePartsObjectId, batchReturned.qualifiedObjectId])); await pending(c, promiseObjectId); };
  await proof(); await batchUnchanged(c, input, batchReturned); await proof(); await batchUnchanged(c, input, batchReturned);
  return Object.freeze({ ...authority, frameObjectId: frame.id, promiseObjectId, resolverObjectId: handle(frame.fields[1]), originalRequests: c.count() });
}
