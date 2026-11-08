/** Fresh publication-only native metadata profiles. These checks confer no
 * inverse receipt, native owner, sender or publication authority. */
import { z } from "zod";
import { decodeCurrentNativeFunctionMetadata } from "./current-native-function-metadata.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { CurrentSchematicRelevanceUiPublicationRemote as Remote } from "./current-schematic-relevance-ui-publication-replies.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentSchematicRelevanceUiPublicationMetadata } from "./current-schematic-relevance-ui-publication-metadata.ts";

const remote = z.strictObject({ type: z.enum(["object", "function", "undefined", "string", "number", "boolean", "symbol", "bigint"]), subtype: z.string().max(128).optional(), className: z.string().max(256).optional(), description: z.string().max(131_072).optional(), objectId: z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u).optional(), value: z.unknown().optional(), unserializableValue: z.string().max(128).optional() });
const field = z.strictObject({ name: z.string().max(256), value: remote.optional(), get: remote.optional(), set: remote.optional(), writable: z.boolean().optional(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true), symbol: remote.optional() });
const internalField = z.strictObject({ name: z.string().max(128), value: remote });
const packet = z.strictObject({ result: z.array(field).max(2048), internalProperties: z.array(internalField).max(8).optional() });
/** Unknown bound callbacks are data here and are never invoked or source
 * admitted. Preserve their complete metadata; reject Proxy envelopes before
 * any reflection on the actual original object or its prototype. */
export function currentSchematicRelevancePublicationNativeProperties(input: unknown): z.infer<typeof packet> {
  const value = packet.parse(captureCurrentSchematicRelevanceUiPublicationMetadata(input)); const internal = value.internalProperties ?? [];
  if (new Set(value.result.map(row => row.name)).size !== value.result.length || new Set(internal.map(row => row.name)).size !== internal.length || internal.some(row => ["[[Target]]", "[[Handler]]", "[[IsRevoked]]"].includes(row.name) || row.value.subtype === "proxy") || value.result.some(row => [row.value, row.get, row.set, row.symbol].some(item => item?.subtype === "proxy"))) { throw new Error("SCH_PUBLICATION_NATIVE_PROPERTIES"); }
  return value;
}
/** A selected non-callable record must expose all its state as descriptors.
 * Internal-slot collections require another complete reader and refuse here. */
export function currentSchematicRelevancePublicationNativeRecord(input: unknown, value: Remote): void {
  const metadata = currentSchematicRelevancePublicationNativeProperties(input);
  if (value.type !== "function" && (value.type !== "object" || value.subtype !== undefined && value.subtype !== "array" || metadata.internalProperties?.some(row => row.name !== "[[Prototype]]") === true)) { throw new Error("SCH_PUBLICATION_NATIVE_RECORD"); }
}

export const CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_NATIVE_PROFILES = freezeDeep([
  { name: "BroadcastChannel", arity: 1, constructor: true, parentDescription: "function EventTarget() { [native code] }" },
  { name: "EventTarget", arity: 0, constructor: true },
  { name: "get name", arity: 0, constructor: false }, { name: "postMessage", arity: 1, constructor: false },
  { name: "get onmessage", arity: 0, constructor: false }, { name: "set onmessage", arity: 1, constructor: false },
  { name: "resolve", arity: 1, constructor: false }, { name: "then", arity: 2, constructor: false }, { name: "debug", arity: 0, constructor: false },
] as const);
export function qualifyCurrentSchematicRelevancePublicationNativeFunction(input: unknown, actual: Remote | undefined, index: number): void {
  const expected = Number.isSafeInteger(index) && !Object.is(index, -0) ? CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_NATIVE_PROFILES[index] : undefined;
  if (expected === undefined || actual?.type !== "function" || actual.className !== "Function" || actual.subtype !== undefined || actual.value !== undefined || actual.objectId === undefined || actual.description !== `function ${expected.name}() { [native code] }`) { throw new Error("SCH_PUBLICATION_NATIVE_FUNCTION"); }
  decodeCurrentNativeFunctionMetadata(input, expected);
}
export function currentSchematicRelevancePublicationNativeOrigin(input: unknown): void {
  z.strictObject({ result: z.strictObject({ type: z.literal("string"), value: z.literal("https://client") }) }).parse(captureCurrentPcbStringClockReply(input).value);
}
