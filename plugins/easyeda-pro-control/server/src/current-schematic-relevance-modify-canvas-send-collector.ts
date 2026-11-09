/** Passive original worker sender receipts. The real controller retains every
 * held pause, breakpoint, native sender and continuation allocation. */
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_SEND_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_SEND_FLAGS as FLAGS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_SEND_REQUESTS as REQUESTS, validateCurrentSchematicRelevanceModifyCanvasSendCommand as validate } from "./current-schematic-relevance-modify-canvas-send-protocol.ts";
import type { CurrentSchematicRelevanceModifyCanvasSendCommand as Command } from "./current-schematic-relevance-modify-canvas-send-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CONTROL_FLAGS as ECHO_FLAGS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CONTROL_FRAMES as ECHO_FRAMES, validateCurrentSchematicRelevanceModifyEchoControlCommand as echoValidate } from "./current-schematic-relevance-modify-echo-control-protocol.ts";
import type { CurrentSchematicRelevanceModifyEchoControlCommand as EchoCommand } from "./current-schematic-relevance-modify-echo-control-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_CONTROL_FLAGS as CANVAS_FLAGS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_FRAMES as CANVAS_FRAMES, validateCurrentSchematicRelevanceModifyCanvasControlCommand as canvasValidate } from "./current-schematic-relevance-modify-canvas-control-protocol.ts";
import type { CurrentSchematicRelevanceModifyCanvasControlCommand as CanvasCommand } from "./current-schematic-relevance-modify-canvas-control-protocol.ts";
import type { CurrentSchematicRelevanceModifyReturnInputs } from "./current-schematic-relevance-modify-return-collector.ts";
import type { CurrentSchematicRelevanceModifyReturnTimerHeld } from "./current-schematic-relevance-modify-return-delivery.ts";
import { currentSchematicRelevanceUiPublicationCapture as capture, currentSchematicRelevanceUiPublicationHandle as handle, currentSchematicRelevanceUiPublicationTrue as truth, currentSchematicRelevanceUiPublicationTuple as tuple } from "./current-schematic-relevance-ui-publication-replies.ts";
import { currentSchematicRelevancePublicationNativeProperties as properties } from "./current-schematic-relevance-publication-native-replies.ts";
import { currentSchematicRelevanceModifyEchoEventEvidence as evidence } from "./current-schematic-relevance-modify-echo-event-replies.ts";

export interface CurrentSchematicRelevanceModifyCanvasSendInputs { readonly returned: CurrentSchematicRelevanceModifyReturnInputs; readonly held: CurrentSchematicRelevanceModifyReturnTimerHeld }
export interface CurrentSchematicRelevanceModifyCanvasSendHost { readonly current: () => void; readonly request: (command: Command | EchoCommand | CanvasCommand) => Promise<unknown> }
const authority = Object.freeze({ ownershipIssued: false, nativeSenderVerified: false, senderAuthorized: false, continuationAuthorized: false, deliveryAuthorized: false, publicationAuthorized: false, publicationCompleted: false, workerCompleted: false, modifyCompleted: false, modifyAuthorized: false, saveAuthorized: false } as const);
interface Receipt extends Readonly<typeof authority> { readonly originalRequests: number }
export interface CurrentSchematicRelevanceModifyCanvasSendBefore extends Receipt { readonly input: CurrentSchematicRelevanceModifyCanvasSendInputs; readonly onMessageObjectId: string }
export interface CurrentSchematicRelevanceModifyCanvasSendPublish extends Receipt { readonly before: CurrentSchematicRelevanceModifyCanvasSendBefore; readonly frameObjectId: string }
export interface CurrentSchematicRelevanceModifyCanvasSendPost extends Receipt { readonly before: CurrentSchematicRelevanceModifyCanvasSendBefore; readonly publish: CurrentSchematicRelevanceModifyCanvasSendPublish; readonly frameObjectId: string; readonly envelopeObjectId: string; readonly qualifiedObjectId: string; readonly snapshotObjectId: string; readonly evidence: ReturnType<typeof evidence> }
export interface CurrentSchematicRelevanceModifyCanvasSendTimerReturned extends Receipt { readonly before: CurrentSchematicRelevanceModifyCanvasSendBefore; readonly post: CurrentSchematicRelevanceModifyCanvasSendPost; readonly frameObjectId: string }
export interface CurrentSchematicRelevanceModifyCanvasSendLoopback extends Receipt { readonly before: CurrentSchematicRelevanceModifyCanvasSendBefore; readonly post: CurrentSchematicRelevanceModifyCanvasSendPost; readonly returned: CurrentSchematicRelevanceModifyCanvasSendTimerReturned; readonly frameObjectId: string }
interface Read { readonly id: string; readonly fields: ReturnType<typeof tuple> }
interface Commands { readonly props: (id: string) => Promise<unknown>; readonly call: (role: string, ids: readonly string[]) => Promise<unknown>; readonly read: (role: string, ids: readonly string[], size?: number) => Promise<Read>; readonly frame: (id: string, role: "workerPublish" | "workerPost" | "workerLoopback" | "timer") => Promise<Read>; readonly count: () => number }
function need(value: boolean): asserts value { if (!value) { throw new Error("SCH_CANVAS_SEND_COLLECTOR"); } }
/** Keep one stage bounded and recheck original ownership on both sides of
 * every await. Control commands cannot pass this sender. */
