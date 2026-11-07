/** One SCH-only fixed clock codec. Initial receivers are substituted by the
 * native owner's retained binding and never occur in caller field slots. */
import { CURRENT_SCHEMATIC_DISPLAY_CLOCK_UI_CALLER as CALLER, CURRENT_SCHEMATIC_DISPLAY_CLOCK_SITES as SITES, currentSchematicDisplayClockNativeCases, validateCurrentSchematicDisplayClockCommand } from "./current-schematic-display-clock-protocol.ts";
import type { CurrentSchematicDisplayClockCommand } from "./current-schematic-display-clock-protocol.ts";
import type { CurrentSchematicDisplayClockRealm } from "./current-schematic-display-clock-origin.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export type CurrentSchematicDisplayClockFieldKind = "handle" | "project" | "branch" | "uuid" | "tab" | "topic" | "count" | "time";
export interface CurrentSchematicDisplayClockTemplate { readonly phase: string; readonly method: string; readonly realm: CurrentSchematicDisplayClockRealm | "either";
  readonly fields: Readonly<Record<string, CurrentSchematicDisplayClockFieldKind>>; readonly values: Readonly<Record<string, string | number>>; readonly template: string }
function sourceRealm(value: string): CurrentSchematicDisplayClockRealm { if (value !== "worker" && value !== "ui") { throw new Error("SCHEMATIC_DISPLAY_CLOCK_SOURCE_REALM"); } return value; }
function kind(value: string): CurrentSchematicDisplayClockFieldKind {
  if (/^[a-f\d]{64}$/u.test(value)) { return "project"; } if (/^[a-f\d]{32}$/u.test(value)) { return "branch"; }
  if (/^[a-f\d-]{36}$/u.test(value)) { return "uuid"; } return "tab";
}
export function currentSchematicDisplayClockTemplate(input: unknown): CurrentSchematicDisplayClockTemplate {
  const command = validateCurrentSchematicDisplayClockCommand(input);
  const fields: Record<string, CurrentSchematicDisplayClockFieldKind> = {}, values: Record<string, string | number> = {};
  const field = (name: string, value: string | number, type: CurrentSchematicDisplayClockFieldKind): string => { if (Object.hasOwn(fields, name)) { throw new Error("SCHEMATIC_DISPLAY_CLOCK_FIELD_ALIAS"); } fields[name] = type; values[name] = value; return `__schematic_clock_${name}__`; };
  const params: Record<string, unknown> = { ...command.params }; let phase: string = command.phase, realm: CurrentSchematicDisplayClockRealm | "either" = "ui";
  if (command.method === "Runtime.callFunctionOn") {
    realm = ["schematic-clock-worker", "schematic-clock-push", "schematic-clock-dispatch", "schematic-clock-reply"].includes(command.phase) ? "worker" : "ui";
    if (command.phase === "schematic-clock-worker") { params["uniqueContextId"] = "__schematic_clock_boundWorker__"; }
    else if (command.phase === "schematic-clock-registration") { params["objectId"] = "__schematic_clock_boundSdk__"; }
    else if ("objectId" in command.params) { if (typeof command.params.objectId !== "string") { throw new TypeError("SCHEMATIC_DISPLAY_CLOCK_RECEIVER"); } params["objectId"] = field("objectId", command.params.objectId, "handle"); }
    params["arguments"] = command.params.arguments.map((argument, index) => {
      if ("objectId" in argument) { if (typeof argument.objectId !== "string") { throw new TypeError("SCHEMATIC_DISPLAY_CLOCK_OBJECT_ARGUMENT"); } return { objectId: field(`argument${String(index)}`, argument.objectId, "handle") }; }
      if (typeof argument.value === "string") { return { value: field(`value${String(index)}`, argument.value, kind(argument.value)) }; }
      const value = argument.value;
      if ("replyTopic" in value) { return { value: { replyTopic: field("replyTopic", value.replyTopic, "topic"), workerUuid: field("workerUuid", value.workerUuid, "uuid"),
        uiUuid: field("uiUuid", value.uiUuid, "uuid"), requestId: field("requestId", value.requestId, "count"), ordinal: 1 } }; }
      return { value: { uiUuid: field("uiUuid", value.uiUuid, "uuid"), value: field("time", value.value, "time") } };
    });
  } else if (command.phase === "schematic-clock-arm") {
    realm = sourceRealm(SITES[command.role].realm); phase += `-${command.role}`;
    const uuid = /d\.value==="([a-f\d-]{36})"/u.exec(command.params.condition)?.[1]; if (uuid === undefined) { throw new Error("SCHEMATIC_DISPLAY_CLOCK_UUID"); }
    params["condition"] = command.params.condition.replaceAll(uuid, field("busUuid", uuid, "uuid"));
    params["location"] = { ...command.params.location, scriptId: field("scriptId", command.params.location.scriptId, "handle") };
  } else if (command.phase === "schematic-clock-frame") {
    const found = Object.entries(SITES).find(([_role, site]) => site.expression === command.params.expression);
    const role = found?.[0] ?? "caller"; if (found === undefined && command.params.expression !== CALLER.expression) { throw new Error("SCHEMATIC_DISPLAY_CLOCK_FRAME"); }
    realm = sourceRealm(found?.[1].realm ?? "ui"); phase += `-${role}`; params["callFrameId"] = field("callFrameId", command.params.callFrameId, "handle");
  } else if (command.phase === "schematic-clock-source") { phase += `-${command.role}`; params["scriptId"] = field("scriptId", command.params.scriptId, "handle"); }
  else if (command.phase === "schematic-clock-remove") { realm = sourceRealm(SITES[command.role].realm); phase += `-${command.role}`; params["breakpointId"] = field("breakpointId", command.params.breakpointId, "handle"); }
  else if (command.phase === "schematic-clock-resume") { realm = sourceRealm(SITES[command.role].realm); phase += `-${command.role}`; }
  else if (command.phase === "schematic-clock-release") { realm = command.realm; phase += `-${command.realm}`; }
  else { realm = "either"; params["objectId"] = field("objectId", command.params.objectId, "handle"); }
  return freezeDeep({ phase, realm, method: command.method, fields, values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentSchematicDisplayClockWire(input: unknown, realm: CurrentSchematicDisplayClockRealm, id: number): Readonly<{ command: CurrentSchematicDisplayClockCommand; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647 || realm !== "worker" && realm !== "ui") { throw new Error("SCHEMATIC_DISPLAY_CLOCK_WIRE"); }
  const command = validateCurrentSchematicDisplayClockCommand(input), fixed = currentSchematicDisplayClockTemplate(command);
  if (fixed.realm !== "either" && fixed.realm !== realm) { throw new Error("SCHEMATIC_DISPLAY_CLOCK_REALM"); }
  return freezeDeep({ command, request: { action: "schematic-display-clock", requestId: id, phase: fixed.phase, method: fixed.method, realm, ...fixed.values } });
}
export function currentSchematicDisplayClockTemplates(): readonly CurrentSchematicDisplayClockTemplate[] { return freezeDeep(currentSchematicDisplayClockNativeCases().map(command => currentSchematicDisplayClockTemplate(command))); }
