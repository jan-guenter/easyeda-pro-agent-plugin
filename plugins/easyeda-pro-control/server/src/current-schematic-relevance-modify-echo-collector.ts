/** Prepare references under the original owner's held publication entry.
 * No handler, Event getter, sender, continuation or application method runs. */
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_FLAGS as FLAGS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_REQUESTS as REQUESTS, validateCurrentSchematicRelevanceModifyEchoCommand as validate } from "./current-schematic-relevance-modify-echo-protocol.ts";
import type { CurrentSchematicRelevanceModifyEchoCommand as Command } from "./current-schematic-relevance-modify-echo-protocol.ts";
import type { CurrentSchematicRelevancePublicationNativeCommand as PublicationCommand } from "./current-schematic-relevance-publication-native-protocol.ts";
import { reproveCurrentSchematicRelevancePublicationNative } from "./current-schematic-relevance-publication-native-collector.ts";
import type { CurrentSchematicRelevancePublicationNativePrepared } from "./current-schematic-relevance-publication-native-collector.ts";
import type { CurrentSchematicRelevanceSdkGateInputs } from "./current-schematic-relevance-sdk-gate-collector.ts";
import { currentSchematicRelevanceUiPublicationCapture as capture, currentSchematicRelevanceUiPublicationHandle as handle, currentSchematicRelevanceUiPublicationProperties as properties, currentSchematicRelevanceUiPublicationTrue as truth, currentSchematicRelevanceUiPublicationTuple as tuple } from "./current-schematic-relevance-ui-publication-replies.ts";
import type { CurrentSchematicRelevanceUiPublicationRemote as Remote } from "./current-schematic-relevance-ui-publication-replies.ts";
import { requireCurrentSchematicRelevanceModifyEchoDescription as handlerDescription, decodeCurrentSchematicRelevanceModifyEchoFunction as handlerMetadata, qualifyCurrentSchematicRelevanceModifyEchoSource as source } from "./current-schematic-relevance-modify-echo-replies.ts";
import { requireCurrentSchematicRelevanceBroadcastCalleeDescription as busDescription, decodeCurrentSchematicRelevanceBroadcastCalleeFunction as busMetadata } from "./current-schematic-relevance-broadcast-callee-replies.ts";
import { qualifyCurrentNativeEventConstructor, qualifyCurrentNativeMessageEventFunction } from "./current-native-message-event-metadata.ts";
import { decodeCurrentNativeFunctionMetadata } from "./current-native-function-metadata.ts";
import { captureCurrentSchematicDisplayAccessorSource } from "./current-schematic-display-accessor-replies.ts";

