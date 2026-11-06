/** Fixed discovery only. There is no schematic editor, Save, worker, caller
 * JavaScript or borrowed PCB primitive vocabulary in this initial graph. */
import { diagnosticNativeRequest, diagnosticRecord } from "./current-pcb-diagnostic-protocol.ts";
import { CURRENT_SCHEMATIC_DISPLAY_DISCOVERY_METHODS as METHODS, CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PROFILE as PROFILE } from "./current-schematic-display-write-native-profile.ts";

export function currentSchematicDisplayWriteNativeRequest(chunk: Buffer): Readonly<Record<string, unknown>> {
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { throw new Error("SCHEMATIC_DISPLAY_WIRE"); }
  const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1)));
  if (!diagnosticRecord(raw) || typeof raw["id"] !== "number" || !Number.isSafeInteger(raw["id"]) || raw["id"] < 1 || raw["id"] > PROFILE.renderer.total ||
    typeof raw["method"] !== "string" || !METHODS.includes(raw["method"]) || !chunk.equals(Buffer.from(`${JSON.stringify(raw)}\0`))) { throw new Error("SCHEMATIC_DISPLAY_WIRE"); }
  const fixed = diagnosticNativeRequest(Buffer.from(`${JSON.stringify({ ...raw, id: 1 })}\0`));
  return Object.freeze({ ...fixed, requestId: raw["id"] });
}
