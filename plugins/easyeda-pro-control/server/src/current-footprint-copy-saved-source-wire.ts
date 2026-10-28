/** Exact V2 saved-cache reader. Its larger fixed program is substituted only
 * during inert capture; arbitrary programs retain the ordinary metadata cap. */
import { types } from "node:util";
import { z } from "zod";
import { currentFootprintCopySavedSourceCommandParamsSchema } from "./current-footprint-copy-saved-source-command.ts";
import { CURRENT_FOOTPRINT_COPY_V2_SAVED_CACHE_READ_FUNCTION } from "./current-footprint-copy-v2-saved-cache-read.ts";
import { CURRENT_FOOTPRINT_COPY_SAVED_PROFILE } from "./current-footprint-copy-saved-profile.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { CurrentPcbWorkerStartupCommand } from "./current-pcb-worker-startup-contract.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

function plain(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !types.isProxy(value) && !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}
const session = z.string().regex(/^[A-Za-z\d_.:-]{1,128}(?![\s\S])/u);
const schema = z.object({ method: z.literal("Runtime.callFunctionOn"), sessionId: session, params: currentFootprintCopySavedSourceCommandParamsSchema }).strict();
export function currentFootprintCopySavedSourceWire(raw: unknown, id: number): Readonly<{
  command: CurrentPcbWorkerStartupCommand & Readonly<{ id: number }>;
  request: Readonly<Record<string, string | number>>;
}> | null {
  if (!Number.isSafeInteger(id) || id < 1 || id > CURRENT_FOOTPRINT_COPY_SAVED_PROFILE.requestLimit) { throw new Error("FOOTPRINT_SAVED_SOURCE_REQUEST_ID"); }
  if (!plain(raw)) { return null; }
  const params = Object.getOwnPropertyDescriptor(raw, "params");
  const original: unknown = params?.value;
  if (params === undefined || !Object.hasOwn(params, "value") || !plain(original)) { return null; }
  const source = Object.getOwnPropertyDescriptor(original, "functionDeclaration");
  if (source === undefined || !Object.hasOwn(source, "value") || source.value !== CURRENT_FOOTPRINT_COPY_V2_SAVED_CACHE_READ_FUNCTION) { return null; }
  const inner = Object.getOwnPropertyDescriptors(original), outer = Object.getOwnPropertyDescriptors(raw);
  inner["functionDeclaration"] = { ...source, value: "fixed-footprint-saved-source" };
  outer["params"] = { ...params, value: Object.create(null, inner) as unknown };
  const captured = captureCurrentPcbStringClockReply(Object.create(null, outer)).value;
  if (!plain(captured) || !plain(captured["params"])) { throw new Error("FOOTPRINT_SAVED_SOURCE_CAPTURE"); }
  const command = schema.parse({ ...captured, params: { ...captured["params"], functionDeclaration: CURRENT_FOOTPRINT_COPY_V2_SAVED_CACHE_READ_FUNCTION } });
  const [project, bus, consistency, selected, constructors, methods] = command.params.arguments;
  return freezeDeep({ command: { ...command, id }, request: { action: "worker-startup-send", requestId: id, method: command.method, sessionId: command.sessionId,
    startupPhase: "footprint-saved-source-read", objectId: command.params.objectId,
    argument0: project.objectId, argument1: bus.objectId, argument2: consistency.objectId,
    argument4: constructors.objectId, argument5: methods.objectId,
    projectUuid: selected.value.identity.projectUuid, branchUuid: selected.value.identity.branchUuid,
    windowTabId: selected.value.identity.windowTabId, footprintUuid: selected.value.footprintUuid,
    client: selected.value.client, maximumTicket: String(selected.value.maximumTicket) } });
}