export interface CurrentSchematicRelevanceModifyEchoHost { readonly current: () => void; readonly request: (command: Command | PublicationCommand) => Promise<unknown> }
export interface CurrentSchematicRelevanceModifyEchoPrepared {
  readonly nativeObjectId: string; readonly busTupleObjectId: string; readonly broadcastChannelObjectId: string; readonly handlerTupleObjectId: string; readonly handlerObjectId: string; readonly getOnmessageObjectId: string; readonly onMessageTupleObjectId: string; readonly onMessageObjectId: string;
  readonly nativeConstructorsObjectId: string; readonly nativePrototypesObjectId: string; readonly nativeMembersObjectId: string; readonly qualifiedObjectId: string; readonly snapshotObjectId: string; readonly dependencyObjectsObjectId: string; readonly dependencySnapshotObjectId: string;
  readonly scriptId: string; readonly variant: 0 | 1; readonly originalRequests: number; readonly preparationRequests: number; readonly publicationReproofRequests: number; readonly readLimit: number; readonly helperLimit: number;
  readonly eventGetters: Readonly<{ target: string; type: string; currentTarget: string; eventPhase: string; data: string; origin: string; source: string; isTrusted: null }>;
  readonly ownershipIssued: false; readonly originalBodyHeld: false; readonly originalPublisherOwnerVerified: false; readonly callbackReceiverVerified: false; readonly originalBusReceiverVerified: false; readonly trustedEventQualified: false; readonly nativeDeliveryVerified: false; readonly deliveryVerified: false; readonly nativeSenderVerified: false;
  readonly continuationAuthorized: false; readonly senderAuthorized: false; readonly deliveryAuthorized: false; readonly publicationAuthorized: false; readonly workerAuthorized: false; readonly modifyAuthorized: false; readonly saveAuthorized: false;
  readonly publicationCompleted: false; readonly workerTextObserved: false; readonly modifyCompleted: false;
}
interface ReadTuple { readonly id: string; readonly fields: ReturnType<typeof tuple> }
function need(value: boolean): asserts value { if (!value) { throw new Error("SCH_MODIFY_ECHO_COLLECTOR"); } }
function callCommand(role: string, objectId: string, args: readonly string[]): Command {
  const row = CALLS.find(value => value[0] === role); need(row !== undefined && row[2] === args.length);
  return validate({ phase: "modify-echo-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, functionDeclaration: row[1], arguments: args.map(id => ({ objectId: id })), returnByValue: row[3], awaitPromise: false, userGesture: false } });
}
function commands(host: CurrentSchematicRelevanceModifyEchoHost): { readonly send: (command: Command) => Promise<unknown>; readonly props: (id: string) => Promise<unknown>; readonly call: (role: string, id: string, args: readonly string[]) => Promise<unknown>; readonly readCall: (role: string, id: string, args: readonly string[], size?: number) => Promise<ReadTuple>; readonly reprove: (input: CurrentSchematicRelevanceSdkGateInputs, publication: CurrentSchematicRelevancePublicationNativePrepared) => Promise<void>; readonly counts: () => Readonly<{ preparation: number; publication: number }> } {
  let preparation = 0, publication = 0, reproofs = 0;
  const send = async (command: Command): Promise<unknown> => { host.current(); need(preparation < REQUESTS.preparationReads); preparation += 1; const reply = await host.request(command); host.current(); return reply; };
  const props = (objectId: string): Promise<unknown> => send(validate({ phase: "modify-echo-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }));
  const call = (role: string, id: string, args: readonly string[]): Promise<unknown> => send(callCommand(role, id, args));
  const readCall = async (role: string, id: string, args: readonly string[], size?: number): Promise<ReadTuple> => { const result = capture(await call(role, id, args)); return Object.freeze({ id: result, fields: tuple(await props(result), size) }); };
  const reprove = async (input: CurrentSchematicRelevanceSdkGateInputs, prepared: CurrentSchematicRelevancePublicationNativePrepared): Promise<void> => {
    need(reproofs < REQUESTS.publicationReproofs); reproofs += 1; let count = 0;
    const actual = await reproveCurrentSchematicRelevancePublicationNative({ current: host.current, request: async command => { host.current(); need(count < REQUESTS.publicationReproofReads); count += 1; publication += 1; const reply = await host.request(command); host.current(); return reply; } }, input, prepared);
    need(count === actual && publication <= REQUESTS.publicationReproofs * REQUESTS.publicationReproofReads);
  };
  return { send, props, call, readCall, reprove, counts: (): Readonly<{ preparation: number; publication: number }> => Object.freeze({ preparation, publication }) };
}
function nativeDescription(value: Remote | undefined, name: string): string { need(value?.type === "function" && value.className === "Function" && value.description === `function ${name}() { [native code] }` && value.subtype === undefined); return handle(value); }

/** The host retains the original pause and realm. Matching Prepared data
 * grants no replacement owner, callback receiver or event-entry authority. */
export async function collectCurrentSchematicRelevanceModifyEcho(host: CurrentSchematicRelevanceModifyEchoHost, input: CurrentSchematicRelevanceSdkGateInputs, publication: CurrentSchematicRelevancePublicationNativePrepared): Promise<CurrentSchematicRelevanceModifyEchoPrepared> {
  const c = commands(host); const { clone, raw } = input;
  await c.reprove(input, publication);
  const sourceReply = await c.send(validate({ phase: "modify-echo-source", method: "Debugger.getScriptSource", params: { scriptId: input.script } })); need(source(captureCurrentSchematicDisplayAccessorSource(sourceReply).scriptSource) === input.variant);
  // Begin with stable dependencies. Full preparation snapshots are historical.
  let baseline = publication.dependencySnapshotObjectId, objects = 0, qualified = publication.dependencyObjectsObjectId, stages = 0;
  const unchanged = async (): Promise<void> => { truth(await c.call("same-snapshot", baseline, [raw.nativeObjectId, qualified])); };
  const qualify = async (id: string): Promise<void> => {
    stages += 1; need(stages <= REQUESTS.graphStages); let candidate = id;
    for (let depth = 0; depth < REQUESTS.prototypeWaves; depth += 1) {
      await unchanged(); const fresh = await c.readCall("novel", candidate, [raw.nativeObjectId, qualified]); if (fresh.fields.length === 0) { return; }
      objects += fresh.fields.length; need(objects <= REQUESTS.objects);
      for (const value of fresh.fields) { properties(await c.props(handle(value))); }
      await unchanged(); const merged = await c.readCall("merge", qualified, [raw.nativeObjectId, fresh.id]); const parents = await c.readCall("prototypes", fresh.id, [raw.nativeObjectId]);
      await unchanged(); const next = await c.readCall("snapshot", merged.id, [raw.nativeObjectId]); await unchanged(); qualified = merged.id; baseline = next.id; candidate = parents.id;
    }
    throw new Error("SCH_MODIFY_ECHO_PROTOTYPE_BOUND");
  };
  await unchanged(); const global = await c.readCall("seed", publication.nativeRootsObjectId, [raw.nativeObjectId], 1); await qualify(global.id);
  const getter = await c.readCall("onmessage", publication.nativeFunctionsObjectId, [raw.nativeObjectId], 1); await qualify(getter.id);
  const getOnmessageObjectId = nativeDescription(getter.fields[0], "get onmessage"); decodeCurrentNativeFunctionMetadata(await c.props(getOnmessageObjectId), { name: "get onmessage", arity: 0, constructor: false });
  const constructors = await c.readCall("constructors", clone.nativeObjectId, [qualified, publication.nativeRootsObjectId], 2); await qualify(constructors.id);
  nativeDescription(constructors.fields[0], "Event"); qualifyCurrentNativeEventConstructor(await c.props(handle(constructors.fields[0]))); nativeDescription(constructors.fields[1], "MessageEvent"); qualifyCurrentNativeMessageEventFunction(await c.props(handle(constructors.fields[1])), 0);
  const prototypes = await c.readCall("event-prototypes", clone.nativeObjectId, [qualified, constructors.id], 2); await qualify(prototypes.id);
  const members = await c.readCall("members", clone.nativeObjectId, [qualified, prototypes.id], 7); await qualify(members.id);
  for (const [index, slot, name] of [[0, 1, "get target"], [1, 2, "get type"], [2, 7, "get currentTarget"], [3, 8, "get eventPhase"], [4, 4, "get data"], [5, 5, "get origin"], [6, 6, "get source"]] as const) { const id = nativeDescription(members.fields[index], name); qualifyCurrentNativeMessageEventFunction(await c.props(id), slot); }
  const native = async (): Promise<void> => { truth(await c.call("native", clone.nativeObjectId, [qualified, constructors.id, prototypes.id, members.id, publication.nativeRootsObjectId])); };
  await native(); await unchanged();
  const handler = await c.readCall("handler", clone.nativeObjectId, [publication.nativeRootsObjectId, publication.nativeFunctionsObjectId, publication.rootsObjectId, getter.id], 1); await qualify(handler.id);
  const selected = handler.fields[0]; need(selected?.type === "function" && typeof selected.description === "string"); handlerDescription(selected.description, input.variant); handlerMetadata(await c.props(handle(selected)), input.variant, input.script);
  const method = await c.readCall("onMessage", publication.rootsObjectId, [raw.nativeObjectId, qualified, publication.functionsObjectId, publication.functions.onMessage], 1); await qualify(method.id);
  const onMessage = method.fields[0]; need(onMessage?.type === "function" && typeof onMessage.description === "string"); busDescription(onMessage.description, input.variant, "onMessage"); busMetadata(await c.props(handle(onMessage)), input.variant, "onMessage", input.script);
  const sameHandler = async (): Promise<void> => { truth(await c.call("handler-same", clone.nativeObjectId, [publication.nativeRootsObjectId, publication.nativeFunctionsObjectId, publication.rootsObjectId, getter.id, handler.id])); };
  await unchanged(); await sameHandler(); await native(); await c.reprove(input, publication); await unchanged();
  // Re-read the qualified getter around the final snapshot comparison.
  // Registration identity must remain the original function reference.
  await sameHandler(); await unchanged(); await sameHandler(); await unchanged(); host.current();
  const counts = c.counts(); need(counts.preparation + counts.publication <= REQUESTS.reads);
  return Object.freeze({ nativeObjectId: clone.nativeObjectId, busTupleObjectId: publication.rootsObjectId, broadcastChannelObjectId: publication.broadcastChannelObjectId, handlerTupleObjectId: handler.id, handlerObjectId: handle(selected), getOnmessageObjectId, onMessageTupleObjectId: method.id, onMessageObjectId: handle(onMessage), nativeConstructorsObjectId: constructors.id, nativePrototypesObjectId: prototypes.id, nativeMembersObjectId: members.id, qualifiedObjectId: qualified, snapshotObjectId: baseline, dependencyObjectsObjectId: qualified, dependencySnapshotObjectId: baseline, scriptId: input.script, variant: input.variant, originalRequests: counts.preparation + counts.publication, preparationRequests: counts.preparation, publicationReproofRequests: counts.publication, readLimit: REQUESTS.reads, helperLimit: REQUESTS.helpers,
    eventGetters: Object.freeze({ target: handle(members.fields[0]), type: handle(members.fields[1]), currentTarget: handle(members.fields[2]), eventPhase: handle(members.fields[3]), data: handle(members.fields[4]), origin: handle(members.fields[5]), source: handle(members.fields[6]), isTrusted: null }), ownershipIssued: false, originalBodyHeld: false, originalPublisherOwnerVerified: false, callbackReceiverVerified: false, originalBusReceiverVerified: false, trustedEventQualified: false, nativeDeliveryVerified: false, deliveryVerified: false, nativeSenderVerified: false, continuationAuthorized: false, senderAuthorized: false, deliveryAuthorized: false, publicationAuthorized: false, workerAuthorized: false, modifyAuthorized: false, saveAuthorized: false, publicationCompleted: false, workerTextObserved: false, modifyCompleted: false });
}
