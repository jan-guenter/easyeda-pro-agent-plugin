/** Passive fresh native-equivalent sender selection. No public-c Call or
 * continuation is an input. Its opaque handles grant no invocation or Job. */
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SENDER_CALLS as CALLS, CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SENDER_FLAGS as FLAGS, CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SENDER_READ_REQUESTS as R, validateCurrentFootprintInverseNativeDeleteSenderCommand as validate } from "./current-footprint-inverse-native-delete-sender-protocol.ts";
import type { CurrentFootprintInverseNativeDeleteSenderCommand as Command } from "./current-footprint-inverse-native-delete-sender-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SENDER_PROGRAMS as P } from "./current-footprint-inverse-native-delete-sender-programs.ts";
import { currentFootprintInverseLookupArray as array, currentFootprintInverseLookupObject as object, currentFootprintInverseLookupProperties as properties, currentFootprintInverseLookupResult as result } from "./current-footprint-inverse-lookup-preentry-replies.ts";
import type { CurrentFootprintInverseLookupRemote as Remote } from "./current-footprint-inverse-lookup-preentry-replies.ts";
import { requireCurrentFootprintInverseInitializedGetDescription as description } from "./current-footprint-inverse-initialized-get-source.ts";
import type { CurrentFootprintInverseInitializedGetRole as SourceRole } from "./current-footprint-inverse-initialized-get-source.ts";
import { decodeCurrentFootprintInverseInitializedGetFunction as metadata } from "./current-footprint-inverse-initialized-get-replies.ts";
import { currentFootprintInverseLookupIdentity } from "./current-footprint-inverse-lookup-identity.ts";
import { requireCurrentFootprintInversePublicServiceTrue as truth } from "./current-footprint-inverse-public-service-replies.ts";

interface Tuple { readonly id: string; readonly values: readonly Remote[]; readonly packets: readonly unknown[] }
export interface CurrentFootprintInverseNativeDeleteSenderBindings { readonly receipt: string; readonly uiScriptId: string; readonly current: () => void; readonly request: (command: Command) => Promise<unknown>; readonly target: Readonly<{ projectUuid: string; branchUuid: string; documentUuid: string }> }
export interface CurrentFootprintInverseNativeDeleteSenderPrepared { readonly roots: string; readonly context: string; readonly bus: string; readonly methods: string; readonly queue: string; readonly task: string; readonly members: string; readonly taskMethods: string; readonly prepared: string; readonly originalRpc: string; readonly callback: string; readonly replyTopic: string; readonly publicCallConsumed: false; readonly applicationMethodInvoked: false; readonly runtimeJobIssued: false; readonly dispatchAuthorized: false }
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_DELETE_SENDER_PREPARATION"); } }
const BUS_ROLES = ["uiBusUniqueRpcTopic", "uiBusPublish", "uiBusSubscribe", "uiBusPush", "uiBusPull", "uiBusPullA", "uiBusRpcService", "uiBusRpcCall", "uiBusRpcReply"] as const;

/** Every opaque root, dictionary, queue and task receives correlated non-Proxy
 * metadata before a later helper traverses it. Function source is checked
 * before the prepared invocation closure can capture the selected originals. */
export async function collectCurrentFootprintInverseNativeDeleteSender(b: CurrentFootprintInverseNativeDeleteSenderBindings): Promise<Readonly<CurrentFootprintInverseNativeDeleteSenderPrepared>> {
  let requests = 0;
  const send = async (input: Command): Promise<unknown> => { b.current(); need((requests += 1) <= R.calls + R.properties); const raw = await b.request(validate(input)); b.current(); return raw; };
  const props = (objectId: string): Promise<unknown> => send({ phase: "inverse-native-delete-sender-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  const tuple = async (role: Exclude<keyof typeof CALLS, "before" | "entry">, refs: readonly string[], size: number): Promise<Tuple> => { const row = CALLS[role]; const args: unknown[] = refs.map(objectId => ({ objectId })); if (row.value) { args.push({ value: currentFootprintInverseLookupIdentity(b.target) }); } const raw = await send(validate({ phase: "inverse-native-delete-sender-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: b.receipt, functionDeclaration: P[role], arguments: args, returnByValue: false } })); const id = result(raw, size); const values = array(await props(id), size); const packets: unknown[] = []; for (const value of values) { if (value.type === "function" || value.type === "object" && value.subtype !== "null") { const packet = await props(object(value)); properties(packet); packets.push(packet); } else { packets.push(null); } } return { id, values, packets }; };
  const qualify = (captured: Tuple, index: number, role: SourceRole): string => { const value = captured.values[index]; need(value?.type === "function" && typeof value.description === "string"); description(value.description, role); metadata(captured.packets[index], role, b.uiScriptId); return object(value); };
  const roots = await tuple("roots", [], 2); const context = await tuple("context", [roots.id], 2); const bus = await tuple("bus", [roots.id, context.id], 4); qualify(bus, 3, "uiBusClass");
  const methods = await tuple("methods", [roots.id, context.id], 9); for (const [index, role] of BUS_ROLES.entries()) { qualify(methods, index, role); }
  const queue = await tuple("queue", [bus.id], 1); const task = await tuple("task", [queue.id], 1); const members = await tuple("members", [task.id], 2); const callback = qualify(members, 1, "uiBusRpcServiceCallback1");
  const taskMethods = await tuple("taskMethods", [members.id], 4); for (const [index, role] of (["uiTaskClass", "uiTaskCancel", "uiTaskRunning", "uiTaskExecute"] as const).entries()) { qualify(taskMethods, index, role); }
  const prepared = await tuple("prepare", [roots.id, context.id, bus.id, methods.id, queue.id, task.id, members.id, taskMethods.id], 8); const reply = prepared.values[2]; need(reply?.type === "string" && typeof reply.value === "string" && /^_MSG_BUS_RPC_-\/PrjDB\/footprint\/delete-[a-f\d]{32}-(?:0|[1-9]\d{0,15})$/u.test(reply.value));
  truth(await send({ phase: "inverse-native-delete-sender-call", role: "before", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: b.receipt, functionDeclaration: P.before, arguments: [{ objectId: prepared.id }], returnByValue: true } })); need(requests === R.calls + R.properties); b.current();
  return Object.freeze({ roots: roots.id, context: context.id, bus: bus.id, methods: methods.id, queue: queue.id, task: task.id, members: members.id, taskMethods: taskMethods.id, prepared: prepared.id, originalRpc: qualify(methods, 7, "uiBusRpcCall"), callback, replyTopic: reply.value, publicCallConsumed: false, applicationMethodInvoked: false, runtimeJobIssued: false, dispatchAuthorized: false });
}
