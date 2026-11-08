// oxlint-disable import/max-dependencies -- This readonly join keeps the independent source, metadata, native and original graph validators separate.
/** Fresh DEL registration preparation while its original outer RPC is held.
 * Historical GET handles are compared by identity; no old guard is called. */
import { CURRENT_FOOTPRINT_INVERSE_DELETE_MANAGER_CALLS as CALLS, CURRENT_FOOTPRINT_INVERSE_DELETE_MANAGER_FLAGS as FLAGS, CURRENT_FOOTPRINT_INVERSE_DELETE_MANAGER_REQUESTS as REQUESTS, validateCurrentFootprintInverseDeleteManagerCommand as validate } from "./current-footprint-inverse-delete-manager-protocol.ts";
import type { CurrentFootprintInverseDeleteManagerCommand as Command } from "./current-footprint-inverse-delete-manager-protocol.ts";
import { currentFootprintInverseDeleteManagerCallbackScope as callbackScope, currentFootprintInverseDeleteManagerClassScope as classScope, currentFootprintInverseDeleteManagerModuleScope as moduleScope } from "./current-footprint-inverse-delete-manager-replies.ts";
import { requireCurrentFootprintInverseDeleteManagerDescription as deleteDescription, qualifyCurrentFootprintInverseDeleteManagerFunction as deleteMetadata } from "./current-footprint-inverse-delete-manager-source.ts";
import { currentFootprintInverseLookupArray as array, currentFootprintInverseLookupObject as object, currentFootprintInverseLookupProperties as properties, currentFootprintInverseLookupResult as result } from "./current-footprint-inverse-lookup-preentry-replies.ts";
import type { CurrentFootprintInverseLookupRemote as Remote } from "./current-footprint-inverse-lookup-preentry-replies.ts";
import { requireCurrentFootprintInverseInitializedGetDescription as description } from "./current-footprint-inverse-initialized-get-source.ts";
import type { CurrentFootprintInverseInitializedGetRole as Role } from "./current-footprint-inverse-initialized-get-source.ts";
import { decodeCurrentFootprintInverseInitializedGetFunction as metadata } from "./current-footprint-inverse-initialized-get-replies.ts";
import { qualifyCurrentFootprintInverseLookupNativeConstructor as constructor, qualifyCurrentFootprintInverseLookupNativeMethod as nativeMethod } from "./current-footprint-inverse-lookup-native-metadata.ts";
import { currentFootprintInverseLookupIdentity } from "./current-footprint-inverse-lookup-identity.ts";
import type { CurrentFootprintInverseLookupIdentity } from "./current-footprint-inverse-lookup-identity.ts";
import { requireCurrentFootprintInversePublicServiceTrue as truth } from "./current-footprint-inverse-public-service-replies.ts";
import type { CurrentFootprintInverseGetForwardingGraph } from "./current-footprint-inverse-get-forwarding-collector.ts";
import type { CurrentFootprintInverseGetManagerGraph } from "./current-footprint-inverse-get-manager-collector.ts";

interface Tuple { readonly id: string; readonly values: readonly Remote[]; readonly packets: readonly unknown[] }
export interface CurrentFootprintInverseDeleteManagerBindings {
  readonly receipt: string; readonly selected: string; readonly functions: string; readonly native: string; readonly rpc: string; readonly entry: string;
  readonly profile: "ui" | "manager"; readonly uiScriptId: string; readonly managerScriptId: string; readonly asyncPrototype: string;
  readonly target: CurrentFootprintInverseLookupIdentity;
  readonly forwarding: CurrentFootprintInverseGetForwardingGraph; readonly manager: CurrentFootprintInverseGetManagerGraph;
  readonly current: () => void; readonly request: (command: Command) => Promise<unknown>;
}
export interface CurrentFootprintInverseDeleteManagerPrepared {
  readonly profile: "ui" | "manager"; readonly entry: string; readonly rpcScope: string;
  readonly roots: string; readonly module: string; readonly queue: string; readonly task: string; readonly members: string; readonly methods: string; readonly reply: string;
  readonly callbackScope: string; readonly handlerScope: string; readonly bodyScope: string; readonly lookupScope: string;
  readonly handler: string; readonly body: string; readonly managerModule: string;
  readonly registry: string; readonly map: string; readonly mapMethods: string; readonly selected: string; readonly project: string; readonly footprint: string;
  readonly method: string; readonly methodScope: string; readonly topics: string; readonly topicGroup: string; readonly innerTopic: string;
  readonly callbackId: string; readonly handlerId: string; readonly bodyId: string; readonly methodId: string; readonly busId: string;
  /** Prospective original ticket, before rpcCall executes or increments it. */
  readonly replyTopic: string;
  readonly calls: number; readonly properties: number;
  readonly applicationMethodInvoked: false; readonly outerRpcResumed: false;
  readonly nativeForwardingProved: false; readonly workerJobIssued: false; readonly deletionReady: false;
}
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_DELETE_MANAGER_PREPARATION"); } }

