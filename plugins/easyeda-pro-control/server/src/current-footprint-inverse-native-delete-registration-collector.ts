// oxlint-disable import/max-dependencies -- Independent source, metadata, graph and fixed-program validators retain separate evidence boundaries.
/** Fresh native-route registration data. Scope mirrors are preparation values,
 * never live lexical proof after a resume. No Call or Job is issued here. */
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_REGISTRATION_CALLS as CALLS, CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_REGISTRATION_FLAGS as FLAGS, CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_REGISTRATION_REQUESTS as LIMIT, validateCurrentFootprintInverseNativeDeleteRegistrationCommand as validate } from "./current-footprint-inverse-native-delete-registration-protocol.ts";
import type { CurrentFootprintInverseNativeDeleteRegistrationCommand as Command } from "./current-footprint-inverse-native-delete-registration-protocol.ts";
import type { CurrentFootprintInverseNativeDeleteSenderPrepared as Sender } from "./current-footprint-inverse-native-delete-sender-collector.ts";
import { currentFootprintInverseGetManagerClassScope as classScope, collectCurrentFootprintInverseGetManager as collectManager } from "./current-footprint-inverse-get-manager-collector.ts";
import type { CurrentFootprintInverseGetManagerGraph as Manager } from "./current-footprint-inverse-get-manager-collector.ts";
import { currentFootprintInverseGetForwardingClosure as closure } from "./current-footprint-inverse-get-forwarding-collector.ts";
import { currentFootprintInverseGetRpcEntryScope as moduleScope } from "./current-footprint-inverse-get-rpc-entry-replies.ts";
import { currentFootprintInverseLookupArray as array, currentFootprintInverseLookupObject as object, currentFootprintInverseLookupProperties as properties, currentFootprintInverseLookupResult as result } from "./current-footprint-inverse-lookup-preentry-replies.ts";
import type { CurrentFootprintInverseLookupRemote as Remote } from "./current-footprint-inverse-lookup-preentry-replies.ts";
import { requireCurrentFootprintInverseInitializedGetDescription as description } from "./current-footprint-inverse-initialized-get-source.ts";
import type { CurrentFootprintInverseInitializedGetRole as SourceRole } from "./current-footprint-inverse-initialized-get-source.ts";
import { decodeCurrentFootprintInverseInitializedGetFunction as metadata } from "./current-footprint-inverse-initialized-get-replies.ts";
import { requireCurrentFootprintInverseDeleteManagerDescription as deleteDescription, qualifyCurrentFootprintInverseDeleteManagerFunction as deleteMetadata } from "./current-footprint-inverse-delete-manager-source.ts";
import { currentFootprintInverseLookupNativeResult as remoteResult } from "./current-footprint-inverse-lookup-native-metadata.ts";
import { currentFootprintInverseLookupIdentity } from "./current-footprint-inverse-lookup-identity.ts";
import type { CurrentFootprintInverseLookupIdentity as Identity } from "./current-footprint-inverse-lookup-identity.ts";
import { requireCurrentFootprintInversePublicServiceTrue as truth } from "./current-footprint-inverse-public-service-replies.ts";

interface Tuple { readonly id: string; readonly values: readonly Remote[]; readonly packets: readonly unknown[] }
export interface CurrentFootprintInverseNativeDeleteRegistrationBindings { readonly receipt: string; readonly sender: Sender; readonly uiScriptId: string; readonly managerScriptId: string; readonly target: Identity; readonly current: () => void; readonly request: (command: Command) => Promise<unknown> }
export interface CurrentFootprintInverseNativeDeleteRegistrationPrepared {
  readonly members: string; readonly handler: string; readonly body: string; readonly module: string; readonly manager: Manager; readonly method: string; readonly topics: string; readonly topicGroup: string; readonly innerTopic: string; readonly prepared: string;
  readonly callbackId: string; readonly handlerId: string; readonly bodyId: string; readonly methodId: string; readonly asyncPrototype: string;
  readonly callbackScope: string; readonly handlerScope: string; readonly bodyScope: string; readonly lookupScope: string; readonly registrySelfScope: string; readonly methodScope: string;
  readonly calls: number; readonly properties: number; readonly applicationMethodInvoked: false; readonly liveLexicalsProved: false; readonly referenceResultsVerified: false; readonly collateralVerified: false; readonly runtimeCallIssued: false; readonly runtimeJobIssued: false; readonly dispatchAuthorized: false;
}
/** Reject a failed inverse native delete registration predicate with its fixed refusal code. */
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_DELETE_REGISTRATION"); } }

/** Follow the actual registered UI callback to V, its original DEL body,
 * qualified K/so singleton, native Map selection and deleteData method. Every
 * opaque object is inspected before traversal; native Map.get alone executes.
 * The final full descriptor snapshots remain bound to the unattempted sender. */
