/** Fixed private encoder read commands and their scalar native selectors. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { CurrentSchematicWireEncoderBeforeGraphCommand } from "./current-schematic-wire-encoder-before-graph.ts";
import { currentSchematicWireEncoderNativeRequest } from "./current-schematic-wire-encoder-native.ts";
import { CURRENT_SCHEMATIC_WIRE_ENCODER_BEFORE_GRAPH_PROGRAM as PROGRAM } from "./current-schematic-wire-encoder-programs.ts";
import { validateCurrentSchematicWireEncoderCommand } from "./current-schematic-wire-encoder-protocol.ts";
import { currentSchematicWireEncoderScriptId as handle } from "./current-schematic-wire-encoder-source.ts";
import { CURRENT_SCHEMATIC_WIRE_WRITER_FLAGS as FLAGS } from "./current-schematic-wire-writer-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const ref = z.strictObject({ objectId: handle });
const graph = z.strictObject({
  phase: z.literal("wire-encoder-before-graph"),
  method: z.literal("Runtime.callFunctionOn"),
  params: z.strictObject({
    objectId: handle, functionDeclaration: z.literal(PROGRAM),
    arguments: z.tuple([ref]),
    objectGroup: z.literal(FLAGS.objectGroup), silent: z.literal(true),
    generatePreview: z.literal(false), throwOnSideEffect: z.literal(true),
    returnByValue: z.literal(false), awaitPromise: z.literal(false), userGesture: z.literal(false),
  }),
});
const properties = z.strictObject({
  phase: z.literal("wire-encoder-before-graph-properties"),
  method: z.literal("Runtime.getProperties"),
  params: z.strictObject({
    objectId: handle, ownProperties: z.literal(true),
    accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false),
  }),
});
const helper = z.strictObject({
  phase: z.literal("wire-encoder-helper-source"),
  method: z.literal("Debugger.getScriptSource"),
  params: z.strictObject({ scriptId: handle }),
});
const preliminary = z.discriminatedUnion("phase", [graph, properties, helper]);
export type CurrentSchematicWireEncoderDispatchCommand = CurrentSchematicWireEncoderBeforeGraphCommand |
  Readonly<z.infer<typeof helper>>;
type NativeFields = Readonly<Record<string, string | number>>;
export type CurrentSchematicWireEncoderDispatchWire = Readonly<CurrentSchematicWireEncoderDispatchCommand &
  { id: number; sessionId: string; schematicWireV5Encoder: true }>;

function requirePhase(input: unknown): CurrentSchematicWireEncoderDispatchCommand {
  const data = captureCurrentPcbStringClockReply(input).value;
  const phase = z.looseObject({ phase: z.string() }).parse(data).phase;
  if (phase === "wire-encoder-before-graph" || phase === "wire-encoder-before-graph-properties" || phase === "wire-encoder-helper-source") {
    const fixed = preliminary.parse(data);
    if (fixed.phase === "wire-encoder-before-graph") {
      return freezeDeep({ ...fixed, params: { ...fixed.params, arguments: [fixed.params.arguments[0]] as const } });
    }
    return freezeDeep(fixed);
  }
  const fixed = validateCurrentSchematicWireEncoderCommand(data);
  if (fixed.phase !== "wire-encoder-source" && fixed.phase !== "wire-encoder-metadata" &&
      !(fixed.phase === "wire-encoder-compare" && fixed.role === "membership")) {
    throw new Error("WIRE_ENCODER_DISPATCH_PHASE");
  }
  return fixed;
}
export interface CurrentSchematicWireEncoderFixedDispatch {
  readonly wire: CurrentSchematicWireEncoderDispatchWire;
  readonly native: NativeFields;
}
export function currentSchematicWireEncoderFixedDispatch(input: unknown, id: number, sessionId: string): CurrentSchematicWireEncoderFixedDispatch {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647) { throw new Error("WIRE_ENCODER_DISPATCH_ID"); }
  handle.parse(sessionId);
  const command = requirePhase(input);
  const { phase, method } = command;
  let fields: Readonly<Record<string, string>>;
  if (phase === "wire-encoder-before-graph") {
    fields = { objectId: command.params.objectId, arg0ObjectId: command.params.arguments[0].objectId };
  } else if (phase === "wire-encoder-before-graph-properties") {
    fields = { objectId: command.params.objectId };
  } else if (phase === "wire-encoder-helper-source") {
    fields = { scriptId: command.params.scriptId };
  } else {
    fields = currentSchematicWireEncoderNativeRequest(command).fields;
  }
  const wire = freezeDeep({ id, ...command, schematicWireV5Encoder: true as const, sessionId });
  return Object.freeze({
    wire, native: Object.freeze({ action: "schematic-wire-v5-encoder", requestId: id, phase, method, ...fields }),
  });
}
