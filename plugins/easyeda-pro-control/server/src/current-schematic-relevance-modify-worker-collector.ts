/** Passive worker preparation from one original opaque PROJECT handle. No
 * construction runner, event, callback receiver or continuation is adopted. */
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_FLAGS as FLAGS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_REQUESTS as REQUESTS, validateCurrentSchematicRelevanceModifyWorkerCommand as validate } from "./current-schematic-relevance-modify-worker-protocol.ts";
import type { CurrentSchematicRelevanceModifyWorkerCommand as Command } from "./current-schematic-relevance-modify-worker-protocol.ts";
import { currentSchematicRelevanceModifyWorkerField as field, qualifyCurrentSchematicRelevanceModifyWorkerFunction as functionMetadata, currentSchematicRelevanceModifyWorkerParent as parent, currentSchematicRelevanceModifyWorkerScript as script, qualifyCurrentSchematicRelevanceModifyWorkerSource as source, currentSchematicRelevanceModifyWorkerString as stringValue } from "./current-schematic-relevance-modify-worker-replies.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_PROGRAMS as P } from "./current-schematic-relevance-modify-worker-programs.ts";
import { currentSchematicRelevanceUiPublicationCapture as capture, currentSchematicRelevanceUiPublicationHandle as handle, currentSchematicRelevanceUiPublicationProperties as properties, currentSchematicRelevanceUiPublicationTrue as truth, currentSchematicRelevanceUiPublicationTuple as tuple } from "./current-schematic-relevance-ui-publication-replies.ts";
import type { CurrentSchematicRelevanceUiPublicationRemote as Remote } from "./current-schematic-relevance-ui-publication-replies.ts";
import { qualifyCurrentNativeOwnDataFunction } from "./current-native-own-data-intrinsics.ts";
import { decodeCurrentNativeFunctionMetadata } from "./current-native-function-metadata.ts";
import { qualifyCurrentNativeEventConstructor, qualifyCurrentNativeMessageEventFunction } from "./current-native-message-event-metadata.ts";
import { captureCurrentSchematicDisplayAccessorSource } from "./current-schematic-display-accessor-replies.ts";