export async function collectCurrentFootprintInverseNativeDeleteRegistration(b: CurrentFootprintInverseNativeDeleteRegistrationBindings): Promise<Readonly<CurrentFootprintInverseNativeDeleteRegistrationPrepared>> {
  const identity = currentFootprintInverseLookupIdentity(b.target); let calls = 0, propertyCount = 0;
  const send = async (input: Command): Promise<unknown> => { b.current(); const command = validate(input); if (command.method === "Runtime.callFunctionOn") { need((calls += 1) <= LIMIT.calls); } else if (command.method === "Runtime.getProperties") { need((propertyCount += 1) <= LIMIT.properties); } const raw = await b.request(command); b.current(); return raw; };
  const props = (objectId: string): Promise<unknown> => send({ phase: "inverse-native-delete-registration-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  const call = (role: keyof typeof CALLS, refs: readonly string[]): Promise<unknown> => { const row = CALLS[role]; const args: unknown[] = refs.map(objectId => ({ objectId })); if (row.value) { args.push({ value: identity }); } return send(validate({ phase: "inverse-native-delete-registration-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: b.receipt, functionDeclaration: row.program, arguments: args, returnByValue: row.byValue } })); };
  const read = async (id: string, size: number): Promise<Tuple> => { const values = array(await props(id), size); const packets: unknown[] = []; for (const value of values) { if (value.type === "function" || value.type === "object" && value.subtype !== "null") { const packet = await props(object(value)); properties(packet); packets.push(packet); } else { packets.push(null); } } return { id, values, packets }; };
  const tuple = async (role: keyof typeof CALLS, refs: readonly string[], size: number): Promise<Tuple> => read(result(await call(role, refs), size), size);
  const qualify = (captured: Tuple, index: number, role: SourceRole, scriptId: string): Readonly<{ scriptId: string; scopes: string }> => { const value = captured.values[index]; need(value?.type === "function" && typeof value.description === "string"); description(value.description, role); return metadata(captured.packets[index], role, scriptId); };
  const qualifyDelete = (captured: Tuple, role: "handler" | "method"): string => { const value = captured.values[0]; need(value?.type === "function" && typeof value.description === "string"); deleteDescription(value.description, role); return deleteMetadata(captured.packets[0], role, b.managerScriptId); };
  const fn = (captured: Tuple, index = 0): string => { const value = captured.values[index]; need(value?.type === "function"); return object(value); };
  // The original sender collector already inspected these handles. This fresh
  // Read refuses substitution before the callback scope can be traversed.
  await read(b.sender.prepared, 8); await read(b.sender.members, 2);
  const members = await tuple("members", [b.sender.prepared, b.sender.members], 3); const callback = qualify(members, 1, "uiBusRpcServiceCallback1", b.uiScriptId); const callbackScope = closure(await props(callback.scopes), "rpcService");
  const handler = await tuple("handlerUi", [callbackScope, members.id], 2); const wrapper = qualify(handler, 0, "managerRegisterServiceCallback1", b.managerScriptId); const handlerScope = closure(await props(wrapper.scopes), "V");
  const body = await tuple("body", [handlerScope, handler.id], 2); const bodyScope = moduleScope(await props(qualifyDelete(body, "handler")));
  const module = await tuple("managerModule", [bodyScope, body.id], 4); qualify(module, 0, "managerApplyArguments", b.managerScriptId); const lookup = qualify(module, 1, "managerProjectLookup", b.managerScriptId); const lookupScope = moduleScope(await props(lookup.scopes)); const lookupProof = await tuple("lookupScope", [lookupScope, module.id], 1);
  const asyncPrototype = object(remoteResult(await call("asyncPrototype", []))); properties(await props(asyncPrototype));
  // Only the immutable manager projection vocabulary is shared. Each command
  // Receives this route's new marker, object group, counter and helper receipt.
  const manager = await collectManager({ receipt: b.receipt, managerModule: module.id, asyncPrototype, managerScriptId: b.managerScriptId, target: identity, current: b.current, request: command => send(validate({ ...command, phase: command.phase.replace("inverse-get-manager-", "inverse-native-delete-registration-"), params: command.method === "Runtime.callFunctionOn" ? { ...command.params, objectGroup: FLAGS.objectGroup } : command.params })) });
  const registry = await read(manager.registry, 5); const instance = qualify(registry, 1, "managerProjectRegistryInstance", b.managerScriptId); const registrySelfScope = classScope(await props(instance.scopes));
  const method = await tuple("method", [manager.footprint, manager.getData, asyncPrototype], 3); const methodScope = moduleScope(await props(qualifyDelete(method, "method"))); const topics = await tuple("topics", [methodScope, method.id], 2); const topicGroup = await tuple("topicGroup", [topics.id], 2); const innerTopic = await tuple("innerTopic", [topicGroup.id], 1);
  const checkpoint = await tuple("checkpoint", [b.sender.prepared, members.id, lookupProof.id, method.id, innerTopic.id], 4);
  const model = await tuple("managerData", [manager.selected, manager.project, manager.footprint, method.id, manager.registry, manager.map, manager.methods, manager.nativePrototype], 8);
  const links = await tuple("managerLinks", [module.id, handler.id, body.id, callbackScope, handlerScope, bodyScope, lookupScope, methodScope], 8); const topicLinks = await tuple("managerTopics", [topics.id, topicGroup.id, registrySelfScope], 3);
  const prepared = await tuple("prepare", [model.id, links.id, topicLinks.id, checkpoint.id], 9); truth(await call("before", [prepared.id])); need(calls === LIMIT.calls && propertyCount === LIMIT.properties); b.current();
  return Object.freeze({ members: members.id, handler: handler.id, body: body.id, module: module.id, manager, method: method.id, topics: topics.id, topicGroup: topicGroup.id, innerTopic: innerTopic.id, prepared: prepared.id, callbackId: fn(members, 1), handlerId: fn(handler), bodyId: fn(body), methodId: fn(method), asyncPrototype, callbackScope, handlerScope, bodyScope, lookupScope, registrySelfScope, methodScope, calls, properties: propertyCount, applicationMethodInvoked: false, liveLexicalsProved: false, referenceResultsVerified: false, collateralVerified: false, runtimeCallIssued: false, runtimeJobIssued: false, dispatchAuthorized: false });
}
