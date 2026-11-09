/** Coupled passive preparation from the actual still-held DEL method. No
 * original body is resumed and no caller data can issue a forwarded Job. */
import { CurrentFootprintInverseDeleteForwardIo as Io } from "./current-footprint-inverse-delete-forward-io.ts";
import type { CurrentFootprintInverseDeleteForwardIoBindings as IoBindings } from "./current-footprint-inverse-delete-forward-io.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_FORWARD_EXPRESSIONS as EXPRESSIONS } from "./current-footprint-inverse-delete-forward-programs.ts";
import { collectCurrentFootprintInverseGetChannel } from "./current-footprint-inverse-get-channel-collector.ts";
import type { CurrentFootprintInverseGetChannelGraph as Channel } from "./current-footprint-inverse-get-channel-collector.ts";
import { collectCurrentFootprintInverseGetSenderOrigin } from "./current-footprint-inverse-get-sender-origin.ts";
import type { CurrentFootprintInverseGetSenderOrigin as Origin } from "./current-footprint-inverse-get-sender-origin.ts";
import type { CurrentFootprintInverseGetManagerGraph as Manager } from "./current-footprint-inverse-get-manager-collector.ts";
import type { CurrentFootprintInverseGetForwardingGraph as Forwarding } from "./current-footprint-inverse-get-forwarding-collector.ts";
import { collectCurrentFootprintInverseDeleteForce } from "./current-footprint-inverse-delete-force-collector.ts";
import type { CurrentFootprintInverseDeleteForcePrepared as Force } from "./current-footprint-inverse-delete-force-collector.ts";
import { collectCurrentFootprintInverseDeleteUiRun } from "./current-footprint-inverse-delete-ui-run-collector.ts";
import type { CurrentFootprintInverseDeleteUiRunPrepared as Ui, CurrentFootprintInverseDeleteUiRunBindings as UiBindings } from "./current-footprint-inverse-delete-ui-run-collector.ts";
import { requireCurrentFootprintInversePublicServiceTrue as truth } from "./current-footprint-inverse-public-service-replies.ts";

export interface CurrentFootprintInverseDeleteForwardBindings extends Omit<IoBindings, "maximum"> { readonly native: string; readonly nativeMembers: string; readonly profile: "ui" | "manager"; readonly scriptId: string; readonly uiScriptId: string; readonly methodFrame: string; readonly method: string; readonly topics: string; readonly manager: Manager; readonly forwarding: Forwarding; readonly outer: string; readonly methods: string; readonly initial: string; readonly ui: Omit<UiBindings, "receipt" | "current" | "request" | "scriptId"> }
export interface CurrentFootprintInverseDeleteForwardPrepared { readonly channel: Channel; readonly origin: Origin; readonly methodFrame: string; readonly routes: string; readonly prepared: string; readonly replyTopic: string; readonly force: Force; readonly ui: Ui; readonly nativePostReturned: false; readonly originalWorkerHandlerObserved: false; readonly runtimeJobIssued: false; readonly dispatchAuthorized: false }
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_DELETE_FORWARD_PREPARATION"); } }
/** Fresh channel checks reuse only GET comparison handles, never their spent
 * guards. The DEL method receiver and inner bus are joined independently. */
export async function collectCurrentFootprintInverseDeleteForward(b: CurrentFootprintInverseDeleteForwardBindings): Promise<Readonly<CurrentFootprintInverseDeleteForwardPrepared>> {
  need(b.profile === "ui"); const io = new Io({ ...b, maximum: 512 });
  const channel = await collectCurrentFootprintInverseGetChannel({ profile: b.profile, scriptId: b.scriptId, manager: b.manager, forwarding: b.forwarding, current: b.current, properties: id => io.properties(id), call: (role, refs) => io.call(`channel-${role}`, role === "lineageUi" || role === "lineageManager" ? [b.method] : refs) });
  const origin = await collectCurrentFootprintInverseGetSenderOrigin({ current: b.current, properties: id => io.properties(id), call: (role, refs, original) => io.call(`origin-${role}`, refs, original) });
  const methodFrame = await io.frame("method", b.methodFrame, EXPRESSIONS.method, 10); const routes = await io.tuple("send-routeRoot", [methodFrame.id, b.method, b.topics], 2); const group = await io.tuple("send-routeGroup", [routes.id], 2); const route = await io.tuple("send-route", [group.id], 2);
  const prepared = await io.tuple("send-prepare", [channel.roots, channel.lineage, channel.classes, channel.module, channel.methods, channel.channel, b.native, b.nativeMembers, route.id], 5); const reply = prepared.values[0]; need(reply?.type === "string" && typeof reply.value === "string");
  truth(await io.call("send-method", [methodFrame.id, b.method, route.id, prepared.id, b.native]));
  const force = await collectCurrentFootprintInverseDeleteForce({ io, outer: b.outer, methods: b.methods, initial: b.initial, original: b.method, uiScriptId: b.uiScriptId, managerScriptId: b.scriptId });
  const ui = await collectCurrentFootprintInverseDeleteUiRun({ ...b.ui, receipt: b.receipt, current: b.current, scriptId: b.uiScriptId, request: command => { if (command.method === "Runtime.getProperties") { return io.properties(command.params.objectId); } if (command.method === "Runtime.callFunctionOn") { return io.call(`tail-${command.role}`, command.params.arguments.map(value => value.objectId)); } throw new Error("INVERSE_DELETE_FORWARD_UI_PREPARATION_ONLY"); } });
  await origin.reprove(); io.current(); return Object.freeze({ channel, origin, methodFrame: methodFrame.id, routes: route.id, prepared: prepared.id, replyTopic: reply.value, force, ui, nativePostReturned: false, originalWorkerHandlerObserved: false, runtimeJobIssued: false, dispatchAuthorized: false });
}
