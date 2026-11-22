/** Own v4 canonical packet grammar. Legacy parser shapes/limits stay fixed;
 * only reviewed shared readonly codecs are reused as inert encoding data. */
import { z } from "zod";
import { diagnosticRecord } from "./current-pcb-diagnostic-protocol.ts";
import { validateCurrentSchematicWireWriterV4NativeCommand } from "./current-schematic-wire-writer-v4-native-command.ts";
import { CURRENT_SCHEMATIC_WIRE_WRITER_V4_NATIVE_PROFILE as PROFILE } from "./current-schematic-wire-writer-v4-native-profile.ts";
import { currentSchematicWireWriterV4SharedNativeRequest } from "./current-schematic-display-write-protocol.ts";
import { currentSchematicWireAccessorWire } from "./current-schematic-wire-accessor-protocol.ts";
import { currentSchematicWireLexicalWire } from "./current-schematic-wire-lexical-protocol.ts";
import { currentSchematicWireIntentWire } from "./current-schematic-wire-intent-protocol.ts";
import { currentSchematicWireDependencyWire } from "./current-schematic-wire-dependencies-protocol.ts";
import { currentSchematicWireWriterV4RunGuardWire } from "./current-schematic-wire-writer-v4-run-guard.ts";

const readers = Object.freeze([
  ["schematicWireWriterV4AccessorCommand", currentSchematicWireAccessorWire, "schematic-wire-writer-v4-accessor"],
  ["schematicWireWriterV4LexicalCommand", currentSchematicWireLexicalWire, "schematic-wire-writer-v4-lexical"],
  ["schematicWireWriterV4IntentCommand", currentSchematicWireIntentWire, "schematic-wire-writer-v4-intent"],
  ["schematicWireWriterV4DependencyCommand", currentSchematicWireDependencyWire, "schematic-wire-writer-v4-dependencies"],
] as const);
export function currentSchematicWireWriterV4NativeRequest(chunk: Buffer): Readonly<Record<string, unknown>> {
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { throw new Error("SCHEMATIC_WIRE_WRITER_V4_WIRE"); }
  const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1)));
  if (!diagnosticRecord(raw) || typeof raw["id"] !== "number" || !Number.isSafeInteger(raw["id"]) || raw["id"] < 1 || raw["id"] > PROFILE.renderer.total ||
    !chunk.equals(Buffer.from(`${JSON.stringify(raw)}\0`))) { throw new Error("SCHEMATIC_WIRE_WRITER_V4_WIRE"); }
  if (Object.keys(raw).some(key => /^(?:schematicRelevance|schematicWire(?:Accessor|Lexical|Intent|Dependency|Edit)|schematicDisplayPhase|schematicAction|schematicAccessor|schematicClock)/u.test(key))) { throw new Error("SCHEMATIC_WIRE_WRITER_V4_FOREIGN_ORIGIN"); }
  for (const [marker, encode, action] of readers) {
    if (Object.hasOwn(raw, marker)) {
      const { id, sessionId, ...remaining } = raw;
      if (remaining[marker] !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_WIRE_WRITER_V4_READER_SESSION"); }
      const input = Object.fromEntries(Object.entries(remaining).filter(([key]) => key !== marker)); const fixed = encode(input, id);
      if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, [marker]: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_WIRE_WRITER_V4_READER_WIRE"); }
      return Object.freeze({ ...fixed.request, action });
    }
  }
  if (Object.hasOwn(raw, "schematicWireWriterV4RunGuardCommand")) {
    const { id, sessionId, schematicWireWriterV4RunGuardCommand, ...input } = raw;
    if (schematicWireWriterV4RunGuardCommand !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("WIRE_V4_RUN_GUARD_SESSION"); }
    const fixed = currentSchematicWireWriterV4RunGuardWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicWireWriterV4RunGuardCommand: true, sessionId })}\0`))) { throw new Error("WIRE_V4_RUN_GUARD_WIRE"); }
    return fixed.request;
  }
  if (!Object.hasOwn(raw, "schematicWireWriterV4Phase")) { return currentSchematicWireWriterV4SharedNativeRequest(chunk); }
  const { id, sessionId, ...input } = raw, command = validateCurrentSchematicWireWriterV4NativeCommand(input);
  if (typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_WIRE_WRITER_V4_SESSION"); }
  const phase = command.schematicWireWriterV4Phase;
  return Object.freeze({ action: "schematic-wire-writer-v4-native", requestId: id, sessionId, phase,
    ...("uniqueContextId" in command.params ? { uniqueContextId: command.params.uniqueContextId } : { objectId: command.params.objectId }),
    ...(phase === "start" ? {} : { targetJson: command.params.arguments[0].value }), ...(phase === "start" || phase === "navigate" ? {} : { operationJson: command.params.arguments[2].value }) });
}

const capture = z.strictObject({ result: z.strictObject({ type: z.literal("object"), subtype: z.literal("array"),
  className: z.literal("Array"), description: z.literal("Array(2)"), objectId: z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u) }) });
/** Exact returned holder shape. Only Core can bind it to the original owner. */
export function decodeCurrentSchematicWireWriterV4Capture(value: unknown): string { return capture.parse(value).result.objectId; }
