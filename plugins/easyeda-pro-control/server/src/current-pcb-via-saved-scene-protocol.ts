/** Inert whole-scene grammar for the distinct saved reader. The old spatial
 * 384-ID birth and all writer origins keep their original limits and custody. */
import { canonicalJson } from "./core.ts";
import type { CurrentPcbSpatialCaptureCommand } from "./current-pcb-spatial-capture-runner.ts";
import { currentPcbSpatialWire, validateCurrentPcbSpatialCommand } from "./current-pcb-spatial-protocol.ts";
import { CURRENT_PCB_SPATIAL_TRACK_REQUEST_DERIVATION as TRACK } from "./current-pcb-spatial-profile.ts";

export const CURRENT_PCB_VIA_SAVED_SCENE_REQUESTS = Object.freeze({ capture: TRACK.capture, functions: TRACK.functions,
  tuple: TRACK.tuple, calleeProperties: TRACK.calleeProperties, reads: 1, release: 1,
  stage: TRACK.capture + TRACK.functions + TRACK.tuple + TRACK.calleeProperties + 1 + 1,
  brackets: 8, total: TRACK.capture + TRACK.functions + TRACK.tuple + TRACK.calleeProperties + 1 + 1 + 8 });
export type CurrentPcbViaSavedSceneCommand = ReturnType<typeof currentPcbViaSavedSceneWire>["command"];
export function currentPcbViaSavedSceneWire(input: CurrentPcbSpatialCaptureCommand, id: number, session: string,
  uniqueContextId: string): Readonly<{ command: ReturnType<typeof currentPcbSpatialWire>["command"] & Readonly<{ savedReadbackScene: true }>; request: Readonly<Record<string, unknown>> }> {
  const fixed = currentPcbSpatialWire(input, 1, session), phase = fixed.command.spatialPhase;
  if (!Number.isSafeInteger(id) || id < 1 || !["wrapper", "properties", "handler", "bindings-track", "functions", "read-track", "release"].includes(phase) ||
    phase === "wrapper" && fixed.command.params.uniqueContextId !== uniqueContextId) { throw new Error("SAVED_SCENE_COMMAND"); }
  if (phase === "read-track" && canonicalJson(fixed.command.params.arguments[0].value) !== canonicalJson({ kind: "region", mode: "inside", leftMil: -10_000_000, rightMil: 10_000_000, bottomMil: -10_000_000, topMil: 10_000_000 })) { throw new Error("SAVED_SCENE_QUERY"); }
  const { sessionId: _sessionId, ...request } = fixed.request;
  return Object.freeze({ command: Object.freeze({ ...fixed.command, id, savedReadbackScene: true }),
    request: Object.freeze({ ...request, action: "saved-readback-scene", requestId: id }) });
}
export function currentPcbViaSavedSceneNativeFrame(chunk: Buffer, session: string, context: string): Readonly<Record<string, unknown>> {
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { throw new Error("SAVED_SCENE_FRAME"); }
  const value: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1)));
  if (value === null || typeof value !== "object" || !("id" in value) || typeof value.id !== "number" || !("savedReadbackScene" in value) || value.savedReadbackScene !== true || !("sessionId" in value) || value.sessionId !== session) { throw new Error("SAVED_SCENE_FRAME"); }
  const { id, savedReadbackScene: _marker, sessionId: _sessionId, ...command } = value;
  // Parsing the actual JSON bytes removes accessors and proxies before the
  // Fixed existing command validator sees any fields.
  const fixed = currentPcbViaSavedSceneWire(validateCurrentPcbSpatialCommand(command), id, session, context);
  if (!chunk.equals(Buffer.from(`${JSON.stringify(fixed.command)}\0`))) { throw new Error("SAVED_SCENE_FRAME"); }
  return fixed.request;
}
