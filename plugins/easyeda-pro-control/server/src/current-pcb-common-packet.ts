/** Strict packet decoding is data validation, never native ownership authority. */
import { types } from "node:util";
import { z } from "zod";
import { CURRENT_PCB_COMMON_GRAPH_CLASSES, decodeCurrentPcbCommonGraph } from "./current-pcb-common-graph.ts";

const index = z.number().int().min(0).max(4095).refine(value => !Object.is(value, -0));
const string = z.string().max(4096).refine(value => value.isWellFormed());
const scalar = z.union([z.tuple([z.literal("null")]), z.tuple([z.literal("undefined")]),
  z.tuple([z.literal("boolean"), z.boolean()]), z.tuple([z.literal("string"), string]),
  z.tuple([z.literal("number"), z.string().max(32).refine(value => value === "-0" ||
    Number.isFinite(Number(value)) && String(Number(value)) === value)]), z.tuple([z.literal("ref"), index])]);
const event = z.union([
  z.tuple([z.literal("node"), index, z.enum(["object", "array", "map", "set"]),
    z.enum(["plain", "null", ...CURRENT_PCB_COMMON_GRAPH_CLASSES]).nullable(), z.number().int().min(0).max(4096), z.boolean().nullable()]),
  z.tuple([z.literal("field"), index, string, scalar, z.boolean()]), z.tuple([z.literal("item"), index, scalar]),
  z.tuple([z.literal("entry"), index, scalar, scalar]), z.tuple([z.literal("member"), index, scalar]),
  z.tuple([z.literal("end"), index]),
]);
const schema = z.object({ schema: z.literal("easyeda-pro-control.pcb-common-chunk.v1"),
  sequence: z.number().int().min(0).max(511), phase: z.enum(["capture", "verify", "complete"]),
  sourceSchema: z.enum(["easyeda-pro-control.pcb-common-presentation.v2", "easyeda-pro-control.pcb-common-rules.v2",
    "easyeda-pro-control.pcb-common-preference.v2"]), documentUuid: z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u),
  nodes: z.number().int().min(0).max(4096), fields: z.number().int().min(0).max(32_768),
  stringUnits: z.number().int().min(0).max(131_072), records: z.number().int().min(0).max(73_728),
  roots: z.array(z.tuple([string, scalar])).min(1).max(64).nullable(),
  events: z.array(event).max(512),
}).strict();
export type CurrentPcbCommonPacketChunk = Readonly<z.infer<typeof schema>>;
export function decodeCurrentPcbCommonPacketChunk(input: unknown): CurrentPcbCommonPacketChunk {
  return decodeCurrentPcbCommonGraph(input, schema);
}

function record(input: unknown, keys: readonly string[]): Record<string, unknown> {
  if (input === null || typeof input !== "object" || types.isProxy(input) || Array.isArray(input) ||
      Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null) { throw new Error("PCB_COMMON_PACKET_HANDLE"); }
  const actual = Reflect.ownKeys(input);
  if (actual.length !== keys.length || actual.some(key => typeof key !== "string" || !keys.includes(key))) { throw new Error("PCB_COMMON_PACKET_HANDLE"); }
  return Object.fromEntries(keys.map(key => {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { throw new Error("PCB_COMMON_PACKET_HANDLE"); }
    return [key, descriptor.value as unknown];
  }));
}
export function decodeCurrentPcbCommonPacketHandle(input: unknown): string {
  const result = record(record(input, ["result"])["result"], ["type", "className", "description", "objectId"]);
  if (result["type"] !== "object" || result["className"] !== "Object" || result["description"] !== "Object" ||
      typeof result["objectId"] !== "string" || !/^[A-Za-z\d_.:-]{1,256}$/u.test(result["objectId"])) { throw new Error("PCB_COMMON_PACKET_HANDLE"); }
  return result["objectId"];
}
