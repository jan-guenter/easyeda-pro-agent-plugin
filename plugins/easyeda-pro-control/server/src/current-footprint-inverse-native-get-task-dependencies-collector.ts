/** Coupled readonly native-task dependencies. Native constructors and the
 * actual original RPC frame precede callback/manager data traversal. */
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_DEPENDENCIES_CALLS as CALLS, CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_DEPENDENCIES_FLAGS as FLAGS, validateCurrentFootprintInverseNativeGetTaskDependenciesCommand as validate } from "./current-footprint-inverse-native-get-task-dependencies-protocol.ts";
import type { CurrentFootprintInverseNativeGetTaskDependenciesCommand as Command } from "./current-footprint-inverse-native-get-task-dependencies-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_DEPENDENCIES_PROGRAMS as P } from "./current-footprint-inverse-native-get-task-dependencies-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_SENDER_ENTRY as ENTRY } from "./current-footprint-inverse-native-get-task-sender-programs.ts";
import type { CurrentFootprintInverseNativeGetTaskSenderPrepared as Sender } from "./current-footprint-inverse-native-get-task-sender-collector.ts";
import { currentFootprintInverseLookupArray as array, currentFootprintInverseLookupObject as object, currentFootprintInverseLookupProperties as properties, currentFootprintInverseLookupResult as result } from "./current-footprint-inverse-lookup-preentry-replies.ts";
import type { CurrentFootprintInverseLookupRemote as Remote } from "./current-footprint-inverse-lookup-preentry-replies.ts";
import { requireCurrentFootprintInverseInitializedGetDescription as description } from "./current-footprint-inverse-initialized-get-source.ts";
import type { CurrentFootprintInverseInitializedGetRole as Role } from "./current-footprint-inverse-initialized-get-source.ts";
import { decodeCurrentFootprintInverseInitializedGetFunction as metadata } from "./current-footprint-inverse-initialized-get-replies.ts";
import { currentFootprintInverseGetForwardingClosure as closure } from "./current-footprint-inverse-get-forwarding-collector.ts";
import { currentFootprintInverseGetRpcEntryScope as moduleScope } from "./current-footprint-inverse-get-rpc-entry-replies.ts";
import { requireCurrentFootprintInversePublicServiceTrue as truth } from "./current-footprint-inverse-public-service-replies.ts";

interface Tuple { readonly id: string; readonly values: readonly Remote[]; readonly packets: readonly unknown[] }
export interface CurrentFootprintInverseNativeGetTaskDependenciesBindings {
  readonly receipt: string; readonly frame: string; readonly originalFrame: string; readonly sender: Sender;
  readonly nativeRoots: string; readonly originalManagerModule: string; readonly uiScriptId: string; readonly managerScriptId: string;
  readonly current: () => void; readonly request: (command: Command) => Promise<unknown>;
}
export interface CurrentFootprintInverseNativeGetTaskDependencyGraph {
  readonly module: string; readonly handler: string; readonly body: string; readonly manager: string;
  readonly callbackId: string; readonly handlerId: string; readonly bodyId: string;
  readonly callbackScope: string; readonly handlerScope: string; readonly bodyScope: string;
  readonly calls: number; readonly properties: number; readonly frames: number;
  readonly callbackLiveEntryProved: false; readonly bodyAuthorized: false; readonly runtimeJobIssued: false;
}
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_GET_TASK_DEPENDENCIES"); } }
/** Qualify each returned function/source before traversing its scopes. Mirrors
 * select original callback candidates only; actual entry/Job grants remain
 * separate. The final fresh RPC frame is compared by JS identity before any
 * newly selected opaque operand is traversed. */
