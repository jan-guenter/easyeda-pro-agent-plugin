/** Native preparation under the original held publisher entry. The enclosing
 * Core retains the pause and every continuation; this leaf only reads data. */
import { CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_NATIVE_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_NATIVE_FLAGS as FLAGS, CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_NATIVE_REQUESTS as REQUESTS, validateCurrentSchematicRelevancePublicationNativeCommand as validate } from "./current-schematic-relevance-publication-native-protocol.ts";
import type { CurrentSchematicRelevancePublicationNativeCommand as Command } from "./current-schematic-relevance-publication-native-protocol.ts";
import { qualifyCurrentSchematicRelevancePublicationNativeFunction as nativeFunction, currentSchematicRelevancePublicationNativeOrigin as originValue, currentSchematicRelevancePublicationNativeProperties as properties, currentSchematicRelevancePublicationNativeRecord as recordMetadata } from "./current-schematic-relevance-publication-native-replies.ts";
import { currentSchematicRelevanceUiPublicationCapture as capture, currentSchematicRelevanceUiPublicationHandle as handle, currentSchematicRelevanceUiPublicationTrue as truth, currentSchematicRelevanceUiPublicationTuple as tuple } from "./current-schematic-relevance-ui-publication-replies.ts";
import { qualifyCurrentSchematicRelevanceBroadcastCalleeSource as source } from "./current-schematic-relevance-broadcast-callee-source.ts";
import { requireCurrentSchematicRelevanceBroadcastCalleeDescription as busDescription, decodeCurrentSchematicRelevanceBroadcastCalleeFunction as busMetadata } from "./current-schematic-relevance-broadcast-callee-replies.ts";
import { requireCurrentSchematicRelevancePublicationCalleeDescription as publisherDescription, decodeCurrentSchematicRelevancePublicationCalleeFunction as publisherMetadata } from "./current-schematic-relevance-publication-callee-replies.ts";
import { qualifyCurrentNativeSerializedOriginFunction as originFunction, qualifyCurrentNativeSerializedOriginPrototype as originPrototype } from "./current-native-serialized-origin.ts";
import { captureCurrentSchematicDisplayAccessorSource } from "./current-schematic-display-accessor-replies.ts";
import type { CurrentSchematicRelevanceSdkGateInputs } from "./current-schematic-relevance-sdk-gate-collector.ts";