export async function collectCurrentFootprintInverseDeleteManager(b: CurrentFootprintInverseDeleteManagerBindings): Promise<Readonly<CurrentFootprintInverseDeleteManagerPrepared>> {
  need(b.profile === "ui" || b.profile === "manager");
  const identity = currentFootprintInverseLookupIdentity(b.target);
  let calls = 0, propertyCount = 0;
  const props = async (objectId: string): Promise<unknown> => { b.current(); propertyCount += 1; const raw = await b.request(validate({ phase: "inverse-delete-manager-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } })); b.current(); return raw; };
  const call = async (role: keyof typeof CALLS, refs: readonly string[]): Promise<unknown> => { b.current(); calls += 1; const row = CALLS[role]; const args: unknown[] = refs.map(objectId => ({ objectId })); if (row.value) { args.push({ value: identity }); } const raw = await b.request(validate({ phase: "inverse-delete-manager-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: b.receipt, functionDeclaration: row.program, arguments: args, returnByValue: row.byValue } })); b.current(); return raw; };
  // Each returned opaque value is checked before a later projection traverses it.
  // The specialized original I11 root is never enumerated as an ordinary object.
  const readTuple = async (id: string, size: number): Promise<Tuple> => { const values = array(await props(id), size); const packets: unknown[] = []; for (const value of values) { if (value.type === "object" && value.subtype !== "null" || value.type === "function") { const raw = await props(object(value)); properties(raw); packets.push(raw); } else { packets.push(null); } } return { id, values, packets }; };
  const tuple = async (role: keyof typeof CALLS, refs: readonly string[], size: number): Promise<Tuple> => readTuple(result(await call(role, refs), size), size);
  const qualify = (captured: Tuple, index: number, role: Role, scriptId: string): Readonly<{ scriptId: string; scopes: string }> => { const fn = captured.values[index]; need(fn?.type === "function" && typeof fn.description === "string"); description(fn.description, role); return metadata(captured.packets[index], role, scriptId); };
  const functionId = (captured: Tuple, index: number): string => { const fn = captured.values[index]; need(fn?.type === "function"); return object(fn); };
  const scriptId = b.profile === "ui" ? b.uiScriptId : b.managerScriptId;
  const roots = await tuple("outer", [b.selected, b.functions, b.forwarding.module, b.entry, b.rpc], 6);
  const originalFunctions = await readTuple(b.functions, 4);
  const rpcMetadata = qualify(originalFunctions, 1, b.profile === "ui" ? "uiBusRpcCall" : "managerBusRpcCall", scriptId);
  const rpcScope = moduleScope(await props(rpcMetadata.scopes));
  const module = await tuple(b.profile === "ui" ? "moduleUi" : "moduleManager", [rpcScope, b.forwarding.module, roots.id], 14);
  const moduleRoles = b.profile === "ui" ? ["uiBusClass", "uiTaskClass", "uiClone", "uiEnsureArray", "uiEnsure", "uiRemove", "uiWeakRef", "uiDeref"] as const : ["managerBusClass", "managerTaskClass", "managerClone", "managerEnsureArray", "managerEnsure", "managerRemove", "managerWeakRef", "managerDeref"] as const;
  for (const [index, role] of moduleRoles.entries()) { qualify(module, index, role, scriptId); }
  const queue = await tuple("queue", [roots.id, module.id], 2); const task = await tuple("task", [queue.id], 2); const members = await tuple("members", [task.id, module.id], 3);
  const methods = await tuple("methods", [roots.id, module.id, members.id, b.forwarding.methods], 13);
  const methodRoles = b.profile === "ui" ? ["uiBusUniqueRpcTopic", "uiBusPublish", "uiBusSubscribe", "uiBusPush", "uiBusPull", "uiBusPullA", "uiBusRpcService", "uiBusRpcCall", "uiBusRpcReply", "uiTaskCancel", "uiTaskRunning", "uiTaskExecute"] as const : ["managerBusUniqueRpcTopic", "managerBusPublish", "managerBusSubscribe", "managerBusPush", "managerBusPull", "managerBusPullA", "managerBusRpcService", "managerBusRpcCall", "managerBusRpcReply", "managerTaskCancel", "managerTaskRunning", "managerTaskExecute"] as const;
  for (const [index, role] of methodRoles.entries()) { qualify(methods, index, role, scriptId); }
  const reply = await tuple("reply", [roots.id, module.id, queue.id, task.id, members.id, methods.id], 2); const key = reply.values[0];
  need(key?.type === "string" && typeof key.value === "string" && /^_MSG_BUS_RPC_-\/PrjDB\/footprint\/delete-[a-f\d]{32}-(?:0|[1-9]\d{0,15})$/u.test(key.value));
  const callback = qualify(members, 1, b.profile === "ui" ? "uiBusRpcServiceCallback1" : "managerBusRpcServiceCallback1", scriptId);
  const originalCallbackScope = callbackScope(await props(callback.scopes), "rpcService");
  const handler = await tuple(b.profile === "ui" ? "handlerUi" : "handlerManager", [originalCallbackScope, members.id], 2);
  const handlerMetadata = qualify(handler, 0, "managerRegisterServiceCallback1", b.managerScriptId); const originalHandlerScope = callbackScope(await props(handlerMetadata.scopes), "V");
  const body = await tuple("body", [originalHandlerScope, handler.id], 2); const bodyFunction = body.values[0];
  need(bodyFunction?.type === "function" && typeof bodyFunction.description === "string"); deleteDescription(bodyFunction.description, "handler");
  const bodyScopes = deleteMetadata(body.packets[0], "handler", b.managerScriptId); const bodyScope = moduleScope(await props(bodyScopes));
  const managerModule = await tuple("managerModule", [bodyScope, body.id, b.forwarding.managerModule], 4);
  qualify(managerModule, 0, "managerApplyArguments", b.managerScriptId); const lookupMetadata = qualify(managerModule, 1, "managerProjectLookup", b.managerScriptId);
  const originalLookupScope = moduleScope(await props(lookupMetadata.scopes)); const lookup = await tuple("lookupScope", [originalLookupScope, managerModule.id], 1);
  const registry = await tuple("registry", [managerModule.id, b.manager.registry], 5); const instanceMetadata = qualify(registry, 1, "managerProjectRegistryInstance", b.managerScriptId);
  const selfScope = classScope(await props(instanceMetadata.scopes)); truth(await call("registrySelf", [selfScope, registry.id]));
  const map = await tuple("registryMap", [registry.id, b.manager.map], 4);
  need(map.values[1]?.type === "object" && map.values[1].subtype === "map" && map.values[1].className === "Map");
  const native = await readTuple(b.manager.native, 2); constructor(native.packets[0], native.values[0], "Map");
  await readTuple(b.manager.nativePrototype, 2);
  const mapMethods = await tuple("mapMethods", [registry.id, map.id, b.manager.native, b.manager.nativePrototype, b.manager.methods], 3);
  qualify(mapMethods, 0, "managerProjectRegistryGet", b.managerScriptId); nativeMethod(mapMethods.packets[1], mapMethods.values[1], "get");
  // Only the metadata-qualified native Map.get executes; K/getInstance and all
  // Application lookup/delete/transport methods remain uncalled.
  const selected = await tuple("selected", [registry.id, map.id, mapMethods.id, b.manager.selected], 2);
  const project = await tuple("project", [selected.id, b.manager.project], 3); const footprint = await tuple("footprint", [selected.id, project.id, b.manager.footprint], 2);
  const method = await tuple("method", [footprint.id, b.manager.getData, b.asyncPrototype], 3); const methodFunction = method.values[0];
  need(methodFunction?.type === "function" && typeof methodFunction.description === "string"); deleteDescription(methodFunction.description, "method");
  const methodScopes = deleteMetadata(method.packets[0], "method", b.managerScriptId); const methodScope = moduleScope(await props(methodScopes));
  const topics = await tuple("topics", [methodScope, method.id], 2); const topicGroup = await tuple("topicGroup", [topics.id], 2); const innerTopic = await tuple("innerTopic", [topicGroup.id], 1);
  truth(await call("before", [reply.id, lookup.id, method.id, innerTopic.id])); b.current();
  const bus = project.values[1]; need(bus !== undefined && calls === REQUESTS.calls && propertyCount === REQUESTS.properties);
  return Object.freeze({ profile: b.profile, entry: b.entry, rpcScope, roots: roots.id, module: module.id, queue: queue.id, task: task.id, members: members.id, methods: methods.id, reply: reply.id, callbackScope: originalCallbackScope, handlerScope: originalHandlerScope, bodyScope, lookupScope: lookup.id, handler: handler.id, body: body.id, managerModule: managerModule.id, registry: registry.id, map: map.id, mapMethods: mapMethods.id, selected: selected.id, project: project.id, footprint: footprint.id, method: method.id, methodScope, topics: topics.id, topicGroup: topicGroup.id, innerTopic: innerTopic.id, callbackId: functionId(members, 1), handlerId: functionId(handler, 0), bodyId: functionId(body, 0), methodId: functionId(method, 0), busId: object(bus), replyTopic: key.value, calls, properties: propertyCount, applicationMethodInvoked: false, outerRpcResumed: false, nativeForwardingProved: false, workerJobIssued: false, deletionReady: false });
}
