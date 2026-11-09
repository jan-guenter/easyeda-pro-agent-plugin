/** One Via-only fixed clock codec. Initial receivers are substituted by the
 * native owner's retained binding and never occur in caller field slots. */
import { CURRENT_PCB_VIA_CLOCK_UI_CALLER as CALLER, CURRENT_PCB_VIA_CLOCK_SITES as SITES, currentPcbViaClockNativeCases, validateCurrentPcbViaClockCommand } from "./current-pcb-via-clock-protocol.ts";
import type { CurrentPcbViaClockCommand } from "./current-pcb-via-clock-protocol.ts";
import type { CurrentPcbViaClockRealm } from "./current-pcb-via-clock-origin.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export type CurrentPcbViaClockFieldKind = "handle" | "project" | "branch" | "uuid" | "tab" | "topic" | "count" | "time";
export interface CurrentPcbViaClockTemplate { readonly phase: string; readonly method: string; readonly realm: CurrentPcbViaClockRealm | "either";
  readonly fields: Readonly<Record<string, CurrentPcbViaClockFieldKind>>; readonly values: Readonly<Record<string, string | number>>; readonly template: string }
const reservedFields = new Set(["action", "requestId", "phase", "method", "realm", "id", "jobId", "helperInstance", "rootCreated", "rootPid"]);
function sourceRealm(value: string): CurrentPcbViaClockRealm { if (value !== "worker" && value !== "ui") { throw new Error("PCB_VIA_CLOCK_SOURCE_REALM"); } return value; }
function kind(value: string): CurrentPcbViaClockFieldKind {
  if (/^[a-f\d]{64}$/u.test(value)) { return "project"; } if (/^[a-f\d]{32}$/u.test(value)) { return "branch"; }
  if (/^[a-f\d-]{36}$/u.test(value)) { return "uuid"; } return "tab";
}
export function currentPcbViaClockTemplate(input: unknown): CurrentPcbViaClockTemplate {
  const command = validateCurrentPcbViaClockCommand(input);
  const fields: Record<string, CurrentPcbViaClockFieldKind> = {}, values: Record<string, string | number> = {};
  const field = (name: string, value: string | number, type: CurrentPcbViaClockFieldKind): string => { if (reservedFields.has(name) || Object.hasOwn(fields, name)) { throw new Error("PCB_VIA_CLOCK_FIELD_ALIAS"); } fields[name] = type; values[name] = value; return `__via_clock_${name}__`; };
  const params: Record<string, unknown> = { ...command.params }; let phase: string = command.phase, realm: CurrentPcbViaClockRealm | "either" = "ui";
  if (command.method === "Runtime.callFunctionOn") {
    realm = ["via-clock-worker", "via-clock-push", "via-clock-dispatch", "via-clock-reply"].includes(command.phase) ? "worker" : "ui";
    if (command.phase === "via-clock-worker") { params["uniqueContextId"] = "__via_clock_boundWorker__"; }
    else if (command.phase === "via-clock-registration") { params["objectId"] = "__via_clock_boundSdk__"; }
    else if ("objectId" in command.params) { if (typeof command.params.objectId !== "string") { throw new TypeError("PCB_VIA_CLOCK_RECEIVER"); } params["objectId"] = field("objectId", command.params.objectId, "handle"); }
    params["arguments"] = command.params.arguments.map((argument, index) => {
      if ("objectId" in argument) { if (typeof argument.objectId !== "string") { throw new TypeError("PCB_VIA_CLOCK_OBJECT_ARGUMENT"); } return { objectId: field(`argument${String(index)}`, argument.objectId, "handle") }; }
      if (typeof argument.value === "string") { return { value: field(`value${String(index)}`, argument.value, kind(argument.value)) }; }
      const value = argument.value;
      if ("replyTopic" in value) { return { value: { replyTopic: field("replyTopic", value.replyTopic, "topic"), workerUuid: field("workerUuid", value.workerUuid, "uuid"),
        uiUuid: field("uiUuid", value.uiUuid, "uuid"), requestId: field("rpcRequestId", value.requestId, "count"), ordinal: 1 } }; }
      return { value: { uiUuid: field("uiUuid", value.uiUuid, "uuid"), value: field("time", value.value, "time") } };
    });
  } else if (command.phase === "via-clock-arm") {
    realm = sourceRealm(SITES[command.role].realm); phase += `-${command.role}`;
    const uuid = /d\.value==="([a-f\d-]{36})"/u.exec(command.params.condition)?.[1]; if (uuid === undefined) { throw new Error("PCB_VIA_CLOCK_UUID"); }
    params["condition"] = command.params.condition.replaceAll(uuid, field("busUuid", uuid, "uuid"));
    params["location"] = { ...command.params.location, scriptId: field("scriptId", command.params.location.scriptId, "handle") };
  } else if (command.phase === "via-clock-frame") {
    const found = Object.entries(SITES).find(([_role, site]) => site.expression === command.params.expression);
    const role = found?.[0] ?? "caller"; if (found === undefined && command.params.expression !== CALLER.expression) { throw new Error("PCB_VIA_CLOCK_FRAME"); }
    realm = sourceRealm(found?.[1].realm ?? "ui"); phase += `-${role}`; params["callFrameId"] = field("callFrameId", command.params.callFrameId, "handle");
  } else if (command.phase === "via-clock-source") { phase += `-${command.role}`; params["scriptId"] = field("scriptId", command.params.scriptId, "handle"); }
  else if (command.phase === "via-clock-remove") { realm = sourceRealm(SITES[command.role].realm); phase += `-${command.role}`; params["breakpointId"] = field("breakpointId", command.params.breakpointId, "handle"); }
  else if (command.phase === "via-clock-resume") { realm = sourceRealm(SITES[command.role].realm); phase += `-${command.role}`; }
  else if (command.phase === "via-clock-release") { realm = command.realm; phase += `-${command.realm}`; }
  else { realm = "either"; params["objectId"] = field("objectId", command.params.objectId, "handle"); }
  return freezeDeep({ phase, realm, method: command.method, fields, values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentPcbViaClockWire(input: unknown, realm: CurrentPcbViaClockRealm, id: number): Readonly<{ command: CurrentPcbViaClockCommand; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647 || realm !== "worker" && realm !== "ui") { throw new Error("PCB_VIA_CLOCK_WIRE"); }
  const command = validateCurrentPcbViaClockCommand(input), fixed = currentPcbViaClockTemplate(command);
  if (fixed.realm !== "either" && fixed.realm !== realm) { throw new Error("PCB_VIA_CLOCK_REALM"); }
  return freezeDeep({ command, request: { action: "pcb-via-clock", requestId: id, phase: fixed.phase, method: fixed.method, realm, ...fixed.values } });
}
export function currentPcbViaClockTemplates(): readonly CurrentPcbViaClockTemplate[] { return freezeDeep(currentPcbViaClockNativeCases().map(command => currentPcbViaClockTemplate(command))); }
