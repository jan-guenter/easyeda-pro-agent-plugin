/** Exact inert parsers for the observed Chrome146 CacheStorage native rosters.
 * Conforming JSON is data only. It cannot issue a native qualification, retained
 * receiver, replay token or permission to invoke any function.
 */
import { z } from "zod";
import { CURRENT_FOOTPRINT_SAVED_CACHE_HELD_DESCRIPTORS as DESCRIPTORS,
  CURRENT_FOOTPRINT_SAVED_CACHE_HELD_ENGINE as ENGINE } from "./current-footprint-saved-cache-held-profile.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const currentFootprintSavedCacheHeldHandleSchema = z.string().regex(/^[A-Za-z\d_.:-]{1,256}(?![\s\S])/u);
const handle = currentFootprintSavedCacheHeldHandleSchema;
const descriptorBaseline = JSON.stringify(DESCRIPTORS);
const engineSchema = z.object({ protocolVersion: z.literal(ENGINE.protocolVersion), product: z.literal(ENGINE.product),
  revision: z.literal(ENGINE.revision), userAgent: z.literal(ENGINE.userAgent), jsVersion: z.literal(ENGINE.jsVersion) }).strict();
const functionParent = z.object({ type: z.literal("function"), className: z.literal("Function"),
  description: z.literal("function () { [native code] }"), objectId: handle }).strict();
const emptyScopes = z.object({ type: z.literal("object"), subtype: z.literal("internal#scopeList"), className: z.literal("Array"),
  description: z.literal("Scopes[0]"), objectId: handle }).strict();
const cachePrototype = z.object({ type: z.literal("object"), className: z.literal("CacheStorage"),
  description: z.literal("CacheStorage"), objectId: handle }).strict();
const arrayPrototype = z.object({ type: z.literal("object"), subtype: z.literal("array"), className: z.literal("Array"),
  description: z.literal("Array(0)"), objectId: handle }).strict();
const envelope = z.object({ result: z.array(z.unknown()).max(6), internalProperties: z.array(z.unknown()).max(2) }).strict();
type Envelope = z.infer<typeof envelope>;

/** Require complete unique named fields before applying a role-specific schema.
 * The input is already inert and bounded; no property getter or received function
 * is invoked, and CDP object IDs are never used as cross-reply identity proof.
 */
function named(values: readonly unknown[], expected: readonly string[]): ReadonlyMap<string, unknown> {
  if (values.length !== expected.length) { throw new Error("SAVED_CACHE_HELD_ROSTER"); }
  const result = new Map<string, unknown>();
  for (const value of values) {
    const name = z.looseObject({ name: z.string().max(128) }).parse(value).name;
    if (!expected.includes(name) || result.has(name)) { throw new Error("SAVED_CACHE_HELD_ROSTER"); }
    result.set(name, value);
  }
  return result;
}

/** Validate a complete data-property descriptor and return its schema-checked
 * remote value. Attribute changes, accessors and extra fields refuse.
 */
function property<T extends z.ZodType>(input: unknown, name: string, value: T,
  flags: Readonly<{ writable: boolean; enumerable: boolean; configurable: boolean }>): z.infer<T> {
  const descriptor = z.object({ name: z.literal(name), value: z.unknown(), isOwn: z.literal(true), writable: z.literal(flags.writable),
    enumerable: z.literal(flags.enumerable), configurable: z.literal(flags.configurable) }).strict().parse(input);
  return value.parse(descriptor.value);
}

/** Validate one internal remote descriptor with its full observed field roster. */
function internal(input: unknown, name: string, value: z.ZodType): void {
  z.object({ name: z.literal(name), value }).strict().parse(input);
}

/** Exact native-function remote descriptor used only by inert tuple parsing. */
function native(description: string): z.ZodObject<{
  type: z.ZodLiteral<"function">; className: z.ZodLiteral<"Function">; description: z.ZodLiteral<string>; objectId: typeof handle;
}> {
  return z.object({ type: z.literal("function"), className: z.literal("Function"), description: z.literal(description), objectId: handle }).strict();
}

/** Match one exact engine tuple. A supplied or historical match grants no owner
 * or invocation authority; the runner still requires its original transport.
 */
export function validateCurrentFootprintSavedCacheHeldEngine(input: unknown): Readonly<typeof ENGINE> {
  return freezeDeep(engineSchema.parse(captureCurrentPcbStringClockReply(input).value));
}

/** Parse the fresh five-slot tuple metadata and require four distinct initial
 * handles for its distinct roles. Do not compare a function's repeated prototype
 * handle with the tuple's handle: Chromium can allocate different IDs for the
 * same JavaScript object across replies.
 */
export function decodeCurrentFootprintSavedCacheHeldTuple(input: unknown): Readonly<{
  constructor: string; prototype: string; match: string; getter: string;
}> {
  const reply = envelope.parse(captureCurrentPcbStringClockReply(input).value);
  const fields = named(reply.result, ["0", "1", "2", "3", "4", "length"]);
  const ordinary = { writable: true, enumerable: true, configurable: true };
  const constructor = property(fields.get("0"), "0", native("function CacheStorage() { [native code] }"), ordinary).objectId;
  const prototype = property(fields.get("1"), "1", cachePrototype, ordinary).objectId;
  const match = property(fields.get("2"), "2", native("function match() { [native code] }"), ordinary).objectId;
  const getter = property(fields.get("3"), "3", native("function get caches() { [native code] }"), ordinary).objectId;
  if (new Set([constructor, prototype, match, getter]).size !== 4) { throw new Error("SAVED_CACHE_HELD_TUPLE_HANDLES"); }
  property(fields.get("4"), "4", z.object({ type: z.literal("string"), value: z.literal(descriptorBaseline) }).strict(), ordinary);
  property(fields.get("length"), "length", z.object({ type: z.literal("number"), value: z.literal(5), description: z.literal("5") }).strict(),
    { writable: true, enumerable: false, configurable: false });
  const internals = named(reply.internalProperties, ["[[Prototype]]"]);
  internal(internals.get("[[Prototype]]"), "[[Prototype]]", arrayPrototype);
  return Object.freeze({ constructor, prototype, match, getter });
}

/** Require the exact complete native-function roster observed in Chrome146.
 * This pure parser accepts no qualification flag and returns no token. Actual
 * function identity remains a same-realm comparison made by the held programs.
 */
export function validateCurrentFootprintSavedCacheHeldFunction(input: unknown, role: "constructor" | "match" | "getter"): void {
  const reply: Envelope = envelope.parse(captureCurrentPcbStringClockReply(input).value);
  const fields = named(reply.result, role === "constructor" ? ["length", "name", "prototype"] : ["length", "name"]);
  const arity = role === "match" ? 1 : 0;
  const name = { constructor: "CacheStorage", match: "match", getter: "get caches" }[role];
  const arityDescription = String(arity);
  const flags = { writable: false, enumerable: false, configurable: true };
  property(fields.get("name"), "name", z.object({ type: z.literal("string"), value: z.literal(name) }).strict(), flags);
  property(fields.get("length"), "length", z.object({ type: z.literal("number"), value: z.literal(arity), description: z.literal(arityDescription) }).strict(), flags);
  if (role === "constructor") { property(fields.get("prototype"), "prototype", cachePrototype, DESCRIPTORS.constructorPrototype); }
  const internals = named(reply.internalProperties, ["[[Prototype]]", "[[Scopes]]"]);
  internal(internals.get("[[Prototype]]"), "[[Prototype]]", functionParent);
  internal(internals.get("[[Scopes]]"), "[[Scopes]]", emptyScopes);
}
