/** Fixed inverse-only projections. Shared values are inert current209 CDP
 * templates; no saved-reader origin, controller or cache grant is accepted. */
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PCB_VIA_SAVED_READBACK_ACTOR_PARAMS, CURRENT_PCB_VIA_SAVED_READBACK_PARENT_PARAMS } from "./current-pcb-via-saved-cache-wire.ts";
import { validateCurrentPcbViaSavedLoadBootstrapCommand } from "./current-pcb-via-saved-load-bootstrap-protocol.ts";
import type { CurrentPcbViaSavedLoadBootstrapCommand } from "./current-pcb-via-saved-load-bootstrap-protocol.ts";
import type { CurrentFootprintInverseWorkerPair } from "./current-footprint-inverse-worker-controller.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export type CurrentFootprintInverseActorStage = "before" | "arm" | "after";
function id(value: number): void { if (!Number.isSafeInteger(value) || value < 1) { throw new Error("FOOTPRINT_INVERSE_WIRE_ID"); } }
export function currentFootprintInverseActorWire(value: number, stage: CurrentFootprintInverseActorStage): Readonly<{ id: number; method: "Target.getTargets"; inverseActors: CurrentFootprintInverseActorStage }> | Readonly<{ id: number; method: "Target.setAutoAttach"; params: typeof CURRENT_PCB_VIA_SAVED_READBACK_ACTOR_PARAMS; inverseActors: CurrentFootprintInverseActorStage }> {
  id(value); if (value !== ["before", "arm", "after"].indexOf(stage) + 1) { throw new Error("FOOTPRINT_INVERSE_ACTOR_ORDER"); }
  return freezeDeep(stage === "arm" ? { id: value, method: "Target.setAutoAttach" as const, params: CURRENT_PCB_VIA_SAVED_READBACK_ACTOR_PARAMS, inverseActors: stage } :
    { id: value, method: "Target.getTargets" as const, inverseActors: stage });
}
export function currentFootprintInverseParentWire(value: number, sessionId: string): Readonly<{ id: number; method: "Target.setAutoAttach"; params: typeof CURRENT_PCB_VIA_SAVED_READBACK_PARENT_PARAMS; sessionId: string; inverseParent: true }> {
  id(value); return freezeDeep({ id: value, method: "Target.setAutoAttach" as const, params: CURRENT_PCB_VIA_SAVED_READBACK_PARENT_PARAMS, sessionId, inverseParent: true as const });
}
export function currentFootprintInverseWorkerWire(input: unknown, value: number, pair: CurrentFootprintInverseWorkerPair): CurrentPcbViaSavedLoadBootstrapCommand & Readonly<{ id: number; sessionId: string; inverseWorker: true }> {
  id(value); const command = validateCurrentPcbViaSavedLoadBootstrapCommand(input);
  return freezeDeep({ ...command, id: value, sessionId: command.phase === "saved-load-run-browser" ? pair.browserSessionId : pair.pageSessionId, inverseWorker: true as const });
}
function actual(chunk: Buffer): Record<string, unknown> {
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { throw new Error("FOOTPRINT_INVERSE_WORKER_FRAME"); }
  const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1)));
  const value = captureCurrentPcbStringClockReply(raw).value;
  if (value === null || typeof value !== "object" || Array.isArray(value)) { throw new Error("FOOTPRINT_INVERSE_WORKER_FRAME"); } return { ...value };
}
function same(chunk: Buffer, value: Record<string, unknown>, expected: unknown): number {
  if (typeof value["id"] !== "number" || canonicalJson(value) !== canonicalJson(expected) || chunk.toString("utf8") !== `${JSON.stringify(expected)}\0`) { throw new Error("FOOTPRINT_INVERSE_WORKER_FRAME"); }
  id(value["id"]); return value["id"];
}
export function currentFootprintInverseActorNativeFrame(chunk: Buffer, stage: CurrentFootprintInverseActorStage): Readonly<{ action: "footprint-inverse-actors"; requestId: number; actorStage: CurrentFootprintInverseActorStage }> {
  const value = actual(chunk); const requestId = same(chunk, value, currentFootprintInverseActorWire(Number(value["id"]), stage));
  return freezeDeep({ action: "footprint-inverse-actors", requestId, actorStage: stage });
}
export function currentFootprintInverseParentNativeFrame(chunk: Buffer, sessionId: string): Readonly<{ action: "footprint-inverse-parent"; requestId: number; sessionId: string }> {
  const value = actual(chunk); const requestId = same(chunk, value, currentFootprintInverseParentWire(Number(value["id"]), sessionId));
  return freezeDeep({ action: "footprint-inverse-parent", requestId, sessionId });
}
export function currentFootprintInverseWorkerNativeFrame(chunk: Buffer, input: CurrentPcbViaSavedLoadBootstrapCommand, pair: CurrentFootprintInverseWorkerPair): Readonly<{ action: "footprint-inverse-worker"; requestId: number; phase: string; method: string; scriptId?: string }> {
  const command = validateCurrentPcbViaSavedLoadBootstrapCommand(input), value = actual(chunk);
  const requestId = same(chunk, value, currentFootprintInverseWorkerWire(command, Number(value["id"]), pair));
  return freezeDeep({ action: "footprint-inverse-worker", requestId, phase: `${command.phase}${"role" in command ? `-${command.role}` : ""}`, method: command.method,
    ...(command.method === "Debugger.getScriptSource" ? { scriptId: command.params.scriptId } : {}) });
}
