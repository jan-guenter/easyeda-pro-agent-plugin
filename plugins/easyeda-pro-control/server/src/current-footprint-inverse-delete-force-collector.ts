/** Original registered force callback and empty history branches only.
 * Preparation never calls the service or invokes a history subscriber. */
import type { CurrentFootprintInverseDeleteForwardIo as Io, CurrentFootprintInverseDeleteForwardTuple as Tuple } from "./current-footprint-inverse-delete-forward-io.ts";
import { currentFootprintInverseLookupObject as object } from "./current-footprint-inverse-lookup-preentry-replies.ts";
import { requireCurrentFootprintInverseInitializedGetDescription as description } from "./current-footprint-inverse-initialized-get-source.ts";
import { decodeCurrentFootprintInverseInitializedGetFunction as metadata } from "./current-footprint-inverse-initialized-get-replies.ts";
import { currentFootprintInverseGetForwardingClosure as closure } from "./current-footprint-inverse-get-forwarding-collector.ts";
import { currentFootprintInverseGetRpcEntryScope as moduleScope } from "./current-footprint-inverse-get-rpc-entry-replies.ts";
import { qualifyCurrentFootprintInverseDeleteForceFunction, requireCurrentFootprintInverseDeleteForceDescription } from "./current-footprint-inverse-delete-force-source.ts";

export interface CurrentFootprintInverseDeleteForcePrepared { readonly roots: string; readonly handler: string; readonly body: string; readonly callback: string; readonly wrapper: string; readonly emptyBody: string; readonly bodyModuleScope: string; readonly forceCompleted: false; readonly historyCompleted: false; readonly workerDrainProved: false }
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_DELETE_FORCE_PREPARATION"); } }
/** The initial closed branch has the actual UI MessageBus. The owner still
 * supplies full original source/receiver custody before mounting a sender. */
/** Select the original empty force registration through metadata-qualified
 * queues, tasks and source functions. Subscriber effects and worker drain
 * remain unproved; this preparation executes no registered callback. */
export async function collectCurrentFootprintInverseDeleteForce(b: Readonly<{ io: Io; outer: string; methods: string; initial: string; original: string; uiScriptId: string; managerScriptId: string }>): Promise<Readonly<CurrentFootprintInverseDeleteForcePrepared>> {
  const { io } = b; const base = await io.tuple("force-base", [b.outer, b.initial, b.original], 10); const lists = await io.tuple("force-lists", [base.id], 4); const task = await io.tuple("force-task", [lists.id], 1); const members = await io.tuple("force-members", [task.id], 2); const roots = await io.tuple("force-roots", [base.id, lists.id, task.id, members.id, b.methods], 13); const callback = roots.values[6]; need(callback?.type === "function" && typeof callback.description === "string"); description(callback.description, "uiBusRpcServiceCallback1"); const callbackId = object(callback), callbackMeta = metadata(roots.packets[6], "uiBusRpcServiceCallback1", b.uiScriptId), callbackScope = closure(await io.properties(callbackMeta.scopes), "rpcService");
  const handler = await io.tuple("force-handler", [callbackScope, roots.id], 2); const selected = (tuple: Tuple): string => { const value = tuple.values[0]; need(value?.type === "function" && typeof value.description === "string"); return object(value); }; const wrapper = selected(handler); const wrapperValue = handler.values[0]; need(wrapperValue?.description !== undefined); description(wrapperValue.description, "managerRegisterServiceCallback1"); const wrapperMeta = metadata(handler.packets[0], "managerRegisterServiceCallback1", b.managerScriptId), wrapperScope = closure(await io.properties(wrapperMeta.scopes), "V");
  const body = await io.tuple("force-body", [wrapperScope, handler.id], 2); const bodyValue = body.values[0], emptyBody = selected(body); need(bodyValue?.description !== undefined); requireCurrentFootprintInverseDeleteForceDescription(bodyValue.description); const scopes = qualifyCurrentFootprintInverseDeleteForceFunction(body.packets[0], b.managerScriptId); const bodyModuleScope = moduleScope(await io.properties(scopes)); io.current(); return Object.freeze({ roots: roots.id, handler: handler.id, body: body.id, callback: callbackId, wrapper, emptyBody, bodyModuleScope, forceCompleted: false, historyCompleted: false, workerDrainProved: false });
}
