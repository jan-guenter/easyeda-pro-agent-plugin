/** Exact V8 Promise metadata, without invoking then or awaitPromise. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.strictObject({ type: z.enum(["object", "function", "undefined", "string", "number", "boolean", "symbol", "bigint"]), subtype: z.string().optional(), className: z.string().optional(), description: z.string().max(16_384).optional(), objectId: handle.optional(), value: z.unknown().optional() });
const asyncSymbol = z.enum(["Symbol(async_id_symbol)", "Symbol(trigger_async_id_symbol)"]);
const asyncProperty = z.strictObject({ name: asyncSymbol, value: z.strictObject({ type: z.literal("number"), value: z.number().int().nonnegative(), description: z.string().optional() }), writable: z.literal(true), configurable: z.literal(true), enumerable: z.literal(true), isOwn: z.literal(true), symbol: z.strictObject({ type: z.literal("symbol"), description: asyncSymbol, objectId: handle }) });
const internal = z.strictObject({ name: z.string(), value: remote });
const reply = z.strictObject({ result: z.array(asyncProperty).max(2), internalProperties: z.array(internal).length(3) });
/** Native async hooks can add their two exact symbol descriptors. Every other
 * own property, rejected promise, malformed state and non-undefined result fails. */
export function decodeCurrentSchematicWireAsyncPromise(input: unknown): "pending" | "fulfilled" {
  const value = reply.parse(capture(input).value);
  if (value.result.length > 0 && (value.result.length !== 2 || new Set(value.result.map(row => row.name)).size !== 2)) { throw new Error("SCHEMATIC_WIRE_ASYNC_PROMISE"); }
  for (const row of value.result) { if (row.symbol.description !== row.name || Object.is(row.value.value, -0)) { throw new Error("SCHEMATIC_WIRE_ASYNC_PROMISE"); } }
  const entries = new Map(value.internalProperties.map(row => [row.name, row.value])); const parent = entries.get("[[Prototype]]"); const state = entries.get("[[PromiseState]]"); const result = entries.get("[[PromiseResult]]");
  if (entries.size !== 3 || parent?.type !== "object" || parent.className !== "Promise" || parent.subtype !== undefined || parent.objectId === undefined || parent.value !== undefined || state?.type !== "string" || (state.value !== "pending" && state.value !== "fulfilled") || state.objectId !== undefined || state.subtype !== undefined || result?.type !== "undefined" || result.objectId !== undefined || result.value !== undefined || result.subtype !== undefined) { throw new Error("SCHEMATIC_WIRE_ASYNC_PROMISE"); }
  return state.value;
}