function commands(host: CurrentSchematicRelevanceModifyCanvasSendHost, input: CurrentSchematicRelevanceModifyCanvasSendInputs, limit: number): Commands {
  let count = 0;
  const send = async (command: Command | EchoCommand | CanvasCommand): Promise<unknown> => { need(command.method === "Runtime.getProperties" || command.method === "Debugger.evaluateOnCallFrame" || command.phase === "modify-canvas-send-call"); host.current(); need(count < limit); count += 1; const reply = await host.request(command); host.current(); return reply; };
  const props = (objectId: string): Promise<unknown> => send(validate({ phase: "modify-canvas-send-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }));
  const call = (role: string, ids: readonly string[]): Promise<unknown> => { const row = CALLS.find(item => item[0] === role); need(row !== undefined && row[2] === ids.length); return send(validate({ phase: "modify-canvas-send-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: input.returned.worker.nativeObjectId, functionDeclaration: row[1], arguments: ids.map(objectId => ({ objectId })), returnByValue: row[3], awaitPromise: false, userGesture: false } })); };
  const read = async (role: string, ids: readonly string[], size?: number): Promise<Read> => { const id = capture(await call(role, ids)); return Object.freeze({ id, fields: tuple(await props(id), size) }); };
  const frame = async (callFrameId: string, role: "workerPublish" | "workerPost" | "workerLoopback" | "timer"): Promise<Read> => {
    const command = role === "timer" ? canvasValidate({ phase: "modify-canvas-control-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...CANVAS_FLAGS, callFrameId, expression: CANVAS_FRAMES.timer, returnByValue: false, includeCommandLineAPI: false } }) : echoValidate({ phase: "modify-echo-control-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...ECHO_FLAGS, callFrameId, expression: ECHO_FRAMES[role], returnByValue: false, includeCommandLineAPI: false } });
    const id = capture(await send(command)); return Object.freeze({ id, fields: tuple(await props(id), role === "timer" || role === "workerPublish" ? 3 : 2) });
  };
  return { props, call, read, frame, count: (): number => count };
}
/** A native Promise must carry undefined in both states. The existing SDK
 * gate's fulfilled-true decoder has a different immutable result contract. */
export function currentSchematicRelevanceModifyCanvasSendPromise(input: unknown, state: "pending" | "fulfilled"): string {
  const reply = properties(input), slots = new Map(reply.internalProperties?.map(row => [row.name, row.value]));
  need(reply.result.length === 0 && reply.internalProperties?.length === 3 && slots.size === 3);
  const actual = slots.get("[[PromiseState]]"), parent = slots.get("[[Prototype]]"), result = slots.get("[[PromiseResult]]");
  need(parent?.type === "object" && parent.subtype === undefined && actual?.type === "string" && actual.value === state && actual.subtype === undefined && actual.objectId === undefined && actual.unserializableValue === undefined && result?.type === "undefined" && result.subtype === undefined && result.objectId === undefined && result.value === undefined && result.unserializableValue === undefined);
  return handle(parent);
}
function binding(c: Commands, input: CurrentSchematicRelevanceModifyCanvasSendInputs, qualified: string, returned: boolean): Promise<Read> { const canvas = input.held.canvas.before, worker = input.returned.worker; return c.read(returned ? "bindings-returned" : "bindings", [input.returned.canvas.rootsObjectId, canvas.functionsObjectId, worker.functionsObjectId, canvas.nativePartsObjectId, worker.nativeMembersObjectId, worker.busTupleObjectId, input.returned.canvas.createdObjectId, qualified], 1); }
async function stable(c: Commands, input: CurrentSchematicRelevanceModifyCanvasSendInputs): Promise<void> {
  const batch = input.held.batchReturned, canvas = input.held.canvas.before;
  truth(await c.call("reprove", [])); truth(await c.call("same", [canvas.dependencySnapshotObjectId, canvas.dependencyObjectsObjectId])); truth(await c.call("same", [batch.snapshotObjectId, batch.qualifiedObjectId]));
  truth(await c.call("collection-same", [batch.collectionSnapshotObjectId, batch.collectionsObjectId, input.returned.cmBefore.nativeMethodsObjectId, batch.qualifiedObjectId]));
}
function matches(input: CurrentSchematicRelevanceModifyCanvasSendInputs, before: CurrentSchematicRelevanceModifyCanvasSendBefore): void { need(before.input === input); }
/** Observe the source-created pending Promise and freshly joined worker
 * onMessage identity while the original Canvas timer body remains held. */
export async function collectCurrentSchematicRelevanceModifyCanvasSendBefore(host: CurrentSchematicRelevanceModifyCanvasSendHost, input: CurrentSchematicRelevanceModifyCanvasSendInputs): Promise<CurrentSchematicRelevanceModifyCanvasSendBefore> {
  need(input.held.canvasTimerId === input.returned.canvas.timerId);
  const c = commands(host, input, REQUESTS.beforeReads); await stable(c, input); const row = await binding(c, input, input.held.batchReturned.qualifiedObjectId, false); truth(await c.call("timer-frame", [input.held.timer.frameObjectId, input.returned.canvas.rootsObjectId, input.returned.canvas.createdObjectId, input.held.batchReturned.qualifiedObjectId])); currentSchematicRelevanceModifyCanvasSendPromise(await c.props(input.returned.canvas.promiseObjectId), "pending"); await stable(c, input);
  return Object.freeze({ ...authority, input, onMessageObjectId: handle(row.fields[0]), originalRequests: c.count() });
}
/** Require the selected topic and original one-row cache array at the
 * genuine original publisher call. This receipt does not publish anything. */
export async function collectCurrentSchematicRelevanceModifyCanvasSendPublish(host: CurrentSchematicRelevanceModifyCanvasSendHost, frameId: string, input: CurrentSchematicRelevanceModifyCanvasSendInputs, before: CurrentSchematicRelevanceModifyCanvasSendBefore): Promise<CurrentSchematicRelevanceModifyCanvasSendPublish> {
  matches(input, before); const c = commands(host, input, REQUESTS.publishReads); await stable(c, input); await binding(c, input, input.held.batchReturned.qualifiedObjectId, false); const frame = await c.frame(frameId, "workerPublish"); truth(await c.call("publish", [frame.id, input.returned.cmDelta.frameObjectId, input.returned.canvas.createdObjectId, input.returned.worker.busTupleObjectId, input.held.batchReturned.qualifiedObjectId])); await stable(c, input);
  return Object.freeze({ ...authority, before, frameObjectId: frame.id, originalRequests: c.count() });
}
/** Qualify each new object and prototype before traversing descriptors.
 * The complete original seals are rechecked around every expansion. */
async function envelopeGraph(c: Commands, input: CurrentSchematicRelevanceModifyCanvasSendInputs, candidate: string): Promise<Readonly<{ qualified: string; snapshot: string }>> {
  let cursor = candidate, objects = 0, qualified = input.held.batchReturned.qualifiedObjectId, snapshot = input.held.batchReturned.snapshotObjectId;
  const unchanged = async (): Promise<void> => { await stable(c, input); truth(await c.call("same", [snapshot, qualified])); };
  for (let wave = 0; wave < REQUESTS.prototypeWaves; wave += 1) {
    await unchanged(); const fresh = await c.read("novel", [cursor, qualified]); if (fresh.fields.length === 0) { return Object.freeze({ qualified, snapshot }); }
    objects += fresh.fields.length; need(objects <= REQUESTS.objects);
    for (const actual of fresh.fields) { const reply = properties(await c.props(handle(actual))); need(actual.type === "object" && (actual.subtype === undefined || actual.subtype === "array") && reply.internalProperties?.length === 1 && reply.internalProperties[0]?.name === "[[Prototype]]"); }
    await unchanged(); const merged = await c.read("merge", [qualified, fresh.id]), parents = await c.read("parents", [fresh.id, merged.id]); await unchanged(); const next = await c.read("snapshot", [merged.id]); await unchanged(); qualified = merged.id; snapshot = next.id; cursor = parents.id;
  }
  throw new Error("SCH_CANVAS_SEND_PROTOTYPE_BOUND");
}
/** Read the exact new PUBLISH envelope before the original native post.
 * A same-shape copy cannot replace any original cache row or sender. */
export async function collectCurrentSchematicRelevanceModifyCanvasSendPost(host: CurrentSchematicRelevanceModifyCanvasSendHost, frameId: string, input: CurrentSchematicRelevanceModifyCanvasSendInputs, before: CurrentSchematicRelevanceModifyCanvasSendBefore, publish: CurrentSchematicRelevanceModifyCanvasSendPublish, previous?: CurrentSchematicRelevanceModifyCanvasSendPost): Promise<CurrentSchematicRelevanceModifyCanvasSendPost> {
  matches(input, before); need(publish.before === before); const c = commands(host, input, REQUESTS.postReads); await stable(c, input); const frame = await c.frame(frameId, "workerPost"); const envelope = await c.read("envelope", [frame.id, input.returned.worker.busTupleObjectId], 1); const graph = await envelopeGraph(c, input, envelope.id);
  if (previous !== undefined) { need(previous.before === before && previous.publish === publish); truth(await c.call("same", [previous.snapshotObjectId, previous.qualifiedObjectId])); truth(await c.call("same-frame", [frame.id, previous.frameObjectId])); }
  await binding(c, input, graph.qualified, false); const actual = evidence(await c.call("payload", [frame.id, input.returned.canvas.rootsObjectId, input.returned.canvas.createdObjectId, input.returned.cmDelta.frameObjectId, input.returned.worker.busTupleObjectId, graph.qualified])); await stable(c, input); truth(await c.call("same", [graph.snapshot, graph.qualified]));
  return Object.freeze({ ...authority, before, publish, frameObjectId: frame.id, envelopeObjectId: handle(envelope.fields[0]), qualifiedObjectId: graph.qualified, snapshotObjectId: graph.snapshot, evidence: actual, originalRequests: c.count() });
}
async function returnedStable(c: Commands, input: CurrentSchematicRelevanceModifyCanvasSendInputs, post: CurrentSchematicRelevanceModifyCanvasSendPost): Promise<void> {
  const batch = input.held.batchReturned, canvas = input.held.canvas.before;
  truth(await c.call("reprove", [])); truth(await c.call("same", [canvas.dependencySnapshotObjectId, canvas.dependencyObjectsObjectId])); truth(await c.call("timer-delta", [post.snapshotObjectId, post.qualifiedObjectId, input.returned.canvas.rootsObjectId]));
  truth(await c.call("collection-delta", [batch.collectionSnapshotObjectId, batch.collectionsObjectId, input.returned.cmBefore.nativeMethodsObjectId, input.returned.canvas.rootsObjectId, input.returned.canvas.createdObjectId, input.returned.cmDelta.frameObjectId, post.qualifiedObjectId]));
  await binding(c, input, post.qualifiedObjectId, true); currentSchematicRelevanceModifyCanvasSendPromise(await c.props(input.returned.canvas.promiseObjectId), "fulfilled");
}
/** At the actual timer return, permit only its precise field and ordered
 * cache/task removals plus native Promise fulfillment with undefined. */
export async function collectCurrentSchematicRelevanceModifyCanvasSendTimerReturned(host: CurrentSchematicRelevanceModifyCanvasSendHost, frameId: string, input: CurrentSchematicRelevanceModifyCanvasSendInputs, before: CurrentSchematicRelevanceModifyCanvasSendBefore, post: CurrentSchematicRelevanceModifyCanvasSendPost): Promise<CurrentSchematicRelevanceModifyCanvasSendTimerReturned> {
  matches(input, before); need(post.before === before); const c = commands(host, input, REQUESTS.timerReturnReads); await returnedStable(c, input, post); const frame = await c.frame(frameId, "timer"); truth(await c.call("timer-frame", [frame.id, input.returned.canvas.rootsObjectId, input.returned.canvas.createdObjectId, post.qualifiedObjectId])); await returnedStable(c, input, post);
  return Object.freeze({ ...authority, before, post, frameObjectId: frame.id, originalRequests: c.count() });
}
/** The later worker microtask must receive the identical envelope and have
 * no own or inherited handler for this selected Canvas topic. */
export async function collectCurrentSchematicRelevanceModifyCanvasSendLoopback(host: CurrentSchematicRelevanceModifyCanvasSendHost, frameId: string, input: CurrentSchematicRelevanceModifyCanvasSendInputs, before: CurrentSchematicRelevanceModifyCanvasSendBefore, post: CurrentSchematicRelevanceModifyCanvasSendPost, returned: CurrentSchematicRelevanceModifyCanvasSendTimerReturned): Promise<CurrentSchematicRelevanceModifyCanvasSendLoopback> {
  matches(input, before); need(post.before === before && returned.before === before && returned.post === post); const c = commands(host, input, REQUESTS.loopbackReads); await returnedStable(c, input, post); const frame = await c.frame(frameId, "workerLoopback"); truth(await c.call("loopback", [frame.id, post.frameObjectId, input.returned.worker.busTupleObjectId, input.held.canvas.before.nativePartsObjectId, post.qualifiedObjectId])); await returnedStable(c, input, post);
  return Object.freeze({ ...authority, before, post, returned, frameObjectId: frame.id, originalRequests: c.count() });
}
