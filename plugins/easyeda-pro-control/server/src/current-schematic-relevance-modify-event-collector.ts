/** Passive proof of the original worker's currently held onmessage entry.
 * Every event/native/data object is inspected before descriptor traversal. */
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_EVENT_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_EVENT_FLAGS as FLAGS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_EVENT_REQUESTS as REQUESTS, validateCurrentSchematicRelevanceModifyEventCommand as validate } from "./current-schematic-relevance-modify-event-protocol.ts";
import type { CurrentSchematicRelevanceModifyEventCommand as Command } from "./current-schematic-relevance-modify-event-protocol.ts";
import { currentSchematicRelevanceModifyEventMetadata as eventMetadata, currentSchematicRelevanceModifyEventPayload as payload } from "./current-schematic-relevance-modify-event-replies.ts";
import type { CurrentSchematicRelevanceModifyWorkerPrepared } from "./current-schematic-relevance-modify-worker-collector.ts";
import type { CurrentSchematicRelevancePublicationPayload } from "./current-schematic-relevance-publication-body-replies.ts";
import { currentSchematicRelevancePublicationNativeRecord as record } from "./current-schematic-relevance-publication-native-replies.ts";
import { currentSchematicRelevanceUiPublicationCapture as capture, currentSchematicRelevanceUiPublicationHandle as handle, currentSchematicRelevanceUiPublicationTrue as truth, currentSchematicRelevanceUiPublicationTuple as tuple } from "./current-schematic-relevance-ui-publication-replies.ts";
import { qualifyCurrentNativeMessageEventFunction } from "./current-native-message-event-metadata.ts";

export interface CurrentSchematicRelevanceModifyEventHost { readonly current: () => void; readonly request: (command: Command) => Promise<unknown> }
export interface CurrentSchematicRelevanceModifyEventPrepared {
  readonly frameId: string; readonly frameObjectId: string; readonly eventObjectId: string; readonly eventMembersObjectId: string; readonly isTrustedGetterObjectId: string; readonly readObjectId: string; readonly envelopeObjectId: string; readonly qualifiedObjectId: string; readonly snapshotObjectId: string;
  readonly payload: Readonly<CurrentSchematicRelevancePublicationPayload>; readonly originalRequests: number;
  readonly ownershipIssued: false; readonly originalWorkerOwnerVerified: false; readonly callbackReceiverVerified: false; readonly originalBodyHeld: false; readonly trustedEventQualified: false; readonly nativeDeliveryVerified: false; readonly senderAuthorized: false; readonly workerAuthorized: false; readonly modifyCompleted: false; readonly modifyAuthorized: false; readonly saveAuthorized: false;
}
interface ReadTuple { readonly id: string; readonly fields: ReturnType<typeof tuple> }
interface Commands { readonly count: () => number; readonly send: (command: Command) => Promise<unknown>; readonly props: (id: string) => Promise<unknown>; readonly call: (role: string, args: readonly string[]) => Promise<unknown>; readonly readCall: (role: string, args: readonly string[], size?: number) => Promise<ReadTuple>; readonly frame: (frameId: string) => Promise<ReadTuple> }
function need(value: boolean): asserts value { if (!value) { throw new Error("SCH_MODIFY_EVENT_COLLECTOR"); } }
/** Every request uses one fixed original worker receiver and rechecks its
 * host custody before and after the Inspector await. */