const ROLES = ["publish", "broadcastPublish", "post", "onMessage", "onReceivedPublish"] as const;
const PUBLISHER = ["publisherConstructor", "cachePendData", "publishPendData", "localChange", "uniqueIdGet", "consistencyGetClient", "consistencyGetUnique"] as const;
export interface CurrentSchematicRelevancePublicationNativeHost { readonly current: () => void; readonly request: (command: Command) => Promise<unknown> }
export interface CurrentSchematicRelevancePublicationNativePrepared {
  readonly frameObjectId: string; readonly rootsObjectId: string; readonly functionsObjectId: string; readonly nativeRootsObjectId: string; readonly nativeFunctionsObjectId: string;
  readonly recordsObjectId: string; readonly originChainObjectId: string; readonly originGetterObjectId: string; readonly qualifiedObjectId: string; readonly snapshotObjectId: string;
  readonly dependencyObjectsObjectId: string; readonly dependencySnapshotObjectId: string;
  readonly broadcastChannelObjectId: string; readonly broadcastChannelPrototypeObjectId: string; readonly postMessageObjectId: string;
  readonly promiseObjectId: string; readonly promisePrototypeObjectId: string; readonly resolveObjectId: string; readonly thenObjectId: string; readonly debugObjectId: string;
  readonly functions: Readonly<Record<typeof ROLES[number], string>>; readonly originalRequests: number; readonly readLimit: number; readonly helperLimit: number;
  readonly originalPublisherEntryHeld: true; readonly originalNativeDependenciesVerified: true; readonly originalPushPendSubscriptionAbsent: true;
  readonly nativeSenderVerified: false; readonly deliveryVerified: false; readonly publicationCompleted: false; readonly workerTextObserved: false; readonly modifyCompleted: false; readonly saveAuthorized: false;
  readonly ownershipIssued: false; readonly continuationAuthorized: false; readonly senderAuthorized: false; readonly deliveryAuthorized: false; readonly publicationAuthorized: false; readonly workerAuthorized: false; readonly modifyAuthorized: false;
}
interface ReadTuple { readonly id: string; readonly fields: ReturnType<typeof tuple> }
function need(value: boolean): asserts value { if (!value) { throw new Error("SCH_PUBLICATION_NATIVE_COLLECTOR"); } }
const callCommand = (role: string, objectId: string, args: readonly string[]): Command => { const row = CALLS.find(value => value[0] === role); need(row !== undefined && row[2] === args.length); return validate({ phase: "publication-native-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, functionDeclaration: row[1], arguments: args.map(id => ({ objectId: id })), returnByValue: row[3], awaitPromise: false, userGesture: false } }); };
function commands(host: CurrentSchematicRelevancePublicationNativeHost, limit: number = REQUESTS.reads): {
  readonly send: (command: Command) => Promise<unknown>; readonly props: (id: string) => Promise<unknown>; readonly call: (role: string, id: string, args: readonly string[]) => Promise<unknown>;
  readonly readCall: (role: string, id: string, args: readonly string[], size?: number) => Promise<ReadTuple>; readonly read: (command: Command, size?: number) => Promise<ReadTuple>; readonly count: () => number;
} {
  let count = 0;
  const send = async (command: Command): Promise<unknown> => { host.current(); need(count < limit); count += 1; const reply = await host.request(command); host.current(); return reply; };
  const props = (objectId: string): Promise<unknown> => send(validate({ phase: "publication-native-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }));
  const call = (role: string, id: string, args: readonly string[]): Promise<unknown> => send(callCommand(role, id, args));
  const read = async (request: Command, size?: number): Promise<ReadTuple> => { const id = capture(await send(request)); return Object.freeze({ id, fields: tuple(await props(id), size) }); };
  const readCall = (role: string, id: string, args: readonly string[], size?: number): Promise<ReadTuple> => read(callCommand(role, id, args), size);
  return { send, props, call, readCall, read, count: (): number => count };
}
async function native(input: CurrentSchematicRelevanceSdkGateInputs, c: ReturnType<typeof commands>): Promise<void> {
  const { raw, clone } = input;
  truth(await c.call("hooks", raw.nativeObjectId, [])); truth(await c.call("reflection-reprove", clone.nativeObjectId, []));
  truth(await c.call("native-defaultInstance", clone.nativeObjectId, [clone.nativeGraph.roots, clone.nativeGraph.members, clone.nativeGraph.qualified]));
  truth(await c.call("native-hooks", clone.nativeObjectId, [clone.nativeGraph.roots, clone.nativeGraph.members]));
}
/** A structural result does not recreate an original pause or owner. Callers
 * must supply their private same-generation host at the held publisher entry. */
export async function collectCurrentSchematicRelevancePublicationNative(host: CurrentSchematicRelevancePublicationNativeHost, frameId: string, input: CurrentSchematicRelevanceSdkGateInputs): Promise<CurrentSchematicRelevancePublicationNativePrepared> {
  const c = commands(host), { raw, clone, ui } = input;
  await native(input, c);
  const sourceCommand = validate({ phase: "publication-native-source", method: "Debugger.getScriptSource", params: { scriptId: input.script } });
  const sourceReply = captureCurrentSchematicDisplayAccessorSource(await c.send(sourceCommand)); need(source(sourceReply.scriptSource) === input.variant);
  let objects = 0, qualified = ui.qualifiedObjectId, stages = 0;
  let baseline = await c.readCall("snapshot", qualified, [raw.nativeObjectId]);
  const unchanged = async (): Promise<void> => { truth(await c.call("same-snapshot", baseline.id, [raw.nativeObjectId, qualified])); };
  const qualify = async (id: string): Promise<void> => {
    stages += 1; need(stages <= REQUESTS.graphStages); let candidate = id;
    for (let depth = 0; depth < REQUESTS.prototypeWaves; depth += 1) {
      await unchanged(); const fresh = await c.readCall("novel", candidate, [raw.nativeObjectId, qualified]);
      if (fresh.fields.length === 0) { return; }
      objects += fresh.fields.length; need(objects <= REQUESTS.objects);
      for (const value of fresh.fields) { properties(await c.props(handle(value))); }
      await unchanged(); const merged = await c.readCall("merge", qualified, [raw.nativeObjectId, fresh.id]);
      const parents = await c.readCall("prototypes", fresh.id, [raw.nativeObjectId]);
      await unchanged(); const next = await c.readCall("snapshot", merged.id, [raw.nativeObjectId]);
      await unchanged(); qualified = merged.id; baseline = next; candidate = parents.id;
    }
    throw new Error("SCH_PUBLICATION_NATIVE_PROTOTYPE_BOUND");
  };
  const frameCommand = (): Command => validate({ phase: "publication-native-frame", method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: frameId, expression: "[this]", returnByValue: false, includeCommandLineAPI: false } });
  const frame = await c.read(frameCommand(), 1); await qualify(frame.id);
  const roots = await c.readCall("roots", frame.id, [raw.nativeObjectId, qualified, ui.linksObjectId, ui.stateObjectId], 8); await qualify(roots.id);
  const methods = await c.readCall("methods", roots.id, [raw.nativeObjectId, qualified], ROLES.length); await qualify(methods.id);
  for (const [index, role] of ROLES.entries()) { const fn = methods.fields[index]; need(fn?.type === "function" && typeof fn.description === "string"); busDescription(fn.description, input.variant, role); busMetadata(await c.props(handle(fn)), input.variant, role, input.script); }
  const publisher = await c.readCall("functions", ui.linksObjectId, [raw.nativeObjectId, ui.linksObjectId, qualified], 7);
  truth(await c.call("same-functions", ui.functionsObjectId, [raw.nativeObjectId, publisher.id]));
  for (const [index, role] of PUBLISHER.entries()) { const fn = publisher.fields[index]; need(fn?.type === "function" && typeof fn.description === "string"); publisherDescription(fn.description, input.variant, role); publisherMetadata(await c.props(handle(fn)), input.variant, role, input.script); }
  const natives = await c.readCall("native-roots", clone.nativeObjectId, [raw.nativeObjectId, ui.globalsObjectId, ui.membersObjectId, clone.nativeGraph.roots, clone.nativeGraph.members, qualified, ui.globalObjectId], 10); await qualify(natives.id);
  const nativeMethods = await c.readCall("native-functions", natives.id, [raw.nativeObjectId, qualified, roots.id], 4); await qualify(nativeMethods.id);
  for (const [value, index] of [[natives.fields[0], 0], [natives.fields[2], 1], [nativeMethods.fields[0], 2], [nativeMethods.fields[1], 3], [nativeMethods.fields[2], 4], [nativeMethods.fields[3], 5], [natives.fields[5], 6], [natives.fields[6], 7], [natives.fields[8], 8]] as const) { nativeFunction(await c.props(handle(value)), value, index); }
  const proof = async (): Promise<void> => {
    await unchanged(); await native(input, c);
    truth(await c.call("same-globals", ui.globalObjectId, [raw.nativeObjectId, qualified, ui.globalsObjectId, ui.membersObjectId]));
    truth(await c.call("subscriptions", roots.id, [raw.nativeObjectId, qualified]));
    truth(await c.call("native-proof", clone.nativeObjectId, [natives.id, nativeMethods.id, roots.id, ui.globalsObjectId, ui.membersObjectId]));
  };
  await proof();
  let records = await c.readCall("stores", roots.id, [raw.nativeObjectId, qualified], 3); await qualify(records.id);
  for (const value of records.fields) { recordMetadata(await c.props(handle(value)), value); }
  let complete = false, frontier = records;
  for (let wave = 0; wave < REQUESTS.recordWaves; wave += 1) {
    const next = await c.readCall("records", frontier.id, [raw.nativeObjectId, qualified]);
    const fresh = await c.readCall("novel", next.id, [raw.nativeObjectId, records.id]);
    if (fresh.fields.length === 0) { complete = true; break; }
    need(records.fields.length + fresh.fields.length <= REQUESTS.objects);
    for (const value of fresh.fields) { recordMetadata(await c.props(handle(value)), value); }
    await qualify(fresh.id); records = await c.readCall("merge", records.id, [raw.nativeObjectId, fresh.id]); frontier = fresh;
  }
  need(complete);
  const origin = await c.readCall("origin-begin", clone.nativeObjectId, [], 2);
  let chain = handle(origin.fields[1]), getter: string | null = null, owner = origin.fields[0];
  for (let depth = 0; depth < REQUESTS.originOwners; depth += 1) {
    need(owner !== undefined); const metadata = await c.props(handle(owner));
    if (depth === 0) { properties(metadata); } else { originPrototype(metadata, owner); }
    const step = await c.readCall("origin-step", clone.nativeObjectId, [handle(owner), chain], 5); await qualify(step.id);
    const get = step.fields[2], set = step.fields[3];
    if (get?.type === "function") { originFunction(await c.props(handle(get)), get, "get"); getter = handle(get); }
    else { need(get?.type === "object" && get.subtype === "null" && get.value === null); }
    if (set?.type === "function") { originFunction(await c.props(handle(set)), set, "set"); }
    else { need(set?.type === "object" && set.subtype === "null" && set.value === null); }
    const appended = await c.readCall("origin-append", clone.nativeObjectId, [chain, step.id]); chain = appended.id;
    if (getter !== null) { break; } owner = step.fields[1];
  }
  need(getter !== null); originValue(await c.call("origin-read", clone.nativeObjectId, [chain, getter]));
  await proof(); const final = await c.read(frameCommand(), 1); truth(await c.call("tuple-same", final.id, [raw.nativeObjectId, frame.id]));
  const currentRoots = await c.readCall("roots", final.id, [raw.nativeObjectId, qualified, ui.linksObjectId, ui.stateObjectId], 8);
  truth(await c.call("tuple-same", currentRoots.id, [raw.nativeObjectId, roots.id]));
  originValue(await c.call("origin-read", clone.nativeObjectId, [chain, getter])); await unchanged();
  const dependencies = await c.readCall("dependencies", roots.id, [raw.nativeObjectId, qualified, natives.id]);
  const dependencySnapshot = await c.readCall("snapshot", dependencies.id, [raw.nativeObjectId]); await unchanged();
  truth(await c.call("same-snapshot", dependencySnapshot.id, [raw.nativeObjectId, dependencies.id]));
  return Object.freeze({ frameObjectId: frame.id, rootsObjectId: roots.id, functionsObjectId: methods.id, nativeRootsObjectId: natives.id, nativeFunctionsObjectId: nativeMethods.id, recordsObjectId: records.id, originChainObjectId: chain, originGetterObjectId: getter, qualifiedObjectId: qualified, snapshotObjectId: baseline.id, dependencyObjectsObjectId: dependencies.id, dependencySnapshotObjectId: dependencySnapshot.id,
    broadcastChannelObjectId: handle(roots.fields[2]), broadcastChannelPrototypeObjectId: handle(natives.fields[1]), postMessageObjectId: handle(nativeMethods.fields[1]), promiseObjectId: handle(natives.fields[3]), promisePrototypeObjectId: handle(natives.fields[4]), resolveObjectId: handle(natives.fields[5]), thenObjectId: handle(natives.fields[6]), debugObjectId: handle(natives.fields[8]),
    functions: Object.freeze({ publish: handle(methods.fields[0]), broadcastPublish: handle(methods.fields[1]), post: handle(methods.fields[2]), onMessage: handle(methods.fields[3]), onReceivedPublish: handle(methods.fields[4]) }), originalRequests: c.count(), readLimit: REQUESTS.reads, helperLimit: REQUESTS.helpers,
    originalPublisherEntryHeld: true, originalNativeDependenciesVerified: true, originalPushPendSubscriptionAbsent: true, nativeSenderVerified: false, deliveryVerified: false, publicationCompleted: false, workerTextObserved: false, modifyCompleted: false, saveAuthorized: false,
    ownershipIssued: false, continuationAuthorized: false, senderAuthorized: false, deliveryAuthorized: false, publicationAuthorized: false, workerAuthorized: false, modifyAuthorized: false });
}
/** Each use needs its own enclosing original-owner request reservation. This
 * compares stable dependencies only; it neither accepts pending-state deltas
 * nor establishes that any sender, continuation or publication completed. */
export async function reproveCurrentSchematicRelevancePublicationNative(host: CurrentSchematicRelevancePublicationNativeHost, input: CurrentSchematicRelevanceSdkGateInputs, prepared: CurrentSchematicRelevancePublicationNativePrepared): Promise<number> {
  const c = commands(host, REQUESTS.reproofReads), { clone, raw, ui } = input;
  const unchanged = async (): Promise<void> => { truth(await c.call("same-snapshot", prepared.dependencySnapshotObjectId, [raw.nativeObjectId, prepared.dependencyObjectsObjectId])); };
  await unchanged(); await native(input, c);
  truth(await c.call("same-globals", ui.globalObjectId, [raw.nativeObjectId, prepared.qualifiedObjectId, ui.globalsObjectId, ui.membersObjectId]));
  const roots = await c.readCall("roots", prepared.frameObjectId, [raw.nativeObjectId, prepared.qualifiedObjectId, ui.linksObjectId, ui.stateObjectId], 8);
  truth(await c.call("tuple-same", roots.id, [raw.nativeObjectId, prepared.rootsObjectId]));
  const methods = await c.readCall("methods", roots.id, [raw.nativeObjectId, prepared.qualifiedObjectId], 5);
  truth(await c.call("tuple-same", methods.id, [raw.nativeObjectId, prepared.functionsObjectId]));
  const publisher = await c.readCall("functions", ui.linksObjectId, [raw.nativeObjectId, ui.linksObjectId, prepared.qualifiedObjectId], 7);
  truth(await c.call("same-functions", ui.functionsObjectId, [raw.nativeObjectId, publisher.id]));
  truth(await c.call("native-proof", clone.nativeObjectId, [prepared.nativeRootsObjectId, prepared.nativeFunctionsObjectId, roots.id, ui.globalsObjectId, ui.membersObjectId]));
  truth(await c.call("subscriptions", roots.id, [raw.nativeObjectId, prepared.qualifiedObjectId]));
  originValue(await c.call("origin-read", clone.nativeObjectId, [prepared.originChainObjectId, prepared.originGetterObjectId])); await unchanged(); return c.count();
}
