/* oxlint-disable import/max-dependencies -- The passive original query observer joins separately audited command, event, source, task and descriptor decoders. */
/** One synchronous original query. Supplied observations return no native
 * authority; Core must issue a distinct completion from its genuine receipts. */
import { types } from "node:util";
import { z } from "zod";
import { captureCurrentFootprintInverseDeleteBindingReply as capture } from "./current-footprint-inverse-delete-binding-capture.ts";
import { CURRENT_FOOTPRINT_INVERSE_REFERENCE_WORKER_FLAGS as FLAGS, CURRENT_FOOTPRINT_INVERSE_REFERENCE_WORKER_PROGRAMS as PROGRAMS, currentFootprintInverseReferenceWorkerBudget, validateCurrentFootprintInverseReferenceWorkerCommand } from "./current-footprint-inverse-reference-worker-protocol.ts";
import type { CurrentFootprintInverseReferenceWorkerCommand as Command } from "./current-footprint-inverse-reference-worker-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_REFERENCE_WORKER_ORDER as ORDER, CURRENT_FOOTPRINT_INVERSE_REFERENCE_WORKER_SITES as SITES, CURRENT_FOOTPRINT_INVERSE_REFERENCE_WORKER_TOPICS as TOPICS } from "./current-footprint-inverse-reference-worker-source.ts";
import type { CurrentFootprintInverseReferenceWorkerRole as Role } from "./current-footprint-inverse-reference-worker-source.ts";
import type { CurrentFootprintInverseReferenceQueryJobBindings as Job } from "./current-footprint-inverse-reference-query-job.ts";
import { currentFootprintInverseReferenceAscii } from "./current-footprint-inverse-reference-worker-preparation.ts";
import type { CurrentFootprintInverseReferenceNamespace, CurrentFootprintInverseReferencePreparedInputs } from "./current-footprint-inverse-reference-worker-preparation.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array, decodeCurrentFootprintCopyClockRpcV2ArrayCapture } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { currentFootprintInverseDeleteRpcTrue } from "./current-footprint-inverse-delete-rpc-protocol.ts";
import { qualifyCurrentFootprintInverseNativeDeliveryEvent } from "./current-footprint-inverse-native-delivery-replies.ts";
import { currentNativeMessageEventCallable, qualifyCurrentNativeMessageEventFunction } from "./current-native-message-event-metadata.ts";
import { currentFootprintInverseOwnDataParent } from "./current-footprint-inverse-own-data-replies.ts";
import { qualifyCurrentFootprintInverseGetWorkerTask } from "./current-footprint-inverse-get-worker-replies.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.looseObject({ type: z.string(), subtype: z.string().optional(), className: z.string().optional(), description: z.string().optional(), objectId: handle.optional() });
const property = z.looseObject({ name: z.string(), value: remote.optional(), writable: z.boolean().optional(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) });
const propertiesPacket = z.looseObject({ result: z.array(property).max(64) });
const messageUuid=z.string().regex(/^[a-f\d]{32}$/u);
const messageTag=z.discriminatedUnion("kind",[z.strictObject({kind:z.literal("undefined")}),z.strictObject({kind:z.literal("uuid"),value:messageUuid})]);
const requestPacket = z.strictObject({ message: messageTag, replyTopic: z.string().min(32).max(256).regex(/^[A-Za-z\d_./:-]+$/u) });
const envelopeSchema = z.strictObject({ type: z.literal("IGIVE"), uuid: z.uuid(), topic: z.enum(Object.values(TOPICS)), id: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).refine(value => !Object.is(value, -0)), target: z.uuid(), message: requestPacket });
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_INVERSE_REFERENCE_OBSERVATION"); } }
function ownHostField(input:unknown,key:string):unknown { need(input!==null&&typeof input==="object"&&!types.isProxy(input));const prototype:unknown=Object.getPrototypeOf(input);need(prototype===Object.prototype||prototype===null);const descriptor=Object.getOwnPropertyDescriptor(input,key);need(descriptor!==undefined&&Object.hasOwn(descriptor,"value")&&descriptor.enumerable===true);return descriptor.value as unknown; }
function exactHostRecord(input:unknown,keys:readonly string[]):void { need(input!==null&&typeof input==="object"&&!types.isProxy(input));const actual=Reflect.ownKeys(input);need(actual.length===keys.length&&actual.every(key=>typeof key==="string"&&keys.includes(key)));for(const key of keys){ownHostField(input,key);} }
export function currentFootprintInverseReferenceExpected(job: Job): string {
  const raw=ownHostField(job,"nativeEnvelope");exactHostRecord(raw,["type","uuid","topic","id","target","message"]);const packet=ownHostField(raw,"message");exactHostRecord(packet,["message","replyTopic"]);const rawMessage=ownHostField(packet,"message");need(rawMessage===undefined||typeof rawMessage==="string");
  const message=rawMessage===undefined?{kind:"undefined"as const}:{kind:"uuid"as const,value:rawMessage};
  const envelope=envelopeSchema.parse(capture({type:ownHostField(raw,"type"),uuid:ownHostField(raw,"uuid"),topic:ownHostField(raw,"topic"),id:ownHostField(raw,"id"),target:ownHostField(raw,"target"),message:{message,replyTopic:ownHostField(packet,"replyTopic")}}));
  const kind=z.enum(["pcb-all","footprint-derived","device-all"]).parse(ownHostField(job,"kind"));const uuid=z.string().regex(/^[a-f\d]{32}$/u).parse(ownHostField(job,"footprintUuid"));const reply=ownHostField(job,"replyTopic");need(envelope.topic===TOPICS[kind]&&envelope.message.replyTopic===reply);need(kind==="footprint-derived"?message.kind==="uuid"&&message.value===uuid:message.kind==="undefined");
  return currentFootprintInverseReferenceAscii({nativeEnvelope:envelope,nativeOrigin:z.string().max(2048).parse(ownHostField(job,"nativeOrigin"))});
}