export async function collectCurrentFootprintInverseNativeGetTaskDependencies(b: CurrentFootprintInverseNativeGetTaskDependenciesBindings): Promise<Readonly<CurrentFootprintInverseNativeGetTaskDependencyGraph>> {
  let calls = 0, count = 0, frames = 0;
  const props = async (objectId: string): Promise<unknown> => { b.current(); need((count += 1) <= 28); const raw = await b.request(validate({ phase: "inverse-native-get-task-dependencies-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } })); b.current(); return raw; };
  const call = async (role: keyof typeof CALLS, refs: readonly string[]): Promise<unknown> => { b.current(); need((calls += 1) <= 6); const row = CALLS[role]; const raw = await b.request(validate({ phase: "inverse-native-get-task-dependencies-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: b.receipt, functionDeclaration: P[role], arguments: refs.map(objectId => ({ objectId })), returnByValue: row.size === 0 } })); b.current(); return raw; };
  const tuple = async (role: "module" | "handler" | "body" | "manager", refs: readonly string[]): Promise<Tuple> => { const size = CALLS[role].size; const id = result(await call(role, refs), size); const values = array(await props(id), size); const packets: unknown[] = []; for (const value of values) { if (value.type === "function" || value.type === "object" && value.subtype !== "null") { const packet = await props(object(value)); properties(packet); packets.push(packet); } else { packets.push(null); } } return { id, values, packets }; };
  const qualify = (captured: Tuple, index: number, role: Role, scriptId: string): Readonly<{ scopes: string }> => { const value = captured.values[index]; need(value?.type === "function" && typeof value.description === "string"); description(value.description, role); return metadata(captured.packets[index], role, scriptId); };
  const module = await tuple("module", [b.originalFrame, b.sender.prepared, b.sender.bus, b.sender.taskMethods, b.nativeRoots]);
  for (const [index, role] of (["uiBusClass", "uiTaskClass", "uiClone", "uiEnsureArray", "uiEnsure", "uiRemove", "uiWeakRef", "uiDeref"] as const).entries()) { qualify(module, index, role, b.uiScriptId); }
  const callback = metadata(await props(b.sender.callback), "uiBusRpcServiceCallback1", b.uiScriptId); const callbackScope = closure(await props(callback.scopes), "rpcService");
  const handler = await tuple("handler", [callbackScope, b.sender.prepared, b.sender.members]); const handlerMetadata = qualify(handler, 0, "managerRegisterServiceCallback1", b.managerScriptId); const handlerScope = closure(await props(handlerMetadata.scopes), "V");
  const body = await tuple("body", [handlerScope, handler.id]); const bodyMetadata = qualify(body, 0, "managerRegisterGetCallback1", b.managerScriptId); const bodyScope = moduleScope(await props(bodyMetadata.scopes));
  const manager = await tuple("manager", [bodyScope, body.id, b.originalManagerModule]); qualify(manager, 0, "managerApplyArguments", b.managerScriptId); qualify(manager, 1, "managerProjectLookup", b.managerScriptId);
  truth(await call("before", [module.id, handler.id, body.id, manager.id])); b.current(); frames += 1;
  const fresh = result(await b.request(validate({ phase: "inverse-native-get-task-dependencies-frame", method: "Debugger.evaluateOnCallFrame", params: { callFrameId: b.frame, expression: ENTRY, objectGroup: FLAGS.objectGroup, silent: true, generatePreview: false, throwOnSideEffect: true, returnByValue: false, includeCommandLineAPI: false } })), 20); b.current(); array(await props(fresh), 20);
  truth(await call("join", [fresh, module.id, b.sender.prepared, b.sender.bus, b.sender.taskMethods, b.nativeRoots, b.originalFrame])); b.current(); need(calls === 6 && count === 28 && frames === 1);
  const handlerValue = handler.values[0]; const bodyValue = body.values[0]; need(handlerValue !== undefined && bodyValue !== undefined);
  return Object.freeze({ module: module.id, handler: handler.id, body: body.id, manager: manager.id, callbackId: b.sender.callback, handlerId: object(handlerValue), bodyId: object(bodyValue), callbackScope, handlerScope, bodyScope, calls, properties: count, frames, callbackLiveEntryProved: false, bodyAuthorized: false, runtimeJobIssued: false });
}