function commands(host: CurrentSchematicRelevanceModifyEventHost, worker: CurrentSchematicRelevanceModifyWorkerPrepared): Commands {
  let count = 0;
  const send = async (command: Command): Promise<unknown> => { host.current(); need(count < REQUESTS.reads); count += 1; const reply = await host.request(command); host.current(); return reply; };
  const props = (objectId: string): Promise<unknown> => send(validate({ phase: "modify-event-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }));
  const call = (role: string, args: readonly string[]): Promise<unknown> => {
    const row = CALLS.find(value => value[0] === role); need(row !== undefined && row[2] === args.length);
    return send(validate({ phase: "modify-event-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: worker.nativeObjectId, functionDeclaration: row[1], arguments: args.map(objectId => ({ objectId })), returnByValue: row[3], awaitPromise: false, userGesture: false } }));
  };
  const read = async (command: Command, size?: number): Promise<ReadTuple> => { const id = capture(await send(command)); return Object.freeze({ id, fields: tuple(await props(id), size) }); };
  const readCall = async (role: string, args: readonly string[], size?: number): Promise<ReadTuple> => { const id = capture(await call(role, args)); return Object.freeze({ id, fields: tuple(await props(id), size) }); };
  const frame = (frameId: string): Promise<ReadTuple> => read(validate({ phase: "modify-event-frame", method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: frameId, expression: "[this,s]", returnByValue: false, includeCommandLineAPI: false } }), 2);
  return { count: (): number => count, send, props, call, readCall, frame };
}
const nativeArgs = (worker: CurrentSchematicRelevanceModifyWorkerPrepared): readonly string[] => [worker.nativeConstructorsObjectId, worker.nativePrototypesObjectId, worker.nativeMembersObjectId, worker.busTupleObjectId];
const eventArgs = (worker: CurrentSchematicRelevanceModifyWorkerPrepared, frame: string, qualified: string): readonly string[] => [frame, worker.busTupleObjectId, worker.nativeConstructorsObjectId, worker.nativePrototypesObjectId, worker.nativeMembersObjectId, qualified];
/** Starting from the genuine preparation snapshot prevents the new Event or
 * envelope baseline from adopting any older worker/task/prototype drift. */
export async function collectCurrentSchematicRelevanceModifyEvent(host: CurrentSchematicRelevanceModifyEventHost, frameId: string, worker: CurrentSchematicRelevanceModifyWorkerPrepared, originalUiPayload: Readonly<CurrentSchematicRelevancePublicationPayload>): Promise<CurrentSchematicRelevanceModifyEventPrepared> {
  const c = commands(host, worker); let qualified = worker.qualifiedObjectId; let snapshot = worker.snapshotObjectId; let objects = 0; let stages = 0;
  const unchanged = async (): Promise<void> => { truth(await c.call("same", [snapshot, qualified])); };
  const qualify = async (id: string): Promise<void> => {
    stages += 1; need(stages <= REQUESTS.stages); let candidate = id;
    for (let wave = 0; wave < REQUESTS.prototypeWaves; wave += 1) {
      await unchanged(); const fresh = await c.readCall("novel", [candidate, qualified]); if (fresh.fields.length === 0) { return; }
      objects += fresh.fields.length; need(objects <= REQUESTS.objects);
      for (const value of fresh.fields) { record(await c.props(handle(value)), value); }
      await unchanged(); const merged = await c.readCall("merge", [qualified, fresh.id]), parents = await c.readCall("parents", [fresh.id, merged.id]);
      await unchanged(); const next = await c.readCall("snapshot", [merged.id]); await unchanged(); qualified = merged.id; snapshot = next.id; candidate = parents.id;
    }
    throw new Error("SCH_MODIFY_EVENT_PROTOTYPE_BOUND");
  };
  truth(await c.call("reprove", [])); await unchanged(); truth(await c.call("native", nativeArgs(worker))); truth(await c.call("handler-same", [worker.busTupleObjectId, worker.nativeMembersObjectId, worker.handlerTupleObjectId]));
  const frame = await c.frame(frameId); const entry = await c.readCall("entry", [frame.id, worker.busTupleObjectId], 2); const event = entry.fields[1];
  const eventId = handle(event); eventMetadata(await c.props(eventId), event); await qualify(entry.id);
  const members = await c.readCall("members", eventArgs(worker, frame.id, qualified), 2); await qualify(members.id);
  const trusted = members.fields[1]; need(trusted?.description === "function get isTrusted() { [native code] }"); qualifyCurrentNativeMessageEventFunction(await c.props(handle(trusted)), 3); await unchanged();
  const read = await c.readCall("read", [...eventArgs(worker, frame.id, qualified), members.id], 2); await qualify(read.id);
  let selected = await c.readCall("envelope", [read.id, qualified], 1); await qualify(selected.id);
  for (const role of ["message", "cache", "row", "pending"] as const) { selected = await c.readCall(role, [read.id, qualified], 1); await qualify(selected.id); }
  const actual = payload(await c.call("payload", [read.id, worker.busTupleObjectId, worker.nativeMembersObjectId, qualified]), originalUiPayload); await unchanged();
  const freshFrame = await c.frame(frameId); truth(await c.call("same-read", [frame.id, freshFrame.id]));
  const final = await c.readCall("read", [...eventArgs(worker, frame.id, qualified), members.id], 2); truth(await c.call("same-read", [read.id, final.id]));
  const finalPayload = payload(await c.call("payload", [read.id, worker.busTupleObjectId, worker.nativeMembersObjectId, qualified]), originalUiPayload); await unchanged();
  need(actual.every((value, index) => Object.is(value, finalPayload[index])));
  return Object.freeze({ frameId, frameObjectId: frame.id, eventObjectId: eventId, eventMembersObjectId: members.id, isTrustedGetterObjectId: handle(trusted), readObjectId: read.id, envelopeObjectId: handle(read.fields[1]), qualifiedObjectId: qualified, snapshotObjectId: snapshot, payload: finalPayload, originalRequests: c.count(), ownershipIssued: false, originalWorkerOwnerVerified: false, callbackReceiverVerified: false, originalBodyHeld: false, trustedEventQualified: false, nativeDeliveryVerified: false, senderAuthorized: false, workerAuthorized: false, modifyCompleted: false, modifyAuthorized: false, saveAuthorized: false });
}

/** Freshly reprove a retained entry while it is still in active native dispatch.
 * This read-only comparison never resumes the registered handler. */
export async function reproveCurrentSchematicRelevanceModifyEvent(host: CurrentSchematicRelevanceModifyEventHost, worker: CurrentSchematicRelevanceModifyWorkerPrepared, original: CurrentSchematicRelevanceModifyEventPrepared, originalUiPayload: Readonly<CurrentSchematicRelevancePublicationPayload>): Promise<number> {
  const c = commands(host, worker), frame = await c.frame(original.frameId);
  truth(await c.call("reprove", [])); truth(await c.call("same", [original.snapshotObjectId, original.qualifiedObjectId])); truth(await c.call("same-read", [original.frameObjectId, frame.id])); truth(await c.call("native", nativeArgs(worker)));
  truth(await c.call("handler-same", [worker.busTupleObjectId, worker.nativeMembersObjectId, worker.handlerTupleObjectId]));
  const fresh = await c.readCall("read", [...eventArgs(worker, frame.id, original.qualifiedObjectId), original.eventMembersObjectId], 2);
  truth(await c.call("same-read", [original.readObjectId, fresh.id])); payload(await c.call("payload", [fresh.id, worker.busTupleObjectId, worker.nativeMembersObjectId, original.qualifiedObjectId]), originalUiPayload);
  truth(await c.call("same", [original.snapshotObjectId, original.qualifiedObjectId])); need(c.count() <= REQUESTS.reproofReads); return c.count();
}