type Values = ReturnType<typeof decodeCurrentFootprintCopyClockRpcV2Array>;
function selected(values: Values, slot: number): string { const value = values.get(String(slot)); need(value !== undefined && value.objectId !== undefined && value.subtype !== "proxy" && value.subtype !== "null"); return value.objectId; }
function ownObject(input: unknown, key: string, array = false): string { const rows = propertiesPacket.parse(capture(input)).result.filter(row => row.name === key); need(rows.length === 1); const row = rows[0]; need(row !== undefined && row.value !== undefined && row.writable === true && row.enumerable && row.configurable && row.value.type === "object" && row.value.subtype === (array ? "array" : undefined) && row.value.className === (array ? "Array" : "Object") && row.value.objectId !== undefined); return row.value.objectId; }
export interface CurrentFootprintInverseReferenceObservationBindings {
  readonly job: Job; readonly inputs: CurrentFootprintInverseReferencePreparedInputs; readonly namespace: CurrentFootprintInverseReferenceNamespace;
  readonly intrinsics: string; readonly eventConstructors: string; readonly channelBound: string;
  readonly entryFrame: string; readonly nativeEventFrame: string;
  readonly points: ReadonlyMap<Role, string>; readonly finalQuery: boolean;
  readonly current: () => void; readonly assertOriginalEntryHeld: () => void;
  readonly request: (command: Command) => Promise<unknown>;
  readonly assertOriginalHelperReceipt: (command: Command) => Promise<void>;
  readonly permitOriginalBody: () => Promise<void>;
  readonly reserveOriginalResume: () => void; readonly requireOriginalResumed: () => Promise<void>;
  readonly nextOriginalPause: () => Promise<Readonly<{ role: Role; callFrameId: string }>>;
  readonly complete: () => Promise<void>; readonly fail: () => void;
}
/** Normal/Helper counts remain distinct; each helper has its own source read. */
export async function observeCurrentFootprintInverseReferenceWorker(b: CurrentFootprintInverseReferenceObservationBindings): Promise<Readonly<{ normal: number; helpers: number; workerCompletionIssued: false; suppliedObservationsOnly: true }>> {
  try {
    b.current(); b.assertOriginalEntryHeld(); need(b.namespace.kind === b.job.kind && b.inputs.namespaces.includes(b.namespace)); const budget = currentFootprintInverseReferenceWorkerBudget(b.inputs.graphs.map(graph => graph.nodes)); let helpers = 0, normal = 0;
    const send = async (input: unknown): Promise<unknown> => { b.current(); const command = validateCurrentFootprintInverseReferenceWorkerCommand(input); normal += 1; need(normal <= budget.queryNormal + (b.finalQuery ? 12 : 0)); const raw = await b.request(command); b.current(); if (command.method === "Runtime.callFunctionOn" || command.method === "Debugger.evaluateOnCallFrame") { helpers += 1; need(helpers <= budget.queryHelpers); await b.assertOriginalHelperReceipt(command); b.current(); } return raw; };
    const properties = (objectId: string): Promise<unknown> => send({ phase: "inverse-reference-worker-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
    const call = (role: string, objectId: string, args: readonly Readonly<{ objectId: string } | { value: string }>[], value = false): Promise<unknown> => { const program = PROGRAMS[role]; need(program !== undefined); return send({ phase: "inverse-reference-worker-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, functionDeclaration: program, arguments: args, returnByValue: value } }); };
    const tuple = async (raw: unknown, count: number): Promise<Readonly<{ id: string; values: Values }>> => { const id = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(raw, count); return Object.freeze({ id, values: decodeCurrentFootprintCopyClockRpcV2Array(await properties(id), count) }); };
    const invoke = async (role: string, receiver: string, args: readonly string[], count: number): Promise<Awaited<ReturnType<typeof tuple>>> => tuple(await call(role, receiver, args.map(objectId => ({ objectId }))), count);
    const frame = async (role: Role | "nativeEvent", callFrameId: string, count: number): Promise<Awaited<ReturnType<typeof tuple>>> => tuple(await send({ phase: "inverse-reference-worker-frame", role, method: "Debugger.evaluateOnCallFrame", params: { callFrameId, expression: role === "nativeEvent" ? "[this,s]" : SITES[role].expression, objectGroup: FLAGS.objectGroup, silent: true, generatePreview: false, throwOnSideEffect: true, returnByValue: false, includeCommandLineAPI: false } }), count);
    const reproveModels = async (): Promise<void> => { for (const graph of b.inputs.graphs) { currentFootprintInverseDeleteRpcTrue(await call("graph-reprove", graph.tuple, [{ objectId: b.inputs.graphMethods }, { value: graph.relations }], true)); } };
    const entry = await frame("entry", b.entryFrame, 5), event = await frame("nativeEvent", b.nativeEventFrame, 2); const actualEvent = event.values.get("1"); need(actualEvent?.type === "object" && actualEvent.className === "MessageEvent" && actualEvent.description === "MessageEvent" && actualEvent.subtype === undefined && actualEvent.objectId !== undefined); qualifyCurrentFootprintInverseNativeDeliveryEvent(await properties(actualEvent.objectId));
    const members = await invoke("delivery-members", b.eventConstructors, [actualEvent.objectId], 12);
    for (let index = 0; index < 8; index += 1) { const id = currentNativeMessageEventCallable({ result: members.values.get(String(index + 3)) }, index + 1); qualifyCurrentNativeMessageEventFunction(await properties(id), index + 1); }
    const delivered = await tuple(await call("delivery-capture", event.id, [{ objectId: b.intrinsics }, { objectId: b.namespace.ready }, { objectId: entry.id }, { objectId: members.id }, { objectId: b.channelBound }, { objectId: b.inputs.graphMethods }, { value: currentFootprintInverseReferenceExpected(b.job) }]), 5);
    currentFootprintInverseDeleteRpcTrue(await call("delivery-reprove", delivered.id, [], true));
    const state = await invoke("tail-state", entry.id, [b.intrinsics, b.namespace.ready, event.id, delivered.id], 9); currentFootprintInverseDeleteRpcTrue(await call("tail-entryQueue", state.id, [], true)); await reproveModels();
    b.current(); b.assertOriginalEntryHeld(); need(normal === budget.entryNormal && helpers === budget.entryHelpers); await b.permitOriginalBody(); b.current();
    const resume = async (): Promise<void> => { b.current(); b.reserveOriginalResume(); const raw = await send({ phase: "inverse-reference-worker-resume", method: "Debugger.resume", params: {} }); need(JSON.stringify(capture(raw)) === "{}"); await b.requireOriginalResumed(); b.current(); };
    let published: string | null = null, returned: string | null = null, whohas: string | null = null;
    for (const step of ORDER) {
      await resume(); const actual = await b.nextOriginalPause(); b.current(); const [expectedRole, suffix] = step.split("-"); need(actual.role === expectedRole); const role = actual.role; let count = 2; if (role === "returned") { count = 8; } else if (role === "serviceReturn") { count = 5; } const captured = await frame(role, actual.callFrameId, count);
      if (role === "returned") { const result = captured.values.get("7"); need(result?.type === "object" && result.className === "Object" && result.subtype === undefined); const wrapper = await properties(selected(captured.values, 7)); const empty = ownObject(wrapper, "result", true); decodeCurrentFootprintCopyClockRpcV2Array(await properties(empty), 0); const retained = await invoke("tail-returned", captured.id, [state.id], 5); returned = retained.id; }
      else if (role === "post") { need(returned !== null); const packet = await properties(selected(captured.values, 1)); currentFootprintInverseOwnDataParent(packet, "object"); if (suffix === "publish") { currentFootprintInverseOwnDataParent(await properties(ownObject(packet, "message")), "object"); } const post = await tuple(await call("tail-post", captured.id, [{ objectId: state.id }, { objectId: returned }, { value: suffix === "publish" ? "PUBLISH" : "WHOHAS" }]), 5); if (suffix === "publish") { published = post.id; } else { need(suffix === "whohas"); whohas = post.id; } }
      else if (role === "posted" || role === "postReturn" || role === "local" || role === "localReturn") { const post = suffix === "publish" ? published : whohas; need(post !== null); await invoke("tail-samePost", captured.id, [post], 3); }
      else if (role === "serviceReturn") { const next = await invoke("tail-nextTask", state.id, [], 3); qualifyCurrentFootprintInverseGetWorkerTask(await properties(selected(next.values, 2))); await invoke("tail-serviceReturn", captured.id, [state.id], 4); }
      else if (role === "taskReturn") { await invoke("tail-taskReturn", captured.id, [state.id], 3); }
      else if (role === "eventReturn") { await invoke("tail-eventReturn", captured.id, [state.id], 3); }
      else { throw new Error("FOOTPRINT_INVERSE_REFERENCE_FAILURE_BRANCH"); }
    }
    need(returned !== null && published !== null && whohas !== null);
    if (b.finalQuery) { need(b.points.size === Object.keys(SITES).length); for (const point of b.points.values()) { const raw = await send({ phase: "inverse-reference-worker-remove", method: "Debugger.removeBreakpoint", params: { breakpointId: point } }); need(JSON.stringify(capture(raw)) === "{}"); } }
    currentFootprintInverseDeleteRpcTrue(await call("tail-reprove", state.id, [], true)); await reproveModels(); await resume(); b.current(); need(normal === budget.queryNormal + (b.finalQuery ? 12 : 0) && helpers === budget.queryHelpers); await b.complete(); b.current();
    return Object.freeze({ normal, helpers, workerCompletionIssued: false, suppliedObservationsOnly: true });
  } catch (error) { b.fail(); throw error; }
}