export interface CurrentSchematicRelevanceModifyWorkerHost { readonly uniqueContextId: string; readonly current: () => void; readonly request: (command: Command) => Promise<unknown> }
export interface CurrentSchematicRelevanceModifyWorkerPrepared {
  readonly projectObjectId: string; readonly nativeObjectId: string; readonly projectTupleObjectId: string; readonly busObjectId: string; readonly busTupleObjectId: string; readonly broadcastChannelObjectId: string;
  readonly subscriptionTupleObjectId: string; readonly subscribedRosterObjectId: string; readonly taskTupleObjectId: string; readonly selectedTaskObjectId: string; readonly functionsObjectId: string; readonly handlerTupleObjectId: string; readonly handlerObjectId: string; readonly batchCallbackObjectId: string;
  readonly nativeConstructorsObjectId: string; readonly nativePrototypesObjectId: string; readonly nativeMembersObjectId: string; readonly qualifiedObjectId: string; readonly snapshotObjectId: string; readonly dependencyObjectsObjectId: string; readonly dependencySnapshotObjectId: string;
  readonly uniqueContextId: string; readonly scriptId: string; readonly channel: string; readonly originalRequests: number; readonly readLimit: number; readonly helperLimit: number;
  readonly eventGetters: Readonly<{ target: string; type: string; currentTarget: string; eventPhase: string; data: string; origin: string; source: string; isTrusted: null }>;
  readonly ownershipIssued: false; readonly originalWorkerOwnerVerified: false; readonly callbackReceiverVerified: false; readonly batchReceiverVerified: false; readonly clockVerified: false; readonly originalBodyHeld: false;
  readonly nativeDeliveryVerified: false; readonly trustedEventQualified: false; readonly senderAuthorized: false; readonly modifyCompleted: false; readonly modifyAuthorized: false; readonly saveAuthorized: false;
}
interface ReadTuple { readonly id: string; readonly fields: ReturnType<typeof tuple> }
function need(value: boolean): asserts value { if (!value) { throw new Error("SCH_MODIFY_WORKER_COLLECTOR"); } }
function callCommand(role: string, objectId: string, args: readonly string[]): Command { const row = CALLS.find(value => value[0] === role); need(row !== undefined && row[2] === args.length); return validate({ phase: "modify-worker-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, functionDeclaration: row[1], arguments: args.map(id => ({ objectId: id })), returnByValue: row[3], awaitPromise: false, userGesture: false } }); }
function commands(host: CurrentSchematicRelevanceModifyWorkerHost): { readonly send: (command: Command) => Promise<unknown>; readonly props: (id: string) => Promise<unknown>; readonly call: (role: string, id: string, args: readonly string[]) => Promise<unknown>; readonly read: (command: Command, size?: number) => Promise<ReadTuple>; readonly readCall: (role: string, id: string, args: readonly string[], size?: number) => Promise<ReadTuple>; readonly count: () => number } {
  let count = 0; const originalContext = host.uniqueContextId;
  const send = async (command: Command): Promise<unknown> => { host.current(); need(host.uniqueContextId === originalContext && count < REQUESTS.reads); count += 1; const reply = await host.request(command); host.current(); need(host.uniqueContextId === originalContext); return reply; };
  const props = (objectId: string): Promise<unknown> => send(validate({ phase: "modify-worker-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }));
  const call = (role: string, id: string, args: readonly string[]): Promise<unknown> => send(callCommand(role, id, args));
  const read = async (command: Command, size?: number): Promise<ReadTuple> => { const id = capture(await send(command)); return Object.freeze({ id, fields: tuple(await props(id), size) }); };
  const readCall = (role: string, id: string, args: readonly string[], size?: number): Promise<ReadTuple> => read(callCommand(role, id, args), size);
  return { send, props, call, read, readCall, count: (): number => count };
}
function nativeDescription(actual: Remote | undefined, name: string): string { need(actual?.type === "function" && actual.className === "Function" && actual.description === `function ${name}() { [native code] }` && actual.subtype === undefined); return handle(actual); }
function bootstrapConstructor(input: unknown, actual: Remote, name: "Object" | "Array"): void {
  nativeDescription(actual, name); const packet = properties(input); need(packet.result.length >= 3 && packet.internalProperties?.length === 2);
  const length = field(input, "length"), named = field(input, "name"), prototype = field(input, "prototype"); need(named.type === "string" && named.value === name && length.type === "number" && length.value === 1 && prototype.type === "object" && prototype.objectId !== undefined);
  const parentValue = parent(input); need(parentValue.type === "function" && parentValue.description === "function () { [native code] }" && packet.internalProperties.some(value => value.name === "[[Scopes]]" && value.value.description === "Scopes[0]"));
}
async function bootstrap(host: CurrentSchematicRelevanceModifyWorkerHost, c: ReturnType<typeof commands>): Promise<string> {
  const literal = await c.read(validate({ phase: "modify-worker-literal", method: "Runtime.evaluate", params: { ...FLAGS, expression: `(${P.literal})()`, uniqueContextId: host.uniqueContextId, returnByValue: false, includeCommandLineAPI: false, awaitPromise: false, userGesture: false } }), 4);
  const root = handle(literal.fields[0]); const objectLiteral = await c.props(handle(literal.fields[1])); const arrayLiteral = await c.props(handle(literal.fields[2])); const functionLiteral = await c.props(handle(literal.fields[3])); properties(await c.props(root));
  const objectProto = handle(parent(objectLiteral)); const arrayProto = handle(parent(arrayLiteral)); const functionProto = handle(parent(functionLiteral));
  const objectProperties = await c.props(objectProto); const arrayProperties = await c.props(arrayProto); const functionProperties = await c.props(functionProto); properties(objectProperties); properties(arrayProperties); properties(functionProperties);
  const object = field(objectProperties, "constructor"); const array = field(arrayProperties, "constructor"); const objectCtor = await c.props(handle(object)); const arrayCtor = await c.props(handle(array)); bootstrapConstructor(objectCtor, object, "Object"); bootstrapConstructor(arrayCtor, array, "Array");
  const identities = [objectProto, arrayProto, functionProto, handle(field(objectCtor, "prototype")), handle(field(arrayCtor, "prototype")), handle(parent(objectCtor)), handle(parent(arrayCtor))]; truth(await c.call("identities", root, identities));
  const methods = [field(objectCtor, "getOwnPropertyDescriptor"), field(objectCtor, "getPrototypeOf"), field(objectCtor, "hasOwn"), field(objectCtor, "getOwnPropertyNames"), field(objectCtor, "getOwnPropertySymbols"), field(arrayCtor, "isArray"), field(functionProperties, "apply")];
  for (const [index, name] of ["getOwnPropertyDescriptor", "getPrototypeOf", "hasOwn", "getOwnPropertyNames", "getOwnPropertySymbols", "isArray", "apply"].entries()) { const id = nativeDescription(methods[index], name); qualifyCurrentNativeOwnDataFunction(await c.props(id), index); }
  const native = await c.readCall("bind", root, [...methods.map(value => handle(value)), objectProto, arrayProto, functionProto, root], 11); truth(await c.call("reprove", native.id, [])); return native.id;
}
/** The host and PROJECT association come from the same original Core worker
 * context. Returned data issues no owner, receiver, event or execution token. */
export async function collectCurrentSchematicRelevanceModifyWorker(host: CurrentSchematicRelevanceModifyWorkerHost, projectObjectId: string): Promise<CurrentSchematicRelevanceModifyWorkerPrepared> {
  const c = commands(host), native = await bootstrap(host, c); const empty = await c.readCall("empty", native, [], 0); let qualified = empty.id;
  let baseline = await c.readCall("snapshot", native, [qualified]), objects = 0, stages = 0;
  const unchanged = async (): Promise<void> => { truth(await c.call("same", native, [baseline.id, qualified])); };
  const qualify = async (id: string): Promise<void> => {
    stages += 1; need(stages <= REQUESTS.stages); let candidate = id;
    for (let wave = 0; wave < REQUESTS.prototypeWaves; wave += 1) {
      await unchanged(); const fresh = await c.readCall("novel", native, [candidate, qualified]); if (fresh.fields.length === 0) { return; }
      objects += fresh.fields.length; need(objects <= REQUESTS.objects); for (const value of fresh.fields) { properties(await c.props(handle(value))); }
      await unchanged(); const merged = await c.readCall("merge", native, [qualified, fresh.id]), parents = await c.readCall("parents", native, [fresh.id, merged.id]);
      await unchanged(); const next = await c.readCall("snapshot", native, [merged.id]); await unchanged(); qualified = merged.id; baseline = next; candidate = parents.id;
    } throw new Error("SCH_MODIFY_WORKER_PROTOTYPE_BOUND");
  };
  const seed = await c.readCall("seed", native, [projectObjectId], 5); await qualify(seed.id);
  const project = await c.readCall("project", native, [projectObjectId, qualified], 2); await qualify(project.id);
  const bus = await c.readCall("bus", native, [project.id, qualified], 3); await qualify(bus.id);
  const subscription = await c.readCall("subscription", native, [bus.id, qualified], 1); await qualify(subscription.id);
  const task = await c.readCall("task", native, [subscription.id, qualified], 1); await qualify(task.id);
  const functions = await c.readCall("functions", native, [project.id, bus.id, task.id, qualified], 10); await qualify(functions.id);
  const projectMetadata = await c.props(handle(functions.fields[0])), scriptId = script(projectMetadata); const sourceReply = await c.send(validate({ phase: "modify-worker-source", method: "Debugger.getScriptSource", params: { scriptId } })); source(captureCurrentSchematicDisplayAccessorSource(sourceReply).scriptSource);
  for (const [index, role] of (["projectConstructor", "channelConstructor", "busConstructor", "baseConstructor", "onMessage", "onReceivedPublish", "batch", "taskConstructor", "running", "execute"] as const).entries()) { functionMetadata(await c.props(handle(functions.fields[index])), functions.fields[index], role, scriptId); }
  const constructors = await c.readCall("constructors", native, [qualified], 4); await qualify(constructors.id);
  for (const [index, expected] of [[0, { name: "BroadcastChannel", arity: 1, constructor: true, parentDescription: "function EventTarget() { [native code] }" }], [1, { name: "EventTarget", arity: 0, constructor: true }]] as const) { nativeDescription(constructors.fields[index], expected.name); decodeCurrentNativeFunctionMetadata(await c.props(handle(constructors.fields[index])), expected); }
  nativeDescription(constructors.fields[2], "Event"); qualifyCurrentNativeEventConstructor(await c.props(handle(constructors.fields[2]))); nativeDescription(constructors.fields[3], "MessageEvent"); qualifyCurrentNativeMessageEventFunction(await c.props(handle(constructors.fields[3])), 0);
  const prototypes = await c.readCall("prototypes", native, [constructors.id, qualified], 4); await qualify(prototypes.id);
  const members = await c.readCall("members", native, [prototypes.id, qualified], 11); await qualify(members.id);
  for (const [index, name, arity] of [[0, "get name", 0], [1, "get onmessage", 0], [2, "set onmessage", 1], [3, "postMessage", 1]] as const) { nativeDescription(members.fields[index], name); decodeCurrentNativeFunctionMetadata(await c.props(handle(members.fields[index])), { name, arity, constructor: false }); }
  for (const [index, slot, name] of [[4, 1, "get target"], [5, 2, "get type"], [6, 7, "get currentTarget"], [7, 8, "get eventPhase"], [8, 4, "get data"], [9, 5, "get origin"], [10, 6, "get source"]] as const) { nativeDescription(members.fields[index], name); qualifyCurrentNativeMessageEventFunction(await c.props(handle(members.fields[index])), slot); }
  truth(await c.call("bindings", native, [project.id, bus.id, task.id, functions.id, qualified]));
  await unchanged(); truth(await c.call("native", native, [constructors.id, prototypes.id, members.id, bus.id]));
  const channel = stringValue(await c.call("channel", native, [bus.id, members.id, qualified])); const handler = await c.readCall("handler", native, [bus.id, members.id], 1); await qualify(handler.id); functionMetadata(await c.props(handle(handler.fields[0])), handler.fields[0], "handler", scriptId);
  truth(await c.call("reprove", native, [])); truth(await c.call("native", native, [constructors.id, prototypes.id, members.id, bus.id])); truth(await c.call("handler-same", native, [bus.id, members.id, handler.id])); truth(await c.call("bindings", native, [project.id, bus.id, task.id, functions.id, qualified])); need(stringValue(await c.call("channel", native, [bus.id, members.id, qualified])) === channel); await unchanged();
  const dependencies = await c.readCall("dependencies", native, [qualified, bus.id, subscription.id, task.id]); const dependencySnapshot = await c.readCall("snapshot", native, [dependencies.id]); await unchanged();
  return Object.freeze({ projectObjectId, nativeObjectId: native, projectTupleObjectId: project.id, busObjectId: handle(bus.fields[0]), busTupleObjectId: bus.id, broadcastChannelObjectId: handle(bus.fields[1]), subscriptionTupleObjectId: subscription.id, subscribedRosterObjectId: handle(subscription.fields[0]), taskTupleObjectId: task.id, selectedTaskObjectId: handle(task.fields[0]), functionsObjectId: functions.id, handlerTupleObjectId: handler.id, handlerObjectId: handle(handler.fields[0]), batchCallbackObjectId: handle(functions.fields[6]), nativeConstructorsObjectId: constructors.id, nativePrototypesObjectId: prototypes.id, nativeMembersObjectId: members.id, qualifiedObjectId: qualified, snapshotObjectId: baseline.id, dependencyObjectsObjectId: dependencies.id, dependencySnapshotObjectId: dependencySnapshot.id, uniqueContextId: host.uniqueContextId, scriptId, channel, originalRequests: c.count(), readLimit: REQUESTS.reads, helperLimit: REQUESTS.helpers,
    eventGetters: Object.freeze({ target: handle(members.fields[4]), type: handle(members.fields[5]), currentTarget: handle(members.fields[6]), eventPhase: handle(members.fields[7]), data: handle(members.fields[8]), origin: handle(members.fields[9]), source: handle(members.fields[10]), isTrusted: null }), ownershipIssued: false, originalWorkerOwnerVerified: false, callbackReceiverVerified: false, batchReceiverVerified: false, clockVerified: false, originalBodyHeld: false, nativeDeliveryVerified: false, trustedEventQualified: false, senderAuthorized: false, modifyCompleted: false, modifyAuthorized: false, saveAuthorized: false });
}
